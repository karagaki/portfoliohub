// Table_Next.js - ケース切替の唯一の実装

window.TableNext = (function() {
    function dispatchLifecycle(type, detail) {
        if (typeof window.dispatchCaseLifecycleEvent === 'function') {
            window.dispatchCaseLifecycleEvent(type, detail || {});
        }
    }

    function switchToCase(caseIndex) {
        console.log(`TableNext: Switching to case ${caseIndex}`);

        if (!window.cases || !Array.isArray(window.cases) || window.cases[caseIndex] === undefined) {
            console.error('TableNext: Invalid case index or window.cases not ready');
            return;
        }

        const previousIndex = Number.isInteger(window.state) ? window.state : -1;
        const previousCase = window.currentCase || (previousIndex >= 0 ? window.cases[previousIndex] : null);
        const targetCase = window.cases[caseIndex];
        const canUsePointSequenceTransition = previousCase && targetCase
            && previousCase.__case11DirectRenderer !== true
            && targetCase.__case11DirectRenderer !== true
            && typeof window.prepareNextCase === 'function';

        if (canUsePointSequenceTransition) {
            window.prepareNextCase(targetCase, { interrupt: true, pointSequence: true });
            return;
        }

        if (window.isTransitioning) {
            console.warn('TableNext: Transition in progress, ignoring switch');
            return;
        }

        const transitionId = window.__caseTransitionSeq = Number(window.__caseTransitionSeq || 0) + 1;
        const lifecycleBase = {
            currentCase: previousCase,
            nextCase: targetCase,
            previousIndex: previousIndex,
            targetIndex: caseIndex,
            transitionId: transitionId,
            reason: 'table-next-direct-switch'
        };

        if (previousCase && previousCase.__case11DirectRenderer === true && typeof window.prepareNextCase === 'function') {
            window.prepareNextCase(targetCase);
            return;
        }

        // TableNext は prepareNextCase を通らない直接切替なので、ここで先に始終イベントを出す。
        // case11 入場時の非表示・trail 切断は、この caseWillStart で描画より前に実行される。
        dispatchLifecycle('caseWillEnd', lifecycleBase);
        dispatchLifecycle('caseWillStart', lifecycleBase);

        if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
            document.dispatchEvent(new CustomEvent('caseChanged', {
                detail: Object.assign({ phase: 'table-next-before-switch' }, lifecycleBase)
            }));
        }

        if (typeof window.startCasePointColorTransition === 'function') {
            window.startCasePointColorTransition();
        }

        // ケースの切り替え
        window.state = caseIndex;
        window.currentCase = targetCase;
        window.nextCase = targetCase;
        window.morph = 0;
        window.isTransitioning = false;

        dispatchLifecycle('caseDidEnd', lifecycleBase);
        dispatchLifecycle('caseDidStart', Object.assign({}, lifecycleBase, {
            currentCase: targetCase,
            nextCase: targetCase,
            reason: 'table-next-direct-switch-complete'
        }));

        console.log(`TableNext: Switched to case${caseIndex}`, window.currentCase);

        // UIの更新
        if (window.Slider && typeof window.Slider.updateSliders === 'function') {
            window.Slider.updateSliders(window.currentCase);
        }

        if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
            window.Table.updateCaseComparisonTable();
        }

        if (window.Color && typeof window.Color.updateColorPreview === 'function') {
            window.Color.updateColorPreview();
        }

        if (window.Button && typeof window.Button.syncCodeExplainAfterCaseChange === 'function') {
            window.Button.syncCodeExplainAfterCaseChange();
        }

        // vectorsを新しいケースに合わせて調整
        if (typeof window.adjustVectorCount === 'function') {
            window.adjustVectorCount(window.currentCase.config.count, window.currentCase.config.trailLength);
        }

        // case11 へ直接切替した直後は、adjustVectorCount が trail を作り直すため、
        // caseWillStart で切った trail が復活することがある。ここで再度、描画前にhost trailを断つ。
        const shouldStartCase11ReentryFade = targetCase && targetCase.__case11DirectRenderer === true
            && typeof window.shouldStartCase11EntryFade === 'function'
            && window.shouldStartCase11EntryFade(Object.assign({}, lifecycleBase, {
                currentCaseIndex: previousIndex,
                nextCaseIndex: caseIndex
            }));
        if (shouldStartCase11ReentryFade && typeof window.startCase11EntryFade === 'function') {
            window.startCase11EntryFade('table-next-after-adjust-vector-reentry-fade');
        }

        if (shouldStartCase11ReentryFade && Array.isArray(window.vectors)) {
            const frame = Number(window.frameCount || 0);
            const until = frame + 90;
            for (let i = 0; i < window.vectors.length; i++) {
                const v = window.vectors[i];
                if (!v) continue;
                const x = Number.isFinite(Number(v.current && v.current.x)) ? Number(v.current.x) : 0;
                const y = Number.isFinite(Number(v.current && v.current.y)) ? Number(v.current.y) : 0;
                v.isHidden = true;
                v.__case11HoldUntilFrame = until;
                v.__case11HoldStartedFrame = frame;
                v.__case11HoldX = x;
                v.__case11HoldY = y;
                v.__case11HoldReason = 'table-next-after-adjust-vector-trail-cut';
                if (typeof window.createVector === 'function') {
                    v.trail = [window.createVector(x, y), window.createVector(x, y)];
                } else {
                    v.trail = [{ x: x, y: y }, { x: x, y: y }];
                }
            }
            window.__case11ForceOpaqueClearUntilFrame = Math.max(
                Number(window.__case11ForceOpaqueClearUntilFrame || 0),
                until
            );
            if (window.trailBuffer && typeof window.trailBuffer.clear === 'function') {
                window.trailBuffer.clear();
            }
            if (targetCase._case11State && Array.isArray(targetCase._case11State.pointEvents)) {
                targetCase._case11State.pointEvents.push({
                    frame: frame,
                    time: Date.now(),
                    type: 'entry-hold-start',
                    reason: 'table-next-after-adjust-vector-trail-cut',
                    untilFrame: until
                });
            }
        }

        // スケッチの再描画を強制
        if (typeof window.redraw === 'function') {
            window.redraw();
        }
    }

    function initialize() {
        console.log('TableNext: Initialized');
    }

    return {
        switchToCase: switchToCase,
        initialize: initialize
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded: Table_Next.js initializing');
    window.TableNext.initialize();
});
