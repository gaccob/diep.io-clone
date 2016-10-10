var Config =
{
    "world": {
        "w": 768,
        "h": 1024,
        "color": 0xcdcdcd,
        "updateMS": 1000 / 30
    },

    // 239 73 84
    "bullet": {
        "edge": {
            "w": 2,
            "color": 0x555555
        },
        "body": {
            "radius": 10,
            "color": 0x00b2e1
        },
        "speed": 10,
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
                "w": 15,
                "h": 50,
                "x": -10,
                "y": 0,
                "angle": 0,
                "color": 0x999999,
                "shootOffset": 10,
                "reloadFrame": 10,
                "shootDelayFrame": 3
            },
            {
                "w": 15,
                "h": 50,
                "x": 10,
                "y": 0,
                "angle": 0,
                "color": 0x999999,
                "shootOffset": 10,
                "reloadFrame": 10,
                "shootDelayFrame": 6
            }
        ],
        "speed": 5,
    }
};

module.exports = Config;
