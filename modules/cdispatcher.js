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
        alert("start fail:" + message.result);
        return;
    }

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

CDispatcher.prototype.onOperation = function(msg)
{
    var sync = msg.syncOperation;

    var player = this.world.players[sync.connid];
    if (!player) {
        Util.logError("player[" + sync.connid + "] not found");
        return;
    }

    if (player.tank) {
        // self only sync move dir
        if (sync.connid == this.world.connid) {
            player.tank.motion.setMoveDir(sync.moveDirX, sync.moveDirY);
        }
        // other player sync all
        else {
            player.tank.autoFire = sync.fire;
            player.tank.rotation = sync.rotation;
            player.tank.motion.setMoveDir(sync.moveDirX, sync.moveDirY);
        }
    }
};

CDispatcher.prototype.onSyncUnits = function(msg)
{
    for (var i in msg.syncUnits.units) {
        var u = msg.syncUnits.units[i];
        var unit = this.world.findUnit(u.id);
        if (unit) {
            unit.load(u);
        } else {
            this.createUnit(u, this.world.connid == u.playerConnid);
        }
    }
};

CDispatcher.prototype.onSyncUnitDie = function(msg)
{
    var unit = this.world.findUnit(msg.syncUnitDie.id);
    var player = this.world.getSelf();

    var lose = false;
    if (player && unit && player.tank === unit) {
        lose = true;
    }

    if (unit) {
        unit.die();
    }

    if (lose === true) {
        alert("You Lose! Click to Reborn!");
        this.world.synchronizer.syncRebornReq();
    }
};

CDispatcher.prototype.onSyncPlayer = function(msg)
{
    var netPlayer = msg.syncPlayer.player;

    var localPlayer = this.world.players[netPlayer.connid];
    if (!localPlayer) {
        localPlayer = this.world.addPlayer(netPlayer.connid,
                                           netPlayer.name,
                                           netPlayer.vw,
                                           netPlayer.vh);
    }
    localPlayer.load(netPlayer);
};

CDispatcher.prototype.onSyncPlayerQuit = function(msg)
{
    this.world.removePlayer(msg.syncPlayerQuit.connid);
};

CDispatcher.prototype.onSyncCollision = function(msg)
{
    var sync = msg.syncCollision;

    var unit1 = this.world.findUnit(sync.u1.id);
    if (unit1 && unit1.isDead === false) {
        unit1.load(sync.u1);
    }

    var unit2 = this.world.findUnit(sync.u2.id);
    if (unit2 && unit2.isDead === false) {
        unit2.load(sync.u2);
    }
};

CDispatcher.prototype.onSyncRebornRes = function(msg)
{
    if (msg.result != this.world.proto.ErrCode.SUCCESS) {
        alert("reborn result:" + msg.result);
    }
};

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

        case cmd.SYNC_OPERATION:
            this.onOperation(message);
            break;

        case cmd.SYNC_UNITS:
            this.onSyncUnits(message);
            break;

        case cmd.SYNC_UNIT_DIE:
            this.onSyncUnitDie(message);
            break;

        case cmd.SYNC_PLAYER:
            this.onSyncPlayer(message);
            break;

        case cmd.SYNC_PLAYER_QUIT:
            this.onSyncPlayerQuit(message);
            break;

        case cmd.SYNC_COLLISION:
            this.onSyncCollision(message);
            break;

        case cmd.SYNC_REBORN_RES:
            this.onSyncRebornRes(message);
            break;

        default:
            Util.logError("invalid cmd=" + message.cmd);
            break;
    }
};

module.exports = CDispatcher;

})();
