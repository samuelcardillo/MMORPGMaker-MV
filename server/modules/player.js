/* global MMO_Core */
exports.initialize = function(io) {
    MMO_Core.socket.loadModules("player", true).then(() => {
        console.log("[I] Sub modules of player loaded.");
    });
};
