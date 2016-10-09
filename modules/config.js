var Config = {

    "world": {
        "w": 768,
        "h": 1024,
        "color": 0xcdcdcd
    },

    // 239 73 84
    "bullet": {
        "edge": {
            "w": 2.5,
            "color": 0x555555
        },
        "body": {
            "radius": 6,
            "color": 0x00b2e1
        },
    },

    "tank": {
        "edge": {
            "w": 2.5,
            "color": 0x555555
        },
        "body": {
            "radius": 30,
            "color": 0x00b2e1
        },
        "weapons": [
            {
                "w": 20,
                "h": 55,
                "x": -10,
                "y": -55,
                "angle": 0,
                "color": 0x999999
            }
        ],
        "speed": 3,
    }
};

module.exports = Config;
