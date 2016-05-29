var bot = require('../bot');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { state: bot.getState() });
});

router.post('/', function(req, res, next) {
	if (bot.getState() == 'stop')
	{
		bot.run();
	}
	else if (bot.getState() == 'run')
	{
		bot.stop();
	}
	res.send({ state: bot.getState() });
});

module.exports = router;

