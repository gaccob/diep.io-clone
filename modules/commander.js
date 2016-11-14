(function() { "use strict";

var Util = require("../modules/util");

function Commander(world)
{
    this.world = world;
    this.commanders = {};
}

Commander.prototype = {
    constructor: Commander
};

Commander.prototype.push = function(frame, commander)
{
    if (!frame || frame < this.world.frame) {
        return;
    }
    if (!this.commanders[frame]) {
        this.commanders[frame] = [];
    }
    if (commander) {
        this.commanders[frame].push(commander);
    }
};

Commander.prototype.exeJoin = function(commander)
{
    // update random seed
    this.world.seed = commander.connid;

    // join
    var player = this.world.players[commander.connid];
    if (player) {
        Util.logError("player[" + commander.connid + "] already existed");
        return false;
    }
    player = this.world.addPlayer(commander.connid,
        commander.join.name, commander.join.viewW, commander.join.viewH);
    if (!player) {
        return false;
    }
    player.createTank();
    return true;
};

Commander.prototype.exeQuit = function(commander)
{
    this.world.removePlayer(commander.connid);
    return true;
};

Commander.prototype.exeReborn = function(commander)
{
    var player = this.world.players[commander.connid];
    if (!player) {
        Util.logError("player[" + commander.connid + "] not found");
        return false;
    }
    if (player.tank) {
        Util.logError("player[" + commander.connid + "] tank existed");
        return false;
    }
    player.createTank();
    player.name = commander.reborn.name;
    return true;
};

Commander.prototype.exeMove = function(commander)
{
    var player = this.world.players[commander.connid];
    if (!player) {
        Util.logError("player[" + commander.connid + "] not found");
        return false;
    }
    if (!player.tank) {
        Util.logError("player[" + commander.connid + "] tank not found");
        return false;
    }
    player.tank.motion.forceAngle = commander.move.angle;
    player.tank.motion.force = commander.move.force;
    return true;
};

Commander.prototype.exeRotate = function(commander)
{
    var player = this.world.players[commander.connid];
    if (!player) {
        Util.logError("player[" + commander.connid + "] not found");
        return false;
    }
    if (!player.tank) {
        Util.logError("player[" + commander.connid + "] tank not found");
        return false;
    }
    player.tank.rotation = commander.rotate.angle;
    return true;
};

Commander.prototype.exeFire = function(commander)
{
    var player = this.world.players[commander.connid];
    if (!player) {
        Util.logError("player[" + commander.connid + "] not found");
        return false;
    }
    if (!player.tank) {
        Util.logError("player[" + commander.connid + "] tank not found");
        return false;
    }
    player.tank.revertFireStatus();
    return true;
};

Commander.prototype.execute = function()
{
    var commanders = this.commanders[this.world.frame];
    var dispatchers = [];
    var ct = this.world.proto.CommanderType;
    if (commanders) {
        for (var i in commanders) {
            var commander = commanders[i];
            var result = false;
            switch (commander.cmd) {
                case ct.CT_JOIN:
                    result = this.exeJoin(commander);
                    break;
                case ct.CT_QUIT:
                    result = this.exeQuit(commander);
                    break;
                case ct.CT_REBORN:
                    result = this.exeReborn(commander);
                    break;
                case ct.CT_MOVE:
                    result = this.exeMove(commander);
                    break;
                case ct.CT_ROTATE:
                    result = this.exeRotate(commander);
                    break;
                case ct.CT_FIRE:
                    result = this.exeFire(commander);
                    break;
                default:
                    Util.logError("invalid commander:" + commander.cmd);
                    break;
            }
            if (result !== true) {
                Util.logError("commander[" + commander.cmd + "] execute error ignore");
            } else {
                // TODO: dump commanders
                Util.logDebug("frame[" + this.world.frame + "] cmd=" + commander.cmd + " " + commander.connid);
                dispatchers.push(commander);
            }
        }
    }

    // server dispatcher
    if (this.world.isLocal === false) {
        this.world.synchronizer.syncCommanders(dispatchers);
    }

    // release
    delete this.commanders[this.world.frame];
};

module.exports = Commander;

})();

