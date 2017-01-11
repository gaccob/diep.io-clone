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

function WorldHpbarView(world, owner, display)
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

    this.view = new PIXI.Container();
    this.view.addChild(this.backSprite);
    this.view.addChild(this.frontSprite);
    this.view.alpha = cfg.alpha;

    var holder = this.owner;
    var w = 2 * holder.radius;
    this.view.scale.x = cfg.scaleXRatio * w / cfg.w;
    this.view.scale.y = cfg.scaleYRatio * w / cfg.w;

    this.world.stageWorldView.addChild(this.view);
}

WorldHpbarView.prototype = {
    constructor: WorldHpbarView,
};

WorldHpbarView.prototype.onDie = function()
{
    if (this.view && this.view.parent) {
        this.view.parent.removeChild(this.view);
    }
    this.frontSprite = null;
    this.backSprite = null;
    this.view = null;
};

WorldHpbarView.prototype.updateView = function(percent)
{
    if (this.view) {
        this.view.x = this.owner.x + this.owner.radius * cfg.xOffsetRatio;
        this.view.y = this.owner.y + this.owner.radius * cfg.yOffsetRatio;

        if (Math.abs(percent - 1) < 1e-6 && this.display === false) {
            this.view.visible = false;
        } else {
            this.view.visible = true;
        }

        if (this.percent != percent) {
            this.frontSprite.x += cfg.w * (1 - this.percent) / 2;
            this.frontSprite.width = cfg.w * percent;
            this.frontSprite.x -= cfg.w * (1 - percent) / 2;
            this.percent = percent;
        }
    }
};

module.exports = WorldHpbarView;

})();

