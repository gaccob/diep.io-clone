(function(){ "use strict";

var IO = require('socket.io-client');

var Package = require("../package.json");

var CDispatcher = require("../modules/cdispatcher");
var World = require("../modules/world");
var Util = require("../modules/util");

var MainView = require("../view/mainView");
var TopView = require("../view/topView");
var PropAddView = require("../view/propAddView");
var StartView = require("../view/startView");
var StatisView = require("../view/statisView");

function CWorld()
{
    World.call(this, true);

    // resource loader
    this.loader = new PIXI.loaders.Loader();
    this.loader.add('tank', 'assets/tank.json');
    this.loader.once('complete', function(){
        Util.logDebug("tank resource loaded");
    });
    this.loader.load();

    // stage
    this.stage = new PIXI.Container();

    // async load view
    this.mainView = new MainView(this);
    this.startView = new StartView(this);
    this.statisView = new StatisView(this);
    this.topView = new TopView(this);
    this.propAddView = new PropAddView(this);

    this.dieSprites = [];

    this.dispatcher = new CDispatcher(this);

    this.inited = false;

    // lock-step
    this.step = 0;

    // self
    this.connid = null;

    // for fps statistic
    this.localTime = (new Date()).getTime();
    this.fps = 0;
    this.fpsAccumulate = 0;
}

CWorld.prototype = Object.create(World.prototype);
CWorld.prototype.constructor = CWorld;

CWorld.prototype.getSelf = function()
{
    return this.connid ?  this.players[this.connid] : null;
};

CWorld.prototype.updateView = function()
{
    if (this.startView) {
        this.startView.update();
    }
    if (this.topView) {
        this.topView.update();
    }
    if (this.propAddView) {
        this.propAddView.update();
    }
    if (this.statisView) {
        this.statisView.update();
    }
    if (this.mainView) {
        this.mainView.update();
    }
};

CWorld.prototype.updateDieAnimations = function()
{
    var cfg = Package.app.dieAnimation;
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

CWorld.prototype.updateFrameLogic = function()
{
    World.prototype.updateFrameLogic.call(this);
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

CWorld.prototype.finish = function()
{
    this.socket.disconnect();
    Util.logDebug("world finish");
};

CWorld.prototype.update = function()
{
    // lock-step execute
    while (this.started === true && this.step > 0) {
        -- this.step;
        this.updateFrameLogic();
    }

    // view
    this.updateView();

    // fps statistic
    var localTime = (new Date()).getTime();
    if (localTime > this.localTime + 1000) {
        this.localTime = localTime;
        this.fps = this.fpsAccumulate;
        this.fpsAccumulate = 0;
    } else {
        ++ this.fpsAccumulate;
    }
};

CWorld.prototype.onStartNameInput = function(name)
{
    if (this.inited === false) {
        this.init();
        this.synchronizer.syncStartReq(name);
    } else {
        this.synchronizer.syncReborn(name);
    }
};

module.exports = CWorld;

})();

