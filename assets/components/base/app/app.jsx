UI.components.App = React.createClass({
	render: function() {
		if (window.gameClient) {
			return <UI.components.Spectator />
		} else {
			if (window.location.pathname === '/dashboard') {
				return <UI.components.CommentatorDashboard />
			} else if (window.location.pathname === '/overview') {
				return <UI.components.Overview />
			} else {
				return <UI.components.Controller />
			}
		}
	}
});
