window.KASHINOKI_PAGE_ASSIST_ENGINE = (function () {
  const VERSION = 'v1.0923';
  const WRAP_FLAG = '__kashinokiV201AssistWrapped';
  const LIFECYCLE_FLAG = '__kashinokiPageAssistLifecycleBound';
  const CLICK_FLAG = '__kashinokiPageAssistClickBound';
  const HIDDEN_ASSIST_PAGE_IDS = new Set([]);

  function escapeText(value) {
    if (typeof window.esc === 'function') return window.esc(value);
    return String(value ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  function currentPageId() {
    return document.querySelector('.page.active')?.id || 'kashinoki-start';
  }

  function currentCopy() {
    return window.KASHINOKI_PAGE_ASSIST_COPY || {};
  }

  function bindClickToClose() {
    if (window[CLICK_FLAG]) return;
    window[CLICK_FLAG] = true;
    document.addEventListener('click', (ev) => {
      const pop = document.getElementById('pageAssistPopover');
      const fab = document.getElementById('pageAssistFab');
      if (!pop || !fab || !pop.classList.contains('is-open')) return;
      if (ev.target.closest('#pageAssistPopover') || ev.target.closest('#pageAssistFab')) return;
      pop.classList.remove('is-open');
      fab.classList.remove('is-active');
    }, true);
  }

  function ensureAssist() {
    let fab = document.getElementById('pageAssistFab');
    let pop = document.getElementById('pageAssistPopover');
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'pageAssistFab';
      fab.className = 'page-assist-fab';
      fab.type = 'button';
      fab.setAttribute('aria-label', 'このページの補足を表示');
      fab.textContent = '?';
      document.body.appendChild(fab);
    }
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'pageAssistPopover';
      pop.className = 'page-assist-popover';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-live', 'polite');
      document.body.appendChild(pop);
    }
    bindClickToClose();
    fab.onclick = (ev) => {
      ev.stopPropagation();
      updateAssist(true);
    };
    return { fab, pop };
  }

  function updateAssist(toggle) {
    ensureAssist();
    const id = currentPageId();
    const copy = currentCopy();
    const data = copy[id] || copy.fallback || { title: '', body: '' };
    const pop = document.getElementById('pageAssistPopover');
    const fab = document.getElementById('pageAssistFab');
    if (!pop || !fab) return;
    if (HIDDEN_ASSIST_PAGE_IDS.has(id)) {
      pop.classList.remove('is-open');
      fab.classList.remove('is-active');
      pop.hidden = true;
      fab.hidden = true;
      fab.style.display = 'none';
      pop.style.display = 'none';
      return;
    }
    pop.hidden = false;
    fab.hidden = false;
    fab.style.removeProperty('display');
    pop.style.removeProperty('display');
    const imageHtml = data.image
      ? `<img class="page-assist-image" src="${escapeText(data.image)}" alt="${escapeText(data.imageAlt || '')}">`
      : '';
    const leadHtml = data.lead ? `<strong class="page-assist-lead">${escapeText(data.lead)}</strong>` : '';
    pop.innerHTML = `<b>${escapeText(data.title)}</b>${imageHtml}${leadHtml}<p>${escapeText(data.body)}</p>`;
    if (toggle) {
      const next = !pop.classList.contains('is-open');
      pop.classList.toggle('is-open', next);
      fab.classList.toggle('is-active', next);
    } else {
      pop.classList.remove('is-open');
      fab.classList.remove('is-active');
    }
    const side = document.querySelector('.side-version');
    if (side) side.textContent = VERSION;
    const vt = document.getElementById('versionText');
    if (vt) vt.textContent = VERSION;
  }

  function removeInlineCurrentNote() {
    document.querySelector('#portfolio-current > .workflow-filter-note-compact')?.remove();
  }

  function refreshAssist() {
    ensureAssist();
    removeInlineCurrentNote();
    updateAssist(false);
  }

  function bindLifecycle() {
    if (window[LIFECYCLE_FLAG]) return;
    window[LIFECYCLE_FLAG] = true;
    document.addEventListener('DOMContentLoaded', refreshAssist);
    window.addEventListener('load', refreshAssist);
  }

  function wrapPage() {
    const prevPage = window.page;
    if (typeof prevPage === 'function' && !prevPage[WRAP_FLAG]) {
      const wrapped = function () {
        const result = prevPage.apply(this, arguments);
        removeInlineCurrentNote();
        updateAssist(false);
        return result;
      };
      wrapped[WRAP_FLAG] = true;
      window.page = wrapped;
    }
  }

  function install() {
    bindLifecycle();
    wrapPage();
    refreshAssist();
  }

  return {
    ensureAssist,
    updateAssist,
    removeInlineCurrentNote,
    install
  };
})();
