UI.widgets.SafetyCarIn = React.createClass({
  componentWillUnmount: function() {
    // hide safety car indicator when dismounting
		UI.state.activeWidgets.SafetyCarDeployed.active = false;
	},
  render: function() {
		var self = this;
		return (
      <div className="safetyAlert animated fadeInRight">
        <div className="raceControl">Race Control</div>
  			<div className="safetyCarIn">Safety Car in this lap</div>
      </div>
		);
	}
});
