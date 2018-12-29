require('colors');
var express = require('express');
var request = require('request');
var fs = require('fs');
var http = require('http');
var pathTool = require('path');
var socketIo = require('socket.io');

var app = express();
var serverHttp = http.createServer(app);

var io = socketIo.listen(serverHttp);
require('./websocketServer')(io);

var transformJsxFile = require('./transformJsxFile');

module.exports = function(assetsDir) {
	var reloadQueue = [];
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	var compression = require('compression');
	app.use(compression());

	// Quick and dirty ability to hotswap react components
	app.get('/generate/:path', function(req, res) {
		var path = __dirname + '/../../assets/components/';
		var fixedSubPath = req.params.path.replace(/_/g, '/');
		path = pathTool.resolve(path + fixedSubPath + '.jsx');
		fs.readFile(path, function(err, content) {
			var name = pathTool.basename(path, pathTool.extname(path));
			var output = transformJsxFile({
				'name': name,
				'content': content.toString(),
				'path': path
			});

			res.set('Content-Type', 'application/javascript');
			res.send(output + '; UI.updateApplication();');
		});
	});

	// Decide where to fetch the render from
	app.get('/render/:id/:size', function(req, res) {
		request('http://game.raceroom.com/store/image_redirect?id='+req.params.id+'&size='+req.params.size).pipe(res);
		//request('http://localhost:8000/image/liveries/selection-thumb-big-/'+req.params.id+'/').pipe(res);
	});

	var userInfoCache = {};
	var waitingFor = 0;
	app.get('/user-info/:id', function(req, res) {
		var id = req.params.id;
		if (userInfoCache[id]) {
			return res.json(userInfoCache[id]);
		}

        waitingFor++;
		console.log('Fetching user data for', id, ', in que: ' + waitingFor);
		request('http://game.raceroom.com/users/' + id + '/?json', {
			'json': true
		}, function(err, r, json) {
			if (err) {
				return res.json({
					error: err
				});
			}

			if (typeof json === 'string') {
				return res.json({
					error: 'Invalid id'
				});
			}

			if (r.statusCode !== 200) {
				return res.json({
					error: r.statusCode
				});
			}

			var userInfo = json.context.c;
			userInfoCache[id] = {
                country: userInfo.overview.country.code,
                avatar: userInfo.avatar,
								team: userInfo.team
            };
            waitingFor--;
            console.log('Fetch done for', id, ', in que: ' + waitingFor);
			res.json(userInfoCache[id]);
		});
	});

	app.get('/controllerOptions/', function(req, res) {
			var config = require(__dirname + '/../../public/config.json');

			try {
			   JSON.parse(JSON.stringify(config));
			} catch (e) {
				return res.json({
					error: 'Failed to Parse JSON: ' + e
				});
			}

			// prevent caching of the json config, allow live reloads
			delete require.cache[require.resolve(__dirname + '/../../public/config.json')];

			res.json(config);
	});

	app.use(express.static(__dirname + '/../../public'));
	app.use(express.static(__dirname + '/../../assets/components/widgets'));

	// Load all plugins in plugin folder
	var pluginsPath = __dirname + '/../../plugins';
	fs.readdirSync(pluginsPath).filter(function(filePath) {
		var stat = fs.statSync(pluginsPath+'/'+filePath);
		return stat.isDirectory();
	}).forEach(function(filePath) {
		require(pluginsPath+'/'+filePath+'/'+filePath+'.js')(app, io);
	});

	app.get(/.*/, function(req, res) {
		res.redirect('/');
	});

	var port = parseInt(process.env.PORT, 10);
	port = Number.isInteger(port) ? process.env.PORT : 9090;
	serverHttp.listen(port, function() {
		console.log(('Server is running on http://localhost:'+port).blue+'\n');
	});

	return {
		'updatedContent': function updatedContent(path) {
			io.sockets.emit('content', path);
		},
		'updatedStyle': function updatedStyle(path, content) {
			io.sockets.emit('css', path, content);
		}
	};
};
