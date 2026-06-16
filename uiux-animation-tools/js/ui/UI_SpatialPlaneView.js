// UI_SpatialPlaneView.js
// 既存ストロークの色・太さ・向きを維持し、位置だけを3D平面へ投影する検証機能。
// UIパネルの配置・開閉・ドラッグ・ドック整列は UI_GlassPanels に委譲する。
// ガイドは描画中心に接した X/Y/Z 軸線のみ。別の面・背景・格子は描かない。
(function() {
    "use strict";

    const PANEL_ID = "glass-cursor-panel-7";
    const STORAGE_KEY = "uiSpatialPlaneState";
    const state = {
        enabled: false,
        guidesVisible: true,
        pitch: 0,
        yaw: 0,
        roll: 0,
        draggingCanvas: false,
        canvasPointerId: null,
        lastCanvasX: 0,
        lastCanvasY: 0,
        clearRequested: false,
        billboardSegments: true,
        fpsTimer: null
    };

    const MAX_PITCH = 72;
    const MAX_YAW = 72;
    const MAX_ROLL = 180;

    let stage = null;
    let holder = null;
    let guideCanvas = null;
    let guideContext = null;
    let panel = null;
    let enableButton = null;
    let guideButton = null;
    let fpsReadout = null;
    const sliders = {};

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function radians(deg) {
        return deg * Math.PI / 180;
    }

    function normalizeStateValue(value, fallback, min, max) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return clamp(parsed, min, max);
    }

    function normalizeBooleanValue(value, fallback) {
        if (value === true || value === 1 || value === '1' || value === 'true') return true;
        if (value === false || value === 0 || value === '0' || value === 'false') return false;
        return fallback;
    }

    function readStoredSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw == null) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    function exportSettings() {
        return {
            enabled: state.enabled,
            guidesVisible: state.guidesVisible,
            pitch: state.pitch,
            yaw: state.yaw,
            roll: state.roll
        };
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(exportSettings()));
            return true;
        } catch (_) {
            return false;
        }
    }

    function applySettings(nextState, options) {
        const settings = nextState && typeof nextState === "object" ? nextState : {};
        state.enabled = normalizeBooleanValue(settings.enabled, false);
        state.guidesVisible = normalizeBooleanValue(settings.guidesVisible, true);
        state.pitch = normalizeStateValue(settings.pitch, 0, -MAX_PITCH, MAX_PITCH);
        state.yaw = normalizeStateValue(settings.yaw, 0, -MAX_YAW, MAX_YAW);
        state.roll = normalizeStateValue(settings.roll, 0, -MAX_ROLL, MAX_ROLL);
        if (!options || options.persist !== false) {
            saveSettings();
        }
        applyUi();
        return true;
    }

    function loadSettings() {
        const stored = readStoredSettings();
        if (!stored) {
            applyUi();
            return false;
        }
        return applySettings(stored, { persist: false });
    }

    function getCanvas() {
        return holder ? holder.querySelector("canvas") : null;
    }

    function getDrawingSize() {
        const canvas = getCanvas();
        return {
            width: Number(window.width) || (canvas ? canvas.width : 1) || 1,
            height: Number(window.height) || (canvas ? canvas.height : 1) || 1
        };
    }

    function rotatedWorldPoint(point) {
        const size = getDrawingSize();
        const cx = size.width / 2;
        const cy = size.height / 2;
        let x = Number(point.x) - cx;
        let y = Number(point.y) - cy;
        let z = 0;

        const roll = radians(state.roll);
        const rollX = x * Math.cos(roll) - y * Math.sin(roll);
        const rollY = x * Math.sin(roll) + y * Math.cos(roll);
        x = rollX;
        y = rollY;

        const yaw = radians(state.yaw);
        const yawX = x * Math.cos(yaw) + z * Math.sin(yaw);
        const yawZ = -x * Math.sin(yaw) + z * Math.cos(yaw);
        x = yawX;
        z = yawZ;

        const pitch = radians(state.pitch);
        const pitchY = y * Math.cos(pitch) - z * Math.sin(pitch);
        const pitchZ = y * Math.sin(pitch) + z * Math.cos(pitch);
        y = pitchY;
        z = pitchZ;

        return { x: cx + x, y: cy + y, z: z };
    }

    function projectPoint(point) {
        if (!state.enabled || !point) return { x: point.x, y: point.y, z: 0 };
        return rotatedWorldPoint(point);
    }

    function projectScreenFacingSegment(pointA, pointB) {
        if (!state.enabled || !state.billboardSegments || !pointA || !pointB) {
            return { pointA: pointA, pointB: pointB };
        }
        const mid = {
            x: (pointA.x + pointB.x) / 2,
            y: (pointA.y + pointB.y) / 2
        };
        const projectedMid = projectPoint(mid);
        const halfDx = (pointB.x - pointA.x) / 2;
        const halfDy = (pointB.y - pointA.y) / 2;
        return {
            pointA: { x: projectedMid.x - halfDx, y: projectedMid.y - halfDy, z: projectedMid.z },
            pointB: { x: projectedMid.x + halfDx, y: projectedMid.y + halfDy, z: projectedMid.z }
        };
    }

    function requestClear() {
        state.clearRequested = true;
    }

    function consumeClearRequested() {
        if (!state.clearRequested) return false;
        state.clearRequested = false;
        return true;
    }

    function resizeGuideCanvas() {
        if (!guideCanvas || !stage || !holder || !guideContext) return;
        const source = getCanvas();
        if (!source) return;
        const drawing = getDrawingSize();
        const sourceRect = source.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const cssWidth = sourceRect.width;
        const cssHeight = sourceRect.height;
        const dpr = Math.min(2, window.devicePixelRatio || 1);

        // ガイドは描画canvasの中心・表示範囲へ重ねるだけで、描画領域やレイアウトを作らない。
        guideCanvas.style.left = (sourceRect.left - stageRect.left) + "px";
        guideCanvas.style.top = (sourceRect.top - stageRect.top) + "px";
        guideCanvas.style.width = cssWidth + "px";
        guideCanvas.style.height = cssHeight + "px";
        guideCanvas.width = Math.max(1, Math.round(drawing.width * dpr));
        guideCanvas.height = Math.max(1, Math.round(drawing.height * dpr));
        guideContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawGuides();
    }

    function drawAxisLine(a, b, color) {
        // 軸は背景面を作らず、認識しやすい線のみを表示する。
        guideContext.strokeStyle = "rgba(18, 22, 28, 0.74)";
        guideContext.lineWidth = 4.5;
        guideContext.beginPath();
        guideContext.moveTo(a.x, a.y);
        guideContext.lineTo(b.x, b.y);
        guideContext.stroke();

        guideContext.strokeStyle = color;
        guideContext.lineWidth = 2.3;
        guideContext.beginPath();
        guideContext.moveTo(a.x, a.y);
        guideContext.lineTo(b.x, b.y);
        guideContext.stroke();
    }

    function drawAxisLabel(text, point, color) {
        guideContext.font = "700 12px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
        guideContext.lineWidth = 3;
        guideContext.strokeStyle = "rgba(18,22,28,0.84)";
        guideContext.strokeText(text, point.x + 7, point.y - 6);
        guideContext.fillStyle = color;
        guideContext.fillText(text, point.x + 7, point.y - 6);
    }

    function drawGuides() {
        if (!guideContext || !guideCanvas) return;
        const drawing = getDrawingSize();
        guideContext.clearRect(0, 0, drawing.width, drawing.height);
        if (!state.enabled || !state.guidesVisible) return;

        const cx = drawing.width / 2;
        const cy = drawing.height / 2;
        const origin = projectPoint({ x: cx, y: cy });
        const len = clamp(Math.round(Math.min(drawing.width, drawing.height) * 0.10), 54, 100);
        const xEnd = projectPoint({ x: cx + len, y: cy });
        const yEnd = projectPoint({ x: cx, y: cy + len });

        const yaw = radians(state.yaw);
        const pitch = radians(state.pitch);
        const roll = radians(state.roll);
        const zVector = {
            x: Math.sin(yaw) * Math.cos(roll) + Math.sin(pitch) * Math.sin(roll),
            y: -Math.sin(pitch) * Math.cos(yaw)
        };
        const zEnd = {
            x: origin.x + zVector.x * len,
            y: origin.y + zVector.y * len
        };

        drawAxisLine(origin, xEnd, "rgba(227,44,44,0.98)");
        drawAxisLine(origin, yEnd, "rgba(27,183,78,0.98)");
        drawAxisLine(origin, zEnd, "rgba(43,106,238,0.98)");

        guideContext.fillStyle = "rgba(247,249,251,0.98)";
        guideContext.beginPath();
        guideContext.arc(origin.x, origin.y, 4.5, 0, Math.PI * 2);
        guideContext.fill();
        guideContext.strokeStyle = "rgba(18,22,28,0.82)";
        guideContext.lineWidth = 1.7;
        guideContext.stroke();

        drawAxisLabel("X", xEnd, "rgb(227,44,44)");
        drawAxisLabel("Y", yEnd, "rgb(27,170,73)");
        drawAxisLabel("Z", zEnd, "rgb(43,96,223)");
    }

    function updateSliderViews() {
        [["x", state.pitch], ["y", state.yaw], ["z", state.roll]].forEach(function(entry) {
            const control = sliders[entry[0]];
            if (!control) return;
            control.input.value = String(Math.round(entry[1]));
            control.output.textContent = Math.round(entry[1]) + "°";
        });
    }

    function applyUi() {
        if (enableButton) {
            enableButton.classList.toggle("is-active", state.enabled);
            enableButton.setAttribute("aria-pressed", String(state.enabled));
            enableButton.textContent = state.enabled ? "ON" : "OFF";
        }
        if (guideButton) {
            guideButton.classList.toggle("is-active", state.guidesVisible);
            guideButton.setAttribute("aria-pressed", String(state.guidesVisible));
        }
        if (stage) {
            stage.classList.toggle("spatial-plane-drag-enabled", state.enabled);
            stage.classList.toggle("spatial-plane-dragging", state.draggingCanvas);
        }
        updateSliderViews();
        drawGuides();
    }

    function resetView() {
        state.pitch = 0;
        state.yaw = 0;
        state.roll = 0;
        requestClear();
        saveSettings();
        applyUi();
    }

    function createButton(label, className, handler) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        button.addEventListener("click", function(event) {
            event.stopPropagation();
            handler();
        });
        return button;
    }

    function makeSlider(key, label, min, max) {
        const group = document.createElement("div");
        group.className = "slider-group";

        const layout = document.createElement("div");
        layout.className = "slider-layout";

        const labelEl = document.createElement("label");
        labelEl.className = "slider-label";
        labelEl.textContent = label;

        const container = document.createElement("div");
        container.className = "slider-container";

        const input = document.createElement("input");
        input.type = "range";
        input.className = "slider";
        input.min = String(min);
        input.max = String(max);
        input.step = "1";
        input.value = "0";

        const output = document.createElement("div");
        output.className = "slider-value";
        output.textContent = "0°";

        input.addEventListener("input", function(event) {
            event.stopPropagation();
            const value = Number(input.value);
            if (key === "x") state.pitch = value;
            if (key === "y") state.yaw = value;
            if (key === "z") state.roll = value;
            requestClear();
            saveSettings();
            applyUi();
        });

        container.appendChild(input);
        layout.appendChild(labelEl);
        layout.appendChild(container);
        layout.appendChild(output);
        group.appendChild(layout);
        sliders[key] = { input: input, output: output };
        return group;
    }

    function populatePanel(panelId) {
        panel = document.getElementById(panelId || PANEL_ID);
        if (!panel || panel.dataset.spatialContentReady === "true") return false;
        panel.dataset.spatialContentReady = "true";
        panel.innerHTML = "";

        const header = document.createElement("div");
        header.className = "ui-header";
        header.innerHTML = "<span>4.空間</span>";

        const content = document.createElement("div");
        content.className = "ui-content";

        const actions = document.createElement("div");
        actions.className = "spatial-panel-actions";
        enableButton = createButton("OFF", "spatial-action-button spatial-enable-button", function() {
            state.enabled = !state.enabled;
            state.draggingCanvas = false;
            requestClear();
            saveSettings();
            applyUi();
        });
        guideButton = createButton("軸表示", "spatial-action-button is-active", function() {
            state.guidesVisible = !state.guidesVisible;
            saveSettings();
            applyUi();
        });
        const resetButton = createButton("正面へ戻す", "spatial-action-button", resetView);
        actions.appendChild(enableButton);
        actions.appendChild(guideButton);
        actions.appendChild(resetButton);
        content.appendChild(actions);

        content.appendChild(makeSlider("x", "X 回転", -MAX_PITCH, MAX_PITCH));
        content.appendChild(makeSlider("y", "Y 回転", -MAX_YAW, MAX_YAW));
        content.appendChild(makeSlider("z", "Z 回転", -MAX_ROLL, MAX_ROLL));


        panel.appendChild(header);
        panel.appendChild(content);
        loadSettings();
        applyUi();
        return true;
    }

    function isUiTarget(target) {
        return !!(target && target.closest && target.closest(
            "#" + PANEL_ID + ", button, input, select, textarea, a, " +
            "#ui-variant-panel, #case-comparison, #glass-control-bar, .glass-settings-panel"
        ));
    }

    function isDrawingAreaEvent(event) {
        if (!stage || !event || isUiTarget(event.target)) return false;
        const canvas = getCanvas();
        if (!canvas) return false;
        const rect = canvas.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    function onCanvasPointerDown(event) {
        if (!state.enabled || event.button !== 0 || !isDrawingAreaEvent(event)) return;
        state.draggingCanvas = true;
        state.canvasPointerId = event.pointerId;
        state.lastCanvasX = event.clientX;
        state.lastCanvasY = event.clientY;
        stage.setPointerCapture(event.pointerId);
        applyUi();
        event.preventDefault();
        event.stopPropagation();
    }

    function onCanvasPointerMove(event) {
        if (!state.draggingCanvas || state.canvasPointerId !== event.pointerId) return;
        const dx = event.clientX - state.lastCanvasX;
        const dy = event.clientY - state.lastCanvasY;
        state.lastCanvasX = event.clientX;
        state.lastCanvasY = event.clientY;
        state.yaw = clamp(state.yaw + dx * 0.18, -MAX_YAW, MAX_YAW);
        state.pitch = clamp(state.pitch - dy * 0.18, -MAX_PITCH, MAX_PITCH);
        requestClear();
        saveSettings();
        applyUi();
        event.preventDefault();
        event.stopPropagation();
    }

    function finishCanvasDrag(event) {
        if (!state.draggingCanvas || event.pointerId !== state.canvasPointerId) return;
        if (stage.hasPointerCapture(event.pointerId)) {
            stage.releasePointerCapture(event.pointerId);
        }
        state.draggingCanvas = false;
        state.canvasPointerId = null;
        applyUi();
        event.preventDefault();
        event.stopPropagation();
    }

    function initialize() {
        stage = document.getElementById("canvas-stage");
        holder = document.getElementById("sketch-holder");
        if (!stage || !holder) return;

        if (!guideCanvas) {
            guideCanvas = document.createElement("canvas");
            guideCanvas.className = "spatial-plane-guide-layer";
            guideCanvas.setAttribute("aria-hidden", "true");
            // sketch-holder に追加すると canvas セレクタや描画面レイアウトへ混入するため、
            // stage 上の透明なガイドレイヤーとしてのみ配置する。
            stage.appendChild(guideCanvas);
            guideContext = guideCanvas.getContext("2d", { alpha: true });
        }

        resizeGuideCanvas();
        const canvas = getCanvas();
        if (canvas) canvas.style.touchAction = "none";
        stage.addEventListener("pointerdown", onCanvasPointerDown, true);
        stage.addEventListener("pointermove", onCanvasPointerMove, true);
        stage.addEventListener("pointerup", finishCanvasDrag, true);
        stage.addEventListener("pointercancel", finishCanvasDrag, true);
        window.addEventListener("resize", resizeGuideCanvas);

        if (!state.fpsTimer) {
            state.fpsTimer = window.setInterval(function() {
                if (!fpsReadout || typeof window.frameRate !== "function") return;
                const fps = Number(window.frameRate());
                fpsReadout.textContent = Number.isFinite(fps) ? "FPS " + Math.round(fps) : "FPS --";
            }, 700);
        }
        loadSettings();
        applyUi();
    }

    window.SpatialPlaneView = {
        initialize: initialize,
        populatePanel: populatePanel,
        loadSettings: loadSettings,
        saveSettings: saveSettings,
        exportSettings: exportSettings,
        applySettings: applySettings,
        projectRenderPoint: projectPoint,
        projectScreenFacingSegment: projectScreenFacingSegment,
        consumeClearRequested: consumeClearRequested,
        getState: function() {
            return {
                enabled: state.enabled,
                guidesVisible: state.guidesVisible,
                pitch: state.pitch,
                yaw: state.yaw,
                roll: state.roll,
                billboardSegments: state.billboardSegments,
                mode: "existing-stroke-screen-facing-docked-panel-guide-only"
            };
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
