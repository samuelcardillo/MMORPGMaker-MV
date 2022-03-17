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
  DataManager.loadDataFile = function(name, src) {
    const xhr = new XMLHttpRequest();
    const prefix = (/^Map/.test(src)) ? MMO_Core.Parameters['Server Location'] : '';
    const url = prefix + "data/" + src;
    window[name] = null;
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
    xhr.onerror = () => this.onXhrError(name, src, url);
    xhr.send();
  };
})();
