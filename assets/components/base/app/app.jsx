UI.components.App = React.createClass({
	componentWillMount() {
		this.showUpdateAlert = false;
	},
	openInNewTab: function() {
		// Overlay thread on S3 forum
		let base64ForumUrl = "aHR0cHM6Ly9mb3J1bS5zZWN0b3Izc3R1ZGlvcy5jb20vaW5kZXgucGhwP3RocmVhZHMvcjNlLXJlYWxpdHktbW9kZXJuLWJyb2FkY2FzdC1vdmVybGF5LjEyMDYxLw==";
	  window.open(atob(base64ForumUrl), '_blank');
	},
	async isNewVersionAvailable() {
		var self = this;
		// github repo with version.json
		let base64PublishedVersionUrl = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RvbWphY2ttYW4vcnJlLXNwZWMvbWFzdGVyL3B1YmxpYy92ZXJzaW9uLmpzb24=';
		let localVersionUrl = 'version.json';

		const published = await fetch(atob(base64PublishedVersionUrl));
		const publishedVersion = await published.json();

		const local = await fetch(localVersionUrl);
		const localVersion = await local.json();
		console.log("Current Version: " + localVersion.version);

		if(publishedVersion.version > localVersion.version) {
			var confirmText = "A New update is now Available in the Sector 3 Forums (forum.sector3studios.com), visit download page?";
			if (confirm(confirmText)) {
				self.openInNewTab();
			}
		} else {
			console.log("Current Version is up to date");
		}
	},
	render: function() {
		var self = this;
		// check if new version is available in the sector 3 forums.
		self.isNewVersionAvailable();

		if (window.gameClient) {
			return <UI.components.Spectator></UI.components.Spectator>
		} else {
			return <UI.components.Controller></UI.components.Controller>
		}
	}
});
