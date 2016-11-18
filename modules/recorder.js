(function() { "use strict";

var Fs = require("fs");
var Util = require("../modules/util");

function Recorder()
{
}

Recorder.prototype = {
    constructor: Recorder,
};

Recorder.prototype.start = function()
{
    var date = Util.timeStamp("yyyyMMdd");
    var dir = "www/record/" + date;
    Fs.exists(dir, function(existed) {
        if (existed) {
            return;
        }
        Fs.mkdir(dir, function(err) {
            if (err) {
                Util.logError("create record directory[" + dir + "] fail:" + err);
                return;
            }
        });
    });

    this.file = dir + "/" + Util.timeStamp("hhmmss") + ".dat";
};

Recorder.prototype.append = function(frame, commanders)
{
    if (commanders.length > 0) {
        var option = {flag: 'a+'};
        Fs.writeFile(this.file, frame + ":" + JSON.stringify(commanders) + "\n", option);
    }
};

module.exports = Recorder;

})();
