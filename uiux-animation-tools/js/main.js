var UIUX_PUBLIC_DEBUG_LOGS = window.UIUX_PUBLIC_DEBUG_LOGS === true;
function uiuxPublicDebugLog(...args) { if (UIUX_PUBLIC_DEBUG_LOGS) console.log(...args); }
window.p5Instance = this;

// グローバル変数の宣言
window.config = {
  canvasSize: 0,
  maxSize: 3000,
  renderScale: 1,
  renderMode: {
    trail: "history"
  },
  canvasBgColor: "#e1e1e1"
};

window.TWO_PI = Math.PI * 2;
window.vectors = [];
window.trailBuffer = null;
window.state = 0;
window.morph = 0;
window.cases = [];
window.currentCase = null;
window.nextCase = null;
window.isTransitioning = false;


// STEP1確認用: 指定した総時間内で全点を順次移動させる。
// 点数増加は既存点から均等に分岐し、点数減少は到着後に統合する。
// 到着点割当は後で差し替えられる仮方式（距離優先 + 均等容量）。
const POINT_SEQUENCE_DEFAULT_SECONDS = 8;
const POINT_SEQUENCE_TRANSITION_STEP1 = {
    enabled: true,
    departureWindowRatio: 0.72,
    travelWindowRatio: 0.28
};
window.__pointSequenceTransition = null;

/**
 * 通常caseと将来のRuntimeCaseの双方から、親case番号を返す共通入口。
 * - 通常case: window.cases 内の位置を返す
 * - RuntimeCase: baseCaseId を返す
 * この段階ではRuntimeCase自体は生成しないため、既存描画は変化しない。
 */
function getBaseCaseIndex(caseObject) {
    if (!caseObject) return -1;
    if (Number.isInteger(caseObject.baseCaseId) && caseObject.baseCaseId >= 0) {
        return caseObject.baseCaseId;
    }
    return Array.isArray(window.cases) ? window.cases.indexOf(caseObject) : -1;
}
window.getBaseCaseIndex = getBaseCaseIndex;

function getPointSequenceSeconds(caseObject) {
    const value = caseObject && caseObject.config ? Number(caseObject.config.pointSequenceSeconds) : Number.NaN;
    return Number.isFinite(value) ? Math.max(0, value) : POINT_SEQUENCE_DEFAULT_SECONDS;
}

function ensurePointSequenceSettings() {
    (window.cases || []).forEach(function(caseObject) {
        if (!caseObject || !caseObject.config) return;
        if (!Number.isFinite(Number(caseObject.config.pointSequenceSeconds))) {
            caseObject.config.pointSequenceSeconds = POINT_SEQUENCE_DEFAULT_SECONDS;
        }
        if (caseObject.initialConfig && !Number.isFinite(Number(caseObject.initialConfig.pointSequenceSeconds))) {
            caseObject.initialConfig.pointSequenceSeconds = POINT_SEQUENCE_DEFAULT_SECONDS;
        }
    });
}

function isPointSequenceTransitionActive() {
    return !!(POINT_SEQUENCE_TRANSITION_STEP1.enabled
        && window.isTransitioning
        && window.__pointSequenceTransition
        && window.__pointSequenceTransition.active);
}

function snapshotCurrentVectorPositions() {
    return (window.vectors || []).map(function(v) {
        return { x: Number(v.current.x), y: Number(v.current.y) };
    });
}

function copyVectorAtPosition(sourceVector, trailLength) {
    const x = sourceVector && sourceVector.current ? Number(sourceVector.current.x) : width / 2;
    const y = sourceVector && sourceVector.current ? Number(sourceVector.current.y) : height / 2;
    const vector = createNewVector(trailLength, x, y);
    if (sourceVector && Array.isArray(sourceVector.__lastRenderedColor)) {
        vector.__lastRenderedColor = sourceVector.__lastRenderedColor.slice();
    }
    if (sourceVector && Number.isFinite(Number(sourceVector.__pointSequenceRenderedSize))) {
        vector.__pointSequenceRenderedSize = Number(sourceVector.__pointSequenceRenderedSize);
    }
    return vector;
}

function expandVectorsEvenlyForTransition(requiredCount, trailLength) {
    const sourceCount = Math.max(1, vectors.length);
    const existing = vectors.slice();
    while (vectors.length < requiredCount) {
        const newIndex = vectors.length;
        const parentIndex = (newIndex - sourceCount) % sourceCount;
        const parent = existing[parentIndex] || vectors[parentIndex] || vectors[0];
        vectors.push(copyVectorAtPosition(parent, trailLength));
    }
}

function getTargetPointPosition(caseObject, targetIndex) {
    return {
        x: Number(caseObject.getTargetX(targetIndex, frameCount)),
        y: Number(caseObject.getTargetY(targetIndex, frameCount))
    };
}

function makeBalancedDestinationSlots(sourceCount, destinationCount) {
    const slots = [];
    const base = Math.floor(sourceCount / Math.max(1, destinationCount));
    const extra = sourceCount % Math.max(1, destinationCount);
    for (let targetIndex = 0; targetIndex < destinationCount; targetIndex++) {
        const capacity = base + (targetIndex < extra ? 1 : 0);
        for (let n = 0; n < capacity; n++) slots.push(targetIndex);
    }
    return slots;
}

function assignDestinationsByNearestBalanced(origins, targetCase) {
    const destinationCount = Math.max(1, Number(targetCase.config.count) || 1);
    const slots = makeBalancedDestinationSlots(origins.length, destinationCount);
    const available = slots.slice();
    const assignments = new Array(origins.length).fill(0);
    const orderedSources = origins.map(function(origin, index) { return { origin, index }; })
        .sort(function(a, b) { return a.origin.x - b.origin.x || a.origin.y - b.origin.y; });
    orderedSources.forEach(function(item) {
        let bestSlotAt = 0;
        let bestDistance = Infinity;
        for (let slotAt = 0; slotAt < available.length; slotAt++) {
            const targetPos = getTargetPointPosition(targetCase, available[slotAt]);
            const dx = item.origin.x - targetPos.x;
            const dy = item.origin.y - targetPos.y;
            const distance = dx * dx + dy * dy;
            if (distance < bestDistance) {
                bestDistance = distance;
                bestSlotAt = slotAt;
            }
        }
        assignments[item.index] = available.splice(bestSlotAt, 1)[0];
    });
    return assignments;
}

function beginPointSequenceTransition(targetCase, fromIndex, interrupted) {
    const targetCount = Math.max(1, Number(targetCase.config.count) || 1);
    const sourceCaseCount = Math.max(1, Number(currentCase.config.count) || 1);
    const visibleCount = Math.max(1, vectors.length);
    const transitionCount = Math.max(visibleCount, targetCount);
    expandVectorsEvenlyForTransition(transitionCount, targetCase.config.trailLength);
    const origins = snapshotCurrentVectorPositions();
    const assignment = assignDestinationsByNearestBalanced(origins, targetCase);
    const departureOrder = origins.map(function(origin, index) { return { origin, index }; })
        .sort(function(a, b) { return a.origin.x - b.origin.x || a.origin.y - b.origin.y; });
    const departureRanks = new Array(origins.length).fill(0);
    departureOrder.forEach(function(item, rank) { departureRanks[item.index] = rank; });
    const sourceAssignments = vectors.map(function(_, index) {
        return index < visibleCount ? (index % sourceCaseCount) : ((index - visibleCount) % sourceCaseCount);
    });
    window.targetAssignments = assignment;
    window.__pointSequenceTransition = {
        active: true,
        fromIndex: fromIndex,
        targetIndex: cases.indexOf(targetCase),
        totalFrames: Math.max(1, Math.round(getPointSequenceSeconds(targetCase) * 60)),
        pointCount: origins.length,
        // 通常開始時は、出発順が来るまで前caseの動きを続ける。
        // 遷移途中の再切替時のみ、その瞬間の実表示位置を起点として保持する。
        dynamicOrigins: !interrupted,
        originPositions: origins,
        sourceAssignments: sourceAssignments,
        originSizes: vectors.map(function(v) {
            return Number.isFinite(Number(v.__pointSequenceRenderedSize))
                ? Number(v.__pointSequenceRenderedSize)
                : Number(currentCase.config.size);
        }),
        departureRanks: departureRanks
    };
}

function getPointSequenceProgress(vectorIndex) {
    if (!isPointSequenceTransitionActive()) return morph;
    const active = window.__pointSequenceTransition;
    const count = Math.max(1, active.pointCount);
    const rank = Number(active.departureRanks[vectorIndex] || 0);
    const order = count <= 1 ? 0 : rank / (count - 1);
    const totalFrames = Math.max(1, Number(active.totalFrames));
    const elapsedFrames = morph * totalFrames;
    const startFrame = order * totalFrames * POINT_SEQUENCE_TRANSITION_STEP1.departureWindowRatio;
    const travelFrames = Math.max(1, totalFrames * POINT_SEQUENCE_TRANSITION_STEP1.travelWindowRatio);
    const raw = constrain((elapsedFrames - startFrame) / travelFrames, 0, 1);
    return raw * raw * (3 - 2 * raw);
}

function orderArrivedVectorsForMerge(targetCount) {
    if (!window.__pointSequenceTransition || vectors.length <= targetCount) return;
    const assignments = window.targetAssignments || [];
    const survivors = [];
    const used = new Set();
    for (let targetIndex = 0; targetIndex < targetCount; targetIndex++) {
        let chosenIndex = assignments.findIndex(function(assigned, index) {
            return assigned === targetIndex && !used.has(index);
        });
        if (chosenIndex < 0) {
            chosenIndex = vectors.findIndex(function(_, index) { return !used.has(index); });
        }
        if (chosenIndex >= 0) {
            used.add(chosenIndex);
            survivors.push(vectors[chosenIndex]);
        }
    }
    const remainder = vectors.filter(function(_, index) { return !used.has(index); });
    vectors = survivors.concat(remainder);
}
window.lastPointCount = 0;
window.casePointColorTransition = {
    active: false,
    startMs: 0,
    durationMs: getColorTransitionDurationMs(),
    fromColor: null,
    toColor: null
};
window.__lastRenderedPointColor = null;
window.__lastRenderedPointColors = [];

window.initVectors = initVectors;
window.createNewVector = createNewVector;
window.prepareNextCase = prepareNextCase;
window.updateAndDrawVectors = updateAndDrawVectors;
window.adjustVectorCount = adjustVectorCount;

function normalizeTrailMode(value) {
    return value === 'accumulate' ? 'accumulate' : 'history';
}

function getColorTransitionDurationMs() {
    let seconds = 3;
    try {
        const saved = localStorage.getItem('colorTransitionSeconds');
        if (saved !== null) {
            const parsed = Number.parseFloat(saved);
            if (Number.isFinite(parsed)) {
                seconds = parsed;
            }
        }
    } catch (error) {
        seconds = 3;
    }
    if (!Number.isFinite(seconds) || seconds < 0) {
        seconds = 3;
    }
    return Math.round(seconds * 1000);
}

function normalizePointColor(value, fallback) {
    if (!Array.isArray(value) || value.length < 3) {
        if (Array.isArray(fallback) && fallback.length >= 3) {
            return [
                Number(fallback[0]),
                Number(fallback[1]),
                Number(fallback[2])
            ];
        }
        return null;
    }
    const normalized = [
        Number(value[0]),
        Number(value[1]),
        Number(value[2])
    ];
    if (normalized.some((component) => !Number.isFinite(component))) {
        if (Array.isArray(fallback) && fallback.length >= 3) {
            return [
                Number(fallback[0]),
                Number(fallback[1]),
                Number(fallback[2])
            ];
        }
        return null;
    }
    return normalized;
}

function liftVisiblePointColor(colorValue) {
    const rgb = normalizePointColor(colorValue);
    if (!rgb) return null;
    const [r, g, b] = rgb;
    if (![r, g, b].every((component) => Number.isFinite(component))) return null;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness >= 100) {
        return rgb;
    }

    const targetBrightness = 104;
    const liftAmount = Math.max(0, Math.min(1, (targetBrightness - brightness) / Math.max(1, 255 - brightness)));
    const whiteMix = Math.min(0.28, Math.max(0.12, liftAmount * 0.45 + 0.08));
    const lifted = [
        Math.round(r + (255 - r) * whiteMix),
        Math.round(g + (255 - g) * whiteMix),
        Math.round(b + (255 - b) * whiteMix)
    ];

    const afterBrightness = (lifted[0] * 299 + lifted[1] * 587 + lifted[2] * 114) / 1000;
    if (afterBrightness < 90) {
        const extraMix = 0.12;
        return [
            Math.round(lifted[0] + (255 - lifted[0]) * extraMix),
            Math.round(lifted[1] + (255 - lifted[1]) * extraMix),
            Math.round(lifted[2] + (255 - lifted[2]) * extraMix)
        ];
    }

    return lifted;
}

function easeInOutCubic(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

function updatePointColorTransitionState(point, fallbackColor, nowMs) {
    if (!point || !point.__casePointColorTransition || !point.__casePointColorTransition.active) {
        return null;
    }
    const fallback = normalizePointColor(fallbackColor);
    if (!fallback) {
        point.__casePointColorTransition.active = false;
        return null;
    }
    const state = point.__casePointColorTransition;
    const fromColor = normalizePointColor(state.fromColor, fallback);
    const toColor = fallback;
    if (!fromColor) {
        state.active = false;
        return fallback;
    }
    const durationMs = Number(state.durationMs || getColorTransitionDurationMs() || 3000);
    const elapsed = Math.max(0, (Number(nowMs) || Date.now()) - Number(state.startMs || 0));
    const t = durationMs <= 0 ? 1 : Math.max(0, Math.min(1, elapsed / durationMs));
    const easedT = easeInOutCubic(t);
    if (t >= 1) {
        state.active = false;
        state.fromColor = toColor.slice();
        state.toColor = toColor.slice();
        return toColor.slice();
    }
    return [
        Math.round(fromColor[0] + (toColor[0] - fromColor[0]) * easedT),
        Math.round(fromColor[1] + (toColor[1] - fromColor[1]) * easedT),
        Math.round(fromColor[2] + (toColor[2] - fromColor[2]) * easedT)
    ];
}

function startCasePointColorTransition() {
    const state = window.casePointColorTransition;
    const nowMs = Date.now();
    const vectorsList = Array.isArray(window.vectors) ? window.vectors : [];
    let activated = false;
    vectorsList.forEach((vector, index) => {
        if (!vector) return;
        const fromColor = normalizePointColor(
            vector.__lastRenderedColor
            || (Array.isArray(window.__lastRenderedPointColors) ? window.__lastRenderedPointColors[index] : null)
            || vector.__casePointTransitionColor
            || vector.lastRenderedColor
        );
        if (!fromColor) {
            delete vector.__casePointColorTransition;
            return;
        }
            vector.__casePointColorTransition = {
                active: true,
                startMs: nowMs,
                durationMs: getColorTransitionDurationMs(),
                fromColor: fromColor.slice(),
                toColor: fromColor.slice()
            };
        activated = true;
    });
    state.active = activated;
    state.startMs = nowMs;
    state.durationMs = getColorTransitionDurationMs();
    state.fromColor = null;
    state.toColor = null;
    return activated;
}

function getPointColorDiff(a, b) {
    const left = normalizePointColor(a);
    const right = normalizePointColor(b);
    if (!left || !right) return Infinity;
    return Math.abs(left[0] - right[0]) + Math.abs(left[1] - right[1]) + Math.abs(left[2] - right[2]);
}

function ensurePointColorTransition(point, resolvedColor, nowMs) {
    if (!point) return null;
    const normalizedResolved = normalizePointColor(resolvedColor);
    if (!normalizedResolved) {
        return null;
    }

    const activeState = point.__casePointColorTransition;
    const lastResolved = normalizePointColor(point.__lastResolvedPointColor);
    const diff = getPointColorDiff(lastResolved, normalizedResolved);
    const shouldStart = !lastResolved || diff >= 8;

    if (!activeState || !activeState.active) {
        if (shouldStart) {
            const fromColor = normalizePointColor(point.__lastRenderedColor, normalizedResolved) || normalizedResolved.slice();
            point.__casePointColorTransition = {
                active: true,
                startMs: Number(nowMs) || Date.now(),
                durationMs: getColorTransitionDurationMs(),
                fromColor: fromColor.slice(),
                toColor: normalizedResolved.slice()
            };
        }
    } else if (shouldStart) {
        const currentDisplay = normalizePointColor(point.__lastRenderedColor, lastResolved || normalizedResolved) || normalizedResolved.slice();
        activeState.active = true;
        activeState.startMs = Number(nowMs) || Date.now();
        activeState.durationMs = getColorTransitionDurationMs();
        activeState.fromColor = currentDisplay.slice();
        activeState.toColor = normalizedResolved.slice();
    }

    point.__lastResolvedPointColor = normalizedResolved.slice();
    return point.__casePointColorTransition || null;
}

window.normalizePointColor = normalizePointColor;
window.easeInOutCubic = easeInOutCubic;
window.updatePointColorTransitionState = updatePointColorTransitionState;
window.getColorTransitionDurationMs = getColorTransitionDurationMs;
window.ensurePointColorTransition = ensurePointColorTransition;
window.startCasePointColorTransition = startCasePointColorTransition;

function getLastRenderedPointColor(fallbackColor) {
    if (Array.isArray(window.__lastRenderedPointColor) && window.__lastRenderedPointColor.length >= 3) {
        return normalizePointColor(window.__lastRenderedPointColor, fallbackColor);
    }
    return normalizePointColor(fallbackColor);
}

window.getLastRenderedPointColor = getLastRenderedPointColor;

function updateColorTransitionDurationMs(durationMs) {
    const normalizedDurationMs = Math.max(0, Number(durationMs) || 0);
    if (window.casePointColorTransition && typeof window.casePointColorTransition === 'object') {
        window.casePointColorTransition.durationMs = normalizedDurationMs;
    }
    const vectorsList = Array.isArray(window.vectors) ? window.vectors : [];
    vectorsList.forEach((vector) => {
        if (vector && vector.__casePointColorTransition && typeof vector.__casePointColorTransition === 'object') {
            vector.__casePointColorTransition.durationMs = normalizedDurationMs;
        }
    });
    return normalizedDurationMs;
}

window.updateColorTransitionDurationMs = updateColorTransitionDurationMs;

function initVectors(count, trailLength) {
    vectors = [];
    for (let i = 0; i < count; i++) {
        vectors.push(createNewVector(trailLength));
    }
    window.lastPointCount = count;
}

function createNewVector(trailLength, x, y) {
    const pos = createVector(x !== undefined ? x : random(width), y !== undefined ? y : random(height));
    return {
        current: pos,
        trail: new Array(trailLength).fill().map(() => pos.copy())
    };
}

window.switchToCase = function(caseIndex) {
    if (window.TableNext && typeof window.TableNext.switchToCase === 'function') {
        window.TableNext.switchToCase(caseIndex);
    } else {
        console.error('TableNext.switchToCase is not available');
    }
};


window.targetAssignments = [];

window.caseLifecycleEvents = [];
window.__caseLifecycleSeq = 0;
window.__caseTransitionSeq = 0;

function getCaseIndexForLifecycle(caseObj) {
    return getBaseCaseIndex(caseObj);
}

function snapshotVectorsForLifecycle(limit = 120) {
    const list = window.vectors || [];
    return list.slice(0, limit).map((v, index) => {
        const current = v && v.current ? v.current : { x: NaN, y: NaN };
        return {
            index,
            x: Number(current.x),
            y: Number(current.y),
            hidden: !!(v && v.isHidden)
        };
    });
}

function dispatchCaseLifecycleEvent(type, detail = {}) {
    const payload = Object.assign({
        type,
        seq: ++window.__caseLifecycleSeq,
        frame: Number(window.frameCount || 0),
        time: Date.now(),
        currentCaseIndex: getCaseIndexForLifecycle(detail.currentCase),
        nextCaseIndex: getCaseIndexForLifecycle(detail.nextCase),
        vectors: snapshotVectorsForLifecycle()
    }, detail);
    window.caseLifecycleEvents.push(payload);
    if (window.caseLifecycleEvents.length > 240) {
        window.caseLifecycleEvents.splice(0, window.caseLifecycleEvents.length - 240);
    }
    if (type === 'caseWillStart' && isCase11Object(detail.nextCase) && typeof window.startCase11EntryFade === 'function') {
        window.startCase11EntryFade('caseWillStart-before-case11');
    }
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
        document.dispatchEvent(new CustomEvent(type, { detail: payload }));
        document.dispatchEvent(new CustomEvent('caseLifecycle', { detail: payload }));
    }
    return payload;
}

window.dispatchCaseLifecycleEvent = dispatchCaseLifecycleEvent;
window.getCaseLifecycleDebug = function getCaseLifecycleDebug() {
    return {
        last: window.caseLifecycleEvents[window.caseLifecycleEvents.length - 1] || null,
        events: window.caseLifecycleEvents.slice(-80)
    };
};






function isCase11Object(caseObj) {
    return !!(caseObj && (caseObj.__case11DirectRenderer === true || caseObj.caseId === 11 || caseObj.name === 'case11' || caseObj === window.case11));
}

function getUsableCase11Color(color) {
    if (!Array.isArray(color) || color.length < 3) return null;
    if (Number(color[0]) === 0 && Number(color[1]) === 0 && Number(color[2]) === 0) return null;
    return color;
}

function resolvePanelAssignedPointColor(index, vector, currentCase, caseId, width, height) {
    if (!currentCase || !currentCase.config) return null;

    // Phase 5: Consoleで選択した統合slotの実表示色。通常時は常にnull。
    if (window.RuntimeIntegratedSlotApplyAdapter
        && typeof window.RuntimeIntegratedSlotApplyAdapter.resolvePointRgb === 'function') {
        const slotRgb = window.RuntimeIntegratedSlotApplyAdapter.resolvePointRgb(
            index,
            currentCase.config.count,
            vector && vector.current ? vector.current.x : 0,
            vector && vector.current ? vector.current.y : 0,
            width,
            height
        );
        if (Array.isArray(slotRgb) && slotRgb.length >= 3) {
            return color(slotRgb[0], slotRgb[1], slotRgb[2]);
        }
    }

    // Phase 4.4: 明示実行時だけ有効な視覚preview層。通常動作では常にnull。
    if (window.RuntimeVisualLivePreviewAdapter
        && typeof window.RuntimeVisualLivePreviewAdapter.resolvePointRgb === 'function') {
        const previewRgb = window.RuntimeVisualLivePreviewAdapter.resolvePointRgb(
            index,
            currentCase.config.count,
            vector && vector.current ? vector.current.x : 0,
            vector && vector.current ? vector.current.y : 0,
            width,
            height
        );
        if (Array.isArray(previewRgb) && previewRgb.length >= 3) {
            return color(previewRgb[0], previewRgb[1], previewRgb[2]);
        }
    }

    const paletteSystem = window.Color && window.Color.getPaletteSystem
        ? window.Color.getPaletteSystem()
        : 'engine';

    if (paletteSystem === 'engine' && window.ColorEngine && window.ColorEngine.getPointColor) {
        const rgb = window.ColorEngine.getPointColor(
            index,
            currentCase.config.count,
            vector && vector.current ? vector.current.x : 0,
            vector && vector.current ? vector.current.y : 0,
            caseId,
            width,
            height
        );
        if (Array.isArray(rgb) && rgb.length >= 3) {
            return color(rgb[0], rgb[1], rgb[2]);
        }
    }

    const colorMode = window.Color && window.Color.getColorMode ? window.Color.getColorMode() : 'off';
    if (colorMode === 'random' && window.Color && window.Color.isUsingRandomColors && window.Color.isUsingRandomColors()) {
        const randomColors = window.Color.getRandomColors ? window.Color.getRandomColors() : [];
        const totalColors = randomColors.length;
        if (totalColors > 0) {
            const assignMode = window.Color.getRandomColorAssignMode
                ? window.Color.getRandomColorAssignMode()
                : 'alternate';
            let colorIndex;
            if (assignMode === 'block-x' && Array.isArray(vectors) && vectors.length) {
                const order = vectors.map((_, vectorIndex) => vectorIndex);
                order.sort((a, b) => {
                    const ax = vectors[a].current.x;
                    const bx = vectors[b].current.x;
                    if (ax === bx) {
                        return vectors[a].current.y - vectors[b].current.y;
                    }
                    return ax - bx;
                });
                const pointsPerColor = Math.ceil(vectors.length / totalColors);
                const rank = order.indexOf(index);
                colorIndex = Math.min(Math.floor(rank / pointsPerColor), totalColors - 1);
            } else {
                colorIndex = index % totalColors;
            }
            const rgb = randomColors[colorIndex];
            if (Array.isArray(rgb) && rgb.length >= 3) {
                return color(rgb[0], rgb[1], rgb[2]);
            }
        }
    }

    if (colorMode === 'hue-range' && window.Color && window.Color.getHueRangeColor) {
        const rgb = window.Color.getHueRangeColor(index, currentCase.config.count);
        if (Array.isArray(rgb) && rgb.length >= 3) {
            return color(rgb[0], rgb[1], rgb[2]);
        }
    }

    if (Array.isArray(currentCase.config.color) && currentCase.config.color.length >= 3) {
        return color(currentCase.config.color[0], currentCase.config.color[1], currentCase.config.color[2]);
    }

    return null;
}

function getTrailPointDistance(v) {
    if (!v || !Array.isArray(v.trail) || v.trail.length < 2) return NaN;
    const head = v.trail[0];
    const tail = v.trail[v.trail.length - 1];
    const headX = Number(head && head.x);
    const headY = Number(head && head.y);
    const tailX = Number(tail && tail.x);
    const tailY = Number(tail && tail.y);
    if (!Number.isFinite(headX) || !Number.isFinite(headY) || !Number.isFinite(tailX) || !Number.isFinite(tailY)) return NaN;
    const dx = headX - tailX;
    const dy = headY - tailY;
    return Math.sqrt((dx * dx) + (dy * dy));
}

function isTrailGuardVisibleVector(v) {
    return !!(v && (v.__case11AllowHostDraw === true || !v.isHidden));
}

function isSuspiciousLongTrail(v, threshold) {
    if (!isTrailGuardVisibleVector(v)) return false;
    if (!v || !Array.isArray(v.trail) || v.trail.length < 2) return false;
    const distance = getTrailPointDistance(v);
    if (!Number.isFinite(distance) || distance < threshold) return false;
    const prevDistance = Number(v.__trailGuardPrevDistance);
    v.__trailGuardPrevDistance = distance;
    if (!Number.isFinite(prevDistance)) return true;
    return distance >= prevDistance + Math.max(16, threshold * 0.12);
}

function resetTrailAtCurrentPosition(v) {
    if (!v || !v.current) return false;
    const x = Number(v.current.x);
    const y = Number(v.current.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const makePoint = typeof window.createVector === 'function'
        ? function makeVectorPoint() { return window.createVector(x, y); }
        : function makePlainPoint() { return { x, y }; };
    v.trail = [makePoint(), makePoint()];
    return true;
}

function recordTrailGuardDebug(info) {
    if (!window.__trailGuardDebugState) {
        window.__trailGuardDebugState = {
            active: false,
            lastAnomalies: [],
            lastReset: null
        };
    }
    window.__trailGuardDebugState.active = !!window.__trailGuardDebug;
    if (!info) return;
    if (info.type === 'anomaly') {
        window.__trailGuardDebugState.lastAnomalies.push(info);
        if (window.__trailGuardDebugState.lastAnomalies.length > 20) {
            window.__trailGuardDebugState.lastAnomalies.splice(0, window.__trailGuardDebugState.lastAnomalies.length - 20);
        }
    } else if (info.type === 'reset') {
        window.__trailGuardDebugState.lastReset = info;
    }
}

function drawCase11DebugOverlay() {
    if (!window.__case11DebugOverlay) return;
    if (!isCase11Object(window.currentCase) && !isCase11Object(window.nextCase)) return;
    if (!window.case11 || typeof window.case11.getDebugInfo !== 'function') return;
    const info = window.case11.getDebugInfo();
    const overlay = info && info.overlay ? info.overlay : null;
    if (!overlay) return;
    const trailGuard = overlay.trailGuard || null;

    push();
    textAlign(LEFT, TOP);
    textSize(12);
    noStroke();
    fill(0, 220);
    rect(12, 12, 560, 230, 8);
    fill(255);
    const lines = [
        'case11 debug overlay',
        'frameCount: ' + overlay.frameCount,
        'phase: ' + overlay.phase,
        'isTransitioning: ' + overlay.isTransitioning,
        'allowHostDraw: ' + overlay.allowCount,
        'hidden: ' + overlay.hiddenCount,
        'trail>=3: ' + overlay.trailLongCount,
        'threshold: ' + Number(overlay.largeDistanceThreshold || 0).toFixed(1),
        'suspicious: ' + (overlay.suspiciousVectors || []).map(function(v) { return v.index; }).join(', ')
    ];
    if (trailGuard && Array.isArray(trailGuard.lastAnomalies) && trailGuard.lastAnomalies.length > 0) {
        const last = trailGuard.lastAnomalies[trailGuard.lastAnomalies.length - 1];
        lines.push('trailGuard frame: ' + last.frame);
        lines.push('trailGuard index: ' + last.index);
        lines.push('trailGuard dist: ' + Number(last.distance || 0).toFixed(1));
        lines.push('trailGuard phase: ' + (last.phase || ''));
    }
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], 20, 20 + i * 16);
    }

    const preview = Array.isArray(overlay.preview) ? overlay.preview : [];
    const baseY = 150;
    for (let i = 0; i < preview.length; i++) {
        const v = preview[i];
        const y = baseY + i * 16;
        const textLine = [
            '#' + v.index,
            'hidden=' + v.isHidden,
            'allow=' + v.allowHostDraw,
            'cur=(' + Number(v.currentX).toFixed(1) + ',' + Number(v.currentY).toFixed(1) + ')',
            'trail=' + v.trailLength,
            'head=(' + Number(v.headX).toFixed(1) + ',' + Number(v.headY).toFixed(1) + ')',
            'tail=(' + Number(v.tailX).toFixed(1) + ',' + Number(v.tailY).toFixed(1) + ')'
        ].join('  ');
        fill(255, 255, 255, 230);
        text(textLine, 20, y);
    }

    const suspicious = Array.isArray(overlay.suspiciousVectors) ? overlay.suspiciousVectors : [];
    for (let i = 0; i < suspicious.length; i++) {
        const v = suspicious[i];
        const vec = window.vectors && window.vectors[v.index];
        if (!vec || !vec.current) continue;
        fill(255, 60, 60, 240);
        stroke(255, 60, 60, 220);
        strokeWeight(1);
        circle(vec.current.x, vec.current.y, 14);
        noStroke();
        textSize(11);
        text('#' + v.index, vec.current.x + 10, vec.current.y - 8);
    }
    pop();
}

function getCase11EntryFadeState() {
    if (!window.__case11EntryFade || typeof window.__case11EntryFade !== 'object') {
        window.__case11EntryFade = { active: false, events: [] };
    }
    if (!Array.isArray(window.__case11EntryFade.events)) {
        window.__case11EntryFade.events = [];
    }
    return window.__case11EntryFade;
}

function pushCase11EntryFadeEvent(type, detail) {
    const state = getCase11EntryFadeState();
    const event = Object.assign({
        type,
        frame: Number(window.frameCount || 0),
        time: Date.now()
    }, detail || {});
    state.events.push(event);
    if (state.events.length > 120) {
        state.events.splice(0, state.events.length - 120);
    }
    if (window.case11 && window.case11._case11State && Array.isArray(window.case11._case11State.pointEvents)) {
        window.case11._case11State.pointEvents.push(Object.assign({}, event, { type: 'entry-fade-' + type }));
        if (window.case11._case11State.pointEvents.length > 240) {
            window.case11._case11State.pointEvents.splice(0, window.case11._case11State.pointEvents.length - 240);
        }
    }
    return event;
}

window.startCase11EntryFade = function startCase11EntryFade(reason) {
    const frame = Number(window.frameCount || 0);
    const state = getCase11EntryFadeState();
    const holdFrames = 4550;
    state.active = true;
    state.startFrame = frame;
    state.endFrame = frame + holdFrames;
    state.holdFrames = holdFrames;
    state.reason = reason || 'case11-entry-fade-before-move';
    state.fadeCompleted = false;
    state.holdPositions = (window.vectors || []).map(function(v, index) {
        const x = Number.isFinite(Number(v && v.current && v.current.x)) ? Number(v.current.x) : 0;
        const y = Number.isFinite(Number(v && v.current && v.current.y)) ? Number(v.current.y) : 0;
        if (v) {
            v.isHidden = true;
            v.__case11EntryFadeHidden = true;
            v.__case11EntryFadeHoldX = x;
            v.__case11EntryFadeHoldY = y;
        }
        return { index, x, y };
    });
    pushCase11EntryFadeEvent('start', {
        reason: state.reason,
        startFrame: state.startFrame,
        endFrame: state.endFrame,
        holdFrames: state.holdFrames,
        points: state.holdPositions.slice(0, 80)
    });
    return state;
};

window.getCase11EntryFadeDebug = function getCase11EntryFadeDebug() {
    const state = getCase11EntryFadeState();
    return {
        active: !!state.active,
        startFrame: Number(state.startFrame || 0),
        endFrame: Number(state.endFrame || 0),
        holdFrames: Number(state.holdFrames || 0),
        reason: state.reason || '',
        fadeCompleted: !!state.fadeCompleted,
        events: state.events.slice(-40),
        holdPositions: Array.isArray(state.holdPositions) ? state.holdPositions.slice(0, 80) : []
    };
};

function handleCase11EntryFade(bgR, bgG, bgB, fadeAlpha) {
    const state = getCase11EntryFadeState();
    if (!state.active) return false;
    const frame = Number(window.frameCount || 0);
    const startFrame = Number(state.startFrame || frame);
    const endFrame = Number(state.endFrame || 0);
    const settleFrames = 24;
    const settleEndFrame = endFrame + settleFrames;
    const trailMode = (window.config && window.config.renderMode && window.config.renderMode.trail)
        ? window.config.renderMode.trail
        : 'history';
    const useAccumulate = trailMode === 'accumulate';
    const isCase11Now = isCase11Object(window.currentCase) || isCase11Object(window.nextCase);
    if (!isCase11Now) {
        state.active = false;
        pushCase11EntryFadeEvent('cancel', { reason: 'current-case-is-not-case11' });
        return false;
    }

    function freezeVectorsAtEntryPositions(shouldTruncateTrail) {
        (window.vectors || []).forEach(function(v) {
            if (!v) return;
            const x = Number.isFinite(Number(v.__case11EntryFadeHoldX)) ? Number(v.__case11EntryFadeHoldX) : (v.current ? Number(v.current.x) : 0);
            const y = Number.isFinite(Number(v.__case11EntryFadeHoldY)) ? Number(v.__case11EntryFadeHoldY) : (v.current ? Number(v.current.y) : 0);
            if (v.current) {
                v.current.x = x;
                v.current.y = y;
            }
            v.isHidden = true;
            if (shouldTruncateTrail) {
                if (typeof window.createVector === 'function') {
                    v.trail = [window.createVector(x, y), window.createVector(x, y)];
                } else {
                    v.trail = [{ x, y }, { x, y }];
                }
            }
        });
    }

    // 前caseの通常canvas上の残像を、case11の座標移動を止めたまま馴染ませて消す。
    // 不透明背景を一気に乗せると「ブツッ」と見えるため、低〜中alphaで段階的に背景を重ねる。
    if (frame <= settleEndFrame) {
        const duration = Math.max(1, endFrame - startFrame);
        const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));
        const eased = 1 - Math.pow(1 - progress, 3);
        const baseAlpha = Math.max(8, Math.min(48, Number(fadeAlpha || 0) * 0.32));
        const targetAlpha = Math.max(18, Math.min(72, Number(fadeAlpha || 0) * 0.58));
        const tailProgress = frame > endFrame
            ? Math.max(0, Math.min(1, (frame - endFrame) / Math.max(1, settleFrames)))
            : 0;
        const blendAlpha = frame <= endFrame
            ? Math.round(baseAlpha + (targetAlpha - baseAlpha) * eased)
            : Math.round(targetAlpha * (0.72 + (0.18 * tailProgress)));
        background(bgR, bgG, bgB, Math.max(8, Math.min(90, blendAlpha)));
        if (useAccumulate && window.trailBuffer && typeof window.trailBuffer.background === 'function') {
            const trailFadeAlpha = Math.round(8 + (12 * tailProgress));
            window.trailBuffer.background(bgR, bgG, bgB, Math.max(8, Math.min(20, trailFadeAlpha)));
        }
        freezeVectorsAtEntryPositions(false);
        return true;
    }

    // フェード完了後は不透明背景で切らず、trailだけ断ってcase11へ確定する。
    // 次フレームからcase11描画を再開するが、前case座標→case11座標のmorph線は描かせない。
    if (useAccumulate && window.trailBuffer && typeof window.trailBuffer.clear === 'function') {
        window.trailBuffer.clear();
    }
    freezeVectorsAtEntryPositions(true);
    (window.vectors || []).forEach(function(v) {
        if (!v) return;
        v.__case11EntryFadeCompletedHidden = true;
        delete v.__case11EntryFadeHidden;
        delete v.__case11EntryFadeHoldX;
        delete v.__case11EntryFadeHoldY;
    });
    if (isTransitioning && isCase11Object(window.nextCase)) {
        morph = 1;
    }
    window.__case11ForceOpaqueClearUntilFrame = 0;
    state.active = false;
    state.fadeCompleted = true;
    pushCase11EntryFadeEvent('end', {
        reason: state.reason || 'case11-entry-fade-before-move',
        endFrame: frame,
        mode: 'soft-background-blend-no-opaque-cut'
    });
    return true;
}

function prepareNextCase(targetCase = null, options = {}) {
    const allowInterrupt = !!(options && options.interrupt);
    const usePointSequence = !!(options && options.pointSequence);
    if (isTransitioning && !allowInterrupt) return; // 通常経路は既存どおり重複開始しない

    const currentBelongsToState = currentCase && getBaseCaseIndex(currentCase) === state;
    const preserveRuntimeSource = currentCase && currentCase.__isRuntimeCase === true && currentBelongsToState;
    currentCase = (isTransitioning && allowInterrupt) || preserveRuntimeSource ? currentCase : cases[state];
    nextCase = targetCase || cases[(state + 1) % cases.length];
    const transitionId = ++window.__caseTransitionSeq;
    
    const currentCount = Math.max(1, Number(currentCase.config.count) || 1);
    const nextCount = Math.max(1, Number(nextCase.config.count) || 1);

    if (usePointSequence && POINT_SEQUENCE_TRANSITION_STEP1.enabled
        && getPointSequenceSeconds(nextCase) > 0
        && !isCase11Object(currentCase) && !isCase11Object(nextCase)) {
        beginPointSequenceTransition(
            nextCase,
            getBaseCaseIndex(currentCase),
            !!(isTransitioning && allowInterrupt)
        );
    } else {
        window.__pointSequenceTransition = null;
        targetAssignments = [];
        for (let i = 0; i < Math.max(currentCount, nextCount); i++) {
            const targetIndex = i < nextCount ? i : Math.floor(Math.random() * nextCount);
            targetAssignments.push(targetIndex);
        }
    }

    // 描画更新より前に「終わり」と「始まり予定」を通知する。
    // case11のように入場瞬間だけ非表示制御が必要なcaseは、ここで先に処理できる。
    dispatchCaseLifecycleEvent('caseWillEnd', {
        currentCase: currentCase,
        nextCase: nextCase,
        transitionId,
        reason: 'before-transition-start'
    });
    dispatchCaseLifecycleEvent('caseWillStart', {
        currentCase: currentCase,
        nextCase: nextCase,
        transitionId,
        reason: 'before-transition-start'
    });

    isTransitioning = true;
    morph = 0;

    // 既存互換イベント。新規の表示/非表示制御は caseWillEnd / caseWillStart を優先する。
    const event = new CustomEvent('caseChanged', { detail: { currentCase: currentCase, nextCase: nextCase, transitionId: transitionId, phase: 'transition-start' } });
    document.dispatchEvent(event);

    if (window.Slider && typeof window.Slider.updateSliders === 'function') {
        window.Slider.updateSliders(nextCase);
    }

    if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
        window.Table.updateCaseComparisonTable();
    }

    if (window.Color.isUsingRandomColors()) {
        vectors.forEach(v => {
            v.randomColor = null; // ランダム色をリセット
        });
    }
}




function getRenderScale() {
    const scale = window.config && Number.isFinite(Number(window.config.renderScale))
        ? Number(window.config.renderScale)
        : 1;
    return Math.max(0.1, Math.min(3, scale));
}

function toBaseRenderPoint(x, y) {
    const scale = getRenderScale();
    return scale === 1
        ? { x, y }
        : {
            x: width / 2 + (x - width / 2) * scale,
            y: height / 2 + (y - height / 2) * scale
        };
}

function toRenderPoint(x, y) {
    const renderPoint = toBaseRenderPoint(x, y);
    if (window.SpatialPlaneView && typeof window.SpatialPlaneView.projectRenderPoint === 'function') {
        return window.SpatialPlaneView.projectRenderPoint(renderPoint);
    }
    return renderPoint;
}

function toRenderSegment(pointA, pointB) {
    const baseA = toBaseRenderPoint(pointA.x, pointA.y);
    const baseB = toBaseRenderPoint(pointB.x, pointB.y);

    // 正面向き痕跡モードでは、既存の短い線分の色・太さ・長さ・向きを維持したまま、
    // 線分の中心位置だけを傾いた3D平面へ移す。平面貼付による圧縮を避ける。
    if (window.SpatialPlaneView && typeof window.SpatialPlaneView.projectScreenFacingSegment === 'function') {
        return window.SpatialPlaneView.projectScreenFacingSegment(baseA, baseB);
    }

    return {
        pointA: toRenderPoint(pointA.x, pointA.y),
        pointB: toRenderPoint(pointB.x, pointB.y)
    };
}


/*
 * Neumorphism depth layer
 * -----------------------
 * UIパネルのDOM・配置・クリック判定は前面のまま維持し、描画線だけを
 * Neumorphism の物理パネル領域上へ再描画する。これによりUIを実際に
 * canvas背面へ移動せず、「描画がUIの前を通る」奥行きだけを作る。
 * Glassでは無効。case切替パレットの透明領域全体は対象にせず、
 * 実在するボタン面のみクリップ対象にする。
 */
const NEUMORPHISM_FOREGROUND_CANVAS_ID = 'neumorphism-drawing-foreground';
const NEUMORPHISM_INK_CANVAS_ID = 'neumorphism-ink-foreground';
const NEUMORPHISM_INK_MARK_LIMIT = 720;
const NEUMORPHISM_INK_ADDS_PER_FRAME = 40;
let neumorphismInkMarks = [];
let neumorphismInkAddsThisFrame = 0;

function isNeumorphismDepthLayerActive() {
    return document.body && document.body.getAttribute('data-ui-theme') === 'neumorphism';
}

function ensureNeumorphismForegroundCanvas() {
    let overlay = document.getElementById(NEUMORPHISM_FOREGROUND_CANVAS_ID);
    if (!overlay) {
        overlay = document.createElement('canvas');
        overlay.id = NEUMORPHISM_FOREGROUND_CANVAS_ID;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
    }
    const source = document.getElementById('defaultCanvas0') || document.querySelector('#sketch-holder canvas');
    const sourceRect = source && typeof source.getBoundingClientRect === 'function'
        ? source.getBoundingClientRect()
        : { left: 0, top: 0, width: Number(width) || window.innerWidth, height: Number(height) || window.innerHeight };
    const targetWidth = Math.max(1, Math.round(Number(width) || sourceRect.width || window.innerWidth || 1));
    const targetHeight = Math.max(1, Math.round(Number(height) || sourceRect.height || window.innerHeight || 1));
    if (overlay.width !== targetWidth) overlay.width = targetWidth;
    if (overlay.height !== targetHeight) overlay.height = targetHeight;
    overlay.style.left = `${sourceRect.left}px`;
    overlay.style.top = `${sourceRect.top}px`;
    overlay.style.width = `${sourceRect.width || targetWidth}px`;
    overlay.style.height = `${sourceRect.height || targetHeight}px`;
    return { overlay, sourceRect, targetWidth, targetHeight };
}

function getNeumorphismDepthClipElements() {
    /*
     * DEPTH SURFACE CONTRACT:
     * UI の前後表現はテーマ外観の一部であり、パネル DOM やレイアウトを動かして作らない。
     * Neumorphism で「物理面」として見えている UI だけを明示列挙する。
     * 新しい実表示パネルを追加した場合は、透明な配置ラッパーではなく面本体だけをここへ追加する。
     */
    const elements = [
        document.getElementById('ui-variant-panel'),
        document.getElementById('glass-cursor-panel-3'),
        document.getElementById('glass-cursor-panel-4'),
        document.getElementById('glass-cursor-panel-6'),
        document.getElementById('glass-cursor-panel-7'),
        ...Array.from(document.querySelectorAll('.glass-panel:not([hidden]):not(.glass-forced-hidden):not(.is-hidden)')),
        ...Array.from(document.querySelectorAll('#glass-control-bar button, #glass-control-bar .glass-control-pill')),
        ...Array.from(document.querySelectorAll(
            '#case-comparison.case-palette-only button, ' +
            '#case-comparison.case-palette-only th.case-header, ' +
            '#case-comparison.case-palette-only .case-layout-toggle, ' +
            '#case-comparison.case-palette-only .case-choice-button, ' +
            '#case-comparison.case-palette-only .case-action-button, ' +
            '#case-comparison.case-palette-only .case-slot-button'
        ))
    ];
    return Array.from(new Set(elements)).filter((element) => {
        if (!element || typeof element.getBoundingClientRect !== 'function') return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
        return rect.width > 0 && rect.height > 0 && (!style || (style.display !== 'none' && style.visibility !== 'hidden'));
    });
}


function getNeumorphismInkRuntimeSettings() {
    const style = window.getComputedStyle ? window.getComputedStyle(document.body) : null;
    const readNumber = (name, fallback) => {
        const parsed = style ? Number.parseFloat(style.getPropertyValue(name)) : NaN;
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    return {
        coverage: Math.max(0, Math.min(1, readNumber('--neumo-ink-coverage', 0.82))),
        fadeSeconds: Math.max(0.1, Math.min(5, readNumber('--neumo-ink-fade-seconds', 1.2))),
        spreadSeconds: Math.max(0, Math.min(3, readNumber('--neumo-ink-spread-seconds', 0.6)))
    };
}

function getNeumorphismInkSurfaceElements() {
    /*
     * INK SURFACE CONTRACT:
     * 墨跡は Neumorphism で実際に見えている物理面だけに残す。
     * 透明な配置領域・比較テーブル全体の当たり矩形・非表示内容は対象にしない。
     * 初期検証では ui-variant-panel と右側の 1/2/3/4 パネルに限定する。
     */
    const surfaceRoots = [
        document.getElementById('ui-variant-panel'),
        document.getElementById('glass-cursor-panel-3'),
        document.getElementById('glass-cursor-panel-4'),
        document.getElementById('glass-cursor-panel-6'),
        document.getElementById('glass-cursor-panel-7')
    ].filter(Boolean);

    return surfaceRoots.map((element) => {
        if (element.classList && element.classList.contains('collapsed')) {
            return element.querySelector('.ui-header') || element;
        }
        return element;
    }).filter((element) => {
        if (!element || typeof element.getBoundingClientRect !== 'function') return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
        return rect.width > 0 && rect.height > 0 && (!style || (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number.parseFloat(style.opacity || '1') > 0
        ));
    });
}

function ensureNeumorphismInkCanvas() {
    let overlay = document.getElementById(NEUMORPHISM_INK_CANVAS_ID);
    if (!overlay) {
        overlay = document.createElement('canvas');
        overlay.id = NEUMORPHISM_INK_CANVAS_ID;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
    }
    const source = document.getElementById('defaultCanvas0') || document.querySelector('#sketch-holder canvas');
    const sourceRect = source && typeof source.getBoundingClientRect === 'function'
        ? source.getBoundingClientRect()
        : { left: 0, top: 0, width: Number(width) || window.innerWidth, height: Number(height) || window.innerHeight };
    const targetWidth = Math.max(1, Math.round(Number(width) || sourceRect.width || window.innerWidth || 1));
    const targetHeight = Math.max(1, Math.round(Number(height) || sourceRect.height || window.innerHeight || 1));
    if (overlay.width !== targetWidth) overlay.width = targetWidth;
    if (overlay.height !== targetHeight) overlay.height = targetHeight;
    overlay.style.left = `${sourceRect.left}px`;
    overlay.style.top = `${sourceRect.top}px`;
    overlay.style.width = `${sourceRect.width || targetWidth}px`;
    overlay.style.height = `${sourceRect.height || targetHeight}px`;
    return { overlay, sourceRect, targetWidth, targetHeight };
}

function clearNeumorphismInkLayer() {
    neumorphismInkMarks = [];
    const overlay = document.getElementById(NEUMORPHISM_INK_CANVAS_ID);
    if (overlay) {
        const context = overlay.getContext('2d');
        context && context.clearRect(0, 0, overlay.width, overlay.height);
    }
}

function getNeumorphismInkSurfaceAtPoint(point, state) {
    if (!point || !state) return null;
    const scaleX = state.targetWidth / Math.max(1, state.sourceRect.width || state.targetWidth);
    const scaleY = state.targetHeight / Math.max(1, state.sourceRect.height || state.targetHeight);
    const pageX = state.sourceRect.left + point.x / scaleX;
    const pageY = state.sourceRect.top + point.y / scaleY;

    for (const element of getNeumorphismInkSurfaceElements()) {
        const rect = element.getBoundingClientRect();
        if (pageX < rect.left || pageX > rect.right || pageY < rect.top || pageY > rect.bottom) continue;

        const inkSettings = getNeumorphismInkRuntimeSettings();
        if (inkSettings.coverage <= 0) continue;
        const horizontalInset = rect.width * (1 - inkSettings.coverage) * 0.5;
        const verticalInset = rect.height * (1 - inkSettings.coverage) * 0.5;
        if (
            pageX < rect.left + horizontalInset ||
            pageX > rect.right - horizontalInset ||
            pageY < rect.top + verticalInset ||
            pageY > rect.bottom - verticalInset
        ) continue;

        const edgeDistance = Math.min(
            pageX - rect.left,
            rect.right - pageX,
            pageY - rect.top,
            rect.bottom - pageY
        );
        const centerThreshold = Math.max(14, Math.min(38, Math.min(rect.width, rect.height) * 0.22));
        const edgeRatio = Math.max(0, Math.min(1, edgeDistance / centerThreshold));

        // 操作部付近は「水分が乗りにくい凹凸」として残像保持を短くする。
        let controlRatio = 1;
        const controls = element.querySelectorAll('button, input, select, .slider-container, .reset-btn');
        controls.forEach((control) => {
            if (!control || typeof control.getBoundingClientRect !== 'function') return;
            const controlRect = control.getBoundingClientRect();
            const padding = 8;
            const left = controlRect.left - padding;
            const right = controlRect.right + padding;
            const top = controlRect.top - padding;
            const bottom = controlRect.bottom + padding;
            if (pageX >= left && pageX <= right && pageY >= top && pageY <= bottom) {
                controlRatio = Math.min(controlRatio, 0.08);
                return;
            }
            const dx = Math.max(left - pageX, 0, pageX - right);
            const dy = Math.max(top - pageY, 0, pageY - bottom);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 18) {
                controlRatio = Math.min(controlRatio, 0.18 + (distance / 18) * 0.44);
            }
        });

        return {
            element,
            retentionRatio: Math.max(0, Math.min(1, edgeRatio * controlRatio))
        };
    }
    return null;
}

function queueNeumorphismInkSegment(pointA, pointB, rgb, opacity, strokeSize, fadeSpeed) {
    if (!isNeumorphismDepthLayerActive() || !pointA || !pointB || !Array.isArray(rgb)) return;
    if (neumorphismInkAddsThisFrame >= NEUMORPHISM_INK_ADDS_PER_FRAME) return;

    const inkState = ensureNeumorphismInkCanvas();
    const midpoint = { x: (pointA.x + pointB.x) * 0.5, y: (pointA.y + pointB.y) * 0.5 };
    const surface = getNeumorphismInkSurfaceAtPoint(midpoint, inkState);
    if (!surface) return;

    const retention = surface.retentionRatio;
    const inkSettings = getNeumorphismInkRuntimeSettings();
    const speedValue = Math.max(0.0005, Math.min(0.1, Number(fadeSpeed) || 0.0001));
    // 背景canvasと同様、墨の幅が薄く消える設定ほど付着の濃さへ反映する。
    const slowInk = 1 - ((speedValue - 0.0005) / (0.1 - 0.0005));

    /*
     * 流線本体は従来通り通過する。
     * インク反映は中央からの表示範囲、インク馴染は消失時間、
     * インク浸透は付着後に柔らかく広がる時間を個別に制御する。
     */
    const holdFrames = Math.round(1 + retention * 5);
    const fadeFrames = Math.max(1, Math.round(inkSettings.fadeSeconds * 60 * (0.35 + retention * 0.65)));
    const spreadFrames = Math.max(0, Math.round(inkSettings.spreadSeconds * 60));
    const widthScale = 0.16 + retention * (0.54 + slowInk * 0.16);
    const alphaScale = 0.07 + retention * (0.26 + slowInk * 0.16);

    neumorphismInkMarks.push({
        a: { x: pointA.x, y: pointA.y },
        b: { x: pointB.x, y: pointB.y },
        rgb: rgb.slice(0, 3),
        born: Number(window.frameCount || 0),
        holdFrames,
        fadeFrames,
        spreadFrames,
        width: Math.max(0.2, Number(strokeSize) * widthScale),
        alpha: Math.max(0, Math.min(1, Number(opacity) * alphaScale))
    });
    neumorphismInkAddsThisFrame += 1;

    if (neumorphismInkMarks.length > NEUMORPHISM_INK_MARK_LIMIT) {
        neumorphismInkMarks.splice(0, neumorphismInkMarks.length - NEUMORPHISM_INK_MARK_LIMIT);
    }
}

function renderNeumorphismInkFrame() {
    neumorphismInkAddsThisFrame = 0;
    const existing = document.getElementById(NEUMORPHISM_INK_CANVAS_ID);
    if (!isNeumorphismDepthLayerActive()) {
        if (neumorphismInkMarks.length || existing) clearNeumorphismInkLayer();
        return;
    }

    const state = ensureNeumorphismInkCanvas();
    const context = state.overlay.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, state.overlay.width, state.overlay.height);

    const scaleX = state.targetWidth / Math.max(1, state.sourceRect.width || state.targetWidth);
    const scaleY = state.targetHeight / Math.max(1, state.sourceRect.height || state.targetHeight);
    const nowFrame = Number(window.frameCount || 0);
    const survivors = [];

    context.save();
    context.beginPath();
    getNeumorphismInkSurfaceElements().forEach((element) => {
        const rect = element.getBoundingClientRect();
        const left = (rect.left - state.sourceRect.left) * scaleX;
        const top = (rect.top - state.sourceRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const radiusValue = window.getComputedStyle
            ? Number.parseFloat(window.getComputedStyle(element).borderRadius || '0')
            : 0;
        const radius = Math.max(0, Math.min(width / 2, height / 2, Number.isFinite(radiusValue) ? radiusValue : 0));
        if (typeof context.roundRect === 'function' && radius > 0) {
            context.roundRect(left, top, width, height, radius);
        } else {
            context.rect(left, top, width, height);
        }
    });
    context.clip();
    context.lineCap = 'round';
    context.lineJoin = 'round';

    neumorphismInkMarks.forEach((mark) => {
        const age = nowFrame - mark.born;
        const fadeAge = Math.max(0, age - mark.holdFrames);
        const progress = Math.max(0, Math.min(1, fadeAge / Math.max(1, mark.fadeFrames)));
        if (progress >= 1) return;

        // 面に付着した墨跡は、線幅を潰して消すのではなく、
        // 付着位置にほぼ同じ幅で留まりながら透明化して「しみ込む」ように消す。
        // 端／操作部付近の素早い消失差は holdFrames / fadeFrames 側で維持する。
        const easedFade = progress * progress * (3 - 2 * progress);
        const spreadProgress = mark.spreadFrames > 0
            ? Math.max(0, Math.min(1, age / mark.spreadFrames))
            : 0;
        const easedSpread = spreadProgress * spreadProgress * (3 - 2 * spreadProgress);
        const widthFactor = (1 + 0.34 * easedSpread) * (1 - 0.05 * easedFade);
        const alphaFactor = 1 - easedFade;
        context.strokeStyle = `rgba(${Math.round(mark.rgb[0])}, ${Math.round(mark.rgb[1])}, ${Math.round(mark.rgb[2])}, ${Math.max(0, Math.min(1, mark.alpha * alphaFactor))})`;
        context.lineWidth = Math.max(0.18, mark.width * widthFactor);
        context.beginPath();
        context.moveTo(mark.a.x, mark.a.y);
        context.lineTo(mark.b.x, mark.b.y);
        context.stroke();
        survivors.push(mark);
    });
    context.restore();
    neumorphismInkMarks = survivors;
}

function getNeumorphismDepthClipOutset(element, rect) {
    /*
     * Neumorphism depth means the visible UI sits behind the drawing.
     * Clip outward from the visible element so lines, points, and trails pass
     * over rims, text, controls, and soft outer shadows without changing layout
     * or painting transparent placement wrappers.
     */
    if (!element || !rect) return 0;
    if (element.id === 'ui-variant-panel' || element.classList?.contains('glass-panel') || /^glass-cursor-panel-[3467]$/.test(element.id || '')) {
        return 18;
    }
    if (element.closest?.('#glass-control-bar') || element.closest?.('#case-comparison.case-palette-only')) {
        return 8;
    }
    return 12;
}

function beginNeumorphismDepthFrame() {
    const existing = document.getElementById(NEUMORPHISM_FOREGROUND_CANVAS_ID);
    if (!isNeumorphismDepthLayerActive()) {
        if (existing) {
            const existingContext = existing.getContext('2d');
            existingContext && existingContext.clearRect(0, 0, existing.width, existing.height);
        }
        return null;
    }
    const state = ensureNeumorphismForegroundCanvas();
    const context = state.overlay.getContext('2d');
    if (!context) return null;
    context.clearRect(0, 0, state.overlay.width, state.overlay.height);
    const scaleX = state.targetWidth / Math.max(1, state.sourceRect.width || state.targetWidth);
    const scaleY = state.targetHeight / Math.max(1, state.sourceRect.height || state.targetHeight);
    context.save();
    context.beginPath();
    getNeumorphismDepthClipElements().forEach((element) => {
        const rect = element.getBoundingClientRect();
        const outset = getNeumorphismDepthClipOutset(element, rect);
        const width = rect.width + outset * 2;
        const height = rect.height + outset * 2;
        if (width <= 0 || height <= 0) return;
        context.rect(
            (rect.left - outset - state.sourceRect.left) * scaleX,
            (rect.top - outset - state.sourceRect.top) * scaleY,
            width * scaleX,
            height * scaleY
        );
    });
    context.clip();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    return { context, scaleX, scaleY };
}

function drawNeumorphismDepthSegment(layer, pointA, pointB, rgb, opacity, strokeSize) {
    if (!layer || !pointA || !pointB || !Array.isArray(rgb)) return;
    const context = layer.context;
    context.strokeStyle = `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${Math.max(0, Math.min(1, opacity))})`;
    context.lineWidth = Math.max(0.1, Number(strokeSize) || 0.1);
    context.beginPath();
    context.moveTo(pointA.x, pointA.y);
    context.lineTo(pointB.x, pointB.y);
    context.stroke();
}

function endNeumorphismDepthFrame(layer) {
    if (!layer || !layer.context) return;
    layer.context.restore();
}

function updateAndDrawVectors() {
    const FADE_ALPHA_SCALE = 51;
    let neumorphismDepthLayer = null;
    try {
        if (!currentCase) {
            console.error('Current case is undefined');
            return;
        }

        const fadeSpeed = isTransitioning 
            ? lerp(currentCase.config.fadeSpeed, nextCase.config.fadeSpeed, morph)
            : currentCase.config.fadeSpeed;
        const trailMode = (window.config && window.config.renderMode && window.config.renderMode.trail)
            ? window.config.renderMode.trail
            : "history";
        const useAccumulate = trailMode === "accumulate";
        const bgHex = (window.config && window.config.canvasBgColor)
            ? window.config.canvasBgColor
            : "#e1e1e1";
        const { r: bgR, g: bgG, b: bgB } = hexToRgb(bgHex);
        const fadeAlpha = constrain(fadeSpeed * 45 * FADE_ALPHA_SCALE, 0, 255);
        neumorphismDepthLayer = beginNeumorphismDepthFrame();
        renderNeumorphismInkFrame();
        const case11ForceOpaqueClearUntil = Number(window.__case11ForceOpaqueClearUntilFrame || 0);
        const case11ForceOpaqueClear = Number.isFinite(case11ForceOpaqueClearUntil)
            && case11ForceOpaqueClearUntil >= Number(window.frameCount || 0);
        const spatialPlaneClearRequested = window.SpatialPlaneView
            && typeof window.SpatialPlaneView.consumeClearRequested === 'function'
            && window.SpatialPlaneView.consumeClearRequested();
        if (spatialPlaneClearRequested) {
            // 視点角度を変更したフレームは、変更前投影の残りを一度消し、
            // 同じ既存ストロークが新しい角度で再形成される状態に揃える。
            background(bgR, bgG, bgB, 255);
            if (window.trailBuffer && typeof window.trailBuffer.clear === 'function') {
                window.trailBuffer.clear();
            }
        } else if (case11ForceOpaqueClear) {
            // case11入場直後は、前caseのhistory描画が通常キャンバス上に半透明で残る。
            // trailBuffer.clear() だけでは消えないため、数フレームだけ不透明背景で完全消去する。
            background(bgR, bgG, bgB, 255);
            if (window.trailBuffer && typeof window.trailBuffer.clear === 'function') {
                window.trailBuffer.clear();
            }
        } else if (useAccumulate) {
            background(bgR, bgG, bgB, 255);
        } else {
            background(bgR, bgG, bgB, fadeAlpha);
        }
        
        handleCase11EntryFade(bgR, bgG, bgB, fadeAlpha);

        // 画像背景の処理（既存のコード）
        if (currentCase.config.image && currentCase.config.image instanceof p5.Image) {
            push();
            tint(255, currentCase.config.imageOpacity * 255);
            image(currentCase.config.image, 0, 0, width, height);
            pop();
        }
        
        var cycleValueSnapshot = null;
        var destinationCycleValueSnapshot = null;

        if (window.RuntimeIntegratedSlotApplyAdapter
            && typeof window.RuntimeIntegratedSlotApplyAdapter.applyRuntimeCycleValues === 'function'
            && currentCase && currentCase.__isRuntimeCase === true) {
            cycleValueSnapshot = window.RuntimeIntegratedSlotApplyAdapter.applyRuntimeCycleValues(currentCase, frameCount);
        } else if (window.Slider && typeof window.Slider.updateCycleParameters === 'function') {
            cycleValueSnapshot = window.Slider.applyCycleRuntimeValues
                ? window.Slider.applyCycleRuntimeValues(currentCase, frameCount)
                : null;
        }

        // 統合slotが遷移先の場合、到着先の動きもslotの周期定義で計算する。
        if (isTransitioning
            && nextCase && nextCase.__isRuntimeCase === true
            && window.RuntimeIntegratedSlotApplyAdapter
            && typeof window.RuntimeIntegratedSlotApplyAdapter.applyRuntimeCycleValues === 'function') {
            destinationCycleValueSnapshot = window.RuntimeIntegratedSlotApplyAdapter.applyRuntimeCycleValues(nextCase, frameCount);
        }

        try {
            currentCase.update(frameCount);
            if (useAccumulate) {
                if (!window.trailBuffer) {
                    window.trailBuffer = createGraphics(width, height);
                    window.trailBuffer.clear();
                }
                window.trailBuffer.background(
                    bgR,
                    bgG,
                    bgB,
                    fadeAlpha
                );
            }
            
            const caseId = getBaseCaseIndex(currentCase);
            const enteringCase11 = isTransitioning && isCase11Object(nextCase);
            const activeCase11 = isCase11Object(currentCase) && !isTransitioning;
            const case11Phase = enteringCase11 || activeCase11;

            for (let i = 0; i < vectors.length; i++) {
                const v = vectors[i];
                const shouldDrawVector = case11Phase
                    ? !!v.__case11AllowHostDraw
                    : !v.isHidden;
                if (case11Phase && !shouldDrawVector) {
                    continue;
                }
                const case11HoldUntilFrame = Number(v.__case11HoldUntilFrame || 0);
                if (case11HoldUntilFrame && frameCount <= case11HoldUntilFrame) {
                    const holdX = Number.isFinite(Number(v.__case11HoldX)) ? Number(v.__case11HoldX) : v.current.x;
                    const holdY = Number.isFinite(Number(v.__case11HoldY)) ? Number(v.__case11HoldY) : v.current.y;
                    v.current.x = holdX;
                    v.current.y = holdY;
                    const holdTrailLength = Math.max(2, Math.round(
                        isTransitioning
                            ? lerp(currentCase.config.trailLength, nextCase.config.trailLength, morph)
                            : currentCase.config.trailLength
                    ));
                    v.trail = [];
                    for (let holdIndex = 0; holdIndex < holdTrailLength; holdIndex++) {
                        v.trail.push(createVector(holdX, holdY));
                    }
                    continue;
                } else if (case11HoldUntilFrame && frameCount > case11HoldUntilFrame) {
                    delete v.__case11HoldUntilFrame;
                    delete v.__case11HoldStartedFrame;
                    delete v.__case11HoldX;
                    delete v.__case11HoldY;
                    delete v.__case11HoldReason;
                    v.trail = [createVector(v.current.x, v.current.y), createVector(v.current.x, v.current.y)];
                }

                if (!case11Phase) {
                    // 目標位置の計算
                    let targetX, targetY;
                    if (isTransitioning) {
                        const activeSequence = isPointSequenceTransitionActive() ? window.__pointSequenceTransition : null;
                        const origin = activeSequence && activeSequence.originPositions[i];
                        const sourceIndex = activeSequence && Array.isArray(activeSequence.sourceAssignments)
                            ? activeSequence.sourceAssignments[i]
                            : (i % currentCase.config.count);
                        const useMovingOldCase = !!(activeSequence && activeSequence.dynamicOrigins);
                        const currentX = useMovingOldCase
                            ? currentCase.getTargetX(sourceIndex, frameCount)
                            : (origin ? origin.x : currentCase.getTargetX(sourceIndex, frameCount));
                        const currentY = useMovingOldCase
                            ? currentCase.getTargetY(sourceIndex, frameCount)
                            : (origin ? origin.y : currentCase.getTargetY(sourceIndex, frameCount));
                        // 到着先は遷移中も後caseの現在位置を参照し、到着後の動きへ連続接続する。
                        const nextX = nextCase.getTargetX(targetAssignments[i], frameCount);
                        const nextY = nextCase.getTargetY(targetAssignments[i], frameCount);
                        const pointProgress = activeSequence ? getPointSequenceProgress(i) : morph;
                        targetX = lerp(currentX, nextX, pointProgress);
                        targetY = lerp(currentY, nextY, pointProgress);
                    } else {
                        targetX = currentCase.getTargetX(i, frameCount);
                        targetY = currentCase.getTargetY(i, frameCount);
                    }

                    // ベクトル位置の更新
                    const maxSpeed = 5;
                    const dx = targetX - v.current.x;
                    const dy = targetY - v.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > maxSpeed) {
                        v.current.x += (dx / distance) * maxSpeed;
                        v.current.y += (dy / distance) * maxSpeed;
                    } else {
                        v.current.x = targetX;
                        v.current.y = targetY;
                    }

                    // SVGパスの効果を適用
                    if (window.Controller_SVGanime && window.Controller_SVGanime.isEnabled()) {
                        const pathEffect = window.Controller_SVGanime.calculatePathInfluence({
                            x: v.current.x,
                            y: v.current.y
                        });
                        
                        if (pathEffect) {
                            const params = window.Controller_SVGanime.getParameters();
                            v.current.x = lerp(v.current.x, pathEffect.x, params.influence * params.attraction);
                            v.current.y = lerp(v.current.y, pathEffect.y, params.influence * params.attraction);
                        }
                    }

                    // ベクター設定と画像の影響を適用（既存のコード）
                    const vectorSettings = window.Vector.getSettings();
                    if (vectorSettings.useImageForce) {
                        const effect = window.Vector.calculateVectorEffect(v.current.x, v.current.y);
                        v.current.x += effect.x * vectorSettings.speed;
                        v.current.y += effect.y * vectorSettings.speed;
                    }
                }

            const trailLength = isTransitioning 
                ? Math.floor(lerp(currentCase.config.trailLength, nextCase.config.trailLength, morph))
                : currentCase.config.trailLength;
            
            if (v.trail.length < trailLength) {
                while (v.trail.length < trailLength) {
                    v.trail.push(createVector(v.current.x, v.current.y));
                }
            } else if (v.trail.length > trailLength) {
                v.trail = v.trail.slice(0, trailLength);
            }

            v.trail.unshift(createVector(v.current.x, v.current.y));
            if (v.trail.length > trailLength) {
                v.trail.pop();
            }
            const trailThreshold = Math.max(220, Math.min(width, height) * 0.22);
            const trailGuardPhase = String(window.case11 && window.case11._case11State && window.case11._case11State.phase || '');
            const shouldGuardTrail = isCase11Object(currentCase)
                && !isTransitioning
                && ['entryFade', 'leftIn', 'rightReturn', 'recycle'].includes(trailGuardPhase);
            if (shouldGuardTrail && isSuspiciousLongTrail(v, trailThreshold)) {
                const head = v.trail[0] || null;
                const tail = v.trail[v.trail.length - 1] || null;
                const debugInfo = {
                    type: 'anomaly',
                    frame: Number(window.frameCount || 0),
                    index: i,
                    distance: getTrailPointDistance(v),
                    currentX: Number(v.current && v.current.x),
                    currentY: Number(v.current && v.current.y),
                    headX: head ? Number(head.x) : NaN,
                    headY: head ? Number(head.y) : NaN,
                    tailX: tail ? Number(tail.x) : NaN,
                    tailY: tail ? Number(tail.y) : NaN,
                    currentCase: window.currentCase && (window.currentCase.name || window.currentCase.caseId || ''),
                    phase: trailGuardPhase
                };
                recordTrailGuardDebug(debugInfo);
                if (resetTrailAtCurrentPosition(v)) {
                    recordTrailGuardDebug(Object.assign({ type: 'reset' }, debugInfo));
                    if (window.__trailGuardDebug) {
                        console.warn('[trailGuard]', debugInfo);
                    }
                }
            }

            let interpolatedColor, interpolatedSize;
            interpolatedColor = resolvePanelAssignedPointColor(i, v, currentCase, caseId, width, height);
            if (!interpolatedColor && isCase11Object(currentCase) && v.__case11Color) {
                const case11Color = getUsableCase11Color(v.__case11Color);
                if (case11Color) {
                    interpolatedColor = color(
                        case11Color[0],
                        case11Color[1],
                        case11Color[2],
                        case11Color.length > 3 ? case11Color[3] : 255
                    );
                }
            }
            if (!interpolatedColor && Array.isArray(currentCase.config.color) && currentCase.config.color.length >= 3) {
                interpolatedColor = color(currentCase.config.color[0], currentCase.config.color[1], currentCase.config.color[2]);
            }
            if (isTransitioning && isPointSequenceTransitionActive()) {
                const activeSequence = window.__pointSequenceTransition;
                const pointProgress = getPointSequenceProgress(i);
                const originSize = Number(activeSequence.originSizes[i]);
                interpolatedSize = lerp(
                    Number.isFinite(originSize) ? originSize : currentCase.config.size,
                    nextCase.config.size,
                    pointProgress
                );
            } else {
                interpolatedSize = isTransitioning
                    ? lerp(currentCase.config.size, nextCase.config.size, morph)
                    : currentCase.config.size;
            }
            v.__pointSequenceRenderedSize = interpolatedSize;

            const resolvedPointColor = interpolatedColor ? [
                red(interpolatedColor),
                green(interpolatedColor),
                blue(interpolatedColor)
            ] : null;
            if (resolvedPointColor && typeof window.ensurePointColorTransition === 'function') {
                const transitionState = window.ensurePointColorTransition(v, resolvedPointColor, Date.now());
                if (transitionState && transitionState.active && typeof window.updatePointColorTransitionState === 'function') {
                    const transitionRgb = window.updatePointColorTransitionState(v, resolvedPointColor, Date.now());
                    if (Array.isArray(transitionRgb) && transitionRgb.length >= 3) {
                        interpolatedColor = color(transitionRgb[0], transitionRgb[1], transitionRgb[2], alpha(interpolatedColor));
                    }
                }
            }
            const visiblePointRgb = interpolatedColor
                ? (liftVisiblePointColor([
                    red(interpolatedColor),
                    green(interpolatedColor),
                    blue(interpolatedColor)
                ]) || [
                    red(interpolatedColor),
                    green(interpolatedColor),
                    blue(interpolatedColor)
                ])
                : (resolvedPointColor
                    ? (liftVisiblePointColor(resolvedPointColor) || resolvedPointColor)
                    : null);
            if (interpolatedColor) {
                window.__lastRenderedPointColor = [
                    resolvedPointColor[0],
                    resolvedPointColor[1],
                    resolvedPointColor[2]
                ];
                if (v) {
                    v.__lastRenderedColor = window.__lastRenderedPointColor.slice();
                }
                if (Array.isArray(window.__lastRenderedPointColors)) {
                    window.__lastRenderedPointColors[i] = window.__lastRenderedPointColor.slice();
                }
                v.__lastAppliedPointColor = window.__lastRenderedPointColor.slice();
            }

            if (useAccumulate) {
                if (shouldDrawVector && v.trail.length > 1) {
                    const p0 = v.trail[0];
                    const p1 = v.trail[1];
                    const trailBufferAlpha = window.casePointColorTransition && window.casePointColorTransition.active
                        ? Math.min(255, 110)
                        : 255;
                    window.trailBuffer.stroke(
                        visiblePointRgb[0],
                        visiblePointRgb[1],
                        visiblePointRgb[2],
                        trailBufferAlpha
                    );
                    const renderSegment = toRenderSegment(p0, p1);
                    const rp0 = renderSegment.pointA;
                    const rp1 = renderSegment.pointB;
                    const renderedStrokeSize = interpolatedSize * getRenderScale();
                    window.trailBuffer.strokeWeight(renderedStrokeSize);
                    window.trailBuffer.line(rp0.x, rp0.y, rp1.x, rp1.y);
                    drawNeumorphismDepthSegment(
                        neumorphismDepthLayer,
                        rp0,
                        rp1,
                        visiblePointRgb,
                        trailBufferAlpha / 255,
                        renderedStrokeSize
                    );
                    queueNeumorphismInkSegment(
                        rp0,
                        rp1,
                        visiblePointRgb,
                        trailBufferAlpha / 255,
                        renderedStrokeSize,
                        fadeSpeed
                    );
                }
            } else if (shouldDrawVector) {
                for (let j = 0; j < v.trail.length - 1; j++) {
                    const alpha = map(j, 0, v.trail.length - 1, 255, 0);
                    const trailColor = color(
                        visiblePointRgb[0],
                        visiblePointRgb[1],
                        visiblePointRgb[2],
                        alpha
                    );
                    stroke(trailColor);
                    const trailSize = interpolatedSize * (1 - j / v.trail.length) * getRenderScale();
                    const renderSegment = toRenderSegment(v.trail[j], v.trail[j + 1]);
                    const rp0 = renderSegment.pointA;
                    const rp1 = renderSegment.pointB;
                    strokeWeight(trailSize);
                    line(rp0.x, rp0.y, rp1.x, rp1.y);
                    drawNeumorphismDepthSegment(
                        neumorphismDepthLayer,
                        rp0,
                        rp1,
                        visiblePointRgb,
                        alpha / 255,
                        trailSize
                    );
                    // 流線表示では全尾部を保持せず、通過した先端片だけを墨跡として付着させる。
                    // これにより流線そのものは従来どおり流れ、墨の幅に応じた跡だけがパネル上へ残る。
                    if (j === 0) {
                        queueNeumorphismInkSegment(
                            rp0,
                            rp1,
                            visiblePointRgb,
                            alpha / 255,
                            trailSize,
                            fadeSpeed
                        );
                    }
                }
            }
            }
        } finally {
            if (window.RuntimeIntegratedSlotApplyAdapter
                && typeof window.RuntimeIntegratedSlotApplyAdapter.restoreRuntimeCycleValues === 'function'
                && nextCase && nextCase.__isRuntimeCase === true) {
                window.RuntimeIntegratedSlotApplyAdapter.restoreRuntimeCycleValues(nextCase, destinationCycleValueSnapshot);
            }

            if (window.RuntimeIntegratedSlotApplyAdapter
                && typeof window.RuntimeIntegratedSlotApplyAdapter.restoreRuntimeCycleValues === 'function'
                && currentCase && currentCase.__isRuntimeCase === true) {
                window.RuntimeIntegratedSlotApplyAdapter.restoreRuntimeCycleValues(currentCase, cycleValueSnapshot);
            } else if (window.Slider && typeof window.Slider.restoreCycleRuntimeValues === 'function') {
                window.Slider.restoreCycleRuntimeValues(currentCase, cycleValueSnapshot);
            }
        }
        if (useAccumulate && window.trailBuffer) {
            image(window.trailBuffer, 0, 0, width, height);
        }
        endNeumorphismDepthFrame(neumorphismDepthLayer);
        neumorphismDepthLayer = null;
    } catch (error) {
        endNeumorphismDepthFrame(neumorphismDepthLayer);
        console.error('Error in updateAndDrawVectors:', error);
    }
}


function hexToRgb(hex) {
    if (typeof hex !== 'string') {
        return { r: 225, g: 225, b: 225 };
    }
    const normalized = hex.trim();
    const match = normalized.match(/^#?([0-9a-fA-F]{6})$/);
    if (!match) {
        return { r: 225, g: 225, b: 225 };
    }
    const intVal = parseInt(match[1], 16);
    return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255
    };
}


function adjustVectorCount(newCount, newTrailLength) {
    if (newCount > vectors.length) {
        while (vectors.length < newCount) {
            const lastVector = vectors[vectors.length - 1];
            const newX = lastVector ? lastVector.current.x : random(width);
            const newY = lastVector ? lastVector.current.y : random(height);
            vectors.push(createNewVector(newTrailLength, newX, newY));
        }
    } else if (newCount < vectors.length) {
        vectors.splice(newCount);
    }

    // Adjust trail length for all vectors
    vectors.forEach(v => {
        if (v.trail.length < newTrailLength) {
            while (v.trail.length < newTrailLength) {
                v.trail.push(v.current.copy());
            }
        } else if (v.trail.length > newTrailLength) {
            v.trail = v.trail.slice(0, newTrailLength);
        }
    });

    window.lastPointCount = newCount;
}

window.setup = function() {
    const viewportSize = getCanvasViewportSize();
    window.config.canvasSize = viewportSize.width;
    window.config.canvasWidth = viewportSize.width;
    window.config.canvasHeight = viewportSize.height;
    let canvas = createCanvas(viewportSize.width, viewportSize.height);
    canvas.parent('sketch-holder');
    syncCanvasHolderLayout();
    syncCanvasStageBackground();
    colorMode(RGB, 255, 255, 255, 255);
    frameRate(60);
    window.trailBuffer = createGraphics(viewportSize.width, viewportSize.height);


    window.cases = [
        window.case0, window.case1, window.case2, window.case3, window.case4,
        window.case5, window.case6, window.case7, window.case8, window.case9,
        window.case10, window.case11, window.case12, window.case13, window.case14,
        window.case15, window.case16, window.case17, window.case18, window.case19,
        window.case20, window.case21
    ].filter(Boolean);
    
    if (window.cases.length === 0) {
        console.error('No valid cases found');
        return;
    }

    loadSavedSettings();
    ensurePointSequenceSettings();
    window.config.renderMode = window.config.renderMode || {};
    let initialTrailMode = 'history';
    try {
        const storedRenderMode = localStorage.getItem('globalRenderMode');
        if (storedRenderMode) {
            const parsedMode = JSON.parse(storedRenderMode);
            initialTrailMode = normalizeTrailMode(parsedMode && parsedMode.trail);
        }
    } catch (error) {
        console.warn('Failed to read globalRenderMode:', error);
    }
    window.config.renderMode.trail = initialTrailMode;
    try {
        const storedCanvasBgColor = localStorage.getItem('globalCanvasBgColor');
        if (storedCanvasBgColor && /^#[0-9A-Fa-f]{6}$/.test(storedCanvasBgColor)) {
            window.config.canvasBgColor = storedCanvasBgColor;
            syncCanvasStageBackground();
        }
    } catch (error) {
        console.warn('Failed to read globalCanvasBgColor:', error);
    }

    window.currentCase = cases[0];
    state = 0;
    isTransitioning = false;
    morph = 0;
    
    if (window.Controller_SVGanime && typeof window.Controller_SVGanime.setEnabled === 'function') {
        window.Controller_SVGanime.setEnabled(false);
    }

    if (window.currentCase && window.currentCase.config) {
        initVectors(window.currentCase.config.count, window.currentCase.config.trailLength);
        if (typeof dispatchCaseLifecycleEvent === 'function') {
            dispatchCaseLifecycleEvent('caseDidStart', {
                currentCase: window.currentCase,
                nextCase: null,
                transitionId: 0,
                reason: 'initial-setup'
            });
        }
    } else {
        console.error('Current case or its config is undefined');
        return;
    }

    const UIUX_UI_SYNC_MIN_INTERVAL_MS = 160;
    let uiuxUiSyncDirty = true;
    let uiuxUiSyncLastFlushAt = 0;
    let uiuxUiSyncListenersInstalled = false;

    function markUiSyncDirty(reason) {
        uiuxUiSyncDirty = true;
        window.__uiuxUiDirtyReason = reason || window.__uiuxUiDirtyReason || '';
    }

    function shouldFlushUiSync() {
        if (!uiuxUiSyncDirty) return false;
        const now = Date.now();
        if (uiuxUiSyncLastFlushAt && (now - uiuxUiSyncLastFlushAt) < UIUX_UI_SYNC_MIN_INTERVAL_MS) return false;
        uiuxUiSyncDirty = false;
        uiuxUiSyncLastFlushAt = now;
        return true;
    }

    function isUiSyncTarget(target) {
        if (!target || typeof target.closest !== 'function') return false;
        return Boolean(target.closest('button, input, select, textarea, [role="button"]'));
    }

    function installUiSyncListeners() {
        if (uiuxUiSyncListenersInstalled) return;
        uiuxUiSyncListenersInstalled = true;

        const handle = (event) => {
            if (!event) {
                markUiSyncDirty('unknown');
                return;
            }
            if (event.type === 'caseChanged' || event.type === 'registeredSlotStateChanged' || event.type === 'DOMContentLoaded' || event.type === 'load') {
                markUiSyncDirty(event.type);
                return;
            }
            if (isUiSyncTarget(event.target)) {
                markUiSyncDirty(event.type);
            }
        };

        document.addEventListener('input', handle, true);
        document.addEventListener('change', handle, true);
        document.addEventListener('click', handle, true);
        document.addEventListener('caseChanged', handle);
        document.addEventListener('registeredSlotStateChanged', handle);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handle, { once: true });
        } else {
            markUiSyncDirty('boot-ready');
        }
        window.addEventListener('load', handle, { once: true });
    }

    window.__uiuxMarkUiDirty = markUiSyncDirty;
    window.__uiuxShouldFlushUi = shouldFlushUiSync;
    installUiSyncListeners();

    // 以下、既存の初期化コード
    if (window.UI && typeof window.UI.initializeUI === 'function') {
        window.UI.initializeUI();
    }

    if (window.Table) {
        window.Table.initializeCaseComparisonTable();
    }

    if (window.Slider && typeof window.Slider.createSliders === 'function') {
        window.Slider.createSliders();
    }
    
    if (window.Slider && typeof window.Slider.updateSliders === 'function') {
        window.Slider.updateSliders(window.currentCase);
    }


    if (!window.Color) {
        window.Color = {
            updateColorPreview: function(color) {
                uiuxPublicDebugLog('Color preview updated with:', color);
            },
            isUsingRandomColors: function() {
                return false;
            },
            getRandomColors: function() {
                return [];
            }
        };
    }

    if (window.Color && typeof window.Color.createColorGroup === 'function') {
        window.Color.createColorGroup();
        // 初期状態のカラープレビューを更新
        if (window.currentCase && window.currentCase.config) {
            window.Color.updateColorPreview(window.currentCase.config.color);
        }
    }
    
    
    

    if (window.Table) {
        window.Table.updateCaseComparisonTable();
    }
    
    if (window.TableNext && typeof window.TableNext.initialize === 'function') {
        window.TableNext.initialize();
    }
    
    if (window.UILoad && typeof window.UILoad.initializeUI === 'function') {
        window.UILoad.initializeUI();
    }
    
    if (window.RippleEffect && typeof window.RippleEffect.initialize === 'function') {
        window.RippleEffect.initialize();
    } else {
        console.warn('RippleEffect.initialize is not available');
    }
    // SVGアニメーションUIの初期化
    if (window.UI_SVGanime && typeof window.UI_SVGanime.initialize === 'function') {
        window.UI_SVGanime.initialize();
    }
};



window.draw = function() {
    try {
        if (!currentCase) {
            console.error('Current case is undefined');
            return;
        }

        updateAndDrawVectors();
        
        if (isTransitioning) {
            const morphSpeed = isPointSequenceTransitionActive()
                ? 1 / Math.max(1, Number(window.__pointSequenceTransition.totalFrames) || (POINT_SEQUENCE_DEFAULT_SECONDS * 60))
                : Math.max(0.0001, lerp(currentCase.config.morphSpeed, nextCase.config.morphSpeed, morph));
            morph += morphSpeed;

            if (morph >= 1) {
                const endedCase = currentCase;
                const startedCase = nextCase;
                const completedTransitionId = window.__caseTransitionSeq;
                dispatchCaseLifecycleEvent('caseDidEnd', {
                    currentCase: endedCase,
                    nextCase: startedCase,
                    transitionId: completedTransitionId,
                    reason: 'transition-complete-before-current-swap'
                });

                isTransitioning = false;
                state = getBaseCaseIndex(nextCase);
                currentCase = nextCase;
                morph = 0;

                // 減少遷移は全点を到着させ、到着地点ごとの代表点を残してから統合する。
                orderArrivedVectorsForMerge(Math.max(1, Number(currentCase.config.count) || 1));
                adjustVectorCount(currentCase.config.count, currentCase.config.trailLength);
                window.__pointSequenceTransition = null;

                dispatchCaseLifecycleEvent('caseDidStart', {
                    currentCase: currentCase,
                    nextCase: null,
                    transitionId: completedTransitionId,
                    reason: 'transition-complete-after-current-swap'
                });

                const event = new CustomEvent('caseChanged', { detail: { currentCase: currentCase, transitionId: completedTransitionId, phase: 'transition-complete' } });
                document.dispatchEvent(event);

                if (window.Slider && typeof window.Slider.updateSliders === 'function') {
                    window.Slider.updateSliders(currentCase);
                }

                if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                    window.Table.updateCaseComparisonTable();
                }
            }
        }

        if (window.TimeManager && typeof window.TimeManager.update === 'function') {
            window.TimeManager.update();
        }

        if (window.UI && typeof window.UI.update === 'function') {
            window.UI.update();
        }

        if (window.__uiuxShouldFlushUi && window.__uiuxShouldFlushUi()) {
            if (window.Slider && typeof window.Slider.updateSliders === 'function') {
                window.Slider.updateSliders(currentCase);
            }

            if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                window.Table.updateCaseComparisonTable();
            }
        }
        
        if (window.RippleEffect && typeof window.RippleEffect.updateRipples === 'function') {
            window.RippleEffect.updateRipples();
            vectors.forEach(v => {
                window.RippleEffect.applyRippleEffect(v.current);
            });
        }

        drawCase11DebugOverlay();
        
    } catch (error) {
        console.error('Error in draw function:', error);
    }
};


function loadAndSetImage() {
    const img = new Image();
    img.onload = function() {
        uiuxPublicDebugLog('Image loaded successfully');
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        window.Vector.setImageData(imageData);
        uiuxPublicDebugLog('Image data sent to Vector.js');
    }
    img.onerror = function(e) {
        console.error('Failed to load image:', e);
    }
    img.src = 'assets/star_image.png'; // 正しいパスに修正
    uiuxPublicDebugLog('Attempting to load image from:', img.src);
}

// 初期化時に呼び出す
loadAndSetImage();





function loadSavedSettings() {
    const savedSettings = localStorage.getItem('allCaseSettings');
    if (savedSettings) {
        const allSettings = JSON.parse(savedSettings);
        Object.keys(allSettings).forEach(caseKey => {
            const caseIndex = parseInt(caseKey.replace('case', ''));
            if (window.cases[caseIndex]) {
                // configとinitialConfigの両方を更新
                window.cases[caseIndex].config = { ...window.cases[caseIndex].config, ...allSettings[caseKey].config };
                window.cases[caseIndex].initialConfig = { ...window.cases[caseIndex].initialConfig, ...allSettings[caseKey].initialConfig };
                
                // グローバル変数のケースも更新
                window[`case${caseIndex}`] = {
                    ...window[`case${caseIndex}`],
                    config: { ...window[`case${caseIndex}`].config, ...allSettings[caseKey].config },
                    initialConfig: { ...window[`case${caseIndex}`].initialConfig, ...allSettings[caseKey].initialConfig }
                };
            }
        });
        
        uiuxPublicDebugLog('Saved settings loaded:', allSettings);
    }
}





function windowResized() {
    resizeCanvasToViewport();
}

function getCanvasViewportSize() {
    const stageRect = getCanvasStageRect();
    const fallbackWidth = window.innerWidth || document.documentElement.clientWidth || 800;
    const fallbackHeight = window.innerHeight || document.documentElement.clientHeight || 600;
    const nextWidth = Math.max(1, Math.round(stageRect && stageRect.width ? stageRect.width : fallbackWidth));
    const nextHeight = Math.max(1, Math.round(stageRect && stageRect.height ? stageRect.height : fallbackHeight));
    return { width: nextWidth, height: nextHeight };
}

function syncCanvasStageBackground() {
    const bgHex = (window.config && window.config.canvasBgColor) ? window.config.canvasBgColor : '#e1e1e1';
    document.documentElement.style.backgroundColor = bgHex;
    document.body.style.backgroundColor = bgHex;
    const stage = document.getElementById('canvas-stage');
    if (stage) {
        stage.style.backgroundColor = bgHex;
    }
    if (window.CanvasResizer && typeof window.CanvasResizer.syncBackgroundColorPalette === 'function') {
        window.CanvasResizer.syncBackgroundColorPalette();
    }
    if (window.syncNeumorphismBackgroundSurface && typeof window.syncNeumorphismBackgroundSurface === 'function') {
        window.syncNeumorphismBackgroundSurface();
    }
}

function resizeCanvasToViewport() {
    const viewportSize = getCanvasViewportSize();
    window.config = window.config || {};
    window.config.canvasSize = viewportSize.width;
    window.config.canvasWidth = viewportSize.width;
    window.config.canvasHeight = viewportSize.height;
    resizeCanvasCentered(viewportSize.width, viewportSize.height);
}

function resizeCanvasCentered(newWidth, newHeight) {
    const oldWidth = width;
    const oldHeight = height;
    
    resizeCanvas(newWidth, newHeight);
    syncCanvasHolderLayout();
    syncCanvasStageBackground();
    window.trailBuffer = createGraphics(newWidth, newHeight);
    window.trailBuffer.clear();
    
    const newCenterX = newWidth / 2;
    const newCenterY = newHeight / 2;
    
    const offsetX = newCenterX - oldWidth / 2;
    const offsetY = newCenterY - oldHeight / 2;
    
    push();
    translate(offsetX, offsetY);
    image(get(), 0, 0);
    pop();
    
    for (let v of vectors) {
        v.current.x += offsetX;
        v.current.y += offsetY;
        for (let t of v.trail) {
            t.x += offsetX;
            t.y += offsetY;
        }
    }
}

function drawCursor(layer) {
    if (!window.showCustomCursor) return;

    const cursorRadius = window.RippleEffect.getParameter('cursor-radius');
    const cursorStrength = window.RippleEffect.getParameter('cursor-strength');
    
    layer.push();
    layer.noFill();
    layer.stroke(255, 255, 255, 128);
    layer.strokeWeight(1);
    layer.ellipse(mouseX, mouseY, cursorRadius * 2);
    
    // 影響強度を視覚化
    let innerRadius = cursorRadius * (1 - cursorStrength);
    layer.stroke(255, 255, 255, 64);
    layer.ellipse(mouseX, mouseY, innerRadius * 2);
    layer.pop();
}

function mouseMoved() {
    if (window.RippleEffect && typeof window.RippleEffect.mouseMoved === 'function') {
        window.RippleEffect.mouseMoved(mouseX, mouseY);
    } else {
        console.warn('RippleEffect.mouseMoved is not available');
    }
}

window.adjustVectorCount = adjustVectorCount;
window.updateAndDrawVectors = updateAndDrawVectors;
window.prepareNextCase = prepareNextCase;

function getCanvasStageRect() {
    const stage = document.getElementById('canvas-stage');
    if (stage) {
        return stage.getBoundingClientRect();
    }
    const fallback = document.getElementById('content-wrapper');
    return fallback ? fallback.getBoundingClientRect() : null;
}

function syncCanvasHolderLayout() {
    const holder = document.getElementById('sketch-holder');
    const stageRect = getCanvasStageRect();
    if (!holder || !stageRect) return;

    const canvasWidth = Math.max(1, Math.round(window.width || stageRect.width || 0));
    const canvasHeight = Math.max(1, Math.round(window.height || stageRect.height || 0));
    const left = Math.round((stageRect.width - canvasWidth) / 2);
    const top = Math.round((stageRect.height - canvasHeight) / 2);

    holder.style.position = 'absolute';
    holder.style.width = `${canvasWidth}px`;
    holder.style.height = `${canvasHeight}px`;
    holder.style.left = `${left}px`;
    holder.style.top = `${top}px`;
}

window.getCanvasViewportSize = getCanvasViewportSize;
window.resizeCanvasToViewport = resizeCanvasToViewport;
window.syncCanvasHolderLayout = syncCanvasHolderLayout;
window.syncCanvasStageBackground = syncCanvasStageBackground;

document.addEventListener('DOMContentLoaded', function() {
    if (window.UI && typeof window.UI.loadSavedSettings === 'function') {
        window.UI.loadSavedSettings();
    }
    if (window.UIState && typeof window.UIState.logUIState === 'function') {
        window.UIState.logUIState();
    }
});




function loadAndSetImage(caseObj) {
    if (caseObj && caseObj.config && caseObj.config.image) {
        loadImage(caseObj.config.image, 
            img => {
                uiuxPublicDebugLog('Image loaded successfully:', img);
                caseObj.config.image = img;
                // 画像がロードされたら、テーブルを更新
                if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                    window.Table.updateCaseComparisonTable();
                }
            },
            error => {
                console.error('Failed to load image:', error);
            }
        );
    } else {
        console.warn('No image to load for the current case');
    }
}
