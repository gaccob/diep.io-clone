(function() { "use strict";

function StageStatisView(world)
{
    this.world = world;

    this.view = new PIXI.Text("", {
        fill: '#222222',
        font: '15px Open Sans',
        weight: "normal"
    });
    this.world.stage.addChild(this.view);
    this.view.x = 10;
    this.view.y = this.world.ch - this.view.height - 5;
}

StageStatisView.prototype = {
    constructor: StageStatisView
};

StageStatisView.prototype.updateView = function()
{
    this.view.text = "FPS:" + this.world.fps + " Frame:" + this.world.frame;
};

module.exports = StageStatisView;

})();
