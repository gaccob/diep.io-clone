(function(){ "use strict";

var cfg = {
    lineWidth: 2,
    color: '0x373737',
    width: 30,
    height: 14,
    radius: 7,
    xPadding: 3,
    yPadding: 4,
    frontColor: [
        '0xecb690', // 237,181,142
        '0xea6bef', // 234,107,239
        '0x986bee', // 152,107,238
        '0x6c95f0', // 108,149,240
        '0xefd76b', // 239,215,107
        '0xef6c6c', // 239,108,108
        '0x98f06c', // 152,240,108
        '0x6befe9', // 107,239,233
    ],
    strokWidth: 3,
    strokColor: '0x101010',
    points: 5
};

function getPlusTexure(idx)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(cfg.lineWidth, cfg.color);
    graphics.beginFill(cfg.frontColor[idx]);
    graphics.drawRoundedRect(0, 0, cfg.width, cfg.height, cfg.radius);
    graphics.endFill();

    graphics.lineStyle(cfg.strokWidth, cfg.strokColor);
    var w = cfg.height / 2 - 2;
    graphics.moveTo(cfg.width / 2, cfg.height / 2 - w);
    graphics.lineTo(cfg.width / 2, cfg.height / 2 + w);
    graphics.moveTo(cfg.width / 2 - w, cfg.height / 2);
    graphics.lineTo(cfg.width / 2 + w, cfg.height / 2);
    return graphics.generateTexture();
}

function getProgressTexure(idx, set)
{
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(cfg.lineWidth, cfg.color);
    if (set === true) {
        graphics.beginFill(cfg.frontColor[idx]);
    } else {
        graphics.beginFill(cfg.color);
    }
    graphics.drawRect(0, 0, cfg.width, cfg.height);
    graphics.endFill();
    return graphics.generateTexture();
}

function addPropBar(container, propType)
{
    var idx = propType - 1;
    var plusSprite = new PIXI.Sprite(getPlusTexure(idx));
    plusSprite.x = cfg.points * (cfg.width + cfg.xPadding) + cfg.xPadding;
    plusSprite.y = idx * (cfg.height + cfg.yPadding);
    container.addChild(plusSprite);

    for (var i = 0; i < cfg.points; ++ i) {
        var mSprite = new PIXI.Sprite(getProgressTexure(idx, i > 2 ? false : true));
        mSprite.x = i * (cfg.width + cfg.xPadding);
        mSprite.y = plusSprite.y;
        container.addChild(mSprite);
    }

    // TODO: text
}

function PropAddUI(world)
{
    this.world = world;
    this.ui = new PIXI.Container();
    this.ui.x = 0;
    this.ui.y = this.world.viewH - (cfg.height + cfg.yPadding) * 8;

    var pt = this.world.proto.PropType;
    addPropBar(this.ui, pt.PT_HEALTH_REGEN);
    addPropBar(this.ui, pt.PT_MAX_HEALTH);
    addPropBar(this.ui, pt.PT_BODY_DAMAGE);
    addPropBar(this.ui, pt.PT_BULLET_SPEED);
    addPropBar(this.ui, pt.PT_BULLET_PENETRATION);
    addPropBar(this.ui, pt.PT_BULLET_DAMAGE);
    addPropBar(this.ui, pt.PT_RELOAD);
    addPropBar(this.ui, pt.PT_MOVEMENT_SPEED);

    this.ui.visible = false;
    this.ui.alpha = 0.7;
    this.world.stage.addChild(this.ui);
}

PropAddUI.prototype = {
    constructor: PropAddUI
};

PropAddUI.prototype.update = function()
{
    if (this.world.started === true) {
        this.ui.visible = true;
    }
};

module.exports = PropAddUI;

})();
