var configBullets = {
	"0": {
		"density": 1.0,
		"hp": 220.0,
		"damage": 200.0,
		"alias": "normal",
		"durationFrame": 25.0,
		"radius": 8.0,
		"velocity": {
			"ivMax": 600.0,
			"ivDec": 60.0,
			"evMax": 100.0,
			"springBase": 30.0,
			"rv": 0.0,
			"ivMin": 150.0,
			"springAdd": 10.0,
			"ivAcc": 0.0,
			"ivInit": 200.0,
			"evDec": 0.0,
		},
		"bulletResist": 220.0,
		"view": {
			"body": {
				"color": "0xf14e54",
				"playerColor": "0x00b2e1",
				"radius": 7.0,
			},
			"edge": {
				"color": "0x555555",
				"w": 2.0,
			},
		},
	},
};
module.exports = configBullets;
