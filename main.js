var Config = require("./modules/config");
var Tank = require("./modules/tank");

var world = {};

function initWorld()
{
    world.frame = 0;

    var dateTime = new Date();
    world.ms = dateTime.getTime();

    world.stage = new PIXI.Container();
    world.renderer = new PIXI.CanvasRenderer(Config.world.w, Config.world.h, {
            backgroundColor: Config.world.color,
            antialias: true,
            autoResize: true,
        });
    document.body.appendChild(world.renderer.view);

    world.bullets = [];
    world.tank = new Tank(world, "normal", true);
}

function updateWorld()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();

    // update logic
    while (ms > world.ms + Config.world.updateMS) {

        world.ms += Config.world.updateMS;
        world.frame ++;

        world.tank.update();

        for (var i in world.bullets) {
            var bullet = world.bullets[i];
            if (bullet.update() < 0) {
                var idx = world.stage.getChildIndex(bullet.sprite);
                world.bullets.splice(i, 1);
                world.stage.removeChildAt(idx);
                delete bullet;
            }
        }
    }

    world.renderer.render(world.stage);
    requestAnimationFrame(updateWorld);
}

initWorld();

updateWorld();

