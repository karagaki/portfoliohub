window.case5 = {
  initialConfig: {
    count: 16,
    color: [0, 0, 0],
    size: 13,
    radius: 80,
    trailLength: 20,
    morphSpeed: 0.03,
    fadeSpeed: 0.07,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },
  config: {
    count: 16,
    color: [0, 0, 15],
    size: 86.21,
    radius: 167.22,
    trailLength: 172.00,
    morphSpeed: 0.0321,
    fadeSpeed: 0.0568,
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
    const cols = 4, rows = 4;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const centerX = (i % cols + 0.5) * cellWidth;
    const angle = time + i * 0.5;
    const circleRadius = Math.min(cellWidth, cellHeight) * 0.35;
    return centerX + Math.cos(angle) * circleRadius;
  },
  getTargetY: function(i) {
    const { count, radius, morphSpeed } = this.config;
    const time = frameCount * morphSpeed;
    const cols = 4, rows = 4;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const centerY = (Math.floor(i / cols) + 0.5) * cellHeight;
    const angle = time + i * 0.5;
    const circleRadius = Math.min(cellWidth, cellHeight) * 0.35;
    return centerY + Math.sin(angle) * circleRadius;
  }
};