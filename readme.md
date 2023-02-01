# RRE TV Overlay

![alt text](public/img/overlay2.jpg "Logo Title Text 1")

As used by:

* [Volkswagen I.D R Nurburgring Launch Event](https://www.gtplanet.net/volkswagen-partners-with-raceroom-for-id-r-nurburgring-competition/)
* [FIA World Touring Car Cup (WTCR)](https://www.fiawtcr.com/esports-wtcr/)
* [Porsche Esports Carrera Cup Scandinavia](https://www.carreracup.se/esports/)
* [Lada E-Championship Russia](https://www.lada.ru/press-releases/116243.html)
* [ADAC GT Masters Germany](https://www.adac-gt-masters.de/uk)
* [Tuning World Bodensee](https://www.raceroom.com/en/raceroom-esports-event-at-the-tuning-world-bodensee-2019/)
* [AVIA Racing](https://www.avia-racing.de/nc/startseite.html)
* [Super Racer](http://www.super-racer.me/)
* [AvD Masters 2019](https://www.avd.de/)
* R3E Special Event Series
* ... any many more events.

### Changelog
* [Version Changelogs](changelog.md)

### Language Support
* English
* French

## Getting Started
1. Install https://nodejs.org/download/release/v8.10.0/ (Recommended Nodejs v8.10.0, choose the .MSI file for Windows).
2. Run `start.bat` before starting RaceRoom.
3. Add `-broadcastUrl=http://localhost:9090` in Steam Game launch options.
4. Open http://localhost:9090 in a browser.
5. Join a server.

### Using UI Toggles
Inside the broadcasting control panel in the browser, there is a settings icon in the top left hand corner. Clicking on this will bring up a popup with toggles and input boxes that can be used to change the appearance and functionality of the UI.

### Resolution: Scaling UI Elements
The `resolutionScaler.less` file contains a config value which allow you to manually increase/decrease UI elements based on your resolution.

Setting the px value to a higher number will increase scaling and setting a lower number will decrease scaling.

### Creating Your Own Theme
To create your own theme, its recommended to create a copy of the `reality-gt.less` file with your theme name. Then start the tool, select the theme from the dropdown and start modifying the less variables.

Select the theme from the dropdown to view the results on screen.

### Changing Sponsors Tower Logo
This can be changed per theme by changing the path to the file using the `sponsorLogo` variable in any theme file in the `/theme` folder. By default the logos are found in `public\img\sponsors`. The image dimensions should be 300x80px. You can use any image format like .PNG, .GIF, .JPG etc.

### License
The [Unlicense](LICENSE).
