//=============================================================================
// MMO_Core_Players.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Players
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

function MMO_Core_Players() {
  this.initialize.apply(this, arguments);
}

(function () {
  MMO_Core_Players.Players  = {};
  
  MMO_Core.socket.on("map_joined", function(data){
    if(MMO_Core_Players.Players[data.id] !== undefined && $gameMap._events[MMO_Core_Players.Players[data.id]["_eventId"]] !== undefined) $gameMap.eraseEvent(MMO_Core_Players.Players[data.id]["_eventId"]);

    MMO_Core_Players.Players[data.id] = $gameMap.createNormalEventAt(data["playerData"]["skin"]["characterName"], data["playerData"]["skin"]["characterIndex"], data["playerData"]["x"], data["playerData"]["y"], 2, 0, true);
    MMO_Core_Players.Players[data.id].headDisplay = MMO_Core_Players.Players[data.id].list().push({"code":108,"indent":0,"parameters":["<Name: " + data["playerData"]["username"] + ">"]});
    MMO_Core_Players.Players[data.id]._priorityType = 0;
    MMO_Core_Players.Players[data.id]._stepAnime = false;
    MMO_Core_Players.Players[data.id]._moveSpeed = 4;

    if(MMO_Core_Party.Party.length > 0 && !MMO_Core_Player.Player.isInCombat) {
      for(var i = 0; i < MMO_Core_Party.Party.length; i++) {
        if(MMO_Core_Party.Party[i].username != data["playerData"]["username"]) continue;
        if(!MMO_Core_Party.Party[i].isInCombat) continue;

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
    MMO_Core.socket.emit("refresh_players_position",{id: data, playerData: MMO_Core_Player.getPlayerPos()});
  })

  MMO_Core.socket.on("refresh_players_on_map", function(payload) {
    if(MMO_Core_Players.Players[payload.playerId] === undefined) return;

    MMO_Core_Players.Players[payload.playerId]._characterName = payload.playerData["skin"]["characterName"];
    MMO_Core_Players.Players[payload.playerId]._characterIndex = payload.playerData["skin"]["characterIndex"];

    if(MMO_Core_Players.Players[payload.playerId]._isBusy !== payload.playerData["isBusy"]) {
      MMO_Core_Players.Players[payload.playerId]._isBusy = payload.playerData["isBusy"] || false;    
    } 

    document.dispatchEvent(new Event('refresh_players_on_map', {'detail': payload})); // Dispatch DOM event for external plugins
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

  MMO_Core_Players.refreshPlayersOnMap = function() {
    MMO_Core.socket.emit("refresh_players_on_map");
  }
})();