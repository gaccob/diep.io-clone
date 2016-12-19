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

function adaptView(mainView)
{
    var canvas = document.getElementById("canvas");
    var wRatio = mainView.w / mainView.world.cw;
    var hRatio = mainView.h / mainView.world.ch;
    if (wRatio < hRatio) {
        mainView.world.stage.scale.x = wRatio;
        mainView.world.stage.scale.y = wRatio;
        canvas.style.top = (mainView.h - mainView.world.ch * wRatio) / 2 + 'px';
        canvas.height = mainView.world.ch * wRatio;
    } else {
        mainView.world.stage.scale.x = hRatio;
        mainView.world.stage.scale.y = hRatio;
        canvas.style.left = (mainView.w - mainView.world.cw * hRatio) / 2 + 'px';
        canvas.width = mainView.world.cw * hRatio;
    }
}

function MainView(world)
{
    this.world = world;

    this.w = document.documentElement.clientWidth;
    this.h = document.documentElement.clientHeight - 10;

    // renderer
    this.renderer = new PIXI.CanvasRenderer(this.w, this.h, {
        antialias: true,
        roundPixels: false 
    });
    this.renderer.view.id = "canvas";
    document.body.appendChild(this.renderer.view);

    // canvas
    var canvas = document.getElementById("canvas");
    canvas.style.position = "absolute";
    canvas.style.display = "block";

    // view adapt
    adaptView(this);
    var _this = this;
    window.addEventListener('resize', function() {
        _this.w = document.documentElement.clientWidth;
        _this.h = document.documentElement.clientHeight - 10;
        _this.renderer.resize(_this.w, _this.h);
        adaptView(_this);
    });

    // view
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

    // world stage
    this.renderer.render(this.world.stage);
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
