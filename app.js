(function () {
  // Restored baseline:
  // - direct ESPHome climate REST controls
  // - 3 top-level tabs
  // - 10 schedules
  // - Midea IR LED control
  // - no SSE/mirror/diagnostic climate workarounds
  "use strict";

  var SLOT_COUNT = 10;
  var SAVE_DELAY_MS = 350;
  var REQUEST_TIMEOUT_MS = 5000;
  var routeCache = Object.create(null);
  var customDeviceIconDataUri = "data:image/png;base64,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";

  var styleElement = document.createElement("style");
  styleElement.textContent = [
    "#main-tab-bar, #quick-controls-section-title, #quick-controls-root, #scheduler-section-title, #scheduler-tabs, #scheduler-root, #settings-section-title, #settings-root {",
    "  --sched-primary: var(--md-sys-color-primary, var(--primary-color, #0061a4));",
    "  --sched-on-primary: var(--md-sys-color-on-primary, #ffffff);",
    "  --sched-primary-container: var(--md-sys-color-primary-container, color-mix(in srgb, var(--sched-primary) 16%, transparent));",
    "  --sched-on-primary-container: var(--md-sys-color-on-primary-container, var(--sched-primary));",
    "  --sched-surface: var(--md-sys-color-surface-container, var(--card-background-color, Canvas));",
    "  --sched-surface-high: var(--md-sys-color-surface-container-high, var(--secondary-background-color, color-mix(in srgb, CanvasText 6%, Canvas)));",
    "  --sched-text: var(--md-sys-color-on-surface, var(--primary-text-color, CanvasText));",
    "  --sched-muted: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, color-mix(in srgb, CanvasText 68%, Canvas)));",
    "  --sched-outline: var(--md-sys-color-outline-variant, var(--divider-color, color-mix(in srgb, CanvasText 20%, transparent)));",
    "  --sched-error: var(--md-sys-color-error, #ba1a1a);",
    "  --sched-success: #2e7d32;",
    "  --sched-warning: #8a6100;",
    "  color: var(--sched-text);",
    "  font: inherit;",
    "  color-scheme: inherit;",
    "}",
    "#main-tab-bar { display: flex; gap: 4px; width: calc(100% - 20px); max-width: 600px; margin: 16px auto 20px; padding: 4px; box-sizing: border-box; border: 1px solid var(--sched-outline); border-radius: 12px; background: var(--sched-surface); box-shadow: 0 1px 2px rgba(0,0,0,.08); }",
    ".main-tab-btn { appearance: none; flex: 1 1 0; min-width: 0; height: 44px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--sched-muted); font: inherit; font-size: .92rem; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background-color .15s ease, color .15s ease; }",
    ".main-tab-btn:hover { background: var(--sched-surface-high); color: var(--sched-text); }",
    ".main-tab-btn.active-main-tab { background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".main-tab-btn:focus-visible { outline: 2px solid var(--sched-primary); outline-offset: 2px; }",
    "#settings-section-title { width: calc(100% - 20px); max-width: 600px; margin: 24px auto 0; padding: 13px 18px; box-sizing: border-box; background: var(--sched-surface-high); color: var(--sched-text); border: 1px solid var(--sched-outline); border-bottom: 0; border-radius: 12px 12px 0 0; font-size: 1.15rem; font-weight: 500; line-height: 1.4; }",
    "#settings-root { width: calc(100% - 20px); max-width: 600px; margin: 0 auto 20px; box-sizing: border-box; overflow: hidden; background: var(--sched-surface); color: var(--sched-text); border: 1px solid var(--sched-outline); border-radius: 0 0 12px 12px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }",
    ".settings-placeholder { padding: 18px; color: var(--sched-muted); font-size: .92rem; line-height: 1.55; }",
    ".settings-placeholder strong { color: var(--sched-text); font-weight: 500; }",
    ".settings-body { padding: 18px 20px 20px; }",
    ".settings-row { display: grid; grid-template-columns: 150px minmax(0,1fr); gap: 16px; align-items: center; min-height: 58px; padding: 10px 0; border-bottom: 1px solid var(--sched-outline); }",
    ".settings-row:last-of-type { border-bottom: 0; }",
    ".settings-label { color: var(--sched-muted); font-size: .9rem; }",
    ".settings-field { display: flex; align-items: center; gap: 10px; min-width: 0; }",
    ".settings-text-input { flex: 1 1 auto; min-width: 0; min-height: 40px; padding: 8px 11px; box-sizing: border-box; border: 1px solid var(--sched-outline); border-radius: 8px; background: var(--sched-surface); color: var(--sched-text); font: inherit; }",
    ".settings-text-input:focus { border-color: var(--sched-primary); outline: 2px solid var(--sched-primary); outline-offset: 1px; }",
    ".settings-select { flex: 1 1 auto; min-width: 0; min-height: 40px; padding: 8px 34px 8px 11px; box-sizing: border-box; border: 1px solid var(--sched-outline); border-radius: 8px; background: var(--sched-surface); color: var(--sched-text); font: inherit; cursor: pointer; }",
    ".settings-select:focus { border-color: var(--sched-primary); outline: 2px solid var(--sched-primary); outline-offset: 1px; }",
    ".settings-value { min-width: 0; overflow-wrap: anywhere; color: var(--sched-text); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .9rem; }",
    ".settings-save-btn { appearance: none; min-height: 40px; padding: 8px 15px; border: 1px solid var(--sched-primary); border-radius: 8px; background: var(--sched-primary); color: var(--sched-on-primary); font: inherit; cursor: pointer; }",
    ".settings-save-btn:disabled { opacity: .55; cursor: default; }",
    ".settings-note { margin-top: 14px; color: var(--sched-muted); font-size: .82rem; line-height: 1.5; }",
    ".settings-status { min-height: 20px; margin-top: 12px; color: var(--sched-muted); font-size: .82rem; }",
    ".settings-status.status-ok { color: var(--sched-success); }",
    ".settings-status.status-error { color: var(--sched-error); }",
    ".settings-status.status-pending { color: var(--sched-warning); }",
    "@media (max-width: 520px) { .settings-body { padding-left: 16px; padding-right: 16px; } .settings-row { grid-template-columns: 1fr; gap: 7px; } .settings-field { width: 100%; } }",
    "#quick-controls-section-title { width: calc(100% - 20px); max-width: 600px; margin: 24px auto 0; padding: 13px 18px; box-sizing: border-box; background: var(--sched-surface-high); color: var(--sched-text); border: 1px solid var(--sched-outline); border-bottom: 0; border-radius: 12px 12px 0 0; font-size: 1.15rem; font-weight: 500; line-height: 1.4; }",
    "#quick-controls-root { width: calc(100% - 20px); max-width: 600px; margin: 18px auto 20px; box-sizing: border-box; overflow: hidden; background: var(--sched-surface); color: var(--sched-text); border: 1px solid var(--sched-outline); border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }",
    ".climate-panel { padding: 18px; display: grid; gap: 18px; }",
    ".climate-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }",
    ".climate-summary-card { min-width: 0; padding: 14px; border: 1px solid var(--sched-outline); border-radius: 12px; background: var(--sched-surface-high); text-align: center; }",
    ".climate-summary-label { display: block; margin-bottom: 5px; color: var(--sched-muted); font-size: .78rem; font-weight: 500; letter-spacing: .02em; text-transform: uppercase; }",
    ".climate-summary-value { display: block; color: var(--sched-text); font-size: 1.55rem; font-weight: 600; line-height: 1.2; }",
    ".climate-target-control { display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; gap: 10px; }",
    ".climate-round-button { appearance: none; width: 48px; height: 48px; border: 1px solid var(--sched-outline); border-radius: 50%; background: var(--sched-surface); color: var(--sched-primary); font: inherit; font-size: 1.55rem; line-height: 1; cursor: pointer; }",
    ".climate-round-button:hover { background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".climate-round-button:disabled { opacity: .45; cursor: not-allowed; }",
    ".climate-target-slider-wrap { min-width: 0; text-align: center; }",
    ".climate-target-number { color: var(--sched-text); font-size: 1.35rem; font-weight: 600; }",
    ".climate-target-slider { width: 100%; margin-top: 8px; accent-color: var(--sched-primary); }",
    ".climate-control-group { display: grid; gap: 8px; }",
    ".climate-control-label { color: var(--sched-muted); font-size: .82rem; font-weight: 600; letter-spacing: .02em; text-transform: uppercase; }",
    ".climate-choice-row { display: flex; flex-wrap: wrap; gap: 8px; }",
    ".climate-choice { appearance: none; min-height: 40px; padding: 8px 13px; border: 1px solid var(--sched-outline); border-radius: 10px; background: var(--sched-surface); color: var(--sched-text); font: inherit; font-size: .86rem; cursor: pointer; transition: background-color .15s ease, border-color .15s ease, color .15s ease, opacity .15s ease; }",
    ".climate-choice:hover:not(:disabled) { background: var(--sched-surface-high); border-color: var(--sched-muted); }",
    ".climate-choice.active { background: var(--sched-primary-container); border-color: var(--sched-primary); color: var(--sched-on-primary-container); }",
    ".climate-choice:disabled { opacity: .38; cursor: not-allowed; }",
    ".climate-action-row { display: flex; flex-wrap: wrap; gap: 10px; }",
    ".climate-action-button { appearance: none; min-height: 42px; padding: 9px 15px; border: 1px solid var(--sched-outline); border-radius: 10px; background: var(--sched-surface); color: var(--sched-primary); font: inherit; font-weight: 500; cursor: pointer; }",
    ".climate-action-button:hover:not(:disabled) { background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".climate-action-button:disabled { opacity: .45; cursor: wait; }",
    ".climate-icon-button { width: 52px; min-width: 52px; height: 48px; min-height: 48px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }",
    ".climate-icon-button .ui-action-icon { display: block; width: 27px; height: 27px; }",
    ".climate-icon-button-pair { width: 66px; min-width: 66px; }",
    ".climate-icon-pair { display: inline-flex; align-items: center; justify-content: center; gap: 1px; }",
    ".climate-icon-pair .ui-action-icon { width: 25px; height: 25px; }",
    ".climate-beeper-button .beeper-icon-off { display: none; }",
    ".climate-beeper-button[data-beeper-state=\"off\"] .beeper-icon-on { display: none; }",
    ".climate-beeper-button[data-beeper-state=\"off\"] .beeper-icon-off { display: block; }",
    ".climate-footer { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; padding-top: 4px; border-top: 1px solid var(--sched-outline); }",
    ".climate-status { min-height: 20px; color: var(--sched-muted); font-size: .82rem; line-height: 1.4; }",
    ".climate-status.status-ok { color: var(--sched-success); }",
    ".climate-status.status-pending { color: var(--sched-warning); }",
    ".climate-status.status-error { color: var(--sched-error); }",
    ".climate-wifi { color: var(--sched-muted); font-size: .8rem; white-space: nowrap; }",
    ".climate-capability-note { color: var(--sched-muted); font-size: .76rem; line-height: 1.35; }",
    ".thermostat-panel { gap: 14px; }",
    ".thermostat-top { text-align: center; padding-top: 2px; margin-bottom: -24px; }",
    ".thermostat-current-label { color: var(--sched-muted); font-size: .84rem; line-height: 1.3; }",
    ".thermostat-current-value { margin-top: 3px; color: var(--sched-text); font-size: 1.42rem; font-weight: 600; line-height: 1.2; }",
    ".thermostat-dial { position: relative; width: min(100%, 400px); aspect-ratio: 1 / .86; margin: 0 auto; }",
    ".thermostat-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }",
    ".thermostat-arc-track, .thermostat-arc-zone, .thermostat-arc-delta { fill: none; stroke-width: 18; stroke-linecap: round; transform: rotate(135deg); transform-origin: 150px 150px; }",
    ".thermostat-arc-track { stroke: var(--sched-surface-high); }",
    ".thermostat-arc-zone { stroke: var(--sched-primary); opacity: .32; }",
    ".thermostat-arc-delta { stroke: var(--sched-primary); opacity: .95; }",
    ".thermostat-target-marker { fill: var(--sched-surface); stroke: var(--sched-primary); stroke-width: 3.5; }",
    ".thermostat-current-marker { fill: var(--sched-primary); stroke: var(--sched-primary-container); stroke-width: 3; }",
    ".thermostat-center { position: absolute; left: 50%; top: 48%; transform: translate(-50%, -50%); width: 58%; text-align: center; pointer-events: none; }",
    ".thermostat-center-mode { min-height: 22px; color: var(--sched-text); font-size: .98rem; font-weight: 500; line-height: 1.25; }",
    ".thermostat-target-line { display: inline-flex; align-items: flex-start; justify-content: center; margin-top: 7px; color: var(--sched-text); }",
    ".thermostat-target-value { font-size: 3.45rem; font-weight: 400; line-height: .95; letter-spacing: -.04em; }",
    ".thermostat-target-unit { margin: 3px 0 0 4px; font-size: 1rem; font-weight: 500; line-height: 1; }",
    ".thermostat-step-row { position: absolute; left: 50%; bottom: 1%; transform: translateX(-50%); display: flex; gap: 20px; }",
    ".thermostat-step-button { appearance: none; width: 46px; height: 46px; padding: 0; border: 1px solid var(--sched-muted); border-radius: 50%; background: var(--sched-surface); color: var(--sched-text); font: inherit; font-size: 1.65rem; font-weight: 300; line-height: 42px; text-align: center; cursor: pointer; transition: background-color .15s ease, transform .08s ease, opacity .15s ease; }",
    ".thermostat-step-button:hover:not(:disabled) { background: var(--sched-surface-high); }",
    ".thermostat-step-button:active:not(:disabled) { transform: scale(.95); }",
    ".thermostat-step-button:disabled { opacity: .42; cursor: wait; }",
    ".thermostat-hidden-slider { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; opacity: 0; pointer-events: none; }",
    ".thermostat-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 2px; }",
    ".thermostat-tile { appearance: none; min-width: 0; min-height: 58px; display: grid; grid-template-columns: 28px minmax(0,1fr); align-items: center; gap: 8px; padding: 9px 10px; border: 1px solid transparent; border-radius: 12px; background: var(--sched-surface-high); color: var(--sched-text); font: inherit; text-align: left; cursor: pointer; transition: border-color .15s ease, background-color .15s ease, opacity .15s ease; }",
    ".thermostat-tile:hover:not(:disabled), .thermostat-tile.menu-open { border-color: var(--sched-outline); background: var(--sched-primary-container); }",
    ".thermostat-tile:disabled { opacity: .45; cursor: wait; }",
    ".thermostat-tile-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; color: var(--sched-text); font-size: 1.25rem; line-height: 1; }",
    ".thermostat-tile-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }",
    ".thermostat-tile-text { min-width: 0; display: grid; gap: 1px; }",
    ".thermostat-tile-label { overflow: hidden; color: var(--sched-muted); font-size: .72rem; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }",
    ".thermostat-tile-value { overflow: hidden; color: var(--sched-text); font-size: .83rem; font-weight: 500; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; }",
    ".thermostat-menu-area { min-height: 0; }",
    ".thermostat-menu { display: none; flex-wrap: wrap; gap: 8px; margin-top: 2px; padding: 10px; border: 1px solid var(--sched-outline); border-radius: 12px; background: var(--sched-surface-high); }",
    ".thermostat-menu.open { display: flex; }",
    ".thermostat-menu .climate-choice { background: var(--sched-surface); }",
    ".ac-quick-button-row { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 12px; padding: 16px 18px 10px; }",
    ".ac-quick-button { appearance: none; position: relative; display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; padding: 0; border: 1px solid var(--sched-outline); border-radius: 14px; background: var(--sched-surface); color: var(--sched-primary); font: inherit; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.08); transition: background-color .15s ease, border-color .15s ease, transform .08s ease, opacity .15s ease; }",
    ".ac-quick-button:hover { border-color: var(--sched-muted); background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".ac-quick-button:active { transform: scale(.95); }",
    ".ac-quick-button:disabled { opacity: .55; cursor: wait; transform: none; }",
    ".ac-quick-button.command-sent { border-color: var(--sched-primary); background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".ac-quick-icon { width: 28px; height: 28px; display: block; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }",
    ".ac-quick-speed-badge { position: absolute; right: 5px; bottom: 4px; min-width: 16px; height: 16px; padding: 0 3px; box-sizing: border-box; border-radius: 8px; background: var(--sched-primary); color: var(--sched-on-primary); font-size: 10px; font-weight: 700; line-height: 16px; text-align: center; pointer-events: none; }",
    ".ac-quick-status { min-height: 20px; padding: 0 18px 12px; color: var(--sched-muted); font-size: .8rem; }",
    ".ac-quick-status.status-ok { color: var(--sched-success); }",
    ".ac-quick-status.status-pending { color: var(--sched-warning); }",
    ".ac-quick-status.status-error { color: var(--sched-error); }",
    ".visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }",
    "#scheduler-section-title { width: calc(100% - 20px); max-width: 600px; margin: 24px auto 0; padding: 13px 18px; box-sizing: border-box; background: var(--sched-surface-high); color: var(--sched-text); border: 1px solid var(--sched-outline); border-bottom: 0; border-radius: 12px 12px 0 0; font-size: 1.15rem; font-weight: 500; line-height: 1.4; }",
    ".tab-bar-container { display: flex; overflow-x: auto; gap: 4px; width: calc(100% - 20px); max-width: 600px; margin: 0 auto; padding: 4px; background: var(--sched-surface); border: 1px solid var(--sched-outline); border-top: 0; border-bottom: 0; border-radius: 0; box-sizing: border-box; scrollbar-width: none; }",
    ".tab-bar-container::-webkit-scrollbar { display: none; }",
    ".sched-tab-btn { appearance: none; min-width: 44px; height: 40px; padding: 0 14px; border: 0; border-radius: 8px; background: transparent; color: var(--sched-muted); font: inherit; font-size: 0.875rem; font-weight: 500; line-height: 40px; cursor: pointer; white-space: nowrap; transition: background-color .15s ease, color .15s ease; }",
    ".sched-tab-btn:hover { background: var(--sched-surface-high); color: var(--sched-text); }",
    ".sched-tab-btn.active-tab { background: var(--sched-primary-container); color: var(--sched-on-primary-container); }",
    ".sched-tab-btn:focus-visible, .ac-quick-button:focus-visible, #scheduler-root select:focus-visible, .day-btn:focus-visible, .toggle-switch input:focus-visible + .slider { outline: 2px solid var(--sched-primary); outline-offset: 2px; }",
    ".esphome-card { display: none; width: 100%; max-width: 600px; margin: 0 0 20px; padding: 0; box-sizing: border-box; overflow: hidden; background: var(--sched-surface); color: var(--sched-text); border: 1px solid var(--sched-outline); border-radius: 0 0 12px 12px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }",
    ".esphome-card.tab-active { display: block; }",
    ".card-header-container { display: flex; justify-content: space-between; align-items: center; gap: 16px; min-height: 64px; padding: 12px 20px; box-sizing: border-box; border-bottom: 1px solid var(--sched-outline); }",
    ".card-title { margin: 0; color: var(--sched-text); font-size: 1.05rem; font-weight: 500; line-height: 1.4; }",
    ".schedule-name-input { flex: 1 1 auto; min-width: 0; max-width: 310px; height: 42px; margin: 0; padding: 8px 11px; box-sizing: border-box; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--sched-text); font: inherit; font-size: 1.05rem; font-weight: 500; line-height: 1.4; }",
    ".schedule-name-input:hover { border-color: var(--sched-outline); background: var(--sched-surface-high); }",
    ".schedule-name-input:focus { border-color: var(--sched-primary); background: var(--sched-surface); outline: 2px solid var(--sched-primary); outline-offset: 1px; }",
    ".schedule-name-input::placeholder { color: var(--sched-muted); opacity: .85; }",
    ".switch-container { display: flex; align-items: center; gap: 10px; color: var(--sched-muted); font-size: 0.875rem; white-space: nowrap; }",
    ".toggle-switch { position: relative; display: inline-block; flex: 0 0 auto; width: 52px; height: 32px; }",
    ".toggle-switch input { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }",
    ".slider { position: absolute; inset: 0; cursor: pointer; border: 2px solid var(--sched-muted); border-radius: 18px; background: var(--sched-surface-high); transition: background-color .18s ease, border-color .18s ease; }",
    ".slider:before { position: absolute; content: ''; width: 20px; height: 20px; left: 4px; top: 4px; border-radius: 50%; background: var(--sched-muted); transition: transform .18s ease, width .18s ease, height .18s ease, background-color .18s ease; }",
    ".toggle-switch input:checked + .slider { border-color: var(--sched-primary); background: var(--sched-primary); }",
    ".toggle-switch input:checked + .slider:before { transform: translateX(20px); background: var(--sched-on-primary); }",
    ".card-body-content { padding: 4px 20px 2px; }",
    ".form-row { display: flex; align-items: center; gap: 16px; min-height: 52px; margin: 0; padding: 10px 0; box-sizing: border-box; border-bottom: 1px solid var(--sched-outline); }",
    ".form-row:last-child { border-bottom: 0; }",
    ".form-row > label { width: 130px; flex: 0 0 130px; color: var(--sched-muted); font-size: 0.9rem; font-weight: 400; }",
    "#scheduler-root select { appearance: auto; min-height: 40px; padding: 7px 34px 7px 12px; box-sizing: border-box; border: 1px solid var(--sched-outline); border-radius: 8px; background-color: var(--sched-surface); color: var(--sched-text); font: inherit; font-size: 0.95rem; cursor: pointer; }",
    "#scheduler-root select:hover { border-color: var(--sched-muted); }",
    ".temp-slider-container { display: flex; align-items: center; gap: 12px; flex: 1 1 auto; min-width: 0; }",
    ".time-select-container { display: flex; align-items: center; gap: 8px; }",
    ".end-time-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }",
    ".end-time-enable { display: inline-flex; align-items: center; gap: 7px; color: var(--sched-muted); font-size: .88rem; cursor: pointer; }",
    ".end-time-enable input { width: 18px; height: 18px; margin: 0; accent-color: var(--sched-primary); cursor: pointer; }",
    ".end-time-select-container { display: flex; align-items: center; gap: 8px; }",
    ".end-time-select-container.end-time-disabled { opacity: .45; }",
    ".schedule-action-controls { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 28px; }",
    ".schedule-action-item { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 7px; color: var(--sched-muted); font-size: .88rem; cursor: pointer; }",
    ".schedule-action-item span { white-space: nowrap; }",
    ".schedule-action-item input { width: 19px; height: 19px; margin: 0; accent-color: var(--sched-primary); cursor: pointer; }",
    ".time-separator { color: var(--sched-muted); font-weight: 500; }",
    ".temp-slider-container input[type='range'] { flex: 1 1 auto; min-width: 120px; accent-color: var(--sched-primary); cursor: pointer; }",
    ".temp-val { min-width: 58px; padding: 6px 10px; box-sizing: border-box; border-radius: 8px; background: var(--sched-primary-container); color: var(--sched-on-primary-container); font-size: 0.9rem; font-weight: 500; text-align: center; }",
    ".bubbles-container { display: flex; flex-wrap: wrap; gap: 8px; }",
    ".day-btn { appearance: none; width: 36px; height: 36px; padding: 0; border: 1px solid var(--sched-outline); border-radius: 18px; background: var(--sched-surface); color: var(--sched-muted); font: inherit; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: background-color .15s ease, border-color .15s ease, color .15s ease; }",
    ".day-btn:hover { border-color: var(--sched-muted); background: var(--sched-surface-high); color: var(--sched-text); }",
    ".day-btn.active { border-color: var(--sched-primary); background: var(--sched-primary); color: var(--sched-on-primary); }",
    ".debug-label { margin: 14px 20px 6px; color: var(--sched-muted); font-size: 0.78rem; }",
    ".raw-debug { width: calc(100% - 40px); margin: 0 20px; padding: 10px 12px; box-sizing: border-box; overflow-wrap: anywhere; border: 1px solid var(--sched-outline); border-radius: 8px; background: var(--sched-surface-high); color: var(--sched-text); font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace; font-size: 0.82rem; }",
	".debug-label, .raw-debug { display: none !important; }",
    ".save-status { min-height: 20px; margin: 8px 20px 16px; color: var(--sched-muted); font-size: 0.8rem; }",
    ".save-status.status-ok { color: var(--sched-success); }",
    ".save-status.status-pending { color: var(--sched-warning); }",
    ".save-status.status-error { color: var(--sched-error); }",
    ".disabled-card-overlay .card-body-content, .disabled-card-overlay .debug-label, .disabled-card-overlay .raw-debug { opacity: .5; }",
    "@supports not (color: color-mix(in srgb, black 50%, white)) { #main-tab-bar, #quick-controls-section-title, #quick-controls-root, #scheduler-section-title, #scheduler-tabs, #scheduler-root, #settings-section-title, #settings-root { --sched-primary-container: rgba(0,97,164,.14); --sched-surface-high: rgba(127,127,127,.10); --sched-muted: #6b7280; --sched-outline: rgba(127,127,127,.28); } }",
    "@media (prefers-color-scheme: dark) { #main-tab-bar, #quick-controls-section-title, #quick-controls-root, #scheduler-section-title, #scheduler-tabs, #scheduler-root, #settings-section-title, #settings-root { --sched-success: #81c784; --sched-warning: #ffd166; } }",
    "@media (max-width: 520px) { .thermostat-dial { width: min(100%, 360px); } .thermostat-target-value { font-size: 3.15rem; } .thermostat-tiles { gap: 8px; } .thermostat-tile { grid-template-columns: 24px minmax(0,1fr); gap: 6px; min-height: 56px; padding: 8px; } .thermostat-tile-icon { width: 24px; height: 24px; font-size: 1.08rem; } .thermostat-tile-label { font-size: .67rem; } .thermostat-tile-value { font-size: .78rem; } }",
    "@media (max-width: 520px) { #main-tab-bar, #quick-controls-section-title, #quick-controls-root, #scheduler-section-title, .tab-bar-container, #scheduler-root, #settings-section-title, #settings-root { width: 100%; max-width: none; margin-left: 0; margin-right: 0; } #main-tab-bar, #quick-controls-section-title, #scheduler-section-title, #settings-section-title, #settings-root { margin-left: 0; margin-right: 0; } #quick-controls-section-title, #scheduler-section-title, #settings-section-title { padding: 13px 16px; border-left: 0; border-right: 0; border-radius: 0; } #quick-controls-root { border-left: 0; border-right: 0; border-radius: 0; } .tab-bar-container, .esphome-card { border-left: 0; border-right: 0; border-radius: 0; } .card-header-container { align-items: flex-start; padding: 12px 16px; } .schedule-name-input { width: 100%; max-width: none; } .card-body-content { padding-left: 16px; padding-right: 16px; } .form-row { align-items: flex-start; flex-direction: column; gap: 7px; } .form-row > label { width: auto; flex-basis: auto; } .temp-slider-container { width: 100%; } .debug-label { margin-left: 16px; margin-right: 16px; } .raw-debug { width: calc(100% - 32px); margin-left: 16px; margin-right: 16px; } .save-status { margin-left: 16px; margin-right: 16px; } .climate-panel { padding: 16px; } .climate-summary { grid-template-columns: 1fr 1fr; } .climate-choice { flex: 1 1 calc(33.333% - 8px); } .climate-footer { grid-template-columns: 1fr; } .climate-wifi { white-space: normal; } }",
	".dual-control-row { display: flex !important; gap: 20px !important; align-items: center !important; }",
	".schedule-control-group { flex: 1 1 0 !important; display: flex !important; align-items: center !important; gap: 10px !important; min-width: 0 !important; }",
	".schedule-control-group label { flex: 0 0 auto !important; white-space: nowrap !important; }",
	".schedule-control-group select { flex: 1 1 auto !important; min-width: 100px !important; }",
	"@media (max-width: 650px) { .dual-control-row { flex-direction: column !important; align-items: stretch !important; } .schedule-control-group { width: 100% !important; } }"	
  ].join("\n");
  document.head.appendChild(styleElement);

  // Hide the ESPHome Web Server v3 uptime sentence (for example,
  // "Started 12 minutes 8 seconds ago") without moving or replacing
  // any Lit-managed DOM nodes.
  var uptimeRootObservers = new WeakMap();
  var uptimeTextPattern = /^started\s+.+\s+ago$/i;

  function elementDirectText(element) {
    var text = "";
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        text += " " + (node.textContent || "");
      }
    }
    return text.replace(/\s+/g, " ").trim();
  }

  function hideEspHomeStartedUptime(root) {
    if (!root || !root.querySelectorAll) return false;

    // Replace the native ESPHome header icon and reduce the device title
    // independently of the device/room name.
    replaceNativeDeviceIcon(root);
    scaleNativeDeviceTitle(root);
    alignNativeDeviceHeader(root);

    var hiddenAny = false;
    var elements = root.querySelectorAll("*");

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      // Watch every open shadow root so the rule survives ESPHome/Lit rerenders.
      if (element.shadowRoot) {
        observeUptimeRoot(element.shadowRoot);
        if (hideEspHomeStartedUptime(element.shadowRoot)) hiddenAny = true;
      }

      if (element.getAttribute("data-hide-esphome-started") === "true") continue;

      // Prefer text directly owned by the element. This avoids hiding a larger
      // container that also contains the device name or other status controls.
      var candidateText = elementDirectText(element);
      if (!candidateText && element.children.length === 0) {
        candidateText = (element.textContent || "").replace(/\s+/g, " ").trim();
      }

      if (uptimeTextPattern.test(candidateText)) {
        element.style.setProperty("display", "none", "important");
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("data-hide-esphome-started", "true");
        hiddenAny = true;
      }
    }

    return hiddenAny;
  }

  function observeUptimeRoot(root) {
    if (!root || uptimeRootObservers.has(root)) return;

    var observer = new MutationObserver(function () {
      hideEspHomeStartedUptime(root);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });

    uptimeRootObservers.set(root, observer);
  }

  observeUptimeRoot(document.documentElement);
  hideEspHomeStartedUptime(document);

  var headerResizeTimer = null;
  window.addEventListener("resize", function () {
    if (headerResizeTimer) window.clearTimeout(headerResizeTimer);
    headerResizeTimer = window.setTimeout(function () {
      hideEspHomeStartedUptime(document);
    }, 120);
  });

  // ESPHome creates its web component asynchronously. Scan briefly during
  // startup so any newly attached shadow root is discovered and observed.
  var uptimeStartupScans = 0;
  var uptimeStartupTimer = window.setInterval(function () {
    hideEspHomeStartedUptime(document);
    uptimeStartupScans += 1;
    if (uptimeStartupScans >= 30) {
      window.clearInterval(uptimeStartupTimer);
    }
  }, 1000);

  function defaultSlotState(slotIndex) {
    var cron = "0 00 00 * * *";
    if (slotIndex === 1) cron = "0 30 07 * * 1,2,3,4,5";
    if (slotIndex === 2) cron = "0 00 22 * * 0,6";

    return {
      name: "Schedule " + slotIndex,
      enabled: slotIndex <= 2,
      mode: "OFF",
      fan: "AUTO",
      temp: 21.0,
      cron: cron,
      endCron: "DISABLED",
      beepOff: false,
      displayOff: false
    };
  }

  function entitiesForSlot(slotIndex) {
    var prefix = "S" + slotIndex;
    var legacyPrefix = "s" + slotIndex;

    return {
      name: {
        domain: "text",
        name: prefix + " Name",
        legacyId: legacyPrefix + "_name"
      },
      enabled: {
        domain: "select",
        name: prefix + " Enabled",
        legacyId: legacyPrefix + "_enabled",
        trueValue: "ENABLED",
        falseValue: "DISABLED"
      },
      mode: {
        domain: "select",
        name: prefix + " Mode",
        legacyId: legacyPrefix + "_mode"
      },
      fan: {
        domain: "select",
        name: prefix + " Fan",
        legacyId: legacyPrefix + "_fan"
      },
      temp: {
        domain: "number",
        name: prefix + " Temp",
        legacyId: legacyPrefix + "_temp"
      },
      cron: {
        domain: "text",
        name: prefix + " CronString",
        legacyId: legacyPrefix + "_cronstring"
      },
      endCron: {
        domain: "text",
        name: prefix + " EndCronString",
        legacyId: legacyPrefix + "_endcronstring"
      },
      beepOff: {
        domain: "select",
        name: prefix + " Beep Off",
        legacyId: legacyPrefix + "_beep_off",
        trueValue: "ENABLED",
        falseValue: "DISABLED"
      },
      displayOff: {
        domain: "select",
        name: prefix + " Display Off",
        legacyId: legacyPrefix + "_display_off",
        trueValue: "ENABLED",
        falseValue: "DISABLED"
      }
    };
  }

  function entityCacheKey(entity) {
    return entity.domain + "|" + entity.name;
  }

  function entityBaseUrls(entity) {
    var modern = "/" + entity.domain + "/" + encodeURIComponent(entity.name);
    var legacy = "/" + entity.domain + "/" + encodeURIComponent(entity.legacyId);
    var cached = routeCache[entityCacheKey(entity)];
    var urls = [];

    if (cached) urls.push(cached);
    if (urls.indexOf(modern) === -1) urls.push(modern);
    if (urls.indexOf(legacy) === -1) urls.push(legacy);

    return urls;
  }

  async function requestWithRouteFallback(entity, makeUrl, options, expectJson) {
    var bases = entityBaseUrls(entity);
    var lastError = null;

    for (var i = 0; i < bases.length; i++) {
      var baseUrl = bases[i];
      var requestUrl = makeUrl(baseUrl);

      var timeoutId = null;
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var requestOptions = Object.assign({}, options || {});
      if (controller) {
        requestOptions.signal = controller.signal;
        timeoutId = window.setTimeout(function () {
          controller.abort();
        }, REQUEST_TIMEOUT_MS);
      }

      try {
        var response = await fetch(requestUrl, requestOptions);
        if (!response.ok) {
          throw new Error("HTTP " + response.status + " for " + requestUrl);
        }

        var result = expectJson ? await response.json() : null;
        routeCache[entityCacheKey(entity)] = baseUrl;
        return result;
      } catch (error) {
        var message = error && error.name === "AbortError"
          ? "Request timed out after " + REQUEST_TIMEOUT_MS + " ms"
          : (error && error.message ? error.message : String(error));
        lastError = new Error(message + " [" + requestUrl + "]");
      } finally {
        if (timeoutId !== null) window.clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error("Unable to access " + entity.name);
  }

  function getEntity(entity) {
    return requestWithRouteFallback(
      entity,
      function (baseUrl) {
        return window.location.origin + baseUrl + "?detail=all&_=" + Date.now();
      },
      { method: "GET", cache: "no-store", credentials: "same-origin" },
      true
    );
  }

  function setEntity(entity, value) {
    var action = "set";
    var parameterName = "value";
    var parameterValue = value;

    if (entity.domain === "select") {
      parameterName = "option";
      if (entity.trueValue !== undefined && entity.falseValue !== undefined) {
        parameterValue = value ? entity.trueValue : entity.falseValue;
      }
    } else if (entity.domain === "switch") {
      action = value ? "turn_on" : "turn_off";
      parameterName = null;
    }

    return requestWithRouteFallback(
      entity,
      function (baseUrl) {
        var url = window.location.origin + baseUrl + "/" + action;
        if (parameterName) {
          url += "?" + parameterName + "=" + encodeURIComponent(parameterValue);
        }
        return url;
      },
      { method: "POST", cache: "no-store", credentials: "same-origin" },
      false
    );
  }

  function pressButtonEntity(entity) {
    return requestWithRouteFallback(
      entity,
      function (baseUrl) {
        return window.location.origin + baseUrl + "/press";
      },
      { method: "POST", cache: "no-store", credentials: "same-origin" },
      false
    );
  }

  function payloadValue(payload, fallbackValue) {
    if (payload && payload.value !== undefined && payload.value !== null) {
      return payload.value;
    }
    if (payload && payload.state !== undefined && payload.state !== null) {
      return payload.state;
    }
    return fallbackValue;
  }

  function parseSwitchValue(value, fallbackValue) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;

    var normalized = String(value).trim().toUpperCase();
    if (normalized === "ENABLED" || normalized === "ON" || normalized === "TRUE" || normalized === "1") return true;
    if (normalized === "DISABLED" || normalized === "OFF" || normalized === "FALSE" || normalized === "0") return false;
    return fallbackValue;
  }

  function parseNumberValue(value, fallbackValue) {
    var parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  }

  function normalizeFriendlyName(value) {
    var name = String(value || "").replace(/\s+/g, " ").trim();
    if (name.length > 40) name = name.slice(0, 40).trim();
    return name;
  }

  function setSettingsStatus(message, kind) {
    var status = document.getElementById("device-settings-status");
    if (!status) return;
    status.textContent = message || "";
    status.className = "settings-status" + (kind ? " status-" + kind : "");
  }

  function applyRuntimeFriendlyName(name) {
    var normalized = normalizeFriendlyName(name);
    if (!normalized) return;

    runtimeFriendlyName = normalized;

    var input = document.getElementById("device-friendly-name-input");
    if (input && document.activeElement !== input) input.value = normalized;

    hideEspHomeStartedUptime(document);
  }

  async function loadFriendlyNameAtStartup() {
    try {
      var payload = await getEntity(settingsEntities.friendlyName);
      var friendly = normalizeFriendlyName(payloadValue(payload, ""));
      if (friendly) applyRuntimeFriendlyName(friendly);
    } catch (error) {
      // Keep the compiled ESPHome title when the optional runtime entity
      // is not available. Full diagnostics are shown only on Settings.
    }

    // The temperature preference belongs to this physical controller and is
    // stored in ESP32 flash. Midea/UART setpoints remain Celsius internally.
    try {
      var unitPayload = await getEntity(settingsEntities.temperatureUnit);
      applyRuntimeTemperatureUnit(payloadValue(unitPayload, "Celsius"));
    } catch (error) {
      applyRuntimeTemperatureUnit("Celsius");
    }
  }

  async function loadDeviceSettings(force) {
    if (settingsLoadInProgress) return;
    if (settingsLoadStarted && !force) return;

    settingsLoadStarted = true;
    settingsLoadInProgress = true;

    var friendlyInput = document.getElementById("device-friendly-name-input");
    var temperatureUnitSelect = document.getElementById("device-temperature-unit-select");
    var deviceNameValue = document.getElementById("device-name-value");
    var macAddressValue = document.getElementById("device-mac-address-value");
    var ipAddressValue = document.getElementById("device-ip-address-value");
    var saveButton = document.getElementById("device-friendly-name-save");
    var unitSaveButton = document.getElementById("device-temperature-unit-save");

    if (saveButton) saveButton.disabled = true;
    if (unitSaveButton) unitSaveButton.disabled = true;
    setSettingsStatus("Loading device settings...", "pending");

    var results = await Promise.allSettled([
      getEntity(settingsEntities.friendlyName),
      getEntity(settingsEntities.temperatureUnit),
      getEntity(settingsEntities.deviceName),
      getEntity(settingsEntities.macAddress),
      getEntity(settingsEntities.ipAddress)
    ]);

    if (results[0].status === "fulfilled") {
      var friendly = normalizeFriendlyName(payloadValue(results[0].value, ""));
      if (friendly) {
        if (friendlyInput) friendlyInput.value = friendly;
        applyRuntimeFriendlyName(friendly);
      }
    }

    if (results[1].status === "fulfilled") {
      var unit = normalizeTemperatureUnit(payloadValue(results[1].value, "Celsius"));
      if (temperatureUnitSelect) temperatureUnitSelect.value = unit;
      applyRuntimeTemperatureUnit(unit);
    } else {
      if (temperatureUnitSelect) temperatureUnitSelect.value = runtimeTemperatureUnit;
    }

    if (results[2].status === "fulfilled") {
      var nodeName = String(payloadValue(results[2].value, "") || "").trim();
      if (deviceNameValue) deviceNameValue.textContent = nodeName || "Unavailable";
    } else if (deviceNameValue) {
      deviceNameValue.textContent = "Unavailable";
    }

    if (results[3].status === "fulfilled") {
      var macAddress = String(payloadValue(results[3].value, "") || "").trim();
      if (macAddressValue) macAddressValue.textContent = macAddress || "Unavailable";
    } else if (macAddressValue) {
      macAddressValue.textContent = "Unavailable";
    }

    if (results[4].status === "fulfilled") {
      var ipAddress = String(payloadValue(results[4].value, "") || "").trim();
      if (ipAddressValue) ipAddressValue.textContent = ipAddress || "Unavailable";
    } else if (ipAddressValue) {
      // Useful fallback when the page itself was opened using a numeric IPv4.
      var hostFallback = String(window.location.hostname || "").trim();
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostFallback)) {
        ipAddressValue.textContent = hostFallback;
      } else {
        ipAddressValue.textContent = "Unavailable";
      }
    }

    if (results[0].status === "fulfilled" && results[1].status === "fulfilled") {
      setSettingsStatus("Settings loaded.", "ok");
      if (saveButton) saveButton.disabled = false;
      if (unitSaveButton) unitSaveButton.disabled = false;
    } else {
      var missing = [];
      if (results[0].status !== "fulfilled") missing.push("Friendly Name");
      if (results[1].status !== "fulfilled") missing.push("Temperature Unit");
      setSettingsStatus(
        missing.join(" and ") + " entity not found. Update the ESPHome YAML with the supplied controller file.",
        "error"
      );
      if (saveButton && results[0].status === "fulfilled") saveButton.disabled = false;
      if (unitSaveButton && results[1].status === "fulfilled") unitSaveButton.disabled = false;
    }

    settingsLoadInProgress = false;
  }

  async function saveDeviceFriendlyName() {
    var input = document.getElementById("device-friendly-name-input");
    var saveButton = document.getElementById("device-friendly-name-save");
    if (!input) return;

    var name = normalizeFriendlyName(input.value);
    if (!name) {
      setSettingsStatus("Friendly Name cannot be blank.", "error");
      input.focus();
      return;
    }

    input.value = name;
    if (saveButton) saveButton.disabled = true;
    setSettingsStatus("Saving Friendly Name...", "pending");

    try {
      await setEntity(settingsEntities.friendlyName, name);
      applyRuntimeFriendlyName(name);
      setSettingsStatus("Friendly Name saved.", "ok");
    } catch (error) {
      setSettingsStatus(
        "Unable to save Friendly Name: " + (error && error.message ? error.message : String(error)),
        "error"
      );
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }

  async function saveDeviceTemperatureUnit() {
    var select = document.getElementById("device-temperature-unit-select");
    var saveButton = document.getElementById("device-temperature-unit-save");
    if (!select) return;

    var unit = normalizeTemperatureUnit(select.value);
    select.value = unit;
    if (saveButton) saveButton.disabled = true;
    setSettingsStatus("Saving Temperature Unit...", "pending");

    try {
      await setEntity(settingsEntities.temperatureUnit, unit);
      applyRuntimeTemperatureUnit(unit);
      setSettingsStatus("Temperature Unit saved.", "ok");
    } catch (error) {
      setSettingsStatus(
        "Unable to save Temperature Unit: " + (error && error.message ? error.message : String(error)),
        "error"
      );
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }


  function buildDeviceSettings(settingsRoot) {
    if (!settingsRoot) return;

    settingsRoot.innerHTML = [
      "<div class='settings-body'>",
      "  <div class='settings-row'>",
      "    <div class='settings-label'>Friendly Name</div>",
      "    <div class='settings-field'>",
      "      <input id='device-friendly-name-input' class='settings-text-input' type='text' maxlength='40' autocomplete='off' spellcheck='false' placeholder='e.g. Master Bed Room'>",
      "      <button id='device-friendly-name-save' class='settings-save-btn' type='button'>Save</button>",
      "    </div>",
      "  </div>",
      "  <div class='settings-row'>",
      "    <div class='settings-label'>Temperature Unit</div>",
      "    <div class='settings-field'>",
      "      <select id='device-temperature-unit-select' class='settings-select' aria-label='Temperature Unit'>",
      "        <option value='Celsius'>Celsius (°C)</option>",
      "        <option value='Fahrenheit'>Fahrenheit (°F)</option>",
      "      </select>",
      "      <button id='device-temperature-unit-save' class='settings-save-btn' type='button'>Save</button>",
      "    </div>",
      "  </div>",
      "  <div class='settings-row'>",
      "    <div class='settings-label'>Device Name</div>",
      "    <div id='device-name-value' class='settings-value'>Loading...</div>",
      "  </div>",
      "  <div class='settings-row'>",
      "    <div class='settings-label'>MAC Address</div>",
      "    <div id='device-mac-address-value' class='settings-value'>Loading...</div>",
      "  </div>",
      "  <div class='settings-row'>",
      "    <div class='settings-label'>IP Address</div>",
      "    <div id='device-ip-address-value' class='settings-value'>Loading...</div>",
      "  </div>",
      "  <div class='settings-note'>Friendly Name and Temperature Unit are stored locally in this ESP32's flash. The Temperature Unit changes only this controller's local UI, schedules, and the multi-unit PWA display; Midea/UART setpoints and stored schedule temperatures remain Celsius internally. The physical indoor-unit display keeps its own persistent °C/°F setting.</div>",
      "  <div id='device-settings-status' class='settings-status'></div>",
      "</div>"
    ].join("");

    var input = document.getElementById("device-friendly-name-input");
    var save = document.getElementById("device-friendly-name-save");
    var unitSave = document.getElementById("device-temperature-unit-save");

    if (save) save.addEventListener("click", saveDeviceFriendlyName);
    if (unitSave) unitSave.addEventListener("click", saveDeviceTemperatureUnit);

    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          saveDeviceFriendlyName();
        }
      });
    }

    loadFriendlyNameAtStartup();
  }

  function pad2(value) {
    var text = String(value);
    return text.length < 2 ? "0" + text : text;
  }

  function parseCronString(cronString, fallbackCron) {
    var cron = String(cronString || "").trim();
    var fallback = String(fallbackCron || "0 00 00 * * *").trim();
    var parts = cron.split(/\s+/);

    if (parts.length !== 6) {
      cron = fallback;
      parts = cron.split(/\s+/);
    }

    var minute = parseInt(parts[1], 10);
    var hour = parseInt(parts[2], 10);
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) minute = 0;
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) hour = 0;

    var daySet = Object.create(null);
    var dayField = parts[5];

    if (dayField === "*") {
      for (var day = 0; day <= 6; day++) daySet[String(day)] = true;
    } else {
      var dayTokens = dayField.split(",");
      for (var i = 0; i < dayTokens.length; i++) {
        var cronDay = parseInt(dayTokens[i], 10);
        if (cronDay === 7) cronDay = 0;
        if (cronDay >= 0 && cronDay <= 6) daySet[String(cronDay)] = true;
      }
    }

    // A valid UI schedule always has at least one selected day.
    if (Object.keys(daySet).length === 0) {
      for (var fallbackDay = 0; fallbackDay <= 6; fallbackDay++) {
        daySet[String(fallbackDay)] = true;
      }
    }

    return {
      cron: cron,
      minute: pad2(minute),
      hour: pad2(hour),
      daySet: daySet
    };
  }

  function parseOptionalEndCron(cronString) {
    var cron = String(cronString || "").trim();

    if (!cron || cron.toUpperCase() === "DISABLED") {
      return {
        enabled: false,
        cron: "DISABLED",
        hour: "00",
        minute: "00"
      };
    }

    var parsed = parseCronString(cron, "0 00 00 * * *");
    return {
      enabled: true,
      cron: parsed.cron,
      hour: parsed.hour,
      minute: parsed.minute
    };
  }


  var activeMainTab = "controls";
  var runtimeFriendlyName = "";
  var runtimeTemperatureUnit = "Celsius";

  function normalizeTemperatureUnit(value) {
    var text = String(value == null ? "" : value).trim().toLowerCase();
    if (text === "fahrenheit" || text === "f" || text === "°f") return "Fahrenheit";
    return "Celsius";
  }

  function usesFahrenheitTemperatureUnit() {
    return runtimeTemperatureUnit === "Fahrenheit";
  }

  function temperatureUnitSymbol() {
    return usesFahrenheitTemperatureUnit() ? "°F" : "°C";
  }

  function celsiusToFahrenheit(value) {
    return (value * 9 / 5) + 32;
  }

  function fahrenheitToCelsius(value) {
    return (value - 32) * 5 / 9;
  }

  function formatCurrentTemperatureForUnit(value) {
    var celsius = parseFloat(value);
    if (!Number.isFinite(celsius)) {
      return usesFahrenheitTemperatureUnit() ? "-- °F" : "--.- °C";
    }
    if (usesFahrenheitTemperatureUnit()) {
      return Math.round(celsiusToFahrenheit(celsius)) + " °F";
    }
    return celsius.toFixed(1) + " °C";
  }

  function formatTargetTemperatureForUnit(value) {
    var celsius = parseFloat(value);
    if (!Number.isFinite(celsius)) return "--";
    if (usesFahrenheitTemperatureUnit()) {
      return String(Math.round(celsiusToFahrenheit(celsius)));
    }
    if (Math.abs(celsius - Math.round(celsius)) < 0.001) {
      return String(Math.round(celsius));
    }
    return celsius.toFixed(1);
  }

  function formatScheduleTemperatureForUnit(value) {
    var celsius = parseFloat(value);
    if (!Number.isFinite(celsius)) {
      return usesFahrenheitTemperatureUnit() ? "--°F" : "--.-°C";
    }
    if (usesFahrenheitTemperatureUnit()) {
      return Math.round(celsiusToFahrenheit(celsius)) + "°F";
    }
    return celsius.toFixed(1) + "°C";
  }

  function applyRuntimeTemperatureUnit(value) {
    var next = normalizeTemperatureUnit(value);
    var changed = runtimeTemperatureUnit !== next;
    runtimeTemperatureUnit = next;

    var select = document.getElementById("device-temperature-unit-select");
    if (select && select.value !== next) select.value = next;

    if (changed) {
      try {
        window.dispatchEvent(new CustomEvent("device-temperature-unit-changed", {
          detail: { unit: next }
        }));
      } catch (_) {
        window.dispatchEvent(new Event("device-temperature-unit-changed"));
      }
    }
  }

  var settingsLoadStarted = false;
  var settingsLoadInProgress = false;
  var settingsEntities = {
    friendlyName: {
      domain: "text",
      name: "Device Friendly Name",
      legacyId: "device_friendly_name"
    },
    temperatureUnit: {
      domain: "select",
      name: "Temperature Unit",
      legacyId: "device_temperature_unit"
    },
    deviceName: {
      domain: "text_sensor",
      name: "Device Name",
      legacyId: "device_name"
    },
    macAddress: {
      domain: "text_sensor",
      name: "Device MAC Address",
      legacyId: "device_mac_address"
    },
    ipAddress: {
      domain: "text_sensor",
      name: "Device IP Address",
      legacyId: "device_ip_address"
    }
  };
  var nativeControlVisibilityObservers = new WeakMap();
  var nativeVisibilityApplyTimer = null;

  function normalizedUiText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function alignNativeDeviceHeader(rootOrElement) {
    if (!rootOrElement) return false;

    var root = null;
    if (
      rootOrElement === document ||
      rootOrElement.nodeType === 9 ||
      rootOrElement.nodeType === 11
    ) {
      root = rootOrElement;
    } else if (rootOrElement.getRootNode) {
      root = rootOrElement.getRootNode();
    }

    if (!root || !root.querySelector) return false;

    var logoAnchor = root.querySelector("a#logo");
    if (!logoAnchor) return false;

    // Locate the nearest header-row ancestor that includes both the logo
    // and the device title/status region. Prefer semantic/class header nodes,
    // then fall back to the first reasonably sized ancestor row.
    var headerRow = null;
    var node = logoAnchor.parentElement;

    for (var depth = 0; node && depth < 6; depth++) {
      var tag = (node.tagName || "").toLowerCase();
      var cls = String(node.className || "").toLowerCase();

      if (
        tag === "header" ||
        cls.indexOf("header") !== -1 ||
        cls.indexOf("device") !== -1
      ) {
        headerRow = node;
        break;
      }

      var rect = node.getBoundingClientRect();
      if (
        !headerRow &&
        rect.width > 250 &&
        rect.height >= 40 &&
        rect.height <= 150
      ) {
        headerRow = node;
      }

      node = node.parentElement;
    }

    if (!headerRow) return false;

    // Save the original inline values once. This lets a resized mobile window
    // return to the native ESPHome layout rather than keeping desktop sizing.
    if (!headerRow.hasAttribute("data-custom-header-width-saved")) {
      headerRow.setAttribute(
        "data-custom-header-original-width",
        headerRow.style.getPropertyValue("width") || ""
      );
      headerRow.setAttribute(
        "data-custom-header-original-max-width",
        headerRow.style.getPropertyValue("max-width") || ""
      );
      headerRow.setAttribute(
        "data-custom-header-original-margin-left",
        headerRow.style.getPropertyValue("margin-left") || ""
      );
      headerRow.setAttribute(
        "data-custom-header-original-margin-right",
        headerRow.style.getPropertyValue("margin-right") || ""
      );
      headerRow.setAttribute(
        "data-custom-header-original-box-sizing",
        headerRow.style.getPropertyValue("box-sizing") || ""
      );
      headerRow.setAttribute("data-custom-header-width-saved", "true");
    }

    var desktop = window.matchMedia("(min-width: 521px)").matches;

    if (desktop) {
      headerRow.style.setProperty("width", "calc(100% - 20px)", "important");
      headerRow.style.setProperty("max-width", "600px", "important");
      headerRow.style.setProperty("margin-left", "auto", "important");
      headerRow.style.setProperty("margin-right", "auto", "important");
      headerRow.style.setProperty("box-sizing", "border-box", "important");
      headerRow.setAttribute("data-custom-header-width", "true");
    } else {
      function restoreProperty(propertyName, attributeName) {
        var value = headerRow.getAttribute(attributeName) || "";
        if (value) {
          headerRow.style.setProperty(propertyName, value);
        } else {
          headerRow.style.removeProperty(propertyName);
        }
      }

      restoreProperty("width", "data-custom-header-original-width");
      restoreProperty("max-width", "data-custom-header-original-max-width");
      restoreProperty("margin-left", "data-custom-header-original-margin-left");
      restoreProperty("margin-right", "data-custom-header-original-margin-right");
      restoreProperty("box-sizing", "data-custom-header-original-box-sizing");
      headerRow.removeAttribute("data-custom-header-width");
    }

    return true;
  }

  function scaleNativeDeviceTitle(rootOrElement) {
    if (!rootOrElement) return false;

    var root = null;
    if (
      rootOrElement === document ||
      rootOrElement.nodeType === 9 ||
      rootOrElement.nodeType === 11
    ) {
      root = rootOrElement;
    } else if (rootOrElement.getRootNode) {
      root = rootOrElement.getRootNode();
    }

    if (!root || !root.querySelector) return false;

    var logoAnchor = root.querySelector("a#logo");
    if (!logoAnchor) return false;

    var logoRect = logoAnchor.getBoundingClientRect();
    var scopes = [];
    var node = logoAnchor.parentElement;

    // The ESPHome device title is in the same header region as a#logo.
    // Search only a few ancestors so thermostat/scheduler text cannot be picked.
    for (var depth = 0; node && depth < 4; depth++) {
      scopes.push(node);
      node = node.parentElement;
    }

    var best = null;
    var bestScore = Infinity;

    function consider(element, preferred) {
      if (!element || element === logoAnchor || logoAnchor.contains(element)) return;

      var text = elementDirectText(element);
      if (!text && element.children && element.children.length === 0) {
        text = (element.textContent || "").replace(/\s+/g, " ").trim();
      }

      if (!text || text.length > 80) return;
      if (uptimeTextPattern.test(text)) return;

      // Exclude our own UI labels in the unlikely event the header ancestor
      // also contains injected content.
      if (/^(Controls|Schedules|Settings|Functions|Current temperature)$/i.test(text)) {
        return;
      }

      var style = window.getComputedStyle(element);
      var fontSize = parseFloat(style.fontSize);
      if (!Number.isFinite(fontSize) || fontSize < 16) return;

      var rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var logoCenterY = logoRect.top + logoRect.height / 2;
      var elementCenterY = rect.top + rect.height / 2;
      var verticalDistance = Math.abs(elementCenterY - logoCenterY);

      // Native title sits on the same header row as the logo.
      if (logoRect.width && logoRect.height && verticalDistance > 70) return;

      var horizontalDistance = Math.abs(rect.left - logoRect.right);
      var score = verticalDistance + Math.min(horizontalDistance, 300) * 0.12;
      if (preferred) score -= 35;

      if (score < bestScore) {
        best = element;
        bestScore = score;
      }
    }

    // Prefer semantic title/heading elements first.
    for (var s = 0; s < scopes.length; s++) {
      var preferred = scopes[s].querySelectorAll(
        "h1, h2, h3, [class*='title'], [class*='name']"
      );
      for (var p = 0; p < preferred.length; p++) {
        consider(preferred[p], true);
      }
    }

    // Fallback for ESPHome versions that use plain div/span elements.
    if (!best) {
      for (var f = 0; f < scopes.length; f++) {
        var candidates = scopes[f].querySelectorAll("div, span, p");
        for (var c = 0; c < candidates.length; c++) {
          consider(candidates[c], false);
        }
      }
    }

    if (!best) return false;

    // Apply the runtime-editable Friendly Name to the visible ESPHome header.
    // The ESPHome core friendly_name remains a compile-time value.
    if (runtimeFriendlyName) {
      var currentOwnText = elementDirectText(best);
      if (currentOwnText !== runtimeFriendlyName) {
        var replacedTextNode = false;
        for (var titleNodeIndex = 0; titleNodeIndex < best.childNodes.length; titleNodeIndex++) {
          var titleNode = best.childNodes[titleNodeIndex];
          if (titleNode.nodeType === Node.TEXT_NODE) {
            titleNode.textContent = runtimeFriendlyName;
            replacedTextNode = true;
            break;
          }
        }
        if (!replacedTextNode && best.children.length === 0) {
          best.textContent = runtimeFriendlyName;
        }
      }
      if (document.title !== runtimeFriendlyName) {
        document.title = runtimeFriendlyName;
      }
    }

    // If an older version already scaled this exact node, do not scale it twice.
    if (best.getAttribute("data-master-bedroom-font-scaled") === "true") {
      best.setAttribute("data-device-title-font-scaled", "true");
      return true;
    }

    var originalSize = parseFloat(
      best.getAttribute("data-device-title-original-font-size") || ""
    );

    if (!Number.isFinite(originalSize) || originalSize <= 0) {
      originalSize = parseFloat(window.getComputedStyle(best).fontSize);
      if (!Number.isFinite(originalSize) || originalSize <= 0) return false;
      best.setAttribute(
        "data-device-title-original-font-size",
        originalSize.toFixed(2)
      );
    }

    best.style.setProperty(
      "font-size",
      (originalSize * 0.60).toFixed(2) + "px",
      "important"
    );
    best.setAttribute("data-device-title-font-scaled", "true");
    return true;
  }

  function replaceNativeDeviceIcon(rootOrElement) {
    if (!rootOrElement) return false;

    var root = null;

    // Document = nodeType 9; ShadowRoot/DocumentFragment = nodeType 11.
    // For an ordinary element, use the element's containing root.
    if (
      rootOrElement === document ||
      rootOrElement.nodeType === 9 ||
      rootOrElement.nodeType === 11
    ) {
      root = rootOrElement;
    } else if (rootOrElement.getRootNode) {
      root = rootOrElement.getRootNode();
    }

    if (!root || !root.querySelector) return false;

    var logoAnchor = root.querySelector("a#logo");
    if (!logoAnchor) return false;

    var nativeLogo = logoAnchor.querySelector("esp-logo");
    if (nativeLogo) {
      nativeLogo.style.setProperty("display", "none", "important");
      nativeLogo.setAttribute("data-custom-device-icon-replaced", "true");
    }

    var image = logoAnchor.querySelector(
      "img[data-custom-device-header-icon='true']"
    );

    if (!image) {
      image = document.createElement("img");
      image.setAttribute("data-custom-device-header-icon", "true");
      image.alt = "Air conditioner";
      image.src = customDeviceIconDataUri;
      logoAnchor.appendChild(image);
    } else if (image.getAttribute("src") !== customDeviceIconDataUri) {
      image.src = customDeviceIconDataUri;
    }

    logoAnchor.style.setProperty("display", "flex", "important");
    logoAnchor.style.setProperty("align-items", "center", "important");
    logoAnchor.style.setProperty("justify-content", "center", "important");
    logoAnchor.style.setProperty("width", "52px", "important");
    logoAnchor.style.setProperty("height", "47px", "important");
    logoAnchor.style.removeProperty("background-image");

    image.style.setProperty("display", "block", "important");
    image.style.setProperty("width", "52px", "important");
    image.style.setProperty("height", "47px", "important");
    image.style.setProperty("max-width", "52px", "important");
    image.style.setProperty("max-height", "47px", "important");
    image.style.setProperty("object-fit", "contain", "important");
    image.style.setProperty("transform", "translate(15px, -15px)", "important");

    return true;
  }

  function parentAcrossShadow(node) {
    if (!node) return null;
    if (node.parentElement) return node.parentElement;

    var root = node.getRootNode ? node.getRootNode() : null;
    if (root && root.host) return root.host;
    return null;
  }

  function discoverOpenShadowRoots(root, results) {
    if (!root || !root.querySelectorAll) return;

    var elements = root.querySelectorAll("*");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].shadowRoot) {
        results.push(elements[i].shadowRoot);
        discoverOpenShadowRoots(elements[i].shadowRoot, results);
      }
    }
  }

  function candidateSensorControlContainer(headingElement) {
    var node = headingElement;

    // Walk upward across open shadow-root boundaries. We want the smallest
    // ancestor that contains the heading plus actual controls, not a page-level
    // container. Nothing is moved; only display is toggled.
    for (var depth = 0; node && depth < 9; depth++) {
      var text = normalizedUiText(node.textContent);
      var hasControls = !!(
        node.querySelector &&
        node.querySelector("button, input, select, ha-control-select, ha-control-slider, [role='button']")
      );

      if (
        depth > 0 &&
        text.indexOf("Sensor and Control") !== -1 &&
        text.length > "Sensor and Control".length + 8 &&
        hasControls
      ) {
        return node;
      }

      node = parentAcrossShadow(node);
      if (
        !node ||
        node === document.body ||
        node === document.documentElement ||
        node.id === "scheduler-root" ||
        node.id === "quick-controls-root" ||
        node.id === "settings-root"
      ) {
        break;
      }
    }

    return headingElement.parentElement || headingElement;
  }

  function findSensorControlContainers() {
    var roots = [document];
    discoverOpenShadowRoots(document, roots);

    var containers = [];
    var seen = new Set();

    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (!root.querySelectorAll) continue;

      var elements = root.querySelectorAll("*");
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var ownText = elementDirectText(element);

        if (!ownText && element.children.length === 0) {
          ownText = normalizedUiText(element.textContent);
        }

        if (ownText !== "Sensor and Control") continue;

        var container = candidateSensorControlContainer(element);
        if (container && !seen.has(container)) {
          seen.add(container);
          containers.push(container);
        }
      }
    }

    return containers;
  }

  function setElementTabVisibility(element, visible) {
    if (!element) return;

    if (!element.hasAttribute("data-main-tab-original-display")) {
      element.setAttribute(
        "data-main-tab-original-display",
        element.style.getPropertyValue("display") || ""
      );
    }

    if (visible) {
      var originalDisplay = element.getAttribute("data-main-tab-original-display") || "";
      if (originalDisplay) {
        element.style.setProperty("display", originalDisplay);
      } else {
        element.style.removeProperty("display");
      }
      element.removeAttribute("data-main-tab-hidden");
    } else {
      element.style.setProperty("display", "none", "important");
      element.setAttribute("data-main-tab-hidden", "true");
    }
  }

  function applyNativeControlVisibility() {
    nativeVisibilityApplyTimer = null;

    var showNativeControls = false;  // Replaced by the custom climate control panel.
    var containers = findSensorControlContainers();

    for (var i = 0; i < containers.length; i++) {
      setElementTabVisibility(containers[i], showNativeControls);
    }
  }

  function scheduleNativeVisibilityApply() {
    if (nativeVisibilityApplyTimer !== null) return;
    nativeVisibilityApplyTimer = window.setTimeout(applyNativeControlVisibility, 30);
  }

  function observeNativeVisibilityRoot(root) {
    if (!root || nativeControlVisibilityObservers.has(root)) return;

    var observer = new MutationObserver(function () {
      scheduleNativeVisibilityApply();

      var shadowRoots = [];
      discoverOpenShadowRoots(root, shadowRoots);
      for (var i = 0; i < shadowRoots.length; i++) {
        observeNativeVisibilityRoot(shadowRoots[i]);
      }
    });

    observer.observe(root, { childList: true, subtree: true });
    nativeControlVisibilityObservers.set(root, observer);
  }

  function setMainTab(tabName) {
    activeMainTab = tabName;

    var buttons = document.querySelectorAll(".main-tab-btn");
    for (var i = 0; i < buttons.length; i++) {
      var selected = buttons[i].getAttribute("data-main-tab") === tabName;
      buttons[i].classList.toggle("active-main-tab", selected);
      buttons[i].setAttribute("aria-selected", selected ? "true" : "false");
      buttons[i].setAttribute("tabindex", selected ? "0" : "-1");
    }

    var controlsVisible = tabName === "controls";
    var schedulesVisible = tabName === "schedules";
    var settingsVisible = tabName === "settings";

    setElementTabVisibility(document.getElementById("quick-controls-section-title"), controlsVisible);
    setElementTabVisibility(document.getElementById("quick-controls-root"), controlsVisible);

    setElementTabVisibility(document.getElementById("scheduler-section-title"), schedulesVisible);
    setElementTabVisibility(document.getElementById("scheduler-tabs"), schedulesVisible);
    setElementTabVisibility(document.getElementById("scheduler-root"), schedulesVisible);

    setElementTabVisibility(document.getElementById("settings-section-title"), settingsVisible);
    setElementTabVisibility(document.getElementById("settings-root"), settingsVisible);

    if (settingsVisible) loadDeviceSettings(true);

    scheduleNativeVisibilityApply();
  }

  function buildMainTabBar(mainContainer) {
    var existing = document.getElementById("main-tab-bar");
    if (existing) return existing;

    var tabBar = document.createElement("div");
    tabBar.id = "main-tab-bar";
    tabBar.setAttribute("role", "tablist");
    tabBar.setAttribute("aria-label", "Main sections");

    var tabs = [
      { id: "controls", label: "Controls" },
      { id: "schedules", label: "Schedules" },
      { id: "settings", label: "Settings" }
    ];

    for (var i = 0; i < tabs.length; i++) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "main-tab-btn";
      button.textContent = tabs[i].label;
      button.setAttribute("data-main-tab", tabs[i].id);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", tabs[i].id === activeMainTab ? "true" : "false");
      button.setAttribute("tabindex", tabs[i].id === activeMainTab ? "0" : "-1");

      button.addEventListener("click", function () {
        setMainTab(this.getAttribute("data-main-tab"));
      });

      button.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

        event.preventDefault();

        var allButtons = Array.prototype.slice.call(
          document.querySelectorAll(".main-tab-btn")
        );
        var currentIndex = allButtons.indexOf(this);
        var direction = event.key === "ArrowRight" ? 1 : -1;
        var nextIndex = (currentIndex + direction + allButtons.length) % allButtons.length;
        allButtons[nextIndex].focus();
        allButtons[nextIndex].click();
      });

      tabBar.appendChild(button);
    }

    // Put the tab control before the page sections, but do not move any
    // ESPHome-managed nodes.
    mainContainer.insertBefore(tabBar, mainContainer.firstChild || null);

    observeNativeVisibilityRoot(document.documentElement);

    var shadowRoots = [];
    discoverOpenShadowRoots(document, shadowRoots);
    for (var s = 0; s < shadowRoots.length; s++) {
      observeNativeVisibilityRoot(shadowRoots[s]);
    }

    return tabBar;
  }

  var customUiStarted = false;
  var customUiRetryTimer = null;
  var customUiRetryCount = 0;

  function tryStartCustomUi() {
    if (customUiStarted) return true;

    if (
      document.getElementById("main-tab-bar") ||
      document.getElementById("scheduler-root") ||
      document.getElementById("quick-controls-root")
    ) {
      customUiStarted = true;
      return true;
    }

    // Preserve the mount behavior from the known-good custom UI.
    var targetApp = document.querySelector("esphome-web-server") || document.body;
    if (!targetApp) return false;

    var mainContainer =
      targetApp.querySelector(".content") ||
      targetApp.querySelector("main") ||
      targetApp;

    if (!mainContainer) return false;

    buildMainTabBar(mainContainer);

    var quickRoot = document.createElement("div");
    quickRoot.id = "quick-controls-root";

    var sectionTitle = document.createElement("h2");
    sectionTitle.id = "scheduler-section-title";
    sectionTitle.textContent = "Scheduling";

    var tabWrapper = document.createElement("div");
    tabWrapper.className = "tab-bar-container";
    tabWrapper.id = "scheduler-tabs";

    var containerDiv = document.createElement("div");
    containerDiv.id = "scheduler-root";
    containerDiv.style.width = "calc(100% - 20px)";
    containerDiv.style.maxWidth = "600px";
    containerDiv.style.marginLeft = "auto";
    containerDiv.style.marginRight = "auto";
    containerDiv.style.boxSizing = "border-box";
    containerDiv.style.padding = "0";

    var settingsTitle = document.createElement("h2");
    settingsTitle.id = "settings-section-title";
    settingsTitle.textContent = "Settings";

    var settingsRoot = document.createElement("div");
    settingsRoot.id = "settings-root";

    mainContainer.appendChild(quickRoot);
    mainContainer.appendChild(sectionTitle);
    mainContainer.appendChild(tabWrapper);
    mainContainer.appendChild(containerDiv);
    mainContainer.appendChild(settingsTitle);
    mainContainer.appendChild(settingsRoot);

    buildQuickControls();
    buildTabsAndCards();
    buildDeviceSettings(settingsRoot);

    // Controls is the default top-level page.
    setMainTab(activeMainTab);

    customUiStarted = true;

    try {
      uiObserver.disconnect();
    } catch (error) {
      // Safe if startup finishes before an observer callback.
    }

    if (customUiRetryTimer !== null) {
      window.clearInterval(customUiRetryTimer);
      customUiRetryTimer = null;
    }

    return true;
  }

  var uiObserver = new MutationObserver(function () {
    tryStartCustomUi();
  });

  uiObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Avoid the earlier race where app.js waited only for a future mutation.
  tryStartCustomUi();

  if (!customUiStarted) {
    customUiRetryTimer = window.setInterval(function () {
      customUiRetryCount += 1;

      if (tryStartCustomUi()) return;

      if (customUiRetryCount >= 60) {
        window.clearInterval(customUiRetryTimer);
        customUiRetryTimer = null;
        console.error("Custom ESPHome interface failed to initialize.");
      }
    }, 250);
  }

  function quickControlIcon(kind) {
    if (kind === "rocket") {
      return [
        "<svg class='ac-quick-icon' viewBox='0 0 24 24' aria-hidden='true'>",
        "  <path d='M14.7 5.3c2.2-2.2 4.8-2.3 5.7-2.3.1.9 0 3.5-2.3 5.7l-4.6 4.6-4.7-.9-.9-4.7 4.6-4.6Z'></path>",
        "  <path d='m10.1 9.9-3.7-.3-3.1 3.1 4.2 1.1'></path>",
        "  <path d='m14.1 13.9.3 3.7-3.1 3.1-1.1-4.2'></path>",
        "  <circle cx='16.8' cy='7.2' r='1.4'></circle>",
        "  <path d='M7.4 16.6c-1.5.2-2.8 1.5-3 3 1.5-.2 2.8-1.5 3-3Z'></path>",
        "</svg>"
      ].join("");
    }

    return [
      "<svg class='ac-quick-icon' viewBox='0 0 24 24' aria-hidden='true'>",
      "  <circle cx='12' cy='12' r='2.1'></circle>",
      "  <path d='M12 9.9c-.2-3.8 1.3-6.1 3.6-5.6 2.2.5 2.3 3.7.7 5.7'></path>",
      "  <path d='M14 11.2c3.2-2 5.9-1.7 6.6.5.7 2.2-2 3.8-4.5 3.2'></path>",
      "  <path d='M13.2 14c2.1 3.1 1.7 5.9-.5 6.6-2.2.7-3.8-2-3.2-4.5'></path>",
      "  <path d='M10 12.8c-3.2 2-5.9 1.7-6.6-.5-.7-2.2 2-3.8 4.5-3.2'></path>",
      "</svg>"
    ].join("");
  }

  function buildQuickControls() {
    var root = document.getElementById("quick-controls-root");
    if (!root) return;

    var climateEntity = {
      domain: "climate",
      name: "AC Unit",
      legacyId: "ac_unit"
    };

    var wifiEntity = {
      domain: "sensor",
      name: "WiFi Signal dBm",
      legacyId: "wifi_signal_dbm"
    };

    var ledButtonEntity = {
      domain: "button",
      name: "Turn off LED",
      legacyId: "turn_off_led"
    };

    var displayCelsiusButtonEntity = {
      domain: "button",
      name: "Set AC Display Celsius",
      legacyId: "ac_display_celsius"
    };

    var displayFahrenheitButtonEntity = {
      domain: "button",
      name: "Set AC Display Fahrenheit",
      legacyId: "ac_display_fahrenheit"
    };

    var beeperSwitchEntity = {
      domain: "switch",
      name: "Beeper",
      legacyId: "beeper"
    };

    var fanButtons = {
      AUTO: {
        domain: "button",
        name: "AC Fan: Auto",
        legacyId: "ac_fan_auto"
      },
      LOW: {
        domain: "button",
        name: "AC Fan: Low",
        legacyId: "ac_fan_low"
      },
      MEDIUM: {
        domain: "button",
        name: "AC Fan: Medium",
        legacyId: "ac_fan_medium"
      },
      HIGH: {
        domain: "button",
        name: "AC Fan: High",
        legacyId: "ac_fan_high"
      }
    };

    var boostButtonEntity = {
      domain: "button",
      name: "AC Preset: Boost",
      legacyId: "ac_preset_boost"
    };

    var panelState = {
      climate: null,
      wifi: null,
      beeper: true,
      busy: false,
      pollTimer: null,
      refreshTimer1: null,
      refreshTimer2: null
    };

    root.innerHTML = [
      "<div class='climate-panel thermostat-panel'>",

      "  <div class='thermostat-top'>",
      "    <div class='thermostat-current-label'>Current temperature</div>",
      "    <div class='thermostat-current-value' id='climate-current-temp'>" + (usesFahrenheitTemperatureUnit() ? "-- °F" : "--.- °C") + "</div>",
      "  </div>",

      "  <div class='thermostat-dial'>",
      "    <svg class='thermostat-svg' viewBox='0 0 300 258' aria-hidden='true'>",
      "      <circle id='thermostat-arc-track' class='thermostat-arc-track' cx='150' cy='150' r='112'></circle>",
      "      <circle id='thermostat-arc-zone' class='thermostat-arc-zone' cx='150' cy='150' r='112'></circle>",
      "      <circle id='thermostat-arc-delta' class='thermostat-arc-delta' cx='150' cy='150' r='112'></circle>",
      "      <circle id='thermostat-target-marker' class='thermostat-target-marker' cx='150' cy='38' r='8'></circle>",
      "      <circle id='thermostat-current-marker' class='thermostat-current-marker' cx='150' cy='38' r='5'></circle>",
      "    </svg>",

      "    <div class='thermostat-center'>",
      "      <div class='thermostat-center-mode' id='thermostat-center-mode'>--</div>",
      "      <div class='thermostat-target-line'>",
      "        <span class='thermostat-target-value' id='climate-target-temp'>--</span>",
      "        <span class='thermostat-target-unit' id='climate-target-unit'>" + temperatureUnitSymbol() + "</span>",
      "      </div>",
      "    </div>",

      "    <div class='thermostat-step-row'>",
      "      <button type='button' class='thermostat-step-button' id='climate-temp-down' aria-label='Decrease target temperature'>−</button>",
      "      <button type='button' class='thermostat-step-button' id='climate-temp-up' aria-label='Increase target temperature'>+</button>",
      "    </div>",
      "  </div>",

      "  <input id='climate-target-slider' class='thermostat-hidden-slider' type='range' min='17' max='30' step='0.5' value='21' tabindex='-1'>",

      "  <div class='thermostat-tiles'>",
      "    <button type='button' class='thermostat-tile' id='thermostat-mode-tile' data-menu-target='thermostat-mode-menu'>",
      "      <span class='thermostat-tile-icon' id='thermostat-mode-icon'>❄</span>",
      "      <span class='thermostat-tile-text'>",
      "        <span class='thermostat-tile-label'>Mode</span>",
      "        <span class='thermostat-tile-value' id='thermostat-mode-value'>--</span>",
      "      </span>",
      "    </button>",

      "    <button type='button' class='thermostat-tile' id='thermostat-fan-tile' data-menu-target='thermostat-fan-menu'>",
      "      <span class='thermostat-tile-icon'>",
      "        <svg viewBox='0 0 24 24' aria-hidden='true'>",
      "          <circle cx='12' cy='12' r='2'></circle>",
      "          <path d='M12 10c-.2-3.8 1.3-6.1 3.6-5.6 2.2.5 2.3 3.7.7 5.7'></path>",
      "          <path d='M14 11.2c3.2-2 5.9-1.7 6.6.5.7 2.2-2 3.8-4.5 3.2'></path>",
      "          <path d='M13.2 14c2.1 3.1 1.7 5.9-.5 6.6-2.2.7-3.8-2-3.2-4.5'></path>",
      "          <path d='M10 12.8c-3.2 2-5.9 1.7-6.6-.5-.7-2.2 2-3.8 4.5-3.2'></path>",
      "        </svg>",
      "      </span>",
      "      <span class='thermostat-tile-text'>",
      "        <span class='thermostat-tile-label'>Fan mode</span>",
      "        <span class='thermostat-tile-value' id='thermostat-fan-value'>--</span>",
      "      </span>",
      "    </button>",

      "    <button type='button' class='thermostat-tile' id='thermostat-swing-tile' data-menu-target='thermostat-swing-menu'>",
      "      <span class='thermostat-tile-icon'>↕</span>",
      "      <span class='thermostat-tile-text'>",
      "        <span class='thermostat-tile-label'>Swing mode</span>",
      "        <span class='thermostat-tile-value' id='thermostat-swing-value'>--</span>",
      "      </span>",
      "    </button>",
      "  </div>",

      "  <div class='thermostat-menu-area'>",
      "    <div class='thermostat-menu' id='thermostat-mode-menu'>",
      "      <button type='button' class='climate-choice' data-climate-mode='OFF'>Off</button>",
      "      <button type='button' class='climate-choice' data-climate-mode='COOL'>Cool</button>",
      "      <button type='button' class='climate-choice' data-climate-mode='HEAT'>Heat</button>",
      "      <button type='button' class='climate-choice' data-climate-mode='DRY'>Dry</button>",
      "      <button type='button' class='climate-choice' data-climate-mode='HEAT_COOL'>Auto</button>",
      "      <button type='button' class='climate-choice' data-climate-mode='FAN_ONLY'>Fan</button>",
      "    </div>",

      "    <div class='thermostat-menu' id='thermostat-fan-menu'>",
      "      <button type='button' class='climate-choice' data-climate-fan='AUTO'>Auto</button>",
      "      <button type='button' class='climate-choice' data-climate-fan='LOW'>Low</button>",
      "      <button type='button' class='climate-choice' data-climate-fan='MEDIUM'>Medium</button>",
      "      <button type='button' class='climate-choice' data-climate-fan='HIGH'>High</button>",
      "      <button type='button' class='climate-choice' data-climate-preset='BOOST'>Boost</button>",
      "    </div>",

      "    <div class='thermostat-menu' id='thermostat-swing-menu'>",
      "      <button type='button' class='climate-choice' data-climate-swing='OFF'>Off</button>",
      "      <button type='button' class='climate-choice' data-climate-swing='VERTICAL'>Vertical</button>",
      "      <button type='button' class='climate-choice' data-climate-swing='HORIZONTAL'>Horizontal</button>",
      "      <button type='button' class='climate-choice' data-climate-swing='BOTH'>Both</button>",
      "    </div>",
      "  </div>",

      "  <div class='climate-control-group'>",
      "    <div class='climate-control-label'>Functions</div>",
      "    <div class='climate-action-row'>",
      "      <button type='button' class='climate-action-button climate-icon-button climate-icon-button-pair' id='climate-led-toggle' title='Toggle Display' aria-label='Toggle Display'><span class='climate-icon-pair'><svg class='ui-action-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='M11,0V4H13V0H11M18.3,2.29L15.24,5.29L16.64,6.71L19.7,3.71L18.3,2.29M5.71,2.29L4.29,3.71L7.29,6.71L8.71,5.29L5.71,2.29M12,6A4,4 0 0,0 8,10V16H6V18H9V23H11V18H13V23H15V18H18V16H16V10A4,4 0 0,0 12,6M2,9V11H6V9H2M18,9V11H22V9H18Z'/></svg><svg class='ui-action-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='M12,6A4,4 0 0,0 8,10V16H6V18H9V23H11V18H13V23H15V18H18V16H16V10A4,4 0 0,0 12,6Z'/></svg></span></button>",
      "      <button type='button' class='climate-action-button climate-icon-button' id='climate-display-celsius' title='Set Display Degree Celsius' aria-label='Set Display Degree Celsius'><svg class='ui-action-icon' viewBox='0 0 32 32' aria-hidden='true' focusable='false'><path fill='currentColor' d='M30 18h-6a2.002 2.002 0 0 1-2-2V6a2.002 2.002 0 0 1 2-2h6v2h-6v10h6Z'/><circle fill='currentColor' cx='18' cy='4' r='2'/><path fill='currentColor' d='M10 20.184V12H8v8.184a3 3 0 1 0 2 0Z'/><path fill='currentColor' d='M9 30a6.993 6.993 0 0 1-5-11.889V7A5 5 0 0 1 14 7v11.111A6.993 6.993 0 0 1 9 30Zm0-26a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3Z'/></svg></button>",
      "      <button type='button' class='climate-action-button climate-icon-button' id='climate-display-fahrenheit' title='Set Display Degree Fahrenheit' aria-label='Set Display Degree Fahrenheit'><svg class='ui-action-icon' viewBox='0 0 32 32' aria-hidden='true' focusable='false'><path fill='currentColor' d='M30 6V4h-8v14h2v-6h5v-2h-5V6Z'/><circle fill='currentColor' cx='18' cy='4' r='2'/><path fill='currentColor' d='M10 20.184V12H8v8.184a3 3 0 1 0 2 0Z'/><path fill='currentColor' d='M9 30a6.993 6.993 0 0 1-5-11.889V7A5 5 0 0 1 14 7v11.111A6.993 6.993 0 0 1 9 30Zm0-26a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3Z'/></svg></button>",
      "      <button type='button' class='climate-action-button climate-icon-button climate-beeper-button' id='climate-beeper-toggle' data-beeper-state='on' aria-pressed='true' title='Beeper: On — click to turn off' aria-label='Beeper On; click to turn off'>"
      + "<svg class='ui-action-icon beeper-icon-on' viewBox='0 0 32 32' aria-hidden='true' focusable='false' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>"
      + "<circle cx='16' cy='16' r='13'/><path d='M8.5 13h4l5-4v14l-5-4h-4z'/><path d='M20.1 13.1c1.55 1.65 1.55 4.15 0 5.8'/><path d='M22.8 10.5c3 3.15 3 7.85 0 11'/></svg>"
      + "<svg class='ui-action-icon beeper-icon-off' viewBox='0 0 32 32' aria-hidden='true' focusable='false' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>"
      + "<circle cx='16' cy='16' r='13'/><path d='M8.5 13h4l5-4v14l-5-4h-4z'/><path d='M20.1 13.1c1.55 1.65 1.55 4.15 0 5.8'/><path d='M22.8 10.5c3 3.15 3 7.85 0 11'/><path d='M6.7 6.7L25.3 25.3' stroke-width='2.2'/></svg>"
      + "</button>",
      "      <button type='button' class='climate-action-button climate-icon-button' id='climate-refresh' title='Refresh' aria-label='Refresh'><svg class='ui-action-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14A9.95 9.95 0 0 0 12 2v2c1.08 0 2.13.21 3.11.63.95.4 1.81.98 2.54 1.71s1.31 1.59 1.72 2.54c.42.99.63 2.03.63 3.11s-.21 2.13-.63 3.11c-.4.95-.98 1.81-1.72 2.54-.17.17-.34.32-.52.48L15 15.99v6h6l-2.45-2.45c.18-.15.36-.31.52-.48.92-.92 1.64-1.99 2.14-3.18.52-1.23.79-2.54.79-3.89s-.26-2.66-.79-3.89a9.9 9.9 0 0 0-2.14-3.18ZM4.93 19.07c.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79v-2a7.9 7.9 0 0 1-3.11-.63c-.95-.4-1.81-.98-2.54-1.71s-1.31-1.59-1.72-2.54c-.42-.99-.63-2.03-.63-3.11s.21-2.13.63-3.11c.4-.95.98-1.81 1.72-2.54.17-.17.34-.32.52-.48L9 8.01V2H3l2.45 2.45c-.18.15-.36.31-.52.48-.92.92-1.64 1.99-2.14 3.18C2.27 9.34 2 10.65 2 12s.26 2.66.79 3.89c.5 1.19 1.22 2.26 2.14 3.18Z'/></svg></button>",
      "    </div>",
      "  </div>",

      "  <div class='climate-footer'>",
      "    <div class='climate-status' id='climate-control-status' aria-live='polite'>Loading AC state…</div>",
      "    <div class='climate-wifi' id='climate-wifi'>WiFi: -- dBm</div>",
      "  </div>",

      "</div>"
    ].join("");

    var currentTempEl = document.getElementById("climate-current-temp");
    var targetTempEl = document.getElementById("climate-target-temp");
    var targetUnitEl = document.getElementById("climate-target-unit");
    var modeCenterEl = document.getElementById("thermostat-center-mode");
    var modeValueEl = document.getElementById("thermostat-mode-value");
    var fanValueEl = document.getElementById("thermostat-fan-value");
    var swingValueEl = document.getElementById("thermostat-swing-value");
    var modeIconEl = document.getElementById("thermostat-mode-icon");

    var arcTrackEl = document.getElementById("thermostat-arc-track");
    var arcZoneEl = document.getElementById("thermostat-arc-zone");
    var arcDeltaEl = document.getElementById("thermostat-arc-delta");
    var targetMarkerEl = document.getElementById("thermostat-target-marker");
    var currentMarkerEl = document.getElementById("thermostat-current-marker");

    var slider = document.getElementById("climate-target-slider");
    var tempDown = document.getElementById("climate-temp-down");
    var tempUp = document.getElementById("climate-temp-up");
    var statusEl = document.getElementById("climate-control-status");
    var wifiEl = document.getElementById("climate-wifi");
    var ledButton = document.getElementById("climate-led-toggle");
    var displayCelsiusButton = document.getElementById("climate-display-celsius");
    var displayFahrenheitButton = document.getElementById("climate-display-fahrenheit");
    var beeperButton = document.getElementById("climate-beeper-toggle");
    var refreshButton = document.getElementById("climate-refresh");

    var modeTile = document.getElementById("thermostat-mode-tile");
    var fanTile = document.getElementById("thermostat-fan-tile");
    var swingTile = document.getElementById("thermostat-swing-tile");

    var ARC_RADIUS = 112;
    var ARC_CENTER_X = 150;
    var ARC_CENTER_Y = 150;
    var ARC_START_DEGREES = 135;
    var ARC_SWEEP_DEGREES = 270;
    var ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;
    var ARC_LENGTH = ARC_CIRCUMFERENCE * (ARC_SWEEP_DEGREES / 360);

    arcTrackEl.style.strokeDasharray =
      ARC_LENGTH + " " + (ARC_CIRCUMFERENCE - ARC_LENGTH);

    function normalizedUpper(value) {
      return String(value === undefined || value === null ? "" : value)
        .trim()
        .toUpperCase();
    }

    function humanizeClimateValue(value) {
      var text = normalizedUpper(value);
      if (!text) return "--";

      var map = {
        OFF: "Off",
        IDLE: "Idle",
        COOLING: "Cooling",
        HEATING: "Heating",
        DRYING: "Drying",
        FAN: "Fan",
        FAN_ONLY: "Fan",
        HEAT_COOL: "Auto",
        AUTO: "Auto",
        DEFROSTING: "Defrost",
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
        QUIET: "Quiet",
        BOOST: "Boost",
        VERTICAL: "Vertical",
        HORIZONTAL: "Horizontal",
        BOTH: "Both",
        NONE: "None"
      };

      if (map[text]) return map[text];

      return text
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function modeIcon(mode) {
      switch (normalizedUpper(mode)) {
        case "COOL": return "❄";
        case "HEAT": return "☀";
        case "DRY": return "◌";
        case "FAN_ONLY": return "≋";
        case "HEAT_COOL": return "A";
        case "AUTO": return "A";
        case "OFF": return "⏻";
        default: return "●";
      }
    }

    function formatCurrentTemperature(value) {
      return formatCurrentTemperatureForUnit(value);
    }

    function formatTargetTemperature(value) {
      return formatTargetTemperatureForUnit(value);
    }

    function setControlStatus(message, kind) {
      if (!statusEl) return;

      statusEl.textContent = message;
      statusEl.classList.remove("status-ok", "status-pending", "status-error");
      if (kind) statusEl.classList.add("status-" + kind);
    }

    function closeThermostatMenus(exceptId) {
      var menus = root.querySelectorAll(".thermostat-menu");
      var tiles = root.querySelectorAll(".thermostat-tile");

      for (var i = 0; i < menus.length; i++) {
        if (menus[i].id !== exceptId) menus[i].classList.remove("open");
      }

      for (var t = 0; t < tiles.length; t++) {
        var target = tiles[t].getAttribute("data-menu-target");
        if (target !== exceptId) tiles[t].classList.remove("menu-open");
      }
    }

    function toggleThermostatMenu(tile) {
      if (!tile || tile.disabled) return;

      var targetId = tile.getAttribute("data-menu-target");
      var menu = document.getElementById(targetId);
      if (!menu) return;

      var willOpen = !menu.classList.contains("open");
      closeThermostatMenus(willOpen ? targetId : null);

      menu.classList.toggle("open", willOpen);
      tile.classList.toggle("menu-open", willOpen);
    }

    modeTile.addEventListener("click", function () {
      toggleThermostatMenu(modeTile);
    });

    fanTile.addEventListener("click", function () {
      toggleThermostatMenu(fanTile);
    });

    swingTile.addEventListener("click", function () {
      toggleThermostatMenu(swingTile);
    });

    function setBusy(busy) {
      panelState.busy = busy;

      var interactive = root.querySelectorAll(
        ".thermostat-step-button, .thermostat-tile, .climate-choice, .climate-action-button"
      );

      for (var i = 0; i < interactive.length; i++) {
        if (busy) {
          interactive[i].setAttribute("data-command-disabled", "true");
          interactive[i].disabled = true;
        } else {
          interactive[i].removeAttribute("data-command-disabled");
          interactive[i].disabled = false;
        }
      }

      if (!busy && panelState.climate) {
        applyCapabilities(panelState.climate);
      }
    }

    function setClimateCommand(parameters) {
      return requestWithRouteFallback(
        climateEntity,
        function (baseUrl) {
          var pairs = [];
          Object.keys(parameters).forEach(function (key) {
            if (parameters[key] === undefined || parameters[key] === null) return;
            pairs.push(
              encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
            );
          });

          return window.location.origin + baseUrl + "/set" +
            (pairs.length ? "?" + pairs.join("&") : "");
        },
        { method: "POST", cache: "no-store", credentials: "same-origin" },
        false
      );
    }

    function scheduleStateRefresh() {
      if (panelState.refreshTimer1 !== null) {
        window.clearTimeout(panelState.refreshTimer1);
      }
      if (panelState.refreshTimer2 !== null) {
        window.clearTimeout(panelState.refreshTimer2);
      }

      panelState.refreshTimer1 = window.setTimeout(function () {
        refreshClimateState(false);
      }, 700);

      panelState.refreshTimer2 = window.setTimeout(function () {
        refreshClimateState(false);
      }, 2000);
    }

    function capabilitySet(values) {
      var result = Object.create(null);
      if (!Array.isArray(values)) return result;

      for (var i = 0; i < values.length; i++) {
        result[normalizedUpper(values[i])] = true;
      }

      return result;
    }

    function applyCapabilities(climate) {
      var modes = capabilitySet(climate.modes);
      var fanModes = capabilitySet(climate.fan_modes);
      var swingModes = capabilitySet(climate.swing_modes);
      var presets = capabilitySet(climate.presets);

      var modeButtons = root.querySelectorAll("[data-climate-mode]");
      for (var i = 0; i < modeButtons.length; i++) {
        var mode = modeButtons[i].getAttribute("data-climate-mode");
        modeButtons[i].disabled =
          panelState.busy ||
          (mode !== "OFF" && Object.keys(modes).length > 0 && !modes[mode]);
      }

      var fanChoices = root.querySelectorAll("[data-climate-fan]");
      for (var f = 0; f < fanChoices.length; f++) {
        var fan = fanChoices[f].getAttribute("data-climate-fan");
        fanChoices[f].disabled =
          panelState.busy ||
          (Object.keys(fanModes).length > 0 && !fanModes[fan]);
      }

      var boost = root.querySelector("[data-climate-preset='BOOST']");
      if (boost) {
        boost.disabled = panelState.busy;
        if (Object.keys(presets).length > 0 && !presets.BOOST) {
          boost.title =
            "Boost is controlled through the existing ESPHome template button.";
        } else {
          boost.removeAttribute("title");
        }
      }

      var swingChoices = root.querySelectorAll("[data-climate-swing]");
      var hasSwingMetadata = Object.keys(swingModes).length > 0;

      for (var s = 0; s < swingChoices.length; s++) {
        var swing = swingChoices[s].getAttribute("data-climate-swing");
        swingChoices[s].disabled =
          panelState.busy ||
          (hasSwingMetadata && !swingModes[swing]);
      }

      tempDown.disabled = panelState.busy;
      tempUp.disabled = panelState.busy;
      ledButton.disabled = panelState.busy;
      refreshButton.disabled = panelState.busy;
      modeTile.disabled = panelState.busy;
      fanTile.disabled = panelState.busy;
      swingTile.disabled = panelState.busy;
    }

    function updateActiveButtons(climate) {
      var currentMode = normalizedUpper(climate.mode);
      var currentFan = normalizedUpper(climate.fan_mode);
      var currentSwing = normalizedUpper(climate.swing_mode);
      var currentPreset = normalizedUpper(climate.preset);

      var modeButtons = root.querySelectorAll("[data-climate-mode]");
      for (var i = 0; i < modeButtons.length; i++) {
        modeButtons[i].classList.toggle(
          "active",
          modeButtons[i].getAttribute("data-climate-mode") === currentMode
        );
      }

      var fanButtonsEls = root.querySelectorAll("[data-climate-fan]");
      for (var f = 0; f < fanButtonsEls.length; f++) {
        fanButtonsEls[f].classList.toggle(
          "active",
          currentPreset !== "BOOST" &&
          fanButtonsEls[f].getAttribute("data-climate-fan") === currentFan
        );
      }

      var boost = root.querySelector("[data-climate-preset='BOOST']");
      if (boost) {
        boost.classList.toggle("active", currentPreset === "BOOST");
      }

      var swingButtons = root.querySelectorAll("[data-climate-swing]");
      for (var s = 0; s < swingButtons.length; s++) {
        swingButtons[s].classList.toggle(
          "active",
          swingButtons[s].getAttribute("data-climate-swing") === currentSwing
        );
      }

      modeCenterEl.textContent = humanizeClimateValue(currentMode);
      modeValueEl.textContent = humanizeClimateValue(currentMode);
      fanValueEl.textContent =
        currentPreset === "BOOST"
          ? "Boost"
          : humanizeClimateValue(currentFan);
      swingValueEl.textContent = humanizeClimateValue(currentSwing);
      modeIconEl.textContent = modeIcon(currentMode);
    }

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function temperatureFraction(value, minTemp, maxTemp) {
      var number = parseFloat(value);
      if (!Number.isFinite(number)) return NaN;
      if (!Number.isFinite(minTemp) || !Number.isFinite(maxTemp) || maxTemp <= minTemp) {
        return NaN;
      }
      return clamp01((number - minTemp) / (maxTemp - minTemp));
    }

    function setArcSegment(element, startFraction, endFraction) {
      if (!Number.isFinite(startFraction) || !Number.isFinite(endFraction)) {
        element.style.display = "none";
        return;
      }

      var start = clamp01(Math.min(startFraction, endFraction));
      var end = clamp01(Math.max(startFraction, endFraction));
      var length = Math.max(0, (end - start) * ARC_LENGTH);

      if (length < 0.5) {
        element.style.display = "none";
        return;
      }

      element.style.display = "";
      element.style.strokeDasharray =
        length + " " + (ARC_CIRCUMFERENCE - length);
      element.style.strokeDashoffset = String(-start * ARC_LENGTH);
    }

    function placeArcMarker(element, fraction) {
      if (!Number.isFinite(fraction)) {
        element.style.display = "none";
        return;
      }

      var angle =
        (ARC_START_DEGREES + clamp01(fraction) * ARC_SWEEP_DEGREES) *
        Math.PI / 180;

      var x = ARC_CENTER_X + ARC_RADIUS * Math.cos(angle);
      var y = ARC_CENTER_Y + ARC_RADIUS * Math.sin(angle);

      element.setAttribute("cx", x.toFixed(2));
      element.setAttribute("cy", y.toFixed(2));
      element.style.display = "";
    }

    function updateThermostatArc(climate) {
      var minTemp = parseFloat(climate.min_temp);
      var maxTemp = parseFloat(climate.max_temp);

      if (!Number.isFinite(minTemp)) minTemp = parseFloat(slider.min);
      if (!Number.isFinite(maxTemp)) maxTemp = parseFloat(slider.max);

      var targetFraction =
        temperatureFraction(climate.target_temperature, minTemp, maxTemp);
      var currentFraction =
        temperatureFraction(climate.current_temperature, minTemp, maxTemp);

      // Light section from the target toward the upper end of the range,
      // matching the visual language in the supplied thermostat reference.
      setArcSegment(arcZoneEl, targetFraction, 1);

      // Dark section shows the distance between current and target temperature.
      setArcSegment(arcDeltaEl, targetFraction, currentFraction);

      placeArcMarker(targetMarkerEl, targetFraction);
      placeArcMarker(currentMarkerEl, currentFraction);

      var mode = normalizedUpper(climate.mode);
      arcZoneEl.style.opacity = mode === "OFF" ? ".16" : ".32";
      arcDeltaEl.style.opacity = mode === "OFF" ? ".38" : ".95";
    }

    function renderBeeperState(payload) {
      var enabled = parseSwitchValue(
        payloadValue(payload, panelState.beeper),
        panelState.beeper
      );

      panelState.beeper = enabled;
      beeperButton.setAttribute("data-beeper-state", enabled ? "on" : "off");
      beeperButton.setAttribute("aria-pressed", enabled ? "true" : "false");

      if (enabled) {
        beeperButton.title = "Beeper: On — click to turn off";
        beeperButton.setAttribute("aria-label", "Beeper On; click to turn off");
      } else {
        beeperButton.title = "Beeper: Off — click to turn on";
        beeperButton.setAttribute("aria-label", "Beeper Off; click to turn on");
      }
    }

    function renderClimateState(climate) {
      panelState.climate = climate;

      currentTempEl.textContent =
        formatCurrentTemperature(climate.current_temperature);
      targetTempEl.textContent =
        formatTargetTemperature(climate.target_temperature);
      if (targetUnitEl) targetUnitEl.textContent = temperatureUnitSymbol();

      var minTemp = parseFloat(climate.min_temp);
      var maxTemp = parseFloat(climate.max_temp);
      var step = parseFloat(climate.step);
      var target = parseFloat(climate.target_temperature);

      if (Number.isFinite(minTemp)) slider.min = String(minTemp);
      if (Number.isFinite(maxTemp)) slider.max = String(maxTemp);
      if (Number.isFinite(step) && step > 0) slider.step = String(step);
      if (Number.isFinite(target)) slider.value = String(target);

      updateActiveButtons(climate);
      updateThermostatArc(climate);
      applyCapabilities(climate);
    }

    async function refreshClimateState(showStatus) {
      if (showStatus) {
        setControlStatus("Refreshing AC state…", "pending");
      }

      try {
        var climate = await getEntity(climateEntity);
        renderClimateState(climate);

        try {
          var wifi = await getEntity(wifiEntity);
          panelState.wifi = wifi;

          var wifiValue = parseFloat(payloadValue(wifi, NaN));
          wifiEl.textContent = Number.isFinite(wifiValue)
            ? "WiFi: " + Math.round(wifiValue) + " dBm"
            : "WiFi: -- dBm";
        } catch (wifiError) {
          wifiEl.textContent = "WiFi: -- dBm";
        }

        try {
          var beeper = await getEntity(beeperSwitchEntity);
          renderBeeperState(beeper);
        } catch (beeperError) {
          // Keep the most recently known/default state if the switch endpoint
          // is temporarily unavailable. Climate control remains usable.
          console.warn("Unable to read Beeper switch state:", beeperError);
        }

        if (showStatus) {
          setControlStatus("AC state updated.", "ok");
        } else if (!panelState.busy) {
          setControlStatus("Connected.", "ok");
        }
      } catch (error) {
        console.error("Climate state refresh failed:", error);
        setControlStatus(
          "Unable to read AC state: " +
          (error && error.message ? error.message : String(error)),
          "error"
        );
      }
    }

    async function runClimateCommand(message, action) {
      if (panelState.busy) return;

      setBusy(true);
      setControlStatus(message, "pending");

      try {
        await action();
        closeThermostatMenus(null);
        setControlStatus("Command sent.", "ok");
        scheduleStateRefresh();
      } catch (error) {
        console.error("Climate control command failed:", error);
        setControlStatus(
          "Command failed: " +
          (error && error.message ? error.message : String(error)),
          "error"
        );
      } finally {
        setBusy(false);
      }
    }

    var modeButtons = root.querySelectorAll("[data-climate-mode]");
    for (var i = 0; i < modeButtons.length; i++) {
      modeButtons[i].addEventListener("click", function () {
        var mode = this.getAttribute("data-climate-mode");

        runClimateCommand(
          "Setting mode to " + humanizeClimateValue(mode) + "…",
          function () {
            return setClimateCommand({ mode: mode });
          }
        );
      });
    }

    var fanChoices = root.querySelectorAll("[data-climate-fan]");
    for (var f = 0; f < fanChoices.length; f++) {
      fanChoices[f].addEventListener("click", function () {
        var fan = this.getAttribute("data-climate-fan");
        var entity = fanButtons[fan];
        if (!entity) return;

        runClimateCommand(
          "Setting fan to " + humanizeClimateValue(fan) + "…",
          function () {
            return pressButtonEntity(entity);
          }
        );
      });
    }

    var boostButton = root.querySelector("[data-climate-preset='BOOST']");
    if (boostButton) {
      boostButton.addEventListener("click", function () {
        runClimateCommand(
          "Toggling Boost…",
          function () {
            return pressButtonEntity(boostButtonEntity);
          }
        );
      });
    }

    var swingButtons = root.querySelectorAll("[data-climate-swing]");
    for (var s = 0; s < swingButtons.length; s++) {
      swingButtons[s].addEventListener("click", function () {
        var swing = this.getAttribute("data-climate-swing");

        runClimateCommand(
          "Setting swing to " + humanizeClimateValue(swing) + "…",
          function () {
            return setClimateCommand({ swing_mode: swing });
          }
        );
      });
    }

    function roundedTargetTemperature(value) {
      var min = parseFloat(slider.min);
      var max = parseFloat(slider.max);
      var step = parseFloat(slider.step);

      if (!Number.isFinite(step) || step <= 0) step = 0.5;

      var next = parseFloat(value);
      if (!Number.isFinite(next)) next = 21;

      next = Math.round(next / step) * step;

      if (Number.isFinite(min)) next = Math.max(min, next);
      if (Number.isFinite(max)) next = Math.min(max, next);

      return Math.round(next * 10) / 10;
    }

    function previewTargetTemperature(target) {
      targetTempEl.textContent = formatTargetTemperature(target);

      if (!panelState.climate) return;

      var preview = Object.assign({}, panelState.climate, {
        target_temperature: target
      });
      updateThermostatArc(preview);
    }

    function sendTargetTemperature(value) {
      var target = roundedTargetTemperature(value);
      slider.value = String(target);
      previewTargetTemperature(target);

      runClimateCommand(
        "Setting target temperature to " +
          formatTargetTemperature(target) + " " + temperatureUnitSymbol() + "…",
        function () {
          return setClimateCommand({ target_temperature: target });
        }
      );
    }

    function steppedTargetTemperature(direction) {
      var currentCelsius = parseFloat(slider.value);
      if (!Number.isFinite(currentCelsius)) currentCelsius = 21;

      if (usesFahrenheitTemperatureUnit()) {
        // The user steps in whole °F. Convert the requested display value
        // back to Celsius; sendTargetTemperature then snaps it to the Midea
        // climate entity's valid 0.5 °C increment.
        var currentFahrenheit = Math.round(celsiusToFahrenheit(currentCelsius));
        return fahrenheitToCelsius(currentFahrenheit + direction);
      }

      var step = parseFloat(slider.step);
      if (!Number.isFinite(step) || step <= 0) step = 0.5;
      return currentCelsius + direction * step;
    }

    tempDown.addEventListener("click", function () {
      sendTargetTemperature(steppedTargetTemperature(-1));
    });

    tempUp.addEventListener("click", function () {
      sendTargetTemperature(steppedTargetTemperature(1));
    });

    window.addEventListener("device-temperature-unit-changed", function () {
      if (panelState.climate) {
        renderClimateState(panelState.climate);
      } else {
        currentTempEl.textContent = usesFahrenheitTemperatureUnit() ? "-- °F" : "--.- °C";
        targetTempEl.textContent = "--";
        if (targetUnitEl) targetUnitEl.textContent = temperatureUnitSymbol();
      }
    });

    ledButton.addEventListener("click", function () {
      runClimateCommand(
        "Sending LED display toggle…",
        function () {
          return pressButtonEntity(ledButtonEntity);
        }
      );
    });

    displayCelsiusButton.addEventListener("click", function () {
      runClimateCommand(
        "Sending UART display-unit command: Celsius…",
        function () {
          return pressButtonEntity(displayCelsiusButtonEntity);
        }
      );
    });

    displayFahrenheitButton.addEventListener("click", function () {
      runClimateCommand(
        "Sending UART display-unit command: Fahrenheit…",
        function () {
          return pressButtonEntity(displayFahrenheitButtonEntity);
        }
      );
    });

    beeperButton.addEventListener("click", function () {
      var nextState = !panelState.beeper;

      runClimateCommand(
        nextState
          ? "Turning beeper feedback on…"
          : "Turning beeper feedback off…",
        async function () {
          await setEntity(beeperSwitchEntity, nextState);

          // The template switch is optimistic, so reflect the new state
          // immediately. The scheduled state refresh verifies it afterwards.
          renderBeeperState({ value: nextState });
        }
      );
    });

    refreshButton.addEventListener("click", function () {
      refreshClimateState(true);
    });

    // Initial load.
    refreshClimateState(true);

    // Keep the Controls tab current without polling another top-level tab.
    panelState.pollTimer = window.setInterval(function () {
      if (activeMainTab === "controls" && !panelState.busy) {
        refreshClimateState(false);
      }
    }, 5000);
  }

  function buildTabsAndCards() {
    var tabContainer = document.getElementById("scheduler-tabs");
    var contentContainer = document.getElementById("scheduler-root");
    if (!tabContainer || !contentContainer) return;

    var controllers = [];

    for (var slotIndex = 1; slotIndex <= SLOT_COUNT; slotIndex++) {
      var tabBtn = document.createElement("button");
      tabBtn.className = "sched-tab-btn";
      tabBtn.textContent = String(slotIndex);
      tabBtn.setAttribute("data-target-slot", String(slotIndex));
      tabBtn.title = "Schedule " + slotIndex;
      tabBtn.setAttribute("aria-label", "Open Schedule " + slotIndex);
      if (slotIndex === 1) tabBtn.classList.add("active-tab");

      tabBtn.addEventListener("click", function (event) {
        var clickedBtn = event.currentTarget;
        var targetId = clickedBtn.getAttribute("data-target-slot");
        var allTabs = document.querySelectorAll(".sched-tab-btn");
        var allCards = document.querySelectorAll(".esphome-card");

        for (var tabIndex = 0; tabIndex < allTabs.length; tabIndex++) {
          allTabs[tabIndex].classList.remove("active-tab");
        }
        for (var cardIndex = 0; cardIndex < allCards.length; cardIndex++) {
          allCards[cardIndex].classList.remove("tab-active");
        }

        clickedBtn.classList.add("active-tab");
        var targetCard = document.getElementById("slot-card-" + targetId);
        if (targetCard) targetCard.classList.add("tab-active");

        // Load a schedule only when its tab is opened. This prevents the
        // ESP32-C3 web server from receiving 50 REST reads during startup.
        var controllerIndex = parseInt(targetId, 10) - 1;
        if (controllerIndex >= 0 && controllers[controllerIndex]) {
          controllers[controllerIndex].load();
        }
      });

      tabContainer.appendChild(tabBtn);

      var defaultState = defaultSlotState(slotIndex);
      var card = document.createElement("div");
      card.className = "esphome-card";
      card.id = "slot-card-" + slotIndex;
      if (slotIndex === 1) card.classList.add("tab-active");

      card.innerHTML = buildCardHtml(slotIndex, defaultState);
      contentContainer.appendChild(card);
      controllers.push(initCardLogic(card, slotIndex, defaultState));
    }

    // Load only the initially visible schedule. Remaining schedules load
    // on demand when their tab is selected.
    if (controllers.length > 0) {
      controllers[0].load();
    }
  }

  function buildCardHtml(slotIndex, defaultState) {
    var html = "";
    html += "<div class='card-header-container'>";
    html += "  <input type='text' class='schedule-name-input' maxlength='25' value='" + defaultState.name + "' placeholder='Schedule " + slotIndex + "' aria-label='Schedule " + slotIndex + " name'>";
    html += "  <div class='switch-container'>";
    html += "    <span class='status-label'>" + (defaultState.enabled ? "Enabled" : "Disabled") + "</span>";
    html += "    <label class='toggle-switch'><input type='checkbox' class='esphome-enable-toggle'" + (defaultState.enabled ? " checked" : "") + "><span class='slider'></span></label>";
    html += "  </div>";
    html += "</div>";
    html += "<div class='card-body-content'>";
	
	html += "  <div class='form-row dual-control-row'>";
	html += "    <div class='schedule-control-group'>";
	html += "      <label>Climate Mode:</label>";
	html += "      <select class='esphome-mode-select'>";
	html += "        <option value='FAN'>Fan</option>";
	html += "        <option value='DRY'>Dry</option>";
	html += "        <option value='COOL'>Cool</option>";
	html += "        <option value='HEAT'>Heat</option>";
	html += "        <option value='AUTO'>Auto</option>";
	html += "        <option value='OFF'>Off</option>";
	html += "      </select>";
	html += "    </div>";
	html += "    <div class='schedule-control-group'>";
	html += "      <label>Fan Speed:</label>";
	html += "      <select class='esphome-fan-select'>";
	html += "        <option value='AUTO'>Auto</option>";
	html += "        <option value='LOW'>Low</option>";
	html += "        <option value='MEDIUM'>Medium</option>";
	html += "        <option value='HIGH'>High</option>";
	html += "        <option value='SILENT'>Silent</option>";
	html += "        <option value='BOOST'>Boost</option>";
	html += "      </select>";
	html += "    </div>";

	html += "  </div>";    
	html += "  <div class='form-row'>";
    html += "    <label>Target Temp:</label>";
    html += "    <div class='temp-slider-container'>";
    html += "      <input type='range' class='esphome-temp-slider' min='17.0' max='30.0' step='0.5' value='" + defaultState.temp.toFixed(1) + "'>";
    html += "      <span class='temp-val'>" + formatScheduleTemperatureForUnit(defaultState.temp) + "</span>";
    html += "    </div>";
    html += "  </div>";
    html += "  <div class='form-row'>";
    html += "    <label>At Start:</label>";
    html += "    <div class='schedule-action-controls'>";
    html += "      <label class='schedule-action-item'>";
    html += "        <span>Disable Beep</span>";
    html += "        <input type='checkbox' class='sched-beep-off'>";
    html += "      </label>";
    html += "      <label class='schedule-action-item'>";
    html += "        <span>LED Display Off</span>";
    html += "        <input type='checkbox' class='sched-display-off'>";
    html += "      </label>";
    html += "    </div>";
    html += "  </div>";
    html += "  <div class='form-row'>";
    html += "    <label>Trigger Time:</label>";
    html += "    <div class='time-select-container'>";
    html += "      <select class='sched-hour'></select>";
    html += "      <span class='time-separator'>:</span>";
    html += "      <select class='sched-min'></select>";
    html += "    </div>";
    html += "  </div>";
    html += "  <div class='form-row'>";
    html += "    <label>Optional End:</label>";
    html += "    <div class='end-time-controls'>";
    html += "      <label class='end-time-enable'><input type='checkbox' class='sched-end-enabled'>Turn AC off at</label>";
    html += "      <div class='end-time-select-container end-time-disabled'>";
    html += "        <select class='sched-end-hour' disabled></select>";
    html += "        <span class='time-separator'>:</span>";
    html += "        <select class='sched-end-min' disabled></select>";
    html += "      </div>";
    html += "    </div>";
    html += "  </div>";
    html += "  <div class='form-row'>";
    html += "    <label>Active Days:</label>";
    html += "    <div class='bubbles-container'></div>";
    html += "  </div>";
    html += "</div>";
    html += "<div class='debug-label'>Cron string stored by ESPHome:</div>";
    html += "<div class='raw-debug'>" + defaultState.cron + "</div>";
    html += "<div class='save-status'>Select this tab to load from device.</div>";
    return html;
  }

  function initCardLogic(cardElement, slotIndex, defaultState) {
    var entities = entitiesForSlot(slotIndex);
    var scheduleNameInput = cardElement.querySelector(".schedule-name-input");
    var scheduleTabButton = document.querySelector(".sched-tab-btn[data-target-slot='" + slotIndex + "']");
    var modeSelect = cardElement.querySelector(".esphome-mode-select");
    var fanSelect = cardElement.querySelector(".esphome-fan-select");
    var tempSlider = cardElement.querySelector(".esphome-temp-slider");
    var tempValLabel = cardElement.querySelector(".temp-val");
    var hourSelect = cardElement.querySelector(".sched-hour");
    var minSelect = cardElement.querySelector(".sched-min");
    var endEnabledToggle = cardElement.querySelector(".sched-end-enabled");
    var endHourSelect = cardElement.querySelector(".sched-end-hour");
    var endMinSelect = cardElement.querySelector(".sched-end-min");
    var endTimeContainer = cardElement.querySelector(".end-time-select-container");
    var beepOffToggle = cardElement.querySelector(".sched-beep-off");
    var displayOffToggle = cardElement.querySelector(".sched-display-off");
    var bubblesContainer = cardElement.querySelector(".bubbles-container");
    var enableToggle = cardElement.querySelector(".esphome-enable-toggle");
    var statusLabel = cardElement.querySelector(".status-label");
    var rawDebugOutput = cardElement.querySelector(".raw-debug");
    var saveStatus = cardElement.querySelector(".save-status");

    var isHydrating = true;
    var saveTimer = null;
    var saveInProgress = false;
    var savePending = false;
    var lastSavedState = null;
    var hasLoaded = false;
    var loadPromise = null;
    // Always keep the schedule setpoint in Celsius internally, even when the
    // visible slider is operating in whole-degree Fahrenheit.
    var currentTempCelsius = parseFloat(defaultState.temp);

    for (var hour = 0; hour < 24; hour++) {
      hourSelect.add(new Option(pad2(hour), pad2(hour)));
      endHourSelect.add(new Option(pad2(hour), pad2(hour)));
    }
    for (var minute = 0; minute < 60; minute++) {
      minSelect.add(new Option(pad2(minute), pad2(minute)));
      endMinSelect.add(new Option(pad2(minute), pad2(minute)));
    }

    var daysMapping = [
      { name: "M", val: "1", title: "Monday" },
      { name: "T", val: "2", title: "Tuesday" },
      { name: "W", val: "3", title: "Wednesday" },
      { name: "T", val: "4", title: "Thursday" },
      { name: "F", val: "5", title: "Friday" },
      { name: "S", val: "6", title: "Saturday" },
      { name: "S", val: "0", title: "Sunday" }
    ];

    for (var dayIndex = 0; dayIndex < daysMapping.length; dayIndex++) {
      var dayObject = daysMapping[dayIndex];
      var dayButton = document.createElement("button");
      dayButton.type = "button";
      dayButton.className = "day-btn";
      dayButton.textContent = dayObject.name;
      dayButton.title = dayObject.title;
      dayButton.setAttribute("aria-label", dayObject.title);
      dayButton.setAttribute("data-dayval", dayObject.val);

      dayButton.addEventListener("click", function (event) {
        var clicked = event.currentTarget;
        var activeButtons = bubblesContainer.querySelectorAll(".day-btn.active");

        // Cron cannot represent an empty day set. Keep at least one day selected.
        if (clicked.classList.contains("active") && activeButtons.length === 1) {
          setStatus("At least one active day is required.", "error");
          return;
        }

        clicked.classList.toggle("active");
        queueSave();
      });

      bubblesContainer.appendChild(dayButton);
    }

    function normalizeScheduleName(value) {
      var normalized = String(value == null ? "" : value).trim().slice(0, 25);
      return normalized || ("Schedule " + slotIndex);
    }

    function updateScheduleNameDisplay(value) {
      var displayName = normalizeScheduleName(value);
      if (scheduleTabButton) {
        scheduleTabButton.title = displayName;
        scheduleTabButton.setAttribute("aria-label", "Open " + displayName);
      }
      return displayName;
    }

    function setStatus(message, kind) {
      saveStatus.textContent = message;
      saveStatus.classList.remove("status-ok", "status-pending", "status-error");
      if (kind) saveStatus.classList.add("status-" + kind);
    }

    function updateEnabledAppearance() {
      if (enableToggle.checked) {
        cardElement.classList.remove("disabled-card-overlay");
        statusLabel.textContent = "Enabled";
      } else {
        cardElement.classList.add("disabled-card-overlay");
        statusLabel.textContent = "Disabled";
      }
    }

    function updateEndTimeAppearance() {
      var endEnabled = endEnabledToggle.checked;
      endHourSelect.disabled = !endEnabled;
      endMinSelect.disabled = !endEnabled;
      endTimeContainer.classList.toggle("end-time-disabled", !endEnabled);
      endTimeContainer.setAttribute("aria-disabled", endEnabled ? "false" : "true");
    }

    function selectedDays() {
      var activeDays = [];
      var dayButtons = bubblesContainer.querySelectorAll(".day-btn");

      for (var i = 0; i < dayButtons.length; i++) {
        if (dayButtons[i].classList.contains("active")) {
          activeDays.push(dayButtons[i].getAttribute("data-dayval"));
        }
      }

      return activeDays;
    }

    function buildCronString() {
      var activeDays = selectedDays();
      var daysString = activeDays.length === 7 ? "*" : activeDays.join(",");
      return "0 " + minSelect.value + " " + hourSelect.value + " * * " + daysString;
    }

    function endTimeMatchesStartTime() {
      return endEnabledToggle.checked &&
        endHourSelect.value === hourSelect.value &&
        endMinSelect.value === minSelect.value;
    }

    function buildEndCronString() {
      if (!endEnabledToggle.checked) return "DISABLED";

      var activeDays = selectedDays();
      var startMinutes = parseInt(hourSelect.value, 10) * 60 + parseInt(minSelect.value, 10);
      var endMinutes = parseInt(endHourSelect.value, 10) * 60 + parseInt(endMinSelect.value, 10);
      var rollsIntoNextDay = endMinutes < startMinutes;
      var endDays = [];

      for (var i = 0; i < activeDays.length; i++) {
        var day = parseInt(activeDays[i], 10);
        endDays.push(String(rollsIntoNextDay ? ((day + 1) % 7) : day));
      }

      var daysString = endDays.length === 7 ? "*" : endDays.join(",");
      return "0 " + endMinSelect.value + " " + endHourSelect.value + " * * " + daysString;
    }

    function snapScheduleCelsius(value) {
      var celsius = parseFloat(value);
      if (!Number.isFinite(celsius)) celsius = 21.0;
      celsius = Math.round(celsius / 0.5) * 0.5;
      celsius = Math.max(17.0, Math.min(30.0, celsius));
      return Math.round(celsius * 10) / 10;
    }

    function applyScheduleTemperatureToSlider(celsiusValue) {
      currentTempCelsius = snapScheduleCelsius(celsiusValue);

      if (usesFahrenheitTemperatureUnit()) {
        tempSlider.min = "63";
        tempSlider.max = "86";
        tempSlider.step = "1";
        tempSlider.value = String(Math.round(celsiusToFahrenheit(currentTempCelsius)));
        tempValLabel.textContent = tempSlider.value + "°F";
      } else {
        tempSlider.min = "17";
        tempSlider.max = "30";
        tempSlider.step = "0.5";
        tempSlider.value = currentTempCelsius.toFixed(1);
        tempValLabel.textContent = currentTempCelsius.toFixed(1) + "°C";
      }
    }

    function updateScheduleCelsiusFromSlider() {
      var displayValue = parseFloat(tempSlider.value);
      if (!Number.isFinite(displayValue)) return;

      if (usesFahrenheitTemperatureUnit()) {
        currentTempCelsius = snapScheduleCelsius(fahrenheitToCelsius(displayValue));
      } else {
        currentTempCelsius = snapScheduleCelsius(displayValue);
      }
    }

    function collectUiState() {
      return {
        name: normalizeScheduleName(scheduleNameInput.value),
        enabled: enableToggle.checked,
        mode: modeSelect.value,
        fan: fanSelect.value,
        temp: currentTempCelsius,
        cron: buildCronString(),
        endCron: buildEndCronString(),
        beepOff: beepOffToggle.checked,
        displayOff: displayOffToggle.checked
      };
    }

    function statesEqual(left, right) {
      if (!left || !right) return false;
      return left.name === right.name &&
        left.enabled === right.enabled &&
        left.mode === right.mode &&
        left.fan === right.fan &&
        Math.abs(left.temp - right.temp) < 0.001 &&
        left.cron === right.cron &&
        left.endCron === right.endCron &&
        left.beepOff === right.beepOff &&
        left.displayOff === right.displayOff;
    }

    function applyStateToUi(state) {
      var cronDetails = parseCronString(state.cron, defaultState.cron);
      scheduleNameInput.value = normalizeScheduleName(state.name);
      updateScheduleNameDisplay(scheduleNameInput.value);
      modeSelect.value = state.mode;
      if (!modeSelect.value) modeSelect.value = defaultState.mode;

      fanSelect.value = state.fan;
      if (!fanSelect.value) fanSelect.value = defaultState.fan;

      applyScheduleTemperatureToSlider(state.temp);
      hourSelect.value = cronDetails.hour;
      minSelect.value = cronDetails.minute;

      var endCronDetails = parseOptionalEndCron(state.endCron);
      endEnabledToggle.checked = endCronDetails.enabled;
      endHourSelect.value = endCronDetails.hour;
      endMinSelect.value = endCronDetails.minute;
      updateEndTimeAppearance();

      beepOffToggle.checked = !!state.beepOff;
      displayOffToggle.checked = !!state.displayOff;

      var dayButtons = bubblesContainer.querySelectorAll(".day-btn");
      for (var i = 0; i < dayButtons.length; i++) {
        var dayValue = dayButtons[i].getAttribute("data-dayval");
        dayButtons[i].classList.toggle("active", !!cronDetails.daySet[dayValue]);
      }

      enableToggle.checked = !!state.enabled;
      rawDebugOutput.textContent = cronDetails.cron;
      updateEnabledAppearance();
    }

    async function loadEntityValue(entity, fallbackValue) {
      var payload = await getEntity(entity);
      return payloadValue(payload, fallbackValue);
    }

    async function loadFromDevice() {
      if (hasLoaded) return;
      if (loadPromise) return loadPromise;

      loadPromise = (async function () {
        setStatus("Loading from device…", "pending");
        isHydrating = true;

        var loadedState = {
          name: defaultState.name,
          enabled: defaultState.enabled,
          mode: defaultState.mode,
          fan: defaultState.fan,
          temp: defaultState.temp,
          cron: defaultState.cron,
          endCron: defaultState.endCron,
          beepOff: defaultState.beepOff,
          displayOff: defaultState.displayOff
        };

        var requests = [
          loadEntityValue(entities.name, defaultState.name),
          loadEntityValue(entities.enabled, defaultState.enabled),
          loadEntityValue(entities.mode, defaultState.mode),
          loadEntityValue(entities.fan, defaultState.fan),
          loadEntityValue(entities.temp, defaultState.temp),
          loadEntityValue(entities.cron, defaultState.cron),
          loadEntityValue(entities.endCron, defaultState.endCron),
          loadEntityValue(entities.beepOff, defaultState.beepOff),
          loadEntityValue(entities.displayOff, defaultState.displayOff)
        ];

        try {
          var results = await Promise.allSettled(requests);
          var errors = [];

          if (results[0].status === "fulfilled") {
            loadedState.name = normalizeScheduleName(results[0].value);
          } else {
            errors.push(results[0].reason);
          }

          if (results[1].status === "fulfilled") {
            loadedState.enabled = parseSwitchValue(results[1].value, defaultState.enabled);
          } else {
            errors.push(results[1].reason);
          }

          if (results[2].status === "fulfilled") {
            loadedState.mode = String(results[2].value);
          } else {
            errors.push(results[2].reason);
          }

          if (results[3].status === "fulfilled") {
            loadedState.fan = String(results[3].value);
          } else {
            errors.push(results[3].reason);
          }

          if (results[4].status === "fulfilled") {
            loadedState.temp = parseNumberValue(results[4].value, defaultState.temp);
          } else {
            errors.push(results[4].reason);
          }

          if (results[5].status === "fulfilled") {
            loadedState.cron = String(results[5].value);
          } else {
            errors.push(results[5].reason);
          }

          if (results[6].status === "fulfilled") {
            loadedState.endCron = String(results[6].value);
          } else {
            errors.push(results[6].reason);
          }

          if (results[7].status === "fulfilled") {
            loadedState.beepOff = parseSwitchValue(results[7].value, defaultState.beepOff);
          } else {
            errors.push(results[7].reason);
          }

          if (results[8].status === "fulfilled") {
            loadedState.displayOff = parseSwitchValue(results[8].value, defaultState.displayOff);
          } else {
            errors.push(results[8].reason);
          }

          applyStateToUi(loadedState);
          lastSavedState = collectUiState();
          hasLoaded = true;

          if (errors.length > 0) {
            console.error("Schedule " + slotIndex + " read errors:", errors);
            setStatus("Some values could not be read; defaults are shown.", "error");
          } else {
            setStatus("Loaded from device.", "ok");
          }
        } catch (error) {
          console.error("Schedule " + slotIndex + " load failed:", error);
          applyStateToUi(loadedState);
          lastSavedState = collectUiState();
          hasLoaded = true;
          setStatus("Load failed; defaults are shown.", "error");
        } finally {
          isHydrating = false;
          loadPromise = null;
        }
      })();

      return loadPromise;
    }

    function queueSave() {
      if (isHydrating) return;

      // Allow the user to temporarily clear the name while replacing it.
      // Do not normalize or save an empty value until the field loses focus.
      if (document.activeElement === scheduleNameInput &&
          !String(scheduleNameInput.value || "").trim()) {
        if (saveTimer) {
          window.clearTimeout(saveTimer);
          saveTimer = null;
        }
        updateScheduleNameDisplay("");
        setStatus("Enter a schedule name.", "pending");
        return;
      }

      if (endTimeMatchesStartTime()) {
        if (saveTimer) {
          window.clearTimeout(saveTimer);
          saveTimer = null;
        }
        setStatus("End time must differ from the start time.", "error");
        return;
      }

      updateScheduleNameDisplay(scheduleNameInput.value);
      rawDebugOutput.textContent = buildCronString();
      updateEnabledAppearance();
      setStatus("Saving…", "pending");

      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveNow, SAVE_DELAY_MS);
    }

    async function saveNow() {
      if (isHydrating) return;

      // A blank field is valid while the user is editing. The blur handler
      // supplies the default only when the user leaves the field blank.
      if (document.activeElement === scheduleNameInput &&
          !String(scheduleNameInput.value || "").trim()) {
        setStatus("Enter a schedule name.", "pending");
        return;
      }

      if (endTimeMatchesStartTime()) {
        setStatus("End time must differ from the start time.", "error");
        return;
      }

      if (saveInProgress) {
        savePending = true;
        return;
      }

      var nextState = collectUiState();
      if (statesEqual(nextState, lastSavedState)) {
        setStatus("Saved.", "ok");
        return;
      }

      saveInProgress = true;
      savePending = false;
      setStatus("Saving…", "pending");

      try {
        // Disable first, so a schedule cannot execute while its remaining fields are being changed.
        if (lastSavedState && lastSavedState.enabled && !nextState.enabled) {
          await setEntity(entities.enabled, false);
        }

        if (!lastSavedState || nextState.name !== lastSavedState.name) {
          await setEntity(entities.name, nextState.name);
        }
        if (!lastSavedState || nextState.mode !== lastSavedState.mode) {
          await setEntity(entities.mode, nextState.mode);
        }
        if (!lastSavedState || nextState.fan !== lastSavedState.fan) {
          await setEntity(entities.fan, nextState.fan);
        }
        if (!lastSavedState || Math.abs(nextState.temp - lastSavedState.temp) >= 0.001) {
          await setEntity(entities.temp, nextState.temp.toFixed(1));
        }
        if (!lastSavedState || nextState.cron !== lastSavedState.cron) {
          await setEntity(entities.cron, nextState.cron);
        }
        if (!lastSavedState || nextState.endCron !== lastSavedState.endCron) {
          await setEntity(entities.endCron, nextState.endCron);
        }
        if (!lastSavedState || nextState.beepOff !== lastSavedState.beepOff) {
          await setEntity(entities.beepOff, nextState.beepOff);
        }
        if (!lastSavedState || nextState.displayOff !== lastSavedState.displayOff) {
          await setEntity(entities.displayOff, nextState.displayOff);
        }

        // Enable last, after all schedule parameters have reached the device.
        if (!lastSavedState || nextState.enabled !== lastSavedState.enabled) {
          if (nextState.enabled) {
            await setEntity(entities.enabled, true);
          } else if (!lastSavedState || !lastSavedState.enabled) {
            await setEntity(entities.enabled, false);
          }
        }

        lastSavedState = nextState;

        // Never overwrite text the user is actively editing with the value
        // from an earlier, in-flight save.
        if (document.activeElement !== scheduleNameInput) {
          scheduleNameInput.value = nextState.name;
          updateScheduleNameDisplay(nextState.name);
        } else {
          updateScheduleNameDisplay(scheduleNameInput.value);
        }

        rawDebugOutput.textContent = nextState.cron;
        setStatus("Saved to ESPHome.", "ok");
      } catch (error) {
        console.error("Schedule " + slotIndex + " save failed:", error);
        setStatus("Save failed. Check the browser console and REST endpoints.", "error");
      } finally {
        saveInProgress = false;

        var currentState = collectUiState();
        if (savePending || !statesEqual(currentState, lastSavedState)) {
          savePending = false;
          if (saveTimer) window.clearTimeout(saveTimer);
          saveTimer = window.setTimeout(saveNow, SAVE_DELAY_MS);
        }
      }
    }

    scheduleNameInput.addEventListener("input", function () {
      if (scheduleNameInput.value.length > 25) {
        scheduleNameInput.value = scheduleNameInput.value.slice(0, 25);
      }
      updateScheduleNameDisplay(scheduleNameInput.value);
      queueSave();
    });

    scheduleNameInput.addEventListener("blur", function () {
      // Only now replace a truly blank name with the default "Schedule N".
      scheduleNameInput.value = normalizeScheduleName(scheduleNameInput.value);
      updateScheduleNameDisplay(scheduleNameInput.value);
      queueSave();
    });

    scheduleNameInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        scheduleNameInput.blur();
      }
    });

    tempSlider.addEventListener("input", function () {
      updateScheduleCelsiusFromSlider();
      if (usesFahrenheitTemperatureUnit()) {
        tempValLabel.textContent = Math.round(parseFloat(tempSlider.value)) + "°F";
      } else {
        tempValLabel.textContent = currentTempCelsius.toFixed(1) + "°C";
      }
      queueSave();
    });

    window.addEventListener("device-temperature-unit-changed", function () {
      // Re-render the same internal Celsius setpoint in the newly selected
      // display unit. Do not write the schedule merely because units changed.
      applyScheduleTemperatureToSlider(currentTempCelsius);
    });
    modeSelect.addEventListener("change", queueSave);
    fanSelect.addEventListener("change", queueSave);
    beepOffToggle.addEventListener("change", queueSave);
    displayOffToggle.addEventListener("change", queueSave);
    hourSelect.addEventListener("change", queueSave);
    minSelect.addEventListener("change", queueSave);

    endEnabledToggle.addEventListener("change", function () {
      if (endEnabledToggle.checked &&
          endHourSelect.value === hourSelect.value &&
          endMinSelect.value === minSelect.value) {
        endHourSelect.value = pad2((parseInt(hourSelect.value, 10) + 1) % 24);
        endMinSelect.value = minSelect.value;
      }
      updateEndTimeAppearance();
      queueSave();
    });
    endHourSelect.addEventListener("change", queueSave);
    endMinSelect.addEventListener("change", queueSave);

    enableToggle.addEventListener("change", queueSave);

    applyStateToUi(defaultState);

    return {
      load: loadFromDevice
    };
  }
})();