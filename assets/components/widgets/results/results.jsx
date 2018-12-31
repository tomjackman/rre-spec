UI.widgets.Results = React.createClass({
	componentWillMount: function() {
		var self = this;

		// Hide all other overlays besides logo
		Object.keys(UI.state.activeWidgets).forEach(function(key) {
			if (key.match(/(Results|LogoOverlay|SessionInfo|AutoDirector)/)) {
				return;
			}

			UI.state.activeWidgets[key].active = false;
		});
		io.emit('setState', UI.state);

		function updateInfo() {
			UI.batch({
				'driversInfo': r3e.getDriversInfo
			}, self.setState.bind(self));
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);

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
			}, 10 * 1000);
		})();
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
	},
	getInitialState: function() {
		return {
			'driversInfo': {
				'driversInfo': []
			}
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
	render: function() {
		var self = this;
		if (this.state.driversInfo.driversInfo.length === 0) {
			return null;
		}
		var drivers = this.state.driversInfo.driversInfo;
		if (drivers.filter(function(entry) {
			return entry.scoreInfo.bestLapInfo.sector3 !== -1;
		}).length === 0) {
			return null;
		}

		var fastestTime = 99999;
		var fastestTimeIndex = null;
		drivers.forEach(function(entry, i) {
			if (entry.scoreInfo.bestLapInfo.sector3 < fastestTime) {
				fastestTime = entry.scoreInfo.bestLapInfo.sector3;
				fastestTimeIndex = i;
			}
		});
		if (drivers[fastestTimeIndex]) {
			drivers[fastestTimeIndex].isFastest = true
		}

	var session = UI.state.sessionInfo;

	if (session.type === 'QUALIFYING' && session.timeLeft < 26) {
		// Hide widgets that use the same screen space
		UI.state.activeWidgets.FocusedDriver.active = false;
	}

		return (
			<div className="overallQuai">
			{ session.type === 'QUALIFYING' && session.timeLeft <= UI.controllerOptions.options.qualifyingResultsDisplayTime.value ?
			<div className="qualify-results">
				<div className="title">
					<div className="text">Qualifying Results<div className="logo"></div></div>
				</div>
				<div className="qualify-results-entry title">
					{ UI.controllerOptions.options.multiclass.value === "true" ?
				  	<div className="classPosition">Class</div>
					:
						null
				  }
					<div className="position">Overall</div>
					<div className="manufacturer"/>
					{ UI.controllerOptions.options.multiclass.value === "true" ?
						<div className="name" style={{'width': '30%'}}>Name</div>
					:
						<div className="name" style={{'width': '40%'}}>Name</div>
					}
					<div className="livery"></div>
					<div className="fastest-time">Delta</div>
					<div className="lap-time">Best lap time</div>
				</div>
				<div className="entries-outer" ref="entries-outer">
					<div className="entries-inner" ref="entries-inner">
						{drivers.sort(this.sortFunctionPosition).map(function(entry, i) {
							return <ResultEntry entry={entry} firstEntry={drivers[0]} key={i} index={i}/>
						})}
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

		return {	'backgroundColor': classColour };
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
			{ session.type === 'QUALIFYING' && session.timeLeft <= UI.controllerOptions.options.qualifyingResultsDisplayTime.value ?
			<div className={cx({'fastest': entry.isFastest, 'qualify-results-entry': true})}>
			{ UI.controllerOptions.options.multiclass.value === "true" ?
				<div className={cx({'classPosition': true})} style={self.getClassColour(entry.classId)}>Class P{entry.scoreInfo.positionClass}.</div>
			:
				null
			}
			<div className="position">P{entry.scoreInfo.positionOverall}.</div>
				<div className="manufacturer">
					<img src={'/render/'+entry.manufacturerId+'/small/'}/>
				</div>
				{ UI.controllerOptions.options.multiclass.value ?
					<div className="name" style={{'width': '30%'}}>{UI.fixName(entry.name)}</div>
				:
					<div className="name" style={{'width': '40%'}}>{UI.fixName(entry.name)}</div>
				}
				<div className="livery">
					<img src={'/render/'+entry.liveryId+'/small/'}/>
				</div>
				{lapTime}
				<div className="lap-time">{UI.formatTime(entry.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
			</div>
			:
			null
			}
			</div>
		);
	}
});
