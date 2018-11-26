var request = require('request');
var path = require('path');
var fs = require('fs');

var image = "http://simbridge.simbin.com:8080/Export/simbridgeserver_HELIOS-II_1/Projects/Lisi/Data/uiAS3/Menu/Images/carmanufactor_manufactoremblem_3013.png";
var classId = 3013;
var fileName = path.resolve(__dirname+'/../public/img/manufacturers/'+classId+'.webp');

request.get({url: image, encoding: 'binary'}, function (err, response, body) {
    fs.writeFile(fileName, body, 'binary', function(err) {
        if (err) {
            console.log('Failed');
            console.log(err);
        } else {
            console.log('Saved');
        }
    });
});