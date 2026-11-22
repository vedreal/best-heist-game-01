// Midnight Gallery — main: the game loop and the state machine.
// Screens: title -> playing -> caught | win, with pause. A ?scene= query
// stages a frozen moment for screenshots; otherwise the game plays live.
function createGameState() {
  return {
    screen: 'title',
    time: 0,
    alarm: 0,
    smokes: [],
    message: '',
    messageTimer: 0,
    cameraSpotted: false,
    caughtReason: '',
    winStats: null,
    sneaking: false,
    movingFast: false,
    qPressed: false,
    frozen: false,
    player: createPlayer(),
    guards: createGuards(),
    cameras: createCameras(),
    loot: LOOT_DEFS.map((d) => ({ ...d, taken: false })),
  };
}

function resetGame(state) {
  const fresh = createGameState();
  for (const k of Object.keys(fresh)) state[k] = fresh[k];
  state.screen = 'playing';
}

function updateGame(dt, state) {
  state.time += dt;
  state.cameraSpotted = false;
  updatePlayer(dt, state);
  if (state.screen !== 'playing') return;
  updateGuards(dt, state);
  if (state.screen !== 'playing') return;
  updateCameras(dt, state);
  if (state.screen !== 'playing') return;
  if (state.messageTimer > 0) state.messageTimer -= dt;
  // The alarm cools down whenever nobody is watching.
  const watched = state.guards.some((g) => g.chasing) || state.cameraSpotted;
  if (!watched) {
    state.alarm = Math.max(0, state.alarm - CONFIG.alarmDecay * dt);
  }
  if (state.alarm >= CONFIG.alarmCaughtAt) {
    state.caughtReason = 'The alarm hit 100% — the gallery locked down.';
    state.screen = 'caught';
    SoundEngine.caughtSting();
  }
}

function startGame() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const state = createGameState();
  Input.init(canvas);

  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  if (scene) {
    applyScenePreset(scene, state);
    drawGame(ctx, state);
    return state;
  }

  let last = performance.now();
  let prevKeys = {};
  function pressed(code) {
    const isDown = Input.down(code);
    const wasDown = !!prevKeys[code];
    prevKeys[code] = isDown;
    return isDown && !wasDown;
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (pressed('Enter') && state.screen === 'title') {
      resetGame(state);
      SoundEngine.unlock();
      SoundEngine.startAmbient();
    }
    if (pressed('KeyR') && (state.screen === 'caught' || state.screen === 'win')) {
      resetGame(state);
    }
    if (pressed('KeyP') && state.screen === 'playing') {
      state.screen = 'paused';
    } else if (pressed('KeyP') && state.screen === 'paused') {
      state.screen = 'playing';
    }
    if (pressed('KeyM')) {
      SoundEngine.toggleMute();
    }
    if (state.screen === 'playing' && !state.frozen) {
      updateGame(dt, state);
    }
    drawGame(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return state;
}

window.addEventListener('DOMContentLoaded', () => {
  startGame();
});
