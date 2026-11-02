import * as THREE from 'three';

const VERT = `
attribute vec4 aColor; attribute float aSize;
varying vec4 vColor;
uniform float uScale;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
varying vec4 vColor; uniform float uSoft;
void main() {
  vec2 p = gl_PointCoord - 0.5; float d = length(p);
  float a = uSoft > 0.5 ? smoothstep(0.5, 0.0, d) : step(abs(p.x), 0.5 - abs(p.y) * 0.3) * 1.0;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * a);
}`;

const tmpC = new THREE.Color();
const FIRE_STOPS = [[1, 0.85, 0.45], [1, 0.55, 0.12], [0.95, 0.22, 0.03], [0.5, 0.05, 0.02], [0.05, 0.02, 0.02]];
function fireColor(t, out) {
  const f = Math.min(t, 0.999) * (FIRE_STOPS.length - 1), i = Math.floor(f), k = f - i;
  const a = FIRE_STOPS[i], b = FIRE_STOPS[i + 1];
  out[0] = a[0] + (b[0] - a[0]) * k; out[1] = a[1] + (b[1] - a[1]) * k; out[2] = a[2] + (b[2] - a[2]) * k;
}

export class Particles {
  constructor(scene, max, { additive = true, soft = true } = {}) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 4);
    this.size = new Float32Array(max);
    this.p = [];
    this.free = [];
    for (let i = max - 1; i >= 0; i--) this.free.push(i);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uScale: { value: 400 }, uSoft: { value: soft ? 1 : 0 } },
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.geo = g;
    scene.add(this.points);
  }

  setScale(v) { this.mat.uniforms.uScale.value = v; }

  // kind: 'fire' | 'spark' | 'smoke' | 'confetti' | 'splat' | 'glow'
  emit(kind, x, y, z, vx, vy, vz, life, size, color) {
    if (!this.free.length) return;
    const i = this.free.pop();
    this.p.push({ i, kind, x, y, z, vx, vy, vz, age: 0, life, size, color, spin: Math.random() * 6.28 });
  }

  update(dt) {
    const c = [0, 0, 0];
    for (let n = this.p.length - 1; n >= 0; n--) {
      const p = this.p[n];
      p.age += dt;
      const t = p.age / p.life, i = p.i;
      if (t >= 1) {
        this.size[i] = 0; this.col[i * 4 + 3] = 0;
        this.free.push(i); this.p[n] = this.p[this.p.length - 1]; this.p.pop();
        continue;
      }
      let alpha = 1, size = p.size;
      switch (p.kind) {
        case 'fire':
          p.vy += 3.5 * dt; p.vx *= 0.96; p.vz *= 0.96;
          p.vx += (Math.random() - 0.5) * 6 * dt; p.vz += (Math.random() - 0.5) * 6 * dt;
          fireColor(t, c); alpha = Math.pow(1 - t, 1.5) * 0.38; size = p.size * (0.6 + Math.sin(t * Math.PI) * 0.8);
          break;
        case 'spark':
          p.vy -= 9.8 * dt; fireColor(t * 0.6, c); alpha = 1 - t; size = p.size * (1 - t * 0.5);
          if (p.y < 1.2 && p.y > 0.9 && Math.abs(p.z + 4) < 5 && p.vy < 0) p.vy *= -0.4;
          break;
        case 'smoke':
          p.vy += 0.4 * dt; p.vx *= 0.98; c[0] = c[1] = c[2] = 0.1; alpha = Math.sin(t * Math.PI) * 0.12; size = p.size * (1 + t * 1.5);
          break;
        case 'confetti': {
          p.vy = Math.max(p.vy - 4 * dt, -1.6); p.vx *= 0.98; p.vz *= 0.98;
          p.vx += Math.sin(p.age * 5 + p.spin) * 2 * dt;
          tmpC.copy(p.color); const fl = 0.55 + 0.45 * Math.abs(Math.sin(p.age * 9 + p.spin));
          c[0] = tmpC.r * fl; c[1] = tmpC.g * fl; c[2] = tmpC.b * fl; alpha = Math.min(1, (1 - t) * 4);
          if (p.y < 0.05) { p.vy = 0; p.vx = p.vz = 0; }
          break;
        }
        case 'splat':
          p.vy -= 12 * dt; tmpC.copy(p.color); c[0] = tmpC.r; c[1] = tmpC.g; c[2] = tmpC.b; alpha = 1 - t * t;
          if (p.y < 1.22 && p.vy < 0 && p.z < 0.2) { p.vy = 0; p.vx *= 0.5; p.vz *= 0.5; p.y = 1.22; }
          break;
        case 'glow':
          tmpC.copy(p.color); c[0] = tmpC.r; c[1] = tmpC.g; c[2] = tmpC.b; alpha = Math.sin(t * Math.PI); size = p.size * (0.5 + t);
          break;
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.col[i * 4] = c[0]; this.col[i * 4 + 1] = c[1]; this.col[i * 4 + 2] = c[2]; this.col[i * 4 + 3] = alpha;
      this.size[i] = size;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
  }
}

// ---------- Thrown objects ----------
function makeThrowable(type) {
  const g = new THREE.Group();
  if (type === 'tomato') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe0201a, roughness: 0.35 }));
    m.scale.y = 0.85; g.add(m);
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.06, 5), new THREE.MeshStandardMaterial({ color: 0x2a8a20 }));
    s.position.y = 0.14; g.add(s);
  } else if (type === 'shoe') {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.5 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.34), mat); g.add(b);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.12), mat); h.position.set(0, 0.08, -0.1); g.add(h);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.35), new THREE.MeshStandardMaterial({ color: 0xeeeeee })); sole.position.y = -0.06; g.add(sole);
  } else if (type === 'banana') {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: 0xffd93a, roughness: 0.5 }));
    g.add(m);
  } else if (type === 'cup') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.22, 14), new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.6 }));
    g.add(m);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 14), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    lid.position.y = 0.12; g.add(lid);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.08, 0.08, 14), new THREE.MeshStandardMaterial({ color: 0x00704a }));
    g.add(band);
  } else {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.9, flatShading: true }));
    g.add(m);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

const SPLAT_COLORS = { tomato: 0xd01810, banana: 0xffe060, cup: 0x6b3b1a, shoe: 0x553311, paper: 0xffffff };

export class Projectiles {
  constructor(scene, particles, audio) {
    this.scene = scene; this.fx = particles; this.audio = audio; this.list = []; this.debris = [];
  }

  throw(from, target, onLand) {
    const types = ['tomato', 'tomato', 'tomato', 'shoe', 'banana', 'cup', 'paper'];
    const type = types[(Math.random() * types.length) | 0];
    const obj = makeThrowable(type);
    obj.position.copy(from);
    this.scene.add(obj);
    const T = 0.9 + Math.random() * 0.4, g = -9.8;
    const v = new THREE.Vector3().subVectors(target, from).divideScalar(T);
    v.y = (target.y - from.y - 0.5 * g * T * T) / T;
    this.list.push({ obj, v, t: 0, T, type, target: target.clone(), onLand, spin: new THREE.Vector3(Math.random() * 12, Math.random() * 12, Math.random() * 12) });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.t += dt; p.v.y -= 9.8 * dt;
      p.obj.position.addScaledVector(p.v, dt);
      p.obj.rotation.x += p.spin.x * dt; p.obj.rotation.y += p.spin.y * dt; p.obj.rotation.z += p.spin.z * dt;
      if (p.t >= p.T) {
        const pos = p.obj.position;
        const col = new THREE.Color(SPLAT_COLORS[p.type]);
        const n = p.type === 'tomato' ? 40 : 14;
        for (let k = 0; k < n; k++) {
          const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
          this.fx.emit('splat', pos.x, pos.y + 0.05, pos.z, Math.cos(a) * s, 1 + Math.random() * 3, Math.sin(a) * s, 0.6 + Math.random() * 0.8, 0.07 + Math.random() * 0.08, col);
        }
        this.audio.splat();
        if (p.onLand) p.onLand(pos.clone());
        // leave it on the stage as debris
        p.obj.position.y = 1.25; p.obj.rotation.set(Math.random() * 0.3, Math.random() * 6, p.type === 'tomato' ? 0 : Math.PI / 2);
        if (p.type === 'tomato') p.obj.scale.set(1.6, 0.35, 1.6);
        this.debris.push({ obj: p.obj, life: 7 });
        this.list.splice(i, 1);
      }
    }
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i]; d.life -= dt;
      if (d.life < 1) d.obj.scale.multiplyScalar(1 - dt * 3);
      if (d.life <= 0) {
        this.scene.remove(d.obj);
        d.obj.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
        this.debris.splice(i, 1);
      }
    }
  }
}
