//=============================================================================
// MMO.js
//=============================================================================

/*:
 * @plugindesc MMORPG plugin
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

var socket = undefined;
var isLogged = false;
var isMoving = false;
var players = {};

(function() {
  socket = socket || io.connect('http://127.0.0.1:8097/');
})();