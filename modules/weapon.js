(function(){ "use strict";

var Victor = require("victor");

var Bullet = require("../modules/bullet");
var Package = require("../package.json");
var Util = require("../modules/util");

function Weapon(world, tank, cfgId, idx)
{
    this.world = world;
    this.type = Util.unitType.weapon;
    this.owner = tank;
    this.cfg = world.cfg.configWeapons[cfgId];
    this.idx = idx;

    var frameSeconds = 1.0 / Package.app.world.frame;
    this.fireFrame = world.frame + this.cfg.shootDelaySeconds / frameSeconds;

    this.offset = new Victor(0, - this.cfg.shootOffset);
    this.offset.rotateDeg(this.cfg.degree)
               .add(new Victor(this.cfg.baseOffsetX, this.cfg.baseOffsetY));

    // rotation & position
    this.rotation = this.cfg.degree * Math.PI / 180;
    this.x = this.cfg.baseOffsetX;
    this.y = this.cfg.baseOffsetY;

    // reload frame interval
    this.reloadFrame = this.cfg.reloadSeconds / frameSeconds;
}

Weapon.prototype = {
    constructor: Weapon,
};

Weapon.prototype.resetFireDelay = function()
{
    var frameSeconds = 1.0 / Package.app.world.frame;
    this.fireFrame = this.world.frame + this.cfg.shootDelaySeconds / frameSeconds;
};

Weapon.prototype.update = function(fire)
{
    if (fire === true) {
        this.fire();
    }
};

// for client
// jshint unused: false
Weapon.prototype.fireBullet = function(bullet)
{
    this.fireFrame = this.world.frame;
};

// for server
Weapon.prototype.fire = function()
{
    var reloadFrame = this.reloadFrame / (1.0 + this.owner.getReloadAdd());
    if (this.world.frame - this.fireFrame >= reloadFrame) {

        this.fireFrame = this.world.frame;

        var pos = this.offset.clone();
        pos.rotate(this.owner.rotation);
        pos.add(new Victor(this.owner.x, this.owner.y));
        if (pos.x <= 0 || pos.y <= 0 || pos.x >= this.world.w || pos.y >= this.world.h) {
            return;
        }

        var angle = this.owner.rotation + this.cfg.degree * Math.PI / 180 - Math.PI / 2;
        var disturb = this.cfg.disturbDeg * Math.PI / 180;
        var bulletAngle = angle + (this.world.random() * disturb - disturb / 2);

        var bullet = new Bullet(this.world, this.cfg.bullet, this.owner, this.idx);
        bullet.x = pos.x;
        bullet.y = pos.y;
        bullet.motion.setIvAngle(bulletAngle);
        this.world.addUnit(bullet);

        var recoil = this.cfg.recoil / this.owner.m;
        this.owner.motion.addRecoil(recoil, angle);
    }
};

module.exports = Weapon;

})();
