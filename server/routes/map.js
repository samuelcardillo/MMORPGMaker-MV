const router = require("express").Router();
const fs = require("fs");

router.get("/:name", function(req, res) {
  if (req.params.name) {
    const correctedPath = `${__dirname}/../../data`;
    const fileName = `${correctedPath}/${req.params.name}`; // format the name
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
