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

        const summonId = parseInt(args[1]);
        const coords = {
            mapId: parseInt(args[2]) || initiator.playerData.mapId,
            x: parseInt(args[3]) || initiator.playerData.x,
            y: parseInt(args[4]) || initiator.playerData.y,
        }
        const pageIndex = args[5] ? parseInt(args[5]) : 0;        

        const summonedId = MMO_Core["gameworld"].spawnNpc(summonId, coords, pageIndex);

        return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `Spawned NPC ${summonedId}`, "action");
    };
};
