//=============================================================================
// MMO_Core_Party.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Parties
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

function MMO_Core_Party() { 
  this.initialize.apply(this, arguments);
}

(function() {
  MMO_Core_Party.Party    = [];

  MMO_Core_Party.processOk = Window_MenuStatus.prototype.processOk;   
  Window_MenuStatus.prototype.processOk = function() {

    // Block equiping stuff to other party members (and skills)
    if(this.index() > 0 && SceneManager._scene._commandWindow._index !== 3) {
      this.deselect()
      SoundManager.playBuzzer();
      SceneManager.goto(Scene_Menu);
      return;
    }

    MMO_Core_Party.processOk.call(this);
  }

  // Block using items on other party members
  MMO_Core_Party.onActorOk = Scene_ItemBase.prototype.onActorOk;   
  Scene_ItemBase.prototype.onActorOk = function() {
    if(this._actorWindow._index > 0) {
      SoundManager.playBuzzer();
      SceneManager.goto(Scene_Menu);
      return;
    }

    MMO_Core_Party.onActorOk.call(this);
  }

  MMO_Core.socket.on("refresh_party_data", async function(payload) {
    if(payload[MMO_Core_Player.Player.username]) {
      MMO_Core_Player.isCombatInitiator = (payload[MMO_Core_Player.Player.username].isInitiator) ? true : false;
      MMO_Core_Player.Player.isInCombat = (payload[MMO_Core_Player.Player.username].isInCombat) ? true : false;
    }

    delete payload[MMO_Core_Player.Player.username];

    let partySize = Object.keys(payload).length; // If no one = 1
    let currentPartySize = $gameParty.size(); // If no one = 1

    MMO_Core_Party.Party = [];

    // We delete all the actors for refreshing the party
    if(currentPartySize > 1 && partySize < currentPartySize) {
      for(var i = 2; i <= currentPartySize; i++) {
        $gameParty.removeActor(i);

        if(i === currentPartySize) MMO_Core_Player.refreshStats();
      }
    }

    if(partySize > 0) {
      for(var i = 0; i <= partySize; i++) {
        if(i === partySize) return MMO_Core_Player.refreshStats();

        let playerName = Object.keys(payload)[i];
        $gameActors.actor(i+2)._hidden = false;
        
        // We push the party members in the party Array.
        MMO_Core_Party.Party.push(payload[playerName]);
             
        
        $gameParty.addActor(i+2);

        // If we are in a battle and that a party member is not on the map, we don't add it in the battle.        
        if(payload[playerName].isInCombat && payload[playerName].mapId !== $gameMap._mapId) {
          $gameActors.actor(i+2).hide();
        }        
      }
    }
  });

  MMO_Core_Party.refreshPartyStats = async function() { 
    if(MMO_Core_Party.Party.length === 0) return;

    for(var i = 0; i < MMO_Core_Party.Party.length; i++) {
      if(!$gameActors["_data"][i+2]) { continue; }

      if(MMO_Core_Player.Player.isInCombat && !MMO_Core_Party.Party[i].isInCombat) {
        $gameActors["_data"][i+2].hide();
      }

      $gameActors["_data"][i+2]._name = MMO_Core_Party.Party[i]["username"];
      $gameActors["_data"][i+2]._level = MMO_Core_Party.Party[i]["stats"]["level"];
      $gameActors["_data"][i+2]._exp = MMO_Core_Party.Party[i]["stats"]["exp"]
      $gameActors["_data"][i+2]._classId = MMO_Core_Party.Party[i]["stats"]["classId"]
      $gameActors["_data"][i+2]._skills = MMO_Core_Party.Party[i]["stats"]["skills"]
      $gameActors["_data"][i+2]._hp = MMO_Core_Party.Party[i]["stats"]["hp"]
      $gameActors["_data"][i+2]._mp = MMO_Core_Party.Party[i]["stats"]["mp"]
      $gameActors["_data"][i+2].initEquips(MMO_Core_Party.Party[i]["stats"]["equips"]);
      $gameActors["_data"][i+2]["_battlerName"] = MMO_Core_Party.Party[i]["skin"]["battlerName"];
      $gameActors["_data"][i+2]["_faceName"] = MMO_Core_Party.Party[i]["skin"]["faceName"];
      $gameActors["_data"][i+2]["_faceIndex"] = MMO_Core_Party.Party[i]["skin"]["faceIndex"];
    }
  }
})();