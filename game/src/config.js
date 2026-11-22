// Midnight Gallery — configuration: room layout, palette, tuning, patrols.
// Every number the game uses lives here so the other files stay readable.
const CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 800,
  wallThickness: 44,

  playerRadius: 14,
  playerWalkSpeed: 178,
  playerSneakSpeed: 96,
  playerGrabReach: 46,

  guardSpeed: 74,
  guardChaseSpeed: 138,
  guardVisionRange: 235,
  guardVisionHalfAngle: 0.61,
  guardSweepDegrees: 42,
  guardIdleSeconds: 1.6,

  cameraVisionRange: 275,
  cameraVisionHalfAngle: 0.44,
  cameraSweepDegrees: 52,
  cameraSweepSeconds: 3.4,

  detectRate: 58,
  sneakDetectFactor: 0.45,
  runDetectFactor: 1.45,
  suspicionDecay: 30,
  chaseAlarmRate: 26,
  cameraAlarmRate: 30,
  alarmDecay: 4.5,
  alarmCaughtAt: 100,

  lockpickSeconds: 2.5,
  smokeSeconds: 4,
  smokeRadius: 95,
  smokeBombsStart: 2,

  // The big score: the Star Sapphire in the glass case at the room's heart.
  sapphireValue: 500,
  timeBonusPerSecond: 10,
  timeBonusCapSeconds: 600,

  palette: {
    floorDark: '#1b1e33',
    floorLight: '#232743',
    carpet: '#5a2e3a',
    carpetEdge: '#8a5a3b',
    wall: '#3a3f5e',
    wallTop: '#4a5070',
    caseGlass: '#9fd8e8',
    caseFrame: '#c9a227',
    statue: '#8f9bb0',
    pillar: '#6b7390',
    bench: '#7a5230',
    crate: '#6e5636',
    gold: '#ffd94a',
    sapphire: '#4fd2ff',
    thief: '#22242e',
    thiefAccent: '#e5484d',
    guard: '#2c4a6b',
    guardAccent: '#d8dee9',
    coneGuard: 'rgba(229, 72, 77, 0.20)',
    coneGuardEdge: 'rgba(229, 72, 77, 0.55)',
    coneCamera: 'rgba(74, 222, 128, 0.18)',
    coneCameraEdge: 'rgba(74, 222, 128, 0.55)',
    smoke: 'rgba(200, 200, 210, 0.55)',
    exitGlow: '#4ade80',
    hudBg: 'rgba(10, 12, 24, 0.82)',
    text: '#f2f0e6',
    textDim: '#a8adc9',
    alarmLow: '#4ade80',
    alarmMid: '#facc15',
    alarmHigh: '#ef4444',
  },
};

// The museum floor: rectangles the thief, guards and sight lines must go around.
// x, y are the top-left corner; w, h the size. All inside the 44px walls.
const OBSTACLES = [
  { x: 580, y: 240, w: 120, h: 70, kind: 'case', label: 'Star Sapphire case' },
  { x: 150, y: 200, w: 90, h: 60, kind: 'case', label: 'Vase case' },
  { x: 1040, y: 200, w: 90, h: 60, kind: 'case', label: 'Relic case' },
  { x: 300, y: 360, w: 52, h: 52, kind: 'statue', label: 'Marble statue' },
  { x: 928, y: 360, w: 52, h: 52, kind: 'statue', label: 'Marble statue' },
  { x: 300, y: 560, w: 44, h: 44, kind: 'pillar', label: 'Pillar' },
  { x: 936, y: 560, w: 44, h: 44, kind: 'pillar', label: 'Pillar' },
  { x: 480, y: 640, w: 130, h: 34, kind: 'bench', label: 'Bench' },
  { x: 670, y: 640, w: 130, h: 34, kind: 'bench', label: 'Bench' },
  { x: 150, y: 520, w: 70, h: 70, kind: 'crate', label: 'Crate' },
  { x: 1060, y: 520, w: 70, h: 70, kind: 'crate', label: 'Crate' },
];

// Loot scattered around the room. The sapphire needs a lockpick hold;
// paintings and gold bars are grabbed instantly with E or a click.
const LOOT_DEFS = [
  { id: 'sapphire', kind: 'sapphire', x: 640, y: 275, value: 500, name: 'Star Sapphire', lockpick: true },
  { id: 'painting1', kind: 'painting', x: 250, y: 66, value: 120, name: 'Moonlit Portrait' },
  { id: 'painting2', kind: 'painting', x: 1030, y: 66, value: 120, name: 'Golden Landscape' },
  { id: 'painting3', kind: 'painting', x: 66, y: 420, value: 100, name: 'Old Captain' },
  { id: 'gold1', kind: 'gold', x: 185, y: 665, value: 150, name: 'Gold bars' },
  { id: 'gold2', kind: 'gold', x: 1095, y: 665, value: 150, name: 'Gold bars' },
];

// Three guards walk loops of waypoints and sweep their gaze at each stop.
const GUARD_DEFS = [
  {
    name: 'Raka',
    waypoints: [[180, 150], [640, 150], [1100, 150], [1100, 450], [640, 450], [180, 450]],
  },
  {
    name: 'Sinta',
    waypoints: [[180, 700], [640, 700], [1100, 700], [1150, 620], [640, 620], [180, 620]],
  },
  {
    name: 'Bimo',
    waypoints: [[640, 360], [640, 480], [420, 480], [420, 360]],
  },
];

// Two wall cameras sweep their green cones across the room.
const CAMERA_DEFS = [
  { name: 'Cam A', x: 640, y: 52, baseAngle: Math.PI / 2, sweep: 0.9 },
  { name: 'Cam B', x: 1228, y: 400, baseAngle: Math.PI, sweep: 0.8 },
];

const EXIT_DOOR = { x: 600, y: 756, w: 80, h: 44 };
const PLAYER_SPAWN = { x: 640, y: 700 };
