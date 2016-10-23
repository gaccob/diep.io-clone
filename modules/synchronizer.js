function Synchronizer(world)
{
    this.world = world;
    this.cmd = this.world.proto.SyncCmd;
    this.err = this.world.proto.ErrCode;
}

Synchronizer.prototype = {
    constructor: Synchronizer,
}

Synchronizer.prototype.sendPkg = function(socket, body, cmd, result, broadcast)
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
        case this.cmd.SYNC_UNITS:
            pkg.syncUnits = body;
            break;
        default:
            console.log("invalid cmd=" + cmd);
            return;
            break;
    }

    console.log("send message:");
    console.log(pkg);

    if (broadcast === true) {
        socket.broadcast.emit('pkg', pkg.encode().toArrayBuffer());
    } else {
        socket.emit('pkg', pkg.encode().toArrayBuffer());
    }
}

Synchronizer.prototype.syncStartReq = function(socket, name, viewW, viewH)
{
    var req = new this.world.proto.SyncStartReq();
    req.name = name;
    req.viewH = viewH;
    req.viewW = viewW;
    this.sendPkg(socket, req, this.cmd.SYNC_START_REQ);
}

Synchronizer.prototype.syncStartRes = function(socket, result, connid)
{
    var res = new this.world.proto.SyncStartRes();
    res.connid = connid;
    if (result == this.err.SUCCESS) {
        res.units = [];
        this.world.dumpUnits(res.units);
        res.players = [];
        this.world.dumpPlayers(res.players);
    }
    this.sendPkg(socket, res, this.cmd.SYNC_START_RES, result);
}

Synchronizer.prototype.syncUnit = function(socket, unit)
{
    var syncUnits = new this.world.proto.SyncUnits();
    syncUnits.units = [];
    syncUnits.units.push(unit.dump());
    this.broadcastPkg(socket, syncUnits, this.cmd.SYNC_UNITS, true);
}

module.exports = Synchronizer;

