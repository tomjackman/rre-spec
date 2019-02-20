UI.widgets.CommentaryNames = React.createClass({
  componentWillUnmount: function() {
    // hide safety car indicator when dismounting
		UI.state.activeWidgets.CommentaryNames.active = false;
	},
  render: function() {
		var self = this;
		return (
      <div className="commentaryNameAlert animated fadeInRight">
        <div className="raceControl">Commentary</div>
  			<div className="safetyCarIn">Safety Car in this lap</div>
      </div>
		);
	}
});
