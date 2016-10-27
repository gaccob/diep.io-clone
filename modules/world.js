(function(){ "use strict";

var Config = require("../modules/config");
var Player = require("../modules/player");
var Util = require("../modules/util");

function World()
{
    this.frame = 0;
    this.cfg = new Config();

    this.w = this.cfg.configMap.w;
    this.h = this.cfg.configMap.h;

    this.spawnRegion = {};
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

    this.bullets = {};
    this.obstacles = {};
    this.obstacleCount = 0;
    this.tanks = {};

    // connection id <--> player
    this.players = {};
    this.playerCount = 0;

    // frame cache
    this.unitsToAdd = [];
    this.unitsToRemove = [];
}

World.prototype = {
    constructor: World,
};

World.prototype.addPlayer = function(connid, name, viewW, viewH)
{
    var player = new Player(this, connid, name, viewW, viewH);
    this.players[connid] = player;
    this.playerCount ++;
    console.log("add player:" + connid);
    return player;
};

World.prototype.removePlayer = function(connid)
{
    var player = this.players[connid];
    if (player) {
        delete this.players[connid];
        -- this.playerCount;
        console.log("remove player:" + connid);

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
            console.log("add bullet:" + unit.id);
        }

        if (unit.type == Util.unitType.obstacle) {
            this.obstacles[unit.id] = unit;
            this.obstacleCount ++;
            console.log("add obstacle:" + unit.id);
        }

        if (unit.type == Util.unitType.tank) {
            this.tanks[unit.id] = unit;
            console.log("add tank:" + unit.id);
        }
    }
    this.unitsToAdd = [];
};

World.prototype.checkRemoveUnits = function()
{
    for (var i in this.unitsToRemove) {
        var unit = this.unitsToRemove[i];
        this.removeUnitFromGrid(unit);

        if (unit.type == Util.unitType.bullet) {
            delete this.bullets[unit.id];
            console.log("remove bullet:" + unit.id);
        }

        if (unit.type == Util.unitType.obstacle) {
            delete this.obstacles[unit.id];
            -- this.obstacleCount;
            console.log("remove obstacle:" + unit.id);
        }

        if (unit.type == Util.unitType.tank) {
            delete this.tanks[unit.id];
            console.log("remove tank:" + unit.id);
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
    for (i in this.unitsToAdd) {
        units.push(this.unitsToAdd[i].dump());
    }
};

World.prototype.updatePlayers = function()
{
    for (var i in this.players) {
        var player = this.players[i];
        player.update();
    }
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
    for (var i in this.obstacles) {
        var obstacle = this.obstacles[i];
        var oldx = obstacle.x;
        var oldy = obstacle.y;
        obstacle.update();
        this.updateUnitGrid(obstacle, { x: oldx, y: oldy });
    }
};

World.prototype.updateBullets = function()
{
    for (var i in this.bullets) {
        var bullet = this.bullets[i];
        var oldx = bullet.x;
        var oldy = bullet.y;
        bullet.update();
        this.updateUnitGrid(bullet, { x: oldx, y: oldy });
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

World.prototype.updateLogic = function()
{
    this.checkRemoveUnits();
    this.checkAddUnits();
    this.updatePlayers();
    this.updateTanks();
    this.updateObstacles();
    this.updateBullets();
};

World.prototype.update = function()
{
    var dateTime = new Date();
    var ms = dateTime.getTime();
    var updateMS = 1000.0 / this.cfg.configWorld.frame;
    while (ms > this.time + updateMS) {
        this.time += updateMS;
        this.frame ++;
        this.updateLogic();
    }
};

module.exports = World;

})();
