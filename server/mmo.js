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
const SERVER_CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
server.listen(SERVER_CONFIG['port']);

console.log("######################################");
console.log("# MMORPG Maker MV - Samuel Lespes Cardillo");
console.log("# Check GitHub for updates");
console.log("######################################");

// CORE INTEGRATIONS
MMO_Core = {
  "database": require('./core/database'),
  "socket": require('./core/socket.js'),
}

MMO_Core["database"].initialize(); // Initializing the database
MMO_Core["socket"].initialize(io, SERVER_CONFIG); // Initalizing the socket-side of the server

