var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    if (pathname.slice(-1) === "/") {
        pathname = pathname + "main.html";
    }
    var realPath = path.join("www", path.normalize(pathname.replace(/\.\./g, "")));

    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("404 not found");
            response.end();
            return;
        }
        fs.readFile(realPath, "binary", function (err, file) {
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
});

server.listen(9000);
console.log("server start port=9000");
