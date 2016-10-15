var Config = require("../modules/config");
var Motion = require("../modules/motion");
var Util = require("../modules/util");

function Bullet(world, position, angle, weapon)
{
    this.id = Util.getId();
    this.type = Util.unitType.bullet;
    this.world = world;
    this.owner = weapon.owner;
    this.bornTime = world.time;
    this.cfg = Config.bullets[weapon.cfg.bullet];
    this.hp = this.cfg.hp;
    this.damage = this.cfg.damage;
    this.motion = new Motion(this, this.cfg.speed);
    this.motion.setMoveDirByAngle(angle);

    // view
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    if (this.world.player.tank == this.owner) {
        graphics.beginFill(this.cfg.body.playerColor);
    } else {
        graphics.beginFill(this.cfg.body.color);
    }
    graphics.drawCircle(0, 0, this.cfg.body.radius);
    graphics.endFill();
    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    this.sprite = new PIXI.Container();
    this.sprite.addChild(bodySprite);
    world.view.addChild(this.sprite);

    this.x = position.x;
    this.y = position.y;
    world.addUnitToGrid(this);
}

Bullet.prototype = {}

Bullet.prototype.outOfBounds = function()
{
    if (this.x <= 0 || this.x >= this.world.w
        || this.y <= 0 || this.y >= this.world.h) {
        return true;
    }
    return false;
}

Bullet.prototype.outOfDate = function()
{
    if (this.world.time > this.bornTime + this.cfg.duration) {
        return true;
    }
    return false;
}

Bullet.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Bullet.prototype.die = function()
{
    delete this.world.bullets[this.id];
    this.world.dieSprites.push(this.sprite);
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);
}

Bullet.prototype.update = function()
{
    this.motion.update(Config.world.updateMS);
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
    radius: {
        get: function() { return this.cfg.body.radius + this.cfg.edge.w; }
    },
});

module.exports = Bullet;

