// Midnight Gallery — world: the museum floor, collision and line of sight.
// The room is one big gallery; walls, cases, statues, pillars, benches and
// crates are rectangles. Sight lines stop at any obstacle, so cover is real.
const World = {
  room: {
    x: CONFIG.wallThickness,
    y: CONFIG.wallThickness,
    w: CONFIG.canvasWidth - CONFIG.wallThickness * 2,
    h: CONFIG.canvasHeight - CONFIG.wallThickness * 2,
  },

  obstacles: OBSTACLES,

  pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  },

  pointBlocked(px, py) {
    if (px < this.room.x || px > this.room.x + this.room.w) return true;
    if (py < this.room.y || py > this.room.y + this.room.h) return true;
    for (const o of this.obstacles) {
      if (this.pointInRect(px, py, o)) return true;
    }
    return false;
  },

  // Is the circle (x, y, r) touching any wall or obstacle?
  circleBlocked(x, y, r) {
    if (x - r < this.room.x || x + r > this.room.x + this.room.w) return true;
    if (y - r < this.room.y || y + r > this.room.y + this.room.h) return true;
    for (const o of this.obstacles) {
      const nx = Math.max(o.x, Math.min(x, o.x + o.w));
      const ny = Math.max(o.y, Math.min(y, o.y + o.h));
      const dx = x - nx;
      const dy = y - ny;
      if (dx * dx + dy * dy < r * r) return true;
    }
    return false;
  },

  // Move a circle with axis separation so it slides along walls and cases.
  moveCircle(body, dx, dy) {
    const r = body.radius;
    if (!this.circleBlocked(body.x + dx, body.y, r)) body.x += dx;
    if (!this.circleBlocked(body.x, body.y + dy, r)) body.y += dy;
  },

  // Line of sight: sample the segment; blocked if any sample lands inside
  // a wall or an obstacle. Smoke clouds are checked by the caller.
  segmentBlocked(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 6));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.pointBlocked(x1 + dx * t, y1 + dy * t)) return true;
    }
    return false;
  },

  // Is a point inside any active smoke cloud?
  inSmoke(x, y, smokes) {
    for (const s of smokes) {
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy < s.radius * s.radius) return true;
    }
    return false;
  },

  dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  },

  // Smallest signed angle from a to b, in (-PI, PI].
  angleDiff(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d <= -Math.PI) d += Math.PI * 2;
    return d;
  },

  // Is the target inside the vision cone of (ox, oy) facing `angle`?
  inVisionCone(ox, oy, angle, halfAngle, range, tx, ty) {
    const dx = tx - ox;
    const dy = ty - oy;
    const d = Math.hypot(dx, dy);
    if (d > range) return false;
    if (d < 12) return true;
    const targetAngle = Math.atan2(dy, dx);
    return Math.abs(this.angleDiff(angle, targetAngle)) <= halfAngle;
  },
};
