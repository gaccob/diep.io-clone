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
        tank.targetPos.x = e.x;
        tank.targetPos.y = e.y;
    }, false);
}

function tankHandleMouseDown(tank) {
    document.body.addEventListener('mousedown', function(e) {
        tank.fire();
    }, false);
}

function tankUpdate()
{
    // update tank position
    if (this.moveDir.lengthSq() > 1e-6) {
        var angle = this.moveDir.angle();
        this.sprite.position.x += this.cfg.speed * Math.cos(angle);
        this.sprite.position.y += this.cfg.speed * Math.sin(angle);
    }
    // update tank weapon direction
    if (this.targetPos.lengthSq() > 1e-6) {
        var dir = this.targetPos.clone().subtract(this.sprite.position);
        this.sprite.rotation = dir.angle() + Math.PI / 2;
    }
    // fire
    if (this.autoFire == true) {
        this.fire();
    }
}

function tankFire()
{
    for (var idx in this.weapons) {
        this.weapons[idx].fire();
    }
}

function tankCreateView(tank)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(tank.cfg.edge.w, tank.cfg.edge.color);
    graphics.beginFill(tank.cfg.body.color);
    graphics.drawCircle(0, 0, tank.cfg.body.radius);
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    tank.sprite.addChild(bodySprite);

    graphics.destroy();
}

function Tank(world, name, isPlayer)
{
// properties:
    this.world = world;
    this.isPlayer = isPlayer;
    this.autoFire = true;
    this.moveDir = new Victor(0, 0);
    this.targetPos = new Victor(0, 0);
    this.cfg = Config.tanks[name];

    this.sprite = new PIXI.Container();
    this.weapons = [];
    for (var idx in this.cfg.weapons) {
        this.weapons.push(new Weapon(world, this, idx));
    }
    tankCreateView(this);
    this.sprite.position.x = Config.world.w / 2;
    this.sprite.position.y = Config.world.h / 2;

// functions:
    this.update = tankUpdate;
    this.fire = tankFire;

// event handlers:
    if (isPlayer == true) {
        tankHandleKeyDown(this);
        tankHandleKeyUp(this);
        tankHandleMouseMove(this);
        tankHandleMouseDown(this);
    }

    world.stage.addChild(this.sprite);
}

module.exports = Tank;

