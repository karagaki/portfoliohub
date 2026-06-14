(function() {
  'use strict';

  function numberOrFallback(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function getCurrentCaseId() {
    if (typeof window.getBaseCaseIndex === 'function') {
      const index = window.getBaseCaseIndex(window.currentCase);
      if (index >= 0) return 'case' + index;
    }
    if (Array.isArray(window.cases) && window.currentCase) {
      const index = window.cases.indexOf(window.currentCase);
      if (index >= 0) return 'case' + index;
    }
    return 'case0';
  }

  function readCssVariable(name, fallback) {
    try {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readCursorState() {
    const x = numberOrFallback(window.mouseX, 0);
    const y = numberOrFallback(window.mouseY, 0);
    const px = numberOrFallback(window.pmouseX, x);
    const py = numberOrFallback(window.pmouseY, y);
    const vx = x - px;
    const vy = y - py;
    return {
      x: x,
      y: y,
      px: px,
      py: py,
      vx: vx,
      vy: vy,
      isDown: !!window.mouseIsPressed,
      speed: Math.sqrt(vx * vx + vy * vy)
    };
  }

  function createSnapshot() {
    const config = window.config || {};
    const currentConfig = window.currentCase && window.currentCase.config ? window.currentCase.config : {};
    return {
      caseId: getCurrentCaseId(),
      themeId: document.body && document.body.classList.contains('neumorphism-mode') ? 'neumorphism' : 'glass',
      colorPalette: {
        primary: readCssVariable('--uiux-primary-color', '#ffffff'),
        accent: readCssVariable('--uiux-accent-color', '#962eff'),
        background: config.canvasBgColor || '#e1e1e1'
      },
      render: {
        particleCount: numberOrFallback(currentConfig.count, 0),
        trailAmount: numberOrFallback(currentConfig.trailLength, 0),
        lineWidth: numberOrFallback(currentConfig.size, 1),
        glowAmount: 0,
        blurAmount: 0,
        decay: 0,
        noiseAmount: 0,
        orbitJitter: 0
      },
      cursor: {
        attraction: 0,
        repulsion: 0,
        radius: 0
      },
      ink: {
        expansion: 0,
        absorption: 0,
        fade: 0
      }
    };
  }

  window.UIUXEngineStateAdapter = {
    createSnapshot: createSnapshot,
    readCursorState: readCursorState
  };
})();
