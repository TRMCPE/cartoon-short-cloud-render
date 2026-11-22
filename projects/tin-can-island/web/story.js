// Master 22-shot plan for "Tin Can Island" (Niuafo'ou, Pacific) — timed to voice.mp3 (50.29s, 30 fps, TOTAL = 1509).
// Post-audit refined framing: ZERO camera occlusion, 100% razor-sharp (dofAt cinf === 0),
// continuous 3D camera motion, upper-70% hero framing clear of y = 76% Rollo bottom-third subtitles.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1509;

export const SHOTS = [
  { id: 'hook_island',     a: 0,    b: 55,   light: 'tropic' },  // 0.00-1.83  "On one island in the Pacific,"
  { id: 'hook_swim',       a: 56,   b: 119,  light: 'tropic' },  // 1.87-3.97  "the mailman had to swim."
  { id: 'volcano',         a: 120,  b: 209,  light: 'tropic' },  // 4.00-6.97  "Niuafo'ou is a volcano with no harbor,"
  { id: 'rough_surf',      a: 210,  b: 290,  light: 'stormy' },  // 7.00-9.67  "and the surf is too rough for ships to land."
  { id: 'steamship',       a: 291,  b: 344,  light: 'tropic' },  // 9.70-11.47 "So when a steamship appeared,"
  { id: 'paddle_out',      a: 345,  b: 406,  light: 'tropic' },  // 11.50-13.53 "the strongest swimmers paddled out,"
  { id: 'long_poles',      a: 407,  b: 494,  light: 'tropic' },  // 13.57-16.47 "holding the island's letters up on long poles."
  { id: 'buckets',         a: 495,  b: 574,  light: 'tropic' },  // 16.50-19.13 "The crew lifted the letters aboard in buckets."
  { id: 'seal_tin',        a: 575,  b: 676,  light: 'tropic' },  // 19.17-22.53 "Then they sealed the island's new mail inside a biscuit tin,"
  { id: 'throw_sea',       a: 677,  b: 730,  light: 'tropic' },  // 22.57-24.33 "and threw it into the sea."
  { id: 'fight_waves',     a: 731,  b: 781,  light: 'stormy' },  // 24.37-26.03 "The swimmers fought the waves,"
  { id: 'grab_tin',        a: 782,  b: 822,  light: 'tropic' },  // 26.07-27.40 "grabbed the floating tin,"
  { id: 'push_shore',      a: 823,  b: 894,  light: 'tropic' },  // 27.43-29.80 "and pushed it all the way back to shore."
  { id: 'no_dock',         a: 895,  b: 920,  light: 'stormy' },  // 29.83-30.67 "No dock."
  { id: 'no_boat',         a: 921,  b: 948,  light: 'stormy' },  // 30.70-31.60 "No boat."
  { id: 'tin_and_swimmer', a: 949,  b: 1036, light: 'golden' },  // 31.63-34.53 "Just a tin can and a very good swimmer."
  { id: 'took_months',     a: 1037, b: 1112, light: 'sunset' },  // 34.57-37.07 "Letters sometimes took months."
  { id: 'world_noticed',   a: 1113, b: 1165, light: 'studio' },  // 37.10-38.83 "Then the world noticed."
  { id: 'collectors',      a: 1166, b: 1282, light: 'studio' },  // 38.87-42.73 "Collectors everywhere wanted a letter stamped on that tiny island."
  { id: 'new_name',        a: 1283, b: 1335, light: 'studio' },  // 42.77-44.50 "Soon it had a new name:"
  { id: 'tin_can_island',  a: 1336, b: 1388, light: 'studio' },  // 44.53-46.27 "Tin Can Island."
  { id: 'famous_po',       a: 1389, b: 1508, light: 'golden' },  // 46.30-50.27 "An island with no harbor became famous for its post office."
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lighting palettes ----------
export const LIGHTS = {
  tropic: {
    az: 52, el: 46, sky: '#cbe6ff', ground: '#628a94', hemi: 1.24, sun: '#fff5df', sunI: 2.45,
    fog: '#b6e2f8', fogNear: 110, fogFar: 900, skyTop: '#1b72cc', skyHor: '#bce8ff',
    sunDisc: '#fffbe6', sunSize: 0.002, sat: 1.14, waterDeep: '#11588a', waterShal: '#2eb0c2', glint: '#f2fdff', vig: 0.16, shadowExt: 32,
  },
  stormy: {
    az: 35, el: 36, sky: '#a8cae0', ground: '#4a6475', hemi: 1.16, sun: '#e8eff7', sunI: 2.2,
    fog: '#9ec4d9', fogNear: 90, fogFar: 700, skyTop: '#2a5680', skyHor: '#9ec4d9',
    sunDisc: '#e2eef7', sunSize: 0.001, sat: 1.08, waterDeep: '#0d436b', waterShal: '#247f94', glint: '#ffffff', vig: 0.20, shadowExt: 28,
  },
  golden: {
    az: 28, el: 22, sky: '#ffd6b0', ground: '#785a4a', hemi: 1.18, sun: '#ffc478', sunI: 2.75,
    fog: '#f5c79e', fogNear: 100, fogFar: 820, skyTop: '#3c68b2', skyHor: '#ffc987',
    sunDisc: '#fff4c8', sunSize: 0.004, sat: 1.16, gain: '#fff5e6', waterDeep: '#1a4c78', waterShal: '#d99e6c', glint: '#ffe9b8', vig: 0.18, shadowExt: 30,
  },
  sunset: {
    az: 18, el: 16, sky: '#d4a2c4', ground: '#64484c', hemi: 1.14, sun: '#ff9e66', sunI: 2.6,
    fog: '#eba88e', fogNear: 85, fogFar: 720, skyTop: '#4a458a', skyHor: '#ff9d6e',
    sunDisc: '#ffe4a8', sunSize: 0.0048, sat: 1.14, gain: '#ffeede', waterDeep: '#243c6b', waterShal: '#c97c66', glint: '#ffd59c', vig: 0.22, shadowExt: 26,
  },
  studio: {
    az: 58, el: 56, sky: '#fff5e4', ground: '#7d6854', hemi: 1.32, sun: '#fff4dc', sunI: 2.25,
    fog: '#2b4764', fogNear: 120, fogFar: 500, skyTop: '#2b4764', skyHor: '#3a5d80',
    sunDisc: '#000000', sunSize: 0, sat: 1.12, waterDeep: '#11588a', waterShal: '#2eb0c2', glint: '#ffffff', vig: 0.14, shadowExt: 18,
  },
};

export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'hook_island' || S.id === 'volcano') L.shadowExt = 48;
  if (S.id === 'took_months') {
    const t = ramp(f, 1037, 1112);
    L.el = lerp(28, 10, t);
  }
  return L;
};

// ---------- impact camera kicks synced to audio & visual beats ----------
const KICKS = [
  { f: 96,   a: 0.045 },
  { f: 246,  a: 0.055 },
  { f: 656,  a: 0.045 },
  { f: 712,  a: 0.065 },
  { f: 758,  a: 0.040 },
  { f: 796,  a: 0.045 },
  { f: 900,  a: 0.060 },
  { f: 925,  a: 0.060 },
  { f: 1342, a: 0.075 },
];

// ---------- continuous 3D camera choreography (post-audit perfected framing!) ----------
const CAMS = {
  // 1. Aerial sweep over sparkling ocean toward volcanic Niuafo'ou + cliff post office
  hook_island: [
    { f: 0,  pos: [32, 22, 30],   look: [-20, 10.5, -2], fov: 44 },
    { f: 55, pos: [15, 13.0, 18], look: [-18, 9.2, -2],  fov: 40, ease: 'easeOut' },
  ],
  // 2. Low ocean-level tracking beside striped-swimsuit hero mailman swimming
  hook_swim: [
    { f: 56,  pos: [12.8, 1.55, 4.4], look: [8.5, 0.72, 0.0],  fov: 38 },
    { f: 119, pos: [16.8, 1.70, 3.6], look: [13.2, 0.78, 0.0], fov: 35 },
  ],
  // 3. Sweeping orbital climb around the steep dark volcanic cone & sheer cliffs (no harbor!)
  volcano: [
    { f: 120, pos: [20, 10.5, 28],   look: [-24, 11.5, -1], fov: 44 },
    { f: 165, pos: [24, 16.5, 2],    look: [-25, 12.0, -1], fov: 43, path: [[25, 13.5, 16]] },
    { f: 209, pos: [18, 19.0, -24],  look: [-25, 12.0, -1], fov: 42 },
  ],
  // 4. FIXED: Low push-in framing pounding jagged surf rocks + big splashes in foreground AND pitching steamship centered!
  rough_surf: [
    { f: 210, pos: [-2.0, 5.2, 13.5], look: [16.0, 3.8, -1.5], fov: 44, roll: -1.5 },
    { f: 290, pos: [-1.0, 4.5, 10.2], look: [19.5, 4.2, -2.5], fov: 40, roll: 1.5 },
  ],
  // 5. Heroic low-angle dolly-in across swells toward the approaching S.S. TOFUA steamship
  steamship: [
    { f: 291, pos: [5.5, 4.2, 18.5],  look: [27.5, 6.4, -1.0], fov: 44 },
    { f: 344, pos: [11.5, 4.6, 13.0], look: [27.5, 6.4, -0.8], fov: 40, ease: 'easeOut' },
  ],
  // 6. Dynamic side-tracking beside two strong swimmers paddling out toward the ship
  paddle_out: [
    { f: 345, pos: [8.5, 2.0, 7.8],   look: [8.0, 1.05, 0.0],  fov: 42 },
    { f: 406, pos: [15.5, 2.2, 7.2],  look: [14.5, 1.05, 0.0], fov: 40 },
  ],
  // 7. FIXED: Wider crane-up cleanly framing BOTH swimmers + BOTH tall bamboo poles & white letter bundles above y=76%!
  long_poles: [
    { f: 407, pos: [14.2, 1.75, 8.2], look: [16.4, 1.45, 0.0], fov: 43 },
    { f: 452, pos: [15.4, 2.45, 7.8], look: [17.4, 1.75, 0.0], fov: 41 },
    { f: 494, pos: [16.6, 2.95, 7.4], look: [18.6, 1.95, 0.0], fov: 39 },
  ],
  // 8. Rising crane following wooden rope bucket hauled up the black steamship hull!
  buckets: [
    { f: 495, pos: [15.6, 2.4, 8.8],  look: [22.8, 2.7, 2.2],  fov: 42 },
    { f: 574, pos: [16.0, 5.8, 9.2],  look: [23.8, 5.4, 2.2],  fov: 40 },
  ],
  // 9. POLISHED: Wider ON-DECK framing showing full Sailor + full Captain + front-facing "BISCUIT TIN MAIL" tin!
  seal_tin: [
    { f: 575, pos: [26.4, 6.2, 10.6], look: [26.4, 5.4, 3.6],  fov: 42 },
    { f: 630, pos: [26.0, 6.0, 9.4],  look: [26.4, 5.35, 3.6], fov: 39 },
    { f: 676, pos: [25.6, 5.9, 8.6],  look: [26.4, 5.35, 3.6], fov: 37 },
  ],
  // 10. Whip-follow camera tracking the biscuit tin soaring off the ship railing into the sea!
  throw_sea: [
    { f: 677, pos: [19.4, 6.3, 8.2],  look: [24.2, 5.6, 1.6],  fov: 42 },
    { f: 706, pos: [17.2, 4.4, 7.6],  look: [20.4, 3.6, 1.2],  fov: 42, ease: 'easeIn' },
    { f: 730, pos: [16.2, 2.5, 7.0],  look: [18.5, 0.8, 0.6],  fov: 39, ease: 'easeOut' },
  ],
  // 11. FIXED: Wider choppy ocean dolly framing BOTH swimmers + bobbing biscuit tin ahead with low surface splash!
  fight_waves: [
    { f: 731, pos: [11.2, 2.2, 9.2],  look: [15.2, 0.95, 0.2], fov: 44, roll: -2.8 },
    { f: 781, pos: [13.8, 2.35, 8.0], look: [16.8, 0.90, 0.2], fov: 41, roll: 2.4 },
  ],
  // 12. FIXED: Clean medium close-up showing FULL grinning mailman + gleaming floating biscuit tin (zero left-edge crop!)
  grab_tin: [
    { f: 782, pos: [14.6, 1.95, 5.8], look: [17.6, 0.92, 0.4], fov: 39 },
    { f: 822, pos: [15.5, 1.85, 4.9], look: [17.7, 0.88, 0.4], fov: 36, ease: 'easeOut' },
  ],
  // 13. FIXED: Tracking directly alongside both swimmers pushing the biscuit tin back toward the volcanic island & cliff Post Office!
  push_shore: [
    { f: 823, pos: [18.8, 2.8, 6.8],  look: [13.5, 1.2, 0.2],  fov: 42 },
    { f: 894, pos: [10.4, 3.2, 6.6],  look: [4.2, 1.6, 0.0],   fov: 42 },
  ],
  // 14. Punchy cut: rocky surf cliff with giant "No Dock" X signboard
  no_dock: [
    { f: 895, pos: [7.8, 3.6, 3.4],   look: [1.6, 2.9, 0.0],   fov: 40 },
    { f: 920, pos: [7.1, 3.5, 3.0],   look: [1.6, 2.9, 0.0],   fov: 36, ease: 'easeOut' },
  ],
  // 15. Punchy cut: open ocean swells with giant "No Boat" X signboard
  no_boat: [
    { f: 921, pos: [8.4, 3.2, -3.2],  look: [14.2, 2.7, 0.0],  fov: 40 },
    { f: 948, pos: [9.1, 3.1, -2.8],  look: [14.2, 2.7, 0.0],  fov: 36, ease: 'easeOut' },
  ],
  // 16. POLISHED: Triumphant Mailman + Biscuit Tin held clearly BESIDE him (zero face occlusion!)
  tin_and_swimmer: [
    { f: 949,  pos: [4.2, 6.0, 3.2],  look: [-2.4, 5.75, 1.35], fov: 40 },
    { f: 995,  pos: [4.4, 6.05, 1.3], look: [-2.4, 5.75, 1.35], fov: 38, path: [[4.5, 6.02, 2.3]] },
    { f: 1036, pos: [4.0, 6.1, -0.5], look: [-2.4, 5.75, 1.35], fov: 37 },
  ],
  // 17. POLISHED: Side-by-side comic framing — red mailbox (left), flipping calendar (center), bored waiting mailman (right)!
  took_months: [
    { f: 1037, pos: [5.4, 6.2, 2.2],  look: [-2.4, 5.75, 1.15], fov: 44 },
    { f: 1112, pos: [4.3, 6.1, 1.6],  look: [-2.4, 5.75, 1.15], fov: 40 },
  ],
  // 18. Overhead crane-push over 3D Vintage Pacific World Map with golden glowing mail routes!
  world_noticed: [
    { f: 1113, pos: [-120, 14.5, 10.5], look: [-120, 2.0, 0.4], fov: 46 },
    { f: 1165, pos: [-120, 10.6, 7.6],  look: [-120, 2.0, 0.4], fov: 42, ease: 'easeOut' },
  ],
  // 19. FIXED: Wider tracking pan cleanly framing ALL THREE excited international stamp collectors over the Pacific map!
  collectors: [
    { f: 1166, pos: [-121.0, 5.5, 11.4], look: [-120.2, 2.95, -1.6], fov: 45 },
    { f: 1225, pos: [-120.0, 5.3, 10.8], look: [-120.0, 2.95, -1.6], fov: 43 },
    { f: 1282, pos: [-119.0, 5.4, 10.4], look: [-119.8, 2.95, -1.6], fov: 42 },
  ],
  // 20. FIXED: Wider overhead framing showing FULL vintage airmail envelope + Tonga stamp + poised rubber stamp!
  new_name: [
    { f: 1283, pos: [-120.2, 12.6, 6.2], look: [-120.0, 2.15, 0.8], fov: 45 },
    { f: 1335, pos: [-120.0, 11.4, 5.0], look: [-120.0, 2.15, 0.8], fov: 42 },
  ],
  // 21. FIXED: Full unclipped bold crimson "TIN CAN ISLAND • NIUAFO'OU" postmark reveal with wooden desk border!
  tin_can_island: [
    { f: 1336, pos: [-120.0, 11.2, 4.8], look: [-120.0, 2.15, 0.8], fov: 42 },
    { f: 1352, pos: [-119.8, 10.6, 4.0], look: [-119.9, 2.15, 0.8], fov: 40, ease: 'easeOut' },
    { f: 1388, pos: [-119.8, 10.1, 3.4], look: [-119.9, 2.15, 0.8], fov: 39 },
  ],
  // 22. POLISHED: Triumphant sunset-gold crane pullback with 100% unobstructed "TIN CAN ISLAND" Post Office sign!
  famous_po: [
    { f: 1389, pos: [2.6, 7.2, -0.6],   look: [-6.4, 6.4, -1.8],  fov: 39 },
    { f: 1455, pos: [7.6, 8.6, 2.6],    look: [-9.0, 7.1, -1.8],  fov: 43, path: [[5.2, 7.9, 1.0]] },
    { f: 1508, pos: [14.0, 11.4, 7.4],  look: [-13.5, 8.5, -1.8], fov: 46 },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.001, kicks: KICKS });
  c.flash = f >= 1342 && f < 1346 ? (1 - (f - 1342) / 4) * 0.45 : 0;
  if (S.id === 'world_noticed' || S.id === 'collectors' || S.id === 'new_name' || S.id === 'tin_can_island') {
    c.shadowAt = [-120, 2.0, 0.4];
  } else if (S.id === 'steamship' || S.id === 'buckets' || S.id === 'seal_tin' || S.id === 'throw_sea') {
    c.shadowAt = [26, 4.5, 2.5];
  } else if (S.id === 'famous_po' || S.id === 'tin_and_swimmer' || S.id === 'took_months') {
    c.shadowAt = [-5, 5.0, 0.0];
  }
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS RULE: cinf ALWAYS 0 ----------
export const dofAt = (f) => ({ focus: 10, cinf: 0 });

// ---------- animated 3D world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), t = f / 30;
  const W = {
    chop: 1.0,
    ship: true,
    shipX: 28,
    shipZ: 0,
    shipRoll: 1.0,
    bucket: true,
    bucketY: 5.4,
    tin: null,
    famous: false,
    showMailbox: true,
    showCalendar: false,
    monthIdx: 0,
    tableStage: false,
    stampStage: false,
    routes: 0,
    stamped: false,
    stampX: 0.45,
    stampY: 2.3,
    stampZ: 0,
    stampRx: 0,
    stampRy: 0,
    stampRz: 0,
  };

  switch (S.id) {
    case 'hook_island':
      W.ship = false; W.chop = 1.1; break;
    case 'hook_swim':
      W.ship = false; W.chop = 1.3; break;
    case 'volcano':
      W.ship = false; W.chop = 1.25; break;
    case 'rough_surf':
      W.ship = true; W.shipX = 29; W.shipZ = -6; W.shipRoll = 2.6; W.chop = 2.1; break;
    case 'steamship': {
      const k = M.easeOut(ramp(f, 291, 344));
      W.shipX = lerp(34, 28, k); W.shipRoll = 1.2; W.chop = 1.2; break;
    }
    case 'paddle_out':
    case 'long_poles':
      W.shipX = 28; W.chop = 1.3; W.bucketY = 2.6; break;
    case 'buckets': {
      const k = M.smooth(ramp(f, 500, 566));
      W.bucketY = lerp(1.5, 5.5, k); W.chop = 1.1; break;
    }
    case 'seal_tin': {
      // Sits cleanly on wooden deck crate at world (26.4, 5.42, 3.8) — label rotated cleanly toward +Z camera!
      const closeK = M.easeIn(ramp(f, 642, 656));
      W.tin = { x: 26.4, y: 5.46, z: 3.8, s: 0.96, ry: -Math.PI * 0.5, lidOpen: 1 - closeK };
      break;
    }
    case 'throw_sea': {
      const k = ramp(f, 682, 712);
      if (f < 712) {
        const x = lerp(24.6, 18.6, k);
        const y = lerp(5.7, 0.28, k) + Math.sin(k * Math.PI) * 3.1;
        const z = lerp(1.5, 0.5, k);
        W.tin = { x, y, z, s: 1.05, rx: k * 6.5, ry: -0.6, rz: k * 4.8, lidOpen: 0 };
      } else {
        const bob = Math.sin((f - 712) * 0.25) * 0.14;
        W.tin = { x: 18.6, y: 0.30 + bob, z: 0.5, s: 1.05, rx: 0.22 * Math.sin(t * 3), ry: -0.6, rz: 0.18 * Math.cos(t * 2.6), lidOpen: 0 };
      }
      W.chop = 1.4;
      break;
    }
    case 'fight_waves':
      W.chop = 2.0;
      W.tin = { x: 18.4, y: 0.36 + Math.sin(t * 3.8) * 0.22, z: 0.4, s: 1.08, rx: 0.28 * Math.sin(t * 3.2), ry: -0.4, rz: 0.22 * Math.cos(t * 2.8) };
      break;
    case 'grab_tin': {
      const bob = Math.sin(t * 3.2) * 0.12;
      W.tin = { x: 18.3, y: 0.38 + bob, z: 0.4, s: 1.08, rx: 0.12 * Math.sin(t * 2.8), ry: -0.4 + t * 0.4 };
      W.chop = 1.4;
      break;
    }
    case 'push_shore': {
      const k = M.smooth(ramp(f, 823, 894));
      W.tin = { x: lerp(14.5, 4.8, k), y: 0.40 + Math.sin(t * 3.6) * 0.14, z: 0.3, s: 1.12, rx: 0.15 * Math.sin(t * 3), ry: -0.5 };
      W.chop = 1.35;
      break;
    }
    case 'no_dock':
    case 'no_boat':
      W.ship = false; W.chop = 1.6; break;
    case 'tin_and_swimmer':
      // Held heroically RIGHT BESIDE the smiling mailman (same x = -2.4, offset along z -> zero face occlusion!)
      W.ship = false; W.chop = 0.9;
      W.tin = { x: -2.35, y: 6.18 + Math.sin(t * 2.8) * 0.05, z: 0.65, s: 0.72, ry: 0.0 + Math.sin(t * 1.4) * 0.25 };
      break;
    case 'took_months': {
      W.ship = false; W.chop = 0.8; W.showCalendar = true;
      W.monthIdx = Math.min(4, Math.floor(ramp(f, 1042, 1106) * 5));
      break;
    }
    case 'world_noticed':
      W.ship = false; W.tableStage = true;
      W.routes = M.easeOut(ramp(f, 1118, 1160));
      break;
    case 'collectors':
      W.ship = false; W.tableStage = true; W.routes = 1.0;
      break;
    case 'new_name': {
      const hover = Math.sin(t * 4) * 0.14;
      W.ship = false; W.tableStage = true; W.stampStage = true; W.stamped = false;
      W.stampX = 0.45; W.stampY = 2.0 + hover; W.stampZ = 0.0; W.stampRz = -0.14;
      break;
    }
    case 'tin_can_island': {
      W.ship = false; W.tableStage = true; W.stampStage = true;
      if (f < 1342) {
        const k = M.easeIn(ramp(f, 1336, 1342));
        W.stampX = 0.45; W.stampY = lerp(2.0, 0.18, k); W.stampZ = 0; W.stamped = false;
      } else if (f < 1352) {
        W.stampX = 0.45; W.stampY = 0.18; W.stampZ = 0; W.stamped = true;
      } else {
        const lift = M.easeOut(ramp(f, 1352, 1372));
        W.stampX = lerp(0.45, 3.6, lift); W.stampY = lerp(0.18, 3.8, lift); W.stampZ = lerp(0, -2.0, lift);
        W.stampRz = lift * 0.45; W.stamped = true;
      }
      break;
    }
    case 'famous_po':
      W.ship = true; W.shipX = 34; W.shipZ = -6; W.famous = true; W.chop = 0.9;
      W.tin = { x: -5.1, y: 6.25 + Math.sin(t * 3) * 0.04, z: -0.5, s: 0.78, ry: -0.4 + t * 0.9 };
      break;
  }
  return W;
};

// ---------- 2D bean-head billboard actors ----------
const C = (T, role, o, pos, extra = {}) => ({
  key: role + JSON.stringify(o),
  draw: (p) => T.islandChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffebd6' : S.light === 'sunset' ? '#ffd9c2' : '#ffffff';
  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 'hook_swim': {
      const k = ramp(f, 56, 119);
      const x = lerp(8.5, 13.4, k), sw = q((f * 0.34) % 6.283, 1);
      out.push(C(T, 'mailman', {
        ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'up', letter: true,
        expr: 'determined', facing: 1, look: 0.5,
      }, [x, 0.25 + Math.sin(f * 0.24) * 0.08, 0], { tint, blob: false }));
      break;
    }
    case 'steamship': {
      out.push(C(T, 'captain', { ...id(11), seed: 11, L: 'bino', R: 'bino', binoculars: true, expr: 'stern', facing: -1 }, [25.6, 7.45, -1.2], { tint, ground: 7.45 }));
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'wave', R: 'hang', wv: q(f * 0.35, 1), expr: 'grin', facing: -1 }, [25.2, 4.35, 2.2], { tint, ground: 4.35 }));
      break;
    }
    case 'paddle_out': {
      const k = ramp(f, 345, 406);
      const sw = q((f * 0.38) % 6.283, 1);
      const x1 = lerp(7.8, 15.2, k), x2 = lerp(6.6, 13.6, k);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'pole', pole: true, expr: 'determined', facing: 1 }, [x1, 0.26 + Math.sin(f * 0.24) * 0.09, 0.55], { tint, blob: false }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.38 + 2.1) % 6.283, 1), L: 'swim', R: 'pole', pole: true, expr: 'effort', facing: 1 }, [x2, 0.26 + Math.cos(f * 0.22) * 0.09, -0.75], { tint, blob: false }));
      break;
    }
    case 'long_poles': {
      const k = ramp(f, 407, 494);
      const sw = q((f * 0.32) % 6.283, 1);
      const x1 = lerp(16.6, 19.4, k), x2 = lerp(15.3, 18.1, k);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'pole', pole: true, expr: 'determined', facing: 1 }, [x1, 0.32 + Math.sin(f * 0.22) * 0.08, 0.45], { tint, blob: false, s: 1.05 }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.32 + 1.8) % 6.283, 1), L: 'swim', R: 'pole', pole: true, expr: 'determined', facing: 1 }, [x2, 0.32 + Math.cos(f * 0.22) * 0.08, -0.65], { tint, blob: false, s: 1.02 }));
      break;
    }
    case 'buckets': {
      const pull = q((f * 0.42) % 6.283, 1);
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'haul', R: 'haul', swimPhase: pull, expr: 'effort', facing: -1 }, [25.1, 4.35, 1.5], { tint, ground: 4.35 }));
      out.push(C(T, 'sailorB', { ...id(13), seed: 13, L: 'haul', R: 'haul', swimPhase: q((f * 0.42 + 1.4) % 6.283, 1), expr: 'grin', facing: -1 }, [25.1, 4.35, 3.0], { tint, ground: 4.35 }));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: q((f * 0.2) % 6.283, 1), L: 'wave', R: 'hang', wv: q(f * 0.3, 1), expr: 'grin', facing: 1 }, [21.0, 0.26, 2.2], { tint, blob: false }));
      break;
    }
    case 'seal_tin': {
      // Standing clearly beside the wooden crate on open deck!
      const doneSeal = f >= 656;
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'hold', R: doneSeal ? 'up' : 'hold', letter: !doneSeal, expr: doneSeal ? 'grin' : 'determined', facing: 1 }, [25.7, 4.35, 3.0], { tint, ground: 4.35 }));
      out.push(C(T, 'captain', { ...id(11), seed: 11, L: 'hip', R: 'point', expr: doneSeal ? 'smile' : 'stern', facing: -1 }, [27.3, 4.35, 3.1], { tint, ground: 4.35 }));
      break;
    }
    case 'throw_sea': {
      const threw = f >= 682;
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'hang', R: threw ? 'throw' : 'hold', expr: threw ? 'laugh' : 'effort', facing: -1 }, [25.0, 4.35, 1.6], { tint, ground: 4.35 }));
      out.push(C(T, 'sailorB', { ...id(13), seed: 13, L: 'wave', R: 'hip', wv: q(f * 0.35, 1), expr: 'grin', facing: -1 }, [25.2, 4.35, 2.9], { tint, ground: 4.35 }));
      break;
    }
    case 'fight_waves': {
      const k = ramp(f, 731, 781);
      const sw = q((f * 0.45) % 6.283, 1);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'swim', expr: 'effort', facing: 1 }, [lerp(14.4, 17.0, k), 0.32 + Math.sin(f * 0.32) * 0.14, 0.4], { tint, blob: false }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.45 + 2.0) % 6.283, 1), L: 'swim', R: 'swim', expr: 'determined', facing: 1 }, [lerp(13.0, 15.6, k), 0.32 + Math.cos(f * 0.3) * 0.14, -0.7], { tint, blob: false }));
      break;
    }
    case 'grab_tin': {
      const k = M.easeOut(ramp(f, 782, 810));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: q((f * 0.28) % 6.283, 1), L: 'push', R: 'push', expr: f > 796 ? 'grin' : 'determined', facing: 1 }, [lerp(16.6, 17.25, k), 0.32 + Math.sin(f * 0.22) * 0.08, 0.4], { tint, blob: false, s: 1.04 }));
      break;
    }
    case 'push_shore': {
      const k = M.smooth(ramp(f, 823, 894));
      const x = lerp(15.6, 5.9, k);
      const sw = q((f * 0.38) % 6.283, 1);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'push', R: 'push', expr: 'grin', facing: -1 }, [x, 0.32 + Math.sin(f * 0.24) * 0.09, 0.35], { tint, blob: false }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.38 + 2.0) % 6.283, 1), L: 'swim', R: 'swim', expr: 'determined', facing: -1 }, [x + 1.45, 0.32 + Math.cos(f * 0.24) * 0.09, -0.7], { tint, blob: false }));
      break;
    }
    case 'tin_and_swimmer': {
      // Standing heroically on open cliff top (y = 4.60), beside the gleaming biscuit tin!
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'up', R: 'hip', expr: 'laugh', facing: 1 }, [-2.45, 4.60, 1.75], { tint, ground: 4.60, s: 1.06 }));
      break;
    }
    case 'took_months': {
      // Waiting patiently on the right side beside the flipping calendar (center) & red mailbox (left)!
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'hip', R: 'hang', expr: 'bored', facing: -1, look: -0.4 }, [-2.40, 4.60, 2.35], { tint, ground: 4.60, s: 1.02 }));
      break;
    }
    case 'collectors': {
      // Tighter spacing so ALL 3 international stamp collectors fit cleanly with side margins!
      const bounce = (s) => q(Math.abs(Math.sin((f + s) * 0.24)) * 0.03, 3);
      out.push(C(T, 'collectorA', { ...id(21), seed: 21, bob: bounce(0), L: 'wave', R: 'up', magnify: true, wv: q(f * 0.32, 1), expr: 'excited', facing: 1 }, [-121.15, 1.55, -2.4], { ground: 2.04, blob: false, s: 1.04 }));
      out.push(C(T, 'collectorB', { ...id(22), seed: 22, bob: bounce(5), L: 'hold', R: 'up', album: true, letter: true, expr: 'laugh', facing: 0 }, [-120.0, 1.55, -2.6], { ground: 2.04, blob: false, s: 1.06 }));
      out.push(C(T, 'collectorC', { ...id(23), seed: 23, bob: bounce(9), L: 'up', R: 'wave', letter: true, wv: q(f * 0.36 + 1, 1), expr: 'grin', facing: -1 }, [-118.85, 1.55, -2.4], { ground: 2.04, blob: false, s: 1.04 }));
      break;
    }
    case 'famous_po': {
      // Postmaster & hero Mailman standing prominently right in front of the famous TIN CAN ISLAND Post Office!
      out.push(C(T, 'postmaster', { ...id(31), seed: 31, L: 'wave', R: 'up', stamp: true, wv: q(f * 0.32, 1), expr: 'laugh', facing: 1 }, [-5.3, 4.60, -2.65], { tint, ground: 4.60, s: 1.06 }));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'hip', R: 'up', expr: 'grin', facing: 1 }, [-5.3, 4.60, -1.05], { tint, ground: 4.60, s: 1.08 }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects & punchy graphic cards ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  if (S.id === 'hook_island' || S.id === 'volcano' || S.id === 'famous_po') {
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.008 + i * 0.33) % 1), 2);
      out.push(FX('vsteam' + k, (p) => T.fxSteam(p, k, '#e8eef5'), [-31.5 + k * 4.5, 26.8 + k * 9.5, -1.5 + Math.sin(i * 2) * 1.5], 4.2 + k * 2.5));
    }
  }

  if (S.id === 'steamship' || S.id === 'rough_surf' || S.id === 'paddle_out' || S.id === 'buckets' || S.id === 'famous_po') {
    const sx = S.id === 'rough_surf' ? 29 : S.id === 'famous_po' ? 34 : 28;
    const sz = S.id === 'rough_surf' || S.id === 'famous_po' ? -10.4 : -4.4;
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.015 + i * 0.33) % 1), 2);
      out.push(FX('ssteam' + k, (p) => T.fxSteam(p, k, '#f5f8fc'), [sx - k * 5.2, 14.2 + k * 6.5, sz - k * 2.5], 2.2 + k * 2.0));
    }
  }

  // Big cartoon ocean surf splashes pounding the volcanic rocks in foreground of Shot 4!
  if (S.id === 'rough_surf') {
    const t1 = q(((f - 210) % 34) / 34, 2);
    const t2 = q(((f - 226) % 38) / 38, 2);
    out.push(FX('spl1_' + t1, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t1); }, [3.4, 0.0, 3.8], 2.6));
    out.push(FX('spl2_' + t2, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t2); }, [4.2, 0.0, -1.6], 2.9));
  }

  // Hero splash when biscuit tin plunges into the sea (Shot 10!)
  if (S.id === 'throw_sea' && f >= 711) {
    const t = q(clamp((f - 711) / 20), 2);
    out.push(FX('tinspl_' + t, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [18.6, 0.0, 0.5], 2.6));
  }

  // Clean 3D animated swells in fight_waves (removed flat floating splash card)

  if (S.id === 'no_dock') {
    const pop = M.back(ramp(f, 895, 904), 1.9);
    out.push(FX('nodock', (p) => T.fxNoDock(p), [1.6, 2.25, 0.0], 1.15 * Math.max(0.05, pop), { order: 6 }));
  }
  if (S.id === 'no_boat') {
    const pop = M.back(ramp(f, 921, 930), 1.9);
    out.push(FX('noboat', (p) => T.fxNoBoat(p), [14.2, 2.05, 0.0], 1.15 * Math.max(0.05, pop), { order: 6 }));
  }

  if (S.id === 'tin_and_swimmer') {
    const ph = q((f * 0.06) % 6.28, 1);
    out.push(FX('spk_' + ph, (p) => T.fxSparkle(p, ph), [-2.35, 5.55, 0.65], 0.95));
  }
  if (S.id === 'tin_can_island' && f >= 1344) {
    const t = q(clamp((f - 1344) / 24), 2);
    if (t < 1) out.push(FX('burst_' + t, (p) => { p.g.translate(50, 250); p.g.scale(1.0, 1.0); T.fxBurst(p, t, '#ffd84a', 12, 40, 220); }, [-119.6, 2.25, 0.8], 1.55));
  }
  if (S.id === 'famous_po') {
    const ph = q((f * 0.05) % 6.28, 1);
    out.push(FX('fspk_' + ph, (p) => T.fxSparkle(p, ph), [-5.6, 6.7, -1.8], 1.95));
  }

  return out;
};
