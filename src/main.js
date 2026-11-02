import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWorld, updateWorld, drawScreen, LAYOUT } from './scene.js';
import { Oliver } from './oliver.js';
import { Audience } from './audience.js';
import { Particles, Projectiles } from './fx.js';
import { Audio } from './audio.js';
import { BY_TIER, LINES, CHEERS, FAILS, MYTHIC, GAME_OVER } from './words.js';

// ---------- renderer / scene ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.18;

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
const CAM_BASE = new THREE.Vector3(2.6, 7.4, 15.5);
camera.position.copy(CAM_BASE);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.55, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const audio = new Audio();
const world = buildWorld(scene);
const oliver = new Oliver(scene);
oliver.cam.copy(CAM_BASE);
const audience = new Audience(scene, world, audio);
const fire = new Particles(scene, 6000, { additive: true, soft: true });
const confetti = new Particles(scene, 2500, { additive: false, soft: false });
const smoke = new Particles(scene, 800, { additive: false, soft: true });
const projectiles = new Projectiles(scene, confetti, audio);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h); composer.setSize(w, h); bloom.resolution.set(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const ui = {
  hud: $('hud'), menu: $('menu'), over: $('over'), score: $('score'), multi: $('multi'), powerFill: $('powerFill'),
  level: $('levelTag'), crowd: $('crowd'), combo: $('combo'), flash: $('flash'), bubble: $('bubble'),
  card: $('wordCard'), word: $('word'), timerFill: $('timerFill'), best: $('best'), stats: $('stats'), quote: $('overQuote'),
  optMusic: $('optMusic'), optVoice: $('optVoice'),
};
ui.best.textContent = (+localStorage.getItem('oliverBest') || 0).toLocaleString();

function flash(text, color = '#fff') {
  ui.flash.textContent = text; ui.flash.style.color = color;
  ui.flash.classList.remove('show'); void ui.flash.offsetWidth; ui.flash.classList.add('show');
}

// ---------- game state ----------
const G = {
  state: 'menu', score: 0, combo: 0, bestCombo: 0, power: 60, level: 1, words: 0, misses: 0, maxCrowd: 0,
  word: null, idx: 0, errors: 0, timeLeft: 0, timeTotal: 1, line: '', recent: [], mythic: false, shake: 0, gap: 0,
  intro: [], pyroTimer: 0, screenTimer: 0, crazy: 0, overTimer: 0,
};

function pickWord() {
  if (G.intro.length) return G.intro.shift();
  const lv = G.level;
  const w = [Math.max(0.08, 1 - (lv - 1) * 0.16), Math.min(1, 0.35 + (lv - 1) * 0.15), Math.min(1.1, Math.max(0, (lv - 2) * 0.18))];
  let r = Math.random() * (w[0] + w[1] + w[2]), tier = 1;
  if (r > w[0]) tier = r > w[0] + w[1] ? 3 : 2;
  let word;
  do { word = BY_TIER[tier][(Math.random() * BY_TIER[tier].length) | 0]; } while (G.recent.includes(word.text));
  G.recent.push(word.text); if (G.recent.length > 60) G.recent.shift();
  return word;
}

function speak(text) {
  if (!ui.optVoice.checked || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.rate = 1.12; u.pitch = 0.85 + G.crazy * 0.5; u.volume = 0.9;
  speechSynthesis.speak(u);
}

function nextWord() {
  G.word = pickWord(); G.idx = 0; G.errors = 0;
  const speed = Math.max(0.42, 1 - (G.level - 1) * 0.065);
  G.timeTotal = G.timeLeft = (1.7 + G.word.text.length * 0.36) * speed + (G.word.tier === 3 ? 0.6 : 0);
  G.line = LINES[(Math.random() * LINES.length) | 0];
  ui.bubble.innerHTML = G.line.replace('{w}', `<b>${G.word.text}</b>`);
  speak(G.line.replace('{w}', G.word.text));
  renderWord(); refreshScreen();
}

function renderWord() {
  const t = G.word.text;
  ui.word.innerHTML = `<span class="done">${t.slice(0, G.idx)}</span><span class="cur">${t[G.idx] === ' ' ? '&nbsp;' : (t[G.idx] || '')}</span><span class="rest">${t.slice(G.idx + 1)}</span>`;
}

function refreshScreen(title) {
  drawScreen(world, {
    word: G.state === 'menu' ? 'PRESS ENTER' : (G.word ? G.word.text : ''), typed: G.state === 'playing' ? G.idx : 0,
    mythic: G.mythic, combo: G.combo, level: G.level, t: performance.now() / 1000,
    title: title || (G.mythic ? 'MYTHICAL COACH POWER · POINTS x10' : undefined),
  });
}

function updateHud() {
  ui.score.textContent = G.score.toLocaleString();
  ui.multi.textContent = G.mythic ? 'x10 MYTHICAL' : 'x1';
  ui.multi.classList.toggle('mythic', G.mythic);
  ui.combo.textContent = `COMBO ${G.combo}${G.combo >= 10 ? ' 🔥' : ''}`;
  ui.combo.classList.toggle('mythic', G.mythic);
  ui.powerFill.style.width = `${Math.max(0, G.power)}%`;
  ui.powerFill.classList.toggle('low', G.power < 30 && !G.mythic);
  ui.powerFill.classList.toggle('mythic', G.mythic);
  ui.level.textContent = `LEVEL ${G.level}`;
  ui.crowd.textContent = audience.count;
  ui.card.classList.toggle('mythic', G.mythic);
}

// ---------- FX helpers ----------
function pyro(i, power = 1) {
  const p = world.pyros[i]; p.burn = Math.max(p.burn, 0.6 + power * 0.5);
  for (let k = 0; k < 32 * power; k++) {
    fire.emit('fire', p.x + rnd(-0.15, 0.15), p.y, p.z + rnd(-0.15, 0.15), rnd(-0.5, 0.5), rnd(7, 12) * (0.7 + power * 0.3), rnd(-0.5, 0.5), rnd(0.5, 1.0), rnd(0.35, 0.7));
  }
  for (let k = 0; k < 25 * power; k++) fire.emit('spark', p.x, p.y + 0.3, p.z, rnd(-3, 3), rnd(6, 13), rnd(-3, 3), rnd(0.8, 1.6), rnd(0.06, 0.12));
  for (let k = 0; k < 10 * power; k++) smoke.emit('smoke', p.x + rnd(-0.5, 0.5), p.y + rnd(3, 6), p.z, rnd(-0.4, 0.4), rnd(0.3, 1), rnd(-0.3, 0.3), rnd(2, 4), rnd(1.2, 2.2));
}
function pyroAll(power) { world.pyros.forEach((_, i) => pyro(i, power)); audio.whoosh(power > 1); G.shake = Math.max(G.shake, 0.15 * power); }

const CONF_COLS = [0xff2a6d, 0x05d9e8, 0xffd000, 0x39ff9a, 0xb14aff, 0xffffff].map(c => new THREE.Color(c));
function confettiBurst(n) {
  for (let k = 0; k < n; k++) {
    confetti.emit('confetti', rnd(-11, 11), rnd(10, 12.5), rnd(-6, 9), rnd(-1, 1), rnd(-1, 0), rnd(-1, 1), rnd(5, 8), rnd(0.06, 0.1), CONF_COLS[(Math.random() * CONF_COLS.length) | 0]);
  }
}
const rnd = (a, b) => a + Math.random() * (b - a);

function throwStuff(n) {
  for (let k = 0; k < n; k++) {
    const target = new THREE.Vector3(oliver.pos.x + rnd(-1.4, 1.4), LAYOUT.stageTop + 0.2, oliver.pos.z + rnd(-1, 1.2));
    setTimeout(() => audience.throwAt(projectiles, target, landed => {
      if (Math.hypot(landed.x - oliver.pos.x, landed.z - oliver.pos.z) < 1.0) {
        oliver.hit(); G.shake = Math.max(G.shake, 0.25);
        if (G.state === 'playing') { G.power -= 2; updateHud(); }
      }
    }), k * 220);
  }
}

// ---------- rules ----------
function startGame() {
  audio.init(); audio.setEnabled(ui.optMusic.checked);
  Object.assign(G, { state: 'playing', score: 0, combo: 0, bestCombo: 0, power: 60, level: 1, words: 0, misses: 0, mythic: false, crazy: 0, gap: 0 });
  G.intro = ['coffee', 'uber', 'tesla', 'performance', 'Elon Musk'].sort(() => Math.random() - 0.5).map(text => ({ text, tier: text.length <= 6 ? 1 : 2 }));
  audience.reset(64);
  G.maxCrowd = audience.count;
  ui.menu.classList.add('hidden'); ui.over.classList.add('hidden'); ui.hud.classList.remove('hidden');
  flash("IT'S SHOWTIME!", '#ffe14d');
  audience.cheer(1.5); audio.applause(2); pyroAll(1);
  nextWord(); updateHud();
}

function typo() {
  G.errors++; G.misses++;
  const wasMythic = G.mythic;
  G.combo = 0; G.mythic = false;
  G.power -= 3 + G.level * 0.5;
  audio.error();
  ui.card.classList.remove('err'); void ui.card.offsetWidth; ui.card.classList.add('err');
  if (wasMythic) { flash('MYTHIC POWER LOST', '#ff4060'); refreshScreen(); }
  if (Math.random() < 0.35) throwStuff(1);
  if (Math.random() < 0.25) audience.leave(1);
  if (Math.random() < 0.3) audience.boo();
  updateHud(); checkOver();
}

function timeout() {
  G.misses++;
  G.combo = 0; G.mythic = false;
  G.power -= 12 + G.level * 1.5;
  audio.boo(); audience.boo();
  audience.leave(1 + ((Math.random() * 3) | 0) + (G.power < 30 ? 2 : 0));
  throwStuff(1 + ((Math.random() * 2) | 0) + (G.power < 30 ? 1 : 0));
  flash('TOO SLOW!', '#ff4060');
  ui.bubble.textContent = FAILS[(Math.random() * FAILS.length) | 0];
  updateHud();
  if (!checkOver()) G.gap = 0.9;
}

function completeWord() {
  const clean = G.errors === 0;
  const w = G.word;
  G.words++;
  if (clean) {
    G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo);
    const becameMythic = G.combo >= 10 && !G.mythic;
    if (G.combo >= 10) G.mythic = true;
    const mult = G.mythic ? 10 : 1;
    const pts = Math.round((40 + w.text.length * 10) * w.tier * (1 + G.timeLeft / G.timeTotal)) * mult;
    G.score += pts;
    G.power = Math.min(100, G.power + 4 + w.tier + (G.mythic ? 2 : 0));
    audience.cheer(1 + G.combo / 5);
    audience.join(1 + (Math.random() < 0.5 ? 1 : 0) + (G.combo >= 5 ? 1 : 0) + (G.mythic ? 2 : 0));
    audio.success(G.combo); audio.applause(1 + G.combo / 5);
    oliver.cheer();
    if (becameMythic) {
      flash('🔥 MYTHICAL COACH POWER 🔥', '#ffb020');
      audio.mythic(); oliver.goWild(); pyroAll(2); confettiBurst(900); G.shake = 0.6;
      ui.bubble.textContent = MYTHIC[(Math.random() * MYTHIC.length) | 0];
    } else if (G.mythic) {
      pyroAll(0.8); confettiBurst(200);
    } else {
      pyro(G.combo % 2 ? 1 : 2, 0.5 + G.combo * 0.06);
      if (G.combo % 5 === 0) { flash(`COMBO x${G.combo}!`, '#39ff9a'); confettiBurst(500); pyroAll(1); }
    }
  } else {
    G.score += Math.round(20 + w.text.length * 4);
    G.power = Math.min(100, G.power + 1);
    audio.applause(0.3); audience.cheer(0.3);
  }
  if (G.words % 8 === 0) { G.level++; flash(`LEVEL ${G.level}`, '#7fffff'); audio.levelUp(); }
  G.maxCrowd = Math.max(G.maxCrowd, audience.count);
  updateHud(); nextWord();
}

function checkOver() {
  if (G.power > 0) return false;
  G.power = 0; G.state = 'over'; G.mythic = false; G.overTimer = 1;
  setTimeout(() => { G.overTimer = 0; ui.over.classList.remove('hidden'); ui.hud.classList.add('hidden'); }, 2200);
  audio.gameOver(); audience.boo();
  audience.leave(Math.ceil(audience.count * 0.6)); throwStuff(6);
  flash('BOOOOO!', '#ff4060');
  ui.bubble.textContent = 'Wait... where is everybody going?!';
  const best = Math.max(G.score, +localStorage.getItem('oliverBest') || 0);
  localStorage.setItem('oliverBest', best); ui.best.textContent = best.toLocaleString();
  ui.quote.textContent = GAME_OVER[(Math.random() * GAME_OVER.length) | 0];
  ui.stats.innerHTML = `Score <b>${G.score.toLocaleString()}</b><br>Words nailed <b>${G.words}</b> &middot; Misses <b>${G.misses}</b><br>
    Best combo <b>${G.bestCombo}</b> &middot; Level <b>${G.level}</b><br>Peak audience <b>${G.maxCrowd}</b> &middot; Best ever <b>${best.toLocaleString()}</b>`;
  if (window.speechSynthesis) speechSynthesis.cancel();
  updateHud();
  return true;
}

window.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (G.state !== 'playing') {
    if (e.key === 'Enter' && (G.state === 'menu' || (G.state === 'over' && G.overTimer <= 0))) startGame();
    return;
  }
  if (e.key.length !== 1) return;
  e.preventDefault();
  if (G.gap > 0 || !G.word) return;
  const expected = G.word.text[G.idx].toLowerCase();
  if (e.key.toLowerCase() === expected) {
    G.idx++; audio.key();
    const hp = new THREE.Vector3(); oliver.handWorld(G.idx % 2, hp);
    for (let k = 0; k < 6; k++) fire.emit('spark', hp.x, hp.y, hp.z, rnd(-2, 2), rnd(1, 4), rnd(-2, 2), rnd(0.3, 0.6), 0.07);
    if (G.idx >= G.word.text.length) completeWord();
    else { renderWord(); refreshScreen(); }
  } else typo();
});
$('startBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', startGame);
ui.optMusic.addEventListener('change', () => audio.setEnabled(ui.optMusic.checked));

// ---------- main loop ----------
const timer = new THREE.Timer();
const look = new THREE.Vector3(0, 2.8, -2.5);
const tmp = new THREE.Vector3();
let attractTimer = 3;
refreshScreen();

function frame(now) {
  timer.update(now);
  const dt = Math.min(timer.getDelta(), 0.05), t = timer.getElapsed();

  if (G.state === 'playing') {
    if (G.gap > 0) { G.gap -= dt; if (G.gap <= 0) nextWord(); }
    else {
      G.timeLeft -= dt;
      ui.timerFill.style.width = `${Math.max(0, G.timeLeft / G.timeTotal) * 100}%`;
      if (G.timeLeft <= 0) timeout();
    }
    G.crazy += (Math.min(1, G.combo / 10) - G.crazy) * Math.min(1, dt * 2);
    if (G.mythic) {
      G.pyroTimer -= dt;
      if (G.pyroTimer <= 0) { G.pyroTimer = 0.9; pyro((Math.random() * 4) | 0, 0.8); }
      G.screenTimer -= dt;
      if (G.screenTimer <= 0) { G.screenTimer = 0.1; refreshScreen(); }
    }
  } else if (G.state === 'menu') {
    attractTimer -= dt;
    G.crazy = 0.25 + Math.sin(t * 0.3) * 0.25;
    if (attractTimer <= 0) { attractTimer = rnd(3, 6); audience.cheer(0.8); pyro((Math.random() * 4) | 0, 0.7); }
  } else if (G.state === 'over') {
    G.crazy *= 0.95;
  }

  const power01 = G.state === 'menu' ? 0.8 : Math.max(0, G.power) / 100;

  // Oliver on fire
  if (G.mythic) {
    // flames lick up around his silhouette (outside the body), crown of fire on the head, burning hands
    const n = Math.ceil(dt * 110);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, r = rnd(0.55, 0.85);
      fire.emit('fire', oliver.root.position.x + Math.cos(a) * r, oliver.root.position.y + rnd(0.6, 2.0), oliver.root.position.z + Math.sin(a) * r,
        rnd(-0.3, 0.3), rnd(2, 4), rnd(-0.3, 0.3), rnd(0.4, 0.8), rnd(0.25, 0.45));
    }
    oliver.headWorld(tmp);
    for (let k = 0; k < Math.ceil(dt * 70); k++) fire.emit('fire', tmp.x + rnd(-0.18, 0.18), tmp.y + 0.38, tmp.z + rnd(-0.18, 0.18), 0, rnd(2, 3.5), 0, rnd(0.3, 0.55), rnd(0.25, 0.45));
    for (let i = 0; i < 2; i++) { oliver.handWorld(i, tmp); for (let k = 0; k < Math.ceil(dt * 35); k++) fire.emit('fire', tmp.x, tmp.y + 0.1, tmp.z, rnd(-0.3, 0.3), rnd(1, 2.5), rnd(-0.3, 0.3), rnd(0.2, 0.4), rnd(0.18, 0.3)); }
  }

  oliver.update(dt, t, { crazy: G.crazy, mythic: G.mythic, power: power01, talking: G.state !== 'over' });
  audience.update(dt, t, oliver.root.position);
  updateWorld(world, dt, t, { oliver: oliver.pos, mythic: G.mythic, crazy: G.crazy, power: power01, excite: audience.excite });
  projectiles.update(dt);
  fire.update(dt); confetti.update(dt); smoke.update(dt);
  if (G.state === 'playing' && ((t * 4) | 0) !== frame.lastCrowd) { frame.lastCrowd = (t * 4) | 0; ui.crowd.textContent = audience.count; G.maxCrowd = Math.max(G.maxCrowd, audience.count); }
  audio.music(G.state === 'playing', G.crazy, G.mythic);

  // camera
  G.shake = Math.max(0, G.shake - dt * 1.5);
  const sway = G.state === 'menu' ? Math.sin(t * 0.15) * 4 : Math.sin(t * 0.1) * 1.2;
  camera.position.set(CAM_BASE.x + sway + (Math.random() - 0.5) * G.shake, CAM_BASE.y + (Math.random() - 0.5) * G.shake - (G.mythic ? 0.8 : 0), CAM_BASE.z - (G.mythic ? 1.5 : 0));
  look.x += (oliver.pos.x * 0.45 - look.x) * Math.min(1, dt * 2);
  look.y += ((G.mythic ? 3.2 : 2.8) - look.y) * Math.min(1, dt * 2);
  camera.lookAt(look);
  oliver.cam.copy(camera.position);
  const targetFov = G.mythic ? 38 : 42;
  if (Math.abs(camera.fov - targetFov) > 0.01) { camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 2); camera.updateProjectionMatrix(); }
  const ps = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  fire.setScale(ps); confetti.setScale(ps); smoke.setScale(ps);
  bloom.strength = 0.75 + (G.mythic ? 0.12 : 0) + G.crazy * 0.08;
  renderer.toneMappingExposure += ((G.mythic ? 0.9 : 1.1) - renderer.toneMappingExposure) * Math.min(1, dt * 2);

  composer.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
