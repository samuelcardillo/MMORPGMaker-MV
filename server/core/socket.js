const fs    = require('fs');
var exports = module.exports = {};

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.modules = {};

var io = null;

exports.initialize = function(socketConfig) {
  io = socketConfig;

  // We load all the modules in the socket server
  exports.loadModules('', false).then(() => {
    console.log(`[I] Socket.IO server started on port ${MMO_Core["database"].SERVER_CONFIG["port"]}...`);
  }).catch((e) => {
    console.log(e);
  })
};

exports.loadModules = function(path, isSub) {
  let modulePath = (isSub) ? exports.modules[path] : exports.modules;
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
              modulePath[key].initialize(io);
              console.log(`[I] Module ${key} initialized.`);
            }
          }
        }
      })
    });
  })
}