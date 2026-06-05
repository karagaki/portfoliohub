// UI_State.js - 唯一のUI開閉制御

window.UIState = (function() {
    const baseUiContainers = [
        'canvas-size-container',
        'button-container',
        'color-container',
        'slider-container',
        'cursor-container',
        'glass-settings-panel',
        'svg-file-container',
        'svg-anime-container',
        'load-container',
        'vector-container'
    ];
    const headerLabelTargets = [
        'canvas-size-container',
        'button-container',
        'color-container',
        'slider-container'
    ];
    let delegatedBound = false;

    function shouldUseDefaultOpenState() {
        return new URLSearchParams(window.location.search).get('reset_ui') === '1';
    }

    function isGlassVariant() {
        return document.body?.getAttribute('data-ui-variant') === 'variant-1-glass';
    }

    function getUiContainers() {
        if (!isGlassVariant()) return baseUiContainers;
        return baseUiContainers.filter((id) => ![
            'canvas-size-container',
            'color-container',
            'slider-container',
            'cursor-container'
        ].includes(id));
    }

    function saveUIState() {
        const state = {};
        getUiContainers().forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                state[id] = container.classList.contains('collapsed');
            }
        });
        localStorage.setItem('uiState', JSON.stringify(state));
        console.log('UI state saved:', state);
    }

    function restoreUIState() {
        const stateString = localStorage.getItem('uiState');
        if (stateString && !shouldUseDefaultOpenState()) {
            const state = JSON.parse(stateString);
            console.log('Restoring UI state:', state);
            getUiContainers().forEach(id => {
                const container = document.getElementById(id);
                if (container && state[id] !== undefined) {
                    if (state[id]) {
                        collapseContainer(container, false);
                    } else {
                        expandContainer(container, false);
                    }
                }
            });
        } else {
            console.log('No saved UI state found, initializing default state');
            initializeDefaultState();
        }
    }

    function initializeDefaultState() {
        getUiContainers().forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                // 初期表示は全て開く
                expandContainer(container, false);
            }
        });
        saveUIState();
    }

    function collapseContainer(container, save = true) {
        if (!container) return;
        container.classList.add('collapsed');
        syncHeaderState(container);
        if (save) saveUIState();

        if (window.UIScroll && typeof window.UIScroll.adjustHeight === 'function') {
            window.UIScroll.adjustHeight();
        }
    }

    function expandContainer(container, save = true) {
        if (!container) return;
        container.classList.remove('collapsed');
        syncHeaderState(container);
        if (save) saveUIState();

        if (window.UIScroll && typeof window.UIScroll.adjustHeight === 'function') {
            window.UIScroll.adjustHeight();
        }
    }

    function toggleContainer(container) {
        if (!container) return;
        if (container.classList.contains('collapsed')) {
            expandContainer(container);
        } else {
            collapseContainer(container);
        }
    }

    function syncHeaderState(container) {
        if (!container) return;
        const header = container.querySelector('.ui-header');
        if (!header) return;
        const collapsed = container.classList.contains('collapsed');
        header.setAttribute('aria-expanded', String(!collapsed));
        header.setAttribute('data-ui-state', collapsed ? 'closed' : 'open');
    }

    function addEventListeners() {
        if (delegatedBound) return;
        document.addEventListener('click', (event) => {
            const header = event.target.closest('.ui-header');
            if (!header) return;
            const container = header.closest('.ui-container');
            if (!container || !getUiContainers().includes(container.id)) return;
            event.preventDefault();
            event.stopPropagation();
            toggleContainer(container);
        });
        delegatedBound = true;
    }

    function init() {
        console.log('UI_State: Initializing');
        document.body.classList.add('ui-initializing');
        restoreUIState();
        addEventListeners();
        getUiContainers().forEach((id) => syncHeaderState(document.getElementById(id)));
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('ui-initializing');
                document.body.classList.add('ui-ready');
            });
        });
    }

    function logUIState() {
        getUiContainers().forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                console.log(`${id}: ${container.classList.contains('collapsed') ? 'collapsed' : 'expanded'}`);
            }
        });
    }

    return {
        init: init,
        saveUIState: saveUIState,
        restoreUIState: restoreUIState,
        toggleContainer: toggleContainer,
        logUIState: logUIState,
        collapseContainer: collapseContainer,
        expandContainer: expandContainer,
        syncHeaderState: syncHeaderState
    };
})();

// DOMContentLoaded は1回のみ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded: UI_State.js initializing');
    window.UIState.init();
});
