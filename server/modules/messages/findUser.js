exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  exports.use = async function(args, initiator) {
    let players = await MMO_Core["socket"].modules["player"].subs["player"].getPlayers();
    let player = {};

    if(args.length === 1) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `There is ${Object.keys(players).length} person(s) online now!`, "action");
    if(players[args[1]] === undefined) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Could not find the user.`, "error");    

    player = players[args[1]];

    return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `${player.playerData.username} is level ${player.playerData.stats.level}!`, "action");
  }
}