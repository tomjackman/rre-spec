var fs = require('fs');
var request = require('request');
var generateExport = require('./generateExport');
var previousSession = '';
var settings = require('./../../assets/settings.js');

function flattenObj(obj, parent, res = {}){
    for(let key in obj){
        let propName = parent ? parent + '_' + key : key;
        if(typeof obj[key] == 'object'){
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const exportRate = 1000;

const getUserInfo = (function() {
	var userCache = {};
	return function(id) {
		if (settings.offline === true) {
			return {
				country: '',
				avatar: `/render/${id}/small/?type=avatar`,
				team: ''
			};
		}

		if (userCache[id]) {
			return userCache[id];
		}

		userCache[id] = {
			country: '',
			countryName: '',
			avatar: '',
			rank: '',
			team: ''
		};

		request('http://localhost:9090/user-info/'+id, {json: true}, (err,res,data)=> {
			if (err) {
				// Retry fetching user if call failed
				delete userCache[id];
				return;
			}
			userCache[id] = data;
		});

		return userCache[id];
	};
})();

module.exports = function(io, globalState) {
	var state = {
		resultsUpdate: false
	};
	var dataHasChanged = false;

	io.sockets.on('connection', function(socket) {
		socket.on('driversInfo', function(data) {
			state.driversInfo = data.map((driver) => {
				const portalInfo = getUserInfo(driver.portalId);
				driver.teamPortal =  portalInfo.team;
				driver.countryCode =  portalInfo.country;
				driver.countryName =  portalInfo.countryName;
				return driver;
			});
			dataHasChanged = true;
		});
		socket.on('sessionInfo', function(data) {
			state.sessionInfo = data;
			dataHasChanged = true;
		});
		socket.on('eventInfo', function(data) {
			state.eventInfo = data;
			dataHasChanged = true;
		});
		socket.on('resultsUpdate', function(data) {
			data.Results = data.Results.map((driver) => {
				const portalInfo = getUserInfo(driver.portalId);
				driver.teamPortal =  portalInfo.team;
				driver.countryCode =  portalInfo.country;
				driver.countryName =  portalInfo.countryName;
				return driver;
			})
			state.resultsUpdate = data;
			dataHasChanged = true;
		});
	});

	setInterval(function() {
		if (!dataHasChanged) {
			return;
		}

		dataHasChanged = false;

		var driverInfo = state.driversInfo.map((driver) => {
			return flattenObj(driver);
		});

		// Copy the qualifications so they can be accessed after the session changes
		if (previousSession === 'QUALIFYING' && state.sessionInfo.type !== 'QUALIFYING') {
			fs.copyFileSync(__dirname + '/../../export.xlsx', __dirname + '/../../export_qualifying.xlsx');
			fs.copyFileSync(__dirname + '/../../export.json', __dirname + '/../../export_qualifying.json');
		}

		// Clear end of race results when it is no longer valid
		if (previousSession !== state.sessionInfo.type) {
			state.resultsUpdate = false;
		}

		previousSession = state.sessionInfo.type;

		generateExport({
			driverInfo: driverInfo,
			sessionInfo: flattenObj(state.sessionInfo),
			eventInfo: flattenObj(state.eventInfo),
			resultsUpdate: state.resultsUpdate,
			globalState: globalState
		});
	}, exportRate);
}
