const HUB_PUBLIC_DEMO_ADMIN_KEY = "portfoliohub.adminMode";
const HUB_PUBLIC_DEMO_ADMIN_TOKEN = "karagaki-local";
function syncHubPublicDemoAdminMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("disableAdmin") === "1") {
      localStorage.removeItem(HUB_PUBLIC_DEMO_ADMIN_KEY);
    }
    if (params.get("enableAdmin") === HUB_PUBLIC_DEMO_ADMIN_TOKEN || params.get("creator") === HUB_PUBLIC_DEMO_ADMIN_TOKEN || params.get("admin") === HUB_PUBLIC_DEMO_ADMIN_TOKEN) {
      localStorage.setItem(HUB_PUBLIC_DEMO_ADMIN_KEY, "1");
    }
    return localStorage.getItem(HUB_PUBLIC_DEMO_ADMIN_KEY) === "1";
  } catch {
    return false;
  }
}
const HUB_PUBLIC_DEMO_ADMIN_MODE = syncHubPublicDemoAdminMode();
document.documentElement.classList.toggle("hub-public-demo-admin-locked", !HUB_PUBLIC_DEMO_ADMIN_MODE);

const root = document.documentElement;
const STORAGE_KEY = "portfoliohub.systemToolsIntroSettings";
const LEGACY_STORAGE_KEY = "portfoliohub.visual-settings.v1";

const defaults = {
  "bg-lightness": 0.82,
  "bg-warmth": 1.42,
  "light-strength": 2,
  "card-alpha": 0.19,
  "card-blur": 8,
  "card-border-alpha": 0.59,
  "card-shadow-strength": 0.24,
  "text-strength": 1,
  scale: 1.06,
  "card-gap": 6,
  "card-radius": 16,
  "card-height": 380,
  "card-padding": 34,
  "light-position": 1.5,
  "light-spread": 0.83,
  "card-highlight-strength": 0.9,
  "card-inner-light": 0.02,
  "text-shadow-strength": 0.21,
  "hover-text-shadow-color": "#b3a18f",
  "shadow-distance": 10,
  "shadow-blur": 8,
  "shadow-alpha": 0.5,
  "shadow-y": 10,
  "inner-highlight": 0.04,
  "ground-shadow": 0.72,
  "shadow-mode": "Soft",
  "card-width": 0.98,
  "card-radius-smooth": 0.82,
  "card-highlight-y": 0.18,
  "card-bottom-tint": 0.4,
  "bg-angle": 240,
  "bg-contrast": 1.3,
  "page-padding-x": 1.28,
  "page-padding-y": 1.28,
  "extensions-y": 0.49,
  "extensions-size": 0.84,
  "pill-alpha": 0.17,
  "pill-border-alpha": 0.32,
  "card-content-y": -12,
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
  "card-exit-duration": 1.6,
  "intro-in-duration": 1.9,
  "intro-out-duration": 0.2,
  "copy-delay": 0,
  "page-jump-delay": 0,
  "preview-float-duration": 3,
  "preview-float-distance": 0,
  "preview-slide-duration": 2,
  "card-preview-fade-duration": 1.5,
  "card-preview-opacity": 0.45,
  "panel-switch-duration": 2.5,
  "panel-switch-delay": 2,
  "panel-overlap-duration": 1.5,
  "cta-fade-duration": 0.7,
  "return-response-duration": 0.15,
  "arrow-response-duration": 0.5,
  "button-hover-lift": 6,
  "card-preview-slide-duration": 0.5,
  "ui-heading-size": 22,
  "ui-subheading-size": 14,
  "ui-tab-font-size": 16,
  "ui-chip-font-size": 16,
  "ui-label-size": 16,
  "ui-value-size": 16,
  "ui-button-font-size": 16,
  "ui-panel-width": 320,
  "ui-panel-padding": 14,
  "ui-section-gap": 0,
  "ui-row-gap": 0,
  "ui-chip-gap": 0,
  "ui-button-gap": 8,
  "ui-value-width": 72,
  "ui-slider-width": 100,
  "ui-slider-right-gap": 24,
  "ui-slider-row-height": 18,
  "ui-track-height": 6,
  "ui-thumb-width": 16,
  "ui-thumb-height": 16,
  "ui-thumb-radius": 8,
  "ui-thumb-shadow": 2,
  "ui-track-sink": 2,
  "ui-tab-radius": 8,
  "ui-chip-radius": 8,
  "ui-tab-emboss": 2,
  "ui-chip-emboss": 2

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
  { key: "preview-slide-duration", category: "intro", label: "紹介カード内スライド速度", unit: "s", min: 0.5, max: 12, step: 0.5, default: 2, strengthType: "speed" },
  { key: "card-preview-fade-duration", category: "intro", label: "背景フェード秒", unit: "s", min: 0.1, max: 3, step: 0.1, default: 1.5, strengthType: "speed" },
  { key: "card-preview-slide-duration", category: "intro", label: "TOP背景スライド速度", unit: "s", min: 0.5, max: 12, step: 0.5, default: 0.5, strengthType: "speed" },
  { key: "card-preview-opacity", category: "intro", label: "背景表示濃度", min: 0.1, max: 5, step: 0.01, default: 0.45, strengthType: "amount" },
  { key: "panel-switch-duration", category: "switch", label: "パネル切替フェード時間", unit: "s", min: 0.2, max: 2.5, step: 0.1, default: 0.6, strengthType: "speed" },
  { key: "panel-switch-delay", category: "switch", label: "左右切替待機", unit: "s", min: 0, max: 2, step: 0.1, default: 0.2, strengthType: "speed" },
  { key: "panel-overlap-duration", category: "switch", label: "スライド切替の重なり時間", unit: "s", min: 0, max: 1.5, step: 0.05, default: 0.25, strengthType: "speed" },
  { key: "cta-fade-duration", category: "buttons", label: "CTAフェード時間", unit: "s", min: 0.1, max: 2, step: 0.1, default: 0.5, strengthType: "speed" },
  { key: "return-response-duration", category: "buttons", label: "戻るボタン反応速度", unit: "s", min: 0.05, max: 1, step: 0.05, default: 0.18, strengthType: "speed" },
  { key: "arrow-response-duration", category: "buttons", label: "左右矢印反応速度", unit: "s", min: 0.05, max: 1, step: 0.05, default: 0.18, strengthType: "speed" },
  { key: "button-hover-lift", category: "buttons", label: "hover浮き量", unit: "px", min: 0, max: 12, step: 1, default: 2, strengthType: "amount" },
  { key: "ui-heading-size", category: "ui", label: "見出しサイズ", unit: "px", min: 14, max: 22, step: 0.5, default: 17 },
  { key: "ui-subheading-size", category: "ui", label: "小見出しサイズ", unit: "px", min: 9, max: 14, step: 0.5, default: 10.5 },
  { key: "ui-tab-font-size", category: "ui", label: "タブ文字サイズ", unit: "px", min: 10, max: 16, step: 0.5, default: 11.5 },
  { key: "ui-chip-font-size", category: "ui", label: "チップ文字サイズ", unit: "px", min: 10, max: 16, step: 0.5, default: 11 },
  { key: "ui-label-size", category: "ui", label: "項目ラベルサイズ", unit: "px", min: 10, max: 16, step: 0.5, default: 11.5 },
  { key: "ui-value-size", category: "ui", label: "数値サイズ", unit: "px", min: 10, max: 16, step: 0.5, default: 11.2 },
  { key: "ui-button-font-size", category: "ui", label: "ボタン文字サイズ", unit: "px", min: 10, max: 16, step: 0.5, default: 11.2 },
  { key: "ui-panel-width", category: "ui", label: "パネル幅", unit: "px", min: 220, max: 320, step: 1, default: 260 },
  { key: "ui-panel-padding", category: "ui", label: "パネル内余白", unit: "px", min: 2, max: 14, step: 1, default: 6 },
  { key: "ui-section-gap", category: "ui", label: "セクション間隔", unit: "px", min: 0, max: 12, step: 1, default: 4 },
  { key: "ui-row-gap", category: "ui", label: "行間", unit: "px", min: 0, max: 8, step: 1, default: 2 },
  { key: "ui-chip-gap", category: "ui", label: "チップ間隔", unit: "px", min: 0, max: 8, step: 1, default: 2 },
  { key: "ui-button-gap", category: "ui", label: "ボタン間隔", unit: "px", min: 0, max: 8, step: 1, default: 2 },
  { key: "ui-value-width", category: "ui", label: "数値幅", unit: "px", min: 36, max: 72, step: 1, default: 50 },
  { key: "ui-slider-width", category: "ui", label: "スライダー幅", unit: "%", min: 0, max: 100, step: 1, default: 100 },
  { key: "ui-slider-right-gap", category: "ui", label: "スライダー右余白", unit: "px", min: 0, max: 24, step: 1, default: 0 },
  { key: "ui-slider-row-height", category: "ui", label: "スライダー行高さ", unit: "px", min: 8, max: 18, step: 1, default: 12 },
  { key: "ui-track-height", category: "ui", label: "スライダー軸の太さ", unit: "px", min: 3, max: 6, step: 0.5, default: 4 },
  { key: "ui-thumb-width", category: "ui", label: "thumb幅", unit: "px", min: 10, max: 16, step: 1, default: 12 },
  { key: "ui-thumb-height", category: "ui", label: "thumb高さ", unit: "px", min: 8, max: 16, step: 1, default: 10 },
  { key: "ui-thumb-radius", category: "ui", label: "thumb角丸", unit: "px", min: 0, max: 8, step: 1, default: 4 },
  { key: "ui-thumb-shadow", category: "ui", label: "thumb影", min: 0, max: 2, step: 0.1, default: 1 },
  { key: "ui-track-sink", category: "ui", label: "track凹み強度", min: 0, max: 2, step: 0.1, default: 1 },
  { key: "ui-tab-radius", category: "ui", label: "タブ角丸", unit: "px", min: 0, max: 8, step: 1, default: 3 },
  { key: "ui-chip-radius", category: "ui", label: "チップ角丸", unit: "px", min: 0, max: 8, step: 1, default: 3 },
  { key: "ui-tab-emboss", category: "ui", label: "タブ凹凸強度", min: 0, max: 2, step: 0.1, default: 1 },
  { key: "ui-chip-emboss", category: "ui", label: "チップ凹凸強度", min: 0, max: 2, step: 0.1, default: 1 },
];

HUB_CONTROL_SETTINGS.forEach((setting) => {
  if (defaults[setting.key] === undefined) defaults[setting.key] = setting.default;
});

const settingDefinitionByKey = new Map(HUB_CONTROL_SETTINGS.map((setting) => [setting.key, setting]));

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
const cardHoverSummary = document.querySelector("[data-card-hover-summary]");
const cardHoverText = document.querySelector("[data-card-hover-text]");
const previewCards = Array.from(document.querySelectorAll(".cards .card"));
const cardPreviewBackdrop = document.createElement("div");
cardPreviewBackdrop.className = "card-preview-backdrop";
cardPreviewBackdrop.setAttribute("aria-hidden", "true");
cardPreviewBackdrop.innerHTML = '<div class="card-preview-backdrop__layer is-visible" data-card-preview-layer="0"></div><div class="card-preview-backdrop__layer" data-card-preview-layer="1"></div>';
document.body.prepend(cardPreviewBackdrop);
const cardPreviewLayers = Array.from(cardPreviewBackdrop.querySelectorAll("[data-card-preview-layer]"));
let activeCardPreviewId = "";
let activeCardPreviewImages = [];
let activeCardPreviewIndex = 0;
let activeCardPreviewLayer = 0;
let cardPreviewTimer = 0;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cardPreviewImagePath(image) {
  return image ? `./assets/img/${image}` : "";
}

function restartCardPreviewTimer() {
  stopCardPreviewTimer();
  if (activeCardPreviewImages.length > 1) {
    cardPreviewTimer = window.setInterval(advanceCardPreviewSlide, cardPreviewIntervalMs());
  }
}

function cardPreviewIntervalMs() {
  const fade = settingMs("card-preview-fade-duration");
  const slide = settingMs("card-preview-slide-duration");
  return Math.max(slide, fade + 100);
}

function stopCardPreviewTimer() {
  if (!cardPreviewTimer) return;
  window.clearInterval(cardPreviewTimer);
  cardPreviewTimer = 0;
}

function showCardPreviewImage(image) {
  if (!image || !cardPreviewLayers.length) return;
  activeCardPreviewLayer = activeCardPreviewLayer === 0 ? 1 : 0;
  const nextLayer = cardPreviewLayers[activeCardPreviewLayer];
  const prevLayer = cardPreviewLayers[activeCardPreviewLayer === 0 ? 1 : 0];
  nextLayer.style.backgroundImage = `url("${cardPreviewImagePath(image)}")`;
  window.requestAnimationFrame(() => {
    nextLayer.classList.add("is-visible");
    prevLayer.classList.remove("is-visible");
  });
}

function advanceCardPreviewSlide() {
  if (activeCardPreviewImages.length <= 1) return;
  activeCardPreviewIndex = (activeCardPreviewIndex + 1) % activeCardPreviewImages.length;
  showCardPreviewImage(activeCardPreviewImages[activeCardPreviewIndex]);
}

function startCardPreview(card) {
  if (!page || !card) return;
  const item = previewItems.find((previewItem) => previewItem.id === card.id);
  if (!item || !item.images.length) return;

  activeCardPreviewId = item.id;
  activeCardPreviewImages = item.images.slice();
  activeCardPreviewIndex = 0;
  stopCardPreviewTimer();

  cardPreviewLayers.forEach((layer) => {
    layer.classList.remove("is-visible");
    layer.style.backgroundImage = "";
  });

  activeCardPreviewLayer = 0;
  cardPreviewLayers[activeCardPreviewLayer].style.backgroundImage = `url("${cardPreviewImagePath(activeCardPreviewImages[0])}")`;
  cardPreviewLayers[activeCardPreviewLayer].classList.add("is-visible");
  page.classList.add("has-card-preview");
  cardPreviewBackdrop.classList.add("is-active");
  showCardPreviewImage(activeCardPreviewImages[0]);
  restartCardPreviewTimer();
}

function stopCardPreview() {
  stopCardPreviewTimer();
  activeCardPreviewId = "";
  activeCardPreviewImages = [];
  activeCardPreviewIndex = 0;
  page?.classList.remove("has-card-preview");
  cardPreviewBackdrop.classList.remove("is-active");
}

function syncCardBackdropState() {
  if (!page) return;
  const focusedCard = previewCards.find((card) => card.matches(":focus-visible"));
  if (focusedCard) {
    if (activeCardPreviewId !== focusedCard.id) startCardPreview(focusedCard);
    return;
  }
  const hoveredCard = previewCards.find((card) => card.matches(":hover"));
  if (hoveredCard) {
    if (activeCardPreviewId !== hoveredCard.id) startCardPreview(hoveredCard);
    return;
  }
  stopCardPreview();
}

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
    hoverCopy: ["これまで携わってきたグラフィック制作の実績を、", "個人制作と仕事での表現の幅が伝わるように整理したポートフォリオです。", "イラスト、キャラクター、デザインなどの経験をまとめ、今後の制作や仕事につながる実績として構成しています。"],
    cta: "ポートフォリオを見る",
    href: document.querySelector("#graphic")?.getAttribute("href") || "https://karagaki.github.io/testportfolio/",
    images: [
      "system-tools-preview-02_2.png",
      "system-tools-preview-02_3.png",
    ],
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
    hoverCopy: ["ChatAIとの制作対話で生まれる仕様、判断、失敗の流れ、", "会話内のルールを分類し、次の制作へ活用するためのローカル管理ツールです。", "永続メモリの代替として制作の前提を蓄積し、自分の判断基準や制作方針を反映した「分身」の土台として発展させていきます。"],
    cta: "ツールを見る",
    href: document.querySelector("#system-tools")?.getAttribute("href") || "./system-tools/index.html",
    images: [
      "system-tools-preview-01_1.png",
    ],
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
    hoverCopy: ["AI生成が広がる中で、生成AIとは別の角度から、", "コードによる絵作りや動きの表現を追求するために制作した研究ツールです。", "描画、アニメーション、操作感を組み合わせ、将来的なロボットアームによる描画・彫刻など、実体制作との連係も視野に入れて継続して検証していきます。"],
    cta: "ツールを見る",
    href: document.querySelector("#uiux-animation-tools")?.getAttribute("href") || "./uiux-animation-tools/index.html",
    images: [
      "system-tools-preview-03_1.png",
      "system-tools-preview-03_2.png",
      "system-tools-preview-03_3.png",
    ],
  },
];
let currentPreviewIndex = 1;

function setActiveTopCard(card) {
  const cardsWrap = document.querySelector(".cards");
  if (!cardsWrap) return;
  previewCards.forEach((previewCard) => {
    previewCard.classList.toggle("is-active-card", Boolean(card && previewCard === card));
  });
  cardsWrap.classList.toggle("has-active-card", Boolean(card));
}

function currentInteractiveCard() {
  const focusedCard = previewCards.find((card) => card.matches(":focus-visible") || card.matches(":focus-within"));
  const hoveredCard = previewCards.find((card) => card.matches(":hover"));
  return focusedCard || hoveredCard || null;
}

function showCardHoverSummary(card) {
  if (!cardHoverSummary || !cardHoverText || !card) return;
  const item = previewItems.find((previewItem) => previewItem.id === card.id);
  if (!item) return;
  setActiveTopCard(card);
  const copy = Array.isArray(item.hoverCopy) ? item.hoverCopy : [item.hoverCopy || item.subcopy || ""];
  cardHoverText.innerHTML = copy
    .filter(Boolean)
    .map((line, index) => `<span class="card-hover-summary__line card-hover-summary__line--${index + 1}">${escapeHtml(line)}</span>`)
    .join("");
  cardHoverSummary.classList.remove("is-visible");
  window.requestAnimationFrame(() => {
    cardHoverSummary.classList.add("is-visible");
  });
}

function hideCardHoverSummary() {
  if (!cardHoverSummary || !cardHoverText) return;
  const activeCard = currentInteractiveCard();
  if (activeCard) {
    showCardHoverSummary(activeCard);
    return;
  }
  setActiveTopCard(null);
  cardHoverSummary.classList.remove("is-visible");
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function toValue(key, raw) {
  if (key === "hover-text-shadow-color") {
    return isHexColor(raw) ? raw : defaults[key];
  }
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

const appearanceCategoryDefinitions = [
  {
    id: "background",
    label: "背景",
    openKey: "bg-lightness",
    items: [
      { key: "bg-lightness", label: "背景明るさ" },
      { key: "bg-warmth", label: "背景暖色" },
      { key: "light-strength", label: "背景光" },
      { key: "bg-angle", label: "背景角度" },
      { key: "bg-contrast", label: "背景対比" },
    ],
  },
  {
    id: "card",
    label: "カード",
    openKey: "card-alpha",
    items: [
      { key: "card-alpha", label: "透明度" },
      { key: "card-blur", label: "カードぼかし" },
      { key: "card-border-alpha", label: "境界線" },
      { key: "card-shadow-strength", label: "カード影" },
      { key: "card-width", label: "カード幅" },
      { key: "card-height", label: "カード高さ" },
      { key: "card-radius", label: "カード角丸" },
      { key: "card-radius-smooth", label: "丸み補正" },
    ],
  },
  {
    id: "text",
    label: "文字",
    openKey: "card-content-y",
    items: [
      { key: "card-content-y", label: "文字上下" },
      { key: "card-content-x", label: "文字左右" },
      { key: "card-text-gap", label: "文字間隔" },
      { key: "title-size", label: "タイトル" },
      { key: "ja-size", label: "日本語" },
      { key: "sub-size", label: "英語" },
      { key: "year-size", label: "年代" },
      { key: "line-height", label: "文字行間" },
      { key: "text-strength", label: "文字明るさ" },
      { key: "text-shadow-strength", label: "文字影" },
      { key: "hover-text-shadow-color", label: "説明影色" },
    ],
  },
  {
    id: "spacing",
    label: "余白",
    openKey: "card-padding",
    items: [
      { key: "card-padding", label: "内余白" },
      { key: "frost-strength", label: "内寄り" },
      { key: "page-padding-x", label: "横余白" },
      { key: "page-padding-y", label: "縦余白" },
      { key: "scale", label: "全体サイズ" },
      { key: "extensions-y", label: "Extensions位置" },
      { key: "extensions-size", label: "Extensionsサイズ" },
      { key: "card-gap", label: "カード間隔" },
      { key: "shadow-distance", label: "距離" },
      { key: "shadow-spread", label: "広がり" },
    ],
  },
  {
    id: "effect",
    label: "効果",
    openKey: "card-highlight-y",
    items: [
      { key: "card-highlight-y", label: "上光位置" },
      { key: "card-bottom-tint", label: "下影濃度" },
      { key: "edge-white", label: "白フチ" },
      { key: "inner-highlight", label: "背景内光" },
      { key: "ground-shadow", label: "接地感" },
      { key: "shadow-alpha", label: "影の濃さ" },
      { key: "shadow-blur", label: "影ぼかし" },
      { key: "shadow-y", label: "影下方向" },
      { key: "shadow-x", label: "影横方向" },
      { key: "shadow-warmth", label: "影色暖色" },
      { key: "shadow-mode", label: "方式" },
      { key: "pill-alpha", label: "pill透明度" },
      { key: "pill-border-alpha", label: "pill境界線" },
    ],
  },
];

const appearanceCategoryById = new Map(appearanceCategoryDefinitions.map((category) => [category.id, category]));
const appearanceCategoryByKey = new Map();
const appearanceLabelByKey = new Map();
appearanceCategoryDefinitions.forEach((category) => {
  category.items.forEach((item) => {
    appearanceCategoryByKey.set(item.key, category.id);
    appearanceLabelByKey.set(item.key, item.label);
  });
});

function formatSettingValue(key, value) {
  const meta = settingDefinitionByKey.get(key);
  if (meta?.unit === "px") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return `${Number.isInteger(numeric) ? numeric.toFixed(0) : numeric.toFixed(1)}px`;
  }
  if (meta?.unit === "%") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return `${Math.round(numeric)}%`;
  }
  if (key === "preview-float-distance" || key === "button-hover-lift") return `${Math.round(value)}px`;
  if (
    key === "card-exit-duration" ||
    key === "intro-in-duration" ||
    key === "intro-out-duration" ||
    key === "copy-delay" ||
    key === "page-jump-delay" ||
    key === "preview-float-duration" ||
    key === "preview-slide-duration" ||
    key === "card-preview-fade-duration" ||
    key === "card-preview-slide-duration" ||
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

function formatAppearanceSummaryValue(key, value) {
  if (key === "shadow-mode" || key === "hover-text-shadow-color") return String(value ?? defaults[key]);
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? defaults[key] ?? "");
  return String(numeric);
}

function intensityFor(key, value) {
  if (key.startsWith("ui-")) return "";
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
    key === "preview-slide-duration" ||
    key === "card-preview-slide-duration"
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
    const value = settings[key] ?? defaults[key];
    if (output.dataset.appearanceValue === "true") {
      output.textContent = formatAppearanceSummaryValue(key, value);
      return;
    }
    if (key === "hover-text-shadow-color") {
      output.textContent = String(value || defaults[key]);
      return;
    }
    const numericValue = Number(value);
    if (key.startsWith("ui-")) {
      output.textContent = formatSettingValue(key, numericValue);
      return;
    }
    output.textContent = `${formatSettingValue(key, numericValue)} / ${intensityFor(key, numericValue)}`;
  });
}

function syncControlProgress(settings) {
  document.querySelectorAll("[data-hub-control]").forEach((control) => {
    if (control.tagName === "SELECT" || control.type === "color") return;
    const key = control.dataset.hubControl;
    const min = Number(control.min);
    const max = Number(control.max);
    const value = Number(settings[key] ?? control.value ?? defaults[key]);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) return;
    const progress = ((value - min) / (max - min)) * 100;
    const clamped = `${Math.min(100, Math.max(0, progress))}`;
    control.style.setProperty("--settings-control-progress", clamped);
    control.style.setProperty("--appearance-progress", clamped);
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
  "card-preview-fade-duration",
  "card-preview-slide-duration",
  "card-preview-opacity",
];

const settingsPages = [
  { id: "intro", label: "紹介ステージ" },
  { id: "switch", label: "パネル切替" },
  { id: "buttons", label: "ボタン / 導線" },
  { id: "appearance", label: "外観" },
  { id: "ui", label: "UI調整" },
];

function controlTemplate({ key, label, min, max, step }) {
  return `
    <div class="control-row" data-control-key="${key}">
      <div class="control-meta">
        <label class="control-label" for="hub-control-${key}" data-control-label="${key}" data-default-label="${label}">${label}</label>
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

function controlsForKeys(keys) {
  return keys
    .map((key) => {
      const setting = settingDefinitionByKey.get(key);
      return setting ? controlTemplate(setting) : "";
    })
    .join("");
}

const uiAdjustmentGroups = [
  {
    label: "文字サイズ系",
    keys: [
      "ui-heading-size",
      "ui-subheading-size",
      "ui-tab-font-size",
      "ui-chip-font-size",
      "ui-label-size",
      "ui-value-size",
      "ui-button-font-size",
    ],
  },
  {
    label: "パネル密度系",
    keys: [
      "ui-panel-width",
      "ui-panel-padding",
      "ui-section-gap",
      "ui-row-gap",
      "ui-chip-gap",
      "ui-button-gap",
      "ui-value-width",
    ],
  },
  {
    label: "スライダー表示系",
    keys: [
      "ui-slider-width",
      "ui-slider-right-gap",
      "ui-slider-row-height",
      "ui-track-height",
      "ui-thumb-width",
      "ui-thumb-height",
      "ui-thumb-radius",
      "ui-thumb-shadow",
      "ui-track-sink",
    ],
  },
  {
    label: "タブ / チップ形状系",
    keys: [
      "ui-tab-radius",
      "ui-chip-radius",
      "ui-tab-emboss",
      "ui-chip-emboss",
    ],
  },
];

function createAppearanceItem(node, key, label) {
  const control = node.querySelector("[data-hub-control]");
  if (!control) return null;

  const row = document.createElement("article");
  row.className = "appearance-item";
  row.dataset.appearanceItem = key;

  const summaryId = `hub-appearance-summary-${key}`;
  const valueKind = control.tagName === "SELECT" ? "mode" : "number";
  const clonedControl = control.cloneNode(true);
  clonedControl.id = `hub-control-${key}`;
  clonedControl.setAttribute("aria-label", label);
  clonedControl.classList.add(control.tagName === "SELECT" ? "control-select" : "control-range");

  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "appearance-item__summary";
  summary.id = summaryId;
  summary.dataset.appearanceToggle = key;
  summary.setAttribute("aria-controls", `hub-appearance-panel-${key}`);
  summary.setAttribute("aria-expanded", "false");

  const labelEl = document.createElement("span");
  labelEl.className = "appearance-item__label";
  labelEl.textContent = label;
  labelEl.dataset.controlLabel = key;
  labelEl.dataset.defaultLabel = label;
  labelEl.title = label;

  const valueEl = document.createElement("output");
  valueEl.className = "appearance-item__value";
  valueEl.setAttribute("for", `hub-control-${key}`);
  valueEl.dataset.hubValue = key;
  valueEl.dataset.appearanceValue = "true";
  valueEl.dataset.appearanceValueKind = valueKind;

  const chevron = document.createElement("span");
  chevron.className = "appearance-item__chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "▸";

  summary.append(labelEl, valueEl, chevron);

  const panel = document.createElement("div");
  panel.className = "appearance-item__panel";
  panel.id = `hub-appearance-panel-${key}`;

  const panelInner = document.createElement("div");
  panelInner.className = "appearance-item__panel-inner";
  panelInner.appendChild(clonedControl);
  panel.appendChild(panelInner);

  row.append(summary, panel);
  return row;
}

function setupSettingsPanel() {
  if (!settingsBody || settingsBody.dataset.paged === "true") return;
  const originalNodes = Array.from(settingsBody.children);
  const appearanceNodesByKey = new Map();
  originalNodes.forEach((node) => {
    const control = node.querySelector?.("[data-hub-control]");
    if (!control) return;
    appearanceNodesByKey.set(control.dataset.hubControl, node);
  });
  const shell = document.createElement("div");
  shell.className = "hub-settings-pages";
  shell.innerHTML = `
    <nav class="hub-settings-tabs" aria-label="設定カテゴリ">
      ${settingsPages.map((item) => `<button type="button" class="hub-settings-tab${item.id === "intro" ? " is-active" : ""}" data-settings-tab="${item.id}">${item.label}</button>`).join("")}
    </nav>
    <div class="hub-settings-main">
      <section class="hub-settings-page is-active" data-settings-page="intro" aria-label="紹介ステージ">
        <h3 class="hub-settings__group">紹介ステージ</h3>
        ${controlsForPage("intro")}
      </section>
      <section class="hub-settings-page" data-settings-page="switch" aria-label="パネル切替">
        <h3 class="hub-settings__group">パネル切替</h3>
        ${controlsForPage("switch")}
      </section>
      <section class="hub-settings-page" data-settings-page="buttons" aria-label="ボタン / 導線">
        <h3 class="hub-settings__group">ボタン / 導線</h3>
        ${controlsForPage("buttons")}
      </section>
      <section class="hub-settings-page" data-settings-page="appearance" aria-label="外観"></section>
      <section class="hub-settings-page" data-settings-page="ui" aria-label="UI調整">
        <h3 class="hub-settings__group">UI調整</h3>
        ${uiAdjustmentGroups
          .map(
            (group) => `
              <section class="hub-settings-group-block">
                <h4 class="hub-settings__group">${group.label}</h4>
                ${controlsForKeys(group.keys)}
              </section>`,
          )
          .join("")}
      </section>
    </div>
  `;
  settingsBody.replaceChildren(shell);

  const appearancePage = shell.querySelector('[data-settings-page="appearance"]');
  const appearanceTabs = document.createElement("nav");
  appearanceTabs.className = "appearance-categories";
  appearanceTabs.setAttribute("aria-label", "外観カテゴリ");

  const appearanceGroups = document.createElement("div");
  appearanceGroups.className = "appearance-groups";

  const appearanceItemElements = new Map();
  const appearanceGroupElements = new Map();
  const appearanceChipElements = new Map();
  const appearanceState = {
    activeCategory: appearanceCategoryDefinitions[0]?.id || "background",
    openByCategory: Object.fromEntries(appearanceCategoryDefinitions.map((category) => [category.id, category.openKey])),
  };

  function getFirstAvailableKey(categoryId) {
    const category = appearanceCategoryById.get(categoryId);
    if (!category) return "";
    const existing = appearanceState.openByCategory[categoryId];
    if (existing && appearanceItemElements.has(existing)) return existing;
    const fallback = category.items.find((item) => appearanceItemElements.has(item.key))?.key || "";
    appearanceState.openByCategory[categoryId] = fallback;
    return fallback;
  }

  function syncAppearanceState() {
    appearanceCategoryDefinitions.forEach((category) => {
      const group = appearanceGroupElements.get(category.id);
      const chip = appearanceChipElements.get(category.id);
      const isActiveCategory = category.id === appearanceState.activeCategory;
      group?.classList.toggle("is-active", isActiveCategory);
      chip?.classList.toggle("is-active", isActiveCategory);
      chip?.setAttribute("aria-pressed", String(isActiveCategory));
      if (!isActiveCategory) return;

      const openKey = getFirstAvailableKey(category.id);
      category.items.forEach((itemDef) => {
        const itemEl = appearanceItemElements.get(itemDef.key);
        if (!itemEl) return;
        const isOpen = itemDef.key === openKey;
        itemEl.classList.toggle("is-open", isOpen);
        const toggle = itemEl.querySelector("[data-appearance-toggle]");
        toggle?.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  appearanceCategoryDefinitions.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "appearance-chip";
    chip.textContent = category.label;
    chip.dataset.appearanceCategory = category.id;
    chip.setAttribute("aria-pressed", String(category.id === appearanceState.activeCategory));
    appearanceTabs.appendChild(chip);
    appearanceChipElements.set(category.id, chip);

    const group = document.createElement("section");
    group.className = "appearance-group";
    group.dataset.appearanceCategory = category.id;
    const heading = document.createElement("h3");
    heading.className = "hub-settings__group appearance-group__heading";
    heading.textContent = category.label;
    const items = document.createElement("div");
    items.className = "appearance-group__items";

    category.items.forEach((itemDef) => {
      const node = appearanceNodesByKey.get(itemDef.key);
      if (!node) return;
      const item = createAppearanceItem(node, itemDef.key, itemDef.label);
      if (!item) return;
      appearanceItemElements.set(itemDef.key, item);
      items.appendChild(item);
    });

    group.append(heading, items);
    appearanceGroups.appendChild(group);
    appearanceGroupElements.set(category.id, group);
  });
  appearancePage.append(appearanceTabs, appearanceGroups);
  syncAppearanceState();

  shell.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.settingsTab;
      shell.querySelectorAll("[data-settings-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      shell.querySelectorAll("[data-settings-page]").forEach((pageEl) => pageEl.classList.toggle("is-active", pageEl.dataset.settingsPage === target));
      shell.dataset.activePage = target;
      shell.querySelector(".hub-settings-main")?.scrollTo({ top: 0, behavior: "auto" });
    });
  });
  appearancePage.addEventListener("click", (event) => {
    const toggle = event.target.closest?.("[data-appearance-toggle]");
    if (toggle) {
      const item = toggle.closest(".appearance-item");
      const key = item?.dataset.appearanceItem;
      if (!key) return;
      const categoryId = appearanceCategoryByKey.get(key);
      if (!categoryId) return;
      appearanceState.activeCategory = categoryId;
      appearanceState.openByCategory[categoryId] = key;
      syncAppearanceState();
      return;
    }

    const categoryButton = event.target.closest?.(".appearance-chip");
    if (!categoryButton) return;
    const categoryId = categoryButton.dataset.appearanceCategory;
    if (!categoryId || categoryId === appearanceState.activeCategory) return;
    appearanceState.activeCategory = categoryId;
    getFirstAvailableKey(categoryId);
    syncAppearanceState();
    shell.querySelector(".hub-settings-main")?.scrollTo({ top: 0, behavior: "auto" });
  });
  settingsBody.dataset.paged = "true";
  controls = Array.from(document.querySelectorAll("[data-hub-control]"));
  valueOutputs = Array.from(document.querySelectorAll("[data-hub-value]"));
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
  document.querySelectorAll("[data-control-label]").forEach((label) => {
    const defaultLabel = label.dataset.defaultLabel;
    if (defaultLabel) label.textContent = defaultLabel;
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
  if (!HUB_PUBLIC_DEMO_ADMIN_MODE) {
    setStatus("公開デモでは無効です");
    return;
  }
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

function hexToRgbString(value, fallback = "#000000") {
  const hex = isHexColor(value) ? value : fallback;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
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
  const hoverTextShadowColor = isHexColor(settings["hover-text-shadow-color"]) ? settings["hover-text-shadow-color"] : defaults["hover-text-shadow-color"];
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
  const cardPreviewFadeDuration = readNumber(settings, "card-preview-fade-duration", 0.1, 3);
  const cardPreviewSlideDuration = readNumber(settings, "card-preview-slide-duration", 0.5, 12);
  const cardPreviewOpacity = readNumber(settings, "card-preview-opacity", 0.1, 5);
  const panelSwitchDuration = readNumber(settings, "panel-switch-duration", 0.2, 2.5);
  const panelSwitchDelay = readNumber(settings, "panel-switch-delay", 0, 2);
  const panelOverlapDuration = readNumber(settings, "panel-overlap-duration", 0, 1.5);
  const ctaFadeDuration = readNumber(settings, "cta-fade-duration", 0.1, 2);
  const returnResponseDuration = readNumber(settings, "return-response-duration", 0.05, 1);
  const arrowResponseDuration = readNumber(settings, "arrow-response-duration", 0.05, 1);
  const buttonHoverLift = readNumber(settings, "button-hover-lift", 0, 12);
  const uiHeadingSize = readNumber(settings, "ui-heading-size", 14, 22);
  const uiSubheadingSize = readNumber(settings, "ui-subheading-size", 9, 14);
  const uiTabFontSize = readNumber(settings, "ui-tab-font-size", 10, 16);
  const uiChipFontSize = readNumber(settings, "ui-chip-font-size", 10, 16);
  const uiLabelSize = readNumber(settings, "ui-label-size", 10, 16);
  const uiValueSize = readNumber(settings, "ui-value-size", 10, 16);
  const uiButtonFontSize = readNumber(settings, "ui-button-font-size", 10, 16);
  const uiPanelWidth = readNumber(settings, "ui-panel-width", 220, 320);
  const uiPanelPadding = readNumber(settings, "ui-panel-padding", 2, 14);
  const uiSectionGap = readNumber(settings, "ui-section-gap", 0, 12);
  const uiRowGap = readNumber(settings, "ui-row-gap", 0, 8);
  const uiChipGap = readNumber(settings, "ui-chip-gap", 0, 8);
  const uiButtonGap = readNumber(settings, "ui-button-gap", 0, 8);
  const uiValueWidth = readNumber(settings, "ui-value-width", 36, 72);
  const uiSliderWidth = readNumber(settings, "ui-slider-width", 0, 100);
  const uiSliderRightGap = readNumber(settings, "ui-slider-right-gap", 0, 24);
  const uiSliderRowHeight = readNumber(settings, "ui-slider-row-height", 8, 18);
  const uiTrackHeight = readNumber(settings, "ui-track-height", 3, 6);
  const uiThumbWidth = readNumber(settings, "ui-thumb-width", 10, 16);
  const uiThumbHeight = readNumber(settings, "ui-thumb-height", 8, 16);
  const uiThumbRadius = readNumber(settings, "ui-thumb-radius", 0, 8);
  const uiThumbShadow = readNumber(settings, "ui-thumb-shadow", 0, 2);
  const uiTrackSink = readNumber(settings, "ui-track-sink", 0, 2);
  const uiTabRadius = readNumber(settings, "ui-tab-radius", 0, 8);
  const uiChipRadius = readNumber(settings, "ui-chip-radius", 0, 8);
  const uiTabEmboss = readNumber(settings, "ui-tab-emboss", 0, 2);
  const uiChipEmboss = readNumber(settings, "ui-chip-emboss", 0, 2);

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
  root.style.setProperty("--hub-hover-text-shadow-color", hoverTextShadowColor);
  root.style.setProperty("--hub-hover-text-shadow-rgb", hexToRgbString(hoverTextShadowColor));
  const cardShadowAlphaFinal = Math.min(0.85, Math.max(0, shadowAlphaFinal * cardShadowStrength * 2.2));
  const cardShadowAmbientAlphaFinal = Math.min(0.45, Math.max(0, cardShadowAlphaFinal * 0.42));
  const cardShadowHoverAlphaFinal = Math.min(0.92, Math.max(0, cardShadowAlphaFinal + 0.08));
  const shadowOffsetXFinal = shadowX;

  root.style.setProperty("--hub-shadow-distance", `${shadowDistanceFinal}px`);
  root.style.setProperty("--hub-shadow-blur", `${shadowBlurFinal}px`);
  root.style.setProperty("--hub-shadow-alpha", shadowAlphaFinal);
  root.style.setProperty("--hub-card-shadow-alpha-final", cardShadowAlphaFinal);
  root.style.setProperty("--hub-card-shadow-ambient-alpha-final", cardShadowAmbientAlphaFinal);
  root.style.setProperty("--hub-card-shadow-hover-alpha-final", cardShadowHoverAlphaFinal);
  root.style.setProperty("--hub-shadow-x", `${shadowOffsetXFinal}px`);
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
  root.style.setProperty("--hub-card-preview-fade-duration", `${cardPreviewFadeDuration}s`);
  root.style.setProperty("--hub-card-preview-slide-duration", `${cardPreviewSlideDuration}s`);
  root.style.setProperty("--hub-card-preview-opacity", Math.min(1, cardPreviewOpacity));
  root.style.setProperty("--hub-card-preview-contrast", 1 + Math.max(0, cardPreviewOpacity - 1) * 0.18);
  root.style.setProperty("--hub-card-preview-brightness", 1 + Math.max(0, cardPreviewOpacity - 1) * 0.08);
  root.style.setProperty("--hub-panel-switch-duration", `${panelSwitchDuration}s`);
  root.style.setProperty("--hub-panel-switch-delay", `${panelSwitchDelay}s`);
  root.style.setProperty("--hub-panel-overlap-duration", `${panelOverlapDuration}s`);
  root.style.setProperty("--hub-cta-fade-duration", `${ctaFadeDuration}s`);
  root.style.setProperty("--hub-return-response-duration", `${returnResponseDuration}s`);
  root.style.setProperty("--hub-arrow-response-duration", `${arrowResponseDuration}s`);
  root.style.setProperty("--hub-button-hover-lift", `${buttonHoverLift}px`);
  document.body.style.setProperty("--settings-dock-width", `${uiPanelWidth}px`);
  root.style.setProperty("--settings-dock-width", `${uiPanelWidth}px`);
  const settingsSurface = panel;
  settingsSurface?.style.setProperty("--settings-heading-size", `${uiHeadingSize}px`);
  settingsSurface?.style.setProperty("--settings-subheading-size", `${uiSubheadingSize}px`);
  settingsSurface?.style.setProperty("--settings-tab-font-size", `${uiTabFontSize}px`);
  settingsSurface?.style.setProperty("--settings-chip-font-size", `${uiChipFontSize}px`);
  settingsSurface?.style.setProperty("--settings-label-size", `${uiLabelSize}px`);
  settingsSurface?.style.setProperty("--settings-value-size", `${uiValueSize}px`);
  settingsSurface?.style.setProperty("--settings-button-font-size", `${uiButtonFontSize}px`);
  settingsSurface?.style.setProperty("--settings-panel-padding", `${uiPanelPadding}px`);
  settingsSurface?.style.setProperty("--settings-section-gap", `${uiSectionGap}px`);
  settingsSurface?.style.setProperty("--settings-row-gap", `${uiRowGap}px`);
  settingsSurface?.style.setProperty("--settings-chip-gap", `${uiChipGap}px`);
  settingsSurface?.style.setProperty("--settings-button-gap", `${uiButtonGap}px`);
  settingsSurface?.style.setProperty("--settings-slider-width-scale", `${uiSliderWidth / 100}`);
  settingsSurface?.style.setProperty("--settings-slider-right-gap", `${uiSliderRightGap}px`);
  settingsSurface?.style.setProperty("--settings-slider-row-height", `${uiSliderRowHeight}px`);
  settingsSurface?.style.setProperty("--settings-track-height", `${uiTrackHeight}px`);
  settingsSurface?.style.setProperty("--settings-value-inline", `${uiValueWidth}px`);
  settingsSurface?.style.setProperty("--settings-thumb-width", `${uiThumbWidth}px`);
  settingsSurface?.style.setProperty("--settings-thumb-height", `${uiThumbHeight}px`);
  settingsSurface?.style.setProperty("--settings-thumb-radius", `${uiThumbRadius}px`);
  settingsSurface?.style.setProperty("--settings-thumb-shadow-strength", uiThumbShadow);
  settingsSurface?.style.setProperty("--settings-track-sink-strength", uiTrackSink);
  settingsSurface?.style.setProperty("--settings-tab-radius", `${uiTabRadius}px`);
  settingsSurface?.style.setProperty("--settings-chip-radius", `${uiChipRadius}px`);
  settingsSurface?.style.setProperty("--settings-tab-emboss", uiTabEmboss);
  settingsSurface?.style.setProperty("--settings-chip-emboss", uiChipEmboss);

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
    "card-preview-fade-duration": cardPreviewFadeDuration,
    "card-preview-slide-duration": cardPreviewSlideDuration,
    "card-preview-opacity": cardPreviewOpacity,
    "panel-switch-duration": panelSwitchDuration,
    "panel-switch-delay": panelSwitchDelay,
    "panel-overlap-duration": panelOverlapDuration,
    "cta-fade-duration": ctaFadeDuration,
    "return-response-duration": returnResponseDuration,
    "arrow-response-duration": arrowResponseDuration,
    "button-hover-lift": buttonHoverLift,
    "ui-heading-size": uiHeadingSize,
    "ui-subheading-size": uiSubheadingSize,
    "ui-tab-font-size": uiTabFontSize,
    "ui-chip-font-size": uiChipFontSize,
    "ui-label-size": uiLabelSize,
    "ui-value-size": uiValueSize,
    "ui-button-font-size": uiButtonFontSize,
    "ui-panel-width": uiPanelWidth,
    "ui-panel-padding": uiPanelPadding,
    "ui-section-gap": uiSectionGap,
    "ui-row-gap": uiRowGap,
    "ui-chip-gap": uiChipGap,
    "ui-button-gap": uiButtonGap,
    "ui-value-width": uiValueWidth,
    "ui-slider-width": uiSliderWidth,
    "ui-slider-right-gap": uiSliderRightGap,
    "ui-slider-row-height": uiSliderRowHeight,
    "ui-track-height": uiTrackHeight,
    "ui-thumb-width": uiThumbWidth,
    "ui-thumb-height": uiThumbHeight,
    "ui-thumb-radius": uiThumbRadius,
    "ui-thumb-shadow": uiThumbShadow,
    "ui-track-sink": uiTrackSink,
    "ui-tab-radius": uiTabRadius,
    "ui-chip-radius": uiChipRadius,
    "ui-tab-emboss": uiTabEmboss,
    "ui-chip-emboss": uiChipEmboss,
  } });
  syncControlProgress(settings);
}

function setOpen(open) {
  if (!HUB_PUBLIC_DEMO_ADMIN_MODE) {
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("hub-settings-open");
    return;
  }
  if (!panel || !toggle) return;
  panel.classList.toggle("is-open", open);
  panel.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("hub-settings-open", open);
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

if (toggle && panel && HUB_PUBLIC_DEMO_ADMIN_MODE) {
  toggle.addEventListener("click", () => {
    setOpen(!panel.classList.contains("is-open"));
  });
}

if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));

if (copyBtn && HUB_PUBLIC_DEMO_ADMIN_MODE) copyBtn.addEventListener("click", copySettings);

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    applySettings(defaults);
    writeSettings(defaults);
    setStatus("初期値に戻しました");
  });
}

function renderPreview(index) {
  const item = previewItems[index];
  if (!item || !previewTitle || !previewHeading || !previewSubcopy || !previewChips || !previewCopy || !previewOpen) return;
  currentPreviewIndex = index;
  previewTitle.textContent = item.title;
  previewHeading.textContent = item.heading;
  previewSubcopy.textContent = item.subcopy;
  previewChips.innerHTML = item.chips.map((chip) => `<span>${chip}</span>`).join("");
  previewCopy.innerHTML = item.copy.map((paragraph) => `<p>${paragraph}</p>`).join("");
  if (previewTrack) {
    previewTrack.innerHTML = "";
  }
  if (previewCaption) {
    previewCaption.textContent = item.caption;
  }
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

function resetPortfolioHubListState() {
  if (!page || !previewStage) return;
  page.classList.remove("is-system-preview", "is-system-preview-leaving", "is-preview-switching");
  stopCardPreview();
  previewStage.setAttribute("aria-hidden", "true");
  setOpen(false);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function setPortfolioPreview(open, index = currentPreviewIndex) {
  if (!page || !previewStage) return;
  if (open) {
    renderPreview(index);
    page.classList.add("is-system-preview");
    page.classList.remove("is-system-preview-leaving", "is-preview-switching");
    stopCardPreview();
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
    syncCardBackdropState();
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
    if (!document.body.classList.contains("hub-settings-open")) return;
    event.preventDefault();
    event.stopPropagation();
  });
  card.addEventListener("auxclick", (event) => {
    if (!document.body.classList.contains("hub-settings-open")) return;
    event.preventDefault();
    event.stopPropagation();
  });
  card.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("hub-settings-open")) return;
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
  });
  card.addEventListener("pointerenter", () => {
    startCardPreview(card);
    showCardHoverSummary(card);
  });
  card.addEventListener("pointerleave", () => {
    window.requestAnimationFrame(syncCardBackdropState);
    window.requestAnimationFrame(hideCardHoverSummary);
  });
  card.addEventListener("focusin", () => {
    syncCardBackdropState();
    showCardHoverSummary(card);
  });
  card.addEventListener("focusout", () => {
    window.requestAnimationFrame(syncCardBackdropState);
    window.requestAnimationFrame(hideCardHoverSummary);
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
hideCardHoverSummary();
syncCardBackdropState();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetPortfolioHubListState();
  } else {
    syncCardBackdropState();
  }
});

window.addEventListener("pagehide", () => {
  resetPortfolioHubListState();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!panel || !panel.classList.contains("is-open")) return;
  event.preventDefault();
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
