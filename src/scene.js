import * as THREE from 'three';

export const LAYOUT = {
  stageTop: 1.2, stageFront: 0, stageBack: -9.2, stageHalfW: 11.5,
  rows: 8, seatsPerRow: 17, seatSpacing: 1.2, seatX0: -9.6,
  rowZ: r => 4 + r * 1.35, rowY: r => r * 0.5,
  aisleX: 11.7, doorX: 13.6, doorZ: 2.2, frontAisleZ: 2.2,
};

function canvasTex(w, h, draw, repeat = [1, 1], srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 8;
  return t;
}

const rnd = (a, b) => a + Math.random() * (b - a);

function woodTexture() {
  return canvasTex(1024, 1024, (g, w, h) => {
    const planks = 16, ph = h / planks;
    for (let i = 0; i < planks; i++) {
      const base = 40 + Math.random() * 25;
      g.fillStyle = `hsl(${24 + rnd(-4, 4)}, ${45 + rnd(-8, 8)}%, ${base * 0.55}%)`;
      g.fillRect(0, i * ph, w, ph);
      for (let k = 0; k < 40; k++) {
        g.strokeStyle = `rgba(${rnd(20, 60)},${rnd(10, 30)},0,${rnd(0.05, 0.25)})`;
        g.lineWidth = rnd(0.5, 2.5); g.beginPath();
        const y = i * ph + rnd(0, ph); g.moveTo(0, y);
        for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + k) * rnd(1, 4));
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, i * ph, w, 2);
      const off = rnd(0, w); g.fillRect(off, i * ph, 2, ph);
    }
  }, [3, 1]);
}

function carpetTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#2a0c18'; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * 30 - 15;
      img.data[i] += n; img.data[i + 1] += n * 0.4; img.data[i + 2] += n * 0.6;
    }
    g.putImageData(img, 0, 0);
    g.strokeStyle = 'rgba(200,150,60,0.15)'; g.lineWidth = 3;
    for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 64) { g.beginPath(); g.arc(x + 32, y + 32, 14, 0, Math.PI * 2); g.stroke(); }
  }, [10, 10]);
}

function wallTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#1a1020'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      g.fillStyle = `hsl(280, 20%, ${10 + Math.random() * 5}%)`; g.fillRect(x + 2, 0, 28, h);
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, 0, 2, h);
    }
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, h / 2 - 3, w, 6);
  }, [8, 2]);
}

function speakerTexture() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, w, h);
    const drv = (y, r) => {
      const gr = g.createRadialGradient(w / 2, y, 2, w / 2, y, r);
      gr.addColorStop(0, '#444'); gr.addColorStop(0.25, '#111'); gr.addColorStop(0.85, '#222'); gr.addColorStop(1, '#555');
      g.fillStyle = gr; g.beginPath(); g.arc(w / 2, y, r, 0, Math.PI * 2); g.fill();
    };
    drv(110, 90); drv(320, 90); drv(470, 30);
  });
}

function signTexture(text, color) {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#020'; g.fillRect(0, 0, w, h);
    g.font = 'bold 84px Impact, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = 20; g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
  });
}

// Volumetric light cone (additive, fades toward the base, fresnel edges).
const beamMat = (color) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { color: { value: new THREE.Color(color) }, intensity: { value: 0.35 } },
  vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV;
    void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0);
      vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 color; uniform float intensity; varying float vY; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(abs(dot(vN, vV)), 2.0); float a = pow(vY, 1.6) * f * intensity;
      gl_FragColor = vec4(color * a, a); }`,
});
const beamGeo = new THREE.ConeGeometry(1, 1, 40, 1, true).translate(0, -0.5, 0);
const UP = new THREE.Vector3(0, 1, 0);

class Beam {
  constructor(scene, color, radius) {
    this.mesh = new THREE.Mesh(beamGeo, beamMat(color));
    this.radius = radius; this.mesh.renderOrder = 5;
    scene.add(this.mesh);
  }
  aim(from, to, intensity, color) {
    const d = new THREE.Vector3().subVectors(from, to), len = d.length();
    this.mesh.position.copy(from);
    this.mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    const r = Math.tan(this.radius) * len;
    this.mesh.scale.set(r, len, r);
    this.mesh.material.uniforms.intensity.value = intensity;
    if (color) this.mesh.material.uniforms.color.value.copy(color);
  }
}

export function buildWorld(scene) {
  const L = LAYOUT;
  const world = { lights: [], heads: [], pyros: [], t: 0 };

  scene.fog = new THREE.FogExp2(0x0a0414, 0.018);
  scene.background = new THREE.Color(0x040208);

  // ---------- Hall ----------
  const carpet = new THREE.MeshStandardMaterial({ map: carpetTexture(), roughness: 0.95 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 34), carpet);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 6); floor.receiveShadow = true; scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture(), roughness: 0.8, metalness: 0.1 });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(30, 34), new THREE.MeshStandardMaterial({ color: 0x08060c, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 13, 6); scene.add(ceiling);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(34, 13), wallMat);
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-L.doorX, 6.5, 6); leftWall.receiveShadow = true; scene.add(leftWall);

  // right wall with a doorway
  const dW = 2.0, dH = 2.9;
  const segA = new THREE.Mesh(new THREE.PlaneGeometry(L.doorZ - dW / 2 + 11, 13), wallMat);
  segA.rotation.y = -Math.PI / 2; segA.position.set(L.doorX, 6.5, (-11 + L.doorZ - dW / 2) / 2); scene.add(segA);
  const segBLen = 23 - (L.doorZ + dW / 2);
  const segB = new THREE.Mesh(new THREE.PlaneGeometry(segBLen, 13), wallMat);
  segB.rotation.y = -Math.PI / 2; segB.position.set(L.doorX, 6.5, L.doorZ + dW / 2 + segBLen / 2); scene.add(segB);
  const segC = new THREE.Mesh(new THREE.PlaneGeometry(dW, 13 - dH), wallMat);
  segC.rotation.y = -Math.PI / 2; segC.position.set(L.doorX, dH + (13 - dH) / 2, L.doorZ); scene.add(segC);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 13), wallMat);
  backWall.rotation.y = Math.PI; backWall.position.set(0, 6.5, 23); scene.add(backWall);

  // door frame, leaves, bright lobby behind
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.6, roughness: 0.3 });
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, dW + 0.3), frameMat); fTop.position.set(L.doorX - 0.05, dH + 0.1, L.doorZ); scene.add(fTop);
  for (const s of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.25, dH, 0.15), frameMat);
    f.position.set(L.doorX - 0.05, dH / 2, L.doorZ + s * (dW / 2 + 0.07)); scene.add(f);
  }
  const lobby = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
  lobby.rotation.y = -Math.PI / 2; lobby.position.set(L.doorX + 1.4, 1.6, L.doorZ); scene.add(lobby);
  const lobbyLight = new THREE.PointLight(0xffd29a, 0, 8, 2); lobbyLight.position.set(L.doorX - 0.6, 2.2, L.doorZ); scene.add(lobbyLight);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a1a10, roughness: 0.45, metalness: 0.1 });
  const leaves = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(L.doorX, 0, L.doorZ + s * dW / 2);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, dH - 0.05, dW / 2 - 0.02), leafMat);
    leaf.position.set(0, dH / 2, -s * dW / 4); pivot.add(leaf);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
    win.rotation.y = -Math.PI / 2; win.position.set(-0.05, dH * 0.65, -s * dW / 4); pivot.add(win);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.4), frameMat);
    handle.position.set(-0.08, 1.1, -s * (dW / 2 - 0.15)); pivot.add(handle);
    pivot.userData.side = s; leaves.push(pivot); scene.add(pivot);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: signTexture('ENTRANCE', '#3dff7a'), toneMapped: false }));
  sign.rotation.y = -Math.PI / 2; sign.position.set(L.doorX - 0.02, dH + 0.55, L.doorZ); scene.add(sign);
  world.door = { leaves, open: 0, target: 0, light: lobbyLight };

  // wall sconces
  const sconceMat = new THREE.MeshBasicMaterial({ color: 0xffb060, toneMapped: false });
  for (const x of [-L.doorX + 0.05, L.doorX - 0.05]) for (const z of [8, 13, 18]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.25), sconceMat); s.position.set(x, 5, z); scene.add(s);
  }

  // risers + seats
  const riserMat = new THREE.MeshStandardMaterial({ color: 0x140a10, roughness: 0.9 });
  for (let r = 0; r < L.rows; r++) {
    if (r === 0) continue;
    const z0 = L.rowZ(r) - 0.675, depth = 23 - z0;
    const riser = new THREE.Mesh(new THREE.BoxGeometry(27.2, 0.5, depth), riserMat);
    riser.position.set(0, L.rowY(r) - 0.25, z0 + depth / 2); riser.receiveShadow = true; scene.add(riser);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(27.2, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0x4060ff, toneMapped: false }));
    strip.position.set(0, L.rowY(r) - 0.02, z0 - 0.01); scene.add(strip);
  }
  const velvet = new THREE.MeshPhysicalMaterial({ color: 0x7a0c1c, roughness: 0.7, sheen: 1, sheenColor: new THREE.Color(0xff5070), sheenRoughness: 0.4 });
  const n = L.rows * L.seatsPerRow;
  const cushion = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.18, 0.75), velvet, n);
  const back = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.95, 0.14), velvet, n);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
  const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.45, 0.6), legMat, n);
  const m = new THREE.Matrix4(); let i = 0;
  world.seats = [];
  for (let r = 0; r < L.rows; r++) for (let s = 0; s < L.seatsPerRow; s++, i++) {
    const x = L.seatX0 + s * L.seatSpacing, y = L.rowY(r), z = L.rowZ(r);
    m.makeTranslation(x, y + 0.45, z); cushion.setMatrixAt(i, m);
    m.makeTranslation(x, y + 0.95, z + 0.38); back.setMatrixAt(i, m);
    m.makeTranslation(x, y + 0.22, z); legs.setMatrixAt(i, m);
    world.seats.push({ row: r, seat: s, x, y, z, person: null });
  }
  for (const im of [cushion, back, legs]) scene.add(im);

  // ---------- Stage ----------
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.32, metalness: 0.05 });
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 });
  const depth = L.stageFront - L.stageBack;
  const stage = new THREE.Mesh(new THREE.BoxGeometry(L.stageHalfW * 2, L.stageTop, depth), [black, black, wood, black, black, black]);
  stage.position.set(0, L.stageTop / 2, (L.stageFront + L.stageBack) / 2); stage.receiveShadow = true; scene.add(stage);

  const circle = new THREE.Mesh(new THREE.CircleGeometry(2.8, 64), new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.9 }));
  circle.rotation.x = -Math.PI / 2; circle.position.set(0, L.stageTop + 0.005, -3.6); circle.receiveShadow = true; scene.add(circle);

  const ledMat = new THREE.MeshBasicMaterial({ color: 0x40c0ff, toneMapped: false });
  const led = new THREE.Mesh(new THREE.BoxGeometry(L.stageHalfW * 2, 0.06, 0.06), ledMat);
  led.position.set(0, L.stageTop, L.stageFront + 0.02); scene.add(led);
  const led2 = led.clone(); led2.position.y = 0.05; scene.add(led2);
  world.ledMat = ledMat;

  // footlights
  const footMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false });
  for (let x = -10; x <= 10; x += 2) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.2), black); f.position.set(x, L.stageTop + 0.06, -0.25); scene.add(f);
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.06), footMat); lens.position.set(x, L.stageTop + 0.06, -0.35); lens.rotation.y = Math.PI; scene.add(lens);
  }

  // curtain with velvet folds
  const curtainGeo = new THREE.PlaneGeometry(24, 11.5, 300, 1);
  const pos = curtainGeo.attributes.position;
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k);
    pos.setZ(k, Math.sin(x * 2.6) * 0.22 + Math.sin(x * 6.3 + 1) * 0.07);
  }
  curtainGeo.computeVertexNormals();
  const curtainMat = new THREE.MeshPhysicalMaterial({ color: 0x5a0614, roughness: 0.75, sheen: 1, sheenColor: new THREE.Color(0xff3050), sheenRoughness: 0.5, side: THREE.DoubleSide });
  const curtain = new THREE.Mesh(curtainGeo, curtainMat);
  curtain.position.set(0, L.stageTop + 5.75, L.stageBack + 0.3); curtain.receiveShadow = true; scene.add(curtain);
  for (const s of [-1, 1]) {
    const g = new THREE.PlaneGeometry(3, 12.5, 60, 1); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * 4) * 0.2);
    g.computeVertexNormals();
    const leg = new THREE.Mesh(g, curtainMat); leg.position.set(s * 11, 6.25 + 0.6, -0.6); scene.add(leg);
  }
  const valance = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.6, 200, 1), curtainMat);
  const vp = valance.geometry.attributes.position;
  for (let k = 0; k < vp.count; k++) vp.setZ(k, Math.sin(vp.getX(k) * 5) * 0.12);
  valance.geometry.computeVertexNormals(); valance.position.set(0, 12.2, -0.4); scene.add(valance);

  // big screen
  const screenCanvas = document.createElement('canvas'); screenCanvas.width = 1280; screenCanvas.height = 512;
  const screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 5), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false, color: 0xbbbbbb }));
  screen.position.set(0, 7.6, L.stageBack + 0.75); scene.add(screen);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(12.9, 5.4, 0.2), black); bezel.position.set(0, 7.6, L.stageBack + 0.62); scene.add(bezel);
  world.screen = { canvas: screenCanvas, ctx: screenCanvas.getContext('2d'), tex: screenTex, mesh: screen };

  // speakers
  const spkMat = new THREE.MeshStandardMaterial({ map: speakerTexture(), roughness: 0.7 });
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.0), [black, black, black, black, spkMat, black]);
    b.position.set(s * 10.2, L.stageTop + 1.1 + k * 2.2, -1.3); b.rotation.y = -s * 0.2; b.castShadow = true; scene.add(b);
  }

  // pyro cannons
  for (const x of [-8.2, -5, 5, 8.2]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.4, 20), black); c.position.set(x, L.stageTop + 0.2, -0.8); scene.add(c);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), new THREE.MeshBasicMaterial({ color: 0xff6a00, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.set(x, L.stageTop + 0.41, -0.8); scene.add(ring);
    const light = new THREE.PointLight(0xff7a20, 0, 14, 2); light.position.set(x, L.stageTop + 1.5, -0.8); scene.add(light);
    world.pyros.push({ x, y: L.stageTop + 0.45, z: -0.8, light, burn: 0 });
  }

  // truss
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x9a9aa8, metalness: 0.9, roughness: 0.25 });
  const buildTruss = (z, y) => {
    const len = 22;
    for (const [dy, dz] of [[0, 0], [0.45, 0], [0, 0.45], [0.45, 0.45]]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 6), trussMat);
      bar.rotation.z = Math.PI / 2; bar.position.set(0, y + dy, z + dz); scene.add(bar);
    }
    const diag = new THREE.CylinderGeometry(0.02, 0.02, 0.64, 4);
    for (let x = -len / 2; x < len / 2; x += 0.45) {
      for (const dz of [0, 0.45]) {
        const d = new THREE.Mesh(diag, trussMat); d.position.set(x + 0.225, y + 0.225, z + dz); d.rotation.z = Math.PI / 4 * (Math.round(x / 0.45) % 2 ? 1 : -1); scene.add(d);
      }
    }
  };
  buildTruss(-3.2, 10.5); buildTruss(-7.2, 11);

  // ---------- Lights ----------
  scene.add(new THREE.HemisphereLight(0x6070ff, 0x200810, 0.35));
  scene.add(new THREE.AmbientLight(0x402850, 0.35));
  for (const x of [-7, 0, 7]) {
    const h = new THREE.PointLight(0xffc890, 45, 20, 2); h.position.set(x, 10, 11); scene.add(h);
    world.lights.push(h);
  }
  world.house = world.lights.slice();

  // follow spot (shadow caster)
  const follow = new THREE.SpotLight(0xfff4e0, 1400, 40, 0.13, 0.55, 1.6);
  follow.position.set(0, 12.5, 13); follow.castShadow = true;
  follow.shadow.mapSize.set(2048, 2048); follow.shadow.bias = -0.0004; follow.shadow.camera.near = 5; follow.shadow.camera.far = 40;
  scene.add(follow); scene.add(follow.target);
  world.follow = follow;
  world.followBeam = new Beam(scene, 0xfff0d0, 0.11);

  // moving heads on the front truss
  const headColors = [0xff2a6d, 0x05d9e8, 0xb14aff, 0xffb000, 0x05d9e8, 0xff2a6d];
  const headX = [-9, -5.4, -1.8, 1.8, 5.4, 9];
  headX.forEach((x, k) => {
    const color = new THREE.Color(headColors[k]);
    const spot = new THREE.SpotLight(color, 500, 30, 0.2, 0.4, 1.4);
    spot.position.set(x, 10.2, -3.0); scene.add(spot); scene.add(spot.target);
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 }));
    yoke.position.copy(spot.position); yoke.position.y += 0.15; scene.add(yoke);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 8), new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    lens.position.copy(spot.position); scene.add(lens);
    const beam = new Beam(scene, color, 0.15);
    world.heads.push({ spot, lens, beam, base: color.clone(), phase: k * 1.3, x });
  });

  // curtain uplights
  [0x3020ff, 0xff2080, 0x3020ff, 0xff2080, 0x3020ff].forEach((c, k) => {
    const s = new THREE.SpotLight(c, 160, 14, 0.5, 0.8, 1.5);
    const x = -9 + k * 4.5; s.position.set(x, L.stageTop + 0.2, L.stageBack + 2.5);
    s.target.position.set(x, 9, L.stageBack); scene.add(s); scene.add(s.target);
    world.lights.push(s);
  });
  world.uplights = world.lights.slice(world.house.length);

  return world;
}

const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpCol = new THREE.Color();
const MYTHIC_COLS = [new THREE.Color(0xff3000), new THREE.Color(0xff8a00), new THREE.Color(0xffd000)];

export function updateWorld(world, dt, t, s) {
  // s = { oliver: Vector3, mythic, jobs, crazy (0..1), power (0..1), excite (0..1) }
  const jobs = !!s.jobs, mythic = s.mythic && !jobs;
  const speed = jobs ? 0.25 : 0.4 + s.crazy * 1.8 + (mythic ? 2 : 0);
  world.t += dt * speed;
  const wt = world.t;
  world.heads.forEach((h, k) => {
    let tx, tz;
    if (mythic && k % 2 === 0) { tx = s.oliver.x + Math.sin(wt * 3 + k) * 0.5; tz = s.oliver.z; }
    else if (jobs) { tx = s.oliver.x + (k - 2.5) * 3.2; tz = -5 + (k % 2 ? 1 : -1) * 1.5; }
    else { tx = Math.sin(wt * 0.7 + h.phase) * 8; tz = -4 + Math.cos(wt * 0.9 + h.phase * 1.7) * 4 + (k % 3 === 0 ? 6 : 0); }
    const ty = tz > 0 ? 0.5 : LAYOUT.stageTop;
    h.spot.target.position.set(tx, ty, tz);
    let col = h.base;
    if (jobs) { col = tmpCol.setHSL(0.6, 0.15, 0.92); }
    else if (mythic) { col = MYTHIC_COLS[(k + Math.floor(t * 6)) % 3]; }
    else if (s.power < 0.3) { col = tmpCol.copy(h.base).lerp(new THREE.Color(0x203060), 0.7); }
    h.spot.color.copy(col); h.lens.material.color.copy(col);
    const strobe = mythic ? (Math.sin(t * 30 + k) > -0.2 ? 1 : 0.15) : 1;
    const inten = jobs ? 0.3 : (0.35 + s.power * 0.8) * strobe;
    h.spot.intensity = 500 * inten;
    h.beam.aim(h.spot.position, h.spot.target.position, jobs ? 0.07 : 0.16 * inten + s.excite * 0.08, col);
  });

  // follow spot on Oliver
  tmpV.set(s.oliver.x, LAYOUT.stageTop, s.oliver.z);
  world.follow.target.position.lerp(tmpV, Math.min(1, dt * 6));
  world.follow.intensity = (900 + s.power * 700) * (mythic ? 0.45 : jobs ? 0.4 : 1);
  world.followBeam.aim(world.follow.position, tmpV2.copy(world.follow.target.position), 0.11, null);

  // house lights dim as power rises (focus on stage) and when things go bad
  for (const h of world.house) h.intensity = jobs ? 15 : 30 + (1 - s.power) * 20;
  world.uplights.forEach((u, k) => {
    u.intensity = jobs ? 90 : 120 + Math.sin(t * 2 + k) * 40;
    if (jobs) u.color.setHSL(0.62, 0.5, 0.75);
    else if (mythic) u.color.setHSL(0.03 + 0.05 * Math.sin(t * 4 + k), 1, 0.5);
    else u.color.setHSL(k % 2 ? 0.92 : 0.68, 1, 0.5);
  });

  // LED strip
  if (jobs) world.ledMat.color.setRGB(0.95, 0.96, 1);
  else if (mythic) world.ledMat.color.setHSL(0.05 + 0.04 * Math.sin(t * 10), 1, 0.55);
  else if (s.power < 0.3) world.ledMat.color.setHSL(0, 1, 0.3 + 0.2 * Math.abs(Math.sin(t * 5)));
  else world.ledMat.color.setHSL((t * 0.05) % 1, 0.9, 0.55);

  // pyro light decay
  for (const p of world.pyros) { p.burn = Math.max(0, p.burn - dt); p.light.intensity = p.burn > 0 ? 25 * p.burn * (0.7 + Math.random() * 0.6) : 0; }

  // door animation
  const d = world.door;
  d.open += (d.target - d.open) * Math.min(1, dt * 6);
  for (const leaf of d.leaves) leaf.rotation.y = leaf.userData.side * d.open * 1.35;
  d.light.intensity = d.open * 25;
}

export function drawScreen(world, { word = '', typed = 0, mythic = false, jobs = false, combo = 0, level = 1, t = 0, title = '' }) {
  const { ctx: g, canvas: c, tex } = world.screen;
  const w = c.width, h = c.height;
  if (jobs) { drawJobsScreen(g, w, h, word, typed, combo, title); tex.needsUpdate = true; return; }
  const bg = g.createLinearGradient(0, 0, w, h);
  if (mythic) {
    bg.addColorStop(0, '#300000'); bg.addColorStop(0.5 + 0.2 * Math.sin(t * 3), '#a02000'); bg.addColorStop(1, '#200000');
  } else {
    bg.addColorStop(0, '#0a0420'); bg.addColorStop(0.5, '#1a0838'); bg.addColorStop(1, '#04101e');
  }
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // grid lines
  g.strokeStyle = mythic ? 'rgba(255,180,0,0.12)' : 'rgba(120,200,255,0.08)'; g.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }

  g.textBaseline = 'middle'; g.textAlign = 'left';
  g.font = 'bold 54px Impact, Arial Black, sans-serif';
  g.fillStyle = '#ff1f4b'; g.shadowColor = '#ff1f4b'; g.shadowBlur = 20; g.fillText('Q', 40, 60);
  g.fillStyle = '#ffffff'; g.shadowBlur = 0; g.fillText('UANTUM', 76, 60);
  g.fillStyle = '#ff1f4b'; g.fillText('TALKS', 290, 60);
  g.textAlign = 'right'; g.font = 'bold 34px Arial, sans-serif'; g.fillStyle = mythic ? '#ffd000' : '#7fffff';
  g.fillText(mythic ? `🔥 MYTHICAL x10 · COMBO ${combo}` : `LEVEL ${level} · COMBO ${combo}`, w - 40, 60);

  g.textAlign = 'center';
  if (word) {
    const up = word.toUpperCase();
    let size = 170; g.font = `bold ${size}px Impact, Arial Black, sans-serif`;
    while (g.measureText(up).width > w - 100 && size > 50) { size -= 6; g.font = `bold ${size}px Impact, Arial Black, sans-serif`; }
    const total = g.measureText(up).width; let x = w / 2 - total / 2;
    g.textAlign = 'left';
    for (let i = 0; i < up.length; i++) {
      const ch = up[i], cw = g.measureText(ch).width;
      g.fillStyle = i < typed ? '#39ff9a' : '#ffffff';
      g.shadowColor = i < typed ? '#00ff80' : (mythic ? '#ff6000' : '#4080ff'); g.shadowBlur = 30;
      g.fillText(ch, x, h / 2 + 30); x += cw;
    }
    g.shadowBlur = 0;
  }
  g.textAlign = 'center'; g.font = 'italic 30px Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.75)';
  g.fillText(title || 'OLIVER · YOUR QUANTUM COACH', w / 2, h - 50);
  tex.needsUpdate = true;
}

// Minimal keynote slide: black, thin white type, lots of space.
function drawJobsScreen(g, w, h, word, typed, combo, title) {
  const bg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
  bg.addColorStop(0, '#1a1c22'); bg.addColorStop(1, '#000000');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.shadowBlur = 0; g.textBaseline = 'middle';
  const thin = (px) => `200 ${px}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  g.textAlign = 'right'; g.font = thin(30); g.fillStyle = 'rgba(255,255,255,0.55)';
  g.fillText(`x1000 · ${combo}`, w - 40, 56);
  g.textAlign = 'center';
  if (word) {
    let size = 150; g.font = thin(size);
    while (g.measureText(word).width > w - 140 && size > 50) { size -= 6; g.font = thin(size); }
    const total = g.measureText(word).width; let x = w / 2 - total / 2;
    g.textAlign = 'left';
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      g.fillStyle = i < typed ? '#ffffff' : 'rgba(255,255,255,0.35)';
      g.fillText(ch, x, h / 2 + 10); x += g.measureText(ch).width;
    }
  }
  g.textAlign = 'center'; g.font = thin(34); g.fillStyle = 'rgba(255,255,255,0.8)';
  g.fillText(title || 'One more thing...', w / 2, h - 60);
}
