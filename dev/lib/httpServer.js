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

	function replaceContents(file, replacement, cb) {
		fs.readFile(replacement, (err, contents) => {
			if (err) return cb(err);
			fs.writeFile(file, contents, cb);
		});
	}

	app.post('/changeTheme/', function (req, res) {
	// replace contents of file 'b' with contents of 'a'
	var themesDir = __dirname + '/../../theme';
	var themeLessFile = themesDir + '/Ω.less';
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

	app.get(/.*/, function(req, res) {
		res.redirect('/');
	});

	var port = parseInt(process.env.PORT, 10);
	port = Number.isInteger(port) ? process.env.PORT : 9090;
	serverHttp.listen(port, function() {
		console.log((' > R3E Reality Broadcast Overlay').cyan+'\n');
		console.log((' > Server is running on http://localhost:'+port).green+'\n');
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
