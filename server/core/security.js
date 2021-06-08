/* global onConnect */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");

let activeTokens = {}; // Allow to have a better control on what are the "active sessions"

// Secret variables 👀
const securityDetails = {
    // eslint-disable-next-line no-irregular-whitespace
    specialSalt: process.env.specialSalt || "SuperSecretKey",
    // eslint-disable-next-line no-irregular-whitespace
    tokenPassphrase: process.env.tokenPassphrase || "keyboard cat"
};

// Handle the debugging verbose
// 1 : No debug
// 2 : Only in console
// 3 : Console + File writing
exports.debugVerbose = 3;

// Middleware to ensure that token is valid
// Its in a variable in order be used as a global function
// so it doesn't need to be redeclared in every modules
// eslint-disable-next-line
isTokenValid = function(req, res, next) {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    // if there is no token, return an error
    if (!token) {
        return res.status(403).send({ message: "No token provided." });
    }

    // verify the token & decode it
    jwt.verify(token, securityDetails.tokenPassphrase, function(err, decoded) {
        let tokenExist = false; // Default value to false for the condition
        // eslint-disable-next-line no-irregular-whitespace
        if (err || activeTokens[decoded.email] === undefined) {
            return res.status(403).send({ message: "Failed to authenticate token." });
        }

        // Going through every active user tokens
        for (const k in activeTokens[decoded.email]) {
            if (activeTokens[decoded.email][k].token !== token) {
                continue;
            }
            activeTokens[decoded.email][k].lastAccessed = new Date(); // We update the last accessed value with actual date
            tokenExist = true; // If the token is found, then we turn this variable to true
        }

        // If tokenExist is still on false, then we return that the auth failed.
        if (!tokenExist) {
            return res.status(403).send({ message: "Failed to authenticate token." });
        }

        // storing it in the request
        req.token = {
            token: token,
            decoded: decoded
        };

        next();
    });
};

exports.generateToken = function(requestDetails, userDetails, callback) {
    const error = false;
    const generatedToken = jwt.sign(userDetails, securityDetails.tokenPassphrase, { expiresIn: "1d" }); // We generate the token

    if (activeTokens[requestDetails.body.email] === undefined) {
        activeTokens[requestDetails.body.email] = [];
    }

    // We add the token in the user details
    userDetails.token = generatedToken;

    // We store the token in the active tokens and few info for security
    activeTokens[requestDetails.body.email].push({
        token: userDetails.token,
        userAgent: requestDetails.headers["user-agent"],
        ipAddress: requestDetails.headers["x-forward-for"],
        createdOn: new Date(),
        lastAccessed: new Date()
    });

    return callback(error, userDetails);
};

exports.loadTokens = () => {
    onConnect(function(_err, conn) {
        fs.readFile("./tokens.json", (err, data) => {
            if (err) {
                // eslint-disable-next-line no-return-assign
                return activeTokens = {};
            }
            activeTokens = JSON.parse(data);
            console.log("[I] " + Object.keys(JSON.parse(data)).length + " active JWT loaded from local file!");
        });
    });
};

exports.saveTokens = (callback) => {
    onConnect((_err, conn) => {
        fs.writeFile("./tokens.json", JSON.stringify(activeTokens), (err) => {
            if (err) {
                return console.log(err);
            }

            console.log("[I] Active JWT saved in local file.");
            // eslint-disable-next-line standard/no-callback-literal
            return callback(true);
        });
    });
};

// Hash the password using SHA256 algorithm /w a salt 🔐
exports.hashPassword = function(password) {
    return crypto.createHmac("sha256", securityDetails.specialSalt).update(password).digest("hex");
};

exports.generatePassword = function(length) {
    length = (length) || (10);
    const string = "abcdefghijklmnopqrstuvwxyz"; // to upper
    const numeric = "0123456789";
    const punctuation = "!@#$%^&*()_+~`|}{[]\\:;?><,./-=";
    let password = "";
    let character = "";
    let entity1, entity2, entity3, hold;
    while (password.length < length) {
        entity1 = Math.ceil(string.length * Math.random() * Math.random());
        entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
        hold = string.charAt(entity1);
        hold = (entity1 % 2 === 0) ? (hold.toUpperCase()) : (hold);
        character += hold;
        character += numeric.charAt(entity2);
        character += punctuation.charAt(entity3);
        password = character;
    }
    return password;
};

exports.createLog = function(message,type) {
    if (exports.debugVerbose <= 1 || !message) {
        return;
    }

    if (type === 'error') console.error(message);
    else if (type === 'warn') console.warn(message);
    else console.log(message);

    if (exports.debugVerbose >= 3) {
        const fullDate = new Date();
        const todayDate = `${fullDate.getFullYear()}-${fullDate.getMonth()}-${fullDate.getDate()}`;

        fs.appendFile(`${todayDate}.log`, `${fullDate.toISOString()} : ${message}\r\n`, function(err) {
            if (err) {
                throw err;
            }
        });
    }
};
