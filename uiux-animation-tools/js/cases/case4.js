window.case4 = {
  initialConfig: {
    count: 33,
    color: [0, 45, 40],
    size: 12,
    radius: 300,
    trailLength: 20,
    morphSpeed: 0.04,
    fadeSpeed: 0.07,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 16,
    color: [0, 45, 40],
    size: 7.24,
    radius: 314.56,
    trailLength: 20.00,
    morphSpeed: 0.0227,
    fadeSpeed: 0.0225,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  update: function(frameCount) {
    // 必要に応じて状態を更新
  },
  getTargetX: function(i) {
    const centerX = width / 2;
    const baseAngle = (i * (Math.PI * 2 / this.config.count));
    const timeOffset = frameCount * this.config.morphSpeed;
    
    const oscillation = Math.sin(baseAngle + timeOffset);
    
    return centerX + (oscillation * this.config.radius / 2);
  },
  getTargetY: function(i) {
    const { count } = this.config;
    const centerY = height / 2;
    
    if (count === 1) {
      return centerY;
    } else if (count === 2) {
      return i === 0 ? height * 0.1 : height * 0.9;
    } else {
      const availableHeight = height * 0.8;
      const step = availableHeight / (count - 1);
      return height * 0.1 + step * i;
    }
  }
};