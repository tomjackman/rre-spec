UI.widgets.RaceResults = React.createClass({
	componentWillMount: function() {
		var self = this;
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
		})();
	},
	render: function() {
		var self = this;
		var fastestTime = 99999;
		var fastestTimeIndex = null;
		self.props.results.forEach(function(entry, i) {
			if (entry.bestLapInfo.sector3 !== -1 && entry.bestLapInfo.sector3 < fastestTime) {
				fastestTime = entry.bestLapInfo.sector3;
				fastestTimeIndex = i;
			}
		});

		if (self.props.results[fastestTimeIndex]) {
			self.props.results[fastestTimeIndex].isFastest = true
		}
		var self = this;
		return (
			<div className="race-results-bg">
			<div className="race-results animated fadeIn">
			<div className="title">
				<div className="text">Race Results<div className="logo"></div></div>
			</div>
				<div className="race-results-entry title">
					{ UI.state.controllerOptions.options.multiclass.value === "true" ?
						<div className="classPosition">Class</div>
					:
						null
					}
					<div className="position">Overall</div>
					<div className="manufacturer"/>
					{ UI.state.controllerOptions.options.multiclass.value === "true" ?
						<div className="shortName">Name</div>
					:
						<div className="longName">Name</div>
					}
					<div className="livery"></div>
					<div className="penaltyTime">Penalties</div>
					<div className="lap-time">Finish Time</div>
					<div className="fastest-time">Best Lap Time</div>
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
		);
	}
});

var RaceResultEntry = React.createClass({
	getClassColour: function(classId) {
		var classColour = "rgba(38, 50, 56, 0.8)";
		var className = "";

		if (r3eData.classes[classId] != null && r3eClassColours.classes[classId] != null) {
			classColour = r3eClassColours.classes[classId].colour;
			className = r3eData.classes[classId].Name;
		}

		return {	'backgroundColor': classColour };
	},
		render: function() {
		var self = this;
		var entry = self.props.entry;
		var lapTime = null;
		if (entry.finishStatus === 'DNF') {
			lapTime = <div className="lap-time">DNF</div>
		} else if (self.props.index === 0) {
			lapTime = <div className="lap-time">{UI.formatTime(entry.totalTime, {ignoreSign: true})}</div>
		} else {
			lapTime = <div className="lap-time">{UI.formatTime(entry.totalTime-self.props.firstEntry.totalTime)}</div>
		}

		var penaltyTime = <div className="penaltyTime" style={{'min-width': '4.5em'}}> - </div>
		if (entry.penaltyTime) {
			penaltyTime = <div className="penaltyTime" style={{color: 'rgba(255, 82, 82, 1.0)'}}>{(entry.penaltyTime/1000)}s Penalty</div>
		}

		return (
			<div className={cx({'fastest': entry.isFastest, 'race-results-entry': true})}>
			{ UI.state.controllerOptions.options.multiclass.value === "true" ?
				<div className={cx({'classPosition': true})} style={self.getClassColour(entry.classId)}>Class P{entry.positionClass}.</div>
			:
				null
			}
			<div className="position">P{entry.positionOverall}.</div>
				<div className="manufacturer">
					<img src={'/render/'+entry.manufacturerId+'/small/'}/>
				</div>
				{ UI.state.controllerOptions.options.multiclass.value === "true" ?
					<div className="shortName">{UI.fixName(entry.name)}</div>
				:
					<div className="longName">{UI.fixName(entry.name)}</div>
				}
				<div className="livery">
					<img src={'/render/'+entry.liveryId+'/small/'}/>
				</div>
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
