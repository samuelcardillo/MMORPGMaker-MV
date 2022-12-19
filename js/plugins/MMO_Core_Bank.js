//=============================================================================
// MMO_Core_Bank.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Bank
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 * 
  @command bank
  @text bank
  @desc 

  @arg bankName
  @text Bank Name
  @desc Enter the name of the bank to open
 */

  function MMO_Core_Bank() {
    this.initialize.apply(this, arguments);
  }
  
  function SceneBank() {
    this.initialize.apply(this, arguments);
  }
  
  (function () {
    MMO_Core_Bank.Bank = {};
    MMO_Core_Bank.finalItems = [];
    MMO_Core_Bank.itemCounts = [];
    MMO_Core_Bank.isDeposit = false;
  
    // ---------------------------------------
    // ---------- SCENE MANAGEMENT
    // ---------------------------------------
  
    MMO_Core.socket.on("bank_refresh", bank => {
      if (MMO_Core_Bank.Bank.id !== bank.id) return;
  
      MMO_Core_Bank.Bank = bank;
      MMO_Core_Bank.finalItems = [];
      MMO_Core_Bank.itemCounts = [];
  
      SceneBank.prototype._refreshItems().then(() => {
        SceneBank.prototype._refreshWindows();
        SceneManager._scene._playerGold.refresh($gameParty.gold());
        SceneManager._scene._bankGold.refresh(MMO_Core_Bank.Bank.content.gold);
      });
    })
  
    SceneBank.prototype = Object.create(Scene_MenuBase.prototype);
    SceneBank.prototype.constructor = MMO_Core_Bank;
  
    SceneBank.prototype.initialize = function () {
      Scene_MenuBase.prototype.initialize.call(this);
      this._refreshItems();
    };
  
    SceneBank.prototype._refreshItems = async () => {
      return new Promise(resolve => {
        for (var k in MMO_Core_Bank.Bank.content.items) {
          if (MMO_Core_Bank.Bank.content.items[k] === 0) continue;
          MMO_Core_Bank.finalItems.push($dataItems[k]);
          MMO_Core_Bank.itemCounts.push(MMO_Core_Bank.Bank.content.items[k]);
        }
        for (var k in MMO_Core_Bank.Bank.content.weapons) {
          if (MMO_Core_Bank.Bank.content.weapons[k] === 0) continue;
          MMO_Core_Bank.finalItems.push($dataWeapons[k]);
          MMO_Core_Bank.itemCounts.push(MMO_Core_Bank.Bank.content.weapons[k]);
        }
        for (var k in MMO_Core_Bank.Bank.content.armors) {
          if (MMO_Core_Bank.Bank.content.armors[k] === 0) continue;
          MMO_Core_Bank.finalItems.push($dataArmors[k]);
          MMO_Core_Bank.itemCounts.push(MMO_Core_Bank.Bank.content.armors[k]);
        }
        resolve();
      })
    }
  
    SceneBank.prototype._refreshWindows = function () {
      SceneManager._scene._bankItems.refresh();
      SceneManager._scene._playerItems.refresh();
    }
    
    SceneBank.prototype.messageWindowRect = function() {
      const ww = Graphics.boxWidth;
      const wh = this.calcWindowHeight(4, false) + 8;
      const wx = (Graphics.boxWidth - ww) / 2;
      const wy = 0;
      return new Rectangle(wx, wy, ww, wh);
    };
  
    SceneBank.prototype.create = function () {
      Scene_MenuBase.prototype.create.call(this);
  
      this._bankName = new Window_BankName(new Rectangle((Graphics.boxWidth - 400) / 2, 5, 400, 80), MMO_Core_Bank.Bank.name);
      this._playerGold = new Window_BankGold(75, 520, $gameParty.gold());
      this._bankGold = new Window_BankGold(Graphics.boxWidth - 325, 520, MMO_Core_Bank.Bank.content.gold);
  
      this._bankChoice = new Window_BankChoice(new Rectangle((Graphics.boxWidth - 400) / 2, 85, 400, 80));
      this._bankChoiceDeposit = new Window_BankCommand(new Rectangle(50, 165, 300, 80));
      this._bankChoiceWithdraw = new Window_BankCommand(new Rectangle(Graphics.boxWidth - 350, 165, 300, 80));
  
      this._playerItems = new Window_ActorItems(new Rectangle(0, 215, (Graphics.boxWidth / 2), 320));
      this._bankItems = new Window_BankItems(new Rectangle((Graphics.boxWidth) / 2, 215, (Graphics.boxWidth / 2), 320));
  
      this.addWindow(this._bankName);
      this.addWindow(this._playerGold);
      this.addWindow(this._bankGold);
  
      this._bankChoice.setHandler('deposit', this.commandDeposit.bind(this));
      this._bankChoice.setHandler('withdraw', this.commandWithdraw.bind(this));
      this._bankChoice.setHandler('cancel', this.leaveBank.bind(this));
      this.addWindow(this._bankChoice);
  
      this._bankChoiceDeposit.setHandler('items', this.commandDepositItem.bind(this));
      this._bankChoiceDeposit.setHandler('gold', this.commandDepositGold.bind(this));
      this._bankChoiceDeposit.setHandler('cancel', this.backToChoice.bind(this));
      this.addWindow(this._bankChoiceDeposit);
  
      this._bankChoiceWithdraw.setHandler('items', this.commandWithdrawItem.bind(this));
      this._bankChoiceWithdraw.setHandler('gold', this.commandWithdrawGold.bind(this));
      this._bankChoiceWithdraw.setHandler('cancel', this.backToChoice.bind(this));
      this.addWindow(this._bankChoiceWithdraw);
  
      this._playerItems.setHandler('ok', this.depositItem.bind(this));
      this._playerItems.setHandler('cancel', this.backToChoice.bind(this));
      this.addWindow(this._playerItems);
  
      this._bankItems.setHandler('ok', this.withdrawItem.bind(this));
      this._bankItems.setHandler('cancel', this.backToChoice.bind(this));
      this.addWindow(this._bankItems);
  
      this._bankChoice.activate();
      this._bankChoiceDeposit.deactivate();
      this._bankChoiceWithdraw.deactivate();
  
  
      // this._numberWindow = new Window_NumInput(this._messageWindow);
      // this.addWindow(this._numberWindow);
    
      this._numberWindow = new Window_NumInput();
      // this._numberWindow.setMessageWindow(this._messageWindow);
      this.addWindow(this._numberWindow);
  
      // this._messageWindow.subWindows().forEach((window) => {
      //   this.addWindow(window);
      // }, this);
  
  
  
    }
  
    // Handling the withdraw and deposit of an object (work around)
    SceneBank.prototype.depositItem = function () {
      MMO_Core_Bank.isDeposit = true;
      let item = this._playerItems.item();
      this.transferItem(item);
    }
  
    SceneBank.prototype.messageWindowRect = function () {
      const ww = Graphics.boxWidth;
      const wh = this.calcWindowHeight(4, false) + 8;
      const wx = (Graphics.boxWidth - ww) / 2;
      const wy = 0;
      return new Rectangle(wx, wy, ww, wh);
    };
  
    SceneBank.prototype.withdrawItem = function () {
      MMO_Core_Bank.isDeposit = false;
      let item = this._bankItems.item();
      this.transferItem(item);
    }
  
    SceneBank.prototype.transferItem = function (item) {
      if (!item) return;
  
      let payload = {
        bankId: MMO_Core_Bank.Bank.id,
        itemId: item.id,
        amount: 1
      }
  
      if (DataManager.isItem(item)) payload.itemType = "items";
      if (DataManager.isWeapon(item)) payload.itemType = "weapons";
      if (DataManager.isArmor(item)) payload.itemType = "armors";
  
      if (MMO_Core_Bank.isDeposit) {
        MMO_Core.socket.emit("bank_deposit", payload);
        this._playerItems.activate();
      } else if (!MMO_Core_Bank.isDeposit) {
        MMO_Core.socket.emit("bank_withdraw", payload);
        this._bankItems.activate();
      }
    }
  
    SceneBank.prototype.leaveBank = function () {
      MMO_Core_Bank.Bank = {};
      MMO_Core_Bank.finalItems = [];
      MMO_Core_Bank.itemCounts = [];
      this.popScene();
    }
  
    SceneBank.prototype.commandDeposit = function () {
      this._bankChoice.deactivate();
      this._bankChoiceDeposit.activate();
    };
  
    SceneBank.prototype.commandDepositItem = function () {
      this._playerItems.activate();
      this._playerItems.select(0);
    }
  
    SceneBank.prototype.commandDepositGold = function () {
      MMO_Core_Bank.isDeposit = true;
      this._bankChoiceDeposit.deactivate();
      this._numberWindow.start();
    }
  
    SceneBank.prototype.commandWithdraw = function () {
      this._bankChoice.deactivate();
      this._bankChoiceWithdraw.activate();
    };
  
    SceneBank.prototype.commandWithdrawItem = function () {
      this._bankItems.activate();
      this._bankItems.select(0);
    }
  
    SceneBank.prototype.commandWithdrawGold = function () {
      MMO_Core_Bank.isDeposit = false;
      this._bankChoiceWithdraw.deactivate();
      this._numberWindow.start();
    }
  
    SceneBank.prototype.backToChoice = function () {
      this._bankChoice.activate();
    };
  
    // Overall system
    function Window_BankName() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BankName.prototype = Object.create(Window_Base.prototype);
    Window_BankName.prototype.constructor = Window_BankName;
  
    Window_BankName.prototype.initialize = function (rectangle, text) {
      Window_Base.prototype.initialize.call(this, rectangle);
      var textWidth = this.drawTextEx(text, -rectangle.width, 0);
      this.drawTextEx(text, (rectangle.width / 2) - (textWidth / 2) - 10, 0);
    };
  
    function Window_BankChoice() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BankChoice.prototype = Object.create(Window_HorzCommand.prototype);
    Window_BankChoice.prototype.constructor = Window_BankChoice;
  
    Window_BankChoice.prototype.initialize = function (x, y, width) {
      this._windowWidth = width;
      Window_HorzCommand.prototype.initialize.call(this, x, y);
    };
  
    Window_BankChoice.prototype.windowWidth = function () {
      return this._windowWidth;
    };
  
    Window_BankChoice.prototype.maxCols = function () {
      return 2;
    };
  
    Window_BankChoice.prototype.makeCommandList = function () {
      this.addCommand('Deposit', 'deposit');
      this.addCommand('Withdraw', 'withdraw');
    };
  
    function Window_BankCommand() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BankCommand.prototype = Object.create(Window_HorzCommand.prototype);
    Window_BankCommand.prototype.constructor = Window_BankCommand;
  
    Window_BankCommand.prototype.initialize = function (x, y, width) {
      this._windowWidth = width;
      Window_HorzCommand.prototype.initialize.call(this, x, y);
    };
  
    Window_BankCommand.prototype.windowWidth = function () {
      return this._windowWidth;
    };
  
    Window_BankCommand.prototype.maxCols = function () {
      return 2;
    };
  
    Window_BankCommand.prototype.makeCommandList = function () {
      this.addCommand('Objects', 'items');
      this.addCommand('Gold', 'gold');
    };
  
    function Window_BankGold() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BankGold.prototype = Object.create(Window_Base.prototype);
    Window_BankGold.prototype.constructor = Window_BankGold;
  
    Window_BankGold.prototype.initialize = function (x, y, value) {
      var width = this.windowWidth();
      var height = this.windowHeight();
      Window_Base.prototype.initialize.call(this, new Rectangle(x, y, width, height));
      this.refresh(value);
    };
  
    Window_BankGold.prototype.windowWidth = function () {
      return 240;
    };
  
    Window_BankGold.prototype.windowHeight = function () {
      return this.fittingHeight(1);
    };
  
    Window_BankGold.prototype.refresh = function (value) {
      var x = this.itemPadding();
      var width = this.contents.width - this.itemPadding() * 2;
      this.contents.clear();
      this.drawCurrencyValue(value, TextManager.currencyUnit, x, 0, width);
    };
  
    // Player side
    function Window_ActorItems() {
      this.initialize.apply(this, arguments);
    }
  
    Window_ActorItems.prototype = Object.create(Window_ItemList.prototype)
    Window_ActorItems.prototype.constructor = Window_ActorItems;
  
    Window_ActorItems.prototype.initialize = function (x, y, width, height) {
      Window_ItemList.prototype.initialize.call(this, x, y, width, height);
      this.refresh();
      Window_Selectable.prototype.refresh.call(this);
    }
  
    Window_ActorItems.prototype.refresh = function () {
      this._data = $gameParty.allItems();
      this.createContents();
      this.drawAllItems();
    }
  
    Window_ActorItems.prototype.isCurrentItemEnabled = function () {
      return true;
    }
  
    // Bank side
    function Window_BankItems() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BankItems.prototype = Object.create(Window_ItemList.prototype)
    Window_BankItems.prototype.constructor = Window_BankItems;
  
    Window_BankItems.prototype.initialize = function (x, y, width, height) {
      Window_ItemList.prototype.initialize.call(this, x, y, width, height);
      this.refresh();
      // this.resetScroll();
    }
  
    Window_BankItems.prototype.refresh = function () {
      this._data = MMO_Core_Bank.finalItems;
      this._counts = MMO_Core_Bank.itemCounts;
      this.createContents();
      this.drawAllItems();
    }
  
    Window_BankItems.prototype.drawItem = function (index) {
      var item = this._data[index];
      var count = this._counts[index];
      if (item) {
        var numberWidth = this.numberWidth();
        var rect = this.itemRect(index);
        rect.width -= this.itemPadding();
        this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
        this.drawItemNumber(count, rect.x, rect.y, rect.width);
      }
    };
  
    Window_BankItems.prototype.drawItemNumber = function (amount, x, y, width) {
      if (this.needsNumber()) {
        this.drawText(':', x, y, width - this.textWidth('00'), 'right');
        this.drawText(amount, x, y, width, 'right');
      }
    };
  
    Window_BankItems.prototype.isCurrentItemEnabled = function () {
      return true;
    }
  
    // Gold input
    // function Scene_Message() {
    //   this.initialize(...arguments);
    // }
  
    // Scene_Message.prototype = Object.create(Scene_Base.prototype);
    // Scene_Message.prototype.constructor = Scene_Message;
  
    function Window_NumInput() {
      this.initialize(...arguments);
    }
  
    Window_NumInput.prototype = Object.create(Window_NumberInput.prototype);
    Window_NumInput.prototype.constructor = Window_NumInput;
  
    Window_NumInput.prototype.initialize = function() {
      console.dir(this);
      Window_Selectable.prototype.initialize.call(this, new Rectangle(0,0,100,100));
      this._number = 0;
      this._maxDigits = 1;
      this.openness = 0;
      this.createButtons();
      this.deactivate();
      this._canRepeat = false;
    };
  
      function Window_NumInput() {
        this.initialize.apply(this, arguments);
      }
  
      Window_NumInput.prototype = Object.create(Window_NumberInput.prototype);
      Window_NumInput.prototype.constructor = Window_NumInput;
  
      Window_NumInput.prototype.start = function() {
        this._maxDigits = 3;
        this._number = 0;
        this.updatePlacement();
        this.placeButtons();
        // this.updateButtonsVisiblity();
        this.createContents();
        this.refresh();
        this.open();
        this.activate();
        this.select(0);
      };
  
      Window_NumInput.prototype.updatePlacement = function() {
        console.dir(this);
        this._messageWindow = {
          height: 4,
          y: 4
        }
        const messageY = this._messageWindow.y;
        const spacing = 8;
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.x = (Graphics.boxWidth - this.width) / 2;
        if (messageY >= Graphics.boxHeight / 2) {
            this.y = messageY - this.height - spacing;
        console.log("atas");
        } else {
            this.y = messageY + this._messageWindow.height + spacing;
        }
      console.log(this.windowWidth(), this.windowHeight());
    };
  
      Window_NumInput.prototype.changeDigit = function(up) {
        var index = this.index();
        var place = Math.pow(10, this._maxDigits - 1 - index);
        var n = Math.floor(this._number / place) % 10;
        this._number -= n * place;
        if (up) {
            n = (n + 1) % 10;
        } else {
            n = (n + 9) % 10;
        }
        this._number += n * place;
  
        if (this._number > $gameParty.gold() && MMO_Core_Bank.isDeposit) {
          this._number = $gameParty.gold();
        } else if (this._number > MMO_Core_Bank.Bank.content.gold && !MMO_Core_Bank.isDeposit) {
          this._number = MMO_Core_Bank.Bank.content.gold;
        }
  
        this.refresh();
        SoundManager.playCursor();
      };
  
      Window_NumInput.prototype.processOk = function() {
        let goldAmount = this._number;
        let payload = {
          bankId: MMO_Core_Bank.Bank.id,
          gold: goldAmount
        }
  
        if(MMO_Core_Bank.isDeposit) MMO_Core.socket.emit("bank_deposit", payload);
        else MMO_Core.socket.emit("bank_withdraw", payload);
  
        // SoundManager.playOk();
        $gameVariables.setValue($gameMessage.numInputVariableId(), this._number);
        this.updateInputData();
        this.deactivate();
        this.close();
        SceneManager._scene._bankChoice.activate();
      };
  
    // ---------------------------------------
    // ---------- SOCKET EVENTS
    // ---------------------------------------
    MMO_Core.socket.on("bank_open", details => {
      MMO_Core_Bank.Bank = details;
      SceneManager.push(SceneBank);
    })
  
    // ---------------------------------------
    // ---------- Exposed Functions
    // ---------------------------------------
    MMO_Core_Bank.open = function (bankName) {
      MMO_Core.socket.emit("bank_open", bankName);
    }
  
    PluginManager.registerCommand('MMO_Core_Bank', 'bank', function (args) {
      if (args.bankName) { MMO_Core_Bank.open(args.bankName); }
    });
  
  
  })();
