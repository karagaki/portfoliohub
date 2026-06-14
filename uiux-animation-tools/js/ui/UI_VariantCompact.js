// UI_VariantCompact.js - UIバリエーション大型パネルの表示/非表示と代替コンパクト切替
(function() {
  'use strict';

  const STORAGE_KEY = 'uiVariantPanelCompactHidden';
  const FULL_PANEL_ID = 'ui-variant-panel';
  const PRESET_PANEL_ID = 'ui-preset-panel';
  const VARIANT_SELECT_ID = 'ui-variant-select';
  const PRESET_SELECT_ID = 'ui-preset-select';
  const COMPACT_PANEL_ID = 'ui-variant-compact-panel';
  const FULL_TOGGLE_ID = 'ui-variant-full-toggle';
  const POSITION_STORAGE_KEY = 'uiVariantCompactPositionV65';
  const POSITION_DEFAULTS = { left: 18, top: 18, width: 112, padding: 4, gap: 3 };
  
  let observer = null;
  let syncTimer = null;


  function clampNumber(value, min, max, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function readPositionSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY) || '{}');
      return {
        left: clampNumber(raw.left, 0, Math.max(0, window.innerWidth - 80), POSITION_DEFAULTS.left),
        top: clampNumber(raw.top, 0, Math.max(0, window.innerHeight - 80), POSITION_DEFAULTS.top),
        width: clampNumber(raw.width, 64, 180, POSITION_DEFAULTS.width),
        padding: clampNumber(raw.padding, 2, 18, POSITION_DEFAULTS.padding),
        gap: clampNumber(raw.gap, 0, 16, POSITION_DEFAULTS.gap)
      };
    } catch (error) {
      return { ...POSITION_DEFAULTS };
    }
  }

  function writePositionSettings(next) {
    const current = readPositionSettings();
    const merged = {
      left: clampNumber(next.left ?? current.left, 0, Math.max(0, window.innerWidth - 80), current.left),
      top: clampNumber(next.top ?? current.top, 0, Math.max(0, window.innerHeight - 80), current.top),
      width: clampNumber(next.width ?? current.width, 64, 180, current.width),
      padding: clampNumber(next.padding ?? current.padding, 2, 18, current.padding),
      gap: clampNumber(next.gap ?? current.gap, 0, 16, current.gap)
    };
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(merged));
    applyPositionSettings(merged);
    return merged;
  }

  function applyPositionSettings(settings = readPositionSettings()) {
    const root = document.documentElement;
    root.style.setProperty('--ui-variant-compact-left', `${settings.left}px`);
    root.style.setProperty('--ui-variant-compact-top', `${settings.top}px`);
    root.style.setProperty('--ui-variant-compact-width', `${settings.width}px`);
    root.style.setProperty('--ui-variant-compact-padding', `${settings.padding}px`);
    root.style.setProperty('--ui-variant-compact-gap', `${settings.gap}px`);
  }

  function resetPositionSettings() {
    localStorage.removeItem(POSITION_STORAGE_KEY);
    applyPositionSettings({ ...POSITION_DEFAULTS });
    return readPositionSettings();
  }

  function pickStyle(style, names) {
    const out = {};
    names.forEach((name) => {
      const value = style.getPropertyValue(name);
      if (value) out[name] = value.trim();
    });
    return out;
  }

  function applyStyleMap(el, styleMap) {
    if (!el) return;
    Object.entries(styleMap).forEach(([name, value]) => {
      if (value) el.style.setProperty(name, value, 'important');
    });
  }

  function syncCompactComputedStyles() {
    const compactPanel = document.getElementById(COMPACT_PANEL_ID);
    const fullPanel = getFullPanel();
    if (!compactPanel || !fullPanel) return;

    const fullStyle = window.getComputedStyle(fullPanel);
    applyStyleMap(compactPanel, pickStyle(fullStyle, [
      'background-color',
      'background-image',
      'box-shadow',
      'backdrop-filter', '-webkit-backdrop-filter',
      'filter'
    ]));
    compactPanel.style.setProperty('border-radius', '16px', 'important');
    if (getTheme() === 'glass') {
      compactPanel.style.setProperty('border', '0', 'important');
      compactPanel.style.setProperty('border-width', '0', 'important');
      compactPanel.style.setProperty('border-style', 'none', 'important');
      compactPanel.style.setProperty('border-color', 'transparent', 'important');
      compactPanel.style.setProperty('outline', '0', 'important');
      compactPanel.style.setProperty('outline-color', 'transparent', 'important');
      compactPanel.style.setProperty('box-shadow', 'none', 'important');
      compactPanel.style.setProperty('filter', 'none', 'important');
      compactPanel.style.setProperty('background-clip', 'padding-box', 'important');
    }

    const sourceVariant = getVariantSelect();
    const sourcePreset = getPresetSelect() || sourceVariant;
    const compactVariant = compactPanel.querySelector('.ui-variant-compact-theme-select');
    const compactPreset = compactPanel.querySelector('.ui-variant-compact-preset');

    const copySelect = (source, target) => {
      if (!source || !target) return;
      const st = window.getComputedStyle(source);
      const isGlassTheme = getTheme() === 'glass';
      const copyNames = isGlassTheme
        ? [
            'font-family', 'font-weight', 'letter-spacing',
            'color',
            'background-color', 'background-image',
            'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
            'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
            'backdrop-filter', '-webkit-backdrop-filter',
            'filter'
          ]
        : [
            'font-family', 'font-weight', 'letter-spacing',
            'color',
            'background-color', 'background-image',
            'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
            'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
            'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
            'box-shadow',
            'backdrop-filter', '-webkit-backdrop-filter',
            'filter'
          ];
      applyStyleMap(target, pickStyle(st, copyNames));
      if (isGlassTheme) {
        /* v97: Glassmorphismの左上mini selectには、元selectの背景連動枠色・発光をコピーしない。
         * select形状は残し、外周だけを中立固定にする。 */
        target.style.setProperty('border-color', 'transparent', 'important');
        target.style.setProperty('box-shadow', 'none', 'important');
        target.style.setProperty('outline', '0', 'important');
        target.style.setProperty('filter', 'none', 'important');
      }
      target.style.setProperty('height', '26px', 'important');
      target.style.setProperty('min-height', '26px', 'important');
      target.style.setProperty('font-size', '10.5px', 'important');
      target.style.setProperty('line-height', '1.1', 'important');
      target.style.setProperty('border-radius', '999px', 'important');
      target.style.setProperty('padding-top', '0', 'important');
      target.style.setProperty('padding-bottom', '0', 'important');
      target.style.setProperty('padding-left', '9px', 'important');
      target.style.setProperty('padding-right', '18px', 'important');
      target.style.setProperty('overflow', 'hidden', 'important');
      target.style.setProperty('text-overflow', 'ellipsis', 'important');
      target.style.setProperty('white-space', 'nowrap', 'important');
      target.style.setProperty('max-width', '100%', 'important');
      target.style.setProperty('min-width', '0', 'important');
    };

    copySelect(sourceVariant, compactVariant);
    copySelect(sourcePreset, compactPreset);

    const readableColor = document.body?.style?.getPropertyValue('--ui-auto-readable-icon-color')
      || document.body?.style?.getPropertyValue('--auto-readable-text-color')
      || getComputedStyle(document.body || document.documentElement).getPropertyValue('--ui-auto-readable-icon-color')
      || getComputedStyle(document.body || document.documentElement).getPropertyValue('--auto-readable-text-color')
      || '#111827';
    compactPanel.style.setProperty('--ui-auto-readable-icon-color', readableColor.trim(), 'important');
    compactPanel.style.setProperty('--auto-readable-text-color', readableColor.trim(), 'important');
    compactPanel.style.setProperty('color', readableColor.trim(), 'important');
    compactPanel.querySelectorAll('select, option, button, span, label').forEach((el) => {
      el.style.setProperty('color', readableColor.trim(), 'important');
      el.style.setProperty('-webkit-text-fill-color', readableColor.trim(), 'important');
    });
    if (typeof window.UIUXRefreshReadableTextColors === 'function') {
      window.requestAnimationFrame(() => window.UIUXRefreshReadableTextColors());
    }
  }

  function getTheme() {
    return document.body.getAttribute('data-ui-theme') === 'neumorphism' ? 'neumorphism' : 'glass';
  }

  function getFullPanel() {
    return document.getElementById(FULL_PANEL_ID);
  }

  function getPresetSelect() {
    return document.querySelector(`#${PRESET_PANEL_ID} #${PRESET_SELECT_ID}`) || document.getElementById(PRESET_SELECT_ID);
  }

  function getVariantSelect() {
    return document.getElementById(VARIANT_SELECT_ID);
  }

  function isHiddenRequested() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function setHiddenRequested(hidden) {
    localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0');
    applyVisibility(hidden);
  }

  function applyVisibility(hidden = isHiddenRequested()) {
    const full = getFullPanel();
    const compact = document.getElementById(COMPACT_PANEL_ID);
    if (full) {
      full.classList.toggle('ui-variant-full-hidden', hidden);
      full.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }
    if (compact) {
      compact.hidden = !hidden;
      compact.classList.toggle('is-visible', hidden);
    }
    const toggle = document.getElementById(FULL_TOGGLE_ID);
    if (toggle) {
      toggle.textContent = hidden ? 'UI表示' : 'UI非表示';
      toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      toggle.title = hidden ? 'UIバリエーションの詳細パネルを表示' : 'UIバリエーションの詳細パネルを隠す';
    }
    syncCompactComputedStyles();
    scheduleSync();
  }

  function ensurePanelToggleButton() {
    const full = getFullPanel();
    if (!full) return;
    let button = document.getElementById(FULL_TOGGLE_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = FULL_TOGGLE_ID;
      button.type = 'button';
      button.className = 'ui-variant-full-toggle';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setHiddenRequested(!isHiddenRequested());
      });
      full.insertBefore(button, full.firstChild);
    }
  }

  function ensureCompactPanel() {
    let panel = document.getElementById(COMPACT_PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = COMPACT_PANEL_ID;
      panel.className = 'ui-variant-compact-panel';
      panel.hidden = true;
      panel.innerHTML = `
        <select class="ui-variant-compact-theme-select" aria-label="UI style">
          <option value="glass">Glass</option>
          <option value="neumorphism">Neumo</option>
        </select>
        <select class="ui-variant-compact-preset" aria-label="UI preset"></select>
      `;
      document.body.appendChild(panel);

      const themeSelect = panel.querySelector('.ui-variant-compact-theme-select');
      themeSelect?.addEventListener('change', () => {
        setTheme(themeSelect.value);
      });

      const preset = panel.querySelector('.ui-variant-compact-preset');
      preset?.addEventListener('change', () => {
        setPreset(preset.value);
      });
    }
    return panel;
  }

  function setTheme(theme) {
    const select = getVariantSelect();
    const nextValue = theme === 'neumorphism' ? 'variant-2-neumorphism' : 'variant-1-glass';
    if (select) {
      select.value = nextValue;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (window.UIVariant && typeof window.UIVariant.applyVariant === 'function') {
      window.UIVariant.applyVariant(nextValue);
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(scheduleSync);
    });
  }

  function syncThemeButtons() {
    const panel = document.getElementById(COMPACT_PANEL_ID);
    if (!panel) return;
    const theme = getTheme();
    const select = panel.querySelector('.ui-variant-compact-theme-select');
    if (select && select.value !== theme) select.value = theme;
  }

  function syncPresetSelect() {
    const panel = document.getElementById(COMPACT_PANEL_ID);
    const compact = panel?.querySelector('.ui-variant-compact-preset');
    const source = getPresetSelect();
    if (!compact || !source) return;
    const sourceOptions = Array.from(source.options).map((option) => ({
      value: option.value,
      text: option.textContent,
      disabled: option.disabled
    }));
    const currentSignature = compact.dataset.optionSignature || '';
    const nextSignature = JSON.stringify(sourceOptions);
    if (currentSignature !== nextSignature) {
      compact.innerHTML = '';
      sourceOptions.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.text;
        option.disabled = item.disabled;
        compact.appendChild(option);
      });
      compact.dataset.optionSignature = nextSignature;
    }
    compact.value = source.value;
  }

  function setPreset(value) {
    const source = getPresetSelect();
    if (!source) return false;
    source.value = value;
    source.dispatchEvent(new Event('change', { bubbles: true }));
    scheduleSync();
    return true;
  }

  function isFullHidden() {
    return isHiddenRequested();
  }

  function syncAll() {
    applyPositionSettings();
    ensurePanelToggleButton();
    ensureCompactPanel();
    syncThemeButtons();
    syncPresetSelect();
    syncCompactComputedStyles();
    applyVisibility(isHiddenRequested());
  }

  function scheduleSync() {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      syncThemeButtons();
      syncPresetSelect();
      syncCompactComputedStyles();
    }, 30);
  }

  function observePresetPanel() {
    const presetPanel = document.getElementById(PRESET_PANEL_ID);
    if (!presetPanel || observer) return;
    observer = new MutationObserver(() => scheduleSync());
    observer.observe(presetPanel, { childList: true, subtree: true, attributes: true });
  }

  function init() {
    applyPositionSettings();
    ensurePanelToggleButton();
    ensureCompactPanel();
    applyVisibility(isHiddenRequested());
    observePresetPanel();
    syncAll();
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) applyVisibility(isHiddenRequested());
    });
    document.addEventListener('change', (event) => {
      if (event.target?.id === VARIANT_SELECT_ID || event.target?.id === PRESET_SELECT_ID) scheduleSync();
    }, true);
  }

  window.UIVariantCompact = {
    init,
    showFull: () => setHiddenRequested(false),
    hideFull: () => setHiddenRequested(true),
    setTheme,
    setPreset,
    isFullHidden,
    getPosition: readPositionSettings,
    setPosition: writePositionSettings,
    resetPosition: resetPositionSettings,
    sync: syncAll
  };

  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      init();
      requestAnimationFrame(syncAll);
    });
  });
})();
