//=============================================================================
// MMO_Core_Npcs.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Players
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

function MMO_Core_Npcs() {
  this.initialize.apply(this, arguments);
}

(function () {
  MMO_Core_Npcs.Npcs = {};

  /* npcModel : 
  {
    "id": int | string,
    "_eventId": int,
    "mapId": int,
    "npcData": {
      "name": string,
      "skin": {
        "characterName": string,
        "characterIndex": int,
      },
      "x": int,
      "y": int,
      "moveSpeed": int,
      "moveFrequency": int
      "isEnemy": bool,
      "stats": {
        "maxHp": int,
        "hp": int,
        "maxMp": int,
        "mp": int,
        "atk": int,
        "def": int,
        "mag": int,
        "defMag": int,
        "agi": int,
        "luc": int
      },
      "reward": {
        "exp": int,
        "gold": int,
      },
      "ABS_Props": {
        "level": int,
        "viewRadius": int,
        "tVisor": int,
        "sideVisor": bool,
        "teamId": int,
        "cEonDeath": int,
      }
    }
  } */

  MMO_Core_Npcs.addNpc = (data) => {
    if(MMO_Core_Npcs.Npcs[data.id] !== undefined && $gameMap._events[MMO_Core_Npcs.Npcs[data.id]["_eventId"]] !== undefined) $gameMap.eraseEvent(MMO_Core_Npcs.Npcs[data.id]["_eventId"]);

    MMO_Core_Npcs.Npcs[data.id] = $gameMap.createNormalEventAt(data["npcData"]["skin"]["characterName"], data["npcData"]["skin"]["skin"]["characterIndex"], data["npcData"]["x"], data["npcData"]["y"], 2, 0, true);
    MMO_Core_Npcs.Npcs[data.id].headDisplay = MMO_Core_Npcs.Npcs[data.id].list().push({"code":108,"indent":0,"parameters":["<Player: " + data["npcData"]["name"] + ">"]});
    MMO_Core_Npcs.Npcs[data.id]._priorityType = 1;
    MMO_Core_Npcs.Npcs[data.id]._stepAnime = false;
    MMO_Core_Npcs.Npcs[data.id]._moveSpeed = data["npcData"]["moveSpeed"];
    MMO_Core_Npcs.Npcs[data.id]._moveFrequency = data["npcData"]["moveFrequency"];
  }

  MMO_Core_Npcs.removeNpc = (data) => {
    if(MMO_Core_Npcs.Npcs[data] === undefined) return;
    if($gameMap._events[MMO_Core_Npcs.Npcs[data]["_eventId"]] === undefined) return;
    
    $gameMap.eraseEvent(MMO_Core_Npcs.Npcs[data]["_eventId"]);
  }

  MMO_Core.socket.on("npcs_get", async (data) => {
    for (let id in Object.keys(MMO_Core_Npcs.Npcs)) {
      $gameMap.eraseEvent(MMO_Core_Npcs.Npcs[id]["_eventId"]);
    }
    for (let npc in data.npcs) {
      MMO_Core_Npcs.addNpc(npc);
    }
  });
  
  MMO_Core.socket.on("npc_respawn", (data) => {
    MMO_Core_Npcs.addNpc(data);
    // TODO : play animation
  });

  MMO_Core.socket.on("npc_dead",function(npc,killAuthor){
    // if killAuthor === currentPlayer
    //   TODO : Turn on dead switch for this 
    // else 
    // MMO_Core_Npcs.removeNpc(npc);
  });

  MMO_Core.socket.on("npc_looted",function(data){
    if (!MMO_Core_Npcs.Npcs[data.id]) return;
    MMO_Core_Npcs.removeNpc(data);
  });

  MMO_Core.socket.on("npc_dead",function(data){
    if(MMO_Core_Npcs.Npcs[data] === undefined) return;
    if($gameMap._events[MMO_Core_Npcs.Npcs[data]["_eventId"]] === undefined) return;
    
    $gameMap.eraseEvent(MMO_Core_Npcs.Npcs[data]["_eventId"]);
  });

  // I dont get the point of this
  // MMO_Core.socket.on("refresh_npcs_on_map",function(data){
  //   MMO_Core.socket.emit("refresh_npcs_on_map",{id: data, npcData: MMO_Core_Npc.getNpcPos()});
  // }); 

  MMO_Core.socket.on("refresh_npcs_on_map", function(payload) {
    if(MMO_Core_Npcs.Npcs[payload.npcId] === undefined) return;

    MMO_Core_Npcs.Npcs[payload.npcId]._characterName = payload.npcData["skin"]["characterName"];
    MMO_Core_Npcs.Npcs[payload.npcId]._characterIndex = payload.npcData["skin"]["characterIndex"];

    // If MMO_Overhead exists, we force refresh
    // if(MMO_Overhead) MMO_Overhead.forceRefresh();
  });

  MMO_Core.socket.on('npc_moving', function(data){
    if(!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) return;
    if(MMO_Core_Npcs.Npcs[data.id] === undefined) return;

    // Update movement speed and frequenzy
    MMO_Core_Npcs.Npcs[data.id].setMoveSpeed(data.moveSpeed);
    MMO_Core_Npcs.Npcs[data.id].setMoveFrequency(data.moveFrequency);
    MMO_Core_Npcs.Npcs[data.id].moveStraight(data.direction);
    if (MMO_Core_Npcs.Npcs[data.id].x !== data.x || MMO_Core_Npcs.Npcs[data.id].y !== data.y) MMO_Core_Npcs.Npcs[data.id].setPosition(data.x, data.y);
  });
})();