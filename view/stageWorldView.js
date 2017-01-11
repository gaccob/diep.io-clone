(function(){ "use strict";

var Victor = require("victor");
var Util = require("../modules/util");

function adaptView(_this)
{
    _this.vx = (_this.w - _this.world.cw) / 2;
    _this.vy = (_this.h - _this.world.ch) / 2;
    var canvas = document.getElementById("canvas");
    canvas.style.top = _this.vy + 'px';
    canvas.style.left = _this.vx + 'px';
}

function StageWorldView(world)
{
    this.world = world;

    this.w = document.documentElement.clientWidth;
    this.h = document.documentElement.clientHeight - 10;

    // renderer
    this.renderer = new PIXI.CanvasRenderer(this.world.cw, this.world.ch, {
        antialias: true,
        roundPixels: true
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
        adaptView(_this);
    });

    // view
    this.view = new PIXI.Container();

    // stage view
    world.stage.addChild(this.view);
}

StageWorldView.prototype = {
    constructor: StageWorldView,
};

StageWorldView.prototype.updateView = function()
{
    var player = this.world.getSelf();
    if (!player) {
        this.renderer.render(this.world.stage);
        return;
    }

    // update camera
    var x = player.x;
    var y = player.y;
    var viewCenterX = this.world.cw / 2;
    var viewCenterY = this.world.ch / 2;
    var xoffset = this.vx < 0 ? this.vx : 0;
    var yoffset = this.vy < 0 ? this.vy : 0;
    x = Util.clamp(x, viewCenterX + xoffset, this.world.w - viewCenterX - xoffset);
    y = Util.clamp(y, viewCenterY + yoffset, this.world.h - viewCenterY - yoffset);
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
