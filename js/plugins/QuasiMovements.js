//============================================================================
// Quasi Movement
// Version: 1.299
// Last Update: July 10, 2016
//============================================================================
// ** Terms of Use
// http://quasixi.com/terms-of-use/
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//============================================================================
// How to install:
//  - Save this file as "QuasiMovement.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - - If using YEP_CoreEngine, place this somewhere below it!
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://quasixi.com/quasi-movement-documentation/
//  - - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
//============================================================================

var Imported = Imported || {};
Imported.Quasi_Movement = 1.299;

//=============================================================================
 /*:
 * @plugindesc v1.299
 * Change the way RPG Maker MV handles Movement.
 * <QuasiMovement>
 *
 * @author Quasi       Site: http://quasixi.com
 *
 * @param Grid
 * @desc The amount of pixels you want to move per Movement.
 * Script Default: 1   MV Default: 48
 * @default 1
 *
 * @param Off Grid
 * @desc Allow characters to move faster then the set GRID?
 * Set to true or false
 * @default true
 *
 * @param Tile Size
 * @desc Adjust the size of tile boxes.
 * Script Default: 48
 * @default 48
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Smart Move
 * @desc If the move didn't succeed try again at lower speeds.
 * 0 - Disabled  1 - Speed  2 - Dir  3 - Speed & Dir
 * @default 0
 *
 * @param Old Smart Move Dir
 * @desc Use old smart move dir. New one doesn't work for followers.
 * Set to true or false
 * @default false
 *
 * @param Mid Pass
 * @desc An extra collision check for the midpoint of the Movement.
 * Set to true or false
 * @default false
 *
 * @param Move On Click
 * @desc Set if the player should move with mouse clicks.
 * Default: true
 * @default true
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Diagonal
 * @desc Allow for diagonal movement?
 * Set to true or false
 * @default true
 *
 * @param Diagonal Speed
 * @desc Adjust the speed when moving diagonal.
 * Default: 0
 * @default 0
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Collision
 * @desc The color for collisions in the collision map.
 * default: #ff0000 (red)
 * @default #ff0000
 *
 * @param Water Collision
 * @desc Color for water collisions (Boats and Ships can move on).
 * default: #00ff00
 * @default #00ff00
 *
 * @param Deep Water Collision
 * @desc Color for deep water collisions (Only Ships can move on).
 * default: #0000ff
 * @default #0000ff
 *
 * @param Collision Map Scan
 * @desc How accurate to scan Collision Map, 1 is most Accurate
 * default: 4
 * @default 4
 *
 * @param Water Terrain Tag
 * @desc Set the terrain tag for water tiles.
 * default: 1
 * @default 1
 *
 * @param Deep Water Terrain Tag
 * @desc Set the terrain tag for deep water tiles.
 * default: 2
 * @default 2
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Player Box
 * @desc Default player box. (width, height, ox, oy)
 * default: 36, 24, 6, 24
 * @default 36, 24, 6, 24
 *
 * @param Event Box
 * @desc Default event box. (width, height, ox, oy)
 * default: 36, 24, 6, 24
 * @default 36, 24, 6, 24
 *
 * @param Boat Box
 * @desc Default boat box. (width, height, ox, oy)
 * default: 36, 24, 6, 12
 * @default 36, 24, 6, 12
 *
 * @param Ship Box
 * @desc Default ship box. (width, height, ox, oy)
 * default: 36, 24, 6, 24
 * @default 36, 24, 6, 24
 *
 * @param Airship Box
 * @desc Default airship box. (width, height, ox, oy)
 * default: 36, 36, 6, 6     (Only used for landing)
 * @default 36, 36, 6, 6
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param JSON folder
 * @desc Where to store JSON files.
 * Default: data/
 * @default data/
 *
 * @param Collision Map folder
 * @desc Where to store Collision Map images.
 * Default: img/parallaxes/
 * @default img/parallaxes/
 *
 * @param Region Map folder
 * @desc Where to store Region Map images.
 * Default: img/parallaxes/
 * @default img/parallaxes/
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Use Regions Boxes
 * @desc Set to true if you want to put Box Colliders on regions.
 * default: false
 * @default false
 *
 * @param Show Boxes
 * @desc Show the Box Colliders by default during testing.
 * Set to true or false      - Toggle on/off with F10 during play test
 * @default true
 *
 * @param Draw Tile Boxes
 * @desc Draw the Tile Box Colliders during testing.
 * Set to true or false
 * @default true
 *
 * @param Cache Colliders as Bitmap
 * @desc Cache collider sprites as bitmap
 * Set to true or false
 * @default true
 *
 * @help
 * ============================================================================
 * ** Links
 * ============================================================================
 * For a guide on how to use this plugin go to:
 *
 *   http://quasixi.com/quasi-movement-documentation/
 *
 * Other Links
 *  - https://github.com/quasixi/Quasi-MV-Master-Demo
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
 * =Special thanks to Archeia==================================================
 */
//=============================================================================

//-----------------------------------------------------------------------------
// New Classes

function Sprite_Collider() {
  this.initialize.apply(this, arguments);
}

//-----------------------------------------------------------------------------
// Quasi Movement

var QuasiMovement = {};
(function() {
  QuasiMovement.proccessParameters = function() {
    var parameters   = $plugins.filter(function(p) { return p.description.contains('<QuasiMovement>') && p.status; })[0].parameters;
    this.grid        = Number(parameters['Grid'] || 1);
    this.offGrid     = parameters['Off Grid'].toLowerCase() === 'true';
    this.tileSize    = Number(parameters['Tile Size'] || 48);
    this.diagDist    = Math.sqrt(2 * this.tileSize * this.tileSize);
    this.smartMove   = Number(parameters['Smart Move'] || 0);
    this.oldSmartDir = parameters['Old Smart Move Dir'].toLowerCase() === 'true';
    this.midPass     = parameters['Mid Pass'].toLowerCase() === 'true';
    this.moveOnClick = parameters['Move On Click'].toLowerCase() === 'true';
    this.diagonal    = parameters['Diagonal'].toLowerCase() === 'true';
    this.diagSpeed   = Number(parameters['Diagonal Speed'] || 0);
    this.collision   = parameters['Collision'];
    this.water1      = parameters['Water Collision'];
    this.water2      = parameters['Deep Water Collision'];
    this.scanSize    = Number(parameters['Collision Map Scan']) || 1;
    this.water1Tag   = Number(parameters['Water Terrain Tag'] || 1);
    this.water2Tag   = Number(parameters['Deep Water Terrain Tag'] || 2);
    this.playerBox   = this.stringToAry(parameters['Player Box']);
    this.eventBox    = this.stringToAry(parameters['Event Box']);
    this.boatBox     = this.stringToAry(parameters['Boat Box']);
    this.shipBox     = this.stringToAry(parameters['Ship Box']);
    this.airshipBox  = this.stringToAry(parameters['Airship Box']);
    this.jFolder     = parameters['JSON folder'];
    this.rmFolder    = parameters['Region Map folder'];
    this.cmFolder    = parameters['Collision Map folder'];
    this.useRegions  = parameters['Use Regions Boxes'].toLowerCase() === 'true';
    this.showBoxes   = parameters['Show Boxes'].toLowerCase() === 'true';
    this.drawTileBoxes = parameters['Draw Tile Boxes'].toLowerCase() === 'true';
    this.cachedCollider = parameters['Cache Colliders as Bitmap'].toLowerCase() === 'true';
    this.tileBoxes   = {
      1537: [48, 6, 0, 42],
      1538: [6, 48],
      1539: [[48, 6, 0, 42], [6, 48]],
      1540: [6, 48, 42],
      1541: [[48, 6, 0, 42], [6, 48, 42]],
      1542: [[6, 48], [6, 48, 42]],
      1543: [[48, 6, 0, 42], [6, 48], [6, 48, 42]],
      1544: [48, 6],
      1545: [[48, 6], [48, 6, 0, 42]],
      1546: [[48, 6], [6, 48]],
      1547: [[48, 6], [48, 6, 0, 42], [6, 48]],
      1548: [[48, 6], [6, 48, 42]],
      1549: [[48, 6], [48, 6, 0, 42], [6, 48, 42]],
      1550: [[48, 6], [6, 48], [6, 48, 42]],
      1551: [48, 48], // Impassable A5, B
      2063: [48, 48], // Impassable A1
      2575: [48, 48],
      3586: [6, 48],
      3588: [6, 48, 42],
      3590: [[6, 48], [6, 48, 42]],
      3592: [48, 6],
      3594: [[48, 6], [6, 48]],
      3596: [[48, 6], [6, 48, 42]],
      3598: [[48, 6], [6, 48], [6, 48, 42]],
      3599: [48, 48],  // Impassable A2, A3, A4
      3727: [48, 48]
    };
    this.regionBoxes = {};
    if (this.useRegions) this.loadRegionBoxes();
    var size = this.tileSize / 48;
    for (var key in this.tileBoxes) {
      if (this.tileBoxes.hasOwnProperty(key)) {
        for (var i = 0; i < this.tileBoxes[key].length; i++) {
          if (this.tileBoxes[key][i].constructor === Array) {
            for (var j = 0; j < this.tileBoxes[key][i].length; j++) {
              this.tileBoxes[key][i][j] *= size;
            }
          } else {
            this.tileBoxes[key][i] *= size;
          }
        }
      }
    }
  };

  QuasiMovement.loadRegionBoxes = function() {
    var xhr = new XMLHttpRequest();
    var url = this.jFolder + 'RegionBoxes.json';
    xhr.open('GET', url, true);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
      if (xhr.status < 400) {
        QuasiMovement.regionBoxes = JSON.parse(xhr.responseText);
      }
    };
    xhr.send();
  };

  QuasiMovement.stringToAry = function(string, keepWhiteSpace) {
    var ary = string.split(',');
    ary = ary.map(function(s) {
      if (!keepWhiteSpace) s = s.replace(/\s+/g, '');
      if (/^-?\d+\.?\d*$/.test(s)) return Number(s);
      if (s === "true") return true;
      if (s === "false") return false;
      if (s === "null" || s === "") return null;
      return s;
    });
    if (ary.length === 1) return ary[0];
    return ary;
  };

  QuasiMovement.stringToObjAry = function(string, thisobj) {
    thisobj = thisobj || this;
    var ary = string.split('\n');
    var obj = {};
    ary = ary.filter(function(i) { return i != "" });
    ary.forEach(function(e, i, a) {
      var s = /^(.*):(.*)/.exec(e);
      if (s) {
        var key, newKey = s[1];
        if (obj.hasOwnProperty(key)) {
          var i = 1;
          while (obj.hasOwnProperty(newKey)) {
            newKey = key + String(i);
            i++;
          }
        }
        obj[newKey] = thisobj.stringToAry(s[2]);
      }
    });
    return obj;
  };
  QuasiMovement.proccessParameters();

  var _colliderCounter = 0;

  //-----------------------------------------------------------------------------
  // Polygon_Collider
  //
  // This class handles Polygon Colliders for characters.

  function Polygon_Collider() {
    this.initialize.apply(this, arguments);
  };
  Polygon_Collider.prototype.constructor = Polygon_Collider;

  Polygon_Collider.prototype.initialize = function(points) {
    this._shiftY = 0;
    this.x  = this.y  = 0;
    this.ox = this.oy = 0;
    this._radian = 0;
    this._scale = new Point(1, 1);
    this._pivot = new Point(0, 0);
    this.makeVertices(points);
    this.id = _colliderCounter++;
  };

  Object.defineProperties(Polygon_Collider.prototype, {
    width:  { get: function() { return this._width; }, configurable: true },
    height: { get: function() { return this._height; }, configurable: true },
    center: { get: function() { return this._center; }, configurable: true },
    radian: { get: function() { return this._radian; }, configurable: true}
  });

  Polygon_Collider.prototype.makeVertices = function(points) {
    this._vertices = [];
    this.baseVertices = [];
    points = points.map(function(point) {
      if (point.constructor === Array) {
        var x = Number(point[0]);
        var y = Number(point[1]);
        return new Point(x, y);
      }
      return point;
    });
    for (var i = 0; i < points.length; i++) {
      var x = points[i].x;
      var y = points[i].y;
      this._vertices.push(new Point(x, y));
      this.baseVertices.push(new Point(x, y));
    }
    this.makeVectors();
    this.setBounds();
    this.vertices(true);
  };

  Polygon_Collider.prototype.setBounds = function() {
    var points = [];
    for (var i = 0; i < this.baseVertices.length; i++) {
      var x = this.baseVertices[i].x;
      var y = this.baseVertices[i].y;
      points.push(new Point(x, y));
    }
    points.sort(function(a, b) {
      return a.x - b.x;
    });
    this._xMin = points[0].x;
    this._xMax = points[points.length - 1].x;
    points.sort(function(a, b) {
      return a.y- b.y;
    });
    this._yMin = points[0].y;
    this._yMax = points[points.length - 1].y;
    this._width  = Math.abs(this._xMax - this._xMin);
    this._height = Math.abs(this._yMax - this._yMin);
    this.edges = {};
    var x1 = this._xMin + this.x + this.offsetX();
    var x2 = this._xMax + this.x + this.offsetX();
    var y1 = this._yMin + this.y + this.offsetY();
    var y2 = this._yMax + this.y + this.offsetY();
    var topLeft     = new Point(x1, y1);
    var topRight    = new Point(x2, y1);
    var bottomLeft  = new Point(x1, y2);
    var bottomRight = new Point(x2, y2);
    this.edges.left   = [topLeft, bottomLeft];
    this.edges.right  = [topRight, bottomRight];
    this.edges.top    = [topLeft, topRight];
    this.edges.bottom = [bottomLeft, bottomRight];
    this._center = new Point(topLeft.x + (this._width / 2), topLeft.y + (this._height / 2));
  };

  Polygon_Collider.prototype.makeVectors = function() {
    this.vectors = [];
    for (var i = 0; i < this.baseVertices.length; i++) {
      var x = this.baseVertices[i].x;
      var y = this.baseVertices[i].y;
      var dx = x - this._pivot.x;
      var dy = y - this._pivot.y;
      var vector = {};
      vector.radian = Math.atan2(dy, dx);
      vector.radian += vector.radian < 0 ? Math.PI * 2 : 0;
      vector.dist = Math.sqrt(dx * dx + dy * dy);
      this.vectors.push(vector);
    }
  };

  Polygon_Collider.prototype.reshape = function(points) {
    this.initialize(points);
  };

  Polygon_Collider.prototype.isCircle = function() {
    return false;
  };

  Polygon_Collider.prototype.isPolygon = function() {
    return true;
  };

  Polygon_Collider.prototype.isBox = function() {
    return false;
  };

  Polygon_Collider.prototype.setPivot = function(x, y) {
    this._pivot.x = x;
    this._pivot.y = y;
    this.makeVectors();
    this.vertices(true);
  };

  Polygon_Collider.prototype.centerPivot = function() {
    this._pivot.x = this._width / 2;
    this._pivot.y = this._height / 2;
    this.makeVectors();
    this.rotate(0); // adjusts base vertices
    this.vertices(true);
  };

  Polygon_Collider.prototype.moveto = function(x, y, duration) {
    if (x !== this.x || y !== this.y){
      if (!duration) {
        this.x = x;
        this.y = y;
        this.vertices(true);
        return;
      }
      this.newX = x;
      this.newY = y;
      this._dpx = (x - this.x) / (duration || 1);
      this._dpy = (y - this.y) / (duration || 1);
    }
  };

  Polygon_Collider.prototype.setRadian = function(radian) {
    this.rotate(radian - this._radian);
  };

  Polygon_Collider.prototype.setScale = function(zX, zY) {
    var newZX = zX / this._scale.x;
    var newZY = zY / this._scale.y;
    this.scale(newZX, newZY);
  };

  Polygon_Collider.prototype.rotate = function(radian) {
    this._radian += radian;
    for (var i = 0; i < this.vectors.length; i++) {
      var vector = this.vectors[i];
      vector.radian += radian;
      var x = vector.dist * Math.cos(vector.radian);
      var y = vector.dist * Math.sin(vector.radian);
      this.baseVertices[i].x = Math.round(x);
      this.baseVertices[i].y = Math.round(y);
    }
    this.vertices(true);
  };

  Polygon_Collider.prototype.scale = function(zX, zY) {
    this._scale.x *= zX;
    this._scale.y *= zY;
    for (var i = 0; i < this.vectors.length; i++) {
      var vector = this.vectors[i];
      var x = vector.dist * Math.cos(vector.radian);
      var y = vector.dist * Math.sin(vector.radian);
      x *= zX;
      y *= zY;
      vector.radian = Math.atan2(y, x);
      vector.radian += vector.radian < 0 ? Math.PI * 2 : 0;
      vector.dist = Math.sqrt(x * x + y * y);
      this.baseVertices[i].x = Math.round(x);
      this.baseVertices[i].y = Math.round(y);
    }
    this.vertices(true);
  };

  Polygon_Collider.prototype.rotateTo = function(radian, duration) {
    this._newRadian = radian;
    this._dr = (this._newRadian - this._radian) / (duration || 1);
    if (!duration) this.update();
  };

  Polygon_Collider.prototype.scaleTo = function(zX, zY, duration) {
    this._newZX = zX;
    this._newZY = zY;
    this._dzx = (zX - this._scale.x) / (duration || 1);
    this._dzy = (zY - this._scale.y) / (duration || 1);
    if (!duration) this.update();
  };

  Polygon_Collider.prototype.update = function() {
    this.updatePosition();
    this.updateRotation();
    this.updateScale();
  };

  Polygon_Collider.prototype.updatePosition = function() {
    if (this._dpx || this._dpy) {
      var dpx = this._dpx || 0;
      var dpy = this._dpy || 0;
      if (dpx > 0) {
        this.x = Math.min(this.x + dpx, this.newX);
      } else {
        this.x = Math.max(this.x + dpx, this.newX);
      }
      if (dpy > 0) {
        this.y = Math.min(this.y + dpy, this.newY);
      } else {
        this.y = Math.max(this.y + dpy, this.newY);
      }
      if (this.x === this.newX) this._dpx = null;
      if (this.y === this.newY) this._dpy = null;
      this.vertices(true);
    };
  };

  Polygon_Collider.prototype.updateRotation = function() {
    if (this._dr) {
      var radian = this._radian;
      if (this._dr > 0) {
        radian = Math.min(radian + this._dr, this._newRadian);
      } else {
        radian = Math.max(radian + this._dr, this._newRadian);
      }
      if (radian === this._newRadian) this._dr = 0;
      this.setRadian(radian);
    }
  };

  Polygon_Collider.prototype.updateScale = function() {
    if (this._dzx || this._dzy) {
      var dzx = (this._dzx || 0);
      var dzy = (this._dzy || 0);
      if (this._dzx) {
        if (this._dzx > 0) {
          if (this._newZX < this._scale.x + this._dzx) {
            dzx = Math.abs(this._newZX - this._scale.x) * -1;
            this._dzx = null;
          }
        } else {
          if (this._newZX > this._scale.x + this._dzx) {
            dzx = Math.abs(this._newZX - this._scale.x);
            this._dzx = null;
          }
        }
      }
      if (this._dzy) {
        if (this._dzy > 0) {
          if (this._newZY < this._scale.y + this._dzy) {
            dzy = Math.abs(this._newZY - this._scale.y) * -1;
            this._dzy = null;
          }
        } else {
          if (this._newZY > this._scale.y + this._dzy) {
            dzy = Math.abs(this._newZY - this._scale.y);
            this._dzy = null;
          }
        }
      }
      this.setScale(this._scale.x + dzx, this._scale.y + dzy);
    };
  };

  Polygon_Collider.prototype.vertices = function(reset) {
    if (reset || !this._vertices) {
      var i, j;
      for (i = 0, j = this._vertices.length; i < j; i++) {
        this._vertices[i].x = this.x + this.baseVertices[i].x;
        this._vertices[i].x += this.offsetX();
        this._vertices[i].y = this.y + this.baseVertices[i].y;
        this._vertices[i].y += this.offsetY();
      }
      this.setBounds();
    }
    return this._vertices;
  };

  Polygon_Collider.prototype.gridEdge = function() {
    var x1 = this._xMin + this.x + this.offsetX();
    var x2 = this._xMax + this.x + this.offsetX();
    var y1 = this._yMin + this.y + this.offsetY();
    var y2 = this._yMax + this.y + this.offsetY();
    x1 = Math.floor(x1 / QuasiMovement.tileSize);
    x2 = Math.floor(x2 / QuasiMovement.tileSize);
    y1 = Math.floor(y1 / QuasiMovement.tileSize);
    y2 = Math.floor(y2 / QuasiMovement.tileSize);
    return [x1, x2, y1, y2];
  };

  Polygon_Collider.prototype.offsetX = function() {
    return this.ox + this._pivot.x;
  };

  Polygon_Collider.prototype.offsetY = function() {
    return this.oy + this._pivot.y - this._shiftY;
  };

  Polygon_Collider.prototype.intersects = function(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    if (this.containsPoint(other._center.x, other._center.y)) return true;
    if (other.containsPoint(this._center.x, this._center.y)) return true;
    var i, j, x1, y1;
    for (i = 0, j = other.vertices().length; i < j; i++) {
      x1 = other.vertices()[i].x;
      y1 = other.vertices()[i].y;
      if (this.containsPoint(x1, y1)) return true;
    }
    for (i = 0, j = this.vertices().length; i < j; i++) {
      x1 = this.vertices()[i].x;
      y1 = this.vertices()[i].y;
      if (other.containsPoint(x1, y1)) return true;
    }
    return false
  };

  Polygon_Collider.prototype.inside = function(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    var i, j;
    for (i = 0, j = other.vertices().length; i < j; i++) {
      if (!this.containsPoint(vertices[i].x, vertices[i].y)) {
        return false;
      }
    }
    return true;
  };

  Polygon_Collider.prototype.halfInside = function(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    var vertices = other.vertices();
    var pass = 0;
    var i, j;
    for (i = 0, j = vertices.length; i < j; i++) {
      if (!this.containsPoint(vertices[i].x, vertices[i].y)) {
        pass++;
        if (pass >= j / 2) {
          return false;
        }
      }
    }
    return true;
  };

  Polygon_Collider.prototype.containsPoint = function(x, y) {
    var i;
    var j = this._vertices.length - 1;
    var odd = false;
    var poly = this._vertices;
    for (i = 0; i < this._vertices.length; i++) {
      if (poly[i].y < y && poly[j].y >= y || poly[j].y < y && poly[i].y >= y) {
        if (poly[i].x + (y - poly[i].y) / (poly[j].y - poly[i].y) * (poly[j].x - poly[i].x) < x) {
          odd = !odd;
        }
      }
      j = i;
    }
    return odd;
  };

  QuasiMovement.Polygon_Collider = Polygon_Collider;

  //-----------------------------------------------------------------------------
  // Box_Collider
  //
  // This class handles Box Colliders for characters.

  function Box_Collider() {
    this.initialize.apply(this, arguments);
  };
  Box_Collider.prototype = Object.create(Polygon_Collider.prototype);
  Box_Collider.prototype.constructor = Box_Collider;

  Box_Collider.prototype.initialize = function(w, h, ox, oy, shift_y) {
    var points = [];
    points.push(new Point(0, 0));
    points.push(new Point(w, 0));
    points.push(new Point(w, h));
    points.push(new Point(0, h));
    this.x = this.y = 0;
    this.ox = ox || 0;
    this.oy = oy || 0;
    this._radian = 0;
    this._shiftY = shift_y || 0;
    this._scale = new Point(1, 1);
    this._pivot = new Point(w / 2, h / 2);
    this.makeVertices(points);
    this.rotate(0);
    this.id = _colliderCounter++;
  };

  Box_Collider.prototype.isPolygon = function() {
    return false;
  };

  Box_Collider.prototype.isBox = function() {
    return true;
  };

  QuasiMovement.Box_Collider = Box_Collider;

  //-----------------------------------------------------------------------------
  // Circle_Collider ( More of Ellipise not circle)
  //
  // This class handles Circle Colliders for characters.

  function Circle_Collider() {
    this.initialize.apply(this, arguments);
  };
  Circle_Collider.prototype = Object.create(Polygon_Collider.prototype);
  Circle_Collider.prototype.constructor = Circle_Collider;

  Object.defineProperties(Circle_Collider.prototype, {
    radiusX: { get: function() { return this._radiusX; }, configurable: true },
    radiusY: { get: function() { return this._radiusY; }, configurable: true }
  });

  Circle_Collider.prototype.initialize = function(w, h, ox, oy, shift_y) {
    this._radiusX  = w / 2;
    this._radiusY  = h / 2;
    var points = [];
    for (var i = 7; i >= 0; i--) {
      // start at 3 PI / 4 and go clockwise
      var rad = Math.PI / 4 * i + Math.PI;
      var x = this._radiusX + this._radiusX * Math.cos(rad);
      var y = this._radiusY + this._radiusY * -Math.sin(rad);
      points.push(new Point(x, y));
    }
    this.x = this.y = 0;
    this.ox = ox || 0;
    this.oy = oy || 0;
    this._radian = 0;
    this._shiftY = shift_y || 0;
    this._scale = new Point(1, 1);
    this._pivot = new Point(w / 2, h / 2);
    this.makeVertices(points);
    this.scale(1, 1);
    this.id = _colliderCounter++;
  };

  Circle_Collider.prototype.isCircle = function() {
    return true;
  };

  Circle_Collider.prototype.isPolygon = function() {
    return false;
  };

  Circle_Collider.prototype.scale = function(zX, zY) {
    Polygon_Collider.prototype.scale.call(this, zX, zY);
    this._radiusX *= zX;
    this._radiusY *= zY;
  };

  Circle_Collider.prototype.circlePosition = function(radian) {
    var x = this._radiusX * Math.cos(radian);
    var y = this._radiusY * -Math.sin(radian);
    // Convert to vector
    var dist = Math.sqrt(x * x + y * y);
    // Adjust radian
    radian -= this._radian;
    // Convert back to x / y components
    x = dist * Math.cos(radian);
    y = dist * -Math.sin(radian);
    return [this._center.x + x, this._center.y + y];
  };

  Circle_Collider.prototype.intersects = function(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    if (this.containsPoint(other._center.x, other._center.y)) return true;
    if (other.containsPoint(this._center.x, this._center.y)) return true;
    var x1 = this._center.x;
    var x2 = other._center.x;
    var y1 = this._center.y;
    var y2 = other._center.y;
    var rad = Math.atan2(y1 - y2, x2 - x1);
    rad += rad < 0 ? 2 * Math.PI : 0;
    var pos = this.circlePosition(rad);
    if (other.containsPoint(pos[0], pos[1])) return true;
    if (other.isCircle()) {
      rad = Math.atan2(y2 - y1, x1 - x2);
      rad += rad < 0 ? 2 * Math.PI : 0;
      pos = other.circlePosition(rad);
      if (this.containsPoint(pos[0], pos[1])) return true;
    }
    var i, j;
    for (i = 0, j = other.vertices().length; i < j; i++) {
      x1 = other.vertices()[i].x;
      y1 = other.vertices()[i].y;
      if (this.containsPoint(x1, y1)) return true;
    }
    for (i = 0, j = this.vertices().length; i < j; i++) {
      x1 = this.vertices()[i].x;
      y1 = this.vertices()[i].y;
      if (other.containsPoint(x1, y1)) return true;
    }
    return false;
  };

  Circle_Collider.prototype.oldcontainsPoint = function(x, y) {
    // Old contains point
    // Doesn't work with rotation so using Polygons function
    // Which will work fine unless you try
    // circle v circle collisions
    var h = this._center.x;
    var k = this._center.y;
    var xOverRx = Math.pow(x - h, 2) / Math.pow(this._radiusX, 2);
    var yOverRy = Math.pow(y - k, 2) / Math.pow(this._radiusY, 2);
    return xOverRx + yOverRy <= 1;
  };

  QuasiMovement.Circle_Collider = Circle_Collider

  //-----------------------------------------------------------------------------
  // Game_Temp
  //
  // The game object class for temporary data that is not included in save data.

  var Alias_Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function() {
    Alias_Game_Temp_initialize.call(this);
    this._destinationPX = null;
    this._destinationPY = null;
  };

  Game_Temp.prototype.setPixelDestination = function(x, y) {
    this._destinationPX = x;
    this._destinationPY = y;
    var x1 = $gameMap.roundX(Math.floor(x / $gameMap.tileWidth()));
    var y1 = $gameMap.roundY(Math.floor(y / $gameMap.tileHeight()));
    this.setDestination(x1, y1);
  };

  var Alias_Game_Temp_clearDestination = Game_Temp.prototype.clearDestination;
  Game_Temp.prototype.clearDestination = function() {
    Alias_Game_Temp_clearDestination.call(this);
    this._destinationPX = null;
    this._destinationPY = null;
  };

  Game_Temp.prototype.destinationPX = function() {
    return this._destinationPX;
  };

  Game_Temp.prototype.destinationPY = function() {
    return this._destinationPY;
  };

  //-----------------------------------------------------------------------------
  // Game_Interpreter
  //
  // The interpreter for running event commands.

  var Alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command.toLowerCase() === "quasi") {
      if (args[0].toLowerCase() === "waitbetween") {
        var start = Number(args[1]) || 0;
        var end   = Number(args[2]) || start;
        var wait  = start + Math.randomInt(end - start + 1);
        this.wait(wait);
        return;
      }
      if (args[0].toLowerCase() === "setpassability") {
        if (Number(args[1]) === 0) {
          $gamePlayer.setpassability(Number(args[2]));
        } else {
          $gameMap.event(Number(args[1])).setpassability(Number(args[2]));
        }
        return;
      }
      if (args[0].toLowerCase() === "collider" || args[0].toLowerCase() === "setcollider") {
        var id     = Number(args[1]);
        var type   = args[2];
        var width  = Number(args[3]) || 1;
        var height = Number(args[4]) || 1;
        var ox     = Number(args[5]) || 0;
        var oy     = Number(args[6]) || 0;
        if (id === 0) {
          $gamePlayer.changeCollider(type, width, height, ox, oy);
        } else {
          $gameMap.event(id).changeCollider(type, width, height, ox, oy);
        }
        return;
      }
      if (args[0].toLowerCase() === "collisionmap" || args[0].toLowerCase() === "setcollisionmap") {
        $gameMap.loadCollisionmap(args[1]);
        return;
      }
      if (args[0].toLowerCase() === "regionmap" || args[0].toLowerCase() === "setregionmap") {
        $gameMap.loadCollisionmap(args[1]);
        return;
      }
      if (args[0].toLowerCase() === "transfer") {
        var mapId = Number(args[1]);
        var x = Number(args[2]) / QuasiMovement.tileSize;
        var y = Number(args[3]) / QuasiMovement.tileSize;
        var retain = Number(args[4]) || 0;
        var fade = Number(args[5]) || 0;
        $gamePlayer.reserveTransfer(mapId, x, y, retain, fade);
        return;
      }
      if (args[0].toLowerCase() === "seteventpos") {
        var eventId = Number(args[1]);
        var x = Number(args[2]) / QuasiMovement.tileSize;
        var y = Number(args[3]) / QuasiMovement.tileSize;
        var retain = Number(args[4]) || 0;
        $gameMap.event(eventId).locate(x, y);
        if (retain > 0) {
          $gameMap.event(eventId).setDirection(retain);
        }
        return;
      }
    }
    Alias_Game_Interpreter_pluginCommand.call(this, command, args);
  };

  var Alias_Scene_Load_reloadMapIfUpdated = Scene_Load.prototype.reloadMapIfUpdated;
  Scene_Load.prototype.reloadMapIfUpdated = function() {
    Alias_Scene_Load_reloadMapIfUpdated.call(this);
    QuasiMovement._needsRefresh = true;
  };

  //-----------------------------------------------------------------------------
  // Game_Map
  //
  // The game object class for a map. It contains scrolling and passage
  // determination functions.

  var Alias_Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    QuasiMovement._mapColliders = null;
    QuasiMovement._characterGrid = null;
    QuasiMovement._currentCM = null;
    QuasiMovement._currentRM = null;
    Alias_Game_Map_setup.call(this, mapId);
    this.reloadAllBoxes();
    this.refereshVehicles();
  };

  var Alias_Game_Map_refreshIfNeeded = Game_Map.prototype.refreshIfNeeded;
  Game_Map.prototype.refreshIfNeeded = function() {
    Alias_Game_Map_refreshIfNeeded.call(this);
    if (QuasiMovement._needsRefresh) {
      this.removeAllBoxes();
      this.reloadAllBoxes();
      QuasiMovement._needsRefresh = false;
    }
  };

  Game_Map.prototype.flagAt = function(x, y) {
    var x = x || $gamePlayer.x;
    var y = y || $gamePlayer.y;
    var flags = this.tilesetFlags();
    var tiles = this.allTiles(x, y);
    for (var i = 0; i < tiles.length; i++) {
      var flag = flags[tiles[i]];
      console.log("layer", i, ":", flag);
      if (flag & 0x20)  console.log("layer", i, "is ladder");
      if (flag & 0x40)  console.log("layer", i, "is bush");
      if (flag & 0x80)  console.log("layer", i, "is counter");
      if (flag & 0x100) console.log("layer", i, "is damage");
    }
  };

  Game_Map.prototype.tileWidth = function() {
    return QuasiMovement.tileSize;
  };

  Game_Map.prototype.tileHeight = function() {
    return QuasiMovement.tileSize;
  };

  Game_Map.prototype.reloadAllBoxes = function() {
    QuasiMovement._mapColliders = null;
    QuasiMovement._characterGrid = null;
    this.reloadTileMap();
    var events   = this.events();
    var vehicles = this._vehicles;
    var i, j;
    for (i = 0, j = events.length; i < j; i++) {
      events[i].reloadBoxes();
    }
    for (i = 0, j = vehicles.length; i < j; i++) {
      vehicles[i].reloadBoxes();
    }
    $gamePlayer.reloadBoxes();
    $gamePlayer.followers().forEach(function(follower) {
      follower.reloadBoxes();
    });
  };

  Game_Map.prototype.removeAllBoxes = function() {
    QuasiMovement._mapColliders = null;
    QuasiMovement._characterGrid = null;
    QuasiMovement._currentCM = null;
    QuasiMovement._currentRM = null;
    this.disposeCollisionmap();
  };

  Game_Map.prototype.reloadTileMap = function() {
    QuasiMovement._mapColliders = new Array(this.width());
    for (var x = 0; x < QuasiMovement._mapColliders.length; x++) {
      QuasiMovement._mapColliders[x] = [];
      for (var y = 0; y < this.height(); y++) {
        QuasiMovement._mapColliders[x].push([]);
      }
    }
    QuasiMovement._characterGrid = new Array(this.width());
    for (var x = 0; x < QuasiMovement._characterGrid.length; x++) {
      QuasiMovement._characterGrid[x] = [];
      for (var y = 0; y < this.height(); y++) {
        QuasiMovement._characterGrid[x].push([]);
      }
    }
    var cm = /<cm[=|:](.*?)>/i.exec($dataMap.note);
    var rm = /<rm[=|:](.*?)>/i.exec($dataMap.note);
    var cmb = this.tileset().meta.cmb;
    var cmc = this.tileset().meta.cmc;
    var cmd = this.tileset().meta.cmd;
    var cme = this.tileset().meta.cme;
    QuasiMovement._cmb = cmb ? ImageManager.loadTileset(cmb) : new Bitmap(0, 0);
    QuasiMovement._cmc = cmc ? ImageManager.loadTileset(cmc) : new Bitmap(0, 0);
    QuasiMovement._cmd = cmd ? ImageManager.loadTileset(cmd) : new Bitmap(0, 0);
    QuasiMovement._cme = cme ? ImageManager.loadTileset(cme) : new Bitmap(0, 0);
    QuasiMovement._tilesetCM = {};
    this.setupMapColliders();
    this.loadCollisionmap(QuasiMovement._currentCM || (cm ? cm[1] : null));
    this.loadRegionmap(QuasiMovement._currentRM || (rm ? rm[1] : null));
    QuasiMovement._collisionmap.addLoadListener(function() {
      QuasiMovement._cmb.addLoadListener(function() {
        QuasiMovement._cmc.addLoadListener(function() {
          QuasiMovement._cmd.addLoadListener(function() {
            QuasiMovement._cme.addLoadListener(function() {
              $gameMap.drawTilesetCM();
            });
          });
        });
      });
    });
    if (!this._hasCM && (cmb || cmc || cmd|| cme)) {
      this._hasCM = true;
    }
  };

  Game_Map.prototype.drawTilesetCM = function() {
    var cStart = 256;
    var dStart = 512;
    var eStart = 768;
    var w, h = QuasiMovement.tileSize;
    for (var pos in QuasiMovement._tilesetCM) {
      if (!QuasiMovement._tilesetCM.hasOwnProperty(pos)) return;
      var start, bitmap;
      if (pos < cStart) {
        start = 0;
        bitmap = QuasiMovement._cmb;
      }
      if (pos >= cStart && pos < dStart) {
        start = cStart;
        bitmap = QuasiMovement._cmc;
      }
      if (pos >= dStart && pos < eStart) {
        start = dStart;
        bitmap = QuasiMovement._cmd;
      }
      if (pos >= eStart) {
        start = eStart;
        bitmap = QuasiMovement._cme;
      }
      if (!bitmap) return;
      var pos2 = pos - start;
      var x1 = pos2 % $gameMap.width();
      var y1 = (pos2 - x1) / $gameMap.width();
      x1 *= w;
      y1 *= h;
      for (var i = 0; i < QuasiMovement._tilesetCM[pos].length; i++) {
        var pos3 = QuasiMovement._tilesetCM[pos][i];
        var x2 = pos3 % 8;
        var y2 = (pos3 - x2) / 8;
        if (y2 > 15) {
          y2 -= 16;
          x2 += 8;
        }
        x2 *= w;
        y2 *= h;
        QuasiMovement._collisionmap.blt(bitmap, x2, y2, w, h, x1, y1);
      }
    }
    QuasiMovement._collisionmap._setPixelData();
  };

  Game_Map.prototype.setupMapColliders = function() {
    for (var x = 0; x < this.width(); x++) {
      for (var y = 0; y < this.height(); y++) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        var id = x + y * this.width();
        for (var i = tiles.length - 1; i >= 0; i--) {
          if (i !== 3) {
            if (tiles[i] !== 0) {
              QuasiMovement._tilesetCM[id] = QuasiMovement._tilesetCM[id] || [];
              QuasiMovement._tilesetCM[id].push(tiles[i]);
            }
          }
          var flag = flags[tiles[i]];
          if (flag === 16) continue;
          var box = this.mapCollider(x, y, flag);
          QuasiMovement._mapColliders[x][y] = QuasiMovement._mapColliders[x][y].concat(box);
        }
      }
    }
  };

  Game_Map.prototype.mapCollider = function(x, y, flag) {
    var realFlag = flag;
    if (flag >> 12 > 0) {
      flag = flag.toString(2);
      flag = flag.slice(flag.length - 12, flag.length);
      flag = parseInt(flag, 2);
    }
    if (QuasiMovement.regionBoxes[this.regionId(x, y)]) {
      var regionData = QuasiMovement.regionBoxes[this.regionId(x, y)];
      var boxData = [];
      for (var i = 0; i < regionData.length; i++) {
        var data = [];
        data[0] = regionData[i]["width"] || 0;
        data[1] = regionData[i]["height"] || 0;
        data[2] = regionData[i]["ox"] || 0;
        data[3] = regionData[i]["oy"] || 0;
        data[4] = regionData[i]["tag"] || "";
        boxData[i] = data;
      }
      flag = 0;
    } else {
      var boxData = QuasiMovement.tileBoxes[flag];
    }
    if (!boxData) {
      if (flag & 0x20 || flag & 0x40 || flag & 0x80 || flag & 0x100) {
        boxData = [QuasiMovement.tileSize, QuasiMovement.tileSize, 0, 0];
      } else {
        return [];
      }
    }
    var tilebox = [];
    if (boxData[0].constructor === Array){
      var i = 0;
      boxData.forEach(function(box) {
        var newBox = this.makeTileCollider(x, y, realFlag, box, i);
        tilebox.push(newBox);
        i++;
      }, this);
    } else {
      var newBox = this.makeTileCollider(x, y, realFlag, boxData);
      tilebox.push(newBox);
    }
    return tilebox;
  };

  Game_Map.prototype.makeTileCollider = function(x, y, flag, boxData, index) {
    var x1 = x * QuasiMovement.tileSize;
    var y1 = y * QuasiMovement.tileSize;
    var ox = boxData[2] || 0;
    var oy = boxData[3] || 0;
    var w  = boxData[0];
    var h  = boxData[1];
    var newBox = new Box_Collider(w, h, ox, oy);
    newBox.moveto(x1, y1);
    newBox.note      = boxData[4] || "";
    newBox.flag      = flag;
    newBox.terrain   = flag >> 12;
    newBox.isWater1  = flag >> 12 === QuasiMovement.water1Tag || /<water1>/i.test(newBox.note);
    newBox.isWater2  = flag >> 12 === QuasiMovement.water2Tag || /<water2>/i.test(newBox.note);
    newBox.isLadder  = (flag & 0x20)  || /<ladder>/i.test(newBox.note);
    newBox.isBush    = (flag & 0x40)  || /<bush>/i.test(newBox.note);
    newBox.isCounter = (flag & 0x80)  || /<counter>/i.test(newBox.note);
    newBox.isDamage  = (flag & 0x100) || /<damage>/i.test(newBox.note);
    var vx = x * this.height() * this.width();
    var vy = y * this.height();
    var vz = index || (QuasiMovement._mapColliders[x][y] ? QuasiMovement._mapColliders[x][y].length : 0);
    newBox.location  = vx + vy + vz;
    if (newBox.isWater2) {
      newBox.color = QuasiMovement.water2;
    } else if (newBox.isWater1) {
      newBox.color = QuasiMovement.water1;
    } else if (newBox.isLadder || newBox.isBush || newBox.isDamage) {
      newBox.color = '#ffffff';
    } else {
      newBox.color = QuasiMovement.collision;
    }
    return newBox;
  };

  Game_Map.prototype.loadCollisionmap = function(cm) {
    if (cm) {
      QuasiMovement._collisionmap = ImageManager.loadBitmap(QuasiMovement.cmFolder, cm);
      this._hasCM = true;
    } else {
      QuasiMovement._collisionmap = new Bitmap(this.width() * QuasiMovement.tileSize, this.height() * QuasiMovement.tileSize);
      this._hasCM = false;
    }
    if (cm || QuasiMovement.drawTileBoxes) {
      QuasiMovement._collisionmap.addLoadListener(function() {
        $gameMap.drawTileBoxes();
      });
    }
    QuasiMovement._currentCM = cm;
  };

  Game_Map.prototype.loadRegionmap = function(rm) {
    if (rm) {
      QuasiMovement._regionmap = ImageManager.loadBitmap(QuasiMovement.rmFolder, rm);
    } else {
      QuasiMovement._regionmap = new Bitmap(0,0);
    }
    QuasiMovement._currentRM = rm;
  };

  Game_Map.prototype.disposeCollisionmap = function() {
    if (QuasiMovement._collisionmap) QuasiMovement._collisionmap = null;
    if (QuasiMovement._regionmap)    QuasiMovement._regionmap = null;
  };

  Game_Map.prototype.drawTileBoxes = function() {
    for (var x = 0; x < this.width(); x++) {
      for (var y = 0; y < this.height(); y++) {
        var boxes = QuasiMovement._mapColliders[x][y];
        for (var i = 0; i < boxes.length; i++) {
          var x1 = boxes[i].x;
          var y1 = boxes[i].y;
          var ox = boxes[i].ox;
          var oy = boxes[i].oy;
          var w  = boxes[i].width;
          var h  = boxes[i].height;
          var color = boxes[i].color || QuasiMovement.collision;
          QuasiMovement._collisionmap.fillRect(x1 + ox, y1 + oy, w, h, color);
        }
      }
    }
  };

  Game_Map.prototype.collisionMapPass = function(collider, dir, inpassableColors) {
    if (!QuasiMovement._collisionmap.isReady()) return false;
    if (collider.isCircle()) {
      return this.collisionMapCirclePass(collider, dir, inpassableColors);
    }
    return this.collisionMapBoxPass(collider, dir, inpassableColors);
  };

  Game_Map.prototype.insidePassableOnly = function(collider, inpassableColors) {
    //inpassableColors.splice(inpassableColors.indexOf("#000000"), 1);
    return this.collisionMapBoxPass(collider, "top", inpassableColors) &&
           this.collisionMapBoxPass(collider, "bottom", inpassableColors);
  };

  Game_Map.prototype.collisionMapBoxPass = function(collider, dir, inpassableColors) {
    if (collider.radian !== 0) {
      return this.collisionMapPolyPass(collider, dir, inpassableColors);
    }
    var x1 = Math.floor(collider.edges[dir][0].x);
    var x2 = Math.floor(collider.edges[dir][1].x);
    var y1 = Math.floor(collider.edges[dir][0].y);
    var y2 = Math.floor(collider.edges[dir][1].y);
    for (var x = x1; x <= x2;) {
      for (var y = y1; y <= y2;) {
        if (inpassableColors.contains(QuasiMovement._collisionmap.getColor(x, y))) {
          return false;
        }
        y = Math.min(y2 + 1, y + QuasiMovement.scanSize);
      }
      x = Math.min(x2 + 1, x + QuasiMovement.scanSize);
    }
    return true;
  };

  Game_Map.prototype.collisionMapPolyPass = function(collider, dir, inpassableColors) {
    var points = collider.vertices().slice();
    var finalPoints = [];
    var midPoints = [];
    if (["top", "bottom"].contains(dir)) {
      var startPoint = this.collisionMapPoints(collider, dir, collider._xMin, 0);
      var endPoint   = this.collisionMapPoints(collider, dir, collider._xMax, 0);
    } else {
      var startPoint = this.collisionMapPoints(collider, dir, collider._yMin, 1);
      var endPoint   = this.collisionMapPoints(collider, dir, collider._yMax, 1);
      var horz = true;
    }
    var minIndex  = collider.baseVertices.indexOf(startPoint);
    var maxIndex  = collider.baseVertices.indexOf(endPoint);
    var endPoint  = collider.vertices()[maxIndex];
    var firstHalf = points.splice(0, minIndex);
    points = points.concat(firstHalf);
    if (["bottom", "left"].contains(dir)) {
      points.reverse();
      points.unshift(points.pop());
    }
    for (var i = 0; i < points.length - 1; i++) {
      var x1 = points[i].x;
      var y1 = points[i].y;
      var x2 = points[i + 1].x;
      var y2 = points[i + 1].y;
      var rad = Math.atan2(y1 - y2, x2 - x1);
      if (horz) {
        var steps = Math.abs(y2 - y1) / QuasiMovement.scanSize;
        var slope  = (x2 - x1) / steps;
        var inc = y1 > y2 ? -1 : 1;
      } else {
        var steps = Math.abs(x2 - x1) / QuasiMovement.scanSize;
        var slope  = (y2 - y1) / steps;
        var inc = x1 > x2 ? -1 : 1;
      }
      var a1 = a2 = horz ? y1 : x1;
      while ((a1 - a2) <= steps) {
        if (inpassableColors.contains(QuasiMovement._collisionmap.getColor(x1, y1))) {
          return false;
        }
        a1++;
        y1 += horz ? inc : slope;
        x1 += horz ? slope : inc;
      }
      if (x2 === endPoint.x && y2 === endPoint.y) {
        break;
      }
    }
    return true;
  };

  Game_Map.prototype.collisionMapPoints = function(collider, dir, value, axis) {
    var point = collider.baseVertices.filter(function(p) {
      return axis === 0 ? p.x === value : p.y === value;
    });
    point.sort(function(a, b) {
      if (axis === 0) {
        if (dir === "top") {
          return a.y - b.y;
        } else {
          return b.y - a.y;
        }
      } else {
        if (dir === "left") {
          return a.x - b.x;
        } else {
          return b.x - a.x;
        }
      }
    });
    point = point[0];
    for (var i = 0; i < collider.baseVertices.length; i++) {
      if (collider.baseVertices[i].x === point.x && collider.baseVertices[i].y === point.y) {
        return collider.baseVertices[i];
      }
    }
  };

  Game_Map.prototype.collisionMapCirclePass = function(collider, dir, inpassableColors) {
    switch (dir) {
      case "bottom":
        var r1 = Math.PI;
        var r2 = Math.PI * 2;
        var s = Math.PI / collider.width;
        break;
      case "left":
        var r1 = Math.PI / 2;
        var r2 = 3 * Math.PI / 2;
        var s = Math.PI / collider.height;
        break;
      case "right":
        var r1 = -Math.PI / 2;
        var r2 = Math.PI / 2;
        var s = Math.PI / collider.height;
        break;
      case "top":
        var r1 = 0;
        var r2 = Math.PI;
        var s = Math.PI / collider.width;
        break;
    }
    var r3;
    while (r1 <= r2) {
      r3 = r1 + collider.radian;
      var pos = collider.circlePosition(r3);
      var x = Math.floor(pos[0]);
      var y = Math.floor(pos[1]);
      if (inpassableColors.contains(QuasiMovement._collisionmap.getColor(x, y))) {
        return false;
      }
      r1 += s * QuasiMovement.scanSize;
    }
    return true;
  };

  Game_Map.prototype.getTileBoxesAt = function(collider, ignore, self) {
    if (!QuasiMovement._mapColliders) return [];
    ignore = ignore || function() { return false; };
    var edge = collider.gridEdge();
    var x1   = edge[0];
    var x2   = edge[1];
    var y1   = edge[2];
    var y2   = edge[3];
    var boxes = [];
    for (var x = x1; x <= x2; x++) {
      for (var y = y1; y <= y2; y++) {
        if (x < 0 || x >= this.width())  continue;
        if (y < 0 || y >= this.height()) continue;
        for (var i = 0; i < QuasiMovement._mapColliders[x][y].length; i++) {
          if (ignore(QuasiMovement._mapColliders[x][y][i], self)) continue;
          if (collider.intersects(QuasiMovement._mapColliders[x][y][i])) {
            boxes.push(QuasiMovement._mapColliders[x][y][i]);
          }
        }
      }
    }
    return boxes;
  };

  Game_Map.prototype.getCharactersAt = function(collider, ignore, self) {
    ignore = ignore || function() { return false; };
    var edge = collider.gridEdge();
    var x1   = edge[0];
    var x2   = edge[1];
    var y1   = edge[2];
    var y2   = edge[3];
    var charas = [];
    var x, y, i;
    for (x = x1; x <= x2; x++) {
      for (y = y1; y <= y2; y++) {
        if (x < 0 || x >= this.width())  continue;
        if (y < 0 || y >= this.height()) continue;
        for (i = 0; i < QuasiMovement._characterGrid[x][y].length; i++) {
          if (ignore(QuasiMovement._characterGrid[x][y][i], self)) continue;
          if (collider.intersects(QuasiMovement._characterGrid[x][y][i].collider())) {
            if (!charas.contains(QuasiMovement._characterGrid[x][y][i])) {
              charas.push(QuasiMovement._characterGrid[x][y][i]);
            }
          }
        }
      }
    }
    return charas;
  };

  Game_Map.prototype.removeFromCharacterGrid = function(chara) {
    if (!QuasiMovement._characterGrid) return;
    var box  = chara.collider();
    var edge = box.gridEdge();
    var x1   = edge[0];
    var x2   = edge[1];
    var y1   = edge[2];
    var y2   = edge[3];
    for (; x1 <= x2; x1++) {
      for (; y1 <= y2; y1++) {
        var grid = QuasiMovement._characterGrid[x1][y1];
        var i = grid.indexOf(chara);
        if (i >= 0) {
          grid.splice(i, 1);
        }
      }
    }
  };

  Game_Map.prototype.updateCharacterGrid = function(chara, prev) {
    if (!QuasiMovement._characterGrid) return;
    var box  = chara.collider();
    var edge = box.gridEdge();
    var x1   = edge[0];
    var x2   = edge[1];
    var y1   = edge[2];
    var y2   = edge[3];
    var boxesInside = 0;
    var totalBoxes  = (prev[1] - prev[0]) * (prev[3] - prev[2]);
    for (var x = prev[0]; x <= prev[1]; x++) {
      for (var y = prev[2]; y <= prev[3]; y++) {
        if (x < 0 || x >= this.width()) {
          continue;
        } else if (y < 0 || y >= this.height()) {
          continue;
        }
        if (QuasiMovement._characterGrid[x][y].contains(chara)) {
          boxesInside++;
        }
      }
    }
    if (boxesInside == totalBoxes) return;
    for (var x = prev[0]; x <= prev[1]; x++) {
      for (var y = prev[2]; y <= prev[3]; y++) {
        if (x < 0 || x >= this.width()) {
          continue;
        } else if (y < 0 || y >= this.height()) {
          continue;
        }
        var i = QuasiMovement._characterGrid[x][y].indexOf(chara);
        if (i === -1) continue;
        QuasiMovement._characterGrid[x][y].splice(i, 1);
      }
    }
    for (var x = x1; x <= x2; x++) {
      for (var y = y1; y <= y2; y++) {
        if (x < 0 || x >= this.width()) {
          continue;
        } else if (y < 0 || y >= this.height()) {
          continue;
        }
        QuasiMovement._characterGrid[x][y].push(chara);
      }
    }
  };

  Game_Map.prototype.getPixelRegion = function(x, y) {
    if (QuasiMovement._regionmap) {
      if (!QuasiMovement._regionmap.isReady()) return 0;
      return QuasiMovement._regionmap.getColor(x || $gamePlayer.cx(), y || $gamePlayer.cy());
    }
    return 0;
  };

  Game_Map.prototype.adjustPX = function(x) {
    return this.adjustX(x / QuasiMovement.tileSize) * QuasiMovement.tileSize;
  };

  Game_Map.prototype.adjustPY = function(y) {
    return this.adjustY(y / QuasiMovement.tileSize) * QuasiMovement.tileSize;
  };

  Game_Map.prototype.roundPX = function(x) {
    return this.isLoopHorizontal() ? x.mod(this.width() * QuasiMovement.tileSize) : x;
  };

  Game_Map.prototype.roundPY = function(y) {
    return this.isLoopVertical() ? y.mod(this.height() * QuasiMovement.tileSize) : y;
  };

  Game_Map.prototype.pxWithDirection = function(x, d, dist) {
    return x + (d === 6 ? dist : d === 4 ? -dist : 0);
  };

  Game_Map.prototype.pyWithDirection = function(y, d, dist) {
    return y + (d === 2 ? dist : d === 8 ? -dist : 0);
  };

  Game_Map.prototype.roundPXWithDirection = function(x, d, dist) {
    return this.roundPX(x + (d === 6 ? dist : d === 4 ? -dist : 0));
  };

  Game_Map.prototype.roundPYWithDirection = function(y, d, dist) {
    return this.roundPY(y + (d === 2 ? dist : d === 8 ? -dist : 0));
  };

  Game_Map.prototype.deltaPX = function(x1, x2) {
    var result = x1 - x2;
    if (this.isLoopHorizontal() && Math.abs(result) > (this.width() * QuasiMovement.tileSize) / 2) {
      if (result < 0) {
        result += this.width() * QuasiMovement.tileSize;
      } else {
        result -= this.width() * QuasiMovement.tileSize;
      }
    }
    return result;
  };

  Game_Map.prototype.deltaPY = function(y1, y2) {
    var result = y1 - y2;
    if (this.isLoopVertical() && Math.abs(result) > (this.height() * QuasiMovement.tileSize) / 2) {
      if (result < 0) {
        result += this.height() * QuasiMovement.tileSize;
      } else {
        result -= this.height() * QuasiMovement.tileSize;
      }
    }
    return result;
  };

  Game_Map.prototype.canvasToMapPX = function(x) {
    var tileWidth = this.tileWidth();
    var originX = this._displayX * tileWidth;
    return this.roundPX(originX + x);
  };

  Game_Map.prototype.canvasToMapPY = function(y) {
    var tileHeight = this.tileHeight();
    var originY = this._displayY * tileHeight;
    return this.roundPY(originY + y);
  };

  //-----------------------------------------------------------------------------
  // Game_Actor
  //
  // The game object class for an actor.

  Game_Actor.prototype.turnEndOnMap = function() {
    var steps  = $gameParty.steps();
    var offset = steps % ($gamePlayer.freqThreshold() / $gamePlayer.moveTiles());
    var totalSteps = steps - offset;
    if (totalSteps % this.stepsForTurn() === 0) {
      this.onTurnEnd();
      if (this.result().hpDamage > 0) {
        this.performMapDamage();
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //
  // The superclass of Game_Character. It handles basic information, such as
  // coordinates and images, shared by all characters.

  Object.defineProperties(Game_CharacterBase.prototype, {
      px: { get: function() { return this._px; }, configurable: true },
      py: { get: function() { return this._py; }, configurable: true }
  });

  var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    Alias_Game_CharacterBase_initMembers.call(this);
    this._px = this._py = this._realPX = this._realPY = 0;
    this._diagonal = false;
    this._grid = QuasiMovement.grid;
    this._gridPosition = [];
    this._currentPosition;
    this._passabilityLevel = 0;
    var isPlayer = this.constructor === Game_Player;
    this._smartMoveDir   = isPlayer && (QuasiMovement.smartMove == 2 || QuasiMovement.smartMove == 3);
    this._smartMoveSpeed = isPlayer && (QuasiMovement.smartMove == 1 || QuasiMovement.smartMove == 3);
    this._dir4Diag = {
      8: [[4, 8], [6, 8]],
      6: [[6, 8], [6, 2]],
      2: [[4, 2], [6, 2]],
      4: [[4, 8], [4, 2]]
    };
    this._moveCount = 0;
    this._freqCount = 0;
    this._diagonal  = false;
    this._radian    = 0;
    this._currentRad = this._targetRad = 0;
    this._piviotX = this._piviotY = 0;
    this._radiusL = this._radisuH = 0;
    this._angularSpeed;
    this._adjustFrameSpeed = false;
  }

  Game_CharacterBase.prototype.notes = function() {
    if (this.constructor === Game_Player || this.constructor === Game_Follower) {
      return this.actor() ? this.actor().actor().note : "";
    } else if (this.constructor === Game_Event) {
      return this.event().note;
    } else {
      return "";
    }
  };

  Game_CharacterBase.prototype.setSelfSwitch = function() {
    return;
  };

  Game_CharacterBase.prototype.direction8 = function(horz, vert) {
    if (horz === 4 && vert === 8) return 7;
    if (horz === 4 && vert === 2) return 1;
    if (horz === 6 && vert === 8) return 9;
    if (horz === 6 && vert === 2) return 3;
    return 5;
  };

  Game_CharacterBase.prototype.isMoving = function() {
    return this._moveCount > 0;
  };

  Game_CharacterBase.prototype.startedMoving = function() {
    return this._realPX !== this._px || this._realPY !== this._py;
  };

  Game_CharacterBase.prototype.isStopping = function() {
    return !this.isMoving() && !this.isJumping();
  };

  Game_CharacterBase.prototype.startedStopping = function() {
    return !this.startedMoving() && !this.isJumping();
  };

  Game_CharacterBase.prototype.isDiagonal = function() {
    return this._diagonal;
  };

  Game_CharacterBase.prototype.isArcing = function() {
    return this._currentRad !== this._targetRad;
  };

  Game_CharacterBase.prototype.gridChanged = function() {
    return this._gridPosition !== this.collider().gridEdge();
  };

  Game_CharacterBase.prototype.positionChanged = function() {
    if (!this._currentPosition) return true;
    return this._currentPosition.x !== this.collider()._center.x ||
    this._currentPosition.y !== this.collider()._center.y;
  };

  var Alias_Game_CharacterBase_setPosition = Game_CharacterBase.prototype.setPosition;
  Game_CharacterBase.prototype.setPosition = function(x, y) {
    Alias_Game_CharacterBase_setPosition.call(this, x, y);
    this._px = this._realPX = x * QuasiMovement.tileSize;
    this._py = this._realPY = y * QuasiMovement.tileSize;
    if (this.constructor === Game_Event) {
      if (!this.page()) return;
    }
    if (!this._collider) this.collider();
    this.moveAllBoxes(this.px, this.py);
  };

  Game_CharacterBase.prototype.setPixelPosition = function(x, y) {
    this.setPosition(x / QuasiMovement.tileSize, y / QuasiMovement.tileSize);
  };

  var Alias_Game_CharacterBase_copyPosition = Game_CharacterBase.prototype.copyPosition;
  Game_CharacterBase.prototype.copyPosition = function(character) {
    Alias_Game_CharacterBase_copyPosition.call(this, character);
    this._px = character._px;
    this._py = character._py;
    this._realPX = character._realPX;
    this._realPY = character._realPY;
    if (!this._collider) this.collider();
    this.moveAllBoxes(this.px, this.py);
  };

  var Alias_Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
  Game_CharacterBase.prototype.setDirection = function(d) {
    if (!this.isDirectionFixed() && d) {
      if ([1, 3, 7, 9].contains(d)) {
        this._diagonal = d;
        this.resetStopCount();
        return;
      } else {
        this._diagonal = false;
      }
    }
    Alias_Game_CharacterBase_setDirection.call(this, d);
  };

  Game_CharacterBase.prototype.setPassability = function(lvl) {
    this._passabilityLevel = Number(lvl) || 0;
  };

  Game_CharacterBase.prototype.passabilityLevel = function() {
    return this._passabilityLevel;
  };

  Game_CharacterBase.prototype.canPass = function(x, y, dir) {
    return this.canPixelPass(x * QuasiMovement.tileSize, y * QuasiMovement.tileSize, dir);
  };

  Game_CharacterBase.prototype.canPixelPass = function(x, y, dir, dist) {
    var dist = dist || this.moveTiles();
    var x1 = $gameMap.roundPXWithDirection(x, dir, dist);
    var y1 = $gameMap.roundPYWithDirection(y, dir, dist);
    if ($gameMap.isLoopHorizontal() || $gameMap.isLoopVertical()) {
      this.collider(dir).moveto(x1, y1);
      var edge = this.collider(dir).gridEdge();
      var x2   = edge[0];
      var x3   = edge[1];
      var y2   = edge[2];
      var y3   = edge[3];
      if (x2 < 0 || x3 > $gameMap.width() - 1 ||
          y2 < 0 || y3 > $gameMap.height() - 1) {
        var w = ($gameMap.width() - 1) * QuasiMovement.tileSize;
        var h = ($gameMap.height() - 1) * QuasiMovement.tileSize;
        x2 = x1 < 0 ? x1 + w : (x1 / 48 > $gameMap.width() - 1 ? x1 - w : x1);
        y2 = y1 < 0 ? y1 + h : (y1 / 48 > $gameMap.height() - 1 ? y1 - h : y1);
        if (!this.collisionCheck(x1, y1, dir, dist) && !this.collisionCheck(x2, y2, dir, dist)) {
          this.collider(dir).moveto(this._px, this._py);
          return false;
        }
        return true;
      }
    }
    if (!this.collisionCheck(x1, y1, dir, dist)) {
      this.collider(dir).moveto(this._px, this._py);
      return false;
    }
    return true;
  };

  Game_CharacterBase.prototype.canPassDiagonally = function(x, y, horz, vert) {
    return this.canPixelPassDiagonally(x * QuasiMovement.tileSize, y * QuasiMovement.tileSize, horz, vert);
  };

  Game_CharacterBase.prototype.canPixelPassDiagonally = function(x, y, horz, vert, dist) {
    var dist = dist || this.moveTiles();
    var x1 = $gameMap.roundPXWithDirection(x, horz, dist);
    var y1 = $gameMap.roundPYWithDirection(y, vert, dist);
    if (this._smartMoveDir) {
      return (this.canPixelPass(x, y, vert, dist) && this.canPixelPass(x, y1, horz, dist)) ||
             (this.canPixelPass(x, y, horz, dist) && this.canPixelPass(x1, y, vert, dist));
    } else {
      return (this.canPixelPass(x, y, vert, dist) && this.canPixelPass(x, y1, horz, dist)) &&
             (this.canPixelPass(x, y, horz, dist) && this.canPixelPass(x1, y, vert, dist));
    }
  };

  Game_CharacterBase.prototype.middlePass = function(x, y, dir, dist) {
    var dist = dist / 2 || this.moveTiles() / 2;
    var x1 = $gameMap.roundPXWithDirection(x, this.reverseDir(dir), dist);
    var y1 = $gameMap.roundPYWithDirection(y, this.reverseDir(dir), dist);
    this.collider(dir).moveto(x1, y1);
    if ($gameMap._hasCM) {
      var edge = {2: "bottom", 4: "left", 6: "right", 8: "top"};
      if (dir === 5) {
        if (!$gameMap.collisionMapPass(this.collider(dir), "top", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "bottom", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "left", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "right", this.inpassableColors()) ) {
          return false;
        }
      } else {
        if (!$gameMap.collisionMapPass(this.collider(dir), edge[dir], this.inpassableColors())) {
          return false;
        }
      }
    } else {
      if (this.collideWithTileBox(dir)) return false;
    }
    if (this._passabilityLevel === 1 || this._passabilityLevel === 2) {
      if (!$gameMap.insidePassableOnly(this.collider(dir), this.inpassableColors()) && !this.insidePassableOnlyBox(dir)) {
        return false;
      }
    }
    if (this.collideWithCharacter(dir)) return false;
    this.collider(dir).moveto(x, y);
    return true;
  };

  Game_CharacterBase.prototype.collisionCheck = function(x, y, dir, dist) {
    this.collider(dir).moveto(x, y);
    if (!this.valid(dir)) return false;
    if (this.isThrough() || this.isDebugThrough()) return true;
    if (QuasiMovement.midPass && this._passabilityLevel !== 5) {
      if (!this.middlePass(x, y, dir, dist)) return false;
    }
    if ($gameMap._hasCM) {
      var edge = {2: "bottom", 4: "left", 6: "right", 8: "top"};
      if (dir === 5) {
        if (!$gameMap.collisionMapPass(this.collider(dir), "top", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "bottom", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "left", this.inpassableColors()) ||
            !$gameMap.collisionMapPass(this.collider(dir), "right", this.inpassableColors()) ) {
          return false;
        }
      } else {
        if (!$gameMap.collisionMapPass(this.collider(dir), edge[dir], this.inpassableColors())) {
          return false;
        }
      }
    } else {
      if (this.collideWithTileBox(dir)) return false;
    }
    if (this._passabilityLevel === 1 || this._passabilityLevel === 2) {
      if (!$gameMap.insidePassableOnly(this.collider(dir), this.inpassableColors()) && !this.insidePassableOnlyBox(dir)) {
        return false;
      }
    }
    if (this.collideWithCharacter(dir)) return false;
    return true;
  };

  Game_CharacterBase.prototype.valid = function(dir) {
    var edge = this.collider(dir).gridEdge();
    var x1   = edge[0];
    var x2   = edge[1];
    var y1   = edge[2];
    var y2   = edge[3];
    var maxW = $gameMap.width();
    var maxH = $gameMap.height();
    if (!$gameMap.isLoopHorizontal()) {
      if (x1 < 0 || x2 >= maxW) return false;
    }
    if (!$gameMap.isLoopVertical()) {
      if (y1 < 0 || y2 >= maxH) return false;
    }
    return true;
  };

  Game_CharacterBase.prototype.collideWithTileBox = function(dir) {
    var self = this;
    var boxes = $gameMap.getTileBoxesAt(this.collider(dir), function(tile) {
      if (!self.inpassableColors().contains(tile.color)) return true;
      return false;
    });
    return boxes.length > 0;
  };

  Game_CharacterBase.prototype.collideWithCharacter = function(dir) {
    var charas = $gameMap.getCharactersAt(this.collider(dir), this.ignoreCollisionWithCharacter, this);
    return charas.length > 0;
  };

  Game_CharacterBase.prototype.ignoreCollisionWithCharacter = function(chara, self) {
    if (chara.isThrough() || chara === self || !chara.isNormalPriority()) {
      return true;
    }
    if (self.constructor === Game_Player) {
      if (self.isInVehicle() || chara.constructor === Game_Vehicle) {
        return chara._type === self._vehicleType;
      }
    }
    return false;
  };

  Game_CharacterBase.prototype.insidePassableOnlyBox = function(dir) {
    var self = this;
    var boxes = $gameMap.getTileBoxesAt(this.collider(dir), function(tile) {
      if (self.inpassableColors().contains(tile.color)) return true;
      return false;
    });
    if (boxes.length === 0) return false;
    var pass = 0;
    var vertices = this.collider(dir).vertices();
    for (var i = 0; i < vertices.length; i++) {
      for (var j = 0; j < boxes.length; j++) {
        if (boxes[j].containsPoint(vertices[i].x, vertices[i].y)) {
          pass++;
        }
      }
    }
    return pass >= 4;
  };

  Game_CharacterBase.prototype.passableColors = function() {
    var colors = ["#ffffff", "#000000"];
    switch (this._passabilityLevel) {
      case 1:
      case 3:
        colors.push(QuasiMovement.water1);
        break;
      case 2:
      case 4:
        colors.push(QuasiMovement.water1);
        colors.push(QuasiMovement.water2);
        break;
    }
    return colors;
  };

  Game_CharacterBase.prototype.inpassableColors = function() {
    var colors = [QuasiMovement.collision, QuasiMovement.water1, QuasiMovement.water2];
    switch (this._passabilityLevel) {
      case 1:
      case 3:
        if (this._passabilityLevel ===  1) {
          colors.push("#ffffff", "#000000");
        }
        colors.splice(1, 1);
        break;
      case 2:
      case 4:
        if (this._passabilityLevel ===  2) {
          colors.push("#ffffff", "#000000");
        }
        colors.splice(1, 2);
        break;
    }
    return colors;
  };

  Game_CharacterBase.prototype.moveTiles = function() {
    return this._grid < this.frameSpeed() ? (QuasiMovement.offGrid ? this.frameSpeed() : this._grid) : this._grid;
  };

  Game_CharacterBase.prototype.frameSpeed = function(multi) {
    if (this.adjustFrameSpeed()) {
      multi = multi || 1;
    } else {
      multi = 1;
    }
    return this.distancePerFrame() * QuasiMovement.tileSize * Math.abs(multi);
  };

  Game_CharacterBase.prototype.adjustFrameSpeed = function() {
    return this._adjustFrameSpeed;
  };

  Game_CharacterBase.prototype.angularSpeed = function() {
    return this._angularSpeed || this.frameSpeed() / this._radiusL;
  };

  Game_CharacterBase.prototype.radianCos = function() {
    return Math.cos(this._radian);
  };

  Game_CharacterBase.prototype.radianSin = function() {
    return Math.sin(this._radian);
  };

  var Alias_Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
  Game_CharacterBase.prototype.realMoveSpeed = function() {
    var speed = Alias_Game_CharacterBase_realMoveSpeed.call(this);
    if (this.constructor === Game_Follower) return speed;
    return speed - (this.isDiagonal() ? QuasiMovement.diagSpeed : 0);
  };

  Game_CharacterBase.prototype.freqThreshold = function() {
    return QuasiMovement.tileSize;
  };

  Game_CharacterBase.prototype.checkEventTriggerTouchFront = function(d) {
    var x2 = $gameMap.roundPXWithDirection(this.px, d, this.moveTiles());
    var y2 = $gameMap.roundPYWithDirection(this.py, d, this.moveTiles());
    this.checkEventTriggerTouch(x2, y2);
  };

  Game_CharacterBase.prototype.update = function() {
    var prevX = this._realPX;
    var prevY = this._realPY;
    if (this.collider().constructor === Object) {
      this.reloadBoxes();
    }
    if (this.collider()) {
      this.collider().update();
    }
    if (this.startedStopping()) {
      this.updateStop();
    }
    if (this.isArcing()) {
      this.updateArc();
    }
    if (this.isJumping()) {
      this.updateJump();
    } else if (this.startedMoving()) {
      this.updateMove();
    }
    this.updateAnimation();
    if (this.positionChanged()) {
      this.onPositionChange();
    }
    if (prevX === this._realPX && prevY === this._realPY) {
      this._moveCount = 0;
    } else {
      this._moveCount++;
    }
  };

  Game_CharacterBase.prototype.updateArc = function() {
    if (this._locked) return;
    if (this._currentRad < this._targetRad) {
      var newRad = Math.min(this._currentRad + this.angularSpeed(), this._targetRad);
    }
    if (this._currentRad > this._targetRad) {
      var newRad = Math.max(this._currentRad - this.angularSpeed(), this._targetRad);
    }
    var x1 = this._piviotX + this._radiusL * Math.cos(newRad);
    var y1 = this._piviotY + this._radiusH * -Math.sin(newRad);
    this._currentRad = newRad;
    this._px = this._realPX = x1;
    this._py = this._realPY = y1;
    this._x = this._realX = this._px / QuasiMovement.tileSize;
    this._y = this._realY = this._py / QuasiMovement.tileSize;
    this.collider().moveto(x1, y1);
    this.checkEventTriggerTouchFront(this._direction);
  };

  Game_CharacterBase.prototype.updateMove = function() {
    if (this._px < this._realPX) {
      this._realPX = Math.max(this._realPX - this.frameSpeed(this.radianCos()), this._px);
    }
    if (this._px > this._realPX) {
      this._realPX = Math.min(this._realPX + this.frameSpeed(this.radianCos()), this._px);
    }
    if (this._py < this._realPY) {
      this._realPY = Math.max(this._realPY - this.frameSpeed(this.radianSin()), this._py);
    }
    if (this._py > this._realPY) {
      this._realPY = Math.min(this._realPY + this.frameSpeed(this.radianSin()), this._py);
    }

    this._x = this._px / QuasiMovement.tileSize;
    this._y = this._py / QuasiMovement.tileSize;
    this._realX = this._realPX / QuasiMovement.tileSize;
    this._realY = this._realPY / QuasiMovement.tileSize;

    if (this.constructor === Game_Event) {
      if (!this._locked) this._freqCount += this.moveTiles();
    } else if (this.constructor === Game_Player)  {
      if (!this._locked) this._freqCount += this.moveTiles();
    }

    if (!this.startedMoving()) {
      this.refreshBushDepth();
      this._adjustFrameSpeed = false;
    }
  };

  var Alias_Game_CharacterBase_updateJump = Game_CharacterBase.prototype.updateJump;
  Game_CharacterBase.prototype.updateJump = function() {
    Alias_Game_CharacterBase_updateJump.call(this);
    this._px = this._realPX = this._x * QuasiMovement.tileSize;
    this._py = this._realPY = this._y * QuasiMovement.tileSize;
    this.moveAllBoxes(this.px, this.py);
  };

  Game_CharacterBase.prototype.updateAnimationCount = function() {
    if (this.isMoving() && this.hasWalkAnime()) {
      this._animationCount += 1.5;
    } else if (this.hasStepAnime() || !this.isOriginalPattern()) {
      this._animationCount++;
    }
  };

  Game_CharacterBase.prototype.updatePattern = function() {
    if (!this.hasStepAnime() && this.isStopping()) {
      this.resetPattern();
    } else {
      this._pattern = (this._pattern + 1) % this.maxPattern();
    }
  };

  Game_CharacterBase.prototype.onPositionChange = function() {
    if (this.gridChanged()) this.updateGridChange();
    this._currentPosition = this.collider()._center;
  };

  Game_CharacterBase.prototype.updateGridChange = function() {
    $gameMap.updateCharacterGrid(this, this._gridPosition);
    this._gridPosition = this.collider().gridEdge();
  };

  Game_CharacterBase.prototype.refreshBushDepth = function() {
    if (this.isNormalPriority() && !this.isObjectCharacter() &&
        this.isOnBush() && !this.isJumping()) {
      if (!this.startedMoving()) this._bushDepth = 12;
    } else {
      this._bushDepth = 0;
    }
  };

  Game_CharacterBase.prototype.isOnLadder = function() {
    if (!this._collider) return false;
    var self = this;
    var boxes = $gameMap.getTileBoxesAt(this.collider(), function(tile) {
      if (!tile.isLadder) return true;
      if (!tile.containsPoint(Math.floor(self.cx()), Math.floor(self.cy()))) {
        return true;
      }
      return false;
    });
    return boxes.length > 0;
  };

  Game_CharacterBase.prototype.isOnBush = function() {
    if (!this._collider) return false;
    var self = this;
    var boxes = $gameMap.getTileBoxesAt(this.collider(), function(tile) {
      if (!tile.isBush) return true;
      if (!tile.containsPoint(Math.floor(self.cx()), Math.floor(self.cy()))) {
        return true;
      }
      return false;
    });
    return boxes.length > 0;
  };

  Game_CharacterBase.prototype.pixelJump = function(xPlus, yPlus) {
    return this.jump(xPlus / QuasiMovement.tileSize, yPlus / QuasiMovement.tileSize);
  };

  Game_CharacterBase.prototype.pixelJumpForward = function(dist, dir) {
    dir = dir || this._direction;
    dist = dist / QuasiMovement.tileSize;
    var x = dir === 6 ? dist : dir === 4 ? -dist : 0;
    var y = dir === 2 ? dist : dir === 8 ? -dist : 0;
    this.jump(x, y);
  };

  Game_CharacterBase.prototype.pixelJumpBackward = function(dist) {
    this.pixelJumpFixed(this.reverseDir(this.direction()), dist);
  };

  Game_CharacterBase.prototype.pixelJumpFixed = function(dir, dist) {
    var lastDirectionFix = this.isDirectionFixed();
    this.setDirectionFix(true);
    this.pixelJumpForward(dist, dir);
    this.setDirectionFix(lastDirectionFix);
  };

  Game_CharacterBase.prototype.jumpForward = function(dist, dir) {
    dist = dist || 1;
    dir = dir || this._direction;
    var x = dir === 6 ? dist : dir === 4 ? -dist : 0;
    var y = dir === 2 ? dist : dir === 8 ? -dist : 0;
    this.jump(x, y);
  };

  Game_CharacterBase.prototype.jumpBackward = function(dist) {
    this.jumpFixed(this.reverseDir(this.direction()), dist);
  };

  Game_CharacterBase.prototype.jumpFixed = function(dir, dist) {
    var lastDirectionFix = this.isDirectionFixed();
    this.setDirectionFix(true);
    this.jumpForward(dist, dir);
    this.setDirectionFix(lastDirectionFix);
  };

  Game_CharacterBase.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPixelPass(this.px, this.py, d));
    var originalSpeed = this._moveSpeed;
    if (this._smartMoveSpeed) this.smartMoveSpeed(d);
    this._radian = this.directionToRadian(d);
    if (this.isMovementSucceeded()) {
      this._diagonal = false;
      this.setDirection(d);
      this._px = $gameMap.roundPXWithDirection(this._px, d, this.moveTiles());
      this._py = $gameMap.roundPYWithDirection(this._py, d, this.moveTiles());
      this._realPX = $gameMap.pxWithDirection(this._px, this.reverseDir(d), this.moveTiles());
      this._realPY = $gameMap.pyWithDirection(this._py, this.reverseDir(d), this.moveTiles());
      this._moveCount++;
      this.increaseSteps();
      if (this.constructor === Game_Player) {
        this._followers.addMove(this._px, this._py, this.realMoveSpeed(), d);
      }
    } else {
      this.setDirection(d);
      this.checkEventTriggerTouchFront(d);
    }
    this._moveSpeed = originalSpeed;
    if (!this.isMovementSucceeded() && this._smartMoveDir) {
      if (QuasiMovement.oldSmartDir) {
        var dir = this._dir4Diag[d];
        if (this.canPixelPassDiagonally(this.px, this.py, dir[0][0], dir[0][1])){
          this.moveDiagonally(dir[0][0], dir[0][1]);
        } else if (this.canPixelPassDiagonally(this.px, this.py, dir[1][0], dir[1][1])) {
          this.moveDiagonally(dir[1][0], dir[1][1]);
        }
      } else {
        this.smartMoveDir8(d);
      }
    }
  };

  Game_CharacterBase.prototype.smartMoveDir8 = function(dir) {
    var x1 = this.px;
    var y1 = this.py;
    var dist = this.moveTiles();
    var horz = [4, 6].contains(dir) ? true : false;
    var steps = horz ? this.collider().height : this.collider().width;
    steps /= 2;
    for (var i = 0; i < 2; i++) {
      var sign = i === 0 ? 1 : -1;
      var j = 0;
      var x2 = x1;
      var y2 = y1;
      while (j < steps) {
        j += dist;
        if (horz) {
          x2 = $gameMap.roundPXWithDirection(x1, dir, dist);
          y2 = y1 + j * sign;
        } else {
          y2 = $gameMap.roundPYWithDirection(y1, dir, dist);
          x2 = x1 + j * sign;
        }
        var pass = this.canPixelPass(x2, y2, 5);
        if (pass) break;
      }
      if (pass) break;
    }
    if (pass) {
      var collider = this.collider();
      var x3 = $gameMap.roundPXWithDirection(x1, dir, dist);
      var y3 = $gameMap.roundPYWithDirection(y1, dir, dist);
      collider.moveto(x3, y3);
      var self = this;
      var events = $gameMap.getCharactersAt(collider, function(e) {
        return (e === self || e.constructor === Game_Follower ||
          e.constructor === Game_Vehicle || e._erased ||
          !/<nosmartdir>/i.test(e.notes()));
      });
      if (events.length > 0) {
        collider.moveto(x1, y1);
        return;
      }
      this._realPX = this._px;
      this._realPY = this._py;
      this._px = x2;
      this._py = y2;
      this._radian = Math.atan2(this._py - y2, x2 - this._px);
      this._radian += this._radian < 0 ? 2 * Math.PI : 0;
      this._moveCount++;
      this.increaseSteps();
      this._followers.addMove(this._px, this._py, this.realMoveSpeed(), dir);
    }
  };

  Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
    this.setMovementSuccess(this.canPixelPassDiagonally(this.px, this.py, horz, vert));
    var originalSpeed = this._moveSpeed;
    if (this._smartMoveSpeed) this.smartMoveSpeed([horz, vert], true);
    this._radian = this.directionToRadian(this.direction8(horz, vert));
    if (this.isMovementSucceeded()) {
      this._px = $gameMap.roundPXWithDirection(this._px, horz, this.moveTiles());
      this._py = $gameMap.roundPYWithDirection(this._py, vert, this.moveTiles());
      this._realPX = $gameMap.pxWithDirection(this._px, this.reverseDir(horz), this.moveTiles());
      this._realPY = $gameMap.pyWithDirection(this._py, this.reverseDir(vert), this.moveTiles());
      this._moveCount++;
      this.increaseSteps();
      if (this.constructor === Game_Player) {
        this._followers.addMove(this._px, this._py, this.realMoveSpeed(), this._direction);
      }
      this._diagonal = this.direction8(horz, vert);
    } else {
      this._diagonal = false;
    }
    if (this._direction === this.reverseDir(horz)) {
      this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
      this.setDirection(vert);
    }
    this._moveSpeed = originalSpeed;

    if (!this.isMovementSucceeded() && this._smartMoveDir) {
      if (this.canPixelPass(this.px, this.py, horz)) {
        this.moveStraight(horz);
      } else if (this.canPixelPass(this.px, this.py, vert)) {
        this.moveStraight(vert);
      }
    }
  };

  Game_CharacterBase.prototype.fixedMove = function(dir, dist) {
    if (dir === 5) {
      dir = this._direction;
    }
    if ([1, 3, 7, 9].contains(dir)) {
      var diag = {
        1: [4, 2],
        3: [6, 2],
        7: [4, 8],
        9: [6, 8]
      }
      return this.fixedDiagMove(diag[dir][0], diag[dir][1], dist);
    }
    this.setMovementSuccess(this.canPixelPass(this.px, this.py, dir, dist));
    this._radian = this.directionToRadian(dir);
    if (this.isMovementSucceeded()) {
      this.setDirection(dir);
      this._px = $gameMap.roundPXWithDirection(this._px, dir, dist);
      this._py = $gameMap.roundPYWithDirection(this._py, dir, dist);
      this._realPX = $gameMap.pxWithDirection(this._px, this.reverseDir(dir), dist);
      this._realPY = $gameMap.pyWithDirection(this._py, this.reverseDir(dir), dist);
      this._moveCount++;
      this.increaseSteps();
      this._diagonal = false;
      if (this.constructor === Game_Player) {
        this._followers.addMove(this._px, this._py, this.realMoveSpeed(), dir);
      }
    } else {
      this.setDirection(dir);
      this.checkEventTriggerTouchFront(dir);
    }
  };

  Game_CharacterBase.prototype.fixedDiagMove = function(horz, vert, dist) {
    this.setMovementSuccess(this.canPixelPassDiagonally(this.px, this.py, horz, vert));
    this._radian = this.directionToRadian(this.direction8(horz, vert));
    if (this.isMovementSucceeded()) {
      this._px = $gameMap.roundPXWithDirection(this._px, horz, dist);
      this._py = $gameMap.roundPYWithDirection(this._py, vert, dist);
      this._realPX = $gameMap.pxWithDirection(this._px, this.reverseDir(horz), dist);
      this._realPY = $gameMap.pyWithDirection(this._py, this.reverseDir(vert), dist);
      this._moveCount++;
      this.increaseSteps();
      if (this.constructor === Game_Player) {
        this._followers.addMove(this._px, this._py, this.realMoveSpeed(), this._direction);
      }
      this._diagonal = this.direction8(horz, vert);
    } else {
      this._diagonal = false;
    }
    if (this._direction === this.reverseDir(horz)) {
      this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
      this.setDirection(vert);
    }
  };

  Game_CharacterBase.prototype.fixedMoveBackward = function(dist) {
    var lastDirectionFix = this.isDirectionFixed();
    this.setDirectionFix(true);
    this.fixedMove(this.reverseDir(this.direction()), dist);
    this.setDirectionFix(lastDirectionFix);
  };

  Game_CharacterBase.prototype.slideTo = function(x, y) {
    this._radian = Math.atan2(this._py - y, this._px - x);
    this._radian = this._radian < 0 ? rad + 2 * Math.PI : this._radian;
    this._adjustFrameSpeed = true;
    this._px = x;
    this._py = y;
    this._moveCount++;
    this.increaseSteps();
  };

  Game_CharacterBase.prototype.arc = function(px, py, dRad, cc, frames) {
    var cc = cc ? 1 : -1;
    var dx = this._px - px;
    var dy = this._py - py;
    var rad = Math.atan2(-(dy), dx);
    rad += rad < 0 ? 2 * Math.PI : 0;
    var rl = Math.sqrt(dy * dy + dx * dx);
    this._dRad = dRad || 2 * Math.PI;
    this._currentRad = rad;
    this._targetRad  = rad + this._dRad * cc;
    this._piviotX = px;
    this._piviotY = py;
    this._radiusL = this._radiusH = rl;
    this._angularSpeed = frames ? this._dRad / frames : null;
  };

  Game_CharacterBase.prototype.smartMoveSpeed = function(dir, diag) {
    while (!this.isMovementSucceeded() ) {
      if (this._moveSpeed < 1) break;
      this._moveSpeed--;
      if (diag){
        this.setMovementSuccess(this.canPixelPassDiagonally(this.px, this.py, dir[0], dir[1]));
      } else {
        this.setMovementSuccess(this.canPixelPass(this.px, this.py, dir));
      }
    }
  };

  Game_CharacterBase.prototype.reloadBoxes = function() {
    this._collider = null;
    this.collider();
    $gameMap.updateCharacterGrid(this, []);
    this._gridPosition = this.collider().gridEdge();
  };

  Game_CharacterBase.prototype.collider = function(direction) {
    var direction = direction || this._direction;
    if (!this._collider) this.setupCollider();
    return this._collider[direction] || this._collider[5];
  };

  Game_CharacterBase.prototype.changeCollider = function(shape, width, height, ox, oy) {
    var collider;
    if (shape === "box")    collider = new Box_Collider(width, height, ox, oy);
    if (shape === "circle") collider = new Circle_Collider(width, height, ox, oy);
    this._collider = [];
    this._collider[5] = collider;
    this._collider[5].moveto(this.px, this.py);
  };

  Game_CharacterBase.prototype.resetCollider = function() {
    this.setupCollider();
  };

  Game_CharacterBase.prototype.setupCollider = function() {
    this._collider = [];
    if (this.constructor === Game_Player || this.constructor === Game_Follower) {
      var box  = QuasiMovement.playerBox;
      var note = this.notes();
    } else if (this.constructor === Game_Event) {
      var box  = QuasiMovement.eventBox;
      var note = this.comments();
    } else if (this.constructor === Game_Vehicle) {
      if (this.isBoat()) {
        var box = QuasiMovement.boatBox;
      } else if (this.isShip()) {
        var box = QuasiMovement.shipBox;
      } else if (this.isAirship()) {
        var box = QuasiMovement.airshipBox;
      }
    } else {
      var box = QuasiMovement.eventBox;
    }
    if (note) {
      var multibox = /<collider>([\s\S]*)<\/collider>/.exec(note);
      if (!multibox) {
        multibox  = /<bbox>([\s\S]*)<\/bbox>/.exec(note);
        var oldmulti = true;
      }
      var singlebox = /<collider[=|:]([0-9a-zA-Z,-\s]*)>/.exec(note);
      if (!singlebox) {
        singlebox = /<bbox[=|:]([0-9a-zA-Z,-\s]*)>/.exec(note);
        var oldsingle = true;
      }
    }
    if (multibox) {
      var multi = QuasiMovement.stringToObjAry(multibox[1]);
      var boxW  = box[0] || 0;
      var boxH  = box[1] || 0;
      var boxOX = box[2] || 0;
      var boxOY = box[3] || 0;
      this._collider[5] = new Box_Collider(boxW, boxH, boxOX, boxOY, this.shiftY());
      for (var key in multi) {
        if (multi.hasOwnProperty(key)) {
          var box = multi[key];
          var t = "box";
          var i = 0;
          if (!oldmulti) {
            var t = box[0].toLowerCase();
            var i = 1;
          }
          var w  = box[0 + i] || boxW;
          var h  = box[1 + i] || boxH;
          var ox = typeof box[2 + i] === 'number' ? box[2 + i] : boxOX;
          var oy = typeof box[3 + i] === 'number'  ? box[3 + i] : boxOY;
          if (t === "box") {
            this._collider[key] = new Box_Collider(w, h, ox, oy, this.shiftY());
          } else if (t === "circle"){
            this._collider[key] = new Circle_Collider(w, h, ox, oy, this.shiftY());
          }
        }
      }
      this.moveAllBoxes(this.px, this.py);
    } else {
      var boxW  = box[0] || 0;
      var boxH  = box[1] || 0;
      var boxOX = box[2] || 0;
      var boxOY = box[3] || 0;
      var t = "box";
      var i = 0;
      if (singlebox) {
        var newBox = QuasiMovement.stringToAry(singlebox[1]);
        if (!oldsingle) {
          var t = newBox[0].toLowerCase();
          var i = 1;
        }
        boxW  = newBox[0 + i] || boxW;
        boxH  = newBox[1 + i] || boxH;
        boxOX = typeof newBox[2 + i] === 'number' ? newBox[2 + i] : boxOX;
        boxOY = typeof newBox[3 + i] === 'number' ? newBox[3 + i] : boxOY;
      }
      if (t === "box") {
        this._collider[5] = new Box_Collider(boxW, boxH, boxOX, boxOY, this.shiftY());
      } else if (t === "circle") {
        this._collider[5] = new Circle_Collider(boxW, boxH, boxOX, boxOY, this.shiftY());
      }
      this._collider[5].moveto(this.px, this.py);
    }
  }

  Game_CharacterBase.prototype.moveAllBoxes = function(newX, newY) {
    newX = typeof newX === 'number' ? newX : this.px;
    newY = typeof newY === 'number' ? newY : this.py;
    for (var i = 0; i < this._collider.length; i++) {
      if (this._collider[i]) this._collider[i].moveto(newX, newY);
    }
  };

  Game_CharacterBase.prototype.copyCollider = function() {
    var w = this.collider().width;
    var h = this.collider().height;
    var ox = this.collider().ox;
    var oy = this.collider().oy;
    if (this.collider().isCircle()) {
      var collider = new Circle_Collider(w, h, ox, oy, this.shiftY());
    } else {
      var collider = new Box_Collider(w, h, ox, oy, this.shiftY());
    }
    collider.moveto(this.px, this.py);
    return collider;
  };

  Game_CharacterBase.prototype.cx = function() {
    return this.collider()._center.x;
  };

  Game_CharacterBase.prototype.cy = function() {
    return this.collider()._center.y;
  };

  //-----------------------------------------------------------------------------
  // Game_Character
  //
  // The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

  var Alias_Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
  Game_Character.prototype.processMoveCommand = function(command) {
    var gc = Game_Character;
    var params = command.parameters;
    if (command.code === gc.ROUTE_SCRIPT) {
      var mmove = /mmove\((.*)\)/i.exec(params[0]);
      var qmove = /qmove\((.*)\)/i.exec(params[0]);
      var arc   = /arc\((.*)\)/i.exec(params[0]);
      var arcTo = /arcto\((.*)\)/i.exec(params[0]);
      if (mmove) return this.subMmove(mmove[1]);
      if (qmove) return this.subQmove(qmove[1]);
      if (arc)   return this.subArc(arc[1]);
      if (arcTo) return this.subArcTo(arcTo[1]);
    }
    switch (command.code) {
    case "arc":
      this.arc(params[0], params[1], params[2], params[3]);
      break;
    case "fixedMove":
      this.fixedMove(params[0], params[1]);
      break;
    case "fixedMoveBackward":
      this.fixedMoveBackward(params[0]);
      break;
    case "fixedMoveForward":
      this.fixedMove(this.direction(), params[0]);
      break;
    case gc.ROUTE_MOVE_DOWN:
      this.subQmove("2, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_LEFT:
      this.subQmove("4, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_RIGHT:
      this.subQmove("6, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_UP:
      this.subQmove("8, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_LOWER_L:
      this.subQmove("1, 1," + QuasiMovement.diagDist);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_LOWER_R:
      this.subQmove("3, 1," + QuasiMovement.diagDist);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_UPPER_L:
      this.subQmove("7, 1," + QuasiMovement.diagDist);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_UPPER_R:
      this.subQmove("9, 1," + QuasiMovement.diagDist);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_FORWARD:
      this.subQmove("5, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_MOVE_BACKWARD:
      this.subQmove("0, 1," + QuasiMovement.tileSize);
      this._moveRouteIndex++;
      break;
    case gc.ROUTE_TURN_DOWN:
    case gc.ROUTE_TURN_LEFT:
    case gc.ROUTE_TURN_RIGHT:
    case gc.ROUTE_TURN_UP:
    case gc.ROUTE_TURN_90D_R:
    case gc.ROUTE_TURN_90D_L:
    case gc.ROUTE_TURN_180D:
    case gc.ROUTE_TURN_90D_R_L:
    case gc.ROUTE_TURN_RANDOM:
    case gc.ROUTE_TURN_TOWARD:
    case gc.ROUTE_TURN_AWAY:
      this._freqCount = this.freqThreshold();
      break;
    }
    Alias_Game_Character_processMoveCommand.call(this, command);
  };

  Game_Character.prototype.subArc = function(settings) {
    var cmd = {};
    cmd.code = "arc";
    cmd.parameters = QuasiMovement.stringToAry(settings);
    this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
    this._moveRoute.list.splice(this._moveRouteIndex, 1);
    this._moveRouteIndex--;
  };

  Game_Character.prototype.subArcTo = function(settings) {
    settings = QuasiMovement.stringToAry(settings);
    if (settings.constructor !== Array) settings = [Number(settings)];
    var chara = settings.shift();
    chara = chara === 0 ? $gamePlayer : $gameMap.event(chara);
    var x = chara._px;
    var y = chara._py;
    settings.unshift(y);
    settings.unshift(x);
    var cmd = {};
    cmd.code = "arc";
    cmd.parameters = settings;
    this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
    this._moveRoute.list.splice(this._moveRouteIndex, 1);
    this._moveRouteIndex--;
  };

  Game_Character.prototype.subMmove = function(settings) {
    settings = QuasiMovement.stringToAry(settings);
    var dir  = settings[0];
    var amt  = settings[1];
    var mult = settings[2] || 1;
    var tot  = amt * mult;
    for (var i = 0; i <= tot; i++) {
      var cmd  = {};
      cmd.code = "fixedMove";
      cmd.parameters = [dir, this.moveTiles()];
      if (dir ===0) {
        cmd.code = "fixedMoveBackward";
        cmd.parameters = [this.moveTiles()];
      }
      this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
    }
    this._moveRoute.list.splice(this._moveRouteIndex, 1);
    this._moveRouteIndex--;
  };

  Game_Character.prototype.subQmove = function(settings) {
    settings  = QuasiMovement.stringToAry(settings);
    var dir   = settings[0];
    var amt   = settings[1];
    var multi = settings[2] || 1;
    var tot   = amt * multi;
    var steps = Math.floor(tot / this.moveTiles());
    var moved = 0;
    for (var i = 0; i < steps; i++) {
      moved += this.moveTiles();
      var cmd  = {};
      cmd.code = "fixedMove";
      cmd.parameters = [dir, this.moveTiles()];
      if (dir ===0) {
        cmd.code = "fixedMoveBackward";
        cmd.parameters = [this.moveTiles()];
      }
      this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
    }
    if (moved < tot) {
      var cmd = {};
      cmd.code = "fixedMove";
      cmd.parameters = [dir, tot - moved];
      if (dir === 0) {
        cmd.code = "fixedMoveBackward";
        cmd.parameters = [tot - moved];
      }
      this._moveRoute.list.splice(this._moveRouteIndex + 1 + i, 0, cmd);
    }
    this._moveRoute.list.splice(this._moveRouteIndex, 1);
    this._moveRouteIndex--;
  };

  Game_Character.prototype.deltaPXFrom = function(x) {
      return $gameMap.deltaPX(this.cx(), x);
  };

  Game_Character.prototype.deltaPYFrom = function(y) {
      return $gameMap.deltaPY(this.cy(), y);
  };

  Game_Character.prototype.pixelDistanceFrom = function(x, y) {
    return $gameMap.distance(this.cx(), this.cy(), x, y);
  };

  Game_Character.prototype.pixelDistanceFromWithBox = function(other) {
    // to do or not, not really needed
  };

  Game_Character.prototype.radianTowards = function(chara) {
    var x1 = chara.cx();
    var y1 = chara.cy();
    var x2 = this.cx();
    var y2 = this.cy();
    var radian = Math.atan2(-(y1 - y2), x1 - x2);
    radian += radian < 0 ? 2 * Math.PI : 0;
    return radian;
  };

  Game_Character.prototype.moveRandom = function() {
    var d = 2 + Math.randomInt(4) * 2;
    if (this.canPixelPass(this.px, this.py, d)) {
      this.moveStraight(d);
    }
  };

  Game_Character.prototype.moveTowardGridPos = function(x, y) {
    this.moveTowardPos(x * QuasiMovement.tileSize, y * QuasiMovement.tileSize);
  };

  Game_Character.prototype.moveTowardPos = function(x, y) {
    var ex = x;
    var ey = y;
    var x1 = this._px;
    var y1 = this._py;
    var nodes = [];
    for (var i = 1; i < 5; i++) {
      var dir = i * 2;
      if (this.canPixelPass(x1, y1, dir)) {
        var x2 = $gameMap.roundPXWithDirection(x1, dir, this.moveTiles());
        var y2 = $gameMap.roundPYWithDirection(y1, dir, this.moveTiles());
        var score = Math.abs(x2 - ex) + Math.abs(y2 - ey);
        var node = {
          x: x2,
          y: y2,
          f: score
        }
        if (nodes.length === 0) {
          nodes.push(node);
        } else {
          if (score < nodes[0].f) {
            nodes.unshift(node);
          } else {
            nodes.push(node);
          }
        }
      }
    }
    var next = nodes[0];
    if (!next) return;
    var sx = next.x - x1;
    var sy = next.y - y1;
    if (Math.abs(sx) > Math.abs(sy)) {
      this.moveStraight(sx > 0 ? 6 : 4);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 2 : 8);
    }
  };

  Game_Character.prototype.moveTowardCharacter = function(character) {
    var ex = character._px;
    var ey = character._py;
    var x1 = this._px;
    var y1 = this._py;
    var nodes = [];
    for (var i = 1; i < 5; i++) {
      var dir = i * 2;
      var originalThrough = character._through;
      character.setThrough(true);
      if (this.canPixelPass(x1, y1, dir)) {
        var x2 = $gameMap.roundPXWithDirection(x1, dir, this.moveTiles());
        var y2 = $gameMap.roundPYWithDirection(y1, dir, this.moveTiles());
        var score = Math.abs(x2 - ex) + Math.abs(y2 - ey);
        var node = {
          x: x2,
          y: y2,
          f: score
        }
        if (nodes.length === 0) {
          nodes.push(node);
        } else {
          if (score < nodes[0].f) {
            nodes.unshift(node);
          } else {
            nodes.push(node);
          }
        }
      }
      character.setThrough(originalThrough);
    }
    var next = nodes[0];
    if (!next) return;
    var sx = next.x - x1;
    var sy = next.y - y1;
    if (Math.abs(sx) > Math.abs(sy)) {
      this.moveStraight(sx > 0 ? 6 : 4);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 2 : 8);
    }
  };

  Game_Character.prototype.moveAwayCharacter = function(character) {
    var ex = character.cx();
    var ey = character.cy();
    var x1 = this._px;
    var y1 = this._py;
    var nodes = [];
    for (var i = 1; i < 5; i++) {
      var dir = i * 2;
      if (this.canPixelPass(x1, y1, dir)) {
        var x2 = $gameMap.roundPXWithDirection(x1, dir, this.moveTiles());
        var y2 = $gameMap.roundPYWithDirection(y1, dir, this.moveTiles());
        var score = Math.abs(x2 - ex) + Math.abs(y2 - ey);
        var node = {
          x: x2,
          y: y2,
          f: score
        }
        if (nodes.length === 0) {
          nodes.push(node);
        } else {
          if (score > nodes[0].f) {
            nodes.unshift(node);
          } else {
            nodes.push(node);
          }
        }
      }
    }
    var next = nodes[0];
    if (!next) return;
    var sx = next.x - x1;
    var sy = next.y - y1;
    if (Math.abs(sx) > Math.abs(sy)) {
      this.moveStraight(sx > 0 ? 6 : 4);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 2 : 8);
    }
  };

  Game_Character.prototype.turnTowardCharacter = function(character) {
    var sx = this.deltaPXFrom(character.cx());
    var sy = this.deltaPYFrom(character.cy());
    if (Math.abs(sx) > Math.abs(sy)) {
      this.setDirection(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
      this.setDirection(sy > 0 ? 8 : 2);
    }
  };

  Game_Character.prototype.turnAwayFromCharacter = function(character) {
    var sx = this.deltaPXFrom(character.cx());
    var sy = this.deltaPYFrom(character.cy());
    if (Math.abs(sx) > Math.abs(sy)) {
      this.setDirection(sx > 0 ? 6 : 4);
    } else if (sy !== 0) {
      this.setDirection(sy > 0 ? 2 : 8);
    }
  };

  Game_Character.prototype.directionTowards = function(x1, y1) {
    var x2 = this.cx();
    var y2 = this.cy();
    var radian = Math.atan2(-(y1 - y2), x1 - x2);
    radian += radian < 0 ? 2 * Math.PI : 0;
    return this.radianToDirection(radian, true);
  };

  Game_Character.prototype.radianToDirection = function(radian, useDiag) {
    if (QuasiMovement.diagonal && useDiag) {
      if (radian >= Math.PI / 6 && radian < Math.PI / 3) {
        return 9;
      } else if (radian >= 2 * Math.PI / 3 && radian < 5 * Math.PI / 6) {
        return 7;
      } else if (radian >= 7 * Math.PI / 6 && radian < 4 * Math.PI / 3) {
        return 1;
      } else if (radian >= 5 * Math.PI / 3 && radian < 11 * Math.PI / 6) {
        return 3;
      }
    }
    if (radian >= 0 && radian < Math.PI / 4) {
      return 6;
    } else if (radian >= Math.PI / 4 && radian < 3 * Math.PI / 4) {
      return 8;
    } else if (radian >= 3 * Math.PI / 4 && radian < 5 * Math.PI / 4) {
      return 4;
    } else if (radian >= 5 * Math.PI / 4 && radian < 7 * Math.PI / 4) {
      return 2;
    } else if (radian >= 7 * Math.PI / 4) {
      return 6;
    }
  };

  Game_Character.prototype.directionToRadian = function(direction) {
    if (direction === 6) return 0;
    if (direction === 8) return Math.PI / 2;
    if (direction === 4) return Math.PI;
    if (direction === 2) return 3 * Math.PI / 2;
    if (direction === 7) return 3 * Math.PI / 4;
    if (direction === 9) return Math.PI / 4;
    if (direction === 1) return 5 * Math.PI / 4;
    if (direction === 3) return 7 * Math.PI / 4;
  };

  Game_Character.prototype.reverseRadian = function(radian) {
    radian -= Math.PI;
    radian += radian < 0 ? 2 * Math.PI : 0;
    return radian;
  };

  Game_Character.prototype.startPathFind = function(goalX, goalY) {
    var x1 = this._px - this.cx();
    var y1 = this._py - this.cy();
    var x2 = goalX + x1;
    var y2 = goalY + y1;
    var dx = this._px - x2;
    var dy = this._py - y2;
    if (Math.sqrt(dx * dx + dy * dy) > this.moveTiles()) {
      this.moveTowardPos(x2, y2);
    }
    this._pathFind = null;
    return 0;
  };

  Game_Character.prototype.updatePathFind = function() {
    // For pathfind addon
  };

  Game_Character.prototype.canMove = function() {
    return !this._locked;
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // The game object class for the player. It contains event starting
  // determinants and map scrolling functions.

  Game_Player.prototype.actor = function() {
    return $gameParty.leader();
  };

  Game_Player.prototype.canClick = function() {
    return true; // For ABS mainly, sets to false if you are over a window
  }

  Game_Player.prototype.locate = function(x, y) {
    Game_Character.prototype.locate.call(this, x, y);
    this.center(x, y);
    this.makeEncounterCount();
    if (this.isInVehicle()) this.vehicle().refresh();
    this._followers.synchronize(this);
  };

  Game_Player.prototype.moveByInput = function() {
    if (!this.startedMoving() && this.canMove()) {
      if (this.triggerAction()) return;
      var direction = QuasiMovement.diagonal ? Input.dir8 : Input.dir4;
      if (direction > 0) {
        $gameTemp.clearDestination();
        this._pathFind = null;
      } else if ($gameTemp.isDestinationValid()) {
        if (!QuasiMovement.moveOnClick) {
          $gameTemp.clearDestination();
          return;
        }
        var x = $gameTemp.destinationPX();
        var y = $gameTemp.destinationPY();
        if (!this._pathFind) direction = this.startPathFind(x, y);
      }
      if ([4, 6].contains(direction)){
        this.moveInputHorizontal(direction);
      } else if ([2, 8].contains(direction)){
        this.moveInputVertical(direction);
      } else if ([1, 3, 7, 9].contains(direction) && QuasiMovement.diagonal){
        this.moveInputDiagonal(direction);
      }
    }
  };

  Game_Player.prototype.moveInputHorizontal = function(dir) {
    this.moveStraight(dir);
  };

  Game_Player.prototype.moveInputVertical = function(dir) {
    this.moveStraight(dir);
  };

  Game_Player.prototype.moveInputDiagonal = function(dir) {
    var diag = {
      1: [4, 2],   3: [6, 2],
      7: [4, 8],   9: [6, 8]
    };
    this.moveDiagonally(diag[dir][0], diag[dir][1]);
  };

  var Alias_Game_Player_refresh = Game_Player.prototype.refresh;
  Game_Player.prototype.refresh = function() {
    this.reloadBoxes();
    Alias_Game_Player_refresh.call(this);
  };

  Game_Player.prototype.update = function(sceneActive) {
    var lastScrolledX = this.scrolledX();
    var lastScrolledY = this.scrolledY();
    var wasMoving = this.isMoving();
    this.updateDashing();
    if (sceneActive) {
      this.moveByInput();
      if (!this.startedMoving() && this.canMove()) this.updatePathFind();
    }
    Game_Character.prototype.update.call(this);
    this.updateScroll(lastScrolledX, lastScrolledY);
    this.updateVehicle();
    if (!this.startedMoving()) this.updateNonmoving(wasMoving);
    this._followers.update();
  };

  Game_Player.prototype.updateNonmoving = function(wasMoving) {
    if (!$gameMap.isEventRunning()) {
      if (wasMoving) {
        if (this._freqCount >= this.freqThreshold()) {
          $gameParty.onPlayerWalk();
        }
        this.checkEventTriggerHere([1,2]);
        if ($gameMap.setupStartingEvent()) return;
      }
      if (this.triggerAction()) return;
      if (wasMoving) {
        if (this._freqCount >= this.freqThreshold()) {
          this.updateEncounterCount();
          this._freqCount = 0;
        }
      } else if (!this.isMoving()) {
        $gameTemp.clearDestination();
      }
    }
  };

  Game_Player.prototype.updateDashing = function() {
    if (this.startedMoving()) return;
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
      this._dashing = this.isDashButtonPressed() || ($gameTemp.isDestinationValid() && QuasiMovement.moveOnClick);
    } else {
      this._dashing = false;
    }
  };

  Game_Player.prototype.updateVehicle = function() {
    if (this.isInVehicle() && !this.areFollowersGathering()) {
      if (this._vehicleGettingOn) {
        this.updateVehicleGetOn();
      } else if (this._vehicleGettingOff) {
        this.updateVehicleGetOff();
      } else {
        if (this._vehicleSyncd) {
          this.vehicle().syncWithPlayer();
        } else {
          this.copyPosition(this.vehicle());
          this._vehicleSyncd = true;
        }
      }
    }
  };

  Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
    if (!$gameMap.isEventRunning()) {
      var collider = this.collider();
      var x1 = this._px;
      var y1 = this._py;
      collider.moveto(x, y);
      var self = this;
      var events = $gameMap.getCharactersAt(collider, function(e) {
        return (e === self || e.constructor === Game_Follower ||
          e.constructor === Game_Vehicle || e._erased);
      });
      collider.moveto(x1, y1);
      if (events.length === 0) {
        events = null;
        return;
      }
      var cx = this.cx();
      var cy = this.cy();
      events.sort(function(a, b) {
        return a.pixelDistanceFrom(cx, cy) - b.pixelDistanceFrom(cx, cy);
      });
      var event = events[0];
      if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
        event.start();
      }
      events = null;
    }
  };

  Game_Player.prototype.triggerTouchAction = function() {
    if ($gameTemp.isDestinationValid()) {
      var x1 = $gameTemp.destinationX();
      var y1 = $gameTemp.destinationY();
      var dx = Math.floor(Math.abs(Math.round(this.x) - x1));
      var dy = Math.floor(Math.abs(Math.round(this.y) - y1));
      var dir = this.directionTowards($gameTemp.destinationPX(), $gameTemp.destinationPY());
      if (dir !== this.direction()) return;
      if (dx === 0 && dy === 0) {
        if (this.triggerTouchActionD1()) return true;
      }
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        if (this.triggerTouchActionD2()) return true;
      }
      if ((dx === 2 && dy === 0) || (dx === 0 && dy === 2)) {
        if (this.checkCounter([0, 1, 2])) return true;
      }
    }
    return false;
  };

  Game_Player.prototype.triggerTouchActionD1 = function() {
    if (this.airshipHere()) {
      if (TouchInput.isTriggered() && this.getOnOffVehicle()) {
        return true;
      }
    }
    this.checkEventTriggerHere([0]);
    return $gameMap.setupStartingEvent();
  };

  Game_Player.prototype.triggerTouchActionD2 = function() {
    if (this.shipBoatThere()) {
      if (TouchInput.isTriggered() && this.getOnVehicle()) {
        return true;
      }
    }
    if (this.isInBoat() || this.isInShip()) {
      if (TouchInput.isTriggered() && this.getOffVehicle()) {
        return true;
      }
    }
    this.checkEventTriggerThere([0,1,2]);
    return $gameMap.setupStartingEvent();
  };

  Game_Player.prototype.checkEventTriggerHere = function(triggers) {
    if (this.canStartLocalEvents()) {
      this.startMapEvent(this.collider().x, this.collider().y, triggers, false);
    }
  };

  Game_Player.prototype.checkEventTriggerThere = function(triggers, x2, y2) {
    if (this.canStartLocalEvents()) {
      var direction = this.direction();
      var x1 = this.collider().x;
      var y1 = this.collider().y;
      x2 = x2 || $gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
      y2 = y2 || $gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
      this.startMapEvent(x2, y2, triggers, true);
      if ($gameMap.isAnyEventStarting) {
        var es = $gameMap.isAnyEventStarting();
      } else if ($gameMap.someEventStarting) {
        var es = $gameMap.someEventStarting();
      } else {
        var es = true;
        alert("Please inform Quasi that you do not have a 'isAnyEventStarting' function");
      }
      if (!es) {
        return this.checkCounter(triggers);
      }
    }
  };

  Game_Player.prototype.checkCounter = function(triggers, x2, y2) {
    var direction = this.direction();
    var x1 = this._px;
    var y1 = this._py;
    x2 = x2 || $gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
    y2 = y2 || $gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
    this.collider().moveto(x2, y2);
    var counters = $gameMap.getTileBoxesAt(this.collider(), function(tile) {
      if (!tile.isCounter) return true;
      return false;
    });
    this.collider().moveto(x1, y1);
    var counter = counters[0];
    if (counter) {
      if ([4, 6].contains(direction)) {
        var dist = Math.abs(counter.center.x - this.cx());
        dist += this.collider().width;
      }  else if ([8, 2].contains(direction)) {
        var dist = Math.abs(counter.center.y - this.cy());
        dist += this.collider().height;
      }
      var x3 = $gameMap.roundPXWithDirection(x1, direction, dist);
      var y3 = $gameMap.roundPYWithDirection(y1, direction, dist);
      return this.startMapEvent(x3, y3, triggers, true);
    }
    return false;
  };

  Game_Player.prototype.getOnVehicle = function() {
    var direction = this.direction();
    var airship = this.airshipHere();
    if (airship) {
      this._vehicleType = "airship";
    } else {
      var vehicle = this.shipBoatThere();
      if (vehicle) {
        this._vehicleType = vehicle._type;
        this._passabilityLevel = vehicle._type === "boat" ? 1 : 2;
      }
    }
    if (this.isInVehicle()) {
      this._vehicleGettingOn = true;
      this._vehicleSyncd = false;
      if (!this.isInAirship()) {
        this.setThrough(true);
        var cx = this.cx();
        var cy = this.cy();
        if ([4, 6].contains(direction)) {
          var dist = Math.abs($gameMap.deltaPX(cx, this.vehicle().cx()));
          this.fixedMove(direction, dist);
        } else if ([8, 2].contains(direction)) {
          var dist = Math.abs($gameMap.deltaPY(cy, this.vehicle().cy()));
          this.fixedMove(direction, dist);
        }
        this.setThrough(false);
      }
      this.gatherFollowers();
    }
    return this._vehicleGettingOn;
  };

  Game_Player.prototype.airshipHere = function() {
    var airship;
    var collider = this.collider();
    var airship = $gameMap.getCharactersAt(collider, function(e) {
      if (e.constructor !== Game_Vehicle) return true;
      return (!e.isAirship() || !e.isOnMap());
    });
    collider.moveto(this.px, this.py);
    return airship[0];
  };

  Game_Player.prototype.shipBoatThere = function(x2, y2) {
    var direction = this.direction();
    var x1 = this.collider().x;
    var y1 = this.collider().y;
    x2 = x2 || $gameMap.roundPXWithDirection(x1, direction, this.moveTiles() + 4);
    y2 = y2 || $gameMap.roundPYWithDirection(y1, direction, this.moveTiles() + 4);
    var collider = this.collider();
    collider.moveto(x2, y2)
    var vehicles = $gameMap.getCharactersAt(collider, function(e) {
      if (e.constructor !== Game_Vehicle) return true;
      return (e.isAirship() || !e.isOnMap());
    });
    collider.moveto(this.px, this.py);
    if (vehicles.length === 0) return false;
    var cx = this.cx();
    var cy = this.cy();
    vehicles.sort(function(a, b) {
      return a.pixelDistanceFrom(cx, cy) - b.pixelDistanceFrom(cx, cy);
    });
    return vehicles[0];
  };

  Game_Player.prototype.getOffVehicle = function() {
    this._vehicleSyncd = false;
    this._passabilityLevel = 5;
    this.setThrough(false);
    this.moveAllBoxes(this.px, this.py);
    var direction = this.direction();
    if (!QuasiMovement.offGrid) {
      dist = this.moveTiles();
      if ([4, 6].contains(direction)) {
        if (this.vehicle().collider().width > this.moveTiles()) {
          var dist = this.vehicle().collider().width;
          dist += this.moveTiles() - this.vehicle().collider().width % this.moveTiles();
        }
      } else if ([8, 2].contains(direction)) {
        if (this.vehicle().collider().height > this.moveTiles()) {
          var dist = this.vehicle().collider().height;
          dist += this.moveTiles() - this.vehicle().collider().height % this.moveTiles();
        }
      }
    } else {
      if ([4, 6].contains(direction)) {
        var dist = this.vehicle().collider().ox - this.collider().ox;
        dist = this.collider().width + (direction === 4 ? -dist : dist);
      }  else if ([8, 2].contains(direction)) {
        var dist = this.vehicle().collider().oy - this.collider().oy;
        dist = this.collider().height + (direction === 8 ? -dist : dist);
      }
    }
    if (this.canPixelPass(this.px, this.py, direction, dist)) {
      if (this.isInAirship()) this.setDirection(2);
      this._followers.synchronize(this);
      this.vehicle().getOff();
      this._passabilityLevel = 0;
      var prevX = this.vehicle().collider().x;
      var prevY = this.vehicle().collider().y;
      if (!this.isInAirship()) {
        this.setThrough(true);
        this.fixedMove(direction, dist);
        this.vehicle().collider().moveto(prevX, prevY);
        this.setTransparent(false);
      }
      this._vehicleGettingOff = true;
      this.setMoveSpeed(4);
      this.setThrough(false);
      this.makeEncounterCount();
    } else {
      this._vehicleSyncd = true;
      this._passabilityLevel = this.vehicle()._type === "boat" ? 1 : 2;
      if (this.isInAirship()) {
        this.setThrough(true);
      }
    }
    return this._vehicleGettingOff;
  };

  Game_Player.prototype.isOnDamageFloor = function() {
    var boxes = $gameMap.getTileBoxesAt(this.collider(), function(tile) {
      if (!tile.isDamage) return true;
      return false;
    });
    if (boxes.length === 0) return false;
    var pass = 0;
    var vertices = this.collider().vertices();
    for (var i = 0; i < vertices.length; i++) {
      for (var j = 0; j < boxes.length; j++) {
        if (boxes[j].containsPoint(vertices[i].x, vertices[i].y)) {
          pass++;
        }
      }
    }
    return pass >= 4;
  };

  Game_Player.prototype.moveStraight = function(d) {
    Game_Character.prototype.moveStraight.call(this, d);
  };

  Game_Player.prototype.moveDiagonally = function(horz, vert) {
    Game_Character.prototype.moveDiagonally.call(this, horz, vert);
  };

  Game_Player.prototype.collider = function(direction) {
    if (this._vehicleSyncd) {
      return this.vehicle().collider(direction);
    } else {
      return Game_Character.prototype.collider.call(this, direction);
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Follower
  //
  // The game object class for a follower. A follower is an allied character,
  // other than the front character, displayed in the party.

  var Alias_Game_Follower_initialize = Game_Follower.prototype.initialize;
  Game_Follower.prototype.initialize = function(memberIndex) {
    Alias_Game_Follower_initialize.call(this, memberIndex);
    this._moveList = [];
  };

  Game_Follower.prototype.update = function() {
    Game_Character.prototype.update.call(this);
    this.setOpacity($gamePlayer.opacity());
    this.setBlendMode($gamePlayer.blendMode());
    this.setWalkAnime($gamePlayer.hasWalkAnime());
    this.setStepAnime($gamePlayer.hasStepAnime());
    this.setDirectionFix($gamePlayer.isDirectionFixed());
    this.setTransparent($gamePlayer.isTransparent());
  };

  Game_Follower.prototype.addMove = function(x, y, speed, dir) {
    this._moveList.push([x, y, speed, dir]);
  };

  Game_Follower.prototype.clearList = function() {
    this._moveList = [];
  };

  Game_Follower.prototype.updateMoveList = function(preceding, gathering) {
    if (this._moveList.length === 0 || this.startedMoving()) return;
    if (this._moveList.length <= this._memberIndex) return;
    var move = this._moveList.shift();
    if (!gathering) {
      var collided = this.collideWithPreceding(preceding, move[0], move[1], move[3]);
      if (collided) {
        this._moveList.unshift(move);
        return;
      }
    }
    this.setMoveSpeed(move[2]);
    this.setDirection(move[3]);
    this._realPX = this._px;
    this._realPY = this._py;
    this._px = move[0];
    this._py = move[1];
    this._moveCount++;
  };

  Game_Follower.prototype.collideWithPreceding = function(preceding, x, y, dir) {
    if (!this.isVisible()) return false;
    this.collider(dir).moveto(x, y);
    if (this.collider(dir).intersects(preceding.collider())) {
      if (this._direction === preceding._direction) {
        return true;
      }
    }
    this.collider(dir).moveto(this._px, this._py);
    return false;
  };

  //-----------------------------------------------------------------------------
  // Game_Follower
  //
  // The game object class for a follower. A follower is an allied character,
  // other than the front character, displayed in the party.

  Game_Followers.prototype.update = function() {
    this.forEach(function(follower) {
        follower.update();
    }, this);
    for (var i = this._data.length - 1; i >= 0; i--) {
      var precedingCharacter = (i > 0 ? this._data[i - 1] : $gamePlayer);
      this._data[i].updateMoveList(precedingCharacter, this._gathering);
    }
  };

  Game_Followers.prototype.addMove = function(x, y, speed, dir) {
    for (var i = this._data.length - 1; i >= 0; i--) {
      this._data[i].addMove(x, y, speed, dir);
    }
  };

  Game_Followers.prototype.synchronize = function(chara) {
    this.forEach(function(follower) {
      follower.copyPosition(chara);
      follower.straighten();
      follower.setDirection(chara.direction());
      follower.clearList();
    }, this);
  };

  Game_Followers.prototype.areGathering = function() {
    if (this.areGathered() && this._gathering) {
      this._gathering = false;
      return true;
    }
    return false;
  };

  Game_Followers.prototype.areGathered = function() {
    return this.visibleFollowers().every(function(follower) {
      return follower.cx() === $gamePlayer.cx() && follower.cy() === $gamePlayer.cy();
    }, this);
  };

  //-----------------------------------------------------------------------------
  // Game_Vehicle
  //
  // The game object class for a vehicle.

  var Alias_Game_Vehicle_refresh = Game_Vehicle.prototype.refresh;
  Game_Vehicle.prototype.refresh = function() {
    Alias_Game_Vehicle_refresh.call(this);
    this.setThrough(!this.isOnMap());
  };

  Game_Vehicle.prototype.isOnMap = function() {
    return this._mapId === $gameMap.mapId();
  };

  //-----------------------------------------------------------------------------
  // Game_Event
  //
  // The game object class for an event. It contains functionality for event page
  // switching and running parallel process events.

  Game_Event.prototype.setSelfswitch = function(selfSwitch, bool) {
    var mapId = this._mapId;
    var eventId = this._eventId;
    if (!mapId || !eventId) return;
    var key = [mapId, eventId, selfSwitch];
    $gameSelfSwitches.setValue(key, bool);
  };

  Game_Event.prototype.updateStop = function() {
    if (this._locked) {
      this._freqCount = this.freqThreshold();
      this.resetStopCount();
    }
    if (this._moveRouteForcing) {
      this.updateRoutineMove();
    }
    if (!this.isMoveRouteForcing()) {
      this.updateSelfMovement();
    }
  };

  Game_Event.prototype.updateSelfMovement = function() {
    if (this.isNearTheScreen() && this.canMove()) {
      if (this._freqCount < this.freqThreshold()) {
        switch (this._moveType) {
        case 1:
          this.moveTypeRandom();
          break;
        case 2:
          this.moveTypeTowardPlayer();
          break;
        case 3:
          this.moveTypeCustom();
          break;
        }
      } else {
        this._stopCount++;
        if (this.checkStop(this.stopCountThreshold())) {
          this._stopCount = this._freqCount = 0;
        }
      }
    }
  };

  Game_Event.prototype.comments = function() {
    if (!this.page() || !this.list()) {
      return "";
    }
    var comments = this.list().filter(function(list) {
      return list.code === 108 || list.code === 408;
    });
    comments = comments.map(function(list) {
      return list.parameters;
    });
    return comments.join('\n');
  };

  var Alias_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
  Game_Event.prototype.setupPageSettings = function() {
    Alias_Game_Event_setupPageSettings.call(this);
    this.initialPosition();
    this.passabilityLevel(true);
    this._collider = null;
    this._randomDir = null;
  };

  Game_Event.prototype.initialPosition = function() {
    var ox = this.initialOffset().x;
    var oy = this.initialOffset().y;
    this.setPixelPosition(this.px + ox, this.py + oy);
  };

  Game_Event.prototype.initialOffset = function() {
    if (!this._initialOffset) {
      var ox = /<ox[=|:](-?[0-9]*)>/.exec(this.comments());
      var oy = /<oy[=|:](-?[0-9]*)>/.exec(this.comments());
      if (ox) ox = Number(ox[1] || 0);
      if (oy) oy = Number(oy[1] || 0);
      this._initialOffset = new Point(ox || 0 , oy || 0);
    }
    return this._initialOffset;
  };

  Game_Event.prototype.passabilityLevel = function(reset) {
    if (reset) {
      var lvl = /<pl[=|:](\d*)>/.exec(this.comments());
      if (lvl) {
        this.setPassability(Number(lvl[1] || 0));
      } else {
        this.setPassability(0);
      }
    }
    return this._passabilityLevel;
  };

  Game_Event.prototype.checkEventTriggerTouch = function(x, y) {
    if (!$gameMap.isEventRunning()) {
      if (this._trigger === 2 && !this.isJumping() && this.isNormalPriority()) {
        var prevX = this.collider().x;
        var prevY = this.collider().y;
        this.collider().moveto(x, y);
        var self = this;
        var charas = $gameMap.getCharactersAt(this.collider(), function(chara) {
          if (chara.constructor !== Game_Player) return true;
          return false;
        });
        this.collider().moveto(prevX, prevY);
        if (charas.length > 0) {
          this._stopCount = 0;
          this._freqCount = this.freqThreshold();
          this.start();
        }
      }
    }
  };

  Game_Event.prototype.moveTypeRandom = function() {
    if (this._freqCount === 0 || !this._randomDir) {
      this._randomDir = 2 * (Math.randomInt(4) + 1);
    }
    if (!this.canPixelPass(this.px, this.py, this._randomDir)) {
      this._randomDir = 2 * (Math.randomInt(4) + 1);
    }
    this.moveStraight(this._randomDir);
  };

  Game_Event.prototype.moveTypeTowardPlayer = function() {
    if (this.isNearThePlayer()) {
      if (this._freqCount === 0 || !this._typeTowardPlayer) {
        this._typeTowardPlayer = Math.randomInt(6);
      }
      switch (this._typeTowardPlayer) {
      case 0: case 1: case 2: case 3:
        this.moveTowardPlayer();
        break;
      case 4:
        this.moveTypeRandom();
        break;
      case 5:
        this.moveForward();
        break;
      }
    } else {
      this.moveTypeRandom();
    }
  };

  //-----------------------------------------------------------------------------
  // Scene_Map
  //
  // The scene class of the map screen.

  Scene_Map.prototype.processMapTouch = function() {
    if ((TouchInput.isTriggered() || this._touchCount > 0) && $gamePlayer.canClick()) {
      if (TouchInput.isPressed()) {
        if (this._touchCount === 0 || this._touchCount >= 15) {
          var x = $gameMap.canvasToMapPX(TouchInput.x);
          var y = $gameMap.canvasToMapPY(TouchInput.y);
          if (!QuasiMovement.offGrid) {
            var ox  = x % QuasiMovement.tileSize;
            var oy  = y % QuasiMovement.tileSize;
            x += QuasiMovement.tileSize / 2 - ox;
            y += QuasiMovement.tileSize / 2 - oy;
          }
          $gameTemp.setPixelDestination(x, y);
        }
        this._touchCount++;
      } else {
        this._touchCount = 0;
      }
    }
  };

  Scene_Map.prototype.addTempCollider = function(collider, duration, clearable) {
    this._spriteset.addTempCollider(collider, duration || 60, clearable);
  };

  Scene_Map.prototype.removeTempCollider = function(collider) {
    this._spriteset.removeTempCollider(collider);
  };

  Input.keyMapper[121] = 'f10';
  var Alias_Scene_Map_updateMain = Scene_Map.prototype.updateMain;
  Scene_Map.prototype.updateMain = function() {
    Alias_Scene_Map_updateMain.call(this);
    var key = Imported.Quasi_Input ? "#f10" : "f10";
    if ($gameTemp.isPlaytest() && Input.isTriggered(key)) {
      QuasiMovement.showBoxes = !QuasiMovement.showBoxes;
    }
  };

  Scene_Map.prototype.updateCallMenu = function() {
    if (this.isMenuEnabled()) {
      if (this.isMenuCalled()) {
        this.menuCalling = true;
      }
      if (this.menuCalling && !$gamePlayer.startedMoving()) {
        this.callMenu();
      }
    } else {
      this.menuCalling = false;
    }
  };

  //-----------------------------------------------------------------------------
  // Sprite_Collider
  //
  // The sprite for displaying a collider.

  Sprite_Collider.prototype = Object.create(Sprite.prototype);
  Sprite_Collider.prototype.constructor = Sprite_Collider;

  Sprite_Collider.prototype.initialize = function(collider) {
    Sprite.prototype.initialize.call(this);
    this.setupCollider(collider);
    this.z = 7;
    this.alpha = 100/255;
    this._duration;
    this.updatePos = true;
  };

  Sprite_Collider.prototype.setupCollider = function(collider) {
    this._collider = null;
    this._collider = collider;
    var isNew = false;
    if (!this._colliderSprite) {
      this._colliderSprite = new PIXI.Graphics();
      isNew = true;
    }
    this.drawCollider();
    if (isNew) {
      this.addChild(this._colliderSprite);
    }
    return this._colliderSprite;
  };

  Sprite_Collider.prototype.drawCollider = function() {
    var collider = this._collider;
    this._colliderSprite.clear();
    this._color = typeof collider.color === "undefined" ? 0xff0000 : collider.color;
    this._colliderSprite.beginFill(this._color);
    if (collider.isCircle()) {
      var radiusX = collider._radiusX;
      var radiusY = collider._radiusY;
      this._colliderSprite.drawEllipse(0, 0, radiusX, radiusY);
      this._colliderSprite.rotation = collider.radian;
    } else {
      this._colliderSprite.drawPolygon(collider.baseVertices);
    }
    this._colliderSprite.endFill();
    if (QuasiMovement.cachedCollider) this._colliderSprite.cacheAsBitmap = true;
  };

  Sprite_Collider.prototype.setDuration = function(duration) {
    this._duration = duration;
  };

  Sprite_Collider.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (this._colliderSprite.visible) this.checkChanges();
    if (this._duration && this._duration > 0) this._duration--;
  };

  Sprite_Collider.prototype.isPlaying = function() {
    return this._duration > 0;
  };

  Sprite_Collider.prototype.checkChanges = function() {
    if (this.updatePos) {
      this.x = this._collider.x + this._collider.offsetX();
      this.x -= $gameMap.displayX() * QuasiMovement.tileSize;
      this.y = this._collider.y + this._collider.offsetY();
      this.y -= $gameMap.displayY() * QuasiMovement.tileSize;
    }
    if (this._cachedw !== this._collider.width ||
        this._cachedh !== this._collider.height) {
      this._cachedw = this._collider.width;
      this._cachedh = this._collider.height;
      this.drawCollider();
    }
    if (typeof this._collider.color !== "undefined" && this._color !== this._collider.color) {
      this.drawCollider();
    }
    this._colliderSprite.z = this.z;
  };

  //-----------------------------------------------------------------------------
  // Sprite_Destination
  //
  // The sprite for displaying the destination place of the touch input.

  Sprite_Destination.prototype.updatePosition = function() {
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    var x = $gameTemp.destinationPX();
    var y = $gameTemp.destinationPY();
    this.x = $gameMap.adjustPX(x);
    this.y = $gameMap.adjustPY(y);
  };

  var Alias_Sprite_Destination_update = Sprite_Destination.prototype.update;
  Sprite_Destination.prototype.update = function() {
    if (QuasiMovement.moveOnClick) {
      Alias_Sprite_Destination_update.call(this);
    } else if (this.visible) {
      this.visible = false;
    }
  };

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //
  // The sprite for displaying a character.

  var Alias_Sprite_Character_update = Sprite_Character.prototype.update;
  Sprite_Character.prototype.update = function() {
    Alias_Sprite_Character_update.call(this);
    if ($gameTemp.isPlaytest()) this.updateColliders();
  };

  Sprite_Character.prototype.updateColliders = function() {
    if (!this.bitmap.isReady()) return;
    if (this._colliderData !== this._character.collider()) this.createColliders();
    if (!this._colliderSprite) return;
    if (this._character.constructor == Game_Follower){
      this._colliderSprite.visible = this._character.isVisible() && QuasiMovement.showBoxes;
    } else {
      var erased = false;
      if (this._character.constructor === Game_Event) {
        erased = this._character._erased;
      }
      this._colliderSprite.visible = this.visible && QuasiMovement.showBoxes && !erased;
    }
  };

  Sprite_Character.prototype.createColliders = function() {
    if (this._character.collider().constructor === Object) return;
    this._colliderData = this._character.collider();
    if (!this._colliderSprite) {
      this._colliderSprite = new Sprite_Collider(this._colliderData);
      this.parent.addChild(this._colliderSprite);
      return;
    }
    this._colliderSprite.setupCollider(this._colliderData);
  };

  Sprite_Character.prototype.removeStageReference = function() {
    PIXI.DisplayObjectContainer.prototype.removeStageReference.call(this);
    if (this._colliderSprite) {
      this.parent.removeChild(this._colliderSprite);
    }
  };

  //-----------------------------------------------------------------------------
  // Spriteset_Map
  //
  // The set of sprites on the map screen.

  var Alias_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
  Spriteset_Map.prototype.createLowerLayer = function() {
    Alias_Spriteset_Map_createLowerLayer.call(this);
    if ($gameTemp.isPlaytest()) {
      this.createTileBoxes();
      this._tempColliders = [];
    }
  };

  Spriteset_Map.prototype.createTileBoxes = function() {
    if (!$gameTemp.isPlaytest()) return;
    this._collisionmap = new Sprite();
    this._collisionmap.bitmap = QuasiMovement._collisionmap;
    this._collisionmap.opacity = 100;
    this.addChild(this._collisionmap);
    this._regionmap = new Sprite();
    this._regionmap.bitmap = QuasiMovement._regionmap;
    this._collisionmap.addChild(this._regionmap);
  };

  Spriteset_Map.prototype.addTempCollider = function(collider, duration, clearable) {
    if (!this._tempColliders) return;
    var i, j;
    for (i = 0, j = this._tempColliders.length; i < j; i++) {
      if (this._tempColliders[i].sprite.collider.id === collider.id) {
        this._tempColliders[i].sprite.setDuration(duration);
        return;
      }
    }
    var temp = {};
    temp.clearable = clearable;
    temp.sprite = new Sprite_Collider(collider);
    temp.sprite.collider = collider;
    temp.sprite.setDuration(duration);
    temp.sprite.visible = false;
    this._tempColliders.push(temp);
    this._tilemap.addChild(temp.sprite);
  };

  Spriteset_Map.prototype.removeTempCollider = function(collider) {
    if (!this._tempColliders || this._tempColliders.length === 0) {
      return;
    }
    for (var i = 0, j = this._tempColliders.length - 1; i >= 0; i--) {
      if (this._tempColliders[i].sprite.collider.id === collider.id) {
        this._tilemap.removeChild(this._tempColliders[i].sprite);
        this._tempColliders[i].sprite = null;
        this._tempColliders.splice(i, 1);
      }
    }
  };

  Spriteset_Map.prototype.removeAllTempColliders = function() {
    if (!this._tempColliders || this._tempColliders.length === 0) {
      return;
    }
    for (var i = this._tempColliders.length - 1; i >= 0; i--) {
      this._tilemap.removeChild(this._tempColliders[i].sprite);
      this._tempColliders[i].sprite = null;
      this._tempColliders.splice(i, 1);
    }
  };

  var Alias_Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
  Spriteset_Map.prototype.updateTilemap = function() {
    Alias_Spriteset_Map_updateTilemap.call(this);
    if (($gameTemp.isPlaytest())) {
      if (this._collisionmap) this.updateTileBoxes();
      if (this._tempColliders) this.updateTempColliders();
    }
  };

  Spriteset_Map.prototype.updateTileBoxes = function() {
    if (this._collisionmap.bitmap !== QuasiMovement._collisionmap) {
      this._collisionmap.bitmap = null;
      this._collisionmap.bitmap = QuasiMovement._collisionmap;
    }
    if (this._regionmap.bitmap !== QuasiMovement._regionmap) {
      this._regionmap.bitmap = null;
      this._regionmap.bitmap = QuasiMovement._regionmap;
    }
    this._collisionmap.visible = QuasiMovement.showBoxes;
    if (QuasiMovement.showBoxes) {
      this._collisionmap.x = -$gameMap.displayX() * $gameMap.tileWidth();
      this._collisionmap.y = -$gameMap.displayY() * $gameMap.tileHeight();
    }
  };

  Spriteset_Map.prototype.updateTempColliders = function() {
    if (this._tempColliders.length > 0) {
      for (var i = this._tempColliders.length - 1; i >= 0; i--) {
        this._tempColliders[i].sprite.visible = QuasiMovement.showBoxes;
        if (!this._tempColliders[i].sprite.isPlaying()) {
          this._tilemap.removeChild(this._tempColliders[i].sprite);
          this._tempColliders[i].sprite = null;
          this._tempColliders.splice(i, 1);
        }
      }
    }
  };

  //-----------------------------------------------------------------------------
  /**
  * The basic object that represents an image.
  *
  * @class Bitmap
  */

  var Alias_Bitmap_initialize = Bitmap.prototype.initialize;
  Bitmap.prototype.initialize = function(width, height) {
    Alias_Bitmap_initialize.call(this, width, height);
    this._pixelData = [];
  };

  Bitmap.prototype._setPixelData = function () {
    this._pixelData = this._context.getImageData(0, 0, this.width, this.height).data;
  };

  // Optimized version of getPixel()
  Bitmap.prototype.getColor = function(x, y) {
    if (this._pixelData.length === 0) this._setPixelData();
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= this.width || x < 0 || y >= this.height || y < 0 || this._pixelData.length === 0) {
      return "#000000";
    }
    var i = (x * 4) + (y * 4 * this.width);
    var result = '#';
    for (var c = 0; c < 3; c++) {
      result += this._pixelData[i + c].toString(16).padZero(2);
    }
    return result;
  };
})();
