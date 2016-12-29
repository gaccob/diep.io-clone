(function(){ "use strict";

var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Obstacle(world, cfgId)
{
    Unit.call(this, world, Util.unitType.obstacle, world.cfg.configObstacles[cfgId]);
    Unit.prototype.addHpbarView.call(this, false);
}

Obstacle.prototype = Object.create(Unit.prototype);
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.update = function()
{
    Unit.prototype.update.call(this);

    if (this.x < this.world.spawnRegion.x
        || this.x > this.world.spawnRegion.x + this.world.spawnRegion.w) {
        this.motion.reverseIvX();
    }
    if (this.y < this.world.spawnRegion.y
        || this.y > this.world.spawnRegion.y + this.world.spawnRegion.h) {
        this.motion.reverseIvY();
    }
};

Obstacle.prototype.collideUnit = function(caster)
{
    this.motion.reverseIvX();
    this.motion.reverseIvY();
    Unit.prototype.collideUnit.call(this, caster);
};

module.exports = Obstacle;

})();
