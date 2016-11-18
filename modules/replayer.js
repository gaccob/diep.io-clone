(function() { "use strict";

var Fs = require("fs");
var Util = require("../modules/util");
var World = require("../modules/world");

function Replayer(recordFile)
{
    this.recordFile = recordFile;
}

Replayer.prototype = {
    constructor: Replayer,
};

Replayer.prototype.run = function(resultFile)
{
    var world = new World(false);
    world.start();

    // run by frame
    Util.readLines(this.recordFile, function(line){

        // completed
        if (!line && resultFile) {
            var result = {};
            result.unitBaseId = world.unitBaseId;
            result.frame = world.frame;
            result.seed = world.seed;
            result.units = [];
            world.dumpUnits(result.units);
            result.unitsToAdd = [];
            world.dumpUnitsToAdd(result.unitsToAdd);
            result.players = [];
            world.dumpPlayers(result.players);
            Fs.writeFile(resultFile, JSON.stringify(result));
            Util.logDebug("replay finished");
            return;
        }

        // parse line
        var frame = line.match(/^\d+/)[0];
        while (world.frame < Number(frame) - 1) {
            world.updateFrameLogic();
        }
        var commanders = JSON.parse(line.substr(frame.length + 1));
        for (var i in commanders) {
            var commander = commanders[i];
            Util.logDebug("frame=" + world.frame + " cmd=" + commander.cmd);
            world.commander.push(world.frame, commander);
        }
    });
};

module.exports = Replayer;

})();
