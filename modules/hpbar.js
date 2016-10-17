var Util = require("../modules/util");

function HpBar(world, name, owner, display)
{
    this.world = world;
    this.cfg = world.cfg.configHpbar[name];
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

    this.x = this.owner.x + this.owner.radius * this.cfg.xOffsetRatio;
    this.y = this.owner.y + this.owner.radius * this.cfg.yOffsetRatio;

    this.scale.x = this.cfg.xDisplayRatio * 2 * this.owner.radius / this.cfg.w;
    this.scale.y = this.cfg.yDisplayRatio * 2 * this.owner.radius / this.cfg.w;

    world.view.addChild(this.sprite);
}

HpBar.prototype = {}

HpBar.prototype.die = function()
{
    if (this.sprite && this.sprite.parent != null) {
        this.sprite.parent.removeChild(this.sprite);
    }
    delete this.sprite;
}

HpBar.prototype.update = function(percent)
{
    if (Math.abs(percent - 1) < 1e-6 && this.display == false) {
        this.visible = false;
    } else {
        this.visible = true;
    }

    if (this.percent == percent) {
        return;
    }

    this.frontSprite.x += this.cfg.w * (1 - this.percent) / 2;
    this.percent = percent;
    this.frontSprite.width = this.cfg.w * percent;
    this.frontSprite.x -= this.cfg.w * (1 - this.percent) / 2;
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
    visible: {
        get: function() { return this.sprite.visible; },
        set: function(v) { this.sprite.visible = v; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
    h: {
        get: function() { return this.sprite.height; }
    },
});

module.exports = HpBar;

