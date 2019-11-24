//=============================================================================
// MMO_Core_Player.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Player
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 * 
 * @param Mouse Movements
 * @desc Allow the usage of the mouse to move the player
 * @type Boolean
 * @default false
 * 
 * @param Use Native Respawn
 * @desc Use the native respawn when player is dead
 * @type Boolean
 * @default false
 */

function MMO_Core_Player() { 
  this.initialize.apply(this, arguments);
}

(function() {
  MMO_Core_Player.Player   = {};
  MMO_Core_Player.Parameters = PluginManager.parameters('MMO_Core_Player');
  MMO_Core_Player.hasInitialized = false;
  MMO_Core_Player.isCombatInitiator = false;
  
  // ---------------------------------------
  // ---------- Native Functions Extending
  // ---------------------------------------

  // Handle the disabling of the menu and proper appearence of the player
  DataManager.setupNewGame = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(MMO_Core_Player.Player["mapId"], MMO_Core_Player.Player["x"], MMO_Core_Player.Player["y"]);
    $gameSystem.disableSave();
    Graphics.frameCount = 0;

    if(!MMO_Core_Player.hasInitialized) {
      // Handling player stats changes
      MMO_Core_Player.setHp = Game_BattlerBase.prototype.setHp;
      Game_BattlerBase.prototype.setHp = function(hp) {
        MMO_Core_Player.setHp.call(this, hp);
        if(this._actorId === 1) MMO_Core_Player.savePlayerStats();
      }
 
      MMO_Core_Player.setMp = Game_BattlerBase.prototype.setMp;
      Game_BattlerBase.prototype.setMp = function(mp) {
        MMO_Core_Player.setMp.call(this, mp);
        if(this._actorId === 1) MMO_Core_Player.savePlayerStats();
      }
 
      MMO_Core_Player.recoverAll = Game_BattlerBase.prototype.recoverAll;
      Game_BattlerBase.prototype.recoverAll = function() {
        MMO_Core_Player.recoverAll.call(this);
        if(this._actorId === 1) MMO_Core_Player.savePlayerStats();
      }
 
      MMO_Core_Player.consumeItem = Game_Battler.prototype.consumeItem;    
      Game_Battler.prototype.consumeItem = function(item, amount, includeEquip) {
        MMO_Core_Player.consumeItem.call(this, item, amount, includeEquip);
        MMO_Core_Player.savePlayerStats();      
      }

      MMO_Core_Player.gainItem = Game_Party.prototype.gainItem;      
      Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        MMO_Core_Player.gainItem.call(this, item, amount, includeEquip);
        MMO_Core_Player.savePlayerStats();              
      }

      MMO_Core_Player.changeEquip = Game_Actor.prototype.changeEquip;            
      Game_Actor.prototype.changeEquip = function(slotId, item) {
        MMO_Core_Player.changeEquip.call(this, slotId, item);
        MMO_Core_Player.savePlayerStats();  
      }

      MMO_Core_Player.hasInitialized = true;
    }
  };

  // Handle the initialization of the player with the proper stats and items
  MMO_Core_Player.partyInit = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function() {
    MMO_Core_Player.partyInit.call(this);
    if(MMO_Core_Player.Player["stats"] !== undefined) { 
      this._gold = MMO_Core_Player.Player["stats"]["gold"];
      this._items = MMO_Core_Player.Player["stats"]["items"];
      this._weapons = MMO_Core_Player.Player["stats"]["weapons"];
      this._armors = MMO_Core_Player.Player["stats"]["armors"];
    }
  }

  // Handle change of scenes
  MMO_Core_Player.changeScene = SceneManager.changeScene;
  SceneManager.changeScene = function() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if(SceneManager._nextScene instanceof Scene_Menu) {
        if(!MMO_Core_Player.Player.isOnMenu) MMO_Core_Player.updateBusy("menu");
        MMO_Core_Player.Player.isOnMenu = true
      } 
      if(SceneManager._nextScene instanceof Scene_Battle) {
        MMO_Core_Player.updateBusy("combat");
      }
      if(SceneManager._nextScene instanceof Scene_Map) {
        MMO_Core_Player.Player.isOnMenu = false;
        MMO_Core_Player.updateBusy(false);        
      }
    }

    MMO_Core_Player.changeScene.call(this);
  }

  // Handle the initialization of the player with the proper stats and items
  Game_Actor.prototype.setup = function(actorId) {
    var actor = $dataActors[actorId];
    var hasLoaded = false;

    if(MMO_Core_Player.Player["stats"] !== undefined) hasLoaded = true;
      
    let playerName = MMO_Core_Player.Player["username"];

    this._actorId = actorId;
    this._name = playerName || actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = actor.classId;
    this.clearParamPlus();
    if(hasLoaded) {
      this._classId = MMO_Core_Player.Player["stats"]["classId"];
      this._exp     = MMO_Core_Player.Player["stats"]["exp"];
      this._skills  = MMO_Core_Player.Player["stats"]["skills"];
      this._hp      = MMO_Core_Player.Player["stats"]["hp"];
      this._mp      = MMO_Core_Player.Player["stats"]["mp"];
      this._level   = MMO_Core_Player.Player["stats"]["level"];
      this.initEquips(MMO_Core_Player.Player["stats"]["equips"]);
    } else {
      this._level = actor.initialLevel;
      this.initEquips(actor.equips);
      this.initExp();
      this.initSkills();
      this.recoverAll();
    }
    this.initImages();
  };

  // Handle the proper player spawn when map load
  Scene_Map.prototype.onMapLoaded = function() {
    if (this._transfer) {
      $gamePlayer.performTransfer();
    }
    this.createDisplayObjects();

    if(MMO_Core_Player.Player["skin"]["characterIndex"] === undefined) MMO_Core_Player.Player["skin"]["characterIndex"] = 1;

    $gamePlayer._characterIndex = MMO_Core_Player.Player["skin"]["characterIndex"];
    $gamePlayer._characterName = MMO_Core_Player.Player["skin"]["characterName"];
    $gameActors["_data"][1]["_battlerName"] = MMO_Core_Player.Player["skin"]["battlerName"];
    $gameActors["_data"][1]["_faceName"] = MMO_Core_Player.Player["skin"]["faceName"];
    $gameActors["_data"][1]["_faceIndex"] = MMO_Core_Player.Player["skin"]["faceIndex"];

    players = {}; // Reinit the player variable
    if(!MMO_Core_Player.Player["loadedOnMap"]) {
      
      $dataActors[1].characterIndex = MMO_Core_Player.Player["skin"]["characterIndex"];
      $dataActors[1].characterName = MMO_Core_Player.Player["skin"]["characterName"];

      MMO_Core_Player.Player["loadedOnMap"] = true;
    }
    
    MMO_Core.socket.emit("map_joined", MMO_Core_Player.getPlayerPos());
    MMO_Core_Player.savePlayerStats();
  }

  // Handle player movement
  Game_Player.prototype.moveByInput = function() {
    if (!this.isMoving() && this.canMove()) {
      if (this.triggerAction()) return;
      var direction = this.getInputDirection();

      if (direction > 0) {
        $gameTemp.clearDestination();
      } else if ($gameTemp.isDestinationValid()) {
        if (MMO_Core_Player.Parameters["Mouse Movements"] === "false") return $gameTemp.clearDestination();
        var x = $gameTemp.destinationX();
        var y = $gameTemp.destinationY();
        direction = this.findDirectionTo(x, y);
      }

      if(direction > 0) {
        this.executeMove(direction);
        MMO_Core.socket.emit('player_moving', {
          direction: direction,
          mapId: $gameMap["_mapId"],
          x: this.x,
          y: this.y,
          moveSpeed: this.realMoveSpeed(),
          moveFrequency: this.moveFrequency()
        });
      }
    }
  };

  // Handle player skin change
  MMO_Core_Player.setCharacterImage = Game_Actor.prototype.setCharacterImage;
  Game_Actor.prototype.setCharacterImage = function(characterName, characterIndex) {
    MMO_Core_Player.setCharacterImage.call(this, characterName, characterIndex);

    MMO_Core_Player.updateSkin({type: "sprite", characterName: characterName, characterIndex: characterIndex})   
    MMO_Core_Players.refreshPlayersOnMap();
  };

  MMO_Core_Player.setFaceImage = Game_Actor.prototype.setFaceImage;
  Game_Actor.prototype.setFaceImage = function(faceName, faceIndex) {
    MMO_Core_Player.setFaceImage.call(this, faceName, faceIndex);

    MMO_Core_Player.updateSkin({type: "face", faceName: faceName, faceIndex: faceIndex});
  };

  MMO_Core_Player.setBattlerImage = Game_Actor.prototype.setBattlerImage;
  Game_Actor.prototype.setBattlerImage = function(battlerName) {
    MMO_Core_Player.setBattlerImage.call(this, battlerName);

    MMO_Core_Player.updateSkin({type: "battler", battlerName: battlerName});
  };

  // Handle player state of the world (switches)
  Game_Switches.prototype.onChange = function() {
    MMO_Core.socket.emit("player_update_switches", $gameSwitches["_data"]);
    $gameMap.requestRefresh();
  };

  // Handle player state of the world (switches)
  Game_Switches.prototype.initialize = function() {
    this._data = MMO_Core_Player.Player["switches"] || [];
  }; 

  // Handle the global switch system
  Game_Switches.prototype.setValue = function(switchId, value) {
    if (switchId > 0 && switchId < $dataSystem.switches.length) {
      MMO_Core.socket.emit("player_global_switch_check",{switchId: switchId, value: value});
      this._data[switchId] = value;
      this.onChange();
    }
  };

  // Handle player state of the world (variables)
  Game_Variables.prototype.onChange = function() {
    MMO_Core.socket.emit("player_update_variables", $gameVariables["_data"]);
    $gameMap.requestRefresh();
  };

  Game_Variables.prototype.initialize = function() {
    this._data = MMO_Core_Player.Player["variables"] || [];      
  };

  Game_Variables.prototype.setValue = function(variableId, value) {
      if (variableId > 0 && variableId < $dataSystem.variables.length) {
        MMO_Core.socket.emit("player_global_variables_check",{variableId: variableId, value: value});
        if (typeof value === 'number') {
            value = Math.floor(value);
        }
        this._data[variableId] = value;
        this.onChange();
      }
  };

  // Handle player death during combat
  if (MMO_Core_Player.Parameters["Use Native Respawn"] === "false") {
    Scene_Gameover.prototype.gotoTitle = function() {
      DataManager.setupNewGame();
      MMO_Core.socket.emit("player_dead");
    };

    Scene_Base.prototype.checkGameover = function() {
      if ($gameParty.isAllDead()) {
        $gameActors["_data"][1].recoverAll();
      }
    };
  }




  // Handle adding custom parameters to characters
  MMO_Core_Player.initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    MMO_Core_Player.initMembers.call(this);
    this._isBusy = false;
  };

  // ---------------------------------------
  // ---------- MMO_Core.socket Handling
  // ---------------------------------------
  MMO_Core.socket.on("refresh_player_data", function(payload) {
    MMO_Core_Player.Player = payload; // We update the local playerData details
    MMO_Core_Player.refreshStats();
  })

  MMO_Core.socket.on("player_update_switch", function(data){
    $gameSwitches["_data"][data["switchId"]] = data["value"]; // Bypass the setValue function.
    Game_Switches.prototype.onChange();
  });

  MMO_Core.socket.on("player_update_variable", function(data){
    $gameVariables["_data"][data["variableId"]] = data["value"]; // Bypass the setValue function.
    Game_Variables.prototype.onChange();
  });

  MMO_Core.socket.on("player_respawn", function(payload) {
    $gamePlayer.reserveTransfer(payload["mapId"], payload["x"], payload["y"]);
    SceneManager.goto(Scene_Map);
  })

  // ---------------------------------------
  // ---------- Exposed Functions
  // ---------------------------------------

  MMO_Core_Player.updateSkin = function(payload) {
    if(payload.type === "sprite") {
      MMO_Core_Player.Player["skin"]["characterName"] = payload.characterName;
      MMO_Core_Player.Player["skin"]["characterIndex"] = payload.characterIndex;
    }

    MMO_Core.socket.emit("player_update_skin", payload);
  }

  MMO_Core_Player.updateBusy = function(newState) {
    MMO_Core.socket.emit("player_update_busy", newState);    
  }

  MMO_Core_Player.refreshStats = async function() {

    if(MMO_Core_Player.Player["stats"] !== undefined) {
      $gameParty._gold                  = MMO_Core_Player.Player["stats"]["gold"];
      $gameActors["_data"][1]._level    = MMO_Core_Player.Player["stats"]["level"];
      $gameActors["_data"][1]._exp      = MMO_Core_Player.Player["stats"]["exp"];
      $gameActors["_data"][1]._classId  = MMO_Core_Player.Player["stats"]["classId"];
      $gameActors["_data"][1]._hp       = MMO_Core_Player.Player["stats"]["hp"];
      $gameActors["_data"][1]._mp       = MMO_Core_Player.Player["stats"]["mp"];
      $gameParty._weapons  = MMO_Core_Player.Player["stats"]["weapons"];
      $gameParty._armors   = MMO_Core_Player.Player["stats"]["armors"];
      $gameParty._items    = MMO_Core_Player.Player["stats"]["items"];
      $gamePlayer._characterIndex       = MMO_Core_Player.Player["skin"]["characterIndex"];
      $gamePlayer._characterName        = MMO_Core_Player.Player["skin"]["characterName"];
    }

    if(MMO_Core_Party) await MMO_Core_Party.refreshPartyStats();

    Game_Interpreter.prototype.refreshEventMiniLabel();
  }
  
  MMO_Core_Player.savePlayerStats = function() {
    if($gameActors["_data"][1] === undefined) return;

    let equips = [];
    for(var i = 0; i < $gameActors["_data"][1]["_equips"].length; i++) {
      equips.push($gameActors["_data"][1]["_equips"][i]["_itemId"])
    }

    MMO_Core.socket.emit("player_update_stats", {
      hp: $gameActors["_data"][1]["_hp"],
      mp: $gameActors["_data"][1]["_mp"],
      equips: equips,
      skills: $gameActors["_data"][1]["_skills"],
      level: $gameActors["_data"][1]["_level"],
      exp: $gameActors["_data"][1]["_exp"],
      classId: $gameActors["_data"][1]["_classId"],
      gold: $gameParty["_gold"],
      items: $gameParty["_items"],
      armors: $gameParty["_armors"],
      weapons: $gameParty["_weapons"]
    });
  }

  MMO_Core_Player.getPlayerPos = function() {
    return {
      x: $gamePlayer["_x"],
      y: $gamePlayer["_y"],
      mapId: $gameMap["_mapId"]
    };
  }
})();