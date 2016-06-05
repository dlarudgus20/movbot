/**
 * camera streaming server for jsmpeg (https://github.com/phoboslab/jsmpeg)
 * based on 'stream-server.js' in the same git repo.
 */

var http = require('http');
var ws = require('ws');
var spawn = require('child_process').spawn;

var STREAM_MAGIC_BYTES = 'jsmp';

function StreamServer(stream_prefix, stream_port, websock_port, width, height)
{
	var that = this;

	this.isInintialized = true;
	this.socketServer = new ws.Server({ port: websock_port });
	this.socketServer.on('connection', function(socket) {
		if (!that.isInitalized)
		{
			// stream hasn't initialized yet
			socket.disconnect(true);
		}

		var streamHeader = new Buffer(8);
		streamHeader.write(STREAM_MAGIC_BYTES);
		streamHeader.writeUInt16BE(width, 4);
		streamHeader.writeUInt16BE(height, 6);
		socket.send(streamHeader, { binary: true });

		console.log('new connection for streaming client at ' + websock_port
			+ ' (' + that.socketServer.clients.length + ' total)');

		socket.on('close', function(code, msg) {
			console.log('disconnected connection for streaming client at ' + websock_port
				+ ' (' + that.socketServer.clients.length + ' total)');
		});
	});
	this.streamServer = http.createServer(function(req, res) {
		var params = req.url.substr(1).split('/');

		if (params[0] == stream_prefix
			&& (params[1] | 0) == width
			&& (params[2] | 0) == height)
		{
			res.connection.setTimeout(0);

			console.log('new connection for streaming server at ' + stream_port
				+ ' (size: ' + width + 'x' + height + ')');

			that.isInitalized = true;
			req.on('data', function(data) {
				broadcast(that, data, { binary: true });
			});
		}
		else
		{
			console.log('invalid connection for streaming server at ' + stream_port);
			res.end();
		}
	}).listen(stream_port);

	var ffmpeg = spawn('ffmpeg', [
		'-s', '640x480',
		'-f', 'video4linux2',
		'-i', '/dev/video0',
		'-f', 'mpeg1video',
		'-b', '800k',
		'-r', '30',
		'http://localhost:' + stream_port
			+ '/' + stream_prefix
			+ '/' + width
			+ '/' + height + '/'
		]);
	ffmpeg.stdout.on('data', function(data) {
		// do nothing
	});
	ffmpeg.stderr.on('data', function(data) {
		// do nothing
	});
	ffmpeg.on('error', function(err) {
		throw 'failed to start ffmpeg';
	});
	ffmpeg.on('close', function(code) {
		throw 'ffmpeg exited';
	});
}

function broadcast(server, data, opts)
{
	var clients = server.socketServer.clients
	for (var i in clients)
	{
		if (clients[i].readyState == 1)
		{
			clients[i].send(data, opts);
		}
		else
		{
			// TODO: log error
		}
	}
}

module.exports = StreamServer;

