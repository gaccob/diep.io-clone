var StartUI = {
    id: "startWindow",
    component: "Window",
    padding: 4,
    position: { x: 10, y: 10 },
    width: 500,
    height: 300,
    layout: [1, 3],
    children: [
        {
            id: "startText",
            component: "Label",
            font: {
                size: "24px",
                color: "white",
                family: 'Skranji'
            },
            text: "Enter your name:",
            width: 200,
            height: 20,
            position: {x: 130, y: 80 }
        },
        {
            id: "startNameInput",
            component: "Input",
            font: {
                size: "28px",
                family: 'Arail'
            },
            text: "guest",
            width: 280,
            height: 50,
            position: "center"
        },
        {
            id: "startButton",
            component: "Button",
            text: "START GAME",
            width: 240,
            height: 40,
            position: "center"
        }
    ]
};

module.exports = StartUI;
