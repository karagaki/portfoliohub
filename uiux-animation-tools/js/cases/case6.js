window.case6 = {
  initialConfig: {
    count: 33,
    color: [0, 45, 40],
    size: 12,
    radius: 30,
    trailLength: 20,
    morphSpeed: 0.04,
    fadeSpeed: 0.07,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 5,
    color: [59, 63, 57],
    size: 26.33,
    radius: 92.26,
    trailLength: 27.00,
    morphSpeed: 0.0286,
    fadeSpeed: 0.0007,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // 必要に応じて状態を更新
  },
  getTargetX: function(i) {
    return width / 2 + Math.cos(frameCount * this.config.morphSpeed + i) * (i * this.config.radius / this.config.count);
  },
  getTargetY: function(i) {
    return height / 2 + Math.sin(frameCount * this.config.morphSpeed + i) * (i * this.config.radius / this.config.count);
  }
};