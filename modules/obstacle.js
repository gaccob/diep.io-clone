var Config = require("../modules/config");
var Util = require("../modules/util");

function Obstacle(world, cfg, position)
{
    this.world = world;
    this.cfg = cfg;
    this.id = Util.getId();

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.color);

    var from = new PIXI.Point(0, this.cfg.radius);
    graphics.moveTo(from.x, from.y);
    for (var i = 1; i < this.cfg.side; ++ i) {
        var p = new Victor(from.x, from.y);
        p.rotate(Math.PI * 2 / this.cfg.side);
        graphics.lineTo(p.x, p.y);
        from.set(p.x, p.y);
        delete p;
    }
    graphics.endFill();
    this.sprite = new PIXI.Sprite(graphics.generateTexture());
    delete from;
    delete graphics;

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = (this.cfg.radius + this.cfg.edge.w) / this.sprite.height;
    world.view.addChild(this.sprite);

    this.x = position.x;
    this.y = position.y;
    this.radius = this.cfg.radius + this.cfg.edge.w;

    var angle = Math.random() * Math.PI * 2;
    this.speed = new Victor(this.cfg.moveSpeed * Math.cos(angle),
        this.cfg.moveSpeed * Math.sin(angle));
}

Obstacle.prototype = {}

Obstacle.prototype.update = function()
{
    if (this.x < Config.world.walkable.x) {
        this.speed.x = - this.speed.x;
    }
    if (this.x > Config.world.walkable.x + Config.world.walkable.w) {
        this.speed.x = - this.speed.x;
    }
    if (this.y < Config.world.walkable.y) {
        this.speed.y = - this.speed.y;
    }
    if (this.y > Config.world.walkable.y + Config.world.walkable.h) {
        this.speed.y = - this.speed.y;
    }

    // slow move
    this.x += this.speed.x * Config.world.updateMS / 1000;
    this.y += this.speed.y * Config.world.updateMS / 1000;
    var cfg = Config.world.map;
    Util.clampPosition(this, 0, cfg.w, 0, cfg.h);

    // slow rotation
    this.sprite.rotation += this.cfg.rotationSpeed * Config.world.updateMS / 1000;
}

Object.defineProperties(Obstacle.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
    h: {
        get: function() { return this.sprite.height; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
});

module.exports = Obstacle;
