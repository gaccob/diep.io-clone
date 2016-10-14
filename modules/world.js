var Config = require("../modules/config");
var Obstacle = require("../modules/obstacle");
var Player = require("../modules/player")
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
    this.bullets = {};
    this.obstacles = [];
    this.obstacleCount = 0;
    this.tanks = [];
    var idx = 0;
    for (var i in Config.tanks) {
        var tank = new Tank(this, i, { x: this.w / 2 + idx * 200, y: this.h / 2 + idx * 200, });
        this.tanks.push(tank);
        ++ idx;
    }

    // player
    this.player = new Player(this, this.tanks[0]);
    this.player.addControl();

    // die sprites
    this.dieSprites = [];
    this.removeUnits = [];
}

World.prototype = {};
World.prototype.constructor = World;

World.prototype.updateCamera = function()
{
    var x = this.player.x;
    var y = this.player.y;
    var viewCenterX = Config.world.view.w / 2;
    var viewCenterY = Config.world.view.h / 2;
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
    if (this.obstacleCount < Config.obstacles.count) {
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

World.prototype.collide = function(unit1, unit2)
{
    // Elastic collision
    // m1, v10
    // m2, v20
    // v1 = [(m1-m2)v10 + 2m2v20] / (m1+m2)
    // v2 = [(m2-m1)v20 + 2m1v10] / (m1+m2)

    // console.log("frame[" + this.frame + "]");
    // console.log("unit1: ev{" + unit1.motion.ev.x + "," + unit1.motion.ev.y + "}");
    // console.log("unit1: iv{" + unit1.motion.iv.x + "," + unit1.motion.iv.y + "}");
    // console.log("unit2: ev{" + unit2.motion.ev.x + "," + unit2.motion.ev.y + "}");
    // console.log("unit2: iv{" + unit2.motion.iv.x + "," + unit2.motion.iv.y + "}");

    var m1 = unit1.radius * unit1.radius;
    var m2 = unit2.radius * unit2.radius;
    var v10 = new Victor(unit1.motion.vx, unit1.motion.vy);
    var v20 = new Victor(unit2.motion.vx, unit2.motion.vy);

    var v1x = ((m1 - m2) * v10.x + 2 * m2 * v20.x) / (m1 + m2);
    var v1y = ((m1 - m2) * v10.y + 2 * m2 * v20.y) / (m1 + m2);
    unit1.motion.ev.x += v1x;
    unit1.motion.ev.y += v1y;

    var v2x = ((m2 - m1) * v20.x + 2 * m1 * v10.x) / (m1 + m2);
    var v2y = ((m2 - m1) * v20.y + 2 * m1 * v10.y) / (m1 + m2);
    unit2.motion.ev.x += v2x;
    unit2.motion.ev.y += v2y;

    // console.log("unit1: ev{" + unit1.motion.ev.x + "," + unit1.motion.ev.y + "}");
    // console.log("unit1: iv{" + unit1.motion.iv.x + "," + unit1.motion.iv.y + "}");
    // console.log("unit2: ev{" + unit2.motion.ev.x + "," + unit2.motion.ev.y + "}");
    // console.log("unit2: iv{" + unit2.motion.iv.x + "," + unit2.motion.iv.y + "}");

    // damage each other
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
                    if (this.time - unit.collideTime < Config.world.unitCollideCheckMS) {
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
                        unit.collideTime = this.time;
                        target.collideTime = this.time;
                        this.collide(unit, target);
                        // console.log("frame=" + this.frame + " collision: " + unit.id + "--" + target.id);
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
    this.updateCamera();
    this.renderer.render(this.stage);
}

module.exports = World;

