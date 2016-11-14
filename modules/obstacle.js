(function(){ "use strict";

var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Obstacle(world, name, position, view)
{
    Unit.call(this,
              world,
              Util.unitType.obstacle,
              world.cfg.configObstacles[name],
              position,
              world.random() * 2 * Math.PI,
              view);

    if (view === true) {
        Unit.prototype.addHpBar.call(this, "base", false);
    }
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
