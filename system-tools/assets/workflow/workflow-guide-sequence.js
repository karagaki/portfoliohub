(() => {
  "use strict";

  if (window.KASHINOKI_WORKFLOW_SEQUENCE_ENGINE) return;

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function pageEl(pageId) {
    return qs(`#${pageId}`);
  }

  function createTimerStore() {
    return {
      timeouts: [],
      namedTimeouts: Object.create(null),
      namedIntervals: Object.create(null)
    };
  }

  function clearNamedTimeout(store, key) {
    if (!store || !store.namedTimeouts || !store.namedTimeouts[key]) return;
    clearTimeout(store.namedTimeouts[key]);
    store.namedTimeouts[key] = null;
  }

  function clearNamedInterval(store, key) {
    if (!store || !store.namedIntervals || !store.namedIntervals[key]) return;
    clearInterval(store.namedIntervals[key]);
    store.namedIntervals[key] = null;
  }

  function clearTimerStore(store) {
    if (!store) return;
    (store.timeouts || []).forEach((id) => clearTimeout(id));
    store.timeouts = [];
    Object.keys(store.namedTimeouts || {}).forEach((key) => clearNamedTimeout(store, key));
    Object.keys(store.namedIntervals || {}).forEach((key) => clearNamedInterval(store, key));
  }

  function addTimeout(store, delay, fn) {
    const id = setTimeout(fn, delay);
    store.timeouts.push(id);
    return id;
  }

  function replaceNamedTimeout(store, key, delay, fn) {
    clearNamedTimeout(store, key);
    const namedTimeouts = store.namedTimeouts;
    const id = setTimeout(() => {
      if (namedTimeouts[key] === id) namedTimeouts[key] = null;
      fn();
    }, delay);
    namedTimeouts[key] = id;
    return id;
  }

  function replaceNamedInterval(store, key, delay, fn) {
    clearNamedInterval(store, key);
    const id = setInterval(fn, delay);
    store.namedIntervals[key] = id;
    return id;
  }

  function isReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function updatePageClasses(page, { add = [], remove = [] } = {}) {
    if (!page) return;
    if (remove.length) page.classList.remove(...remove);
    if (add.length) page.classList.add(...add);
  }

  function markReveal(targets, revealClass) {
    const list = targets.filter(Boolean);
    list.forEach((el) => el.classList.add(revealClass));
    return list;
  }

  function hideTargets(targets, revealClass, visibleClass) {
    const list = markReveal(targets, revealClass);
    list.forEach((el) => {
      if (visibleClass) el.classList.remove(visibleClass);
      el.style.removeProperty("opacity");
      el.style.removeProperty("visibility");
      el.style.removeProperty("transform");
    });
    return list;
  }

  function showElement(el, revealClass, visibleClass) {
    if (!el) return;
    el.classList.add(revealClass);
    if (visibleClass) el.classList.add(visibleClass);
  }

  function showAllTargets(targets, revealClass, visibleClass) {
    const list = markReveal(targets, revealClass);
    list.forEach((el) => {
      if (visibleClass) el.classList.add(visibleClass);
    });
    return list;
  }

  function scheduleStep({ store, delay, token, getToken, pageId, fn }) {
    return addTimeout(store, delay, () => {
      if (token !== getToken()) return;
      const current = pageEl(pageId);
      if (!current || !current.classList.contains("active")) return;
      fn(current);
    });
  }

  window.KASHINOKI_WORKFLOW_SEQUENCE_ENGINE = {
    qs,
    qsa,
    pageEl,
    createTimerStore,
    clearTimerStore,
    addTimeout,
    replaceNamedTimeout,
    replaceNamedInterval,
    clearNamedTimeout,
    clearNamedInterval,
    isReducedMotion,
    updatePageClasses,
    markReveal,
    hideTargets,
    showElement,
    showAllTargets,
    scheduleStep
  };
})();
