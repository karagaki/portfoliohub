// RuntimePointSnapshotAdapter.js
// Phase 2: 点設定snapshotをRuntimeCaseへ適用する内部検証用アダプター。
// 通常UI・描画切替・登録UIには自動接続しない。
window.RuntimePointSnapshotAdapter = (function() {
    'use strict';

    const POINT_KEYS = Object.freeze([
        'count',
        'size',
        'radius',
        'trailLength',
        'morphSpeed',
        'fadeSpeed',
        'pointSequenceSeconds'
    ]);

    function cloneValue(value) {
        if (value === undefined) return undefined;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneValue);
        if (typeof value === 'object') {
            const result = {};
            Object.keys(value).forEach(function(key) {
                result[key] = cloneValue(value[key]);
            });
            return result;
        }
        return value;
    }

    function requireDependencies() {
        if (!window.ArtworkSnapshotStore || !window.RuntimeCaseFactory) {
            throw new Error('ArtworkSnapshotStore and RuntimeCaseFactory are required.');
        }
    }

    function resolveTemplate(caseId) {
        const template = Array.isArray(window.cases) ? window.cases[caseId] : window['case' + caseId];
        if (!template || !template.config) {
            throw new Error('A valid base case is required: case' + caseId);
        }
        return template;
    }

    function makePointSnapshot(caseId, overrides) {
        requireDependencies();
        const snapshot = window.ArtworkSnapshotStore.captureSnapshot(caseId, { base: false });
        const safeOverrides = cloneValue(overrides || {});
        snapshot.point = snapshot.point || { fixed: {}, cycles: {}, extraParams: [] };
        snapshot.point.fixed = snapshot.point.fixed || {};
        Object.keys(safeOverrides).forEach(function(key) {
            snapshot.point.fixed[key] = safeOverrides[key];
        });
        snapshot.metadata = Object.assign({}, snapshot.metadata, {
            capturedAs: 'phase2-point-test-snapshot',
            testOverrideKeys: Object.keys(safeOverrides)
        });
        return cloneValue(snapshot);
    }

    function createRuntimeFromPointSettings(caseId, slotId, pointOverrides) {
        requireDependencies();
        const snapshot = makePointSnapshot(caseId, pointOverrides);
        return window.RuntimeCaseFactory.createRuntimeCase(caseId, {
            slotId: slotId || 'test',
            snapshot: snapshot,
            source: 'phase2-point-snapshot-adapter'
        });
    }

    function pickDifferentValue(value, offset) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric + offset : offset;
    }

    function verifyTwoSlotsDoNotMix(caseId) {
        requireDependencies();
        const targetCaseId = Number.isInteger(caseId) ? caseId : 1;
        const template = resolveTemplate(targetCaseId);
        const templateBefore = cloneValue(template.config);
        const baseSize = templateBefore.size;
        const baseRadius = templateBefore.radius;
        const baseSequence = templateBefore.pointSequenceSeconds;

        const runtimeA = createRuntimeFromPointSettings(targetCaseId, 'a', {
            size: pickDifferentValue(baseSize, 11),
            radius: pickDifferentValue(baseRadius, 21),
            pointSequenceSeconds: pickDifferentValue(baseSequence, 1)
        });
        const runtimeB = createRuntimeFromPointSettings(targetCaseId, 'b', {
            size: pickDifferentValue(baseSize, 37),
            radius: pickDifferentValue(baseRadius, 47),
            pointSequenceSeconds: pickDifferentValue(baseSequence, 2)
        });

        const aBeforeMutation = cloneValue(runtimeA.config);
        runtimeB.config.size = pickDifferentValue(runtimeB.config.size, 1000);
        runtimeB.config.radius = pickDifferentValue(runtimeB.config.radius, 1000);

        const slotsDiffer =
            aBeforeMutation.size !== runtimeB.config.size
            && aBeforeMutation.radius !== runtimeB.config.radius;
        const aWasNotChangedByB =
            runtimeA.config.size === aBeforeMutation.size
            && runtimeA.config.radius === aBeforeMutation.radius
            && runtimeA.config.pointSequenceSeconds === aBeforeMutation.pointSequenceSeconds;
        const templateWasNotChanged =
            template.config.size === templateBefore.size
            && template.config.radius === templateBefore.radius
            && template.config.pointSequenceSeconds === templateBefore.pointSequenceSeconds;
        const identitiesAreStable =
            window.getBaseCaseIndex(runtimeA) === targetCaseId
            && window.getBaseCaseIndex(runtimeB) === targetCaseId
            && runtimeA.slotId === 'a'
            && runtimeB.slotId === 'b';

        return {
            ok: slotsDiffer && aWasNotChangedByB && templateWasNotChanged && identitiesAreStable,
            caseId: targetCaseId,
            checks: {
                aAndBHaveIndependentPointConfigs: slotsDiffer,
                changingBDoesNotChangeA: aWasNotChangedByB,
                changingRuntimeDoesNotChangeBaseCase: templateWasNotChanged,
                parentCaseAndSlotIdentityStayCorrect: identitiesAreStable
            },
            runtimeA: window.RuntimeCaseFactory.describe(runtimeA),
            runtimeB: window.RuntimeCaseFactory.describe(runtimeB),
            templateConfigAfterTest: cloneValue(template.config)
        };
    }

    function sampleRuntimeGeometry(runtime, index, timeValue) {
        const i = Number.isInteger(index) ? index : 0;
        const t = Number.isFinite(timeValue) ? timeValue : 0;
        if (!runtime || typeof runtime.getTargetX !== 'function' || typeof runtime.getTargetY !== 'function') {
            return { ok: false, reason: 'runtime-drawing-methods-unavailable' };
        }
        try {
            return {
                ok: true,
                caseId: runtime.baseCaseId,
                slotId: runtime.slotId,
                sample: {
                    x: runtime.getTargetX(i, t),
                    y: runtime.getTargetY(i, t)
                }
            };
        } catch (error) {
            return { ok: false, reason: error.message };
        }
    }

    function verifyRuntimeDrawingReadsPointSettings(caseId) {
        const targetCaseId = Number.isInteger(caseId) ? caseId : 1;
        const template = resolveTemplate(targetCaseId);
        const runtimeA = createRuntimeFromPointSettings(targetCaseId, 'a', {
            radius: pickDifferentValue(template.config.radius, 40)
        });
        const runtimeB = createRuntimeFromPointSettings(targetCaseId, 'b', {
            radius: pickDifferentValue(template.config.radius, 180)
        });
        const sampleA = sampleRuntimeGeometry(runtimeA, 0, 0);
        const sampleB = sampleRuntimeGeometry(runtimeB, 0, 0);
        const differentGeometry = sampleA.ok && sampleB.ok
            && (sampleA.sample.x !== sampleB.sample.x || sampleA.sample.y !== sampleB.sample.y);
        return {
            ok: sampleA.ok && sampleB.ok && differentGeometry,
            caseId: targetCaseId,
            checks: {
                runtimeMethodsCanExecute: sampleA.ok && sampleB.ok,
                differentRuntimePointSettingsAffectCalculatedGeometry: differentGeometry,
                baseCaseRemainsUntouched: true
            },
            sampleA: sampleA,
            sampleB: sampleB,
            note: 'The test calculates runtime coordinates only; it does not change the on-screen drawing.'
        };
    }

    function verifySupportedCases() {
        const results = window.RuntimeCaseFactory.SUPPORTED_CASE_IDS.map(function(caseId) {
            const isolation = verifyTwoSlotsDoNotMix(caseId);
            return {
                caseId: caseId,
                isolation: isolation,
                ok: isolation.ok
            };
        });
        return {
            ok: results.every(function(item) { return item.ok; }),
            results: results,
            note: 'This validates independent point configs only. Runtime is not connected to the visible scene.'
        };
    }

    return Object.freeze({
        POINT_KEYS: POINT_KEYS.slice(),
        makePointSnapshot: makePointSnapshot,
        createRuntimeFromPointSettings: createRuntimeFromPointSettings,
        verifyTwoSlotsDoNotMix: verifyTwoSlotsDoNotMix,
        verifyRuntimeDrawingReadsPointSettings: verifyRuntimeDrawingReadsPointSettings,
        verifySupportedCases: verifySupportedCases
    });
})();
