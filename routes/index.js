var bot = require('../bot');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { state: bot.getState() });
});

module.exports = function(_app) {
	var io = _app.get('io');

	io.on('connection', function(socket) {

		socket.on('motor', function(bRun) {
			if (bRun && bot.getState() == 'stop')
			{
				bot.run();
			}
			else if (!bRun && bot.getState() == 'run')
			{
				bot.stop();
			}
			socket.emit('state', bot.getState());
		});

		var botcallbk = function(state) {
			socket.emit('state', state);
		};
		bot.on('state', botcallbk);
		socket.on('disconnect', function() {
			bot.removeListener('state', botcallbk);
		});
	});
	return router;
};

