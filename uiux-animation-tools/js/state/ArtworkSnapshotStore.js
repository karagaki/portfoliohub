// ArtworkSnapshotStore.js
// Phase 1: 登録UIを追加せず、作品設定を caseId + slotId で独立保存する土台のみを提供する。
// 既存case、既存保存、既存遷移、UI表示はこのファイルの読込だけでは変更しない。
window.ArtworkSnapshotStore = (function() {
    'use strict';

    const SCHEMA_VERSION = 1;
    const STORAGE_KEY = 'p5jsArtworkSnapshotStoreV1';
    const BASE_SLOT_ID = '-';
    const EXTRA_SLOT_IDS = ['a', 'b', 'c', 'd', 'e'];
    const ALL_SLOT_IDS = [BASE_SLOT_ID].concat(EXTRA_SLOT_IDS);
    const POINT_STANDARD_KEYS = [
        'count',
        'size',
        'radius',
        'trailLength',
        'morphSpeed',
        'fadeSpeed',
        'pointSequenceSeconds'
    ];
    const COLOR_STORAGE_KEYS = [
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
    ];

    function cloneValue(value) {
        if (value === undefined) return null;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneValue);
        if (typeof value === 'object') {
            const result = {};
            Object.keys(value).forEach((key) => {
                result[key] = cloneValue(value[key]);
            });
            return result;
        }
        return null;
    }

    function readStoredJson(key) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return null;
            try {
                return cloneValue(JSON.parse(raw));
            } catch (error) {
                return raw;
            }
        } catch (error) {
            return null;
        }
    }

    function resolveCase(caseIdOrCase) {
        if (Number.isInteger(caseIdOrCase)) {
            return {
                caseId: caseIdOrCase,
                caseObject: Array.isArray(window.cases) ? window.cases[caseIdOrCase] : window[`case${caseIdOrCase}`]
            };
        }
        const caseObject = caseIdOrCase || window.currentCase || null;
        const caseId = typeof window.getBaseCaseIndex === 'function'
            ? window.getBaseCaseIndex(caseObject)
            : (Array.isArray(window.cases) ? window.cases.indexOf(caseObject) : -1);
        return { caseId, caseObject };
    }

    function getCycleRegistryCaseState(caseId) {
        const registry = window.__sliderCycleStateRegistry;
        if (!registry || !Number.isInteger(caseId)) return {};
        return cloneValue(registry[`case${caseId}`] || {});
    }

    function getExtraParamKeys(caseObject) {
        if (!caseObject || !Array.isArray(caseObject.sliderExtraParamDefs)) return [];
        return caseObject.sliderExtraParamDefs
            .map((entry) => entry && entry.param)
            .filter((param) => typeof param === 'string' && !POINT_STANDARD_KEYS.includes(param));
    }

    function capturePointSnapshot(caseId, caseObject, useInitialConfig) {
        const source = useInitialConfig
            ? (caseObject && caseObject.initialConfig ? caseObject.initialConfig : {})
            : (caseObject && caseObject.config ? caseObject.config : {});
        const extraKeys = getExtraParamKeys(caseObject);
        const fixed = {};
        POINT_STANDARD_KEYS.concat(extraKeys).forEach((param) => {
            if (Object.prototype.hasOwnProperty.call(source, param)) {
                fixed[param] = cloneValue(source[param]);
            }
        });
        return {
            fixed,
            cycles: useInitialConfig ? {} : getCycleRegistryCaseState(caseId),
            extraParams: extraKeys
        };
    }

    function captureColorSnapshot() {
        const storage = {};
        COLOR_STORAGE_KEYS.forEach((key) => {
            storage[key] = readStoredJson(key);
        });
        const engine = window.ColorEngine ? {
            engineEnabled: cloneValue(window.ColorEngine.engineEnabled),
            groupCount: cloneValue(window.ColorEngine.groupCount),
            assignModeGlobal: cloneValue(window.ColorEngine.assignModeGlobal),
            mixMin: cloneValue(window.ColorEngine.mixMin),
            mixMax: cloneValue(window.ColorEngine.mixMax),
            baseColors: cloneValue(window.ColorEngine.baseColors),
            baseSeed: cloneValue(window.ColorEngine.baseSeed)
        } : null;

        return {
            storage,
            enginePublicState: engine,
            // Phase 1ではColorEngine内部の遷移中paletteを直接変更・復元しない。
            applyStatus: 'capture-only-until-color-adapter-is-validated'
        };
    }

    function captureRenderSnapshot() {
        const trailMode = window.config && window.config.renderMode
            ? window.config.renderMode.trail
            : null;
        const background = window.config ? window.config.canvasBgColor : null;
        return {
            trailMode: trailMode === 'accumulate' ? 'accumulate' : 'history',
            canvasBackground: cloneValue(background || readStoredJson('globalCanvasBgColor'))
        };
    }

    function captureSnapshot(caseIdOrCase, options) {
        const opts = options || {};
        const resolved = resolveCase(caseIdOrCase);
        if (!Number.isInteger(resolved.caseId) || resolved.caseId < 0 || !resolved.caseObject) {
            throw new Error('Snapshot capture requires an existing case.');
        }
        return {
            schemaVersion: SCHEMA_VERSION,
            caseId: resolved.caseId,
            point: capturePointSnapshot(resolved.caseId, resolved.caseObject, !!opts.base),
            color: captureColorSnapshot(),
            render: captureRenderSnapshot(),
            transition: {
                pointSequenceSeconds: cloneValue(
                    (opts.base && resolved.caseObject.initialConfig
                        ? resolved.caseObject.initialConfig.pointSequenceSeconds
                        : resolved.caseObject.config && resolved.caseObject.config.pointSequenceSeconds)
                )
            },
            metadata: {
                capturedAs: opts.base ? 'base' : 'draft',
                capturedAt: new Date().toISOString()
            }
        };
    }

    function createEmptyDocument() {
        return {
            schemaVersion: SCHEMA_VERSION,
            cases: {},
            activeSelection: null,
            presentationSequences: []
        };
    }

    function loadDocument() {
        const stored = readStoredJson(STORAGE_KEY);
        return stored && stored.schemaVersion === SCHEMA_VERSION ? stored : createEmptyDocument();
    }

    function saveDocument(documentValue) {
        const validated = validateDocument(documentValue);
        if (!validated.valid) {
            throw new Error(`Snapshot document is invalid: ${validated.errors.join(', ')}`);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneValue(documentValue)));
        return cloneValue(documentValue);
    }

    function ensureCaseEntry(documentValue, caseId) {
        const key = String(caseId);
        if (!documentValue.cases[key]) {
            documentValue.cases[key] = { base: null, slots: {} };
        }
        return documentValue.cases[key];
    }

    function ensureBaseOnDocument(documentValue, caseId) {
        const entry = ensureCaseEntry(documentValue, caseId);
        if (!entry.base) {
            entry.base = {
                slotId: BASE_SLOT_ID,
                locked: true,
                snapshot: captureSnapshot(caseId, { base: true })
            };
        }
        return entry.base;
    }

    function ensureBaseSnapshot(caseId) {
        const documentValue = loadDocument();
        const base = ensureBaseOnDocument(documentValue, caseId);
        saveDocument(documentValue);
        return cloneValue(base);
    }

    function getFreeSlotId(caseId) {
        const documentValue = loadDocument();
        const entry = ensureCaseEntry(documentValue, caseId);
        return EXTRA_SLOT_IDS.find((slotId) => !entry.slots[slotId]) || null;
    }

    function saveSlot(caseId, slotId, snapshot) {
        if (!EXTRA_SLOT_IDS.includes(slotId)) {
            throw new Error('Additional slotId must be one of a, b, c, d, e.');
        }
        const documentValue = loadDocument();
        const entry = ensureCaseEntry(documentValue, caseId);
        ensureBaseOnDocument(documentValue, caseId);
        if (entry.slots[slotId]) {
            throw new Error('Registered slots are immutable in Phase 1. Use an empty slot.');
        }
        entry.slots[slotId] = {
            slotId,
            locked: false,
            snapshot: cloneValue(snapshot),
            createdOrder: Object.keys(entry.slots).length + 1
        };
        saveDocument(documentValue);
        return cloneValue(entry.slots[slotId]);
    }

    function captureDraftToNextSlot(caseId) {
        const freeSlotId = getFreeSlotId(caseId);
        if (!freeSlotId) {
            return { ok: false, reason: 'slot-limit', message: '登録上限です｜最大5件' };
        }
        const snapshot = captureSnapshot(caseId, { base: false });
        return { ok: true, caseId, slotId: freeSlotId, saved: saveSlot(caseId, freeSlotId, snapshot) };
    }

    function getSlot(caseId, slotId) {
        const documentValue = loadDocument();
        const entry = documentValue.cases[String(caseId)];
        if (!entry) return null;
        if (slotId === BASE_SLOT_ID) return cloneValue(entry.base);
        return cloneValue(entry.slots[slotId] || null);
    }

    function deleteSlot(caseId, slotId) {
        if (slotId === BASE_SLOT_ID) return { ok: false, reason: 'base-locked' };
        if (!EXTRA_SLOT_IDS.includes(slotId)) return { ok: false, reason: 'unknown-slot' };
        const documentValue = loadDocument();
        const entry = documentValue.cases[String(caseId)];
        if (!entry || !entry.slots[slotId]) return { ok: false, reason: 'missing-slot' };
        delete entry.slots[slotId];
        saveDocument(documentValue);
        return { ok: true };
    }

    function setActiveSelection(caseId, slotId, isDraft) {
        if (!ALL_SLOT_IDS.includes(slotId)) throw new Error('Unknown slotId.');
        const documentValue = loadDocument();
        documentValue.activeSelection = { caseId, slotId, isDraft: !!isDraft };
        saveDocument(documentValue);
        return cloneValue(documentValue.activeSelection);
    }

    function validateDocument(documentValue) {
        const errors = [];
        if (!documentValue || documentValue.schemaVersion !== SCHEMA_VERSION) errors.push('schemaVersion');
        if (!documentValue || typeof documentValue.cases !== 'object') errors.push('cases');
        Object.entries((documentValue && documentValue.cases) || {}).forEach(([caseId, entry]) => {
            if (entry.base && (!entry.base.locked || entry.base.slotId !== BASE_SLOT_ID)) {
                errors.push(`case${caseId}.base`);
            }
            const slotIds = Object.keys((entry && entry.slots) || {});
            if (slotIds.some((id) => !EXTRA_SLOT_IDS.includes(id))) {
                errors.push(`case${caseId}.slots`);
            }
            if (slotIds.length > EXTRA_SLOT_IDS.length) {
                errors.push(`case${caseId}.slotLimit`);
            }
        });
        return { valid: errors.length === 0, errors };
    }

    function getApplyPlan(caseId, slotId) {
        const item = getSlot(caseId, slotId);
        if (!item || !item.snapshot) return { ok: false, reason: 'missing-slot' };
        return {
            ok: true,
            caseId,
            slotId,
            point: cloneValue(item.snapshot.point),
            color: cloneValue(item.snapshot.color),
            render: cloneValue(item.snapshot.render),
            transition: cloneValue(item.snapshot.transition),
            applyStatus: 'phase1-plan-only-no-runtime-mutation'
        };
    }

    function selfTest(caseId) {
        const targetCaseId = Number.isInteger(caseId) ? caseId : 1;
        const beforeDocument = loadDocument();
        const testA = captureSnapshot(targetCaseId, { base: false });
        const testB = cloneValue(testA);
        if (testB.point && testB.point.fixed) {
            testB.point.fixed.size = Number(testB.point.fixed.size || 0) + 999;
        }
        const independentClone = !testA.point || !testA.point.fixed
            || testA.point.fixed.size !== testB.point.fixed.size;
        return {
            ok: independentClone && validateDocument(beforeDocument).valid,
            schemaVersion: SCHEMA_VERSION,
            caseId: targetCaseId,
            checks: {
                snapshotCloneIsIndependent: independentClone,
                currentStoredDocumentIsValid: validateDocument(beforeDocument).valid,
                noUiOrRuntimeMutationPerformed: true
            },
            note: 'Phase 1 selfTest does not save slots or alter the drawing.'
        };
    }

    return Object.freeze({
        SCHEMA_VERSION,
        STORAGE_KEY,
        BASE_SLOT_ID,
        EXTRA_SLOT_IDS: EXTRA_SLOT_IDS.slice(),
        captureSnapshot,
        captureColorSnapshot,
        captureRenderSnapshot,
        ensureBaseSnapshot,
        getFreeSlotId,
        captureDraftToNextSlot,
        getSlot,
        deleteSlot,
        setActiveSelection,
        loadDocument,
        validateDocument,
        getApplyPlan,
        selfTest
    });
})();
