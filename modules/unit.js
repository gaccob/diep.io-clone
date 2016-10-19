var HpBar = require("../modules/hpbar");
var Motion = require("../modules/motion");
var Util = require("../modules/util");
var View = require("../modules/view");

var id = 0;

function Unit(world, type, cfg, position, angle)
{
    this.world = world;
    this.id = (++ id);
    this.type = type;
    this.cfg = cfg;
    this.motion = new Motion(this, this.cfg.velocity, angle);
    this.view = new View(this);
    this.x = position.x;
    this.y = position.y;
    this.rotation = 0;
    this.hp = this.cfg.hp;
    this.damage = this.cfg.damage;
    world.addUnitToGrid(this);
}

Unit.prototype = {
    constructor: Unit,
}

Unit.prototype.addHpBar = function(name, visible)
{
    if (this.hpbar) {
        delete this.hpbar;
    }
    this.hpbar = new HpBar(this.world, name, this, visible);
}

Unit.prototype.outOfBounds = function()
{
    if (this.x <= 0 || this.x >= this.world.w
        || this.y <= 0 || this.y >= this.world.h) {
        return true;
    }
    return false;
}

Unit.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Unit.prototype.die = function()
{
    if (this.hpbar) {
        this.hpbar.die();
    }

    this.view.onDie();
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);

    if (this.type == Util.unitType.bullet) {
        delete this.world.bullets[this.id];
    }

    if (this.type == Util.unitType.obstacle) {
        delete this.world.obstacles[this.id];
        -- this.world.obstacleCount;
    }

    if (this.type == Util.unitType.tank) {
        delete this.world.tanks[this.id];
        if (this.world.player.tank == this) {
            this.world.player.tank = null;
            this.world.gameend = true;
            alert("Lose! Click To Restart!");
            this.world.player.update();
        }
    }
}

Unit.prototype.update = function()
{
    var oldX = this.x;
    var oldY = this.y;

    var deltaMS = 1000.0 / this.world.cfg.configWorld.frame;
    this.motion.update(deltaMS);
    this.view.update();

    if (this.hpbar) {
        this.hpbar.x += (this.x - oldX);
        this.hpbar.y += (this.y - oldY);
        this.hpbar.update(this.hp / this.cfg.hp);
    }
}

Object.defineProperties(Unit.prototype, {
    radius: {
        get: function() { return this.cfg.radius; }
    },
    m: {
        get: function() { return this.radius * this.radius * this.cfg.density; }
    },
});

module.exports = Unit;


