// UI_all.js - UIスクロール管理のみ (UI_State.jsから分離)

window.UIScroll = (function() {
    function adjustUIContainerHeight() {
        const uiWrapper = document.getElementById('ui-wrapper');
        const uiContainer = document.getElementById('ui-container');

        if (uiWrapper && uiContainer) {
            uiContainer.style.height = `${uiWrapper.clientHeight}px`;

            // 各UIコンテナの高さを再計算
            document.querySelectorAll('.ui-container').forEach(container => {
                if (!container.classList.contains('collapsed')) {
                    const content = container.querySelector('.ui-content');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        }
    }

    function init() {
        window.addEventListener('load', adjustUIContainerHeight);
        window.addEventListener('resize', adjustUIContainerHeight);
    }

    return {
        init: init,
        adjustHeight: adjustUIContainerHeight
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded: UI_all.js initializing UIScroll');
    window.UIScroll.init();
});
