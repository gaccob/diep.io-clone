(function(){ "use strict";

var ProgressView = require("../view/progressView");
var Util = require("../modules/util");

var cfg = {

    mainBgColor: [
        '0x6e5d68', // 110,93,104
        '0x486487', // 72,100,135
        '0x6c7969', // 108,121,105
        '0x696c6f', // 105,108,111
        '0x66557d', // 102,85,125
        '0x5e8168', // 94,129,104
        '0x6f6f98', // 111,111,152
        '0x47767d', // 71,118,125
    ],

    mainFrontColor: [
        '0xecb690', // 237,181,142
        '0xea6bef', // 234,107,239
        '0x986bee', // 152,107,238
        '0x6c95f0', // 108,149,240
        '0xefd76b', // 239,215,107
        '0xef6c6c', // 239,108,108
        '0x98f06c', // 152,240,108
        '0x6befe9', // 107,239,233
    ],

    panel: {
        bg: {
            width: 120,
            height: 50,
            radius: 8,
            alpha: 0.8,
        },

        progressView: {
            x: 10,
            y: 30,
            height: 12,
            width: 100
        },

        text: {
            font: "16px Open Sans",
            align: "center",
            weight: "normal",
            fill: "#f0f0f0",
            y: 10,
            height: 16,
        },

        padding: 6,
    },

    points: 5
};

function addPropBar(container, prop, name)
{
    var panel = new PIXI.Container();

    var graphics = new PIXI.Graphics();
    var bgColor = cfg.mainBgColor[prop - 1];
    var frontColor = cfg.mainFrontColor[prop - 1];
    graphics.lineStyle(0, bgColor);
    graphics.beginFill(bgColor);
    graphics.drawRoundedRect(0, 0, cfg.panel.bg.width, cfg.panel.bg.height, cfg.panel.bg.radius);
    graphics.endFill();
    var bgSprite = new PIXI.Sprite(graphics.generateTexture());
    bgSprite.alpha = cfg.panel.bg.alpha;
    panel.addChild(bgSprite);

    var progressView = new ProgressView(cfg.points, frontColor);
    progressView.setWidth(cfg.panel.progressView.width);
    progressView.setHeight(cfg.panel.progressView.height);
    progressView.x = cfg.panel.progressView.x;
    progressView.y = cfg.panel.progressView.y;
    panel.addChild(progressView.view);
    container.progressViews[prop] = progressView;

    var text = new PIXI.Text(name + " [" + prop + "]", {
        fill: cfg.panel.text.fill,
        font: cfg.panel.text.font,
        fontWeight: cfg.panel.text.weight,
        align: cfg.panel.text.align
    });
    var ratio = cfg.panel.text.height / text.height;
    text.scale.x = ratio;
    text.scale.y = ratio;
    text.x = (cfg.panel.bg.width - text.width) / 2;
    text.y = cfg.panel.text.y;
    panel.addChild(text);

    // layout: 2 * 4
    var col = 4;
    if (prop - 1 < col) {
        panel.x = cfg.panel.padding + (prop - 1) * (cfg.panel.bg.width + cfg.panel.padding);
        panel.y = cfg.panel.padding;
    } else {
        panel.x = cfg.panel.padding + (prop - 1 - col) * (cfg.panel.bg.width + cfg.panel.padding);
        panel.y = cfg.panel.padding + cfg.panel.bg.height + cfg.panel.padding;
    }
    container.view.addChild(panel);

    // click event
    panel.interactive = true;
    panel.on('click', function() { container.addProp(prop); });
}

function StagePropView(world)
{
    this.world = world;
    this.view = new PIXI.Container();
    this.progressViews = {};

    var pt = this.world.proto.PropType;
    addPropBar(this, pt.PT_HEALTH_REGEN, "HP Regen");
    addPropBar(this, pt.PT_MAX_HEALTH, "Max HP");
    addPropBar(this, pt.PT_BODY_DAMAGE, "Body Damage");
    addPropBar(this, pt.PT_BULLET_SPEED, "Bullet Speed");
    addPropBar(this, pt.PT_BULLET_PENETRATION, "Penetration");
    addPropBar(this, pt.PT_BULLET_DAMAGE, "Damage");
    addPropBar(this, pt.PT_RELOAD, "Reload");
    addPropBar(this, pt.PT_MOVEMENT_SPEED, "Speed");

    this.x = (this.world.cw - this.view.width) / 2;
    this.y = (this.world.ch - this.view.height) - 10;

    this.view.visible = false;
    this.world.stage.addChild(this.view);

    this.lastVisibleFrame = 0;
}

StagePropView.prototype = {
    constructor: StagePropView
};

StagePropView.prototype.addProp = function(propType)
{
    if (this.view.visible !== true) {
        return;
    }
    var player = this.world.getSelf();
    if (!player || !player.tank) {
        return;
    }
    this.world.synchronizer.syncAddProp(propType);
};

StagePropView.prototype.onPropAdd = function(propType)
{
    var pb = this.progressViews[propType];
    if (!pb) {
        Util.logError("invalid prop type=" + propType);
        return;
    }
    pb.setProgress(pb.getProgress() + 1);
};

StagePropView.prototype.reset = function()
{
    for (var i in this.progressViews) {
        this.progressViews[i].setProgress(0);
    }
};

StagePropView.prototype.updateView = function()
{
    if (this.world.started !== true) {
        this.view.visible = false;
        return;
    }

    // visible if any free skill points
    var player = this.world.getSelf();
    if (player && player.tank && player.tank.freeSkillPoints > 0) {
        this.y = (this.world.ch - this.view.height) - 10;
        this.view.visible = true;
        this.lastVisibleFrame = this.world.frame;
    } else {
        var delay = 20;
        if (this.world.frame > this.lastVisibleFrame + delay) {
            this.view.visible = false;
        } else {
            this.y += this.view.height / delay;
        }
    }
};

Object.defineProperties(StagePropView.prototype, {
    x: {
        get: function() { return this.view.x; },
        set: function(v) { this.view.x = v; }
    },
    y: {
        get: function() { return this.view.y; },
        set: function(v) { this.view.y = v; }
    },
});

module.exports = StagePropView;

})();
