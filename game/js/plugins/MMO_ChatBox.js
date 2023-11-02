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
 * @option TOP CENTER
 * @option TOP RIGHT
 * @option BOTTOM LEFT
 * @option BOTTOM CENTER
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

    if(!ChatBox.isGenerated) {
      if (!document.getElementById('GameCanvas')) setTimeout(() => {}, 1000);
      return ChatBox.generate();
    }
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
    let offsetBottom  = canvas.offseBottom;

    let chatboxInput = document.querySelector("#chatbox_input");
    let chatboxBox = document.querySelector("#chatbox_box");
    
    switch (this.Parameters["chatPosition"]) {
      /* Note for CENTER positions : 
       * 50vw always is half the screen width, 
       * 169 is half the box width */
      case "TOP LEFT":
        chatboxInput.style.left = (offsetLeft + 8) + "px";
        chatboxInput.style.top = (offsetTop + 116) + "px";
        chatboxBox.style.left = (offsetLeft + 8) + "px";
        chatboxBox.style.top = (offsetTop + 8) + "px";
        break;
      case "TOP CENTER":
        chatboxInput.style.left = "calc(50vw - 169px)"; 
        chatboxInput.style.top = (offsetTop + 116) + "px";
        chatboxBox.style.left = "calc(50vw - 169px)"; 
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
      case "BOTTOM CENTER":
        chatboxInput.style.left = "50vw";
        chatboxInput.style.bottom = (offsetTop + 59) + "px";
        chatboxInput.style.transform = "translateX(-50%)";
        
        chatboxBox.style.left = "50vw"; 
        chatboxBox.style.bottom = (offsetTop + 85) + "px";
        chatboxBox.style.transform = "translateX(-50%)";
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

  function blurOnMove(elem, blurredOpacity = 0.2) {
    document.body.addEventListener('keydown', () => {
      setTimeout(() => {
        if ($gamePlayer.isMoving()) elem.style.opacity = blurredOpacity;
      }, 500);
    });
    document.body.addEventListener('keyup', () => {
      setTimeout(() => {
        if (!$gamePlayer.isMoving()) elem.style.opacity = 1;
      }, 500);
    });
  }
  
  // Generate the main chatbox that contains messages
  function generateTextField() {
    let textField = document.createElement('input');
    textField.id                    = 'chatbox_input';
    textField.type                  = 'text';
    textField.placeholder           = "Press Enter to talk";
    textField.style.position        = 'absolute';
    textField.style.width           = 'calc(50vw - 13px)';
    textField.style.maxWidth        = '437px';
    textField.style.minWidth        = '338px';
    textField.style.height          = '20px';
    textField.style.zIndex          = "1000";
    textField.style.color           = "#fafafa";
    textField.style.paddingLeft     = "8px";
    textField.style.backgroundColor = 'rgba(0,0,0,0.6)';
    textField.style.transition      = "opacity .3s ease";
    textField.style.cursor          = 'pointer';
    textField.style.borderColor     = textField.style.backgroundColor;
    textField.addEventListener('keydown', function(e){sendMessage(e)});
    textField.addEventListener('touchstart', function(e){handleTouch(e)});
    textField.addEventListener('focus', function(e){handleFocus(e)});
    textField.addEventListener('focusout', function(e){handleFocus(e)});
    document.body.appendChild(textField);
    blurOnMove(textField,0);
  }

  // Generate the textbox
  function generateTextBox() {
    let textBox = document.createElement('div');
    textBox.id                    = 'chatbox_box';
    textBox.style.position        = 'absolute';
    textBox.style.width           = '50vw';
    textBox.style.maxWidth        = '450px';
    textBox.style.minWidth        = '338px';
    textBox.style.height          = '44px';
    textBox.style.zIndex          = "1000";
    textBox.style.overflowY       = "auto";
    textBox.style.borderRadius    = "3px";
    textBox.style.color           = "#fafafa";
    textBox.style.backgroundColor = 'rgba(0,0,0,0.3)';
    textBox.style.transition      = "opacity .3s ease";
    textBox.style.pointerEvents   = "none";
    textBox.style.transition      = 'all .1s ease-out';
    textBox.style.borderColor     = textBox.style.backgroundColor;
    document.body.appendChild(textBox);
    let textZone = document.createElement('div');
    textZone.id                   = 'text_container';
    textZone.style.position       = 'absolute';
    textZone.style.bottom         = '0';
    textZone.style.width          = '100%';
    textBox.appendChild(textZone);
    blurOnMove(textBox);
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
    ChatBox.toggle(); setTimeout(() => ChatBox.toggle(), 1);

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
    document.querySelector("#chatbox_box").style.backgroundColor = (ChatBox.isFocused) ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)';
    document.querySelector("#chatbox_box").style.height = (ChatBox.isFocused) ? '164px' : '44px';
    document.querySelector("#chatbox_box").style.pointerEvents = (ChatBox.isFocused) ? 'initial' : 'none';
    document.querySelector("#chatbox_box").scrollTop = document.querySelector("#chatbox_box").scrollHeight;
    
    freezePlayer(ChatBox.isFocused);
    
    if(!ChatBox.isFocused) MMO_Core.allowTouch = true;

    MMO_Core_Player.updateBusy((ChatBox.isFocused) ? "écrit..." : false)
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
  MMO_Core.socket.on("new_message", async function(messageData) {
    let span = document.createElement("div");
        span.style.display     = "flex";
        span.style.padding     = '2px';
        span.style.color       = messageData.color;
        span.style.paddingLeft = '8px';
        span.style.fontWeight  = '200';
        span.style.fontFamily  = 'monoscape';

    const d = new Date();
    const time = ( d.getHours().toString().length == 2 ? d.getHours() : '0' + d.getHours() )  
                  + ':' + 
                  ( d.getMinutes().toString().length == 2 ? d.getMinutes() : '0' + d.getMinutes() );
    let message = document.createTextNode(time + " [" + messageData["username"] + "] " + messageData["msg"]);
    console.log(span,message);

    span.appendChild(message); 
    if (document.querySelector("#text_container")) document.querySelector("#text_container").appendChild(span);
    if (document.querySelector("#chatbox_box")) document.querySelector("#chatbox_box").scrollTop = document.querySelector("#chatbox_box").scrollHeight;

    if(!ChatBox.isFocused) {
      if (document.querySelector("#chatbox_input")) document.querySelector("#chatbox_input").blur();
    }
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
