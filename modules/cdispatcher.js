(function(){ "use strict";

var Bullet = require("../modules/bullet");
var Obstacle = require("../modules/obstacle");
var Tank = require("../modules/tank");
var Util = require("../modules/util");

function CDispatcher(world)
{
    this.world = world;
}

CDispatcher.prototype = {
    constructor: CDispatcher,
};

CDispatcher.prototype.createUnit = function(u, slf)
{
    var unit = this.world.findUnit(u.id);
    if (unit) {
        alert("unit[" + u.id + "] already existed!");
        this.world.finish();
        return null;
    }

    switch (u.type) {
        case Util.unitType.tank:
            unit = new Tank(this.world,
                            u.cfgName,
                            u.motion.position,
                            null,
                            true,
                            slf);
            break;

        case Util.unitType.bullet:
            unit = new Bullet(this.world,
                              u.cfgName,
                              u.motion.position,
                              0,
                              this.world.findUnit(u.ownerid),
                              u.weaponName,
                              true);
            unit.bornTime = u.bornTime;
            if (unit.owner) {
                var weapon = unit.owner.getWeaponByName(u.weaponName);
                if (weapon) {
                    weapon.fireBullet(unit);
                }
            }
            break;

        case Util.unitType.obstacle:
            unit = new Obstacle(this.world,
                                u.cfgName,
                                u.motion.position,
                                true);
            break;

        default:
            Util.logError("ignore unit type=" + u.type);
            break;
    }

    if (unit) {
        unit.id = u.id;
        unit.motion.ev.x = u.motion.ev.x;
        unit.motion.ev.y = u.motion.ev.y;
        unit.motion.iv.x = u.motion.iv.x;
        unit.motion.iv.y = u.motion.iv.y;
        unit.motion.forceAngle = u.motion.forceAngle;
        unit.motion.force = u.motion.force;
        unit.rotation = u.rotation;
        unit.hp = u.hp;
    }
    return unit;
};

CDispatcher.prototype.onStartRes = function(message)
{
    var res = message.syncStartRes;
    var err = this.world.proto.ErrCode;

    if (message.result != err.SUCCESS) {
        Util.logError("start fail:" + message.result);
        return;
    }

    // start UI
    this.world.startUI.visible = false;

    // world
    this.world.frame = message.frame;
    this.world.unitBaseId = res.unitBaseId;
    Util.logDebug("world frame=" + message.frame + " unit base id=" + res.unitBaseId);
    this.world.connid = res.connid;
    Util.logDebug("player connid=" + res.connid);

    // world units
    var i, unit;
    for (i in res.units) {
        unit = this.createUnit(res.units[i], res.units[i].id === res.id);
        if (unit) {
            this.world.addUnit(unit);
        }
    }
    this.world.checkAddUnits();

    for (i in res.unitsToAdd) {
        unit = this.createUnit(res.unitsToAdd[i], res.unitsToAdd[i].id === res.id);
        if (unit) {
            this.world.addUnit(unit);
        }
    }

    for (i in res.players) {
        var netPlayer = res.players[i];
        var player = this.world.addPlayer(netPlayer.connid,
                                          netPlayer.name,
                                          netPlayer.vw,
                                          netPlayer.vh);
        player.load(netPlayer);
    }

    // world start run
    this.world.started = true;
};

CDispatcher.prototype.onCommanders = function(msg)
{
    if (msg.frame !== this.world.frame + this.world.step + 1) {
        alert("sync frame=" + msg.frame + " but world frame=" + this.world.frame);
        this.world.finish();
        return;
    }

    // step
    ++ this.world.step;

    // commander
    var any = false;
    for (var i in msg.syncCommanders) {
        this.world.commander.push(msg.frame, msg.syncCommanders[i]);
        any = true;
    }
    if (any === false) {
        this.world.commander.push(msg.frame);
    }
};

CDispatcher.prototype.onMessage = function(buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);
    Util.logTrace("frame[" + this.world.frame + "] recv message cmd=" + message.cmd);

    var cmd = this.world.proto.PkgCmd;

    // not start ignpre
    if (this.world.connid === null && message.cmd != cmd.SYNC_START_RES) {
        return;
    }

    // dispatcher
    switch (message.cmd) {

        case cmd.SYNC_START_RES:
            this.onStartRes(message);
            break;

        case cmd.SYNC_COMMANDERS:
            this.onCommanders(message);
            break;

        default:
            Util.logError("invalid cmd=" + message.cmd);
            break;
    }
};

module.exports = CDispatcher;

})();
