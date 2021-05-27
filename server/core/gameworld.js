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
    height: map.height, 
    width: map.width,
    npcsOnMap: [], // Array of Objects
    playersOnMap: [], // Array of String
    createdAt: new Date(),
    lastPlayerLeftAt: null, // Date
    dieAfter: 60000, // When no more players left, kill after X ms
  });
}

world.runInstance = (mapId) => {
  const map = world.getMapById(mapId);
  if (map && world.isMapInstanceable(map) && !world.isMapInstanced(mapId)) {
    world.instancedMaps.push( world.makeInstance(map) );
    console.log('[WORLD] # Started instance', mapId, 'at', new Date())
    world.fetchNpcsFromMap(map);
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
  if (!world.findInstanceById(mapId)['playersOnMap'].includes(playerId)) {
    world.findInstanceById(mapId).playersOnMap.push(playerId); // Add playerId to Array
    console.log('playerJoinInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
  }
}

world.playerLeaveInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (world.findInstanceById(mapId) && world.findInstanceById(mapId).playersOnMap.includes(playerId)) {
    const _players = world.findInstanceById(mapId).playersOnMap;
    world.findInstanceById(mapId).playersOnMap.splice(_players.indexOf(playerId), 1); // Remove playerId from Array
    console.log('playerLeaveInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
    setTimeout(() => world.killInstance(mapId), world.findInstanceById(mapId).dieAfter); // Kill the instance after X ms
  }
}

world.fetchNpcsFromMap = (map) => {
  if (!world.isMapInstanced(map.id)) return;
  for (let npc of world.findInstanceById(map.id).events.filter(event => JSON.stringify(event).includes('<Sync>'))) {
    const _generatedNpc = world.makeConnectedNpc(npc,map);
    if (_generatedNpc.pages.find(p => p.list.find(l => l.code === 108 && l.parameters.includes('<Sync>')))) {
      world.findInstanceById(map.id).npcsOnMap.push( _generatedNpc );
      console.log('Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.id);
    }
  }
}

world.makeConnectedNpc = (npc,instance) => {
  return Object.assign(npc, {
    uniqueId: `@${instance.id}#${instance.npcsOnMap.length}?${npc.id}`, // Every NPC has to be clearly differentiable
    eventId: npc.id, // Event "ID" client-side
    absId: null, // Help to resolve ABS logic (if and when any)
  });
}

world.npcFinder = (uniqueId) => {
  return {
    mapId: parseInt(uniqueId.split('#')[0].split('@')[1]),
    npcIndex: parseInt(uniqueId.split('?')[0].split('#')[1]),
    eventId: parseInt(uniqueId.split('?')[1]),
  };
}