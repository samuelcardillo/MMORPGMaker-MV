//=============================================================================
// RPG Maker MZ - Alternative Save Screen
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Alternative save/load screen layout.
 * @author Yoji Ojima
 *
 * @help AltSaveScreen.js
 *
 * This plugin changes the layout of the save/load screen.
 * It puts the file list on the top and the details on the bottom.
 *
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc セーブ／ロード画面のレイアウトを変更します。
 * @author Yoji Ojima
 *
 * @help AltSaveScreen.js
 *
 * このプラグインは、セーブ／ロード画面のレイアウトを変更します。
 * ファイル一覧を上側に、詳細を下側に配置します。
 *
 * プラグインコマンドはありません。
 */

(() => {
    const _Scene_File_create = Scene_File.prototype.create;
    Scene_File.prototype.create = function() {
        _Scene_File_create.apply(this, arguments);
        this._listWindow.height = this._listWindow.fittingHeight(3);
        const x = 0;
        const y = this._listWindow.y + this._listWindow.height;
        const width = Graphics.boxWidth;
        const height = Graphics.boxHeight - y;
        const rect = new Rectangle(x, y, width, height);
        const statusWindow = new Window_SavefileStatus(rect);
        this._listWindow.mzkp_statusWindow = statusWindow;
        this.addWindow(statusWindow);
    };

    const _Scene_File_start = Scene_File.prototype.start;
    Scene_File.prototype.start = function() {
        _Scene_File_start.apply(this, arguments);
        this._listWindow.ensureCursorVisible();
        this._listWindow.callUpdateHelp();
    };

    Window_SavefileList.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_SavefileList.prototype.maxCols = function() {
        return 4;
    };

    Window_SavefileList.prototype.itemHeight = function() {
        return this.lineHeight() * 2 + 16;
    };

    const _Window_SavefileList_callUpdateHelp =
        Window_SavefileList.prototype.callUpdateHelp;
    Window_SavefileList.prototype.callUpdateHelp = function() {
        _Window_SavefileList_callUpdateHelp.apply(this, arguments);
        if (this.active && this.mzkp_statusWindow) {
            this.mzkp_statusWindow.setSavefileId(this.savefileId());
        }
    };

    function Window_SavefileStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_SavefileStatus.prototype = Object.create(Window_Base.prototype);
    Window_SavefileStatus.prototype.constructor = Window_SavefileStatus;

    Window_SavefileStatus.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._savefileId = 1;
    };

    Window_SavefileStatus.prototype.setSavefileId = function(id) {
        this._savefileId = id;
        this.refresh();
    };

    Window_SavefileStatus.prototype.refresh = function() {
        const info = DataManager.savefileInfo(this._savefileId);
        const rect = this.contents.rect;
        this.contents.clear();
        this.resetTextColor();
        this.drawTitle(this._savefileId, rect.x, rect.y);
        if (info) {
            this.drawContents(info, rect);
        }
    };

    Window_SavefileStatus.prototype.drawTitle = function(savefileId, x, y) {
        if (savefileId === 0) {
            this.drawText(TextManager.autosave, x, y, 180);
        } else {
            this.drawText(TextManager.file + " " + savefileId, x, y, 180);
        }
    };

    Window_SavefileStatus.prototype.drawContents = function(info, rect) {
        const bottom = rect.y + rect.height;
        const playtimeY = bottom - this.lineHeight();
        this.drawText(info.title, rect.x + 192, rect.y, rect.width - 192);
        this.drawPartyfaces(info.faces, rect.x, bottom - 144);
        this.drawText(info.playtime, rect.x, playtimeY, rect.width, "right");
    };

    Window_SavefileStatus.prototype.drawPartyfaces = function(faces, x, y) {
        if (faces) {
            for (let i = 0; i < faces.length; i++) {
                const data = faces[i];
                this.drawFace(data[0], data[1], x + i * 150, y);
            }
        }
    };
})();
