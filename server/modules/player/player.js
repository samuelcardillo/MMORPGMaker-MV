/* global MMO_Core */
exports.initialize = function() {
    const io = MMO_Core.socket.socketConnection;

    io.on("connect", function(client) {
        client.on("player_update_switches", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            client.playerData.switches = payload;
        });

        client.on("player_global_switch_check", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            // If the player is in a party
            if (client.isInParty) {
                if (MMO_Core.database.SERVER_CONFIG.partySwitches[payload.switchId] !== undefined) {
                    io.in(client.isInParty).emit("player_update_switch", payload);
                    return;
                }
            }

            if (MMO_Core.database.SERVER_CONFIG.globalSwitches[payload.switchId] === undefined) {
                return;
            }

            MMO_Core.database.SERVER_CONFIG.globalSwitches[payload.switchId] = payload.value;
            MMO_Core.database.saveConfig();

            client.broadcast.emit("player_update_switch", payload);
        });

        client.on("player_update_variables", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            client.playerData.variables = payload;
        });

        client.on("player_global_variables_check", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            if (MMO_Core.database.SERVER_CONFIG.globalVariables[payload.variableId] === undefined) {
                return;
            }

            MMO_Core.database.SERVER_CONFIG.globalVariables[payload.variableId] = payload.value;
            MMO_Core.database.saveConfig();

            client.broadcast.emit("player_update_variable", payload);
        });

        client.on("player_update_stats", async function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            client.playerData.stats = payload;

            MMO_Core.database.savePlayer(client.playerData, () => {
                exports.refreshData(client);
            });
        });

        client.on("player_update_skin", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            switch (payload.type) {
                case "sprite":
                    client.playerData.skin.characterName = payload.characterName;
                    client.playerData.skin.characterIndex = payload.characterIndex;
                    break;
                case "face":
                    client.playerData.skin.faceName = payload.faceName;
                    client.playerData.skin.faceIndex = payload.faceIndex;
                    break;
                case "battler":
                    client.playerData.skin.battlerName = payload.battlerName;
                    break;
            }
        });

        client.on("player_update_busy", function(payload) {
            if (client.playerData === undefined) {
                return;
            }
            if (client.playerData.isBusy === payload) {
                return;
            }

            client.playerData.isBusy = payload;

            MMO_Core.database.savePlayer({ username: client.playerData.username, isBusy: client.playerData.isBusy }, (e) => {
                client.broadcast.to("map-" + client.playerData.mapId).emit("refresh_players_on_map", { playerId: client.id, playerData: client.playerData });
            });
        });

        client.on("player_moving", function(payload) {
            if (client.playerData === undefined) {
                return;
            }

            if (MMO_Core.database.SERVER_CONFIG.offlineMaps[client.lastMap] !== undefined) {
                return false;
            }

            payload.id = client.id;

            client.playerData.x = payload.x;
            client.playerData.y = payload.y;
            client.playerData.mapId = payload.mapId;

            MMO_Core["gameworld"].mutateNode(MMO_Core["gameworld"].getNodeBy('playerId', client.playerData.id), {
                x: client.playerData.x,
                y: client.playerData.y,
                mapId: client.playerData.mapId
            });

            client.broadcast.to(client.lastMap).emit("player_moving", payload);
        });

        client.on("player_dead", function() {
            if (client.playerData === undefined) {
                return;
            }

            client.emit("player_respawn", { mapId: MMO_Core.database.SERVER_CONFIG.newPlayerDetails.mapId, x: MMO_Core.database.SERVER_CONFIG.newPlayerDetails.x, y: MMO_Core.database.SERVER_CONFIG.newPlayerDetails.y });
        });
    });

    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    exports.getPlayers = async function(spaceName) {
        spaceName = spaceName || false;
        const sockets = await MMO_Core.socket.getConnectedSockets(spaceName);
        const players = {};
        for (let i = 0; i < sockets.length; i++) {
            if (!sockets[i].playerData) {
                continue;
            }

            players[sockets[i].playerData.username.toLowerCase()] = sockets[i];
        }
        return players;
    };

    exports.getPlayer = async function(username) {
        const players = await exports.getPlayers();
        return players[username.toLowerCase()] || null;
    };

    exports.getPlayerById = async function(socketId) {
        return io.sockets.connected[socketId];
    };

    exports.refreshData = function(player) {
        MMO_Core.database.findUserById(player.playerData.id, (playerData) => {
            delete playerData.password; // We delete the password from the result sent back

            player.emit("refresh_player_data", playerData, () => {
                if (!player.isInParty) {
                    return;
                }

                MMO_Core.socket.modules.player.subs.party.refreshPartyData(player.isInParty);
            });
        });
    };
};
