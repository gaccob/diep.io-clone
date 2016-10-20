var Util = require("../modules/util");

console.log(Util.unitType.tank);
console.log(Util.unitType.bullet);

var pb = require("protobufjs");
var builder = pb.loadJsonFile("../proto/tank.proto.json");
