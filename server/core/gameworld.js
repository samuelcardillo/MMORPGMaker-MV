var exports = module.exports = {}
  , world = exports;

/*****************************
      GAME WORLD 
      by Axel Fiolle

  - A connected map must include "<Sync>" inside its note.
  - A connected NPC must include "<Sync>" in a comment in any page.

*****************************/

world.gameMaps         = []; // Formated exploitable files from gamedata
world.instanceableMaps = []; // Formated maps to track players and npcs
world.instancedMaps    = []; // Maps that are currently up and synced

// Global function
world.getMapById         = (mapId) => world.gameMaps.find(map => map.id === mapId);
world.findInstanceById   = (id) => world.instancedMaps.find(instance => instance.id === id);
// Testing functions
world.isMapInstanced     = (mapId) => world.instancedMaps.find(i => i.mapId === mapId);
world.isMapInstanceable  = (map) => map.note && map.note.toUpperCase().includes("<SYNC>");
// NPC helpers
world.getNpcMapId     = (uniqueId) => world.npcFinder(uniqueId).mapId;
world.getNpcIndex     = (uniqueId) => world.npcFinder(uniqueId).npcIndex;
world.getNpcEventId   = (uniqueId) => world.npcFinder(uniqueId).eventId;
world.getNpcInstance  = (uniqueId) => world.findInstanceById( world.getNpcMapId(uniqueId) );
world.getNpcByUniqueId  = (uniqueId) => world.getNpcInstance(uniqueId).npcsOnMap[ world.getNpcIndex(uniqueId) ];
world.getAllNpcsByInstance = (id) => world.findInstanceById(id) && world.findInstanceById(id).npcsOnMap || [];

world.initialize = () => {
  world.fetchMaps(); // Load gamedata maps
  world.fetchInstances(); // Filter, format and save online maps
  console.log('[WORLD] # World is ready');
}

world.fetchMaps = () => {
  console.log('[WORLD] Loading world maps ...');
  world.gameMaps = [];
  // use the file name as key in the loop, keeping only filename starting with "Map" :
  for (let fileName of Object.keys(MMO_Core["gamedata"].data).filter(name => name.startsWith("Map"))) {
    // Format map from game file and and to world
    world.gameMaps.push( world.getDatasFromGameFile(MMO_Core["gamedata"].data[fileName],fileName) ); 
    console.log(`[WORLD] - Loaded ${fileName}`);
  }
}

world.fetchInstances = () => {
  // Only keep maps thate are instanceable :
  world.instanceableMaps = world.gameMaps.filter(map => world.isMapInstanceable(map));
  world.instanceableMaps.map(map => console.log(`[WORLD] - Online ${map.id} ${map.fileName} ${map.displayName}`));
}

world.getDatasFromGameFile = (gameMap, fileName) => {
  // a GameMap is a raw map file + some additional useful datas
  return Object.assign(gameMap, {
    id: Number(fileName.slice(3)),
    fileName,
  });
}

world.makeInstance = (map) => {
  // Assign needed props to make Instance :
  return Object.assign(map, {  // an Instance is an extends of a GameMap
    id: map.id,
    mapId: map.id,
    createdAt: new Date(),
    lastPlayerLeftAt: null, // Date
    dieAfter: 60000, // When no more players left, kill after X ms
    permanent: false, // Make the instance never die
    pauseAfter: 30000, // When no more player, interrupt lifecycle after X ms
    paused: false,
    npcsOnMap: [], // Array of Objects
    playersOnMap: [], // Array of String
    actionsOnMap: [], // Array of Objects -> Actions currently running in instance
  });
}

world.runInstance = (mapId) => {
  const _map = world.getMapById(mapId);
  if (_map && world.isMapInstanceable(_map) && !world.isMapInstanced(mapId)) {
    world.instancedMaps.push( world.makeInstance(_map) );
    console.log('[WORLD] # Started instance', mapId, 'at', new Date())
    world.fetchNpcsFromMap(_map);
    world.startInstanceLifecycle(mapId);
  }
}

world.killInstance = (mapId) => {
  if (world.isMapInstanced(mapId) && !world.findInstanceById(mapId).playersOnMap.length) {
    // Remove instance from the up list if no more players on it
    world.instancedMaps.splice(world.instancedMaps.indexOf(world.findInstanceById(mapId)), 1);
    console.log('[WORLD] # Killed instance', mapId, 'at', new Date())
  }
}

world.playerJoinInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (!world.isMapInstanced(mapId)) world.runInstance(mapId); // If instance not existing, run it before
  if (world.findInstanceById(mapId).paused) world.startInstanceLifecycle(mapId); // If paused, restart
  if (!world.findInstanceById(mapId)['playersOnMap'].includes(playerId)) {
    world.findInstanceById(mapId).playersOnMap.push(playerId); // Add playerId to Array
    console.log('[WORLD] playerJoinInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
  }
}

world.playerLeaveInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (world.findInstanceById(mapId) && world.findInstanceById(mapId).playersOnMap.includes(playerId)) {
    const _players = world.findInstanceById(mapId).playersOnMap;
    world.findInstanceById(mapId).playersOnMap.splice(_players.indexOf(playerId), 1); // Remove playerId from Array
    console.log('[WORLD] playerLeaveInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
    if (!world.findInstanceById(mapId).playersOnMap.length) world.findInstanceById(mapId).lastPlayerLeftAt = new Date();
    if (!world.findInstanceById(mapId).permanent) {
      setTimeout(() => world.killInstance(mapId), world.findInstanceById(mapId).dieAfter); // Kill the instance after X ms
    }
  }
}

world.fetchNpcsFromMap = (map) => {
  if (!map || !world.isMapInstanced(map.id)) return;
  for (let npc of world.findInstanceById(map.id).events.filter(event => JSON.stringify(event).includes('<Sync>'))) {
    const _generatedNpc = world.makeConnectedNpc(npc,map);
    if (_generatedNpc) {
      world.findInstanceById(map.id).npcsOnMap.push( _generatedNpc );
      console.log('[WORLD] Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.id);
    }
  }
}

world.makeConnectedNpc = (npc,instance,pageIndex) => {
  if (!npc || !instance) return;
  // Target selected or first page to assign helpers :
  const formatedPageIndex = (pageIndex && !isNaN(pageIndex)) ? parseInt(pageIndex) : 0;
  const _page = npc.pages && npc.pages[formatedPageIndex] || npc.pages[0];
  // If page contains a comment with "<Sync>" as parameter, return ConnectedNpc :
  if (_page.list.find(l => l.code === 108 && l.parameters.find(p => p.toUpperCase().includes('<SYNC>')))) {
    return Object.assign(npc, {
      uniqueId: `@${instance.id}#${instance.npcsOnMap.length}?${npc.id}`, // Every NPC has to be clearly differentiable
      eventId: npc.id, // Event "ID" client-side
      absId: null, // Help to resolve ABS logic (if and when any)
      lastActionTime: new Date('1970-01-01T00:00:00'),
      lastMoveTime: new Date('1970-01-01T00:00:00'),
      // _ helpers
      _conditions: _page.conditions,
      _directionFix: _page.directionFix,
      _image: _page.image,
      _list: _page.list,
      _moveFrequency: _page.moveFrequency,
      _moveRoute: _page.moveRoute,
      _moveSpeed: _page.moveSpeed,
      _moveType: _page.moveType,
      _priorityType: _page.priorityType,
      _stepAnime: _page.stepAnime,
      _through: _page.through,
      _trigger: _page.trigger,
      _walkAnime: _page.walkAnime,
      _selectedPageIndex: formatedPageIndex
    });
  }
}

world.npcFinder = (uniqueId) => {
  return {
    mapId: parseInt(uniqueId.split('@')[1].split('#')[0]),
    npcIndex: parseInt(uniqueId.split('#')[1].split('?')[0]),
    eventId: parseInt(uniqueId.split('?')[1]),
  };
}

world.handleInstanceAction = (action,instance,currentTime) => {
  // This function will interpret/mock a game script then emit 
  // an event to replicate it on every concerned player
  if (!action || !instance || !currentTime) return;
  return;
}

world.handleNpcTurn = (npc,currentTime,cooldown) => {
  // This function will read basic NPC behavior and mock it on
  // server-side then replicate it on every concerned player
  if (!npc || !currentTime || !cooldown) return;
  
  // read NPCs infos (speed, rate, etc, ...)
  const delayedActionTime = currentTime.getTime() - npc.lastActionTime.getTime();
  const delayedMoveTime = currentTime.getTime() - npc.lastMoveTime.getTime();
  
  // make NPCs behavior
  let canMoveThisTurn = delayedMoveTime > cooldown;

  if (npc._moveType === 1 && canMoveThisTurn) {
    const didMove = world.npcMoveRandom(world.getNpcByUniqueId(npc.uniqueId));
    if (didMove) world.getNpcByUniqueId(npc.uniqueId).lastMoveTime = new Date();
    // console.log('[WORLD] handleNpcTurn', npc.uniqueId, world.getNpcByUniqueId(npc.uniqueId).lastMoveTime);
  }
  
}

world.startInstanceLifecycle = (instanceId) => {
  const interval = 1000 / 60; // Tick 1 action every RPG Maker Frame (60f = 1s)
  const tick = setInterval(() => {
    const currentTime = new Date(); // Use precise tick time
    const _instance = world.findInstanceById(instanceId); // Memorize state at tick time

    if (!_instance) { // If no instance, interrupt lifecycle
      clearInterval(tick);
      return;
    }

    world.findInstanceById(instanceId).paused = false; // Flag as running
    // _instance.actionsOnMap.map(action => world.handleInstanceAction(action, _instance, currentTime)); // Play Actions
    world.findInstanceById(instanceId).npcsOnMap.map(npc => world.handleNpcTurn(npc, currentTime, 1000 * (npc._moveFrequency + 1))); // Animate NPCS

    if (!world.findInstanceById(instanceId).playersOnMap.length) { // If no players on map at tick :
      setTimeout(() => {
        if (!world.findInstanceById(instanceId)) {
          // If instance is not loaded anymore :
          clearInterval(tick);
          return;
        } else if (!world.findInstanceById(instanceId).playersOnMap.length) {
          // If instance alive && no more players in it
          clearInterval(tick); // Will suspend instance (not kill)
          world.findInstanceById(instanceId).paused = true; // Flag paused
        }
      }, world.findInstanceById(instanceId).pauseAfter); 
    }
  }, interval);
}

world.npcCanPass = (npc, direction) => {
  const _coords = {
    x: npc.x,
    y: npc.y
  };
  const _mapId = world.getNpcMapId(npc.uniqueId)
  const x2 = world.getCoordsAfterMove(_coords, direction).x;
  const y2 = world.getCoordsAfterMove(_coords, direction).y;
  if (!world._isValid(_mapId, x2, y2)) {
      return false;
  }
  if (!world._isMapPassable(_mapId, npc.x, npc.y, direction)) {
      return false;
  }
  if (world._isCollidedWithCharacters(_mapId, x2, y2)) {
      return false;
  }
  return true;
};

world.npcMoveStraight = (npc,direction,animSkip) => {
  // console.log('[WORLD] npcMoveStraight (1/2)', npc.uniqueId, { x: npc.x,y: npc.y }, direction);
  if (world.npcCanPass(npc,direction)) {
    const _coords = {
      x: npc.x,
      y: npc.y
    };
    world.getNpcByUniqueId(npc.uniqueId).x = world.getCoordsAfterMove(_coords, direction).x;
    world.getNpcByUniqueId(npc.uniqueId).y = world.getCoordsAfterMove(_coords, direction).y;
    const _map = world.getNpcInstance(npc.uniqueId);
    MMO_Core["socket"].emitToAll("npc_moving", {
      uniqueId: npc.uniqueId,
      mapId: _map.id,
      id: npc.id,
      moveSpeed: npc._moveSpeed,
      moveFrequency: npc._moveFrequency,
      direction: direction,
      x: world.getNpcByUniqueId(npc.uniqueId).x,
      y: world.getNpcByUniqueId(npc.uniqueId).y,
      skip: animSkip || false
    });
    // console.log('[WORLD] npcMoveStraight (2/2)', npc.uniqueId, { x: world.getNpcByUniqueId(npc.uniqueId).x,y: world.getNpcByUniqueId(npc.uniqueId).y });
    return true;
  } else return false;
}

world.npcMoveRandom = (npc) => {
  const direction = 2 + Math.randomInt(4) * 2;
  return world.npcMoveStraight(npc, direction);
};

world.getCoordsAfterMove = (coords,direction) => {
  // coords: { x: number, y: number }
  // direction : 2 = down, 4 = left, 6 = right, 8 = up
  if (!coords || !direction) return;
  const _XY = coords;
  if (direction === 2) _XY.y += 1;
  if (direction === 4) _XY.x -= 1;
  if (direction === 6) _XY.x += 1;
  if (direction === 8) _XY.y -= 1;
  return _XY;
  // TODO : 8 directions (1,3,7,9)
}
world.getReverseDir = (direction) => {
  if (direction === 2) return 8;
  if (direction === 4) return 6;
  if (direction === 6) return 4;
  if (direction === 8) return 2;
}

world._isValid = (mapId,targetX,targetY) => {
  if (targetX < 0 || targetY < 0) return false;
  const _map = world.getMapById(mapId);
  if (targetX >= _map.width || targetY >= _map.height) return false;
  return true;
}
world._isMapPassable = (mapId,x,y,d) => {
  const x2 = world.getCoordsAfterMove({x,y}, d);
  const y2 = world.getCoordsAfterMove({x,y}, d);
  const d2 = world.getReverseDir(d);
  return true; // world._isPassable(mapId,x, y, d) && world._isPassable(mapId,x2, y2, d2);
}
world._isCollidedWithCharacters = (mapId,x,y) => {
  if (!world.isMapInstanced(mapId)) return true; // return collide to prevent move
  // for (let userId of world.findInstanceById(mapId).playersOnMap) {
  //   const _player = MMO_Core["database"].findUserById(userId);
  //   if (_player.x === x && _player.y === y) return true;
  // }
  return false;
}
