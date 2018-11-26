var async = require('async');
var dive = require('dive');

var scannedFiles = {};
var files = [];

module.exports = function generateAssets(server, assetsDir) {
	var generateCss = require('./generateCss');
	var generateJs = require('./generateJs');
	var generateHtml = require('./generateHtml');

	return function generateAssets(path) {
		path = path || '';

		function onFile(err, file) {
			scannedFiles[file] = true;
			files.push(file);
		}

		function filesTraversalComplete() {
			var jobs = [];

			if (!path || path.match(/\.less$/)) {
				jobs.push(generateCss(files, path, server.updatedStyle));
			}
			if (!path || path.match(/\.(jsx?)$/)) {
				jobs.push(generateJs(files, path));
			}
			if (!path || path.match(/base\.jade$/)) {
				jobs.push(generateHtml(files, path));
			}

			async.parallel(jobs, generationComplete);
		}

		function generationComplete(err) {
			if (err) {
				throw err;
			}

			if (path.match(/\.(jsx?|jade)$/)) {
				server.updatedContent(path);
			}
			if (path.match(/\.less$/)) {
				server.updatedStyle(path);
			}
		}

		// No need to fetch all files from FS again if we already know
		// about the file that was changed.
		if (path && scannedFiles[path]) {
			filesTraversalComplete();
		} else {
			dive(assetsDir, onFile, filesTraversalComplete);
		}
	};
};