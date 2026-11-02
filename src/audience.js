import * as THREE from 'three';
import { LAYOUT } from './scene.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

const G = {
  torso: new THREE.CapsuleGeometry(0.22, 0.38, 4, 12),
  head: new THREE.SphereGeometry(0.17, 16, 12),
  hairShort: new THREE.SphereGeometry(0.178, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
  hairLong: new THREE.SphereGeometry(0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.75),
  cap: new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16),
  arm: new THREE.CapsuleGeometry(0.06, 0.34, 4, 8).translate(0, -0.22, 0),
  leg: new THREE.CapsuleGeometry(0.075, 0.6, 4, 8).translate(0, -0.38, 0),
  glasses: new THREE.BoxGeometry(0.22, 0.04, 0.03),
};
const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
const SHIRTS = [0x2266ff, 0xff3366, 0x22aa66, 0xffaa22, 0x8844ff, 0xeeeeee, 0x222222, 0x00aacc, 0xcc2222, 0xff77bb, 0x557733, 0x996633].map(mat);
const SKINS = [0xf6d2b0, 0xe8b88a, 0xc68b59, 0x8d5524, 0x5a3412].map(mat);
const HAIRS = [0x1a1008, 0x3a2410, 0x7a4a20, 0xd8b060, 0x888888, 0xc03010].map(mat);
const PANTS = [0x1a2440, 0x222222, 0x3a3a50, 0x4a3a2a].map(mat);
const DARK = mat(0x050505);

class Person {
  constructor(scene) {
    this.g = new THREE.Group();
    this.hips = new THREE.Group(); this.g.add(this.hips);
    const shirt = pick(SHIRTS), skin = pick(SKINS), hair = pick(HAIRS), pants = pick(PANTS);
    this.torso = new THREE.Mesh(G.torso, shirt); this.torso.position.y = 0.38; this.hips.add(this.torso);
    this.head = new THREE.Group(); this.head.position.y = 0.88; this.hips.add(this.head);
    this.head.add(new THREE.Mesh(G.head, skin));
    const style = Math.random();
    if (style < 0.5) { const h = new THREE.Mesh(G.hairShort, hair); h.position.y = 0.02; this.head.add(h); }
    else if (style < 0.8) { const h = new THREE.Mesh(G.hairLong, hair); h.position.set(0, 0.0, -0.02); this.head.add(h); }
    else if (style < 0.9) { const c = new THREE.Mesh(G.cap, pick(SHIRTS)); c.position.y = 0.13; this.head.add(c); }
    if (Math.random() < 0.3) { const gl = new THREE.Mesh(G.glasses, DARK); gl.position.set(0, 0.02, 0.16); this.head.add(gl); }
    this.arms = [-1, 1].map(s => { const a = new THREE.Mesh(G.arm, shirt); a.position.set(s * 0.27, 0.62, 0); a.userData.s = s; this.hips.add(a); return a; });
    this.legs = [-1, 1].map(s => { const l = new THREE.Mesh(G.leg, pants); l.position.set(s * 0.1, 0, 0); this.hips.add(l); return l; });
    const sc = rnd(0.9, 1.1); this.g.scale.setScalar(sc);
    scene.add(this.g);
    this.state = 'seated'; this.seat = null; this.path = null; this.speed = rnd(2.6, 3.6);
    this.cheerT = 0; this.booT = 0; this.throwT = 0; this.phase = Math.random() * 10; this.sit = 1; this.walk = 0;
  }
}

export class Audience {
  constructor(scene, world, audio) {
    this.scene = scene; this.world = world; this.audio = audio;
    this.people = []; this.pending = [];
    this.excite = 0.3;
    this.reset(64);
  }

  reset(n) {
    for (const p of this.people) this.scene.remove(p.g);
    this.people = []; this.pending = [];
    for (const s of this.world.seats) s.person = null;
    const seats = [...this.world.seats].sort(() => Math.random() - 0.5).slice(0, n);
    for (const s of seats) this._seat(new Person(this.scene), s);
  }

  _seat(p, seat) {
    p.seat = seat; seat.person = p; p.state = 'seated'; p.sit = 1;
    p.g.position.set(seat.x, seat.y, seat.z + 0.08); p.g.rotation.y = Math.PI;
    if (!this.people.includes(p)) this.people.push(p);
  }

  get count() { return this.people.filter(p => p.state !== 'leaving').length; }

  join(n) {
    const L = LAYOUT;
    let joined = 0;
    for (let k = 0; k < n; k++) {
      const empty = this.world.seats.filter(s => !s.person);
      if (!empty.length) break;
      // fill from the front & center first, with some randomness
      empty.sort((a, b) => (a.row + Math.abs(a.x) * 0.15 + Math.random() * 3) - (b.row + Math.abs(b.x) * 0.15 + Math.random() * 3));
      const seat = empty[0];
      const p = new Person(this.scene); this.people.push(p);
      p.seat = seat; seat.person = p; p.state = 'entering'; p.sit = 0;
      const delay = k * 0.45;
      p.g.position.set(L.doorX + 1.6 + delay * p.speed, 0, L.doorZ);
      p.path = [
        new THREE.Vector3(L.doorX - 0.8, 0, L.doorZ),
        new THREE.Vector3(L.aisleX, 0, L.frontAisleZ + 0.6),
        new THREE.Vector3(L.aisleX, seat.y, seat.z - 0.62),
        new THREE.Vector3(seat.x, seat.y, seat.z - 0.62),
        new THREE.Vector3(seat.x, seat.y, seat.z + 0.08),
      ];
      joined++;
    }
    return joined;
  }

  leave(n) {
    const L = LAYOUT;
    const seated = this.people.filter(p => p.state === 'seated').sort(() => Math.random() - 0.5);
    let left = 0;
    for (const p of seated.slice(0, n)) {
      const s = p.seat; s.person = null; p.seat = null;
      p.state = 'leaving'; p.booT = 0; p.cheerT = 0; p.speed = rnd(3.2, 4.2);
      p.path = [
        new THREE.Vector3(s.x, s.y, s.z - 0.62),
        new THREE.Vector3(L.aisleX, s.y, s.z - 0.62),
        new THREE.Vector3(L.aisleX, 0, L.frontAisleZ + 0.6),
        new THREE.Vector3(L.doorX - 0.8, 0, L.doorZ),
        new THREE.Vector3(L.doorX + 2.5, 0, L.doorZ),
      ];
      left++;
    }
    return left;
  }

  cheer(intensity) {
    this.excite = Math.min(1, this.excite + 0.15 * intensity);
    for (const p of this.people) if (p.state === 'seated' && Math.random() < 0.35 + 0.3 * intensity) p.cheerT = rnd(0.9, 1.6) * Math.min(2, intensity);
  }

  boo() {
    this.excite = Math.max(0, this.excite - 0.25);
    for (const p of this.people) if (p.state === 'seated' && Math.random() < 0.35) p.booT = rnd(1, 2);
  }

  // A random audience member throws something at `target` (Vector3). Returns true if someone threw.
  throwAt(projectiles, target, onLand) {
    const cands = this.people.filter(p => p.state === 'seated' && p.seat.row < 5);
    if (!cands.length) return false;
    const p = pick(cands);
    p.throwT = 0.45; p.cheerT = 0;
    this.pending.push({ p, t: 0.3, target: target.clone(), projectiles, onLand });
    return true;
  }

  update(dt, t, oliverPos) {
    this.excite += (0.3 - this.excite) * dt * 0.15;
    let doorBusy = false;
    const tmp = new THREE.Vector3();

    for (let i = this.pending.length - 1; i >= 0; i--) {
      const q = this.pending[i]; q.t -= dt;
      if (q.t <= 0) {
        q.p.arms[1].getWorldPosition(tmp); tmp.y += 0.4;
        q.projectiles.throw(tmp.clone(), q.target, q.onLand);
        this.pending.splice(i, 1);
      }
    }

    for (let i = this.people.length - 1; i >= 0; i--) {
      const p = this.people[i];
      const walking = p.state === 'entering' || p.state === 'leaving';
      if (walking && p.path) {
        const wp = p.path[0];
        const d = tmp.subVectors(wp, p.g.position); const len = d.length();
        const step = p.speed * dt;
        if (len <= step) {
          p.g.position.copy(wp); p.path.shift();
          if (!p.path.length) {
            if (p.state === 'entering') { this._seat(p, p.seat); p.cheerT = 1; }
            else { this.scene.remove(p.g); this.people.splice(i, 1); continue; }
          }
        } else {
          p.g.position.addScaledVector(d, step / len);
          const yaw = Math.atan2(d.x, d.z);
          let diff = yaw - p.g.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          p.g.rotation.y += diff * Math.min(1, dt * 10);
        }
        p.walk += dt * p.speed * 4;
        if (p.g.position.x > LAYOUT.doorX - 2.5) doorBusy = true;
      }

      // posture
      const targetSit = p.state === 'seated' && p.cheerT <= 0 ? 1 : 0;
      p.sit += (targetSit - p.sit) * Math.min(1, dt * 8);
      p.hips.position.y = 0.55 + (1 - p.sit) * 0.27;
      const sw = walking ? Math.sin(p.walk) * 0.6 : 0;
      p.legs[0].rotation.x = -p.sit * Math.PI / 2 + sw; p.legs[1].rotation.x = -p.sit * Math.PI / 2 - sw;
      p.legs[0].visible = p.legs[1].visible = p.sit < 0.95;

      let jump = 0, a0x = 0, a0z = 0, a1x = 0, a1z = 0;
      if (walking) {
        p.hips.position.y += Math.abs(Math.sin(p.walk)) * 0.05;
        a0x = -sw * 0.8; a1x = sw * 0.8;
        if (p.state === 'leaving') { a0x = -0.4; a1x = -0.4; } // grumpy stomp
      } else if (p.cheerT > 0) {
        p.cheerT -= dt;
        jump = Math.abs(Math.sin(t * 9 + p.phase)) * 0.3;
        a0x = -2.9 + Math.sin(t * 14 + p.phase) * 0.3; a1x = -2.9 + Math.cos(t * 14 + p.phase) * 0.3;
        a0z = -0.3; a1z = 0.3;
      } else if (p.throwT > 0) {
        p.throwT -= dt;
        const k = p.throwT / 0.45; a1x = k > 0.4 ? -2.6 * (1 - (k - 0.4) / 0.6) - 0.5 : -0.8 - k * 2;
      } else if (p.booT > 0) {
        p.booT -= dt;
        a0x = a1x = -1.3 + Math.sin(t * 20 + p.phase) * 0.25; a0z = 0.4; a1z = -0.4;
      } else {
        // idle: clap a bit depending on excitement
        const clap = this.excite > 0.45 ? Math.sin(t * 16 + p.phase) * 0.25 : 0;
        a0x = a1x = -0.6 * this.excite - 0.1; a0z = 0.2 + clap; a1z = -0.2 - clap;
      }
      p.arms[0].rotation.set(a0x, 0, a0z); p.arms[1].rotation.set(a1x, 0, a1z);
      p.hips.position.y += jump;
      p.torso.rotation.x = p.state === 'seated' ? Math.sin(t * 1.3 + p.phase) * 0.04 : 0;

      // look at Oliver
      if (p.state === 'seated') {
        const desired = Math.atan2(oliverPos.x - p.g.position.x, oliverPos.z - p.g.position.z);
        let rel = desired - p.g.rotation.y; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
        p.head.rotation.y += (THREE.MathUtils.clamp(rel, -1.1, 1.1) - p.head.rotation.y) * Math.min(1, dt * 3);
        p.head.rotation.x = p.booT > 0 ? 0.3 : -0.1;
      } else p.head.rotation.set(0, 0, 0);
    }

    const door = this.world.door;
    if (doorBusy && door.target === 0) this.audio.door();
    door.target = doorBusy ? 1 : 0;
  }
}
