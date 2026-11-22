import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1800);
const rx = (a) => a * Math.PI / 180;

// ---------- 2-step toon materials ----------
const grad = (() => {
  const d = new Uint8Array([102, 102, 102, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff', clamp = false) => toon({ map: P.tex(c, rx_, ry_, clamp), color });

const M = {
  cobble:        texM(P.cobbles(1), 6, 6),
  cobbleRoad:    texM(P.cobbles(2), 3, 1.5),
  haussDay:      texM(P.haussmann(3, false), 1, 1),
  haussNight:    texM(P.haussmann(3, true), 1, 1),
  haussDayB:     texM(P.haussmann(5, false), 1, 1, '#f0e4d0'),
  haussNightB:   texM(P.haussmann(5, true), 1, 1, '#d9cdb8'),
  mansard:       texM(P.mansardRoof(4), 2, 1),
  cathedral:     texM(P.cathedralStone(), 1, 1, '#ffffff', true),
  limestone:     toon({ color: '#ddd1b8' }),
  limestoneDark: toon({ color: '#b5a892' }),
  seine:         toon({ color: '#386e96' }),
  gasTank:       texM(P.gasTankTex(), 1, 1, '#ffffff', true),
  barricade:     texM(P.barricadeTex(), 1, 1, '#ffffff', true),
  earth:         texM(P.earthTex(12), 4, 4),
  meadow:        texM(P.meadowGrass(15), 8, 8),
  hillDark:      toon({ color: '#45593c' }),
  wicker:        texM(P.wickerTex(8), 2, 1),
  cage:          texM(P.cageTex(), 1, 1, '#ffffff', true),
  mailbag:       texM(P.mailbagTex(), 1, 1, '#ffffff', true),
  bench:         texM(P.woodBench(19), 3, 2),
  dispatchBoard: texM(P.dispatchBoardTex(), 1, 1, '#ffffff', true),
  microfilm:     texM(P.microfilmTex(), 1, 1, '#ffffff', true),
  balloonRed:    texM(P.balloonTex('#cf342e', '#faf0d6', '#1f4582', 'POSTE • PARIS'), 1, 1),
  balloonBlue:   texM(P.balloonTex('#234c8c', '#f6ecd2', '#c9332b', 'BALLON MONTÉ'), 1, 1),
  balloonGold:   texM(P.balloonTex('#d99429', '#faf2dc', '#7a2534', 'COURRIER'), 1, 1),
  balloonTeal:   texM(P.balloonTex('#28787a', '#f7f0da', '#d44235', 'PARIS 1870'), 1, 1),
  balloonTri:    texM(P.balloonTex('#1f4582', '#d43a32', '#f7f3e8', 'RÉPUBLIQUE'), 1, 1),
  iron:          toon({ color: '#2b303a' }),
  brass:         toon({ color: '#e0b345' }),
  wood:          toon({ color: '#784c2c' }),
  woodDark:      toon({ color: '#452a18' }),
  sandbag:       toon({ color: '#c4b189' }),
  tent:          toon({ color: '#e6dec8' }),
  red:           toon({ color: '#c9322c' }),
  blue:          toon({ color: '#1f4582' }),
  white:         toon({ color: '#f7f4eb' }),
  gold:          toon({ color: '#ffd644' }),
  lampGlow:      new THREE.MeshBasicMaterial({ color: '#ffe58f', fog: false }),
  fireGlow:      new THREE.MeshBasicMaterial({ color: '#ff8a24', fog: false }),
  fireCore:      new THREE.MeshBasicMaterial({ color: '#fff08a', fog: false }),
  foliage:       toon({ color: '#4d7a38' }),
  foliageDark:   toon({ color: '#395e2c' }),
  terracotta:    toon({ color: '#b85038' }),
  studioWall:    toon({ color: '#28364a' }),
  bellows:       toon({ color: '#2b2226' }),
  beamGlow:      new THREE.MeshBasicMaterial({ color: '#ffe285', transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false, fog: false }),
};

// ---------- normal + depth ink contract (STRICT NoBlending on cardNd!) ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  transparent: false, blending: THREE.NoBlending, depthWrite: true, depthTest: true,
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});

// ---------- geometry helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  if (opts.ndSkip) m.userData.ndSkip = true;
  parent.add(m);
  return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t);
  }
  return g;
};

// ---------- sky dome + moon & stars ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .52)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.55, s) + .35*pow(max(s,0.), 22.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

const nightSkyG = new THREE.Group(); scene.add(nightSkyG);
const moonMesh = add(new THREE.SphereGeometry(14, 20, 16), new THREE.MeshBasicMaterial({ color: '#fff6cf', fog: false }), -95, 115, -180, nightSkyG, { cast: false, receive: false, ndSkip: true });
const starRng = P.rng(701);
for (let i = 0; i < 65; i++) {
  const th = starRng() * Math.PI * 2, ph = 0.16 + starRng() * 0.72, R = 360;
  add(new THREE.SphereGeometry(0.65 + starRng() * 0.9, 6, 6), new THREE.MeshBasicMaterial({ color: '#fff7d6', fog: false }),
    Math.cos(th) * Math.cos(ph) * R, Math.sin(ph) * R, Math.sin(th) * Math.cos(ph) * R, nightSkyG, { cast: false, receive: false, ndSkip: true });
}
nightSkyG.visible = false;

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 60, 750);

// ---------- reusable 3D sculpted 1870 Gas Balloon factory ----------
const balloonLatheGeo = (() => {
  const pts = [];
  // Sculpted authentic pear-shaped 1870 coal-gas balloon envelope (neck at y=0, crown at y=6.6, max radius 2.95)
  const profile = [
    [0.01, 0.0], [0.38, 0.05], [0.58, 0.55], [1.15, 1.35],
    [1.92, 2.25], [2.56, 3.15], [2.92, 4.05], [2.94, 4.88],
    [2.64, 5.58], [2.04, 6.12], [1.18, 6.48], [0.42, 6.64], [0.01, 6.68],
  ];
  for (const [r, y] of profile) pts.push(new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 28);
})();

function makeBalloon(envMat, { mailbags = true, cages = false, flags = true } = {}) {
  const root = new THREE.Group();

  // Wicker Gondola Basket (base y = 0, top rim y = 1.42)
  const basketG = new THREE.Group(); root.add(basketG);
  add(box(1.75, 1.35, 1.75), M.wicker, 0, 0.70, 0, basketG);
  add(box(1.92, 0.16, 1.92), M.woodDark, 0, 1.42, 0, basketG);
  // Sandbags slung around basket rim
  for (const [sx, sz] of [[-0.98, 0.4], [-0.98, -0.4], [0.98, 0.4], [0.98, -0.4], [0, 0.98], [0, -0.98]]) {
    const sb = add(new THREE.SphereGeometry(0.24, 8, 8), M.sandbag, sx, 0.85, sz, basketG);
    sb.scale.set(0.75, 1.35, 0.75);
  }

  // Overflowing POSTE DE PARIS mailbags & letters inside basket
  const mailG = new THREE.Group(); basketG.add(mailG);
  for (const [mx, my, mz, ms] of [[-0.45, 1.48, 0.35, 0.44], [0.45, 1.52, -0.35, 0.46], [-0.35, 1.56, -0.42, 0.42], [0.42, 1.46, 0.42, 0.40], [0, 1.75, -0.1, 0.45]]) {
    const bag = add(new THREE.SphereGeometry(ms, 10, 8), M.mailbag, mx, my, mz, mailG);
    bag.scale.set(0.95, 1.18, 0.95);
  }
  for (const [lx, ly, lz, rz] of [[-0.55, 1.92, 0.45, 0.25], [0.5, 1.96, 0.38, -0.22], [0.1, 2.02, -0.38, 0.12], [-0.2, 1.94, 0.55, -0.15]]) {
    const lt = add(box(0.45, 0.32, 0.05), M.white, lx, ly, lz, mailG);
    lt.rotation.set(0.2, lz * 0.8, rz);
  }
  mailG.visible = mailbags;

  // Wicker Pigeon Cages strapped proudly to exterior sides of basket
  const cageG = new THREE.Group(); basketG.add(cageG);
  for (const [cx, cz] of [[1.26, 0], [-1.26, 0], [0, 1.26]]) {
    add(box(0.68, 0.56, 0.86), M.cage, cx, 0.88, cz, cageG);
  }
  cageG.visible = cages;

  // Rigging Hoop + 8 Shroud Ropes connecting basket to envelope neck
  const rigG = new THREE.Group(); root.add(rigG);
  const hoop = add(new THREE.TorusGeometry(0.92, 0.06, 8, 20), M.woodDark, 0, 2.55, 0, rigG);
  hoop.rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x0 = Math.cos(a) * 0.86, z0 = Math.sin(a) * 0.86;
    const x1 = Math.cos(a) * 0.90, z1 = Math.sin(a) * 0.90;
    const mid = new THREE.Vector3((x0 + x1) * 0.5, 1.95, (z0 + z1) * 0.5);
    const rope = add(new THREE.CylinderGeometry(0.032, 0.032, 1.25, 6), M.sandbag, mid.x, mid.y, mid.z, rigG);
    rope.rotation.z = (x0 - x1) * 0.25;
  }
  // Upper shroud fan up into envelope
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cx = Math.cos(a) * 1.45, cz = Math.sin(a) * 1.45;
    const r = add(new THREE.CylinderGeometry(0.028, 0.028, 2.35, 6), M.sandbag, cx * 0.85, 3.65, cz * 0.85, rigG);
    r.lookAt(Math.cos(a) * 0.9, 2.55, Math.sin(a) * 0.9);
    r.rotateX(Math.PI / 2);
  }

  // Sculpted Striped Envelope (anchored at neck y = 2.65 so scaling inflates cleanly upward!)
  const envGroup = new THREE.Group(); envGroup.position.set(0, 2.65, 0); root.add(envGroup);
  add(balloonLatheGeo, envMat, 0, 0, 0, envGroup);
  add(new THREE.CylinderGeometry(0.46, 0.42, 0.26, 16), M.brass, 0, 0.12, 0, envGroup);
  // Crown valve finial
  add(new THREE.SphereGeometry(0.32, 12, 10), M.gold, 0, 6.72, 0, envGroup);

  // Small French Tricolor Pennant flying from rigging hoop
  if (flags) {
    const flG = new THREE.Group(); flG.position.set(0.95, 2.58, 0); root.add(flG);
    add(box(0.45, 0.55, 0.05), M.blue, 0.22, 0, 0, flG);
    add(box(0.45, 0.55, 0.05), M.white, 0.67, 0, 0, flG);
    add(box(0.45, 0.55, 0.05), M.red, 1.12, 0, 0, flG);
    root.userData.flag = flG;
  }

  root.userData.envGroup = envGroup;
  root.userData.mailG = mailG;
  root.userData.cageG = cageG;
  root.userData.rigG = rigG;
  return root;
}

// =========================================================================
// WORLD 1: BESIEGED 1870 PARIS + GASWORKS + BLOCKADE + PRUSSIAN SIEGE RING
// =========================================================================
const parisG = new THREE.Group(); scene.add(parisG);

// Cobblestone Paris City Floor & surrounding green/earthen countryside plain
add(new THREE.CylinderGeometry(28, 28, 0.4, 36), M.cobble, -4, -0.20, 0, parisG, { cast: false });
const outerPlain = add(new THREE.RingGeometry(27.5, 240, 48), M.earth, 0, -0.04, 0, parisG, { cast: false });
outerPlain.rotation.x = -Math.PI / 2;

// Distant rolling Île-de-France hills ringing the horizon
const hillRng = P.rng(303);
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  const dist = 82 + hillRng() * 26;
  const h = add(new THREE.SphereGeometry(1, 12, 8), M.hillDark, Math.cos(a) * dist, -1.5, Math.sin(a) * dist, parisG, { cast: false });
  h.scale.set(22 + hillRng() * 14, 9 + hillRng() * 8, 18 + hillRng() * 12);
}

// River Seine ribbon running cleanly behind northern boulevards (z = -18)
add(box(44, 0.25, 5.2), M.seine, -6, -0.05, -18.5, parisG, { cast: false });
add(box(44, 0.7, 0.6), M.limestoneDark, -6, 0.30, -15.9, parisG);
add(box(44, 0.7, 0.6), M.limestoneDark, -6, 0.30, -21.1, parisG);
// Arched Parisian stone bridge over the Seine
add(box(4.8, 1.0, 6.2), M.limestone, -6, 0.55, -18.5, parisG);

// ---- ICONIC 1870 PARIS LANDMARKS (Authentic 1870 — Notre-Dame, Panthéon, Arc de Triomphe!) ----
// 1. NOTRE-DAME CATHEDRAL at (-10, 0, -27)
const notreDame = new THREE.Group(); notreDame.position.set(-10, 0, -27); parisG.add(notreDame);
add(box(10.5, 11.5, 8.5), M.cathedral, 0, 5.75, 0, notreDame);
// Twin Gothic Bell Towers
for (const tx of [-3.4, 3.4]) {
  add(box(3.3, 18.2, 3.6), M.limestone, tx, 9.1, 2.5, notreDame);
  add(box(3.6, 0.7, 3.9), M.limestoneDark, tx, 18.2, 2.5, notreDame);
  // Gothic lancet arch slots on towers
  add(box(0.95, 4.2, 0.2), M.iron, tx - 0.65, 14.5, 4.32, notreDame, { cast: false });
  add(box(0.95, 4.2, 0.2), M.iron, tx + 0.65, 14.5, 4.32, notreDame, { cast: false });
}
// Central Nave Roof & Tall Gothic Spire
const ndRoof = add(new THREE.ConeGeometry(4.2, 5.0, 4), M.mansard, 0, 14.0, -1.0, notreDame);
ndRoof.rotation.y = Math.PI / 4; ndRoof.scale.set(1.2, 1, 1.5);
add(new THREE.ConeGeometry(0.65, 9.5, 8), M.mansard, 0, 20.5, -1.2, notreDame);

// 2. PANTHÉON GOLDEN DOME at (-24, 0, -10)
const pantheon = new THREE.Group(); pantheon.position.set(-24, 0, -10); parisG.add(pantheon);
add(box(10.5, 7.5, 10.5), M.limestone, 0, 3.75, 0, pantheon);
add(new THREE.CylinderGeometry(3.8, 4.2, 4.5, 18), M.limestone, 0, 9.75, 0, pantheon);
add(new THREE.SphereGeometry(3.75, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), M.mansard, 0, 11.8, 0, pantheon);
add(new THREE.CylinderGeometry(0.8, 0.9, 2.8, 12), M.limestone, 0, 16.4, 0, pantheon);
add(new THREE.ConeGeometry(0.9, 1.8, 10), M.gold, 0, 18.6, 0, pantheon);

// 3. ARC DE TRIOMPHE at (-23, 0, 13)
const arcG = new THREE.Group(); arcG.position.set(-23, 0, 13); arcG.rotation.y = 0.45; parisG.add(arcG);
add(box(3.4, 8.8, 4.6), M.limestone, -3.5, 4.4, 0, arcG);
add(box(3.4, 8.8, 4.6), M.limestone, 3.5, 4.4, 0, arcG);
add(box(10.6, 4.2, 4.8), M.limestone, 0, 10.7, 0, arcG);
add(box(11.2, 0.85, 5.2), M.limestoneDark, 0, 12.9, 0, arcG);
add(box(11.0, 0.55, 5.0), M.limestoneDark, 0, 8.8, 0, arcG);

// ---- HAUSSMANN APARTMENT BLOCKS (swappable day/warm-lit night facades!) ----
const haussMeshesA = [], haussMeshesB = [];
const haussSpecs = [
  [-15, 0, -11, 7.2, 8.8, 6.4, 0],
  [-17, 0, 2.5, 7.4, 9.6, 7.2, 1],
  [-13, 0, 14.5, 7.6, 8.4, 6.2, 0],
  [-2.5, 0, -13.5, 7.5, 8.2, 5.4, 1],
  [9.5, 0, -13.5, 7.8, 8.6, 5.6, 0],
  [9.8, 0, 13.8, 7.6, 8.2, 5.8, 1],
  [-2.5, 0, 15.2, 7.2, 8.8, 5.4, 0],
  [-25, 0, -22, 8.2, 9.4, 7.4, 1],
  [3.5, 0, -25, 8.4, 9.0, 6.8, 0],
  [14.5, 0, -23, 7.6, 8.4, 6.6, 1],
  [-24, 0, 23, 8.0, 8.6, 6.8, 0],
  [2.5, 0, 24, 8.4, 8.4, 6.4, 1],
];
for (const [x, y, z, w, h, d, variant] of haussSpecs) {
  const b = add(box(w, h, d), variant ? M.haussDayB : M.haussDay, x, y + h / 2, z, parisG);
  (variant ? haussMeshesB : haussMeshesA).push(b);
  // Sloped Parisian zinc mansard roof + little stone chimneys!
  const rf = add(new THREE.CylinderGeometry(w * 0.48, w * 0.68, 2.4, 4), M.mansard, x, y + h + 1.2, z, parisG);
  rf.rotation.y = Math.PI / 4; rf.scale.set(1.02, 1, d / w);
  add(box(0.65, 1.35, 0.65), M.terracotta, x + w * 0.2, y + h + 2.5, z - d * 0.15, parisG);
  add(box(0.65, 1.15, 0.65), M.terracotta, x - w * 0.22, y + h + 2.4, z + d * 0.18, parisG);
}

// ---- CENTRAL PLACE SAINT-PIERRE LAUNCH PLAZA PROPS ----
// 1. Industrial Coal-Gas Tank (Gazomètre) at (-8.8, 0, -3.5) + thick inflation hose to (0, 0, 0)
const gasWorksG = new THREE.Group(); gasWorksG.position.set(-8.8, 0, -3.5); parisG.add(gasWorksG);
add(new THREE.CylinderGeometry(3.2, 3.2, 5.4, 24), M.gasTank, 0, 2.7, 0, gasWorksG);
add(new THREE.SphereGeometry(3.2, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.35), M.iron, 0, 4.9, 0, gasWorksG);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  add(box(0.24, 6.8, 0.24), M.iron, Math.cos(a) * 3.45, 3.4, Math.sin(a) * 3.45, gasWorksG);
}
const gasHoseCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5.8, 1.1, -2.5),
  new THREE.Vector3(-3.8, 0.38, -1.6),
  new THREE.Vector3(-1.8, 0.28, -0.7),
  new THREE.Vector3(-0.3, 0.55, 0.0),
]);
const gasHoseMesh = add(new THREE.TubeGeometry(gasHoseCurve, 22, 0.22, 10, false), M.iron, 0, 0, 0, parisG);

// 2. Ornate 19th-Century Parisian Gas Street Lamps around plaza
const lampGlobes = [];
for (const [lx, lz] of [[-6.5, 6.2], [6.8, 6.2], [6.8, -6.5], [-6.5, -7.8]]) {
  add(new THREE.CylinderGeometry(0.10, 0.20, 3.8, 10), M.iron, lx, 1.9, lz, parisG);
  const gl = add(new THREE.SphereGeometry(0.36, 12, 10), M.lampGlow, lx, 4.05, lz, parisG, { cast: false });
  lampGlobes.push(gl);
  add(new THREE.ConeGeometry(0.46, 0.36, 8), M.iron, lx, 4.46, lz, parisG);
}

// 3. Classic Parisian Postal Pillar Mailbox (for Shot 16 "So how did Paris get replies?")
const postBoxG = new THREE.Group(); postBoxG.position.set(4.0, 0, 2.2); parisG.add(postBoxG);
add(new THREE.CylinderGeometry(0.44, 0.50, 1.85, 14), M.blue, 0, 0.92, 0, postBoxG);
add(new THREE.CylinderGeometry(0.54, 0.44, 0.35, 14), M.gold, 0, 1.98, 0, postBoxG);
add(box(0.52, 0.14, 0.12), M.iron, 0, 1.48, 0.45, postBoxG);

// ---- EASTERN CITY FORTIFICATION WALL & GATE (x = 19) ----
for (const [wz, wl] of [[-12.5, 15.5], [12.5, 15.5]]) {
  add(box(2.6, 5.2, wl), M.limestoneDark, 19.0, 2.6, wz, parisG);
  for (let bz = wz - wl * 0.44; bz <= wz + wl * 0.44; bz += 2.2) {
    add(box(2.7, 0.9, 1.2), M.limestone, 19.0, 5.65, bz, parisG);
  }
}
// Stone City Gate flanking pillars & overhead lintel (x = 19, z = 0)
add(box(3.4, 7.2, 2.2), M.limestone, 19.0, 3.6, -4.4, parisG);
add(box(3.4, 7.2, 2.2), M.limestone, 19.0, 3.6, 4.4, parisG);
add(box(3.6, 2.2, 11.2), M.limestone, 19.0, 7.4, 0, parisG);
add(box(3.8, 0.65, 11.6), M.limestoneDark, 19.0, 8.7, 0, parisG);
// French Tricolor flags atop the City Gate
for (const fz of [-4.2, 4.2]) {
  add(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8), M.wood, 19.0, 10.6, fz, parisG);
  add(box(0.06, 0.95, 0.55), M.blue, 19.0, 11.8, fz + 0.32, parisG);
  add(box(0.06, 0.95, 0.55), M.white, 19.0, 11.8, fz + 0.87, parisG);
  add(box(0.06, 0.95, 0.55), M.red, 19.0, 11.8, fz + 1.42, parisG);
}

// ---- CLOSED INFRASTRUCTURE SETPIECES (x = 24..36) ----
// A. BLOCKED COBBLESTONE ROAD (x = 28, z = 0)
add(box(22, 0.14, 6.6), M.cobbleRoad, 29, 0.04, 0, parisG, { cast: false });
const roadBarrG = new THREE.Group(); roadBarrG.position.set(28.5, 0, 0); parisG.add(roadBarrG);
add(box(0.28, 0.85, 5.8), M.barricade, 0, 1.25, 0, roadBarrG);
for (const sz of [-2.4, 2.4]) add(box(0.45, 2.0, 0.45), M.woodDark, 0, 1.0, sz, roadBarrG);
// Spiked chevaux-de-frise logs & sandbags flanking the road barricade
for (const sz of [-1.8, 0, 1.8]) {
  const sp1 = add(new THREE.CylinderGeometry(0.07, 0.11, 2.2, 6), M.wood, 1.3, 0.85, sz, roadBarrG);
  sp1.rotation.z = 0.65;
  const sp2 = add(new THREE.CylinderGeometry(0.07, 0.11, 2.2, 6), M.wood, 1.3, 0.85, sz, roadBarrG);
  sp2.rotation.z = -0.65;
}
for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.48, 8, 6), M.sandbag, 2.1, 0.35, -2.5 + i * 1.0, roadBarrG);

// B. BLOCKED RAIL LINE (x = 20..38, z = -10.5)
const railG = new THREE.Group(); railG.position.set(28, 0, -10.5); parisG.add(railG);
for (let rx_ = -8; rx_ <= 10; rx_ += 0.95) add(box(0.32, 0.16, 2.8), M.woodDark, rx_, 0.08, 0, railG);
for (const rz of [-0.95, 0.95]) add(box(19, 0.22, 0.16), M.iron, 1, 0.24, rz, railG);
// Heavy red-and-white rail block buffer + upturned severed rail beams!
add(box(0.5, 1.6, 3.2), M.barricade, 1.5, 1.05, 0, railG);
const bentRail = add(box(3.4, 0.22, 0.22), M.iron, 2.8, 1.35, -0.8, railG); bentRail.rotation.z = 0.62;
const bentRail2 = add(box(3.0, 0.22, 0.22), M.iron, 2.7, 1.15, 0.85, railG); bentRail2.rotation.z = 0.48;

// C. CUT TELEGRAPH POLES & SNAPPED SPARKING WIRES (x = 29, z = -15.5)
const teleG = new THREE.Group(); teleG.position.set(29, 0, -15.5); parisG.add(teleG);
add(new THREE.CylinderGeometry(0.18, 0.25, 6.8, 10), M.woodDark, 0, 3.4, 0, teleG);
add(box(0.24, 0.28, 3.2), M.wood, 0, 6.2, 0, teleG);
add(box(0.24, 0.28, 2.6), M.wood, 0, 5.2, 0, teleG);
for (const iz of [-1.2, 0, 1.2]) add(new THREE.CylinderGeometry(0.10, 0.12, 0.26, 8), M.white, 0, 6.45, iz, teleG);
// Snapped sagging wires dangling dramatically downward from the cross-arm!
const wire1 = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 6.3, 1.2), new THREE.Vector3(0.7, 4.9, 1.35), new THREE.Vector3(1.15, 3.2, 1.4)]);
const wire2 = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 6.3, -1.2), new THREE.Vector3(0.85, 4.7, -1.1), new THREE.Vector3(1.4, 3.4, -0.9)]);
const wire3 = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 5.2, 0.9), new THREE.Vector3(-0.6, 4.0, 1.05), new THREE.Vector3(-1.1, 2.8, 1.15)]);
for (const wc of [wire1, wire2, wire3]) add(new THREE.TubeGeometry(wc, 12, 0.055, 6, false), M.iron, 0, 0, 0, teleG);
// Second intact pole behind toward Paris so the severed line reads instantly!
add(new THREE.CylinderGeometry(0.16, 0.22, 6.6, 8), M.woodDark, -8.5, 3.3, 0, teleG);
add(box(0.22, 0.26, 2.8), M.wood, -8.5, 6.1, 0, teleG);
const intactWire = new THREE.CatmullRomCurve3([new THREE.Vector3(-8.5, 6.2, 1.1), new THREE.Vector3(-4.2, 5.6, 1.15), new THREE.Vector3(0, 6.3, 1.2)]);
add(new THREE.TubeGeometry(intactWire, 14, 0.045, 6, false), M.iron, 0, 0, 0, teleG);

// ---- ENCIRCLING PRUSSIAN SIEGE TRENCHES, TENTS, CANNONS & CAMPFIRES ----
const siegeRingG = new THREE.Group(); parisG.add(siegeRingG);
// Perimeter ring of tents, sandbags & cannons encircling Paris (radius ~38m)
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2 + 0.15;
  const rx_ = Math.cos(a) * 39 - 4, rz_ = Math.sin(a) * 39;
  const g = new THREE.Group(); g.position.set(rx_, 0, rz_); g.rotation.y = -a + Math.PI; siegeRingG.add(g);
  // Pointed Prussian canvas bell tent
  add(new THREE.ConeGeometry(2.3, 3.8, 8), M.tent, 0, 1.9, -2.5, g);
  add(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), M.wood, 0, 4.3, -2.5, g);
  add(box(0.08, 0.55, 0.95), M.iron, 0, 4.7, -2.0, g);
  // Sandbag parapet + dark iron siege cannon aimed right at Paris!
  add(box(4.6, 1.1, 1.2), M.sandbag, 0, 0.55, 1.8, g);
  const brl = add(new THREE.CylinderGeometry(0.24, 0.34, 2.8, 10), M.iron, 0, 1.25, 2.6, g);
  brl.rotation.x = Math.PI / 2 - 0.18;
  for (const wx of [-0.68, 0.68]) {
    const wh = add(new THREE.CylinderGeometry(0.65, 0.65, 0.16, 12), M.woodDark, wx, 0.65, 2.2, g);
    wh.rotation.z = Math.PI / 2;
  }
}

// Hero Prussian Trench & Anti-Balloon Swivel Battery at (33, 0, 9) for Shots 9 & 22!
const heroTrenchG = new THREE.Group(); heroTrenchG.position.set(33, 0, 9); parisG.add(heroTrenchG);
for (let row = 0; row < 2; row++) {
  for (let k = -4; k <= 4; k++) {
    const sb = add(new THREE.SphereGeometry(0.55, 8, 6), M.sandbag, -2.2 + row * 0.25, 0.38 + row * 0.56, k * 0.95, heroTrenchG);
    sb.scale.set(0.85, 0.72, 1.15);
  }
}
// Famous 1870 Krupp "Ballonkanone" (swivel anti-balloon gun angled steeply toward the sky!)
add(new THREE.CylinderGeometry(0.30, 0.45, 1.2, 10), M.woodDark, -0.5, 0.6, 0, heroTrenchG);
const antiAirBarrel = add(new THREE.CylinderGeometry(0.14, 0.22, 3.2, 12), M.iron, -1.2, 2.2, 0, heroTrenchG);
antiAirBarrel.rotation.z = 0.85;
// Glowing Campfire for Night Shot 9 ("drifting over enemy lines")
const campFireG = new THREE.Group(); campFireG.position.set(0.6, 0.1, 1.4); heroTrenchG.add(campFireG);
for (let i = 0; i < 4; i++) {
  const lg = add(new THREE.CylinderGeometry(0.11, 0.12, 1.2, 6), M.woodDark, 0, 0.15, 0, campFireG);
  lg.rotation.set(0.4, i * 0.8, 1.15);
}
const flameOuter = add(new THREE.ConeGeometry(0.45, 1.2, 8), M.fireGlow, 0, 0.72, 0, campFireG, { cast: false, ndSkip: true });
const flameInner = add(new THREE.ConeGeometry(0.24, 0.78, 8), M.fireCore, 0, 0.56, 0, campFireG, { cast: false, ndSkip: true });

// =========================================================================
// WORLD 2: RURAL FRENCH COUNTRYSIDE MEADOW (x = +120, z = 0)
// =========================================================================
const countryG = new THREE.Group(); countryG.position.set(120, 0, 0); scene.add(countryG);
add(new THREE.CylinderGeometry(48, 52, 0.5, 36), M.meadow, 0, -0.25, 0, countryG, { cast: false });
// Winding dirt country lane
add(box(44, 0.08, 4.4), M.sandbag, 0, 0.03, 4.5, countryG, { cast: false });
// Rolling green provincial hills around the meadow
for (const [hx, hz, sx, sy, sz] of [[-22, -22, 16, 7, 14], [18, -24, 18, 8, 15], [30, 8, 16, 6.5, 16], [-28, 14, 15, 6, 15]]) {
  const h = add(new THREE.SphereGeometry(1, 12, 8), M.meadow, hx, -0.8, hz, countryG, { cast: false });
  h.scale.set(sx, sy, sz);
}
// Charming French limestone farmhouse cottage with terracotta pitched roof
const cottage = new THREE.Group(); cottage.position.set(-10, 0, -10.5); cottage.rotation.y = 0.25; countryG.add(cottage);
add(box(7.2, 4.4, 5.6), M.limestone, 0, 2.2, 0, cottage);
const cRoof = add(new THREE.ConeGeometry(5.8, 2.8, 4), M.terracotta, 0, 5.8, 0, cottage);
cRoof.rotation.y = Math.PI / 4; cRoof.scale.set(1.02, 1, 0.85);
add(box(1.3, 2.4, 0.16), M.woodDark, 0, 1.2, 2.82, cottage);
for (const wx of [-2.1, 2.1]) add(box(1.1, 1.1, 0.16), M.blue, wx, 2.6, 2.82, cottage);

// Slender French Poplar / Cypress Trees
const poplar = (x, z, h = 8.2) => {
  add(new THREE.CylinderGeometry(0.18, 0.28, 2.6, 8), M.wood, x, 1.3, z, countryG);
  const f = add(new THREE.SphereGeometry(1.4, 10, 8), M.foliage, x, 2.2 + h * 0.42, z, countryG);
  f.scale.set(0.85, h * 0.34, 0.85);
};
for (const [px, pz, ph] of [[-16, -6, 8.5], [-14, -12, 7.6], [10, -12, 9.0], [14, -8, 7.8], [16, 4, 8.2], [-18, 8, 7.5], [4, -15, 8.4]]) {
  poplar(px, pz, ph);
}

// Wooden Pigeon Release Cage on a wooden stand (for Shot 19: "Then, once free, the pigeons flew home!")
const releaseCageG = new THREE.Group(); releaseCageG.position.set(1.2, 0, 1.8); countryG.add(releaseCageG);
add(box(1.6, 0.72, 1.2), M.wood, 0, 0.36, 0, releaseCageG);
add(box(1.45, 0.92, 1.05), M.cage, 0, 1.18, 0, releaseCageG);
const cageDoorPivot = new THREE.Group(); cageDoorPivot.position.set(0.72, 1.18, 0.54); releaseCageG.add(cageDoorPivot);
add(box(0.08, 0.88, 1.02), M.woodDark, 0, 0, -0.51, cageDoorPivot);

// =========================================================================
// WORLD 3: 1870 MICROFILM PHOTOGRAPHY STUDIO (x = -120, z = 0)
// =========================================================================
const studioG = new THREE.Group(); studioG.position.set(-120, 0, 0); scene.add(studioG);
// Wide mahogany workbench (top surface y = 2.0) + dark studio wall backdrop
add(tbox(24, 0.8, 16, 4), M.bench, 0, 1.6, 0, studioG, { cast: false });
add(box(32, 20, 0.5), M.studioWall, 0, 10.0, -7.2, studioG, { cast: false });
// Hanging studio brass lamp dome above table
add(new THREE.CylinderGeometry(0.06, 0.06, 4.0, 8), M.iron, 0, 10.2, -0.5, studioG);
add(new THREE.ConeGeometry(1.4, 0.75, 16), M.brass, 0, 8.1, -0.5, studioG);
add(new THREE.SphereGeometry(0.38, 12, 10), M.lampGlow, 0, 7.75, -0.5, studioG, { cast: false });

// Giant Printed Dispatch Board ("DÉPÊCHES DE PARIS • 1870") on wooden easel on left of bench
const boardG = new THREE.Group(); boardG.position.set(-4.3, 2.0, -1.6); boardG.rotation.y = 0.32; studioG.add(boardG);
add(box(4.6, 3.55, 0.24), M.woodDark, 0, 2.45, 0, boardG);
add(new THREE.PlaneGeometry(4.42, 3.36), M.dispatchBoard, 0, 2.45, 0.14, boardG, { cast: false });
for (const lx of [-1.6, 1.6]) add(box(0.22, 1.1, 0.22), M.wood, lx, 0.55, 0, boardG);

// Iconic 1870 Brass & Mahogany Bellows Camera on tripod facing the dispatch board!
const camRigG = new THREE.Group(); camRigG.position.set(1.2, 2.0, -1.4); camRigG.rotation.y = -0.22; studioG.add(camRigG);
// Wooden tripod legs
for (const [lx, lz, rx_, rz_] of [[-0.7, 0.6, 0.32, 0.35], [0.7, 0.6, 0.32, -0.35], [0, -0.75, -0.38, 0]]) {
  const leg = add(new THREE.CylinderGeometry(0.07, 0.05, 2.2, 8), M.wood, lx, 1.0, lz, camRigG);
  leg.rotation.set(rx_, 0, rz_);
}
// Mahogany rear plate box + accordion leather bellows + brass front lens pointing left (-X)
add(box(1.15, 1.65, 1.65), M.woodDark, 0.85, 2.45, 0, camRigG);
for (let i = 0; i < 6; i++) {
  const s = 1.48 - i * 0.11;
  add(box(0.26, s, s), M.bellows, 0.15 - i * 0.23, 2.45, 0, camRigG);
}
add(box(0.32, 1.05, 1.05), M.woodDark, -1.25, 2.45, 0, camRigG);
const lens = add(new THREE.CylinderGeometry(0.36, 0.42, 0.68, 18), M.brass, -1.65, 2.45, 0, camRigG);
lens.rotation.z = Math.PI / 2;
add(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), new THREE.MeshBasicMaterial({ color: '#8ad8ff', fog: false }), -2.0, 2.45, 0, camRigG, { cast: false });

// Glowing Golden Optical Projection Cone (shrinking giant dispatches -> tiny lens!)
const beamCone = add(new THREE.ConeGeometry(1.95, 3.8, 20, 1, true), M.beamGlow, -1.55, 4.45, -1.5, studioG, { cast: false, receive: false, ndSkip: true });
beamCone.rotation.z = -Math.PI / 2;

// Hero Microfilm Display Stand + Brass Quill Tube + Wooden Pigeon Perch (foreground for Shot 21!)
const microStageG = new THREE.Group(); microStageG.position.set(0.2, 2.0, 2.2); studioG.add(microStageG);
// Glowing amber Microfilm Strip held upright in brass clamp on left
add(box(0.35, 0.18, 0.35), M.brass, -1.25, 0.09, 0, microStageG);
add(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8), M.brass, -1.25, 0.42, 0, microStageG);
const filmCard = add(box(2.05, 1.32, 0.05), M.microfilm, -1.25, 1.22, 0, microStageG);
filmCard.rotation.y = 0.18;
// Miniature red-and-gold quill message tube resting on table right in center
const quillTube = new THREE.Group(); quillTube.position.set(0.15, 0.20, 0.55); quillTube.rotation.y = -0.35; microStageG.add(quillTube);
const qtBody = add(new THREE.CylinderGeometry(0.16, 0.16, 0.92, 14), M.red, 0, 0, 0, quillTube); qtBody.rotation.z = Math.PI / 2;
const qtBand = add(new THREE.CylinderGeometry(0.175, 0.175, 0.24, 14), M.gold, 0, 0, 0, quillTube); qtBand.rotation.z = Math.PI / 2;
const qtScroll = add(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 12), M.white, 0.54, 0, 0, quillTube); qtScroll.rotation.z = Math.PI / 2;
// Wooden perch block for the Hero Carrier Pigeon on the right
add(new THREE.CylinderGeometry(0.55, 0.68, 0.52, 14), M.wood, 1.45, 0.26, 0, microStageG);

// =========================================================================
// HERO & FLEET 3D GAS BALLOONS
// =========================================================================
const heroBalloon = makeBalloon(M.balloonRed, { mailbags: true, cages: false, flags: true });
scene.add(heroBalloon);

const balloonMats = [M.balloonBlue, M.balloonGold, M.balloonTeal, M.balloonTri, M.balloonRed, M.balloonGold, M.balloonBlue, M.balloonTeal, M.balloonTri];
const fleetBalloons = balloonMats.map((mat, i) => {
  const b = makeBalloon(mat, { mailbags: i % 2 === 0, cages: i % 3 === 0, flags: true });
  b.visible = false;
  scene.add(b);
  return b;
});

// ---------- painted cartoon clouds (billboards, CPU-safe canvas, no ink) ----------
const clouds = [];
{
  const r = P.rng(91);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    const pen = new T.Pen(c.getContext('2d', { willReadFrequently: true })); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 420 + r() * 260;
    m.position.set(Math.cos(a) * d, 90 + r() * 130, Math.sin(a) * d);
    m.scale.setScalar(115 + r() * 120);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  }
}

// ---------- 2D billboard cards (CPU-safe canvas + NoBlending cardNd) ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM);
cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.58));

class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CW; this.c.height = CH;
    this.g = this.c.getContext('2d', { willReadFrequently: true });
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat);
    this.mesh.userData.nd = cardNd(this.t);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob);
    this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return;
    this.key = key;
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH);
    g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p);
    this.t.needsUpdate = true;
  }
}
const cards = [];
const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- full-res 1080x1920 render targets & ink/grade post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };

const inkU = {
  col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) },
  px: { value: 2.3 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.12 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) },
  vig: { value: 0.18 }, flash: { value: 0 },
};
const inkScene = fs(new THREE.ShaderMaterial({
  uniforms: inkU,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){
      float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.007, .022, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.86, .70, dot(n, ns)) * .88);
    }
    return e * (1. - smoothstep(160., 550., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.014,.010,.016), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.1;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.);
  }`,
}));

const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 10 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({
  uniforms: dofU,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  void main(){
    gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.));
  }`,
}));
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame updates ----------
const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor);
  skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el);
  tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 85); sun.target.position.copy(focus);
  const ext = L.shadowExt || 32, sc = sun.shadow.camera;
  sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 220; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  const t = f / 30;
  const isNight = !!S.night;
  const isStudio = !!S.studioStage;
  const isCountry = !!S.countryStage;

  // Toggle isolated worlds cleanly
  parisG.visible = !isStudio && !isCountry;
  countryG.visible = isCountry;
  studioG.visible = isStudio;
  nightSkyG.visible = isNight && !isStudio;
  nightSkyG.position.set(camera.position.x, 0, camera.position.z);

  // Day vs Warm-Lit Night Haussmann windows
  for (const m of haussMeshesA) m.material = isNight ? M.haussNight : M.haussDay;
  for (const m of haussMeshesB) m.material = isNight ? M.haussNightB : M.haussDayB;

  // Flickering night campfire & street lamp glow
  campFireG.visible = isNight || !!S.campfire;
  flameOuter.scale.set(1 + Math.sin(t * 14) * 0.12, 1 + Math.cos(t * 18) * 0.16, 1);
  flameInner.scale.set(1 + Math.cos(t * 17) * 0.14, 1 + Math.sin(t * 21) * 0.18, 1);

  // Gasworks inflation hose visibility
  gasHoseMesh.visible = !!S.gasHose;
  postBoxG.visible = S.postBox !== false;

  // Hero 3D Balloon state (position, inflation, cargo, sway)
  heroBalloon.visible = !!S.heroBalloon;
  if (S.heroBalloon) {
    const hb = S.heroBalloon;
    heroBalloon.position.set(hb.x, hb.y, hb.z);
    heroBalloon.rotation.set(hb.rx || 0, hb.ry || 0, (hb.rz || 0) + Math.sin(t * 1.9) * (hb.sway ?? 0.04));
    heroBalloon.scale.setScalar(hb.s || 1);
    const infl = hb.inflate ?? 1.0;
    heroBalloon.userData.envGroup.scale.set(0.32 + 0.68 * infl, 0.24 + 0.76 * infl, 0.32 + 0.68 * infl);
    heroBalloon.userData.mailG.visible = hb.mailbags !== false;
    heroBalloon.userData.cageG.visible = !!hb.cages;
    if (heroBalloon.userData.flag) heroBalloon.userData.flag.rotation.y = Math.sin(t * 7.5) * 0.24;
  }

  // Fleet 3D Balloons across the Parisian & countryside sky
  const fl = S.fleet || [];
  fleetBalloons.forEach((b, i) => {
    const spec = fl[i];
    b.visible = !!spec;
    if (spec) {
      b.position.set(spec.x, spec.y + Math.sin(t * 1.6 + i * 1.3) * 0.35, spec.z);
      b.rotation.set(0, (spec.ry || 0) + t * 0.12, (spec.rz || 0) + Math.sin(t * 1.5 + i) * 0.05);
      b.scale.setScalar(spec.s || 1);
      b.userData.cageG.visible = !!spec.cages;
      if (b.userData.flag) b.userData.flag.rotation.y = Math.sin(t * 6.5 + i) * 0.25;
    }
  });

  // World 2 Pigeon Release Cage door animation
  releaseCageG.visible = isCountry && !!S.releaseCage;
  cageDoorPivot.rotation.y = (S.cageDoorOpen || 0) * -2.2;

  // World 3 Microfilm Studio beam & stage visibility
  beamCone.visible = isStudio && S.opticalBeam !== false;
  if (beamCone.visible) M.beamGlow.opacity = 0.20 + 0.09 * Math.sin(t * 8.0);
  microStageG.visible = isStudio && !!S.microStage;
  boardG.visible = isStudio && S.showCameraStage !== false;
  camRigG.visible = isStudio && S.showCameraStage !== false;
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true;
    c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1;
    c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff');
    c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) {
      c.blob.visible = true;
      c.blob.position.set(a.x, (a.ground ?? a.y) + 0.03, a.z);
      c.blob.scale.set(0.95 * s, 0.6 * s, 1);
    }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o === sky || o.userData.sky) {
        o.userData.vis0 = o.visible; o.visible = false; return;
      }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0;
      if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  for (const c of clouds) {
    c.visible = !W_.studioStage;
    c.material.color.set(W_.night ? '#475c85' : '#ffffff');
    c.quaternion.copy(camera.quaternion);
  }

  // Pass A: color
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // Pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled;
  renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;

  if (window.DEBUG_ND) { const ds = fs(new THREE.MeshBasicMaterial({ map: rtNd.texture })); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }

  // Pass C: ink + grade
  const D = dofAt(f);
  inkU.px.value = W_.studioStage ? 2.0 : 2.3;
  inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0);
  inkU.vig.value = L.vig ?? 0.18;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);

  // Final crisp sRGB copy (cinf strictly 0)
  dofU.focus.value = D.focus; dofU.cinf.value = 0; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};

window.TOTAL = TOTAL;
window.ready = true;
