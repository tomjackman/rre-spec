var fs = require('fs');
var jade = require('jade');
var async = require('async');
var getFile = require('./fileFetcherCache');

module.exports = function generateHtml(files, fileChanged) {
	getFile.clear(fileChanged);
	files = files.filter(function(path) {
		return path.match(/base\.jade$/);
	});

	return function generateHtmlFiles(done) {
		if (!files.length) {
			throw new Error('base.jade missing? Could not create index.html');
		}

		getFile.read(files[0], function getJadeBase(err, jadeContent) {
			var htmlGenerator = jade.compile(jadeContent, {
				client: true,
				compileDebug: false
			});

			var publicPath = __dirname + '/../../public';
			var filePath = publicPath + '/index.html';

			async.parallel([
				function writeDev(done) {
					fs.writeFile(filePath, htmlGenerator({
						'dev': true
					}), done);
				}
			], done);
		});
	};
};