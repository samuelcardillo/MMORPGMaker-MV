//=============================================================================
// RPG Maker MZ - Cache Override
//=============================================================================

/*:
 * @target MZ
 * @plugindesc This allows to force users to re-load old files
 * @author Axel Fiolle
 *
 * @help CacheOverride.js
 *
 * This plugin allows you to force users to re-load old files
 * You just need to change the version in the plugin setting before pushing online
 *
 * It does not provide plugin commands.
 * 
 * @param gameVersion
 * @text Your game version :
 * @type text
 * @default 1.0.0
 */

(() => {
  const _parameters     = PluginManager.parameters('CacheOverride');
  const _storageVersion = localStorage.getItem('gameVersion')
      , _currentVersion = _parameters['gameVersion'] || "1.0.0";

  // Force loading last file if browser version doesn't match with plugin
  if (_storageVersion != _currentVersion) {
    localStorage.setItem('gameVersion', _currentVersion);
    DataManager.loadDataFile = function(name, src) {
      const xhr = new XMLHttpRequest();
      const url = "data/" + src + `?v=${_currentVersion}`;
      window[name] = null;
      xhr.open("GET", url);
      xhr.overrideMimeType("application/json");
      xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
      xhr.onerror = () => this.onXhrError(name, src, url);
      xhr.send();
    };
  }

})();