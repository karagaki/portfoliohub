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
  root.style.setProperty("--hub-bg-lightness", settings["bg-lightness"]);
  root.style.setProperty("--hub-bg-warmth", settings["bg-warmth"]);
  root.style.setProperty("--hub-light-strength", settings["light-strength"]);
  root.style.setProperty("--hub-card-alpha", settings["card-alpha"]);
  root.style.setProperty("--hub-card-blur", `${settings["card-blur"]}px`);
  root.style.setProperty("--hub-card-border-alpha", settings["card-border-alpha"]);
  root.style.setProperty("--hub-card-shadow-strength", settings["card-shadow-strength"]);
  root.style.setProperty("--hub-text-strength", settings["text-strength"]);
  root.style.setProperty("--hub-scale", settings.scale);
  root.style.setProperty("--hub-card-gap", `${settings["card-gap"]}px`);

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
    settings[control.dataset.hubControl] = toValue(control.dataset.hubControl, control.value);
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
