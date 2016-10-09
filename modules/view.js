var Config = require("../modules/config");

var View = {};

View.spawnTank = function() {
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(Config.tank.edge.w, Config.tank.edge.color);
    for (var i in Config.tank.weapons) {
        var weapon = Config.tank.weapons[i];
        graphics.beginFill(weapon.color);
        // TODO: angle
        graphics.drawRect(weapon.x, weapon.y, weapon.w, weapon.h);
    }
    graphics.beginFill(Config.tank.body.color);
    graphics.drawCircle(0, 0, Config.tank.body.radius);
    graphics.endFill();
    var tank = new PIXI.Sprite(graphics.generateTexture());
    tank.anchor.x = (Config.tank.body.radius + Config.tank.edge.w) / tank.width;
    tank.anchor.y = (weapon.h + Config.tank.edge.w) / tank.height;

    // custom property
    tank.weapons = [];
    for (var i in Config.tank.weapons) {
        var weapon = Config.tank.weapons[i];
        tank.weapons[i] = {};
        var offsetX = -weapon.w / 2 - weapon.x + weapon.shootOffsetX;
        var offsetY = -weapon.h + weapon.shootOffsetY;
        tank.weapons[i].offset = new Victor(offsetX, offsetY);
    }
    graphics.destroy();
    return tank;
}

View.spawnBullet = function() {
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(Config.bullet.edge.w, Config.bullet.edge.color);
    graphics.beginFill(Config.bullet.body.color);
    graphics.drawCircle(0, 0, Config.bullet.body.radius);
    graphics.endFill();
    var bullet = new PIXI.Sprite(graphics.generateTexture());
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    graphics.destroy();
    return bullet;
}

module.exports = View;
