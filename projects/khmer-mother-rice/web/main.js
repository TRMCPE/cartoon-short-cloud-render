import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

// ---------- Strict Native 1080x1920 Resolution Lock ----------
const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- Painted 2-Step Toon Materials ----------
const grad = (() => {
  const d = new Uint8Array([96, 96, 96, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });

const M = {
  grass: texM(P.grass(6), 42, 42),
  tile: texM(P.courtyardTile(12), 8, 3),
  kitchenTile: texM(P.courtyardTile(18), 4, 3),
  plank: texM(P.planks(1, 26, 48), 3, 2),
  plankLight: texM(P.planks(4, 30, 56), 2, 2),
  beam: texM(P.beam(2), 1, 2),
  bamboo: texM(P.wovenBamboo(15), 2, 2),
  basket: texM(P.wovenBamboo(29), 2, 1),
  roof: texM(P.clayTileRoof(9), 4, 2),
  matRed: texM(P.sleepingMat(23), 1, 1),
  curtain: texM(P.curtainTex(), 1, 1),
  steel: texM(P.brushedMetal(31), 1, 1),
  clockDial: toon({ map: P.tex(P.clockDialTex(), 1, 1) }),
  gold: toon({ color: '#f2c144' }),
  redRunner: toon({ color: '#c92e3a' }),
  pillowWhite: toon({ color: '#fffdf7' }),
  riceWhite: toon({ color: '#ffffff' }),
  waterClear: toon({ color: '#9ee0ff' }),
  fishSilver: toon({ color: '#cad8e6' }),
  fishFried: toon({ color: '#e08b26' }),
  soupGold: toon({ color: '#f2b63d' }),
  vegLeaf: toon({ color: '#389e48', side: THREE.DoubleSide }),
  vegStem: toon({ color: '#68c454' }),
  clayPot: toon({ color: '#8f4a28' }),
  clayStove: toon({ color: '#9c5a3c' }),
  ashGrey: toon({ color: '#696662' }),
  ember: new THREE.MeshBasicMaterial({ color: '#ff701f' }),
  flame: new THREE.MeshBasicMaterial({ color: '#ffd447' }),
  screenGlow: new THREE.MeshBasicMaterial({ color: '#5ce1ff' }),
  darkInk: toon({ color: '#241726' }),
  chiliRed: toon({ color: '#d92929' }),
  garlicCream: toon({ color: '#f5eedc' }),
  trunk: toon({ color: '#6e492e' }),
  palmTrunk: toon({ color: '#78583e' }),
  canopyA: toon({ color: '#3f873c' }),
  canopyB: toon({ color: '#539e43' }),
  palmLeaf: toon({ color: '#58a13e', side: THREE.DoubleSide }),
  hill: toon({ color: '#6da34d' }),
  hillFar: toon({ color: '#82b368' }),
};

// ---------- Anti-Glitch Locked Normal+Depth Shaders ----------
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

// ---------- Geometry Helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  parent.add(m);
  return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k;
    uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t);
  }
  return g;
};

// ---------- Sky & Lights ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.ndSkip = true; sky.userData.sky = true; scene.add(sky);

const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 70, 700);

const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// Main sunlit Cambodian lawn & terracotta courtyard walkway connecting Bedroom (-14) -> Kitchen (+14)
const lawn = add(new THREE.PlaneGeometry(420, 420), M.grass, 0, DECK - 0.02, 0, world, { cast: false });
lawn.rotation.x = -Math.PI / 2;

const walkway = add(new THREE.PlaneGeometry(24.0, 3.8), M.tile, 0, DECK + 0.005, 0.2, world, { cast: false });
walkway.rotation.x = -Math.PI / 2;

// ============================================================================
// ZONE A (x = -14.0): KID'S BEDROOM / VERANDA (គ្រែដេកថ្ងៃត្រង់, កន្លែងលេងហ្គេម, នាឡិកា)
// ============================================================================
const roomG = new THREE.Group(); roomG.position.set(-14.0, DECK, 0); world.add(roomG);
{
  // Polished wooden floor deck (y = 0.01)
  add(tbox(10.2, 0.08, 6.2, 2), M.plank, 0, -0.03, -0.2, roomG, { cast: false });
  // Back wooden house wall strictly at z = -2.85 (100% behind actors!)
  add(tbox(10.2, 3.9, 0.22, 2), M.plankLight, 0, 1.95, -2.85, roomG);
  // Corner wooden pillars strictly at back corners & far outer edges (x = +-4.95)
  for (const px of [-4.95, 4.95]) {
    add(tbox(0.26, 4.1, 0.26, 1.5), M.beam, px, 2.05, -2.75, roomG);
    add(tbox(0.24, 4.1, 0.24, 1.5), M.beam, px, 2.05, 2.55, roomG);
  }
  // High pitched Khmer clay-tile roof at y = 4.15 (never enters medium camera frustums!)
  const rf = add(tbox(11.0, 0.22, 6.8, 2), M.roof, 0, 4.35, -0.1, roomG);
  rf.rotation.x = 0.14;
  add(tbox(11.0, 0.18, 0.20, 1.5), M.gold, 0, 3.95, 2.65, roomG);

  // Sunny Bedroom Window at x = -2.2, y = 2.15, z = -2.70 with cheerful sky-blue curtains
  add(box(1.9, 1.35, 0.08), M.waterClear, -2.2, 2.15, -2.72, roomG, { cast: false });
  add(tbox(2.1, 0.12, 0.14, 1), M.beam, -2.2, 2.86, -2.68, roomG);
  add(tbox(2.1, 0.12, 0.14, 1), M.beam, -2.2, 1.44, -2.68, roomG);
  for (const s of [-1, 1]) {
    add(tbox(0.42, 1.45, 0.10, 1), M.curtain, -2.2 + s * 0.88, 2.15, -2.65, roomG);
  }

  // 1. Cozy Carved Khmer Teak Daybed (គ្រែដេកថ្ងៃត្រង់) centered at local x = -1.6, z = -0.65 (world x = -15.6)
  const bedG = new THREE.Group(); bedG.position.set(-1.6, 0, -0.65); roomG.add(bedG);
  add(tbox(2.65, 0.18, 1.45, 1.5), M.beam, 0, 0.44, 0, bedG);
  for (const lx of [-1.2, 1.2]) for (const lz of [-0.62, 0.62]) {
    add(tbox(0.14, 0.44, 0.14, 1), M.beam, lx, 0.22, lz, bedG);
  }
  // Headboard on left
  add(tbox(0.14, 0.95, 1.48, 1.5), M.beam, -1.28, 0.68, 0, bedG);
  // Traditional woven red Khmer sleeping mat (កន្ទេលក្រហម) + white pillow
  add(tbox(2.48, 0.08, 1.34, 1.5), M.matRed, 0.04, 0.56, 0, bedG);
  const pil = add(new THREE.SphereGeometry(0.28, 12, 10), M.pillowWhite, -0.88, 0.68, 0, bedG);
  pil.scale.set(0.95, 0.48, 1.45);

  // 2. Low Gaming Desk & Monitor/Console Setup at local x = +1.85, z = -0.75 (world x = -12.15)
  const deskG = new THREE.Group(); deskG.position.set(1.85, 0, -0.75); roomG.add(deskG);
  add(tbox(1.55, 0.10, 0.85, 1.5), M.plankLight, 0, 0.62, 0, deskG);
  for (const lx of [-0.68, 0.68]) for (const lz of [-0.34, 0.34]) {
    add(tbox(0.10, 0.62, 0.10, 1), M.beam, lx, 0.31, lz, deskG);
  }
  // Glowing arcade screen on desk
  add(box(0.72, 0.46, 0.06), M.darkInk, 0, 0.94, -0.12, deskG);
  add(box(0.64, 0.38, 0.07), M.screenGlow, 0, 0.94, -0.11, deskG, { cast: false });
  add(box(0.18, 0.10, 0.14), M.darkInk, 0, 0.70, -0.12, deskG);
}

// 3. Giant Animated 3D Wall Clock (នាឡិកា ៥ នាទី -> ១ ម៉ោង) at world (-13.6, 2.35, -2.66)
const clockG = new THREE.Group(); clockG.position.set(-13.6, 2.35, -2.66); world.add(clockG);
const clockRim = add(new THREE.TorusGeometry(0.56, 0.065, 10, 28), M.redRunner, 0, 0, 0, clockG);
const clockFaceMesh = add(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 28), M.clockDial, 0, 0, 0, clockG);
clockFaceMesh.rotation.x = Math.PI / 2; clockFaceMesh.rotation.y = Math.PI / 2;
const hourPivot = new THREE.Group(); hourPivot.position.set(0, 0, 0.05); clockG.add(hourPivot);
add(box(0.055, 0.28, 0.03), M.darkInk, 0, 0.11, 0, hourPivot, { cast: false });
const minPivot = new THREE.Group(); minPivot.position.set(0, 0, 0.065); clockG.add(minPivot);
add(box(0.04, 0.42, 0.03), M.redRunner, 0, 0.17, 0, minPivot, { cast: false });
add(new THREE.SphereGeometry(0.055, 10, 8), M.gold, 0, 0, 0.075, clockG, { cast: false });

// ============================================================================
// ZONE B (x = 0.0): COURTYARD GARDEN & TOGGLED "DREAM FEAST TABLE" (តុម្ហូបពេញតុក្នុងក្តីស្រមៃ)
// ============================================================================
// Traditional Background Khmer Stilt House in garden (strictly far behind at z = -14.5)
{
  const bgH = new THREE.Group(); bgH.position.set(-1.5, DECK, -14.5); world.add(bgH);
  for (const px of [-2.8, 0, 2.8]) for (const pz of [-1.8, 1.8]) {
    add(new THREE.CylinderGeometry(0.16, 0.19, 2.2, 8), M.beam, px, 1.1, pz, bgH);
  }
  add(tbox(6.6, 0.24, 4.6, 2), M.plank, 0, 2.3, 0, bgH);
  add(tbox(6.2, 2.4, 4.2, 2), M.bamboo, 0, 3.6, 0, bgH);
  for (const s of [-1, 1]) {
    const rf = add(tbox(7.2, 0.22, 3.1, 2), M.roof, 0, 5.6, s * 1.25, bgH);
    rf.rotation.x = s * 0.62;
  }
}

// Tropical Cambodian Sugar Palms & Fruit Trees (strictly behind z <= -3.8!)
const sugarPalm = (x, z, h = 9.0) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  for (let i = 0; i < 5; i++) {
    const y0 = (i / 5) * h, sh = h / 5 + 0.1;
    add(new THREE.CylinderGeometry(0.20 * (1 - (i + 1) * 0.08), 0.22 * (1 - i * 0.08), sh, 8), M.palmTrunk, Math.sin(i * 0.3) * 0.18, y0 + sh / 2, 0, g);
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const frond = add(new THREE.ConeGeometry(0.52, 2.5, 4), M.palmLeaf, Math.cos(a) * 1.1, h - 0.1, Math.sin(a) * 1.1, g);
    frond.scale.set(1, 1, 0.18); frond.rotation.order = 'YXZ';
    frond.rotation.y = -a + Math.PI / 2; frond.rotation.x = 1.18 + (k % 2) * 0.2;
  }
};
const gardenTree = (x, z, h = 6.8, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.22, 0.36, h * 0.55, 8), M.trunk, 0, h * 0.27, 0, g);
  add(new THREE.SphereGeometry(2.0 * s, 12, 10), M.canopyA, 0, h * 0.68, 0, g).scale.set(1.15, 0.82, 1.05);
  add(new THREE.SphereGeometry(1.4 * s, 10, 8), M.canopyB, -1.0, h * 0.58, 0.5, g).scale.set(1.1, 0.78, 1.0);
};
[[-21, -7.5, 9.6], [-7.5, -6.5, 9.2], [5.5, -7.0, 9.8], [21.5, -7.2, 9.4], [-11, -18, 10.8], [10, -17, 10.5]].forEach(([x, z, h]) => sugarPalm(x, z, h));
[[-6.2, -4.4, 6.5, 0.9], [3.8, -4.6, 6.8, 0.95], [8.2, -5.2, 6.4, 0.88], [-20.5, -4.2, 6.6, 0.9]].forEach(([x, z, h, s]) => gardenTree(x, z, h, s));

// Rolling distant green countryside hills
{
  const rm = P.rng(109);
  for (let i = 0; i < 16; i++) {
    const a = rm() * Math.PI * 2, d = 165 + rm() * 130;
    const h = add(new THREE.SphereGeometry(42 + rm() * 34, 16, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -12, Math.sin(a) * d, world, { cast: false });
    h.scale.y = 0.42 + rm() * 0.22;
  }
}

// Painted billboard clouds
const clouds = [];
{
  const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    const pen = new T.Pen(c.getContext('2d', { willReadFrequently: true })); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 620 + r() * 240;
    m.position.set(Math.cos(a) * d, 115 + r() * 135, Math.sin(a) * d);
    m.scale.setScalar(150 + r() * 130);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  }
}

// Toggled 3D "Dream Feast Table" (តុបាយក្តៅៗហុយផ្សែង និងម្ហូបពេញតុរួចជាស្រេច!) at (2.15, 0, 0.25)
const dreamFeastG = new THREE.Group(); dreamFeastG.position.set(2.15, DECK, 0.25); scene.add(dreamFeastG);
const feastHalo = new THREE.Mesh(
  new THREE.CircleGeometry(1.55, 32),
  new THREE.MeshBasicMaterial({ color: '#ffe36e', transparent: true, opacity: 0.42, depthWrite: false })
);
feastHalo.userData.ndSkip = true; scene.add(feastHalo);
{
  // Round teak table + festive crimson silk runner (scaled cleanly for 9:16 two-shot with Kid!)
  add(new THREE.CylinderGeometry(0.96, 0.96, 0.10, 24), M.plankLight, 0, 0.72, 0, dreamFeastG);
  add(tbox(1.94, 0.11, 0.44, 1.5), M.redRunner, 0, 0.725, 0, dreamFeastG);
  for (const [lx, lz] of [[-0.54, -0.54], [0.54, -0.54], [-0.54, 0.54], [0.54, 0.54]]) {
    add(new THREE.CylinderGeometry(0.06, 0.05, 0.72, 8), M.beam, lx, 0.36, lz, dreamFeastG);
  }
  // Centerpiece: Giant Steaming Fluffy White Rice Pot (ឆ្នាំងបាយក្តៅៗហុយផ្សែង!)
  add(new THREE.CylinderGeometry(0.32, 0.26, 0.26, 18), M.gold, 0, 0.90, -0.04, dreamFeastG);
  add(new THREE.SphereGeometry(0.30, 16, 12), M.riceWhite, 0, 1.06, -0.04, dreamFeastG).scale.set(1, 0.68, 1);
  // Left Dish: Crispy Golden Whole Fried Fish (ត្រីចៀនមាសឆ្ងាញ់!)
  add(new THREE.CylinderGeometry(0.28, 0.22, 0.06, 16), M.pillowWhite, -0.48, 0.80, 0.15, dreamFeastG);
  const ff = add(new THREE.SphereGeometry(0.20, 12, 8), M.fishFried, -0.48, 0.87, 0.15, dreamFeastG);
  ff.scale.set(1.45, 0.42, 0.68);
  // Right Dish: Savory Golden Khmer Samlor Soup Bowl (សម្លក្តៅៗ!)
  add(new THREE.CylinderGeometry(0.26, 0.17, 0.18, 16), M.clayPot, 0.48, 0.86, 0.15, dreamFeastG);
  add(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), M.soupGold, 0.48, 0.94, 0.15, dreamFeastG);
  // Front Bowls
  for (const bx of [-0.24, 0.24]) {
    add(new THREE.CylinderGeometry(0.14, 0.09, 0.10, 12), M.pillowWhite, bx, 0.82, 0.42, dreamFeastG);
    add(new THREE.SphereGeometry(0.12, 10, 8), M.riceWhite, bx, 0.88, 0.42, dreamFeastG).scale.set(1, 0.55, 1);
  }
}

// ============================================================================
// ZONE C (x = +14.0): TRADITIONAL KHMER KITCHEN (ផ្ទះបាយខ្មែរ — លាងអង្ករ, ត្រីចានដែក, កន្ត្រកត្រកួន!)
// ============================================================================
const kitchenG = new THREE.Group(); kitchenG.position.set(14.0, DECK, 0); world.add(kitchenG);
let rawFishMesh, stoveFireG, pickedColanderG, riceWaterMesh;
{
  // Warm terracotta kitchen floor (y = 0.01)
  add(tbox(10.6, 0.08, 6.4, 2), M.kitchenTile, 0, -0.03, -0.1, kitchenG, { cast: false });
  // Woven bamboo kitchen back wall strictly at z = -2.85
  add(tbox(10.6, 3.9, 0.20, 2), M.bamboo, 0, 1.95, -2.85, kitchenG);
  for (const px of [-5.1, 5.1]) {
    add(tbox(0.26, 4.1, 0.26, 1.5), M.beam, px, 2.05, -2.75, kitchenG);
    add(tbox(0.24, 4.1, 0.24, 1.5), M.beam, px, 2.05, 2.65, kitchenG);
  }
  const krf = add(tbox(11.4, 0.22, 7.0, 2), M.roof, 0, 4.35, -0.1, kitchenG);
  krf.rotation.x = 0.14;

  // Back wall wooden spice shelf + clay Prahok/salt jars + hanging chili & garlic bundles!
  add(tbox(4.8, 0.10, 0.48, 1.5), M.plank, 0, 2.25, -2.55, kitchenG);
  for (let i = -2; i <= 2; i++) {
    add(new THREE.CylinderGeometry(0.16, 0.13, 0.34, 12), i % 2 ? M.clayPot : M.gold, i * 0.85, 2.47, -2.55, kitchenG);
  }
  for (const hx of [-2.8, 2.8]) {
    for (let k = 0; k < 4; k++) {
      add(new THREE.SphereGeometry(0.11, 8, 6), hx < 0 ? M.chiliRed : M.garlicCream, hx, 2.55 - k * 0.18, -2.65, kitchenG);
    }
  }

  // ---- Kitchen Prep Counter placed cleanly at z = -0.45 (front edge z = +0.10, 100% behind actors at z = +0.85!) ----
  add(tbox(4.4, 0.12, 1.10, 1.5), M.plankLight, 0, 0.72, -0.45, kitchenG);
  for (const lx of [-1.95, 0, 1.95]) for (const lz of [-0.90, 0.00]) {
    add(tbox(0.12, 0.72, 0.12, 1), M.beam, lx, 0.36, lz, kitchenG);
  }

  // PROP 1 (Left of counter, world x = 12.65, z = -0.45): Brushed Aluminum Rice Pot being washed (លាងអង្ករដាក់ឆ្នាំង!)
  const potG = new THREE.Group(); potG.position.set(-1.35, 0.78, -0.45); kitchenG.add(potG);
  add(new THREE.CylinderGeometry(0.42, 0.36, 0.36, 20), M.steel, 0, 0.18, 0, potG);
  for (const s of [-1, 1]) {
    const hd = add(new THREE.TorusGeometry(0.08, 0.022, 6, 12), M.steel, s * 0.43, 0.26, 0, potG);
    hd.rotation.y = Math.PI / 2;
  }
  // Uncooked raw white rice + clear washing water inside pot!
  add(new THREE.CylinderGeometry(0.37, 0.35, 0.06, 16), M.riceWhite, 0, 0.29, 0, potG);
  riceWaterMesh = add(new THREE.CylinderGeometry(0.39, 0.39, 0.03, 18), M.waterClear, 0, 0.33, 0, potG);

  // Traditional Khmer Clay Stove (ចង្ក្រានដី) beside bench at world x = 11.45, z = -0.45
  const stoveG = new THREE.Group(); stoveG.position.set(-2.55, 0, -0.45); kitchenG.add(stoveG);
  add(new THREE.CylinderGeometry(0.42, 0.48, 0.56, 16), M.clayStove, 0, 0.28, 0, stoveG);
  add(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 14), M.ashGrey, 0, 0.56, 0, stoveG);
  stoveFireG = new THREE.Group(); stoveFireG.position.set(0, 0.58, 0); stoveG.add(stoveFireG);
  add(new THREE.ConeGeometry(0.24, 0.42, 7), M.ember, 0, 0.16, 0, stoveFireG, { cast: false });
  add(new THREE.ConeGeometry(0.15, 0.32, 7), M.flame, 0, 0.22, 0, stoveFireG, { cast: false });

  // PROP 2 (Center of counter, world x = 14.0, z = -0.40): Stainless-Steel Basin + Unscaled Raw Fish (ត្រីនៅក្នុងចានដែកមិនទាន់ស្រកាផង!)
  const basinG = new THREE.Group(); basinG.position.set(0.0, 0.78, -0.40); kitchenG.add(basinG);
  add(new THREE.CylinderGeometry(0.50, 0.36, 0.20, 22), M.steel, 0, 0.10, 0, basinG);
  add(new THREE.TorusGeometry(0.50, 0.028, 8, 22), M.steel, 0, 0.20, 0, basinG).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.43, 0.40, 0.04, 18), M.waterClear, 0, 0.14, 0, basinG);
  rawFishMesh = new THREE.Group(); rawFishMesh.position.set(-0.04, 0.22, 0); basinG.add(rawFishMesh);
  add(new THREE.SphereGeometry(0.26, 14, 10), M.fishSilver, 0, 0, 0, rawFishMesh).scale.set(1.55, 0.42, 0.65);
  const tail = add(new THREE.ConeGeometry(0.18, 0.28, 4), M.fishSilver, 0.44, 0.04, 0, rawFishMesh);
  tail.rotation.z = Math.PI / 2; tail.scale.set(1, 1, 0.25);
  add(new THREE.SphereGeometry(0.035, 8, 8), M.darkInk, -0.26, 0.05, 0.11, rawFishMesh);

  // PROP 3 (Right of counter, world x = 15.35, z = -0.45): Woven Bamboo Basket Full of Whole Water Spinach (ត្រកួននៅក្នុងកន្ត្រកទាំងមូល!)
  const vegBasketG = new THREE.Group(); vegBasketG.position.set(1.35, 0.78, -0.45); kitchenG.add(vegBasketG);
  add(new THREE.CylinderGeometry(0.52, 0.36, 0.30, 18), M.basket, 0, 0.15, 0, vegBasketG);
  add(new THREE.TorusGeometry(0.52, 0.032, 8, 20), M.beam, 0, 0.30, 0, vegBasketG).rotation.x = Math.PI / 2;
  const rv = P.rng(44);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, radR = 0.12 + rv() * 0.28;
    const stalk = add(new THREE.CylinderGeometry(0.022, 0.026, 0.52, 6), M.vegStem, Math.cos(a) * radR, 0.34, Math.sin(a) * radR, vegBasketG);
    stalk.rotation.z = Math.cos(a) * 0.48; stalk.rotation.x = Math.sin(a) * 0.48;
    const leaf = add(new THREE.SphereGeometry(0.13, 8, 6), M.vegLeaf, Math.cos(a) * (radR + 0.16), 0.52 + (i % 3) * 0.05, Math.sin(a) * (radR + 0.16), vegBasketG);
    leaf.scale.set(1.35, 0.38, 0.75); leaf.rotation.y = a;
  }

  // Toggled 2nd Woven Colander for Picked Trakuon on counter (z = -0.10, cleanly behind actors!)
  pickedColanderG = new THREE.Group(); pickedColanderG.position.set(0.68, 0.78, -0.10); kitchenG.add(pickedColanderG);
  add(new THREE.CylinderGeometry(0.32, 0.22, 0.16, 16), M.basket, 0, 0.08, 0, pickedColanderG);
  for (let i = 0; i < 7; i++) {
    const lf = add(new THREE.SphereGeometry(0.10, 8, 6), M.vegLeaf, (i - 3) * 0.06, 0.18, (i % 2 - 0.5) * 0.08, pickedColanderG);
    lf.scale.set(1.2, 0.4, 0.8);
  }
}

// Expanding 3D Sonic Shout Rings (when Mother shouts «បាយឆ្អិនហើយ!» across courtyard!)
const shoutRings = [];
for (let i = 0; i < 3; i++) {
  const rm = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.92, 36),
    new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff6e4a' : '#ffd84d', side: THREE.DoubleSide, transparent: true, opacity: 0.7, depthWrite: false })
  );
  rm.userData.ndSkip = true; rm.visible = false;
  scene.add(rm); shoutRings.push(rm);
}

// ---------- 2D Bean-Head Billboard Cards ----------
const CW = 1200, CH = 2000, CM = 2.22;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM);
cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.56));

class Card {
  constructor() {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    this.c = c; this.g = c.getContext('2d', { willReadFrequently: true });
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat);
    this.mesh.userData.nd = cardNd(this.t);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = [];
const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- Native 1080x1920 Render Targets & Post-Processing ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };

const inkU = {
  col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) },
  px: { value: 2.5 }, fogCol: { value: new THREE.Color() }, sat: { value: 1.14 },
  lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.16 }, flash: { value: 0 },
};
const inkScene = fs(new THREE.ShaderMaterial({
  uniforms: inkU,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }`,
}));

const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 8 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({
  uniforms: dofU,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  void main(){
    gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.));
  }`,
}));
dofScene.children[0].material.toneMapped = false;

// ---------- Per-Frame World & Actor Updates ----------
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
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 26, sc = sun.shadow.camera;
  sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200;
  sc.updateProjectionMatrix();
}

function updateWorldState(S, f) {
  // Animated 3D bedroom clock hands (12:00 noon -> 1:00 PM turbo spin!)
  const hrs = S.clockHours ?? 12.0;
  hourPivot.rotation.z = -((hrs % 12) / 12) * Math.PI * 2;
  minPivot.rotation.z = -(hrs * Math.PI * 2);

  // Dream Feast Table & Golden Halo
  dreamFeastG.visible = !!S.showDreamFeast;
  if (S.showDreamFeast) {
    feastHalo.visible = true;
    feastHalo.position.set(2.15, 1.08, -0.05);
    feastHalo.scale.setScalar(1.0 + 0.08 * Math.sin(f * 0.24));
    feastHalo.quaternion.copy(camera.quaternion);
  } else {
    feastHalo.visible = false;
  }

  // Kitchen Stove, Raw Fish Flop & Picked Trakuon Colander
  stoveFireG.visible = !!S.stoveLit;
  pickedColanderG.visible = !!S.pickingVeg;
  riceWaterMesh.position.y = 0.33 + (S.riceWashing ? Math.sin(f * 0.45) * 0.015 : 0);
  rawFishMesh.rotation.z = S.fishFlop ? Math.sin(f * 0.55) * 0.14 : 0;
  rawFishMesh.position.y = 0.22 + (S.fishFlop ? Math.abs(Math.sin(f * 0.55)) * 0.05 : 0);

  // Expanding 3D Megaphone Shout Rings
  if (S.shoutWave > 0) {
    shoutRings.forEach((rm, idx) => {
      rm.visible = true;
      const ph = ((f * 0.045) + idx / 3) % 1;
      rm.position.set(13.2 - ph * 6.5, 1.55, 0.9);
      rm.rotation.y = Math.PI / 3;
      rm.scale.setScalar(0.55 + ph * 3.2);
      rm.material.opacity = (1 - ph) * 0.72 * S.shoutWave;
    });
  } else {
    shoutRings.forEach((rm) => { rm.visible = false; });
  }
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
    const gnd = a.ground ?? DECK;
    if (a.blob !== false && a.y < gnd + 0.6) {
      c.blob.visible = true;
      c.blob.position.set(a.x, gnd + 0.02, a.z);
      c.blob.scale.set(0.92 * s, 0.58 * s, 1);
    }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
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

  const W_ = worldAt(f);
  updateWorldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);

  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);

  // Pass A: Painted Toon Colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);

  // Pass B: Normal + Depth
  const fog = scene.fog; scene.fog = null;
  const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;

  // Pass C: Ink Outlines + Color Grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.vig.value = L.vig ?? 0.16;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);

  // Pass D: Razor-Sharp Output (cinf === 0 enforced)
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};

window.TOTAL = TOTAL;
window.ready = true;
