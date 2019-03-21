UI.widgets.EntriesList = React.createClass({
	componentWillMount: function() {
		var self = this;

		function updateInfo() {
			UI.batch({
        'driversInfo': r3e.getDriversInfo,
				'eventInfo': function(done) {
					r3e.getEventInfo(done);
				}
			}, self.setState.bind(self));
		}
		updateInfo();
    self.updateInterval = setInterval(updateInfo, UI.spectatorUpdateRate);
	},
  componentWillUnmount: function() {
    clearInterval(this.updateInterval);
  },
	getInitialState: function() {
		return {
			'eventInfo': {},
      'driversInfo': {
        'driversInfo': []
      }
		};
	},
  sortFunctionPosition: function(a, b) {
    if (a.slotId > b.slotId) {
      return 1;
    } else if (a.slotId === b.slotId) {
      return 0;
    } else {
      return -1;
    }
  },
	render: function() {
		var self = this;
		var info = self.state.eventInfo;
		if (!info.serverName) {
			return null;
		}
    var drivers = self.state.driversInfo.driversInfo;

		return (
      <div className="entries-bg">
      <div class="entries-title">{info.serverName}</div>
  			<div className="entries animated fadeIn">
          <div className="entries-container">
            <ul>
              {drivers.sort(this.sortFunctionPosition).map(function(driver, i) {
                return <EntryDriver driver={driver}></EntryDriver>
              })}
            </ul>
          </div>
  			</div>
      </div>
		);
	}
});

var EntryDriver = React.createClass({
  getTeamName: function(teamId, portalId) {
    var self = this;
    var teamName = "";
    var portalTeamName = UI.getUserInfo(portalId).team;
    if (UI.state.controllerOptions.options.showPortalTeam.value === "true" && portalTeamName != null && portalTeamName.length > 0) {
      // add star for portal team names
      teamName = "✪ " + portalTeamName;
    } else if (r3eData.teams[teamId] != null) {
      teamName = r3eData.teams[teamId].Name;
    }
    return teamName;
  },
	render: function() {
		var self = this;
		var driver = self.props.driver;

		return (
		<div className="entries-driver">
      <div className="entrySlot">{driver.slotId}</div>
      <div className="entryFlag">
      {UI.state.controllerOptions.options.showPortalAvatar.value === "true" ?
        <img src={UI.getUserInfo(driver.portalId).avatar} />
      :
        <img src={'/img/flags/'+UI.getUserInfo(driver.portalId).country+'.png'} />
      }
      </div>
      <div className="entryName">{driver.name}</div>
      <div className="entryTeam">{self.getTeamName(driver.teamId, driver.portalId)}</div>
      <div className="entryLivery">
        <img src={'/render/'+driver.liveryId+'/small/'}/>
      </div>

		</div>
		);
	}
});
