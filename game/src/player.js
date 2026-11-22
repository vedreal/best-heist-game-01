// Midnight Gallery — player: the thief. Walk or sneak, throw smoke, pick
// the Sapphire's lock, grab loose loot, and slip out the exit door.
function createPlayer() {
  return {
    x: PLAYER_SPAWN.x,
    y: PLAYER_SPAWN.y,
    radius: CONFIG.playerRadius,
    facing: -Math.PI / 2,
    lootValue: 0,
    lootCount: 0,
    hasSapphire: false,
    smokeBombs: CONFIG.smokeBombsStart,
    lockpickProgress: 0,
    lockpickTarget: null,
  };
}

function nearestLoot(p, state, maxDist) {
  let best = null;
  let bestD = maxDist;
  for (const loot of state.loot) {
    if (loot.taken) continue;
    const d = World.dist(p.x, p.y, loot.x, loot.y);
    if (d < bestD) {
      bestD = d;
      best = loot;
    }
  }
  return best;
}

function updatePlayer(dt, state) {
  const p = state.player;
  const mv = Input.moveVector();
  const sneaking = Input.sneaking();
  state.sneaking = sneaking;
  state.movingFast = !sneaking && (mv.x !== 0 || mv.y !== 0);

  const speed = sneaking ? CONFIG.playerSneakSpeed : CONFIG.playerWalkSpeed;
  if (mv.x !== 0 || mv.y !== 0) {
    p.facing = Math.atan2(mv.y, mv.x);
    World.moveCircle(p, mv.x * speed * dt, mv.y * speed * dt);
    if (sneaking) SoundEngine.footstep();
    else if (Math.random() < dt * 2) SoundEngine.footstep();
  }

  // Smoke bomb: Q drops a cloud that blinds every cone for a few seconds.
  if (Input.down('KeyQ') && p.smokeBombs > 0 && !state.qPressed) {
    state.qPressed = true;
    p.smokeBombs -= 1;
    state.smokes.push({ x: p.x, y: p.y, radius: CONFIG.smokeRadius, ttl: CONFIG.smokeSeconds });
    SoundEngine.smokePuff();
  }
  if (!Input.down('KeyQ')) state.qPressed = false;

  // Loot: E (hold) or a mouse click near a piece.
  const click = Input.consumeClick();
  const near = nearestLoot(p, state, CONFIG.playerGrabReach + 26);
  if (near) {
    if (near.lockpick) {
      if (Input.interacting() || (click && World.dist(click.x, click.y, near.x, near.y) < 70)) {
        p.lockpickProgress += dt / CONFIG.lockpickSeconds;
        p.lockpickTarget = near;
        if (Math.random() < dt * 6) SoundEngine.lockpickTick();
        if (p.lockpickProgress >= 1) {
          takeLoot(near, state);
          p.lockpickProgress = 0;
          p.lockpickTarget = null;
          state.alarm = Math.min(100, state.alarm + 10);
          SoundEngine.caseOpen();
        }
      } else {
        p.lockpickProgress = Math.max(0, p.lockpickProgress - dt * 1.5);
        if (p.lockpickProgress <= 0) p.lockpickTarget = null;
      }
    } else if (Input.interacting() || click) {
      takeLoot(near, state);
      SoundEngine.pickup();
    }
  } else {
    p.lockpickProgress = Math.max(0, p.lockpickProgress - dt * 1.5);
    if (p.lockpickProgress <= 0) p.lockpickTarget = null;
  }

  // The exit: only counts once the Star Sapphire is in hand.
  if (p.hasSapphire && World.pointInRect(p.x, p.y, EXIT_DOOR)) {
    state.screen = 'win';
    state.winStats = {
      loot: p.lootValue,
      time: state.time,
      timeBonus: Math.max(0, Math.round((CONFIG.timeBonusCapSeconds - state.time) * CONFIG.timeBonusPerSecond)),
    };
    state.winStats.score =
      state.winStats.loot + state.winStats.timeBonus + p.smokeBombs * 25;
    SoundEngine.winFanfare();
  }

  // Smoke clouds fade.
  for (let i = state.smokes.length - 1; i >= 0; i--) {
    state.smokes[i].ttl -= dt;
    if (state.smokes[i].ttl <= 0) state.smokes.splice(i, 1);
  }
}

function takeLoot(loot, state) {
  loot.taken = true;
  const p = state.player;
  p.lootValue += loot.value;
  p.lootCount += 1;
  if (loot.kind === 'sapphire') {
    p.hasSapphire = true;
    state.message = 'Star Sapphire secured — get to the exit!';
    state.messageTimer = 3;
  } else {
    state.message = loot.name + ' pocketed (+$' + loot.value + ')';
    state.messageTimer = 2;
  }
}
