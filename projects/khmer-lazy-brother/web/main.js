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
  grass: texM(P.grass(6), 44, 44),
  laterite: texM(P.lateriteRoad(14), 10, 2),
  sweptEarth: texM(P.sweptEarth(21), 4, 3),
  tile: texM(P.courtyardTile(12), 4, 3),
  teakPlank: texM(P.planks(1, 26, 48, 46), 3, 2),
  aquaPlank: texM(P.planks(7, 182, 48, 44), 3, 2), // Authentic rural Cambodian turquoise-painted planks (#38A3A5)!
  beam: texM(P.beam(2), 1, 2),
  bamboo: texM(P.wovenBamboo(15), 3, 1),
  roof: texM(P.clayTileRoof(9), 4, 2),
  matRed: texM(P.sleepingMat(), 1, 1),
  krama: texM(P.kramaTex(), 2, 1),
  haystack: texM(P.haystackTex(33), 3, 2),
  peangJar: texM(P.peangJarTex(), 2, 1),
  palmBark: texM(P.sugarPalmBark(41), 1, 4),
  tvBars: new THREE.MeshBasicMaterial({ map: P.tex(P.tvScreenTex(0), 1, 1) }),
  tvAction: new THREE.MeshBasicMaterial({ map: P.tex(P.tvScreenTex(1), 1, 1) }),
  gold: toon({ color: '#f2c138' }),
  concrete: toon({ color: '#9ea4a8' }),
  whiteMortar: toon({ color: '#f5f2ea' }),
  darkInk: toon({ color: '#1f232e' }),
  remoteRed: new THREE.MeshBasicMaterial({ color: '#ff3838' }),
  hammockRed: toon({ color: '#d93848', side: THREE.DoubleSide }),
  bananaLeaf: toon({ color: '#4ea832', side: THREE.DoubleSide }),
  palmFrondDry: toon({ color: '#87683e', side: THREE.DoubleSide }),
  palmLeaf: toon({ color: '#467d2c', side: THREE.DoubleSide }),
  paddyGreen: toon({ color: '#6cc239' }),
  bundDirt: toon({ color: '#c4a678' }),
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
scene.fog = new THREE.Fog('#ffffff', 75, 720);

const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// 1. Flat Cambodian Village Ground + Red-Pink Laterite Dirt Path + Distant Emerald Rice Paddy & Bund
const lawn = add(new THREE.PlaneGeometry(460, 460), M.grass, 0, DECK - 0.02, 0, world, { cast: false });
lawn.rotation.x = -Math.PI / 2;

// Red-pink laterite village dirt path connecting House Salon (x = 0) <-> Backyard (x = +14)
const road = add(new THREE.PlaneGeometry(28.0, 3.6), M.laterite, 6.5, DECK + 0.005, 0.35, world, { cast: false });
road.rotation.x = -Math.PI / 2;

// Distant electric-green Cambodian rice paddy field + raised bund dike (ភ្លឺស្រែ) strictly behind at z = -22..-48
const paddy = add(new THREE.PlaneGeometry(160, 28), M.paddyGreen, 4, DECK - 0.01, -32, world, { cast: false });
paddy.rotation.x = -Math.PI / 2;
add(box(160, 0.28, 0.85), M.bundDirt, 4, 0.12, -18.2, world, { cast: false });

// ============================================================================
// ZONE A (x = 0.0): KHMER TRADITIONAL STILT HOUSE & UNDER-HOUSE SALON (ក្រោមផ្ទះ & សាឡុងឈើខ្មែរ)
// ============================================================================
const houseG = new THREE.Group(); houseG.position.set(0.0, DECK, 0.0); world.add(houseG);
let remoteMesh3D, remoteRingMesh, tvScreenBars, tvScreenAction, kingHaloMesh;
{
  // Swept ochre earth & terracotta floor pad under the stilt house (100% open front sightlines!)
  add(tbox(11.6, 0.06, 6.4, 2), M.tile, 0, -0.02, -0.5, houseG, { cast: false });

  // Stout square timber stilts on concrete footing pads:
  // Front posts wide apart at x = -5.45 & +5.45 so x in [-5.1, +5.1] has ZERO foreground occlusion!
  for (const px of [-5.45, 5.45]) {
    add(box(0.36, 0.16, 0.36), M.concrete, px, 0.08, 1.85, houseG);
    add(tbox(0.24, 3.95, 0.24, 1.5), M.beam, px, 2.05, 1.85, houseG);
  }
  // Rear stilts strictly behind actors at z = -2.85
  for (const px of [-5.45, -1.85, 1.85, 5.45]) {
    add(box(0.36, 0.16, 0.36), M.concrete, px, 0.08, -2.85, houseG);
    add(tbox(0.24, 3.95, 0.24, 1.5), M.beam, px, 2.05, -2.85, houseG);
  }

  // Elevated Upper Khmer Wooden House Story (starts cleanly at y = 3.85 above medium shots!)
  add(tbox(12.0, 0.24, 5.4, 2), M.teakPlank, 0, 3.95, -0.5, houseG);
  // Vibrant rural Cambodian aqua-turquoise painted wooden upper wall + louvered shutters!
  add(tbox(11.4, 2.35, 4.8, 2), M.aquaPlank, 0, 5.22, -0.5, houseG);
  for (const wx of [-3.1, 0, 3.1]) {
    add(tbox(1.15, 1.05, 0.12, 1), M.beam, wx, 5.25, 1.94, houseG);
    const sh = add(tbox(1.10, 0.95, 0.08, 1), M.whiteMortar, wx, 5.42, 2.24, houseG);
    sh.rotation.x = -0.55; // Propped open outward at ~45 deg!
  }
  // Steep Khmer terracotta clay-tile roof with crisp white-mortared ridge!
  for (const s of [-1, 1]) {
    const rf = add(tbox(12.6, 0.22, 3.6, 2), M.roof, 0, 7.25, -0.5 + s * 1.45, houseG);
    rf.rotation.x = s * 0.62;
  }
  add(box(12.7, 0.16, 0.24), M.whiteMortar, 0, 8.15, -0.5, houseG);

  // Back wooden screen wall under rear of house (z = -2.95, strictly behind everything) + diagonal red hammock (អង្រឹង)
  add(tbox(11.2, 2.35, 0.16, 2), M.teakPlank, 0, 1.22, -2.95, houseG);
  const ham = add(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 10, 1, true, 0, Math.PI), M.hammockRed, -3.5, 1.05, -2.35, houseG);
  ham.rotation.z = Math.PI / 2 + 0.08; ham.rotation.x = 0.35;

  // Pair of bulbous ribbed Khmer rainwater jars (ពាងទឹក Peang) tucked under left eaves (x = -4.55, z = -1.95)
  for (const [jx, jz, sc] of [[-4.65, -1.95, 1.0], [-3.82, -2.15, 0.88]]) {
    const jar = add(new THREE.SphereGeometry(0.42 * sc, 16, 12), M.peangJar, jx, 0.48 * sc, jz, houseG);
    jar.scale.set(1, 1.22, 1);
    add(new THREE.CylinderGeometry(0.30 * sc, 0.32 * sc, 0.08, 14), M.concrete, jx, 0.98 * sc, jz, houseG);
  }

  // Golden Miniature Khmer Spirit House (ខ្ទមអ្នកតា) on post in yard corner (x = -6.05, z = -1.55)
  const spG = new THREE.Group(); spG.position.set(-6.05, 0, -1.55); houseG.add(spG);
  add(new THREE.CylinderGeometry(0.08, 0.10, 1.45, 8), M.whiteMortar, 0, 0.72, 0, spG);
  add(box(0.68, 0.08, 0.56), M.gold, 0, 1.48, 0, spG);
  add(box(0.46, 0.42, 0.38), M.gold, 0, 1.72, 0, spG);
  const spRoof = add(new THREE.ConeGeometry(0.46, 0.52, 4), M.gold, 0, 2.18, 0, spG);
  spRoof.rotation.y = Math.PI / 4;

  // ---- CENTERPIECE 1: Carved Khmer Wooden Salon Daybed (សាឡុងឈើខ្មែរ) at x = -1.12, z = -0.45 ----
  // Width 1.90m -> spans x = -2.07 to -0.17; right side is an open low bolster edge so Older Bro's arm dangles freely toward the remote!
  const salonG = new THREE.Group(); salonG.position.set(-1.12, 0, -0.45); houseG.add(salonG);
  add(tbox(1.90, 0.14, 1.18, 1.5), M.teakPlank, 0, 0.46, 0, salonG);
  for (const lx of [-0.84, 0.84]) for (const lz of [-0.48, 0.48]) {
    add(tbox(0.14, 0.46, 0.14, 1), M.beam, lx, 0.23, lz, salonG);
  }
  // Ornate carved wooden backrest & left footrest armrest (open right side for unobstructed 10cm elbow-to-remote sightline!)
  add(tbox(1.94, 0.62, 0.10, 1.5), M.beam, 0, 0.84, -0.54, salonG);
  add(box(1.74, 0.08, 0.12), M.gold, 0, 1.14, -0.54, salonG);
  add(tbox(0.10, 0.34, 1.16, 1), M.beam, -0.90, 0.68, 0, salonG);
  add(tbox(0.08, 0.08, 1.16, 1), M.gold, 0.91, 0.56, 0, salonG);
  // Woven red Khmer mat (កន្ទេលក្រហម) + folded Krama on seat (y = 0.54)
  add(tbox(1.76, 0.05, 1.04, 1.5), M.matRed, 0.02, 0.55, 0.02, salonG);
  add(tbox(0.42, 0.06, 0.52, 1), M.krama, -0.52, 0.59, 0.12, salonG);

  // ---- CENTERPIECE 2: Low Teak Side Stool + THE 3D TV REMOTE (10cm from Brother's right hand!) at x = +0.08, z = -0.18 ----
  const stoolG = new THREE.Group(); stoolG.position.set(0.08, 0, -0.18); houseG.add(stoolG);
  add(new THREE.CylinderGeometry(0.22, 0.20, 0.07, 18), M.teakPlank, 0, 0.52, 0, stoolG);
  for (const [lx, lz] of [[-0.11, -0.11], [0.11, -0.11], [-0.11, 0.11], [0.11, 0.11]]) {
    add(new THREE.CylinderGeometry(0.032, 0.026, 0.52, 8), M.beam, lx, 0.26, lz, stoolG);
  }
  // Crisp 3D TV Remote Control (តេឡេទូរទស្សន៍) sitting right on top at y = 0.58!
  remoteMesh3D = new THREE.Group(); remoteMesh3D.position.set(-0.02, 0.575, 0.02);
  remoteMesh3D.rotation.y = 0.32; stoolG.add(remoteMesh3D);
  add(box(0.11, 0.038, 0.24), M.darkInk, 0, 0, 0, remoteMesh3D);
  add(new THREE.CylinderGeometry(0.020, 0.020, 0.046, 10), M.remoteRed, 0, 0.005, -0.075, remoteMesh3D, { cast: false });
  for (const bz of [-0.01, 0.04, 0.08]) {
    add(box(0.065, 0.044, 0.024), M.gold, 0, 0.004, bz, remoteMesh3D, { cast: false });
  }
  // Pulsing golden highlight ring around the remote when pointed at!
  remoteRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.14, 0.19, 28),
    new THREE.MeshBasicMaterial({ color: '#ffe14d', side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false })
  );
  remoteRingMesh.rotation.x = -Math.PI / 2;
  remoteRingMesh.position.set(-0.02, 0.562, 0.02);
  remoteRingMesh.userData.ndSkip = true; remoteRingMesh.visible = false;
  stoolG.add(remoteRingMesh);

  // ---- CENTERPIECE 3: Family Television Set on Khmer Teak Cabinet (x = +1.76, z = -0.45, angled left toward salon) ----
  const tvG = new THREE.Group(); tvG.position.set(1.76, 0, -0.45); tvG.rotation.y = -0.36; houseG.add(tvG);
  add(tbox(1.12, 0.68, 0.54, 1.5), M.teakPlank, 0, 0.34, 0, tvG);
  add(box(0.98, 0.48, 0.56), M.beam, 0, 0.34, 0, tvG);
  // Flatscreen / Classic Family TV with rabbit-ear antenna!
  add(box(1.06, 0.68, 0.10), M.darkInk, 0, 1.10, 0, tvG);
  add(box(0.30, 0.10, 0.22), M.darkInk, 0, 0.72, 0, tvG);
  tvScreenBars = add(new THREE.PlaneGeometry(0.92, 0.54), M.tvBars, 0, 1.10, 0.056, tvG, { cast: false, receive: false });
  tvScreenAction = add(new THREE.PlaneGeometry(0.92, 0.54), M.tvAction, 0, 1.10, 0.057, tvG, { cast: false, receive: false });
  tvScreenAction.visible = false;
  for (const s of [-1, 1]) {
    const ant = add(new THREE.CylinderGeometry(0.01, 0.012, 0.46, 6), M.concrete, s * 0.18, 1.61, 0, tvG);
    ant.rotation.z = -s * 0.45;
  }
}

// Soft Painterly Golden Radial Glow behind "King Bong" on Royal Beats (no hard circle edge!)
kingHaloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 2.6),
  new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,216,68', 0.58)), transparent: true, depthWrite: false })
);
kingHaloMesh.userData.ndSkip = true; kingHaloMesh.visible = false; scene.add(kingHaloMesh);

// ============================================================================
// ZONE B (x = +13.5): SUNLIT KHMER BACKYARD (ក្រោយផ្ទះ — ភ្នំចំបើង, ដើមចេក, របងឫស្សី!)
// ============================================================================
const yardG = new THREE.Group(); yardG.position.set(13.5, DECK, 0.0); world.add(yardG);
{
  // Swept backyard play patch
  const playPad = add(new THREE.CircleGeometry(3.2, 24), M.sweptEarth, 0, 0.01, 0.2, yardG, { cast: false });
  playPad.rotation.x = -Math.PI / 2;

  // Iconic Cambodian Conical Rice-Straw Haystack (ភ្នំចំបើង) around a central wooden pole (z = -3.4, strictly behind actors!)
  const hayG = new THREE.Group(); hayG.position.set(1.85, 0, -3.4); yardG.add(hayG);
  add(new THREE.CylinderGeometry(0.07, 0.09, 3.65, 8), M.beam, 0, 1.82, 0, hayG);
  add(new THREE.CylinderGeometry(0.95, 1.25, 1.15, 18), M.haystack, 0, 0.58, 0, hayG);
  add(new THREE.ConeGeometry(1.12, 2.15, 18), M.haystack, 0, 2.12, 0, hayG);

  // Rustic Bamboo Slat Fence along back edge (z = -4.2, spanning whole sprint path x = +6.1..+18.1)
  add(tbox(12.0, 1.05, 0.08, 1.5), M.bamboo, -1.4, 0.55, -4.2, yardG);
  for (let fx = -7.4; fx <= 4.6; fx += 2.0) {
    add(new THREE.CylinderGeometry(0.06, 0.07, 1.28, 7), M.beam, fx, 0.64, -4.18, yardG);
  }

  // Square Concrete Cambodian Village Utility Pole (z = -4.5)
  add(box(0.20, 7.2, 0.20), M.concrete, -4.2, 3.6, -4.5, yardG);
  add(box(1.2, 0.10, 0.10), M.concrete, -4.2, 6.8, -4.5, yardG);

  // Banana Tree Clusters (ដើមចេក) flanking backyard
  const bananaCluster = (bx, bz) => {
    const bg = new THREE.Group(); bg.position.set(bx, 0, bz); yardG.add(bg);
    for (const [ox, oz, h] of [[0, 0, 2.4], [0.45, -0.3, 1.9], [-0.4, -0.25, 2.1]]) {
      add(new THREE.CylinderGeometry(0.09, 0.14, h, 8), M.paddyGreen, ox, h / 2, oz, bg);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const lf = add(new THREE.PlaneGeometry(0.48, 1.45), M.bananaLeaf, ox + Math.cos(a) * 0.55, h + 0.15, oz + Math.sin(a) * 0.55, bg);
        lf.rotation.order = 'YXZ'; lf.rotation.y = -a + Math.PI / 2; lf.rotation.x = 1.05;
      }
    }
  };
  bananaCluster(-2.8, -3.5);
  bananaCluster(4.1, -3.2);
}

// ============================================================================
// AUTHENTIC CAMBODIAN SUGAR PALMS (ដើមត្នោត) ALONG RICE BUND & VILLAGE HORIZON
// ============================================================================
const sugarPalm = (x, z, h = 11.5) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  // Flared dark root base + single smooth tapered pale ash-grey shaft (zero cylinder step seams!)
  add(new THREE.CylinderGeometry(0.23, 0.42, 1.1, 12), M.trunk, 0, 0.55, 0, g);
  const crownG = new THREE.Group();
  crownG.rotation.z = ((Math.abs(Math.round(x)) % 3) - 1) * 0.025;
  g.add(crownG);
  add(new THREE.CylinderGeometry(0.15, 0.22, h - 0.85, 12), M.palmBark, 0, 0.85 + (h - 0.85) / 2, 0, crownG);
  // Short collar of drooping dried brown fronds right beneath green pom-pom crown
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dry = add(new THREE.ConeGeometry(0.36, 1.35, 4), M.palmFrondDry, Math.cos(a) * 0.45, h - 0.55, Math.sin(a) * 0.45, crownG);
    dry.scale.set(1, 1, 0.22); dry.rotation.order = 'YXZ'; dry.rotation.y = -a + Math.PI / 2; dry.rotation.x = 2.25;
  }
  // Spherical starburst crown of stiff fan-shaped sugar-palm fronds!
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2, tier = k % 2;
    const frond = add(new THREE.ConeGeometry(0.58, 2.35, 5), M.palmLeaf, Math.cos(a) * 0.95, h + 0.15 + tier * 0.28, Math.sin(a) * 0.95, crownG);
    frond.scale.set(1, 1, 0.18); frond.rotation.order = 'YXZ';
    frond.rotation.y = -a + Math.PI / 2; frond.rotation.x = tier ? 0.72 : 1.28;
  }
};
const villageTree = (x, z, h = 6.8, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.22, 0.36, h * 0.55, 8), M.trunk, 0, h * 0.27, 0, g);
  add(new THREE.SphereGeometry(2.0 * s, 12, 10), M.canopyA, 0, h * 0.68, 0, g).scale.set(1.15, 0.82, 1.05);
  add(new THREE.SphereGeometry(1.4 * s, 10, 8), M.canopyB, -1.0, h * 0.58, 0.5, g).scale.set(1.1, 0.78, 1.0);
};

// Strictly placed along the rear rice-field bund (z = -18.2) & village tree line (z <= -5.5)!
[[-9.5, -18.2, 12.2], [-2.5, -18.2, 13.0], [5.2, -18.2, 12.5], [12.0, -18.2, 11.8], [19.5, -18.2, 12.8], [7.2, -9.5, 11.2]].forEach(([x, z, h]) => sugarPalm(x, z, h));
[[-8.2, -6.2, 6.6, 0.95], [5.8, -5.8, 6.5, 0.9], [9.2, -6.4, 6.8, 0.95], [20.5, -6.0, 6.6, 0.9]].forEach(([x, z, h, s]) => villageTree(x, z, h, s));

// Distant isolated Phnom limestone hills on flat horizon
{
  const rm = P.rng(109);
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * 0.85 + (i / 10) * Math.PI * 0.85, d = 210 + rm() * 110;
    const h = add(new THREE.SphereGeometry(38 + rm() * 28, 16, 10), M.hillFar, Math.cos(a) * d, -14, Math.sin(a) * d, world, { cast: false });
    h.scale.y = 0.45 + rm() * 0.22;
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

// Expanding 3D Sonic Shout Shockwave Rings (blasting from House Salon -> across Village to Backyard!)
const shoutRings = [];
for (let i = 0; i < 4; i++) {
  const rm = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.96, 36),
    new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff5238' : '#ffd23f', side: THREE.DoubleSide, transparent: true, opacity: 0.78, depthWrite: false })
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
  // 3D TV Remote on low teak stool (hidden once Younger Bro picks it up to pass to Older Bro!)
  remoteMesh3D.visible = !S.hide3DRemote;
  if (S.highlightRemote && !S.hide3DRemote) {
    remoteRingMesh.visible = true;
    remoteRingMesh.scale.setScalar(1.0 + 0.16 * Math.sin(f * 0.32));
  } else {
    remoteRingMesh.visible = false;
  }

  // Family TV screen channel switch!
  tvScreenBars.visible = !S.tvExciting;
  tvScreenAction.visible = !!S.tvExciting;

  // Royal King Bong Aura Halo
  if (S.kingAura) {
    kingHaloMesh.visible = true;
    kingHaloMesh.position.set(S.kingAuraPos[0], S.kingAuraPos[1], S.kingAuraPos[2]);
    kingHaloMesh.scale.setScalar(1.0 + 0.08 * Math.sin(f * 0.25));
    kingHaloMesh.quaternion.copy(camera.quaternion);
  } else {
    kingHaloMesh.visible = false;
  }

  // Expanding 3D Village-Wide Sonic Shout Rings!
  if (S.shoutWave > 0) {
    shoutRings.forEach((rm, idx) => {
      rm.visible = true;
      const ph = ((f * 0.048) + idx / 4) % 1;
      rm.position.set(-0.2 + ph * 13.5, 1.35 + ph * 0.65, 0.15);
      rm.rotation.y = Math.PI / 2.6;
      rm.scale.setScalar(0.60 + ph * 3.8);
      rm.material.opacity = (1 - ph) * 0.78 * S.shoutWave;
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
