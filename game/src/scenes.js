// Midnight Gallery — scenes: staged moments for the screenshots, reached as
// ?scene=cover|title|smoke|escape. Each one is a real render of the game's
// own code in a frozen state, never an edited or borrowed image.
function applyScenePreset(name, state) {
  const p = state.player;
  if (name === 'cover') {
    // The money frame: the thief mid-room, two guard cones crossing near
    // them, a camera cone sweeping in, the Sapphire glowing, alarm at 34%.
    state.screen = 'playing';
    state.frozen = true;
    state.time = 72;
    state.alarm = 34;
    p.x = 560;
    p.y = 470;
    p.facing = -Math.PI / 2;
    p.lootValue = 120;
    p.lootCount = 1;
    state.loot.find((l) => l.id === 'painting1').taken = true;
    const raka = state.guards[0];
    raka.x = 420;
    raka.y = 380;
    raka.facing = 0.35;
    raka.suspicion = 55;
    const bimo = state.guards[2];
    bimo.x = 700;
    bimo.y = 560;
    bimo.facing = Math.atan2(470 - 560, 560 - 700);
    bimo.suspicion = 20;
    const sinta = state.guards[1];
    sinta.x = 980;
    sinta.y = 660;
    sinta.facing = Math.PI;
    const camA = state.cameras[0];
    camA.angle = Math.PI / 2 + 0.45;
    const camB = state.cameras[1];
    camB.angle = Math.PI - 0.4;
    state.message = 'Grab the Sapphire, then slip out the south door!';
    state.messageTimer = 99;
  } else if (name === 'smoke') {
    // The getaway tool in action: a smoke cloud blinds a guard mid-chase.
    state.screen = 'playing';
    state.frozen = true;
    state.time = 145;
    state.alarm = 58;
    p.x = 640;
    p.y = 400;
    p.facing = Math.PI / 2;
    p.lootValue = 270;
    p.lootCount = 2;
    p.smokeBombs = 1;
    state.loot.find((l) => l.id === 'painting1').taken = true;
    state.loot.find((l) => l.id === 'gold1').taken = true;
    state.smokes.push({ x: 640, y: 400, radius: CONFIG.smokeRadius, ttl: 99 });
    const bimo = state.guards[2];
    bimo.x = 640;
    bimo.y = 500;
    bimo.facing = -Math.PI / 2;
    bimo.suspicion = 90;
    bimo.chasing = true;
    bimo.state = 'chase';
    const raka = state.guards[0];
    raka.x = 420;
    raka.y = 300;
    raka.facing = 0.5;
    const camA = state.cameras[0];
    camA.angle = Math.PI / 2 - 0.5;
    state.message = 'Smoke out! The cones cannot see through it.';
    state.messageTimer = 99;
  } else if (name === 'escape') {
    // The payoff: Sapphire in hand, thief at the glowing exit, a guard close.
    state.screen = 'playing';
    state.frozen = true;
    state.time = 203;
    state.alarm = 71;
    p.x = 640;
    p.y = 736;
    p.facing = Math.PI / 2;
    p.lootValue = 770;
    p.lootCount = 4;
    p.hasSapphire = true;
    p.smokeBombs = 0;
    for (const l of state.loot) {
      if (l.id === 'sapphire' || l.id === 'painting2' || l.id === 'gold2') l.taken = true;
    }
    const raka = state.guards[0];
    raka.x = 640;
    raka.y = 580;
    raka.facing = Math.PI / 2;
    raka.chasing = true;
    raka.state = 'chase';
    raka.suspicion = 100;
    const sinta = state.guards[1];
    sinta.x = 420;
    sinta.y = 700;
    sinta.facing = 0;
    const camB = state.cameras[1];
    camB.angle = Math.PI + 0.35;
    state.message = 'GO! The exit is open — run!';
    state.messageTimer = 99;
  } else if (name === 'title') {
    state.screen = 'title';
    state.frozen = true;
  }
}
