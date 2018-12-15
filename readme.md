# R3E Reality UI

## Getting Started
1. Install http://nodejs.org/
2. Run `start.bat`
3. Add `-broadcastUrl=http://localhost:9090` in Steam Game launch
4. Open http://localhost:9090 in a browser
5. Join a MP Server


## Changing Themes
Themes are created using themes files written using LESS variables. The active theme file is located under `theme/theme.less`.
The `theme.less` file is always the "active" theme and any modifications to that file in terms of styling/colours will be rendered in the overlay.

### Using a Built-in Theme
A number of built in themes have been created and can be found in the `theme` folder.
* Audi
* Porsche
* Mercedes
* KTM

To use one of these themes, just copy & paste the content of the theme into the `theme/theme.less` file to make it active. Then restart the tool.

### Creating Your Own Theme
To create your own theme, its recommended to create a copy of the `base.less` file and work from there.
