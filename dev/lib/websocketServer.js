var dive = require('dive');
var async = require('async');
var fs = require('fs');
var chokidar = require('chokidar');
var path = require('path');

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

	// default controller options
	var defaultControllerOptions = {
	  "options": {
	    "multiclass": {
	      "displayName": "Multiclass UI",
	      "value": "false",
	      "tooltip": "Enable Multiclass UI elements (Default: False).",
	      "type": "checkbox"
	    },
	    "showTyreCompound": {
	      "displayName": "Show Tyre Compound",
	      "value": "true",
	      "tooltip": "Show the tyre compound in the driver info widget for applicable classes.",
	      "type": "checkbox"
	    },
	    "indentFocusedDriver": {
	      "displayName": "Indent Focused Driver",
	      "value": "false",
	      "tooltip": "Indent the focused driver in the standings widget (Default: False).",
	      "type": "checkbox"
	    },
	    "showPortalTeam": {
	      "displayName": "Show Portal Team Names",
	      "value": "false",
	      "tooltip": "Show a drivers portal team name if they have added one (Default: False).",
	      "type": "checkbox"
	    },
			"showPortalAvatar": {
				"displayName": "Show Driver Avatar",
				"value": "false",
				"tooltip": "Show a drivers portal avatar in place of the country flag (Default: False).",
				"type": "checkbox"
			},
			"showFullStandingsName": {
				"displayName": "Show Full Surnames in Standings",
				"value": "false",
				"tooltip": "Show the full middle and last names of drivers in the standings tower (Default: False).",
				"type": "checkbox"
			},
			"autoDirectorOnlyMode": {
				"displayName": "Auto Director Only Mode",
				"value": "false",
				"tooltip": "When enabled, the auto director will only direct a race and won't turn on widgets by itself. Useful for jumping between manual & auto directing without having to turn on/off specific widgets each time (Default: False).",
				"type": "checkbox"
			},
			"showLiveryPreview": {
				"displayName": "Show Livery Preview",
				"value": "true",
				"tooltip": "Show the livery of the car on the driver info and compare driver widgets (Default: True).",
				"type": "checkbox"
			},
	    "alertLength": {
	      "displayName": "Steward Message Alert Time Length (Seconds)",
	      "value": "15",
	      "tooltip": "Specify how long steward alerts should be shown on screen in seconds (Default: 15 Seconds).",
	      "type": "number"
	    },
	    "qualifyingResultsDisplayTime": {
	      "displayName": "Qualifying Results Display Time (Seconds)",
	      "value": "25",
	      "tooltip": "The amount of seconds before the end of qualifying to display the results on screen (Default: 25 Seconds)",
	      "type": "number"
	    },
	    "continueToNextSessionTime": {
	      "displayName": "Continue to Next Session Time (Seconds)",
	      "value": "45",
	      "tooltip": "The amount of seconds before the continuing to the next session after a race has finished. This also affects how long the results screen is shown for (Default: 45 Seconds).",
	      "type": "number"
	    }
	  }
	};

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
			'raceroom-red': true
		},
		'activeTheme': 'raceroom-red',
		'controllerOptions': defaultControllerOptions
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
		var defaultTheme = 'raceroom-red';
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
