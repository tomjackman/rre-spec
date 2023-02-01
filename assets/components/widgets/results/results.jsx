UI.widgets.Results = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
				'eventInfo': function(done) {
					r3e.getEventInfo(done);
			},
				'driversInfo': r3e.getDriversInfo
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);

		(function checkRefs() {
			if (!self.refs['entries-outer']) {
				return setTimeout(checkRefs, 100);
			}

			var scrollDelay = UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value > 0 ? (UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value/100) * 80 : 10;
			var diff = self.refs['entries-outer'].clientHeight - self.refs['entries-inner'].clientHeight;
			setTimeout(function() {
				if (!self.refs['entries-inner']) {
					return;
				}
				self.refs['entries-inner'].style.top = diff+'px';
			}, scrollDelay * 1000);
		})();
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
	},
	getInitialState: function() {
		return {
			'driversInfo': {
				'driversInfo': []
			},
			'eventInfo': {}
		};
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
	getNameColumnTitle: function() {
		if (window.settings.teamEvent) {
			return UI.getStringTranslation("resultsWidget", "team");
		} else {
			return UI.getStringTranslation("resultsWidget", "name");
		}
	},
	render: function() {
		var self = this;
		var eventInfo = self.state.eventInfo;
		if (this.state.driversInfo.driversInfo.length === 0) {
			return null;
		}
		var drivers = this.state.driversInfo.driversInfo;
		if (drivers.filter(function(entry) {
			return entry.scoreInfo.bestLapInfo.sector3 !== -1;
		}).length === 0) {
			return null;
		}

		var fastestTime = 999999;
		var fastestTimeIndex = null;
		drivers.forEach(function(entry, i) {
			if (entry.scoreInfo.bestLapInfo.sector3 !== -1 && entry.scoreInfo.bestLapInfo.sector3 < fastestTime) {
				fastestTime = entry.scoreInfo.bestLapInfo.sector3;
				fastestTimeIndex = i;
			}
		});
		if (drivers[fastestTimeIndex]) {
			drivers[fastestTimeIndex].isFastest = true;
		}

	var session = UI.state.sessionInfo;

		return (
			<div>
			{ session.type === 'QUALIFYING' && session.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value ?
			<div className="overallQuai animated fadeIn">
			<div className="qualify-results">
				<div className="title">
					<div className="text">{eventInfo.serverName} {UI.getStringTranslation("resultsWidget", "qualifyingResults")}<div className="logo"></div></div>
					<div className="trackName">{eventInfo.trackName} {eventInfo.layoutName}</div>
				</div>
				<div className="qualify-results-entry title">
					{ UI.state.controllerOptions.options.multiclass.value === "true" ?
				  		<div className="classPosition"></div>
					:
						<div className="classPositionWhenHidden"></div>
				  	}
				  	<div className="manufacturer"></div>
					<div className="resultsFirstName"></div>
					<div className="resultsLastName"></div>
					<div className="resultTeam"></div>
					<div className="lap-time">{UI.getStringTranslation("resultsWidget", "bestLap")}</div>
					<div className="fastest-time">{UI.getStringTranslation("resultsWidget", "delta")}</div>
					
				</div>
				<div className="entries-outer" ref="entries-outer">
					<div className="entries-inner" ref="entries-inner">
						{drivers.sort(this.sortFunctionPosition).map(function(entry, i) {
							return <ResultEntry entry={entry} firstEntry={drivers[0]} key={i} index={i}/>
						})}
					</div>
				</div>
			</div>
			</div>
				:
				null
				}
				</div>
		);
	}
});

var ResultEntry = React.createClass({
	getClassColour: function(classId) {
		var classColour = "rgba(38, 50, 56, 0.8)";
		var className = "";

		if (r3eData.classes[classId] != null && r3eClassColours.classes[classId] != null) {
			classColour = r3eClassColours.classes[classId].colour;
			className = r3eData.classes[classId].Name;
		}

		return {	'border-left': classColour + ' 1em solid' };
	},
	getTeamName: function(teamId, portalId) {
		var self = this;
		var teamName = "";
		var portalTeamName = UI.getUserInfo(portalId).team;
		if (window.settings.teamEvent) {
			return "";
		} else if (UI.state.controllerOptions.options.showPortalTeam.value === "true" && portalTeamName != null) {
			teamName = portalTeamName;
		} else if (r3eData.teams[teamId] != null) {
			teamName = r3eData.teams[teamId].Name;
		}
		return teamName;
	},
	getFirstName: function(str) {
		str = UI.fixName(str);
		var parts = str.split(' ');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		return parts[0];
	},
	getLastName: function(str) {
		str = UI.fixName(str);
		var parts = str.split(' ');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		parts.shift();
		return parts.join(' ');
	},
	render: function() {
		var self = this;
		var entry = self.props.entry;
		var lapTime = null;
		if (entry.scoreInfo.bestLapInfo.sector3 === -1) {
			return null;
		}
		if (this.props.index === 0) {
			lapTime = <div className="fastest-time">-</div>
		} else {
			lapTime = <div className="fastest-time">{UI.formatTime(entry.scoreInfo.bestLapInfo.sector3-self.props.firstEntry.scoreInfo.bestLapInfo.sector3)}</div>
		}

		var session = UI.state.sessionInfo;

		return (
			<div className="overall">
			{ session.type === 'QUALIFYING' && session.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value ?
			<div className={cx({'qualify-results-entry': true, 'striped': entry.scoreInfo.positionOverall % 2})}>
			{ UI.state.controllerOptions.options.multiclass.value === "true" ?
				<div className={cx({'classPosition': true, 'first': entry.scoreInfo.positionClass === 1, 'second': entry.scoreInfo.positionClass === 2, 'third': entry.scoreInfo.positionClass === 3})} style={self.getClassColour(entry.classId)}>#{entry.scoreInfo.positionClass}</div>
			:
				null
			}
			{ UI.state.controllerOptions.options.multiclass.value === "false" ?
		  		<div className={cx({'overallPosition': true, 'first': entry.scoreInfo.positionOverall === 1, 'second': entry.scoreInfo.positionOverall === 2, 'third': entry.scoreInfo.positionOverall === 3})}>#{entry.scoreInfo.positionOverall}</div>
			:
				null
		  	}
			
				<div className="manufacturer">
				{!window.settings.offline ?
					<div key={UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 40} className="standingsFlag">
						<img src={'/img/flags/'+UI.getUserInfo(entry.portalId).country+'.png'} />
					</div>
					:
					<div key={UI.formatSessionTime(Math.max(0, UI.state.sessionInfo.timeLeft)).slice(-2) > 40} className="manufacturerFlag">
						<img src={'/img/manufacturers/'+entry.manufacturerId+'.png'} />
					</div>
				}
				</div>

				<div className="resultsFirstName">{self.getFirstName(entry.name)}</div>
				<div className="resultsLastName">{self.getLastName(entry.name)}</div>
				<div className="resultTeam">{self.getTeamName(entry.teamId, entry.portalId)}</div>
				{ UI.state.controllerOptions.options.multiclass.value === "true" ?
						<div className={cx({'fastest': entry.scoreInfo.positionClass === 1, 'lap-time': true})}>{UI.formatTime(entry.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
					:
						<div className={cx({'fastest': entry.scoreInfo.positionOverall === 1, 'lap-time': true})}>{UI.formatTime(entry.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
				}
				
				{lapTime}
			</div>
			:
			null
			}
			</div>
		);
	}
});
