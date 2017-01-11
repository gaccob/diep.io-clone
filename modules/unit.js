(function(){ "use strict";

var WorldHpbarView = require("../view/worldHpbarView");
var WorldNameView = require("../view/worldNameView");
var WorldObjectView = require("../view/worldObjectView");

var Motion = require("../modules/motion");
var Package = require("../package.json");
var Util = require("../modules/util");

function Unit(world, type, cfg)
{
    this.world = world;
    if (this.world.isLocal === false || this.world.started === true) {
        this.id = (++ this.world.unitBaseId);
    }
    this.type = type;
    this.cfg = cfg;
    this.motion = new Motion(this, this.cfg.velocity);

    // view
    if (world.isLocal === true) {
        this.worldView = new WorldObjectView(this);
        var player = (this.owner ? this.owner.player : this.player);
        if (player && player.connid == this.world.connid) {
            this.worldView.setSelf();
        }
        this.worldHpbarView = null;
        this.worldNameView = null;
    }

    this.rotation = 0;
    this.viewRotation = null;
    this.bulletResist = (this.cfg.bulletResist || 0);

    // bullet penetration means more hp
    if (this.type === Util.unitType.bullet) {
        this.maxHp = this.cfg.hp * (1.0 + this.owner.getBulletPenetrationAdd());
    } else {
        this.maxHp = this.cfg.hp;
    }
    this.hp = this.maxHp;
    this.hpRegen = (this.cfg.hpRegen || 0);
    this.hpRegenFrame = this.world.frame;

    var pt = this.world.proto.PropType;
    this.props = {};
    this.props[pt.PT_HEALTH_REGEN] = 0;
    this.props[pt.PT_MAX_HEALTH] = 0;
    this.props[pt.PT_BODY_DAMAGE] = 0;
    this.props[pt.PT_BULLET_SPEED] = 0;
    this.props[pt.PT_BULLET_PENETRATION] = 0;
    this.props[pt.PT_BULLET_DAMAGE] = 0;
    this.props[pt.PT_RELOAD] = 0;
    this.props[pt.PT_MOVEMENT_SPEED] = 0;

    this.exp = 0;
    this.level = 0;
    this.freeSkillPoints = 0;

    this.isDead = false;

    // private
    this._x = 0;
    this._y = 0;

    this._damage = (this.cfg.damage || 0);
}

Unit.prototype = {
    constructor: Unit,
};

Unit.prototype.addHpbarView = function(visible)
{
    if (this.world.isLocal === true) {
        if (this.worldHpbarView) {
            delete this.worldHpbarView;
        }
        this.worldHpbarView = new WorldHpbarView(this.world, this, visible);
    }
};

Unit.prototype.addNameView = function()
{
    if (this.world.isLocal === true) {
        if (this.worldNameView) {
            delete this.worldNameView;
        }
        this.worldNameView = new WorldNameView(this.world, this);
    }
};

Unit.prototype.outOfBounds = function()
{
    if (this.x <= 0 || this.x >= this.world.w
        || this.y <= 0 || this.y >= this.world.h) {
        return true;
    }
    return false;
};

Unit.prototype.takeDamage = function(caster)
{
    var dest = caster.owner ? caster.owner : caster;
    var damage = (this.type == Util.unitType.bullet ? dest.bulletResist : dest.getDamage());
    this.hp -= damage;

    if (this.hp <= 0) {
        this.die();
        if (dest.type === Util.unitType.tank) {
            dest.addExp(this.cfg.killExp || 0);
        }
    }

    if (dest.type === Util.unitType.tank) {
        dest.setFightStatus();
    }
};

Unit.prototype.setFightStatus = function()
{
    this.fightFrame = this.world.frame;
};

Unit.prototype.getFightStatus = function()
{
    if (this.fightFrame) {
        return this.world.frame - this.fightFrame > Package.app.world.frame * 5;
    }
    return false;
};

Unit.prototype.addExp = function(exp)
{
    if (exp < 0) {
        Util.logError("cant add exp=" + exp);
        return;
    }

    this.exp += exp;

    var cfg = this.world.cfg.configLevelUp;
    var oldLevel = this.level;
    var level = this.level + 1;
    while (cfg[level] && this.exp > cfg[level].exp) {
        this.freeSkillPoints += cfg[level].skillPoint;
        this.level = level ++;
    }

    Util.logTrace("frame[" + this.world.frame + "]"
        + " unit[" + this.id + "] "
        + " exp " + (this.exp - exp) + "->" + this.exp
        + " level " + oldLevel + "->" + this.level
        + " freeSkillPoint=" + this.freeSkillPoints);
};

Unit.prototype.die = function()
{
    this.isDead = true;

    if (this.worldHpbarView) {
        this.worldHpbarView.onDie();
    }

    if (this.worldNameView) {
        this.worldNameView.onDie();
    }

    if (this.worldView) {
        this.worldView.onDie();
    }

    this.world.removeUnit(this);
};

Unit.prototype.getDamage = function()
{
    if (this.type == Util.unitType.bullet) {
        var add = this.owner.getBulletDamageAdd();
        return this._damage * (1.0 + add);
    }
    return this._damage;
};

Unit.prototype.update = function()
{
    if (this.isDead === true) {
        return;
    }

    var oldX = this.x;
    var oldY = this.y;

    var deltaMS = 1000.0 / Package.app.world.frame;
    this.motion.update(deltaMS);
    this.world.updateUnitGrid(this, {x: oldX, y: oldY});

    if (this.hpRegen > 0) {
        var hpRegenTime = (this.world.frame - this.hpRegenFrame) * deltaMS;
        this.hp += this.hpRegen * this.maxHp * hpRegenTime / 1000;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        this.hpRegenFrame = this.world.frame;
    }
};

Unit.prototype.updateView = function()
{
    if (this.isDead === true) {
        return;
    }
    if (this.worldView) {
        this.worldView.updateView();
    }
    if (this.worldHpbarView) {
        this.worldHpbarView.updateView(this.hp / this.maxHp);
    }
    if (this.worldNameView && this.player) {
        this.worldNameView.updateView(this.player.name);
    }
};

Unit.prototype.dump = function()
{
    var u = new this.world.proto.Unit();
    u.id = this.id;
    u.type = this.type;
    u.cfgId = this.cfg.id;
    u.hp = this.hp;

    if (this.type == Util.unitType.bullet) {
        u.ownerid = this.owner.id;
        u.bornFrame = Math.floor(this.bornFrame);
        u.weaponIdx = this.weaponIdx;
    }

    if (this.type == Util.unitType.tank) {
        u.playerConnid = this.player ? this.player.connid : "";
        u.autoFire = this.autoFire;
        u.weaponFireFrame = [];
        for (var i in this.weapons) {
            u.weaponFireFrame.push(this.weapons[i].fireFrame);
        }
    }

    u.rotation = this.rotation;
    u.motion = new this.world.proto.Motion();
    u.motion.forceAngle = this.motion.forceAngle;
    u.motion.force = this.motion.force;
    u.motion.iv = new this.world.proto.Vector(this.motion.iv.x, this.motion.iv.y);
    u.motion.ev = new this.world.proto.Vector(this.motion.ev.x, this.motion.ev.y);
    u.motion.position = new this.world.proto.Vector(this.x, this.y);
    return u;
};

Unit.prototype.load = function(u)
{
    this.id = u.id;
    this.x = u.motion.position.x;
    this.y = u.motion.position.y;
    this.hp = u.hp;
    this.rotation = u.rotation;
    this.motion.iv.x = u.motion.iv.x;
    this.motion.iv.y = u.motion.iv.y;
    this.motion.ev.x = u.motion.ev.x;
    this.motion.ev.y = u.motion.ev.y;
    this.motion.forceAngle = u.motion.forceAngle;
    this.motion.force = u.motion.force;

    if (this.type == Util.unitType.bullet) {
        this.bornFrame = u.bornFrame;
        var weapon = this.owner.getWeaponByIdx(u.weaponIdx);
        weapon.fireBullet(this);
    }

    if (this.type == Util.unitType.tank) {
        this.autoFire = u.autoFire;
        var idx = 0;
        for (var i in this.weapons) {
            this.weapons[i].fireFrame = u.weaponFireFrame[idx++];
        }
    }
};

Unit.prototype.addProp = function(type)
{
    var pt = this.world.proto.PropType;

    // add prop
    if (this.props[type] === undefined) {
        Util.logError("prop[" + type + "] not found");
        return false;
    }

    // check add value
    var points = this.props[type];
    var typeStr = Util.propTypeToString(type, pt);
    var addValue = this.world.cfg.configPropAdd[typeStr][points + 1];
    if (addValue === undefined) {
        Util.logError("prop[" + type + "] points=" + (points + 1) + " invalid ignore");
        return true;
    }

    // add value
    ++ this.props[type];
    points = this.props[type];
    Util.logDebug("frame[" + this.world.frame + "] unit[" + this.id
        + "] prop[" + type + "]=" + points + " add=" + addValue);

    // hp regen
    if (type == pt.PT_HEALTH_REGEN) {
        this.hpRegen = this.cfg.hpRegen * (1.0 + addValue);
    }
    // max hp
    else if (type == pt.PT_MAX_HEALTH) {
        var oldMaxHp = this.maxHp;
        this.maxHp = this.cfg.hp * (1.0 + addValue);
        this.hp = this.hp * this.maxHp / oldMaxHp;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }
    // body damage
    else if (type == pt.PT_BODY_DAMAGE) {
        if (this.cfg.damage) {
            this._damage = this.cfg.damage * (1.0 + addValue);
        } else {
            Util.logError("unit[" + this.cfg.alias + "] no damage config");
        }
    }
    // movement speed
    else if (type == pt.PT_MOVEMENT_SPEED) {
        this.motion.ivAdd = addValue;
    }

    return true;
};

Unit.prototype.getBulletSpeedAdd = function()
{
    return this.getPropAdd(this.world.proto.PropType.PT_BULLET_SPEED);
};

Unit.prototype.getBulletDamageAdd = function()
{
    return this.getPropAdd(this.world.proto.PropType.PT_BULLET_DAMAGE);
};

Unit.prototype.getReloadAdd = function()
{
    return this.getPropAdd(this.world.proto.PropType.RELOAD);
};

Unit.prototype.getBulletPenetrationAdd = function()
{
    return this.getPropAdd(this.world.proto.PropType.PT_BULLET_PENETRATION);
};

Unit.prototype.getPropAdd = function(type)
{
    var value = this.props[type];
    if (value > 0) {
        var typeStr = Util.propTypeToString(type, this.world.proto.PropType);
        return this.world.cfg.configPropAdd[typeStr][value];
    }
    return 0;
};

Unit.prototype.toString = function()
{
    return "Unit[" + this.id + "] frame=" + this.world.frame + " hp=" + this.hp
        + " position[" + this.x + "," + this.y + "["
        + " iv[" + this.motion.iv.x + "," + this.motion.iv.y + "]"
        + " ev[" + this.motion.ev.x + "," + this.motion.ev.y + "]"
        + " force[" + this.motion.force + "," + this.motion.forceAngle + "]";
};

Object.defineProperties(Unit.prototype, {
    radius: {
        get: function() { return this.cfg.radius; }
    },
    m: {
        get: function() { return this.radius * this.radius * this.cfg.density; }
    },
    x: {
        get: function() { return this._x; },
        set: function(v) { this._x = v; }
    },
    y: {
        get: function() { return this._y; },
        set: function(v) { this._y = v; }
    },
});

module.exports = Unit;

})();
