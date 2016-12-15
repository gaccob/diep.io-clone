(function(){ "use strict";

var configBullets = require("../cfg/configBullets");
var configDieAnimation = require("../cfg/configDieAnimation");
var configLevelUp = require("../cfg/configLevelUp");
var configObstacles = require("../cfg/configObstacles");
var configPropAdd = require("../cfg/configPropAdd");
var configTanks = require("../cfg/configTanks");
var configWeapons = require("../cfg/configWeapons");
var configMap = require("../cfg/configMap");

function Config()
{
    var idx;

    this.configBullets = {};
    for (idx in configBullets) {
        this.configBullets[configBullets[idx].alias] = configBullets[idx];
    }

    this.configDieAnimation = {};
    for (idx in configDieAnimation) {
        this.configDieAnimation[configDieAnimation[idx].alias] = configDieAnimation[idx];
    }

    this.configObstacles = {};
    for (idx in configObstacles) {
        this.configObstacles[configObstacles[idx].alias] = configObstacles[idx];
    }

    this.configTanks = {};
    for (idx in configTanks) {
        this.configTanks[configTanks[idx].alias] = configTanks[idx];
    }

    this.configWeapons = {};
    for (idx in configWeapons) {
        this.configWeapons[configWeapons[idx].alias] = configWeapons[idx];
    }

    this.configPropAdd = {};
    for (idx in configPropAdd) {
        this.configPropAdd[configPropAdd[idx].type] = configPropAdd[idx].add;
    }

    this.configLevelUp = {};
    for (idx in configLevelUp) {
        this.configLevelUp[configLevelUp[idx].level] = configLevelUp[idx];
    }

    this.configMap = configMap[0];
}

module.exports = Config;

})();

