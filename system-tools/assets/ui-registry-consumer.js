(function () {
  "use strict";

  if (window.JARVIS_UI_REGISTRY_CONSUMER) return;

  const REQUIRED_PAGES = [
    "jarvis-start",
    "system-map",
    "portfolio-collect",
    "portfolio-quality",
    "portfolio-review",
    "portfolio-current",
    "portfolio-purpose",
    "portfolio-next",
    "project-spec",
    "core-knowledge",
    "display-settings",
    "capture-import-queue",
    "unified-backup",
    "target-manage"
  ];

  const REQUIRED_ROLES = [
    "summary",
    "metric",
    "status",
    "action",
    "preview",
    "output",
    "evidence",
    "guide"
  ];

  function registry() {
    return window.JARVIS_UI_REGISTRY || null;
  }

  function getPage(pageId) {
    return registry()?.getPageConfig(pageId) || null;
  }

  function getRole(roleName) {
    return registry()?.getRoleConfig(roleName) || null;
  }

  function getPageRoles(pageId) {
    const page = getPage(pageId);
    return Array.isArray(page?.mainRoles) ? page.mainRoles.slice() : [];
  }

  function getPageLayout(pageId) {
    return getPage(pageId)?.primaryLayout || null;
  }

  function getPageAnimation(pageId) {
    return getPage(pageId)?.animationProfile || null;
  }

  function getPageInteraction(pageId) {
    return getPage(pageId)?.interactionProfile || null;
  }

  function getPageBinding(pageId) {
    return getPage(pageId)?.bindingProfile || null;
  }

  function resolveRolePreset(roleName) {
    const role = getRole(roleName);
    if (!role) return null;
    return {
      roleName,
      ...role,
      resolved: {
        animation: role.defaultAnimation || null,
        interaction: role.defaultInteraction || null,
        binding: role.defaultBinding || null
      }
    };
  }

  function validateRegistry() {
    const reg = registry();
    const result = {
      ok: false,
      registry: !!reg,
      getPageConfig: typeof reg?.getPageConfig === "function",
      getRoleConfig: typeof reg?.getRoleConfig === "function",
      pages: Array.isArray(reg?.pages) || !!reg?.pages,
      roles: Array.isArray(reg?.roles) || !!reg?.roles,
      namespaces: {
        animation: typeof window.JARVIS_ANIMATION_PRESETS === "object" && !!window.JARVIS_ANIMATION_PRESETS,
        interaction: typeof window.JARVIS_INTERACTION_PRESETS === "object" && !!window.JARVIS_INTERACTION_PRESETS,
        dataBindings: typeof window.JARVIS_DATA_BINDINGS === "object" && !!window.JARVIS_DATA_BINDINGS
      },
      missingPages: [],
      missingRoles: [],
      missingNamespaces: []
    };

    if (!result.registry) result.missingNamespaces.push("registry");
    if (!result.getPageConfig) result.missingNamespaces.push("getPageConfig");
    if (!result.getRoleConfig) result.missingNamespaces.push("getRoleConfig");
    if (!result.namespaces.animation) result.missingNamespaces.push("animation");
    if (!result.namespaces.interaction) result.missingNamespaces.push("interaction");
    if (!result.namespaces.dataBindings) result.missingNamespaces.push("dataBindings");

    for (const pageId of REQUIRED_PAGES) {
      if (!getPage(pageId)) result.missingPages.push(pageId);
    }
    for (const roleName of REQUIRED_ROLES) {
      if (!getRole(roleName)) result.missingRoles.push(roleName);
    }

    result.ok =
      result.registry &&
      result.getPageConfig &&
      result.getRoleConfig &&
      result.namespaces.animation &&
      result.namespaces.interaction &&
      result.namespaces.dataBindings &&
      result.missingPages.length === 0 &&
      result.missingRoles.length === 0;

    return result;
  }

  const consumer = Object.freeze({
    getPage,
    getRole,
    getPageRoles,
    getPageLayout,
    getPageAnimation,
    getPageInteraction,
    getPageBinding,
    resolveRolePreset,
    validateRegistry
  });

  window.JARVIS_UI_REGISTRY_CONSUMER = consumer;
})();
