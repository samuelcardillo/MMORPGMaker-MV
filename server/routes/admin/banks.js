/* global MMO_Core, isTokenValid */
const router = require("express").Router();

/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get("/", isTokenValid, function(req, res) {
    MMO_Core.database.getBanks((banks) => {
        res.status(200).send(banks);
    });
});

router.post("/", isTokenValid, (req, res) => {
    console.dir(req.body);
    MMO_Core.database.createBank(req.body, () => {
        res.status(200).send();
    });
});

router.delete("/:id", isTokenValid, function(req, res) {
    if (!req.params.id) {
        return;
    }

    MMO_Core.database.deleteBank(req.params.id, () => {
        res.status(200).send();
    });
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
