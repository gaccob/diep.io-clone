(function(){ "use strict";

var configBullets = require("../cfg/configBullets");
var configLevelUp = require("../cfg/configLevelUp");
var configObstacles = require("../cfg/configObstacles");
var configPropAdd = require("../cfg/configPropAdd");
var configTanks = require("../cfg/configTanks");
var configWeapons = require("../cfg/configWeapons");
var configTanksView = require("../www/assets/tank.json");

function Config()
{
    var idx;

    this.configBullets = {};
    for (idx in configBullets) {
        this.configBullets[configBullets[idx].id] = configBullets[idx];
    }

    this.configObstacles = {};
    for (idx in configObstacles) {
        this.configObstacles[configObstacles[idx].id] = configObstacles[idx];
    }

    this.configTanks = {};
    for (idx in configTanks) {
        this.configTanks[configTanks[idx].id] = configTanks[idx];
    }

    this.configTanksView = configTanksView.frames;

    this.configWeapons = {};
    for (idx in configWeapons) {
        this.configWeapons[configWeapons[idx].id] = configWeapons[idx];
    }

    this.configPropAdd = {};
    for (idx in configPropAdd) {
        this.configPropAdd[configPropAdd[idx].type] = configPropAdd[idx].add;
    }

    this.configLevelUp = {};
    for (idx in configLevelUp) {
        this.configLevelUp[configLevelUp[idx].level] = configLevelUp[idx];
    }
}

module.exports = Config;

})();

