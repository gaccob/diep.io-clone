(function(){ "use strict";

var Weapon = require("../modules/weapon");
var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Tank(world, cfgName, player)
{
    this.autoFire = false;
    this.player = player;

    this.weapons = [];
    var cfg = world.cfg.configTanks[cfgName];
    for (var idx in cfg.weapons) {
        if (cfg.weapons[idx] !== "") {
            var weapon = new Weapon(world, this, cfg.weapons[idx]);
            this.weapons.push(weapon);
        }
    }

    Unit.call(this, world, Util.unitType.tank, cfg);
    Unit.prototype.addHpBar.call(this, true);
}

Tank.prototype = Object.create(Unit.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.update = function()
{
    Unit.prototype.update.call(this);

    for (var idx in this.weapons) {
        this.weapons[idx].update(this.autoFire);
    }
};

Tank.prototype.die = function()
{
    Unit.prototype.die.call(this);

    if (this.player) {
        this.player.tank = null;
        Util.logDebug("player[" + this.player.connid + "] tank die");
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

