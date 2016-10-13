var Config =
{
    world: {
        map: {
            w: 4096,
            h: 4096,
            color: 0x808080,
            grid: {
                size: 128,
            },
        },
        view: {
            w: 600,
            h: 800,
            grid: {
                size: 32,
                edge: 1,
                color: 0xa0a0a0
            },
        },
        walkable: {
            x: 128,
            y: 128,
            w: 3840,
            h: 3840,
            color: 0xcdcdcd
        },
        updateMS: 1000 / 30
    },

    hpbar: {
        edge: {
            w: 4,
            color: 0x555555,
        },
        w: 100,
        h: 20,
        radius: 10,
        color: 0x86c680,
        xOffset: 0,
        yOffset: 35,
        xDisplayRatio: 1,
        yDisplayRatio: 0.8,
    },

    dieAnimation: {
        alphaStart: 0.4,
        alphaDecrease: 0.1,
        alphaEnd: 0.1,
        scaleIncrease: 0.1
    },

    bullets: {
        normal: {
            edge: {
                w: 2,
                color: 0x555555
            },
            body: {
                radius: 10,
                color: 0x00b2e1
            },
            speed: 400,
            duration: 1000
        }
    },

    obstacles: {
        count: 10,
        small: {
            side: 3,
            radius: 25,
            color: 0xfc7676,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
        },
        middle: {
            side: 4,
            radius: 30,
            color: 0xffe869,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
        },
        large: {
            side: 5,
            radius: 35,
            color: 0x768dfc,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
        },
    },

    tanks: {
        normal: {
            edge: {
                w: 2.5,
                color: 0x555555
            },
            body: {
                radius: 30,
                color: 0x00b2e1
            },
            weapons: [
                {
                    w: 15,
                    h: 50,
                    x: -10,
                    y: 0,
                    bullet: "normal",
                    angle: 0,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 3,
                    disturbDeg: 15,
                },
                {
                    w: 15,
                    h: 50,
                    x: 10,
                    y: 0,
                    bullet: "normal",
                    angle: 0,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 6,
                    disturbDeg: 15,
                }
            ],
            speed: 160,
        }
    }
};

module.exports = Config;
