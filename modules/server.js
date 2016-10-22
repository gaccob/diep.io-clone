var Fs = require("fs");
var Http = require("http");
var IO = require("socket.io");
var Path = require("path");
var Url = require("url");
var Protobuf = require("protobufjs");

var Synchronizer = require("../modules/synchronizer");
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
    this.server.listen(9000);
    console.log("server start port=9000");

    this.socket = IO.listen(this.server);
    this.socket.on('connection', function(client){
        console.log(client.id);
        client.on('message',function(event){
            console.log('message from client!', event);
        });
        client.on('disconnect',function(){
            console.log('client disconnected');
        });
    });
    console.log("server socket listened");

    this.pb = Protobuf;

    this.synchronizer = new Synchronizer(this);
    this.synchronizer.registProtocol("./proto/tank.proto.json");
}

ServerWorld.prototype = Object.create(World.prototype);
ServerWorld.prototype.constructor = ServerWorld;

var world = new ServerWorld();
