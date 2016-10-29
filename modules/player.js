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
    this.controlDir = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };
    this.needSync = false;
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
                if (player.controlDir.up != 1) {
                    player.controlDir.up = 1;
                    player.needSync = true;
                }
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                if (player.controlDir.right != 1) {
                    player.controlDir.right = 1;
                    player.needSync = true;
                }
                break;
            // 's' or 'S'
            case 83:
            case 115:
                if (player.controlDir.down != 1) {
                    player.controlDir.down = 1;
                    player.needSync = true;
                }
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                if (player.controlDir.left != 1) {
                    player.controlDir.left = 1;
                    player.needSync = true;
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
                if (player.controlDir.up !== 0) {
                    player.controlDir.up = 0;
                    player.needSync = true;
                }
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                if (player.controlDir.right !== 0) {
                    player.controlDir.right = 0;
                    player.needSync = true;
                }
                break;
            // 's' or 'S'
            case 83:
            case 115:
                if (player.controlDir.down !== 0) {
                    player.controlDir.down = 0;
                    player.needSync = true;
                }
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                if (player.controlDir.left !== 0) {
                    player.controlDir.left = 0;
                    player.needSync = true;
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
        if (player.tank !== null) {
            var dir = targetPos.subtract(new Victor(player.tank.x, player.tank.y));
            player.tank.rotation = dir.angle() + Math.PI / 2;
            // TODO: threshold
            player.needSync = true;
        }
    }, false);
};

Player.prototype.handleMouseDown = function()
{
    var player = this;
    document.body.addEventListener('mousedown', function() {
        if (player.tank !== null) {
            player.tank.revertFireStatus();
            player.needSync = true;
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

Player.prototype.resetControl = function()
{
    this.control = false;
    this.controlDir.left = 0;
    this.controlDir.right = 0;
    this.controlDir.up = 0;
    this.controlDir.down = 0;
};

Player.prototype.createTank = function()
{
    var px = (this.world.w - this.viewW) / 2;
    var py = (this.world.h - this.viewH) / 2;
    var tank = new Tank(this.world, "base", {
        x: Math.random() * px + this.viewW / 2,
        y: Math.random() * py + this.viewH / 2,
    }, this, this.world.view ? true : false);

    this.world.addUnit(tank);

    this.bindTank(tank);
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

    // self
    if (this.world.isLocal === true && this === this.world.getSelf()) {
        if (this.control === false) {
            this.addControl();
        }
    }
};

Player.prototype.update = function()
{
    if (this.needSync === true) {
        if (this.control === true) {
            var dir = Util.getVectorByControlDir(this.controlDir);
            this.world.synchronizer.syncOperation(this, dir);
        } else {
            this.world.synchronizer.syncOperation(this);
        }
        this.needSync = false;
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

