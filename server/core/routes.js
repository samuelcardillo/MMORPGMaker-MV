// Initialize the routing
exports.initialize = function(app, serverConfig, callback) {
    try {
        app.get("/", (req, res) => {
            res.sendFile("/admin/index.html", { root: "." });
        });

        // Add all the routes you want here
        app.use("/api/auth", require("../routes/auth"));
        app.use("/api/map", require("../routes/map"));

        // Routes for the admin system
        app.use("/api/admin/auth", require("../routes/admin/auth"));
        app.use("/api/admin/server", require("../routes/admin/server"));
        app.use("/api/admin/players", require("../routes/admin/players"));
        app.use("/api/admin/banks", require("../routes/admin/banks"));

        const successMsg = "[I] RESTFUL API started on port " + serverConfig.port + " ...";
        return callback(successMsg);
    } catch (e) {
        return callback(e);
    }
};
