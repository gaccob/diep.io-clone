(function(){ "use strict";

var Fs = require("fs");
var Victor = require("victor");

var Package = require("../package.json");

var Util = {

    unitType: {
        tank: 1,
        weapon: 2,
        bullet: 3,
        obstacle: 4,
    },

    logLevelType: {
        trace: 0,
        debug: 1,
        error: 2,
        fatal: 3,
    },

    epsilon: 0.000001,
};

Util.assert = function(condition, message)
{
    if (!condition) {
        throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
    }
};

Util.clamp = function(value, min, max)
{
    if (value > max) {
        value = max;
    }
    if (value < min) {
        value = min;
    }
    return value;
};

Util.clampPosition = function(pos, minx, maxx, miny, maxy)
{
    if (pos.x > maxx) {
        pos.x = maxx;
    }
    if (pos.x < minx) {
        pos.x = minx;
    }
    if (pos.y > maxy) {
        pos.y = maxy;
    }
    if (pos.y < miny) {
        pos.y = miny;
    }
};

Util.getVectorByForceDir = function(dir)
{
    var x = 0, y = 0;
    if (dir.left == 1) {
        x -= 1;
    }
    if (dir.right == 1) {
        x += 1;
    }
    if (dir.up == 1) {
        y -= 1;
    }
    if (dir.down == 1) {
        y += 1;
    }
    return new Victor(x, y);
};

Util.logTrace = function(str)
{
    if (Package.app.logLevel <= Util.logLevelType.trace) {
        console.log("TRACE: " + str);
    }
};

Util.logDebug = function(str)
{
    if (Package.app.logLevel <= Util.logLevelType.debug) {
        console.log("DEBUG: " + str);
    }
};

Util.logError = function(str)
{
    if (Package.app.logLevel <= Util.logLevelType.error) {
        console.log("ERROR: " + str);
    }
};

Util.logFatal = function(str)
{
    if (Package.app.logLevel <= Util.logLevelType.fatal) {
        console.log("FATAL: " + str);
    }
};

Util.findUIObject = function(object, id)
{
    if (object.Id === id) {
        return object;
    }
    for (var i in object.children) {
        var found = Util.findUIObject(object.children[i], id);
        if (found) {
            return found;
        }
    }
    return null;
};

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

Util.timeStamp = function(format)
{
    return new Date().Format(format);
};

Util.readLines = function(file, callback)
{
    Fs.exists(file, function(existed) {
        if (existed !== true) {
            Util.logError("file[" + file + "] not found");
            return;
        }

        var input = Fs.createReadStream(file);
        var remaining = '';
        input.on('data', function(data) {
            remaining += data;
            var index = remaining.indexOf('\n');
            while (index > -1) {
                var line = remaining.substring(0, index);
                remaining = remaining.substring(index + 1);
                callback(line);
                index = remaining.indexOf('\n');
            }
        });
        input.on('end', function() {
            if (remaining.length > 0) {
                callback(remaining);
            }
            callback();
        });
    });
};

Util.propTypeToString = function(propType, propTypeEnum)
{
    switch (propType) {
        case propTypeEnum.PT_HEALTH_REGEN:
            return "PT_HEALTH_REGEN";
        case propTypeEnum.PT_MAX_HEALTH:
            return "PT_MAX_HEALTH";
        case propTypeEnum.PT_BODY_DAMAGE:
            return "PT_BODY_DAMAGE";
        case propTypeEnum.PT_BULLET_SPEED:
            return "PT_BULLET_SPEED";
        case propTypeEnum.PT_BULLET_PENETRATION:
            return "PT_BULLET_PENETRATION";
        case propTypeEnum.PT_BULLET_DAMAGE:
            return "PT_BULLET_DAMAGE";
        case propTypeEnum.PT_RELOAD:
            return "PT_RELOAD";
        case propTypeEnum.PT_MOVEMENT_SPEED:
            return "PT_MOVEMENT_SPEED";
        default:
            Util.logError("prop type=" + propType + " not found");
            break;
    }
};

Util.distance2 = function(x1, y1, x2, y2)
{
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
};

module.exports = Util;

})();
