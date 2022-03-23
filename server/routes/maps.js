/* global MMO_Core */
const router = require("express").Router();

/*****************************
 EXPORTS
 *****************************/

// Logout user from JWT
router.get("/:mapId", isTokenValid, function(req, res) {
  // We filter the variables to get ride of the bad one
  if (req.params.mapId) {
    const correctedPath = `${__dirname}/${exports.path}data`;
    const mapId = Number(req.params.mapId) <= 999
      ? ("0" + req.params.mapId).slice(-3)
      : req.params.mapId
    const fileName = `${correctedPath}/Map${mapId}.json`
    res.setHeader('content-type', "application/json")
    res.status(200).send(exports.data[fileName]);
  }
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
