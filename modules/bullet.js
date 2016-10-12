var Config = require("../modules/config");

var _id = 1;

function Bullet(world, position, angle, weapon)
{
    this._id = _id ++;
    this._world = world;
    this._owner = weapon.owner;
    this._angle = angle;

    this._cfg = Config.bullets[weapon.cfg.bullet];
    this._speed = this._cfg.speed;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this._cfg.edge.w, this._cfg.edge.color);
    graphics.beginFill(this._cfg.body.color);
    graphics.drawCircle(0, 0, this._cfg.body.radius);
    graphics.endFill();
    this._sprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();

    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 0.5;
    this._sprite.position.x = position.x;
    this._sprite.position.y = position.y;
    world.view.addChild(this._sprite);
}

Bullet.prototype = {}

Bullet.prototype.update = function()
{
    // update bullet position
    if (this._sprite.position.x < 0
        || this._sprite.position.x > Config.world.map.w
        || this._sprite.position.y < 0
        || this._sprite.position.y > Config.world.map.h) {
        return -1;
    }
    this._sprite.position.x += this._speed * Math.cos(this._angle);
    this._sprite.position.y += this._speed * Math.sin(this._angle);
    return 0;
}

Object.defineProperties(Bullet.prototype, {

    id : {
        get: function() { return this._id; }
    },

    world: {
        get: function() { return this._world; }
    },

    owner: {
        get: function() { return this._owner; }
    },

    cfg: {
        get: function() { return this._cfg; }
    },

    sprite: {
        get: function() { return this._sprite; }
    },

    speed: {
        get: function() { return this._speed; }
    },

    angle: {
        get: function() { return this._angle; }
    },

    x: {
        get: function() { return this._sprite.x; },
        set: function(v) { this._sprite.x = v; }
    },

    y: {
        get: function() { return this._sprite.y; },
        set: function(v) { this._sprite.y = v; }
    },
});

module.exports = Bullet;

