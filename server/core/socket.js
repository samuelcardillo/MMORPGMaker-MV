var exports = module.exports = {};

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.initialize = function(socketConfig, serverConfig) {
  var io = socketConfig;
  var SERVER_CONFIG = serverConfig;

  console.log("[I] Socket.IO server started on port " + SERVER_CONFIG["port"] + " ...");

  io.on("connect",function(client){
    client.on("login",function(data){
      MMO_Core["database"].findUser(data["username"], function(output){
        if(output[0] == undefined) {
          if(!SERVER_CONFIG["registrationOnTheFly"]) return false;
          MMO_Core["database"].registerUser(data["username"], SERVER_CONFIG["newPlayerDetails"], function(output){
            MMO_Core["database"].findUser(data["username"], function(output){
              loginPlayer(client, output[0]);
            });
          });
          return;
        }
  
        loginPlayer(client,output[0]);
      })
    });
  
    client.on("map_joined",function(playerData){
      if(client.lastMap != undefined) {
        if(SERVER_CONFIG["offlineMaps"][client.lastMap] == undefined) {
          client.broadcast.to(client.lastMap).emit('map_exited',client.id);
        }
        client.leave(client.lastMap);
        console.log(client.id + " left " + client.lastMap);
      }
  
      playerData.username = client.playerData.username; // Temporary way to pass the username
      playerData.skin     = client.playerData.skin;

      // Update global switches
      for(var key in SERVER_CONFIG["globalSwitches"]) {
        client.emit("player_update_switch", {switchId: key, value: SERVER_CONFIG["globalSwitches"][key]});
      }
  
      client.join("map-" + playerData["mapId"]);
      client.lastMap = "map-" + playerData["mapId"];
      
      if(SERVER_CONFIG["offlineMaps"][client.lastMap] == undefined) {
        client.broadcast.to("map-" + playerData["mapId"]).emit("map_joined",{id:client.id,playerData:playerData});
        client.broadcast.to("map-" + playerData["mapId"]).emit("refresh_players_position", client.id);
      }
    
      console.log(client.id + " joined map-" + client.lastMap);
    })
  
    client.on("refresh_players_position", function(data){
      if(SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;
  
      console.log(client.id + " transmit position to " + data.id);
  
      data["playerData"].username = client.playerData.username; // Temporary way to pass the username
      data["playerData"].skin     = client.playerData.skin;
  
      client.broadcast.to(data["id"]).emit("map_joined",{id:client.id,playerData:data["playerData"]});
    })

    client.on("refresh_player_on_map", function() {
      client.broadcast.to("map-" + client.playerData["mapId"]).emit("refresh_player_on_map", {playerId: client.id, playerData: client.playerData});   
    })
  
    client.on("player_update_switches", function(payload) {
      if(client.playerData === undefined) return;
      client.playerData["switches"] = payload;
    })

    client.on("player_global_switch_check", function(payload) {
      if(SERVER_CONFIG["globalSwitches"][payload["switchId"]] === undefined) return;

      SERVER_CONFIG["globalSwitches"][payload["switchId"]] = payload["value"];
      MMO_Core["database"].saveConfig(SERVER_CONFIG);

      client.broadcast.emit("player_update_switch", payload);
    })
  
    client.on("player_update_stats", function(payload) {
      client.playerData["stats"] = payload;
    })

    client.on("player_update_skin", function(payload) {
      client.playerData["skin"] = payload;
    })
  
    client.on("player_moving",function(payload){
      if(client.playerData === undefined) return;
      if(SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;
  
      payload.id = client.id;
  
      client.playerData["x"] = payload["x"];
      client.playerData["y"] = payload["y"];
      client.playerData["mapId"] = payload["mapId"];
  
      client.broadcast.to(client.lastMap).emit("player_moving", payload);
    })
  
    client.on("new_message",function(message){
      io.in(client.lastMap).emit("new_message",{username:client.playerData["username"],msg:message});
    })
  
    client.on("disconnect",function(){
      if(client.lastMap == undefined) return;
  
      MMO_Core["database"].savePlayer(client.playerData, function(output){
        client.broadcast.to(client.lastMap).emit('map_exited',client.id);
        client.leave(client.lastMap);
      });
    })
  })
};

// Connecting the player and storing datas locally
function loginPlayer(client, details) {
  client.emit("login",{msg: details})
  client.playerData = details;
  console.log(client.id + " connected to the game");
}