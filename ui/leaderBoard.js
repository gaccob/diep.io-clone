(function(){ 'use strict';

var cfg = {
    id: 'leaderBoardWindow',
    component: 'Window',
    header: {
        id:'leaderBoardHead',
        position: { x: 0, y: 0 },
        height: 30,
        text: 'LeadBoard',
        font: {
            size: '22px',
            family: 'Skranji'
        }
    },
    draggable: false,
    padding: 4,
    width: 200,
    height: 220,
};

var labelCfg = {
    component: 'Label',
    font: {
        size: '20px',
        font: 'Skranji'
    },
    text: '',
    width: 200,
    height: 35,
    anchor: { x: 0, y: 0.5 },
    position: {x: 0, y: 0}
};

function LeaderBoardUI(world)
{
    this.world = world;

    this.topCount = 5;

    this.ui = EZGUI.create(cfg, 'metalworks');
    this.ui.x = this.world.viewW - cfg.width;
    this.ui.y = cfg.padding;
    this.ui.visible = false;
    this.ui.alpha = 0.75;

    this.labels = {};

    this.world.stage.addChild(this.ui);
};

LeaderBoardUI.prototype = {
    constructor: LeaderBoardUI
};

LeaderBoardUI.prototype.update = function()
{
    if (this.world.playerCount <= 0) {
        return;
    }
    this.ui.visible = true;

    var idx, label, player;

    // remove out-of-date
    for (idx in this.labels) {
        label = this.labels[idx];
        player = this.world.players[idx];
        if (!player) {
            this.ui.removeChild(label);
            delete this.labels[idx];
            break;
        }
    }

    var i = 0;
    for (idx in this.world.players) {
        player = this.world.players[idx];
        label = this.labels[player.connid];
        if (!label) {
            if (player === this.world.getSelf()) {
                labelCfg.font.color = '#f0f0f0';
            } else {
                labelCfg.font.color = '#b0b0b0';
            }
            label = EZGUI.create(labelCfg, 'metalworks');
            this.labels[player.connid] = label;
            this.ui.addChild(label);
        }

        if (i >= this.topCount) {
            label.text = '';
            continue;
        }

        label.text = player.name + '  0/0/0';
        label.x = 16;
        label.y = cfg.header.height + i * labelCfg.height + 20;
        ++ i;
    }
};

module.exports = LeaderBoardUI;

})();

