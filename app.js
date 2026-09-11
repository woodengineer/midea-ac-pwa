(() => {
  "use strict";

  const APP_VERSION = "0.2.7";
  const STORAGE_KEY = "midea-ac-pwa-state-v1";
  const CLIMATE_NAME = "AC Unit";
  const FRIENDLY_NAME_ENTITY = "Device Friendly Name";
  const DEVICE_NAME_ENTITY = "Device Name";
  const MAC_ADDRESS_ENTITY = "Device MAC Address";
  const IP_ADDRESS_ENTITY = "Device IP Address";
  const TEMPERATURE_UNIT_ENTITY = "Temperature Unit";
  const REQUEST_TIMEOUT = 4000;
  const SCAN_TIMEOUT = 1500;
  const SCAN_CONCURRENCY = 10;
  const OFFLINE_FAILURE_THRESHOLD = 3;
  const DETAIL_REFRESH_INTERVAL = 8000;
  const COMMAND_VERIFY_DELAY = 2000;

  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  const subtitle = document.getElementById("header-subtitle");
  const installButton = document.getElementById("install-button");
  let installPrompt = null;
  let state = loadState();
  let route = { name: "dashboard", deviceId: null };
  let detailTimer = null;
  let scanAbort = false;

  function defaultState() {
    return { devices: [], subnets: [], lastScan: 0 };
  }

  function loadState() {
    try {
      return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (_) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message, ms = 2600) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), ms);
  }

  function normalizeHost(input) {
    let value = String(input || "").trim();
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) value = "http://" + value;
    try {
      const u = new URL(value);
      return u.origin;
    } catch (_) {
      return "";
    }
  }

  function deviceIdFor(baseUrl) {
    return btoa(baseUrl).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
  }

  function subnetFromUrl(baseUrl) {
    try {
      const host = new URL(baseUrl).hostname;
      const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!m) return null;
      const nums = m.slice(1).map(Number);
      if (nums.some(n => n < 0 || n > 255)) return null;
      return nums.slice(0, 3).join(".");
    } catch (_) {
      return null;
    }
  }

  function validSubnetPrefix(prefix) {
    const m = String(prefix || "").trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    return !!m && m.slice(1).every(v => Number(v) >= 0 && Number(v) <= 255);
  }

  async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, Object.assign({ cache: "no-store", mode: "cors", credentials: "omit" }, options, { signal: controller.signal }));
    } finally {
      clearTimeout(timer);
    }
  }

  async function getJson(baseUrl, domain, name, detail = false, timeout = REQUEST_TIMEOUT) {
    const url = `${baseUrl}/${domain}/${encodeURIComponent(name)}${detail ? "?detail=all&_=" + Date.now() : "?_=" + Date.now()}`;
    const response = await fetchWithTimeout(url, { method: "GET" }, timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function postAction(baseUrl, domain, name, action, params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs}` : "";
    const url = `${baseUrl}/${domain}/${encodeURIComponent(name)}/${action}${suffix}`;
    const response = await fetchWithTimeout(url, { method: "POST" }, REQUEST_TIMEOUT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
  }

  async function tryEntity(baseUrl, domain, names, detail = false, timeout = REQUEST_TIMEOUT) {
    let last = null;
    for (const name of names) {
      try { return await getJson(baseUrl, domain, name, detail, timeout); }
      catch (e) { last = e; }
    }
    throw last || new Error("Entity unavailable");
  }

  async function probeDevice(baseUrl, timeout = SCAN_TIMEOUT) {
    const climate = await tryEntity(
      baseUrl,
      "climate",
      [CLIMATE_NAME, "ac_unit"],
      true,
      timeout
    );

    let friendlyName = "";
    let deviceName = "";
    let macAddress = "";
    let ipAddress = "";
    let temperatureUnit = "Celsius";

    // Latest controller firmware: runtime-editable Friendly Name.
    try {
      const label = await tryEntity(
        baseUrl,
        "text",
        [FRIENDLY_NAME_ENTITY, "device_friendly_name"],
        false,
        timeout
      );
      friendlyName = String(label.value ?? label.state ?? "").trim();
    } catch (_) {
      // Backward compatibility with the original PWA test firmware.
      try {
        const legacyLabel = await tryEntity(
          baseUrl,
          "text_sensor",
          ["PWA Device Name", "pwa_device_name"],
          false,
          timeout
        );
        friendlyName = String(
          legacyLabel.value ?? legacyLabel.state ?? ""
        ).trim();
      } catch (_) {}
    }

    try {
      const value = await tryEntity(
        baseUrl,
        "text_sensor",
        [DEVICE_NAME_ENTITY, "device_name"],
        false,
        timeout
      );
      deviceName = String(value.value ?? value.state ?? "").trim();
    } catch (_) {}

    try {
      const value = await tryEntity(
        baseUrl,
        "text_sensor",
        [MAC_ADDRESS_ENTITY, "device_mac_address"],
        false,
        timeout
      );
      macAddress = String(value.value ?? value.state ?? "").trim();
    } catch (_) {}

    try {
      const value = await tryEntity(
        baseUrl,
        "text_sensor",
        [IP_ADDRESS_ENTITY, "device_ip_address"],
        false,
        timeout
      );
      ipAddress = String(value.value ?? value.state ?? "").trim();
    } catch (_) {}

    try {
      const value = await tryEntity(
        baseUrl,
        "select",
        [TEMPERATURE_UNIT_ENTITY, "device_temperature_unit"],
        false,
        timeout
      );
      temperatureUnit = normalizeTemperatureUnit(value.value ?? value.state ?? "Celsius");
    } catch (_) {
      temperatureUnit = "Celsius";
    }

    if (!friendlyName) {
      friendlyName =
        deviceName ||
        (() => {
          try { return new URL(baseUrl).hostname; }
          catch (_) { return baseUrl; }
        })();
    }

    return {
      climate,
      friendlyName,
      deviceName,
      macAddress,
      ipAddress,
      temperatureUnit
    };
  }

  function upsertDevice(baseUrl, probe, source = "scan") {
    const stableIdentity =
      String(probe.deviceName || "").trim() ||
      String(probe.macAddress || "").trim().toLowerCase() ||
      baseUrl;

    const stableId = deviceIdFor(stableIdentity);

    // Match the same physical unit even if DHCP changes its IP address.
    let device = state.devices.find(d =>
      d.id === stableId ||
      d.baseUrl === baseUrl ||
      (
        probe.deviceName &&
        d.deviceName &&
        d.deviceName === probe.deviceName
      ) ||
      (
        probe.macAddress &&
        d.macAddress &&
        String(d.macAddress).toLowerCase() ===
          String(probe.macAddress).toLowerCase()
      )
    );

    if (!device) {
      device = {
        id: stableId,
        baseUrl,
        name:
          probe.friendlyName ||
          probe.deviceName ||
          new URL(baseUrl).hostname,
        addedAt: Date.now(),
        source
      };
      state.devices.push(device);
    } else {
      // Migrate older base-URL IDs to the permanent controller identity.
      device.id = stableId;
      device.baseUrl = baseUrl;

      if (
        probe.friendlyName &&
        !device.customName
      ) {
        device.name = probe.friendlyName;
      }
    }

    device.deviceName = probe.deviceName || device.deviceName || "";
    device.macAddress = probe.macAddress || device.macAddress || "";
    device.ipAddress =
      probe.ipAddress ||
      (() => {
        try { return new URL(baseUrl).hostname; }
        catch (_) { return ""; }
      })();
    device.temperatureUnit = normalizeTemperatureUnit(
      probe.temperatureUnit || device.temperatureUnit || "Celsius"
    );

    device.failureCount = 0;
    device.online = true;
    device.lastSeen = Date.now();
    device.climate = probe.climate;

    const subnet = subnetFromUrl(baseUrl);
    if (subnet && !state.subnets.includes(subnet)) {
      state.subnets.push(subnet);
    }

    saveState();
    return device;
  }

  function markDeviceSuccess(device, climate) {
    device.failureCount = 0;
    device.online = true;
    device.error = "";
    device.lastSeen = Date.now();
    if (climate) device.climate = climate;
  }

  function markDeviceFailure(device, error) {
    device.failureCount = Number(device.failureCount || 0) + 1;
    device.error = error && error.message ? error.message : String(error || "Request failed");
    if (device.failureCount >= OFFLINE_FAILURE_THRESHOLD) {
      device.online = false;
    }
  }

  async function refreshDeviceTemperatureUnit(device, timeout = REQUEST_TIMEOUT) {
    try {
      const value = await tryEntity(
        device.baseUrl,
        "select",
        [TEMPERATURE_UNIT_ENTITY, "device_temperature_unit"],
        false,
        timeout
      );
      device.temperatureUnit = normalizeTemperatureUnit(value.value ?? value.state ?? "Celsius");
      saveState();
      return true;
    } catch (_) {
      // Backward-compatible default for controllers that have not yet received
      // the per-unit Temperature Unit firmware update.
      device.temperatureUnit = normalizeTemperatureUnit(device.temperatureUnit || "Celsius");
      return false;
    }
  }

  async function refreshDevice(device) {
    try {
      // Routine health checks read only the climate endpoint. Identity metadata
      // is collected during discovery/manual add instead of on every refresh.
      const climate = await tryEntity(
        device.baseUrl,
        "climate",
        [CLIMATE_NAME, "ac_unit"],
        true,
        REQUEST_TIMEOUT
      );
      markDeviceSuccess(device, climate);
    } catch (e) {
      markDeviceFailure(device, e);
    }
    saveState();
    return device;
  }

  async function refreshAllDevices(renderAfter = true) {
    if (!state.devices.length) return;
    subtitle.textContent = "Refreshing local controllers…";
    await Promise.allSettled(state.devices.map(refreshDevice));
    subtitle.textContent = `${state.devices.filter(d => d.online).length}/${state.devices.length} controllers online`;
    if (renderAfter && route.name === "dashboard") renderDashboard();
  }

  function setRoute(name, deviceId = null) {
    clearTimeout(detailTimer);
    detailTimer = null;
    route = { name, deviceId };
    document.querySelectorAll(".nav-button").forEach(b => b.classList.toggle("active", b.dataset.route === name));
    if (name === "dashboard") renderDashboard();
    else if (name === "discover") renderDiscover();
    else if (name === "settings") renderSettings();
    else if (name === "device") renderDevice(deviceId);
  }

  function human(value) {
    const v = String(value ?? "").replaceAll("_", " ").toLowerCase();
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "--";
  }

  function normalizeTemperatureUnit(value) {
    const text = String(value ?? "").trim().toLowerCase();
    return (text === "fahrenheit" || text === "f" || text === "°f")
      ? "Fahrenheit"
      : "Celsius";
  }

  function usesFahrenheit(unit) {
    return normalizeTemperatureUnit(unit) === "Fahrenheit";
  }

  function temperatureUnitSymbol(unit) {
    return usesFahrenheit(unit) ? "°F" : "°C";
  }

  function celsiusToFahrenheit(value) {
    return (Number(value) * 9 / 5) + 32;
  }

  function fahrenheitToCelsius(value) {
    return (Number(value) - 32) * 5 / 9;
  }

  function formatTemp(value, unit = "Celsius") {
    const n = Number(value);
    if (!Number.isFinite(n)) return usesFahrenheit(unit) ? "--°F" : "--.-°C";
    if (usesFahrenheit(unit)) return `${Math.round(celsiusToFahrenheit(n))}°F`;
    return `${n.toFixed(1)}°C`;
  }

  function formatTargetTemp(value, unit = "Celsius", includeUnit = false) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "--";
    let text;
    if (usesFahrenheit(unit)) {
      text = String(Math.round(celsiusToFahrenheit(n)));
    } else if (Math.abs(n - Math.round(n)) < 0.001) {
      text = String(Math.round(n));
    } else {
      text = n.toFixed(1);
    }
    return includeUnit ? text + temperatureUnitSymbol(unit) : text;
  }

  function renderDashboard() {
    subtitle.textContent = state.devices.length ? `${state.devices.filter(d => d.online).length}/${state.devices.length} controllers online` : "Local ESPHome controllers";
    const cards = state.devices.map(device => {
      const c = device.climate || {};
      const mode = String(c.mode || "OFF").toUpperCase();
      const status = device.online ? "online" : "offline";
      const summary = device.online
        ? `${human(mode)}${mode !== "OFF" && Number.isFinite(Number(c.target_temperature)) ? " → " + formatTargetTemp(c.target_temperature, device.temperatureUnit, true) : ""}`
        : "Controller unavailable";
      return `
        <article class="card unit-card unit-card-clickable"
                 data-open-device="${escapeHtml(device.id)}"
                 role="button"
                 tabindex="0"
                 aria-label="Open controls for ${escapeHtml(device.name)}">
          <div class="unit-card-head">
            <div><div class="unit-name">${escapeHtml(device.name)}</div><div class="unit-address">${escapeHtml(device.deviceName || device.baseUrl.replace(/^https?:\/\//, ""))}${device.ipAddress ? " · " + escapeHtml(device.ipAddress) : ""}</div></div>
            <span class="status-pill ${status}">${device.online ? "Online" : "Offline"}</span>
          </div>
          <div class="unit-temp">${device.online ? formatTemp(c.current_temperature, device.temperatureUnit) : (usesFahrenheit(device.temperatureUnit) ? "--°F" : "--.-°C")}</div>
          <div class="unit-summary-row">
            <div class="unit-summary">${escapeHtml(summary)}</div>
            <button class="button small icon-only unit-refresh-button"
                    type="button"
                    data-refresh-device="${escapeHtml(device.id)}"
                    title="Refresh"
                    aria-label="Refresh ${escapeHtml(device.name)}"><svg class="ui-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14A9.95 9.95 0 0 0 12 2v2c1.08 0 2.13.21 3.11.63.95.4 1.81.98 2.54 1.71s1.31 1.59 1.72 2.54c.42.99.63 2.03.63 3.11s-.21 2.13-.63 3.11c-.4.95-.98 1.81-1.72 2.54-.17.17-.34.32-.52.48L15 15.99v6h6l-2.45-2.45c.18-.15.36-.31.52-.48.92-.92 1.64-1.99 2.14-3.18.52-1.23.79-2.54.79-3.89s-.26-2.66-.79-3.89a9.9 9.9 0 0 0-2.14-3.18ZM4.93 19.07c.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79v-2a7.9 7.9 0 0 1-3.11-.63c-.95-.4-1.81-.98-2.54-1.71s-1.31-1.59-1.72-2.54c-.42-.99-.63-2.03-.63-3.11s.21-2.13.63-3.11c.4-.95.98-1.81 1.72-2.54.17-.17.34-.32.52-.48L9 8.01V2H3l2.45 2.45c-.18.15-.36.31-.52.48-.92.92-1.64 1.99-2.14 3.18C2.27 9.34 2 10.65 2 12s.26 2.66.79 3.89c.5 1.19 1.22 2.26 2.14 3.18Z"/></svg></button>
          </div>
        </article>`;
    }).join("");

    app.innerHTML = `
      <h1 class="section-title">Air Conditioners</h1>
      ${cards ? `<div class="unit-grid">${cards}</div>` : `
        <div class="card empty-state"><strong>No AC controllers yet</strong>Open Discover, enter your local network prefix once, and scan for units.<br><br><button class="button primary" id="empty-discover">Discover units</button></div>`}
    `;

    app.querySelectorAll("[data-open-device]").forEach(card => {
      card.addEventListener("click", event => {
        if (event.target.closest("[data-refresh-device]")) return;
        setRoute("device", card.dataset.openDevice);
      });
      card.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.target.closest("[data-refresh-device]")) return;
        event.preventDefault();
        setRoute("device", card.dataset.openDevice);
      });
    });
    app.querySelectorAll("[data-refresh-device]").forEach(b => b.addEventListener("click", async event => {
      event.stopPropagation();
      const d = state.devices.find(x => x.id === b.dataset.refreshDevice); if (!d) return;
      b.disabled = true; await refreshDevice(d); renderDashboard();
    }));
    document.getElementById("empty-discover")?.addEventListener("click", () => setRoute("discover"));
  }

  async function renderDevice(deviceId) {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return setRoute("dashboard");
    device.temperatureUnit = normalizeTemperatureUnit(device.temperatureUnit || "Celsius");
    const initialUnitSymbol = temperatureUnitSymbol(device.temperatureUnit);

    app.innerHTML = `
      <div class="back-row"><button class="back-button" id="back-units" type="button">← All units</button><span class="status-pill ${device.online ? "online" : "offline"}" id="device-online">${device.online ? "Online" : "Offline"}</span></div>
      <div class="device-title">${escapeHtml(device.name)}</div>
      <div class="unit-address" style="margin-bottom:12px">${escapeHtml(device.baseUrl)}</div>
      <section class="card thermostat-card">
        <div class="thermostat-top"><div class="current-label">Current temperature</div><div class="current-value" id="current-temp">${usesFahrenheit(device.temperatureUnit) ? "--°F" : "--.-°C"}</div></div>
        <div class="thermostat-dial">
          <svg class="thermostat-svg" viewBox="0 0 300 258" aria-hidden="true">
            <circle id="arc-track" class="arc track" cx="150" cy="150" r="112"></circle>
            <circle id="arc-zone" class="arc zone" cx="150" cy="150" r="112"></circle>
            <circle id="arc-delta" class="arc delta" cx="150" cy="150" r="112"></circle>
            <circle id="target-marker" class="target-marker" cx="150" cy="38" r="8"></circle>
            <circle id="current-marker" class="current-marker" cx="150" cy="38" r="5"></circle>
          </svg>
          <div class="thermostat-center"><div class="center-mode" id="center-mode">--</div><div class="target-line"><span class="target-value" id="target-temp">--</span><span class="target-unit" id="target-unit">${initialUnitSymbol}</span></div></div>
          <div class="step-row"><button id="temp-down" class="step-button" type="button">−</button><button id="temp-up" class="step-button" type="button">+</button></div>
        </div>
        <div class="control-tiles">
          <button class="control-tile" data-menu="mode-menu"><span class="label">Mode</span><span class="value" id="mode-value">--</span></button>
          <button class="control-tile" data-menu="fan-menu"><span class="label">Fan mode</span><span class="value" id="fan-value">--</span></button>
          <button class="control-tile" data-menu="swing-menu"><span class="label">Swing mode</span><span class="value" id="swing-value">--</span></button>
        </div>
        <div class="choice-panel" id="mode-menu">
          ${["OFF","COOL","HEAT","DRY","FAN_ONLY","AUTO"].map(v => `<button class="choice" data-mode="${v}" type="button">${human(v)}</button>`).join("")}
        </div>
        <div class="choice-panel" id="fan-menu">
          ${["AUTO","LOW","MEDIUM","HIGH"].map(v => `<button class="choice" data-fan="${v}" type="button">${human(v)}</button>`).join("")}
          <button class="choice" data-boost="1" type="button">Boost</button>
        </div>
        <div class="choice-panel" id="swing-menu">
          ${["OFF","VERTICAL","HORIZONTAL","BOTH"].map(v => `<button class="choice" data-swing="${v}" type="button">${human(v)}</button>`).join("")}
        </div>
        <div class="function-row"><button id="toggle-display" class="button icon-only icon-pair-button" type="button" title="Toggle Display" aria-label="Toggle Display"><span class="ui-icon-pair"><svg class="ui-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M11,0V4H13V0H11M18.3,2.29L15.24,5.29L16.64,6.71L19.7,3.71L18.3,2.29M5.71,2.29L4.29,3.71L7.29,6.71L8.71,5.29L5.71,2.29M12,6A4,4 0 0,0 8,10V16H6V18H9V23H11V18H13V23H15V18H18V16H16V10A4,4 0 0,0 12,6M2,9V11H6V9H2M18,9V11H22V9H18Z"/></svg><svg class="ui-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12,6A4,4 0 0,0 8,10V16H6V18H9V23H11V18H13V23H15V18H18V16H16V10A4,4 0 0,0 12,6Z"/></svg></span></button><button id="refresh-detail" class="button icon-only" type="button" title="Refresh" aria-label="Refresh"><svg class="ui-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14A9.95 9.95 0 0 0 12 2v2c1.08 0 2.13.21 3.11.63.95.4 1.81.98 2.54 1.71s1.31 1.59 1.72 2.54c.42.99.63 2.03.63 3.11s-.21 2.13-.63 3.11c-.4.95-.98 1.81-1.72 2.54-.17.17-.34.32-.52.48L15 15.99v6h6l-2.45-2.45c.18-.15.36-.31.52-.48.92-.92 1.64-1.99 2.14-3.18.52-1.23.79-2.54.79-3.89s-.26-2.66-.79-3.89a9.9 9.9 0 0 0-2.14-3.18ZM4.93 19.07c.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79v-2a7.9 7.9 0 0 1-3.11-.63c-.95-.4-1.81-.98-2.54-1.71s-1.31-1.59-1.72-2.54c-.42-.99-.63-2.03-.63-3.11s.21-2.13.63-3.11c.4-.95.98-1.81 1.72-2.54.17-.17.34-.32.52-.48L9 8.01V2H3l2.45 2.45c-.18.15-.36.31-.52.48-.92.92-1.64 1.99-2.14 3.18C2.27 9.34 2 10.65 2 12s.26 2.66.79 3.89c.5 1.19 1.22 2.26 2.14 3.18Z"/></svg></button><button id="open-native" class="button" type="button">Open device page</button></div>
        <div class="device-status" id="device-status">Connecting…</div>
      </section>`;

    document.getElementById("back-units").addEventListener("click", () => setRoute("dashboard"));
    document.getElementById("open-native").addEventListener("click", () => window.open(device.baseUrl + "/", "_blank"));
    app.querySelectorAll("[data-menu]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.menu;
      app.querySelectorAll(".choice-panel").forEach(p => p.classList.toggle("open", p.id === id && !p.classList.contains("open")));
    }));

    async function command(label, fn) {
      const status = document.getElementById("device-status");
      status.textContent = label;
      setDetailBusy(true);
      clearTimeout(detailTimer);
      detailTimer = null;
      try {
        await fn();
        status.textContent = "Command sent.";
        scheduleDetailRefresh(COMMAND_VERIFY_DELAY);
      }
      catch (e) {
        status.textContent = `Command failed: ${e.message || e}`;
        scheduleDetailRefresh(3000);
      }
      finally { setDetailBusy(false); }
    }

    function setDetailBusy(busy) {
      app.querySelectorAll(".thermostat-card button").forEach(b => b.disabled = busy);
    }

    app.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => command(`Setting ${human(b.dataset.mode)}…`, () => postAction(device.baseUrl, "climate", CLIMATE_NAME, "set", { mode: b.dataset.mode }))));
    const fanEntity = { AUTO: "AC Fan: Auto", LOW: "AC Fan: Low", MEDIUM: "AC Fan: Medium", HIGH: "AC Fan: High" };
    app.querySelectorAll("[data-fan]").forEach(b => b.addEventListener("click", () => command(`Setting fan ${human(b.dataset.fan)}…`, () => postAction(device.baseUrl, "button", fanEntity[b.dataset.fan], "press"))));
    app.querySelector("[data-boost]").addEventListener("click", () => command("Toggling Boost…", () => postAction(device.baseUrl, "button", "AC Preset: Boost", "press")));
    app.querySelectorAll("[data-swing]").forEach(b => b.addEventListener("click", () => command(`Setting swing ${human(b.dataset.swing)}…`, () => postAction(device.baseUrl, "climate", CLIMATE_NAME, "set", { swing_mode: b.dataset.swing }))));
    document.getElementById("toggle-display").addEventListener("click", () => command("Toggling display…", () => postAction(device.baseUrl, "button", "Turn off LED", "press")));
    document.getElementById("refresh-detail").addEventListener("click", loadDetail);
    document.getElementById("temp-down").addEventListener("click", () => adjustTemp(-1));
    document.getElementById("temp-up").addEventListener("click", () => adjustTemp(1));

    function adjustTemp(direction) {
      const c = device.climate || {};
      const step = Number(c.step) > 0 ? Number(c.step) : .5;
      const current = Number(c.target_temperature);
      if (!Number.isFinite(current)) return;

      let requestedCelsius;
      if (usesFahrenheit(device.temperatureUnit)) {
        // Fahrenheit UI steps in whole degrees, then maps to the nearest valid
        // Midea/ESPHome Celsius increment.
        const currentFahrenheit = Math.round(celsiusToFahrenheit(current));
        requestedCelsius = fahrenheitToCelsius(currentFahrenheit + direction);
      } else {
        requestedCelsius = current + direction * step;
      }

      let target = Math.round(requestedCelsius / step) * step;
      if (Number.isFinite(Number(c.min_temp))) target = Math.max(target, Number(c.min_temp));
      if (Number.isFinite(Number(c.max_temp))) target = Math.min(target, Number(c.max_temp));
      target = Math.round(target * 10) / 10;

      command(
        `Setting target ${formatTargetTemp(target, device.temperatureUnit, true)}…`,
        () => postAction(device.baseUrl, "climate", CLIMATE_NAME, "set", { target_temperature: target })
      );
    }

    function renderClimate(c) {
      device.climate = c;
      document.getElementById("current-temp").textContent = formatTemp(c.current_temperature, device.temperatureUnit);
      document.getElementById("target-temp").textContent = formatTargetTemp(c.target_temperature, device.temperatureUnit, false);
      const targetUnit = document.getElementById("target-unit");
      if (targetUnit) targetUnit.textContent = temperatureUnitSymbol(device.temperatureUnit);
      document.getElementById("center-mode").textContent = human(c.mode);
      document.getElementById("mode-value").textContent = human(c.mode);
      document.getElementById("fan-value").textContent = human(c.preset && String(c.preset).toUpperCase() === "BOOST" ? "BOOST" : c.fan_mode);
      document.getElementById("swing-value").textContent = human(c.swing_mode);
      document.getElementById("device-online").className = "status-pill online";
      document.getElementById("device-online").textContent = "Online";
      updateArc(c);
      updateChoices(c);
    }

    function updateChoices(c) {
      const mode = String(c.mode || "").toUpperCase();
      const fan = String(c.fan_mode || "").toUpperCase();
      const swing = String(c.swing_mode || "").toUpperCase();
      app.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
      app.querySelectorAll("[data-fan]").forEach(b => b.classList.toggle("active", b.dataset.fan === fan));
      app.querySelectorAll("[data-swing]").forEach(b => b.classList.toggle("active", b.dataset.swing === swing));
    }

    function updateArc(c) {
      const r = 112, circumference = 2 * Math.PI * r, arcLength = circumference * .75;
      const min = Number.isFinite(Number(c.min_temp)) ? Number(c.min_temp) : 17;
      const max = Number.isFinite(Number(c.max_temp)) ? Number(c.max_temp) : 30;
      const frac = value => Math.max(0, Math.min(1, (Number(value) - min) / (max - min)));
      const tf = frac(c.target_temperature), cf = frac(c.current_temperature);
      const track = document.getElementById("arc-track");
      track.style.strokeDasharray = `${arcLength} ${circumference - arcLength}`;
      function segment(el, a, b) {
        const start = Math.min(a,b), end = Math.max(a,b), len = Math.max(0,(end-start)*arcLength);
        el.style.display = len < .5 ? "none" : "";
        el.style.strokeDasharray = `${len} ${circumference-len}`;
        el.style.strokeDashoffset = String(-start*arcLength);
      }
      segment(document.getElementById("arc-zone"), tf, 1);
      segment(document.getElementById("arc-delta"), tf, cf);
      function marker(el, f) {
        const angle = (135 + f*270) * Math.PI/180;
        el.setAttribute("cx", (150+r*Math.cos(angle)).toFixed(2));
        el.setAttribute("cy", (150+r*Math.sin(angle)).toFixed(2));
      }
      marker(document.getElementById("target-marker"), tf);
      marker(document.getElementById("current-marker"), cf);
    }

    let detailRequestActive = false;

    function scheduleDetailRefresh(delay = DETAIL_REFRESH_INTERVAL) {
      clearTimeout(detailTimer);
      detailTimer = setTimeout(() => {
        detailTimer = null;
        loadDetail(true);
      }, delay);
    }

    async function loadDetail(scheduleNext = true) {
      if (route.name !== "device" || route.deviceId !== device.id) return;

      // Never overlap detail reads. A slow ESP32 response should not cause the
      // next poll to pile on top of the current request.
      if (detailRequestActive) {
        if (scheduleNext) scheduleDetailRefresh(1000);
        return;
      }

      clearTimeout(detailTimer);
      detailTimer = null;
      const status = document.getElementById("device-status");
      if (!status) return;
      detailRequestActive = true;

      try {
        const c = await tryEntity(
          device.baseUrl,
          "climate",
          [CLIMATE_NAME, "ac_unit"],
          true,
          REQUEST_TIMEOUT
        );

        if (route.name !== "device" || route.deviceId !== device.id) return;
        markDeviceSuccess(device, c);
        renderClimate(c);
        status.textContent = "Connected.";
        saveState();
      } catch (e) {
        if (route.name !== "device" || route.deviceId !== device.id) return;
        markDeviceFailure(device, e);
        saveState();

        const pill = document.getElementById("device-online");
        if (device.online === false) {
          if (pill) {
            pill.className = "status-pill offline";
            pill.textContent = "Offline";
          }
          status.textContent = `Unable to read controller after ${device.failureCount} consecutive attempts: ${e.message || e}`;
        } else {
          if (pill) {
            pill.className = "status-pill online";
            pill.textContent = "Online";
          }
          status.textContent = `Connection delayed (${device.failureCount}/${OFFLINE_FAILURE_THRESHOLD}); keeping unit Online.`;
        }
      } finally {
        detailRequestActive = false;
        if (scheduleNext && route.name === "device" && route.deviceId === device.id) {
          scheduleDetailRefresh();
        }
      }
    }

    // Read the per-controller display preference when this unit is opened.
    // This is intentionally not part of the 8-second climate polling loop.
    await refreshDeviceTemperatureUnit(device);
    if (device.climate) renderClimate(device.climate);
    await loadDetail(true);
  }

  function renderDiscover() {
    const first = state.subnets[0] || "192.168.1";
    app.innerHTML = `
      <h1 class="section-title">Discover AC Units</h1>
      <p class="section-copy">The browser does not expose its local subnet to a PWA. Enter the first three numbers and press Scan when you want to discover new controllers.</p>
      <section class="card"><div class="card-body">
        <div class="form-row"><label for="subnet-input">Local /24 network prefix</label><div class="inline-form"><input class="text-input" id="subnet-input" value="${escapeHtml(first)}" inputmode="decimal" placeholder="192.168.1"><button class="button primary" id="scan-button" type="button">Scan</button></div></div>
        <div class="progress-shell hidden" id="scan-progress-shell"><div class="progress-bar" id="scan-progress"></div></div>
        <div class="scan-status" id="scan-status">Scans addresses .1 through .254 for an ESPHome climate entity named “AC Unit”.</div>
      </div></section>
      <section class="card"><div class="card-body">
        <h2 class="section-title" style="font-size:1rem">Add a controller manually</h2>
        <div class="inline-form"><input class="text-input" id="manual-address" placeholder="192.168.1.72 or ac-bedroom.local"><button class="button" id="manual-add" type="button">Add</button></div>
      </div></section>
      <section class="card"><div class="card-body"><h2 class="section-title" style="font-size:1rem">Discovered / saved units</h2><div id="discover-device-list"></div></div></section>`;

    renderDiscoverList();
    document.getElementById("scan-button").addEventListener("click", () => startScan(document.getElementById("subnet-input").value));
    document.getElementById("manual-add").addEventListener("click", () => addManual(document.getElementById("manual-address").value));
  }

  function renderDiscoverList() {
    const host = document.getElementById("discover-device-list"); if (!host) return;
    host.innerHTML = state.devices.length ? state.devices.map(d => `
      <div class="saved-device"><div><strong>${escapeHtml(d.name)}</strong><div class="unit-address">${escapeHtml(d.deviceName || d.baseUrl)}${d.ipAddress ? " · " + escapeHtml(d.ipAddress) : ""}${d.macAddress ? " · " + escapeHtml(d.macAddress) : ""}</div></div><button class="button small" data-control="${escapeHtml(d.id)}" type="button">Control</button></div>`).join("") : `<div class="section-copy">No units saved yet.</div>`;
    host.querySelectorAll("[data-control]").forEach(b => b.addEventListener("click", () => setRoute("device", b.dataset.control)));
  }

  async function addManual(input) {
    const baseUrl = normalizeHost(input);
    if (!baseUrl) return showToast("Enter a valid IP address or hostname.");
    const btn = document.getElementById("manual-add"); btn.disabled = true;
    try {
      const probe = await probeDevice(baseUrl, REQUEST_TIMEOUT);
      const d = upsertDevice(baseUrl, probe, "manual");
      renderDiscoverList(); showToast(`${d.name} added.`);
    } catch (e) {
      showToast(`Controller not found: ${e.message || e}`, 4200);
    } finally { btn.disabled = false; }
  }

  async function startScan(prefix, quiet = false) {
    prefix = String(prefix || "").trim();
    if (!validSubnetPrefix(prefix)) {
      if (!quiet) showToast("Use a prefix such as 192.168.1");
      return;
    }
    if (!state.subnets.includes(prefix)) state.subnets.unshift(prefix);
    saveState();
    scanAbort = false;

    const scanButton = document.getElementById("scan-button");
    const status = document.getElementById("scan-status");
    const bar = document.getElementById("scan-progress");
    const shell = document.getElementById("scan-progress-shell");
    if (scanButton) { scanButton.disabled = true; scanButton.textContent = "Scanning…"; }
    shell?.classList.remove("hidden");

    let next = 1, complete = 0, found = 0;
    const total = 254;

    async function worker() {
      while (next <= total && !scanAbort) {
        const n = next++;
        const baseUrl = `http://${prefix}.${n}`;
        try {
          const probe = await probeDevice(baseUrl, SCAN_TIMEOUT);
          const before = state.devices.length;
          const d = upsertDevice(baseUrl, probe, "scan");
          if (state.devices.length > before) found++;
          if (!quiet) renderDiscoverList();
          console.info("Discovered", d.name, baseUrl);
        } catch (_) {}
        complete++;
        if (bar) bar.style.width = `${Math.round(complete/total*100)}%`;
        if (status) status.textContent = `Scanning ${prefix}.0/24 — ${complete}/${total}; ${found} new unit${found === 1 ? "" : "s"} found.`;
      }
    }

    await Promise.all(Array.from({length: SCAN_CONCURRENCY}, worker));
    state.lastScan = Date.now(); saveState();
    if (scanButton) { scanButton.disabled = false; scanButton.textContent = "Scan"; }
    if (status) status.textContent = `Scan complete. ${found} new unit${found === 1 ? "" : "s"} added.`;
    if (!quiet) renderDiscoverList();
    else if (route.name === "dashboard") { await refreshAllDevices(false); renderDashboard(); }
  }

  function renderSettings() {
    const origin = location.origin;
    const yaml = `web_server:\n  port: 80\n  version: 3\n  allowed_origins:\n    - ${origin}\n  enable_private_network_access: true`;
    app.innerHTML = `
      <h1 class="section-title">Settings</h1>
      <section class="card"><div class="card-body">
        <div class="form-row"><label>Software Version</label><div><strong>v${escapeHtml(APP_VERSION)}</strong></div></div>
        <div class="form-row"><label>Remembered subnet(s)</label><div>${state.subnets.length ? state.subnets.map(s => `<span class="status-pill">${escapeHtml(s)}.0/24</span>`).join(" ") : "None"}</div></div>
        <p class="section-copy" style="margin-top:12px">Saved controllers are checked directly when the app starts. Full /24 subnet scans run only when you press Scan on the Discover page.</p>
      </div></section>
      <section class="card"><div class="card-body">
        <h2 class="section-title" style="font-size:1rem">Required ESPHome web-server settings</h2>
        <p class="section-copy">Merge these lines into each controller's existing <code>web_server:</code> block. The allowed origin must exactly match where this PWA is hosted.</p>
        <div class="code-box">${escapeHtml(yaml)}</div>
        <p class="section-copy" style="margin-top:12px">With the current controller YAML, discovery uses <strong>Device Friendly Name</strong> for the room label, <strong>Device Name</strong> as the permanent controller identity, records the controller's MAC/current IP address, and reads the per-unit <strong>Temperature Unit</strong> preference. Temperature Unit is configured on the individual controller, not in this PWA.</p>
      </div></section>
      <section class="card"><div class="card-body"><h2 class="section-title" style="font-size:1rem">Saved controllers</h2><div>${state.devices.map(d => `<div class="saved-device"><div><strong>${escapeHtml(d.name)}</strong><div class="unit-address">${escapeHtml(d.baseUrl)}</div></div><button class="button danger small" data-remove="${escapeHtml(d.id)}">Remove</button></div>`).join("") || "No saved controllers."}</div></div></section>`;

    app.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
      state.devices = state.devices.filter(d => d.id !== b.dataset.remove); saveState(); renderSettings();
    }));
  }

  document.querySelectorAll(".nav-button").forEach(b => b.addEventListener("click", () => setRoute(b.dataset.route)));

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault(); installPrompt = event; installButton.classList.remove("hidden");
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.classList.add("hidden");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
  }

  setRoute("dashboard");
  // On startup, check only saved controllers. A full subnet scan is intentionally
  // user-initiated from Discover so the ESP32 web servers are never flooded.
  refreshAllDevices(true);
})();
