var Config = require("../modules/config");
var Obstacle = require("../modules/obstacle");
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
    graphics.lineStyle(cfg.view.grid.edge, cfg.view.grid.color);
    for (var x = cfg.view.grid.size; x < cfg.map.w; x += cfg.view.grid.size) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, cfg.map.h);
    }
    for (var y = cfg.view.grid.size; y < cfg.map.h; y += cfg.view.grid.size) {
        graphics.moveTo(0, y);
        graphics.lineTo(cfg.map.w, y);
    }

    return graphics;
}

function World()
{
    this.frame = 0;

    this.w = Config.world.map.w;
    this.h = Config.world.map.h;

    this.gridSize = Config.world.map.grid.size;
    this.gridW = this.w / this.gridSize;
    this.gridH = this.h / this.gridSize;
    this.grids = [];
    for (var i = 0; i < this.gridH; ++ i) {
        for (var j = 0; j < this.gridW; ++ j) {
            this.grids.push({});
        }
    }

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
    this.obstacles = [];
    this.tank = new Tank(this, "normal", {
        x: Config.world.map.w / 2,
        y: Config.world.map.h / 2,
    });

    // die sprites
    this.dieSprites = [];
}

World.prototype = {};
World.prototype.constructor = World;

World.prototype.updateCamera = function()
{
    var x = this.tank.x;
    var y = this.tank.y;
    var viewCenterX = Config.world.view.w / 2;
    var viewCenterY = Config.world.view.h / 2;
    x = Util.clamp(x, viewCenterX, Config.world.map.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, Config.world.map.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
}

World.prototype.updateTanks = function()
{
    var oldx = this.tank.x;
    var oldy = this.tank.y;
    this.tank.update();
    this.updateUnitGrid(this.tank, { x: oldx, y: oldy });
}

World.prototype.updatePlayers = function()
{
    // TODO:
}

World.prototype.updateObstacles = function()
{
    if (this.obstacles.length < Config.obstacles.count) {
        var cfgs = [
            Config.obstacles.small,
            Config.obstacles.middle,
            Config.obstacles.large
        ];
        var cfg = cfgs[Math.floor((Math.random() * cfgs.length))];
        var wcfg = Config.world.walkable;
        var obstacle = new Obstacle(this, cfg, {
            x: Util.randomBetween(wcfg.x, wcfg.x + wcfg.w),
            y: Util.randomBetween(wcfg.y, wcfg.y + wcfg.h),
        });
        this.obstacles.push(obstacle);
    }

    for (var i in this.obstacles) {
        var obstacle = this.obstacles[i];
        var oldx = obstacle.x;
        var oldy = obstacle.y;
        obstacle.update();
        this.updateUnitGrid(obstacle, { x: oldx, y: oldy });
    }
}

World.prototype.updateBullets = function()
{
    for (var i in this.bullets) {
        var bullet = this.bullets[i];
        if (bullet.outOfDate() || bullet.outOfBounds()) {
            this.bullets.splice(i, 1);
            this.dieSprites.push(bullet.sprite);
            this.removeUnitFromGrid(bullet);
            delete bullet;
        } else {
            var oldx = bullet.x;
            var oldy = bullet.y;
            bullet.update();
            this.updateUnitGrid(bullet, { x: oldx, y: oldy });
        }
    }
}

World.prototype.updateDieAnimations = function()
{
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

World.prototype.updateLogic = function()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();
    while (ms > this.time + Config.world.updateMS) {
        this.time += Config.world.updateMS;
        this.frame ++;
        this.updateTanks();
        this.updatePlayers();
        this.updateObstacles();
        this.updateBullets();
        this.updateDieAnimations();
    }
}

World.prototype.updateUnitGrid = function(unit, oldPos)
{
    if (oldPos.x == unit.x && oldPos.y == unit.y) {
        return;
    }

    var ogx = Math.floor(oldPos.x / this.gridSize);
    var ogy = Math.floor(oldPos.y / this.gridSize);
    var oidx = ogy * this.gridW + ogx;

    var gx = Math.floor(unit.x / this.gridSize);
    var gy = Math.floor(unit.y / this.gridSize);
    var idx = gy * this.gridW + gx;

    if (idx != oidx) {
        delete this.grids[oidx][unit.id];
        // console.log("unit[" + unit.id + "] grid[" + oidx + "->" + idx + "]");
    }
    this.grids[idx][unit.id] = unit;
}

World.prototype.removeUnitFromGrid = function(unit)
{
    var gx = Math.floor(unit.x / this.gridSize);
    var gy = Math.floor(unit.y / this.gridSize);
    var idx = gy * this.gridW + gx;
    delete this.grids[idx][unit.id];
}

World.prototype.update = function()
{
    this.updateLogic();
    this.updateCamera();
    this.renderer.render(this.stage);
}

module.exports = World;

