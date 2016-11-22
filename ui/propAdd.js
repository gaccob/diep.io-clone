(function(){ "use strict";

var ProgressBar = require("../ui/progressBar");

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

        progressBar: {
            x: 10,
            y: 30,
            height: 12,
            width: 100
        },

        text: {
            font: "18px Open Sans",
            align: "center",
            weight: "normal",
            fill: "#f0f0f0",
            y: 10,
            height: 12,
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

    var progressBar = new ProgressBar(cfg.points, frontColor);
    progressBar.setWidth(cfg.panel.progressBar.width);
    progressBar.setHeight(cfg.panel.progressBar.height);
    progressBar.x = cfg.panel.progressBar.x;
    progressBar.y = cfg.panel.progressBar.y;
    panel.addChild(progressBar.sprite);

    progressBar.setProgress(3);
    progressBar.setProgress(2);

    var text = new PIXI.Text(name + "(" + prop + ")", {
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
    container.addChild(panel);
}

function PropAddUI(world)
{
    this.world = world;
    this.ui = new PIXI.Container();

    var pt = this.world.proto.PropType;
    addPropBar(this.ui, pt.PT_HEALTH_REGEN, "HP Regen");
    addPropBar(this.ui, pt.PT_MAX_HEALTH, "Max HP");
    addPropBar(this.ui, pt.PT_BODY_DAMAGE, "Body Damage");
    addPropBar(this.ui, pt.PT_BULLET_SPEED, "Bullet Speed");
    addPropBar(this.ui, pt.PT_BULLET_PENETRATION, "Penetration");
    addPropBar(this.ui, pt.PT_BULLET_DAMAGE, "Damage");
    addPropBar(this.ui, pt.PT_RELOAD, "Reload");
    addPropBar(this.ui, pt.PT_MOVEMENT_SPEED, "Speed");

    this.x = (this.world.viewW - this.ui.width) / 2;
    this.y = (this.world.viewH - this.ui.height);

    this.ui.visible = false;
    this.world.stage.addChild(this.ui);
}

PropAddUI.prototype = {
    constructor: PropAddUI
};

PropAddUI.prototype.update = function()
{
    if (this.world.started === true) {
        this.ui.visible = true;
    }
};

Object.defineProperties(PropAddUI.prototype, {
    x: {
        get: function() { return this.ui.x; },
        set: function(v) { this.ui.x = v; }
    },
    y: {
        get: function() { return this.ui.y; },
        set: function(v) { this.ui.y = v; }
    },
});

module.exports = PropAddUI;

})();
