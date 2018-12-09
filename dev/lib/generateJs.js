require('colors');
var crypto = require('crypto');
var pathTool = require('path');
var async = require('async');
var fs = require('fs');
var getFile = require('./fileFetcherCache');

var transformJsxFile = require('./transformJsxFile');

function md5(buffer) {
	return crypto.createHash('md5').update(buffer).digest('hex');
}

var lastTemplateObj = null;

var lastContractsObj = null;

var jsxFilesCache = {};

var minifyChild = null;
module.exports = function generateJs(files, fileChange) {
	getFile.clear(fileChange);

	var order = {
		'fake_gameClient.js': 9,
		'react.js': 8,
		'react-dom.js': 7,
		'jquery-2.1.3.min.js': 6,
		'eventemitter2.js': 5,
		'classColours.js': 4,
		'r3e-data.min.js': 4,
		'r3e.min.js': 3,
		'ui.js': 2,
		'base.js': 1
	};

	// Remove files we don't need and make sure javascript files are
	// included in the right order
	var jsFiles = files.filter(function(path) {
		return path.match(/\.jsx?$/);
	}).sort().sort(function sortJsFiles(a, b) {
		a = a.split(/(\/|\\)/);
		a = a[a.length - 1];

		b = b.split(/(\/|\\)/);
		b = b[b.length - 1];

		a = order[a] || 0;
		b = order[b] || 0;
		return b - a;
	});

	var updated = false;
	function exports(generateDone) {
		if (fileChange && fileChange.match(/.jsx$/)) {
			updated = true;
			generateDone();
		}

		var fileFetches = [];
		jsFiles.forEach(function(path) {
			fileFetches.push(function(done) {
				getFile.read(path, function getFile(err, content) {
					var name = pathTool.basename(path, pathTool.extname(path));
					done(err, {
						'content': content.toString(),
						'name': name,
						'path': path
					});
				});
			});
		});

		// Insert templates after deps
		var indexAfterDeps = Object.keys(order).length - 1;
		function finalize(err, fileContent) {
			// Pass commonly used objects so we can minify
			var jsContent =
				// Make sure all code runs as strict
				fileContent.map(function(item) {
					if (item.path && item.path.match(/components/)) {
						var content = item.content;
						var checksum = md5(item.path + content);
						if (!jsxFilesCache[checksum]) {
							jsxFilesCache[checksum] = transformJsxFile(item);
						}

						return jsxFilesCache[checksum];
					} else if (item.path) {
						return item.content;
					} else {
						return item;
					}
				}).join('\n');

			var fileName = __dirname + '/../../public/ui.js';

			fs.writeFile(fileName, jsContent, function saveDevLocal(err) {
				if (!updated) {
					generateDone(err);
				}
			});
		}

		// Start the flow
		async.parallel(fileFetches, finalize);
	}
	return exports;
};
