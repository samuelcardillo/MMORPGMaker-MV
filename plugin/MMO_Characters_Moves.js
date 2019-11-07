//=============================================================================
// MMO_Characters_Moves.js
//=============================================================================

/*:
 * @plugindesc MMORPG plugin
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {
  // Overwriting
  DataManager.setupNewGame = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(isLogged["mapId"],isLogged["x"],isLogged["y"]);
    $gameSystem.disableMenu();
    Graphics.frameCount = 0;
  };

  Scene_Map.prototype.onMapLoaded = function() {
    if (this._transfer) {
      $gamePlayer.performTransfer();
    }
    this.createDisplayObjects();

    $gamePlayer._characterIndex = isLogged["skin"];

    players = {}; // Reinit the player variable
    if(isLogged["logged"] == undefined) {
      $dataActors[1].characterIndex = isLogged["skin"];
      isLogged["logged"] = true;
      ChatBox.generate();
    }

    socket.emit("map_joined",getPlayerPos());
  }

  socket.on("map_joined",function(data){
    players[data.id] = $gameMap.createNormalEventAt("Actor1", data["playerData"]["skin"], data["playerData"]["x"], data["playerData"]["y"], 2, 0, true);
    players[data.id].headDisplay = players[data.id].list().push({"code":108,"indent":0,"parameters":["<Mini Label: " + data["playerData"]["username"] + ">"]});
    players[data.id].list().push({"code":408,"indent":0,"parameters":["<Mini Label Range: 5>"]});
    players[data.id]._stepAnime = false;
    players[data.id]._moveSpeed = 4;
  })

  socket.on("map_exited",function(data){
    $gameMap.eraseEvent(players[data]["_eventId"]);
  })

  socket.on("refresh_players_position",function(data){
    socket.emit("refresh_players_position",{id:data,playerData:getPlayerPos()});
  })

  socket.on("player_start_moving",function(data){
    playerMoving = players[data.id]
    switch(data.keyCode) {
      case 37:
        playerMoving._direction = 4;
        break;
      case 38:
        playerMoving._direction = 8;
        break;
      case 39:
        playerMoving._direction = 6;
        break;
      case 40:
        playerMoving._direction = 2;
        break;
    }

    players[data.id]._stepAnime = true;
    moveNPC(players[data.id],playerMoving._direction);
    // players[data.id].moveStraight(playerMoving._direction);
    players[data.id]["movingInterval"] = setInterval(function(){
      moveNPC(players[data.id],playerMoving._direction);
      // players[data.id].moveStraight(playerMoving._direction);
    },2); // 250
  })

  socket.on("player_stop_moving",function(data){
    clearInterval(players[data.id]["movingInterval"]);
    players[data.id]._stepAnime = false;
    teleportPlayer(players[data.id],data["playerData"]["x"],data["playerData"]["y"]);
  })

  function getPlayerPos() {
    var position = {
      x: $gamePlayer["_x"],
      y: $gamePlayer["_y"],
      mapId: $gameMap["_mapId"]
    }

    return position;
  }

  // 37 & 39 = gauche droite
    // 38 & 40 = haut bas
  function moveNPC(npc,direction) {
    var coordinates = {
      x: npc._x,
      y: npc._y
    };

    switch(direction) {
      case 4: // gauche
        coordinates["x"] = npc._x - 0.064;
        break;
      case 8: // haut
        coordinates["y"] = npc._y - 0.064;
        break;
      case 6: // droite
        coordinates["x"] = npc._x + 0.064;
        break;
      case 2: // bas
        coordinates["y"] = npc._y + 0.064;
        break;
    }

    teleportPlayer(npc,coordinates["x"],coordinates["y"]);
  }

  function teleportPlayer($player,$x,$y) {
    $player._realX = $x;
    $player._realY = $y;
    $player._x = $x;
    $player._y = $y;
    return true;
  }

  Input._onKeyDown = function(event) {
    if((event.keyCode >= 37 && event.keyCode <= 40) && !isMoving) {
      socket.emit("player_start_moving",event.keyCode);
      isMoving = true;
    }

    if (this._shouldPreventDefault(event)) {
        event.preventDefault();
    }
    if (event.keyCode === 144) {    // Numlock
        this.clear();
    }
    var buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = true;
    }
  };

  Input._onKeyUp = function(event) {
    if((event.keyCode >= 37 && event.keyCode <= 40) && isMoving) {
      socket.emit("player_stop_moving",getPlayerPos());
      isMoving = false;
    }

    var buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = false;
    }
    if (event.keyCode === 0) {  // For QtWebEngine on OS X
        this.clear();
    }
  };

  TouchInput._onTouchStart = function(event) {
    return true;
  };
})();