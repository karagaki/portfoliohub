window.case1 = {
  initialConfig: {
    count: 4,
    color: [0, 0, 0],
    size: 41,
    radius: 72,
    trailLength: 15,
    morphSpeed: 0.02,
    fadeSpeed: 0.08,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 4,
    color: [56, 17, 13],
    size: 83.32,
    radius: 93.29,
    trailLength: 17.00,
    morphSpeed: 0.0073,
    fadeSpeed: 0.0005,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // フレームごとの更新処理（必要に応じて）
  },
  getTargetX: function(i, frameCount) {
    const { count, radius, morphSpeed } = this.config;
    const angle = (TWO_PI / count) * i + frameCount * morphSpeed;
    return width / 2 + Math.cos(angle) * (radius / 2); // radiusは直径なので2で割る
  },
  getTargetY: function(i, frameCount) {
    const { count, radius, morphSpeed } = this.config;
    const angle = (TWO_PI / count) * i + frameCount * morphSpeed;
    return height / 2 + Math.sin(angle) * (radius / 2); // radiusは直径なので2で割る
  }
};