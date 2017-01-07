(function(){ "use strict";

var Package = require("../package.json");
var Victor = require("victor");
var Util = require("../modules/util");

function adaptView(_this)
{
    var canvas = document.getElementById("canvas");
    var wRatio = _this.w / _this.world.cw;
    var hRatio = _this.h / _this.world.ch;
    if (wRatio < hRatio) {
        _this.world.stage.scale.x = wRatio;
        _this.world.stage.scale.y = wRatio;
        canvas.style.top = (_this.h - _this.world.ch * wRatio) / 2 + 'px';
        canvas.height = _this.world.ch * wRatio;
    } else {
        _this.world.stage.scale.x = hRatio;
        _this.world.stage.scale.y = hRatio;
        canvas.style.left = (_this.w - _this.world.cw * hRatio) / 2 + 'px';
        canvas.width = _this.world.cw * hRatio;
    }
}

function StageWorldView(world)
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
    var _this = this;
    adaptView(_this);
    window.addEventListener('resize', function() {
        _this.w = document.documentElement.clientWidth;
        _this.h = document.documentElement.clientHeight - 10;
        _this.renderer.resize(_this.w, _this.h);
        adaptView(_this);
    });

    // view
    this.view = new PIXI.Container();

    // background
    PIXI.loader.add('map', Package.app.world.map)
               .load(function(loader, resources) {
                    _this.map = resources.map;
                    _this.view.addChild(_this.map.tiledMap);
               });

    // stage view
    world.stage.addChild(this.view);
}

StageWorldView.prototype = {
    constructor: StageWorldView,
};

StageWorldView.prototype.update = function()
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

StageWorldView.prototype.handleMouseClick = function()
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

StageWorldView.prototype.addChild = function(sprite)
{
    this.view.addChild(sprite);
};

StageWorldView.prototype.getWorldPosition = function(screenX, screenY)
{
    var x = screenX / this.world.stage.scale.x;
    var y = screenY / this.world.stage.scale.y;
    return new Victor(x - this.view.x, y - this.view.y);
};

module.exports = StageWorldView;

})();
