// RuntimeCycleSnapshotAdapter.js
// Phase 3: 周期設定snapshotをRuntimeCaseごとに独立保持・計算する内部検証用アダプター。
// 既存の Slider Registry、通常UI、実描画ループには自動接続しない。
window.RuntimeCycleSnapshotAdapter = (function() {
    'use strict';

    const ALLOWED_CYCLE_MULTIPLIERS = Object.freeze([0.5, 1, 4]);
    const DEFAULT_TEST_PARAM = 'size';

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
        if (!window.ArtworkSnapshotStore || !window.RuntimeCaseFactory || !window.RuntimePointSnapshotAdapter) {
            throw new Error('Phase 1/2 foundations are required.');
        }
    }

    function normalizeCycleEntry(entry, fallbackBaseValue) {
        const safe = cloneValue(entry || {});
        const mode = safe.mode === 'cycle' ? 'cycle' : 'fixed';
        const cycleMultiplier = ALLOWED_CYCLE_MULTIPLIERS.includes(Number(safe.cycleMultiplier))
            ? Number(safe.cycleMultiplier)
            : null;
        const fallback = Number.isFinite(Number(fallbackBaseValue)) ? Number(fallbackBaseValue) : 0;
        let minValue = Number(safe.minValue);
        let maxValue = Number(safe.maxValue);
        if (!Number.isFinite(minValue)) minValue = fallback;
        if (!Number.isFinite(maxValue)) maxValue = fallback;
        if (minValue > maxValue) {
            const swap = minValue;
            minValue = maxValue;
            maxValue = swap;
        }
        return {
            /*
             * 旧版のperiodSecはアニメーション周期と意味が異なるため移行せず、
             * cycleMultiplierを持つ新形式だけを周期設定として復元する。
             */
            mode: mode === 'cycle' && cycleMultiplier ? 'cycle' : 'fixed',
            cycleMultiplier: mode === 'cycle' && cycleMultiplier ? cycleMultiplier : null,
            minValue: minValue,
            maxValue: maxValue,
            baseValue: Number.isFinite(Number(safe.baseValue)) ? Number(safe.baseValue) : fallback
        };
    }

    function normalizeCycleMap(runtime, cycleMap) {
        const safeMap = cycleMap || {};
        const result = {};
        Object.keys(safeMap).forEach(function(param) {
            result[param] = normalizeCycleEntry(safeMap[param], runtime.config[param]);
        });
        return result;
    }

    function attachCycleSnapshot(runtime, cycleMap, options) {
        if (!runtime || runtime.__isRuntimeCase !== true || !runtime.config) {
            throw new Error('A RuntimeCase is required.');
        }
        const opts = options || {};
        const normalized = normalizeCycleMap(runtime, cycleMap);
        Object.defineProperty(runtime, '__runtimePointCycles', {
            value: normalized,
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(runtime, '__runtimeCycleClock', {
            value: {
                startFrame: Number.isFinite(Number(opts.startFrame)) ? Number(opts.startFrame) : 0,
                resetOnSelection: true
            },
            writable: true,
            configurable: true,
            enumerable: true
        });
        return runtime;
    }

    function createRuntimeWithCycles(caseId, slotId, pointOverrides, cycleOverrides) {
        requireDependencies();
        const runtime = window.RuntimePointSnapshotAdapter.createRuntimeFromPointSettings(
            caseId,
            slotId,
            pointOverrides || {}
        );
        return attachCycleSnapshot(runtime, cycleOverrides || {}, { startFrame: 0 });
    }

    function getAnimationCycleFrames(runtime) {
        if (!runtime) return 60;
        if (typeof runtime.getAnimationCycleFrames === 'function') {
            const customFrames = Number(runtime.getAnimationCycleFrames());
            if (Number.isFinite(customFrames) && customFrames > 0) return Math.max(1, Math.round(customFrames));
        }
        const morphEntry = runtime.__runtimePointCycles && runtime.__runtimePointCycles.morphSpeed;
        const speed = morphEntry && Number.isFinite(Number(morphEntry.baseValue))
            ? Number(morphEntry.baseValue)
            : Number(runtime.config && runtime.config.morphSpeed);
        return Number.isFinite(speed) && Math.abs(speed) > 0
            ? Math.max(1, Math.round((Math.PI * 2) / Math.abs(speed)))
            : 60;
    }

    function computeCycleValue(entry, elapsedFrames, runtime) {
        const state = normalizeCycleEntry(entry, entry && entry.baseValue);
        if (state.mode !== 'cycle' || !state.cycleMultiplier) return null;
        const frame = Math.max(0, Number.isFinite(Number(elapsedFrames)) ? Number(elapsedFrames) : 0);
        const periodFrames = getAnimationCycleFrames(runtime) * state.cycleMultiplier;
        const progress = periodFrames > 0 ? (frame % periodFrames) / periodFrames : 0;
        const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);
        return state.minValue + ((state.maxValue - state.minValue) * eased);
    }

    function getRuntimeCycleValues(runtime, elapsedFrames) {
        if (!runtime || runtime.__isRuntimeCase !== true || !runtime.__runtimePointCycles) return null;
        const values = {};
        Object.keys(runtime.__runtimePointCycles).forEach(function(param) {
            const value = computeCycleValue(runtime.__runtimePointCycles[param], elapsedFrames, runtime);
            if (Number.isFinite(value)) values[param] = value;
        });
        return Object.keys(values).length ? values : null;
    }

    function applyRuntimeCycleValues(runtime, elapsedFrames) {
        const values = getRuntimeCycleValues(runtime, elapsedFrames);
        if (!values || !runtime || !runtime.config) return null;
        const previous = {};
        Object.keys(values).forEach(function(param) {
            previous[param] = runtime.config[param];
            runtime.config[param] = values[param];
        });
        return previous;
    }

    function restoreRuntimeCycleValues(runtime, previous) {
        if (!runtime || !runtime.config || !previous) return;
        Object.keys(previous).forEach(function(param) {
            runtime.config[param] = previous[param];
        });
    }

    function verifyZeroStart(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const runtime = createRuntimeWithCycles(targetId, 'a', {}, {
            size: { mode: 'cycle', cycleMultiplier: 1, minValue: 20, maxValue: 90, baseValue: 55 }
        });
        const periodFrames = getAnimationCycleFrames(runtime);
        const start = getRuntimeCycleValues(runtime, 0);
        const half = getRuntimeCycleValues(runtime, periodFrames / 2);
        const end = getRuntimeCycleValues(runtime, periodFrames);
        const ok = start && half && end
            && start.size === 20
            && half.size === 90
            && Math.abs(end.size - 20) < 0.000001;
        return {
            ok: !!ok,
            checks: {
                selectedSlotStartsAtMinimumAtZeroFrame: start ? start.size === 20 : false,
                reachesMaximumAtHalfPeriod: half ? half.size === 90 : false,
                returnsToStartAtOnePeriod: end ? Math.abs(end.size - 20) < 0.000001 : false
            },
            values: { start: start, half: half, end: end }
        };
    }

    function verifyTwoSlotsDoNotShareCycles(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const runtimeA = createRuntimeWithCycles(targetId, 'a', {}, {
            size: { mode: 'cycle', cycleMultiplier: 1, minValue: 10, maxValue: 30, baseValue: 20 }
        });
        const runtimeB = createRuntimeWithCycles(targetId, 'b', {}, {
            size: { mode: 'cycle', cycleMultiplier: 4, minValue: 100, maxValue: 180, baseValue: 140 }
        });
        runtimeB.__runtimePointCycles.size.maxValue = 999;
        const aAtHalf = getRuntimeCycleValues(runtimeA, getAnimationCycleFrames(runtimeA) / 2);
        const bAtHalfA = getRuntimeCycleValues(runtimeB, getAnimationCycleFrames(runtimeA) / 2);
        const separatedDefinitions =
            runtimeA.__runtimePointCycles !== runtimeB.__runtimePointCycles
            && runtimeA.__runtimePointCycles.size.maxValue === 30
            && runtimeB.__runtimePointCycles.size.maxValue === 999;
        const separatedValues = aAtHalf && bAtHalfA && aAtHalf.size !== bAtHalfA.size;
        return {
            ok: !!(separatedDefinitions && separatedValues),
            checks: {
                cycleDefinitionsAreIndependent: separatedDefinitions,
                computedValuesDifferPerSlot: separatedValues
            },
            runtimeAValues: aAtHalf,
            runtimeBValues: bAtHalfA
        };
    }

    function verifyApplyRestoreDoesNotMutateBase(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        const baseCase = Array.isArray(window.cases) ? window.cases[targetId] : window['case' + targetId];
        if (!baseCase || !baseCase.config) return { ok: false, reason: 'base-case-missing' };
        const baseSizeBefore = baseCase.config.size;
        const runtime = createRuntimeWithCycles(targetId, 'a', { size: baseSizeBefore }, {
            size: { mode: 'cycle', cycleMultiplier: 1, minValue: 1, maxValue: 111, baseValue: baseSizeBefore }
        });
        const runtimeSizeBefore = runtime.config.size;
        const previous = applyRuntimeCycleValues(runtime, getAnimationCycleFrames(runtime) / 2);
        const runtimeChanged = runtime.config.size === 111;
        const baseUnchangedDuringApply = baseCase.config.size === baseSizeBefore;
        restoreRuntimeCycleValues(runtime, previous);
        const runtimeRestored = runtime.config.size === runtimeSizeBefore;
        const baseStillUnchanged = baseCase.config.size === baseSizeBefore;
        return {
            ok: runtimeChanged && baseUnchangedDuringApply && runtimeRestored && baseStillUnchanged,
            checks: {
                runtimeReceivesCycleValue: runtimeChanged,
                baseCaseIsUnchangedDuringApply: baseUnchangedDuringApply,
                runtimeRestoresFixedValueAfterFrame: runtimeRestored,
                baseCaseRemainsUnchangedAfterRestore: baseStillUnchanged
            }
        };
    }

    function verifyAll(caseId) {
        const zero = verifyZeroStart(caseId);
        const separation = verifyTwoSlotsDoNotShareCycles(caseId);
        const applyRestore = verifyApplyRestoreDoesNotMutateBase(caseId);
        return {
            ok: zero.ok && separation.ok && applyRestore.ok,
            checks: {
                zeroStart: zero,
                slotSeparation: separation,
                applyRestoreIsolation: applyRestore
            },
            note: 'Runtime周期値の内部検証のみで、画面描画や既存Slider Registryは変更しません。'
        };
    }

    return Object.freeze({
        ALLOWED_CYCLE_MULTIPLIERS: ALLOWED_CYCLE_MULTIPLIERS.slice(),
        attachCycleSnapshot: attachCycleSnapshot,
        createRuntimeWithCycles: createRuntimeWithCycles,
        getRuntimeCycleValues: getRuntimeCycleValues,
        applyRuntimeCycleValues: applyRuntimeCycleValues,
        restoreRuntimeCycleValues: restoreRuntimeCycleValues,
        verifyZeroStart: verifyZeroStart,
        verifyTwoSlotsDoNotShareCycles: verifyTwoSlotsDoNotShareCycles,
        verifyApplyRestoreDoesNotMutateBase: verifyApplyRestoreDoesNotMutateBase,
        verifyAll: verifyAll
    });
})();
