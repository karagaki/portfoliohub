// registry -> consumer -> DOM 接続確認用 probe.
// probe-safe class は既存UIを変えないために必須で、本番見た目適用ではない。
// 次工程で見た目presetを試す場合も probe-safe を残し、別 modifier で分離する。
(function () {
  "use strict";

  if (window.JARVIS_UI_REGISTRY_RUNTIME_PROBE) return;

  const PAGE_ID = "portfolio-purpose";
  const ROOT_SELECTOR = "#portfolio-purpose";
  const LAYOUT_SELECTOR = "#portfolio-purpose .workflow-stage-layout.three";
  const LIST_CARD_SELECTOR = "#portfolio-purpose .portfolio-purpose-list-card";
  const PREVIEW_SELECTOR = "#portfolio-purpose .portfolio-deliverable-preview";
  const ACTION_SELECTOR = "#portfolio-purpose .guided-action, #portfolio-purpose .guided-action-slot";
  const PURPOSE_PAGE_MAP = {
    pageId: "portfolio-purpose",
    rootSelector: ROOT_SELECTOR,
    layoutSelector: LAYOUT_SELECTOR,
    layoutClasses: ["jarvis-layout", "jarvis-layout--three-column", "jarvis-layout--comfortable", "jarvis-layout--probe-safe"],
    roles: [
      {
        role: "summary",
        selector: LIST_CARD_SELECTOR,
        dataRole: "list",
        panelClasses: ["jarvis-panel", "jarvis-panel--summary", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-summary"]
      },
      {
        role: "preview",
        selector: PREVIEW_SELECTOR,
        dataRole: "preview",
        panelClasses: ["jarvis-panel", "jarvis-panel--preview", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-preview"]
      },
      {
        role: "action",
        selector: ACTION_SELECTOR,
        dataRole: "action",
        panelClasses: ["jarvis-panel", "jarvis-panel--action", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-action"]
      }
    ]
  };
  const CURRENT_PAGE_MAP = {
    pageId: "portfolio-current",
    rootSelector: "#portfolio-current",
    layoutSelector: "#portfolio-current .workflow-stage-layout.three",
    layoutClasses: ["jarvis-layout", "jarvis-layout--three-column", "jarvis-layout--comfortable", "jarvis-layout--probe-safe"],
    roles: [
      {
        role: "summary",
        selector: "#portfolio-current .workflow-brief, #portfolio-current .workflow-brief-card",
        dataRole: "summary",
        panelClasses: ["jarvis-panel", "jarvis-panel--summary", "jarvis-panel--comfortable", "jarvis-panel--probe-safe"]
      },
      {
        role: "list",
        selector: "#portfolio-current #workflowCompareItems",
        dataRole: "list",
        panelClasses: ["jarvis-panel", "jarvis-panel--summary", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-current-list"]
      },
      {
        role: "preview",
        selector: "#portfolio-current #workflowCompareCurrent",
        dataRole: "preview",
        panelClasses: ["jarvis-panel", "jarvis-panel--preview", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-current-preview"]
      },
      {
        role: "detail",
        selector: "#portfolio-current .workflow-side-card, #portfolio-current .workflow-detail-box",
        dataRole: "detail",
        panelClasses: ["jarvis-panel", "jarvis-panel--evidence", "jarvis-panel--comfortable", "jarvis-panel--probe-safe"]
      }
    ]
  };
  const NEXT_PAGE_MAP = {
    pageId: "portfolio-next",
    rootSelector: "#portfolio-next",
    layoutSelector: "#portfolio-next .portfolio-final-layout",
    layoutClasses: ["jarvis-layout", "jarvis-layout--two-column", "jarvis-layout--comfortable", "jarvis-layout--probe-safe"],
    roles: [
      {
        role: "summary",
        selector: "#portfolio-next .portfolio-next-summary, #portfolio-next .workflow-brief[data-workflow-brief='final']",
        dataRole: "summary",
        panelClasses: ["jarvis-panel", "jarvis-panel--summary", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-next-summary"]
      },
      {
        role: "preview",
        selector: "#portfolio-next #portfolioPreview, #portfolio-next .portfolio-final-preview",
        dataRole: "preview",
        panelClasses: ["jarvis-panel", "jarvis-panel--preview", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-next-preview"]
      },
      {
        role: "output",
        selector: "#portfolio-next #portfolioOutputShelf, #portfolio-next .portfolio-output-shelf",
        dataRole: "output",
        panelClasses: ["jarvis-panel", "jarvis-panel--output", "jarvis-panel--comfortable", "jarvis-panel--probe-safe", "jarvis-panel--visual-soft-output"]
      },
      {
        role: "improvement",
        selector: "#portfolio-next .portfolio-improve-card",
        dataRole: "improvement",
        panelClasses: ["jarvis-panel", "jarvis-panel--status", "jarvis-panel--comfortable", "jarvis-panel--probe-safe"]
      }
    ]
  };
  const QUALITY_PAGE_MAP = {
    pageId: "portfolio-quality",
    rootSelector: "#portfolio-quality",
    layoutSelector: "#portfolio-quality .workflow-fulltext-layout",
    layoutClasses: [],
    roles: [
      {
        role: "summary",
        selector: "#portfolio-quality .workflow-brief-card, #portfolio-quality .workflow-brief, #portfolio-quality #captureQualitySummary",
        dataRole: "summary",
        panelClasses: ["jarvis-panel--visual-soft-quality-summary"]
      },
      {
        role: "evidence",
        selector: "#portfolio-quality .workflow-fulltext-box, #portfolio-quality .workflow-fulltext-card",
        dataRole: "evidence",
        panelClasses: ["jarvis-panel--visual-soft-quality-evidence"]
      },
      {
        role: "list",
        selector: "#portfolio-quality .workflow-range-list, #portfolio-quality .workflow-range-panel",
        dataRole: "list",
        panelClasses: ["jarvis-panel--visual-soft-quality-list"]
      },
      {
        role: "status",
        selector: "#portfolio-quality .workflow-chip, #portfolio-quality .status, #portfolio-quality .connection-pill",
        dataRole: "status",
        panelClasses: []
      }
    ]
  };
  const REVIEW_PAGE_MAP = {
    pageId: "portfolio-review",
    rootSelector: "#portfolio-review",
    layoutSelector: "#portfolio-review .workflow-review-layout, #portfolio-review .workflow-review-layout.v155-review-carousel",
    layoutClasses: [],
    roles: [
      {
        role: "summary",
        selector: "#portfolio-review #portfolioAnalysisSummary, #portfolio-review .portfolio-summary-card",
        dataRole: "summary",
        panelClasses: ["jarvis-panel--visual-soft-review-summary"]
      },
      {
        role: "list",
        selector: "#portfolio-review .workflow-review-carousel-card, #portfolio-review .workflow-review-list, #portfolio-review .workflow-review-layout",
        dataRole: "list",
        panelClasses: []
      },
      {
        role: "detail",
        selector: "#portfolio-review .workflow-review-single, #portfolio-review .workflow-detail-box, #portfolio-review .workflow-side-card",
        dataRole: "detail",
        panelClasses: []
      },
      {
        role: "action",
        selector: "#portfolio-review .workflow-review-nav, #portfolio-review .guided-action, #portfolio-review .guided-action-slot",
        dataRole: "action",
        panelClasses: []
      }
    ]
  };
  const PAGE_MAPPINGS = [PURPOSE_PAGE_MAP, NEXT_PAGE_MAP, CURRENT_PAGE_MAP, QUALITY_PAGE_MAP, REVIEW_PAGE_MAP];
  const PAGE_MAP_BY_ID = new Map(PAGE_MAPPINGS.map((pageMap) => [pageMap.pageId, pageMap]));
  const MANAGED_PAGE_IDS = new Set(PAGE_MAPPINGS.map((pageMap) => pageMap.pageId));
  const PURPOSE_LAYOUT_MAP = PURPOSE_PAGE_MAP.layoutClasses;
  const PURPOSE_ROLE_MAP = PURPOSE_PAGE_MAP.roles;
  const BOUND_FLAG = "__jarvisUiRegistryRuntimeProbeBound";
  const OBSERVER_FLAG = "__jarvisUiRegistryRuntimeProbeObserver";
  const PAGE_WRAPPED_FLAG = "__jarvisUiRegistryRuntimeProbePageWrapped";
  const RENDER_WRAPPED_FLAG = "__jarvisUiRegistryRuntimeProbeRenderWrapped";
  let mutationObserver = null;
  let observedMutationTarget = null;
  let applyBurstActive = false;

  function consumer() {
    return window.JARVIS_UI_REGISTRY_CONSUMER || null;
  }

  function pageConfig(pageId = PAGE_ID) {
    return consumer()?.getPage?.(pageId) || null;
  }

  function setAttr(el, name, value) {
    if (!el) return false;
    const next = value == null ? "" : String(value);
    if (el.getAttribute(name) === next) return false;
    el.setAttribute(name, next);
    return true;
  }

  function addClasses(el, classes) {
    if (!el) return 0;
    const list = Array.isArray(classes) ? classes : [classes];
    let applied = 0;
    for (const name of list) {
      if (!name || el.classList.contains(name)) continue;
      el.classList.add(name);
      applied += 1;
    }
    return applied;
  }

  function findTarget(mapEntry) {
    if (!mapEntry?.selector) return null;
    return document.querySelector(mapEntry.selector);
  }

  function applyClassMap(el, classes) {
    return addClasses(el, classes);
  }

  function hasOnlyMappedClasses(el, classes) {
    return !!el && Array.isArray(classes) && classes.every((cls) => el.classList.contains(cls));
  }

  function resolveTarget(selector) {
    if (!selector) return null;
    return document.querySelector(selector);
  }

  function activeManagedPageId() {
    const active = resolveTarget(".page.active")?.id || "";
    return MANAGED_PAGE_IDS.has(active) ? active : "";
  }

  function activeManagedPageRoot() {
    const activePageId = activeManagedPageId();
    const pageMap = activePageId ? PAGE_MAP_BY_ID.get(activePageId) : null;
    return pageMap ? resolveTarget(pageMap.rootSelector) : null;
  }

  function blankApplyBuckets() {
    return {
      purpose: null,
      next: null,
      current: null,
      quality: null,
      review: null
    };
  }

  function noopApplyResult(activePageId, fallbackApplied = false) {
    return {
      activePageId: activePageId || null,
      appliedPageIds: [],
      skippedPageIds: Array.from(MANAGED_PAGE_IDS),
      fallbackApplied,
      results: {},
      ok: false,
      pageId: activePageId || PAGE_ID,
      applied: false,
      mappingApplied: false,
      classes: {},
      targets: {},
      ...blankApplyBuckets()
    };
  }

  function activePageApplyResult(pageMap, mapResult, fallbackApplied = false) {
    const appliedPageIds = [pageMap.pageId];
    const skippedPageIds = Array.from(MANAGED_PAGE_IDS).filter((pageId) => pageId !== pageMap.pageId);
    return {
      activePageId: pageMap.pageId,
      appliedPageIds,
      skippedPageIds,
      fallbackApplied,
      results: {
        [pageMap.pageId]: mapResult
      },
      ok: !!mapResult?.ok,
      pageId: pageMap.pageId,
      applied: !!mapResult?.applied,
      mappingApplied: !!mapResult?.ok,
      classes: {
        [pageMap.pageId]: mapResult?.classes || {}
      },
      targets: {
        [pageMap.pageId]: mapResult?.targets || {}
      },
      ...blankApplyBuckets(),
      [pageMap.pageId === PURPOSE_PAGE_MAP.pageId ? "purpose" :
        pageMap.pageId === NEXT_PAGE_MAP.pageId ? "next" :
        pageMap.pageId === CURRENT_PAGE_MAP.pageId ? "current" :
        pageMap.pageId === QUALITY_PAGE_MAP.pageId ? "quality" :
        "review"]: mapResult
    };
  }

  function fallbackApplyResult(resultsByPage, fallbackApplied = true) {
    const appliedPageIds = PAGE_MAPPINGS.filter((pageMap) => !!resultsByPage[pageMap.pageId]?.applied).map((pageMap) => pageMap.pageId);
    const skippedPageIds = PAGE_MAPPINGS.filter((pageMap) => !resultsByPage[pageMap.pageId]?.applied).map((pageMap) => pageMap.pageId);
    return {
      activePageId: null,
      appliedPageIds,
      skippedPageIds,
      fallbackApplied,
      results: resultsByPage,
      ok: PAGE_MAPPINGS.every((pageMap) => !!resultsByPage[pageMap.pageId]?.ok),
      pageId: PAGE_ID,
      applied: PAGE_MAPPINGS.every((pageMap) => !!resultsByPage[pageMap.pageId]?.applied),
      mappingApplied: PAGE_MAPPINGS.every((pageMap) => !!resultsByPage[pageMap.pageId]?.ok),
      classes: Object.fromEntries(PAGE_MAPPINGS.map((pageMap) => [pageMap.pageId, resultsByPage[pageMap.pageId]?.classes || {}])),
      targets: Object.fromEntries(PAGE_MAPPINGS.map((pageMap) => [pageMap.pageId, resultsByPage[pageMap.pageId]?.targets || {}])),
      purpose: resultsByPage[PURPOSE_PAGE_MAP.pageId] || null,
      next: resultsByPage[NEXT_PAGE_MAP.pageId] || null,
      current: resultsByPage[CURRENT_PAGE_MAP.pageId] || null,
      quality: resultsByPage[QUALITY_PAGE_MAP.pageId] || null,
      review: resultsByPage[REVIEW_PAGE_MAP.pageId] || null
    };
  }

  function applyAllManagedPages() {
    const resultsByPage = {};
    for (const pageMap of PAGE_MAPPINGS) {
      resultsByPage[pageMap.pageId] = applyMap(pageMap);
    }
    return fallbackApplyResult(resultsByPage, true);
  }

  function applyMap(pageMap) {
    if (!pageMap) return null;
    const root = resolveTarget(pageMap.rootSelector);
    const cfg = pageConfig(pageMap.pageId);
    if (!root) {
      return {
        pageId: pageMap.pageId,
        ok: false,
        applied: false,
        targets: {}
      };
    }

    const layoutEl = resolveTarget(pageMap.layoutSelector);
    const layout = cfg?.primaryLayout || "";
    const roles = Array.isArray(cfg?.mainRoles) ? cfg.mainRoles.join(",") : "";
    const currentPreviewTarget = pageMap.pageId === PAGE_ID ? resolveTarget("#portfolio-current #workflowCompareCurrent") : null;
    const touched = [];

    if (pageMap.pageId === PAGE_ID || pageMap.pageId === REVIEW_PAGE_MAP.pageId) {
      touched.push(setAttr(root, "data-jarvis-ui-page", pageMap.pageId));
      touched.push(setAttr(root, "data-jarvis-ui-layout", layout));
      touched.push(setAttr(root, "data-jarvis-ui-roles", roles));
      touched.push(setAttr(root, "data-jarvis-ui-probe", "true"));
    } else {
      touched.push(setAttr(root, "data-jarvis-ui-page", pageMap.pageId));
      touched.push(setAttr(root, "data-jarvis-ui-layout", layout));
      touched.push(setAttr(root, "data-jarvis-ui-probe", "true"));
    }

    const layoutTargetCount = layoutEl ? addClasses(layoutEl, pageMap.layoutClasses) : 0;
    if (layoutEl) {
      setAttr(layoutEl, "data-jarvis-ui-layout", layout);
      setAttr(layoutEl, "data-jarvis-ui-probe", "true");
    }
    const rootTargetCount = addClasses(root, pageMap.layoutClasses);

    const roleCounts = {};
    for (const roleEntry of pageMap.roles) {
      const target = resolveTarget(roleEntry.selector);
      if (!target) continue;
      touched.push(setAttr(target, "data-jarvis-ui-role", roleEntry.dataRole));
      touched.push(setAttr(target, "data-jarvis-ui-probe", "true"));
      roleCounts[roleEntry.role] = addClasses(target, roleEntry.panelClasses);
      if (pageMap.pageId === PAGE_ID && roleEntry.role === "detail" && target !== currentPreviewTarget) {
        roleCounts[roleEntry.role] += addClasses(target, ["jarvis-panel--visual-soft-current-detail"]);
      }
    }

    return {
      pageId: pageMap.pageId,
      ok: true,
      applied: true,
      targets: {
        root: !!root,
        layout: !!layoutEl,
        roles: Object.fromEntries(pageMap.roles.map((entry) => [entry.role, !!resolveTarget(entry.selector)]))
      },
      classes: {
        root: rootTargetCount,
        layout: layoutTargetCount,
        ...roleCounts
      },
      touched: touched.filter(Boolean).length
    };
  }

  function applyPurposeProbe() {
    const activePageId = activeManagedPageId();
    if (activePageId) {
      const pageMap = PAGE_MAP_BY_ID.get(activePageId);
      const activeResult = pageMap ? applyMap(pageMap) : null;
      return activeResult ? activePageApplyResult(pageMap, activeResult, false) : noopApplyResult(activePageId, false);
    }

    const fallbackAllowed = !resolveTarget(".page.active");
    if (!fallbackAllowed) {
      return noopApplyResult("", false);
    }

    return applyAllManagedPages();
  }

  function validateProbe() {
    applyAllManagedPages();
    const purposeRoot = resolveTarget(PURPOSE_PAGE_MAP.rootSelector);
    const nextRoot = resolveTarget(NEXT_PAGE_MAP.rootSelector);
    const currentRoot = resolveTarget(CURRENT_PAGE_MAP.rootSelector);
    const qualityRoot = resolveTarget(QUALITY_PAGE_MAP.rootSelector);
    const reviewRoot = resolveTarget(REVIEW_PAGE_MAP.rootSelector);
    const cfg = pageConfig();
    const qualityCfg = pageConfig(QUALITY_PAGE_MAP.pageId);
    const reviewCfg = pageConfig(REVIEW_PAGE_MAP.pageId);
    const expectedLayout = cfg?.primaryLayout || "";
    const qualityExpectedLayout = qualityCfg?.primaryLayout || "";
    const reviewExpectedLayout = reviewCfg?.primaryLayout || "";
    const expectedRoles = Array.isArray(cfg?.mainRoles) ? cfg.mainRoles.join(",") : "";
    const reviewExpectedRoles = Array.isArray(reviewCfg?.mainRoles) ? reviewCfg.mainRoles.join(",") : "";
    const purposeLayoutTargets = PURPOSE_PAGE_MAP.roles ? {
      root: !!purposeRoot && hasOnlyMappedClasses(purposeRoot, PURPOSE_PAGE_MAP.layoutClasses),
      layout: !!resolveTarget(PURPOSE_PAGE_MAP.layoutSelector) && hasOnlyMappedClasses(resolveTarget(PURPOSE_PAGE_MAP.layoutSelector), PURPOSE_PAGE_MAP.layoutClasses)
    } : {};
    const purposeRoleTargets = Object.fromEntries(PURPOSE_PAGE_MAP.roles.map((entry) => {
      const target = resolveTarget(entry.selector);
      return [entry.role, !!target && hasOnlyMappedClasses(target, entry.panelClasses)];
    }));
    const nextLayoutTargets = {
      root: !!nextRoot && hasOnlyMappedClasses(nextRoot, NEXT_PAGE_MAP.layoutClasses),
      layout: !!resolveTarget(NEXT_PAGE_MAP.layoutSelector) && hasOnlyMappedClasses(resolveTarget(NEXT_PAGE_MAP.layoutSelector), NEXT_PAGE_MAP.layoutClasses)
    };
    const nextRoleTargets = Object.fromEntries(NEXT_PAGE_MAP.roles.map((entry) => {
      const target = resolveTarget(entry.selector);
      return [entry.role, !!target && hasOnlyMappedClasses(target, entry.panelClasses)];
    }));
    const nextRequiredRoleTargets = {
      summary: nextRoleTargets.summary,
      preview: nextRoleTargets.preview,
      improvement: nextRoleTargets.improvement
    };
    const currentLayoutTargets = {
      root: !!currentRoot && hasOnlyMappedClasses(currentRoot, CURRENT_PAGE_MAP.layoutClasses),
      layout: !!resolveTarget(CURRENT_PAGE_MAP.layoutSelector) && hasOnlyMappedClasses(resolveTarget(CURRENT_PAGE_MAP.layoutSelector), CURRENT_PAGE_MAP.layoutClasses)
    };
    const currentRoleTargets = Object.fromEntries(CURRENT_PAGE_MAP.roles.map((entry) => {
      const target = resolveTarget(entry.selector);
      return [entry.role, !!target && hasOnlyMappedClasses(target, entry.panelClasses)];
    }));
    const nextOutputTarget = resolveTarget("#portfolio-next #portfolioOutputShelf, #portfolio-next .portfolio-output-shelf");
    const nextSummaryTarget = resolveTarget("#portfolio-next .portfolio-next-summary, #portfolio-next .workflow-brief[data-workflow-brief='final']");
    const currentSummaryTarget = resolveTarget("#portfolio-current .workflow-brief, #portfolio-current .workflow-brief-card");
    const currentListTarget = resolveTarget("#portfolio-current #workflowCompareItems");
    const currentPreviewTarget = resolveTarget("#portfolio-current #workflowCompareCurrent");
    const currentDetailTarget = resolveTarget("#portfolio-current .workflow-side-card, #portfolio-current .workflow-detail-box");
    const currentDetailSameAsPreviewTarget = !!currentDetailTarget && currentDetailTarget === currentPreviewTarget;
    const currentListVisualTarget = !!currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-list");
    const currentPreviewVisualTarget = !!currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-preview");
    const currentDetailVisualTarget = !!currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-current-detail");
    const qualitySummaryTarget = resolveTarget("#portfolio-quality #captureQualitySummary, #portfolio-quality .workflow-brief-card, #portfolio-quality .workflow-brief");
    const qualityEvidenceTarget = resolveTarget("#portfolio-quality .workflow-fulltext-box, #portfolio-quality .workflow-fulltext-card");
    const qualityListTarget = resolveTarget("#portfolio-quality .workflow-range-list, #portfolio-quality .workflow-range-panel");
    const qualityStatusTarget = resolveTarget("#portfolio-quality .workflow-chip, #portfolio-quality .status, #portfolio-quality .connection-pill");
    const qualitySummaryVisualTarget = !!qualitySummaryTarget?.classList.contains("jarvis-panel--visual-soft-quality-summary");
    const qualityEvidenceVisualTarget = !!qualityEvidenceTarget?.classList.contains("jarvis-panel--visual-soft-quality-evidence");
    const qualityListVisualTarget = !!qualityListTarget?.classList.contains("jarvis-panel--visual-soft-quality-list");
    const reviewSummaryTarget = resolveTarget("#portfolio-review #portfolioAnalysisSummary, #portfolio-review .portfolio-summary-card");
    const reviewSummaryVisualTarget = !!reviewSummaryTarget?.classList.contains("jarvis-panel--visual-soft-review-summary");
    const qualityVisualSummaryTargets = !!qualityRoot &&
      qualitySummaryVisualTarget &&
      !qualityEvidenceTarget?.classList.contains("jarvis-panel--visual-soft-quality-summary") &&
      !qualityListTarget?.classList.contains("jarvis-panel--visual-soft-quality-summary") &&
      !qualityStatusTarget?.classList.contains("jarvis-panel--visual-soft-quality-summary");
    const qualityVisualEvidenceTargets = !!qualityRoot &&
      qualityEvidenceVisualTarget &&
      !qualitySummaryTarget?.classList.contains("jarvis-panel--visual-soft-quality-evidence") &&
      !qualityListTarget?.classList.contains("jarvis-panel--visual-soft-quality-evidence") &&
      !qualityStatusTarget?.classList.contains("jarvis-panel--visual-soft-quality-evidence");
    const qualityVisualListTargets = !!qualityRoot &&
      qualityListVisualTarget &&
      !qualitySummaryTarget?.classList.contains("jarvis-panel--visual-soft-quality-list") &&
      !qualityEvidenceTarget?.classList.contains("jarvis-panel--visual-soft-quality-list") &&
      !qualityStatusTarget?.classList.contains("jarvis-panel--visual-soft-quality-list");
    const qualityLayoutTargets = {
      root: !!qualityRoot &&
        qualityRoot.getAttribute("data-jarvis-ui-page") === QUALITY_PAGE_MAP.pageId &&
        qualityRoot.getAttribute("data-jarvis-ui-layout") === qualityExpectedLayout &&
        qualityRoot.getAttribute("data-jarvis-ui-probe") === "true",
      layout: !!resolveTarget(QUALITY_PAGE_MAP.layoutSelector) &&
        resolveTarget(QUALITY_PAGE_MAP.layoutSelector).getAttribute("data-jarvis-ui-layout") === qualityExpectedLayout &&
        resolveTarget(QUALITY_PAGE_MAP.layoutSelector).getAttribute("data-jarvis-ui-probe") === "true"
    };
    const qualityRoleTargets = Object.fromEntries(QUALITY_PAGE_MAP.roles.map((entry) => {
      const target = resolveTarget(entry.selector);
      return [entry.role, !!target && target.getAttribute("data-jarvis-ui-role") === entry.dataRole && target.getAttribute("data-jarvis-ui-probe") === "true"];
    }));
    const qualityVisualTargets = qualityRoot
      ? Array.from(qualityRoot.querySelectorAll('[class*="jarvis-panel--visual-soft-"]')).length === 0
      : false;
    const reviewLayoutTargets = {
      root: !!reviewRoot &&
        reviewRoot.getAttribute("data-jarvis-ui-page") === REVIEW_PAGE_MAP.pageId &&
        reviewRoot.getAttribute("data-jarvis-ui-layout") === reviewExpectedLayout &&
        reviewRoot.getAttribute("data-jarvis-ui-roles") === reviewExpectedRoles &&
        reviewRoot.getAttribute("data-jarvis-ui-probe") === "true",
      layout: !!resolveTarget(REVIEW_PAGE_MAP.layoutSelector) &&
        resolveTarget(REVIEW_PAGE_MAP.layoutSelector).getAttribute("data-jarvis-ui-layout") === reviewExpectedLayout &&
        resolveTarget(REVIEW_PAGE_MAP.layoutSelector).getAttribute("data-jarvis-ui-probe") === "true"
    };
    const reviewRoleTargets = Object.fromEntries(REVIEW_PAGE_MAP.roles.map((entry) => {
      const target = resolveTarget(entry.selector);
      return [entry.role, !!target && target.getAttribute("data-jarvis-ui-role") === entry.dataRole && target.getAttribute("data-jarvis-ui-probe") === "true"];
    }));
    const reviewVisualTargets = reviewRoot
      ? Array.from(reviewRoot.querySelectorAll('[class*="jarvis-panel--visual-soft-"]')).length === 0
      : false;
    const reviewVisualSummaryTargets = !!reviewRoot &&
      reviewSummaryVisualTarget &&
      !resolveTarget("#portfolio-review .workflow-review-carousel-card, #portfolio-review .workflow-review-list, #portfolio-review .workflow-review-layout")?.classList.contains("jarvis-panel--visual-soft-review-summary") &&
      !resolveTarget("#portfolio-review .workflow-review-single, #portfolio-review .workflow-detail-box, #portfolio-review .workflow-side-card")?.classList.contains("jarvis-panel--visual-soft-review-summary") &&
      !resolveTarget("#portfolio-review .workflow-review-nav, #portfolio-review .guided-action, #portfolio-review .guided-action-slot")?.classList.contains("jarvis-panel--visual-soft-review-summary");
    return {
      ok:
        !!window.JARVIS_UI_REGISTRY_RUNTIME_PROBE &&
        typeof window.JARVIS_UI_REGISTRY_RUNTIME_PROBE.apply === "function" &&
        typeof window.JARVIS_UI_REGISTRY_RUNTIME_PROBE.validateProbe === "function" &&
        !!purposeRoot &&
        purposeRoot.getAttribute("data-jarvis-ui-page") === PAGE_ID &&
        purposeRoot.getAttribute("data-jarvis-ui-layout") === expectedLayout &&
        purposeRoot.getAttribute("data-jarvis-ui-roles") === expectedRoles &&
        purposeRoot.getAttribute("data-jarvis-ui-probe") === "true" &&
        purposeRoot.classList.contains("jarvis-layout") &&
        purposeRoot.classList.contains("jarvis-layout--three-column") &&
        purposeRoot.classList.contains("jarvis-layout--comfortable") &&
        purposeRoot.classList.contains("jarvis-layout--probe-safe") &&
        !!nextRoot &&
        nextLayoutTargets.root &&
        nextLayoutTargets.layout &&
        !!currentRoot &&
        currentLayoutTargets.root &&
        currentLayoutTargets.layout &&
        !!qualityRoot &&
        qualityLayoutTargets.root &&
        qualityLayoutTargets.layout &&
        qualityVisualSummaryTargets &&
        qualityVisualEvidenceTargets &&
        qualityVisualListTargets &&
        !!reviewRoot &&
        reviewLayoutTargets.root &&
        reviewLayoutTargets.layout,
      probeSafe:
        !!purposeRoot &&
        purposeRoot.classList.contains("jarvis-layout--probe-safe") &&
        !!document.querySelector(LIST_CARD_SELECTOR)?.classList.contains("jarvis-panel--probe-safe") &&
        !!document.querySelector(PREVIEW_SELECTOR)?.classList.contains("jarvis-panel--probe-safe") &&
        !!document.querySelector(ACTION_SELECTOR)?.classList.contains("jarvis-panel--probe-safe") &&
        !!nextRoot &&
        nextRoot.classList.contains("jarvis-layout--probe-safe") &&
        !!currentRoot &&
        currentRoot.classList.contains("jarvis-layout--probe-safe") &&
        !!qualityRoot &&
        qualityLayoutTargets.root &&
        qualityLayoutTargets.layout &&
        Object.values(qualityRoleTargets).every(Boolean) &&
        qualityVisualSummaryTargets &&
        qualityVisualEvidenceTargets &&
        qualityVisualListTargets &&
        !!reviewRoot &&
        reviewLayoutTargets.root &&
        reviewLayoutTargets.layout &&
        Object.values(reviewRoleTargets).every(Boolean) &&
        reviewVisualTargets,
      mappingApplied:
        !!purposeLayoutTargets.root &&
        !!purposeLayoutTargets.layout &&
        Object.values(purposeRoleTargets).every(Boolean) &&
        !!nextLayoutTargets.root &&
        !!nextLayoutTargets.layout &&
        Object.values(nextRequiredRoleTargets).every(Boolean) &&
        !!currentLayoutTargets.root &&
        !!currentLayoutTargets.layout &&
        Object.values(currentRoleTargets).every(Boolean) &&
        !!qualityLayoutTargets.root &&
        !!qualityLayoutTargets.layout &&
        Object.values(qualityRoleTargets).every(Boolean) &&
        qualityVisualSummaryTargets &&
        qualityVisualEvidenceTargets &&
        qualityVisualListTargets &&
        !!reviewLayoutTargets.root &&
        !!reviewLayoutTargets.layout &&
        Object.values(reviewRoleTargets).every(Boolean),
      visualPreview:
        !!document.querySelector(PREVIEW_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !document.querySelector(LIST_CARD_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !document.querySelector(ACTION_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-preview"),
      visualAction:
        !!document.querySelector(ACTION_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-action") &&
        !document.querySelector(LIST_CARD_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-action") &&
        !document.querySelector(PREVIEW_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-action"),
      visualSummary:
        !!document.querySelector(LIST_CARD_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !document.querySelector(PREVIEW_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !document.querySelector(ACTION_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-summary"),
      nextVisualOutput:
        !!nextOutputTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
        !resolveTarget("#portfolio-next .portfolio-next-summary, #portfolio-next .workflow-brief[data-workflow-brief='final']")?.classList.contains("jarvis-panel--visual-soft-output") &&
        !resolveTarget("#portfolio-next #portfolioPreview, #portfolio-next .portfolio-final-preview")?.classList.contains("jarvis-panel--visual-soft-output") &&
        !resolveTarget("#portfolio-next .portfolio-improve-card")?.classList.contains("jarvis-panel--visual-soft-output"),
      nextVisualPreview:
        !!resolveTarget("#portfolio-next #portfolioPreview, #portfolio-next .portfolio-final-preview")?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !nextOutputTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !nextSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !resolveTarget("#portfolio-next .portfolio-improve-card")?.classList.contains("jarvis-panel--visual-soft-next-preview"),
      nextVisualSummary:
        !!nextSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !nextOutputTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !resolveTarget("#portfolio-next #portfolioPreview, #portfolio-next .portfolio-final-preview")?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !resolveTarget("#portfolio-next .portfolio-improve-card")?.classList.contains("jarvis-panel--visual-soft-next-summary"),
      currentVisualModifier:
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
        currentListVisualTarget &&
        currentPreviewVisualTarget &&
        (currentDetailSameAsPreviewTarget ? !currentDetailVisualTarget : currentDetailVisualTarget) &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
        !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
        !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
        !currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
        !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-detail"),
      mapping: {
        purpose: {
          layout: purposeLayoutTargets,
          role: purposeRoleTargets
        },
        next: {
          layout: nextLayoutTargets,
          role: nextRoleTargets
        },
        current: {
          layout: currentLayoutTargets,
          role: currentRoleTargets
        },
        quality: {
          layout: qualityLayoutTargets,
          role: qualityRoleTargets
        },
        review: {
          layout: reviewLayoutTargets,
          role: reviewRoleTargets
        }
      },
      purpose: {
        ok: !!purposeRoot && purposeLayoutTargets.root && purposeLayoutTargets.layout && Object.values(purposeRoleTargets).every(Boolean),
        mappingApplied:
          !!purposeLayoutTargets.root &&
          !!purposeLayoutTargets.layout &&
          Object.values(purposeRoleTargets).every(Boolean),
        visualSummary:
          !!document.querySelector(LIST_CARD_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-summary"),
        visualPreview:
          !!document.querySelector(PREVIEW_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-preview"),
        visualAction:
          !!document.querySelector(ACTION_SELECTOR)?.classList.contains("jarvis-panel--visual-soft-action")
      },
      next: {
        ok: !!nextRoot && nextLayoutTargets.root && nextLayoutTargets.layout && Object.values(nextRequiredRoleTargets).every(Boolean),
        mappingApplied:
          !!nextLayoutTargets.root &&
          !!nextLayoutTargets.layout &&
          Object.values(nextRequiredRoleTargets).every(Boolean),
        probeSafe:
          !!nextRoot && nextRoot.classList.contains("jarvis-layout--probe-safe"),
        visualOutput:
          !!nextOutputTarget?.classList.contains("jarvis-panel--visual-soft-output"),
        visualPreview:
          !!resolveTarget("#portfolio-next #portfolioPreview, #portfolio-next .portfolio-final-preview")?.classList.contains("jarvis-panel--visual-soft-next-preview"),
        visualSummary:
          !!nextSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-summary")
      },
      current: {
        ok: !!currentRoot && currentLayoutTargets.root && currentLayoutTargets.layout && Object.values(currentRoleTargets).every(Boolean),
        mappingApplied:
          !!currentLayoutTargets.root &&
          !!currentLayoutTargets.layout &&
          Object.values(currentRoleTargets).every(Boolean),
        probeSafe:
          !!currentRoot && currentRoot.classList.contains("jarvis-layout--probe-safe"),
        visualList:
          !!currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-current-list"),
        visualPreview:
          !!currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
          (currentDetailSameAsPreviewTarget ? !currentDetailVisualTarget : !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-current-preview")),
        visualDetail:
          currentDetailSameAsPreviewTarget
            ? false
            : !!currentDetailVisualTarget &&
              !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
              !currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
              !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-detail"),
        detailSameAsPreview: currentDetailSameAsPreviewTarget,
        visualModifier: !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-summary") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-preview") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-action") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-output") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-next-summary") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
          !currentListTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
          !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
          !currentDetailTarget?.classList.contains("jarvis-panel--visual-soft-next-preview") &&
          currentListVisualTarget &&
          currentPreviewVisualTarget &&
          (currentDetailSameAsPreviewTarget
            ? !currentDetailVisualTarget
            : !!currentDetailVisualTarget &&
              !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
              !currentListTarget?.classList.contains("jarvis-panel--visual-soft-current-detail") &&
              !currentPreviewTarget?.classList.contains("jarvis-panel--visual-soft-current-detail")) &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-list") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-preview") &&
          !currentSummaryTarget?.classList.contains("jarvis-panel--visual-soft-current-detail")
      },
      quality: {
        ok: !!qualityRoot &&
          qualityLayoutTargets.root &&
          qualityLayoutTargets.layout &&
          Object.values(qualityRoleTargets).every(Boolean) &&
          qualityVisualSummaryTargets &&
          qualityVisualEvidenceTargets &&
          qualityVisualListTargets,
        mappingApplied:
          !!qualityLayoutTargets.root &&
          !!qualityLayoutTargets.layout &&
          Object.values(qualityRoleTargets).every(Boolean) &&
          qualityVisualSummaryTargets &&
          qualityVisualEvidenceTargets &&
          qualityVisualListTargets,
        probeSafe:
          !!qualityRoot &&
          qualityLayoutTargets.root &&
          qualityLayoutTargets.layout &&
          Object.values(qualityRoleTargets).every(Boolean) &&
          qualityVisualSummaryTargets &&
          qualityVisualEvidenceTargets &&
          qualityVisualListTargets,
        visualNone: qualityVisualTargets,
        visualSummary: qualityVisualSummaryTargets,
        visualEvidence: qualityVisualEvidenceTargets,
        visualList: qualityVisualListTargets
      },
      review: {
        ok: !!reviewRoot && reviewLayoutTargets.root && reviewLayoutTargets.layout && Object.values(reviewRoleTargets).every(Boolean),
        mappingApplied:
          !!reviewLayoutTargets.root &&
          !!reviewLayoutTargets.layout &&
          Object.values(reviewRoleTargets).every(Boolean),
        probeSafe:
          !!reviewRoot && reviewLayoutTargets.root && reviewLayoutTargets.layout && Object.values(reviewRoleTargets).every(Boolean),
        visualNone: false,
        visualSummary: reviewVisualSummaryTargets
      },
      pageId: PAGE_ID,
      expectedLayout,
      expectedRoles,
      actual: purposeRoot
        ? {
            page: purposeRoot.getAttribute("data-jarvis-ui-page"),
            layout: purposeRoot.getAttribute("data-jarvis-ui-layout"),
            roles: purposeRoot.getAttribute("data-jarvis-ui-roles"),
            probe: purposeRoot.getAttribute("data-jarvis-ui-probe"),
            classes: Array.from(purposeRoot.classList).filter((cls) => cls.startsWith("jarvis-"))
          }
        : null
    };
  }

  function scheduleApply() {
    if (applyBurstActive) return;
    applyBurstActive = true;
    requestAnimationFrame(() => {
      try {
        refreshMutationObserverTarget();
        applyPurposeProbe();
      } finally {
        setTimeout(() => {
          try {
            refreshMutationObserverTarget();
            applyPurposeProbe();
          } finally {
            applyBurstActive = false;
          }
        }, 80);
      }
    });
  }

  function mutationObserverOptions() {
    return {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-jarvis-ui-page",
        "data-jarvis-ui-layout",
        "data-jarvis-ui-roles",
        "data-jarvis-ui-probe"
      ]
    };
  }

  function refreshMutationObserverTarget() {
    if (!mutationObserver || !window.MutationObserver) return null;
    const nextTarget = activeManagedPageRoot() || document.body;
    if (!nextTarget || nextTarget === observedMutationTarget) return nextTarget || null;
    mutationObserver.disconnect();
    mutationObserver.observe(nextTarget, mutationObserverOptions());
    observedMutationTarget = nextTarget;
    return nextTarget;
  }

  function bindMutationObserver() {
    if (window[OBSERVER_FLAG] || !window.MutationObserver) return;
    mutationObserver = new MutationObserver(() => scheduleApply());
    const attach = () => {
      if (document.body) {
        refreshMutationObserverTarget();
      } else {
        window.setTimeout(attach, 50);
      }
    };
    window[OBSERVER_FLAG] = mutationObserver;
    attach();
  }

  function wrapLifecycleHooks() {
    const prevPage = window.page;
    if (typeof prevPage === "function" && !prevPage[PAGE_WRAPPED_FLAG]) {
      const wrappedPage = function () {
        const result = prevPage.apply(this, arguments);
        const nextId = arguments && arguments[0];
        if (MANAGED_PAGE_IDS.has(nextId)) {
          refreshMutationObserverTarget();
          scheduleApply();
        }
        return result;
      };
      wrappedPage[PAGE_WRAPPED_FLAG] = true;
      window.page = wrappedPage;
    }

    const prevRenderPurpose = window.renderPurpose;
    if (typeof prevRenderPurpose === "function" && !prevRenderPurpose[RENDER_WRAPPED_FLAG]) {
      const wrappedRenderPurpose = function () {
        const result = prevRenderPurpose.apply(this, arguments);
        refreshMutationObserverTarget();
        scheduleApply();
        return result;
      };
      wrappedRenderPurpose[RENDER_WRAPPED_FLAG] = true;
      window.renderPurpose = wrappedRenderPurpose;
    }
  }

  function bindLifecycle() {
    if (window[BOUND_FLAG]) return;
    window[BOUND_FLAG] = true;
    wrapLifecycleHooks();
    bindMutationObserver();
    document.addEventListener("DOMContentLoaded", () => {
      refreshMutationObserverTarget();
      scheduleApply();
    });
    window.addEventListener("load", () => {
      refreshMutationObserverTarget();
      scheduleApply();
    });
    document.addEventListener("jarvis:pagechange", (ev) => {
      if (MANAGED_PAGE_IDS.has(ev?.detail?.id)) {
        refreshMutationObserverTarget();
        scheduleApply();
      }
    });
  }

  const probe = Object.freeze({
    apply: applyPurposeProbe,
    validateProbe,
    bindLifecycle
  });

  window.JARVIS_UI_REGISTRY_RUNTIME_PROBE = probe;
  bindLifecycle();
  applyPurposeProbe();
})();
