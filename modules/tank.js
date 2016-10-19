var Weapon = require("../modules/weapon");
var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Tank(world, name, position, player)
{
    this.player = player;

    this.weapons = [];
    var cfg = world.cfg.configTanks[name];
    for (var idx in cfg.weapons) {
        if (cfg.weapons[idx] != "") {
            var weapon = new Weapon(world, this, cfg.weapons[idx]);
            this.weapons.push(weapon);
        }
    }

    Unit.call(this,
        world,
        Util.unitType.tank,
        cfg,
        position,
        0);

    Unit.prototype.addHpBar.call(this, "base", true);
}

Tank.prototype = Object.create(Unit.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.update = function()
{
    Unit.prototype.update.call(this);

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

module.exports = Tank;

