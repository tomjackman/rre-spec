UI.widgets.StartingGrid = React.createClass({
	componentWillMount: function() {
		var self = this;

		// Hide all other overlays besides logo
		Object.keys(UI.state.activeWidgets).forEach(function(key) {
			if (key.match(/(StartingGrid|LogoOverlay|AutoDirector)/)) {
				return;
			}

			UI.state.activeWidgets[key].active = false;
		});
		io.emit('setState', UI.state);

		function updateInfo() {
			if (UI.state.sessionInfo.phase !== 'GARAGE') {
				if (UI.state.activeWidgets.StartingGrid.active) {
					UI.state.activeWidgets.StartingGrid.active = false;
					io.emit('setState', UI.state);
				}
				return;
			}
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

		return (
			<div className="start-grid">
				<div className="title">Starting Grid</div>
				<div className="start-grid-entry title">
					<div className="position">Position</div>
					<div className="livery"/>
					<div className="manufacturer"/>
					<div className="name">Name</div>
				</div>
				<div className="entries-outer" ref="entries-outer">
					<div className="entries-inner" ref="entries-inner">
						{drivers.sort(this.sortFunctionPosition).map(function(entry, i) {
							return <StartingGridEntry entry={entry} firstEntry={drivers[0]} key={i} index={i}/>
						})}
					</div>
				</div>
			</div>
		);
	}
});

var StartingGridEntry = React.createClass({
	render: function() {
		var self = this;
		var entry = self.props.entry;
		var lapTime = null;

		if (this.props.index === 0) {
			lapTime = <div className="fastest-time">-</div>
		} else {
			lapTime = <div className="fastest-time">{UI.formatTime(entry.scoreInfo.bestLapInfo.sector3-self.props.firstEntry.scoreInfo.bestLapInfo.sector3)}</div>
		}
		return (
			<div className={cx({'fastest': entry.isFastest, 'start-grid-entry': true})}>
				<div className="position">{entry.scoreInfo.positionOverall}.</div>
				<div className="manufacturer">
					<img src={'/img/manufacturers/'+entry.manufacturerId+'.webp'} />
				</div>
				<div className="name">{UI.fixName(entry.name)}</div>
				<div className="livery">
					<img src={'/render/'+entry.liveryId+'/small/'}/>
				</div>
			</div>
		);
	}
});