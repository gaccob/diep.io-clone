(function(){ "use strict";

var cfg = {
    yOffset: 15.0,
    font: "18px Arail",
    strokeThickness: 2.0,
    stroke: 0xf0f0f0,
    fill: 0x101010,
};

function WorldNameView(world, owner)
{
    this.world = world;
    this.owner = owner;
    this.content = null;
}

WorldNameView.prototype = {
    constructor: WorldNameView,
};

WorldNameView.prototype.updateView = function(content)
{
    if (this.content !== content) {
        this.onDie();
        this.view = new PIXI.Text(content, {
            font: cfg.font,
            fill: cfg.fill,
            stroke: cfg.stroke,
            strokeThickness: cfg.strokeThickness,
            align: 'center'
        });
        this.world.stageWorldView.addChild(this.view);
    }

    if (this.view) {
        this.view.x = this.owner.x - this.view.width / 2;
        this.view.y = this.owner.y - this.owner.radius - this.view.height - cfg.yOffset;
    }
};

WorldNameView.prototype.onDie = function()
{
    if (this.view) {
        this.view.parent.removeChild(this.view);
        this.view = null;
    }
};

module.exports = WorldNameView;

})();
