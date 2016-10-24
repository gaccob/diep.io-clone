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
}

CDispatcher.prototype.createUnit = function(u)
{
    var unit = null;
    switch (u.type) {

        case Util.unitType.tank:
            unit = new Tank(this.world,
                            u.cfgName,
                            u.motion.position,
                            null,
                            true);
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
                var weapon = unit.owner.getWeapon(u.weaponIdx);
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
            console.log("ignore unit type=" + u.type);
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
}

CDispatcher.prototype.createPlayer = function(p)
{
    var player = this.world.addPlayer(p.connid, p.name, p.vw, p.vh);
    if (p.die === false) {
        var tank = this.world.findUnit(p.id);
        if (!tank) {
            console.log("player[" + p.connid + "] tank[" + p.id + "] not found");
        } else {
            player.bindTank(tank);
        }
    }

    // self
    if (p.connid === this.world.connid) {
        console.log("player connid=" + p.connid);
        player.addControl();
    }

    return player;
}

CDispatcher.prototype.onStartRes = function(message)
{
    var err = this.world.proto.ErrCode;
    if (message.result != err.SUCCESS) {
        alert("start fail:" + message.result);
        return;
    }

    var res = message.syncStartRes;
    this.world.connid = res.connid;
    for (var i in res.units) {
        var u = res.units[i];
        var unit = this.world.findUnit(u.id);
        if (unit) {
            unit.load(u);
        } else {
            this.createUnit(u);
        }
    }
    for (var i in res.players) {
        this.createPlayer(res.players[i]);
    }
}

CDispatcher.prototype.onOperation = function(msg)
{
    var sync = msg.syncOperation;

    // self ignore
    if (sync.connid == this.world.connid) {
        return;
    }

    var player = this.world.players[sync.connid];
    if (!player) {
        console.log("player[" + client.id + "] not found");
        return;
    }

    if (player.tank) {
        player.tank.autoFire = sync.fire;
        player.tank.rotation = sync.rotation;
        player.tank.motion.setMoveDir(sync.moveDirX, sync.moveDirY);
    }
}

CDispatcher.prototype.onSyncUnits = function(msg)
{
    for (var i in msg.syncUnits.units) {
        var u = msg.syncUnits.units[i];
        var unit = this.world.findUnit(u.id);
        if (unit) {
            unit.load(u);
        } else {
            this.createUnit(u);
        }
    }
}

CDispatcher.prototype.onSyncUnitDie = function(msg)
{
    var unit = this.world.findUnit(msg.syncUnitDie.id);
    if (unit) {
        unit.die();
    }
}

CDispatcher.prototype.onSyncPlayerJoin = function(msg)
{
    this.createPlayer(msg.syncPlayerJoin.player);
}

CDispatcher.prototype.onSyncPlayerQuit = function(msg)
{
    this.world.removePlayer(msg.syncPlayerQuit.connid);
}

CDispatcher.prototype.onSyncCollision = function(msg)
{
    var sync = msg.syncCollision;

    var unit1 = this.world.findUnit(sync.u1.id);
    if (!unit1) {
        console.log("unit[" + sync.u1.id + "] not found");
    } else {
        unit1.load(sync.u1);
    }

    var unit2 = this.world.findUnit(sync.u2.id);
    if (!unit2) {
        console.log("unit[" + sync.u2.id + "] not found");
    } else {
        unit2.load(sync.u2);
    }
}

CDispatcher.prototype.onMessage = function(buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);
    console.log("recv message cmd=" + message.cmd);
    // console.log(message);

    var cmd = this.world.proto.SyncCmd;
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

        case cmd.SYNC_PLAYER_JOIN:
            this.onSyncPlayerJoin(message);
            break;

        case cmd.SYNC_PLAYER_QUIT:
            this.onSyncPlayerQuit(message);
            break;

        case cmd.SYNC_COLLISION:
            this.onSyncCollision(message);
            break;

        default:
            console.log("invalid cmd=" + message.cmd);
            break;
    }
}

module.exports = CDispatcher;

