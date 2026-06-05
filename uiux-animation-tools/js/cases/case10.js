window.case10 = {
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
    image: null,
    n: 2, // Superellipse parameter
    a: 200, // Horizontal semi-axis
    b: 200 // Vertical semi-axis: aと同値にして縦横比を維持
  },
  config: {
    count: 16,
    color: [4, 11, 56],
    size: 27.79,
    radius: 38.53,
    trailLength: 237.00,
    morphSpeed: 0.0143,
    fadeSpeed: 0.0042,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null,
    n: 2, // Superellipse parameter
    a: 200, // Horizontal semi-axis
    b: 200 // Vertical semi-axis: aと同値にして縦横比を維持
  },
  update: function(frameCount) {
    // Animate the superellipse parameters
    this.config.n = 2 + Math.sin(frameCount * 0.02) * 1.5; // n oscillates between 0.5 and 3.5
    const shapeRadius = 200 + Math.sin(frameCount * 0.03) * 50; // 150〜250の共通半径
    this.config.a = shapeRadius; // 横方向
    this.config.b = shapeRadius; // 縦方向：横と同じ半径で比率を維持
  },
  getTargetX: function(i, frameCount) {
    const { count, n, a, morphSpeed } = this.config;
    const t = (i / count) * Math.PI * 2 + frameCount * morphSpeed;
    const cosT = Math.cos(t);
    const x = a * Math.pow(Math.abs(cosT), 2/n) * Math.sign(cosT);
    return width / 2 + x;
  },
  getTargetY: function(i, frameCount) {
    const { count, n, b, morphSpeed } = this.config;
    const t = (i / count) * Math.PI * 2 + frameCount * morphSpeed;
    const sinT = Math.sin(t);
    const y = b * Math.pow(Math.abs(sinT), 2/n) * Math.sign(sinT);
    return height / 2 + y;
  }
};