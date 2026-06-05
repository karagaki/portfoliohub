(() => {
  "use strict";
  const PAGE_ID = "portfolio-next";
  const VERSION = "v286 / 06STEP強調色・テキスト順表示";
  const sequenceEngine = window.JARVIS_WORKFLOW_SEQUENCE_ENGINE || null;
  const timerStore = sequenceEngine ? sequenceEngine.createTimerStore() : null;
  let timers = [];
  let lastActive = false;
  let runToken = 0;

  const qs = sequenceEngine ? sequenceEngine.qs : function(sel, root = document) { return root.querySelector(sel); };
  const pageEl = sequenceEngine ? function() { return sequenceEngine.pageEl(PAGE_ID); } : function() { return qs(`#${PAGE_ID}`); };
  function clearTimers() {
    if (sequenceEngine) {
      sequenceEngine.clearTimerStore(timerStore);
      return;
    }
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  }

  function addTimer(delay, fn) {
    if (sequenceEngine) return sequenceEngine.addTimeout(timerStore, delay, fn);
    const id = setTimeout(fn, delay);
    timers.push(id);
    return id;
  }

  function scheduleSequenceStep(delay, token, fn) {
    if (sequenceEngine) {
      return sequenceEngine.scheduleStep({
        store: timerStore,
        delay,
        token,
        getToken: () => runToken,
        pageId: PAGE_ID,
        fn
      });
    }
    return addTimer(delay, () => {
      if (token !== runToken) return;
      const current = pageEl();
      if (!current || !current.classList.contains("active")) return;
      fn();
    });
  }

  function ensureStepGuide() {
    const page = pageEl();
    if (!page) return null;
    let guide = qs(".workflow-step-guide", page);
    if (!guide) {
      const heading = qs(".heading", page);
      if (!heading) return null;
      guide = document.createElement("div");
      guide.className = "workflow-step-guide portfolio06-step-intro";
      heading.insertAdjacentElement("afterend", guide);
    }
    guide.classList.add("portfolio06-step-intro");
    // 共通側がまだ内容を入れていない場合、06の正しい文言を補完する。
    const number = qs(".workflow-step-number", guide);
    const title = qs(".workflow-step-copy > b", guide);
    const detail = qs(".workflow-step-copy > small", guide);
    if (!number || !title || !detail) {
      guide.innerHTML = '<span class="workflow-step-number">活かす</span><span class="workflow-step-copy"><b>取り出して活かす内容を確認します</b><small>人間にもAIにも渡せる形で、次の制作へ再利用します。</small></span>';
    } else {
      number.textContent = "活かす";
      title.textContent = "取り出して活かす内容を確認します";
      detail.textContent = "次アクション・壊してはいけない条件・残課題を確定します。";
    }
    return guide;
  }

  function targets() {
    const page = pageEl();
    if (!page) return [];
    ensureStepGuide();
    return [
      qs(".workflow-step-guide .workflow-step-number", page),
      qs(".workflow-step-guide .workflow-step-copy > b", page),
      qs(".workflow-step-guide .workflow-step-copy > small", page)
    ].filter(Boolean);
  }

  function prepare() {
    const page = pageEl();
    if (!page) return [];
    page.classList.add("jv06-page");
    page.classList.remove("jv06-complete");
    ensureStepGuide();
    const list = targets();
    if (sequenceEngine) return sequenceEngine.hideTargets(list, "jv06-reveal", "jv06-visible");
    list.forEach((el) => {
      el.classList.add("jv06-reveal");
      el.classList.remove("jv06-visible");
      el.style.removeProperty("opacity");
      el.style.removeProperty("visibility");
      el.style.removeProperty("transform");
    });
    return list;
  }

  function show(el) {
    if (sequenceEngine) {
      sequenceEngine.showElement(el, "jv06-reveal", "jv06-visible");
      return;
    }
    if (!el) return;
    el.classList.add("jv06-reveal", "jv06-visible");
  }

  function showAll() {
    clearTimers();
    const page = pageEl();
    if (!page) return;
    const list = targets();
    if (sequenceEngine) {
      sequenceEngine.showAllTargets(list, "jv06-reveal", "jv06-visible");
      sequenceEngine.updatePageClasses(page, {
        remove: ["jv06-running"],
        add: ["jv06-complete", "guide-show-all"]
      });
    } else {
      list.forEach(show);
      page.classList.remove("jv06-running");
      page.classList.add("jv06-complete", "guide-show-all");
    }
  }

  function runSequence(force = false) {
    const page = pageEl();
    if (!page || !page.classList.contains("active")) return;
    if (!force && page.classList.contains("jv06-running")) return;
    clearTimers();
    const token = ++runToken;
    page.classList.remove("guide-show-all", "jv06-complete");
    page.classList.add("jv06-page", "jv06-running");
    const list = prepare();
    const reduced = sequenceEngine ? sequenceEngine.isReducedMotion() : (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced) { showAll(); return; }
    scheduleSequenceStep(70, token, () => show(list[0]));
    scheduleSequenceStep(250, token, () => show(list[1]));
    scheduleSequenceStep(430, token, () => {
      show(list[2]);
      const current = pageEl();
      if (current) {
        current.classList.remove("jv06-running");
        current.classList.add("jv06-complete");
      }
    });
  }

  function scheduleRun() {
    clearTimers();
    addTimer(90, () => runSequence(true));
  }

  function watchActiveState() {
    const page = pageEl();
    const active = !!(page && page.classList.contains("active"));
    if (active && !lastActive) {
      lastActive = true;
      prepare();
      scheduleRun();
    } else if (!active && lastActive) {
      lastActive = false;
      clearTimers();
      if (page) page.classList.remove("jv06-running", "jv06-complete", "guide-show-all");
    }
  }

  const previousPageFn = window.page;
  if (typeof previousPageFn === "function" && !previousPageFn.__jarvisWorkflow06Wrapped) {
    const wrappedPage = function(...args) {
      const result = previousPageFn.apply(this, args);
      const target = args && args.length ? String(args[0] || "") : "";
      if (target === PAGE_ID || target.includes(PAGE_ID)) {
        setTimeout(() => { prepare(); runSequence(true); }, 90);
      }
      return result;
    };
    wrappedPage.__jarvisWorkflow06Wrapped = true;
    window.page = wrappedPage;
  }

  document.addEventListener("DOMContentLoaded", () => { prepare(); watchActiveState(); });
  window.addEventListener("load", () => { prepare(); watchActiveState(); });
  document.addEventListener("jarvis:pagechange", () => setTimeout(watchActiveState, 80));
  document.addEventListener("click", (event) => {
    const button = event.target && event.target.closest ? event.target.closest(".guide-control-button") : null;
    if (!button || !qs(`#${PAGE_ID}.active`)) return;
    if (button.classList.contains("show-all") || (button.textContent || "").includes("すべて")) {
      setTimeout(showAll, 0);
    } else if (button.classList.contains("replay") || (button.textContent || "").includes("再生") || (button.textContent || "").includes("戻")) {
      setTimeout(() => runSequence(true), 0);
    }
  }, true);
  setInterval(watchActiveState, 220);

  window.JARVIS_WORKFLOW_PAGES = window.JARVIS_WORKFLOW_PAGES || {};
  window.JARVIS_WORKFLOW_PAGES["06"] = {
    id: PAGE_ID,
    title: "取り出して活かす",
    sequenceOwner: "assets/workflow/workflow-06.js",
    cssOwner: "assets/workflow/workflow-06.css",
    sequencePolicy: "STEP shell visible initially; STEP 6 text reveals in sequence; accent color follows existing accent variables",
    version: VERSION
  };

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      function setText(sel, text) { const el = document.querySelector(sel); if (el) el.textContent = text; }
      function dedupeFinalPanels() {
        const panels = [...document.querySelectorAll('#portfolio-next .workflow-finalized-panel')];
        panels.forEach((p, i) => { if (i > 0) p.remove(); });
      }
      const oldRenderNext = window.renderNext;
      if (typeof oldRenderNext === 'function') {
        window.renderNext = function () {
          const out = oldRenderNext.apply(this, arguments);
          dedupeFinalPanels();
          return out;
        };
      }
      const oldPage = window.page;
      if (typeof oldPage === 'function') {
        window.page = function (id) {
          const out = oldPage.apply(this, arguments);
          if (id === 'portfolio-next') setTimeout(dedupeFinalPanels, 0);
          return out;
        };
      }
      const boot = () => {
        setText('#versionText', VERSION);
        dedupeFinalPanels();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
      } else {
        boot();
      }
      window.addEventListener('load', dedupeFinalPanels);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      const IDS = ['portfolio-collect', 'portfolio-quality', 'portfolio-review', 'portfolio-current', 'portfolio-purpose', 'portfolio-next'];
      function escId(id) { return (window.CSS && CSS.escape) ? CSS.escape(id) : id.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
      function ensureDockSlot(id) {
        const section = document.getElementById(id);
        if (!section) return null;
        let slot = section.querySelector(':scope > .guided-action-slot.portfolio-action');
        if (!slot) slot = section.querySelector(':scope > .guided-action-slot');
        if (!slot)
        {
          slot = document.createElement('div');
          slot.className = 'guided-action-slot portfolio-action guide-icon-dock-anchor';
          const layout = section.querySelector('.portfolio-final-layout') || section.querySelector('.workflow-stage-layout') || section.querySelector('.workflow-fulltext-layout') || section.querySelector('.card:last-of-type');
          if (layout && layout.parentElement === section) layout.insertAdjacentElement('afterend', slot);
          else section.appendChild(slot);
        }
        slot.classList.add('guide-icon-dock-anchor');
        return slot;
      }
      function redock(id) {
        if (!IDS.includes(id)) return;
        const slot = ensureDockSlot(id);
        const controls = document.getElementById('floatingGuideControls');
        if (!slot || !controls) return;
        controls.dataset.targetPage = id;
        controls.classList.add('is-workflow-docked', 'is-visible');
        if (controls.parentElement !== slot) slot.appendChild(controls);
      }
      function activeId() { return document.querySelector('.page.active')?.id || ''; }
      function run() {
        const id = activeId();
        if (IDS.includes(id))
        {
          IDS.forEach(ensureDockSlot);
          if (typeof window.syncFloatingGuideControls === 'function') window.syncFloatingGuideControls(id);
          redock(id);
        }
      }
      const prevPage = window.page;
      if (typeof prevPage === 'function' && !prevPage.__jarvisV204GuideWrapped)
      {
        const wrapped = function () {
          const result = prevPage.apply(this, arguments);
          [0, 60, 160, 320].forEach(ms => setTimeout(run, ms));
          return result;
        };
        wrapped.__jarvisV204GuideWrapped = true;
        window.page = wrapped;
      }
      document.addEventListener('click', (ev) => {
        const btn = ev.target.closest?.('[data-rescue-page],button[onclick*="portfolio-"]');
        if (btn) [80, 220, 420].forEach(ms => setTimeout(run, ms));
      }, true);
      document.addEventListener('DOMContentLoaded', () => { IDS.forEach(ensureDockSlot);[0, 80, 240].forEach(ms => setTimeout(run, ms)); });
      window.addEventListener('load', () => { IDS.forEach(ensureDockSlot);[0, 120, 360].forEach(ms => setTimeout(run, ms)); });
      function setVersion() {
        const side = document.querySelector('.side-version'); if (side) side.textContent = VERSION;
        const vt = document.getElementById('versionText'); if (vt) vt.textContent = VERSION;
      }
      document.addEventListener('DOMContentLoaded', setVersion);
      window.addEventListener('load', setVersion);
      IDS.forEach(ensureDockSlot); run(); setVersion();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      const IDS = ['portfolio-collect', 'portfolio-quality', 'portfolio-review', 'portfolio-current', 'portfolio-purpose', 'portfolio-next'];
      function escId(id) { return (window.CSS && CSS.escape) ? CSS.escape(id) : id.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
      function ensureDockSlot(id) {
        const section = document.getElementById(id);
        if (!section) return null;
        let slot = section.querySelector(':scope > .guided-action-slot.portfolio-action');
        if (!slot) slot = section.querySelector(':scope > .guided-action-slot');
        if (!slot)
        {
          slot = document.createElement('div');
          slot.className = 'guided-action-slot portfolio-action guide-icon-dock-anchor';
          const layout = section.querySelector('.portfolio-final-layout') || section.querySelector('.workflow-stage-layout') || section.querySelector('.workflow-fulltext-layout') || section.querySelector('.card:last-of-type');
          if (layout && layout.parentElement === section) layout.insertAdjacentElement('afterend', slot);
          else section.appendChild(slot);
        }
        slot.classList.add('guide-icon-dock-anchor');
        return slot;
      }
      function redock(id) {
        if (!IDS.includes(id)) return;
        const slot = ensureDockSlot(id);
        const controls = document.getElementById('floatingGuideControls');
        if (!slot || !controls) return;
        controls.dataset.targetPage = id;
        controls.classList.add('is-workflow-docked', 'is-visible');
        if (controls.parentElement !== slot) slot.appendChild(controls);
      }
      function activeId() { return document.querySelector('.page.active')?.id || ''; }
      function run() {
        const id = activeId();
        if (IDS.includes(id))
        {
          IDS.forEach(ensureDockSlot);
          if (typeof window.syncFloatingGuideControls === 'function') window.syncFloatingGuideControls(id);
          redock(id);
        }
      }
      const prevPage = window.page;
      if (typeof prevPage === 'function' && !prevPage.__jarvisV204GuideWrapped)
      {
        const wrapped = function () {
          const result = prevPage.apply(this, arguments);
          [0, 60, 160, 320].forEach(ms => setTimeout(run, ms));
          return result;
        };
        wrapped.__jarvisV204GuideWrapped = true;
        window.page = wrapped;
      }
      document.addEventListener('click', (ev) => {
        const btn = ev.target.closest?.('[data-rescue-page],button[onclick*="portfolio-"]');
        if (btn) [80, 220, 420].forEach(ms => setTimeout(run, ms));
      }, true);
      document.addEventListener('DOMContentLoaded', () => { IDS.forEach(ensureDockSlot);[0, 80, 240].forEach(ms => setTimeout(run, ms)); });
      window.addEventListener('load', () => { IDS.forEach(ensureDockSlot);[0, 120, 360].forEach(ms => setTimeout(run, ms)); });
      function setVersion() {
        const side = document.querySelector('.side-version'); if (side) side.textContent = VERSION;
        const vt = document.getElementById('versionText'); if (vt) vt.textContent = VERSION;
      }
      document.addEventListener('DOMContentLoaded', setVersion);
      window.addEventListener('load', setVersion);
      IDS.forEach(ensureDockSlot); run(); setVersion();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      function setVersion() { const v = document.querySelector('#versionText'); if (v) v.textContent = VERSION; }
      function normalizeNext() {
        const page = document.querySelector('#portfolio-next');
        if (!page) return;
        page.classList.add('jarvis-next-compact-structure');
        const finalTitle = document.querySelector('#portfolioPreviewTitle');
        if (finalTitle && finalTitle.textContent.trim() === '確定予定の内容') finalTitle.textContent = '次AI作業へ渡す内容';
        const shelf = document.querySelector('#portfolioOutputShelf');
        if (shelf)
        {
          const h = shelf.querySelector('h3'); if (h) h.textContent = '今回確認する前提候補';
        }
      }
      const oldRenderNext = window.renderNext;
      if (typeof oldRenderNext === 'function')
      {
        window.renderNext = function () { const r = oldRenderNext.apply(this, arguments); normalizeNext(); return r; };
      }
      const oldPage = window.page;
      if (typeof oldPage === 'function')
      {
        window.page = function (id) { const r = oldPage.apply(this, arguments); if (id === 'portfolio-next') requestAnimationFrame(normalizeNext); return r; };
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { setVersion(); normalizeNext(); }, { once: true });
      else { setVersion(); normalizeNext(); }
      window.addEventListener('load', () => { setVersion(); normalizeNext(); });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      function setVersion() { const v = document.querySelector('#versionText'); if (v) v.textContent = VERSION; }
      function normalizeNextV186() {
        const page = document.querySelector('#portfolio-next');
        if (!page) return;
        page.querySelectorAll('.workflow-finalized-panel').forEach(el => el.remove());
        const title = document.querySelector('#portfolioPreviewTitle');
        if (title && title.textContent.trim() === '確定予定の内容') title.textContent = '次AI作業へ渡す内容';
        const shelf = document.querySelector('#portfolioOutputShelf');
        if (shelf)
        {
          const h = shelf.querySelector('h3');
          if (h) h.textContent = '今回確認する前提候補';
          const p = shelf.querySelector('p');
          if (p) p.textContent = '05で選んだ前提候補を、次のAI作業へ渡す内容として確認します。正式な正本反映は後続工程で行います。';
        }
      }
      const oldRenderNext = window.renderNext;
      if (typeof oldRenderNext === 'function')
      {
        window.renderNext = function () {
          const out = oldRenderNext.apply(this, arguments);
          normalizeNextV186();
          return out;
        };
      }
      const oldPage = window.page;
      if (typeof oldPage === 'function')
      {
        window.page = function (id) {
          const out = oldPage.apply(this, arguments);
          if (id === 'portfolio-next') requestAnimationFrame(normalizeNextV186);
          return out;
        };
      }
      document.addEventListener('click', function (ev) {
        const btn = ev.target && ev.target.closest && ev.target.closest('#portfolio-next .portfolio-final-action .btn.primary');
        if (!btn) return;
        setTimeout(normalizeNextV186, 0);
        requestAnimationFrame(normalizeNextV186);
      }, true);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { setVersion(); normalizeNextV186(); }, { once: true });
      else { setVersion(); normalizeNextV186(); }
      window.addEventListener('load', () => { setVersion(); normalizeNextV186(); });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();

  (function () {
    const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
    const install = () => {
      function setVersion() {
        const side = document.querySelector('.side-version');
        if (side) side.textContent = VERSION;
        const vt = document.getElementById('versionText');
        if (vt) vt.textContent = VERSION;
      }
      function runCommonCurrentGuide() {
        const section = document.getElementById('portfolio-current');
        if (!section || !section.classList.contains('active')) return;
        section.classList.remove('jarvis-v194-animate');
        if (typeof window.startWorkflowPageGuide === 'function')
        {
          requestAnimationFrame(() => requestAnimationFrame(() => window.startWorkflowPageGuide('portfolio-current')));
        }
      }
      const originalPage = window.page;
      if (typeof originalPage === 'function' && !originalPage.__jarvisV195CurrentGuideWrapped)
      {
        const wrapped = function (id) {
          const result = originalPage.apply(this, arguments);
          setVersion();
          if (id === 'portfolio-current') runCommonCurrentGuide();
          return result;
        };
        wrapped.__jarvisV195CurrentGuideWrapped = true;
        window.page = wrapped;
      }
      document.addEventListener('click', function (ev) {
        const btn = ev.target.closest && ev.target.closest('[data-page="portfolio-current"]');
        if (btn) setTimeout(runCommonCurrentGuide, 0);
      }, true);
      document.addEventListener('DOMContentLoaded', () => { setVersion(); runCommonCurrentGuide(); });
      window.addEventListener('load', () => { setVersion(); runCommonCurrentGuide(); });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
      install();
    }
  })();
})();
