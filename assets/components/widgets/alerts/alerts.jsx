UI.widgets.Alert = React.createClass({
  componentWillMount: function() {
		var self = this;
	},
	render: function() {
		var self = this;
    var event = self.props.event;

    var driveThroughPenalty = "a Drive Through Penalty has been awarded for ";

    var stopAndGoPenalty = "a Stop & Go Penalty has been awarded for ";

    var stopAndGoPenalty = "has been disqualified for ";

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
          text: driveThroughPenalty + "a False Start"
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
          text: "a Mandatory Pit was not taken within the Pitstop Window"
        }
      },
      // Time Penalty
      '3': {

      },
      // Slowdown Penalty
      '4': {
        '1': {
          text: "a Slow Down Penalty has been awarded for track limits abuse"
        },
        '2': {
          text: "a Slow Down Penalty has been awarded for continuing to abuse track limits"
        }
      },
      // Disqualified
      '5': {
        '0': {
          text: "a false start"
        },
        '1': {
          text: "speeding in the pitlane"
        },
        '2': {
          text: "driving the wrong way on track"
        },
        '3': {
          text: "entering the pits under red"
        },
        '4': {
          text: "exiting the pits under red"
        },
        '8': {
          text: "ignoring a drive through penalty"
        },
        '9': {
          text: "ignoring a stop & go penalty"
        },
        '10': {
          text: "ignoring a pitstop penalty"
        },
        '11': {
          text: "ignoring a time penalty"
        },
        '12': {
          text: "excessive cutting"
        },
        '13': {
          text: "ignoring blue flags"
        }
      }
    };

		return (
      <div>
        {event != null && event.driverName != null && penaltyMeanings[event.type] != null && penaltyMeanings[event.type][event.reason] != null && penaltyMeanings[event.type][event.reason].text != null ?
        <div className={"alert animated fadeInRight "+(event.removing ? 'removing' : '')}>
          <div className="raceControlAlert">Stewards</div>
    			<div className="alertMessage">Incident involving {event.driverName}, {penaltyMeanings[event.type][event.reason].text}</div>
        </div>
        :
        null
      }
    </div>
		);
	}
});
