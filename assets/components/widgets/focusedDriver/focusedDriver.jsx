UI.widgets.FocusedDriver = React.createClass({
	componentWillMount: function() {
		var self = this;

		// Hide widgets that use the same screen space
		UI.state.activeWidgets.CompareRace.active = false;
		io.emit('setState', UI.state);

		function updateInfo() {
			var initialState = {};
			if (self.state.currentSlot !== UI.state.focusedSlot) {
				initialState.bufferedCurrentLapInfo = JSON.parse(JSON.stringify(self.defaultSectorValues));
			}
			initialState.currentSlot = UI.state.focusedSlot;
			self.setState(initialState);

			UI.batch({
				'vehicleInfo': function(done) {
					r3e.getVehicleInfo({
						'slotId': UI.state.focusedSlot
					}, done)
				},
				'pushToPassInfo': function(done) {
					r3e.getPushToPassInfo({
						'slotId': UI.state.focusedSlot
					}, done)
				},
				'extendedInfo': function(done) {
					r3e.getExtendedInfo({
						'slotId': UI.state.focusedSlot
					}, function(data) {
						if (self.sectorTimesFrozen) {
							return done(self.state.extendedInfo);
						}

						self.handleSectorTimes(data);
						done(data);
					});
				},
				'driverInfo': function(done) {
					if (self.sectorTimesFrozen) {
						return done(self.state.driverInfo);
					}

					r3e.getDriversInfo(function(driversInfo) {
						done(driversInfo.driversInfo.filter(function(driver) {
							return driver.slotId === UI.state.focusedSlot;
						})[0] || {});
					});
				},
				'driversInfo': r3e.getDriversInfo
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
	},
	handleSectorTimes: function(data) {
		var self = this;
		if (self.sectorTimesFrozen) {
			return;
		}
		var stateChanges = self.state;
		var bufferedCurrentLapInfo = self.state.bufferedCurrentLapInfo;
		bufferedCurrentLapInfo.valid = data.currentLapInfo.valid;

		if (bufferedCurrentLapInfo.sector3.time > data.currentLapInfo.sector3) {
			bufferedCurrentLapInfo.sector3.finished = true;

			self.setState(stateChanges);

			self.sectorTimesFrozen = true;
			setTimeout(function() {
				self.sectorTimesFrozen = false;
				self.setState({
					'bufferedCurrentLapInfo': JSON.parse(JSON.stringify(self.defaultSectorValues))
				});
			}, 5000);
			return;

		} else {
			bufferedCurrentLapInfo.sector3.time = data.currentLapInfo.sector3;
		}

		if (!bufferedCurrentLapInfo.sector1.finished || bufferedCurrentLapInfo.sector1.time !== data.currentLapInfo.sector1) {
			if (bufferedCurrentLapInfo.sector1.time === data.currentLapInfo.sector1 && data.currentLapInfo.sector2 !== -1) {
				bufferedCurrentLapInfo.sector1.finished = true;
			} else {
				bufferedCurrentLapInfo.sector1.finished = false;
				bufferedCurrentLapInfo.sector1.time = data.currentLapInfo.sector1;
			}
		}

		if (!bufferedCurrentLapInfo.sector2.finished || bufferedCurrentLapInfo.sector2.time !== data.currentLapInfo.sector2) {
			if (bufferedCurrentLapInfo.sector2.time === data.currentLapInfo.sector2 && data.currentLapInfo.sector3 !== -1) {
				bufferedCurrentLapInfo.sector2.finished = true;
			} else {
				bufferedCurrentLapInfo.sector2.finished = false;
				bufferedCurrentLapInfo.sector2.time = data.currentLapInfo.sector2;
			}
		}

		self.setState(stateChanges);
	},
	sectorTimesFrozen: false,
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
	},
	defaultSectorValues: {
		'valid': false,
		'sector1': {'time': -1, 'finished': false},
		'sector2': {'time': -1, 'finished': false},
		'sector3': {'time': -1, 'finished': false},
	},
	getInitialState: function() {
		return {
			'driverInfo': {},
			'driversInfo': {},
			'vehicleInfo': {},
			'currentSlot': -1,
			'bufferedCurrentLapInfo': JSON.parse(JSON.stringify(this.defaultSectorValues))
		};
	},
	formatTime: function(ms) {
		var seconds = ms/1000;
		var minutesLeft = Math.floor(seconds/60);
		var secondsLeft = Math.floor(seconds-(minutesLeft*60));
		var msLeft = Math.floor((seconds - Math.floor(seconds))* 1000);
		return minutesLeft+':'+secondsLeft+'.'+msLeft;
	},
	bestLapTime: function() {
		var self = this;
		var info = self.state.driverInfo.scoreInfo;
		if (info.bestLapInfo.valid) {
			return <div className="best-lap-time">Best lap time: {this.formatTime(info.bestLapInfo.sector3)}</div>
		}
		return null;
	},
	fixName: function(str) {
		str = UI.fixName(str);
		var parts = str.split(' ');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		return parts.join(' ');
	},
	getSectorItem: function(name) {
		var self = this;

		var sector = self.state.bufferedCurrentLapInfo[name];
		var personalBest = self.state.driverInfo.scoreInfo.bestLapInfo[name]
		if (personalBest === -1) {
			personalBest = sector.time;
		}
		var globalBest;
		try {
			globalBest = self.state.driversInfo.driversInfo[0].scoreInfo.bestLapInfo[name];
		} catch(e) {}
		if (globalBest === -1) {
			globalBest = personalBest;
		}

		var classes = cx({
			'sector-entry': true
			, 'finished': sector.finished
			, 'active': sector.time > 0
			, 'personal-best': sector.time <= personalBest
			, 'global-best': sector.time <= globalBest
		});
		if (sector.time === -1) {
			return null;
		}
		if (sector.finished && sector.time-globalBest !== 0) {
			return <li className={classes}>
				{UI.formatTime(sector.time, {ignoreSign: true})} ({UI.formatTime(sector.time-globalBest)})
			</li>
		} else {
			return <li className={classes}>
				{UI.formatTime(sector.time, {ignoreSign: true})}
			</li>;
		}
	},
	getExtraInfo: function() {
		var self = this;
		if (UI.state.sessionInfo.type.match(/^(qualify|practice|race)/i)) {
			return <div className="extra-info">
				<ul className="sectors">
					{self.getSectorItem('sector1')}
					{self.getSectorItem('sector2')}
					{self.getSectorItem('sector3')}
				</ul>
			</div>
		}
	},
	getClassPosition: function(classId) {
		var self = this;
		var classColour = "rgba(38, 50, 56, 0.8)";
		var driverInfo = self.state.driverInfo;

		if (r3eData.classes[classId] != null && r3eClassColours.classes[classId] != null) {
			classColour = r3eClassColours.classes[classId].colour;
		}

		const divStyle = {
				backgroundColor: classColour
		};

		return <div className="positionInClass" style={divStyle}>P{driverInfo.scoreInfo.positionClass} IN CLASS</div>
	},
	getTeamName: function(teamId) {
		var teamName = "";

		if (r3eData.teams[teamId] != null) {
			teamName = r3eData.teams[teamId].Name;
		}

		return teamName;
	},
	playDrsAudio() {
		// var self = this;
		// if (self.state.vehicleInfo.drsEnabled) {
		// 	var audio = new Audio('/audio/dtm.ogg');
		// 	audio.loop = false;
		// 	audio.volume = 0.5;
		// 	audio.play();
		// }
	},
	render: function() {
		var self = this;
		var driverInfo = self.state.driverInfo;
		if (!driverInfo.name) {
			return null;
		}

		var focusedDriverClasses = cx({
			'hide-flags': UI.state.activeWidgets.FocusedDriver.disableFlags
			, 'focused-driver-info': true
		});

		// On end phase user portalId is not sent anymore so do not show
		if (UI.state.sessionInfo.phase === 'END') {
			return null;
		}

		return (
			<div className={focusedDriverClasses}>
				<div className="inner">
					<div className="position">{driverInfo.scoreInfo.positionOverall}</div>
					{self.getClassPosition(driverInfo.classId)}
					<div className="flag-container">
						<img className="flag" src={'/img/flags/'+UI.getUserInfo(driverInfo.portalId).country+'.svg'} />
					</div>
					<div className="name">{self.fixName(driverInfo.name)}</div>
					<div className="team">{self.getTeamName(driverInfo.teamId)}</div>
					<div className="vehicle">
						<img src={'http://game.raceroom.com/store/image_redirect?id='+driverInfo.liveryId+'&size=small'} />
					</div>
					<div className="manufacturer">
						<img src={'/img/manufacturers/'+driverInfo.manufacturerId+'.webp'} />
					</div>

					{self.state.pushToPassInfo.allowed ?
						<div className={cx({'ptp animated infinite flash delay-1s': true, 'active': self.state.pushToPassInfo.active})}>
							<div className="icon"></div>
							<div className="text">PTP Remaining: {self.state.pushToPassInfo.amountLeft}</div>
						</div>
						:
						null
					}
					<div className={cx({'drs animated infinite flash delay-1s': true, 'active': self.state.vehicleInfo.drsEnabled})}>
						{self.playDrsAudio()}
						<div className="icon"></div>
					</div>
					{self.getExtraInfo()}
					{driverInfo.scoreInfo.bestLapInfo.sector3 !== -1 ?
						<div className="best-time">
							PB - {UI.formatTime(driverInfo.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}
						</div>
						:
						null
					}
				</div>
			</div>
		);
	}
});
