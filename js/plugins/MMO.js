//=============================================================================
// MMO.js
//=============================================================================

/*:
 * @plugindesc MMORPG plugin
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 * 
 * @param Server Location
 * @desc Server address (+ port)
 * @default 127.0.0.1:8097
 */

var MMO = MMO || {};
var socket = undefined;
var isLogged = false;
var isMoving = false;
var players = {};

(function() {
  MMO.Parameters = PluginManager.parameters('MMO');
  let serverAddress = String(MMO.Parameters['Server Location']); // 


  socket = socket || io.connect('http://' + serverAddress + '/');
})();