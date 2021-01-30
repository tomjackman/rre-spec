function getPenaltyMeanings() {
  var spaceComma = ", ";

  var driveThroughPenalty = UI.getStringTranslation("alertsWidget", "driveThroughPenalty") + spaceComma;
  var stopAndGoPenalty = UI.getStringTranslation("alertsWidget", "stopAndGoPenalty") + spaceComma;
  var disqualification = UI.getStringTranslation("alertsWidget", "disqualified") + spaceComma;

  var penaltyMeanings = {
    // Drive Through
    '0': {
      '1': {text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "trackLimitsAbuse")},
      '2': {text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "speedingInThePitlane")},
      '3': {text: driveThroughPenalty + UI.getStringTranslation("alertsWidget", "falseStart")},
      '4': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "ignoringBlueFlags")},
      '5': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "drivingTooSlow")},
      '6': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforeGreen")},
      '7': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforeFinish")},
      '8': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "illegallyPassingBeforePitEntrance")},
      '9': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "ignoringSlowDownWarnings")},
      '10': {text: driveThroughPenalty +  UI.getStringTranslation("alertsWidget", "accumulatingTheMaxNumberOfPenalties")}
    },
    // Stop and Go
    '1': {
      '2': {text: stopAndGoPenalty + UI.getStringTranslation("alertsWidget", "trackLimitsAbuse")},
      '3': {text: stopAndGoPenalty + UI.getStringTranslation("alertsWidget", "overtakingUnderYellow")}
    },
    // Pitstop
    '2': {
      '1': {text: UI.getStringTranslation("alertsWidget", "missedMandatoryPit")}
    },
    // Time Penalty
    '3': {
      '1': {text: UI.getStringTranslation("alertsWidget", "mandatoryPitOutsideWindow")}
    },
    // Slowdown Penalty
    '4': {
      '1': {text: UI.getStringTranslation("alertsWidget", "slowDownTrackLimits")},
      '2': {text: UI.getStringTranslation("alertsWidget", "slowDownTrackLimitsContinuing")}
    },
    // Disqualified
    '5': {
      '0': {text: disqualification + UI.getStringTranslation("alertsWidget", "falseStart")},
      '1': {text: disqualification + UI.getStringTranslation("alertsWidget", "speedingInThePitlane")},
      '2': {text: disqualification + UI.getStringTranslation("alertsWidget", "drivingWrongWayTrack")},
      '3': {text: disqualification + UI.getStringTranslation("alertsWidget", "enteringPitsRed")},
      '4': {text: disqualification + UI.getStringTranslation("alertsWidget", "exitingPitsRed")},
      '8': {text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringDriveThrough")},
      '9': {text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringStopGoPenalty")},
      '10': {text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringPitPenalty")},
      '11': {text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringTimePenalty")},
      '12': {text: disqualification + UI.getStringTranslation("alertsWidget", "excessiveCutting")},
      '13': {text: disqualification + UI.getStringTranslation("alertsWidget", "ignoringBlueFlags")}
    },
    // Misc
    '6': {
      '0': {text: UI.getStringTranslation("alertsWidget", "classLeaderPitting")},
      '1':{text: UI.getStringTranslation("alertsWidget", "classNewLeader")},
      '2': {text: UI.getStringTranslation("alertsWidget", "classNewFastestLap")},
      '3': {text: UI.getStringTranslation("alertsWidget", "classNewFastestSector")},
      '4': {text: UI.getStringTranslation("alertsWidget", "collision")},
      '5': {text: UI.getStringTranslation("alertsWidget", "offTrack")},
      '6': {text: UI.getStringTranslation("alertsWidget", "stationary")},
      '7': {text: UI.getStringTranslation("alertsWidget", "lostControl")},
      '8': {text: UI.getStringTranslation("alertsWidget", "criticalDamage")},
      '9': {text: UI.getStringTranslation("alertsWidget", "puncture")}
    }
  };

  return penaltyMeanings;
}
