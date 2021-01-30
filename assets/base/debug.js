(function reload() {
	// When a Less file has been updated
	window.io.on('css', function(path, content) {
		// If the update passed some CSS we insert that instead of reloading
		// the entire css file (that will follow later on regardless).
		if (content) {
			path = path.split('/');
			path = path[path.length-1].replace(/.less/, '');

			// Remove styles of the same component
			$('style.'+path).remove();
			var $style = $('<style>').addClass(path).append(content);

			// Insert after last link
			$('link[rel=stylesheet]').eq(-1).after($style);
			return;
		}

		var $links = $('link[rel=stylesheet]');

		// Last link element
		var $link = $links.eq(-1);
		var href = $link.attr('href').replace(window.location.pathname, '/');
		if (href.match(/[0-9]$/)) {
			href = href.replace(/[0-9]+$/, Date.now());
		} else {
			href = href + '?c=' + Date.now();
		}

		var $newLink = $('<link type="text/css" rel="stylesheet">');
		// Clean old stuff after new CSS is loaded
		$newLink.on('load', function() {
			// Remove prev link
			$link.remove();

			// Clear the short quick styles
			$('style').remove();
		});

		$newLink.attr('href', href);
		$link.after($newLink);
	});

	// When JavaScript/Html has been updated
	window.io.on('content', function(path) {
		// If we updated an jsx file include a new script with
		// corresponds to that component which then overrides the
		// old one and updates the application.
		if (path.match(/jsx/)) {
			// Added \ to deal with path issues in Windows
			path = '/generate/'+path
				.replace(/.*components(\/|\\)/, '')
				.replace(/.jsx$/, '')
				.replace(/(\/|\\)/g, '_');

			var name = path.split('_');
			name = name[name.length-1];
			$('script.'+name).remove();

			$('<script>')
				.addClass(name)
				.attr('src', path)
				.appendTo('body');
		} else {
			window.location.reload(true);
		}
	});
})();

function getTimestamp() {
	var time = new Date().toString();
	var timestamp = time.match(/..:..:../)[0];
	return timestamp;
}

window.print = function(arg) {
	console.log(JSON.stringify(arg, null, '  '));
};

window.log = function() {
	window.io.emit('log', getTimestamp()+': '+JSON.stringify([].slice.call(arguments), null, '  '));
	console.log(arguments);
};

window.onerror = function(msg, file, lineno, colno, error) {
	if ($('.error-screen').length) {
		return;
	}

	// Overlay an error screen if something broke on the frontend
	// No reason to continue as something horrible probly happened
	var $errScreen = $('<div>').addClass('error-screen').appendTo('body');
	var $error = $('<pre>').text(error.stack).appendTo($errScreen);

	$error.css({
		'margin-left': '-' + ($error.width() / 2) + 'px',
		'margin-top': '-' + ($error.height() / 2) + 'px'
	});

	$errScreen.click(function() {
		$errScreen.remove();
	});
};

$(document).keyup(function(e) {
	if (e.which === 68 && window.r3e) {
		r3e.getDriversInfo(function(data) {
			var jobs = [];
			data.driversInfo.forEach(function(driver) {
				jobs.push(function(done) {
					UI.batch({
						'vehicleInfo': function(done) {
							r3e.getVehicleInfo({
								'slotId': driver.slotId
							}, done);
						},
						'pitInfo': function(done) {
							r3e.getPitInfo({
								'slotId': driver.slotId
							}, done);
						},
						'extendedInfo': function(done) {
							r3e.getExtendedInfo({
								'slotId': driver.slotId
							}, done);
						}
					}, function(data) {
						driver.pitInfo = data.pitInfo;
						driver.vehicleInfo = data.vehicleInfo;
						driver.extendedInfo = data.extendedInfo;
						done(driver);
					});

				});
			});

			// Find out which one should get the focus
			UI.batch(jobs, function(drivers) {
				UI.batch({
					'sessionInfo': r3e.getSessionInfo,
					'eventInfo': r3e.getEventInfo
				}, function(data) {
					data.drivers = drivers;
					if (!confirm('Dump logs? Locking UI while waiting. And do not press Esc to cancel.')) {
						return;
					}
					io.emit('dump', data);
					$('<div>').appendTo('body').css({
						'position': 'fixed',
						'top': 0,
						'left': 0,
						'right': 0,
						'bottom': 0,
						'background': '#000',
						'opacity': 0
					}).animate({
						'opacity': 1
					}, 100, function() {
						$(this).animate({
							'opacity': 0
						}, 100, function() {
							$(this).remove();
						});
					});
				});
			});
		});
	}
});
