UI.widgets.MulticlassStandings = React.createClass({
	componentWillMount: function() {
		var self = this;

		io.emit('setState', UI.state);

function updateInfo() {
			r3e.getDriversInfo(function(data) {
				var drivers = [];

				data.driversInfo.forEach(function(driver) {
						return drivers.push(driver);
				});

				var jobs = [];
				drivers.forEach(function(driver) {
					jobs.push(function(done) {
						UI.batch({
							'vehicleInfo': function(done) {
								r3e.getVehicleInfo({
									'slotId': driver.slotId
								}, done);
							},
				              'pitInfo': function(done) {
				                  r3e.getPitInfo({
				                      'slotId': driver.slotId
				                  }, done)
				              },
							'extendedInfo': function(done) {
								r3e.getExtendedInfo({
									'slotId': driver.slotId
								}, done);
							}
						}, function(data) {
							driver.vehicleInfo = data.vehicleInfo;
							driver.extendedInfo = data.extendedInfo;
							driver.pitInfo = data.pitInfo;
							done(driver);
						});

					});
				});
				UI.batch(jobs, function(data) {
					self.setState({
						'driversInfo': {
							'driversInfo': data
						}
					});
				});
			});
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate*20);
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

		const statusNames = [
		    'NONE',
		    'FINISHED',
		    'DNF',
		    'DNQ',
		    'DNS',
		    'DQ',
		];

		// Race
		if (UI.state.sessionInfo.type.match(/^race/i)) {
			// Leader should show lap count
			if (driver.scoreInfo.positionOverall === 1) {
					return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>Lap {driver.scoreInfo.laps + 1}</div>;
			} else if (UI.state.controllerOptions.options.multiclass.value === "true" && driver.scoreInfo.positionClass === 1) {
					return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>Lap {driver.scoreInfo.laps + 1}</div>;
			} else if (driver.scoreInfo.status > 1) {
		    		return <div className={cx({'meta-info': true, 'grey': true})}>{statusNames[driver.scoreInfo.status]}</div>
			}
			else {
				if (UI.state.controllerOptions.options.showRelativeStandingsTiming.value === "true") {
					if (driver.scoreInfo.lapDiff > 0) {
						return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>+{driver.scoreInfo.lapDiff} Lap(s)</div>
					} else {
						return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>{self.formatTime(driver.scoreInfo.timeDiff).slice(0,-2)}</div>
					}
				} else {
					if (sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps > 1) {
						return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>+{(sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps)-1} Lap(s)</div>
					} else {
						var sortedIndex = 0;
						sortedByPosition.forEach(function(sortedDriver, i) {
							if (sortedDriver.slotId === driver.slotId) {
								sortedIndex = i;
							}
						});

						// this sometimes shows a red error when joining a race midway
						try {
							var timeDifference = sortedByPosition.slice(1, sortedIndex+1).map(function(driver) {
							return Math.max(0, driver.scoreInfo.timeDiff);
							}).reduce(function(p, c) {
								return p+c;
							});
						} catch (e) {
							console.error('Caught error trying to reduce on null - this sometimes shows a red error when joining a race midway')
						}

						return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>{self.formatTime(timeDifference).slice(0,-2)}</div>
					}
				}
			}
		// Qualify and Practice
		} else if(UI.state.sessionInfo.type === 'QUALIFYING' || UI.state.sessionInfo.type === 'PRACTICE') {
			if (driver.scoreInfo.positionOverall === 1) {
				if (driver.scoreInfo.bestLapInfo.sector3 !== -1) {
					return <div className={cx({'meta-info': true, 'fastest': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>{self.formatTime(driver.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
				} else {
					return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}></div>;
				}
			} else {
				if (driver.scoreInfo.bestLapInfo.valid) {
					return <div className="meta-info">{self.formatTime(driver.scoreInfo.bestLapInfo.sector3 - sortedByPosition[0].scoreInfo.bestLapInfo.sector3)}</div>
				} else if (driver.scoreInfo.laps !== sortedByPosition[0].scoreInfo.laps) {
					return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}>+{sortedByPosition[0].scoreInfo.laps-driver.scoreInfo.laps} laps</div>
				} else {
					return <div className={cx({'meta-info': true, 'yellow': driver.scoreInfo.flagInfo.causedYellow})}></div>;
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
	renderName: function(name) {
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
			divStyle.width = "13em";
		} else {
			if (window.settings.teamEvent) {
				var name = name.substr(name.indexOf(" ") + 1).toUpperCase();
				firstInitial = "";
				divStyle.width = "13em";
			} else {
				// Show 3 characters of last name by default
				var name = parts[parts.length-1].substr(0, 3).toUpperCase();
			}
		}
		return <div className="nameContainer" style={divStyle}><div className="firstname">{firstInitial}</div><div className="surname">{name}</div></div>
	},
	getClassIndicator: function(performanceIndex) {
		var divStyle = {};
		if (UI.state.controllerOptions.options.multiclass.value === "true" && UI.getClassColour(performanceIndex) != null) {
			classColour = UI.getClassColour(performanceIndex);
			divStyle.background = classColour;
			return <div className="classIndicator" style={divStyle}></div>
		} else {
			divStyle.display = 'none';
			return <div className="classIndicator" style={divStyle}></div>
		}

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
	getPositionIncrease(value) {
		if(value === 0) {
			return '-';
		} else if (value > 0) {
			return '+' + value;
		} else if (value < 0) {
			return value;
		}
	},
	looper: Array.apply(null, Array(UI.maxDriverCount)),
	render: function() {
		// On end phase user portalId is not sent anymore so do not show
		if (UI.state.sessionInfo.phase === 'END') {
			return null;
		}

		var self = this;
		var p = this.state;

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

		if (UI.state.sessionInfo.type === 'QUALIFYING' && UI.state.sessionInfo.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value && UI.state.activeWidgets.Results.active) {
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
		// && driversLookup[1].scoreInfo.bestLapInfo.sector3 !== -1
		// && driversLookup[1].scoreInfo.positionOverall === 1
		// && drivers.length < 25
		return (
			<div>
			{UI.state.controllerOptions.options.showSponsorLogo.value === "true"

			?
				<div className="sponsorLogo"></div>
			:
				null
			}
			<div className={multiclassStandingsClasses} style={{ top: UI.state.controllerOptions.options.showSponsorLogo.value === "true"? '10em': '6em'}}>

				{self.looper.map(function(non, i) {
					return <div key={i}>
						{self.shouldShow(driversLookup[i]) ?
							<div className={cx({'driver': true, 'active': (driversLookup[i].slotId === UI.state.focusedSlot)})} key={driversLookup[i].slotId} style={self.getDriverStyle(driversLookup[i])}>
								<div className="inner animated fadeIn delay-1s">
								{self.getClassIndicator(driversLookup[i].performanceIndex)}

									{ UI.state.controllerOptions.options.multiclass.value === "true" ?
											<div className="positionContainer"><div className="position">{driversLookup[i].scoreInfo.positionClass}</div></div>
										:
											<div className="positionContainer"><div className="position">{driversLookup[i].scoreInfo.positionOverall}</div></div>
									}
									
									
									<div className="manufacturerContainer">
										{ UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 30 || UI.state.sessionInfo.timeLeft < 60 || UI.state.sessionInfo.phase === 'CHECKERED' ?
											<div className="standingsFlag">
												{window.settings.offline === true || UI.state.controllerOptions.options.showPortalAvatar.value === "true" ?
													<img src={UI.getUserInfo(driversLookup[i].portalId).avatar} />
												:
													<img src={'/img/flags/'+UI.getUserInfo(driversLookup[i].portalId).country+'.png'} />
												}
											</div>
											: UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 10 ?
											<div className="manufacturerFlag" >
												<img src={'/img/manufacturers/'+driversLookup[i].manufacturerId+'.png'}/>
											</div>
											: 
											<div className="positionsChange">
												{ UI.state.sessionInfo.type.match(/^race/i) ?
											<div className={cx({'positionIncrease': true, 'level': driversLookup[i].scoreInfo.positionClass === driversLookup[i].scoreInfo.positionRaceGridClass, 'gained': driversLookup[i].scoreInfo.positionClass < driversLookup[i].scoreInfo.positionRaceGridClass, 'lost': driversLookup[i].scoreInfo.positionClass > driversLookup[i].scoreInfo.positionRaceGridClass})}>{self.getPositionIncrease(driversLookup[i].scoreInfo.positionRaceGridClass - driversLookup[i].scoreInfo.positionClass)}</div>
											:
												<div className={cx({'positionIncrease': true, 'level': true})}> - </div>
											}
											</div>
										}
									</div>

									{self.renderName(driversLookup[i].name)}


									<div className="meta-info-container">{self.getMetaInfo(driversLookup[i], drivers)}</div>

									{driversLookup[i].mandatoryPitstopPerformed > -1 ?
										<div className="pit-info">
										{driversLookup[i].mandatoryPitstopPerformed === 1 ?
											<div className="pitted">PIT</div>
											:
											null
										}
										{driversLookup[i].mandatoryPitstopPerformed === 0 ?
											<div className="unpitted">PIT</div>
											:
											null
										}
										</div>
									: 
										null
									}

									{ driversLookup[i].pitInfo.isPitting ?
										<div className="pit-info">
											<div className="pitted">PIT</div>
										</div>
											:
										null
									}
									
								</div>
							</div>
							:
							null
						}
					</div>
				})}
			</div>
			</div>
		);
	}
});
