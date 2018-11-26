var fs = require('fs');
// Quick way to cache files in memory to speed up generation
var filesCache = {};
module.exports = (function getFile() {
	return {
		'clear': function(file) {
			delete filesCache[file];
		},
		'read': function(file, callback) {
			if (filesCache[file]) {
				return callback(null, filesCache[file]);
			}
			fs.readFile(file, function(err, fileContent) {
				if (err) {
					return callback(err);
				}

				filesCache[file] = fileContent;
				callback(null, filesCache[file]);
			});
		}
	};
})();