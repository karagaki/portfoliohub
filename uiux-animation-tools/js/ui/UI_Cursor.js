// UI_Cursor.js

window.CursorUI = (function() {
    const cursorParams = ['cursor-radius', 'cursor-strength', 'pull-strength'];
    const cursorLabels = ['カーソル幅', '影響強度', '引寄せ強度'];
    const maxValues = [500, 1, 1];
    const minValues = [10, 0.1, 0];
    const steps = [1, 0.01, 0.01];
    let showCustomCursor = true;
    let continuousEffect = false;
    let pullEffect = false;

    function createCursorSliders(targetId = 'cursor-container', options = {}) {
        const cursorContainer = document.getElementById(targetId);
        if (!cursorContainer) {
            return;
        }

        const title = options.title || '5.カーソルの設定';
        const showCloseButton = options.showCloseButton !== false;
        const closeButtonClass = options.closeButtonClass || 'ui-settings-close';
        const idPrefix = options.idPrefix || '';
        const usePrefixedIds = Boolean(idPrefix);
        const getId = (id) => (usePrefixedIds ? `${idPrefix}${id}` : id);
        const contentSelector = options.contentSelector || '.ui-content';
        let cursorHeader = cursorContainer.querySelector('.ui-header');
        let cursorContent = cursorContainer.querySelector(contentSelector);

        if (!cursorHeader || !cursorContent) {
            cursorContainer.innerHTML = '';

            cursorHeader = document.createElement('div');
            cursorHeader.className = 'ui-header';
            cursorHeader.innerHTML = showCloseButton
                ? `
                <span>${title}</span>
                <button type="button" class="${closeButtonClass}">閉じる</button>
            `
                : `<span>${title}</span>`;
            cursorContainer.appendChild(cursorHeader);

            cursorContent = document.createElement('div');
            cursorContent.className = 'ui-content';
            cursorContainer.appendChild(cursorContent);
        } else {
            cursorHeader.querySelector('span')?.replaceChildren(document.createTextNode(title));
            const closeButton = cursorHeader.querySelector(`.${closeButtonClass}`) || cursorHeader.querySelector('button');
            if (!showCloseButton && closeButton) {
                closeButton.remove();
            } else if (closeButton) {
                closeButton.className = closeButtonClass;
                closeButton.textContent = '閉じる';
            }
            cursorContent.innerHTML = '';
        }

        const toggleConfig = [
            {
                id: getId('custom-cursor-checkbox'),
                checked: showCustomCursor,
                handler: handleCustomCursorToggle
            },
            {
                id: getId('continuous-effect-checkbox'),
                checked: continuousEffect,
                handler: handleContinuousEffectToggle
            },
            {
                id: getId('pull-effect-checkbox'),
                checked: pullEffect,
                handler: handlePullEffectToggle
            }
        ];

        cursorParams.forEach((param, index) => {
            createSlider(
                cursorContent,
                param,
                cursorLabels[index],
                minValues[index],
                maxValues[index],
                steps[index],
                idPrefix,
                toggleConfig[index]
            );
        });

        if (showCloseButton) {
            const closeButton = cursorHeader.querySelector(`.${closeButtonClass}`);
            closeButton?.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (window.UIState && typeof window.UIState.collapseContainer === 'function') {
                    window.UIState.collapseContainer(cursorContainer);
                } else {
                    cursorContainer.classList.add('collapsed');
                }
            });
        }

        // 保存された設定を読み込む
        loadSettings(idPrefix);

        // 初期状態を反映
        applyCustomCursorVisibility();
        applyContinuousEffect();
        applyPullEffect();
    }

    function createSlider(parent, param, label, min, max, step, idPrefix = '', toggle = null) {
        const sliderId = `${idPrefix}${param}-slider`;
        const valueId = `${idPrefix}${param}-value`;
        let sliderGroup = document.createElement('div');
        sliderGroup.id = `${idPrefix}${param}-group`;
        sliderGroup.className = 'slider-group';
        
        const sliderLayout = document.createElement('div');
        sliderLayout.className = 'slider-layout';
        
        const labelElement = document.createElement('label');
        labelElement.className = 'slider-label';
        labelElement.textContent = label;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'cursor-toggle-checkbox';
        if (toggle) {
            checkbox.id = toggle.id;
            checkbox.checked = toggle.checked;
        }
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const value = document.createElement('div');
        value.id = valueId;
        value.className = 'slider-value';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = sliderId;
        slider.className = 'slider';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = loadSetting(param) || (window.RippleEffect ? window.RippleEffect.getParameter(param) : min);
        value.textContent = Number.parseFloat(slider.value).toFixed(2);
        
        sliderContainer.appendChild(slider);
        sliderLayout.appendChild(labelElement);
        sliderLayout.appendChild(checkbox);
        sliderLayout.appendChild(sliderContainer);
        sliderLayout.appendChild(value);
        
        sliderGroup.appendChild(sliderLayout);
        
        slider.addEventListener('input', () => updateCursorParameter(param, slider.value));
        if (toggle) {
            checkbox.addEventListener('change', toggle.handler);
        }
        
        parent.appendChild(sliderGroup);
    }

    function updateCursorParameter(param, value) {
        value = parseFloat(value);
        if (window.RippleEffect && typeof window.RippleEffect.setParameter === 'function') {
            window.RippleEffect.setParameter(param, value);
        } else {
            console.warn('RippleEffect.setParameter is not available');
        }
        updateCursorSliderValue(param, value);
        saveSetting(param, value);
    }

    function updateCursorSliderValue(param, value) {
        const ids = [param + '-slider', `cursor-test-${param}-slider`];
        const valueIds = [param + '-value', `cursor-test-${param}-value`];
        ids.forEach((id) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = value;
        });
        valueIds.forEach((id) => {
            const valueDisplay = document.getElementById(id);
            if (valueDisplay) valueDisplay.textContent = value.toFixed(2);
        });
    }

    function saveSetting(key, value) {
        localStorage.setItem('cursorUI_' + key, JSON.stringify(value));
    }

    function loadSetting(key) {
        const value = localStorage.getItem('cursorUI_' + key);
        return value ? JSON.parse(value) : null;
    }

    function handleCustomCursorToggle(event) {
        showCustomCursor = event.target.checked;
        applyCustomCursorVisibility();
        saveSetting('showCustomCursor', showCustomCursor);
    }
    
    function handleContinuousEffectToggle(event) {
        continuousEffect = event.target.checked;
        applyContinuousEffect();
        saveSetting('continuousEffect', continuousEffect);
    }

    function handlePullEffectToggle(event) {
        pullEffect = event.target.checked;
        applyPullEffect();
        saveSetting('pullEffect', pullEffect);
    }

    function loadSettings(idPrefix = '') {
        const getId = (id) => (idPrefix ? `${idPrefix}${id}` : id);
        showCustomCursor = loadSetting('showCustomCursor') ?? true;
        continuousEffect = loadSetting('continuousEffect') ?? false;
        pullEffect = loadSetting('pullEffect') ?? false;
        
        const customCursorCheckbox = document.getElementById(getId('custom-cursor-checkbox'));
        const continuousEffectCheckbox = document.getElementById(getId('continuous-effect-checkbox'));
        const pullEffectCheckbox = document.getElementById(getId('pull-effect-checkbox'));
        if (customCursorCheckbox) customCursorCheckbox.checked = showCustomCursor;
        if (continuousEffectCheckbox) continuousEffectCheckbox.checked = continuousEffect;
        if (pullEffectCheckbox) pullEffectCheckbox.checked = pullEffect;

        cursorParams.forEach(param => {
            const value = loadSetting(param);
            if (value !== null) {
                updateCursorParameter(param, value);
            }
        });
    }

    function applyCustomCursorVisibility() {
        window.showCustomCursor = showCustomCursor;
        if (window.RippleEffect && typeof window.RippleEffect.showCustomCursor === 'function') {
            window.RippleEffect.showCustomCursor(showCustomCursor);
        } else {
            console.warn('RippleEffect.showCustomCursor is not available');
            const customCursor = document.getElementById('custom-cursor');
            if (customCursor) {
                customCursor.style.display = showCustomCursor ? 'block' : 'none';
            }
        }
    }

    function applyContinuousEffect() {
        if (window.RippleEffect && typeof window.RippleEffect.setContinuousEffect === 'function') {
            window.RippleEffect.setContinuousEffect(continuousEffect);
        } else {
            console.warn('RippleEffect.setContinuousEffect is not available');
        }
    }

    function applyPullEffect() {
        if (window.RippleEffect && typeof window.RippleEffect.setPullEffect === 'function') {
            window.RippleEffect.setPullEffect(pullEffect);
        } else {
            console.warn('RippleEffect.setPullEffect is not available');
        }
    }

    return {
        createCursorSliders: createCursorSliders,
        updateCursorSliderValue: updateCursorSliderValue,
        isCustomCursorVisible: () => showCustomCursor,
        applyCustomCursorVisibility: applyCustomCursorVisibility,
        applyContinuousEffect: applyContinuousEffect,
        applyPullEffect: applyPullEffect
    };
})();

// ページロード完了時に設定を適用
window.addEventListener('load', function() {
    if (window.CursorUI) {
        window.CursorUI.applyCustomCursorVisibility();
        window.CursorUI.applyContinuousEffect();
        window.CursorUI.applyPullEffect();
    }
});
