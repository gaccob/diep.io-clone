(function(){ "use strict";

var Victor = require("victor");
var Util = require("../modules/util");

function drawBullet(view)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(view.cfg.edge.w, view.cfg.edge.color);
    graphics.beginFill(view.cfg.body.color);
    graphics.drawCircle(0, 0, view.cfg.body.radius);
    graphics.endFill();

    var bodySprite = new PIXI.Sprite(graphics.generateTexture());
    graphics.destroy();
    bodySprite.anchor.x = 0.5;
    bodySprite.anchor.y = 0.5;
    view.sprite.addChild(bodySprite);

    view.world.stageWorldView.addChild(view.sprite);
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

    view.world.stageWorldView.addChild(view.sprite);
}

function drawTank(view)
{
    var tank = view.owner;
    var spriteName = tank.cfg.sprite + '.png';
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(spriteName));
    sprite.scale.x = 0.5;
    sprite.scale.y = 0.5;

    var cfg = view.world.cfg.configTanksView[spriteName];
    sprite.anchor.x = cfg.pivot.x;
    sprite.anchor.y = cfg.pivot.y;

    view.sprite.addChild(sprite);
    view.world.stageWorldView.addChild(view.sprite);
}

function WorldObjectView(owner)
{
    this.owner = owner;
    this.cfg = this.owner.cfg.view;
    this.world = this.owner.world;
    this.sprite = new PIXI.Container();

    if (this.owner.type == Util.unitType.bullet) {
        drawBullet(this);
    } else if (this.owner.type == Util.unitType.obstacle) {
        drawObstacle(this);
    } else if (this.owner.type == Util.unitType.tank) {
        drawTank(this);
    }
}

WorldObjectView.prototype = {
    constructor: WorldObjectView,
};

WorldObjectView.prototype.onDie = function()
{
    if (this.owner.type == Util.unitType.bullet
        || this.owner.type == Util.unitType.obstacle
        || this.owner.type == Util.unitType.tank) {
        this.world.dieSprites.push(this.sprite);
    }
};

WorldObjectView.prototype.updateView = function()
{
    this.x = this.owner.x;
    this.y = this.owner.y;
    if (this.owner.viewRotation) {
        this.rotation = this.owner.viewRotation;
    } else {
        this.rotation = this.owner.rotation;
    }
};

// self red->blue, blue->red
WorldObjectView.prototype.setSelf = function()
{
    var filter = new PIXI.filters.ColorMatrixFilter();
    filter.toBGR(true);
    this.sprite.filters = [filter];
};

Object.defineProperties(WorldObjectView.prototype, {
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

module.exports = WorldObjectView;

})();
