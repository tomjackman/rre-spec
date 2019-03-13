UI.widgets.EventInfo = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
				'eventInfo': function(done) {
					r3e.getEventInfo(done);
				}
			}, self.setState.bind(self));
		}
		updateInfo();
	},
	getInitialState: function() {
		return {
			'eventInfo': {}
		};
	},
	getCountryCode: function(trackId) {
		var countryCode = "";

		if (r3eTracks.tracks[trackId] != null) {
			countryCode = r3eTracks.tracks[trackId].countryCode;
		}

		return countryCode;
	},
	formatMeasurement: function(value) {
		return Math.round(value * 100) / 100;
	},
	render: function() {
		var self = this;
		var info = self.state.eventInfo;
		if (!info.serverName) {
			return null;
		}

		var ambientTemp = info.weatherInfo.ambientTemp;
		var trackTemp = info.weatherInfo.trackTemp;
		var windSpeed = info.weatherInfo.windSpeed;

    var temperatureMeasurement = "°C";
    var speedMeasurement = "km/h";

    if (!info.metric) {
			windSpeed = self.formatMeasurement(windSpeed * 1.609);
			trackTemp = self.formatMeasurement((trackTemp * 9/5) + 32);
			ambientTemp = self.formatMeasurement((ambientTemp * 9/5) + 32);
      temperatureMeasurement = "°F";
      speedMeasurement = "MPH"
    }

		var trackLogo = r3eTracks.tracks[info.trackId] && r3eTracks.tracks[info.trackId].trackLogoUrl ? r3eTracks.tracks[info.trackId].trackLogoUrl : null;
		var trackDescription = r3eTracks.tracks[info.trackId] && r3eTracks.tracks[info.trackId].description ? r3eTracks.tracks[info.trackId].description : null;

		if (UI.state.sessionInfo.type === 'QUALIFYING' && UI.state.sessionInfo.timeLeft <= UI.state.controllerOptions.options.qualifyingResultsDisplayTime.value) {
			return null;
		}

		return (
      <div className="event-info-bg">
  			<div className="event-info animated fadeIn">
  				<div className="serverName">{info.serverName}</div>
          <div className="trackImage">
						<img src={`/render/${info.trackId}/big/?type=track`} />
						<div className="trackLogo">
						{!window.settings.offline && <img src={trackLogo} />}
						</div>
					</div>
					<div className="countryFlag">
						<img src={'/img/flags/'+self.getCountryCode(info.trackId)+'.svg'} />
					</div>
					<div className="serverTrackName">{info.trackName} {info.layoutName}</div>
					<div className="trackDescription">{trackDescription}</div>
					  <div className="weather">
              <div className="weatherIcons">
              <div className="weatherInfoAmbientTempImage"><img height="40px" width="40px" src={'/img/weather/ambient-temp.png'} /> {ambientTemp}{temperatureMeasurement} Air</div>
              <div className="weatherInfoTrackTempImage"><img height="40px" width="40px" src={'/img/weather/track-temp.png'} /> {trackTemp}{temperatureMeasurement} Track</div>
              <div className="weatherInfoWindSpeedImage"><img height="40px" width="40px" src={'/img/weather/wind.png'} /> {windSpeed} {speedMeasurement}</div>
              <div className="weatherInfoConditionsImage"><img height="40px" width="40px" src={'/img/weather/conditions.png'} /> {info.weatherInfo.conditions}</div>
              </div>
            </div>
  			</div>
      </div>
		);
	}
});
