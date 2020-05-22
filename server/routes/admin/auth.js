/* global MMO_Core, isTokenValid, activeTokens */
const router = require("express").Router();

/*****************************
 EXPORTS
 *****************************/

// Sign in the user
router.post("/signin", function(req, res) {
    if ((req.body) === undefined || (req.body.password && req.body.username) === undefined) {
        return res.status(403).send({ message: "Fields missing" });
    }

    MMO_Core.database.findUser(req.body, function(output) {
    // If username is incorrect.
        if (output[0] === undefined) {
            return res.status(500).send({ message: "User doesn't exist" });
        }

        // If password is incorrect.
        if (MMO_Core.security.hashPassword(req.body.password.toLowerCase()) !== output[0].password.toLowerCase()) {
            return res.status(500).send({ message: "Incorrect password" });
        }

        // If permission is incorrect
        if (output[0].permission < 100) {
            return res.status(500).send({ message: "You are not permitted to use this page." });
        }

        // Generate valide JWT and send it back
        MMO_Core.security.generateToken(req, output[0], function(_err, result) {
            res.status(200).send(result);
        });
    });
});

// Logout user from JWT
router.get("/logout", isTokenValid, function(req, res) {
    // We filter the variables to get ride of the bad one
    activeTokens[req.token.decoded.username] = activeTokens[req.token.decoded.username].filter(function(value) {
        return value.token !== req.token.token;
    });

    res.status(200).send(true);
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
