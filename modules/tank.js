var Config = require("../modules/config");
var HpBar = require("../modules/hpbar");
var Weapon = require("../modules/weapon");
var Util = require("../modules/util");

function tankHandleKeyDown(tank)
{
    document.body.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                tank.moveDir.y -= 1;
                if (tank.moveDir.y < -1) {
                    tank.moveDir.y = -1;
                }
                break;
            case 'd':
            case 'D':
                tank.moveDir.x += 1;
                if (tank.moveDir.x > 1) {
                    tank.moveDir.x = 1;
                }
                break;
            case 's':
            case 'S':
                tank.moveDir.y += 1;
                if (tank.moveDir.y > 1) {
                    tank.moveDir.y = 1;
                }
                break;
            case 'a':
            case 'A':
                tank.moveDir.x -= 1;
                if (tank.moveDir.x < -1) {
                    tank.moveDir.x = -1;
                }
                break;
        }
    }, false);
}

function tankHandleKeyUp(tank)
{
    document.body.addEventListener('keyup', function(e) {
        switch (e.key) {
            case 'w':
            case 'W':
                tank.moveDir.y += 1;
                if (tank.moveDir.y > 1) {
                    tank.moveDir.y = 1;
                }
                break;
            case 'd':
            case 'D':
                tank.moveDir.x -= 1;
                if (tank.moveDir.x < -1) {
                    tank.moveDir.x = -1;
                }
                break;
            case 's':
            case 'S':
                tank.moveDir.y -= 1;
                if (tank.moveDir.y < -1) {
                    tank.moveDir.y = -1;
                }
                break;
            case 'a':
            case 'A':
                tank.moveDir.x += 1;
                if (tank.moveDir.x > 1) {
                    tank.moveDir.x = 1;
                }
                break;
        }
    }, false);
}

function tankHandleMouseMove(tank)
{
    document.body.addEventListener('mousemove', function(e) {
        var targetPos = new Victor(e.x - tank.world.view.x, e.y - tank.world.view.y);
        var dir = targetPos.subtract(tank.sprite.position);
        // TODO: rotate speed
        tank.sprite.rotation = dir.angle() + Math.PI / 2;
    }, false);
}

function tankHandleMouseDown(tank) {
    document.body.addEventListener('mousedown', function(e) {
        tank.fire();
    }, false);
}

function Tank(world, name, position)
{
    this.world = world;

    this.id = Util.getId();
    this.cfg = Config.tanks[name];
    this.autoFire = true;
    this.moveDir = new Victor(0, 0);

    this.sprite = new PIXI.Container();
    this.weapons = [];
    for (var idx in this.cfg.weapons) {
        var weapon = new Weapon(world, this, this.cfg.weapons[idx]);
        this.weapons.push(weapon);
        this.sprite.addChild(weapon.sprite);
    }

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.body.color);
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
    this.radius = this.cfg.body.radius + this.cfg.edge.w;

    // event handlers:
    tankHandleKeyDown(this);
    tankHandleKeyUp(this);
    tankHandleMouseMove(this);
    tankHandleMouseDown(this);

    // hp bar
    this.hpbar = new HpBar(world, Config.hpbar, this, true);
    this.hpbar.update(0.5);
}

Tank.prototype = {}

Tank.prototype.update = function()
{
    // update tank position
    if (this.moveDir.lengthSq() > 1e-6) {
        var oldX = this.x;
        var oldY = this.y;

        var angle = this.moveDir.angle();
        var deltaY = this.cfg.speed * Math.sin(angle) * Config.world.updateMS / 1000;
        var deltaX = this.cfg.speed * Math.cos(angle) * Config.world.updateMS / 1000;
        this.x += deltaX;
        this.y += deltaY;
        var cfg = Config.world.map;
        Util.clampPosition(this, 0, cfg.w, 0, cfg.h);

        this.hpbar.x += (this.x - oldX);
        this.hpbar.y += (this.y - oldY);
    }

    // fire
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
    h: {
        get: function() { return this.sprite.height; }
    },
    w: {
        get: function() { return this.sprite.width; }
    },
});

module.exports = Tank;

