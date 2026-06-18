(() => {
  "use strict";
  if (window.__kashinokiWorkflow02Installed) return;
  window.__kashinokiWorkflow02Installed = true;

  const PAGE_ID = "portfolio-quality";
  const VERSION = 'v1.0761';
  let timers = [];
  let token = 0;
  let running = false;
  let completed = false;
  let phase = "idle";
  let pendingRun = 0;
  let lastActive = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pageEl = () => document.getElementById(PAGE_ID);
  const active = () => !!pageEl()?.classList.contains("active");

  function restartTitleUnderline(page) {
    if (!page) return;
    page.classList.remove("workflow-title-animate");
    void page.offsetWidth;
    page.classList.add("workflow-title-animate");
  }

  function setVersion() {
    window.KASHINOKI_WORKFLOW_PAGES = window.KASHINOKI_WORKFLOW_PAGES || {};
    window.KASHINOKI_WORKFLOW_PAGES["02"] = {
      id: PAGE_ID,
      title: "使える範囲を確認",
      sequenceOwner: "assets/workflow/workflow-02.js",
      cssOwner: "assets/workflow/workflow-02.css",
      sequencePolicy: "02 entry sequence reveals STEP, count cards, text/range panels, range items, and action panel in order; filter clicks do not restart the entry sequence",
      version: VERSION
    };
  }

  function clearTimers() {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
    if (pendingRun) {
      clearTimeout(pendingRun);
      pendingRun = 0;
    }
  }

  function after(delaySeconds, fn) {
    const localToken = token;
    const id = setTimeout(() => {
      if (localToken !== token || !active()) return;
      fn();
    }, Math.max(0, delaySeconds * 1000));
    timers.push(id);
    return id;
  }

  function ensureStepGuide() {
    const page = pageEl();
    if (!page) return null;
    let guide = $(".workflow-step-guide", page);
    if (!guide) {
      const heading = $(".heading", page);
      if (!heading) return null;
      guide = document.createElement("div");
      guide.className = "workflow-step-guide workflow02-step-intro";
      heading.insertAdjacentElement("afterend", guide);
    }
    guide.classList.add("workflow02-step-intro");
    guide.innerHTML = '<span class="workflow-step-number">分ける</span><span class="workflow-step-copy"><b>会話から集めた中身を確かめます</b><small>ChatGPT / User のやり取りから、仕様・失敗・禁止条件の素材を拾えているか確認します。</small></span>';
    return guide;
  }

  function stepTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      $(".workflow-step-guide .workflow-step-number", page),
      $(".workflow-step-guide .workflow-step-copy > b", page),
      $(".workflow-step-guide .workflow-step-copy > small", page)
    ].filter(Boolean);
  }

  function countTargets() {
    const page = pageEl();
    if (!page) return [];
    return $$("#captureQualitySummary .workflow-brief-card", page);
  }

  function chatHeaderTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      $("#captureQualityList .presentation-chat-card .presentation-card-heading > span", page),
      $("#captureQualityList .presentation-chat-card .presentation-card-heading > h3", page),
      $("#captureQualityList .presentation-chat-card .presentation-card-heading > p", page),
      $("#captureQualityList .presentation-chat-card .presentation-chat-thread", page)
    ].filter(Boolean);
  }

  function editorTargets() {
    const page = pageEl();
    if (!page) return [];
    const editor = $("#captureQualityList .presentation-extract-card.kashinoki-v449-editor-panel", page)
      || $("#captureQualityList .presentation-extract-card", page);
    if (!editor) return [];
    return [
      $(".presentation-card-heading > span", editor),
      $(".presentation-card-heading > h3", editor),
      ...$$("[data-quality02-category-picks] [data-quality02-pick-category]", editor),
      $(".kashinoki-v492-inline-filter-title", editor),
      ...$$(".kashinoki-v449-mode-row .kashinoki-filter-button", editor),
      $(".kashinoki-v449-opacity-row", editor)
    ].filter(Boolean);
  }

  function contentTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      ...chatHeaderTargets(),
      ...editorTargets(),
      $("#captureQualityList .workflow-fulltext-card > h3", page),
      $("#captureQualityList .workflow-fulltext-card > p", page),
      $("#captureQualityList .workflow-fulltext-card .workflow-fulltext-box", page),
      $("#captureQualityList .workflow-range-panel > h3", page),
      $("#captureQualityList .workflow-range-panel > p", page),
      $("#captureQualityList .workflow-range-panel .workflow-filter-note", page),
      $("#captureQualityList .workflow-range-list", page),
      ...$$("#captureQualityList .workflow-range-item", page)
    ].filter(Boolean);
  }

  function actionTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      $(".guided-action-slot .guided-action-copy > label", page),
      $(".guided-action-slot .guided-action-copy > b", page),
      $(".guided-action-slot .guided-action-copy > p", page),
      $(".guided-action-slot .guided-action > .btn.primary", page),
      $(".guided-action-slot .guided-action > .workflow-secondary-link", page)
    ].filter(Boolean);
  }

  function allTargets() {
    return [...stepTargets(), ...countTargets(), ...contentTargets(), ...actionTargets()];
  }

  function markTargets() {
    allTargets().forEach((el) => el.classList.add("jv02-target"));
  }

  function hideAll() {
    const page = pageEl();
    if (!page) return;
    page.classList.add("jv02-page", "jv02-running");
    page.classList.remove("jv02-complete", "guide-show-all", "workflow-animate", "workflow-title-animate");
    markTargets();
    allTargets().forEach((el) => el.classList.remove("jv02-visible"));
    /* v752: STEP2へ入った直後に最終値が一瞬見えるのを防ぐ。
       カード表示前に分類ブリッジ側のカウントDOMも必ず0へ戻す。 */
    try {
      if (window.KashinoKiClassificationBridge02 && typeof window.KashinoKiClassificationBridge02.prepareCountsInitialZero === "function") {
        window.KashinoKiClassificationBridge02.prepareCountsInitialZero();
      } else if (typeof window.resetQualityCounts === "function") {
        window.resetQualityCounts();
      }
    } catch (_) {}
  }

  function show(el) {
    if (!el || !active()) return;
    pageEl()?.classList.remove("workflow-animate");
    el.classList.add("jv02-target");
    requestAnimationFrame(() => {
      if (active()) el.classList.add("jv02-visible");
    });
  }

  function phaseAtLeast(name) {
    const order = { idle: 0, top: 1, count: 2, content: 3, action: 4, complete: 5 };
    return (order[phase] || 0) >= (order[name] || 0);
  }

  function revealForCurrentPhase() {
    const page = pageEl();
    if (!page || !active()) return;
    page.classList.add("jv02-page");
    page.classList.remove("workflow-animate");
    markTargets();
    if (page.classList.contains("guide-show-all") || completed || phaseAtLeast("complete")) {
      allTargets().forEach((el) => el.classList.add("jv02-visible"));
      return;
    }
    if (phaseAtLeast("top")) stepTargets().forEach(show);
    if (phaseAtLeast("count")) countTargets().forEach(show);
    if (phaseAtLeast("content")) contentTargets().forEach(show);
    if (phaseAtLeast("action")) actionTargets().forEach(show);
  }

  function showAll() {
    clearTimers();
    token++;
    running = false;
    completed = true;
    phase = "complete";
    ensureStepGuide();
    markTargets();
    allTargets().forEach((el) => el.classList.add("jv02-visible"));
    const page = pageEl();
    if (page) {
      page.classList.add("jv02-page", "jv02-complete", "guide-show-all");
      page.classList.remove("jv02-running", "workflow-animate");
    }
    if (typeof window.finishQualityCounts === "function") window.finishQualityCounts();
  }

  function run(force = false) {
    const page = pageEl();
    if (!page || !active()) return;
    if (!force && running && !completed) return;
    clearTimers();
    token++;
    running = true;
    completed = false;
    phase = "top";
    ensureStepGuide();
    hideAll();
    restartTitleUnderline(page);

    after(0.08, () => show(stepTargets()[0]));
    after(0.26, () => show(stepTargets()[1]));
    after(0.44, () => show(stepTargets()[2]));

    const COUNT_CARD_START = 0.78;
    const COUNT_CARD_STAGGER = 0.30;
    const COUNT_NUMBER_START = 2.16;
    const CONTENT_START = 2.58;

    after(0.74, () => { phase = "count"; });
    countTargets().forEach((el, i) => after(COUNT_CARD_START + i * COUNT_CARD_STAGGER, () => show(el)));
    after(COUNT_NUMBER_START, () => {
      if (typeof window.animateQualityCounts === "function") window.animateQualityCounts();
    });

    after(CONTENT_START, () => { phase = "content"; show(chatHeaderTargets()[0]); });
    after(CONTENT_START + 0.26, () => show(chatHeaderTargets()[1]));
    after(CONTENT_START + 0.52, () => show(chatHeaderTargets()[2]));
    after(CONTENT_START + 0.86, () => show(chatHeaderTargets()[3]));

    const EDITOR_START = CONTENT_START + 1.18;
    after(EDITOR_START, () => show(editorTargets()[0]));
    after(EDITOR_START + 0.24, () => show(editorTargets()[1]));
    for (let i = 0; i < 10; i++) after(EDITOR_START + 0.54 + i * 0.10, () => show($$("#captureQualityList .presentation-extract-card [data-quality02-category-picks] [data-quality02-pick-category]", pageEl())[i]));
    after(EDITOR_START + 1.72, () => show($("#captureQualityList .presentation-extract-card .kashinoki-v492-inline-filter-title", pageEl())));
    after(EDITOR_START + 1.94, () => show($$("#captureQualityList .presentation-extract-card .kashinoki-v449-mode-row .kashinoki-filter-button", pageEl())[0]));
    after(EDITOR_START + 2.08, () => show($$("#captureQualityList .presentation-extract-card .kashinoki-v449-mode-row .kashinoki-filter-button", pageEl())[1]));
    after(EDITOR_START + 2.28, () => show($("#captureQualityList .presentation-extract-card .kashinoki-v449-opacity-row", pageEl())));

    after(CONTENT_START + 3.72, () => show($("#captureQualityList .workflow-fulltext-card > h3", pageEl())));
    after(CONTENT_START + 3.96, () => show($("#captureQualityList .workflow-fulltext-card > p", pageEl())));
    after(CONTENT_START + 4.24, () => show($("#captureQualityList .workflow-fulltext-card .workflow-fulltext-box", pageEl())));
    after(CONTENT_START + 4.64, () => show($("#captureQualityList .workflow-range-panel > h3", pageEl())));
    after(CONTENT_START + 4.90, () => show($("#captureQualityList .workflow-range-panel > p", pageEl())));
    after(CONTENT_START + 5.16, () => show($("#captureQualityList .workflow-range-panel .workflow-filter-note", pageEl())));
    after(CONTENT_START + 5.42, () => show($("#captureQualityList .workflow-range-list", pageEl())));
    for (let i = 0; i < 6; i++) after(CONTENT_START + 5.64 + i * 0.12, () => show($$("#captureQualityList .workflow-range-item", pageEl())[i]));

    const ACTION_START = EDITOR_START + 2.72;
    after(ACTION_START, () => { phase = "action"; show(actionTargets()[0]); });
    after(ACTION_START + 0.20, () => show(actionTargets()[1]));
    after(ACTION_START + 0.40, () => show(actionTargets()[2]));
    after(ACTION_START + 0.66, () => { show(actionTargets()[3]); show(actionTargets()[4]); });
    after(ACTION_START + 1.04, () => {
      const current = pageEl();
      if (!current || !active()) return;
      phase = "complete";
      running = false;
      completed = true;
      current.classList.add("jv02-complete");
      current.classList.remove("jv02-running", "workflow-animate");
    });
  }

  function scheduleRun(force = true) {
    if (pendingRun) clearTimeout(pendingRun);
    /* v752: 120ms待つと、active化直後の静的表示が先に描画され、
       その後で消えてフェードインする。ページ切替と同一タスク内で
       02の非表示初期化を行うため0msへ変更する。 */
    pendingRun = setTimeout(() => {
      pendingRun = 0;
      if (active()) run(force);
    }, 0);
  }

  function resetOnExit() {
    clearTimers();
    token++;
    running = false;
    completed = false;
    phase = "idle";
    if (typeof window.cancelQualityCounts === "function") window.cancelQualityCounts();
    const page = pageEl();
    if (page) {
      page.classList.remove("jv02-running", "jv02-complete", "guide-show-all", "workflow-animate", "workflow-title-animate");
      allTargets().forEach((el) => el.classList.remove("jv02-visible"));
    }
  }

  function afterFilterRender() {
    requestAnimationFrame(() => {
      revealForCurrentPhase();
      requestAnimationFrame(revealForCurrentPhase);
    });
  }
  window.afterFilterRender = afterFilterRender;

  function wrapFilter() {
    if (typeof window.setQualityFilter === "function" && !window.setQualityFilter.__kashinokiWorkflow02Wrapped) {
      const original = window.setQualityFilter;
      window.setQualityFilter = function(...args) {
        const result = original.apply(this, args);
        if (active()) afterFilterRender();
        return result;
      };
      window.setQualityFilter.__kashinokiWorkflow02Wrapped = true;
    }
  }

  function watchActive() {
    const isActive = active();
    if (isActive && !lastActive) {
      lastActive = true;
      scheduleRun(true);
    } else if (!isActive && lastActive) {
      lastActive = false;
      resetOnExit();
    }
  }

  const oldPage = window.page;
  if (typeof oldPage === "function" && !oldPage.__kashinokiWorkflow02Wrapped) {
    window.page = function(...args) {
      const wasActive = active();
      const result = oldPage.apply(this, args);
      const target = String(args?.[0] || "");
      if (target === PAGE_ID || target.includes(PAGE_ID)) scheduleRun(true);
      else if (wasActive) resetOnExit();
      return result;
    };
    window.page.__kashinokiWorkflow02Wrapped = true;
  }

  document.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.(".guide-control-button");
    if (!btn || !active()) return;
    if (btn.classList.contains("show-all") || (btn.textContent || "").includes("すべて")) setTimeout(showAll, 0);
    if (btn.classList.contains("replay") || (btn.textContent || "").includes("再生")) setTimeout(() => run(true), 0);
  }, true);

  document.addEventListener("DOMContentLoaded", () => { setVersion(); ensureStepGuide(); wrapFilter(); watchActive(); if (active()) scheduleRun(true); });
  window.addEventListener("load", () => { setVersion(); wrapFilter(); watchActive(); if (active()) scheduleRun(true); });
  setInterval(() => { wrapFilter(); watchActive(); }, 220);
  setVersion();
})();
