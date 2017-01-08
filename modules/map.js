(function() { "use strict";

var TMX = require("tmx-parser");
var Package = require("../package.json");

function Map()
{
    var _this = this;
    TMX.parseFile("www/" + Package.app.world.map, function(err, map){
        if (err) {
            throw err;
        }
        _this.map = map;
        console.log(map);
    });
}

Map.prototype = {
    constructor: Map,
};

module.exports = Map;

})();
