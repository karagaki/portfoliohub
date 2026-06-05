// UI_SVGanime.js
window.UI_SVGanime = (function() {
    function initializeUI() {
        const container = document.getElementById('svg-anime-container');
        if (!container) {
            console.warn('SVG animation container not found');
            return;
        }

        container.innerHTML = '';

        // ヘッダー作成
        const header = document.createElement('div');
        header.className = 'ui-header';
        header.textContent = '7.SVGアニメーション設定';
        container.appendChild(header);

        // コンテンツエリア作成
        const content = document.createElement('div');
        content.className = 'ui-content';
        container.appendChild(content);

        // SVG有効/無効トグル
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'svg-toggle-container';
        
        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = 'SVG効果';
        
        const toggleButton = document.createElement('button');
        toggleButton.id = 'svg-toggle-btn';
        toggleButton.textContent = 'OFF';
        toggleButton.addEventListener('click', () => {
            if (window.Controller_SVGanime) {
                const isEnabled = window.Controller_SVGanime.toggleEnabled();
                toggleButton.textContent = isEnabled ? 'ON' : 'OFF';
                toggleButton.className = isEnabled ? 'active' : '';
            }
        });
        
        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(toggleButton);
        content.appendChild(toggleContainer);

        // パラメータスライダー
        const params = [
            { id: 'speed', label: '速度', min: 0, max: 2, step: 0.1, value: 1.0 },
            { id: 'influence', label: '影響度', min: 0, max: 1, step: 0.1, value: 0.5 },
            { id: 'attraction', label: '引き寄せ', min: 0, max: 1, step: 0.1, value: 0.3 }
        ];

        params.forEach(param => {
            const group = createSliderGroup(param);
            content.appendChild(group);
        });

        // プレビューエリア
        const previewSection = document.createElement('div');
        previewSection.className = 'svg-preview-section';
        
        const previewLabel = document.createElement('div');
        previewLabel.className = 'preview-label';
        previewLabel.textContent = 'SVGプレビュー';
        
        const previewArea = document.createElement('div');
        previewArea.id = 'svg-preview-area';
        previewArea.className = 'svg-preview';
        
        previewSection.appendChild(previewLabel);
        previewSection.appendChild(previewArea);
        content.appendChild(previewSection);

        // クリックイベントはUI_State.jsで一括管理
    }

    function createSliderGroup(param) {
        const group = document.createElement('div');
        group.className = 'slider-group';
        
        const sliderLayout = document.createElement('div');
        sliderLayout.className = 'slider-layout';
        
        const labelValueContainer = document.createElement('div');
        labelValueContainer.className = 'label-value-container';
        
        const label = document.createElement('label');
        label.className = 'slider-label';
        label.textContent = param.label;
        
        const value = document.createElement('div');
        value.id = `${param.id}-value`;
        value.className = 'slider-value';
        value.textContent = param.value;
        
        labelValueContainer.appendChild(label);
        labelValueContainer.appendChild(value);
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'slider';
        slider.min = param.min;
        slider.max = param.max;
        slider.step = param.step;
        slider.value = param.value;
        
        slider.addEventListener('input', (e) => {
            value.textContent = e.target.value;
            if (window.Controller_SVGanime) {
                window.Controller_SVGanime.setParameter(param.id, parseFloat(e.target.value));
            }
        });
        
        sliderContainer.appendChild(slider);
        sliderLayout.appendChild(labelValueContainer);
        sliderLayout.appendChild(sliderContainer);
        group.appendChild(sliderLayout);
        
        return group;
    }

    function updatePreview(pathData) {
        const preview = document.getElementById('svg-preview-area');
        if (!preview) return;

        if (!pathData || !pathData.normalized) {
            preview.innerHTML = '<div class="no-preview">SVGが読み込まれていません</div>';
            return;
        }

        const bounds = pathData.normalized.bounds;
        const padding = 10;

        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="${bounds.minX - padding} ${bounds.minY - padding} 
                         ${bounds.maxX - bounds.minX + padding * 2} 
                         ${bounds.maxY - bounds.minY + padding * 2}"
                 preserveAspectRatio="xMidYMid meet">
                <path d="${pathData.d}" 
                      stroke="${pathData.style?.stroke || '#000'}"
                      fill="${pathData.style?.fill || 'none'}"
                      stroke-width="${pathData.style?.strokeWidth || '1'}"/>
            </svg>
        `;
        
        preview.innerHTML = svgContent;
    }

    // スタイルの追加
    const style = document.createElement('style');
    style.textContent = `
        .svg-preview-section {
            margin-top: 10px;
        }
        
        .preview-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .svg-preview {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px;
            width: 150px;
            height: 150px;
            overflow: hidden;
        }
        
        .svg-preview svg {
            width: 100%;
            height: 100%;
        }
        
        .no-preview {
            color: #999;
            font-size: 12px;
            text-align: center;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);

    return {
        initialize: initializeUI,
        updatePreview: updatePreview
    };
})();

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', function() {
    if (window.UI_SVGanime) {
        window.UI_SVGanime.initialize();
    }
});