var IO = require('socket.io-client');
var Protobuf = require("protobufjs");

var CDispatcher = require("../modules/cdispatcher");
var Player = require("../modules/player");
var View = require("../modules/view");
var Synchronizer = require("../modules/synchronizer");
var World = require("../modules/world");
var Util = require("../modules/util");

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

function ClientWorld()
{
    World.call(this, true);

    this.stage = new PIXI.Container();

    this.view = new PIXI.Container();
    this.view.addChild(getWorldBackground(this));
    this.stage.addChild(this.view);

    this.ui = new PIXI.Container();
    this.stage.addChild(this.ui);

    this.viewW = document.documentElement.clientWidth;
    this.viewH = document.documentElement.clientHeight - 10;
    this.renderer = new PIXI.CanvasRenderer(
        this.viewW, this.viewH, {
            backgroundColor: Number(this.cfg.configMap.color),
            antialias: true,
            autoResize: true,
        });
    document.body.appendChild(this.renderer.view);

    this.player = new Player(this, this.viewW, this.viewH);
    this.player.addControl();

    this.dieSprites = [];

    var builder = Protobuf.loadJsonFile(this.cfg.configApp.proto);
    this.proto = builder.build("Tank");

    this.synchronizer = new Synchronizer(this);

    this.dispatcher = new CDispatcher(this);
}

ClientWorld.prototype = Object.create(World.prototype);
ClientWorld.prototype.constructor = ClientWorld;

ClientWorld.prototype.updateCamera = function()
{
    var x = this.player.x;
    var y = this.player.y;
    var viewCenterX = this.viewW / 2;
    var viewCenterY = this.viewH / 2;
    x = Util.clamp(x, viewCenterX, this.w - viewCenterX);
    y = Util.clamp(y, viewCenterY, this.h - viewCenterY);
    this.view.x = viewCenterX - x;
    this.view.y = viewCenterY - y;
}

ClientWorld.prototype.updateDieAnimations = function()
{
    var cfg = this.cfg.configDieAnimation.base;
    for (var i in this.dieSprites) {
        var sprite = this.dieSprites[i];
        if (sprite.alpha > cfg.alphaStart) {
            sprite.alpha = cfg.alphaStart;
        } else {
            sprite.alpha -= cfg.alphaDecrease;;
        }
        sprite.scale.x += cfg.scaleIncrease;
        sprite.scale.y += cfg.scaleIncrease;
        if (sprite.alpha < cfg.alphaEnd) {
            if (sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            this.dieSprites.splice(i, 1);
            delete sprite;
        }
    }
}

ClientWorld.prototype.updateLogic = function()
{
    World.prototype.updateLogic.call(this);
    this.updateDieAnimations();
}

ClientWorld.prototype.start = function()
{
    console.log("world start");

    this.socket = IO("ws://" + this.cfg.configApp.domain + ":" + this.cfg.configApp.port);

    this.socket.on('connect', function() {
        console.log('connected to the server!');
    });

    this.socket.on('pkg', function(data) {
        world.dispatcher.onMessage(data);
    });

    this.socket.on('disconnect', function() {
        console.log('client disconnected!');
    });

    this.synchronizer.syncStartReq(this.socket, "test", this.viewW, this.viewH);
}

ClientWorld.prototype.update = function()
{
    World.prototype.update.call(this);
    this.updateCamera();
    this.renderer.render(this.stage);
}

var world = new ClientWorld();
world.start();
function update() {
    world.update();
    requestAnimationFrame(update);
}
update();

