/* global MMO_Core */
exports.initialize = function() {
    //  agive playerName[1] itemType[2] itemId/amount[3] amount[4]
    exports.use = async function(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to use this command.", "error");
        }

        const players = await MMO_Core.socket.modules.player.subs.player.getPlayers();
        const amount = parseInt((args[4] !== undefined) ? args[4] : args[3]);
        const itemId = parseInt(args[3]);

        if (players[args[1]] === undefined) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Could not find the player.", "error");
        }
        if (isNaN(args[3])) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Value is not valid.", "error");
        }
        if (args.length < 4) {
            return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Not enough arguments.", "error");
        }

        if (args[2] === "gold") {
            players[args[1]].playerData.stats.gold += amount;

            MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${args[3]} gold!`, "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${args[3]} gold to ${players[args[1]].playerData.username}!`, "action");
        } else if (args[2] === "skills") {
            if (itemId > 0) {
                if (players[args[1]].playerData.stats[args[2]].includes(itemId)) {
                    return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `${players[args[1]].playerData.username} already has this skill.`, "action");
                } else {
                    players[args[1]].playerData.stats.skills.push(itemId);
                }

                MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${itemId} Skill!`, "action");
                MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave skill ${itemId} to ${players[args[1]].playerData.username}!`, "action");
            } else {
                players[args[1]].playerData.stats.skills = players[args[1]].playerData.stats.skills.filter(skill => {
                    if (skill !== -itemId) {
                        return skill;
                    }
                });

                MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} removed ${itemId} skill from you!`, "action");
                MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You removed skill ${itemId} from ${players[args[1]].playerData.username}!`, "action");
            }
        } else if (args[2] === "levels") {
            players[args[1]].playerData.stats.level += amount;

            MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${amount} levels!`, "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${amount} levels to ${players[args[1]].playerData.username}!`, "action");
        } else if (args[2] === "permission") {
            if (initiator.playerData.permission < amount) {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "You don't have the permission to give that amount of permission!", "error");
            }

            players[args[1]].playerData.permission = amount;

            MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${amount} permission!`, "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${amount} permission level to ${players[args[1]].playerData.username}!`, "action");
        } else if (args[2] === "exp") {
            players[args[1]].playerData.stats.exp[1] += amount;

            MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${amount} exp!`, "action");
            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", `You gave ${amount} exp to ${players[args[1]].playerData.username}!`, "action");
        } else {
            if (args[2] !== "weapons" && args[2] !== "items" && args[2] !== "armors") {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Item type is not valid.", "error");
            }
            if (isNaN(args[4])) {
                return MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "Value is not valid.", "error");
            }

            if (players[args[1]].playerData.stats[args[2]][itemId]) {
                players[args[1]].playerData.stats[args[2]][itemId] += amount;
            } else {
                players[args[1]].playerData.stats[args[2]][itemId] = amount;
            }

            MMO_Core.socket.modules.messages.sendToPlayer(initiator, "System", "username: " + args[1] + ", " + args[2] + "ID: " + args[3] + ", with amount: " + args[4], "action");
            MMO_Core.socket.modules.messages.sendToPlayer(players[args[1]], "System", `${initiator.playerData.username} gave you ${args[3]} in the amount of ${args[4]}!`, "action");
        }

        MMO_Core.database.savePlayer({
            username: players[args[1]].playerData.username,
            stats: players[args[1]].playerData.stats,
            permission: players[args[1]].playerData.permission
        }, (e) => {
            MMO_Core.socket.modules.player.subs.player.refreshData(players[args[1]]);
        });
    };
};
