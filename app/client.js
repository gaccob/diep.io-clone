var CWorld = require("../modules/cworld");

var world = new CWorld();

function update() {

    "use strict";

    world.update();

    // jshint undef: false
    requestAnimationFrame(update);
}

update();

