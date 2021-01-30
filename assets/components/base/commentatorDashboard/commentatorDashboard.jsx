UI.components.CommentatorDashboard = React.createClass({
	maxIncidents: 100,
	getInitialState: function () {
		return {
			driversInfo: [],
			incidents: [],
			facts: []
		};
	},
	types: [
		'Drive Through',
		'Stop And Go',
		'Pitstop',
		'Time',
		'Slowdown',
		'Disqualify',
	],
	fastestLap: -1,
	session: -1,
	eventId: 0,
	reasons: {},
	componentWillMount: function () {
		io.on('driversInfo', this.setDriversInfo);
		io.on('incident', this.addIncident);

		this.setupReasons();
	},
	setupReasons: function () {
		this.reasons = getPenaltyMeanings();
	},
	componentWillUnmount: function () {
		io.removeListener('driversInfo', this.setDriversInfo);
		io.removeListener('incident', this.addIncident);
	},

	addIncident: function (incident) {
		let incidents = this.state.incidents;
		incident.time = Date.now();
		this.eventId += 1;
		incident.id = this.eventId;
		incidents.unshift(incident);

		if (incidents.length > this.maxIncidents) {
			incidents = incidents.slice(0, this.maxIncidents);
		}

		this.setState({
			incidents: incidents,
		});
	},
	addFact: function (fact) {
		const facts = this.state.facts;

		fact.time = Date.now();
		this.eventId += 1;
		fact.id = this.eventId;

		facts.unshift(fact);
		if (facts.length > this.maxfacts) {
			facts = facts.slice(0, this.maxfacts);
		}

		this.setState({
			facts: facts,
		});
	},
	checkFastestLap: function (driversInfo) {
		let fastestLapTime = Number.MAX_SAFE_INTEGER;
		let fastestLapDriver = null;
		driversInfo.forEach((driver) => {
			const bestlap = driver.scoreInfo.bestLapInfo;
			if (!bestlap || bestlap.valid === false) {
				return;
			}
			if (bestlap.sector3 < fastestLapTime) {
				fastestLapTime = bestlap.sector3;
				fastestLapDriver = driver;
			}
		});
		if (!fastestLapDriver) {
			return;
		}

		if (this.fastestLap === -1) {
			this.fastestLap = fastestLapTime;
		} else if (this.fastestLap > fastestLapTime || this.fastestLap === -1) {
			this.fastestLap = fastestLapTime;
			this.addFact({
				slotId: fastestLapDriver.slotId,
				content: (
					<div>
						{fastestLapDriver.name} posted a new fastest lap:{' '}
						{UI.formatTime(this.fastestLap, { ignoreSign: true })}
					</div>
				),
			});
		}
	},
	handleSessionReset: function () {
		const session = UI.state.sessionInfo;
		const newSession = session.type;
		if (this.session === -1) {
			this.session = newSession;
		}
		if (this.session !== newSession) {
			this.fastestLap = -1;
			this.setState({
				incidents: [],
				facts: [],
			});
		}
		this.session = newSession;
	},
	setDriversInfo: function (driversInfo) {
		this.checkFastestLap(driversInfo);

		this.setState({
			driversInfo: driversInfo,
		});

		this.handleSessionReset();
	},
	renderIncidents: function () {
		const reasons = this.reasons;
		const state = this.state;

		return this.state.incidents.map((incident) => {
			let reason = '';
			let driver = '';
			try {
				reason = reasons[incident.type][incident.reason].text;
				driver = state.driversInfo.find(function (driver) {
					return driver.slotId === incident.slotId;
				});
			} catch (e) {}

			if (!driver || !reason || !driver) {
				return null;
			}

			return (
				<div
					className={cx({
						'row-entry': true,
						focused: incident.slotId === UI.state.focusedSlot,
					})}
					key={incident.id}
					data-id={incident.slotId}
					onClick={this.changeCameraToDriver}
				>
					<div className="incident-data">
						<span className="name">{driver.name}:</span>
						<span>{reason}</span>
					</div>
					<div className="timer"></div>
				</div>
			);
		});
	},
	renderFacts: function () {
		return this.state.facts.map((fact) => {
			return (
				<div
					className={cx({
						'row-entry': true,
						focused: fact.slotId === UI.state.focusedSlot,
					})}
					key={fact.id}
					data-id={fact.slotId}
					onClick={this.changeCameraToDriver}
				>
					{fact.content}
					<div className="timer"></div>
				</div>
			);
		});
	},
	changeCamera: function(camera, slotId) {
		UI.state.focusedSlot = slotId;
		UI.state.camera = camera;
		io.emit('setState', UI.state);
		io.emit('updatedCamera', {});
	},
	changeCameraToDriver: function(e) {
		const slotId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
		if (isNaN(slotId)) {
			return;
		}
		this.changeCamera('trackside', slotId);
	},
	calculateEstimatedLapsLeft: function () {
		const session = UI.state.sessionInfo;
		const estimatedLapTimeFastestInSec =
			this.fastestLap !== -1 ? this.fastestLap / 1000 : -1;

		let estimatedLapTimeLatestInSec = -1;
		try {
			if (
				this.state.driversInfo[0].extendedInfo.lastTenLapsInfo[0]
					.sector3 !== -1
			) {
				estimatedLapTimeLatestInSec =
					this.state.driversInfo[0].extendedInfo.lastTenLapsInfo[0]
						.sector3 / 1000;
			}
		} catch (e) {}

		const isLastLaps =
			this.fastestLap !== -1 &&
			estimatedLapTimeFastestInSec > session.timeLeft;

		let latestLapsLeft = -1;
		let fastestLapsLeft = -1;
		try {
			if (estimatedLapTimeLatestInSec !== -1) {
				latestLapsLeft = session.timeLeft / estimatedLapTimeLatestInSec;
			}
		} catch (e) {}

		try {
			if (estimatedLapTimeFastestInSec !== -1) {
				fastestLapsLeft =
					session.timeLeft / estimatedLapTimeFastestInSec;
			}
		} catch (e) {}

		if (session.phase === 'CHECKERED' || session.phase === 'END') {
			latestLapsLeft = 0;
			fastestLapsLeft = 0;
		}

		const minLapsLeft = Math.min(latestLapsLeft, fastestLapsLeft);
		const maxLapsLeft = Math.max(latestLapsLeft, fastestLapsLeft);

		return {
			isLastLaps,
			minLapsLeft,
			maxLapsLeft,
		};
	},
	render: function () {
		const session = UI.state.sessionInfo;
		const {
			isLastLaps,
			minLapsLeft,
			maxLapsLeft,
		} = this.calculateEstimatedLapsLeft();

		return (
			<div className="commentator-dashboard">
				<div
					className={cx({
						title: true,
						isLastLaps: isLastLaps,
					})}
				>
					{session.type && session.phase ? (
						<span>
							{UI.getStringTranslation(
								'sessionInfoWidget',
								session.type.toLowerCase().replace(/ /g, '')
							)}{' '}
							-{' '}
							{UI.getStringTranslation(
								'sessionInfoWidget',
								session.phase.toLowerCase().replace(/ /g, '')
							)}
							: {UI.formatSessionTime(session.timeLeft)}/
							{UI.formatSessionTime(session.timeTotal)}
						</span>
					) : null}
					<span className="estimated">
						 - Est laps left -{' '}
						{minLapsLeft !== -1 && (
							<span>{minLapsLeft.toFixed(2)}x</span>
						)}
						{minLapsLeft !== -1 && minLapsLeft !== -1 && (
							<span> - </span>
						)}
						{maxLapsLeft !== -1 && (
							<span>{maxLapsLeft.toFixed(2)}x</span>
						)}
						{minLapsLeft === -1 && maxLapsLeft === -1 && (
							<span>?</span>
						)}
					</span>
				</div>

				<div className="content">
					<div className="row facts">
						<div className="box">
							<div className="row-title">Interesting events</div>
							<div className="row-entries">
								{this.renderFacts()}
							</div>
						</div>
					</div>
					<div className="row incidents">
						<div className="box">
							<div className="row-title">Incidents</div>
							<div className="row-entries">
								{this.renderIncidents()}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
});
