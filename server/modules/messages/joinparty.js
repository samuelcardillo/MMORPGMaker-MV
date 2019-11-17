exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  exports.use = async function(args, initiator) {
    if(args.length <= 1) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", "Not enough arguments.", "error");    

    let players = await MMO_Core["socket"].modules["player"].subs["player"].getPlayers().catch((e) => {console.log(e)});

    if(args[1] === initiator.playerData.username) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You can't join your own party.`, "error");       
    if(initiator.isInParty) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You are already in a party.`, "error");    
    if(players[args[1]] === undefined) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `Could not find the player.`, "error");    
    if(players[args[1]].playerData.isBusy === "combat") return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `You can't join a player in combat.`, "error");    
    
    // We check if the player we try to join is a party leader or not.
    if(players[args[1]].isInParty) { 
      let partyLeader = await MMO_Core["socket"].modules["player"].subs["party"].getPartyLeader(players[args[1]].isInParty);
      if(partyLeader.id !== players[args[1]].id) return MMO_Core["socket"].modules["messages"].sendToPlayer(initiator, "System", `He is not the party leader.`, "error");    
    }

    MMO_Core["socket"].modules["player"].subs["party"].joinParty(initiator, players[args[1]]);
    return;
  }

  // ---------------------------------------
  // ---------- NODEJS RECEIVER AND EMITTER
  // ---------------------------------------

  MMO_Core["socket"].serverEvent.on("player-joined-party", (payload) => {
    MMO_Core["socket"].modules["messages"].sendToParty(payload.partyName, "System", `${payload.player.playerData.username} joined the party!`, "action");
  });
}