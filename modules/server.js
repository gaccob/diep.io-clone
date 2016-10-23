var Fs = require("fs");
var Http = require("http");
var IO = require("socket.io");
var Path = require("path");
var Url = require("url");
var Protobuf = require("protobufjs");

var Obstacle = require("../modules/obstacle");
var SDispatcher = require("../modules/sdispatcher");
var Synchronizer = require("../modules/synchronizer");
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

function ServerWorld()
{
    World.call(this, false);

    this.server = Http.createServer(handleHttp);
    this.server.listen(this.cfg.configApp.port);

    var builder = Protobuf.loadJsonFile("./www/" + this.cfg.configApp.proto);
    this.proto = builder.build("Tank");

    this.synchronizer = new Synchronizer(this);

    this.dispatcher = new SDispatcher(this);
}

ServerWorld.prototype = Object.create(World.prototype);
ServerWorld.prototype.constructor = ServerWorld;

ServerWorld.prototype.start = function()
{
    this.socket = IO.listen(this.server);
    console.log("server listened port=" + this.cfg.configApp.port);

    this.socket.on('connection', function(client){
        world.dispatcher.onConnected(client);

        client.on('pkg', function(data){
            world.dispatcher.onMessage(client, data);
        });

        client.on('disconnect', function(){
            world.dispatcher.onDisconnected(client);
        });
    });
}

ServerWorld.prototype.updateObstacles = function()
{
    World.prototype.updateObstacles.call(this);

    if (this.obstacleCount < this.cfg.configWorld.maxObstaclesCount) {
        var names = ["triangle", "quad", "pentagon"];
        var name = names[Math.floor((Math.random() * names.length))];
        var obstacle = new Obstacle(this, name, {
            x: Util.randomBetween(this.spawnRegion.x, this.spawnRegion.x + this.spawnRegion.w),
            y: Util.randomBetween(this.spawnRegion.y, this.spawnRegion.y + this.spawnRegion.h),
        }, this.view ? true : false);
        this.addUnits.push(obstacle);
    }
}

var world = new ServerWorld();
world.start();
setInterval(function() {
    world.update();
}, 1);

