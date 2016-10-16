var Tank = require("../modules/tank");
var Util = require("../modules/util");

function Player(world)
{
    this.world = world;
    this.tank = null;
    this.control = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    };
}

Player.prototype = {}

Player.prototype.handleKeyDown = function()
{
    var player = this;
    document.body.addEventListener('keydown', function(e) {
        if (player.tank == null) {
            return;
        }
        switch (e.key) {
            case 'w':
            case 'W':
                player.control.up = 1;
                break;
            case 'd':
            case 'D':
                player.control.right = 1;
                break;
            case 's':
            case 'S':
                player.control.down = 1;
                break;
            case 'a':
            case 'A':
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
        switch (e.key) {
            case 'w':
            case 'W':
                player.control.up = 0;
                break;
            case 'd':
            case 'D':
                player.control.right = 0;
                break;
            case 's':
            case 'S':
                player.control.down = 0;
                break;
            case 'a':
            case 'A':
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
    this.handleKeyDown();
    this.handleKeyUp();
    this.handleMouseMove();
    this.handleMouseDown();
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
        this.tank = new Tank(this.world, "base", {
            x: Math.random() * this.world.w,
            y: Math.random() * this.world.h
        }, this);
        this.world.tanks[this.tank.id] = this.tank;
        this.resetControl();
    }
    // motion move direction
    else {
        this.tank.motion.setMoveDirByFlag(this.control.left,
            this.control.right,
            this.control.up,
            this.control.down);
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

