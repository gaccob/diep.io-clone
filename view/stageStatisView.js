(function() { "use strict";

function StageStatisView(world)
{
    this.world = world;
    this.view = null;
}

StageStatisView.prototype = {
    constructor: StageStatisView
};

StageStatisView.prototype.update = function()
{
    var content = "FPS:" + this.world.fps + " Frame:" + this.world.frame;
    if (!this.view) {
        this.view = new PIXI.Text(content, {
            fill: '#222222',
            font: '15px Open Sans',
            weight: "normal"
        });
        this.world.stage.addChild(this.view);
        this.view.x = 10;
        this.view.y = this.world.ch - 10;
    } else {
        this.view.text = content;
    }
};

module.exports = StageStatisView;

})();
