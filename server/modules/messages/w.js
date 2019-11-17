exports.initialize = function() {

  exports.use = async function(args, player) {
    if(args.length <= 2) return MMO_Core["socket"].modules["messages"].sendToPlayer(player, "System", "Not enough arguments.", "error");

    let players = await MMO_Core["socket"].modules["player"].subs["player"].getPlayers().catch((e) => {console.log(e)});
    if(players[args[1]] === undefined) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Could not find the player.`, "error");

    let message = "";
    for(var i = 2; i < args.length; i++) { 
      message = message + " " + args[i];
    }

    MMO_Core["socket"].modules["messages"].sendToPlayer(player, "(Whisp) " + player.playerData.username, message, "whisper")
    MMO_Core["socket"].modules["messages"].sendToPlayer(players[args[1]], "(Whisp) " + player.playerData.username, message, "whisper")

    return;
  }
}