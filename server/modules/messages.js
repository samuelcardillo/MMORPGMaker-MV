exports.initialize = function(io) { 
  io.on("connect", function(client) {
    client.on("new_message",function(message){
      if(client.playerData === undefined) return;
  
      io.in(client.lastMap).emit("new_message",{username:client.playerData["username"],msg:message});
    })
  })
}