UI.widgets.RaceResults = React.createClass({
	componentWillMount: function() {
		var self = this;


		function updateInfo() {
			UI.batch({
				'eventInfo': function(done) {
					r3e.getEventInfo(done);
				}
			}, self.setState.bind(self));
		}
		updateInfo();

		(function checkRefs() {
			if (!self.refs['entries-outer']) {
				return setTimeout(checkRefs, 100);
			}

			var diff = self.refs['entries-outer'].clientHeight - self.refs['entries-inner'].clientHeight;
			setTimeout(function() {
				if (!self.refs['entries-inner']) {
					return;
				}
				self.refs['entries-inner'].style.top = diff+'px';
			}, 25 * 1000);
		})();1
	},
	getInitialState: function() {
		return {
			'eventInfo': {}
		};
	},
	getNameColumnTitle: function() {
		if (window.settings.teamEvent) {
			return UI.getStringTranslation("raceResultsWidget", "team");
		} else {
			return UI.getStringTranslation("raceResultsWidget", "name");
		}
	},
	getName: function(name) {
		if (window.settings.teamEvent) {
			return name.substr(name.indexOf(" ") + 1);
		} else {
			return UI.fixName(name);
		}
	},
	render: function() {
		var self = this;
		var fastestTime = 999999;
		var fastestTimeIndex = null;
		var winnerIndex = null;
		self.props.results.forEach(function(entry, i) {
			if (entry.bestLapInfo.sector3 !== -1 && entry.bestLapInfo.sector3 < fastestTime) {
				fastestTime = entry.bestLapInfo.sector3;
				fastestTimeIndex = i;
			}
			if (entry.positionOverall === 1) {
				winnerIndex = i;
			}
		});

		if (self.props.results[fastestTimeIndex]) {
			self.props.results[fastestTimeIndex].isFastest = true;
		}

		var fastestDriver = self.props.results[fastestTimeIndex];
		var winningDriver = self.props.results[winnerIndex];

		var self = this;
		var eventInfo = self.state.eventInfo;

		return (
			<div>
			{ winningDriver != null ?
				<div className="winnerColumn animated fadeInLeft delay-2s">
					<div className="driverName">{self.getName(winningDriver.name)}</div>
					<div className="winnerTitle">{UI.getStringTranslation("raceResultsWidget", "raceWinner")}</div>
				</div>
			:
				null
			}
			{ fastestDriver != null ?
			<div className="fastestDriverColumn animated fadeInRight delay-2s">
				<div className="fastestDriverName">{self.getName(fastestDriver.name)}</div>
				<div className="fastestTitle">{UI.getStringTranslation("raceResultsWidget", "fastestLap")}</div>
			</div>
			:
				null
			}
			<div className="race-results-bg">
			<div className="race-results animated fadeIn">
			<div className="title">
				<div className="text">{eventInfo.serverName} {UI.state.sessionInfo.type.match(/^Race 1/i) ? UI.getStringTranslation("raceResultsWidget", "race") : UI.state.sessionInfo.type} Results<div className="logo"></div></div>
				<div className="trackName">{eventInfo.trackName} {eventInfo.layoutName}</div>
			</div>
				<div className="race-results-entry title">
					{ UI.state.controllerOptions.options.multiclass.value === "true" ?
						<div className="classPosition"></div>
					:
						<div className="classPositionWhenHidden"></div>
					}
					<div className="position"></div>
					<div className="manufacturer"/>
					<div className="raceResultFirstName"></div>
					<div className="raceResultLastName"></div>
					<div className="raceResultTeam"></div>
					<div className="penaltyTime">{UI.getStringTranslation("raceResultsWidget", "penalties")}</div>
					<div className="lap-time">{UI.getStringTranslation("raceResultsWidget", "finishTime")}</div>
					<div className="fastest-time">{UI.getStringTranslation("raceResultsWidget", "bestLap")}</div>
				</div>
				<div className="entries-outer" ref="entries-outer">
					<div className="entries-inner" ref="entries-inner">
						{self.props.results.map(function(entry, i) {
							return <RaceResultEntry entry={entry} firstEntry={self.props.results[0]} index={i}/>
						})}
					</div>
				</div>
			</div>
			</div>
			</div>
		);
	}
});

var RaceResultEntry = React.createClass({
	getClassColour: function(performanceIndex) {
		var classColour = "rgba(38, 50, 56, 0.8)";

		if (performanceIndex != null) {
			classColour = UI.getClassColour(performanceIndex)
		}

		return {	'border-left': classColour + ' 0.5em solid' };
	},
	getTeamName: function(teamId, portalId) {
		var self = this;
		var teamName = "";
		var portalTeamName = UI.getUserInfo(portalId).team;
		if (window.settings.teamEvent) {
			return "";
		} else if (UI.state.controllerOptions.options.showPortalTeam.value === "true" && portalTeamName != null && portalTeamName.length > 0) {
			teamName = portalTeamName;
		} else if (UI.state.controllerOptions.options.showPortalTeam.value === "true" && portalTeamName != null && portalTeamName.length === 0) {
			teamName = UI.getStringTranslation("raceResultsWidget", "privateer");
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
	getName: function(name) {
		if (window.settings.teamEvent) {
			return name.substr(name.indexOf(" ") + 1);
		} else {
			return UI.fixName(name);
		}
	},
	render: function() {
		var self = this;
		var entry = self.props.entry;
		var lapTime = null;
		if (entry.finishStatus === 'DNF') {
			lapTime = <div className="lap-time">{UI.getStringTranslation("raceResultsWidget", "dnf")}</div>
		} else if (entry.finishStatus === 'DNS') {
			lapTime = <div className="lap-time">{UI.getStringTranslation("raceResultsWidget", "dns")}</div>
		} else if (entry.finishStatus === 'DQ') {
			lapTime = <div className="lap-time">{UI.getStringTranslation("raceResultsWidget", "dq")}</div>
		}	else if (self.props.index === 0) {
			lapTime = <div className="lap-time">{UI.formatTime(entry.totalTime, {ignoreSign: true})}</div>
		} else if (entry.lapsBehind === 1) {
			lapTime = <div className="lap-time">+{entry.lapsBehind} {UI.getStringTranslation("raceResultsWidget", "laps")}</div>
		} else if (entry.lapsBehind > 1) {
			lapTime = <div className="lap-time">+{entry.lapsBehind} {UI.getStringTranslation("raceResultsWidget", "laps")}</div>
		} else {
			lapTime = <div className="lap-time">{UI.formatTime(entry.totalTime-self.props.firstEntry.totalTime)}</div>
		}

		// race penalties
		var penaltyTime = <div className="penaltyTime" style={{'min-width': '4.5em'}}> - </div>
		if (entry.penaltyTime && entry.penaltyWeight) {
			penaltyTime = <div className="penaltyTime" style={{color: 'rgba(255, 82, 82, 1.0)'}}>{(entry.penaltyTime/1000)}s/{entry.penaltyWeight}KG</div>
		} else if (entry.penaltyTime) {
			penaltyTime = <div className="penaltyTime" style={{color: 'rgba(255, 82, 82, 1.0)'}}>{(entry.penaltyTime/1000)}s</div>
		} else if (entry.penaltyWeight) {
			penaltyTime = <div className="penaltyTime" style={{color: 'rgba(255, 82, 82, 1.0)'}}>{entry.penaltyWeight}KG</div>
		}

		return (
			<div className={cx({'fastest': entry.isFastest, 'race-results-entry': true, 'striped': entry.positionOverall % 2})}>
				{ UI.state.controllerOptions.options.multiclass.value === "true" ?
					<div className={cx({'classPosition': true, 'first': entry.positionClass === 1, 'second': entry.positionClass === 2, 'third': entry.positionClass === 3})} style={self.getClassColour(entry.performanceIndex)}>#{entry.positionClass}</div>
				:
					null
				}
				{ UI.state.controllerOptions.options.multiclass.value === "false" ?
			  		<div className={cx({'overallPosition': true, 'first': entry.positionOverall === 1, 'second': entry.positionOverall === 2, 'third': entry.positionOverall === 3})}>#{entry.positionOverall}</div>
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
						<img src={'/render/'+entry.manufacturerId+'/small/?type=manufacturer'}/>
					</div>
				}
				</div>
				<div className="raceResultFirstName">{self.getFirstName(entry.name)}</div>
				<div className="raceResultLastName">{self.getLastName(entry.name)}</div>
				<div className="raceResultTeam">{self.getTeamName(entry.teamId, entry.portalId)}</div>
				{penaltyTime}
				{lapTime}
				{entry.bestLapInfo.sector3 !== -1 ?
	        	<div className="fastest-time">{UI.formatTime(entry.bestLapInfo.sector3, {ignoreSign: true})}</div>
	          :
					<div className="fastest-time">-</div>
				}
			</div>
		);
	}
});
