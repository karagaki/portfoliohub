(() => {
  "use strict";
  if (window.__kashinokiWorkflow05Installed) return;
  window.__kashinokiWorkflow05Installed = true;
  const PAGE_ID = "portfolio-purpose";
  const VERSION = 'v1.0749';
  const sequenceEngine = window.KASHINOKI_WORKFLOW_SEQUENCE_ENGINE || null;
  const timerStore = sequenceEngine ? sequenceEngine.createTimerStore() : null;
  let timers = [];
  let guardTimer = null;
  let lastRunToken = 0;
  let actionPhase = "idle";
  let scheduleTimer = null;
  let pendingNavigationTimer = null;
  let isSequenceRunning = false;
  let sequenceCompleted = false;

  const qs = sequenceEngine ? sequenceEngine.qs : function(sel, root = document) { return root.querySelector(sel); };
  const qsa = sequenceEngine ? sequenceEngine.qsa : function(sel, root = document) { return Array.from(root.querySelectorAll(sel)); };
  const pageEl = sequenceEngine ? function() { return sequenceEngine.pageEl(PAGE_ID); } : function() { return qs(`#${PAGE_ID}`); };

  function clearTimers() {
    if (sequenceEngine) {
      sequenceEngine.clearTimerStore(timerStore);
      return;
    }
    timers.forEach((id) => clearTimeout(id));
    timers = [];
    if (guardTimer) {
      clearInterval(guardTimer);
      guardTimer = null;
    }
    if (scheduleTimer) {
      clearTimeout(scheduleTimer);
      scheduleTimer = null;
    }
    if (pendingNavigationTimer) {
      clearTimeout(pendingNavigationTimer);
      pendingNavigationTimer = null;
    }
  }

  function addTimer(delay, fn) {
    if (sequenceEngine) return sequenceEngine.addTimeout(timerStore, delay, fn);
    const id = setTimeout(fn, delay);
    timers.push(id);
    return id;
  }

  function scheduleSequenceStep(delay, runToken, fn) {
    if (sequenceEngine) {
      return sequenceEngine.scheduleStep({
        store: timerStore,
        delay,
        token: runToken,
        getToken: () => lastRunToken,
        pageId: PAGE_ID,
        fn
      });
    }
    return addTimer(delay, () => {
      if (runToken !== lastRunToken) return;
      const current = pageEl();
      if (!current || !current.classList.contains("active")) return;
      fn(current);
    });
  }

  function replaceScheduleTimer(delay, fn) {
    if (sequenceEngine) {
      return sequenceEngine.replaceNamedTimeout(timerStore, "scheduleRun", delay, fn);
    }
    if (scheduleTimer) clearTimeout(scheduleTimer);
    scheduleTimer = setTimeout(() => {
      scheduleTimer = null;
      fn();
    }, delay);
    return scheduleTimer;
  }

  function replacePendingNavigationTimer(delay, fn) {
    if (sequenceEngine) {
      return sequenceEngine.replaceNamedTimeout(timerStore, "pendingNavigation", delay, fn);
    }
    if (pendingNavigationTimer) clearTimeout(pendingNavigationTimer);
    pendingNavigationTimer = setTimeout(() => {
      pendingNavigationTimer = null;
      fn();
    }, delay);
    return pendingNavigationTimer;
  }

  function replaceGuardInterval(delay, fn) {
    if (sequenceEngine) {
      return sequenceEngine.replaceNamedInterval(timerStore, "actionGuard", delay, fn);
    }
    if (guardTimer) clearInterval(guardTimer);
    guardTimer = setInterval(fn, delay);
    return guardTimer;
  }

  function clearGuardInterval() {
    if (sequenceEngine) {
      sequenceEngine.clearNamedInterval(timerStore, "actionGuard");
      return;
    }
    if (guardTimer) {
      clearInterval(guardTimer);
      guardTimer = null;
    }
  }

  function ensureStepIntro() {
    const page = pageEl();
    if (!page) return null;
    let guide = qs(".workflow-step-guide", page);
    if (!guide) {
      const heading = qs(".heading", page);
      if (!heading) return null;
      guide = document.createElement("div");
      guide.className = "workflow-step-guide portfolio05-step-intro";
      heading.insertAdjacentElement("afterend", guide);
    }
    guide.classList.add("portfolio05-step-intro");
    guide.innerHTML = '<span class="workflow-step-number">活かす</span><span class="workflow-step-copy"><b>重要事項を何へ活かすか選択します</b><small>根拠がある目的のみ次の作業へ接続します。</small></span>';
    return guide;
  }

  function normalizeActionStructure() {
    const action = qs("#portfolioPurposeAction");
    if (!action) return null;
    action.classList.add("portfolio-action");
    let box = qs(":scope > .guided-action", action);
    if (!box) {
      box = document.createElement("div");
      box.className = "guided-action";
      action.appendChild(box);
    }
    let copy = qs(".guided-action-copy", box);
    if (!copy) {
      copy = document.createElement("div");
      copy.className = "guided-action-copy";
      box.insertBefore(copy, box.firstChild);
    }
    let label = qs("label", copy);
    if (!label) {
      label = document.createElement("label");
      copy.appendChild(label);
    }
    label.innerHTML = '今行う主操作 <span class="guided-action-badge">活かす</span>';

    let title = qs("b", copy);
    if (!title) {
      title = document.createElement("b");
      copy.appendChild(title);
    }
    if (!title.textContent.trim()) title.textContent = "仕様書として確認します";

    let detail = qs("p", copy);
    if (!detail) {
      detail = document.createElement("p");
      copy.appendChild(detail);
    }
    detail.textContent = "抜け・重複・反映先を確認し、06の確定前確認へ送ります。";

    let primary = qs(".btn.primary", box);
    if (!primary) {
      primary = document.createElement("button");
      primary.type = "button";
      primary.className = "btn primary";
      box.appendChild(primary);
    }
    primary.type = "button";
    primary.disabled = false;
    primary.removeAttribute("disabled");
    primary.dataset.v140Next = "portfolio-next";
    primary.dataset.workflowNext = "portfolio-next";
    primary.textContent = "選択した前提を06へ送る ➡";

    let back = qs(".workflow-secondary-link", box);
    if (!back) {
      back = document.createElement("button");
      back.type = "button";
      back.className = "workflow-secondary-link";
      box.appendChild(back);
    }
    back.textContent = "04へ戻る";
    back.onclick = (ev) => {
      ev.preventDefault();
      if (typeof window.page === "function") window.page("portfolio-current");
    };
    return action;
  }


  function forcePortfolioNextPage() {
    const next = document.getElementById("portfolio-next");
    if (!next) return false;
    qsa(".page").forEach((el) => el.classList.toggle("active", el === next));
    qsa(".nav button[data-page], [data-page]").forEach((el) => {
      const isTarget = el.getAttribute("data-page") === "portfolio-next";
      el.classList.toggle("active", isTarget);
      el.classList.toggle("is-current-page", isTarget);
    });
    const title = document.getElementById("currentViewTitle");
    if (title) title.textContent = "取り出して活かす";
    if (typeof window.renderNext === "function") {
      try { window.renderNext(); } catch (_) { }
    }
    if (typeof window.syncFloatingGuideControls === "function") {
      try { window.syncFloatingGuideControls("portfolio-next"); } catch (_) { }
    }
    // v408: 05→06遷移時もSTEPチップ位置へ自動スクロールさせない。
    return true;
  }

  function navigateToNextFromAction(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    }
    actionPhase = "complete";
    isSequenceRunning = false;
    sequenceCompleted = true;
    const current = pageEl();
    if (current) {
      current.classList.remove("jv05-running");
      current.classList.add("jv05-complete");
    }
    // 05の動的再描画やローカル直開き時のイベント差異があっても、
    // 主操作ボタンだけは必ず06へ進めるよう、既存page()とDOM直切替の両方で保証する。
    let navigated = false;
    if (typeof window.page === "function") {
      try { window.page("portfolio-next"); navigated = true; } catch (_) { }
    }
    if (!navigated) forcePortfolioNextPage();
    window.setTimeout(forcePortfolioNextPage, 40);
    window.setTimeout(forcePortfolioNextPage, 180);
  }

  function forceControlsVisible() {
    const controls = qs("#floatingGuideControls");
    const active = qs(`#${PAGE_ID}.active`);
    if (!controls || !active) return;
    controls.dataset.targetPage = PAGE_ID;
    controls.classList.add("is-visible", "is-workflow-docked");
  }

  function topTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      qs(".workflow-step-guide .workflow-step-number", page),
      qs(".workflow-step-guide .workflow-step-copy > b", page),
      qs(".workflow-step-guide .workflow-step-copy > small", page)
    ].filter(Boolean);
  }

  function actionTargets() {
    const page = pageEl();
    if (!page) return [];
    normalizeActionStructure();
    return [
      qs("#portfolioPurposeAction .guided-action-copy > label", page),
      qs("#portfolioPurposeAction .guided-action-copy > b", page),
      qs("#portfolioPurposeAction .guided-action-copy > p", page),
      qs("#portfolioPurposeAction .guided-action > .btn.primary", page),
      qs("#portfolioPurposeAction .guided-action > .workflow-secondary-link", page)
    ].filter(Boolean);
  }


  function countCards() {
    const page = pageEl();
    if (!page) return [];
    return qsa('.workflow-brief-card', page);
  }

  function stageTargets() {
    const page = pageEl();
    if (!page) return [];
    return [
      qs('.portfolio-purpose-list-card', page),
      ...qsa('#portfolioPurposes .portfolio-purpose', page),
      qs('.portfolio-deliverable-preview', page),
      qs('.portfolio-deliverable-head', page),
      qs('#portfolioEvidence', page),
      ...qsa('.portfolio-deliverable-check', page),
      qs('.outcome-check', page),
      ...qsa('.outcome-check .workflow-side-row', page)
    ].filter(Boolean);
  }

  function numericCountTargets() {
    return [
      qs('#workflowArtifactCount'),
      qs('#workflowFixCount'),
      qs('#workflowUnapprovedCount')
    ].filter(Boolean);
  }

  function resetCounts() {
    numericCountTargets().forEach((el) => {
      if (el.dataset.jv05Counting === '1') return;
      const currentRaw = (el.textContent || '').trim();
      const current = parseInt(currentRaw.replace(/[^0-9-]/g, ''), 10);
      const previous = parseInt((el.dataset.jv05Final || '0').replace(/[^0-9-]/g, ''), 10);
      const n = Number.isFinite(current) && currentRaw !== '0' ? current : (Number.isFinite(previous) ? previous : 0);
      el.dataset.jv05Final = String(n);
      if (!el.dataset.jv05Counting) el.textContent = '0';
    });
  }

  let countAnimationFrame = 0;
  function isCounting() {
    return numericCountTargets().some((el) => el.dataset.jv05Counting === '1');
  }
  window.isWorkflow05Counting = isCounting;
  function animateCounts(duration = 720) {
    if (isCounting()) return;
    const targets = numericCountTargets().map((el) => {
      const n = parseInt((el.dataset.jv05Final || el.textContent || '0').replace(/[^0-9-]/g, ''), 10);
      return { el, final: Number.isFinite(n) ? n : 0 };
    });
    if (!targets.length) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      targets.forEach((target) => {
        const { el } = target;
        const liveFinal = parseInt((el.dataset.jv05Final || String(target.final) || '0').replace(/[^0-9-]/g, ''), 10);
        const final = Number.isFinite(liveFinal) ? liveFinal : target.final;
        target.final = final;
        el.textContent = String(Math.round(final * eased));
      });
      if (t < 1) countAnimationFrame = requestAnimationFrame(step);
      else targets.forEach((target) => { const final = parseInt((target.el.dataset.jv05Final || String(target.final) || '0').replace(/[^0-9-]/g, ''), 10); target.el.textContent = String(Number.isFinite(final) ? final : target.final); delete target.el.dataset.jv05Counting; });
    };
    targets.forEach(({ el }) => { el.dataset.jv05Counting = '1'; el.textContent = '0'; });
    countAnimationFrame = requestAnimationFrame(step);
  }

  function allRevealTargets() {
    return [...topTargets(), ...countCards(), ...stageTargets(), ...actionTargets()];
  }

  function markRevealTargets() {
    const targets = allRevealTargets();
    if (sequenceEngine) return sequenceEngine.markReveal(targets, "jv05-reveal");
    targets.forEach((el) => el.classList.add("jv05-reveal"));
    return targets;
  }

  function hideTargets(targets) {
    if (sequenceEngine) {
      sequenceEngine.hideTargets(targets, "jv05-reveal", "jv05-visible");
      return;
    }
    targets.forEach((el) => {
      el.classList.add("jv05-reveal");
      el.classList.remove("jv05-visible");
      el.style.removeProperty("opacity");
      el.style.removeProperty("visibility");
      el.style.removeProperty("transform");
    });
  }

  function showElement(el) {
    if (sequenceEngine) {
      sequenceEngine.showElement(el, "jv05-reveal", "jv05-visible");
      return;
    }
    if (!el) return;
    el.classList.add("jv05-reveal", "jv05-visible");
  }

  function keepRenderedTargetsVisible() {
    const page = pageEl();
    if (!page || !page.classList.contains("active")) return;
    const targets = markRevealTargets();
    if (page.classList.contains("jv05-complete") || page.classList.contains("guide-show-all")) {
      targets.forEach((el) => el.classList.add("jv05-visible"));
      return;
    }
    topTargets().forEach((el) => { if (el.classList.contains("jv05-visible")) showElement(el); });
    countCards().forEach((el) => { if (isSequenceRunning) el.classList.add("jv05-reveal"); });
    // フィルターや成果物ボタンによる再描画では、表示済みの中段・下段を隠し直さない。
    if (isSequenceRunning) {
      stageTargets().forEach((el) => {
        if (el.classList.contains("jv05-visible")) showElement(el);
      });
      if (actionPhase === "action" || actionPhase === "complete") {
        actionTargets().forEach(showElement);
      }
    }
  }

  function afterPurposeFilterUpdate() {
    requestAnimationFrame(() => {
      keepRenderedTargetsVisible();
      requestAnimationFrame(keepRenderedTargetsVisible);
    });
  }


  function installFadingScrollbars() {
    const page = pageEl();
    if (!page) return;
    const targets = [
      qs('#portfolioPurposes', page),
      qs('#portfolioEvidence', page)
    ].filter(Boolean);
    targets.forEach((el) => {
      if (el.dataset.jv05ScrollbarFadeInstalled === '1') return;
      el.dataset.jv05ScrollbarFadeInstalled = '1';
      let hideTimer = null;
      const showWhileScrolling = () => {
        el.classList.add('jv05-scrollbar-active');
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          el.classList.remove('jv05-scrollbar-active');
          hideTimer = null;
        }, 760);
      };
      el.addEventListener('scroll', showWhileScrolling, { passive: true });
      el.addEventListener('wheel', showWhileScrolling, { passive: true });
      el.addEventListener('pointerdown', showWhileScrolling, { passive: true });
      el.addEventListener('touchmove', showWhileScrolling, { passive: true });
    });
  }

  function hideActionOnly() {
    if (actionPhase === "action" || actionPhase === "complete") return;
    const page = pageEl();
    if (!page || !page.classList.contains("active") || page.classList.contains("guide-show-all")) return;
    const targets = actionTargets();
    targets.forEach((el) => {
      el.classList.add("jv05-reveal");
      el.classList.remove("jv05-visible");
    });
  }

  function resetSequence() {
    clearTimers();
    const page = pageEl();
    if (!page) return [];
    actionPhase = "pre";
    isSequenceRunning = true;
    sequenceCompleted = false;
    page.classList.remove("jv05-complete", "guide-show-all");
    page.classList.add("jv05-running");
    ensureStepIntro();
    normalizeActionStructure();
    installFadingScrollbars();
    resetCounts();
    const targets = markRevealTargets();
    hideTargets(targets);
    forceControlsVisible();
    // 05では既存JSが#portfolioPurposeActionを遅れて再生成するため、
    // 通常再生の主操作フェーズまで限定ガードで再生成後の子要素も待機状態へ戻す。
    replaceGuardInterval(80, hideActionOnly);
    addTimer(4800, () => {
      if ((sequenceEngine ? timerStore.namedIntervals.actionGuard : guardTimer) && actionPhase !== "action" && actionPhase !== "complete") {
        hideActionOnly();
      }
    });
    return targets;
  }

  function showAll() {
    clearTimers();
    actionPhase = "complete";
    isSequenceRunning = false;
    sequenceCompleted = true;
    ensureStepIntro();
    normalizeActionStructure();
    installFadingScrollbars();
    const page = pageEl();
    if (!page) return;
    const targets = markRevealTargets();
    if (sequenceEngine) {
      sequenceEngine.showAllTargets(targets, "jv05-reveal", "jv05-visible");
      sequenceEngine.updatePageClasses(page, {
        remove: ["jv05-running"],
        add: ["jv05-complete", "guide-show-all"]
      });
    } else {
      targets.forEach((el) => el.classList.add("jv05-visible"));
      page.classList.remove("jv05-running");
      page.classList.add("jv05-complete", "guide-show-all");
    }
    numericCountTargets().forEach((el) => { if (el.dataset.jv05Final) el.textContent = el.dataset.jv05Final; });
    forceControlsVisible();
  }

  function runSequence(force = false) {
    const page = pageEl();
    if (!page || !page.classList.contains("active")) return;
    if (!force && isSequenceRunning && !sequenceCompleted) return;
    const runToken = ++lastRunToken;
    resetSequence();
    const reduced = sequenceEngine ? sequenceEngine.isReducedMotion() : (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced) {
      showAll();
      return;
    }

    // 上部STEPはページ冒頭。
    scheduleSequenceStep(80, runToken, () => showElement(topTargets()[0]));
    scheduleSequenceStep(260, runToken, () => showElement(topTargets()[1]));
    scheduleSequenceStep(440, runToken, () => showElement(topTargets()[2]));

    // 数値カードはSTEP説明後に表示し、その時点で0からカウントする。
    const COUNT_CARD_START_MS = 780;
    const COUNT_CARD_STAGGER_MS = 300;
    const COUNT_NUMBER_START_MS = 2160;
    const CONTENT_START_MS = 2580;

    scheduleSequenceStep(740, runToken, () => { actionPhase = "count"; });
    countCards().forEach((el, i) => {
      scheduleSequenceStep(COUNT_CARD_START_MS + i * COUNT_CARD_STAGGER_MS, runToken, () => showElement(el));
    });
    scheduleSequenceStep(COUNT_NUMBER_START_MS, runToken, () => {
      animateCounts();
    });

    // 中央3列は上から順に表示する。
    scheduleSequenceStep(CONTENT_START_MS, runToken, () => showElement(qs('.portfolio-purpose-list-card', pageEl())));
    scheduleSequenceStep(CONTENT_START_MS + 760, runToken, () => qsa('#portfolioPurposes .portfolio-purpose', pageEl()).forEach(showElement));
    scheduleSequenceStep(CONTENT_START_MS + 520, runToken, () => showElement(qs('.portfolio-deliverable-preview', pageEl())));
    scheduleSequenceStep(CONTENT_START_MS + 760, runToken, () => showElement(qs('.portfolio-deliverable-head', pageEl())));
    scheduleSequenceStep(CONTENT_START_MS + 1000, runToken, () => showElement(qs('#portfolioEvidence', pageEl())));
    scheduleSequenceStep(CONTENT_START_MS + 1240, runToken, () => qsa('.portfolio-deliverable-check', pageEl()).forEach(showElement));
    scheduleSequenceStep(CONTENT_START_MS + 1680, runToken, () => showElement(qs('.outcome-check', pageEl())));
    scheduleSequenceStep(CONTENT_START_MS + 1920, runToken, () => qsa('.outcome-check .workflow-side-row', pageEl()).forEach(showElement));

    // 下部主操作は最後。直前に再度DOMを正規化し、再生成された要素を新規ターゲットとして表示する。
    scheduleSequenceStep(CONTENT_START_MS + 2880, runToken, () => {
      actionPhase = "action";
      clearGuardInterval();
      normalizeActionStructure();
      const targets = actionTargets();
      hideTargets(targets);
      showElement(targets[0]);
    });
    scheduleSequenceStep(CONTENT_START_MS + 3040, runToken, () => showElement(actionTargets()[1]));
    scheduleSequenceStep(CONTENT_START_MS + 3220, runToken, () => showElement(actionTargets()[2]));
    scheduleSequenceStep(CONTENT_START_MS + 3440, runToken, () => {
      const targets = actionTargets();
      showElement(targets[3]);
      showElement(targets[4]);
      const current = pageEl();
      if (current) {
        current.classList.remove("jv05-running");
        current.classList.add("jv05-complete");
      }
      actionPhase = "complete";
      isSequenceRunning = false;
      sequenceCompleted = true;
    });
  }

  function prepareInitial() {
    ensureStepIntro();
    normalizeActionStructure();
    installFadingScrollbars();
    markRevealTargets();
    forceControlsVisible();
    const page = pageEl();
    if (page && page.classList.contains("active")) scheduleRunAfterNavigation();
  }

  function scheduleRun() {
    replaceScheduleTimer(80, () => {
      const page = pageEl();
      if (!page || !page.classList.contains("active")) {
        prepareInitial();
        return;
      }
      runSequence(true);
    });
  }

  function scheduleRunAfterNavigation() {
    // 05への入口ごとに複数イベントが発火するため、通常再生を1回にまとめる。
    // すでに05の入場シーケンスが進行・完了している場合は、フィルター再描画とみなしリセットしない。
    replacePendingNavigationTimer(220, () => {
      const page = pageEl();
      if (!page || !page.classList.contains("active") || page.classList.contains("guide-show-all")) return;
      if (isSequenceRunning || sequenceCompleted || page.classList.contains("jv05-complete")) {
        keepRenderedTargetsVisible();
        return;
      }
      runSequence(true);
    });
  }

  let lastActiveState = false;
  function watchActiveState() {
    const page = pageEl();
    const isActive = !!(page && page.classList.contains("active"));
    if (isActive && !lastActiveState) {
      lastActiveState = true;
      scheduleRunAfterNavigation();
    } else if (!isActive && lastActiveState) {
      lastActiveState = false;
      clearTimers();
      actionPhase = "idle";
      isSequenceRunning = false;
      sequenceCompleted = false;
      if (page) {
        page.classList.remove("jv05-running", "jv05-complete", "guide-show-all");
      }
    }
  }

  const previousPageFn = window.page;
  if (typeof previousPageFn === "function" && !previousPageFn.__kashinokiWorkflow05Wrapped) {
    const wrappedPage = function(...args) {
      const result = previousPageFn.apply(this, args);
      const target = args && args.length ? String(args[0] || "") : "";
      if (target === PAGE_ID || target.includes(PAGE_ID)) {
        scheduleRunAfterNavigation();
      }
      return result;
    };
    wrappedPage.__kashinokiWorkflow05Wrapped = true;
    window.page = wrappedPage;
  }

  document.addEventListener("DOMContentLoaded", () => { scheduleRun(); watchActiveState(); });
  window.addEventListener("load", () => { scheduleRun(); watchActiveState(); });
  document.addEventListener("kashinoki:pagechange", scheduleRunAfterNavigation);
  document.addEventListener("kashinoki:workflow-rendered", scheduleRunAfterNavigation);
  setInterval(watchActiveState, 180);
  document.addEventListener("click", (event) => {
    const target = event.target && event.target.closest ? event.target.closest("[data-page],button,[onclick]") : null;
    if (!target) return;
    if (target.closest("[data-outcome-filter], .kashinoki-filter-button, #portfolioPurposes .portfolio-purpose")) {
      afterPurposeFilterUpdate();
      return;
    }
    if (target.closest("[data-compare-filter], .portfolio-purpose")) return;
    const text = `${target.textContent || ""} ${target.getAttribute("data-page") || ""} ${target.getAttribute("onclick") || ""}`;
      if (text.includes(PAGE_ID) || text.includes("照合結果を確認して次へ")) {
        scheduleRunAfterNavigation();
      }
  }, true);


  document.addEventListener("click", (event) => {
    const button = event.target && event.target.closest ? event.target.closest("#portfolioPurposeAction .btn.primary") : null;
    if (!button) return;
    const text = button.textContent || "";
    const shouldGoNext = button.dataset.workflowNext === "portfolio-next" || button.dataset.v140Next === "portfolio-next" || text.includes("選択した前提を06へ送る");
    if (!shouldGoNext) return;
    navigateToNextFromAction(event);
  }, true);

  document.addEventListener("click", (event) => {
    const button = event.target && event.target.closest ? event.target.closest(".guide-control-button") : null;
    if (!button) return;
    const active = qs(`#${PAGE_ID}.active`);
    if (!active) return;
    if (button.classList.contains("show-all") || (button.textContent || "").includes("すべて")) {
      setTimeout(showAll, 0);
    } else if (button.classList.contains("replay") || (button.textContent || "").includes("再生") || (button.textContent || "").includes("戻")) {
      setTimeout(() => runSequence(true), 0);
    }
  }, true);

  window.KASHINOKI_WORKFLOW_PAGES = window.KASHINOKI_WORKFLOW_PAGES || {};
  window.KASHINOKI_WORKFLOW_PAGES["05"] = {
    id: PAGE_ID,
    title: "AIへ渡す前提を確認する",
    sequenceOwner: "assets/workflow/workflow-05.js",
    cssOwner: "assets/workflow/workflow-05.css",
    sequencePolicy: "05 entry sequence reveals STEP, count cards, three content columns, and action panel in order; filter/purpose clicks do not restart the entry sequence",
    version: VERSION
  };
})();
