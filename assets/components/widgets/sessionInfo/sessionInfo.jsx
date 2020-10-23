UI.widgets.SessionInfo = React.createClass({
	componentWillMount: function() {
		var self = this;
		var yellowFlagOnTrack = false;

		function updateInfo() {
			UI.batch({
				'eventInfo': r3e.getEventInfo,
				'sessionInfo': r3e.getSessionInfo,
				'driversInfo': r3e.getDriversInfo
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
			'QUALIFYING': UI.getStringTranslation("sessionInfoWidget", "qualifying"),
			'PRACTICE': UI.getStringTranslation("sessionInfoWidget", "practice"),
			'RACE 1': UI.getStringTranslation("sessionInfoWidget", "race1"),
			'RACE 2': UI.getStringTranslation("sessionInfoWidget", "race2"),
			'RACE 3': UI.getStringTranslation("sessionInfoWidget", "race3"),
			'GARAGE': UI.getStringTranslation("sessionInfoWidget", "garage"),
			'WARMUP': UI.getStringTranslation("sessionInfoWidget", "warmup")
		};

		if (!p.sessionInfo.type || p.sessionInfo.type === 'EVENT RESULTS') {
			return null;
		}

		if (UI.state.sessionInfo.type === 'QUALIFYING' && UI.state.sessionInfo.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value && UI.state.activeWidgets.Results.active) {
			return null;
		}

		var showCheckered = null;

		if (p.sessionInfo.phase === 'CHECKERED') {
			p.sessionInfo.timeLeft = 0;
		}

		return (
			<div className="session-info animated fadeInDown">
				<div className="inner">
					{p.sessionInfo.phase === 'GARAGE' ?
						<div>
							<div className="sessionInfoFlag">
								<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.png'} />
							</div>
							<div className="sessionName">{nameLookup[p.sessionInfo.phase]}</div>
							<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
							{UI.state.controllerOptions.options.showServerNameInTimer.value === "true" ?
								<div className="serverName">{p.eventInfo.serverName}</div>
							:
								null
							}
						</div>
						:
						<div>
							<div className="sessionInfoFlag">
								<img src={'/img/flags/'+self.getCountryCode(p.eventInfo.trackId)+'.png'} />
							</div>
							<div className="sessionName">{nameLookup[p.sessionInfo.type]}</div>
								{UI.state.controllerOptions.options.showServerNameInTimer.value === "true" ?
									<div className="serverName">{p.eventInfo.serverName}</div>
								:
									null
								}
								{p.sessionInfo.type.match(/^race/i) && p.sessionInfo.phase.match(/^countdown/i) ?
									<div className="countdown">
										<div className="animated fadeIn">
											<div className="countdownIndicatorsRed animated infinite flash">◉◉◉◉◉</div>
										</div>
									</div>
								:
									null
								}
								{p.sessionInfo.type.match(/^race/i) && self.yellowFlagOnTrack ?
								<div className="yellowFlag animated flash infinite"></div>
								:
								null
								}
								{p.sessionInfo.phase === 'CHECKERED' ?
									<div className="checkered">
										<img src={'/img/checkered.jpg'} />
									</div>
								:
									<div className="timer">{UI.formatSessionTime(Math.max(0, p.sessionInfo.timeLeft))}</div>
								}

						</div>
					}

				</div>
			</div>
		);
	}
});
