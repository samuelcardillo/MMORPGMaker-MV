var exports     = module.exports = {};

// Initialize the routing
exports.initialize = function(app, serverConfig, callback) {
  var SERVER_CONFIG = serverConfig;
  
  try {
    app.get("/", (req, res) => {
      res.sendFile("/admin/index.html", {root: '.'});
    })

    // Add all the routes you want here
    app.use('/api/auth'     , require('../routes/auth'));

    // Routes for the admin system
    app.use('/api/admin/auth'     , require('../routes/admin/auth'));
    app.use('/api/admin/server'   , require('../routes/admin/server'));
    app.use('/api/admin/players'  , require('../routes/admin/players'));
    app.use('/api/admin/banks'    , require('../routes/admin/banks'));

    return callback("[I] RESTFUL API started on port " + SERVER_CONFIG["port"] + " ...");
  } catch(e) {
    return callback(e);
  }
};
