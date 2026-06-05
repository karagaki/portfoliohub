// RuntimeCaseFactory.js
// Phase 1.3-C: 親caseを変更せずに、描画用configを独立保持するRuntimeCase生成器。
// この段階では通常UI・case切替・描画ループへ自動接続しない。
window.RuntimeCaseFactory = (function() {
    'use strict';

    const SUPPORTED_CASE_IDS = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const EXCLUDED_CASE_IDS = Object.freeze([11]);
    let runtimeSerial = 0;

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

    function assertSupportedCaseId(caseId) {
        if (!Number.isInteger(caseId) || !SUPPORTED_CASE_IDS.includes(caseId)) {
            if (EXCLUDED_CASE_IDS.includes(caseId)) {
                throw new Error('case11 is intentionally excluded from RuntimeCase v1.');
            }
            throw new Error('RuntimeCase requires a supported base case id from 0 to 10.');
        }
    }

    function getTemplate(caseId) {
        assertSupportedCaseId(caseId);
        const template = Array.isArray(window.cases) && window.cases[caseId]
            ? window.cases[caseId]
            : window['case' + caseId];
        if (!template || !template.config) {
            throw new Error('Base case template is not available: case' + caseId);
        }
        return template;
    }

    function mergeConfig(baseConfig, overrideConfig) {
        const result = cloneValue(baseConfig || {});
        const override = overrideConfig || {};
        Object.keys(override).forEach(function(key) {
            result[key] = cloneValue(override[key]);
        });
        return result;
    }

    function pointOverrideFromSnapshot(snapshot) {
        if (!snapshot || !snapshot.point || !snapshot.point.fixed) return {};
        return cloneValue(snapshot.point.fixed) || {};
    }

    function createRuntimeCase(caseId, options) {
        const opts = options || {};
        const template = getTemplate(caseId);
        const pointOverride = pointOverrideFromSnapshot(opts.snapshot);
        const directOverride = cloneValue(opts.configOverride || {}) || {};
        const config = mergeConfig(template.config, Object.assign({}, pointOverride, directOverride));
        const runtime = Object.create(template);

        runtimeSerial += 1;
        Object.defineProperties(runtime, {
            __isRuntimeCase: { value: true, enumerable: true },
            runtimeId: { value: 'runtime-case-' + runtimeSerial, enumerable: true },
            baseCaseId: { value: caseId, enumerable: true },
            slotId: { value: typeof opts.slotId === 'string' ? opts.slotId : null, enumerable: true },
            config: { value: config, writable: true, enumerable: true },
            initialConfig: { value: cloneValue(template.initialConfig || {}), writable: true, enumerable: true },
            runtimeState: {
                value: {
                    source: opts.source || 'manual',
                    createdAt: new Date().toISOString()
                },
                writable: true,
                enumerable: true
            }
        });

        return runtime;
    }

    function createFromStoredSlot(caseId, slotId) {
        if (!window.ArtworkSnapshotStore || typeof window.ArtworkSnapshotStore.getSlot !== 'function') {
            throw new Error('ArtworkSnapshotStore is not available.');
        }
        const storedSlot = window.ArtworkSnapshotStore.getSlot(caseId, slotId);
        if (!storedSlot || !storedSlot.snapshot) {
            throw new Error('Stored slot was not found: case' + caseId + '/' + slotId);
        }
        return createRuntimeCase(caseId, {
            slotId: slotId,
            snapshot: storedSlot.snapshot,
            source: 'stored-slot'
        });
    }

    function describe(runtime) {
        if (!runtime || runtime.__isRuntimeCase !== true) {
            return { isRuntimeCase: false };
        }
        return {
            isRuntimeCase: true,
            runtimeId: runtime.runtimeId,
            baseCaseId: runtime.baseCaseId,
            slotId: runtime.slotId,
            identifiedBaseCaseId: typeof window.getBaseCaseIndex === 'function'
                ? window.getBaseCaseIndex(runtime)
                : null,
            config: cloneValue(runtime.config)
        };
    }

    function verifyIsolation(caseId) {
        const targetId = Number.isInteger(caseId) ? caseId : 1;
        assertSupportedCaseId(targetId);
        const template = getTemplate(targetId);
        const originalConfig = cloneValue(template.config);
        const originalSize = originalConfig.size;
        const runtime = createRuntimeCase(targetId, {
            slotId: 'test',
            source: 'verify-isolation',
            configOverride: { size: Number(originalSize || 0) + 999 }
        });

        const runtimeDoesNotShareConfig = runtime.config !== template.config
            && runtime.config.size !== template.config.size
            && template.config.size === originalSize;

        let dynamicUpdateDoesNotMutateTemplate = true;
        if (targetId === 10 && typeof runtime.update === 'function') {
            const beforeTemplateDynamic = {
                n: template.config.n,
                a: template.config.a,
                b: template.config.b
            };
            runtime.update(123);
            dynamicUpdateDoesNotMutateTemplate =
                template.config.n === beforeTemplateDynamic.n
                && template.config.a === beforeTemplateDynamic.a
                && template.config.b === beforeTemplateDynamic.b
                && (
                    runtime.config.n !== beforeTemplateDynamic.n
                    || runtime.config.a !== beforeTemplateDynamic.a
                    || runtime.config.b !== beforeTemplateDynamic.b
                );
        }

        return {
            ok: runtimeDoesNotShareConfig && dynamicUpdateDoesNotMutateTemplate,
            caseId: targetId,
            checks: {
                runtimeConfigIsIndependent: runtimeDoesNotShareConfig,
                dynamicUpdateDoesNotMutateTemplate: dynamicUpdateDoesNotMutateTemplate,
                baseIdentityIsStable: typeof window.getBaseCaseIndex === 'function'
                    ? window.getBaseCaseIndex(runtime) === targetId
                    : false
            },
            runtime: describe(runtime),
            templateConfigAfterTest: cloneValue(template.config)
        };
    }

    function verifyAllSupportedCases() {
        const results = SUPPORTED_CASE_IDS.map(function(caseId) {
            return verifyIsolation(caseId);
        });
        return {
            ok: results.every(function(result) { return result.ok; }),
            supportedCases: SUPPORTED_CASE_IDS.slice(),
            excludedCases: EXCLUDED_CASE_IDS.slice(),
            results: results
        };
    }

    return Object.freeze({
        SUPPORTED_CASE_IDS: SUPPORTED_CASE_IDS.slice(),
        EXCLUDED_CASE_IDS: EXCLUDED_CASE_IDS.slice(),
        createRuntimeCase: createRuntimeCase,
        createFromStoredSlot: createFromStoredSlot,
        describe: describe,
        verifyIsolation: verifyIsolation,
        verifyAllSupportedCases: verifyAllSupportedCases
    });
})();
