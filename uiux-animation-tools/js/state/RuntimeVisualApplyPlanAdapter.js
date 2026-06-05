// RuntimeVisualApplyPlanAdapter.js
// Phase 4.2: 確定palette・背景色・流線/残像を1つの視覚snapshotとして扱い、
// 復元時に必要な変更内容を独立したApplyPlanへ構築する内部検証用アダプター。
// この段階では画面・ColorEngine・Canvas設定を変更しない。
window.RuntimeVisualApplyPlanAdapter = (function() {
    'use strict';

    const APPLY_PLAN_VERSION = 1;

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
        if (!window.RuntimeVisualSnapshotAdapter || !window.ColorEngine) {
            throw new Error('RuntimeVisualSnapshotAdapter and ColorEngine are required.');
        }
        if (typeof window.ColorEngine.buildStablePaletteApplyPlan !== 'function') {
            throw new Error('Stable palette plan API is not available.');
        }
    }

    function normalizeTrailMode(mode) {
        return mode === 'accumulate' ? 'accumulate' : 'history';
    }

    function normalizeBackground(value) {
        return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
            ? value
            : '#e1e1e1';
    }

    function captureVisualSlotSnapshot(caseId, slotId) {
        requireDependencies();
        const readiness = window.RuntimeVisualSnapshotAdapter.canRegisterCurrentVisualState(caseId);
        if (!readiness.ok) {
            return {
                ok: false,
                reason: readiness.reason,
                message: readiness.message
            };
        }
        return {
            ok: true,
            schemaVersion: 1,
            caseId: caseId,
            slotId: typeof slotId === 'string' ? slotId : null,
            visual: cloneValue(readiness.visualSnapshot),
            capturedAt: new Date().toISOString()
        };
    }

    function buildApplyPlan(slotSnapshot) {
        requireDependencies();
        if (!slotSnapshot || slotSnapshot.ok !== true || !slotSnapshot.visual) {
            return { ok: false, reason: 'invalid-visual-slot-snapshot' };
        }

        const stablePalette = slotSnapshot.visual.color
            && slotSnapshot.visual.color.stablePalette;
        const palettePlan = window.ColorEngine.buildStablePaletteApplyPlan(stablePalette);
        if (!palettePlan.ok) {
            return {
                ok: false,
                reason: 'palette-plan-failed',
                palettePlan: cloneValue(palettePlan)
            };
        }

        const render = slotSnapshot.visual.render || {};
        return {
            ok: true,
            applyPlanVersion: APPLY_PLAN_VERSION,
            target: {
                caseId: slotSnapshot.caseId,
                slotId: slotSnapshot.slotId
            },
            color: {
                settings: cloneValue(palettePlan.settings),
                source: 'stable-current-palette'
            },
            render: {
                canvasBackground: normalizeBackground(render.canvasBackground),
                trailMode: normalizeTrailMode(render.trailMode)
            },
            execution: {
                mutatesVisibleScene: false,
                status: 'phase4_2-plan-only-no-visible-mutation',
                laterRequiredAdapters: [
                    'ColorEngine stable palette apply/restore',
                    'Canvas background apply/restore',
                    'Trail mode apply/restore with transition policy'
                ]
            }
        };
    }

    function createModifiedVisualSlotSnapshot(base, slotId, modifications) {
        const copy = cloneValue(base);
        copy.slotId = slotId;
        const changes = modifications || {};
        if (changes.canvasBackground) {
            copy.visual.render.canvasBackground = normalizeBackground(changes.canvasBackground);
        }
        if (changes.trailMode) {
            copy.visual.render.trailMode = normalizeTrailMode(changes.trailMode);
        }
        if (Array.isArray(changes.baseColors) && copy.visual.color && copy.visual.color.stablePalette) {
            copy.visual.color.stablePalette.palette.baseColors =
                changes.baseColors.map(function(rgb) { return rgb.slice(0, 3); });
        }
        return copy;
    }

    function verifyCurrentPlan(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const captured = captureVisualSlotSnapshot(targetId, '-');
        if (!captured.ok) return captured;

        const plan = buildApplyPlan(captured);
        const palette = captured.visual.color.stablePalette.palette;
        const settings = plan.ok && plan.color ? plan.color.settings : null;
        const samePalette = settings
            && JSON.stringify(settings.baseColors) === JSON.stringify(palette.baseColors)
            && settings.groupCount === palette.groupCount
            && settings.assignModeGlobal === palette.assignModeGlobal;
        const sameRender = plan.ok
            && plan.render.canvasBackground === normalizeBackground(captured.visual.render.canvasBackground)
            && plan.render.trailMode === normalizeTrailMode(captured.visual.render.trailMode);

        return {
            ok: plan.ok && samePalette && sameRender,
            checks: {
                capturedVisualBuildsApplyPlan: plan.ok,
                planUsesCapturedStablePalette: !!samePalette,
                planUsesCapturedBackgroundAndTrailMode: !!sameRender,
                noVisibleMutationPerformed: plan.ok && plan.execution.mutatesVisibleScene === false
            },
            plan: plan
        };
    }

    function verifyTwoSlotPlansDoNotMix(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const source = captureVisualSlotSnapshot(targetId, '-');
        if (!source.ok) return source;

        const slotA = createModifiedVisualSlotSnapshot(source, 'a', {
            canvasBackground: '#112233',
            trailMode: 'history',
            baseColors: [[10, 20, 30], [40, 50, 60]]
        });
        const slotB = createModifiedVisualSlotSnapshot(source, 'b', {
            canvasBackground: '#ddeeff',
            trailMode: 'accumulate',
            baseColors: [[90, 80, 70], [60, 50, 40]]
        });

        const planA = buildApplyPlan(slotA);
        const planB = buildApplyPlan(slotB);
        if (!planA.ok || !planB.ok) {
            return { ok: false, reason: 'plan-build-failed', planA: planA, planB: planB };
        }

        planB.color.settings.baseColors[0][0] = 255;
        planB.render.canvasBackground = '#abcdef';

        const paletteIndependent = planA.color.settings.baseColors[0][0] === 10
            && planB.color.settings.baseColors[0][0] === 255;
        const backgroundIndependent = planA.render.canvasBackground === '#112233'
            && planB.render.canvasBackground === '#abcdef';
        const trailIndependent = planA.render.trailMode === 'history'
            && planB.render.trailMode === 'accumulate';

        return {
            ok: paletteIndependent && backgroundIndependent && trailIndependent,
            checks: {
                paletteApplyPlansAreIndependent: paletteIndependent,
                backgroundApplyPlansAreIndependent: backgroundIndependent,
                trailModeApplyPlansAreIndependent: trailIndependent,
                noVisibleMutationPerformed: true
            },
            planA: planA,
            planB: planB
        };
    }

    function verifyAll(caseId) {
        const current = verifyCurrentPlan(caseId);
        const separated = verifyTwoSlotPlansDoNotMix(caseId);
        return {
            ok: current.ok && separated.ok,
            checks: {
                currentVisualPlan: current,
                separateSlotPlans: separated
            },
            note: '視覚snapshotの復元計画だけを検証し、表示中の配色・背景色・流線/残像は変更しません。'
        };
    }

    return Object.freeze({
        APPLY_PLAN_VERSION: APPLY_PLAN_VERSION,
        captureVisualSlotSnapshot: captureVisualSlotSnapshot,
        buildApplyPlan: buildApplyPlan,
        verifyCurrentPlan: verifyCurrentPlan,
        verifyTwoSlotPlansDoNotMix: verifyTwoSlotPlansDoNotMix,
        verifyAll: verifyAll
    });
})();
