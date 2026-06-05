window.case3 = {
  initialConfig: {
    count: 13,
    color: [0, 0, 0],
    size: 74,
    radius: 30,
    trailLength: 30,
    morphSpeed: 0.01,
    fadeSpeed: 0.04,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 28,
    color: [0, 0, 0],
    size: 1.00,
    radius: 30.00,
    trailLength: 30.00,
    morphSpeed: 0.0470,
    fadeSpeed: 0.0090,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // 必要に応じて状態を更新
  },
  getTargetX: function(i) {
    const margin = width * 0.1;
    const availableWidth = width - (margin * 2);
    return margin + (availableWidth / (this.config.count - 1)) * i;
  },
  getTargetY: function(i) {
    return height / 2 + 
           (Math.sin(frameCount * this.config.morphSpeed + i) * config.maxSize) / 2 + 
           (Math.sin(frameCount * this.config.morphSpeed + i) * config.maxSize) / 4;
  }
};