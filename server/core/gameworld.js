var exports = module.exports = {}
  , world = exports;

/*****************************
      GAME WORLD 
      by Axel Fiolle
*****************************/

world.gameMaps         = []; // Formated exploitable files from gamedata
world.instanceableMaps = []; // Maps where we you track players and npcs on maps
world.instancedMaps    = []; // Maps that are currently served

// Global function
world.getMapById         = (mapId) => world.gameMaps.find(map => map.id === mapId);
world.findInstanceById   = (id) => world.instancedMaps.find(instance => instance.id === id);
// Testing functions
world.isMapInstanced     = (mapId) => world.instancedMaps.find(i => i.mapId === mapId);
world.isMapInstanceable  = (map) => map.note && map.note.toUpperCase().includes("<SYNC>");;

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
    npcsOnMap: [],
    playersOnMap: [],
    createdAt: new Date(),
    lastPlayerLeftAt: null
  });
}

world.runInstance = (mapId) => {
  const map = world.getMapById(mapId);
  if (map && world.isMapInstanceable(map) && !world.isMapInstanced(mapId)) {
    world.instancedMaps.push( world.makeInstance(map) );
    console.log('[WORLD] # Started instance', mapId, 'at', new Date())
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
  if (!world.isMapInstanced(mapId)) world.runInstance(mapId);
  if (!world.findInstanceById(mapId)['playersOnMap'].includes(playerId)) {
    world.findInstanceById(mapId).playersOnMap.push(playerId);
    console.log('playerJoinInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
  }
}

world.playerLeaveInstance = (playerId,mapId) => {
  if (!world.isMapInstanceable(world.getMapById(mapId))) return;
  if (world.findInstanceById(mapId) && world.findInstanceById(mapId).playersOnMap.includes(playerId)) {
    const _players = world.findInstanceById(mapId).playersOnMap;
    world.findInstanceById(mapId).playersOnMap.splice(_players.indexOf(playerId), 1);
    console.log('playerLeaveInstance', mapId, JSON.stringify(world.findInstanceById(mapId).playersOnMap) );
    if (!world.findInstanceById(mapId).playersOnMap.length) world.killInstance(mapId);
  }
}