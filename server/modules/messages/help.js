/* global MMO_Core */
exports.initialize = function(io) {
    exports.use = function(args, initiator) {
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "---- Available commands :", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/changePassword [old] [new]", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/findUser [username]", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/givegold [username] [amount]", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/joinparty [username]", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/leaveparty", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/pa [message]", "action");
        MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/w [username] [message]", "action");

        if (initiator.permission > 50) {
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/kick [username]", "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/npc add [eventId] [mapId] [x] [y]", "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/npc remove [index]", "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "/nodes", "action");
        }
    };
};
