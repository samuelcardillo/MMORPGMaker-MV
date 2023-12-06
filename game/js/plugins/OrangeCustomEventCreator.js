/*=============================================================================
 * Orange - Custom Event Creator
 * By Hudell - www.hudell.com
 * OrangeCustomEventCreator.js
 * Version: 1.2.1
 * Free for commercial and non commercial use.
 *=============================================================================*/
 /*:
 * @plugindesc This plugin Will let you create virtual events with script calls
 *             
 * @author Hudell
 * @help
 * ============================================================================
 * Latest Version
 * ============================================================================
 * 
 * Get the latest version of this script on
 * http://link.hudell.com/custom-event-creator
 * 
 *=============================================================================*/

var Imported = Imported || {};

if (Imported.MVCommons === undefined) {
  var MVC = MVC || {};

  (function($){ 
    $.defaultGetter = function(name) { return function () { return this['_' + name]; }; };
    $.defaultSetter = function(name) { return function (value) { var prop = '_' + name; if ((!this[prop]) || this[prop] !== value) { this[prop] = value; if (this._refresh) { this._refresh(); } } }; };
    $.accessor = function(value, name /* , setter, getter */) { Object.defineProperty(value, name, { get: arguments.length > 3 ? arguments[3] : $.defaultGetter(name), set: arguments.length > 2 ? arguments[2] : $.defaultSetter(name), configurable: true });};
    $.reader = function(obj, name /*, getter */) { Object.defineProperty(obj, name, { get: arguments.length > 2 ? arguments[2] : defaultGetter(name), configurable: true }); };
  })(MVC);
}


if (Imported.OrangeCustomEvents === undefined) {
  console.log('Download OrangeCustomEvents: http://link.hudell.com/custom-events');
  throw new Error("This library needs OrangeCustomEvents to work!");
}

var OrangeCustomEventCreator = OrangeCustomEventCreator || {};

function CustomEventData() {
  this.initialize.apply(this, arguments);
}

function CustomEventData_Page() {
  this.initialize.apply(this, arguments);
}

function CustomEventData_Page_Image() {
  this.initialize.apply(this, arguments);
}

function CustomEventData_Page_Condition() {
  this.initialize.apply(this, arguments);
}

function CustomEventData_Page_MoveRoute() {
  this.initialize.apply(this, arguments);
}

var EventTriggers = {
  ACTION_BUTTON: 0,
  PLAYER_TOUCH: 1,
  EVENT_TOUCH: 2,
  AUTORUN: 3,
  PARALLEL: 4
};

var EventPriorities = {
  UNDER_PLAYER: 0,
  NORMAL: 1,
  OVER_PLAYER: 2
};

(function($) {
  "use strict";

  //----------------------------------------------.
  //----------------------------------------------|
  // CUSTOM CLASSES                               |
  //----------------------------------------------|
  //----------------------------------------------|


  //----------------------------------------------
  // CustomEventData
  //----------------------------------------------
  (function(prot) {
    MVC.accessor(prot, 'pages');
    MVC.accessor(prot, 'id');
    MVC.accessor(prot, 'name');
    MVC.accessor(prot, 'note');
    MVC.accessor(prot, 'x');
    MVC.accessor(prot, 'y');
    MVC.reader(prot, 'page', function() {
      return this.pages[this._pageIndex];
    });

    prot.initialize = function(id) {
      this.id = id;
      this.x = 0;
      this.y = 0;
      this.name = "Custom Event";
      this.pages = [new CustomEventData_Page()];
      this._pageIndex = 0;
    };

    prot.addPage = function(page) {
      this.pages.push(page);
      return this.pages[this.pages.length - 1];
    };

    prot.changePage = function(pageIndex) {
      this._pageIndex = pageIndex;

      while (this.pages.length < pageIndex) {
        this.pages.push(new CustomEventData_Page());
      }
    };

    prot.addCommand = function(command) {
      this.page.addCommand(command);
    };

    prot.endPage = function() {
      this.page.end();
    };

    prot.endAllPages = function() {
      for (var i = 0; i < this.pages.length; i++) {
        this.pages[i].end();
      }
    };

  })(CustomEventData.prototype);

  //----------------------------------------------
  // CustomEventData_Page
  //----------------------------------------------
  (function(prot) {
    MVC.accessor(prot, 'conditions');
    MVC.accessor(prot, 'directionFix');
    MVC.accessor(prot, 'image');
    MVC.accessor(prot, 'list');
    MVC.accessor(prot, 'moveFrequency');
    MVC.accessor(prot, 'moveRoute');
    MVC.accessor(prot, 'moveSpeed');
    MVC.accessor(prot, 'moveType');
    MVC.accessor(prot, 'priorityType');
    MVC.accessor(prot, 'stepAnime');
    MVC.accessor(prot, 'through');
    MVC.accessor(prot, 'trigger');
    MVC.accessor(prot, 'walkAnime');

    prot.initialize = function() {
      this.conditions = new CustomEventData_Page_Condition();
      this.directionFix = false;
      this.image = new CustomEventData_Page_Image();
      this.list = [{
        code: 0,
        indent: 0,
        parameters: []
      }];
      this.moveFrequency = 3;
      this.moveRoute = new CustomEventData_Page_MoveRoute();
      this.moveSpeed = 3;
      this.moveType = 0;
      this.priorityType = 1;
      this.stepAnime = true;
      this.through = false;
      this.trigger = 0;
      this.walkAnime = true;

      this._indent = -1;
    };

    prot.addCommand = function(command) {
      if (command instanceof Array) {
        for (var i = 0; i < command.length; i++) {
          this.addCommand(command[i]);
        }
      } else {
        // When you add a command on the page for the first time, the script will remove the auto-added "end" command. Make sure to add your own or call .end().
        if (this.list.length == 1 && this.list[0].code === 0) {
          this.list = [];
          this._indent = 0;
        }

        command.indent = this._indent;
        this.list.push(command);

        if (command.code === 0) {
          this._indent -= 1;
        }
      }
    };

    prot.increaseIndent = function() {
      this._indent += 1;
    };

    prot.end = function() {
      while (this._indent >= 0) {
        this.addCommand({
          code: 0
        });
      }
    };

    prot.callScriptOrCommonEvent = function(scriptOrCommonEventId) {
      var commandCode = undefined;

      if (scriptOrCommonEventId !== undefined) {
        if (typeof(scriptOrCommonEventId) == "number") {
          commandCode = 117;
        } else if (typeof(scriptOrCommonEventId) == "string") {
          commandCode = 355;
        }
      }

      if (commandCode !== undefined) {
        this.addCommand({
          code: commandCode,
          parameters: [scriptOrCommonEventId]
        });
      }
    };
  })(CustomEventData_Page.prototype);

  //----------------------------------------------
  // CustomEventData_Page_Image
  //----------------------------------------------
  (function(prot) {
    MVC.accessor(prot, 'characterIndex');
    MVC.accessor(prot, 'characterName');
    MVC.accessor(prot, 'direction');
    MVC.accessor(prot, 'pattern');
    MVC.accessor(prot, 'tileId');

    prot.initialize = function() {
      this.characterIndex = 0;
      this.characterName = '';
      this.direction = 2;
      this.pattern = 1;
      this.tileId = 0;
    };
  })(CustomEventData_Page_Image.prototype);

  //----------------------------------------------
  // CustomEventData_Page_Condition
  //----------------------------------------------
  (function(prot) {
    MVC.accessor(prot, 'actorId');
    MVC.accessor(prot, 'actorValid');
    MVC.accessor(prot, 'itemId');
    MVC.accessor(prot, 'itemValid');
    MVC.accessor(prot, 'selfSwitchCh');
    MVC.accessor(prot, 'selfSwitchValid');
    MVC.accessor(prot, 'switch1Id');
    MVC.accessor(prot, 'switch1Valid');
    MVC.accessor(prot, 'switch2Id');
    MVC.accessor(prot, 'switch2Valid');
    MVC.accessor(prot, 'variableId');
    MVC.accessor(prot, 'variableValid');
    MVC.accessor(prot, 'variableValue');

    prot.initialize = function() {
      this.actorId = 1;
      this.actorValid = false;
      this.itemId = 1;
      this.itemValid = false;
      this.selfSwitchCh = 'A';
      this.selfSwitchValid = false;
      this.switch1Id = 1;
      this.switch1Valid = false;
      this.switch2Id = 1;
      this.switch2Valid = false;
      this.variableId = 1;
      this.variableValid = false;
      this.variableValue = 0;
    };

    prot.clearConditions = function() {
      this.actorValid = false;
      this.itemValid = false;
      this.selfSwitchValid = false;
      this.switch1Valid = false;
      this.switch2Valid = false;
      this.variableValid = false;
    };

    prot.addActorCondition = function(actorId) {
      this.actorId = actorId;
      this.actorValid = true;
    };

    prot.addItemCondition = function(itemId) {
      this.itemId = itemId;
      this.itemValid = true;
    };

    prot.addSelfSwitchCondition = function(selfSwitchCh) {
      this.selfSwitchCh = selfSwitchCh;
      this.selfSwitchValid = true;
    };

    prot.addSwitch1Condition = function(switchId) {
      this.switch1Id = switchId;
      this.switch1Valid = true;
    };

    prot.addSwitch2Condition = function(switchId) {
      this.switch2Id = switchId;
      this.switch2Valid = true;
    };

    prot.addVariableCondition = function(variableId, value) {
      this.variableId = variableId;
      this.variableValue = value;
      this.variableValid = true;
    };

  })(CustomEventData_Page_Condition.prototype);

  //----------------------------------------------
  // CustomEventData_MoveRoute
  //----------------------------------------------
  (function(prot) {
    MVC.accessor(prot, 'repeat');
    MVC.accessor(prot, 'skippable');
    MVC.accessor(prot, 'wait');
    MVC.accessor(prot, 'list');

    prot.initialize = function() {
      this.repeat = true;
      this.skippable = false;
      this.wait = false;
      this.list = [{
        code: 0,
        parameters: []
      }];
    };
  })(CustomEventData_Page_MoveRoute.prototype);


  //----------------------------------------------.
  //----------------------------------------------|
  // PRIVATE METHODS                              |
  //----------------------------------------------|
  //----------------------------------------------|

  function createActorAt(actorId, x, y, d, scriptOrCommonEventId, temporary) {
    return this.createNormalEventAt($gameActors.actor(actorId).characterName(), $gameActors.actor(actorId).characterIndex(), x, y, d, scriptOrCommonEventId, temporary);
  }

  function createNormalEventAt(characterName, characterIndex, x, y, d, scriptOrCommonEventId, temporary) {
    var eventData = new CustomEventData();
    eventData.page.image.direction = d;
    eventData.page.image.characterName = characterName;
    eventData.page.image.characterIndex = characterIndex;

    eventData.page.callScriptOrCommonEvent(scriptOrCommonEventId);

    return $gameMap.addEventAt(eventData, x, y, temporary);
  }

  function createTriggerEventAt(x, y, scriptOrCommonEventId, temporary) {
    var eventData = new CustomEventData();
    eventData.page.trigger = EventTriggers.PLAYER_TOUCH;
    eventData.page.priorityType = EventPriorities.UNDER_PLAYER;
    eventData.page.callScriptOrCommonEvent(scriptOrCommonEventId);

    return $gameMap.addEventAt(eventData, x, y, temporary);
  }

  function createTeleportEventAt(x, y, newMapId, newX, newY, newDirection, fadeType, temporary) {
    var eventData = new CustomEventData();
    eventData.page.trigger = EventTriggers.PLAYER_TOUCH;
    eventData.page.priorityType = EventPriorities.UNDER_PLAYER;

    if (newDirection === undefined) {
      newDirection = $gamePlayer.direction();
    }

    if (fadeType === undefined) {
      fadeType = 0;
    }

    eventData.page.addCommand({
      code: 201,
      parameters: [0, newMapId, newX, newY, newDirection, fadeType]
    });

    return $gameMap.addEventAt(eventData, x, y, temporary);
  }

  function createParallelProcess(scriptOrCommonEventId, temporary, autoErase) {
    var eventData = new CustomEventData();
    eventData.page.trigger = EventTriggers.PARALLEL;
    eventData.page.priorityType = EventPriorities.UNDER_PLAYER;

    eventData.page.callScriptOrCommonEvent(scriptOrCommonEventId);

    if (autoErase === true) {
      eventData.page.addCommand({
        code: 214
      });
    }

    return $gameMap.addEventAt(eventData, temporary);
  }

  //----------------------------------------------.
  //----------------------------------------------|
  // PUBLIC METHODS                               |
  //----------------------------------------------|
  //----------------------------------------------|

  var oldGameMap_addEvent = Game_Map.prototype.addEvent;
  Game_Map.prototype.addEvent = function(eventData, temporary, index) {
    // Makes sure that all pages have all the "end" commands they need
    if (eventData instanceof CustomEventData) {
      eventData.endAllPages();
    }

    return oldGameMap_addEvent.call(this, eventData, temporary, index);
  };


  //----------------------------------------------.
  //----------------------------------------------|
  // EXPORT SECTION                               |
  //----------------------------------------------|
  //----------------------------------------------|

  Game_Map.prototype.createActorAt = createActorAt;
  $.createActorAt = createActorAt;

  Game_Map.prototype.createNormalEventAt = createNormalEventAt;
  $.createNormalEventAt = createNormalEventAt;

  Game_Map.prototype.createTriggerEventAt = createTriggerEventAt;
  $.createTriggerEventAt = createTriggerEventAt;

  Game_Map.prototype.createTeleportEventAt = createTeleportEventAt;
  $.createTeleportEventAt = createTeleportEventAt;

  Game_Map.prototype.createParallelProcess = createParallelProcess;
  $.createParallelProcess = createParallelProcess;
})(OrangeCustomEventCreator);

Imported.OrangeCustomEventCreator = 1.2;