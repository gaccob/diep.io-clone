(function(){ "use strict";

var Victor = require("victor");

var Tank = require("../modules/tank");
var Util = require("../modules/util");

function Player(world, connid, name, viewW, viewH)
{
    this.world = world;
    this.name = name;
    this.tank = null;
    this.connid = connid;
    this.viewW = viewW;
    this.viewH = viewH;

    this.control = false;

    this.controlForceDir = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };
    this.needSyncForce = false;

    this.controlRotation = 0;
    this.needSyncRotation = false;
}

Player.prototype = {
    constructor: Player,
};

Player.prototype.handleKeyDown = function()
{
    var player = this;
    document.body.addEventListener('keydown', function(e) {
        if (player.tank === null) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                if (player.controlForceDir.up != 1) {
                    player.controlForceDir.up = 1;
                    player.needSyncForce = true;
                }
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                if (player.controlForceDir.right != 1) {
                    player.controlForceDir.right = 1;
                    player.needSyncForce = true;
                }
                break;
            // 's' or 'S'
            case 83:
            case 115:
                if (player.controlForceDir.down != 1) {
                    player.controlForceDir.down = 1;
                    player.needSyncForce = true;
                }
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                if (player.controlForceDir.left != 1) {
                    player.controlForceDir.left = 1;
                    player.needSyncForce = true;
                }
                break;
        }
    }, false);
};

Player.prototype.handleKeyUp = function()
{
    var player = this;
    document.body.addEventListener('keyup', function(e) {
        if (player.tank === null) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                if (player.controlForceDir.up !== 0) {
                    player.controlForceDir.up = 0;
                    player.needSyncForce = true;
                }
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                if (player.controlForceDir.right !== 0) {
                    player.controlForceDir.right = 0;
                    player.needSyncForce = true;
                }
                break;
            // 's' or 'S'
            case 83:
            case 115:
                if (player.controlForceDir.down !== 0) {
                    player.controlForceDir.down = 0;
                    player.needSyncForce = true;
                }
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                if (player.controlForceDir.left !== 0) {
                    player.controlForceDir.left = 0;
                    player.needSyncForce = true;
                }
                break;
        }
    }, false);
};

Player.prototype.handleMouseMove = function()
{
    var player = this;
    document.body.addEventListener('mousemove', function(e) {
        var targetPos = new Victor(e.offsetX - player.world.view.x, e.offsetY - player.world.view.y);
        if (!player.tank) {
            return;
        }
        var dir = targetPos.subtract(new Victor(player.tank.x, player.tank.y));
        var angle = dir.angle() + Math.PI / 2;
        if (Math.abs(player.controlRotation - angle) > Util.epsilon) {
            player.controlRotation = angle;
            player.needSyncRotation = true;
        }
    }, false);
};

Player.prototype.handleMouseDown = function()
{
    var player = this;
    document.body.addEventListener('mousedown', function() {
        if (player.tank !== null) {
            player.world.synchronizer.syncFire();
        }
    }, false);
};

Player.prototype.addControl = function()
{
    this.control = true;
    this.handleKeyDown();
    this.handleKeyUp();
    this.handleMouseMove();
    this.handleMouseDown();
};

Player.prototype.resetControlDir = function()
{
    this.controlForceDir.left = 0;
    this.controlForceDir.right = 0;
    this.controlForceDir.up = 0;
    this.controlForceDir.down = 0;
};

Player.prototype.createTank = function()
{
    var tank = new Tank(this.world, "base", this);

    this.bindTank(tank);

    var px = (this.world.w - this.viewW) / 2;
    var py = (this.world.h - this.viewH) / 2;
    tank.x = this.world.randomBetween(0, px) + this.viewW / 2;
    tank.y = this.world.randomBetween(0, py) + this.viewH / 2;

    this.world.addUnit(tank);

    if (this.world.connid === this.connid && this.control === false) {
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

    // name
    this.tank.addNameBar(this.name);
};

Player.prototype.update = function()
{
    if (this.needSyncRotation === true) {
        if (Math.abs(this.controlRotation - this.tank.rotation) > Util.epsilon) {
            this.world.synchronizer.syncRotate(this.controlRotation);
        }
        this.needSyncRotation = false;
    }

    if (this.needSyncForce === true) {
        var dir = Util.getVectorByForceDir(this.controlForceDir);
        if (dir.lengthSq() < Util.epsilon) {
            this.world.synchronizer.syncMove(0, false);
        } else {
            this.world.synchronizer.syncMove(dir.angle(), true);
        }
        this.needSyncForce = false;
    }
};

Player.prototype.dump = function()
{
    var p = new this.world.proto.Player();
    p.connid = this.connid;
    p.name = this.name;
    p.vw = this.viewW;
    p.vh = this.viewH;
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
    this.viewW = p.vw;
    this.viewH = p.vH;

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

