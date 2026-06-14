(function() {
  'use strict';

  function makeStubEngine(id, label, capabilities) {
    return {
      id: id,
      label: label,
      capabilities: Object.assign({
        experimental: true,
        replacesCurrentRenderer: false,
        supportsParticles: false,
        supportsTrails: false,
        supportsGlow: false,
        supportsNoiseFlow: false,
        supportsInkExpansion: false
      }, capabilities || {}),
      init: function(context) {
        this.context = context || {};
        this.initialized = true;
        this.lastState = this.context.initialState || null;
        this.notice = 'Stub only. Current p5.js drawing is not replaced.';
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
  }

  function registerStubs() {
    if (!window.UIUXEngineRegistry) return;
    window.UIUXEngineRegistry.register(makeStubEngine('pixi-stub', 'PixiJS Experiment Stub', {
      supportsParticles: true,
      supportsTrails: true,
      supportsGlow: true,
      supportsNoiseFlow: false,
      plannedLibrary: 'PixiJS'
    }));
    window.UIUXEngineRegistry.register(makeStubEngine('webgl2-stub', 'WebGL2 Trail Experiment Stub', {
      supportsParticles: true,
      supportsTrails: true,
      supportsGlow: true,
      supportsNoiseFlow: true,
      plannedLibrary: 'WebGL2'
    }));
  }

  registerStubs();

  window.UIUXExperimentalStubEngine = {
    makeStubEngine: makeStubEngine,
    registerStubs: registerStubs
  };
})();
