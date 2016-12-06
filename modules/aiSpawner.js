(function(){ "use strict";

// TODO:

function AISpawner(world)
{
    this.world = world;

    for (var i = 0; i < 8; ++ i) {
        var commander = new this.world.proto.SyncCommander();
        commander.cmd = this.world.proto.CommanderType.CT_JOIN;
        commander.connid = "AI-" + i;
        commander.join = new this.world.proto.SyncCommander.Join();
        commander.join.name = "AI-" + i;
        commander.join.viewW = 800;
        commander.join.viewH = 600;
        commander.join.ai = true;
        this.world.commander.push(this.world.frame + 1, commander);
    }
}

AISpawner.prototype = {
    constructor: AISpawner
};

AISpawner.prototype.update = function()
{
    // TODO:
};

module.exports = AISpawner;

})();
