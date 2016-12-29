(function(){ "use strict";

var Package = require("../package.json");
var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Bullet(world, cfgId, owner, weaponIdx)
{
    this.owner = owner;
    this.weaponIdx = weaponIdx;
    this.bornFrame = world.frame;

    Unit.call(this, world, Util.unitType.bullet, world.cfg.configBullets[cfgId]);
}

Bullet.prototype = Object.create(Unit.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.outOfDate = function()
{
    var frameSeconds = 1.0 / Package.app.world.frame;
    if (this.world.frame > this.bornFrame + this.cfg.lifeSeconds / frameSeconds) {
        return true;
    }
    return false;
};

module.exports = Bullet;

})();
