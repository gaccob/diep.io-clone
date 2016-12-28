var configBullets = {
	"0": {
		"lifeSeconds": 2.5,
		"density": 1,
		"hp": 220,
		"damage": 200,
		"alias": "normal",
		"radius": 10,
		"velocity": {
			"ivMax": 187.5,
			"ivDec": 18.75,
			"evMax": 100,
			"spring": 875,
			"rv": 0,
			"ivMin": 93.75,
			"ivAcc": 0,
			"springResist": 875,
			"ivInit": 150,
			"evDec": 0,
		},
		"bulletResist": 220,
		"view": {
			"body": {
				"color": "0xf14e54",
				"playerColor": "0x00b2e1",
				"radius": 10,
			},
			"edge": {
				"color": "0x555555",
				"w": 2,
			},
		},
	},
};
module.exports = configBullets;
