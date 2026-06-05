window.ButtonLoad = (function() {
    function createImageLoadButton() {
        const button = document.createElement('button');
        button.textContent = '読込み';
        button.id = 'load-image-btn';
        button.addEventListener('click', handleImageLoad);
        return button;
    }

    function createApplyImageButton() {
        const button = document.createElement('button');
        button.textContent = '画像反映';
        button.id = 'apply-image-btn';
        button.addEventListener('click', handleApplyImage);
        return button;
    }

    function handleImageLoad() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = processImageFiles;
        input.click();
    }

    function processImageFiles(event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    if (window.UILoad && typeof window.UILoad.addImagePreview === 'function') {
                        window.UILoad.addImagePreview(img);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function handleApplyImage() {
        if (window.UILoad && typeof window.UILoad.getSelectedImage === 'function') {
            const selectedImage = window.UILoad.getSelectedImage();
            if (selectedImage && window.currentCase) {
                applyImageToCase(window.currentCase, selectedImage);
                alert('画像が現在のケースに適用されました。');
                if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                    window.Table.updateCaseComparisonTable();
                }
            } else {
                alert('画像が選択されていないか、現在のケースが設定されていません。');
            }
        }
    }

function applyImageToCase(caseObj, image) {
    if (caseObj && caseObj.config) {
        loadImage(image.src, 
            loadedImg => {
                caseObj.config.image = loadedImg;
                caseObj.config.imageOpacity = window.UILoad ? window.UILoad.getImageOpacity() : 1;
                
                // 画像データの解析と影響の設定
                caseObj.getImageInfluence = function(x, y) {
                    const ix = Math.floor(x / width * loadedImg.width);
                    const iy = Math.floor(y / height * loadedImg.height);
                    const c = loadedImg.get(ix, iy);
                    const brightness = (red(c) + green(c) + blue(c)) / 3 / 255;
                    return brightness * caseObj.config.imageOpacity;
                };

                // テーブルを更新
                if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                    window.Table.updateCaseComparisonTable();
                }
            },
            error => {
                console.error('Failed to load image:', error);
            }
        );
    }
}

    return {
        createImageLoadButton: createImageLoadButton,
        createApplyImageButton: createApplyImageButton,
        applyImageToCase: applyImageToCase
    };
})();