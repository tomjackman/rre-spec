var dive = require('dive');
var async = require('async');
var fs = require('fs');
var chokidar = require('chokidar');
var path = require('path');
var settings = require('./../../assets/settings.js');

function updateWidgets(widgetsPath, globalState, callback) {
	var jobs = [];

	function onFile(err, filePath) {
		if (!filePath.match(/meta.json$/)) {
			return;
		}
		jobs.push(function(done) {
			fs.readFile(filePath, function(err, content) {
				if (err) {
					throw err;
				}

				var meta = {};
				try {
					meta = JSON.parse(content);
				} catch(e) {
					throw new Error('Cant parse widget meta:\n'+filePath);
				}
				meta.active = meta.defaultActive || false;
				if (globalState.activeWidgets[meta.elementName]) {
					meta.active = globalState.activeWidgets[meta.elementName].active;
				}

				// Force AutoDirector to be enabled by default if in offline mode
				if (settings.offline === true && meta.elementName === 'AutoDirector') {
					meta.defaultActive = true;
					meta.active = true;
				}

				globalState.activeWidgets[meta.elementName] = meta;
				done();
			});
		});
	}

	function filesTraversalComplete() {
		if (!jobs.length) {
			return;
		}

		async.parallel(jobs, function() {
			console.log('> Loaded Widgets:'.green);
			console.log(('- '+Object.keys(globalState.activeWidgets).join('\n- ')).green+'\n');
			callback();
		});
	}

	dive(widgetsPath, onFile, filesTraversalComplete);
}
module.exports = function(io) {
	function getTimestamp() {
		var time = new Date().toString();
		var timestamp = time.match(/..:..:../)[0];
		return timestamp;
	}

	var globalState = {
		'sessionInfo': {
			'type': '',
			'phase': ''
		},
		'eventInfo': {
	        'serverName': null,
	        'trackId': null,
	        'trackName': null,
	        'layoutId': null,
	        'layoutName': null,
	        'length': null
	    },
		'focusedSlot': 0,
		'camera': 'trackside',
		'activeWidgets': {},
		'themes': {
			'raceroom-base': true
		},
		'activeTheme': 'raceroom-base',
		'languages': {},
		'controllerOptions': {}
	};

	var widgetsPath = __dirname+'/../../assets/components/widgets';
	chokidar.watch(widgetsPath, {
		'persistent': true
	}).on('change', updateOurWidgets);

	function updateOurWidgets(file) {
		if (file && !file.match(/meta.json$/)) {
			return;
		}

	updateWidgets(widgetsPath, globalState, function(err, activeWidgets) {
      io.sockets.emit('updatedState', globalState);
    });
	}

	updateOurWidgets();

	function replaceContents(file, replacement, cb) {
		fs.readFile(replacement, (err, contents) => {
			if (err) return cb(err);
			fs.writeFile(file, contents, cb);
		});
	}

	function loadThemes() {
		var themesDir = __dirname + '/../../theme';
		var themes = {};
		fs.readdirSync(themesDir).forEach(file => {
			var themeName = file.slice(0, -5);
			if (themeName != "z") {
				globalState.themes[themeName] = true;
			}
		});

		// set default theme on start: raceroom-red.less
		var defaultTheme = 'raceroom-base';
		var themeLessFile = themesDir + '/z.less';
		var activeThemeLessFile = themesDir + '/' + defaultTheme + '.less';
		replaceContents(themeLessFile, activeThemeLessFile, err => {
			if (err) {
				console.log(('Error setting default theme: ' + err).red);
			}
			console.log(("> Loaded Default Theme: " + defaultTheme).green);
		});
	}
	loadThemes();

	function loadLanguages() {
		var languagesDir = __dirname + '/../../languages';
		var languages = {};
		fs.readdirSync(languagesDir).forEach(file => {
			var languageName = file.slice(0, -5);
			// don't add the base language template as a choice
			if (languageName != "base") {
				var languageConfig = require(languagesDir + '/' + languageName + '.json');

				try {
					 JSON.parse(JSON.stringify(languageConfig));
					 globalState.languages[languageName] = languageConfig;
					 console.log(('> Successfully Loaded Language File - ' + languageName).green);
				} catch (e) {
					console.log(('Failed to Parse Language JSON File: ' + languageName + ".json - " + e).yellow);
				}
			}
		});
	}
	loadLanguages();

	function updateControllerOptions() {
		var config = require(__dirname + '/../../public/config.json');

		try {
			 JSON.parse(JSON.stringify(config));
		} catch (e) {
			return res.json({
				error: 'Failed to Parse JSON: ' + e
			});
		}

		// prevent caching of the json config
		delete require.cache[require.resolve(__dirname + '/../../public/config.json')];

		globalState.controllerOptions = config;
	}

	updateControllerOptions();

	function clearWidgets() {
		// Assume a new session has started when spectator joins
		// and disable all overlays
		console.log("clearWidgets")
		Object.keys(globalState.activeWidgets).forEach(function(key) {
			var widget = globalState.activeWidgets[key];
			console.log(" widget", key)
			if (widget.active) {
				var shouldBeActive = widget.keepOnSessionChange || widget.defaultActive;
				widget.active = shouldBeActive;
				console.log("  widget active", widget.active, shouldBeActive)
			}
		});

		io.sockets.emit('updatedState', globalState);
	}

	var lastIpToSendCommand = null;
	var lastIpToSendTimeout = null;
	io.sockets.on('connection', function(socket) {
		var ip = socket.handshake.address;
		console.log((getTimestamp() + ' Connected ' + ip).grey);

		socket.on('updatedCamera', function(opts) {
			opts = opts || {};

			if (!opts.automated && globalState.activeWidgets.AutoDirector.active) {
				globalState.activeWidgets.AutoDirector.active = false;
				io.sockets.emit('updatedState', globalState);
			}
			io.sockets.emit('updatedCamera', opts);
		});

		socket.emit('setup', globalState);

		socket.on('setState', function(state) {
			if (lastIpToSendCommand !== null && lastIpToSendCommand !== ip) {
				return;
			}
			lastIpToSendCommand = ip;
			if (lastIpToSendTimeout) {
				clearTimeout(lastIpToSendTimeout);
			}
			lastIpToSendTimeout = setTimeout(function() {
				lastIpToSendCommand = null;
			}, 2*1000);

			globalState = state;
			io.sockets.emit('updatedState', globalState);
		});

		socket.on('disconnect', function() {
			console.log((getTimestamp() + ' Disconnected ' + ip).grey);
		});

		socket.on('driversInfo', function(driversInfo) {
			io.to('controller').emit('driversInfo', driversInfo);
		});
		socket.on('sessionInfo', function(sessionInfo) {
			globalState.sessionInfo = sessionInfo;
			io.sockets.emit('updatedState', globalState);
		});
		socket.on('eventInfo', function(eventInfo) {
			globalState.eventInfo = eventInfo;
			io.sockets.emit('updatedState', globalState);
		});
		socket.on('directorSuggestions', function(directorSuggestions) {
			io.sockets.emit('directorSuggestions', directorSuggestions);
		});

		socket.on('join', function(room) {
			console.log('Joined', room);
			if (room === 'spectator') {
				clearWidgets();

				// Send empty list when driver leaves
				socket.on('disconnect', function() {
					clearWidgets();
					io.to('controller').emit('driversInfo', []);

					globalState.sessionInfo = {
						'type': '',
						'phase': ''
					};
					io.sockets.emit('updatedState', globalState);
				});
			}
			socket.join(room);
		});

		socket.on('dump', function(dump) {
			var savePath = path.resolve(__dirname+'./../../')+'/';
			var fileName = new Date()
								.toString()
								.match(/[a-z]+ [a-z]+ [0-9]+ [0-9]+ ..:..:../i)
								.toString()
								.replace(/ /g, '-')
								.replace(/:/g, '_')
								.toLowerCase()+'.json';

			fs.writeFile(savePath+fileName, JSON.stringify(dump, null, '  '), function(err) {
				if (err) {
					return console.log(err);
				}
				console.log('Saved dump:', fileName);
			});
		});
	});
};
