/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (args.length <= 2) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }
        if (initiator.playerData.permission < 100) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();
        const targetsName = args[1].toLowerCase();

        if (players[targetsName] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the player.", "error");
        }
        if (isNaN(args[2])) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Amount is not valid.", "error");
        }
        if (args[2] > 1000000) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Amount is above 1,000,000.", "error");
        }

        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${args[2]} gold to ${players[targetsName].playerData.username}!`, "action");
        players[targetsName].playerData.stats.gold += parseInt(args[2]);

        // We save the new datas
        MMO_Core.database.savePlayer({ username: players[targetsName].playerData.username, stats: players[targetsName].playerData.stats }, (e) => {
            MMO_Core.socket.modules.player.subs.player.refreshData(players[targetsName]);
            MMO_Core.socket.modules.messages.sendToPlayer(players[targetsName], "System", `${initiator.playerData.username} gave you ${args[2]} gold!`, "action");
        });
    };
};
