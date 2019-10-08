var settings = {
	"offline": false, // turns on or off offline mode
	"teamEvent": false, // tweaks overlay to suit team races
	"language": "english" // choose a language, english, french, chinese, russian etc. Supported can be seen in the 'languages' folder in the main directory.
}

if (typeof module !== 'undefined') {
	module.exports = settings;
}
