var Config = require("../modules/config");
var Obstacle = require("../modules/obstacle");
var Player = require("../modules/player")
var Synchronizer = require("../modules/synchronizer");
var Tank = require("../modules/tank");
var Util = require("../modules/util");

function getWorldBackground(world)
{
    var cfg = world.cfg.configMap;
    var graphics = new PIXI.Graphics();

    // background spawn region
    graphics.beginFill(cfg.obstacleRegion.color);
    graphics.drawRect(world.spawnRegion.x, world.spawnRegion.y,
        world.spawnRegion.w, world.spawnRegion.h);
    graphics.endFill();

    // background grids
    graphics.lineStyle(cfg.view.grid.edge, cfg.view.grid.color);
    for (var x = cfg.view.grid.size; x < world.w; x += cfg.view.grid.size) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, world.h);
    }
    for (var y = cfg.view.grid.size; y < world.h; y += cfg.view.grid.size) {
        graphics.moveTo(0, y);
        graphics.lineTo(world.w, y);
    }

    return graphics;
}

function World(view)
{
    this.frame = 0;
    this.cfg = new Config();

    this.w = this.cfg.configMap.w;
    this.h = this.cfg.configMap.h;

    this.spawnRegion = {}
    this.spawnRegion.x = this.w * (1.0 - this.cfg.configMap.obstacleRegion.wRatio) / 2;
    this.spawnRegion.w = this.w * this.cfg.configMap.obstacleRegion.wRatio;
    this.spawnRegion.y = this.h * (1.0 - this.cfg.configMap.obstacleRegion.hRatio) / 2;
    this.spawnRegion.h = this.h * this.cfg.configMap.obstacleRegion.hRatio;

    this.gridSize = this.cfg.configWorld.gridSize;
    this.gridW = Math.floor(this.w / this.gridSize) + 1;
    this.gridH = Math.floor(this.h / this.gridSize) + 1;
    this.grids = [];
    for (var i = 0; i < this.gridH; ++ i) {
        for (var j = 0; j < this.gridW; ++ j) {
            this.grids.push({});
        }
    }

    var dateTime = new Date();
    this.time = dateTime.getTime();

    if (view === true) {
        this.stage = new PIXI.Container();

        this.view = new PIXI.Container();
        this.view.addChild(getWorldBackground(this));
        this.stage.addChild(this.view);

        this.ui = new PIXI.Container();
        this.stage.addChild(this.ui);

        this.viewW = document.documentElement.clientWidth;
        this.viewH = document.documentElement.clientHeight - 10;
        this.renderer = new PIXI.CanvasRenderer(
            this.viewW, this.viewH, {
                backgroundColor: Number(this.cfg.configMap.color),
                antialias: true,
                autoResize: true,
            });
        document.body.appendChild(this.renderer.view);
    }

    this.bullets = {};
    this.obstacles = {};
    this.obstacleCount = 0;
    this.tanks = {};
    var idx = 0;
    for (var i in this.cfg.configTanks) {
        var tank = new Tank(this, i, {
            x: this.w / 2 + idx * 200,
            y: this.h / 2 + idx * 200,
        }, null, this.view ? true : false);
        tank.autoFire = true;
        this.tanks[tank.id] = tank;
        ++ idx;
    }

    this.player = new Player(this);
    if (view === true) {
        this.player.addControl();
    }

    this.dieSprites = [];

    this.removeUnits = [];

    this.gameend = false;

    this.synchronizer = new Synchronizer(this);
    if (view === true) {
        this.synchronizer.registProtocol("./tank.proto.json");
    } else {
        this.synchronizer.registProtocol("../proto/tank.proto.json");
    }
}

World.prototype = {
    constructor: World,
};

World.prototype.updateCamera = function()
{
    if (this.view == null) {
        return;
    }

    var x = this.player.x;
    var y = this.player.y;
    var viewCenterX = this.viewW / 2;
    var viewCenterY = this.viewH / 2;
    x = Util.clamp(x, viewCenterX, this.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, this.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
}

World.prototype.updateTanks = function()
{
    for (var i in this.tanks) {
        var tank = this.tanks[i];
        var oldx = tank.x;
        var oldy = tank.y;
        tank.update();
        this.updateUnitGrid(tank, { x: oldx, y: oldy });
    }
}

World.prototype.updatePlayers = function()
{
    this.player.update();
}

World.prototype.updateObstacles = function()
{
    if (this.obstacleCount < this.cfg.configWorld.maxObstaclesCount) {
        var names = ["triangle", "quad", "pentagon"];
        var name = names[Math.floor((Math.random() * names.length))];
        var obstacle = new Obstacle(this, name, {
            x: Util.randomBetween(this.spawnRegion.x, this.spawnRegion.x + this.spawnRegion.w),
            y: Util.randomBetween(this.spawnRegion.y, this.spawnRegion.y + this.spawnRegion.h),
        }, this.view ? true : false);
        this.obstacles[obstacle.id] = obstacle;
        this.obstacleCount ++;
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
            bullet.die();
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

World.prototype.elasticCollide = function(unit1, unit2)
{
    // Elastic collision
    // m1, v10
    // m2, v20
    // v1 = [(m1-m2)v10 + 2m2v20] / (m1+m2)
    // v2 = [(m2-m1)v20 + 2m1v10] / (m1+m2)

    var v10 = new Victor(unit1.motion.vx, unit1.motion.vy);
    var v20 = new Victor(unit2.motion.vx, unit2.motion.vy);

    var v1x = ((unit1.m - unit2.m) * v10.x + 2 * unit2.m * v20.x) / (unit1.m + unit2.m);
    var v1y = ((unit1.m - unit2.m) * v10.y + 2 * unit2.m * v20.y) / (unit1.m + unit2.m);
    unit1.motion.ev.x += v1x;
    unit1.motion.ev.y += v1y;

    var v2x = ((unit2.m - unit1.m) * v20.x + 2 * unit1.m * v10.x) / (unit1.m + unit2.m);
    var v2y = ((unit2.m - unit1.m) * v20.y + 2 * unit1.m * v10.y) / (unit1.m + unit2.m);
    unit2.motion.ev.x += v2x;
    unit2.motion.ev.y += v2y;
}

World.prototype.simpleCollide = function(unit1, unit2, distRatio)
{
    var dir = new Victor(unit1.x - unit2.x, unit1.y - unit2.y);
    dir.norm();
    var v1 = unit1.motion.v;
    var v2 = unit2.motion.v;
    var spring1 = unit2.cfg.velocity.springBase + (1.0 - distRatio) * unit2.cfg.velocity.springAdd;
    var spring2 = unit1.cfg.velocity.springBase + (1.0 - distRatio) * unit1.cfg.velocity.springAdd;
    // console.log(unit1.motion.toString());
    // console.log(unit2.motion.toString());
    unit1.motion.ev.x += (v2 + spring1) * dir.x * unit2.m / unit1.m;
    unit1.motion.ev.y += (v2 + spring1) * dir.y * unit2.m / unit1.m;
    unit2.motion.ev.x -= (v1 + spring2) * dir.x * unit1.m / unit2.m;
    unit2.motion.ev.y -= (v1 + spring2) * dir.y * unit1.m / unit2.m;
    // console.log(unit1.motion.toString());
    // console.log(unit2.motion.toString());
}

World.prototype.collide = function(unit1, unit2, distRatio)
{
    this.simpleCollide(unit1, unit2, distRatio);
    unit1.takeDamageByUnit(unit2);
    unit2.takeDamageByUnit(unit1);
}

World.prototype.updateCollision = function()
{
    for (var x = 0; x < this.gridW; ++ x) {
        for (var y = 0; y < this.gridH; ++ y) {

            var idx = y * this.gridW + x;
            for (var i in this.grids[idx]) {
                var unit = this.grids[idx][i];

                // avoid multi-collision
                if (unit.collideTime != null) {
                    if (this.time - unit.collideTime < this.cfg.configWorld.unitCollideCheckMS) {
                        continue;
                    }
                }

                // check collision with targets
                var targets = this.getUnitsIn9Grids(x, y);
                for (var j in targets) {
                    var target = targets[j];
                    if (unit == target) {
                        continue;
                    }
                    if (this.needCheckCollision(unit, target) === false) {
                        continue;
                    }
                    if (target.collideCheckFrame == this.frame) {
                        continue;
                    }
                    var distX = unit.x - target.x;
                    var distY = unit.y - target.y;
                    var distR = unit.radius + target.radius;
                    var dist2 = distX * distX + distY * distY;
                    if (dist2 < distR * distR) {
                        unit.collideTime = this.time;
                        target.collideTime = this.time;
                        this.collide(unit, target, dist2 / (distR * distR));
                    }
                }
                unit.collideCheckFrame = this.frame;
            }
        }
    }
}

World.prototype.updateDieAnimations = function()
{
    if (this.view == null) {
        return;
    }

    var cfg = this.cfg.configDieAnimation.base;
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
            if (sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            this.dieSprites.splice(i, 1);
            delete sprite;
        }
    }
}

World.prototype.updateLogic = function()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();
    var updateMS = 1000.0 / this.cfg.configWorld.frame;
    while (ms > this.time + updateMS) {
        this.time += updateMS;
        this.frame ++;
        this.updatePlayers();
        this.updateTanks();
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

World.prototype.addUnitToGrid = function(unit)
{
    var gx = Math.floor(unit.x / this.gridSize);
    var gy = Math.floor(unit.y / this.gridSize);
    var idx = gy * this.gridW + gx;
    this.grids[idx][unit.id] = unit;
}

World.prototype.update = function()
{
    this.updateLogic();

    if (this.view) {
        this.updateCamera();
        this.renderer.render(this.stage);
    }
}

module.exports = World;

