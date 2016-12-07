(function(){ "use strict";

var Victor = require("victor");
var Util = require("../modules/util");

var cfg = {
    moveUpdateFrame: 10,
    fireUpdateFrame: 30,
    moveTurnDistance: 80,
    moveTurnRandomAngle: 0.12,
    moveTowardsHpPercent: 0.5,
    moveBoringFrame: 60,
};

function AI(world, owner)
{
    this.world = world;
    this.owner = owner;

    this.lastUpdateMoveFrame = -9999;
    this.lastUpdateFireFrame = -9999;

    this.lastMoveFrame = 0;
    this.lastMoveTargetX = 0;
    this.lastMoveTargetY = 0;
    this.lastFireTargetId = 0;
}

AI.prototype = {
    constructor: AI
};

AI.prototype.move = function()
{
    var hp = this.owner.hp;
    var maxHp = this.owner.maxHp;
    var dest = this.world.tanks[this.lastFireTargetId];
    var angle = null;

    // when in fight status, tank move align weapon angle, that is rotation
    if (dest && this.owner.getFightStatus() === true) {
        angle = this.owner.rotation;
        // move towards
        if (hp > maxHp * cfg.moveTowardsHpPercent) {
            // make a turn angle if too close
            var dist2 = Util.distance2(this.owner.x, this.owner.y, dest.x, dest.y);
            var threshold = cfg.moveTurnDistance * cfg.moveTurnDistance;
            if (dist2 < threshold) {
                angle += (Math.random() * cfg.moveTurnRandomAngle * 2
                    - cfg.moveTurnRandomAngle - Math.PI / 2);
            }
        }
        // move backwards
        else {
            angle = -angle;
        }
        this.lastMoveFrame = this.world.frame;
    }
    // not in fight status, move random
    else {
        var close = (Util.distance2(this.owner.x, this.owner.y,
            this.lastMoveTargetX, this.lastMoveTargetY) < Util.epsilon);
        var boring = (this.world.frame - this.lastMoveFrame > cfg.moveBoringFrame);
        if (close === true || boring === true) {
            this.lastMoveTargetPosX = Math.random() * this.world.cfg.configMap.w;
            this.lastMoveTargetPosY = Math.random() * this.world.cfg.configMap.h;
            this.lastMoveFrame = this.world.frame;
            var dir = new Victor(this.lastMoveTargetPosX - this.owner.x,
                                 this.lastMoveTargetPosY - this.owner.y);
            angle = dir.angle();
        }
    }

    // server generate commander
    if (angle) {
        Util.logDebug("frame[" + this.world.frame + "] "
            + "tank[" + this.owner.player.connid + "] "
            + "ai move angle:" + angle);

        var moveCmd = new this.world.proto.SyncCommander();
        moveCmd.connid = this.owner.player.connid;
        moveCmd.cmd = this.world.proto.CommanderType.CT_MOVE;
        moveCmd.move = new this.world.proto.SyncCommander.Move();
        moveCmd.move.angle = angle;
        moveCmd.move.force = true;
        this.world.commander.push(this.world.frame + 1, moveCmd);

        // TODO: temporary
        var rotateCmd = new this.world.proto.SyncCommander();
        rotateCmd.connid = this.owner.player.connid;
        rotateCmd.cmd = this.world.proto.CommanderType.CT_ROTATE;
        rotateCmd.rotate = new this.world.proto.SyncCommander.Rotate();
        rotateCmd.rotate.angle = angle + Math.PI / 2;
        this.world.commander.push(this.world.frame + 1, rotateCmd);
    }
};

AI.prototype.fire = function()
{
    // TODO:
};

AI.prototype.update = function()
{
    if (this.world.frame - this.lastUpdateMoveFrame > cfg.moveUpdateFrame) {
        this.lastUpdateMoveFrame = this.world.frame;
        this.move();
    }
    if (this.world.frame - this.lastUpdateFireFrame > cfg.fireUpdateFrame) {
        this.lastUpdateFireFrame = this.world.frame;
        this.fire();
    }
};

module.exports = AI;

})();
