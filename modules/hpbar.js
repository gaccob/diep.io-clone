var Util = require("../modules/util");
var View = require("../modules/view");

function HpBar(world, name, owner, display)
{
    this.world = world;
    this.type = Util.unitType.hpbar;
    this.cfg = world.cfg.configHpbar[name];
    this.owner = owner;
    this.display = display;
    this.percent = 1;
    this.view = new View(this);

    this.x = this.view.x;
    this.y = this.view.y;
    this.rotation = 0;
}

HpBar.prototype = {
    constructor: HpBar,
}

HpBar.prototype.die = function()
{
    this.view.onDie();
}

HpBar.prototype.update = function(percent)
{
    if (Math.abs(percent - 1) < 1e-6 && this.display === false) {
        this.view.visible = false;
    } else {
        this.view.visible = true;
    }

    if (this.percent != percent) {
        this.view.updateHpbar(this.percent, percent);
        this.percent = percent;
    }

    this.view.update();
}

Object.defineProperties(HpBar.prototype, {
});

module.exports = HpBar;

