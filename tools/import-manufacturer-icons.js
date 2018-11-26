var request = require('request');
var path = require('path');
var fs = require('fs');

// Using the store's menus we can figure out the in game ids and download the icons
request({
	url: 'http://game.raceroom.com/en/store/?json',
	json: true,
	headers: {
		'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
		'accept':'image/webp'
	}
}, function(err, res, json) {
	var sections = json.context.c.store_menu.sub_sections;
	var carSection = sections.filter(function(section) {
		return section.title === 'Cars';
	})[0];

	if (!carSection) {
		return console.log('Could not find car section');
	}

	var manufacturerSection = carSection.sub_sections.filter(function(section) {
		return section.title === 'Manufacturers';
	})[0];

	if (!manufacturerSection) {
		return console.log('Could not find class section');
	}



	manufacturerSection.sub_sections.forEach(function(manufacturer) {
		var image = manufacturer.image.thumb;
		var classId = manufacturer.image.thumb.match(/([0-9]+)-image-small/)[1];
		var fileName = path.resolve(__dirname+'/../public/img/manufacturers/'+classId+'.webp');

		request.get({url: image, encoding: 'binary'}, function (err, response, body) {
			if (err)
			{
				console.log(manufacturer.title, "err")
			}
			fs.writeFile(fileName, body, 'binary', function(err) {
				if(err) {
					console.log('Failed', manufacturer.title);
					console.log(err);
				}else {
					console.log('Saved', manufacturer.title);
				}
			}); 
		});
	});
});