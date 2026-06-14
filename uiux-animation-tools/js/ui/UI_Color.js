var UIUX_PUBLIC_DEBUG_LOGS = window.UIUX_PUBLIC_DEBUG_LOGS === true;
function uiuxPublicDebugLog(...args) { if (UIUX_PUBLIC_DEBUG_LOGS) console.log(...args); }
if (!window.ColorEngine) {
    document.write('<script src="js/ui/UI_ColorEngine.js"><\/script>');
}

window.Color = window.Color || {};


(function(Color) {
    let useRandomColors = false;
    let randomColorCount = 5; // デフォルト値を設定
    let randomColorAssignMode = 'alternate';
    let randomColors = [];
    let colorMode = 'off';
    let paletteSystem = 'engine';
    let hueCount = 6;
    let mixMin = 0.15;
    let mixMax = 1.0;
    let saturationMin = 40;
    let saturationMax = 80;
    let hueRangeBaseColors = [];
    let hueRangeAssignMode = 'alternate';
    let hueRangeColors = [];
    const hueRangeLightness = 50;
    const themeCycle = [1, 2, 4, 'multi'];
    const themeStorageKey = 'colorThemeCardState';
    const assignModeStorageKey = 'colorThemeAssignMode';
    const blendEnabledStorageKey = 'colorThemeBlendEnabled';
    const assignModeDefs = [
        { key: 'alternate', label: '基本' },
        { key: 'areaTB', label: '上下' },
        { key: 'areaLR', label: '左右' },
        { key: 'diagTLBR', label: '斜め' },
        { key: 'center', label: '中心' }
    ];
    const themeDefs = [
        { key: 'pop', name: 'ポップ', base: [255, 109, 109], accent: [255, 214, 102], vivid: [77, 166, 255] },
        { key: 'cool', name: 'クール', base: [73, 118, 255], accent: [79, 206, 208], vivid: [183, 107, 255] },
        { key: 'fantasy', name: 'ファンタジー', base: [138, 94, 255], accent: [72, 191, 255], vivid: [104, 220, 146] },
        { key: 'modern', name: 'モダン', base: [88, 94, 104], accent: [216, 223, 230], vivid: [132, 142, 158] },
        { key: 'vivid', name: 'ビビッド', base: [255, 66, 129], accent: [255, 183, 56], vivid: [52, 218, 255] },
        { key: 'pastel', name: 'パステル', base: [255, 183, 201], accent: [201, 233, 255], vivid: [255, 231, 160] },
        { key: 'dark', name: 'ダーク', base: [34, 41, 58], accent: [73, 82, 109], vivid: [109, 124, 160] },
        { key: 'neon', name: 'ネオン', base: [18, 255, 194], accent: [255, 72, 218], vivid: [242, 255, 71] },
        { key: 'natural', name: 'ナチュラル', base: [118, 165, 96], accent: [188, 145, 95], vivid: [86, 141, 106] },
        { key: 'retro', name: 'レトロ', base: [201, 131, 89], accent: [126, 102, 153], vivid: [228, 188, 103] },
        { key: 'candy', name: 'キャンディ', base: [255, 130, 182], accent: [119, 221, 255], vivid: [255, 233, 112] },
        { key: 'mysterious', name: 'ミステリアス', base: [62, 48, 111], accent: [31, 66, 129], vivid: [168, 103, 224] },
        { key: 'elegant', name: 'エレガント', base: [178, 157, 144], accent: [225, 214, 204], vivid: [132, 110, 96] },
        { key: 'acid', name: 'アシッド', base: [206, 255, 48], accent: [83, 255, 110], vivid: [255, 52, 232] },
        { key: 'mono', name: 'モノクロ', base: [55, 55, 55], accent: [190, 190, 190], vivid: [0, 0, 0] }
    ];
    const THEME_PALETTE_BANK = {
        pop: [
            ['#17203A', '#28446A', '#FF8E72', '#FF4E64', '#FFD166', '#7BDFF2'],
            ['#2A1A4A', '#6A3D8C', '#F26CA7', '#FFB86B', '#FFE66D', '#38D6B4'],
            ['#103C54', '#1D7A8C', '#FF6B6B', '#FFA06A', '#F8E16C', '#F4F1BB'],
            ['#34215A', '#4D6CFA', '#FF5D8F', '#F7A072', '#FDE74C', '#5BC0EB'],
            ['#1F2D3D', '#00A6A6', '#EF476F', '#F78C6B', '#FFD166', '#CDEAC0']
        ],
        cool: [
            ['#061826', '#0B3954', '#087E8B', '#5BC0BE', '#BEE9E8', '#F4D35E'],
            ['#101935', '#223A5E', '#406E8E', '#60A3BC', '#BFD7EA', '#F6AE2D'],
            ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE', '#C4F1F9', '#6FFFE9'],
            ['#12263A', '#1B4965', '#5FA8D3', '#CAE9FF', '#62B6CB', '#F4A261'],
            ['#1A1B41', '#2D4263', '#3E7CB1', '#81C3D7', '#DBE4EE', '#E9806E']
        ],
        fantasy: [
            ['#190019', '#2B124C', '#522B5B', '#854F6C', '#DFB6B2', '#FBE4D8'],
            ['#1B102B', '#3B1E54', '#6D3B7A', '#A2678A', '#E3B5A4', '#FFF1D0'],
            ['#0F1020', '#2A1B3D', '#5B2A86', '#9A5BC7', '#D9A7C7', '#F7E8F0'],
            ['#201335', '#3F2E56', '#70587C', '#C08497', '#F7AF9D', '#F7EDE2'],
            ['#171226', '#36213E', '#554971', '#8F6593', '#D4A5A5', '#F2E9E4']
        ],
        dark: [
            ['#161E2F', '#232F49', '#384358', '#FFA586', '#E51A2B', '#541A2E'],
            ['#101820', '#1D2D44', '#3E5C76', '#F0EBD8', '#EE6C4D', '#6B2737'],
            ['#111827', '#233142', '#455D7A', '#F95959', '#F7B267', '#53354A'],
            ['#0B0F19', '#1F2937', '#374151', '#9CA3AF', '#F97316', '#7F1D1D'],
            ['#171321', '#2D2238', '#4A365D', '#C08497', '#F4A261', '#7B1E3B']
        ],
        natural: [
            ['#051F20', '#0B2B26', '#163832', '#235347', '#8EB69B', '#DAF1DE'],
            ['#102A27', '#214E34', '#4F772D', '#90A955', '#ECF39E', '#CAD2C5'],
            ['#132A13', '#31572C', '#4F772D', '#90A955', '#C9E4CA', '#F2E8CF'],
            ['#0B3D2E', '#1B5E4B', '#3A7D44', '#7FB069', '#D6EFC7', '#F4F1DE'],
            ['#12372A', '#436850', '#789461', '#ADBC9F', '#FBFADA', '#BFD8AF']
        ]
    };
    let selectedThemeKey = themeDefs[0].key;
    let selectedThemeStep = 0;
    let activeAssignMode = 'alternate';
    let colorBlendEnabled = false;
    const themeState = {};
    let activeThemeRenderStep = 0;
    let activeThemeRenderColors = [];

    function getThemeDef(themeKey) {
        return themeDefs.find((theme) => theme.key === themeKey) || themeDefs[0];
    }

    function themeStepLabel(step) {
        const value = themeCycle[((step % themeCycle.length) + themeCycle.length) % themeCycle.length];
        return value === 'multi' ? '多色' : `${value}色`;
    }

    function clampThemeStep(step) {
        return ((step % themeCycle.length) + themeCycle.length) % themeCycle.length;
    }

    function clonePalette(colors) {
        return colors.map((rgb) => rgb.slice(0, 3));
    }

    function shiftRgb(rgb, amount) {
        return rgb.map((value, index) => {
            const offset = amount * (index === 1 ? 0.75 : index === 2 ? -0.55 : 1);
            return Math.max(0, Math.min(255, Math.round(value + offset)));
        });
    }

    function hexToThemeRgb(hex) {
        const normalized = String(hex).replace('#', '');
        return [
            parseInt(normalized.slice(0, 2), 16),
            parseInt(normalized.slice(2, 4), 16),
            parseInt(normalized.slice(4, 6), 16)
        ];
    }

    function getBankThemePalette(themeKey, step, variantIndex) {
        const bank = THEME_PALETTE_BANK[themeKey];
        if (!bank) return null;
        const palette = bank[(Math.max(0, parseInt(variantIndex, 10) || 0)) % bank.length].map(hexToThemeRgb);
        const mode = themeCycle[clampThemeStep(step)];
        if (mode === 1) return [palette[3]];
        if (mode === 2) return [palette[3], palette[5]];
        if (mode === 4) return [palette[0], palette[2], palette[5], palette[4]];
        return palette;
    }

    function getThemePalette(themeKey, step, variantIndex = 0) {
        const bankPalette = getBankThemePalette(themeKey, step, variantIndex);
        if (bankPalette) return bankPalette;
        const theme = getThemeDef(themeKey);
        const mode = themeCycle[clampThemeStep(step)];
        const count = mode === 'multi' ? 7 : mode;
        const variant = Math.max(0, parseInt(variantIndex, 10) || 0);
        const variantOffset = variant === 0 ? 0 : (((variant * 23) % 54) - 27);
        const base = shiftRgb(theme.base, variantOffset);
        const accent = shiftRgb(theme.accent, -variantOffset * 0.65);
        const vivid = shiftRgb(theme.vivid, variantOffset * 0.45);
        const palette = [];
        for (let i = 0; i < count; i++) {
            if (count === 1) {
                palette.push(base);
            } else if (count === 2) {
                palette.push(i === 0 ? base : accent);
            } else if (count === 4) {
                palette.push([base, accent, vivid, [245, 245, 245]][i]);
            } else {
                palette.push([
                    base,
                    accent,
                    vivid,
                    [255, 222, 126],
                    [100, 210, 255],
                    [216, 114, 255],
                    [120, 240, 160]
                ][i % 7]);
            }
        }
        return palette;
    }

    function ensureThemeState(themeKey) {
        const theme = getThemeDef(themeKey);
        const existing = themeState[theme.key];
        if (existing && Array.isArray(existing.colors)) {
            existing.step = clampThemeStep(Number.isFinite(existing.step) ? existing.step : 0);
            existing.variantIndex = Math.max(0, parseInt(existing.variantIndex, 10) || 0);
            if (THEME_PALETTE_BANK[theme.key]) {
                existing.colors = getThemePalette(theme.key, existing.step, existing.variantIndex);
            }
            return existing;
        }
        const step = theme.key === selectedThemeKey ? selectedThemeStep : 0;
        const variantIndex = 0;
        themeState[theme.key] = {
            step,
            variantIndex,
            colors: getThemePalette(theme.key, step, variantIndex)
        };
        return themeState[theme.key];
    }

    function regenerateThemeState(themeKey, advanceVariant = false) {
        const state = ensureThemeState(themeKey);
        if (advanceVariant) {
            const bank = THEME_PALETTE_BANK[themeKey];
            state.variantIndex = (state.variantIndex + 1) % (bank ? bank.length : 24);
        }
        state.colors = getThemePalette(themeKey, state.step, state.variantIndex);
        return state;
    }

    function pickThemeRenderColor(index, totalPoints, colors, mode = 'alternate') {
        if (!Array.isArray(colors) || !colors.length) return null;
        if (colors.length === 1) return colors[0].slice();
        const safeTotal = Math.max(1, parseInt(totalPoints, 10) || 1);
        let colorIndex;
        if (mode === 'block') {
            const pointsPerColor = Math.ceil(safeTotal / colors.length);
            colorIndex = Math.min(Math.floor(index / pointsPerColor), colors.length - 1);
        } else {
            colorIndex = index % colors.length;
        }
        return colors[colorIndex].slice();
    }

    function clampUnit(value) {
        return Math.max(0, Math.min(1, Number(value) || 0));
    }

    function parseComputedRgb(color) {
        const text = String(color || '').trim();
        const rgbaMatch = text.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgbaMatch) {
            return {
                r: Math.max(0, Math.min(255, parseInt(rgbaMatch[1], 10) || 0)),
                g: Math.max(0, Math.min(255, parseInt(rgbaMatch[2], 10) || 0)),
                b: Math.max(0, Math.min(255, parseInt(rgbaMatch[3], 10) || 0))
            };
        }
        const hexMatch = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hexMatch) {
            const hex = hexMatch[1];
            const expanded = hex.length === 3
                ? hex.split('').map((char) => char + char).join('')
                : hex;
            return {
                r: parseInt(expanded.slice(0, 2), 16),
                g: parseInt(expanded.slice(2, 4), 16),
                b: parseInt(expanded.slice(4, 6), 16)
            };
        }
        const colorMatch = text.match(/^color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\)$/i);
        if (colorMatch) {
            return {
                r: Math.max(0, Math.min(255, Math.round((parseFloat(colorMatch[1]) || 0) * 255))),
                g: Math.max(0, Math.min(255, Math.round((parseFloat(colorMatch[2]) || 0) * 255))),
                b: Math.max(0, Math.min(255, Math.round((parseFloat(colorMatch[3]) || 0) * 255)))
            };
        }
        return null;
    }

    function srgbToLinear(value) {
        const normalized = Math.max(0, Math.min(1, value / 255));
        return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
    }

    function getRelativeLuminanceForRgb(rgb) {
        if (!rgb) return 0;
        return (0.2126 * srgbToLinear(rgb.r)) + (0.7152 * srgbToLinear(rgb.g)) + (0.0722 * srgbToLinear(rgb.b));
    }

    function getContrastRatio(rgbA, rgbB) {
        const l1 = getRelativeLuminanceForRgb(rgbA);
        const l2 = getRelativeLuminanceForRgb(rgbB);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function chooseReadableTextColorForBackground(bgRgb, options = {}) {
        if (!bgRgb) return options.fallback || '#111827';
        const candidates = options.candidates || [
            { color: '#111827', label: 'dark' },
            { color: '#24344d', label: 'softDark' },
            { color: '#ffffff', label: 'light' },
            { color: '#f8fafc', label: 'softLight' }
        ];
        let bestColor = options.fallback || '#111827';
        let bestScore = -Infinity;
        candidates.forEach((candidate) => {
            const candidateRgb = parseComputedRgb(candidate.color);
            if (!candidateRgb) return;
            const contrast = getContrastRatio(bgRgb, candidateRgb);
            const bias = candidate.label === 'softDark' || candidate.label === 'softLight' ? 0.03 : 0;
            const score = contrast + bias;
            if (score > bestScore) {
                bestScore = score;
                bestColor = candidate.color;
            }
        });
        return bestColor;
    }

    function getReadableTextColorForRgb(rgb) {
        return chooseReadableTextColorForBackground(rgb, {
            fallback: '#111827'
        });
    }

    function getColorContainerReadableState() {
        return document.body?.classList.contains('glass-bg-dark') ? 'dark' : 'light';
    }

    function getCanvasBackgroundForReadableColor() {
        const body = document.body;
        const candidates = [
            window.config?.canvasBgColor,
            body ? body.style.getPropertyValue('--canvas-bg-color') : '',
            body ? body.style.getPropertyValue('--global-canvas-bg-color') : '',
            getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-color'),
            getComputedStyle(document.documentElement).getPropertyValue('--global-canvas-bg-color'),
            (() => { try { return localStorage.getItem('globalCanvasBgColor'); } catch (error) { return ''; } })()
        ];
        return candidates.find((value) => typeof value === 'string' && value.trim()) || '';
    }

    function getAutoReadableTextColorFromBackground() {
        const bg = getCanvasBackgroundForReadableColor();
        const bgRgb = parseComputedRgb(bg);
        if (bgRgb) {
            return chooseReadableTextColorForBackground(bgRgb, { fallback: '#111827' });
        }
        if (document.body?.dataset?.canvasBgTone === 'dark' || document.body?.classList.contains('glass-bg-dark')) return '#ffffff';
        return '#111827';
    }

    function getReadablePanelStateFromColor(color) {
        const rgb = parseComputedRgb(color);
        if (!rgb) return color === '#ffffff' || color === '#f8fafc' ? 'dark' : 'light';
        const brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
        return brightness > 180 ? 'dark' : 'light';
    }

    function isFixedLightPanelTextElement(el) {
        return !!(el && el.closest && el.closest([
            '#ui-size-tuner-panel',
            '#ui-preset-panel .glass-preset-details',
            '#ui-preset-panel .glass-preset-rows',
            '#ui-preset-panel .glass-preset-actions',
            '#ui-preset-panel .glass-preset-details-toggle',
            '.palette-details-section',
            '.palette-details',
            '[data-palette-details]',
            '.palette-detail-group'
        ].join(',')));
    }

    function applyAutoReadableIconColor(panelState, forcedColor = '') {
        const color = forcedColor || getAutoReadableTextColorFromBackground();
        const isDark = getReadablePanelStateFromColor(color) === 'dark';
        const shadow = isDark ? '0 1px 2px rgba(0, 0, 0, 0.55)' : 'none';
        const body = document.body;
        if (!body) return;
        body.style.setProperty('--ui-auto-readable-icon-color', color);
        body.style.setProperty('--ui-auto-readable-icon-shadow', shadow);
        body.style.setProperty('--auto-readable-text-color', color);
        body.style.setProperty('--glass-resolved-text-color', color);
        body.dataset.canvasBgTone = isDark ? 'dark' : 'light';

        document.querySelectorAll('#ui-variant-panel, #ui-preset-panel, #ui-variant-compact-panel, .ui-variant-compact-panel').forEach((panel) => {
            panel.style.setProperty('--ui-auto-readable-icon-color', color, 'important');
            panel.style.setProperty('--auto-readable-text-color', color, 'important');
            panel.style.setProperty('--glass-resolved-text-color', color, 'important');
            panel.querySelectorAll('select, option, button, .glass-preset-details-toggle, .glass-preset-selected-lock, label, span').forEach((el) => {
                if (isFixedLightPanelTextElement(el)) {
                    el.style.setProperty('color', '#111827', 'important');
                    el.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
                    el.style.setProperty('text-shadow', 'none', 'important');
                    return;
                }
                el.style.setProperty('color', color, 'important');
                el.style.setProperty('-webkit-text-fill-color', color, 'important');
                el.style.setProperty('text-shadow', shadow, 'important');
            });
        });
        document.querySelectorAll('#case-comparison.case-palette-only .case-choice-button, #case-comparison.case-palette-only .case-index-button, #case-comparison.case-palette-only .case-slot-button, #case-comparison.case-palette-only .case-slot-button *, #case-comparison.case-palette-only .case-action-button, #case-comparison.case-palette-only .case-action-glyph, #case-comparison.case-palette-only .case-layout-toggle').forEach((el) => {
            el.style.setProperty('color', color, 'important');
            el.style.setProperty('-webkit-text-fill-color', color, 'important');
            el.style.setProperty('text-shadow', shadow, 'important');
        });
        document.querySelectorAll('.color-transition-label, #color-transition-seconds').forEach((el) => {
            el.style.setProperty('color', color, 'important');
            el.style.setProperty('-webkit-text-fill-color', color, 'important');
            el.style.setProperty('text-shadow', shadow, 'important');
        });
        document.querySelectorAll('.color-transition-triangle-up').forEach((el) => {
            el.style.setProperty('border-bottom-color', color, 'important');
            el.style.setProperty('border-top-color', 'transparent', 'important');
            el.style.setProperty('filter', 'none', 'important');
            el.style.setProperty('transition', 'none', 'important');
            el.style.setProperty('transform', 'translateX(-50%)', 'important');
        });
        document.querySelectorAll('.color-transition-triangle-down').forEach((el) => {
            el.style.setProperty('border-top-color', color, 'important');
            el.style.setProperty('border-bottom-color', 'transparent', 'important');
            el.style.setProperty('filter', 'none', 'important');
            el.style.setProperty('transition', 'none', 'important');
            el.style.setProperty('transform', 'translateX(-50%)', 'important');
        });
    }

    function applyReadableTextColors(root = document) {
        const readableTextColor = getAutoReadableTextColorFromBackground();
        const panelState = getReadablePanelStateFromColor(readableTextColor);
        const body = document.body;
        if (body) {
            body.style.setProperty('--auto-readable-text-color', readableTextColor);
            body.style.setProperty('--glass-resolved-text-color', readableTextColor);
            body.dataset.canvasBgTone = panelState === 'dark' ? 'dark' : 'light';
        }
        applyAutoReadableIconColor(panelState, readableTextColor);
        applyPaletteDetailsFixedTextColor(root);
        applySizeTunerFixedTextColor(root);
        const readablePanelSelectors = '#color-container, #glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7, #ui-variant-panel, #ui-preset-panel, #ui-variant-compact-panel, .ui-variant-compact-panel';
        const assignButtons = root.querySelectorAll('.color-assign-btn[data-assign-mode]');
        assignButtons.forEach((button) => {
            const inColorPanel = button.matches(`${readablePanelSelectors} .color-assign-btn[data-assign-mode]`);
            const color = inColorPanel
                ? (panelState === 'dark' ? '#ffffff' : '#111827')
                : getReadableTextColorForRgb(parseComputedRgb(window.getComputedStyle(button).backgroundColor));
            button.style.setProperty('color', color, 'important');
            button.style.setProperty('-webkit-text-fill-color', color, 'important');
        });

        const blendButtons = root.querySelectorAll('.color-blend-btn, .color-theme-recolor-btn, [data-theme-blend]');
        blendButtons.forEach((button) => {
            const inColorPanel = button.matches(`${readablePanelSelectors} .color-blend-btn, ${readablePanelSelectors} .color-theme-recolor-btn, ${readablePanelSelectors} [data-theme-blend]`);
            const color = inColorPanel
                ? (panelState === 'dark' ? '#ffffff' : '#111827')
                : getReadableTextColorForRgb(parseComputedRgb(window.getComputedStyle(button).backgroundColor));
            button.style.setProperty('color', color, 'important');
            button.style.setProperty('-webkit-text-fill-color', color, 'important');
        });

        root.querySelectorAll('.color-theme-card').forEach((card) => {
            const inColorPanel = card.matches(`${readablePanelSelectors} .color-theme-card`);
            const color = inColorPanel
                ? (panelState === 'dark' ? '#ffffff' : '#2f2f2f')
                : getReadableTextColorForRgb(parseComputedRgb(window.getComputedStyle(card).backgroundColor));
            card.style.setProperty('color', color, 'important');
            card.style.setProperty('-webkit-text-fill-color', color, 'important');
            const name = card.querySelector('.color-theme-name');
            if (name) {
                const nameColor = inColorPanel
                    ? (panelState === 'dark' ? (card.classList.contains('is-active') || card.getAttribute('aria-pressed') === 'true' ? '#ffffff' : 'rgba(255, 255, 255, 0.62)') : (card.classList.contains('is-active') || card.getAttribute('aria-pressed') === 'true' ? '#2f2f2f' : 'rgba(47, 47, 47, 0.50)'))
                    : color;
                name.style.setProperty('color', nameColor, 'important');
                name.style.setProperty('-webkit-text-fill-color', nameColor, 'important');
            }
        });

        const colorContainer = root === document
            ? (document.querySelector('#color-container .color-assign-btn[data-assign-mode], #glass-cursor-panel-3 .color-assign-btn[data-assign-mode], #glass-cursor-panel-4 .color-assign-btn[data-assign-mode], #glass-cursor-panel-6 .color-assign-btn[data-assign-mode], #glass-cursor-panel-7 .color-assign-btn[data-assign-mode], #ui-variant-panel .color-assign-btn[data-assign-mode]')?.closest('#color-container, #glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7, #ui-variant-panel')
                || document.getElementById('color-container')
                || document.getElementById('glass-cursor-panel-3')
                || document.getElementById('glass-cursor-panel-4')
                || document.getElementById('glass-cursor-panel-6')
                || document.getElementById('glass-cursor-panel-7')
                || document.getElementById('ui-variant-panel')
                || document.getElementById('ui-preset-panel')
                || document.getElementById('ui-variant-compact-panel'))
            : root.closest?.('#color-container, #glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7, #ui-variant-panel')
                || root.querySelector?.('#color-container, #glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7, #ui-variant-panel, #ui-preset-panel, #ui-variant-compact-panel, .ui-variant-compact-panel')
                || null;
        if (!colorContainer || (root !== document && !colorContainer.contains(root))) {
            return;
        }

        const inactiveAssignColor = panelState === 'dark' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(36, 52, 77, 0.52)';
        const activeAssignColor = panelState === 'dark' ? '#ffffff' : '#111827';
        const inactiveThemeNameColor = panelState === 'dark' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(47, 47, 47, 0.50)';
        const activeThemeNameColor = panelState === 'dark' ? '#ffffff' : '#2f2f2f';
        const inactiveLightTextColor = panelState === 'dark' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(36, 52, 77, 0.52)';
        const activeLightTextColor = panelState === 'dark' ? '#ffffff' : '#111827';
        const activeLightShadow = '0 1px 2px rgba(0, 0, 0, 0.55)';
        const inactiveLightShadow = '0 1px 1px rgba(0, 0, 0, 0.38)';
        const activeDarkShadow = 'none';
        const inactiveDarkShadow = 'none';
        const transitionValue = 'color 2s ease, -webkit-text-fill-color 2s ease, background-color 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease, opacity 0.14s ease';

        const colorContainerButtons = colorContainer.querySelectorAll('.color-assign-btn[data-assign-mode], .color-blend-btn, .color-theme-recolor-btn');
        colorContainerButtons.forEach((button) => {
            button.style.transition = transitionValue;
        });

        const assignButtonsInColorContainer = colorContainer.querySelectorAll('.color-assign-btn[data-assign-mode]');
        assignButtonsInColorContainer.forEach((button) => {
            const active = button.classList.contains('is-active') || button.getAttribute('aria-pressed') === 'true';
            const color = panelState === 'dark'
                ? (active ? activeLightTextColor : inactiveLightTextColor)
                : (active ? activeAssignColor : inactiveAssignColor);
            button.style.setProperty('color', color, 'important');
            button.style.setProperty('-webkit-text-fill-color', color, 'important');
            button.style.setProperty('opacity', active ? '1' : '0.78', 'important');
            button.style.setProperty('text-shadow', panelState === 'dark'
                ? (active ? activeLightShadow : inactiveLightShadow)
                : (active ? activeDarkShadow : inactiveDarkShadow), 'important');
        });

        const blendButtonsInColorContainer = colorContainer.querySelectorAll('.color-blend-btn, [data-theme-blend]');
        blendButtonsInColorContainer.forEach((button) => {
            const active = button.classList.contains('is-active') || button.getAttribute('aria-pressed') === 'true';
            if (active) {
                const color = panelState === 'dark' ? activeLightTextColor : activeAssignColor;
                button.style.setProperty('color', color, 'important');
                button.style.setProperty('-webkit-text-fill-color', color, 'important');
            } else {
                const color = panelState === 'dark' ? inactiveLightTextColor : inactiveAssignColor;
                button.style.setProperty('color', color, 'important');
                button.style.setProperty('-webkit-text-fill-color', color, 'important');
                button.style.setProperty('opacity', '0.78', 'important');
            }
            button.style.setProperty('text-shadow', panelState === 'dark'
                ? (active ? activeLightShadow : inactiveLightShadow)
                : (active ? activeDarkShadow : inactiveDarkShadow), 'important');
        });

        colorContainer.querySelectorAll('.color-theme-card').forEach((card) => {
            const active = card.classList.contains('is-active') || card.getAttribute('aria-pressed') === 'true';
            const name = card.querySelector('.color-theme-name');
            if (name) {
                const color = panelState === 'dark'
                    ? (active ? activeLightTextColor : inactiveLightTextColor)
                    : (active ? activeThemeNameColor : inactiveThemeNameColor);
                name.style.setProperty('color', color, 'important');
                name.style.setProperty('-webkit-text-fill-color', color, 'important');
                name.style.setProperty('transition', 'color 2s ease, -webkit-text-fill-color 2s ease', 'important');
                name.style.setProperty('opacity', '1', 'important');
                name.style.setProperty('filter', 'none', 'important');
                name.style.setProperty('text-shadow', panelState === 'dark'
                    ? (active ? activeLightShadow : inactiveLightShadow)
                    : 'none', 'important');
            }
            card.style.setProperty('transition', 'transform 0.14s ease, background 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease, filter 0.14s ease, opacity 0.14s ease', 'important');
            card.style.setProperty('opacity', active ? '1' : '0.78', 'important');
        });

        const textPanels = root.querySelectorAll('#glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7');
        textPanels.forEach((panel) => {
            panel.querySelectorAll('.ui-header, .ui-header *, .slider-label, .slider-value, .reset-btn, .spatial-action-button').forEach((el) => {
                el.style.setProperty('color', readableTextColor, 'important');
                el.style.setProperty('-webkit-text-fill-color', readableTextColor, 'important');
                if (el.classList.contains('ui-header')) {
                    el.style.setProperty('text-shadow', panelState === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.18) 0px 1px 0px', 'important');
                }
            });
        });
        document.querySelectorAll('#glass-cursor-panel-3 .color-theme-recolor-btn').forEach((button) => {
            button.style.setProperty('color', readableTextColor, 'important');
            button.style.setProperty('-webkit-text-fill-color', readableTextColor, 'important');
        });
        applyPaletteDetailsFixedTextColor(root);
        applySizeTunerFixedTextColor(root);
    }



    function applyPaletteDetailsFixedTextColor(root = document) {
        const fixedColor = '#111827';
        const fixedSoftColor = 'rgba(17, 24, 39, 0.72)';
        const detailsRoots = root.querySelectorAll
            ? root.querySelectorAll('.palette-details-section, .palette-details, [data-palette-details], .palette-detail-group, #ui-preset-panel .glass-preset-details, #ui-preset-panel .glass-preset-rows, #ui-preset-panel .glass-preset-actions')
            : [];
        detailsRoots.forEach((details) => {
            details.style.setProperty('--auto-readable-text-color', fixedColor, 'important');
            details.style.setProperty('--glass-resolved-text-color', fixedColor, 'important');
            details.style.setProperty('--ui-auto-readable-icon-color', fixedColor, 'important');
            details.style.setProperty('color', fixedColor, 'important');
            details.style.setProperty('-webkit-text-fill-color', fixedColor, 'important');
            details.style.setProperty('text-shadow', 'none', 'important');
            details.querySelectorAll('span, label, .row-label, .row-value, .palette-section-title, .palette-system-tab-name, .palette-system-tab-desc, button, select, option, input, textarea, small, strong, em, div').forEach((el) => {
                const isMuted = el.matches('.row-value, .palette-system-tab-desc, small');
                el.style.setProperty('color', isMuted ? fixedSoftColor : fixedColor, 'important');
                el.style.setProperty('-webkit-text-fill-color', isMuted ? fixedSoftColor : fixedColor, 'important');
                el.style.setProperty('text-shadow', 'none', 'important');
            });
        });
        root.querySelectorAll?.('[data-palette-details-toggle], .palette-details-toggle, #ui-preset-panel .glass-preset-details-toggle').forEach((toggle) => {
            toggle.style.setProperty('color', fixedColor, 'important');
            toggle.style.setProperty('-webkit-text-fill-color', fixedColor, 'important');
            toggle.style.setProperty('text-shadow', 'none', 'important');
        });
    }

    function applySizeTunerFixedTextColor(root = document) {
        const panel = root.getElementById ? root.getElementById('ui-size-tuner-panel') : document.getElementById('ui-size-tuner-panel');
        if (!panel) return;
        panel.style.setProperty('--auto-readable-text-color', '#111827', 'important');
        panel.style.setProperty('--ui-auto-readable-icon-color', '#111827', 'important');
        panel.style.setProperty('color', '#111827', 'important');
        panel.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
        panel.style.setProperty('text-shadow', 'none', 'important');
        panel.querySelectorAll('h2, h3, p, span, label, button, select, option, input, textarea, small, strong, em, div, pre').forEach((el) => {
            const soft = el.matches('.ui-size-tuner-head p, .ui-size-tuner-status, .ui-size-tuner-computed, .ui-size-tuner-engine-note, .ui-size-tuner-value');
            const c = soft ? 'rgba(31, 42, 61, 0.78)' : '#111827';
            el.style.setProperty('color', c, 'important');
            el.style.setProperty('-webkit-text-fill-color', c, 'important');
            el.style.setProperty('text-shadow', 'none', 'important');
        });
    }

    function installReadableTextColorObserver() {
        if (window.__colorReadableTextObserverInstalled) return;
        window.__colorReadableTextObserverInstalled = true;
        const body = document.body;
        if (!body || typeof MutationObserver === 'undefined') return;
        let scheduled = false;
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            const run = () => {
                applyReadableTextColors();
            };
            window.requestAnimationFrame(() => {
                scheduled = false;
                run();
                /* v88: 左上miniパネルはGlass/Neumorphism適用処理が
                 * 後からinline colorを書き戻す場合がある。右上設定UIと同じ
                 * 最終可読色を維持するため、テーマ切替直後だけ数回再適用する。 */
                setTimeout(run, 0);
                setTimeout(run, 80);
                setTimeout(run, 220);
            });
        };
        const observer = new MutationObserver((mutations) => {
            const shouldRun = mutations.some((mutation) => {
                if (mutation.type === 'childList') return true;
                return mutation.type === 'attributes' && ['class', 'style', 'data-canvas-bg-tone', 'data-ui-theme', 'data-ui-variant'].includes(mutation.attributeName);
            });
            if (shouldRun) schedule();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-canvas-bg-tone', 'data-ui-theme', 'data-ui-variant'] });
        observer.observe(body, { attributes: true, childList: true, subtree: true, attributeFilter: ['class', 'style', 'data-canvas-bg-tone', 'data-ui-theme', 'data-ui-variant'] });
        window.__colorReadableTextObserver = observer;
        window.UIUXApplyReadableTextColors = applyReadableTextColors;
        window.UIUXRefreshReadableTextColors = schedule;
        schedule();
        setTimeout(schedule, 0);
        setTimeout(schedule, 80);
        setTimeout(schedule, 240);
        setTimeout(schedule, 720);
        window.addEventListener('load', schedule, { once: true });
    }

    function lerpColorArray(a, b, amount) {
        const t = clampUnit(amount);
        return [0, 1, 2].map((index) => Math.round(a[index] + ((b[index] - a[index]) * t)));
    }

    function pickThemeBlendColor(t, colors) {
        if (!Array.isArray(colors) || !colors.length) return null;
        if (colors.length === 1) return colors[0].slice();
        if (colors.length === 2) {
            const scaled = clampUnit(t) * (colors.length - 1);
            const leftIndex = Math.floor(scaled);
            const rightIndex = Math.min(leftIndex + 1, colors.length - 1);
            return lerpColorArray(colors[leftIndex], colors[rightIndex], scaled - leftIndex);
        }
        const scaled = clampUnit(t) * colors.length;
        const leftIndex = Math.floor(scaled) % colors.length;
        const rightIndex = (leftIndex + 1) % colors.length;
        return lerpColorArray(colors[leftIndex], colors[rightIndex], scaled - Math.floor(scaled));
    }

    function pickThemeAreaColor(index, totalPoints, colors, mode, x, y, canvasW, canvasH) {
        if (!Array.isArray(colors) || !colors.length) return null;
        if (colors.length === 1) return colors[0].slice();
        const safeW = Math.max(1, Number(canvasW) || 1);
        const safeH = Math.max(1, Number(canvasH) || 1);
        const safeX = Number.isFinite(Number(x)) ? Number(x) : 0;
        const safeY = Number.isFinite(Number(y)) ? Number(y) : 0;
        const vectorsList = Array.isArray(window.vectors) ? window.vectors : [];
        const themeBounds = mode === 'center' && vectorsList.length
            ? vectorsList.reduce((acc, vector) => {
                const vx = Number(vector?.current?.x);
                const vy = Number(vector?.current?.y);
                if (!Number.isFinite(vx) || !Number.isFinite(vy)) return acc;
                acc.minX = Math.min(acc.minX, vx);
                acc.maxX = Math.max(acc.maxX, vx);
                acc.minY = Math.min(acc.minY, vy);
                acc.maxY = Math.max(acc.maxY, vy);
                return acc;
            }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })
            : null;
        let t = 0;
        if (mode === 'areaLR') {
            t = safeX / safeW;
        } else if (mode === 'areaTB') {
            t = safeY / safeH;
        } else if (mode === 'diagTLBR') {
            t = ((safeX / safeW) + (safeY / safeH)) / 2;
        } else if (mode === 'center') {
            const hasBounds = themeBounds && Number.isFinite(themeBounds.minX) && Number.isFinite(themeBounds.maxX)
                && Number.isFinite(themeBounds.minY) && Number.isFinite(themeBounds.maxY)
                && themeBounds.maxX >= themeBounds.minX
                && themeBounds.maxY >= themeBounds.minY;
            const cx = hasBounds ? (themeBounds.minX + themeBounds.maxX) / 2 : safeW / 2;
            const cy = hasBounds ? (themeBounds.minY + themeBounds.maxY) / 2 : safeH / 2;
            const spanX = hasBounds ? Math.max(1, themeBounds.maxX - themeBounds.minX) : safeW;
            const spanY = hasBounds ? Math.max(1, themeBounds.maxY - themeBounds.minY) : safeH;
            const dx = safeX - cx;
            const dy = safeY - cy;
            const maxDistance = Math.max(1, Math.sqrt((spanX / 2) ** 2 + (spanY / 2) ** 2));
            t = Math.sqrt((dx * dx) + (dy * dy)) / maxDistance;
        } else if (colorBlendEnabled) {
            const safeTotal = Math.max(1, parseInt(totalPoints, 10) || 1);
            t = safeTotal <= 1 ? 0 : index / (safeTotal - 1);
        } else {
            return pickThemeRenderColor(index, totalPoints, colors, mode);
        }
        if (colorBlendEnabled) {
            return pickThemeBlendColor(t, colors);
        }
        const colorIndex = Math.min(Math.floor(Math.max(0, Math.min(0.999999, t)) * colors.length), colors.length - 1);
        return colors[colorIndex].slice();
    }

    function syncAssignModeButtons() {
        document.querySelectorAll('.color-assign-btn[data-assign-mode]').forEach((button) => {
            const active = button.dataset.assignMode === activeAssignMode;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
            button.style.webkitAppearance = 'none';
            button.style.appearance = 'none';
            button.style.borderRadius = '6px';
        });
        applyReadableTextColors();
    }

    function syncBlendButton() {
        document.querySelectorAll('[data-theme-blend]').forEach((button) => {
            button.classList.toggle('is-active', colorBlendEnabled);
            button.setAttribute('aria-pressed', String(colorBlendEnabled));
            button.style.webkitAppearance = 'none';
            button.style.appearance = 'none';
            button.style.borderRadius = '6px';
        });
        document.querySelectorAll('[data-theme-recolor]').forEach((button) => {
            button.style.webkitAppearance = 'none';
            button.style.appearance = 'none';
            button.style.borderRadius = '6px';
        });
        applyReadableTextColors();
    }

    function applyAssignMode(mode) {
        activeAssignMode = assignModeDefs.some((def) => def.key === mode) ? mode : 'alternate';
        localStorage.setItem(assignModeStorageKey, JSON.stringify(activeAssignMode));
        if (window.ColorEngine && typeof window.ColorEngine.applySettings === 'function') {
            const engineMode = activeAssignMode === 'center' ? 'alternate' : activeAssignMode;
            window.ColorEngine.applySettings({ assignModeGlobal: engineMode }, 'assignMode');
            if (typeof window.ColorEngine.save === 'function') window.ColorEngine.save();
        }
        syncAssignModeButtons();
        Color.updateColorEngineUI();
        Color.updatePaletteSystemUI();
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
    }

    function applyBlendMode(enabled) {
        colorBlendEnabled = Boolean(enabled);
        localStorage.setItem(blendEnabledStorageKey, colorBlendEnabled ? '1' : '0');
        syncBlendButton();
        syncThemeCards();
        Color.updateColorPreview();
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
    }

    function startPalettePointColorTransition() {
        if (typeof window.startCasePointColorTransition === 'function') {
            window.startCasePointColorTransition();
        }
    }

    function getTransitionSecondsValue() {
        if (window.getColorTransitionDurationMs && typeof window.getColorTransitionDurationMs === 'function') {
            const durationMs = window.getColorTransitionDurationMs();
            if (Number.isFinite(durationMs)) {
                return Math.min(9.9, Math.max(0, durationMs / 1000));
            }
        }
        try {
            const saved = localStorage.getItem('colorTransitionSeconds');
            if (saved !== null) {
                const parsed = Number.parseFloat(saved);
                if (Number.isFinite(parsed) && parsed >= 0) {
                    return Math.min(9.9, parsed);
                }
            }
        } catch (error) {
            // ignore
        }
        return 3;
    }

    function setTransitionSecondsInputValue(value) {
        const input = document.getElementById('color-transition-seconds');
        if (input) {
            input.value = String(value);
        }
    }

    function saveTransitionSecondsValue(value) {
        const seconds = Number(value);
        const normalized = Number.isFinite(seconds) && seconds >= 0 ? Math.min(9.9, seconds) : 3;
        localStorage.setItem('colorTransitionSeconds', String(normalized));
        setTransitionSecondsInputValue(normalized);
        return normalized;
    }

    function handleTransitionSecondsChange(event) {
        const nextValue = saveTransitionSecondsValue(event?.target?.value);
        if (event?.target) {
            event.target.value = String(nextValue);
        }
        const durationMs = Math.round(nextValue * 1000);
        if (window.updateColorTransitionDurationMs) {
            window.updateColorTransitionDurationMs(durationMs);
        }
        if (window.ColorEngine && typeof window.ColorEngine.updateTransitionDuration === 'function') {
            window.ColorEngine.updateTransitionDuration(durationMs);
        }
        if (typeof window.startCasePointColorTransition === 'function') {
            window.startCasePointColorTransition();
        }
    }

    function ensureThemeColorEngineOverride() {
        if (!window.ColorEngine || typeof window.ColorEngine.getPointColor !== 'function') return;
        if (!window.ColorEngine.__themeOriginalGetPointColor) {
            window.ColorEngine.__themeOriginalGetPointColor = window.ColorEngine.getPointColor;
        }
        window.ColorEngine.getPointColor = function(i, totalPoints, x, y, caseId, canvasW, canvasH) {
            if (paletteSystem === 'engine' && activeThemeRenderColors.length >= 2) {
                const rgb = pickThemeAreaColor(i, totalPoints, activeThemeRenderColors, activeAssignMode, x, y, canvasW, canvasH);
                if (rgb) return rgb;
            }
            return window.ColorEngine.__themeOriginalGetPointColor(i, totalPoints, x, y, caseId, canvasW, canvasH);
        };
    }

    function applyThemeToColorSystem(themeKey) {
        const state = ensureThemeState(themeKey);
        const step = state.step;
        const mode = themeCycle[step];
        const colors = clonePalette(state.colors);
        activeThemeRenderStep = step;
        activeThemeRenderColors = colors;
        useRandomColors = false;
        randomColors = [];

        if (mode === 1) {
            colorMode = 'off';
            paletteSystem = 'legacy';
            hueRangeColors = [];
            hueRangeBaseColors = [];
            if (window.currentCase && window.currentCase.config && Array.isArray(window.currentCase.config.color)) {
                window.currentCase.config.color = colors[0].slice();
            }
        } else if (mode === 2 || mode === 4) {
            colorMode = 'off';
            paletteSystem = 'engine';
            hueRangeColors = [];
            hueRangeBaseColors = [];
            if (window.currentCase && window.currentCase.config && Array.isArray(window.currentCase.config.color)) {
                window.currentCase.config.color = colors[0].slice();
            }
            if (window.ColorEngine) {
                window.ColorEngine.applySettings({
                    baseColors: colors.slice(0, mode).map((rgb) => rgb.slice()),
                    groupCount: mode,
                    durationMs: window.getColorTransitionDurationMs ? window.getColorTransitionDurationMs() : 3000
                }, 'theme');
                ensureThemeColorEngineOverride();
                if (typeof window.ColorEngine.save === 'function') {
                    window.ColorEngine.save();
                }
            }
        } else {
            colorMode = 'off';
            paletteSystem = 'engine';
            hueRangeColors = [];
            hueRangeBaseColors = [];
            if (window.currentCase && window.currentCase.config && Array.isArray(window.currentCase.config.color)) {
                window.currentCase.config.color = colors[0].slice();
            }
            if (window.ColorEngine) {
                window.ColorEngine.applySettings({
                    baseColors: colors.slice(0, 4).map((rgb) => rgb.slice()),
                    groupCount: 4,
                    durationMs: window.getColorTransitionDurationMs ? window.getColorTransitionDurationMs() : 3000
                }, 'theme');
                ensureThemeColorEngineOverride();
                if (typeof window.ColorEngine.save === 'function') {
                    window.ColorEngine.save();
                }
            }
        }
        if (typeof window.startCasePointColorTransition === 'function') {
            window.startCasePointColorTransition();
        }
        return { step, mode, colors };
    }

    function paletteGradient(colors) {
        const stops = colors.map((rgb, index) => {
            const start = (index / colors.length) * 100;
            const end = ((index + 1) / colors.length) * 100;
            return `rgb(${rgb.join(',')}) ${start}%, rgb(${rgb.join(',')}) ${end}%`;
        });
        return `linear-gradient(90deg, ${stops.join(', ')})`;
    }

    function paletteBlendGradient(colors, mode) {
        const gradientColors = colors.map((rgb) => `rgb(${rgb.join(',')})`).join(', ');
        if (mode === 'areaTB') return `linear-gradient(180deg, ${gradientColors})`;
        if (mode === 'diagTLBR') return `linear-gradient(135deg, ${gradientColors})`;
        if (mode === 'center') return `radial-gradient(circle, ${gradientColors})`;
        return `linear-gradient(90deg, ${gradientColors})`;
    }

    function saveThemeCardState() {
        localStorage.setItem(themeStorageKey, JSON.stringify({
            theme: selectedThemeKey,
            step: selectedThemeStep,
            themes: themeState
        }));
    }

    function loadThemeCardState() {
        const savedAssignMode = localStorage.getItem(assignModeStorageKey);
        if (savedAssignMode) {
            try {
                const parsedAssignMode = JSON.parse(savedAssignMode);
                if (assignModeDefs.some((def) => def.key === parsedAssignMode)) {
                    activeAssignMode = parsedAssignMode;
                }
            } catch (error) {
                console.warn('Failed to load theme assign mode:', error);
            }
        }
        colorBlendEnabled = localStorage.getItem(blendEnabledStorageKey) === '1';
        const saved = localStorage.getItem(themeStorageKey);
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            if (typeof data.theme === 'string' && getThemeDef(data.theme)) {
                selectedThemeKey = data.theme;
            }
            if (Number.isFinite(data.step)) {
                selectedThemeStep = clampThemeStep(data.step);
            }
            if (data.themes && typeof data.themes === 'object') {
                Object.keys(data.themes).forEach((themeKey) => {
                    const theme = getThemeDef(themeKey);
                    if (!theme || theme.key !== themeKey) return;
                    const savedState = data.themes[themeKey];
                    if (!savedState || typeof savedState !== 'object') return;
                    const step = clampThemeStep(Number.isFinite(savedState.step) ? savedState.step : 0);
                    const variantIndex = Math.max(0, parseInt(savedState.variantIndex, 10) || 0);
                    const colors = !THEME_PALETTE_BANK[themeKey] && Array.isArray(savedState.colors) && savedState.colors.length
                        ? clonePalette(savedState.colors)
                        : getThemePalette(themeKey, step, variantIndex);
                    themeState[themeKey] = { step, variantIndex, colors };
                });
            }
        } catch (error) {
            console.warn('Failed to load theme card state:', error);
        }
        ensureThemeState(selectedThemeKey).step = selectedThemeStep;
        regenerateThemeState(selectedThemeKey, false);
    }

    function syncThemeCards() {
        document.querySelectorAll('.color-theme-card').forEach((card) => {
            const active = card.dataset.theme === selectedThemeKey;
            const state = ensureThemeState(card.dataset.theme);
            card.classList.toggle('is-active', active);
            card.setAttribute('aria-pressed', String(active));
            card.style.webkitAppearance = 'none';
            card.style.appearance = 'none';
            card.style.borderRadius = '9px';
            const label = `${getThemeDef(card.dataset.theme).name} ${themeStepLabel(state.step)}`;
            card.setAttribute('aria-label', label);
            card.setAttribute('title', label);
            const preview = card.querySelector('.color-theme-preview');
            if (preview) {
                preview.style.background = active && colorBlendEnabled
                    ? paletteBlendGradient(state.colors, activeAssignMode)
                    : active && activeAssignMode === 'center'
                    ? `radial-gradient(circle, ${state.colors.map((rgb, index) => `rgb(${rgb.join(',')}) ${(index / state.colors.length) * 100}% ${((index + 1) / state.colors.length) * 100}%`).join(', ')})`
                    : paletteGradient(state.colors);
            }
        });
        applyReadableTextColors();
    }

    function applyThemeSelection(themeKey, advanceStep = false, recolorOnly = false) {
        const theme = getThemeDef(themeKey);
        const changedTheme = selectedThemeKey !== theme.key;
        selectedThemeKey = theme.key;
        const state = ensureThemeState(theme.key);
        if (recolorOnly) {
            regenerateThemeState(theme.key, true);
        } else if (!changedTheme && advanceStep) {
            state.step = (state.step + 1) % themeCycle.length;
            regenerateThemeState(theme.key, true);
        } else if (!Array.isArray(state.colors) || !state.colors.length) {
            regenerateThemeState(theme.key, false);
        }
        selectedThemeStep = state.step;

        applyThemeToColorSystem(selectedThemeKey);
        startPalettePointColorTransition();

        saveThemeCardState();
        Color.saveSettings();
        Color.updateColorModeUI();
        Color.updatePaletteSystemUI();
        Color.updateColorEngineUI();
        Color.updateColorPreview();
        Color.updateAllSliders();
        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }
        syncThemeCards();
    }

    function palettePreviewSpec() {
        const groupCount = window.ColorEngine?.groupCount || 2;
        if (paletteSystem === 'legacy') {
            return {
                mode: 'legacy',
                tab: 'linear-gradient(90deg, #7d4a2d 0%, #d7a44a 16%, #8c6cff 32%, #4d90ff 48%, #ef7da8 64%, #6dbb7f 78%, #f2d46b 100%)',
                preview:
                    'repeating-linear-gradient(90deg, #7c5340 0 11%, #d7b25f 11% 18%, #6d5bd8 18% 31%, #2c8de0 31% 39%, #ef6f92 39% 52%, #6eb07b 52% 61%, #f1c95b 61% 71%, #8a5d33 71% 100%)',
                previewSize: '240% 100%',
                previewPosition: '0% 0%'
            };
        }
        if (groupCount === 4) {
            return {
                mode: 'engine-4',
                tab: 'linear-gradient(90deg, #ff6b6b 0%, #ffb84d 18%, #ffe66d 34%, #4ecdc4 50%, #1a9fff 67%, #8d5cff 84%, #ff6bcb 100%)',
                preview:
                    'linear-gradient(90deg, #ff6b6b 0%, #ffb84d 15%, #ffe66d 31%, #4ecdc4 48%, #1a9fff 66%, #8d5cff 82%, #ff6bcb 100%)',
                previewSize: '210% 100%',
                previewPosition: '0% 0%'
            };
        }
        return {
            mode: 'engine-2',
            tab: 'linear-gradient(90deg, #5a8cff 0%, #67d6c5 48%, #b2f06d 100%)',
            preview: 'linear-gradient(90deg, #537cff 0%, #64cfd4 47%, #7de08b 100%)',
            previewSize: '180% 100%',
            previewPosition: '0% 0%'
        };
    }

    function applyPalettePreviewStyles() {
        const spec = palettePreviewSpec();
        const tabs = document.querySelectorAll('.palette-system-tab');
        tabs.forEach((tab) => {
            const bar = tab.querySelector('.palette-system-tab-bar');
            if (!bar) return;
            const isActive = tab.classList.contains('is-active');
            const group = tab.dataset.group;
            const system = tab.dataset.system;
            let barBackground = spec.tab;
            if (system === 'legacy') {
                barBackground = 'repeating-linear-gradient(90deg, #5d4336 0 8%, #b58a5b 8% 13%, #8b6ad9 13% 20%, #4f8ed0 20% 28%, #e36b8f 28% 37%, #6eb07b 37% 45%, #d7b65d 45% 54%, #5d4336 54% 100%)';
            } else if (group === '4') {
                barBackground = 'linear-gradient(90deg, #ff5c6f 0%, #ff9f43 18%, #ffd84d 34%, #5dd39e 50%, #28a7ff 68%, #8a5cff 84%, #ff5fb8 100%)';
            } else {
                barBackground = 'linear-gradient(90deg, #4f7eff 0%, #62d8cb 50%, #8be26f 100%)';
            }
            bar.style.background = barBackground;
            bar.style.filter = isActive ? 'saturate(1.15) brightness(1.05)' : 'saturate(0.9) brightness(0.92)';
        });
        const preview = getActivePalettePanel()?.querySelector('#ui-color-preview');
        if (preview) {
            preview.style.background = spec.preview;
            preview.style.backgroundSize = spec.previewSize;
            preview.style.backgroundPosition = spec.previewPosition;
            preview.style.boxShadow = paletteSystem === 'legacy'
                ? 'inset 0 0 0 1px rgba(98, 61, 36, 0.18), inset 0 0 18px rgba(56, 36, 24, 0.14)'
                : 'inset 0 0 0 1px rgba(36, 84, 156, 0.14), inset 0 0 16px rgba(255, 255, 255, 0.22)';
        }
    }
    
    
    
Color.createColorGroup = function(targetId = 'color-container') {
    uiuxPublicDebugLog('Creating color group');
    const colorContainer = document.getElementById(targetId);
    if (!colorContainer) {
        console.error('Color container not found');
        return;
    }
    if (targetId === 'color-container' && document.body?.getAttribute('data-ui-variant') === 'variant-1-glass') {
        colorContainer.innerHTML = '';
        return;
    }

    colorContainer.innerHTML = '';

    const colorHeader = document.createElement('div');
    colorHeader.className = 'ui-header';
    colorHeader.textContent = '3.配色';
    colorContainer.appendChild(colorHeader);

    const colorContent = document.createElement('div');
    colorContent.className = 'ui-content palette-panel';
    colorContainer.appendChild(colorContent);

    if (window.ColorEngine && typeof window.ColorEngine.init === 'function') {
        window.ColorEngine.init();
    }

    colorContent.innerHTML = `
        <section class="palette-section color-theme-section">
            <div class="color-theme-actions" role="group" aria-label="点への色のかけ方">
                ${assignModeDefs.map((mode) => `
                    <button type="button" class="color-assign-btn${mode.key === activeAssignMode ? ' is-active' : ''}" data-assign-mode="${mode.key}" aria-pressed="${mode.key === activeAssignMode}">${mode.label}</button>
                `).join('')}
            </div>
            <div class="color-transition-actions-row">
                <div class="color-transition-row" role="group" aria-label="遷移秒">
                    <label class="color-transition-label" for="color-transition-seconds">遷移秒</label>
                    <span class="color-transition-spin-wrap">
                        <input
                            type="number"
                            id="color-transition-seconds"
                            class="color-transition-input"
                            min="0"
                            max="9.9"
                            step="0.1"
                            inputmode="decimal"
                            aria-label="遷移秒"
                        >
                        <span class="color-transition-spinner" aria-hidden="false">
                            <span class="color-transition-spin-hit color-transition-spin-hit-up" data-color-transition-step="up" role="button" tabindex="0" aria-label="遷移秒を上げる"></span>
                            <span class="color-transition-spin-hit color-transition-spin-hit-down" data-color-transition-step="down" role="button" tabindex="0" aria-label="遷移秒を下げる"></span>
                            <span class="color-transition-triangle color-transition-triangle-up" aria-hidden="true"></span>
                            <span class="color-transition-triangle color-transition-triangle-down" aria-hidden="true"></span>
                        </span>
                    </span>
                </div>
                <div class="color-utility-actions" role="group" aria-label="配色操作">
                    <button type="button" class="color-blend-btn${colorBlendEnabled ? ' is-active' : ''}" data-theme-blend aria-pressed="${colorBlendEnabled}">馴染</button>
                    <button type="button" class="color-theme-recolor-btn" data-theme-recolor>再配色</button>
                </div>
            </div>
            <div class="color-theme-grid" role="listbox" aria-label="配色テーマ">
                ${themeDefs.map((theme) => {
                    const active = theme.key === selectedThemeKey;
                    const state = ensureThemeState(theme.key);
                    const colors = state.colors;
                    const preview = paletteGradient(colors);
                    const label = `${theme.name} ${themeStepLabel(state.step)}`;
                    return `
                        <button type="button" class="color-theme-card${active ? ' is-active' : ''}" data-theme="${theme.key}" aria-pressed="${active}" aria-label="${label}" title="${label}">
                            <span class="color-theme-head">
                                <span class="color-theme-name">${theme.name}</span>
                            </span>
                            <span class="color-theme-preview" style="background: ${preview};"></span>
                        </button>
                    `;
                }).join('')}
            </div>
        </section>
        <div class="color-internal-controls" hidden aria-hidden="true">
            <section class="palette-section palette-details-section">
                <button type="button" class="palette-details-toggle" data-palette-details-toggle aria-expanded="false">詳細設定 ▼</button>
                <div class="palette-details" data-palette-details hidden>
                    <div class="palette-detail-group palette-legacy-detail">
                        <section class="palette-section">
                            <div class="palette-section-title">配色タイプ</div>
                            <div class="palette-system-tabs" role="tablist" aria-label="palette system">
                                <button type="button" class="palette-system-tab" data-system="engine" data-group="2">
                                    <span class="palette-system-tab-name">engine 2色</span>
                                    <span class="palette-system-tab-bar" data-bar="engine-2"></span>
                                    <span class="palette-system-tab-desc">軽量</span>
                                </button>
                                <button type="button" class="palette-system-tab" data-system="engine" data-group="4">
                                    <span class="palette-system-tab-name">engine 4色</span>
                                    <span class="palette-system-tab-bar" data-bar="engine-4"></span>
                                    <span class="palette-system-tab-desc">標準</span>
                                </button>
                                <button type="button" class="palette-system-tab" data-system="legacy" data-group="">
                                    <span class="palette-system-tab-name">legacy</span>
                                    <span class="palette-system-tab-bar" data-bar="legacy"></span>
                                    <span class="palette-system-tab-desc">旧挙動</span>
                                </button>
                            </div>
                        </section>
                        <section class="palette-section">
                            <div class="palette-section-title">色の流れ</div>
                            <div class="palette-preview-strip">
                                <div id="ui-color-preview" class="palette-preview" aria-label="current palette preview"></div>
                            </div>
                        </section>
                        <section class="palette-section">
                            <div class="palette-section-title">調整</div>
                            <div class="palette-controls" data-palette-essentials>
                                <div class="palette-row palette-system-controls">
                                    <span class="row-label">モード</span>
                                    <div class="row-control">
                                        <select id="color-mode-select" aria-label="color mode">
                                            <option value="off">off</option>
                                            <option value="random">random</option>
                                            <option value="hue-range">hue</option>
                                        </select>
                                    </div>
                                    <span class="row-value" id="color-mode-value"></span>
                                </div>
                                <div class="palette-row color-engine-controls">
                                    <span class="row-label">割当</span>
                                    <div class="row-control">
                                        <select id="color-engine-assign-mode" aria-label="engine assign mode">
                                            <option value="auto">auto</option>
                                            <option value="alternate">alt</option>
                                            <option value="block">block</option>
                                            <option value="areaLR">LR</option>
                                            <option value="areaTB">TB</option>
                                            <option value="diagTLBR">diag</option>
                                        </select>
                                    </div>
                                    <span class="row-value" id="color-engine-assign-mode-value"></span>
                                </div>
                                <div class="palette-row color-engine-controls">
                                    <span class="row-label">混合</span>
                                    <div class="row-control palette-inline-controls">
                                        <input type="number" id="color-engine-mix-min" min="0" max="1" step="0.01" aria-label="engine mix min">
                                        <input type="number" id="color-engine-mix-max" min="0" max="1" step="0.01" aria-label="engine mix max">
                                    </div>
                                    <span class="row-value" id="color-engine-mix-value"></span>
                                </div>
                                <div class="palette-row color-engine-controls">
                                    <span class="row-label">再生成</span>
                                    <div class="row-control">
                                        <button id="color-engine-regenerate" class="palette-mini-btn" type="button">再生成</button>
                                    </div>
                                    <span class="row-value"></span>
                                </div>
                            </div>
                        </section>
                        <div class="palette-detail-group hue-range-controls" id="hue-range-controls">
                            <div class="palette-row">
                                <span class="row-label">色相</span>
                                <div class="row-control palette-inline-controls">
                                    <input type="number" id="hue-count" min="1" max="36" aria-label="hue count">
                                    <input type="number" id="mix-min" min="0" max="1" step="0.01" aria-label="hue mix min">
                                    <input type="number" id="mix-max" min="0" max="1" step="0.01" aria-label="hue mix max">
                                    <select id="hue-range-assign-mode" aria-label="hue assign mode">
                                        <option value="alternate">alt</option>
                                        <option value="block">block</option>
                                    </select>
                                </div>
                                <span class="row-value" id="hue-range-assign-mode-value"></span>
                            </div>
                        </div>
                        <div class="palette-detail-group random-color-controls">
                            <div class="palette-row">
                                <span class="row-label">乱択</span>
                                <div class="row-control palette-inline-controls">
                                    <label class="palette-toggle">
                                        <input type="checkbox" id="random-color-checkbox">
                                        <span>on</span>
                                    </label>
                                    <input type="number" id="random-color-count" min="1" max="100" aria-label="random color count">
                                </div>
                                <span class="row-value" id="random-color-count-value"></span>
                            </div>
                        </div>
                        <div class="palette-detail-group random-assign-controls">
                            <div class="palette-row">
                                <span class="row-label">割当</span>
                                <div class="row-control">
                                    <select id="random-color-assign-mode" aria-label="random assign mode">
                                        <option value="alternate">alt</option>
                                        <option value="block-x">x-block</option>
                                    </select>
                                </div>
                                <span class="row-value" id="random-color-assign-mode-value"></span>
                            </div>
                        </div>
                        <div class="palette-detail-group palette-rgb-detail">
                            <div class="palette-row color-engine-controls">
                                <span class="row-label">RGB微調整</span>
                                <div class="row-control palette-rgb-frame" id="color-frame"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    const paletteDetails = colorContent.querySelector('[data-palette-details]');
    const paletteDetailsToggle = colorContent.querySelector('[data-palette-details-toggle]');
    paletteDetailsToggle?.addEventListener('click', () => {
        const open = Boolean(paletteDetails?.hidden);
        if (paletteDetails) paletteDetails.hidden = !open;
        paletteDetailsToggle.setAttribute('aria-expanded', String(open));
        paletteDetailsToggle.textContent = open ? '詳細設定 ▲' : '詳細設定 ▼';
    });

    const paletteSystemTabs = Array.from(colorContent.querySelectorAll('.palette-system-tab'));
    const engineAssignSelect = colorContent.querySelector('#color-engine-assign-mode');
    const engineMixMinInput = colorContent.querySelector('#color-engine-mix-min');
    const engineMixMaxInput = colorContent.querySelector('#color-engine-mix-max');
    const engineRegenerateBtn = colorContent.querySelector('#color-engine-regenerate');
    const colorModeSelect = colorContent.querySelector('#color-mode-select');
    const hueCountInput = colorContent.querySelector('#hue-count');
    const mixMinInput = colorContent.querySelector('#mix-min');
    const mixMaxInput = colorContent.querySelector('#mix-max');
    const hueRangeAssignSelect = colorContent.querySelector('#hue-range-assign-mode');
    const randomColorCheckbox = colorContent.querySelector('#random-color-checkbox');
    const randomColorCountInput = colorContent.querySelector('#random-color-count');
    const randomAssignSelect = colorContent.querySelector('#random-color-assign-mode');
    const colorFrame = colorContent.querySelector('#color-frame');

    colorContent.addEventListener('click', (event) => {
        const assignButton = event.target.closest('[data-assign-mode]');
        if (assignButton && colorContent.contains(assignButton)) {
            applyAssignMode(assignButton.dataset.assignMode);
            syncThemeCards();
            return;
        }
        const blendButton = event.target.closest('[data-theme-blend]');
        if (blendButton && colorContent.contains(blendButton)) {
            applyBlendMode(!colorBlendEnabled);
            return;
        }
        const recolorButton = event.target.closest('[data-theme-recolor]');
        if (recolorButton && colorContent.contains(recolorButton)) {
            applyThemeSelection(selectedThemeKey || themeDefs[0].key, false, true);
            return;
        }
        const card = event.target.closest('.color-theme-card');
        if (!card || !colorContent.contains(card)) return;
        const advance = card.dataset.theme === selectedThemeKey;
        applyThemeSelection(card.dataset.theme, advance);
    });

    const colorParams = ['color-r', 'color-g', 'color-b'];
    const colorLabels = ['色(R)', '色(G)', '色(B)'];
    colorParams.forEach((param, index) => {
        const sliderGroup = document.createElement('div');
        sliderGroup.id = `${param}-group`;
        sliderGroup.className = 'slider-group palette-rgb-row';

        const label = document.createElement('label');
        label.className = 'slider-label';
        label.textContent = colorLabels[index];
        label.setAttribute('for', `${param}-slider`);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `${param}-slider`;
        slider.className = 'slider';
        slider.min = 0;
        slider.max = 255;
        slider.step = 1;

        const value = document.createElement('div');
        value.id = `${param}-value`;
        value.className = 'slider-value';

        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.type = 'button';
        resetBtn.textContent = '初期値';
        resetBtn.addEventListener('click', () => Color.resetToDefault(param));

        sliderGroup.innerHTML = '';
        sliderGroup.appendChild(label);
        sliderGroup.appendChild(slider);
        sliderGroup.appendChild(value);
        sliderGroup.appendChild(resetBtn);
        colorFrame.appendChild(sliderGroup);

        slider.addEventListener('input', (event) => {
            Color.updateParameter(param, event.target.value);
        });
    });

    const syncTabButtons = () => {
        paletteSystemTabs.forEach((button) => {
            const active = paletteSystem === button.dataset.system
                && (button.dataset.group ? String(window.ColorEngine?.groupCount || 2) === button.dataset.group : true);
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    };

    const selectPaletteSystem = (system, group) => {
        paletteSystem = system === 'legacy' ? 'legacy' : 'engine';
        Color.saveSettings();
        if (window.ColorEngine && typeof window.ColorEngine.applySettings === 'function' && group) {
            window.ColorEngine.applySettings({ groupCount: group === '4' ? 4 : 2 }, 'groupCount');
            if (typeof window.ColorEngine.save === 'function') window.ColorEngine.save();
            Color.updateColorEngineUI();
        }
        startPalettePointColorTransition();
        Color.updatePaletteSystemUI();
        Color.updateColorPreview();
        Color.updatePaletteChips();
        syncTabButtons();
    };

    paletteSystemTabs.forEach((button) => {
        button.addEventListener('click', () => selectPaletteSystem(button.dataset.system, button.dataset.group));
    });

    randomColorCheckbox.checked = useRandomColors;
    randomColorCheckbox.addEventListener('change', Color.handleRandomColorToggle);
    randomColorCountInput.addEventListener('change', Color.handleRandomColorCountChange);
    randomAssignSelect.addEventListener('change', Color.handleRandomColorAssignModeChange);
    const transitionSecondsInput = document.getElementById('color-transition-seconds');
    if (transitionSecondsInput) {
        transitionSecondsInput.addEventListener('change', handleTransitionSecondsChange);
        transitionSecondsInput.value = String(getTransitionSecondsValue());
    }
    colorContent.querySelectorAll('[data-color-transition-step]').forEach((hit) => {
        const runTransitionStep = () => {
            if (!transitionSecondsInput) return;
            const direction = hit.dataset.colorTransitionStep === 'up' ? 1 : -1;
            const current = Number(transitionSecondsInput.value);
            const base = Number.isFinite(current) ? current : getTransitionSecondsValue();
            const next = Math.max(0, Math.min(9.9, Math.round((base + direction * 0.1) * 10) / 10));
            transitionSecondsInput.value = String(next);
            handleTransitionSecondsChange({ target: transitionSecondsInput });
        };
        hit.addEventListener('click', runTransitionStep);
        hit.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            runTransitionStep();
        });
    });
    engineAssignSelect.addEventListener('change', Color.handleColorEngineAssignModeChange);
    engineMixMinInput.addEventListener('change', Color.handleColorEngineMixMinChange);
    engineMixMaxInput.addEventListener('change', Color.handleColorEngineMixMaxChange);
    engineRegenerateBtn.addEventListener('click', Color.handleColorEngineRegenerate);
    colorModeSelect.addEventListener('change', Color.handleColorModeChange);
    hueCountInput.addEventListener('change', Color.handleHueCountChange);
    mixMinInput.addEventListener('change', Color.handleMixMinChange);
    mixMaxInput.addEventListener('change', Color.handleMixMaxChange);
    hueRangeAssignSelect.addEventListener('change', Color.handleHueRangeAssignModeChange);

    if (window.UIHeader && typeof window.UIHeader.toggleContainer === 'function') {
        colorHeader.addEventListener('click', () => {
            window.UIHeader.toggleContainer(colorContainer);
        });
    }

    loadThemeCardState();
    applyAssignMode(activeAssignMode);
    applyBlendMode(colorBlendEnabled);
    syncThemeCards();
    applyReadableTextColors(colorContent);
    installReadableTextColorObserver();
    if (window.ColorEngine && typeof window.ColorEngine.init === 'function') {
        window.ColorEngine.init();
    }
    Color.updateColorEngineUI();
    uiuxPublicDebugLog('Color group created');
    Color.updateAllSliders();
    Color.loadSettings();
};

Color.handleRandomColorToggle = function(event) {
    useRandomColors = event.target.checked;
    colorMode = useRandomColors ? 'random' : 'off';
    Color.saveSettings();
    if (window.currentCase) {
        window.currentCase.config.useRandomColors = useRandomColors;
        if (!useRandomColors) {
            // ランダム色がオフになった時、現在のケースの色を使用
            Color.updateAllSliders();
        } else {
            // ランダム色がオンになった時、新しいランダム色を生成
            Color.generateRandomColors();
            Color.updateColorPreview();
        }
    }
    Color.updateColorModeUI();
    if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
        window.Table.updateCaseComparisonTable();
    }
    startPalettePointColorTransition();
};
    
    Color.handleRandomColorCountChange = function(event) {
        randomColorCount = parseInt(event.target.value, 10);
        Color.saveSettings();
        Color.generateRandomColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
    };

    Color.handleRandomColorAssignModeChange = function(event) {
        randomColorAssignMode = event.target.value === 'block-x' ? 'block-x' : 'alternate';
        Color.saveSettings();
        Color.generateRandomColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
        if (window.vectors) {
            window.vectors.forEach(v => {
                v.randomColor = null;
            });
        }
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }
    };

    Color.handlePaletteSystemChange = function(event) {
        paletteSystem = event.target.value === 'legacy' ? 'legacy' : 'engine';
        Color.saveSettings();
        Color.updatePaletteSystemUI();
        startPalettePointColorTransition();
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
    };

    Color.handleColorEngineGroupCountChange = function(event) {
        if (!window.ColorEngine) return;
        const value = parseInt(event.target.value, 10);
        const groupCount = value === 4 ? 4 : 2;
        window.ColorEngine.applySettings({ groupCount }, 'groupCount');
        window.ColorEngine.save();
        startPalettePointColorTransition();
        Color.finishColorEngineChange();
    };

    Color.handleColorEngineAssignModeChange = function(event) {
        if (!window.ColorEngine) return;
        const assignModeGlobal = event?.target?.value || event?.target?.dataset?.value || event?.currentTarget?.dataset?.value || 'auto';
        window.ColorEngine.applySettings({ assignModeGlobal }, 'assignMode');
        window.ColorEngine.save();
        startPalettePointColorTransition();
        Color.finishColorEngineChange();
    };

    Color.handleColorEngineMixMinChange = function(event) {
        if (!window.ColorEngine) return;
        let value = parseFloat(event.target.value);
        if (isNaN(value)) value = 0;
        value = Color.clampNumber(value, 0, 1);
        let mixMax = window.ColorEngine.mixMax;
        if (value > mixMax) {
            mixMax = value;
            const maxInput = document.getElementById('color-engine-mix-max');
            if (maxInput) maxInput.value = mixMax;
        }
        event.target.value = value;
        window.ColorEngine.applySettings({ mixMin: value, mixMax }, 'mix');
        window.ColorEngine.save();
        startPalettePointColorTransition();
        Color.finishColorEngineChange();
    };

    Color.handleColorEngineMixMaxChange = function(event) {
        if (!window.ColorEngine) return;
        let value = parseFloat(event.target.value);
        if (isNaN(value)) value = 1;
        value = Color.clampNumber(value, 0, 1);
        let mixMin = window.ColorEngine.mixMin;
        if (value < mixMin) {
            mixMin = value;
            const minInput = document.getElementById('color-engine-mix-min');
            if (minInput) minInput.value = mixMin;
        }
        event.target.value = value;
        window.ColorEngine.applySettings({ mixMin, mixMax: value }, 'mix');
        window.ColorEngine.save();
        startPalettePointColorTransition();
        Color.finishColorEngineChange();
    };

    Color.handleColorEngineRegenerate = function() {
        if (!window.ColorEngine) return;
        window.ColorEngine.applySettings({}, 'regenerate');
        window.ColorEngine.save();
        startPalettePointColorTransition();
        Color.finishColorEngineChange();
    };

    Color.handleColorModeChange = function(event) {
        colorMode = event?.target?.value || event?.target?.dataset?.value || event?.currentTarget?.dataset?.value || event;
        useRandomColors = colorMode === 'random';
        Color.saveSettings();
        if (window.currentCase) {
            window.currentCase.config.useRandomColors = useRandomColors;
        }
        if (colorMode === 'random') {
            Color.generateRandomColors();
            startPalettePointColorTransition();
        }
        if (colorMode === 'hue-range') {
            Color.generateHueRangeBaseColors();
            Color.generateHueRangeColors();
            startPalettePointColorTransition();
        }
        Color.updateColorModeUI();
        Color.updateColorPreview();
        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }
    };

    Color.handleHueCountChange = function(event) {
        hueCount = Color.clampNumber(parseInt(event.target.value, 10), 1, 36);
        event.target.value = hueCount;
        Color.saveSettings();
        Color.generateHueRangeBaseColors();
        Color.generateHueRangeColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
    };

    Color.handleMixMinChange = function(event) {
        mixMin = Color.clampNumber(parseFloat(event.target.value), 0, 1);
        if (mixMin > mixMax) {
            mixMax = mixMin;
            const maxInput = document.getElementById('mix-max');
            if (maxInput) maxInput.value = mixMax;
        }
        event.target.value = mixMin;
        Color.saveSettings();
        Color.generateHueRangeColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
    };

    Color.handleMixMaxChange = function(event) {
        mixMax = Color.clampNumber(parseFloat(event.target.value), 0, 1);
        if (mixMax < mixMin) {
            mixMin = mixMax;
            const minInput = document.getElementById('mix-min');
            if (minInput) minInput.value = mixMin;
        }
        event.target.value = mixMax;
        Color.saveSettings();
        Color.generateHueRangeColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
    };

    Color.handleHueRangeAssignModeChange = function(event) {
        hueRangeAssignMode = event.target.value === 'block' ? 'block' : 'alternate';
        Color.saveSettings();
        Color.generateHueRangeBaseColors();
        Color.generateHueRangeColors();
        Color.updateColorPreview();
        startPalettePointColorTransition();
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
    };
    
    Color.generateRandomColors = function() {
        randomColors = [];
        for (let i = 0; i < randomColorCount; i++) {
            randomColors.push(Color.getRandomColor());
        }
    };

    Color.generateHueRangeBaseColors = function() {
        const safeHueCount = Color.clampNumber(hueCount, 1, 36);
        hueRangeBaseColors = new Array(safeHueCount).fill(0).map(() => Color.randomVividRgb());
    };

    Color.generateHueRangeColors = function() {
        hueRangeColors = [];
        const safeHueCount = Color.clampNumber(hueCount, 1, 36);
        if (hueRangeBaseColors.length !== safeHueCount) {
            Color.generateHueRangeBaseColors();
        }
        for (let i = 0; i < safeHueCount; i++) {
            const vivid = hueRangeBaseColors[i];
            const rgb = Color.mixRgb([225, 225, 225], vivid, mixMax);
            hueRangeColors.push(rgb);
        }
    };
    
    Color.getRandomColors = function() {
        return randomColors;
    };

    Color.getRandomColorAssignMode = function() {
        return randomColorAssignMode;
    };

    Color.saveSettings = function() {
        localStorage.setItem('useRandomColors', JSON.stringify(useRandomColors));
        localStorage.setItem('randomColorCount', JSON.stringify(randomColorCount));
        localStorage.setItem('randomColorAssignMode', JSON.stringify(randomColorAssignMode));
        localStorage.setItem('colorMode', JSON.stringify(colorMode));
        localStorage.setItem('hueCount', JSON.stringify(hueCount));
        localStorage.setItem('mixMin', JSON.stringify(mixMin));
        localStorage.setItem('mixMax', JSON.stringify(mixMax));
        localStorage.setItem('hueRangeAssignMode', JSON.stringify(hueRangeAssignMode));
        localStorage.setItem('saturationMin', JSON.stringify(saturationMin));
        localStorage.setItem('saturationMax', JSON.stringify(saturationMax));
        localStorage.setItem('paletteSystem', JSON.stringify(paletteSystem));
        const transitionSecondsInput = document.getElementById('color-transition-seconds');
        if (transitionSecondsInput) {
            saveTransitionSecondsValue(transitionSecondsInput.value);
        }
    };
    

    Color.loadSettings = function() {
        const savedUseRandomColors = localStorage.getItem('useRandomColors');
        const savedRandomColorCount = localStorage.getItem('randomColorCount');
        const savedRandomColorAssignMode = localStorage.getItem('randomColorAssignMode');
        const savedColorMode = localStorage.getItem('colorMode');
        const savedHueCount = localStorage.getItem('hueCount');
        const savedMixMin = localStorage.getItem('mixMin');
        const savedMixMax = localStorage.getItem('mixMax');
        const savedHueRangeAssignMode = localStorage.getItem('hueRangeAssignMode');
        const savedPaletteSystem = localStorage.getItem('paletteSystem');
        const savedSaturationMin = localStorage.getItem('saturationMin');
        const savedSaturationMax = localStorage.getItem('saturationMax');
        if (savedUseRandomColors !== null) {
            useRandomColors = JSON.parse(savedUseRandomColors);
        }
        if (savedRandomColorCount !== null) {
            randomColorCount = JSON.parse(savedRandomColorCount);
        }
        if (savedRandomColorAssignMode !== null) {
            randomColorAssignMode = JSON.parse(savedRandomColorAssignMode);
        }
        if (randomColorAssignMode === 'block') {
            randomColorAssignMode = 'block-x';
        } else if (randomColorAssignMode !== 'block-x') {
            randomColorAssignMode = 'alternate';
        }
        if (savedColorMode !== null) {
            colorMode = JSON.parse(savedColorMode);
        } else {
            colorMode = useRandomColors ? 'random' : 'off';
        }
        useRandomColors = colorMode === 'random';
        if (savedHueCount !== null) {
            hueCount = JSON.parse(savedHueCount);
        }
        if (savedMixMin !== null) {
            mixMin = JSON.parse(savedMixMin);
        }
        if (savedMixMax !== null) {
            mixMax = JSON.parse(savedMixMax);
        }
        if (savedHueRangeAssignMode !== null) {
            hueRangeAssignMode = JSON.parse(savedHueRangeAssignMode);
        }
        if (hueRangeAssignMode !== 'block') {
            hueRangeAssignMode = 'alternate';
        }
        if (savedPaletteSystem !== null) {
            paletteSystem = JSON.parse(savedPaletteSystem);
        }
        if (paletteSystem !== 'legacy') {
            paletteSystem = 'engine';
        }
        if (savedSaturationMin !== null) {
            saturationMin = JSON.parse(savedSaturationMin);
        }
        if (savedSaturationMax !== null) {
            saturationMax = JSON.parse(savedSaturationMax);
        }
        const checkbox = document.getElementById('random-color-checkbox');
        const countInput = document.getElementById('random-color-count');
        const assignSelect = document.getElementById('random-color-assign-mode');
        const modeSelect = document.getElementById('color-mode-select');
        const hueCountInput = document.getElementById('hue-count');
        const mixMinInput = document.getElementById('mix-min');
        const mixMaxInput = document.getElementById('mix-max');
        const hueRangeAssignSelect = document.getElementById('hue-range-assign-mode');
        const paletteSystemSelect = document.getElementById('palette-system-select');
        const transitionSecondsInput = document.getElementById('color-transition-seconds');
        if (checkbox) {
            checkbox.checked = useRandomColors;
        }
        if (countInput) {
            countInput.value = randomColorCount;
        }
        if (assignSelect) {
            assignSelect.value = randomColorAssignMode;
        }
        if (modeSelect) {
            modeSelect.value = colorMode;
        }
        if (hueCountInput) {
            hueCountInput.value = hueCount;
        }
        if (mixMinInput) {
            mixMinInput.value = mixMin;
        }
        if (mixMaxInput) {
            mixMaxInput.value = mixMax;
        }
        if (hueRangeAssignSelect) {
            hueRangeAssignSelect.value = hueRangeAssignMode;
        }
        if (paletteSystemSelect) {
            paletteSystemSelect.value = paletteSystem;
        }
        if (transitionSecondsInput) {
            transitionSecondsInput.value = String(getTransitionSecondsValue());
        }
        Color.generateRandomColors();
        Color.generateHueRangeBaseColors();
        Color.generateHueRangeColors();
        Color.updateColorEngineUI();
        Color.updateColorModeUI();
        Color.updatePaletteSystemUI();
        Color.updateColorPreview();
    };

    Color.updateColorEngineUI = function() {
        if (!window.ColorEngine) return;
        const engineGroupCountSelect = document.getElementById('color-engine-group-count');
        const engineAssignSelect = document.getElementById('color-engine-assign-mode');
        const engineMixMinInput = document.getElementById('color-engine-mix-min');
        const engineMixMaxInput = document.getElementById('color-engine-mix-max');
        if (engineGroupCountSelect) {
            engineGroupCountSelect.value = window.ColorEngine.groupCount;
        }
        if (engineAssignSelect) {
            engineAssignSelect.value = window.ColorEngine.assignModeGlobal || 'auto';
        }
        if (engineMixMinInput) {
            engineMixMinInput.value = window.ColorEngine.mixMin;
        }
        if (engineMixMaxInput) {
            engineMixMaxInput.value = window.ColorEngine.mixMax;
        }
        syncAssignModeButtons();
    };

    Color.finishColorEngineChange = function() {
        Color.updateColorEngineUI();
        if (window.isTransitioning) {
            window.isTransitioning = false;
            window.morph = 1;
        }
    };

Color.updatePaletteSystemUI = function() {
        const colorModeSelect = document.getElementById('color-mode-select');
        const paletteSystemSelect = document.getElementById('palette-system-select');
        const tabs = document.querySelectorAll('.palette-system-tab');
        const colorModeValue = document.getElementById('color-mode-value');
        const engineAssignValue = document.getElementById('color-engine-assign-mode-value');
        const hueAssignValue = document.getElementById('hue-range-assign-mode-value');
        const randomAssignValue = document.getElementById('random-color-assign-mode-value');
        if (paletteSystemSelect) paletteSystemSelect.value = paletteSystem;
        if (colorModeSelect) colorModeSelect.value = colorMode;
        if (colorModeValue) colorModeValue.textContent = colorMode;
        if (engineAssignValue) engineAssignValue.textContent = window.ColorEngine?.assignModeGlobal || 'auto';
        if (hueAssignValue) hueAssignValue.textContent = hueRangeAssignMode;
        if (randomAssignValue) randomAssignValue.textContent = randomColorAssignMode;
        tabs.forEach((tab) => {
            const active = paletteSystem === tab.dataset.system
                && (tab.dataset.group ? String(window.ColorEngine?.groupCount || 2) === tab.dataset.group : true);
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-pressed', String(active));
            tab.style.webkitAppearance = 'none';
            tab.style.appearance = 'none';
            tab.style.borderRadius = '999px';
        });
        applyPalettePreviewStyles();
        const engineControls = document.querySelector('.color-engine-controls');
        const hueControls = document.getElementById('hue-range-controls');
        const randomColorControls = document.querySelector('.random-color-controls');
        const randomAssignControls = document.querySelector('.random-assign-controls');
        if (engineControls) {
            engineControls.style.display = paletteSystem === 'legacy' ? 'none' : 'block';
        }
        if (randomColorControls) {
            randomColorControls.style.display = paletteSystem === 'legacy' && colorMode === 'random' ? 'block' : 'none';
        }
        if (randomAssignControls) {
            randomAssignControls.style.display = paletteSystem === 'legacy' && colorMode === 'random' ? 'block' : 'none';
        }
        if (hueControls) {
            hueControls.style.display = paletteSystem === 'legacy' && colorMode === 'hue-range' ? 'block' : 'none';
        }
    };
    


Color.updateParameter = function(param, value) {
    uiuxPublicDebugLog(`Updating parameter: ${param} = ${value}`);
    if (!window.currentCase) {
        console.error('Current case is undefined');
        return;
    }

    value = parseInt(value, 10);
    if (isNaN(value)) value = 0;
    
    const colorIndex = ['r', 'g', 'b'].indexOf(param.split('-')[1]);
    window.currentCase.config.color[colorIndex] = value;
    Color.updateSliderColor(param, value);
    Color.updateColorPreview();

    Color.updateSliderValue(param, value);
    if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
        window.Table.updateCaseComparisonTable();
    }
};

    Color.resetToDefault = function(param) {
        uiuxPublicDebugLog(`Resetting to default: ${param}`);
        if (!window.currentCase || !window.currentCase.initialConfig) {
            console.error('Current case or initial config is undefined');
            return;
        }

        const colorIndex = ['r', 'g', 'b'].indexOf(param.split('-')[1]);
        const value = window.currentCase.initialConfig.color[colorIndex];

        Color.updateParameter(param, value);
        Color.updateSliderValue(param, value);
    };

    Color.updateSliderColor = function(param, value) {
        uiuxPublicDebugLog(`Updating slider color: ${param} = ${value}`);
        const slider = document.getElementById(param + '-slider');
        if (!slider) {
            console.warn(`Slider element not found for ${param}`);
            return;
        }
        
        let gradient;
        
        if (param === 'color-r') {
            gradient = `linear-gradient(to right, rgb(0,0,0), rgb(${value},0,0))`;
        } else if (param === 'color-g') {
            gradient = `linear-gradient(to right, rgb(0,0,0), rgb(0,${value},0))`;
        } else if (param === 'color-b') {
            gradient = `linear-gradient(to right, rgb(0,0,0), rgb(0,0,${value}))`;
        }
        
        slider.style.background = gradient;
    };

function getActivePalettePanel() {
    if (document.body?.getAttribute('data-ui-variant') === 'variant-1-glass') {
        return document.getElementById('glass-cursor-panel-3');
    }
    return document.getElementById('color-container') || document.getElementById('glass-cursor-panel-3');
}

Color.updateColorPreview = function() {
    const colorPreview = getActivePalettePanel()?.querySelector('#ui-color-preview');
    if (colorPreview) {
        const spec = palettePreviewSpec();
        const toRgbStops = (colors) => colors.map((color) => `rgb(${color.join(',')})`).join(', ');
        if (colorMode === 'random' && randomColors.length >= 2) {
            const gradientColors = toRgbStops(randomColors.slice(0, Math.max(2, randomColors.length)));
            colorPreview.style.background = `linear-gradient(90deg, ${gradientColors})`;
            colorPreview.style.backgroundSize = spec.previewSize;
            colorPreview.style.backgroundPosition = spec.previewPosition;
        } else if (colorMode === 'hue-range' && hueRangeColors.length >= 2) {
            const gradientColors = toRgbStops(hueRangeColors.slice(0, Math.max(2, hueRangeColors.length)));
            colorPreview.style.background = `linear-gradient(90deg, ${gradientColors})`;
            colorPreview.style.backgroundSize = spec.previewSize;
            colorPreview.style.backgroundPosition = spec.previewPosition;
        } else if (window.currentCase && window.currentCase.config) {
            const [r, g, b] = window.currentCase.config.color;
            if (paletteSystem === 'legacy') {
                colorPreview.style.background = [
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 8px, rgba(255,255,255,0.16) 8px 14px)',
                    `linear-gradient(90deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.max(0, r - 35)}, ${Math.max(0, g - 15)}, ${Math.min(255, b + 20)}) 20%, rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 24)}, ${Math.max(0, b - 38)}) 34%, rgb(${Math.max(0, r - 28)}, ${Math.min(255, g + 38)}, ${Math.min(255, b + 12)}) 49%, rgb(${Math.min(255, r + 44)}, ${Math.max(0, g - 26)}, ${Math.max(0, b - 18)}) 68%, rgb(${r}, ${g}, ${b}) 100%)`
                ].join(', ');
                colorPreview.style.backgroundSize = '220% 100%, 180% 100%';
                colorPreview.style.backgroundPosition = '0% 0%, 0% 0%';
            } else if ((window.ColorEngine?.groupCount || 2) === 4) {
                colorPreview.style.background = [
                    `linear-gradient(90deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.min(255, r + 50)}, ${Math.max(0, g - 22)}, ${Math.max(0, b - 8)}) 16%, rgb(${Math.max(0, r - 18)}, ${Math.min(255, g + 38)}, ${Math.min(255, b + 14)}) 34%, rgb(${Math.max(0, r - 40)}, ${Math.min(255, g + 6)}, ${Math.min(255, b + 52)}) 54%, rgb(${Math.min(255, r + 34)}, ${Math.min(255, g + 54)}, ${Math.max(0, b - 20)}) 74%, rgb(${r}, ${g}, ${b}) 100%)`
                ].join(', ');
                colorPreview.style.backgroundSize = '220% 100%';
                colorPreview.style.backgroundPosition = '0% 0%';
            } else {
                colorPreview.style.background = `linear-gradient(90deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.min(255, r + 30)}, ${Math.max(0, g - 16)}, ${Math.max(0, b - 20)}) 52%, rgb(${Math.max(0, r - 18)}, ${Math.min(255, g + 34)}, ${Math.min(255, b + 18)}) 100%)`;
                colorPreview.style.backgroundSize = '180% 100%';
                colorPreview.style.backgroundPosition = '0% 0%';
            }
            colorPreview.textContent = '';
            colorPreview.style.color = '';
            colorPreview.style.textAlign = '';
            colorPreview.style.lineHeight = '';
        }
        Color.updatePaletteChips();
    } else if (document.body?.getAttribute('data-ui-variant') !== 'variant-1-glass') {
        console.error('Failed to update color preview');
    }
};

Color.updatePaletteChips = function() {
    const chipHost = getActivePalettePanel()?.querySelector('#ui-color-chips');
    if (!chipHost) return;
    const chips = [];
    const pushChip = (label, rgb) => chips.push({ label, rgb });
    const bgHex = (window.config && window.config.canvasBgColor) ? window.config.canvasBgColor : '#e1e1e1';
    const bgRgb = (typeof window.hexToRgb === 'function') ? window.hexToRgb(bgHex) : null;
    if (bgRgb) pushChip('背景', bgRgb);
    if (colorMode === 'random' && randomColors.length) {
        randomColors.slice(0, 12).forEach((rgb, index) => pushChip(String(index + 1), rgb));
    } else if (colorMode === 'hue-range' && hueRangeColors.length) {
        hueRangeColors.slice(0, 12).forEach((rgb, index) => pushChip(String(index + 1), rgb));
    } else if (window.currentCase && window.currentCase.config && Array.isArray(window.currentCase.config.color)) {
        pushChip('A', window.currentCase.config.color);
    }
    chipHost.innerHTML = chips.map(({ label, rgb }) => {
        if (!rgb) return '';
        const { r, g, b } = rgb;
        if (![r, g, b].every((value) => Number.isFinite(value))) return '';
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        const tone = lum < 140 ? 'is-dark' : 'is-light';
        return `<div class="palette-chip ${tone}" style="background: rgb(${r}, ${g}, ${b})"><span>${label}</span></div>`;
    }).join('');
};

 
    

Color.updateSliderValue = function(param, value) {
    uiuxPublicDebugLog(`Updating slider value: ${param} = ${value}`);
    const slider = document.getElementById(param + '-slider');
    const valueDisplay = document.getElementById(param + '-value');
    
    if (slider && valueDisplay) {
        slider.value = value;
        valueDisplay.textContent = value;
        if (window.currentCase && window.currentCase.initialConfig) {
            const colorIndex = ['r', 'g', 'b'].indexOf(param.split('-')[1]);
            const initialValue = window.currentCase.initialConfig.color[colorIndex];
            if (parseInt(value, 10) !== initialValue) {
                valueDisplay.classList.add('changed-value');
            } else {
                valueDisplay.classList.remove('changed-value');
            }
        }

        // パレットの色を更新
        Color.updateSliderColor(param, value);
    } else {
        console.error(`Failed to update slider value for ${param}`);
    }

    // カラープレビューを更新
    Color.updateColorPreview();
};




    Color.onCaseChange = function(event) {
        uiuxPublicDebugLog('Case changed, updating Color UI');
        if (event && event.detail && event.detail.currentCase) {
            window.currentCase = event.detail.currentCase;
        }
        Color.updateAllSliders();
    };

Color.updateAllSliders = function() {
    uiuxPublicDebugLog('Updating all sliders');
    if (!window.currentCase || !window.currentCase.config) {
        console.warn('Current case or its config is undefined. Using default values.');
        return;
    }

    uiuxPublicDebugLog('Current case config:', window.currentCase.config);
    uiuxPublicDebugLog('Current case initial config:', window.currentCase.initialConfig);

    ['color-r', 'color-g', 'color-b'].forEach((param, index) => {
        const currentValue = window.currentCase.config.color[index];
        Color.updateSliderValue(param, currentValue);
        Color.updateSliderColor(param, currentValue);
    });
    Color.updateColorPreview();
};


Color.applyCurrentColor = function() {
    if (window.currentCase && window.currentCase.config) {
        const [r, g, b] = window.currentCase.config.color;
        Color.updateParameter('color-r', r);
        Color.updateParameter('color-g', g);
        Color.updateParameter('color-b', b);
    }
};


Color.applyCurrentColor();
Color.updateColorPreview();


    Color.getRandomColor = function() {
        return [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ];
    };

    Color.isUsingRandomColors = function() {
        return useRandomColors;
    };

    Color.getColorMode = function() {
        return colorMode;
    };

    Color.getPaletteSystem = function() {
        return paletteSystem;
    };

    function cloneDisplayedColorSnapshotValue(value) {
        if (value === undefined) return undefined;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneDisplayedColorSnapshotValue);
        if (typeof value === 'object') {
            const copy = {};
            Object.keys(value).forEach(function(key) {
                copy[key] = cloneDisplayedColorSnapshotValue(value[key]);
            });
            return copy;
        }
        return value;
    }

    /**
     * Phase 4.3: resolvePanelAssignedPointColor() とテーマ上書き経路を踏まえ、
     * 現在実際に表示へ使われる配色状態を取得する。
     * 読取専用であり、UI・描画・localStorage は変更しない。
     */
    Color.captureDisplayedColorSnapshot = function() {
        const caseTransitionActive = window.isTransitioning === true;
        const enginePalette = window.ColorEngine
            && typeof window.ColorEngine.captureStablePaletteSnapshot === 'function'
            ? window.ColorEngine.captureStablePaletteSnapshot()
            : { ok: false, reason: 'stable-palette-api-unavailable' };

        if (caseTransitionActive) {
            return {
                ok: false,
                reason: 'case-or-color-transition-in-progress',
                message: '色またはcaseの遷移中は登録できません'
            };
        }

        let displaySource = 'case-base-color';
        if (paletteSystem === 'engine' && activeThemeRenderColors.length >= 2) {
            displaySource = 'theme-engine-override';
        } else if (paletteSystem === 'engine') {
            displaySource = 'color-engine';
        } else if (colorMode === 'random' && useRandomColors) {
            displaySource = 'random-colors';
        } else if (colorMode === 'hue-range' && activeThemeRenderColors.length >= 2) {
            displaySource = 'theme-hue-range-override';
        } else if (colorMode === 'hue-range') {
            displaySource = 'hue-range';
        }

        // 実表示がColorEngineそのものの場合だけ、内部palette遷移完了を登録条件にする。
        // テーマ色上書き等が実表示を支配している場合は、表示中の確定色を即時登録できる。
        if (displaySource === 'color-engine' && !enginePalette.ok) {
            return {
                ok: false,
                reason: enginePalette.reason || 'palette-transition-in-progress',
                message: enginePalette.message || '配色遷移中は登録できません'
            };
        }

        return {
            ok: true,
            schemaVersion: 1,
            displaySource: displaySource,
            paletteSystem: paletteSystem,
            colorMode: colorMode,
            theme: {
                selectedThemeKey: selectedThemeKey,
                selectedThemeStep: selectedThemeStep,
                activeThemeRenderStep: activeThemeRenderStep,
                activeThemeRenderColors: cloneDisplayedColorSnapshotValue(activeThemeRenderColors),
                activeAssignMode: activeAssignMode,
                colorBlendEnabled: colorBlendEnabled
            },
            random: {
                enabled: useRandomColors,
                colors: cloneDisplayedColorSnapshotValue(randomColors),
                assignMode: randomColorAssignMode
            },
            hueRange: {
                colors: cloneDisplayedColorSnapshotValue(hueRangeColors),
                baseColors: cloneDisplayedColorSnapshotValue(hueRangeBaseColors),
                assignMode: hueRangeAssignMode,
                hueCount: hueCount,
                mixMin: mixMin,
                mixMax: mixMax,
                saturationMin: saturationMin,
                saturationMax: saturationMax
            },
            engineStablePalette: cloneDisplayedColorSnapshotValue(enginePalette),
            caseBaseColor: window.currentCase && window.currentCase.config
                ? cloneDisplayedColorSnapshotValue(window.currentCase.config.color)
                : null,
            transitionSeconds: getTransitionSecondsValue()
        };
    };

    /**
     * DisplayedColorSnapshot の色配列を、既存のテーマ割当規則で点へ解決する。
     * Runtime preview / 後続slot適用が、UI_Color内部値を直接書き換えずに描画へ使う入口。
     */
    Color.resolveDisplayedColorSnapshotRgb = function(snapshot, index, totalPoints, x, y, canvasW, canvasH) {
        const validation = Color.validateDisplayedColorSnapshot(snapshot);
        if (!validation.valid) return null;

        const themeColors = snapshot.theme && Array.isArray(snapshot.theme.activeThemeRenderColors)
            ? snapshot.theme.activeThemeRenderColors
            : [];
        const themeMode = snapshot.theme && typeof snapshot.theme.activeAssignMode === 'string'
            ? snapshot.theme.activeAssignMode
            : 'alternate';

        if (themeColors.length > 0) {
            return pickThemeAreaColor(index, totalPoints, themeColors, themeMode, x, y, canvasW, canvasH);
        }

        const engine = snapshot.engineStablePalette;
        const engineColors = engine && engine.ok && engine.palette && Array.isArray(engine.palette.baseColors)
            ? engine.palette.baseColors
            : [];
        const engineMode = engine && engine.ok && engine.palette && typeof engine.palette.assignModeGlobal === 'string'
            ? engine.palette.assignModeGlobal
            : 'alternate';

        if (engineColors.length > 0) {
            return pickThemeAreaColor(index, totalPoints, engineColors, engineMode, x, y, canvasW, canvasH);
        }

        const base = snapshot.caseBaseColor;
        return Array.isArray(base) && base.length >= 3 ? base.slice(0, 3) : null;
    };

    /**
     * Phase 6: 登録slotを選択した際、保存済みの実表示配色をパネル表示へ同期する。
     * 描画色そのものはRuntime slot層が担当し、ここではパネルの表示状態を合わせる。
     * localStorageへの保存や配色遷移の起動は行わない。
     */
    Color.syncDisplayedSnapshotPanel = function(snapshot) {
        if (!snapshot || snapshot.ok !== true) return false;

        if (typeof snapshot.paletteSystem === 'string') {
            paletteSystem = snapshot.paletteSystem === 'legacy' ? 'legacy' : 'engine';
        }
        if (typeof snapshot.colorMode === 'string') {
            colorMode = snapshot.colorMode;
        }
        if (snapshot.theme) {
            if (typeof snapshot.theme.selectedThemeKey === 'string'
                && themeDefs.some((theme) => theme.key === snapshot.theme.selectedThemeKey)) {
                selectedThemeKey = snapshot.theme.selectedThemeKey;
            }
            if (Number.isFinite(Number(snapshot.theme.selectedThemeStep))) {
                selectedThemeStep = clampThemeStep(Number(snapshot.theme.selectedThemeStep));
            }
            if (Number.isFinite(Number(snapshot.theme.activeThemeRenderStep))) {
                activeThemeRenderStep = clampThemeStep(Number(snapshot.theme.activeThemeRenderStep));
            }
            if (Array.isArray(snapshot.theme.activeThemeRenderColors)) {
                activeThemeRenderColors = clonePalette(snapshot.theme.activeThemeRenderColors);
            }
            if (assignModeDefs.some((def) => def.key === snapshot.theme.activeAssignMode)) {
                activeAssignMode = snapshot.theme.activeAssignMode;
            }
            colorBlendEnabled = Boolean(snapshot.theme.colorBlendEnabled);
            const state = ensureThemeState(selectedThemeKey);
            state.step = selectedThemeStep;
            if (activeThemeRenderColors.length) {
                state.colors = clonePalette(activeThemeRenderColors);
            }
        }
        if (snapshot.random) {
            useRandomColors = Boolean(snapshot.random.enabled);
            randomColors = Array.isArray(snapshot.random.colors) ? clonePalette(snapshot.random.colors) : [];
            randomColorAssignMode = snapshot.random.assignMode || randomColorAssignMode;
        }
        if (snapshot.hueRange) {
            hueRangeColors = Array.isArray(snapshot.hueRange.colors) ? clonePalette(snapshot.hueRange.colors) : [];
            hueRangeBaseColors = Array.isArray(snapshot.hueRange.baseColors) ? clonePalette(snapshot.hueRange.baseColors) : [];
            hueRangeAssignMode = snapshot.hueRange.assignMode || hueRangeAssignMode;
            hueCount = Number.isFinite(Number(snapshot.hueRange.hueCount)) ? Number(snapshot.hueRange.hueCount) : hueCount;
            mixMin = Number.isFinite(Number(snapshot.hueRange.mixMin)) ? Number(snapshot.hueRange.mixMin) : mixMin;
            mixMax = Number.isFinite(Number(snapshot.hueRange.mixMax)) ? Number(snapshot.hueRange.mixMax) : mixMax;
            saturationMin = Number.isFinite(Number(snapshot.hueRange.saturationMin)) ? Number(snapshot.hueRange.saturationMin) : saturationMin;
            saturationMax = Number.isFinite(Number(snapshot.hueRange.saturationMax)) ? Number(snapshot.hueRange.saturationMax) : saturationMax;
        }

        const transitionInput = document.getElementById('color-transition-seconds');
        if (transitionInput && Number.isFinite(Number(snapshot.transitionSeconds))) {
            transitionInput.value = Number(snapshot.transitionSeconds);
        }

        syncThemeCards();
        syncAssignModeButtons();
        syncBlendButton();
        if (typeof Color.updateColorModeUI === 'function') Color.updateColorModeUI();
        if (typeof Color.updatePaletteSystemUI === 'function') Color.updatePaletteSystemUI();
        if (typeof Color.updateColorEngineUI === 'function') Color.updateColorEngineUI();
        if (typeof Color.updateColorPreview === 'function') Color.updateColorPreview();
        if (typeof Color.updatePaletteChips === 'function') Color.updatePaletteChips();
        return true;
    };

    Color.validateDisplayedColorSnapshot = function(snapshot) {
        const errors = [];
        if (!snapshot || snapshot.schemaVersion !== 1 || snapshot.ok !== true) {
            errors.push('schemaVersion');
        }
        if (!snapshot || typeof snapshot.displaySource !== 'string') {
            errors.push('displaySource');
        }
        if (!snapshot || typeof snapshot.paletteSystem !== 'string') {
            errors.push('paletteSystem');
        }
        if (snapshot && snapshot.displaySource === 'theme-engine-override') {
            if (!snapshot.theme || !Array.isArray(snapshot.theme.activeThemeRenderColors)
                || snapshot.theme.activeThemeRenderColors.length < 2) {
                errors.push('theme.activeThemeRenderColors');
            }
        }
        if (snapshot && snapshot.displaySource === 'color-engine') {
            if (!snapshot.engineStablePalette || snapshot.engineStablePalette.ok !== true) {
                errors.push('engineStablePalette');
            }
        }
        return { valid: errors.length === 0, errors: errors };
    };


    Color.getHueRangeColors = function() {
        return hueRangeColors;
    };

    Color.getHueRangeColor = function(i, pointCount) {
        if (colorMode === 'hue-range' && activeThemeRenderColors.length >= 2) {
            return pickThemeRenderColor(i, pointCount, activeThemeRenderColors, hueRangeAssignMode) || activeThemeRenderColors[0].slice();
        }
        const safeHueCount = Color.clampNumber(hueCount, 1, 36);
        const totalPoints = Math.max(1, parseInt(pointCount, 10) || 1);
        if (safeHueCount === 1) {
            if (hueRangeBaseColors.length !== safeHueCount) {
                Color.generateHueRangeBaseColors();
            }
            return (hueRangeBaseColors[0] || Color.randomVividRgb()).slice();
        }
        if (safeHueCount === 2) {
            const levelsPerColor = Math.ceil(totalPoints / safeHueCount);
            let within;
            if (hueRangeAssignMode === 'block') {
                within = i % levelsPerColor;
            } else {
                within = Math.floor(i / safeHueCount);
            }
            const u = levelsPerColor <= 1 ? 1 : within / (levelsPerColor - 1);
            const t = Color.lerpNumber(mixMin, mixMax, u);
            if (hueRangeBaseColors.length !== safeHueCount) {
                Color.generateHueRangeBaseColors();
            }
            let baseIndex;
            if (hueRangeAssignMode === 'block') {
                baseIndex = Math.floor(i / levelsPerColor);
                baseIndex = Math.min(baseIndex, safeHueCount - 1);
            } else {
                baseIndex = i % safeHueCount;
            }
            const vivid = hueRangeBaseColors[baseIndex] || Color.randomVividRgb();
            return Color.mixRgb([225, 225, 225], vivid, t);
        }
        const levelsPerColor = Math.ceil(totalPoints / safeHueCount);
        let within;
        if (hueRangeAssignMode === 'block') {
            within = i % levelsPerColor;
        } else {
            within = Math.floor(i / safeHueCount);
        }
        const u = levelsPerColor <= 1 ? 1 : within / (levelsPerColor - 1);
        const t = Color.lerpNumber(mixMin, mixMax, u);
        if (hueRangeBaseColors.length !== safeHueCount) {
            Color.generateHueRangeBaseColors();
        }
        let baseIndex;
        if (hueRangeAssignMode === 'block') {
            baseIndex = Math.floor(i / levelsPerColor);
            baseIndex = Math.min(baseIndex, safeHueCount - 1);
        } else {
            baseIndex = i % safeHueCount;
        }
        const nextIndex = (baseIndex + 1) % safeHueCount;
        const localT = safeHueCount <= 1 ? 0 : (i / Math.max(1, totalPoints)) * safeHueCount - baseIndex;
        const blendT = Color.clampNumber(localT, 0, 1);
        const vivid = Color.lerpRgb(
            hueRangeBaseColors[baseIndex] || Color.randomVividRgb(),
            hueRangeBaseColors[nextIndex] || Color.randomVividRgb(),
            blendT
        );
        return Color.mixRgb([225, 225, 225], vivid, t);
    };

Color.updateColorModeUI = function() {
        const checkbox = document.getElementById('random-color-checkbox');
        const modeSelect = document.getElementById('color-mode-select');
        const hueControls = document.getElementById('hue-range-controls');
        if (checkbox) {
            checkbox.checked = colorMode === 'random';
        }
        if (modeSelect) {
            modeSelect.value = colorMode;
        }
        if (hueControls) {
            hueControls.style.display = colorMode === 'hue-range' ? 'block' : 'none';
        }
        Color.updatePaletteSystemUI();
    };

    Color.clampNumber = function(value, min, max) {
        if (isNaN(value)) return min;
        return Math.max(min, Math.min(max, value));
    };

    Color.lerpNumber = function(a, b, t) {
        return a + (b - a) * t;
    };

    Color.mixRgb = function(bg, vivid, t) {
        const clampedT = Color.clampNumber(t, 0, 1);
        return [
            Math.round(bg[0] * (1 - clampedT) + vivid[0] * clampedT),
            Math.round(bg[1] * (1 - clampedT) + vivid[1] * clampedT),
            Math.round(bg[2] * (1 - clampedT) + vivid[2] * clampedT)
        ];
    };

    Color.randomVividRgb = function() {
        const maxTries = 12;
        for (let i = 0; i < maxTries; i++) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            if (Math.max(r, g, b) - Math.min(r, g, b) >= 60) {
                return [r, g, b];
            }
        }
        return [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ];
    };
    Color.getRandomInRange = function(min, max) {
        const safeMin = Math.min(min, max);
        const safeMax = Math.max(min, max);
        return safeMin + Math.random() * (safeMax - safeMin);
    };

    Color.hslToRgb = function(h, s, l) {
        const hue = ((h % 360) + 360) % 360;
        const sat = Color.clampNumber(s, 0, 100) / 100;
        const light = Color.clampNumber(l, 0, 100) / 100;
        const c = (1 - Math.abs(2 * light - 1)) * sat;
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = light - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;

        if (hue < 60) {
            r = c;
            g = x;
        } else if (hue < 120) {
            r = x;
            g = c;
        } else if (hue < 180) {
            g = c;
            b = x;
        } else if (hue < 240) {
            g = x;
            b = c;
        } else if (hue < 300) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }

        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    };

})(window.Color);




document.addEventListener('caseChanged', function(event) {
    window.Color.onCaseChange(event);
});

window.addEventListener('load', function() {
    uiuxPublicDebugLog('Window loaded: Updating Color UI');
    if (window.currentCase) {
        window.Color.updateAllSliders();
    } else {
        console.warn('window.currentCase not available on load');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    window.Color.createColorGroup();
});
