function cx() {
	var args = arguments;
	var classes = [];

	for (var i = 0; i < args.length; i++) {
		var arg = args[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes.push(arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (arg.hasOwnProperty(key) && arg[key]) {
					classes.push(key);
				}
			}
		}
	}
	return classes.join(' ');
}

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;