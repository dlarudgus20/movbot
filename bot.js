var five = require('johnny-five');
var Raspi = require('raspi-io');
var board = new five.Board({
	io: new Raspi(),
	repl: false
});

var state = 'invalid';
var pin;

var bot = {
	getState: function() {
		return state;
	},
	run: function() {
		pin.high();
		state = 'run';
	},
	stop: function() {
		pin.low();
		state = 'stop';
	}
};

board.on('ready', function() {
	state = 'stop';
	pin = new five.Pin('P1-13');
});

module.exports = bot;

