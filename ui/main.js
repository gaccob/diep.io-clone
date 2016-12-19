(function(){ "use strict";

var Victor = require("victor");

var Package = require("../package.json");
var Util = require("../modules/util");

function getWorldBackground(world)
{
    var cfg = Package.app.world;
    var graphics = new PIXI.Graphics();

    // background
    graphics.beginFill(cfg.color);
    graphics.drawRect(0, 0, world.w, world.h);
    graphics.endFill();

    // background spawn region
    graphics.beginFill(cfg.obstacleRegion.color);
    graphics.drawRect(world.spawnRegion.x, world.spawnRegion.y,
        world.spawnRegion.w, world.spawnRegion.h);
    graphics.endFill();

    // background grids
    graphics.lineStyle(cfg.gridEdge, Number(cfg.gridColor));
    for (var x = cfg.gridViewSize; x < world.w; x += cfg.gridViewSize) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, world.h);
    }
    for (var y = cfg.gridViewSize; y < world.h; y += cfg.gridViewSize) {
        graphics.moveTo(0, y);
        graphics.lineTo(world.w, y);
    }

    return graphics;
}

function MainView(world)
{
    this.world = world;

    var wRatio = document.documentElement.clientWidth / this.world.cw;
    var hRatio = document.documentElement.clientHeight / this.world.ch;
    if (wRatio < hRatio) {
        world.stage.scale.x = wRatio;
        world.stage.scale.y = wRatio;
    } else {
        world.stage.scale.x = hRatio;
        world.stage.scale.y = hRatio;
    }

    this.view = new PIXI.Container();
    this.view.addChild(getWorldBackground(world));
    world.stage.addChild(this.view);
}

MainView.prototype = {
    constructor: MainView,
};

MainView.prototype.update = function()
{
    // update camera
    var player = this.world.getSelf();
    if (!player) {
        return;
    }
    var x = player.x;
    var y = player.y;
    var viewCenterX = this.world.cw / 2;
    var viewCenterY = this.world.ch / 2;
    x = Util.clamp(x, viewCenterX, this.world.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, this.world.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
};

MainView.prototype.handleMouseClick = function()
{
    var world = this.world;
    this.view.interactive = true;
    this.view.on('click', function() {
        var player = world.getSelf();
        if (player) {
            player.operFire();
        }
    });
};

MainView.prototype.addChild = function(sprite)
{
    this.view.addChild(sprite);
};

MainView.prototype.getWorldPosition = function(screenX, screenY)
{
    var x = screenX / this.world.stage.scale.x;
    var y = screenY / this.world.stage.scale.y;
    return new Victor(x - this.view.x, y - this.view.y);
};

module.exports = MainView;

})();
