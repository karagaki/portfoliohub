window.UIVector = (function() {
    function initializeUI() {
        if (!window.Vector) {
            console.error('Vector object is not available');
            return;
        }

        const vectorContainer = document.getElementById('vector-container');
        if (!vectorContainer) {
            console.error('Vector container not found');
            return;
        }

        vectorContainer.innerHTML = '';
        const header = createHeader();
        const content = createContent();
        vectorContainer.appendChild(header);
        vectorContainer.appendChild(content);

        // クリックイベントはUI_State.jsで一括管理

        updateUI();
        console.log('Vector UI initialized');
    }

    function createHeader() {
        const header = document.createElement('div');
        header.className = 'ui-header';
        header.textContent = '9.画像をなぞる 工事中';
        return header;
    }

    function createContent() {
        const content = document.createElement('div');
        content.className = 'ui-content';
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'vector-settings';

        const settingsConfig = [
            { name: 'whiteThreshold', label: '白の閾値', min: 0, max: 255, step: 1 },
            { name: 'pullStrength', label: '引力強度', min: 0, max: 100, step: 1 }
        ];

        settingsConfig.forEach(config => {
            const setting = createSetting(config);
            settingsContainer.appendChild(setting);
        });

        const useImageForceToggle = createToggle('useImageForce', '画像の力を使用');
        settingsContainer.appendChild(useImageForceToggle);

        content.appendChild(settingsContainer);
        return content;
    }

    function createSetting(config) {
        const setting = document.createElement('div');
        setting.className = 'slider-group';
        
        const sliderLayout = document.createElement('div');
        sliderLayout.className = 'slider-layout';
        
        const labelValueContainer = document.createElement('div');
        labelValueContainer.className = 'label-value-container';
        
        const label = document.createElement('label');
        label.className = 'slider-label';
        label.textContent = config.label;
        
        const value = document.createElement('div');
        value.className = 'slider-value';
        
        labelValueContainer.appendChild(label);
        labelValueContainer.appendChild(value);
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'slider';
        input.min = config.min;
        input.max = config.max;
        input.step = config.step;
        
        if (window.Vector && window.Vector.getSettings) {
            input.value = window.Vector.getSettings()[config.name];
        } else {
            console.warn('Vector object or getSettings method is not available');
            input.value = config.min;
        }

        value.textContent = input.value;

        input.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            if (window.Vector && window.Vector.setSettings) {
                window.Vector.setSettings({ [config.name]: newValue });
            } else {
                console.warn('Vector object or setSettings method is not available');
            }
            value.textContent = newValue;
        });

        sliderContainer.appendChild(input);
        
        sliderLayout.appendChild(labelValueContainer);
        sliderLayout.appendChild(sliderContainer);
        
        setting.appendChild(sliderLayout);

        return setting;
    }

    function createToggle(name, label) {
        const toggle = document.createElement('div');
        toggle.className = 'vector-setting';

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = label;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = window.Vector.getSettings()[name];

        input.addEventListener('change', (e) => {
            window.Vector.setSettings({ [name]: e.target.checked });
        });

        toggle.appendChild(toggleLabel);
        toggle.appendChild(input);

        return toggle;
    }

    function updateUI() {
        const settings = window.Vector.getSettings();
        const inputs = document.querySelectorAll('#vector-container input');
        inputs.forEach(input => {
            const name = input.closest('.slider-group')?.querySelector('.slider-label')?.textContent;
            const key = Object.keys(settings).find(k => k.toLowerCase() === name?.toLowerCase());
            if (key) {
                if (input.type === 'checkbox') {
                    input.checked = settings[key];
                } else {
                    input.value = settings[key];
                    const valueDisplay = input.closest('.slider-group')?.querySelector('.slider-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = settings[key];
                    }
                }
            }
        });
    }
    
    return {
        initializeUI: initializeUI,
        updateUI: updateUI
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing UIVector');
    if (window.UIVector && typeof window.UIVector.initializeUI === 'function') {
        window.UIVector.initializeUI();
    } else {
        console.error('UIVector object or initializeUI method is not available');
    }
});