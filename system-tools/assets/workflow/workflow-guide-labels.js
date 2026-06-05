(function () {
  "use strict";

  const VERSION_V275 = "v275 / 05STEP実DOM追加・冒頭表示復旧";
  const VERSION_V283 = "v283 / 05STEP点滅抑制・数値カウント復旧";
  const VERSION_V285 = "v285 / 06STEP強調色パネル初期表示固定";

  function setVersion(version) {
    const side = document.querySelector(".side-version");
    if (side) side.textContent = version;
    const vt = document.getElementById("versionText");
    if (vt) vt.textContent = version;
  }

  function markPage(id, className) {
    const page = document.getElementById(id);
    if (page) page.classList.add(className);
  }

  function setGuideLabels() {
    document.querySelectorAll(".guide-control-button.replay").forEach(btn => {
      btn.setAttribute("aria-label", "再度アニメ再生");
      btn.setAttribute("title", "再度アニメ再生");
    });
    document.querySelectorAll(".guide-control-button.show-all").forEach(btn => {
      btn.setAttribute("aria-label", "アニメをスキップする");
      btn.setAttribute("title", "アニメをスキップする");
    });
  }

  /* v207: quality pilot */
  (function () {
    function apply() {
      setVersion(VERSION_V275);
      markPage("portfolio-quality", "jarvis-v207-quality-pilot");
    }
    document.addEventListener("DOMContentLoaded", apply);
    window.addEventListener("load", apply);
    apply();
  })();

  /* v208: review pilot */
  (function () {
    function apply() {
      setVersion(VERSION_V275);
      markPage("portfolio-review", "jarvis-v208-review-pilot");
    }
    document.addEventListener("DOMContentLoaded", apply);
    window.addEventListener("load", apply);
    apply();
  })();

  /* v210: purpose pilot */
  (function () {
    function apply() {
      setVersion(VERSION_V275);
      markPage("portfolio-purpose", "jarvis-v210-purpose-pilot");
    }
    document.addEventListener("DOMContentLoaded", apply);
    window.addEventListener("load", apply);
    setTimeout(apply, 0);
    setTimeout(apply, 250);
    setTimeout(apply, 1000);
  })();

  /* v222: portfolio02 guide labels */
  (function () {
    function apply() {
      setGuideLabels();
      setVersion(VERSION_V275);
    }
    document.addEventListener("DOMContentLoaded", apply);
    window.addEventListener("load", apply);
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    apply();
  })();

  /* v211: next pilot */
  (function () {
    function apply() {
      setVersion(VERSION_V275);
      markPage("portfolio-next", "jarvis-v211-next-pilot");
    }
    document.addEventListener("DOMContentLoaded", apply);
    window.addEventListener("load", apply);
    setTimeout(apply, 0);
    setTimeout(apply, 250);
    setTimeout(apply, 1000);
  })();

  /* v210/v208/v211 late version markers */
  (function () {
    const VERSION = VERSION_V275;
    function s() { setVersion(VERSION); }
    document.addEventListener("DOMContentLoaded", s);
    window.addEventListener("load", s);
    setTimeout(s, 0);
    setTimeout(s, 250);
    setTimeout(s, 1000);
    s();
  })();

  (function () {
    const VERSION = VERSION_V283;
    function s() { setVersion(VERSION); }
    document.addEventListener("DOMContentLoaded", s);
    window.addEventListener("load", s);
    setTimeout(s, 0);
    setTimeout(s, 250);
    setTimeout(s, 1000);
    s();
  })();

  (function () {
    const VERSION = VERSION_V285;
    function s() { setVersion(VERSION); }
    document.addEventListener("DOMContentLoaded", s);
    window.addEventListener("load", s);
    setTimeout(s, 0);
    setTimeout(s, 250);
    setTimeout(s, 1000);
    s();
  })();
})();
