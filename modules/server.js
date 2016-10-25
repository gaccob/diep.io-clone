var Fs = require("fs");
var Http = require("http");
var IO = require("socket.io");
var Path = require("path");
var Url = require("url");
var Protobuf = require("protobufjs");
var Victor = require("victor");

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

    this.isLocal = false;

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

ServerWorld.prototype.addUnit = function(unit)
{
    World.prototype.addUnit.call(this, unit);
    this.synchronizer.syncUnit(unit);

    // for recoil
    if (unit.type == Util.unitType.bullet) {
        this.synchronizer.syncUnit(unit.owner);
    }
}

ServerWorld.prototype.removeUnit = function(unit)
{
    World.prototype.removeUnit.call(this, unit);
    this.synchronizer.syncUnitDie(unit);
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
        this.addUnit(obstacle);
    }
}

ServerWorld.prototype.updateBullets = function()
{
    World.prototype.updateBullets.call(this);

    for (var i in this.bullets) {
        var bullet = this.bullets[i];
        if (bullet.outOfDate() || bullet.outOfBounds()) {
            bullet.die();
        }
    }
}

ServerWorld.prototype.getUnitsIn9Grids = function(x, y)
{
    var targets = [];
    var idxs = [
        (y - 1) * this.gridW + x - 1,
        (y - 1) * this.gridW + x,
        (y - 1) * this.gridW + x + 1,
        y * this.gridW + x - 1,
        y * this.gridW + x,
        y * this.gridW + x + 1,
        (y + 1) * this.gridW + x - 1,
        (y + 1) * this.gridW + x,
        (y + 1) * this.gridW + x + 1,
    ];

    var x1 = (x >= 1);
    var x2 = (x < this.gridW - 1);

    var y1 = (y >= 1);
    var y2 = (y < this.gridH - 1);

    if (y1 && x1) {
        var g = this.grids[idxs[0]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y1) {
        var g = this.grids[idxs[1]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y1 && x2) {
        var g = this.grids[idxs[2]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (x1) {
        var g = this.grids[idxs[3]];
        for (var i in g) { targets.push(g[i]); }
    }
    {
        var g = this.grids[idxs[4]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (x2) {
        var g = this.grids[idxs[5]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2 && x1) {
        var g = this.grids[idxs[6]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2) {
        var g = this.grids[idxs[7]];
        for (var i in g) { targets.push(g[i]); }
    }
    if (y2 && x2) {
        var g = this.grids[idxs[8]];
        for (var i in g) { targets.push(g[i]); }
    }
    return targets;
}

ServerWorld.prototype.needCheckCollision = function(unit, target)
{
    var u1 = (unit.owner == null ? unit : unit.owner);
    var u2 = (target.owner == null ? target : target.owner);
    return u1 != u2;
}

ServerWorld.prototype.elasticCollide = function(unit1, unit2)
{
    // Elastic collision
    // m1, v10
    // m2, v20
    // v1 = [(m1-m2)v10 + 2m2v20] / (m1+m2)
    // v2 = [(m2-m1)v20 + 2m1v10] / (m1+m2)

    var v10 = new Victor(unit1.motion.vx, unit1.motion.vy);
    var v20 = new Victor(unit2.motion.vx, unit2.motion.vy);

    var v1x = ((unit1.m - unit2.m) * v10.x + 2 * unit2.m * v20.x) / (unit1.m + unit2.m);
    var v1y = ((unit1.m - unit2.m) * v10.y + 2 * unit2.m * v20.y) / (unit1.m + unit2.m);
    unit1.motion.ev.x += v1x;
    unit1.motion.ev.y += v1y;

    var v2x = ((unit2.m - unit1.m) * v20.x + 2 * unit1.m * v10.x) / (unit1.m + unit2.m);
    var v2y = ((unit2.m - unit1.m) * v20.y + 2 * unit1.m * v10.y) / (unit1.m + unit2.m);
    unit2.motion.ev.x += v2x;
    unit2.motion.ev.y += v2y;
}

ServerWorld.prototype.simpleCollide = function(unit1, unit2, distRatio)
{
    var dir = new Victor(unit1.x - unit2.x, unit1.y - unit2.y);
    dir.norm();
    var v1 = unit1.motion.v;
    var v2 = unit2.motion.v;
    var spring1 = unit2.cfg.velocity.springBase + (1.0 - distRatio) * unit2.cfg.velocity.springAdd;
    var spring2 = unit1.cfg.velocity.springBase + (1.0 - distRatio) * unit1.cfg.velocity.springAdd;
    // console.log(unit1.motion.toString());
    // console.log(unit2.motion.toString());
    unit1.motion.ev.x += (v2 + spring1) * dir.x * unit2.m / unit1.m;
    unit1.motion.ev.y += (v2 + spring1) * dir.y * unit2.m / unit1.m;
    unit2.motion.ev.x -= (v1 + spring2) * dir.x * unit1.m / unit2.m;
    unit2.motion.ev.y -= (v1 + spring2) * dir.y * unit1.m / unit2.m;
    // console.log(unit1.motion.toString());
    // console.log(unit2.motion.toString());
}

ServerWorld.prototype.collide = function(unit1, unit2, distRatio)
{
    this.simpleCollide(unit1, unit2, distRatio);
    // console.log("unit[" + unit1.id + "] <--> unit[" + unit2.id + "] collide");
    unit1.takeDamageByUnit(unit2);
    unit2.takeDamageByUnit(unit1);
    this.synchronizer.syncCollision(unit1, unit2);
}

ServerWorld.prototype.updateCollision = function()
{
    for (var x = 0; x < this.gridW; ++ x) {
        for (var y = 0; y < this.gridH; ++ y) {

            var idx = y * this.gridW + x;
            for (var i in this.grids[idx]) {
                var unit = this.grids[idx][i];

                // avoid multi-collision
                if (unit.collideTime != null) {
                    if (this.time - unit.collideTime < this.cfg.configWorld.unitCollideCheckMS) {
                        continue;
                    }
                }

                // check collision with targets
                var targets = this.getUnitsIn9Grids(x, y);
                for (var j in targets) {
                    var target = targets[j];
                    if (unit == target) {
                        continue;
                    }
                    if (this.needCheckCollision(unit, target) === false) {
                        continue;
                    }
                    if (target.collideCheckFrame == this.frame) {
                        continue;
                    }
                    var distX = unit.x - target.x;
                    var distY = unit.y - target.y;
                    var distR = unit.radius + target.radius;
                    var dist2 = distX * distX + distY * distY;
                    if (dist2 < distR * distR) {
                        unit.collideTime = this.time;
                        target.collideTime = this.time;
                        this.collide(unit, target, dist2 / (distR * distR));
                    }
                }
                unit.collideCheckFrame = this.frame;
            }
        }
    }
}

ServerWorld.prototype.updateLogic = function()
{
    World.prototype.updateLogic.call(this);
    this.updateCollision();
}


var world = new ServerWorld();

world.start();

setInterval(function() {
    world.update();
}, 1);

