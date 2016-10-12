var Config = require("../modules/config");

var _id = 1;

function Bullet(world, position, angle, weapon)
{
    this.id = _id ++;
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
    graphics.destroy();

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
    world.view.addChild(this.sprite);
}

Bullet.prototype = {}

Bullet.prototype.update = function()
{
    // due to die
    if (this.world.time > this.bornTime + this.cfg.duration) {
        return -1;
    }
    // update bullet position
    if (this.sprite.position.x < 0
        || this.sprite.position.x > Config.world.map.w
        || this.sprite.position.y < 0
        || this.sprite.position.y > Config.world.map.h) {
        return -1;
    }
    this.sprite.position.x += this.speed * Math.cos(this.angle);
    this.sprite.position.y += this.speed * Math.sin(this.angle);
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

