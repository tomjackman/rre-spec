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
				<span className="text">{this.props.widget.buttonText}</span>
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

		if (timeDiff > 0 && timeDiff < 1000) {
			classes['close'] = true;
		}
		return cx(classes);
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
						<img className="flag" src={'/img/flags/'+UI.getUserInfo(driver.portalId).country+'.svg'} />
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
					<div className="current-position">{driver.scoreInfo.positionOverall}</div>
				</div>
			</div>
		);
	}
});

UI.components.Controller = React.createClass({
	componentWillMount: function() {
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
		return {
			'driversInfo': [],
			'directorSuggestions': [],
			'active': false,
			'showCameraController': false
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
		UI.state.activeTheme = e.target.value;
		io.emit('setState', UI.state);
	},
	toggleTrackMap: function() {
		if (window.location.hash.match(/trackmap/)) {
			window.location.hash = '';
		} else {
			window.location.hash = 'trackmap';
		}
		this.forceUpdate();
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

		return (
			<div className={classes}>
				<div className="title">
					<a onClick={this.toggleTrackMap}>
					{window.location.hash.match(/trackmap/) && self.state.driversInfo.length ?
						<img className="toggle-track-map" src="/img/close.svg" />
						:
						<img className="toggle-track-map" src="/img/map.svg" />
					}
					</a>
					{session.type && session.phase ?
						<span>{session.type} - {session.phase}: {UI.formatSessionTime(session.timeLeft)}/{UI.formatSessionTime(session.timeTotal)} - {UI.state.eventInfo.serverName}</span>
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
						<div className={cx({'drivers-container': true, 'has-suggestions': self.state.directorSuggestions.length})}>
							<div className="drivers">
								{self.state.driversInfo.sort(self.sortFunctionPosition).map(function(driver, i){
									return <Driver key={driver.slotId} focused={driver.slotId === UI.state.focusedSlot} imageSize="big" position={i} driver={driver}></Driver>
								})}
							</div>
						</div>
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
