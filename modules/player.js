var Tank = require("../modules/tank");
var Util = require("../modules/util");

function Player(world)
{
    this.world = world;
    this.tank = null;
}

Player.prototype = {}

function handleKeyDown(player)
{
    document.body.addEventListener('keydown', function(e) {
        if (player.tank == null) {
            return;
        }
        switch (e.key) {
            case 'w':
            case 'W':
                player.tank.motion.moveDir.y -= 1;
                if (player.tank.motion.moveDir.y < -1) {
                    player.tank.motion.moveDir.y = -1;
                }
                break;
            case 'd':
            case 'D':
                player.tank.motion.moveDir.x += 1;
                if (player.tank.motion.moveDir.x > 1) {
                    player.tank.motion.moveDir.x = 1;
                }
                break;
            case 's':
            case 'S':
                player.tank.motion.moveDir.y += 1;
                if (player.tank.motion.moveDir.y > 1) {
                    player.tank.motion.moveDir.y = 1;
                }
                break;
            case 'a':
            case 'A':
                player.tank.motion.moveDir.x -= 1;
                if (player.tank.motion.moveDir.x < -1) {
                    player.tank.motion.moveDir.x = -1;
                }
                break;
        }
    }, false);
}

function handleKeyUp(player)
{
    document.body.addEventListener('keyup', function(e) {
        if (player.tank == null) {
            return;
        }
        switch (e.key) {
            case 'w':
            case 'W':
                player.tank.motion.moveDir.y += 1;
                if (player.tank.motion.moveDir.y > 1) {
                    player.tank.motion.moveDir.y = 1;
                }
                break;
            case 'd':
            case 'D':
                player.tank.motion.moveDir.x -= 1;
                if (player.tank.motion.moveDir.x < -1) {
                    player.tank.motion.moveDir.x = -1;
                }
                break;
            case 's':
            case 'S':
                player.tank.motion.moveDir.y -= 1;
                if (player.tank.motion.moveDir.y < -1) {
                    player.tank.motion.moveDir.y = -1;
                }
                break;
            case 'a':
            case 'A':
                player.tank.motion.moveDir.x += 1;
                if (player.tank.motion.moveDir.x > 1) {
                    player.tank.motion.moveDir.x = 1;
                }
                break;
        }
    }, false);
}

function handleMouseMove(player)
{
    document.body.addEventListener('mousemove', function(e) {
        var targetPos = new Victor(e.offsetX - player.world.view.x, e.offsetY - player.world.view.y);
        if (player.tank != null) {
            var dir = targetPos.subtract(new Victor(player.tank.x, player.tank.y));
            player.tank.rotation = dir.angle() + Math.PI / 2;
        }
    }, false);
}

function handleMouseDown(player) {
    document.body.addEventListener('mousedown', function(e) {
        if (player.tank != null) {
            player.tank.fire();
        }
    }, false);
}

Player.prototype.addControl = function()
{
    handleKeyDown(this);
    handleKeyUp(this);
    handleMouseMove(this);
    handleMouseDown(this);
}

Player.prototype.update = function()
{
    if (!this.tank) {
        this.tank = new Tank(this.world, "base", {
            x: Math.random() * this.world.w,
            y: Math.random() * this.world.h
        }, this);
        this.world.tanks[this.tank.id] = this.tank;
    }
}

Object.defineProperties(Player.prototype, {
    x: {
        get: function() { return this.tank.x; }
    },
    y: {
        get: function() { return this.tank.y; }
    },
});

module.exports = Player;

