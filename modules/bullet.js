var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Bullet(world, position, angle, weapon, view)
{
    Unit.call(this,
        world,
        Util.unitType.bullet,
        world.cfg.configBullets[weapon.cfg.bullet],
        position,
        angle,
        view);

    this.owner = weapon.owner;
    this.bornTime = world.time;
}

Bullet.prototype = Object.create(Unit.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.outOfDate = function()
{
    if (this.world.time > this.bornTime + this.cfg.duration) {
        return true;
    }
    return false;
}

module.exports = Bullet;

