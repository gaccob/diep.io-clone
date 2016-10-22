function Synchronizer(world)
{
    this.world = world;
}

Synchronizer.prototype = {
    constructor: Synchronizer,
}

Synchronizer.prototype.registProtocol = function(path)
{
    this.builder = this.world.pb.loadJsonFile(path);
    this.proto = this.builder.build("Tank");
}

Synchronizer.prototype.sendPkg = function(body, cmd)
{
    var pkg = new this.proto.Pkg();
    pkg.frame = this.world.frame;
    pkg.cmd = cmd;
    switch (cmd) {
        case this.proto.SyncCmd.SYNC_START_REQ:
            pkg.syncStartReq = body;
            break;
        case this.proto.SyncCmd.SYNC_UNITS:
            pkg.syncUnits = body;
            break;
        default:
            console.log("invalid cmd=" + cmd);
            return;
            break;
    }

    var buffer = pkg.encode();
    console.log(buffer.toArrayBuffer());
    // TODO: send
}

Synchronizer.prototype.syncStartReq = function(name)
{
    var req = new this.proto.SyncStartReq();
    req.name = name;
    this.sendPkg(req, this.proto.SyncCmd.SYNC_START_REQ);
}

Synchronizer.prototype.syncUnit = function(unit)
{
    var u = new this.proto.Unit();
    u.id = unit.id;
    u.type = unit.type;
    u.cfgName = unit.cfg.alias;
    u.hp = unit.hp;
    u.motion = new this.proto.Motion();
    u.motion.moveDir = new this.proto.Vector(unit.motion.moveDir.x, unit.motion.moveDir.y);
    u.motion.iv = new this.proto.Vector(unit.motion.iv.x, unit.motion.iv.y);
    u.motion.ev = new this.proto.Vector(unit.motion.ev.x, unit.motion.ev.y);
    u.motion.rv = unit.motion.rv;
    u.motion.position = new this.proto.Vector(unit.x, unit.y);
    u.motion.rotation = unit.rotation;

    var syncUnits = new this.proto.SyncUnits();
    syncUnits.units = [];
    syncUnits.units.push(u);
    this.sendPkg(syncUnits, this.proto.SyncCmd.SYNC_UNITS);
}

module.exports = Synchronizer;

