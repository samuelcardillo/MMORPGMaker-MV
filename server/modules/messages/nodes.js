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

    const _print = (string) => MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", string, "action");
    const nodes = await MMO_Core["gameworld"].nodes;
    if (nodes && nodes.length) {
      _print('/nodes = (coordinates, id) =>');
      console.log('/nodes => [');
      for (let node of nodes) {
        const mapId = node.mapId >= 0 ? node.mapId.toString() : "";
        const x = node.x >= 0 ? node.x.toString() : "";
        const y = node.y >= 0 ? node.y.toString() : "";
        const coords = mapId && x && y && ` [${mapId},${x},${y}]` || '[WORLD]';
        _print(`${coords} ${node.playerId || node.npcUniqueId || node.instanceUniqueId || node.uniqueId}`);
        console.log(node);
      }
      console.log(']');
    } else _error("/nodes = (coordinates, id) => NONE");

  };
};
