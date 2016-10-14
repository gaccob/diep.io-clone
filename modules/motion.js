var Config = require("../modules/config");
var Util = require("../modules/util");

var epsilon = 1e-6;

function Motion(owner, velocity, rotate)
{
    this.owner = owner;
    this.moveDir = new Victor(0, 0);
    this.velocity = velocity;
    this.rotate = rotate;
    this.iv = new Victor(0, 0); // internal
    this.ev = new Victor(0, 0); // external
}

Motion.prototype = {}

Motion.prototype.randomMoveDir = function()
{
    var angle = Math.random() * Math.PI * 2;
    this.moveDir.x = Math.cos(angle);
    this.moveDir.y = Math.sin(angle);
}

Motion.prototype.setMoveDirByAngle = function(angle)
{
    this.moveDir.x = Math.cos(angle);
    this.moveDir.y = Math.sin(angle);
}

Motion.prototype.reverseMoveDirX = function()
{
    this.moveDir.x = -this.moveDir.x;
}

Motion.prototype.reverseMoveDirY = function()
{
    this.moveDir.y = -this.moveDir.y;
}

Motion.prototype.update = function(deltaMS)
{
    if (this.moveDir.length() > epsilon) {
        var angle = this.moveDir.angle();
        this.iv.x = this.velocity * Math.cos(angle);
        this.iv.y = this.velocity * Math.sin(angle);
    } else {
        this.iv.x = 0;
        this.iv.y = 0;
    }

    var elen = this.ev.length();
    if (elen > epsilon) {
        var dec = Config.world.externalVelocityDecPerSecond * deltaMS / 1000;
        elen = elen > dec ? (elen - dec) : 0;
        this.ev.norm().multiply(new Victor(elen, elen));
    }

    this.owner.x += (this.iv.x + this.ev.x) * deltaMS / 1000;
    this.owner.y += (this.iv.y + this.ev.y) * deltaMS / 1000;

    var cfg = Config.world.map;
    Util.clampPosition(this.owner, 0, cfg.w, 0, cfg.h);

    if (this.rotate != null && Math.abs(this.rotate) > epsilon) {
        this.owner.sprite.rotation += this.rotate * deltaMS / 1000;
    }
}

Object.defineProperties(Motion.prototype, {
    vx: {
        get: function() { return this.iv.x + this.ev.x; }
    },
    vy: {
        get: function() { return this.iv.y + this.ev.y; }
    },
});

module.exports = Motion;
