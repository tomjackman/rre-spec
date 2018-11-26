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
			}, 10 * 1000);
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
			<div className="race-results">
				<div className="title">Race results</div>
				<div className="race-results-entry title">
					<div className="position">Position</div>
					<div className="livery"/>
					<div className="manufacturer"/>
					<div className="name">Name</div>
					<div className="lap-time">Finish time</div>
					<div className="fastest-time">Best lap time</div>
				</div>
				<div className="entries-outer" ref="entries-outer">
					<div className="entries-inner" ref="entries-inner">
						{self.props.results.map(function(entry, i) {
							return <RaceResultEntry entry={entry} firstEntry={self.props.results[0]} index={i}/>
						})}
					</div>
				</div>
			</div>
		);
	}
});

var RaceResultEntry = React.createClass({
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

		return (
			<div className={cx({'fastest': entry.isFastest, 'race-results-entry': true})}>
				<div className="position">{entry.positionOverall}.</div>
				<div className="manufacturer">
					<img src={'/img/manufacturers/'+entry.manufacturerId+'.webp'} />
				</div>
				<div className="name">{UI.fixName(entry.name)}</div>
				<div className="livery">
					<img src={'/render/'+entry.liveryId+'/small/'}/>
				</div>
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