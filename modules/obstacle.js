var HpBar = require("../modules/hpbar");
var Motion = require("../modules/motion");
var Util = require("../modules/util");
var View = require("../modules/view");

function Obstacle(world, name, position)
{
    this.world = world;
    this.id = Util.getId();
    this.type = Util.unitType.obstacle;
    this.cfg = world.cfg.configObstacles[name];
    this.hp = this.cfg.hp;
    this.damage = this.cfg.damage;
    this.view = new View(this);
    this.x = position.x;
    this.y = position.y;
    this.rotation = 0;
    var angle = Math.random() * Math.PI * 2;
    this.motion = new Motion(this, this.cfg.velocity, angle);
    this.hpbar = new HpBar(world, "base", this, false);

    world.addUnitToGrid(this);
}

Obstacle.prototype = {}

Obstacle.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Obstacle.prototype.die = function()
{
    this.hpbar.die();
    this.view.onDie();

    delete this.world.obstacles[this.id];
    -- this.world.obstacleCount;
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);
}

Obstacle.prototype.update = function()
{
    var oldX = this.x;
    var oldY = this.y;
    var updateMS = 1000.0 / this.world.cfg.configWorld.frame;
    this.motion.update(updateMS);
    this.view.update();

    this.hpbar.x += (this.x - oldX);
    this.hpbar.y += (this.y - oldY);
    this.hpbar.update(this.hp / this.cfg.hp);

    if (this.x < this.world.spawnRegion.x
        || this.x > this.world.spawnRegion.x + this.world.spawnRegion.w) {
        this.motion.reverseIvX();
    }
    if (this.y < this.world.spawnRegion.y
        || this.y > this.world.spawnRegion.y + this.world.spawnRegion.h) {
        this.motion.reverseIvY();
    }
}

Object.defineProperties(Obstacle.prototype, {
    radius: {
        get: function() { return this.cfg.radius; }
    },
    m: {
        get: function() { return this.radius * this.radius * this.cfg.density; }
    },
});

module.exports = Obstacle;
