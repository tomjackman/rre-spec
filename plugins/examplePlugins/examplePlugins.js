module.exports = function(expressApp, socketIo) {
	return;
	expressApp.get('/test-route/', function(req, res) {
		res.json({
			'test': true
		});
	});

	socketIo.sockets.on('connection', function(socket) {
		var ip = socket.handshake.address;
		console.log(('Example plugin, connected ' + ip).grey);
		socket.on('disconnect', function() {
			console.log(('Example plugin, disconnected ' + ip).grey);
		});

		socket.on('ping', function(driversInfo) {
			io.to('test').emit('pong', true);
		});

		socket.on('join', function(room) {
			console.log('Example plugin, joined', room);
			socket.join('test-'+room);
		});

		socket.on('setState', function(state) {
			var json = JSON.stringify(state, null, '  ');
			console.log('Example plugin, updated state', json);
		});
	});
};
