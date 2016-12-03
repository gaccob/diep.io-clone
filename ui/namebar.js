(function(){ "use strict";

var cfg = {
    yOffset: 15.0,
    font: "18px Arail",
    strokeThickness: 2.0,
    stroke: 0xf0f0f0,
    fill: 0x101010,
};

function NameBar(world, owner)
{
    this.world = world;
    this.owner = owner;
    this.content = null;
}

NameBar.prototype = {
    constructor: NameBar,
};

NameBar.prototype.update = function(content)
{
    if (this.content !== content) {
        this.die();
        this.ui = new PIXI.Text(content, {
            font: cfg.font,
            fill: cfg.fill,
            stroke: cfg.stroke,
            strokeThickness: cfg.strokeThickness,
            align: 'center'
        });
        this.world.view.addChild(this.ui);
    }

    if (this.ui) {
        this.ui.x = this.owner.x - this.ui.width / 2;
        this.ui.y = this.owner.y - this.owner.radius - this.ui.height - cfg.yOffset;
    }
};

NameBar.prototype.die = function()
{
    if (this.ui) {
        this.ui.parent.removeChild(this.ui);
        this.ui = null;
    }
};

module.exports = NameBar;

})();
