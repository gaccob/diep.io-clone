(function() { "use strict";

var _assetsLoaded = false;

function WorldMapView(world)
{
    this.world = world;
    this.map = world.map;
    this.basedir = "assets/";

    this.loader = new PIXI.loaders.Loader();
    var tilesets = this.map.getTileSets();
    for (var i in tilesets) {
        var ts = tilesets[i];
        this.loader.add(ts.name, this.basedir + ts.image);
    }
    this.loader.load(function() {
        _assetsLoaded = true;
    });

    this.loaded = false;
}

WorldMapView.prototype = {
    constructor: WorldMapView
};

WorldMapView.prototype.updateView = function()
{
    if (_assetsLoaded === true && this.loaded === false && this.world.stageWorldView) {
        this.view = new PIXI.Container();
        this.initView();
        this.world.stageWorldView.addChild(this.view);
        this.loaded = true;
    }
};

WorldMapView.prototype.initView = function()
{
    this.tileTextures = {};
    var tilesets = this.map.getTileSets();
    for (var i in tilesets) {
        var ts = tilesets[i];
        var texture = PIXI.BaseTexture.fromImage(this.basedir + ts.image,
            false, PIXI.SCALE_MODES.NEAREST);
        var offset = 0;
        for (var y = ts.margin; y < ts.imageheight; y += ts.tileheight + ts.spacing) {
            for (var x = ts.margin; x < ts.imagewidth; x += ts.tilewidth + ts.spacing) {
                var gid = ts.firstgid + offset;
                this.tileTextures[gid] = {
                    "x": x,
                    "y": y,
                    "w": ts.tilewidth,
                    "h": ts.tileheight,
                    "texture": texture
                };
                ++ offset;
            }
        }
    }

    var layers = this.map.getLayers();
    for (var j in layers) {
        var layer = layers[j];
        // image layer
        if (layer.type === "imagelayer") {
            this.loadImageLayerView(layer);
        }
        // tile layer
        else if (layer.type === "tilelayer") {
            this.loadTileLayerView(layer);
        }
    }
};

WorldMapView.prototype.loadImageLayerView = function(layer)
{
    var sprite = new PIXI.Sprite.fromImage(this.basedir + layer.image);
    sprite.alpha = layer.opacity;
    sprite.x = layer.x;
    sprite.y = layer.y;
    this.view.addChild(sprite);
};

WorldMapView.prototype.loadTileLayerView = function(layer)
{
    for (var y = layer.y; y < layer.height; ++ y) {
        for (var x = layer.x; x < layer.width; ++ x) {
            var idx = y * layer.width + x;
            var gid = layer.data[idx];
            var td = this.tileTextures[gid];
            var sprite = new PIXI.Sprite(new PIXI.Texture(td.texture, new PIXI.Rectangle(td.x, td.y, td.w, td.h)));
            sprite.x = x * this.map.tilewidth;
            if (layer.offsetx) {
                sprite.x += layer.offsetx;
            }
            sprite.y = y * this.map.tileheight;
            if (layer.offsety) {
                sprite.y += layer.offsety;
            }
            sprite.alpha = layer.opacity;
            this.view.addChild(sprite);
        }
    }
};

module.exports = WorldMapView;

})();
