UI.widgets.DamageCheck = React.createClass({
	componentWillMount: function() {
		var self = this;

		// Hide widgets that use the same screen space
		io.emit('setState', UI.state);


		function updateInfo() {
			UI.batch({
				'pitInfo': function(done) {
					r3e.getPitInfo({
						'slotId': UI.state.focusedSlot
					}, done);
				}
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
	},
	getInitialState: function() {
		return {
			'pitInfo': {}
		};
	},
	render: function() {
		var self = this;
		var info = self.state.pitInfo;
		if (!info.tyreType) {
			return null;
		}

		return (
			<div className="damage-check">
				<div className="part engine">Engine: {100-info.damage.engine}%</div>
				<div className="part transmission">Transmission: {100-info.damage.transmission}%</div>
			</div>
		);
	}
});
