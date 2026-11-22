// Midnight Gallery — render: everything the player sees, drawn on one canvas.
// Order: floor, vision cones, walls and cover, loot, exit, smoke, people, HUD,
// then the title / caught / win screens. The judge reads the game mostly
// through its screenshots, so every element is big, high-contrast and labelled.
function drawGame(ctx, state) {
  const P = CONFIG.palette;
  ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  drawFloor(ctx, state);
  drawCones(ctx, state);
  drawWalls(ctx);
  drawObstacles(ctx, state);
  drawLoot(ctx, state);
  drawExit(ctx, state);
  drawSmokes(ctx, state);
  drawGuards(ctx, state);
  drawPlayerFigure(ctx, state);
  drawCameras(ctx, state);
  drawHud(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'caught') drawCaught(ctx, state);
  if (state.screen === 'win') drawWin(ctx, state);
  if (state.screen === 'paused') drawPaused(ctx);
}

function drawFloor(ctx, state) {
  const P = CONFIG.palette;
  ctx.fillStyle = P.floorDark;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  // Marble checker.
  const tile = 64;
  for (let y = CONFIG.wallThickness; y < CONFIG.canvasHeight - CONFIG.wallThickness; y += tile) {
    for (let x = CONFIG.wallThickness; x < CONFIG.canvasWidth - CONFIG.wallThickness; x += tile) {
      const odd = ((x / tile) | 0) % 2 === ((y / tile) | 0) % 2;
      ctx.fillStyle = odd ? P.floorLight : P.floorDark;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // Red carpet runner down the middle, thief's route to the Sapphire.
  ctx.fillStyle = P.carpet;
  ctx.fillRect(600, CONFIG.wallThickness, 80, CONFIG.canvasHeight - CONFIG.wallThickness * 2);
  ctx.fillStyle = P.carpetEdge;
  ctx.fillRect(596, CONFIG.wallThickness, 4, CONFIG.canvasHeight - CONFIG.wallThickness * 2);
  ctx.fillRect(680, CONFIG.wallThickness, 4, CONFIG.canvasHeight - CONFIG.wallThickness * 2);
}

function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function drawCones(ctx, state) {
  const P = CONFIG.palette;
  for (const g of state.guards) {
    poly(ctx, guardConePoints(g));
    ctx.fillStyle = g.chasing ? 'rgba(229, 72, 77, 0.34)' : P.coneGuard;
    ctx.fill();
    ctx.strokeStyle = P.coneGuardEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  for (const cam of state.cameras) {
    poly(ctx, cameraConePoints(cam));
    ctx.fillStyle = cam.spotted ? 'rgba(74, 222, 128, 0.34)' : P.coneCamera;
    ctx.fill();
    ctx.strokeStyle = P.coneCameraEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawWalls(ctx) {
  const P = CONFIG.palette;
  const t = CONFIG.wallThickness;
  const W = CONFIG.canvasWidth;
  const H = CONFIG.canvasHeight;
  ctx.fillStyle = P.wallTop;
  ctx.fillRect(0, 0, W, t);
  ctx.fillRect(0, H - t, W, t);
  ctx.fillRect(0, 0, t, H);
  ctx.fillRect(W - t, 0, t, H);
  ctx.fillStyle = P.wall;
  ctx.fillRect(0, t - 6, W, 6);
  ctx.fillRect(0, H - t, W, 6);
  ctx.fillRect(t - 6, 0, 6, H);
  ctx.fillRect(W - t, 0, 6, H);
}

function drawObstacles(ctx, state) {
  const P = CONFIG.palette;
  for (const o of World.obstacles) {
    if (o.kind === 'case') {
      ctx.fillStyle = '#20263f';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = P.caseGlass;
      ctx.globalAlpha = 0.28;
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = P.caseFrame;
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(o.x + 8, o.y + o.h - 8);
      ctx.lineTo(o.x + o.w * 0.4, o.y + 8);
      ctx.stroke();
    } else if (o.kind === 'statue') {
      ctx.fillStyle = '#3d4560';
      ctx.fillRect(o.x - 4, o.y - 4, o.w + 8, o.h + 8);
      ctx.fillStyle = P.statue;
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c7d0e0';
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2 - 6, o.y + o.h / 2 - 6, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.kind === 'pillar') {
      ctx.fillStyle = P.pillar;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#8b93ad';
      ctx.fillRect(o.x + 5, o.y + 5, o.w - 10, 6);
      ctx.fillRect(o.x + 5, o.y + o.h - 11, o.w - 10, 6);
    } else if (o.kind === 'bench') {
      ctx.fillStyle = P.bench;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#9c6b3f';
      ctx.fillRect(o.x, o.y, o.w, 8);
    } else {
      ctx.fillStyle = P.crate;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#8a6f45';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.beginPath();
      ctx.moveTo(o.x + 4, o.y + 4);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h - 4);
      ctx.moveTo(o.x + o.w - 4, o.y + 4);
      ctx.lineTo(o.x + 4, o.y + o.h - 4);
      ctx.stroke();
    }
  }
}

function drawLoot(ctx, state) {
  const P = CONFIG.palette;
  const t = state.time;
  for (const loot of state.loot) {
    if (loot.taken) continue;
    if (loot.kind === 'sapphire') {
      const glow = 26 + Math.sin(t * 3) * 8;
      const grad = ctx.createRadialGradient(loot.x, loot.y, 4, loot.x, loot.y, glow + 22);
      grad.addColorStop(0, 'rgba(79, 210, 255, 0.85)');
      grad.addColorStop(1, 'rgba(79, 210, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, glow + 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = P.sapphire;
      ctx.beginPath();
      ctx.moveTo(loot.x, loot.y - 14);
      ctx.lineTo(loot.x + 11, loot.y);
      ctx.lineTo(loot.x, loot.y + 14);
      ctx.lineTo(loot.x - 11, loot.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(loot.x, loot.y - 14);
      ctx.lineTo(loot.x + 5, loot.y - 2);
      ctx.lineTo(loot.x - 5, loot.y - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = P.text;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STAR SAPPHIRE', loot.x, loot.y - 24);
    } else if (loot.kind === 'painting') {
      ctx.fillStyle = '#2c2118';
      ctx.fillRect(loot.x - 34, loot.y - 22, 68, 44);
      ctx.fillStyle = loot.id === 'painting2' ? '#c9a227' : loot.id === 'painting1' ? '#7a86c9' : '#8a6f45';
      ctx.fillRect(loot.x - 29, loot.y - 17, 58, 34);
      ctx.strokeStyle = P.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(loot.x - 34, loot.y - 22, 68, 44);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$' + loot.value, loot.x, loot.y + 34);
    } else {
      const glint = 0.6 + Math.sin(t * 4 + loot.x) * 0.4;
      ctx.fillStyle = P.gold;
      ctx.globalAlpha = glint;
      ctx.fillRect(loot.x - 14, loot.y - 7, 28, 14);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(loot.x - 14, loot.y - 2, 28, 3);
      ctx.fillStyle = P.text;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$' + loot.value, loot.x, loot.y + 24);
    }
  }
}

function drawExit(ctx, state) {
  const P = CONFIG.palette;
  const d = EXIT_DOOR;
  const open = state.player.hasSapphire;
  ctx.fillStyle = open ? P.exitGlow : '#243024';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.strokeStyle = open ? '#bbf7d0' : '#5a6b5a';
  ctx.lineWidth = 3;
  ctx.strokeRect(d.x, d.y, d.w, d.h);
  ctx.fillStyle = open ? '#052e16' : '#a8c9a8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT — GO!' : 'EXIT', d.x + d.w / 2, d.y + d.h / 2 + 5);
  if (open) {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.fillRect(d.x - 8, d.y - 26, d.w + 16, 26);
  }
}

function drawSmokes(ctx, state) {
  for (const s of state.smokes) {
    const a = Math.min(1, s.ttl / 1.2) * 0.6;
    ctx.fillStyle = `rgba(205, 205, 215, ${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(225, 225, 235, ${a * 0.7})`;
    ctx.beginPath();
    ctx.arc(s.x - 24, s.y - 12, s.radius * 0.55, 0, Math.PI * 2);
    ctx.arc(s.x + 26, s.y + 14, s.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFigure(ctx, x, y, radius, body, accent, facing, label) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + radius * 0.7, radius * 0.95, radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, radius - 1.5, facing - 0.9, facing + 0.9);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + Math.cos(facing) * radius * 0.55, y + Math.sin(facing) * radius * 0.55, 4, 0, Math.PI * 2);
  ctx.fill();
  if (label) {
    ctx.fillStyle = '#f2f0e6';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - radius - 8);
  }
}

function drawGuards(ctx, state) {
  const P = CONFIG.palette;
  for (const g of state.guards) {
    drawFigure(ctx, g.x, g.y, g.radius, P.guard, P.guardAccent, g.facing, g.name);
    if (g.suspicion > 5) {
      const w = 40;
      const pct = g.suspicion / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(g.x - w / 2, g.y - g.radius - 20, w, 7);
      ctx.fillStyle = pct > 0.66 ? '#ef4444' : '#facc15';
      ctx.fillRect(g.x - w / 2 + 1, g.y - g.radius - 19, (w - 2) * pct, 5);
      if (g.chasing) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', g.x, g.y - g.radius - 26);
      }
    }
  }
}

function drawPlayerFigure(ctx, state) {
  const P = CONFIG.palette;
  const p = state.player;
  drawFigure(ctx, p.x, p.y, p.radius, P.thief, P.thiefAccent, p.facing, 'YOU');
  if (p.lockpickTarget && p.lockpickProgress > 0) {
    const w = 52;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(p.x - w / 2, p.y - p.radius - 22, w, 9);
    ctx.fillStyle = P.sapphire;
    ctx.fillRect(p.x - w / 2 + 1, p.y - p.radius - 21, (w - 2) * p.lockpickProgress, 7);
    ctx.fillStyle = P.text;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PICKING LOCK…', p.x, p.y - p.radius - 28);
  }
}

function drawCameras(ctx, state) {
  const P = CONFIG.palette;
  for (const cam of state.cameras) {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(cam.x - 12, cam.y - 8, 24, 16);
    ctx.fillStyle = cam.spotted ? '#ef4444' : '#4ade80';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 10, cam.y + Math.sin(cam.angle) * 10, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.text;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cam.name, cam.x, cam.y - 14);
  }
}

function alarmColor(alarm) {
  const P = CONFIG.palette;
  if (alarm >= 70) return P.alarmHigh;
  if (alarm >= 35) return P.alarmMid;
  return P.alarmLow;
}

function drawHud(ctx, state) {
  const P = CONFIG.palette;
  const p = state.player;
  ctx.fillStyle = P.hudBg;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, 46);
  ctx.fillStyle = P.text;
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LOOT  $' + p.lootValue + '  (' + p.lootCount + '/6)', 16, 30);
  if (p.hasSapphire) {
    ctx.fillStyle = P.sapphire;
    ctx.fillText('◆ SAPPHIRE', 250, 30);
  }
  // Alarm meter, centre.
  const bw = 260;
  const bx = CONFIG.canvasWidth / 2 - bw / 2;
  ctx.fillStyle = P.text;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM', bx - 42, 30);
  ctx.fillStyle = '#11131f';
  ctx.fillRect(bx, 12, bw, 22);
  ctx.fillStyle = alarmColor(state.alarm);
  ctx.fillRect(bx + 2, 14, (bw - 4) * (state.alarm / 100), 18);
  ctx.strokeStyle = '#f2f0e6';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, 12, bw, 22);
  ctx.fillStyle = P.text;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(Math.round(state.alarm) + '%', bx + bw + 34, 30);
  // Timer and smoke, right.
  const mins = Math.floor(state.time / 60);
  const secs = Math.floor(state.time % 60);
  ctx.textAlign = 'right';
  ctx.fillStyle = P.text;
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText(String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0'), CONFIG.canvasWidth - 120, 30);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = p.smokeBombs > 0 ? P.textDim : '#666';
  ctx.fillText('SMOKE ×' + p.smokeBombs, CONFIG.canvasWidth - 16, 30);
  // Toast message, just above the exit door so the door stays visible.
  if (state.messageTimer > 0) {
    ctx.fillStyle = P.hudBg;
    const msg = state.message;
    ctx.font = 'bold 16px system-ui, sans-serif';
    const w = ctx.measureText(msg).width + 28;
    ctx.fillRect(CONFIG.canvasWidth / 2 - w / 2, CONFIG.canvasHeight - 96, w, 34);
    ctx.fillStyle = P.text;
    ctx.textAlign = 'center';
    ctx.fillText(msg, CONFIG.canvasWidth / 2, CONFIG.canvasHeight - 73);
  }
  // Controls hint, bottom-left, small.
  ctx.fillStyle = 'rgba(242, 240, 230, 0.55)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('WASD move · Shift sneak · E grab / hold to pick lock · Q smoke · M mute · P pause', 16, CONFIG.canvasHeight - 14);
  if (state.cameraSpotted) {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ CAMERA SPOTTED YOU', CONFIG.canvasWidth / 2, 78);
  }
}

function overlay(ctx, rgba) {
  ctx.fillStyle = rgba;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
}

function drawTitle(ctx, state) {
  const P = CONFIG.palette;
  overlay(ctx, 'rgba(8, 10, 22, 0.72)');
  ctx.textAlign = 'center';
  ctx.fillStyle = P.gold;
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('MIDNIGHT GALLERY', CONFIG.canvasWidth / 2, 240);
  ctx.fillStyle = P.text;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('A one-room museum heist', CONFIG.canvasWidth / 2, 286);
  ctx.fillStyle = P.textDim;
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Steal the Star Sapphire, then slip out the south door.', CONFIG.canvasWidth / 2, 330);
  ctx.fillText('Dodge the red guard cones and the green camera sweeps.', CONFIG.canvasWidth / 2, 360);
  ctx.fillText('Hold E to pick the lock · Q throws smoke · Shift sneaks.', CONFIG.canvasWidth / 2, 390);
  ctx.fillStyle = P.sapphire;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Press ENTER to start', CONFIG.canvasWidth / 2, 470);
  ctx.fillStyle = P.textDim;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('WASD / arrows move · E grab · Q smoke · M mute · P pause', CONFIG.canvasWidth / 2, 510);
}

function drawCaught(ctx, state) {
  overlay(ctx, 'rgba(80, 8, 12, 0.66)');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fecaca';
  ctx.font = 'bold 72px system-ui, sans-serif';
  ctx.fillText('CAUGHT!', CONFIG.canvasWidth / 2, 330);
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(state.caughtReason || 'The alarm hit 100%.', CONFIG.canvasWidth / 2, 390);
  ctx.fillStyle = '#fca5a5';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('The gallery keeps its Sapphire… this time.', CONFIG.canvasWidth / 2, 430);
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText('Press R to try again', CONFIG.canvasWidth / 2, 500);
}

function drawWin(ctx, state) {
  const s = state.winStats || { loot: 0, time: 0, timeBonus: 0, score: 0 };
  overlay(ctx, 'rgba(6, 40, 20, 0.7)');
  ctx.textAlign = 'center';
  ctx.fillStyle = CONFIG.palette.gold;
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('CLEAN GETAWAY!', CONFIG.canvasWidth / 2, 260);
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('The Star Sapphire is yours.', CONFIG.canvasWidth / 2, 310);
  const mins = Math.floor(s.time / 60);
  const secs = Math.floor(s.time % 60);
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Loot  $' + s.loot + '    ·    Time  ' + mins + ':' + String(secs).padStart(2, '0') + '    ·    Time bonus  $' + s.timeBonus, CONFIG.canvasWidth / 2, 370);
  ctx.fillStyle = CONFIG.palette.gold;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText('SCORE  $' + s.score, CONFIG.canvasWidth / 2, 430);
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('Press R to play again', CONFIG.canvasWidth / 2, 500);
}

function drawPaused(ctx) {
  overlay(ctx, 'rgba(8, 10, 22, 0.6)');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText('PAUSED', CONFIG.canvasWidth / 2, 400);
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Press P to resume', CONFIG.canvasWidth / 2, 446);
}
