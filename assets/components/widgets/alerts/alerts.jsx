UI.widgets.Alert = React.createClass({
	componentWillMount: function () {
		var self = this;
	},
	render: function () {
		var self = this;
		var event = self.props.event;

		var penaltyMeanings = getPenaltyMeanings();

		var showAlerts = {
			// Drive Through
			0: {
				1: true,
				2: true,
				3: true,
				4: true,
				5: true,
				6: true,
				7: true,
				8: true,
				9: true,
				10: true
			},
			// Stop and Go
			1: {
				2: true,
				3: true
			},
			// Pitstop
			2: {
				1: true
			},
			// Time Penalty
			3: {
				1: true
			},
			// Slowdown Penalty
			4: {
				1: true,
				2: true
			},
			// Disqualified
			5: {
				0: true,
				1: true,
				2: true,
				3: true,
				4: true,
				8: true,
				9: true,
				10: true,
				11: true,
				12: true,
				13: true
			}
		};

		// Don't show all events like the Misc ones, collision, stationary etc.
		if (!event || !showAlerts[event.type] || !showAlerts[event.type][event.reason]) {
			return null;
		}

		var hasTranslation =
			showAlerts[event.type][event.reason] != null &&
			penaltyMeanings[event.type][event.reason].text != null;

		var validAlert =
			UI.state.activeWidgets.Alert.active &&
			event != null &&
			event.driverName != null &&
			penaltyMeanings[event.type] != null &&
			hasTranslation;

		if (!validAlert) {
			return null;
		}

		var slowdownIndex = 4;
		var slowdownAlerts =
			UI.state.controllerOptions.options.showSlowDownAlerts.value ===
				'true' || event.type !== slowdownIndex;

		if (!slowdownAlerts) {
			return null;
		}

		return (
			<div
				key={event.driverName}
				className={
					'alert animated fadeInRight ' +
					(event.removing ? 'removing' : '')
				}
			>
				<div className="raceControlAlert">
					{UI.getStringTranslation(
						'alertsWidget',
						'stewardsDecision'
					)}
				</div>

				{window.settings.teamEvent ? (
					<div className="alertMessage">
						{event.driverName.substr(
							event.driverName.indexOf(' ') + 1
						)} - {penaltyMeanings[event.type][event.reason].text}
					</div>
				) : (
					<div className="alertMessage">
						{event.driverName} - {penaltyMeanings[event.type][event.reason].text}
					</div>
				)}
			</div>
		);
	}
});
