(function(){ "use strict";

var cfg = {
    scaleYRatio: 0.6,
    scaleXRatio: 0.6,
    yOffsetRatio: 1.4,
    xOffsetRatio: 0.0,

    h: 20.0,
    w: 100.0,
    radius: 10.0,
    alpha: 0.75,
    color: "0x86c680",
    edge: {
        color: "0x555555",
        w: 4.0,
    },
};

function HpBar(world, owner, display)
{
    this.world = world;
    this.owner = owner;
    this.percent = 1;
    this.display = display;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(cfg.edge.w, cfg.edge.color);
    graphics.beginFill(cfg.edge.color);
    graphics.drawRoundedRect(0, 0, cfg.w, cfg.h, cfg.radius);
    graphics.endFill();
    this.backSprite = new PIXI.Sprite(graphics.generateTexture());
    this.backSprite.anchor.x = 0.5;
    this.backSprite.anchor.y = 0.5;

    graphics.lineStyle(cfg.edge.w, cfg.edge.color);
    graphics.beginFill(cfg.color);
    graphics.drawRoundedRect(0, 0, cfg.w, cfg.h, cfg.radius);
    graphics.endFill();
    this.frontSprite = new PIXI.Sprite(graphics.generateTexture());
    this.frontSprite.anchor.x = 0.5;
    this.frontSprite.anchor.y = 0.5;

    this.ui = new PIXI.Container();
    this.ui.addChild(this.backSprite);
    this.ui.addChild(this.frontSprite);
    this.ui.alpha = cfg.alpha;

    var holder = this.owner;
    var w = 2 * holder.radius;
    this.ui.scale.x = cfg.scaleXRatio * w / cfg.w;
    this.ui.scale.y = cfg.scaleYRatio * w / cfg.w;

    this.world.mainView.addChild(this.ui);
}

HpBar.prototype = {
    constructor: HpBar,
};

HpBar.prototype.die = function()
{
    if (this.ui && this.ui.parent) {
        this.ui.parent.removeChild(this.ui);
    }
    this.frontSprite = null;
    this.backSprite = null;
    this.ui = null;
};

HpBar.prototype.update = function(percent)
{
    if (this.ui) {
        this.ui.x = this.owner.x + this.owner.radius * cfg.xOffsetRatio;
        this.ui.y = this.owner.y + this.owner.radius * cfg.yOffsetRatio;

        if (Math.abs(percent - 1) < 1e-6 && this.display === false) {
            this.ui.visible = false;
        } else {
            this.ui.visible = true;
        }

        if (this.percent != percent) {
            this.frontSprite.x += cfg.w * (1 - this.percent) / 2;
            this.frontSprite.width = cfg.w * percent;
            this.frontSprite.x -= cfg.w * (1 - percent) / 2;
            this.percent = percent;
        }
    }
};

module.exports = HpBar;

})();
