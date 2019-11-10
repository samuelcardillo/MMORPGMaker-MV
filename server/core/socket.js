var exports = module.exports = {};

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.initialize = function(socketConfig, serverConfig) {
  var io = socketConfig;
  var SERVER_CONFIG = serverConfig;

  console.log("[I] Socket.IO server started on port " + SERVER_CONFIG["port"] + " ...");

  io.on("connect", function(client){

    // Handle in-game user login and registration
    // Expect : data : {username, password (optional)}
    client.on("login",function(data){
      if(data["username"] === undefined) return loginError(client, "Missing username");
      if(MMO_Core["database"].SERVER_CONFIG["passwordRequired"] && data["password"] === undefined) return loginError(client, "Missing password");        

      MMO_Core["database"].findUser(data, function(output) {
        // If user exist
        if(output[0] !== undefined) {
          // If passwordRequired is activated then we check for password
          if(MMO_Core["database"].SERVER_CONFIG["passwordRequired"]) {
            if(MMO_Core["security"].hashPassword(data["password"].toLowerCase()) !== output[0]["password"].toLowerCase()) return loginError(client, "Wrong password");
          }

          return loginSuccess(client, output[0]);
        }

        // If user doesn't exist
        MMO_Core["database"].registerUser(data, function(output){
          MMO_Core["database"].findUser(data, function(output){
            loginSuccess(client, output[0]);
          });
        });
      })
    });
  
    client.on("map_joined",function(playerData) {
      if(client.playerData === undefined) return;
      
      if(client.lastMap != undefined && client.lastMap != "map-" + playerData.mapId) {
        if(SERVER_CONFIG["offlineMaps"][client.lastMap] == undefined) client.broadcast.to(client.lastMap).emit('map_exited',client.id);
        client.leave(client.lastMap);

        console.log(client.id + " left " + client.lastMap);
      }
  
      playerData.username = client.playerData.username; // Temporary way to pass the username
      playerData.skin     = client.playerData.skin;

      // Storing the new location (in case of disconnecting on a local map)
      client.playerData.x     = playerData.x;
      client.playerData.y     = playerData.y;
      client.playerData.mapId = playerData.mapId;

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
      
      console.log(client.id + " joined " + client.lastMap);
    })
  
    client.on("refresh_players_position", function(data){
      if(client.playerData === undefined) return;
      
      if(SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;

      console.log(client.id + " transmit position to " + data.id);
  
      data["playerData"].username = client.playerData.username; // Temporary way to pass the username
      data["playerData"].skin     = client.playerData.skin;
  
      client.broadcast.to(data["id"]).emit("map_joined",{id:client.id,playerData:data["playerData"]});
    })

    client.on("refresh_player_on_map", function() {
      if(client.playerData === undefined) return;

      client.broadcast.to("map-" + client.playerData["mapId"]).emit("refresh_player_on_map", {playerId: client.id, playerData: client.playerData});   
    })
  
    client.on("player_update_switches", function(payload) {
      if(client.playerData === undefined) return;

      client.playerData["switches"] = payload;
    })

    client.on("player_global_switch_check", function(payload) {
      if(client.playerData === undefined) return;

      if(SERVER_CONFIG["globalSwitches"][payload["switchId"]] === undefined) return;

      SERVER_CONFIG["globalSwitches"][payload["switchId"]] = payload["value"];
      MMO_Core["database"].saveConfig(SERVER_CONFIG);

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
      client.playerData.isBusy = payload;

      client.broadcast.to("map-" + client.playerData["mapId"]).emit("refresh_player_on_map", {playerId: client.id, playerData: client.playerData});  
    })
  
    client.on("player_moving",function(payload){
      if(client.playerData === undefined) return;

      if(SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;
  
      payload.id = client.id;
  
      client.playerData["x"] = payload["x"];
      client.playerData["y"] = payload["y"];
      client.playerData["mapId"] = payload["mapId"];
  
      client.broadcast.to(client.lastMap).emit("player_moving", payload);
    })
  
    client.on("new_message",function(message){
      if(client.playerData === undefined) return;

      io.in(client.lastMap).emit("new_message",{username:client.playerData["username"],msg:message});
    })

    client.on("player_dead", function() {
      if(client.playerData === undefined) return;
      
      client.emit("player_respawn", {mapId: SERVER_CONFIG["newPlayerDetails"]["mapId"], x: SERVER_CONFIG["newPlayerDetails"]["x"], y: SERVER_CONFIG["newPlayerDetails"]["y"]})
    })
  
    client.on("disconnect",function(){
      if(client.lastMap == undefined) return;

      client.playerData.isBusy = false; // Putting isBusy back to false to prevent false player state
  
      MMO_Core["database"].savePlayer(client.playerData, function(output){
        client.broadcast.to(client.lastMap).emit('map_exited',client.id);
        client.leave(client.lastMap);
      });
    })
  })
};

// Connecting the player and storing datas locally
function loginSuccess(client, details) {

  // We remove the things we don't want the user to see
  delete details.password;

  // Then we continue
  client.emit("login_success",{msg: details})
  client.playerData = details;
  console.log(client.id + " connected to the game");
}

// Sending error in case of failure at login 
function loginError(client, message) {
  client.emit("login_error", {msg: message})
}