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
};

module.exports = Util;
