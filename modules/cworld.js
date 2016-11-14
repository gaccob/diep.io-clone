(function(){ "use strict";

var IO = require('socket.io-client');

var Package = require("../package.json");

var CDispatcher = require("../modules/cdispatcher");
var World = require("../modules/world");
var Util = require("../modules/util");

var StartUI = require("../ui/start");
var LeaderBoardUI = require("../ui/leaderBoard");


function getWorldBackground(world)
{
    var cfg = world.cfg.configMap;
    var graphics = new PIXI.Graphics();

    // background spawn region
    graphics.beginFill(cfg.obstacleRegion.color);
    graphics.drawRect(world.spawnRegion.x, world.spawnRegion.y,
        world.spawnRegion.w, world.spawnRegion.h);
    graphics.endFill();

    // background grids
    graphics.lineStyle(cfg.view.grid.edge, cfg.view.grid.color);
    for (var x = cfg.view.grid.size; x < world.w; x += cfg.view.grid.size) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, world.h);
    }
    for (var y = cfg.view.grid.size; y < world.h; y += cfg.view.grid.size) {
        graphics.moveTo(0, y);
        graphics.lineTo(world.w, y);
    }

    return graphics;
}

function CWorld()
{
    World.call(this, true);

    // renderer
    this.viewW = document.documentElement.clientWidth;
    this.viewH = document.documentElement.clientHeight - 10;
    this.renderer = new PIXI.CanvasRenderer(
        this.viewW, this.viewH, {
            backgroundColor: Number(this.cfg.configMap.color),
            antialias: true,
            autoResize: true,
        });
    document.body.appendChild(this.renderer.view);

    this.stage = new PIXI.Container();

    // main view
    this.view = new PIXI.Container();
    this.view.addChild(getWorldBackground(this));
    this.stage.addChild(this.view);

    // async load ui window
    EZGUI.renderer = this.renderer;
    var world = this;
    EZGUI.Theme.load(['assets/theme/metalworks-theme.json'], function() {
        world.startUI = new StartUI(world);
        world.leaderBoardUI = new LeaderBoardUI(world);
    });

    this.dieSprites = [];

    this.dispatcher = new CDispatcher(this);

    this.inited = false;
    this.started = false;

    // lock-step
    this.step = 0;

    // self
    this.connid = null;
}

CWorld.prototype = Object.create(World.prototype);
CWorld.prototype.constructor = CWorld;

CWorld.prototype.getSelf = function()
{
    return this.connid ?  this.players[this.connid] : null;
};

CWorld.prototype.updateUI = function()
{
    if (this.startUI) {
        this.startUI.update();
    }
    if (this.leaderBoardUI) {
        this.leaderBoardUI.update();
    }
};

CWorld.prototype.updateCamera = function()
{
    var player = this.getSelf();
    if (!player) {
        return;
    }

    var x = player.x;
    var y = player.y;
    var viewCenterX = this.viewW / 2;
    var viewCenterY = this.viewH / 2;
    x = Util.clamp(x, viewCenterX, this.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, this.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
};

CWorld.prototype.updateDieAnimations = function()
{
    var cfg = this.cfg.configDieAnimation.base;
    for (var i in this.dieSprites) {
        var sprite = this.dieSprites[i];
        if (sprite.alpha > cfg.alphaStart) {
            sprite.alpha = cfg.alphaStart;
        } else {
            sprite.alpha -= cfg.alphaDecrease;
        }
        sprite.scale.x += cfg.scaleIncrease;
        sprite.scale.y += cfg.scaleIncrease;
        if (sprite.alpha < cfg.alphaEnd) {
            if (sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            this.dieSprites.splice(i, 1);
        }
    }
};

CWorld.prototype.updateLogic = function()
{
    World.prototype.updateLogic.call(this);
    this.updateDieAnimations();
};

CWorld.prototype.init = function()
{
    Util.logDebug("world init");

    this.socket = IO("ws://" + Package.app.domain + ":" + Package.app.port);

    this.socket.on('connect', function() {
        Util.logDebug('connected to the server!');
    });

    var world = this;
    this.socket.on('pkg', function(data) {
        world.dispatcher.onMessage(data);
    });

    this.socket.on('disconnect', function() {
        Util.logDebug('client disconnected!');
    });

    this.inited = true;
};

CWorld.prototype.start = function(name)
{
    this.synchronizer.syncStartReq(name ? name : "guest", this.viewW, this.viewH);
};

CWorld.prototype.finish = function()
{
    this.socket.disconnect();
    Util.logDebug("world finish");
};

CWorld.prototype.update = function()
{
    // lock-step execute
    if (this.started === true && this.step > 0) {
        ++ this.frame;
        -- this.step;
        this.commander.execute();
        this.updateLogic();
    }

    // view
    this.updateCamera();
    this.updateUI();
    this.renderer.render(this.stage);
};

module.exports = CWorld;

})();

