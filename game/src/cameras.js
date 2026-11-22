// Midnight Gallery — cameras: wall-mounted security cameras sweeping green
// cones. A camera never chases, but being caught in its cone pushes the
// alarm up fast and beeps a warning.
function createCameras() {
  return CAMERA_DEFS.map((def) => ({
    name: def.name,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    angle: def.baseAngle,
    phase: Math.random() * Math.PI * 2,
    spotted: false,
  }));
}

function cameraSeesPlayer(cam, state) {
  const p = state.player;
  if (World.inSmoke(p.x, p.y, state.smokes)) return false;
  if (!World.inVisionCone(cam.x, cam.y, cam.angle, CONFIG.cameraVisionHalfAngle, CONFIG.cameraVisionRange, p.x, p.y)) {
    return false;
  }
  if (World.segmentBlocked(cam.x, cam.y, p.x, p.y)) return false;
  return true;
}

function updateCameras(dt, state) {
  const t = state.time;
  for (const cam of state.cameras) {
    cam.angle = cam.baseAngle + Math.sin((t / CONFIG.cameraSweepSeconds) * Math.PI * 2 + cam.phase) * cam.sweep;
    const sees = cameraSeesPlayer(cam, state);
    if (sees && !cam.spotted) {
      SoundEngine.spottedBeep();
    }
    cam.spotted = sees;
    if (sees) {
      state.alarm = Math.min(100, state.alarm + CONFIG.cameraAlarmRate * dt);
      state.cameraSpotted = true;
    }
  }
}

function cameraConePoints(cam) {
  const pts = [{ x: cam.x, y: cam.y }];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = cam.angle - CONFIG.cameraVisionHalfAngle + (2 * CONFIG.cameraVisionHalfAngle * i) / steps;
    pts.push({ x: cam.x + Math.cos(a) * CONFIG.cameraVisionRange, y: cam.y + Math.sin(a) * CONFIG.cameraVisionRange });
  }
  return pts;
}
