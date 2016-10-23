var Player = require("../modules/player");

function SDispatcher(world)
{
    this.world = world;
}

SDispatcher.prototype = {
    constructor: SDispatcher,
}

SDispatcher.prototype.onConnected = function(client)
{
    console.log("add connection:" + client.id);
}

SDispatcher.prototype.onDisconnected = function(client)
{
    console.log("remove connection:" + client.id);
    this.world.removePlayer(client.id);

    // TODO: notify player quit
}

SDispatcher.prototype.onStart = function(client, msg)
{
    var err = this.world.proto.ErrCode;
    var sync = this.world.synchronizer;

    if (this.world.players[client.id] != null) {
        console.log("player[" + client.id + "] already existed");
        return sync.syncStartRes(client, err.EC_EXISTED, client.id);
    }

    if (this.world.playerCount > this.world.cfg.configApp.maxOnline) {
        console.log("world full player count=" + this.world.playerCount);
        return sync.syncStartRes(client, err.EC_FULL, client.id);
    }

    var req = msg.syncStartReq;
    this.world.addPlayer(client.id, req.name, req.viewW, req.viewH);
    sync.syncStartRes(client, err.SUCCESS, client.id);

    // TODO: notify player join
}

SDispatcher.prototype.onMessage = function(client, buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);

    console.log("recv message:");
    console.log(message);

    var cmd = this.world.proto.SyncCmd;
    switch (message.cmd) {
        case cmd.SYNC_START_REQ:
            this.onStart(client, message);
            break;
        default:
            console.log("invalid cmd=" + message.cmd);
            break;
    }
}

module.exports = SDispatcher;
