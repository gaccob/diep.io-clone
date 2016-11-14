(function(){ "use strict";

var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Bullet(world, cfgName, position, angle, owner, weaponName, view)
{
    this.owner = owner;
    this.weaponName = weaponName;
    this.bornFrame = world.frame;

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
    if (this.world.frame > this.bornFrame + this.cfg.durationFrame) {
        return true;
    }
    return false;
};

module.exports = Bullet;

})();
