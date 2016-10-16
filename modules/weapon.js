var Bullet = require("../modules/bullet");
var Util = require("../modules/util");

function weaponCreateView(weapon)
{
}

function Weapon(world, tank, cfg)
{
    this.world = world;
    this.id = Util.getId();
    this.type = Util.unitType.weapon;
    this.owner = tank;
    this.cfg = cfg;
    this.angle = this.cfg.angle;
    this.offset = new Victor(0, - this.cfg.shootOffset - this.cfg.h);
    this.offset.rotateDeg(this.cfg.angle)
               .add(new Victor(this.cfg.x, this.cfg.y));
    this.fireFrame = world.frame + this.cfg.shootDelayFrame;

    // view
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.owner.cfg.edge.w, this.owner.cfg.edge.color);
    graphics.beginFill(this.cfg.color);
    graphics.drawRect(0, 0, this.cfg.w, this.cfg.h);
    graphics.endFill();
    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 1.0;
    this.sprite = new PIXI.Container();
    this.sprite.addChild(bodySprite);

    // rotation & position
    this.rotation = this.cfg.angle * Math.PI / 180;
    this.x += this.cfg.x;
    this.y += this.cfg.y;

    // fire animation
    this.fireAnimFrame = null;
    this.originalX = this.x;
    this.originalY = this.y;
}

Weapon.prototype = {}

Weapon.prototype.resetFireDelay = function()
{
    this.fireFrame = this.world.frame + this.cfg.shootDelayFrame;
}

Weapon.prototype.update = function()
{
    if (this.fireAnimFrame) {
        var frame = this.world.frame - this.fireAnimFrame;
        if (frame > this.cfg.fireAnimFrame) {
            this.fireAnimFrame = null;
        } else {
            var delta = Math.abs(frame / this.cfg.fireAnimFrame * 2 - 1) * this.cfg.fireAnimDistance;
            this.x = this.originalX + Math.cos(this.rotation + Math.PI / 2) * delta;
            this.y = this.originalY + Math.sin(this.rotation + Math.PI / 2) * delta;
        }
    }
}

Weapon.prototype.fire = function()
{
    if (this.world.frame - this.fireFrame >= this.cfg.reloadFrame) {

        this.fireFrame = this.world.frame;
        this.fireAnimFrame = this.world.frame;

        var pos = this.offset.clone();
        pos.rotate(this.owner.rotation);
        pos.add(new Victor(this.owner.sprite.position.x, this.owner.sprite.position.y));
        if (pos.x <= 0 || pos.y <= 0 || pos.x >= this.world.w || pos.y >= this.world.h) {
            return;
        }

        var angle = this.owner.rotation + this.cfg.angle * Math.PI / 180 - Math.PI / 2;
        var disturb = this.cfg.disturbDeg * Math.PI / 180;
        var bulletAngle = angle + (Math.random() * disturb - disturb / 2);

        var bullet = new Bullet(this.world, pos, bulletAngle, this);
        this.world.bullets[bullet.id] = bullet;

        var recoil = this.cfg.recoil / this.owner.m;
        // console.log("frame:" + this.world.frame + ", recoil:" + recoil + ","  + this.owner.motion.toString());
        this.owner.motion.addRecoil(recoil, angle);
        // console.log("frame:" + this.world.frame + "," + this.owner.motion.toString());
    }
}

Object.defineProperties(Weapon.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
    rotation: {
        get: function() { return this.sprite.rotation; },
        set: function(r) { this.sprite.rotation = r; }
    },
});

module.exports = Weapon;

