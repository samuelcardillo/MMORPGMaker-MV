//=============================================================================
// MMORPG Maker MV - Overhead
// MMO_Overhead.js
//=============================================================================

//=============================================================================
 /*:
 * @plugindesc Add name over actors name
 * @author Samuel Lespes Cardillo
 *
 * @help
 * Insert one or both of those following comments in the event :
 *
 *   <Name: {insert name}>
 *   The name to display for the event
 *
 *   <Is Quest>
 *   The event name will be displayed in yellow
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

function MMO_Overhead() { 
  this.initialize.apply(this, arguments);
}

document.addEventListener("refresh_player_on_map", function(){
  Game_Interpreter.prototype.refreshEventMiniLabel();
})

Game_Interpreter.prototype.refreshEventMiniLabel = function() {
    if ($gameParty.inBattle()) return;
    var scene = SceneManager._scene;
    if (scene instanceof Scene_Map) {
      scene.refreshAllMiniLabels();
    }
};

MMO_Overhead.Windows = function() {
    this.initialize.apply(this, arguments);
}

MMO_Overhead.Windows.prototype = Object.create(Window_Base.prototype);
MMO_Overhead.Windows.prototype.constructor = MMO_Overhead.Windows;

MMO_Overhead.Windows.prototype.initialize = function() {
    this._bufferX = 0;
    this._bufferY = 36;
    this._fontSize = 14;
    this._alwaysShow = false;
    var width = 136;
    var height = this.windowHeight();
    this._range = 5;
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.opacity = 0;
    this.contentsOpacity = 0;
    this._character = null;
    this._page = 0;
    this._text = '';
    this._initialText = '';
};

MMO_Overhead.Windows.prototype.standardFontSize = function() {
    if (this._fontSize !== undefined) return this._fontSize;
    return 14;
};

MMO_Overhead.Windows.prototype.windowHeight = function() {
    var height = this.fittingHeight(1)
    height = Math.max(height, 36 + this.standardPadding() * 2);
    return height;
};

MMO_Overhead.Windows.prototype.lineHeight = function() {
    return this.standardFontSize() + 8;
};

MMO_Overhead.Windows.prototype.bufferX = function() {
    if (this._bufferX !== undefined) return this._bufferX;
    return 0;
};

MMO_Overhead.Windows.prototype.bufferY = function() {
    if (this._bufferY !== undefined) return this._bufferY;
    return 36;
};

MMO_Overhead.Windows.prototype.setCharacter = function(character) {
    this.setText('');
    this._character = character;
    if (character._eventId) this.gatherDisplayData();
};

MMO_Overhead.Windows.prototype.gatherDisplayData = function() {
    this._page = this._character.page();
    this._pageIndex = this._character._pageIndex;
    this._range = 5;
    this._bufferY = 36;
    this._fontSize = 14;
    this._alwaysShow = false;
    if (!this._character.page()) {
      return this.visible = false;
    }
    var list = this._character.list();
    var max = list.length;
    var comment = '';
    for (var i = 0; i < max; ++i) {
      var ev = list[i];
      if ([108, 408].contains(ev.code)) comment += ev.parameters[0] + '\n';
    }
    this.extractNotedata(comment);
};

MMO_Overhead.Windows.prototype.extractNotedata = function(comment) {
  if (comment === '') return;
  var tag1 = /<(?:NAME):[ ](.*)>/i;
  var tag2 = /<(?:IS QUEST)>/i;
  var notedata = comment.split(/[\r\n]+/);
  var text = '';
  for (var i = 0; i < notedata.length; ++i) {
    var line = notedata[i];
    if (line.match(tag1)) {
      text = String(RegExp.$1);
    } else if (line.match(tag2)) {
      text = "\\C[17]" + text;
    }
  }
  this.setText(text);
  this._initialText = text;
  if (this._text === '') {
    this.visible = false;
    this.contentsOpacity = 0;
  } else {
    this.visible = true;
    this.contentsOpacity = 255;
  }
};

MMO_Overhead.Windows.prototype.setText = function(text) {
    if (this._text === text) return;
    this._text = text;
    this.refresh();
};

MMO_Overhead.Windows.prototype.refresh = function() {
    this.contents.clear();
    var txWidth = this.textWidthEx(this._text);
    txWidth += this.textPadding() * 2;
    var width = txWidth;
    this.width = Math.max(width, 136);
    this.width += this.standardPadding() * 2;
    this.height = this.windowHeight();
    this.createContents();
    var wx = (this.contents.width - txWidth) / 2;
    var wy = 0;
    this.drawTextEx(this._text, wx + this.textPadding(), wy);
};

MMO_Overhead.Windows.prototype.forceRefresh = function() {
    this.refresh();
};

MMO_Overhead.Windows.prototype.textWidthEx = function(text) {
    return this.drawTextEx(text, 0, this.contents.height);
};

MMO_Overhead.Windows.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (!this._character) return;
    if (!this._character._eventId) return;
    this.updatePage();
    if (this._text === '') return;
    this.updateOpacity();
};

MMO_Overhead.Windows.prototype.updatePage = function() {
    if (this._pageIndex === this._character._pageIndex) return;
    this._pageIndex = this._character._pageIndex;
    this.contents.clear();
    this._text = '';
    this.gatherDisplayData();
};

MMO_Overhead.Windows.prototype.updateOpacity = function() {
    if (this.showMiniLabel()) {
      this.show();
    } else {
      this.hide();
    }
};

MMO_Overhead.Windows.prototype.show = function() {
    if (this.contentsOpacity >= 255) return;
    this.contentsOpacity += 16;
};

MMO_Overhead.Windows.prototype.hide = function() {
    if (this.contentsOpacity <= 0) return;
    this.contentsOpacity -= 16;
};

MMO_Overhead.Windows.prototype.showMiniLabel = function() {
    if (this._alwaysShow) return true;
    if (!this.withinRange()) return false;
    return true;
};

MMO_Overhead.Windows.prototype.withinRange = function() {
    if (this._range >= 500) return true;
    var player = $gamePlayer;
    var chara = this._character;
    if (this._range >= Math.abs(player.x - chara.x)) {
      if (this._range >= Math.abs(player.y - chara.y)) {
        return true;
      }
    }
    return false;
};

MMO_Overhead.Sprite_Character = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
  MMO_Overhead.Sprite_Character.call(this);
  this.updateMiniLabel();
};

Sprite_Character.prototype.updateMiniLabel = function() {
    this.setupMiniLabel();
    if (!this._miniLabel) return;
    this.positionMiniLabel();
};

Sprite_Character.prototype.setupMiniLabel = function() {
    if (this._miniLabel) return;
    this._miniLabel = new MMO_Overhead.Windows();
    this._miniLabel.setCharacter(this._character);
    this.parent.parent.addChild(this._miniLabel);
};

Sprite_Character.prototype.positionMiniLabel = function() {
    var win = this._miniLabel;
    win.x = this.x + win.width / -2 + win.bufferX();
    win.y = this.y + (this.height * -1) - win.height + win.bufferY();
};

Sprite_Character.prototype.refreshMiniLabel = function() {
    if (this._miniLabel) this._miniLabel.forceRefresh();
};

Scene_Map.prototype.refreshAllMiniLabels = function() {
    var length = this._spriteset._characterSprites.length;
    for (var i = 0; i < length; ++i) {
      var sp = this._spriteset._characterSprites[i];

      // If there is no minilabel then we do nothing
      if(sp._miniLabel === undefined) return;

      if(sp._character._isBusy && sp._miniLabel._text.length > 0) sp._miniLabel._text = `(${sp._character._isBusy}) ${sp._miniLabel._initialText}`;
      if(!sp._character._isBusy  && sp._miniLabel._text.length > 0) sp._miniLabel._text = `${sp._miniLabel._initialText}`; 

      // If player is in party
      if(MMO_Core_Party.Party.length > 0) { 
        for(var c = 0; c < MMO_Core_Party.Party.length; c++) {
          if(!MMO_Core_Party.Party[c]) continue;
          // If player is in the same party than us then we write his name in blue
          if(MMO_Core_Party.Party[c].username === sp._miniLabel._initialText) sp._miniLabel._text = "\\C[23]" + sp._miniLabel._text;
        }
      }

      sp.refreshMiniLabel();
    }
};