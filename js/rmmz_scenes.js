//=============================================================================
// rmmz_scenes.js v1.0.0
//=============================================================================

//-----------------------------------------------------------------------------
// Scene_Base
//
// The superclass of all scenes within the game.

function Scene_Base() {
    this.initialize(...arguments);
}

Scene_Base.prototype = Object.create(Stage.prototype);
Scene_Base.prototype.constructor = Scene_Base;

Scene_Base.prototype.initialize = function() {
    Stage.prototype.initialize.call(this);
    this._started = false;
    this._active = false;
    this._fadeSign = 0;
    this._fadeDuration = 0;
    this._fadeWhite = 0;
    this._fadeOpacity = 0;
    this.createColorFilter();
};

Scene_Base.prototype.create = function() {
    //
};

Scene_Base.prototype.isActive = function() {
    return this._active;
};

Scene_Base.prototype.isReady = function() {
    return (
        ImageManager.isReady() &&
        EffectManager.isReady() &&
        FontManager.isReady()
    );
};

Scene_Base.prototype.start = function() {
    this._started = true;
    this._active = true;
};

Scene_Base.prototype.update = function() {
    this.updateFade();
    this.updateColorFilter();
    this.updateChildren();
    AudioManager.checkErrors();
};

Scene_Base.prototype.stop = function() {
    this._active = false;
};

Scene_Base.prototype.isStarted = function() {
    return this._started;
};

Scene_Base.prototype.isBusy = function() {
    return this.isFading();
};

Scene_Base.prototype.isFading = function() {
    return this._fadeDuration > 0;
};

Scene_Base.prototype.terminate = function() {
    //
};

Scene_Base.prototype.createWindowLayer = function() {
    this._windowLayer = new WindowLayer();
    this._windowLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
    this._windowLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
    this.addChild(this._windowLayer);
};

Scene_Base.prototype.addWindow = function(window) {
    this._windowLayer.addChild(window);
};

Scene_Base.prototype.startFadeIn = function(duration, white) {
    this._fadeSign = 1;
    this._fadeDuration = duration || 30;
    this._fadeWhite = white;
    this._fadeOpacity = 255;
    this.updateColorFilter();
};

Scene_Base.prototype.startFadeOut = function(duration, white) {
    this._fadeSign = -1;
    this._fadeDuration = duration || 30;
    this._fadeWhite = white;
    this._fadeOpacity = 0;
    this.updateColorFilter();
};

Scene_Base.prototype.createColorFilter = function() {
    this._colorFilter = new ColorFilter();
    this.filters = [this._colorFilter];
};

Scene_Base.prototype.updateColorFilter = function() {
    const c = this._fadeWhite ? 255 : 0;
    const blendColor = [c, c, c, this._fadeOpacity];
    this._colorFilter.setBlendColor(blendColor);
};

Scene_Base.prototype.updateFade = function() {
    if (this._fadeDuration > 0) {
        const d = this._fadeDuration;
        if (this._fadeSign > 0) {
            this._fadeOpacity -= this._fadeOpacity / d;
        } else {
            this._fadeOpacity += (255 - this._fadeOpacity) / d;
        }
        this._fadeDuration--;
    }
};

Scene_Base.prototype.updateChildren = function() {
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};

Scene_Base.prototype.popScene = function() {
    SceneManager.pop();
};

Scene_Base.prototype.checkGameover = function() {
    if ($gameParty.isAllDead()) {
        SceneManager.goto(Scene_Gameover);
    }
};

Scene_Base.prototype.fadeOutAll = function() {
    const time = this.slowFadeSpeed() / 60;
    AudioManager.fadeOutBgm(time);
    AudioManager.fadeOutBgs(time);
    AudioManager.fadeOutMe(time);
    this.startFadeOut(this.slowFadeSpeed());
};

Scene_Base.prototype.fadeSpeed = function() {
    return 24;
};

Scene_Base.prototype.slowFadeSpeed = function() {
    return this.fadeSpeed() * 2;
};

Scene_Base.prototype.scaleSprite = function(sprite) {
    const ratioX = Graphics.width / sprite.bitmap.width;
    const ratioY = Graphics.height / sprite.bitmap.height;
    const scale = Math.max(ratioX, ratioY, 1.0);
    sprite.scale.x = scale;
    sprite.scale.y = scale;
};

Scene_Base.prototype.centerSprite = function(sprite) {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
};

Scene_Base.prototype.isBottomHelpMode = function() {
    return true;
};

Scene_Base.prototype.isBottomButtonMode = function() {
    return false;
};

Scene_Base.prototype.isRightInputMode = function() {
    return true;
};

Scene_Base.prototype.mainCommandWidth = function() {
    return 240;
};

Scene_Base.prototype.buttonAreaTop = function() {
    if (this.isBottomButtonMode()) {
        return Graphics.boxHeight - this.buttonAreaHeight();
    } else {
        return 0;
    }
};

Scene_Base.prototype.buttonAreaBottom = function() {
    return this.buttonAreaTop() + this.buttonAreaHeight();
};

Scene_Base.prototype.buttonAreaHeight = function() {
    return 52;
};

Scene_Base.prototype.buttonY = function() {
    const offsetY = Math.floor((this.buttonAreaHeight() - 48) / 2);
    return this.buttonAreaTop() + offsetY;
};

Scene_Base.prototype.calcWindowHeight = function(numLines, selectable) {
    if (selectable) {
        return Window_Selectable.prototype.fittingHeight(numLines);
    } else {
        return Window_Base.prototype.fittingHeight(numLines);
    }
};

Scene_Base.prototype.requestAutosave = function() {
    if (this.isAutosaveEnabled()) {
        this.executeAutosave();
    }
};

Scene_Base.prototype.isAutosaveEnabled = function() {
    return (
        !DataManager.isBattleTest() &&
        !DataManager.isEventTest() &&
        $gameSystem.isAutosaveEnabled() &&
        $gameSystem.isSaveEnabled()
    );
};

Scene_Base.prototype.executeAutosave = function() {
    $gameSystem.onBeforeSave();
    DataManager.saveGame(0)
        .then(() => this.onAutosaveSuccess())
        .catch(() => this.onAutosaveFailure());
};

Scene_Base.prototype.onAutosaveSuccess = function() {
    //
};

Scene_Base.prototype.onAutosaveFailure = function() {
    //
};

//-----------------------------------------------------------------------------
// Scene_Boot
//
// The scene class for initializing the entire game.

function Scene_Boot() {
    this.initialize(...arguments);
}

Scene_Boot.prototype = Object.create(Scene_Base.prototype);
Scene_Boot.prototype.constructor = Scene_Boot;

Scene_Boot.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._databaseLoaded = false;
};

Scene_Boot.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    DataManager.loadDatabase();
    StorageManager.updateForageKeys();
};

Scene_Boot.prototype.isReady = function() {
    if (!this._databaseLoaded) {
        if (
            DataManager.isDatabaseLoaded() &&
            StorageManager.forageKeysUpdated()
        ) {
            this._databaseLoaded = true;
            this.onDatabaseLoaded();
        }
        return false;
    }
    return Scene_Base.prototype.isReady.call(this) && this.isPlayerDataLoaded();
};

Scene_Boot.prototype.onDatabaseLoaded = function() {
    this.setEncryptionInfo();
    this.loadSystemImages();
    this.loadPlayerData();
    this.loadGameFonts();
};

Scene_Boot.prototype.setEncryptionInfo = function() {
    const hasImages = $dataSystem.hasEncryptedImages;
    const hasAudio = $dataSystem.hasEncryptedAudio;
    const key = $dataSystem.encryptionKey;
    Utils.setEncryptionInfo(hasImages, hasAudio, key);
};

Scene_Boot.prototype.loadSystemImages = function() {
    ColorManager.loadWindowskin();
    ImageManager.loadSystem("IconSet");
};

Scene_Boot.prototype.loadPlayerData = function() {
    DataManager.loadGlobalInfo();
    ConfigManager.load();
};

Scene_Boot.prototype.loadGameFonts = function() {
    const advanced = $dataSystem.advanced;
    FontManager.load("rmmz-mainfont", advanced.mainFontFilename);
    FontManager.load("rmmz-numberfont", advanced.numberFontFilename);
};

Scene_Boot.prototype.isPlayerDataLoaded = function() {
    return DataManager.isGlobalInfoLoaded() && ConfigManager.isLoaded();
};

Scene_Boot.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
    } else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
    } else {
        this.startNormalGame();
    }
    this.resizeScreen();
    this.updateDocumentTitle();
};

Scene_Boot.prototype.startNormalGame = function() {
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Title);
    Window_TitleCommand.initCommandPosition();
};

Scene_Boot.prototype.resizeScreen = function() {
    const screenWidth = $dataSystem.advanced.screenWidth;
    const screenHeight = $dataSystem.advanced.screenHeight;
    Graphics.resize(screenWidth, screenHeight);
    this.adjustBoxSize();
    this.adjustWindow();
};

Scene_Boot.prototype.adjustBoxSize = function() {
    const uiAreaWidth = $dataSystem.advanced.uiAreaWidth;
    const uiAreaHeight = $dataSystem.advanced.uiAreaHeight;
    const boxMargin = 4;
    Graphics.boxWidth = uiAreaWidth - boxMargin * 2;
    Graphics.boxHeight = uiAreaHeight - boxMargin * 2;
};

Scene_Boot.prototype.adjustWindow = function() {
    if (Utils.isNwjs()) {
        const xDelta = Graphics.width - window.innerWidth;
        const yDelta = Graphics.height - window.innerHeight;
        window.moveBy(-xDelta / 2, -yDelta / 2);
        window.resizeBy(xDelta, yDelta);
    }
};

Scene_Boot.prototype.updateDocumentTitle = function() {
    document.title = $dataSystem.gameTitle;
};

Scene_Boot.prototype.checkPlayerLocation = function() {
    if ($dataSystem.startMapId === 0) {
        throw new Error("Player's starting position is not set");
    }
};

//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

function Scene_Title() {
    this.initialize(...arguments);
}

Scene_Title.prototype = Object.create(Scene_Base.prototype);
Scene_Title.prototype.constructor = Scene_Title;

Scene_Title.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Title.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createCommandWindow();
};

Scene_Title.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    this.adjustBackground();
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Title.prototype.update = function() {
    if (!this.isBusy()) {
        this._commandWindow.open();
    }
    Scene_Base.prototype.update.call(this);
};

Scene_Title.prototype.isBusy = function() {
    return (
        this._commandWindow.isClosing() ||
        Scene_Base.prototype.isBusy.call(this)
    );
};

Scene_Title.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    SceneManager.snapForBackground();
    if (this._gameTitleSprite) {
        this._gameTitleSprite.bitmap.destroy();
    }
};

Scene_Title.prototype.createBackground = function() {
    this._backSprite1 = new Sprite(
        ImageManager.loadTitle1($dataSystem.title1Name)
    );
    this._backSprite2 = new Sprite(
        ImageManager.loadTitle2($dataSystem.title2Name)
    );
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
};

Scene_Title.prototype.createForeground = function() {
    this._gameTitleSprite = new Sprite(
        new Bitmap(Graphics.width, Graphics.height)
    );
    this.addChild(this._gameTitleSprite);
    if ($dataSystem.optDrawTitle) {
        this.drawGameTitle();
    }
};

Scene_Title.prototype.drawGameTitle = function() {
    const x = 20;
    const y = Graphics.height / 4;
    const maxWidth = Graphics.width - x * 2;
    const text = $dataSystem.gameTitle;
    const bitmap = this._gameTitleSprite.bitmap;
    bitmap.fontFace = $gameSystem.mainFontFace();
    bitmap.outlineColor = "black";
    bitmap.outlineWidth = 8;
    bitmap.fontSize = 72;
    bitmap.drawText(text, x, y, maxWidth, 48, "center");
};

Scene_Title.prototype.adjustBackground = function() {
    this.scaleSprite(this._backSprite1);
    this.scaleSprite(this._backSprite2);
    this.centerSprite(this._backSprite1);
    this.centerSprite(this._backSprite2);
};

Scene_Title.prototype.createCommandWindow = function() {
    const background = $dataSystem.titleCommandWindow.background;
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_TitleCommand(rect);
    this._commandWindow.setBackgroundType(background);
    this._commandWindow.setHandler("newGame", this.commandNewGame.bind(this));
    this._commandWindow.setHandler("continue", this.commandContinue.bind(this));
    this._commandWindow.setHandler("options", this.commandOptions.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Title.prototype.commandWindowRect = function() {
    const offsetX = $dataSystem.titleCommandWindow.offsetX;
    const offsetY = $dataSystem.titleCommandWindow.offsetY;
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(3, true);
    const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
    const wy = Graphics.boxHeight - wh - 96 + offsetY;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Title.prototype.commandNewGame = function() {
    DataManager.setupNewGame();
    this._commandWindow.close();
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
};

Scene_Title.prototype.commandContinue = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Load);
};

Scene_Title.prototype.commandOptions = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Options);
};

Scene_Title.prototype.playTitleMusic = function() {
    AudioManager.playBgm($dataSystem.titleBgm);
    AudioManager.stopBgs();
    AudioManager.stopMe();
};

//-----------------------------------------------------------------------------
// Scene_Message
//
// The superclass of Scene_Map and Scene_Battle.

function Scene_Message() {
    this.initialize(...arguments);
}

Scene_Message.prototype = Object.create(Scene_Base.prototype);
Scene_Message.prototype.constructor = Scene_Message;

Scene_Message.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Message.prototype.isMessageWindowClosing = function() {
    return this._messageWindow.isClosing();
};

Scene_Message.prototype.createAllWindows = function() {
    this.createMessageWindow();
    this.createScrollTextWindow();
    this.createGoldWindow();
    this.createNameBoxWindow();
    this.createChoiceListWindow();
    this.createNumberInputWindow();
    this.createEventItemWindow();
    this.associateWindows();
};

Scene_Message.prototype.createMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._messageWindow = new Window_Message(rect);
    this.addWindow(this._messageWindow);
};

Scene_Message.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createScrollTextWindow = function() {
    const rect = this.scrollTextWindowRect();
    this._scrollTextWindow = new Window_ScrollText(rect);
    this.addWindow(this._scrollTextWindow);
};

Scene_Message.prototype.scrollTextWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this._goldWindow.openness = 0;
    this.addWindow(this._goldWindow);
};

Scene_Message.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth - ww;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createNameBoxWindow = function() {
    this._nameBoxWindow = new Window_NameBox();
    this.addWindow(this._nameBoxWindow);
};

Scene_Message.prototype.createChoiceListWindow = function() {
    this._choiceListWindow = new Window_ChoiceList();
    this.addWindow(this._choiceListWindow);
};

Scene_Message.prototype.createNumberInputWindow = function() {
    this._numberInputWindow = new Window_NumberInput();
    this.addWindow(this._numberInputWindow);
};

Scene_Message.prototype.createEventItemWindow = function() {
    const rect = this.eventItemWindowRect();
    this._eventItemWindow = new Window_EventItem(rect);
    this.addWindow(this._eventItemWindow);
};

Scene_Message.prototype.eventItemWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.associateWindows = function() {
    const messageWindow = this._messageWindow;
    messageWindow.setGoldWindow(this._goldWindow);
    messageWindow.setNameBoxWindow(this._nameBoxWindow);
    messageWindow.setChoiceListWindow(this._choiceListWindow);
    messageWindow.setNumberInputWindow(this._numberInputWindow);
    messageWindow.setEventItemWindow(this._eventItemWindow);
    this._nameBoxWindow.setMessageWindow(messageWindow);
    this._choiceListWindow.setMessageWindow(messageWindow);
    this._numberInputWindow.setMessageWindow(messageWindow);
    this._eventItemWindow.setMessageWindow(messageWindow);
};

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

function Scene_Map() {
    this.initialize(...arguments);
}

Scene_Map.prototype = Object.create(Scene_Message.prototype);
Scene_Map.prototype.constructor = Scene_Map;

Scene_Map.prototype.initialize = function() {
    Scene_Message.prototype.initialize.call(this);
    this._waitCount = 0;
    this._encounterEffectDuration = 0;
    this._mapLoaded = false;
    this._touchCount = 0;
    this._menuEnabled = false;
};

Scene_Map.prototype.create = function() {
    Scene_Message.prototype.create.call(this);
    this._transfer = $gamePlayer.isTransferring();
    this._lastMapWasNull = !$dataMap;
    if (this._transfer) {
        DataManager.loadMapData($gamePlayer.newMapId());
        this.onTransfer();
    } else if (!$dataMap || $dataMap.id !== $gameMap.mapId()) {
        DataManager.loadMapData($gameMap.mapId());
    }
};

Scene_Map.prototype.isReady = function() {
    if (!this._mapLoaded && DataManager.isMapLoaded()) {
        this.onMapLoaded();
        this._mapLoaded = true;
    }
    return this._mapLoaded && Scene_Message.prototype.isReady.call(this);
};

Scene_Map.prototype.onMapLoaded = function() {
    if (this._transfer) {
        $gamePlayer.performTransfer();
    }
    this.createDisplayObjects();
};

Scene_Map.prototype.onTransfer = function() {
    ImageManager.clear();
    EffectManager.clear();
};

Scene_Map.prototype.start = function() {
    Scene_Message.prototype.start.call(this);
    SceneManager.clearStack();
    if (this._transfer) {
        this.fadeInForTransfer();
        this.onTransferEnd();
    } else if (this.needsFadeIn()) {
        this.startFadeIn(this.fadeSpeed(), false);
    }
    this.menuCalling = false;
};

Scene_Map.prototype.onTransferEnd = function() {
    this._mapNameWindow.open();
    $gameMap.autoplay();
    if (this.shouldAutosave()) {
        this.requestAutosave();
    }
};

Scene_Map.prototype.shouldAutosave = function() {
    return !this._lastMapWasNull;
};

Scene_Map.prototype.update = function() {
    Scene_Message.prototype.update.call(this);
    this.updateDestination();
    this.updateMenuButton();
    this.updateMapNameWindow();
    this.updateMainMultiply();
    if (this.isSceneChangeOk()) {
        this.updateScene();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.updateEncounterEffect();
    }
    this.updateWaitCount();
};

Scene_Map.prototype.updateMainMultiply = function() {
    if (this.isFastForward()) {
        this.updateMain();
    }
    this.updateMain();
};

Scene_Map.prototype.updateMain = function() {
    $gameMap.update(this.isActive());
    $gamePlayer.update(this.isPlayerActive());
    $gameTimer.update(this.isActive());
    $gameScreen.update();
};

Scene_Map.prototype.isPlayerActive = function() {
    return this.isActive() && !this.isFading();
};

Scene_Map.prototype.isFastForward = function() {
    return (
        $gameMap.isEventRunning() &&
        !SceneManager.isSceneChanging() &&
        (Input.isLongPressed("ok") || TouchInput.isLongPressed())
    );
};

Scene_Map.prototype.stop = function() {
    Scene_Message.prototype.stop.call(this);
    $gamePlayer.straighten();
    this._mapNameWindow.close();
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else if (SceneManager.isNextScene(Scene_Map)) {
        this.fadeOutForTransfer();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.launchBattle();
    }
};

Scene_Map.prototype.isBusy = function() {
    return (
        this.isMessageWindowClosing() ||
        this._waitCount > 0 ||
        this._encounterEffectDuration > 0 ||
        Scene_Message.prototype.isBusy.call(this)
    );
};

Scene_Map.prototype.terminate = function() {
    Scene_Message.prototype.terminate.call(this);
    if (!SceneManager.isNextScene(Scene_Battle)) {
        this._spriteset.update();
        this._mapNameWindow.hide();
        this.hideMenuButton();
        SceneManager.snapForBackground();
    }
    $gameScreen.clearZoom();
};

Scene_Map.prototype.needsFadeIn = function() {
    return (
        SceneManager.isPreviousScene(Scene_Battle) ||
        SceneManager.isPreviousScene(Scene_Load)
    );
};

Scene_Map.prototype.needsSlowFadeOut = function() {
    return (
        SceneManager.isNextScene(Scene_Title) ||
        SceneManager.isNextScene(Scene_Gameover)
    );
};

Scene_Map.prototype.updateWaitCount = function() {
    if (this._waitCount > 0) {
        this._waitCount--;
        return true;
    }
    return false;
};

Scene_Map.prototype.updateDestination = function() {
    if (this.isMapTouchOk()) {
        this.processMapTouch();
    } else {
        $gameTemp.clearDestination();
        this._touchCount = 0;
    }
};

Scene_Map.prototype.updateMenuButton = function() {
    if (this._menuButton) {
        const menuEnabled = this.isMenuEnabled();
        if (menuEnabled === this._menuEnabled) {
            this._menuButton.visible = this._menuEnabled;
        } else {
            this._menuEnabled = menuEnabled;
        }
    }
};

Scene_Map.prototype.hideMenuButton = function() {
    if (this._menuButton) {
        this._menuButton.visible = false;
        this._menuEnabled = false;
    }
};

Scene_Map.prototype.updateMapNameWindow = function() {
    if ($gameMessage.isBusy()) {
        this._mapNameWindow.close();
    }
};

Scene_Map.prototype.isMenuEnabled = function() {
    return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning();
};

Scene_Map.prototype.isMapTouchOk = function() {
    return this.isActive() && $gamePlayer.canMove();
};

Scene_Map.prototype.processMapTouch = function() {
    if (TouchInput.isTriggered() || this._touchCount > 0) {
        if (TouchInput.isPressed() && !this.isAnyButtonPressed()) {
            if (this._touchCount === 0 || this._touchCount >= 15) {
                this.onMapTouch();
            }
            this._touchCount++;
        } else {
            this._touchCount = 0;
        }
    }
};

Scene_Map.prototype.isAnyButtonPressed = function() {
    return this._menuButton && this._menuButton.isPressed();
};

Scene_Map.prototype.onMapTouch = function() {
    const x = $gameMap.canvasToMapX(TouchInput.x);
    const y = $gameMap.canvasToMapY(TouchInput.y);
    $gameTemp.setDestination(x, y);
};

Scene_Map.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

Scene_Map.prototype.updateScene = function() {
    this.checkGameover();
    if (!SceneManager.isSceneChanging()) {
        this.updateTransferPlayer();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateEncounter();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallMenu();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallDebug();
    }
};

Scene_Map.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    this.createButtons();
};

Scene_Map.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Map();
    this.addChild(this._spriteset);
    this._spriteset.update();
};

Scene_Map.prototype.createAllWindows = function() {
    this.createMapNameWindow();
    Scene_Message.prototype.createAllWindows.call(this);
};

Scene_Map.prototype.createMapNameWindow = function() {
    const rect = this.mapNameWindowRect();
    this._mapNameWindow = new Window_MapName(rect);
    this.addWindow(this._mapNameWindow);
};

Scene_Map.prototype.mapNameWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = 360;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.createButtons = function() {
    if (ConfigManager.touchUI) {
        this.createMenuButton();
    }
};

Scene_Map.prototype.createMenuButton = function() {
    this._menuButton = new Sprite_Button("menu");
    this._menuButton.x = Graphics.boxWidth - this._menuButton.width - 4;
    this._menuButton.y = this.buttonY();
    this._menuButton.visible = false;
    this.addWindow(this._menuButton);
};

Scene_Map.prototype.updateTransferPlayer = function() {
    if ($gamePlayer.isTransferring()) {
        SceneManager.goto(Scene_Map);
    }
};

Scene_Map.prototype.updateEncounter = function() {
    if ($gamePlayer.executeEncounter()) {
        SceneManager.push(Scene_Battle);
    }
};

Scene_Map.prototype.updateCallMenu = function() {
    if (this.isMenuEnabled()) {
        if (this.isMenuCalled()) {
            this.menuCalling = true;
        }
        if (this.menuCalling && !$gamePlayer.isMoving()) {
            this.callMenu();
        }
    } else {
        this.menuCalling = false;
    }
};

Scene_Map.prototype.isMenuCalled = function() {
    return Input.isTriggered("menu") || TouchInput.isCancelled();
};

Scene_Map.prototype.callMenu = function() {
    SoundManager.playOk();
    SceneManager.push(Scene_Menu);
    Window_MenuCommand.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow.hide();
    this._waitCount = 2;
};

Scene_Map.prototype.updateCallDebug = function() {
    if (this.isDebugCalled()) {
        SceneManager.push(Scene_Debug);
    }
};

Scene_Map.prototype.isDebugCalled = function() {
    return Input.isTriggered("debug") && $gameTemp.isPlaytest();
};

Scene_Map.prototype.fadeInForTransfer = function() {
    const fadeType = $gamePlayer.fadeType();
    switch (fadeType) {
        case 0:
        case 1:
            this.startFadeIn(this.fadeSpeed(), fadeType === 1);
            break;
    }
};

Scene_Map.prototype.fadeOutForTransfer = function() {
    const fadeType = $gamePlayer.fadeType();
    switch (fadeType) {
        case 0:
        case 1:
            this.startFadeOut(this.fadeSpeed(), fadeType === 1);
            break;
    }
};

Scene_Map.prototype.launchBattle = function() {
    BattleManager.saveBgmAndBgs();
    this.stopAudioOnBattleStart();
    SoundManager.playBattleStart();
    this.startEncounterEffect();
    this._mapNameWindow.hide();
};

Scene_Map.prototype.stopAudioOnBattleStart = function() {
    if (!AudioManager.isCurrentBgm($gameSystem.battleBgm())) {
        AudioManager.stopBgm();
    }
    AudioManager.stopBgs();
    AudioManager.stopMe();
    AudioManager.stopSe();
};

Scene_Map.prototype.startEncounterEffect = function() {
    this._spriteset.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
};

Scene_Map.prototype.updateEncounterEffect = function() {
    if (this._encounterEffectDuration > 0) {
        this._encounterEffectDuration--;
        const speed = this.encounterEffectSpeed();
        const n = speed - this._encounterEffectDuration;
        const p = n / speed;
        const q = ((p - 1) * 20 * p + 5) * p + 1;
        const zoomX = $gamePlayer.screenX();
        const zoomY = $gamePlayer.screenY() - 24;
        if (n === 2) {
            $gameScreen.setZoom(zoomX, zoomY, 1);
            this.snapForBattleBackground();
            this.startFlashForEncounter(speed / 2);
        }
        $gameScreen.setZoom(zoomX, zoomY, q);
        if (n === Math.floor(speed / 6)) {
            this.startFlashForEncounter(speed / 2);
        }
        if (n === Math.floor(speed / 2)) {
            BattleManager.playBattleBgm();
            this.startFadeOut(this.fadeSpeed());
        }
    }
};

Scene_Map.prototype.snapForBattleBackground = function() {
    this._windowLayer.visible = false;
    SceneManager.snapForBackground();
    this._windowLayer.visible = true;
};

Scene_Map.prototype.startFlashForEncounter = function(duration) {
    const color = [255, 255, 255, 255];
    $gameScreen.startFlash(color, duration);
};

Scene_Map.prototype.encounterEffectSpeed = function() {
    return 60;
};

//-----------------------------------------------------------------------------
// Scene_MenuBase
//
// The superclass of all the menu-type scenes.

function Scene_MenuBase() {
    this.initialize(...arguments);
}

Scene_MenuBase.prototype = Object.create(Scene_Base.prototype);
Scene_MenuBase.prototype.constructor = Scene_MenuBase;

Scene_MenuBase.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_MenuBase.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.updateActor();
    this.createWindowLayer();
    this.createButtons();
};

Scene_MenuBase.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    this.updatePageButtons();
};

Scene_MenuBase.prototype.helpAreaTop = function() {
    if (this.isBottomHelpMode()) {
        return this.mainAreaBottom();
    } else if (this.isBottomButtonMode()) {
        return 0;
    } else {
        return this.buttonAreaBottom();
    }
};

Scene_MenuBase.prototype.helpAreaBottom = function() {
    return this.helpAreaTop() + this.helpAreaHeight();
};

Scene_MenuBase.prototype.helpAreaHeight = function() {
    return this.calcWindowHeight(2, false);
};

Scene_MenuBase.prototype.mainAreaTop = function() {
    if (!this.isBottomHelpMode()) {
        return this.helpAreaBottom();
    } else if (this.isBottomButtonMode()) {
        return 0;
    } else {
        return this.buttonAreaBottom();
    }
};

Scene_MenuBase.prototype.mainAreaBottom = function() {
    return this.mainAreaTop() + this.mainAreaHeight();
};

Scene_MenuBase.prototype.mainAreaHeight = function() {
    return Graphics.boxHeight - this.buttonAreaHeight() - this.helpAreaHeight();
};

Scene_MenuBase.prototype.actor = function() {
    return this._actor;
};

Scene_MenuBase.prototype.updateActor = function() {
    this._actor = $gameParty.menuActor();
};

Scene_MenuBase.prototype.createBackground = function() {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this.setBackgroundOpacity(192);
};

Scene_MenuBase.prototype.setBackgroundOpacity = function(opacity) {
    this._backgroundSprite.opacity = opacity;
};

Scene_MenuBase.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
};

Scene_MenuBase.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_MenuBase.prototype.createButtons = function() {
    if (ConfigManager.touchUI) {
        if (this.needsCancelButton()) {
            this.createCancelButton();
        }
        if (this.needsPageButtons()) {
            this.createPageButtons();
        }
    }
};

Scene_MenuBase.prototype.needsCancelButton = function() {
    return true;
};

Scene_MenuBase.prototype.createCancelButton = function() {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_MenuBase.prototype.needsPageButtons = function() {
    return false;
};

Scene_MenuBase.prototype.createPageButtons = function() {
    this._pageupButton = new Sprite_Button("pageup");
    this._pageupButton.x = 4;
    this._pageupButton.y = this.buttonY();
    const pageupRight = this._pageupButton.x + this._pageupButton.width;
    this._pagedownButton = new Sprite_Button("pagedown");
    this._pagedownButton.x = pageupRight + 4;
    this._pagedownButton.y = this.buttonY();
    this.addWindow(this._pageupButton);
    this.addWindow(this._pagedownButton);
    this._pageupButton.setClickHandler(this.previousActor.bind(this));
    this._pagedownButton.setClickHandler(this.nextActor.bind(this));
};

Scene_MenuBase.prototype.updatePageButtons = function() {
    if (this._pageupButton && this._pagedownButton) {
        const enabled = this.arePageButtonsEnabled();
        this._pageupButton.visible = enabled;
        this._pagedownButton.visible = enabled;
    }
};

Scene_MenuBase.prototype.arePageButtonsEnabled = function() {
    return true;
};

Scene_MenuBase.prototype.nextActor = function() {
    $gameParty.makeMenuActorNext();
    this.updateActor();
    this.onActorChange();
};

Scene_MenuBase.prototype.previousActor = function() {
    $gameParty.makeMenuActorPrevious();
    this.updateActor();
    this.onActorChange();
};

Scene_MenuBase.prototype.onActorChange = function() {
    SoundManager.playCursor();
};

//-----------------------------------------------------------------------------
// Scene_Menu
//
// The scene class of the menu screen.

function Scene_Menu() {
    this.initialize(...arguments);
}

Scene_Menu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Menu.prototype.constructor = Scene_Menu;

Scene_Menu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Menu.prototype.helpAreaHeight = function() {
    return 0;
};

Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createGoldWindow();
    this.createStatusWindow();
};

Scene_Menu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._statusWindow.refresh();
};

Scene_Menu.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    const commandWindow = new Window_MenuCommand(rect);
    commandWindow.setHandler("item", this.commandItem.bind(this));
    commandWindow.setHandler("skill", this.commandPersonal.bind(this));
    commandWindow.setHandler("equip", this.commandPersonal.bind(this));
    commandWindow.setHandler("status", this.commandPersonal.bind(this));
    commandWindow.setHandler("formation", this.commandFormation.bind(this));
    commandWindow.setHandler("options", this.commandOptions.bind(this));
    commandWindow.setHandler("save", this.commandSave.bind(this));
    commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
    commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
};

Scene_Menu.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight() - this.goldWindowRect().height;
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Menu.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
};

Scene_Menu.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaBottom() - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Menu.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_MenuStatus(rect);
    this.addWindow(this._statusWindow);
};

Scene_Menu.prototype.statusWindowRect = function() {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.mainAreaHeight();
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Menu.prototype.commandItem = function() {
    SceneManager.push(Scene_Item);
};

Scene_Menu.prototype.commandPersonal = function() {
    this._statusWindow.setFormationMode(false);
    this._statusWindow.selectLast();
    this._statusWindow.activate();
    this._statusWindow.setHandler("ok", this.onPersonalOk.bind(this));
    this._statusWindow.setHandler("cancel", this.onPersonalCancel.bind(this));
};

Scene_Menu.prototype.commandFormation = function() {
    this._statusWindow.setFormationMode(true);
    this._statusWindow.selectLast();
    this._statusWindow.activate();
    this._statusWindow.setHandler("ok", this.onFormationOk.bind(this));
    this._statusWindow.setHandler("cancel", this.onFormationCancel.bind(this));
};

Scene_Menu.prototype.commandOptions = function() {
    SceneManager.push(Scene_Options);
};

Scene_Menu.prototype.commandSave = function() {
    SceneManager.push(Scene_Save);
};

Scene_Menu.prototype.commandGameEnd = function() {
    SceneManager.push(Scene_GameEnd);
};

Scene_Menu.prototype.onPersonalOk = function() {
    switch (this._commandWindow.currentSymbol()) {
        case "skill":
            SceneManager.push(Scene_Skill);
            break;
        case "equip":
            SceneManager.push(Scene_Equip);
            break;
        case "status":
            SceneManager.push(Scene_Status);
            break;
    }
};

Scene_Menu.prototype.onPersonalCancel = function() {
    this._statusWindow.deselect();
    this._commandWindow.activate();
};

Scene_Menu.prototype.onFormationOk = function() {
    const index = this._statusWindow.index();
    const pendingIndex = this._statusWindow.pendingIndex();
    if (pendingIndex >= 0) {
        $gameParty.swapOrder(index, pendingIndex);
        this._statusWindow.setPendingIndex(-1);
        this._statusWindow.redrawItem(index);
    } else {
        this._statusWindow.setPendingIndex(index);
    }
    this._statusWindow.activate();
};

Scene_Menu.prototype.onFormationCancel = function() {
    if (this._statusWindow.pendingIndex() >= 0) {
        this._statusWindow.setPendingIndex(-1);
        this._statusWindow.activate();
    } else {
        this._statusWindow.deselect();
        this._commandWindow.activate();
    }
};

//-----------------------------------------------------------------------------
// Scene_ItemBase
//
// The superclass of Scene_Item and Scene_Skill.

function Scene_ItemBase() {
    this.initialize(...arguments);
}

Scene_ItemBase.prototype = Object.create(Scene_MenuBase.prototype);
Scene_ItemBase.prototype.constructor = Scene_ItemBase;

Scene_ItemBase.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_ItemBase.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
};

Scene_ItemBase.prototype.createActorWindow = function() {
    const rect = this.actorWindowRect();
    this._actorWindow = new Window_MenuActor(rect);
    this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
    this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
};

Scene_ItemBase.prototype.actorWindowRect = function() {
    const wx = 0;
    const wy = Math.min(this.mainAreaTop(), this.helpAreaTop());
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.mainAreaHeight() + this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_ItemBase.prototype.item = function() {
    return this._itemWindow.item();
};

Scene_ItemBase.prototype.user = function() {
    return null;
};

Scene_ItemBase.prototype.isCursorLeft = function() {
    return this._itemWindow.index() % 2 === 0;
};

Scene_ItemBase.prototype.showActorWindow = function() {
    if (this.isCursorLeft()) {
        this._actorWindow.x = Graphics.boxWidth - this._actorWindow.width;
    } else {
        this._actorWindow.x = 0;
    }
    this._actorWindow.show();
    this._actorWindow.activate();
};

Scene_ItemBase.prototype.hideActorWindow = function() {
    this._actorWindow.hide();
    this._actorWindow.deactivate();
};

Scene_ItemBase.prototype.isActorWindowActive = function() {
    return this._actorWindow && this._actorWindow.active;
};

Scene_ItemBase.prototype.onActorOk = function() {
    if (this.canUse()) {
        this.useItem();
    } else {
        SoundManager.playBuzzer();
    }
};

Scene_ItemBase.prototype.onActorCancel = function() {
    this.hideActorWindow();
    this.activateItemWindow();
};

Scene_ItemBase.prototype.determineItem = function() {
    const action = new Game_Action(this.user());
    const item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        this.showActorWindow();
        this._actorWindow.selectForItem(this.item());
    } else {
        this.useItem();
        this.activateItemWindow();
    }
};

Scene_ItemBase.prototype.useItem = function() {
    this.playSeForItem();
    this.user().useItem(this.item());
    this.applyItem();
    this.checkCommonEvent();
    this.checkGameover();
    this._actorWindow.refresh();
};

Scene_ItemBase.prototype.activateItemWindow = function() {
    this._itemWindow.refresh();
    this._itemWindow.activate();
};

Scene_ItemBase.prototype.itemTargetActors = function() {
    const action = new Game_Action(this.user());
    action.setItemObject(this.item());
    if (!action.isForFriend()) {
        return [];
    } else if (action.isForAll()) {
        return $gameParty.members();
    } else {
        return [$gameParty.members()[this._actorWindow.index()]];
    }
};

Scene_ItemBase.prototype.canUse = function() {
    return this.user().canUse(this.item()) && this.isItemEffectsValid();
};

Scene_ItemBase.prototype.isItemEffectsValid = function() {
    const action = new Game_Action(this.user());
    action.setItemObject(this.item());
    return this.itemTargetActors().some(target => action.testApply(target));
};

Scene_ItemBase.prototype.applyItem = function() {
    const action = new Game_Action(this.user());
    action.setItemObject(this.item());
    for (const target of this.itemTargetActors()) {
        for (let i = 0; i < action.numRepeats(); i++) {
            action.apply(target);
        }
    }
    action.applyGlobal();
};

Scene_ItemBase.prototype.checkCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        SceneManager.goto(Scene_Map);
    }
};

//-----------------------------------------------------------------------------
// Scene_Item
//
// The scene class of the item screen.

function Scene_Item() {
    this.initialize(...arguments);
}

Scene_Item.prototype = Object.create(Scene_ItemBase.prototype);
Scene_Item.prototype.constructor = Scene_Item;

Scene_Item.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_Item.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createCategoryWindow();
    this.createItemWindow();
    this.createActorWindow();
};

Scene_Item.prototype.createCategoryWindow = function() {
    const rect = this.categoryWindowRect();
    this._categoryWindow = new Window_ItemCategory(rect);
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Item.prototype.categoryWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_ItemList(rect);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow.setItemWindow(this._itemWindow);
    if (!this._categoryWindow.needsSelection()) {
        this._itemWindow.y -= this._categoryWindow.height;
        this._itemWindow.height += this._categoryWindow.height;
        this._categoryWindow.hide();
        this._categoryWindow.deactivate();
        this.onCategoryOk();
    }
};

Scene_Item.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this._categoryWindow.y + this._categoryWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaBottom() - wy;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.user = function() {
    const members = $gameParty.movableMembers();
    const bestPha = Math.max(...members.map(member => member.pha));
    return members.find(member => member.pha === bestPha);
};

Scene_Item.prototype.onCategoryOk = function() {
    this._itemWindow.activate();
    this._itemWindow.selectLast();
};

Scene_Item.prototype.onItemOk = function() {
    $gameParty.setLastItem(this.item());
    this.determineItem();
};

Scene_Item.prototype.onItemCancel = function() {
    if (this._categoryWindow.needsSelection()) {
        this._itemWindow.deselect();
        this._categoryWindow.activate();
    } else {
        this.popScene();
    }
};

Scene_Item.prototype.playSeForItem = function() {
    SoundManager.playUseItem();
};

Scene_Item.prototype.useItem = function() {
    Scene_ItemBase.prototype.useItem.call(this);
    this._itemWindow.redrawCurrentItem();
};

//-----------------------------------------------------------------------------
// Scene_Skill
//
// The scene class of the skill screen.

function Scene_Skill() {
    this.initialize(...arguments);
}

Scene_Skill.prototype = Object.create(Scene_ItemBase.prototype);
Scene_Skill.prototype.constructor = Scene_Skill;

Scene_Skill.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_Skill.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createSkillTypeWindow();
    this.createStatusWindow();
    this.createItemWindow();
    this.createActorWindow();
};

Scene_Skill.prototype.start = function() {
    Scene_ItemBase.prototype.start.call(this);
    this.refreshActor();
};

Scene_Skill.prototype.createSkillTypeWindow = function() {
    const rect = this.skillTypeWindowRect();
    this._skillTypeWindow = new Window_SkillType(rect);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler("skill", this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler("cancel", this.popScene.bind(this));
    this._skillTypeWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._skillTypeWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
};

Scene_Skill.prototype.skillTypeWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(3, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_SkillStatus(rect);
    this.addWindow(this._statusWindow);
};

Scene_Skill.prototype.statusWindowRect = function() {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this._skillTypeWindow.height;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_SkillList(rect);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this._skillTypeWindow.setSkillWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

Scene_Skill.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this._statusWindow.y + this._statusWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._statusWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.needsPageButtons = function() {
    return true;
};

Scene_Skill.prototype.arePageButtonsEnabled = function() {
    return !this.isActorWindowActive();
};

Scene_Skill.prototype.refreshActor = function() {
    const actor = this.actor();
    this._skillTypeWindow.setActor(actor);
    this._statusWindow.setActor(actor);
    this._itemWindow.setActor(actor);
};

Scene_Skill.prototype.user = function() {
    return this.actor();
};

Scene_Skill.prototype.commandSkill = function() {
    this._itemWindow.activate();
    this._itemWindow.selectLast();
};

Scene_Skill.prototype.onItemOk = function() {
    this.actor().setLastMenuSkill(this.item());
    this.determineItem();
};

Scene_Skill.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    this._skillTypeWindow.activate();
};

Scene_Skill.prototype.playSeForItem = function() {
    SoundManager.playUseSkill();
};

Scene_Skill.prototype.useItem = function() {
    Scene_ItemBase.prototype.useItem.call(this);
    this._statusWindow.refresh();
    this._itemWindow.refresh();
};

Scene_Skill.prototype.onActorChange = function() {
    Scene_MenuBase.prototype.onActorChange.call(this);
    this.refreshActor();
    this._itemWindow.deselect();
    this._skillTypeWindow.activate();
};

//-----------------------------------------------------------------------------
// Scene_Equip
//
// The scene class of the equipment screen.

function Scene_Equip() {
    this.initialize(...arguments);
}

Scene_Equip.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Equip.prototype.constructor = Scene_Equip;

Scene_Equip.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Equip.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createStatusWindow();
    this.createCommandWindow();
    this.createSlotWindow();
    this.createItemWindow();
    this.refreshActor();
};

Scene_Equip.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_EquipStatus(rect);
    this.addWindow(this._statusWindow);
};

Scene_Equip.prototype.statusWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = this.statusWidth();
    const wh = this.mainAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Equip.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_EquipCommand(rect);
    this._commandWindow.setHelpWindow(this._helpWindow);
    this._commandWindow.setHandler("equip", this.commandEquip.bind(this));
    this._commandWindow.setHandler("optimize", this.commandOptimize.bind(this));
    this._commandWindow.setHandler("clear", this.commandClear.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this._commandWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._commandWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Equip.prototype.commandWindowRect = function() {
    const wx = this.statusWidth();
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Equip.prototype.createSlotWindow = function() {
    const rect = this.slotWindowRect();
    this._slotWindow = new Window_EquipSlot(rect);
    this._slotWindow.setHelpWindow(this._helpWindow);
    this._slotWindow.setStatusWindow(this._statusWindow);
    this._slotWindow.setHandler("ok", this.onSlotOk.bind(this));
    this._slotWindow.setHandler("cancel", this.onSlotCancel.bind(this));
    this.addWindow(this._slotWindow);
};

Scene_Equip.prototype.slotWindowRect = function() {
    const commandWindowRect = this.commandWindowRect();
    const wx = this.statusWidth();
    const wy = commandWindowRect.y + commandWindowRect.height;
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this.mainAreaHeight() - commandWindowRect.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Equip.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_EquipItem(rect);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setStatusWindow(this._statusWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this._itemWindow.hide();
    this._slotWindow.setItemWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

Scene_Equip.prototype.itemWindowRect = function() {
    return this.slotWindowRect();
};

Scene_Equip.prototype.statusWidth = function() {
    return 312;
};

Scene_Equip.prototype.needsPageButtons = function() {
    return true;
};

Scene_Equip.prototype.arePageButtonsEnabled = function() {
    return !(this._itemWindow && this._itemWindow.active);
};

Scene_Equip.prototype.refreshActor = function() {
    const actor = this.actor();
    this._statusWindow.setActor(actor);
    this._slotWindow.setActor(actor);
    this._itemWindow.setActor(actor);
};

Scene_Equip.prototype.commandEquip = function() {
    this._slotWindow.activate();
    this._slotWindow.select(0);
};

Scene_Equip.prototype.commandOptimize = function() {
    SoundManager.playEquip();
    this.actor().optimizeEquipments();
    this._statusWindow.refresh();
    this._slotWindow.refresh();
    this._commandWindow.activate();
};

Scene_Equip.prototype.commandClear = function() {
    SoundManager.playEquip();
    this.actor().clearEquipments();
    this._statusWindow.refresh();
    this._slotWindow.refresh();
    this._commandWindow.activate();
};

Scene_Equip.prototype.onSlotOk = function() {
    this._slotWindow.hide();
    this._itemWindow.show();
    this._itemWindow.activate();
    this._itemWindow.select(0);
};

Scene_Equip.prototype.onSlotCancel = function() {
    this._slotWindow.deselect();
    this._commandWindow.activate();
};

Scene_Equip.prototype.onItemOk = function() {
    SoundManager.playEquip();
    this.executeEquipChange();
    this.hideItemWindow();
    this._slotWindow.refresh();
    this._itemWindow.refresh();
    this._statusWindow.refresh();
};

Scene_Equip.prototype.executeEquipChange = function() {
    const actor = this.actor();
    const slotId = this._slotWindow.index();
    const item = this._itemWindow.item();
    actor.changeEquip(slotId, item);
};

Scene_Equip.prototype.onItemCancel = function() {
    this.hideItemWindow();
};

Scene_Equip.prototype.onActorChange = function() {
    Scene_MenuBase.prototype.onActorChange.call(this);
    this.refreshActor();
    this.hideItemWindow();
    this._slotWindow.deselect();
    this._slotWindow.deactivate();
    this._commandWindow.activate();
};

Scene_Equip.prototype.hideItemWindow = function() {
    this._slotWindow.show();
    this._slotWindow.activate();
    this._itemWindow.hide();
    this._itemWindow.deselect();
};

//-----------------------------------------------------------------------------
// Scene_Status
//
// The scene class of the status screen.

function Scene_Status() {
    this.initialize(...arguments);
}

Scene_Status.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Status.prototype.constructor = Scene_Status;

Scene_Status.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Status.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createProfileWindow();
    this.createStatusWindow();
    this.createStatusParamsWindow();
    this.createStatusEquipWindow();
};

Scene_Status.prototype.helpAreaHeight = function() {
    return 0;
};

Scene_Status.prototype.createProfileWindow = function() {
    const rect = this.profileWindowRect();
    this._profileWindow = new Window_Help(rect);
    this.addWindow(this._profileWindow);
};

Scene_Status.prototype.profileWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.profileHeight();
    const wx = 0;
    const wy = this.mainAreaBottom() - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Status.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_Status(rect);
    this._statusWindow.setHandler("cancel", this.popScene.bind(this));
    this._statusWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._statusWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._statusWindow);
};

Scene_Status.prototype.statusWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.statusParamsWindowRect().y - wy;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Status.prototype.createStatusParamsWindow = function() {
    const rect = this.statusParamsWindowRect();
    this._statusParamsWindow = new Window_StatusParams(rect);
    this.addWindow(this._statusParamsWindow);
};

Scene_Status.prototype.statusParamsWindowRect = function() {
    const ww = this.statusParamsWidth();
    const wh = this.statusParamsHeight();
    const wx = 0;
    const wy = this.mainAreaBottom() - this.profileHeight() - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Status.prototype.createStatusEquipWindow = function() {
    const rect = this.statusEquipWindowRect();
    this._statusEquipWindow = new Window_StatusEquip(rect);
    this.addWindow(this._statusEquipWindow);
};

Scene_Status.prototype.statusEquipWindowRect = function() {
    const ww = Graphics.boxWidth - this.statusParamsWidth();
    const wh = this.statusParamsHeight();
    const wx = this.statusParamsWidth();
    const wy = this.mainAreaBottom() - this.profileHeight() - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Status.prototype.statusParamsWidth = function() {
    return 300;
};

Scene_Status.prototype.statusParamsHeight = function() {
    return this.calcWindowHeight(6, false);
};

Scene_Status.prototype.profileHeight = function() {
    return this.calcWindowHeight(2, false);
};

Scene_Status.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this.refreshActor();
};

Scene_Status.prototype.needsPageButtons = function() {
    return true;
};

Scene_Status.prototype.refreshActor = function() {
    const actor = this.actor();
    this._profileWindow.setText(actor.profile());
    this._statusWindow.setActor(actor);
    this._statusParamsWindow.setActor(actor);
    this._statusEquipWindow.setActor(actor);
};

Scene_Status.prototype.onActorChange = function() {
    Scene_MenuBase.prototype.onActorChange.call(this);
    this.refreshActor();
    this._statusWindow.activate();
};

//-----------------------------------------------------------------------------
// Scene_Options
//
// The scene class of the options screen.

function Scene_Options() {
    this.initialize(...arguments);
}

Scene_Options.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Options.prototype.constructor = Scene_Options;

Scene_Options.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Options.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createOptionsWindow();
};

Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

Scene_Options.prototype.createOptionsWindow = function() {
    const rect = this.optionsWindowRect();
    this._optionsWindow = new Window_Options(rect);
    this._optionsWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._optionsWindow);
};

Scene_Options.prototype.optionsWindowRect = function() {
    const n = Math.min(this.maxCommands(), this.maxVisibleCommands());
    const ww = 400;
    const wh = this.calcWindowHeight(n, true);
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Options.prototype.maxCommands = function() {
    // Increase this value when adding option items.
    return 7;
};

Scene_Options.prototype.maxVisibleCommands = function() {
    return 12;
};

//-----------------------------------------------------------------------------
// Scene_File
//
// The superclass of Scene_Save and Scene_Load.

function Scene_File() {
    this.initialize(...arguments);
}

Scene_File.prototype = Object.create(Scene_MenuBase.prototype);
Scene_File.prototype.constructor = Scene_File;

Scene_File.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_File.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    DataManager.loadAllSavefileImages();
    this.createHelpWindow();
    this.createListWindow();
    this._helpWindow.setText(this.helpWindowText());
};

Scene_File.prototype.helpAreaHeight = function() {
    return 0;
};

Scene_File.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._listWindow.refresh();
};

Scene_File.prototype.savefileId = function() {
    return this._listWindow.savefileId();
};

Scene_File.prototype.isSavefileEnabled = function(savefileId) {
    return this._listWindow.isEnabled(savefileId);
};

Scene_File.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
};

Scene_File.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_File.prototype.createListWindow = function() {
    const rect = this.listWindowRect();
    this._listWindow = new Window_SavefileList(rect);
    this._listWindow.setHandler("ok", this.onSavefileOk.bind(this));
    this._listWindow.setHandler("cancel", this.popScene.bind(this));
    this._listWindow.setMode(this.mode(), this.needsAutosave());
    this._listWindow.selectSavefile(this.firstSavefileId());
    this._listWindow.refresh();
    this.addWindow(this._listWindow);
};

Scene_File.prototype.listWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop() + this._helpWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._helpWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_File.prototype.mode = function() {
    return null;
};

Scene_File.prototype.needsAutosave = function() {
    return $gameSystem.isAutosaveEnabled();
};

Scene_File.prototype.activateListWindow = function() {
    this._listWindow.activate();
};

Scene_File.prototype.helpWindowText = function() {
    return "";
};

Scene_File.prototype.firstSavefileId = function() {
    return 0;
};

Scene_File.prototype.onSavefileOk = function() {
    //
};

//-----------------------------------------------------------------------------
// Scene_Save
//
// The scene class of the save screen.

function Scene_Save() {
    this.initialize(...arguments);
}

Scene_Save.prototype = Object.create(Scene_File.prototype);
Scene_Save.prototype.constructor = Scene_Save;

Scene_Save.prototype.initialize = function() {
    Scene_File.prototype.initialize.call(this);
};

Scene_Save.prototype.mode = function() {
    return "save";
};

Scene_Save.prototype.helpWindowText = function() {
    return TextManager.saveMessage;
};

Scene_Save.prototype.firstSavefileId = function() {
    return $gameSystem.savefileId();
};

Scene_Save.prototype.onSavefileOk = function() {
    Scene_File.prototype.onSavefileOk.call(this);
    const savefileId = this.savefileId();
    if (this.isSavefileEnabled(savefileId)) {
        this.executeSave(savefileId);
    } else {
        this.onSaveFailure();
    }
};

Scene_Save.prototype.executeSave = function(savefileId) {
    $gameSystem.setSavefileId(savefileId);
    $gameSystem.onBeforeSave();
    DataManager.saveGame(savefileId)
        .then(() => this.onSaveSuccess())
        .catch(() => this.onSaveFailure());
};

Scene_Save.prototype.onSaveSuccess = function() {
    SoundManager.playSave();
    this.popScene();
};

Scene_Save.prototype.onSaveFailure = function() {
    SoundManager.playBuzzer();
    this.activateListWindow();
};

//-----------------------------------------------------------------------------
// Scene_Load
//
// The scene class of the load screen.

function Scene_Load() {
    this.initialize(...arguments);
}

Scene_Load.prototype = Object.create(Scene_File.prototype);
Scene_Load.prototype.constructor = Scene_Load;

Scene_Load.prototype.initialize = function() {
    Scene_File.prototype.initialize.call(this);
    this._loadSuccess = false;
};

Scene_Load.prototype.terminate = function() {
    Scene_File.prototype.terminate.call(this);
    if (this._loadSuccess) {
        $gameSystem.onAfterLoad();
    }
};

Scene_Load.prototype.mode = function() {
    return "load";
};

Scene_Load.prototype.helpWindowText = function() {
    return TextManager.loadMessage;
};

Scene_Load.prototype.firstSavefileId = function() {
    return DataManager.latestSavefileId();
};

Scene_Load.prototype.onSavefileOk = function() {
    Scene_File.prototype.onSavefileOk.call(this);
    const savefileId = this.savefileId();
    if (this.isSavefileEnabled(savefileId)) {
        this.executeLoad(savefileId);
    } else {
        this.onLoadFailure();
    }
};

Scene_Load.prototype.executeLoad = function(savefileId) {
    DataManager.loadGame(savefileId)
        .then(() => this.onLoadSuccess())
        .catch(() => this.onLoadFailure());
};

Scene_Load.prototype.onLoadSuccess = function() {
    SoundManager.playLoad();
    this.fadeOutAll();
    this.reloadMapIfUpdated();
    SceneManager.goto(Scene_Map);
    this._loadSuccess = true;
};

Scene_Load.prototype.onLoadFailure = function() {
    SoundManager.playBuzzer();
    this.activateListWindow();
};

Scene_Load.prototype.reloadMapIfUpdated = function() {
    if ($gameSystem.versionId() !== $dataSystem.versionId) {
        const mapId = $gameMap.mapId();
        const x = $gamePlayer.x;
        const y = $gamePlayer.y;
        $gamePlayer.reserveTransfer(mapId, x, y);
        $gamePlayer.requestMapReload();
    }
};

//-----------------------------------------------------------------------------
// Scene_GameEnd
//
// The scene class of the game end screen.

function Scene_GameEnd() {
    this.initialize(...arguments);
}

Scene_GameEnd.prototype = Object.create(Scene_MenuBase.prototype);
Scene_GameEnd.prototype.constructor = Scene_GameEnd;

Scene_GameEnd.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_GameEnd.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
};

Scene_GameEnd.prototype.stop = function() {
    Scene_MenuBase.prototype.stop.call(this);
    this._commandWindow.close();
};

Scene_GameEnd.prototype.createBackground = function() {
    Scene_MenuBase.prototype.createBackground.call(this);
    this.setBackgroundOpacity(128);
};

Scene_GameEnd.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_GameEnd(rect);
    this._commandWindow.setHandler("toTitle", this.commandToTitle.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_GameEnd.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_GameEnd.prototype.commandToTitle = function() {
    this.fadeOutAll();
    SceneManager.goto(Scene_Title);
    Window_TitleCommand.initCommandPosition();
};

//-----------------------------------------------------------------------------
// Scene_Shop
//
// The scene class of the shop screen.

function Scene_Shop() {
    this.initialize(...arguments);
}

Scene_Shop.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Shop.prototype.constructor = Scene_Shop;

Scene_Shop.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
    this._goods = goods;
    this._purchaseOnly = purchaseOnly;
    this._item = null;
};

Scene_Shop.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createGoldWindow();
    this.createCommandWindow();
    this.createDummyWindow();
    this.createNumberWindow();
    this.createStatusWindow();
    this.createBuyWindow();
    this.createCategoryWindow();
    this.createSellWindow();
};

Scene_Shop.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
};

Scene_Shop.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_ShopCommand(rect);
    this._commandWindow.setPurchaseOnly(this._purchaseOnly);
    this._commandWindow.y = this.mainAreaTop();
    this._commandWindow.setHandler("buy", this.commandBuy.bind(this));
    this._commandWindow.setHandler("sell", this.commandSell.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Shop.prototype.commandWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = this._goldWindow.x;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createDummyWindow = function() {
    const rect = this.dummyWindowRect();
    this._dummyWindow = new Window_Base(rect);
    this.addWindow(this._dummyWindow);
};

Scene_Shop.prototype.dummyWindowRect = function() {
    const wx = 0;
    const wy = this._commandWindow.y + this._commandWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._commandWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createNumberWindow = function() {
    const rect = this.numberWindowRect();
    this._numberWindow = new Window_ShopNumber(rect);
    this._numberWindow.hide();
    this._numberWindow.setHandler("ok", this.onNumberOk.bind(this));
    this._numberWindow.setHandler("cancel", this.onNumberCancel.bind(this));
    this.addWindow(this._numberWindow);
};

Scene_Shop.prototype.numberWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this._dummyWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_ShopStatus(rect);
    this._statusWindow.hide();
    this.addWindow(this._statusWindow);
};

Scene_Shop.prototype.statusWindowRect = function() {
    const ww = this.statusWidth();
    const wh = this._dummyWindow.height;
    const wx = Graphics.boxWidth - ww;
    const wy = this._dummyWindow.y;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createBuyWindow = function() {
    const rect = this.buyWindowRect();
    this._buyWindow = new Window_ShopBuy(rect);
    this._buyWindow.setupGoods(this._goods);
    this._buyWindow.setHelpWindow(this._helpWindow);
    this._buyWindow.setStatusWindow(this._statusWindow);
    this._buyWindow.hide();
    this._buyWindow.setHandler("ok", this.onBuyOk.bind(this));
    this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
    this.addWindow(this._buyWindow);
};

Scene_Shop.prototype.buyWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this._dummyWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createCategoryWindow = function() {
    const rect = this.categoryWindowRect();
    this._categoryWindow = new Window_ItemCategory(rect);
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.hide();
    this._categoryWindow.deactivate();
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.onCategoryCancel.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Shop.prototype.categoryWindowRect = function() {
    const wx = 0;
    const wy = this._dummyWindow.y;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createSellWindow = function() {
    const rect = this.sellWindowRect();
    this._sellWindow = new Window_ShopSell(rect);
    this._sellWindow.setHelpWindow(this._helpWindow);
    this._sellWindow.hide();
    this._sellWindow.setHandler("ok", this.onSellOk.bind(this));
    this._sellWindow.setHandler("cancel", this.onSellCancel.bind(this));
    this._categoryWindow.setItemWindow(this._sellWindow);
    this.addWindow(this._sellWindow);
    if (!this._categoryWindow.needsSelection()) {
        this._sellWindow.y -= this._categoryWindow.height;
        this._sellWindow.height += this._categoryWindow.height;
    }
};

Scene_Shop.prototype.sellWindowRect = function() {
    const wx = 0;
    const wy = this._categoryWindow.y + this._categoryWindow.height;
    const ww = Graphics.boxWidth;
    const wh =
        this.mainAreaHeight() -
        this._commandWindow.height -
        this._categoryWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.statusWidth = function() {
    return 352;
};

Scene_Shop.prototype.activateBuyWindow = function() {
    this._buyWindow.setMoney(this.money());
    this._buyWindow.show();
    this._buyWindow.activate();
    this._statusWindow.show();
};

Scene_Shop.prototype.activateSellWindow = function() {
    if (this._categoryWindow.needsSelection()) {
        this._categoryWindow.show();
    }
    this._sellWindow.refresh();
    this._sellWindow.show();
    this._sellWindow.activate();
    this._statusWindow.hide();
};

Scene_Shop.prototype.commandBuy = function() {
    this._dummyWindow.hide();
    this.activateBuyWindow();
};

Scene_Shop.prototype.commandSell = function() {
    this._dummyWindow.hide();
    this._sellWindow.show();
    this._sellWindow.deselect();
    this._sellWindow.refresh();
    if (this._categoryWindow.needsSelection()) {
        this._categoryWindow.show();
        this._categoryWindow.activate();
    } else {
        this.onCategoryOk();
    }
};

Scene_Shop.prototype.onBuyOk = function() {
    this._item = this._buyWindow.item();
    this._buyWindow.hide();
    this._numberWindow.setup(this._item, this.maxBuy(), this.buyingPrice());
    this._numberWindow.setCurrencyUnit(this.currencyUnit());
    this._numberWindow.show();
    this._numberWindow.activate();
};

Scene_Shop.prototype.onBuyCancel = function() {
    this._commandWindow.activate();
    this._dummyWindow.show();
    this._buyWindow.hide();
    this._statusWindow.hide();
    this._statusWindow.setItem(null);
    this._helpWindow.clear();
};

Scene_Shop.prototype.onCategoryOk = function() {
    this.activateSellWindow();
    this._sellWindow.select(0);
};

Scene_Shop.prototype.onCategoryCancel = function() {
    this._commandWindow.activate();
    this._dummyWindow.show();
    this._categoryWindow.hide();
    this._sellWindow.hide();
};

Scene_Shop.prototype.onSellOk = function() {
    this._item = this._sellWindow.item();
    this._categoryWindow.hide();
    this._sellWindow.hide();
    this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice());
    this._numberWindow.setCurrencyUnit(this.currencyUnit());
    this._numberWindow.show();
    this._numberWindow.activate();
    this._statusWindow.setItem(this._item);
    this._statusWindow.show();
};

Scene_Shop.prototype.onSellCancel = function() {
    this._sellWindow.deselect();
    this._statusWindow.setItem(null);
    this._helpWindow.clear();
    if (this._categoryWindow.needsSelection()) {
        this._categoryWindow.activate();
    } else {
        this.onCategoryCancel();
    }
};

Scene_Shop.prototype.onNumberOk = function() {
    SoundManager.playShop();
    switch (this._commandWindow.currentSymbol()) {
        case "buy":
            this.doBuy(this._numberWindow.number());
            break;
        case "sell":
            this.doSell(this._numberWindow.number());
            break;
    }
    this.endNumberInput();
    this._goldWindow.refresh();
    this._statusWindow.refresh();
};

Scene_Shop.prototype.onNumberCancel = function() {
    SoundManager.playCancel();
    this.endNumberInput();
};

Scene_Shop.prototype.doBuy = function(number) {
    $gameParty.loseGold(number * this.buyingPrice());
    $gameParty.gainItem(this._item, number);
};

Scene_Shop.prototype.doSell = function(number) {
    $gameParty.gainGold(number * this.sellingPrice());
    $gameParty.loseItem(this._item, number);
};

Scene_Shop.prototype.endNumberInput = function() {
    this._numberWindow.hide();
    switch (this._commandWindow.currentSymbol()) {
        case "buy":
            this.activateBuyWindow();
            break;
        case "sell":
            this.activateSellWindow();
            break;
    }
};

Scene_Shop.prototype.maxBuy = function() {
    const num = $gameParty.numItems(this._item);
    const max = $gameParty.maxItems(this._item) - num;
    const price = this.buyingPrice();
    if (price > 0) {
        return Math.min(max, Math.floor(this.money() / price));
    } else {
        return max;
    }
};

Scene_Shop.prototype.maxSell = function() {
    return $gameParty.numItems(this._item);
};

Scene_Shop.prototype.money = function() {
    return this._goldWindow.value();
};

Scene_Shop.prototype.currencyUnit = function() {
    return this._goldWindow.currencyUnit();
};

Scene_Shop.prototype.buyingPrice = function() {
    return this._buyWindow.price(this._item);
};

Scene_Shop.prototype.sellingPrice = function() {
    return Math.floor(this._item.price / 2);
};

//-----------------------------------------------------------------------------
// Scene_Name
//
// The scene class of the name input screen.

function Scene_Name() {
    this.initialize(...arguments);
}

Scene_Name.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Name.prototype.constructor = Scene_Name;

Scene_Name.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Name.prototype.prepare = function(actorId, maxLength) {
    this._actorId = actorId;
    this._maxLength = maxLength;
};

Scene_Name.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._actor = $gameActors.actor(this._actorId);
    this.createEditWindow();
    this.createInputWindow();
};

Scene_Name.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._editWindow.refresh();
};

Scene_Name.prototype.createEditWindow = function() {
    const rect = this.editWindowRect();
    this._editWindow = new Window_NameEdit(rect);
    this._editWindow.setup(this._actor, this._maxLength);
    this.addWindow(this._editWindow);
};

Scene_Name.prototype.editWindowRect = function() {
    const inputWindowHeight = this.calcWindowHeight(9, true);
    const padding = $gameSystem.windowPadding();
    const ww = 600;
    const wh = ImageManager.faceHeight + padding * 2;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Name.prototype.createInputWindow = function() {
    const rect = this.inputWindowRect();
    this._inputWindow = new Window_NameInput(rect);
    this._inputWindow.setEditWindow(this._editWindow);
    this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
    this.addWindow(this._inputWindow);
};

Scene_Name.prototype.inputWindowRect = function() {
    const wx = this._editWindow.x;
    const wy = this._editWindow.y + this._editWindow.height + 8;
    const ww = this._editWindow.width;
    const wh = this.calcWindowHeight(9, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Name.prototype.onInputOk = function() {
    this._actor.setName(this._editWindow.name());
    this.popScene();
};

//-----------------------------------------------------------------------------
// Scene_Debug
//
// The scene class of the debug screen.

function Scene_Debug() {
    this.initialize(...arguments);
}

Scene_Debug.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Debug.prototype.constructor = Scene_Debug;

Scene_Debug.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Debug.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createRangeWindow();
    this.createEditWindow();
    this.createDebugHelpWindow();
};

Scene_Debug.prototype.needsCancelButton = function() {
    return false;
};

Scene_Debug.prototype.createRangeWindow = function() {
    const rect = this.rangeWindowRect();
    this._rangeWindow = new Window_DebugRange(rect);
    this._rangeWindow.setHandler("ok", this.onRangeOk.bind(this));
    this._rangeWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._rangeWindow);
};

Scene_Debug.prototype.rangeWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = 246;
    const wh = Graphics.boxHeight;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Debug.prototype.createEditWindow = function() {
    const rect = this.editWindowRect();
    this._editWindow = new Window_DebugEdit(rect);
    this._editWindow.setHandler("cancel", this.onEditCancel.bind(this));
    this._rangeWindow.setEditWindow(this._editWindow);
    this.addWindow(this._editWindow);
};

Scene_Debug.prototype.editWindowRect = function() {
    const wx = this._rangeWindow.width;
    const wy = 0;
    const ww = Graphics.boxWidth - wx;
    const wh = this.calcWindowHeight(10, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Debug.prototype.createDebugHelpWindow = function() {
    const rect = this.debugHelpWindowRect();
    this._debugHelpWindow = new Window_Base(rect);
    this.addWindow(this._debugHelpWindow);
};

Scene_Debug.prototype.debugHelpWindowRect = function() {
    const wx = this._editWindow.x;
    const wy = this._editWindow.height;
    const ww = this._editWindow.width;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Debug.prototype.onRangeOk = function() {
    this._editWindow.activate();
    this._editWindow.select(0);
    this.refreshHelpWindow();
};

Scene_Debug.prototype.onEditCancel = function() {
    this._rangeWindow.activate();
    this._editWindow.deselect();
    this.refreshHelpWindow();
};

Scene_Debug.prototype.refreshHelpWindow = function() {
    const helpWindow = this._debugHelpWindow;
    helpWindow.contents.clear();
    if (this._editWindow.active) {
        const rect = helpWindow.baseTextRect();
        helpWindow.drawTextEx(this.helpText(), rect.x, rect.y, rect.width);
    }
};

Scene_Debug.prototype.helpText = function() {
    if (this._rangeWindow.mode() === "switch") {
        return "Enter : ON / OFF";
    } else {
        return (
            "Left     :  -1    Pageup   : -10\n" +
            "Right    :  +1    Pagedown : +10"
        );
    }
};

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle screen.

function Scene_Battle() {
    this.initialize(...arguments);
}

Scene_Battle.prototype = Object.create(Scene_Message.prototype);
Scene_Battle.prototype.constructor = Scene_Battle;

Scene_Battle.prototype.initialize = function() {
    Scene_Message.prototype.initialize.call(this);
};

Scene_Battle.prototype.create = function() {
    Scene_Message.prototype.create.call(this);
    this.createDisplayObjects();
};

Scene_Battle.prototype.start = function() {
    Scene_Message.prototype.start.call(this);
    BattleManager.playBattleBgm();
    BattleManager.startBattle();
    this._statusWindow.refresh();
    this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Battle.prototype.update = function() {
    const active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
    this.updateVisibility();
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    Scene_Message.prototype.update.call(this);
};

Scene_Battle.prototype.updateVisibility = function() {
    this.updateLogWindowVisibility();
    this.updateStatusWindowVisibility();
    this.updateInputWindowVisibility();
    this.updateCancelButton();
};

Scene_Battle.prototype.updateBattleProcess = function() {
    BattleManager.update(this.isTimeActive());
};

Scene_Battle.prototype.isTimeActive = function() {
    if (BattleManager.isActiveTpb()) {
        return !this._skillWindow.active && !this._itemWindow.active;
    } else {
        return !this.isAnyInputWindowActive();
    }
};

Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (
        this._partyCommandWindow.active ||
        this._actorCommandWindow.active ||
        this._skillWindow.active ||
        this._itemWindow.active ||
        this._actorWindow.active ||
        this._enemyWindow.active
    );
};

Scene_Battle.prototype.changeInputWindow = function() {
    this.hideSubInputWindows();
    if (BattleManager.isInputting()) {
        if (BattleManager.actor()) {
            this.startActorCommandSelection();
        } else {
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
};

Scene_Battle.prototype.stop = function() {
    Scene_Message.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
    this._statusWindow.close();
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
};

Scene_Battle.prototype.terminate = function() {
    Scene_Message.prototype.terminate.call(this);
    $gameParty.onBattleEnd();
    $gameTroop.onBattleEnd();
    AudioManager.stopMe();
    if (this.shouldAutosave()) {
        this.requestAutosave();
    }
};

Scene_Battle.prototype.shouldAutosave = function() {
    return SceneManager.isNextScene(Scene_Map);
};

Scene_Battle.prototype.needsSlowFadeOut = function() {
    return (
        SceneManager.isNextScene(Scene_Title) ||
        SceneManager.isNextScene(Scene_Gameover)
    );
};

Scene_Battle.prototype.updateLogWindowVisibility = function() {
    this._logWindow.visible = !this._helpWindow.visible;
};

Scene_Battle.prototype.updateStatusWindowVisibility = function() {
    if ($gameMessage.isBusy()) {
        this._statusWindow.close();
    } else if (this.shouldOpenStatusWindow()) {
        this._statusWindow.open();
    }
    this.updateStatusWindowPosition();
};

Scene_Battle.prototype.shouldOpenStatusWindow = function() {
    return (
        this.isActive() &&
        !this.isMessageWindowClosing() &&
        !BattleManager.isBattleEnd()
    );
};

Scene_Battle.prototype.updateStatusWindowPosition = function() {
    const statusWindow = this._statusWindow;
    const targetX = this.statusWindowX();
    if (statusWindow.x < targetX) {
        statusWindow.x = Math.min(statusWindow.x + 16, targetX);
    }
    if (statusWindow.x > targetX) {
        statusWindow.x = Math.max(statusWindow.x - 16, targetX);
    }
};

Scene_Battle.prototype.statusWindowX = function() {
    if (this.isAnyInputWindowActive()) {
        return this.statusWindowRect().x;
    } else {
        return this._partyCommandWindow.width / 2;
    }
};

Scene_Battle.prototype.updateInputWindowVisibility = function() {
    if ($gameMessage.isBusy()) {
        this.closeCommandWindows();
        this.hideSubInputWindows();
    } else if (this.needsInputWindowChange()) {
        this.changeInputWindow();
    }
};

Scene_Battle.prototype.needsInputWindowChange = function() {
    const windowActive = this.isAnyInputWindowActive();
    const inputting = BattleManager.isInputting();
    if (windowActive && inputting) {
        return this._actorCommandWindow.actor() !== BattleManager.actor();
    }
    return windowActive !== inputting;
};

Scene_Battle.prototype.updateCancelButton = function() {
    if (this._cancelButton) {
        this._cancelButton.visible =
            this.isAnyInputWindowActive() && !this._partyCommandWindow.active;
    }
};

Scene_Battle.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    this.createButtons();
    BattleManager.setLogWindow(this._logWindow);
    BattleManager.setSpriteset(this._spriteset);
    this._logWindow.setSpriteset(this._spriteset);
};

Scene_Battle.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Battle();
    this.addChild(this._spriteset);
};

Scene_Battle.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    Scene_Message.prototype.createAllWindows.call(this);
};

Scene_Battle.prototype.createLogWindow = function() {
    const rect = this.logWindowRect();
    this._logWindow = new Window_BattleLog(rect);
    this.addWindow(this._logWindow);
};

Scene_Battle.prototype.logWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(10, false);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    const statusWindow = new Window_BattleStatus(rect);
    this.addWindow(statusWindow);
    this._statusWindow = statusWindow;
};

Scene_Battle.prototype.statusWindowRect = function() {
    const extra = 10;
    const ww = Graphics.boxWidth - 192;
    const wh = this.windowAreaHeight() + extra;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - wh + extra - 4;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createPartyCommandWindow = function() {
    const rect = this.partyCommandWindowRect();
    const commandWindow = new Window_PartyCommand(rect);
    commandWindow.setHandler("fight", this.commandFight.bind(this));
    commandWindow.setHandler("escape", this.commandEscape.bind(this));
    commandWindow.deselect();
    this.addWindow(commandWindow);
    this._partyCommandWindow = commandWindow;
};

Scene_Battle.prototype.partyCommandWindowRect = function() {
    const ww = 192;
    const wh = this.windowAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createActorCommandWindow = function() {
    const rect = this.actorCommandWindowRect();
    const commandWindow = new Window_ActorCommand(rect);
    commandWindow.y = Graphics.boxHeight - commandWindow.height;
    commandWindow.setHandler("attack", this.commandAttack.bind(this));
    commandWindow.setHandler("skill", this.commandSkill.bind(this));
    commandWindow.setHandler("guard", this.commandGuard.bind(this));
    commandWindow.setHandler("item", this.commandItem.bind(this));
    commandWindow.setHandler("cancel", this.commandCancel.bind(this));
    this.addWindow(commandWindow);
    this._actorCommandWindow = commandWindow;
};

Scene_Battle.prototype.actorCommandWindowRect = function() {
    const ww = 192;
    const wh = this.windowAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this._helpWindow.hide();
    this.addWindow(this._helpWindow);
};

Scene_Battle.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createSkillWindow = function() {
    const rect = this.skillWindowRect();
    this._skillWindow = new Window_BattleSkill(rect);
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler("ok", this.onSkillOk.bind(this));
    this._skillWindow.setHandler("cancel", this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_Battle.prototype.skillWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.windowAreaHeight();
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_BattleItem(rect);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

Scene_Battle.prototype.itemWindowRect = function() {
    return this.skillWindowRect();
};

Scene_Battle.prototype.createActorWindow = function() {
    const rect = this.actorWindowRect();
    this._actorWindow = new Window_BattleActor(rect);
    this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
    this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
};

Scene_Battle.prototype.actorWindowRect = function() {
    return this.statusWindowRect();
};

Scene_Battle.prototype.createEnemyWindow = function() {
    const rect = this.enemyWindowRect();
    this._enemyWindow = new Window_BattleEnemy(rect);
    this._enemyWindow.setHandler("ok", this.onEnemyOk.bind(this));
    this._enemyWindow.setHandler("cancel", this.onEnemyCancel.bind(this));
    this.addWindow(this._enemyWindow);
};

Scene_Battle.prototype.enemyWindowRect = function() {
    const wx = this._statusWindow.x;
    const ww = this._statusWindow.width;
    const wh = this.windowAreaHeight();
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Battle.prototype.helpAreaTop = function() {
    return 0;
};

Scene_Battle.prototype.helpAreaBottom = function() {
    return this.helpAreaTop() + this.helpAreaHeight();
};

Scene_Battle.prototype.helpAreaHeight = function() {
    return this.calcWindowHeight(2, false);
};

Scene_Battle.prototype.buttonAreaTop = function() {
    return this.helpAreaBottom();
};

Scene_Battle.prototype.windowAreaHeight = function() {
    return this.calcWindowHeight(4, true);
};

Scene_Battle.prototype.createButtons = function() {
    if (ConfigManager.touchUI) {
        this.createCancelButton();
    }
};

Scene_Battle.prototype.createCancelButton = function() {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_Battle.prototype.closeCommandWindows = function() {
    this._partyCommandWindow.deactivate();
    this._actorCommandWindow.deactivate();
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
};

Scene_Battle.prototype.hideSubInputWindows = function() {
    this._actorWindow.deactivate();
    this._enemyWindow.deactivate();
    this._skillWindow.deactivate();
    this._itemWindow.deactivate();
    this._actorWindow.hide();
    this._enemyWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
};

Scene_Battle.prototype.startPartyCommandSelection = function() {
    this._statusWindow.deselect();
    this._statusWindow.show();
    this._statusWindow.open();
    this._actorCommandWindow.setup(null);
    this._actorCommandWindow.close();
    this._partyCommandWindow.setup();
};

Scene_Battle.prototype.commandFight = function() {
    this.selectNextCommand();
};

Scene_Battle.prototype.commandEscape = function() {
    BattleManager.processEscape();
    this.changeInputWindow();
};

Scene_Battle.prototype.startActorCommandSelection = function() {
    this._statusWindow.show();
    this._statusWindow.selectActor(BattleManager.actor());
    this._partyCommandWindow.close();
    this._actorCommandWindow.show();
    this._actorCommandWindow.setup(BattleManager.actor());
};

Scene_Battle.prototype.commandAttack = function() {
    const action = BattleManager.inputtingAction();
    action.setAttack();
    this.onSelectAction();
};

Scene_Battle.prototype.commandSkill = function() {
    this._skillWindow.setActor(BattleManager.actor());
    this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
    this._skillWindow.refresh();
    this._skillWindow.show();
    this._skillWindow.activate();
    this._statusWindow.hide();
    this._actorCommandWindow.hide();
};

Scene_Battle.prototype.commandGuard = function() {
    const action = BattleManager.inputtingAction();
    action.setGuard();
    this.onSelectAction();
};

Scene_Battle.prototype.commandItem = function() {
    this._itemWindow.refresh();
    this._itemWindow.show();
    this._itemWindow.activate();
    this._statusWindow.hide();
    this._actorCommandWindow.hide();
};

Scene_Battle.prototype.commandCancel = function() {
    this.selectPreviousCommand();
};

Scene_Battle.prototype.selectNextCommand = function() {
    BattleManager.selectNextCommand();
    this.changeInputWindow();
};

Scene_Battle.prototype.selectPreviousCommand = function() {
    BattleManager.selectPreviousCommand();
    this.changeInputWindow();
};

Scene_Battle.prototype.startActorSelection = function() {
    this._actorWindow.refresh();
    this._actorWindow.show();
    this._actorWindow.activate();
};

Scene_Battle.prototype.onActorOk = function() {
    const action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this.hideSubInputWindows();
    this.selectNextCommand();
};

Scene_Battle.prototype.onActorCancel = function() {
    this._actorWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
        case "skill":
            this._skillWindow.show();
            this._skillWindow.activate();
            break;
        case "item":
            this._itemWindow.show();
            this._itemWindow.activate();
            break;
    }
};

Scene_Battle.prototype.startEnemySelection = function() {
    this._enemyWindow.refresh();
    this._enemyWindow.show();
    this._enemyWindow.select(0);
    this._enemyWindow.activate();
    this._statusWindow.hide();
};

Scene_Battle.prototype.onEnemyOk = function() {
    const action = BattleManager.inputtingAction();
    action.setTarget(this._enemyWindow.enemyIndex());
    this.hideSubInputWindows();
    this.selectNextCommand();
};

Scene_Battle.prototype.onEnemyCancel = function() {
    this._enemyWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
        case "attack":
            this._statusWindow.show();
            this._actorCommandWindow.activate();
            break;
        case "skill":
            this._skillWindow.show();
            this._skillWindow.activate();
            break;
        case "item":
            this._itemWindow.show();
            this._itemWindow.activate();
            break;
    }
};

Scene_Battle.prototype.onSkillOk = function() {
    const skill = this._skillWindow.item();
    const action = BattleManager.inputtingAction();
    action.setSkill(skill.id);
    BattleManager.actor().setLastBattleSkill(skill);
    this.onSelectAction();
};

Scene_Battle.prototype.onSkillCancel = function() {
    this._skillWindow.hide();
    this._statusWindow.show();
    this._actorCommandWindow.show();
    this._actorCommandWindow.activate();
};

Scene_Battle.prototype.onItemOk = function() {
    const item = this._itemWindow.item();
    const action = BattleManager.inputtingAction();
    action.setItem(item.id);
    $gameParty.setLastItem(item);
    this.onSelectAction();
};

Scene_Battle.prototype.onItemCancel = function() {
    this._itemWindow.hide();
    this._statusWindow.show();
    this._actorCommandWindow.show();
    this._actorCommandWindow.activate();
};

Scene_Battle.prototype.onSelectAction = function() {
    const action = BattleManager.inputtingAction();
    if (!action.needsSelection()) {
        this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.startEnemySelection();
    } else {
        this.startActorSelection();
    }
};

Scene_Battle.prototype.endCommandSelection = function() {
    this.closeCommandWindows();
    this.hideSubInputWindows();
    this._statusWindow.deselect();
    this._statusWindow.show();
};

//-----------------------------------------------------------------------------
// Scene_Gameover
//
// The scene class of the game over screen.

function Scene_Gameover() {
    this.initialize(...arguments);
}

Scene_Gameover.prototype = Object.create(Scene_Base.prototype);
Scene_Gameover.prototype.constructor = Scene_Gameover;

Scene_Gameover.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Gameover.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.playGameoverMusic();
    this.createBackground();
};

Scene_Gameover.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.adjustBackground();
    this.startFadeIn(this.slowFadeSpeed(), false);
};

Scene_Gameover.prototype.update = function() {
    if (this.isActive() && !this.isBusy() && this.isTriggered()) {
        this.gotoTitle();
    }
    Scene_Base.prototype.update.call(this);
};

Scene_Gameover.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    this.fadeOutAll();
};

Scene_Gameover.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    AudioManager.stopAll();
};

Scene_Gameover.prototype.playGameoverMusic = function() {
    AudioManager.stopBgm();
    AudioManager.stopBgs();
    AudioManager.playMe($dataSystem.gameoverMe);
};

Scene_Gameover.prototype.createBackground = function() {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = ImageManager.loadSystem("GameOver");
    this.addChild(this._backSprite);
};

Scene_Gameover.prototype.adjustBackground = function() {
    this.scaleSprite(this._backSprite);
    this.centerSprite(this._backSprite);
};

Scene_Gameover.prototype.isTriggered = function() {
    return Input.isTriggered("ok") || TouchInput.isTriggered();
};

Scene_Gameover.prototype.gotoTitle = function() {
    SceneManager.goto(Scene_Title);
};

//-----------------------------------------------------------------------------
