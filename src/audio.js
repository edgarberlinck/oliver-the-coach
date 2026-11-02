// All sounds are synthesized with WebAudio — no assets required.
export class Audio {
  constructor() { this.ctx = null; this.enabled = true; }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(this.ctx.destination);
    this.noise = this._noiseBuffer(2);
    this.applauseBuf = this._applauseBuffer(2.4);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.22;
    this.musicGain.connect(this.master);
    this._nextBeat = 0; this._step = 0;
  }

  setEnabled(v) {
    this.enabled = v;
    if (this.master) this.master.gain.value = v ? 0.7 : 0;
  }

  _noiseBuffer(sec) {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * sec, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  _applauseBuffer(sec) {
    const sr = this.ctx.sampleRate, b = this.ctx.createBuffer(2, sr * sec, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      const claps = 260 * sec;
      for (let c = 0; c < claps; c++) {
        const start = Math.floor(Math.pow(Math.random(), 1.4) * (d.length - 2000));
        const len = 300 + Math.random() * 900, amp = 0.2 + Math.random() * 0.4;
        for (let i = 0; i < len; i++) d[start + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (len * 0.25));
      }
      for (let i = 0; i < d.length; i++) d[i] *= Math.min(1, (d.length - i) / (sr * 0.8)) * 0.5;
    }
    return b;
  }

  _env(node, t, a, peak, dec) {
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }

  _osc(type, freq, t, dur, vol, dest = this.master) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    this._env(g, t, 0.005, vol, dur);
    o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  _noise(t, dur, vol, filterType, freq, q = 1, dest = this.master) {
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain(); this._env(g, t, 0.005, vol, dur);
    s.connect(f).connect(g).connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    return f;
  }

  get ok() { return this.ctx && this.enabled; }

  key() { if (!this.ok) return; const t = this.ctx.currentTime; this._noise(t, 0.03, 0.25, 'highpass', 3500); this._osc('square', 1800 + Math.random() * 300, t, 0.02, 0.03); }

  error() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    this._osc('sawtooth', 110, t, 0.25, 0.25); this._osc('square', 116, t, 0.25, 0.15);
  }

  success(combo) {
    if (!this.ok) return; const t = this.ctx.currentTime;
    const base = 523.25 * Math.pow(2, Math.min(combo, 12) / 12);
    [0, 4, 7, 12].forEach((s, i) => this._osc('triangle', base * Math.pow(2, s / 12), t + i * 0.05, 0.25, 0.12));
  }

  applause(intensity = 1) {
    if (!this.ok) return; const t = this.ctx.currentTime;
    const s = this.ctx.createBufferSource(); s.buffer = this.applauseBuf;
    const g = this.ctx.createGain(); g.gain.value = Math.min(1.2, 0.25 + intensity * 0.35);
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 600;
    s.playbackRate.value = 0.9 + Math.random() * 0.2;
    s.connect(f).connect(g).connect(this.master); s.start(t);
    if (intensity > 1.5) { // whoo!
      for (let i = 0; i < 3; i++) {
        const o = this.ctx.createOscillator(), og = this.ctx.createGain(), tt = t + 0.1 + Math.random() * 0.5;
        o.type = 'sine'; o.frequency.setValueAtTime(700 + Math.random() * 300, tt);
        o.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 400, tt + 0.15);
        o.frequency.exponentialRampToValueAtTime(600, tt + 0.6);
        this._env(og, tt, 0.05, 0.05, 0.55); o.connect(og).connect(this.master); o.start(tt); o.stop(tt + 0.7);
      }
    }
  }

  boo() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
      const tt = t + Math.random() * 0.2, base = 130 + Math.random() * 60;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(base, tt); o.frequency.linearRampToValueAtTime(base * 0.75, tt + 0.9);
      f.type = 'lowpass'; f.frequency.value = 700;
      this._env(g, tt, 0.15, 0.08, 0.85);
      o.connect(f).connect(g).connect(this.master); o.start(tt); o.stop(tt + 1.1);
    }
  }

  whoosh(big = false) {
    if (!this.ok) return; const t = this.ctx.currentTime;
    const f = this._noise(t, big ? 1.2 : 0.6, big ? 0.9 : 0.5, 'lowpass', 300, 2);
    f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(big ? 3000 : 1800, t + 0.15);
    f.frequency.exponentialRampToValueAtTime(300, t + (big ? 1.2 : 0.6));
    this._osc('sine', 55, t, big ? 0.8 : 0.4, big ? 0.6 : 0.3);
  }

  splat() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    this._noise(t, 0.18, 0.6, 'lowpass', 900, 3);
    const o = this._osc('sine', 180, t, 0.15, 0.3); o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  }

  door() { if (!this.ok) return; const t = this.ctx.currentTime; this._noise(t, 0.25, 0.15, 'bandpass', 400, 4); }

  mythic() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    [0, 3, 7, 10, 12, 15, 19, 24].forEach((s, i) => this._osc('sawtooth', 220 * Math.pow(2, s / 12), t + i * 0.07, 0.5, 0.09));
    this.whoosh(true);
  }

  // Big shimmering major-chord swell for the Steve transformation.
  jobsChime() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = 261.63 * Math.pow(2, s / 12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.4 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 3.3);
    });
    this.whoosh(true);
  }

  levelUp() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    [0, 7, 12].forEach((s, i) => this._osc('square', 440 * Math.pow(2, s / 12), t + i * 0.1, 0.2, 0.06));
  }

  gameOver() {
    if (!this.ok) return; const t = this.ctx.currentTime;
    [7, 6, 5, 0].forEach((s, i) => this._osc('triangle', 220 * Math.pow(2, s / 12), t + i * 0.35, i === 3 ? 1.2 : 0.3, 0.2));
    this.boo();
  }

  // Simple driving keynote beat; tempo & intensity scale with game state.
  // Steve mode swaps to a calm, minimal piano-ish keynote groove.
  music(playing, intensity, mythic, jobs = false) {
    if (!this.ok || !playing) return;
    const ctx = this.ctx, bpm = jobs ? 96 : mythic ? 128 : 112, spb = 60 / bpm / 2;
    if (this._nextBeat < ctx.currentTime) this._nextBeat = ctx.currentTime + 0.05;
    while (this._nextBeat < ctx.currentTime + 0.2) {
      const t = this._nextBeat, s = this._step % 16;
      if (jobs) {
        if (s % 8 === 0) { const o = this._osc('sine', 90, t, 0.4, 0.6, this.musicGain); o.frequency.exponentialRampToValueAtTime(45, t + 0.3); }
        if (s % 4 === 2) this._noise(t, 0.03, 0.06, 'highpass', 9000, 1, this.musicGain);
        const prog = [0, 0, 5, 5, -3, -3, 7, 7][Math.floor(this._step / 16) % 8];
        if (s % 4 === 0) [0, 4, 7].forEach(n => this._osc('sine', 261.63 * Math.pow(2, (n + prog) / 12), t, 0.6, 0.035, this.musicGain));
        if (s % 2 === 1) this._osc('triangle', 523.25 * Math.pow(2, ([12, 7, 4, 7][(s >> 1) % 4] + prog) / 12), t, 0.25, 0.025, this.musicGain);
        this._nextBeat += spb; this._step++;
        continue;
      }
      if (s % 4 === 0) { const o = this._osc('sine', 120, t, 0.25, 0.9, this.musicGain); o.frequency.exponentialRampToValueAtTime(40, t + 0.2); }
      if (s % 2 === 1 || mythic) this._noise(t, 0.04, intensity * 0.25 + 0.05, 'highpass', 7000, 1, this.musicGain);
      if (s === 4 || s === 12) this._noise(t, 0.15, 0.35, 'bandpass', 1800, 0.8, this.musicGain);
      const prog = [0, 0, -4, -4, -2, -2, 3, 3][Math.floor(this._step / 8) % 8];
      if (s % 2 === 0) this._osc('sawtooth', 55 * Math.pow(2, prog / 12), t, 0.18, 0.18, this.musicGain);
      if (mythic && s % 2 === 0) this._osc('square', 440 * Math.pow(2, ([0, 7, 12, 15][(s / 2) % 4] + prog) / 12), t, 0.1, 0.05, this.musicGain);
      this._nextBeat += spb; this._step++;
    }
  }
}
