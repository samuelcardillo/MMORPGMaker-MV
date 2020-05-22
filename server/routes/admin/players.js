/* global MMO_Core, isTokenValid */
const router = require("express").Router();

/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get("/:playerId?", isTokenValid, function(req, res) {
    if (!req.params.playerId) {
        MMO_Core.database.getPlayers(players => {
            res.status(200).send(players);
        });
    } else {
        MMO_Core.database.findUserById(req.params.playerId, player => {
            res.status(200).send(player);
        });
    }
});

router.patch("/", isTokenValid, (req, res) => {
    if (!req.body.username) {
        return;
    }

    MMO_Core.database.savePlayerById(req.body, () => {
        res.status(200).send(true);
    });
});

router.delete("/:playerId", isTokenValid, (req, res) => {
    if (!req.params.playerId) {
        return;
    }

    MMO_Core.database.deleteUser(req.params.playerId, () => {
        res.status(200).send(true);
    });
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
