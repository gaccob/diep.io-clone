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
    var unit = null;
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
        unit.motion.moveDir.x = u.motion.moveDir.x;
        unit.motion.moveDir.y = u.motion.moveDir.y;
        unit.rotation = u.rotation;
        unit.hp = u.hp;
        this.world.addUnit(unit);
    }
    return unit;
};

CDispatcher.prototype.onStartRes = function(message)
{
    var err = this.world.proto.ErrCode;
    if (message.result != err.SUCCESS) {
        Util.logError("start fail:" + message.result);
        return;
    }
    this.world.startUI.visible = false;

    var res = message.syncStartRes;

    this.world.connid = res.connid;
    Util.logDebug("player connid=" + res.connid);

    var i;
    for (i in res.units) {
        var u = res.units[i];
        var unit = this.world.findUnit(u.id);
        if (unit) {
            unit.load(u);
        } else {
            this.createUnit(u, u.id === res.id);
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
};

CDispatcher.prototype.onCommanders = function(msg)
{
    var any = false;
    for (var i in msg.syncCommanders) {
        this.world.commander.push(msg.frame, msg.syncCommanders[i]);
        any = true;
    }
    if (any === false) {
        this.world.commander.push(msg.frame);
    }
};

// TODO:
// CDispatcher.prototype.onSyncUnitDie = function(msg)
// {
//     var unit = this.world.findUnit(msg.syncUnitDie.id);
//     var player = this.world.getSelf();
//
//     var lose = false;
//     if (player && unit && player.tank === unit) {
//         lose = true;
//     }
//
//     if (unit) {
//         unit.die();
//     }
//
//     if (lose === true) {
//         EZGUI.components.startButton.text = "CLICK TO REBORN";
//         EZGUI.components.startNameInput.text = player.name;
//         player.resetControlDir();
//     }
// };

CDispatcher.prototype.onMessage = function(buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);
    Util.logTrace("recv message cmd=" + message.cmd);

    var cmd = this.world.proto.SyncCmd;

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
