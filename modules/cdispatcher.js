function CDispatcher(world)
{
    this.world = world;
}

CDispatcher.prototype = {
    constructor: CDispatcher,
}

CDispatcher.prototype.onMessage = function(buffer)
{
    var message = this.world.proto.Pkg.decode(buffer);

    console.log("recv message:");
    console.log(message);

    var cmd = this.world.proto.SyncCmd;
    switch (message.cmd) {
        case cmd.SYNC_START_RES:
            console.log(message);
            break;
        default:
            console.log("invalid cmd=" + message.cmd);
            break;
    }
}

module.exports = CDispatcher;

