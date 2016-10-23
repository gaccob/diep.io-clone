var configBullets = require("../cfg/configBullets");
var configDieAnimation = require("../cfg/configDieAnimation");
var configHpbar = require("../cfg/configHpbar");
var configObstacles = require("../cfg/configObstacles");
var configTanks = require("../cfg/configTanks");
var configWeapons = require("../cfg/configWeapons");
var configMap = require("../cfg/configMap");
var configWorld = require("../cfg/configWorld");

function Config()
{
    this.configBullets = {};
    for (var idx in configBullets) {
        this.configBullets[configBullets[idx].alias] = configBullets[idx];
    }

    this.configDieAnimation = {};
    for (var idx in configDieAnimation) {
        this.configDieAnimation[configDieAnimation[idx].alias] = configDieAnimation[idx];
    }

    this.configHpbar = {};
    for (var idx in configHpbar) {
        this.configHpbar[configHpbar[idx].alias] = configHpbar[idx];
    }

    this.configObstacles = {};
    for (var idx in configObstacles) {
        this.configObstacles[configObstacles[idx].alias] = configObstacles[idx];
    }

    this.configTanks = {};
    for (var idx in configTanks) {
        this.configTanks[configTanks[idx].alias] = configTanks[idx];
    }

    this.configWeapons = {};
    for (var idx in configWeapons) {
        this.configWeapons[configWeapons[idx].alias] = configWeapons[idx];
    }

    this.configMap = configMap[0];
    this.configWorld = configWorld[0];

    this.configApp = {
        domain: "tank.gaccob.com",
        port: 9000,
        proto: "tank.proto.json",
        maxOnline: 30,
    };
}

module.exports = Config;

