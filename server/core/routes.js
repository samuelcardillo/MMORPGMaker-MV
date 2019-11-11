var exports     = module.exports = {};

// Initialize the routing
exports.initialize = function(app, serverConfig, callback) {
  var SERVER_CONFIG = serverConfig;
  
  try {
    app.use('/api/auth'     , require('../routes/auth'));

    return callback("[I] RESTFUL API started on port " + SERVER_CONFIG["port"] + " ...");
  } catch(e) {
    return callback(e);
  }
};
