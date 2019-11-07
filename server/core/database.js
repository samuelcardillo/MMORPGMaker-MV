var r       = require("rethinkdb");
var async   = require("async");
var exports = module.exports = {};

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.initialize = function() {
  // In case we need more tables in the future
  var tables = [
    "users"
  ];

  // We check if the database exist
  onConnect(function(err, conn) {
    r.dbList().run(conn, function(err, results){
      // If the database exist, we have nothing to do
      if(results.indexOf("mmorpg") !== -1) {
        conn.close(); // We close the connection
        return console.log("[I] Database initialized with success"); // And we abort any additional procedures
      }

      console.log("[O] I have not found the database! 😱  Let me fix that for you...")
      // Else, we create the database and its tables
      r.dbCreate("mmorpg").run(conn, function(err, result){
        console.log("[I] Database was created with success");

        // We create the tables asynchronously
        async.each(tables, function(item, callback){
          r.db("mmorpg").tableCreate(item).run(conn, function(err, result){
            console.log("[I] Table " + item + " was created with success");

            if(item === "users") {
              r.db("mmorpg").table("users").insert([
                {"mapId":1,"skin":1,"username":"Test1","x":9.5625,"y":6},
                {"mapId":1,"skin":1,"username":"Test2","x":9.5625,"y":6},
              ]).run(conn, (err, result) => {
                 console.log("[I] Initial users were created with success");
                 return callback();
              })
            } else { return callback(); }
          });
        }, function(err) {
          conn.close(); // We close the connection at the end
          console.log("[I] All good! Everything is ready for you 😘");
          console.log("[I] Database initialized with success");
          return; // Yay
        });

      })
    })
  })
};

exports.findUser = function(username,callback) {
  r.connect({ db: "mmorpg", host: "localhost", port: 28015 }).then(function(conn){
   r.table('users')
    .filter({
      "username": username,
    })
    .run(conn)
    .then(function(cursor) { return cursor.toArray(); })
    .then(function(output) {
      return callback(output);
    })
    .finally(function() { conn.close(); });  
  })
}

exports.savePlayer = function(playerData,callback) {
  r.connect({ db: "mmorpg", host: "localhost", port: 28015 }).then(function(conn){
   r.table('users')
    .filter({
      "username": playerData["username"],
    })
    .update(playerData)
    .run(conn)
    .then(function(cursor) { return cursor; })
    .then(function(output) {
      return callback(output);
    })
    .finally(function() { conn.close(); });  
  })
}

onConnect = function(callback) {
  r.connect({host: "localhost", port: 28015 }, function(err, connection) {
    if(err) throw err;
    callback(err, connection);
  })
};
