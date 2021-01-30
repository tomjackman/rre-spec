var xl = require('excel4node');
var fs = require('fs');

// Fetch all the R3E data
eval(fs.readFileSync('./../assets/deps/r3e-data.min.js').toString());

function generateExport(data) {
	var wb = new xl.Workbook();

	var driversInfo = wb.addWorksheet('driversInfo');
	var sessionInfo = wb.addWorksheet('sessionInfo');
	var eventInfo = wb.addWorksheet('eventInfo');
	var raceResults = wb.addWorksheet('raceResults');
	var gameState = wb.addWorksheet('gameState');

	function getType(value) {
		var type = typeof value;
		if (type === 'boolean') {
			return 'bool';
		}

		return type;
	}

	function fixColumnWidth(worksheet, column, key) {
		if (key.match(/name/i)) {
			worksheet.column(column).setWidth(25);
		} else {
			worksheet.column(column).setWidth(Math.max(key.length * 1.05, 10));
		}
	}

	var driversInfoKeyOrder = [
		'name',
		'slotId',
		'portalId',
		'teamId',
		'teamName',
		'classId',
		'className',
		'manufacturerId',
		'manufacturerName',
		'liveryId',
		'liveryName',
		'carName',
		'performanceIndex',
		'mandatoryPitstopPerformed',
		'scoreInfo_positionOverall',
		'scoreInfo_positionClass',
		'scoreInfo_laps',
		'scoreInfo_distanceTravelled',
		'scoreInfo_currentLapTime',
		'scoreInfo_bestLapInfo_valid',
		'scoreInfo_bestLapInfo_sector1',
		'scoreInfo_bestLapInfo_sector2',
		'scoreInfo_bestLapInfo_sector3',
		'scoreInfo_distanceDiff',
		'scoreInfo_timeDiff',
		'scoreInfo_lapDiff',
		'scoreInfo_flagInfo_black',
		'scoreInfo_flagInfo_blue',
		'scoreInfo_flagInfo_yellow',
		'vehicleInfo_slotId',
		'vehicleInfo_rpm',
		'vehicleInfo_gear',
		'vehicleInfo_speed',
		'vehicleInfo_drsLeft',
		'vehicleInfo_drsEnabled',
		'pitInfo_slotId',
		'pitInfo_servedMandatoryPitstop',
		'pitInfo_tyreType',
		'pitInfo_damage_engine',
		'pitInfo_damage_transmission',
		'pitInfo_damage_frontAero',
		'pitInfo_damage_rearAero',
		'pushToPassInfo_slotId',
		'pushToPassInfo_allowed',
		'pushToPassInfo_active',
		'pushToPassInfo_amountLeft',
		'pushToPassInfo_durationTimer',
		'pushToPassInfo_waitTimer',
		'extendedInfo_slotId',
		'extendedInfo_currentSector',
		'extendedInfo_currentLapInfo_valid',
		'extendedInfo_currentLapInfo_sector1',
		'extendedInfo_currentLapInfo_sector2',
		'extendedInfo_currentLapInfo_sector3',
		'extendedInfo_lastTenLapsInfo_0_valid',
		'extendedInfo_lastTenLapsInfo_0_sector1',
		'extendedInfo_lastTenLapsInfo_0_sector2',
		'extendedInfo_lastTenLapsInfo_0_sector3',
		'extendedInfo_lastTenLapsInfo_1_valid',
		'extendedInfo_lastTenLapsInfo_1_sector1',
		'extendedInfo_lastTenLapsInfo_1_sector2',
		'extendedInfo_lastTenLapsInfo_1_sector3',
		'extendedInfo_lastTenLapsInfo_2_valid',
		'extendedInfo_lastTenLapsInfo_2_sector1',
		'extendedInfo_lastTenLapsInfo_2_sector2',
		'extendedInfo_lastTenLapsInfo_2_sector3',
		'extendedInfo_lastTenLapsInfo_3_valid',
		'extendedInfo_lastTenLapsInfo_3_sector1',
		'extendedInfo_lastTenLapsInfo_3_sector2',
		'extendedInfo_lastTenLapsInfo_3_sector3',
		'extendedInfo_lastTenLapsInfo_4_valid',
		'extendedInfo_lastTenLapsInfo_4_sector1',
		'extendedInfo_lastTenLapsInfo_4_sector2',
		'extendedInfo_lastTenLapsInfo_4_sector3',
		'extendedInfo_lastTenLapsInfo_5_valid',
		'extendedInfo_lastTenLapsInfo_5_sector1',
		'extendedInfo_lastTenLapsInfo_5_sector2',
		'extendedInfo_lastTenLapsInfo_5_sector3',
		'extendedInfo_lastTenLapsInfo_6_valid',
		'extendedInfo_lastTenLapsInfo_6_sector1',
		'extendedInfo_lastTenLapsInfo_6_sector2',
		'extendedInfo_lastTenLapsInfo_6_sector3',
		'extendedInfo_lastTenLapsInfo_7_valid',
		'extendedInfo_lastTenLapsInfo_7_sector1',
		'extendedInfo_lastTenLapsInfo_7_sector2',
		'extendedInfo_lastTenLapsInfo_7_sector3',
		'extendedInfo_lastTenLapsInfo_8_valid',
		'extendedInfo_lastTenLapsInfo_8_sector1',
		'extendedInfo_lastTenLapsInfo_8_sector2',
		'extendedInfo_lastTenLapsInfo_8_sector3',
		'extendedInfo_lastTenLapsInfo_9_valid',
		'extendedInfo_lastTenLapsInfo_9_sector1',
		'extendedInfo_lastTenLapsInfo_9_sector2',
		'extendedInfo_lastTenLapsInfo_9_sector3',
		'teamPortal',
		'countryCode',
		'countryName',
	];

	var resultsKeyOrder = [
		'name',
		'portalId',
		'teamId',
		'classId',
		'manufacturerId',
		'liveryId',
		'positionOverall',
		'positionClass',
		'finishStatus',
		'totalTime',
		'lapsBehind',
		'penaltyTime',
		'penaltyWeight',
		'bestLapInfo_valid',
		'bestLapInfo_sector1',
		'bestLapInfo_sector2',
		'bestLapInfo_sector3',
		'isFastest',
		'teamPortal',
		'countryCode',
		'countryName',
	];

	var headerStyle = wb.createStyle({
		font: {
			bold: true,
		},
	});

	const globalState = data.globalState();

	// Set camera state
	gameState.cell(1, 1).string('Focused slot').style(headerStyle);
	gameState.cell(1, 2).number(globalState.focusedSlot);

	gameState.cell(2, 1).string('Camera').style(headerStyle);
	gameState.cell(2, 2).string(globalState.camera);

	gameState.cell(3, 1).string('Last update').style(headerStyle);
	gameState.cell(3, 2).number(Date.now());

	driversInfoKeyOrder.forEach(function (key, i) {
		driversInfo
			.cell(1, i + 1)
			.string(key)
			.style(headerStyle);
		fixColumnWidth(driversInfo, i + 1, key);
	});

	data.driverInfo.forEach(function (driver, driverIndex) {
		driver.teamName = r3eData.teams[driver.teamId]
			? r3eData.teams[driver.teamId].Name
			: '?';
		driver.className = r3eData.classes[driver.classId]
			? r3eData.classes[driver.classId].Name
			: '?';
		driver.manufacturerName = r3eData.manufacturers[driver.manufacturerId]
			? r3eData.manufacturers[driver.manufacturerId].Name
			: '?';
		driver.liveryName = r3eData.liveries[driver.liveryId]
			? r3eData.liveries[driver.liveryId].Name
			: '?';
		driver.carName =
			r3eData.liveries[driver.liveryId] &&
			r3eData.cars[r3eData.liveries[driver.liveryId].Car]
				? r3eData.cars[r3eData.liveries[driver.liveryId].Car].Name
				: '?';

		driversInfoKeyOrder.forEach(function (key, i) {
			if (driver[key] === undefined) {
				return;
			}

			var da = driver[key];
			driversInfo.cell(2 + driverIndex, i + 1)[getType(da)](da);
		});
	});

	Object.keys(data.eventInfo)
		.sort()
		.forEach(function (key, i) {
			var da = data.eventInfo[key];
			eventInfo
				.cell(1, i + 1)
				.string(key)
				.style(headerStyle);
			fixColumnWidth(eventInfo, i + 1, key);
			eventInfo.cell(2, i + 1)[getType(da)](da);
		});

	Object.keys(data.sessionInfo)
		.sort()
		.forEach(function (key, i) {
			var da = data.sessionInfo[key];
			sessionInfo
				.cell(1, i + 1)
				.string(key)
				.style(headerStyle);
			fixColumnWidth(sessionInfo, i + 1, key);
			sessionInfo.cell(2, i + 1)[getType(da)](da);
		});

	raceResults.cell(1, 1).string('Loaded').style(headerStyle);
	raceResults.cell(1, 2).bool(!!data.resultsUpdate);

	if (data.resultsUpdate) {
		resultsKeyOrder.forEach(function (key, i) {
			raceResults
				.cell(2, i + 1)
				.string(key)
				.style(headerStyle);
			fixColumnWidth(raceResults, i + 1, key);
		});

		data.resultsUpdate.Results.forEach(function (driver, driverIndex) {
			resultsKeyOrder.forEach(function (key, i) {
				if (driver[key] === undefined) {
					return;
				}

				var da = driver[key];
				raceResults.cell(3 + driverIndex, i + 1)[getType(da)](da);
			});
		});
	}

	wb.write(__dirname + '/../../export.xlsx');

	fs.writeFile(
		__dirname + '/../../export.json',
		JSON.stringify(data, null, '  '),
		() => {}
	);
}

module.exports = generateExport;
