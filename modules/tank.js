var Config = require("../modules/config");
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

function Tank(world, name)
{
    this.world = world;
    this.cfg = Config.tanks[name];
    this.autoFire = true;
    this.moveDir = new Victor(0, 0);

    this.sprite = new PIXI.Container();
    this.weapons = [];
    for (var idx in this.cfg.weapons) {
        this.weapons.push(new Weapon(world, this, this.cfg.weapons[idx]));
    }

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this.cfg.edge.w, this.cfg.edge.color);
    graphics.beginFill(this.cfg.body.color);
    graphics.drawCircle(0, 0, this.cfg.body.radius);
    graphics.endFill();
    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    this.sprite.addChild(bodySprite);
    graphics.destroy();

    // born position
    this.sprite.x = Config.world.map.w / 2;
    this.sprite.y = Config.world.map.h / 2;

    // event handlers:
    tankHandleKeyDown(this);
    tankHandleKeyUp(this);
    tankHandleMouseMove(this);
    tankHandleMouseDown(this);

    world.view.addChild(this.sprite);
}

Tank.prototype = {}

Tank.prototype.update = function()
{
    // update tank position
    if (this.moveDir.lengthSq() > 1e-6) {
        var angle = this.moveDir.angle();
        this.y += this.cfg.speed * Math.sin(angle);
        this.x += this.cfg.speed * Math.cos(angle);
        var cfg = Config.world.walkable;
        Util.clampPosition(this, cfg.x, cfg.x + cfg.w, cfg.y, cfg.y + cfg.h);
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
});

module.exports = Tank;

