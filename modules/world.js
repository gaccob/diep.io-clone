var Config = require("../modules/config");
var Tank = require("../modules/tank");
var Util = require("../modules/util");

function getWorldBackground()
{
    var cfg = Config.world;
    var graphics = new PIXI.Graphics();

    // background walkable region
    graphics.beginFill(cfg.walkable.color);
    graphics.drawRect(cfg.walkable.x, cfg.walkable.y,
        cfg.walkable.w, cfg.walkable.h);
    graphics.endFill();

    // background grids
    graphics.lineStyle(cfg.grid.edge, cfg.grid.color);
    for (var x = cfg.grid.size; x < cfg.map.w; x += cfg.grid.size) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, cfg.map.h);
    }
    for (var y = cfg.grid.size; y < cfg.map.h; y += cfg.grid.size) {
        graphics.moveTo(0, y);
        graphics.lineTo(cfg.map.w, y);
    }

    return graphics;
}

function World()
{
    this.frame = 0;

    var dateTime = new Date();
    this.time = dateTime.getTime();

    this.stage = new PIXI.Container();

    // main view (camera bind)
    this.view = new PIXI.Container();
    this.view.addChild(getWorldBackground());
    this.stage.addChild(this.view);

    // UI & HUD
    this.ui = new PIXI.Container();
    this.stage.addChild(this.ui);

    this.renderer = new PIXI.CanvasRenderer(Config.world.view.w, Config.world.view.h, {
            backgroundColor: Config.world.map.color,
            antialias: true,
            autoResize: true,
        });
    document.body.appendChild(this.renderer.view);

    // world objects
    this.bullets = [];
    this.tank = new Tank(this, "normal");

    // die sprites
    this.dieSprites = [];
}

World.prototype = {};
World.prototype.constructor = World;

World.prototype.updateCamera = function()
{
    var x = this.tank.sprite.position.x;
    var y = this.tank.sprite.position.y;
    var viewCenterX = Config.world.view.w / 2;
    var viewCenterY = Config.world.view.h / 2;
    x = Util.clamp(x, viewCenterX, Config.world.map.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, Config.world.map.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
}

World.prototype.updateLogic = function()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();

    while (ms > this.time + Config.world.updateMS) {

        this.time += Config.world.updateMS;
        this.frame ++;

        if (this.tank) {
            this.tank.update();
        }

        for (var i in this.bullets) {
            var bullet = this.bullets[i];
            if (bullet.update() < 0) {
                this.bullets.splice(i, 1);
                this.dieSprites.push(bullet.sprite);
                delete bullet;
            }
        }

        var cfg = Config.dieAnimation;
        for (var i in this.dieSprites) {
            var sprite = this.dieSprites[i];
            if (sprite.alpha > cfg.alphaStart) {
                sprite.alpha = cfg.alphaStart;
            } else {
                sprite.alpha -= cfg.alphaDecrease;;
            }
            sprite.scale.x += cfg.scaleIncrease;
            sprite.scale.y += cfg.scaleIncrease;
            if (sprite.alpha < cfg.alphaEnd) {
                var idx = this.view.getChildIndex(sprite);
                this.view.removeChildAt(idx);
                this.dieSprites.splice(i, 1);
                delete sprite;
            }
        }
    }
}

World.prototype.update = function()
{
    this.updateLogic();
    this.updateCamera();
    this.renderer.render(this.stage);
}

module.exports = World;

