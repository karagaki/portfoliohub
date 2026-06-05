window.ColorEngine = window.ColorEngine || {};

(function(ColorEngine) {
    const bgColor = [225, 225, 225];

    ColorEngine.engineEnabled = true;
    ColorEngine.groupCount = 2;
    ColorEngine.assignModeGlobal = 'auto';
    ColorEngine.mixMin = 0.15;
    ColorEngine.mixMax = 1.0;
    ColorEngine.baseColors = [];
    ColorEngine.baseSeed = 0;

    // Transition state
    const currentPalette = {
        baseColors: [],
        groupCount: 2,
        mixMin: 0.15,
        mixMax: 1.0,
        assignModeGlobal: 'auto'
    };
    const targetPalette = {
        baseColors: [],
        groupCount: 2,
        mixMin: 0.15,
        mixMax: 1.0,
        assignModeGlobal: 'auto'
    };
    const paletteTransition = {
        active: false,
        startMs: 0,
        durationMs: (window.getColorTransitionDurationMs ? window.getColorTransitionDurationMs() : 3000)
    };
    const currentColorCache = new Map();

    ColorEngine.init = function() {
        ColorEngine.load();
        if (!Array.isArray(ColorEngine.baseColors) || ColorEngine.baseColors.length !== ColorEngine.groupCount) {
            ColorEngine.regenerateBaseColors();
        }

        // Initialize currentPalette
        currentPalette.baseColors = ColorEngine.baseColors.map(c => c.slice());
        currentPalette.groupCount = ColorEngine.groupCount;
        currentPalette.mixMin = ColorEngine.mixMin;
        currentPalette.mixMax = ColorEngine.mixMax;
        currentPalette.assignModeGlobal = ColorEngine.assignModeGlobal;

        // Initialize targetPalette
        targetPalette.baseColors = ColorEngine.baseColors.map(c => c.slice());
        targetPalette.groupCount = ColorEngine.groupCount;
        targetPalette.mixMin = ColorEngine.mixMin;
        targetPalette.mixMax = ColorEngine.mixMax;
        targetPalette.assignModeGlobal = ColorEngine.assignModeGlobal;
    };

    ColorEngine.load = function() {
        const saved = localStorage.getItem('colorEngineSettings');
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            if (typeof data.engineEnabled === 'boolean') {
                ColorEngine.engineEnabled = data.engineEnabled;
            }
            if (data.groupCount === 2 || data.groupCount === 4) {
                ColorEngine.groupCount = data.groupCount;
            }
            if (typeof data.assignModeGlobal === 'string') {
                ColorEngine.assignModeGlobal = data.assignModeGlobal;
            }
            if (typeof data.mixMin === 'number') {
                ColorEngine.mixMin = ColorEngine.clamp(data.mixMin, 0, 1);
            }
            if (typeof data.mixMax === 'number') {
                ColorEngine.mixMax = ColorEngine.clamp(data.mixMax, 0, 1);
            }
            if (typeof data.baseSeed === 'number') {
                ColorEngine.baseSeed = data.baseSeed;
            }
        } catch (error) {
            console.warn('ColorEngine.load failed:', error);
        }
    };

    ColorEngine.save = function() {
        const payload = {
            engineEnabled: ColorEngine.engineEnabled,
            groupCount: ColorEngine.groupCount,
            assignModeGlobal: ColorEngine.assignModeGlobal,
            mixMin: ColorEngine.mixMin,
            mixMax: ColorEngine.mixMax,
            baseSeed: ColorEngine.baseSeed
        };
        localStorage.setItem('colorEngineSettings', JSON.stringify(payload));
    };

    ColorEngine.updateTransitionDuration = function(durationMs) {
        const normalizedDurationMs = Math.max(0, Number(durationMs) || 0);
        paletteTransition.durationMs = normalizedDurationMs;
        return normalizedDurationMs;
    };

    ColorEngine.regenerateBaseColors = function() {
        ColorEngine.baseColors = new Array(ColorEngine.groupCount)
            .fill(0)
            .map(() => ColorEngine.randomVividRgb());
        ColorEngine.baseSeed = Date.now();
    };

    ColorEngine.getAssignModeForCase = function(caseId) {
        if (ColorEngine.assignModeGlobal && ColorEngine.assignModeGlobal !== 'auto') {
            return ColorEngine.assignModeGlobal;
        }
        if (caseId === 5) return 'block';
        if (caseId === 6 || caseId === 7) return 'alternate';
        return 'alternate';
    };

    ColorEngine.getPointColor = function(i, totalPoints, x, y, caseId, canvasW, canvasH) {
        // Calculate transition progress
        let transitionT = 1;
        if (paletteTransition.active) {
            const elapsed = ColorEngine.nowMs() - paletteTransition.startMs;
            transitionT = ColorEngine.clamp01(elapsed / paletteTransition.durationMs);
            transitionT = ColorEngine.easeInOut(transitionT);

            if (transitionT >= 1) {
                // Transition complete
                paletteTransition.active = false;
                currentPalette.baseColors = targetPalette.baseColors.map(c => c.slice());
                currentPalette.groupCount = targetPalette.groupCount;
                currentPalette.mixMin = targetPalette.mixMin;
                currentPalette.mixMax = targetPalette.mixMax;
                currentPalette.assignModeGlobal = targetPalette.assignModeGlobal;
                transitionT = 1;
            }
        }

        // Blend current and target palettes
        const blendedGroupCount = transitionT < 0.5 ? currentPalette.groupCount : targetPalette.groupCount;
        const blendedMixMin = ColorEngine.lerp(currentPalette.mixMin, targetPalette.mixMin, transitionT);
        const blendedMixMax = ColorEngine.lerp(currentPalette.mixMax, targetPalette.mixMax, transitionT);
        const blendedAssignMode = transitionT < 0.5 ? currentPalette.assignModeGlobal : targetPalette.assignModeGlobal;

        const maxColors = Math.max(currentPalette.baseColors.length, targetPalette.baseColors.length);
        const blendedBaseColors = [];
        for (let k = 0; k < maxColors; k++) {
            const currColor = currentPalette.baseColors[k % currentPalette.baseColors.length] || [225, 225, 225];
            const targColor = targetPalette.baseColors[k % targetPalette.baseColors.length] || [225, 225, 225];
            blendedBaseColors.push(ColorEngine.lerpRgb(currColor, targColor, transitionT));
        }

        // Get assign mode
        const assignMode = ColorEngine.getAssignModeForCase(caseId);
        const effectiveAssignMode = blendedAssignMode !== 'auto' ? blendedAssignMode : assignMode;

        // Area modes: fixed assignment (no time-based animation)
        const isAreaMode = effectiveAssignMode === 'areaLR' || effectiveAssignMode === 'areaTB' || effectiveAssignMode === 'diagTLBR';

        if (isAreaMode) {
            let regionId = 0;
            if (effectiveAssignMode === 'areaLR') {
                regionId = x < canvasW / 2 ? 0 : 1;
            } else if (effectiveAssignMode === 'areaTB') {
                regionId = y < canvasH / 2 ? 0 : 1;
            } else if (effectiveAssignMode === 'diagTLBR') {
                regionId = (x / canvasW) + (y / canvasH) < 1 ? 0 : 1;
            }

            const vivid = blendedBaseColors[regionId] || ColorEngine.randomVividRgb();
            const levelsPerGroup = Math.ceil(totalPoints / 2);
            const levelIndex = Math.floor(i / 2);
            const u = levelsPerGroup <= 1 ? 1 : ColorEngine.clamp(levelIndex / (levelsPerGroup - 1), 0, 1);
            const mixT = blendedMixMin + (blendedMixMax - blendedMixMin) * u;
            const targetRgb = ColorEngine.mixRgb(bgColor, vivid, mixT);

            // Per-point smoothing (only during transitions or UI changes)
            const cacheKey = i;
            const prevColor = currentColorCache.get(cacheKey) || targetRgb;
            const smoothT = paletteTransition.active ? transitionT : 0.25;
            const outColor = ColorEngine.lerpRgb(prevColor, targetRgb, smoothT);
            currentColorCache.set(cacheKey, outColor);
            return outColor;
        }

        // Non-area modes: standard group assignment
        const N = blendedGroupCount;
        const levelsPerGroup = Math.ceil(totalPoints / N);
        let groupId = 0;
        let levelIndex = 0;

        if (effectiveAssignMode === 'block') {
            groupId = Math.min(Math.floor(i / levelsPerGroup), N - 1);
            levelIndex = i % levelsPerGroup;
        } else {
            // alternate
            groupId = i % N;
            levelIndex = Math.floor(i / N);
        }

        const vivid = blendedBaseColors[groupId] || ColorEngine.randomVividRgb();
        const u = levelsPerGroup <= 1 ? 1 : ColorEngine.clamp(levelIndex / (levelsPerGroup - 1), 0, 1);
        const mixT = blendedMixMin + (blendedMixMax - blendedMixMin) * u;
        const targetRgb = ColorEngine.mixRgb(bgColor, vivid, mixT);

        // Per-point smoothing
        const cacheKey = i;
        const prevColor = currentColorCache.get(cacheKey) || targetRgb;
        const smoothT = paletteTransition.active ? transitionT : 0.25;
        const outColor = ColorEngine.lerpRgb(prevColor, targetRgb, smoothT);
        currentColorCache.set(cacheKey, outColor);
        return outColor;
    };

    ColorEngine.mixRgb = function(bg, vivid, t) {
        const clampedT = ColorEngine.clamp(t, 0, 1);
        return [
            Math.round(bg[0] * (1 - clampedT) + vivid[0] * clampedT),
            Math.round(bg[1] * (1 - clampedT) + vivid[1] * clampedT),
            Math.round(bg[2] * (1 - clampedT) + vivid[2] * clampedT)
        ];
    };

    ColorEngine.randomVividRgb = function() {
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

    ColorEngine.clamp = function(value, min, max) {
        if (isNaN(value)) return min;
        return Math.max(min, Math.min(max, value));
    };

    // Utility functions for transitions
    ColorEngine.clamp01 = function(x) {
        return Math.max(0, Math.min(1, x));
    };

    ColorEngine.lerp = function(a, b, t) {
        return a + (b - a) * t;
    };

    ColorEngine.lerpRgb = function(rgbA, rgbB, t) {
        return [
            Math.round(ColorEngine.lerp(rgbA[0], rgbB[0], t)),
            Math.round(ColorEngine.lerp(rgbA[1], rgbB[1], t)),
            Math.round(ColorEngine.lerp(rgbA[2], rgbB[2], t))
        ];
    };

    ColorEngine.easeInOut = function(t) {
        return t * t * (3 - 2 * t);
    };

    ColorEngine.nowMs = function() {
        return performance.now();
    };

    function clonePaletteStateForSnapshot(source) {
        return {
            baseColors: Array.isArray(source.baseColors)
                ? source.baseColors.map((rgb) => Array.isArray(rgb) ? rgb.slice(0, 3) : rgb)
                : [],
            groupCount: source.groupCount,
            mixMin: source.mixMin,
            mixMax: source.mixMax,
            assignModeGlobal: source.assignModeGlobal
        };
    }

    /**
     * Phase 4.1: ColorEngine内部の遷移状態を外部が安全に判定するための読取API。
     * 状態を変更しない。
     */
    ColorEngine.getPaletteTransitionStatus = function() {
        let progress = paletteTransition.active ? 0 : 1;
        if (paletteTransition.active) {
            const duration = Math.max(0, Number(paletteTransition.durationMs) || 0);
            const elapsed = Math.max(0, ColorEngine.nowMs() - paletteTransition.startMs);
            progress = duration === 0 ? 1 : ColorEngine.clamp01(elapsed / duration);
        }
        return {
            active: paletteTransition.active,
            durationMs: paletteTransition.durationMs,
            progress: progress
        };
    };

    /**
     * 現在画面の正本になっている確定paletteを取得する。
     * 色遷移中は途中色を登録対象にしないため、取得を拒否する。
     */
    ColorEngine.captureStablePaletteSnapshot = function() {
        const transition = ColorEngine.getPaletteTransitionStatus();
        if (transition.active) {
            return {
                ok: false,
                reason: 'palette-transition-in-progress',
                message: '配色遷移中は登録できません',
                transition: transition
            };
        }

        return {
            ok: true,
            schemaVersion: 1,
            palette: clonePaletteStateForSnapshot(currentPalette),
            targetPalette: clonePaletteStateForSnapshot(targetPalette),
            publicSettings: {
                engineEnabled: ColorEngine.engineEnabled,
                groupCount: ColorEngine.groupCount,
                assignModeGlobal: ColorEngine.assignModeGlobal,
                mixMin: ColorEngine.mixMin,
                mixMax: ColorEngine.mixMax,
                baseSeed: ColorEngine.baseSeed
            },
            transition: transition
        };
    };

    ColorEngine.validateStablePaletteSnapshot = function(snapshot) {
        const errors = [];
        const palette = snapshot && snapshot.palette;
        if (!snapshot || snapshot.schemaVersion !== 1) errors.push('schemaVersion');
        if (!palette || !Array.isArray(palette.baseColors) || palette.baseColors.length === 0) {
            errors.push('palette.baseColors');
        } else if (palette.baseColors.some((rgb) => !Array.isArray(rgb) || rgb.length < 3)) {
            errors.push('palette.baseColors.rgb');
        }
        if (!palette || !Number.isFinite(Number(palette.mixMin)) || !Number.isFinite(Number(palette.mixMax))) {
            errors.push('palette.mixRange');
        }
        if (!palette || typeof palette.assignModeGlobal !== 'string') {
            errors.push('palette.assignModeGlobal');
        }
        return { valid: errors.length === 0, errors: errors };
    };

    /**
     * 復元時に ColorEngine へ渡す内容を検証・構築するだけのAPI。
     * Phase 4.1では実際の描画状態を変更しない。
     */
    ColorEngine.buildStablePaletteApplyPlan = function(snapshot) {
        const validation = ColorEngine.validateStablePaletteSnapshot(snapshot);
        if (!validation.valid) {
            return { ok: false, reason: 'invalid-stable-palette-snapshot', errors: validation.errors };
        }
        return {
            ok: true,
            settings: {
                baseColors: snapshot.palette.baseColors.map((rgb) => rgb.slice(0, 3)),
                groupCount: snapshot.palette.groupCount,
                mixMin: snapshot.palette.mixMin,
                mixMax: snapshot.palette.mixMax,
                assignModeGlobal: snapshot.palette.assignModeGlobal,
                durationMs: paletteTransition.durationMs
            },
            applyStatus: 'phase4_1-plan-only-no-visible-mutation'
        };
    };

    ColorEngine.applySettings = function(newSettings, reason) {
        reason = reason || 'unknown';

        // Update targetPalette
        if (newSettings.hasOwnProperty('baseColors') && Array.isArray(newSettings.baseColors) && newSettings.baseColors.length > 0) {
            targetPalette.baseColors = newSettings.baseColors.map((rgb) => Array.isArray(rgb) ? rgb.slice(0, 3) : rgb);
        } else
        if (newSettings.hasOwnProperty('groupCount')) {
            targetPalette.groupCount = newSettings.groupCount;
        } else {
            targetPalette.groupCount = ColorEngine.groupCount;
        }

        if (newSettings.hasOwnProperty('assignModeGlobal')) {
            targetPalette.assignModeGlobal = newSettings.assignModeGlobal;
        } else {
            targetPalette.assignModeGlobal = ColorEngine.assignModeGlobal;
        }

        if (newSettings.hasOwnProperty('mixMin')) {
            targetPalette.mixMin = newSettings.mixMin;
        } else {
            targetPalette.mixMin = ColorEngine.mixMin;
        }

        if (newSettings.hasOwnProperty('mixMax')) {
            targetPalette.mixMax = newSettings.mixMax;
        } else {
            targetPalette.mixMax = ColorEngine.mixMax;
        }

        if (newSettings.hasOwnProperty('durationMs')) {
            paletteTransition.durationMs = Math.max(0, Number(newSettings.durationMs) || 0);
        } else if (window.getColorTransitionDurationMs) {
            paletteTransition.durationMs = window.getColorTransitionDurationMs();
        }

        // Update baseColors based on reason
        if (newSettings.hasOwnProperty('baseColors') && Array.isArray(newSettings.baseColors) && newSettings.baseColors.length > 0) {
            // Use provided palette as the transition target.
            currentColorCache.clear();
        } else if (reason === 'groupCount' || reason === 'regenerate') {
            // Generate new baseColors
            targetPalette.baseColors = new Array(targetPalette.groupCount)
                .fill(0)
                .map(() => ColorEngine.randomVividRgb());
            // Clear cache when colors change dramatically
            currentColorCache.clear();
        } else {
            // Preserve baseColors (assignMode/mix changes)
            if (currentPalette.baseColors.length === targetPalette.groupCount) {
                targetPalette.baseColors = currentPalette.baseColors.slice();
            } else {
                // groupCount mismatch: adjust array
                targetPalette.baseColors = new Array(targetPalette.groupCount)
                    .fill(0)
                    .map((_, i) => {
                        if (i < currentPalette.baseColors.length) {
                            return currentPalette.baseColors[i].slice();
                        }
                        return ColorEngine.randomVividRgb();
                    });
            }
        }

        // Start transition
        paletteTransition.active = true;
        paletteTransition.startMs = ColorEngine.nowMs();

        // Update public state
        ColorEngine.groupCount = targetPalette.groupCount;
        ColorEngine.assignModeGlobal = targetPalette.assignModeGlobal;
        ColorEngine.mixMin = targetPalette.mixMin;
        ColorEngine.mixMax = targetPalette.mixMax;
    };
})(window.ColorEngine);
