UI.widgets.DirectorSuggestions = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			r3e.getDriversInfo(function(data) {
				var jobs = [];
				data.driversInfo.forEach(function(driver) {
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
								}, done);
							},
							'extendedInfo': function(done) {
								r3e.getExtendedInfo({
									'slotId': driver.slotId
								}, done);
							}
						}, function(data) {
							driver.pitInfo = data.pitInfo;
							driver.vehicleInfo = data.vehicleInfo;
							driver.extendedInfo = data.extendedInfo;
							done(driver);
						});

					});
				});

				// Find out which one should get the focus
				UI.batch(jobs, function(drivers) {
					var possibleDrivers = [];
					drivers.forEach(function(driver) {
						var points = 0;
						var log = [];
						Object.keys(UI.scoringRules).forEach(function(key) {
							var rule = UI.scoringRules[key];
							var prePoint = points;
							points = rule.bind(self)(points, driver, drivers);
							var delta = points-prePoint;
							if (delta && !key.match(/(priorizeLeaders)/)) {
								log.push('- '+key+': '+delta.toFixed(2));
							}
						});
						log.push('Total: '+points.toFixed(2)+'\n');
						possibleDrivers.push({
							'title': driver.name+' (#'+driver.scoreInfo.positionOverall+')',
							'score': points,
							'slotId': driver.slotId,
							'log': log.join('\n').trim()
						});
					});

					possibleDrivers = possibleDrivers.sort(function(a, b) {
						if (a.score > b.score) {
							return -1;
						} else if (b.score > a.score) {
							return 1;
						} else {
							return 0;
						}
					});

					io.emit('directorSuggestions', possibleDrivers);
				});
			});
		}
		updateInfo();

		self.updateInterval = setInterval(updateInfo, 1*500);
	},
	componentWillUnmount: function() {
		clearInterval(this.updateInterval);
	},
	render: function() {
		return (<div />);
	}
});