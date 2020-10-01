/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (args.length <= 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }
        const targetsName = args[1].toLowerCase();
        if (targetsName === initiator.playerData.username.toLowerCase()) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You can't join your own party.", "error");
        }
        if (initiator.isInParty) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You are already in a party.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();
        const target = players[targetsName];
        if (target === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the player.", "error");
        }
        if (target.playerData.isBusy === "combat") {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You can't join a player in combat.", "error");
        }

        // We check if the player we try to join is a party leader or not.
        if (target.isInParty) {
            const partyLeader = await MMO_Core.socket.modules.player.subs.party.getPartyLeader(target.isInParty);
            if (partyLeader.id !== target.id) {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "He is not the party leader.", "error");
            }
        }

        MMO_Core.socket.modules.player.subs.party.joinParty(initiator, target);
    };

    // ---------------------------------------
    // ---------- NODEJS RECEIVER AND EMITTER
    // ---------------------------------------

    MMO_Core.socket.serverEvent.on("player-joined-party", (payload) => {
        MMO_Core.socket.modules.messages.sendToParty(payload.partyName, "System", `${payload.player.playerData.username} joined the party!`, "action");
    });
};
