var config = require("./modules/config");
console.log(config);

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
    tank.anchor.x = (config.tank.body.radius + config.tank.edge.w) / tank.width;
    tank.anchor.y = (weapon.h + config.tank.edge.w) / tank.height;
    graphics.destroy();
    return tank;
}

var world = {}

function initWorld() {
    world.tank = spawnTank();
    world.tank.position.x = config.world.w / 2;
    world.tank.position.y = config.world.h / 2;
    world.tank.moveDir = new Victor(0, 0);
    world.tank.targetPos = new Victor(0, 0);
    stage.addChild(world.tank);

    document.body.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                world.tank.moveDir.y -= 1;
                if (world.tank.moveDir.y < -1) {
                    world.tank.moveDir.y = -1;
                }
                break;
            case 'd':
            case 'D':
                world.tank.moveDir.x += 1;
                if (world.tank.moveDir.x > 1) {
                    world.tank.moveDir.x = 1;
                }
                break;
            case 's':
            case 'S':
                world.tank.moveDir.y += 1;
                if (world.tank.moveDir.y > 1) {
                    world.tank.moveDir.y = 1;
                }
                break;
            case 'a':
            case 'A':
                world.tank.moveDir.x -= 1;
                if (world.tank.moveDir.x < -1) {
                    world.tank.moveDir.x = -1;
                }
                break;
        }
    }, false);

    document.body.addEventListener('keyup', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                world.tank.moveDir.y += 1;
                if (world.tank.moveDir.y > 1) {
                    world.tank.moveDir.y = 1;
                }
                break;
            case 'd':
            case 'D':
                world.tank.moveDir.x -= 1;
                if (world.tank.moveDir.x < -1) {
                    world.tank.moveDir.x = -1;
                }
                break;
            case 's':
            case 'S':
                world.tank.moveDir.y -= 1;
                if (world.tank.moveDir.y < -1) {
                    world.tank.moveDir.y = -1;
                }
                break;
            case 'a':
            case 'A':
                world.tank.moveDir.x += 1;
                if (world.tank.moveDir.x > 1) {
                    world.tank.moveDir.x = 1;
                }
                break;
        }
    }, false);

    document.body.addEventListener('mousemove', function(e) {
        world.tank.targetPos.x = e.x;
        world.tank.targetPos.y = e.y;
    }, false);
}

function animate() {
    // update tank position
    if (world.tank.moveDir.lengthSq() > 1e-6) {
        var angle = world.tank.moveDir.angle();
        world.tank.position.x += config.tank.speed * Math.cos(angle);
        world.tank.position.y += config.tank.speed * Math.sin(angle);
    }

    // update tank weapon direction
    if (world.tank.targetPos.lengthSq() > 1e-6) {
        var dir = world.tank.targetPos.clone().subtract(world.tank.position);
        world.tank.rotation = dir.angle() + Math.PI / 2;
    }

    renderer.render(stage);
    requestAnimationFrame(animate);
}

initWorld();
animate();
