window.case0 = {
  initialConfig: {
    count: 20,
    color: [0, 0, 0],
    size: 38.36,
    radius: 257.84,
    trailLength: 217.00,
    morphSpeed: 0.0234,
    fadeSpeed: 0.0500,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 38,
    color: [0, 0, 0],
    size: 18,
    radius: 693.84,
    trailLength: 37.00,
    morphSpeed: 0.0084,
    fadeSpeed: 0.0324,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // 必要に応じて状態を更新
  },
  getTargetX: function(i) {
    const angle = frameCount * this.config.morphSpeed;
    const pairIndex = Math.floor(i / 2);
    const isClockwise = i % 2 === 0;

    const count = Math.max(1, this.config.count);
    const pairCount = Math.max(1, Math.ceil(count / 2));
    const layerT = pairCount === 1 ? 0 : pairIndex / (pairCount - 1);

    const minRadius = this.config.radius * 0.02;
    const maxRadius = this.config.radius * 0.7;
    const orbitRadius = minRadius + (maxRadius - minRadius) * layerT;

    return width / 2 + Math.cos(isClockwise ? angle : -angle) * orbitRadius;
  },
  getTargetY: function(i) {
    const angle = frameCount * this.config.morphSpeed;
    const pairIndex = Math.floor(i / 2);
    const isClockwise = i % 2 === 0;

    const count = Math.max(1, this.config.count);
    const pairCount = Math.max(1, Math.ceil(count / 2));
    const layerT = pairCount === 1 ? 0 : pairIndex / (pairCount - 1);

    const minRadius = this.config.radius * 0.02;
    const maxRadius = this.config.radius * 0.7;
    const orbitRadius = minRadius + (maxRadius - minRadius) * layerT;

    return height / 2 + Math.sin(isClockwise ? angle : -angle) * orbitRadius;
  }
};