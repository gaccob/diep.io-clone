var Config = require("../modules/config");

function HpBar(world, cfg, owner, display)
{
    this.world = world;
    this.cfg = cfg;
    this.owner = owner;
    this.display = display;
    this.percent = 1;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.edge.color);
    graphics.drawRoundedRect(0, 0, this.cfg.w, this.cfg.h, this.cfg.radius);
    graphics.endFill();
    this.backSprite = new PIXI.Sprite(graphics.generateTexture());
    this.backSprite.anchor.x = 0.5;
    this.backSprite.anchor.y = 0.5;

    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.color);
    graphics.drawRoundedRect(0, 0, this.cfg.w, this.cfg.h, this.cfg.radius);
    graphics.endFill();
    this.frontSprite = new PIXI.Sprite(graphics.generateTexture());
    this.frontSprite.anchor.x = 0.5;
    this.frontSprite.anchor.y = 0.5;

    this.sprite = new PIXI.Container();
    this.sprite.addChild(this.backSprite);
    this.sprite.addChild(this.frontSprite);
    this.sprite.alpha = this.cfg.alpha;

    this.x = this.owner.x + this.cfg.xOffset;
    var bounds = this.owner.sprite.getLocalBounds();
    this.y = this.owner.y + (bounds.height + bounds.y) + this.cfg.yOffset;

    var scale = this.owner.w / this.w;
    this.scale.x = this.cfg.xDisplayRatio * scale;
    this.scale.y = this.cfg.yDisplayRatio * scale;

    world.view.addChild(this.sprite);
}

HpBar.prototype = {}

HpBar.prototype.update = function(percent)
{
    this.percent = percent;
    this.frontSprite.width = this.cfg.w * percent;
    this.frontSprite.x -= this.frontSprite.width * (1 - percent);

    // full hp & default not display
    if (Math.abs(percent - 1) < 1e-6 && this.display == false) {
        this.visible = false;
    }
}

Object.defineProperties(HpBar.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
    scale: {
        get: function() { return this.sprite.scale; },
        set: function(s) { this.sprite.scale = s; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
    h: {
        get: function() { return this.sprite.height; }
    },
});

module.exports = HpBar;

