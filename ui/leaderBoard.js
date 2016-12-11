(function(){ 'use strict';

var Util = require("../modules/util");

var cfg = {
    font: "16px Open Sans",
    align: "left",
    weight: "normal",
    fills: [
        "#f94b3c",
        "#e38e34",
        "#eeda3f",
        "#65737e",
        "#7d8b96",
        "#6c7f8c",
        "#5a7080",
        "#425d6f",
    ],
    selfFill: "#96c938",
    width: 180,
    updateFrame: 30,
};

function LeaderBoardUI(world)
{
    this.world = world;

    this.topCount = cfg.fills.length;
    this.lastUpdateFrame = 0;
    this.labels = {};
    this.expLabels = {};
    this.exps = {};

    this.ui = new PIXI.Container();
    this.ui.x = this.world.viewW - cfg.width;
    this.ui.y = 0;
    this.world.stage.addChild(this.ui);
}

LeaderBoardUI.prototype = {
    constructor: LeaderBoardUI
};

LeaderBoardUI.prototype.addLabel = function(player, rank)
{
    if (!player || rank < 0 || rank >= this.topCount) {
        Util.logError("invald player rank=" + rank + 1);
        return null;
    }
    var labelCfg = {
        fill: cfg.fills[rank],
        font: cfg.font,
        fontWeight: cfg.weight,
        align: cfg.align
    };
    var nameLabel = new PIXI.Text(String(Number(rank) + 1) + " " + player.name, labelCfg);
    var expLabel = new PIXI.Text(String(player.tank.exp), labelCfg);
    var label = new PIXI.Container();
    label.addChild(nameLabel);
    label.addChild(expLabel);
    expLabel.x = 140;

    this.labels[player.connid] = label;
    this.ui.addChild(label);
    return label;
};

LeaderBoardUI.prototype.update = function()
{
    if (this.world.playerCount <= 0) {
        return;
    }
    this.ui.visible = true;

    if (this.world.frame < this.lastUpdateFrame + cfg.updateFrame) {
        return;
    }
    this.lastUpdateFrame = this.world.frame;

    var label;
    for (var idx in this.labels) {
        label = this.labels[idx];
        if (label) {
            this.ui.removeChild(label);
        }
    }
    this.labels = [];

    for (var rank in this.world.rankPlayers) {
        var player = this.world.rankPlayers[rank];
        if (!player || !player.tank) {
            continue;
        }
        label = this.addLabel(player, rank);
        if (!label) {
            break;
        }
        label.x = 0;
        label.y = rank * label.height + 10;
    }
};

module.exports = LeaderBoardUI;

})();

