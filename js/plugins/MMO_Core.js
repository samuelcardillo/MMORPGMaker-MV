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
 * @default 127.0.0.1:8097
 */


var socket = undefined;

(function() {
  var MMO = MMO || {};
  MMO.Parameters = PluginManager.parameters('MMO_Core');
  let serverAddress = String(MMO.Parameters['Server Location']);

  socket = socket || io.connect('http://' + serverAddress + '/');
})();