(function() { "use strict";

var Fs = require("fs");

var Util = require("../modules/util");

function Record()
{
    // nothing to do
}

Record.prototype = {
    constructor: Record,
};

Record.prototype.start = function()
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

Record.prototype.append = function(frame, commanders)
{
    if (commanders.length > 0) {
        var option = {flag: 'a+'};
        Fs.writeFile(this.file, frame + ":" + JSON.stringify(commanders) + "\n", option);
    }
};

module.exports = Record;

})();
