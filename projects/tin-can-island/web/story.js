// Master 22-shot plan for "Tin Can Island" (Niuafo'ou, Pacific) — timed to voice.mp3 (50.29s, 30 fps, TOTAL = 1509).
// Strict locks: dofAt cinf === 0 on EVERY frame, continuous 3D camera motion (zero static holds),
// upper-70% hero framing clear of y = 76% Rollo bottom-third subtitles, idle() + blinkAt() on all characters.
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

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
    az: 52, el: 46, sky: '#cbe6ff', ground: '#628a94', hemi: 1.22, sun: '#fff5df', sunI: 2.45,
    fog: '#b6e2f8', fogNear: 95, fogFar: 850, skyTop: '#1b72cc', skyHor: '#bce8ff',
    sunDisc: '#fffbe6', sunSize: 0.002, sat: 1.14, waterDeep: '#11588a', waterShal: '#2eb0c2', glint: '#f2fdff', vig: 0.16, shadowExt: 32,
  },
  stormy: {
    az: 35, el: 34, sky: '#9ec0d8', ground: '#4a6475', hemi: 1.12, sun: '#e8eff7', sunI: 2.15,
    fog: '#98bfd6', fogNear: 70, fogFar: 620, skyTop: '#2a5680', skyHor: '#9ec4d9',
    sunDisc: '#e2eef7', sunSize: 0.001, sat: 1.08, waterDeep: '#0d436b', waterShal: '#247f94', glint: '#ffffff', vig: 0.22, shadowExt: 28,
  },
  golden: {
    az: 24, el: 18, sky: '#ffd6b0', ground: '#785a4a', hemi: 1.12, sun: '#ffc478', sunI: 2.75,
    fog: '#f5c79e', fogNear: 90, fogFar: 780, skyTop: '#3c68b2', skyHor: '#ffc987',
    sunDisc: '#fff4c8', sunSize: 0.004, sat: 1.16, gain: '#fff5e6', waterDeep: '#1a4c78', waterShal: '#d99e6c', glint: '#ffe9b8', vig: 0.20, shadowExt: 30,
  },
  sunset: {
    az: 12, el: 10, sky: '#c490b8', ground: '#5e4244', hemi: 1.05, sun: '#ff965a', sunI: 2.6,
    fog: '#e8a288', fogNear: 75, fogFar: 680, skyTop: '#4a458a', skyHor: '#ff9d6e',
    sunDisc: '#ffe4a8', sunSize: 0.0048, sat: 1.14, gain: '#ffeede', waterDeep: '#243c6b', waterShal: '#c97c66', glint: '#ffd59c', vig: 0.24, shadowExt: 24,
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
    L.el = lerp(26, 7, t);
  }
  return L;
};

// ---------- impact camera kicks synced to audio & visual beats ----------
const KICKS = [
  { f: 96,   a: 0.045 }, // "swim!" splash kick
  { f: 246,  a: 0.055 }, // rough surf crash on rocks
  { f: 656,  a: 0.045 }, // biscuit tin lid slams shut
  { f: 712,  a: 0.065 }, // biscuit tin splashes into ocean!
  { f: 758,  a: 0.040 }, // wave swell hit
  { f: 796,  a: 0.045 }, // swimmer grabs floating tin
  { f: 900,  a: 0.060 }, // "No dock." slam
  { f: 925,  a: 0.060 }, // "No boat." slam
  { f: 1342, a: 0.075 }, // "Tin Can Island." rubber stamp SLAM!
];

// ---------- continuous 3D camera choreography (zero static holds!) ----------
const CAMS = {
  // 1. Aerial sweep over sparkling ocean toward volcanic Niuafo'ou + cliff post office
  hook_island: [
    { f: 0,  pos: [34, 24, 34],   look: [-20, 10, -2], fov: 44 },
    { f: 55, pos: [16, 13.5, 19], look: [-18, 9, -2],  fov: 40, ease: 'easeOut' },
  ],
  // 2. Snap down to ocean level! Close tracking beside hero striped-swimsuit mailman swimming
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
  // 4. Low surf push-in past pounding volcanic sea stacks toward distant pitching steamship
  rough_surf: [
    { f: 210, pos: [7.5, 2.5, 10.5],  look: [12.0, 2.8, -1.0], fov: 44, roll: -1.5 },
    { f: 290, pos: [5.2, 2.2, 7.6],   look: [17.0, 3.6, -0.5], fov: 41, roll: 1.5 },
  ],
  // 5. Heroic low-angle dolly-in across swells toward the approaching S.S. TOFUA steamship
  steamship: [
    { f: 291, pos: [9.5, 3.8, 15.5],  look: [28.0, 6.2, -1.0], fov: 42 },
    { f: 344, pos: [13.8, 4.4, 10.8], look: [27.5, 6.4, -0.8], fov: 37, ease: 'easeOut' },
  ],
  // 6. Dynamic side-tracking beside two strong swimmers paddling out toward the ship
  paddle_out: [
    { f: 345, pos: [8.5, 2.0, 7.4],   look: [8.0, 0.95, 0.0],  fov: 42 },
    { f: 406, pos: [15.5, 2.2, 6.8],  look: [14.5, 0.95, 0.0], fov: 40 },
  ],
  // 7. Crane upward from the water following tall bamboo poles holding dry envelopes aloft!
  long_poles: [
    { f: 407, pos: [15.2, 1.45, 5.6], look: [16.5, 1.35, 0.0], fov: 42 },
    { f: 452, pos: [15.8, 2.55, 5.2], look: [17.8, 2.05, 0.0], fov: 40 },
    { f: 494, pos: [16.8, 3.10, 5.0], look: [19.0, 2.25, 0.0], fov: 38 },
  ],
  // 8. Rising crane following wooden rope bucket hauled up the black steamship hull!
  buckets: [
    { f: 495, pos: [16.2, 2.3, 8.2],  look: [22.8, 2.6, 2.2],  fov: 40 },
    { f: 574, pos: [16.6, 5.8, 8.6],  look: [23.6, 5.4, 2.2],  fov: 38 },
  ],
  // 9. Tight orbit on sunny wooden ship deck: crew sealing fresh letters inside 3D Biscuit Tin
  seal_tin: [
    { f: 575, pos: [21.6, 6.2, 5.4],  look: [25.6, 5.2, 1.5],  fov: 36 },
    { f: 630, pos: [22.4, 6.0, 3.4],  look: [25.6, 5.15, 1.5], fov: 33 },
    { f: 676, pos: [22.0, 5.9, 1.8],  look: [25.6, 5.15, 1.5], fov: 31 },
  ],
  // 10. Whip-follow camera tracking the biscuit tin soaring off the ship railing into the sea!
  throw_sea: [
    { f: 677, pos: [19.8, 6.2, 7.6],  look: [24.2, 5.6, 1.6],  fov: 42 },
    { f: 706, pos: [17.5, 4.4, 7.2],  look: [20.4, 3.6, 1.2],  fov: 42, ease: 'easeIn' },
    { f: 730, pos: [16.5, 2.5, 6.6],  look: [18.5, 0.8, 0.6],  fov: 39, ease: 'easeOut' },
  ],
  // 11. Energetic choppy ocean dolly with subtle Dutch roll as swimmers fight waves toward tin
  fight_waves: [
    { f: 731, pos: [11.5, 1.85, 6.6], look: [15.5, 0.85, 0.3], fov: 42, roll: -3.2 },
    { f: 781, pos: [14.2, 2.15, 5.4], look: [17.8, 0.80, 0.3], fov: 39, roll: 2.8 },
  ],
  // 12. Fast punch-in close-up as hero mailman grabs the bobbing gleaming biscuit tin!
  grab_tin: [
    { f: 782, pos: [15.0, 1.65, 4.2], look: [17.8, 0.72, 0.4], fov: 36 },
    { f: 822, pos: [16.2, 1.55, 3.3], look: [18.0, 0.70, 0.4], fov: 31, ease: 'easeOut' },
  ],
  // 13. Sweeping tracking crane pushing back toward volcanic island & cliff Post Office
  push_shore: [
    { f: 823, pos: [16.8, 2.6, 7.6],  look: [10.0, 1.8, 0.0],  fov: 43 },
    { f: 894, pos: [6.8, 3.4, 7.8],   look: [-4.5, 2.8, -0.5], fov: 42 },
  ],
  // 14. Punchy cut: empty rocky surf cliff with giant "No Dock" X signboard
  no_dock: [
    { f: 895, pos: [7.8, 3.6, 3.4],   look: [1.6, 2.9, 0.0],   fov: 40 },
    { f: 920, pos: [7.1, 3.5, 3.0],   look: [1.6, 2.9, 0.0],   fov: 36, ease: 'easeOut' },
  ],
  // 15. Punchy cut: open ocean swells with giant "No Boat" X signboard
  no_boat: [
    { f: 921, pos: [8.4, 3.2, -3.2],  look: [14.2, 2.7, 0.0],  fov: 40 },
    { f: 948, pos: [9.1, 3.1, -2.8],  look: [14.2, 2.7, 0.0],  fov: 36, ease: 'easeOut' },
  ],
  // 16. Heroic sunlit low-angle orbit around triumphant mailman holding biscuit tin on shore
  tin_and_swimmer: [
    { f: 949,  pos: [3.2, 3.35, 2.8],  look: [-2.4, 3.15, 0.2], fov: 38 },
    { f: 995,  pos: [3.4, 3.45, 0.2],  look: [-2.4, 3.15, 0.2], fov: 36, path: [[3.5, 3.4, 1.5]] },
    { f: 1036, pos: [3.0, 3.55, -2.2], look: [-2.4, 3.15, 0.2], fov: 35 },
  ],
  // 17. Golden-to-sunset dolly past waiting mailman, wooden mailbox, and flipping 3D calendar
  took_months: [
    { f: 1037, pos: [4.8, 3.6, 2.2],  look: [-2.2, 3.25, -0.8], fov: 40 },
    { f: 1112, pos: [3.6, 3.5, 1.5],  look: [-2.2, 3.25, -0.8], fov: 36 },
  ],
  // 18. Overhead crane-push over 3D Vintage Pacific World Map with golden glowing mail routes!
  world_noticed: [
    { f: 1113, pos: [-120, 14.5, 10.5], look: [-120, 2.0, 0.4], fov: 46 },
    { f: 1165, pos: [-120, 10.6, 7.6],  look: [-120, 2.0, 0.4], fov: 42, ease: 'easeOut' },
  ],
  // 19. Lively tracking pan across the map table as 3 excited worldwide collectors lean in!
  collectors: [
    { f: 1166, pos: [-121.6, 5.2, 9.0], look: [-120.5, 3.05, -1.6], fov: 44 },
    { f: 1225, pos: [-120.0, 5.0, 8.6], look: [-120.0, 3.05, -1.6], fov: 42 },
    { f: 1282, pos: [-118.4, 5.1, 8.2], look: [-119.6, 3.05, -1.6], fov: 40 },
  ],
  // 20. Dramatic rising focus over giant 3D Airmail Envelope with wooden rubber stamp poised above
  new_name: [
    { f: 1283, pos: [-120.4, 8.6, 5.8], look: [-120.0, 2.15, 0.7], fov: 39 },
    { f: 1335, pos: [-120.0, 7.9, 4.4], look: [-120.0, 2.15, 0.7], fov: 36 },
  ],
  // 21. BAM! Rubber stamp slams down and lifts to reveal bold crimson "TIN CAN ISLAND" postmark!
  tin_can_island: [
    { f: 1336, pos: [-120.0, 7.8, 4.2], look: [-120.0, 2.15, 0.7], fov: 36 },
    { f: 1352, pos: [-120.0, 7.2, 3.2], look: [-120.0, 2.15, 0.7], fov: 34, ease: 'easeOut' },
    { f: 1388, pos: [-120.0, 6.9, 2.5], look: [-120.0, 2.15, 0.7], fov: 32 },
  ],
  // 22. Triumphant sunset-gold crane pullback from the famous Niuafo'ou "TIN CAN ISLAND" Post Office!
  famous_po: [
    { f: 1389, pos: [2.8, 6.8, 2.6],    look: [-6.4, 6.4, -1.8],  fov: 38 },
    { f: 1455, pos: [7.6, 8.4, 6.2],    look: [-9.2, 7.2, -1.8],  fov: 42, path: [[5.2, 7.5, 4.4]] },
    { f: 1508, pos: [14.5, 11.2, 11.5], look: [-14.0, 8.6, -1.8], fov: 45 },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.001, kicks: KICKS });
  // Crisp short white impact flash on the rubber stamp reveal
  c.flash = f >= 1342 && f < 1346 ? (1 - (f - 1342) / 4) * 0.45 : 0;
  if (S.id === 'world_noticed' || S.id === 'collectors' || S.id === 'new_name' || S.id === 'tin_can_island') {
    c.shadowAt = [-120, 2.0, 0.4];
  } else if (S.id === 'steamship' || S.id === 'buckets' || S.id === 'seal_tin' || S.id === 'throw_sea') {
    c.shadowAt = [26, 4.0, 1.0];
  } else if (S.id === 'famous_po') {
    c.shadowAt = [-8, 5.5, -1.8];
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
      W.ship = true; W.shipX = 38; W.shipZ = -6; W.shipRoll = 2.6; W.chop = 2.1; break;
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
      const closeK = M.easeIn(ramp(f, 642, 656));
      W.tin = { x: 25.5, y: 4.92, z: 1.5, s: 1.05, ry: t * 0.5, lidOpen: 1 - closeK };
      break;
    }
    case 'throw_sea': {
      const k = ramp(f, 682, 712);
      if (f < 712) {
        const x = lerp(24.6, 18.6, k);
        const y = lerp(5.7, 0.25, k) + Math.sin(k * Math.PI) * 3.1;
        const z = lerp(1.5, 0.5, k);
        W.tin = { x, y, z, s: 1.05, rx: k * 7.5, rz: k * 5.2, lidOpen: 0 };
      } else {
        const bob = Math.sin((f - 712) * 0.25) * 0.14;
        W.tin = { x: 18.6, y: 0.25 + bob, z: 0.5, s: 1.05, rx: 0.22 * Math.sin(t * 3), rz: 0.18 * Math.cos(t * 2.6), lidOpen: 0 };
      }
      W.chop = 1.4;
      break;
    }
    case 'fight_waves':
      W.chop = 2.0;
      W.tin = { x: 18.4, y: 0.34 + Math.sin(t * 3.8) * 0.22, z: 0.4, s: 1.08, rx: 0.28 * Math.sin(t * 3.2), rz: 0.22 * Math.cos(t * 2.8) };
      break;
    case 'grab_tin': {
      const bob = Math.sin(t * 3.2) * 0.12;
      W.tin = { x: 18.2, y: 0.36 + bob, z: 0.4, s: 1.12, rx: 0.14 * Math.sin(t * 2.8), ry: t * 0.7 };
      W.chop = 1.4;
      break;
    }
    case 'push_shore': {
      const k = M.smooth(ramp(f, 823, 894));
      W.tin = { x: lerp(15.2, 2.2, k), y: 0.38 + Math.sin(t * 3.6) * 0.14, z: 0.3, s: 1.12, rx: 0.15 * Math.sin(t * 3), ry: -0.6 };
      W.chop = 1.35;
      break;
    }
    case 'no_dock':
    case 'no_boat':
      W.ship = false; W.chop = 1.6; break;
    case 'tin_and_swimmer':
      W.ship = false; W.chop = 0.9;
      W.tin = { x: -1.62, y: 3.72 + Math.sin(t * 2.8) * 0.05, z: 0.42, s: 0.92, ry: t * 0.9 };
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
        W.stampX = lerp(0.45, 3.2, lift); W.stampY = lerp(0.18, 3.6, lift); W.stampZ = lerp(0, -1.8, lift);
        W.stampRz = lift * 0.45; W.stamped = true;
      }
      break;
    }
    case 'famous_po':
      W.ship = true; W.shipX = 34; W.shipZ = -6; W.famous = true; W.chop = 0.9;
      W.tin = { x: -5.9, y: 6.45 + Math.sin(t * 3) * 0.04, z: -0.75, s: 0.78, ry: t * 1.1 };
      break;
  }
  return W;
};

// ---------- 2D bean-head billboard actors (idle + blinkAt on every character) ----------
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
      // Captain peering with binoculars on bridge + sailor waving on main deck
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
      const x1 = lerp(16.2, 19.6, k), x2 = lerp(14.8, 18.0, k);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'pole', pole: true, expr: 'determined', facing: 1 }, [x1, 0.28 + Math.sin(f * 0.22) * 0.08, 0.45], { tint, blob: false, s: 1.05 }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.32 + 1.8) % 6.283, 1), L: 'swim', R: 'pole', pole: true, expr: 'determined', facing: 1 }, [x2, 0.28 + Math.cos(f * 0.22) * 0.08, -0.65], { tint, blob: false, s: 1.02 }));
      break;
    }
    case 'buckets': {
      // Two sailors hauling the bucket rope on ship deck + swimmer waiting right below!
      const pull = q((f * 0.42) % 6.283, 1);
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'haul', R: 'haul', swimPhase: pull, expr: 'effort', facing: -1 }, [25.1, 4.35, 1.5], { tint, ground: 4.35 }));
      out.push(C(T, 'sailorB', { ...id(13), seed: 13, L: 'haul', R: 'haul', swimPhase: q((f * 0.42 + 1.4) % 6.283, 1), expr: 'grin', facing: -1 }, [25.1, 4.35, 3.0], { tint, ground: 4.35 }));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: q((f * 0.2) % 6.283, 1), L: 'wave', R: 'hang', wv: q(f * 0.3, 1), expr: 'grin', facing: 1 }, [21.0, 0.26, 2.2], { tint, blob: false }));
      break;
    }
    case 'seal_tin': {
      const doneSeal = f >= 656;
      out.push(C(T, 'sailorA', { ...id(12), seed: 12, L: 'hold', R: doneSeal ? 'up' : 'hold', letter: !doneSeal, expr: doneSeal ? 'grin' : 'determined', facing: 1 }, [25.8, 4.35, 2.45], { tint, ground: 4.35 }));
      out.push(C(T, 'captain', { ...id(11), seed: 11, L: 'hip', R: 'point', expr: doneSeal ? 'smile' : 'stern', facing: -1 }, [25.9, 4.35, 0.35], { tint, ground: 4.35 }));
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
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'swim', R: 'swim', expr: 'effort', facing: 1 }, [lerp(13.8, 17.0, k), 0.28 + Math.sin(f * 0.32) * 0.14, 0.4], { tint, blob: false }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.45 + 2.0) % 6.283, 1), L: 'swim', R: 'swim', expr: 'determined', facing: 1 }, [lerp(12.2, 15.6, k), 0.28 + Math.cos(f * 0.3) * 0.14, -0.7], { tint, blob: false }));
      break;
    }
    case 'grab_tin': {
      const k = M.easeOut(ramp(f, 782, 810));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: q((f * 0.28) % 6.283, 1), L: 'push', R: 'push', expr: f > 796 ? 'grin' : 'determined', facing: 1 }, [lerp(16.6, 17.35, k), 0.28 + Math.sin(f * 0.22) * 0.08, 0.4], { tint, blob: false, s: 1.04 }));
      break;
    }
    case 'push_shore': {
      const k = M.smooth(ramp(f, 823, 894));
      const x = lerp(16.2, 3.2, k);
      const sw = q((f * 0.38) % 6.283, 1);
      out.push(C(T, 'mailman', { ...id(3), seed: 3, inWater: true, swimPhase: sw, L: 'push', R: 'push', expr: 'grin', facing: -1 }, [x, 0.28 + Math.sin(f * 0.24) * 0.09, 0.35], { tint, blob: false }));
      out.push(C(T, 'swimmerB', { ...id(4), seed: 4, inWater: true, swimPhase: q((f * 0.38 + 2.0) % 6.283, 1), L: 'swim', R: 'swim', expr: 'determined', facing: -1 }, [x + 1.45, 0.28 + Math.cos(f * 0.24) * 0.09, -0.7], { tint, blob: false }));
      break;
    }
    case 'tin_and_swimmer': {
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'hip', R: 'up', expr: 'laugh', facing: 1 }, [-2.4, 2.15, 0.2], { tint, ground: 2.15, s: 1.08 }));
      break;
    }
    case 'took_months': {
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'hip', R: 'hang', expr: 'bored', facing: 1, look: 0.3 }, [-3.0, 2.15, 0.3], { tint, ground: 2.15, s: 1.02 }));
      break;
    }
    case 'collectors': {
      // Three excited international stamp collectors leaning over the Pacific World Map!
      const bounce = (s) => q(Math.abs(Math.sin((f + s) * 0.24)) * 0.03, 3);
      out.push(C(T, 'collectorA', { ...id(21), seed: 21, bob: bounce(0), L: 'wave', R: 'up', magnify: true, wv: q(f * 0.32, 1), expr: 'excited', facing: 1 }, [-121.65, 1.55, -2.5], { ground: 2.04, blob: false, s: 1.12 }));
      out.push(C(T, 'collectorB', { ...id(22), seed: 22, bob: bounce(5), L: 'hold', R: 'up', album: true, letter: true, expr: 'laugh', facing: 0 }, [-120.0, 1.55, -2.7], { ground: 2.04, blob: false, s: 1.14 }));
      out.push(C(T, 'collectorC', { ...id(23), seed: 23, bob: bounce(9), L: 'up', R: 'wave', letter: true, wv: q(f * 0.36 + 1, 1), expr: 'grin', facing: -1 }, [-118.35, 1.55, -2.5], { ground: 2.04, blob: false, s: 1.12 }));
      break;
    }
    case 'famous_po': {
      // Triumphant finale at the famous Niuafo'ou "TIN CAN ISLAND" Post Office!
      out.push(C(T, 'postmaster', { ...id(31), seed: 31, L: 'wave', R: 'up', stamp: true, wv: q(f * 0.32, 1), expr: 'laugh', facing: 1 }, [-6.2, 4.85, -2.55], { tint, ground: 4.85, s: 1.02 }));
      out.push(C(T, 'mailman', { ...id(3), seed: 3, L: 'hip', R: 'up', expr: 'grin', facing: 1 }, [-6.2, 4.85, -1.05], { tint, ground: 4.85, s: 1.05 }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects & punchy graphic cards ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  // Subtle volcanic summit steam wisp on wide island shots
  if (S.id === 'hook_island' || S.id === 'volcano' || S.id === 'famous_po') {
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.008 + i * 0.33) % 1), 2);
      out.push(FX('vsteam' + k, (p) => T.fxSteam(p, k, '#e8eef5'), [-31.5 + k * 4.5, 26.8 + k * 9.5, -1.5 + Math.sin(i * 2) * 1.5], 4.2 + k * 2.5));
    }
  }

  // Steamship smokestack puffs whenever ship is visible
  if (S.id === 'steamship' || S.id === 'rough_surf' || S.id === 'paddle_out' || S.id === 'buckets' || S.id === 'famous_po') {
    const sx = S.id === 'rough_surf' ? 38 : S.id === 'famous_po' ? 34 : 28;
    const sz = S.id === 'rough_surf' || S.id === 'famous_po' ? -10.4 : -4.4;
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.015 + i * 0.33) % 1), 2);
      out.push(FX('ssteam' + k, (p) => T.fxSteam(p, k, '#f5f8fc'), [sx - k * 5.2, 14.2 + k * 6.5, sz - k * 2.5], 2.2 + k * 2.0));
    }
  }

  // Big cartoon ocean surf splashes pounding volcanic rocks
  if (S.id === 'rough_surf') {
    const t1 = q(((f - 210) % 36) / 36, 2);
    const t2 = q(((f - 228) % 40) / 40, 2);
    out.push(FX('spl1_' + t1, (p) => { p.g.translate(0, 120); p.g.scale(0.75, 0.75); T.fxSplash(p, t1); }, [3.2, 0.2, -1.6], 2.5));
    out.push(FX('spl2_' + t2, (p) => { p.g.translate(0, 120); p.g.scale(0.75, 0.75); T.fxSplash(p, t2); }, [2.9, 0.2, 3.6], 2.8));
  }

  // Hero splash when biscuit tin plunges into the sea (Shot 10!)
  if (S.id === 'throw_sea' && f >= 711) {
    const t = q(clamp((f - 711) / 20), 2);
    out.push(FX('tinspl_' + t, (p) => { p.g.translate(0, 110); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [18.6, 0.0, 0.5], 2.6));
  }

  // Choppy wave spray in fight_waves
  if (S.id === 'fight_waves') {
    const t = q(((f - 731) % 24) / 24, 2);
    out.push(FX('wspl_' + t, (p) => { p.g.translate(0, 130); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [16.2, 0.1, 0.9], 1.5));
  }

  // Punchy "No dock." and "No boat." graphic signboards with spring bounce!
  if (S.id === 'no_dock') {
    const pop = M.back(ramp(f, 895, 904), 1.9);
    out.push(FX('nodock', (p) => T.fxNoDock(p), [1.6, 2.25, 0.0], 1.15 * Math.max(0.05, pop), { order: 6 }));
  }
  if (S.id === 'no_boat') {
    const pop = M.back(ramp(f, 921, 930), 1.9);
    out.push(FX('noboat', (p) => T.fxNoBoat(p), [14.2, 2.05, 0.0], 1.15 * Math.max(0.05, pop), { order: 6 }));
  }

  // Triumphant golden sparkles around biscuit tin & famous Post Office
  if (S.id === 'tin_and_swimmer') {
    const ph = q((f * 0.06) % 6.28, 1);
    out.push(FX('spk_' + ph, (p) => T.fxSparkle(p, ph), [-1.62, 2.85, 0.45], 1.05));
  }
  if (S.id === 'tin_can_island' && f >= 1344) {
    const t = q(clamp((f - 1344) / 24), 2);
    if (t < 1) out.push(FX('burst_' + t, (p) => { p.g.translate(50, 250); p.g.scale(1.0, 1.0); T.fxBurst(p, t, '#ffd84a', 12, 40, 220); }, [-119.6, 2.25, 0.8], 1.65));
  }
  if (S.id === 'famous_po') {
    const ph = q((f * 0.05) % 6.28, 1);
    out.push(FX('fspk_' + ph, (p) => T.fxSparkle(p, ph), [-6.2, 6.9, -1.8], 1.9));
  }

  return out;
};
