UI.widgets.Alert = React.createClass({
  componentWillMount: function() {
		var self = this;
	},
	render: function() {
		var self = this;
    var event = self.props.event;

    var driveThroughPenalty = "Drive Through Penalty, ";

    var stopAndGoPenalty = "Stop & Go Penalty, ";

    var disqualification = "Disqualified, ";

    var penaltyMeanings = {
      // Drive Through
      '0': {
        '1': {
          text: driveThroughPenalty + "Track Limits Abuse"
        },
        '2': {
          text: driveThroughPenalty + "Speeding in the Pitlane"
        },
        '3': {
          text: driveThroughPenalty + "False Start"
        },
        '4': {
          text: driveThroughPenalty + "Ignoring Blue Flags"
        },
        '5': {
          text: driveThroughPenalty + "Driving Too Slow"
        },
        '6': {
          text: driveThroughPenalty + "Illegally Passing Before Green"
        },
        '7': {
          text: driveThroughPenalty + "Illegally Passing Before the Finish"
        },
        '8': {
          text: driveThroughPenalty + "Illegally Passing Before the Pit Entrance"
        },
        '9': {
          text: driveThroughPenalty + "Ignoring Slow Down Warnings"
        },
        '10': {
          text: driveThroughPenalty + "Accumulating the Maximum Number of Penalties Permitted"
        }
      },
      // Stop and Go
      '1': {
        '2': {
          text: stopAndGoPenalty + "Track Limits Abuse"
        },
        '3': {
          text: stopAndGoPenalty + "Overtaking Under Yellows"
        }
      },
      // Pitstop
      '2': {
        '1': {
          text: "Mandatory Pit not taken within the Pitstop Window"
        }
      },
      // Time Penalty
      '3': {

      },
      // Slowdown Penalty
      '4': {
        '1': {
          text: "Slow Down Penalty, track limits abuse"
        },
        '2': {
          text: "Slow Down Penalty, continuing to abuse track limits"
        }
      },
      // Disqualified
      '5': {
        '0': {
          text: disqualification + "false start"
        },
        '1': {
          text: disqualification + "speeding in the pitlane"
        },
        '2': {
          text: disqualification + "driving the wrong way on track"
        },
        '3': {
          text: disqualification + "entering the pits under red"
        },
        '4': {
          text: disqualification + "exiting the pits under red"
        },
        '8': {
          text: disqualification + "ignoring a drive through penalty"
        },
        '9': {
          text: disqualification + "ignoring a stop & go penalty"
        },
        '10': {
          text: disqualification + "ignoring a pitstop penalty"
        },
        '11': {
          text: disqualification + "ignoring a time penalty"
        },
        '12': {
          text: disqualification + "excessive cutting"
        },
        '13': {
          text: disqualification + "ignoring blue flags"
        }
      }
    };

		return (
      <div>
        {UI.state.activeWidgets.Alert.active && event != null && event.driverName != null && penaltyMeanings[event.type] != null && penaltyMeanings[event.type][event.reason] != null && penaltyMeanings[event.type][event.reason].text != null ?
        <div>
          {UI.state.controllerOptions.options.showSlowDownAlerts.value === "true" || event.type != 4 ?
            <div key={event.driverName} className={"alert animated fadeInRight "+(event.removing ? 'removing' : '')}>
              <div className="raceControlAlert">Stewards</div>
              { window.settings.teamEvent ?
        			<div className="alertMessage">{event.driverName.substr(event.driverName.indexOf(" ") + 1)} - {penaltyMeanings[event.type][event.reason].text}</div>
                :
              <div className="alertMessage">{event.driverName} - {penaltyMeanings[event.type][event.reason].text}</div>
              }
            </div>
          :
            null
          }
        </div>
        :
        null
      }
    </div>
		);
	}
});
