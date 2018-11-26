var exec = require('child_process').exec;
var babel = require('babel-core');
var path = require('path');
module.exports = function(item) {
	var jsContent;
	try {
		jsContent = babel.transform(item.content, {
			'filename': path.basename(item.path),
			'presets' : ['react']
		}).code;
	} catch (e) {
		console.log(item.path);
		console.log(item.name);
		console.log(e);

		console.log('\u0007'); // Terminal bell

		// If we are passed a lineNumber open sublime, otherwise read out
		// what the error is.
		if (e.lineNumber) {
			var sublCmd = 'subl ' + item.path + ':' + e.lineNumber + ':' + e.column;
			exec(sublCmd);
		}

		return "React.createElement('div', {className: 'broken'})";
	}

	return jsContent;
};