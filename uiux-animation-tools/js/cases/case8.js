window.case8 = {
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
    image: null
  },

  update: function(frameCount) {
    // 必要に応じて状態を更新
  },

  getTargetX: function(i, frameCount) {
    const margin = 10;
    const centerX = width / 2;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    const availableSize = Math.min(availableWidth, availableHeight);

    // 時計回りの回転角度
    const angle =
      (frameCount * this.config.morphSpeed +
        i * (2 * Math.PI / this.config.count)) %
      (2 * Math.PI);

    // 縦横で共通の距離を使い、キャンバス比率による横伸びを防ぐ
    const distance =
      Math.sin(frameCount * this.config.morphSpeed * 2) *
        (availableSize / 8) +
      availableSize / 8;

    let x = centerX + Math.cos(angle) * distance;

    // キャンバス端での折り返し
    if (x < margin) x = margin + (margin - x);
    if (x > width - margin) {
      x = width - margin - (x - (width - margin));
    }

    return x;
  },

  getTargetY: function(i, frameCount) {
    const margin = 10;
    const centerY = height / 2;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    const availableSize = Math.min(availableWidth, availableHeight);

    // 時計回りの回転角度
    const angle =
      (frameCount * this.config.morphSpeed +
        i * (2 * Math.PI / this.config.count)) %
      (2 * Math.PI);

    // X座標と同じ距離を使い、図形の縦横比を維持する
    const distance =
      Math.sin(frameCount * this.config.morphSpeed * 2) *
        (availableSize / 8) +
      availableSize / 8;

    let y = centerY + Math.sin(angle) * distance;

    // キャンバス端での折り返し
    if (y < margin) y = margin + (margin - y);
    if (y > height - margin) {
      y = height - margin - (y - (height - margin));
    }

    return y;
  }
};