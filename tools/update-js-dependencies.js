var request = require('request');
var path = require('path');
var fs = require('fs');

request.get({
	url: 'https://raw.githubusercontent.com/sector3studios/r3e-spectator-overlay/master/r3e-data.min.js',
	encoding: 'binary'
}, function (err, response, body) {
	fs.writeFile(path.resolve(__dirname+'/../assets/deps/r3e-data.min.js'), body, 'binary', function(err) {
		if(err) {
			console.log('Failed', 'r3e-data.min.js');
		}else {
			console.log('Saved', 'r3e-data.min.js');
		}
	});
});


request.get({
	url: 'https://raw.githubusercontent.com/sector3studios/r3e-spectator-overlay/master/r3e.min.js',
	encoding: 'binary'
}, function (err, response, body) {
	fs.writeFile(path.resolve(__dirname+'/../assets/deps/r3e.min.js'), body, 'binary', function(err) {
		if(err) {
			console.log('Failed', 'r3e.min.js');
		}else {
			console.log('Saved', 'r3e.min.js');
		}
	});
});
