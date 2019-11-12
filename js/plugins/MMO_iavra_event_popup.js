/*:
 * @plugindesc Allows to display popups messages above events, which can be used for speech bubbles or on chests.
 * <Iavra Event Popup>
 * @author Iavra (adaptated for MMORPG Maker MV by Samuel Lespes Cardillo)
 *
 * =============================================================================
 *
 * @param Popup Width
 * @desc Default width for the popup window. Overflowing text will be cut away. Default: 200
 * @default 200
 *
 * @param Offset X
 * @desc By default, popups are centered on event.screenX(). This is the X offset. Default: 0
 * @default 0
 *
 * @param Offset Y
 * @desc By default, popups are centered on event.screenY(). This is the Y offset. Default: 0
 * @default 0
 *
 * @param Display Duration
 * @desc How long the popup will be displayed after fading in and before fading out. Default: 200
 * @default 200
 *
 * @param Fade In Duration
 * @desc How long it takes for the popup to fade in. Default: 10
 * @default 10
 *
 * @param Fade Out Duration
 * @desc How long it takes for the popup to fade out. Default: 60
 * @default 60
 *
 * @param Font Name
 * @desc Name of the font to be used. If left empty, default is used instead. Default: (empty)
 * @default
 *
 * @param Font Size
 * @desc Font size to be used. Default: 12
 * @default 12
 *
 * @param Line Height
 * @desc Line height to be used. Should be a bit higher than font size. Default: 18
 * @default 18
 *
 * @param Retain On Scene
 * @desc When one of these scenes becomes active, popups will be hidden, instead of destroyed. Default: Scene_Menu, Scene_Battle
 * @default Scene_Menu, Scene_Battle
 *
 * =============================================================================
 *
 * @help
 * To create a popup, call the following function in a "Script" event command:
 * 
 * IAVRA.EVENTPOPUP.popup(eventId, text, options);
 * 
 * Where "eventId" is the id of the event you want to show the popup on, "text" is the message you want to show and
 * "options" is an optional object, that can be used to override the default values set via plugin parameters.
 *
 * The following list shows all possible options:
 *
 * width      The width of the popup window. By default, popups will be horizontally centered on the event.
 * x          An offset on the x axis. By default, popups are centered on the event.
 * y          An offset on the y axis. By default, popups are centered on the event.
 * duration   How long the popup should stay visible after it has faded in and before it starts to fade out.
 * fadeIn     How long it takes for the popup to fade in.
 * fadeOut    How long it takes for the popup to fade out.
 * fontName   The font to be used.
 * fontSize   The font size to be used.
 * lineHeight Height of a single text line. This should be slightly higher than fontSize.
 *
 * The "text" parameter can contain any special characters. Beware that icons have a fixed size and might look strange
 * depending on the fontSize. Also remember that you need to double backslashes on certain escape codes. To display the
 * value of variable 10, you would use \\V[10], for example.
 *
 * If you want to remove popups, before they have faded out, you can do so by calling this function:
 *
 * IAVRA.EVENTPOPUP.clear(eventId);
 *
 * This will remove all popups shown for a specific event or all popups if the "eventId" parameter is left out.
 *
 * If you don't want to use script calls, you can use the following plugin commands, instead, but note that it's not
 * possible to specify options for the "popup" command:
 *
 * EventPopup popup eventId text
 * EventPopup clean eventId
 *
 * Inside plugin commands, you can use the keyword "this" (without quotes) to show or clear popups on the current event.
 */

var Imported = Imported || {};
Imported.iavra_event_popup = true;

//=============================================================================
// namespace IAVRA
//=============================================================================

var IAVRA = IAVRA || {};

(function() {
    "use strict";

    //=============================================================================
    // MMO Part
    //=============================================================================

    MMO_Core.socket.on("new_message",function(messageData) {
      if(messageData.senderId === undefined || messageData.senderId === null) return;
      if(MMO_Core_Players["Players"][messageData.senderId] === undefined) return;

      let eventId = MMO_Core_Players["Players"][messageData.senderId]["eventId"]();
      IAVRA.EVENTPOPUP.clear(eventId); // To avoid superposition of messages
      IAVRA.EVENTPOPUP.popup(eventId, messageData.msg, {y: -42}); // We display the popup
    })

    //=============================================================================
    // Native Part
    //=============================================================================
    
    /**
     * Since PluginManager.parameters() breaks when the plugin file is renamed, we are using our own solution.
     */
    var _params = $plugins.filter(function(p) { return p.description.contains('<Iavra Event Popup'); })[0].parameters;
    
    /**
     * Usually, popups are destroyed when a new scene becomes active. Specific scenes can be marked in "Retain On Scene"
     * so popups still won't be displayed, but are still there and will be shown once Scene_Map becomes active again.
     */
    var _paramRetainOnscene = _params['Retain On Scene'].split(/\s*,\s*/).filter(function(scene) {
        return !!scene;
    }).map(function(scene) { return eval(scene); });
    _paramRetainOnscene.push(Scene_Map);
    
    /**
     * Our default options as given in the plugin's parameters. We default to 0, since otherwise it wouldn't be possible
     * to give 0 as a parameter unless we do a more complicated check.
     */
    var _defaultOptions = {
        width: parseInt(_params['Popup Width']) || 0,
        x: parseInt(_params['Offset X']) || 0,
        y: parseInt(_params['Offset Y']) || 0,
        duration: parseInt(_params['Display Duration']) || 0,
        fadeIn: parseInt(_params['Fade In Duration']) || 0,
        fadeOut: parseInt(_params['Fade Out Duration']) || 0,
        fontName: _params['Font Name'] || null, 
        fontSize: parseInt(_params['Font Size']) || 0,
        lineHeight: parseInt(_params['Line Height']) || 0
    };
    
    /**
     * Container for all created popup windows. Using WindowLayer would cause overlapping popups to cut each other and
     * inserting directly in Scene_Map causes all popups to vanish when entering the menu (which i don't want). So we
     * are using Pixi's base class with an added update() function to be compatible with Scene_Base.
     */
    var _container = (function($) {
        $.update = function() {
            this.children.forEach(function(child) { if(child.update) child.update(); });
        };
        return $;
    })(new PIXI.DisplayObjectContainer());
    
    /**
     * Utility function that takes 2 objects and iterates over all keys in the first one. If the second object contains
     * that key, its value is taken, otherwise we take the default. The result is merged to a new object and returned.
     */
    var mergeOptions = function(defaults, options) {
        options || (options = {});
        return Object.keys(defaults).reduce(function(map, key) {
            map[key] = options[key] !== undefined ? options[key] : defaults[key];
            return map;
        }, {});
    };
    
    /**
     * Removes a popup from the container, so the popup doesn't have to reference the container directly.
     */
    var removePopup = function(popup) { _container.removeChild(popup); };
    
    //=============================================================================
    // module IAVRA.EVENTPOPUP
    //=============================================================================
    
    IAVRA.EVENTPOPUP = {
        
        /**
         * Creates a new popup displaying the given text on the given event. An optional object can be used to override
         * some or all of the default options.
         */
        popup: function(eventId, text, options) {
            _container.addChild(new IAVRA.EVENTPOPUP.Window_Popup(eventId, text, options));
        },
        
        /**
         * Clears either all popups (if eventId is undefined) or only those belonging to the given eventId.
         */
        clear: function(eventId) {
            if(eventId === undefined) {
                _container.removeChildren();
            } else {
                _container.children.filter(function(child) {
                    return child._eventId === eventId;
                }).forEach(function(child) {
                    _container.removeChild(child);
                });
            }
        },
        
        /**
         * Callbacks for drawing the popup background as well as fading in and out the popups. I put these in the public
         * scope, so it's easy to override them in other plugins.
         */
        _callbacks: {
            drawBackground: function(popup) {
                var color1 = popup.dimColor1();
                var color2 = popup.dimColor2();
                var width = popup.contentsWidth();
                var height = popup.contentsHeight();
                popup.opacity = 0;
                popup.contents.gradientFillRect(0, 0, width / 2, height, color2, color1);
                popup.contents.gradientFillRect(width / 2, 0, width / 2, height, color1, color2);
            },
            fadeIn: function(popup) {
                return (popup.contentsOpacity += 255 / (popup._options.fadeIn || 1)) >= 255;
            },
            fadeOut: function(popup) {
                return (popup.contentsOpacity -= 255 / (popup._options.fadeOut || 1)) <= 0;
            }
        }
        
    };
    
    //=============================================================================
    // class IAVRA.EVENTPOPUP.Window_Popup
    //=============================================================================
    
    IAVRA.EVENTPOPUP.Window_Popup = function() { this.initialize.apply(this, arguments); };
    (function($) {
        ($.prototype = Object.create(Window_Base.prototype)).constructor = $;
        
        /**
         * Creates a new popup displaying the given text on the given event. An optional object can be used to override
         * some or all of the default options.
         */
        $.prototype.initialize = function(eventId, text, options) {
            this._options = mergeOptions(_defaultOptions, options);
            this._eventId = eventId;
            var height = this.fittingHeight(text.split('\n').length);
            Window_Base.prototype.initialize.call(this, 0, 0, this._options.width, height);
            IAVRA.EVENTPOPUP._callbacks.drawBackground(this);
            this.drawTextEx(text, 0, 0);
            this.contentsOpacity = 0;
        };
        
        /**
         * If the event we are referencing doesn't exist, we remove the popup from our container and return. Otherwise we
         * update our position according to the event's screen position.
         */
        $.prototype.update = function() {
            Window_Base.prototype.update.call(this);
            var event = $gameMap.event(this._eventId);
            if(event === undefined) { removePopup(this); return; }
            this.x = event.screenX() + this._options.x - this.width / 2;
            this.y = event.screenY() + this._options.y - this.height;
            if(!this._finishedFadeIn) {
                this._finishedFadeIn = IAVRA.EVENTPOPUP._callbacks.fadeIn(this);
            } else if(--this._options.duration <= 0 && IAVRA.EVENTPOPUP._callbacks.fadeOut(this)) {
                removePopup(this);
            }
        };
        
        /**
         * Using our own font or fall back to the default, if none was specified.
         */
        $.prototype.standardFontFace = function() {
            return this._options.fontName || Window_Base.prototype.standardFontFace.call(this);
        };
        
        /**
         * Using our own font size.
         */
        $.prototype.standardFontSize = function() { return this._options.fontSize; };
        
        /**
         * Using our own line height.
         */
        $.prototype.lineHeight = function() { return this._options.lineHeight; };
        
        return $;
    })(IAVRA.EVENTPOPUP.Window_Popup);
    
    //=============================================================================
    // class Scene_Base
    //=============================================================================
    
    (function($) {
        
        /**
         * When one of the scenes not listed in "Retain on Scene" becomes active, all popups are destroyed.
         */
        var _alias_terminate = $.prototype.terminate;
        $.prototype.terminate = function() {
            _alias_terminate.apply(this, arguments);
            _paramRetainOnscene.some(function(scene) { return SceneManager.isNextScene(scene); }) || _container.removeChildren();
        };
        
    })(Scene_Base);
    
    //=============================================================================
    // class Scene_Map
    //=============================================================================
    
    (function($) {
        
        /**
         * We add our own container before the windowlayer, so windows are still being displayed on top of popups.
         */
        var _alias_createWindowLayer = $.prototype.createWindowLayer;
        $.prototype.createWindowLayer = function() {
            this.addChild(_container);
            _alias_createWindowLayer.apply(this, arguments);
        };
        
    })(Scene_Map);
    
    //=============================================================================
    // class Game_Interpreter
    //=============================================================================
    
    (function($) {
        
        /**
         * When our plugin command is called, we take the first parameter to determine the actual command and the second
         * parameter to determine the eventId. The special case "this" is used to point to the id of the current event.
         * In case of the "popup" command, we also need to join the remaining arguments to get the complete String and
         * pass it to eval(), so special characters are properly formatted.
         */
        var _alias_pluginCommand = $.prototype.pluginCommand;
        $.prototype.pluginCommand = function(command, args) {
            _alias_pluginCommand.apply(this, arguments);
            if(command === 'EventPopup') {
                var actualCommand = args.shift();
                var eventId = args.shift();
                (eventId !== 'this') || (eventId = this.eventId());
                switch(actualCommand) {
                    case 'popup':
                        IAVRA.EVENTPOPUP.popup(eventId, eval(args.join(' ')));
                        break;
                    case 'clear':
                        IAVRA.EVENTPOPUP.clear(eventId);
                        break;
                };
            }
        };
        
    })(Game_Interpreter);
    
})();