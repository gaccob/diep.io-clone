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
    this.control = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };
    this.needSync = false;
}

Player.prototype = {
    constructor: Player,
}

Player.prototype.handleKeyDown = function()
{
    var player = this;
    document.body.addEventListener('keydown', function(e) {
        if (player.tank == null) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                player.control.up = 1;
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                player.control.right = 1;
                break;
            // 's' or 'S'
            case 83:
            case 115:
                player.control.down = 1;
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                player.control.left = 1;
                break;
        }
    }, false);
}

Player.prototype.handleKeyUp = function()
{
    var player = this;
    document.body.addEventListener('keyup', function(e) {
        if (player.tank == null) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                player.control.up = 0;
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                player.control.right = 0;
                break;
            // 's' or 'S'
            case 83:
            case 115:
                player.control.down = 0;
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                player.control.left = 0;
                break;
        }
    }, false);
}

Player.prototype.handleMouseMove = function()
{
    var player = this;
    document.body.addEventListener('mousemove', function(e) {
        var targetPos = new Victor(e.offsetX - player.world.view.x, e.offsetY - player.world.view.y);
        if (player.tank != null) {
            var dir = targetPos.subtract(new Victor(player.tank.x, player.tank.y));
            player.tank.rotation = dir.angle() + Math.PI / 2;
            // TODO: threshold
            this.needSync = true;
        }
    }, false);
}

Player.prototype.handleMouseDown = function()
{
    var player = this;
    document.body.addEventListener('mousedown', function(e) {
        if (player.tank != null) {
            player.tank.revertFireStatus();
            this.needSync = true;
        }
    }, false);
}

Player.prototype.addControl = function()
{
    if (this.world.view) {
        this.handleKeyDown();
        this.handleKeyUp();
        this.handleMouseMove();
        this.handleMouseDown();
    }
}

Player.prototype.resetControl = function()
{
    this.control.left = 0;
    this.control.right = 0;
    this.control.up = 0;
    this.control.down = 0;
}

Player.prototype.createTank = function()
{
    var px = (this.world.w - this.viewW) / 2;
    var py = (this.world.h - this.viewH) / 2;
    this.tank = new Tank(this.world, "base", {
        x: Math.random() * px + this.viewW / 2,
        y: Math.random() * py + this.viewH / 2,
    }, this, this.world.view ? true : false);
    this.tank.player = this;
    this.resetControl();
    this.world.addUnit(this.tank);
}

Player.prototype.bindTank = function(tank)
{
    this.tank = tank;
    tank.player = this;
    this.resetControl();
}

Player.prototype.update = function()
{
    if (this.tank) {
        var dir = this.tank.motion.moveDir.clone();
        this.tank.motion.setMoveDirByFlag(this.control.left,
            this.control.right,
            this.control.up,
            this.control.down);
        if (dir.x != this.tank.motion.moveDir.x || dir.y != this.tank.motion.moveDir.y) {
            this.needSync = true;
        }
    }

    if (this.needSync === true) {
        this.world.synchronizer.syncOperation(this);
        this.needSync = false;
    }
}

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
}

Object.defineProperties(Player.prototype, {
    x: {
        get: function() { return this.tank ? this.tank.x : 0; }
    },
    y: {
        get: function() { return this.tank ? this.tank.y : 0; }
    },
});

module.exports = Player;

