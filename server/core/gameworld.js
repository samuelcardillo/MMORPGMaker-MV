/*****************************
  GAME WORLD by Axel Fiolle

  - Will allow you to synchronize NPCs inter/actions through multiple clients

  i. A connected map must include "<Sync>" inside its note.
  i. A connected NPC must include "<Sync>" in a comment in any page.

  i. The Spawn map must have "<Summon>" inside its note
  i. There must be only one spawn map
  i. Command to summon : /addNpc [eventId*] [mapId] [x] [y]

*****************************/

var exports = module.exports = {}
  , world = exports;

// World State :
world.gameMaps         = []; // Formated exploitable files from gamedata
world.instanceableMaps = []; // Formated maps to track players and npcs
world.instancedMaps    = []; // Maps that are currently up and synced
world.tileSets         = []; // Needed to test collisions
world.spawnedUniqueIds = []; // Helper to find spawned NPCs without uniqueId

// Global helpers
world.getMapById         = (mapId) => world.gameMaps.find(map => map.mapId === mapId);
world.getInstanceByMapId = (mapId) => world.instancedMaps.find(instance => instance.mapId === mapId);
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
world.getNpcInstance  = (uniqueId) => world.getInstanceByMapId( world.getNpcMapId(uniqueId) );
world.getNpcByUniqueId = (uniqueId) => world.getNpcInstance(uniqueId) && world.getNpcInstance(uniqueId).connectedNpcs.find(npc => npc && npc.uniqueId && npc.uniqueId === uniqueId);
world.getConnectedNpcs = (mapId) => world.getInstanceByMapId(mapId) && world.getInstanceByMapId(mapId).connectedNpcs;

world.initialize = () => {
  console.log("######################################");
  console.log('[WORLD] GAME WORLD by Axel Fiolle')
  world.fetchTilesets(); // Load collision informations
  world.fetchMaps(); // Load MMO_Core.gamedata maps
  console.log('[WORLD] GAME WORLD is ready !');
  console.log("######################################");
}

world.fetchTilesets = () => {
  world.tileSets = MMO_Core["gamedata"].data['Tilesets'] || [];
  console.log('[WORLD] Loaded Tilesets')
}

/*************************************************************************************** Maps Operations */

world.fetchMaps = () => {
  console.log('[WORLD] Loading world maps');
  world.gameMaps = [];
  // use the file name as key in the loop, keeping only filename starting with "Map" :
  for (let fileName of Object.keys(MMO_Core["gamedata"].data).filter(name => name.startsWith("Map") && name !== "MapInfos")) {
    // Format map from game file and and to world
    const _gameMap = world.getDatasFromGameFile(MMO_Core["gamedata"].data[fileName],fileName);
    const _isSummon = _gameMap.isSummonMap;
    const _isSync = world.isMapInstanceable(_gameMap);
    console.log(`[WORLD] ... ${fileName} ${_isSummon ? '<Summon>' : ''}${world.isMapInstanceable(_gameMap) ? '<Sync>' : ''}`);

    world.gameMaps.push( _gameMap ); 
    if (_isSync) world.instanceableMaps.push( _gameMap );
  }
}

world.getDatasFromGameFile = (gameMap, fileName) => {
  // a GameMap is a raw map file + some additional useful datas
  return Object.assign(gameMap, {
    mapId: world._getMapIdByFileName(fileName),
    fileName,
    isSummonMap: world.isSummonMap(gameMap),
  });
}
world._getMapIdByFileName = (fileName) => Number(fileName.slice(3));

world.makeInstance = (map,initiator) => {
  // Assign needed props to make Instance :
  const _map = Object.assign({}, map); // Keep original map clean
  const _time = new Date();
  return Object.assign(_map, {  // an Instance is an extends of a GameMap
    uniqueId: `@${map.fileName}#${world.instancedMaps.length}?${map.mapId}T${_time.getTime()}`,
    initiator: initiator || 'server', // playerId || 'server'
    startedAt: _time,
    lastPlayerLeftAt: null, // Date
    dieAfter: 60000,        // When no more players left, kill after X ms
    permanent: false,       // Make the instance never die
    pauseAfter: 30000,      // When no more player, interrupt lifecycle after X ms
    paused: false,          // Can prevent lifecycle execution
    connectedNpcs: [],      // Array of Objects
    playersOnMap: [],       // Array of String
    actionsOnMap: [],       // Array of Objects -> Actions currently running in instance
    allTiles: world.provideMapTiles(map), // Generate the map's tiles informations
  });
}

world.runInstance = (mapId,playerId) => {
  const _map = world.getMapById(mapId);
  if (_map && world.isMapInstanceable(_map) && !world.isMapInstanced(mapId)) {
    const _makeInstance = world.makeInstance(_map,playerId);
    world.instancedMaps.push( _makeInstance );
    console.log('[WORLD] # Started instance', mapId, { // Output useful informations
      uniqueId: _makeInstance.uniqueId,
      initiator: _makeInstance.initiator,
      startedAt: _makeInstance.startedAt,
    });
    world.fetchNpcsFromMap(_map);
    world.startInstanceLifecycle(mapId);
  }
}

world.killInstance = (mapId) => {
  if (world.isMapInstanced(mapId) && !world.getInstanceByMapId(mapId).playersOnMap.length) {
    // Clean instance if no more players on it
    for (let _npc of world._getAllNpcs(mapId)) world.removeConnectedNpcByUniqueId(_npc.uniqueId);
    const index = world.instancedMaps.indexOf(world.getInstanceByMapId(mapId));
    const _cleanedInstance = { // Keep useful datas
      uniqueId: world.instancedMaps[index].uniqueId,
      initiator: world.instancedMaps[index].initiator,
      startedAt: world.instancedMaps[index].startedAt,
      lastPlayerLeftAt: world.instancedMaps[index].lastPlayerLeftAt,
      deletedAt: new Date(),
      paused: true
    }
    Object.keys(world.instancedMaps[index]).map(key => delete world.instancedMaps[index][key]); // Clean useless datas
    Object.assign(world.instancedMaps[index], _cleanedInstance); // Assign cleaned instance in state
    console.log('[WORLD] # Killed instance', mapId, world.instancedMaps[index]); // Output useful informations
  }
}

world.playerJoinInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId)) || world.isSummonMap(world.getMapById(mapId))) return;
  if (!world.isMapInstanced(mapId)) world.runInstance(mapId,playerId); // If instance not existing, run it before
  if (world.getInstanceByMapId(mapId).paused) world.startInstanceLifecycle(mapId); // If paused, restart
  if (!world.getInstanceByMapId(mapId)['playersOnMap'].includes(playerId)) {
    world.getInstanceByMapId(mapId).playersOnMap.push(playerId); // Add playerId to Array
    console.log('[WORLD] playerJoinInstance', mapId, JSON.stringify(world.getInstanceByMapId(mapId).playersOnMap) );
  }
}

world.playerLeaveInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (world.getInstanceByMapId(mapId) && world.getInstanceByMapId(mapId).playersOnMap.includes(playerId)) {
    const _players = world.getInstanceByMapId(mapId).playersOnMap;
    world.getInstanceByMapId(mapId).playersOnMap.splice(_players.indexOf(playerId), 1); // Remove playerId from Array
    console.log('[WORLD] playerLeaveInstance', mapId, JSON.stringify(world.getInstanceByMapId(mapId).playersOnMap) );
    if (!world.getInstanceByMapId(mapId).playersOnMap.length) world.getInstanceByMapId(mapId).lastPlayerLeftAt = new Date();
    if (!world.getInstanceByMapId(mapId).permanent) {
      setTimeout(() => world.killInstance(mapId), world.getInstanceByMapId(mapId).dieAfter); // Kill the instance after X ms
    }
  }
}

/*************************************************************************************** NPC Operations */

world.fetchNpcsFromMap = (map) => {
  if (!map || !world.isMapInstanced(map.mapId)) return;
  for (let npc of world.getInstanceByMapId(map.mapId).events.filter(event => JSON.stringify(event).includes('<Sync>'))) {
    const _generatedNpc = world._makeConnectedNpc(npc,map);
    if (_generatedNpc) {
      world.getConnectedNpcs(map.mapId).push( _generatedNpc );
      console.log('[WORLD] Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.mapId);
    }
  }
}
world._getAllNpcs = (mapId) => {
  if (!mapId || !world.getMapById(mapId) || !world.getInstanceByMapId(mapId)) return;
  [].concat(world.getMapById(mapId)).concat(world.getConnectedNpcs(mapId))
  return [].concat(world.getMapById(mapId)).concat(world.getConnectedNpcs(mapId));
}

world._makeConnectedNpc = (npc,instance,pageIndex) => {
  if (!npc || !instance) return;
  // Target selected or first page to assign helpers :
  const formatedPageIndex = (pageIndex && !isNaN(pageIndex)) ? parseInt(pageIndex) : 0;
  const _instance = world.getInstanceByMapId(instance.mapId);
  const _page = npc.pages && npc.pages[formatedPageIndex] || npc.pages[0];
  const _npc = Object.assign({}, npc); // Prevent rewrite existing when make
  return Object.assign(_npc, { // Add new properties
    uniqueId: `@${_instance.mapId}#${_instance.connectedNpcs.length}?${npc.id}`, // Every NPC has to be clearly differentiable
    eventId: npc.id, // Event "ID" client-side
    absId: null, // Help to resolve ABS logic (if and when any)
    lastActionTime: new Date(),
    lastMoveTime: new Date(),
    summonable: false,
    busy: false, // { id: string | int, type: string, since: Date } | false
    mapId: instance.mapId,
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
  const _targetInstance = world.getInstanceByMapId(coords.mapId);
  if (!_npcToReplicate || !_targetInstance) return;
  const _generatedNpc = world._makeConnectedNpc(_npcToReplicate,_targetInstance,pageIndex || 0);
  if (!_generatedNpc) return
  const uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999); // Prevents event id conflicts
  Object.assign(_generatedNpc, {
    uniqueId: `@${coords.mapId}#${world.getConnectedNpcs(coords.mapId).length}?${uniqueIntegerId}`,
    summonId: npcSummonId,
    id: uniqueIntegerId,
    eventId: uniqueIntegerId,
    summonable: true,
    mapId: coords.mapId
  });

  world.spawnedUniqueIds.push( _generatedNpc.uniqueId );
  const _spawnedIndex = world.spawnedUniqueIds.indexOf(_generatedNpc.uniqueId);
  world.getConnectedNpcs(coords.mapId).push( _generatedNpc );
  
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
  const _nativeMap = world.getMapById(_parentInstance.mapId);
  const _npc = world.getNpcByUniqueId(uniqueId);
  const _spawnedIndex = world.spawnedUniqueIds.indexOf(uniqueId);

  // Destroy NPC :
  world.disableNpc(_npc); // Prevent tick to run this NPC
  world.getConnectedNpcs(_parentInstance.mapId).splice(world.getConnectedNpcs(_parentInstance.mapId).indexOf(_npc), 1);
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

world.npcMoveStraight = (npc,direction,animSkip) => {
  if (!npc || !world.getNpcByUniqueId(npc.uniqueId)) return
  // console.log('[WORLD] npcMoveStraight (1/2)', npc.uniqueId, { x: npc.x,y: npc.y }, {direction});
  if (world.npcCanPass(npc,direction)) {
    const _map = world.getNpcInstance(npc.uniqueId);
    world.getNpcByUniqueId(npc.uniqueId).x = world._roundXWithDirection(_map.mapId, npc.x, direction);
    world.getNpcByUniqueId(npc.uniqueId).y = world._roundYWithDirection(_map.mapId, npc.y, direction);
    MMO_Core["socket"].emitToAll("npc_moving", {
      uniqueId: npc.uniqueId,
      mapId: _map.mapId,
      id: npc.eventId,
      moveSpeed: npc._moveSpeed,
      moveFrequency: npc._moveFrequency,
      direction: direction,
      x: world.getNpcByUniqueId(npc.uniqueId).x,
      y: world.getNpcByUniqueId(npc.uniqueId).y,
      skip: animSkip || false,
    });
    /* console.log('[WORLD] npcMoveStraight (2/2)', npc.uniqueId, {
      x: world.getNpcByUniqueId(npc.uniqueId).x,
      y: world.getNpcByUniqueId(npc.uniqueId).y
    }); */
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
    id: world.getNpcByUniqueId(npc.uniqueId).eventId,
    x: world.getNpcByUniqueId(npc.uniqueId).x,
    y: world.getNpcByUniqueId(npc.uniqueId).y,
    skip: true,
  });
}

world.npcMoveRandom = (npc) => {
  const direction = 2 + Math.floor(Math.random() * 4) * 2;
  return world.npcMoveStraight(npc, direction);
};

/*************************************************************************************** Instance Life Cycle Operations */

world.handleInstanceAction = (action,instance,currentTime) => {
  // This function will interpret/mock a game script then emit 
  // an event to replicate it on every concerned player
  if (!action || !instance || !currentTime) return;
  return;
}

world.setNpcBusyStatus = (uniqueId,initiator) => {
  if (!uniqueId || !world.getNpcByUniqueId(uniqueId)) return;
  world.getNpcByUniqueId(uniqueId).busy = initiator || false;
}
world.toggleNpcBusyStatus = (uniqueId,status) => {
  if (!uniqueId) return;
  world.setNpcBusyStatus(uniqueId, status || !world.getNpcByUniqueId(uniqueId).busy);
}

world.handleNpcTurn = (npc,_currentTime,_cooldown) => {
  // This function will read basic NPC behavior and mock it on
  // server-side then replicate it on every concerned player
  if (!npc || npc.disabled || npc.busy
  || !npc.uniqueId
  || !world.getNpcByUniqueId(npc.uniqueId)
  ) return;

  const currentTime = _currentTime || new Date()
      , cooldown = _cooldown || Infinity;
  
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

world.startInstanceLifecycle = (mapId) => {
  const interval = 1000 / 60; // Tick 1 action every RPG Maker Frame (60f = 1s)
  const tick = setInterval(() => {
    const currentTime = new Date(); // Use precise tick time

    if (!world.getInstanceByMapId(mapId)) { // If no instance, interrupt lifecycle
      clearInterval(tick);
      return;
    }

    world.getInstanceByMapId(mapId).paused = false; // Flag as running
    world.getConnectedNpcs(mapId).map(npc => { // Animate NPCS :
      const moveDuration = npc._moveSpeed < 5
        ? 650 - (npc._moveSpeed * 100)
        : 350 - (npc._moveSpeed * 50)
      const moveCooldown = npc._moveFrequency === 5
        ? interval + moveDuration + 5000 - (1000 * npc._moveFrequency)
        : interval + moveDuration + 5000 - (1000 * npc._moveFrequency) + Math.floor(Math.random() * 2250)
      npc && world.handleNpcTurn(npc, currentTime, moveCooldown)
    });

    if (!world.getInstanceByMapId(mapId).playersOnMap.length) { // If no players on map at tick :
      setTimeout(() => {
        if (!world.getInstanceByMapId(mapId)) {
          // If instance is not loaded anymore :
          clearInterval(tick);
          return;
        } else if (!world.getInstanceByMapId(mapId).playersOnMap.length) {
          // If instance alive && no more players in it
          clearInterval(tick); // Will suspend instance (not kill)
          world.getInstanceByMapId(mapId).paused = true; // Flag paused
        }
      }, world.getInstanceByMapId(mapId).pauseAfter); 
    }
  }, interval);
}

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

/*************************************************************************************** DataProviders */

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
  return world.getInstanceByMapId(mapId).allTiles[x][y];
}

/*************************************************************************************** RPG Maker Mocked Functions */

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
  const _map = world.getInstanceByMapId(mapId);
  return (_map.scrollType === 2 || _map.scrollType === 3) ? x % _map.width : x;
};
world._roundY = function(mapId,y) {
  const _map = world.getInstanceByMapId(mapId);
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
  const _map = world.getInstanceByMapId(mapId);
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
  if (!world.getMapById(mapId)) return; // return collide to prevent move
  const hasSameCoords = (_npc) => (_npc.x && _npc.y) ? (_npc.x === x && _npc.y === y) : (_npc._x === x && _npc._y === y)
  return world._getAllNpcs(mapId).find(npc => hasSameCoords(npc));
}
