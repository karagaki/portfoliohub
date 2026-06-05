// RuntimeVisualSnapshotAdapter.js
// Phase 4: 配色・背景色・流線/残像のsnapshot独立性を検証するアダプター。
// この段階では既存ColorEngine・Canvas・画面描画へ設定を適用しない。
// 理由: ColorEngineの遷移中paletteは内部closureにあり、途中状態の安全な復元入口が未整備である。
window.RuntimeVisualSnapshotAdapter = (function() {
    'use strict';

    const TRAIL_MODES = Object.freeze(['history', 'accumulate']);
    const COLOR_KEYS = Object.freeze([
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
        'globalCanvasBgColor'
    ]);

    function cloneValue(value) {
        if (value === undefined) return undefined;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneValue);
        if (typeof value === 'object') {
            const copy = {};
            Object.keys(value).forEach(function(key) {
                copy[key] = cloneValue(value[key]);
            });
            return copy;
        }
        return value;
    }

    function requireDependencies() {
        if (!window.ArtworkSnapshotStore || !window.RuntimeCaseFactory) {
            throw new Error('Phase 1/Runtime foundations are required.');
        }
    }

    function normalizeTrailMode(mode) {
        return mode === 'accumulate' ? 'accumulate' : 'history';
    }

    function normalizeBackground(value) {
        const color = typeof value === 'string' ? value : '#e1e1e1';
        return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#e1e1e1';
    }

    function isColorTransitionActive() {
        // 現行で外から安全に把握できる点/色の一括遷移フラグ。
        // ColorEngine内部paletteTransitionの直接状態は公開されていないため、
        // Phase 4では実適用を行わず、登録UI接続時は追加APIの整備を必須とする。
        return window.isTransitioning === true;
    }

    function captureVisualSnapshot(caseId) {
        requireDependencies();
        const captured = window.ArtworkSnapshotStore.captureSnapshot(caseId, { base: false });
        const stablePalette = window.ColorEngine
            && typeof window.ColorEngine.captureStablePaletteSnapshot === 'function'
            ? window.ColorEngine.captureStablePaletteSnapshot()
            : { ok: false, reason: 'stable-palette-api-unavailable' };
        return {
            caseId: caseId,
            color: Object.assign({}, cloneValue(captured.color || {}), {
                stablePalette: cloneValue(stablePalette)
            }),
            render: {
                trailMode: normalizeTrailMode(captured.render && captured.render.trailMode),
                canvasBackground: normalizeBackground(
                    captured.render && captured.render.canvasBackground
                )
            },
            guards: {
                capturedDuringTransition: isColorTransitionActive(),
                stablePaletteCaptured: stablePalette.ok === true,
                paletteCaptureBlockReason: stablePalette.ok === true ? null : stablePalette.reason,
                actualApplyAllowed: false,
                reason: 'phase4_1-stable-palette-capture-and-plan-only-no-visible-apply'
            }
        };
    }

    function createVisualRuntime(caseId, slotId, overrides) {
        const base = captureVisualSnapshot(caseId);
        const safe = cloneValue(overrides || {});
        const visual = {
            caseId: caseId,
            slotId: typeof slotId === 'string' ? slotId : null,
            color: cloneValue(base.color),
            render: cloneValue(base.render),
            guards: cloneValue(base.guards)
        };

        if (safe.color) {
            visual.color = Object.assign({}, visual.color, cloneValue(safe.color));
        }
        if (safe.trailMode) {
            visual.render.trailMode = normalizeTrailMode(safe.trailMode);
        }
        if (safe.canvasBackground) {
            visual.render.canvasBackground = normalizeBackground(safe.canvasBackground);
        }
        return visual;
    }

    function getColorStorageCopy(visual) {
        return visual && visual.color && visual.color.storage
            ? cloneValue(visual.color.storage)
            : {};
    }

    function verifyTwoSlotsDoNotMix(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const visualA = createVisualRuntime(targetId, 'a', {
            trailMode: 'history',
            canvasBackground: '#112233',
            color: { testPaletteMarker: ['a', [10, 20, 30]] }
        });
        const visualB = createVisualRuntime(targetId, 'b', {
            trailMode: 'accumulate',
            canvasBackground: '#ddeeff',
            color: { testPaletteMarker: ['b', [90, 80, 70]] }
        });

        visualB.render.canvasBackground = '#abcdef';
        visualB.color.testPaletteMarker[1][0] = 255;

        const modesSeparated =
            visualA.render.trailMode === 'history'
            && visualB.render.trailMode === 'accumulate';
        const backgroundsSeparated =
            visualA.render.canvasBackground === '#112233'
            && visualB.render.canvasBackground === '#abcdef';
        const colorStateSeparated =
            visualA.color.testPaletteMarker[0] === 'a'
            && visualA.color.testPaletteMarker[1][0] === 10
            && visualB.color.testPaletteMarker[1][0] === 255;

        return {
            ok: modesSeparated && backgroundsSeparated && colorStateSeparated,
            checks: {
                trailModesAreIndependent: modesSeparated,
                backgroundsAreIndependent: backgroundsSeparated,
                colorSnapshotsAreDeepCopied: colorStateSeparated
            },
            visualA: cloneValue(visualA),
            visualB: cloneValue(visualB)
        };
    }

    function verifyCapturedSources(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const visual = captureVisualSnapshot(targetId);
        const storage = getColorStorageCopy(visual);
        const hasTrackedColorKeys = COLOR_KEYS.every(function(key) {
            return Object.prototype.hasOwnProperty.call(storage, key);
        });
        const hasEnginePublicState = visual.color
            && Object.prototype.hasOwnProperty.call(visual.color, 'enginePublicState');
        const hasRenderState = TRAIL_MODES.includes(visual.render.trailMode)
            && /^#[0-9A-Fa-f]{6}$/.test(visual.render.canvasBackground);
        const stablePaletteCaptured = visual.color
            && visual.color.stablePalette
            && visual.color.stablePalette.ok === true;
        const stablePlanBuilt = stablePaletteCaptured
            && window.ColorEngine
            && typeof window.ColorEngine.buildStablePaletteApplyPlan === 'function'
            && window.ColorEngine.buildStablePaletteApplyPlan(visual.color.stablePalette).ok === true;

        return {
            ok: hasTrackedColorKeys && hasEnginePublicState && hasRenderState && stablePaletteCaptured && stablePlanBuilt,
            checks: {
                trackedColorStorageKeysCaptured: hasTrackedColorKeys,
                colorEnginePublicStateCaptured: hasEnginePublicState,
                stableDisplayedPaletteCaptured: stablePaletteCaptured,
                stablePaletteApplyPlanCanBeBuiltWithoutChangingScreen: stablePlanBuilt,
                backgroundAndTrailModeCaptured: hasRenderState,
                actualColorApplyIsStillBlocked: visual.guards.actualApplyAllowed === false
            },
            captured: visual
        };
    }

    function canRegisterCurrentVisualState(caseId) {
        const visual = captureVisualSnapshot(Number.isInteger(caseId) ? caseId : 1);
        if (visual.guards.capturedDuringTransition) {
            return {
                ok: false,
                reason: 'transition-in-progress',
                message: '色またはcaseの遷移中は登録できません'
            };
        }
        if (!visual.guards.stablePaletteCaptured) {
            return {
                ok: false,
                reason: visual.guards.paletteCaptureBlockReason || 'stable-palette-unavailable',
                message: '配色遷移中は登録できません'
            };
        }
        return {
            ok: true,
            visualSnapshot: visual,
            note: 'This is a capture readiness check only; no visible state is changed.'
        };
    }

    function verifyAll(caseId) {
        const sources = verifyCapturedSources(caseId);
        const separation = verifyTwoSlotsDoNotMix(caseId);
        return {
            ok: sources.ok && separation.ok,
            checks: {
                captureSources: sources,
                slotSeparation: separation
            },
            limitations: [
                'ColorEngine stable displayed palette can now be captured only when color transition is complete.',
                'Applying color/background/trail state to the visible scene is intentionally not connected in Phase 4.1.',
                'Trail mode transition blending remains a later design/implementation phase.'
            ]
        };
    }

    return Object.freeze({
        TRAIL_MODES: TRAIL_MODES.slice(),
        COLOR_KEYS: COLOR_KEYS.slice(),
        captureVisualSnapshot: captureVisualSnapshot,
        createVisualRuntime: createVisualRuntime,
        verifyCapturedSources: verifyCapturedSources,
        verifyTwoSlotsDoNotMix: verifyTwoSlotsDoNotMix,
        canRegisterCurrentVisualState: canRegisterCurrentVisualState,
        verifyAll: verifyAll
    });
})();
