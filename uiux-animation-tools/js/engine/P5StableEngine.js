(function() {
  'use strict';

  const engine = {
    id: 'p5',
    label: 'p5.js Stable',
    capabilities: {
      supportsParticles: true,
      supportsTrails: true,
      supportsGlow: false,
      supportsNoiseFlow: true,
      supportsInkExpansion: false
    },
    init: function(context) {
      this.context = context || {};
      this.initialized = true;
      this.lastState = this.context.initialState || null;
    },
    resize: function(size) {
      this.lastSize = size || null;
    },
    updateState: function(nextState) {
      this.lastState = nextState || null;
    },
    setCase: function(caseId) {
      this.lastCaseId = caseId || null;
    },
    tick: function(frameInfo) {
      this.lastFrameInfo = frameInfo || null;
    },
    pause: function() {
      this.paused = true;
    },
    resume: function() {
      this.paused = false;
    },
    dispose: function() {
      this.initialized = false;
      this.context = null;
    }
  };

  if (window.UIUXEngineRegistry) {
    window.UIUXEngineRegistry.register(engine);
  }
  window.UIUXP5StableEngine = engine;
})();
