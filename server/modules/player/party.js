/* global MMO_Core */
exports.combat = {};

exports.initialize = function() {
    const io = MMO_Core.socket.socketConnection;

    // ---------------------------------------
    // ---------- SOCKETS EVENTS
    // ---------------------------------------

    io.on("connect", function(player) {
        player.on("party_player_join_fight", async function(gameTroop) {
            if (!player.isInParty) {
                return;
            }

            // If the party is already in combat
            if (exports.combat[player.isInParty][player.playerData.mapId]) {
                // If the member already exist we do nothinng
                if (exports.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
                    // eslint-disable-next-line no-return-assign
                    return exports.combat[player.isInParty][player.playerData.mapId].state = gameTroop;
                }

                // We add/update the member of the combat
                exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;
                exports.refreshPartyData(player.isInParty);
                player.emit("party_player_join_fight", exports.combat[player.isInParty][player.playerData.mapId].state);
                return;
            }

            // If the party is starting the combat.
            exports.combat[player.isInParty][player.playerData.mapId] = {
                initiator: player,
                state: gameTroop,
                members: {},
                actions: {}
            };

            exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;

            // We take all the party members
            const partyMembers = await MMO_Core.socket.modules.player.subs.player.getPlayers(player.isInParty) || {};

            // We iterate through to them to invoke them in the battle if on the same map
            for (const k in partyMembers) {
                if (partyMembers[k].id === player.id) {
                    continue;
                } // If member is the same than player, we do nothing.
                if (partyMembers[k].playerData.mapId !== player.playerData.mapId) {
                    continue;
                } // If member is not on the same map, we don't nothing.

                // We send the join fight socket
                partyMembers[k].emit("party_player_join_fight", exports.combat[player.isInParty][player.playerData.mapId].state);
            }

            exports.refreshPartyData(player.isInParty);
        });

        /*:
     * party_player_action_fight
     */
        player.on("party_player_action_fight", async (action) => {
            console.log("party_player_action_fight");
            if (!player.isInParty || !exports.combat[player.isInParty] || !exports.combat[player.isInParty][player.playerData.mapId]) {
                return;
            }

            // We add the identifiable action to the variable
            action.id = player.id;
            exports.combat[player.isInParty][player.playerData.mapId].actions[player.playerData.username] = action;

            const actionsLength = Object.keys(exports.combat[player.isInParty][player.playerData.mapId].actions).length;
            const membersLength = Object.keys(exports.combat[player.isInParty][player.playerData.mapId].members).length;

            // If all players have finished doing actions
            if (actionsLength === membersLength) {
                const actions = exports.combat[player.isInParty][player.playerData.mapId].actions;
                exports.combat[player.isInParty][player.playerData.mapId].initiator.emit("party_player_estimate_fight", actions);

                // We empty the variable actions for the next turn
                exports.combat[player.isInParty][player.playerData.mapId].actions = {};
            }
        });

        player.on("party_player_estimate_fight", function(results) {
            console.log("party_player_estimate_fight");
            for (const k in exports.combat[player.isInParty][player.playerData.mapId].members) {
                exports.combat[player.isInParty][player.playerData.mapId].members[k].emit("party_player_action_fight", results);
            }
        });

        player.on("party_player_end_fight", function() {
            console.log("party_player_end_fight");
            if (!player.isInParty) {
                ;
            }
            if (!exports.combat[player.isInParty]) {
                return;
            }
            if (!exports.combat[player.isInParty][player.playerData.mapId]) {
                return;
            }

            player.playerData.isInCombat = false;

            if (exports.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
                exports.disbandFight(player.isInParty, player.playerData.mapId);
            }
        });

        player.on("player_update_stats", () => {
            exports.refreshPartyData(player.isInParty);
        });

        // Automatically leave the party when disconnecting
        player.on("disconnect", () => {
            if (exports.combat[player.isInParty]) {
                const mapId = player.playerData.mapId;
                if (exports.combat[player.isInParty][mapId]) {
                    if (exports.combat[player.isInParty][mapId].members[player.id]) {
                        delete exports.combat[player.isInParty][mapId].members[player.id];
                    }
                    if (exports.combat[player.isInParty][mapId].initiator.id === player.id) {
                        exports.disbandFight(player.isInParty, mapId);
                    }
                }
            }

            exports.leaveParty(player);
        });
    });

    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    exports.getPartyLeader = async partyName => {
        const hostId = partyName.split("party-")[1];
        return io.sockets.connected[hostId];
    };

    exports.joinParty = async (joiner, joinee) => {
    // If the joiner is alreayd in a party, we do nothing
        if (joiner.isInParty) {
            return;
        }

        const maxMembers = MMO_Core.gamedata.data.Actors.length - 1; // We take the maximum party members set in RPG Maker MV
        const partyName = `party-${joinee.id}`; // We prepare the party name
        const rawPartyMembers = await MMO_Core.socket.modules.player.subs.player.getPlayers(partyName) || {};

        // If the party is attempted to be created but the game settings don't allow it
        if (maxMembers === 1 || maxMembers < Object.keys(rawPartyMembers).length + 1) {
            return;
        }

        joiner.isInParty = partyName; // We put the joiner in the party
        joiner.join(partyName, () => {
            // We create the party if it was not an existant one before.
            if (!joinee.isInParty) {
                joinee.join(partyName, () => {
                    // We initialize the party if just created.
                    joinee.isInParty = partyName;
                    exports.combat[partyName] = {};
                    exports.refreshPartyData(partyName);
                });
            } else {
                exports.refreshPartyData(partyName);
            }

            MMO_Core.socket.serverEvent.emit("player-joined-party", { player: joiner, partyName: partyName });
        });
    };

    exports.leaveParty = async leaver => {
        if (!leaver.isInParty) {
            return;
        }

        const partyName = leaver.isInParty;
        const partyLeader = await exports.getPartyLeader(leaver.isInParty);

        leaver.leave(partyName, () => {
            leaver.isInParty = false;
            leaver.isInCombat = false;
            leaver.emit("refresh_party_data", {});
            exports.refreshPartyData(partyName);

            MMO_Core.socket.serverEvent.emit("player-left-party", { player: leaver, partyName: partyName });

            // If party lead is leaving
            if (partyLeader === undefined || leaver.id === partyLeader.id) {
                return exports.disbandParty(partyName);
            }
        });
    };

    exports.disbandParty = async partyName => {
        const partyMembers = await MMO_Core.socket.getConnectedSockets(partyName);
        const partyLeader = await MMO_Core.socket.modules.player.subs.player.getPlayerById(partyName.split("party-")[1]);

        MMO_Core.socket.serverEvent.emit("player-disbanded-party", { partyLeader: partyLeader, partyName: partyName });

        delete exports.combat[partyName]; // We delete all fights related to the party

        for (const k in partyMembers) {
            partyMembers[k].isInParty = false;
            partyMembers[k].playerData.isInCombat = false;
            partyMembers[k].emit("refresh_party_data", {});

            exports.leaveParty(partyName);
        }
    };

    exports.refreshPartyData = async partyName => {
        if (!partyName || io.sockets.adapter.rooms[partyName] === undefined) {
            return;
        }

        const rawPartyMembers = await MMO_Core.socket.modules.player.subs.player.getPlayers(partyName) || {};
        const partyMembers = {};

        for (const k in rawPartyMembers) {
            partyMembers[k] = rawPartyMembers[k].playerData;
            partyMembers[k].isInitiator = !!((exports.combat[partyName][rawPartyMembers[k].playerData.mapId] && exports.combat[partyName][rawPartyMembers[k].playerData.mapId].initiator.id === rawPartyMembers[k].id));
            partyMembers[k].isInCombat = !!((exports.combat[partyName][rawPartyMembers[k].playerData.mapId] && exports.combat[partyName][rawPartyMembers[k].playerData.mapId].members[rawPartyMembers[k].id]));
        }

        io.in(partyName).emit("refresh_party_data", partyMembers);
    };

    // ===============
    // Combat handling
    // ===============

    // Return if the party of the player is in combat
    exports.isInCombat = async player => {
        if (!player.isInParty || !exports.combat[player.isInParty][player.playerData.mapId]) {
            return false;
        }
        if (exports.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
            return false;
        }

        return exports.combat[player.isInParty][player.playerData.mapId];
    };

    exports.joinFight = player => {
        if (exports.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
            return;
        }

        // We add the player to the fight
        exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;

        player.emit("party_player_join_fight", exports.combat[player.isInParty][player.playerData.mapId].state);
    };

    exports.disbandFight = async (partyName, mapId) => {
        if (!exports.combat[partyName][mapId]) {
            return;
        }

        const party = exports.combat[partyName][mapId];
        delete exports.combat[partyName][mapId];

        const rawPartyMembers = await MMO_Core.socket.modules.player.subs.player.getPlayers(partyName) || {};

        for (const k in rawPartyMembers) {
            if (rawPartyMembers[k].playerData.mapId !== party.initiator.playerData.mapId) {
                continue;
            }

            rawPartyMembers[k].emit("party_player_disband_fight");
        }
    };

    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
};
