var io = null;

exports.initialize = function() { 
  io = MMO_Core["socket"].socketConnection;

  MMO_Core["socket"].loadModules("messages", true).then(() => {
    console.log("[I] Sub modules of messages loaded.")
  })

  io.on("connect", function(client) {
    client.on("new_message",function(message){
      if(client.playerData === undefined) return;

      if(message.indexOf('/') === 0) return checkCommand(message.substr(1, message.length), client);

      exports.sendToMap(client.lastMap, client.playerData["username"], message, client.id);
    })
  })
}

// ---------------------------------------
// ---------- EXPOSED FUNCTIONS
// ---------------------------------------

exports.sendToMap = function(map, username, message, senderId) {
  let payload = {
    username: username,
    msg: message
  };
  if(senderId) payload.senderId = senderId;

  io.in(map).emit("new_message", payload);
  
}

exports.sendToAll = function(username, message) {
  io.emit("new_message", {username: username, msg: message});
}

exports.sendToPlayer = function(player, username, message) {
  player.emit("new_message", {username: username, msg: message});
}

// ---------------------------------------
// ---------- PRIVATE FUNCTIONS
// ---------------------------------------

function checkCommand(command, player) {
  let args = command.split(" ");

  for(var existingCommand in MMO_Core["socket"].modules["messages"].subs) {
    if(args[0].toLowerCase() != existingCommand.toLowerCase()) continue;
    
    MMO_Core["socket"].modules["messages"].subs[existingCommand].use(args, player);
  }
}