var Config = require("../modules/config");

var _id = 1;

function bulletUpdate()
{
    // update bullet position
    this.sprite.position.x += Config.bullet.speed * Math.cos(this.angle);
    this.sprite.position.y += Config.bullet.speed * Math.sin(this.angle);
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
    graphics.lineStyle(Config.bullet.edge.w, Config.bullet.edge.color);
    graphics.beginFill(Config.bullet.body.color);
    graphics.drawCircle(0, 0, Config.bullet.body.radius);
    graphics.endFill();

    bullet.sprite = new PIXI.Sprite(graphics.generateTexture());
    bullet.sprite.anchor.x = 0.5;
    bullet.sprite.anchor.y = 0.5;
    bullet.sprite.position.x = position.x;
    bullet.sprite.position.y = position.y;

    graphics.destroy();
}

function Bullet(world, position, angle, tank)
{
    this.id = _id ++;
    this.world = world;
    this.owner = tank;
    this.angle = angle;

    bulletCreateView(this, position);

    this.update = bulletUpdate;
    world.stage.addChild(this.sprite);
}

module.exports = Bullet;

