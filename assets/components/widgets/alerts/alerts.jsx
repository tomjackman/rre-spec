UI.widgets.Alert = React.createClass({
  componentWillMount: function() {
		var self = this;
	},
	render: function() {
		var self = this;
    var event = self.props.event;

    var spaceComma = ", ";

    var driveThroughPenalty = UI.getStringTranslation("alertsWidget", "driveThroughPenalty") + spaceComma;

    var stopAndGoPenalty = UI.getStringTranslation("alertsWidget", "stopAndGoPenalty") + spaceComma;

    var disqualification = UI.getStringTranslation("alertsWidget", "disqualified") + spaceComma;

    var penaltyMeanings = {
      // Drive Through
      '0': {
        '1': {
          text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "trackLimitsAbuse")
        },
        '2': {
          text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "speedingInThePitlane")
        },
        '3': {
          text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "falseStart")
        },
        '4': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "ignoringBlueFlags")
        },
        '5': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "drivingTooSlow")
        },
        '6': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforeGreen")
        },
        '7': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforeFinish")
        },
        '8': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforePitEntrance")
        },
        '9': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "ignoringSlowDownWarnings")
        },
        '10': {
          text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "accumulatingTheMaxNumberOfPenalties")
        }
      },
      // Stop and Go
      '1': {
        '2': {
          text: stopAndGoPenalty + UI.getStringTranslation("alertsWidget", "trackLimitsAbuse")
        },
        '3': {
          text: stopAndGoPenalty + UI.getStringTranslation("alertsWidget", "overtakingUnderYellow")
        }
      },
      // Pitstop
      '2': {
        '1': {
          text: UI.getStringTranslation("alertsWidget", "missedMandatoryPit")
        }
      },
      // Time Penalty
      '3': {
        '1': {
          text: UI.getStringTranslation("alertsWidget", "mandatoryPitOutsideWindow")
        }
      },
      // Slowdown Penalty
      '4': {
        '1': {
          text: UI.getStringTranslation("alertsWidget", "slowDownTrackLimits")
        },
        '2': {
          text: UI.getStringTranslation("alertsWidget", "slowDownTrackLimitsContinuing")
        }
      },
      // Disqualified
      '5': {
        '0': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "falseStart")
        },
        '1': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "speedingInThePitlane")
        },
        '2': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "drivingWrongWayTrack")
        },
        '3': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "enteringPitsRed")
        },
        '4': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "exitingPitsRed")
        },
        '8': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringDriveThrough")
        },
        '9': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringStopGoPenalty")
        },
        '10': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringPitPenalty")
        },
        '11': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringTimePenalty")
        },
        '12': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "excessiveCutting")
        },
        '13': {
          text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringBlueFlags")
        }
      }
    };

		return (
      <div>
        {UI.state.activeWidgets.Alert.active && event != null && event.driverName != null && penaltyMeanings[event.type] != null && penaltyMeanings[event.type][event.reason] != null && penaltyMeanings[event.type][event.reason].text != null ?
        <div>
          {UI.state.controllerOptions.options.showSlowDownAlerts.value === "true" || event.type != 4 ?
            <div key={event.driverName} className={"alert animated fadeInRight "+(event.removing ? 'removing' : '')}>
              <div className="raceControlAlert">{UI.getStringTranslation("alertsWidget", "stewardsDecision")}</div>
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
