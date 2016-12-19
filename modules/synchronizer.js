(function(){ "use strict";

var Util = require("../modules/util");

function Synchronizer(world)
{
    this.world = world;
    this.cmd = this.world.proto.PkgCmd;
    this.err = this.world.proto.ErrCode;
}

Synchronizer.prototype = {
    constructor: Synchronizer,
};

Synchronizer.prototype.sendPkg = function(socket, body, cmd, result)
{
    var pkg = new this.world.proto.Pkg();
    pkg.frame = this.world.frame;
    pkg.cmd = cmd;
    if (result) {
        pkg.result = result;
    }

    switch (cmd) {
        case this.cmd.SYNC_START_REQ:
            pkg.syncStartReq = body;
            break;
        case this.cmd.SYNC_START_RES:
            pkg.syncStartRes = body;
            break;
        case this.cmd.SYNC_COMMANDERS:
            pkg.syncCommanders = body;
            break;
        default:
            Util.logError("invalid cmd=" + cmd);
            return;
    }

    if (socket) {
        socket.emit('pkg', pkg.encode().toArrayBuffer());
        Util.logTrace("send message cmd=" + pkg.cmd);
    }
};

Synchronizer.prototype.syncStartReq = function(name)
{
    var req = new this.world.proto.SyncStartReq();
    req.name = name;
    this.sendPkg(this.world.socket, req, this.cmd.SYNC_START_REQ);
};

Synchronizer.prototype.syncStartRes = function(socket, result, connid)
{
    var res = new this.world.proto.SyncStartRes();
    res.connid = connid;
    res.unitBaseId = this.world.unitBaseId;
    if (result == this.err.SUCCESS) {
        res.units = [];
        this.world.dumpUnits(res.units);
        res.unitsToAdd = [];
        this.world.dumpUnitsToAdd(res.unitsToAdd);
        res.players = [];
        this.world.dumpPlayers(res.players);
    }
    this.sendPkg(socket, res, this.cmd.SYNC_START_RES, result);
};

Synchronizer.prototype.syncReborn = function(name)
{
    var commander = new this.world.proto.SyncCommander();
    commander.cmd = this.world.proto.CommanderType.CT_REBORN;
    commander.reborn = new this.world.proto.SyncCommander.Reborn();
    commander.reborn.name = name;

    var commanders = [];
    commanders.push(commander);
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

Synchronizer.prototype.syncMove = function(angle, force)
{
    var commander = new this.world.proto.SyncCommander();
    commander.cmd = this.world.proto.CommanderType.CT_MOVE;
    commander.move = new this.world.proto.SyncCommander.Move();
    commander.move.angle = angle;
    commander.move.force = force;

    var commanders = [];
    commanders.push(commander);
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

Synchronizer.prototype.syncRotate = function(angle)
{
    var commander = new this.world.proto.SyncCommander();
    commander.cmd = this.world.proto.CommanderType.CT_ROTATE;
    commander.rotate = new this.world.proto.SyncCommander.Rotate();
    commander.rotate.angle = angle;

    var commanders = [];
    commanders.push(commander);
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

Synchronizer.prototype.syncFire = function()
{
    var commander = new this.world.proto.SyncCommander();
    commander.cmd = this.world.proto.CommanderType.CT_FIRE;

    var commanders = [];
    commanders.push(commander);
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

Synchronizer.prototype.syncAddProp = function(propType)
{
    var commander = new this.world.proto.SyncCommander();
    commander.cmd = this.world.proto.CommanderType.CT_ADD_PROP;
    commander.addProp = new this.world.proto.SyncCommander.AddProp();
    commander.addProp.propType = propType;

    var commanders = [];
    commanders.push(commander);
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

Synchronizer.prototype.syncCommanders = function(commanders)
{
    this.sendPkg(this.world.socket, commanders, this.cmd.SYNC_COMMANDERS);
};

module.exports = Synchronizer;

})();

