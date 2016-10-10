var Config = require("../modules/config");

var _id = 1;

function bulletUpdate()
{
    // update bullet position
    this.sprite.position.x += this.speed * Math.cos(this.angle);
    this.sprite.position.y += this.speed * Math.sin(this.angle);
    if (this.sprite.position.x < 0
        || this.sprite.position.x > Config.world.w
        || this.sprite.position.y < 0
        || this.sprite.position.y > Config.world.h) {
        return -1;
    }
    return 0;
}

function bulletCreateView(bullet, position)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(bullet.cfg.edge.w, bullet.cfg.edge.color);
    graphics.beginFill(bullet.cfg.body.color);
    graphics.drawCircle(0, 0, bullet.cfg.body.radius);
    graphics.endFill();

    bullet.sprite = new PIXI.Sprite(graphics.generateTexture());
    bullet.sprite.anchor.x = 0.5;
    bullet.sprite.anchor.y = 0.5;
    bullet.sprite.position.x = position.x;
    bullet.sprite.position.y = position.y;

    graphics.destroy();
}

function Bullet(world, position, angle, weapon)
{
    this.id = _id ++;
    this.world = world;
    this.owner = weapon.owner;
    this.angle = angle;

    this.cfg = Config.bullets[weapon.cfg.bullet];
    this.speed = this.cfg.speed;
    bulletCreateView(this, position);

    this.update = bulletUpdate;
    world.stage.addChild(this.sprite);
}

module.exports = Bullet;

