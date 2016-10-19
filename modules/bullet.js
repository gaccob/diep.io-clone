var Motion = require("../modules/motion");
var Util = require("../modules/util");
var View = require("../modules/view");

function Bullet(world, position, angle, weapon)
{
    this.id = Util.getId();
    this.type = Util.unitType.bullet;
    this.world = world;
    this.owner = weapon.owner;
    this.bornTime = world.time;
    this.cfg = world.cfg.configBullets[weapon.cfg.bullet];
    this.hp = this.cfg.hp;
    this.damage = this.cfg.damage;
    this.motion = new Motion(this, this.cfg.velocity, angle);
    this.view = new View(this);
    this.x = position.x;
    this.y = position.y;
    this.rotation = 0;
    world.addUnitToGrid(this);
}

Bullet.prototype = {}

Bullet.prototype.outOfBounds = function()
{
    if (this.x <= 0 || this.x >= this.world.w
        || this.y <= 0 || this.y >= this.world.h) {
        return true;
    }
    return false;
}

Bullet.prototype.outOfDate = function()
{
    if (this.world.time > this.bornTime + this.cfg.duration) {
        return true;
    }
    return false;
}

Bullet.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Bullet.prototype.die = function()
{
    delete this.world.bullets[this.id];
    this.view.onDie();
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);
}

Bullet.prototype.update = function()
{
    var deltaMS = 1000.0 / this.world.cfg.configWorld.frame;
    this.motion.update(deltaMS);
    this.view.update();
}

Object.defineProperties(Bullet.prototype, {
    radius: {
        get: function() { return this.cfg.radius; }
    },
    m: {
        get: function() { return this.radius * this.radius * this.cfg.density; }
    },
});

module.exports = Bullet;

