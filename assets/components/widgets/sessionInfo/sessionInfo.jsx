UI.widgets.SessionInfo = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
				'eventInfo': r3e.getEventInfo,
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
			'sessionInfo': {},
			'eventInfo': {}
		};
	},
	getCountryCode: function(trackId) {
		var countryCode = "";

		if (r3eTracks.tracks[trackId] != null) {
			countryCode = r3eTracks.tracks[trackId].countryCode;
		}

		return countryCode;
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
			<div className="session-info animated fadeIn">
				<div className="inner">
					{p.sessionInfo.phase === 'GARAGE' ?
						<div>
							<div className="sessionName">{nameLookup[p.sessionInfo.phase]}</div>
							<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
							<div className="flag">
								<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.svg'} />
							</div>
						</div>
						:
						<div>
							<div className="sessionName">{nameLookup[p.sessionInfo.type]}</div>
							<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
							<div className="flag">
								<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.svg'} />
							</div>
						</div>
					}
				</div>
			</div>
		);
	}
});
