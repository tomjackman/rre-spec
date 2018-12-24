UI.widgets.EventInfo = React.createClass({
	componentWillMount: function() {
		var self = this;

		io.emit('setState', UI.state);

		function updateInfo() {
			UI.batch({
				'eventInfo': function(done) {
					r3e.getEventInfo(done);
				}
			}, self.setState.bind(self));
		}
		updateInfo();
	},
	componentWillUnmount: function() {

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

		return (
      <div className="event-info-bg animated fadeIn">
  			<div className="event-info">
  				<div className="serverName">{info.serverName}</div>
          <div className="trackImage">
						<img src={'http://game.raceroom.com/store/image_redirect?id='+info.trackId+'&size=big'} />
						<div className="countryFlag">
							<img src={'/img/flags/'+self.getCountryCode(info.trackId)+'.svg'} />
						</div>
						<div className="trackLogo">
							<img src={r3eTracks.tracks[info.trackId].trackLogoUrl} />
						</div>
					</div>
					<div className="serverTrackName">{info.trackName} {info.layoutName}</div>
					<div className="trackDescription">{r3eTracks.tracks[info.trackId].description}</div>
					  <div className="weather">
              <div className="weatherIcons">
              <div className="weatherInfoAmbientTempImage"><img height="50px" width="50px" src={'/img/weather/ambient-temp.png'} /> {ambientTemp}{temperatureMeasurement} Air</div>
              <div className="weatherInfoTrackTempImage"><img height="50px" width="50px" src={'/img/weather/track-temp.png'} /> {trackTemp}{temperatureMeasurement} Track</div>
              <div className="weatherInfoWindSpeedImage"><img height="50px" width="50px" src={'/img/weather/wind.png'} /> {windSpeed} {speedMeasurement}</div>
              <div className="weatherInfoConditionsImage"><img height="50px" width="50px" src={'/img/weather/conditions.png'} /> {info.weatherInfo.conditions}</div>
              </div>
            </div>
  			</div>
      </div>
		);
	}
});
