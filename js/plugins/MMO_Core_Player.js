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
 */

function MMO_Core_Players() { 
  this.initialize.apply(this, arguments);
}

(function() {
  MMO_Core_Players.Player   = {};
  MMO_Core_Players.Players  = {};
  MMO_Core_Players.Party    = [];
  MMO_Core_Players.Combat   = {};
  MMO_Core_Players.Parameters = PluginManager.parameters('MMO_Core_Player');
  MMO_Core_Players.hasInitialized = false;
  MMO_Core_Players.isCombatInitiator = false;
  
  // ---------------------------------------
  // ---------- Native Functions Extending
  // ---------------------------------------

  // Handle the disabling of the menu and proper appearence of the player
  DataManager.setupNewGame = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(MMO_Core_Players.Player["mapId"], MMO_Core_Players.Player["x"], MMO_Core_Players.Player["y"]);
    $gameSystem.disableSave();
    Graphics.frameCount = 0;

    if(!MMO_Core_Players.hasInitialized) {
      // Handling player stats changes
      MMO_Core_Players.setHp = Game_BattlerBase.prototype.setHp;
      Game_BattlerBase.prototype.setHp = function(hp) {
        MMO_Core_Players.setHp.call(this, hp);
        if(this._actorId === 1) MMO_Core_Players.savePlayerStats();
      }
 
      MMO_Core_Players.setMp = Game_BattlerBase.prototype.setMp;
      Game_BattlerBase.prototype.setMp = function(mp) {
        MMO_Core_Players.setHp.call(this, mp);
        if(this._actorId === 1) MMO_Core_Players.savePlayerStats();
      }
 
      MMO_Core_Players.recoverAll = Game_BattlerBase.prototype.recoverAll;
      Game_BattlerBase.prototype.recoverAll = function() {
        MMO_Core_Players.recoverAll.call(this);
        if(this._actorId === 1) MMO_Core_Players.savePlayerStats();
      }
 
      MMO_Core_Players.consumeItem = Game_Battler.prototype.consumeItem;    
      Game_Battler.prototype.consumeItem = function(item, amount, includeEquip) {
        MMO_Core_Players.consumeItem.call(this, item, amount, includeEquip);
        MMO_Core_Players.savePlayerStats();      
      }

      MMO_Core_Players.gainItem = Game_Party.prototype.gainItem;      
      Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        MMO_Core_Players.gainItem.call(this, item, amount, includeEquip);
        MMO_Core_Players.savePlayerStats();              
      }

      MMO_Core_Players.changeEquip = Game_Actor.prototype.changeEquip;            
      Game_Actor.prototype.changeEquip = function(slotId, item) {
        MMO_Core_Players.changeEquip.call(this, slotId, item);
        MMO_Core_Players.savePlayerStats();  
      }

      MMO_Core_Players.processOk = Window_MenuStatus.prototype.processOk;   
      Window_MenuStatus.prototype.processOk = function() {

        // Temporary (not sure) - Block equiping stuff to other party members (and skills)
        if(this.index() > 0 && SceneManager._scene._commandWindow._index !== 3) {
          this.deselect()
          SoundManager.playBuzzer();
          SceneManager.goto(Scene_Menu);
          return;
        }

        MMO_Core_Players.processOk.call(this);
      }

      // Temporary - Block using items on other party members
      MMO_Core_Players.onActorOk = Scene_ItemBase.prototype.onActorOk;   
      Scene_ItemBase.prototype.onActorOk = function() {
        if(this._actorWindow._index > 0) {
          SoundManager.playBuzzer();
          SceneManager.goto(Scene_Menu);
          return;
        }

        MMO_Core_Players.onActorOk.call(this);
      }

      MMO_Core_Players.startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
      Scene_Battle.prototype.startActorCommandSelection = function() {
        // If it is a party battle and the player selected an action
        if($gameParty.size() > 1 && BattleManager.actor().index() > 0) {

          if(MMO_Core_Players.isCombatInitiator) BattleManager._canEscape = true; // If combat initiator, we can escape the combat.
          
          BattleManager._actorIndex = 0; // We make sure he can't control the others
          let action = BattleManager.actor()._actions[0]; // We store its action
          MMO_Core.socket.emit("party_player_action_fight", action); // We send the action to the server
          BattleManager.startInput();
          return;
        }

        MMO_Core_Players.startActorCommandSelection.call(this);
      }

      // Create an estimation of damages for combat synchronisation
      Game_Action.prototype.estimateDamages = async function(target) {
        var targetResult = target.result();
        var result = {};
                
        this.subject().clearResult();
        targetResult.clear();

        result.used = this.testApply(target);
        result.missed = (result.used && Math.random() >= this.itemHit(target));
        result.evaded = (!result.missed && Math.random() < this.itemEva(target));
        result.physical = this.isPhysical();
        result.drain = this.isDrain();
        if (result.used && !result.missed && !result.evaded) {
          if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            if (value === 0) result.critical = false;
            if (this.isHpEffect()) {
              if (this.isDrain()) value = Math.min(target.hp, value);
              result.hpDamage = -value;
            }
            if (this.isMpEffect()) {
              if (!this.isMpRecover()) value = Math.min(target.mp, value);
              result.mpDamage = -value;
            }
          }
          this.item().effects.forEach(function(effect) {
              this.applyItemEffect(target, effect);
          }, this);
          this.applyItemUserEffect(target);
        }
        return result;
      };

      // Apply preset damages to the target
      Game_Action.prototype.applyPresetDamages = function(target, presetDamages) {
        var result = target.result();
        this.subject().clearResult();
        result.clear();
        result.used = presetDamages.used;
        result.missed = presetDamages.missed;
        result.evaded = presetDamages.evaded;
        result.physical = presetDamages.physical;
        result.drain = presetDamages.drain;
        if (result.isHit()) {
            if (this.item().damage.type > 0) {
              result.critical = presetDamages.critical;
                        
              if(presetDamages.hpDamage) {
                presetDamages.hpDamage = -presetDamages.hpDamage;
                if (this.isDrain()) {
                  presetDamages.hpDamage = Math.min(target.hp, presetDamages.hpDamage);
                }
                this.makeSuccess(target);
                target.gainHp(-presetDamages.hpDamage);
                if (presetDamages.hpDamage > 0) {
                    target.onDamage(presetDamages.hpDamage);
                }
                this.gainDrainedHp(presetDamages.hpDamage);
              }
              if(presetDamages.mpDamage) {
                presetDamages.mpDamage = -presetDamages.mpDamage;
                if (!this.isMpRecover()) {
                  presetDamages.mpDamage = Math.min(target.mp, presetDamages.mpDamage);
                }
                if(presetDamages.mpDamage !== 0) this.makeSuccess();
                target.gainMp(-presetDamages.mpDamage);
                this.gainDrainedMp(presetDamages.mpDamage);             
              }
            }
            this.item().effects.forEach(function(effect) {
                this.applyItemEffect(target, effect);
            }, this);
            this.applyItemUserEffect(target);
        }
      };
      
      MMO_Core_Players.hasInitialized = true;
    }
  };

  // Handle the initialization of the player with the proper stats and items
  MMO_Core_Players.partyInit = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function() {
    MMO_Core_Players.partyInit.call(this);
    if(MMO_Core_Players.Player["stats"] !== undefined) { 
      this._gold = MMO_Core_Players.Player["stats"]["gold"];
      this._items = MMO_Core_Players.Player["stats"]["items"];
      this._weapons = MMO_Core_Players.Player["stats"]["weapons"];
      this._armors = MMO_Core_Players.Player["stats"]["armors"];
    }
  }

  // Handle change of scenes
  MMO_Core_Players.changeScene = SceneManager.changeScene;
  SceneManager.changeScene = function() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if(SceneManager._nextScene instanceof Scene_Menu) {
        if(!MMO_Core_Players.Player.isOnMenu) MMO_Core_Players.updateBusy("menu");
        MMO_Core_Players.Player.isOnMenu = true
      } 
      if(SceneManager._nextScene instanceof Scene_Battle) {
        MMO_Core_Players.updateBusy("combat");
      }
      if(SceneManager._nextScene instanceof Scene_Map) {
        MMO_Core_Players.Player.isOnMenu = false;
        MMO_Core_Players.updateBusy(false);        
      }
    }

    MMO_Core_Players.changeScene.call(this);
  }

  MMO_Core_Players.onBattleStart = Game_Unit.prototype.onBattleStart;
  Game_Unit.prototype.onBattleStart = function() {
    if(this instanceof Game_Party && $gameParty.size() > 1) {
      MMO_Core.socket.emit("party_player_join_fight", $gameTroop);
    }
    MMO_Core_Players.onBattleStart.call(this);
  };

  MMO_Core_Players.onBattleEnd = Game_Unit.prototype.onBattleEnd;
  Game_Unit.prototype.onBattleEnd = function() {
    if(this instanceof Game_Party && $gameParty.size() > 1) MMO_Core.socket.emit("party_player_end_fight");
    MMO_Core_Players.onBattleEnd.call(this);
  };

  // We don't let other people leave the fight until the initiator does
  MMO_Core_Players.endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function(result) {
    if($gameParty.size() > 1 && !MMO_Core_Players.isCombatInitiator) return; // We block it.

    MMO_Core_Players.endBattle.call(this, result);
  }

  // Handle the initialization of the player with the proper stats and items
  Game_Actor.prototype.setup = function(actorId) {
    var actor = $dataActors[actorId];
    var hasLoaded = false;

    if(MMO_Core_Players.Player["stats"] !== undefined) hasLoaded = true;
      
    let playerName = MMO_Core_Players.Player["username"];

    this._actorId = actorId;
    this._name = playerName || actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = MMO_Core_Players.Player["classId"] || actor.classId;
    this.clearParamPlus();
    if(hasLoaded) {
      this._exp     = MMO_Core_Players.Player["stats"]["exp"];
      this._skills  = MMO_Core_Players.Player["stats"]["skills"];
      this._hp      = MMO_Core_Players.Player["stats"]["hp"];
      this._mp      = MMO_Core_Players.Player["stats"]["mp"];
      this._level   = MMO_Core_Players.Player["stats"]["level"];
      this.initEquips(MMO_Core_Players.Player["stats"]["equips"]);
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

    if(MMO_Core_Players.Player["skin"]["characterIndex"] === undefined) MMO_Core_Players.Player["skin"]["characterIndex"] = 1;

    $gamePlayer._characterIndex = MMO_Core_Players.Player["skin"]["characterIndex"];
    $gamePlayer._characterName = MMO_Core_Players.Player["skin"]["characterName"];
    $gameActors["_data"][1]["_battlerName"] = MMO_Core_Players.Player["skin"]["battlerName"];
    $gameActors["_data"][1]["_faceName"] = MMO_Core_Players.Player["skin"]["faceName"];
    $gameActors["_data"][1]["_faceIndex"] = MMO_Core_Players.Player["skin"]["faceIndex"];

    players = {}; // Reinit the player variable
    if(!MMO_Core_Players.Player["loadedOnMap"]) {
      
      $dataActors[1].characterIndex = MMO_Core_Players.Player["skin"]["characterIndex"];
      $dataActors[1].characterName = MMO_Core_Players.Player["skin"]["characterName"];

      MMO_Core_Players.Player["loadedOnMap"] = true;
    }
    
    MMO_Core.socket.emit("map_joined", MMO_Core_Players.getPlayerPos());
    MMO_Core_Players.savePlayerStats();
  }

  // Handle player movement
  Game_Player.prototype.moveByInput = function() {
    if (!this.isMoving() && this.canMove()) {
      if (this.triggerAction()) return;
      var direction = this.getInputDirection();

      if (direction > 0) {
        $gameTemp.clearDestination();
      } else if ($gameTemp.isDestinationValid()) {
        if (MMO_Core_Players.Parameters["Mouse Movements"] === "false") return $gameTemp.clearDestination();
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
  MMO_Core_Players.setCharacterImage = Game_Actor.prototype.setCharacterImage;
  Game_Actor.prototype.setCharacterImage = function(characterName, characterIndex) {
    MMO_Core_Players.setCharacterImage.call(this, characterName, characterIndex);

    MMO_Core_Players.updateSkin({type: "sprite", characterName: characterName, characterIndex: characterIndex})   
    MMO_Core_Players.refreshPlayerOnMap();
  };

  MMO_Core_Players.setFaceImage = Game_Actor.prototype.setFaceImage;
  Game_Actor.prototype.setFaceImage = function(faceName, faceIndex) {
    MMO_Core_Players.setFaceImage.call(this, faceName, faceIndex);

    MMO_Core_Players.updateSkin({type: "face", faceName: faceName, faceIndex: faceIndex});
  };

  MMO_Core_Players.setBattlerImage = Game_Actor.prototype.setBattlerImage;
  Game_Actor.prototype.setBattlerImage = function(battlerName) {
    MMO_Core_Players.setBattlerImage.call(this, battlerName);

    MMO_Core_Players.updateSkin({type: "battler", battlerName: battlerName});
  };

  // Handle player state of the world (switches)
  Game_Switches.prototype.onChange = function() {
    MMO_Core.socket.emit("player_update_switches", $gameSwitches["_data"]);
    $gameMap.requestRefresh();
  };

  // Handle player state of the world (switches)
  Game_Switches.prototype.initialize = function() {
    this._data = MMO_Core_Players.Player["switches"] || [];
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
    this._data = MMO_Core_Players.Player["variables"] || [];      
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
  Scene_Gameover.prototype.gotoTitle = function() {
    DataManager.setupNewGame();
    MMO_Core.socket.emit("player_dead");
  };

  // Handle adding custom parameters to characters
  MMO_Core_Players.initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    MMO_Core_Players.initMembers.call(this);
    this._isBusy = false;
  };

  // [WORK AROUND] Work around RPG Maker MV engine not understanding party changes at beginning of combat  
  MMO_Core_Players.updateStatusWindow = Scene_Battle.prototype.updateStatusWindow;
  Scene_Battle.prototype.updateStatusWindow = function() {

    if (this.isActive() && !this._messageWindow.isClosing()) {
      if(MMO_Core_Players.Party.length > 0) {
        for(var i = 0; i < SceneManager._scene._spriteset.children[0].children[2].children.length; i++) { 
          if(!(SceneManager._scene._spriteset.children[0].children[2].children[i] instanceof Sprite_Actor)) continue;
          if(SceneManager._scene._spriteset.children[0].children[2].children[i]._actor) continue;
          SceneManager._scene._spriteset.children[0].children[2].children[i].moveToStartPosition();
        }
      }
    }

    MMO_Core_Players.updateStatusWindow.call(this);
  };

  // ---------------------------------------
  // ---------- MMO_Core.socket Handling
  // ---------------------------------------
  MMO_Core.socket.on("map_joined", function(data){
    if(MMO_Core_Players.Players[data.id] !== undefined && $gameMap._events[MMO_Core_Players.Players[data.id]["_eventId"]] !== undefined) $gameMap.eraseEvent(MMO_Core_Players.Players[data.id]["_eventId"]);

    MMO_Core_Players.Players[data.id] = $gameMap.createNormalEventAt(data["playerData"]["skin"]["characterName"], data["playerData"]["skin"]["characterIndex"], data["playerData"]["x"], data["playerData"]["y"], 2, 0, true);
    MMO_Core_Players.Players[data.id].headDisplay = MMO_Core_Players.Players[data.id].list().push({"code":108,"indent":0,"parameters":["<Name: " + data["playerData"]["username"] + ">"]});
    MMO_Core_Players.Players[data.id]._priorityType = 0;
    MMO_Core_Players.Players[data.id]._stepAnime = false;
    MMO_Core_Players.Players[data.id]._moveSpeed = 4;

    if(MMO_Core_Players.Party.length > 0 && !MMO_Core_Players.Player.isInCombat) {
      for(var i = 0; i < MMO_Core_Players.Party.length; i++) {
        if(MMO_Core_Players.Party[i].username != data["playerData"]["username"]) continue;
        if(!MMO_Core_Players.Party[i].isInCombat) continue;

        MMO_Core.socket.emit("party_player_join_fight", {});
      }
    }
  })

  MMO_Core.socket.on("map_exited",function(data){
    if(MMO_Core_Players.Players[data] === undefined) return;
    if($gameMap._events[MMO_Core_Players.Players[data]["_eventId"]] === undefined) return;
    
    $gameMap.eraseEvent(MMO_Core_Players.Players[data]["_eventId"]);
  })

  MMO_Core.socket.on("refresh_players_position",function(data){
    MMO_Core.socket.emit("refresh_players_position",{id: data, playerData: MMO_Core_Players.getPlayerPos()});
  })

  MMO_Core.socket.on("refresh_player_on_map", function(payload) {
    if(MMO_Core_Players.Players[payload.playerId] === undefined) return;

    MMO_Core_Players.Players[payload.playerId]._characterName = payload.playerData["skin"]["characterName"];
    MMO_Core_Players.Players[payload.playerId]._characterIndex = payload.playerData["skin"]["characterIndex"];

    if(MMO_Core_Players.Players[payload.playerId]._isBusy !== payload.playerData["isBusy"]) {
      MMO_Core_Players.Players[payload.playerId]._isBusy = payload.playerData["isBusy"] || false;    
    } 

    document.dispatchEvent(new Event('refresh_player_on_map', {'detail': payload})); // Dispatch DOM event for external plugins
  });

  MMO_Core.socket.on("refresh_player_data", function(payload) {
    MMO_Core_Players.Player = payload; // We update the local playerData details
    MMO_Core_Players.refreshStats();
  })

  MMO_Core.socket.on("refresh_party_data", async function(payload) {
    if(payload[MMO_Core_Players.Player.username]) {
      MMO_Core_Players.isCombatInitiator = (payload[MMO_Core_Players.Player.username].isInitiator) ? true : false;
      MMO_Core_Players.Player.isInCombat = (payload[MMO_Core_Players.Player.username].isInCombat) ? true : false;
    }

    delete payload[MMO_Core_Players.Player.username];

    let partySize = Object.keys(payload).length; // If no one = 1
    let currentPartySize = $gameParty.size(); // If no one = 1

    MMO_Core_Players.Party = [];

    // We delete all the actors for refreshing the party
    if(currentPartySize > 1 && partySize < currentPartySize) {
      for(var i = 2; i <= currentPartySize; i++) {
        $gameParty.removeActor(i);

        if(i === currentPartySize) MMO_Core_Players.refreshStats();
      }
    }

    if(partySize > 0) {
      for(var i = 0; i <= partySize; i++) {
        if(i === partySize) return MMO_Core_Players.refreshStats();

        let playerName = Object.keys(payload)[i];
        $gameActors.actor(i+2)._hidden = false;
        
        // We push the party members in the party Array.
        MMO_Core_Players.Party.push(payload[playerName]);
             
        
        $gameParty.addActor(i+2);

        // If we are in a battle and that a party member is not on the map, we don't add it in the battle.        
        if(payload[playerName].isInCombat && payload[playerName].mapId !== $gameMap._mapId) {
          $gameActors.actor(i+2).hide();
        }        
      }
    }
  });

  MMO_Core.socket.on('player_moving', function(data){
    if(!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) return;
    if(MMO_Core_Players.Players[data.id] === undefined) return;

    // Update movement speed and frequenzy
    MMO_Core_Players.Players[data.id].setMoveSpeed(data.moveSpeed);
    MMO_Core_Players.Players[data.id].setMoveFrequency(data.moveFrequency);
    MMO_Core_Players.Players[data.id].moveStraight(data.direction);
    if (MMO_Core_Players.Players[data.id].x !== data.x || MMO_Core_Players.Players[data.id].y !== data.y) MMO_Core_Players.Players[data.id].setPosition(data.x, data.y);
  });

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

  // Received when another party member start a fight on the same map
  MMO_Core.socket.on("party_player_join_fight", function(payload) {
    if($gameParty._inBattle) return;

    BattleManager.setup(payload._troopId, false, true);

    for(var i = 0; i < $gameTroop._enemies.length; i++) {
      $gameTroop._enemies[i]._hp = payload._enemies[i]._hp;
      $gameTroop._enemies[i]._mp = payload._enemies[i]._mp;
    }

    MMO_Core_Players.Player.isInCombat = true;

    SceneManager.goto(Scene_Battle);
  })

  MMO_Core.socket.on("party_player_estimate_fight", async function(actions) {
    let battleMembers = BattleManager.allBattleMembers();
    let results = {};

    // We go through every battle members to classify them.
    for(var i = 0; i < battleMembers.length; i++) {
      if(battleMembers[i]._actions[0] === undefined) { i++; continue; }

      // If Game Actor then we set up the actions.
      if(battleMembers[i] instanceof Game_Actor) { 
        let action = actions[battleMembers[i]._name]; // We assign the action corresponding to the player
        battleMembers[i]._actions[0]._targetIndex = action._targetIndex;
        battleMembers[i]._actions[0]._item._dataClass = action._item._dataClass;
        battleMembers[i]._actions[0]._item._itemId = action._item._itemId;
      }

      // If Game Enemy then we leave the game logic apply itself.
      if(battleMembers[i] instanceof Game_Enemy) {
        battleMembers[i]._actions[0].decideRandomTarget()
      }

      // Then we gather the targets and make a list out of it.
      let actorName = battleMembers[i].name();
      let targets = battleMembers[i]._actions[0].makeTargets();
      results[actorName] = {};
      results[actorName].targets = {}

      // We store the action so we also know what the NPCs did.
      results[actorName].action = battleMembers[i]._actions[0];

      for(var k in targets) {
        let targetName = targets[k].name();
        results[actorName].targets[targetName] = await battleMembers[i]._actions[0].estimateDamages(targets[k]);
      }
    }

    MMO_Core.socket.emit("party_player_estimate_fight", results);
  })


  // Received when all party members have done their actions
  MMO_Core.socket.on("party_player_action_fight", async function(results) {
    let battleMembers = BattleManager.allBattleMembers();
    let actors = {};

    // We classify the actors by name
    for(var i = 0; i < battleMembers.length; i++) {
      actors[battleMembers[i].name()] = battleMembers[i];
    }

    // We  then go through each actors to do their turns
    for(var actorName in actors) {
      let result = results[actorName];
      let currentActor = actors[actorName];

      // If an action is defined, we set it
      if(currentActor._actions[0]) {
        currentActor._actions[0]._item._dataClass = result.action._item._dataClass;
        currentActor._actions[0]._item._itemId = result.action._item._itemId;
      }
          
      // We set the targets with the appropriate actor in a Array
      currentActor.realTargets = [];
      if(result) {
        for(var targetName in result.targets) {
          currentActor.realTargets.push(actors[targetName]);
        }
      }
      

      // Turn start
      BattleManager.startTurn();
      BattleManager._subject = currentActor; // The actor becomes the subject
      // BattleManager.processTurn(); // Do the action checking

      // processTurn()
      var action = currentActor.currentAction();
      if (action) {
          action.prepare();
          if (action.isValid()) {
            // startAction()
            BattleManager._phase = 'partyAction';
            BattleManager._targets = currentActor.realTargets;
            BattleManager._action = action;
            currentActor.useItem(action.item());
            BattleManager._action.applyGlobal();
            BattleManager.refreshStatus();
            BattleManager._logWindow.startAction(currentActor, action, currentActor.realTargets);

            // updateAction()
            for(var k in BattleManager._targets) {
              var currentTarget = BattleManager._targets.shift();
              if (currentTarget) {
                // invokeAction()
                if (Math.random() < BattleManager._action.itemCnt(currentTarget)) {
                  // Counter Attack
                  var action = new Game_Action(currentTarget);
                  action.setAttack();
                  action.applyPresetDamages(currentActor, results[currentTarget.name()].targets[currentActor.name()])
                  BattleManager._logWindow.displayCounter(currentTarget);
                  BattleManager._logWindow.displayActionResults(currentTarget, currentActor);
                } else if (Math.random() < BattleManager._action.itemMrf(currentTarget)) {
                  // Magic Reflection
                  BattleManager._action._reflectionTarget = currentTarget;
                  BattleManager._logWindow.displayReflection(currentTarget);
                  action.applyPresetDamages(currentActor, results[currentTarget.name()].targets[currentActor.name()])
                  
                  BattleManager._logWindow.displayActionResults(currentTarget, currentActor);
                } else {
                  // Normal Attack
                  var realTarget = BattleManager.applySubstitute(currentTarget);
                  BattleManager._action.apply(realTarget);
                  action.applyPresetDamages(realTarget, result.targets[realTarget.name()]);
                  currentActor._hidden = (currentActor.hp === 0) ? true : false;
                  BattleManager._logWindow.displayActionResults(currentActor, realTarget);
                }
                currentActor.setLastTarget(currentTarget); // Will probably to rewrite
                BattleManager._logWindow.push('popBaseLine');
                BattleManager.refreshStatus();
              } else {
                BattleManager.endAction();
                BattleManager.startInput();
                BattleManager.selectNextCommand();
              }
            }
            
            // updateAction()

          }
          currentActor.removeCurrentAction();
      } else {
          currentActor.onAllActionsEnd();
          BattleManager.refreshStatus();
          BattleManager._logWindow.displayAutoAffectedStatus(currentActor);
          BattleManager._logWindow.displayCurrentState(currentActor);
          BattleManager._logWindow.displayRegeneration(currentActor);
          BattleManager._subject = BattleManager.getNextSubject();
      }

      // We end the action (and turn)
      BattleManager.endAction();
    }
  })

  MMO_Core.socket.on("party_player_disband_fight", function(payload) {
    if(SceneManager._nextScene !== null) return;
    if(!$gameParty._inBattle) return;

    SceneManager.goto(Scene_Map);
  })

  // ---------------------------------------
  // ---------- Exposed Functions
  // ---------------------------------------

  MMO_Core_Players.updateSkin = function(payload) {
    if(payload.type === "sprite") {
      MMO_Core_Players.Player["skin"]["characterName"] = payload.characterName;
      MMO_Core_Players.Player["skin"]["characterIndex"] = payload.characterIndex;
    }

    MMO_Core.socket.emit("player_update_skin", payload);
  }

  MMO_Core_Players.refreshPlayerOnMap = function() {
    MMO_Core.socket.emit("refresh_player_on_map");
  }

  MMO_Core_Players.updateBusy = function(newState) {
    MMO_Core.socket.emit("player_update_busy", newState);    
  }

  MMO_Core_Players.refreshStats = function() {

    if(MMO_Core_Players.Player["stats"] !== undefined) {
      $gameParty._gold = MMO_Core_Players.Player["stats"]["gold"];
      $gameActors["_data"][1]._level = MMO_Core_Players.Player["stats"]["level"];
      $gameActors["_data"][1]._exp = MMO_Core_Players.Player["stats"]["exp"];
      $gameActors["_data"][1]._classId = MMO_Core_Players.Player["stats"]["classId"];
      $gameActors["_data"][1]._hp = MMO_Core_Players.Player["stats"]["hp"];
      $gameActors["_data"][1]._mp = MMO_Core_Players.Player["stats"]["mp"];
      $gamePlayer._characterIndex = MMO_Core_Players.Player["skin"]["characterIndex"];
      $gamePlayer._characterName =  MMO_Core_Players.Player["skin"]["characterName"];
    }
    
    if(MMO_Core_Players.Party.length > 0) {      
      for(var i = 0; i < MMO_Core_Players.Party.length; i++) {
        if(!$gameActors["_data"][i+2]) { continue; }

        if(MMO_Core_Players.Player.isInCombat && !MMO_Core_Players.Party[i].isInCombat) {
          $gameActors["_data"][i+2].hide();
        }

        $gameActors["_data"][i+2]._name = MMO_Core_Players.Party[i]["username"];
        $gameActors["_data"][i+2]._level = MMO_Core_Players.Party[i]["stats"]["level"];
        $gameActors["_data"][i+2]._exp = MMO_Core_Players.Party[i]["stats"]["exp"]
        $gameActors["_data"][i+2]._classId = MMO_Core_Players.Party[i]["stats"]["classId"]
        $gameActors["_data"][i+2]._skills = MMO_Core_Players.Party[i]["stats"]["skills"]
        $gameActors["_data"][i+2]._hp = MMO_Core_Players.Party[i]["stats"]["hp"]
        $gameActors["_data"][i+2]._mp = MMO_Core_Players.Party[i]["stats"]["mp"]
        $gameActors["_data"][i+2].initEquips(MMO_Core_Players.Party[i]["stats"]["equips"]);
        $gameActors["_data"][i+2]["_battlerName"] = MMO_Core_Players.Party[i]["skin"]["battlerName"];
        $gameActors["_data"][i+2]["_faceName"] = MMO_Core_Players.Party[i]["skin"]["faceName"];
        $gameActors["_data"][i+2]["_faceIndex"] = MMO_Core_Players.Party[i]["skin"]["faceIndex"];
      }
    }

    Game_Interpreter.prototype.refreshEventMiniLabel(); // We make sure the colors appear correctly.
  }
  
  MMO_Core_Players.savePlayerStats = function() {
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

  MMO_Core_Players.getPlayerPos = function() {
    return {
      x: $gamePlayer["_x"],
      y: $gamePlayer["_y"],
      mapId: $gameMap["_mapId"]
    };
  }
})();