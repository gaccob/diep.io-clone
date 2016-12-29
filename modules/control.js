(function() { "use strict";

function Control(world)
{
    this.world = world;
}

Control.prototype = {
    construtor: Control
};

Control.prototype.handleKeyDown = function()
{
    var world = this.world;
    document.body.style['ime-mode'] = 'disabled';
    document.body.addEventListener('keydown', function(e) {
        console.log("key pressed:" + e.keyCode);
        var player = world.getSelf();
        if (!player) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                player.operMoveUp(true);
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                player.operMoveRight(true);
                break;
            // 's' or 'S'
            case 83:
            case 115:
                player.operMoveDown(true);
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                player.operMoveLeft(true);
                break;
            // 1-8
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
                if (world.stagePropView) {
                    world.stagePropView.addProp(e.keyCode - 48);
                }
                break;
        }
    }, false);
};

Control.prototype.handleKeyUp = function()
{
    var world = this.world;
    document.body.addEventListener('keyup', function(e) {
        var player = world.getSelf();
        if (!player) {
            return;
        }
        switch (e.keyCode) {
            // 'w' or 'W'
            case 87:
            case 119:
                player.operMoveUp(false);
                break;
            // 'd' or 'D'
            case 68:
            case 100:
                player.operMoveRight(false);
                break;
            // 's' or 'S'
            case 83:
            case 115:
                player.operMoveDown(false);
                break;
            // 'a' or 'A'
            case 65:
            case 97:
                player.operMoveLeft(false);
                break;
        }
    }, false);
};

Control.prototype.handleMouseMove = function()
{
    var world = this.world;
    document.body.addEventListener('mousemove', function(e) {
        var player = world.getSelf();
        if (player) {
            player.operMove(e.offsetX, e.offsetY);
        }
    }, false);
};

Control.prototype.handleMouseClick = function()
{
    if (this.world.stageWorldView) {
        this.world.stageWorldView.handleMouseClick();
    }
};


module.exports = Control;

})();
