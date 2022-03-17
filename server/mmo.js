/* global MMO_Core */
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server, { log: false });

/*****************************
      STARTING THE SERVER
*****************************/

// Express settings
app.use("/admin/bower_components", express.static(path.join(process.cwd(), "bower_components")));
app.use(express.static(path.join(__dirname, "admin")));
app.use(bodyParser.json({ limit: "2mb" })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" })); // to support URL-encoded bodies
app.use(function(req, res, next) { // CORS (read : https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    next();
});

app.use("/data", express.static(path.join(__dirname, "..", "data")));

console.log("######################################");
console.log("# MMORPG Maker MV - Samuel Lespes Cardillo");
console.log("# MMORPG Maker MZ - Axel Andaroth");
console.log("# Check GitHub for updates");
console.log("######################################");

// CORE INTEGRATIONS
// eslint-disable-next-line
MMO_Core = {
    gamedata: require("./core/gamedata"),
    database: require("./core/database"),
    security: require("./core/security"),
    socket: require("./core/socket"),
    routes: require("./core/routes"),
    rpgmaker: require("./core/rpgmaker"),
    gameworld: require("./core/gameworld")
};

try {
    MMO_Core.gamedata.initialize();
    MMO_Core.database.initialize(() => { // Initializing the database
        MMO_Core.database.reloadConfig(() => { // Initializing server config
            server.listen(MMO_Core.database.SERVER_CONFIG.port); // Listen configured port

            MMO_Core.socket.initialize(io, MMO_Core.database.SERVER_CONFIG); // Initalizing the socket-side of the server
            MMO_Core.routes.initialize(app, MMO_Core.database.SERVER_CONFIG, () => { // Initializing the RESTFUL API
                MMO_Core.gameworld.initialize(); // Initializing world environment
            });
        });
    });
} catch (err) {
    console.log(err);
    MMO_Core.socket.modules.player.subs.auth.saveWorld();
    server.instance.close();
}

process.on("SIGINT", function() {
    console.log("Caught interrupt signal");
    MMO_Core.socket.modules.player.subs.auth.saveWorld();
    MMO_Core.security.saveTokens(function(callback) {
        process.exit();
    });
});
