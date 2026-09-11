# Midea AC Control PWA v0.2.10

A lightweight installable Progressive Web App for discovering and controlling
multiple local ESPHome/Midea AC controllers directly over the local network.

Each ESP32 controller remains autonomous. Local schedules, climate control,
persistent settings, UART communication, and the controller's own web interface
continue to work even if the PWA, GitHub Pages, or the Internet is unavailable.

> Do not expose the ESPHome HTTP server directly to the Internet.

## Current features

- Runs from GitHub Pages in Chrome or another compatible browser.
- Can be installed as a PWA, but installation is not required.
- Remembers discovered controllers in browser local storage.
- Rechecks saved controllers directly on startup.
- Runs a full `/24` subnet scan only when **Discover / Scan** is requested.
- Supports manual add by IP address.
- Uses `Device Friendly Name` as the room/unit display name.
- Tracks `Device Name`, MAC address, and current IP address for identity.
- Supports a per-controller Celsius/Fahrenheit presentation preference.
- Shows all saved units on a compact dashboard.
- The entire dashboard tile opens that unit's detail page.
- Dashboard tiles show:
  - current temperature
  - current operating mode
  - target temperature
  - Online / Offline status
  - per-unit Refresh button
- Individual unit control supports:
  - Power / operating mode
  - target temperature
  - fan Auto / Low / Medium / High
  - Boost / Turbo
  - swing mode
  - physical indoor-unit display toggle
  - physical indoor-unit display Celsius
  - physical indoor-unit display Fahrenheit
  - Beeper ON/OFF
  - Refresh
- The individual-unit page provides an **Open device page** button for the
  ESPHome controller's local web interface.
- The controller's existing 10-schedule editor remains on the local ESPHome
  page.

## Browser and local-network notes

The PWA communicates directly from the browser to ESPHome controllers on the
LAN. Chrome has been the reliable browser for this project. Firefox has shown
problems accessing local ESP32 devices even when Local Network permission is
enabled.

A browser/PWA does not reliably expose the host computer or phone's local IPv4
subnet. For first-time discovery, enter the local `/24` prefix, for example:

    192.168.1

The PWA stores the prefix for later scans. A full scan of
`192.168.1.1` through `192.168.1.254` is performed only when explicitly
requested.

If a controller is added manually by IPv4 address, the PWA also learns that
controller's `/24` prefix.

## ESPHome web-server requirement

Starting with ESPHome 2026.7, cross-origin browser requests must be explicitly
allowed. Each ESPHome controller must allow the exact GitHub Pages origin and
enable Private Network Access support.

Example:

```yaml
web_server:
  version: "3"
  js_include: app.js
  include_internal: false
  log: false
  ota: false
  allowed_origins:
    - https://YOUR_GITHUB_USERNAME.github.io
  enable_private_network_access: true
```

For a PWA hosted at:

    https://YOUR_GITHUB_USERNAME.github.io/midea-ac-pwa/

the allowed origin is:

    https://YOUR_GITHUB_USERNAME.github.io

Do not include the repository path or a trailing slash in `allowed_origins`.

## Controller identity

The controller exposes these local entities:

- `Device Friendly Name`
- `Device Name`
- `Device MAC Address`
- `Device IP Address`

`Device Friendly Name` supplies the room/display label used by the PWA.

`Device Name` is the MAC-suffixed ESPHome node name, for example:

    ac-unit-a1b2c3

The PWA can use Device Name and MAC address as stable identities so a DHCP IP
change updates an existing saved controller instead of creating a duplicate.

## Temperature Unit handling

Each controller stores its own persistent `Temperature Unit` preference:

```yaml
select:
  - platform: template
    name: "Temperature Unit"
    id: device_temperature_unit
    internal: true
    optimistic: true
    restore_value: true
    options: ["Celsius", "Fahrenheit"]
    initial_option: "Celsius"
```

This setting controls presentation in the controller UI and PWA.

The Midea indoor unit continues to use Celsius internally over UART, and stored
schedule target temperatures remain Celsius.

In Fahrenheit presentation mode:

- current and target temperatures are displayed as Fahrenheit
- +/- controls request 1 °F changes
- requested values are mapped to the nearest valid 0.5 °C Midea setpoint

The PWA reads `Temperature Unit` during discovery/manual add and whenever an
individual unit is opened. It is intentionally not part of the normal 8-second
climate poll.

## Physical indoor-unit display °C/°F

The physical AC display unit is separate from the PWA's presentation preference.

UART testing confirmed that the indoor unit's Fahrenheit state is represented
by the `0x04` flag in the Midea C0 status packet while the target-temperature
byte remains unchanged.

The controller currently exposes two local buttons:

- `Set AC Display Celsius`
- `Set AC Display Fahrenheit`

The PWA v0.2.10 uses those buttons from the individual-unit FUNCTIONS row.

Changing the physical display unit does not automatically change the PWA
Temperature Unit preference, and changing the PWA preference does not
automatically change the physical AC display.

## Indoor-unit LED/display control

The indoor-unit display toggle is exposed through the controller button:

- `Turn off LED`

Despite the historical name, the Midea command is a display **toggle**, not an
absolute OFF command.

For units that accept Midea display control through UART even when they do not
advertise the capability, the controller can use the Midea display-control
implementation that forces the display command over UART.

The PWA currently represents this as a combined LED ON/OFF icon because it does
not rely on a confirmed display-state feedback value.

## Beeper control

The controller exposes a template switch named:

- `Beeper`

Typical controller configuration:

```yaml
switch:
  - platform: template
    name: "Beeper"
    id: midea_beeper
    internal: true
    optimistic: true
    restore_mode: RESTORE_DEFAULT_ON
    turn_on_action:
      - midea_ac.beeper_on:
    turn_off_action:
      - midea_ac.beeper_off:
```

The PWA reads `/switch/Beeper` when the individual unit page opens and when the
Refresh button is pressed.

The Beeper icon is stateful:

- speaker icon = Beeper ON
- speaker icon with strike-through = Beeper OFF

If an older controller does not expose the Beeper switch, the PWA disables only
the Beeper button; the rest of the unit page remains usable.

## Swing modes

The Midea UART implementation supports swing commands, but the controller must
advertise the supported swing modes through ESPHome ClimateTraits.

For the units used during development, explicitly configuring
`supported_swing_modes` fixed a condition where swing commands were ignored
before reaching MideaUART.

The PWA currently offers:

- OFF
- VERTICAL
- HORIZONTAL
- BOTH

Only modes actually supported by a specific indoor unit will physically operate.

## PWA connection behavior

The connection logic is designed to reduce false Offline states and excessive
HTTP traffic on ESP32-C3 controllers.

Current behavior:

- normal REST timeout: approximately 4 seconds
- 3 consecutive failed reads required before marking a unit Offline
- any successful read immediately resets the failure counter
- routine health checks use the climate endpoint only
- detail-view climate polling is serialized
- detail polling interval: approximately 8 seconds
- command verification occurs after approximately 2 seconds
- no automatic `/24` subnet scan at startup
- full discovery scan runs only when requested
- device identity metadata is read during discovery/manual add
- Temperature Unit and Beeper state are not added to the routine 8-second poll

## Controller REST/API entities used by the PWA

The current PWA expects or optionally uses the following ESPHome entities.

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

## Dashboard layout

The current dashboard tile has been simplified for fast multi-unit use:

- the whole tile acts as the navigation button
- the old **Control** button was removed
- Online / Offline remains in the upper-right corner
- current temperature is displayed prominently
- Mode and Set Temperature share the lower information row
- Refresh is aligned at the far right of that same row
- tile spacing has been tightened and balanced above and below the current
  temperature

## Individual unit page layout

The individual-unit FUNCTIONS row now matches the local ESPHome controller page
as closely as practical:

1. Display Toggle
2. Display Celsius
3. Display Fahrenheit
4. Beeper ON/OFF
5. Refresh

The **Open device page** button is no longer part of the FUNCTIONS row. It is
located on the lower connection-status row:

    Open device page                         Connected

The button is left-aligned and the current connection status is right-aligned.

## GitHub Pages deployment

1. Create a repository, for example `midea-ac-pwa`.
2. Copy the **contents** of the PWA folder to the repository root.
3. Commit and push.
4. Enable GitHub Pages for that branch.
5. Open the resulting HTTPS GitHub Pages URL.
6. Confirm each ESPHome controller's `allowed_origins` contains the exact GitHub
   Pages origin.
7. Open Discover, enter the LAN prefix if needed, and scan or manually add a
   controller.

The manifest and service-worker URLs are relative, so deployment under a GitHub
Pages repository subdirectory is supported.

## Updating the PWA

The PWA uses a service worker and cached application shell.

When core files are updated:

- increment `APP_VERSION` in `app.js`
- increment the cache name in `sw.js`
- update the cache-busting query strings in `index.html`

This project currently uses those version bumps to ensure browsers do not keep
serving stale UI files after GitHub Pages deployment.

## Security

Do not expose the ESPHome web server directly to the Internet.

This design assumes a trusted local network. `allowed_origins` restricts which
browser origins can use the ESPHome web API, but it is not a replacement for
normal network security.

A future remote-access implementation may use MQTT or another authenticated
transport instead of exposing ESPHome HTTP.

## Version history

### v0.2.0 — Controller identity

- Added `Device Friendly Name`, Device Name, MAC address, and IP address.
- Rediscovery can match existing controllers by stable identity rather than
  creating duplicates after DHCP address changes.

### v0.2.1 — Connection reliability

- Increased REST timeout to approximately 4 seconds.
- Requires 3 consecutive failed reads before Offline.
- Successful reads immediately restore Online state.
- Routine health checks use only the climate endpoint.
- Serialized detail polling.
- Increased detail polling interval to approximately 8 seconds.
- Delayed command verification by approximately 2 seconds.
- Removed automatic startup subnet scans.
- Reduced full-scan concurrency.

### v0.2.2 — Version display

- Added PWA software version to Settings.
- Added service-worker cache versioning.

### v0.2.3 — Per-unit Temperature Unit

- Added controller-side persistent Celsius/Fahrenheit preference.
- Added per-device PWA temperature presentation.
- Added whole-degree Fahrenheit UI with nearest 0.5 °C Midea setpoint mapping.

### v0.2.4 — Icon FUNCTIONS controls

- Replaced text-heavy function controls with icon buttons.
- Added combined LED ON/OFF display-toggle icon.
- Added Celsius and Fahrenheit display icons.
- Added icon-only Refresh control.
- Kept icons embedded in the application so they do not require an external
  icon CDN at runtime.

### v0.2.5 — Clickable dashboard tiles

- Removed the separate Control button.
- Made the entire unit tile open the individual unit page.
- Moved Refresh into the tile information area.
- Removed the dashboard text:
  `All control traffic stays on your local network.`

### v0.2.6–v0.2.9 — Dashboard spacing refinements

- Reduced excess vertical space in unit tiles.
- Tightened the relationship between current temperature and Mode / Set
  Temperature.
- Reduced overall tile height.
- Balanced the spacing above and below the current-temperature line.
- Kept Refresh aligned at the far right.

### v0.2.10 — Individual-unit FUNCTIONS/status row

- Moved **Open device page** to the lower connection-status row.
- Left-aligned the button and right-aligned Connected/Disconnected status.
- Added physical-display Celsius and Fahrenheit controls to the PWA.
- Added stateful Beeper ON/OFF control.
- Kept Display Toggle and Refresh controls.
- Automatic climate polling remains climate-only; Beeper state is refreshed
  when the unit page opens and when Refresh is pressed.

## Current scope / future work

The 10-schedule editor still lives on each ESPHome controller rather than in the
PWA. Schedule execution remains fully local to the ESP32.

Possible future work:

- bring schedule editing into the PWA while keeping execution local
- expose reliable indoor-display ON/OFF feedback if confirmed through UART
- make scheduled Display Off idempotent rather than relying on a toggle
- integrate remote access through MQTT or another authenticated mechanism
