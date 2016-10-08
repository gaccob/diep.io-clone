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
        ],
        "speed": 3,
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

var world = {}

function initWorld() {
    world.tank = spawnTank();
    world.tank.position.x = config.world.w / 2;
    world.tank.position.y = config.world.h / 2;
    world.tank.dir = new Victor(0, 0);
    stage.addChild(world.tank);

    document.body.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                world.tank.dir.y -= 1;
                if (world.tank.dir.y < -1) {
                    world.tank.dir.y = -1;
                }
                break;
            case 'd':
            case 'D':
                world.tank.dir.x += 1;
                if (world.tank.dir.x > 1) {
                    world.tank.dir.x = 1;
                }
                break;
            case 's':
            case 'S':
                world.tank.dir.y += 1;
                if (world.tank.dir.y > 1) {
                    world.tank.dir.y = 1;
                }
                break;
            case 'a':
            case 'A':
                world.tank.dir.x -= 1;
                if (world.tank.dir.x < -1) {
                    world.tank.dir.x = -1;
                }
                break;
        }
    }, false);

    document.body.addEventListener('keyup', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                world.tank.dir.y += 1;
                if (world.tank.dir.y > 1) {
                    world.tank.dir.y = 1;
                }
                break;
            case 'd':
            case 'D':
                world.tank.dir.x -= 1;
                if (world.tank.dir.x < -1) {
                    world.tank.dir.x = -1;
                }
                break;
            case 's':
            case 'S':
                world.tank.dir.y -= 1;
                if (world.tank.dir.y < -1) {
                    world.tank.dir.y = -1;
                }
                break;
            case 'a':
            case 'A':
                world.tank.dir.x += 1;
                if (world.tank.dir.x > 1) {
                    world.tank.dir.x = 1;
                }
                break;
        }
    }, false);
}

function animate() {
    // update tank position
    if (world.tank.dir.lengthSq() > 1e-6) {
        var angle = world.tank.dir.angle();
        world.tank.position.x += config.tank.speed * Math.cos(angle);
        world.tank.position.y += config.tank.speed * Math.sin(angle);
    }

    renderer.render(stage);
    requestAnimationFrame(animate);
}

initWorld();
animate();

