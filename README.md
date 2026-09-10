# Midea AC Control PWA v0.2.2

A lightweight installable Progressive Web App for discovering and controlling
multiple local ESPHome/Midea AC controllers.

## What this first version does

- Installs from GitHub Pages on phone, tablet, or PC.
- Caches the application shell locally with a service worker.
- Remembers discovered controllers in browser local storage.
- Rechecks only saved controllers on startup.
- Runs full `/24` subnet discovery only when you explicitly press **Scan**.
- Scans for an ESPHome climate entity named `AC Unit`.
- Shows a multi-unit dashboard.
- Opens a thermostat view for each unit.
- Supports target temperature, mode, fan Auto/Low/Medium/High, Boost,
  swing mode, and Toggle Display.
- Provides a button to open the controller's existing local ESPHome page.

The ESP32 controllers remain autonomous. Their existing schedules and local web
interface continue to work if the PWA, Internet connection, or GitHub is unavailable.

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

This version matches the controller interface already built:

- Climate entity: `AC Unit`
- WiFi sensor: `WiFi Signal dBm`
- Display button: `Turn off LED`
- Fan buttons: `AC Fan: Auto`, `AC Fan: Low`, `AC Fan: Medium`, `AC Fan: High`
- Boost button: `AC Preset: Boost`

The PWA uses the ESPHome REST API directly over the LAN.

## Security

Do not expose ESPHome web servers directly to the Internet. This design is for a
trusted local network. `allowed_origins` restricts browser origins but is not a
replacement for network security.

## Current scope

Version 0.2.1 keeps schedule editing on each controller's existing local web page.
The PWA thermostat has an **Open device page** button. A later version can bring
the existing 10-schedule editor directly into the PWA while keeping execution on
each ESP32.


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
- The Settings page now shows **Software Version: v0.2.2**.
- Bumps the service-worker cache to `midea-ac-pwa-v0.2.2` so the updated app is retrieved after deployment.
