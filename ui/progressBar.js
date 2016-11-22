(function() { "use strict";

var cfg = {
    bgColor: "0x404040",
    stroke: 2,
    strokColor: "0x101010",
    width: 140,
    height: 20,
};

function ProgressBar(node, frontColor)
{
    this.node = node;
    this.frontColor = frontColor;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(cfg.stroke, cfg.strokColor);
    graphics.beginFill(cfg.bgColor);
    graphics.drawRect(cfg.stroke/2, cfg.stroke/2, cfg.width, cfg.height);
    graphics.endFill();
    graphics.lineStyle(cfg.stroke, cfg.strokColor);
    for (var i = 1; i < node; ++ i) {
        graphics.moveTo(i * cfg.width / node, cfg.stroke / 2);
        graphics.lineTo(i * cfg.width / node, cfg.height);
    }
    this.sprite = new PIXI.Container();

    this.bgSprite = new PIXI.Sprite(graphics.generateTexture());
    this.sprite.addChild(this.bgSprite);

    this.frontSprites = [];
}

ProgressBar.prototype = {
    constructor: ProgressBar
};

ProgressBar.prototype.setProgress = function(progress)
{
    if (progress < 0) {
        progress = 0;
    }
    if (progress > this.node) {
        progress = this.node;
    }
    var current = this.frontSprites.length;
    if (progress < current) {
        for (var i = progress; i < current; ++ i) {
            this.removeNode(i);
        }
        this.frontSprites.splice(0, progress);
    } else {
        for (var j = current; j < progress; ++ j) {
            this.addNode(j);
        }
    }
};

ProgressBar.prototype.addNode = function(index)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(cfg.stroke, cfg.bgColor);
    graphics.beginFill(this.frontColor);
    graphics.drawRect(cfg.stroke/2, cfg.stroke/2, cfg.width / this.node, cfg.height);
    graphics.endFill();
    var sprite = new PIXI.Sprite(graphics.generateTexture());

    this.frontSprites.push(sprite);
    this.sprite.addChild(sprite);
    sprite.x = index * cfg.width / this.node;
    sprite.y = 0;
};

ProgressBar.prototype.removeNode = function(index)
{
    this.sprite.removeChild(this.frontSprites[index]);
};

ProgressBar.prototype.setWidth = function(w)
{
    this.sprite.scale.x = w / this.sprite.width;
};

ProgressBar.prototype.setHeight = function(h)
{
    this.sprite.scale.y = h / this.sprite.height;
};

Object.defineProperties(ProgressBar.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
});

module.exports = ProgressBar;

})();

