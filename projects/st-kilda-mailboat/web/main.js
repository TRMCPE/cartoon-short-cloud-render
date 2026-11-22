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
  const d = new Uint8Array([98, 98, 98, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff', clamp = false) => toon({ map: P.tex(c, rx_, ry_, clamp), color });

const M = {
  cliff:       texM(P.slateCliff(1), 2, 2),
  cliffDark:   texM(P.slateCliff(7), 2, 2, '#9ca4b0'),
  grass:       texM(P.hebrideanGrass(2), 4, 4),
  stone:       texM(P.stoneWall(3), 2, 1),
  slate:       texM(P.slateRoof(4), 2, 2),
  bench:       texM(P.woodBench(5), 2, 2),
  boatRaw:     texM(P.boatWood(false), 1, 1),
  boatLid:     texM(P.boatWood(true), 1, 1, '#ffffff', true),
  bladder:     texM(P.bladderTex(), 1, 1, '#ffffff', true),
  scroll:      texM(P.scrollTex(), 1, 1, '#ffffff', true),
  atlanticMap: texM(P.atlanticMapTex(), 1, 1, '#ffffff', true),
  villageSign: texM(P.villageSignTex('ST KILDA', 'NORTH ATLANTIC'), 1, 1, '#ffffff', true),
  lighthouse:  texM(P.lighthouseTex(), 1, 1, '#ffffff', true),
  norwayRed:   texM(P.norwayWoodTex(8), 2, 1),
  snowRock:    texM(P.snowRockTex(9), 2, 2),
  wood:        toon({ color: '#7a5030' }),
  woodDark:    toon({ color: '#462c1a' }),
  hollowDark:  toon({ color: '#2b180c' }),
  rope:        toon({ color: '#c8ab74' }),
  waxRed:      toon({ color: '#c42b2b' }),
  gold:        toon({ color: '#ffd644' }),
  warmGlow:    new THREE.MeshBasicMaterial({ color: '#ffe38a' }),
  white:       toon({ color: '#f5f4ee' }),
  wool:        toon({ color: '#f2ead8' }),
  sheepDark:   toon({ color: '#332d29' }),
  pine:        toon({ color: '#275742' }),
  pineSnow:    toon({ color: '#e8f2fa' }),
  sand:        toon({ color: '#cbb992' }),
  sail:        toon({ color: '#f2ead6' }),
  hullDark:    toon({ color: '#2b2420' }),
  iron:        toon({ color: '#3b424d' }),
  studioWall:  toon({ color: '#25394f' }),
  cottageWall: texM(P.stoneWall(12), 4, 2, '#9fa5b0'),
  deskTop:     texM(P.woodBench(15), 3, 2, '#8f6c4e'),
  brass:       toon({ color: '#d4a644' }),
  windowNight: toon({ color: '#1b3552' }),
};

const MONTHS = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
const calMats = MONTHS.map((m, i) => texM(P.calendarMonthTex(m, i), 1, 1, '#ffffff', true));

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
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.55, s) + .35*pow(max(s,0.), 20.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 60, 750);

// ---------- animated North Atlantic ocean (follows active coastal stage!) ----------
const waterU = {
  t: { value: 0 }, chop: { value: 1.0 },
  shoreCenter: { value: new THREE.Vector2(-24.0, 0.0) },
  shoreRad: { value: 23.0 },
  deep: { value: new THREE.Color('#133d63') },
  shal: { value: new THREE.Color('#286d8c') },
  glint: { value: new THREE.Color('#e8f6ff') },
};
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    uniform float t, chop; varying vec3 vW; varying float vH;
    void main(){
      vec4 w = modelMatrix*vec4(position,1.);
      float near = 1.0 - smoothstep(55.0, 145.0, length(position.xy));
      float h = (sin(w.x*0.32 + t*2.5)*0.26 + cos(w.z*0.26 - t*2.0)*0.22 + sin((w.x+w.z)*0.20 + t*3.2)*0.16) * chop * near;
      w.y += h; vW = w.xyz; vH = h;
      vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t, chop, shoreRad; uniform vec2 shoreCenter; uniform vec3 deep, shal, glint; varying vec3 vW; varying float vH;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){
      vec2 p = vW.xz*vec2(.16,.14) + vec2(-t*.42, t*.16);
      float n = noise(p)*.55 + noise(p*2.4 + 5.1)*.45;
      float dIsl = length(vW.xz - shoreCenter);
      float shallow = 1.0 - smoothstep(shoreRad, shoreRad + 16.0, dIsl);
      vec3 c = mix(deep, shal, clamp(0.24 + 0.34*n + 0.52*shallow, 0.0, 1.0));
      float shoreBand = (1.0 - smoothstep(shoreRad - 0.5, shoreRad + 7.5, dIsl)) * smoothstep(shoreRad - 6.0, shoreRad - 0.2, dIsl);
      float ring = smoothstep(0.42, 0.70, sin(dIsl*1.7 - t*4.2 + n*3.2)*0.5 + 0.5) * shoreBand;
      float crest = smoothstep(0.22, 0.42, vH) * 0.78 * clamp(chop, 0.4, 2.2);
      float streak = smoothstep(0.73, 0.81, noise(vW.xz*vec2(0.35, 0.14) + vec2(-t*0.75, 0.0))) * 0.52;
      c = mix(c, glint, clamp(ring*0.92 + crest + streak, 0.0, 1.0));
      gl_FragColor = vec4(c, 1.);
      #include <fog_fragment>
    }`,
});
const innerSea = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 80, 80), waterMat);
innerSea.rotation.x = -Math.PI / 2; innerSea.position.set(10, 0, 0);
innerSea.userData.nd = waterNd; innerSea.receiveShadow = false; scene.add(innerSea);

const farSeaMat = new THREE.MeshBasicMaterial({ color: '#14446b', fog: true });
const farSea = new THREE.Mesh(new THREE.RingGeometry(130, 1400, 48), farSeaMat);
farSea.rotation.x = -Math.PI / 2; farSea.position.set(10, -0.04, 0);
farSea.userData.nd = waterNd; farSea.receiveShadow = false; scene.add(farSea);

// =========================================================================
// STAGE 1: ST KILDA ISLAND (Village Bay, Conachair Sea Cliffs & Sea Stack)
// =========================================================================
const kilda = new THREE.Group(); scene.add(kilda);

// Steep dark Hebridean cliff foundation plunging into the North Atlantic
const cliffBase = add(new THREE.CylinderGeometry(22.5, 26.5, 6.2, 22), M.cliff, -24, 1.5, 0, kilda);
cliffBase.scale.set(1.04, 1, 1.15);

// Emerald-moss grass plateau cap across Village Bay (top surface y = 4.62)
const grassCap = add(new THREE.CylinderGeometry(22.2, 22.8, 0.45, 22), M.grass, -24, 4.42, 0, kilda);
grassCap.scale.set(1.04, 1, 1.15);

// Towering Conachair sea cliff peaks & green hillsides behind Village Bay
const peakA = add(new THREE.ConeGeometry(16.5, 24.0, 9), M.cliff, -33.5, 16.0, -5.0, kilda);
peakA.scale.set(1.05, 1, 1.25);
const peakATurf = add(new THREE.ConeGeometry(13.2, 16.5, 9), M.grass, -31.0, 13.5, -4.5, kilda);
peakATurf.scale.set(1.0, 1, 1.18);

const peakB = add(new THREE.ConeGeometry(13.5, 19.5, 8), M.cliffDark, -31.5, 14.0, 10.5, kilda);
peakB.scale.set(1.0, 1, 1.15);
const peakBTurf = add(new THREE.ConeGeometry(10.5, 13.5, 8), M.grass, -29.0, 11.2, 9.8, kilda);

// Iconic Offshore Sea Stack (Stac an Armin / Stac Lee) rising dramatically out of the sea!
const stackG = new THREE.Group(); stackG.position.set(15.5, 0, -17.5); kilda.add(stackG);
const st1 = add(new THREE.ConeGeometry(5.2, 17.5, 7), M.cliffDark, 0, 8.2, 0, stackG);
st1.scale.set(0.95, 1, 1.2);
const st2 = add(new THREE.ConeGeometry(3.4, 12.2, 6), M.cliff, 2.8, 5.5, 1.8, stackG);
st2.rotation.z = -0.15;
add(new THREE.DodecahedronGeometry(2.8, 0), M.cliffDark, -2.2, 1.6, 2.2, stackG).scale.set(1.2, 0.8, 1.0);

// Jagged basalt coastal surf rocks along seaward edge (keeping z = -2..+2 open for sea throws!)
const rockRng = P.rng(23);
const rockSpecs = [
  [1.4, 0.4, -5.8, 2.8, 2.5, 2.6],
  [3.0, 0.5, -3.2, 2.2, 2.4, 2.2],
  [2.6, 0.4, 4.4, 3.0, 2.9, 2.6],
  [4.2, 0.3, 7.2, 2.6, 2.2, 2.5],
  [-0.8, 1.1, -10.0, 4.2, 4.4, 3.8],
  [-1.0, 1.2, 10.4, 4.4, 4.6, 4.0],
  [1.2, 0.6, -13.5, 3.2, 3.4, 3.0],
];
for (const [x, y, z, sx, sy, sz] of rockSpecs) {
  const rk = add(new THREE.DodecahedronGeometry(1, 0), M.cliffDark, x, y, z, kilda);
  rk.scale.set(sx, sy, sz); rk.rotation.set(rockRng() * 0.4, rockRng() * 6, rockRng() * 0.4);
}

// Helper: authentic St Kilda dry-stone croft cottage
const buildCottage = (x, y, z, yaw = 0, lit = true) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; kilda.add(g);
  add(tbox(3.8, 2.4, 5.4, 1.8), M.stone, 0, 1.2, 0, g);
  // Pitched dark Hebridean slate gable roof (triangular prism via 3-sided cylinder!)
  const roof = add(new THREE.CylinderGeometry(2.65, 2.65, 5.8, 3), M.slate, 0, 3.15, 0, g);
  roof.rotation.x = Math.PI / 2; roof.rotation.y = Math.PI; roof.scale.set(1.02, 1, 0.72);
  // Stone chimney on north gable
  add(tbox(0.85, 2.0, 0.85, 1.0), M.stone, 0, 4.15, -2.0, g);
  add(box(1.0, 0.2, 1.0), M.cliffDark, 0, 5.2, -2.0, g);
  // Heavy wooden door & warm cottage windows facing +X (sea!)
  add(box(0.14, 1.65, 0.96), M.woodDark, 1.92, 0.85, 0, g, { cast: false });
  const winMat = lit ? M.warmGlow : M.windowNight;
  for (const wz of [-1.6, 1.6]) {
    add(box(0.14, 0.82, 0.82), M.woodDark, 1.92, 1.35, wz, g, { cast: false });
    add(box(0.18, 0.64, 0.64), winMat, 1.94, 1.35, wz, g, { cast: false });
  }
  return g;
};
buildCottage(-10.6, 4.62, -2.4, 0.08, true);
buildCottage(-12.4, 4.62, 4.8, -0.22, true);
buildCottage(-12.8, 4.62, -9.2, 0.25, true);

// Authentic beehive dry-stone St Kilda Cleits (grass-capped storage huts)
const buildCleit = (x, y, z, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); kilda.add(g);
  add(new THREE.CylinderGeometry(1.0, 1.25, 1.2, 8), M.stone, 0, 0.6, 0, g);
  const cap = add(new THREE.SphereGeometry(1.18, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), M.grass, 0, 1.15, 0, g);
  cap.scale.set(1, 0.72, 1);
  add(box(0.14, 0.78, 0.56), M.woodDark, 1.08, 0.42, 0, g, { cast: false });
};
buildCleit(-7.4, 4.62, -6.4, 1.05);
buildCleit(-8.2, 4.62, 6.4, 0.95);
buildCleit(-15.5, 4.62, 0.4, 1.1);

// Low dry-stone village perimeter wall segments
add(tbox(0.55, 0.85, 4.6, 1.4), M.stone, -6.5, 5.04, 1.8, kilda);
add(tbox(0.55, 0.85, 3.8, 1.4), M.stone, -6.8, 5.04, -9.2, kilda);

// Weathered Wooden Village Post Sign ("ST KILDA • NORTH ATLANTIC") facing +X
const vSignG = new THREE.Group(); vSignG.position.set(-5.0, 4.62, -3.5); kilda.add(vSignG);
add(box(0.18, 2.3, 0.18), M.woodDark, 0, 1.15, -1.0, vSignG);
add(box(0.18, 2.3, 0.18), M.woodDark, 0, 1.15, 1.0, vSignG);
add(box(0.16, 1.05, 2.65), M.woodDark, 0, 2.15, 0, vSignG);
const vSignFace = add(new THREE.PlaneGeometry(2.54, 0.96), M.villageSign, 0.10, 2.15, 0, vSignG, { cast: false });
vSignFace.rotation.y = Math.PI / 2;

// Cute 3D Woolly Soay Sheep grazing on St Kilda's emerald hills!
const buildSheep = (x, y, z, yaw = 0) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; kilda.add(g);
  const body = add(new THREE.SphereGeometry(0.48, 10, 8), M.wool, 0, 0.65, 0, g);
  body.scale.set(1.25, 0.92, 0.9);
  add(new THREE.SphereGeometry(0.24, 8, 8), M.sheepDark, 0.56, 0.78, 0, g);
  add(new THREE.SphereGeometry(0.18, 8, 6), M.wool, 0.48, 0.96, 0, g);
  for (const [lx, lz] of [[-0.28, -0.18], [-0.28, 0.18], [0.28, -0.18], [0.28, 0.18]]) {
    add(new THREE.CylinderGeometry(0.05, 0.04, 0.48, 6), M.sheepDark, lx, 0.24, lz, g);
  }
  return g;
};
buildSheep(-7.2, 4.62, 3.6, 0.8);
buildSheep(-8.8, 4.62, 4.8, -1.2);
buildSheep(-10.8, 4.62, -6.6, 0.4);
buildSheep(-5.6, 4.62, 5.2, 2.1);

// 9-Month Storm Calendar Post on cliff edge (visible only in Shot 4!)
const calG = new THREE.Group(); calG.position.set(-2.6, 4.62, 0.0); kilda.add(calG);
add(box(0.18, 2.1, 0.18), M.woodDark, 0, 1.05, 0, calG);
add(box(0.16, 1.85, 1.48), M.woodDark, 0, 2.35, 0, calG);
const calFace = add(new THREE.PlaneGeometry(1.38, 1.72), calMats[0], 0.10, 2.35, 0, calG, { cast: false });
calFace.rotation.y = Math.PI / 2;
calG.visible = false;

// Cliffside brass storm lantern post (visible in Shot 20!)
const cliffLanternG = new THREE.Group(); cliffLanternG.position.set(-2.4, 4.62, -1.7); kilda.add(cliffLanternG);
add(box(0.14, 2.2, 0.14), M.woodDark, 0, 1.1, 0, cliffLanternG);
add(box(0.7, 0.12, 0.12), M.woodDark, 0.3, 2.15, 0, cliffLanternG);
add(new THREE.CylinderGeometry(0.18, 0.18, 0.36, 8), M.warmGlow, 0.56, 1.85, 0, cliffLanternG, { cast: false });
add(new THREE.ConeGeometry(0.24, 0.16, 8), M.iron, 0.56, 2.10, 0, cliffLanternG);
add(new THREE.CylinderGeometry(0.21, 0.21, 0.08, 8), M.iron, 0.56, 1.65, 0, cliffLanternG);
cliffLanternG.visible = false;

// 3D Wooden Supply Schooner (stormy turn-away in Shot 5 + hopeful rescue ship on horizon in Shot 21!)
const shipG = new THREE.Group(); shipG.position.set(24, 0, -4); scene.add(shipG);
add(box(4.6, 2.6, 12.5), M.hullDark, 0, 1.1, 0, shipG);
add(box(4.7, 0.45, 12.6), M.waxRed, 0, 0.15, 0, shipG);
const sBow = add(new THREE.ConeGeometry(2.35, 4.4, 4), M.hullDark, 0, 1.1, 8.4, shipG);
sBow.rotation.x = Math.PI / 2; sBow.rotation.y = Math.PI / 4;
add(box(2.6, 1.4, 3.2), M.wood, 0, 3.0, -3.2, shipG);
// Two wooden masts + billowing cream sails
for (const mz of [-2.4, 3.0]) {
  add(new THREE.CylinderGeometry(0.14, 0.20, 10.5, 8), M.wood, 0, 7.2, mz, shipG);
  add(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 8), M.wood, 0, 9.6, mz, shipG).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.08, 0.08, 5.0, 8), M.wood, 0, 6.2, mz, shipG).rotation.z = Math.PI / 2;
  const sail = add(box(4.4, 3.2, 0.18), M.sail, 0, 7.8, mz + 0.2, shipG);
  sail.rotation.y = 0.28;
}
shipG.visible = false;

// =========================================================================
// HERO 3D ST KILDA MAILBOAT + HOLLOW + SOS SCROLL + SHEEP'S BLADDER FLOAT
// =========================================================================
const mailboatG = new THREE.Group(); scene.add(mailboatG);

// Sculpted carved wooden boat hull with visible recessed HOLLOW chamber inside!
const hullG = new THREE.Group(); mailboatG.add(hullG);
// Bottom keel & base slab
add(box(1.18, 0.24, 0.62), M.boatRaw, 0, 0.12, 0, hullG);
// Raised hollow compartment side walls (forming an unmistakable scooped hollow cavity!)
add(box(1.18, 0.30, 0.11), M.boatRaw, 0, 0.36, -0.26, hullG); // back gunwale
add(box(1.18, 0.30, 0.11), M.boatRaw, 0, 0.36, 0.26, hullG);  // front gunwale
add(box(0.14, 0.30, 0.42), M.boatRaw, -0.52, 0.36, 0, hullG); // stern wall
add(box(0.14, 0.30, 0.42), M.boatRaw, 0.52, 0.36, 0, hullG);  // bow bulkhead
// Dark hollowed-out interior floor
add(box(0.92, 0.06, 0.42), M.hollowDark, 0, 0.26, 0, hullG, { cast: false });
// Pointed carved wooden bow (+X) and tapered stern (-X)
const bowCone = add(new THREE.ConeGeometry(0.36, 0.62, 4), M.boatRaw, 0.86, 0.27, 0, hullG);
bowCone.rotation.z = -Math.PI / 2; bowCone.rotation.x = Math.PI / 4; bowCone.scale.set(1.0, 1.0, 1.08);
const sternCone = add(new THREE.ConeGeometry(0.32, 0.36, 4), M.boatRaw, -0.74, 0.27, 0, hullG);
sternCone.rotation.z = Math.PI / 2; sternCone.rotation.x = Math.PI / 4;

// Rolled SOS Parchment Scroll inside (or descending into) the hollow!
const boatScrollG = new THREE.Group(); boatScrollG.position.set(0, 0.42, 0); mailboatG.add(boatScrollG);
const scrollCyl = add(new THREE.CylinderGeometry(0.12, 0.12, 0.72, 16), M.scroll, 0, 0, 0, boatScrollG);
scrollCyl.rotation.z = Math.PI / 2;
add(new THREE.CylinderGeometry(0.135, 0.135, 0.08, 14), M.waxRed, 0, 0, 0, boatScrollG).rotation.z = Math.PI / 2;

// Carved wooden lid ("ST KILDA MAILBOAT") + red wax seal button
const boatLidG = new THREE.Group(); boatLidG.position.set(0, 0.53, 0); mailboatG.add(boatLidG);
add(box(1.14, 0.09, 0.60), M.boatRaw, 0, 0, 0, boatLidG);
const lidLabel = add(new THREE.PlaneGeometry(1.08, 0.54), M.boatLid, 0, 0.052, 0, boatLidG, { cast: false });
lidLabel.rotation.x = -Math.PI / 2;
// Bold crimson wax seal button on lid corner
add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), M.waxRed, 0.35, 0.06, 0.14, boatLidG);

// Tethered Hemp Cord + Buoyant Cream Inflated Sheep's Bladder Float!
const floatG = new THREE.Group(); mailboatG.add(floatG);
const cordCurve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(1.06, 0.30, 0),
  new THREE.Vector3(1.38, 0.72, 0.06),
  new THREE.Vector3(1.56, 1.18, 0),
);
const cordMesh = add(new THREE.TubeGeometry(cordCurve, 18, 0.032, 8, false), M.rope, 0, 0, 0, floatG);
// Knot collar tying off the neck of the bladder
const floatBallG = new THREE.Group(); floatBallG.position.set(1.62, 1.56, 0); floatG.add(floatBallG);
add(new THREE.TorusGeometry(0.11, 0.036, 8, 16), M.rope, -0.05, -0.34, 0, floatBallG).rotation.x = Math.PI / 2;
add(new THREE.ConeGeometry(0.16, 0.24, 12), M.bladder, -0.04, -0.26, 0, floatBallG).rotation.z = Math.PI;
// Plump oval inflated cream-parchment sheep's bladder float
const bladderSphere = add(new THREE.SphereGeometry(0.46, 22, 18), M.bladder, 0, 0.05, 0, floatBallG);
bladderSphere.scale.set(0.95, 1.16, 0.92);
mailboatG.visible = false;

// =========================================================================
// STAGE 2: COZY LANTERN CARVING WORKBENCH STUDIO — isolated at (-120, 0, 0)
// =========================================================================
const benchStageG = new THREE.Group(); benchStageG.position.set(-120, 0, 0); scene.add(benchStageG);
// Rustic oak tabletop (top at y = 2.0)
add(tbox(14.0, 0.55, 6.5, 2.2), M.bench, 0, 1.72, 0, benchStageG, { cast: false });
// Heavy table legs
for (const [lx, lz] of [[-5.6, -2.5], [5.6, -2.5], [-5.6, 2.5], [5.6, 2.5]]) {
  add(box(0.45, 1.8, 0.45), M.woodDark, lx, 0.7, lz, benchStageG);
}
// Cozy St Kilda stone cottage back wall + small twilight arched window
add(tbox(22.0, 14.0, 0.6, 3.0), M.cottageWall, 0, 7.0, -4.6, benchStageG, { cast: false });
add(box(2.6, 2.8, 0.3), M.woodDark, 3.2, 5.2, -4.3, benchStageG, { cast: false });
add(box(2.2, 2.4, 0.34), M.windowNight, 3.2, 5.2, -4.28, benchStageG, { cast: false });
add(box(2.2, 0.12, 0.38), M.woodDark, 3.2, 5.2, -4.25, benchStageG, { cast: false });
add(box(0.12, 2.4, 0.38), M.woodDark, 3.2, 5.2, -4.25, benchStageG, { cast: false });
// Warm brass storm lantern sitting on left edge of workbench
const tableLantern = new THREE.Group(); tableLantern.position.set(-2.35, 2.0, -0.35); benchStageG.add(tableLantern);
add(new THREE.CylinderGeometry(0.28, 0.32, 0.14, 12), M.iron, 0, 0.07, 0, tableLantern);
add(new THREE.CylinderGeometry(0.22, 0.22, 0.48, 12), M.warmGlow, 0, 0.38, 0, tableLantern, { cast: false });
add(new THREE.ConeGeometry(0.32, 0.24, 12), M.iron, 0, 0.72, 0, tableLantern);
// Coiled hemp twine spool & red sealing wax stick on right edge of workbench
add(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 14), M.rope, 2.25, 2.19, 0.45, benchStageG);
const waxStick = add(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 10), M.waxRed, 1.85, 2.08, 0.95, benchStageG);
waxStick.rotation.z = Math.PI / 2; waxStick.rotation.y = 0.5;
// Scattered wooden shavings on tabletop
for (const [sx, sz, sy] of [[-1.0, 0.9, 0.4], [-0.5, 1.15, 1.2], [0.6, 1.05, -0.6], [1.1, 0.85, 0.9], [-1.3, 0.5, -0.3]]) {
  const sh = add(new THREE.TorusGeometry(0.11, 0.03, 6, 10, Math.PI * 1.4), M.boatRaw, sx, 2.03, sz, benchStageG, { cast: false });
  sh.rotation.x = Math.PI / 2; sh.rotation.z = sy;
}
benchStageG.visible = false;

// =========================================================================
// STAGE 3: VINTAGE NORTH ATLANTIC NAUTICAL CHART — isolated at (120, 0, 0)
// =========================================================================
const mapStageG = new THREE.Group(); mapStageG.position.set(120, 0, 0); scene.add(mapStageG);
add(tbox(24, 0.8, 18, 4), M.deskTop, 0, 1.6, 0, mapStageG, { cast: false });
add(box(32, 18, 0.5), M.studioWall, 0, 9.0, -9.2, mapStageG, { cast: false });
const mapBoard = add(new THREE.PlaneGeometry(14.5, 14.5), M.atlanticMap, 0, 2.04, 0, mapStageG, { cast: false });
mapBoard.rotation.x = -Math.PI / 2;

// Exact map landmark local coordinates:
// St Kilda (248,620) -> (-3.74, +1.53), Scotland (536,650) -> (+0.34, +1.95), Norway (880,360) -> (+5.21, -2.15)
const SK = new THREE.Vector3(-3.74, 2.12, 1.53);
const SCOT = new THREE.Vector3(0.34, 2.12, 1.95);
const NORW = new THREE.Vector3(5.21, 2.12, -2.15);

// Glowing crimson 3D island marker pin at St Kilda
add(new THREE.ConeGeometry(0.28, 0.62, 10), M.waxRed, SK.x, 2.42, SK.z, mapStageG);
// Golden distance arch from St Kilda -> Mainland Scotland (Shot 3: "more than a hundred miles")
const milesCurve = new THREE.QuadraticBezierCurve3(SK, new THREE.Vector3(-1.7, 3.65, 1.15), SCOT);
const milesArch = add(new THREE.TubeGeometry(milesCurve, 28, 0.085, 8, false), M.gold, 0, 0, 0, mapStageG);

// 4 Branching Mystery Drift Arches radiating out from St Kilda (Shot 16: "Nobody knew where it would land")
const mysteryTargets = [
  new THREE.Vector3(-4.6, 2.12, -3.9),  // NW toward Iceland
  new THREE.Vector3(-0.6, 2.12, -3.7),  // N toward Faroes
  SCOT,                                 // E toward Scottish Mainland
  NORW,                                 // NE toward Norway
];
const mysteryArches = mysteryTargets.map((dst, idx) => {
  const mid = new THREE.Vector3((SK.x + dst.x) * 0.5, 3.5 + (idx % 2) * 0.6, (SK.z + dst.z) * 0.5);
  const c = new THREE.QuadraticBezierCurve3(SK, mid, dst);
  return add(new THREE.TubeGeometry(c, 26, 0.08, 8, false), idx >= 2 ? M.gold : M.waxRed, 0, 0, 0, mapStageG);
});
mapStageG.visible = false;

// =========================================================================
// STAGE 4: SCOTTISH MAINLAND COAST & LIGHTHOUSE — isolated at (240, 0, 0)
// =========================================================================
const scotStageG = new THREE.Group(); scotStageG.position.set(240, 0, 0); scene.add(scotStageG);
// Gentle sandy-pebble beach & green Highland hills rising west (-X)
const scotBeach = add(new THREE.CylinderGeometry(16.0, 20.5, 2.4, 20), M.sand, -14.5, -0.35, 0, scotStageG);
scotBeach.scale.set(1.05, 1, 1.25);
const scotHill1 = add(new THREE.SphereGeometry(14.0, 14, 10), M.grass, -17.0, 2.2, -3.5, scotStageG);
scotHill1.scale.set(1.1, 0.65, 1.35);
const scotHill2 = add(new THREE.SphereGeometry(11.0, 12, 10), M.grass, -15.5, 1.8, 8.5, scotStageG);
scotHill2.scale.set(1.0, 0.58, 1.2);
// Rocky headland & iconic Scottish white lighthouse!
add(new THREE.CylinderGeometry(4.2, 5.4, 3.6, 12), M.cliff, -8.5, 1.8, -5.5, scotStageG);
const lhG = new THREE.Group(); lhG.position.set(-8.5, 3.5, -5.5); scotStageG.add(lhG);
add(new THREE.CylinderGeometry(1.15, 1.65, 8.2, 16), M.lighthouse, 0, 4.1, 0, lhG);
add(new THREE.CylinderGeometry(1.42, 1.32, 0.35, 16), M.iron, 0, 8.25, 0, lhG);
add(new THREE.CylinderGeometry(1.05, 1.05, 1.45, 14), M.warmGlow, 0, 9.15, 0, lhG, { cast: false });
add(new THREE.ConeGeometry(1.28, 1.15, 14), M.waxRed, 0, 10.42, 0, lhG);
// White keeper's cottage beside lighthouse
add(box(3.4, 2.0, 2.6), M.white, -2.5, 1.0, 1.2, lhG);
const lhRoof = add(new THREE.CylinderGeometry(1.85, 1.85, 3.7, 3), M.slate, -2.5, 2.55, 1.2, lhG);
lhRoof.rotation.z = Math.PI / 2; lhRoof.scale.set(1, 1, 0.72);
// Beach pebbles / coastal rocks
for (const [rx_, rz_, rs] of [[0.6, -2.8, 1.1], [1.2, 3.2, 1.3], [-1.8, 4.2, 1.6], [-2.4, -3.5, 1.4]]) {
  const r = add(new THREE.DodecahedronGeometry(rs, 0), M.cliffDark, rx_, 0.35, rz_, scotStageG);
  r.scale.set(1.2, 0.55, 1.0);
}
scotStageG.visible = false;

// =========================================================================
// STAGE 5: NORWEGIAN FJORD & RED BOATHOUSE SHORE — isolated at (360, 0, 0)
// =========================================================================
const norwStageG = new THREE.Group(); norwStageG.position.set(360, 0, 0); scene.add(norwStageG);
// Rocky fjord shoreline shelf
const norwBase = add(new THREE.CylinderGeometry(15.0, 19.5, 2.8, 18), M.snowRock, -13.5, -0.2, 0, norwStageG);
norwBase.scale.set(1.05, 1, 1.3);
// Steep dramatic snow-capped Norwegian fjord peaks behind!
const fPeak1 = add(new THREE.ConeGeometry(14.0, 26.0, 8), M.snowRock, -24.0, 13.0, -7.5, norwStageG);
fPeak1.scale.set(1.0, 1, 1.25);
const fPeak2 = add(new THREE.ConeGeometry(12.0, 22.0, 8), M.snowRock, -22.5, 11.0, 9.5, norwStageG);
// Wooden fjord pier deck right at water's edge (top y = 1.15)
add(tbox(4.8, 0.32, 6.2, 1.6), M.wood, -1.6, 1.0, 0, norwStageG);
for (const [px, pz] of [[-3.5, -2.6], [0.4, -2.6], [-3.5, 2.6], [0.4, 2.6]]) {
  add(new THREE.CylinderGeometry(0.16, 0.16, 1.8, 8), M.woodDark, px, 0.15, pz, norwStageG);
}
// Iconic Red Norwegian Rorbuer Wooden Boathouse on the fjord shore!
const rorbG = new THREE.Group(); rorbG.position.set(-6.4, 1.2, -3.8); norwStageG.add(rorbG);
add(tbox(4.4, 3.0, 5.4, 1.8), M.norwayRed, 0, 1.5, 0, rorbG);
const rRoof = add(new THREE.CylinderGeometry(3.0, 3.0, 5.9, 3), M.pineSnow, 0, 3.85, 0, rorbG);
rRoof.rotation.x = Math.PI / 2; rRoof.rotation.y = Math.PI; rRoof.scale.set(1.05, 1, 0.72);
// Crisp white Scandinavian window frames & door
add(box(0.16, 1.9, 1.15), M.white, 2.22, 0.98, 0, rorbG, { cast: false });
add(box(0.18, 1.72, 0.96), M.woodDark, 2.25, 0.98, 0, rorbG, { cast: false });
for (const wz of [-1.65, 1.65]) {
  add(box(0.16, 1.0, 1.0), M.white, 2.22, 1.72, wz, rorbG, { cast: false });
  add(box(0.19, 0.76, 0.76), M.warmGlow, 2.25, 1.72, wz, rorbG, { cast: false });
}
// Snow-dusted Nordic evergreen pine trees!
const buildPine = (x, y, z, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); norwStageG.add(g);
  add(new THREE.CylinderGeometry(0.16, 0.24, 1.6, 7), M.woodDark, 0, 0.8, 0, g);
  for (let i = 0; i < 3; i++) {
    add(new THREE.ConeGeometry(1.45 - i * 0.34, 2.0, 7), M.pine, 0, 1.9 + i * 1.25, 0, g);
    add(new THREE.ConeGeometry(0.95 - i * 0.22, 0.9, 7), M.pineSnow, 0, 2.55 + i * 1.25, 0, g);
  }
};
buildPine(-7.2, 1.2, 3.4, 1.15);
buildPine(-10.5, 1.5, 5.8, 1.3);
buildPine(-11.2, 1.6, -2.5, 1.25);
buildPine(-9.6, 1.4, -8.5, 1.35);
buildPine(-5.4, 1.2, 5.8, 0.95);
norwStageG.visible = false;

// ---------- painted clouds (CPU-safe 2D canvas, no ink) ----------
const clouds = [];
{
  const r = P.rng(77);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    const pen = new T.Pen(c.getContext('2d', { willReadFrequently: true })); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 520 + r() * 260;
    m.userData.off = new THREE.Vector3(Math.cos(a) * d, 95 + r() * 145, Math.sin(a) * d);
    m.scale.setScalar(135 + r() * 135);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  }
}

// ---------- 2D billboard cards (CPU-safe canvas + NoBlending cardNd) ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM);
cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.56));

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
  farSeaMat.color.set(L.waterDeep);
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
  waterU.chop.value = S.chop ?? 1.1;

  // Active stage toggle
  const stage = S.stage || 'kilda';
  kilda.visible = stage === 'kilda' || stage === 'ocean';
  benchStageG.visible = stage === 'bench';
  mapStageG.visible = stage === 'map';
  scotStageG.visible = stage === 'scotland';
  norwStageG.visible = stage === 'norway';

  const hasSea = stage === 'kilda' || stage === 'ocean' || stage === 'scotland' || stage === 'norway';
  innerSea.visible = farSea.visible = hasSea;
  if (stage === 'scotland') {
    innerSea.position.set(245, 0, 0); farSea.position.set(245, -0.04, 0);
    waterU.shoreCenter.value.set(225.5, 0.0); waterU.shoreRad.value = 16.5;
  } else if (stage === 'norway') {
    innerSea.position.set(365, 0, 0); farSea.position.set(365, -0.04, 0);
    waterU.shoreCenter.value.set(346.5, 0.0); waterU.shoreRad.value = 15.0;
  } else {
    innerSea.position.set(10, 0, 0); farSea.position.set(10, -0.04, 0);
    waterU.shoreCenter.value.set(-24.0, 0.0); waterU.shoreRad.value = 23.0;
  }

  // Calendar & cliff lantern
  calG.visible = !!S.showCalendar;
  if (S.showCalendar) {
    const mIdx = Math.min(calMats.length - 1, Math.max(0, S.monthIdx || 0));
    calFace.material = calMats[mIdx];
    calG.rotation.z = Math.sin(f * 0.45) * 0.04;
  }
  cliffLanternG.visible = !!S.cliffLantern;

  // Supply schooner
  shipG.visible = !!S.ship;
  if (S.ship) {
    shipG.position.set(S.ship.x, Math.sin(t * 2.1) * 0.35 * (S.ship.roll || 1), S.ship.z);
    shipG.rotation.set(Math.cos(t * 1.5) * 0.06 * (S.ship.roll || 1), S.ship.yaw || 0, Math.sin(t * 2.0) * 0.10 * (S.ship.roll || 1));
    shipG.scale.setScalar(S.ship.s || 1);
  }

  // Nautical chart arches
  if (stage === 'map') {
    milesArch.visible = (S.milesProg || 0) > 0;
    if (milesArch.visible) milesArch.scale.set(1, Math.min(1, S.milesProg), 1);
    const mp = S.mysteryProg || 0;
    mysteryArches.forEach((a, i) => {
      a.visible = mp > i * 0.18;
      if (a.visible) a.scale.y = Math.min(1, (mp - i * 0.18) * 3.0);
    });
  }

  // Hero 3D St Kilda Mailboat + Hollow + Scroll + Sheep's Bladder Float
  mailboatG.visible = !!S.boat;
  if (S.boat) {
    mailboatG.position.set(S.boat.x, S.boat.y, S.boat.z);
    mailboatG.rotation.set(S.boat.rx || 0, S.boat.ry || 0, S.boat.rz || 0);
    mailboatG.scale.setScalar(S.boat.s || 1);

    // Lid state: 0 = sealed flush, 1 = open/removed off to side, -1 = hidden (still carving hollow!)
    const lid = S.boat.lid ?? 0;
    boatLidG.visible = lid >= 0;
    if (lid >= 0) {
      boatLidG.position.set(-lid * 0.45, 0.53 + lid * 0.55, -lid * 0.35);
      boatLidG.rotation.set(lid * 0.35, 0, lid * 0.55);
    }

    // Scroll state: visible when S.boat.scrollY !== undefined
    boatScrollG.visible = S.boat.scrollY !== undefined;
    if (boatScrollG.visible) {
      boatScrollG.position.set(0, S.boat.scrollY, 0);
      boatScrollG.rotation.y = (S.boat.scrollSpin || 0);
    }

    // Float state
    floatG.visible = !!S.boat.hasFloat;
    if (floatG.visible) {
      const bob = Math.sin(t * 3.8) * 0.08;
      floatG.rotation.z = (S.boat.floatTilt ?? -0.18) + Math.sin(t * 3.0) * 0.08;
      floatBallG.position.y = 1.56 + bob;
    }
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
  const showClouds = W_.stage !== 'bench' && W_.stage !== 'map';
  for (const c of clouds) {
    c.visible = showClouds;
    if (showClouds) {
      c.position.copy(camera.position).add(c.userData.off);
      c.quaternion.copy(camera.quaternion);
    }
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
  inkU.px.value = (W_.stage === 'map' || W_.stage === 'bench') ? 2.0 : 2.3;
  inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0);
  inkU.vig.value = L.vig ?? 0.18;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);

  // Pass D: strict razor-sharp sRGB copy (cinf always 0)
  dofU.focus.value = D.focus; dofU.cinf.value = 0; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};

window.TOTAL = TOTAL;
window.ready = true;
