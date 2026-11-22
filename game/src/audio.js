// Midnight Gallery — sound: every effect is synthesized with WebAudio,
// no audio files are shipped. Created lazily on the first gesture so the
// browser's autoplay policy never blocks the page.
const SoundEngine = {
  ctx: null,
  master: null,
  muted: false,
  ambientNodes: null,
  lastStepAt: 0,

  ensure() {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      return true;
    } catch (e) {
      return false;
    }
  },

  unlock() {
    if (this.ensure() && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  tone(freq, seconds, type, gain, slideTo) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + seconds);
      g.gain.setValueAtTime(gain || 0.12, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.02);
    } catch (e) {}
  },

  noise(seconds, filterFreq, gain) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq || 800;
      const g = this.ctx.createGain();
      g.gain.value = gain || 0.1;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      src.start(t0);
    } catch (e) {}
  },

  footstep() {
    const now = performance.now();
    if (now - this.lastStepAt < 260) return;
    this.lastStepAt = now;
    this.noise(0.07, 420, 0.05);
  },

  pickup() {
    this.tone(880, 0.12, 'sine', 0.14);
    setTimeout(() => this.tone(1318, 0.16, 'sine', 0.12), 70);
  },

  lockpickTick() {
    this.tone(1568, 0.05, 'square', 0.05);
  },

  caseOpen() {
    this.tone(523, 0.1, 'triangle', 0.12);
    setTimeout(() => this.tone(784, 0.14, 'triangle', 0.12), 90);
    setTimeout(() => this.tone(1046, 0.2, 'triangle', 0.12), 180);
  },

  smokePuff() {
    this.noise(0.5, 500, 0.16);
  },

  spottedBeep() {
    this.tone(1175, 0.09, 'square', 0.07);
  },

  alarmLoop() {
    this.tone(660, 0.22, 'sawtooth', 0.06, 440);
  },

  caughtSting() {
    this.tone(392, 0.3, 'sawtooth', 0.14, 196);
    setTimeout(() => this.tone(311, 0.5, 'sawtooth', 0.14, 155), 220);
  },

  winFanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => setTimeout(() => this.tone(f, 0.28, 'triangle', 0.14), i * 130));
  },

  startAmbient() {
    if (!this.ctx || this.ambientNodes || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 55;
      const g = this.ctx.createGain();
      g.gain.value = 0.035;
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.1;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      lfo.start();
      this.ambientNodes = { osc, lfo, g };
    } catch (e) {}
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  },
};
