var Config = require("../modules/config");
var Tank = require("../modules/tank");

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
    this._frame = 0;

    var dateTime = new Date();
    this._ms = dateTime.getTime();

    this._stage = new PIXI.Container();

    // main view (camera bind)
    this._view = new PIXI.Container();
    this._view.addChild(getWorldBackground());
    this._stage.addChild(this._view);

    // UI & HUD
    this._ui = new PIXI.Container();
    this._stage.addChild(this._ui);

    this._renderer = new PIXI.CanvasRenderer(Config.world.view.w, Config.world.view.h, {
            backgroundColor: Config.world.map.color,
            antialias: true,
            autoResize: true,
        });
    document.body.appendChild(this._renderer.view);

    // world objects
    this._bullets = [];
    this._tank = new Tank(this, "normal");
}

World.prototype = {};
World.prototype.constructor = World;

World.prototype._updateCamera = function()
{
    var x = this._tank.sprite.position.x;
    var y = this._tank.sprite.position.y;
    var viewCenterX = Config.world.view.w / 2;
    var viewCenterY = Config.world.view.h / 2;
    if (x < viewCenterX) {
        x = viewCenterX;
    }
    if (x > Config.world.map.w - viewCenterX) {
        x = Config.world.map.w - viewCenterX;
    }
    if (y < viewCenterY) {
        y = viewCenterY;
    }
    if (y > Config.world.map.h - viewCenterY) {
        y = Config.world.map.h - viewCenterY;
    }
    this._view.x = viewCenterX - x;
    this._view.y = viewCenterY - y;
}

World.prototype._updateLogic = function()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();

    while (ms > this._ms + Config.world.updateMS) {

        this._ms += Config.world.updateMS;
        this._frame ++;

        if (this._tank) {
            this._tank.update();
        }

        for (var i in this._bullets) {
            var bullet = this._bullets[i];
            if (bullet.update() < 0) {
                var idx = this._view.getChildIndex(bullet.sprite);
                this._bullets.splice(i, 1);
                this._view.removeChildAt(idx);
                delete bullet;
            }
        }
    }
}

World.prototype.update = function()
{
    this._updateLogic();
    this._updateCamera();
    this._renderer.render(this._stage);
}

Object.defineProperties(World.prototype, {

    frame: {
        get: function () { return this._frame; }
    },

    view: {
        get: function() { return this._view; }
    },

    ui: {
        get: function() { return this._ui; }
    },

    bullets: {
        get: function() { return this._bullets; }
    },

    tank: {
        get: function() { return this._tank; }
    }
});

module.exports = World;

