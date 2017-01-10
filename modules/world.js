(function(){ "use strict";

var Protobuf = require("protobufjs");
var SeedRandom = require("seedrandom");
var Victor = require("victor");

var Config = require("../modules/config");
var Commander = require("../modules/commander");
var Map = require("../modules/map");
var Obstacle = require("../modules/obstacle");
var Package = require("../package.json");
var Player = require("../modules/player");
var Synchronizer = require("../modules/synchronizer");
var Util = require("../modules/util");

function World(isLocal)
{
    this.frame = 0;
    this.unitBaseId = 0;
    this.cfg = new Config();

    this.w = Package.app.world.w;
    this.h = Package.app.world.h;

    // cient width & height (in view)
    this.cw = Package.app.world.cw;
    this.ch = Package.app.world.ch;

    // map
    this.map = new Map(this);

    this.spawnRegion = {};
    this.spawnRegion.x = this.w * (1.0 - Package.app.world.obstacleRegion.wRatio) / 2;
    this.spawnRegion.w = this.w * Package.app.world.obstacleRegion.wRatio;
    this.spawnRegion.y = this.h * (1.0 - Package.app.world.obstacleRegion.hRatio) / 2;
    this.spawnRegion.h = this.h * Package.app.world.obstacleRegion.hRatio;

    this.gridSize = Package.app.world.gridSize;
    this.gridW = Math.floor(this.w / this.gridSize) + 1;
    this.gridH = Math.floor(this.h / this.gridSize) + 1;
    this.grids = [];
    for (var i = 0; i < this.gridH; ++ i) {
        for (var j = 0; j < this.gridW; ++ j) {
            this.grids.push({});
        }
    }

    this.bullets = {};
    this.obstacles = {};
    this.obstacleCount = 0;
    this.tanks = {};

    // connection id <--> player
    this.players = {};
    this.playerCount = 0;
    this.rankPlayers = [];

    // frame cache
    this.unitsToAdd = [];
    this.unitsToRemove = [];

    // client or server
    this.isLocal = isLocal;

    // proto & synchronizer
    var builder;
    if (this.isLocal === true) {
        builder = Protobuf.loadJsonFile(Package.app.proto);
        this.proto = builder.build("Tank");
        this.synchronizer = new Synchronizer(this);
    } else {
        builder = Protobuf.loadJsonFile("./www/" + Package.app.proto);
        this.proto = builder.build("Tank");
        this.synchronizer = new Synchronizer(this);
    }

    // lock-step commander
    this.commander = new Commander(this);

    // random
    this.seed = Package.name;

    // start flag
    this.started = false;
    this.time = 0;
}

World.prototype = {
    constructor: World,
};

World.prototype.start = function()
{
    this.started = true;

    var dateTime = new Date();
    this.time = dateTime.getTime();

    if (this.recorder) {
        this.recorder.start();
    }

    Util.logDebug("world start");
};

World.prototype.random = function()
{
    var rng = SeedRandom(this.seed);
    var result = rng();
    this.seed = String(result);
    return result;
};

World.prototype.randomBetween = function(min, max)
{
    return Math.floor(this.random() * (max - min) + min);
};

World.prototype.addPlayer = function(connid, name)
{
    var player = new Player(this, connid, name);
    this.players[connid] = player;
    this.playerCount ++;
    Util.logDebug("frame[" + this.frame + "] add player:" + connid);
    return player;
};

World.prototype.removePlayer = function(connid)
{
    var player = this.players[connid];
    if (player) {
        delete this.players[connid];
        -- this.playerCount;
        Util.logDebug("frame[" + this.frame + "] remove player:" + connid);

        if (player.tank) {
            player.tank.player = null;
            player.tank.die();
        }
    }
};

World.prototype.dumpPlayers = function(players)
{
    for (var i in this.players) {
        players.push(this.players[i].dump());
    }
};

World.prototype.addUnit = function(unit)
{
    this.unitsToAdd.push(unit);
};

World.prototype.removeUnit = function(unit)
{
    this.unitsToRemove.push(unit);
};

World.prototype.findUnit = function(id)
{
    if (this.bullets[id]) {
        return this.bullets[id];
    } else if (this.obstacles[id]) {
        return this.obstacles[id];
    } else if (this.tanks[id]) {
        return this.tanks[id];
    } else {
        for (var i in this.unitsToAdd) {
            if (this.unitsToAdd[i].id === id) {
                return this.unitsToAdd[i];
            }
        }
    }
    return null;
};

World.prototype.checkAddUnits = function()
{
    for (var i in this.unitsToAdd) {
        var unit = this.unitsToAdd[i];
        this.updateUnitGrid(unit);

        if (unit.type == Util.unitType.bullet) {
            this.bullets[unit.id] = unit;
            Util.logDebug("frame[" + this.frame + "] add bullet:" + unit.id + " owner=" + unit.owner.id);
        }

        if (unit.type == Util.unitType.obstacle) {
            this.obstacles[unit.id] = unit;
            this.obstacleCount ++;
            Util.logDebug("frame[" + this.frame + "] add obstacle:" + unit.id + " total count=" + this.obstacleCount);
        }

        if (unit.type == Util.unitType.tank) {
            this.tanks[unit.id] = unit;
            Util.logDebug("frame[" + this.frame + "] add tank:" + unit.id);
        }
    }
    this.unitsToAdd = [];
};

World.prototype.checkRemoveUnits = function()
{
    for (var i in this.unitsToRemove) {
        var unit = this.unitsToRemove[i];
        this.removeUnitFromGrid(unit);

        if (unit.type == Util.unitType.bullet && this.bullets[unit.id]) {
            delete this.bullets[unit.id];
            Util.logDebug("frame[" + this.frame + "] remove bullet:" + unit.id);
        }

        if (unit.type == Util.unitType.obstacle && this.obstacles[unit.id]) {
            delete this.obstacles[unit.id];
            -- this.obstacleCount;
            Util.logDebug("frame[" + this.frame + "] remove obstacle:"
                + unit.id + " total count=" + this.obstacleCount);
        }

        if (unit.type == Util.unitType.tank && this.tanks[unit.id]) {
            delete this.tanks[unit.id];
            Util.logDebug("frame[" + this.frame + "] remove tank:" + unit.id);
        }
    }
    this.unitsToRemove = [];
};

World.prototype.dumpUnits = function(units)
{
    var i;
    for (i in this.obstacles) {
        units.push(this.obstacles[i].dump());
    }
    for (i in this.tanks) {
        units.push(this.tanks[i].dump());
    }
    for (i in this.bullets) {
        units.push(this.bullets[i].dump());
    }
};

World.prototype.dumpUnitsToAdd = function(units)
{
    for (var i in this.unitsToAdd) {
        units.push(this.unitsToAdd[i].dump());
    }
};

World.prototype.updatePlayers = function()
{
    this.rankPlayers = [];
    for (var i in this.players) {
        var player = this.players[i];
        player.update();
        if (player.tank) {
            this.rankPlayers.push(player);
        }
    }
    // sort
    this.rankPlayers.sort(function(p1, p2) {
        return p1.tank.exp < p2.tank.exp;
    });
};

World.prototype.updateTanks = function()
{
    for (var i in this.tanks) {
        var tank = this.tanks[i];
        tank.update();
    }
};

World.prototype.updateObstacles = function()
{
    var obstacle;

    for (var i in this.obstacles) {
        this.obstacles[i].update();
    }

    if (this.obstacleCount < Package.app.world.obstacleMaxCount) {
        var ids = [301, 301, 302, 303];
        var id = ids[Math.floor((this.random() * ids.length))];
        obstacle = new Obstacle(this, id);

        obstacle.x = this.randomBetween(this.spawnRegion.x, this.spawnRegion.x + this.spawnRegion.w);
        obstacle.y = this.randomBetween(this.spawnRegion.y, this.spawnRegion.y + this.spawnRegion.h);
        obstacle.motion.setIvAngle(this.random() * 2 * Math.PI);

        this.addUnit(obstacle);
    }
};

World.prototype.updateBullets = function()
{
    var i, bullet;
    for (i in this.bullets) {
        this.bullets[i].update();
    }
    for (i in this.bullets) {
        bullet = this.bullets[i];
        if (bullet.outOfDate() || bullet.outOfBounds()) {
            bullet.die();
        }
    }
};

World.prototype.updateUnitGrid = function(unit, oldPos)
{
    if (oldPos && oldPos.x == unit.x && oldPos.y == unit.y) {
        return;
    }

    var oidx = null;
    if (oldPos) {
        var ogx = Math.floor(oldPos.x / this.gridSize);
        var ogy = Math.floor(oldPos.y / this.gridSize);
        oidx = ogy * this.gridW + ogx;
    }

    var gx = Math.floor(unit.x / this.gridSize);
    var gy = Math.floor(unit.y / this.gridSize);
    var idx = gy * this.gridW + gx;

    if (oidx !== idx) {
        Util.logTrace("frame[" + this.frame + "] unit[" + unit.id + "] grid[" + oidx + "->" + idx + "]");
    }

    if (oidx && idx != oidx) {
        delete this.grids[oidx][unit.id];
    }
    this.grids[idx][unit.id] = unit;
};

World.prototype.removeUnitFromGrid = function(unit)
{
    var gx = Math.floor(unit.x / this.gridSize);
    var gy = Math.floor(unit.y / this.gridSize);
    var idx = gy * this.gridW + gx;
    delete this.grids[idx][unit.id];
};

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

    var i, g;
    if (y1 && x1) {
        g = this.grids[idxs[0]];
        for (i in g) { targets.push(g[i]); }
    }
    if (y1) {
        g = this.grids[idxs[1]];
        for (i in g) { targets.push(g[i]); }
    }
    if (y1 && x2) {
        g = this.grids[idxs[2]];
        for (i in g) { targets.push(g[i]); }
    }
    if (x1) {
        g = this.grids[idxs[3]];
        for (i in g) { targets.push(g[i]); }
    }
    {
        g = this.grids[idxs[4]];
        for (i in g) { targets.push(g[i]); }
    }
    if (x2) {
        g = this.grids[idxs[5]];
        for (i in g) { targets.push(g[i]); }
    }
    if (y2 && x1) {
        g = this.grids[idxs[6]];
        for (i in g) { targets.push(g[i]); }
    }
    if (y2) {
        g = this.grids[idxs[7]];
        for (i in g) { targets.push(g[i]); }
    }
    if (y2 && x2) {
        g = this.grids[idxs[8]];
        for (i in g) { targets.push(g[i]); }
    }
    return targets;
};

World.prototype.needCheckCollision = function(unit, target)
{
    var u1 = (unit.owner ? unit.owner : unit);
    var u2 = (target.owner ? target.owner : target);
    return u1 != u2;
};

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
};

World.prototype.simpleCollide = function(unit1, unit2, distRatio)
{
    var dir = new Victor(unit1.x - unit2.x, unit1.y - unit2.y);
    dir.norm();
    var v1 = unit1.motion.v;
    var v2 = unit2.motion.v;
    var spring1 = unit2.cfg.velocity.springBase + (1.0 - distRatio) * unit2.cfg.velocity.springAdd;
    var spring2 = unit1.cfg.velocity.springBase + (1.0 - distRatio) * unit1.cfg.velocity.springAdd;

    Util.logTrace(unit1.motion.toString());
    Util.logTrace(unit2.motion.toString());
    unit1.motion.ev.x += (v2 + spring1) * dir.x * unit2.m / unit1.m;
    unit1.motion.ev.y += (v2 + spring1) * dir.y * unit2.m / unit1.m;
    unit2.motion.ev.x -= (v1 + spring2) * dir.x * unit1.m / unit2.m;
    unit2.motion.ev.y -= (v1 + spring2) * dir.y * unit1.m / unit2.m;
    Util.logTrace(unit1.motion.toString());
    Util.logTrace(unit2.motion.toString());
};

World.prototype.collide = function(unit1, unit2, distRatio)
{
    Util.logDebug("frame[" + this.frame + "] "
        + "unit[" + unit1.id + "][" + unit1.x + "," + unit1.y + "] "
        + "unit[" + unit2.id + "][" + unit2.x + "," + unit2.y + "] collide");

    Util.logTrace(unit1.toString());
    Util.logTrace(unit2.toString());

    this.simpleCollide(unit1, unit2, distRatio);
    unit1.takeDamage(unit2);
    unit2.takeDamage(unit1);

    Util.logTrace(unit1.toString());
    Util.logTrace(unit2.toString());
};

World.prototype.updateCollision = function()
{
    for (var x = 0; x < this.gridW; ++ x) {
        for (var y = 0; y < this.gridH; ++ y) {

            var idx = y * this.gridW + x;
            for (var i in this.grids[idx]) {
                var unit = this.grids[idx][i];

                // avoid multi-collision
                if (unit.collideFrame) {
                    if (this.frame - unit.collideFrame < Package.app.world.unitCollideCheckIntervalFrames) {
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
                        unit.collideFrame = this.frame;
                        target.collideFrame = this.frame;
                        this.collide(unit, target, dist2 / (distR * distR));
                    }
                }
                unit.collideCheckFrame = this.frame;
            }
        }
    }
};

World.prototype.updateFrameLogic = function()
{
    if (this.started === false) {
        return;
    }

    this.frame ++;
    this.time += 1000.0 / Package.app.world.frame;

    this.commander.execute();

    this.map.update();
    this.checkRemoveUnits();
    this.checkAddUnits();
    this.updatePlayers();
    this.updateTanks();
    this.updateObstacles();
    this.updateBullets();
    this.updateCollision();
};

module.exports = World;

})();
