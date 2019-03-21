UI.widgets.MulticlassStandings = React.createClass({
	componentWillMount: function() {
		var self = this;

		io.emit('setState', UI.state);

		function updateInfo() {
			UI.batch({
				'pitInfo': function(done) {
					r3e.getPitInfo({
					'slotId': UI.state.focusedSlot
					}, done)
				},
				'driversInfo': r3e.getDriversInfo
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
		self.updateLooperInterval = setInterval(this.updateLooperBasedOnPlayerCount, 1000);
	},
	updateLooperBasedOnPlayerCount: function() {
		var maxSlotIndex = 0;
		var drivers = this.state.driversInfo.driversInfo;
		drivers.forEach(function(driver) {
			maxSlotIndex = Math.max(maxSlotIndex, driver.slotId);
		});
		this.looper = Array.apply(null, Array(maxSlotIndex+3));
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
		clearInterval(this.updateLooperInterval);
	},
	getInitialState: function() {
		return {
			'pitInfo': {},
			'driversInfo': {
				'driversInfo': []
			}
		};
	},
	getDriverStyle: function(driver) {
		if (UI.state.controllerOptions.options.indentFocusedDriver.value === "true" && driver.slotId === UI.state.focusedSlot) {
			return {
				'WebkitTransform': 'translate3d(0, ' + ((driver.scoreInfo.positionOverall-1) * 100) + '%, 0)',
				'left': '1em'
			};
		} else {
			return {
				'WebkitTransform': 'translate3d(0, ' + ((driver.scoreInfo.positionOverall-1) * 100) + '%, 0)'
			};
		}
	},
	formatTime: UI.formatTime,
	getMetaInfo: function(driver, sortedByPosition) {
		var self = this;
		// Race
		if (UI.state.sessionInfo.type.match(/^race/i)) {
			// Leader should show lap count
			if (driver.scoreInfo.positionOverall === 1) {
					return <div className="meta-info">Lap {driver.scoreInfo.laps + 1}</div>;
			} else {
				if (UI.state.controllerOptions.options.showRelativeStandingsTiming.value === "true") {
					if (driver.scoreInfo.lapDiff > 0) {
						return <div className="meta-info">+{driver.scoreInfo.lapDiff} Lap(s)</div>
					} else {
						return <div className="meta-info">{self.formatTime(driver.scoreInfo.timeDiff)}</div>
					}
				} else {
					if (sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps > 1) {
						return <div className="meta-info">+{(sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps)-1} Lap(s)</div>
					} else {
						var sortedIndex = 0;
						sortedByPosition.forEach(function(sortedDriver, i) {
							if (sortedDriver.slotId === driver.slotId) {
								sortedIndex = i;
							}
						});
						var timeDifference = sortedByPosition.slice(1, sortedIndex+1).map(function(driver) {
							return Math.max(0, driver.scoreInfo.timeDiff);
						}).reduce(function(p, c) {
							return p+c;
						});
						return <div className="meta-info">{self.formatTime(timeDifference)}</div>
					}
				}
			}
		// Qualify and Practice
		} else if(UI.state.sessionInfo.type === 'QUALIFYING' || UI.state.sessionInfo.type === 'PRACTICE') {
			if (driver.scoreInfo.positionOverall === 1) {
				if (driver.scoreInfo.bestLapInfo.sector3 !== -1) {
					return <div className="meta-info fastest">{self.formatTime(driver.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
				} else {
					return <div className="meta-info"></div>;
				}
			} else {
				if (driver.scoreInfo.bestLapInfo.valid) {
					return <div className="meta-info">{self.formatTime(driver.scoreInfo.bestLapInfo.sector3 - sortedByPosition[0].scoreInfo.bestLapInfo.sector3)}</div>
				} else if (driver.scoreInfo.laps !== sortedByPosition[0].scoreInfo.laps) {
					return <div className="meta-info">+{sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps} laps</div>
				} else {
					return <div className="meta-info"></div>;
				}
			}
		}
	},
	sortFunctionPosition: function(a, b) {
		if (a.scoreInfo.positionOverall > b.scoreInfo.positionOverall) {
			return 1;
		} else if (a.scoreInfo.positionOverall === b.scoreInfo.positionOverall) {
			return 0;
		} else {
			return -1;
		}
	},
	renderName: function(name, classId) {
		var firstInitial = name.substr(0, 1).toUpperCase() + ". ";
		var parts = name.split(' ');
		var divStyle = {};

		// show full name and increase width
		if (UI.state.controllerOptions.options.showFullStandingsName.value === "true") {
			// show second name only for team event mode
			if (window.settings.teamEvent) {
				var name = name.substr(name.indexOf(" ") + 1).toUpperCase();
				firstInitial = "";
			} else {
				var lastNames = parts.slice(1);
				var name = lastNames.map(item=> item.toUpperCase());
			}
			divStyle.width = "8em";
		} else {
			if (window.settings.teamEvent) {
				var name = name.substr(name.indexOf(" ") + 1).toUpperCase();
				firstInitial = "";
				divStyle.width = "8em";
			} else {
				// Show 3 characters of last name by default
				var name = parts[parts.length-1].substr(0, 3).toUpperCase();
			}
		}

		if (UI.state.controllerOptions.options.multiclass.value === "true" && UI.getClassColour(classId) != null) {
			classColour = UI.getClassColour(classId);
			divStyle.background = classColour;
		}
		return <div className="nameContainer" style={divStyle}><div className="name">{firstInitial}{name}</div></div>
	},
	shouldShow: function(driver) {
		if (!driver) {
			return false;
		}
		if (UI.state.sessionInfo.type.match(/^RACE/)) {
			return true;
		}
		if (UI.state.sessionInfo.type === 'PRACTICE' && !driver.scoreInfo.bestLapInfo.valid) {
			return false;
		}
		return driver.scoreInfo.bestLapInfo.valid || driver.scoreInfo.timeDiff != -1;
	},
	looper: Array.apply(null, Array(UI.maxDriverCount)),
	render: function() {
		// On end phase user portalId is not sent anymore so do not show
		if (UI.state.sessionInfo.phase === 'END') {
			return null;
		}

		var self = this;
		var p = this.state;
		var pitInfo = self.state.pitInfo;

		var drivers = this.state.driversInfo.driversInfo;
        if (!drivers.length) {
            return null;
        }

		var driversLookup = {};
		drivers.forEach(function(driver) {
			driversLookup[driver.slotId] = driver;
		});


		var multiclassStandingsClasses = cx({
			'hide-flags': UI.state.activeWidgets.MulticlassStandings.disableFlags
			, 'multiclass-standings': true
		});

		if (UI.state.sessionInfo.type === 'QUALIFYING' && UI.state.sessionInfo.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value) {
			return null;
		}

		// hide in garage phase since thw whole grid won't be shown which looks bad on screen
		if (UI.state.sessionInfo.phase === 'GARAGE') {
			return null;
		}

		// hide when the event info widget is open.
		if (UI.state.activeWidgets.EventInfo.active === true) {
			return null;
		}

		// Need to clone it to keep the base array sorted by slotId
		return (
			<div className={multiclassStandingsClasses}>
				{self.looper.map(function(non, i) {
					return <div key={i}>
						{self.shouldShow(driversLookup[i]) ?
							<div className={cx({'driver': true, 'active': (driversLookup[i].slotId === UI.state.focusedSlot)})} key={driversLookup[i].slotId} style={self.getDriverStyle(driversLookup[i])}>
								<div className="inner">
									<div className="positionContainer"><div className="position">{driversLookup[i].scoreInfo.positionOverall}</div></div>
									{self.renderName(driversLookup[i].name, driversLookup[i].classId)}
									{UI.state.controllerOptions.options.showStandingsManufacturer.value === "true" || UI.state.controllerOptions.options.showStandingsFlag.value === "true" ?
										<div className="manufacturer">
											{window.settings.offline === false && UI.state.controllerOptions.options.showStandingsFlag.value === "true" ?
												<div key={UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 40} className="standingsFlag">
													<img src={'/img/flags/'+UI.getUserInfo(driversLookup[i].portalId).country+'.png'} />
												</div>
												:
												<div key={UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 40} className="manufacturerFlag">
													<img src={'/render/'+driversLookup[i].manufacturerId+'/small/?type=manufacturer'}/>
												</div>
											}
										</div>
									:
										null
									}
									{self.getMetaInfo(driversLookup[i], drivers)}
									<div className="pit-info">
										{driversLookup[i].mandatoryPitstopPerformed === 1 ?
											<div className="pitted">⭗</div>
											:
											null
										}
										{driversLookup[i].mandatoryPitstopPerformed === 0 ?
											<div className="unpitted">⭗</div>
											:
											null
										}
									</div>
								</div>
							</div>
							:
							null
						}
					</div>
				})}
			</div>
		);
	}
});
