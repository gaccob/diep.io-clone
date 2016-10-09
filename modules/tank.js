var Config = require("../modules/config");
var View = require('../modules/view');

function tankHandleKeyDown(tank) {
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

function tankHandleKeyUp(tank) {
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

function tankHandleMouseMove(tank) {
    document.body.addEventListener('mousemove', function(e) {
        tank.targetPos.x = e.x;
        tank.targetPos.y = e.y;
    }, false);
}

function tankUpdate() {
    // update tank position
    if (this.moveDir.lengthSq() > 1e-6) {
        var angle = this.moveDir.angle();
        this.sprite.position.x += Config.tank.speed * Math.cos(angle);
        this.sprite.position.y += Config.tank.speed * Math.sin(angle);
    }
    // update tank weapon direction
    if (this.targetPos.lengthSq() > 1e-6) {
        var dir = this.targetPos.clone().subtract(this.sprite.position);
        this.sprite.rotation = dir.angle() + Math.PI / 2;
    }
}

// factory
function Tank(stage, isPlayer) {
    this.isPlayer = isPlayer;
    this.sprite = View.spawnTank();
    this.sprite.position.x = Config.world.w / 2;
    this.sprite.position.y = Config.world.h / 2;
    this.moveDir = new Victor(0, 0);
    this.targetPos = new Victor(0, 0);
    this.update = tankUpdate;
    if (isPlayer == true) {
        tankHandleKeyDown(this);
        tankHandleKeyUp(this);
        tankHandleMouseMove(this);
    }
    stage.addChild(this.sprite);
}

module.exports = Tank;

