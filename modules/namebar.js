(function(){ "use strict";

var Util = require("../modules/util");
var View = require("../modules/view");

function NameBar(world, name, owner)
{
    this.world = world;
    this.type = Util.unitType.namebar;
    this.cfg = {
        view: {
            font: '60px Arail',
            fill: 0xe0e0e0,
            align: 'center',
            fontWeight: 'bold'
        }
    };
    this.name = name;
    this.owner = owner;
    this.isDead = false;

    this.view = new View(this);
    this.x = this.view.x;
    this.y = this.view.y;
}

NameBar.prototype = {
    constructor: NameBar,
};

NameBar.prototype.die = function()
{
    this.view.onDie();
    this.isDead = true;
};

NameBar.prototype.update = function()
{
    this.view.update();
};

Object.defineProperties(NameBar.prototype, {
});

module.exports = NameBar;

})();
