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

World.prototype.getUnitsIn9Grids = function(x, y)
{
    var targets = [];
    var idxs = [
        (y - 1) * this.gridW + x - 1,
        (y - 1) * this.gridW + x,
        (y - 1) * this.gridW + x + 1,
        y * this.gridW + x - 1,
        y * this.gridW + x,
        y * this.gridW + x + 1,
        (y + 1) * this.gridW + x - 1,
        (y + 1) * this.gridW + x,
        (y + 1) * this.gridW + x + 1,
    ];

    var x1 = (x >= 1);
    var x2 = (x < this.gridW - 1);

    var y1 = (y >= 1);
    var y2 = (y < this.gridH - 1);

    if (y1 && x1) {
        var g = this.grids[idxs[0]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y1) {
        var g = this.grids[idxs[1]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y1 && x2) {
        var g = this.grids[idxs[2]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (x1) {
        var g = this.grids[idxs[3]];
        for (var i in g) { targets.push(g[i]); }
    }
    {
        var g = this.grids[idxs[4]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (x2) {
        var g = this.grids[idxs[5]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2 && x1) {
        var g = this.grids[idxs[6]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2) {
        var g = this.grids[idxs[7]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2 && x2) {
        var g = this.grids[idxs[8]];
        for (var i in g) { targets.push(g[i]); }
    }
    return targets;
}

World.prototype.needCheckCollision = function(unit, target)
{
    var u1 = (unit.owner == null ? unit : unit.owner);
    var u2 = (target.owner == null ? target : target.owner);
    return u1 != u2;
}

World.prototype.updateCollision = function()
{
    for (var x = 0; x < this.gridW; ++ x) {
        for (var y = 0; y < this.gridH; ++ y) {
            var idx = y * this.gridW + x;
            for (var i in this.grids[idx]) {
                var unit = this.grids[idx][i];
                var targets = this.getUnitsIn9Grids(x, y);
                for (var j in targets) {
                    var target = targets[j];
                    if (this.needCheckCollision(unit, target) == false) {
                        continue;
                    }
                    if (target.collideCheckFrame == this.frame) {
                        continue;
                    }
                    var distX = unit.x - target.x;
                    var distY = unit.y - target.y;
                    var distR = unit.radius + target.radius;
                    if (distX * distX + distY * distY < distR * distR) {
                        // TODO: collision
                        console.log("frame[" + this.frame + "] collistion: unit[" + unit.id + "] vs unit[" + target.id + "]");
                    }
                }
                unit.collideCheckFrame = this.frame;
            }
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
        this.updateCollision();
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

