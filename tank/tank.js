var config = {

    "world": {
        "w": 768,
        "h": 1024,
        "color": 0xcdcdcd
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
        ]
    }
};

var renderer = new PIXI.CanvasRenderer(config.world.w, config.world.h, {
        backgroundColor: config.world.color,
        antialias: true,
        autoResize: true,
    });
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

function spawnTank() {
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(config.tank.edge.w, config.tank.edge.color);
    for (var i in config.tank.weapons) {
        var weapon = config.tank.weapons[i];
        graphics.beginFill(weapon.color);
        // TODO: angle
        graphics.drawRect(weapon.x, weapon.y, weapon.w, weapon.h);
    }
    graphics.beginFill(config.tank.body.color);
    graphics.drawCircle(0, 0, config.tank.body.radius);
    graphics.endFill();

    var tank = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    return tank;
}

var tank = spawnTank();
// tank.position.x = 200;
// tank.position.y = 200;

stage.addChild(tank);

animate();

function animate() {
    tank.x += 1;
    tank.y += 1;
    renderer.render(stage);
    requestAnimationFrame(animate);
}

