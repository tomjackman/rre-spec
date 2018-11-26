UI.components.App = React.createClass({
	render: function() {
		if (window.gameClient) {
			return <UI.components.Spectator></UI.components.Spectator>
		} else {
			return <UI.components.Controller></UI.components.Controller>
		}
	}
});