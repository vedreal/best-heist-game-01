// Midnight Gallery — guards: patrol loops, sweeping gaze, suspicion, chase.
// A guard's suspicion rises while the thief stands in its red cone in the
// open; it falls when the thief breaks line of sight. At full suspicion the
// guard gives chase, the alarm climbs, and a touch means caught.
function createGuards() {
  return GUARD_DEFS.map((def) => ({
    name: def.name,
    x: def.waypoints[0][0],
    y: def.waypoints[0][1],
    radius: 15,
    waypoints: def.waypoints,
    waypointIndex: 1,
    facing: Math.PI / 2,
    idleTimer: 0,
    sweepPhase: Math.random() * Math.PI * 2,
    suspicion: 0,
    chasing: false,
    chaseTimer: 0,
    lostTimer: 0,
    state: 'patrol',
  }));
}

function guardSeesPlayer(guard, state) {
  const p = state.player;
  if (World.inSmoke(p.x, p.y, state.smokes)) return false;
  if (World.inSmoke(guard.x, guard.y, state.smokes)) return false;
  if (!World.inVisionCone(guard.x, guard.y, guard.facing, CONFIG.guardVisionHalfAngle, CONFIG.guardVisionRange, p.x, p.y)) {
    return false;
  }
  if (World.segmentBlocked(guard.x, guard.y, p.x, p.y)) return false;
  return true;
}

function updateGuards(dt, state) {
  const p = state.player;
  for (const g of state.guards) {
    const sees = guardSeesPlayer(g, state);

    if (sees) {
      let rate = CONFIG.detectRate;
      const d = World.dist(g.x, g.y, p.x, p.y);
      rate *= 1.35 - Math.min(1, d / CONFIG.guardVisionRange) * 0.7;
      if (state.sneaking) rate *= CONFIG.sneakDetectFactor;
      if (state.movingFast) rate *= CONFIG.runDetectFactor;
      g.suspicion = Math.min(100, g.suspicion + rate * dt);
      g.lostTimer = 0;
      if (g.suspicion >= 100 && !g.chasing) {
        g.chasing = true;
        g.chaseTimer = 3;
        g.state = 'chase';
        SoundEngine.spottedBeep();
      }
    } else {
      g.suspicion = Math.max(0, g.suspicion - CONFIG.suspicionDecay * dt);
      if (g.chasing) {
        g.lostTimer += dt;
        if (g.lostTimer > 2) {
          g.chasing = false;
          g.state = 'patrol';
        }
      }
    }

    if (g.chasing) {
      g.chaseTimer -= dt;
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        g.facing = Math.atan2(dy, dx);
        World.moveCircle(g, (dx / d) * CONFIG.guardChaseSpeed * dt, (dy / d) * CONFIG.guardChaseSpeed * dt);
      }
      state.alarm = Math.min(100, state.alarm + CONFIG.chaseAlarmRate * dt);
      if (d < g.radius + p.radius + 2) {
        state.caughtReason = g.name + ' grabbed you!';
        state.screen = 'caught';
        SoundEngine.caughtSting();
      }
      if (g.chaseTimer <= 0 && !sees) {
        g.chasing = false;
        g.state = 'patrol';
      }
      continue;
    }

    // Patrol: walk to the next waypoint, then idle and sweep the gaze.
    if (g.idleTimer > 0) {
      g.idleTimer -= dt;
      const sweep = (CONFIG.guardSweepDegrees * Math.PI) / 180;
      g.facing += Math.sin((performance.now() / 1000 + g.sweepPhase) * 1.4) * sweep * dt * 1.4;
      continue;
    }
    const wp = g.waypoints[g.waypointIndex];
    const dx = wp[0] - g.x;
    const dy = wp[1] - g.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      g.waypointIndex = (g.waypointIndex + 1) % g.waypoints.length;
      g.idleTimer = CONFIG.guardIdleSeconds;
      continue;
    }
    g.facing = Math.atan2(dy, dx);
    World.moveCircle(g, (dx / d) * CONFIG.guardSpeed * dt, (dy / d) * CONFIG.guardSpeed * dt);
  }
}

// The red cone polygon a guard projects, for the renderer.
function guardConePoints(g) {
  const pts = [{ x: g.x, y: g.y }];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = g.facing - CONFIG.guardVisionHalfAngle + (2 * CONFIG.guardVisionHalfAngle * i) / steps;
    pts.push({ x: g.x + Math.cos(a) * CONFIG.guardVisionRange, y: g.y + Math.sin(a) * CONFIG.guardVisionRange });
  }
  return pts;
}
