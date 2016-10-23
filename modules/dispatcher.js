function Dispatcher(world)
{
    this.world = world;
}

Dispatcher.prototype = {
    constructor: Dispatcher,
}

Dispatcher.prototype.onMessage = function(buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);
    var cmd = this.world.proto.SyncCmd;
    switch (message.cmd) {
        case cmd.SYNC_START_REQ:
            break;
        default:
            console.log("invalid cmd=" + message.cmd);
            break;
    }
}

module.exports = Dispatcher;

