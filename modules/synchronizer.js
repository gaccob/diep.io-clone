function Synchronizer(world)
{
    this.world = world;
}

Synchronizer.prototype = {
    constructor: Synchronizer,
}

Synchronizer.prototype.sendPkg = function(socket, body, cmd, broadcast)
{
    var pkg = new this.world.proto.Pkg();
    pkg.frame = this.world.frame;
    pkg.cmd = cmd;
    switch (cmd) {
        case this.world.proto.SyncCmd.SYNC_START_REQ:
            pkg.syncStartReq = body;
            break;
        case this.world.proto.SyncCmd.SYNC_UNITS:
            pkg.syncUnits = body;
            break;
        default:
            console.log("invalid cmd=" + cmd);
            return;
            break;
    }
    if (broadcast === true) {
        socket.broadcast.emit('pkg', pkg.encode().toArrayBuffer());
    } else {
        socket.emit('pkg', pkg.encode().toArrayBuffer());
    }
}

Synchronizer.prototype.syncStartReq = function(socket, name)
{
    var req = new this.world.proto.SyncStartReq();
    req.name = name;
    this.sendPkg(socket, req, this.world.proto.SyncCmd.SYNC_START_REQ);
}

Synchronizer.prototype.syncUnit = function(socket, unit)
{
    var u = new this.world.proto.Unit();
    u.id = unit.id;
    u.type = unit.type;
    u.cfgName = unit.cfg.alias;
    u.hp = unit.hp;
    u.motion = new this.world.proto.Motion();
    u.motion.moveDir = new this.world.proto.Vector(unit.motion.moveDir.x, unit.motion.moveDir.y);
    u.motion.iv = new this.world.proto.Vector(unit.motion.iv.x, unit.motion.iv.y);
    u.motion.ev = new this.world.proto.Vector(unit.motion.ev.x, unit.motion.ev.y);
    u.motion.rv = unit.motion.rv;
    u.motion.position = new this.world.proto.Vector(unit.x, unit.y);
    u.motion.rotation = unit.rotation;

    var syncUnits = new this.world.proto.SyncUnits();
    syncUnits.units = [];
    syncUnits.units.push(u);
    this.broadcastPkg(socket, syncUnits, this.world.proto.SyncCmd.SYNC_UNITS, true);
}

module.exports = Synchronizer;

