UI.widgets.Code60 = React.createClass({
	render: function() {
		var self = this;
		return (
			<div className="code60Container">
				<div className="raceControl">{UI.getStringTranslation("safetyCarInWidget", "raceControl")}</div>
				<div className="vscDeployed">{UI.getStringTranslation("code60Widget", "code60")}</div>
			</div>
		);
	}
});
