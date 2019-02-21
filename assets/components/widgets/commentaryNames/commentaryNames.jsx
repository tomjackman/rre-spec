UI.widgets.CommentaryNames = React.createClass({
  componentWillUnmount: function() {
    // hide safety car indicator when dismounting
		UI.state.activeWidgets.CommentaryNames.active = false;
	},
  render: function() {
		var self = this;

    // hide when the event info widget is open.
    if (UI.state.activeWidgets.EventInfo.active === true) {
      return null;
    }

		return (
      <div className="commentaryNameAlert slit-in-commentary">
        <div className="commentaryTitle">Commentary</div>
  			<div className="commentaryName">{UI.state.controllerOptions.options.commentaryNames.value ? UI.state.controllerOptions.options.commentaryNames.value : '-'}</div>
      </div>
		);
	}
});
