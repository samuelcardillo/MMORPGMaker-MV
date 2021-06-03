/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");
        }
        if (args.length < 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "Not enough arguments.", "error");
        }
        if (!MMO_Core["gameworld"].getSummonMap()) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "The server has no spawnMap.", "error");
        }

        const removedId = MMO_Core["gameworld"].removeConnectedNpcByIndex(args[1]);

        if (removedId) return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You removed NPC ${removedId}`, "action");
    };
};
