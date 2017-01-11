(function() { "use strict";

var MapFile = require("../www/assets/map.json");
var Util = require("../modules/util");
var WorldMapView = require("../view/worldMapView");

function Map(world)
{
    this.world = world;
    this.mapFile = MapFile;
    this.height = this.mapFile.height;
    this.width = this.mapFile.width;
    this.tilewidth = this.mapFile.tilewidth;
    this.tileheight = this.mapFile.tileheight;

    this.tileProperties = {};
    for (var i in this.mapFile.tilesets) {
        var ts = this.mapFile.tilesets[i];
        for (var j in ts.tileproperties) {
            var gid = ts.firstgid + j;
            this.tileProperties[gid] = ts.tileproperties[j];
        }
    }

    // cache
    this.mapPropertiesCache = {};
}

Map.prototype = {
    constructor: Map,
};

Map.prototype.bindView = function()
{
    if (!this.view) {
        this.view = new WorldMapView(this.world);
    }
};

Map.prototype.update = function()
{
};

Map.prototype.updateView = function()
{
    if (this.view) {
        this.view.updateView();
    }
};

Map.prototype.getLayers = function()
{
    return this.mapFile.layers;
};

Map.prototype.getTileSets = function()
{
    return this.mapFile.tilesets;
};

Map.prototype.getTileX = function(x)
{
    return Math.floor(x / this.tilewidth);
};

Map.prototype.getTileY = function(y)
{
    return Math.floor(y / this.tileHeight);
};

Map.prototype.getTileIdx = function(x, y)
{
    var tx = this.getTileX(x);
    var ty = this.getTileY(y);
    return ty * this.height + tx;
};

Map.prototype.getTileProperty = function(x, y)
{
    // cache
    var idx = this.getTileIdx(x, y);
    if (this.mapPropertiesCache[idx]) {
        return this.mapPropertiesCache[idx];
    }

    var properties = {};
    var tx = this.getTileX(x);
    var ty = this.getTileY(y);
    for (var i in this.mapFile.layers) {
        var layer = this.mapFile.layers[i];
        if (tx < layer.x || tx >= layer.x + layer.width) {
            continue;
        }
        if (ty < layer.y || ty >= layer.y + layer.height) {
            continue;
        }
        // layer properties
        if (layer.properties) {
            for (var j in layer.properties) {
                properties[j] = layer.properties[j];
                Util.logDebug("tile[" + tx + "," + ty + "] prop[" + j + "]=" + properties[j]);
            }
        }
        // tile properties
        if (layer.type != "tilelayer") {
            continue;
        }
        var lidx = (ty - layer.y) * layer.height + (tx - layer.x);
        var gid = layer.data[lidx];
        if (this.tileProperties[gid]) {
            for (var k in this.tileProperties[gid]) {
                properties[k] = this.tileProperties[gid];
                Util.logDebug("tile[" + tx + "," + ty + "] prop[" + k + "]=" + properties[k]);
            }
        }
    }
    this.mapPropertiesCache[idx] = properties;
    return properties;
};

module.exports = Map;

})();

