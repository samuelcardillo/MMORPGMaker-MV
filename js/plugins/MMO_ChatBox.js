//=============================================================================
// MMO_ChatBox.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - ChatBox
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 * 
 * @param chatPosition
 * @text Position of the chat
 * @type combo
 * @option TOP LEFT
 * @option TOP RIGHT
 * @option BOTTOM LEFT
 * @option BOTTOM RIGHT
 * @default TOP LEFT
 */

function ChatBox() { 
  this.initialize.apply(this, arguments);
}

(function() {
  ChatBox.moveByInput = Game_Player.prototype.moveByInput;
  
  ChatBox.Parameters = PluginManager.parameters('MMO_ChatBox');

  ChatBox.isGenerated = false;
  ChatBox.isVisible = false;
  ChatBox.isFocused = false;

  // ---------------------------------------
  // ---------- Native Functions Extending
  // ---------------------------------------

  // Handling the window resizing
  window.addEventListener('resize', function(){
    if(!ChatBox.isGenerated || !ChatBox.isVisible) return;

    ChatBox.resize(); // Resize the chatbox
  }, true);

  // Handle the first generation of the chatbox & when reentering a map scene
  ChatBox.onMapLoaded = Scene_Map.prototype.onMapLoaded;
  Scene_Map.prototype.onMapLoaded = function() {
    ChatBox.onMapLoaded.call(this);

    if(!ChatBox.isGenerated) return ChatBox.generate();
    if(!ChatBox.isVisible) return ChatBox.toggle();
  }

  // Handle the toggle of the chatbox in case of battle or menu
  ChatBox.changeScene = SceneManager.changeScene;
  SceneManager.changeScene = function() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if(SceneManager._nextScene instanceof Scene_Map) {
        ChatBox.isVisible = false;
        ChatBox.toggle();
      } else {
        ChatBox.isVisible = true;
        ChatBox.toggle();
      }
    }
    ChatBox.changeScene.call(this);
  }

  // Handle the toggle of the chatbox in case of dialogue with NPC
  ChatBox.startMessage = Window_Message.prototype.startMessage;
  Window_Message.prototype.startMessage = function() {
    ChatBox.toggle();
    ChatBox.startMessage.call(this);
  }

  // Handle the toggle of the chatbox in case of dialogue with NPC
  ChatBox.terminateMessage = Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function() {
    ChatBox.toggle();
    ChatBox.terminateMessage.call(this);
  }

  // ---------------------------------------
  // ---------- Exposed Functions
  // ---------------------------------------

  // Generate the chatbox
  ChatBox.generate = function() {
    generateTextField();
    generateTextBox();
    this.resize();

    this.isGenerated = true;
    this.isVisible = true;
  };

  // Toggle the chatbox
  ChatBox.toggle = function() {
    if(document.querySelector("#chatbox_box") === null) return;

    let state = (this.isVisible) ? "hidden" : "visible";
    let chatboxInput = document.querySelector("#chatbox_input");
    let chatboxBox = document.querySelector("#chatbox_box");
    chatboxInput.style.visibility = state;
    chatboxBox.style.visibility = state;
    this.isVisible = !this.isVisible;
  }

  // Resize the chatbox following predefined parameters
  ChatBox.resize = function() {
    let canvas = document.querySelector("canvas");
    let offsetTop     = canvas.offsetTop;
    let offsetLeft  = canvas.offsetLeft;

    let chatboxInput = document.querySelector("#chatbox_input");
    let chatboxBox = document.querySelector("#chatbox_box");
    
    switch (this.Parameters["chatPosition"]) {
      case "TOP LEFT":
        chatboxInput.style.left = (offsetLeft + 8) + "px";
        chatboxInput.style.top = (offsetTop + 116) + "px";
        chatboxBox.style.left = (offsetLeft + 8) + "px";
        chatboxBox.style.top = (offsetTop + 8) + "px";
        break;
      case "TOP RIGHT":
        chatboxInput.style.right = (offsetLeft + 8) + "px";
        chatboxInput.style.top = (offsetTop + 116) + "px";
        chatboxBox.style.right = (offsetLeft + 8) + "px";
        chatboxBox.style.top = (offsetTop + 8) + "px";
        break;
      case "BOTTOM LEFT":
        chatboxInput.style.left = (offsetLeft + 8) + "px";
        chatboxInput.style.bottom = (offsetTop + 8) + "px";
        chatboxBox.style.left = (offsetLeft + 8) + "px";
        chatboxBox.style.bottom = (offsetTop + 36) + "px";
        break;
      case "BOTTOM RIGHT":
        chatboxInput.style.right = (offsetLeft + 8) + "px";
        chatboxInput.style.bottom = (offsetTop + 8) + "px";
        chatboxBox.style.right = (offsetLeft + 8) + "px";
        chatboxBox.style.bottom = (offsetTop + 36) + "px";
        break;
    }
  }

  // ---------------------------------------
  // ---------- Private Functions
  // ---------------------------------------

  // Generate the main chatbox that contains messages
  function generateTextField() {
    let textField = document.createElement('input');
    textField.id                    = 'chatbox_input';
    textField.type                  = 'text';
    textField.style.position        = 'absolute';
    textField.style.width           = '325px';
    textField.style.height          = '20px';
    textField.style.zIndex          = "1000";
    textField.style.color           = "#fafafa";
    textField.style.paddingLeft     = "8px";
    textField.style.backgroundColor = 'rgba(0,0,0,0.6)';
    textField.style.borderColor     = textField.style.backgroundColor;
    textField.addEventListener('keydown', function(e){sendMessage(e)});
    textField.addEventListener('touchstart', function(e){handleTouch(e)});
    textField.addEventListener('focus', function(e){handleFocus(e)});
    textField.addEventListener('focusout', function(e){handleFocus(e)});
    document.body.appendChild(textField);
  }

  // Generate the textbox
  function generateTextBox() {
    let textBox = document.createElement('div');
    textBox.id                    = 'chatbox_box';
    textBox.style.position        = 'absolute';
    textBox.style.width           = '338px';
    textBox.style.height          = '150px';
    textBox.style.zIndex          = "1000";
    textBox.style.overflowY       = "hidden";
    textBox.style.borderRadius    = "8px";
    textBox.style.color           = "#fafafa";
    textBox.style.backgroundColor = 'rgba(0,0,0,0.6)';
    textBox.style.borderColor     = textBox.style.backgroundColor;
    document.body.appendChild(textBox);
  }

  // Handle sending message
  function sendMessage(e) {
    if(e.keyCode !== undefined && e.keyCode != 13) return;
    if(e.keyCode === undefined && e !== "touch") return;

    let message = document.querySelector("#chatbox_input").value;
    if(message.length <= 0) return;

    MMO_Core.sendMessage(message);
    document.querySelector("#chatbox_input").value = "";
    document.querySelector("#chatbox_input").blur();

    document.querySelector("#chatbox_box").scrollTop = document.querySelector("#chatbox_box").scrollHeight;    
  }

  // Handle touch events from mobile
  function handleTouch() {
    MMO_Core.allowTouch = false;           
  }

  // Handle focus on the chatbox
  function handleFocus(e) {
    ChatBox.isFocused = !ChatBox.isFocused;

    document.querySelector("#chatbox_box").scrollTop = document.querySelector("#chatbox_box").scrollHeight;

    (ChatBox.isFocused) ? $gameSystem.disableMenu() : $gameSystem.enableMenu();
    document.querySelector("#chatbox_box").style.overflowY = (ChatBox.isFocused) ? "scroll" : "hidden";
    document.querySelector("#chatbox_box").style.backgroundColor = (ChatBox.isFocused) ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)';
    
    freezePlayer(ChatBox.isFocused);
    
    if(!ChatBox.isFocused) MMO_Core.allowTouch = true;

    MMO_Core_Player.updateBusy((ChatBox.isFocused) ? "writing" : false)
  }

  function freezePlayer(freezePlayer) {
    if(freezePlayer) { 
      $gamePlayer.moveByInput = function(){ return false; }  
    } else {
      $gamePlayer.moveByInput = ChatBox.moveByInput;
    }
  }

  // ---------------------------------------
  // ---------- MMO_Core.sockets Handling
  // ---------------------------------------

  // Handle new messages
  MMO_Core.socket.on("new_message",function(messageData){
    let span = document.createElement("span");
        span.style.display     = "block";
        span.style.padding     = '2px';
        span.style.color       = messageData.color;
        span.style.paddingLeft = '8px';
        span.style.fontWeight  = '200';
        span.style.fontFamily  = 'monoscape';

    let message = document.createTextNode(messageData["username"] + ": " + messageData["msg"]);

    span.appendChild(message); 
    document.querySelector("#chatbox_box").appendChild(span);

    if(!ChatBox.isFocused) document.querySelector("#chatbox_box").scrollTop = document.querySelector("#chatbox_box").scrollHeight;
	document.querySelector("#chatbox_input").blur();
  })

  document.addEventListener('keydown', function(e) {
    if(!ChatBox.isGenerated) return;

    switch (e.keyCode) {
      case 119:
        ChatBox.toggle();
        break;
      case 13:
        if(!ChatBox.isFocused) {
          document.querySelector("#chatbox_input").focus(); 
        } else {
          document.querySelector("#chatbox_input").blur();
        }
        break;
    }
  })
})();
