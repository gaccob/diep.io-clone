(function(){ "use strict";

var Victor = require("victor");
var Bullet = require("../modules/bullet");
var Util = require("../modules/util");
var View = require("../modules/view");

function Weapon(world, tank, name)
{
    this.world = world;
    this.name = name;
    this.type = Util.unitType.weapon;

    this.owner = tank;
    this.cfg = world.cfg.configWeapons[name];
    this.fireFrame = world.frame + this.cfg.shootDelayFrame;

    if (this.world.isLocal === true) {
        this.view = new View(this);
    }

    this.offset = new Victor(0, - this.cfg.shootOffset);
    this.offset.rotateDeg(this.cfg.degree)
               .add(new Victor(this.cfg.x, this.cfg.y));

    // rotation & position
    this.rotation = this.cfg.degree * Math.PI / 180;
    this.x = this.cfg.x;
    this.y = this.cfg.y;

    // fire animation
    this.fireAnimFrame = null;
    this.originalX = this.x;
    this.originalY = this.y;

    // reload frame interval
    this.reloadFrame = this.cfg.reloadFrame;
}

Weapon.prototype = {
    constructor: Weapon,
};

Weapon.prototype.resetFireDelay = function()
{
    this.fireFrame = this.world.frame + this.cfg.shootDelayFrame;
};

Weapon.prototype.update = function(fire)
{
    if (fire === true) {
        this.fire();
    }

    if (this.fireAnimFrame) {
        var frame = this.world.frame - this.fireAnimFrame;
        if (frame > this.cfg.fireAnimFrame) {
            this.fireAnimFrame = null;
        } else {
            var delta = Math.abs(frame / this.cfg.fireAnimFrame * 2 - 1) * this.cfg.fireAnimDistance;
            this.x = this.originalX + Math.cos(this.rotation + Math.PI / 2) * delta;
            this.y = this.originalY + Math.sin(this.rotation + Math.PI / 2) * delta;
        }
    }

    if (this.view) {
        this.view.update();
    }
};

// for client
// jshint unused: false
Weapon.prototype.fireBullet = function(bullet)
{
    this.fireFrame = this.world.frame;
    this.fireAnimFrame = this.world.frame;
};

// for server
Weapon.prototype.fire = function()
{
    var reloadFrame = this.reloadFrame / (1.0 + this.owner.getReloadAdd());
    if (this.world.frame - this.fireFrame >= reloadFrame) {

        this.fireFrame = this.world.frame;
        this.fireAnimFrame = this.world.frame;

        var pos = this.offset.clone();
        pos.rotate(this.owner.rotation);
        pos.add(new Victor(this.owner.x, this.owner.y));
        if (pos.x <= 0 || pos.y <= 0 || pos.x >= this.world.w || pos.y >= this.world.h) {
            return;
        }

        var angle = this.owner.rotation + this.cfg.degree * Math.PI / 180 - Math.PI / 2;
        var disturb = this.cfg.disturbDeg * Math.PI / 180;
        var bulletAngle = angle + (this.world.random() * disturb - disturb / 2);

        var bullet = new Bullet(this.world, this.cfg.bullet, this.owner, this.name);
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
