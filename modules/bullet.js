var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Bullet(world, cfgName, position, angle, owner, weaponName, view)
{
    this.owner = owner;
    this.weaponName = weaponName;
    this.bornTime = world.time;

    Unit.call(this,
              world,
              Util.unitType.bullet,
              world.cfg.configBullets[cfgName],
              position,
              angle,
              view);
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

