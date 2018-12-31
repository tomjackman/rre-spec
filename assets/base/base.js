window.io = io.connect();

// Takes a data object from game and returns the appropriate React component
UI.c = function createReactComponent(type, data) {
	data.key = data.key;

	if (!UI.components[type]) {
		// Flash red screen on error
		var error = new Error(errorMsg);
		window.onerror(errorMsg, null, null, null, error);
		return null;
	}
	return UI.components[type](data);
};

UI.controllerUpdateRate = 1000/2;
UI.spectatorUpdateRate = 1000/15;

UI.getUserInfo = (function() {
	var userCache = {};
	return function(id) {
		if (userCache[id]) {
			return userCache[id];
		}

		userCache[id] = {
			country: 'zz', // default to neutral country
			avatar: '/img/placeholder-avatar.png',
			team: ""
		};

		$.getJSON('/user-info/' + id, function(data) {
			if (data.error) {
				return;
			}

			userCache[id] = data;
		});

		return userCache[id];
	};
})();

// UI.getControllerConfig = function() {
// 		$.getJSON('/controllerOptions/', function(data) {
// 			if (data.error) {
// 				console.log("Error fetching control options: " + data.error);
// 				return;
// 			}
// 			UI.state.controllerOptions = data;
// 			io.emit('setState', UI.state);
// 		});
// };
//
// // fetch the controller config from the config file
// UI.getControllerConfig();

UI.fixName = function(name) {
	return name.replace(/(^.| .)/g, function(str) {
		return str.toUpperCase();
	});
};

UI.formatSessionTime = function(seconds) {
	if (seconds <= 0) {
		seconds = 0;
	}

	var hours = Math.floor(seconds/(60*60));
	seconds = seconds - hours*60*60;
	var minutes = Math.floor(seconds/60);
	seconds = seconds - minutes*60;

	var str = '';
	if (hours) {
		str += ('0'+hours).slice(-2)+':';
	}
	if (minutes) {
		str += ('0'+minutes).slice(-2)+':';
	}

	str += ('0'+seconds).slice(-2);

	return str;
};
UI.formatTime = function(ms, options) {
	options = options || {};

	var negative = ms < 0;
	ms = Math.abs(ms);

	var seconds = ms/1000;
	var minutesLeft = Math.floor(seconds/60);
	var secondsLeft = Math.floor(seconds-(minutesLeft*60));

	var msLeft = Math.floor((seconds - Math.floor(seconds))* 1000);
	var str = '';

	if (!options.ignoreSign) {
		if (negative) {
			str += '-';
		} else {
			str += '+';
		}
	}

	if (minutesLeft) {
		str += ('0'+minutesLeft).slice(-2)+':';
	}
	return str+('0'+secondsLeft).slice(-2)+'.'+('00'+msLeft).slice(-3);
};

UI.batch = function(jobs, callback) {
	var fixedJobs = null;
	if (Array.isArray(jobs)) {
		fixedJobs = [];
		jobs.forEach(function(job) {
			fixedJobs.push(function(done) {
				job(function(results) {
					done(null, results);
				});
			})
		});
	} else {
		fixedJobs = {};
		Object.keys(jobs).forEach(function(key) {
			var job = jobs[key];
			fixedJobs[key] = function(done) {
				job(function(results) {
					done(null, results);
				});
			};
		});
	}
	async.parallel(fixedJobs, function(err, results) {
		callback(results);
	});
};

// Generate and insert template based on component(s) data.
UI.state = {
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
};

io.on('setup', function(state) {
	UI.state = state;

	if (window.gameClient) {
		io.emit('join', 'spectator');
		UI.updateApplication();
	} else {
		io.emit('join', 'controller');
		setTimeout(UI.updateApplication, 1);
	}
});

io.on('updatedState', function(state) {
	UI.state = state;
	UI.updateApplication();
});

UI.updateApplication = function updateApplication() {
	ReactDOM.render(
		React.createElement(UI.components.App, UI.state),
		UI.baseEl
	);
};

var cursorShowing = false;
$(document).keyup(function(e) {
	if (e.which === 27) { // Esc
		if (window.r3e) {
			r3e.exit();
		}
	}
	if (e.which === 82) { // r
		window.location.reload(true);
	}
	if (e.which === 67) { // c
		cursorShowing = !cursorShowing;
		if (window.r3e) {
			r3e.showCursor({
				'show': cursorShowing
			});
		}
	}
});

// Allow the spectator to work in an iframe
window.addEventListener('message', function(event) {
	try {
		var data = JSON.parse(event.data);
		window.communicator(data[0], data[1]);
	} catch(e) {
		console.error('Got window message error', event.data, e);
	}
});
