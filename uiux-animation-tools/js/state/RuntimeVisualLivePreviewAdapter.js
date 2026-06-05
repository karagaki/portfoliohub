// RuntimeVisualLivePreviewAdapter.js
// Phase 4.4: DisplayedColorSnapshotを実描画へ一時的に適用し、自動復元する限定preview。
// - 通常動作では無効。
// - Consoleから startThreeSecondPreview() を明示実行した時だけ有効。
// - 点色と背景色のみを対象にし、流線/残像は残留状態が不可逆になり得るため未適用。
window.RuntimeVisualLivePreviewAdapter = (function() {
    'use strict';

    let activePreview = null;
    let restoreTimer = null;

    function cloneValue(value) {
        if (value === undefined) return undefined;
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (Array.isArray(value)) return value.map(cloneValue);
        if (typeof value === 'object') {
            const copy = {};
            Object.keys(value).forEach(function(key) { copy[key] = cloneValue(value[key]); });
            return copy;
        }
        return value;
    }

    function requireDependencies() {
        if (!window.Color || typeof window.Color.captureDisplayedColorSnapshot !== 'function'
            || typeof window.Color.resolveDisplayedColorSnapshotRgb !== 'function') {
            throw new Error('Displayed color snapshot APIs are required.');
        }
        if (!window.CanvasResizer || typeof window.CanvasResizer.setBackgroundColor !== 'function') {
            throw new Error('Canvas background API is required.');
        }
    }

    function currentBackground() {
        const value = window.config && window.config.canvasBgColor;
        return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#e1e1e1';
    }

    function makePreviewSnapshot(baseSnapshot) {
        const preview = cloneValue(baseSnapshot);
        const previewColors = [
            [18, 116, 255],
            [255, 86, 126],
            [52, 220, 200],
            [255, 202, 60]
        ];
        preview.displaySource = 'runtime-preview-theme-colors';
        preview.paletteSystem = 'engine';
        preview.theme = preview.theme || {};
        preview.theme.activeThemeRenderColors = previewColors;
        preview.theme.activeAssignMode = 'areaLR';
        return preview;
    }

    function clearTimer() {
        if (restoreTimer !== null) {
            window.clearTimeout(restoreTimer);
            restoreTimer = null;
        }
    }

    function restorePreview() {
        if (!activePreview) {
            return { ok: true, restored: false, message: '有効なpreviewはありません' };
        }
        clearTimer();
        const previousBackground = activePreview.before.background;
        activePreview = null;
        window.CanvasResizer.setBackgroundColor(previousBackground);
        return {
            ok: true,
            restored: true,
            message: '点色previewと背景色を元へ戻しました',
            trailModeWasNotModified: true
        };
    }

    function startThreeSecondPreview(caseId) {
        requireDependencies();
        restorePreview();

        const captured = window.Color.captureDisplayedColorSnapshot();
        if (!captured.ok) {
            return {
                ok: false,
                reason: captured.reason,
                message: captured.message || '配色の確定後に確認してください'
            };
        }

        activePreview = {
            caseId: Number.isInteger(caseId) ? caseId : (
                typeof window.getBaseCaseIndex === 'function' ? window.getBaseCaseIndex(window.currentCase) : -1
            ),
            before: {
                displayedColor: cloneValue(captured),
                background: currentBackground()
            },
            applied: {
                displayedColor: makePreviewSnapshot(captured),
                background: '#f2f6ff'
            },
            startedAt: Date.now(),
            autoRestoreMs: 3000
        };

        window.CanvasResizer.setBackgroundColor(activePreview.applied.background);
        restoreTimer = window.setTimeout(function() {
            restorePreview();
        }, activePreview.autoRestoreMs);

        return {
            ok: true,
            previewActive: true,
            autoRestoreMs: activePreview.autoRestoreMs,
            changedTemporarily: ['displayedPointColor', 'canvasBackground'],
            intentionallyNotChanged: ['trailMode'],
            message: '3秒間だけ点色と背景色を変更し、自動で元へ戻します'
        };
    }

    function resolvePointRgb(index, totalPoints, x, y, canvasW, canvasH) {
        if (!activePreview || !activePreview.applied || !activePreview.applied.displayedColor) {
            return null;
        }
        return window.Color.resolveDisplayedColorSnapshotRgb(
            activePreview.applied.displayedColor,
            index,
            totalPoints,
            x,
            y,
            canvasW,
            canvasH
        );
    }

    function getStatus() {
        return activePreview ? {
            active: true,
            caseId: activePreview.caseId,
            startedAt: activePreview.startedAt,
            autoRestoreMs: activePreview.autoRestoreMs,
            backgroundBefore: activePreview.before.background,
            backgroundDuringPreview: activePreview.applied.background,
            trailModeModified: false
        } : {
            active: false,
            trailModeModified: false
        };
    }

    return Object.freeze({
        startThreeSecondPreview: startThreeSecondPreview,
        restorePreview: restorePreview,
        resolvePointRgb: resolvePointRgb,
        getStatus: getStatus
    });
})();
