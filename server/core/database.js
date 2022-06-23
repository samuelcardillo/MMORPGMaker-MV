/* global MMO_Core, onConnect */
const r = require("rethinkdb");
const async = require("async");

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.SERVER_CONFIG = {};

exports.initialize = function(callback) {
    // In case we need more tables in the future
    const tables = [
        "users",
        "banks",
        "config"
    ];

    // We check if the database exist
    onConnect(function(_err, conn) {
    // IMPORTANT : DO NOT TOUCH THIS
        const initialServerConfig = {
            port: 8097,
            passwordRequired: true,
            newPlayerDetails: {
                permission: 0,
                mapId: 1,
                skin: {
                    characterIndex: 0,
                    characterName: "Actor1",
                    battlerName: "Actor1_1",
                    faceName: "Actor1",
                    faceIndex: 0
                },
                x: 5,
                y: 5
            },
            globalSwitches: {
            },
            partySwitches: {
            },
            globalVariables: {
            },
            offlineMaps: {
            }
        };

        r.dbList().run(conn, function(_err, results) {
            // If the database exist, we have nothing to do
            if (results.indexOf("mmorpg") !== -1) {
                conn.close(); // We close the connection
                MMO_Core.security.loadTokens();
                console.log("[I] Database initialized with success"); // And we abort any additional procedures
                return callback();
            }

            console.log("[O] I have not found the database! 😱  Let me fix that for you...");
            // Else, we create the database and its tables
            r.dbCreate("mmorpg").run(conn, function(_err, result) {
                console.log("[I] Database was created with success");

                // We create the tables asynchronously
                async.each(tables, function(item, callback) {
                    r.db("mmorpg").tableCreate(item).run(conn, function(_err, result) {
                        console.log("[I] Table " + item + " was created with success");

                        if (item === "users") {
                            const user = initialServerConfig.newPlayerDetails;
                            user.username = "admin";
                            user.password = MMO_Core.security.hashPassword("admin");
                            user.permission = 100;

                            r.db("mmorpg").table("users").insert([user]).run(conn, (_err, result) => {
                                console.log("[I] Initial admin account created.");
                                return callback();
                            });
                        } else if (item === "config") {
                            r.db("mmorpg").table("config").insert([initialServerConfig]).run(conn, (_err, result) => {
                                console.log("[I] Initial server configuration was created with success.");
                                return callback();
                            });
                        } else {
                            return callback();
                        }
                    });
                }, function(_err) {
                    conn.close(); // We close the connection at the end
                    console.log("[I] All good! Everything is ready for you 😘");
                    console.log("[I] Database initialized with success");
                    return callback(); // Yay
                });
            });
        });
    });
};

exports.getPlayers = function(callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("users")
            .run(conn)
            .then(function(cursor) {
                return cursor.toArray();
            })
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.findUser = function(userDetails, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("users")
        // .filter({ username: userDetails["username"] })
            .filter(function(user) {
                return user("username").match("(?i)^" + userDetails.username + "$");
            })
            .run(conn)
            .then(function(cursor) {
                return cursor.toArray();
            })
            .then(function(output) {
                return callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.findUserById = function(userId, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("users")
            .get(userId)
            .run(conn)
            .then(function(output) {
                return callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.deleteUser = function(userId, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("users")
            .get(userId)
            .delete()
            .run(conn)
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.registerUser = function(userDetails, callback) {
    const userPayload = exports.SERVER_CONFIG.newPlayerDetails;
    userPayload.username = userDetails.username;
    userPayload.permission = 0; // Just making sure.
    if (exports.SERVER_CONFIG.passwordRequired) {
        userPayload.password = MMO_Core.security.hashPassword(userDetails.password.toLowerCase());
    }

    onConnect(function(_err, conn) {
        r.db("mmorpg").table("users")
            .insert(userPayload)
            .run(conn)
            .then(function(output) {
                return callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.savePlayer = function(playerData, callback) {
    // We delete what we don't want to be saved (in case it is there)

    onConnect(function(_err, conn) {
        let request = r.db("mmorpg").table("users")
            .filter(function(user) {
                return user("username").match("(?i)^" + playerData.username + "$");
            })
            .update(playerData);

        if (playerData.stats) {
            request = request.do(r.db("mmorpg").table("users")
                .filter(function(user) {
                    return user("username").match("(?i)^" + playerData.username + "$");
                })
                .update({ stats: r.literal(playerData.stats) }));
        }

        request.run(conn)
            .then(function(cursor) {
                return cursor;
            })
            .then(function(output) {
                return callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.savePlayerById = function(playerData, callback) {
    onConnect(function(_err, conn) {
        let request = r.db("mmorpg").table("users")
            .get(playerData.id)
            .update(playerData);

        if (playerData.stats) {
            request = request.do(r.db("mmorpg").table("users")
                .filter(function(user) {
                    return user("username").match("(?i)^" + playerData.username + "$");
                })
                .update({ stats: r.literal(playerData.stats) }));
        }

        request.run(conn)
            .then(function(cursor) {
                return cursor;
            })
            .then(function(output) {
                return callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

/// ////////////// BANKS

exports.getBanks = (callback) => {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .run(conn)
            .then(function(cursor) {
                return cursor.toArray();
            })
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.getBank = (bankName, callback) => {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .filter({ name: bankName })
            .run(conn)
            .then(function(cursor) {
                return cursor.toArray();
            })
            .then(function(output) {
                callback(output[0]);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.getBankById = function(bankId, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .get(bankId)
            .run(conn)
            .then(function(cursor) {
                return cursor;
            })
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.saveBank = function(bank, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .get(bank.id)
            .update(bank)
            .run(conn)
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.createBank = function(payload, callback) {
    const content = (payload.type === "global") ? { items: {}, weapons: {}, armors: {}, gold: 0 } : {};
    const template = {
        name: payload.name,
        type: payload.type,
        content: content
    };

    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .insert(template)
            .run(conn)
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

exports.deleteBank = function(bankId, callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("banks")
            .get(bankId)
            .delete()
            .run(conn)
            .then(function(output) {
                callback(output);
            })
            .finally(function() {
                conn.close();
            });
    });
};

/// ////////////// SERVER

exports.reloadConfig = function(callback) {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("config")(0).run(conn)
            .then(function(cursor) {
                return cursor;
            })
            .then(function(output) {
                exports.SERVER_CONFIG = output;
                callback();
            })
            .finally(() => {
                conn.close();
            });
    });
};

exports.changeConfig = function(type, payload, callback) {
    onConnect(function(_err, conn) {
        let query = r.db("mmorpg").table("config")(0);

        if (type === "globalSwitches") {
            query = query.update({ globalSwitches: r.literal(payload) });
        } else if (type === "partySwitches") {
            query = query.update({ partySwitches: r.literal(payload) });
        } else if (type === "offlineMaps") {
            query = query.update({ offlineMaps: r.literal(payload) });
        } else if (type === "globalVariables") {
            query = query.update({ globalVariables: r.literal(payload) });
        } else if (type === "newPlayerDetails") {
            query = query.update({ newPlayerDetails: r.literal(payload) });
        }

        query.run(conn)
            .then(function(cursor) {
                return cursor;
            })
            .then(function(output) {
                exports.reloadConfig(() => {
                    console.log("[I] Server configuration changes saved.");
                });
                callback();
            })
            .finally(() => {
                conn.close();
            });
    });
};

exports.saveConfig = function() {
    onConnect(function(_err, conn) {
        r.db("mmorpg").table("config")(0)
            .update(exports.SERVER_CONFIG)
            .run(conn)
            .then(() => {
                console.log("[I] Server configuration changes saved.");
            })
            .finally(() => {
                conn.close();
            });
    });
};

// eslint-disable-next-line no-global-assign
onConnect = function(callback) {
    r.connect({
        host: process.env.RETHINKDB_HOST || "localhost",
        port: parseInt(process.env.RETHINKDB_PORT) || 28015
    }, function(err, connection) {
        if (err) {
            throw err;
        }
        callback(err, connection);
    });
};
