# R3E Reality UI

## Getting Started
1. Install http://nodejs.org/.
2. Published node_modules are available [here](https://mega.nz/#!M85kHAxA!GSNKuIGWp7ZZBM7R9AB4jqhdyob1P7kdz4VYH4cJfAs). (Place the modules in `\dev\node_modules`)
3. Run `start.bat`.
4. Add `-broadcastUrl=http://localhost:9090` in Steam Game launch options.
5. Open http://localhost:9090 in a browser.
6. Start RaceRoom and join a multiplayer server.

## Changing Themes
Themes are created using themes files written using LESS variables. The active theme file is located under `theme/theme.less`.
The `theme.less` file is always the "active" theme and any modifications to that file in terms of styling/colours will be rendered in the overlay.

### Using a Built-in Theme
A number of built in themes have been created and can be found in the `theme` folder.

To use one of these themes, just copy & paste the content of the theme into the `theme/theme.less` file to make it active. Then restart the tool. All the sample themes support all widgets and DRS/PTP indicators.

### Creating Your Own Theme
To create your own theme, its recommended to create a copy of the `base.less` file and work from there.
