# R3E TV Overlay

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/S4DGAMofoE4/0.jpg)](https://www.youtube.com/watch?v=S4DGAMofoE4&feature=youtu.be&t=951)

### Changelog
[Version Changelogs](changelog.md).

## Getting Started
1. Install http://nodejs.org/.
2. Run `start.bat`.
3. Add `-broadcastUrl=http://localhost:9090` in Steam Game launch options.
4. Open http://localhost:9090 in a browser.
5. Start RaceRoom and join a multiplayer server.

### Using UI Toggles
Inside the broadcasting control panel in the browser, there is a settings icon in the top left hand corner. Clicking on this will bring up a popup with toggles and input boxes that can be used to change the appearance and functionality of the UI.

### Resolution: Scaling UI Elements
The `resolutionScaler.less` file contains a config value which allow you to manually increase/decrease UI elements based on your resolution.

Setting the px value to a higher number will increase scaling and setting a lower number will decrease scaling.

### Creating Your Own Theme
To create your own theme, its recommended to create a copy of the `raceroom-red.less` file with your theme name. Then start the tool, select the theme from the dropdown and start modifying the less variables.

Select the theme from the dropdown to view the results on screen.

### License
The [Unlicense](LICENSE).
