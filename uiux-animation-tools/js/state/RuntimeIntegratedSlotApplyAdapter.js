// RuntimeIntegratedSlotApplyAdapter.js
// Phase 6: 点・周期・実表示色・背景色をcase別の - / a〜e slotとして登録・選択・削除する。
// 流線/残像は次工程まで未適用。slotデータは専用localStorageへ保存する。
window.RuntimeIntegratedSlotApplyAdapter = (function() {
    'use strict';

    const STORAGE_KEY = 'p5jsRegisteredArtworkSlotsV1';
    const SCHEMA_VERSION = 1;
    const BASE_SLOT_ID = '-';
    const EXTRA_SLOT_IDS = Object.freeze(['a', 'b', 'c', 'd', 'e']);
    const ALL_SLOT_IDS = Object.freeze([BASE_SLOT_ID].concat(EXTRA_SLOT_IDS));
    const DEFAULT_CASES_URL = 'assets/data/default-cases.json';
    const DEFAULT_CASES_SCHEMA = 'uiux-animation-tools.default-cases';
    let activeVisualSlot = null;
    let draftState = null;
    let intendedRuntimeId = null;
    let pendingRegistration = null;
    let pendingRegistrationTimer = null;
    let feedbackState = null;
    let feedbackTimer = null;

    function cloneValue(value) {
        if (value === undefined) return undefined;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneValue);
        if (typeof value === 'object') {
            const result = {};
            Object.keys(value).forEach(function(key) { result[key] = cloneValue(value[key]); });
            return result;
        }
        return value;
    }

    function requireDependencies() {
        if (!window.RuntimeCaseFactory || !window.RuntimeCycleSnapshotAdapter
            || !window.Color || typeof window.Color.captureDisplayedColorSnapshot !== 'function'
            || typeof window.Color.resolveDisplayedColorSnapshotRgb !== 'function'
            || !window.CanvasResizer || typeof window.CanvasResizer.setBackgroundColor !== 'function') {
            throw new Error('登録slot基盤の依存APIが不足しています。');
        }
    }

    function readBundledDefaultCasesSync() {
        try {
            const request = new XMLHttpRequest();
            request.open('GET', DEFAULT_CASES_URL, false);
            request.send(null);
            if ((request.status >= 200 && request.status < 300) || request.status === 0) {
                const payload = JSON.parse(request.responseText);
                if (payload && payload.schema === DEFAULT_CASES_SCHEMA) return payload;
            }
        } catch (_) {}
        return null;
    }

    function getStoredSlotIds(record) {
        if (!record || !record.slots || typeof record.slots !== 'object') return [];
        return EXTRA_SLOT_IDS.filter(function(slotId) { return Boolean(record.slots[slotId]); });
    }

    function normalizeStoreShape(store) {
        if (!store || typeof store !== 'object' || Array.isArray(store)) {
            return { schemaVersion: SCHEMA_VERSION, cases: {} };
        }
        const normalized = cloneValue(store);
        if (!Number.isFinite(Number(normalized.schemaVersion))) {
            normalized.schemaVersion = SCHEMA_VERSION;
        }
        if (!normalized.cases || typeof normalized.cases !== 'object' || Array.isArray(normalized.cases)) {
            normalized.cases = {};
        }
        return normalized;
    }

    function loadStore() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw == null) {
            const bundled = readBundledDefaultCasesSync();
            const defaultStore = bundled && bundled.registeredSlots
                && bundled.registeredSlots.schemaVersion === SCHEMA_VERSION
                && bundled.registeredSlots.cases
                ? cloneValue(bundled.registeredSlots)
                : null;
            if (defaultStore) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
                return defaultStore;
            }
            return { schemaVersion: SCHEMA_VERSION, cases: {} };
        }
        try {
            const stored = normalizeStoreShape(JSON.parse(raw));
            if (stored && stored.cases) return stored;
        } catch (_) {
            return { schemaVersion: SCHEMA_VERSION, cases: {} };
        }
        return { schemaVersion: SCHEMA_VERSION, cases: {} };
    }

    function saveStore(store) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneValue(store)));
        dispatchStateChanged();
    }

    function dispatchStateChanged() {
        document.dispatchEvent(new CustomEvent('registeredSlotStateChanged', {
            detail: getStatus()
        }));
    }

    function publishFeedback(message, kind, durationMs) {
        feedbackState = {
            message: message,
            kind: kind || 'info'
        };
        if (feedbackTimer !== null) {
            window.clearTimeout(feedbackTimer);
            feedbackTimer = null;
        }
        dispatchStateChanged();
        if (durationMs !== 0) {
            feedbackTimer = window.setTimeout(function() {
                feedbackState = null;
                feedbackTimer = null;
                dispatchStateChanged();
            }, Number.isFinite(Number(durationMs)) ? Number(durationMs) : 2400);
        }
    }

    function clearPendingRegistration() {
        pendingRegistration = null;
        if (pendingRegistrationTimer !== null) {
            window.clearTimeout(pendingRegistrationTimer);
            pendingRegistrationTimer = null;
        }
    }

    function getBaseCase(caseId) {
        const base = Array.isArray(window.cases) ? window.cases[caseId] : window['case' + caseId];
        return base && base.config ? base : null;
    }

    function currentCaseId() {
        return typeof window.getBaseCaseIndex === 'function'
            ? window.getBaseCaseIndex(window.currentCase)
            : Number(window.state);
    }

    function currentBackground() {
        const value = window.config && window.config.canvasBgColor;
        return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#e1e1e1';
    }

    function currentCycles(caseId) {
        if (window.currentCase && window.currentCase.__isRuntimeCase === true
            && window.currentCase.__runtimePointCycles) {
            return cloneValue(window.currentCase.__runtimePointCycles);
        }
        const registry = window.__sliderCycleStateRegistry || {};
        return cloneValue(registry['case' + caseId] || {});
    }

    function currentCursorState() {
        const radius = Number.parseFloat(localStorage.getItem('cursorUI_cursor-radius'));
        const strength = Number.parseFloat(localStorage.getItem('cursorUI_cursor-strength'));
        const pullStrength = Number.parseFloat(localStorage.getItem('cursorUI_pull-strength'));
        if (window.CursorUI && typeof window.CursorUI.getSettings === 'function') {
            return cloneValue(window.CursorUI.getSettings());
        }
        const state = {
            cursorUI_showCustomCursor: localStorage.getItem('cursorUI_showCustomCursor') !== 'false',
            cursorUI_continuousEffect: localStorage.getItem('cursorUI_continuousEffect') === 'true',
            cursorUI_pullEffect: localStorage.getItem('cursorUI_pullEffect') === 'true',
            'cursorUI_cursor-radius': Number.isFinite(radius) ? radius : 500,
            'cursorUI_cursor-strength': Number.isFinite(strength) ? strength : 0.5,
            'cursorUI_pull-strength': Number.isFinite(pullStrength) ? pullStrength : 0
        };
        return state;
    }

    function currentColorEnginePublicSettings() {
        if (!window.ColorEngine || typeof window.ColorEngine.captureStablePaletteSnapshot !== 'function') return null;
        const snapshot = window.ColorEngine.captureStablePaletteSnapshot();
        if (!snapshot || snapshot.ok !== true) return null;
        return cloneValue(snapshot.publicSettings || null);
    }

    function colorEngineSettingsDiffer(nextSettings) {
        if (!nextSettings) return false;
        const current = currentColorEnginePublicSettings();
        if (!current) return true;
        try {
            const pickComparable = (settings) => {
                if (!settings || typeof settings !== 'object') return settings;
                const copy = cloneValue(settings);
                if (copy && typeof copy === 'object') {
                    delete copy.baseSeed;
                }
                return copy;
            };
            return JSON.stringify(pickComparable(current)) !== JSON.stringify(pickComparable(nextSettings));
        } catch (error) {
            return true;
        }
    }

    function representativeRgb(displayed) {
        const colors = displayed && displayed.theme && displayed.theme.activeThemeRenderColors;
        if (Array.isArray(colors) && Array.isArray(colors[0])) return colors[0].slice(0, 3);
        const engine = displayed && displayed.engineStablePalette;
        if (engine && engine.ok && engine.palette && Array.isArray(engine.palette.baseColors)
            && Array.isArray(engine.palette.baseColors[0])) {
            return engine.palette.baseColors[0].slice(0, 3);
        }
        return Array.isArray(displayed && displayed.caseBaseColor)
            ? displayed.caseBaseColor.slice(0, 3)
            : null;
    }

    function captureCurrentComposite(caseId) {
        requireDependencies();
        if (window.isTransitioning) {
            return { ok: false, reason: 'transition-in-progress', message: '遷移中は登録できません' };
        }
        const id = Number.isInteger(caseId) ? caseId : currentCaseId();
        if (id < 0 || id === 11) {
            return { ok: false, reason: 'unsupported-case', message: 'このcaseは現在登録対象外です' };
        }
        const caseObject = window.currentCase && currentCaseId() === id
            ? window.currentCase
            : getBaseCase(id);
        if (!caseObject || !caseObject.config) {
            return { ok: false, reason: 'case-missing', message: 'case設定を取得できません' };
        }
        const displayed = window.Color.captureDisplayedColorSnapshot();
        if (!displayed.ok) return displayed;

        return {
            ok: true,
            schemaVersion: SCHEMA_VERSION,
            caseId: id,
            point: {
                fixed: cloneValue(caseObject.config),
                cycles: currentCycles(id)
            },
            displayedColor: cloneValue(displayed),
            colorEngineSettings: displayed && displayed.engineStablePalette && displayed.engineStablePalette.ok === true
                ? cloneValue(displayed.engineStablePalette.publicSettings || null)
                : null,
            cursorState: currentCursorState(),
            render: {
                canvasBackground: currentBackground(),
                trailMode: window.CanvasResizer && typeof window.CanvasResizer.getTrailMode === 'function'
                    ? window.CanvasResizer.getTrailMode()
                    : ((window.config && window.config.renderMode && window.config.renderMode.trail) || 'history')
            },
            metadata: { capturedAt: new Date().toISOString() }
        };
    }

    function ensureCaseRecord(store, caseId, baseCandidate) {
        const key = String(caseId);
        if (!store.cases[key]) {
            store.cases[key] = { base: null, slots: {} };
        }
        if (!store.cases[key].base && baseCandidate && baseCandidate.ok) {
            const base = cloneValue(baseCandidate);
            base.slotId = BASE_SLOT_ID;
            store.cases[key].base = base;
        }
        return store.cases[key];
    }

    function getFreeSlotId(record) {
        return EXTRA_SLOT_IDS.find(function(slotId) { return !record.slots[slotId]; }) || null;
    }

    function saveCapturedToNextSlot(caseId, captured) {
        clearPendingRegistration();
        const store = loadStore();
        const record = ensureCaseRecord(store, caseId, captured);
        const freeSlotId = getFreeSlotId(record);
        if (!freeSlotId) {
            publishFeedback('登録上限です｜最大5件', 'error');
            return { ok: false, reason: 'slot-limit', message: '登録上限です｜最大5件' };
        }
        const saved = cloneValue(captured);
        saved.slotId = freeSlotId;
        saved.metadata.createdOrder = EXTRA_SLOT_IDS.indexOf(freeSlotId) + 1;
        record.slots[freeSlotId] = saved;
        saveStore(store);
        const selected = selectRegisteredSlot(caseId, freeSlotId, {
            reason: 'newly-registered-slot',
            allowInterrupt: true
        });
        publishFeedback(freeSlotId + ' を登録', 'success');
        return selected;
    }

    function tryPendingRegistration() {
        if (!pendingRegistration) return;
        if (Date.now() > pendingRegistration.expiresAt) {
            clearPendingRegistration();
            publishFeedback('登録できませんでした', 'error');
            return;
        }
        if (currentCaseId() !== pendingRegistration.caseId) {
            clearPendingRegistration();
            publishFeedback('登録待機を解除', 'info');
            return;
        }
        const captured = captureCurrentComposite(pendingRegistration.caseId);
        if (captured.ok) {
            const caseId = pendingRegistration.caseId;
            clearPendingRegistration();
            saveCapturedToNextSlot(caseId, captured);
            return;
        }
        pendingRegistrationTimer = window.setTimeout(tryPendingRegistration, 120);
    }

    function queueRegistration(caseId) {
        clearPendingRegistration();
        pendingRegistration = {
            caseId: caseId,
            expiresAt: Date.now() + 15000
        };
        publishFeedback('遷移完了後に登録します', 'pending', 0);
        pendingRegistrationTimer = window.setTimeout(tryPendingRegistration, 120);
        return {
            ok: true,
            pending: true,
            message: '遷移完了後に登録します'
        };
    }

    function registerCurrentSlot() {
        const caseId = currentCaseId();
        const captured = captureCurrentComposite(caseId);
        if (!captured.ok) {
            if (captured.reason === 'transition-in-progress'
                || captured.reason === 'case-or-color-transition-in-progress'
                || captured.reason === 'palette-transition-in-progress') {
                return queueRegistration(caseId);
            }
            publishFeedback(captured.message || '登録できません', 'error');
            return captured;
        }
        return saveCapturedToNextSlot(caseId, captured);
    }

    function hasCaseRecord(caseId) {
        const record = loadStore().cases[String(caseId)];
        return Boolean(record && (record.base || getStoredSlotIds(record).length > 0));
    }

    function getSlotsForCase(caseId) {
        const record = loadStore().cases[String(caseId)];
        if (!record) return { base: false, slots: [] };
        const slotIds = getStoredSlotIds(record);
        return {
            base: Boolean(record.base || slotIds.length > 0),
            slots: slotIds
        };
    }

    function getSlot(caseId, slotId) {
        const record = loadStore().cases[String(caseId)];
        if (!record) return null;
        return cloneValue(slotId === BASE_SLOT_ID ? record.base : record.slots[slotId]);
    }

    function createRuntimeFromSlot(item) {
        const runtime = window.RuntimeCaseFactory.createRuntimeCase(item.caseId, {
            slotId: item.slotId,
            snapshot: { point: cloneValue(item.point) },
            source: 'registered-slot-ui'
        });
        window.RuntimeCycleSnapshotAdapter.attachCycleSnapshot(runtime, item.point.cycles || {}, {
            startFrame: Number(window.frameCount || 0)
        });
        const rgb = representativeRgb(item.displayedColor);
        if (rgb) runtime.config.color = rgb;
        runtime.__integratedVisualSnapshot = cloneValue(item.displayedColor);
        runtime.__integratedBackground = item.render.canvasBackground;
        return runtime;
    }

    function selectRegisteredSlot(caseId, slotId, options) {
        requireDependencies();
        if (!ALL_SLOT_IDS.includes(slotId)) {
            return { ok: false, reason: 'unknown-slot', message: '選択できない登録です' };
        }
        // slot選択は既存の interrupt 付き順次遷移に任せ、遷移中でも切替可能にする。
        const item = getSlot(caseId, slotId);
        if (!item) {
            if (slotId === BASE_SLOT_ID && getBaseCase(caseId)) {
                window.TableNext.switchToCase(caseId);
                return { ok: true, caseId: caseId, slotId: BASE_SLOT_ID, baseWithoutStoredSlot: true };
            }
            return { ok: false, reason: 'missing-slot', message: '登録がありません' };
        }

        const runtime = createRuntimeFromSlot(item);
        activeVisualSlot = {
            caseId: caseId,
            slotId: slotId,
            displayedColor: cloneValue(item.displayedColor),
            background: item.render.canvasBackground,
            runtimeId: runtime.runtimeId,
            isDraft: false
        };
        draftState = null;
        if (window.Color && typeof window.Color.syncDisplayedSnapshotPanel === 'function') {
            window.Color.syncDisplayedSnapshotPanel(item.displayedColor);
        }
        if (item.colorEngineSettings && window.ColorEngine && typeof window.ColorEngine.applySettings === 'function'
            && colorEngineSettingsDiffer(item.colorEngineSettings)) {
            window.ColorEngine.applySettings(cloneValue(item.colorEngineSettings), 'registered-slot');
            if (window.Color && typeof window.Color.updateColorEngineUI === 'function') {
                window.Color.updateColorEngineUI();
            }
            if (window.Color && typeof window.Color.updatePaletteSystemUI === 'function') {
                window.Color.updatePaletteSystemUI();
            }
        }
        if (item.cursorState && window.CursorUI && typeof window.CursorUI.applySettings === 'function') {
            window.CursorUI.applySettings(item.cursorState, { persist: true });
        }
        window.CanvasResizer.setBackgroundColor(item.render.canvasBackground);
        if (window.CanvasResizer && typeof window.CanvasResizer.setTrailMode === 'function'
            && item.render && item.render.trailMode) {
            window.CanvasResizer.setTrailMode(item.render.trailMode);
        }
        intendedRuntimeId = runtime.runtimeId;
        window.prepareNextCase(runtime, { interrupt: true, pointSequence: true });
        dispatchStateChanged();
        return {
            ok: true,
            caseId: caseId,
            slotId: slotId,
            runtimeId: runtime.runtimeId,
            changed: ['point.fixed', 'point.cycles', 'displayedPointColor', 'canvasBackground', 'trailMode']
        };
    }

    function canUpdate() {
        const selected = activeVisualSlot
            && EXTRA_SLOT_IDS.includes(activeVisualSlot.slotId)
            && activeVisualSlot.caseId === currentCaseId();
        if (!selected) {
            return { ok: false, reason: 'not-updatable', message: '更新できる登録が選択されていません' };
        }
        if (pendingRegistration) {
            return { ok: false, reason: 'pending-registration', message: '登録待機中' };
        }
        return { ok: true, message: '選択中の登録を更新' };
    }

    function updateSelectedSlot() {
        const allowed = canUpdate();
        if (!allowed.ok) return allowed;

        const caseId = activeVisualSlot.caseId;
        const slotId = activeVisualSlot.slotId;
        const captured = captureCurrentComposite(caseId);
        if (!captured.ok) {
            publishFeedback(captured.message || '更新できません', 'error');
            return captured;
        }

        const store = loadStore();
        const record = store.cases[String(caseId)];
        if (!record || !record.slots[slotId]) {
            return { ok: false, reason: 'missing-slot', message: '登録がありません' };
        }

        const updated = cloneValue(captured);
        updated.slotId = slotId;
        updated.metadata.createdOrder = record.slots[slotId].metadata
            ? record.slots[slotId].metadata.createdOrder
            : EXTRA_SLOT_IDS.indexOf(slotId) + 1;
        updated.metadata.updatedAt = new Date().toISOString();
        record.slots[slotId] = updated;
        saveStore(store);

        const result = selectRegisteredSlot(caseId, slotId, {
            reason: 'updated-selected-slot',
            allowInterrupt: true
        });
        publishFeedback(slotId + ' を更新', 'success');
        return result;
    }

    function deleteSelectedSlot() {
        if (!activeVisualSlot || !EXTRA_SLOT_IDS.includes(activeVisualSlot.slotId)) {
            return { ok: false, reason: 'not-deletable', message: '削除できる登録が選択されていません' };
        }
        const caseId = activeVisualSlot.caseId;
        const slotId = activeVisualSlot.slotId;
        const store = loadStore();
        const record = store.cases[String(caseId)];
        if (!record || !record.slots[slotId]) {
            return { ok: false, reason: 'missing-slot', message: '登録がありません' };
        }
        delete record.slots[slotId];
        saveStore(store);
        return selectRegisteredSlot(caseId, BASE_SLOT_ID, {
            reason: 'slot-deleted',
            skipTransitionBlock: true
        });
    }

    function markDraft(kind) {
        if (!activeVisualSlot) return;

        if (!activeVisualSlot.isDraft) {
            activeVisualSlot.isDraft = true;
            draftState = { caseId: activeVisualSlot.caseId, source: kind || 'edit' };
        }

        // 点を先に編集して既にDraftになっていても、配色を触った瞬間に
        // 登録slotの固定色overrideを解除し、現在の配色UIを実描画へ反映する。
        if (kind === 'color') {
            activeVisualSlot.displayedColor = null;
            if (draftState) draftState.source = 'color';
        }

    }

    function canRegister() {
        const caseId = currentCaseId();
        if (pendingRegistration) return { ok: false, reason: 'pending-registration', message: '登録待機中' };
        if (caseId < 0 || caseId === 11) return { ok: false, reason: 'unsupported-case', message: 'このcaseは登録対象外です' };
        const current = getSlotsForCase(caseId);
        if (current.slots.length >= EXTRA_SLOT_IDS.length) {
            return { ok: false, reason: 'slot-limit', message: '登録上限です｜最大5件' };
        }
        return { ok: true, message: '現在の設定を登録' };
    }

    function canDelete() {
        const ok = activeVisualSlot && EXTRA_SLOT_IDS.includes(activeVisualSlot.slotId) && !activeVisualSlot.isDraft;
        return { ok: Boolean(ok), message: ok ? '選択中の登録を削除' : '削除できる登録がありません' };
    }

    function resolvePointRgb(index, totalPoints, x, y, canvasW, canvasH) {
        if (!activeVisualSlot || !activeVisualSlot.displayedColor) return null;
        return window.Color.resolveDisplayedColorSnapshotRgb(
            activeVisualSlot.displayedColor, index, totalPoints, x, y, canvasW, canvasH
        );
    }

    function applyRuntimeCycleValues(runtime, absoluteFrame) {
        if (!runtime || runtime.__isRuntimeCase !== true || !runtime.__runtimePointCycles) return null;
        const startFrame = runtime.__runtimeCycleClock && Number.isFinite(Number(runtime.__runtimeCycleClock.startFrame))
            ? Number(runtime.__runtimeCycleClock.startFrame) : Number(absoluteFrame || 0);
        const elapsed = Math.max(0, Number(absoluteFrame || 0) - startFrame);
        return window.RuntimeCycleSnapshotAdapter.applyRuntimeCycleValues(runtime, elapsed);
    }

    function restoreRuntimeCycleValues(runtime, previous) {
        if (runtime && previous) window.RuntimeCycleSnapshotAdapter.restoreRuntimeCycleValues(runtime, previous);
    }

    function clearActiveVisualLayer() {
        activeVisualSlot = null;
        draftState = null;
        dispatchStateChanged();
    }

    function getStatus() {
        const store = loadStore();
        return {
            schemaVersion: SCHEMA_VERSION,
            activeVisualSlot: cloneValue(activeVisualSlot),
            draftState: cloneValue(draftState),
            pendingRegistration: cloneValue(pendingRegistration),
            feedback: cloneValue(feedbackState),
            cases: cloneValue(store.cases)
        };
    }

    // slot自身の遷移完了・再遷移では選択状態を保持する。
    // 通常case番号/次へへの移動時のみ、UI側から明示的に解除する。
    function leaveRegisteredSlotMode() {
        intendedRuntimeId = null;
        clearPendingRegistration();
        activeVisualSlot = null;
        draftState = null;
        feedbackState = null;
        dispatchStateChanged();
    }

    function handlePossibleEditEvent(event) {
        const target = event.target;
        if (!target || !activeVisualSlot || !target.closest) return;
        if (target.closest('#slider-container, #glass-cursor-panel-4')) {
            markDraft('point');
            return;
        }
        if (target.closest('#color-container, #glass-cursor-panel-3')) {
            // UI側のクリック処理で配色状態が更新された直後にoverrideを外す。
            window.setTimeout(function() { markDraft('color'); }, 0);
            return;
        }
        if (target.closest('.canvas-trail-mode-button, #trail-mode-select, #canvas-bg-color-input')) {
            window.setTimeout(function() { markDraft('render'); }, 0);
        }
    }

    document.addEventListener('input', handlePossibleEditEvent, true);
    document.addEventListener('change', handlePossibleEditEvent, true);
    document.addEventListener('click', handlePossibleEditEvent, true);

    return Object.freeze({
        STORAGE_KEY: STORAGE_KEY,
        EXTRA_SLOT_IDS: EXTRA_SLOT_IDS.slice(),
        registerCurrentSlot: registerCurrentSlot,
        selectRegisteredSlot: selectRegisteredSlot,
        deleteSelectedSlot: deleteSelectedSlot,
        hasCaseRecord: hasCaseRecord,
        getSlotsForCase: getSlotsForCase,
        getSlot: getSlot,
        canRegister: canRegister,
        canUpdate: canUpdate,
        updateSelectedSlot: updateSelectedSlot,
        canDelete: canDelete,
        markDraft: markDraft,
        resolvePointRgb: resolvePointRgb,
        applyRuntimeCycleValues: applyRuntimeCycleValues,
        restoreRuntimeCycleValues: restoreRuntimeCycleValues,
        clearActiveVisualLayer: clearActiveVisualLayer,
        leaveRegisteredSlotMode: leaveRegisteredSlotMode,
        clearAllRegisteredSlotsForTest: function() {
            localStorage.removeItem(STORAGE_KEY);
            leaveRegisteredSlotMode();
            return { ok: true, message: '登録slotをすべて削除しました。再読み込みしてください。' };
        },
        getStatus: getStatus
    });
})();
