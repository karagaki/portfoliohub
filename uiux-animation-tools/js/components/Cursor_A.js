// Cursor_A.js (RippleEffect)

window.RippleEffect = (function() {
    let ripples = [];
    const maxRipples = 45;
    const rippleLifetime = 2000; // milliseconds
    let cursorRadius = 500; // デフォルト値
    let cursorStrength = 0.5; // デフォルト値
    let pullStrength = 0; // 新しい引き寄せ強度パラメータ
    let customCursor;
    let cursorSizeMultiplier = 1.5;
    let cursorStrengthMultiplier = 2;
    let continuousEffect = false;
    let pullEffect = false; // 新しい引き寄せ効果フラグ
    let lastCursorPosition = { x: 0, y: 0 };
    let canvasOffset = { x: 300, y: 0 };

    function initialize() {
        customCursor = document.getElementById('custom-cursor');
        if (customCursor) {
            document.addEventListener('mousemove', updateCursorPosition);
            updateCursorStyle();
        } else {
            console.warn('Custom cursor element not found');
        }
        refreshCanvasOffset();
    }

    function mouseMoved(x, y) {
        createRipple(x, y);
    }

    function createRipple(x, y) {
        ripples.push({
            x: x,
            y: y,
            startTime: Date.now(),
            strength: 1
        });

        if (ripples.length > maxRipples) {
            ripples.shift();
        }
    }

    function refreshCanvasOffset() {
        const canvas = document.getElementById('defaultCanvas0');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvasOffset.x = rect.left;
        canvasOffset.y = rect.top;
    }

    function applyRippleEffect(vector) {
        let totalEffect = createVector(0, 0);

        ripples.forEach(ripple => {
            const distance = dist(vector.x, vector.y, ripple.x, ripple.y);
            if (distance < cursorRadius) {
                const angle = atan2(vector.y - ripple.y, vector.x - ripple.x);
                const strength = (1 - distance / cursorRadius) * ripple.strength * cursorStrength;
                let effect;
                
                if (pullEffect) {
                    // 引き寄せ効果: カーソルに向かって引き寄せる
                    effect = p5.Vector.fromAngle(angle + PI, strength * pullStrength * 5);
                } else {
                    // 通常の効果: カーソルから押し出す
                    effect = p5.Vector.fromAngle(angle, strength * 5);
                }
                
                totalEffect.add(effect);
            }
        });

        vector.add(totalEffect);
    }

    function updateCursorPosition(e) {
        refreshCanvasOffset();
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        lastCursorPosition = { 
            x: e.clientX - canvasOffset.x, 
            y: e.clientY - canvasOffset.y 
        };
        createRipple(lastCursorPosition.x, lastCursorPosition.y);
    }

    function updateRipples() {
        const currentTime = Date.now();
        ripples = ripples.filter(ripple => {
            const age = currentTime - ripple.startTime;
            return age < rippleLifetime || continuousEffect;
        });

        ripples.forEach(ripple => {
            const age = currentTime - ripple.startTime;
            ripple.strength = continuousEffect ? 1 : Math.max(0, 1 - (age / rippleLifetime));
        });

        if (continuousEffect && ripples.length === 0) {
            createRipple(lastCursorPosition.x, lastCursorPosition.y);
        }
    }
        
    function setContinuousEffect(value) {
        continuousEffect = value;
    }

    function setPullEffect(value) {
        pullEffect = value;
    }

    function setParameter(param, value) {
        switch(param) {
            case 'cursor-radius':
                cursorRadius = value;
                updateCursorStyle();
                break;
            case 'cursor-strength':
                cursorStrength = value;
                updateCursorStyle();
                break;
            case 'pull-strength':
                pullStrength = value;
                break;
            default:
                console.warn('Unknown parameter:', param);
        }
    }

    function getParameter(param) {
        switch(param) {
            case 'cursor-radius':
                return cursorRadius;
            case 'cursor-strength':
                return cursorStrength;
            case 'pull-strength':
                return pullStrength;
            default:
                console.warn('Unknown parameter:', param);
                return null;
        }
    }

    function showCustomCursor(show) {
        if (customCursor) {
            customCursor.style.display = show ? 'block' : 'none';
        }
    }

    function updateCursorStyle() {
        if (customCursor) {
            const size = cursorRadius * cursorSizeMultiplier;
            const borderWidth = 1 + cursorStrength * cursorStrengthMultiplier;
            
            customCursor.style.width = `${size}px`;
            customCursor.style.height = `${size}px`;
            customCursor.style.borderWidth = `${borderWidth}px`;
        }
    }

    function setCursorSizeMultiplier(value) {
        cursorSizeMultiplier = value;
        updateCursorStyle();
    }

    function setCursorStrengthMultiplier(value) {
        cursorStrengthMultiplier = value;
        updateCursorStyle();
    }

    return {
        initialize: initialize,
        createRipple: createRipple,
        updateRipples: updateRipples,
        applyRippleEffect: applyRippleEffect,
        setParameter: setParameter,
        getParameter: getParameter,
        mouseMoved: mouseMoved,
        showCustomCursor: showCustomCursor,
        setCursorSizeMultiplier: setCursorSizeMultiplier,
        setCursorStrengthMultiplier: setCursorStrengthMultiplier,
        setContinuousEffect: setContinuousEffect,
        setPullEffect: setPullEffect
    };
})();

// DOMContentLoadedイベントリスナーをグローバルスコープに移動
document.addEventListener('DOMContentLoaded', function() {
    if (window.RippleEffect && typeof window.RippleEffect.initialize === 'function') {
        window.RippleEffect.initialize();
    }
});
