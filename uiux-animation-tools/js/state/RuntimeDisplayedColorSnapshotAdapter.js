// RuntimeDisplayedColorSnapshotAdapter.js
// Phase 4.3: 実描画の色経路を含むDisplayedColorSnapshotの内部検証。
// 配色の画面適用・復元はまだ行わない。
window.RuntimeDisplayedColorSnapshotAdapter = (function() {
    'use strict';

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

    function requireColorApi() {
        if (!window.Color || typeof window.Color.captureDisplayedColorSnapshot !== 'function') {
            throw new Error('Color.captureDisplayedColorSnapshot is required.');
        }
    }

    function captureSlotColor(caseId, slotId) {
        requireColorApi();
        const displayed = window.Color.captureDisplayedColorSnapshot();
        if (!displayed.ok) return displayed;
        const validation = window.Color.validateDisplayedColorSnapshot(displayed);
        if (!validation.valid) {
            return { ok: false, reason: 'invalid-displayed-color-snapshot', errors: validation.errors };
        }
        return {
            ok: true,
            caseId: caseId,
            slotId: slotId,
            displayedColor: cloneValue(displayed),
            applyStatus: 'phase4_3-capture-only-no-visible-mutation'
        };
    }

    function verifyCapture(caseId) {
        const captured = captureSlotColor(Number.isInteger(caseId) ? caseId : 1, '-');
        if (!captured.ok) return captured;
        return {
            ok: true,
            checks: {
                displaySourceIdentified: typeof captured.displayedColor.displaySource === 'string',
                colorPathSettingsCaptured: !!captured.displayedColor.theme && !!captured.displayedColor.random
                    && !!captured.displayedColor.hueRange,
                noVisibleMutationPerformed: captured.applyStatus === 'phase4_3-capture-only-no-visible-mutation'
            },
            displaySource: captured.displayedColor.displaySource,
            captured: captured
        };
    }

    function verifyTwoSlotsDoNotMix(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const base = captureSlotColor(targetId, '-');
        if (!base.ok) return base;

        const slotA = cloneValue(base);
        slotA.slotId = 'a';
        slotA.displayedColor.theme.activeThemeRenderColors = [[10, 20, 30], [40, 50, 60]];
        slotA.displayedColor.theme.activeAssignMode = 'alternate';

        const slotB = cloneValue(base);
        slotB.slotId = 'b';
        slotB.displayedColor.theme.activeThemeRenderColors = [[90, 80, 70], [60, 50, 40]];
        slotB.displayedColor.theme.activeAssignMode = 'left-right';

        slotB.displayedColor.theme.activeThemeRenderColors[0][0] = 255;

        const independentColors = slotA.displayedColor.theme.activeThemeRenderColors[0][0] === 10
            && slotB.displayedColor.theme.activeThemeRenderColors[0][0] === 255;
        const independentAssignMode = slotA.displayedColor.theme.activeAssignMode === 'alternate'
            && slotB.displayedColor.theme.activeAssignMode === 'left-right';

        return {
            ok: independentColors && independentAssignMode,
            checks: {
                displayedColorArraysAreIndependent: independentColors,
                displayedAssignModesAreIndependent: independentAssignMode,
                noVisibleMutationPerformed: true
            },
            slotA: slotA,
            slotB: slotB
        };
    }

    function verifyAll(caseId) {
        const capture = verifyCapture(caseId);
        const separation = verifyTwoSlotsDoNotMix(caseId);
        return {
            ok: capture.ok && separation.ok,
            checks: {
                capture: capture,
                slotSeparation: separation
            },
            correction: 'theme-engine-override等の実表示経路を含むsnapshotを正本候補として確認します。',
            note: '読取・独立コピー確認のみで、画面上の配色は変更しません。'
        };
    }

    return Object.freeze({
        captureSlotColor: captureSlotColor,
        verifyCapture: verifyCapture,
        verifyTwoSlotsDoNotMix: verifyTwoSlotsDoNotMix,
        verifyAll: verifyAll
    });
})();
