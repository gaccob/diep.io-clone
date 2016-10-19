var Bullet = require("../modules/bullet");
var Util = require("../modules/util");
var View = require("../modules/view");

function Weapon(world, tank, name)
{
    this.world = world;
    this.type = Util.unitType.weapon;

    this.owner = tank;
    this.cfg = world.cfg.configWeapons[name];
    this.fireFrame = world.frame + this.cfg.shootDelayFrame;
    this.view = new View(this);

    this.offset = new Victor(0, - this.cfg.shootOffset);
    this.offset.rotateDeg(this.cfg.angle)
               .add(new Victor(this.cfg.x, this.cfg.y));

    // rotation & position
    this.rotation = this.cfg.angle * Math.PI / 180;
    this.x = this.cfg.x;
    this.y = this.cfg.y;

    // fire animation
    this.fireAnimFrame = null;
    this.originalX = this.x;
    this.originalY = this.y;
}

Weapon.prototype = {
    constructor: Weapon,
}

Weapon.prototype.resetFireDelay = function()
{
    this.fireFrame = this.world.frame + this.cfg.shootDelayFrame;
}

Weapon.prototype.update = function()
{
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
    this.view.update();
}

Weapon.prototype.fire = function()
{
    if (this.world.frame - this.fireFrame >= this.cfg.reloadFrame) {

        this.fireFrame = this.world.frame;
        this.fireAnimFrame = this.world.frame;

        var pos = this.offset.clone();
        pos.rotate(this.owner.rotation);
        pos.add(new Victor(this.owner.x, this.owner.y));
        if (pos.x <= 0 || pos.y <= 0 || pos.x >= this.world.w || pos.y >= this.world.h) {
            return;
        }

        var angle = this.owner.rotation + this.cfg.angle * Math.PI / 180 - Math.PI / 2;
        var disturb = this.cfg.disturbDeg * Math.PI / 180;
        var bulletAngle = angle + (Math.random() * disturb - disturb / 2);

        var bullet = new Bullet(this.world, pos, bulletAngle, this);
        this.world.bullets[bullet.id] = bullet;

        var recoil = this.cfg.recoil / this.owner.m;
        this.owner.motion.addRecoil(recoil, angle);
    }
}

module.exports = Weapon;

