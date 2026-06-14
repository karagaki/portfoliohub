window.Slider = window.Slider || {};

(function(Slider) {
    const PARAM_DEFS = [
        { param: 'count', label: '点の数', min: 1, max: 50, step: 1, decimals: 0 },
        { param: 'size', label: '点の大きさ', min: 1, max: 200, step: 0.01, decimals: 2 },
        { param: 'radius', label: '全体サイズ', min: 0, max: 700, step: 0.01, decimals: 2 },
        { param: 'trailLength', label: '軌跡の幅', min: 2, max: 300, step: 1, decimals: 0 },
        { param: 'morphSpeed', label: '点の速度', min: 0.0001, max: 0.2, step: 0.0001, decimals: 4 },
        { param: 'fadeSpeed', label: '墨の幅', min: 0.0005, max: 0.1, step: 0.0001, decimals: 4 },
        { param: 'pointSequenceSeconds', label: '順次遷移', min: 0, max: 20, step: 0.1, decimals: 1, supportsCycle: false }
    ];
    const CYCLE_MULTIPLIERS = [0.5, 1, 4];
    const POINT_SEQUENCE_LOCK_PARAM = 'pointSequenceSeconds';

    function isPointSequenceLockEnabled() {
        return window.__pointSequenceSliderLocked !== false;
    }

    function setPointSequenceLockEnabled(locked) {
        window.__pointSequenceSliderLocked = locked !== false;
        applyPointSequenceLockState();
    }

    function applyPointSequenceLockState() {
        const locked = isPointSequenceLockEnabled();
        document.querySelectorAll(`[id="${POINT_SEQUENCE_LOCK_PARAM}-group"]`).forEach((sliderGroup) => {
            sliderGroup.classList.toggle('is-point-sequence-locked', locked);
            sliderGroup.dataset.pointSequenceLocked = locked ? 'true' : 'false';
            sliderGroup.querySelectorAll(`[id="${POINT_SEQUENCE_LOCK_PARAM}-slider"]`).forEach((slider) => {
                slider.disabled = locked;
                slider.setAttribute('aria-disabled', locked ? 'true' : 'false');
            });
            sliderGroup.querySelectorAll('[data-point-sequence-lock-button]').forEach((button) => {
                button.classList.toggle('is-locked', locked);
                button.setAttribute('aria-pressed', locked ? 'true' : 'false');
                button.setAttribute('aria-label', locked ? '順次遷移スライダーのロックを解除' : '順次遷移スライダーをロック');
                button.title = locked ? '順次遷移スライダーのロックを解除' : '順次遷移スライダーをロック';
            });
        });
    }

    if (typeof window.__pointSequenceSliderLocked !== 'boolean') {
        window.__pointSequenceSliderLocked = true;
    }

    function getCycleMultiplier(state) {
        const value = Number(state && state.cycleMultiplier);
        return CYCLE_MULTIPLIERS.includes(value) ? value : null;
    }

    function normalizeCycleState(state) {
        if (!state || typeof state !== 'object') return state;
        const multiplier = getCycleMultiplier(state);
        if (state.mode === 'cycle' && multiplier) {
            state.cycleMultiplier = multiplier;
        } else if (state.mode === 'cycle') {
            /*
             * 旧版の10/25/50秒周期はcaseの1周期と意味が異なるため、
             * 誤った速度で復元せず固定へ安全に戻す。
             */
            state.mode = 'fixed';
            state.cycleMultiplier = null;
        }
        state.periodSec = null;
        return state;
    }

    function getAnimationCycleFrames(currentCase = getActiveCase()) {
        if (!currentCase) return 60;

        if (typeof currentCase.getAnimationCycleFrames === 'function') {
            const customFrames = Number(currentCase.getAnimationCycleFrames());
            if (Number.isFinite(customFrames) && customFrames > 0) {
                return Math.max(1, Math.round(customFrames));
            }
        }

        /*
         * case0〜10 の主運動は morphSpeed による1回転／1往復を基準にする。
         * morphSpeed 自体が周期変化中でも、周期長が毎frame伸縮しないよう
         * 固定基準値(baseValue)があればそれを優先する。
         */
        const stateMap = getCycleState(currentCase);
        const speedState = stateMap && stateMap.morphSpeed;
        const baseSpeed = speedState && Number.isFinite(Number(speedState.baseValue))
            ? Number(speedState.baseValue)
            : Number(currentCase.config && currentCase.config.morphSpeed);
        if (Number.isFinite(baseSpeed) && Math.abs(baseSpeed) > 0) {
            return Math.max(1, Math.round((Math.PI * 2) / Math.abs(baseSpeed)));
        }
        return 60;
    }

    function getBaseParamDef(param) {
        return PARAM_DEFS.find((entry) => entry.param === param) || null;
    }

    function getCaseExtraParamDefs(currentCase = getActiveCase()) {
        const extras = currentCase && Array.isArray(currentCase.sliderExtraParamDefs)
            ? currentCase.sliderExtraParamDefs
            : [];
        return extras.filter((entry) => entry && entry.param && entry.label);
    }

    function getActiveParamDefs(currentCase = getActiveCase()) {
        const extras = getCaseExtraParamDefs(currentCase);
        if (!extras.length) return PARAM_DEFS.slice();
        const knownParams = new Set(PARAM_DEFS.map((entry) => entry.param));
        return PARAM_DEFS.concat(extras.filter((entry) => !knownParams.has(entry.param)));
    }

    function getParamDef(param, currentCase = getActiveCase()) {
        const baseDef = getBaseParamDef(param) || getCaseExtraParamDefs(currentCase).find((entry) => entry.param === param) || null;
        if (!baseDef) return null;
        const overrides = currentCase && currentCase.sliderParamOverrides;
        const override = overrides && overrides[param] ? overrides[param] : null;
        return override ? Object.assign({}, baseDef, override, { param: baseDef.param, label: baseDef.label }) : baseDef;
    }

    function getParamDefsKey(currentCase = getActiveCase()) {
        return getActiveParamDefs(currentCase).map((entry) => entry.param).join('|');
    }

    function syncSliderBoundsForParam(param, currentCase = getActiveCase()) {
        const def = getParamDef(param, currentCase);
        if (!def) return;
        document.querySelectorAll(`[id="${param}-slider"]`).forEach((slider) => {
            if (slider.dataset.sliderRole !== 'fixed') return;
            slider.min = def.min;
            slider.max = def.max;
            slider.step = def.step;
            const nextValue = clamp(toNumber(slider.value, def.min), def.min, def.max);
            slider.value = roundToStep(nextValue, def);
        });
    }

    function getDecimalPlaces(param) {
        const def = getParamDef(param);
        return def ? def.decimals : 2;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function toNumber(value, fallback = 0) {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function normalizeBounds(minValue, maxValue, def) {
        const min = Number.isFinite(minValue) ? minValue : def.min;
        const max = Number.isFinite(maxValue) ? maxValue : def.max;
        return min <= max ? { min, max } : { min: max, max: min };
    }

    function formatValue(param, value) {
        return toNumber(value, 0).toFixed(getDecimalPlaces(param));
    }

    function roundToStep(value, def) {
        const step = Number.isFinite(Number(def.step)) && Number(def.step) > 0 ? Number(def.step) : 1;
        const rounded = def.min + Math.round((value - def.min) / step) * step;
        const decimals = getDecimalPlaces(def.param);
        const fixed = Number(rounded.toFixed(decimals));
        if (def.decimals === 0 || def.param === 'count' || def.param === 'trailLength') {
            return Math.round(fixed);
        }
        return fixed;
    }

    function getCaseKey(currentCase = getActiveCase()) {
        if (!currentCase) return null;
        if (typeof window.getBaseCaseIndex === 'function') {
            const caseIndex = window.getBaseCaseIndex(currentCase);
            if (caseIndex >= 0) return `case${caseIndex}`;
        }
        if (Number.isInteger(window.state)) {
            return `case${window.state}`;
        }
        if (currentCase.caseId && /^case\d+$/.test(currentCase.caseId)) {
            return currentCase.caseId;
        }
        return null;
    }

    function getCycleStateRegistry() {
        if (!window.__sliderCycleStateRegistry) {
            window.__sliderCycleStateRegistry = {};
        }
        return window.__sliderCycleStateRegistry;
    }

    function getCycleState(currentCase) {
        if (!currentCase) return null;

        // Phase 5: Runtime slot は親caseの周期設定を共有せず、自身の周期定義を表示・実行する。
        if (currentCase.__isRuntimeCase === true && currentCase.__runtimePointCycles) {
            return currentCase.__runtimePointCycles;
        }

        const caseKey = getCaseKey(currentCase);
        if (!caseKey) return null;
        const registry = getCycleStateRegistry();
        if (!registry[caseKey]) {
            registry[caseKey] = {};
        }
        return registry[caseKey];
    }

    function getActiveCase() {
        if (window.currentCase) return window.currentCase;
        if (Array.isArray(window.cases) && window.cases[window.state]) return window.cases[window.state];
        if (window.case0) return window.case0;
        try {
            return typeof currentCase !== 'undefined' ? currentCase : null;
        } catch (error) {
            return null;
        }
    }

    function getParamState(currentCase, param) {
        const stateMap = getCycleState(currentCase);
        if (!stateMap) return null;
        const def = getParamDef(param, currentCase);
        if (!def) return null;
        if (!stateMap[param]) {
            const baseValue = Slider.getCaseValue(currentCase, param, def.min);
            stateMap[param] = {
                mode: 'fixed',
                cycleMultiplier: null,
                minValue: Number.NaN,
                maxValue: Number.NaN,
                baseValue
            };
        }
        return normalizeCycleState(stateMap[param]);
    }

    function setCycleButtonsForParam(param, state) {
        const multiplier = getCycleMultiplier(state);
        const modeText = state && state.mode === 'cycle' && multiplier
            ? `[${multiplier}周期]`
            : '[固定]';
        document.querySelectorAll(`[data-slider-cycle-button="${param}"]`).forEach((button) => {
            button.textContent = modeText;
            button.dataset.sliderCycleMode = state && state.mode === 'cycle' ? 'cycle' : 'fixed';
        });
    }

    function refreshSliderRow(param, currentCase = getActiveCase()) {
        const state = getParamState(currentCase, param);
        if (!state) return;
        setCycleButtonsForParam(param, state);
        Slider.syncCycleInputs(param);
        Slider.updateSliderValue(param, Slider.getCaseValue(currentCase, param, 0), { syncInputs: true });
    }

    function applyModeToRow(param) {
        const currentCase = getActiveCase();
        const state = getParamState(currentCase, param);
        if (!state) return;
        document.querySelectorAll(`[id="${param}-group"]`).forEach((sliderGroup) => {
            const fixedSlider = sliderGroup.querySelector(`[data-slider-role="fixed"]`);
            const cycleContainer = sliderGroup.querySelector(`[data-slider-role="cycle"]`);
            if (!fixedSlider || !cycleContainer) return;
            const isCycle = state.mode === 'cycle';
            fixedSlider.hidden = isCycle;
            cycleContainer.hidden = !isCycle;
            fixedSlider.style.display = isCycle ? 'none' : '';
            cycleContainer.style.display = isCycle ? 'block' : 'none';
        });
        refreshSliderRow(param, currentCase);
    }

    function ensureRangeSpan(value, def) {
        const safeValue = clamp(value, def.min, def.max);
        const span = Math.max((def.max - def.min) * 0.18, def.step * 12);
        const minValue = clamp(safeValue - span / 2, def.min, def.max);
        const maxValue = clamp(safeValue + span / 2, def.min, def.max);
        return normalizeBounds(minValue, maxValue, def);
    }

    function ensureCycleStyles() {
        if (document.getElementById('slider-cycle-custom-range-style')) return;
        const style = document.createElement('style');
        style.id = 'slider-cycle-custom-range-style';
        style.textContent = `
            #slider-container .cycle-container,
            #glass-cursor-panel-4 .cycle-container {
                width: 100%;
                height: 14px;
                position: relative;
                display: block;
            }
            #slider-container .cycle-container[hidden],
            #glass-cursor-panel-4 .cycle-container[hidden] {
                display: none !important;
            }
            #glass-cursor-panel-4 .cycle-container {
                width: 120px;
                max-width: 120px;
            }
            #slider-container .cycle-track,
            #slider-container .cycle-selected-range,
            #glass-cursor-panel-4 .cycle-track,
            #glass-cursor-panel-4 .cycle-selected-range {
                position: absolute;
                top: 50%;
                height: 3px;
                transform: translateY(-50%);
                border-radius: 2px;
            }
            #slider-container .cycle-track,
            #glass-cursor-panel-4 .cycle-track {
                left: 0;
                right: 0;
                background: #999;
            }
            #slider-container .cycle-selected-range,
            #glass-cursor-panel-4 .cycle-selected-range {
                background: #7070ff;
            }
            #slider-container .cycle-handle,
            #glass-cursor-panel-4 .cycle-handle {
                position: absolute !important;
                top: 50% !important;
                width: 9px !important;
                min-width: 9px !important;
                height: 9px !important;
                min-height: 9px !important;
                padding: 0 !important;
                border: 1px solid #e8e8e8 !important;
                border-radius: 50% !important;
                background: #000 !important;
                cursor: pointer;
                transform: translate(-50%, -50%) !important;
                touch-action: none;
            }
            #slider-container .cycle-min-handle,
            #glass-cursor-panel-4 .cycle-min-handle {
                z-index: 3;
            }
            #slider-container .cycle-max-handle,
            #glass-cursor-panel-4 .cycle-max-handle {
                z-index: 4;
            }
            #slider-container .cycle-min-handle.is-near,
            #glass-cursor-panel-4 .cycle-min-handle.is-near {
                transform: translate(calc(-50% - 3px), -50%) !important;
            }
            #slider-container .cycle-max-handle.is-near,
            #glass-cursor-panel-4 .cycle-max-handle.is-near {
                transform: translate(calc(-50% + 3px), -50%) !important;
            }
            #slider-container .slider-value.is-cycle-range,
            #glass-cursor-panel-4 .slider-value.is-cycle-range {
                line-height: 0.9 !important;
                white-space: normal !important;
            }
            #slider-container .slider-value.is-cycle-range .cycle-value-line,
            #glass-cursor-panel-4 .slider-value.is-cycle-range .cycle-value-line {
                display: block;
                line-height: 0.9;
            }
        `;
        document.head.appendChild(style);
    }

    function updateCycleVisuals(param, state, def) {
        if (!state || !def) return;

        const bounds = normalizeBounds(toNumber(state.minValue, def.min), toNumber(state.maxValue, def.max), def);
        const minValue = clamp(bounds.min, def.min, def.max);
        const maxValue = clamp(bounds.max, def.min, def.max);
        const span = def.max - def.min || 1;
        const minPct = clamp(((minValue - def.min) / span) * 100, 0, 100);
        const maxPct = clamp(((maxValue - def.min) / span) * 100, 0, 100);

        document.querySelectorAll(`[id="${param}-group"]`).forEach((sliderGroup) => {
            const cycleContainer = sliderGroup.querySelector(`[data-slider-role="cycle"]`);
            if (!cycleContainer) return;

            const selectedRange = cycleContainer.querySelector('[data-cycle-part="selected-range"]');
            const minHandle = cycleContainer.querySelector('[data-cycle-part="min-handle"]');
            const maxHandle = cycleContainer.querySelector('[data-cycle-part="max-handle"]');
            if (!selectedRange || !minHandle || !maxHandle) return;

            selectedRange.style.left = `${minPct}%`;
            selectedRange.style.width = `${Math.max(0, maxPct - minPct)}%`;
            minHandle.style.left = `${minPct}%`;
            maxHandle.style.left = `${maxPct}%`;

            if (Math.abs(maxPct - minPct) < 3) {
                minHandle.classList.add('is-near');
                maxHandle.classList.add('is-near');
                minHandle.style.zIndex = '4';
                maxHandle.style.zIndex = '5';
            } else {
                minHandle.classList.remove('is-near');
                maxHandle.classList.remove('is-near');
                minHandle.style.zIndex = '3';
                maxHandle.style.zIndex = '4';
            }
        });
    }

    function valueFromPointer(event, track, def) {
        const rect = track.getBoundingClientRect();
        const width = rect.width || 1;
        const ratio = clamp((event.clientX - rect.left) / width, 0, 1);
        return clamp(roundToStep(def.min + ratio * (def.max - def.min), def), def.min, def.max);
    }

    function startCycleDrag(event, param, handleName) {
        const currentCase = getActiveCase();
        const state = getParamState(currentCase, param);
        const def = getParamDef(param);
        const sliderGroup = event.currentTarget ? event.currentTarget.closest('.slider-group') : null;
        const track = sliderGroup ? sliderGroup.querySelector('[data-cycle-part="track"]') : null;
        if (!state || !def || !track) return;

        event.preventDefault();
        const target = event.currentTarget;
        if (target && typeof target.setPointerCapture === 'function') {
            target.setPointerCapture(event.pointerId);
        }

        const move = (moveEvent) => {
            const nextValue = valueFromPointer(moveEvent, track, def);
            if (handleName === 'min') {
                Slider.updateCycleBounds(param, nextValue, state.maxValue);
            } else {
                Slider.updateCycleBounds(param, state.minValue, nextValue);
            }
        };
        const end = (upEvent) => {
            if (target && typeof target.releasePointerCapture === 'function') {
                try {
                    target.releasePointerCapture(upEvent.pointerId);
                } catch (error) {}
            }
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
        };

        move(event);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
    }

    Slider.getCaseValue = function(currentCase, param, fallback = 0) {
        if (!currentCase || !currentCase.config) return fallback;
        const value = currentCase.config[param];
        return Number.isFinite(value) ? value : fallback;
    };

    Slider.createSliders = function(targetId = 'slider-container', caseForDefs = getActiveCase()) {
        const renderCase = caseForDefs || getActiveCase();
        Slider._lastTargetId = targetId;
        Slider._lastParamDefsKey = getParamDefsKey(renderCase);
        const sliderContainer = document.getElementById(targetId);
        if (!sliderContainer) {
            console.error('Slider container not found');
            return;
        }
        ensureCycleStyles();

        if (targetId === 'slider-container') {
            // Legacy 4.点の設定 panel is intentionally disabled.
            // Official point controls are rendered into glass-cursor-panel-4.
            sliderContainer.innerHTML = '';
            sliderContainer.setAttribute('hidden', '');
            return;
        }

        sliderContainer.innerHTML = '';

        const sliderHeader = document.createElement('div');
        sliderHeader.className = 'ui-header';
        sliderHeader.textContent = '2.点';
        sliderContainer.appendChild(sliderHeader);

        const sliderContent = document.createElement('div');
        sliderContent.className = 'ui-content';
        sliderContainer.appendChild(sliderContent);

        getActiveParamDefs(renderCase).forEach((baseDef) => {
            const param = baseDef.param;
            const def = getParamDef(param, renderCase) || baseDef;
            const supportsCycle = def.supportsCycle !== false;
            const sliderGroup = document.createElement('div');
            sliderGroup.id = `${param}-group`;
            sliderGroup.className = 'slider-group';

            const sliderLayout = document.createElement('div');
            sliderLayout.className = 'slider-layout';

            const labelValueContainer = document.createElement('div');
            labelValueContainer.className = 'label-value-container';

            const label = document.createElement('label');
            label.className = 'slider-label';
            label.textContent = def.label;

            const value = document.createElement('div');
            value.id = `${param}-value`;
            value.className = 'slider-value';

            labelValueContainer.appendChild(label);

            const sliderContainerInner = document.createElement('div');
            sliderContainerInner.className = 'slider-container';

            const fixedSlider = document.createElement('input');
            fixedSlider.type = 'range';
            fixedSlider.id = `${param}-slider`;
            fixedSlider.className = 'slider';
            fixedSlider.dataset.sliderRole = 'fixed';
            fixedSlider.min = def.min;
            fixedSlider.max = def.max;
            fixedSlider.step = def.step;

            const cycleContainer = document.createElement('div');
            cycleContainer.className = 'cycle-container';
            cycleContainer.dataset.sliderRole = 'cycle';
            cycleContainer.hidden = true;

            const cycleTrack = document.createElement('div');
            cycleTrack.className = 'cycle-track';
            cycleTrack.dataset.cyclePart = 'track';

            const cycleSelectedRange = document.createElement('div');
            cycleSelectedRange.className = 'cycle-selected-range';
            cycleSelectedRange.dataset.cyclePart = 'selected-range';

            const cycleMinHandle = document.createElement('button');
            cycleMinHandle.type = 'button';
            cycleMinHandle.className = 'cycle-handle cycle-min-handle';
            cycleMinHandle.dataset.cyclePart = 'min-handle';
            cycleMinHandle.setAttribute('aria-label', `${def.label} 最小値`);

            const cycleMaxHandle = document.createElement('button');
            cycleMaxHandle.type = 'button';
            cycleMaxHandle.className = 'cycle-handle cycle-max-handle';
            cycleMaxHandle.dataset.cyclePart = 'max-handle';
            cycleMaxHandle.setAttribute('aria-label', `${def.label} 最大値`);

            cycleContainer.appendChild(cycleTrack);
            cycleContainer.appendChild(cycleSelectedRange);
            cycleContainer.appendChild(cycleMinHandle);
            cycleContainer.appendChild(cycleMaxHandle);

            sliderContainerInner.appendChild(fixedSlider);
            if (supportsCycle) {
                sliderContainerInner.appendChild(cycleContainer);
            }

            const defaultContainer = document.createElement('div');
            defaultContainer.className = 'default-container';

            const defaultValue = document.createElement('div');
            defaultValue.className = 'default-value';
            defaultValue.id = `${param}-default`;

            const cycleBtn = document.createElement('button');
            cycleBtn.type = 'button';
            cycleBtn.className = 'reset-btn cycle-btn';
            cycleBtn.dataset.sliderCycleButton = param;
            cycleBtn.textContent = '[固定]';
            cycleBtn.addEventListener('click', () => Slider.cycleMode(param));

            defaultContainer.appendChild(defaultValue);
            if (supportsCycle) {
                defaultContainer.appendChild(cycleBtn);
            }
            if (param === POINT_SEQUENCE_LOCK_PARAM) {
                const pointSequenceLockButton = document.createElement('button');
                pointSequenceLockButton.type = 'button';
                pointSequenceLockButton.className = 'point-sequence-lock-button';
                pointSequenceLockButton.dataset.pointSequenceLockButton = 'true';
                pointSequenceLockButton.textContent = '🔓';
                pointSequenceLockButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPointSequenceLockEnabled(!isPointSequenceLockEnabled());
                });
                defaultContainer.appendChild(pointSequenceLockButton);
            }

            sliderLayout.appendChild(labelValueContainer);
            sliderLayout.appendChild(sliderContainerInner);
            sliderLayout.appendChild(value);
            sliderLayout.appendChild(defaultContainer);
            sliderGroup.appendChild(sliderLayout);
            sliderContent.appendChild(sliderGroup);

            fixedSlider.addEventListener('input', () => Slider.updateParameter(param, fixedSlider.value));
            if (supportsCycle) {
                cycleMinHandle.addEventListener('pointerdown', (event) => startCycleDrag(event, param, 'min'));
                cycleMaxHandle.addEventListener('pointerdown', (event) => startCycleDrag(event, param, 'max'));
                cycleContainer.addEventListener('pointerdown', (event) => {
                const track = cycleContainer.querySelector('[data-cycle-part="track"]');
                if (!track) return;
                const rect = track.getBoundingClientRect();
                const minRect = cycleMinHandle.getBoundingClientRect();
                const maxRect = cycleMaxHandle.getBoundingClientRect();
                const minCenter = minRect.left + minRect.width / 2;
                const maxCenter = maxRect.left + maxRect.width / 2;
                const handleName = Math.abs(event.clientX - minCenter) <= Math.abs(event.clientX - maxCenter) ? 'min' : 'max';
                if (event.clientX >= rect.left && event.clientX <= rect.right) {
                    startCycleDrag(event, param, handleName);
                }
                });
            }

            if (renderCase && renderCase.initialConfig) {
                const initialValue = renderCase.initialConfig[param];
                if (Number.isFinite(initialValue)) {
                    defaultValue.textContent = formatValue(param, initialValue);
                }
            }

            const state = supportsCycle ? getParamState(renderCase, param) : null;
            if (state) {
                const caseValue = Slider.getCaseValue(renderCase, param, def.min);
                state.baseValue = Number.isFinite(caseValue) ? caseValue : def.min;
                if (!Number.isFinite(state.minValue) || !Number.isFinite(state.maxValue)) {
                    const bounds = ensureRangeSpan(state.baseValue, def);
                    state.minValue = bounds.min;
                    state.maxValue = bounds.max;
                }
                refreshSliderRow(param, renderCase);
            }
            if (param === POINT_SEQUENCE_LOCK_PARAM) {
                applyPointSequenceLockState();
            }
        });

        if (window.UIHeader && typeof window.UIHeader.toggleContainer === 'function') {
            sliderHeader.addEventListener('click', () => {
                window.UIHeader.toggleContainer(sliderContainer);
            });
        }
    };

    Slider.calculateAdaptiveTrail = function(count, userTrailLength) {
        const MAX_TOTAL_POINTS = 1000;
        const MIN_TRAIL_LENGTH = 2;
        const MAX_TRAIL_LENGTH = 300;

        let adaptiveTrailLength = Math.floor(MAX_TOTAL_POINTS / count);
        adaptiveTrailLength = Math.min(adaptiveTrailLength, userTrailLength, MAX_TRAIL_LENGTH);
        adaptiveTrailLength = Math.max(adaptiveTrailLength, MIN_TRAIL_LENGTH);

        let skipInterval = Math.ceil(count / 50);

        return {
            trailLength: adaptiveTrailLength,
            skipInterval: skipInterval
        };
    };

    Slider.cycleMode = function(param) {
        const currentCase = getActiveCase();
        const state = getParamState(currentCase, param);
        const def = getParamDef(param);
        if (!currentCase || !state || !def) return;

        const multiplier = getCycleMultiplier(state);
        const nextIndex = state.mode === 'fixed'
            ? 0
            : (CYCLE_MULTIPLIERS.indexOf(multiplier) + 1) % (CYCLE_MULTIPLIERS.length + 1);
        if (state.mode === 'cycle' && nextIndex === CYCLE_MULTIPLIERS.length) {
            state.mode = 'fixed';
            state.cycleMultiplier = null;
            state.periodSec = null;
            state.baseValue = Slider.getCaseValue(currentCase, param, def.min);
        } else {
            const nextMultiplier = CYCLE_MULTIPLIERS[nextIndex] || CYCLE_MULTIPLIERS[0];
            state.mode = 'cycle';
            state.cycleMultiplier = nextMultiplier;
            state.periodSec = null;
            if (!Number.isFinite(state.baseValue)) {
                state.baseValue = Slider.getCaseValue(currentCase, param, def.min);
            }
            const bounds = ensureRangeSpan(state.baseValue, def);
            if (!Number.isFinite(state.minValue) || !Number.isFinite(state.maxValue) || state.minValue === state.maxValue) {
                state.minValue = bounds.min;
                state.maxValue = bounds.max;
            }
        }

        Slider.syncCycleInputs(param);
        applyModeToRow(param);
    };

    Slider.syncCycleInputs = function(param) {
        const currentCase = getActiveCase();
        const state = getParamState(currentCase, param);
        const def = getParamDef(param);
        if (!state || !def) return;

        const bounds = normalizeBounds(toNumber(state.minValue, def.min), toNumber(state.maxValue, def.max), def);
        state.minValue = clamp(bounds.min, def.min, def.max);
        state.maxValue = clamp(bounds.max, def.min, def.max);
        updateCycleVisuals(param, state, def);
    };

    Slider.updateCycleBounds = function(param, minValue, maxValue) {
        const currentCase = getActiveCase();
        const state = getParamState(currentCase, param);
        const def = getParamDef(param);
        if (!state || !def) return;

        const bounds = normalizeBounds(toNumber(minValue, state.minValue), toNumber(maxValue, state.maxValue), def);
        state.minValue = clamp(bounds.min, def.min, def.max);
        state.maxValue = clamp(bounds.max, def.min, def.max);
        state.baseValue = clamp((state.minValue + state.maxValue) / 2, def.min, def.max);

        updateCycleVisuals(param, state, def);
        Slider.updateSliderValue(param, Slider.getCaseValue(currentCase, param, def.min), { syncInputs: false });
    };

    Slider.getCycleInterpolatedValue = function(param, frameCount, state, currentCase = getActiveCase()) {
        const def = getParamDef(param, currentCase);
        const multiplier = getCycleMultiplier(state);
        if (!def || !state || state.mode !== 'cycle' || !multiplier) {
            return null;
        }

        const bounds = normalizeBounds(state.minValue, state.maxValue, def);
        const minValue = clamp(bounds.min, def.min, def.max);
        const maxValue = clamp(bounds.max, def.min, def.max);
        const amplitude = (maxValue - minValue) / 2;
        if (!Number.isFinite(amplitude)) return null;
        const center = minValue + amplitude;
        const periodFrames = getAnimationCycleFrames(currentCase) * multiplier;
        const progress = periodFrames > 0 ? (frameCount % periodFrames) / periodFrames : 0;
        const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);
        return clamp(center - amplitude + (2 * amplitude * eased), minValue, maxValue);
    };

    Slider.getCycleRuntimeValues = function(currentCase, frameCount) {
        if (!currentCase || !currentCase.config) return null;
        const stateMap = getCycleState(currentCase);
        if (!stateMap) return null;

        const runtimeValues = {};
        let hasRuntimeValue = false;

        getActiveParamDefs(currentCase).forEach((baseDef) => {
            const def = getParamDef(baseDef.param, currentCase) || baseDef;
            if (def.supportsCycle === false) return;
            const state = stateMap[def.param];
            if (!state || state.mode !== 'cycle') return;
            if (!Number.isFinite(state.baseValue)) {
                state.baseValue = Slider.getCaseValue(currentCase, def.param, def.min);
            }
            const nextValue = Slider.getCycleInterpolatedValue(def.param, frameCount, state, currentCase);
            if (!Number.isFinite(nextValue)) return;
            runtimeValues[def.param] = nextValue;
            hasRuntimeValue = true;
        });

        return hasRuntimeValue ? runtimeValues : null;
    };

    Slider.applyCycleRuntimeValues = function(currentCase, frameCount) {
        const runtimeValues = Slider.getCycleRuntimeValues(currentCase, frameCount);
        if (!runtimeValues || !currentCase || !currentCase.config) return null;

        const snapshot = {};
        Object.keys(runtimeValues).forEach((param) => {
            snapshot[param] = currentCase.config[param];
            currentCase.config[param] = runtimeValues[param];
        });

        return snapshot;
    };

    Slider.restoreCycleRuntimeValues = function(currentCase, snapshot) {
        if (!currentCase || !currentCase.config || !snapshot) return;
        Object.keys(snapshot).forEach((param) => {
            currentCase.config[param] = snapshot[param];
        });
    };

    Slider.updateCycleParameters = function(currentCase, frameCount) {
        return Slider.getCycleRuntimeValues(currentCase, frameCount);
    };

    Slider.updateParameter = function(param, value) {
        const currentCase = getActiveCase();
        if (!currentCase) return;
        window.config = window.config || {};

        const def = getParamDef(param);
        if (!def) return;

        if (param === POINT_SEQUENCE_LOCK_PARAM && isPointSequenceLockEnabled()) {
            Slider.updateSliderValue(param, Slider.getCaseValue(currentCase, param, def.min), { syncInputs: true });
            applyPointSequenceLockState();
            return;
        }

        const state = def.supportsCycle !== false ? getParamState(currentCase, param) : null;
        if (state && state.mode === 'cycle') {
            return;
        }

        value = toNumber(value, Slider.getCaseValue(currentCase, param, def.min));
        if (!Number.isFinite(value)) return;
        value = clamp(value, def.min, def.max);

        if (param === 'count' || param === 'trailLength') {
            if (param === 'count') {
                value = clamp(Math.round(value), def.min, def.max);
            } else if (param === 'trailLength') {
                value = clamp(value, def.min, def.max);
            }
            currentCase.config[param] = value;

            if (currentCase && currentCase.sliderParamOverrides && currentCase.sliderParamOverrides.count && currentCase === window.case11) {
                currentCase.config.skipInterval = 1;
                Slider.updateSliderValue('count', currentCase.config.count);
                Slider.updateSliderValue('trailLength', currentCase.config.trailLength);
            } else {
                const adaptiveTrail = Slider.calculateAdaptiveTrail(
                    currentCase.config.count,
                    currentCase.config.trailLength
                );
                currentCase.config.trailLength = adaptiveTrail.trailLength;
                currentCase.config.skipInterval = adaptiveTrail.skipInterval;
                Slider.updateSliderValue('count', currentCase.config.count);
                Slider.updateSliderValue('trailLength', adaptiveTrail.trailLength);
            }
        } else {
            if (param === 'morphSpeed') {
                value = Math.max(0.0001, value);
            }
            currentCase.config[param] = value;
        }

        if (param === 'count' || param === 'trailLength') {
            if (typeof window.adjustVectorCount === 'function') {
                window.adjustVectorCount(currentCase.config.count, currentCase.config.trailLength);
            }
        }

        Slider.updateSliderValue(param, currentCase.config[param], { syncInputs: true });
        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }
    };

    Slider.resetToDefault = function(param) {
        const currentCase = getActiveCase();
        if (!currentCase || !currentCase.initialConfig) return;

        const state = getParamState(currentCase, param);
        if (state) {
            state.mode = 'fixed';
            state.periodSec = null;
            state.baseValue = currentCase.initialConfig[param];
            const def = getParamDef(param);
            if (def) {
                const bounds = ensureRangeSpan(state.baseValue, def);
                state.minValue = bounds.min;
                state.maxValue = bounds.max;
            }
        }

        Slider.updateParameter(param, currentCase.initialConfig[param]);
        Slider.updateSliderValue(param, currentCase.initialConfig[param], { syncInputs: true });
        applyModeToRow(param);
    };

    Slider.updateSliders = function(currentCase) {
        if (!currentCase) return;
        const nextKey = getParamDefsKey(currentCase);
        if (Slider._lastParamDefsKey !== nextKey) {
            Slider.createSliders(Slider._lastTargetId || 'slider-container', currentCase);
        }
        getActiveParamDefs(currentCase).forEach((baseDef) => {
            const def = getParamDef(baseDef.param, currentCase) || baseDef;
            syncSliderBoundsForParam(def.param, currentCase);
            const state = def.supportsCycle !== false ? getParamState(currentCase, def.param) : null;
            if (state) {
                if (!Number.isFinite(state.baseValue)) {
                    state.baseValue = Slider.getCaseValue(currentCase, def.param, def.min);
                }
                if (state.mode === 'cycle') {
                    const bounds = ensureRangeSpan(state.baseValue, def);
                    if (!Number.isFinite(state.minValue) || !Number.isFinite(state.maxValue)) {
                        state.minValue = bounds.min;
                        state.maxValue = bounds.max;
                    }
                }
                setCycleButtonsForParam(def.param, state);
            }
            if (def.supportsCycle !== false) {
                applyModeToRow(def.param);
            }
            Slider.updateSliderValue(def.param, currentCase.config[def.param], { syncInputs: true });
        });
    };

    Slider.updateSliderValue = function(param, value, options = {}) {
        const sliders = document.querySelectorAll(`[id="${param}-slider"]`);
        const valueDisplays = document.querySelectorAll(`[id="${param}-value"]`);
        const defaultValueDisplays = document.querySelectorAll(`[id="${param}-default"]`);
        const state = getParamState(getActiveCase(), param);
        const def = getParamDef(param);
        const syncInputs = options.syncInputs !== false;

        if (!sliders.length || !valueDisplays.length || !def) return;

        syncSliderBoundsForParam(param);
        const safeValue = clamp(toNumber(value, def.min), def.min, def.max);
        const decimalPlaces = getDecimalPlaces(param);
        const textValue = formatValue(param, safeValue);

        sliders.forEach((slider) => {
            if (slider.dataset.sliderRole === 'fixed') {
                slider.value = safeValue;
            }
        });

        if (state && state.mode === 'cycle') {
            const bounds = normalizeBounds(state.minValue, state.maxValue, def);
            const minText = formatValue(param, bounds.min);
            const maxText = formatValue(param, bounds.max);
            updateCycleVisuals(param, state, def);
            valueDisplays.forEach((valueDisplay) => {
                valueDisplay.replaceChildren();
                [minText, maxText].forEach((text) => {
                    const line = document.createElement('span');
                    line.className = 'cycle-value-line';
                    line.textContent = text;
                    valueDisplay.appendChild(line);
                });
                valueDisplay.classList.add('is-cycle-range');
                valueDisplay.classList.add('changed-value');
            });
        } else {
            valueDisplays.forEach((valueDisplay) => {
                valueDisplay.classList.remove('is-cycle-range');
                valueDisplay.textContent = textValue;
            });
            if (syncInputs) {
                sliders.forEach((slider) => {
                    if (slider.dataset.sliderRole === 'fixed') {
                        slider.value = safeValue;
                    }
                });
            }
            const initialValue = getActiveCase() && getActiveCase().initialConfig
                ? getActiveCase().initialConfig[param]
                : undefined;
            if (value !== initialValue) {
                valueDisplays.forEach((valueDisplay) => valueDisplay.classList.add('changed-value'));
            } else {
                valueDisplays.forEach((valueDisplay) => valueDisplay.classList.remove('changed-value'));
            }
        }

        if (defaultValueDisplays.length && getActiveCase() && getActiveCase().initialConfig) {
            const initialValue = getActiveCase().initialConfig[param];
            if (Number.isFinite(initialValue)) {
                defaultValueDisplays.forEach((defaultValueDisplay) => {
                    defaultValueDisplay.textContent = formatValue(param, initialValue);
                });
            }
        }
    };

    Slider.applyModeToRow = applyModeToRow;
    Slider.applyPointSequenceLockState = applyPointSequenceLockState;
    Slider.setPointSequenceLockEnabled = setPointSequenceLockEnabled;
    Slider.getAnimationCycleFrames = getAnimationCycleFrames;
    Slider.setCycleStateFromStorage = function() {};
})(window.Slider);
