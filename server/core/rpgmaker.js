/*****************************
  RPG Maker Core Mock by Axel Fiolle
*****************************/

var exports = module.exports = {}
  , maker = exports;

maker._canPass = (initiator, direction) => {
  if (!initiator || !direction) return false;
  const _coords = {
    x: initiator.x,
    y: initiator.y
  };
  const _mapId = MMO_Core["gameworld"].getNpcMapId(initiator.uniqueId);
  const x2 = maker._roundXWithDirection(_mapId,_coords.x, direction);
  const y2 = maker._roundYWithDirection(_mapId,_coords.y, direction);
  if (!maker._isValid(_mapId, _coords.x, _coords.y) || !maker._isValid(_mapId, x2, y2)) {
    // console.log(initiator.uniqueId, '!maker._isValid(_mapId, x2, y2)', _mapId, x2, y2)
    return false;
  }
  if (initiator._through) return true;
  if (!maker._isMapPassable(_mapId, _coords.x, _coords.y, direction)) {
    // console.log(initiator.uniqueId, '!maker._isMapPassable(_mapId, _coords.x, _coords.y, direction)', _mapId, _coords.x, _coords.y, direction)
    return false;
  }
  if (maker._isCollidedWithCharacters(_mapId, x2, y2, initiator)) {
    // console.log(initiator.uniqueId, 'maker._isCollidedWithCharacters(_mapId, x2, y2)', _mapId, x2, y2)
    return false;
  }
  return true;
};
maker._getReverseDir = (direction) => {
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
maker._isValid = (mapId,targetX,targetY) => {
  if (targetX < 0 || targetY < 0) return false;
  const _map = MMO_Core["gameworld"].getMapById(mapId);
  if (targetX >= _map.width || targetY >= _map.height) return false;
  return true;
}
maker._isMapPassable = (mapId,x,y,d) => {
  const x2 = maker._roundXWithDirection(mapId,x, d);
  const y2 = maker._roundYWithDirection(mapId,y, d);
  const d2 = maker._getReverseDir(d);
  return maker._isPassable(mapId,x, y, d) && maker._isPassable(mapId,x2, y2, d2);
}
maker._isPassable = (mapId,x,y,d) => {
  return maker._checkPassage(mapId, x, y, (1 << (d / 2 - 1)) & 0x0f);
};

maker._roundX = function(mapId,x) {
  const _map = MMO_Core["gameworld"].getMapById(mapId);
  return (_map.scrollType === 2 || _map.scrollType === 3) ? x % _map.width : x;
};
maker._roundY = function(mapId,y) {
  const _map = MMO_Core["gameworld"].getMapById(mapId);
  return (_map.scrollType === 2 || _map.scrollType === 3) ? y % _map.height : y;
};
maker._xWithDirection = function(x, d) {
  return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
};
maker._yWithDirection = function(y, d) {
  return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
};
maker._roundXWithDirection = function(mapId, x, d) {
  return maker._roundX(mapId, x + (d === 6 ? 1 : d === 4 ? -1 : 0));
};
maker._roundYWithDirection = function(mapId, y, d) {
  return maker._roundY(mapId, y + (d === 2 ? 1 : d === 8 ? -1 : 0));
};

maker.__tilesetId = (mapId,x,y) => {
  return maker._layeredTiles(mapId, x, y);
}
maker._tilesetFlags = (mapId) => {
  const tileset = MMO_Core["gameworld"].tileSets[ MMO_Core["gameworld"].getMapById(mapId).tilesetId ];
  if (tileset) {
    return tileset.flags;
  } else {
    return [];
  }
}
maker._tileId = (mapId,x,y,z) => {
  const _map = MMO_Core["gameworld"].getMapById(mapId);
  const width = _map.width;
  const height = _map.height;
  return _map.data[(z * height + y) * width + x] || 0;
}
maker._layeredTiles = (mapId,x,y) => {
  const tiles = [];
  for (let i = 0; i < 4; i++) {
      tiles.push(maker._tileId(mapId, x, y, 3 - i));
  }
  return tiles;
}
maker._checkPassage = (mapId,x,y,bit) => {
  const flags = maker._tilesetFlags(mapId);
  const tiles = MMO_Core["gameworld"].mapTileFinder(mapId,x,y);
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
maker._isCollidedWithCharacters = (mapId,x,y,initiator) => {
  //MMO_Core.socket.modules.player.subs.player.getPlayer()
  if (!MMO_Core["gameworld"].getMapById(mapId)) return; // prevent .find() on null
  const hasSameCoords = (_event) => _event.x && _event.y && _event.x === x && _event.y === y;
  const isOriginalElement = (_event) => initiator && _event.id === initiator.id;
  return MMO_Core["gameworld"].getAllEntitiesByMapId(mapId).find(obj => obj && !obj._through && hasSameCoords(obj) && !isOriginalElement(obj));
}