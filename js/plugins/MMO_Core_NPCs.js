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
      uniqueId: string, // `@${instance.id}#${instance.connectedNpcs.length}?${npc.id}` // Every NPC has to be clearly differentiable
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
      _walkAnime: boolean,
      _selectedPageIndex: number
    }
  */

  // helpers :
  MMO_Core_Npcs.findConnectedNpc  = (npc) => npc && MMO_Core_Npcs.findNpcBy("uniqueId",npc.uniqueId);
  MMO_Core_Npcs.findMapNpc        = (npc) => npc && MMO_Core_Npcs.findNpcBy("_eventId",npc.eventId);
  MMO_Core_Npcs.isNpcFromGameMap  = (npc) => npc && JSON.stringify(npc).includes('<Sync>');

  MMO_Core_Npcs.findNpcBy = (name,prop) => {
    if (!$gameMap || !name || !prop) return
    return $gameMap._events.find(event => event && event._eventData && event._eventData[name] && event._eventData[name] === prop);
  }
  
  MMO_Core_Npcs.addNpc = (data) => {
    const spriteName = data._image.characterName;
    const spriteDir = data._image.characterIndex;
    
    MMO_Core_Npcs.Npcs[data.id] = $gameMap.createNormalEventAt(spriteName, spriteDir, data.x, data.y, 2, 0, true, data.pages, data.uniqueId);
    MMO_Core_Npcs.Npcs[data.id].setPosition(data.x, data.y);
    // console.log('MMO_Core_Npcs.Npcs[data.id]', MMO_Core_Npcs.Npcs[data.id])
  }

  MMO_Core.socket.on("npcsFetched", async (data) => {
    if (data.playerId !== MMO_Core_Player.Player["id"]) return;
    else data.npcs.map(npc => {
      if ($gameMap._events[npc.eventId]) $gameMap.eraseEvent(npc.eventId);
      if (MMO_Core_Npcs.findConnectedNpc(npc)) $gameMap.eraseConnectedEvent(npc.uniqueId);
      MMO_Core_Npcs.addNpc(npc);
    });
  });

  MMO_Core.socket.on("npcSpawn", async (data) => {
    if(!$gameMap || $gameMap._mapId !== data.mapId) return;
    if (data.summonable) MMO_Core_Npcs.addNpc(data);
  });
  
  MMO_Core.socket.on("npcRespawn", (data) => {
    if(!$gameMap || $gameMap._mapId !== data.mapId) return;
    MMO_Core_Npcs.addNpc(data);
    // TODO : play animation
  });

  MMO_Core.socket.on("npcLooted",function(data){
    if(!$gameMap || $gameMap._mapId !== data.mapId) return;
    if (!MMO_Core_Npcs.Npcs[data.uniqueId]) return;
    $gameMap.eraseConnectedEvent(npc.uniqueId);
  });

  MMO_Core.socket.on("npcRemove",function(data){
    if(!MMO_Core_Npcs.findConnectedNpc(data.uniqueId)) return;
    $gameMap.eraseConnectedEvent(npc.uniqueId);
  });

  MMO_Core.socket.on('npc_moving', function(data){
    if(!$gameMap || $gameMap._mapId !== data.mapId) return;
    if(!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) return;
    if(MMO_Core_Npcs.Npcs[data.id] === undefined) return;

    // Update movement speed and frequenzy
    if (!data.skip) {
      MMO_Core_Npcs.Npcs[data.id].setMoveSpeed(data.moveSpeed);
      MMO_Core_Npcs.Npcs[data.id].setMoveFrequency(data.moveFrequency);
      MMO_Core_Npcs.Npcs[data.id].moveStraight(data.direction);
    }
    if (MMO_Core_Npcs.Npcs[data.id].x !== data.x || MMO_Core_Npcs.Npcs[data.id].y !== data.y) MMO_Core_Npcs.Npcs[data.id].setPosition(data.x, data.y);
  });
})();