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
  const d = new Uint8Array([98, 98, 98, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });

const M = {
  grass: texM(P.grass(12), 48, 48),
  sand: texM(P.courtyardSand(21), 16, 12),
  walkway: texM(P.schoolWalkway(33), 14, 2),
  stuccoYellow: texM(P.schoolYellowStucco(45), 4, 2),
  corridorTile: texM(P.corridorTile(52), 8, 2),
  shutterBlue: toon({ map: P.texClamp(P.blueShutterTex()) }),
  roofTile: texM(P.clayTileRoof(9), 8, 2),
  chalkboard: toon({ map: P.texClamp(P.chalkboardTex()) }),
  restroomSign: toon({ map: P.texClamp(P.restroomSignTex()) }),
  flagCambodia: toon({ map: P.texClamp(P.cambodiaFlagTex()), side: THREE.DoubleSide }),
  palmBark: texM(P.sugarPalmBark(41), 1, 4),
  beam: texM(P.beam(2), 1, 2),
  whitePlaster: toon({ color: '#f7f5ef' }),
  crimsonTrim: toon({ color: '#a82428' }),
  gold: toon({ color: '#f2c138' }),
  emeraldTrim: toon({ color: '#1d7a4c' }),
  concrete: toon({ color: '#9ea5ad' }),
  darkDoor: toon({ color: '#2b1e19' }),
  bananaYellow: toon({ color: '#ffe135', side: THREE.DoubleSide }),
  bananaInner: toon({ color: '#fff6b3', side: THREE.DoubleSide }),
  bananaTip: toon({ color: '#5c3c18' }),
  bikeBlue: toon({ color: '#4cb5f5' }),
  bikeMint: toon({ color: '#4cd9a0' }),
  tireDark: toon({ color: '#24272b' }),
  chrome: toon({ color: '#dce3eb' }),
  jarBrown: toon({ color: '#8f4d2c' }),
  waterBlue: toon({ color: '#5bc0f8' }),
  trunk: toon({ color: '#6b472c' }),
  canopyGreen: toon({ color: '#3e8a38' }),
  canopyLight: toon({ color: '#53a644' }),
  flameBlossom: toon({ color: '#f2492a' }),
  palmFrondDry: toon({ color: '#87683e', side: THREE.DoubleSide }),
  palmLeaf: toon({ color: '#467d2c', side: THREE.DoubleSide }),
  paddyGreen: toon({ color: '#6cc239' }),
  bundDirt: toon({ color: '#c4a678' }),
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
scene.fog = new THREE.Fog('#ffffff', 85, 760);

const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// ============================================================================
// 1. CAMBODIAN HIGH SCHOOL COURTYARD, PAVED WALKWAY, MUD PUDDLE & BANANA PEEL!
// ============================================================================
const lawn = add(new THREE.PlaneGeometry(520, 520), M.grass, 0, DECK - 0.04, 0, world, { cast: false });
lawn.rotation.x = -Math.PI / 2;

const yardSand = add(new THREE.PlaneGeometry(56, 26), M.sand, 0, DECK - 0.015, 2.0, world, { cast: false });
yardSand.rotation.x = -Math.PI / 2;

// Wide Paved School Walkway (ផ្លូវដើរមុខថ្នាក់) from x = -22 to +22, z = -1.75 to +1.95
add(tbox(44.0, 0.04, 3.7, 2.2), M.walkway, 0, DECK - 0.005, 0.10, world, { cast: false });
add(box(44.0, 0.08, 0.14), M.whitePlaster, 0, 0.02, 1.96, world, { cast: false });
add(box(44.0, 0.08, 0.14), M.whitePlaster, 0, 0.02, -1.76, world, { cast: false });

// Glossy Rainwater Mud Puddle (ថ្លុកភក់កណ្តាលសាលា) right at (x = 0.0, z = 0.45)!
const puddleMat = new THREE.MeshBasicMaterial({ map: P.texClamp(P.mudPuddleTex(77)), transparent: true, depthWrite: false });
const puddleMesh = add(new THREE.PlaneGeometry(2.85, 2.05), puddleMat, 0.0, DECK + 0.022, 0.45, world, { cast: false, receive: false });
puddleMesh.rotation.x = -Math.PI / 2;
puddleMesh.userData.ndSkip = true;
puddleMesh.renderOrder = 1;
// Subtle 3D raised muddy rim Ring so ink shader also outlines the puddle naturally on low shots!
const puddleRim = add(new THREE.RingGeometry(0.92, 1.06, 28), toon({ color: '#4d2f18', side: THREE.DoubleSide }), 0.0, DECK + 0.019, 0.45, world, { cast: false });
puddleRim.rotation.x = -Math.PI / 2; puddleRim.scale.set(1.18, 0.82, 1);

// 3D Sculpted 4-Petal Yellow Banana Peel (សំបកចេកមួយនៅកណ្តាលផ្លូវដើរ)!
const bananaPeelG = new THREE.Group();
bananaPeelG.position.set(-1.55, DECK + 0.025, 0.40);
scene.add(bananaPeelG);
{
  add(new THREE.CylinderGeometry(0.035, 0.055, 0.11, 8), M.bananaTip, 0, 0.09, 0, bananaPeelG);
  add(new THREE.SphereGeometry(0.065, 10, 8), M.bananaYellow, 0, 0.045, 0, bananaPeelG);
  for (let k = 0; k < 4; k++) {
    const ang = (k / 4) * Math.PI * 2 + 0.4;
    const petalG = new THREE.Group();
    petalG.rotation.y = ang;
    bananaPeelG.add(petalG);
    const pet = add(new THREE.BoxGeometry(0.24, 0.025, 0.085), M.bananaYellow, 0.13, 0.022, 0, petalG);
    pet.rotation.z = -0.18;
    const inn = add(new THREE.BoxGeometry(0.20, 0.012, 0.065), M.bananaInner, 0.13, 0.014, 0, petalG);
    inn.rotation.z = -0.18;
  }
}

// ============================================================================
// 2. TWO-STORY BUTTER-YELLOW CAMBODIAN HIGH SCHOOL BUILDING (អគារវិទ្យាល័យ ២ ជាន់)
// ============================================================================
const schoolG = new THREE.Group(); schoolG.position.set(-0.5, DECK, 0.0); world.add(schoolG);
let schoolBellMesh;
{
  // Ground-floor raised classroom veranda corridor (x = -9.8..+9.8, z = -1.8..-5.6, top at y = 0.18)
  add(tbox(19.8, 0.22, 3.9, 2.0), M.corridorTile, 0, 0.07, -3.70, schoolG);
  add(box(19.9, 0.18, 0.18), M.whitePlaster, 0, 0.09, -1.78, schoolG);

  // Ground + Upper Rear Butter-Yellow Stucco Classroom Walls (at z = -5.25)
  add(tbox(19.4, 3.38, 0.42, 2.5), M.stuccoYellow, 0, 1.86, -5.25, schoolG);
  add(box(19.5, 0.55, 0.46), M.whitePlaster, 0, 0.45, -5.25, schoolG); // crisp white lower wainscot
  add(tbox(19.4, 3.15, 0.42, 2.5), M.stuccoYellow, 0, 5.15, -5.25, schoolG);

  // 4 Wide Classroom Bays (ground & upper): Open Doors + Chalkboards + Sky-Blue Louvered Shutters!
  for (const bx of [-6.8, -2.2, 2.4, 7.0]) {
    // Ground classroom doorway + chalkboard inside
    add(box(1.18, 2.25, 0.46), M.darkDoor, bx - 0.85, 1.30, -5.24, schoolG);
    add(new THREE.PlaneGeometry(1.65, 0.85), M.chalkboard, bx + 0.55, 1.65, -5.01, schoolG, { cast: false });
    // Twin sky-blue louvered shutters propped outward!
    for (const wx of [bx + 0.55, bx + 1.65]) {
      add(box(0.86, 1.32, 0.46), M.darkDoor, wx, 1.62, -5.24, schoolG);
      const shL = add(box(0.42, 1.28, 0.06), M.shutterBlue, wx - 0.36, 1.62, -4.96, schoolG);
      shL.rotation.y = -0.45;
      const shR = add(box(0.42, 1.28, 0.06), M.shutterBlue, wx + 0.36, 1.62, -4.96, schoolG);
      shR.rotation.y = 0.45;
    }
    // Upper-floor windows & shutters (behind laughing 2nd-floor balcony classmates!)
    for (const wx of [bx - 0.65, bx + 0.85]) {
      add(box(0.92, 1.28, 0.46), M.darkDoor, wx, 5.12, -5.24, schoolG);
      const uShL = add(box(0.44, 1.24, 0.06), M.shutterBlue, wx - 0.38, 5.12, -4.96, schoolG);
      uShL.rotation.y = -0.42;
      const uShR = add(box(0.44, 1.24, 0.06), M.shutterBlue, wx + 0.38, 5.12, -4.96, schoolG);
      uShR.rotation.y = 0.42;
    }
  }

  // Veranda Square White/Yellow Columns at z = -2.35 (well behind walkway z = 0 & Crush at z = -1.55!)
  for (const px of [-9.4, -4.7, 0.0, 4.7, 9.4]) {
    add(box(0.32, 3.38, 0.32), M.whitePlaster, px, 1.86, -2.35, schoolG);
    add(box(0.38, 0.22, 0.38), M.gold, px, 3.42, -2.35, schoolG);
    add(box(0.30, 3.12, 0.30), M.whitePlaster, px, 5.12, -2.35, schoolG);
  }

  // 2nd-Floor Open Balcony Deck (y = 3.55) + Waist-High White Khmer Balustrade Railing (y = 3.55..4.18)!
  add(tbox(19.8, 0.24, 3.6, 2.0), M.whitePlaster, 0, 3.55, -3.75, schoolG);
  add(box(19.8, 0.11, 0.18), M.whitePlaster, 0, 4.18, -2.32, schoolG); // top rail (clear below balcony faces!)
  add(box(19.8, 0.14, 0.20), M.crimsonTrim, 0, 3.68, -2.32, schoolG);  // bottom trim band
  for (let rx_ = -9.2; rx_ <= 9.2; rx_ += 0.48) {
    add(new THREE.CylinderGeometry(0.035, 0.045, 0.46, 6), M.whitePlaster, rx_, 3.94, -2.32, schoolG);
  }

  // Brass Cambodian School Recess Bell (ជួងសាលា) hanging under veranda arch at x = 0.0, y = 2.95, z = -2.35
  schoolBellMesh = new THREE.Group();
  schoolBellMesh.position.set(0.0, 3.18, -2.35);
  schoolG.add(schoolBellMesh);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 6), M.darkDoor, 0, -0.14, 0, schoolBellMesh);
  add(new THREE.ConeGeometry(0.18, 0.28, 14), M.gold, 0, -0.34, 0, schoolBellMesh);
  add(new THREE.SphereGeometry(0.05, 8, 8), M.gold, 0, -0.49, 0, schoolBellMesh);

  // Steep Terracotta-Red Cambodian Tiled School Roof + White Mortar Ridge + Central Khmer Pediment Crest!
  add(box(20.4, 0.20, 4.2), M.whitePlaster, 0, 6.68, -3.75, schoolG);
  for (const s of [-1, 1]) {
    const rf = add(tbox(20.8, 0.22, 2.85, 2.0), M.roofTile, 0, 7.45, -3.75 + s * 1.12, schoolG);
    rf.rotation.x = s * 0.56;
  }
  add(box(20.9, 0.18, 0.28), M.whitePlaster, 0, 8.18, -3.75, schoolG);
  add(box(20.9, 0.10, 0.14), M.emeraldTrim, 0, 6.72, -1.68, schoolG);

  // Ornate Central Khmer High School Pediment Gable (ហោជាងវិទ្យាល័យ) at x = 0, y = 7.35, z = -1.85
  const ped = add(new THREE.ConeGeometry(1.65, 1.35, 3), M.crimsonTrim, 0, 7.38, -1.92, schoolG);
  ped.scale.set(1.35, 1.0, 0.22); ped.rotation.y = Math.PI;
  add(new THREE.ConeGeometry(0.12, 0.65, 6), M.gold, 0, 8.28, -1.88, schoolG); // golden chofa finial!
  add(new THREE.SphereGeometry(0.28, 12, 10), M.gold, 0, 7.22, -1.78, schoolG);
}

// ============================================================================
// 3. CAMBODIAN NATIONAL FLAGPOLE & STUDENT BICYCLE SHED (Stage Left x = -12.2)
// ============================================================================
let flagMesh;
{
  const fpG = new THREE.Group(); fpG.position.set(-11.8, DECK, -2.1); world.add(fpG);
  add(box(1.15, 0.28, 1.15), M.whitePlaster, 0, 0.14, 0, fpG);
  add(box(0.82, 0.24, 0.82), M.crimsonTrim, 0, 0.40, 0, fpG);
  add(new THREE.CylinderGeometry(0.045, 0.075, 7.8, 10), M.whitePlaster, 0, 4.30, 0, fpG);
  add(new THREE.SphereGeometry(0.11, 10, 10), M.gold, 0, 8.24, 0, fpG);
  flagMesh = add(new THREE.PlaneGeometry(1.55, 0.98, 10, 4), M.flagCambodia, 0.80, 7.58, 0, fpG, { cast: false });

  // Student Step-Through Bicycles (កង់សិស្សសាលា) parked neatly at x = -13.8..-11.6, z = -3.8
  const studentBike = (bx, bz, frameMat) => {
    const bg = new THREE.Group(); bg.position.set(bx, DECK, bz); bg.rotation.y = 0.35; world.add(bg);
    for (const wx of [-0.46, 0.46]) {
      add(new THREE.TorusGeometry(0.32, 0.032, 8, 18), M.tireDark, wx, 0.34, 0, bg);
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.60, 6), M.chrome, wx, 0.34, 0, bg);
    }
    const bar = add(new THREE.CylinderGeometry(0.025, 0.025, 0.82, 6), frameMat, 0, 0.48, 0, bg);
    bar.rotation.z = 1.22;
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.52, 6), M.chrome, 0.38, 0.68, 0, bg);
    add(box(0.22, 0.18, 0.24), M.chrome, 0.48, 0.78, 0, bg); // front wire basket!
    add(box(0.22, 0.06, 0.14), M.tireDark, -0.18, 0.72, 0, bg); // seat
  };
  studentBike(-13.2, -3.6, M.bikeBlue);
  studentBike(-14.4, -3.7, M.bikeMint);
  studentBike(-15.6, -3.6, M.bikeBlue);
}

// ============================================================================
// 4. CAMBODIAN SCHOOL RESTROOM PAVILION (បន្ទប់ទឹកសាលា — Stage Right x = +12.8)!
// ============================================================================
const restroomG = new THREE.Group(); restroomG.position.set(12.8, DECK, -2.35); world.add(restroomG);
{
  add(box(4.6, 0.18, 3.4), M.whitePlaster, 0, 0.09, 0, restroomG);
  add(tbox(4.2, 2.85, 2.9, 2.0), M.stuccoYellow, 0, 1.58, -0.15, restroomG);
  // Open dark entrance doorway at front-left so Hero sprints straight inside!
  add(box(1.38, 1.96, 0.35), M.darkDoor, -0.35, 1.13, 1.18, restroomG);
  add(box(1.56, 0.12, 0.42), M.whitePlaster, -0.35, 2.14, 1.20, restroomG);
  // Giant Crisp Blue/Pink Restroom Sign mounted cleanly BELOW roof eave!
  add(new THREE.PlaneGeometry(1.62, 0.68), M.restroomSign, -0.35, 2.55, 1.36, restroomG, { cast: false });

  // Steep terracotta-red roof on Restroom Pavilion
  for (const s of [-1, 1]) {
    const rrf = add(tbox(4.8, 0.18, 2.15, 1.6), M.roofTile, 0, 3.38, -0.15 + s * 0.82, restroomG);
    rrf.rotation.x = s * 0.52;
  }
  add(box(4.9, 0.14, 0.22), M.whitePlaster, 0, 3.92, -0.15, restroomG);

  // Ribbed Khmer Peang Water Jar (ពាងទឹក) & Blue Wash Basin beside Restroom!
  const jar = add(new THREE.SphereGeometry(0.42, 14, 12), M.jarBrown, 1.45, 0.52, 1.28, restroomG);
  jar.scale.set(1, 1.22, 1);
  add(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 14), M.waterBlue, 1.45, 0.98, 1.28, restroomG);
}

// ============================================================================
// 5. CAMBODIAN ROYAL POINCIANA (ដើមក្ងោក), SUGAR PALMS (ដើមត្នោត) & HORIZON
// ============================================================================
// Whitewashed school perimeter wall far in back (z = -9.5)
for (let wx = -24; wx <= 24; wx += 4.0) {
  add(box(3.85, 1.15, 0.18), M.whitePlaster, wx, 0.58, -9.5, world);
  add(box(0.32, 1.42, 0.32), M.crimsonTrim, wx - 1.92, 0.71, -9.5, world);
}

// Emerald Rice Paddies & Sugar Palms behind the school compound wall!
const paddy = add(new THREE.PlaneGeometry(220, 36), M.paddyGreen, 0, DECK - 0.02, -28, world, { cast: false });
paddy.rotation.x = -Math.PI / 2;
add(box(220, 0.28, 0.9), M.bundDirt, 0, 0.12, -17.5, world, { cast: false });

const sugarPalm = (x, z, h = 12.4) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.24, 0.42, 1.1, 12), M.trunk, 0, 0.55, 0, g);
  add(new THREE.CylinderGeometry(0.15, 0.22, h - 0.85, 12), M.palmBark, 0, 0.85 + (h - 0.85) / 2, 0, g);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dry = add(new THREE.ConeGeometry(0.36, 1.35, 4), M.palmFrondDry, Math.cos(a) * 0.45, h - 0.55, Math.sin(a) * 0.45, g);
    dry.scale.set(1, 1, 0.22); dry.rotation.order = 'YXZ'; dry.rotation.y = -a + Math.PI / 2; dry.rotation.x = 2.25;
  }
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2, tier = k % 2;
    const frond = add(new THREE.ConeGeometry(0.58, 2.35, 5), M.palmLeaf, Math.cos(a) * 0.95, h + 0.15 + tier * 0.28, Math.sin(a) * 0.95, g);
    frond.scale.set(1, 1, 0.18); frond.rotation.order = 'YXZ';
    frond.rotation.y = -a + Math.PI / 2; frond.rotation.x = tier ? 0.72 : 1.28;
  }
};

const flameTree = (x, z, h = 7.2, s = 1.0) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.24, 0.38, h * 0.55, 8), M.trunk, 0, h * 0.27, 0, g);
  add(new THREE.SphereGeometry(2.2 * s, 12, 10), M.canopyGreen, 0, h * 0.68, 0, g).scale.set(1.25, 0.78, 1.05);
  add(new THREE.SphereGeometry(1.5 * s, 10, 8), M.flameBlossom, -0.8, h * 0.78, 0.4, g).scale.set(1.15, 0.65, 1.0);
  add(new THREE.SphereGeometry(1.3 * s, 10, 8), M.flameBlossom, 0.9, h * 0.74, -0.3, g).scale.set(1.10, 0.62, 1.0);
};

[[-22, -17.5, 12.6], [-14.5, -17.5, 13.0], [11.8, -17.5, 12.4], [19.5, -17.5, 12.8], [-4.5, -26.5, 13.4], [6.5, -26.5, 13.1]].forEach(([x, z, h]) => sugarPalm(x, z, h));
[[-15.5, -7.2, 7.0, 1.0], [11.2, -7.4, 6.8, 0.95], [17.6, -4.8, 6.6, 0.92]].forEach(([x, z, h, s]) => flameTree(x, z, h, s));

// Distant Phnom hills on horizon
{
  const rm = P.rng(117);
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * 0.88 + (i / 10) * Math.PI * 0.88, d = 230 + rm() * 110;
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

// Soft Painterly Golden / Pink Anime Aura Halo for Crush & Movie-Star Transformation!
const auraPinkTex = P.tex(P.radial('255,95,162', 0.60));
const auraGoldTex = P.tex(P.radial('255,216,74', 0.58));
const auraHaloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3.1, 3.1),
  new THREE.MeshBasicMaterial({ map: auraPinkTex, transparent: true, depthWrite: false })
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
  px: { value: 2.5 }, fogCol: { value: new THREE.Color() }, sat: { value: 1.16 },
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
  const ext = L.shadowExt || 28, sc = sun.shadow.camera;
  sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200;
  sc.updateProjectionMatrix();
}

function updateWorldState(W_, f) {
  // Subtle Cambodian flag breeze + recess bell swing
  if (flagMesh) flagMesh.rotation.y = Math.sin(f * 0.14) * 0.12;
  if (schoolBellMesh) schoolBellMesh.rotation.z = W_.ringBell ? Math.sin(f * 0.65) * 0.34 : Math.sin(f * 0.06) * 0.03;

  // Dynamic 3D Banana Peel position & slip physics!
  bananaPeelG.visible = W_.bananaVis !== false;
  if (W_.bananaPos) bananaPeelG.position.set(W_.bananaPos[0], W_.bananaPos[1], W_.bananaPos[2]);
  else bananaPeelG.position.set(-1.55, DECK + 0.025, 0.40);
  bananaPeelG.rotation.set(W_.bananaRot ? W_.bananaRot[0] : 0, W_.bananaRot ? W_.bananaRot[1] : 0.3, W_.bananaRot ? W_.bananaRot[2] : 0);

  if (W_.aura) {
    auraHaloMesh.visible = true;
    auraHaloMesh.material.map = W_.auraGold ? auraGoldTex : auraPinkTex;
    auraHaloMesh.position.set(W_.auraPos[0], W_.auraPos[1], W_.auraPos[2]);
    auraHaloMesh.scale.setScalar((W_.auraScale || 1.0) * (1.0 + 0.08 * Math.sin(f * 0.28)));
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
    if (a.blob !== false && a.y < gnd + 0.85) {
      c.blob.visible = true;
      c.blob.position.set(a.x, gnd + 0.024, a.z);
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
