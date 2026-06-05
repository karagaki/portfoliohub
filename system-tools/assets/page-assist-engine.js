window.JARVIS_PAGE_ASSIST_ENGINE = (function () {
  const VERSION = 'v275 / 05STEP実DOM追加・冒頭表示復旧';
  const WRAP_FLAG = '__jarvisV201AssistWrapped';
  const LIFECYCLE_FLAG = '__jarvisPageAssistLifecycleBound';
  const CLICK_FLAG = '__jarvisPageAssistClickBound';

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
    return document.querySelector('.page.active')?.id || 'jarvis-start';
  }

  function currentCopy() {
    return window.JARVIS_PAGE_ASSIST_COPY || {};
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
    pop.innerHTML = `<b>${escapeText(data.title)}</b><p>${escapeText(data.body)}</p>`;
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
