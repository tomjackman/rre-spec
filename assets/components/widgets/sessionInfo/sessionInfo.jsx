UI.widgets.SessionInfo = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
				'sessionInfo': r3e.getSessionInfo
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
			'sessionInfo': {}
		};
	},
	render: function() {
		var self = this;
		var p = this.state;

		var nameLookup = {
			'QUALIFYING': 'Qualifying',
			'PRACTICE': 'Practice',
			'RACE 1': 'Race',
			'RACE 2': 'Race 2',
			'RACE 3': 'Race 3',
			'GARAGE': 'Garage',
			'WARMUP': 'Warmup'
		};

		if (!p.sessionInfo.type || p.sessionInfo.type === 'EVENT RESULTS') {
			return null;
		}

		if (p.sessionInfo.phase === 'CHECKERED') {
			p.sessionInfo.timeLeft = 0;
		}

		return (
			<div className="session-info">
				<div className="inner">
					{p.sessionInfo.phase === 'GARAGE' ?
						<span>{nameLookup[p.sessionInfo.phase]}: {UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</span>
						:
						<span>{nameLookup[p.sessionInfo.type]}: {UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</span>
					}
				</div>
			</div>
		);
	}
});
