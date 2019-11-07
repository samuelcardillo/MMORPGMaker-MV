//=============================================================================
// MMO_ChatBox.js
//=============================================================================

/*:
 * @plugindesc Chatbox form
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

 var ChatBox = undefined;

(function() {
  ChatBox = function() {
  }

  ChatBox.generate = function() {
    generateTextField();
    generateTextBox();
  }

  // Private function
  function generateTextField() {
    var textField = document.createElement('input');
    textField.id                    = 'input1';
    textField.type                  = 'text';
    textField.style.position        = 'absolute';
    textField.style.left            = '8px';
    textField.style.bottom          = '8px';
    textField.style.width           = '287px';
    textField.style.height          = '20px';
    textField.style.zIndex          = "1000";
    textField.style.color           = "#fafafa";
    textField.style.paddingLeft     = "8px";
    textField.style.backgroundColor = 'rgba(0,0,0,0.6)';
    textField.style.borderColor     = textField.style.backgroundColor;
    textField.addEventListener('keydown', function(e){sendMessage(e)});
    document.body.appendChild(textField);
  }

  function generateTextBox() {
    var textBox = document.createElement('div');
    textBox.id                    = 'textBox1';
    textBox.style.position        = 'absolute';
    textBox.style.left            = '8px';
    textBox.style.bottom          = '36px';
    textBox.style.width           = '300px';
    textBox.style.height          = '100px';
    textBox.style.zIndex          = "1000";
    textBox.style.overflowY       = "scroll";
    textBox.style.color           = "#fafafa";
    textBox.style.backgroundColor = 'rgba(0,0,0,0.6)';
    textBox.style.borderColor     = textBox.style.backgroundColor;
    document.body.appendChild(textBox);
  }

  function sendMessage(e) {
    if(e.keyCode != 13) return;

    socket.emit("new_message",document.querySelector("#input1").value);
    document.querySelector("#input1").value = "";
  }

  socket.on("new_message",function(messageData){
    var span = document.createElement("span");
        span.style.display     = "block";
        span.style.padding     = '2px';
        span.style.paddingLeft = '8px';
        span.style.fontWeight  = '200';
        span.style.fontFamily  = 'monoscape';

    var message = document.createTextNode(messageData["username"] + ": " + messageData["msg"]);

    span.appendChild(message); 
    document.querySelector("#textBox1").appendChild(span);
    document.querySelector("#textBox1").scrollTop = document.querySelector("#textBox1").scrollHeight;
  })
})();