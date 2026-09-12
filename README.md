# Midea AC Control PWA v0.2.13

A lightweight installable Progressive Web App for discovering and controlling
multiple local ESPHome/Midea AC controllers.

## Current features

- Runs from GitHub Pages on phone, tablet, or PC.
- Can be installed as a PWA, but installation is not required.
- Caches the application shell locally with a service worker.
- Remembers discovered controllers in browser local storage.
- Rechecks only saved controllers on startup.
- Runs full `/24` subnet discovery only when you explicitly press **Scan**.
- Supports manual add by IP address.
- Scans for an ESPHome climate entity named `AC Unit`.
- Uses `Device Friendly Name` as the room/unit display name.
- Tracks `Device Name`, MAC address, and current IP address for identity.
- Supports a persistent per-controller Celsius/Fahrenheit presentation preference.
- Shows a compact multi-unit dashboard with no redundant page heading.
- The entire dashboard tile opens the individual unit page.
- Dashboard tiles show:
  - current temperature
  - current mode
  - set temperature
  - Online / Offline status
  - Refresh button aligned at the right
- Opens a thermostat/control view for each unit.
- Individual unit controls support:
  - operating mode
  - target temperature
  - fan Auto/Low/Medium/High
  - Boost/Turbo
  - swing mode
  - indoor-unit display toggle
  - indoor-unit display Celsius
  - indoor-unit display Fahrenheit
  - Beeper ON/OFF
  - Refresh
- The individual unit page has an **Open device page** button on the lower
  connection-status row.
- The controller's existing 10-schedule editor remains on each local ESPHome page.

The ESP32 controllers remain autonomous. Their schedules and local web interface
continue to work if the PWA, Internet connection, or GitHub is unavailable.

## Important browser limitation

A browser/PWA does not reliably expose the phone or computer's local IPv4 subnet.
For that reason, on the first run enter the local `/24` prefix once, for example:

    192.168.1

The PWA stores that prefix for convenience. A full scan of
`192.168.1.1` through `192.168.1.254` runs only when you press **Scan**.
Saved controllers are checked directly by their remembered address on startup.

If a controller is added manually by IPv4 address, the PWA also learns that
controller's `/24` prefix automatically.

## ESPHome requirement

Starting with ESPHome 2026.7, cross-origin browser requests must be explicitly
allowed. Each controller must allow the GitHub Pages origin and enable Private
Network Access support.

Merge the settings from `esphome-pwa-snippet.yaml` into the controller YAML.

For a GitHub Pages site such as:

    https://YOUR_GITHUB_USERNAME.github.io/midea-ac-pwa/

the origin to allow is:

    https://YOUR_GITHUB_USERNAME.github.io

Do not include the repository path in `allowed_origins`.

### Controller identity and room naming

The current controller firmware exposes `Device Friendly Name`, `Device Name`,
`Device MAC Address`, and `Device IP Address`. `Device Friendly Name` supplies
the room/display label used by the PWA. `Device Name` and MAC are used as stable
identities so rediscovery can update a controller even if DHCP changes its IP.

## Temperature Unit handling

Each controller stores its own persistent `Temperature Unit` preference. This
controls presentation in the controller UI and PWA only.

The Midea indoor unit continues to use Celsius internally over UART. In
Fahrenheit presentation mode the UI uses whole-degree °F steps and maps requests
to the nearest valid 0.5 °C Midea target.

The physical indoor-unit display °C/°F setting is independent of this
presentation preference.

## Physical indoor-unit display functions

The controller exposes:

- `Set AC Display Celsius`
- `Set AC Display Fahrenheit`
- `Turn off LED`

The first two change the physical indoor-unit temperature display over the Midea
UART path.

`Turn off LED` is historically named but acts as a display toggle on the tested
units. The PWA therefore uses a combined ON/OFF display icon instead of claiming
a confirmed absolute display state.

## Beeper control

The controller exposes a template switch named `Beeper` using the Midea
`beeper_on` / `beeper_off` actions.

On the PWA individual-unit page the Beeper control is one single wide stateful
speaker icon:

- ON: speaker with sound waves
- OFF: the same speaker icon with a diagonal strike-through

The PWA reads the Beeper state when the individual unit page opens and when
Refresh is pressed. Beeper is not added to the normal climate polling loop.

## Dashboard and individual-unit layout

The dashboard no longer displays an `Air Conditioners` heading. Each saved unit
is represented by a compact clickable tile. The tile itself opens the unit page.

On the individual-unit page:

- the raw device URL/IP address line is hidden
- the FUNCTIONS row contains Display Toggle, Display °C, Display °F, Beeper, and
  Refresh
- the **Open device page** button is on the lower status row at the left
- Connected/Disconnected status is on the right

## GitHub Pages deployment

1. Create a repository, for example `midea-ac-pwa`.
2. Copy the CONTENTS of this folder to the root of the repository.
3. Commit and push.
4. In GitHub repository settings, enable GitHub Pages from that branch.
5. Open the resulting HTTPS GitHub Pages URL.
6. Install the PWA from the browser.
7. Open Discover and enter your LAN prefix once.
8. Tap Scan.

The manifest and service-worker URLs are relative, so a GitHub Pages repository
subdirectory works correctly.

## Updating the PWA

Push updated files to GitHub Pages. The installed PWA keeps its cached shell and
refreshes same-origin files when the browser retrieves new versions. When changing
core files substantially, increment the `CACHE` constant in `sw.js`.

## Controller API assumptions

The current PWA matches the controller interface already built.

### Climate

- `AC Unit`

### Identity / status

- `Device Friendly Name`
- `Device Name`
- `Device MAC Address`
- `Device IP Address`
- `WiFi Signal dBm`
- `Temperature Unit`

### Function buttons

- `Turn off LED`
- `Set AC Display Celsius`
- `Set AC Display Fahrenheit`
- `AC Fan: Auto`
- `AC Fan: Low`
- `AC Fan: Medium`
- `AC Fan: High`
- `AC Preset: Boost`

### Switches

- `Beeper`

The PWA uses the ESPHome REST API directly over the LAN.

The physical indoor-unit display Celsius/Fahrenheit setting is separate from the
PWA/controller `Temperature Unit` presentation preference.

## Security

Do not expose ESPHome web servers directly to the Internet. This design is for a
trusted local network. `allowed_origins` restricts browser origins but is not a
replacement for network security.

## Current scope

Version 0.2.12 keeps schedule editing on each controller's existing local web
page. Schedule execution remains fully local to the ESP32.

The PWA individual-unit page now provides the same primary FUNCTIONS controls as
the ESPHome web interface: display toggle, display °C, display °F, Beeper, and
Refresh.

Possible future work includes:

- bringing schedule editing into the PWA while keeping execution local
- exposing reliable indoor-display ON/OFF feedback if confirmed over UART
- integrating authenticated remote access without exposing ESPHome HTTP directly


## v0.2.0 controller identity changes

This version is synchronized with the latest controller `app.js` and YAML:

- `Device Friendly Name` supplies the room/display name.
- `Device Name` is the MAC-suffixed ESPHome node name, for example
  `ac-unit-a1b2c3`.
- `Device MAC Address` provides a permanent hardware identifier.
- `Device IP Address` shows the current DHCP address.
- Rediscovery matches an existing controller by Device Name or MAC, so an IP
  change can update the existing saved controller rather than adding a duplicate.


## v0.2.1 connection reliability changes

This release reduces false Online/Offline transitions and HTTP load on ESP32-C3
controllers:

- Normal REST request timeout increased from 1.8 seconds to 4 seconds.
- A controller is marked Offline only after 3 consecutive failed reads.
- Any successful read immediately resets the failure counter and marks it Online.
- Routine startup/dashboard health checks read only the `AC Unit` climate entity.
- Device identity metadata is read during discovery/manual add instead of every poll.
- Detail-view polling is serialized: only one climate request may be outstanding.
- Detail refresh interval increased from 5 seconds to 8 seconds.
- Commands perform one verification read about 2 seconds after the command.
- Automatic startup subnet scans were removed. Full subnet scans are manual only.
- Discovery concurrency reduced to 10 workers and scan timeout increased to 1.5 seconds.

These changes do not alter the controller firmware, schedules, UI controls, or saved
device identities.

## v0.2.2 version display

- Adds the running PWA software version to the Settings page.
- The Settings page shows the currently running PWA software version.
- Bumps the service-worker cache to `midea-ac-pwa-v0.2.2` so the updated app is retrieved after deployment.


## v0.2.3 per-unit Temperature Unit

- Adds support for the controller-side `Temperature Unit` select entity.
- The preference is stored on each ESP32, not in the PWA.
- Each unit may independently display Celsius or Fahrenheit.
- Midea/ESPHome target temperatures remain Celsius internally.
- Fahrenheit presentation uses whole-degree °F values.
- In Fahrenheit mode the +/- buttons request 1 °F changes, then map the
  request to the nearest valid 0.5 °C Midea setpoint.
- The PWA reads the Temperature Unit during discovery/manual add and again
  when a unit is opened. It is not added to the routine 8-second poll.
- The physical indoor-unit display setting remains independent and is not
  changed by this preference.


## v0.2.4 icon controls

- Replaced text-heavy function controls with icon buttons.
- Added combined LED ON/OFF display-toggle icon.
- Added Celsius and Fahrenheit display icons.
- Added icon-only Refresh control.
- Icons are embedded in the app and do not require an external icon CDN.

## v0.2.5 clickable dashboard tiles

- Removed the separate **Control** button.
- Made the entire unit tile open the individual unit page.
- Moved Refresh into the tile information area.
- Removed the dashboard text `All control traffic stays on your local network.`

## v0.2.6 through v0.2.9 dashboard spacing refinements

- Reduced excess vertical space in unit tiles.
- Reduced overall tile height.
- Tightened spacing between the current temperature and Mode / Set Temperature.
- Balanced spacing above and below the current-temperature line.
- Kept Refresh aligned at the far right of the Mode / Set Temperature row.

## v0.2.10 individual-unit FUNCTIONS/status row

- Moved **Open device page** out of the FUNCTIONS row.
- Placed **Open device page** on the lower status row, aligned left.
- Aligned Connected/Disconnected status to the right.
- Added physical-display Celsius and Fahrenheit buttons.
- Added stateful Beeper ON/OFF control.
- Kept display toggle and Refresh controls.
- Automatic detail polling remains climate-only.

## v0.2.11 UI cleanup

- Removed the **Air Conditioners** heading from the main dashboard.
- Removed the raw controller URL/IP address line from the individual unit page.
- Continued refining Beeper icon styling to match the ESPHome local interface.

## v0.2.12 Beeper icon correction

- Changed the PWA Beeper control to a single wide two-state speaker icon.
- Beeper ON shows the speaker with sound waves.
- Beeper OFF shows the same speaker icon with a diagonal strike-through.
- The PWA no longer swaps between two separate Beeper SVGs.
- Beeper REST/state logic is unchanged.


## v0.2.13 Beeper icon sizing

- Kept the wide Beeper button at the existing size.
- Increased only the speaker/wave SVG from 42×28 px to 48×32 px so it visually
  matches the adjacent FUNCTIONS icons more closely.
- Beeper state and REST behavior are unchanged.
