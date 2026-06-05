const root = document.documentElement;
const STORAGE_KEY = "portfoliohub.visual-settings.v1";

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
};

const controls = Array.from(document.querySelectorAll("[data-hub-control]"));
const toggle = document.querySelector(".hub-settings-toggle");
const panel = document.querySelector(".hub-settings");
const closeBtn = document.querySelector(".hub-settings__close");
const resetBtn = document.querySelector(".hub-settings__reset");
const copyBtn = document.querySelector(".hub-settings__copy");
const statusEl = document.querySelector(".hub-settings__status");

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
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

function writeSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function currentSettingsSnapshot() {
  const snapshot = readSettings();
  return {
    name: "portfoliohub.visual-settings",
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

  controls.forEach((control) => {
    const key = control.dataset.hubControl;
    if (settings[key] !== undefined) {
      control.value = settings[key];
    } else if (defaults[key] !== undefined) {
      control.value = defaults[key];
    }
  });
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

const initialSettings = readSettings();
applySettings(initialSettings);

controls.forEach((control) => {
  control.addEventListener("input", syncAndSave);
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
