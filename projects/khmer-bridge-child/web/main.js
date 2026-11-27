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
  grass: texM(P.grass(6), 56, 56),
  laterite: texM(P.lateriteRoad(14), 12, 2),
  sweptEarth: texM(P.sweptEarth(21), 4, 3),
  tile: texM(P.courtyardTile(12), 4, 3),
  teakPlank: texM(P.planks(1, 26, 48, 46), 3, 2),
  aquaPlank: texM(P.planks(7, 182, 48, 44), 3, 2),
  bridgePlank: texM(P.planks(19, 28, 34, 42), 4, 2),
  beam: texM(P.beam(2), 1, 2),
  bamboo: texM(P.wovenBamboo(15), 4, 1),
  roof: texM(P.clayTileRoof(9), 4, 2),
  matRed: texM(P.sleepingMat(), 1, 1),
  kramaRed: texM(P.kramaTex('176,34,44'), 2, 1),
  kramaBlue: texM(P.kramaTex('38,82,156'), 2, 1),
  peangJar: texM(P.peangJarTex(), 2, 1),
  palmBark: texM(P.sugarPalmBark(41), 1, 4),
  creekWater: texM(P.creekWater(52), 2, 6),
  umbrella: texM(P.umbrellaTex(), 2, 1),
  gold: toon({ color: '#f2c138' }),
  concrete: toon({ color: '#9ea4a8' }),
  whiteMortar: toon({ color: '#f5f2ea' }),
  hammockRed: toon({ color: '#d93848', side: THREE.DoubleSide }),
  bananaLeaf: toon({ color: '#4ea832', side: THREE.DoubleSide }),
  lotusPad: toon({ color: '#398a34', side: THREE.DoubleSide }),
  lotusPink: toon({ color: '#f584b0' }),
  palmFrondDry: toon({ color: '#87683e', side: THREE.DoubleSide }),
  palmLeaf: toon({ color: '#467d2c', side: THREE.DoubleSide }),
  paddyGreen: toon({ color: '#6cc239' }),
  bundDirt: toon({ color: '#c4a678' }),
  clothOrange: toon({ color: '#ff7043' }),
  clothYellow: toon({ color: '#ffd54f' }),
  clothSky: toon({ color: '#42a5f5' }),
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
scene.fog = new THREE.Fog('#ffffff', 75, 720);

const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// 1. Flat Cambodian Village Ground + Red-Pink Laterite Dirt Roads + Distant Emerald Rice Paddy & Bund
const lawn = add(new THREE.PlaneGeometry(520, 520), M.grass, 0, DECK - 0.03, 0, world, { cast: false });
lawn.rotation.x = -Math.PI / 2;

// Red-pink laterite footpath from Khmer Stilt House (x = 0) -> Yard Gate (x = +12.5)
const yardPath = add(new THREE.PlaneGeometry(18.0, 2.8), M.laterite, 6.8, DECK + 0.004, 0.15, world, { cast: false });
yardPath.rotation.x = -Math.PI / 2;
const gatePath = add(new THREE.PlaneGeometry(3.2, 5.2), M.laterite, 12.5, DECK + 0.005, -1.1, world, { cast: false });
gatePath.rotation.x = -Math.PI / 2;
// Main Village Laterite Dirt Road running behind the yard gate (z = -3.6)
const villageRoad = add(new THREE.PlaneGeometry(68.0, 3.4), M.laterite, -2.0, DECK + 0.004, -3.6, world, { cast: false });
villageRoad.rotation.x = -Math.PI / 2;

// Distant electric-green Cambodian rice paddy field + raised bund dike (ភ្លឺស្រែ) at z = -22..-48
const paddy = add(new THREE.PlaneGeometry(190, 28), M.paddyGreen, -2, DECK - 0.015, -32, world, { cast: false });
paddy.rotation.x = -Math.PI / 2;
add(box(190, 0.28, 0.85), M.bundDirt, -2, 0.12, -18.2, world, { cast: false });

// ============================================================================
// STAGE A (x = 0.0): KHMER TRADITIONAL STILT HOUSE & UNDER-HOUSE LIVING STAGE (ក្រោមផ្ទះ)
// ============================================================================
const houseG = new THREE.Group(); houseG.position.set(0.0, DECK, 0.0); world.add(houseG);
let clothesStack3D, snackTable3D;
{
  add(tbox(11.6, 0.06, 6.4, 2), M.tile, 0, -0.02, -0.5, houseG, { cast: false });

  // Stout square timber stilts wide apart at x = -5.55 & +5.55 -> ZERO foreground camera occlusion!
  for (const px of [-5.55, 5.55]) {
    add(box(0.36, 0.16, 0.36), M.concrete, px, 0.08, 1.85, houseG);
    add(tbox(0.24, 3.95, 0.24, 1.5), M.beam, px, 2.05, 1.85, houseG);
  }
  for (const px of [-5.55, -1.85, 1.85, 5.55]) {
    add(box(0.36, 0.16, 0.36), M.concrete, px, 0.08, -2.85, houseG);
    add(tbox(0.24, 3.95, 0.24, 1.5), M.beam, px, 2.05, -2.85, houseG);
  }

  // Elevated Upper Khmer Wooden House Story (aqua-turquoise painted rural planks + propped wooden shutters)
  add(tbox(12.0, 0.24, 5.4, 2), M.teakPlank, 0, 3.95, -0.5, houseG);
  add(tbox(11.4, 2.35, 4.8, 2), M.aquaPlank, 0, 5.22, -0.5, houseG);
  for (const wx of [-3.1, 0, 3.1]) {
    add(tbox(1.15, 1.05, 0.12, 1), M.beam, wx, 5.25, 1.94, houseG);
    const sh = add(tbox(1.10, 0.95, 0.08, 1), M.whiteMortar, wx, 5.42, 2.24, houseG);
    sh.rotation.x = -0.55;
  }
  // Steep Khmer terracotta clay-tile roof + white-mortared ridge
  for (const s of [-1, 1]) {
    const rf = add(tbox(12.6, 0.22, 3.6, 2), M.roof, 0, 7.25, -0.5 + s * 1.45, houseG);
    rf.rotation.x = s * 0.62;
  }
  add(box(12.7, 0.16, 0.24), M.whiteMortar, 0, 8.15, -0.5, houseG);

  // Rear wooden wall screen + diagonal red hammock (អង្រឹង) + Peang water jars (ពាងទឹក)
  add(tbox(11.2, 2.35, 0.16, 2), M.teakPlank, 0, 1.22, -2.95, houseG);
  const ham = add(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 10, 1, true, 0, Math.PI), M.hammockRed, 3.2, 1.05, -2.30, houseG);
  ham.rotation.z = Math.PI / 2 - 0.08; ham.rotation.x = 0.35;

  for (const [jx, jz, sc] of [[-4.65, -1.95, 1.0], [-3.82, -2.15, 0.88]]) {
    const jar = add(new THREE.SphereGeometry(0.42 * sc, 16, 12), M.peangJar, jx, 0.48 * sc, jz, houseG);
    jar.scale.set(1, 1.22, 1);
    add(new THREE.CylinderGeometry(0.30 * sc, 0.32 * sc, 0.08, 14), M.concrete, jx, 0.98 * sc, jz, houseG);
  }

  // Golden Miniature Khmer Spirit House (ខ្ទមអ្នកតា) in left yard corner
  const spG = new THREE.Group(); spG.position.set(-6.05, 0, -1.55); houseG.add(spG);
  add(new THREE.CylinderGeometry(0.08, 0.10, 1.45, 8), M.whiteMortar, 0, 0.72, 0, spG);
  add(box(0.68, 0.08, 0.56), M.gold, 0, 1.48, 0, spG);
  add(box(0.46, 0.42, 0.38), M.gold, 0, 1.72, 0, spG);
  const spRoof = add(new THREE.ConeGeometry(0.46, 0.52, 4), M.gold, 0, 2.18, 0, spG);
  spRoof.rotation.y = Math.PI / 4;

  // Under-house Slatted Khmer Bed (គ្រែឈើខ្មែរ) at x = -1.75, z = -1.05 (where Younger Bro rummages clothes & ties his Krama bundle!)
  const kreG = new THREE.Group(); kreG.position.set(-1.75, 0, -1.05); houseG.add(kreG);
  add(tbox(1.90, 0.12, 1.16, 1.5), M.teakPlank, 0, 0.48, 0, kreG);
  for (const lx of [-0.84, 0.84]) for (const lz of [-0.48, 0.48]) {
    add(tbox(0.12, 0.48, 0.12, 1), M.beam, lx, 0.24, lz, kreG);
  }
  add(tbox(1.74, 0.04, 1.02, 1.5), M.matRed, 0, 0.55, 0, kreG);
  add(tbox(0.46, 0.06, 0.58, 1), M.kramaRed, -0.52, 0.60, 0.05, kreG);

  // 3D Stack of Colorful Folded Kids' Clothes on the Kre Bed (hidden once packed into the Krama bundle!)
  clothesStack3D = new THREE.Group(); clothesStack3D.position.set(0.28, 0.58, 0.08); kreG.add(clothesStack3D);
  add(box(0.42, 0.07, 0.36), M.clothSky, 0, 0.035, 0, clothesStack3D);
  add(box(0.38, 0.07, 0.34), M.clothYellow, 0.02, 0.105, -0.02, clothesStack3D);
  add(box(0.36, 0.07, 0.32), M.clothOrange, -0.02, 0.175, 0.01, clothesStack3D);

  // Low Teak Snack Table at x = 0.0, z = -0.58 holding delicious Khmer snacks!
  const tblG = new THREE.Group(); tblG.position.set(0.0, 0, -0.58); houseG.add(tblG);
  add(new THREE.CylinderGeometry(0.34, 0.32, 0.07, 20), M.teakPlank, 0, 0.48, 0, tblG);
  for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    add(new THREE.CylinderGeometry(0.035, 0.028, 0.48, 8), M.beam, lx, 0.24, lz, tblG);
  }
  snackTable3D = new THREE.Group(); snackTable3D.position.set(0, 0.52, 0); tblG.add(snackTable3D);
  add(new THREE.CylinderGeometry(0.22, 0.19, 0.03, 16), M.bamboo, 0, 0.015, 0, snackTable3D);
  add(new THREE.ConeGeometry(0.09, 0.16, 4), M.cakeGreen, -0.06, 0.10, 0, snackTable3D);
  add(new THREE.SphereGeometry(0.075, 12, 10), M.gold, 0.07, 0.07, 0.03, snackTable3D);
}

// ============================================================================
// STAGE B (x = +12.5): KHMER FRONT YARD GATE (មាត់ទ្វាររបង) & ROADSIDE SNACK STALL (តូបលក់នំ)
// ============================================================================
// Fence & gate sit at z = -1.55 strictly BEHIND actors (z = -0.15..-0.95) -> ZERO foreground occlusion!
const gateStageG = new THREE.Group(); gateStageG.position.set(12.5, DECK, 0.0); world.add(gateStageG);
{
  // Woven bamboo & timber picket fence flanking the open wooden gate
  for (const side of [-1, 1]) {
    add(tbox(4.2, 1.08, 0.08, 1.5), M.bamboo, side * 3.55, 0.56, -1.55, gateStageG);
    for (let fx = 1.55; fx <= 5.55; fx += 1.33) {
      add(new THREE.CylinderGeometry(0.06, 0.07, 1.32, 8), M.beam, side * fx, 0.66, -1.53, gateStageG);
    }
  }
  // Twin stout Khmer wooden gate pillars (x = -1.45 & +1.45 -> world x = 11.05 & 13.95, z = -1.55)
  for (const gx of [-1.45, 1.45]) {
    add(box(0.32, 0.18, 0.32), M.concrete, gx, 0.09, -1.55, gateStageG);
    add(tbox(0.22, 2.75, 0.22, 1.5), M.beam, gx, 1.42, -1.55, gateStageG);
    // Open slatted wooden gate leaves swung backward toward the road!
    const leaf = new THREE.Group(); leaf.position.set(gx, 0.65, -1.55);
    leaf.rotation.y = gx < 0 ? 1.05 : -1.05;
    gateStageG.add(leaf);
    add(tbox(1.22, 1.02, 0.06, 1.2), M.teakPlank, gx < 0 ? 0.62 : -0.62, 0, 0, leaf);
  }
  // Charming pitched Khmer terracotta gate roof lintel spanning high at y = 2.85m
  add(tbox(3.55, 0.16, 0.45, 1.5), M.beam, 0, 2.78, -1.55, gateStageG);
  for (const s of [-1, 1]) {
    const grf = add(tbox(3.75, 0.14, 0.62, 1.5), M.roof, 0, 3.04, -1.55 + s * 0.24, gateStageG);
    grf.rotation.x = s * 0.55;
  }
  add(box(3.80, 0.10, 0.14), M.whiteMortar, 0, 3.22, -1.55, gateStageG);

  // Cute Khmer Village Snack Stall (តូបលក់នំ) right outside the fence at x = +3.1 (world x = 15.6), z = -2.35!
  const stallG = new THREE.Group(); stallG.position.set(3.1, 0, -2.35); gateStageG.add(stallG);
  add(tbox(1.55, 0.72, 0.82, 1.2), M.teakPlank, 0, 0.36, 0, stallG);
  add(new THREE.CylinderGeometry(0.04, 0.04, 2.35, 8), M.beam, 0, 1.18, -0.1, stallG);
  const umb = add(new THREE.ConeGeometry(1.38, 0.58, 12), M.umbrella, 0, 2.42, -0.1, stallG);
  umb.rotation.z = 0.08;
  // Heaps of golden Khmer snacks on banana leaves!
  for (const sx of [-0.42, 0, 0.42]) {
    add(new THREE.CylinderGeometry(0.20, 0.18, 0.03, 14), M.bananaLeaf, sx, 0.74, 0.05, stallG);
    add(new THREE.SphereGeometry(0.09, 10, 8), M.gold, sx - 0.04, 0.81, 0.05, stallG);
    add(new THREE.ConeGeometry(0.08, 0.15, 4), M.cakeGreen, sx + 0.06, 0.83, 0.05, stallG);
  }
}

// ============================================================================
// STAGE C (x = -24.0): AUTHENTIC CAMBODIAN WOODEN CREEK BRIDGE (ស្ពានឈើ & ក្រោមស្ពាន!)
// ============================================================================
const bridgeStageG = new THREE.Group(); bridgeStageG.position.set(-24.0, DECK, 0.0); world.add(bridgeStageG);
{
  // Depressed creek channel filled with calm emerald-teal water + floating lotus pads & pink lotus blossoms!
  const water = add(new THREE.PlaneGeometry(5.2, 26.0), M.creekWater, -0.6, -0.06, -3.5, bridgeStageG, { cast: false });
  water.rotation.x = -Math.PI / 2;

  // Sloped grassy/sandy creek banks on left (x = -4.2) and right (x = +2.3, dry under-bridge bank alcove!)
  add(tbox(3.4, 0.24, 18.0, 2), M.sweptEarth, -4.6, 0.06, -2.0, bridgeStageG, { cast: false });
  add(tbox(4.2, 0.22, 18.0, 2), M.sweptEarth, 3.6, 0.05, -2.0, bridgeStageG, { cast: false });
  // Dry sandy shelf tucked right UNDER the right span of the bridge (world x = -22.2, y = 0.04, z = -0.35) where the baby basket sits!
  const alcovePad = add(new THREE.CircleGeometry(1.55, 20), M.sweptEarth, 1.85, 0.02, -0.35, bridgeStageG, { cast: false });
  alcovePad.rotation.x = -Math.PI / 2;

  // Floating emerald Lotus Pads (ស្លឹកឈូក) & Pink Lotus Flowers (ផ្កាឈូក) on creek water!
  for (const [lx, lz, r] of [[-1.8, 1.3, 0.34], [-0.5, 1.9, 0.28], [0.4, 1.4, 0.32], [-1.4, -2.4, 0.36], [0.1, -2.8, 0.30]]) {
    const pad = add(new THREE.CircleGeometry(r, 14), M.lotusPad, lx, -0.04, lz, bridgeStageG, { cast: false });
    pad.rotation.x = -Math.PI / 2;
    if (r > 0.31) {
      add(new THREE.ConeGeometry(0.11, 0.18, 7), M.lotusPink, lx + 0.04, 0.05, lz, bridgeStageG, { cast: false });
    }
  }

  // Authentic Rustic Khmer Wooden Creek Bridge (ស្ពានឈើ) — Deck at y = 1.82m, z = -0.65
  // Timber pilings spaced cleanly at local x = -2.8, -0.2, +3.4 so local x = +1.85 (baby alcove!) is 100% open & unoccluded!
  for (const px of [-2.8, -0.2, 3.4]) {
    for (const pz of [-1.22, -0.08]) {
      add(new THREE.CylinderGeometry(0.11, 0.13, 2.05, 10), M.beam, px, 0.86, pz, bridgeStageG);
    }
    add(tbox(0.20, 0.18, 1.42, 1), M.beam, px, 1.68, -0.65, bridgeStageG);
  }
  // Horizontal bridge stringers + weathered wooden plank deck + gentle approach ramps!
  add(tbox(7.8, 0.16, 1.48, 2), M.bridgePlank, 0.2, 1.82, -0.65, bridgeStageG);
  const rampL = add(tbox(2.4, 0.14, 1.44, 1.5), M.bridgePlank, -4.6, 0.96, -0.65, bridgeStageG);
  rampL.rotation.z = 0.72;
  const rampR = add(tbox(2.4, 0.14, 1.44, 1.5), M.bridgePlank, 5.0, 0.96, -0.65, bridgeStageG);
  rampR.rotation.z = -0.72;

  // Rear wooden handrail ONLY (at z = -1.34) + low 0.09m front wheel-curb (at z = +0.04) -> Mom's Sampot is 100% unobstructed!
  add(tbox(7.8, 0.09, 0.10, 1.5), M.beam, 0.2, 1.93, 0.04, bridgeStageG);
  add(tbox(7.8, 0.09, 0.09, 1.5), M.beam, 0.2, 2.58, -1.34, bridgeStageG);
  add(tbox(7.8, 0.07, 0.08, 1.5), M.beam, 0.2, 2.22, -1.34, bridgeStageG);
  for (let rx_ = -3.4; rx_ <= 3.8; rx_ += 1.44) {
    add(tbox(0.10, 0.82, 0.10, 1), M.beam, rx_, 2.24, -1.34, bridgeStageG);
  }
}

// ============================================================================
// AUTHENTIC CAMBODIAN SUGAR PALMS (ដើមត្នោត), BANANA TREES & HORIZON HILLS
// ============================================================================
const sugarPalm = (x, z, h = 11.5) => {
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

// Strictly behind all action stages (z <= -5.8 or along rear rice bund z = -18.2)!
[
  [-30.5, -15.0, 12.2], [-22.5, -16.5, 12.8], [-16.0, -18.2, 11.8],
  [-8.5, -18.2, 12.4], [-1.8, -18.2, 13.0], [6.2, -18.2, 12.2],
  [11.2, -18.2, 12.6], [17.8, -18.2, 11.9],
].forEach(([x, z, h]) => sugarPalm(x, z, h));

[[-28.8, -4.5], [-19.2, -4.2], [7.8, -2.6], [17.2, -2.6]].forEach(([x, z]) => bananaCluster(x, z));
[[-31.0, -7.2, 6.5, 0.95], [-16.5, -6.8, 6.6, 0.9], [6.8, -6.5, 6.5, 0.9], [19.5, -6.8, 6.7, 0.95]].forEach(([x, z, h, s]) => villageTree(x, z, h, s));

// Distant isolated Phnom limestone hills on flat Cambodian horizon
{
  const rm = P.rng(109);
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * 0.88 + (i / 10) * Math.PI * 0.88, d = 220 + rm() * 110;
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

// Soft Painterly Golden/Crimson Aura Halo for Dramatic Beats
const auraHaloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 2.6),
  new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,212,68', 0.56)), transparent: true, depthWrite: false })
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
  clothesStack3D.visible = !S.hideClothesStack;
  snackTable3D.visible = !S.hideTableSnacks;

  if (S.aura) {
    auraHaloMesh.visible = true;
    auraHaloMesh.position.set(S.auraPos[0], S.auraPos[1], S.auraPos[2]);
    auraHaloMesh.scale.setScalar(1.0 + 0.08 * Math.sin(f * 0.25));
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
