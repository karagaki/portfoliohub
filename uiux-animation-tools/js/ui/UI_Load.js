window.UILoad = (function() {
    let previewContainer;
    let selectedPreview = null;
    const MAX_PREVIEWS = 15;

    function initializeUI() {
        console.log('Initializing UI Load');
        const loadContainer = document.getElementById('load-container');
        if (!loadContainer) {
            console.error('Load container not found');
            return;
        }

        // Clear existing content
        loadContainer.innerHTML = '';

        // ヘッダーの作成
        const header = createHeader();
        loadContainer.appendChild(header);

        // コンテンツの作成
        const content = createContent();
        loadContainer.appendChild(content);

        // クリックイベントはUI_State.jsで一括管理

        // 初期プレースホルダーの追加
        for (let i = 0; i < MAX_PREVIEWS; i++) {
            addPlaceholder();
        }

        console.log('Load UI initialized');
    }

    function createHeader() {
        const header = document.createElement('div');
        header.className = 'ui-header';
        header.textContent = '8.画像のロード 工事中';
        return header;
    }

    function createContent() {
        const content = document.createElement('div');
        content.className = 'ui-content';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        if (window.ButtonLoad) {
            const loadButton = window.ButtonLoad.createImageLoadButton();
            const applyButton = window.ButtonLoad.createApplyImageButton();
            buttonContainer.appendChild(loadButton);
            buttonContainer.appendChild(applyButton);
        } else {
            console.warn('ButtonLoad module not found');
        }

        const removeButton = createRemoveImageButton();
        buttonContainer.appendChild(removeButton);

        const toggleButton = createToggleImageButton();
        buttonContainer.appendChild(toggleButton);

        content.appendChild(buttonContainer);

        previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        content.appendChild(previewContainer);

        return content;
    }

    function createRemoveImageButton() {
        const button = document.createElement('button');
        button.textContent = '画像削除';
        button.id = 'remove-image-btn';
        button.addEventListener('click', removeImage);
        return button;
    }

    function removeImage() {
        if (window.currentCase && window.currentCase.config.image) {
            delete window.currentCase.config.image;
            delete window.currentCase.getImageInfluence;
            if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                window.Table.updateCaseComparisonTable();
            }
            alert('画像が削除されました。');
        } else {
            alert('削除する画像がありません。');
        }
    }

    function toggleImageDisplay() {
        if (window.currentCase) {
            window.currentCase.showImage = !window.currentCase.showImage;
            alert(window.currentCase.showImage ? '画像を表示します' : '画像を非表示にします');
        } else {
            alert('現在のケースが設定されていません');
        }
    }

    function addImagePreview(img) {
        let preview = previewContainer.querySelector('.image-placeholder');
        
        if (!preview) {
            preview = previewContainer.querySelector('.image-preview');
            if (!preview) {
                console.error('No available preview slots');
                return;
            }
        }

        preview.className = 'image-preview';
        preview.style.backgroundImage = `url(${img.src})`;
        preview.innerHTML = '';

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

        preview.imgSrc = img.src;
    }
    
    function applyImageToCurrentCase() {
        const selectedImage = getSelectedImage();
        if (selectedImage && window.currentCase) {
            processAndApplyImage(selectedImage);
        } else {
            alert('画像が選択されていないか、現在のケースが設定されていません。');
        }
    }


function processAndApplyImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;  // 画像サイズを縮小
    canvas.height = 100;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to high contrast grayscale and add noise
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const noise = Math.random() * 50 - 25;
        const newValue = Math.max(0, Math.min(255, gray + noise));
        const highContrast = newValue > 128 ? 255 : 0;  // 高コントラスト化
        data[i] = data[i + 1] = data[i + 2] = highContrast;
    }

    ctx.putImageData(imageData, 0, 0);

    window.currentCase.config.image = canvas;
    window.currentCase.showImage = true;
    window.Vector.setImageData(imageData);

    if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
        window.Table.updateCaseComparisonTable();
    }
    alert('処理された画像が適用されました。画像表示切替ボタンで確認できます。');
}

function createToggleImageButton() {
    const button = document.createElement('button');
    button.textContent = '画像切替';
    button.id = 'toggle-image-btn';
    button.addEventListener('click', toggleImageDisplay);
    return button;
}

function toggleImageDisplay() {
    if (window.currentCase) {
        window.currentCase.showImage = !window.currentCase.showImage;
        alert(window.currentCase.showImage ? '画像を表示します' : '画像を非表示にします');
    } else {
        alert('現在のケースが設定されていません');
    }
}

function loadAndSetImage(imageData) {
    window.Vector.setImageData(imageData);
    window.currentCase.imageData = imageData;
    
    // Vector.js の設定を更新
    window.Vector.setSettings({
        useImageForce: true,
        whiteThreshold: 128,
        pullStrength: 0.1 // この値を調整して効果の強さを変更できます
    });
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

    function getSelectedImage() {
        if (selectedPreview) {
            const img = new Image();
            img.src = selectedPreview.imgSrc;
            return img;
        }
        return null;
    }

    return {
        initializeUI: initializeUI,
        addImagePreview: addImagePreview,
        getSelectedImage: getSelectedImage,
        applyImageToCurrentCase: applyImageToCurrentCase,
        toggleImageDisplay: toggleImageDisplay
    };
})();
