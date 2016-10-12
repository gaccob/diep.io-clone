var Config = require("../modules/config");
var Weapon = require("../modules/weapon");

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
    this._world = world;
    this._cfg = Config.tanks[name];
    this._autoFire = true;
    this._moveDir = new Victor(0, 0);

    this._sprite = new PIXI.Container();
    this._weapons = [];
    for (var idx in this._cfg.weapons) {
        this._weapons.push(new Weapon(world, this, this._cfg.weapons[idx]));
    }

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(this._cfg.edge.w, this._cfg.edge.color);
    graphics.beginFill(this._cfg.body.color);
    graphics.drawCircle(0, 0, this._cfg.body.radius);
    graphics.endFill();
    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    this._sprite.addChild(bodySprite);
    graphics.destroy();

    // born position
    this._sprite.x = Config.world.map.w / 2;
    this._sprite.y = Config.world.map.h / 2;

    // event handlers:
    tankHandleKeyDown(this);
    tankHandleKeyUp(this);
    tankHandleMouseMove(this);
    tankHandleMouseDown(this);

    world.view.addChild(this._sprite);
}

Tank.prototype = {}

Tank.prototype.update = function()
{
    // update tank position
    if (this._moveDir.lengthSq() > 1e-6) {
        var angle = this._moveDir.angle();
        this.y += this.cfg.speed * Math.sin(angle);
        this.x += this.cfg.speed * Math.cos(angle);
        // clamp
        var cfg = Config.world.walkable;
        if (this.x > cfg.x + cfg.w) {
            this.x = cfg.x + cfg.w;
        }
        if (this.x < cfg.x) {
            this.x = cfg.x;
        }
        if (this.y > cfg.y + cfg.h) {
            this.y = cfg.y + cfg.h;
        }
        if (this.y < cfg.y) {
            this.y = cfg.y;
        }
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

    world: {
        get: function() { return this._world; }
    },

    cfg: {
        get: function() { return this._cfg; }
    },

    sprite: {
        get: function() { return this._sprite; }
    },

    x: {
        get: function() { return this._sprite.x; },
        set: function(v) { this._sprite.x = v; }
    },
    y: {
        get: function() { return this._sprite.y; },
        set: function(v) { this._sprite.y = v; }
    },

    autoFire: {
        get: function() { return this._autoFire; },
        set: function(v) { this._autoFire = v; }
    },

    moveDir: {
        get: function() { return this._moveDir; }
    },

    weapons: {
        get: function() { return this._weapons; }
    },
});

module.exports = Tank;

