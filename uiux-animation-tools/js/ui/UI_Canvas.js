// UI_Canvas.js
window.CanvasResizer = (function() {
    let currentScale;
    let canvasControls = null;
    let canvasControlHost = null;
    let canvasControlFallbackHost = null;

    function initializeCanvasResizer(targetId = 'canvas-size-container') {
        const canvasSizeContainer = document.getElementById(targetId);
        if (!canvasSizeContainer) {
            console.error('Canvas size container not found');
            return;
        }

        createCanvasUI(canvasSizeContainer);
        setupEventListeners(canvasSizeContainer);
        setInitialState(canvasSizeContainer);

        console.log('Canvas size container initialized and displayed');
    }

    function createCanvasUI(container) {
        container.innerHTML = '';
        const content = createContent();

        container.appendChild(content);
        dockCanvasControls();
        container.hidden = true;
        container.style.display = 'none';
    }

    function createHeader() {
        const header = document.createElement('div');
        header.className = 'ui-header';
        header.textContent = '1.キャンバスの設定';
        return header;
    }

    function createContent() {
        const content = document.createElement('div');
        content.className = 'ui-content';
        canvasControlFallbackHost = content;
        if (!canvasControls) {
            canvasControls = document.createElement('div');
            canvasControls.className = 'canvas-control-group';
            canvasControls.appendChild(createBottomControlRow());
        }
        content.appendChild(canvasControls);
        return content;
    }

    function createTrailModeSelect() {
        const select = document.createElement('select');
        select.id = 'trail-mode-select';
        select.hidden = true;
        select.style.display = 'none';

        const optionHistory = document.createElement('option');
        optionHistory.value = 'history';
        optionHistory.textContent = '流線表示';
        select.appendChild(optionHistory);

        const optionAccumulate = document.createElement('option');
        optionAccumulate.value = 'accumulate';
        optionAccumulate.textContent = '残像表示';
        select.appendChild(optionAccumulate);

        const initialMode = getNormalizedTrailMode();
        window.config = window.config || {};
        window.config.renderMode = window.config.renderMode || {};
        window.config.renderMode.trail = initialMode;
        select.value = initialMode;

        return select;
    }

    function createPanelToggleButton(label, panelId) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'glass-panel-quick-toggle-button glass-control-pill';
        button.textContent = label;
        button.dataset.panelId = panelId;
        button.addEventListener('click', () => {
            if (window.UIGlassPanels && typeof window.UIGlassPanels.togglePanelFromBottomButton === 'function') {
                window.UIGlassPanels.togglePanelFromBottomButton(panelId);
            }
            syncPanelToggleButtons();
            requestAnimationFrame(syncPanelToggleButtons);
        });
        return button;
    }

    function createActionToggleButton(label, action) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'glass-panel-quick-toggle-button glass-control-pill';
        button.textContent = label;
        button.dataset.action = action;
        button.addEventListener('click', () => {
            if (!window.UIGlassPanels) return;
            if (action === 'toggle-all' && typeof window.UIGlassPanels.toggleUtilityPanelsVisibility === 'function') {
                window.UIGlassPanels.toggleUtilityPanelsVisibility();
            } else if (action === 'toggle-utility-openclose' && typeof window.UIGlassPanels.toggleUtilityPanelsOpenClose === 'function') {
                window.UIGlassPanels.toggleUtilityPanelsOpenClose();
            }
            syncPanelToggleButtons();
            requestAnimationFrame(syncPanelToggleButtons);
        });
        return button;
    }

    function syncPanelToggleButtons() {
        const root = canvasControlHost || canvasControlFallbackHost || document;
        const buttons = root.querySelectorAll('.glass-panel-quick-toggle-button[data-panel-id]');
        buttons.forEach((button) => {
            const panel = document.getElementById(button.dataset.panelId);
            const isActive = isPanelVisibleForToggle(panel);
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('is-visible', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        const allVisibleIds = [
            'ui-variant-panel',
            'case-comparison',
            'glass-cursor-panel-3',
            'glass-cursor-panel-4',
            'glass-cursor-panel-6',
            'glass-cursor-panel-7'
        ];
        const actionButtons = root.querySelectorAll('.glass-panel-quick-toggle-button[data-action="toggle-all"]');
        actionButtons.forEach((button) => {
            const isActive = allVisibleIds.every((id) => {
                const panel = document.getElementById(id);
                return isPanelVisibleForToggle(panel);
            });
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('is-visible', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function isPanelVisibleForToggle(panel) {
        return !!panel
            && !panel.hidden
            && panel.style.display !== 'none'
            && !panel.classList.contains('glass-forced-hidden')
            && !panel.classList.contains('is-hidden')
            && !panel.classList.contains('glass-panel-hiding')
            && panel.getAttribute('aria-hidden') !== 'true';
    }

    function createTrailModeButton(label, value) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.className = 'canvas-trail-mode-button glass-control-pill';
        button.dataset.trailMode = value;
        button.addEventListener('click', () => setTrailMode(value));
        return button;
    }

    function createBackgroundColorControl() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'canvas-bottom-color-button glass-control-pill';
        button.setAttribute('aria-label', '背景色');
        button.setAttribute('aria-pressed', 'false');
        const swatch = document.createElement('span');
        swatch.className = 'canvas-bottom-color-swatch';

        const colorInput = createCanvasBgColorInput();
        colorInput.className = 'canvas-bottom-color-input';
        colorInput.setAttribute('aria-label', '背景色');
        colorInput.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        button.addEventListener('click', () => {
            colorInput.click();
        });
        button.appendChild(swatch);
        button.appendChild(colorInput);
        syncBackgroundColorPalette();
        return button;
    }

    function createBottomControlRow() {
        const wrap = document.createElement('div');
        wrap.className = 'canvas-bottom-control-wrap';

        const row = document.createElement('div');
        row.className = 'canvas-bottom-control-row';
        row.appendChild(createNextButton());
        row.appendChild(createTrailModeButton('流線表示', 'history'));
        row.appendChild(createTrailModeButton('残像表示', 'accumulate'));
        row.appendChild(createBackgroundColorControl());
        row.appendChild(createResetButton());
        row.appendChild(createTrailModeSelect());

        const quickRow = document.createElement('div');
        quickRow.className = 'glass-panel-quick-toggle-row';
        quickRow.appendChild(createPanelToggleButton('1', 'glass-cursor-panel-3'));
        quickRow.appendChild(createPanelToggleButton('2', 'glass-cursor-panel-4'));
        quickRow.appendChild(createPanelToggleButton('3', 'glass-cursor-panel-6'));
        quickRow.appendChild(createPanelToggleButton('4', 'glass-cursor-panel-7'));
        quickRow.appendChild(createPanelToggleButton('5', 'case-comparison'));
        quickRow.appendChild(createPanelToggleButton('6', 'ui-variant-panel'));
        quickRow.appendChild(createActionToggleButton('d', 'toggle-all'));
        quickRow.appendChild(createActionToggleButton('C', 'toggle-utility-openclose'));

        wrap.appendChild(quickRow);
        wrap.appendChild(row);
        syncPanelToggleButtons();
        return wrap;
    }

    function createNextButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'next-case-btn';
        button.className = 'glass-control-pill';
        button.textContent = '次へ';
        button.addEventListener('click', () => {
            if (window.Button && typeof window.Button.handleNextCase === 'function') {
                window.Button.handleNextCase();
            }
        });
        return button;
    }

    function createCodeExplainButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'glass-panel-code-explain';
        button.className = 'glass-control-pill';
        button.textContent = 'コード解説';
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            if (window.Button && typeof window.Button.openCodeExplain === 'function') {
                window.Button.openCodeExplain();
                requestAnimationFrame(() => {
                    if (window.Button && typeof window.Button.syncCodeExplainToggleButton === 'function') {
                        window.Button.syncCodeExplainToggleButton();
                    }
                });
            }
        });
        if (window.Button && typeof window.Button.syncCodeExplainToggleButton === 'function') {
            requestAnimationFrame(() => window.Button.syncCodeExplainToggleButton());
        }
        return button;
    }

    function createResetButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'glass-panel-reset';
        button.className = 'glass-control-pill';
        button.textContent = '配置リセット';
        return button;
    }

    function setupEventListeners(container) {
        bindCanvasControlEvents(container);

        // クリックイベントはUI_State.jsで一括管理

        console.log('Canvas resizer event listeners set up');
    }

    function setInitialState(container) {
        const colorInput = container.querySelector('#canvas-bg-color-input');
        if (colorInput) {
            colorInput.value = getInitialCanvasBgColor();
        }
    }

    function handleTrailModeChange(event) {
        const value = event.target.value;
        setTrailMode(value);
        syncTrailModeButtons(value);
    }

    function normalizeTrailMode(value) {
        return value === 'accumulate' ? 'accumulate' : value === 'history' ? 'history' : null;
    }

    function getNormalizedTrailMode() {
        try {
            const storedRenderMode = localStorage.getItem('globalRenderMode');
            if (storedRenderMode) {
                const parsedMode = JSON.parse(storedRenderMode);
                const stored = normalizeTrailMode(parsedMode && parsedMode.trail);
                if (stored) return stored;
            }
        } catch (error) {
            console.warn('Failed to read globalRenderMode:', error);
        }
        const configured = normalizeTrailMode(window.config?.renderMode?.trail);
        if (configured) return configured;
        return 'history';
    }

    function setTrailMode(value) {
        const normalizedValue = normalizeTrailMode(value);
        if (!normalizedValue) return;
        window.config = window.config || {};
        window.config.renderMode = window.config.renderMode || {};
        window.config.renderMode.trail = normalizedValue;
        const trailSelect = document.getElementById('trail-mode-select');
        if (trailSelect && trailSelect.value !== normalizedValue) {
            trailSelect.value = normalizedValue;
        }
        try {
            localStorage.setItem('globalRenderMode', JSON.stringify({ trail: normalizedValue }));
        } catch (error) {
            console.warn('Failed to save globalRenderMode:', error);
        }
        syncTrailModeButtons(normalizedValue);
    }

    function syncTrailModeButtons(activeMode = null) {
        const root = canvasControlHost || canvasControlFallbackHost || document;
        const buttons = root.querySelectorAll('.canvas-trail-mode-button');
        const normalizedActiveMode = normalizeTrailMode(activeMode) || getNormalizedTrailMode();
        buttons.forEach((button) => {
            const isActive = button.dataset.trailMode === normalizedActiveMode;
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('is-visible', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function handleCanvasBgColorChange(event) {
        const value = event.target.value;
        if (!value) return;
        setCanvasBackgroundColor(value);
    }

    function setCanvasBackgroundColor(value) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
        window.config = window.config || {};
        window.config.canvasBgColor = value;
        if (typeof window.syncCanvasStageBackground === 'function') {
            window.syncCanvasStageBackground();
        }
        syncGlassControlContrastMode(value);
        if (window.UIGlassPanels && typeof window.UIGlassPanels.updateReadableTextColor === 'function') {
            window.UIGlassPanels.updateReadableTextColor();
        }
        try {
            localStorage.setItem('globalCanvasBgColor', value);
        } catch (error) {
            console.warn('Failed to save globalCanvasBgColor:', error);
        }
    }

    function syncGlassControlContrastMode(colorValue = null) {
        const color = colorValue || getInitialCanvasBgColor();
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;
        const red = parseInt(color.slice(1, 3), 16);
        const green = parseInt(color.slice(3, 5), 16);
        const blue = parseInt(color.slice(5, 7), 16);
        const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        const isLight = brightness >= 0.5;
        document.body.classList.toggle('glass-bg-light', isLight);
        document.body.classList.toggle('glass-bg-dark', !isLight);
        document.body.style.setProperty('--glass-control-bg-luminance', brightness.toFixed(3));
    }

    function syncBackgroundColorPalette() {
        const backgroundColor = getInitialCanvasBgColor();
        syncGlassControlContrastMode(backgroundColor);
        const inputs = document.querySelectorAll('#canvas-bg-color-input');
        inputs.forEach((colorInput) => {
            if (colorInput.value !== backgroundColor) {
                colorInput.value = backgroundColor;
            }
            const button = colorInput.closest('.canvas-bottom-color-button');
            const swatch = button?.querySelector('.canvas-bottom-color-swatch');
            if (swatch) {
                swatch.style.setProperty('--canvas-bottom-color-value', backgroundColor);
            }
            if (button) {
                const isSelected = colorInput.value === backgroundColor;
                button.classList.toggle('selected', isSelected);
                button.classList.toggle('is-selected', isSelected);
                button.setAttribute('aria-pressed', String(isSelected));
            }
        });
        if (window.Color && typeof window.Color.updatePaletteChips === 'function') {
            window.Color.updatePaletteChips();
        }
        if (window.UIGlassPanels && typeof window.UIGlassPanels.updateReadableTextColor === 'function') {
            window.UIGlassPanels.updateReadableTextColor();
        }
    }

    function createCanvasBgColorInput() {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.id = 'canvas-bg-color-input';
        colorInput.value = getInitialCanvasBgColor();
        return colorInput;
    }

    function createControlRow(labelText, control) {
        const row = document.createElement('div');
        row.className = 'canvas-control-row';

        const label = document.createElement('label');
        label.textContent = labelText;
        row.appendChild(label);
        row.appendChild(control);
        return row;
    }

    function bindCanvasControlEvents(root) {
        if (!root) return;
        const trailSelect = root.querySelector('#trail-mode-select');
        const colorInput = root.querySelector('#canvas-bg-color-input');

        if (trailSelect && !trailSelect.dataset.bound) {
            trailSelect.dataset.bound = 'true';
            trailSelect.addEventListener('change', handleTrailModeChange);
            trailSelect.hidden = true;
            trailSelect.setAttribute('aria-hidden', 'true');
            trailSelect.tabIndex = -1;
            trailSelect.style.display = 'none';
        }
        if (colorInput && !colorInput.dataset.bound) {
            colorInput.dataset.bound = 'true';
            colorInput.addEventListener('input', handleCanvasBgColorChange);
        }
        syncTrailModeButtons(trailSelect ? trailSelect.value : null);
        syncBackgroundColorPalette();
    }

    function isGlassVariant() {
        return document.body?.getAttribute('data-ui-variant') === 'variant-1-glass';
    }

    function getInitialCanvasBgColor() {
        if (window.config && window.config.canvasBgColor) {
            return window.config.canvasBgColor;
        }
        try {
            const stored = localStorage.getItem('globalCanvasBgColor');
            if (stored && /^#[0-9A-Fa-f]{6}$/.test(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('Failed to read globalCanvasBgColor:', error);
        }
        return '#e1e1e1';
    }

    function dockCanvasControls() {
        if (!canvasControls) return;
        const glassControlBar = document.getElementById('glass-control-bar');
        if (isGlassVariant() && glassControlBar) {
            if (canvasControls.parentNode !== glassControlBar) {
                glassControlBar.appendChild(canvasControls);
            }
            canvasControlHost = glassControlBar;
            syncPanelToggleButtons();
            return;
        }
        if (canvasControlFallbackHost && canvasControls.parentNode !== canvasControlFallbackHost) {
            canvasControlFallbackHost.appendChild(canvasControls);
        }
        canvasControlHost = canvasControlFallbackHost;
        syncPanelToggleButtons();
    }

    function refreshCanvasControls() {
        dockCanvasControls();
        const colorInput = document.getElementById('canvas-bg-color-input');
        if (colorInput) {
            colorInput.value = getInitialCanvasBgColor();
        }
        syncBackgroundColorPalette();
        syncTrailModeButtons();
    }

    return {
        initialize: initializeCanvasResizer,
        dockToGlassControlBar: dockCanvasControls,
        refreshControls: refreshCanvasControls,
        setBackgroundColor: setCanvasBackgroundColor,
        getTrailMode: getNormalizedTrailMode,
        setTrailMode: setTrailMode,
        syncBackgroundColorPalette: syncBackgroundColorPalette,
        syncGlassControlContrastMode: syncGlassControlContrastMode,
        resize: function(w, h) {
            if (typeof resizeCanvasToViewport === 'function') {
                return resizeCanvasToViewport();
            }
            if (typeof resizeCanvasCentered === 'function') {
                return resizeCanvasCentered(w, h);
            }
        }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    try {
        window.CanvasResizer.initialize();
        console.log('CanvasResizer initialized');
    } catch (error) {
        console.error('CanvasResizer initialization failed:', error);
    }
});
