UI.components.Spectator = React.createClass({
	componentWillMount: function() {
		var self = this;
		self.update = setInterval(function() {
			r3e.getDriversInfo(function(driversInfo) {
				var jobs = [];
				var driverData = driversInfo.driversInfo;
				driverData.forEach(function(driver) {
					jobs.push(function(done) {
						r3e.getVehicleInfo({
						    'slotId': driver.slotId
						}, function(vehicleInfo) {
							driver.vehicleInfo = vehicleInfo;
							done();
						});
					});
					jobs.push(function(done) {
						r3e.getPitInfo({
							'slotId': driver.slotId
						}, function(pitInfo) {
							driver.pitInfo = pitInfo;
							done();
						});
					});
					jobs.push(function(done) {
						r3e.getExtendedInfo({
							'slotId': driver.slotId
						}, function(extendedInfo) {
							driver.extendedInfo = extendedInfo;
							done();
						});
					});
					jobs.push(function(done) {
						r3e.getPushToPassInfo({
							'slotId': driver.slotId
						}, function(pushToPassInfo) {
							driver.pushToPassInfo = pushToPassInfo;
							done();
						});
					});
					jobs.push(function(done) {
						r3e.getVehicleInfo({
							'slotId': driver.slotId
						}, function(vehicleInfo) {
							driver.vehicleInfo = vehicleInfo;
							done();
						});
					});
				});
				UI.batch(jobs, function(data) {
					r3e.getSessionInfo(function(sessionInfo) {
						r3e.getEventInfo(function(eventInfo) {
							io.emit('driversInfo', driverData);
							io.emit('sessionInfo', sessionInfo);
							io.emit('eventInfo', eventInfo);
						});
					});
				});
			});
		}, UI.controllerUpdateRate);

		r3e.waitOnResults({'wait': true})

		// Race control alerts
		var eventTimeout;
		r3e.on.eventOccurred(function(event) {
			var alertLength = UI.state.controllerOptions.options.alertLength.value * 1000;

			r3e.getDriverInfo({'slotId': event.slotId
			}, function(driverInfo) {

				event.driverName = driverInfo.name;
				self.setState({
					'event': event
				});
			});

			eventTimeout = setTimeout(function() {
				event.removing = true;
				self.setState({
					'event': event
				});

				eventTimeout = setTimeout(function() {
					self.setState({
						'event': null
					});
				}, alertLength+1)
			}, alertLength);
		});

		r3e.on.resultsUpdate(function(results) {
			var continueToNextSessionTime = UI.state.controllerOptions.options.continueToNextSessionTime.value  * 1000;

			self.setState({
				'results': results.Results
			});

			setTimeout(function() {
				r3e.goToNextEvent();
			}, continueToNextSessionTime);
		});

		var pitWindowTimeout;
		if (r3e.on.pitWindowInfo) {
			r3e.on.pitWindowInfo(function(pitWindowInfo) {
				if (pitWindowTimeout) {
					clearTimeout(pitWindowTimeout);
				}
				self.setState({
					'pitWindowInfo': pitWindowInfo
				});

				pitWindowTimeout = setTimeout(function() {
					pitWindowInfo.removing = true;
					self.setState({
						'pitWindowInfo': pitWindowInfo
					});

					pitWindowTimeout = setTimeout(function() {
						self.setState({
							'pitWindowInfo': null
						});
					}, 1000)
				}, 10*1000);
			});
		}

		io.on('updatedState', self.setState.bind(self));
		io.on('updatedCamera', self.updatedCamera);
	},
	getInitialState: function() {
		return {
			'results': null,
			'pitWindowInfo': null,
			'event': null
		}
	},
	componentWillUnmount: function() {
		io.removeListener('updatedState', self.setState);
		io.removeListener('updatedCamera', self.updatedCamera);
		clearInterval(this.update);
	},
	updatedCamera: function(opts) {
		var self = this;
		opts = opts || {};
		if (!opts.fade) {
			if (!r3e.setCamera[self.state.camera]) {
				throw new Error('"'+self.state.camera+'" is not a valid camera');
			}
			return r3e.setCamera[self.state.camera](self.state.focusedSlot);
		}

		// Fade to back for a split second if fade is passed
		var cameraFadeEl = this.refs.cameraFade;
		cameraFadeEl.addEventListener("transitionend", function() {
			r3e.setCamera[self.state.camera](self.state.focusedSlot);
			cameraFadeEl.classList.remove('active');
		});
		cameraFadeEl.classList.add('active');
	},
	render: function() {
		var self = this;
		var themeClass = UI.state.activeTheme;
		return (
			<div>
			<div className="app-spectator">
				{Object.keys(UI.state.activeWidgets).map(function(type) {
					return (!self.state.results && UI.state.activeWidgets[type].active) ? React.createElement(UI.widgets[type], {'key': type}) : null
				})}
				{self.state.results && UI.state.sessionInfo.type.match(/^race/i) ?
					<UI.widgets.RaceResults results={self.state.results}/>
					:
					null
				}
				{self.state.event ?
					<UI.widgets.Alert event={self.state.event}/>
					:
					null
				}
				{self.state.pitWindowInfo ?
					<div className={"pit-window-information "+(self.state.pitWindowInfo.removing ? 'removing' : '')}>
					{self.state.pitWindowInfo.opensIn ?
						<div className="opening">
							Pitlane will open in {self.state.pitWindowInfo.minutes}
							{self.state.pitWindowInfo.minutes === 1 ?
								" minutes"
								:
								" minute"
							}
						</div>
						:
						<div className="closing">
							Pitlane will close in {self.state.pitWindowInfo.minutes}
							{self.state.pitWindowInfo.minutes === 1 ?
								" minutes"
								:
								" minute"
							}
						</div>
					}
					</div>
					:
					null
				}
				<div className="camera-fade" ref="cameraFade"/>
			</div>
			</div>
		);
	}
});
