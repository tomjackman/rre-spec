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
	render: function() {
		var self = this;
		var info = self.state.eventInfo;
		if (!info.serverName) {
			return null;
		}

    var temperatureMeasurement = "°C";
    var speedMeasurement = "MPH";

    if (!info.metric) {
      temperatureMeasurement = "°F";
      speedMeasurement = "km/h"
    }

		return (
      <div className="event-info-bg animated fadeIn">
  			<div className="event-info">
  				<div className="serverName">{info.serverName}</div>
  				<div className="serverTrackName">{info.trackName} {info.layoutName}</div>
          <img className="trackImage" src={'http://game.raceroom.com/store/image_redirect?id='+info.trackId+'&size=big'} />
            <div className="weather">
              <div className="weatherIcons">
              <div className="weatherInfoAmbientTempImage"><img height="50px" width="50px" src={'/img/weather/ambient-temp.png'} /> {info.weatherInfo.ambientTemp}{temperatureMeasurement} Air</div>
              <div className="weatherInfoTrackTempImage"><img height="50px" width="50px" src={'/img/weather/track-temp.png'} /> {info.weatherInfo.trackTemp}{temperatureMeasurement} Track</div>
              <div className="weatherInfoWindSpeedImage"><img height="50px" width="50px" src={'/img/weather/wind.png'} /> {info.weatherInfo.windSpeed} {speedMeasurement}</div>
              <div className="weatherInfoConditionsImage"><img height="50px" width="50px" src={'/img/weather/conditions.png'} /> {info.weatherInfo.conditions}</div>
              </div>
            </div>
  			</div>
      </div>
		);
	}
});
