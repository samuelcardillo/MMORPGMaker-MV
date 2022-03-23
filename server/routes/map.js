const router = require("express").Router();
const fs = require("fs");

router.get("/:mapId", function(req, res) {
  if (req.params.mapId) {
    const correctedPath = `${__dirname}/../../data`;
    const mapId = // format the number
      Number(req.params.mapId) <= 9 ? "00" + Number(req.params.mapId)
      : Number(req.params.mapId) <= 99 ? "0" + Number(req.params.mapId)
      : req.params.mapId
    const fileName = `${correctedPath}/Map${mapId}.json`; // format the name
    fs.readFile(fileName, "utf8", function(_err, contents) { // open map
      if (_err) res.status(404).send()
      try {
        const jsMap = JSON.parse(contents) // to JSON
        res.setHeader('content-type', "application/json");
        res.send(jsMap);
      } catch (_) { res.status(404).send() }
    });
  } else res.status(404).send()
});

module.exports = router;
