var Config = require("../modules/config");
var Util = require("../modules/util");

var epsilon = 1e-6;

function Motion(owner, cfg, angle)
{
    this.owner = owner;
    this.moveDir = new Victor(0, 0);
    this.iv = new Victor(cfg.ivInit * Math.cos(angle),
        cfg.ivInit * Math.sin(angle));
    this.ev = new Victor(0, 0);
    this.ivAcc = cfg.ivAcc;
    this.ivMax = cfg.ivMax;
    this.ivMin = cfg.ivMin;
    this.evDec = cfg.evDec;
    this.evMax = cfg.evMax;
    this.rotate = cfg.rotate;
}

Motion.prototype = {}

Motion.prototype.toString = function()
{
    return "unit[" + this.owner.id + "] "
        + "move dir={" + this.moveDir.x + "," + this.moveDir.y + "} "
        + "iv={" + this.iv.x + "," + this.iv.y + "} "
        + "ev={" + this.ev.x + "," + this.ev.y + "} "
        + "v=" + this.v;
}

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

Motion.prototype.setMoveDirByFlag = function(left, right, up, down)
{
    this.moveDir.x = 0;
    this.moveDir.y = 0;
    if (left == 1) {
        this.moveDir.x -= 1;
    }
    if (right == 1) {
        this.moveDir.x += 1;
    }
    if (up == 1) {
        this.moveDir.y -= 1;
    }
    if (down == 1) {
        this.moveDir.y += 1;
    }
}

Motion.prototype.reverseMoveDirX = function()
{
    this.moveDir.x = -this.moveDir.x;
}

Motion.prototype.reverseMoveDirY = function()
{
    this.moveDir.y = -this.moveDir.y;
}

Motion.prototype.addRecoil = function(recoil, angle)
{
    this.ev.x -= recoil * Math.cos(angle);
    this.ev.y -= recoil * Math.sin(angle);
}

Motion.prototype.update = function(deltaMS)
{
    // internal velocity decrese
    var ilen = this.iv.length();
    if (ilen > this.ivMin) {
        var dec = (this.ivAcc / 2) * deltaMS / 1000;
        ilen = ilen > dec ? (ilen - dec) : 0;
        ilen = ilen < this.ivMin ? this.ivMin : ilen;
        this.iv.norm().multiply(new Victor(ilen, ilen));
    }

    // internal velocity increse
    if (this.moveDir.length() > epsilon) {
        var angle = this.moveDir.angle();
        this.iv.x += this.ivAcc * Math.cos(angle) * deltaMS / 1000;
        this.iv.y += this.ivAcc * Math.sin(angle) * deltaMS / 1000;
        var ilen = this.iv.length();
        if (ilen > this.ivMax) {
            ilen = this.ivMax;
            this.iv.norm().multiply(new Victor(ilen, ilen));
        }
    }

    // eternal velocity decrese
    var elen = this.ev.length();
    if (elen > epsilon) {
        var dec = this.evDec * deltaMS / 1000;
        elen = elen > dec ? (elen - dec) : 0;
        elen = elen > this.evMax ? this.evMax : elen;
        this.ev.norm().multiply(new Victor(elen, elen));
    }

    // update position
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
    v: {
        get: function() { return Math.sqrt(this.vx * this.vx + this.vy * this.vy); }
    },
});

module.exports = Motion;
