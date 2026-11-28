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
  grass: texM(P.grass(8), 56, 56),
  laterite: texM(P.lateriteRoad(17), 12, 2),
  sweptEarth: texM(P.sweptEarth(23), 4, 3),
  patioTile: texM(P.khmerPatioTile(31), 5, 3),
  teakPlank: texM(P.planks(1, 26, 48, 44), 3, 2),
  mustardPlank: texM(P.planks(11, 41, 68, 52), 3, 2),
  oxbloodPlank: texM(P.planks(19, 8, 56, 38), 2, 2),
  beam: texM(P.beam(2), 1, 2),
  bamboo: texM(P.wovenBamboo(15), 4, 1),
  roof: texM(P.clayTileRoof(9), 4, 2),
  straw: texM(P.strawStackTex(44), 3, 2),
  matRed: texM(P.sleepingMat(), 1, 1),
  kramaRed: texM(P.kramaTex('176,34,44'), 2, 1),
  kramaBlue: texM(P.kramaTex('36,82,158'), 2, 1),
  peangJar: texM(P.peangJarTex(), 2, 1),
  palmBark: texM(P.sugarPalmBark(41), 1, 4),
  gold: toon({ color: '#f2c138' }),
  emeraldTrim: toon({ color: '#1d7a4c' }),
  concrete: toon({ color: '#9ea4a8' }),
  whiteMortar: toon({ color: '#f5f2ea' }),
  terracottaClay: toon({ color: '#c45630' }),
  ironPot: toon({ color: '#2b2d30' }),
  emberGlow: toon({ color: '#ff5722' }),
  hammockGreen: toon({ color: '#238c5a', side: THREE.DoubleSide }),
  bananaLeaf: toon({ color: '#4ea832', side: THREE.DoubleSide }),
  palmFrondDry: toon({ color: '#87683e', side: THREE.DoubleSide }),
  palmLeaf: toon({ color: '#467d2c', side: THREE.DoubleSide }),
  paddyGreen: toon({ color: '#6cc239' }),
  bundDirt: toon({ color: '#c4a678' }),
  cakeGreen: toon({ color: '#2e8b28' }),
  trunk: toon({ color: '#6b472c' }),
  canopyA: toon({ color: '#3b8238' }),
  canopyB: toon({ color: '#4f9940' }),
  hillFar: toon({ color: '#7db068' }),
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
scene.fog = new THREE.Fog('#ffffff', 80, 740);

const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// 1. Cambodian Alluvial Village Ground + Red-Pink Laterite Courtyard Roads + Emerald Rice Paddies & Bunds
const lawn = add(new THREE.PlaneGeometry(520, 520), M.grass, 0, DECK - 0.03, 0, world, { cast: false });
lawn.rotation.x = -Math.PI / 2;

// Red-pink laterite footpath connecting Stage B (Ancestral Law Yard x=-13.5) <-> Stage A (Stilt House x=0) <-> Stage C (Outdoor Kitchen x=+13.5)
const yardRoad = add(new THREE.PlaneGeometry(36.0, 3.0), M.laterite, 0.0, DECK + 0.004, 1.35, world, { cast: false });
yardRoad.rotation.x = -Math.PI / 2;

// Open Emerald Rice Paddies (វាលស្រែ) & Raised Earthen Bunds (ភ្លឺស្រែ) visible right through the open stilt house!
const paddy = add(new THREE.PlaneGeometry(210, 32), M.paddyGreen, 0, DECK + 0.002, -26, world, { cast: false });
paddy.rotation.x = -Math.PI / 2;
add(box(210, 0.28, 0.88), M.bundDirt, 0, 0.12, -13.5, world, { cast: false });
add(box(210, 0.28, 0.88), M.bundDirt, 0, 0.12, -23.0, world, { cast: false });

// Low rustic woven-bamboo backyard fence at z = -4.6 (waist-high so emerald rice paddies & sugar palms shine behind!)
for (let fx = -20; fx <= 20; fx += 4.0) {
  add(tbox(3.88, 0.88, 0.07, 1.5), M.bamboo, fx, 0.46, -4.6, world);
  add(new THREE.CylinderGeometry(0.06, 0.07, 1.08, 8), M.beam, fx - 1.94, 0.54, -4.58, world);
}

// ============================================================================
// STAGE A (x = 0.0): MUSTARD-GOLD KHMER STILT HOUSE & PATTERNED TILED PATIO (ក្រោមផ្ទះក្រាលឥដ្ឋការ៉ូខ្មែរ)
// ============================================================================
const houseG = new THREE.Group(); houseG.position.set(0.0, DECK, 0.0); world.add(houseG);
let snackTableFood3D;
{
  // Classic Cambodian terracotta-and-cream geometric cement floor tiles («ដួលតូងទៅលើឥដ្ឋ!»)
  add(tbox(11.8, 0.06, 6.2, 2.2), M.patioTile, 0, -0.02, -0.8, houseG, { cast: false });

  // Wide-spaced front stilts at x = -5.65 & +5.65 -> ZERO foreground camera occlusion!
  for (const px of [-5.65, 5.65]) {
    add(box(0.38, 0.16, 0.38), M.concrete, px, 0.08, 1.65, houseG);
    add(tbox(0.25, 3.95, 0.25, 1.5), M.beam, px, 2.05, 1.65, houseG);
  }
  // Open rear stilts (no solid back wall -> authentic open ក្រោមផ្ទះ revealing rice paddies & sugar palms!)
  for (const px of [-5.65, -2.15, 2.15, 5.65]) {
    add(box(0.38, 0.16, 0.38), M.concrete, px, 0.08, -3.15, houseG);
    add(tbox(0.25, 3.95, 0.25, 1.5), M.beam, px, 2.05, -3.15, houseG);
  }

  // Elevated Upper Khmer Wooden House (Mustard-Gold Rural Planks + Oxblood Shutters + Emerald/Terracotta Roof)
  add(tbox(12.2, 0.26, 5.4, 2), M.teakPlank, 0, 3.95, -0.75, houseG);
  add(tbox(11.5, 2.38, 4.8, 2), M.mustardPlank, 0, 5.25, -0.75, houseG);
  for (const wx of [-3.2, 0, 3.2]) {
    add(tbox(1.18, 1.05, 0.12, 1), M.oxbloodPlank, wx, 5.28, 1.70, houseG);
    const sh = add(tbox(1.12, 0.96, 0.08, 1), M.whiteMortar, wx, 5.45, 2.02, houseG);
    sh.rotation.x = -0.55;
  }
  // Steep Khmer terracotta diamond-tile roof + emerald border + golden gable finials
  for (const s of [-1, 1]) {
    const rf = add(tbox(12.8, 0.22, 3.65, 2), M.roof, 0, 7.28, -0.75 + s * 1.46, houseG);
    rf.rotation.x = s * 0.62;
  }
  add(box(12.9, 0.16, 0.26), M.whiteMortar, 0, 8.18, -0.75, houseG);
  add(box(12.95, 0.10, 0.14), M.emeraldTrim, 0, 6.42, 2.28, houseG);

  // Steep Khmer Wooden Front Staircase on far left side (x = -5.1, z = -1.6)
  const stairG = new THREE.Group(); stairG.position.set(-5.15, 0, -1.55); houseG.add(stairG);
  for (let i = 0; i < 8; i++) {
    add(tbox(0.95, 0.08, 0.26, 1), M.teakPlank, 0, 0.42 + i * 0.44, 1.4 - i * 0.34, stairG);
  }

  // Under-House Slatted Khmer Kre Bed (គ្រែឈើខ្មែរ + កន្ទេលក្រហម) at x = -2.45, z = -1.85
  const kreG = new THREE.Group(); kreG.position.set(-2.45, 0, -1.85); houseG.add(kreG);
  add(tbox(2.05, 0.12, 1.24, 1.5), M.teakPlank, 0, 0.48, 0, kreG);
  for (const lx of [-0.90, 0.90]) for (const lz of [-0.52, 0.52]) {
    add(tbox(0.12, 0.48, 0.12, 1), M.beam, lx, 0.24, lz, kreG);
  }
  add(tbox(1.88, 0.04, 1.10, 1.5), M.matRed, 0, 0.55, 0, kreG);
  add(tbox(0.46, 0.08, 0.58, 1), M.kramaBlue, -0.58, 0.61, 0.05, kreG);

  // Diagonal Emerald Hammock (អង្រឹង) at rear right (x = +3.1, z = -2.55)
  const ham = add(new THREE.CylinderGeometry(0.20, 0.20, 2.35, 10, 1, true, 0, Math.PI), M.hammockGreen, 3.1, 1.02, -2.55, houseG);
  ham.rotation.z = Math.PI / 2 - 0.09; ham.rotation.x = 0.35;

  // Giant Ribbed Khmer Peang Water Jars (ពាងទឹក) under right eaves
  for (const [jx, jz, sc] of [[4.55, -2.15, 1.02], [5.28, -2.35, 0.88]]) {
    const jar = add(new THREE.SphereGeometry(0.42 * sc, 16, 12), M.peangJar, jx, 0.48 * sc, jz, houseG);
    jar.scale.set(1, 1.22, 1);
    add(new THREE.CylinderGeometry(0.30 * sc, 0.32 * sc, 0.08, 14), M.concrete, jx, 0.98 * sc, jz, houseG);
  }

  // Golden Khmer Spirit House (ខ្ទមអ្នកតា) in yard corner (x = -6.35, z = -1.75)
  const spG = new THREE.Group(); spG.position.set(-6.35, 0, -1.75); houseG.add(spG);
  add(new THREE.CylinderGeometry(0.08, 0.10, 1.48, 8), M.whiteMortar, 0, 0.74, 0, spG);
  add(box(0.70, 0.08, 0.58), M.gold, 0, 1.50, 0, spG);
  add(box(0.48, 0.44, 0.40), M.gold, 0, 1.75, 0, spG);
  const spRoof = add(new THREE.ConeGeometry(0.48, 0.54, 4), M.gold, 0, 2.22, 0, spG);
  spRoof.rotation.y = Math.PI / 4;

  // Low Carved Teak Snack Table at x = 0.0, z = -0.82 holding Khmer Num Kom & Golden Cakes!
  const tblG = new THREE.Group(); tblG.position.set(0.0, 0, -0.82); houseG.add(tblG);
  add(new THREE.CylinderGeometry(0.36, 0.34, 0.07, 20), M.teakPlank, 0, 0.46, 0, tblG);
  for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) {
    add(new THREE.CylinderGeometry(0.035, 0.028, 0.46, 8), M.beam, lx, 0.23, lz, tblG);
  }
  snackTableFood3D = new THREE.Group(); snackTableFood3D.position.set(0, 0.50, 0); tblG.add(snackTableFood3D);
  add(new THREE.CylinderGeometry(0.23, 0.20, 0.03, 16), M.bamboo, 0, 0.015, 0, snackTableFood3D);
  add(new THREE.ConeGeometry(0.095, 0.17, 4), M.cakeGreen, -0.06, 0.10, 0, snackTableFood3D);
  add(new THREE.SphereGeometry(0.08, 12, 10), M.gold, 0.07, 0.075, 0.03, snackTableFood3D);
}

// ============================================================================
// STAGE B (x = -13.5): ANCESTRAL KHMER COURTYARD, CONICAL HAYSTACK (ភ្នំចំបើង) & WOODEN OX-CART (រទេះគោ)
// ============================================================================
const lawStageG = new THREE.Group(); lawStageG.position.set(-13.5, DECK, 0.0); world.add(lawStageG);
{
  const earthPad = add(new THREE.CircleGeometry(4.6, 28), M.sweptEarth, 0, 0.01, -0.8, lawStageG, { cast: false });
  earthPad.rotation.x = -Math.PI / 2;

  // Conical Golden Rice-Straw Haystack (ភ្នំចំបើង — khmer-visual-bible Rule #8!) at left rear
  add(new THREE.ConeGeometry(1.18, 2.85, 18), M.straw, -2.55, 1.42, -2.45, lawStageG);
  add(new THREE.CylinderGeometry(0.06, 0.07, 3.45, 8), M.beam, -2.55, 1.72, -2.45, lawStageG);

  // Authentic Flared 16-Spoke Khmer Wooden Ox-Cart (រទេះគោ — khmer-visual-bible Rule #7!) at right rear
  const cartG = new THREE.Group(); cartG.position.set(2.35, 0, -2.55); cartG.rotation.y = -0.35; lawStageG.add(cartG);
  for (const wz of [-0.62, 0.62]) {
    const rim = add(new THREE.TorusGeometry(0.68, 0.045, 8, 24), M.beam, 0, 0.72, wz, cartG);
    for (let s = 0; s < 8; s++) {
      const sp = add(new THREE.CylinderGeometry(0.018, 0.018, 1.34, 6), M.teakPlank, 0, 0.72, wz, cartG);
      sp.rotation.z = (s / 8) * Math.PI;
    }
    void rim;
  }
  add(tbox(1.85, 0.10, 1.05, 1.2), M.teakPlank, 0, 0.74, 0, cartG);
  add(tbox(1.85, 0.42, 0.06, 1.2), M.bamboo, 0, 0.98, -0.54, cartG);
  add(tbox(1.85, 0.42, 0.06, 1.2), M.bamboo, 0, 0.98, 0.54, cartG);
  const shaft = add(new THREE.CylinderGeometry(0.04, 0.05, 1.85, 8), M.beam, -1.55, 0.62, 0, cartG);
  shaft.rotation.z = 0.28;

  // Golden Khmer Household Law Pedestal (តុច្បាប់អមតៈគ្រួសារខ្មែរ) at center rear (x = 0, z = -1.15)
  add(box(1.25, 0.22, 0.95), M.concrete, 0, 0.11, -1.15, lawStageG);
  add(tbox(0.88, 0.68, 0.68, 1), M.oxbloodPlank, 0, 0.55, -1.15, lawStageG);
  add(box(1.04, 0.12, 0.80), M.gold, 0, 0.94, -1.15, lawStageG);
}

// ============================================================================
// STAGE C (x = +13.5): KHMER OUTDOOR KITCHEN PAVILION & CLAY CHARCOAL STOVE (ផ្ទះបាយខ្មែរ & ចង្ក្រានដី)
// ============================================================================
const kitchenStageG = new THREE.Group(); kitchenStageG.position.set(13.5, DECK, 0.0); world.add(kitchenStageG);
{
  add(tbox(5.4, 0.06, 4.2, 2), M.sweptEarth, 0, -0.01, -1.1, kitchenStageG, { cast: false });
  // Open 4-post thatched/clay-tiled outdoor kitchen shelter (pillars wide at x = -2.35 & +2.35)
  for (const kx of [-2.35, 2.35]) for (const kz of [0.45, -2.55]) {
    add(tbox(0.18, 2.65, 0.18, 1.2), M.beam, kx, 1.32, kz, kitchenStageG);
  }
  for (const s of [-1, 1]) {
    const krf = add(tbox(5.4, 0.16, 2.1, 1.5), M.roof, 0, 2.95, -1.05 + s * 0.85, kitchenStageG);
    krf.rotation.x = s * 0.52;
  }
  add(tbox(4.5, 1.25, 0.08, 1.5), M.bamboo, 0, 1.15, -2.55, kitchenStageG);
  // Hanging woven Chong-Ae winnowing trays (ចង្អេរ) on kitchen bamboo back wall!
  for (const [cx_, cy_, r_] of [[-1.15, 1.55, 0.34], [-0.35, 1.62, 0.28], [1.25, 1.52, 0.32]]) {
    const tray = add(new THREE.CylinderGeometry(r_, r_, 0.04, 18), M.bamboo, cx_, cy_, -2.48, kitchenStageG);
    tray.rotation.x = Math.PI / 2;
  }

  // Wooden Kitchen Counter + Authentic Khmer Terracotta Clay Charcoal Stove (ចង្ក្រានដី) & Blackened Soup Pot!
  add(tbox(1.65, 0.58, 0.78, 1.2), M.teakPlank, 0.55, 0.29, -1.15, kitchenStageG);
  add(new THREE.CylinderGeometry(0.24, 0.18, 0.32, 14), M.terracottaClay, 0.55, 0.74, -1.15, kitchenStageG);
  add(box(0.12, 0.08, 0.06), M.emberGlow, 0.55, 0.65, -0.96, kitchenStageG);
  const pot = add(new THREE.SphereGeometry(0.24, 14, 12), M.ironPot, 0.55, 0.98, -1.15, kitchenStageG);
  pot.scale.set(1, 0.78, 1);
}

// ============================================================================
// AUTHENTIC CAMBODIAN SUGAR PALMS (ដើមត្នោត ON BUNDS!), BANANA TREES & PHNOM HILLS
// ============================================================================
const sugarPalm = (x, z, h = 11.8) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.23, 0.42, 1.1, 12), M.trunk, 0, 0.55, 0, g);
  const crownG = new THREE.Group();
  crownG.rotation.z = ((Math.abs(Math.round(x)) % 3) - 1) * 0.025;
  g.add(crownG);
  add(new THREE.CylinderGeometry(0.15, 0.22, h - 0.85, 12), M.palmBark, 0, 0.85 + (h - 0.85) / 2, 0, crownG);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dry = add(new THREE.ConeGeometry(0.36, 1.35, 4), M.palmFrondDry, Math.cos(a) * 0.45, h - 0.55, Math.sin(a) * 0.45, crownG);
    dry.scale.set(1, 1, 0.22); dry.rotation.order = 'YXZ'; dry.rotation.y = -a + Math.PI / 2; dry.rotation.x = 2.25;
  }
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2, tier = k % 2;
    const frond = add(new THREE.ConeGeometry(0.58, 2.35, 5), M.palmLeaf, Math.cos(a) * 0.95, h + 0.15 + tier * 0.28, Math.sin(a) * 0.95, crownG);
    frond.scale.set(1, 1, 0.18); frond.rotation.order = 'YXZ';
    frond.rotation.y = -a + Math.PI / 2; frond.rotation.x = tier ? 0.72 : 1.28;
  }
};
const bananaCluster = (bx, bz) => {
  const bg = new THREE.Group(); bg.position.set(bx, DECK, bz); world.add(bg);
  for (const [ox, oz, h] of [[0, 0, 2.3], [0.45, -0.3, 1.85], [-0.4, -0.25, 2.05]]) {
    add(new THREE.CylinderGeometry(0.09, 0.14, h, 8), M.paddyGreen, ox, h / 2, oz, bg);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const lf = add(new THREE.PlaneGeometry(0.48, 1.45), M.bananaLeaf, ox + Math.cos(a) * 0.55, h + 0.15, oz + Math.sin(a) * 0.55, bg);
      lf.rotation.order = 'YXZ'; lf.rotation.y = -a + Math.PI / 2; lf.rotation.x = 1.05;
    }
  }
};
const villageTree = (x, z, h = 6.8, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.22, 0.36, h * 0.55, 8), M.trunk, 0, h * 0.27, 0, g);
  add(new THREE.SphereGeometry(2.0 * s, 12, 10), M.canopyA, 0, h * 0.68, 0, g).scale.set(1.15, 0.82, 1.05);
  add(new THREE.SphereGeometry(1.4 * s, 10, 8), M.canopyB, -1.0, h * 0.58, 0.5, g).scale.set(1.1, 0.78, 1.0);
};

// Placed strictly along rice-field bunds (z = -13.5 & -23.0) per khmer-visual-bible Rule #1!
[
  [-22.0, -13.5, 12.2], [-15.8, -13.5, 12.6], [-8.2, -13.5, 11.9],
  [-1.6, -13.5, 12.5], [4.8, -13.5, 12.1], [11.6, -13.5, 12.8],
  [18.5, -13.5, 11.8], [-5.0, -23.0, 13.0], [7.5, -23.0, 12.7],
].forEach(([x, z, h]) => sugarPalm(x, z, h));

[[-18.2, -3.6], [-7.4, -3.4], [6.8, -3.2], [17.8, -3.4]].forEach(([x, z]) => bananaCluster(x, z));
[[-21.5, -7.2, 6.6, 0.95], [-9.5, -7.5, 6.4, 0.9], [9.2, -7.5, 6.5, 0.9], [20.5, -7.2, 6.7, 0.95]].forEach(([x, z, h, s]) => villageTree(x, z, h, s));

// Distant Phnom hills on flat Cambodian horizon
{
  const rm = P.rng(117);
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * 0.88 + (i / 10) * Math.PI * 0.88, d = 220 + rm() * 110;
    const h = add(new THREE.SphereGeometry(38 + rm() * 28, 16, 10), M.hillFar, Math.cos(a) * d, -14, Math.sin(a) * d, world, { cast: false });
    h.scale.y = 0.45 + rm() * 0.22;
  }
}

// Painted billboard clouds
const clouds = [];
{
  const r = P.rng(94);
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

// Soft Painterly Golden / Crimson Aura Halo for Superhero Mom & Boiling-Anger Beats
const auraGoldTex = P.tex(P.radial('255,212,68', 0.58));
const auraRedTex = P.tex(P.radial('255,68,68', 0.54));
const auraHaloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.8, 2.8),
  new THREE.MeshBasicMaterial({ map: auraGoldTex, transparent: true, depthWrite: false })
);
auraHaloMesh.userData.ndSkip = true; auraHaloMesh.visible = false; scene.add(auraHaloMesh);

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
  px: { value: 2.5 }, fogCol: { value: new THREE.Color() }, sat: { value: 1.15 },
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
      float graz = clamp(abs(n.z) / .34, .06, 1.);
      e = max(e, smoothstep(.006, .022, ((ds - d)/d) * graz));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(65., 185., d)*.92);
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
  snackTableFood3D.visible = !S.hideTableSnacks;
  if (S.aura) {
    auraHaloMesh.visible = true;
    auraHaloMesh.material.map = S.auraRed ? auraRedTex : auraGoldTex;
    auraHaloMesh.position.set(S.auraPos[0], S.auraPos[1], S.auraPos[2]);
    auraHaloMesh.scale.setScalar(1.0 + 0.09 * Math.sin(f * 0.28));
    auraHaloMesh.quaternion.copy(camera.quaternion);
  } else {
    auraHaloMesh.visible = false;
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
      c.blob.scale.set((a.blobW || 0.92) * s, 0.58 * s, 1);
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
