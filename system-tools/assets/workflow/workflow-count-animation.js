(function () {
  /* jarvis-v226-portfolio02-count-animation-stable */
  const VERSION = 'v246 / 04固定文言制御・比較修正';
  const ROOT_SELECTOR = '#portfolio-quality';
  const VALUE_SELECTOR = '#captureQualitySummary .workflow-brief-card b';
  const DURATION = 3000;
  const STAGGER = 260;
  const BASE_DELAY = 250;

  function setVersion() {
    const vt = document.getElementById('versionText'); if (vt) vt.textContent = VERSION;
    const side = document.querySelector('.side-version'); if (side) side.textContent = VERSION;
  }

  function page() { return document.querySelector(ROOT_SELECTOR); }
  function values() { return Array.from(document.querySelectorAll(`${ROOT_SELECTOR} ${VALUE_SELECTOR}`)); }
  function numbers(text) { return [...String(text || '').matchAll(/\d+/g)].map(m => Number(m[0])); }
  function hasNonZeroNumber(text) { return numbers(text).some(n => n > 0); }
  function formatLike(text, nums) { let i = 0; return String(text).replace(/\d+/g, () => String(nums[i++] ?? 0)); }
  function finalText(el) { return el?.getAttribute('data-quality-final') || el?.textContent || '0'; }
  function isVisible(el) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && parseFloat(s.opacity || '1') >= 0.45;
  }
  function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function prepareQualityCounts() {
    values().forEach(el => {
      const current = (el.textContent || '').trim();
      const existing = (el.getAttribute('data-quality-final') || '').trim();
      if (hasNonZeroNumber(current)) { el.setAttribute('data-quality-final', current); return; }
      if (!existing) el.setAttribute('data-quality-final', current || '0');
    });
  }
  function cancel(el) { if (el && el._qualityCountFrame) { cancelAnimationFrame(el._qualityCountFrame); el._qualityCountFrame = null; } }
  function cancelAll() { values().forEach(cancel); }
  function finishQualityCounts() { values().forEach(el => { cancel(el); el.textContent = finalText(el); el.classList.remove('is-quality-counting'); }); }
  function resetQualityCounts() {
    prepareQualityCounts();
    values().forEach(el => {
      cancel(el);
      const text = finalText(el);
      const nums = numbers(text);
      el.textContent = nums.length ? formatLike(text, nums.map(() => 0)) : text;
      el.classList.remove('is-quality-counting');
    });
  }
  function animateOne(el, index, token) {
    if (!el) return;
    const text = finalText(el);
    const nums = numbers(text);
    cancel(el);
    if (!nums.length || reducedMotion()) { el.textContent = text; return; }
    el.classList.add('is-quality-counting');
    el.textContent = formatLike(text, nums.map(() => 0));
    let visibleSince = null;
    let start = null;
    function tick(now) {
      const root = page();
      if (token !== window.__jarvisQualityCountToken) { cancel(el); return; }
      if (!root || root.classList.contains('guide-show-all')) { el.textContent = text; el.classList.remove('is-quality-counting'); el._qualityCountFrame = null; return; }
      if (!isVisible(el))
      {
        el._qualityCountFrame = requestAnimationFrame(tick);
        return;
      }
      if (visibleSince === null) visibleSince = now;
      const delay = BASE_DELAY + (index * STAGGER);
      if (now - visibleSince < delay)
      {
        el.textContent = formatLike(text, nums.map(() => 0));
        el._qualityCountFrame = requestAnimationFrame(tick);
        return;
      }
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = nums.map(n => Math.round(n * eased));
      el.textContent = t >= 1 ? text : formatLike(text, current);
      if (t < 1) { el._qualityCountFrame = requestAnimationFrame(tick); } else { el.classList.remove('is-quality-counting'); el._qualityCountFrame = null; }
    }
    el._qualityCountFrame = requestAnimationFrame(tick);
  }
  function isQualityCounting() {
    return values().some(el => !!el._qualityCountFrame || el.classList.contains('is-quality-counting'));
  }
  window.isQualityCountsActive = isQualityCounting;
  function animateQualityCounts() {
    const root = page();
    if (!root) return;
    prepareQualityCounts();
    if (root.classList.contains('guide-show-all')) { finishQualityCounts(); return; }
    if (isQualityCounting()) return;
    window.__jarvisQualityCountToken = (window.__jarvisQualityCountToken || 0) + 1;
    const token = window.__jarvisQualityCountToken;
    resetQualityCounts();
    values().forEach((el, index) => animateOne(el, index, token));
  }
  window.animateQualityCounts = animateQualityCounts;
  window.finishQualityCounts = finishQualityCounts;
  window.cancelQualityCounts = cancelAll;
  document.addEventListener('jarvis:guide-start', (ev) => { if (ev.detail?.id === 'portfolio-quality') setTimeout(animateQualityCounts, 80); });
  document.addEventListener('jarvis:guide-finish', (ev) => { if (ev.detail?.id === 'portfolio-quality') finishQualityCounts(); });
  document.addEventListener('DOMContentLoaded', () => { setVersion(); prepareQualityCounts(); });
  window.addEventListener('load', () => { setVersion(); prepareQualityCounts(); });
  setVersion();
})();

/* jarvis-v229-portfolio03-count-safe */
(function () {
  const VERSION = 'v246 / 04固定文言制御・比較修正';
  const ROOT_SELECTOR = '#portfolio-review';
  const VALUE_SELECTOR = '#portfolioAnalysisSummary .portfolio-summary-card b';
  const DURATION = 3000;
  const STAGGER = 260;
  const START_DELAY = 900;
  let runToken = 0;
  let startTimer = null;

  function setVersion() {
    const vt = document.getElementById('versionText'); if (vt) vt.textContent = VERSION;
    const side = document.querySelector('.side-version'); if (side) side.textContent = VERSION;
  }

  function root() { return document.querySelector(ROOT_SELECTOR); }
  function active() { return !!root()?.classList.contains('active'); }
  function values() { return Array.from(document.querySelectorAll(`${ROOT_SELECTOR} ${VALUE_SELECTOR}`)); }
  function nums(text) { return [...String(text || '').matchAll(/\d+/g)].map(m => Number(m[0])); }
  function hasNonZero(text) { return nums(text).some(n => n > 0); }
  function formatLike(text, numbers) { let i = 0; return String(text || '').replace(/\d+/g, () => String(numbers[i++] ?? 0)); }
  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function captureFinals() {
    values().forEach(el => {
      const cur = (el.textContent || '').trim();
      const old = (el.getAttribute('data-review-final') || '').trim();
      if (hasNonZero(cur))
      {
        el.setAttribute('data-review-final', cur);
      } else if (!old)
      {
        el.setAttribute('data-review-final', cur || '0');
      }
    });
  }
  function finalText(el) { return (el?.getAttribute('data-review-final') || el?.textContent || '0').trim(); }
  function cancelElement(el) {
    if (el && el._jarvisV229CountFrame)
    {
      cancelAnimationFrame(el._jarvisV229CountFrame);
      el._jarvisV229CountFrame = null;
    }
  }
  function cancelAll() {
    runToken++;
    if (startTimer) { clearTimeout(startTimer); startTimer = null; }
    values().forEach(el => { cancelElement(el); el.classList.remove('is-review-counting'); });
  }
  function finish() {
    cancelAll();
    values().forEach(el => {
      const final = finalText(el);
      el.textContent = final;
      el.classList.remove('is-review-counting');
    });
  }
  function resetVisibleValuesToZero() {
    values().forEach(el => {
      cancelElement(el);
      const final = finalText(el);
      const n = nums(final);
      el.textContent = n.length ? formatLike(final, n.map(() => 0)) : final;
      el.classList.remove('is-review-counting');
    });
  }
  function animateOne(el, index, myToken) {
    const final = finalText(el);
    const n = nums(final);
    cancelElement(el);
    if (!n.length || reduced())
    {
      el.textContent = final;
      return;
    }
    el.classList.add('is-review-counting');
    const delay = index * STAGGER;
    let start = null;
    function tick(now) {
      if (myToken !== runToken) { cancelElement(el); return; }
      const r = root();
      if (!r || !r.classList.contains('active')) { cancelElement(el); return; }
      if (r.classList.contains('guide-show-all'))
      {
        el.textContent = final;
        el.classList.remove('is-review-counting');
        el._jarvisV229CountFrame = null;
        return;
      }
      if (start === null) start = now;
      const elapsed = now - start;
      if (elapsed < delay)
      {
        el.textContent = formatLike(final, n.map(() => 0));
        el._jarvisV229CountFrame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (elapsed - delay) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = n.map(v => Math.round(v * eased));
      el.textContent = t >= 1 ? final : formatLike(final, current);
      if (t < 1)
      {
        el._jarvisV229CountFrame = requestAnimationFrame(tick);
      } else
      {
        el.classList.remove('is-review-counting');
        el._jarvisV229CountFrame = null;
      }
    }
    el._jarvisV229CountFrame = requestAnimationFrame(tick);
  }
  function isReviewCounting() {
    return values().some(el => !!el._jarvisV229CountFrame || el.classList.contains('is-review-counting'));
  }
  window.isReviewCountsActive = isReviewCounting;
  function animateReviewCounts(force = false) {
    if (!active()) return;
    if (!force && isReviewCounting()) return;
    runToken++;
    const myToken = runToken;
    captureFinals();
    resetVisibleValuesToZero();
    values().forEach((el, index) => animateOne(el, index, myToken));
  }
  function schedule(force) {
    if (!active()) return;
    if (!force && (startTimer || isReviewCounting())) return;
    if (startTimer) clearTimeout(startTimer);
    startTimer = setTimeout(() => {
      startTimer = null;
      if (active()) animateReviewCounts(!!force);
    }, force ? 120 : START_DELAY);
  }
  document.addEventListener('jarvis:guide-start', (ev) => {
    if (ev.detail?.id === 'portfolio-review') schedule(false);
  });
  document.addEventListener('jarvis:guide-finish', (ev) => {
    if (ev.detail?.id === 'portfolio-review') finish();
  });
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest?.('.guide-control-button');
    if (!btn || !active()) return;
    if (btn.classList.contains('show-all')) setTimeout(finish, 0);
    if (btn.classList.contains('replay')) schedule(true);
  }, true);
  window.animateReviewCounts = schedule;
  window.finishReviewCounts = finish;
  window.cancelReviewCounts = cancelAll;
  document.addEventListener('DOMContentLoaded', () => { setVersion(); captureFinals(); });
  window.addEventListener('load', () => { setVersion(); captureFinals(); });
  setVersion();
})();
