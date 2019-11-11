const express       = require("express")
  , bodyParser    = require('body-parser')
  , path          = require('path')
  , fs            = require('fs')
  , app           = express()
  , server        = require('http').createServer(app)
  , io            = require('socket.io').listen(server, { log: false });

/*****************************
      STARTING THE SERVER
*****************************/

// Express settings
app.use('/app/bower_components', express.static(path.join(process.cwd(), 'bower_components')))
app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json({limit: '2mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true,limit: '2mb'}));   // to support URL-encoded bodies
app.use(function(req,res,next){ // CORS (read : https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

console.log("######################################");
console.log("# MMORPG Maker MV - Samuel Lespes Cardillo");
console.log("# Check GitHub for updates");
console.log("######################################");

// CORE INTEGRATIONS
MMO_Core = {
  "database": require('./core/database'),
  "security": require('./core/security'),
  "socket": require('./core/socket'),
  "routes": require('./core/routes'),
}

try {
  MMO_Core["database"].initialize(() => {  // Initializing the database
    MMO_Core["database"].reloadConfig(() => { // Initializing server config
      server.listen(MMO_Core["database"].SERVER_CONFIG.port); // Listen configured port

      MMO_Core["socket"].initialize(io, MMO_Core[ "database"].SERVER_CONFIG); // Initalizing the socket-side of the server
      MMO_Core["routes"].initialize(app, MMO_Core["database"].SERVER_CONFIG, function(callback) { // Initializing the RESTFUL API
        console.log(callback);
      });
    });
  });
  
} catch(err) {
  console.log(err);
  MMO_Core["socket"].modules["player"]["auth"].saveWorld();
  server.instance.close();
}

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    MMO_Core["socket"].modules["player"]["auth"].saveWorld();
    MMO_Core["security"].saveTokens(function(callback){
      process.exit();
    });
});