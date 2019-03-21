UI.widgets.CompareRace = React.createClass({
	componentDidMount: function() {
		var self = this;

		// Hide widgets that use the same screen space
		// UI.state.activeWidgets.FocusedDriver.active = false;
		// io.emit('setState', UI.state);

		function updateInfo() {
			r3e.getDriversInfo(function(data) {
				var drivers = [];
				var foundFastest = false;
				var usersIndex = null;
				data.driversInfo.forEach(function(driver, i) {
					if (driver.slotId === UI.state.focusedSlot) {
						usersIndex = i;
						return drivers.push(driver);
					}
				});

				if (usersIndex) {
					drivers.push(data.driversInfo[usersIndex-1]);
				}

				var jobs = [];
				drivers.forEach(function(driver) {
					jobs.push(function(done) {
						UI.batch({
							'vehicleInfo': function(done) {
								r3e.getVehicleInfo({
									'slotId': driver.slotId
								}, done);
							},
              'pushToPassInfo': function(done) {
                  r3e.getPushToPassInfo({
                      'slotId': UI.state.focusedSlot
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
							driver.pushToPassInfo = data.pushToPassInfo;
							done(driver);
						});

					});
				});
				UI.batch(jobs, function(data) {
					self.setState({
						'driversInfo': data
					});
				});
			});
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
		clearInterval(this.closeDownTimeout);
	},
	getInitialState: function() {
		return {
			'driversInfo': null
		};
	},
	formatTime: UI.formatTime,
	render: function() {
		var self = this;

		// hide when the event info widget is open.
		if (UI.state.activeWidgets.EventInfo.active === true) {
			return null;
		}

		if (!UI.state.sessionInfo.type.match(/^RACE/)) {
			return null;
		}
		if (!self.state.driversInfo) {
			return null;
		}
		if (!self.state.driversInfo[1]) {
			return null;
		}
		if (!self.state.driversInfo[1].scoreInfo.timeDiff) {
			return null;
		}
		var drivers = self.state.driversInfo;
		return (
			<div className="compare-race">
				<div className="inner">
					{drivers[0].scoreInfo.timeDiff !== -1 ?
						<div className="delta animated fadeIn">
							<div className="battle">Battle For P{drivers[0].scoreInfo.positionOverall - 1}</div>
							<div className="value">{self.formatTime(Math.max(0, drivers[0].scoreInfo.timeDiff))}</div>
							<UI.widgets.CompareRaceDriver position="first" driver={drivers[1]}/>
							<UI.widgets.CompareRaceDriver position="second" driver={drivers[0]}/>
						</div>
						:
						null
					}
				</div>
			</div>
		);
	}
});

UI.widgets.CompareRaceDriver = React.createClass({
	fixName: function(str) {
		str = UI.fixName(str);
		var parts = str.split(' ');
		return parts[0][0]+'. '+parts[parts.length-1].toUpperCase();
	},
	getTeamName: function(teamId, portalId) {
		var self = this;
		var teamName = "";
		var portalTeamName = UI.getUserInfo(portalId).team;
		if (UI.state.controllerOptions.options.showPortalTeam.value === "true" && portalTeamName != null && portalTeamName.length > 0) {
			// add star for portal team names
			teamName = "✪ " + portalTeamName;
		} else if (r3eData.teams[teamId] != null) {
			teamName = r3eData.teams[teamId].Name;
		}

		// shorten long team names
		if (teamName.length > 40) {
			teamName = teamName.substring(0, 40) + "..";
		}

		return teamName;
	},
	render: function() {
		var self = this;
		var driver = self.props.driver;


		var classes = {
			'inner': true,
			'animated fadeIn': true
		};
		classes[self.props.position] = true;

		return (
			<div className={cx(classes)}>
			<div className="top">
			{UI.state.controllerOptions.options.showComparisonSpeed.value === "true" ?
					<div className="speed">
						{driver.vehicleInfo.speed} KM/H
					</div>
					:
					null
				}
				{driver.scoreInfo.bestLapInfo.sector3 !== -1 ?
					<div className="best-time">
						{UI.formatTime(driver.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}
					</div>
					:
					null
				}
				</div>
			<div className="main">
				<div className="comparePositionContainer"><div className="comparePosition">{driver.scoreInfo.positionOverall}</div></div>
				<div className="compare-flag-container">
				{window.settings.offline === true || UI.state.controllerOptions.options.showPortalAvatar.value === "true" ?
					<img className="compare-flag animated fadeIn" src={UI.getUserInfo(driver.portalId).avatar} />
				:
					<img className="compare-flag animated fadeIn" src={'/img/flags/'+UI.getUserInfo(driver.portalId).country+'.png'} />
				}
				</div>
				<div className="compareName">
					{ window.settings.teamEvent ?
						<div className="name">{driver.name.substr(driver.name.indexOf(" ") + 1).toUpperCase()}</div>
					:
						<div className="name">{self.fixName(driver.name)}</div>
					}
				</div>
				{UI.state.controllerOptions.options.showLiveryPreview.value === "true" ?
				<div className="vehicle">
					<img src={`/render/${driver.liveryId}/small/?type=livery`} />
				</div>
				:
					null
				}
				<div className="manufacturer">
					<img src={'/render/'+driver.manufacturerId+'/small/?type=manufacturer'}/>
				</div>
			</div>

				<div className="bottom">
				   { window.settings.teamEvent ?
						 null
						:
						 <div className="team">{self.getTeamName(driver.teamId, driver.portalId)}</div>
					 }
				</div>

				<div className="compareAssists">
					{driver.pushToPassInfo.allowed ?
						<div className={cx({'ptp': true, 'active': driver.pushToPassInfo.active})}>
							<div className={cx({'icon animated infinite flash': true, 'active': driver.pushToPassInfo.active})}>PTP</div>
						</div>
						:
						null
					}

					<div className={cx({'drs': true, 'active': driver.vehicleInfo.drsEnabled})}>
						<div className={cx({'icon animated infinite flash': true, 'active': driver.vehicleInfo.drsEnabled})}>DRS</div>
					</div>
				</div>

			</div>
		);
	}
});
