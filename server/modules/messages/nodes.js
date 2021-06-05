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
      for (let node of nodes) console.log(node);
      _print(`Printed to server console`);
    }

  };
};
