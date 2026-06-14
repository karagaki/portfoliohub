const root = document.documentElement;
const STORAGE_KEY = "portfoliohub.systemToolsIntroSettings";
const LEGACY_STORAGE_KEY = "portfoliohub.visual-settings.v1";

const defaults = {
  "bg-lightness": 1.48,
  "bg-warmth": 1.42,
  "light-strength": 2,
  "card-alpha": 0.05,
  "card-blur": 8,
  "card-border-alpha": 0.55,
  "card-shadow-strength": 0.42,
  "text-strength": 1,
  scale: 1.06,
  "card-gap": 6,
  "card-radius": 14,
  "card-height": 380,
  "card-padding": 34,
  "light-position": 1.5,
  "light-spread": 0.83,
  "card-highlight-strength": 0.9,
  "card-inner-light": 0.02,
  "text-shadow-strength": 0.37,
  "shadow-distance": 10,
  "shadow-blur": 8,
  "shadow-alpha": 0.5,
  "shadow-y": 10,
  "inner-highlight": 0.04,
  "ground-shadow": 0.72,
  "shadow-mode": "Glow",
  "card-width": 0.99,
  "card-radius-smooth": 1,
  "card-highlight-y": 0.18,
  "card-bottom-tint": 0.4,
  "bg-angle": 120,
  "bg-contrast": 0.9,
  "page-padding-x": 1.28,
  "page-padding-y": 1.28,
  "extensions-y": 0.49,
  "extensions-size": 0.84,
  "pill-alpha": 0.17,
  "pill-border-alpha": 0.32,
  "card-content-y": 13,
  "card-content-x": 12,
  "card-text-gap": 2,
  "title-size": 0.86,
  "ja-size": 0.83,
  "sub-size": 0.78,
  "year-size": 1.06,
  "line-height": 0.88,
  "frost-strength": 0.97,
  "edge-white": 1.1,
  "shadow-x": 7,
  "shadow-warmth": 0.72,
  "shadow-spread": 0.72,
  "card-exit-duration": 0.8,
  "intro-in-duration": 1,
  "intro-out-duration": 0.8,
  "copy-delay": 0.4,
  "page-jump-delay": 0.5,
  "preview-float-duration": 6,
  "preview-float-distance": 6,
  "preview-slide-duration": 5,
  "panel-switch-duration": 0.6,
  "panel-switch-delay": 0.2,
  "panel-overlap-duration": 0.25,
  "cta-fade-duration": 0.5,
  "return-response-duration": 0.18,
  "arrow-response-duration": 0.18,
  "button-hover-lift": 2,
};

/*
  Hub Controls Settings Contract
  ---------------------------------------------------------
  設定項目はここに定義し、HTMLを個別に手書きで増やさない。
  label / key / unit / min / max / default / category を持たせる。
  UIはこの定義から生成し、長いラベルや値でも崩れない構造を使う。
  新しいスライダーを追加する場合は、まずこの定義に追加する。
*/
const HUB_CONTROL_SETTINGS = [
  { key: "card-exit-duration", category: "intro", label: "カード退避", unit: "s", min: 0.2, max: 2.5, step: 0.1, default: 0.8, strengthType: "speed" },
  { key: "intro-in-duration", category: "intro", label: "紹介表示", unit: "s", min: 0.2, max: 2.5, step: 0.1, default: 1, strengthType: "speed" },
  { key: "intro-out-duration", category: "intro", label: "紹介終了", unit: "s", min: 0.2, max: 2.5, step: 0.1, default: 0.8, strengthType: "speed" },
  { key: "copy-delay", category: "intro", label: "本文遅延", unit: "s", min: 0, max: 2, step: 0.1, default: 0.4, strengthType: "speed" },
  { key: "page-jump-delay", category: "intro", label: "遷移待機", unit: "s", min: 0, max: 2, step: 0.1, default: 0.5, strengthType: "speed" },
  { key: "preview-float-duration", category: "intro", label: "揺れ速度", unit: "s", min: 3, max: 12, step: 0.5, default: 6, strengthType: "speed" },
  { key: "preview-float-distance", category: "intro", label: "揺れ量", unit: "px", min: 0, max: 18, step: 1, default: 6, strengthType: "amount" },
  { key: "preview-slide-duration", category: "intro", label: "スライド速度", unit: "s", min: 2, max: 12, step: 0.5, default: 5, strengthType: "speed" },
  { key: "panel-switch-duration", category: "switch", label: "パネル切替フェード時間", unit: "s", min: 0.2, max: 2.5, step: 0.1, default: 0.6, strengthType: "speed" },
  { key: "panel-switch-delay", category: "switch", label: "左右切替待機", unit: "s", min: 0, max: 2, step: 0.1, default: 0.2, strengthType: "speed" },
  { key: "panel-overlap-duration", category: "switch", label: "スライド切替の重なり時間", unit: "s", min: 0, max: 1.5, step: 0.05, default: 0.25, strengthType: "speed" },
  { key: "cta-fade-duration", category: "buttons", label: "CTAフェード時間", unit: "s", min: 0.1, max: 2, step: 0.1, default: 0.5, strengthType: "speed" },
  { key: "return-response-duration", category: "buttons", label: "戻るボタン反応速度", unit: "s", min: 0.05, max: 1, step: 0.05, default: 0.18, strengthType: "speed" },
  { key: "arrow-response-duration", category: "buttons", label: "左右矢印反応速度", unit: "s", min: 0.05, max: 1, step: 0.05, default: 0.18, strengthType: "speed" },
  { key: "button-hover-lift", category: "buttons", label: "hover浮き量", unit: "px", min: 0, max: 12, step: 1, default: 2, strengthType: "amount" },
];

HUB_CONTROL_SETTINGS.forEach((setting) => {
  if (defaults[setting.key] === undefined) defaults[setting.key] = setting.default;
});

let controls = [];
let valueOutputs = [];
const toggle = document.querySelector(".hub-settings-toggle");
const panel = document.querySelector(".hub-settings");
const settingsBody = document.querySelector(".hub-settings__body");
const closeBtn = document.querySelector(".hub-settings__close");
const resetBtn = document.querySelector(".hub-settings__reset");
const copyBtn = document.querySelector(".hub-settings__copy");
const statusEl = document.querySelector(".hub-settings__status");
const page = document.querySelector(".page");
const previewStage = document.querySelector("#portfolio-preview");
const previewPanel = document.querySelector("[data-preview-panel]");
const previewTitle = document.querySelector("[data-preview-title]");
const previewHeading = document.querySelector("[data-preview-heading]");
const previewSubcopy = document.querySelector("[data-preview-subcopy]");
const previewChips = document.querySelector("[data-preview-chips]");
const previewCopy = document.querySelector("[data-preview-copy]");
const previewTrack = document.querySelector("[data-preview-track]");
const previewCaption = document.querySelector("[data-preview-caption]");
const previewBack = document.querySelector("[data-preview-back]");
const previewOpen = document.querySelector("[data-preview-open]");
const previewPrev = document.querySelector("[data-preview-prev]");
const previewNext = document.querySelector("[data-preview-next]");
const previewCards = Array.from(document.querySelectorAll(".cards .card"));

const previewItems = [
  {
    id: "graphic",
    title: "Graphic Portfolio",
    heading: "グラフィック制作の実績をまとめたポートフォリオ",
    subcopy: "これまでの制作実績やグラフィック表現を一覧できるポートフォリオです。",
    copy: [
      "キャラクター、イラスト、デザイン、商品展開など、これまで携わってきた制作実績を整理したページです。",
      "単なる作品一覧ではなく、制作の幅、見せ方、判断力、ビジュアル表現の方向性が伝わるように構成しています。",
      "これまでの経験を次の仕事や制作につなげるための、グラフィック領域の実績ページです。",
    ],
    chips: ["Graphic Works", "Illustration", "Character", "Portfolio"],
    caption: "Graphic Works / Illustration / Character",
    cta: "ポートフォリオを見る",
    href: document.querySelector("#graphic")?.getAttribute("href") || "https://karagaki.github.io/testportfolio/",
    images: ["graphic-preview-01.png", "graphic-preview-02.png", "graphic-preview-03.png"],
  },
  {
    id: "system-tools",
    title: "System Tools",
    heading: "AIとの会話を、次の制作へ活かすローカル管理ツール",
    subcopy: "AIとの会話を、次の制作へ活かすためのローカル管理ツールです。",
    copy: [
      "制作中に生まれる会話、判断、指示、失敗の経緯、仕様内容を整理し、次回以降のAI作業で使える前提として再利用できるようにします。",
      "一度きりの会話を流して終わらせるのではなく、自分の考え方や判断基準を蓄積し、AIとのやり取りをより安定して継続できる状態へ近づけます。",
      "将来的には、自分の制作方針や判断基準、ノウハウ、個性を反映した“分身”を実現し、制作の継続性と生産性を高めていくことを目指しています。",
    ],
    chips: ["Local Knowledge", "AI Conversation Archive", "Memory Alternative", "Reuse for Next Work"],
    caption: "ローカル管理 / 会話を資産化 / 判断を再利用",
    cta: "ツールを見る",
    href: document.querySelector("#system-tools")?.getAttribute("href") || "./system-tools/index.html",
    images: ["system-tools-preview-01.png", "system-tools-preview-02.png", "system-tools-preview-03.png"],
  },
  {
    id: "uiux-animation-tools",
    title: "UI/UX Animation Tools",
    heading: "心地よい動きとUI表現を探るアニメーションツール",
    subcopy: "UIの動き、視線誘導、質感表現を調整しながら検証するためのツールです。",
    copy: [
      "人が心地よいと感じるアニメーションや、操作時の視線誘導、UIの質感表現を試すための制作ツールです。",
      "数学的・物理的な動きの考え方を取り入れながら、フェード、揺れ、残像、反応、質感などを調整し、表現として使えるUIアニメーションを探っています。",
      "単なる見た目の装飾ではなく、操作感や印象を支える動きの設計を検証するためのページです。",
    ],
    chips: ["UI Motion", "Interaction", "Animation Study", "Visual Feel"],
    caption: "UI Motion / Interaction / Animation Study",
    cta: "ツールを見る",
    href: document.querySelector("#uiux-animation-tools")?.getAttribute("href") || "./uiux-animation-tools/index.html",
    images: ["uiux-preview-01.png", "uiux-preview-02.png", "uiux-preview-03.png"],
  },
];
let currentPreviewIndex = 1;

function toValue(key, raw) {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return defaults[key];
  return numeric;
}

function readNumber(settings, key, min, max) {
  const fallback = defaults[key];
  const value = Number(settings[key]);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function readMode(settings, key, fallback) {
  const value = settings[key];
  return typeof value === "string" && value ? value : fallback;
}

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

function writeSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function formatSettingValue(key, value) {
  if (key === "preview-float-distance" || key === "button-hover-lift") return `${Math.round(value)}px`;
  if (
    key === "card-exit-duration" ||
    key === "intro-in-duration" ||
    key === "intro-out-duration" ||
    key === "copy-delay" ||
    key === "page-jump-delay" ||
    key === "preview-float-duration" ||
    key === "preview-slide-duration" ||
    key === "panel-switch-duration" ||
    key === "panel-switch-delay" ||
    key === "panel-overlap-duration" ||
    key === "cta-fade-duration" ||
    key === "return-response-duration" ||
    key === "arrow-response-duration"
  ) {
    return `${Number(value).toFixed(1)}s`;
  }
  return String(value);
}

function intensityFor(key, value) {
  if (key === "preview-float-distance" || key === "button-hover-lift") {
    if (value <= 3) return "控えめ";
    if (value >= 10) return "強い";
    return "標準";
  }
  if (
    key === "card-exit-duration" ||
    key === "intro-in-duration" ||
    key === "intro-out-duration" ||
    key === "copy-delay" ||
    key === "page-jump-delay" ||
    key === "panel-switch-duration" ||
    key === "panel-switch-delay" ||
    key === "panel-overlap-duration" ||
    key === "cta-fade-duration" ||
    key === "return-response-duration" ||
    key === "arrow-response-duration" ||
    key === "preview-float-duration" ||
    key === "preview-slide-duration"
  ) {
    if (value <= 0.4 || (key.includes("preview") && value <= 4)) return "速い";
    if (value >= 1.5 || (key.includes("preview") && value >= 9)) return "ゆっくり";
    return "標準";
  }
  return "標準";
}

function updateValueOutputs(settings) {
  valueOutputs.forEach((output) => {
    const key = output.dataset.hubValue;
    if (!key) return;
    const value = Number(settings[key] ?? defaults[key]);
    output.textContent = `${formatSettingValue(key, value)} / ${intensityFor(key, value)}`;
  });
}

function settingMs(key) {
  const settings = readSettings();
  const value = Number(settings[key] ?? defaults[key]);
  if (!Number.isFinite(value)) return Number(defaults[key]) * 1000;
  return value * 1000;
}

const introControlKeys = [
  "card-exit-duration",
  "intro-in-duration",
  "intro-out-duration",
  "copy-delay",
  "page-jump-delay",
  "preview-float-duration",
  "preview-float-distance",
  "preview-slide-duration",
];

const settingsPages = [
  { id: "intro", label: "紹介ステージ" },
  { id: "switch", label: "パネル切替" },
  { id: "buttons", label: "ボタン / 導線" },
  { id: "appearance", label: "外観" },
];

function controlTemplate({ key, label, min, max, step }) {
  return `
    <div class="control-row" data-control-key="${key}">
      <div class="control-meta">
        <label class="control-label" for="hub-control-${key}" data-control-label="${key}">${label}</label>
        <output class="control-value" for="hub-control-${key}" data-hub-value="${key}"></output>
      </div>
      <input class="control-range" id="hub-control-${key}" type="range" min="${min}" max="${max}" step="${step}" data-hub-control="${key}" />
    </div>`;
}

function controlsForPage(category) {
  return HUB_CONTROL_SETTINGS
    .filter((setting) => setting.category === category)
    .map(controlTemplate)
    .join("");
}

function setupSettingsPanel() {
  if (!settingsBody || settingsBody.dataset.paged === "true") return;
  const originalNodes = Array.from(settingsBody.children);
  const shell = document.createElement("div");
  shell.className = "hub-settings-pages";
  shell.innerHTML = `
    <nav class="hub-settings-tabs" aria-label="設定ページ">
      ${settingsPages.map((item) => `<button type="button" class="hub-settings-tab${item.id === "intro" ? " is-active" : ""}" data-settings-tab="${item.id}">${item.label}</button>`).join("")}
    </nav>
      <div class="hub-settings-main">
      <div class="hub-settings-page is-active" data-settings-page="intro">
        <h3 class="hub-settings__group">紹介ステージ</h3>
        ${controlsForPage("intro")}
      </div>
      <div class="hub-settings-page" data-settings-page="switch">
        <h3 class="hub-settings__group">パネル切替</h3>
        ${controlsForPage("switch")}
      </div>
      <div class="hub-settings-page" data-settings-page="buttons">
        <h3 class="hub-settings__group">ボタン / 導線</h3>
        ${controlsForPage("buttons")}
      </div>
      <div class="hub-settings-page" data-settings-page="appearance"></div>
    </div>
    <aside class="hub-settings-sample" aria-label="動作確認サンプル">
      <div class="motion-sample-card">
        <p class="motion-sample-kicker">動作確認サンプル</p>
        <h3>動作確認サンプル</h3>
        <p class="motion-sample-copy">スライダーの値に合わせて、フェード・揺れ・切替速度の目安を確認できます。</p>
        <div class="motion-sample-window"><div class="motion-sample-track"><span>A</span><span>B</span><span>C</span></div></div>
        <div class="motion-sample-actions">
          <button type="button" data-sample-prev>◀</button>
          <button type="button" data-sample-back>戻る</button>
          <button type="button" data-sample-cta>進む</button>
          <button type="button" data-sample-next>▶</button>
        </div>
        <div class="motion-sample-readout" data-motion-readout></div>
      </div>
    </aside>
  `;
  settingsBody.replaceChildren(shell);

  const appearancePage = shell.querySelector('[data-settings-page="appearance"]');
  originalNodes.forEach((node) => {
    const key = node.querySelector?.("[data-hub-control]")?.dataset.hubControl;
    if (node.classList?.contains("hub-settings__group") && node.textContent.trim() === "紹介ステージ") return;
    if (key && introControlKeys.includes(key)) return;
    appearancePage.appendChild(node);
  });

  shell.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.settingsTab;
      shell.querySelectorAll("[data-settings-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      shell.querySelectorAll("[data-settings-page]").forEach((pageEl) => pageEl.classList.toggle("is-active", pageEl.dataset.settingsPage === target));
      shell.dataset.activePage = target;
      updateMotionSample(readSettings());
    });
  });
  shell.querySelectorAll(".motion-sample-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = shell.querySelector(".motion-sample-card");
      sample.classList.remove("is-sample-pulse");
      window.requestAnimationFrame(() => sample.classList.add("is-sample-pulse"));
    });
  });
  settingsBody.dataset.paged = "true";
  controls = Array.from(document.querySelectorAll("[data-hub-control]"));
  valueOutputs = Array.from(document.querySelectorAll("[data-hub-value]"));
}

function updateMotionSample(settings) {
  const sample = document.querySelector(".motion-sample-card");
  if (!sample) return;
  const activePage = document.querySelector(".hub-settings-pages")?.dataset.activePage || "intro";
  const values = {
    cardExit: readNumber(settings, "card-exit-duration", 0.2, 2.5),
    introIn: readNumber(settings, "intro-in-duration", 0.2, 2.5),
    introOut: readNumber(settings, "intro-out-duration", 0.2, 2.5),
    copyDelay: readNumber(settings, "copy-delay", 0, 2),
    jumpDelay: readNumber(settings, "page-jump-delay", 0, 2),
    floatDuration: readNumber(settings, "preview-float-duration", 3, 12),
    floatDistance: readNumber(settings, "preview-float-distance", 0, 18),
    slideDuration: readNumber(settings, "preview-slide-duration", 2, 12),
    panelSwitch: readNumber(settings, "panel-switch-duration", 0.2, 2.5),
    panelDelay: readNumber(settings, "panel-switch-delay", 0, 2),
    panelOverlap: readNumber(settings, "panel-overlap-duration", 0, 1.5),
    ctaFade: readNumber(settings, "cta-fade-duration", 0.1, 2),
    returnResponse: readNumber(settings, "return-response-duration", 0.05, 1),
    arrowResponse: readNumber(settings, "arrow-response-duration", 0.05, 1),
    hoverLift: readNumber(settings, "button-hover-lift", 0, 12),
  };
  sample.style.setProperty("--sample-card-exit", `${values.cardExit}s`);
  sample.style.setProperty("--sample-intro-in", `${values.introIn}s`);
  sample.style.setProperty("--sample-intro-out", `${values.introOut}s`);
  sample.style.setProperty("--sample-copy-delay", `${values.copyDelay}s`);
  sample.style.setProperty("--sample-jump-delay", `${values.jumpDelay}s`);
  sample.style.setProperty("--sample-float-duration", `${values.floatDuration}s`);
  sample.style.setProperty("--sample-float-distance", `${values.floatDistance}px`);
  sample.style.setProperty("--sample-slide-duration", `${values.slideDuration}s`);
  sample.style.setProperty("--sample-panel-switch", `${values.panelSwitch}s`);
  sample.style.setProperty("--sample-panel-delay", `${values.panelDelay}s`);
  sample.style.setProperty("--sample-panel-overlap", `${values.panelOverlap}s`);
  sample.style.setProperty("--sample-cta-fade", `${values.ctaFade}s`);
  sample.style.setProperty("--sample-return-response", `${values.returnResponse}s`);
  sample.style.setProperty("--sample-arrow-response", `${values.arrowResponse}s`);
  sample.style.setProperty("--sample-hover-lift", `${values.hoverLift}px`);
  const readout = sample.querySelector("[data-motion-readout]");
  const rows = activePage === "switch"
    ? [["パネル切替", "panel-switch-duration", values.panelSwitch], ["左右待機", "panel-switch-delay", values.panelDelay], ["重なり", "panel-overlap-duration", values.panelOverlap]]
    : activePage === "buttons"
      ? [["CTA", "cta-fade-duration", values.ctaFade], ["戻る", "return-response-duration", values.returnResponse], ["矢印", "arrow-response-duration", values.arrowResponse], ["浮き", "button-hover-lift", values.hoverLift]]
      : [["紹介表示", "intro-in-duration", values.introIn], ["本文遅延", "copy-delay", values.copyDelay], ["揺れ量", "preview-float-distance", values.floatDistance], ["スライド", "preview-slide-duration", values.slideDuration]];
  readout.innerHTML = rows.map(([label, key, value]) => `<span>${label}: ${formatSettingValue(key, value)} / ${intensityFor(key, value)}</span>`).join("");
}

/*
  Development-only layout stress helpers.
  Consoleから呼び、長いラベル・長い値でもHub Controlsが横にはみ出さないか確認する。
  本番UIにはボタンを出さない。
*/
function testHubControlsLongLabels() {
  document.querySelectorAll("[data-control-label]").forEach((label, index) => {
    const suffix = index % 2 === 0
      ? "紹介ステージフェードイン時間の非常に長いテストラベル"
      : "パネル切替時のフェードアウト・フェードイン重なり時間";
    label.textContent = `${label.textContent} / ${suffix}`;
  });
  const samples = ["0.05s / とても速い", "12.0s / とてもゆっくり", "18px / とても強い", "9999ms / debug"];
  document.querySelectorAll("[data-hub-value]").forEach((output, index) => {
    output.textContent = samples[index % samples.length];
  });
}

function resetHubControlsLabels() {
  HUB_CONTROL_SETTINGS.forEach((setting) => {
    const label = document.querySelector(`[data-control-label="${setting.key}"]`);
    if (label) label.textContent = setting.label;
  });
  applySettings(readSettings());
}

window.__testHubControlsLongLabels = testHubControlsLongLabels;
window.__resetHubControlsLabels = resetHubControlsLabels;
globalThis.__testHubControlsLongLabels = testHubControlsLongLabels;
globalThis.__resetHubControlsLabels = resetHubControlsLabels;

function currentSettingsSnapshot() {
  const snapshot = readSettings();
  return {
    name: "portfoliohub.systemToolsIntroSettings",
    version: 1,
    settings: snapshot,
  };
}

function setStatus(message) {
  if (!statusEl) return;
  statusEl.textContent = message;
  window.clearTimeout(setStatus._timer);
  setStatus._timer = window.setTimeout(() => {
    if (statusEl.textContent === message) statusEl.textContent = "";
  }, 1600);
}

async function copySettings() {
  const text = JSON.stringify(currentSettingsSnapshot(), null, 2);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("clipboard unavailable");
    }
    setStatus("コピーしました");
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setStatus(ok ? "コピーしました" : "コピーできませんでした");
    } catch {
      setStatus("コピーできませんでした");
    }
  }
}

function applySettings(settings) {
  const bgLightness = settings["bg-lightness"] ** 1.35;
  const bgWarmth = settings["bg-warmth"] ** 1.2;
  const lightStrength = settings["light-strength"] ** 1.25;
  const cardAlpha = Math.min(0.58, Math.max(0.05, settings["card-alpha"]));
  const cardBlur = Math.round(settings["card-blur"]);
  const cardBorderAlpha = Math.min(0.9, Math.max(0.08, settings["card-border-alpha"]));
  const cardShadowStrength = Math.min(0.48, Math.max(0.04, settings["card-shadow-strength"]));
  const textStrength = Math.min(1, Math.max(0.55, settings["text-strength"]));
  const scale = Math.min(1.2, Math.max(0.82, settings.scale));
  const cardGap = Math.round(settings["card-gap"]);
  const cardRadius = Math.round(settings["card-radius"]);
  const cardHeight = Math.round(settings["card-height"]);
  const cardPadding = Math.round(settings["card-padding"]);
  const lightPosition = Math.min(1.4, Math.max(0.6, settings["light-position"]));
  const lightSpread = Math.min(1.6, Math.max(0.55, settings["light-spread"]));
  const cardHighlightStrength = Math.min(0.88, Math.max(0.08, settings["card-highlight-strength"]));
  const cardInnerLight = Math.min(0.56, Math.max(0.04, settings["card-inner-light"]));
  const textShadowStrength = Math.min(0.5, Math.max(0.02, settings["text-shadow-strength"]));
  const shadowDistance = Math.min(64, Math.max(0, settings["shadow-distance"]));
  const shadowBlur = Math.min(88, Math.max(8, settings["shadow-blur"]));
  const shadowAlpha = Math.min(0.6, Math.max(0.02, settings["shadow-alpha"]));
  const shadowY = Math.min(56, Math.max(-12, settings["shadow-y"]));
  const innerHighlight = Math.min(0.92, Math.max(0.04, settings["inner-highlight"]));
  const groundShadow = Math.min(1, Math.max(0, settings["ground-shadow"]));
  const mode = readMode(settings, "shadow-mode", "Soft");
  const cardWidth = readNumber(settings, "card-width", 0.84, 1.22);
  const cardRadiusSmooth = readNumber(settings, "card-radius-smooth", 0.7, 1.4);
  const cardHighlightY = readNumber(settings, "card-highlight-y", -0.2, 0.6);
  const cardBottomTint = readNumber(settings, "card-bottom-tint", 0, 0.4);
  const bgAngle = readNumber(settings, "bg-angle", 120, 240);
  const bgContrast = readNumber(settings, "bg-contrast", 0.78, 1.3);
  const pagePaddingX = readNumber(settings, "page-padding-x", 0.72, 1.28);
  const pagePaddingY = readNumber(settings, "page-padding-y", 0.72, 1.28);
  const extensionsY = readNumber(settings, "extensions-y", -0.2, 0.8);
  const extensionsSize = readNumber(settings, "extensions-size", 0.84, 1.18);
  const pillAlpha = readNumber(settings, "pill-alpha", 0.06, 0.34);
  const pillBorderAlpha = readNumber(settings, "pill-border-alpha", 0.12, 0.7);
  const cardContentY = readNumber(settings, "card-content-y", -22, 22);
  const cardContentX = readNumber(settings, "card-content-x", -18, 18);
  const cardTextGap = readNumber(settings, "card-text-gap", 2, 18);
  const titleSize = readNumber(settings, "title-size", 0.82, 1.24);
  const jaSize = readNumber(settings, "ja-size", 0.82, 1.24);
  const subSize = readNumber(settings, "sub-size", 0.78, 1.28);
  const yearSize = readNumber(settings, "year-size", 0.76, 1.3);
  const lineHeight = readNumber(settings, "line-height", 0.88, 1.2);
  const frostStrength = readNumber(settings, "frost-strength", 0.72, 1.3);
  const edgeWhite = readNumber(settings, "edge-white", 0.72, 1.3);
  const shadowX = readNumber(settings, "shadow-x", -12, 34);
  const shadowWarmth = readNumber(settings, "shadow-warmth", 0.72, 1.3);
  const shadowSpread = readNumber(settings, "shadow-spread", 0.72, 1.4);
  const cardExitDuration = readNumber(settings, "card-exit-duration", 0.2, 2.5);
  const introInDuration = readNumber(settings, "intro-in-duration", 0.2, 2.5);
  const introOutDuration = readNumber(settings, "intro-out-duration", 0.2, 2.5);
  const copyDelay = readNumber(settings, "copy-delay", 0, 2);
  const pageJumpDelay = readNumber(settings, "page-jump-delay", 0, 2);
  const previewFloatDuration = readNumber(settings, "preview-float-duration", 3, 12);
  const previewFloatDistance = readNumber(settings, "preview-float-distance", 0, 18);
  const previewSlideDuration = readNumber(settings, "preview-slide-duration", 2, 12);
  const panelSwitchDuration = readNumber(settings, "panel-switch-duration", 0.2, 2.5);
  const panelSwitchDelay = readNumber(settings, "panel-switch-delay", 0, 2);
  const panelOverlapDuration = readNumber(settings, "panel-overlap-duration", 0, 1.5);
  const ctaFadeDuration = readNumber(settings, "cta-fade-duration", 0.1, 2);
  const returnResponseDuration = readNumber(settings, "return-response-duration", 0.05, 1);
  const arrowResponseDuration = readNumber(settings, "arrow-response-duration", 0.05, 1);
  const buttonHoverLift = readNumber(settings, "button-hover-lift", 0, 12);

  const shadowPresets = {
    Soft: { distance: 18, blur: 38, alpha: 0.18, y: 12, inner: 0.58, ground: 0.14 },
    Floating: { distance: 24, blur: 44, alpha: 0.16, y: 10, inner: 0.66, ground: 0.1 },
    Deep: { distance: 36, blur: 52, alpha: 0.26, y: 20, inner: 0.48, ground: 0.2 },
    Flat: { distance: 10, blur: 20, alpha: 0.08, y: 6, inner: 0.42, ground: 0.08 },
    Glow: { distance: 20, blur: 48, alpha: 0.12, y: 10, inner: 0.78, ground: 0.06 },
  };
  const preset = shadowPresets[mode] || shadowPresets.Soft;
  const shadowDistanceFinal = shadowDistance;
  const shadowBlurFinal = shadowBlur;
  const shadowAlphaFinal = Math.max(shadowAlpha, preset.alpha);
  const shadowYFinal = shadowY;
  const innerHighlightFinal = Math.max(innerHighlight, preset.inner);
  const groundShadowFinal = Math.max(groundShadow, preset.ground);

  root.style.setProperty("--hub-bg-lightness", bgLightness);
  root.style.setProperty("--hub-bg-warmth", bgWarmth);
  root.style.setProperty("--hub-light-strength", lightStrength);
  root.style.setProperty("--hub-card-alpha", cardAlpha);
  root.style.setProperty("--hub-card-blur", `${cardBlur}px`);
  root.style.setProperty("--hub-card-border-alpha", cardBorderAlpha);
  root.style.setProperty("--hub-card-shadow-strength", cardShadowStrength);
  root.style.setProperty("--hub-text-strength", textStrength);
  root.style.setProperty("--hub-scale", scale);
  root.style.setProperty("--hub-card-gap", `${cardGap}px`);
  root.style.setProperty("--hub-card-radius", cardRadius);
  root.style.setProperty("--hub-card-height", cardHeight);
  root.style.setProperty("--hub-card-padding", `${cardPadding}px`);
  root.style.setProperty("--hub-light-position", lightPosition);
  root.style.setProperty("--hub-light-spread", lightSpread);
  root.style.setProperty("--hub-card-highlight-strength", cardHighlightStrength);
  root.style.setProperty("--hub-card-inner-light", cardInnerLight);
  root.style.setProperty("--hub-text-shadow-strength", textShadowStrength);
  root.style.setProperty("--hub-shadow-distance", `${shadowDistanceFinal}px`);
  root.style.setProperty("--hub-shadow-blur", `${shadowBlurFinal}px`);
  root.style.setProperty("--hub-shadow-alpha", shadowAlphaFinal);
  root.style.setProperty("--hub-shadow-y", `${shadowYFinal}px`);
  root.style.setProperty("--hub-inner-highlight", innerHighlightFinal);
  root.style.setProperty("--hub-ground-shadow", groundShadowFinal);
  root.style.setProperty("--hub-shadow-mode", mode);
  root.style.setProperty("--hub-card-width", cardWidth);
  root.style.setProperty("--hub-card-radius-smooth", cardRadiusSmooth);
  root.style.setProperty("--hub-card-highlight-y", cardHighlightY);
  root.style.setProperty("--hub-card-bottom-tint", cardBottomTint);
  root.style.setProperty("--hub-bg-angle", `${bgAngle}deg`);
  root.style.setProperty("--hub-bg-contrast", bgContrast);
  root.style.setProperty("--hub-page-padding-x", pagePaddingX);
  root.style.setProperty("--hub-page-padding-y", pagePaddingY);
  root.style.setProperty("--hub-extensions-y", extensionsY);
  root.style.setProperty("--hub-extensions-size", extensionsSize);
  root.style.setProperty("--hub-pill-alpha", pillAlpha);
  root.style.setProperty("--hub-pill-border-alpha", pillBorderAlpha);
  root.style.setProperty("--hub-card-content-y", `${cardContentY}px`);
  root.style.setProperty("--hub-card-content-x", `${cardContentX}px`);
  root.style.setProperty("--hub-card-text-gap", `${cardTextGap}px`);
  root.style.setProperty("--hub-title-size", titleSize);
  root.style.setProperty("--hub-ja-size", jaSize);
  root.style.setProperty("--hub-sub-size", subSize);
  root.style.setProperty("--hub-year-size", yearSize);
  root.style.setProperty("--hub-line-height", lineHeight);
  root.style.setProperty("--hub-frost-strength", frostStrength);
  root.style.setProperty("--hub-edge-white", edgeWhite);
  root.style.setProperty("--hub-shadow-x", `${shadowX}px`);
  root.style.setProperty("--hub-shadow-warmth", shadowWarmth);
  root.style.setProperty("--hub-shadow-spread", shadowSpread);
  root.style.setProperty("--hub-card-exit-duration", `${cardExitDuration}s`);
  root.style.setProperty("--hub-intro-in-duration", `${introInDuration}s`);
  root.style.setProperty("--hub-intro-out-duration", `${introOutDuration}s`);
  root.style.setProperty("--hub-copy-delay", `${copyDelay}s`);
  root.style.setProperty("--hub-page-jump-delay", `${pageJumpDelay}s`);
  root.style.setProperty("--hub-preview-float-duration", `${previewFloatDuration}s`);
  root.style.setProperty("--hub-preview-float-distance", `${previewFloatDistance}px`);
  root.style.setProperty("--hub-preview-slide-duration", `${previewSlideDuration}s`);
  root.style.setProperty("--hub-panel-switch-duration", `${panelSwitchDuration}s`);
  root.style.setProperty("--hub-panel-switch-delay", `${panelSwitchDelay}s`);
  root.style.setProperty("--hub-panel-overlap-duration", `${panelOverlapDuration}s`);
  root.style.setProperty("--hub-cta-fade-duration", `${ctaFadeDuration}s`);
  root.style.setProperty("--hub-return-response-duration", `${returnResponseDuration}s`);
  root.style.setProperty("--hub-arrow-response-duration", `${arrowResponseDuration}s`);
  root.style.setProperty("--hub-button-hover-lift", `${buttonHoverLift}px`);

  controls.forEach((control) => {
    const key = control.dataset.hubControl;
    if (settings[key] !== undefined) {
      control.value = settings[key];
    } else if (defaults[key] !== undefined) {
      control.value = defaults[key];
    }
  });
  updateValueOutputs({ ...settings, ...{
    "card-exit-duration": cardExitDuration,
    "intro-in-duration": introInDuration,
    "intro-out-duration": introOutDuration,
    "copy-delay": copyDelay,
    "page-jump-delay": pageJumpDelay,
    "preview-float-duration": previewFloatDuration,
    "preview-float-distance": previewFloatDistance,
    "preview-slide-duration": previewSlideDuration,
    "panel-switch-duration": panelSwitchDuration,
    "panel-switch-delay": panelSwitchDelay,
    "panel-overlap-duration": panelOverlapDuration,
    "cta-fade-duration": ctaFadeDuration,
    "return-response-duration": returnResponseDuration,
    "arrow-response-duration": arrowResponseDuration,
    "button-hover-lift": buttonHoverLift,
  } });
  updateMotionSample(settings);
}

function setOpen(open) {
  if (!panel || !toggle) return;
  panel.classList.toggle("is-open", open);
  panel.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
}

function syncAndSave() {
  const settings = readSettings();
  controls.forEach((control) => {
    const key = control.dataset.hubControl;
    settings[key] = control.tagName === "SELECT" ? control.value : toValue(key, control.value);
  });
  applySettings(settings);
  writeSettings(settings);
}

setupSettingsPanel();

const initialSettings = readSettings();
applySettings(initialSettings);

controls.forEach((control) => {
  control.addEventListener("input", syncAndSave);
  control.addEventListener("change", syncAndSave);
});

if (toggle && panel) {
  toggle.addEventListener("click", () => {
    setOpen(!panel.classList.contains("is-open"));
  });
}

if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));

if (copyBtn) copyBtn.addEventListener("click", copySettings);

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    applySettings(defaults);
    writeSettings(defaults);
    setStatus("初期値に戻しました");
  });
}

function renderPreview(index) {
  const item = previewItems[index];
  if (!item || !previewTitle || !previewHeading || !previewSubcopy || !previewChips || !previewCopy || !previewTrack || !previewCaption || !previewOpen) return;
  currentPreviewIndex = index;
  previewTitle.textContent = item.title;
  previewHeading.textContent = item.heading;
  previewSubcopy.textContent = item.subcopy;
  previewChips.innerHTML = item.chips.map((chip) => `<span>${chip}</span>`).join("");
  previewCopy.innerHTML = item.copy.map((paragraph) => `<p>${paragraph}</p>`).join("");
  const images = [...item.images, item.images[0]];
  previewTrack.innerHTML = images
    .map((image, imageIndex) => {
      const alt = imageIndex >= item.images.length ? "" : `${item.title} preview ${imageIndex + 1}`;
      const hidden = imageIndex >= item.images.length ? ' aria-hidden="true"' : "";
      return `<img src="./assets/img/${image}" alt="${alt}"${hidden} />`;
    })
    .join("");
  previewCaption.textContent = item.caption;
  previewOpen.textContent = item.cta;
  previewOpen.href = item.href;
  previewStage?.setAttribute("aria-label", `${item.title} introduction`);
}

function switchPreview(direction) {
  if (!page || !previewPanel) return;
  page.classList.add("is-preview-switching");
  window.setTimeout(() => {
    const nextIndex = (currentPreviewIndex + direction + previewItems.length) % previewItems.length;
    renderPreview(nextIndex);
    window.setTimeout(() => page.classList.remove("is-preview-switching"), settingMs("panel-overlap-duration"));
  }, settingMs("panel-switch-delay"));
}

function setPortfolioPreview(open, index = currentPreviewIndex) {
  if (!page || !previewStage) return;
  if (open) {
    renderPreview(index);
    page.classList.add("is-system-preview");
    page.classList.remove("is-system-preview-leaving", "is-preview-switching");
    previewStage.setAttribute("aria-hidden", "false");
    setOpen(false);
    window.setTimeout(() => {
      window.scrollTo({
        top: Math.max(0, previewStage.offsetTop - 16),
        behavior: "smooth",
      });
    }, 300);
    return;
  }
  page.classList.add("is-system-preview-leaving");
  window.setTimeout(() => {
    page.classList.remove("is-system-preview", "is-system-preview-leaving", "is-preview-switching");
    previewStage.setAttribute("aria-hidden", "true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, settingMs("intro-out-duration"));
}

function openCurrentPreviewPage() {
  if (!page || !previewOpen) return;
  page.classList.add("is-system-preview-leaving");
  window.setTimeout(() => {
    window.location.href = previewOpen.href;
  }, settingMs("page-jump-delay"));
}

previewCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const index = previewItems.findIndex((item) => item.id === card.id);
    setPortfolioPreview(true, index >= 0 ? index : 0);
  });
});

if (previewBack) previewBack.addEventListener("click", () => setPortfolioPreview(false));

if (previewOpen) {
  previewOpen.addEventListener("click", (event) => {
    event.preventDefault();
    openCurrentPreviewPage();
  });
}

if (previewPrev) previewPrev.addEventListener("click", () => switchPreview(-1));

if (previewNext) previewNext.addEventListener("click", () => switchPreview(1));

renderPreview(currentPreviewIndex);

document.addEventListener("click", (event) => {
  if (!panel || !toggle) return;
  if (!panel.classList.contains("is-open")) return;
  const target = event.target;
  if (panel.contains(target) || toggle.contains(target)) return;
  setOpen(false);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
