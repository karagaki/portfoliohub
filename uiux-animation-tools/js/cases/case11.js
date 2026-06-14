(function attachCase11(global) {
  'use strict';

  /*
   * case11.js revised direct renderer
   * 目的:
   * - 元の case11_p5js/sketch.js の U字点描アルゴリズムを、まず省略せずに再現する。
   * - 現行 p5jsアプリ2 の 2.点 パネル値は、直接描画用パラメータへ変換する。
   * - case11では「軌跡の幅」をU字の横幅として扱う。
   * - 現行本体の vector/trail 描画は case11 では補助扱いにし、実描画は case11.update() 内の offscreenBuffer へ行う。
   *
   * 今回の修正意図:
   * - 以前の getTargetX/getTargetY 方式では、現行本体のベクトル追従と trail 線描画により、
   *   元素材の「点を打ちながらU字を作る」構造が単純な波線へ変質した。
   * - そのため、この版では元素材と同じく「フレームごとに複数点を buffer に打つ」方式へ戻す。
   * - 右端到達後は group を completed にして新規描画を止め、全 group 完了後に fadeOut を挟んで左から再開する。
   * - 水泳の折り返しのような戻り線を出さないため、現行本体の vector は case11 表示中だけ描画非表示にする。
   * - case11 へ戻った時は途中状態を再開せず、入口で buffer/group を初期化して左から描き直す。
   * - resize時は他case同様に残像bufferだけ消し、描画進行は継続する。
   * - canvasサイズをsignatureに含めず、resizeで state を作り直さない。
   * - 残像表示(accumulate)では host trailBuffer の後に case11 buffer を再合成して薄化を抑える。
   */

  const TARGET_FRAME_RATE = 30;
  const TWO_PI_FALLBACK = Math.PI * 2;

  const SOURCE_CONFIG = {
    canvasWidth: 2560,
    canvasHeight: 1600,
    letterWidthRange: [18, 155],
    baseLetterHeightRange: [10, 215],
    pointSizeRange: [1, 400],
    animationSpeedRange: [29, 98], // 元コードに存在するが、実際の描画速度には未使用。
    pointsPerFrameRange: [10, 24],
    pointsPerPartRange: [60, 60],
    lineAdjustment: 12.8,
    groupCountRange: [1, 10],
    startDelay: 20,
    letterHeightAdjustmentFactor: 0.5,
    fadeAmount: 2,
    colors: [
      [5, 2, 51, 95.8],
      [5, 42, 1, 95.8],
      [22, 3, 2, 95.8],
      [22, 3, 2],
      [22, 3, 2],
      [22, 3, 2],
      [5, 2, 51, 95.8]
    ],
    maxLetterWidth: 650,
    transparentTrailFade: 0.06
  };

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(value, min, max) {
    const n = num(value, min);
    return Math.max(min, Math.min(max, n));
  }

  function lerpNumber(a, b, t) {
    return a + (b - a) * t;
  }

  function normalize(value, min, max) {
    if (max === min) return 0;
    return clamp((num(value, min) - min) / (max - min), 0, 1);
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    return lerpNumber(outMin, outMax, normalize(value, inMin, inMax));
  }

  function mapRangeExp(value, inMin, inMax, outMin, outMax, power) {
    const t = Math.pow(normalize(value, inMin, inMax), Number.isFinite(power) ? power : 1);
    const min = Math.max(0.0001, Number(outMin));
    const max = Math.max(min, Number(outMax));
    return min * Math.pow(max / min, t);
  }

  function cubicBezierPoint(a, b, c, d, t) {
    const u = 1 - t;
    return (u * u * u * a) + (3 * u * u * t * b) + (3 * u * t * t * c) + (t * t * t * d);
  }

  function makeSeededRandom(seed) {
    let s = (seed >>> 0) || 1;
    return function seededRandom() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length) % list.length];
  }

  function isUsableRgbColor(color) {
    return Array.isArray(color) && color.length >= 3 && (
      Number(color[0]) !== 0 || Number(color[1]) !== 0 || Number(color[2]) !== 0
    );
  }

  function resolveCase11PanelColor(config) {
    const src = config || {};
    if (isUsableRgbColor(src.color)) {
      return src.color.slice(0, 4);
    }
    return null;
  }

  function canvasWidth() {
    return Number.isFinite(global.width) && global.width > 0 ? global.width : SOURCE_CONFIG.canvasWidth;
  }

  function canvasHeight() {
    return Number.isFinite(global.height) && global.height > 0 ? global.height : SOURCE_CONFIG.canvasHeight;
  }

  function makeConfigSignature(config) {
    return [
      Math.round(clamp(config.count, 1, 50) * 1000),
      Math.round(clamp(config.size, 1, 400) * 1000),
      Math.round(clamp(config.radius, 0, 700) * 1000),
      Math.round(clamp(config.trailLength, 2, 300) * 1000),
      Math.round(clamp(config.morphSpeed, 0.0001, 0.2) * 1000000),
      Math.round(clamp(config.fadeSpeed, 0.0005, 0.1) * 1000000),
      Math.round(clamp(config.waveSpacing, 2, 300) * 1000)
      /*
       * resizeで描画進行をリセットしないため、canvasWidth/canvasHeight は signature に含めない。
       * 画面サイズ変更は ensureBuffer() だけで処理し、groups/currentX/currentPointIndex は維持する。
       */
    ].join('|');
  }


  function makeCase11ConfigSnapshot(config, fallbackCount) {
    const src = config || {};
    return {
      count: Math.round(clamp(Number.isFinite(Number(src.count)) ? Number(src.count) : fallbackCount || 1, 1, 10)),
      color: resolveCase11PanelColor(src),
      size: clamp(Number.isFinite(Number(src.size)) ? Number(src.size) : 36, 1, 400),
      radius: clamp(Number.isFinite(Number(src.radius)) ? Number(src.radius) : 80, 0, 700),
      trailLength: clamp(Number.isFinite(Number(src.trailLength)) ? Number(src.trailLength) : 120, 2, 300),
      morphSpeed: clamp(Number.isFinite(Number(src.morphSpeed)) ? Number(src.morphSpeed) : 0.02, 0.0001, 0.2),
      fadeSpeed: clamp(Number.isFinite(Number(src.fadeSpeed)) ? Number(src.fadeSpeed) : 0.004, 0.0005, 0.1),
      waveSpacing: clamp(Number.isFinite(Number(src.waveSpacing)) ? Number(src.waveSpacing) : 120, 2, 300)
    };
  }

  function cloneCase11ConfigSnapshot(config) {
    const src = config || {};
    return {
      count: src.count,
      color: Array.isArray(src.color) ? src.color.slice(0, 4) : src.color,
      size: src.size,
      radius: src.radius,
      trailLength: src.trailLength,
      morphSpeed: src.morphSpeed,
      fadeSpeed: src.fadeSpeed,
      waveSpacing: src.waveSpacing
    };
  }

  function lerpConfigValue(current, target, amount, epsilon) {
    const cur = Number(current);
    const tar = Number(target);
    if (!Number.isFinite(cur)) return tar;
    if (!Number.isFinite(tar)) return cur;
    if (Math.abs(tar - cur) <= epsilon) return tar;
    return cur + (tar - cur) * amount;
  }

  function applySmoothedParamsToGroups(state, oldParams, nextParams) {
    if (!state || !Array.isArray(state.groups) || !nextParams) return;
    const oldTotal = Math.max(1, Number(oldParams && oldParams.totalPoints) || 1);
    const nextTotal = Math.max(1, Number(nextParams.totalPoints) || oldTotal);
    for (const group of state.groups) {
      if (!group) continue;
      const currentTotal = Math.max(1, Number(group.totalPoints) || oldTotal);
      const currentIndex = Number.isFinite(Number(group.currentPointIndex)) ? Number(group.currentPointIndex) : 0;
      if (currentTotal !== nextTotal) {
        const ratio = clamp((currentIndex % currentTotal) / currentTotal, 0, 0.999999);
        group.currentPointIndex = Math.floor(ratio * nextTotal);
        group.totalPoints = nextTotal;
      }
    }
  }

  function updateSmoothedCase11Params(state) {
    if (!state || !state.owner || !state.owner.config) return;
    const target = makeCase11ConfigSnapshot(state.owner.config, state.params && state.params.uiCount);
    if (!state.targetConfig) state.targetConfig = cloneCase11ConfigSnapshot(target);
    state.targetConfig = cloneCase11ConfigSnapshot(target);

    if (!state.smoothedConfig) {
      state.smoothedConfig = cloneCase11ConfigSnapshot(target);
      state.params = convertPanelConfigToSourceLikeParams(state.smoothedConfig, state.rng || makeSeededRandom(Number(state.seed) || 1));
      return;
    }

    const current = cloneCase11ConfigSnapshot(state.smoothedConfig);
    const amount = 0.075;
    const next = cloneCase11ConfigSnapshot(current);
    next.color = Array.isArray(target.color) ? target.color.slice(0, 4) : target.color;

    /*
     * case11 parameter smoothing:
     * UIスライダー値をそのまま描画へ即時反映すると、墨幅・軌跡幅・全体サイズ・点サイズが
     * 1フレームで飛び、描画が汚くなる。ここでは見た目に効く値を数十フレームかけて追従させる。
     * count は離散的で破綻しやすいため、点数調整は別工程として現行group数を維持する。
     */
    next.count = current.count;
    next.size = lerpConfigValue(current.size, target.size, amount, 0.01);
    next.radius = lerpConfigValue(current.radius, target.radius, amount, 0.05);
    next.trailLength = lerpConfigValue(current.trailLength, target.trailLength, amount, 0.05);
    next.morphSpeed = lerpConfigValue(current.morphSpeed, target.morphSpeed, 0.045, 0.00002);
    next.fadeSpeed = lerpConfigValue(current.fadeSpeed, target.fadeSpeed, amount, 0.00002);
    next.waveSpacing = lerpConfigValue(current.waveSpacing, target.waveSpacing, amount, 0.05);

    state.smoothedConfig = next;
    const oldParams = state.params;
    const nextParams = convertPanelConfigToSourceLikeParams(next, state.rng || makeSeededRandom(Number(state.seed) || 1));
    applySmoothedParamsToGroups(state, oldParams, nextParams);
    state.params = nextParams;
  }

  /*
   * 2.点 パネル値を元素材相当へ変換する。
   * ここは他スレッドでも意味が追えるよう、省略せず残す。
   */
  function convertPanelConfigToSourceLikeParams(config, rng) {
    const uiCount = Math.round(clamp(config.count, 1, 10));
    const uiSize = clamp(config.size, 1, 400);
    const uiRadius = clamp(config.radius, 0, 700);
    const uiTrailLength = clamp(config.trailLength, 2, 300);
    const uiMorphSpeed = clamp(config.morphSpeed, 0.0001, 0.2);
    const uiFadeSpeed = clamp(config.fadeSpeed, 0.0005, 0.1);
    const uiWaveSpacing = clamp(Number.isFinite(Number(config.waveSpacing)) ? Number(config.waveSpacing) : 120, 2, 300);
    const ownerColor = Array.isArray(config.color) && config.color.length >= 3 ? config.color.slice(0, 4) : null;

    /*
     * count は case11 では「表示される波の行数」として扱う。
     * 以前は 1〜50 を 1〜9 へ圧縮換算していたため、20を指定しても実表示は4行程度に見えた。
     * 今回は case11 専用で 1〜10 をそのまま groupCount に対応させ、
     * スライダー表示・実描画・内部行数の意味を一致させる。
     */
    const groupCount = Math.round(clamp(uiCount, 1, 10));

    /*
     * morphSpeed は case11 では「1フレームに何点打つか」ではなく、
     * 「U字1個を何フレームで描くか」に変換する。
     *
     * 旧方式では pointsPerFrame 10〜24 の差が小さく、さらに trailLength でU字横幅を広げると
     * totalPoints も増えるため、軌跡の幅によって体感速度が変わって見えた。
     * 今回は以下の方針にする。
     * - 点の速度: U字1個の所要時間を直接決める
     * - 軌跡の幅: U字横幅だけを決める
     * - 横幅が変わっても、同じ速度値なら1個のU字にかかる時間を大きく変えない
     */
    const speedT = clamp((uiMorphSpeed - 0.0001) / (0.2 - 0.0001), 0, 1);

    /*
     * size は元素材の pointSize。
     * p5 の ellipse(x, y, w, h) にそのまま渡すため、この値は半径ではなく直径。
     */
    const pointSize = clamp(uiSize, SOURCE_CONFIG.pointSizeRange[0], SOURCE_CONFIG.pointSizeRange[1]);

    /*
     * case11専用の役割分担:
     * - radius      : U字の縦方向スケール / 行の存在感を担当する。
     * - waveSpacing : 追加行「波の間隔」。旧版で trailLength に割り当てていたU字の横幅 letterWidth を担当する。
     * - trailLength : 通常caseに近い意味へ戻し、case11では描画済み点の残り方 / 流線の長さへ反映する。
     *
     * 旧版では trailLength を U字横幅へ読み替えていたため、軌跡の幅を動かすと形そのものが変わっていた。
     * 今回はその役割を waveSpacing へ移し、trailLength は軌跡・残像の持続へ戻す。
     */
    /*
     * 横幅: waveSpacing をU字の右方向の振り幅として独立させる。
     * 旧換算は 18〜650px 付近に寄り、画面サイズに対して中庸な形が多くなった。
     * ここでは指数換算にして、極端に短い横幅〜画面幅を超える長い横幅まで出せるようにする。
     */
    const minLetterWidth = Math.max(4, pointSize * 0.08);
    const maxLetterWidth = clamp(canvasWidth() * 1.28, 360, Math.max(720, canvasWidth() * 1.28));
    const letterWidth = clamp(mapRangeExp(uiWaveSpacing, 2, 300, minLetterWidth, maxLetterWidth, 1.08), minLetterWidth, maxLetterWidth);

    /*
     * 縦幅/深さ: 全体サイズ(radius) をU字の縦方向の深さとして独立させる。
     * 最大値は「画面高さ / 点の数」。最小側はかなり浅い形まで出せるよう、
     * 旧比率より下げ、指数換算で浅い/深いの差を大きくする。
     */
    const scaleMaxByRows = Math.max(1, canvasHeight() / Math.max(1, groupCount));
    const scaleMinRatio = 0.012;
    const scaleMinByRows = Math.max(1, scaleMaxByRows * scaleMinRatio);
    const baseLetterHeight = clamp(mapRangeExp(uiRadius, 0, 700, scaleMinByRows, scaleMaxByRows, 1.12), scaleMinByRows, scaleMaxByRows);

    const pointsPerPart = SOURCE_CONFIG.pointsPerPartRange[0];
    /*
     * 速度が縦幅を変えると、横幅/縦幅の独立調整が崩れるため、
     * case11では letterHeight を全体サイズだけで決める。
     */
    const letterHeight = baseLetterHeight;
    const curveLength = estimateCurveLength(letterWidth);
    const totalPoints = calculateTotalPoints(letterHeight, curveLength, pointsPerPart);

    /*
     * 点の速度: 最小速度は「点の大きさ最小値」1個分を横幅(px/frame)として扱う。
     * 最大側は現在の点直径までを上限にし、点の直径を超えて飛ぶ描画になりにくくする。
     * 実際の内部値 pointsPerFrame は、U字経路上の点間隔から逆算する。
     */
    const pathLength = Math.max(1, letterHeight + curveLength);
    const pointSpacingPx = pathLength / Math.max(1, totalPoints);
    const minTravelPerFrame = SOURCE_CONFIG.pointSizeRange[0];
    const maxTravelPerFrame = Math.max(minTravelPerFrame, pointSize);
    const travelPerFrame = mapRange(Math.pow(speedT, 0.85), 0, 1, minTravelPerFrame, maxTravelPerFrame);
    const pointsPerFrame = clamp(travelPerFrame / Math.max(0.0001, pointSpacingPx), 0.05, 12);
    const targetFramesPerLetter = Math.max(1, totalPoints / Math.max(0.0001, pointsPerFrame));

    /*
     * fadeSpeed は現行本体の background alpha と競合しやすいため、case11 内部では
     * 元素材の destination-out fade に近い値へ再換算する。
     * trailLength は「軌跡の幅」として、値が大きいほど点描の残り方を長くする。
     * - trailLength 小: 早く消える
     * - trailLength 大: 長く残る
     */
    const baseBufferFade = clamp(mapRange(uiFadeSpeed, 0.0013, 0.0039, 0.035, 0.09), 0.025, 0.12);
    const trailPersistenceScale = clamp(mapRange(uiTrailLength, 2, 300, 1.45, 0.45), 0.35, 1.65);
    const bufferFade = clamp(baseBufferFade * trailPersistenceScale, 0.012, 0.16);
    const effectiveTrailPoints = Math.round(mapRange(uiTrailLength, 2, 300, 8, 180));
    const historyPointAlpha = Math.round(mapRange(uiTrailLength, 2, 300, 108, 154));
    const accumulatePointAlpha = Math.round(mapRange(uiTrailLength, 2, 300, 132, 210));
    const historyStrokeWeight = clamp(mapRange(uiTrailLength, 2, 300, 0.75, 2.8), 0.65, 3.2);

    /*
     * cycleFadeOutFrames は右端到達後の待機時間。
     * trailLength が大きいほど、残像が自然に抜ける余地を少し長く取る。
     */
    const cycleFadeOutFrames = Math.round(
      mapRange(uiFadeSpeed, 0.0013, 0.0039, 110, 45) + mapRange(uiTrailLength, 2, 300, 0, 80)
    );

    /*
     * 元コードでは group の開始は i * startDelay。
     * 現行画面では高密度すぎると重なりやすいため、基準は維持しつつ少し抑制する。
     */
    const startDelay = SOURCE_CONFIG.startDelay;

    /*
     * case11専用追加スライダー: 波の間隔
     * この値は旧版で「軌跡の幅」に割り当てていたU字横幅用の値。
     * 行間の見た目は、U字横幅と縦スケールから自然に決める。
     */
    /*
     * 行の広がりは横幅ではなく縦幅に連動させる。
     * 横幅を短くしても行間まで詰まりすぎず、縦幅を深くした時は余白を確保する。
     */
    const rowSpread = clamp(mapRange(uiRadius, 0, 700, 0.48, 1.95), 0.42, 2.05);

    return {
      uiCount,
      uiSize,
      uiRadius,
      uiTrailLength,
      uiMorphSpeed,
      uiFadeSpeed,
      waveSpacing: uiWaveSpacing,
      trailPersistenceScale,
      rowSpread,
      groupCount,
      pointsPerFrame,
      targetFramesPerLetter,
      pointsPerPart,
      pointSize,
      letterWidth,
      maxLetterWidth,
      baseLetterHeight,
      letterHeight,
      curveLength,
      totalPoints,
      bufferFade,
      effectiveTrailPoints,
      historyPointAlpha,
      accumulatePointAlpha,
      historyStrokeWeight,
      cycleFadeOutFrames,
      startDelay,
      ownerColor,
      seedPreview: randomInt(rng, 1000, 9999)
    };
  }

  function calculateLetterHeight(baseLetterHeight, pointsPerFrame) {
    const adjustment = (pointsPerFrame - SOURCE_CONFIG.pointsPerFrameRange[0]) /
      (SOURCE_CONFIG.pointsPerFrameRange[1] - SOURCE_CONFIG.pointsPerFrameRange[0]);
    return baseLetterHeight + adjustment * baseLetterHeight * SOURCE_CONFIG.letterHeightAdjustmentFactor;
  }

  function estimateCurveLength(letterWidth) {
    return letterWidth * 1.2;
  }

  function calculateTotalPoints(letterHeight, curveLength, pointsPerPart) {
    const lineLength = letterHeight;
    const totalLength = lineLength + curveLength;
    const linePoints = Math.ceil((lineLength / totalLength) * pointsPerPart * SOURCE_CONFIG.lineAdjustment);
    const curvePoints = Math.ceil((curveLength / totalLength) * pointsPerPart);
    return Math.max(2, linePoints + curvePoints);
  }

  function getCase11GroupColor(params) {
    const ownerColor = params && params.ownerColor;
    if (isUsableRgbColor(ownerColor)) {
      return ownerColor.slice(0, 4);
    }
    return null;
  }

  function createWaveGroup(params, index, rng) {
    const h = canvasHeight();
    const totalSpan = h * clamp(params.rowSpread || 1, 0.45, 2.0);
    const groupHeight = totalSpan / Math.max(1, params.groupCount);
    const topOffset = (h - totalSpan) / 2;
    const yJitter = (rng() - 0.5) * groupHeight * 0.08;
    const ownerColor = getCase11GroupColor(params);
    const color = ownerColor || pick(rng, SOURCE_CONFIG.colors) || [255, 255, 255, 90];

    return {
      index: index,
      currentX: -Math.max(SOURCE_CONFIG.maxLetterWidth, (params.letterWidth || SOURCE_CONFIG.maxLetterWidth) + (params.pointSize || 0) * 2),
      currentY: topOffset + index * groupHeight + yJitter,
      isInverted: false,
      currentPointIndex: 0,
      pointBudget: 0,
      totalPoints: params.totalPoints,
      delayFrames: index * params.startDelay,
      completedCycle: false,
      color: Array.isArray(color) ? color.slice() : [255, 255, 255, 90]
    };
  }

  function createGroups(params, rng) {
    const groups = [];
    for (let i = 0; i < params.groupCount; i++) {
      groups.push(createWaveGroup(params, i, rng));
    }
    return groups;
  }

  function ensureBuffer(state) {
    const w = canvasWidth();
    const h = canvasHeight();
    if (typeof global.createGraphics !== 'function') {
      return state.buffer;
    }

    if (!state.buffer) {
      state.buffer = global.createGraphics(w, h);
      state.buffer.clear();
      state.bufferWidth = w;
      state.bufferHeight = h;
      state.lastResizePreserved = false;
      return state.buffer;
    }

    if (state.buffer.width !== w || state.buffer.height !== h) {
      /*
       * resize継続仕様:
       * - 他caseと同じく、ウインドウサイズ変更時に残像/焼き込み済みbufferは消えてよい。
       * - ただし描画の進行状態 groups/currentX/currentPointIndex は維持する。
       * - 古いbufferをコピーしない。コピーすると旧サイズの描画位置が残り、見た目が変わったり二重化して見えるため。
       * - 新しい画面サイズのbufferだけ作り直し、以後の新規打点から継続する。
       */
      const nextBuffer = global.createGraphics(w, h);
      nextBuffer.clear();
      state.buffer = nextBuffer;
      state.bufferWidth = w;
      state.bufferHeight = h;
      state.lastResizeContinued = true;
    }

    return state.buffer;
  }

  function fadeTransparentBuffer(buffer, amount) {
    if (!buffer || !buffer.drawingContext) return;
    const ctx = buffer.drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, ' + clamp(amount, 0, 1) + ')';
    ctx.fillRect(0, 0, buffer.width, buffer.height);
    ctx.restore();
  }

  function getModeAdjustedBufferFade(params) {
    const baseFade = params && Number.isFinite(params.bufferFade) ? params.bufferFade : SOURCE_CONFIG.transparentTrailFade;
    return isAccumulateTrailMode()
      ? clamp(baseFade * 0.34, 0.004, 0.055)
      : clamp(baseFade * 1.45, 0.035, 0.22);
  }

  function getRenderModeName() {
    return isAccumulateTrailMode() ? 'accumulate' : 'history';
  }

  function getModePointAlpha(params) {
    if (!params) return 120;
    return isAccumulateTrailMode()
      ? clamp(params.accumulatePointAlpha, 80, 230)
      : clamp(params.historyPointAlpha, 70, 180);
  }

  function limitRecentPoints(state) {
    if (!state || !Array.isArray(state.recentPoints)) return;
    const params = state.params || {};
    const maxPoints = Math.max(4, Math.round(params.effectiveTrailPoints || 24));
    if (state.recentPoints.length > maxPoints) {
      state.recentPoints.splice(0, state.recentPoints.length - maxPoints);
    }
  }


  function getPointRadius(params) {
    return Math.max(0.5, num(params && params.pointSize, 1) / 2);
  }

  function getVectorIndexForGroup(group) {
    const vectors = global.vectors || [];
    if (!vectors.length) return -1;
    const index = Number.isFinite(group && group.index) ? group.index : 0;
    return ((Math.floor(index) % vectors.length) + vectors.length) % vectors.length;
  }

  function makePointBounds(point, params) {
    const radius = getPointRadius(params);
    const x = Number(point && point.x);
    const y = Number(point && point.y);
    return {
      x,
      y,
      radius,
      diameter: radius * 2,
      left: x - radius,
      right: x + radius,
      top: y - radius,
      bottom: y + radius,
      canvasWidth: canvasWidth(),
      canvasHeight: canvasHeight()
    };
  }

  function isBoundsFullyOutside(bounds) {
    if (!bounds || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) return false;
    return bounds.right < 0 || bounds.left > bounds.canvasWidth || bounds.bottom < 0 || bounds.top > bounds.canvasHeight;
  }

  function recordPointEvent(state, event) {
    if (!state || !event) return;
    if (!Array.isArray(state.pointEvents)) state.pointEvents = [];
    const nextEvent = Object.assign({
      frame: Number(global.frameCount || 0),
      time: Date.now()
    }, event);
    state.pointEvents.push(nextEvent);
    if (state.pointEvents.length > 240) {
      state.pointEvents.splice(0, state.pointEvents.length - 240);
    }
    if (nextEvent.type === 'exit') state.lastExitEvent = nextEvent;
    if (nextEvent.type === 'start-return') state.lastStartReturnEvent = nextEvent;
    if (nextEvent.type === 'pre-entry') state.lastPreEntryEvent = nextEvent;
    if (nextEvent.type === 'fold-back') state.lastFoldBackEvent = nextEvent;
  }

  function ensureTrailGuardDebugState() {
    if (!global.__trailGuardDebugState || typeof global.__trailGuardDebugState !== 'object') {
      global.__trailGuardDebugState = {
        active: !!global.__trailGuardDebug,
        detectedCount: 0,
        resetCount: 0,
        skippedVisibleResetCount: 0,
        lastAnomalies: [],
        lastReset: null
      };
    }
    const state = global.__trailGuardDebugState;
    state.active = !!global.__trailGuardDebug;
    if (!Number.isFinite(Number(state.detectedCount))) state.detectedCount = 0;
    if (!Number.isFinite(Number(state.resetCount))) state.resetCount = 0;
    if (!Number.isFinite(Number(state.skippedVisibleResetCount))) state.skippedVisibleResetCount = 0;
    if (!Array.isArray(state.lastAnomalies)) state.lastAnomalies = [];
    return state;
  }

  function getTrailGuardDistanceFromPoint(pointA, pointB) {
    const ax = Number(pointA && pointA.x);
    const ay = Number(pointA && pointA.y);
    const bx = Number(pointB && pointB.x);
    const by = Number(pointB && pointB.y);
    if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) return NaN;
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  function resetTrailGuardAtPoint(v, point) {
    if (!v || !point) return false;
    const x = Number(point.x);
    const y = Number(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const makePoint = typeof global.createVector === 'function'
      ? function makeVectorPoint() { return global.createVector(x, y); }
      : function makePlainPoint() { return { x, y }; };
    v.trail = [makePoint(), makePoint()];
    return true;
  }

  function setCase11VectorHidden(vectorIndex, hidden, reason) {
    const vectors = global.vectors || [];
    const v = vectors[vectorIndex];
    if (!v) return;
    v.isHidden = !!hidden;
    v.__case11AllowHostDraw = !hidden;
    v.__case11HiddenByCase11 = !!hidden;
    v.__case11HiddenReason = hidden ? String(reason || 'case11') : '';
  }

  function setCase11Phase(state, phase, reason) {
    if (!state) return;
    const nextPhase = phase || 'entryFade';
    if (state.phase === nextPhase) return;
    state.phase = nextPhase;
    recordPointEvent(state, {
      type: 'phase-change',
      phase: nextPhase,
      reason: reason || 'case11-phase-update'
    });
  }

  function hideAllCase11Vectors(state, reason) {
    const vectors = global.vectors || [];
    if (!state) return;
    state.hiddenVectorIndices = [];
    for (let i = 0; i < vectors.length; i++) {
      setCase11VectorHidden(i, true, reason || 'case11-hide-all');
      state.hiddenVectorIndices.push(i);
    }
  }

  function releaseAllCase11Vectors(state, reason) {
    const vectors = global.vectors || [];
    if (state) state.hiddenVectorIndices = [];
    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i];
      if (!v || !v.__case11HiddenByCase11) continue;
      v.isHidden = false;
      v.__case11AllowHostDraw = true;
      delete v.__case11HiddenByCase11;
      v.__case11HiddenReason = reason || '';
    }
  }

  function resetCase11VectorTrailAt(v, x, y) {
    if (!v) return;
    const resetX = Number(x);
    const resetY = Number(y);
    if (!Number.isFinite(resetX) || !Number.isFinite(resetY)) return;
    const makePoint = typeof global.createVector === 'function'
      ? function makeVectorPoint() { return global.createVector(resetX, resetY); }
      : function makePlainPoint() { return { x: resetX, y: resetY }; };
    v.trail = [makePoint(), makePoint()];
  }

  function moveCase11VectorOffscreenLeft(v, y) {
    if (!v || !v.current) return false;
    const safeY = Number.isFinite(Number(y)) ? Number(y) : Number(v.current.y);
    const offscreenX = -Math.max(canvasWidth() * 0.25, SOURCE_CONFIG.maxLetterWidth, 650);
    v.current.x = offscreenX;
    v.current.y = safeY;
    return true;
  }

  function collapseVectorTrailToCurrent(v, count) {
    if (!v || !v.current) return;
    const trailLength = Math.max(2, Math.round(num(count, 2)));
    const x = Number(v.current.x);
    const y = Number(v.current.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const makePoint = function makePoint() {
      return typeof global.createVector === 'function' ? global.createVector(x, y) : { x, y };
    };
    v.trail = [];
    for (let i = 0; i < trailLength; i++) {
      v.trail.push(makePoint());
    }
  }

  function clearSharedTrailBufferForCase11Entry() {
    if (global.trailBuffer && typeof global.trailBuffer.clear === 'function') {
      global.trailBuffer.clear();
    }
  }

  function startCase11EntryHold(state, reason) {
    if (!state) return;
    const vectors = global.vectors || [];
    const frame = Number(global.frameCount || 0);
    const holdFrames = 8;
    const until = frame + holdFrames;
    const trailLength = state.owner && state.owner.config ? state.owner.config.trailLength : 2;

    state.entryHoldUntilFrame = until;
    state.entryHoldFrames = holdFrames;
    state.entryHoldReason = reason || 'case11-entry-trail-cut-hold';
    state.entryHoldActive = true;
    setCase11Phase(state, 'entryFade', state.entryHoldReason);

    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i];
      if (!v || !v.current) continue;
      const x = Number(v.current.x);
      const y = Number(v.current.y);
      v.__case11HoldUntilFrame = until;
      v.__case11HoldStartedFrame = frame;
      v.__case11HoldX = x;
      v.__case11HoldY = y;
      v.__case11HoldReason = state.entryHoldReason;
      setCase11VectorHidden(i, true, state.entryHoldReason);
      collapseVectorTrailToCurrent(v, trailLength);
    }

    recordPointEvent(state, {
      type: 'entry-hold-start',
      reason: state.entryHoldReason,
      holdFrames,
      untilFrame: until
    });
  }

  function isCase11EntryHoldActive(state) {
    if (!state || !Number.isFinite(Number(state.entryHoldUntilFrame))) return false;
    return Number(global.frameCount || 0) <= Number(state.entryHoldUntilFrame);
  }

  function releaseExpiredCase11EntryHold(state) {
    if (!state || !state.entryHoldActive) return;
    const frame = Number(global.frameCount || 0);
    if (frame <= Number(state.entryHoldUntilFrame || 0)) return;
    const vectors = global.vectors || [];
    const trailLength = state.owner && state.owner.config ? state.owner.config.trailLength : 2;
    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i];
      if (!v) continue;
      if (Number(v.__case11HoldUntilFrame || 0) <= frame) {
        collapseVectorTrailToCurrent(v, trailLength);
        delete v.__case11HoldUntilFrame;
        delete v.__case11HoldStartedFrame;
        delete v.__case11HoldX;
        delete v.__case11HoldY;
        delete v.__case11HoldReason;
      }
    }
    state.entryHoldActive = false;
    recordPointEvent(state, {
      type: 'entry-hold-end',
      reason: state.entryHoldReason || 'case11-entry-trail-cut-hold',
      untilFrame: state.entryHoldUntilFrame
    });
  }

  function recordPreEntryVectors(state) {
    if (!state) return;
    const vectors = global.vectors || [];
    state.preEntryPoints = vectors.map(function mapVector(v, index) {
      const current = v && v.current ? v.current : { x: NaN, y: NaN };
      return {
        index,
        x: Number(current.x),
        y: Number(current.y),
        radius: getPointRadius(state.params || {}),
        diameter: getPointRadius(state.params || {}) * 2,
        frame: Number(global.frameCount || 0)
      };
    });
    recordPointEvent(state, {
      type: 'pre-entry',
      reason: 'other-case-to-case11-before-transition',
      points: state.preEntryPoints.slice(0, 80)
    });
    setCase11Phase(state, 'entryFade', 'pre-entry-to-case11');
    hideAllCase11Vectors(state, 'pre-entry-to-case11');
    startCase11EntryHold(state, 'pre-entry-to-case11-cut-trail-and-hold');
  }

  function recordFoldBackBeforeRestart(state, group, reason) {
    if (!state || !group) return;
    const vectorIndex = getVectorIndexForGroup(group);
    const point = (state.hostPoints && state.hostPoints[vectorIndex]) || { x: group.currentX, y: group.currentY };
    recordPointEvent(state, {
      type: 'fold-back',
      reason: reason || 'before-cycle-restart',
      vectorIndex,
      groupIndex: group.index,
      bounds: makePointBounds(point, state.params || {})
    });
    if (vectorIndex >= 0) setCase11VectorHidden(vectorIndex, true, reason || 'fold-back-before-restart');
    setCase11Phase(state, 'rightReturn', reason || 'fold-back-before-restart');
  }

  function recordAllCurrentVectorsBeforeParamRebuild(state, reason) {
    /*
     * case11 rebuild fix:
     * パラメータ変更で signature が変わると、旧実装は state を作り直して
     * 右へ進んでいた点が左の開始地点へ見える形で戻っていた。
     * ここでは再構築の直前に、各vectorの現在座標/半径込みboundsを記録し、
     * その点を非表示化してから新しいパラメータで開始する。
     * 新しい点が start-return に到達した時点で、各vectorは再表示される。
     */
    if (!state) return;
    const vectors = global.vectors || [];
    const params = state.params || {};
    const points = [];
    for (let i = 0; i < vectors.length; i++) {
      const hostPoint = state.hostPoints && state.hostPoints[i];
      const current = vectors[i] && vectors[i].current ? vectors[i].current : null;
      const point = hostPoint || current;
      if (!point || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) continue;
      const bounds = makePointBounds(point, params);
      points.push({
        index: i,
        x: bounds.x,
        y: bounds.y,
        radius: bounds.radius,
        diameter: bounds.diameter,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        canvasWidth: bounds.canvasWidth,
        canvasHeight: bounds.canvasHeight
      });
      setCase11VectorHidden(i, true, reason || 'param-change-before-rebuild');
    }
    state.hiddenVectorIndices = points.map(function mapHiddenIndex(point) { return point.index; });
    recordPointEvent(state, {
      type: 'fold-back',
      reason: reason || 'param-change-before-rebuild',
      points: points.slice(0, 120)
    });
  }

  function applyConfigChangeWithoutRestart(state, nextSignature) {
    /*
     * パラメータ変更時は描画を中断・リスタートしない。
     * ここでは raw target だけ更新し、実描画へ使う state.params は updateSmoothedCase11Params()
     * が数十フレームかけて追従させる。
     */
    if (!state) return;
    const oldParams = state.params || {};
    const targetConfig = makeCase11ConfigSnapshot(state.owner && state.owner.config, oldParams.uiCount || 1);
    const targetParams = convertPanelConfigToSourceLikeParams(targetConfig, state.rng || makeSeededRandom(Number(state.seed) || 1));

    recordPointEvent(state, {
      type: 'config-smooth-target',
      reason: 'config-signature-changed-smoothed-without-restart',
      beforePointSize: Number(oldParams.pointSize || 0),
      targetPointSize: Number(targetParams.pointSize || 0),
      beforeLetterWidth: Number(oldParams.letterWidth || 0),
      targetLetterWidth: Number(targetParams.letterWidth || 0),
      beforeTrailLength: Number(oldParams.uiTrailLength || 0),
      targetTrailLength: Number(targetParams.uiTrailLength || 0),
      beforePointsPerFrame: Number(oldParams.pointsPerFrame || 0),
      targetPointsPerFrame: Number(targetParams.pointsPerFrame || 0)
    });

    state.signature = nextSignature;
    state.targetConfig = cloneCase11ConfigSnapshot(targetConfig);
    if (!state.smoothedConfig) {
      state.smoothedConfig = makeCase11ConfigSnapshot(state.owner && state.owner.config, oldParams.uiCount || 1);
    }
    state.forceRestartOnNextUpdate = false;
    state.debug = buildDebug(state);
  }

  function syncCase11HostVectorPoint(state, point, group, params) {
    if (!state || !point) return;
    if (global.isTransitioning) return;
    const vectors = global.vectors || [];
    if (!vectors.length) return;
    const vectorIndex = getVectorIndexForGroup(group);
    const v = vectors[vectorIndex];
    if (!v || !v.current) return;

    const x = Number(point.x);
    const y = Number(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    if (isCase11EntryHoldActive(state)) {
      setCase11VectorHidden(vectorIndex, true, 'entry-hold-active');
      return;
    }

    const pointColor = isUsableRgbColor(group && group.color)
      ? group.color.slice()
      : (resolveCase11PanelColor(state.owner && state.owner.config) || [255, 255, 255, 180]);
    const alpha = Math.max(48, Math.min(230, getModePointAlpha(params || state.params || {}) - SOURCE_CONFIG.fadeAmount * 4));
    pointColor[3] = alpha;

    v.current.x = x;
    v.current.y = y;
    v.__case11Synced = true;
    v.__case11Color = pointColor.slice();

    const nextPoint = (typeof global.createVector === 'function') ? global.createVector(x, y) : { x, y };
    if (!Array.isArray(v.trail)) v.trail = [];
    const trailThreshold = Math.max(220, Math.min(canvasWidth(), canvasHeight()) * 0.22);
    const innerThreshold = Math.max(160, Math.min(canvasWidth(), canvasHeight()) * 0.16);
    const oldTrailHead = v.trail[0] || null;
    const oldTrailTail = v.trail.length ? v.trail[v.trail.length - 1] : null;
    const distanceToHead = getTrailGuardDistanceFromPoint(nextPoint, oldTrailHead);
    const distanceToTail = getTrailGuardDistanceFromPoint(nextPoint, oldTrailTail);
    const headToTailDistance = getTrailGuardDistanceFromPoint(oldTrailHead, oldTrailTail);
    const isStartPoint = group && group.currentPointIndex === 0;
    const visibleNow = v.__case11AllowHostDraw === true && v.isHidden !== true;
    let maxAdjacentDistance = NaN;
    if (v.trail.length >= 2) {
      for (let i = 0; i < v.trail.length - 1; i++) {
        const a = v.trail[i];
        const b = v.trail[i + 1];
        const nextDistance = getTrailGuardDistanceFromPoint(a, b);
        if (Number.isFinite(nextDistance)) {
          maxAdjacentDistance = Number.isFinite(maxAdjacentDistance)
            ? Math.max(maxAdjacentDistance, nextDistance)
            : nextDistance;
        }
      }
    }
    const suspiciousDistance = Math.max(distanceToHead, distanceToTail, headToTailDistance, maxAdjacentDistance);
    const debugState = ensureTrailGuardDebugState();
    const shouldCutTrail = v.trail.length >= 2 && (
      (Number.isFinite(distanceToHead) && distanceToHead >= trailThreshold) ||
      (Number.isFinite(distanceToTail) && distanceToTail >= trailThreshold) ||
      (Number.isFinite(headToTailDistance) && headToTailDistance >= trailThreshold) ||
      (Number.isFinite(maxAdjacentDistance) && maxAdjacentDistance >= innerThreshold)
    );
    if (shouldCutTrail) {
      const phase = state && state.phase ? String(state.phase) : '';
      let reason = 'trail-internal-jump';
      if (Number.isFinite(distanceToHead) && distanceToHead >= trailThreshold) {
        reason = 'nextPoint-to-trail-head';
      } else if (Number.isFinite(distanceToTail) && distanceToTail >= trailThreshold) {
        reason = 'nextPoint-to-trail-tail';
      } else if (Number.isFinite(headToTailDistance) && headToTailDistance >= trailThreshold) {
        reason = 'trail-head-to-tail';
      }
      const emergencyThreshold = trailThreshold * 2.5;
      const isEmergencyVisible = visibleNow && Number.isFinite(suspiciousDistance) && suspiciousDistance >= emergencyThreshold;
      const debugInfo = {
        frameCount: Number(global.frameCount || 0),
        index: vectorIndex,
        phase,
        reason: visibleNow
          ? (isEmergencyVisible ? 'emergency-visible-reset' : reason)
          : (v.isHidden === true ? 'hidden-reset' : (isStartPoint ? 'start-visible-reset' : 'preflight-reset')),
        distance: suspiciousDistance,
        threshold: trailThreshold,
        innerThreshold,
        emergencyThreshold,
        nextPoint: { x, y },
        oldTrailHead: oldTrailHead ? { x: Number(oldTrailHead.x), y: Number(oldTrailHead.y) } : null,
        oldTrailTail: oldTrailTail ? { x: Number(oldTrailTail.x), y: Number(oldTrailTail.y) } : null
      };
      debugState.detectedCount += 1;
      debugState.lastAnomalies.push(debugInfo);
      if (debugState.lastAnomalies.length > 20) {
        debugState.lastAnomalies.splice(0, debugState.lastAnomalies.length - 20);
      }
      if (!visibleNow || v.isHidden === true || !v.__case11AllowHostDraw) {
        resetCase11VectorTrailAt(v, nextPoint.x, nextPoint.y);
        debugState.resetCount += 1;
        debugState.lastReset = Object.assign({}, debugInfo, { reason: debugInfo.reason });
      } else if (isEmergencyVisible) {
        debugState.skippedVisibleResetCount += 1;
        debugInfo.reason = 'skipped-visible-reset';
        v.isHidden = true;
        v.__case11AllowHostDraw = false;
        resetCase11VectorTrailAt(v, nextPoint.x, nextPoint.y);
        debugState.resetCount += 1;
        debugState.lastReset = Object.assign({}, debugInfo, { reason: debugInfo.reason });
      } else {
        debugState.skippedVisibleResetCount += 1;
        debugInfo.reason = 'skipped-visible-reset';
        resetCase11VectorTrailAt(v, nextPoint.x, nextPoint.y);
        debugState.resetCount += 1;
        debugState.lastReset = Object.assign({}, debugInfo, { reason: debugInfo.reason });
      }
      if (global.__trailGuardDebug) {
        console.warn('[trailGuard]', debugInfo);
      }
      v.__trailGuardPrevDistance = suspiciousDistance;
    }
    v.trail.unshift(nextPoint);
    const trailLength = Math.max(2, Math.round(num(state.owner && state.owner.config && state.owner.config.trailLength, 24)));
    if (v.trail.length > trailLength) v.trail.length = trailLength;

    if (!Array.isArray(v.__case11TrailColors)) v.__case11TrailColors = [];
    v.__case11TrailColors.unshift(pointColor.slice());
    if (v.__case11TrailColors.length > trailLength) v.__case11TrailColors.length = trailLength;

    if (!Array.isArray(state.hostPoints)) state.hostPoints = [];
    const bounds = makePointBounds(point, params || state.params || {});
    state.hostPoints[vectorIndex] = {
      x,
      y,
      color: pointColor.slice(),
      bounds,
      frame: Number(global.frameCount || 0)
    };

    if (isStartPoint) {
      setCase11Phase(state, 'leftIn', 'start-return-visible');
      v.__case11AllowHostDraw = true;
      v.isHidden = false;
      recordPointEvent(state, {
        type: 'start-return',
        reason: 'point-arrived-at-wave-start',
        vectorIndex,
        groupIndex: group.index,
        bounds,
        color: pointColor.slice()
      });
      setCase11VectorHidden(vectorIndex, false, 'start-return-visible');
    } else if (state.phase !== 'rightReturn') {
      setCase11Phase(state, 'active', 'host-point-visible');
    }

    const outside = isBoundsFullyOutside(bounds);
    const wasOutside = state.outsideByVectorIndex && state.outsideByVectorIndex[vectorIndex];
    if (!state.outsideByVectorIndex) state.outsideByVectorIndex = [];
    if (outside && !wasOutside) {
      state.outsideByVectorIndex[vectorIndex] = true;
      recordPointEvent(state, {
        type: 'exit',
        reason: 'point-bounds-fully-outside-canvas',
        vectorIndex,
        groupIndex: group && group.index,
        bounds,
        color: pointColor.slice()
      });
      setCase11VectorHidden(vectorIndex, true, 'point-exit-canvas');
      setCase11Phase(state, 'rightReturn', 'point-exit-canvas');
    } else if (!outside) {
      state.outsideByVectorIndex[vectorIndex] = false;
    }
  }

  function addRecentPoint(state, point, group, params) {
    if (!state || !point || !params) return;
    if (!Array.isArray(state.recentPoints)) {
      state.recentPoints = [];
    }
    state.recentPoints.push({
      x: point.x,
      y: point.y,
      size: params.pointSize,
      color: Array.isArray(group.color) ? group.color.slice() : [255, 255, 255, 120],
      frame: Number(global.frameCount || 0)
    });
    limitRecentPoints(state);
    syncCase11HostVectorPoint(state, point, group, params);
  }

  function drawRecentPointTrail(state) {
    // ChatGPT fix: the previous shared recentPoints trail connected different wave rows and produced unnatural thick curves.
    // The offscreen buffer already contains the intended dotted U-shaped trail, so do not draw an additional canvas-level polyline.
    return;
    if (isAccumulateTrailMode()) return;
    if (!state || !Array.isArray(state.recentPoints) || state.recentPoints.length < 2) return;
    if (typeof global.push !== 'function' || typeof global.pop !== 'function') return;

    const params = state.params || {};
    const points = state.recentPoints;
    const maxAge = Math.max(2, points.length - 1);

    global.push();
    if (typeof global.noFill === 'function') global.noFill();
    if (typeof global.strokeCap === 'function' && typeof global.ROUND !== 'undefined') {
      global.strokeCap(global.ROUND);
    }

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const point = points[i];
      const t = i / maxAge;
      const color = Array.isArray(point.color) ? point.color : [0, 0, 0, 120];
      const alpha = clamp(16 + t * 118, 10, 138);
      if (typeof global.stroke === 'function') {
        global.stroke(color[0] || 0, color[1] || 0, color[2] || 0, alpha);
      }
      if (typeof global.strokeWeight === 'function') {
        global.strokeWeight(clamp((params.historyStrokeWeight || 1.2) * (0.35 + t * 0.9), 0.45, 4));
      }
      if (typeof global.line === 'function') {
        global.line(prev.x, prev.y, point.x, point.y);
      }
    }
    global.pop();
  }


  function applyCursorInfluenceToPoint(x, y, params) {
    /*
     * 3.カーソル パネル反映（case11専用強調版）:
     * - 本体の RippleEffect / 3.カーソル設定値は変更しない。
     * - case11 内で新しく打つ点だけ、受け取った変位を増幅してから buffer に焼き込む。
     * - global.vectors / current / trail / 他caseの挙動には触れない。
     * - 既に buffer へ描かれた過去の点は変形しない。
     * - 強調量は case11 内部だけで完結するため、他caseのカーソル影響は変わらない。
     */
    if (!global.RippleEffect || typeof global.RippleEffect.applyRippleEffect !== 'function') {
      return { x, y };
    }
    if (typeof global.createVector !== 'function') {
      return { x, y };
    }

    const source = global.createVector(x, y);
    const v = global.createVector(x, y);

    try {
      global.RippleEffect.applyRippleEffect(v);
    } catch (error) {
      return { x, y };
    }

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) {
      return { x, y };
    }

    let dx = v.x - source.x;
    let dy = v.y - source.y;

    /*
     * RippleEffect 側の変位は通常case向けに控えめなので、case11の点描では見えづらい。
     * ここでのみ 4.2 倍に増幅する。最大変位はU字横幅/縦高さから制限し、破綻を避ける。
     */
    const multiplier = 4.2;
    const maxDisplacement = Math.max(24, Math.min(220, Math.max(params.letterWidth, params.letterHeight) * 0.72));

    /*
     * RippleEffectの変位がほぼ0でも、カーソル直下では目視できる反応を追加する。
     * これはcase11専用の補助変位で、本体のRippleEffect設定値は書き換えない。
     */
    if (Math.abs(dx) + Math.abs(dy) < 0.01 &&
        Number.isFinite(global.mouseX) && Number.isFinite(global.mouseY) &&
        typeof global.RippleEffect.getParameter === 'function') {
      const radius = Number(global.RippleEffect.getParameter('cursor-radius')) || 0;
      const strength = Number(global.RippleEffect.getParameter('cursor-strength')) || 0;
      const mx = Number(global.mouseX);
      const my = Number(global.mouseY);
      const vx = x - mx;
      const vy = y - my;
      const distSq = vx * vx + vy * vy;
      if (radius > 0 && distSq > 0.0001 && distSq < radius * radius) {
        const distValue = Math.sqrt(distSq);
        const falloff = Math.pow(1 - distValue / radius, 1.35);
        const extra = falloff * strength * Math.min(radius * 0.22, maxDisplacement * 0.9);
        dx += (vx / distValue) * extra;
        dy += (vy / distValue) * extra;
      }
    }

    dx *= multiplier;
    dy *= multiplier;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > maxDisplacement) {
      const scale = maxDisplacement / length;
      dx *= scale;
      dy *= scale;
    }

    const nextX = x + dx;
    const nextY = y + dy;
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
      return { x, y };
    }
    return { x: nextX, y: nextY };
  }

  function drawNextPoint(buffer, group, params, state) {
    const progress = group.currentPointIndex / Math.max(1, group.totalPoints);
    const startX = group.currentX;
    const groupHeight = (canvasHeight() * clamp(params.rowSpread || 1, 0.45, 2.0)) / Math.max(1, params.groupCount);
    const startY = group.currentY + (groupHeight - params.letterHeight) / 2;
    const endX = startX + params.letterWidth;
    const endY = startY + params.letterHeight;

    const lineLength = params.letterHeight;
    const curveLength = estimateCurveLength(params.letterWidth);
    const totalLength = lineLength + curveLength;
    const lineProportion = lineLength / totalLength;

    let x;
    let y;

    if (progress <= lineProportion) {
      const lineProgress = progress / lineProportion;
      y = group.isInverted ? lerpNumber(endY, startY, lineProgress) : lerpNumber(startY, endY, lineProgress);
      x = startX;
    } else {
      const curveProgress = (progress - lineProportion) / (1 - lineProportion);
      x = cubicBezierPoint(startX, startX, endX, endX, curveProgress);
      if (group.isInverted) {
        y = cubicBezierPoint(
          startY,
          startY - params.letterWidth / 1.4,
          startY - params.letterWidth / 1.4,
          startY,
          curveProgress
        );
      } else {
        y = cubicBezierPoint(
          endY,
          endY + params.letterWidth / 1.4,
          endY + params.letterWidth / 1.4,
          endY,
          curveProgress
        );
      }
    }

    const influencedPoint = applyCursorInfluenceToPoint(x, y, params);

    buffer.noStroke();
    const pointColor = Array.isArray(group.color) ? group.color.slice() : [255, 255, 255, 90];
    pointColor[3] = Math.max(48, Math.min(230, getModePointAlpha(params) - SOURCE_CONFIG.fadeAmount * 4));
    buffer.fill(pointColor);
    buffer.ellipse(influencedPoint.x, influencedPoint.y, params.pointSize, params.pointSize);
    addRecentPoint(state, influencedPoint, group, params);
  }

  function updateAndDrawGroups(state) {
    updateSmoothedCase11Params(state);
    const params = state.params;
    const buffer = ensureBuffer(state);
    if (!buffer) return false;

    if (state.waitingForRestart) {
      setCase11Phase(state, 'rightReturn', 'waiting-for-restart');
    } else if (state.entryHoldActive) {
      setCase11Phase(state, 'entryFade', 'entry-hold-active');
    } else if (!state.phase || state.phase === 'entryFade') {
      setCase11Phase(state, 'leftIn', 'case11-starting');
    }

    fadeTransparentBuffer(buffer, getModeAdjustedBufferFade(params));

    if (state.waitingForRestart) {
      state.restartCountdown--;
      if (state.restartCountdown <= 0) {
        rebuildStateForNewCycle(state, false);
      }
      return false;
    }

    let allGroupsCompleted = true;
    const rightLimit = canvasWidth() + Math.max(SOURCE_CONFIG.maxLetterWidth, (params.letterWidth || SOURCE_CONFIG.maxLetterWidth) + (params.pointSize || 0) * 2);

    for (const group of state.groups) {
      if (group.delayFrames > 0) {
        group.delayFrames--;
        allGroupsCompleted = false;
        continue;
      }

      if (!group.completedCycle) {
        allGroupsCompleted = false;

        group.pointBudget = (Number.isFinite(group.pointBudget) ? group.pointBudget : 0) + params.pointsPerFrame;
        const drawSteps = Math.max(0, Math.floor(group.pointBudget));
        group.pointBudget -= drawSteps;

        for (let i = 0; i < drawSteps; i++) {
          drawNextPoint(buffer, group, params, state);
          group.currentPointIndex = (group.currentPointIndex + 1) % group.totalPoints;

          if (group.currentPointIndex === 0) {
            const oldCurrentX = group.currentX;
            group.currentX += params.letterWidth;
            group.isInverted = !group.isInverted;

            if (group.currentX >= rightLimit) {
              recordFoldBackBeforeRestart(state, group, 'right-limit-before-cycle-restart');
              group.completedCycle = true;
              group.pointBudget = 0;
              break;
            }
          }
        }
      }
    }

    if (allGroupsCompleted) {
      state.waitingForRestart = true;
      state.restartCountdown = params.cycleFadeOutFrames;
      state.cycleCount++;
      setCase11Phase(state, 'rightReturn', 'all-groups-completed-waiting-restart');
      hideAllCase11Vectors(state, 'all-groups-completed-waiting-restart');
    }

    return allGroupsCompleted;
  }

  function drawBufferToCanvas(state) {
    /*
     * case11 rebuild direction:
     * 旧case11の offscreen buffer は「別映像」として本体 vectors から分離していたため、
     * case0〜10 と同じ case間引き継ぎにならなかった。
     * ここでは buffer を主描画に使わず、drawNextPoint() が同期した vectors を main.js 側で描く。
     * buffer は必要になった場合の内部検証用に残すが、画面へは合成しない。
     */
    return;
  }

  function isAccumulateTrailMode() {
    return !!(global.config && global.config.renderMode && global.config.renderMode.trail === 'accumulate');
  }

  function getGraphicsCanvas(graphics) {
    if (!graphics) return null;
    if (graphics.canvas && typeof graphics.canvas.getContext === 'function') return graphics.canvas;
    if (graphics.elt && typeof graphics.elt.getContext === 'function') return graphics.elt;
    return null;
  }

  function schedulePostTrailOverlay(state) {
    /*
     * main.js の描画順では、残像表示(accumulate)時に case11.update() の後で
     * window.trailBuffer が canvas 上へ重ね描きされる。
     * case11 は独自 offscreenBuffer 描画なので、その重ね描きで薄く見える。
     * ここでは case11 だけ、ホスト側の1フレーム描画が終わった直後に buffer を再合成する。
     * global.vectors / trailBuffer / renderMode は変更しないので、他caseの挙動は変えない。
     */
    if (!isAccumulateTrailMode()) return;
    if (state.postOverlayScheduled) return;
    state.postOverlayScheduled = true;

    const run = function runCase11PostTrailOverlay() {
      state.postOverlayScheduled = false;
      if (global.currentCase !== state.owner) return;
      const sourceCanvas = getGraphicsCanvas(state.buffer);
      const targetCanvas = (typeof document !== 'undefined') ? document.querySelector('canvas') : null;
      if (!sourceCanvas || !targetCanvas || typeof targetCanvas.getContext !== 'function') return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(sourceCanvas, 0, 0);
      ctx.restore();
    };

    if (typeof global.setTimeout === 'function') {
      global.setTimeout(run, 0);
    } else if (typeof global.requestAnimationFrame === 'function') {
      global.requestAnimationFrame(run);
    }
  }

  function releaseCase11HiddenHostVectors() {
    const vectors = global.vectors || [];
    for (const v of vectors) {
      if (!v || !v.__case11HiddenByCase11) continue;
      v.isHidden = false;
      v.__case11AllowHostDraw = true;
      delete v.__case11HiddenByCase11;
    }
  }

  function hideHostVectorsForThisFrame() {
    /*
     * case11 表示中の非表示/表示は、pre-entry / start-return / exit / fold-back の
     * 各イベントで制御する。ここで毎フレーム解除すると、要求された非表示制御が崩れる。
     */
  }

  function getHostSyncedPoint(caseObj, i) {
    const state = caseObj && caseObj._case11State;
    if (global.isTransitioning) return null;
    if (!state || !Array.isArray(state.hostPoints) || !state.hostPoints.length) return null;
    const index = ((Math.floor(num(i, 0)) % state.hostPoints.length) + state.hostPoints.length) % state.hostPoints.length;
    const point = state.hostPoints[index];
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
    return point;
  }

  function getHostGuideX() {
    /*
     * getTargetX/Y は transition 中にも本体から呼ばれる。
     * ここで -100000 のような極端な値を返すと、他caseへ移った直後の current/trail が壊れる。
     * 画面の少し左外を案内点にして、非表示/遷移中でも計算を破壊しない。
     */
    return -Math.max(80, canvasWidth() * 0.06);
  }

  function getHostGuideY(i, count) {
    const h = canvasHeight();
    const total = Math.max(1, Math.floor(num(count, 1)));
    const index = ((Math.floor(num(i, 0)) % total) + total) % total;
    const t = total <= 1 ? 0.5 : index / (total - 1);
    return lerpNumber(h * 0.12, h * 0.88, t);
  }

  function rebuildStateForNewCycle(state, clearBuffer, options) {
    if (state && state.params) {
      recordPointEvent(state, {
        type: 'fold-back',
        reason: clearBuffer ? 'config-or-entry-rebuild-before-restart' : 'cycle-restart-countdown-complete',
        hiddenVectorIndices: Array.isArray(state.hiddenVectorIndices) ? state.hiddenVectorIndices.slice() : []
      });
    }
    const preserveHidden = !!(options && options.preserveHidden);
    const seed = Math.floor((Date.now() % 2147483647) + (global.frameCount || 0) * 1009 + state.signature.length * 9176 + state.cycleCount * 2713);
    const rng = makeSeededRandom(seed);
    const rawConfig = makeCase11ConfigSnapshot(state.owner.config, state.params && state.params.uiCount);
    const params = convertPanelConfigToSourceLikeParams(rawConfig, rng);
    state.seed = seed;
    state.rng = rng;
    state.targetConfig = cloneCase11ConfigSnapshot(rawConfig);
    state.smoothedConfig = cloneCase11ConfigSnapshot(rawConfig);
    state.params = params;
    state.groups = createGroups(params, rng);
    state.recentPoints = [];
    state.hostPoints = [];
    state.outsideByVectorIndex = [];
    if (!preserveHidden) state.hiddenVectorIndices = [];
    state.waitingForRestart = false;
    state.restartCountdown = 0;
    state.phase = 'entryFade';
    state.debug = buildDebug(state);
    if (clearBuffer && state.buffer) {
      state.buffer.clear();
    }
  }

  function buildDebug(state) {
    const p = state.params;
    const overlay = buildCase11OverlayDebug(state);
    return {
      seed: state.seed,
      cycleCount: state.cycleCount,
      groupCount: p.groupCount,
      pointsPerFrame: Number(p.pointsPerFrame.toFixed(3)),
      targetFramesPerLetter: Number(p.targetFramesPerLetter.toFixed(2)),
      pointSize: Number(p.pointSize.toFixed(2)),
      waveSpacing: Number(p.waveSpacing.toFixed(2)),
      trailLength: Number(p.uiTrailLength.toFixed(2)),
      letterWidth: Number(p.letterWidth.toFixed(2)),
      maxLetterWidth: Number(p.maxLetterWidth.toFixed(2)),
      baseLetterHeight: Number(p.baseLetterHeight.toFixed(2)),
      letterHeight: Number(p.letterHeight.toFixed(2)),
      curveLength: Number(p.curveLength.toFixed(2)),
      totalPoints: p.totalPoints,
      bufferFade: Number(getModeAdjustedBufferFade(p).toFixed(4)),
      rawBufferFade: Number(p.bufferFade.toFixed(4)),
      effectiveTrailPoints: p.effectiveTrailPoints,
      recentPoints: Array.isArray(state.recentPoints) ? state.recentPoints.length : 0,
      renderMode: getRenderModeName(),
      pointAlpha: getModePointAlpha(p),
      historyStrokeWeight: Number(p.historyStrokeWeight.toFixed(2)),
      cycleFadeOutFrames: p.cycleFadeOutFrames,
      startDelay: p.startDelay,
      lastUpdateFrame: state.lastUpdateFrame,
      lastResizeContinued: !!state.lastResizeContinued,
      bufferSize: state.buffer ? (state.buffer.width + 'x' + state.buffer.height) : null,
      lastExitEvent: state.lastExitEvent || null,
      lastStartReturnEvent: state.lastStartReturnEvent || null,
      lastPreEntryEvent: state.lastPreEntryEvent || null,
      lastFoldBackEvent: state.lastFoldBackEvent || null,
      pointEvents: Array.isArray(state.pointEvents) ? state.pointEvents.slice(-40) : [],
      hiddenVectorIndices: Array.isArray(state.hiddenVectorIndices) ? state.hiddenVectorIndices.slice() : [],
      lastPreEntryTransitionId: state.lastPreEntryTransitionId || 0,
      lifecycleEvents: global.getCaseLifecycleDebug ? global.getCaseLifecycleDebug().events : [],
      overlay,
      restartOnEntry: true,
      trailLengthRole: 'case11では trailLength を軌跡/残像の残り方へ反映',
      waveSpacingRole: 'case11では waveSpacing をU字の横幅 letterWidth に変換',
      radiusRole: 'case11では radius を主にU字の縦高さ baseLetterHeight に変換',
      renderer: 'case11-vector-continuation-with-smoothed-parameter-update',
      targetConfig: state.targetConfig ? cloneCase11ConfigSnapshot(state.targetConfig) : null,
      smoothedConfig: state.smoothedConfig ? cloneCase11ConfigSnapshot(state.smoothedConfig) : null,
      entryHoldActive: !!state.entryHoldActive,
      entryHoldUntilFrame: Number(state.entryHoldUntilFrame || 0),
      entryHoldFrames: Number(state.entryHoldFrames || 0),
      entryFadeDebug: global.getCase11EntryFadeDebug ? global.getCase11EntryFadeDebug() : null,
      note: 'case11 はパラメータ変更時にリスタートせず、墨幅・軌跡幅・全体サイズ・点サイズ・速度を数十フレームで徐々に反映します。'
    };
  }

  function buildCase11OverlayDebug(state) {
    const vectors = global.vectors || [];
    const width = canvasWidth();
    const height = canvasHeight();
    const allowCount = vectors.reduce(function countAllowed(total, v) {
      return total + (v && v.__case11AllowHostDraw ? 1 : 0);
    }, 0);
    const hiddenCount = vectors.reduce(function countHidden(total, v) {
      return total + (v && v.isHidden ? 1 : 0);
    }, 0);
    const trailLongCount = vectors.reduce(function countTrailLong(total, v) {
      return total + (v && Array.isArray(v.trail) && v.trail.length >= 3 ? 1 : 0);
    }, 0);
    const largeDistanceThreshold = Math.max(220, Math.min(width, height) * 0.22);
    const suspiciousVectors = [];
    const preview = [];
    for (let i = 0; i < Math.min(10, vectors.length); i++) {
      const v = vectors[i] || {};
      const trail = Array.isArray(v.trail) ? v.trail : [];
      const head = trail[0] || null;
      const tail = trail.length ? trail[trail.length - 1] : null;
      const headX = head ? Number(head.x) : NaN;
      const headY = head ? Number(head.y) : NaN;
      const tailX = tail ? Number(tail.x) : NaN;
      const tailY = tail ? Number(tail.y) : NaN;
      const distance = (Number.isFinite(headX) && Number.isFinite(headY) && Number.isFinite(tailX) && Number.isFinite(tailY))
        ? Math.sqrt(Math.pow(headX - tailX, 2) + Math.pow(headY - tailY, 2))
        : NaN;
      const entry = {
        index: i,
        isHidden: !!v.isHidden,
        allowHostDraw: !!v.__case11AllowHostDraw,
        currentX: v.current ? Number(v.current.x) : NaN,
        currentY: v.current ? Number(v.current.y) : NaN,
        trailLength: trail.length,
        headX,
        headY,
        tailX,
        tailY,
        color: Array.isArray(v.__case11Color) ? v.__case11Color.slice(0, 4) : null,
        distance
      };
      preview.push(entry);
      if (entry.allowHostDraw && Number.isFinite(distance) && distance >= largeDistanceThreshold) {
        suspiciousVectors.push(entry);
      }
    }
    return {
      frameCount: Number(global.frameCount || 0),
      phase: state && state.phase ? state.phase : '',
      isTransitioning: !!global.isTransitioning,
      allowCount,
      hiddenCount,
      trailLongCount,
      largeDistanceThreshold,
      suspiciousVectors,
      trailGuard: {
        active: !!global.__trailGuardDebug,
        lastAnomalies: global.__trailGuardDebugState && Array.isArray(global.__trailGuardDebugState.lastAnomalies)
          ? global.__trailGuardDebugState.lastAnomalies.slice(-10)
          : [],
        lastReset: global.__trailGuardDebugState ? global.__trailGuardDebugState.lastReset || null : null
      },
      preview
    };
  }

  function attachCaseActivationListener(state) {
    if (state.caseChangedListenerAttached || typeof document === 'undefined' || !document.addEventListener) return;
    state.caseChangedListenerAttached = true;

    function markPreEntryCaptured(transitionId) {
      state.lastPreEntryTransitionId = transitionId || 0;
    }

    function isPreEntryAlreadyCaptured(transitionId) {
      return !!transitionId && state.lastPreEntryTransitionId === transitionId;
    }

    document.addEventListener('caseWillStart', function onCaseWillStart(event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.nextCase === state.owner) {
        recordPreEntryVectors(state);
        markPreEntryCaptured(detail.transitionId);
        state.forceRestartOnNextUpdate = true;
      }
    });

    document.addEventListener('caseWillEnd', function onCaseWillEnd(event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.currentCase === state.owner && detail.nextCase && detail.nextCase !== state.owner) {
        state.wasCase11Left = true;
        releaseAllCase11Vectors(state, 'case11-will-end-to-other-visible');
      }
    });

    document.addEventListener('caseDidStart', function onCaseDidStart(event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.currentCase === state.owner && !detail.nextCase) {
        state.forceRestartOnNextUpdate = false;
      }
    });

    // 既存互換: 古い caseChanged しか飛ばない経路でも最低限動くよう残す。
    // 新規経路では caseWillStart / caseWillEnd が先に処理するため、一瞬表示を抑えやすい。
    document.addEventListener('caseChanged', function onCaseChanged(event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.nextCase === state.owner && !isPreEntryAlreadyCaptured(detail.transitionId)) {
        recordPreEntryVectors(state);
        markPreEntryCaptured(detail.transitionId);
        state.forceRestartOnNextUpdate = true;
      }
      if (detail.currentCase === state.owner && !detail.nextCase) {
        state.forceRestartOnNextUpdate = false;
      }
      if (detail.currentCase === state.owner && detail.nextCase && detail.nextCase !== state.owner) {
        state.wasCase11Left = true;
        releaseAllCase11Vectors(state, 'case11-to-other-visible');
      }
    });
  }

  function shouldRestartOnEntry(state) {
    /*
     * 入場リスタートは caseChanged 完了イベントだけで判定する。
     * 以前は frameCount の空白も「再入場」と見なしていたが、
     * ウインドウリサイズ中にも draw/update が数フレーム止まり、
     * 同じ case11 表示中なのに左から再スタートしてしまう原因になる。
     *
     * - 他case → case11: caseChanged で forceRestartOnNextUpdate=true になり左から開始
     * - case11 表示中の resize: forceRestartOnNextUpdate は立たないので進行状態を維持
     */
    return !!state.forceRestartOnNextUpdate;
  }

  function restartCase11FromEntry(state) {
    state.forceRestartOnNextUpdate = false;
    state.cycleCount = 0;
    state.waitingForRestart = false;
    state.restartCountdown = 0;
    rebuildStateForNewCycle(state, true, { preserveHidden: true });
    setCase11Phase(state, 'entryFade', 'restart-from-entry');
  }

  function ensureState(caseObj) {
    const signature = makeConfigSignature(caseObj.config);
    if (!caseObj._case11State) {
      const state = {
        owner: caseObj,
        signature,
        seed: 1,
        rng: makeSeededRandom(1),
        params: null,
        targetConfig: null,
        smoothedConfig: null,
        groups: [],
        buffer: null,
        cycleCount: 0,
        waitingForRestart: false,
        restartCountdown: 0,
        lastUpdateFrame: null,
        forceRestartOnNextUpdate: true,
        wasCase11Left: false,
        postOverlayScheduled: false,
        recentPoints: [],
        hostPoints: [],
        pointEvents: [],
        outsideByVectorIndex: [],
        hiddenVectorIndices: [],
        preEntryPoints: [],
        entryHoldActive: false,
        entryHoldUntilFrame: 0,
        entryHoldFrames: 0,
        entryHoldReason: '',
        phase: 'entryFade',
        lastExitEvent: null,
        lastStartReturnEvent: null,
        lastPreEntryEvent: null,
        lastFoldBackEvent: null,
        caseChangedListenerAttached: false,
        debug: {}
      };
      ensureBuffer(state);
      caseObj._case11State = state;
      rebuildStateForNewCycle(state, true);
    } else if (caseObj._case11State.signature !== signature) {
      const state = caseObj._case11State;
      applyConfigChangeWithoutRestart(state, signature);
      state.forceRestartOnNextUpdate = false;
    }
    ensureBuffer(caseObj._case11State);
    attachCaseActivationListener(caseObj._case11State);
    return caseObj._case11State;
  }

  function updateImagePixels(caseObj, img) {
    caseObj.image = img;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    caseObj.imagePixels = ctx.getImageData(0, 0, img.width, img.height).data;
  }

  function formatWaveSpacingValue(value) {
    return String(Math.round(clamp(value, 2, 300)));
  }

  function removeCase11WaveSpacingControl() {
    if (typeof document === 'undefined') return;
    const row = document.getElementById('case11-waveSpacing-group');
    if (row && row.parentNode) {
      row.parentNode.removeChild(row);
    }
  }

  function syncCase11WaveSpacingControl(caseObj) {
    if (!caseObj || !caseObj.config || typeof document === 'undefined') return;
    const row = document.getElementById('case11-waveSpacing-group');
    if (!row) return;
    const slider = row.querySelector('#case11-waveSpacing-slider');
    const value = row.querySelector('#case11-waveSpacing-value');
    const currentValue = clamp(caseObj.config.waveSpacing, 2, 300);
    if (slider && document.activeElement !== slider) {
      slider.value = currentValue;
    }
    if (value) {
      value.textContent = formatWaveSpacingValue(currentValue);
    }
  }

  function ensureCase11WaveSpacingControl(caseObj) {
    if (!caseObj || !caseObj.config || typeof document === 'undefined') return;

    if (global.currentCase && !isCase11Object(global.currentCase)) {
      removeCase11WaveSpacingControl();
      return;
    }

    const sliderContainer = document.getElementById('slider-container');
    const sliderContent = sliderContainer ? sliderContainer.querySelector('.ui-content') : null;
    if (!sliderContent) return;

    const existingExtraRow = document.getElementById('waveSpacing-group');
    if (existingExtraRow) {
      existingExtraRow.remove();
    }

    if (document.getElementById('case11-waveSpacing-group')) {
      syncCase11WaveSpacingControl(caseObj);
      return;
    }

    const currentValue = clamp(caseObj.config.waveSpacing, 2, 300);

    const sliderGroup = document.createElement('div');
    sliderGroup.id = 'case11-waveSpacing-group';
    sliderGroup.className = 'slider-group';
    sliderGroup.dataset.case11WaveSpacing = 'true';

    const sliderLayout = document.createElement('div');
    sliderLayout.className = 'slider-layout';

    const labelValueContainer = document.createElement('div');
    labelValueContainer.className = 'label-value-container';

    const label = document.createElement('label');
    label.className = 'slider-label';
    label.htmlFor = 'case11-waveSpacing-slider';
    label.textContent = '波の間隔';
    labelValueContainer.appendChild(label);

    const sliderContainerInner = document.createElement('div');
    sliderContainerInner.className = 'slider-container';

    const fixedSlider = document.createElement('input');
    fixedSlider.type = 'range';
    fixedSlider.id = 'case11-waveSpacing-slider';
    fixedSlider.className = 'slider';
    fixedSlider.min = '2';
    fixedSlider.max = '300';
    fixedSlider.step = '1';
    fixedSlider.value = currentValue;
    fixedSlider.dataset.sliderRole = 'fixed';

    sliderContainerInner.appendChild(fixedSlider);

    const value = document.createElement('div');
    value.id = 'case11-waveSpacing-value';
    value.className = 'slider-value';
    value.textContent = formatWaveSpacingValue(currentValue);

    const defaultContainer = document.createElement('div');
    defaultContainer.className = 'default-container';

    const defaultValue = document.createElement('div');
    defaultValue.className = 'default-value';
    defaultValue.id = 'case11-waveSpacing-default';
    defaultValue.textContent = formatWaveSpacingValue(caseObj.initialConfig && Number.isFinite(caseObj.initialConfig.waveSpacing)
      ? caseObj.initialConfig.waveSpacing
      : 120);

    const fixedButton = document.createElement('button');
    fixedButton.type = 'button';
    fixedButton.className = 'reset-btn cycle-btn';
    fixedButton.textContent = '[固定]';
    fixedButton.dataset.sliderCycleButton = 'case11-waveSpacing';
    fixedButton.dataset.sliderCycleMode = 'fixed';
    fixedButton.addEventListener('click', function onWaveSpacingFixedClick() {
      fixedButton.dataset.sliderCycleMode = 'fixed';
      fixedButton.textContent = '[固定]';
      syncCase11WaveSpacingControl(caseObj);
    });

    defaultContainer.appendChild(defaultValue);
    defaultContainer.appendChild(fixedButton);

    sliderLayout.appendChild(labelValueContainer);
    sliderLayout.appendChild(sliderContainerInner);
    sliderLayout.appendChild(value);
    sliderLayout.appendChild(defaultContainer);
    sliderGroup.appendChild(sliderLayout);
    sliderContent.appendChild(sliderGroup);

    fixedSlider.addEventListener('input', function onWaveSpacingInput() {
      const nextValue = Math.round(clamp(fixedSlider.value, 2, 300));
      caseObj.config.waveSpacing = nextValue;
      value.textContent = formatWaveSpacingValue(nextValue);
      if (caseObj._case11State) {
        caseObj._case11State.signature = '';
      }
      if (global.Table && typeof global.Table.updateCaseComparisonTable === 'function') {
        global.Table.updateCaseComparisonTable();
      }
    });
  }

  function attachCase11WaveSpacingDomListener() {
    if (typeof document === 'undefined' || attachCase11WaveSpacingDomListener.attached) return;
    attachCase11WaveSpacingDomListener.attached = true;

    document.addEventListener('caseChanged', function onCase11WaveSpacingCaseChanged(event) {
      const detail = event && event.detail ? event.detail : {};
      const activeCase = detail.nextCase || detail.currentCase || global.currentCase;
      if (isCase11Object(activeCase)) {
        const addAfterSliderRefresh = function addCase11WaveSpacingAfterSliderRefresh() {
          ensureCase11WaveSpacingControl(activeCase);
        };
        if (typeof global.setTimeout === 'function') {
          global.setTimeout(addAfterSliderRefresh, 0);
        } else if (typeof global.requestAnimationFrame === 'function') {
          global.requestAnimationFrame(addAfterSliderRefresh);
        } else {
          addAfterSliderRefresh();
        }
      } else {
        removeCase11WaveSpacingControl();
      }
    });

    if (global.TableNext && typeof global.TableNext.switchToCase === 'function' && !global.TableNext.__case11WaveSpacingWrapped) {
      const originalSwitchToCase = global.TableNext.switchToCase;
      global.TableNext.switchToCase = function case11WaveSpacingSwitchToCaseWrapper(caseIndex) {
        const result = originalSwitchToCase.apply(this, arguments);
        const syncAfterSwitch = function syncCase11WaveSpacingAfterSwitch() {
          if (isCase11Object(global.currentCase)) {
            ensureCase11WaveSpacingControl(global.currentCase);
          } else {
            removeCase11WaveSpacingControl();
          }
        };
        if (typeof global.requestAnimationFrame === 'function') {
          global.requestAnimationFrame(syncAfterSwitch);
        } else {
          syncAfterSwitch();
        }
        return result;
      };
      global.TableNext.__case11WaveSpacingWrapped = true;
    }
  }




  function ensureCase11SliderRegistered(caseObj) {
    /*
     * ChatGPT fix:
     * case11 専用の waveSpacing は、case11.js が独自DOMを追加するのではなく、
     * UI_Slider.js の sliderExtraParamDefs 正式経路で生成させる。
     * 既存の 2.点 パネルが先に6行で描画済みの場合でも、case11表示中に1回だけ再生成して7行へ更新する。
     */
    if (!caseObj || typeof document === 'undefined') return;
    if (!global.Slider || typeof global.Slider.createSliders !== 'function') return;
    if (!isCase11Object(global.currentCase || caseObj)) return;

    const targetId = global.Slider._lastTargetId || 'slider-container';
    const target = document.getElementById(targetId) || document.getElementById('slider-container');
    if (!target || !target.id) return;

    const hasOfficialRow = !!document.getElementById('waveSpacing-group');
    const hasOldDirectRow = !!document.getElementById('case11-waveSpacing-group');
    const key = String(global.Slider._lastParamDefsKey || '');
    const needsRebuild = !hasOfficialRow || hasOldDirectRow || !key.split('|').includes('waveSpacing');

    if (hasOldDirectRow) {
      removeCase11WaveSpacingControl();
    }

    if (needsRebuild) {
      global.Slider.createSliders(target.id, caseObj);
      return;
    }

    if (typeof global.Slider.updateSliderValue === 'function') {
      global.Slider.updateSliderValue('waveSpacing', caseObj.config.waveSpacing, { syncInputs: true });
    }
  }

  function isCase11Object(caseObj) {
    return !!(caseObj && (caseObj === global.case11 || caseObj.__case11DirectRenderer === true || caseObj.caseId === 11 || caseObj.name === 'case11'));
  }

  global.case11 = {
    initialConfig: {
      count: 6,
      color: [0, 0, 0],
      size: 36,
      radius: 240,
      trailLength: 120,
      morphSpeed: 0.012,
      fadeSpeed: 0.0026,
      waveSpacing: 120,
      vectorSpeed: 1,
      vectorDirection: 0,
      vectorSize: 10,
      image: null
    },

    config: {
      count: 6,
      color: [0, 0, 0],
      size: 36,
      radius: 240,
      trailLength: 120,
      morphSpeed: 0.012,
      fadeSpeed: 0.0026,
      waveSpacing: 120,
      vectorSpeed: 1,
      vectorDirection: 0,
      vectorSize: 10,
      image: null
    },

    /*
     * UI_Slider.js 側が sliderParamOverrides を読む場合、
     * case11 の「点の数」は通常caseの点数ではなく波の行数として 1〜10 に制限する。
     * UI_Slider.js 未更新の環境でも、上の変換関数で 1〜10 に内部制限される。
     */
    sliderParamOverrides: {
      count: { min: 1, max: 10, step: 1, decimals: 0 },
      size: { min: 1, max: 400, step: 0.01, decimals: 2 }
    },

    image: null,
    imagePixels: null,
    _case11State: null,

    loadImage: function loadImage(img) {
      updateImagePixels(this, img);
    },

    getBrightness: function getBrightness() {
      return 0;
    },

    getAnimationCycleFrames: function getAnimationCycleFrames() {
      /*
       * 2.点の「1周期」は、case11では左から描き始めた波群が右端まで進み、
       * fade待機後に次の再始動へ入るまでの1回分として扱う。
       */
      const state = ensureState(this);
      const params = state && state.params ? state.params : null;
      if (!params) return 60;

      const startX = -Math.max(
        SOURCE_CONFIG.maxLetterWidth,
        (params.letterWidth || SOURCE_CONFIG.maxLetterWidth) + (params.pointSize || 0) * 2
      );
      const rightLimit = canvasWidth() + Math.max(
        SOURCE_CONFIG.maxLetterWidth,
        (params.letterWidth || SOURCE_CONFIG.maxLetterWidth) + (params.pointSize || 0) * 2
      );
      const glyphCount = Math.max(1, Math.ceil((rightLimit - startX) / Math.max(1, params.letterWidth)));
      const drawFrames = Math.ceil(
        (glyphCount * Math.max(1, params.totalPoints)) / Math.max(0.0001, params.pointsPerFrame)
      );
      const finalGroupDelay = Math.max(0, (Math.max(1, params.groupCount) - 1) * Math.max(0, params.startDelay || 0));
      return Math.max(1, drawFrames + finalGroupDelay + Math.max(0, params.cycleFadeOutFrames || 0));
    },

    update: function update() {
      const state = ensureState(this);
      ensureCase11SliderRegistered(this);
      releaseExpiredCase11EntryHold(state);
      if (shouldRestartOnEntry(state)) {
        restartCase11FromEntry(state);
      }
      updateAndDrawGroups(state);
      drawBufferToCanvas(state);
      // ChatGPT fix: avoid drawing the case11 buffer a second time after host trailBuffer; it made accumulate/history look too thick.
      // schedulePostTrailOverlay(state);
      hideHostVectorsForThisFrame();
      state.lastUpdateFrame = Number(global.frameCount || 0);
      state.debug = buildDebug(state);
    },

    getTargetX: function getTargetX(i) {
      const point = getHostSyncedPoint(this, i);
      return point ? point.x : getHostGuideX();
    },

    getTargetY: function getTargetY(i) {
      const point = getHostSyncedPoint(this, i);
      return point ? point.y : getHostGuideY(i, this.config && this.config.count);
    },

    getDebugInfo: function getDebugInfo() {
      const state = ensureState(this);
      return {
        sourceConfig: SOURCE_CONFIG,
        currentConfig: Object.assign({}, this.config),
        converted: Object.assign({}, state.debug),
        lastExitEvent: state.lastExitEvent || null,
        lastStartReturnEvent: state.lastStartReturnEvent || null,
        lastPreEntryEvent: state.lastPreEntryEvent || null,
        lastFoldBackEvent: state.lastFoldBackEvent || null,
        pointEvents: Array.isArray(state.pointEvents) ? state.pointEvents.slice(-80) : [],
        hiddenVectorIndices: Array.isArray(state.hiddenVectorIndices) ? state.hiddenVectorIndices.slice() : [],
        entryHoldActive: !!state.entryHoldActive,
        entryHoldUntilFrame: Number(state.entryHoldUntilFrame || 0),
        entryHoldFrames: Number(state.entryHoldFrames || 0),
        preEntryPoints: Array.isArray(state.preEntryPoints) ? state.preEntryPoints.slice(0, 80) : [],
        groups: state.groups.map(function mapGroup(group) {
          return {
            currentX: Number(group.currentX.toFixed(2)),
            currentY: Number(group.currentY.toFixed(2)),
            isInverted: group.isInverted,
            currentPointIndex: group.currentPointIndex,
            totalPoints: group.totalPoints,
            delayFrames: group.delayFrames,
            completedCycle: group.completedCycle
          };
        })
      };
    }
  };
})(window);
