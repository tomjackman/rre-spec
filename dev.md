## Dev Checklist
### Game Updates
#### New Car
* If new manufacturer, add the logo to `public\img\manufacturers` in `.png` format.

#### New Track
* Added the country code of the tracks country to `assets\deps\tracks.js`.

#### New Class / Class Modifications
* Add the Class colour to `assets\deps\classColours.js` named after the Class ID.

#### New Tyre Type
* If new compound, add to list in controller.jsx - ["Soft", "Hard", "Primary", "Alternate", "Medium", "Prime", "Slicks"]. 
* If the tyres compound is new, add the images to `public\img\tyres` named after the tyre type.

### New Content
* Update `r3e-data.min.js` with the new data from https://raw.githubusercontent.com/sector3studios/r3e-spectator-overlay/master/r3e-data.min.js 

### Broadcast Settings are put back to default.
* Make you revert any changes in the settings menu in the broadcast controller to use the default settings. These can be checked by hovering over the option and reading the tooltip text.

### Dev Updates
* Bump the package.json version.
* Bump the version.json file in the public folder.
* Export to .zip and upload to forum.

### Dev Dependencies
* Published node_modules are available [here](https://mega.nz/#!M85kHAxA!GSNKuIGWp7ZZBM7R9AB4jqhdyob1P7kdz4VYH4cJfAs). (Place the modules in `\dev\node_modules`)
