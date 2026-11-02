import * as THREE from 'three';
import { LAYOUT } from './scene.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const lerpAngle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * k; };

export class Oliver {
  constructor(scene) {
    const skin = new THREE.MeshStandardMaterial({ color: 0xf0bf8f, roughness: 0.55 });
    const suit = new THREE.MeshPhysicalMaterial({ color: 0x1c2c55, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0x6080ff) });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.6 });
    const tie = new THREE.MeshStandardMaterial({ color: 0xd0103a, roughness: 0.35, metalness: 0.2 });
    const hairM = new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.5 });
    const blackGloss = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.15, metalness: 0.3 });
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const pantsM = new THREE.MeshStandardMaterial({ color: 0x151d38, roughness: 0.6 });
    const shoeM = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.15, metalness: 0.3 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xd8d8e0, roughness: 0.2, metalness: 1 });
    const stubble = new THREE.MeshStandardMaterial({ color: 0x6e6a66, roughness: 1, transparent: true, opacity: 0.85 });
    this.flashMats = [skin, suit, pantsM];
    this.mats = { suit, pantsM, shoeM, hairM };

    // Parts tagged 'o' only exist in Oliver's look, 'j' only in Steve Jobs mode.
    let tag = null;
    this.oliverOnly = []; this.jobsOnly = [];
    const mk = (geo, mat, x = 0, y = 0, z = 0, parent) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (parent || this.root).add(m);
      if (tag === 'o') this.oliverOnly.push(m);
      if (tag === 'j') { this.jobsOnly.push(m); m.visible = false; }
      return m;
    };

    this.root = new THREE.Group();
    this.root.scale.setScalar(1.45);
    this.body = new THREE.Group(); this.root.add(this.body);

    // legs
    this.legs = [];
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * 0.13, 0.95, 0); this.body.add(hip);
      mk(new THREE.CapsuleGeometry(0.1, 0.62, 6, 12), pantsM, 0, -0.42, 0, hip);
      mk(new THREE.BoxGeometry(0.16, 0.1, 0.32), shoeM, 0, -0.88, 0.06, hip);
      tag = 'j'; mk(new THREE.BoxGeometry(0.17, 0.035, 0.33), white, 0, -0.935, 0.06, hip); tag = null;
      this.legs.push(hip);
    }

    // torso
    this.torso = new THREE.Group(); this.torso.position.y = 0.95; this.body.add(this.torso);
    const jacket = mk(new THREE.CapsuleGeometry(0.3, 0.42, 8, 20), suit, 0, 0.42, 0, this.torso); jacket.scale.z = 0.72;
    tag = 'o';
    mk(new THREE.BoxGeometry(0.17, 0.34, 0.05), shirt, 0, 0.62, 0.2, this.torso);
    const tieM = mk(new THREE.BoxGeometry(0.07, 0.34, 0.02), tie, 0, 0.6, 0.235, this.torso); tieM.rotation.x = -0.08;
    mk(new THREE.BoxGeometry(0.1, 0.06, 0.03), tie, 0, 0.79, 0.23, this.torso);
    for (const y of [0.3, 0.42]) mk(new THREE.SphereGeometry(0.018, 8, 6), blackGloss, 0.05, y, 0.22, this.torso);
    // lapels
    for (const s of [-1, 1]) {
      const lap = mk(new THREE.BoxGeometry(0.08, 0.32, 0.03), suit, s * 0.12, 0.62, 0.215, this.torso); lap.rotation.z = s * 0.35;
    }
    // pocket square
    mk(new THREE.BoxGeometry(0.07, 0.04, 0.02), tie, 0.17, 0.62, 0.215, this.torso);
    tag = 'j';
    // turtleneck collar
    mk(new THREE.CylinderGeometry(0.125, 0.15, 0.14, 20), suit, 0, 0.86, 0, this.torso);
    tag = null;

    // arms
    this.arms = [];
    for (const s of [-1, 1]) {
      const shoulder = new THREE.Group(); shoulder.position.set(s * 0.37, 0.78, 0); this.torso.add(shoulder);
      mk(new THREE.SphereGeometry(0.11, 12, 10), suit, 0, 0, 0, shoulder);
      mk(new THREE.CapsuleGeometry(0.085, 0.28, 6, 12), suit, 0, -0.2, 0, shoulder);
      const elbow = new THREE.Group(); elbow.position.y = -0.4; shoulder.add(elbow);
      mk(new THREE.CapsuleGeometry(0.075, 0.26, 6, 12), suit, 0, -0.17, 0, elbow);
      tag = 'o'; mk(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), shirt, 0, -0.33, 0, elbow); tag = null;
      if (s === 1) { // presentation clicker
        tag = 'j';
        mk(new THREE.BoxGeometry(0.05, 0.13, 0.03), blackGloss, 0.02, -0.45, 0.07, elbow);
        mk(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false }), 0.02, -0.4, 0.09, elbow);
        tag = null;
      }
      const hand = mk(new THREE.SphereGeometry(0.085, 14, 10), skin, 0, -0.41, 0, elbow); hand.scale.set(0.9, 1.15, 0.7);
      const thumb = mk(new THREE.CapsuleGeometry(0.025, 0.06, 4, 6), skin, -s * 0.06, -0.38, 0.04, elbow); thumb.rotation.z = s * 0.6;
      this.arms.push({ shoulder, elbow, hand, s });
    }

    // neck + head
    mk(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 12), skin, 0, 0.92, 0, this.torso);
    this.head = new THREE.Group(); this.head.position.y = 1.12; this.torso.add(this.head);
    const skull = mk(new THREE.SphereGeometry(0.25, 32, 24), skin, 0, 0, 0, this.head); skull.scale.set(0.95, 1.08, 1);
    const hairCap = mk(new THREE.SphereGeometry(0.262, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48), hairM, 0, 0.03, -0.01, this.head);
    hairCap.scale.set(0.97, 1.1, 1.02); hairCap.rotation.x = -0.25;
    this.hairCap = hairCap;
    // the legendary quiff
    tag = 'o';
    for (let i = 0; i < 7; i++) {
      const q = mk(new THREE.ConeGeometry(0.07, 0.26, 8), hairM, -0.15 + i * 0.05, 0.25 + Math.sin(i / 6 * Math.PI) * 0.04, 0.1 - i * 0.004, this.head);
      q.rotation.set(0.9 + rnd(-0.1, 0.1), 0, (i - 3) * -0.12);
    }
    tag = null;
    for (const s of [-1, 1]) {
      mk(new THREE.SphereGeometry(0.06, 10, 8), skin, s * 0.24, -0.01, 0, this.head).scale.set(0.5, 1, 0.8);
      mk(new THREE.SphereGeometry(0.048, 14, 10), white, s * 0.088, 0.04, 0.2, this.head);
      mk(new THREE.SphereGeometry(0.024, 10, 8), blackGloss, s * 0.088, 0.04, 0.243, this.head);
      tag = 'o';
      const lens = mk(new THREE.TorusGeometry(0.072, 0.012, 8, 24), blackGloss, s * 0.09, 0.04, 0.245, this.head); lens.castShadow = false;
      mk(new THREE.BoxGeometry(0.1, 0.012, 0.012), blackGloss, s * 0.2, 0.05, 0.16, this.head).rotation.y = s * 1.2;
      // round rimless glasses
      tag = 'j';
      const rl = mk(new THREE.TorusGeometry(0.058, 0.0045, 6, 32), silver, s * 0.09, 0.04, 0.25, this.head); rl.castShadow = false;
      mk(new THREE.BoxGeometry(0.1, 0.006, 0.006), silver, s * 0.2, 0.05, 0.16, this.head).rotation.y = s * 1.2;
      tag = null;
    }
    tag = 'o'; mk(new THREE.BoxGeometry(0.05, 0.012, 0.012), blackGloss, 0, 0.05, 0.25, this.head);
    tag = 'j'; mk(new THREE.BoxGeometry(0.04, 0.005, 0.005), silver, 0, 0.05, 0.255, this.head);
    // grey stubble beard along the jaw and chin
    const beard = mk(new THREE.SphereGeometry(0.252, 32, 12, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.3), stubble, 0, 0, 0.004, this.head);
    beard.scale.set(0.96, 1.09, 1.01);
    const mustache = mk(new THREE.BoxGeometry(0.13, 0.025, 0.03), stubble, 0, -0.075, 0.235, this.head); mustache.rotation.x = -0.3;
    tag = null;
    this.brows = [-1, 1].map(s => { const b = mk(new THREE.BoxGeometry(0.1, 0.022, 0.02), hairM, s * 0.09, 0.14, 0.23, this.head); b.userData.s = s; return b; });
    const nose = mk(new THREE.SphereGeometry(0.04, 10, 8), skin, 0, -0.03, 0.25, this.head); nose.scale.set(0.9, 1.1, 1.2);
    this.mouth = mk(new THREE.SphereGeometry(0.07, 16, 10), new THREE.MeshStandardMaterial({ color: 0x5a0a10, roughness: 0.7 }), 0, -0.12, 0.2, this.head);
    this.teeth = mk(new THREE.BoxGeometry(0.09, 0.02, 0.02), white, 0, -0.105, 0.255, this.head);
    // headset mic
    const boom = new THREE.Group(); boom.position.set(0.23, -0.02, 0.04); this.head.add(boom);
    const arm = mk(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 6), blackGloss, 0, 0, 0.12, boom); arm.rotation.x = Math.PI / 2;
    boom.rotation.set(0.45, -0.55, 0);
    mk(new THREE.SphereGeometry(0.022, 10, 8), blackGloss, 0, 0, 0.24, boom);
    this.oliverOnly.push(boom);

    // quantum aura (atom orbits)
    this.aura = new THREE.Group(); this.aura.position.y = 1.25; this.root.add(this.aura);
    this.auraMat = new THREE.MeshBasicMaterial({ color: 0x40e0ff, transparent: true, opacity: 0.8, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.012, 8, 96), this.auraMat);
      r.rotation.set(Math.PI / 2 + (i - 1) * 0.9, i * 1.1, 0);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), this.auraMat); r.add(e); r.userData.e = e;
      this.aura.add(r); this.rings.push(r);
    }
    this.glow = new THREE.PointLight(0xff6020, 0, 10, 2); this.glow.position.y = 2; this.root.add(this.glow);

    scene.add(this.root);

    this.pos = new THREE.Vector3(0, LAYOUT.stageTop, -3.6);
    this.target = this.pos.clone();
    this.retarget = 1.5; this.facing = 0; this.walk = 0; this.spin = 0;
    this.hitT = 0; this.cheerT = 0; this.flashT = 0; this.jump = 0;
    this.cam = new THREE.Vector3(0, 0, 20);
  }

  hit() { this.hitT = 1; this.flashT = 0.35; }
  cheer() { this.cheerT = 1; }
  goWild() { this.spin = Math.PI * 4; this.jump = 1; }

  // Spin up in the air and swap outfits at the top of the jump.
  transform(toJobs) {
    this.spin = Math.PI * 6; this.jump = 1;
    this.morphT = 0.42; this.morphTo = toJobs;
  }

  setLook(jobs) {
    this.isJobs = jobs;
    for (const o of this.oliverOnly) o.visible = !jobs;
    for (const o of this.jobsOnly) o.visible = jobs;
    const { suit, pantsM, shoeM, hairM } = this.mats;
    suit.color.set(jobs ? 0x0b0b0d : 0x1c2c55); suit.roughness = jobs ? 0.95 : 0.5;
    suit.sheen = jobs ? 0.25 : 0.6; suit.sheenColor.set(jobs ? 0x404048 : 0x6080ff);
    pantsM.color.set(jobs ? 0x23385a : 0x151d38); pantsM.roughness = jobs ? 0.95 : 0.6;
    shoeM.color.set(jobs ? 0x9a9aa2 : 0x080808); shoeM.roughness = jobs ? 0.85 : 0.15; shoeM.metalness = jobs ? 0 : 0.3;
    hairM.color.set(jobs ? 0x77736e : 0x2a1a0e);
    this.hairCap.scale.set(0.97, jobs ? 0.95 : 1.1, 1.02);
    this.hairCap.rotation.x = jobs ? -0.45 : -0.25; // receding hairline
  }

  headWorld(out) { return this.head.getWorldPosition(out); }
  handWorld(i, out) { return this.arms[i].hand.getWorldPosition(out); }

  update(dt, t, { crazy, mythic: mythicIn, power, talking, jobs = false }) {
    if (this.morphT > 0) { this.morphT -= dt; if (this.morphT <= 0) this.setLook(this.morphTo); }
    // Steve is calm and in control: no flailing, no fire.
    const mythic = mythicIn && !jobs;
    if (jobs) crazy = 0.15;
    const lowPower = power < 0.3 ? 1 - power / 0.3 : 0;
    // locomotion
    this.retarget -= dt * (1 + crazy * 2 + (mythic ? 2 : 0));
    if (this.retarget <= 0) {
      this.retarget = jobs ? rnd(3, 5) : rnd(2, 4.5);
      this.target.set(jobs ? rnd(-4, 4) : rnd(-7.5, 7.5), LAYOUT.stageTop, jobs ? rnd(-4.5, -2.2) : rnd(-6, -1.6));
    }
    const speed = jobs ? 1.1 : (1.4 + crazy * 2.5 + (mythic ? 3 : 0)) * (1 - lowPower * 0.6);
    const dx = this.target.x - this.pos.x, dz = this.target.z - this.pos.z, dist = Math.hypot(dx, dz);
    const moving = dist > 0.12 ? 1 : 0;
    if (moving) { const k = Math.min(1, speed * dt / dist); this.pos.x += dx * k; this.pos.z += dz * k; this.walk += dt * speed * 4.2; }
    this.moveAmt = (this.moveAmt || 0) + (moving - (this.moveAmt || 0)) * Math.min(1, dt * 8);

    const toCam = Math.atan2(this.cam.x - this.pos.x, this.cam.z - this.pos.z);
    const desired = moving ? Math.atan2(dx, dz) : toCam;
    this.facing = lerpAngle(this.facing, desired, Math.min(1, dt * 6));
    if (this.spin > 0) { const s = Math.min(this.spin, dt * 18); this.spin -= s; this.facing += s; }

    this.jump = Math.max(0, this.jump - dt * 1.2);
    const hop = mythic ? Math.abs(Math.sin(t * 7)) * 0.35 : 0;
    const big = Math.sin(this.jump * Math.PI) * 1.2;
    this.root.position.set(this.pos.x, this.pos.y + hop + big, this.pos.z);
    this.root.rotation.y = this.facing;

    // legs & bob
    const sw = Math.sin(this.walk) * 0.65 * this.moveAmt;
    this.legs[0].rotation.x = sw; this.legs[1].rotation.x = -sw;
    this.body.position.y = Math.abs(Math.sin(this.walk)) * 0.05 * this.moveAmt;

    // torso lean (sad when low power, back on hit)
    this.hitT = Math.max(0, this.hitT - dt * 2);
    this.torso.rotation.x = lowPower * 0.4 - Math.sin(this.hitT * Math.PI) * 0.45 + (mythic ? Math.sin(t * 14) * 0.08 : 0);
    this.torso.rotation.z = Math.sin(t * (2 + crazy * 10)) * 0.05 * (1 + crazy * 2);

    // arms
    this.cheerT = Math.max(0, this.cheerT - dt * 1.4);
    const amp = (0.45 + crazy * 1.3) * (talking ? 1 : 0.4) * (1 - lowPower * 0.8);
    const f = 2.6 + crazy * 8;
    this.arms.forEach((a, i) => {
      const ph = i * 1.7;
      let rx = -0.25 - (Math.sin(t * f + ph) * 0.5 + 0.5) * amp;
      let rz = a.s * (0.15 + (Math.sin(t * f * 0.7 + ph * 2) * 0.5 + 0.5) * amp * 0.6);
      let ex = -0.5 - (Math.sin(t * f * 1.3 + ph) * 0.5 + 0.5) * amp * 0.9;
      if (mythic) { rx = Math.sin(t * 16 + ph) * 0.5; rz = a.s * (2.5 + Math.sin(t * 18 + ph) * 0.45); ex = -0.3 - Math.abs(Math.sin(t * 12 + ph)) * 0.8; }
      else if (jobs) {
        if (i === 1) { // clicker hand: calm forward, a firm click now and then
          const click = Math.max(0, Math.sin(t * 1.3)) ** 8;
          rx = -0.75 - click * 0.35; rz = a.s * 0.12; ex = -1.1 + click * 0.3;
          if (this.cheerT > 0) { rx = -2.7; ex = -0.2; } // "one more thing"
        } else { // open-palm explaining gesture
          rx = -0.55 - (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.4; rz = a.s * (0.25 + Math.sin(t * 1.6) * 0.1); ex = -1.0 - Math.sin(t * 2.2 + 1) * 0.2;
        }
      }
      else if (this.cheerT > 0 && i === 0) { const k = Math.sin(Math.min(1, this.cheerT * 1.5) * Math.PI * 0.5); rx = rx * (1 - k) - 2.8 * k; rz = rz * (1 - k); ex = ex * (1 - k) - 1.2 * k * (0.6 + 0.4 * Math.sin(t * 30)); }
      if (lowPower > 0.5 && !mythic && !jobs) { rx = -0.05; rz = a.s * 0.08; ex = -0.15; }
      if (this.hitT > 0) { rz += a.s * Math.sin(this.hitT * Math.PI) * 1.4; }
      a.shoulder.rotation.x += (rx - a.shoulder.rotation.x) * Math.min(1, dt * 14);
      a.shoulder.rotation.z += (rz - a.shoulder.rotation.z) * Math.min(1, dt * 14);
      a.elbow.rotation.x += (ex - a.elbow.rotation.x) * Math.min(1, dt * 14);
    });

    // head
    this.head.rotation.x = (talking ? Math.sin(t * f * 0.9) * 0.1 : 0) + lowPower * 0.35 + (mythic ? Math.sin(t * 22) * 0.25 : 0);
    this.head.rotation.z = Math.sin(t * 17) * 0.12 * crazy;
    this.head.rotation.y = Math.sin(t * 0.8) * 0.3 * (1 - crazy);
    const open = mythic ? 0.8 + Math.sin(t * 25) * 0.2 : (talking ? Math.abs(Math.sin(t * 13)) * (0.4 + crazy * 0.5) : 0.05);
    this.mouth.scale.set(1 + open * 0.3, 0.25 + open * 0.9, 0.5);
    this.mouth.position.y = -0.12 - open * 0.02;
    for (const b of this.brows) { b.position.y = 0.14 + crazy * 0.04 + (mythic ? 0.03 : 0) - lowPower * 0.02; b.rotation.z = b.userData.s * (lowPower * -0.4 + crazy * 0.3 + (mythic ? 0.4 : 0)); }

    // aura (in Steve mode it becomes the Reality Distortion Field)
    const auraScale = jobs ? 1.15 + Math.sin(t * 2) * 0.05 : 0.5 + power * 0.8;
    this.aura.scale.setScalar(auraScale);
    this.auraMat.color.set(jobs ? 0xf4f6ff : mythic ? 0xff7a10 : (lowPower > 0 ? 0xff2040 : 0x40e0ff));
    this.auraMat.opacity = jobs ? 0.22 : 0.2 + power * 0.7;
    this.rings.forEach((r, i) => { r.rotation.z += dt * (jobs ? 0.6 + i * 0.25 : 1.5 + i * 0.7 + crazy * 4 + (mythic ? 6 : 0)); });

    this.glow.intensity = jobs ? 0 : mythic ? 8 + Math.random() * 6 : 0;

    this.flashT = Math.max(0, this.flashT - dt);
    for (const m of this.flashMats) m.emissive.setRGB(this.flashT * 2.5, 0, 0);
  }
}
