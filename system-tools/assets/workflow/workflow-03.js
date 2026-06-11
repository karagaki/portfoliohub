(function(){
  'use strict';
  // v644: 03 page legacy workflow animation disabled.
  // 現行03は assets/kashinoki03-fixed-panel.js が表示正本。
  // 旧 workflow-03.js は旧DOM向けで、03入場時のチカつき・再描画干渉を避けるため no-op 化。
  try {
    window.__kashinokiWorkflow03LegacyDisabled = true;
  } catch (e) {}
})();
