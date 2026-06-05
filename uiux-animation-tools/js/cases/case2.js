window.case2 = {
  initialConfig: {
    count: 8,
    color: [0, 0, 0],
    size: 12,
    radius: 100,
    trailLength: 25,
    morphSpeed: 0.01,
    fadeSpeed: 0.06,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },

  config: {
    count: 90,
    color: [0, 0, 83],
    size: 1.00,
    radius: 289.71,
    trailLength: 16.00,
    morphSpeed: 0.0220,
    fadeSpeed: 0.0313,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },

  update: function(frameCount) {
    // 必要に応じて状態を更新
  },

  getRingCounts: function(count) {
    if (count <= 1) {
      return {
        outerCount: 1,
        innerCount: 0
      };
    }

    if (count === 2) {
      return {
        outerCount: 1,
        innerCount: 1
      };
    }

    /*
     * 内円の半径は外円の 0.5 倍なので、
     * 円周比に合わせて外円：内円を約 2：1 で配分する。
     * 例:
     * count 14 → 外円 9 / 内円 5
     * count 15 → 外円 10 / 内円 5
     */
    const outerCount = Math.max(
      2,
      Math.min(count - 1, Math.round(count * (2 / 3)))
    );

    return {
      outerCount: outerCount,
      innerCount: count - outerCount
    };
  },

  getPointPosition: function(i) {
    const { count, radius, morphSpeed } = this.config;
    const outerRadius = radius;
    const innerRadius = radius * 0.5;
    const rotation = frameCount * morphSpeed;

    if (count <= 1) {
      return {
        angle: rotation,
        radius: outerRadius
      };
    }

    if (count === 2) {
      if (i === 0) {
        return {
          angle: rotation,
          radius: outerRadius
        };
      }

      return {
        angle: Math.PI - rotation,
        radius: innerRadius
      };
    }

    const { outerCount, innerCount } = this.getRingCounts(count);

    if (i < outerCount) {
      return {
        angle: (TWO_PI / outerCount) * i + rotation,
        radius: outerRadius
      };
    }

    const innerIndex = i - outerCount;

    return {
      angle: TWO_PI - (TWO_PI / innerCount) * innerIndex - rotation,
      radius: innerRadius
    };
  },

  getTargetX: function(i) {
    const point = this.getPointPosition(i);

    return width / 2 + Math.sin(point.angle) * point.radius;
  },

  getTargetY: function(i) {
    const point = this.getPointPosition(i);

    return height / 2 + Math.cos(point.angle) * point.radius;
  }
};