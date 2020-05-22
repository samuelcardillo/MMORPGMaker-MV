/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, player) {
        if (args.length <= 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "Not enough arguments.", "error");
        }

        let message = "";
        for (let i = 1; i < args.length; i++) {
            message = message + " " + args[i];
        }

        MMO_Core.socket.modules.messages.sendToAll("(World) " + player.playerData.username, message, "global");
    };
};
