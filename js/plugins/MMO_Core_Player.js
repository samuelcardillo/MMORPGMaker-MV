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
  MMO_Core_Players.Player = {};
  MMO_Core_Players.Players = [];
  MMO_Core_Players.Parameters = PluginManager.parameters('MMO_Core_Player');

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

  // Handle the initialization of the player with the proper stats and items
  Game_Actor.prototype.setup = function(actorId) {
    var actor = $dataActors[actorId];
    var hasLoaded = false;

    if(MMO_Core_Players.Player["stats"] !== undefined) hasLoaded = true;

    this._actorId = actorId;
    this._name = MMO_Core_Players.Player["username"] || actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = actor.classId;
    this.clearParamPlus();
    if(hasLoaded) {
      this._exp =  MMO_Core_Players.Player["stats"]["exp"];
      this._skills = MMO_Core_Players.Player["stats"]["skills"];
      this._hp = MMO_Core_Players.Player["stats"]["hp"];
      this._mp = MMO_Core_Players.Player["stats"]["mp"];
      this._level =  MMO_Core_Players.Player["stats"]["level"];
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
    if(MMO_Core_Players.Player["logged"] == undefined) {
      $dataActors[1].characterIndex = MMO_Core_Players.Player["skin"]["characterIndex"];
      $dataActors[1].characterName = MMO_Core_Players.Player["skin"]["characterName"];
      MMO_Core_Players.Player["logged"] = true;
    }
    
    MMO_Core_Players.savePlayerStats();
    socket.emit("map_joined", MMO_Core_Players.getPlayerPos());
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
        socket.emit('player_moving', {
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

    MMO_Core_Players.Player["skin"]["characterName"] = characterName;
    MMO_Core_Players.Player["skin"]["characterIndex"] = characterIndex;

    socket.emit("player_update_skin", {type: "sprite", characterName: characterName, characterIndex: characterIndex});    
    socket.emit("refresh_player_on_map");    
  };

  MMO_Core_Players.setFaceImage = Game_Actor.prototype.setFaceImage;
  Game_Actor.prototype.setFaceImage = function(faceName, faceIndex) {
    MMO_Core_Players.setFaceImage.call(this, faceName, faceIndex);

    socket.emit("player_update_skin", {type: "face", faceName: faceName, faceIndex: faceIndex});
  };

  MMO_Core_Players.setBattlerImage = Game_Actor.prototype.setBattlerImage;
  Game_Actor.prototype.setBattlerImage = function(battlerName) {
    MMO_Core_Players.setBattlerImage.call(this, battlerName);

    socket.emit("player_update_skin", {type: "battler", battlerName: battlerName});
  };

  // Handle player state of the world (switches)
  Game_Switches.prototype.onChange = function() {
    socket.emit("player_update_switches", $gameSwitches["_data"]);
    $gameMap.requestRefresh();
  };

  Game_Switches.prototype.initialize = function() {
    this._data = MMO_Core_Players.Player["switches"] || [];
  };

  // Handle the global switch system
  Game_Switches.prototype.setValue = function(switchId, value) {
    if (switchId > 0 && switchId < $dataSystem.switches.length) {
      socket.emit("player_global_switch_check",{switchId: switchId, value: value});
      this._data[switchId] = value;
      this.onChange();
    }
  };

  // Handle player death during combat
  Scene_Gameover.prototype.gotoTitle = function() {
    DataManager.setupNewGame();
    socket.emit("player_dead");
  };

  // ---------------------------------------
  // ---------- Socket Handling
  // ---------------------------------------
  socket.on("map_joined",function(data){
    if(MMO_Core_Players.Players[data.id] !== undefined && $gameMap._events[MMO_Core_Players.Players[data.id]["_eventId"]] !== undefined) $gameMap.eraseEvent(MMO_Core_Players.Players[data.id]["_eventId"]);

    MMO_Core_Players.Players[data.id] = $gameMap.createNormalEventAt(data["playerData"]["skin"]["characterName"], data["playerData"]["skin"]["characterIndex"], data["playerData"]["x"], data["playerData"]["y"], 2, 0, true);
    MMO_Core_Players.Players[data.id].headDisplay = MMO_Core_Players.Players[data.id].list().push({"code":108,"indent":0,"parameters":["<Name: " + data["playerData"]["username"] + ">"]});
    MMO_Core_Players.Players[data.id]._priorityType = 0;
    MMO_Core_Players.Players[data.id]._stepAnime = false;
    MMO_Core_Players.Players[data.id]._moveSpeed = 4;
  })

  socket.on("map_exited",function(data){
    if($gameMap._events[MMO_Core_Players.Players[data]["_eventId"]] === undefined) return;
    
    $gameMap.eraseEvent(MMO_Core_Players.Players[data]["_eventId"]);
  })

  socket.on("refresh_players_position",function(data){
    socket.emit("refresh_players_position",{id: data, playerData: MMO_Core_Players.getPlayerPos()});
  })

  socket.on("refresh_player_on_map", function(payload) {
    MMO_Core_Players.Players[payload.playerId]._characterName = payload.playerData["skin"]["characterName"];
    MMO_Core_Players.Players[payload.playerId]._characterIndex = payload.playerData["skin"]["characterIndex"];
  });

  socket.on('player_moving', function(data){
    if(!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) return;

    // Update movement speed and frequenzy
    MMO_Core_Players.Players[data.id].setMoveSpeed(data.moveSpeed);
    MMO_Core_Players.Players[data.id].setMoveFrequency(data.moveFrequency);
    MMO_Core_Players.Players[data.id].moveStraight(data.direction);
    if (MMO_Core_Players.Players[data.id].x !== data.x || MMO_Core_Players.Players[data.id].y !== data.y) MMO_Core_Players.Players[data.id].setPosition(data.x, data.y);
  });

  socket.on("player_update_switch", function(data){
    $gameSwitches["_data"][data["switchId"]] = data["value"]; // Bypass the setValue function.
    Game_Switches.prototype.onChange();
  });

  socket.on("player_respawn", function(payload) {
    $gamePlayer.reserveTransfer(payload["mapId"], payload["x"], payload["y"]);
    SceneManager.goto(Scene_Map);
  })

  // ---------------------------------------
  // ---------- Exposed Functions
  // ---------------------------------------
  
  MMO_Core_Players.savePlayerStats = function() {
    let equips = [];
    for(var i = 0; i < $gameActors["_data"][1]["_equips"].length; i++) {
      equips.push($gameActors["_data"][1]["_equips"][i]["_itemId"])
    }

    socket.emit("player_update_stats", {
      hp: $gameActors["_data"][1]["_hp"],
      mp: $gameActors["_data"][1]["_mp"],
      equips: equips,
      skills: $gameActors["_data"][1]["_skills"],
      level: $gameActors["_data"][1]["_level"],
      exp: $gameActors["_data"][1]["_exp"],
      gold: $gameParty["_gold"],
      items: $gameParty["_items"],
      armors: $gameParty["_armors"],
      weapons: $gameParty["_weapons"],
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