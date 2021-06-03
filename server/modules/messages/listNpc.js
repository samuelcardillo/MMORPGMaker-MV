/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");
        }
        if (!MMO_Core["gameworld"].getSummonMap()) {
            return MMO_Core.socket.modules.messages.sendToPlayer(player, "System", "The server has no spawnMap.", "error");
        }

        const _print = (string) => MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", string, "action")

        const idList = MMO_Core["gameworld"].spawnedUniqueIds;
        _print("Spawned NPC List :");

        for (let index in idList) {
            const _npc = MMO_Core["gameworld"].getNpcByUniqueId(idList[index]);
            if (_npc) {
                const mapId = _npc.mapId;
                const x = _npc.x;
                const y = _npc.y;
                _print(`[index: ${index}] ${idList[index]} on Map ${mapId} at (X ${x};Y ${y})`);
            }
        }
    };
};
