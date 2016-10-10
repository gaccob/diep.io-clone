var Bullet = require("../modules/bullet");
var Config = require("../modules/config");

function weaponFire()
{
    if (this.world.frame - this.fireFrame >= this.reload) {
        this.fireFrame = this.world.frame;
        var pos = this.offset.clone();
        pos.rotate(this.owner.sprite.rotation);
        pos.add(new Victor(this.owner.sprite.position.x, this.owner.sprite.position.y));

        var dir = this.owner.sprite.rotation + this.angle * Math.PI / 180 - Math.PI / 2;
        var bullet = new Bullet(this.world, pos, dir, this.owner);
        this.world.bullets.push(bullet);
    }
}

function weaponCreateView(weapon, cfg)
{
    var sprite = weapon.owner.sprite;

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(Config.tank.edge.w, Config.tank.edge.color);
    graphics.beginFill(cfg.color);
    graphics.drawRect(0, 0, cfg.w, cfg.h);
    graphics.endFill();

    var weaponSprite = new PIXI.Sprite(graphics.generateTexture());
    weaponSprite.anchor.x = 0.5;
    weaponSprite.anchor.y = 1.0;
    weaponSprite.rotation = cfg.angle * Math.PI / 180;
    weaponSprite.x += cfg.x;
    weaponSprite.y += cfg.y;
    sprite.addChild(weaponSprite);

    graphics.destroy();
}

function Weapon(world, tank, idx)
{
// properties:
    this.world = world;
    this.owner = tank;

    var cfg = Config.tank.weapons[idx];
    this.angle = cfg.angle;
    this.offset = new Victor(0, - cfg.shootOffset - cfg.h);
    this.offset.rotateDeg(cfg.angle).add(new Victor(cfg.x, cfg.y));

    this.reload = cfg.reloadFrame;
    this.delay = cfg.shootDelayFrame;
    this.fireFrame = world.frame + this.delay;

    weaponCreateView(this, cfg);

// functions:
    this.fire = weaponFire;
}

module.exports = Weapon;
