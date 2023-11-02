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


function MMO_Core() { 
  this.initialize.apply(this, arguments);
}

MMO_Core.Parameters = PluginManager.parameters('MMO_Core');
MMO_Core.socket = io.connect(String(MMO_Core.Parameters['Server Location']));
MMO_Core.allowTouch = true;

(function() {

  // Wildcard for any disconnection from the server.
  MMO_Core.socket.on('disconnect', (reason) => {
    document.dispatchEvent(new Event('mmorpg_core_lost_connection')); // Dispatch event for connection lost.
    MMO_Core.socket.close();
    alert(reason);
  });

  // Clean up the menu
  Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addOriginalCommands();
    this.addOptionsCommand();
  };

  MMO_Core._onTouchStart = TouchInput._onTouchStart;
  TouchInput._onTouchStart = function(event) {
    if(!MMO_Core.allowTouch) return; 
    MMO_Core._onTouchStart.call(this, event);
  }

  // ---------------------------------------
  // ---------- Exposed Functions
  // ---------------------------------------

  MMO_Core.sendMessage = function(message) {
    if(message.length <= 0) return;
    MMO_Core.socket.emit("new_message", message);
  }
})();



