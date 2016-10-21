var Tank = require("../modules/tank");
var Util = require("../modules/util");

function Player(world, viewW, viewH, connid)
{
    this.world = world;
    this.connid = connid;
    this.tank = null;
    this.viewW = viewW;
    this.viewH = viewH;
    this.control = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };
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
        }
    }, false);
}

Player.prototype.handleMouseDown = function()
{
    var player = this;
    document.body.addEventListener('mousedown', function(e) {
        if (player.tank != null) {
            player.tank.revertFireStatus();
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

Player.prototype.update = function()
{
    if (!this.tank) {
        var px = (this.world.w - this.viewW) / 2;
        var py = (this.world.h - this.viewH) / 2;
        this.tank = new Tank(this.world, "base", {
            x: Math.random() * px + this.viewW / 2,
            y: Math.random() * py + this.viewH / 2,
        }, this, this.world.view ? true : false);
        this.world.tanks[this.tank.id] = this.tank;
        this.resetControl();
    }
    else {
        this.tank.motion.setMoveDirByFlag(this.control.left,
            this.control.right,
            this.control.up,
            this.control.down);

        this.tank.update();
    }
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

