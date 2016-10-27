(function(){ "use strict";

var Weapon = require("../modules/weapon");
var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Tank(world, cfgName, position, player, view, slf)
{
    this.player = player;
    this.autoFire = true;

    this.weapons = [];
    var cfg = world.cfg.configTanks[cfgName];
    for (var idx in cfg.weapons) {
        if (cfg.weapons[idx] !== "") {
            var weapon = new Weapon(world, this, cfg.weapons[idx], view);
            this.weapons.push(weapon);
        }
    }

    Unit.call(this, world, Util.unitType.tank, cfg, position, 0, view, slf);

    if (view === true) {
        Unit.prototype.addHpBar.call(this, "base", true);
    }
}

Tank.prototype = Object.create(Unit.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.update = function()
{
    Unit.prototype.update.call(this);

    if (this.world.isLocal === false && this.autoFire === true) {
        this.fire();
    }

    for (var idx in this.weapons) {
        this.weapons[idx].update();
    }
};

Tank.prototype.getWeaponByName = function(name)
{
    for (var idx in this.weapons) {
        if (this.weapons[idx].name === name) {
            return this.weapons[idx];
        }
    }
    return null;
};

Tank.prototype.fire = function()
{
    for (var idx in this.weapons) {
        this.weapons[idx].fire();
    }
};

Tank.prototype.revertFireStatus = function()
{
    if (this.autoFire === true) {
        this.autoFire = false;
    } else {
        this.autoFire = true;
        for (var idx in this.weapons) {
            this.weapons[idx].resetFireDelay();
        }
    }
};

module.exports = Tank;

})();

