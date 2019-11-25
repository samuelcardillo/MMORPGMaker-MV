exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  exports.use = async function(args, initiator) {
    if(args.length <= 2) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", "Not enough arguments.", "error");    
    if(initiator.playerData["permission"] < 100) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");

    let players = await MMO_Core["socket"].modules["player"].subs["player"].getPlayers().catch((e) => {console.log(e)});
    let player = {};
  
    if(players[args[1]] === undefined) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Could not find the player.`, "error");    
    if(isNaN(args[2])) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Amount is not valid.`, "error");    
    if(args[2] > 1000000) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Amount is above 1,000,000.`, "error");    
    
    console.log("Admin " + initiator.playerData.username + " gave " + args[2] + " gold to " + players[args[1]].playerData.username + "!");
	MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You gave ${args[2]} gold to ${players[args[1]].playerData.username}!`, "action");
    players[args[1]].playerData.stats.gold += parseInt(args[2]);

    // We save the new datas
    MMO_Core["database"].savePlayer({username: players[args[1]].playerData.username, stats: players[args[1]].playerData.stats}, (e) => {
      MMO_Core["socket"].modules["player"].subs["player"].refreshData(players[args[1]]);
      MMO_Core["socket"].modules["messages"].sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${args[2]} gold!`, "action");
    })

    return;
  }
}
