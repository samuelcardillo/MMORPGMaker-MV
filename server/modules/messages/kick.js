/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (args.length <= 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }
        if (initiator.playerData.permission < 50) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to kick a player.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers().catch((e) => {
            console.log(e);
        });
        let player = {};

        if (players[args[1]] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the player.", "error");
        }

        player = players[args[1]];

        MMO_Core.socket.modules.messages.sendToAll("System", `${player.playerData.username} was kicked!`, "error");

        return player.disconnect();
    };
};
