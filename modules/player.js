(function(){ "use strict";

var Victor = require("victor");

var Control = require("../modules/control");
var Package = require("../package.json");
var Tank = require("../modules/tank");
var Util = require("../modules/util");

function initPlayerTankData(player)
{
    player.tank = null;

    player.controlForceDir = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };

    player.needSyncForce = false;
    player.lastSyncForceFrame = 0;

    player.controlRotation = 0;
    player.needSyncRotation = false;
    player.lastSyncRotationFrame = 0;
}

function Player(world, connid, name)
{
    this.world = world;
    this.name = name;
    this.connid = connid;

    initPlayerTankData(this);

    // private
    this._control = null;
}

Player.prototype = {
    constructor: Player,
};

Player.prototype.operMoveUp = function(move)
{
    if (!this.tank) {
        return;
    }
    if (move === true) {
        if (this.controlForceDir.up != 1) {
            this.controlForceDir.up = 1;
            this.needSyncForce = true;
        }
    } else {
        if (this.controlForceDir.up !== 0) {
            this.controlForceDir.up = 0;
            this.needSyncForce = true;
        }
    }
};

Player.prototype.operMoveRight = function(move)
{
    if (!this.tank) {
        return;
    }
    if (move === true) {
        if (this.controlForceDir.right != 1) {
            this.controlForceDir.right = 1;
            this.needSyncForce = true;
        }
    } else {
        if (this.controlForceDir.right !== 0) {
            this.controlForceDir.right = 0;
            this.needSyncForce = true;
        }
    }
};

Player.prototype.operMoveDown = function(move)
{
    if (!this.tank) {
        return;
    }
    if (move === true) {
        if (this.controlForceDir.down != 1) {
            this.controlForceDir.down = 1;
            this.needSyncForce = true;
        }
    } else {
        if (this.controlForceDir.down !== 0) {
            this.controlForceDir.down = 0;
            this.needSyncForce = true;
        }
    }
};

Player.prototype.operMoveLeft = function(move)
{
    if (!this.tank) {
        return;
    }
    if (move === true) {
        if (this.controlForceDir.left != 1) {
            this.controlForceDir.left = 1;
            this.needSyncForce = true;
        }
    } else {
        if (this.controlForceDir.left !== 0) {
            this.controlForceDir.left = 0;
            this.needSyncForce = true;
        }
    }
};

Player.prototype.operMove = function(x, y)
{
    if (!this.tank || ! this.world.stageWorldView) {
        return;
    }
    var targetPos = this.world.stageWorldView.getWorldPosition(x, y);
    var dir = targetPos.subtract(new Victor(this.tank.x, this.tank.y));
    var angle = dir.angle() + Math.PI / 2;
    if (Math.abs(this.controlRotation - angle) > Util.epsilon) {
        this.controlRotation = angle;
        this.needSyncRotation = true;
        this.tank.viewRotation = angle;
    }
};

Player.prototype.operFire = function()
{
    if (!this.tank) {
        return;
    }
    this.world.synchronizer.syncFire();
};

Player.prototype.addControl = function()
{
    this._control = new Control(this.world);
    this._control.handleKeyDown();
    this._control.handleKeyUp();
    this._control.handleMouseMove();
    this._control.handleMouseClick();
};

Player.prototype.createTank = function()
{
    var tank = new Tank(this.world, Package.app.world.initTank, this);

    this.bindTank(tank);

    var px = (this.world.w - this.world.cw) / 2;
    var py = (this.world.h - this.world.ch) / 2;
    tank.x = px + this.world.randomBetween(0, this.world.cw);
    tank.y = py + this.world.randomBetween(0, this.world.ch);

    this.world.addUnit(tank);

    // local player
    if (this.world.connid === this.connid && !this._control) {
        this.addControl();
    }
};

Player.prototype.bindTank = function(tank)
{
    if (this.tank === tank) {
        return;
    }

    if (this.tank === null) {
        Util.logDebug("player[" + this.connid + "] tank bind:" + tank.id);
    } else {
        Util.logDebug("player[" + this.connid + "] tank replace:" + this.tank.id + "->" + tank.id);
    }

    this.tank = tank;
    tank.player = this;
};

Player.prototype.ondie = function()
{
    Util.logDebug("player[" + this.connid + "] tank die");
    initPlayerTankData(this);
};

Player.prototype.update = function()
{
    if (!this.tank) {
        return;
    }

    if (this.world.frame - this.lastSyncRotationFrame > Package.app.world.clientSyncRotationIntervalFrames) {
        if (this.needSyncRotation === true) {
            if (Math.abs(this.controlRotation - this.tank.rotation) > Util.epsilon) {
                this.world.synchronizer.syncRotate(this.controlRotation);
            }
            this.needSyncRotation = false;
            this.lastSyncRotationFrame = this.world.frame;
        }
    }

    if (this.world.frame - this.lastSyncForceFrame > Package.app.world.clientSyncForceIntervalFrames) {
        if (this.needSyncForce === true) {
            var dir = Util.getVectorByForceDir(this.controlForceDir);
            if (dir.lengthSq() < Util.epsilon) {
                this.world.synchronizer.syncMove(0, false);
            } else {
                this.world.synchronizer.syncMove(dir.angle(), true);
            }
            this.needSyncForce = false;
            this.lastSyncForceFrame = this.world.frame;
        }
    }
};

Player.prototype.dump = function()
{
    var p = new this.world.proto.Player();
    p.connid = this.connid;
    p.name = this.name;
    if (this.tank) {
        p.id = this.tank.id;
        p.die = false;
    } else {
        p.die = true;
    }
    return p;
};

Player.prototype.load = function(p)
{
    this.name = p.name;

    // player die
    if (p.die === true) {
        if (this.tank) {
            Util.logDebug("player[" + this.connid + "] tank die");
        }
        this.tank = null;
    }
    // player tank alive
    else {
        var tank = this.world.findUnit(p.id);
        if (!tank) {
            Util.logError("tank[" + p.id + "] not found");
            return;
        }
        this.bindTank(tank);
    }
};

Object.defineProperties(Player.prototype, {
    x: {
        get: function() { return this.tank ? this.tank.x : 0; }
    },
    y: {
        get: function() { return this.tank ? this.tank.y : 0; }
    },
});

module.exports = Player;

})();

