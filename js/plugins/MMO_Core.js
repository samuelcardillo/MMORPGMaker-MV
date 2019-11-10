//=============================================================================
// MMO.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core
 * @author Samuel LESPES CARDILLO
 *
 * @help Change the server location. (default being the local server)
 * 
 * @param Server Location
 * @desc Server address (+ port)
 * @default http://127.0.0.1:8097/
 */


var socket = undefined;

(function() {
  var MMO = MMO || {};
  MMO.Parameters = PluginManager.parameters('MMO_Core');
  let serverAddress = String(MMO.Parameters['Server Location']);

  socket = socket || io.connect(serverAddress);

  socket.on('connect_error', function() {
    document.dispatchEvent(new Event('mmorpg_core_lost_connection')); // Dispatch event for connection lost.
    socket.close();
  })

  // Clean up the menu
  Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addOriginalCommands();
    this.addOptionsCommand();
  };
})();