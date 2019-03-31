### Version 1.7.4
* [Bug Fix] Fix stuttering when the driver info shows on screen.
* [Removed] Removed tv style animation sequence due to performance issues.

### Version 1.7.3
* [Tooling] Dependency update.

### Version 1.7.2
* [Feature] Improved results styling - removed underlines, added striped entries, condensed title header.
* [Feature] Add DNS & DQ finish status to the race results table.
* [Feature] Condensed the height of each entry in the standings tower.
* [Feature] Added an option to allow the drivers flag to be shown in the standings tower replacing the car logo (Show Standings Country Flag).
* [Bug Fix] Set the remaining PTP activations to only show in race sessions in the driver info widget.
* [Feature] Add current speed indicator to the broadcast controller table.
* [Sector3] Added offline mode for fetching local resources.
* [Feature] Added team race mode for raceroom event software.
* [Feature] Added Group C & Porsche 964 class colors.
* [Feature] Added Group C tyre choice indicators.
* [Tooling] Updated r3e data file with latest classes and team names.
* [Feature] Add raceroom adac gt masters esports theme.
* [Feature] Add pretty name display of themes instead of filename.
* [Bug Fix] Fixed autodirector timing error on race starts.
* [Feature] Minor UI improvements to the events info widget.
* [Tooling] Switched country flags from SVG's to PNG's to prevent artifacting when skewed.
* [Feature] Increased sizing of standings and session info timer country flags.
* [Feature] Increased sizing of standings tower manufacturer logos.

### Version 1.7.1
* [Bug Fix] Fixed a bug where the compare race delta timer would not hide when the event info widget was shown.
* [Bug Fix] Fixed the delta timer of the compare driver widget in the adac gt masters theme having the wrong colour.
* [Bug Fix] Fixed the commentary widget animation entry positioning to be in the center when fading in.
* [Bug Fix] Fixed a bug where the lap count for the leading driver in the broadcast control panel was shown incorrectly in race sessions.
* [Bug Fix] Set DRS remaining activations value to infinite in practice sessions.
* [Bug Fix] Fixed a bug in the driver info and compare driver widgets where very long team names would make the widget very wide in the UI. Team names are now cropped after 40 characters.
* [Feature] Added new multiclass colours for some VLN series classes (Audi TT RS, WTCR 2018, DTM 92).
* [Feature] Added the race number to the results table for reverse grid/multiple races.
* [Feature] Set qualifying results table scroll delay to 80% instead of 60% of the qualifying table display length (config setting) to show leaders for a longer time.
* [Feature] Added DTM theme.

### Version 1.7.0
* [Feature] Set the new broadcast controller as the default.
* [Feature] Added 'Code 60' indicator in race sessions as used in the 24H series.
* [Feature] Added commentary names widget. Names can be set in the control option UI.
* [Feature] Added PTP activations remaining info to the driver info widget for classes with PTP.
* [Feature] Added TV style reveal/hide animation handling to the driver info widget in race sessions.
* [Feature] Added config option to enable/disable the tv style animations.
* [Feature] Small UI improvements to the new broadcaster UI.
* [Feature] Set qualifying results table scroll delay to 60% of the qualifying table display length (config setting) instead of a constant 10 seconds.
* [Feature] Add raceroom special event theme.
* [Feature] Tweaked ADAC GT Masters theme.
* [Feature] Reduced the amount of text shown in alerts from the stewards.
* [Feature] Allow slow down alerts to be disabled in races (now disabled by default for less noise).
* [Feature] Added country flag and name to new broadcast controller UI.
* [Feature] Added damage indicator to new broadcast controller UI.
* [Feature] Added mandatory pitstop status to new broadcast controller UI.
* [Feature] Added DRS/PTP remaining & active indicators to new broadcast controller UI.
* [Feature] Added best split times to new broadcast controller UI.
* [Feature] Added last lap time to new broadcast controller UI.
* [Feature] Added column headers to new broadcast controller UI.
* [Feature] Condensed camera controls in the new broadcast controller UI.
* [Feature] Added pit count, pit status and tyre wear placeholders to new broadcast controller UI.
* [Feature] Added tyre icons to the beta broadcast panel UI with green icon for series using dedicated tyres.
* [Feature] Reduced default resolution scaling by 1px.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Feature] Added time differences in qualifying and practise sessions in the new broadcast controller UI.
* [Tooling] Switched to using a new user info endpoint with smaller payloads to improve rendering speeds of user info on screen.
* [Tooling] Added ADAC GT Masters 2018 team names.
* [Dev] Changed window reloading key from 'r' to 'F5' to facilitate typing of commentary names.

### Version 1.6.1
* [Bug Fix] Prevented an error being thrown if no local description exists for a track.
* [Feature] Add new tyre compound indicators.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Feature] Added Most Autodrome asset references.
* [Feature] Added ADAC GT Masters 2018 class colours.
* [Feature] Added ADAC GT Masters Theme.
* [Feature] Shows laps behind on the race results screen.

### Version 1.6.0
* [Feature] Added red extra close racing indicator in the broadcast panel for cars within 0.25s of each other.
* [Feature] Added new green and blue raceroom themes for more variety.
* [Feature] Added new session info timer design.
* [Feature] Improved chequered flag appearance on session end.
* [Feature] Added (very basic) race lights out indicator to the session info widget on race countdown/start.
* [Bug Fix] Use full width of the race results table for non multiclass races.
* [Bug Fix] Fixed a bug where the fastest race lap may not be highlighted on the results screen.
* [Feature] Improved steward, safety car and mandatory pit indicator styling.
* [Feature] Added purple fastest lap indicator in quali/practise sessions for the standings and driver info widgets.
* [Feature] Hidden the standings widget visibility in the garage phase pre-race as not all drivers are displayed in the standings at that point and looks odd. (The standings widget will regain visibility on the starting grid automatically).
* [Bug Fix] Disable the driver info widget if the compare driver widget is enabled (and vice versa).
* [Feature] Increased event info dark background overlay tint by 30% for better contrast with the modal.
* [Feature] Hide the driver info, compare and standings widgets when the event info overlay is activated for better appearance.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Bug Fix] Fixed small theme inconsistency in the WTCR compare drivers widget.
* [Feature] Added a toggle to enable a speed comparison (in Km/h) between to drivers in the compare driver widget.
* [Feature] Restyled driver info and compare driver flags, team names and deltas with a sharper look.
* [Feature] Changed the race leaders lap count text format to read better and show the current lap number rather than the laps completed.
* [Feature] Adjusted the 'safety car in' alert and stewards alert widget positioning to be closer to the right edge of the screen.
* [Feature] Improved control options appearance in the broadcaster panel to easily tell an options on/off state.
* [Feature] Restyled and moved the mandatory pit indicator to the right side of the standings tower to free up screen space when not in use.
* [Feature] Restyled all DRS/PTP indicators to sharper design.
* [Feature] Added a toggle to hide the manufacturer logo in the standings tower. A use case to disable this would be in single car cup classes like NSU or Porsche GT3 Cup where its not necessary as they are all the same class.
* [Feature] Added penalty weights to the race results screen.
* [Bug Fix] Fixed driver info and compare driver widget positioning when using a higher resolution scaling setting.
* [Feature] Added a toggle to show the server name in the session info timer.
* [Feature] Added beta version of a new broadcast controller UI.

### Version 1.5.2
* [Bug Fix] Improved logic around how widgets are hidden/shown between the qualifying results and garage/warmup/race sessions.
* [Feature] Allowed extra widgets to be active in the warmup session.
* [Feature] Decreased default resolution scaling by 2 clicks making UI elements smaller by default.
* [Feature] Small UI improvements to standings tower.
* [Feature] Adjustment to the auto director to improve weighting scores to battles in the lower classes, eg. class positioning rather than overall positioning in multiclass races.
* [Feature] Enabled popular widgets by default.
* [Feature] Improve readability of steward and safety car alert text.
* [Feature] Small improvement to steward alerts display logic.
* [Bug Fix] Fixed the mercedes theme not obeying the resolution scaler.

### Version 1.5.1
* [Bug Fix] Ensured that other widgets are correctly disabled when the qualifying results appear on screen.
* [Bug Fix] Removed flashing close racing indicator inside the broadcaster panel.

### Version 1.5.0
* [Feature] Added responsive UI based on game resolution.
* [Feature] Added resolution scaling config file (resolutionScaler.less) to scale UI elements.
* [Feature] Added theme switcher that supports the new theme system.
* [Feature] Added WTCR 2018 theme.
* [Bug Fix] Fixed a timing bug in the compare race widget.
* [Feature] Added the ability to toggle on/off a drivers full last name in the standings tower.
* [Feature] Added winner and fastest lap information to the race results screen.
* [Feature] Added dark background overlay behind results tables to blend better with the background.
* [Bug Fix] Prevented a DNF'd driver with no time set being shown as setting the fastest lap in a race.
* [Bug Fix] Prevented a driver with no time set in qualifying preventing the pole sitter bring shown with a purple lap time on the qualifying results screen.
* [Bug Fix] Added correct colours to PTP indicators.
* [Feature] Updated some theme logos to improve visibility.
* [Feature] Added the ability to show drivers portal avatars in place of the country flag on the driver info and compare widgets.
* [Feature] Added sector names in practise and qualifying splits.
* [Feature] Enhance styling of the sector splits.
* [Feature] Enhance styling of the personal best time and class position UI elements in the driver info and compare widgets.
* [Feature] Styling revision of all themes.
* [Feature] Improved animations.
* [Feature] Enhanced contrasting between on-screen widgets and the game window to make the overlay pop more.
* [Feature] Added 'Auto Director Only Mode' - When enabled, the auto director will only direct a race and won't turn on widgets by itself. Useful for jumping between manual & auto directing without having to turn on/off specific widgets each time.
* [Tooling] Reduced default refresh intervals for better game performance.
* [Feature] Created new base theme.
* [Feature] Allowed the livery preview on the driver info and compare info widgets to be disabled.
* [Feature] Show the drivers team in the results tables.
* [Feature] Update control panel theme.

### Version 1.4.0
* [Feature] State the new version number available in the alert when an update is available.
* [Bug Fix] Added reason for disqualification to the race steward alerts.
* [Feature] Added configuration file to turn on/off UI components and set values for certain features.
* [Feature] Added the ability to turn on/off multiclass UI components.
* [Feature] Added the ability to turn on/off tyre compound indicators.
* [Feature] Added the ability to change the length of time a message from the stewards shows on screen during race session.
* [Feature] Re-enabled the option to indent the currently focused driver in the standings tower.
* [Feature] Added the ability to define the amount of seconds before the end of qualifying to display the results on screen.
* [Feature] Added the ability to define the amount of seconds before the continuing to the next session after a race has finished.
* [Feature] Updated the driver info widget to keep active state on session change.
* [Feature] Added single class default background colours to themes.
* [Bug Fix] Fixed wrong coloring of the session info border in the mercedes theme.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Feature] Added settings UI to the broadcaster panel.
* [Feature] Added automatic saving/loading of config setting.
* [Feature] Added the ability to show/hide portal profile team names if a driver has added one.
* [Bug Fix] Prevent the update alert showing over the game when running an old version.

### Version 1.3.0
* [Feature] Improved meta info sizing on the broadcast control panel for each driver on larger grids.
* [Feature] Added "Battle for Position x" to the compare race widget.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Bug Fix] Fixed a bug where the steward alerts in race session would continue to show, even when the widget was disabled.
* [Feature] Enabled column titles on qualifying results and race results screens.
* [Feature] Highlighted time penalties in red on the race results table.
* [Bug Fix] Fixed label on the race results screen showing 'qualifying results' instead of 'race results'.
* [Bug Fix] Corrected the class position text color on the race results screen.
* [Bug Fix] Fixed a ui issue where the flag in the session info timer would not display correctly in the garage phase before a race.
* [Feature] Updated the class colour of the silhouette series.
* [Bug Fix] Updated the class colours of the DTM 92 class to match the touring classics class as they use the same performance index.
* [Feature] Small UI improvements to the driver info on the trackmap.
* [Feature] Visibility of drivers on the on-screen track map is now layered based on class positioning.
* [Bug Fix] Set the correct start/finish point on the trackmap on sachsenring along with the correct driving direction.

### Version 1.2.0
* [Feature] Increased trigger time to show qualifying results from 20 seconds left in the session, to 25 seconds.
* [Bug Fix] Fixed a bug where the control panel could lock up when switching between driver info and compare widgets. (For now, you must turn them on/off manually until a reliable way to hide the other widget automatically is found).
* [Feature] Small restyle and positioning of session info timer.
* [Feature] Added logo to qualifying and race results table header.
* [Feature] Small UI updates to themes with new variable definitions for some UI components.
* [Feature] Added users portal team name to the driver info and compare widgets if there is one defined.
* [Feature] Adjusted slow down penalty alert text for repeated track limit warnings.
* [Bug Fix] Changed alerts title from 'race control' to 'stewards' for incidents.
* [Feature] Added new animations to the driver info & compare info widgets.
* [Feature] Added disqualification alerts for race sessions.
* [Feature] Added track logo and description on the event info screen.
* [Feature] Added avia esport racing theme.

### Version 1.1.1
* [Bug Fix] Fixed opposite metric/imperial units showing on the event info screen.
* [Bug Fix] Added correct conversions for imperial units.

### Version 1.1.0
* [Feature] Increase race control alerts display time from 10 to 15 seconds.
* [Feature] Increase trigger time to scroll race results from 10 seconds to 25 seconds.
* [Bug Fix] Prevent the Driver Info widget overlapping the qualifying results at session end.
* [Tooling] Render Manufacturer logos from the portal instead of locally.
* [Feature] Improved overall styling of the control panel.
* [Feature] Added hover-over tooltips to buttons in the widget list describing the widget functionality.
* [Feature] Added multiclass positioning and class colouring to the control panel.
* [Feature] Added tool update checker to notify you if a new version is available in the forum.

### Version 1.0.0
* [Feature] Added global LESS variable definitions for themes.
* [Feature] Added base theme.
* [Feature] Added mercedes theme.
* [Feature] Added audi theme.
* [Feature] Added KTM theme.
* [Feature] Added porsche theme.
* [Removed] Removed PNG based themes.
* [Bug Fix] Fixed a UI glitching issue when switching between the driver info and compare race widget.
* [Feature] Added event info widget.
* [Feature] Added race control alerts widget.
* [Feature] Added safety car on track widget.
* [Feature] Added safety car in this lap widget.
* [Feature] Restyled driver info widget.
* [Feature] Added tyre compound display to driver info widget for GT2, IndyCar, F1 classes.
* [Feature] Added personal best time display to driver info widget.
* [Feature] Added new DRS UI display to driver info widget.
* [Feature] Added new PTP UI display to driver info widget.
* [Feature] Added class position to driver info widget.
* [Feature] Added car livery preview to driver info widget.
* [Feature] Added vehicle team name to driver info widget.
* [Feature] Restyled flag, split time UI elements in the driver info widget.
* [Feature] Restyled race/quali results widgets.
* [Feature] Added class position to results widget.
* [Feature] Added penalties display to race results widget.
* [Removed] Removed flag display from standings widget.
* [Feature] Restyled standings widget.
* [Feature] Added First initial to the drivers in the standings widget.
* [Feature] Added multiclass colours to standings widget.
* [Feature] Restyled mandatory pit indicator.
* [Feature] Added lap count to lead driver in the race in the standings widget.
* [Feature] Added new UI to the compare info widget.
* [Feature] Added mini DRS/PTP indicators to the compare info widget.
* [Feature] Added personal best times to the compare info widget.
* [Feature] Added car preview images to the compare info widget.
* [Feature] Added car team name to the compare info widget.
* [Feature] Added a new UI for the session info widget.
* [Feature] Added chequered flag to the session info widget.
* [Feature] Added country flag to the session info widget.
* [Feature] Added new styling to the track map overlay widget.
* [Feature] Added class positions to the track map overlay widget.
* [Feature] Added class leader indicators to the track map overlay widget.
* [Feature] Added class indicators to the driver name in track map overlay widget.
* [Feature] Added class indicators to the dot indicators in track map overlay widget.
* [Feature] Added manufacturer logo to the track map overlay widget.
* [Feature] Added animations for various elements.
* [Feature] Added consistent font across UI components.
* [Removed] Removed unused widgets.
* [Tooling] Added version numbers to widgets.
* [Feature] Added auto director weightings to focus on yellow flag offenders.
* [Feature] Added yellow flag indicator to session info timer.
* [Feature] Modified qualifying results widget to be an on/off trigger instead of always showing.
* [Feature] Added group 4 class.
