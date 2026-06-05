(() => {
  "use strict";
  if (window.__jarvisWorkflow03Installed) return;
  window.__jarvisWorkflow03Installed = true;

  const PAGE_ID = "portfolio-review";
  const VERSION = "v327 / 03入場シーケンス安定化・フィルター非リセット";
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
    window.JARVIS_WORKFLOW_PAGES = window.JARVIS_WORKFLOW_PAGES || {};
    window.JARVIS_WORKFLOW_PAGES["03"] = {
      id: PAGE_ID,
      title: "内容を分ける",
      sequenceOwner: "assets/workflow/workflow-03.js",
      cssOwner: "assets/workflow/workflow-03.css",
      sequencePolicy: "03 entry sequence reveals STEP, count cards, filters, three content panels, and action panel in order; filter/navigation clicks do not restart the entry sequence",
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
      guide.className = "workflow-step-guide workflow03-step-intro";
      heading.insertAdjacentElement("afterend", guide);
    }
    guide.classList.add("workflow03-step-intro");
    guide.innerHTML = '<span class="workflow-step-number">分ける</span><span class="workflow-step-copy"><b>分解結果と分類を確認します</b><small>意味単位へ分けた内容を確認し、分類違いは右側で直します。</small></span>';
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
    return $$("#portfolioAnalysisSummary .portfolio-summary-card", page);
  }

  function contentTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      ...$$(".workflow-filter-row > *", page),
      $("#captureCandidateList .workflow-context-mini > h3", page),
      $("#captureCandidateList .workflow-context-mini > p", page),
      $("#captureCandidateList .workflow-context-mini .workflow-fulltext-box", page),
      $("#captureCandidateList .workflow-context-mini .workflow-secondary-link", page),
      $("#captureCandidateList .workflow-review-carousel-card .workflow-review-carousel-head", page),
      $("#captureCandidateList .workflow-review-carousel-card .workflow-review-single", page),
      $("#captureCandidateList .workflow-review-carousel-card .workflow-review-context-note", page),
      $("#captureCandidateList .workflow-side-card > h3", page),
      $("#captureCandidateList .workflow-side-card > p", page),
      ...$$("#captureCandidateList .workflow-side-card .workflow-class-row", page),
      $("#captureCandidateList .workflow-side-card .workflow-detail-box", page)
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
    allTargets().forEach((el) => el.classList.add("jv03-target"));
  }

  function hideAll() {
    const page = pageEl();
    if (!page) return;
    page.classList.add("jv03-page", "jv03-running");
    page.classList.remove("jv03-complete", "guide-show-all", "workflow-animate", "workflow-title-animate");
    markTargets();
    allTargets().forEach((el) => el.classList.remove("jv03-visible"));
  }

  function show(el) {
    if (!el || !active()) return;
    pageEl()?.classList.remove("workflow-animate");
    el.classList.add("jv03-target");
    requestAnimationFrame(() => {
      if (active()) el.classList.add("jv03-visible");
    });
  }

  function phaseAtLeast(name) {
    const order = { idle: 0, top: 1, count: 2, filter: 3, left: 4, center: 5, right: 6, action: 7, complete: 8 };
    return (order[phase] || 0) >= (order[name] || 0);
  }

  function revealForCurrentPhase() {
    const page = pageEl();
    if (!page || !active()) return;
    page.classList.add("jv03-page");
    page.classList.remove("workflow-animate");
    markTargets();
    if (page.classList.contains("guide-show-all") || completed || phaseAtLeast("complete")) {
      allTargets().forEach((el) => el.classList.add("jv03-visible"));
      return;
    }
    if (phaseAtLeast("top")) stepTargets().forEach(show);
    if (phaseAtLeast("count")) countTargets().forEach(show);
    if (phaseAtLeast("filter")) $$(".workflow-filter-row > *", page).forEach(show);
    if (phaseAtLeast("left")) [$("#captureCandidateList .workflow-context-mini > h3", page), $("#captureCandidateList .workflow-context-mini > p", page), $("#captureCandidateList .workflow-context-mini .workflow-fulltext-box", page), $("#captureCandidateList .workflow-context-mini .workflow-secondary-link", page)].filter(Boolean).forEach(show);
    if (phaseAtLeast("center")) [$("#captureCandidateList .workflow-review-carousel-card .workflow-review-carousel-head", page), $("#captureCandidateList .workflow-review-carousel-card .workflow-review-single", page), $("#captureCandidateList .workflow-review-carousel-card .workflow-review-context-note", page)].filter(Boolean).forEach(show);
    if (phaseAtLeast("right")) [$("#captureCandidateList .workflow-side-card > h3", page), $("#captureCandidateList .workflow-side-card > p", page), ...$$("#captureCandidateList .workflow-side-card .workflow-class-row", page), $("#captureCandidateList .workflow-side-card .workflow-detail-box", page)].filter(Boolean).forEach(show);
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
    allTargets().forEach((el) => el.classList.add("jv03-visible"));
    const page = pageEl();
    if (page) {
      page.classList.add("jv03-page", "jv03-complete", "guide-show-all");
      page.classList.remove("jv03-running", "workflow-animate");
    }
    if (typeof window.finishReviewCounts === "function") window.finishReviewCounts();
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
      if (typeof window.animateReviewCounts === "function") window.animateReviewCounts(false);
    });

    after(CONTENT_START, () => { phase = "filter"; $$(".workflow-filter-row > *", pageEl()).forEach(show); });
    after(CONTENT_START + 0.40, () => { phase = "left"; show($("#captureCandidateList .workflow-context-mini > h3", pageEl())); });
    after(CONTENT_START + 0.66, () => show($("#captureCandidateList .workflow-context-mini > p", pageEl())));
    after(CONTENT_START + 0.92, () => show($("#captureCandidateList .workflow-context-mini .workflow-fulltext-box", pageEl())));
    after(CONTENT_START + 1.20, () => show($("#captureCandidateList .workflow-context-mini .workflow-secondary-link", pageEl())));

    after(CONTENT_START + 0.56, () => { phase = "center"; show($("#captureCandidateList .workflow-review-carousel-card .workflow-review-carousel-head", pageEl())); });
    after(CONTENT_START + 0.82, () => show($("#captureCandidateList .workflow-review-carousel-card .workflow-review-single", pageEl())));
    after(CONTENT_START + 1.26, () => show($("#captureCandidateList .workflow-review-carousel-card .workflow-review-context-note", pageEl())));

    after(CONTENT_START + 0.72, () => { phase = "right"; show($("#captureCandidateList .workflow-side-card > h3", pageEl())); });
    after(CONTENT_START + 1.00, () => show($("#captureCandidateList .workflow-side-card > p", pageEl())));
    for (let i = 0; i < 8; i++) after(CONTENT_START + 1.32 + i * 0.11, () => show($$("#captureCandidateList .workflow-side-card .workflow-class-row", pageEl())[i]));
    after(CONTENT_START + 2.30, () => show($("#captureCandidateList .workflow-side-card .workflow-detail-box", pageEl())));

    after(CONTENT_START + 2.78, () => { phase = "action"; show(actionTargets()[0]); });
    after(CONTENT_START + 2.98, () => show(actionTargets()[1]));
    after(CONTENT_START + 3.18, () => show(actionTargets()[2]));
    after(CONTENT_START + 3.44, () => { show(actionTargets()[3]); show(actionTargets()[4]); });
    after(CONTENT_START + 3.82, () => {
      const current = pageEl();
      if (!current || !active()) return;
      phase = "complete";
      running = false;
      completed = true;
      current.classList.add("jv03-complete");
      current.classList.remove("jv03-running", "workflow-animate");
    });
  }

  function scheduleRun(force = true) {
    if (pendingRun) clearTimeout(pendingRun);
    pendingRun = setTimeout(() => {
      pendingRun = 0;
      if (active()) run(force);
    }, 120);
  }

  function resetOnExit() {
    clearTimers();
    token++;
    running = false;
    completed = false;
    phase = "idle";
    if (typeof window.cancelReviewCounts === "function") window.cancelReviewCounts();
    const page = pageEl();
    if (page) {
      page.classList.remove("jv03-running", "jv03-complete", "guide-show-all", "workflow-animate", "workflow-title-animate");
      allTargets().forEach((el) => el.classList.remove("jv03-visible"));
    }
  }

  function afterFilterRender() {
    requestAnimationFrame(() => {
      revealForCurrentPhase();
      requestAnimationFrame(revealForCurrentPhase);
    });
  }

  function wrapRenderActions() {
    if (typeof window.setReviewFilter === "function" && !window.setReviewFilter.__jarvisWorkflow03Wrapped) {
      const original = window.setReviewFilter;
      window.setReviewFilter = function(...args) {
        const result = original.apply(this, args);
        if (active()) afterFilterRender();
        return result;
      };
      window.setReviewFilter.__jarvisWorkflow03Wrapped = true;
    }
    if (typeof window.stepReviewCandidate === "function" && !window.stepReviewCandidate.__jarvisWorkflow03Wrapped) {
      const original = window.stepReviewCandidate;
      window.stepReviewCandidate = function(...args) {
        const result = original.apply(this, args);
        if (active()) afterFilterRender();
        return result;
      };
      window.stepReviewCandidate.__jarvisWorkflow03Wrapped = true;
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
  if (typeof oldPage === "function" && !oldPage.__jarvisWorkflow03Wrapped) {
    window.page = function(...args) {
      const wasActive = active();
      const result = oldPage.apply(this, args);
      const target = String(args?.[0] || "");
      if (target === PAGE_ID || target.includes(PAGE_ID)) scheduleRun(true);
      else if (wasActive) resetOnExit();
      return result;
    };
    window.page.__jarvisWorkflow03Wrapped = true;
  }

  document.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.(".guide-control-button");
    if (!btn || !active()) return;
    if (btn.classList.contains("show-all") || (btn.textContent || "").includes("すべて")) setTimeout(showAll, 0);
    if (btn.classList.contains("replay") || (btn.textContent || "").includes("再生")) setTimeout(() => run(true), 0);
  }, true);

  document.addEventListener("DOMContentLoaded", () => { setVersion(); ensureStepGuide(); wrapRenderActions(); watchActive(); if (active()) scheduleRun(true); });
  window.addEventListener("load", () => { setVersion(); wrapRenderActions(); watchActive(); if (active()) scheduleRun(true); });
  setInterval(() => { wrapRenderActions(); watchActive(); }, 220);
  setVersion();
})();
