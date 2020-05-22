/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, player) {
        if (args.length <= 2) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "Not enough arguments.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();
        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "Could not find the player.", "error");
        }

        let message = "";
        for (let i = 2; i < args.length; i++) {
            message = message + " " + args[i];
        }

        MMO_Core.socket.modules.messages.sendToPlayer(player, "(Whisp) " + player.playerData.username, message, "whisper");
        MMO_Core.socket.modules.messages.sendToPlayer(players[targetsName], "(Whisp) " + player.playerData.username, message, "whisper");
    };
};
