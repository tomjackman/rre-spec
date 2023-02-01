UI.widgets.TyreChoice = React.createClass({
  componentDidMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
				'pitInfo': function(done) {
					r3e.getPitInfo({
						'slotId': UI.state.focusedSlot
					}, done);
				},
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate*2);
	},
	getInitialState: function() {
		return {
			'pitInfo': {}
		};
	},
  render: function() {
		var self = this;
		var pitInfo = self.state.pitInfo;

		if (!pitInfo.tyreType) {
			return null;
		}

		return (
      <div className="tyreChoice animated fadeInRight">
        <div className="title">{pitInfo.tyreType + ' Compound'}</div>
  			<div className="tyreContainer"><img className="animated rotateIn" id="tyreChoiceImg" src={'/img/tyres/'+pitInfo.tyreType+'.png'} /></div>
      </div>
		);
	}
});
