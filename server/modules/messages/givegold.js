/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (args.length <= 2) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }

        const targetsName = args[1].toLowerCase();
        if (targetsName === initiator.playerData.username) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You can't give money to yourself.", "error");
        }
        if (isNaN(args[2])) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Amount is not valid.", "error");
        }
        if (args[2] > initiator.playerData.stats.gold) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Amount is not valid.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();

        if (players[targetsName] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the player.", "error");
        }

        initiator.playerData.stats.gold -= parseInt(args[2]);
        players[targetsName].playerData.stats.gold += parseInt(args[2]);

        // We save the new datas
        MMO_Core.database.savePlayer({ username: initiator.playerData.username, stats: initiator.playerData.stats }, (e) => {
            MMO_Core.socket.modules.player.subs.player.refreshData(initiator); // We ask to refresh the data of the player
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${args[2]} gold to ${players[targetsName].playerData.username}!`, "action");
        });

        // Same for the receive
        MMO_Core.database.savePlayer({ username: players[targetsName].playerData.username, stats: players[targetsName].playerData.stats }, (e) => {
            MMO_Core.socket.modules.player.subs.player.refreshData(players[targetsName]);
            MMO_Core.socket.modules.messages.sendToPlayer(players[targetsName], "System", `${initiator.playerData.username} gave you ${args[2]} gold!`, "action");
        });
    };
};
