var World = require("./modules/world");

var world = new World();

function update() {
    world.update();
    requestAnimationFrame(update);
}

update();

