window.case9 = {
  initialConfig: {
    count: 3,
    color: [236, 224, 198],
    size: 18.0,
    radius: 250.0,
    trailLength: 72.0,
    morphSpeed: 0.0100,
    fadeSpeed: 0.0460,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },

  config: {
    count: 3,
    color: [236, 224, 198],
    size: 18.0,
    radius: 250.0,
    trailLength: 72.0,
    morphSpeed: 0.0100,
    fadeSpeed: 0.0460,
    vectorSpeed: 1,
    vectorDirection: 0,
    vectorSize: 10,
    image: null
  },

  image: null,
  imagePixels: null,

  loadImage: function(img) {
    this.image = img;
  },

  getBrightness: function() {
    return 0;
  },

  update: function() {
    // 点位置は getTargetX / getTargetY で直接計算する軽量case。
  },

  _getRotation: function(frameCount) {
    const speed = Math.max(0.0002, Number(this.config.morphSpeed) || 0.0100);
    // canvas座標では角度増加が見た目の右回りになる。
    return -Math.PI / 2 + Number(frameCount || 0) * speed;
  },

  _getVertices: function(frameCount) {
    const canvasW = typeof width === "number" ? width : window.innerWidth;
    const canvasH = typeof height === "number" ? height : window.innerHeight;
    const cx = canvasW / 2;
    const cy = canvasH / 2;
    const radius = Math.max(30, Number(this.config.radius) || 250);
    const rotation = this._getRotation(frameCount);
    const vertices = [];
    for (let vertex = 0; vertex < 3; vertex++) {
      const angle = rotation + vertex * Math.PI * 2 / 3;
      vertices.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    return vertices;
  },

  _getSideSegments: function(count) {
    const safeCount = Math.max(3, Math.floor(Number(count) || 3));
    const segments = [1, 1, 1];
    for (let extra = 0; extra < safeCount - 3; extra++) {
      segments[extra % 3] += 1;
    }
    return segments;
  },

  _getPoint: function(index, frameCount) {
    const count = Math.max(3, Math.floor(Number(this.config.count) || 3));
    const pointIndex = ((Math.floor(index) % count) + count) % count;
    const vertices = this._getVertices(frameCount);
    const sideSegments = this._getSideSegments(count);
    let cursor = pointIndex;

    for (let side = 0; side < 3; side++) {
      const segmentCount = sideSegments[side];
      if (cursor < segmentCount) {
        const t = cursor / segmentCount;
        const a = vertices[side];
        const b = vertices[(side + 1) % 3];
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        };
      }
      cursor -= segmentCount;
    }
    return vertices[0];
  },

  getTargetX: function(i, frameCount) {
    return this._getPoint(i, frameCount).x;
  },

  getTargetY: function(i, frameCount) {
    return this._getPoint(i, frameCount).y;
  }
};
