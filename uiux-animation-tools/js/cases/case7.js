window.case7 = {
  initialConfig: {
    count: 16,
    color: [0, 0, 0],
    size: 21,
    radius: 80,
    trailLength: 20,
    morphSpeed: 0.04,
    fadeSpeed: 0.07,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 12,
    color: [0, 0, 0],
    size: 16.27,
    radius: 141.16,
    trailLength: 108.00,
    morphSpeed: 0.0406,
    fadeSpeed: 0.0118,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // 必要に応じて状態を更新
  },
  getTargetX: function(i) {
    const { count, radius, morphSpeed } = this.config;
    const time = frameCount * morphSpeed;
    const spiralAngle = i * (Math.PI * 2 / count) * 5 + time;
    const spiralRadius = (i / count) * radius;
    return width / 2 + Math.cos(spiralAngle) * spiralRadius * 0.85;
  },
  getTargetY: function(i) {
    const { count, radius, morphSpeed } = this.config;
    const time = frameCount * morphSpeed;
    const spiralAngle = i * (Math.PI * 2 / count) * 5 + time;
    const spiralRadius = (i / count) * radius;
    return height / 2 + Math.sin(spiralAngle) * spiralRadius * 0.85;
  }
};