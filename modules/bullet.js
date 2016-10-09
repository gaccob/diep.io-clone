var Config = require("../modules/config");
var View = require('../modules/view');

var _id = 1;

function bulletUpdate() {
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

function Bullet(stage, position, angle, tank) {
    this.id = _id ++;
    this.owner = tank;
    this.angle = angle;
    this.sprite = View.spawnBullet();
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
    this.update = bulletUpdate;
    stage.addChild(this.sprite);
}

module.exports = Bullet;

