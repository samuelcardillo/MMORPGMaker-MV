//=============================================================================
// MMO_Core_Npcs.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Sync NPCs
 * @author Axel Fiolle
 *
 * @help This plugin does not provide plugin commands.
 */

function MMO_Core_Npcs() {
  this.initialize.apply(this, arguments);
}

(function () {
  MMO_Core_Npcs.Npcs = {};

  /* npcModel : 
    ConnectedNpc: {
      uniqueId: string, // `@${instance.id}#${instance.npcsOnMap.length}?${npc.id}` // Every NPC has to be clearly differentiable
      eventId: number, // Event "ID" client-side
      absId: number || null, // Help to resolve PKD logic
      lastActionTime: Date,
      lastMoveTime: Date,
      x: number,
      y: number,
      _conditions: [Object],
      _directionFix: boolean,
      _image: Object,
      _list: [Object],
      _moveFrequency: number,
      _moveRoute: Object,
      _moveSpeed: number,
      _moveType: number,
      _priorityType: number,
      _stepAnime: boolean,
      _through: boolean,
      _trigger: number,
      _walkAnime: boolean
    }
  */

  MMO_Core_Npcs.addNpc = (data) => {
    if ($gameMap._events && $gameMap._events.find(event => event && event["_eventId"] === data.eventId)) {
      $gameMap.eraseEvent(data.eventId);
    }
    
    // Object.keys(data).map(key => {
    //   if (key.includes('_')) {
    //     data[key.split('_')[1]] = data[key];
    //   }
    // })
    
    console.log("data", data)
    MMO_Core_Npcs.Npcs[data.id] = $gameMap.createNormalEventAt(data._image.characterName, data.x, data.y, data._image.direction, 0, true);
    MMO_Core_Npcs.Npcs[data.id].headDisplay = MMO_Core_Npcs.Npcs[data.id].list().push({"code":108,"indent":0,"parameters":["<Name: " + data["name"] + ">"]});
    MMO_Core_Npcs.Npcs[data.id].setPosition(data.x, data.y);
    console.log('MMO_Core_Npcs.Npcs[data.id]', MMO_Core_Npcs.Npcs[data.id])
  }

  MMO_Core_Npcs.removeNpc = (data) => {
    if(MMO_Core_Npcs.Npcs[data] === undefined) return;
    if($gameMap._events[MMO_Core_Npcs.Npcs[data]["_eventId"]] === undefined) return;
    
    $gameMap.eraseEvent(MMO_Core_Npcs.Npcs[data]["_eventId"]);
  }

  MMO_Core.socket.on("npcsFetched", async (data) => {
    if (data.playerId === MMO_Core_Player.Player["id"]) data.npcs.map(npc => MMO_Core_Npcs.addNpc(npc));
  });

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

  MMO_Core.socket.on("npc_looted",function(data){
    if (!MMO_Core_Npcs.Npcs[data.id]) return;
    MMO_Core_Npcs.removeNpc(data);
  });

  MMO_Core.socket.on("npc_dead",function(data){
    MMO_Core_Npcs.removeNpc(data);
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