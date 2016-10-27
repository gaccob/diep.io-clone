(function(){ "use strict";

function SDispatcher(world)
{
    this.world = world;
}

SDispatcher.prototype = {
    constructor: SDispatcher,
};

SDispatcher.prototype.onConnected = function(client)
{
    console.log("add connection:" + client.id);
};

SDispatcher.prototype.onDisconnected = function(client)
{
    console.log("remove connection:" + client.id);
    this.world.removePlayer(client.id);

    var sync = this.world.synchronizer;
    sync.syncPlayerQuit(client.id);
};

SDispatcher.prototype.onStart = function(client, msg)
{
    var err = this.world.proto.ErrCode;
    var sync = this.world.synchronizer;

    if (this.world.players[client.id]) {
        console.log("player[" + client.id + "] already existed");
        return sync.syncStartRes(client, err.EC_EXISTED, client.id);
    }

    if (this.world.playerCount > this.world.cfg.configApp.maxOnline) {
        console.log("world full player count=" + this.world.playerCount);
        return sync.syncStartRes(client, err.EC_FULL, client.id);
    }

    var req = msg.syncStartReq;
    var player = this.world.addPlayer(client.id, req.name, req.viewW, req.viewH);
    player.createTank();
    sync.syncStartRes(client, err.SUCCESS, client.id, player.tank.id);

    sync.syncPlayer(player);
};

// jshint unused: false
SDispatcher.prototype.onReborn = function(client, msg)
{
    var err = this.world.proto.ErrCode;
    var sync = this.world.synchronizer;

    var player = this.world.players[client.id];
    if (!player) {
        console.log("player[" + client.id + "] not found");
        return sync.syncRebornRes(client, err.EC_INVALID_PLAYER);
    }

    if (player.tank) {
        console.log("player[" + client.id + "] tank alive");
        return sync.syncRebornRes(client, err.EC_ALIVE);
    }

    player.createTank();
    sync.syncRebornRes(client, err.EC_SUCCESS, player.unit);
    sync.syncPlayer(player);
    console.log("player[" + client.id + "] reborn tank=" + player.tank.id);
};

SDispatcher.prototype.onOperation = function(client, msg)
{
    var player = this.world.players[client.id];
    if (!player) {
        console.log("player[" + client.id + "] not found");
        return;
    }

    var sync = msg.syncOperation;
    if (player.tank) {
        if (player.tank.autoFire != sync.fire) {
            player.tank.revertFireStatus();
        }
        player.tank.rotation = sync.rotation;
        player.tank.motion.setMoveDir(sync.moveDirX, sync.moveDirY);
        this.world.synchronizer.syncOperation(player);
    }
};

SDispatcher.prototype.onMessage = function(client, buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);
    // console.log("recv message cmd=" + message.cmd);
    // console.log(message);

    var cmd = this.world.proto.SyncCmd;
    switch (message.cmd) {

        case cmd.SYNC_START_REQ:
            this.onStart(client, message);
            break;

        case cmd.SYNC_OPERATION:
            this.onOperation(client, message);
            break;

        case cmd.SYNC_REBORN_REQ:
            this.onReborn(client, message);
            break;

        default:
            console.log("invalid cmd=" + message.cmd);
            break;
    }
};

module.exports = SDispatcher;

})();
