var Synchronizer = require("../modules/synchronizer");
var World = require("../modules/world");

function ServerWorld()
{
    World.call(this, false);

    this.synchronizer = new Synchronizer(this);
    this.synchronizer.registProtocol("../proto/tank.proto.json");
}

ServerWorld.prototype = Object.create(World.prototype);
ServerWorld.prototype.constructor = ServerWorld;
