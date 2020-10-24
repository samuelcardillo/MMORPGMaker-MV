//=============================================================================
// main.js v1.0.0
//=============================================================================

var _DOMAIN_NAME_ = 'http://localhost:1337'; // Edit this before hosting your game
var _PRODUCTION_ = false; // Set to true before hosting your game
var remoteVersionJson = {
    "version":'0'
}; // default value

if (!_PRODUCTION_) {
    // If not in production, use the browser location with NWJS as fallback
    _DOMAIN_NAME_ = location && location.href || 'chrome-extension://njgcanhfjdabfmnlmpmdedalocpafnhl';
}

var fetchOnlinePackageJSON = async (callback = () => {}) => {
    // This method will fetch package.json from remote
    var versionXhr = new XMLHttpRequest();
    var url = _DOMAIN_NAME_ + '/version.json';
    versionXhr.open('GET', url);
    versionXhr.overrideMimeType('application/json');
    versionXhr.onload = async (e) => {
        if (versionXhr.status < 400 && !!versionXhr.response && !!versionXhr.response.version) {
            remoteVersionJson = JSON.parse(versionXhr.response);
            window.dispatchEvent(new Event('packageJsonFetched'))
            callback();
        }
    }
    versionXhr.onerror = (error) => {
        console.error(error);
    };
    versionXhr.send();
};

const scriptUrls = [
    "js/libs/pixi.js",
    "js/libs/pako.min.js",
    "js/libs/localforage.min.js",
    "js/libs/effekseer.min.js",
    "js/libs/vorbisdecoder.js",
    "js/rmmz_core.js",
    "js/rmmz_managers.js",
    "js/rmmz_objects.js",
    "js/rmmz_scenes.js",
    "js/rmmz_sprites.js",
    "js/rmmz_windows.js",
    "js/plugins.js"
];
const effekseerWasmUrl = "js/libs/effekseer.wasm";

class Main {
    constructor() {
        this.xhrSucceeded = false;
        this.loadCount = 0;
        this.error = null;
    }

    async run() {
        this.showLoadingSpinner();
        this.testXhr();
        await this.loadMainScripts();
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

    loadMainScripts() {
        const random = Math.floor((Math.random() * 99999999) + 9999999);
        const suffix = _PRODUCTION_ ? '?v=' + random : '';
        for (const url of scriptUrls) {
            const script = document.createElement("script");
            script.id = url;
            if (document.getElementById(url)) return; // don't load plugin twice
            script.type = "text/javascript";
            script.src = url + suffix;
            script.async = false;
            script.defer = true;
            script.onload = this.onScriptLoad.bind(this);
            script.onerror = this.onScriptError.bind(this);
            script._url = url + suffix;
            document.body.appendChild(script);
        }
        this.numScripts = scriptUrls.length;
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
        console.log('onWindowLoad')
        if (!this.xhrSucceeded) {
            const message = "Your browser does not allow to read local files.";
            this.printError("Error", message);
        } else if (this.isPathRandomized()) {
            const message = "Please move the Game.app to a different folder.";
            this.printError("Error", message);
        } else if (this.error) {
            this.printError(this.error.name, this.error.message);
        } else {
            this.initEffekseerRuntime();
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
        const prefix = _PRODUCTION_ ? _DOMAIN_NAME_ + '/' : '';
        const suffix = _PRODUCTION_ ? '?v=' + remoteVersionJson.version : '';
        effekseer.initRuntime(prefix + effekseerWasmUrl + suffix, onLoad, onError);
    }

    onEffekseerLoad() {
        this.eraseLoadingSpinner();
        SceneManager.run(Scene_Boot);
    }

    onEffekseerError() {
        this.printError("Failed to load", effekseerWasmUrl);
    }
}

const main = new Main();
if (!_PRODUCTION_) main.run();
else {
    window.addEventListener('run', main.run()); // Run the engine after fetching remote package
    fetchOnlinePackageJSON(() => window.dispatchEvent(new Event('run')));
    window.removeEventListener('run',null,true); // Disallow game reload on event catch
}

//-----------------------------------------------------------------------------
