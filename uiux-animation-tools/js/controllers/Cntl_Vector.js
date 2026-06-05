(function() {
    let settings = {
        useImageForce: false,
        whiteThreshold: 128,
        pullStrength: 50
    };

    let imageData = null;

    function getSettings() {
        return { ...settings };
    }

    function setSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        console.log('Vector settings updated:', settings);
    }

    function setImageData(imgData) {
        imageData = imgData;
        console.log('Image data set:', imgData.width, 'x', imgData.height);
    }

function calculateVectorEffect(x, y) {
    if (!settings.useImageForce || !imageData) {
        return { x: 0, y: 0 };
    }

    const imgX = Math.floor(x * imageData.width / window.width);
    const imgY = Math.floor(y * imageData.height / window.height);

    if (imgX < 0 || imgX >= imageData.width || imgY < 0 || imgY >= imageData.height) {
        return { x: 0, y: 0 };
    }

    const index = (imgY * imageData.width + imgX) * 4;
    const brightness = imageData.data[index] / 255; // 0 or 1 due to high contrast

    // Dark areas (brightness = 0) pull points towards them
    const force = (1 - brightness) * settings.pullStrength;

    // Random direction for more dynamic movement
    const angle = Math.random() * Math.PI * 2;
    return {
        x: Math.cos(angle) * force,
        y: Math.sin(angle) * force
    };
}




    // Ensure window.Vector is defined before assigning properties
    window.Vector = window.Vector || {};

    // Assign methods to window.Vector
    window.Vector.getSettings = getSettings;
    window.Vector.setSettings = setSettings;
    window.Vector.setImageData = setImageData;
    window.Vector.calculateVectorEffect = calculateVectorEffect;

    console.log('Vector.js initialized');
})();