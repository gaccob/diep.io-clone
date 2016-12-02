(function(){ "use strict";

var Victor = require("victor");
var Util = require("../modules/util");

function drawBullet(view)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(view.cfg.edge.w, view.cfg.edge.color);

    var player = view.world.getSelf();
    if (player && player.tank === view.owner.owner) {
        graphics.beginFill(view.cfg.body.playerColor);
    } else {
        graphics.beginFill(view.cfg.body.color);
    }
    graphics.drawCircle(0, 0, view.cfg.body.radius);
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    view.sprite.addChild(bodySprite);

    view.world.view.addChild(view.sprite);
}

function drawObstacle(view)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(view.cfg.edge.w, view.cfg.edge.color);
    graphics.beginFill(view.cfg.color);

    var from = new PIXI.Point(0, - view.cfg.radius);
    graphics.moveTo(from.x, from.y);
    for (var i = 1; i < view.cfg.side; ++ i) {
        var p = new Victor(from.x, from.y);
        p.rotate(Math.PI * 2 / view.cfg.side);
        graphics.lineTo(p.x, p.y);
        from.set(p.x, p.y);
    }
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.pivot.x = bodySprite.width / 2;
    bodySprite.pivot.y = view.cfg.radius + view.cfg.edge.w;
    view.sprite.addChild(bodySprite);

    view.world.view.addChild(view.sprite);
}

function drawWeapon(view)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(view.cfg.edge.w, view.cfg.edge.color);
    graphics.beginFill(view.cfg.color);
    graphics.drawRect(0, 0, view.cfg.w, view.cfg.h);
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 1.0;
    view.sprite.addChild(bodySprite);
}

function drawTank(view, me)
{
    for (var idx in view.owner.weapons) {
        var weapon = view.owner.weapons[idx];
        view.sprite.addChild(weapon.view.sprite);
    }

    var graphics = new PIXI.Graphics();
    graphics.lineStyle(view.cfg.edge.w, view.cfg.edge.color);

    if (me === true) {
        graphics.beginFill(view.cfg.body.playerColor);
    } else {
        graphics.beginFill(view.cfg.body.color);
    }
    graphics.drawCircle(0, 0, view.cfg.body.radius);
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    view.sprite.addChild(bodySprite);

    view.world.view.addChild(view.sprite);
}

function View(owner)
{
    this.owner = owner;
    this.cfg = this.owner.cfg.view;
    this.world = this.owner.world;
    this.sprite = new PIXI.Container();

    if (this.owner.type == Util.unitType.bullet) {
        drawBullet(this);
    } else if (this.owner.type == Util.unitType.obstacle) {
        drawObstacle(this);
    } else if (this.owner.type == Util.unitType.weapon) {
        drawWeapon(this);
    } else if (this.owner.type == Util.unitType.tank) {
        var me = false;
        if (this.owner.player) {
            if (this.owner.player.connid === this.world.connid) {
                me = true;
            }
        }
        drawTank(this, me);
    }
}

View.prototype = {
    constructor: View,
};

View.prototype.addNameBar = function(name)
{
    if (!this.owner.cfg.namebar) {
        Util.logError("unit type=" + this.owner.type + " has no name bar config");
        return;
    }
    if (this.nameBar) {
        this.nameBar.parent.removeChild(this.nameBar);
    }
    var cfg = this.owner.cfg.namebar;
    this.nameBar = new PIXI.Text(name, {
        font: cfg.font,
        fill: Number(cfg.fill),
        stroke: Number(cfg.stroke),
        strokeThickness: cfg.strokeThickness,
        align: 'center'
    });
    this.world.view.addChild(this.nameBar);
};

View.prototype.onDie = function()
{
    if (this.owner.type == Util.unitType.bullet
        || this.owner.type == Util.unitType.obstacle
        || this.owner.type == Util.unitType.tank) {
        this.world.dieSprites.push(this.sprite);
    }
    if (this.nameBar) {
        this.nameBar.parent.removeChild(this.nameBar);
        this.nameBar = null;
    }
};

View.prototype.update = function()
{
    this.x = this.owner.x;
    this.y = this.owner.y;
    if (this.owner.viewRotation) {
        this.rotation = this.owner.viewRotation;
    } else {
        this.rotation = this.owner.rotation;
    }

    // name bar no rotation
    if (this.nameBar) {
        this.nameBar.x = this.x - this.nameBar.width / 2;
        this.nameBar.y = this.y - this.owner.radius - this.nameBar.height - this.owner.cfg.namebar.yOffset;
    }
};

Object.defineProperties(View.prototype, {
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
    rotation: {
        get: function() { return this.sprite.rotation; },
        set: function(r) { this.sprite.rotation = r; }
    },
    scale: {
        get: function() { return this.sprite.scale; },
        set: function(s) { this.sprite.scale = s; }
    },
    visible: {
        get: function() { return this.sprite.visible; },
        set: function(v) { this.sprite.visible = v; }
    },
});

module.exports = View;

})();
