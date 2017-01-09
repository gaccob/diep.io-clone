// var browserify = require('browserify');
// browserify({
//     builtins: false,
//     commondir: false,
//     insertGlobalVars: {
//         process: function() {
//             "use strict";
//             return;
//         }
//     },
//     browserField: false
// });
// 

var CWorld = require("../modules/cworld");

var world = new CWorld();

function update() {

    "use strict";

    world.update();

    // jshint undef: false
    requestAnimationFrame(update);
}

update();

