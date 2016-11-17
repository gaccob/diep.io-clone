(function() { 'use strict';

var cfg = {
    id: "startWindow",
    component: "Window",
    padding: 4,
    position: { x: 10, y: 10 },
    width: 500,
    height: 300,
    layout: [1, 3],
    children: [
        {
            id: "startText",
            component: "Label",
            font: {
                size: "24px",
                color: "white",
                family: 'Skranji'
            },
            text: "Enter your name:",
            width: 200,
            height: 20,
            position: {x: 130, y: 80 }
        },
        {
            id: "startNameInput",
            component: "Input",
            font: {
                size: "28px",
                family: 'Arail'
            },
            text: "guest",
            width: 280,
            height: 50,
            position: "center"
        },
        {
            id: "startButton",
            component: "Button",
            text: "START GAME",
            width: 240,
            height: 40,
            position: "center"
        }
    ]
};

function StartUI(world)
{
    this.world = world;

    this.ui = EZGUI.create(cfg, 'metalworks');
    this.ui.x = (world.viewW - cfg.width) / 2;
    this.ui.y = (world.viewH - cfg.height) / 2;
    this.ui.visible = true;

    EZGUI.components.startButton.on('click', function() {
        var name = EZGUI.components.startNameInput.text.trim();
        if (name.length > 10) {
            name = name.substring(0, 10);
        }
        if (world.inited === false) {
            world.init();
            world.synchronizer.syncStartReq(name, world.viewW, world.viewH);
        } else {
            world.synchronizer.syncReborn(name);
        }
    });
    world.stage.addChild(this.ui);
}

StartUI.prototype = {
    constructor: StartUI
};

StartUI.prototype.update = function()
{
    var player = this.world.getSelf();
    if (!player || player.die === true) {
        this.ui.visible = true;
    } else {
        this.ui.visible = false;
    }
};

module.exports = StartUI;

})();
