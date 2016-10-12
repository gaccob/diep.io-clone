var Bullet = require("../modules/bullet");

function weaponCreateView(weapon)
{
}

function Weapon(world, tank, cfg)
{
    this._world = world;
    this._owner = tank;
    this._cfg = cfg;
    this._angle = this._cfg.angle;
    this._offset = new Victor(0, - this._cfg.shootOffset - this._cfg.h);
    this._offset.rotateDeg(this._cfg.angle)
               .add(new Victor(this._cfg.x, this._cfg.y));
    this._fireFrame = world.frame + this._cfg.shootDelayFrame;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this._owner.cfg.edge.w, this._owner.cfg.edge.color);
    graphics.beginFill(this._cfg.color);
    graphics.drawRect(0, 0, this._cfg.w, this._cfg.h);
    graphics.endFill();
    var weaponSprite = new PIXI.Sprite(graphics.generateTexture());
    weaponSprite.anchor.x = 0.5;
    weaponSprite.anchor.y = 1.0;
    weaponSprite.rotation = this._cfg.angle * Math.PI / 180;
    weaponSprite.x += this._cfg.x;
    weaponSprite.y += this._cfg.y;
    tank.sprite.addChild(weaponSprite);
    graphics.destroy();
}

Weapon.prototype = {}

Weapon.prototype.fire = function()
{
    if (this._world.frame - this._fireFrame >= this._cfg.reloadFrame) {

        this._fireFrame = this._world.frame;

        var pos = this._offset.clone();
        pos.rotate(this._owner.sprite.rotation);
        pos.add(new Victor(this._owner.sprite.position.x, this._owner.sprite.position.y));
        var angle = this._owner.sprite.rotation + this._cfg.angle * Math.PI / 180 - Math.PI / 2;
        var bullet = new Bullet(this._world, pos, angle, this);
        this._world.bullets.push(bullet);
    }
}

Object.defineProperties(Weapon.prototype, {

    world: {
        get: function() { return this._world; }
    },

    owner: {
        get: function() { return this._owner; }
    },

    cfg: {
        get: function() { return this._cfg; }
    },

    angle: {
        get: function() { return this._angle; }
    },

    offset: {
        get: function() { return this._offset; }
    },
});

module.exports = Weapon;

