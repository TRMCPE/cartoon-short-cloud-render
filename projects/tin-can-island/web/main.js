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

// ---------- toon materials ----------
const grad = (() => {
  const d = new Uint8Array([96, 96, 96, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff', clamp = false) => toon({ map: P.tex(c, rx_, ry_, clamp), color });

const M = {
  basalt: texM(P.basalt(1), 2, 2),
  basaltDark: texM(P.basalt(9), 2, 2, '#9997a3'),
  jungle: texM(P.jungleGrass(2), 4, 4),
  deck: texM(P.deckPlanks(3), 2, 4),
  hull: texM(P.shipHull(4), 1, 1, '#ffffff', true),
  hullDark: toon({ color: '#252b36' }),
  hullRed: toon({ color: '#a8312a' }),
  funnel: texM(P.funnelTex(), 1, 1, '#ffffff', true),
  whiteCabin: toon({ color: '#f5efe0' }),
  postWall: texM(P.postWall(5), 1, 1),
  roof: texM(P.roofTin(), 2, 2),
  signNormal: texM(P.signTex('POST OFFICE', "NIUAFO'OU"), 1, 1, '#ffffff', true),
  signFamous: texM(P.signTex('TIN CAN ISLAND', 'FAMOUS POST OFFICE', '#a82222', '#ffd859', '#ffd859'), 1, 1, '#ffffff', true),
  tinBody: texM(P.biscuitTinTex(), 1, 1, '#ffffff', true),
  tinLid: toon({ color: '#e6c05c' }),
  worldMap: texM(P.worldMapTex(), 1, 1, '#ffffff', true),
  envClean: texM(P.envelopeTex(false), 1, 1, '#ffffff', true),
  envStamped: texM(P.envelopeTex(true), 1, 1, '#ffffff', true),
  wood: toon({ color: '#7d5030' }),
  woodDark: toon({ color: '#4d301d' }),
  trunk: toon({ color: '#7a583a' }),
  palm: toon({ color: '#3f8a36' }),
  palmLight: toon({ color: '#58a842' }),
  red: toon({ color: '#c8342d' }),
  navy: toon({ color: '#1f4273' }),
  brass: toon({ color: '#d9ad48' }),
  iron: toon({ color: '#3c424d' }),
  foam: toon({ color: '#eef9ff' }),
  rope: toon({ color: '#bfa16c' }),
  mailbag: toon({ color: '#d8c59e' }),
  deskTop: texM(P.deckPlanks(11), 3, 2, '#9c7858'),
  studioWall: toon({ color: '#2b4764' }),
  crimsonRubber: toon({ color: '#be1e2d' }),
  goldRoute: toon({ color: '#ffd644' }),
  crater: toon({ color: '#261e24' }),
};
const calMats = ['JAN', 'FEB', 'MAR', 'APR', 'MAY'].map((m) => texM(P.calendarTex(m), 1, 1, '#ffffff', true));

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
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- geometry helpers ----------
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
    const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t);
  }
  return g;
};

// ---------- sky ----------
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

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 60, 750);

// ---------- animated tropical Pacific ocean ----------
const waterU = { t: { value: 0 }, chop: { value: 1.0 }, deep: { value: new THREE.Color('#135887') }, shal: { value: new THREE.Color('#2fa3b8') }, glint: { value: new THREE.Color('#f4fdff') } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    uniform float t, chop; varying vec3 vW; varying float vH;
    void main(){
      vec4 w = modelMatrix*vec4(position,1.);
      float near = 1.0 - smoothstep(45.0, 140.0, length(w.xz));
      float h = (sin(w.x*0.36 + t*2.4)*0.22 + cos(w.z*0.28 - t*1.9)*0.18 + sin((w.x+w.z)*0.22 + t*3.1)*0.14) * chop * near;
      w.y += h; vW = w.xyz; vH = h;
      vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t, chop; uniform vec3 deep, shal, glint; varying vec3 vW; varying float vH;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){
      vec2 p = vW.xz*vec2(.16,.14) + vec2(-t*.38, t*.14);
      float n = noise(p)*.55 + noise(p*2.4 + 5.1)*.45;
      float dIsl = length(vW.xz - vec2(-24.0, 0.0));
      float shallow = 1.0 - smoothstep(23.0, 42.0, dIsl);
      vec3 c = mix(deep, shal, clamp(0.28 + 0.35*n + 0.55*shallow, 0.0, 1.0));
      // White surf rings pounding the volcanic island shore
      float shoreBand = (1.0 - smoothstep(22.5, 31.5, dIsl)) * smoothstep(18.0, 23.0, dIsl);
      float ring = smoothstep(0.45, 0.72, sin(dIsl*1.7 - t*4.2 + n*3.2)*0.5 + 0.5) * shoreBand;
      float crest = smoothstep(0.20, 0.36, vH) * 0.75 * chop;
      float streak = smoothstep(0.73, 0.80, noise(vW.xz*vec2(0.35, 0.14) + vec2(-t*0.7, 0.0))) * 0.55;
      c = mix(c, glint, clamp(ring*0.92 + crest + streak, 0.0, 1.0));
      gl_FragColor = vec4(c, 1.);
      #include <fog_fragment>
    }`,
});
// High-detail animated inner sea + seamless far horizon ocean
const innerSea = new THREE.Mesh(new THREE.PlaneGeometry(280, 280, 76, 76), waterMat);
innerSea.rotation.x = -Math.PI / 2; innerSea.position.set(10, 0, 0);
innerSea.userData.nd = waterNd; innerSea.receiveShadow = false; scene.add(innerSea);

const farSea = new THREE.Mesh(new THREE.RingGeometry(120, 1400, 48), new THREE.MeshBasicMaterial({ color: '#1a6c9e', fog: true }));
farSea.rotation.x = -Math.PI / 2; farSea.position.set(10, -0.03, 0);
farSea.userData.nd = waterNd; farSea.receiveShadow = false; scene.add(farSea);

// ---------- WORLD 1: NIUAFO'OU VOLCANIC ISLAND ----------
const island = new THREE.Group(); scene.add(island);

// Dark basalt cliff foundation plunging straight into rough surf (no harbor!)
const cliffBase = add(new THREE.CylinderGeometry(22.5, 28.5, 6.2, 22), M.basalt, -24, 1.5, 0, island);
cliffBase.scale.set(1.05, 1, 1.15);

// Jagged basalt coastal cliffs & surf rocks along seaward edge (x = -3 .. +6)
const rockRng = P.rng(17);
const surfRocks = [];
const rockSpecs = [
  [-2.5, 1.0, 0, 3.6, 2.2, 4.4],     // Hero landing basalt ledge at y = 2.1!
  [1.8, 0.4, -5.2, 2.8, 2.6, 2.5],
  [3.4, 0.6, -2.0, 2.2, 2.9, 2.2],
  [2.6, 0.5, 3.8, 3.1, 3.2, 2.6],
  [4.5, 0.3, 6.8, 2.5, 2.3, 2.4],
  [-0.5, 1.2, -9.5, 4.2, 4.4, 3.8],
  [-1.2, 1.4, 9.8, 4.5, 4.8, 4.0],
  [0.2, 0.8, 14.2, 3.2, 3.4, 3.1],
  [0.8, 0.7, -14.5, 3.4, 3.6, 3.2],
];
for (const [x, y, z, sx, sy, sz] of rockSpecs) {
  const rk = add(new THREE.DodecahedronGeometry(1, 0), M.basaltDark, x, y, z, island);
  rk.scale.set(sx, sy, sz); rk.rotation.set(rockRng() * 0.4, rockRng() * 6, rockRng() * 0.4);
  surfRocks.push(rk);
}
// Flat basalt hero standing shelf right at shoreline (x = -2.4, top y = 2.15)
add(tbox(5.4, 2.6, 5.2, 2), M.basalt, -3.2, 0.85, 0.2, island);

// Lush green jungle slope & dramatic Niuafo'ou volcanic cone
const midSlope = add(new THREE.CylinderGeometry(15.5, 22.8, 5.8, 20), M.jungle, -26.5, 7.2, 0, island);
midSlope.scale.set(1.0, 1, 1.12);
const volcanoCone = add(new THREE.CylinderGeometry(5.6, 16.2, 18.5, 18), M.basalt, -31.5, 17.5, -1.5, island);
volcanoCone.scale.set(1.02, 1, 1.08);
// Dark crater rim & caldera inside top
add(new THREE.TorusGeometry(5.5, 0.85, 8, 20), M.basaltDark, -31.5, 26.8, -1.5, island).rotation.x = Math.PI / 2;
add(new THREE.CylinderGeometry(5.1, 4.5, 0.6, 18), M.crater, -31.5, 26.4, -1.5, island);
// Green jungle patches clinging to lower volcanic flanks
for (let i = 0; i < 8; i++) {
  const a = i / 8 * Math.PI * 2;
  const g = add(new THREE.SphereGeometry(4.2, 10, 8), M.jungle, -29 + Math.cos(a) * 12.5, 10.2, -1 + Math.sin(a) * 13.5, island);
  g.scale.set(1.2, 0.65, 1.2);
}

// 3D Tropical Palm Trees
const palmTree = (x, y, z, h = 6.2, lean = 0.18, yaw = 0) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; island.add(g);
  const segs = 5;
  let cx = 0, cy = 0;
  for (let i = 0; i < segs; i++) {
    const sh = h / segs, ang = lean * (i + 0.5);
    const seg = add(new THREE.CylinderGeometry(0.18 - i * 0.018, 0.24 - i * 0.018, sh * 1.08, 7), M.trunk, cx + Math.sin(ang) * sh * 0.5, cy + Math.cos(ang) * sh * 0.5, 0, g);
    seg.rotation.z = -ang;
    cx += Math.sin(ang) * sh; cy += Math.cos(ang) * sh;
  }
  const top = new THREE.Group(); top.position.set(cx, cy, 0); g.add(top);
  for (let k = 0; k < 6; k++) {
    const fg = new THREE.Group(); fg.rotation.y = k * Math.PI / 3; top.add(fg);
    const leaf = add(new THREE.SphereGeometry(1, 8, 6), k % 2 ? M.palm : M.palmLight, 1.55, 0.1, 0, fg);
    leaf.scale.set(1.85, 0.22, 0.58); leaf.rotation.z = -0.35;
  }
  return g;
};
const palmCoords = [
  [-11.5, 4.5, -8.5, 6.8, 0.16, 0.4], [-14.2, 4.5, 4.5, 7.2, 0.14, 2.2],
  [-8.0, 4.5, 8.2, 6.0, 0.20, 1.1], [-16.5, 4.5, -11.0, 7.5, 0.12, 3.8],
  [-19.5, 7.8, 8.5, 6.6, 0.15, 0.9], [-18.2, 8.2, -9.2, 6.4, 0.14, 4.6],
  [-6.8, 4.5, -10.8, 5.8, 0.22, 5.2], [-15.8, 8.8, 0.5, 6.2, 0.15, 1.9],
  [-10.2, 4.5, 12.2, 6.4, 0.18, 2.7], [-22.0, 9.6, 13.5, 6.8, 0.14, 3.1],
  [-21.5, 9.6, -14.2, 7.0, 0.13, 0.2], [-5.5, 4.4, 7.6, 5.6, 0.24, 0.5],
];
for (const pc of palmCoords) palmTree(...pc);

// ---------- TINY NIUAFO'OU POST OFFICE (cliff plateau x = -9.5, y = 4.6, z = -1.8) ----------
const postOffice = new THREE.Group(); postOffice.position.set(-9.5, 4.55, -1.8); island.add(postOffice);
add(tbox(4.6, 3.3, 5.6, 2), M.postWall, 0, 1.65, 0, postOffice);
// Porch deck & roof
add(tbox(1.8, 0.3, 5.8, 1.5), M.deck, 3.0, 0.15, 0, postOffice);
for (const z of [-2.4, 2.4]) add(box(0.18, 3.1, 0.18), M.wood, 3.6, 1.65, z, postOffice);
// Pitched red corrugated roof
const poRoof = add(new THREE.ConeGeometry(4.6, 2.1, 4), M.roof, 0.5, 4.35, 0, postOffice);
poRoof.rotation.y = Math.PI / 4; poRoof.scale.set(1.05, 1, 1.15);
// Front door & windows facing +x (ocean)
add(box(0.14, 2.2, 1.3), M.navy, 2.32, 1.15, 0, postOffice, { cast: false });
add(new THREE.SphereGeometry(0.1, 8, 8), M.brass, 2.44, 1.15, 0.42, postOffice);
for (const z of [-1.65, 1.65]) {
  add(box(0.14, 1.0, 1.0), M.navy, 2.32, 1.85, z, postOffice, { cast: false });
  add(box(0.18, 0.82, 0.82), toon({ color: '#8ad4f5' }), 2.34, 1.85, z, postOffice, { cast: false });
}
// Signboard above porch (swaps to "TIN CAN ISLAND" in Shot 22!)
const poSign = add(box(0.18, 1.25, 3.8), M.signNormal, 3.72, 3.35, 0, postOffice);
// Note: BoxGeometry +X face is material index 0; apply texture cleanly via plane on +X front
poSign.material = M.woodDark;
const poSignFace = add(new THREE.PlaneGeometry(3.65, 1.15), M.signNormal, 3.83, 3.35, 0, postOffice, { cast: false });
poSignFace.rotation.y = Math.PI / 2;

// Mailbags piled proudly on the porch in finale
const finaleProps = new THREE.Group(); postOffice.add(finaleProps);
for (const [x, y, z, s] of [[3.0, 0.65, 1.7, 0.55], [3.1, 0.65, 2.35, 0.48], [2.9, 1.25, 2.0, 0.44], [3.0, 0.65, -1.9, 0.54], [3.2, 0.65, -2.5, 0.46]]) {
  const bag = add(new THREE.SphereGeometry(s, 10, 8), M.mailbag, x, y, z, finaleProps);
  bag.scale.set(0.95, 1.2, 0.95);
}
// Festive triangular bunting flags across porch roof
const buntCols = [M.red, M.goldRoute, M.navy, M.foam];
for (let i = 0; i < 9; i++) {
  const fz = -2.4 + i * 0.6, fy = 2.9 - Math.sin(i / 8 * Math.PI) * 0.35;
  const fl = add(new THREE.ConeGeometry(0.18, 0.38, 3), buntCols[i % 4], 3.72, fy, fz, finaleProps);
  fl.rotation.x = Math.PI;
}
finaleProps.visible = false;

// Wooden Shore Mailbox + Flip Calendar lined up cleanly side-by-side at x = -2.4 (zero overlap!)
const shoreMailG = new THREE.Group(); shoreMailG.position.set(-2.4, 4.60, -0.15); island.add(shoreMailG);
add(box(0.16, 1.4, 0.16), M.wood, 0, 0.7, 0, shoreMailG);
const mbBox = add(new THREE.CylinderGeometry(0.28, 0.28, 0.85, 12, 1, false, 0, Math.PI), M.red, 0, 1.55, 0, shoreMailG);
mbBox.rotation.z = Math.PI / 2;
add(box(0.85, 0.28, 0.56), M.red, 0, 1.42, 0, shoreMailG);
// Red flag on mailbox
add(box(0.06, 0.48, 0.06), M.goldRoute, 0.2, 1.65, 0.32, shoreMailG);
add(box(0.22, 0.16, 0.06), M.goldRoute, 0.3, 1.84, 0.32, shoreMailG);

const calG = new THREE.Group(); calG.position.set(-2.4, 4.60, 1.05); island.add(calG);
add(box(0.12, 1.65, 0.12), M.wood, 0, 0.82, 0, calG);
add(box(0.12, 1.35, 1.1), M.woodDark, 0, 1.82, 0, calG);
const calFace = add(new THREE.PlaneGeometry(1.02, 1.26), calMats[0], 0.08, 1.82, 0, calG, { cast: false });
calFace.rotation.y = Math.PI / 2;
calG.visible = false;

// ---------- WORLD 2: 1930s PACIFIC MAIL STEAMSHIP (S.S. TOFUA) ----------
const shipG = new THREE.Group(); shipG.position.set(28, 0, 0); scene.add(shipG);
// Main hull (length along Z = 22m, width along X = 7.4m, port side at x = -3.7 faces island!)
add(box(7.2, 4.8, 20.0), M.hullDark, 0, 1.8, 0, shipG);
add(box(7.35, 1.6, 20.2), M.hullRed, 0, -0.2, 0, shipG);
// Painted broadside hull decals on port (-x) and starboard (+x) sides
const portSide = add(new THREE.PlaneGeometry(20.0, 4.7), M.hull, -3.65, 1.75, 0, shipG, { cast: false });
portSide.rotation.y = -Math.PI / 2;
const stbdSide = add(new THREE.PlaneGeometry(20.0, 4.7), M.hull, 3.65, 1.75, 0, shipG, { cast: false });
stbdSide.rotation.y = Math.PI / 2;
// Tapered bow (+z) and stern (-z)
const bow = add(new THREE.ConeGeometry(3.65, 6.2, 4), M.hullDark, 0, 1.8, 13.0, shipG);
bow.rotation.x = Math.PI / 2; bow.rotation.y = Math.PI / 4;
const stern = add(new THREE.ConeGeometry(3.6, 4.5, 4), M.hullDark, 0, 1.8, -12.2, shipG);
stern.rotation.x = -Math.PI / 2; stern.rotation.y = Math.PI / 4;
// Wooden main deck (top at y = 4.25)
add(tbox(7.1, 0.25, 19.6, 2), M.deck, 0, 4.22, 0, shipG);
// Deck railings along port (-3.45) and starboard (+3.45)
for (const s of [-1, 1]) {
  add(box(0.12, 0.14, 19.2), M.whiteCabin, s * 3.48, 5.22, 0, shipG);
  add(box(0.08, 0.08, 19.2), M.whiteCabin, s * 3.48, 4.78, 0, shipG);
  for (let z = -9; z <= 9; z += 2.25) add(box(0.1, 0.95, 0.1), M.whiteCabin, s * 3.48, 4.78, z, shipG);
}
// White bridge superstructure + wheelhouse
add(box(5.6, 3.0, 8.6), M.whiteCabin, 0.3, 5.8, -2.5, shipG);
add(box(5.8, 0.22, 9.0), M.deck, 0.3, 7.35, -2.5, shipG);
add(box(4.6, 2.2, 4.4), M.whiteCabin, 0.3, 8.5, -0.5, shipG);
// Wheelhouse bridge windows
for (let z = -2.0; z <= 1.0; z += 0.95) add(box(0.12, 0.72, 0.65), M.navy, -2.02, 8.75, z, shipG, { cast: false });
// Tall iconic red-and-black striped smokestack
add(new THREE.CylinderGeometry(1.18, 1.32, 6.8, 18), M.funnel, 0.3, 10.6, -4.4, shipG);
// Foremast + red mail pennant
add(new THREE.CylinderGeometry(0.16, 0.24, 11.5, 10), M.wood, 0, 9.8, 6.2, shipG);
add(new THREE.CylinderGeometry(0.09, 0.09, 4.6, 8), M.wood, 0, 12.2, 6.2, shipG).rotation.z = Math.PI / 2;
const pennant = add(new THREE.ConeGeometry(0.55, 2.2, 3), M.red, 0, 15.2, 5.1, shipG);
pennant.rotation.x = -Math.PI / 2;
// Wooden deck crate for sealing the biscuit tin in Shot 9 (clear of railing/davit)
add(tbox(1.1, 0.72, 1.1, 1.2), M.wood, -1.6, 4.70, 3.8, shipG);

// Cargo davit arm extending over the port side (-x) for bucket hauling (Shot 8)
add(new THREE.CylinderGeometry(0.11, 0.13, 3.8, 8), M.iron, -3.4, 6.1, 2.2, shipG);
const davitArm = add(new THREE.CylinderGeometry(0.09, 0.11, 2.4, 8), M.iron, -4.3, 7.6, 2.2, shipG);
davitArm.rotation.z = Math.PI / 2.6;

// Animated 3D Rope & Wooden Bucket (world-synced to ship)
const bucketG = new THREE.Group(); shipG.add(bucketG);
const ropeMesh = add(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 8), M.rope, -5.2, 5.5, 2.2, bucketG);
const bucketBody = new THREE.Group(); bucketBody.position.set(-5.2, 3.0, 2.2); bucketG.add(bucketBody);
add(new THREE.CylinderGeometry(0.48, 0.36, 0.72, 14), M.wood, 0, 0, 0, bucketBody);
add(new THREE.TorusGeometry(0.46, 0.04, 6, 16), M.iron, 0, 0.22, 0, bucketBody).rotation.x = Math.PI / 2;
add(new THREE.TorusGeometry(0.39, 0.04, 6, 16), M.iron, 0, -0.18, 0, bucketBody).rotation.x = Math.PI / 2;
// White letters peeking proudly out of the bucket!
for (const [lx, ly, lz, rz] of [[-0.14, 0.44, 0.06, 0.22], [0.12, 0.48, -0.05, -0.18], [0.0, 0.42, 0.12, 0.06]]) {
  const lt = add(box(0.42, 0.3, 0.04), M.foam, lx, ly, lz, bucketBody); lt.rotation.z = rz;
}

// ---------- HERO 3D SEALED BISCUIT TIN ----------
const tinG = new THREE.Group(); scene.add(tinG);
add(new THREE.CylinderGeometry(0.44, 0.44, 0.76, 24), M.tinBody, 0, 0, 0, tinG);
const tinLidG = new THREE.Group(); tinLidG.position.set(0, 0.4, 0); tinG.add(tinLidG);
add(new THREE.CylinderGeometry(0.47, 0.47, 0.14, 24), M.tinLid, 0, 0, 0, tinLidG);
add(new THREE.TorusGeometry(0.14, 0.035, 8, 16, Math.PI), M.brass, 0, 0.07, 0, tinLidG);
// Mail stack visible inside tin when lid is open (Shot 9!)
const tinLetters = add(box(0.55, 0.28, 0.42), M.foam, 0, 0.34, 0, tinG);
tinG.visible = false;

// ---------- WORLD 3: COLLECTORS MAP TABLE & RUBBER STAMP STAGE (isolated at x = -120) ----------
const tableG = new THREE.Group(); tableG.position.set(-120, 0, 0); scene.add(tableG);
// Wide dark wooden tabletop + warm studio backdrop wall
add(tbox(24, 0.8, 16, 4), M.deskTop, 0, 1.6, 0, tableG, { cast: false });
add(box(30, 18, 0.5), M.studioWall, 0, 9.0, -7.8, tableG, { cast: false });
// Giant Vintage Pacific World Map flat on table
const mapBoard = add(new THREE.PlaneGeometry(14.5, 11.2), M.worldMap, 0, 2.03, 0.4, tableG, { cast: false });
mapBoard.rotation.x = -Math.PI / 2;
// 3D Mini volcano pin right at Niuafo'ou on the map!
const mapPin = add(new THREE.ConeGeometry(0.32, 0.65, 10), M.red, 0, 2.38, 0.75, tableG);
// 3D Glowing Golden Mail-Route Arches radiating from Niuafo'ou across the Pacific!
const routeArches = [];
const archTargets = [[-4.4, -3.5], [-2.0, -2.8], [-4.0, 2.4], [4.9, -3.2], [5.8, 2.1], [-1.0, 4.1]];
for (const [tx, tz] of archTargets) {
  const curve3 = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 2.12, 0.75),
    new THREE.Vector3(tx * 0.5, 4.4, (0.75 + tz) * 0.5),
    new THREE.Vector3(tx, 2.12, tz),
  );
  const tube = add(new THREE.TubeGeometry(curve3, 24, 0.085, 8, false), M.goldRoute, 0, 0, 0, tableG);
  routeArches.push(tube);
}

// Giant 3D Airmail Envelope + Wooden Rubber Stamp (Shots 20-21)
const stampStageG = new THREE.Group(); stampStageG.position.set(-120, 2.06, 0.8); scene.add(stampStageG);
add(box(5.4, 0.14, 3.6), M.foam, 0, 0.07, 0, stampStageG);
const envFace = add(new THREE.PlaneGeometry(5.36, 3.56), M.envClean, 0, 0.15, 0, stampStageG, { cast: false });
envFace.rotation.x = -Math.PI / 2;
const stamp3d = new THREE.Group(); stamp3d.position.set(0.45, 2.2, 0.0); stampStageG.add(stamp3d);
// Rubber ink pad base + wooden block + turned wooden handle
add(new THREE.CylinderGeometry(1.18, 1.22, 0.22, 24), M.crimsonRubber, 0, 0.11, 0, stamp3d);
add(new THREE.CylinderGeometry(1.24, 1.24, 0.34, 24), M.wood, 0, 0.39, 0, stamp3d);
add(new THREE.CylinderGeometry(0.32, 0.46, 1.35, 16), M.wood, 0, 1.2, 0, stamp3d);
add(new THREE.SphereGeometry(0.56, 16, 12), M.wood, 0, 2.05, 0, stamp3d);
stampStageG.visible = false;

// ---------- clouds (painted billboards, no ink, CPU-safe canvas) ----------
const clouds = [];
{
  const r = P.rng(91);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    const pen = new T.Pen(c.getContext('2d', { willReadFrequently: true })); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 520 + r() * 280;
    m.position.set(Math.cos(a) * d, 95 + r() * 140, Math.sin(a) * d);
    m.scale.setScalar(135 + r() * 130);
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
    // Strict razor-sharp passthrough (dofAt cinf is always 0)
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
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el);
  tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 85); sun.target.position.copy(focus);
  const ext = L.shadowExt || 28, sc = sun.shadow.camera;
  sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 220; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  const t = f / 30;
  waterU.t.value = t;
  waterU.chop.value = S.chop ?? 1.0;

  // Steamship visibility, position, and sea swell pitch/roll
  shipG.visible = S.ship !== false;
  if (shipG.visible) {
    const sx = S.shipX ?? 28, sz = S.shipZ ?? 0;
    shipG.position.set(sx, Math.sin(t * 1.9) * 0.22, sz);
    shipG.rotation.z = Math.sin(t * 1.6) * 0.045 * (S.shipRoll ?? 1);
    shipG.rotation.x = Math.cos(t * 1.2) * 0.025 * (S.shipRoll ?? 1);
  }

  // Bucket height (y from 1.6 water -> 5.5 deck)
  const bY = S.bucketY ?? 5.2;
  bucketG.visible = S.bucket !== false;
  bucketBody.position.y = bY;
  const ropeTop = 7.7, ropeLen = Math.max(0.2, ropeTop - bY);
  ropeMesh.scale.y = ropeLen; ropeMesh.position.y = bY + ropeLen * 0.5;

  // Hero 3D Biscuit Tin
  tinG.visible = !!S.tin;
  if (S.tin) {
    tinG.position.set(S.tin.x, S.tin.y, S.tin.z);
    tinG.rotation.set(S.tin.rx || 0, S.tin.ry || 0, S.tin.rz || 0);
    tinG.scale.setScalar(S.tin.s || 1);
    const open = S.tin.lidOpen || 0;
    tinLidG.position.set(open * 0.35, 0.4 + open * 0.45, 0);
    tinLidG.rotation.z = -open * 0.7;
    tinLetters.visible = open > 0.05;
  }

  // Post Office finale upgrade
  poSignFace.material = S.famous ? M.signFamous : M.signNormal;
  finaleProps.visible = !!S.famous;

  // Shore calendar & mailbox
  shoreMailG.visible = S.showMailbox !== false;
  calG.visible = !!S.showCalendar;
  if (S.showCalendar) {
    const mIdx = Math.min(calMats.length - 1, Math.max(0, S.monthIdx || 0));
    calFace.material = calMats[mIdx];
    calG.rotation.z = Math.sin(f * 0.35) * 0.03;
  }

  // World Map & Rubber Stamp tabletop stage
  const isTable = !!S.tableStage;
  tableG.visible = isTable;
  mapBoard.visible = isTable && !S.stampStage;
  mapPin.visible = isTable && !S.stampStage;
  const archVis = isTable && !S.stampStage && (S.routes ?? 0) > 0;
  routeArches.forEach((a, i) => {
    a.visible = archVis && (S.routes > i / routeArches.length);
    if (a.visible) a.scale.y = Math.min(1, ((S.routes - i / routeArches.length) * 3.5));
  });

  stampStageG.visible = !!S.stampStage;
  if (S.stampStage) {
    envFace.material = S.stamped ? M.envStamped : M.envClean;
    stamp3d.position.set(S.stampX ?? 0.45, S.stampY ?? 2.2, S.stampZ ?? 0);
    stamp3d.rotation.set(S.stampRx || 0, S.stampRy || 0, S.stampRz || 0);
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
  for (const c of clouds) { c.visible = !W_.tableStage; c.quaternion.copy(camera.quaternion); }

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
  inkU.px.value = W_.tableStage ? 2.0 : 2.35;
  inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0);
  inkU.vig.value = L.vig ?? 0.18;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);

  // Final crisp sRGB copy (cinf always 0)
  dofU.focus.value = D.focus; dofU.cinf.value = 0; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};

window.TOTAL = TOTAL;
window.ready = true;
