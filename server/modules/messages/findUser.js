/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();

        if (args.length === 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `There is ${Object.keys(players).length} person(s) online now!`, "action");
        }

        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the user.", "error");
        }

        return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `${players[targetsName].playerData.username} is level ${players[targetsName].playerData.stats.level}!`, "action");
    };
};
