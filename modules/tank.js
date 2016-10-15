var Config = require("../modules/config");
var HpBar = require("../modules/hpbar");
var Motion = require("../modules/motion");
var Weapon = require("../modules/weapon");
var Util = require("../modules/util");

function Tank(world, name, position, player)
{
    this.world = world;
    this.id = Util.getId();
    this.type = Util.unitType.tank;
    this.cfg = Config.tanks[name];
    this.player = player;
    this.hp = this.cfg.hp;
    this.fullHp = this.cfg.hp;
    this.damage = this.cfg.damage;
    this.autoFire = true;

    // view & weapons
    this.sprite = new PIXI.Container();
    this.weapons = [];
    for (var idx in this.cfg.weapons) {
        var weapon = new Weapon(world, this, this.cfg.weapons[idx]);
        this.weapons.push(weapon);
        this.sprite.addChild(weapon.sprite);
    }
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    if (this.player) {
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
    this.sprite.addChild(bodySprite);
    world.view.addChild(this.sprite);

    this.x = position.x;
    this.y = position.y;
    world.addUnitToGrid(this);

    this.motion = new Motion(this, this.cfg.speed);
    this.hpbar = new HpBar(world, Config.hpbar, this, true);
}

Tank.prototype = {}

Tank.prototype.takeDamageByUnit = function(caster)
{
    this.hp -= caster.damage;
    if (this.hp <= 0) {
        this.die();
    }
}

Tank.prototype.die = function()
{
    this.hpbar.die();
    this.world.dieSprites.push(this.sprite);

    delete this.world.tanks[this.id];
    this.world.removeUnitFromGrid(this);
    this.world.removeUnits.push(this);

    if (this.world.player.tank == this) {
        this.world.player.tank = null;
        this.world.gameend = true;
        alert("Lose! Click To Restart!");
        this.world.player.update();
    }
}

Tank.prototype.update = function()
{
    var oldX = this.x;
    var oldY = this.y;
    this.motion.update(Config.world.updateMS);

    this.hpbar.update(this.hp / this.fullHp);
    this.hpbar.x += (this.x - oldX);
    this.hpbar.y += (this.y - oldY);

    if (this.autoFire == true) {
        this.fire();
    }
}

Tank.prototype.fire = function()
{
    for (var idx in this.weapons) {
        this.weapons[idx].fire();
    }
}

Object.defineProperties(Tank.prototype, {
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
    h: {
        get: function() { return this.sprite.height; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
    rotation: {
        get: function() { return this.sprite.rotation; },
        set: function(r) { this.sprite.rotation = r; }
    },
});

module.exports = Tank;

