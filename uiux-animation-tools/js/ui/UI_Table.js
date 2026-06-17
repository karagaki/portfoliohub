// UI_Table.js - 5.描画 case切替パレット（登録slot UI付き）
(function () {
    'use strict';

    const LAYOUT_KEY = 'casePaletteLayoutMode';
    const HORIZONTAL = 'horizontal';
    const VERTICAL = 'vertical';
    const CASE_COUNT = 11;
    const BUTTON_SIZE = 21;
    const BUTTON_GAP = 2;
    const TOGGLE_GAP = 4;
    const STEP_MS = 200;
    const MOVE_MS = 800;
    const ARC_X = 0;
    const SLOT_IDS = ['-', 'a', 'b', 'c', 'd', 'e'];

    let root = null;
    let toggleButton = null;
    let stage = null;
    let buttons = [];
    let layoutMode = HORIZONTAL;
    let animationToken = 0;
    let plusButton = null;
    let updateButton = null;
    let deleteButton = null;
    let slotLayer = null;
    let statusLabel = null;
    let displayedSlotCaseId = null;
    let hoverCaseId = null;
    let slotHoverCaseId = null;
    let slotHideTimer = null;

    function slotApi() {
        return window.RuntimeIntegratedSlotApplyAdapter || null;
    }
    function loadLayoutMode() {
        return localStorage.getItem(LAYOUT_KEY) === VERTICAL ? VERTICAL : HORIZONTAL;
    }
    function saveLayoutMode(mode) {
        localStorage.setItem(LAYOUT_KEY, mode);
    }
    function getRootSize() {
        const pitch = BUTTON_SIZE + BUTTON_GAP;
        return {
            width: (CASE_COUNT + 4) * pitch + TOGGLE_GAP,
            height: (CASE_COUNT + 1) * pitch
        };
    }
    function getTogglePosition() {
        const size = getRootSize();
        return { x: 0, y: size.height - BUTTON_SIZE };
    }
    function getButtonPosition(index, mode) {
        const pitch = BUTTON_SIZE + BUTTON_GAP;
        const size = getRootSize();
        if (mode === VERTICAL) return { x: 0, y: (CASE_COUNT - 1 - index) * pitch };
        return { x: pitch + TOGGLE_GAP + index * pitch, y: size.height - BUTTON_SIZE };
    }
    function getActionPosition(which, mode) {
        const pitch = BUTTON_SIZE + BUTTON_GAP;
        const size = getRootSize();
        const bottomY = size.height - BUTTON_SIZE;
        const plusX = pitch + TOGGLE_GAP + CASE_COUNT * pitch;

        // ▲表示（縦配置）: + / 更新 / 削除 を右並びにする。
        if (mode === VERTICAL) {
            const actionIndex = which === 'plus' ? 0 : (which === 'update' ? 1 : 2);
            return { x: pitch + TOGGLE_GAP + actionIndex * pitch, y: bottomY };
        }

        // ▶表示（横配置）: + を下端、更新 / 削除をその上へ縦並びにする。
        if (which === 'plus') return { x: plusX, y: bottomY };
        if (which === 'update') return { x: plusX, y: bottomY - pitch };
        return { x: plusX, y: bottomY - pitch * 2 };
    }
    function getSlotPosition(caseIndex, slotOrder, mode) {
        const pitch = BUTTON_SIZE + BUTTON_GAP;
        const base = getButtonPosition(caseIndex, mode);
        // 縦配置時は、選択中case番号の右側へ - / a〜e を横方向に展開する。
        if (mode === VERTICAL) {
            return { x: base.x + pitch + TOGGLE_GAP + slotOrder * pitch, y: base.y };
        }
        return { x: base.x, y: base.y - (slotOrder + 1) * pitch };
    }
    function setNodePosition(node, position) {
        node.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
    function currentActive() {
        const api = slotApi();
        return api ? api.getStatus().activeVisualSlot : null;
    }
    function currentBaseCaseId() {
        return typeof window.getBaseCaseIndex === 'function' ? window.getBaseCaseIndex(window.currentCase) : Number(window.state);
    }
    function activeDisplayCase() {
        const active = currentActive();
        if (slotHoverCaseId !== null) return slotHoverCaseId;
        if (hoverCaseId !== null) return hoverCaseId;
        return active ? active.caseId : displayedSlotCaseId;
    }

    function cancelSlotHide() {
        if (slotHideTimer !== null) {
            window.clearTimeout(slotHideTimer);
            slotHideTimer = null;
        }
    }

    function keepSlotTrayForCase(caseId) {
        cancelSlotHide();
        hoverCaseId = caseId;
        displayedSlotCaseId = caseId;
        renderSlotLayer();
    }

    function scheduleSlotTrayClose() {
        cancelSlotHide();
        slotHideTimer = window.setTimeout(function () {
            hoverCaseId = null;
            slotHoverCaseId = null;
            slotHideTimer = null;
            renderSlotLayer();
        }, 420);
    }


    function layoutToggleIconMarkup() {
        return '<svg class="case-layout-icon" viewBox="0 0 128 128" aria-hidden="true" focusable="false"><path d="M64 14 C68 14 72 17 75 22 L117 94 C120 99 120 105 117 110 C114 115 109 118 103 118 H25 C19 118 14 115 11 110 C8 105 8 99 11 94 L53 22 C56 17 60 14 64 14 Z" fill="rgba(255,255,255,0.94)"/></svg>';
    }
    function ensureLayoutToggleIcon() {
        if (!toggleButton) return;
        if (!toggleButton.querySelector('.case-layout-icon')) {
            toggleButton.innerHTML = layoutToggleIconMarkup();
        }
    }

    function setStaticLayout(mode) {
        if (!root || !toggleButton) return;
        const size = getRootSize();
        root.style.setProperty('width', `${size.width}px`, 'important');
        root.style.setProperty('height', `${size.height}px`, 'important');
        root.dataset.layout = mode;
        setNodePosition(toggleButton, getTogglePosition());
        buttons.forEach((button, index) => setNodePosition(button, getButtonPosition(index, mode)));
        if (plusButton) setNodePosition(plusButton, getActionPosition('plus', mode));
        if (updateButton) setNodePosition(updateButton, getActionPosition('update', mode));
        if (deleteButton) setNodePosition(deleteButton, getActionPosition('delete', mode));
        positionStatusLabel(mode);
        ensureLayoutToggleIcon();
        toggleButton.setAttribute('aria-label', mode === VERTICAL ? 'case一覧を横に戻す' : 'case一覧を縦に並べる');
        toggleButton.setAttribute('aria-pressed', String(mode === VERTICAL));
        renderSlotLayer();
    }

    function positionStatusLabel(mode) {
        if (!statusLabel) return;
        if (mode === VERTICAL && updateButton) {
            const deletePos = getActionPosition('delete', mode);
            statusLabel.style.left = `${deletePos.x + BUTTON_SIZE + 6}px`;
            statusLabel.style.top = `${deletePos.y + 3}px`;
            statusLabel.style.right = 'auto';
            statusLabel.style.bottom = 'auto';
            statusLabel.style.transform = 'translateY(0)';
            return;
        }
        statusLabel.style.left = '';
        statusLabel.style.top = '';
        statusLabel.style.right = '';
        statusLabel.style.bottom = '';
        statusLabel.style.transform = '';
    }
    function getVisualPosition(node) {
        const transform = window.getComputedStyle(node).transform;
        if (!transform || transform === 'none') return { x: 0, y: 0 };
        try {
            const matrix = new DOMMatrixReadOnly(transform);
            return { x: matrix.m41, y: matrix.m42 };
        } catch (error) {
            const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),\s*([^\)]+)\)/);
            return match ? { x: Number(match[1]) || 0, y: Number(match[2]) || 0 } : { x: 0, y: 0 };
        }
    }
    function arcKeyframes(from, to, goingVertical) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const curve = goingVertical ? ARC_X : -ARC_X;
        return [
            { transform: `translate(${from.x}px, ${from.y}px)` },
            { transform: `translate(${from.x + dx * 0.34 + curve}px, ${from.y + dy * 0.32}px)` },
            { transform: `translate(${from.x + dx * 0.70 + curve * 0.55}px, ${from.y + dy * 0.72}px)` },
            { transform: `translate(${to.x}px, ${to.y}px)` }
        ];
    }
    function animateToLayout(nextMode) {
        const token = ++animationToken;
        const goingVertical = nextMode === VERTICAL;
        layoutMode = nextMode;
        saveLayoutMode(nextMode);
        root.dataset.layout = nextMode;
        root.classList.add('is-layout-animating');
        positionStatusLabel(nextMode);
        ensureLayoutToggleIcon();
        buttons.forEach((button, orderIndex) => {
            const caseIndex = Number(button.dataset.case);
            const from = getVisualPosition(button);
            const to = getButtonPosition(caseIndex, nextMode);
            button.getAnimations().forEach((animation) => animation.cancel());
            setNodePosition(button, from);
            const animation = button.animate(arcKeyframes(from, to, goingVertical), {
                duration: MOVE_MS, delay: orderIndex * STEP_MS,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards'
            });
            animation.onfinish = function () {
                if (token !== animationToken) return;
                setNodePosition(button, to);
                animation.cancel();
            };
        });
        setNodePosition(plusButton, getActionPosition('plus', nextMode));
        setNodePosition(updateButton, getActionPosition('update', nextMode));
        setNodePosition(deleteButton, getActionPosition('delete', nextMode));
        const totalMs = MOVE_MS + (CASE_COUNT - 1) * STEP_MS + 30;
        window.setTimeout(function () {
            if (token !== animationToken) return;
            buttons.forEach((button, index) => {
                button.getAnimations().forEach((animation) => animation.cancel());
                setNodePosition(button, getButtonPosition(index, nextMode));
            });
            positionStatusLabel(nextMode);
            root.classList.remove('is-layout-animating');
            renderSlotLayer();
        }, totalMs);
    }
    function toggleLayout() { animateToLayout(layoutMode === HORIZONTAL ? VERTICAL : HORIZONTAL); }

    function switchToCase(index) {
        const api = slotApi();
        if (api && api.hasCaseRecord(index)) {
            api.selectRegisteredSlot(index, '-');
        } else if (window.TableNext && typeof window.TableNext.switchToCase === 'function') {
            if (api && typeof api.leaveRegisteredSlotMode === 'function') {
                api.leaveRegisteredSlotMode();
            }
            window.TableNext.switchToCase(index);
        }
        displayedSlotCaseId = index;
        updateCaseComparisonTable();
    }

    function createButton(index) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'case-choice-button case-header';
        button.dataset.case = String(index);
        button.textContent = String(index);
        button.setAttribute('aria-label', `Case ${index}へ切替`);
        button.addEventListener('click', function () { switchToCase(index); });
        button.addEventListener('mouseenter', function () {
            slotHoverCaseId = null;
            keepSlotTrayForCase(index);
        });
        button.addEventListener('mouseleave', function () {
            scheduleSlotTrayClose();
        });
        return button;
    }
    function createActionButton(label, className, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `case-action-button ${className}`;
        button.textContent = label;
        button.addEventListener('click', onClick);
        return button;
    }
    function registerCurrent() {
        const api = slotApi();
        if (!api) return;
        const result = api.registerCurrentSlot();
        if (result.ok && Number.isInteger(result.caseId)) {
            displayedSlotCaseId = result.caseId;
        }
        renderSlotLayer();
        updateActions();
    }
    function updateCurrent() {
        const api = slotApi();
        if (!api) return;
        const allowed = api.canUpdate();
        if (!allowed.ok) return;
        if (!window.confirm('選択中の登録を更新しますか？')) return;
        const result = api.updateSelectedSlot();
        if (!result.ok) window.alert(result.message || '更新できません');
        renderSlotLayer();
        updateActions();
    }

    function deleteCurrent() {
        const api = slotApi();
        if (!api) return;
        const allowed = api.canDelete();
        if (!allowed.ok) return;
        if (!window.confirm('削除しますか？')) return;
        const result = api.deleteSelectedSlot();
        if (!result.ok) window.alert(result.message || '削除できません');
        renderSlotLayer();
        updateActions();
    }
    function updateActions() {
        const api = slotApi();
        if (!api || !plusButton || !deleteButton) return;
        const add = api.canRegister();
        const update = api.canUpdate();
        const del = api.canDelete();
        plusButton.disabled = !add.ok;
        updateButton.disabled = !update.ok;
        deleteButton.disabled = !del.ok;
        plusButton.title = add.message || '';
        updateButton.title = update.message || '';
        deleteButton.title = del.message || '';
        plusButton.classList.toggle('is-unavailable', !add.ok);
        updateButton.classList.toggle('is-unavailable', !update.ok);
        deleteButton.classList.toggle('is-unavailable', !del.ok);
        const status = api.getStatus();
        if (statusLabel) {
            const feedback = status.feedback;
            statusLabel.textContent = feedback ? feedback.message : '';
            statusLabel.dataset.kind = feedback ? feedback.kind : '';
            statusLabel.classList.toggle('is-visible', Boolean(feedback && feedback.message));
            positionStatusLabel(layoutMode);
        }
    }
    function renderSlotLayer() {
        if (!slotLayer) return;
        const api = slotApi();
        const caseId = activeDisplayCase();
        slotLayer.innerHTML = '';
        if (!api || !Number.isInteger(caseId) || caseId < 0 || caseId >= CASE_COUNT) return;

        const info = api.getSlotsForCase(caseId);
        const active = currentActive();
        const visible = info.base || caseId === currentBaseCaseId();
        if (!visible) return;
        const shown = ['-'].concat(info.slots);
        shown.forEach(function (slotId, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'case-slot-button';
            button.textContent = slotId;
            button.dataset.case = String(caseId);
            button.dataset.slot = slotId;
            const selected = active && active.caseId === caseId && active.slotId === slotId;
            const draftSource = selected && active.isDraft;
            button.classList.toggle('is-selected', Boolean(selected));
            button.classList.toggle('is-draft-source', Boolean(draftSource));
            button.setAttribute('aria-pressed', String(Boolean(selected)));
            button.title = slotId === '-' ? `Case ${caseId} の基準設定` : `Case ${caseId}-${slotId} を表示`;
            setNodePosition(button, getSlotPosition(caseId, index, layoutMode));
            button.addEventListener('mouseenter', function () {
                cancelSlotHide();
                slotHoverCaseId = caseId;
                hoverCaseId = caseId;
            });
            button.addEventListener('mouseleave', function () {
                scheduleSlotTrayClose();
            });
            button.addEventListener('click', function () {
                cancelSlotHide();
                slotHoverCaseId = null;
                hoverCaseId = null;
                displayedSlotCaseId = caseId;
                const result = api.selectRegisteredSlot(caseId, slotId);
                if (!result.ok) window.alert(result.message || '切り替えできません');
                renderSlotLayer();
                updateActions();
            });
            slotLayer.appendChild(button);
            requestAnimationFrame(function () { button.classList.add('is-visible'); });
        });
    }

    function createPalette() {
        const container = document.getElementById('case-comparison');
        if (!container) return;
        root = container;
        root.innerHTML = '';
        root.classList.add('case-palette-only', 'registered-slot-enabled');
        root.setAttribute('aria-label', '描画切替');

        stage = document.createElement('div');
        stage.id = 'case-button-stage';
        stage.className = 'case-button-stage';
        root.appendChild(stage);

        toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.id = 'case-layout-toggle';
        toggleButton.className = 'case-layout-toggle';
        toggleButton.innerHTML = layoutToggleIconMarkup();
        toggleButton.addEventListener('click', toggleLayout);
        stage.appendChild(toggleButton);

        buttons = [];
        for (let index = 0; index < CASE_COUNT; index += 1) {
            const button = createButton(index);
            buttons.push(button);
            stage.appendChild(button);
        }

        plusButton = createActionButton('', 'case-add-slot-button', registerCurrent);
        plusButton.innerHTML = '<img class="case-action-icon case-add-slot-icon" src="assets/icons/case-action-add.png" alt="" aria-hidden="true" decoding="async">';
        plusButton.setAttribute('aria-label', '現在の設定を新規登録');
        updateButton = createActionButton('', 'case-update-slot-button', updateCurrent);
        updateButton.innerHTML = '<img class="case-action-icon case-update-slot-icon" src="assets/icons/case-action-update.png" alt="" aria-hidden="true" decoding="async">';
        updateButton.setAttribute('aria-label', '選択中の登録を更新');
        deleteButton = createActionButton('', 'case-delete-slot-button', deleteCurrent);
        deleteButton.innerHTML = '<img class="case-action-icon case-delete-slot-icon" src="assets/icons/case-action-delete.png" alt="" aria-hidden="true" decoding="async">';
        deleteButton.setAttribute('aria-label', '選択中の登録を削除');
        stage.appendChild(plusButton);
        stage.appendChild(updateButton);
        stage.appendChild(deleteButton);

        slotLayer = document.createElement('div');
        slotLayer.className = 'case-slot-layer';
        stage.appendChild(slotLayer);

        statusLabel = document.createElement('div');
        statusLabel.className = 'case-slot-status';
        statusLabel.setAttribute('aria-live', 'polite');
        stage.appendChild(statusLabel);
        stage.addEventListener('mouseleave', function () {
            scheduleSlotTrayClose();
        });
        stage.addEventListener('mouseenter', function () {
            cancelSlotHide();
        });

        layoutMode = loadLayoutMode();
        displayedSlotCaseId = currentBaseCaseId();
        setStaticLayout(layoutMode);
        updateCaseComparisonTable();
    }

    function updateCaseComparisonTable() {
        if (!buttons.length) return;
        const currentIndex = currentBaseCaseId();
        const pointSequenceState = window.__pointSequenceTransition;
        const transitionTargetIndex = window.isTransitioning && pointSequenceState && pointSequenceState.active
            && window.nextCase && typeof window.getBaseCaseIndex === 'function'
            ? window.getBaseCaseIndex(window.nextCase) : -1;
        buttons.forEach(function (button, index) {
            const available = Array.isArray(window.cases) ? Boolean(window.cases[index]) : true;
            const isCurrent = index === currentIndex;
            const isTransitionTarget = index === transitionTargetIndex;
            button.disabled = !available;
            button.classList.toggle('unavailable-case', !available);
            button.classList.toggle('current-case', isCurrent);
            button.classList.toggle('transition-target-case', isTransitionTarget);
            button.setAttribute('aria-current', isCurrent ? 'true' : 'false');
            button.setAttribute('aria-busy', isTransitionTarget ? 'true' : 'false');
        });
        updateActions();
        renderSlotLayer();
    }
    function initializeCaseComparisonTable() { createPalette(); }
    function adjustTableHeight() {}
    function restoreTableState() { if (root) setStaticLayout(layoutMode); }

    window.Table = {
        initializeCaseComparisonTable, updateCaseComparisonTable, adjustTableHeight, restoreTableState
    };
    document.addEventListener('caseChanged', updateCaseComparisonTable);
    document.addEventListener('registeredSlotStateChanged', updateCaseComparisonTable);
    document.addEventListener('DOMContentLoaded', initializeCaseComparisonTable);
})();
