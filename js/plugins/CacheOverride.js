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
  const _storageVersion = localStorage.getItem('gameVersion') || "1.0.0"
      , _currentVersion = _parameters['gameVersion'] || "1.0.0";

  if (_storageVersion != _currentVersion) {
    localStorage.setItem('gameVersion', _currentVersion);
    window.location.href += '?v=' + _currentVersion;
  }
})();