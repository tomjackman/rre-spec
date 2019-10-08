UI.widgets.DriverOfTheDay = React.createClass({
  componentWillUnmount: function() {
    // hide driver of the day indicator when dismounting
		UI.state.activeWidgets.DriverOfTheDay.active = false;
	},
  render: function() {
		var self = this;

    // hide when the event info widget is open.
    if (UI.state.activeWidgets.EventInfo.active === true) {
      return null;
    }

		return (
      <div className="driverOfTheDayAlert animated fadeIn">
        <div className="dotdTitle">{UI.getStringTranslation("driverOfTheDayWidget", "driverOfTheDay")}</div>
  			<div className="dotdName">{UI.state.controllerOptions.options.driverOfTheDay.value ? UI.state.controllerOptions.options.driverOfTheDay.value : '-'}</div>
      </div>
		);
	}
});
