const fs            = require('fs')
  ,   EventEmitter = require('events');
var exports = module.exports = {};

/*****************************
      PUBLIC FUNCTIONS
*****************************/


exports.modules = {};

exports.socketConnection = null;
exports.serverEvent = new EventEmitter();

exports.initialize = function(socketConnection) {
  exports.socketConnection = socketConnection;

  // We load all the modules in the socket server
  exports.loadModules('', false).then(() => {
    console.log(`[I] Socket.IO server started on port ${MMO_Core["database"].SERVER_CONFIG["port"]}...`);
  }).catch((e) => {
    console.log(e);
  })
};

exports.loadModules = function(path, isSub) {
  if(isSub && exports.modules[path].subs === undefined) exports.modules[path].subs = {};
  
  let modulePath = (isSub) ? exports.modules[path].subs : exports.modules;
  let correctedPath = `${__dirname}/../modules/${path}`;

  return new Promise((resolve, reject) => {
    fs.readdir(correctedPath, function (err, files) {
      if(err) return reject("[O] Unable to load modules.");

      files = files.filter((fileName) => {
        if(fileName.includes(".js")) return fileName;
      })
  
      files.forEach((file) => {
        let stats = fs.statSync(`${correctedPath}/${file}`);
        let moduleName = file.split(".")[0];

        if(!stats.isDirectory()) {
          modulePath[moduleName] = require(`${correctedPath}/${file}`);

          if(Object.keys(files).length === Object.keys(modulePath).length) {
            console.log(`[I] Loaded ${Object.keys(modulePath).length} modules.`);
            resolve(true);
            
            for(var key in modulePath) {
              if(typeof(modulePath[key]) === "function") continue;
              
              modulePath[key].initialize();
              console.log(`[I] Module ${key} initialized.`);
            }
          }
        }
      })
    });
  })
}

// Return all connected sockets to the world or specific room (map-* OR party-*)
exports.getConnectedSockets = function(roomName) {
  return new Promise(resolve => {
    let sockets = [];
    let ns = exports.socketConnection.of("/");

    for (var id in ns.connected) {
      if(roomName) {
        var index = ns.connected[id].rooms.indexOf(roomName);
        if(index !== -1) {
          sockets.push(ns.connected[id]);
        }
      } else {
        sockets.push(ns.connected[id]);
      }
    }

    return resolve(sockets);
  });
}