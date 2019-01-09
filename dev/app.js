require('colors');
process.title = 'webUiGenerator';

var async = require('async');
var exec = require('child_process').exec;
var path = require('path');
var chokidar = require('chokidar');

// Read out an error. Obnoxious but should happen seldomly so not a big deal
process.addListener('uncaughtException', function (err) {
	console.log(('Caught exception: '+err+'\n\n'+err.stack).red);
});

var assetsDir = path.resolve(__dirname + '/../assets');

// Initiate the httpd that serves assets and some logic for reloading
var httpServer = require('./lib/httpServer')(assetsDir);

// Enable generation of files on change
var assetGenerator = require('./lib/generateHandler')(httpServer, assetsDir);
chokidar.watch(assetsDir, {
	'ignored': /[\/\\]\./,
	'persistent': true
}).on('change', assetGenerator);

// themme directory
var themesDir = path.resolve(__dirname + '/../theme');
// Enable generation of files on change
var themeGenerator = require('./lib/generateHandler')(httpServer, themesDir);
chokidar.watch(themesDir, {
	'ignored': /[\/\\]\./,
	'persistent': true
}).on('change', themeGenerator);

// resolution scaler
var resScalerDir = path.resolve(__dirname + '/../resolutionScaler.less');
// Enable generation of files on change
var resScalerGen = require('./lib/generateHandler')(httpServer, resScalerDir);
chokidar.watch(resScalerDir, {
	'ignored': /[\/\\]\./,
	'persistent': true
}).on('change', resScalerGen);

assetGenerator(null);
