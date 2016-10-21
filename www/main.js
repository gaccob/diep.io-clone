var ClientWorld = require("../modules/client");

var world = new ClientWorld();

function update() {
    world.update();
    requestAnimationFrame(update);
}
update();

