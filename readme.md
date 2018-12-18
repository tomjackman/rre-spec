# R3E Reality UI

## Getting Started
1. Install http://nodejs.org/
2. Run `start.bat`
3. Add `-broadcastUrl=http://localhost:9090` in Steam Game launch
4. Open http://localhost:9090 in a browser
5. Join a MP Server

## New Features
### Event Info
The Event Info widget shows the server name and track layout, along with weather condition, track image and the countries flag.

### Safety Car
For leagues that run a form of safety car, 2 new UI elements have been added. The first one is a flashing amber Safety Car alert that shows under the timer that can be turned on when the safety car is on track. The second is an alert to show when the Safety Car will be returning to the pits on the current lap for improved realism. Both of these are toggled on and off by clicking on the button in the widget list. The Safety Car widgets are only active during race sessions.

### Race Control Alerts
Active by default, the race control alerts will show driver infringements such as stop & go penalties, slow downs, drive through penalties and disqualifications.

## Changing Themes
Themes are created using themes files written using LESS variables. The active theme file is located under `theme/theme.less`.
The `theme.less` file is always the "active" theme and any modifications to that file in terms of styling/colours will be rendered in the overlay.

### Using a Built-in Theme
A number of built in themes have been created and can be found in the `theme` folder.
* Audi
* Porsche
* Mercedes
* KTM

To use one of these themes, just copy & paste the content of the theme into the `theme/theme.less` file to make it active. Then restart the tool. All the sample themes support all widgets and DRS/PTP indicators. 

### Creating Your Own Theme
To create your own theme, its recommended to create a copy of the `base.less` file and work from there.
