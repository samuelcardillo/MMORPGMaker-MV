const fs = require("fs");

/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.path = "../../";
exports.loaded = false;
exports.data = {};

exports.initialize = function() {
    exports.reloadData(() => {
        console.log(`[I] ${Object.keys(exports.data).length} game files loaded.`);
        console.log("[I] Game data initialized with success.");
        exports.loaded = true;
    });
};

// Reload the game files data
exports.reloadData = function(callback) {
    const correctedPath = `${__dirname}/${exports.path}data`;

    try {
        const stats = fs.statSync(`${correctedPath}`);

        if (!stats.isDirectory()) {
            return console.log("[O] Data folder doesn't seems to exist.");
        }

        fs.readdir(correctedPath, function(_err, files) {
            files.forEach((file) => {
                const fileName = file.split(".json")[0];

                if (file.includes(".json")) {
                    fs.readFile(`${correctedPath}/${file}`, "utf8", function(_err, contents) {
                        exports.data[fileName] = JSON.parse(contents);

                        if (Object.keys(files).length === Object.keys(exports.data).length) {
                            // eslint-disable-next-line standard/no-callback-literal
                            return callback(true);
                        }
                    });
                }
            });
        });
    } catch (e) {
        return console.log("[O] Could not find game data directory.");
    }
};

// Save the data back to the game files
exports.saveData = function(dataName) {
    if (exports.data[dataName] === undefined) {
        return console.log("[O] Data doesn't seems to exist.");
    }

    const correctedPath = `${__dirname}/${exports.path}data`;

    fs.writeFile(`${correctedPath}/${dataName}.json`, JSON.stringify(exports.data[dataName]), function(err) {
        if (err) {
            return console.log(`[O] Error while saving ${dataName}`);
        }

        console.log(`[I] ${dataName} was saved with success.`);
    });
};
