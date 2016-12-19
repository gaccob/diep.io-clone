(function() { 'use strict';

function initNameInput(startUI)
{
    startUI.raw = true;

    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;

    startUI.nameInput.style.width = w / 2 + 'px';
    startUI.nameInput.style.height = '30px';
    startUI.nameInput.value = "input your name and press Enter..";
    startUI.nameInput.style.color = "gray";

    var nw = parseInt(startUI.nameInput.style.width);
    var nh = parseInt(startUI.nameInput.style.height);
    startUI.nameContainer.style.left = (w - nw) / 2 + 'px';
    startUI.nameContainer.style.top = (h - nh) / 2 + 'px';
}

function focusNameInput(startUI)
{
    if (startUI.raw === true) {
        startUI.nameInput.value = "";
        startUI.nameInput.style.color = "";
        startUI.raw = false;
    }
}

function StartUI(world)
{
    this.world = world;
    this.lastHideStatus = false;

    this.nameContainer = document.createElement("div");
    this.nameContainer.style.display = 'block';
    this.nameContainer.style.position = 'absolute';
    document.body.appendChild(this.nameContainer);

    this.nameInput = document.createElement("input");
    this.nameInput.style["font-size"] = '20px';
    this.nameInput.style["font-family"] = 'Verdana,Arial,Sans-serif';
    this.nameInput.style["padding-left"] = '5px';
    this.nameInput.style["padding-right"] = '5px';
    this.nameContainer.appendChild(this.nameInput);

    var startUI = this;
    initNameInput(startUI);

    this.nameInput.onclick = function() {
        focusNameInput(startUI);
    };

    this.nameInput.onkeydown = function(e) {
        if (e.keyCode != 13) {
            focusNameInput(startUI);
            return;
        }

        var name = startUI.nameInput.value.trim();
        if (startUI.raw === true) {
            name = "guest";
        } else if (name.length === 0) {
            name = "guest";
        } else if (name.length > 10) {
            name = name.substring(0, 10);
        }

        if (world.inited === false) {
            world.init();
            world.synchronizer.syncStartReq(name);
        } else {
            world.synchronizer.syncReborn(name);
        }
    };
}

StartUI.prototype = {
    constructor: StartUI
};

StartUI.prototype.update = function()
{
    // hide status
    var hide = false;
    var player = this.world.getSelf();
    if (!player || !player.tank) {
        hide = false;
    } else {
        hide = true;
    }

    // update when status changed
    if (hide !== this.lastHideStatus) {
        if (hide === true) {
            this.nameContainer.style.left = '-1000px';
            this.nameContainer.style.top = '-1000px';
        } else {
            initNameInput(this);
        }
        this.lastHideStatus = hide;
    }
};

module.exports = StartUI;

})();

