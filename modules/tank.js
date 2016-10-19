var HpBar = require("../modules/hpbar");
var Motion = require("../modules/motion");
var Weapon = require("../modules/weapon");
var Util = require("../modules/util");
var View = require("../modules/view");

function Tank(world, name, position, player)
{
    this.world = world;
    this.id = Util.getId();
    this.type = Util.unitType.tank;
    this.cfg = world.cfg.configTanks[name];
    this.player = player;

    this.weapons = [];
    for (var idx in this.cfg.weapons) {
        if (this.cfg.weapons[idx] != "") {
            var weapon = new Weapon(world, this, this.cfg.weapons[idx]);
            this.weapons.push(weapon);
        }
    }

    this.view = new View(this);

    this.x = position.x;
    this.y = position.y;
    this.rotation = 0;

    this.hp = this.cfg.hp;
    this.damage = this.cfg.damage;
    this.motion = new Motion(this, this.cfg.velocity, 0);
    this.hpbar = new HpBar(world, "base", this, true);

    world.addUnitToGrid(this);
}

Tank.prototype = {}

Tank.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Tank.prototype.die = function()
{
    this.hpbar.die();
    this.view.onDie();

    delete this.world.tanks[this.id];
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);

    if (this.world.player.tank == this) {
        this.world.player.tank = null;
        this.world.gameend = true;
        alert("Lose! Click To Restart!");
        this.world.player.update();
    }
}

Tank.prototype.update = function()
{
    var oldX = this.x;
    var oldY = this.y;
    var updateMS = 1000.0 / this.world.cfg.configWorld.frame;
    this.motion.update(updateMS);
    this.view.update();

    this.hpbar.x += (this.x - oldX);
    this.hpbar.y += (this.y - oldY);
    this.hpbar.update(this.hp / this.cfg.hp);

    if (this.autoFire == true) {
        this.fire();
    }

    for (var idx in this.weapons) {
        this.weapons[idx].update();
    }
}

Tank.prototype.fire = function()
{
    for (var idx in this.weapons) {
        this.weapons[idx].fire();
    }
}

Tank.prototype.revertFireStatus = function()
{
    if (this.autoFire == true) {
        this.autoFire = false;
    } else {
        this.autoFire = true;
        for (var idx in this.weapons) {
            this.weapons[idx].resetFireDelay();
        }
    }
}

Object.defineProperties(Tank.prototype, {
    radius: {
        get: function() { return this.cfg.radius; }
    },
    m: {
        get: function() { return this.radius * this.radius * this.cfg.density; }
    },
});

module.exports = Tank;

