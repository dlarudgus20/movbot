var events = require('events');

var five = require('johnny-five');
var Raspi = require('raspi-io');
var board = new five.Board({
	io: new Raspi(),
	repl: false
});

var state = 'invalid';
var pin;

function Bot()
{
	events.EventEmitter.call(this);
	this.getState = function() {
		return state;
	};
	this.run = function() {
		pin.high();
		state = 'run';
		this.emit('state', state);
	};
	this.stop = function() {
		pin.low();
		state = 'stop';
		this.emit('state', state);
	};
}
Bot.prototype.__proto__ = events.EventEmitter.prototype;
var bot = new Bot();

board.on('ready', function() {
	state = 'stop';
	pin = new five.Pin('P1-13');
});

module.exports = bot;

