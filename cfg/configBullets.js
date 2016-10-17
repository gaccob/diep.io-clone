var configBullets = {
	"0": {
		"body": {
			"color": "0xf14e54",
			"playerColor": "0x00b2e1",
			"radius": 7.0,
		},
		"density": 1.0,
		"hp": 1.0,
		"damage": 10.0,
		"alias": "normal",
		"edge": {
			"color": "0x555555",
			"w": 2.0,
		},
		"duration": 900.0,
		"velocity": {
			"ivMax": 300.0,
			"evMax": 100.0,
			"springBase": 30.0,
			"springAdd": 10.0,
			"ivMin": 200.0,
			"ivAcc": 200.0,
			"rotation": 0.0,
			"ivInit": 300.0,
			"evDec": 80.0,
		},
	},
};
module.exports = configBullets;
