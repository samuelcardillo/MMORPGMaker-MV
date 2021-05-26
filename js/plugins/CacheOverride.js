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


class NewMain {
  constructor() {
      this.xhrSucceeded = false;
      this.loadCount = 0;
      this.error = null;
  }

  run(suffix) {
      this.showLoadingSpinner();
      this.testXhr();
      this.loadMainScripts(suffix);
  }

  showLoadingSpinner() {
      const loadingSpinner = document.createElement("div");
      const loadingSpinnerImage = document.createElement("div");
      loadingSpinner.id = "loadingSpinner";
      loadingSpinnerImage.id = "loadingSpinnerImage";
      loadingSpinner.appendChild(loadingSpinnerImage);
      document.body.appendChild(loadingSpinner);
  }

  eraseLoadingSpinner() {
      const loadingSpinner = document.getElementById("loadingSpinner");
      if (loadingSpinner) {
          document.body.removeChild(loadingSpinner);
      }
  }

  testXhr() {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", document.currentScript.src);
      xhr.onload = () => (this.xhrSucceeded = true);
      xhr.send();
  }

  async loadMainScripts(suffix) {
    const ignoredUrls = [
      "js/libs/pixi.js",
      "js/libs/pako.min.js",
      "js/libs/localforage.min.js",
      "js/libs/effekseer.min.js",
      "js/libs/vorbisdecoder.js"
    ];
    
    for (const url of scriptUrls) {
      if (ignoredUrls.find(ignored => ignored === url)) return;
      const existingTag = await document.body.querySelectorAll('script').find(s => s.src.includes(url));
      if (existingTag) {
        // If script tag already exists, remove it
        existingTag.remove();
      }
      // Reconstruct the script tag :
      const script = document.createElement("script");
      script.id = url;
      script.type = "text/javascript";
      script.src = url + suffix;
      script.async = false;
      script.defer = true;
      script.onload = this.onScriptLoad.bind(this);
      script.onerror = this.onScriptError.bind(this);
      script._url = url + suffix;
      document.body.appendChild(script);
    } // endof for
    window.addEventListener("load", this.onWindowLoad.bind(this));
    window.addEventListener("error", this.onWindowError.bind(this));
  }

  onScriptLoad() {
      if (++this.loadCount === this.numScripts) {
          PluginManager.setup($plugins);
      }
  }

  onScriptError(e) {
      this.printError("Failed to load", e.target._url);
  }

  printError(name, message) {
      this.eraseLoadingSpinner();
      if (!document.getElementById("errorPrinter")) {
          const errorPrinter = document.createElement("div");
          errorPrinter.id = "errorPrinter";
          errorPrinter.innerHTML = this.makeErrorHtml(name, message);
          document.body.appendChild(errorPrinter);
      }
  }

  makeErrorHtml(name, message) {
      const nameDiv = document.createElement("div");
      const messageDiv = document.createElement("div");
      nameDiv.id = "errorName";
      messageDiv.id = "errorMessage";
      nameDiv.innerHTML = name;
      messageDiv.innerHTML = message;
      return nameDiv.outerHTML + messageDiv.outerHTML;
  }

  onWindowLoad() {
      if (!this.xhrSucceeded) {
          const message = "Your browser does not allow to read local files.";
          this.printError("Error", message);
      } else if (this.isPathRandomized()) {
          const message = "Please move the Game.app to a different folder.";
          this.printError("Error", message);
      } else if (this.error) {
          this.printError(this.error.name, this.error.message);
      } else {
          // this.initEffekseerRuntime();
      }
  }

  onWindowError(event) {
      if (!this.error) {
          this.error = event.error;
      }
  }

  isPathRandomized() {
      // [Note] We cannot save the game properly when Gatekeeper Path
      //   Randomization is in effect.
      return (
          Utils.isNwjs() &&
          process.mainModule.filename.startsWith("/private/var")
      );
  }

  initEffekseerRuntime() {
      const onLoad = this.onEffekseerLoad.bind(this);
      const onError = this.onEffekseerError.bind(this);
      effekseer.initRuntime(effekseerWasmUrl, onLoad, onError);
  }

  onEffekseerLoad() {
      this.eraseLoadingSpinner();
      SceneManager.run(Scene_Boot);
  }

  onEffekseerError() {
      this.printError("Failed to load", effekseerWasmUrl);
  }
}

const _parameters     = PluginManager.parameters('CacheOverride');
const _storageVersion = localStorage.getItem('gameVersion') || 0
    , _currentVersion = _parameters['gameVersion'] || "1.0.0";

if (_storageVersion != _currentVersion) {
  localStorage.setItem('gameVersion', _currentVersion);
  delete main;
  const main = new NewMain();
  const suffix = '?v=' + _currentVersion;
  main.run(suffix);
}