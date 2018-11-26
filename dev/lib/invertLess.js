var less = require('less');
module.exports = function invertColor(color) {
	if (color.value) {
		return color;
	}

	var rgb = [
		255 - color.rgb[0],
		255 - color.rgb[1],
		255 - color.rgb[2]
	];
	return new(less.tree.Color)(rgb, color.alpha);
};