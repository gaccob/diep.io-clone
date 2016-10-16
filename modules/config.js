var Config =
{
    world: {
        map: {
            w: 2048,
            h: 2048,
            color: 0x808080,
            grid: {
                size: 128,
            },
        },
        view: {
            w: document.documentElement.clientWidth,
            h: document.documentElement.clientHeight - 10,
            grid: {
                size: 32,
                edge: 1,
                color: 0xa0a0a0
            },
        },
        obstacleSpawn: {
            wRatio: 0.92,
            hRatio: 0.92,
            color: 0xcdcdcd,
            maxCount: 30,
        },
        unitCollideCheckMS: 500,
        updateMS: 1000 / 30,
        externalVelocityDecPerSecond: 300,
        externalVelocityMax: 800,
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
        xOffsetRatio: 0,
        yOffsetRatio: 1.3,
        xDisplayRatio: 0.6,
        yDisplayRatio: 0.6,
        alpha: 0.75,
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
                radius: 8,
                color: 0xf14e54,
                playerColor: 0x00b2e1,
            },
            speed: 300,
            duration: 1000,
            hp: 1,
            damage: 10,
        }
    },

    obstacles: {
        small: {
            side: 3,
            radius: 20,
            color: 0xfc7676,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
            hp: 20,
            damage: 2,
        },
        middle: {
            side: 4,
            radius: 20,
            color: 0xffe869,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
            hp: 40,
            damage: 4,
        },
        large: {
            side: 5,
            radius: 24,
            color: 0x768dfc,
            edge: {
                w: 2.5,
                color: 0x555555
            },
            rotationSpeed: 0.5,
            moveSpeed: 3,
            hp: 80,
            damage: 8,
        },
    },

    tanks: {
        base: {
            edge: {
                w: 2.5,
                color: 0x555555
            },
            body: {
                radius: 20,
                color: 0xf14e54,
                playerColor: 0x00b2e1,
            },
            weapons: [
                {
                    w: 15,
                    h: 32,
                    x: 0,
                    y: 0,
                    bullet: "normal",
                    angle: 0,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 3,
                    disturbDeg: 15,
                },
            ],
            speed: 160,
            hp: 100,
            damage: 10,
        },
        twin: {
            edge: {
                w: 2.5,
                color: 0x555555
            },
            body: {
                radius: 24,
                color: 0xf14e54,
                playerColor: 0x00b2e1,
            },
            weapons: [
                {
                    w: 12,
                    h: 38,
                    x: -8,
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
                    w: 12,
                    h: 38,
                    x: 8,
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
            hp: 200,
            damage: 10,
        },
        quad: {
            edge: {
                w: 2.5,
                color: 0x555555
            },
            body: {
                radius: 24,
                color: 0xf14e54,
                playerColor: 0x00b2e1,
            },
            weapons: [
                {
                    w: 16,
                    h: 34,
                    x: 0,
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
                    w: 16,
                    h: 34,
                    x: 0,
                    y: 0,
                    bullet: "normal",
                    angle: 90,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 3,
                    disturbDeg: 15,
                },
                {
                    w: 16,
                    h: 34,
                    x: 0,
                    y: 0,
                    bullet: "normal",
                    angle: 180,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 6,
                    disturbDeg: 15,
                },
                {
                    w: 16,
                    h: 34,
                    x: 0,
                    y: 0,
                    bullet: "normal",
                    angle: 270,
                    color: 0x999999,
                    shootOffset: 10,
                    reloadFrame: 10,
                    shootDelayFrame: 6,
                    disturbDeg: 15,
                },
            ],
            speed: 160,
            hp: 200,
            damage: 10,
        },
    }
};

module.exports = Config;
