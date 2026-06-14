(function() {
  'use strict';

  function getCanvasHost() {
    return document.getElementById('canvas-container')
      || document.querySelector('main')
      || document.body;
  }

  function makeContext() {
    const adapter = window.UIUXEngineStateAdapter;
    return {
      canvasHost: getCanvasHost(),
      initialState: adapter && typeof adapter.createSnapshot === 'function' ? adapter.createSnapshot() : {},
      readCursor: adapter && typeof adapter.readCursorState === 'function' ? adapter.readCursorState : function() {
        return { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, isDown: false, speed: 0 };
      },
      requestRenderMode: 'continuous'
    };
  }

  function bootstrap() {
    if (!window.UIUXEngineRegistry) return null;
    if (window.UIUXEngineRegistry.getActive()) return window.UIUXEngineRegistry.getActive();
    if (!window.UIUXEngineRegistry.get('p5')) return null;
    return window.UIUXEngineRegistry.activate('p5', makeContext());
  }

  window.UIUXEngineBootstrap = {
    bootstrap: bootstrap,
    makeContext: makeContext
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
