UI.widgets.QrCode = React.createClass({
  componentWillUnmount: function() {
    // hide qr code indicator when dismounting
		UI.state.activeWidgets.QrCode.active = false;
	},
  render: function() {
		var self = this;

		var url = UI.state.controllerOptions.options.qrCodeURL.value ? UI.state.controllerOptions.options.qrCodeURL.value : 'https://game.raceroom.com/competitions/';

		var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?data=" + url + "&amp;size=150x150";

		return (
      <div className="qrCode animated fadeInRight">
        <div className="title">{UI.state.controllerOptions.options.qrCodeText.value ? UI.state.controllerOptions.options.qrCodeText.value : '-'}</div>
  			<div className="qrContainer"><img id='qrcodeimg' src={qrUrl}/></div>
      </div>
		);
	}
});
