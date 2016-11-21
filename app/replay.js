var Replayer = require("../modules/replayer");
var Util = require("../modules/util");

// jshint undef: false
var recordFile = process.argv[2];
if (!recordFile) {
    Util.logError("invalid record file");
    return;
}

var replayer = new Replayer(recordFile);
var resultFile = Util.timeStamp("hhmmss") + ".result";
replayer.run(resultFile);
