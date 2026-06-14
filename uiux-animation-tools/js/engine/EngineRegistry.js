(function() {
  'use strict';

  const registry = new Map();
  let activeEngineId = null;
  let activeEngine = null;

  function normalizeEngine(engine) {
    if (!engine || typeof engine !== 'object') {
      throw new TypeError('Engine must be an object.');
    }
    if (!engine.id || typeof engine.id !== 'string') {
      throw new TypeError('Engine.id must be a non-empty string.');
    }
    return Object.assign({
      label: engine.id,
      capabilities: {},
      init: function() {},
      resize: function() {},
      updateState: function() {},
      setCase: function() {},
      tick: function() {},
      pause: function() {},
      resume: function() {},
      dispose: function() {}
    }, engine);
  }

  function register(engine) {
    const normalized = normalizeEngine(engine);
    registry.set(normalized.id, normalized);
    return normalized;
  }

  function get(id) {
    return registry.get(id) || null;
  }

  function list() {
    return Array.from(registry.values()).map(function(engine) {
      return {
        id: engine.id,
        label: engine.label,
        capabilities: Object.assign({}, engine.capabilities || {})
      };
    });
  }

  function getActive() {
    return activeEngine;
  }

  function getActiveId() {
    return activeEngineId;
  }

  function activate(id, context) {
    const next = get(id);
    if (!next) {
      throw new Error('Unknown engine: ' + id);
    }
    if (activeEngine && activeEngine !== next && typeof activeEngine.dispose === 'function') {
      activeEngine.dispose();
    }
    activeEngine = next;
    activeEngineId = id;
    if (typeof next.init === 'function') {
      next.init(context || {});
    }
    return next;
  }

  window.UIUXEngineRegistry = {
    register: register,
    get: get,
    list: list,
    activate: activate,
    getActive: getActive,
    getActiveId: getActiveId
  };
})();
