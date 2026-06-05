(function () {
  "use strict";

  if (window.JARVIS_UI_REGISTRY) return;

  function ref(kind, group, preset) {
    const source =
      kind === "animation"
        ? window.JARVIS_ANIMATION_PRESETS
        : kind === "interaction"
          ? window.JARVIS_INTERACTION_PRESETS
          : kind === "binding"
            ? window.JARVIS_DATA_BINDINGS
            : null;
    return source?.groups?.[group]?.[preset] ? { kind, group, preset } : null;
  }

  const roles = {
    summary: {
      panelClass: "panel-summary",
      panelRole: "summary",
      defaultLayout: "summary-stack",
      defaultAnimation: ref("animation", "reveal", "containerThenContent"),
      defaultInteraction: ref("interaction", "button", "secondary"),
      defaultBinding: ref("binding", "text", "titleText"),
      density: "compact",
      notes: "全体要約・概要・大きな見出し向けの基準 role。"
    },
    metric: {
      panelClass: "panel-metric",
      panelRole: "metric",
      defaultLayout: "metric-row",
      defaultAnimation: ref("animation", "count", "readableCount"),
      defaultInteraction: ref("interaction", "feedback", "idle"),
      defaultBinding: ref("binding", "numeric", "metricCount"),
      density: "compact",
      notes: "件数・数値・比較値の表示向け role。"
    },
    status: {
      panelClass: "panel-status",
      panelRole: "status",
      defaultLayout: "status-pill",
      defaultAnimation: ref("animation", "visibility", "soft"),
      defaultInteraction: ref("interaction", "feedback", "hover"),
      defaultBinding: ref("binding", "status", "activeStatus"),
      density: "compact",
      notes: "状態表示・進行状態・警告表示向け role。"
    },
    action: {
      panelClass: "panel-action",
      panelRole: "action",
      defaultLayout: "action-row",
      defaultAnimation: ref("animation", "visibility", "deliberate"),
      defaultInteraction: ref("interaction", "button", "primary"),
      defaultBinding: ref("binding", "action", "primaryActionBinding"),
      density: "tight",
      notes: "ボタン・実行・選択肢の操作向け role。"
    },
    preview: {
      panelClass: "panel-preview",
      panelRole: "preview",
      defaultLayout: "preview-card",
      defaultAnimation: ref("animation", "reveal", "focusThenDetails"),
      defaultInteraction: ref("interaction", "confirmation", "tentative"),
      defaultBinding: ref("binding", "output", "artifactCard"),
      density: "comfortable",
      notes: "成果物の事前確認やプレビュー向け role。"
    },
    output: {
      panelClass: "panel-output",
      panelRole: "output",
      defaultLayout: "output-stack",
      defaultAnimation: ref("animation", "reveal", "containerThenContent"),
      defaultInteraction: ref("interaction", "utility", "export"),
      defaultBinding: ref("binding", "output", "packageSummary"),
      density: "comfortable",
      notes: "出力・書き出し・最終結果表示向け role。"
    },
    evidence: {
      panelClass: "panel-evidence",
      panelRole: "evidence",
      defaultLayout: "evidence-stack",
      defaultAnimation: ref("animation", "stagger", "presentationStagger"),
      defaultInteraction: ref("interaction", "confirmation", "requireReview"),
      defaultBinding: ref("binding", "evidence", "verificationEvidence"),
      density: "comfortable",
      notes: "証跡・引用・検証情報向け role。"
    },
    guide: {
      panelClass: "panel-guide",
      panelRole: "guide",
      defaultLayout: "guide-flow",
      defaultAnimation: ref("animation", "guide", "stepGuideStandard"),
      defaultInteraction: ref("interaction", "command", "proceed"),
      defaultBinding: ref("binding", "text", "helperText"),
      density: "compact",
      notes: "段階案内・導線・手順説明向け role。"
    },
    list: {
      panelClass: "panel-list",
      panelRole: "list",
      defaultLayout: "list-stack",
      defaultAnimation: ref("animation", "stagger", "standardStagger"),
      defaultInteraction: ref("interaction", "navigation", "pageJump"),
      defaultBinding: ref("binding", "list", "candidateList"),
      density: "comfortable",
      notes: "候補一覧・履歴一覧・選択一覧向け role。"
    },
    detail: {
      panelClass: "panel-detail",
      panelRole: "detail",
      defaultLayout: "detail-stack",
      defaultAnimation: ref("animation", "reveal", "topDown"),
      defaultInteraction: ref("interaction", "confirmation", "confirm"),
      defaultBinding: ref("binding", "text", "bodyText"),
      density: "comfortable",
      notes: "詳細説明・本文・掘り下げ表示向け role。"
    },
    setting: {
      panelClass: "panel-setting",
      panelRole: "setting",
      defaultLayout: "setting-grid",
      defaultAnimation: ref("animation", "visibility", "soft"),
      defaultInteraction: ref("interaction", "command", "openSettings"),
      defaultBinding: ref("binding", "meta", "pageMeta"),
      density: "compact",
      notes: "設定・切り替え・環境表示向け role。"
    },
    confirmation: {
      panelClass: "panel-confirmation",
      panelRole: "confirmation",
      defaultLayout: "confirmation-stack",
      defaultAnimation: ref("animation", "interaction", "buttonConfirm"),
      defaultInteraction: ref("interaction", "confirmation", "confirm"),
      defaultBinding: ref("binding", "status", "pendingStatus"),
      density: "tight",
      notes: "最終確認・承認・再確認向け role。"
    }
  };

  const pages = {
    "jarvis-start": {
      pageId: "jarvis-start",
      pageType: "landing",
      primaryLayout: "start-hero",
      mainRoles: ["summary", "guide", "action"],
      recommendedPanels: ["panel-summary", "panel-guide", "panel-action"],
      animationProfile: ref("animation", "visibility", "deliberate"),
      interactionProfile: ref("interaction", "button", "primary"),
      bindingProfile: ref("binding", "text", "titleText"),
      notes: "起点ページ。案内と主要導線を優先する。"
    },
    "system-map": {
      pageId: "system-map",
      pageType: "overview",
      primaryLayout: "map-shell",
      mainRoles: ["summary", "guide", "status"],
      recommendedPanels: ["panel-summary", "panel-guide", "panel-status"],
      animationProfile: ref("animation", "reveal", "containerThenContent"),
      interactionProfile: ref("interaction", "command", "showAll"),
      bindingProfile: ref("binding", "meta", "routeMeta"),
      notes: "全体の流れを俯瞰するページ。"
    },
    "portfolio-collect": {
      pageId: "portfolio-collect",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["guide", "list", "action"],
      recommendedPanels: ["panel-guide", "panel-list", "panel-action"],
      animationProfile: ref("animation", "guide", "stepGuideStandard"),
      interactionProfile: ref("interaction", "command", "proceed"),
      bindingProfile: ref("binding", "list", "historyList"),
      notes: "回収と次工程への接続を中心にする。"
    },
    "portfolio-quality": {
      pageId: "portfolio-quality",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["metric", "status", "guide"],
      recommendedPanels: ["panel-metric", "panel-status", "panel-guide"],
      animationProfile: ref("animation", "count", "readableCount"),
      interactionProfile: ref("interaction", "confirmation", "requireReview"),
      bindingProfile: ref("binding", "numeric", "comparisonCount"),
      notes: "品質確認と数値把握を中心にする。"
    },
    "portfolio-review": {
      pageId: "portfolio-review",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["list", "confirmation", "evidence"],
      recommendedPanels: ["panel-list", "panel-confirmation", "panel-evidence"],
      animationProfile: ref("animation", "stagger", "presentationStagger"),
      interactionProfile: ref("interaction", "confirmation", "confirm"),
      bindingProfile: ref("binding", "list", "candidateList"),
      notes: "候補採否と根拠確認を中心にする。"
    },
    "portfolio-current": {
      pageId: "portfolio-current",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["summary", "status", "detail"],
      recommendedPanels: ["panel-summary", "panel-status", "panel-detail"],
      animationProfile: ref("animation", "visibility", "soft"),
      interactionProfile: ref("interaction", "feedback", "hover"),
      bindingProfile: ref("binding", "text", "bodyText"),
      notes: "現在地と利用可能性の確認を中心にする。"
    },
    "portfolio-purpose": {
      pageId: "portfolio-purpose",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["summary", "action", "confirmation"],
      recommendedPanels: ["panel-summary", "panel-action", "panel-confirmation"],
      animationProfile: ref("animation", "reveal", "focusThenDetails"),
      interactionProfile: ref("interaction", "button", "secondary"),
      bindingProfile: ref("binding", "action", "secondaryActionBinding"),
      notes: "何へ活かすかを選ぶページ。"
    },
    "portfolio-next": {
      pageId: "portfolio-next",
      pageType: "workflow",
      primaryLayout: "workflow-stage",
      mainRoles: ["output", "action", "evidence"],
      recommendedPanels: ["panel-output", "panel-action", "panel-evidence"],
      animationProfile: ref("animation", "reveal", "containerThenContent"),
      interactionProfile: ref("interaction", "command", "replay"),
      bindingProfile: ref("binding", "output", "handoffBlock"),
      notes: "次の作業や引き継ぎに進むページ。"
    },
    "project-spec": {
      pageId: "project-spec",
      pageType: "reference",
      primaryLayout: "reference-sheet",
      mainRoles: ["summary", "detail", "setting"],
      recommendedPanels: ["panel-summary", "panel-detail", "panel-setting"],
      animationProfile: ref("animation", "fade", "calmFade"),
      interactionProfile: ref("interaction", "command", "openSettings"),
      bindingProfile: ref("binding", "meta", "pageMeta"),
      notes: "プロジェクト仕様の参照ページ。"
    },
    "core-knowledge": {
      pageId: "core-knowledge",
      pageType: "reference",
      primaryLayout: "knowledge-sheet",
      mainRoles: ["summary", "evidence", "list"],
      recommendedPanels: ["panel-summary", "panel-evidence", "panel-list"],
      animationProfile: ref("animation", "reveal", "containerThenContent"),
      interactionProfile: ref("interaction", "confirmation", "requireReview"),
      bindingProfile: ref("binding", "evidence", "decisionReason"),
      notes: "知識化や不足検知の参照ページ。"
    },
    "display-settings": {
      pageId: "display-settings",
      pageType: "setting",
      primaryLayout: "settings-grid",
      mainRoles: ["setting", "status", "action"],
      recommendedPanels: ["panel-setting", "panel-status", "panel-action"],
      animationProfile: ref("animation", "visibility", "soft"),
      interactionProfile: ref("interaction", "command", "openSettings"),
      bindingProfile: ref("binding", "meta", "roleMeta"),
      notes: "表示系設定の集約ページ。"
    },
    "capture-import-queue": {
      pageId: "capture-import-queue",
      pageType: "ingest",
      primaryLayout: "queue-shell",
      mainRoles: ["list", "metric", "action"],
      recommendedPanels: ["panel-list", "panel-metric", "panel-action"],
      animationProfile: ref("animation", "stagger", "standardStagger"),
      interactionProfile: ref("interaction", "utility", "import"),
      bindingProfile: ref("binding", "list", "outputList"),
      notes: "取り込みキューの管理ページ。"
    },
    "unified-backup": {
      pageId: "unified-backup",
      pageType: "storage",
      primaryLayout: "backup-shell",
      mainRoles: ["output", "evidence", "status"],
      recommendedPanels: ["panel-output", "panel-evidence", "panel-status"],
      animationProfile: ref("animation", "guide", "stepGuideSlow"),
      interactionProfile: ref("interaction", "utility", "save"),
      bindingProfile: ref("binding", "output", "packageSummary"),
      notes: "保存領域・統合バックアップの管理ページ。"
    },
    "target-manage": {
      pageId: "target-manage",
      pageType: "management",
      primaryLayout: "target-shell",
      mainRoles: ["list", "detail", "action"],
      recommendedPanels: ["panel-list", "panel-detail", "panel-action"],
      animationProfile: ref("animation", "reveal", "topDown"),
      interactionProfile: ref("interaction", "navigation", "pageJump"),
      bindingProfile: ref("binding", "list", "candidateList"),
      notes: "対象の登録・管理・編集を行うページ。"
    }
  };

  const registry = Object.freeze({
    version: "v1",
    foundation: Object.freeze({
      panelSystem: true,
      layoutPresets: true,
      animationPresets: true,
      interactionPresets: true,
      dataBindings: true
    }),
    roles: Object.freeze(Object.keys(roles).reduce((acc, roleName) => {
      acc[roleName] = Object.freeze({ ...roles[roleName] });
      return acc;
    }, {})),
    pages: Object.freeze(Object.keys(pages).reduce((acc, pageId) => {
      acc[pageId] = Object.freeze({ ...pages[pageId] });
      return acc;
    }, {})),
    getPageConfig(pageId) {
      return this.pages[pageId] || null;
    },
    getRoleConfig(roleName) {
      return this.roles[roleName] || null;
    }
  });

  window.JARVIS_UI_REGISTRY = registry;
})();
