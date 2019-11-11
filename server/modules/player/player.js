exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  io.on("connect", function(client) {
  
    client.on("player_update_switches", function(payload) {
      if(client.playerData === undefined) return;
  
      client.playerData["switches"] = payload;
    })
  
    client.on("player_global_switch_check", function(payload) {
      if(client.playerData === undefined) return;
  
      if(MMO_Core["database"].SERVER_CONFIG["globalSwitches"][payload["switchId"]] === undefined) return;
  
      MMO_Core["database"].SERVER_CONFIG["globalSwitches"][payload["switchId"]] = payload["value"];
      MMO_Core["database"].saveConfig();
  
      client.broadcast.emit("player_update_switch", payload);
    })
  
    client.on("player_update_stats", function(payload) {
      if(client.playerData === undefined) return;
  
      client.playerData["stats"] = payload;
    })
  
    client.on("player_update_skin", function(payload) {
      if(client.playerData === undefined) return;
  
      switch (payload["type"]) {
        case "sprite":
          client.playerData["skin"]["characterName"] = payload["characterName"];
          client.playerData["skin"]["characterIndex"] = payload["characterIndex"];
          break;
        case "face": 
          client.playerData["skin"]["faceName"] = payload["faceName"];
          client.playerData["skin"]["faceIndex"] = payload["faceIndex"];      
          break;
        case "battler": 
          client.playerData["skin"]["battlerName"] = payload["battlerName"];
          break;
      }
    })
  
    client.on("player_update_busy", function(payload) {
      if(client.playerData === undefined) return;

      client.playerData.isBusy = payload;
  
      client.broadcast.to("map-" + client.playerData["mapId"]).emit("refresh_player_on_map", {playerId: client.id, playerData: client.playerData});  
    })
  
    client.on("player_moving",function(payload){
      if(client.playerData === undefined) return;
  
      if(MMO_Core["database"].SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;
  
      payload.id = client.id;
  
      client.playerData["x"] = payload["x"];
      client.playerData["y"] = payload["y"];
      client.playerData["mapId"] = payload["mapId"];
  
      client.broadcast.to(client.lastMap).emit("player_moving", payload);
    })
  
    client.on("player_dead", function() {
      if(client.playerData === undefined) return;
      
      client.emit("player_respawn", {mapId: MMO_Core["database"].SERVER_CONFIG["newPlayerDetails"]["mapId"], x: MMO_Core["database"].SERVER_CONFIG["newPlayerDetails"]["x"], y: MMO_Core["database"].SERVER_CONFIG["newPlayerDetails"]["y"]})
    })
  })
}

// ---------------------------------------
// ---------- EXPOSED FUNCTIONS
// ---------------------------------------

exports.getPlayers = async function(map) {
  map = map || false;

  let sockets = await MMO_Core["socket"].getConnectedSockets(map);
  let players = {};

  for(var i = 0; i < sockets.length; i++) {
    players[sockets[i].playerData.username] = sockets[i];

    if(i === sockets.length-1) return players;
  }
}

exports.refreshData = function(player) {
  MMO_Core["database"].findUserById(player.playerData.id, (results) => {
    delete results.password; // We delete the password from the result sent back

    player.emit("refresh_player_data", results);
  })
}