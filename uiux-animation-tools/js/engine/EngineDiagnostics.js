(function() {
  'use strict';

  const PANEL_ID = 'uiux-engine-diagnostics';
  const TOGGLE_ID = 'uiux-engine-diagnostics-toggle';
  const STORAGE_KEY = 'uiux.engineDiagnostics.enabled';
  const POLL_MS = 1000;

  function isDeveloperMode() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return params.get('engineDebug') === '1' || params.get('uiuxDev') === '1';
    } catch (error) {
      return false;
    }
  }

  function isEnabledByDefault() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('engineDebug') === '1') return true;
      if (params.get('engineDebug') === '0') return false;
      return false;
    } catch (error) {
      return false;
    }
  }

  function setEnabled(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch (error) {
      // localStorage が使えない環境では表示状態だけ切り替える。
    }
  }

  function readSnapshot() {
    const registry = window.UIUXEngineRegistry;
    const adapter = window.UIUXEngineStateAdapter;
    const activeId = registry && typeof registry.getActiveId === 'function' ? registry.getActiveId() : null;
    const engines = registry && typeof registry.list === 'function' ? registry.list() : [];
    const snapshot = adapter && typeof adapter.createSnapshot === 'function' ? adapter.createSnapshot() : {};
    return {
      activeId: activeId || '(none)',
      engines: engines,
      snapshot: snapshot
    };
  }

  function makeStyles() {
    if (document.getElementById('uiux-engine-diagnostics-style')) return;
    const style = document.createElement('style');
    style.id = 'uiux-engine-diagnostics-style';
    style.textContent = `
      #${TOGGLE_ID} {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 2147483000;
        border: 1px solid rgba(0,0,0,.18);
        border-radius: 999px;
        padding: 8px 12px;
        font: 600 11px/1.2 system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: rgba(255,255,255,.82);
        color: #111;
        backdrop-filter: blur(10px);
        cursor: pointer;
        pointer-events: auto;
      }
      #${PANEL_ID} {
        position: fixed;
        left: 16px;
        bottom: 58px;
        width: min(360px, calc(100vw - 32px));
        max-height: min(420px, calc(100vh - 96px));
        overflow: auto;
        z-index: 2147483000;
        display: none;
        box-sizing: border-box;
        border: 1px solid rgba(0,0,0,.18);
        border-radius: 16px;
        padding: 12px;
        background: rgba(255,255,255,.90);
        color: #111;
        box-shadow: 0 16px 42px rgba(0,0,0,.18);
        backdrop-filter: blur(14px);
        pointer-events: auto;
      }
      #${PANEL_ID}.is-open { display: block; }
      #${PANEL_ID} h2 { margin: 0 0 8px; font: 700 13px/1.3 system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      #${PANEL_ID} .engine-diagnostics-row { display: flex; justify-content: space-between; gap: 12px; margin: 6px 0; font: 12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      #${PANEL_ID} .engine-diagnostics-label { color: rgba(0,0,0,.58); }
      #${PANEL_ID} pre { margin: 8px 0 0; white-space: pre-wrap; word-break: break-word; font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    `;
    document.head.appendChild(style);
  }

  function render(panel) {
    const data = readSnapshot();
    const engineList = data.engines.map(function(engine) {
      return engine.id + ' / ' + engine.label;
    }).join('\n') || '(none)';
    panel.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = 'Engine Diagnostics';
    panel.appendChild(title);

    const activeRow = document.createElement('div');
    activeRow.className = 'engine-diagnostics-row';
    activeRow.innerHTML = '<span class="engine-diagnostics-label">active</span><strong></strong>';
    activeRow.querySelector('strong').textContent = data.activeId;
    panel.appendChild(activeRow);

    const engines = document.createElement('pre');
    engines.textContent = 'engines:\n' + engineList;
    panel.appendChild(engines);

    const snapshot = document.createElement('pre');
    snapshot.textContent = 'snapshot:\n' + JSON.stringify(data.snapshot, null, 2);
    panel.appendChild(snapshot);
  }

  function init() {
    if (!isDeveloperMode()) return;
    makeStyles();
    const toggle = document.createElement('button');
    toggle.id = TOGGLE_ID;
    toggle.type = 'button';
    toggle.textContent = 'Engine';
    toggle.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-label', 'Engine Diagnostics');

    let timerId = null;
    function openPanel() {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      setEnabled(true);
      render(panel);
      if (!timerId) timerId = window.setInterval(function() { render(panel); }, POLL_MS);
    }
    function closePanel() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setEnabled(false);
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    toggle.addEventListener('click', function() {
      if (panel.classList.contains('is-open')) closePanel();
      else openPanel();
    });

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    if (isEnabledByDefault()) openPanel();
  }

  function refresh() {
    const panel = document.getElementById(PANEL_ID);
    if (panel && panel.classList.contains('is-open')) render(panel);
  }

  window.UIUXEngineDiagnostics = {
    readSnapshot: readSnapshot,
    refresh: refresh,
    isDeveloperMode: isDeveloperMode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
