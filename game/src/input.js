// Midnight Gallery — input: keyboard and mouse state shared by the game.
// Arrow keys and space never scroll the page while the game has focus.
const Input = {
  keys: {},
  mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 },
  anyKey: false,

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) {
        this.keys[e.code] = true;
        this.anyKey = true;
        SoundEngine.unlock();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    window.addEventListener('blur', () => {
      this.keys = {};
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.clickX = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.clickY = (e.clientY - r.top) * (canvas.height / r.height);
      this.mouse.clicked = true;
      SoundEngine.unlock();
    });
  },

  down(code) {
    return !!this.keys[code];
  },

  // Movement vector from WASD or the arrow keys, normalized.
  moveVector() {
    let x = 0;
    let y = 0;
    if (this.down('KeyA') || this.down('ArrowLeft')) x -= 1;
    if (this.down('KeyD') || this.down('ArrowRight')) x += 1;
    if (this.down('KeyW') || this.down('ArrowUp')) y -= 1;
    if (this.down('KeyS') || this.down('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  },

  sneaking() {
    return this.down('ShiftLeft') || this.down('ShiftRight');
  },

  interacting() {
    return this.down('KeyE');
  },

  consumeClick() {
    if (!this.mouse.clicked) return null;
    this.mouse.clicked = false;
    return { x: this.mouse.clickX, y: this.mouse.clickY };
  },
};
