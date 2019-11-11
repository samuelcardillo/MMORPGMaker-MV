exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  exports.use = async function(args, initiator) {
    if(args.length <= 2) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", "Not enough arguments.");

    let players = await MMO_Core["socket"].modules["player"].subs["player"].getPlayers().catch((e) => {console.log(e)});
    let player = {};

    if(args[1] === initiator.playerData.username) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You can't give money to yourself.`);
    if(players[args[1]] === undefined) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Could not find the player.`);
    if(isNaN(args[2])) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Amount is not valid.`);
    if(args[2] > initiator.playerData.stats.gold) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Amount is not valid.`);
    
    initiator.playerData.stats.gold -= parseInt(args[2]);
    players[args[1]].playerData.stats.gold += parseInt(args[2]);

    // We save the new datas
    MMO_Core["database"].savePlayer({username: initiator.playerData.username, stats: {gold: initiator.playerData.stats.gold}}, (e) => {
      MMO_Core["socket"].modules["player"].subs["player"].refreshData(initiator); // We ask to refresh the data of the player
      MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You gave ${args[2]} gold to ${players[args[1]].playerData.username}!`);
    })

    // Same for the receive
    MMO_Core["database"].savePlayer({username: players[args[1]].playerData.username, stats: {gold: players[args[1]].playerData.stats.gold}}, (e) => {
      MMO_Core["socket"].modules["player"].subs["player"].refreshData(players[args[1]]);
      MMO_Core["socket"].modules["messages"].sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${args[2]} gold!`);
    })


    return;
  }
}