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

function initWorld() {
    world.tank = new Tank(stage, true);
}

function animate() {
    world.tank.update();
    renderer.render(stage);
    requestAnimationFrame(animate);
}

initWorld();
animate();
