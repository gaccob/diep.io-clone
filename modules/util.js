(function(){ "use strict";

var Util = {

    unitType: {
        tank: 1,
        weapon: 2,
        bullet: 3,
        obstacle: 4,
        hpbar: 5,
    },

    clamp: function(value, min, max) {
        if (value > max) {
            value = max;
        }
        if (value < min) {
            value = min;
        }
        return value;
    },

    clampPosition: function(pos, minx, maxx, miny, maxy) {
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
    },

    randomBetween: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    assert: function(condition, message) {
        if (!condition) {
            throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
        }
    },

    getVectorByControlDir: function(controlDir) {
        var x = 0, y = 0;
        if (controlDir.left == 1) {
            x -= 1;
        }
        if (controlDir.right == 1) {
            x += 1;
        }
        if (controlDir.up == 1) {
            y -= 1;
        }
        if (controlDir.down == 1) {
            y += 1;
        }
        return {x: x, y: y};
    },
};

module.exports = Util;

})();
