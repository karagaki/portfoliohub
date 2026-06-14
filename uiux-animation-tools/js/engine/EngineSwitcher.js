(function() {
  'use strict';

  const PANEL_ID = 'uiux-engine-switcher';
  const STORAGE_KEY = 'uiux.engineSwitcher.open';

  function isDeveloperMode() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return params.get('engineDebug') === '1' || params.get('uiuxDev') === '1';
    } catch (error) {
      return false;
    }
  }

  function readOpenDefault() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('engineSwitcher') === '1') return true;
      if (params.get('engineSwitcher') === '0') return false;
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function saveOpen(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch (error) {
      // localStorage が使えない環境では画面状態だけ保持する。
    }
  }

  function makeContext() {
    if (window.UIUXEngineBootstrap && typeof window.UIUXEngineBootstrap.makeContext === 'function') {
      return window.UIUXEngineBootstrap.makeContext();
    }
    const adapter = window.UIUXEngineStateAdapter;
    return {
      initialState: adapter && typeof adapter.createSnapshot === 'function' ? adapter.createSnapshot() : {}
    };
  }

  function activateEngine(id, statusNode) {
    const registry = window.UIUXEngineRegistry;
    if (!registry || typeof registry.activate !== 'function') return;
    try {
      registry.activate(id, makeContext());
      if (statusNode) statusNode.textContent = 'active: ' + registry.getActiveId();
      if (window.UIUXEngineDiagnostics && typeof window.UIUXEngineDiagnostics.refresh === 'function') {
        window.UIUXEngineDiagnostics.refresh();
      }
    } catch (error) {
      if (statusNode) statusNode.textContent = 'switch failed: ' + error.message;
      console.warn('[engine-switcher] failed to activate engine', error);
    }
  }

  function makeStyles() {
    if (document.getElementById('uiux-engine-switcher-style')) return;
    const style = document.createElement('style');
    style.id = 'uiux-engine-switcher-style';
    style.textContent = `
      #${PANEL_ID} {
        position: fixed;
        left: 16px;
        bottom: 108px;
        z-index: 2147482999;
        width: min(360px, calc(100vw - 32px));
        box-sizing: border-box;
        display: none;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(0,0,0,.16);
        background: rgba(255,255,255,.90);
        color: #111;
        box-shadow: 0 16px 42px rgba(0,0,0,.16);
        backdrop-filter: blur(14px);
        pointer-events: auto;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #${PANEL_ID}.is-open { display: block; }
      #${PANEL_ID} h2 { margin: 0 0 6px; font: 700 13px/1.35 system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      #${PANEL_ID} p { margin: 0 0 10px; color: rgba(0,0,0,.62); font: 11px/1.5 system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      #${PANEL_ID} .engine-switcher-actions { display: grid; gap: 6px; }
      #${PANEL_ID} button {
        width: 100%;
        border: 1px solid rgba(0,0,0,.16);
        border-radius: 12px;
        padding: 8px 10px;
        background: rgba(255,255,255,.72);
        color: #111;
        cursor: pointer;
        text-align: left;
        font: 600 11px/1.3 system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #${PANEL_ID} button.is-active { background: rgba(150,46,255,.14); border-color: rgba(150,46,255,.42); }
      #${PANEL_ID} .engine-switcher-status { margin-top: 8px; color: rgba(0,0,0,.62); font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    `;
    document.head.appendChild(style);
  }

  function render(panel) {
    const registry = window.UIUXEngineRegistry;
    const engines = registry && typeof registry.list === 'function' ? registry.list() : [];
    const activeId = registry && typeof registry.getActiveId === 'function' ? registry.getActiveId() : null;
    panel.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Engine Switcher';
    panel.appendChild(title);

    const note = document.createElement('p');
    note.textContent = 'Experimental engines are stubs. They only test registry switching and do not replace the current p5.js drawing.';
    panel.appendChild(note);

    const actions = document.createElement('div');
    actions.className = 'engine-switcher-actions';
    const status = document.createElement('div');
    status.className = 'engine-switcher-status';
    status.textContent = 'active: ' + (activeId || '(none)');

    engines.forEach(function(engine) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = engine.id + ' / ' + engine.label;
      if (engine.id === activeId) button.classList.add('is-active');
      button.addEventListener('click', function() {
        activateEngine(engine.id, status);
        render(panel);
      });
      actions.appendChild(button);
    });

    panel.appendChild(actions);
    panel.appendChild(status);
  }

  function togglePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const nextOpen = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', nextOpen);
    saveOpen(nextOpen);
    if (nextOpen) render(panel);
  }

  function init() {
    if (!isDeveloperMode()) return;
    makeStyles();
    const diagnosticsToggle = document.getElementById('uiux-engine-diagnostics-toggle');
    const panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-label', 'Engine Switcher');
    document.body.appendChild(panel);

    if (diagnosticsToggle) {
      diagnosticsToggle.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        togglePanel();
      });
      diagnosticsToggle.title = 'Click: diagnostics / Right click: engine switcher';
    }

    if (readOpenDefault()) {
      panel.classList.add('is-open');
      render(panel);
    }
  }

  window.UIUXEngineSwitcher = {
    render: render,
    toggle: togglePanel,
    activate: activateEngine,
    isDeveloperMode: isDeveloperMode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
