const root = document.documentElement;
const STORAGE_KEY = "portfoliohub.visual-settings.v1";

const defaults = {
  "bg-lightness": 1,
  "bg-warmth": 1,
  "light-strength": 1,
  "card-alpha": 0.34,
  "card-blur": 26,
  "card-border-alpha": 0.5,
  "card-shadow-strength": 0.18,
  "text-strength": 0.98,
  scale: 1,
  "card-gap": 14,
  "card-radius": 30,
  "card-height": 238,
  "card-padding": 18,
  "light-position": 1,
  "light-spread": 1,
  "card-highlight-strength": 0.44,
  "card-inner-light": 0.24,
  "text-shadow-strength": 0.2,
  "shadow-distance": 18,
  "shadow-blur": 38,
  "shadow-alpha": 0.18,
  "shadow-y": 12,
  "inner-highlight": 0.58,
  "ground-shadow": 0.14,
  "shadow-mode": "Soft",
};

const controls = Array.from(document.querySelectorAll("[data-hub-control]"));
const toggle = document.querySelector(".hub-settings-toggle");
const panel = document.querySelector(".hub-settings");
const closeBtn = document.querySelector(".hub-settings__close");
const resetBtn = document.querySelector(".hub-settings__reset");

function toValue(key, raw) {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return defaults[key];
  return numeric;
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
  const mode = settings["shadow-mode"] || "Soft";

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
  root.style.setProperty("--hub-card-radius", `${cardRadius}px`);
  root.style.setProperty("--hub-card-height", `${cardHeight}px`);
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

  controls.forEach((control) => {
    const key = control.dataset.hubControl;
    if (settings[key] !== undefined) control.value = settings[key];
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

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    applySettings(defaults);
    writeSettings(defaults);
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
