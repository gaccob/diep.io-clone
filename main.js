var Config = require("./modules/config");
var Tank = require("./modules/tank");
var View = require("./modules/view");

var renderer = new PIXI.CanvasRenderer(Config.world.w, Config.world.h, {
        backgroundColor: Config.world.color,
        antialias: true,
        autoResize: true,
    });
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var world = {}
world.bullets = [];

function initWorld() {
    world.tank = new Tank(world, stage, true);
}

function animate() {
    world.tank.update();
    for (var i in world.bullets) {
        var bullet = world.bullets[i];
        if (bullet.update() < 0) {
            var idx = stage.getChildIndex(bullet.sprite);
            world.bullets.splice(i, 1);
            stage.removeChildAt(idx);
            delete bullet;
        }
    }
    renderer.render(stage);
    requestAnimationFrame(animate);
}

initWorld();
animate();
