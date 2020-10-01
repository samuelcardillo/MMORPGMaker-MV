/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (initiator.isInParty === false) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You are not in a party.", "error");
        }

        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You left the party!", "action");
        MMO_Core.socket.modules.player.subs.party.leaveParty(initiator);
    };

    // ---------------------------------------
    // ---------- NODEJS RECEIVER AND EMITTER
    // ---------------------------------------

    MMO_Core.socket.serverEvent.on("player-left-party", (payload) => {
        MMO_Core.socket.modules.messages.sendToParty(payload.partyName, "System", `${payload.player.playerData.username} left the party!`, "action");
    });
};
