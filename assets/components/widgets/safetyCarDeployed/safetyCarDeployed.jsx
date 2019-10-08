UI.widgets.SafetyCarDeployed = React.createClass({
	render: function() {
		var self = this;
		return (
			<div className="safetyCarDeployedContainer">
				<div className="safetyCarDeployed animated flash infinite">{UI.getStringTranslation("safetyCarDeployedWidget", "safetyCar")}</div>
			</div>
		);
	}
});
