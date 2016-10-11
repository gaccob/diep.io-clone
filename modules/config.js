var Config =
{
    "world": {
        "map": {
            "w": 2048,
            "h": 2048,
            "color": 0x808080
        },
        "view": {
            "w": 600,
            "h": 800
        },
        "grid": {
            "size": 32,
            "edge": 1,
            "color": 0xa0a0a0
        },
        "walkable": {
            "x": 128,
            "y": 128,
            "w": 1792,
            "h": 1792,
            "color": 0xcdcdcd
        },
        "updateMS": 1000 / 30
    },

    "bullets": {
        "normal": {
            "edge": {
                "w": 2,
                "color": 0x555555
            },
            "body": {
                "radius": 10,
                "color": 0x00b2e1
            },
            "speed": 10,
        }
    },

    "tanks": {
        "normal": {
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
                    "bullet": "normal",
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
                    "bullet": "normal",
                    "angle": 0,
                    "color": 0x999999,
                    "shootOffset": 10,
                    "reloadFrame": 10,
                    "shootDelayFrame": 6
                }
            ],
            "speed": 5,
        }
    }
};

module.exports = Config;
