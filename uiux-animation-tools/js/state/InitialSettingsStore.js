(function () {
    'use strict';

    const INITIAL_SETTINGS_SCHEMA = 'uiux-animation-tools.initial-settings';
    const ARTWORK_SLOTS_SCHEMA = 'uiux-animation-tools.artwork-slots';
    const VERSION = 1;
    const UI_SIZE_TUNER_KEY = 'uiuxAnimationTools.uiSizeTuner.v26';
    const BUNDLED_INITIAL_SETTINGS_URL = 'data/initial-settings/default-initial-settings.json';
    const BUNDLED_INITIAL_APPLIED_KEY = 'uiuxAnimationTools.initialSettings.bundledApplied.v1';

    const BUNDLED_INITIAL_SETTINGS_EMBEDDED =     {
        "schema": "uiux-animation-tools.initial-settings",
        "version": 1,
        "name": "GitHub公開用 初期設定 正本 v104",
        "createdAt": "2026-06-14T00:00:00+09:00",
        "uiSizeTunerStorageKey": "uiuxAnimationTools.uiSizeTuner.v26",
        "uiSizeTuner": {
            "schema": "uiux-animation-tools.uiSizeTuner",
            "version": 17,
            "storageKey": "uiuxAnimationTools.uiSizeTuner.v26",
            "values": {
                "--ui-color-blend-on-color": "#dedede",
                "--ui-size-tuner-toggle-bg-alpha": 0.02,
                "--ui-panel-common-slider-thumb-size": 7,
                "--ui-color-card-gap": 3,
                "--ui-color-card-name-line-height": 1.1,
                "--ui-color-card-name-font-size": 10,
                "--ui-color-assign-button-font-size": 10.5,
                "--ui-color-assign-button-height": 20,
                "--ui-color-assign-button-min-width": 38,
                "--ui-color-assign-button-radius": 8,
                "--ui-color-assign-button-gap": 2,
                "--ui-color-action-button-font-size": 10,
                "--ui-color-action-button-height": 21,
                "--ui-color-action-button-padding-x": 7,
                "--ui-color-action-button-radius": 7,
                "--ui-panel-4-slider-min-width": 126,
                "--ui-panel-4-slider-offset-x": -8,
                "--ui-size-tuner-row-computed-width": 90,
                "--ui-glass-left-current-case-outline-color": "#707070",
                "--ui-glass-bottom-active-outline-color": "#707070",
                "--ui-top-left-small-button-shadow-on": 0
            },
            "enabled": {},
            "presets": {},
            "copyMode": "diff"
        },
        "theme": {},
        "themePresets": {},
        "canvasState": {},
        "colorState": {},
        "uiLayout": {},
        "cursorState": {},
        "note": "現時点でユーザーが指定した:root初期値を内部初期設定として組み込む公開用正本。v104で検証APIと初回適用タイミング補強を追加。既存localStorageがある環境では自動上書きしない。",
        "updatedAt": "2026-06-14T00:00:00+09:00"
    };

    const INITIAL_STORAGE_KEYS = [
        'uiVariant',
        'uiVariantMain',
        'uiVariantPreset',
        'uiNeumorphismVariantPreset',
        'uiLiquidGlassVariantPreset',
        'uiGlassCustomPresets',
        'uiGlassPresetParams',
        'uiGlassPresetEditLocks',
        'uiNeumorphismCustomPresets',
        'uiNeumorphismPresetParams',
        'uiNeumorphismPresetEditLocks',
        'uiLiquidGlassCustomPresets',
        'uiLiquidGlassPresetParams',
        'uiLiquidGlassPresetEditLocks',
        'globalCanvasBgColor',
        'globalRenderMode',
        'colorThemeCardState',
        'colorThemeAssignMode',
        'colorThemeBlendEnabled',
        'colorTransitionSeconds',
        'useRandomColors',
        'randomColorCount',
        'randomColorAssignMode',
        'colorMode',
        'hueCount',
        'mixMin',
        'mixMax',
        'hueRangeAssignMode',
        'saturationMin',
        'saturationMax',
        'paletteSystem',
        'colorEngineSettings',
        'casePaletteLayoutMode',
        'uiVariantCompactPositionV65',
        'uiVariantPanelCompactHidden',
        'uiGlassPanelPositions',
        'uiGlassPanelVisibility',
        'allCaseSettings'
    ];

    const ARTWORK_STORAGE_KEYS = [
        'p5jsRegisteredArtworkSlotsV1',
        'p5jsArtworkSnapshotStoreV1'
    ];

    const EXCLUDED_RUNTIME_KEYS = [
        'uiux.engineDiagnostics.enabled',
        'uiux.engineSwitcher.open',
        'uiGlassPresetEditLocksMigratedV2',
        'uiGlassPresetDetailsOpen',
        'uiNeumorphismPresetDetailsOpen',
        'uiLiquidGlassPresetDetailsOpen'
    ];

    function safeParse(raw) {
        if (raw == null) return null;
        try { return JSON.parse(raw); } catch (_) { return raw; }
    }

    function readStorageValue(key) {
        const raw = localStorage.getItem(key);
        if (raw == null) return undefined;
        return safeParse(raw);
    }

    function writeStorageValue(key, value) {
        if (value === undefined) return;
        if (value === null) {
            localStorage.removeItem(key);
            return;
        }
        if (typeof value === 'string') localStorage.setItem(key, value);
        else localStorage.setItem(key, JSON.stringify(value));
    }


    function cloneBundledInitialSettings() {
        try {
            return JSON.parse(JSON.stringify(BUNDLED_INITIAL_SETTINGS_EMBEDDED));
        } catch (_) {
            return BUNDLED_INITIAL_SETTINGS_EMBEDDED;
        }
    }

    function collectKeys(keys) {
        const out = {};
        keys.forEach((key) => {
            const value = readStorageValue(key);
            if (value !== undefined) out[key] = value;
        });
        return out;
    }

    function collectPrefix(prefix) {
        const out = {};
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(prefix)) continue;
            out[key] = readStorageValue(key);
        }
        return out;
    }

    function getUiSizeTunerSnapshot() {
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.getSnapshot === 'function') {
                const snapshot = window.UISizeTunerAPI.getSnapshot();
                if (snapshot && typeof snapshot === 'object') return snapshot;
            }
        } catch (error) {
            console.warn('[initial-settings] UISizeTunerAPI.getSnapshot failed', error);
        }
        const stored = readStorageValue(UI_SIZE_TUNER_KEY);
        return stored && typeof stored === 'object' ? stored : null;
    }

    function applyUiSizeTunerSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return false;
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.applySnapshot === 'function') {
                return Boolean(window.UISizeTunerAPI.applySnapshot(snapshot));
            }
        } catch (error) {
            console.warn('[initial-settings] UISizeTunerAPI.applySnapshot failed', error);
        }
        writeStorageValue(UI_SIZE_TUNER_KEY, snapshot);
        return true;
    }


    function waitForUiSizeTunerAPI(timeoutMs = 2400) {
        return new Promise((resolve) => {
            const startedAt = Date.now();
            const check = () => {
                if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.applySnapshot === 'function') {
                    resolve(true);
                    return;
                }
                if (Date.now() - startedAt >= timeoutMs) {
                    resolve(false);
                    return;
                }
                setTimeout(check, 40);
            };
            check();
        });
    }

    function hasValue(value) {
        if (value === undefined || value === null) return false;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
    }

    function validateInitialSettingsPayload(payload) {
        const report = {
            ok: true,
            schema: payload && payload.schema,
            missingSections: [],
            emptySections: [],
            warnings: []
        };
        if (!payload || typeof payload !== 'object') {
            report.ok = false;
            report.warnings.push('payload が object ではありません。');
            return report;
        }
        if (payload.schema !== INITIAL_SETTINGS_SCHEMA) {
            report.ok = false;
            report.warnings.push('schema が uiux-animation-tools.initial-settings ではありません。');
        }
        ['uiSizeTuner', 'theme', 'themePresets', 'canvasState', 'colorState', 'uiLayout', 'cursorState'].forEach((section) => {
            if (!(section in payload)) {
                report.missingSections.push(section);
                report.ok = false;
            } else if (!hasValue(payload[section])) {
                report.emptySections.push(section);
            }
        });
        if (!payload.uiSizeTuner || payload.uiSizeTuner.storageKey !== UI_SIZE_TUNER_KEY) {
            report.ok = false;
            report.warnings.push(`uiSizeTuner.storageKey が ${UI_SIZE_TUNER_KEY} ではありません。`);
        }
        if (payload.uiSizeTunerStorageKey && payload.uiSizeTunerStorageKey !== UI_SIZE_TUNER_KEY) {
            report.ok = false;
            report.warnings.push(`uiSizeTunerStorageKey が ${UI_SIZE_TUNER_KEY} ではありません。`);
        }
        return report;
    }

    function getInitialSettingsCoverageReport(payload = exportInitialSettings()) {
        const validation = validateInitialSettingsPayload(payload);
        const flat = flattenInitialPayload(payload);
        const localStorageCoverage = {};
        INITIAL_STORAGE_KEYS.forEach((key) => {
            localStorageCoverage[key] = {
                exported: flat[key] !== undefined,
                currentlyStored: localStorage.getItem(key) != null
            };
        });
        const cursorKeys = Object.keys(collectPrefix('cursorUI_'));
        return {
            generatedAt: new Date().toISOString(),
            uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
            validation,
            localStorageCoverage,
            cursorKeys,
            artworkKeysSeparated: ARTWORK_STORAGE_KEYS.slice(),
            excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice()
        };
    }

    function exportInitialSettings() {
        const uiSizeTuner = getUiSizeTunerSnapshot();
        const storage = collectKeys(INITIAL_STORAGE_KEYS);
        const cursorState = collectPrefix('cursorUI_');
        return {
            schema: INITIAL_SETTINGS_SCHEMA,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
            uiSizeTuner,
            theme: {
                uiVariant: storage.uiVariant,
                uiVariantMain: storage.uiVariantMain,
                uiVariantPreset: storage.uiVariantPreset,
                uiNeumorphismVariantPreset: storage.uiNeumorphismVariantPreset,
                uiLiquidGlassVariantPreset: storage.uiLiquidGlassVariantPreset
            },
            themePresets: {
                uiGlassCustomPresets: storage.uiGlassCustomPresets,
                uiGlassPresetParams: storage.uiGlassPresetParams,
                uiGlassPresetEditLocks: storage.uiGlassPresetEditLocks,
                uiNeumorphismCustomPresets: storage.uiNeumorphismCustomPresets,
                uiNeumorphismPresetParams: storage.uiNeumorphismPresetParams,
                uiNeumorphismPresetEditLocks: storage.uiNeumorphismPresetEditLocks,
                uiLiquidGlassCustomPresets: storage.uiLiquidGlassCustomPresets,
                uiLiquidGlassPresetParams: storage.uiLiquidGlassPresetParams,
                uiLiquidGlassPresetEditLocks: storage.uiLiquidGlassPresetEditLocks
            },
            canvasState: {
                globalCanvasBgColor: storage.globalCanvasBgColor,
                globalRenderMode: storage.globalRenderMode
            },
            colorState: {
                colorThemeCardState: storage.colorThemeCardState,
                colorThemeAssignMode: storage.colorThemeAssignMode,
                colorThemeBlendEnabled: storage.colorThemeBlendEnabled,
                colorTransitionSeconds: storage.colorTransitionSeconds,
                useRandomColors: storage.useRandomColors,
                randomColorCount: storage.randomColorCount,
                randomColorAssignMode: storage.randomColorAssignMode,
                colorMode: storage.colorMode,
                hueCount: storage.hueCount,
                mixMin: storage.mixMin,
                mixMax: storage.mixMax,
                hueRangeAssignMode: storage.hueRangeAssignMode,
                saturationMin: storage.saturationMin,
                saturationMax: storage.saturationMax,
                paletteSystem: storage.paletteSystem,
                colorEngineSettings: storage.colorEngineSettings
            },
            uiLayout: {
                casePaletteLayoutMode: storage.casePaletteLayoutMode,
                uiVariantCompactPositionV65: storage.uiVariantCompactPositionV65,
                uiVariantPanelCompactHidden: storage.uiVariantPanelCompactHidden,
                uiGlassPanelPositions: storage.uiGlassPanelPositions,
                uiGlassPanelVisibility: storage.uiGlassPanelVisibility
            },
            cursorState,
            caseSettings: storage.allCaseSettings,
            excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice()
        };
    }

    function exportArtworkSlots() {
        const storage = collectKeys(ARTWORK_STORAGE_KEYS);
        return {
            schema: ARTWORK_SLOTS_SCHEMA,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            registeredSlots: storage.p5jsRegisteredArtworkSlotsV1,
            snapshotStore: storage.p5jsArtworkSnapshotStoreV1
        };
    }

    function flattenInitialPayload(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const out = {};
        const copy = (source) => {
            if (!source || typeof source !== 'object') return;
            Object.entries(source).forEach(([key, value]) => {
                if (value !== undefined) out[key] = value;
            });
        };
        copy(payload.theme);
        copy(payload.themePresets);
        copy(payload.canvasState);
        copy(payload.colorState);
        copy(payload.uiLayout);
        if (payload.caseSettings !== undefined) out.allCaseSettings = payload.caseSettings;
        return out;
    }

    function applyInitialSettings(payload, options = {}) {
        if (!payload || typeof payload !== 'object') return false;
        if (payload.schema && payload.schema !== INITIAL_SETTINGS_SCHEMA) return false;
        const flat = flattenInitialPayload(payload);
        Object.entries(flat).forEach(([key, value]) => writeStorageValue(key, value));
        if (payload.cursorState && typeof payload.cursorState === 'object') {
            Object.entries(payload.cursorState).forEach(([key, value]) => {
                if (key.startsWith('cursorUI_')) writeStorageValue(key, value);
            });
        }
        if (payload.uiSizeTuner) applyUiSizeTunerSnapshot(payload.uiSizeTuner);
        if (options.reload !== false) {
            setTimeout(() => window.location.reload(), 60);
        }
        return true;
    }

    function applyArtworkSlots(payload, options = {}) {
        if (!payload || typeof payload !== 'object') return false;
        if (payload.schema && payload.schema !== ARTWORK_SLOTS_SCHEMA) return false;
        writeStorageValue('p5jsRegisteredArtworkSlotsV1', payload.registeredSlots);
        writeStorageValue('p5jsArtworkSnapshotStoreV1', payload.snapshotStore);
        if (options.reload === true) setTimeout(() => window.location.reload(), 60);
        return true;
    }

    function downloadJson(filename, payload) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadInitialSettings() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`uiux-animation-tools_initial-settings_${stamp}.json`, exportInitialSettings());
    }

    function downloadArtworkSlots() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`uiux-animation-tools_artwork-slots_${stamp}.json`, exportArtworkSlots());
    }

    async function importInitialSettingsFile(file, options = {}) {
        if (!file) return false;
        const text = await file.text();
        return applyInitialSettings(JSON.parse(text), options);
    }

    async function importArtworkSlotsFile(file, options = {}) {
        if (!file) return false;
        const text = await file.text();
        return applyArtworkSlots(JSON.parse(text), options);
    }


    function hasExistingUserState() {
        // UI_Variant.init() が起動時に uiVariant / uiVariantMain を自動で書くため、
        // それだけでは「既存ユーザー状態」とはみなさない。
        const stableKeys = [
            UI_SIZE_TUNER_KEY,
            'globalCanvasBgColor',
            'colorThemeCardState',
            'allCaseSettings'
        ];
        return stableKeys.some((key) => localStorage.getItem(key) != null);
    }

    async function fetchBundledInitialSettings() {
        if (typeof fetch === 'function') {
            try {
                const response = await fetch(BUNDLED_INITIAL_SETTINGS_URL, { cache: 'no-store' });
                if (response && response.ok) {
                    const payload = await response.json();
                    if (payload && payload.schema === INITIAL_SETTINGS_SCHEMA) return payload;
                }
            } catch (error) {
                console.warn('[initial-settings] bundled initial settings fetch failed. Embedded fallback will be used.', error);
            }
        }
        const fallback = cloneBundledInitialSettings();
        if (fallback && fallback.schema === INITIAL_SETTINGS_SCHEMA) return fallback;
        return null;
    }

    async function applyBundledInitialSettings(options = {}) {
        const force = options.force === true;
        const reload = options.reload !== false;
        if (!force) {
            if (localStorage.getItem(BUNDLED_INITIAL_APPLIED_KEY) === '1') return false;
            if (hasExistingUserState()) return false;
        }
        await waitForUiSizeTunerAPI();
        const payload = await fetchBundledInitialSettings();
        if (!payload) return false;
        const validation = validateInitialSettingsPayload(payload);
        if (!validation.ok) {
            console.warn('[initial-settings] bundled initial settings validation warning', validation);
        }
        const applied = applyInitialSettings(payload, { reload });
        if (applied) localStorage.setItem(BUNDLED_INITIAL_APPLIED_KEY, '1');
        return applied;
    }

    function scheduleBundledInitialSettingsApply() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        const run = () => {
            applyBundledInitialSettings({ reload: true }).catch((error) => {
                console.warn('[initial-settings] bundled initial settings apply failed', error);
            });
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
        else setTimeout(run, 0);
    }

    window.UIUXInitialSettingsAPI = {
        schema: INITIAL_SETTINGS_SCHEMA,
        version: VERSION,
        uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
        initialStorageKeys: INITIAL_STORAGE_KEYS.slice(),
        artworkStorageKeys: ARTWORK_STORAGE_KEYS.slice(),
        excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice(),
        bundledInitialSettingsUrl: BUNDLED_INITIAL_SETTINGS_URL,
        hasEmbeddedBundledInitialSettings: true,
        exportInitialSettings,
        validateInitialSettingsPayload,
        getInitialSettingsCoverageReport,
        applyInitialSettings,
        downloadInitialSettings,
        importInitialSettingsFile,
        fetchBundledInitialSettings,
        applyBundledInitialSettings,
        exportArtworkSlots,
        applyArtworkSlots,
        downloadArtworkSlots,
        importArtworkSlotsFile
    };

    scheduleBundledInitialSettingsApply();
})();
