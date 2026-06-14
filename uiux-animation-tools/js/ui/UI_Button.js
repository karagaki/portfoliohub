var UIUX_PUBLIC_DEBUG_LOGS = window.UIUX_PUBLIC_DEBUG_LOGS === true;
function uiuxPublicDebugLog(...args) { if (UIUX_PUBLIC_DEBUG_LOGS) console.log(...args); }
// UI_Button.js

window.Button = window.Button || {};

(function(Button) {
    const PUBLIC_DEMO_DISABLE_EXPORT_IMPORT = true;
    const PUBLIC_DEMO_DISABLED_TITLE = '公開デモでは無効';

    function markPublicDemoDisabledButton(button) {
        if (!button || !PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return;
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('title', PUBLIC_DEMO_DISABLED_TITLE);
        button.style.setProperty('opacity', '0.42', 'important');
        button.style.setProperty('cursor', 'not-allowed', 'important');
        button.style.setProperty('filter', 'grayscale(0.35)', 'important');
    }

    function blockPublicDemoDisabledAction(event) {
        if (!PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return false;
        event?.preventDefault?.();
        event?.stopPropagation?.();
        return true;
    }

    const codeExplainDragState = {
        active: false,
        pointerId: null,
        offsetX: 0,
        offsetY: 0,
        left: null,
        top: null
    };
    const codeExplainResizeState = {
        active: false,
        pointerId: null,
        startY: 0,
        startHeight: 0
    };
    const codeExplainDefaultPosition = {
        left: null,
        top: 24
    };
    const CODE_EXPLAIN_JSON_URL = 'data/explain/p5_case_explain_data_draft.json';
    const CODE_EXPLAIN_JSON_CACHE_BUST = `?v=${Date.now()}`;
    let codeExplainDataPromise = null;
    let codeExplainDataCache = null;
    let codeExplainToolbarTimer = null;
    let codeExplainCloseTimer = null;
    let codeExplainOpenTimer = null;
    let codeExplainIsOpen = false;
    let codeExplainRenderSeq = 0;

    Button.isCodeExplainVisible = function() {
        const overlay = document.getElementById('code-explain-overlay');
        return !!overlay
            && codeExplainIsOpen
            && !overlay.hidden
            && overlay.style.display !== 'none'
            && overlay.getAttribute('aria-hidden') !== 'true'
            && overlay.classList.contains('is-open');
    };

    Button.syncCodeExplainToggleButton = function() {
        const button = document.getElementById('glass-panel-code-explain');
        if (!button) return;
        const isVisible = Button.isCodeExplainVisible();
        button.classList.toggle('is-active', isVisible);
        button.classList.toggle('is-visible', isVisible);
        button.setAttribute('aria-pressed', String(isVisible));
        if (window.UIGlassPanels && typeof window.UIGlassPanels.updateReadableTextColor === 'function') {
            window.UIGlassPanels.updateReadableTextColor();
        }
    };

    Button.positionCodeExplainPanel = function(overlay, options = {}) {
        if (!overlay) return;
        const panel = overlay.querySelector('.code-explain-panel');
        if (!panel) return;

        const hasStoredLeft = Number.isFinite(codeExplainDragState.left);
        const hasStoredTop = Number.isFinite(codeExplainDragState.top);
        const left = Number.isFinite(options.left) ? options.left : (hasStoredLeft ? codeExplainDragState.left : null);
        const top = Number.isFinite(options.top) ? options.top : (hasStoredTop ? codeExplainDragState.top : null);

        if (Number.isFinite(left) && Number.isFinite(top)) {
            const next = Button.clampCodeExplainPanelPosition(panel, left, top);
            panel.style.left = `${next.left}px`;
            panel.style.top = `${next.top}px`;
            panel.style.right = 'auto';
            codeExplainDragState.left = next.left;
            codeExplainDragState.top = next.top;
            return;
        }

        panel.style.right = options.right || '24px';
        panel.style.left = options.left || '';
        panel.style.top = options.top || '';
    };

    Button.updateCodeExplainPanelDefaultPosition = function(overlay) {
        if (!overlay || overlay.dataset.codeExplainPositionLocked === '1') return;
        const panel = overlay.querySelector('.code-explain-panel');
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const left = Math.max(12, Math.round((window.innerWidth - rect.width) / 2));
        const top = codeExplainDefaultPosition.top;
        panel.style.right = 'auto';
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        overlay.dataset.codeExplainDefaultLeft = String(left);
        overlay.dataset.codeExplainDefaultTop = String(top);
    };

    Button.positionCodeExplainPanelInitial = function(overlay) {
        if (!overlay || overlay.dataset.codeExplainInitialPositioned === '1') return;
        Button.updateCodeExplainPanelDefaultPosition(overlay);
        overlay.dataset.codeExplainInitialPositioned = '1';
    };

    Button.preserveCodeExplainPlacement = function(overlay) {
        const panel = overlay && overlay.querySelector('.code-explain-panel');
        if (!panel) return null;
        return {
            overlayLeft: overlay.style.left,
            overlayTop: overlay.style.top,
            overlayRight: overlay.style.right,
            overlayBottom: overlay.style.bottom,
            overlayTransform: overlay.style.transform,
            overlayWidth: overlay.style.width,
            overlayHeight: overlay.style.height,
            panelLeft: panel.style.left,
            panelTop: panel.style.top,
            panelRight: panel.style.right,
            panelBottom: panel.style.bottom,
            panelTransform: panel.style.transform,
            panelWidth: panel.style.width,
            panelHeight: panel.style.height
        };
    };

    Button.restoreCodeExplainPlacement = function(overlay, placement) {
        const panel = overlay && overlay.querySelector('.code-explain-panel');
        if (!panel || !placement) return;
        overlay.style.left = placement.overlayLeft;
        overlay.style.top = placement.overlayTop;
        overlay.style.right = placement.overlayRight;
        overlay.style.bottom = placement.overlayBottom;
        overlay.style.transform = placement.overlayTransform;
        overlay.style.width = placement.overlayWidth;
        overlay.style.height = placement.overlayHeight;
        panel.style.left = placement.panelLeft;
        panel.style.top = placement.panelTop;
        panel.style.right = placement.panelRight;
        panel.style.bottom = placement.panelBottom;
        panel.style.transform = placement.panelTransform;
        panel.style.width = placement.panelWidth;
        panel.style.height = placement.panelHeight;
    };

    Button.clampCodeExplainPanelPosition = function(panel, left, top) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const rect = panel.getBoundingClientRect();
        const maxLeft = Math.max(12, viewportWidth - rect.width - 12);
        const maxTop = Math.max(12, viewportHeight - rect.height - 12);
        return {
            left: Math.min(Math.max(left, 12), maxLeft),
            top: Math.min(Math.max(top, 12), maxTop)
        };
    };

    Button.attachCodeExplainDrag = function(overlay) {
        if (!overlay || overlay.dataset.dragBound === '1') return;
        overlay.dataset.dragBound = '1';

        const panel = overlay.querySelector('.code-explain-panel');
        const header = overlay.querySelector('.code-explain-header');
        if (!panel || !header) return;

        const isDragExcluded = (target) => !!target.closest('button, input, textarea, select, code, pre, .code-explain-column, .code-explain-columns-wrap, .code-explain-body');

        const stopDrag = () => {
            codeExplainDragState.active = false;
            codeExplainDragState.pointerId = null;
            header.classList.remove('is-dragging');
        };

        header.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            if (isDragExcluded(event.target)) return;
            if (event.target.closest('.code-explain-actions')) return;

            const rect = panel.getBoundingClientRect();
            codeExplainDragState.active = true;
            codeExplainDragState.pointerId = event.pointerId;
            codeExplainDragState.offsetX = event.clientX - rect.left;
            codeExplainDragState.offsetY = event.clientY - rect.top;
            header.classList.add('is-dragging');
            panel.style.right = 'auto';
            panel.style.left = `${rect.left}px`;
            panel.style.top = `${rect.top}px`;
            header.setPointerCapture(event.pointerId);
            event.preventDefault();
        });

        header.addEventListener('pointermove', (event) => {
            if (!codeExplainDragState.active || codeExplainDragState.pointerId !== event.pointerId) return;
            const next = Button.clampCodeExplainPanelPosition(
                panel,
                event.clientX - codeExplainDragState.offsetX,
                event.clientY - codeExplainDragState.offsetY
            );
            panel.style.left = `${next.left}px`;
            panel.style.top = `${next.top}px`;
            codeExplainDragState.left = next.left;
            codeExplainDragState.top = next.top;
            event.preventDefault();
        });

        header.addEventListener('pointerup', (event) => {
            if (codeExplainDragState.pointerId !== event.pointerId) return;
            stopDrag();
        });

        header.addEventListener('pointercancel', stopDrag);
        header.addEventListener('lostpointercapture', stopDrag);
        window.addEventListener('resize', () => {
            if (!overlay || overlay.hidden) return;
            if (codeExplainDragState.active) return;
            Button.updateCodeExplainPanelDefaultPosition(overlay);
            if (!Number.isFinite(codeExplainDragState.left) || !Number.isFinite(codeExplainDragState.top)) return;
            const next = Button.clampCodeExplainPanelPosition(panel, codeExplainDragState.left, codeExplainDragState.top);
            codeExplainDragState.left = next.left;
            codeExplainDragState.top = next.top;
            panel.style.left = `${next.left}px`;
            panel.style.top = `${next.top}px`;
        });
    };

    Button.attachCodeExplainResize = function(overlay) {
        if (!overlay || overlay.dataset.resizeBound === '1') return;
        overlay.dataset.resizeBound = '1';

        const panel = overlay.querySelector('.code-explain-panel');
        const handle = overlay.querySelector('.code-explain-resize-handle');
        if (!panel || !handle) return;

        const stopResize = () => {
            codeExplainResizeState.active = false;
            codeExplainResizeState.pointerId = null;
            handle.classList.remove('is-resizing');
        };

        handle.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            const rect = panel.getBoundingClientRect();
            codeExplainResizeState.active = true;
            codeExplainResizeState.pointerId = event.pointerId;
            codeExplainResizeState.startY = event.clientY;
            codeExplainResizeState.startHeight = rect.height;
            handle.classList.add('is-resizing');
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
        });

        handle.addEventListener('pointermove', (event) => {
            if (!codeExplainResizeState.active || codeExplainResizeState.pointerId !== event.pointerId) return;
            const delta = event.clientY - codeExplainResizeState.startY;
            const nextHeight = Math.min(800, Math.max(380, codeExplainResizeState.startHeight + delta));
            panel.style.height = `${nextHeight}px`;
            overlay.dataset.panelHeight = String(nextHeight);
            Button.positionCodeExplainPanel(overlay);
            event.preventDefault();
            event.stopPropagation();
        });

        handle.addEventListener('pointerup', (event) => {
            if (codeExplainResizeState.pointerId !== event.pointerId) return;
            stopResize();
        });

        handle.addEventListener('pointercancel', stopResize);
        handle.addEventListener('lostpointercapture', stopResize);
    };

    Button.initializeButtons = function() {
        uiuxPublicDebugLog('Initializing buttons');
        const buttonContainer = document.getElementById('button-container');
        if (buttonContainer) {
            buttonContainer.remove();
        }
        const codeExplainButton = document.getElementById('glass-panel-code-explain');
        if (codeExplainButton) codeExplainButton.remove();
        const codeExplainOverlay = document.getElementById('code-explain-overlay');
        if (codeExplainOverlay) codeExplainOverlay.remove();
        document.body.classList.remove('code-explain-open');
    };

    Button.ensureCodeExplainToolbarButton = function() {
        const insertButton = () => {
            const bar = document.getElementById('glass-control-bar');
            if (!bar) return false;
            if (bar.querySelector('#glass-panel-code-explain')) return true;

            const button = document.createElement('button');
            button.type = 'button';
            button.id = 'glass-panel-code-explain';
            button.textContent = 'コード解説';
            button.classList.add('glass-control-pill');
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => Button.openCodeExplain && Button.openCodeExplain());
            bar.insertBefore(button, bar.firstChild);
            Button.syncCodeExplainToggleButton();
            return true;
        };

        if (insertButton()) return;
        if (codeExplainToolbarTimer) return;

        codeExplainToolbarTimer = window.setInterval(() => {
            const bar = document.getElementById('glass-control-bar');
            if (bar?.querySelector('#glass-panel-code-explain')) {
                window.clearInterval(codeExplainToolbarTimer);
                codeExplainToolbarTimer = null;
                return;
            }
            insertButton();
        }, 250);
    };



    Button.setupButtonContainer = function(targetId = 'button-container', headerText = '2.出力の設定') {
    uiuxPublicDebugLog('Setting up button container');
    const buttonContainer = document.getElementById(targetId);
    if (!buttonContainer) {
        console.error('Button container not found');
        return;
    }

    // Clear existing content
    buttonContainer.innerHTML = '';

    // ボタンヘッダーの作成
    const buttonHeader = document.createElement('div');
    buttonHeader.className = 'ui-header';
    buttonHeader.textContent = headerText;
    buttonContainer.appendChild(buttonHeader);

    // ボタンコンテンツを包む新しいdiv
    const buttonContent = document.createElement('div');
    buttonContent.className = 'ui-content';
    buttonContainer.appendChild(buttonContent);

    // ボタンの作成
    const buttonConfig = [
        { id: 'add-case-btn', text: 'ｹｰｽ追加', handler: Button.addNewCase },
        { id: 'save-btn', text: '保存', handler: Button.saveSettings },
        { id: 'export-btn', text: 'ｴｸｽﾎﾟｰﾄ', handler: Button.exportSettings }
    ];

    buttonConfig.forEach(config => {
        const button = Button.createButton(config.text, config.id, config.handler);
        buttonContent.appendChild(button);
    });

};

    Button.createButton = function(text, id, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.id = id;
        button.addEventListener('click', clickHandler);
        if (id === 'save-btn' || id === 'export-btn') {
            markPublicDemoDisabledButton(button);
        }
        return button;
    };


    Button.handleNextCase = function() {
        uiuxPublicDebugLog('Next case button clicked');
        if (typeof window.prepareNextCase === 'function' && !window.isTransitioning) {
            if (window.RuntimeIntegratedSlotApplyAdapter
                && typeof window.RuntimeIntegratedSlotApplyAdapter.leaveRegisteredSlotMode === 'function') {
                window.RuntimeIntegratedSlotApplyAdapter.leaveRegisteredSlotMode();
            }
            // 番号クリックと同じ順次遷移経路を使う。遷移中の再押下仕様は後続検討とする。
            window.prepareNextCase(null, { interrupt: true, pointSequence: true });
        }
    };

    Button.addNewCase = function() {
        uiuxPublicDebugLog('Add new case button clicked');
        const newCaseIndex = window.cases.length;
        const newCase = {
            config: {
                count: 10,
                color: [0, 0, 0],
                size: 20,
                radius: 100,
                trailLength: 20,
                morphSpeed: 0.01,
                fadeSpeed: 0.05
            },
            update: (frameCount) => {
                // 新しいcaseのupdate関数
            },
            getTargetX: (i) => {
                // 新しいcaseのgetTargetX関数
                return width / 2 + Math.cos(frameCount * 0.01 + i) * 100;
            },
            getTargetY: (i) => {
                // 新しいcaseのgetTargetY関数
                return height / 2 + Math.sin(frameCount * 0.01 + i) * 100;
            }
        };

        window.cases.push(newCase);
        window[`case${newCaseIndex}`] = newCase;

        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }

        alert(`case${newCaseIndex}が追加されました。`);
    };

Button.saveSettings = function() {
    if (blockPublicDemoDisabledAction()) return;
    uiuxPublicDebugLog('Save settings button clicked');
    window.SaveButton.saveSettings();
};

    Button.exportSettings = function() {
        if (blockPublicDemoDisabledAction()) return;
        uiuxPublicDebugLog('Export settings button clicked');
        const allCases = window.cases;
        if (!allCases || allCases.length === 0) return;

        let exportText = '';
        
        allCases.forEach((caseObj, index) => {
            const { count, color, size, radius, trailLength, morphSpeed, fadeSpeed } = caseObj.config;
            const pointSequenceSeconds = Number.isFinite(Number(caseObj.config.pointSequenceSeconds))
                ? Number(caseObj.config.pointSequenceSeconds)
                : 8;
            
            exportText += `window.case${index} = {
        config: {
            count: ${count},
            color: [${color.join(', ')}],
            size: ${size.toFixed(2)},
            radius: ${radius.toFixed(2)},
            trailLength: ${trailLength.toFixed(2)},
            morphSpeed: ${morphSpeed.toFixed(4)},
            fadeSpeed: ${fadeSpeed.toFixed(4)},
            pointSequenceSeconds: ${pointSequenceSeconds.toFixed(1)}
        },
        // その他の既存のプロパティやメソッドはそのまま保持されます
        ...window.case${index}
        };

    `;
        });

        const blob = new Blob([exportText], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_cases_config.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const DEFAULT_CODE_EXPLAIN_DATA = {
        caseId: 'case1',
        title: '円周回転',
        purpose: 'case1.js の動き・構造・改造ポイントをChatGPTに渡して、アニメーション改造の叩き台を作る',
        focusDefault: 'ブロックに触れると意味を表示',
        motionDefault: '選択で動きの対応を表示',
        focusByBlockId: {
            '01': '基本設定 / 土台',
            '02': '角度生成 / 進行角',
            '03': 'X座標 / 左右',
            '04': 'Y座標 / 上下',
            '05': '動きの意味 / 改造入口'
        },
        motionByBlockId: {
            '02': '回転角: 進行方向の角度を作る',
            '03': '左右: cos が横の振れを作る',
            '04': '上下: sin が縦の振れを作る',
            '05': '円周同期: X と Y で軌道になる'
        },
        relatedCode: [
            {
                blockId: '01',
                title: '01 基本設定',
                description: 'window.case1 / config の土台。4点・半径・速度の基準をまとめる。',
                code: [
                    'window.case1 = {',
                    '  initialConfig: {',
                    '    count: 4,',
                    '    radius: 72,',
                    '    morphSpeed: 0.02,',
                    '    fadeSpeed: 0.08',
                    '  },',
                    '  config: {',
                    '    count: 4,',
                    '    radius: 93.29,',
                    '    morphSpeed: 0.0073,',
                    '    fadeSpeed: 0.0005'
                ]
            },
            {
                blockId: '02',
                title: '02 角度生成',
                description: '点番号と時間変化を足し、円周回転の進行角を作る。',
                code: [
                    'getTargetX: (i, frameCount) => {',
                    '  const { count, radius, morphSpeed } = case1.config;',
                    '  const angle = (TWO_PI / count) * i + frameCount * morphSpeed;',
                    '  return width / 2 + Math.cos(angle) * (radius / 2);',
                    '},',
                    'getTargetY: (i, frameCount) => {'
                ]
            },
            {
                blockId: '03',
                title: '03 X座標',
                description: 'Math.cos(angle) の横成分で、左右の振れ幅を作る。',
                code: [
                    '  const { count, radius, morphSpeed } = case1.config;',
                    '  const angle = (TWO_PI / count) * i + frameCount * morphSpeed;',
                    '  return width / 2 + Math.cos(angle) * (radius / 2);',
                    '}'
                ]
            },
            {
                blockId: '04',
                title: '04 Y座標',
                description: 'Math.sin(angle) の縦成分で、上下の振れ幅を作る。',
                code: [
                    'getTargetY: (i, frameCount) => {',
                    '  const { count, radius, morphSpeed } = case1.config;',
                    '  const angle = (TWO_PI / count) * i + frameCount * morphSpeed;',
                    '  return height / 2 + Math.sin(angle) * (radius / 2);',
                    '}'
                ]
            },
            {
                blockId: '05',
                title: '05 動きの意味',
                description: 'getTargetX / getTargetY の関係がそのまま円周回転になる。ここを変えると改造の入口になる。',
                code: [
                    'getTargetX: (i, frameCount) => {',
                    '  // X と Y が同じ angle を共有する',
                    '},',
                    'getTargetY: (i, frameCount) => {',
                    '  // cos / sin を分けると円周運動になる',
                    '}'
                ]
            }
        ],
        params: [
            { label: 'count', value: 4, note: '4点固定' },
            { label: 'radius', value: 93.29, note: '半径' },
            { label: 'morphSpeed', value: 0.0073, note: '速度' },
            { label: 'size', value: 83.32, note: 'サイズ' },
            { label: 'fadeSpeed', value: 0.0005, note: '残像' }
        ],
        sections: [
            {
                title: '01 基本設定',
                left: '点数と半径を決め、4点の円運動の土台を作る。',
                center: 'window.case1 = { ... } の中で、count / radius / morphSpeed / fadeSpeed が見え方を決める。',
                right: '4点が同じ軌道感で回るので、配置より回転の見え方を調整する。',
                bullets: ['4点固定', '円軌道の基準', '改造の土台']
            },
            {
                title: '02 角度生成',
                left: '点ごとの初期角度に時間変化を重ねて回転を作る。',
                center: 'angle = (TWO_PI / count) * i + frameCount * morphSpeed; で、位置と時間変化を同時に作る。',
                right: '等間隔の配置に時間差が乗ると、静止点ではなく回転体として見える。',
                bullets: ['番号で分配', '時間で回転', '軌道の核']
            },
            {
                title: '03 X座標',
                left: 'cos は左右方向を担当し、円の横幅を作る。',
                center: 'Math.cos(angle) が左右を作る。width / 2 を中心に、半径ぶんだけ横へ振る。',
                right: 'cos の波形を変えると、横方向の振れ幅やリズムが変わる。',
                bullets: ['左右の成分', '横幅を形成', '波形改造']
            },
            {
                title: '04 Y座標',
                left: 'sin は上下方向を担当し、円の縦幅を作る。',
                center: 'Math.sin(angle) が上下を作る。height / 2 を中心に、X と同じ角度で縦へ振る。',
                right: 'sin の上下成分が X と同期することで、点は円周をなぞる。',
                bullets: ['上下の成分', '縦幅を形成', '同期回転']
            },
            {
                title: '05 動きの意味',
                left: '円周回転、軌道感、残像の3つが見え方を支える。',
                center: 'この case の主役は「4点が円周上を回る」こと。少し変えるだけで、楕円化・位相ずらし・速度差の改造につながる。',
                right: '入口として、回転軸、速度、半径、残像を差し替えると表現が広がる。',
                bullets: ['円周回転', '改造入口', '表現拡張']
            }
        ]
    };

    Button.getFallbackExplainData = function(caseId = 'case1') {
        const fallback = JSON.parse(JSON.stringify(DEFAULT_CODE_EXPLAIN_DATA));
        fallback.caseId = caseId || fallback.caseId;
        if (caseId !== 'case1') {
            fallback.title = `${caseId}`;
            fallback.shortTitle = caseId;
            fallback.focusDefault = 'このcaseの解説データは未登録です';
            fallback.motionDefault = 'このcaseの解説データは未登録です';
            fallback.focusByBlockId = {};
            fallback.motionByBlockId = {};
            fallback.sections = [{
                title: '未登録',
                left: 'このcaseの解説データは未登録です',
                center: 'data/explain/p5_case_explain_data_draft.json に該当 caseId がありません。',
                right: 'JSONに追加すると、この表示に反映されます。',
                bullets: ['未登録', 'JSON優先', 'fallback表示']
            }];
            fallback.relatedCode = [{
                blockId: '01',
                title: '未登録',
                description: 'このcaseの解説データは未登録です',
                code: ['// no explanation data']
            }];
            fallback.params = DEFAULT_CODE_EXPLAIN_DATA.params;
        }
        return fallback;
    };

    Button.loadCodeExplainData = async function() {
        if (codeExplainDataCache) return codeExplainDataCache;
        if (codeExplainDataPromise) return codeExplainDataPromise;
        codeExplainDataPromise = (async () => {
            try {
                const response = await fetch(`${CODE_EXPLAIN_JSON_URL}${CODE_EXPLAIN_JSON_CACHE_BUST}`, { cache: 'no-store' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const payload = await response.json();
                const cases = Array.isArray(payload?.cases) ? payload.cases : [];
                codeExplainDataCache = {
                    raw: payload,
                    cases: new Map(cases.filter((item) => item && item.caseId).map((item) => [item.caseId, item]))
                };
                return codeExplainDataCache;
            } catch (error) {
                console.warn('Failed to load external code explain data, using fallback.', error);
                codeExplainDataCache = { raw: null, cases: new Map() };
                return codeExplainDataCache;
            } finally {
                codeExplainDataPromise = null;
            }
        })();
        return codeExplainDataPromise;
    };

    Button.getExplainDataForCase = async function(caseId) {
        const loaded = await Button.loadCodeExplainData();
        return loaded.cases.get(caseId) || Button.getFallbackExplainData(caseId);
    };

    Button.getCurrentCaseIndex = function() {
        if (typeof window.getBaseCaseIndex !== 'function') return -1;
        return window.getBaseCaseIndex(window.currentCase);
    };

    Button.getCurrentExplainCaseId = function() {
        const currentIndex = Button.getCurrentCaseIndex();
        if (currentIndex >= 0) {
            return `case${currentIndex}`;
        }
        return DEFAULT_CODE_EXPLAIN_DATA.caseId;
    };

    Button.populateCodeExplainOverlay = function(overlay, data, caseId, options = {}) {
        if (!overlay || !data) return false;
        const preservePlacement = options.preservePlacement === true;
        const placement = preservePlacement ? Button.preserveCodeExplainPlacement(overlay) : null;

        const title = overlay.querySelector('#code-explain-title');
        const subtitle = overlay.querySelector('.code-explain-subtitle');
        const focusText = overlay.querySelector('.code-explain-focus-text');
        const motionText = overlay.querySelector('.code-explain-motion-text');
        const summary = overlay.querySelector('.code-explain-summary');
        const columnsWrap = overlay.querySelector('.code-explain-columns-wrap');
        const leftCol = overlay.querySelector('.code-explain-column-left');
        const centerCol = overlay.querySelector('.code-explain-column-center');
        const rightCol = overlay.querySelector('.code-explain-column-right');

        if (!title || !subtitle || !summary || !leftCol || !centerCol || !rightCol) {
            return false;
        }

        title.textContent = data.title;
        subtitle.textContent = data.shortTitle ? `${data.caseId} / ${data.shortTitle}` : data.caseId;
        summary.innerHTML = `
            <div class="code-explain-summary-grid">
                ${data.params.map((param, index) => `
                    <div class="code-explain-param" data-explain-block="${String(index + 1).padStart(2, '0')}">
                        <span class="code-explain-param-label">${param.label}</span>
                        <span class="code-explain-param-value">${param.value}</span>
                        <span class="code-explain-param-note">${param.note}</span>
                    </div>
                `).join('')}
            </div>
        `;
        if (focusText) {
            focusText.textContent = data.focusDefault;
        }
        if (motionText) {
            motionText.textContent = data.motionDefault;
        }
        overlay.dataset.activeExplainBlock = '';
        overlay.dataset.caseId = data.caseId;

        leftCol.innerHTML = data.sections.map((section, index) => `
            <article class="code-explain-card code-explain-card-side code-explain-card-left" data-explain-block="${String(index + 1).padStart(2, '0')}" data-explain-step="${String(index + 1).padStart(2, '0')}">
                <span class="code-explain-step-badge">${String(index + 1).padStart(2, '0')}</span>
                <h3>${section.title}</h3>
                <p>${section.left}</p>
                <div class="code-explain-mini">
                    ${section.bullets.map((bullet) => `<span>${bullet}</span>`).join('')}
                </div>
            </article>
        `).join('');
        centerCol.innerHTML = data.relatedCode.map((block) => `
            <article class="code-explain-card code-explain-code-card" data-explain-block="${block.blockId}">
                <h3>${block.title}</h3>
                <p class="code-explain-large">${block.description}</p>
                <div class="code-explain-code-shell">
                    <div class="code-explain-code-header">
                        <span>${caseId}.js</span>
                        <span>block ${block.blockId}</span>
                    </div>
                    <div class="code-explain-code-body">
                        <pre><code>${block.code.map((line) => line.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n')}</code></pre>
                    </div>
                </div>
            </article>
        `).join('');
        rightCol.innerHTML = data.sections.map((section, index) => `
            <article class="code-explain-card code-explain-card-side code-explain-card-right" data-explain-block="${String(index + 1).padStart(2, '0')}" data-explain-step="${String(index + 1).padStart(2, '0')}">
                <span class="code-explain-step-badge">${String(index + 1).padStart(2, '0')}</span>
                <h3>${section.title}</h3>
                <p>${section.right}</p>
                <div class="code-explain-mini">
                    ${section.bullets.map((bullet) => `<span>${bullet}</span>`).join('')}
                </div>
            </article>
        `).join('');
        overlay.dataset.selectedExplainBlock = '';
        overlay.dataset.activeMotionBlock = '';
        if (columnsWrap) {
            columnsWrap.scrollTop = 0;
        }
        if (!preservePlacement) {
            if (overlay.dataset.codeExplainPositionLocked !== '1') {
                codeExplainDragState.left = null;
                codeExplainDragState.top = null;
            }
            Button.positionCodeExplainPanelInitial(overlay);
            Button.positionCodeExplainPanel(overlay);
        }
        Button.bindExplainHoverSync(overlay);
        Button.attachCodeExplainResize(overlay);
        if (preservePlacement) {
            Button.restoreCodeExplainPlacement(overlay, placement);
        }
        return true;
    };

    Button.updateCodeExplainContent = async function() {
        const overlay = document.getElementById('code-explain-overlay');
        if (!overlay) return false;
        const caseId = Button.getCurrentExplainCaseId();
        const renderSeq = ++codeExplainRenderSeq;
        const data = await Button.getExplainDataForCase(caseId);
        if (renderSeq !== codeExplainRenderSeq) return false;
        if (overlay.hidden || overlay.style.display === 'none' || overlay.getAttribute('aria-hidden') === 'true') {
            return false;
        }
        const title = overlay.querySelector('#code-explain-title');
        const summary = overlay.querySelector('.code-explain-summary');
        const leftCol = overlay.querySelector('.code-explain-column-left');
        const centerCol = overlay.querySelector('.code-explain-column-center');
        const rightCol = overlay.querySelector('.code-explain-column-right');
        if (!title || !summary || !leftCol || !centerCol || !rightCol) {
            return false;
        }
        return Button.populateCodeExplainOverlay(overlay, data, caseId, { preservePlacement: true });
    };

    Button.syncCodeExplainAfterCaseChange = function() {
        if (!(Button.isCodeExplainVisible && Button.isCodeExplainVisible())) return;
        requestAnimationFrame(() => {
            if (!(Button.isCodeExplainVisible && Button.isCodeExplainVisible())) return;
            const overlay = document.getElementById('code-explain-overlay');
            const placement = Button.preserveCodeExplainPlacement(overlay);
            const updated = Button.updateCodeExplainContent && Button.updateCodeExplainContent();
            if (updated && typeof updated.then === 'function') {
                updated.then((result) => {
                    if (result === false && Button.isCodeExplainVisible && Button.isCodeExplainVisible()) {
                        Button.renderCodeExplainOverlay && Button.renderCodeExplainOverlay({ preservePlacement: true });
                        Button.restoreCodeExplainPlacement(document.getElementById('code-explain-overlay'), placement);
                    }
                });
                return;
            }
            if (updated === false && Button.isCodeExplainVisible && Button.isCodeExplainVisible()) {
                Button.renderCodeExplainOverlay && Button.renderCodeExplainOverlay({ preservePlacement: true });
                Button.restoreCodeExplainPlacement(document.getElementById('code-explain-overlay'), placement);
            }
        });
    };

    Button.buildExplainClipboardText = function() {
        const caseId = Button.getCurrentExplainCaseId();
        const data = (codeExplainDataCache && codeExplainDataCache.cases.get(caseId)) || DEFAULT_CODE_EXPLAIN_DATA;
        const currentCase = window.currentCase && window.currentCase.config ? window.currentCase : null;
        const primaryParams = data.params.map((param) => {
            const currentValue = currentCase && currentCase.config && currentCase.config[param.label] !== undefined
                ? currentCase.config[param.label]
                : param.value;
            const valueText = typeof currentValue === 'number' ? Number(currentValue).toFixed(4).replace(/\.?0+$/, '') : currentValue;
            return `${param.label}: ${valueText}`;
        }).join(', ');

        return `{
  caseId: "${data.caseId}",
  title: "${data.title}",
  primaryParams: { ${primaryParams} },
  relatedCode: [
${data.relatedCode.map((line) => `    "${line}"`).join(',\n')}
  ],
  purpose: "${data.purpose}"
}`;
    };

    Button.rebuildCodeExplainOverlayShell = function(overlay) {
        if (!overlay) return false;
        overlay.innerHTML = `
            <div class="code-explain-panel" role="dialog" aria-modal="true" aria-labelledby="code-explain-title">
                <div class="code-explain-header">
                    <div class="code-explain-header-left">
                        <div class="code-explain-case">case1｜円周回転</div>
                        <div class="code-explain-title-group">
                            <h2 id="code-explain-title"></h2>
                            <div class="code-explain-subtitle"></div>
                        </div>
                    </div>
                    <div class="code-explain-status">
                        <span class="code-explain-focus-label">focus</span>
                        <span class="code-explain-focus-text"></span>
                        <span class="code-explain-divider">/</span>
                        <span class="code-explain-motion-label">motion</span>
                        <span class="code-explain-motion-text"></span>
                    </div>
                    <div class="code-explain-actions">
                        <button type="button" class="code-explain-copy">素材コピー</button>
                        <button type="button" class="code-explain-close" aria-label="閉じる">×</button>
                    </div>
                </div>
                <div class="code-explain-body">
                    <section class="code-explain-summary"></section>
                    <section class="code-explain-columns-wrap" aria-label="case1コード解説">
                        <div class="code-explain-columns">
                            <div class="code-explain-column code-explain-column-left"></div>
                            <div class="code-explain-column code-explain-column-center"></div>
                            <div class="code-explain-column code-explain-column-right"></div>
                        </div>
                    </section>
                </div>
                <div class="code-explain-resize-handle" aria-hidden="true"></div>
            </div>
        `;
        overlay.querySelector('.code-explain-close').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            Button.closeCodeExplain();
        });
        overlay.querySelector('.code-explain-copy').addEventListener('click', Button.copyExplainMaterial);
        overlay.dataset.dragBound = '';
        overlay.dataset.resizeBound = '';
        overlay.dataset.hoverSyncBound = '';
        Button.attachCodeExplainDrag(overlay);
        return true;
    };

    Button.ensureCodeExplainOverlay = function() {
        let overlay = document.getElementById('code-explain-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'code-explain-overlay';
        overlay.className = 'code-explain-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        Button.rebuildCodeExplainOverlayShell(overlay);
        document.body.appendChild(overlay);

        return overlay;
    };

    Button.openCodeExplainPanel = function() {
        const overlay = Button.ensureCodeExplainOverlay();
        if (!overlay) return;
        if (codeExplainOpenTimer) {
            window.clearTimeout(codeExplainOpenTimer);
            codeExplainOpenTimer = null;
        }
        if (codeExplainCloseTimer) {
            window.clearTimeout(codeExplainCloseTimer);
            codeExplainCloseTimer = null;
        }
        codeExplainIsOpen = true;
        overlay.hidden = false;
        overlay.style.display = '';
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.remove('is-hidden');
        overlay.classList.remove('is-closing');
        overlay.classList.add('is-open');
        Button.updateCodeExplainPanelDefaultPosition(overlay);
        Button.syncCodeExplainToggleButton();
        overlay.offsetHeight;
        requestAnimationFrame(() => {
            overlay.classList.add('is-animated');
            Button.syncCodeExplainToggleButton();
            if (window.UIGlassPanels && typeof window.UIGlassPanels.updateReadableTextColor === 'function') {
                window.UIGlassPanels.updateReadableTextColor();
            }
        });
    };

    Button.closeCodeExplainPanel = function() {
        const overlay = document.getElementById('code-explain-overlay');
        if (!overlay) return;
        if (codeExplainOpenTimer) {
            window.clearTimeout(codeExplainOpenTimer);
            codeExplainOpenTimer = null;
        }
        if (codeExplainCloseTimer) {
            window.clearTimeout(codeExplainCloseTimer);
            codeExplainCloseTimer = null;
        }
        codeExplainIsOpen = false;
        Button.syncCodeExplainToggleButton();
        overlay.classList.remove('is-animated');
        overlay.classList.add('is-closing');
        overlay.classList.remove('is-open');
        codeExplainCloseTimer = window.setTimeout(() => {
            overlay.classList.remove('is-closing');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.classList.add('is-hidden');
            overlay.hidden = true;
            overlay.style.display = 'none';
            document.body.classList.remove('code-explain-open');
            codeExplainCloseTimer = null;
            Button.syncCodeExplainToggleButton();
        }, 700);
    };

    Button.renderCodeExplainOverlay = async function(options = {}) {
        const overlay = Button.ensureCodeExplainOverlay();
        const preservePlacement = options.preservePlacement === true;
        const placement = preservePlacement ? Button.preserveCodeExplainPlacement(overlay) : null;
        const caseId = Button.getCurrentExplainCaseId();
        const data = await Button.getExplainDataForCase(caseId);
        if (!Button.populateCodeExplainOverlay(overlay, data, caseId, { preservePlacement })) {
            if (!Button.rebuildCodeExplainOverlayShell(overlay)) return false;
            if (preservePlacement) {
                Button.restoreCodeExplainPlacement(overlay, placement);
            }
            if (!Button.populateCodeExplainOverlay(overlay, data, caseId, { preservePlacement })) {
                return false;
            }
        }
        if (preservePlacement) {
            Button.restoreCodeExplainPlacement(overlay, placement);
        }
        return true;
    };

    Button.bindExplainHoverSync = function(overlay) {
        if (!overlay || overlay.dataset.hoverSyncBound === '1') return;
        overlay.dataset.hoverSyncBound = '1';
        const leftCol = overlay.querySelector('.code-explain-column-left');
        const centerCol = overlay.querySelector('.code-explain-column-center');
        const rightCol = overlay.querySelector('.code-explain-column-right');
        const focusText = overlay.querySelector('.code-explain-focus-text');
        const motionText = overlay.querySelector('.code-explain-motion-text');
        const setSelected = (blockId) => {
            overlay.dataset.selectedExplainBlock = blockId || '';
            overlay.dataset.activeMotionBlock = blockId || '';
            overlay.querySelectorAll('[data-explain-block]').forEach((node) => {
                node.classList.toggle('is-selected', node.getAttribute('data-explain-block') === blockId);
            });
        };
        const syncColumnsToBlock = (blockId, clickedItem) => {
            if (!blockId || !clickedItem) return;
            const targetOffset = 8;
            [leftCol, centerCol, rightCol].forEach((column) => {
                if (!column) return;
                const target = column.querySelector(`[data-explain-block="${blockId}"]`);
                if (!target) return;
                const columnRect = column.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const desiredTop = column.scrollTop + (targetRect.top - columnRect.top) - targetOffset;
                const maxTop = Math.max(0, column.scrollHeight - column.clientHeight);
                column.scrollTop = Math.min(Math.max(desiredTop, 0), maxTop);
            });
        };
        const dispatchFocusChange = (blockId) => {
            const caseId = overlay.dataset.caseId || DEFAULT_CODE_EXPLAIN_DATA.caseId;
            const activeData = (codeExplainDataCache && codeExplainDataCache.cases.get(caseId)) || Button.getFallbackExplainData(caseId);
            const label = blockId ? (activeData.focusByBlockId[blockId] || '') : '';
            const motionLabel = blockId ? (activeData.motionByBlockId[blockId] || activeData.motionDefault) : activeData.motionDefault;
            overlay.dataset.activeExplainBlock = blockId || '';
            overlay.dataset.activeMotionBlock = blockId || '';
            if (focusText) {
                focusText.textContent = label || activeData.focusDefault;
            }
            if (motionText) {
                motionText.textContent = motionLabel;
            }
            document.body.dataset.activeMotionBlock = blockId || '';
            window.dispatchEvent(new CustomEvent('caseExplainFocusChange', {
                detail: {
                    caseId,
                    blockId: blockId || null,
                    label: label || activeData.focusDefault
                }
            }));
        };
        const setActive = (blockId) => {
            dispatchFocusChange(blockId);
            overlay.querySelectorAll('[data-explain-block]').forEach((node) => {
                node.classList.toggle('is-hovered', node.getAttribute('data-explain-block') === blockId);
            });
        };
        const clearActive = () => {
            dispatchFocusChange(null);
            overlay.querySelectorAll('[data-explain-block]').forEach((node) => node.classList.remove('is-hovered'));
        };
        overlay.addEventListener('pointerover', (event) => {
            const item = event.target.closest('[data-explain-block]');
            if (!item || !overlay.contains(item)) return;
            setActive(item.getAttribute('data-explain-block'));
        });
        overlay.addEventListener('pointerleave', clearActive);
        overlay.addEventListener('focusin', (event) => {
            const item = event.target.closest('[data-explain-block]');
            if (!item || !overlay.contains(item)) return;
            setActive(item.getAttribute('data-explain-block'));
        });
        overlay.addEventListener('focusout', clearActive);
        overlay.addEventListener('click', (event) => {
            const item = event.target.closest('[data-explain-block]');
            if (!item || !overlay.contains(item)) return;
            const blockId = item.getAttribute('data-explain-block');
            const isParamCard = item.classList.contains('code-explain-param');
            const isCenterCard = !!item.closest('.code-explain-column-center');
            const isSideCard = !!item.closest('.code-explain-column-left') || !!item.closest('.code-explain-column-right');
            setSelected(blockId);
            if (isSideCard || isCenterCard || isParamCard) {
                syncColumnsToBlock(blockId, item);
            }
            dispatchFocusChange(blockId);
            overlay.querySelectorAll('[data-explain-block]').forEach((node) => node.classList.toggle('is-hovered', node.getAttribute('data-explain-block') === blockId));
        });
    };

    Button.openCodeExplain = async function() {
        const overlay = Button.ensureCodeExplainOverlay();
        if (codeExplainIsOpen || document.body.classList.contains('code-explain-open')) {
            Button.closeCodeExplainPanel();
            return;
        }
        await Button.renderCodeExplainOverlay();
        Button.openCodeExplainPanel();
        document.body.classList.add('code-explain-open');
    };

    Button.closeCodeExplain = function() {
        Button.closeCodeExplainPanel();
        delete document.body.dataset.activeMotionBlock;
        if (!codeExplainCloseTimer) {
            document.body.classList.remove('code-explain-open');
        }
    };

    Button.copyExplainMaterial = async function() {
        const text = Button.buildExplainClipboardText();
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', 'readonly');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    };

})(window.Button);

document.addEventListener('caseChanged', function() {
    if (!window.Button || typeof window.Button.syncCodeExplainAfterCaseChange !== 'function') return;
    window.Button.syncCodeExplainAfterCaseChange();
});

document.addEventListener('DOMContentLoaded', function() {
    if (window.Button && typeof window.Button.initializeButtons === 'function') {
        window.Button.initializeButtons();
    } else {
        console.error('Button object or initializeButtons function is not available');
    }
});
