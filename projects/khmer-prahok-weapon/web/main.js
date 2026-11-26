import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

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

// ---------- Painted 2-step Toon Materials ----------
const grad = (() => {
  const d = new Uint8Array([92, 92, 92, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });

const M = {
  sandstone: texM(P.sandstone(4), 1, 1),
  sandstoneMoss: texM(P.mossy(P.sandstone(4), 5, 0.9), 1, 1),
  laterite: texM(P.laterite(11), 1, 1),
  grass: texM(P.grass(6), 44, 44),
  dirt: texM(P.lateriteDirt(7), 24, 2),
  plank: texM(P.planks(1), 2, 2),
  beam: texM(P.beam(2), 1, 2),
  bamboo: texM(P.wovenBamboo(15), 2, 2),
  roof: texM(P.clayTileRoof(9), 3, 2),
  jarGlaze: texM(P.glazedJarTex(21), 1, 1),
  gold: toon({ color: '#f2c144' }),
  trunk: toon({ color: '#6b472d' }),
  palmTrunk: toon({ color: '#78583e' }),
  canopyA: toon({ color: '#397a38' }),
  canopyB: toon({ color: '#4d9240' }),
  canopyDark: toon({ color: '#285e2c' }),
  palmLeaf: toon({ color: '#569c3e', side: THREE.DoubleSide }),
  bananaLeaf: toon({ color: '#68ad42', side: THREE.DoubleSide }),
  hill: toon({ color: '#689c48' }),
  hillFar: toon({ color: '#7cad64' }),
  mount: toon({ color: '#8ba4b5' }),
  oxWhite: toon({ color: '#f5efe4' }),
  oxHorn: toon({ color: '#d6c39c' }),
  oxHoof: toon({ color: '#3d332c' }),
  silverFish: toon({ color: '#cfdbe6' }),
  whiteRice: toon({ color: '#fffdf7' }),
  saltWhite: toon({ color: '#f7f9fc' }),
  clayPot: toon({ color: '#8c4927' }),
  ember: new THREE.MeshBasicMaterial({ color: '#ff7b24' }),
  flame: new THREE.MeshBasicMaterial({ color: '#ffd23f' }),
  prahokPaste: toon({ color: '#c49648' }),
};
M.bannerRed = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.silkBanner('#c92c34', '#f2c144')), side: THREE.DoubleSide });
M.bannerGold = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.silkBanner('#e09024', '#fff3c4')), side: THREE.DoubleSide });

// ---------- Ink / Normal-Depth Contract (Anti-Glitch Locked) ----------
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
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
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
sky.userData.sky = true; scene.add(sky);

const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 55, 650);

// ---------- Ground, River & Red-Earth Angkor Trail ----------
const DECK = 0.0;
const world = new THREE.Group(); scene.add(world);

// Main green countryside & forest floor (from x = -28 to +420)
const groundMain = add(new THREE.PlaneGeometry(460, 460), M.grass, 196, DECK, 0, world, { cast: false });
groundMain.rotation.x = -Math.PI / 2;
// Far west bank beyond river
const groundWest = add(new THREE.PlaneGeometry(240, 460), M.grass, -168, DECK, 0, world, { cast: false });
groundWest.rotation.x = -Math.PI / 2;
// Sloped sandy riverbank at x = -29.5
const bankSlope = add(tbox(4.4, 0.5, 160, 4), M.dirt, -29.5, -0.22, 0, world, { cast: false });
bankSlope.rotation.z = 0.16;

// Tonle Sap / Siem Reap River Channel (x = -48 .. -30)
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#1f6e8c') }, shal: { value: new THREE.Color('#57b4c9') }, glint: { value: new THREE.Color('#effbff') } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ vec2 p = vW.xz*vec2(.32,.14) + vec2(0., -t*.22);
      float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
      float edge = smoothstep(5., 9., abs(vW.x + 39.0));
      vec3 c = mix(deep, shal, .35 + .4*n + .35*edge);
      float streak = smoothstep(.73, .79, noise(vW.xz*vec2(.75,.11) + vec2(0., -t*.55)));
      c = mix(c, glint, streak*.72);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(22, 460), waterMat);
water.rotation.x = -Math.PI / 2; water.position.set(-39, -0.28, 0);
water.userData.nd = waterNd; water.receiveShadow = false; scene.add(water);

// Red-ochre Ox-Cart Trail from Village Courtyard (-22) through Forest (0..52) to Destination (76)
const trail = add(new THREE.PlaneGeometry(106, 4.4), M.dirt, 27, DECK + 0.015, 0, world, { cast: false });
trail.rotation.x = -Math.PI / 2;
// Courtyard packed earth pad
const yardPad = add(new THREE.PlaneGeometry(16, 12), M.dirt, -13, DECK + 0.012, -1.5, world, { cast: false });
yardPad.rotation.x = -Math.PI / 2;

// ---------- Zone A1: Majestic Angkor Wat Temple Complex (x = -14, z = -45) ----------
const buildLotusTower = (parent, x, y, z, rBase, hTotal) => {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers;
    const r = rBase * (1 - 0.62 * Math.pow(k, 1.25));
    const th = (hTotal * 0.78) / tiers;
    add(tbox(r * 2, th, r * 2, 2), i % 2 ? M.sandstone : M.sandstoneMoss, 0, i * th + th / 2, 0, g);
    // Corner lotus antefixes
    const cr = r * 0.88;
    add(tbox(cr * 2.15, th * 0.42, cr * 1.35, 2), M.sandstone, 0, i * th + th * 0.25, 0, g);
    add(tbox(cr * 1.35, th * 0.42, cr * 2.15, 2), M.sandstone, 0, i * th + th * 0.25, 0, g);
  }
  const crownY = hTotal * 0.78;
  add(new THREE.ConeGeometry(rBase * 0.42, hTotal * 0.22, 8), M.sandstone, 0, crownY + hTotal * 0.11, 0, g);
  add(new THREE.SphereGeometry(rBase * 0.14, 10, 8), M.gold, 0, hTotal + rBase * 0.1, 0, g);
  add(new THREE.ConeGeometry(rBase * 0.08, rBase * 0.45, 6), M.gold, 0, hTotal + rBase * 0.35, 0, g);
  return g;
};

const angkor = new THREE.Group(); angkor.position.set(-14, DECK, -45); world.add(angkor);
add(tbox(36, 1.5, 22, 3), M.laterite, 0, 0.75, 0, angkor);
add(tbox(26, 3.0, 16, 2.5), M.sandstoneMoss, 0, 3.0, 0, angkor);
add(tbox(16, 3.6, 11, 2.2), M.sandstone, 0, 6.3, 0, angkor);
// Colonnade pillars along front gallery
for (let i = -5; i <= 5; i++) {
  if (Math.abs(i) === 0) continue;
  add(tbox(0.55, 2.4, 0.55, 1.5), M.sandstone, i * 2.1, 2.7, 8.1, angkor);
}
// Central lotus sanctuary + 4 corner towers (Iconic 5-tower Angkor silhouette!)
buildLotusTower(angkor, 0, 8.1, 0, 2.7, 13.5);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  buildLotusTower(angkor, sx * 6.5, 4.5, sz * 4.2, 1.85, 9.2);
}
// Front entrance Gopura & Naga balustrade causeway
add(tbox(4.6, 4.2, 3.2, 2), M.sandstone, 0, 2.1, 10.5, angkor);
buildLotusTower(angkor, 0, 4.2, 10.5, 1.4, 5.2);
add(tbox(4.2, 0.45, 12, 2), M.laterite, 0, 0.22, 18, angkor);

// ---------- Zone A2: Traditional Khmer Wooden Stilt House (ផ្ទះខ្មែរបុរាណ) ----------
const buildStiltHouse = (x, z, rotY = 0, w = 6.4, d = 4.6, stiltH = 2.2) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); g.rotation.y = rotY; world.add(g);
  for (const px of [-w * 0.42, 0, w * 0.42]) for (const pz of [-d * 0.4, d * 0.4]) {
    add(new THREE.CylinderGeometry(0.16, 0.19, stiltH, 8), M.beam, px, stiltH / 2, pz, g);
  }
  add(tbox(w + 0.4, 0.24, d + 0.4, 2), M.plank, 0, stiltH + 0.12, 0, g);
  const wallH = 2.5;
  add(tbox(w, wallH, d, 2), M.bamboo, 0, stiltH + 0.24 + wallH / 2, 0, g);
  // Door & shuttered windows
  add(box(1.0, 1.8, 0.12), M.beam, 0, stiltH + 1.15, d / 2 + 0.04, g, { cast: false });
  for (const s of [-1, 1]) add(box(0.85, 0.85, 0.12), M.plank, s * w * 0.3, stiltH + 1.55, d / 2 + 0.04, g, { cast: false });
  // Pitched Khmer clay-tile gable roof + golden horn finials (ជហ្វា)
  const roofY = stiltH + 0.24 + wallH;
  const roofH = 2.0, span = d / 2 + 0.75, slopeLen = Math.hypot(span, roofH);
  for (const s of [-1, 1]) {
    const rf = add(tbox(w + 1.2, 0.22, slopeLen, 2), M.roof, 0, roofY + roofH / 2, s * span / 2, g);
    rf.rotation.x = s * Math.atan2(roofH, span);
  }
  // Gable triangle infill + golden trim
  const gShape = new THREE.Shape();
  gShape.moveTo(-d / 2 - 0.5, 0); gShape.lineTo(d / 2 + 0.5, 0); gShape.lineTo(0, roofH); gShape.closePath();
  const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: w + 0.8, bevelEnabled: false });
  gGeo.rotateY(Math.PI / 2); gGeo.translate(-(w + 0.8) / 2, roofY, 0);
  add(gGeo, M.plank, 0, 0, 0, g);
  for (const s of [-1, 1]) {
    const fin = add(new THREE.ConeGeometry(0.14, 0.85, 5), M.gold, s * (w / 2 + 0.55), roofY + roofH + 0.35, 0, g);
    fin.rotation.z = -s * 0.22;
  }
  // Wooden front ladder
  const lad = add(tbox(1.05, 0.16, stiltH * 1.35, 1.5), M.beam, 0, stiltH * 0.5, d / 2 + 0.85, g);
  lad.rotation.x = 0.78;
  return g;
};

buildStiltHouse(-16.2, -7.8, 0.08);
buildStiltHouse(-24.5, -13.5, 0.35, 5.4, 4.0, 2.0);
buildStiltHouse(-6.5, -11.5, -0.18, 5.6, 4.2, 2.1);

// ---------- Zone A3: Riverside Pier, Fish Baskets & Mother's Prahok Workshop ----------
// Wooden fishing pier at river's edge
add(tbox(5.8, 0.24, 2.4, 2), M.plank, -30.5, 0.25, 1.6, world);
for (const px of [-32.8, -30.5, -28.4]) for (const pz of [0.6, 2.6]) {
  add(new THREE.CylinderGeometry(0.13, 0.15, 1.4, 7), M.beam, px, -0.25, pz, world);
}
// Woven fish baskets (កញ្ជ្រែងត្រីស្រស់ៗ) at riverside
const buildFishBasket = (x, y, z, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); world.add(g);
  add(new THREE.CylinderGeometry(0.62, 0.44, 0.52, 14), M.bamboo, 0, 0.26, 0, g);
  const r = P.rng(88);
  for (let i = 0; i < 9; i++) {
    const f = add(new THREE.SphereGeometry(0.22, 10, 6), M.silverFish, (r() - 0.5) * 0.62, 0.52 + (r() * 0.14), (r() - 0.5) * 0.62, g);
    f.scale.set(1.5, 0.45, 0.65); f.rotation.set((r() - 0.5) * 0.4, r() * 3.14, (r() - 0.5) * 0.5);
  }
  return g;
};
buildFishBasket(-26.4, DECK, 1.5, 1.15);
buildFishBasket(-25.2, DECK, 2.35, 0.95);

// Mother's Courtyard Prahok Station (x = -13 .. -8, z = -1.6 .. +1.8)
const workshopG = new THREE.Group(); world.add(workshopG);
// 1. Heavy carved wooden mortar (ត្បាល់បុកប្រហុក) at (-12.0, 0, 1.0)
const mortarG = new THREE.Group(); mortarG.position.set(-12.0, DECK, 1.0); workshopG.add(mortarG);
add(new THREE.CylinderGeometry(0.44, 0.32, 0.44, 14), M.beam, 0, 0.66, 0, mortarG);
add(new THREE.CylinderGeometry(0.28, 0.42, 0.44, 14), M.beam, 0, 0.22, 0, mortarG);
add(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12), M.silverFish, 0, 0.87, 0, mortarG);
// Sea-salt bowl beside mortar
const saltG = new THREE.Group(); saltG.position.set(-11.2, DECK, 1.35); workshopG.add(saltG);
add(new THREE.CylinderGeometry(0.30, 0.20, 0.24, 12), M.clayPot, 0, 0.12, 0, saltG);
add(new THREE.SphereGeometry(0.25, 10, 8), M.saltWhite, 0, 0.24, 0, saltG).scale.set(1, 0.55, 1);

// 2. Bamboo Sun-Drying Fish Rack (រានហាលត្រី) at (-9.9, 0, 0.95)
const dryRackG = new THREE.Group(); dryRackG.position.set(-9.9, DECK, 0.95); workshopG.add(dryRackG);
add(tbox(1.9, 0.10, 1.1, 1.5), M.bamboo, 0, 0.86, 0, dryRackG);
for (const lx of [-0.82, 0.82]) for (const lz of [-0.45, 0.45]) {
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.86, 6), M.beam, lx, 0.43, lz, dryRackG);
}
for (let row = -1; row <= 1; row++) for (let col = -2; col <= 2; col++) {
  const sf = add(new THREE.SphereGeometry(0.15, 8, 6), M.silverFish, col * 0.34, 0.94, row * 0.28, dryRackG);
  sf.scale.set(1.35, 0.32, 0.58); sf.rotation.y = 0.3;
}

// 3. Row of Glazed Earthenware Prahok Jars fermenting on bench at (-11.2, 0, -1.8)
const buildGlazedJarMesh = (scale = 1, withBananaCap = true) => {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  const prof = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.24, 0.00),
    new THREE.Vector2(0.38, 0.24),
    new THREE.Vector2(0.42, 0.48),
    new THREE.Vector2(0.32, 0.68),
    new THREE.Vector2(0.24, 0.76),
    new THREE.Vector2(0.29, 0.84),
    new THREE.Vector2(0.25, 0.86),
  ];
  const lathe = new THREE.LatheGeometry(prof, 20);
  add(lathe, M.jarGlaze, 0, 0, 0, g);
  // Golden decorative shoulder ring
  const ring = add(new THREE.TorusGeometry(0.37, 0.025, 8, 24), M.gold, 0, 0.58, 0, g);
  ring.rotation.x = Math.PI / 2;
  // Savory golden-amber Prahok fill inside rim
  add(new THREE.CylinderGeometry(0.23, 0.23, 0.05, 16), M.prahokPaste, 0, 0.80, 0, g);
  if (withBananaCap) {
    add(new THREE.CylinderGeometry(0.29, 0.31, 0.10, 16), M.bananaLeaf, 0, 0.87, 0, g);
    const tie = add(new THREE.TorusGeometry(0.29, 0.022, 6, 20), M.gold, 0, 0.85, 0, g);
    tie.rotation.x = Math.PI / 2;
  }
  return g;
};

const jarBench = new THREE.Group(); jarBench.position.set(-11.0, DECK, -1.85); world.add(jarBench);
add(tbox(3.4, 0.36, 0.95, 2), M.plank, 0, 0.18, 0, jarBench);
for (let i = 0; i < 4; i++) {
  const jm = buildGlazedJarMesh(0.78, true);
  jm.position.set(-1.15 + i * 0.76, 0.36, 0);
  jarBench.add(jm);
}

// 4. Hero Courtyard Pedestal Table (compact 0.95m width so Mother & Son flank it cleanly in 9:16!)
const heroTable = new THREE.Group(); heroTable.position.set(-11.0, DECK, 1.4); world.add(heroTable);
add(tbox(0.96, 0.11, 0.88, 1.5), M.plank, 0, 0.78, 0, heroTable);
for (const lx of [-0.38, 0.38]) for (const lz of [-0.34, 0.34]) {
  add(tbox(0.10, 0.78, 0.10, 1), M.beam, lx, 0.39, lz, heroTable);
}

// ---------- Zone B: Tropical Trees, Sugar Palms, Ox-Cart & Forest Campfire ----------
const sugarPalm = (x, z, h = 9.5) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const y0 = (i / segs) * h, sh = h / segs + 0.1;
    const r0 = 0.24 * (1 - i * 0.09), r1 = 0.22 * (1 - (i + 1) * 0.09);
    const cyl = add(new THREE.CylinderGeometry(r1, r0, sh, 8), M.palmTrunk, Math.sin(i * 0.35) * 0.22, y0 + sh / 2, 0, g);
    cyl.rotation.z = -0.04 * Math.cos(i * 0.4);
  }
  const topX = Math.sin((segs - 1) * 0.35) * 0.22;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const frond = add(new THREE.ConeGeometry(0.55, 2.7, 4), M.palmLeaf, topX + Math.cos(a) * 1.15, h - 0.1, Math.sin(a) * 1.15, g);
    frond.scale.set(1, 1, 0.18);
    frond.rotation.order = 'YXZ';
    frond.rotation.y = -a + Math.PI / 2;
    frond.rotation.x = 1.18 + (k % 2) * 0.22;
  }
  return g;
};

const jungleTree = (x, z, h = 8.0, seed = 1) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
  add(new THREE.CylinderGeometry(0.28, 0.46, h * 0.58, 8), M.trunk, 0, h * 0.29, 0, g);
  const cMat = seed % 3 === 0 ? M.canopyDark : (seed % 2 === 0 ? M.canopyB : M.canopyA);
  const mainC = add(new THREE.SphereGeometry(2.3, 12, 10), cMat, 0, h * 0.68, 0, g);
  mainC.scale.set(1.15, 0.82, 1.1);
  add(new THREE.SphereGeometry(1.65, 10, 8), M.canopyB, -1.2, h * 0.58, 0.6, g).scale.set(1.1, 0.78, 1.0);
  add(new THREE.SphereGeometry(1.55, 10, 8), M.canopyA, 1.25, h * 0.60, -0.5, g).scale.set(1.05, 0.78, 1.0);
  return g;
};

// Sugar palms framing Angkor Wat & Village (strictly behind z <= -4.5 so front cameras are 100% unobstructed!)
[[-23, -19, 10.5], [-19, -27, 11.2], [-8, -25, 10.8], [-3, -18, 9.6], [-26, -6, 9.2], [2, -14, 10.0], [54, -12, 10.2], [68, -14, 10.6]].forEach(([x, z, h]) => sugarPalm(x, z, h));

// Dense Ancient Forest Canopy Wall along z <= -3.8 and far foreground z >= 13.5 (ZERO camera ray occlusion!)
{
  const rt = P.rng(73);
  for (let i = 0; i < 48; i++) {
    const x = 2 + rt() * 52;
    const z = -4.2 - rt() * 20;
    jungleTree(x, z, 6.8 + rt() * 4.5, i);
  }
  for (let i = 0; i < 22; i++) {
    const x = 4 + rt() * 48;
    const z = 13.5 + rt() * 14;
    jungleTree(x, z, 7.0 + rt() * 4.0, i + 5);
  }
  // Low ferns/bushes lining the north edge of the trail (z = -2.8 .. -3.5)
  for (let i = 0; i < 34; i++) {
    const x = 3 + rt() * 50, z = -2.85 - rt() * 1.2;
    const b = add(new THREE.SphereGeometry(0.75 + rt() * 0.55, 9, 7), i % 2 ? M.canopyB : M.canopyA, x, 0.35, z, world);
    b.scale.set(1.2, 0.68, 1.0);
  }
}
// Two hero ambush tree trunks at x = 30.8 & 34.6 (z = -2.3) for bandits to lurk behind
jungleTree(30.6, -2.6, 8.8, 2);
jungleTree(34.8, -2.6, 9.2, 3);

// Continuous ring of rolling green Angkor hills & Phnom Kulen mountains (eliminates flat horizon gaps!)
{
  const rm = P.rng(109);
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2 + (rm() - 0.5) * 0.08, d = 115 + rm() * 45;
    const h = add(new THREE.SphereGeometry(36 + rm() * 26, 18, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -9, Math.sin(a) * d, world, { cast: false });
    h.scale.y = 0.42 + rm() * 0.22;
  }
  for (let i = 0; i < 14; i++) {
    const a = rm() * Math.PI * 2, d = 480 + rm() * 180, hh = 95 + rm() * 90, rr = 110 + rm() * 65;
    add(new THREE.ConeGeometry(rr, hh, 7), M.mount, Math.cos(a) * d, hh / 2 - 8, Math.sin(a) * d, world, { cast: false });
  }
}

// Painted billboard clouds
const clouds = [];
{
  const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    const pen = new T.Pen(c.getContext('2d', { willReadFrequently: true })); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250;
    m.position.set(Math.cos(a) * d, 115 + r() * 145, Math.sin(a) * d);
    m.scale.setScalar(155 + r() * 135);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  }
}

// ---------- Animated 3D Traditional Khmer Ox-Cart & Twin White Oxen (រទេះគោខ្មែរ) ----------
const oxCartG = new THREE.Group(); scene.add(oxCartG);
const cartWheels = [], oxLegs = [];
{
  // Cart wooden frame & bed (centered around x = -1.1, y = 0.92)
  add(tbox(2.7, 0.16, 1.45, 1.5), M.plank, -1.1, 0.92, 0, oxCartG);
  for (const sz of [-0.68, 0.68]) add(tbox(2.7, 0.38, 0.10, 1.5), M.beam, -1.1, 1.18, sz, oxCartG);
  // Arched woven bamboo hood (ដំបូលរទេះគោ)
  const hoodGeo = new THREE.CylinderGeometry(0.82, 0.82, 2.25, 16, 1, false, 0, Math.PI);
  hoodGeo.rotateZ(Math.PI / 2);
  const hood = add(hoodGeo, M.bamboo, -1.25, 1.32, 0, oxCartG);
  hood.scale.set(1, 1.15, 0.96);
  // Twin curved wooden drawbars sweeping forward to the yoke + upturned Khmer prow (ក្បាលរទេះគោ)!
  for (const sz of [-0.36, 0.36]) add(tbox(3.4, 0.10, 0.10, 1.5), M.beam, 1.1, 0.96, sz, oxCartG);
  const prow = add(new THREE.ConeGeometry(0.14, 1.15, 6), M.gold, 2.95, 1.55, 0, oxCartG);
  prow.rotation.z = -0.38;
  // Cross yoke (នឹមគោ)
  add(tbox(0.14, 0.14, 1.85, 1), M.beam, 2.45, 1.28, 0, oxCartG);

  // Spoked wooden wheels (R = 0.88 m)
  const buildWheel = (zPos) => {
    const wg = new THREE.Group(); wg.position.set(-1.15, 0.88, zPos); oxCartG.add(wg);
    const rim = add(new THREE.TorusGeometry(0.84, 0.065, 8, 24), M.beam, 0, 0, 0, wg);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), M.beam, 0, 0, 0, wg).rotation.x = Math.PI / 2;
    for (let s = 0; s < 6; s++) {
      const sp = add(box(1.64, 0.06, 0.06), M.plank, 0, 0, 0, wg);
      sp.rotation.z = (s / 6) * Math.PI;
    }
    cartWheels.push(wg);
  };
  buildWheel(-0.88);
  buildWheel(0.88);

  // Sculpted 3D White Khmer Zebu Oxen (គោខ្មែរ)
  const buildOx = (zOff, seedOff) => {
    const og = new THREE.Group(); og.position.set(2.35, 0, zOff); oxCartG.add(og);
    // Body + Zebu shoulder hump
    const body = add(new THREE.SphereGeometry(0.54, 14, 10), M.oxWhite, 0, 1.02, 0, og);
    body.scale.set(1.55, 0.88, 0.82);
    add(new THREE.SphereGeometry(0.28, 10, 8), M.oxWhite, 0.42, 1.44, 0, og).scale.set(1.1, 0.95, 0.8);
    // Head + muzzle + curved horns
    const head = add(new THREE.SphereGeometry(0.30, 12, 10), M.oxWhite, 0.96, 1.22, 0, og);
    head.scale.set(1.25, 0.95, 0.85);
    add(new THREE.SphereGeometry(0.18, 10, 8), M.oxHorn, 1.26, 1.12, 0, og).scale.set(1.0, 0.78, 0.85);
    for (const hs of [-1, 1]) {
      const horn = add(new THREE.ConeGeometry(0.055, 0.42, 7), M.oxHorn, 0.95, 1.52, hs * 0.24, og);
      horn.rotation.x = -hs * 0.42; horn.rotation.z = -0.25;
      add(new THREE.SphereGeometry(0.038, 6, 6), M.oxHoof, 1.08, 1.28, hs * 0.21, og);
    }
    // 4 articulated walking legs
    for (const [lx, lz, ph] of [[0.48, -0.24, 0], [0.48, 0.24, Math.PI], [-0.48, -0.24, Math.PI], [-0.48, 0.24, 0]]) {
      const lg = new THREE.Group(); lg.position.set(lx, 0.88, lz); og.add(lg);
      add(new THREE.CylinderGeometry(0.085, 0.068, 0.86, 8), M.oxWhite, 0, -0.42, 0, lg);
      add(new THREE.CylinderGeometry(0.075, 0.085, 0.10, 8), M.oxHoof, 0, -0.84, 0, lg);
      oxLegs.push({ mesh: lg, ph: ph + seedOff });
    }
  };
  buildOx(-0.56, 0);
  buildOx(0.56, 1.4);
}

// ---------- Zone B2: Forest Campfire, Steaming Clay Rice Pot & Stump (x = 24, z = 0.9) ----------
const campG = new THREE.Group(); campG.position.set(24.0, DECK, 0.9); scene.add(campG);
{
  // Ring of stones + glowing campfire logs & flame
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.16, 8, 6), M.laterite, -0.85 + Math.cos(a) * 0.48, 0.08, Math.sin(a) * 0.48, campG).scale.y = 0.65;
  }
  for (let i = 0; i < 3; i++) {
    const lg = add(new THREE.CylinderGeometry(0.06, 0.07, 0.72, 6), M.beam, -0.85, 0.14, 0, campG);
    lg.rotation.z = Math.PI / 2; lg.rotation.y = (i / 3) * Math.PI;
  }
  add(new THREE.ConeGeometry(0.24, 0.48, 7), M.ember, -0.85, 0.28, 0, campG, { cast: false });
  add(new THREE.ConeGeometry(0.15, 0.36, 7), M.flame, -0.85, 0.34, 0, campG, { cast: false });
  // Steaming Clay Rice Pot (ឆ្នាំងបាយក្តៅៗ) beside fire!
  add(new THREE.SphereGeometry(0.32, 14, 10), M.clayPot, -0.85, 0.56, 0, campG).scale.set(1, 0.82, 1);
  add(new THREE.CylinderGeometry(0.24, 0.20, 0.10, 12), M.clayPot, -0.85, 0.82, 0, campG);
  add(new THREE.SphereGeometry(0.22, 10, 8), M.whiteRice, -0.85, 0.88, 0, campG).scale.set(1, 0.48, 1);
  // Woven dining mat + low wooden stump table at (0, 0, 0.25) for Hero Prahok Jar
  const mat = add(tbox(2.2, 0.03, 1.5, 1.5), M.bamboo, 0.55, 0.02, -0.1, campG, { cast: false });
  add(new THREE.CylinderGeometry(0.36, 0.40, 0.48, 12), M.trunk, 0.0, 0.24, 0.25, campG);
}

// ---------- Hero 3D Prahok Jar + Animated Lid + Expanding Aroma Shockwave Rings ----------
const heroJarG = new THREE.Group(); scene.add(heroJarG);
const heroJarBody = buildGlazedJarMesh(1.0, false);
heroJarG.add(heroJarBody);
const heroJarLid = new THREE.Group(); heroJarLid.position.set(0, 0.86, 0); heroJarG.add(heroJarLid);
add(new THREE.CylinderGeometry(0.29, 0.31, 0.09, 16), M.bananaLeaf, 0, 0, 0, heroJarLid);
add(new THREE.SphereGeometry(0.10, 10, 8), M.clayPot, 0, 0.07, 0, heroJarLid);

// Soft radial golden halo behind Hero Jar (ndSkip, soft gradient with zero hard circle edge!)
const haloTex = P.tex(P.radial('255,222,88', 0.65));
const jarHalo = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 2.6),
  new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.55, depthWrite: false })
);
jarHalo.userData.ndSkip = true; scene.add(jarHalo);

// 3 Expanding 3D Golden-Emerald Aroma Rings (រលកក្លិនប្រហុកសាយភាយពេញព្រៃ!)
const aromaRings = [];
for (let i = 0; i < 3; i++) {
  const rm = new THREE.Mesh(
    new THREE.RingGeometry(0.82, 1.0, 36),
    new THREE.MeshBasicMaterial({ color: i % 2 ? '#b8e858' : '#ffd84d', side: THREE.DoubleSide, transparent: true, opacity: 0.65, depthWrite: false })
  );
  rm.rotation.x = -Math.PI / 2; rm.userData.ndSkip = true; rm.visible = false;
  scene.add(rm); aromaRings.push(rm);
}

// ---------- Zone C: Distant Angkor Sandstone Gate, Academy Pavilion & Market (x = 58..72) ----------
const destG = new THREE.Group(); world.add(destG);
{
  // Grand Sandstone Gopura Archway over the road at x = 58, z = 0
  for (const sz of [-2.85, 2.85]) {
    add(tbox(1.8, 4.4, 1.8, 2), M.sandstone, 58.0, 2.2, sz, destG);
    add(tbox(2.1, 0.45, 2.1, 2), M.laterite, 58.0, 4.5, sz, destG);
  }
  add(tbox(2.0, 1.1, 7.8, 2), M.sandstone, 58.0, 5.25, 0, destG);
  buildLotusTower(destG, 58.0, 5.8, 0, 1.65, 5.8);

  // Ancient Sala Rien / Study Pavilion at (65.5, 0, -5.2)
  buildStiltHouse(65.5, -5.8, 0.12, 7.2, 4.8, 1.4);
  // Colorful Market Stall at (64.5, 0, 4.6)
  const stall = new THREE.Group(); stall.position.set(64.5, DECK, 4.8); destG.add(stall);
  add(tbox(3.4, 0.9, 1.4, 1.5), M.bamboo, 0, 0.45, 0, stall);
  for (const sx of [-1.5, 1.5]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.5, 6), M.beam, sx, 1.25, 0, stall);
  add(tbox(3.8, 0.16, 2.0, 1.5), M.roof, 0, 2.55, 0, stall).rotation.x = -0.15;

  // Festive Silk Banners flanking the Gopura Gate
  for (const [bx, bz, mat] of [[56.2, -3.6, M.bannerRed], [56.2, 3.6, M.bannerGold], [62.5, -3.4, M.bannerGold]]) {
    add(new THREE.CylinderGeometry(0.06, 0.06, 5.4, 7), M.beam, bx, 2.7, bz, destG);
    add(new THREE.PlaneGeometry(1.1, 2.4), mat, bx, 3.8, bz + 0.6, destG).rotation.y = Math.PI / 2;
  }
}

// ---------- 2D Bean-Head Billboard Cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM);
cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.58));

class Card {
  constructor() {
    [this.c, this.g] = (() => {
      const c = document.createElement('canvas'); c.width = CW; c.height = CH;
      return [c, c.getContext('2d', { willReadFrequently: true })];
    })();
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
  px: { value: 2.5 }, fogCol: { value: new THREE.Color() }, sat: { value: 1.12 },
  lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.18 }, flash: { value: 0 },
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
      float flatGnd = step(.92, n.y) * step(.92, ns.y);
      float dj = mix(.02, .22, flatGnd);
      e = max(e, smoothstep(dj*.3, dj, (ds - d)/d));
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
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }`,
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
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
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

function updateWorldState(S, f) {
  waterU.t.value = f / 30;
  workshopG.visible = !!S.showWorkshop;
  heroTable.visible = !!S.showTable;
  campG.visible = !!S.showCamp;

  // Ox-cart state
  if (S.cart && S.cart.show) {
    oxCartG.visible = true;
    oxCartG.position.set(S.cart.x, DECK, S.cart.z || 0);
    oxCartG.rotation.y = S.cart.ry || 0;
    const wRot = -(S.cart.wheelRot || 0);
    for (const w of cartWheels) w.rotation.z = wRot;
    const wp = S.cart.walkPhase || 0;
    for (const lg of oxLegs) lg.mesh.rotation.z = Math.sin(wp + lg.ph) * (S.cart.moving ? 0.36 : 0.03);
  } else {
    oxCartG.visible = false;
  }

  // Hero 3D Prahok Jar state
  if (S.jar) {
    heroJarG.visible = true;
    heroJarG.position.set(S.jar.x, S.jar.y, S.jar.z);
    heroJarG.rotation.set(0, S.jar.ry || 0, 0);
    const sc = S.jar.s || 1;
    heroJarG.scale.setScalar(sc);
    const lo = S.jar.lidOpen || 0;
    if (lo >= 0.99) {
      // Rest lid neatly propped at the base side of the jar once opened
      heroJarLid.position.set(-0.42, 0.24, 0.14);
      heroJarLid.rotation.z = 1.18;
    } else {
      heroJarLid.position.set(lo * 0.36, 0.86 + Math.sin(Math.min(1, lo) * Math.PI) * 0.32, 0);
      heroJarLid.rotation.z = -lo * 0.95;
    }

    if (S.jar.glow > 0) {
      jarHalo.visible = true;
      jarHalo.position.set(S.jar.x, S.jar.y + 0.48 * sc, S.jar.z - 0.15);
      jarHalo.scale.setScalar(sc * (0.9 + 0.12 * Math.sin(f * 0.22)));
      jarHalo.material.opacity = 0.38 * S.jar.glow;
      jarHalo.quaternion.copy(camera.quaternion);
    } else {
      jarHalo.visible = false;
    }

    if (S.jar.rings > 0) {
      aromaRings.forEach((rm, idx) => {
        rm.visible = true;
        const ph = ((f * 0.032) + idx / 3) % 1;
        const radScale = (0.6 + ph * 11.5) * S.jar.rings;
        rm.position.set(S.jar.x, S.jar.y + 0.75 * sc + ph * 0.9, S.jar.z);
        rm.scale.setScalar(radScale);
        rm.material.opacity = (1 - ph) * 0.65 * S.jar.rings;
      });
    } else {
      aromaRings.forEach((rm) => { rm.visible = false; });
    }
  } else {
    heroJarG.visible = false;
    jarHalo.visible = false;
    aromaRings.forEach((rm) => { rm.visible = false; });
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
      c.blob.scale.set(0.95 * s, 0.6 * s, 1);
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
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.vig.value = L.vig ?? 0.18;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);

  // Pass D: Razor-Sharp Output (cinf === 0 enforced)
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};

window.TOTAL = TOTAL;
window.ready = true;
