function Synchronizer(world)
{
    this.world = world;
    this.cmd = this.world.proto.SyncCmd;
    this.err = this.world.proto.ErrCode;
}

Synchronizer.prototype = {
    constructor: Synchronizer,
}

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
        case this.cmd.SYNC_UNITS:
            pkg.syncUnits = body;
            break;
        case this.cmd.SYNC_UNIT_DIE:
            pkg.syncUnitDie = body;
            break;
        case this.cmd.SYNC_PLAYER_JOIN:
            pkg.syncPlayerJoin = body;
            break;
        case this.cmd.SYNC_PLAYER_QUIT:
            pkg.syncPlayerQuit = body;
            break;
        case this.cmd.SYNC_COLLISION:
            pkg.syncCollision = body;
            break;
        case this.cmd.SYNC_OPERATION:
            pkg.syncOperation = body;
            break;
        default:
            console.log("invalid cmd=" + cmd);
            return;
    }

    socket.emit('pkg', pkg.encode().toArrayBuffer());
    // console.log("send message cmd=" + pkg.cmd);
    // console.log(pkg);
}

Synchronizer.prototype.syncStartReq = function(name, viewW, viewH)
{
    var req = new this.world.proto.SyncStartReq();
    req.name = name;
    req.viewH = viewH;
    req.viewW = viewW;
    this.sendPkg(this.world.socket, req, this.cmd.SYNC_START_REQ);
}

Synchronizer.prototype.syncStartRes = function(socket, result, connid, id)
{
    var res = new this.world.proto.SyncStartRes();
    res.connid = connid;
    res.id = id ? id : 0;
    if (result == this.err.SUCCESS) {
        res.units = [];
        this.world.dumpUnits(res.units);
        res.players = [];
        this.world.dumpPlayers(res.players);
    }
    this.sendPkg(socket, res, this.cmd.SYNC_START_RES, result);
}

Synchronizer.prototype.syncUnit = function(unit)
{
    var sync = new this.world.proto.SyncUnits();
    sync.units = [];
    sync.units.push(unit.dump());
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_UNITS);
}

Synchronizer.prototype.syncUnitDie = function(unit)
{
    var sync = new this.world.proto.SyncUnitDie();
    sync.id = unit.id;
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_UNIT_DIE);
}

Synchronizer.prototype.syncPlayerJoin = function(player)
{
    var sync = new this.world.proto.SyncPlayerJoin();
    sync.player = player.dump();
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_PLAYER_JOIN);
}

Synchronizer.prototype.syncPlayerQuit = function(connid)
{
    var sync = new this.world.proto.SyncPlayerQuit();
    sync.connid = connid;
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_PLAYER_QUIT);
}

Synchronizer.prototype.syncCollision = function(unit1, unit2)
{
    var sync = new this.world.proto.SyncCollision();
    sync.u1 = unit1.dump();
    sync.u2 = unit2.dump();
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_COLLISION);
}

Synchronizer.prototype.syncOperation = function(player, moveDir)
{
    var sync = new this.world.proto.SyncOperation();
    sync.connid = player.connid;
    if (player.tank) {
        sync.fire = player.tank.autoFire;
        sync.rotation = player.tank.rotation;
        if (moveDir) {
            sync.moveDirX = moveDir.x;
            sync.moveDirY = moveDir.y;
        } else {
            sync.moveDirX = player.tank.motion.moveDir.x;
            sync.moveDirY = player.tank.motion.moveDir.y;
        }
    }
    this.sendPkg(this.world.socket, sync, this.cmd.SYNC_OPERATION);
}

module.exports = Synchronizer;

