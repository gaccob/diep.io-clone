var Config = require("../modules/config");
var HpBar = require("../modules/hpbar");
var Motion = require("../modules/motion");
var Util = require("../modules/util");

function Obstacle(world, cfg, position)
{
    this.world = world;
    this.id = Util.getId();
    this.type = Util.unitType.obstacle;
    this.cfg = cfg;
    this.hp = this.cfg.hp;
    this.fullHp = this.cfg.hp;
    this.damage = this.cfg.damage;

    // view
    this.sprite = new PIXI.Container();
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.color);
    var from = new PIXI.Point(0, - this.cfg.radius);
    graphics.moveTo(from.x, from.y);
    for (var i = 1; i < this.cfg.side; ++ i) {
        var p = new Victor(from.x, from.y);
        p.rotate(Math.PI * 2 / this.cfg.side);
        graphics.lineTo(p.x, p.y);
        from.set(p.x, p.y);
        delete p;
    }
    graphics.endFill();
    delete from;
    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.pivot.x = bodySprite.width / 2;
    bodySprite.pivot.y = this.cfg.radius + this.cfg.edge.w;
    this.sprite.addChild(bodySprite);
    world.view.addChild(this.sprite);

    this.x = position.x;
    this.y = position.y;
    world.addUnitToGrid(this);

    this.motion = new Motion(this, this.cfg.moveSpeed, this.cfg.rotationSpeed);
    this.motion.randomMoveDir();
    this.hpbar = new HpBar(world, Config.hpbar, this, false);
}

Obstacle.prototype = {}

Obstacle.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Obstacle.prototype.die = function()
{
    this.hpbar.die();
    this.world.dieSprites.push(this.sprite);

    delete this.world.obstacles[this.id];
    -- this.world.obstacleCount;
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);
}

Obstacle.prototype.update = function()
{
    var oldX = this.x;
    var oldY = this.y;
    this.motion.update(Config.world.updateMS);

    this.hpbar.update(this.hp / this.fullHp);
    this.hpbar.x += (this.x - oldX);
    this.hpbar.y += (this.y - oldY);

    if (this.x < this.world.spawnRegion.x
        || this.x > this.world.spawnRegion.x + this.world.spawnRegion.w) {
        this.motion.reverseMoveDirX();
    }
    if (this.y < this.world.spawnRegion.y
        || this.y > this.world.spawnRegion.y + this.world.spawnRegion.h) {
        this.motion.reverseMoveDirY();
    }
}

Object.defineProperties(Obstacle.prototype, {
    x: {
        get: function() { return this.sprite.x; },
        set: function(v) { this.sprite.x = v; }
    },
    y: {
        get: function() { return this.sprite.y; },
        set: function(v) { this.sprite.y = v; }
    },
    radius: {
        get: function() { return this.cfg.radius + this.cfg.edge.w; }
    },
    h: {
        get: function() { return this.sprite.height; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
});

module.exports = Obstacle;
