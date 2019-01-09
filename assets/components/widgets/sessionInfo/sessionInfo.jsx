UI.widgets.SessionInfo = React.createClass({
	componentWillMount: function() {
		var self = this;
		var yellowFlagOnTrack = false;

		function updateInfo() {
			UI.batch({
				'eventInfo': r3e.getEventInfo,
				'sessionInfo': r3e.getSessionInfo,
				'driversInfo': r3e.getDriversInfo,
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
		self.updateLooperInterval = setInterval(this.updateLooperBasedOnPlayerCount, 1000);
	},
	updateLooperBasedOnPlayerCount: function() {
		var maxSlotIndex = 0;
		var isYellowFlag = false;
		var drivers = this.state.driversInfo.driversInfo;
		drivers.forEach(function(driver) {
			if (driver.scoreInfo.flagInfo.yellow > 0) {
				isYellowFlag = true;
				this.yellowFlagOnTrack = true;
			}
			maxSlotIndex = Math.max(maxSlotIndex, driver.slotId);
		});
		if (!isYellowFlag) {
			this.yellowFlagOnTrack = false;
		}
		this.looper = Array.apply(null, Array(maxSlotIndex+3));
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
		clearInterval(this.updateLooperInterval);
	},
	getInitialState: function() {
		return {
			'sessionInfo': {},
			'eventInfo': {},
			'driversInfo': {
				'driversInfo': []
			}
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

		var showCheckered = null;

		if (p.sessionInfo.phase === 'CHECKERED') {
			p.sessionInfo.timeLeft = 0;
		}

		return (
			<div className="session-info">
				<div className="inner">
					{p.sessionInfo.phase === 'GARAGE' ?
						<div>
							<div className="sessionName">{nameLookup[p.sessionInfo.phase]}</div>
							<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
							<div className="sessionInfoFlag">
								<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.svg'} />
							</div>
						</div>
						:
						<div>
							<div className="sessionName">{nameLookup[p.sessionInfo.type]}</div>
							<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
								{p.sessionInfo.type.match(/^race/i) && self.yellowFlagOnTrack ?
								<div className="yellowFlag animated flash infinite"></div>
								:
								null
								}
								<div className="sessionInfoFlag">
									<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.svg'} />
								</div>
								{p.sessionInfo.phase === 'CHECKERED' ?
								<div className="checkered">
									<img src={'/img/checkered.jpg'} />
								</div>
								:
								null
							}
						</div>
					}

				</div>
			</div>
		);
	}
});
