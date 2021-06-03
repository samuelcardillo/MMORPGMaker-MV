var exports = module.exports = {}
  , world = exports;

/*****************************
      GAME WORLD 
      by Axel Fiolle

  - A connected map must include "<Sync>" inside its note.
  - A connected NPC must include "<Sync>" in a comment in any page.

  - The Spawn map must have "<Summon>" inside its note
  - There must be only one spawn map
  - Command to summon : /addNpc [eventId*] [mapId] [x] [y]

*****************************/

world.gameMaps         = []; // Formated exploitable files from gamedata
world.instanceableMaps = []; // Formated maps to track players and npcs
world.instancedMaps    = []; // Maps that are currently up and synced
world.tileSets         = []; // Needed to test collisions
world.spawnedUniqueIds = []; // Helper to find spawned NPCs without uniqueId

// Global function
world.getMapById         = (mapId) => world.gameMaps.find(map => map.id === mapId);
world.getInstanceById    = (id) => world.instancedMaps.find(instance => instance.id === id);
world.getSummonMap       = () => world.gameMaps.find(map => map.isSummonMap);
// Testing functions
world.isMapInstanced     = (mapId) => world.instancedMaps.find(i => i.mapId === mapId);
world.isSummonMap        = (map) => map.note && map.note.toUpperCase().includes("<SUMMON>");
world.isMapInstanceable  = (map) => map.note && map.note.toUpperCase().includes("<SYNC>");
// NPC helpers
world.removeNpc       = (uniqueId) => world.getNpcByUniqueId(uniqueId) ? world.removeConnectedNpc( uniqueId ) : null;
world.getNpcMapId     = (uniqueId) => world.npcFinder(uniqueId).mapId;
world.getNpcIndex     = (uniqueId) => world.npcFinder(uniqueId).npcIndex;
world.getNpcEventId   = (uniqueId) => world.npcFinder(uniqueId).eventId;
world.getNpcInstance  = (uniqueId) => world.getInstanceById( world.getNpcMapId(uniqueId) );
world.getNpcByUniqueId     = (uniqueId) => world.getNpcInstance(uniqueId) && world.getNpcInstance(uniqueId).connectedNpcs.find(npc => npc && npc.uniqueId && npc.uniqueId === uniqueId) || {};
world.getAllNpcsByInstance = (id) => world.getInstanceById(id) ? world.getInstanceById(id).connectedNpcs : [];

world.initialize = () => {
  world.fetchTilesets();
  world.fetchMaps(); // Load gamedata maps
  world.fetchInstances(); // Filter, format and save online maps
  console.log('[WORLD] # World is ready');
}

world.fetchTilesets = () => {
  world.tileSets = MMO_Core["gamedata"].data['Tilesets'] || [];
  console.log('[WORLD] # Tilesets Loaded')
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
    mapId: Number(fileName.slice(3)),
    fileName,
    allNpcs: [],
    isSummonMap: world.isSummonMap(gameMap),
  });
}

world.makeInstance = (map) => {
  // Assign needed props to make Instance :
  const _map = Object.assign({}, map); // Keep original map clean
  return Object.assign(_map, {  // an Instance is an extends of a GameMap
    id: map.id,
    createdAt: new Date(),
    lastPlayerLeftAt: null, // Date
    dieAfter: 60000, // When no more players left, kill after X ms
    permanent: false, // Make the instance never die
    pauseAfter: 30000, // When no more player, interrupt lifecycle after X ms
    paused: false,
    connectedNpcs: [], // Array of Objects
    playersOnMap: [], // Array of String
    actionsOnMap: [], // Array of Objects -> Actions currently running in instance
    allTiles: world.provideMapTiles(map), // Generate the map's tiles informations
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
  if (world.isMapInstanced(mapId) && !world.getInstanceById(mapId).playersOnMap.length) {
    // Remove instance from the up list if no more players on it
    for (let _npc of world.getMapById(mapId).allNpcs) world.removeConnectedNpcByUniqueId(_npc.uniqueId);
    world.instancedMaps.splice(world.instancedMaps.indexOf(world.getInstanceById(mapId)), 1);
    console.log('[WORLD] # Killed instance', mapId, 'at', new Date())
  }
}

world.playerJoinInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId)) || world.isSummonMap(world.getMapById(mapId))) return;
  if (!world.isMapInstanced(mapId)) world.runInstance(mapId); // If instance not existing, run it before
  if (world.getInstanceById(mapId).paused) world.startInstanceLifecycle(mapId); // If paused, restart
  if (!world.getInstanceById(mapId)['playersOnMap'].includes(playerId)) {
    world.getInstanceById(mapId).playersOnMap.push(playerId); // Add playerId to Array
    console.log('[WORLD] playerJoinInstance', mapId, JSON.stringify(world.getInstanceById(mapId).playersOnMap) );
  }
}

world.playerLeaveInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (world.getInstanceById(mapId) && world.getInstanceById(mapId).playersOnMap.includes(playerId)) {
    const _players = world.getInstanceById(mapId).playersOnMap;
    world.getInstanceById(mapId).playersOnMap.splice(_players.indexOf(playerId), 1); // Remove playerId from Array
    console.log('[WORLD] playerLeaveInstance', mapId, JSON.stringify(world.getInstanceById(mapId).playersOnMap) );
    if (!world.getInstanceById(mapId).playersOnMap.length) world.getInstanceById(mapId).lastPlayerLeftAt = new Date();
    if (!world.getInstanceById(mapId).permanent) {
      setTimeout(() => world.killInstance(mapId), world.getInstanceById(mapId).dieAfter); // Kill the instance after X ms
    }
  }
}

world.fetchNpcsFromMap = (map) => {
  if (!map || !world.isMapInstanced(map.id)) return;
  for (let npc of world.getInstanceById(map.id).events.filter(event => JSON.stringify(event).includes('<Sync>'))) {
    const _generatedNpc = world._makeConnectedNpc(npc,map);
    world.getMapById(map.id).allNpcs.push( world._makeConnectedNpc(npc,map,0,true) );
    if (_generatedNpc) {
      world.getInstanceById(map.id).connectedNpcs.push( _generatedNpc );
      console.log('[WORLD] Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.id);
    }
  }
}

world._makeConnectedNpc = (npc,instance,pageIndex) => {
  if (!npc || !instance) return;
  // Target selected or first page to assign helpers :
  const formatedPageIndex = (pageIndex && !isNaN(pageIndex)) ? parseInt(pageIndex) : 0;
  const _page = npc.pages && npc.pages[formatedPageIndex] || npc.pages[0];
  const _npc = Object.assign({}, npc); // Prevent rewrite existing when make
  return Object.assign(_npc, { // Add new properties
    uniqueId: `@${instance.id}#${instance.connectedNpcs.length}?${npc.id}`, // Every NPC has to be clearly differentiable
    eventId: npc.id, // Event "ID" client-side
    absId: null, // Help to resolve ABS logic (if and when any)
    lastActionTime: new Date('1970-01-01T00:00:00'),
    lastMoveTime: new Date('1970-01-01T00:00:00'),
    summonable: false,
    mapId: instance.id,
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

world.spawnNpc = (npcSummonId, coords, pageIndex) => {
  // coords = { mapId, x, y }
  if (!coords || !coords.mapId || !coords.x || !coords.y || !world.getSummonMap()) return;

  const _npcToReplicate = world.getSummonMap().events.find(npc => npc && (npc.id === npcSummonId || (npc.summonId && npc.summonId === npcSummonId)));
  const _targetInstance = world.getInstanceById(coords.mapId);
  if (!_npcToReplicate || !_targetInstance) return;
  const _generatedNpc = world._makeConnectedNpc(_npcToReplicate,_targetInstance,pageIndex || 0);
  if (!_generatedNpc) return
  const uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999); // Prevents event id conflicts
  Object.assign(_generatedNpc, {
    uniqueId: `@${coords.mapId}#${world.getInstanceById(coords.mapId).connectedNpcs.length}?${uniqueIntegerId}`,
    summonId: npcSummonId,
    id: uniqueIntegerId,
    eventId: uniqueIntegerId,
    summonable: true,
    mapId: coords.mapId
  });

  world.spawnedUniqueIds.push( _generatedNpc.uniqueId );
  const _spawnedIndex = world.spawnedUniqueIds.indexOf(_generatedNpc.uniqueId);
  world.getInstanceById(coords.mapId).connectedNpcs.push( _generatedNpc );
  world.getMapById(coords.mapId).allNpcs.push( _generatedNpc );
  
  world.getNpcByUniqueId(_generatedNpc.uniqueId).x = coords.x || 1;
  world.getNpcByUniqueId(_generatedNpc.uniqueId).y = coords.y || 1;
  
  MMO_Core.security.createLog(`[WORLD] Spawned NPC ${_generatedNpc.uniqueId} [index: ${_spawnedIndex}] to map ${coords.mapId} (${coords.x};${coords.y}) at ${new Date()}`)
  MMO_Core["socket"].emitToAll("npcSpawn", world.getNpcByUniqueId(_generatedNpc.uniqueId));

  return _spawnedIndex;
}
world.disableNpc = (npc) => {
  world.npcTpTo(npc,-1,-1); // visually hide npc
  Object.assign(world.getNpcByUniqueId(npc.uniqueId), { disabled: true }); // Prevent turn execution
}
world.removeSpawnedNpcByIndex = (index) => {
  if (!world.spawnedUniqueIds[index]) return;
  world.removeConnectedNpcByUniqueId(world.spawnedUniqueIds[index]);
  return world.spawnedUniqueIds[index];
}
world.removeConnectedNpcByUniqueId = (uniqueId) => {
  if (!world.getNpcByUniqueId(uniqueId) || !world.getNpcInstance(uniqueId)) return;
  const _parentInstance = world.getNpcInstance(uniqueId);
  const _nativeMap = world.getMapById(_parentInstance.id);
  const _npc = world.getNpcByUniqueId(uniqueId);
  const _spawnedIndex = world.spawnedUniqueIds.indexOf(uniqueId);

  // Destroy NPC :
  world.disableNpc(_npc); // Prevent tick to run this NPC
  world.getNpcInstance(uniqueId).connectedNpcs.splice(_parentInstance.connectedNpcs.indexOf(_npc), 1);
  world.getMapById(_nativeMap.id).allNpcs.splice(_nativeMap.allNpcs.indexOf(_npc), 1);
  if (_spawnedIndex != -1) world.spawnedUniqueIds.splice(_spawnedIndex, 1, ""); // replace item with empty str to keep spawned index

  MMO_Core.security.createLog(`[WORLD] Removed NPC ${uniqueId} [index: ${_spawnedIndex}] at ${new Date()}`)
  MMO_Core["socket"].emitToAll("npcRemove", { uniqueId });
  return uniqueId;
}

world.npcFinder = (uniqueId) => {
  try {
    return {
      mapId: parseInt(uniqueId.split('@')[1].split('#')[0]),
      npcIndex: parseInt(uniqueId.split('#')[1].split('?')[0]),
      eventId: parseInt(uniqueId.split('?')[1]),
    };
  } catch (_) {
    return { mapId: -1, npcIndex: -1, eventId: -1 };
  }
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
  if (!npc || npc.disabled
  || !currentTime || !cooldown || !npc.uniqueId
  || !world.getNpcByUniqueId(npc.uniqueId)
  ) return;
  
  // read NPCs infos (speed, rate, etc, ...)
  const delayedActionTime = currentTime.getTime() - npc.lastActionTime.getTime();
  const delayedMoveTime = currentTime.getTime() - npc.lastMoveTime.getTime();
  
  // make NPCs behavior
  let canMoveThisTurn = delayedMoveTime > cooldown;

  if (npc._moveType === 1 && canMoveThisTurn) {
    const didMove = world.npcMoveRandom(world.getNpcByUniqueId(npc.uniqueId));
    if (didMove) {
      world.getNpcByUniqueId(npc.uniqueId).lastMoveTime = new Date();
      // console.log('[WORLD] handleNpcTurn', npc.uniqueId, world.getNpcByUniqueId(npc.uniqueId).lastMoveTime);
    }
  }
}

world.startInstanceLifecycle = (instanceId) => {
  const interval = 1000 / 60; // Tick 1 action every RPG Maker Frame (60f = 1s)
  const tick = setInterval(() => {
    const currentTime = new Date(); // Use precise tick time

    if (!world.getInstanceById(instanceId)) { // If no instance, interrupt lifecycle
      clearInterval(tick);
      return;
    }

    world.getInstanceById(instanceId).paused = false; // Flag as running
    // _instance.actionsOnMap.map(action => world.handleInstanceAction(action, _instance, currentTime)); // Play Actions
    world.getInstanceById(instanceId).npcsOnMap.map(npc => npc && world.handleNpcTurn(npc, currentTime, 6000 - (1000 * (npc._moveFrequency + 1)))); // Animate NPCS

    if (!world.getInstanceById(instanceId).playersOnMap.length) { // If no players on map at tick :
      setTimeout(() => {
        if (!world.getInstanceById(instanceId)) {
          // If instance is not loaded anymore :
          clearInterval(tick);
          return;
        } else if (!world.getInstanceById(instanceId).playersOnMap.length) {
          // If instance alive && no more players in it
          clearInterval(tick); // Will suspend instance (not kill)
          world.getInstanceById(instanceId).paused = true; // Flag paused
        }
      }, world.getInstanceById(instanceId).pauseAfter); 
    }
  }, interval);
}

world.npcCanPass = (npc, direction) => {
  if (!npc || !direction) return false;
  const _coords = {
    x: npc.x,
    y: npc.y
  };
  const _mapId = world.getNpcMapId(npc.uniqueId);
  const x2 = world._roundXWithDirection(_mapId,_coords.x, direction);
  const y2 = world._roundYWithDirection(_mapId,_coords.y, direction);
  if (!world._isValid(_mapId, _coords.x, _coords.y) || !world._isValid(_mapId, x2, y2)) {
    // console.log(npc.uniqueId, '!world._isValid(_mapId, x2, y2)', _mapId, x2, y2)
    return false;
  }
  if (!world._isMapPassable(_mapId, _coords.x, _coords.y, direction)) {
    // console.log(npc.uniqueId, '!world._isMapPassable(_mapId, _coords.x, _coords.y, direction)', _mapId, _coords.x, _coords.y, direction)
    return false;
  }
  if (world._isCollidedWithCharacters(_mapId, x2, y2)) {
    // console.log(npc.uniqueId, 'world._isCollidedWithCharacters(_mapId, x2, y2)', _mapId, x2, y2)
    return false;
  }
  return true;
};

world.npcMoveStraight = (npc,direction,animSkip) => {
  if (!npc || !world.getNpcByUniqueId(npc.uniqueId)) return
  // console.log('[WORLD] npcMoveStraight (1/2)', npc.uniqueId, { x: npc.x,y: npc.y }, {direction});
  if (world.npcCanPass(npc,direction)) {
    const _map = world.getNpcInstance(npc.uniqueId);
    world.getNpcByUniqueId(npc.uniqueId).x = world._roundXWithDirection(_map.id, npc.x, direction);
    world.getNpcByUniqueId(npc.uniqueId).y = world._roundYWithDirection(_map.id, npc.y, direction);
    MMO_Core["socket"].emitToAll("npc_moving", {
      uniqueId: npc.uniqueId,
      mapId: _map.id,
      id: npc.id,
      moveSpeed: npc._moveSpeed,
      moveFrequency: npc._moveFrequency,
      direction: direction,
      x: world.getNpcByUniqueId(npc.uniqueId).x,
      y: world.getNpcByUniqueId(npc.uniqueId).y,
      skip: animSkip || false,
    });
    // console.log('[WORLD] npcMoveStraight (2/2)', npc.uniqueId, { x: world.getNpcByUniqueId(npc.uniqueId).x,y: world.getNpcByUniqueId(npc.uniqueId).y });
    return true;
  } else return false;
}
world.npcTpTo = (npc,x,y) => {
  if (!npc || !x || !y || !world.getNpcByUniqueId(npc.uniqueId))
  world.getNpcByUniqueId(npc.uniqueId).x = x;
  world.getNpcByUniqueId(npc.uniqueId).y = y;
  MMO_Core["socket"].emitToAll("npc_moving", {
    uniqueId: world.getNpcByUniqueId(npc.uniqueId).uniqueId,
    mapId: world.getNpcByUniqueId(npc.uniqueId).mapId,
    id: world.getNpcByUniqueId(npc.uniqueId).id,
    x: world.getNpcByUniqueId(npc.uniqueId).x,
    y: world.getNpcByUniqueId(npc.uniqueId).y,
    skip: true,
  });
}

world.npcMoveRandom = (npc) => {
  const direction = 2 + Math.floor(Math.random() * 4) * 2;
  return world.npcMoveStraight(npc, direction);
};

world.getReverseDir = (direction) => {
  if (direction === 1) return 9;
  if (direction === 2) return 8;
  if (direction === 3) return 7;
  if (direction === 4) return 6;
  if (direction === 6) return 4;
  if (direction === 7) return 3;
  if (direction === 8) return 2;
  if (direction === 9) return 1;
  return false;
}

world.provideMapTiles = (map) => {
  const grid = [
    [ // x: [ y, ]
      [], // y: [A,B,C,R]
    ],
  ];
  const _data = map.data || [];
  const _width = map.width; // Limit the iteration in horizontal
  const _height = map.height; // Paginate the iteration in vertical (handle layers)
  let heightIndex = 0, widthIndex = 0;

  for (let dataIndex = 0; dataIndex < _data.length; dataIndex++) { // i = cell xy informations by layer
    if (!grid[widthIndex]) grid[widthIndex] = [[]]; // if no X yet
    if (!grid[widthIndex][heightIndex]) grid[widthIndex][heightIndex] = []; // if no Y yet
    grid[widthIndex][heightIndex] = [_data[dataIndex]].concat(grid[widthIndex][heightIndex]); // Add to tile layers

    if (widthIndex + 1 < _width) { // if still on current line
      widthIndex++; // next cell
    } else { 
      heightIndex++; // next line
      widthIndex = 0; // first cell
      // (if next): layer first row, (else): next row
      if (heightIndex >= _height) heightIndex = 0;
    }
  }
  return grid;
}
world.mapTileFinder = (mapId,x,y) => {
  // console.log('mapTileFinder', mapId, x, y);
  return world.getInstanceById(mapId).allTiles[x][y];
}

world._isValid = (mapId,targetX,targetY) => {
  if (targetX < 0 || targetY < 0) return false;
  const _map = world.getMapById(mapId);
  if (targetX >= _map.width || targetY >= _map.height) return false;
  return true;
}
world._isMapPassable = (mapId,x,y,d) => {
  const x2 = world._roundXWithDirection(mapId,x, d);
  const y2 = world._roundYWithDirection(mapId,y, d);
  const d2 = world.getReverseDir(d);
  return world._isPassable(mapId,x, y, d) && world._isPassable(mapId,x2, y2, d2);
}
world._isPassable = (mapId,x,y,d) => {
  return world._checkPassage(mapId, x, y, (1 << (d / 2 - 1)) & 0x0f);
};

world._roundX = function(mapId,x) {
  const _map = world.getInstanceById(mapId);
  return (_map.scrollType === 2 || _map.scrollType === 3) ? x % _map.width : x;
};
world._roundY = function(mapId,y) {
  const _map = world.getInstanceById(mapId);
  return (_map.scrollType === 2 || _map.scrollType === 3) ? y % _map.height : y;
};
world._xWithDirection = function(x, d) {
  return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
};
world._yWithDirection = function(y, d) {
  return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
};
world._roundXWithDirection = function(mapId, x, d) {
  return world._roundX(mapId, x + (d === 6 ? 1 : d === 4 ? -1 : 0));
};
world._roundYWithDirection = function(mapId, y, d) {
  return world._roundY(mapId, y + (d === 2 ? 1 : d === 8 ? -1 : 0));
};

world.__tilesetId = (mapId,x,y) => {
  return world._layeredTiles(mapId, x, y);
}
world._tilesetFlags = (mapId) => {
  const tileset = world.tileSets[world.getMapById(mapId).tilesetId];
  if (tileset) {
    return tileset.flags;
  } else {
    return [];
  }
}
world._tileId = (mapId,x,y,z) => {
  const _map = world.getInstanceById(mapId);
  const width = _map.width;
  const height = _map.height;
  return _map.data[(z * height + y) * width + x] || 0;
}
world._layeredTiles = (mapId,x,y) => {
  const tiles = [];
  for (let i = 0; i < 4; i++) {
      tiles.push(world._tileId(mapId, x, y, 3 - i));
  }
  return tiles;
}
world._checkPassage = (mapId,x,y,bit) => {
  const flags = world._tilesetFlags(mapId);
  const tiles = world.mapTileFinder(mapId,x,y);
  for (const tile of tiles) {
    const flag = flags[tile];
    if ((flag & 0x10) !== 0) {
      // [*] No effect on passage
      continue;
    }
    if ((flag & bit) === 0) {
      // [o] Passable
      return true;
    }
    if ((flag & bit) === bit) {
      // [x] Impassable
      return false;
    }
  }
  return false;
}
world._isCollidedWithCharacters = (mapId,x,y) => {
  if (!world.getMapById(mapId)) return true; // return collide to prevent move
  for (let _npc of world.getMapById(mapId).allNpcs) {
    if (_npc.x === x && _npc.y === y) return true;
  }
  return false;
}
