window.UI_SVGfile = (function() {
    let previewContainer;
    let selectedPreview = null;
    const MAX_PREVIEWS = 15;

    function initializeUI() {
        console.log('Initializing SVG File UI');
        const fileContainer = document.getElementById('svg-file-container');
        if (!fileContainer) {
            console.error('SVG file container not found');
            return;
        }

        // Clear existing content
        fileContainer.innerHTML = '';

        // ヘッダーの作成
        const header = createHeader();
        fileContainer.appendChild(header);

        // コンテンツの作成
        const content = createContent();
        fileContainer.appendChild(content);

        // クリックイベントはUI_State.jsで一括管理

        // 初期プレースホルダーの追加
        for (let i = 0; i < MAX_PREVIEWS; i++) {
            addPlaceholder();
        }

        console.log('SVG File UI initialized');
    }

    function createHeader() {
        const header = document.createElement('div');
        header.className = 'ui-header';
        header.textContent = '6.SVGファイルの読み込み';
        return header;
    }

    function createContent() {
        const content = document.createElement('div');
        content.className = 'ui-content';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // SVGロードボタン
        const loadButton = createButton('SVG読込', () => {
            if (window.Controller_SVGfile) {
                window.Controller_SVGfile.initiateFileSelect();
            }
        });
        buttonContainer.appendChild(loadButton);

        // SVG有効/無効切り替えボタン
        const toggleButton = createButton('SVG有効/無効', () => {
            if (window.Controller_SVGanime) {
                const isEnabled = window.Controller_SVGanime.toggleEnabled();
                toggleButton.textContent = isEnabled ? 'SVG無効' : 'SVG有効';
                toggleButton.classList.toggle('active', isEnabled);
            }
        });
        buttonContainer.appendChild(toggleButton);

        content.appendChild(buttonContainer);

        // プレビューコンテナ
        previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        content.appendChild(previewContainer);

        return content;
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    function addPlaceholder() {
        if (previewContainer.children.length >= MAX_PREVIEWS) {
            return;
        }
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = '+';
        previewContainer.appendChild(placeholder);
    }

    function updateFileList(files) {
        if (!previewContainer) return;

        // 既存のプレビューをクリア
        const existingPreviews = previewContainer.querySelectorAll('.svg-preview');
        existingPreviews.forEach(preview => preview.remove());

        files.forEach(file => {
            let preview = previewContainer.querySelector('.image-placeholder');
            if (!preview) {
                preview = previewContainer.querySelector('.svg-preview');
                if (!preview) {
                    console.error('No available preview slots');
                    return;
                }
            }

            preview.className = 'svg-preview';
            preview.textContent = file;

            const deleteButton = document.createElement('div');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '×';
            deleteButton.style.display = 'none';

            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                preview.remove();
                if (selectedPreview === preview) {
                    selectedPreview = null;
                }
                addPlaceholder();
            });

            preview.appendChild(deleteButton);

            preview.addEventListener('click', () => {
                if (selectedPreview) {
                    selectedPreview.classList.remove('selected');
                    selectedPreview.querySelector('.delete-button').style.display = 'none';
                }
                preview.classList.add('selected');
                deleteButton.style.display = 'flex';
                selectedPreview = preview;
            });
        });
    }

    function getSelectedFile() {
        return selectedPreview ? selectedPreview.textContent : null;
    }

    return {
        initialize: initializeUI,
        updateFileList: updateFileList,
        getSelectedFile: getSelectedFile
    };
})();

// DOMContentLoadedイベントでUI初期化
document.addEventListener('DOMContentLoaded', function() {
    if (window.UI_SVGfile) {
        window.UI_SVGfile.initialize();
    }
});
