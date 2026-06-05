// UI_HelpCaption.js - 画面中心下の短文案内表示（ホバー / 順次遷移）
// 文言を調整する場合は、このファイル冒頭の HELP_TEXT だけを編集してください。
window.UIHelpCaption = (function() {
    const HELP_TEXT = {
        // 2.点 / スライダー類
        sliders: {
            count: '点の数を調整｜増減時は分岐・集束の形が変わる',
            size: '点の大きさを調整｜線の太さと密度感が変わる',
            radius: '全体スケールを調整｜描画の広がりを変える',
            trailLength: '軌跡の幅を調整｜線が残る長さを変える',
            morphSpeed: '点の速度を調整｜描画の進む速さを変える',
            fadeSpeed: '墨の幅を調整｜残像の濃さと消え方を変える',
            pointSequenceSeconds: '順次遷移を調整｜このcaseへ入る時の移行時間',
            'cursor-radius': 'カーソル幅を調整｜反応する範囲を変える',
            'cursor-strength': '影響強度を調整｜カーソルによる変化量を変える',
            'pull-strength': '引寄せ強度を調整｜点をカーソルへ寄せる',
            canvasScale: 'キャンバス表示倍率を調整',
            vectorSpeed: '画像をなぞる速度を調整',
            vectorDirection: '画像をなぞる方向を調整',
            vectorSize: '画像をなぞる大きさを調整',
            red: '赤の強さを調整',
            green: '緑の強さを調整',
            blue: '青の強さを調整'
        },

        // id が固定されている操作
        ids: {
            'next-case-btn': '次のcaseへ移行｜設定された遷移で描画を切り替える',
            'glass-panel-code-explain': 'コード解説を表示｜描画の仕組みを確認する',
            'glass-panel-reset': '配置リセット｜パネルを初期位置に戻す',
            'add-case-btn': 'caseを追加｜新しい描画設定を作成する',
            'save-btn': '保存｜現在のcase設定を記録する',
            'export-btn': 'エクスポート｜case設定を書き出す',
            'svg-toggle-btn': 'SVG効果を切替｜読み込んだSVGの反映を変更する',
            'remove-image-btn': '画像を削除｜読み込んだ画像を外す',
            'toggle-image-btn': '画像切替｜読み込んだ画像の表示を切り替える',
            'color-transition-seconds': '配色の遷移秒を調整｜色が馴染む時間を変える',
            'color-engine-regenerate': '配色を再生成｜現在の条件で色を作り直す',
            'color-mode-select': '配色モードを選択｜色の生成方法を切り替える',
            'color-engine-assign-mode': '色の割当を選択｜点へ色を配る規則を変える',
            'hue-range-assign-mode': '色相の割当方法を選択',
            'random-color-assign-mode': 'ランダム色の割当方法を選択',
            'ui-variant-select': 'UIバリエーションを選択｜画面の見た目を切り替える',
            'ui-preset-select': 'UIプリセットを選択｜ガラス表現の設定を切り替える',
            'trail-mode-select': '軌跡の表示方式を選択'
        },

        // ボタンに表示される文字。後から文言を編集しやすい入口。
        buttonText: {
            '次へ': '次のcaseへ移行｜設定された遷移で描画を切り替える',
            'コード解説': 'コード解説を表示｜描画の仕組みを確認する',
            '配置リセット': '配置リセット｜パネルを初期位置に戻す',
            '流線表示': '流線表示｜点の通った線を流れとして残す',
            '残像表示': '残像表示｜通過した描画を蓄積して残す',
            '保存': '保存｜現在のcase設定を記録する',
            'ｴｸｽﾎﾟｰﾄ': 'エクスポート｜case設定を書き出す',
            'ｹｰｽ追加': 'caseを追加｜新しい描画設定を作成する',
            '[固定]': '変化方法を切替｜固定値または周期変化を選ぶ',
            '[0.5周期]': '周期変化｜このcaseのアニメーション0.5回分で値を往復させる',
            '[1周期]': '周期変化｜このcaseのアニメーション1回分で値を往復させる',
            '[4周期]': '周期変化｜このcaseのアニメーション4回分で値を往復させる',
            '初期値': '初期値へ戻す｜この項目の設定をリセットする',
            '馴染': '色を馴染ませる｜配色の切替を滑らかにする',
            '再配色': '再配色｜選択した配色を描画へ反映する',
            '詳細設定 ▼': '配色の詳細設定を開く',
            '詳細設定 ▲': '配色の詳細設定を閉じる',
            'すべて表示': '全パネルを表示する',
            'すべて非表示': '全パネルを非表示にする',
            'カーソル全開': 'カーソル関連パネルをすべて開く',
            'カーソル全閉': 'カーソル関連パネルをすべて閉じる',
            'SVG有効': 'SVG表示を有効にする',
            'SVG無効': 'SVG表示を無効にする',
            '画像削除': '読み込んだ画像を削除する',
            '画像切替': '読み込んだ画像の表示を切り替える',
            '素材コピー': 'コード解説の素材をコピーする',
            '×': 'この表示を閉じる',
            '閉じる': 'このパネルを閉じる',
            'ON': 'SVG効果を無効にする',
            'OFF': 'SVG効果を有効にする'
        },

        // 右下の小さいボタン
        quickPanels: {
            'glass-cursor-panel-3': '1.配色｜配色パネルの表示を切り替える',
            'glass-cursor-panel-4': '2.点｜点の設定パネルの表示を切り替える',
            'glass-cursor-panel-6': '3.カーソル｜カーソル設定パネルの表示を切り替える',
            'glass-cursor-panel-7': '4.空間｜空間描画パネルの表示を切り替える',
            'case-comparison': '5.描画｜描画切替ボタンを表示／非表示にする',
            'ui-variant-panel': '6.UI｜UI設定パネルの表示を切り替える'
        },
        quickActions: {
            'toggle-all': '表示/非表示｜主要パネルをまとめて切り替える',
            'toggle-utility-openclose': '開閉｜主要パネルをまとめて開閉する',
            'show-all': 'すべて表示｜全パネルを表示する',
            'hide-all': 'すべて非表示｜全パネルを隠す',
            'toggle-cursor-open': 'カーソル全開｜関連パネルを開く',
            'toggle-cursor-close': 'カーソル全閉｜関連パネルを閉じる'
        },

        // パネル見出し。クリック時の動作に合わせて「開く/閉じる」は自動付与。
        panels: {
            'glass-cursor-panel-3': '1.配色パネル',
            'glass-cursor-panel-4': '2.点パネル',
            'glass-cursor-panel-6': '3.カーソルパネル',
            'glass-cursor-panel-7': '4.空間パネル',
            'case-comparison': '5.描画切替',
            'ui-variant-panel': '6.UIパネル',
            'color-container': '配色パネル',
            'slider-container': '点の設定パネル',
            'cursor-container': 'カーソル設定パネル',
            'svg-file-container': 'SVGファイルパネル',
            'svg-anime-container': 'SVGアニメーションパネル',
            'load-container': '画像ロードパネル',
            'vector-container': '画像なぞりパネル'
        }
    };

    let caption = null;
    let hoverTarget = null;
    let hoverText = '';
    let lastTransitionText = '';
    let rafId = null;

    function ensureCaption() {
        if (caption && caption.isConnected) return caption;
        caption = document.getElementById('ui-help-caption');
        if (caption) return caption;
        caption = document.createElement('div');
        caption.id = 'ui-help-caption';
        caption.className = 'ui-help-caption';
        caption.setAttribute('role', 'status');
        caption.setAttribute('aria-live', 'polite');
        caption.hidden = true;
        document.body.appendChild(caption);
        return caption;
    }

    function setCaption(text, source) {
        const node = ensureCaption();
        const message = String(text || '').trim();
        if (!message) {
            node.textContent = '';
            node.dataset.source = '';
            node.classList.remove('is-visible');
            node.hidden = true;
            return;
        }
        node.textContent = message;
        node.dataset.source = source || '';
        node.hidden = false;
        window.requestAnimationFrame(function() { node.classList.add('is-visible'); });
    }

    function getActiveTransitionText() {
        const transition = window.__pointSequenceTransition;
        if (!transition || transition.active !== true) return '';
        const index = Number(transition.targetIndex);
        const targetCase = window.cases && Number.isInteger(index) ? window.cases[index] : null;
        const seconds = targetCase && targetCase.config ? Number(targetCase.config.pointSequenceSeconds) : Number.NaN;
        if (Number.isFinite(seconds) && seconds > 0) {
            return `Case ${index}へ移行｜順次遷移 ${seconds.toFixed(1)}秒`;
        }
        return Number.isInteger(index) ? `Case ${index}へ移行` : 'Case移行中';
    }

    function renderCurrent() {
        if (hoverText) {
            setCaption(hoverText, 'hover');
            return;
        }
        const transitionText = getActiveTransitionText();
        if (transitionText) {
            if (transitionText !== lastTransitionText || caption?.hidden) {
                setCaption(transitionText, 'transition');
            }
            lastTransitionText = transitionText;
            return;
        }
        lastTransitionText = '';
        setCaption('', '');
    }

    function compactText(node) {
        return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function getPanelName(element) {
        const panel = element?.closest?.('[id]');
        if (!panel) return '';
        let current = panel;
        while (current) {
            if (current.id && HELP_TEXT.panels[current.id]) return HELP_TEXT.panels[current.id];
            current = current.parentElement?.closest?.('[id]') || null;
        }
        return '';
    }

    function describeHeader(element) {
        const header = element.closest('.ui-header');
        if (!header) return '';
        const panel = header.parentElement;
        const knownName = panel && HELP_TEXT.panels[panel.id];
        const rawTitle = compactText(header).replace(/閉じる$/, '').trim();
        const name = knownName || rawTitle || 'パネル';
        const collapsed = Boolean(panel && panel.classList.contains('collapsed'));
        return `${name}を${collapsed ? '開く' : '閉じる'}`;
    }

    function describeSlider(element) {
        const group = element.closest('.slider-group');
        if (!group || !group.id) return '';
        const key = group.id.replace(/-group$/, '').replace(/^cursor-test-/, '');
        return HELP_TEXT.sliders[key] || '';
    }

    function describeButton(button) {
        if (!button) return '';
        if (button.id && HELP_TEXT.ids[button.id]) return HELP_TEXT.ids[button.id];
        if (button.dataset.panelId && HELP_TEXT.quickPanels[button.dataset.panelId]) {
            return HELP_TEXT.quickPanels[button.dataset.panelId];
        }
        if (button.dataset.action && HELP_TEXT.quickActions[button.dataset.action]) {
            return HELP_TEXT.quickActions[button.dataset.action];
        }
        if (button.dataset.assignMode) return '色の配置方法を選択｜点への色の流れを変える';
        if (Object.prototype.hasOwnProperty.call(button.dataset, 'themeBlend')) return HELP_TEXT.buttonText['馴染'];
        if (Object.prototype.hasOwnProperty.call(button.dataset, 'themeRecolor')) return HELP_TEXT.buttonText['再配色'];
        if (button.classList.contains('color-theme-card')) return '配色テーマを選択｜描画に使う色の組合せを変える';
        if (button.classList.contains('palette-system-tab')) return '配色タイプを選択｜色の作り方を切り替える';
        if (button.classList.contains('cycle-handle')) return '周期変化の範囲を調整';
        if (button.classList.contains('delete-button')) return 'この素材を削除する';
        const text = compactText(button);
        return HELP_TEXT.buttonText[text] || (text ? `${text}を実行` : 'この操作を実行');
    }

    function describeControl(element) {
        if (!element || !element.closest) return '';

        const sliderText = describeSlider(element);
        if (sliderText) return sliderText;

        const caseButton = element.closest('#case-comparison .case-choice-button');
        if (caseButton) {
            const raw = caseButton.getAttribute('data-case');
            return `Case ${raw}へ切替｜描画設定を呼び出す`;
        }
        const layoutToggle = element.closest('#case-comparison .case-layout-toggle');
        if (layoutToggle) {
            const panel = document.getElementById('case-comparison');
            return panel && panel.dataset.layout === 'vertical'
                ? 'case一覧を横に戻す'
                : 'case一覧を縦に並べる';
        }

        const button = element.closest('button');
        if (button) return describeButton(button);

        const input = element.closest('input');
        if (input) {
            if (input.id && HELP_TEXT.ids[input.id]) return HELP_TEXT.ids[input.id];
            if (input.classList.contains('canvas-bottom-color-input')) return '背景色を選択｜キャンバスの色を変える';
            if (input.type === 'checkbox') return '機能の有効/無効を切り替える';
            return input.getAttribute('aria-label') ? `${input.getAttribute('aria-label')}を調整` : '値を調整';
        }

        const select = element.closest('select');
        if (select) {
            return HELP_TEXT.ids[select.id] || '表示設定を選択';
        }

        const label = element.closest('label');
        if (label && label.htmlFor && HELP_TEXT.ids[label.htmlFor]) return HELP_TEXT.ids[label.htmlFor];

        const headerText = describeHeader(element);
        if (headerText) return headerText;
        return '';
    }

    function findHelpTarget(element) {
        return element && element.closest
            ? element.closest('.slider-group, #case-comparison .case-choice-button, #case-comparison .case-layout-toggle, button, input, select, label, .ui-header')
            : null;
    }

    function updateHoverFromEventTarget(element) {
        const target = findHelpTarget(element);
        const text = describeControl(element);
        if (!target || !text) {
            hoverTarget = null;
            hoverText = '';
        } else {
            hoverTarget = target;
            hoverText = text;
        }
        renderCurrent();
    }

    function init() {
        ensureCaption();
        document.addEventListener('pointerover', function(event) {
            const target = findHelpTarget(event.target);
            if (target === hoverTarget) return;
            updateHoverFromEventTarget(event.target);
        });
        document.addEventListener('pointerout', function(event) {
            if (!hoverTarget) return;
            const nextTarget = findHelpTarget(event.relatedTarget);
            if (nextTarget === hoverTarget) return;
            updateHoverFromEventTarget(event.relatedTarget);
        });
        document.addEventListener('focusin', function(event) {
            updateHoverFromEventTarget(event.target);
        });
        document.addEventListener('focusout', function(event) {
            updateHoverFromEventTarget(event.relatedTarget);
        });
        const tick = function() {
            renderCurrent();
            rafId = window.requestAnimationFrame(tick);
        };
        rafId = window.requestAnimationFrame(tick);
    }

    return { init: init, HELP_TEXT: HELP_TEXT };
})();

document.addEventListener('DOMContentLoaded', function() {
    window.UIHelpCaption.init();
});
