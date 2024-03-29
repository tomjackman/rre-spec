require('colors');
var express = require('express');
var request = require('request');
var fs = require('fs');
var http = require('http');
var pathTool = require('path');
var socketIo = require('socket.io');
var bodyParser = require('body-parser')

var app = express();
var serverHttp = http.createServer(app);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


var io = socketIo.listen(serverHttp);
require('./websocketServer')(io);

var transformJsxFile = require('./transformJsxFile');

var settings = require('./../../assets/settings.js');

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
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

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
		if (settings.offline !== true) {
			res.redirect('http://game.raceroom.com/store/image_redirect?id='+req.params.id+'&size='+req.params.size);
		} else {
			var url = '';
			switch (req.query.type) {
				case 'manufacturer':
					url =
						'http://localhost:8000/image/manufacturers/selection-thumb-/' +
						req.params.id +
						'/';
				break;

				case 'track':
					url =
						'http://localhost:8000/image/tracks/thumb-/' +
						req.params.id +
						'/';
				break;

				case 'avatar':
					url =
						'http://localhost:8000/image/avatars/small-/' +
						req.params.id +
						'/';
				break;

				default:
					url =
						'http://localhost:8000/image/liveries/selection-thumb-big-/' +
						req.params.id +
						'/';
					break;
			}

			request(url).pipe(res);
		}
	});

	var userInfoCache = {};
	var waitingFor = 0;
	app.get('/user-info/:id', function(req, res) {
		var id = req.params.id;
		if (userInfoCache[id]) {
			return res.json(userInfoCache[id]);
		}

        waitingFor++;
		//console.log('Fetching user data for portal ID - ', id, ', in que: ' + waitingFor);
		request('http://game.raceroom.com/users/' + id + '/?json', {
			'json': true
		}, function(err, r, json) {
			if (err) {
				console.log(err);
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
				console.log('Non 200 status code', r.statusCode);
				return res.json({
					error: r.statusCode
				});
			}

			var userInfo = json.context.c;
			userInfoCache[id] = {
                country: userInfo.overview.country.code,
				countryName: userInfo.overview.country.name,
                avatar: userInfo.avatar,
				team: userInfo.team
            };
            waitingFor--;
            //console.log('User profile retrieved for portal ID - ' + id + ', in que: ' + waitingFor);
			res.json(userInfoCache[id]);
		});
	});

	// update file with new control options based on user input
	app.post('/saveControllerOptions/', function (req, res) {
		var filePath = __dirname + '/../../public/config.json';
		var config = require(filePath);
		try {
			 JSON.parse(JSON.stringify(config));
			 const keyName = req.body.keyName;
			 const newValue = req.body.newValue;
			 config.options[keyName].value = newValue;
			 // save to file
			 fs.writeFileSync(filePath, JSON.stringify(config, null, 2) , 'utf-8');
		} catch (e) {
			return res.json({
				error: 'Error saving contol options config to disk: ' + e
			});
		}
		res.json(JSON.stringify(config));
	});

	// Allow admin to add penalty to a user (tries to penalize every single open instance)
	app.post('/penalty/', function (req, res) {
		var filePath = __dirname + '/../../public/config.json';
		var config = require(filePath);
		var dediUrl = config.options.dediManager.value.replace(/\/$/, '');

		request({
			url: dediUrl + '/dedi/',
			json: true
		}, function(err, _res, dedis) {
			if (err) {
				return res.json({error:err});
			}

			var userId = parseFloat(req.body.UserId);

			var instances = dedis.filter(function(dedi) {
				return dedi.ProcessState.Running;
			});

			if (instances.length === 0) {
				return res.json({
					error: 'No servers matching the user are active'
				});
			}

			var duration = parseFloat(req.body.Duration);

			instances.forEach(function(dedi) {
				var processId = dedi.GameSetting.Id;
				var data = {
					UserId: userId,
					ProcessId: processId,
					PenaltyType: parseFloat(req.body.PenaltyType),
					Duration: isNaN(duration) ? undefined : parseFloat(req.body.Duration)
				};

				request({
					url: dediUrl + '/user/penalty',
					method: 'post',
					json: data,
					'Content-Type': 'application/json'
				}, function(err, _res, penaltyJson) {
					if (err) {
						console.log(err);
						return res.json({error: 'Error giving driver penalty'});
					}

					res.json({success: true, penaltyResponse: penaltyJson});
				});
			});
		});
	});

	// Allow admin to warn to a user through chat
	app.post('/chat/', function (req, res) {
		var filePath = __dirname + '/../../public/config.json';
		var config = require(filePath);
		var dediUrl = config.options.dediManager.value.replace(/\/$/, '');

		request({
			url: dediUrl + '/dedi/',
			json: true
		}, function(err, _res, dedis) {
			if (err) {
				return res.json({error:err});
			}

			var instances = dedis.filter(function(dedi) {
				return dedi.ProcessState.Running;
			});

			instances.forEach(function(dedi) {
				var processId = dedi.GameSetting.Id;
				request({
					url: dediUrl + '/chat/' + processId + '/admin',
					method: 'post',
					json: {
						'Message': req.body.message
					},
					'Content-Type': 'application/json'
				}, function(err, _res, chatJson) {
					if (err) {
						console.log(err);
						return res.json({error: 'Error when sending chat message'});
					}

					res.json({success: true, chatResponse: chatJson});
				});
			});
		});
	});

	function replaceContents(file, replacement, cb) {
		fs.readFile(replacement, (err, contents) => {
			if (err) return cb(err);
			fs.writeFile(file, contents, cb);
		});
	}

	app.post('/changeTheme/', function (req, res) {
		// replace contents of file 'b' with contents of 'a'
		var themesDir = __dirname + '/../../theme';
		var themeLessFile = themesDir + '/z.less';
		var activeThemeLessFile = themesDir + '/' + req.body.file + '.less';
		replaceContents(themeLessFile, activeThemeLessFile, err => {
			if (err) {
				console.log('Error when switching theme: ' + err);
				return res.json({
					error: 'Error when switching theme: ' + err
				});
			}
			res.json(JSON.stringify({'theme': req.body.file}));
		});
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

	app.get('/dashboard', function(req, res) {
		fs.createReadStream(__dirname + '/../../public/index.html').pipe(res);
	});
	app.get('/overview', function(req, res) {
		fs.createReadStream(__dirname + '/../../public/index.html').pipe(res);
	});
	app.get(/.*/, function(req, res) {
		res.redirect('/');
	});

	var port = parseInt(process.env.PORT, 10);
	port = Number.isInteger(port) ? process.env.PORT : 9090;
	serverHttp.listen(port, function() {
		console.log(('\n'+' > R3E Reality Broadcast Overlay').white+'\n');
		console.log((' > Running in browser on http://localhost:'+port).green+'\n');
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
