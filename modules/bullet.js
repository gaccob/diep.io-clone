var Config = require("../modules/config");
var Util = require("../modules/util");

function Bullet(world, position, angle, weapon)
{
    this.id = Util.getId();
    this.world = world;
    this.owner = weapon.owner;
    this.angle = angle;
    this.bornTime = world.time;

    this.cfg = Config.bullets[weapon.cfg.bullet];
    this.speed = this.cfg.speed;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.body.color);
    graphics.drawCircle(0, 0, this.cfg.body.radius);
    graphics.endFill();
    this.sprite = new PIXI.Sprite(graphics.generateTexture());
    delete graphics;

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    world.view.addChild(this.sprite);

    this.x = position.x;
    this.y = position.y;
    this.radius = this.cfg.body.radius + this.cfg.edge.w;
}

Bullet.prototype = {}

Bullet.prototype.outOfBounds = function()
{
    if (this.x < 0 || this.x > Config.world.map.w
        || this.y < 0 || this.y > Config.world.map.h) {
        return true;
    }
    return false;
}

Bullet.prototype.outOfDate = function()
{
    if (this.world.time > this.bornTime + this.cfg.duration) {
        return true;
    }
    return false;
}

Bullet.prototype.update = function()
{
    var oldx = this.x;
    var oldy = this.y;
    this.x += this.speed * Math.cos(this.angle) * Config.world.updateMS / 1000;
    this.y += this.speed * Math.sin(this.angle) * Config.world.updateMS / 1000;
    return 0;
}

Object.defineProperties(Bullet.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
});

module.exports = Bullet;

