var Bullet = require("../modules/bullet");

function weaponFire()
{
    if (this.world.frame - this.fireFrame >= this.cfg.reloadFrame) {
        this.fireFrame = this.world.frame;
        var pos = this.offset.clone();
        pos.rotate(this.owner.sprite.rotation);
        pos.add(new Victor(this.owner.sprite.position.x, this.owner.sprite.position.y));
        var angle = this.owner.sprite.rotation + this.cfg.angle * Math.PI / 180 - Math.PI / 2;
        var bullet = new Bullet(this.world, pos, angle, this);
        this.world.bullets.push(bullet);
    }
}

function weaponCreateView(weapon)
{
    var sprite = weapon.owner.sprite;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(weapon.owner.cfg.edge.w, weapon.owner.cfg.edge.color);
    graphics.beginFill(weapon.cfg.color);
    graphics.drawRect(0, 0, weapon.cfg.w, weapon.cfg.h);
    graphics.endFill();

    var weaponSprite = new PIXI.Sprite(graphics.generateTexture());
    weaponSprite.anchor.x = 0.5;
    weaponSprite.anchor.y = 1.0;
    weaponSprite.rotation = weapon.cfg.angle * Math.PI / 180;
    weaponSprite.x += weapon.cfg.x;
    weaponSprite.y += weapon.cfg.y;
    sprite.addChild(weaponSprite);

    graphics.destroy();
}

function Weapon(world, tank, idx)
{
// properties:
    this.world = world;
    this.owner = tank;
    this.cfg = tank.cfg.weapons[idx];
    this.angle = this.cfg.angle;
    this.offset = new Victor(0, - this.cfg.shootOffset - this.cfg.h);
    this.offset.rotateDeg(this.cfg.angle)
               .add(new Victor(this.cfg.x, this.cfg.y));
    this.fireFrame = world.frame + this.cfg.shootDelayFrame;
    weaponCreateView(this);

// functions:
    this.fire = weaponFire;
}

module.exports = Weapon;

