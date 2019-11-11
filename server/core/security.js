var crypto  = require('crypto')
  , r       = require('rethinkdb')
  , jwt     = require('jsonwebtoken')
  , fs      = require('fs')
  , exports = module.exports = {};

activeTokens    = {}; // Allow to have a better control on what are the "active sessions"

// Secret variables 👀
var securityDetails = {
  specialSalt     : process.env.specialSalt || "SuperSecretKey",
  tokenPassphrase : process.env.tokenPassphrase || "keyboard cat"
};

// Middleware to ensure that token is valid
// Its in a variable in order be used as a global function
// so it doesn't need to be redeclared in every modules
isTokenValid = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // if there is no token, return an error
  if (!token) return res.status(403).send({ message: 'No token provided.'});

  // verify the token & decode it
  jwt.verify(token, securityDetails.tokenPassphrase, function(err, decoded) {
    var tokenExist = false; // Default value to false for the condition
    if (err || activeTokens[decoded["email"]] === undefined) return res.status(403).send({ message: 'Failed to authenticate token.' });

    // Going through every active user tokens
    for(var k in activeTokens[decoded["email"]]) {
      if(activeTokens[decoded["email"]][k].token !== token) continue;
      activeTokens[decoded["email"]][k].lastAccessed = new Date(); // We update the last accessed value with actual date
      tokenExist = true // If the token is found, then we turn this variable to true
    }

    // If tokenExist is still on false, then we return that the auth failed.
    if(!tokenExist) return res.status(403).send({ message: 'Failed to authenticate token.' });

    // storing it in the request
    req.token = {
      token: token,
      decoded: decoded
    };

    next();
  });
};

exports.generateToken = function(requestDetails, userDetails, callback) {
  var error = false;
  var generatedToken = jwt.sign(userDetails, securityDetails.tokenPassphrase, { expiresIn: '1d' }); // We generate the token

  if(activeTokens[requestDetails.body.email] === undefined) activeTokens[requestDetails.body.email] = [];

  // We add the token in the user details
  userDetails.token = generatedToken;

  // We store the token in the active tokens and few info for security
  activeTokens[requestDetails.body.email].push({
    token         :   userDetails.token,
    userAgent     :   requestDetails.headers["user-agent"],
    ipAddress     :   requestDetails.headers["x-forward-for"],
    createdOn     :   new Date(),
    lastAccessed  :   new Date()
  });

  return callback(error, userDetails);
};

exports.loadTokens = () => {
  onConnect(function(err, conn) {
    fs.readFile('./tokens.json', (err, data) => {
      if(err) return activeTokens = {};
      activeTokens = JSON.parse(data);
      console.log("[I] " + Object.keys(JSON.parse(data)).length + " active JWT loaded from local file!");
    })
  })
};

exports.saveTokens = (callback) => {
  onConnect((err, conn) => {
    fs.writeFile("./tokens.json", JSON.stringify(activeTokens), (err) => {
      if(err) return console.log(err);

      console.log("[I] Active JWT saved in local file.");
      return callback(true);
    });
  })
};

// Hash the password using SHA256 algorithm /w a salt 🔐
exports.hashPassword = function(password) {
  return crypto.createHmac("sha256", securityDetails.specialSalt).update(password).digest('hex');
};

exports.generatePassword = function(length) {
  var length = (length)?(length):(10);
  var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
  var numeric = '0123456789';
  var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
  var password = "";
  var character = "";
  var crunch = true;
  var entity1, entity2, entity3, hold;
  while( password.length<length ) {
      entity1 = Math.ceil(string.length * Math.random()*Math.random());
      entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
      entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
      hold = string.charAt( entity1 );
      hold = (entity1%2==0)?(hold.toUpperCase()):(hold);
      character += hold;
      character += numeric.charAt( entity2 );
      character += punctuation.charAt( entity3 );
      password = character;
  }
  return password;
}
