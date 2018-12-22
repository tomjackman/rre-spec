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

### New Content
* Update `r3e-data.min.js` with the new data.

### Dev Updates
* Bump the package.json version.
* Bump the version.json file in the public folder.
* Export to .zip and upload to forum.
