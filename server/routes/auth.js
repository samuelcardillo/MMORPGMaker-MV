/* global MMO_Core, isTokenValid, activeTokens */
const router = require("express").Router();

/*****************************
 EXPORTS
 *****************************/

// Sign up user
router.post("/signup", function(req, res) {
    if ((req.body) === undefined || (req.body.password && req.body.username) === undefined) {
        return res.status(403).send({ message: "Fields missing" });
    }

    // Verify if user already exist
    MMO_Core.database.findUser(req.body, function(output) {
        if (output[0] !== undefined) {
            return res.status(500).send({ message: "User already exist." });
        }

        // Register a new account
        MMO_Core.database.registerUser(req.body, function(output) {
            res.status(200).send({ success: true });
        });
    });
});

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

        // Generate valide JWT and send it back
        MMO_Core.security.generateToken(req, output[0], function(_err, result) {
            res.status(200).send(result.token);
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
