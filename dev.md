## Dev Checklist
### Game Updates
#### New Car
* If the vehicle(s) has a tyre choice, add the new class in `assets\deps\tyres.js` with the Class ID. If the tyres compounds are also new, add the images to `public\img\tyres` named after the tyre type.

#### New Track
* Add the new track overlay to `public\img\trackmaps` named after the Track ID in `SVG` format.
* Added the country code of the tracks country to `assets\deps\tracks.js`.

#### New Class / Class Modifications
* Add the Class colour to `assets\deps\classColours.js` named after the Class ID.
* If the vehicle(s) has a tyre choice, add the new class in `assets\deps\tyres.js` with the Class ID. If the tyres compounds are also new, add the images to `public\img\tyres` named after the tyre type.

#### New Manufacturer
* Add the new manufacturer logo to `public\img\manufacturers` named after the Manufacturer ID in `webp` format.

### New Content
* Update `r3e-data.min.js` with the new data.

### Dev Updates
* Bump the version of the widget.
* Bump the package.json version.
* Bump the rre-spec-version version.
* Export to Zip and upload to forum.
* Bump the version.json file in the public folder.
