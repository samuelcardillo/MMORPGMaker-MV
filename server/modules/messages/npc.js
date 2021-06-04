/* global MMO_Core */
exports.initialize = function() {
    exports.use = async function(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");
        }
        if (args.length < 1) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }
        if (!MMO_Core["gameworld"].getSummonMap()) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "The server has no spawnMap.", "error");
        }

        const mode = args[1];

        if (mode === "add" || mode === "spawn" || mode === "a" || mode === "s") {
            const summonId = parseInt(args[2]);
            const coords = {
                mapId: parseInt(args[3]) || initiator.playerData.mapId,
                x: parseInt(args[4]) || initiator.playerData.x,
                y: parseInt(args[5]) || initiator.playerData.y,
            }
            const pageIndex = args[5] ? parseInt(args[5]) : 0;        
            const summonedId = MMO_Core["gameworld"].spawnNpc(summonId, coords, pageIndex, initiator);
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `Spawned NPC [index: ${summonedId}]`, "action");
        }
        else if (mode === "remove" || mode === "delete" || mode === "rm" || mode == "del") {
            const removedId = MMO_Core["gameworld"].removeSpawnedNpcByIndex(args[2]);
            if (removedId) return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You removed NPC ${removedId}`, "action");
        }
        else {
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
        }
    };
};
