(function() { 'use strict';

function setNameInputCenter(startView)
{
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    var nw = parseInt(startView.nameInput.style.width);
    var nh = parseInt(startView.nameInput.style.height);
    startView.nameContainer.style.left = (w - nw) / 2 + 'px';
    startView.nameContainer.style.top = (h - nh) / 2 + 'px';
}

function initNameInput(startView)
{
    startView.raw = true;
    var w = document.documentElement.clientWidth;
    startView.nameInput.style.width = w / 2 + 'px';
    startView.nameInput.style.height = '30px';
    startView.nameInput.value = "input your name and press Enter..";
    startView.nameInput.style.color = "gray";
    setNameInputCenter(startView);
}

function focusNameInput(startView)
{
    if (startView.raw === true) {
        startView.nameInput.value = "";
        startView.nameInput.style.color = "";
        startView.raw = false;
    }
}

function StartView(world)
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

    var startView = this;
    initNameInput(startView);

    this.nameInput.onclick = function() {
        focusNameInput(startView);
    };

    this.nameInput.onkeydown = function(e) {
        if (e.keyCode != 13) {
            focusNameInput(startView);
            return;
        }

        var name = startView.nameInput.value.trim();
        if (startView.raw === true) {
            name = "guest";
        } else if (name.length === 0) {
            name = "guest";
        } else if (name.length > 10) {
            name = name.substring(0, 10);
        }

        world.onStartNameInput(name);
    };

    // view adapt
    var _this = this;
    window.addEventListener('resize', function() {
        if (_this.lastHideStatus === false) {
            setNameInputCenter(_this);
        }
    });
}

StartView.prototype = {
    constructor: StartView
};

StartView.prototype.updateView = function()
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

module.exports = StartView;

})();

