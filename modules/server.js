var SWorld = require("../modules/sworld");

var world = new SWorld();

world.start();

// jshint undef: false
setInterval(function() {

    "use strict";

    world.update();

}, 1);

