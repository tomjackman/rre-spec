var async = require('async');
var fs = require('fs');
var getFile = require('./fileFetcherCache');

var less = require('less');
// Add invert function to less
less.functions.functionRegistry._data.invert = require('./invertLess');

var publicPath = __dirname + '/../../public/';
var filePath = publicPath+'ui.css';

module.exports = function generateCss(files, fileChanged, updatedStyle) {
	getFile.clear(fileChanged);

	files = files.sort().filter(function(path) {
		return path.match(/\.less$/);
	});

	return function generator(jobDone) {
		// Convert buffers to strings
		var order = {
			'reset.less': 1
		};

		files = files.sort(function sortJsFiles(a, b) {
			a = a.split(/(\/|\\)/);
			a = a[a.length - 1];

			b = b.split(/(\/|\\)/);
			b = b[b.length - 1];

			a = order[a] || 0;
			b = order[b] || 0;
			return b - a;
		});

		var fileFetches = files.map(function(path, i) {
			return function(fetchDone) {
				getFile.read(path, function(err, content) {
					fetchDone(err, {
						'path': path,
						'content': content.toString()
					});
				});
			};
		});

		var lessFiles = [];

		function renderCss(e, fileContainers) {
			if (e) {
				throw e;
			}

			// Convert buffers to strings
			lessFiles = fileContainers.map(function(file) {
				return file.content;
			});

			// Create diff that quickly can be inserted in page
			if (fileChanged && !fileChanged.match(/assets\/base/)) {
				var fileDiff = fileContainers.filter(function(file) {
					var isHelper = file.path.match(/helpers/);
					var samePath = file.path === fileChanged;
					return isHelper || samePath;
				}).map(function(file) {
					return file.content;
				});

				// Render new delta css
				less.render(fileDiff.join('\n'), function(err, result) {
					if (err) {
						return console.log(err);
					}

					var css = result.css.replace(/local:\//g, '');
					updatedStyle(fileChanged, css);
				});
			}

			// Render dev css
			less.render(lessFiles.join('\n'), saveDevCss);
		}

		function saveDevCss(e, result) {
			if (e) {
				throw e;
			}

			fs.writeFile(filePath, result.css, jobDone);
		}

		// Start the flow
		async.parallel(fileFetches, renderCss);
	};
};