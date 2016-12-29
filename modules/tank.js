(function(){ "use strict";

var AI = require("../modules/ai");
var Weapon = require("../modules/weapon");
var Unit = require("../modules/unit");
var Util = require("../modules/util");

function Tank(world, cfgId, player)
{
    this.autoFire = true;
    this.player = player;
    this.ai = null;

    this.weapons = [];
    var cfg = world.cfg.configTanks[cfgId];
    for (var idx in cfg.weapons) {
        if (cfg.weapons[idx] !== "") {
            var weapon = new Weapon(world, this, cfg.weapons[idx], idx);
            this.weapons.push(weapon);
        }
    }

    Unit.call(this, world, Util.unitType.tank, cfg);
    Unit.prototype.addHpbarView.call(this, true);
    Unit.prototype.addNameView.call(this);
}

Tank.prototype = Object.create(Unit.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.update = function()
{
    Unit.prototype.update.call(this);

    for (var idx in this.weapons) {
        this.weapons[idx].update(this.autoFire);
    }

    if (this.ai) {
        this.ai.update();
    }
};

Tank.prototype.die = function()
{
    Unit.prototype.die.call(this);
    if (this.player) {
        this.player.ondie();
    }
};

Tank.prototype.getWeaponByIdx = function(idx)
{
    for (var i in this.weapons) {
        if (this.weapons[i].idx === idx) {
            return this.weapons[i];
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

Tank.prototype.bindAI = function()
{
    this.ai = new AI(this.world, this);
    Util.logDebug("player[" + this.player.connid + "] tank bind AI");
};

module.exports = Tank;

})();

