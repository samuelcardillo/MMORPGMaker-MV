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
    
    const matchPage = data.pages.find(page => page.list.find(l => l.code === 108));
    const comments = matchPage && matchPage.list.filter(l => l.code === 108);
    const matchParameter = comments && comments.find(c => c.parameters.find(p => p.includes('<Name')));
    const npcName = matchParameter && matchParameter.parameters || "<Name: " + data["name"] + ">";
    const spriteName = data._image.characterName;
    const spriteDir = data._image.characterIndex;
    
    MMO_Core_Npcs.Npcs[data.id] = $gameMap.createNormalEventAt(spriteName, spriteDir, data.x, data.y, 2, 0, true, data.pages);
    MMO_Core_Npcs.Npcs[data.id]._stepAnime = data._stepAnime;
    MMO_Core_Npcs.Npcs[data.id]._walkAnime = data._walkAnime;
    MMO_Core_Npcs.Npcs[data.id].setPosition(data.x, data.y);
    // Object.keys(data).filter(k => k.startsWith('_')).map(key => {
    //   console.log('key', key)
    //   if (key === "_moveRoute") return;
    //   MMO_Core_Npcs.Npcs[data.id][key] = data[key]
    // });
    console.log('MMO_Core_Npcs.Npcs[data.id]', MMO_Core_Npcs.Npcs[data.id])
  }

  MMO_Core_Npcs.removeNpc = (data) => {
    if ($gameMap._events.find(event => event && event["_eventId"] === data.eventId)) $gameMap.eraseEvent(data.eventId);
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