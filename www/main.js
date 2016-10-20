var World = require("../modules/world");

var world = new World(true);

function update() {
    world.update();
    requestAnimationFrame(update);
}

update();

