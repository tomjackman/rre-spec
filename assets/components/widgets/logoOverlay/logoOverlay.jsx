UI.widgets.LogoOverlay = React.createClass({
	render: function() {
		var self = this;
		if (window.settings.offline === true) {
			return null;
		}

		return (
			<div className="logo-overlay animated flipInY">
				<img src="/logoOverlay/flat/logo-overlay.png"/>
			</div>
		);
	}
});
