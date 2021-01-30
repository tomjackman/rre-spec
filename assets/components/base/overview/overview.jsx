UI.components.Overview = React.createClass({
	maxIncidents: 100,
	getInitialState: function () {
		return {
			driversInfo: [],
			deltaRelative: true,
			favoriteRelative: true,
			favorites: {},
		};
	},
	closestFightSlotId: -1,
	fastestLap: -1,
	session: -1,
	eventId: 0,
	maxLapsLeft: -1,
	favDrivers: [],
	favoriteMaxLaps: 0,
	reasons: {},
	componentWillMount: function () {
		io.on('driversInfo', this.setDriversInfo);

		this.setupReasons();
	},
	setupReasons: function () {
		this.reasons = getPenaltyMeanings();
	},
	componentWillUnmount: function () {},
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
	changeCamera: function (camera, slotId) {
		UI.state.focusedSlot = slotId;
		UI.state.camera = camera;
		io.emit('setState', UI.state);
		io.emit('updatedCamera', {});
	},
	changeCameraToDriver: function (e) {
		const slotId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
		if (isNaN(slotId)) {
			return;
		}
		this.changeCamera('trackside', slotId);
	},
	toggleDeltaRelative: function (e) {
		const checked = e.currentTarget.checked;
		this.setState({
			deltaRelative: checked,
		});
	},
	toggleFavoriteRelative: function (e) {
		const checked = e.currentTarget.checked;
		this.setState({
			favoriteRelative: checked,
		});
	},
	toggleFavorite: function (e) {
		const slotId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
		const checked = e.currentTarget.checked;
		this.state.favorites[slotId] = checked;

		this.setState({
			favorites: this.state.favorites,
		});
	},
	calculateConsistency: function (laps) {
		let min = Number.MAX_SAFE_INTEGER;
		let max = Number.MIN_SAFE_INTEGER;
		const correctLaps = laps
			.filter((lap) => {
				const time = lap.sector3;

				return time > 0;
			})
			.map((lap) => {
				const time = lap.sector3;

				min = Math.min(min, time);
				max = Math.max(max, time);
			});

		if (correctLaps.length <= 1) {
			return '-';
		}

		const delta = max - min;
		const proc = ((1 - delta / max) * 100).toFixed(2);
		const str = proc + '% <> ' + (delta / 1000).toFixed(3) + 's';
		return str;
	},
	getDriverFastestLap: function (driver) {
		let fastestLap = '-';
		let fastestLapFormatted = '-';
		try {
			fastestLapFormatted =
				driver.scoreInfo.bestLapInfo.sector3 !== -1
					? UI.formatTime(driver.scoreInfo.bestLapInfo.sector3, {
							ignoreSign: true,
					  })
					: '-';

			fastestLap =
				driver.scoreInfo.bestLapInfo.sector3 !== -1
					? driver.scoreInfo.bestLapInfo.sector3
					: -1;
		} catch (e) {}
		return {
			fastestLap,
			fastestLapFormatted,
		};
	},
	getLastLap: function (driver) {
		let lastLap = '-';
		try {
			lastLap =
				driver.extendedInfo.lastTenLapsInfo[0].sector3 !== -1
					? UI.formatTime(
							driver.extendedInfo.lastTenLapsInfo[0].sector3,
							{
								ignoreSign: true,
							}
					  )
					: '-';
		} catch (e) {}

		return lastLap;
	},
	getAverageLap: function (driver) {
		let averageLap = '`?`';
		let averageLapCount = '0';
		try {
			let averageLaps = driver.extendedInfo.lastTenLapsInfo
				.filter(function (lap) {
					return lap.sector3 > -1;
				})
				.slice(0, 5);

			averageLap = averageLaps.reduce(function (
				avg,
				value,
				_,
				{ length }
			) {
				return avg + value.sector3 / length;
			},
			0);
			averageLapCount = averageLaps.length;

			if (averageLapCount > 1) {
				averageLap = UI.formatTime(averageLap, {
					ignoreSign: true,
				});
			} else {
				averageLap = '-';
			}
		} catch (e) {}

		return {
			averageLap,
			averageLapCount,
		};
	},
	getDriverDelta: function (driver, drivers) {
		let delta = '-';
		try {
			if (this.state.deltaRelative) {
				const driverIndex = drivers.findIndex((d) => {
					return driver === d;
				});

				delta = UI.formatTime(
					drivers
						.slice(1, driverIndex + 1)
						.map(function (driver) {
							return Math.max(0, driver.scoreInfo.timeDiff);
						})
						.reduce(function (p, c) {
							return p + c;
						})
				);
			} else {
				delta =
					driver.scoreInfo.timeDiff !== -1
						? UI.formatTime(driver.scoreInfo.timeDiff)
						: '-';
			}
		} catch (e) {}

		return delta;
	},
	renderRow: function (driver) {
		const trackLength = UI.state.eventInfo.length;
		const progress =
			(driver.scoreInfo.distanceTravelled % trackLength) / trackLength;

		let { fastestLap, fastestLapFormatted } = this.getDriverFastestLap(
			driver
		);

		let lastLap = this.getLastLap(driver);

		let { averageLap, averageLapCount } = this.getAverageLap(driver);

		let mandatoryPit = 'No';
		try {
			mandatoryPit =
				driver.mandatoryPitstopPerformed !== -1 ? 'Yes' : 'No';
		} catch (e) {}

		let pushToPassInfo = driver.pushToPassInfo.amountLeft;

		let qDiff = 0;
		try {
			qDiff = '-';
		} catch (e) {}

		let delta = this.getDriverDelta(driver, this.state.driversInfo);

		let drs = '-';
		try {
			drs =
				driver.vehicleInfo.drsLeft !== -1 &&
				driver.vehicleInfo.drsLeft < 100
					? driver.vehicleInfo.drsLeft
					: '-';
		} catch (e) {}

		let incidents = '-';
		let offTracks = '-';

		return (
			<tr
				key={driver.slotId}
				className={cx({
					inactive: driver.vehicleInfo.speed < 10,
				})}
			>
				<td className="focused">
					{driver.slotId === UI.state.focusedSlot && (
						<div className="focused"></div>
					)}
				</td>
				<td className="favorite">
					<input
						type="checkbox"
						data-id={driver.slotId}
						onChange={this.toggleFavorite}
						checked={this.state.favorites[driver.slotId]}
					/>
				</td>
				<td>{driver.scoreInfo.positionOverall}</td>
				<td data-id={driver.slotId} onClick={this.changeCameraToDriver}>
					{driver.name} - {driver.slotId}
				</td>
				<td className="qDiff">{qDiff}</td>
				<td
					className={cx({
						delta: true,
						important: this.closestFightSlotId === driver.slotId,
					})}
				>
					{delta}
				</td>
				<td className="lastLap">{lastLap}</td>
				<td
					className={cx({
						fastestLap: true,
						important:
							fastestLap > 0 && this.fastestLap === fastestLap,
					})}
				>
					{fastestLapFormatted}
				</td>
				<td className="averageLap">
					{averageLap}
					{averageLapCount > 1 && <small> ({averageLapCount})</small>}
				</td>
				<td>
					{this.calculateConsistency(
						driver.extendedInfo.lastTenLapsInfo
					)}
				</td>
				<td className="mandatoryPit">{mandatoryPit}</td>
				<td className="p2p">{pushToPassInfo}</td>
				<td className="drs">{drs}</td>
				<td className="incidents">{incidents}</td>
				<td className="offTracks">{offTracks}</td>
				<td className="positionBar">
					<div className="barContainer">
						<div
							className={cx({
								bar: true,
								closestFight:
									this.closestFightSlotId === driver.slotId,
							})}
							style={{
								width: progress * 100 + '%',
							}}
						></div>
						{driver.scoreInfo.positionOverall === 1 && (
							<div
								className="bar lapLeft"
								style={{
									left: progress * 100 + '%',
									width: this.maxLapsLeft * 100 + '%',
								}}
							></div>
						)}
					</div>
				</td>
			</tr>
		);
	},
	getNormalizedLastLaps: function (driver) {
		let lastLaps = [...driver.extendedInfo.lastTenLapsInfo];
		const lapDiff = this.favoriteMaxLaps - driver.scoreInfo.laps;

		// Pad last laps so the index of last laps line up across favorites
		for (let i = 0; i < lapDiff; i += 1) {
			lastLaps.unshift({
				valid: true,
				sector3: -1,
			});
		}
		return lastLaps.slice(0, 9);
	},
	renderFavorite: function (driver) {
		let lastLaps = this.getNormalizedLastLaps(driver);

		const compareLapsRelative = this.state.favoriteRelative;
		let driverCompareTo = null;
		if (compareLapsRelative) {
			driverCompareTo = [...this.favDrivers].sort((a, b) => {
				return (
					a.scoreInfo.positionOverall - b.scoreInfo.positionOverall
				);
			})[0];
		}

		let { fastestLap, fastestLapFormatted } = this.getDriverFastestLap(
			driver
		);

		let lastLap = this.getLastLap(driver);

		let { averageLap, averageLapCount } = this.getAverageLap(driver);

		const favoriteLeaderIndex = [...this.state.driversInfo].findIndex(
			(d) => {
				return d.slotId === driverCompareTo
					? driverCompareTo.slotId
					: -1;
			}
		);

		let delta = this.getDriverDelta(
			driver,
			[...this.state.driversInfo].slice(favoriteLeaderIndex)
		);

		return (
			<div
				key={driver.slotId}
				data-id={driver.slotId}
				className="box favorite"
			>
				<div className="row-title">
					<img
						className="flag"
						src={
							'/img/flags/' +
							UI.getUserInfo(driver.portalId).country +
							'.png'
						}
					/>
					{driver.name}{' '}
					{UI.getUserInfo(driver.portalId).team
						? <small>({UI.getUserInfo(driver.portalId).team})</small>
						: ''}
				</div>
				<div className="info">
					<div className="col meta">
						<table>
							<tbody>
								<tr>
									<td>Pos</td>
									<td>#{driver.scoreInfo.positionOverall}</td>
								</tr>
								<tr>
									<td>Fastest</td>
									<td>{fastestLapFormatted}</td>
								</tr>
								<tr>
									<td>Average</td>
									<td>{averageLap}</td>
								</tr>
								<tr>
									<td>Delta</td>
									<td>{delta}</td>
								</tr>
							</tbody>
						</table>
						<div className="carRenderContainer">
							<img
								className="carRender"
								src={`/render/${driver.liveryId}/small`}
							/>
							<div className="aspect"></div>
						</div>
					</div>
					<div className="col lastLaps">
						<div className="lap-title">
							Last laps
							<label className="relative">
								Relative
								<input
									type="checkbox"
									onChange={this.toggleFavoriteRelative}
									checked={this.state.favoriteRelative}
								/>
							</label>
						</div>
						{lastLaps.map((lap, i) => {
							if (compareLapsRelative) {
								if (!driverCompareTo) {
									return null;
								}
								const compareLap = this.getNormalizedLastLaps(
									driverCompareTo
								)[i];
								const compareTime = compareLap
									? compareLap.sector3
									: -1;

								const delta = lap.sector3 - compareTime;
								return (
									<div
										className={cx({
											lap: true,
											invalid: !lap.valid,
											positive: delta < 0,
											negative: delta > 0
										})}
										key={i}
									>
										<label>
											Lap {this.favoriteMaxLaps - i}:{' '}
										</label>
										{lap.sector3 > 0 && compareTime > 0
											? UI.formatTime(
												delta,
													{}
											  )
											: '-'}
									</div>
								);
							} else {
								return (
									<div
										className={cx({
											lap: true,
											invalid: !lap.valid,
										})}
										key={i}
									>
										<label>
											Lap {this.favoriteMaxLaps - i}:{' '}
										</label>
										{lap.sector3 > 0
											? UI.formatTime(lap.sector3, {
													ignoreSign: true,
											  })
											: '-'}
									</div>
								);
							}
						})}
					</div>
				</div>
			</div>
		);
	},
	renderFavorites: function () {
		this.favDrivers = [...this.state.driversInfo].filter(
			(driver) => this.state.favorites[driver.slotId]
		);
		//.sort((a, b) => a.name.localeCompare(b.name));
		this.favoriteMaxLaps = 0;

		this.favDrivers.forEach((driver) => {
			this.favoriteMaxLaps = Math.max(
				this.favoriteMaxLaps,
				driver.scoreInfo.laps
			);
		});

		return (
			<div className="favorites">
				{this.favDrivers.map(this.renderFavorite)}
			</div>
		);
	},
	renderDriverTable: function () {
		const closestFight = this.state.driversInfo
			.filter((driver) => {
				return driver.scoreInfo.timeDiff > 0;
			})
			.sort((a, b) => {
				return a.scoreInfo.timeDiff - b.scoreInfo.timeDiff;
			});
		this.closestFightSlotId = closestFight[0] ? closestFight[0].slotId : -1;

		return (
			<div className="box">
				<table className="race-info">
					<thead>
						<tr>
							<th></th>
							<th>Fav</th>
							<th>Pos</th>
							<th>Name</th>
							<th>Q-Dif</th>
							<th>
								<label>
									Delta
									<input
										type="checkbox"
										onChange={this.toggleDeltaRelative}
										checked={this.state.deltaRelative}
									/>
								</label>
							</th>
							<th>Last Lap</th>
							<th>Fastest Lap</th>
							<th>AVG Lap</th>
							<th>Cons.</th>
							<th>Man. Pit</th>
							<th>P2P</th>
							<th>DRS</th>
							<th>Incidents</th>
							<th>Off-Tracks</th>
							<th>Track position</th>
						</tr>
					</thead>
					<tbody>{this.state.driversInfo.map(this.renderRow)}</tbody>
				</table>
			</div>
		);
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

		this.maxLapsLeft = maxLapsLeft;

		return (
			<div className="overview">
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

				<div className="content favoritesContainer">
					{this.renderFavorites()}
				</div>
				<div className="content">
					<div className="row debug">
						{this.renderDriverTable(maxLapsLeft)}
					</div>
				</div>
			</div>
		);
	},
});
