var clickEventType = ('ontouchstart' in window ? 'touchstart' : 'click');
var currentDriver = UI.state.focusedSlot;
var currentState = {};
var TrackMap = React.createClass({
	componentDidMount: function() {
		var svg = this.refs.svg;
		svg.onload = this.setupSvg;
	},
	setupSvg: function() {
		var self = this;
		var svg = self.refs.svg;
		var svgDoc = svg.contentDocument;
		var svgEl = svgDoc.querySelector('svg');
		var path = svgDoc.querySelector('path');
		if (!path || !path.style) {
			return;
		}

		path.style.stroke = '#fff';
		path.style.strokeWidth = '3px';

		self.state.svg.loaded = true;
		self.state.svg.path = path;
		self.state.svg.el = svgEl;
		self.resizeToFill();
	},
	windowResize: null,
	componentWillMount: function() {
		window.addEventListener('resize', this.resizeToFill, false);
	},
	componentWillUnmount: function() {
		window.removeEventListener('resize', this.resizeToFill, false);
	},
	resizeToFill: function() {
		var self = this;
		if (!self.state.svg.el) {
			return;
		}

		var width = self.state.svg.el.getAttribute('width');
		var height = self.state.svg.el.getAttribute('height');

		var widthRatio = window.innerWidth / width;
		var heightRatio = window.innerHeight / height;

		var ratio = Math.min(widthRatio, heightRatio)*0.95;

		var containerEl = self.refs.container;
		containerEl.style.width = width+'px';
		containerEl.style.height = height+'px';
		containerEl.style.webkitTransform = 'scale('+ratio+') translate(-50%, -50%)';
	},
	getInitialState: function() {
		return {
			'svg': {
				'path': null,
				'el': null,
				'loaded': false
			},
			'fastest': {
				'progress': 0,
				'speed': 0,
				'name': null
			}
		};
	},
	getTimeTrapStyle: function(progress) {
		var svg = this.state.svg;
		if (!svg.path) {
			return {
				'display': 'none'
			};
		}

		var totalLength = svg.path.getTotalLength();
		var point = svg.path.getPointAtLength(totalLength*progress);
		return {
			'WebkitTransform': 'translate('+point.x+'px, '+point.y+'px) scale(0.4)'
		};
	},
	looper: Array.apply(null, Array(UI.maxDriverCount)).map(function(){}),
	render: function() {
		var self = this;
		var p = this.state;
		var driversLookup = {};

		var fastestDriver = null;
		self.props.drivers.forEach(function(driver) {
			if (driver.vehicleInfo.speed > self.state.fastest.speed) {
				self.state.fastest.speed = driver.vehicleInfo.speed;
				self.state.fastest.name = driver.name;
				fastestDriver = driver;
			}
			driversLookup[driver.slotId] = driver;
		});
		if (fastestDriver && self.state.svg.path) {
			var trackLength = UI.state.eventInfo.length;
			var totalLength = self.state.svg.path.getTotalLength();

			self.state.fastest.progress = (fastestDriver.scoreInfo.distanceTravelled%trackLength/trackLength);
		}

		return (
			<div className="track-map-controller-container">
				<div className="track-map-controller-bg" />
				<div className="track-map-controller" ref="container">
					<object data={'/img/trackmaps/'+UI.state.eventInfo.layoutId+'.svg'} type="image/svg+xml" ref="svg" id="svgObject" width="512px" height="512px"></object>
					{self.looper.map(function(non, i) {
						if (self.state.svg.loaded && driversLookup[i]) {
							return <TrackMapControllerDot key={i} svg={self.state.svg} driver={driversLookup[i]}/>
						}
						else {
							return null;
						}
					})}
					<div
						onClick={self.onClick}
						className="dot start"
						style={self.getTimeTrapStyle(0)}>
							<span className="name">Start/Finish line</span>
					</div>
					{self.state.fastest.name ?
						<div
							onClick={self.onClick}
							className="dot speed-trap"
							style={self.getTimeTrapStyle(self.state.fastest.progress)}>
								<span className="speed">{self.state.fastest.speed}KM/h</span>
								<span className="name">Top speed: {self.state.fastest.name}</span>
						</div>
						:
						null
					}
				</div>
			</div>
		);
	}
});
var TrackMapControllerDot = React.createClass({
	getStyles: function(driver) {
		return cx({
			'dot': true,
			'active': driver.slotId === UI.state.focusedSlot,
			'leader': driver.scoreInfo.positionOverall === 1,
			'idle': driver.vehicleInfo.speed < 5
		});
	},
	getDriverStyle: function(driver) {
		var svg = this.props.svg;
		var trackLength = UI.state.eventInfo.length;
		var totalLength = svg.path.getTotalLength();

		var progress = (driver.scoreInfo.distanceTravelled%trackLength/trackLength);

		var point = svg.path.getPointAtLength(totalLength*progress);

		return {
			'WebkitTransform': 'translate('+point.x+'px, '+point.y+'px) scale(0.4)',
			'zIndex': 100-driver.scoreInfo.positionOverall
		};
	},
	onClick: function(e) {
		var slotId = this.props.driver.slotId;
		UI.state.focusedSlot = slotId;
		UI.state.camera = 'trackside';
		io.emit('setState', UI.state);
		io.emit('updatedCamera', {});
	},
	render: function() {
		var self = this;
		var driver = this.props.driver;
		return (
			<div
			onClick={self.onClick}
			className={self.getStyles(driver)}
			style={self.getDriverStyle(driver)}>
				<span className="position">{driver.scoreInfo.positionOverall}</span>
			</div>
		);
	}
});

var WidgetManager = React.createClass({
	onClickDriver: function(e) {
		UI.state.activeWidgets[this.props.widget.elementName].active = !this.props.widget.active;

		// disable the compare widget when the driver info widget is selected and vice versa.
		var compareRaceWidgetId = "CompareRace";
		var focusedDriverWidgetId = "FocusedDriver";
		if (UI.state.activeWidgets[this.props.widget.elementName].elementName === compareRaceWidgetId &&
		UI.state.activeWidgets[this.props.widget.elementName].active === true) {
			UI.state.activeWidgets[focusedDriverWidgetId].active = false;
		} else if (UI.state.activeWidgets[this.props.widget.elementName].elementName === focusedDriverWidgetId &&
		UI.state.activeWidgets[this.props.widget.elementName].active === true) {
			UI.state.activeWidgets[compareRaceWidgetId].active = false;
		}

		io.emit('setState', UI.state);
	},
	render: function() {
		var classes = {
			'active': this.props.widget.active,
			'inactive': !this.props.widget.active,
			'widget-manager': true
		};
		if (this.props.widget.buttonClasses) {
			this.props.widget.buttonClasses.forEach(function(key) {
				classes[key] = true;
			});
		};
		var shouldShow = false;
		if (!this.props.widget.activeInSessions) {
			shouldShow = true;
		}

		this.props.widget.activeInSessions.forEach(function(sessionType) {
			if (UI.state.sessionInfo.type.match(new RegExp(sessionType, 'i'))) {
				shouldShow = true;
			}
		});

		if (this.props.widget.activeInSessions && this.props.widget.activeInPhases) {
			shouldShow = false;
			this.props.widget.activeInPhases.forEach(function(phaseType) {
				if (UI.state.sessionInfo.phase.match(new RegExp(phaseType, 'i'))) {
					shouldShow = true;
				}
			});
		}

		if (!shouldShow) {
			return null;
		}

		return (
			<div className={cx(classes)} onClick={this.onClickDriver}>
				<span className="text" data-title={UI.getStringTranslation("widgetButtons", this.props.widget.translationDescription)}>{UI.getStringTranslation("widgetButtons", this.props.widget.translationLabel)}</span>
			</div>
		);
	}
});
var Driver = React.createClass({
	setAsFocusedDriver: function() {
		currentDriver = this.props.driver.slotId;
		io.emit('setState', UI.state);
	},
	pressed: function(e) {
		this.setAsFocusedDriver(e);
		$('.control').removeClass('active');
		$('.camera-control').css({
			'display': 'block'
			, 'top': e.clientY
			, 'left': e.clientX
		});
	},
	mouseDown: function(e) {
		if (clickEventType === 'touch') {
			return;
		}
		this.pressed(e);
	},
	touchStart: function(e) {
		this.pressed(e.touches[0]);
	},
	getInterestingStyle: function(timeDiff) {
		var classes = {
			'interesting': true
		};

		if (timeDiff > 0 && timeDiff < 1000 && timeDiff > 250) {
			classes['close'] = true;
		} else if (timeDiff > 0 && timeDiff < 251) {
			classes['veryClose animated flash'] = true;
		}
		return cx(classes);
	},
	renderPostion: function(driver) {
		var divStyle = {
			position: "absolute"
		};
		if (UI.state.controllerOptions.options.multiclass.value === "true" && UI.getClassColour(driver.classId) != null) {
			classColour = UI.getClassColour(driver.classId);
			divStyle = {
					background: classColour,
					position: "absolute"
			};
			return <div className="position" style={divStyle}>P{driver.scoreInfo.positionOverall} / Class P{driver.scoreInfo.positionClass}</div>
		} else {
			return <div className="position" style={divStyle}>P{driver.scoreInfo.positionOverall}</div>
		}
	},
	render: function() {
		var self = this;

		var classes = cx({
			'driver-entry': true,
			'focused': this.props.focused,
			'idle': self.props.driver.vehicleInfo.speed < 5
		});
		var driver = self.props.driver;
		var state = self.state;
		var timeDiff = driver.scoreInfo.timeDiff;
		var isRace = UI.state.sessionInfo.type.match(/^race/i);
		return (
			<div className={classes} onMouseDown={this.mouseDown} onTouchStart={this.touchStart} style={{'zIndex': (1000-this.props.position)}}>
				<div className="inner">
					<div className="meta">
						{!window.settings.offline && <img className="flag" src={'/img/flags/'+UI.getUserInfo(driver.portalId).country+'.png'} />}
						<div className="name">{UI.fixName(driver.name)}</div>
					</div>
					<img className="livery" src={'/render/'+driver.liveryId+'/'+this.props.imageSize+'/'}/>
					{driver.scoreInfo.bestLapInfo.sector3 !== -1 ?
						<div className="best-lap-time">{UI.formatTime(driver.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
						:
						null
					}
					{isRace ?
						<div className={self.getInterestingStyle(timeDiff)}>{(timeDiff/1000).toFixed(2)}s</div>
						:
						null
					}
					{self.renderPostion(driver)}
				</div>
			</div>
		);
	}
});


// control options
var ControlOption = React.createClass({
	componentWillMount: function() {
		this.handleInputChange = this.handleInputChange.bind(this);
	},
	handleInputChange: function(event) {
		var self = this;
		const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

		var updates = {"keyName": self.state.key, "newValue": value};

		// save to json file
		$.post('/saveControllerOptions/', updates, function(response) {
			if (response.error) {
				console.log("Error saving control options: " + response.error);
				return;
			}

			// on success, update global state
			var newConfig = JSON.parse(response);
			UI.state.controllerOptions = newConfig;
			io.emit('setState', UI.state);
		}, 'json');
  },
	render: function() {
		var self = this;

		self.state = self.props.data;

		var classes = cx({
			'controlPanelOption': true
		});

		var color = self.state.value != "false" ? '#4CAF50' : '#F44336';

		return (
			<div className={classes}>
					<form>
							<div className="option">
				        <label>
				          <span title={UI.getStringTranslation("configFile", self.state.translationDescription)} style={{'font-size': '20px', 'color': color}}>🛈 {UI.getStringTranslation("configFile", self.state.translationDisplayName)}</span>
				          <input
				            defaultValue={self.state.value}
				            type={self.state.type}
										defaultChecked={self.state.value === "true"}
				            onChange={self.handleInputChange} />
				        </label>
							</div>
			   </form>
		</div>
		);
	}
});

UI.components.Controller = React.createClass({
	async componentWillMount() {

		// update checker
		var self = this;

		if (window.settings.offline !== true) {
			// github repo with version.json
			let base64PublishedVersionUrl = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RvbWphY2ttYW4vcnJlLXNwZWMvbWFzdGVyL3B1YmxpYy92ZXJzaW9uLmpzb24=';
			let localVersionUrl = 'version.json';

			const published = await fetch(atob(base64PublishedVersionUrl));
			const publishedVersion = await published.json();

			const local = await fetch(localVersionUrl);
			const localVersion = await local.json();

			if(publishedVersion.version > localVersion.version) {
				var confirmText = "A New Update (v" + publishedVersion.version + ") is now available in the Sector 3 Forums (forum.sector3studios.com), visit download page?";
				if (confirm(confirmText)) {
					// Overlay thread on S3 forum
					let base64ForumUrl = "aHR0cHM6Ly9mb3J1bS5zZWN0b3Izc3R1ZGlvcy5jb20vaW5kZXgucGhwP3RocmVhZHMvcjNlLXJlYWxpdHktbW9kZXJuLWJyb2FkY2FzdC1vdmVybGF5LjEyMDYxLw==";
					window.open(atob(base64ForumUrl), '_blank');
				}
			} else {
				console.log("Current Version is up to date (v" + localVersion.version + ").");
			}
		}

		io.on('driversInfo', this.setDriversInfo);
		io.on('directorSuggestions', this.setDirectorSuggestions);

		$(document).bind('keyup.hotkeys', function(e) {
			var camera = null;

			switch(e.which) {
				case 49:
					camera = 'nosecam'
				break;
				case 50:
					camera = 'cockpit'
				break;
				case 51:
					camera = 'swingman'
				break;
				case 52:
					camera = 'onboard'
				break;
				case 53:
					camera = 'trackside'
				break;
			}

			if (camera) {
				UI.state.camera = camera;
				io.emit('setState', UI.state);
				io.emit('updatedCamera', {});
			};
		});
	},
	componentWillUnmount: function() {
		io.removeListener('driversInfo', this.setDriversInfo);
		io.removeListener('directorSuggestions', this.setDirectorSuggestions);

		$(document).unbind('.hotkeys');
	},
	directorSuggestionsTimeout: null,
	setDirectorSuggestions: function(directorSuggestions) {
		var self = this;
		if (self.directorSuggestionsTimeout) {
			clearTimeout(self.directorSuggestionsTimeout);
		}
		self.setState({
			'directorSuggestions': directorSuggestions
		});
		self.directorSuggestionsTimeout = setTimeout(function() {
			self.setState({
				'directorSuggestions': []
			});
		}, 1000);
	},
	setDriversInfo: function(driversInfo) {
		this.setState({
			'driversInfo': driversInfo
		});
	},
	getInitialState: function() {
		this.toggleControlPanel = this.toggleControlPanel.bind(this);
		return {
			'driversInfo': [],
			'directorSuggestions': [],
			'active': false,
			'showCameraController': false,
			'showControlPanel': false
		};
	},
	componentDidMount: function() {
		var self = this;
		$(document).on('touchend', '.drivers-container', function(event) {
			var endTarget = document.elementFromPoint(
				event.originalEvent.changedTouches[0].pageX,
				event.originalEvent.changedTouches[0].pageY
			);
			self.mouseUpCameraControl({
				'target': $(endTarget).closest('.control').get(0)
				, 'e': e
			});
		}).on('touchmove', '.drivers-container', function(event) {
			var endTarget = document.elementFromPoint(
				event.originalEvent.changedTouches[0].pageX,
				event.originalEvent.changedTouches[0].pageY
			);
			var $control =  $(endTarget).closest('.control');
			if ($control.length) {
				$('.control').removeClass('active');
				$control.addClass('active');
			}
		});
	},
	toggleValue: function(e) {
		var valueName = e.target.getAttribute('data-value');
		var value = e.target.checked;
		currentState.widgets[valueName].value = value;
		io.emit('state', currentState);
	},
	componentDidUpdate: function() {
		$(window).resize();
	},
	mouseUpCameraControl: function(e) {
		if (!e || !e.target) {
			return;
		}
		UI.state.camera = e.target.getAttribute('data-value');
		UI.state.focusedSlot = currentDriver;

		io.emit('setState', UI.state);
		io.emit('updatedCamera', {
			'fade': e.shiftKey
		});
		$('.camera-control').hide();
	},
	enter: function(e) {
		$('.control').removeClass('active');
		$(e.target).addClass('active');
	},
	sortFunctionPosition: function(a, b) {
		if (a.scoreInfo.positionOverall > b.scoreInfo.positionOverall) {
			return 1;
		} else if (a.scoreInfo.positionOverall === b.scoreInfo.positionOverall) {
			return 0;
		} else {
			return -1;
		}
	},
	changeTheme: function(e) {
		var theme = {"file": e.target.value};

		// save to json file
		$.post('/changeTheme/', theme, function(response) {
			if (response.error) {
				console.log("Error setting theme: " + response.error);
				return;
			}
			var config = JSON.parse(response);
			var theme = config.theme;

			UI.state.activeTheme = theme;
			io.emit('setState', UI.state);
		}, 'json');


	},
	toggleTrackMap: function() {
		if (window.location.hash.match(/trackmap/)) {
			window.location.hash = '';
		} else {
			window.location.hash = 'trackmap';
		}
		this.forceUpdate();
	},
	toggleControlPanel: function() {
		this.setState({ showControlPanel: !this.state.showControlPanel });
	},
	updateSelf: function() {
		this.forceUpdate();
	},
	render: function() {
		var self = this;
		var camera = this.props.camera;
		function fixName(name) {
			return name.replace(/[A-Z]/g, function(str) {
				return ' '+str;
			}).trim();
		}

		var classes = cx({
			'broadcast-controller': true,
			'app-controller': true
		});
		if (!this.state.driversInfo) {
			return null;
		}
		var session = UI.state.sessionInfo;

		var controlOptionsData = UI.state.controllerOptions.options;

		return (
			<div className={classes}>

				<div className="title">
					<a onClick={this.toggleControlPanel}>
					{ this.state.showControlPanel ?
						<img className="toggleControlPanel" src="/img/close.png" />
						:
						<img className="toggleControlPanel" src="/img/cog.png" />
					}
					</a>

					<a onClick={this.toggleTrackMap}>
					{window.location.hash.match(/trackmap/) && self.state.driversInfo.length ?
						<img className="toggle-track-map" src="/img/close.svg" />
						:
						<img className="toggle-track-map" src="/img/map.svg" />
					}
					</a>
					{session.type && session.phase ?
						<span>{UI.getStringTranslation("sessionInfoWidget", session.type.toLowerCase().replace(/ /g,""))} - {UI.getStringTranslation("sessionInfoWidget", session.phase.toLowerCase().replace(/ /g,""))}: {UI.formatSessionTime(session.timeLeft)}/{UI.formatSessionTime(session.timeTotal)} - {UI.state.eventInfo.serverName}</span>
						:
						null
					}
				</div>

				{window.location.hash.match(/trackmap/) && self.state.driversInfo.length ?
					<TrackMap forceUpdateParent={self.updateSelf} drivers={self.state.driversInfo}/>
					:
					<div className="drivers-controls">
						{self.state.directorSuggestions.length ?
							<div className="suggestions">
								<div className="holder">
									{self.state.directorSuggestions.slice(0,15).map(function(suggestion, i){
										return <SuggestionEntry suggestion={suggestion}/>
									})}
								</div>
							</div>
							:
							null
						}

						{ this.state.showControlPanel ?
							<div className="controlPanel animated slideInUp">
								{Object.keys(controlOptionsData).map(function(key) {
										// add the key to the data set also
										controlOptionsData[key].key = key;
										return <ControlOption data={controlOptionsData[key]} />
								})}
							</div>
							:
								null
							}

							{UI.state.controllerOptions.options.useNewBroadcastUI.value === "true" ?
							<div>
							<div className="scrap"></div>
								<div className="drivers-container-beta-title">
									<div className="tabled-driver-entry">
										<div className="position">{UI.getStringTranslation("controller", "position")}</div>
										<div className="lap">{UI.getStringTranslation("controller", "lap")}</div>
										<div className="interesting">{UI.getStringTranslation("controller", "difference")}</div>
										<div className="flag"></div>
										<div className="name">{UI.getStringTranslation("controller", "driver")}</div>
										<div className="manufacturer"></div>
										<div className="livery"></div>
										<div className="cameras">{UI.getStringTranslation("controller", "cameras")}</div>
										<div className="currentSpeed">{UI.getStringTranslation("controller", "speed")}</div>
										<div className="pit">{UI.getStringTranslation("controller", "pitCount")}</div>
										<div className="mandatoryPit">{UI.getStringTranslation("controller", "mandatoryPit")}</div>
										<div className="tyre">{UI.getStringTranslation("controller", "tyre")}</div>
										<div className="tyreWear">{UI.getStringTranslation("controller", "tyreWear")}</div>
										<div className="damage">{UI.getStringTranslation("controller", "damage")}</div>
										<div className="flags">{UI.getStringTranslation("controller", "flags")}</div>
										<div className="ptp">{UI.getStringTranslation("controller", "ptp")}</div>
										<div className="drs">{UI.getStringTranslation("controller", "drs")}</div>
										<div className="best-lap-s1">{UI.getStringTranslation("controller", "sector1")}</div>
										<div className="best-lap-s2">{UI.getStringTranslation("controller", "sector2")}</div>
										<div className="best-lap-time">{UI.getStringTranslation("controller", "bestLap")}</div>
										<div className="last-lap-time">{UI.getStringTranslation("controller", "lastLap")}</div>
								 </div>
							 </div>

							<div className={cx({'drivers-container-beta': true, 'has-suggestions': self.state.directorSuggestions.length})}>
									{self.state.driversInfo.sort(self.sortFunctionPosition).map(function(driver, i) {
										return <TabledDriver key={driver.slotId} focused={driver.slotId === UI.state.focusedSlot} imageSize="small" position={i} driver={driver} fastest={self.state.driversInfo[0]}></TabledDriver>
									})}
							</div>
							</div>
							:
						<div className={cx({'drivers-container': true, 'has-suggestions': self.state.directorSuggestions.length})}>
							<div className="drivers">
								{self.state.driversInfo.sort(self.sortFunctionPosition).map(function(driver, i){
									return <Driver key={driver.slotId} focused={driver.slotId === UI.state.focusedSlot} imageSize="big" position={i} driver={driver}></Driver>
								})}
							</div>
						</div>
						}
					</div>
				}
				<div onMouseUp={this.mouseUp} className="camera-control">
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control top" data-value="frontCam">Front</div>
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control bottom" data-value="rearCam">Rear</div>
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control center" data-value="trackside">TV</div>
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control left" data-value="onboard1">Dash</div>
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control right" data-value="onboard2">Cockpit</div>
					<div onMouseEnter={this.enter} onMouseUp={this.mouseUpCameraControl} className="control bottomLeft" data-value="wing">Rear wing</div>
				</div>
				<div className="widgets-list">
				<select value={UI.state.activeTheme} onChange={self.changeTheme}>
					{Object.keys(UI.state.themes).map(function(key) {
						return <option key={key} value={key}>{key.toUpperCase().replace(/-/g, " ")}</option>
					})}
				</select>
					<div className="widget-buttons">
						{Object.keys(UI.state.activeWidgets).sort().map(function(key) {
							return <WidgetManager widget={UI.state.activeWidgets[key]} key={key}/>
						})}
					</div>
				</div>
			</div>
		);
	}
});

var TabledDriver = React.createClass({
	changeCamera: function(camera, slotId) {
		UI.state.focusedSlot = slotId;
		UI.state.camera = camera;
		io.emit('setState', UI.state);
		io.emit('updatedCamera', {});
	},
	getInterestingStyle: function(timeDiff) {
		var classes = {
			'interesting': true
		};

		if (timeDiff > 0 && timeDiff < 1000 && timeDiff > 250) {
			classes['close'] = true;
		} else if (timeDiff > 0 && timeDiff < 251) {
			classes['veryClose'] = true;
		}
		return cx(classes);
	},
	renderPostion: function(driver) {
		var divStyle = {};
		if (UI.state.controllerOptions.options.multiclass.value === "true" && UI.getClassColour(driver.classId) != null) {
			classColour = UI.getClassColour(driver.classId);
			divStyle = {
					background: classColour
			};
			return <div className="position" style={divStyle} title={UI.getStringTranslation("controller", "overall") + " - P" + driver.scoreInfo.positionOverall + ", " + UI.getStringTranslation("controller", "class") + " - P" + driver.scoreInfo.positionClass}>{driver.scoreInfo.positionClass}</div>
		} else {
			return <div className="position" style={divStyle} title={UI.getStringTranslation("controller", "overall") + " - P" + driver.scoreInfo.positionOverall + ", " + UI.getStringTranslation("controller", "class") + " - P" + driver.scoreInfo.positionClass}>{driver.scoreInfo.positionOverall}</div>
		}
	},
	renderDamage: function(damage) {
		var damageAverage = ((damage.engine + damage.transmission + damage.frontAero + damage.rearAero)/4);
		var damageTooltip = UI.getStringTranslation("controller", "engineDamage") + ": " + damage.engine + "%, " +
		UI.getStringTranslation("controller", "transmissionDamage") + ": " + damage.transmission + "%, " +
		UI.getStringTranslation("controller", "fronteAeroDamage") + ": " + damage.frontAero + "%, " +
		UI.getStringTranslation("controller", "rearAeroDamage") + ": " + damage.rearAero + "%";

		var highestDamage = Math.max(damage.engine, damage.transmission, damage.frontAero, damage.rearAero);

		if (damage.engine > 70 || damage.transmission > 70 || damage.frontAero > 70 || damage.rearAero > 70) {
			return <div className="damage" style={{color: '#F44336'}} title={damageTooltip}>{highestDamage + "%"}</div>
		} else if (damage.engine > 50 || damage.transmission > 30 || damage.frontAero > 50 || damage.rearAero > 50) {
			return <div className="damage" style={{color: '#FF5722'}} title={damageTooltip}>{highestDamage + "%"}</div>
		} else if (damage.engine > 25 || damage.transmission > 25 || damage.frontAero > 25 || damage.rearAero > 25) {
			return <div className="damage" style={{color: '#FFC107'}} title={damageTooltip}>{highestDamage + "%"}</div>
		}	else {
			return <div className="damage" style={{color: '#8BC34A'}} title={damageTooltip}>{highestDamage + "%"}</div>
		}
	},
	renderMandatoryPit: function(mandatoryPit) {
		if (mandatoryPit === 1) {
			return <div className="mandatoryPit" style={{color: '#2E7D32'}} title={UI.getStringTranslation("controller", "mandatoryPitTaken")}>⭗</div>
		} else if (mandatoryPit === 0) {
			return <div className="mandatoryPit" style={{color: 'rgba(226, 29, 56, 1)'}} title={UI.getStringTranslation("controller", "mandatoryPitNotTaken")}>⭗</div>
		}	else {
			return <div className="mandatoryPit" style={{color: '#607D8B'}} title={UI.getStringTranslation("controller", "mandatoryPitNotRequired")}>{UI.getStringTranslation("controller", "notAvailable")}</div>
		}
	},
	getTimeDiff: function(driver, fastestDriver) {
		var self = this;
		// Race
		if (UI.state.sessionInfo.type.match(/^race/i)) {
			if (driver.scoreInfo.positionOverall === 1) {
				return  UI.getStringTranslation("controller", "lap") + " " + (driver.scoreInfo.laps + 1);
			} else if (driver.scoreInfo.lapDiff === 1) {
				return "+1 " + UI.getStringTranslation("controller", "lap");
			} else if (driver.scoreInfo.lapDiff > 0) {
				return "+" + driver.scoreInfo.lapDiff + " " + UI.getStringTranslation("controller", "laps");
			} else {
				return "+" + (driver.scoreInfo.timeDiff/1000).toFixed(2);
			}
		// Qualify and Practice
		} else if (UI.state.sessionInfo.type === 'QUALIFYING' || UI.state.sessionInfo.type === 'PRACTICE') {
			if (driver.scoreInfo.positionOverall === 1) {
				return "-";
			} else {
				if (driver.scoreInfo.bestLapInfo.valid) {
					return UI.formatTime(driver.scoreInfo.bestLapInfo.sector3 - fastestDriver.scoreInfo.bestLapInfo.sector3);
				} else {
					return UI.getStringTranslation("controller", "notAvailable");
				}
			}
		} else {
			return "N/A";
		}
	},
	getName: function(name) {
		if (window.settings.teamEvent) {
			return name.substr(name.indexOf(" ") + 1);
		} else {
			return UI.fixName(name);
		}
	},
	render: function() {
		var self = this;

		var classes = cx({
			'tabled-driver-entry': true,
			'focused': this.props.focused,
			'idle': self.props.driver.vehicleInfo.speed < 5
		});
		var driver = self.props.driver;
		var state = self.state;
		var timeDiff = driver.scoreInfo.timeDiff;
		var fastestDriver = self.props.fastest;
		var isRace = UI.state.sessionInfo.type.match(/^race/i);

		return (
			<div className={classes} style={{'zIndex': (1000-this.props.position)}}>
					{self.renderPostion(driver)}
					<div className="lap">{driver.scoreInfo.laps + 1}</div>
					{isRace ?
						<div className={self.getInterestingStyle(timeDiff)} onClick={() => {this.changeCamera('trackside', driver.slotId)}}>{self.getTimeDiff(driver, fastestDriver)}</div>
						:
						<div className="interesting" onClick={() => {this.changeCamera('trackside', driver.slotId)}}>{self.getTimeDiff(driver, fastestDriver)}</div>
					}
					{!window.settings.offline ?
						<img className="flag" src={'/img/flags/'+UI.getUserInfo(driver.portalId).country+'.png'} title={UI.getStringTranslation("controller", "country") + " - " + UI.getUserInfo(driver.portalId).countryName}/>
							:
						<img className="flag" src={'/img/flags/rr.png'}/>
					}
					<div className={cx({'name': true, 'focused': this.props.focused})} onClick={() => {this.changeCamera('trackside', driver.slotId)}} title={UI.getStringTranslation("controller", "portalId") + " - " + driver.portalId}>{self.getName(driver.name)}</div>
					<img className="manufacturer" src={'/render/'+driver.manufacturerId+'/small/?type=manufacturer'}/>
					<img className="livery" onClick={() => {this.changeCamera('trackside', driver.slotId)}} src={'/render/'+driver.liveryId+'/'+this.props.imageSize+'/'}/>
					<div className="tvCam" onClick={() => {this.changeCamera('trackside', driver.slotId)}} title={UI.getStringTranslation("controller", "tvTracksideCamera")}>TV</div>
					<div className="dashCam" onClick={() => {this.changeCamera('onboard1', driver.slotId)}} title={UI.getStringTranslation("controller", "dashCamera")}>D</div>
					<div className="cockpitCam" onClick={() => {this.changeCamera('onboard2', driver.slotId)}} title={UI.getStringTranslation("controller", "cockpitCamera")}>C</div>
					<div className="frontCam" onClick={() => {this.changeCamera('frontCam', driver.slotId)}} title={UI.getStringTranslation("controller", "frontCamera")}>F</div>
					<div className="rearCam" onClick={() => {this.changeCamera('rearCam', driver.slotId)}} title={UI.getStringTranslation("controller", "rearCamera")}>R</div>
					<div className="wingCam" onClick={() => {this.changeCamera('wing', driver.slotId)}} title={UI.getStringTranslation("controller", "wingCamera")}>W</div>
					<div className="currentSpeed" title={UI.getStringTranslation("controller", "currentSpeed")}>{driver.vehicleInfo.speed}</div>
					<div className="pit" title={UI.getStringTranslation("controller", "pitCountStatus")}>{UI.getStringTranslation("controller", "notAvailable")}</div>
					{self.renderMandatoryPit(driver.mandatoryPitstopPerformed)}
					{r3eTyreDB.classes[driver.classId] != null || ["Soft", "Hard", "Primary", "Alternate", "Medium"].indexOf(driver.pitInfo.tyreType) > -1 ?
						<div className="tyre">
							<img src={'/img/tyres/'+driver.pitInfo.tyreType+'.png'} />
						</div>
						:
						<div className="tyre">
							<img src={'/img/tyres/dedicated.png'} title={driver.pitInfo.tyreType} />
						</div>
					}
					<div className="tyreWear" title={UI.getStringTranslation("controller", "tyreWearStatus")}>{UI.getStringTranslation("controller", "notAvailable")}</div>
					{self.renderDamage(driver.pitInfo.damage)}
					<div className="flags">
					 <div className={cx({'blackFlag': true, 'active': driver.scoreInfo.flagInfo.black === 1})} title={UI.getStringTranslation("controller", "blackFlag")}>!</div>
					 <div className={cx({'blueFlag': true, 'active': driver.scoreInfo.flagInfo.blue === 1})} title={UI.getStringTranslation("controller", "blueFlag")}>!</div>
					 <div className={cx({'yellowFlag': true, 'active': driver.scoreInfo.flagInfo.yellow === 1})} title={UI.getStringTranslation("controller", "yellowFlag")}>!</div>
					</div>
					<div className={cx({'ptp': true, 'active': driver.pushToPassInfo.active})} title={UI.getStringTranslation("controller", "ptpRemaining")}>{driver.pushToPassInfo.allowed ? driver.pushToPassInfo.amountLeft : UI.getStringTranslation("controller", "notAvailable")}</div>
					{ UI.state.sessionInfo.type === 'PRACTICE' ?
						<div className={cx({'drs': true, 'active': driver.vehicleInfo.drsEnabled})} title={UI.getStringTranslation("controller", "drsRemaining")}>99</div>
					:
						<div className={cx({'drs': true, 'active': driver.vehicleInfo.drsEnabled})} title={UI.getStringTranslation("controller", "drsRemaining")}>{driver.vehicleInfo.drsLeft > -1 ? driver.vehicleInfo.drsLeft : UI.getStringTranslation("controller", "notAvailable")}</div>
					}
					<div className="best-lap-s1">{driver.scoreInfo.bestLapInfo.sector1 != -1 ? UI.formatTime(driver.scoreInfo.bestLapInfo.sector1, {ignoreSign: true}) : UI.getStringTranslation("controller", "notAvailable")}</div>
					<div className="best-lap-s2">{driver.scoreInfo.bestLapInfo.sector2 != -1 ? UI.formatTime(driver.scoreInfo.bestLapInfo.sector2, {ignoreSign: true}) : UI.getStringTranslation("controller", "notAvailable")}</div>
					{driver.scoreInfo.bestLapInfo.sector3 !== -1 ?
						<div className="best-lap-time">{UI.formatTime(driver.scoreInfo.bestLapInfo.sector3, {ignoreSign: true})}</div>
						:
						<div className="best-lap-time invalid">{UI.getStringTranslation("controller", "noneSet")}</div>
					}
					{driver.extendedInfo.lastTenLapsInfo.length > 0 && driver.extendedInfo.lastTenLapsInfo[0].valid ?
						<div className="last-lap-time">{UI.formatTime(driver.extendedInfo.lastTenLapsInfo[0].sector3, {ignoreSign: true})}</div>
						:
						<div className="last-lap-time invalid">{UI.getStringTranslation("controller", "invalid")}</div>
					}
				</div>
		);
	}
});

var SuggestionEntry = React.createClass({
	onClick: function(e) {
		var slotId = this.props.suggestion.slotId;
		UI.state.focusedSlot = slotId;
		io.emit('setState', UI.state);
		io.emit('updatedCamera', {});
	},
	render: function() {
		var suggestion = this.props.suggestion;
		return (
			<div onClick={this.onClick} className={cx({'suggestion': true, 'active': suggestion.slotId === UI.state.focusedSlot})}>
				<label>{suggestion.title}</label>
				<div className="log">{suggestion.log}</div>
			</div>
		);
	}
});

function getBestRatio(target, entrySelector, vidRatio) {
	var maxArea,
		targetCols,
		targetRows,
		targetHeight,
		targetWidth,
		tWidth,
		tHeight;

	// Iterate through every possible combination of rows and columns
	// and see which one has the least amount of whitespace
	var count = $(entrySelector).length;
	var Height = $(target).height();
	var Width = $(target).width();
	var availableRatio = Height/Width;

	for (var i = 1; i <= count; i++) {
		var cols = i;
		var rows = Math.ceil(count / cols);

		if ((rows / cols) * vidRatio > availableRatio) {
			// Our widgets are taking up the whole height
			tHeight = Math.floor(Height / rows);
			tWidth = Math.floor(tHeight / vidRatio);
		} else {
			// Our widgets are taking up the whole width
			tWidth = Math.floor(Width / cols);
			tHeight = Math.floor(tWidth * vidRatio);
		}

		var area = (tWidth * tHeight) * count;

		// If this width and height takes up the most space then we're going with that
		if (maxArea == undefined || (area > maxArea)) {
			maxArea = area;
			targetHeight = tHeight;
			targetWidth = tWidth;
			targetCols = cols;
			targetRows = rows;
		}
	};
	return {
		maxArea: maxArea,
		targetCols: targetCols,
		targetRows: targetRows,
		targetHeight: targetHeight,
		targetWidth: targetWidth,
		ratio: vidRatio
	};
};

$(window).resize(function() {
	var pos = getBestRatio($('.drivers-container'), '.drivers .driver-entry', 0.4);
	var containerHeight = pos.targetHeight*pos.targetRows;
	var containerWidth = pos.targetWidth*pos.targetCols;
	$('.drivers').height(containerHeight).width(containerWidth).css({
		'margin-top': '-'+(containerHeight/2)+'px'
		, 'margin-left': '-'+(containerWidth/2)+'px'
	});
	var ratio = $('.driver-entry:first').width()/600;
	$('.drivers .driver-entry .meta').css({
		'-webkit-transform': 'scale('+ratio+')'
	});

	$('.drivers .driver-entry').each(function(i) {
		$(this).width(pos.targetWidth).height(pos.targetHeight)
	});
}).resize();
