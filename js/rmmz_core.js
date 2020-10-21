//=============================================================================
// rmmz_core.js v1.0.0
//=============================================================================

//-----------------------------------------------------------------------------
/**
 * This section contains some methods that will be added to the standard
 * Javascript objects.
 *
 * @namespace JsExtensions
 */

/**
 * Makes a shallow copy of the array.
 *
 * @memberof JsExtensions
 * @returns {array} A shallow copy of the array.
 */
Array.prototype.clone = function() {
    return this.slice(0);
};

Object.defineProperty(Array.prototype, "clone", {
    enumerable: false
});

/**
 * Checks whether the array contains a given element.
 *
 * @memberof JsExtensions
 * @param {any} element - The element to search for.
 * @returns {boolean} True if the array contains a given element.
 * @deprecated includes() should be used instead.
 */
Array.prototype.contains = function(element) {
    return this.includes(element);
};

Object.defineProperty(Array.prototype, "contains", {
    enumerable: false
});

/**
 * Checks whether the two arrays are the same.
 *
 * @memberof JsExtensions
 * @param {array} array - The array to compare to.
 * @returns {boolean} True if the two arrays are the same.
 */
Array.prototype.equals = function(array) {
    if (!array || this.length !== array.length) {
        return false;
    }
    for (let i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) {
                return false;
            }
        } else if (this[i] !== array[i]) {
            return false;
        }
    }
    return true;
};

Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});

/**
 * Removes a given element from the array (in place).
 *
 * @memberof JsExtensions
 * @param {any} element - The element to remove.
 * @returns {array} The array after remove.
 */
Array.prototype.remove = function(element) {
    for (;;) {
        const index = this.indexOf(element);
        if (index >= 0) {
            this.splice(index, 1);
        } else {
            return this;
        }
    }
};

Object.defineProperty(Array.prototype, "remove", {
    enumerable: false
});

/**
 * Generates a random integer in the range (0, max-1).
 *
 * @memberof JsExtensions
 * @param {number} max - The upper boundary (excluded).
 * @returns {number} A random integer.
 */
Math.randomInt = function(max) {
    return Math.floor(max * Math.random());
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * @memberof JsExtensions
 * @param {number} min - The lower boundary.
 * @param {number} max - The upper boundary.
 * @returns {number} A number in the range (min, max).
 */
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

/**
 * Returns a modulo value which is always positive.
 *
 * @memberof JsExtensions
 * @param {number} n - The divisor.
 * @returns {number} A modulo value.
 */
Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
Number.prototype.padZero = function(length) {
    return String(this).padZero(length);
};

/**
 * Checks whether the string contains a given string.
 *
 * @memberof JsExtensions
 * @param {string} string - The string to search for.
 * @returns {boolean} True if the string contains a given string.
 * @deprecated includes() should be used instead.
 */
String.prototype.contains = function(string) {
    return this.includes(string);
};

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @memberof JsExtensions
 * @param {any} ...args The objects to format.
 * @returns {string} A formatted string.
 */
String.prototype.format = function() {
    return this.replace(/%([0-9]+)/g, (s, n) => arguments[Number(n) - 1]);
};

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
String.prototype.padZero = function(length) {
    return this.padStart(length, "0");
};

//-----------------------------------------------------------------------------
/**
 * The static class that defines utility methods.
 *
 * @namespace
 */
function Utils() {
    throw new Error("This is a static class");
}

/**
 * The name of the RPG Maker. "MZ" in the current version.
 *
 * @type string
 * @constant
 */
Utils.RPGMAKER_NAME = "MZ";

/**
 * The version of the RPG Maker.
 *
 * @type string
 * @constant
 */
Utils.RPGMAKER_VERSION = "1.0.0";

/**
 * Checks whether the current RPG Maker version is greater than or equal to
 * the given version.
 *
 * @param {string} version - The "x.x.x" format string to compare.
 * @returns {boolean} True if the current version is greater than or equal
 *                    to the given version.
 */
Utils.checkRMVersion = function(version) {
    const array1 = this.RPGMAKER_VERSION.split(".");
    const array2 = String(version).split(".");
    for (let i = 0; i < array1.length; i++) {
        const v1 = parseInt(array1[i]);
        const v2 = parseInt(array2[i]);
        if (v1 > v2) {
            return true;
        } else if (v1 < v2) {
            return false;
        }
    }
    return true;
};

/**
 * Checks whether the option is in the query string.
 *
 * @param {string} name - The option name.
 * @returns {boolean} True if the option is in the query string.
 */
Utils.isOptionValid = function(name) {
    const args = location.search.slice(1);
    if (args.split("&").includes(name)) {
        return true;
    }
    if (this.isNwjs() && nw.App.argv.length > 0) {
        return nw.App.argv[0].split("&").includes(name);
    }
    return false;
};

/**
 * Checks whether the platform is NW.js.
 *
 * @returns {boolean} True if the platform is NW.js.
 */
Utils.isNwjs = function() {
    return typeof require === "function" && typeof process === "object";
};

/**
 * Checks whether the platform is a mobile device.
 *
 * @returns {boolean} True if the platform is a mobile device.
 */
Utils.isMobileDevice = function() {
    const r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i;
    return !!navigator.userAgent.match(r);
};

/**
 * Checks whether the browser is Mobile Safari.
 *
 * @returns {boolean} True if the browser is Mobile Safari.
 */
Utils.isMobileSafari = function() {
    const agent = navigator.userAgent;
    return !!(
        agent.match(/iPhone|iPad|iPod/) &&
        agent.match(/AppleWebKit/) &&
        !agent.match("CriOS")
    );
};

/**
 * Checks whether the browser is Android Chrome.
 *
 * @returns {boolean} True if the browser is Android Chrome.
 */
Utils.isAndroidChrome = function() {
    const agent = navigator.userAgent;
    return !!(agent.match(/Android/) && agent.match(/Chrome/));
};

/**
 * Checks whether the browser is accessing local files.
 *
 * @returns {boolean} True if the browser is accessing local files.
 */
Utils.isLocal = function() {
    return window.location.href.startsWith("file:");
};

/**
 * Checks whether the browser supports WebGL.
 *
 * @returns {boolean} True if the browser supports WebGL.
 */
Utils.canUseWebGL = function() {
    try {
        const canvas = document.createElement("canvas");
        return !!canvas.getContext("webgl");
    } catch (e) {
        return false;
    }
};

/**
 * Checks whether the browser supports Web Audio API.
 *
 * @returns {boolean} True if the browser supports Web Audio API.
 */
Utils.canUseWebAudioAPI = function() {
    return !!(window.AudioContext || window.webkitAudioContext);
};

/**
 * Checks whether the browser supports CSS Font Loading.
 *
 * @returns {boolean} True if the browser supports CSS Font Loading.
 */
Utils.canUseCssFontLoading = function() {
    return !!(document.fonts && document.fonts.ready);
};

/**
 * Checks whether the browser supports IndexedDB.
 *
 * @returns {boolean} True if the browser supports IndexedDB.
 */
Utils.canUseIndexedDB = function() {
    return !!(
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB
    );
};

/**
 * Checks whether the browser can play ogg files.
 *
 * @returns {boolean} True if the browser can play ogg files.
 */
Utils.canPlayOgg = function() {
    if (!Utils._audioElement) {
        Utils._audioElement = document.createElement("audio");
    }
    return !!(
        Utils._audioElement &&
        Utils._audioElement.canPlayType('audio/ogg; codecs="vorbis"')
    );
};

/**
 * Checks whether the browser can play webm files.
 *
 * @returns {boolean} True if the browser can play webm files.
 */
Utils.canPlayWebm = function() {
    if (!Utils._videoElement) {
        Utils._videoElement = document.createElement("video");
    }
    return !!(
        Utils._videoElement &&
        Utils._videoElement.canPlayType('video/webm; codecs="vp8, vorbis"')
    );
};

/**
 * Encodes a URI component without escaping slash characters.
 *
 * @param {string} str - The input string.
 * @returns {string} Encoded string.
 */
Utils.encodeURI = function(str) {
    return encodeURIComponent(str).replace(/%2F/g, "/");
};

/**
 * Escapes special characters for HTML.
 *
 * @param {string} str - The input string.
 * @returns {string} Escaped string.
 */
Utils.escapeHtml = function(str) {
    const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;"
    };
    return String(str).replace(/[&<>"'/]/g, s => entityMap[s]);
};

/**
 * Checks whether the string contains any Arabic characters.
 *
 * @returns {boolean} True if the string contains any Arabic characters.
 */
Utils.containsArabic = function(str) {
    const regExp = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regExp.test(str);
};

/**
 * Sets information related to encryption.
 *
 * @param {boolean} hasImages - Whether the image files are encrypted.
 * @param {boolean} hasAudio - Whether the audio files are encrypted.
 * @param {string} key - The encryption key.
 */
Utils.setEncryptionInfo = function(hasImages, hasAudio, key) {
    // [Note] This function is implemented for module independence.
    this._hasEncryptedImages = hasImages;
    this._hasEncryptedAudio = hasAudio;
    this._encryptionKey = key;
};

/**
 * Checks whether the image files in the game are encrypted.
 *
 * @returns {boolean} True if the image files are encrypted.
 */
Utils.hasEncryptedImages = function() {
    return this._hasEncryptedImages;
};

/**
 * Checks whether the audio files in the game are encrypted.
 *
 * @returns {boolean} True if the audio files are encrypted.
 */
Utils.hasEncryptedAudio = function() {
    return this._hasEncryptedAudio;
};

/**
 * Decrypts encrypted data.
 *
 * @param {ArrayBuffer} source - The data to be decrypted.
 * @returns {ArrayBuffer} The decrypted data.
 */
Utils.decryptArrayBuffer = function(source) {
    const header = new Uint8Array(source, 0, 16);
    const headerHex = Array.from(header, x => x.toString(16)).join(",");
    if (headerHex !== "52,50,47,4d,56,0,0,0,0,3,1,0,0,0,0,0") {
        throw new Error("Decryption error");
    }
    const body = source.slice(16);
    const view = new DataView(body);
    const key = this._encryptionKey.match(/.{2}/g);
    for (let i = 0; i < 16; i++) {
        view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16));
    }
    return body;
};

//-----------------------------------------------------------------------------
/**
 * The static class that carries out graphics processing.
 *
 * @namespace
 */
function Graphics() {
    throw new Error("This is a static class");
}

/**
 * Initializes the graphics system.
 *
 * @returns {boolean} True if the graphics system is available.
 */
Graphics.initialize = function() {
    this._width = 0;
    this._height = 0;
    this._defaultScale = 1;
    this._realScale = 1;
    this._errorPrinter = null;
    this._tickHandler = null;
    this._canvas = null;
    this._fpsCounter = null;
    this._loadingSpinner = null;
    this._stretchEnabled = this._defaultStretchMode();
    this._app = null;
    this._effekseer = null;
    this._wasLoading = false;

    /**
     * The total frame count of the game screen.
     *
     * @type number
     * @name Graphics.frameCount
     */
    this.frameCount = 0;

    /**
     * The width of the window display area.
     *
     * @type number
     * @name Graphics.boxWidth
     */
    this.boxWidth = this._width;

    /**
     * The height of the window display area.
     *
     * @type number
     * @name Graphics.boxHeight
     */
    this.boxHeight = this._height;

    this._updateRealScale();
    this._createAllElements();
    this._disableContextMenu();
    this._setupEventHandlers();
    this._createPixiApp();
    this._createEffekseerContext();

    return !!this._app;
};

/**
 * The PIXI.Application object.
 *
 * @readonly
 * @type PIXI.Application
 * @name Graphics.app
 */
Object.defineProperty(Graphics, "app", {
    get: function() {
        return this._app;
    },
    configurable: true
});

/**
 * The context object of Effekseer.
 *
 * @readonly
 * @type EffekseerContext
 * @name Graphics.effekseer
 */
Object.defineProperty(Graphics, "effekseer", {
    get: function() {
        return this._effekseer;
    },
    configurable: true
});

/**
 * Register a handler for tick events.
 *
 * @param {function} handler - The listener function to be added for updates.
 */
Graphics.setTickHandler = function(handler) {
    this._tickHandler = handler;
};

/**
 * Starts the game loop.
 */
Graphics.startGameLoop = function() {
    if (this._app) {
        this._app.start();
    }
};

/**
 * Stops the game loop.
 */
Graphics.stopGameLoop = function() {
    if (this._app) {
        this._app.stop();
    }
};

/**
 * Sets the stage to be rendered.
 *
 * @param {Stage} stage - The stage object to be rendered.
 */
Graphics.setStage = function(stage) {
    if (this._app) {
        this._app.stage = stage;
    }
};

/**
 * Shows the loading spinner.
 */
Graphics.startLoading = function() {
    if (!document.getElementById("loadingSpinner")) {
        document.body.appendChild(this._loadingSpinner);
    }
};

/**
 * Erases the loading spinner.
 *
 * @returns {boolean} True if the loading spinner was active.
 */
Graphics.endLoading = function() {
    if (document.getElementById("loadingSpinner")) {
        document.body.removeChild(this._loadingSpinner);
        return true;
    } else {
        return false;
    }
};

/**
 * Displays the error text to the screen.
 *
 * @param {string} name - The name of the error.
 * @param {string} message - The message of the error.
 * @param {Error} [error] - The error object.
 */
Graphics.printError = function(name, message, error = null) {
    if (!this._errorPrinter) {
        this._createErrorPrinter();
    }
    this._errorPrinter.innerHTML = this._makeErrorHtml(name, message, error);
    this._wasLoading = this.endLoading();
    this._applyCanvasFilter();
};

/**
 * Displays a button to try to reload resources.
 *
 * @param {function} retry - The callback function to be called when the button
 *                           is pressed.
 */
Graphics.showRetryButton = function(retry) {
    const button = document.createElement("button");
    button.id = "retryButton";
    button.innerHTML = "Retry";
    // [Note] stopPropagation() is required for iOS Safari.
    button.ontouchstart = e => e.stopPropagation();
    button.onclick = () => {
        Graphics.eraseError();
        retry();
    };
    this._errorPrinter.appendChild(button);
    button.focus();
};

/**
 * Erases the loading error text.
 */
Graphics.eraseError = function() {
    if (this._errorPrinter) {
        this._errorPrinter.innerHTML = this._makeErrorHtml();
        if (this._wasLoading) {
            this.startLoading();
        }
    }
    this._clearCanvasFilter();
};

/**
 * Converts an x coordinate on the page to the corresponding
 * x coordinate on the canvas area.
 *
 * @param {number} x - The x coordinate on the page to be converted.
 * @returns {number} The x coordinate on the canvas area.
 */
Graphics.pageToCanvasX = function(x) {
    if (this._canvas) {
        const left = this._canvas.offsetLeft;
        return Math.round((x - left) / this._realScale);
    } else {
        return 0;
    }
};

/**
 * Converts a y coordinate on the page to the corresponding
 * y coordinate on the canvas area.
 *
 * @param {number} y - The y coordinate on the page to be converted.
 * @returns {number} The y coordinate on the canvas area.
 */
Graphics.pageToCanvasY = function(y) {
    if (this._canvas) {
        const top = this._canvas.offsetTop;
        return Math.round((y - top) / this._realScale);
    } else {
        return 0;
    }
};

/**
 * Checks whether the specified point is inside the game canvas area.
 *
 * @param {number} x - The x coordinate on the canvas area.
 * @param {number} y - The y coordinate on the canvas area.
 * @returns {boolean} True if the specified point is inside the game canvas area.
 */
Graphics.isInsideCanvas = function(x, y) {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
};

/**
 * Shows the game screen.
 */
Graphics.showScreen = function() {
    this._canvas.style.opacity = 1;
};

/**
 * Hides the game screen.
 */
Graphics.hideScreen = function() {
    this._canvas.style.opacity = 0;
};

/**
 * Changes the size of the game screen.
 *
 * @param {number} width - The width of the game screen.
 * @param {number} height - The height of the game screen.
 */
Graphics.resize = function(width, height) {
    this._width = width;
    this._height = height;
    this._updateAllElements();
};

/**
 * The width of the game screen.
 *
 * @type number
 * @name Graphics.width
 */
Object.defineProperty(Graphics, "width", {
    get: function() {
        return this._width;
    },
    set: function(value) {
        if (this._width !== value) {
            this._width = value;
            this._updateAllElements();
        }
    },
    configurable: true
});

/**
 * The height of the game screen.
 *
 * @type number
 * @name Graphics.height
 */
Object.defineProperty(Graphics, "height", {
    get: function() {
        return this._height;
    },
    set: function(value) {
        if (this._height !== value) {
            this._height = value;
            this._updateAllElements();
        }
    },
    configurable: true
});

/**
 * The default zoom scale of the game screen.
 *
 * @type number
 * @name Graphics.defaultScale
 */
Object.defineProperty(Graphics, "defaultScale", {
    get: function() {
        return this._defaultScale;
    },
    set: function(value) {
        if (this._defaultScale !== value) {
            this._defaultScale = value;
            this._updateAllElements();
        }
    },
    configurable: true
});

Graphics._createAllElements = function() {
    this._createErrorPrinter();
    this._createCanvas();
    this._createLoadingSpinner();
    this._createFPSCounter();
};

Graphics._updateAllElements = function() {
    this._updateRealScale();
    this._updateErrorPrinter();
    this._updateCanvas();
    this._updateVideo();
};

Graphics._onTick = function(deltaTime) {
    this._fpsCounter.startTick();
    if (this._tickHandler) {
        this._tickHandler(deltaTime);
    }
    if (this._canRender()) {
        this._app.render();
    }
    this._fpsCounter.endTick();
};

Graphics._canRender = function() {
    return !!this._app.stage;
};

Graphics._updateRealScale = function() {
    if (this._stretchEnabled && this._width > 0 && this._height > 0) {
        const h = this._stretchWidth() / this._width;
        const v = this._stretchHeight() / this._height;
        this._realScale = Math.min(h, v);
        window.scrollTo(0, 0);
    } else {
        this._realScale = this._defaultScale;
    }
};

Graphics._stretchWidth = function() {
    if (Utils.isMobileDevice()) {
        return document.documentElement.clientWidth;
    } else {
        return window.innerWidth;
    }
};

Graphics._stretchHeight = function() {
    if (Utils.isMobileDevice()) {
        // [Note] Mobile browsers often have special operations at the top and
        //   bottom of the screen.
        const rate = Utils.isLocal() ? 1.0 : 0.9;
        return document.documentElement.clientHeight * rate;
    } else {
        return window.innerHeight;
    }
};

Graphics._makeErrorHtml = function(name, message /*, error*/) {
    const nameDiv = document.createElement("div");
    const messageDiv = document.createElement("div");
    nameDiv.id = "errorName";
    messageDiv.id = "errorMessage";
    nameDiv.innerHTML = Utils.escapeHtml(name || "");
    messageDiv.innerHTML = Utils.escapeHtml(message || "");
    return nameDiv.outerHTML + messageDiv.outerHTML;
};

Graphics._defaultStretchMode = function() {
    return Utils.isNwjs() || Utils.isMobileDevice();
};

Graphics._createErrorPrinter = function() {
    this._errorPrinter = document.createElement("div");
    this._errorPrinter.id = "errorPrinter";
    this._errorPrinter.innerHTML = this._makeErrorHtml();
    document.body.appendChild(this._errorPrinter);
};

Graphics._updateErrorPrinter = function() {
    const width = 640 * this._realScale;
    const height = 100 * this._realScale;
    this._errorPrinter.style.width = width + "px";
    this._errorPrinter.style.height = height + "px";
};

Graphics._createCanvas = function() {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "gameCanvas";
    this._updateCanvas();
    document.body.appendChild(this._canvas);
};

Graphics._updateCanvas = function() {
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._canvas.style.zIndex = 1;
    this._centerElement(this._canvas);
};

Graphics._updateVideo = function() {
    const width = this._width * this._realScale;
    const height = this._height * this._realScale;
    Video.resize(width, height);
};

Graphics._createLoadingSpinner = function() {
    const loadingSpinner = document.createElement("div");
    const loadingSpinnerImage = document.createElement("div");
    loadingSpinner.id = "loadingSpinner";
    loadingSpinnerImage.id = "loadingSpinnerImage";
    loadingSpinner.appendChild(loadingSpinnerImage);
    this._loadingSpinner = loadingSpinner;
};

Graphics._createFPSCounter = function() {
    this._fpsCounter = new Graphics.FPSCounter();
};

Graphics._centerElement = function(element) {
    const width = element.width * this._realScale;
    const height = element.height * this._realScale;
    element.style.position = "absolute";
    element.style.margin = "auto";
    element.style.top = 0;
    element.style.left = 0;
    element.style.right = 0;
    element.style.bottom = 0;
    element.style.width = width + "px";
    element.style.height = height + "px";
};

Graphics._disableContextMenu = function() {
    const elements = document.body.getElementsByTagName("*");
    const oncontextmenu = () => false;
    for (const element of elements) {
        element.oncontextmenu = oncontextmenu;
    }
};

Graphics._applyCanvasFilter = function() {
    if (this._canvas) {
        this._canvas.style.opacity = 0.5;
        this._canvas.style.filter = "blur(8px)";
        this._canvas.style.webkitFilter = "blur(8px)";
    }
};

Graphics._clearCanvasFilter = function() {
    if (this._canvas) {
        this._canvas.style.opacity = 1;
        this._canvas.style.filter = "";
        this._canvas.style.webkitFilter = "";
    }
};

Graphics._setupEventHandlers = function() {
    window.addEventListener("resize", this._onWindowResize.bind(this));
    document.addEventListener("keydown", this._onKeyDown.bind(this));
};

Graphics._onWindowResize = function() {
    this._updateAllElements();
};

Graphics._onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
            case 113: // F2
                event.preventDefault();
                this._switchFPSCounter();
                break;
            case 114: // F3
                event.preventDefault();
                this._switchStretchMode();
                break;
            case 115: // F4
                event.preventDefault();
                this._switchFullScreen();
                break;
        }
    }
};

Graphics._switchFPSCounter = function() {
    this._fpsCounter.switchMode();
};

Graphics._switchStretchMode = function() {
    this._stretchEnabled = !this._stretchEnabled;
    this._updateAllElements();
};

Graphics._switchFullScreen = function() {
    if (this._isFullScreen()) {
        this._cancelFullScreen();
    } else {
        this._requestFullScreen();
    }
};

Graphics._isFullScreen = function() {
    return (
        document.fullScreenElement ||
        document.mozFullScreen ||
        document.webkitFullscreenElement
    );
};

Graphics._requestFullScreen = function() {
    const element = document.body;
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
};

Graphics._cancelFullScreen = function() {
    if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
};

Graphics._createPixiApp = function() {
    try {
        this._setupPixi();
        this._app = new PIXI.Application({
            view: this._canvas,
            autoStart: false
        });
        this._app.ticker.remove(this._app.render, this._app);
        this._app.ticker.add(this._onTick, this);
    } catch (e) {
        this._app = null;
    }
};

Graphics._setupPixi = function() {
    PIXI.utils.skipHello();
    PIXI.settings.GC_MAX_IDLE = 600;
};

Graphics._createEffekseerContext = function() {
    if (this._app && window.effekseer) {
        try {
            this._effekseer = effekseer.createContext();
            if (this._effekseer) {
                this._effekseer.init(this._app.renderer.gl);
            }
        } catch (e) {
            this._app = null;
        }
    }
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// FPSCounter
//
// This is based on Darsain's FPSMeter which is under the MIT license.
// The original can be found at https://github.com/Darsain/fpsmeter.

Graphics.FPSCounter = function() {
    this.initialize(...arguments);
};

Graphics.FPSCounter.prototype.initialize = function() {
    this._tickCount = 0;
    this._frameTime = 100;
    this._frameStart = 0;
    this._lastLoop = performance.now() - 100;
    this._showFps = true;
    this.fps = 0;
    this.duration = 0;
    this._createElements();
    this._update();
};

Graphics.FPSCounter.prototype.startTick = function() {
    this._frameStart = performance.now();
};

Graphics.FPSCounter.prototype.endTick = function() {
    const time = performance.now();
    const thisFrameTime = time - this._lastLoop;
    this._frameTime += (thisFrameTime - this._frameTime) / 12;
    this.fps = 1000 / this._frameTime;
    this.duration = Math.max(0, time - this._frameStart);
    this._lastLoop = time;
    if (this._tickCount++ % 15 === 0) {
        this._update();
    }
};

Graphics.FPSCounter.prototype.switchMode = function() {
    if (this._boxDiv.style.display === "none") {
        this._boxDiv.style.display = "block";
        this._showFps = true;
    } else if (this._showFps) {
        this._showFps = false;
    } else {
        this._boxDiv.style.display = "none";
    }
    this._update();
};

Graphics.FPSCounter.prototype._createElements = function() {
    this._boxDiv = document.createElement("div");
    this._labelDiv = document.createElement("div");
    this._numberDiv = document.createElement("div");
    this._boxDiv.id = "fpsCounterBox";
    this._labelDiv.id = "fpsCounterLabel";
    this._numberDiv.id = "fpsCounterNumber";
    this._boxDiv.style.display = "none";
    this._boxDiv.appendChild(this._labelDiv);
    this._boxDiv.appendChild(this._numberDiv);
    document.body.appendChild(this._boxDiv);
};

Graphics.FPSCounter.prototype._update = function() {
    const count = this._showFps ? this.fps : this.duration;
    this._labelDiv.textContent = this._showFps ? "FPS" : "ms";
    this._numberDiv.textContent = count.toFixed(0);
};

//-----------------------------------------------------------------------------
/**
 * The point class.
 *
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
function Point() {
    this.initialize(...arguments);
}

Point.prototype = Object.create(PIXI.Point.prototype);
Point.prototype.constructor = Point;

Point.prototype.initialize = function(x, y) {
    PIXI.Point.call(this, x, y);
};

//-----------------------------------------------------------------------------
/**
 * The rectangle class.
 *
 * @class
 * @extends PIXI.Rectangle
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 */
function Rectangle() {
    this.initialize(...arguments);
}

Rectangle.prototype = Object.create(PIXI.Rectangle.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.initialize = function(x, y, width, height) {
    PIXI.Rectangle.call(this, x, y, width, height);
};

//-----------------------------------------------------------------------------
/**
 * The basic object that represents an image.
 *
 * @class
 * @param {number} width - The width of the bitmap.
 * @param {number} height - The height of the bitmap.
 */
function Bitmap() {
    this.initialize(...arguments);
}

Bitmap.prototype.initialize = function(width, height) {
    this._canvas = null;
    this._context = null;
    this._baseTexture = null;
    this._image = null;
    this._url = "";
    this._paintOpacity = 255;
    this._smooth = true;
    this._loadListeners = [];

    // "none", "loading", "loaded", or "error"
    this._loadingState = "none";

    if (width > 0 && height > 0) {
        this._createCanvas(width, height);
    }

    /**
     * The face name of the font.
     *
     * @type string
     */
    this.fontFace = "sans-serif";

    /**
     * The size of the font in pixels.
     *
     * @type number
     */
    this.fontSize = 16;

    /**
     * Whether the font is bold.
     *
     * @type boolean
     */
    this.fontBold = false;

    /**
     * Whether the font is italic.
     *
     * @type boolean
     */
    this.fontItalic = false;

    /**
     * The color of the text in CSS format.
     *
     * @type string
     */
    this.textColor = "#ffffff";

    /**
     * The color of the outline of the text in CSS format.
     *
     * @type string
     */
    this.outlineColor = "rgba(0, 0, 0, 0.5)";

    /**
     * The width of the outline of the text.
     *
     * @type number
     */
    this.outlineWidth = 3;
};

/**
 * Loads a image file.
 *
 * @param {string} url - The image url of the texture.
 * @returns {Bitmap} The new bitmap object.
 */
Bitmap.load = function(url) {
    const bitmap = Object.create(Bitmap.prototype);
    bitmap.initialize();
    bitmap._url = url;
    bitmap._startLoading();
    return bitmap;
};

/**
 * Takes a snapshot of the game screen.
 *
 * @param {Stage} stage - The stage object.
 * @returns {Bitmap} The new bitmap object.
 */
Bitmap.snap = function(stage) {
    const width = Graphics.width;
    const height = Graphics.height;
    const bitmap = new Bitmap(width, height);
    const renderTexture = PIXI.RenderTexture.create(width, height);
    if (stage) {
        const renderer = Graphics.app.renderer;
        renderer.render(stage, renderTexture);
        stage.worldTransform.identity();
        const canvas = renderer.extract.canvas(renderTexture);
        bitmap.context.drawImage(canvas, 0, 0);
        canvas.width = 0;
        canvas.height = 0;
    }
    renderTexture.destroy({ destroyBase: true });
    bitmap.baseTexture.update();
    return bitmap;
};

/**
 * Checks whether the bitmap is ready to render.
 *
 * @returns {boolean} True if the bitmap is ready to render.
 */
Bitmap.prototype.isReady = function() {
    return this._loadingState === "loaded" || this._loadingState === "none";
};

/**
 * Checks whether a loading error has occurred.
 *
 * @returns {boolean} True if a loading error has occurred.
 */
Bitmap.prototype.isError = function() {
    return this._loadingState === "error";
};

/**
 * The url of the image file.
 *
 * @readonly
 * @type string
 * @name Bitmap#url
 */
Object.defineProperty(Bitmap.prototype, "url", {
    get: function() {
        return this._url;
    },
    configurable: true
});

/**
 * The base texture that holds the image.
 *
 * @readonly
 * @type PIXI.BaseTexture
 * @name Bitmap#baseTexture
 */
Object.defineProperty(Bitmap.prototype, "baseTexture", {
    get: function() {
        return this._baseTexture;
    },
    configurable: true
});

/**
 * The bitmap image.
 *
 * @readonly
 * @type HTMLImageElement
 * @name Bitmap#image
 */
Object.defineProperty(Bitmap.prototype, "image", {
    get: function() {
        return this._image;
    },
    configurable: true
});

/**
 * The bitmap canvas.
 *
 * @readonly
 * @type HTMLCanvasElement
 * @name Bitmap#canvas
 */
Object.defineProperty(Bitmap.prototype, "canvas", {
    get: function() {
        this._ensureCanvas();
        return this._canvas;
    },
    configurable: true
});

/**
 * The 2d context of the bitmap canvas.
 *
 * @readonly
 * @type CanvasRenderingContext2D
 * @name Bitmap#context
 */
Object.defineProperty(Bitmap.prototype, "context", {
    get: function() {
        this._ensureCanvas();
        return this._context;
    },
    configurable: true
});

/**
 * The width of the bitmap.
 *
 * @readonly
 * @type number
 * @name Bitmap#width
 */
Object.defineProperty(Bitmap.prototype, "width", {
    get: function() {
        const image = this._canvas || this._image;
        return image ? image.width : 0;
    },
    configurable: true
});

/**
 * The height of the bitmap.
 *
 * @readonly
 * @type number
 * @name Bitmap#height
 */
Object.defineProperty(Bitmap.prototype, "height", {
    get: function() {
        const image = this._canvas || this._image;
        return image ? image.height : 0;
    },
    configurable: true
});

/**
 * The rectangle of the bitmap.
 *
 * @readonly
 * @type Rectangle
 * @name Bitmap#rect
 */
Object.defineProperty(Bitmap.prototype, "rect", {
    get: function() {
        return new Rectangle(0, 0, this.width, this.height);
    },
    configurable: true
});

/**
 * Whether the smooth scaling is applied.
 *
 * @type boolean
 * @name Bitmap#smooth
 */
Object.defineProperty(Bitmap.prototype, "smooth", {
    get: function() {
        return this._smooth;
    },
    set: function(value) {
        if (this._smooth !== value) {
            this._smooth = value;
            this._updateScaleMode();
        }
    },
    configurable: true
});

/**
 * The opacity of the drawing object in the range (0, 255).
 *
 * @type number
 * @name Bitmap#paintOpacity
 */
Object.defineProperty(Bitmap.prototype, "paintOpacity", {
    get: function() {
        return this._paintOpacity;
    },
    set: function(value) {
        if (this._paintOpacity !== value) {
            this._paintOpacity = value;
            this.context.globalAlpha = this._paintOpacity / 255;
        }
    },
    configurable: true
});

/**
 * Destroys the bitmap.
 */
Bitmap.prototype.destroy = function() {
    if (this._baseTexture) {
        this._baseTexture.destroy();
        this._baseTexture = null;
    }
    this._destroyCanvas();
};

/**
 * Resizes the bitmap.
 *
 * @param {number} width - The new width of the bitmap.
 * @param {number} height - The new height of the bitmap.
 */
Bitmap.prototype.resize = function(width, height) {
    width = Math.max(width || 0, 1);
    height = Math.max(height || 0, 1);
    this.canvas.width = width;
    this.canvas.height = height;
    this.baseTexture.width = width;
    this.baseTexture.height = height;
};

/**
 * Performs a block transfer.
 *
 * @param {Bitmap} source - The bitmap to draw.
 * @param {number} sx - The x coordinate in the source.
 * @param {number} sy - The y coordinate in the source.
 * @param {number} sw - The width of the source image.
 * @param {number} sh - The height of the source image.
 * @param {number} dx - The x coordinate in the destination.
 * @param {number} dy - The y coordinate in the destination.
 * @param {number} [dw=sw] The width to draw the image in the destination.
 * @param {number} [dh=sh] The height to draw the image in the destination.
 */
Bitmap.prototype.blt = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    try {
        const image = source._canvas || source._image;
        this.context.globalCompositeOperation = "source-over";
        this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        this._baseTexture.update();
    } catch (e) {
        //
    }
};

/**
 * Returns pixel color at the specified point.
 *
 * @param {number} x - The x coordinate of the pixel in the bitmap.
 * @param {number} y - The y coordinate of the pixel in the bitmap.
 * @returns {string} The pixel color (hex format).
 */
Bitmap.prototype.getPixel = function(x, y) {
    const data = this.context.getImageData(x, y, 1, 1).data;
    let result = "#";
    for (let i = 0; i < 3; i++) {
        result += data[i].toString(16).padZero(2);
    }
    return result;
};

/**
 * Returns alpha pixel value at the specified point.
 *
 * @param {number} x - The x coordinate of the pixel in the bitmap.
 * @param {number} y - The y coordinate of the pixel in the bitmap.
 * @returns {string} The alpha value.
 */
Bitmap.prototype.getAlphaPixel = function(x, y) {
    const data = this.context.getImageData(x, y, 1, 1).data;
    return data[3];
};

/**
 * Clears the specified rectangle.
 *
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle to clear.
 * @param {number} height - The height of the rectangle to clear.
 */
Bitmap.prototype.clearRect = function(x, y, width, height) {
    this.context.clearRect(x, y, width, height);
    this._baseTexture.update();
};

/**
 * Clears the entire bitmap.
 */
Bitmap.prototype.clear = function() {
    this.clearRect(0, 0, this.width, this.height);
};

/**
 * Fills the specified rectangle.
 *
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle to fill.
 * @param {number} height - The height of the rectangle to fill.
 * @param {string} color - The color of the rectangle in CSS format.
 */
Bitmap.prototype.fillRect = function(x, y, width, height, color) {
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
    context.restore();
    this._baseTexture.update();
};

/**
 * Fills the entire bitmap.
 *
 * @param {string} color - The color of the rectangle in CSS format.
 */
Bitmap.prototype.fillAll = function(color) {
    this.fillRect(0, 0, this.width, this.height, color);
};

/**
 * Draws the specified rectangular frame.
 *
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle to fill.
 * @param {number} height - The height of the rectangle to fill.
 * @param {string} color - The color of the rectangle in CSS format.
 */
Bitmap.prototype.strokeRect = function(x, y, width, height, color) {
    const context = this.context;
    context.save();
    context.strokeStyle = color;
    context.strokeRect(x, y, width, height);
    context.restore();
    this._baseTexture.update();
};

// prettier-ignore
/**
 * Draws the rectangle with a gradation.
 *
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle to fill.
 * @param {number} height - The height of the rectangle to fill.
 * @param {string} color1 - The gradient starting color.
 * @param {string} color2 - The gradient ending color.
 * @param {boolean} vertical - Whether the gradient should be draw as vertical or not.
 */
Bitmap.prototype.gradientFillRect = function(
    x, y, width, height, color1, color2, vertical
) {
    const context = this.context;
    const x1 = vertical ? x : x + width;
    const y1 = vertical ? y + height : y;
    const grad = context.createLinearGradient(x, y, x1, y1);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    context.save();
    context.fillStyle = grad;
    context.fillRect(x, y, width, height);
    context.restore();
    this._baseTexture.update();
};

/**
 * Draws a bitmap in the shape of a circle.
 *
 * @param {number} x - The x coordinate based on the circle center.
 * @param {number} y - The y coordinate based on the circle center.
 * @param {number} radius - The radius of the circle.
 * @param {string} color - The color of the circle in CSS format.
 */
Bitmap.prototype.drawCircle = function(x, y, radius, color) {
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
    context.restore();
    this._baseTexture.update();
};

/**
 * Draws the outline text to the bitmap.
 *
 * @param {string} text - The text that will be drawn.
 * @param {number} x - The x coordinate for the left of the text.
 * @param {number} y - The y coordinate for the top of the text.
 * @param {number} maxWidth - The maximum allowed width of the text.
 * @param {number} lineHeight - The height of the text line.
 * @param {string} align - The alignment of the text.
 */
Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    // [Note] Different browser makes different rendering with
    //   textBaseline == 'top'. So we use 'alphabetic' here.
    const context = this.context;
    const alpha = context.globalAlpha;
    maxWidth = maxWidth || 0xffffffff;
    let tx = x;
    let ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
    if (align === "center") {
        tx += maxWidth / 2;
    }
    if (align === "right") {
        tx += maxWidth;
    }
    context.save();
    context.font = this._makeFontNameText();
    context.textAlign = align;
    context.textBaseline = "alphabetic";
    context.globalAlpha = 1;
    this._drawTextOutline(text, tx, ty, maxWidth);
    context.globalAlpha = alpha;
    this._drawTextBody(text, tx, ty, maxWidth);
    context.restore();
    this._baseTexture.update();
};

/**
 * Returns the width of the specified text.
 *
 * @param {string} text - The text to be measured.
 * @returns {number} The width of the text in pixels.
 */
Bitmap.prototype.measureTextWidth = function(text) {
    const context = this.context;
    context.save();
    context.font = this._makeFontNameText();
    const width = context.measureText(text).width;
    context.restore();
    return width;
};

/**
 * Adds a callback function that will be called when the bitmap is loaded.
 *
 * @param {function} listner - The callback function.
 */
Bitmap.prototype.addLoadListener = function(listner) {
    if (!this.isReady()) {
        this._loadListeners.push(listner);
    } else {
        listner(this);
    }
};

/**
 * Tries to load the image again.
 */
Bitmap.prototype.retry = function() {
    this._startLoading();
};

Bitmap.prototype._makeFontNameText = function() {
    const italic = this.fontItalic ? "Italic " : "";
    const bold = this.fontBold ? "Bold " : "";
    return italic + bold + this.fontSize + "px " + this.fontFace;
};

Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {
    const context = this.context;
    context.strokeStyle = this.outlineColor;
    context.lineWidth = this.outlineWidth;
    context.lineJoin = "round";
    context.strokeText(text, tx, ty, maxWidth);
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
    const context = this.context;
    context.fillStyle = this.textColor;
    context.fillText(text, tx, ty, maxWidth);
};

Bitmap.prototype._createCanvas = function(width, height) {
    this._canvas = document.createElement("canvas");
    this._context = this._canvas.getContext("2d");
    this._canvas.width = width;
    this._canvas.height = height;
    this._createBaseTexture(this._canvas);
};

Bitmap.prototype._ensureCanvas = function() {
    if (!this._canvas) {
        if (this._image) {
            this._createCanvas(this._image.width, this._image.height);
            this._context.drawImage(this._image, 0, 0);
        } else {
            this._createCanvas(0, 0);
        }
    }
};

Bitmap.prototype._destroyCanvas = function() {
    if (this._canvas) {
        this._canvas.width = 0;
        this._canvas.height = 0;
        this._canvas = null;
    }
};

Bitmap.prototype._createBaseTexture = function(source) {
    this._baseTexture = new PIXI.BaseTexture(source);
    this._baseTexture.mipmap = false;
    this._baseTexture.width = source.width;
    this._baseTexture.height = source.height;
    this._updateScaleMode();
};

Bitmap.prototype._updateScaleMode = function() {
    if (this._baseTexture) {
        if (this._smooth) {
            this._baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        } else {
            this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
    }
};

Bitmap.prototype._startLoading = function() {
    this._image = new Image();
    this._image.onload = this._onLoad.bind(this);
    this._image.onerror = this._onError.bind(this);
    this._destroyCanvas();
    this._loadingState = "loading";
    if (Utils.hasEncryptedImages()) {
        this._startDecrypting();
    } else {
        this._image.src = this._url;
    }
};

Bitmap.prototype._startDecrypting = function() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this._url + "_");
    xhr.responseType = "arraybuffer";
    xhr.onload = () => this._onXhrLoad(xhr);
    xhr.onerror = this._onError.bind(this);
    xhr.send();
};

Bitmap.prototype._onXhrLoad = function(xhr) {
    if (xhr.status < 400) {
        const arrayBuffer = Utils.decryptArrayBuffer(xhr.response);
        const blob = new Blob([arrayBuffer]);
        this._image.src = URL.createObjectURL(blob);
    } else {
        this._onError();
    }
};

Bitmap.prototype._onLoad = function() {
    if (Utils.hasEncryptedImages()) {
        URL.revokeObjectURL(this._image.src);
    }
    this._loadingState = "loaded";
    this._createBaseTexture(this._image);
    this._callLoadListeners();
};

Bitmap.prototype._callLoadListeners = function() {
    while (this._loadListeners.length > 0) {
        const listener = this._loadListeners.shift();
        listener(this);
    }
};

Bitmap.prototype._onError = function() {
    this._loadingState = "error";
};

//-----------------------------------------------------------------------------
/**
 * The basic object that is rendered to the game screen.
 *
 * @class
 * @extends PIXI.Sprite
 * @param {Bitmap} bitmap - The image for the sprite.
 */
function Sprite() {
    this.initialize(...arguments);
}

Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.initialize = function(bitmap) {
    if (!Sprite._emptyBaseTexture) {
        Sprite._emptyBaseTexture = new PIXI.BaseTexture();
        Sprite._emptyBaseTexture.setSize(1, 1);
    }
    const frame = new Rectangle();
    const texture = new PIXI.Texture(Sprite._emptyBaseTexture, frame);
    PIXI.Sprite.call(this, texture);
    this.spriteId = Sprite._counter++;
    this._bitmap = bitmap;
    this._frame = frame;
    this._hue = 0;
    this._blendColor = [0, 0, 0, 0];
    this._colorTone = [0, 0, 0, 0];
    this._colorFilter = null;
    this._blendMode = PIXI.BLEND_MODES.NORMAL;
    this._hidden = false;
    this._onBitmapChange();
};

Sprite._emptyBaseTexture = null;
Sprite._counter = 0;

/**
 * The image for the sprite.
 *
 * @type Bitmap
 * @name Sprite#bitmap
 */
Object.defineProperty(Sprite.prototype, "bitmap", {
    get: function() {
        return this._bitmap;
    },
    set: function(value) {
        if (this._bitmap !== value) {
            this._bitmap = value;
            this._onBitmapChange();
        }
    },
    configurable: true
});

/**
 * The width of the sprite without the scale.
 *
 * @type number
 * @name Sprite#width
 */
Object.defineProperty(Sprite.prototype, "width", {
    get: function() {
        return this._frame.width;
    },
    set: function(value) {
        this._frame.width = value;
        this._refresh();
    },
    configurable: true
});

/**
 * The height of the sprite without the scale.
 *
 * @type number
 * @name Sprite#height
 */
Object.defineProperty(Sprite.prototype, "height", {
    get: function() {
        return this._frame.height;
    },
    set: function(value) {
        this._frame.height = value;
        this._refresh();
    },
    configurable: true
});

/**
 * The opacity of the sprite (0 to 255).
 *
 * @type number
 * @name Sprite#opacity
 */
Object.defineProperty(Sprite.prototype, "opacity", {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * The blend mode to be applied to the sprite.
 *
 * @type number
 * @name Sprite#blendMode
 */
Object.defineProperty(Sprite.prototype, "blendMode", {
    get: function() {
        if (this._colorFilter) {
            return this._colorFilter.blendMode;
        } else {
            return this._blendMode;
        }
    },
    set: function(value) {
        this._blendMode = value;
        if (this._colorFilter) {
            this._colorFilter.blendMode = value;
        }
    },
    configurable: true
});

/**
 * Destroys the sprite.
 */
Sprite.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Sprite.prototype.destroy.call(this, options);
};

/**
 * Updates the sprite for each frame.
 */
Sprite.prototype.update = function() {
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

/**
 * Makes the sprite "hidden".
 */
Sprite.prototype.hide = function() {
    this._hidden = true;
    this.updateVisibility();
};

/**
 * Releases the "hidden" state of the sprite.
 */
Sprite.prototype.show = function() {
    this._hidden = false;
    this.updateVisibility();
};

/**
 * Reflects the "hidden" state of the sprite to the visible state.
 */
Sprite.prototype.updateVisibility = function() {
    this.visible = !this._hidden;
};

/**
 * Sets the x and y at once.
 *
 * @param {number} x - The x coordinate of the sprite.
 * @param {number} y - The y coordinate of the sprite.
 */
Sprite.prototype.move = function(x, y) {
    this.x = x;
    this.y = y;
};

/**
 * Sets the rectagle of the bitmap that the sprite displays.
 *
 * @param {number} x - The x coordinate of the frame.
 * @param {number} y - The y coordinate of the frame.
 * @param {number} width - The width of the frame.
 * @param {number} height - The height of the frame.
 */
Sprite.prototype.setFrame = function(x, y, width, height) {
    this._refreshFrame = false;
    const frame = this._frame;
    if (
        x !== frame.x ||
        y !== frame.y ||
        width !== frame.width ||
        height !== frame.height
    ) {
        frame.x = x;
        frame.y = y;
        frame.width = width;
        frame.height = height;
        this._refresh();
    }
};

/**
 * Sets the hue rotation value.
 *
 * @param {number} hue - The hue value (-360, 360).
 */
Sprite.prototype.setHue = function(hue) {
    if (this._hue !== Number(hue)) {
        this._hue = Number(hue);
        this._updateColorFilter();
    }
};

/**
 * Gets the blend color for the sprite.
 *
 * @returns {array} The blend color [r, g, b, a].
 */
Sprite.prototype.getBlendColor = function() {
    return this._blendColor.clone();
};

/**
 * Sets the blend color for the sprite.
 *
 * @param {array} color - The blend color [r, g, b, a].
 */
Sprite.prototype.setBlendColor = function(color) {
    if (!(color instanceof Array)) {
        throw new Error("Argument must be an array");
    }
    if (!this._blendColor.equals(color)) {
        this._blendColor = color.clone();
        this._updateColorFilter();
    }
};

/**
 * Gets the color tone for the sprite.
 *
 * @returns {array} The color tone [r, g, b, gray].
 */
Sprite.prototype.getColorTone = function() {
    return this._colorTone.clone();
};

/**
 * Sets the color tone for the sprite.
 *
 * @param {array} tone - The color tone [r, g, b, gray].
 */
Sprite.prototype.setColorTone = function(tone) {
    if (!(tone instanceof Array)) {
        throw new Error("Argument must be an array");
    }
    if (!this._colorTone.equals(tone)) {
        this._colorTone = tone.clone();
        this._updateColorFilter();
    }
};

Sprite.prototype._onBitmapChange = function() {
    if (this._bitmap) {
        this._refreshFrame = true;
        this._bitmap.addLoadListener(this._onBitmapLoad.bind(this));
    } else {
        this._refreshFrame = false;
        this.texture.frame = new Rectangle();
    }
};

Sprite.prototype._onBitmapLoad = function(bitmapLoaded) {
    if (bitmapLoaded === this._bitmap) {
        if (this._refreshFrame && this._bitmap) {
            this._refreshFrame = false;
            this._frame.width = this._bitmap.width;
            this._frame.height = this._bitmap.height;
        }
    }
    this._refresh();
};

Sprite.prototype._refresh = function() {
    const texture = this.texture;
    const frameX = Math.floor(this._frame.x);
    const frameY = Math.floor(this._frame.y);
    const frameW = Math.floor(this._frame.width);
    const frameH = Math.floor(this._frame.height);
    const baseTexture = this._bitmap ? this._bitmap.baseTexture : null;
    const baseTextureW = baseTexture ? baseTexture.width : 0;
    const baseTextureH = baseTexture ? baseTexture.height : 0;
    const realX = frameX.clamp(0, baseTextureW);
    const realY = frameY.clamp(0, baseTextureH);
    const realW = (frameW - realX + frameX).clamp(0, baseTextureW - realX);
    const realH = (frameH - realY + frameY).clamp(0, baseTextureH - realY);
    const frame = new Rectangle(realX, realY, realW, realH);
    if (texture) {
        this.pivot.x = frameX - realX;
        this.pivot.y = frameY - realY;
        if (baseTexture) {
            texture.baseTexture = baseTexture;
            try {
                texture.frame = frame;
            } catch (e) {
                texture.frame = new Rectangle();
            }
        }
        texture._updateID++;
    }
};

Sprite.prototype._createColorFilter = function() {
    this._colorFilter = new ColorFilter();
    if (!this.filters) {
        this.filters = [];
    }
    this.filters.push(this._colorFilter);
};

Sprite.prototype._updateColorFilter = function() {
    if (!this._colorFilter) {
        this._createColorFilter();
    }
    this._colorFilter.setHue(this._hue);
    this._colorFilter.setBlendColor(this._blendColor);
    this._colorFilter.setColorTone(this._colorTone);
};

//-----------------------------------------------------------------------------
/**
 * The tilemap which displays 2D tile-based game map.
 *
 * @class
 * @extends PIXI.Container
 */
function Tilemap() {
    this.initialize(...arguments);
}

Tilemap.prototype = Object.create(PIXI.Container.prototype);
Tilemap.prototype.constructor = Tilemap;

Tilemap.prototype.initialize = function() {
    PIXI.Container.call(this);

    this._width = Graphics.width;
    this._height = Graphics.height;
    this._margin = 20;
    this._tileWidth = 48;
    this._tileHeight = 48;
    this._mapWidth = 0;
    this._mapHeight = 0;
    this._mapData = null;
    this._bitmaps = [];

    /**
     * The origin point of the tilemap for scrolling.
     *
     * @type Point
     */
    this.origin = new Point();

    /**
     * The tileset flags.
     *
     * @type array
     */
    this.flags = [];

    /**
     * The animation count for autotiles.
     *
     * @type number
     */
    this.animationCount = 0;

    /**
     * Whether the tilemap loops horizontal.
     *
     * @type boolean
     */
    this.horizontalWrap = false;

    /**
     * Whether the tilemap loops vertical.
     *
     * @type boolean
     */
    this.verticalWrap = false;

    this._createLayers();
    this.refresh();
};

/**
 * The width of the tilemap.
 *
 * @type number
 * @name Tilemap#width
 */
Object.defineProperty(Tilemap.prototype, "width", {
    get: function() {
        return this._width;
    },
    set: function(value) {
        this._width = value;
    },
    configurable: true
});

/**
 * The height of the tilemap.
 *
 * @type number
 * @name Tilemap#height
 */
Object.defineProperty(Tilemap.prototype, "height", {
    get: function() {
        return this._height;
    },
    set: function(value) {
        this._height = value;
    },
    configurable: true
});

/**
 * Destroys the tilemap.
 */
Tilemap.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Container.prototype.destroy.call(this, options);
};

/**
 * Sets the tilemap data.
 *
 * @param {number} width - The width of the map in number of tiles.
 * @param {number} height - The height of the map in number of tiles.
 * @param {array} data - The one dimensional array for the map data.
 */
Tilemap.prototype.setData = function(width, height, data) {
    this._mapWidth = width;
    this._mapHeight = height;
    this._mapData = data;
};

/**
 * Checks whether the tileset is ready to render.
 *
 * @type boolean
 * @returns {boolean} True if the tilemap is ready.
 */
Tilemap.prototype.isReady = function() {
    for (const bitmap of this._bitmaps) {
        if (bitmap && !bitmap.isReady()) {
            return false;
        }
    }
    return true;
};

/**
 * Updates the tilemap for each frame.
 */
Tilemap.prototype.update = function() {
    this.animationCount++;
    this.animationFrame = Math.floor(this.animationCount / 30);
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

/**
 * Sets the bitmaps used as a tileset.
 *
 * @param {array} bitmaps - The array of the tileset bitmaps.
 */
Tilemap.prototype.setBitmaps = function(bitmaps) {
    // [Note] We wait for the images to finish loading. Creating textures
    //   from bitmaps that are not yet loaded here brings some maintenance
    //   difficulties. e.g. PIXI overwrites img.onload internally.
    this._bitmaps = bitmaps;
    const listener = this._updateBitmaps.bind(this);
    for (const bitmap of this._bitmaps) {
        if (!bitmap.isReady()) {
            bitmap.addLoadListener(listener);
        }
    }
    this._needsBitmapsUpdate = true;
    this._updateBitmaps();
};

/**
 * Forces to repaint the entire tilemap.
 */
Tilemap.prototype.refresh = function() {
    this._needsRepaint = true;
};

/**
 * Updates the transform on all children of this container for rendering.
 */
Tilemap.prototype.updateTransform = function() {
    const ox = Math.ceil(this.origin.x);
    const oy = Math.ceil(this.origin.y);
    const startX = Math.floor((ox - this._margin) / this._tileWidth);
    const startY = Math.floor((oy - this._margin) / this._tileHeight);
    this._lowerLayer.x = startX * this._tileWidth - ox;
    this._lowerLayer.y = startY * this._tileHeight - oy;
    this._upperLayer.x = startX * this._tileWidth - ox;
    this._upperLayer.y = startY * this._tileHeight - oy;
    if (
        this._needsRepaint ||
        this._lastAnimationFrame !== this.animationFrame ||
        this._lastStartX !== startX ||
        this._lastStartY !== startY
    ) {
        this._lastAnimationFrame = this.animationFrame;
        this._lastStartX = startX;
        this._lastStartY = startY;
        this._addAllSpots(startX, startY);
        this._needsRepaint = false;
    }
    this._sortChildren();
    PIXI.Container.prototype.updateTransform.call(this);
};

Tilemap.prototype._createLayers = function() {
    /*
     * [Z coordinate]
     *  0 : Lower tiles
     *  1 : Lower characters
     *  3 : Normal characters
     *  4 : Upper tiles
     *  5 : Upper characters
     *  6 : Airship shadow
     *  7 : Balloon
     *  8 : Animation
     *  9 : Destination
     */
    this._lowerLayer = new Tilemap.Layer();
    this._lowerLayer.z = 0;
    this._upperLayer = new Tilemap.Layer();
    this._upperLayer.z = 4;
    this.addChild(this._lowerLayer);
    this.addChild(this._upperLayer);
    this._needsRepaint = true;
};

Tilemap.prototype._updateBitmaps = function() {
    if (this._needsBitmapsUpdate && this.isReady()) {
        this._lowerLayer.setBitmaps(this._bitmaps);
        this._needsBitmapsUpdate = false;
        this._needsRepaint = true;
    }
};

Tilemap.prototype._addAllSpots = function(startX, startY) {
    this._lowerLayer.clear();
    this._upperLayer.clear();
    const widthWithMatgin = this.width + this._margin * 2;
    const heightWithMatgin = this.height + this._margin * 2;
    const tileCols = Math.ceil(widthWithMatgin / this._tileWidth) + 1;
    const tileRows = Math.ceil(heightWithMatgin / this._tileHeight) + 1;
    for (let y = 0; y < tileRows; y++) {
        for (let x = 0; x < tileCols; x++) {
            this._addSpot(startX, startY, x, y);
        }
    }
};

Tilemap.prototype._addSpot = function(startX, startY, x, y) {
    const mx = startX + x;
    const my = startY + y;
    const dx = x * this._tileWidth;
    const dy = y * this._tileHeight;
    const tileId0 = this._readMapData(mx, my, 0);
    const tileId1 = this._readMapData(mx, my, 1);
    const tileId2 = this._readMapData(mx, my, 2);
    const tileId3 = this._readMapData(mx, my, 3);
    const shadowBits = this._readMapData(mx, my, 4);
    const upperTileId1 = this._readMapData(mx, my - 1, 1);

    this._addSpotTile(tileId0, dx, dy);
    this._addSpotTile(tileId1, dx, dy);
    this._addShadow(this._lowerLayer, shadowBits, dx, dy);
    if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
        if (!Tilemap.isShadowingTile(tileId0)) {
            this._addTableEdge(this._lowerLayer, upperTileId1, dx, dy);
        }
    }
    if (this._isOverpassPosition(mx, my)) {
        this._addTile(this._upperLayer, tileId2, dx, dy);
        this._addTile(this._upperLayer, tileId3, dx, dy);
    } else {
        this._addSpotTile(tileId2, dx, dy);
        this._addSpotTile(tileId3, dx, dy);
    }
};

Tilemap.prototype._addSpotTile = function(tileId, dx, dy) {
    if (this._isHigherTile(tileId)) {
        this._addTile(this._upperLayer, tileId, dx, dy);
    } else {
        this._addTile(this._lowerLayer, tileId, dx, dy);
    }
};

Tilemap.prototype._addTile = function(layer, tileId, dx, dy) {
    if (Tilemap.isVisibleTile(tileId)) {
        if (Tilemap.isAutotile(tileId)) {
            this._addAutotile(layer, tileId, dx, dy);
        } else {
            this._addNormalTile(layer, tileId, dx, dy);
        }
    }
};

Tilemap.prototype._addNormalTile = function(layer, tileId, dx, dy) {
    let setNumber = 0;

    if (Tilemap.isTileA5(tileId)) {
        setNumber = 4;
    } else {
        setNumber = 5 + Math.floor(tileId / 256);
    }

    const w = this._tileWidth;
    const h = this._tileHeight;
    const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * w;
    const sy = (Math.floor((tileId % 256) / 8) % 16) * h;

    layer.addRect(setNumber, sx, sy, dx, dy, w, h);
};

Tilemap.prototype._addAutotile = function(layer, tileId, dx, dy) {
    const kind = Tilemap.getAutotileKind(tileId);
    const shape = Tilemap.getAutotileShape(tileId);
    const tx = kind % 8;
    const ty = Math.floor(kind / 8);
    let setNumber = 0;
    let bx = 0;
    let by = 0;
    let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
    let isTable = false;

    if (Tilemap.isTileA1(tileId)) {
        const waterSurfaceIndex = [0, 1, 2, 1][this.animationFrame % 4];
        setNumber = 0;
        if (kind === 0) {
            bx = waterSurfaceIndex * 2;
            by = 0;
        } else if (kind === 1) {
            bx = waterSurfaceIndex * 2;
            by = 3;
        } else if (kind === 2) {
            bx = 6;
            by = 0;
        } else if (kind === 3) {
            bx = 6;
            by = 3;
        } else {
            bx = Math.floor(tx / 4) * 8;
            by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;
            if (kind % 2 === 0) {
                bx += waterSurfaceIndex * 2;
            } else {
                bx += 6;
                autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
                by += this.animationFrame % 3;
            }
        }
    } else if (Tilemap.isTileA2(tileId)) {
        setNumber = 1;
        bx = tx * 2;
        by = (ty - 2) * 3;
        isTable = this._isTableTile(tileId);
    } else if (Tilemap.isTileA3(tileId)) {
        setNumber = 2;
        bx = tx * 2;
        by = (ty - 6) * 2;
        autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
    } else if (Tilemap.isTileA4(tileId)) {
        setNumber = 3;
        bx = tx * 2;
        by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
        if (ty % 2 === 1) {
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
        }
    }

    const table = autotileTable[shape];
    const w1 = this._tileWidth / 2;
    const h1 = this._tileHeight / 2;
    for (let i = 0; i < 4; i++) {
        const qsx = table[i][0];
        const qsy = table[i][1];
        const sx1 = (bx * 2 + qsx) * w1;
        const sy1 = (by * 2 + qsy) * h1;
        const dx1 = dx + (i % 2) * w1;
        const dy1 = dy + Math.floor(i / 2) * h1;
        if (isTable && (qsy === 1 || qsy === 5)) {
            const qsx2 = qsy === 1 ? (4 - qsx) % 4 : qsx;
            const qsy2 = 3;
            const sx2 = (bx * 2 + qsx2) * w1;
            const sy2 = (by * 2 + qsy2) * h1;
            layer.addRect(setNumber, sx2, sy2, dx1, dy1, w1, h1);
            layer.addRect(setNumber, sx1, sy1, dx1, dy1 + h1 / 2, w1, h1 / 2);
        } else {
            layer.addRect(setNumber, sx1, sy1, dx1, dy1, w1, h1);
        }
    }
};

Tilemap.prototype._addTableEdge = function(layer, tileId, dx, dy) {
    if (Tilemap.isTileA2(tileId)) {
        const autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        const kind = Tilemap.getAutotileKind(tileId);
        const shape = Tilemap.getAutotileShape(tileId);
        const tx = kind % 8;
        const ty = Math.floor(kind / 8);
        const setNumber = 1;
        const bx = tx * 2;
        const by = (ty - 2) * 3;
        const table = autotileTable[shape];
        const w1 = this._tileWidth / 2;
        const h1 = this._tileHeight / 2;
        for (let i = 0; i < 2; i++) {
            const qsx = table[2 + i][0];
            const qsy = table[2 + i][1];
            const sx1 = (bx * 2 + qsx) * w1;
            const sy1 = (by * 2 + qsy) * h1 + h1 / 2;
            const dx1 = dx + (i % 2) * w1;
            const dy1 = dy + Math.floor(i / 2) * h1;
            layer.addRect(setNumber, sx1, sy1, dx1, dy1, w1, h1 / 2);
        }
    }
};

Tilemap.prototype._addShadow = function(layer, shadowBits, dx, dy) {
    if (shadowBits & 0x0f) {
        const w1 = this._tileWidth / 2;
        const h1 = this._tileHeight / 2;
        for (let i = 0; i < 4; i++) {
            if (shadowBits & (1 << i)) {
                const dx1 = dx + (i % 2) * w1;
                const dy1 = dy + Math.floor(i / 2) * h1;
                layer.addRect(-1, 0, 0, dx1, dy1, w1, h1);
            }
        }
    }
};

Tilemap.prototype._readMapData = function(x, y, z) {
    if (this._mapData) {
        const width = this._mapWidth;
        const height = this._mapHeight;
        if (this.horizontalWrap) {
            x = x.mod(width);
        }
        if (this.verticalWrap) {
            y = y.mod(height);
        }
        if (x >= 0 && x < width && y >= 0 && y < height) {
            return this._mapData[(z * height + y) * width + x] || 0;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
};

Tilemap.prototype._isHigherTile = function(tileId) {
    return this.flags[tileId] & 0x10;
};

Tilemap.prototype._isTableTile = function(tileId) {
    return Tilemap.isTileA2(tileId) && this.flags[tileId] & 0x80;
};

Tilemap.prototype._isOverpassPosition = function(/*mx, my*/) {
    return false;
};

Tilemap.prototype._sortChildren = function() {
    this.children.sort(this._compareChildOrder.bind(this));
};

Tilemap.prototype._compareChildOrder = function(a, b) {
    if (a.z !== b.z) {
        return a.z - b.z;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Tile type checkers

Tilemap.TILE_ID_B = 0;
Tilemap.TILE_ID_C = 256;
Tilemap.TILE_ID_D = 512;
Tilemap.TILE_ID_E = 768;
Tilemap.TILE_ID_A5 = 1536;
Tilemap.TILE_ID_A1 = 2048;
Tilemap.TILE_ID_A2 = 2816;
Tilemap.TILE_ID_A3 = 4352;
Tilemap.TILE_ID_A4 = 5888;
Tilemap.TILE_ID_MAX = 8192;

Tilemap.isVisibleTile = function(tileId) {
    return tileId > 0 && tileId < this.TILE_ID_MAX;
};

Tilemap.isAutotile = function(tileId) {
    return tileId >= this.TILE_ID_A1;
};

Tilemap.getAutotileKind = function(tileId) {
    return Math.floor((tileId - this.TILE_ID_A1) / 48);
};

Tilemap.getAutotileShape = function(tileId) {
    return (tileId - this.TILE_ID_A1) % 48;
};

Tilemap.makeAutotileId = function(kind, shape) {
    return this.TILE_ID_A1 + kind * 48 + shape;
};

Tilemap.isSameKindTile = function(tileID1, tileID2) {
    if (this.isAutotile(tileID1) && this.isAutotile(tileID2)) {
        return this.getAutotileKind(tileID1) === this.getAutotileKind(tileID2);
    } else {
        return tileID1 === tileID2;
    }
};

Tilemap.isTileA1 = function(tileId) {
    return tileId >= this.TILE_ID_A1 && tileId < this.TILE_ID_A2;
};

Tilemap.isTileA2 = function(tileId) {
    return tileId >= this.TILE_ID_A2 && tileId < this.TILE_ID_A3;
};

Tilemap.isTileA3 = function(tileId) {
    return tileId >= this.TILE_ID_A3 && tileId < this.TILE_ID_A4;
};

Tilemap.isTileA4 = function(tileId) {
    return tileId >= this.TILE_ID_A4 && tileId < this.TILE_ID_MAX;
};

Tilemap.isTileA5 = function(tileId) {
    return tileId >= this.TILE_ID_A5 && tileId < this.TILE_ID_A1;
};

Tilemap.isWaterTile = function(tileId) {
    if (this.isTileA1(tileId)) {
        return !(
            tileId >= this.TILE_ID_A1 + 96 && tileId < this.TILE_ID_A1 + 192
        );
    } else {
        return false;
    }
};

Tilemap.isWaterfallTile = function(tileId) {
    if (tileId >= this.TILE_ID_A1 + 192 && tileId < this.TILE_ID_A2) {
        return this.getAutotileKind(tileId) % 2 === 1;
    } else {
        return false;
    }
};

Tilemap.isGroundTile = function(tileId) {
    return (
        this.isTileA1(tileId) || this.isTileA2(tileId) || this.isTileA5(tileId)
    );
};

Tilemap.isShadowingTile = function(tileId) {
    return this.isTileA3(tileId) || this.isTileA4(tileId);
};

Tilemap.isRoofTile = function(tileId) {
    return this.isTileA3(tileId) && this.getAutotileKind(tileId) % 16 < 8;
};

Tilemap.isWallTopTile = function(tileId) {
    return this.isTileA4(tileId) && this.getAutotileKind(tileId) % 16 < 8;
};

Tilemap.isWallSideTile = function(tileId) {
    return (
        (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
        this.getAutotileKind(tileId) % 16 >= 8
    );
};

Tilemap.isWallTile = function(tileId) {
    return this.isWallTopTile(tileId) || this.isWallSideTile(tileId);
};

Tilemap.isFloorTypeAutotile = function(tileId) {
    return (
        (this.isTileA1(tileId) && !this.isWaterfallTile(tileId)) ||
        this.isTileA2(tileId) ||
        this.isWallTopTile(tileId)
    );
};

Tilemap.isWallTypeAutotile = function(tileId) {
    return this.isRoofTile(tileId) || this.isWallSideTile(tileId);
};

Tilemap.isWaterfallTypeAutotile = function(tileId) {
    return this.isWaterfallTile(tileId);
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Autotile shape number to coordinates of tileset images

// prettier-ignore
Tilemap.FLOOR_AUTOTILE_TABLE = [
    [[2, 4], [1, 4], [2, 3], [1, 3]],
    [[2, 0], [1, 4], [2, 3], [1, 3]],
    [[2, 4], [3, 0], [2, 3], [1, 3]],
    [[2, 0], [3, 0], [2, 3], [1, 3]],
    [[2, 4], [1, 4], [2, 3], [3, 1]],
    [[2, 0], [1, 4], [2, 3], [3, 1]],
    [[2, 4], [3, 0], [2, 3], [3, 1]],
    [[2, 0], [3, 0], [2, 3], [3, 1]],
    [[2, 4], [1, 4], [2, 1], [1, 3]],
    [[2, 0], [1, 4], [2, 1], [1, 3]],
    [[2, 4], [3, 0], [2, 1], [1, 3]],
    [[2, 0], [3, 0], [2, 1], [1, 3]],
    [[2, 4], [1, 4], [2, 1], [3, 1]],
    [[2, 0], [1, 4], [2, 1], [3, 1]],
    [[2, 4], [3, 0], [2, 1], [3, 1]],
    [[2, 0], [3, 0], [2, 1], [3, 1]],
    [[0, 4], [1, 4], [0, 3], [1, 3]],
    [[0, 4], [3, 0], [0, 3], [1, 3]],
    [[0, 4], [1, 4], [0, 3], [3, 1]],
    [[0, 4], [3, 0], [0, 3], [3, 1]],
    [[2, 2], [1, 2], [2, 3], [1, 3]],
    [[2, 2], [1, 2], [2, 3], [3, 1]],
    [[2, 2], [1, 2], [2, 1], [1, 3]],
    [[2, 2], [1, 2], [2, 1], [3, 1]],
    [[2, 4], [3, 4], [2, 3], [3, 3]],
    [[2, 4], [3, 4], [2, 1], [3, 3]],
    [[2, 0], [3, 4], [2, 3], [3, 3]],
    [[2, 0], [3, 4], [2, 1], [3, 3]],
    [[2, 4], [1, 4], [2, 5], [1, 5]],
    [[2, 0], [1, 4], [2, 5], [1, 5]],
    [[2, 4], [3, 0], [2, 5], [1, 5]],
    [[2, 0], [3, 0], [2, 5], [1, 5]],
    [[0, 4], [3, 4], [0, 3], [3, 3]],
    [[2, 2], [1, 2], [2, 5], [1, 5]],
    [[0, 2], [1, 2], [0, 3], [1, 3]],
    [[0, 2], [1, 2], [0, 3], [3, 1]],
    [[2, 2], [3, 2], [2, 3], [3, 3]],
    [[2, 2], [3, 2], [2, 1], [3, 3]],
    [[2, 4], [3, 4], [2, 5], [3, 5]],
    [[2, 0], [3, 4], [2, 5], [3, 5]],
    [[0, 4], [1, 4], [0, 5], [1, 5]],
    [[0, 4], [3, 0], [0, 5], [1, 5]],
    [[0, 2], [3, 2], [0, 3], [3, 3]],
    [[0, 2], [1, 2], [0, 5], [1, 5]],
    [[0, 4], [3, 4], [0, 5], [3, 5]],
    [[2, 2], [3, 2], [2, 5], [3, 5]],
    [[0, 2], [3, 2], [0, 5], [3, 5]],
    [[0, 0], [1, 0], [0, 1], [1, 1]]
];

// prettier-ignore
Tilemap.WALL_AUTOTILE_TABLE = [
    [[2, 2], [1, 2], [2, 1], [1, 1]],
    [[0, 2], [1, 2], [0, 1], [1, 1]],
    [[2, 0], [1, 0], [2, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[2, 2], [3, 2], [2, 1], [3, 1]],
    [[0, 2], [3, 2], [0, 1], [3, 1]],
    [[2, 0], [3, 0], [2, 1], [3, 1]],
    [[0, 0], [3, 0], [0, 1], [3, 1]],
    [[2, 2], [1, 2], [2, 3], [1, 3]],
    [[0, 2], [1, 2], [0, 3], [1, 3]],
    [[2, 0], [1, 0], [2, 3], [1, 3]],
    [[0, 0], [1, 0], [0, 3], [1, 3]],
    [[2, 2], [3, 2], [2, 3], [3, 3]],
    [[0, 2], [3, 2], [0, 3], [3, 3]],
    [[2, 0], [3, 0], [2, 3], [3, 3]],
    [[0, 0], [3, 0], [0, 3], [3, 3]]
];

// prettier-ignore
Tilemap.WATERFALL_AUTOTILE_TABLE = [
    [[2, 0], [1, 0], [2, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[2, 0], [3, 0], [2, 1], [3, 1]],
    [[0, 0], [3, 0], [0, 1], [3, 1]]
];

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Internal classes

Tilemap.Layer = function() {
    this.initialize(...arguments);
};

Tilemap.Layer.prototype = Object.create(PIXI.Container.prototype);
Tilemap.Layer.prototype.constructor = Tilemap.Layer;

Tilemap.Layer.prototype.initialize = function() {
    PIXI.Container.call(this);
    this._elements = [];
    this._indexBuffer = null;
    this._indexArray = new Float32Array(0);
    this._vertexBuffer = null;
    this._vertexArray = new Float32Array(0);
    this._vao = null;
    this._needsTexturesUpdate = false;
    this._needsVertexUpdate = false;
    this._images = [];
    this._state = PIXI.State.for2d();
    this._createVao();
};

Tilemap.Layer.MAX_GL_TEXTURES = 3;
Tilemap.Layer.VERTEX_STRIDE = 9 * 4;

Tilemap.Layer.prototype.destroy = function() {
    if (this._vao) {
        this._vao.destroy();
        this._indexBuffer.destroy();
        this._vertexBuffer.destroy();
    }
    this._indexBuffer = null;
    this._vertexBuffer = null;
    this._vao = null;
};

Tilemap.Layer.prototype.setBitmaps = function(bitmaps) {
    this._images = bitmaps.map(bitmap => bitmap.image || bitmap.canvas);
    this._needsTexturesUpdate = true;
};

Tilemap.Layer.prototype.clear = function() {
    this._elements.length = 0;
    this._needsVertexUpdate = true;
};

Tilemap.Layer.prototype.addRect = function(setNumber, sx, sy, dx, dy, w, h) {
    this._elements.push([setNumber, sx, sy, dx, dy, w, h]);
};

Tilemap.Layer.prototype.render = function(renderer) {
    const gl = renderer.gl;
    const tilemapRenderer = renderer.plugins.rpgtilemap;
    const shader = tilemapRenderer.getShader();
    const matrix = shader.uniforms.uProjectionMatrix;

    renderer.batch.setObjectRenderer(tilemapRenderer);
    renderer.projection.projectionMatrix.copyTo(matrix);
    matrix.append(this.worldTransform);
    renderer.shader.bind(shader);

    if (this._needsTexturesUpdate) {
        tilemapRenderer.updateTextures(renderer, this._images);
        this._needsTexturesUpdate = false;
    }
    tilemapRenderer.bindTextures(renderer);
    renderer.geometry.bind(this._vao, shader);
    this._updateIndexBuffer();
    if (this._needsVertexUpdate) {
        this._updateVertexBuffer();
        this._needsVertexUpdate = false;
    }
    renderer.geometry.updateBuffers();

    const numElements = this._elements.length;
    if (numElements > 0) {
        renderer.state.set(this._state);
        renderer.geometry.draw(gl.TRIANGLES, numElements * 6, 0);
    }
};

Tilemap.Layer.prototype.isReady = function() {
    if (this._images.length === 0) {
        return false;
    }
    for (const texture of this._images) {
        if (!texture || !texture.valid) {
            return false;
        }
    }
    return true;
};

Tilemap.Layer.prototype._createVao = function() {
    const ib = new PIXI.Buffer(null, true, true);
    const vb = new PIXI.Buffer(null, true, false);
    const stride = Tilemap.Layer.VERTEX_STRIDE;
    const type = PIXI.TYPES.FLOAT;
    const geometry = new PIXI.Geometry();
    this._indexBuffer = ib;
    this._vertexBuffer = vb;
    this._vao = geometry
        .addIndex(this._indexBuffer)
        .addAttribute("aTextureId", vb, 1, false, type, stride, 0)
        .addAttribute("aFrame", vb, 4, false, type, stride, 1 * 4)
        .addAttribute("aSource", vb, 2, false, type, stride, 5 * 4)
        .addAttribute("aDest", vb, 2, false, type, stride, 7 * 4);
};

Tilemap.Layer.prototype._updateIndexBuffer = function() {
    const numElements = this._elements.length;
    if (this._indexArray.length < numElements * 6 * 2) {
        this._indexArray = PIXI.utils.createIndicesForQuads(numElements * 2);
        this._indexBuffer.update(this._indexArray);
    }
};

Tilemap.Layer.prototype._updateVertexBuffer = function() {
    const numElements = this._elements.length;
    const required = numElements * Tilemap.Layer.VERTEX_STRIDE;
    if (this._vertexArray.length < required) {
        this._vertexArray = new Float32Array(required * 2);
    }
    const vertexArray = this._vertexArray;
    let index = 0;
    for (const item of this._elements) {
        const setNumber = item[0];
        const tid = setNumber >> 2;
        const sxOffset = 1024 * (setNumber & 1);
        const syOffset = 1024 * ((setNumber >> 1) & 1);
        const sx = item[1] + sxOffset;
        const sy = item[2] + syOffset;
        const dx = item[3];
        const dy = item[4];
        const w = item[5];
        const h = item[6];
        const frameLeft = sx + 0.5;
        const frameTop = sy + 0.5;
        const frameRight = sx + w - 0.5;
        const frameBottom = sy + h - 0.5;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy + h;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy + h;
    }
    this._vertexBuffer.update(vertexArray);
};

Tilemap.Renderer = function() {
    this.initialize(...arguments);
};

Tilemap.Renderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
Tilemap.Renderer.prototype.constructor = Tilemap.Renderer;

Tilemap.Renderer.prototype.initialize = function(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
    this._shader = null;
    this._images = [];
    this._internalTextures = [];
    this._clearBuffer = new Uint8Array(1024 * 1024 * 4);
    this.contextChange();
};

Tilemap.Renderer.prototype.destroy = function() {
    PIXI.ObjectRenderer.prototype.destroy.call(this);
    this._destroyInternalTextures();
    this._shader.destroy();
    this._shader = null;
};

Tilemap.Renderer.prototype.getShader = function() {
    return this._shader;
};

Tilemap.Renderer.prototype.contextChange = function() {
    this._shader = this._createShader();
    this._images = [];
    this._createInternalTextures();
};

Tilemap.Renderer.prototype._createShader = function() {
    const vertexSrc =
        "attribute float aTextureId;" +
        "attribute vec4 aFrame;" +
        "attribute vec2 aSource;" +
        "attribute vec2 aDest;" +
        "uniform mat3 uProjectionMatrix;" +
        "varying vec4 vFrame;" +
        "varying vec2 vTextureCoord;" +
        "varying float vTextureId;" +
        "void main(void) {" +
        "  vec3 position = uProjectionMatrix * vec3(aDest, 1.0);" +
        "  gl_Position = vec4(position, 1.0);" +
        "  vFrame = aFrame;" +
        "  vTextureCoord = aSource;" +
        "  vTextureId = aTextureId;" +
        "}";
    const fragmentSrc =
        "varying vec4 vFrame;" +
        "varying vec2 vTextureCoord;" +
        "varying float vTextureId;" +
        "uniform sampler2D uSampler0;" +
        "uniform sampler2D uSampler1;" +
        "uniform sampler2D uSampler2;" +
        "void main(void) {" +
        "  vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);" +
        "  int textureId = int(vTextureId);" +
        "  vec4 color;" +
        "  if (textureId < 0) {" +
        "    color = vec4(0.0, 0.0, 0.0, 0.5);" +
        "  } else if (textureId == 0) {" +
        "    color = texture2D(uSampler0, textureCoord / 2048.0);" +
        "  } else if (textureId == 1) {" +
        "    color = texture2D(uSampler1, textureCoord / 2048.0);" +
        "  } else if (textureId == 2) {" +
        "    color = texture2D(uSampler2, textureCoord / 2048.0);" +
        "  }" +
        "  gl_FragColor = color;" +
        "}";

    return new PIXI.Shader(PIXI.Program.from(vertexSrc, fragmentSrc), {
        uSampler0: 0,
        uSampler1: 1,
        uSampler2: 2,
        uProjectionMatrix: new PIXI.Matrix()
    });
};

Tilemap.Renderer.prototype._createInternalTextures = function() {
    this._destroyInternalTextures();
    for (let i = 0; i < Tilemap.Layer.MAX_GL_TEXTURES; i++) {
        const baseTexture = new PIXI.BaseRenderTexture();
        baseTexture.resize(2048, 2048);
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this._internalTextures.push(baseTexture);
    }
};

Tilemap.Renderer.prototype._destroyInternalTextures = function() {
    for (const internalTexture of this._internalTextures) {
        internalTexture.destroy();
    }
    this._internalTextures = [];
};

Tilemap.Renderer.prototype.updateTextures = function(renderer, images) {
    for (let i = 0; i < images.length; i++) {
        const internalTexture = this._internalTextures[i >> 2];
        renderer.texture.bind(internalTexture, 0);
        const gl = renderer.gl;
        const x = 1024 * (i % 2);
        const y = 1024 * ((i >> 1) % 2);
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        // prettier-ignore
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1024, 1024, format, type,
                         this._clearBuffer);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, format, type, images[i]);
    }
};

Tilemap.Renderer.prototype.bindTextures = function(renderer) {
    for (let ti = 0; ti < Tilemap.Layer.MAX_GL_TEXTURES; ti++) {
        renderer.texture.bind(this._internalTextures[ti], ti);
    }
};

PIXI.Renderer.registerPlugin("rpgtilemap", Tilemap.Renderer);

//-----------------------------------------------------------------------------
/**
 * The sprite object for a tiling image.
 *
 * @class
 * @extends PIXI.TilingSprite
 * @param {Bitmap} bitmap - The image for the tiling sprite.
 */
function TilingSprite() {
    this.initialize(...arguments);
}

TilingSprite.prototype = Object.create(PIXI.TilingSprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;

TilingSprite.prototype.initialize = function(bitmap) {
    if (!TilingSprite._emptyBaseTexture) {
        TilingSprite._emptyBaseTexture = new PIXI.BaseTexture();
        TilingSprite._emptyBaseTexture.setSize(1, 1);
    }
    const frame = new Rectangle();
    const texture = new PIXI.Texture(TilingSprite._emptyBaseTexture, frame);
    PIXI.TilingSprite.call(this, texture);
    this._bitmap = bitmap;
    this._width = 0;
    this._height = 0;
    this._frame = frame;

    /**
     * The origin point of the tiling sprite for scrolling.
     *
     * @type Point
     */
    this.origin = new Point();

    this._onBitmapChange();
};

TilingSprite._emptyBaseTexture = null;

/**
 * The image for the tiling sprite.
 *
 * @type Bitmap
 * @name TilingSprite#bitmap
 */
Object.defineProperty(TilingSprite.prototype, "bitmap", {
    get: function() {
        return this._bitmap;
    },
    set: function(value) {
        if (this._bitmap !== value) {
            this._bitmap = value;
            this._onBitmapChange();
        }
    },
    configurable: true
});

/**
 * The opacity of the tiling sprite (0 to 255).
 *
 * @type number
 * @name TilingSprite#opacity
 */
Object.defineProperty(TilingSprite.prototype, "opacity", {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * Destroys the tiling sprite.
 */
TilingSprite.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.TilingSprite.prototype.destroy.call(this, options);
};

/**
 * Updates the tiling sprite for each frame.
 */
TilingSprite.prototype.update = function() {
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

/**
 * Sets the x, y, width, and height all at once.
 *
 * @param {number} x - The x coordinate of the tiling sprite.
 * @param {number} y - The y coordinate of the tiling sprite.
 * @param {number} width - The width of the tiling sprite.
 * @param {number} height - The height of the tiling sprite.
 */
TilingSprite.prototype.move = function(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this._width = width || 0;
    this._height = height || 0;
};

/**
 * Specifies the region of the image that the tiling sprite will use.
 *
 * @param {number} x - The x coordinate of the frame.
 * @param {number} y - The y coordinate of the frame.
 * @param {number} width - The width of the frame.
 * @param {number} height - The height of the frame.
 */
TilingSprite.prototype.setFrame = function(x, y, width, height) {
    this._frame.x = x;
    this._frame.y = y;
    this._frame.width = width;
    this._frame.height = height;
    this._refresh();
};

/**
 * Updates the transform on all children of this container for rendering.
 */
TilingSprite.prototype.updateTransform = function() {
    this.tilePosition.x = Math.round(-this.origin.x);
    this.tilePosition.y = Math.round(-this.origin.y);
    PIXI.TilingSprite.prototype.updateTransform.call(this);
};

TilingSprite.prototype._onBitmapChange = function() {
    if (this._bitmap) {
        this._bitmap.addLoadListener(this._onBitmapLoad.bind(this));
    } else {
        this.texture.frame = new Rectangle();
    }
};

TilingSprite.prototype._onBitmapLoad = function() {
    this.texture.baseTexture = this._bitmap.baseTexture;
    this._refresh();
};

TilingSprite.prototype._refresh = function() {
    const texture = this.texture;
    const frame = this._frame.clone();
    if (frame.width === 0 && frame.height === 0 && this._bitmap) {
        frame.width = this._bitmap.width;
        frame.height = this._bitmap.height;
    }
    if (texture) {
        if (texture.baseTexture) {
            try {
                texture.frame = frame;
            } catch (e) {
                texture.frame = new Rectangle();
            }
        }
        texture._updateID++;
    }
};

//-----------------------------------------------------------------------------
/**
 * The sprite which covers the entire game screen.
 *
 * @class
 * @extends PIXI.Container
 */
function ScreenSprite() {
    this.initialize(...arguments);
}

ScreenSprite.prototype = Object.create(PIXI.Container.prototype);
ScreenSprite.prototype.constructor = ScreenSprite;

ScreenSprite.prototype.initialize = function() {
    PIXI.Container.call(this);
    this._graphics = new PIXI.Graphics();
    this.addChild(this._graphics);
    this.opacity = 0;
    this._red = -1;
    this._green = -1;
    this._blue = -1;
    this.setBlack();
};

/**
 * The opacity of the sprite (0 to 255).
 *
 * @type number
 * @name ScreenSprite#opacity
 */
Object.defineProperty(ScreenSprite.prototype, "opacity", {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * Destroys the screen sprite.
 */
ScreenSprite.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Container.prototype.destroy.call(this, options);
};

/**
 * Sets black to the color of the screen sprite.
 */
ScreenSprite.prototype.setBlack = function() {
    this.setColor(0, 0, 0);
};

/**
 * Sets white to the color of the screen sprite.
 */
ScreenSprite.prototype.setWhite = function() {
    this.setColor(255, 255, 255);
};

/**
 * Sets the color of the screen sprite by values.
 *
 * @param {number} r - The red value in the range (0, 255).
 * @param {number} g - The green value in the range (0, 255).
 * @param {number} b - The blue value in the range (0, 255).
 */
ScreenSprite.prototype.setColor = function(r, g, b) {
    if (this._red !== r || this._green !== g || this._blue !== b) {
        r = Math.round(r || 0).clamp(0, 255);
        g = Math.round(g || 0).clamp(0, 255);
        b = Math.round(b || 0).clamp(0, 255);
        this._red = r;
        this._green = g;
        this._blue = b;
        const graphics = this._graphics;
        graphics.clear();
        graphics.beginFill((r << 16) | (g << 8) | b, 1);
        graphics.drawRect(-50000, -50000, 100000, 100000);
    }
};

//-----------------------------------------------------------------------------
/**
 * The window in the game.
 *
 * @class
 * @extends PIXI.Container
 */
function Window() {
    this.initialize(...arguments);
}

Window.prototype = Object.create(PIXI.Container.prototype);
Window.prototype.constructor = Window;

Window.prototype.initialize = function() {
    PIXI.Container.call(this);

    this._isWindow = true;
    this._windowskin = null;
    this._width = 0;
    this._height = 0;
    this._cursorRect = new Rectangle();
    this._openness = 255;
    this._animationCount = 0;

    this._padding = 12;
    this._margin = 4;
    this._colorTone = [0, 0, 0, 0];
    this._innerChildren = [];

    this._container = null;
    this._backSprite = null;
    this._frameSprite = null;
    this._contentsBackSprite = null;
    this._cursorSprite = null;
    this._contentsSprite = null;
    this._downArrowSprite = null;
    this._upArrowSprite = null;
    this._pauseSignSprite = null;

    this._createAllParts();

    /**
     * The origin point of the window for scrolling.
     *
     * @type Point
     */
    this.origin = new Point();

    /**
     * The active state for the window.
     *
     * @type boolean
     */
    this.active = true;

    /**
     * The visibility of the frame.
     *
     * @type boolean
     */
    this.frameVisible = true;

    /**
     * The visibility of the cursor.
     *
     * @type boolean
     */
    this.cursorVisible = true;

    /**
     * The visibility of the down scroll arrow.
     *
     * @type boolean
     */
    this.downArrowVisible = false;

    /**
     * The visibility of the up scroll arrow.
     *
     * @type boolean
     */
    this.upArrowVisible = false;

    /**
     * The visibility of the pause sign.
     *
     * @type boolean
     */
    this.pause = false;
};

/**
 * The image used as a window skin.
 *
 * @type Bitmap
 * @name Window#windowskin
 */
Object.defineProperty(Window.prototype, "windowskin", {
    get: function() {
        return this._windowskin;
    },
    set: function(value) {
        if (this._windowskin !== value) {
            this._windowskin = value;
            this._windowskin.addLoadListener(this._onWindowskinLoad.bind(this));
        }
    },
    configurable: true
});

/**
 * The bitmap used for the window contents.
 *
 * @type Bitmap
 * @name Window#contents
 */
Object.defineProperty(Window.prototype, "contents", {
    get: function() {
        return this._contentsSprite.bitmap;
    },
    set: function(value) {
        this._contentsSprite.bitmap = value;
    },
    configurable: true
});

/**
 * The bitmap used for the window contents background.
 *
 * @type Bitmap
 * @name Window#contentsBack
 */
Object.defineProperty(Window.prototype, "contentsBack", {
    get: function() {
        return this._contentsBackSprite.bitmap;
    },
    set: function(value) {
        this._contentsBackSprite.bitmap = value;
    },
    configurable: true
});

/**
 * The width of the window in pixels.
 *
 * @type number
 * @name Window#width
 */
Object.defineProperty(Window.prototype, "width", {
    get: function() {
        return this._width;
    },
    set: function(value) {
        this._width = value;
        this._refreshAllParts();
    },
    configurable: true
});

/**
 * The height of the window in pixels.
 *
 * @type number
 * @name Window#height
 */
Object.defineProperty(Window.prototype, "height", {
    get: function() {
        return this._height;
    },
    set: function(value) {
        this._height = value;
        this._refreshAllParts();
    },
    configurable: true
});

/**
 * The size of the padding between the frame and contents.
 *
 * @type number
 * @name Window#padding
 */
Object.defineProperty(Window.prototype, "padding", {
    get: function() {
        return this._padding;
    },
    set: function(value) {
        this._padding = value;
        this._refreshAllParts();
    },
    configurable: true
});

/**
 * The size of the margin for the window background.
 *
 * @type number
 * @name Window#margin
 */
Object.defineProperty(Window.prototype, "margin", {
    get: function() {
        return this._margin;
    },
    set: function(value) {
        this._margin = value;
        this._refreshAllParts();
    },
    configurable: true
});

/**
 * The opacity of the window without contents (0 to 255).
 *
 * @type number
 * @name Window#opacity
 */
Object.defineProperty(Window.prototype, "opacity", {
    get: function() {
        return this._container.alpha * 255;
    },
    set: function(value) {
        this._container.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * The opacity of the window background (0 to 255).
 *
 * @type number
 * @name Window#backOpacity
 */
Object.defineProperty(Window.prototype, "backOpacity", {
    get: function() {
        return this._backSprite.alpha * 255;
    },
    set: function(value) {
        this._backSprite.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * The opacity of the window contents (0 to 255).
 *
 * @type number
 * @name Window#contentsOpacity
 */
Object.defineProperty(Window.prototype, "contentsOpacity", {
    get: function() {
        return this._contentsSprite.alpha * 255;
    },
    set: function(value) {
        this._contentsSprite.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

/**
 * The openness of the window (0 to 255).
 *
 * @type number
 * @name Window#openness
 */
Object.defineProperty(Window.prototype, "openness", {
    get: function() {
        return this._openness;
    },
    set: function(value) {
        if (this._openness !== value) {
            this._openness = value.clamp(0, 255);
            this._container.scale.y = this._openness / 255;
            this._container.y = (this.height / 2) * (1 - this._openness / 255);
        }
    },
    configurable: true
});

/**
 * The width of the content area in pixels.
 *
 * @readonly
 * @type number
 * @name Window#innerWidth
 */
Object.defineProperty(Window.prototype, "innerWidth", {
    get: function() {
        return Math.max(0, this._width - this._padding * 2);
    },
    configurable: true
});

/**
 * The height of the content area in pixels.
 *
 * @readonly
 * @type number
 * @name Window#innerHeight
 */
Object.defineProperty(Window.prototype, "innerHeight", {
    get: function() {
        return Math.max(0, this._height - this._padding * 2);
    },
    configurable: true
});

/**
 * The rectangle of the content area.
 *
 * @readonly
 * @type Rectangle
 * @name Window#innerRect
 */
Object.defineProperty(Window.prototype, "innerRect", {
    get: function() {
        return new Rectangle(
            this._padding,
            this._padding,
            this.innerWidth,
            this.innerHeight
        );
    },
    configurable: true
});

/**
 * Destroys the window.
 */
Window.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Container.prototype.destroy.call(this, options);
};

/**
 * Updates the window for each frame.
 */
Window.prototype.update = function() {
    if (this.active) {
        this._animationCount++;
    }
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

/**
 * Sets the x, y, width, and height all at once.
 *
 * @param {number} x - The x coordinate of the window.
 * @param {number} y - The y coordinate of the window.
 * @param {number} width - The width of the window.
 * @param {number} height - The height of the window.
 */
Window.prototype.move = function(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    if (this._width !== width || this._height !== height) {
        this._width = width || 0;
        this._height = height || 0;
        this._refreshAllParts();
    }
};

/**
 * Checks whether the window is completely open (openness == 255).
 *
 * @returns {boolean} True if the window is open.
 */
Window.prototype.isOpen = function() {
    return this._openness >= 255;
};

/**
 * Checks whether the window is completely closed (openness == 0).
 *
 * @returns {boolean} True if the window is closed.
 */
Window.prototype.isClosed = function() {
    return this._openness <= 0;
};

/**
 * Sets the position of the command cursor.
 *
 * @param {number} x - The x coordinate of the cursor.
 * @param {number} y - The y coordinate of the cursor.
 * @param {number} width - The width of the cursor.
 * @param {number} height - The height of the cursor.
 */
Window.prototype.setCursorRect = function(x, y, width, height) {
    const cw = Math.floor(width || 0);
    const ch = Math.floor(height || 0);
    this._cursorRect.x = Math.floor(x || 0);
    this._cursorRect.y = Math.floor(y || 0);
    if (this._cursorRect.width !== cw || this._cursorRect.height !== ch) {
        this._cursorRect.width = cw;
        this._cursorRect.height = ch;
        this._refreshCursor();
    }
};

/**
 * Moves the cursor position by the given amount.
 *
 * @param {number} x - The amount of horizontal movement.
 * @param {number} y - The amount of vertical movement.
 */
Window.prototype.moveCursorBy = function(x, y) {
    this._cursorRect.x += x;
    this._cursorRect.y += y;
};

/**
 * Moves the inner children by the given amount.
 *
 * @param {number} x - The amount of horizontal movement.
 * @param {number} y - The amount of vertical movement.
 */
Window.prototype.moveInnerChildrenBy = function(x, y) {
    for (const child of this._innerChildren) {
        child.x += x;
        child.y += y;
    }
};

/**
 * Changes the color of the background.
 *
 * @param {number} r - The red value in the range (-255, 255).
 * @param {number} g - The green value in the range (-255, 255).
 * @param {number} b - The blue value in the range (-255, 255).
 */
Window.prototype.setTone = function(r, g, b) {
    const tone = this._colorTone;
    if (r !== tone[0] || g !== tone[1] || b !== tone[2]) {
        this._colorTone = [r, g, b, 0];
        this._refreshBack();
    }
};

/**
 * Adds a child between the background and contents.
 *
 * @param {object} child - The child to add.
 * @returns {object} The child that was added.
 */
Window.prototype.addChildToBack = function(child) {
    const containerIndex = this.children.indexOf(this._container);
    return this.addChildAt(child, containerIndex + 1);
};

/**
 * Adds a child to the client area.
 *
 * @param {object} child - The child to add.
 * @returns {object} The child that was added.
 */
Window.prototype.addInnerChild = function(child) {
    this._innerChildren.push(child);
    return this._clientArea.addChild(child);
};

/**
 * Updates the transform on all children of this container for rendering.
 */
Window.prototype.updateTransform = function() {
    this._updateClientArea();
    this._updateFrame();
    this._updateContentsBack();
    this._updateCursor();
    this._updateContents();
    this._updateArrows();
    this._updatePauseSign();
    PIXI.Container.prototype.updateTransform.call(this);
    this._updateFilterArea();
};

/**
 * Draws the window shape into PIXI.Graphics object. Used by WindowLayer.
 */
Window.prototype.drawShape = function(graphics) {
    if (graphics) {
        const width = this.width;
        const height = (this.height * this._openness) / 255;
        const x = this.x;
        const y = this.y + (this.height - height) / 2;
        graphics.beginFill(0xffffff);
        graphics.drawRoundedRect(x, y, width, height, 0);
        graphics.endFill();
    }
};

Window.prototype._createAllParts = function() {
    this._createContainer();
    this._createBackSprite();
    this._createFrameSprite();
    this._createClientArea();
    this._createContentsBackSprite();
    this._createCursorSprite();
    this._createContentsSprite();
    this._createArrowSprites();
    this._createPauseSignSprites();
};

Window.prototype._createContainer = function() {
    this._container = new PIXI.Container();
    this.addChild(this._container);
};

Window.prototype._createBackSprite = function() {
    this._backSprite = new Sprite();
    this._backSprite.addChild(new TilingSprite());
    this._container.addChild(this._backSprite);
};

Window.prototype._createFrameSprite = function() {
    this._frameSprite = new Sprite();
    for (let i = 0; i < 8; i++) {
        this._frameSprite.addChild(new Sprite());
    }
    this._container.addChild(this._frameSprite);
};

Window.prototype._createClientArea = function() {
    this._clientArea = new Sprite();
    this._clientArea.filters = [new PIXI.filters.AlphaFilter()];
    this._clientArea.filterArea = new Rectangle();
    this._clientArea.move(this._padding, this._padding);
    this.addChild(this._clientArea);
};

Window.prototype._createContentsBackSprite = function() {
    this._contentsBackSprite = new Sprite();
    this._clientArea.addChild(this._contentsBackSprite);
};

Window.prototype._createCursorSprite = function() {
    this._cursorSprite = new Sprite();
    for (let i = 0; i < 9; i++) {
        this._cursorSprite.addChild(new Sprite());
    }
    this._clientArea.addChild(this._cursorSprite);
};

Window.prototype._createContentsSprite = function() {
    this._contentsSprite = new Sprite();
    this._clientArea.addChild(this._contentsSprite);
};

Window.prototype._createArrowSprites = function() {
    this._downArrowSprite = new Sprite();
    this.addChild(this._downArrowSprite);
    this._upArrowSprite = new Sprite();
    this.addChild(this._upArrowSprite);
};

Window.prototype._createPauseSignSprites = function() {
    this._pauseSignSprite = new Sprite();
    this.addChild(this._pauseSignSprite);
};

Window.prototype._onWindowskinLoad = function() {
    this._refreshAllParts();
};

Window.prototype._refreshAllParts = function() {
    this._refreshBack();
    this._refreshFrame();
    this._refreshCursor();
    this._refreshArrows();
    this._refreshPauseSign();
};

Window.prototype._refreshBack = function() {
    const m = this._margin;
    const w = Math.max(0, this._width - m * 2);
    const h = Math.max(0, this._height - m * 2);
    const sprite = this._backSprite;
    const tilingSprite = sprite.children[0];
    sprite.bitmap = this._windowskin;
    sprite.setFrame(0, 0, 96, 96);
    sprite.move(m, m);
    sprite.scale.x = w / 96;
    sprite.scale.y = h / 96;
    tilingSprite.bitmap = this._windowskin;
    tilingSprite.setFrame(0, 96, 96, 96);
    tilingSprite.move(0, 0, w, h);
    tilingSprite.scale.x = 96 / w;
    tilingSprite.scale.y = 96 / h;
    sprite.setColorTone(this._colorTone);
};

Window.prototype._refreshFrame = function() {
    const drect = { x: 0, y: 0, width: this._width, height: this._height };
    const srect = { x: 96, y: 0, width: 96, height: 96 };
    const m = 24;
    for (const child of this._frameSprite.children) {
        child.bitmap = this._windowskin;
    }
    this._setRectPartsGeometry(this._frameSprite, srect, drect, m);
};

Window.prototype._refreshCursor = function() {
    const drect = this._cursorRect.clone();
    const srect = { x: 96, y: 96, width: 48, height: 48 };
    const m = 4;
    for (const child of this._cursorSprite.children) {
        child.bitmap = this._windowskin;
    }
    this._setRectPartsGeometry(this._cursorSprite, srect, drect, m);
};

Window.prototype._setRectPartsGeometry = function(sprite, srect, drect, m) {
    const sx = srect.x;
    const sy = srect.y;
    const sw = srect.width;
    const sh = srect.height;
    const dx = drect.x;
    const dy = drect.y;
    const dw = drect.width;
    const dh = drect.height;
    const smw = sw - m * 2;
    const smh = sh - m * 2;
    const dmw = dw - m * 2;
    const dmh = dh - m * 2;
    const children = sprite.children;
    sprite.setFrame(0, 0, dw, dh);
    sprite.move(dx, dy);
    // corner
    children[0].setFrame(sx, sy, m, m);
    children[1].setFrame(sx + sw - m, sy, m, m);
    children[2].setFrame(sx, sy + sw - m, m, m);
    children[3].setFrame(sx + sw - m, sy + sw - m, m, m);
    children[0].move(0, 0);
    children[1].move(dw - m, 0);
    children[2].move(0, dh - m);
    children[3].move(dw - m, dh - m);
    // edge
    children[4].move(m, 0);
    children[5].move(m, dh - m);
    children[6].move(0, m);
    children[7].move(dw - m, m);
    children[4].setFrame(sx + m, sy, smw, m);
    children[5].setFrame(sx + m, sy + sw - m, smw, m);
    children[6].setFrame(sx, sy + m, m, smh);
    children[7].setFrame(sx + sw - m, sy + m, m, smh);
    children[4].scale.x = dmw / smw;
    children[5].scale.x = dmw / smw;
    children[6].scale.y = dmh / smh;
    children[7].scale.y = dmh / smh;
    // center
    if (children[8]) {
        children[8].setFrame(sx + m, sy + m, smw, smh);
        children[8].move(m, m);
        children[8].scale.x = dmw / smw;
        children[8].scale.y = dmh / smh;
    }
    for (const child of children) {
        child.visible = dw > 0 && dh > 0;
    }
};

Window.prototype._refreshArrows = function() {
    const w = this._width;
    const h = this._height;
    const p = 24;
    const q = p / 2;
    const sx = 96 + p;
    const sy = 0 + p;
    this._downArrowSprite.bitmap = this._windowskin;
    this._downArrowSprite.anchor.x = 0.5;
    this._downArrowSprite.anchor.y = 0.5;
    this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q);
    this._downArrowSprite.move(w / 2, h - q);
    this._upArrowSprite.bitmap = this._windowskin;
    this._upArrowSprite.anchor.x = 0.5;
    this._upArrowSprite.anchor.y = 0.5;
    this._upArrowSprite.setFrame(sx + q, sy, p, q);
    this._upArrowSprite.move(w / 2, q);
};

Window.prototype._refreshPauseSign = function() {
    const sx = 144;
    const sy = 96;
    const p = 24;
    this._pauseSignSprite.bitmap = this._windowskin;
    this._pauseSignSprite.anchor.x = 0.5;
    this._pauseSignSprite.anchor.y = 1;
    this._pauseSignSprite.move(this._width / 2, this._height);
    this._pauseSignSprite.setFrame(sx, sy, p, p);
    this._pauseSignSprite.alpha = 0;
};

Window.prototype._updateClientArea = function() {
    const pad = this._padding;
    this._clientArea.move(pad, pad);
    this._clientArea.x = pad - this.origin.x;
    this._clientArea.y = pad - this.origin.y;
    if (this.innerWidth > 0 && this.innerHeight > 0) {
        this._clientArea.visible = this.isOpen();
    } else {
        this._clientArea.visible = false;
    }
};

Window.prototype._updateFrame = function() {
    this._frameSprite.visible = this.frameVisible;
};

Window.prototype._updateContentsBack = function() {
    const bitmap = this._contentsBackSprite.bitmap;
    if (bitmap) {
        this._contentsBackSprite.setFrame(0, 0, bitmap.width, bitmap.height);
    }
};

Window.prototype._updateCursor = function() {
    this._cursorSprite.alpha = this._makeCursorAlpha();
    this._cursorSprite.visible = this.isOpen() && this.cursorVisible;
    this._cursorSprite.x = this._cursorRect.x;
    this._cursorSprite.y = this._cursorRect.y;
};

Window.prototype._makeCursorAlpha = function() {
    const blinkCount = this._animationCount % 40;
    const baseAlpha = this.contentsOpacity / 255;
    if (this.active) {
        if (blinkCount < 20) {
            return baseAlpha - blinkCount / 32;
        } else {
            return baseAlpha - (40 - blinkCount) / 32;
        }
    }
    return baseAlpha;
};

Window.prototype._updateContents = function() {
    const bitmap = this._contentsSprite.bitmap;
    if (bitmap) {
        this._contentsSprite.setFrame(0, 0, bitmap.width, bitmap.height);
    }
};

Window.prototype._updateArrows = function() {
    this._downArrowSprite.visible = this.isOpen() && this.downArrowVisible;
    this._upArrowSprite.visible = this.isOpen() && this.upArrowVisible;
};

Window.prototype._updatePauseSign = function() {
    const sprite = this._pauseSignSprite;
    const x = Math.floor(this._animationCount / 16) % 2;
    const y = Math.floor(this._animationCount / 16 / 2) % 2;
    const sx = 144;
    const sy = 96;
    const p = 24;
    if (!this.pause) {
        sprite.alpha = 0;
    } else if (sprite.alpha < 1) {
        sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
    }
    sprite.setFrame(sx + x * p, sy + y * p, p, p);
    sprite.visible = this.isOpen();
};

Window.prototype._updateFilterArea = function() {
    const pos = this._clientArea.worldTransform.apply(new Point(0, 0));
    const filterArea = this._clientArea.filterArea;
    filterArea.x = pos.x + this.origin.x;
    filterArea.y = pos.y + this.origin.y;
    filterArea.width = this.innerWidth;
    filterArea.height = this.innerHeight;
};

//-----------------------------------------------------------------------------
/**
 * The layer which contains game windows.
 *
 * @class
 * @extends PIXI.Container
 */
function WindowLayer() {
    this.initialize(...arguments);
}

WindowLayer.prototype = Object.create(PIXI.Container.prototype);
WindowLayer.prototype.constructor = WindowLayer;

WindowLayer.prototype.initialize = function() {
    PIXI.Container.call(this);
};

/**
 * Updates the window layer for each frame.
 */
WindowLayer.prototype.update = function() {
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

/**
 * Renders the object using the WebGL renderer.
 *
 * @param {PIXI.Renderer} renderer - The renderer.
 */
WindowLayer.prototype.render = function render(renderer) {
    if (!this.visible) {
        return;
    }

    const graphics = new PIXI.Graphics();
    const gl = renderer.gl;
    const children = this.children.clone();

    renderer.framebuffer.forceStencil();
    graphics.transform = this.transform;
    renderer.batch.flush();
    gl.enable(gl.STENCIL_TEST);

    while (children.length > 0) {
        const win = children.pop();
        if (win._isWindow && win.visible && win.openness > 0) {
            gl.stencilFunc(gl.EQUAL, 0, ~0);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            win.render(renderer);
            renderer.batch.flush();
            graphics.clear();
            win.drawShape(graphics);
            gl.stencilFunc(gl.ALWAYS, 1, ~0);
            gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
            gl.blendFunc(gl.ZERO, gl.ONE);
            graphics.render(renderer);
            renderer.batch.flush();
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
    }

    gl.disable(gl.STENCIL_TEST);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.clearStencil(0);
    renderer.batch.flush();

    for (const child of this.children) {
        if (!child._isWindow && child.visible) {
            child.render(renderer);
        }
    }

    renderer.batch.flush();
};

//-----------------------------------------------------------------------------
/**
 * The weather effect which displays rain, storm, or snow.
 *
 * @class
 * @extends PIXI.Container
 */
function Weather() {
    this.initialize(...arguments);
}

Weather.prototype = Object.create(PIXI.Container.prototype);
Weather.prototype.constructor = Weather;

Weather.prototype.initialize = function() {
    PIXI.Container.call(this);

    this._width = Graphics.width;
    this._height = Graphics.height;
    this._sprites = [];

    this._createBitmaps();
    this._createDimmer();

    /**
     * The type of the weather in ["none", "rain", "storm", "snow"].
     *
     * @type string
     */
    this.type = "none";

    /**
     * The power of the weather in the range (0, 9).
     *
     * @type number
     */
    this.power = 0;

    /**
     * The origin point of the weather for scrolling.
     *
     * @type Point
     */
    this.origin = new Point();
};

/**
 * Destroys the weather.
 */
Weather.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Container.prototype.destroy.call(this, options);
    this._rainBitmap.destroy();
    this._stormBitmap.destroy();
    this._snowBitmap.destroy();
};

/**
 * Updates the weather for each frame.
 */
Weather.prototype.update = function() {
    this._updateDimmer();
    this._updateAllSprites();
};

Weather.prototype._createBitmaps = function() {
    this._rainBitmap = new Bitmap(1, 60);
    this._rainBitmap.fillAll("white");
    this._stormBitmap = new Bitmap(2, 100);
    this._stormBitmap.fillAll("white");
    this._snowBitmap = new Bitmap(9, 9);
    this._snowBitmap.drawCircle(4, 4, 4, "white");
};

Weather.prototype._createDimmer = function() {
    this._dimmerSprite = new ScreenSprite();
    this._dimmerSprite.setColor(80, 80, 80);
    this.addChild(this._dimmerSprite);
};

Weather.prototype._updateDimmer = function() {
    this._dimmerSprite.opacity = Math.floor(this.power * 6);
};

Weather.prototype._updateAllSprites = function() {
    const maxSprites = Math.floor(this.power * 10);
    while (this._sprites.length < maxSprites) {
        this._addSprite();
    }
    while (this._sprites.length > maxSprites) {
        this._removeSprite();
    }
    for (const sprite of this._sprites) {
        this._updateSprite(sprite);
        sprite.x = sprite.ax - this.origin.x;
        sprite.y = sprite.ay - this.origin.y;
    }
};

Weather.prototype._addSprite = function() {
    const sprite = new Sprite(this.viewport);
    sprite.opacity = 0;
    this._sprites.push(sprite);
    this.addChild(sprite);
};

Weather.prototype._removeSprite = function() {
    this.removeChild(this._sprites.pop());
};

Weather.prototype._updateSprite = function(sprite) {
    switch (this.type) {
        case "rain":
            this._updateRainSprite(sprite);
            break;
        case "storm":
            this._updateStormSprite(sprite);
            break;
        case "snow":
            this._updateSnowSprite(sprite);
            break;
    }
    if (sprite.opacity < 40) {
        this._rebornSprite(sprite);
    }
};

Weather.prototype._updateRainSprite = function(sprite) {
    sprite.bitmap = this._rainBitmap;
    sprite.rotation = Math.PI / 16;
    sprite.ax -= 6 * Math.sin(sprite.rotation);
    sprite.ay += 6 * Math.cos(sprite.rotation);
    sprite.opacity -= 6;
};

Weather.prototype._updateStormSprite = function(sprite) {
    sprite.bitmap = this._stormBitmap;
    sprite.rotation = Math.PI / 8;
    sprite.ax -= 8 * Math.sin(sprite.rotation);
    sprite.ay += 8 * Math.cos(sprite.rotation);
    sprite.opacity -= 8;
};

Weather.prototype._updateSnowSprite = function(sprite) {
    sprite.bitmap = this._snowBitmap;
    sprite.rotation = Math.PI / 16;
    sprite.ax -= 3 * Math.sin(sprite.rotation);
    sprite.ay += 3 * Math.cos(sprite.rotation);
    sprite.opacity -= 3;
};

Weather.prototype._rebornSprite = function(sprite) {
    sprite.ax = Math.randomInt(Graphics.width + 100) - 100 + this.origin.x;
    sprite.ay = Math.randomInt(Graphics.height + 200) - 200 + this.origin.y;
    sprite.opacity = 160 + Math.randomInt(60);
};

//-----------------------------------------------------------------------------
/**
 * The color filter for WebGL.
 *
 * @class
 * @extends PIXI.Filter
 */
function ColorFilter() {
    this.initialize(...arguments);
}

ColorFilter.prototype = Object.create(PIXI.Filter.prototype);
ColorFilter.prototype.constructor = ColorFilter;

ColorFilter.prototype.initialize = function() {
    PIXI.Filter.call(this, null, this._fragmentSrc());
    this.uniforms.hue = 0;
    this.uniforms.colorTone = [0, 0, 0, 0];
    this.uniforms.blendColor = [0, 0, 0, 0];
    this.uniforms.brightness = 255;
};

/**
 * Sets the hue rotation value.
 *
 * @param {number} hue - The hue value (-360, 360).
 */
ColorFilter.prototype.setHue = function(hue) {
    this.uniforms.hue = Number(hue);
};

/**
 * Sets the color tone.
 *
 * @param {array} tone - The color tone [r, g, b, gray].
 */
ColorFilter.prototype.setColorTone = function(tone) {
    if (!(tone instanceof Array)) {
        throw new Error("Argument must be an array");
    }
    this.uniforms.colorTone = tone.clone();
};

/**
 * Sets the blend color.
 *
 * @param {array} color - The blend color [r, g, b, a].
 */
ColorFilter.prototype.setBlendColor = function(color) {
    if (!(color instanceof Array)) {
        throw new Error("Argument must be an array");
    }
    this.uniforms.blendColor = color.clone();
};

/**
 * Sets the brightness.
 *
 * @param {number} brightness - The brightness (0 to 255).
 */
ColorFilter.prototype.setBrightness = function(brightness) {
    this.uniforms.brightness = Number(brightness);
};

ColorFilter.prototype._fragmentSrc = function() {
    const src =
        "varying vec2 vTextureCoord;" +
        "uniform sampler2D uSampler;" +
        "uniform float hue;" +
        "uniform vec4 colorTone;" +
        "uniform vec4 blendColor;" +
        "uniform float brightness;" +
        "vec3 rgbToHsl(vec3 rgb) {" +
        "  float r = rgb.r;" +
        "  float g = rgb.g;" +
        "  float b = rgb.b;" +
        "  float cmin = min(r, min(g, b));" +
        "  float cmax = max(r, max(g, b));" +
        "  float h = 0.0;" +
        "  float s = 0.0;" +
        "  float l = (cmin + cmax) / 2.0;" +
        "  float delta = cmax - cmin;" +
        "  if (delta > 0.0) {" +
        "    if (r == cmax) {" +
        "      h = mod((g - b) / delta + 6.0, 6.0) / 6.0;" +
        "    } else if (g == cmax) {" +
        "      h = ((b - r) / delta + 2.0) / 6.0;" +
        "    } else {" +
        "      h = ((r - g) / delta + 4.0) / 6.0;" +
        "    }" +
        "    if (l < 1.0) {" +
        "      s = delta / (1.0 - abs(2.0 * l - 1.0));" +
        "    }" +
        "  }" +
        "  return vec3(h, s, l);" +
        "}" +
        "vec3 hslToRgb(vec3 hsl) {" +
        "  float h = hsl.x;" +
        "  float s = hsl.y;" +
        "  float l = hsl.z;" +
        "  float c = (1.0 - abs(2.0 * l - 1.0)) * s;" +
        "  float x = c * (1.0 - abs((mod(h * 6.0, 2.0)) - 1.0));" +
        "  float m = l - c / 2.0;" +
        "  float cm = c + m;" +
        "  float xm = x + m;" +
        "  if (h < 1.0 / 6.0) {" +
        "    return vec3(cm, xm, m);" +
        "  } else if (h < 2.0 / 6.0) {" +
        "    return vec3(xm, cm, m);" +
        "  } else if (h < 3.0 / 6.0) {" +
        "    return vec3(m, cm, xm);" +
        "  } else if (h < 4.0 / 6.0) {" +
        "    return vec3(m, xm, cm);" +
        "  } else if (h < 5.0 / 6.0) {" +
        "    return vec3(xm, m, cm);" +
        "  } else {" +
        "    return vec3(cm, m, xm);" +
        "  }" +
        "}" +
        "void main() {" +
        "  vec4 sample = texture2D(uSampler, vTextureCoord);" +
        "  float a = sample.a;" +
        "  vec3 hsl = rgbToHsl(sample.rgb);" +
        "  hsl.x = mod(hsl.x + hue / 360.0, 1.0);" +
        "  hsl.y = hsl.y * (1.0 - colorTone.a / 255.0);" +
        "  vec3 rgb = hslToRgb(hsl);" +
        "  float r = rgb.r;" +
        "  float g = rgb.g;" +
        "  float b = rgb.b;" +
        "  float r2 = colorTone.r / 255.0;" +
        "  float g2 = colorTone.g / 255.0;" +
        "  float b2 = colorTone.b / 255.0;" +
        "  float r3 = blendColor.r / 255.0;" +
        "  float g3 = blendColor.g / 255.0;" +
        "  float b3 = blendColor.b / 255.0;" +
        "  float i3 = blendColor.a / 255.0;" +
        "  float i1 = 1.0 - i3;" +
        "  r = clamp((r / a + r2) * a, 0.0, 1.0);" +
        "  g = clamp((g / a + g2) * a, 0.0, 1.0);" +
        "  b = clamp((b / a + b2) * a, 0.0, 1.0);" +
        "  r = clamp(r * i1 + r3 * i3 * a, 0.0, 1.0);" +
        "  g = clamp(g * i1 + g3 * i3 * a, 0.0, 1.0);" +
        "  b = clamp(b * i1 + b3 * i3 * a, 0.0, 1.0);" +
        "  r = r * brightness / 255.0;" +
        "  g = g * brightness / 255.0;" +
        "  b = b * brightness / 255.0;" +
        "  gl_FragColor = vec4(r, g, b, a);" +
        "}";
    return src;
};

//-----------------------------------------------------------------------------
/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
function Stage() {
    this.initialize(...arguments);
}

Stage.prototype = Object.create(PIXI.Container.prototype);
Stage.prototype.constructor = Stage;

Stage.prototype.initialize = function() {
    PIXI.Container.call(this);
};

/**
 * Destroys the stage.
 */
Stage.prototype.destroy = function() {
    const options = { children: true, texture: true };
    PIXI.Container.prototype.destroy.call(this, options);
};

//-----------------------------------------------------------------------------
/**
 * The audio object of Web Audio API.
 *
 * @class
 * @param {string} url - The url of the audio file.
 */
function WebAudio() {
    this.initialize(...arguments);
}

WebAudio.prototype.initialize = function(url) {
    this.clear();
    this._url = url;
    this._startLoading();
};

/**
 * Initializes the audio system.
 *
 * @returns {boolean} True if the audio system is available.
 */
WebAudio.initialize = function() {
    this._context = null;
    this._masterGainNode = null;
    this._masterVolume = 1;
    this._createContext();
    this._createMasterGainNode();
    this._setupEventHandlers();
    return !!this._context;
};

/**
 * Sets the master volume for all audio.
 *
 * @param {number} value - The master volume (0 to 1).
 */
WebAudio.setMasterVolume = function(value) {
    this._masterVolume = value;
    this._resetVolume();
};

WebAudio._createContext = function() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this._context = new AudioContext();
    } catch (e) {
        this._context = null;
    }
};

WebAudio._currentTime = function() {
    return this._context ? this._context.currentTime : 0;
};

WebAudio._createMasterGainNode = function() {
    const context = this._context;
    if (context) {
        this._masterGainNode = context.createGain();
        this._resetVolume();
        this._masterGainNode.connect(context.destination);
    }
};

WebAudio._setupEventHandlers = function() {
    const onUserGesture = this._onUserGesture.bind(this);
    const onVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener("keydown", onUserGesture);
    document.addEventListener("mousedown", onUserGesture);
    document.addEventListener("touchend", onUserGesture);
    document.addEventListener("visibilitychange", onVisibilityChange);
};

WebAudio._onUserGesture = function() {
    const context = this._context;
    if (context && context.state === "suspended") {
        context.resume();
    }
};

WebAudio._onVisibilityChange = function() {
    if (document.visibilityState === "hidden") {
        this._onHide();
    } else {
        this._onShow();
    }
};

WebAudio._onHide = function() {
    if (this._shouldMuteOnHide()) {
        this._fadeOut(1);
    }
};

WebAudio._onShow = function() {
    if (this._shouldMuteOnHide()) {
        this._fadeIn(1);
    }
};

WebAudio._shouldMuteOnHide = function() {
    return Utils.isMobileDevice() && !window.navigator.standalone;
};

WebAudio._resetVolume = function() {
    if (this._masterGainNode) {
        const gain = this._masterGainNode.gain;
        const volume = this._masterVolume;
        const currentTime = this._currentTime();
        gain.setValueAtTime(volume, currentTime);
    }
};

WebAudio._fadeIn = function(duration) {
    if (this._masterGainNode) {
        const gain = this._masterGainNode.gain;
        const volume = this._masterVolume;
        const currentTime = this._currentTime();
        gain.setValueAtTime(0, currentTime);
        gain.linearRampToValueAtTime(volume, currentTime + duration);
    }
};

WebAudio._fadeOut = function(duration) {
    if (this._masterGainNode) {
        const gain = this._masterGainNode.gain;
        const volume = this._masterVolume;
        const currentTime = this._currentTime();
        gain.setValueAtTime(volume, currentTime);
        gain.linearRampToValueAtTime(0, currentTime + duration);
    }
};

/**
 * Clears the audio data.
 */
WebAudio.prototype.clear = function() {
    this.stop();
    this._data = null;
    this._fetchedSize = 0;
    this._fetchedData = [];
    this._buffers = [];
    this._sourceNodes = [];
    this._gainNode = null;
    this._pannerNode = null;
    this._totalTime = 0;
    this._sampleRate = 0;
    this._loop = 0;
    this._loopStart = 0;
    this._loopLength = 0;
    this._loopStartTime = 0;
    this._loopLengthTime = 0;
    this._startTime = 0;
    this._volume = 1;
    this._pitch = 1;
    this._pan = 0;
    this._endTimer = null;
    this._loadListeners = [];
    this._stopListeners = [];
    this._lastUpdateTime = 0;
    this._isLoaded = false;
    this._isError = false;
    this._isPlaying = false;
    this._decoder = null;
};

/**
 * The url of the audio file.
 *
 * @readonly
 * @type string
 * @name WebAudio#url
 */
Object.defineProperty(WebAudio.prototype, "url", {
    get: function() {
        return this._url;
    },
    configurable: true
});

/**
 * The volume of the audio.
 *
 * @type number
 * @name WebAudio#volume
 */
Object.defineProperty(WebAudio.prototype, "volume", {
    get: function() {
        return this._volume;
    },
    set: function(value) {
        this._volume = value;
        if (this._gainNode) {
            this._gainNode.gain.setValueAtTime(
                this._volume,
                WebAudio._currentTime()
            );
        }
    },
    configurable: true
});

/**
 * The pitch of the audio.
 *
 * @type number
 * @name WebAudio#pitch
 */
Object.defineProperty(WebAudio.prototype, "pitch", {
    get: function() {
        return this._pitch;
    },
    set: function(value) {
        if (this._pitch !== value) {
            this._pitch = value;
            if (this.isPlaying()) {
                this.play(this._loop, 0);
            }
        }
    },
    configurable: true
});

/**
 * The pan of the audio.
 *
 * @type number
 * @name WebAudio#pan
 */
Object.defineProperty(WebAudio.prototype, "pan", {
    get: function() {
        return this._pan;
    },
    set: function(value) {
        this._pan = value;
        this._updatePanner();
    },
    configurable: true
});

/**
 * Checks whether the audio data is ready to play.
 *
 * @returns {boolean} True if the audio data is ready to play.
 */
WebAudio.prototype.isReady = function() {
    return this._buffers && this._buffers.length > 0;
};

/**
 * Checks whether a loading error has occurred.
 *
 * @returns {boolean} True if a loading error has occurred.
 */
WebAudio.prototype.isError = function() {
    return this._isError;
};

/**
 * Checks whether the audio is playing.
 *
 * @returns {boolean} True if the audio is playing.
 */
WebAudio.prototype.isPlaying = function() {
    return this._isPlaying;
};

/**
 * Plays the audio.
 *
 * @param {boolean} loop - Whether the audio data play in a loop.
 * @param {number} offset - The start position to play in seconds.
 */
WebAudio.prototype.play = function(loop, offset) {
    this._loop = loop;
    if (this.isReady()) {
        offset = offset || 0;
        this._startPlaying(offset);
    } else if (WebAudio._context) {
        this.addLoadListener(() => this.play(loop, offset));
    }
    this._isPlaying = true;
};

/**
 * Stops the audio.
 */
WebAudio.prototype.stop = function() {
    this._isPlaying = false;
    this._removeEndTimer();
    this._removeNodes();
    this._loadListeners = [];
    if (this._stopListeners) {
        while (this._stopListeners.length > 0) {
            const listner = this._stopListeners.shift();
            listner();
        }
    }
};

/**
 * Destroys the audio.
 */
WebAudio.prototype.destroy = function() {
    this._destroyDecoder();
    this.clear();
};

/**
 * Performs the audio fade-in.
 *
 * @param {number} duration - Fade-in time in seconds.
 */
WebAudio.prototype.fadeIn = function(duration) {
    if (this.isReady()) {
        if (this._gainNode) {
            const gain = this._gainNode.gain;
            const currentTime = WebAudio._currentTime();
            gain.setValueAtTime(0, currentTime);
            gain.linearRampToValueAtTime(this._volume, currentTime + duration);
        }
    } else {
        this.addLoadListener(() => this.fadeIn(duration));
    }
};

/**
 * Performs the audio fade-out.
 *
 * @param {number} duration - Fade-out time in seconds.
 */
WebAudio.prototype.fadeOut = function(duration) {
    if (this._gainNode) {
        const gain = this._gainNode.gain;
        const currentTime = WebAudio._currentTime();
        gain.setValueAtTime(this._volume, currentTime);
        gain.linearRampToValueAtTime(0, currentTime + duration);
    }
    this._isPlaying = false;
    this._loadListeners = [];
};

/**
 * Gets the seek position of the audio.
 */
WebAudio.prototype.seek = function() {
    if (WebAudio._context) {
        let pos = (WebAudio._currentTime() - this._startTime) * this._pitch;
        if (this._loopLengthTime > 0) {
            while (pos >= this._loopStartTime + this._loopLengthTime) {
                pos -= this._loopLengthTime;
            }
        }
        return pos;
    } else {
        return 0;
    }
};

/**
 * Adds a callback function that will be called when the audio data is loaded.
 *
 * @param {function} listner - The callback function.
 */
WebAudio.prototype.addLoadListener = function(listner) {
    this._loadListeners.push(listner);
};

/**
 * Adds a callback function that will be called when the playback is stopped.
 *
 * @param {function} listner - The callback function.
 */
WebAudio.prototype.addStopListener = function(listner) {
    this._stopListeners.push(listner);
};

/**
 * Tries to load the audio again.
 */
WebAudio.prototype.retry = function() {
    this._startLoading();
    if (this._isPlaying) {
        this.play(this._loop, 0);
    }
};

WebAudio.prototype._startLoading = function() {
    if (WebAudio._context) {
        const url = this._realUrl();
        if (Utils.isLocal()) {
            this._startXhrLoading(url);
        } else {
            this._startFetching(url);
        }
        const currentTime = WebAudio._currentTime();
        this._lastUpdateTime = currentTime - 0.5;
        this._isError = false;
        this._isLoaded = false;
        this._destroyDecoder();
        if (this._shouldUseDecoder()) {
            this._createDecoder();
        }
    }
};

WebAudio.prototype._shouldUseDecoder = function() {
    return !Utils.canPlayOgg() && typeof VorbisDecoder === "function";
};

WebAudio.prototype._createDecoder = function() {
    this._decoder = new VorbisDecoder(
        WebAudio._context,
        this._onDecode.bind(this),
        this._onError.bind(this)
    );
};

WebAudio.prototype._destroyDecoder = function() {
    if (this._decoder) {
        this._decoder.destroy();
        this._decoder = null;
    }
};

WebAudio.prototype._realUrl = function() {
    return this._url + (Utils.hasEncryptedAudio() ? "_" : "");
};

WebAudio.prototype._startXhrLoading = function(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => this._onXhrLoad(xhr);
    xhr.onerror = this._onError.bind(this);
    xhr.send();
};

WebAudio.prototype._startFetching = function(url) {
    const options = { credentials: "same-origin" };
    fetch(url, options)
        .then(response => this._onFetch(response))
        .catch(() => this._onError());
};

WebAudio.prototype._onXhrLoad = function(xhr) {
    if (xhr.status < 400) {
        this._data = new Uint8Array(xhr.response);
        this._isLoaded = true;
        this._updateBuffer();
    } else {
        this._onError();
    }
};

WebAudio.prototype._onFetch = function(response) {
    if (response.ok) {
        const reader = response.body.getReader();
        const readChunk = ({ done, value }) => {
            if (done) {
                this._isLoaded = true;
                if (this._fetchedSize > 0) {
                    this._concatenateFetchedData();
                    this._updateBuffer();
                    this._data = null;
                }
                return 0;
            } else {
                this._onFetchProcess(value);
                return reader.read().then(readChunk);
            }
        };
        reader
            .read()
            .then(readChunk)
            .catch(() => this._onError());
    } else {
        this._onError();
    }
};

WebAudio.prototype._onError = function() {
    if (this._sourceNodes.length > 0) {
        this._stopSourceNode();
    }
    this._data = null;
    this._isError = true;
};

WebAudio.prototype._onFetchProcess = function(value) {
    this._fetchedSize += value.length;
    this._fetchedData.push(value);
    this._updateBufferOnFetch();
};

WebAudio.prototype._updateBufferOnFetch = function() {
    const currentTime = WebAudio._currentTime();
    const deltaTime = currentTime - this._lastUpdateTime;
    const currentData = this._data;
    const currentSize = currentData ? currentData.length : 0;
    if (deltaTime >= 1 && currentSize + this._fetchedSize >= 200000) {
        this._concatenateFetchedData();
        this._updateBuffer();
        this._lastUpdateTime = currentTime;
    }
};

WebAudio.prototype._concatenateFetchedData = function() {
    const currentData = this._data;
    const currentSize = currentData ? currentData.length : 0;
    const newData = new Uint8Array(currentSize + this._fetchedSize);
    let pos = 0;
    if (currentData) {
        newData.set(currentData);
        pos += currentSize;
    }
    for (const value of this._fetchedData) {
        newData.set(value, pos);
        pos += value.length;
    }
    this._data = newData;
    this._fetchedData = [];
    this._fetchedSize = 0;
};

WebAudio.prototype._updateBuffer = function() {
    const arrayBuffer = this._readableBuffer();
    this._readLoopComments(arrayBuffer);
    this._decodeAudioData(arrayBuffer);
};

WebAudio.prototype._readableBuffer = function() {
    if (Utils.hasEncryptedAudio()) {
        return Utils.decryptArrayBuffer(this._data.buffer);
    } else {
        return this._data.buffer;
    }
};

WebAudio.prototype._decodeAudioData = function(arrayBuffer) {
    if (this._shouldUseDecoder()) {
        if (this._decoder) {
            this._decoder.send(arrayBuffer, this._isLoaded);
        }
    } else {
        // [Note] Make a temporary copy of arrayBuffer because
        //   decodeAudioData() detaches it.
        WebAudio._context
            .decodeAudioData(arrayBuffer.slice())
            .then(buffer => this._onDecode(buffer))
            .catch(() => this._onError());
    }
};

WebAudio.prototype._onDecode = function(buffer) {
    if (!this._shouldUseDecoder()) {
        this._buffers = [];
        this._totalTime = 0;
    }
    this._buffers.push(buffer);
    this._totalTime += buffer.duration;
    if (this._loopLength > 0 && this._sampleRate > 0) {
        this._loopStartTime = this._loopStart / this._sampleRate;
        this._loopLengthTime = this._loopLength / this._sampleRate;
    } else {
        this._loopStartTime = 0;
        this._loopLengthTime = this._totalTime;
    }
    if (this._sourceNodes.length > 0) {
        this._refreshSourceNode();
    }
    this._onLoad();
};

WebAudio.prototype._refreshSourceNode = function() {
    if (this._shouldUseDecoder()) {
        const index = this._buffers.length - 1;
        this._createSourceNode(index);
        if (this._isPlaying) {
            this._startSourceNode(index);
        }
    } else {
        this._stopSourceNode();
        this._createAllSourceNodes();
        if (this._isPlaying) {
            this._startAllSourceNodes();
        }
    }
    if (this._isPlaying) {
        this._removeEndTimer();
        this._createEndTimer();
    }
};

WebAudio.prototype._startPlaying = function(offset) {
    if (this._loopLengthTime > 0) {
        while (offset >= this._loopStartTime + this._loopLengthTime) {
            offset -= this._loopLengthTime;
        }
    }
    this._startTime = WebAudio._currentTime() - offset / this._pitch;
    this._removeEndTimer();
    this._removeNodes();
    this._createPannerNode();
    this._createGainNode();
    this._createAllSourceNodes();
    this._startAllSourceNodes();
    this._createEndTimer();
};

WebAudio.prototype._startAllSourceNodes = function() {
    for (let i = 0; i < this._sourceNodes.length; i++) {
        this._startSourceNode(i);
    }
};

WebAudio.prototype._startSourceNode = function(index) {
    const sourceNode = this._sourceNodes[index];
    const seekPos = this.seek();
    const currentTime = WebAudio._currentTime();
    const loop = this._loop;
    const loopStart = this._loopStartTime;
    const loopLength = this._loopLengthTime;
    const loopEnd = loopStart + loopLength;
    const pitch = this._pitch;
    let chunkStart = 0;
    for (let i = 0; i < index; i++) {
        chunkStart += this._buffers[i].duration;
    }
    const chunkEnd = chunkStart + sourceNode.buffer.duration;
    let when = 0;
    let offset = 0;
    let duration = sourceNode.buffer.duration;
    if (seekPos >= chunkStart && seekPos < chunkEnd - 0.01) {
        when = currentTime;
        offset = seekPos - chunkStart;
    } else {
        when = currentTime + (chunkStart - seekPos) / pitch;
        offset = 0;
        if (loop) {
            if (when < currentTime - 0.01) {
                when += loopLength / pitch;
            }
            if (seekPos >= loopStart && chunkStart < loopStart) {
                when += (loopStart - chunkStart) / pitch;
                offset = loopStart - chunkStart;
            }
        }
    }
    if (loop && loopEnd < chunkEnd) {
        duration = loopEnd - chunkStart - offset;
    }
    if (this._shouldUseDecoder()) {
        if (when >= currentTime && offset < duration) {
            sourceNode.loop = false;
            sourceNode.start(when, offset, duration);
            if (loop && chunkEnd > loopStart) {
                sourceNode.onended = () => {
                    this._createSourceNode(index);
                    this._startSourceNode(index);
                };
            }
        }
    } else {
        if (when >= currentTime && offset < sourceNode.buffer.duration) {
            sourceNode.start(when, offset);
        }
    }
    chunkStart += sourceNode.buffer.duration;
};

WebAudio.prototype._stopSourceNode = function() {
    for (const sourceNode of this._sourceNodes) {
        try {
            sourceNode.onended = null;
            sourceNode.stop();
        } catch (e) {
            // Ignore InvalidStateError
        }
    }
};

WebAudio.prototype._createPannerNode = function() {
    this._pannerNode = WebAudio._context.createPanner();
    this._pannerNode.panningModel = "equalpower";
    this._pannerNode.connect(WebAudio._masterGainNode);
    this._updatePanner();
};

WebAudio.prototype._createGainNode = function() {
    const currentTime = WebAudio._currentTime();
    this._gainNode = WebAudio._context.createGain();
    this._gainNode.gain.setValueAtTime(this._volume, currentTime);
    this._gainNode.connect(this._pannerNode);
};

WebAudio.prototype._createAllSourceNodes = function() {
    for (let i = 0; i < this._buffers.length; i++) {
        this._createSourceNode(i);
    }
};

WebAudio.prototype._createSourceNode = function(index) {
    const sourceNode = WebAudio._context.createBufferSource();
    const currentTime = WebAudio._currentTime();
    sourceNode.buffer = this._buffers[index];
    sourceNode.loop = this._loop && this._isLoaded;
    sourceNode.loopStart = this._loopStartTime;
    sourceNode.loopEnd = this._loopStartTime + this._loopLengthTime;
    sourceNode.playbackRate.setValueAtTime(this._pitch, currentTime);
    sourceNode.connect(this._gainNode);
    this._sourceNodes[index] = sourceNode;
};

WebAudio.prototype._removeNodes = function() {
    if (this._sourceNodes && this._sourceNodes.length > 0) {
        this._stopSourceNode();
        this._sourceNodes = [];
        this._gainNode = null;
        this._pannerNode = null;
    }
};

WebAudio.prototype._createEndTimer = function() {
    if (this._sourceNodes.length > 0 && !this._loop) {
        const endTime = this._startTime + this._totalTime / this._pitch;
        const delay = endTime - WebAudio._currentTime();
        this._endTimer = setTimeout(this.stop.bind(this), delay * 1000);
    }
};

WebAudio.prototype._removeEndTimer = function() {
    if (this._endTimer) {
        clearTimeout(this._endTimer);
        this._endTimer = null;
    }
};

WebAudio.prototype._updatePanner = function() {
    if (this._pannerNode) {
        const x = this._pan;
        const z = 1 - Math.abs(x);
        this._pannerNode.setPosition(x, 0, z);
    }
};

WebAudio.prototype._onLoad = function() {
    while (this._loadListeners.length > 0) {
        const listner = this._loadListeners.shift();
        listner();
    }
};

WebAudio.prototype._readLoopComments = function(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    let index = 0;
    while (index < view.byteLength - 30) {
        if (this._readFourCharacters(view, index) !== "OggS") {
            break;
        }
        index += 26;
        const numSegments = view.getUint8(index++);
        const segments = [];
        for (let i = 0; i < numSegments; i++) {
            segments.push(view.getUint8(index++));
        }
        const packets = [];
        while (segments.length > 0) {
            let packetSize = 0;
            while (segments[0] === 255) {
                packetSize += segments.shift();
            }
            packetSize += segments.shift();
            packets.push(packetSize);
        }
        let vorbisHeaderFound = false;
        for (const size of packets) {
            if (this._readFourCharacters(view, index + 1) === "vorb") {
                const headerType = view.getUint8(index);
                if (headerType === 1) {
                    this._sampleRate = view.getUint32(index + 12, true);
                } else if (headerType === 3) {
                    this._readMetaData(view, index, size);
                }
                vorbisHeaderFound = true;
            }
            index += size;
        }
        if (!vorbisHeaderFound) {
            break;
        }
    }
};

WebAudio.prototype._readMetaData = function(view, index, size) {
    for (let i = index; i < index + size - 10; i++) {
        if (this._readFourCharacters(view, i) === "LOOP") {
            let text = "";
            while (view.getUint8(i) > 0) {
                text += String.fromCharCode(view.getUint8(i++));
            }
            if (text.match(/LOOPSTART=([0-9]+)/)) {
                this._loopStart = parseInt(RegExp.$1);
            }
            if (text.match(/LOOPLENGTH=([0-9]+)/)) {
                this._loopLength = parseInt(RegExp.$1);
            }
            if (text === "LOOPSTART" || text === "LOOPLENGTH") {
                let text2 = "";
                i += 16;
                while (view.getUint8(i) > 0) {
                    text2 += String.fromCharCode(view.getUint8(i++));
                }
                if (text === "LOOPSTART") {
                    this._loopStart = parseInt(text2);
                } else {
                    this._loopLength = parseInt(text2);
                }
            }
        }
    }
};

WebAudio.prototype._readFourCharacters = function(view, index) {
    let string = "";
    if (index <= view.byteLength - 4) {
        for (let i = 0; i < 4; i++) {
            string += String.fromCharCode(view.getUint8(index + i));
        }
    }
    return string;
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles video playback.
 *
 * @namespace
 */
function Video() {
    throw new Error("This is a static class");
}

/**
 * Initializes the video system.
 *
 * @param {number} width - The width of the video.
 * @param {number} height - The height of the video.
 */
Video.initialize = function(width, height) {
    this._element = null;
    this._loading = false;
    this._volume = 1;
    this._createElement();
    this._setupEventHandlers();
    this.resize(width, height);
};

/**
 * Changes the display size of the video.
 *
 * @param {number} width - The width of the video.
 * @param {number} height - The height of the video.
 */
Video.resize = function(width, height) {
    if (this._element) {
        this._element.style.width = width + "px";
        this._element.style.height = height + "px";
    }
};

/**
 * Starts playback of a video.
 *
 * @param {string} src - The url of the video.
 */
Video.play = function(src) {
    this._element.src = src;
    this._element.onloadeddata = this._onLoad.bind(this);
    this._element.onerror = this._onError.bind(this);
    this._element.onended = this._onEnd.bind(this);
    this._element.load();
    this._loading = true;
};

/**
 * Checks whether the video is playing.
 *
 * @returns {boolean} True if the video is playing.
 */
Video.isPlaying = function() {
    return this._loading || this._isVisible();
};

/**
 * Sets the volume for videos.
 *
 * @param {number} volume - The volume for videos (0 to 1).
 */
Video.setVolume = function(volume) {
    this._volume = volume;
    if (this._element) {
        this._element.volume = this._volume;
    }
};

Video._createElement = function() {
    this._element = document.createElement("video");
    this._element.id = "gameVideo";
    this._element.style.position = "absolute";
    this._element.style.margin = "auto";
    this._element.style.top = 0;
    this._element.style.left = 0;
    this._element.style.right = 0;
    this._element.style.bottom = 0;
    this._element.style.opacity = 0;
    this._element.style.zIndex = 2;
    this._element.setAttribute("playsinline", "");
    this._element.oncontextmenu = () => false;
    document.body.appendChild(this._element);
};

Video._onLoad = function() {
    this._element.volume = this._volume;
    this._element.play();
    this._updateVisibility(true);
    this._loading = false;
};

Video._onError = function() {
    this._updateVisibility(false);
    const retry = () => {
        this._element.load();
    };
    throw ["LoadError", this._element.src, retry];
};

Video._onEnd = function() {
    this._updateVisibility(false);
};

Video._updateVisibility = function(videoVisible) {
    if (videoVisible) {
        Graphics.hideScreen();
    } else {
        Graphics.showScreen();
    }
    this._element.style.opacity = videoVisible ? 1 : 0;
};

Video._isVisible = function() {
    return this._element.style.opacity > 0;
};

Video._setupEventHandlers = function() {
    const onUserGesture = this._onUserGesture.bind(this);
    document.addEventListener("keydown", onUserGesture);
    document.addEventListener("mousedown", onUserGesture);
    document.addEventListener("touchend", onUserGesture);
};

Video._onUserGesture = function() {
    if (!this._element.src && this._element.paused) {
        this._element.play().catch(() => 0);
    }
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 * @namespace
 */
function Input() {
    throw new Error("This is a static class");
}

/**
 * Initializes the input system.
 */
Input.initialize = function() {
    this.clear();
    this._setupEventHandlers();
};

/**
 * The wait time of the key repeat in frames.
 *
 * @type number
 */
Input.keyRepeatWait = 24;

/**
 * The interval of the key repeat in frames.
 *
 * @type number
 */
Input.keyRepeatInterval = 6;

/**
 * A hash table to convert from a virtual key code to a mapped key name.
 *
 * @type Object
 */
Input.keyMapper = {
    9: "tab", // tab
    13: "ok", // enter
    16: "shift", // shift
    17: "control", // control
    18: "control", // alt
    27: "escape", // escape
    32: "ok", // space
    33: "pageup", // pageup
    34: "pagedown", // pagedown
    37: "left", // left arrow
    38: "up", // up arrow
    39: "right", // right arrow
    40: "down", // down arrow
    45: "escape", // insert
    81: "pageup", // Q
    87: "pagedown", // W
    88: "escape", // X
    90: "ok", // Z
    96: "escape", // numpad 0
    98: "down", // numpad 2
    100: "left", // numpad 4
    102: "right", // numpad 6
    104: "up", // numpad 8
    120: "debug" // F9
};

/**
 * A hash table to convert from a gamepad button to a mapped key name.
 *
 * @type Object
 */
Input.gamepadMapper = {
    0: "ok", // A
    1: "cancel", // B
    2: "shift", // X
    3: "menu", // Y
    4: "pageup", // LB
    5: "pagedown", // RB
    12: "up", // D-pad up
    13: "down", // D-pad down
    14: "left", // D-pad left
    15: "right" // D-pad right
};

/**
 * Clears all the input data.
 */
Input.clear = function() {
    this._currentState = {};
    this._previousState = {};
    this._gamepadStates = [];
    this._latestButton = null;
    this._pressedTime = 0;
    this._dir4 = 0;
    this._dir8 = 0;
    this._preferredAxis = "";
    this._date = 0;
    this._virtualButton = null;
};

/**
 * Updates the input data.
 */
Input.update = function() {
    this._pollGamepads();
    if (this._currentState[this._latestButton]) {
        this._pressedTime++;
    } else {
        this._latestButton = null;
    }
    for (const name in this._currentState) {
        if (this._currentState[name] && !this._previousState[name]) {
            this._latestButton = name;
            this._pressedTime = 0;
            this._date = Date.now();
        }
        this._previousState[name] = this._currentState[name];
    }
    if (this._virtualButton) {
        this._latestButton = this._virtualButton;
        this._pressedTime = 0;
        this._virtualButton = null;
    }
    this._updateDirection();
};

/**
 * Checks whether a key is currently pressed down.
 *
 * @param {string} keyName - The mapped name of the key.
 * @returns {boolean} True if the key is pressed.
 */
Input.isPressed = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isPressed("escape")) {
        return true;
    } else {
        return !!this._currentState[keyName];
    }
};

/**
 * Checks whether a key is just pressed.
 *
 * @param {string} keyName - The mapped name of the key.
 * @returns {boolean} True if the key is triggered.
 */
Input.isTriggered = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isTriggered("escape")) {
        return true;
    } else {
        return this._latestButton === keyName && this._pressedTime === 0;
    }
};

/**
 * Checks whether a key is just pressed or a key repeat occurred.
 *
 * @param {string} keyName - The mapped name of the key.
 * @returns {boolean} True if the key is repeated.
 */
Input.isRepeated = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isRepeated("escape")) {
        return true;
    } else {
        return (
            this._latestButton === keyName &&
            (this._pressedTime === 0 ||
                (this._pressedTime >= this.keyRepeatWait &&
                    this._pressedTime % this.keyRepeatInterval === 0))
        );
    }
};

/**
 * Checks whether a key is kept depressed.
 *
 * @param {string} keyName - The mapped name of the key.
 * @returns {boolean} True if the key is long-pressed.
 */
Input.isLongPressed = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isLongPressed("escape")) {
        return true;
    } else {
        return (
            this._latestButton === keyName &&
            this._pressedTime >= this.keyRepeatWait
        );
    }
};

/**
 * The four direction value as a number of the numpad, or 0 for neutral.
 *
 * @readonly
 * @type number
 * @name Input.dir4
 */
Object.defineProperty(Input, "dir4", {
    get: function() {
        return this._dir4;
    },
    configurable: true
});

/**
 * The eight direction value as a number of the numpad, or 0 for neutral.
 *
 * @readonly
 * @type number
 * @name Input.dir8
 */
Object.defineProperty(Input, "dir8", {
    get: function() {
        return this._dir8;
    },
    configurable: true
});

/**
 * The time of the last input in milliseconds.
 *
 * @readonly
 * @type number
 * @name Input.date
 */
Object.defineProperty(Input, "date", {
    get: function() {
        return this._date;
    },
    configurable: true
});

Input.virtualClick = function(buttonName) {
    this._virtualButton = buttonName;
};

Input._setupEventHandlers = function() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
    window.addEventListener("blur", this._onLostFocus.bind(this));
};

Input._onKeyDown = function(event) {
    if (this._shouldPreventDefault(event.keyCode)) {
        event.preventDefault();
    }
    if (event.keyCode === 144) {
        // Numlock
        this.clear();
    }
    const buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = true;
    }
};

Input._shouldPreventDefault = function(keyCode) {
    switch (keyCode) {
        case 8: // backspace
        case 9: // tab
        case 33: // pageup
        case 34: // pagedown
        case 37: // left arrow
        case 38: // up arrow
        case 39: // right arrow
        case 40: // down arrow
            return true;
    }
    return false;
};

Input._onKeyUp = function(event) {
    const buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = false;
    }
};

Input._onLostFocus = function() {
    this.clear();
};

Input._pollGamepads = function() {
    if (navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        if (gamepads) {
            for (const gamepad of gamepads) {
                if (gamepad && gamepad.connected) {
                    this._updateGamepadState(gamepad);
                }
            }
        }
    }
};

Input._updateGamepadState = function(gamepad) {
    const lastState = this._gamepadStates[gamepad.index] || [];
    const newState = [];
    const buttons = gamepad.buttons;
    const axes = gamepad.axes;
    const threshold = 0.5;
    newState[12] = false;
    newState[13] = false;
    newState[14] = false;
    newState[15] = false;
    for (let i = 0; i < buttons.length; i++) {
        newState[i] = buttons[i].pressed;
    }
    if (axes[1] < -threshold) {
        newState[12] = true; // up
    } else if (axes[1] > threshold) {
        newState[13] = true; // down
    }
    if (axes[0] < -threshold) {
        newState[14] = true; // left
    } else if (axes[0] > threshold) {
        newState[15] = true; // right
    }
    for (let j = 0; j < newState.length; j++) {
        if (newState[j] !== lastState[j]) {
            const buttonName = this.gamepadMapper[j];
            if (buttonName) {
                this._currentState[buttonName] = newState[j];
            }
        }
    }
    this._gamepadStates[gamepad.index] = newState;
};

Input._updateDirection = function() {
    let x = this._signX();
    let y = this._signY();
    this._dir8 = this._makeNumpadDirection(x, y);
    if (x !== 0 && y !== 0) {
        if (this._preferredAxis === "x") {
            y = 0;
        } else {
            x = 0;
        }
    } else if (x !== 0) {
        this._preferredAxis = "y";
    } else if (y !== 0) {
        this._preferredAxis = "x";
    }
    this._dir4 = this._makeNumpadDirection(x, y);
};

Input._signX = function() {
    const left = this.isPressed("left") ? 1 : 0;
    const right = this.isPressed("right") ? 1 : 0;
    return right - left;
};

Input._signY = function() {
    const up = this.isPressed("up") ? 1 : 0;
    const down = this.isPressed("down") ? 1 : 0;
    return down - up;
};

Input._makeNumpadDirection = function(x, y) {
    if (x === 0 && y === 0) {
        return 0;
    } else {
        return 5 - y * 3 + x;
    }
};

Input._isEscapeCompatible = function(keyName) {
    return keyName === "cancel" || keyName === "menu";
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @namespace
 */
function TouchInput() {
    throw new Error("This is a static class");
}

/**
 * Initializes the touch system.
 */
TouchInput.initialize = function() {
    this.clear();
    this._setupEventHandlers();
};

/**
 * The wait time of the pseudo key repeat in frames.
 *
 * @type number
 */
TouchInput.keyRepeatWait = 24;

/**
 * The interval of the pseudo key repeat in frames.
 *
 * @type number
 */
TouchInput.keyRepeatInterval = 6;

/**
 * The threshold number of pixels to treat as moved.
 *
 * @type number
 */
TouchInput.moveThreshold = 10;

/**
 * Clears all the touch data.
 */
TouchInput.clear = function() {
    this._mousePressed = false;
    this._screenPressed = false;
    this._pressedTime = 0;
    this._clicked = false;
    this._newState = this._createNewState();
    this._currentState = this._createNewState();
    this._x = 0;
    this._y = 0;
    this._triggerX = 0;
    this._triggerY = 0;
    this._moved = false;
    this._date = 0;
};

/**
 * Updates the touch data.
 */
TouchInput.update = function() {
    this._currentState = this._newState;
    this._newState = this._createNewState();
    this._clicked = this._currentState.released && !this._moved;
    if (this.isPressed()) {
        this._pressedTime++;
    }
};

/**
 * Checks whether the mouse button or touchscreen has been pressed and
 * released at the same position.
 *
 * @returns {boolean} True if the mouse button or touchscreen is clicked.
 */
TouchInput.isClicked = function() {
    return this._clicked;
};

/**
 * Checks whether the mouse button or touchscreen is currently pressed down.
 *
 * @returns {boolean} True if the mouse button or touchscreen is pressed.
 */
TouchInput.isPressed = function() {
    return this._mousePressed || this._screenPressed;
};

/**
 * Checks whether the left mouse button or touchscreen is just pressed.
 *
 * @returns {boolean} True if the mouse button or touchscreen is triggered.
 */
TouchInput.isTriggered = function() {
    return this._currentState.triggered;
};

/**
 * Checks whether the left mouse button or touchscreen is just pressed
 * or a pseudo key repeat occurred.
 *
 * @returns {boolean} True if the mouse button or touchscreen is repeated.
 */
TouchInput.isRepeated = function() {
    return (
        this.isPressed() &&
        (this._currentState.triggered ||
            (this._pressedTime >= this.keyRepeatWait &&
                this._pressedTime % this.keyRepeatInterval === 0))
    );
};

/**
 * Checks whether the left mouse button or touchscreen is kept depressed.
 *
 * @returns {boolean} True if the left mouse button or touchscreen is long-pressed.
 */
TouchInput.isLongPressed = function() {
    return this.isPressed() && this._pressedTime >= this.keyRepeatWait;
};

/**
 * Checks whether the right mouse button is just pressed.
 *
 * @returns {boolean} True if the right mouse button is just pressed.
 */
TouchInput.isCancelled = function() {
    return this._currentState.cancelled;
};

/**
 * Checks whether the mouse or a finger on the touchscreen is moved.
 *
 * @returns {boolean} True if the mouse or a finger on the touchscreen is moved.
 */
TouchInput.isMoved = function() {
    return this._currentState.moved;
};

/**
 * Checks whether the mouse is moved without pressing a button.
 *
 * @returns {boolean} True if the mouse is hovered.
 */
TouchInput.isHovered = function() {
    return this._currentState.hovered;
};

/**
 * Checks whether the left mouse button or touchscreen is released.
 *
 * @returns {boolean} True if the mouse button or touchscreen is released.
 */
TouchInput.isReleased = function() {
    return this._currentState.released;
};

/**
 * The horizontal scroll amount.
 *
 * @readonly
 * @type number
 * @name TouchInput.wheelX
 */
Object.defineProperty(TouchInput, "wheelX", {
    get: function() {
        return this._currentState.wheelX;
    },
    configurable: true
});

/**
 * The vertical scroll amount.
 *
 * @readonly
 * @type number
 * @name TouchInput.wheelY
 */
Object.defineProperty(TouchInput, "wheelY", {
    get: function() {
        return this._currentState.wheelY;
    },
    configurable: true
});

/**
 * The x coordinate on the canvas area of the latest touch event.
 *
 * @readonly
 * @type number
 * @name TouchInput.x
 */
Object.defineProperty(TouchInput, "x", {
    get: function() {
        return this._x;
    },
    configurable: true
});

/**
 * The y coordinate on the canvas area of the latest touch event.
 *
 * @readonly
 * @type number
 * @name TouchInput.y
 */
Object.defineProperty(TouchInput, "y", {
    get: function() {
        return this._y;
    },
    configurable: true
});

/**
 * The time of the last input in milliseconds.
 *
 * @readonly
 * @type number
 * @name TouchInput.date
 */
Object.defineProperty(TouchInput, "date", {
    get: function() {
        return this._date;
    },
    configurable: true
});

TouchInput._createNewState = function() {
    return {
        triggered: false,
        cancelled: false,
        moved: false,
        hovered: false,
        released: false,
        wheelX: 0,
        wheelY: 0
    };
};

TouchInput._setupEventHandlers = function() {
    const pf = { passive: false };
    document.addEventListener("mousedown", this._onMouseDown.bind(this));
    document.addEventListener("mousemove", this._onMouseMove.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));
    document.addEventListener("wheel", this._onWheel.bind(this), pf);
    document.addEventListener("touchstart", this._onTouchStart.bind(this), pf);
    document.addEventListener("touchmove", this._onTouchMove.bind(this), pf);
    document.addEventListener("touchend", this._onTouchEnd.bind(this));
    document.addEventListener("touchcancel", this._onTouchCancel.bind(this));
    window.addEventListener("blur", this._onLostFocus.bind(this));
};

TouchInput._onMouseDown = function(event) {
    if (event.button === 0) {
        this._onLeftButtonDown(event);
    } else if (event.button === 1) {
        this._onMiddleButtonDown(event);
    } else if (event.button === 2) {
        this._onRightButtonDown(event);
    }
};

TouchInput._onLeftButtonDown = function(event) {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
        this._mousePressed = true;
        this._pressedTime = 0;
        this._onTrigger(x, y);
    }
};

TouchInput._onMiddleButtonDown = function(/*event*/) {
    //
};

TouchInput._onRightButtonDown = function(event) {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
        this._onCancel(x, y);
    }
};

TouchInput._onMouseMove = function(event) {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (this._mousePressed) {
        this._onMove(x, y);
    } else if (Graphics.isInsideCanvas(x, y)) {
        this._onHover(x, y);
    }
};

TouchInput._onMouseUp = function(event) {
    if (event.button === 0) {
        const x = Graphics.pageToCanvasX(event.pageX);
        const y = Graphics.pageToCanvasY(event.pageY);
        this._mousePressed = false;
        this._onRelease(x, y);
    }
};

TouchInput._onWheel = function(event) {
    this._newState.wheelX += event.deltaX;
    this._newState.wheelY += event.deltaY;
    event.preventDefault();
};

TouchInput._onTouchStart = function(event) {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            this._screenPressed = true;
            this._pressedTime = 0;
            if (event.touches.length >= 2) {
                this._onCancel(x, y);
            } else {
                this._onTrigger(x, y);
            }
            event.preventDefault();
        }
    }
    if (window.cordova || window.navigator.standalone) {
        event.preventDefault();
    }
};

TouchInput._onTouchMove = function(event) {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        this._onMove(x, y);
    }
};

TouchInput._onTouchEnd = function(event) {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        this._screenPressed = false;
        this._onRelease(x, y);
    }
};

TouchInput._onTouchCancel = function(/*event*/) {
    this._screenPressed = false;
};

TouchInput._onLostFocus = function() {
    this.clear();
};

TouchInput._onTrigger = function(x, y) {
    this._newState.triggered = true;
    this._x = x;
    this._y = y;
    this._triggerX = x;
    this._triggerY = y;
    this._moved = false;
    this._date = Date.now();
};

TouchInput._onCancel = function(x, y) {
    this._newState.cancelled = true;
    this._x = x;
    this._y = y;
};

TouchInput._onMove = function(x, y) {
    const dx = Math.abs(x - this._triggerX);
    const dy = Math.abs(y - this._triggerY);
    if (dx > this.moveThreshold || dy > this.moveThreshold) {
        this._moved = true;
    }
    if (this._moved) {
        this._newState.moved = true;
        this._x = x;
        this._y = y;
    }
};

TouchInput._onHover = function(x, y) {
    this._newState.hovered = true;
    this._x = x;
    this._y = y;
};

TouchInput._onRelease = function(x, y) {
    this._newState.released = true;
    this._x = x;
    this._y = y;
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles JSON with object information.
 *
 * @namespace
 */
function JsonEx() {
    throw new Error("This is a static class");
}

/**
 * The maximum depth of objects.
 *
 * @type number
 * @default 100
 */
JsonEx.maxDepth = 100;

/**
 * Converts an object to a JSON string with object information.
 *
 * @param {object} object - The object to be converted.
 * @returns {string} The JSON string.
 */
JsonEx.stringify = function(object) {
    return JSON.stringify(this._encode(object, 0));
};

/**
 * Parses a JSON string and reconstructs the corresponding object.
 *
 * @param {string} json - The JSON string.
 * @returns {object} The reconstructed object.
 */
JsonEx.parse = function(json) {
    return this._decode(JSON.parse(json));
};

/**
 * Makes a deep copy of the specified object.
 *
 * @param {object} object - The object to be copied.
 * @returns {object} The copied object.
 */
JsonEx.makeDeepCopy = function(object) {
    return this.parse(this.stringify(object));
};

JsonEx._encode = function(value, depth) {
    // [Note] The handling code for circular references in certain versions of
    //   MV has been removed because it was too complicated and expensive.
    if (depth >= this.maxDepth) {
        throw new Error("Object too deep");
    }
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
        const constructorName = value.constructor.name;
        if (constructorName !== "Object" && constructorName !== "Array") {
            value["@"] = constructorName;
        }
        for (const key of Object.keys(value)) {
            value[key] = this._encode(value[key], depth + 1);
        }
    }
    return value;
};

JsonEx._decode = function(value) {
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
        if (value["@"]) {
            const constructor = window[value["@"]];
            if (constructor) {
                Object.setPrototypeOf(value, constructor.prototype);
            }
        }
        for (const key of Object.keys(value)) {
            value[key] = this._decode(value[key]);
        }
    }
    return value;
};

//-----------------------------------------------------------------------------
