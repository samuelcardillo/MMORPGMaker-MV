//=============================================================================
// MMO_ServerSideMaps
// MMO_ServerSideMaps.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc MMORPG Maker MV - Server Side Maps
 * @author Mourad KEJJI
 *
 * @help Loads maps from the server
 */

(function() {
  DataManager.loadDataFile = function(name, src, realmIp = MMO_Core.Parameters['Server Location']) {
    const xhr = new XMLHttpRequest();
    const prefix = /^Map/.test(src)// if is a Map file
      ? realmIp + "api/map/" // ask API
      : "data/" // else ask to client
    const url = prefix + src;
    window[name] = null;
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
    xhr.onerror = () => this.onXhrError(name, src, url);
    xhr.send();
  };
})();
