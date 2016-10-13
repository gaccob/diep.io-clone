var Bullet = require("../modules/bullet");

function weaponCreateView(weapon)
{
}

function Weapon(world, tank, cfg)
{
    this.world = world;
    this.owner = tank;
    this.cfg = cfg;
    this.angle = this.cfg.angle;
    this.offset = new Victor(0, - this.cfg.shootOffset - this.cfg.h);
    this.offset.rotateDeg(this.cfg.angle)
               .add(new Victor(this.cfg.x, this.cfg.y));
    this.fireFrame = world.frame + this.cfg.shootDelayFrame;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.owner.cfg.edge.w, this.owner.cfg.edge.color);
    graphics.beginFill(this.cfg.color);
    graphics.drawRect(0, 0, this.cfg.w, this.cfg.h);
    graphics.endFill();
    this.sprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
    this.sprite.rotation = this.cfg.angle * Math.PI / 180;
    this.sprite.x += this.cfg.x;
    this.sprite.y += this.cfg.y;
}

Weapon.prototype = {}

Weapon.prototype.fire = function()
{
    if (this.world.frame - this.fireFrame >= this.cfg.reloadFrame) {

        this.fireFrame = this.world.frame;

        var pos = this.offset.clone();
        pos.rotate(this.owner.sprite.rotation);
        pos.add(new Victor(this.owner.sprite.position.x, this.owner.sprite.position.y));
        var angle = this.owner.sprite.rotation + this.cfg.angle * Math.PI / 180 - Math.PI / 2;
        var disturb = this.cfg.disturbDeg * Math.PI / 180;
        angle += (Math.random() * disturb - disturb / 2);
        var bullet = new Bullet(this.world, pos, angle, this);
        this.world.bullets.push(bullet);
    }
}

module.exports = Weapon;

