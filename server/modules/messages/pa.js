/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, player) {
        if (args.length <= 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "Not enough arguments.", "error");
        }
        if (player.isInParty === false) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "You are not in a party.", "error");
        }

        let message = "";
        const playerName = player.isInParty;

        for (let i = 1; i < args.length; i++) {
            message = message + " " + args[i];
        }

        MMO_Core.socket.modules.messages.sendToParty(playerName, "(Party) " + player.playerData.username, message);
    };
};
