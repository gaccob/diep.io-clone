var Config = require("../modules/config");
var View = require('../modules/view');

function bulletUpdate() {
    // update bullet position
    if (this.moveDir.lengthSq() > 1e-6) {
        var angle = this.moveDir.angle();
        this.sprite.position.x += Config.bullet.speed * Math.cos(angle);
        this.sprite.position.y += Config.bullet.speed * Math.sin(angle);
    }
}

function Bullet(stage, position, tank) {
    this.owner = tank;
    this.sprite = View.spawnBullet();
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
    this.moveDir = new Victor(0, 0);
    this.update = bulletUpdate;
    stage.addChild(this.sprite);
}

module.exports = Bullet;

