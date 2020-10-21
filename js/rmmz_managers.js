//=============================================================================
// rmmz_managers.js v1.0.0
//=============================================================================

//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

function DataManager() {
    throw new Error("This is a static class");
}

$dataActors = null;
$dataClasses = null;
$dataSkills = null;
$dataItems = null;
$dataWeapons = null;
$dataArmors = null;
$dataEnemies = null;
$dataTroops = null;
$dataStates = null;
$dataAnimations = null;
$dataTilesets = null;
$dataCommonEvents = null;
$dataSystem = null;
$dataMapInfos = null;
$dataMap = null;
$gameTemp = null;
$gameSystem = null;
$gameScreen = null;
$gameTimer = null;
$gameMessage = null;
$gameSwitches = null;
$gameVariables = null;
$gameSelfSwitches = null;
$gameActors = null;
$gameParty = null;
$gameTroop = null;
$gameMap = null;
$gamePlayer = null;
$testEvent = null;

DataManager._globalInfo = null;
DataManager._errors = [];

DataManager._databaseFiles = [
    { name: "$dataActors", src: "Actors.json" },
    { name: "$dataClasses", src: "Classes.json" },
    { name: "$dataSkills", src: "Skills.json" },
    { name: "$dataItems", src: "Items.json" },
    { name: "$dataWeapons", src: "Weapons.json" },
    { name: "$dataArmors", src: "Armors.json" },
    { name: "$dataEnemies", src: "Enemies.json" },
    { name: "$dataTroops", src: "Troops.json" },
    { name: "$dataStates", src: "States.json" },
    { name: "$dataAnimations", src: "Animations.json" },
    { name: "$dataTilesets", src: "Tilesets.json" },
    { name: "$dataCommonEvents", src: "CommonEvents.json" },
    { name: "$dataSystem", src: "System.json" },
    { name: "$dataMapInfos", src: "MapInfos.json" }
];

DataManager.loadGlobalInfo = function() {
    StorageManager.loadObject("global")
        .then(globalInfo => {
            this._globalInfo = globalInfo;
            this.removeInvalidGlobalInfo();
            return 0;
        })
        .catch(() => {
            this._globalInfo = [];
        });
};

DataManager.removeInvalidGlobalInfo = function() {
    const globalInfo = this._globalInfo;
    for (const info of globalInfo) {
        const savefileId = globalInfo.indexOf(info);
        if (!this.savefileExists(savefileId)) {
            delete globalInfo[savefileId];
        }
    }
};

DataManager.saveGlobalInfo = function() {
    StorageManager.saveObject("global", this._globalInfo);
};

DataManager.isGlobalInfoLoaded = function() {
    return !!this._globalInfo;
};

DataManager.loadDatabase = function() {
    const test = this.isBattleTest() || this.isEventTest();
    const prefix = test ? "Test_" : "";
    for (const databaseFile of this._databaseFiles) {
        this.loadDataFile(databaseFile.name, prefix + databaseFile.src);
    }
    if (this.isEventTest()) {
        this.loadDataFile("$testEvent", prefix + "Event.json");
    }
};

DataManager.loadDataFile = function(name, src) {
    const xhr = new XMLHttpRequest();
    const url = "data/" + src;
    window[name] = null;
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
    xhr.onerror = () => this.onXhrError(name, src, url);
    xhr.send();
};

DataManager.onXhrLoad = function(xhr, name, src, url) {
    if (xhr.status < 400) {
        window[name] = JSON.parse(xhr.responseText);
        this.onLoad(window[name]);
    } else {
        this.onXhrError(name, src, url);
    }
};

DataManager.onXhrError = function(name, src, url) {
    const error = { name: name, src: src, url: url };
    this._errors.push(error);
};

DataManager.isDatabaseLoaded = function() {
    this.checkError();
    for (const databaseFile of this._databaseFiles) {
        if (!window[databaseFile.name]) {
            return false;
        }
    }
    return true;
};

DataManager.loadMapData = function(mapId) {
    if (mapId > 0) {
        const filename = "Map%1.json".format(mapId.padZero(3));
        this.loadDataFile("$dataMap", filename);
    } else {
        this.makeEmptyMap();
    }
};

DataManager.makeEmptyMap = function() {
    $dataMap = {};
    $dataMap.data = [];
    $dataMap.events = [];
    $dataMap.width = 100;
    $dataMap.height = 100;
    $dataMap.scrollType = 3;
};

DataManager.isMapLoaded = function() {
    this.checkError();
    return !!$dataMap;
};

DataManager.onLoad = function(object) {
    if (this.isMapObject(object)) {
        this.extractMetadata(object);
        this.extractArrayMetadata(object.events);
    } else {
        this.extractArrayMetadata(object);
    }
};

DataManager.isMapObject = function(object) {
    return !!(object.data && object.events);
};

DataManager.extractArrayMetadata = function(array) {
    if (Array.isArray(array)) {
        for (const data of array) {
            if (data && "note" in data) {
                this.extractMetadata(data);
            }
        }
    }
};

DataManager.extractMetadata = function(data) {
    const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
    data.meta = {};
    for (;;) {
        const match = regExp.exec(data.note);
        if (match) {
            if (match[2] === ":") {
                data.meta[match[1]] = match[3];
            } else {
                data.meta[match[1]] = true;
            }
        } else {
            break;
        }
    }
};

DataManager.checkError = function() {
    if (this._errors.length > 0) {
        const error = this._errors.shift();
        const retry = () => {
            this.loadDataFile(error.name, error.src);
        };
        throw ["LoadError", error.url, retry];
    }
};

DataManager.isBattleTest = function() {
    return Utils.isOptionValid("btest");
};

DataManager.isEventTest = function() {
    return Utils.isOptionValid("etest");
};

DataManager.isSkill = function(item) {
    return item && $dataSkills.includes(item);
};

DataManager.isItem = function(item) {
    return item && $dataItems.includes(item);
};

DataManager.isWeapon = function(item) {
    return item && $dataWeapons.includes(item);
};

DataManager.isArmor = function(item) {
    return item && $dataArmors.includes(item);
};

DataManager.createGameObjects = function() {
    $gameTemp = new Game_Temp();
    $gameSystem = new Game_System();
    $gameScreen = new Game_Screen();
    $gameTimer = new Game_Timer();
    $gameMessage = new Game_Message();
    $gameSwitches = new Game_Switches();
    $gameVariables = new Game_Variables();
    $gameSelfSwitches = new Game_SelfSwitches();
    $gameActors = new Game_Actors();
    $gameParty = new Game_Party();
    $gameTroop = new Game_Troop();
    $gameMap = new Game_Map();
    $gamePlayer = new Game_Player();
};

DataManager.setupNewGame = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.setupForNewGame();
    Graphics.frameCount = 0;
};

DataManager.setupBattleTest = function() {
    this.createGameObjects();
    $gameParty.setupBattleTest();
    BattleManager.setup($dataSystem.testTroopId, true, false);
    BattleManager.setBattleTest(true);
    BattleManager.playBattleBgm();
};

DataManager.setupEventTest = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(-1, 8, 6);
    $gamePlayer.setTransparent(false);
};

DataManager.isAnySavefileExists = function() {
    return this._globalInfo.some(x => x);
};

DataManager.latestSavefileId = function() {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo.slice(1).filter(x => x);
    const latest = Math.max(...validInfo.map(x => x.timestamp));
    const index = globalInfo.findIndex(x => x && x.timestamp === latest);
    return index > 0 ? index : 0;
};

DataManager.earliestSavefileId = function() {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo.slice(1).filter(x => x);
    const earliest = Math.min(...validInfo.map(x => x.timestamp));
    const index = globalInfo.findIndex(x => x && x.timestamp === earliest);
    return index > 0 ? index : 0;
};

DataManager.emptySavefileId = function() {
    const globalInfo = this._globalInfo;
    const maxSavefiles = this.maxSavefiles();
    if (globalInfo.length < maxSavefiles) {
        return Math.max(1, globalInfo.length);
    } else {
        const index = globalInfo.slice(1).findIndex(x => !x);
        return index >= 0 ? index + 1 : -1;
    }
};

DataManager.loadAllSavefileImages = function() {
    for (const info of this._globalInfo.filter(x => x)) {
        this.loadSavefileImages(info);
    }
};

DataManager.loadSavefileImages = function(info) {
    if (info.characters && Symbol.iterator in info.characters) {
        for (const character of info.characters) {
            ImageManager.loadCharacter(character[0]);
        }
    }
    if (info.faces && Symbol.iterator in info.faces) {
        for (const face of info.faces) {
            ImageManager.loadFace(face[0]);
        }
    }
};

DataManager.maxSavefiles = function() {
    return 20;
};

DataManager.savefileInfo = function(savefileId) {
    const globalInfo = this._globalInfo;
    return globalInfo[savefileId] ? globalInfo[savefileId] : null;
};

DataManager.savefileExists = function(savefileId) {
    const saveName = this.makeSavename(savefileId);
    return StorageManager.exists(saveName);
};

DataManager.saveGame = function(savefileId) {
    const contents = this.makeSaveContents();
    const saveName = this.makeSavename(savefileId);
    return StorageManager.saveObject(saveName, contents).then(() => {
        this._globalInfo[savefileId] = this.makeSavefileInfo();
        this.saveGlobalInfo();
        return 0;
    });
};

DataManager.loadGame = function(savefileId) {
    const saveName = this.makeSavename(savefileId);
    return StorageManager.loadObject(saveName).then(contents => {
        this.createGameObjects();
        this.extractSaveContents(contents);
        this.correctDataErrors();
        return 0;
    });
};

DataManager.makeSavename = function(savefileId) {
    return "file%1".format(savefileId);
};

DataManager.selectSavefileForNewGame = function() {
    const emptySavefileId = this.emptySavefileId();
    const earliestSavefileId = this.earliestSavefileId();
    if (emptySavefileId > 0) {
        $gameSystem.setSavefileId(emptySavefileId);
    } else {
        $gameSystem.setSavefileId(earliestSavefileId);
    }
};

DataManager.makeSavefileInfo = function() {
    const info = {};
    info.title = $dataSystem.gameTitle;
    info.characters = $gameParty.charactersForSavefile();
    info.faces = $gameParty.facesForSavefile();
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    return info;
};

DataManager.makeSaveContents = function() {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    const contents = {};
    contents.system = $gameSystem;
    contents.screen = $gameScreen;
    contents.timer = $gameTimer;
    contents.switches = $gameSwitches;
    contents.variables = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors = $gameActors;
    contents.party = $gameParty;
    contents.map = $gameMap;
    contents.player = $gamePlayer;
    return contents;
};

DataManager.extractSaveContents = function(contents) {
    $gameSystem = contents.system;
    $gameScreen = contents.screen;
    $gameTimer = contents.timer;
    $gameSwitches = contents.switches;
    $gameVariables = contents.variables;
    $gameSelfSwitches = contents.selfSwitches;
    $gameActors = contents.actors;
    $gameParty = contents.party;
    $gameMap = contents.map;
    $gamePlayer = contents.player;
};

DataManager.correctDataErrors = function() {
    $gameParty.removeInvalidMembers();
};

//-----------------------------------------------------------------------------
// ConfigManager
//
// The static class that manages the configuration data.

function ConfigManager() {
    throw new Error("This is a static class");
}

ConfigManager.alwaysDash = false;
ConfigManager.commandRemember = false;
ConfigManager.touchUI = true;
ConfigManager._isLoaded = false;

Object.defineProperty(ConfigManager, "bgmVolume", {
    get: function() {
        return AudioManager._bgmVolume;
    },
    set: function(value) {
        AudioManager.bgmVolume = value;
    },
    configurable: true
});

Object.defineProperty(ConfigManager, "bgsVolume", {
    get: function() {
        return AudioManager.bgsVolume;
    },
    set: function(value) {
        AudioManager.bgsVolume = value;
    },
    configurable: true
});

Object.defineProperty(ConfigManager, "meVolume", {
    get: function() {
        return AudioManager.meVolume;
    },
    set: function(value) {
        AudioManager.meVolume = value;
    },
    configurable: true
});

Object.defineProperty(ConfigManager, "seVolume", {
    get: function() {
        return AudioManager.seVolume;
    },
    set: function(value) {
        AudioManager.seVolume = value;
    },
    configurable: true
});

ConfigManager.load = function() {
    StorageManager.loadObject("config")
        .then(config => this.applyData(config || {}))
        .catch(() => 0)
        .then(() => {
            this._isLoaded = true;
            return 0;
        })
        .catch(() => 0);
};

ConfigManager.save = function() {
    StorageManager.saveObject("config", this.makeData());
};

ConfigManager.isLoaded = function() {
    return this._isLoaded;
};

ConfigManager.makeData = function() {
    const config = {};
    config.alwaysDash = this.alwaysDash;
    config.commandRemember = this.commandRemember;
    config.touchUI = this.touchUI;
    config.bgmVolume = this.bgmVolume;
    config.bgsVolume = this.bgsVolume;
    config.meVolume = this.meVolume;
    config.seVolume = this.seVolume;
    return config;
};

ConfigManager.applyData = function(config) {
    this.alwaysDash = this.readFlag(config, "alwaysDash", false);
    this.commandRemember = this.readFlag(config, "commandRemember", false);
    this.touchUI = this.readFlag(config, "touchUI", true);
    this.bgmVolume = this.readVolume(config, "bgmVolume");
    this.bgsVolume = this.readVolume(config, "bgsVolume");
    this.meVolume = this.readVolume(config, "meVolume");
    this.seVolume = this.readVolume(config, "seVolume");
};

ConfigManager.readFlag = function(config, name, defaultValue) {
    if (name in config) {
        return !!config[name];
    } else {
        return defaultValue;
    }
};

ConfigManager.readVolume = function(config, name) {
    if (name in config) {
        return Number(config[name]).clamp(0, 100);
    } else {
        return 100;
    }
};

//-----------------------------------------------------------------------------
// StorageManager
//
// The static class that manages storage for saving game data.

function StorageManager() {
    throw new Error("This is a static class");
}

StorageManager._forageKeys = [];
StorageManager._forageKeysUpdated = false;

StorageManager.isLocalMode = function() {
    return Utils.isNwjs();
};

StorageManager.saveObject = function(saveName, object) {
    return this.objectToJson(object)
        .then(json => this.jsonToZip(json))
        .then(zip => this.saveZip(saveName, zip));
};

StorageManager.loadObject = function(saveName) {
    return this.loadZip(saveName)
        .then(zip => this.zipToJson(zip))
        .then(json => this.jsonToObject(json));
};

StorageManager.objectToJson = function(object) {
    return new Promise((resolve, reject) => {
        try {
            const json = JsonEx.stringify(object);
            resolve(json);
        } catch (e) {
            reject(e);
        }
    });
};

StorageManager.jsonToObject = function(json) {
    return new Promise((resolve, reject) => {
        try {
            const object = JsonEx.parse(json);
            resolve(object);
        } catch (e) {
            reject(e);
        }
    });
};

StorageManager.jsonToZip = function(json) {
    return new Promise((resolve, reject) => {
        try {
            const zip = pako.deflate(json, { to: "string", level: 1 });
            if (zip.length >= 50000) {
                console.warn("Save data is too big.");
            }
            resolve(zip);
        } catch (e) {
            reject(e);
        }
    });
};

StorageManager.zipToJson = function(zip) {
    return new Promise((resolve, reject) => {
        try {
            if (zip) {
                const json = pako.inflate(zip, { to: "string" });
                resolve(json);
            } else {
                resolve("null");
            }
        } catch (e) {
            reject(e);
        }
    });
};

StorageManager.saveZip = function(saveName, zip) {
    if (this.isLocalMode()) {
        return this.saveToLocalFile(saveName, zip);
    } else {
        return this.saveToForage(saveName, zip);
    }
};

StorageManager.loadZip = function(saveName) {
    if (this.isLocalMode()) {
        return this.loadFromLocalFile(saveName);
    } else {
        return this.loadFromForage(saveName);
    }
};

StorageManager.exists = function(saveName) {
    if (this.isLocalMode()) {
        return this.localFileExists(saveName);
    } else {
        return this.forageExists(saveName);
    }
};

StorageManager.remove = function(saveName) {
    if (this.isLocalMode()) {
        return this.removeLocalFile(saveName);
    } else {
        return this.removeForage(saveName);
    }
};

StorageManager.saveToLocalFile = function(saveName, zip) {
    const dirPath = this.fileDirectoryPath();
    const filePath = this.filePath(saveName);
    const backupFilePath = filePath + "_";
    return new Promise((resolve, reject) => {
        this.fsMkdir(dirPath);
        this.fsUnlink(backupFilePath);
        this.fsRename(filePath, backupFilePath);
        try {
            this.fsWriteFile(filePath, zip);
            this.fsUnlink(backupFilePath);
            resolve();
        } catch (e) {
            try {
                this.fsUnlink(filePath);
                this.fsRename(backupFilePath, filePath);
            } catch (e2) {
                //
            }
            reject(e);
        }
    });
};

StorageManager.loadFromLocalFile = function(saveName) {
    const filePath = this.filePath(saveName);
    return new Promise((resolve, reject) => {
        const data = this.fsReadFile(filePath);
        if (data) {
            resolve(data);
        } else {
            reject(new Error("Savefile not found"));
        }
    });
};

StorageManager.localFileExists = function(saveName) {
    const fs = require("fs");
    return fs.existsSync(this.filePath(saveName));
};

StorageManager.removeLocalFile = function(saveName) {
    this.fsUnlink(this.filePath(saveName));
};

StorageManager.saveToForage = function(saveName, zip) {
    const key = this.forageKey(saveName);
    const testKey = this.forageTestKey();
    setTimeout(() => localforage.removeItem(testKey));
    return localforage
        .setItem(testKey, zip)
        .then(localforage.setItem(key, zip))
        .then(this.updateForageKeys());
};

StorageManager.loadFromForage = function(saveName) {
    const key = this.forageKey(saveName);
    return localforage.getItem(key);
};

StorageManager.forageExists = function(saveName) {
    const key = this.forageKey(saveName);
    return this._forageKeys.includes(key);
};

StorageManager.removeForage = function(saveName) {
    const key = this.forageKey(saveName);
    return localforage.removeItem(key).then(this.updateForageKeys());
};

StorageManager.updateForageKeys = function() {
    this._forageKeysUpdated = false;
    return localforage.keys().then(keys => {
        this._forageKeys = keys;
        this._forageKeysUpdated = true;
        return 0;
    });
};

StorageManager.forageKeysUpdated = function() {
    return this._forageKeysUpdated;
};

StorageManager.fsMkdir = function(path) {
    const fs = require("fs");
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
};

StorageManager.fsRename = function(oldPath, newPath) {
    const fs = require("fs");
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
    }
};

StorageManager.fsUnlink = function(path) {
    const fs = require("fs");
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
};

StorageManager.fsReadFile = function(path) {
    const fs = require("fs");
    if (fs.existsSync(path)) {
        return fs.readFileSync(path, { encoding: "utf8" });
    } else {
        return null;
    }
};

StorageManager.fsWriteFile = function(path, data) {
    const fs = require("fs");
    fs.writeFileSync(path, data);
};

StorageManager.fileDirectoryPath = function() {
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    return path.join(base, "save/");
};

StorageManager.filePath = function(saveName) {
    const dir = this.fileDirectoryPath();
    return dir + saveName + ".rmmzsave";
};

StorageManager.forageKey = function(saveName) {
    const gameId = $dataSystem.advanced.gameId;
    return "rmmzsave." + gameId + "." + saveName;
};

StorageManager.forageTestKey = function() {
    return "rmmzsave.test";
};

//-----------------------------------------------------------------------------
// FontManager
//
// The static class that loads font files.

function FontManager() {
    throw new Error("This is a static class");
}

FontManager._urls = {};
FontManager._states = {};

FontManager.load = function(family, filename) {
    if (this._states[family] !== "loaded") {
        if (filename) {
            const url = this.makeUrl(filename);
            this.startLoading(family, url);
        } else {
            this._urls[family] = "";
            this._states[family] = "loaded";
        }
    }
};

FontManager.isReady = function() {
    for (const family in this._states) {
        const state = this._states[family];
        if (state === "loading") {
            return false;
        }
        if (state === "error") {
            this.throwLoadError(family);
        }
    }
    return true;
};

FontManager.startLoading = function(family, url) {
    const source = "url(" + url + ")";
    const font = new FontFace(family, source);
    this._urls[family] = url;
    this._states[family] = "loading";
    font.load()
        .then(() => {
            document.fonts.add(font);
            this._states[family] = "loaded";
            return 0;
        })
        .catch(() => {
            this._states[family] = "error";
        });
};

FontManager.throwLoadError = function(family) {
    const url = this._urls[family];
    const retry = () => this.startLoading(family, url);
    throw ["LoadError", url, retry];
};

FontManager.makeUrl = function(filename) {
    return "fonts/" + Utils.encodeURI(filename);
};

//-----------------------------------------------------------------------------
// ImageManager
//
// The static class that loads images, creates bitmap objects and retains them.

function ImageManager() {
    throw new Error("This is a static class");
}

ImageManager.iconWidth = 32;
ImageManager.iconHeight = 32;
ImageManager.faceWidth = 144;
ImageManager.faceHeight = 144;

ImageManager._cache = {};
ImageManager._system = {};
ImageManager._emptyBitmap = new Bitmap(1, 1);

ImageManager.loadAnimation = function(filename) {
    return this.loadBitmap("img/animations/", filename);
};

ImageManager.loadBattleback1 = function(filename) {
    return this.loadBitmap("img/battlebacks1/", filename);
};

ImageManager.loadBattleback2 = function(filename) {
    return this.loadBitmap("img/battlebacks2/", filename);
};

ImageManager.loadEnemy = function(filename) {
    return this.loadBitmap("img/enemies/", filename);
};

ImageManager.loadCharacter = function(filename) {
    return this.loadBitmap("img/characters/", filename);
};

ImageManager.loadFace = function(filename) {
    return this.loadBitmap("img/faces/", filename);
};

ImageManager.loadParallax = function(filename) {
    return this.loadBitmap("img/parallaxes/", filename);
};

ImageManager.loadPicture = function(filename) {
    return this.loadBitmap("img/pictures/", filename);
};

ImageManager.loadSvActor = function(filename) {
    return this.loadBitmap("img/sv_actors/", filename);
};

ImageManager.loadSvEnemy = function(filename) {
    return this.loadBitmap("img/sv_enemies/", filename);
};

ImageManager.loadSystem = function(filename) {
    return this.loadBitmap("img/system/", filename);
};

ImageManager.loadTileset = function(filename) {
    return this.loadBitmap("img/tilesets/", filename);
};

ImageManager.loadTitle1 = function(filename) {
    return this.loadBitmap("img/titles1/", filename);
};

ImageManager.loadTitle2 = function(filename) {
    return this.loadBitmap("img/titles2/", filename);
};

ImageManager.loadBitmap = function(folder, filename) {
    if (filename) {
        const url = folder + Utils.encodeURI(filename) + ".png";
        return this.loadBitmapFromUrl(url);
    } else {
        return this._emptyBitmap;
    }
};

ImageManager.loadBitmapFromUrl = function(url) {
    const cache = url.includes("/system/") ? this._system : this._cache;
    if (!cache[url]) {
        cache[url] = Bitmap.load(url);
    }
    return cache[url];
};

ImageManager.clear = function() {
    const cache = this._cache;
    for (const url in cache) {
        cache[url].destroy();
    }
    this._cache = {};
};

ImageManager.isReady = function() {
    for (const cache of [this._cache, this._system]) {
        for (const url in cache) {
            const bitmap = cache[url];
            if (bitmap.isError()) {
                this.throwLoadError(bitmap);
            }
            if (!bitmap.isReady()) {
                return false;
            }
        }
    }
    return true;
};

ImageManager.throwLoadError = function(bitmap) {
    const retry = bitmap.retry.bind(bitmap);
    throw ["LoadError", bitmap.url, retry];
};

ImageManager.isObjectCharacter = function(filename) {
    const sign = filename.match(/^[!$]+/);
    return sign && sign[0].includes("!");
};

ImageManager.isBigCharacter = function(filename) {
    const sign = filename.match(/^[!$]+/);
    return sign && sign[0].includes("$");
};

ImageManager.isZeroParallax = function(filename) {
    return filename.charAt(0) === "!";
};

//-----------------------------------------------------------------------------
// EffectManager
//
// The static class that loads Effekseer effects.

function EffectManager() {
    throw new Error("This is a static class");
}

EffectManager._cache = {};
EffectManager._errorUrls = [];

EffectManager.load = function(filename) {
    if (filename) {
        const url = this.makeUrl(filename);
        const cache = this._cache;
        if (!cache[url] && Graphics.effekseer) {
            this.startLoading(url);
        }
        return cache[url];
    } else {
        return null;
    }
};

EffectManager.startLoading = function(url) {
    const onLoad = () => this.onLoad(url);
    const onError = () => this.onError(url);
    const effect = Graphics.effekseer.loadEffect(url, 1, onLoad, onError);
    this._cache[url] = effect;
    return effect;
};

EffectManager.clear = function() {
    for (const url in this._cache) {
        const effect = this._cache[url];
        Graphics.effekseer.releaseEffect(effect);
    }
    this._cache = {};
};

EffectManager.onLoad = function(/*url*/) {
    //
};

EffectManager.onError = function(url) {
    this._errorUrls.push(url);
};

EffectManager.makeUrl = function(filename) {
    return "effects/" + Utils.encodeURI(filename) + ".efkefc";
};

EffectManager.checkErrors = function() {
    const url = this._errorUrls.shift();
    if (url) {
        this.throwLoadError(url);
    }
};

EffectManager.throwLoadError = function(url) {
    const retry = () => this.startLoading(url);
    throw ["LoadError", url, retry];
};

EffectManager.isReady = function() {
    this.checkErrors();
    for (const url in this._cache) {
        const effect = this._cache[url];
        if (!effect.isLoaded) {
            return false;
        }
    }
    return true;
};

//-----------------------------------------------------------------------------
// AudioManager
//
// The static class that handles BGM, BGS, ME and SE.

function AudioManager() {
    throw new Error("This is a static class");
}

AudioManager._bgmVolume = 100;
AudioManager._bgsVolume = 100;
AudioManager._meVolume = 100;
AudioManager._seVolume = 100;
AudioManager._currentBgm = null;
AudioManager._currentBgs = null;
AudioManager._bgmBuffer = null;
AudioManager._bgsBuffer = null;
AudioManager._meBuffer = null;
AudioManager._seBuffers = [];
AudioManager._staticBuffers = [];
AudioManager._replayFadeTime = 0.5;
AudioManager._path = "audio/";

Object.defineProperty(AudioManager, "bgmVolume", {
    get: function() {
        return this._bgmVolume;
    },
    set: function(value) {
        this._bgmVolume = value;
        this.updateBgmParameters(this._currentBgm);
    },
    configurable: true
});

Object.defineProperty(AudioManager, "bgsVolume", {
    get: function() {
        return this._bgsVolume;
    },
    set: function(value) {
        this._bgsVolume = value;
        this.updateBgsParameters(this._currentBgs);
    },
    configurable: true
});

Object.defineProperty(AudioManager, "meVolume", {
    get: function() {
        return this._meVolume;
    },
    set: function(value) {
        this._meVolume = value;
        this.updateMeParameters(this._currentMe);
    },
    configurable: true
});

Object.defineProperty(AudioManager, "seVolume", {
    get: function() {
        return this._seVolume;
    },
    set: function(value) {
        this._seVolume = value;
    },
    configurable: true
});

AudioManager.playBgm = function(bgm, pos) {
    if (this.isCurrentBgm(bgm)) {
        this.updateBgmParameters(bgm);
    } else {
        this.stopBgm();
        if (bgm.name) {
            this._bgmBuffer = this.createBuffer("bgm/", bgm.name);
            this.updateBgmParameters(bgm);
            if (!this._meBuffer) {
                this._bgmBuffer.play(true, pos || 0);
            }
        }
    }
    this.updateCurrentBgm(bgm, pos);
};

AudioManager.replayBgm = function(bgm) {
    if (this.isCurrentBgm(bgm)) {
        this.updateBgmParameters(bgm);
    } else {
        this.playBgm(bgm, bgm.pos);
        if (this._bgmBuffer) {
            this._bgmBuffer.fadeIn(this._replayFadeTime);
        }
    }
};

AudioManager.isCurrentBgm = function(bgm) {
    return (
        this._currentBgm &&
        this._bgmBuffer &&
        this._currentBgm.name === bgm.name
    );
};

AudioManager.updateBgmParameters = function(bgm) {
    this.updateBufferParameters(this._bgmBuffer, this._bgmVolume, bgm);
};

AudioManager.updateCurrentBgm = function(bgm, pos) {
    this._currentBgm = {
        name: bgm.name,
        volume: bgm.volume,
        pitch: bgm.pitch,
        pan: bgm.pan,
        pos: pos
    };
};

AudioManager.stopBgm = function() {
    if (this._bgmBuffer) {
        this._bgmBuffer.destroy();
        this._bgmBuffer = null;
        this._currentBgm = null;
    }
};

AudioManager.fadeOutBgm = function(duration) {
    if (this._bgmBuffer && this._currentBgm) {
        this._bgmBuffer.fadeOut(duration);
        this._currentBgm = null;
    }
};

AudioManager.fadeInBgm = function(duration) {
    if (this._bgmBuffer && this._currentBgm) {
        this._bgmBuffer.fadeIn(duration);
    }
};

AudioManager.playBgs = function(bgs, pos) {
    if (this.isCurrentBgs(bgs)) {
        this.updateBgsParameters(bgs);
    } else {
        this.stopBgs();
        if (bgs.name) {
            this._bgsBuffer = this.createBuffer("bgs/", bgs.name);
            this.updateBgsParameters(bgs);
            this._bgsBuffer.play(true, pos || 0);
        }
    }
    this.updateCurrentBgs(bgs, pos);
};

AudioManager.replayBgs = function(bgs) {
    if (this.isCurrentBgs(bgs)) {
        this.updateBgsParameters(bgs);
    } else {
        this.playBgs(bgs, bgs.pos);
        if (this._bgsBuffer) {
            this._bgsBuffer.fadeIn(this._replayFadeTime);
        }
    }
};

AudioManager.isCurrentBgs = function(bgs) {
    return (
        this._currentBgs &&
        this._bgsBuffer &&
        this._currentBgs.name === bgs.name
    );
};

AudioManager.updateBgsParameters = function(bgs) {
    this.updateBufferParameters(this._bgsBuffer, this._bgsVolume, bgs);
};

AudioManager.updateCurrentBgs = function(bgs, pos) {
    this._currentBgs = {
        name: bgs.name,
        volume: bgs.volume,
        pitch: bgs.pitch,
        pan: bgs.pan,
        pos: pos
    };
};

AudioManager.stopBgs = function() {
    if (this._bgsBuffer) {
        this._bgsBuffer.destroy();
        this._bgsBuffer = null;
        this._currentBgs = null;
    }
};

AudioManager.fadeOutBgs = function(duration) {
    if (this._bgsBuffer && this._currentBgs) {
        this._bgsBuffer.fadeOut(duration);
        this._currentBgs = null;
    }
};

AudioManager.fadeInBgs = function(duration) {
    if (this._bgsBuffer && this._currentBgs) {
        this._bgsBuffer.fadeIn(duration);
    }
};

AudioManager.playMe = function(me) {
    this.stopMe();
    if (me.name) {
        if (this._bgmBuffer && this._currentBgm) {
            this._currentBgm.pos = this._bgmBuffer.seek();
            this._bgmBuffer.stop();
        }
        this._meBuffer = this.createBuffer("me/", me.name);
        this.updateMeParameters(me);
        this._meBuffer.play(false);
        this._meBuffer.addStopListener(this.stopMe.bind(this));
    }
};

AudioManager.updateMeParameters = function(me) {
    this.updateBufferParameters(this._meBuffer, this._meVolume, me);
};

AudioManager.fadeOutMe = function(duration) {
    if (this._meBuffer) {
        this._meBuffer.fadeOut(duration);
    }
};

AudioManager.stopMe = function() {
    if (this._meBuffer) {
        this._meBuffer.destroy();
        this._meBuffer = null;
        if (
            this._bgmBuffer &&
            this._currentBgm &&
            !this._bgmBuffer.isPlaying()
        ) {
            this._bgmBuffer.play(true, this._currentBgm.pos);
            this._bgmBuffer.fadeIn(this._replayFadeTime);
        }
    }
};

AudioManager.playSe = function(se) {
    if (se.name) {
        // [Note] Do not play the same sound in the same frame.
        const latestBuffers = this._seBuffers.filter(
            buffer => buffer.frameCount === Graphics.frameCount
        );
        if (latestBuffers.find(buffer => buffer.name === se.name)) {
            return;
        }
        const buffer = this.createBuffer("se/", se.name);
        this.updateSeParameters(buffer, se);
        buffer.play(false);
        this._seBuffers.push(buffer);
        this.cleanupSe();
    }
};

AudioManager.updateSeParameters = function(buffer, se) {
    this.updateBufferParameters(buffer, this._seVolume, se);
};

AudioManager.cleanupSe = function() {
    for (const buffer of this._seBuffers) {
        if (!buffer.isPlaying()) {
            buffer.destroy();
        }
    }
    this._seBuffers = this._seBuffers.filter(buffer => buffer.isPlaying());
};

AudioManager.stopSe = function() {
    for (const buffer of this._seBuffers) {
        buffer.destroy();
    }
    this._seBuffers = [];
};

AudioManager.playStaticSe = function(se) {
    if (se.name) {
        this.loadStaticSe(se);
        for (const buffer of this._staticBuffers) {
            if (buffer.name === se.name) {
                buffer.stop();
                this.updateSeParameters(buffer, se);
                buffer.play(false);
                break;
            }
        }
    }
};

AudioManager.loadStaticSe = function(se) {
    if (se.name && !this.isStaticSe(se)) {
        const buffer = this.createBuffer("se/", se.name);
        this._staticBuffers.push(buffer);
    }
};

AudioManager.isStaticSe = function(se) {
    for (const buffer of this._staticBuffers) {
        if (buffer.name === se.name) {
            return true;
        }
    }
    return false;
};

AudioManager.stopAll = function() {
    this.stopMe();
    this.stopBgm();
    this.stopBgs();
    this.stopSe();
};

AudioManager.saveBgm = function() {
    if (this._currentBgm) {
        const bgm = this._currentBgm;
        return {
            name: bgm.name,
            volume: bgm.volume,
            pitch: bgm.pitch,
            pan: bgm.pan,
            pos: this._bgmBuffer ? this._bgmBuffer.seek() : 0
        };
    } else {
        return this.makeEmptyAudioObject();
    }
};

AudioManager.saveBgs = function() {
    if (this._currentBgs) {
        const bgs = this._currentBgs;
        return {
            name: bgs.name,
            volume: bgs.volume,
            pitch: bgs.pitch,
            pan: bgs.pan,
            pos: this._bgsBuffer ? this._bgsBuffer.seek() : 0
        };
    } else {
        return this.makeEmptyAudioObject();
    }
};

AudioManager.makeEmptyAudioObject = function() {
    return { name: "", volume: 0, pitch: 0 };
};

AudioManager.createBuffer = function(folder, name) {
    const ext = this.audioFileExt();
    const url = this._path + folder + Utils.encodeURI(name) + ext;
    const buffer = new WebAudio(url);
    buffer.name = name;
    buffer.frameCount = Graphics.frameCount;
    return buffer;
};

AudioManager.updateBufferParameters = function(buffer, configVolume, audio) {
    if (buffer && audio) {
        buffer.volume = (configVolume * (audio.volume || 0)) / 10000;
        buffer.pitch = (audio.pitch || 0) / 100;
        buffer.pan = (audio.pan || 0) / 100;
    }
};

AudioManager.audioFileExt = function() {
    return ".ogg";
};

AudioManager.checkErrors = function() {
    const buffers = [this._bgmBuffer, this._bgsBuffer, this._meBuffer];
    buffers.push(...this._seBuffers);
    buffers.push(...this._staticBuffers);
    for (const buffer of buffers) {
        if (buffer && buffer.isError()) {
            this.throwLoadError(buffer);
        }
    }
};

AudioManager.throwLoadError = function(webAudio) {
    const retry = webAudio.retry.bind(webAudio);
    throw ["LoadError", webAudio.url, retry];
};

//-----------------------------------------------------------------------------
// SoundManager
//
// The static class that plays sound effects defined in the database.

function SoundManager() {
    throw new Error("This is a static class");
}

SoundManager.preloadImportantSounds = function() {
    this.loadSystemSound(0);
    this.loadSystemSound(1);
    this.loadSystemSound(2);
    this.loadSystemSound(3);
};

SoundManager.loadSystemSound = function(n) {
    if ($dataSystem) {
        AudioManager.loadStaticSe($dataSystem.sounds[n]);
    }
};

SoundManager.playSystemSound = function(n) {
    if ($dataSystem) {
        AudioManager.playStaticSe($dataSystem.sounds[n]);
    }
};

SoundManager.playCursor = function() {
    this.playSystemSound(0);
};

SoundManager.playOk = function() {
    this.playSystemSound(1);
};

SoundManager.playCancel = function() {
    this.playSystemSound(2);
};

SoundManager.playBuzzer = function() {
    this.playSystemSound(3);
};

SoundManager.playEquip = function() {
    this.playSystemSound(4);
};

SoundManager.playSave = function() {
    this.playSystemSound(5);
};

SoundManager.playLoad = function() {
    this.playSystemSound(6);
};

SoundManager.playBattleStart = function() {
    this.playSystemSound(7);
};

SoundManager.playEscape = function() {
    this.playSystemSound(8);
};

SoundManager.playEnemyAttack = function() {
    this.playSystemSound(9);
};

SoundManager.playEnemyDamage = function() {
    this.playSystemSound(10);
};

SoundManager.playEnemyCollapse = function() {
    this.playSystemSound(11);
};

SoundManager.playBossCollapse1 = function() {
    this.playSystemSound(12);
};

SoundManager.playBossCollapse2 = function() {
    this.playSystemSound(13);
};

SoundManager.playActorDamage = function() {
    this.playSystemSound(14);
};

SoundManager.playActorCollapse = function() {
    this.playSystemSound(15);
};

SoundManager.playRecovery = function() {
    this.playSystemSound(16);
};

SoundManager.playMiss = function() {
    this.playSystemSound(17);
};

SoundManager.playEvasion = function() {
    this.playSystemSound(18);
};

SoundManager.playMagicEvasion = function() {
    this.playSystemSound(19);
};

SoundManager.playReflection = function() {
    this.playSystemSound(20);
};

SoundManager.playShop = function() {
    this.playSystemSound(21);
};

SoundManager.playUseItem = function() {
    this.playSystemSound(22);
};

SoundManager.playUseSkill = function() {
    this.playSystemSound(23);
};

//-----------------------------------------------------------------------------
// TextManager
//
// The static class that handles terms and messages.

function TextManager() {
    throw new Error("This is a static class");
}

TextManager.basic = function(basicId) {
    return $dataSystem.terms.basic[basicId] || "";
};

TextManager.param = function(paramId) {
    return $dataSystem.terms.params[paramId] || "";
};

TextManager.command = function(commandId) {
    return $dataSystem.terms.commands[commandId] || "";
};

TextManager.message = function(messageId) {
    return $dataSystem.terms.messages[messageId] || "";
};

TextManager.getter = function(method, param) {
    return {
        get: function() {
            return this[method](param);
        },
        configurable: true
    };
};

Object.defineProperty(TextManager, "currencyUnit", {
    get: function() {
        return $dataSystem.currencyUnit;
    },
    configurable: true
});

Object.defineProperties(TextManager, {
    level: TextManager.getter("basic", 0),
    levelA: TextManager.getter("basic", 1),
    hp: TextManager.getter("basic", 2),
    hpA: TextManager.getter("basic", 3),
    mp: TextManager.getter("basic", 4),
    mpA: TextManager.getter("basic", 5),
    tp: TextManager.getter("basic", 6),
    tpA: TextManager.getter("basic", 7),
    exp: TextManager.getter("basic", 8),
    expA: TextManager.getter("basic", 9),
    fight: TextManager.getter("command", 0),
    escape: TextManager.getter("command", 1),
    attack: TextManager.getter("command", 2),
    guard: TextManager.getter("command", 3),
    item: TextManager.getter("command", 4),
    skill: TextManager.getter("command", 5),
    equip: TextManager.getter("command", 6),
    status: TextManager.getter("command", 7),
    formation: TextManager.getter("command", 8),
    save: TextManager.getter("command", 9),
    gameEnd: TextManager.getter("command", 10),
    options: TextManager.getter("command", 11),
    weapon: TextManager.getter("command", 12),
    armor: TextManager.getter("command", 13),
    keyItem: TextManager.getter("command", 14),
    equip2: TextManager.getter("command", 15),
    optimize: TextManager.getter("command", 16),
    clear: TextManager.getter("command", 17),
    newGame: TextManager.getter("command", 18),
    continue_: TextManager.getter("command", 19),
    toTitle: TextManager.getter("command", 21),
    cancel: TextManager.getter("command", 22),
    buy: TextManager.getter("command", 24),
    sell: TextManager.getter("command", 25),
    alwaysDash: TextManager.getter("message", "alwaysDash"),
    commandRemember: TextManager.getter("message", "commandRemember"),
    touchUI: TextManager.getter("message", "touchUI"),
    bgmVolume: TextManager.getter("message", "bgmVolume"),
    bgsVolume: TextManager.getter("message", "bgsVolume"),
    meVolume: TextManager.getter("message", "meVolume"),
    seVolume: TextManager.getter("message", "seVolume"),
    possession: TextManager.getter("message", "possession"),
    expTotal: TextManager.getter("message", "expTotal"),
    expNext: TextManager.getter("message", "expNext"),
    saveMessage: TextManager.getter("message", "saveMessage"),
    loadMessage: TextManager.getter("message", "loadMessage"),
    file: TextManager.getter("message", "file"),
    autosave: TextManager.getter("message", "autosave"),
    partyName: TextManager.getter("message", "partyName"),
    emerge: TextManager.getter("message", "emerge"),
    preemptive: TextManager.getter("message", "preemptive"),
    surprise: TextManager.getter("message", "surprise"),
    escapeStart: TextManager.getter("message", "escapeStart"),
    escapeFailure: TextManager.getter("message", "escapeFailure"),
    victory: TextManager.getter("message", "victory"),
    defeat: TextManager.getter("message", "defeat"),
    obtainExp: TextManager.getter("message", "obtainExp"),
    obtainGold: TextManager.getter("message", "obtainGold"),
    obtainItem: TextManager.getter("message", "obtainItem"),
    levelUp: TextManager.getter("message", "levelUp"),
    obtainSkill: TextManager.getter("message", "obtainSkill"),
    useItem: TextManager.getter("message", "useItem"),
    criticalToEnemy: TextManager.getter("message", "criticalToEnemy"),
    criticalToActor: TextManager.getter("message", "criticalToActor"),
    actorDamage: TextManager.getter("message", "actorDamage"),
    actorRecovery: TextManager.getter("message", "actorRecovery"),
    actorGain: TextManager.getter("message", "actorGain"),
    actorLoss: TextManager.getter("message", "actorLoss"),
    actorDrain: TextManager.getter("message", "actorDrain"),
    actorNoDamage: TextManager.getter("message", "actorNoDamage"),
    actorNoHit: TextManager.getter("message", "actorNoHit"),
    enemyDamage: TextManager.getter("message", "enemyDamage"),
    enemyRecovery: TextManager.getter("message", "enemyRecovery"),
    enemyGain: TextManager.getter("message", "enemyGain"),
    enemyLoss: TextManager.getter("message", "enemyLoss"),
    enemyDrain: TextManager.getter("message", "enemyDrain"),
    enemyNoDamage: TextManager.getter("message", "enemyNoDamage"),
    enemyNoHit: TextManager.getter("message", "enemyNoHit"),
    evasion: TextManager.getter("message", "evasion"),
    magicEvasion: TextManager.getter("message", "magicEvasion"),
    magicReflection: TextManager.getter("message", "magicReflection"),
    counterAttack: TextManager.getter("message", "counterAttack"),
    substitute: TextManager.getter("message", "substitute"),
    buffAdd: TextManager.getter("message", "buffAdd"),
    debuffAdd: TextManager.getter("message", "debuffAdd"),
    buffRemove: TextManager.getter("message", "buffRemove"),
    actionFailure: TextManager.getter("message", "actionFailure")
});

//-----------------------------------------------------------------------------
// ColorManager
//
// The static class that handles the window colors.

function ColorManager() {
    throw new Error("This is a static class");
}

ColorManager.loadWindowskin = function() {
    this._windowskin = ImageManager.loadSystem("Window");
};

ColorManager.textColor = function(n) {
    const px = 96 + (n % 8) * 12 + 6;
    const py = 144 + Math.floor(n / 8) * 12 + 6;
    return this._windowskin.getPixel(px, py);
};

ColorManager.normalColor = function() {
    return this.textColor(0);
};

ColorManager.systemColor = function() {
    return this.textColor(16);
};

ColorManager.crisisColor = function() {
    return this.textColor(17);
};

ColorManager.deathColor = function() {
    return this.textColor(18);
};

ColorManager.gaugeBackColor = function() {
    return this.textColor(19);
};

ColorManager.hpGaugeColor1 = function() {
    return this.textColor(20);
};

ColorManager.hpGaugeColor2 = function() {
    return this.textColor(21);
};

ColorManager.mpGaugeColor1 = function() {
    return this.textColor(22);
};

ColorManager.mpGaugeColor2 = function() {
    return this.textColor(23);
};

ColorManager.mpCostColor = function() {
    return this.textColor(23);
};

ColorManager.powerUpColor = function() {
    return this.textColor(24);
};

ColorManager.powerDownColor = function() {
    return this.textColor(25);
};

ColorManager.ctGaugeColor1 = function() {
    return this.textColor(26);
};

ColorManager.ctGaugeColor2 = function() {
    return this.textColor(27);
};

ColorManager.tpGaugeColor1 = function() {
    return this.textColor(28);
};

ColorManager.tpGaugeColor2 = function() {
    return this.textColor(29);
};

ColorManager.tpCostColor = function() {
    return this.textColor(29);
};

ColorManager.pendingColor = function() {
    return this._windowskin.getPixel(120, 120);
};

ColorManager.hpColor = function(actor) {
    if (!actor) {
        return this.normalColor();
    } else if (actor.isDead()) {
        return this.deathColor();
    } else if (actor.isDying()) {
        return this.crisisColor();
    } else {
        return this.normalColor();
    }
};

ColorManager.mpColor = function(/*actor*/) {
    return this.normalColor();
};

ColorManager.tpColor = function(/*actor*/) {
    return this.normalColor();
};

ColorManager.paramchangeTextColor = function(change) {
    if (change > 0) {
        return this.powerUpColor();
    } else if (change < 0) {
        return this.powerDownColor();
    } else {
        return this.normalColor();
    }
};

ColorManager.damageColor = function(colorType) {
    switch (colorType) {
        case 0: // HP damage
            return "#ffffff";
        case 1: // HP recover
            return "#b9ffb5";
        case 2: // MP damage
            return "#ffff90";
        case 3: // MP recover
            return "#80b0ff";
        default:
            return "#808080";
    }
};

ColorManager.outlineColor = function() {
    return "rgba(0, 0, 0, 0.6)";
};

ColorManager.dimColor1 = function() {
    return "rgba(0, 0, 0, 0.6)";
};

ColorManager.dimColor2 = function() {
    return "rgba(0, 0, 0, 0)";
};

ColorManager.itemBackColor1 = function() {
    return "rgba(32, 32, 32, 0.5)";
};

ColorManager.itemBackColor2 = function() {
    return "rgba(0, 0, 0, 0.5)";
};

//-----------------------------------------------------------------------------
// SceneManager
//
// The static class that manages scene transitions.

function SceneManager() {
    throw new Error("This is a static class");
}

SceneManager._scene = null;
SceneManager._nextScene = null;
SceneManager._stack = [];
SceneManager._exiting = false;
SceneManager._previousScene = null;
SceneManager._previousClass = null;
SceneManager._backgroundBitmap = null;
SceneManager._smoothDeltaTime = 1;
SceneManager._elapsedTime = 0;

SceneManager.run = function(sceneClass) {
    try {
        this.initialize();
        this.goto(sceneClass);
        Graphics.startGameLoop();
    } catch (e) {
        this.catchException(e);
    }
};

SceneManager.initialize = function() {
    this.checkBrowser();
    this.checkPluginErrors();
    this.initGraphics();
    this.initAudio();
    this.initVideo();
    this.initInput();
    this.setupEventHandlers();
};

SceneManager.checkBrowser = function() {
    if (!Utils.canUseWebGL()) {
        throw new Error("Your browser does not support WebGL.");
    }
    if (!Utils.canUseWebAudioAPI()) {
        throw new Error("Your browser does not support Web Audio API.");
    }
    if (!Utils.canUseCssFontLoading()) {
        throw new Error("Your browser does not support CSS Font Loading.");
    }
    if (!Utils.canUseIndexedDB()) {
        throw new Error("Your browser does not support IndexedDB.");
    }
};

SceneManager.checkPluginErrors = function() {
    PluginManager.checkErrors();
};

SceneManager.initGraphics = function() {
    if (!Graphics.initialize()) {
        throw new Error("Failed to initialize graphics.");
    }
    Graphics.setTickHandler(this.update.bind(this));
};

SceneManager.initAudio = function() {
    WebAudio.initialize();
};

SceneManager.initVideo = function() {
    Video.initialize(Graphics.width, Graphics.height);
};

SceneManager.initInput = function() {
    Input.initialize();
    TouchInput.initialize();
};

SceneManager.setupEventHandlers = function() {
    window.addEventListener("error", this.onError.bind(this));
    window.addEventListener("unhandledrejection", this.onReject.bind(this));
    window.addEventListener("unload", this.onUnload.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));
};

SceneManager.update = function(deltaTime) {
    try {
        const n = this.determineRepeatNumber(deltaTime);
        for (let i = 0; i < n; i++) {
            this.updateMain();
        }
    } catch (e) {
        this.catchException(e);
    }
};

SceneManager.determineRepeatNumber = function(deltaTime) {
    // [Note] We consider environments where the refresh rate is higher than
    //   60Hz, but ignore sudden irregular deltaTime.
    this._smoothDeltaTime *= 0.8;
    this._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;
    if (this._smoothDeltaTime >= 0.9) {
        this._elapsedTime = 0;
        return Math.round(this._smoothDeltaTime);
    } else {
        this._elapsedTime += deltaTime;
        if (this._elapsedTime >= 1) {
            this._elapsedTime -= 1;
            return 1;
        }
        return 0;
    }
};

SceneManager.terminate = function() {
    window.close();
};

SceneManager.onError = function(event) {
    console.error(event.message);
    console.error(event.filename, event.lineno);
    try {
        this.stop();
        Graphics.printError("Error", event.message, event);
        AudioManager.stopAll();
    } catch (e) {
        //
    }
};

SceneManager.onReject = function(event) {
    // Catch uncaught exception in Promise
    event.message = event.reason;
    this.onError(event);
};

SceneManager.onUnload = function() {
    ImageManager.clear();
    EffectManager.clear();
    AudioManager.stopAll();
};

SceneManager.onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
            case 116: // F5
                this.reloadGame();
                break;
            case 119: // F8
                this.showDevTools();
                break;
        }
    }
};

SceneManager.reloadGame = function() {
    if (Utils.isNwjs()) {
        chrome.runtime.reload();
    }
};

SceneManager.showDevTools = function() {
    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
        nw.Window.get().showDevTools();
    }
};

SceneManager.catchException = function(e) {
    if (e instanceof Error) {
        this.catchNormalError(e);
    } else if (e instanceof Array && e[0] === "LoadError") {
        this.catchLoadError(e);
    } else {
        this.catchUnknownError(e);
    }
    this.stop();
};

SceneManager.catchNormalError = function(e) {
    Graphics.printError(e.name, e.message, e);
    AudioManager.stopAll();
    console.error(e.stack);
};

SceneManager.catchLoadError = function(e) {
    const url = e[1];
    const retry = e[2];
    Graphics.printError("Failed to load", url);
    if (retry) {
        Graphics.showRetryButton(() => {
            retry();
            SceneManager.resume();
        });
    } else {
        AudioManager.stopAll();
    }
};

SceneManager.catchUnknownError = function(e) {
    Graphics.printError("UnknownError", String(e));
    AudioManager.stopAll();
};

SceneManager.updateMain = function() {
    this.updateFrameCount();
    this.updateInputData();
    this.updateEffekseer();
    this.changeScene();
    this.updateScene();
};

SceneManager.updateFrameCount = function() {
    Graphics.frameCount++;
};

SceneManager.updateInputData = function() {
    Input.update();
    TouchInput.update();
};

SceneManager.updateEffekseer = function() {
    if (Graphics.effekseer) {
        Graphics.effekseer.update();
    }
};

SceneManager.changeScene = function() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
        if (this._scene) {
            this._scene.terminate();
            this.onSceneTerminate();
        }
        this._scene = this._nextScene;
        this._nextScene = null;
        if (this._scene) {
            this._scene.create();
            this.onSceneCreate();
        }
        if (this._exiting) {
            this.terminate();
        }
    }
};

SceneManager.updateScene = function() {
    if (this._scene) {
        if (this._scene.isStarted()) {
            if (this.isGameActive()) {
                this._scene.update();
            }
        } else if (this._scene.isReady()) {
            this.onBeforeSceneStart();
            this._scene.start();
            this.onSceneStart();
        }
    }
};

SceneManager.isGameActive = function() {
    // [Note] We use "window.top" to support an iframe.
    try {
        return window.top.document.hasFocus();
    } catch (e) {
        // SecurityError
        return true;
    }
};

SceneManager.onSceneTerminate = function() {
    this._previousScene = this._scene;
    this._previousClass = this._scene.constructor;
    Graphics.setStage(null);
};

SceneManager.onSceneCreate = function() {
    Graphics.startLoading();
};

SceneManager.onBeforeSceneStart = function() {
    if (this._previousScene) {
        this._previousScene.destroy();
        this._previousScene = null;
    }
    if (Graphics.effekseer) {
        Graphics.effekseer.stopAll();
    }
};

SceneManager.onSceneStart = function() {
    Graphics.endLoading();
    Graphics.setStage(this._scene);
};

SceneManager.isSceneChanging = function() {
    return this._exiting || !!this._nextScene;
};

SceneManager.isCurrentSceneBusy = function() {
    return this._scene && this._scene.isBusy();
};

SceneManager.isNextScene = function(sceneClass) {
    return this._nextScene && this._nextScene.constructor === sceneClass;
};

SceneManager.isPreviousScene = function(sceneClass) {
    return this._previousClass === sceneClass;
};

SceneManager.goto = function(sceneClass) {
    if (sceneClass) {
        this._nextScene = new sceneClass();
    }
    if (this._scene) {
        this._scene.stop();
    }
};

SceneManager.push = function(sceneClass) {
    this._stack.push(this._scene.constructor);
    this.goto(sceneClass);
};

SceneManager.pop = function() {
    if (this._stack.length > 0) {
        this.goto(this._stack.pop());
    } else {
        this.exit();
    }
};

SceneManager.exit = function() {
    this.goto(null);
    this._exiting = true;
};

SceneManager.clearStack = function() {
    this._stack = [];
};

SceneManager.stop = function() {
    Graphics.stopGameLoop();
};

SceneManager.prepareNextScene = function() {
    this._nextScene.prepare(...arguments);
};

SceneManager.snap = function() {
    return Bitmap.snap(this._scene);
};

SceneManager.snapForBackground = function() {
    if (this._backgroundBitmap) {
        this._backgroundBitmap.destroy();
    }
    this._backgroundBitmap = this.snap();
};

SceneManager.backgroundBitmap = function() {
    return this._backgroundBitmap;
};

SceneManager.resume = function() {
    TouchInput.update();
    Graphics.startGameLoop();
};

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

function BattleManager() {
    throw new Error("This is a static class");
}

BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
};

BattleManager.initMembers = function() {
    this._phase = "";
    this._inputting = false;
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._currentActor = null;
    this._actionForcedBattler = null;
    this._mapBgm = null;
    this._mapBgs = null;
    this._actionBattlers = [];
    this._subject = null;
    this._action = null;
    this._targets = [];
    this._logWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
    this._tpbNeedsPartyCommand = true;
};

BattleManager.isTpb = function() {
    return $dataSystem.battleSystem >= 1;
};

BattleManager.isActiveTpb = function() {
    return $dataSystem.battleSystem === 1;
};

BattleManager.isBattleTest = function() {
    return this._battleTest;
};

BattleManager.setBattleTest = function(battleTest) {
    this._battleTest = battleTest;
};

BattleManager.setEventCallback = function(callback) {
    this._eventCallback = callback;
};

BattleManager.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManager.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManager.onEncounter = function() {
    this._preemptive = Math.random() < this.ratePreemptive();
    this._surprise = Math.random() < this.rateSurprise() && !this._preemptive;
};

BattleManager.ratePreemptive = function() {
    return $gameParty.ratePreemptive($gameTroop.agility());
};

BattleManager.rateSurprise = function() {
    return $gameParty.rateSurprise($gameTroop.agility());
};

BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};

BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
};

BattleManager.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};

BattleManager.playDefeatMe = function() {
    AudioManager.playMe($gameSystem.defeatMe());
};

BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = (0.5 * $gameParty.agility()) / $gameTroop.agility();
};

BattleManager.update = function(timeActive) {
    if (!this.isBusy() && !this.updateEvent()) {
        this.updatePhase(timeActive);
    }
    if (this.isTpb()) {
        this.updateTpbInput();
    }
};

BattleManager.updatePhase = function(timeActive) {
    switch (this._phase) {
        case "start":
            this.updateStart();
            break;
        case "turn":
            this.updateTurn(timeActive);
            break;
        case "action":
            this.updateAction();
            break;
        case "turnEnd":
            this.updateTurnEnd();
            break;
        case "battleEnd":
            this.updateBattleEnd();
            break;
    }
};

BattleManager.updateEvent = function() {
    switch (this._phase) {
        case "start":
        case "turn":
        case "turnEnd":
            if (this.isActionForced()) {
                this.processForcedAction();
                return true;
            } else {
                return this.updateEventMain();
            }
    }
    return this.checkAbort();
};

BattleManager.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    return false;
};

BattleManager.isBusy = function() {
    return (
        $gameMessage.isBusy() ||
        this._spriteset.isBusy() ||
        this._logWindow.isBusy()
    );
};

BattleManager.updateTpbInput = function() {
    if (this._inputting) {
        this.checkTpbInputClose();
    } else {
        this.checkTpbInputOpen();
    }
};

BattleManager.checkTpbInputClose = function() {
    if (!this.isPartyTpbInputtable() || this.needsActorInputCancel()) {
        this.cancelActorInput();
        this._currentActor = null;
        this._inputting = false;
    }
};

BattleManager.checkTpbInputOpen = function() {
    if (this.isPartyTpbInputtable()) {
        if (this._tpbNeedsPartyCommand) {
            this._inputting = true;
            this._tpbNeedsPartyCommand = false;
        } else {
            this.selectNextCommand();
        }
    }
};

BattleManager.isPartyTpbInputtable = function() {
    return $gameParty.canInput() && this.isTpbMainPhase();
};

BattleManager.needsActorInputCancel = function() {
    return this._currentActor && !this._currentActor.canInput();
};

BattleManager.isTpbMainPhase = function() {
    return ["turn", "turnEnd", "action"].includes(this._phase);
};

BattleManager.isInputting = function() {
    return this._inputting;
};

BattleManager.isInTurn = function() {
    return this._phase === "turn";
};

BattleManager.isTurnEnd = function() {
    return this._phase === "turnEnd";
};

BattleManager.isAborting = function() {
    return this._phase === "aborting";
};

BattleManager.isBattleEnd = function() {
    return this._phase === "battleEnd";
};

BattleManager.canEscape = function() {
    return this._canEscape;
};

BattleManager.canLose = function() {
    return this._canLose;
};

BattleManager.isEscaped = function() {
    return this._escaped;
};

BattleManager.actor = function() {
    return this._currentActor;
};

BattleManager.startBattle = function() {
    this._phase = "start";
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart(this._preemptive);
    $gameTroop.onBattleStart(this._surprise);
    this.displayStartMessages();
};

BattleManager.displayStartMessages = function() {
    for (const name of $gameTroop.enemyNames()) {
        $gameMessage.add(TextManager.emerge.format(name));
    }
    if (this._preemptive) {
        $gameMessage.add(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        $gameMessage.add(TextManager.surprise.format($gameParty.name()));
    }
};

BattleManager.startInput = function() {
    this._phase = "input";
    this._inputting = true;
    $gameParty.makeActions();
    $gameTroop.makeActions();
    this._currentActor = null;
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};

BattleManager.inputtingAction = function() {
    return this._currentActor ? this._currentActor.inputtingAction() : null;
};

BattleManager.selectNextCommand = function() {
    if (this._currentActor) {
        if (this._currentActor.selectNextCommand()) {
            return;
        }
        this.finishActorInput();
    }
    this.selectNextActor();
};

BattleManager.selectNextActor = function() {
    this.changeCurrentActor(true);
    if (!this._currentActor) {
        if (this.isTpb()) {
            this.changeCurrentActor(true);
        } else {
            this.startTurn();
        }
    }
};

BattleManager.selectPreviousCommand = function() {
    if (this._currentActor) {
        if (this._currentActor.selectPreviousCommand()) {
            return;
        }
        this.cancelActorInput();
    }
    this.selectPreviousActor();
};

BattleManager.selectPreviousActor = function() {
    if (this.isTpb()) {
        this.changeCurrentActor(true);
        if (!this._currentActor) {
            this._inputting = $gameParty.canInput();
        }
    } else {
        this.changeCurrentActor(false);
    }
};

BattleManager.changeCurrentActor = function(forward) {
    const members = $gameParty.battleMembers();
    let actor = this._currentActor;
    for (;;) {
        const currentIndex = members.indexOf(actor);
        actor = members[currentIndex + (forward ? 1 : -1)];
        if (!actor || actor.canInput()) {
            break;
        }
    }
    this._currentActor = actor ? actor : null;
    this.startActorInput();
};

BattleManager.startActorInput = function() {
    if (this._currentActor) {
        this._currentActor.setActionState("inputting");
        this._inputting = true;
    }
};

BattleManager.finishActorInput = function() {
    if (this._currentActor) {
        if (this.isTpb()) {
            this._currentActor.startTpbCasting();
        }
        this._currentActor.setActionState("waiting");
    }
};

BattleManager.cancelActorInput = function() {
    if (this._currentActor) {
        this._currentActor.setActionState("undecided");
    }
};

BattleManager.updateStart = function() {
    if (this.isTpb()) {
        this._phase = "turn";
    } else {
        this.startInput();
    }
};

BattleManager.startTurn = function() {
    this._phase = "turn";
    $gameTroop.increaseTurn();
    $gameParty.requestMotionRefresh();
    if (!this.isTpb()) {
        this.makeActionOrders();
        this._logWindow.startTurn();
        this._inputting = false;
    }
};

BattleManager.updateTurn = function(timeActive) {
    $gameParty.requestMotionRefresh();
    if (this.isTpb() && timeActive) {
        this.updateTpb();
    }
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else if (!this.isTpb()) {
        this.endTurn();
    }
};

BattleManager.updateTpb = function() {
    $gameParty.updateTpb();
    $gameTroop.updateTpb();
    this.updateAllTpbBattlers();
    this.checkTpbTurnEnd();
};

BattleManager.updateAllTpbBattlers = function() {
    for (const battler of this.allBattleMembers()) {
        this.updateTpbBattler(battler);
    }
};

BattleManager.updateTpbBattler = function(battler) {
    if (battler.isTpbTurnEnd()) {
        battler.onTurnEnd();
        battler.startTpbTurn();
        this.displayBattlerStatus(battler, false);
    } else if (battler.isTpbReady()) {
        battler.startTpbAction();
        this._actionBattlers.push(battler);
    } else if (battler.isTpbTimeout()) {
        battler.onTpbTimeout();
        this.displayBattlerStatus(battler, true);
    }
};

BattleManager.checkTpbTurnEnd = function() {
    if ($gameTroop.isTpbTurnEnd()) {
        this.endTurn();
    }
};

BattleManager.processTurn = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject.removeCurrentAction();
    } else {
        this.endAction();
        this._subject = null;
    }
};

BattleManager.endBattlerActions = function(battler) {
    battler.setActionState(this.isTpb() ? "undecided" : "done");
    battler.onAllActionsEnd();
    battler.clearTpbChargeTime();
    this.displayBattlerStatus(battler, true);
};

BattleManager.endTurn = function() {
    this._phase = "turnEnd";
    this._preemptive = false;
    this._surprise = false;
    if (!this.isTpb()) {
        this.endAllBattlersTurn();
    }
};

BattleManager.endAllBattlersTurn = function() {
    for (const battler of this.allBattleMembers()) {
        battler.onTurnEnd();
        this.displayBattlerStatus(battler, false);
    }
};

BattleManager.displayBattlerStatus = function(battler, current) {
    this._logWindow.displayAutoAffectedStatus(battler);
    if (current) {
        this._logWindow.displayCurrentState(battler);
    }
    this._logWindow.displayRegeneration(battler);
};

BattleManager.updateTurnEnd = function() {
    if (this.isTpb()) {
        this.startTurn();
    } else {
        this.startInput();
    }
};

BattleManager.getNextSubject = function() {
    for (;;) {
        const battler = this._actionBattlers.shift();
        if (!battler) {
            return null;
        }
        if (battler.isBattleMember() && battler.isAlive()) {
            return battler;
        }
    }
};

BattleManager.allBattleMembers = function() {
    return $gameParty.battleMembers().concat($gameTroop.members());
};

BattleManager.makeActionOrders = function() {
    const battlers = [];
    if (!this._surprise) {
        battlers.push(...$gameParty.battleMembers());
    }
    if (!this._preemptive) {
        battlers.push(...$gameTroop.members());
    }
    for (const battler of battlers) {
        battler.makeSpeed();
    }
    battlers.sort((a, b) => b.speed() - a.speed());
    this._actionBattlers = battlers;
};

BattleManager.startAction = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    const targets = action.makeTargets();
    this._phase = "action";
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this._logWindow.startAction(subject, action, targets);
};

BattleManager.updateAction = function() {
    const target = this._targets.shift();
    if (target) {
        this.invokeAction(this._subject, target);
    } else {
        this.endAction();
    }
};

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = "turn";
    if (this._subject.numActions() === 0) {
        this.endBattlerActions(this._subject);
        this._subject = null;
    }
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push("pushBaseLine");
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push("popBaseLine");
};

BattleManager.invokeNormalAction = function(subject, target) {
    const realTarget = this.applySubstitute(target);
    this._action.apply(realTarget);
    this._logWindow.displayActionResults(subject, realTarget);
};

BattleManager.invokeCounterAttack = function(subject, target) {
    const action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.invokeMagicReflection = function(subject, target) {
    this._action._reflectionTarget = target;
    this._logWindow.displayReflection(target);
    this._action.apply(subject);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.applySubstitute = function(target) {
    if (this.checkSubstitute(target)) {
        const substitute = target.friendsUnit().substituteBattler();
        if (substitute && target !== substitute) {
            this._logWindow.displaySubstitute(substitute, target);
            return substitute;
        }
    }
    return target;
};

BattleManager.checkSubstitute = function(target) {
    return target.isDying() && !this._action.isCertainHit();
};

BattleManager.isActionForced = function() {
    return !!this._actionForcedBattler;
};

BattleManager.forceAction = function(battler) {
    this._actionForcedBattler = battler;
    this._actionBattlers.remove(battler);
};

BattleManager.processForcedAction = function() {
    if (this._actionForcedBattler) {
        if (this._subject) {
            this.endBattlerActions(this._subject);
        }
        this._subject = this._actionForcedBattler;
        this._actionForcedBattler = null;
        this.startAction();
        this._subject.removeCurrentAction();
    }
};

BattleManager.abort = function() {
    this._phase = "aborting";
};

BattleManager.checkBattleEnd = function() {
    if (this._phase) {
        if (this.checkAbort()) {
            return true;
        } else if ($gameParty.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroop.isAllDead()) {
            this.processVictory();
            return true;
        }
    }
    return false;
};

BattleManager.checkAbort = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
        this.processAbort();
    }
    return false;
};

BattleManager.processVictory = function() {
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
};

BattleManager.processEscape = function() {
    $gameParty.performEscape();
    SoundManager.playEscape();
    const success = this._preemptive || Math.random() < this._escapeRatio;
    if (success) {
        this.onEscapeSuccess();
    } else {
        this.onEscapeFailure();
    }
    return success;
};

BattleManager.onEscapeSuccess = function() {
    this.displayEscapeSuccessMessage();
    this._escaped = true;
    this.processAbort();
};

BattleManager.onEscapeFailure = function() {
    $gameParty.onEscapeFailure();
    this.displayEscapeFailureMessage();
    this._escapeRatio += 0.1;
    if (!this.isTpb()) {
        this.startTurn();
    }
};

BattleManager.processAbort = function() {
    $gameParty.removeBattleStates();
    this._logWindow.clear();
    this.replayBgmAndBgs();
    this.endBattle(1);
};

BattleManager.processDefeat = function() {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManager.endBattle = function(result) {
    this._phase = "battleEnd";
    this.cancelActorInput();
    this._inputting = false;
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
    } else if (this._escaped) {
        $gameSystem.onBattleEscape();
    }
};

BattleManager.updateBattleEnd = function() {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if (!this._escaped && $gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = "";
};

BattleManager.makeRewards = function() {
    this._rewards = {
        gold: $gameTroop.goldTotal(),
        exp: $gameTroop.expTotal(),
        items: $gameTroop.makeDropItems()
    };
};

BattleManager.displayVictoryMessage = function() {
    $gameMessage.add(TextManager.victory.format($gameParty.name()));
};

BattleManager.displayDefeatMessage = function() {
    $gameMessage.add(TextManager.defeat.format($gameParty.name()));
};

BattleManager.displayEscapeSuccessMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
};

BattleManager.displayEscapeFailureMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
    $gameMessage.add("\\." + TextManager.escapeFailure);
};

BattleManager.displayRewards = function() {
    this.displayExp();
    this.displayGold();
    this.displayDropItems();
};

BattleManager.displayExp = function() {
    const exp = this._rewards.exp;
    if (exp > 0) {
        const text = TextManager.obtainExp.format(exp, TextManager.exp);
        $gameMessage.add("\\." + text);
    }
};

BattleManager.displayGold = function() {
    const gold = this._rewards.gold;
    if (gold > 0) {
        $gameMessage.add("\\." + TextManager.obtainGold.format(gold));
    }
};

BattleManager.displayDropItems = function() {
    const items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        for (const item of items) {
            $gameMessage.add(TextManager.obtainItem.format(item.name));
        }
    }
};

BattleManager.gainRewards = function() {
    this.gainExp();
    this.gainGold();
    this.gainDropItems();
};

BattleManager.gainExp = function() {
    const exp = this._rewards.exp;
    for (const actor of $gameParty.allMembers()) {
        actor.gainExp(exp);
    }
};

BattleManager.gainGold = function() {
    $gameParty.gainGold(this._rewards.gold);
};

BattleManager.gainDropItems = function() {
    const items = this._rewards.items;
    for (const item of items) {
        $gameParty.gainItem(item, 1);
    }
};

//-----------------------------------------------------------------------------
// PluginManager
//
// The static class that manages the plugins.

function PluginManager() {
    throw new Error("This is a static class");
}

PluginManager._scripts = [];
PluginManager._errorUrls = [];
PluginManager._parameters = {};
PluginManager._commands = {};

PluginManager.setup = function(plugins) {
    for (const plugin of plugins) {
        if (plugin.status && !this._scripts.includes(plugin.name)) {
            this.setParameters(plugin.name, plugin.parameters);
            this.loadScript(plugin.name);
            this._scripts.push(plugin.name);
        }
    }
};

PluginManager.parameters = function(name) {
    return this._parameters[name.toLowerCase()] || {};
};

PluginManager.setParameters = function(name, parameters) {
    this._parameters[name.toLowerCase()] = parameters;
};

PluginManager.loadScript = function(filename) {
    const url = this.makeUrl(filename);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.async = false;
    script.defer = true;
    script.onerror = this.onError.bind(this);
    script._url = url;
    document.body.appendChild(script);
};

PluginManager.onError = function(e) {
    this._errorUrls.push(e.target._url);
};

PluginManager.makeUrl = function(filename) {
    return "js/plugins/" + Utils.encodeURI(filename) + ".js";
};

PluginManager.checkErrors = function() {
    const url = this._errorUrls.shift();
    if (url) {
        this.throwLoadError(url);
    }
};

PluginManager.throwLoadError = function(url) {
    throw new Error("Failed to load: " + url);
};

PluginManager.registerCommand = function(pluginName, commandName, func) {
    const key = pluginName + ":" + commandName;
    this._commands[key] = func;
};

PluginManager.callCommand = function(self, pluginName, commandName, args) {
    const key = pluginName + ":" + commandName;
    const func = this._commands[key];
    if (typeof func === "function") {
        func.bind(self)(args);
    }
};

//-----------------------------------------------------------------------------
