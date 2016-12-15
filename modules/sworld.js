(function(){ "use strict";

var Fs = require("fs");
var Http = require("http");
var IO = require("socket.io");
var Path = require("path");
var Url = require("url");

var AISpawner = require("../modules/aiSpawner");
var Package = require("../package.json");
var Recorder = require("../modules/recorder");
var SDispatcher = require("../modules/sdispatcher");
var Util = require("../modules/util");
var World = require("../modules/world");

function handleHttp(request, response)
{
    var pathname = Url.parse(request.url).pathname;
    if (pathname.slice(-1) === "/") {
        pathname = pathname + "main.html";
    }
    var realPath = Path.join("www", Path.normalize(pathname.replace(/\.\./g, "")));

    Fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("404 not found");
            response.end();
            return;
        }
        Fs.readFile(realPath, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.end(JSON.stringify(err));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.write(file, "binary");
                response.end();
            }
        });
    });
}

function SWorld()
{
    World.call(this, false);

    this.dispatcher = new SDispatcher(this);

    this.server = Http.createServer(handleHttp);
    this.server.listen(Package.app.port);

    this.recorder = new Recorder();

    this.aiSpawner = new AISpawner(this);
}

SWorld.prototype = Object.create(World.prototype);
SWorld.prototype.constructor = SWorld;

SWorld.prototype.init = function()
{
    this.socket = IO.listen(this.server);
    Util.logDebug("server listened port=" + Package.app.port);

    var world = this;
    this.socket.on('connection', function(client){
        world.dispatcher.onConnected(client);
        client.on('pkg', function(data) {
            world.dispatcher.onMessage(client, data);
        });
        client.on('disconnect', function() {
            world.dispatcher.onDisconnected(client);
        });
    });
};

SWorld.prototype.updateFrameLogic = function()
{
    World.prototype.updateFrameLogic.call(this);
    this.aiSpawner.update();
};

SWorld.prototype.update = function()
{
    if (this.started === false) {
        return;
    }

    var dateTime = new Date();
    var ms = dateTime.getTime();
    var updateMS = 1000.0 / Package.app.world.frame;
    while (ms > this.time + updateMS) {
        this.updateFrameLogic();
    }
};

module.exports = SWorld;

})();

