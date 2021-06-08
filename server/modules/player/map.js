/* global MMO_Core */
exports.initialize = function() {
    const io = MMO_Core.socket.socketConnection;
    const world = MMO_Core["gameworld"];

    io.on("connect", function(client) {
        // Handle players joining a map
        client.on("map_joined", async function(playerData) {
            if (client.playerData === undefined) {
                return;
            }

            if (client.lastMap !== undefined && client.lastMap !== "map-" + playerData.mapId) {
                if (MMO_Core.database.SERVER_CONFIG.offlineMaps[client.lastMap] === undefined) {
                    client.broadcast.to(client.lastMap).emit("map_exited", client.id);
                }
                client.leave(client.lastMap);
                world.playerLeaveInstance(client.playerData.id, parseInt(client.playerData.mapId));

                MMO_Core.security.createLog(client.playerData.username + " left " + client.lastMap);
            }

            playerData.username = client.playerData.username; // Temporary way to pass the username
            playerData.skin = client.playerData.skin;

            // Storing the new location (in case of disconnecting on a local map)
            client.playerData.x = playerData.x;
            client.playerData.y = playerData.y;
            client.playerData.mapId = parseInt(playerData.mapId);

            // Update global switches
            for (const switchKey in MMO_Core.database.SERVER_CONFIG.globalSwitches) {
                client.emit("player_update_switch", { switchId: switchKey, value: MMO_Core.database.SERVER_CONFIG.globalSwitches[switchKey] });
            }

            // Update global variables
            for (const varKey in MMO_Core.database.SERVER_CONFIG.globalVariables) {
                client.emit("player_update_variable", { variableId: varKey, value: MMO_Core.database.SERVER_CONFIG.globalVariables[varKey] });
            }

            client.join("map-" + playerData.mapId);
            client.lastMap = "map-" + playerData.mapId;
            world.playerJoinInstance(client.playerData.id, parseInt(client.playerData.mapId));

            if (MMO_Core.database.SERVER_CONFIG.offlineMaps[client.lastMap] === undefined) {
                client.broadcast.to("map-" + playerData.mapId).emit("map_joined", { id: client.id, playerData: playerData });
                client.broadcast.to("map-" + playerData.mapId).emit("refresh_players_position", client.id);
            }

            const npcs = await world.getConnectedNpcs(parseInt(client.playerData.mapId));
            if (npcs && npcs.length) client.emit("npcsFetched", {playerId: client.playerData.id, npcs});

            MMO_Core.security.createLog(client.playerData.username + " joined " + client.lastMap);
        });

        // Refresh position of players when map joined
        client.on("refresh_players_position", function(data) {
            if (client.playerData === undefined) {
                return;
            }

            if (MMO_Core.database.SERVER_CONFIG.offlineMaps[client.lastMap] !== undefined) {
                return false;
            }

            MMO_Core.security.createLog(client.playerData.username + " transmitted its position to " + data.id);

            data.playerData.username = client.playerData.username; // Temporary way to pass the username
            data.playerData.skin = client.playerData.skin;
            data.playerData.isBusy = client.playerData.isBusy;

            client.broadcast.to(data.id).emit("map_joined", { id: client.id, playerData: data.playerData });
        });

        // Refresh single player on map
        client.on("refresh_players_on_map", function() {
            if (client.playerData === undefined) {
                return;
            }

            client.broadcast.to("map-" + client.playerData.mapId).emit("refresh_players_on_map", { playerId: client.id, playerData: client.playerData });
        });

        client.on("start_interact_npc", function(npc) {
            if (npc && npc.uniqueId) world.setNpcBusyStatus(uniqueId,{
                id: client.playerData.id,
                type: "player",
                since: new Date()
            });
        });
        client.on("stop_interact_npc", function(npc) {
            if (npc && npc.uniqueId) world.setNpcBusyStatus(uniqueId,false);
        });
    });
};
