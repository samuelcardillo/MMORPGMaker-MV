/* global MMO_Core */
exports.initialize = function(io) {
    exports.use = function(args, initiator) {
        if (args.length < 3) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }

        const oldPassword = MMO_Core.security.hashPassword(args[1].toLowerCase());
        const newPassword = MMO_Core.security.hashPassword(args[2].toLowerCase());

        MMO_Core.database.findUser({ username: initiator.playerData.username }, function(output) {
            if (oldPassword !== output[0].password) {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Wrong old password.", "error");
            }

            const payload = {
                username: initiator.playerData.username,
                password: newPassword
            };

            MMO_Core.database.savePlayer(payload, function(output) {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Password changed with success!", "action");
            });
        });
    };
};
