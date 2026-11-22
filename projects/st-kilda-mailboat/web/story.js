// Master 21-shot plan for "St Kilda: The Ocean Post Office" — timed to voice.mp3 (46.99s, 30 fps, TOTAL = 1410).
// Strict Quality Locks: 1080x1920, 30 fps, dofAt cinf === 0 on EVERY frame, continuous 3D camera motion,
// upper-70% hero framing clear of y = 76% Rollo bottom-third viral subtitles.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1410;

export const SHOTS = [
  { id: 'hook_atlantic',     a: 0,    b: 62,   light: 'atlantic' },  // 0.00-2.07  "In the North Atlantic, there's a remote island"
  { id: 'st_kilda_village',  a: 63,   b: 129,  light: 'atlantic' },  // 2.10-4.30  "group called St Kilda."
  { id: 'hundred_miles',     a: 130,  b: 224,  light: 'map' },       // 4.33-7.47  "It sits more than a hundred miles from mainland Scotland."
  { id: 'nine_months',       a: 225,  b: 281,  light: 'storm' },     // 7.50-9.37  "For up to nine months of the year,"
  { id: 'nobody_reach',      a: 282,  b: 335,  light: 'storm' },     // 9.40-11.17 "nobody could reach it."
  { id: 'food_medicine',     a: 336,  b: 409,  light: 'overcast' },  // 11.20-13.63 "So when the islanders needed food or medicine,"
  { id: 'one_way_help',      a: 410,  b: 482,  light: 'overcast' },  // 13.67-16.07 "they had only one way to call for help."
  { id: 'no_radio',          a: 483,  b: 511,  light: 'storm' },     // 16.10-17.03 "No radio."
  { id: 'no_telephone',      a: 512,  b: 544,  light: 'storm' },     // 17.07-18.13 "No telephone."
  { id: 'no_ship',           a: 545,  b: 598,  light: 'storm' },     // 18.17-19.93 "No ship in sight."
  { id: 'carve_boat',        a: 599,  b: 703,  light: 'lantern' },   // 19.97-23.43 "They carved a tiny wooden boat with a hollow inside."
  { id: 'seal_message',      a: 704,  b: 752,  light: 'lantern' },   // 23.47-25.07 "They sealed a message in it,"
  { id: 'sheep_bladder',     a: 753,  b: 833,  light: 'lantern' },   // 25.10-27.77 "and tied it to a float made from a sheep's bladder."
  { id: 'throw_sea',         a: 834,  b: 896,  light: 'atlantic' },  // 27.80-29.87 "Then they threw it into the sea,"
  { id: 'and_hoped',         a: 897,  b: 933,  light: 'golden' },    // 29.90-31.10 "and hoped."
  { id: 'nobody_knew',       a: 934,  b: 997,  light: 'map' },       // 31.13-33.23 "Nobody knew where it would land."
  { id: 'ocean_weeks',       a: 998,  b: 1097, light: 'drift' },     // 33.27-36.57 "The ocean carried it for weeks, sometimes months."
  { id: 'scotland_shore',    a: 1098, b: 1183, light: 'scotland' },  // 36.60-39.43 "Some of those little boats reached the Scottish mainland."
  { id: 'norway_shore',      a: 1184, b: 1255, light: 'norway' },    // 39.47-41.83 "Others drifted all the way to Norway."
  { id: 'just_wait',         a: 1256, b: 1331, light: 'dusk' },      // 41.87-44.37 "Then all they could do was wait."
  { id: 'ocean_post_office', a: 1332, b: 1409, light: 'golden' },    // 44.40-46.97 "Their only post office was the sea."
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- atmospheric North Atlantic lighting palettes ----------
export const LIGHTS = {
  atlantic: {
    az: 48, el: 40, sky: '#bddcf2', ground: '#4f6d78', hemi: 1.24, sun: '#fff4de', sunI: 2.35,
    fog: '#a5cce0', fogNear: 95, fogFar: 820, skyTop: '#1f568c', skyHor: '#b3d9ed',
    sunDisc: '#fff7d6', sunSize: 0.0022, sat: 1.12, waterDeep: '#103e66', waterShal: '#287a96', glint: '#eefaff', vig: 0.16, shadowExt: 38,
  },
  overcast: {
    az: 40, el: 34, sky: '#a9c0d4', ground: '#4d5d63', hemi: 1.22, sun: '#e3ecf5', sunI: 1.95,
    fog: '#98b4c7', fogNear: 75, fogFar: 620, skyTop: '#325270', skyHor: '#a4bfcf',
    sunDisc: '#d9e6f0', sunSize: 0.0008, sat: 1.04, waterDeep: '#0e3657', waterShal: '#25647a', glint: '#e4f2fa', vig: 0.20, shadowExt: 28,
  },
  storm: {
    az: 28, el: 28, sky: '#8fa9bf', ground: '#3b4a57', hemi: 1.12, sun: '#d0deeb', sunI: 1.85,
    fog: '#7f9cb3', fogNear: 65, fogFar: 520, skyTop: '#213a54', skyHor: '#87a4ba',
    sunDisc: '#000000', sunSize: 0, sat: 1.02, waterDeep: '#0a2945', waterShal: '#1f546e', glint: '#f2f9ff', vig: 0.24, shadowExt: 28,
  },
  lantern: {
    az: 56, el: 52, sky: '#ffe7c2', ground: '#6e523a', hemi: 1.28, sun: '#ffd394', sunI: 2.35,
    fog: '#263342', fogNear: 80, fogFar: 380, skyTop: '#1c2b3d', skyHor: '#2e4157',
    sunDisc: '#000000', sunSize: 0, sat: 1.14, gain: '#fff5e6', waterDeep: '#103e66', waterShal: '#287a96', glint: '#ffffff', vig: 0.16, shadowExt: 14,
  },
  map: {
    az: 58, el: 58, sky: '#fff4e0', ground: '#78624d', hemi: 1.34, sun: '#fff3d6', sunI: 2.25,
    fog: '#25394f', fogNear: 120, fogFar: 500, skyTop: '#25394f', skyHor: '#35506e',
    sunDisc: '#000000', sunSize: 0, sat: 1.14, waterDeep: '#103e66', waterShal: '#287a96', glint: '#ffffff', vig: 0.14, shadowExt: 20,
  },
  drift: {
    az: 32, el: 34, sky: '#bcd6ed', ground: '#4a6275', hemi: 1.2, sun: '#ffe9c4', sunI: 2.4,
    fog: '#a8cbe0', fogNear: 90, fogFar: 750, skyTop: '#235a91', skyHor: '#bad9ed',
    sunDisc: '#fff3c4', sunSize: 0.0028, sat: 1.14, waterDeep: '#0f3c63', waterShal: '#25708f', glint: '#f5fbff', vig: 0.18, shadowExt: 22,
  },
  scotland: {
    az: 54, el: 44, sky: '#cde6fa', ground: '#627c68', hemi: 1.28, sun: '#fff6de', sunI: 2.5,
    fog: '#bde0f5', fogNear: 95, fogFar: 820, skyTop: '#2473bd', skyHor: '#c4e6fa',
    sunDisc: '#fffbe0', sunSize: 0.0025, sat: 1.16, waterDeep: '#134e7a', waterShal: '#3091a8', glint: '#ffffff', vig: 0.14, shadowExt: 30,
  },
  norway: {
    az: 46, el: 38, sky: '#d4ecff', ground: '#7a8ea3', hemi: 1.32, sun: '#fff8ea', sunI: 2.45,
    fog: '#c9e3f5', fogNear: 95, fogFar: 800, skyTop: '#2162a3', skyHor: '#d2eafc',
    sunDisc: '#fff9e6', sunSize: 0.0022, sat: 1.14, waterDeep: '#12416e', waterShal: '#2d7ba1', glint: '#ffffff', vig: 0.14, shadowExt: 32,
  },
  dusk: {
    az: 20, el: 14, sky: '#c99ab8', ground: '#59424d', hemi: 1.16, sun: '#ff9c63', sunI: 2.55,
    fog: '#d99b89', fogNear: 80, fogFar: 720, skyTop: '#363b73', skyHor: '#f29b72',
    sunDisc: '#ffdf9e', sunSize: 0.0046, sat: 1.14, gain: '#ffecdb', waterDeep: '#1c2f59', waterShal: '#8f5d6b', glint: '#ffd59c', vig: 0.22, shadowExt: 26,
  },
  golden: {
    az: 24, el: 20, sky: '#ffdcb8', ground: '#6e5749', hemi: 1.24, sun: '#ffc778', sunI: 2.75,
    fog: '#f0c59c', fogNear: 95, fogFar: 820, skyTop: '#3162a8', skyHor: '#ffc98a',
    sunDisc: '#fff2bd', sunSize: 0.0042, sat: 1.18, gain: '#fff6e8', waterDeep: '#184773', waterShal: '#b38866', glint: '#ffebb8', vig: 0.16, shadowExt: 36,
  },
};

export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'hook_atlantic') L.shadowExt = 48;
  // Smooth time-lapse daylight -> golden sunset -> twilight blue across "weeks, sometimes months"!
  if (S.id === 'ocean_weeks') {
    const t = ramp(f, 998, 1097);
    L.el = lerp(38, 11, t);
    L.az = lerp(55, 16, t);
    if (t > 0.45) {
      L.skyTop = t > 0.78 ? '#293566' : '#3a5796';
      L.skyHor = t > 0.78 ? '#e88e68' : '#ffb87d';
      L.fog = t > 0.78 ? '#cf8b7a' : '#edb48e';
      L.sun = '#ffa766';
      L.glint = '#ffd99e';
    }
  }
  return L;
};

// ---------- impact camera kicks synced to exact speech & action frames ----------
const KICKS = [
  { f: 288,  a: 0.045 },  // storm wave crash on "nobody could reach it"
  { f: 488,  a: 0.060 },  // "No radio." X slam
  { f: 516,  a: 0.060 },  // "No telephone." X slam
  { f: 550,  a: 0.060 },  // "No ship in sight." X slam
  { f: 738,  a: 0.055 },  // wooden mailboat lid SLAMMED shut with wax seal!
  { f: 880,  a: 0.072 },  // BIG splash when mailboat hits the North Atlantic!
  { f: 1132, a: 0.042 },  // Scottish mainland landing pop
  { f: 1218, a: 0.042 },  // Norway fjord discovery pop
];

// ---------- continuous 3D camera choreography (ZERO static holds, upper-70% framing) ----------
const CAMS = {
  // 1. Frame-0 Hook: Dramatic sweeping aerial over whitecapped Atlantic past jagged sea stack toward St Kilda cliffs & cottages!
  hook_atlantic: [
    { f: 0,  pos: [34, 18.5, 22],  look: [-16, 8.8, -4.0], fov: 44 },
    { f: 62, pos: [18, 12.2, 16],  look: [-15, 7.6, -2.5], fov: 40, ease: 'easeOut' },
  ],
  // 2. Sweeping Village Bay dolly framing stone cottages, smoking chimneys, "ST KILDA" sign, sheep & 3 islanders!
  st_kilda_village: [
    { f: 63,  pos: [5.5, 7.2, 4.2],  look: [-8.5, 5.7, -2.0], fov: 42 },
    { f: 129, pos: [4.2, 6.9, -0.8], look: [-8.8, 5.8, -2.2], fov: 39, path: [[5.2, 7.1, 1.6]] },
  ],
  // 3. Vintage North Atlantic Nautical Chart: crane-pull from ST KILDA pin across "100+ MILES" to MAINLAND SCOTLAND!
  hundred_miles: [
    { f: 130, pos: [116.6, 8.8, 6.0],  look: [116.4, 2.0, 1.5], fov: 42 },
    { f: 178, pos: [118.2, 11.4, 7.6], look: [117.8, 2.0, 1.6], fov: 43 },
    { f: 224, pos: [119.2, 13.4, 9.0], look: [118.4, 2.0, 1.6], fov: 44, ease: 'easeOut' },
  ],
  // 4. Stormy 9-month cliffside calendar flipping OCT -> JUN through slashing Atlantic gale rain!
  nine_months: [
    { f: 225, pos: [3.2, 6.9, 1.4], look: [-2.6, 6.5, 0.0], fov: 41, roll: -1.4 },
    { f: 281, pos: [2.2, 6.7, 0.4], look: [-2.6, 6.5, 0.0], fov: 37, roll: 1.2 },
  ],
  // 5. Rough Atlantic storm surf crashing on jagged rocks with pitching sailing ship turning away!
  nobody_reach: [
    { f: 282, pos: [-1.0, 4.6, 12.6], look: [17.0, 4.4, -3.5], fov: 44, roll: -2.4 },
    { f: 335, pos: [0.5, 4.2, 9.8],   look: [20.5, 4.6, -4.5], fov: 41, roll: 2.2 },
  ],
  // 6. Village square: worried islanders holding empty food basket & empty red-cross medicine bottle beside stone cottage!
  food_medicine: [
    { f: 336, pos: [1.8, 6.0, 1.6],  look: [-5.8, 5.6, -0.6], fov: 41 },
    { f: 409, pos: [0.4, 5.9, 0.5],  look: [-5.8, 5.6, -0.6], fov: 37, ease: 'easeOut' },
  ],
  // 7. Wind-swept cliff overlook: islanderA & elder scanning empty Atlantic, idea spark lights up!
  one_way_help: [
    { f: 410, pos: [3.8, 6.2, 5.2],  look: [-2.4, 5.75, 0.4], fov: 41 },
    { f: 482, pos: [4.6, 6.3, 1.8],  look: [-2.4, 5.85, 0.4], fov: 38, path: [[4.8, 6.25, 3.6]] },
  ],
  // 8. Rapid Cut 1: "No radio." giant X signboard over stormy village headland
  no_radio: [
    { f: 483, pos: [5.2, 6.4, 2.8], look: [-1.6, 6.2, 0.0], fov: 40 },
    { f: 511, pos: [4.4, 6.3, 2.2], look: [-1.6, 6.2, 0.0], fov: 36, ease: 'easeOut' },
  ],
  // 9. Rapid Cut 2: "No telephone." giant X signboard over dark sea cliff
  no_telephone: [
    { f: 512, pos: [5.4, 6.2, -3.0], look: [-1.6, 6.2, 0.0], fov: 40 },
    { f: 544, pos: [4.6, 6.1, -2.4], look: [-1.6, 6.2, 0.0], fov: 36, ease: 'easeOut' },
  ],
  // 10. Rapid Cut 3: "No ship in sight." giant X signboard over open sea + elder with brass spyglass!
  no_ship: [
    { f: 545, pos: [-3.4, 6.2, 5.2], look: [4.2, 5.7, 0.0], fov: 43 },
    { f: 598, pos: [-2.4, 6.1, 4.2], look: [5.4, 5.7, 0.0], fov: 39, ease: 'easeOut' },
  ],
  // 11. Cozy Lantern Workbench: warm orbit framing islanderA carving the tiny 3D wooden boat with scooped HOLLOW inside!
  carve_boat: [
    { f: 599, pos: [-120.8, 4.35, 5.6], look: [-120.0, 2.65, -0.2], fov: 40 },
    { f: 652, pos: [-119.6, 4.10, 4.8], look: [-120.0, 2.60, -0.1], fov: 38, path: [[-120.1, 4.25, 5.2]] },
    { f: 703, pos: [-119.0, 3.85, 4.2], look: [-120.0, 2.55, 0.1],  fov: 36 },
  ],
  // 12. Hero Close-up: SOS parchment scroll tucked into hollow -> wooden lid SLAMS shut with red wax seal!
  seal_message: [
    { f: 704, pos: [-119.4, 4.15, 3.6], look: [-120.0, 2.45, 0.3], fov: 38 },
    { f: 752, pos: [-120.4, 3.85, 3.1], look: [-120.0, 2.38, 0.3], fov: 35, ease: 'easeOut' },
  ],
  // 13. Pullback + tilt-up revealing the hemp cord tied cleanly up to the buoyant cream SHEEP'S BLADDER FLOAT!
  sheep_bladder: [
    { f: 753, pos: [-120.4, 3.85, 5.2], look: [-119.7, 2.85, 0.1], fov: 41 },
    { f: 833, pos: [-119.2, 4.10, 6.2], look: [-119.6, 3.00, 0.0], fov: 43, ease: 'easeOut' },
  ],
  // 14. Whip-follow camera tracking islanderA hurling the tethered mailboat + float off the sea cliff into the foaming Atlantic!
  throw_sea: [
    { f: 834, pos: [2.4, 6.4, 6.8],  look: [-1.4, 5.9, 0.4], fov: 42 },
    { f: 866, pos: [5.4, 5.6, 7.6],  look: [6.2, 5.4, 0.5],  fov: 43, ease: 'easeIn' },
    { f: 896, pos: [8.4, 2.6, 7.4],  look: [11.6, 1.1, 0.6], fov: 40, ease: 'easeOut' },
  ],
  // 15. Emotional Beat: golden-lit push-in on islanderA & islanderB watching hopefully from the cliff edge!
  and_hoped: [
    { f: 897, pos: [4.2, 6.1, 4.4], look: [-2.4, 5.65, 0.2], fov: 40 },
    { f: 933, pos: [3.2, 6.0, 3.6], look: [-2.4, 5.70, 0.2], fov: 36, ease: 'easeOut' },
  ],
  // 16. Vintage Nautical Chart Mystery: high orbit over St Kilda with 4 branching dotted mystery arches & floating "?" badges!
  nobody_knew: [
    { f: 934, pos: [118.2, 16.0, 11.4], look: [119.6, 2.1, -0.3], fov: 46 },
    { f: 997, pos: [120.8, 14.4, 9.6],  look: [119.8, 2.1, -0.4], fov: 43, path: [[119.6, 15.4, 10.6]] },
  ],
  // 17. Low cinematic ocean tracking alongside the hero 3D mailboat + bobbing float crossing rolling swells through days & sunset!
  ocean_weeks: [
    { f: 998,  pos: [24.0, 1.9, 5.4], look: [27.0, 0.85, 0.0], fov: 39, roll: -2.0 },
    { f: 1048, pos: [30.0, 2.2, 4.8], look: [31.5, 0.90, 0.0], fov: 37, roll: 2.0 },
    { f: 1097, pos: [35.5, 2.0, 5.2], look: [36.0, 0.88, 0.0], fov: 36, roll: -1.5 },
  ],
  // 18. Scottish Mainland Coast: sunlit bay dolly framing washed-up mailboat, surprised yellow-coat scotFinder & white coastal lighthouse!
  scotland_shore: [
    { f: 1098, pos: [247.5, 4.4, 6.8], look: [238.5, 2.8, -1.2], fov: 43 },
    { f: 1183, pos: [245.4, 3.6, 4.6], look: [238.8, 2.4, -0.8], fov: 39, ease: 'easeOut' },
  ],
  // 19. Norwegian Fjord Coast: snowy fjord mountains, crimson rorbuer boathouse, Nordic-sweater norwayFinder lifting mailboat!
  norway_shore: [
    { f: 1184, pos: [367.8, 4.4, 6.4], look: [358.2, 2.8, -0.8], fov: 43 },
    { f: 1255, pos: [365.4, 3.7, 4.4], look: [358.4, 2.5, -0.6], fov: 39, ease: 'easeOut' },
  ],
  // 20. Warm amber-violet sunset cliffside push-in on all 3 St Kilda islanders waiting beside glowing brass lantern!
  just_wait: [
    { f: 1256, pos: [5.4, 6.2, 4.2], look: [-2.6, 5.65, 0.2], fov: 42 },
    { f: 1331, pos: [4.2, 6.1, 2.6], look: [-2.6, 5.75, 0.2], fov: 38, ease: 'easeOut' },
  ],
  // 21. Heroic Golden Finale: starts close on glowing St Kilda mailboat + float on shimmering sea, cranes wide to reveal St Kilda & approaching rescue ship!
  ocean_post_office: [
    { f: 1332, pos: [14.2, 2.3, 4.4],  look: [10.0, 1.0, 0.0],   fov: 38 },
    { f: 1372, pos: [18.5, 6.0, 9.2],  look: [2.0, 3.6, -1.5],   fov: 42, path: [[16.4, 4.2, 6.8]] },
    { f: 1409, pos: [24.5, 11.5, 16.5], look: [-8.0, 6.5, -3.0], fov: 45, ease: 'easeOut' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.001, kicks: KICKS });
  c.flash = f >= 738 && f < 742 ? (1 - (f - 738) / 4) * 0.35 : 0;
  if (S.id === 'carve_boat' || S.id === 'seal_message' || S.id === 'sheep_bladder') {
    c.shadowAt = [-120, 2.2, 0.0];
  } else if (S.id === 'hundred_miles' || S.id === 'nobody_knew') {
    c.shadowAt = [120, 2.0, 0.0];
  } else if (S.id === 'scotland_shore') {
    c.shadowAt = [238, 2.0, -1.0];
  } else if (S.id === 'norway_shore') {
    c.shadowAt = [358, 2.0, -1.0];
  } else if (S.id === 'ocean_weeks') {
    c.shadowAt = [31, 0.5, 0.0];
  } else {
    c.shadowAt = [-6, 5.0, -1.0];
  }
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS RULE: cinf ALWAYS 0 ----------
export const dofAt = (f) => ({ focus: 10, cinf: 0 });

// ---------- animated 3D world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), t = f / 30;
  const W = {
    stage: 'kilda',
    chop: 1.15,
    showCalendar: false,
    monthIdx: 0,
    cliffLantern: false,
    ship: null,
    milesProg: 0,
    mysteryProg: 0,
    boat: null,
  };

  switch (S.id) {
    case 'hook_atlantic':
    case 'st_kilda_village':
      W.stage = 'kilda'; W.chop = 1.25; break;
    case 'hundred_miles':
      W.stage = 'map';
      W.milesProg = M.easeOut(ramp(f, 138, 200));
      break;
    case 'nine_months':
      W.stage = 'kilda'; W.chop = 2.1; W.showCalendar = true;
      W.monthIdx = Math.min(8, Math.floor(ramp(f, 228, 276) * 9));
      break;
    case 'nobody_reach': {
      const k = ramp(f, 282, 335);
      W.stage = 'kilda'; W.chop = 2.4;
      W.ship = { x: lerp(22, 30, k), z: lerp(-4, -9, k), yaw: lerp(-0.35, 0.75, k), roll: 2.6, s: 1.0 };
      break;
    }
    case 'food_medicine':
    case 'one_way_help':
      W.stage = 'kilda'; W.chop = 1.45; break;
    case 'no_radio':
    case 'no_telephone':
    case 'no_ship':
      W.stage = 'kilda'; W.chop = 1.75; break;
    case 'carve_boat':
      W.stage = 'bench';
      W.boat = {
        x: -120.0, y: 2.02, z: 0.35, s: 1.18,
        ry: -0.25 + Math.sin(t * 2.2) * 0.08,
        lid: -1, hasFloat: false,
      };
      break;
    case 'seal_message': {
      W.stage = 'bench';
      const dropK = M.smooth(ramp(f, 708, 728));
      const closeK = M.easeIn(ramp(f, 728, 738));
      W.boat = {
        x: -120.0, y: 2.02, z: 0.35, s: 1.22,
        ry: -0.18,
        scrollY: lerp(1.15, 0.36, dropK),
        scrollSpin: lerp(0.5, 0, dropK),
        lid: 1 - closeK,
        hasFloat: false,
      };
      break;
    }
    case 'sheep_bladder': {
      W.stage = 'bench';
      const pop = M.back(ramp(f, 754, 774), 1.4);
      W.boat = {
        x: -120.55, y: 2.02, z: 0.35, s: 1.02 * clamp(pop, 0.6, 1.06),
        ry: -0.14 + Math.sin(t * 1.4) * 0.08,
        lid: 0, hasFloat: true, floatTilt: -0.24,
      };
      break;
    }
    case 'throw_sea': {
      W.stage = 'kilda'; W.chop = 1.5;
      if (f < 850) {
        W.boat = { x: -0.5, y: 5.85, z: 0.4, s: 0.78, ry: 0.2, rz: 0.35, lid: 0, hasFloat: true, floatTilt: -0.2 };
      } else if (f < 880) {
        const k = ramp(f, 850, 880);
        const x = lerp(-0.5, 11.6, k);
        const y = lerp(5.85, 0.25, k) + Math.sin(k * Math.PI) * 3.8;
        const z = lerp(0.4, 0.6, k);
        W.boat = { x, y, z, s: 0.88, rx: k * 3.2, ry: 0.3, rz: -k * 2.5, lid: 0, hasFloat: true, floatTilt: -0.3 };
      } else {
        const bob = Math.sin((f - 880) * 0.28) * 0.16;
        W.boat = { x: 11.6 + (f - 880) * 0.04, y: 0.28 + bob, z: 0.6, s: 0.92, rx: 0.18 * Math.sin(t * 3), ry: 0.25, rz: 0.16 * Math.cos(t * 2.6), lid: 0, hasFloat: true, floatTilt: -0.25 };
      }
      break;
    }
    case 'and_hoped':
      W.stage = 'kilda'; W.chop = 1.25;
      W.boat = { x: 13.5 + (f - 897) * 0.05, y: 0.28 + Math.sin(t * 3) * 0.14, z: 0.5, s: 0.85, ry: 0.2, lid: 0, hasFloat: true };
      break;
    case 'nobody_knew':
      W.stage = 'map';
      W.mysteryProg = M.easeOut(ramp(f, 938, 982));
      W.boat = { x: 116.26, y: 2.35 + Math.sin(t * 3.5) * 0.08, z: 1.53, s: 0.55, ry: -0.5 + t * 0.6, lid: 0, hasFloat: true, floatTilt: -0.2 };
      break;
    case 'ocean_weeks': {
      const k = ramp(f, 998, 1097);
      W.stage = 'ocean'; W.chop = 1.85;
      const bx = lerp(26.5, 36.2, k);
      W.boat = {
        x: bx, y: 0.34 + Math.sin(t * 3.4) * 0.24, z: Math.sin(t * 1.4) * 0.4,
        s: 1.08,
        rx: 0.22 * Math.sin(t * 2.8),
        ry: 0.22 + Math.sin(t * 1.2) * 0.18,
        rz: 0.26 * Math.cos(t * 2.4),
        lid: 0, hasFloat: true, floatTilt: -0.28,
      };
      break;
    }
    case 'scotland_shore': {
      W.stage = 'scotland'; W.chop = 0.85;
      const bob = Math.sin(t * 2.8) * 0.08;
      W.boat = { x: 241.0, y: 0.28 + bob, z: 0.9, s: 0.95, ry: 2.45, rz: 0.12, lid: 0, hasFloat: true, floatTilt: -0.22 };
      break;
    }
    case 'norway_shore': {
      W.stage = 'norway'; W.chop = 0.75;
      const bob = Math.sin(t * 2.6) * 0.08;
      W.boat = { x: 361.0, y: 0.28 + bob, z: 1.1, s: 0.96, ry: 2.3, rz: 0.10, lid: 0, hasFloat: true, floatTilt: -0.22 };
      break;
    }
    case 'just_wait':
      W.stage = 'kilda'; W.chop = 1.1; W.cliffLantern = true;
      break;
    case 'ocean_post_office': {
      W.stage = 'kilda'; W.chop = 1.05;
      const k = ramp(f, 1332, 1409);
      W.boat = {
        x: lerp(9.4, 11.4, k), y: 0.34 + Math.sin(t * 3.0) * 0.14, z: 0.0,
        s: 1.02, rx: 0.14 * Math.sin(t * 2.6), ry: 0.35 + k * 0.4, rz: 0.14 * Math.cos(t * 2.2),
        lid: 0, hasFloat: true, floatTilt: -0.24,
      };
      // Hopeful rescue ship approaching on the golden horizon!
      W.ship = { x: lerp(38, 31, k), z: -12, yaw: -1.45, roll: 0.8, s: 0.95 };
      break;
    }
  }
  return W;
};

// ---------- 2D bean-head billboard actors ----------
const C = (T, role, o, pos, extra = {}) => ({
  key: role + JSON.stringify(o),
  draw: (p) => T.kildaChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffebd6'
    : S.light === 'dusk' ? '#ffd5c2'
    : S.light === 'lantern' ? '#ffedd6'
    : S.light === 'storm' ? '#dbe6f0'
    : '#ffffff';
  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 'st_kilda_village': {
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'wave', R: 'hip', wv: q(f * 0.32, 1), expr: 'smile', facing: 1 }, [-5.2, 4.62, -0.4], { tint, ground: 4.62, s: 1.04 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'hip', R: 'wave', wv: q(f * 0.3 + 1.2, 1), expr: 'hopeful', facing: 1 }, [-6.2, 4.62, 1.4], { tint, ground: 4.62, s: 1.02 }));
      out.push(C(T, 'elder', { ...id(5), seed: 5, L: 'hang', R: 'shade', expr: 'neutral', facing: 1 }, [-7.4, 4.62, -1.8], { tint, ground: 4.62, s: 1.04 }));
      break;
    }
    case 'food_medicine': {
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hang', R: 'hold', basket: true, expr: 'worried', facing: 1 }, [-5.4, 4.62, -1.25], { tint, ground: 4.62, s: 1.06 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'hip', R: 'hold', medicine: true, expr: 'worried', facing: -1 }, [-5.4, 4.62, 0.35], { tint, ground: 4.62, s: 1.06 }));
      break;
    }
    case 'one_way_help': {
      const gotIdea = f >= 442;
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hip', R: gotIdea ? 'up' : 'point', expr: gotIdea ? 'idea' : 'determined', facing: 1 }, [-2.4, 4.62, -0.35], { tint, ground: 4.62, s: 1.06 }));
      out.push(C(T, 'elder', { ...id(5), seed: 5, L: 'hang', R: 'shade', expr: gotIdea ? 'hopeful' : 'worried', facing: 1 }, [-3.0, 4.62, 1.15], { tint, ground: 4.62, s: 1.04 }));
      break;
    }
    case 'no_ship': {
      out.push(C(T, 'elder', { ...id(5), seed: 5, L: 'hip', R: 'spy', spyglass: true, expr: 'worried', facing: 1 }, [-0.8, 4.62, 1.85], { tint, ground: 4.62, s: 1.02 }));
      break;
    }
    case 'carve_boat': {
      // Standing behind rustic oak workbench at z = -1.45, torso & smiling face cleanly ABOVE table & mailboat!
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hold', R: 'carve', chisel: true, wv: q(f * 0.52, 1), expr: 'determined', facing: 0, look: 0 }, [-120.2, 1.05, -1.45], { tint, blob: false, s: 1.06 }));
      break;
    }
    case 'seal_message': {
      const sealed = f >= 738;
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hold', R: sealed ? 'up' : 'hold', expr: sealed ? 'grin' : 'determined', facing: 0 }, [-120.2, 1.05, -1.55], { tint, blob: false, s: 1.04 }));
      break;
    }
    case 'sheep_bladder': {
      // Positioned cleanly to the LEFT and RIGHT of the mailboat & inflated float so ZERO face occlusion!
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hip', R: 'point', expr: 'grin', facing: 1 }, [-121.35, 1.05, -1.45], { tint, blob: false, s: 1.04 }));
      out.push(C(T, 'elder', { ...id(5), seed: 5, L: 'up', R: 'hip', expr: 'hopeful', facing: -1 }, [-118.25, 1.05, -1.45], { tint, blob: false, s: 1.04 }));
      break;
    }
    case 'throw_sea': {
      const threw = f >= 850;
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hip', R: threw ? 'throw' : 'hold', expr: threw ? 'effort' : 'determined', facing: 1 }, [-1.6, 4.62, 0.35], { tint, ground: 4.62, s: 1.06 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'clasp', R: 'clasp', expr: 'hopeful', facing: 1 }, [-2.8, 4.62, -0.85], { tint, ground: 4.62, s: 1.02 }));
      break;
    }
    case 'and_hoped': {
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hang', R: 'shade', expr: 'hopeful', facing: 1 }, [-2.3, 4.62, -0.4], { tint, ground: 4.62, s: 1.06 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'clasp', R: 'clasp', expr: 'hopeful', facing: 1 }, [-2.6, 4.62, 0.8], { tint, ground: 4.62, s: 1.04 }));
      break;
    }
    case 'scotland_shore': {
      const bounce = q(Math.abs(Math.sin(f * 0.22)) * 0.025, 3);
      out.push(C(T, 'scotFinder', { ...id(14), seed: 14, bob: bounce, L: 'wave', R: 'up', scroll: true, wv: q(f * 0.36, 1), expr: 'amazed', facing: 1 }, [238.8, 0.85, -0.5], { tint, ground: 0.85, s: 1.08 }));
      break;
    }
    case 'norway_shore': {
      const bounce = q(Math.abs(Math.sin(f * 0.22)) * 0.025, 3);
      out.push(C(T, 'norwayFinder', { ...id(16), seed: 16, bob: bounce, L: 'wave', R: 'up', miniBoat: true, wv: q(f * 0.36, 1), expr: 'laugh', facing: 1 }, [358.8, 1.16, -0.3], { tint, ground: 1.16, s: 1.08 }));
      break;
    }
    case 'just_wait': {
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'hang', R: 'hold', lantern: true, expr: 'hopeful', facing: 1 }, [-2.5, 4.62, -0.8], { tint, ground: 4.62, s: 1.04 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'clasp', R: 'clasp', expr: 'hopeful', facing: 1 }, [-2.5, 4.62, 0.4], { tint, ground: 4.62, s: 1.04 }));
      out.push(C(T, 'elder', { ...id(5), seed: 5, L: 'hang', R: 'shade', expr: 'hopeful', facing: 1 }, [-2.8, 4.62, 1.55], { tint, ground: 4.62, s: 1.02 }));
      break;
    }
    case 'ocean_post_office': {
      out.push(C(T, 'islanderA', { ...id(3), seed: 3, L: 'wave', R: 'up', wv: q(f * 0.3, 1), expr: 'grin', facing: 1 }, [-2.6, 4.62, -0.5], { tint, ground: 4.62, s: 1.05 }));
      out.push(C(T, 'islanderB', { ...id(4), seed: 4, L: 'up', R: 'wave', wv: q(f * 0.3 + 1, 1), expr: 'laugh', facing: 1 }, [-2.8, 4.62, 0.7], { tint, ground: 4.62, s: 1.04 }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects, smoke, gulls, rain & graphic signboards ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  // Cozy cottage peat-fire chimney smoke on St Kilda village shots
  if (S.id === 'hook_atlantic' || S.id === 'st_kilda_village' || S.id === 'food_medicine' || S.id === 'just_wait' || S.id === 'ocean_post_office') {
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.012 + i * 0.33) % 1), 2);
      out.push(FX('smk1_' + k, (p) => T.fxSmoke(p, k, '#e8eef5'), [-10.6 + k * 2.2, 9.8 + k * 4.5, -4.4 + k * 0.8], 1.4 + k * 1.3));
    }
  }

  // Soaring North Atlantic seabirds / gulls on coastal & ocean vistas
  if (S.id === 'hook_atlantic' || S.id === 'ocean_weeks' || S.id === 'scotland_shore' || S.id === 'ocean_post_office') {
    const ph = q((f * 0.14) % 6.28, 1);
    const gx = S.id === 'scotland_shore' ? 236 : S.id === 'ocean_weeks' ? 30 + Math.sin(f * 0.04) * 5 : 4 + Math.sin(f * 0.03) * 6;
    const gy = S.id === 'ocean_weeks' ? 5.2 : 12.5;
    const gz = S.id === 'scotland_shore' ? -6.5 : -6.0;
    out.push(FX('gull_' + ph, (p) => T.fxSeagull(p, ph), [gx, gy, gz], 1.65));
    out.push(FX('gull2_' + ph, (p) => T.fxSeagull(p, ph + 1.4), [gx + 3.8, gy + 1.6, gz - 2.2], 1.35));
  }

  // Slashing North Atlantic winter storm rain + pounding rock splashes!
  if (S.id === 'nine_months' || S.id === 'nobody_reach') {
    const rph = q((f * 0.12) % 1, 2);
    const rpos = S.id === 'nine_months' ? [0.2, 5.2, 0.4] : [5.5, 3.0, 4.5];
    out.push(FX('rain_' + rph, (p) => T.fxRain(p, rph), rpos, S.id === 'nine_months' ? 3.2 : 5.4, { order: 7 }));
  }
  if (S.id === 'nobody_reach') {
    const t1 = q(((f - 282) % 30) / 30, 2);
    const t2 = q(((f - 296) % 34) / 34, 2);
    out.push(FX('spl1_' + t1, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t1); }, [3.0, 0.0, 4.2], 2.7));
    out.push(FX('spl2_' + t2, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t2); }, [3.6, 0.0, -3.0], 2.9));
  }

  // Idea lightbulb spark on "they had only one way to call for help"!
  if (S.id === 'one_way_help' && f >= 442) {
    const pop = M.back(ramp(f, 442, 452), 1.8);
    const ph = q((f * 0.15) % 6.28, 1);
    out.push(FX('idea_' + ph, (p) => T.fxIdea(p, ph), [-2.4, 6.75, -0.35], 0.72 * Math.max(0.05, pop), { order: 6 }));
  }

  // Punchy graphic Red-X cards for "No radio. No telephone. No ship in sight."!
  if (S.id === 'no_radio') {
    const pop = M.back(ramp(f, 483, 492), 1.9);
    out.push(FX('noradio', (p) => T.fxNoRadio(p), [-1.6, 5.45, 0.0], 1.18 * Math.max(0.05, pop), { order: 6 }));
  }
  if (S.id === 'no_telephone') {
    const pop = M.back(ramp(f, 512, 521), 1.9);
    out.push(FX('nophone', (p) => T.fxNoPhone(p), [-1.6, 5.45, 0.0], 1.18 * Math.max(0.05, pop), { order: 6 }));
  }
  if (S.id === 'no_ship') {
    const pop = M.back(ramp(f, 545, 554), 1.9);
    out.push(FX('noship', (p) => T.fxNoShip(p), [4.6, 5.15, -0.2], 1.32 * Math.max(0.05, pop), { order: 6 }));
  }

  // Flying curly wood shavings while carving the tiny wooden boat!
  if (S.id === 'carve_boat') {
    const k = q(((f - 599) % 24) / 24, 2);
    out.push(FX('shav_' + k, (p) => T.fxShavings(p, k), [-120.0, 2.25, 0.45], 0.92, { order: 6 }));
  }

  // Impact gold burst when lid seals shut on the SOS scroll!
  if (S.id === 'seal_message' && f >= 738) {
    const t = q(clamp((f - 738) / 14), 2);
    if (t < 1) out.push(FX('sealburst_' + t, (p) => { p.g.translate(40, 220); T.fxBurst(p, t, '#ffd84a', 10, 35, 190); }, [-120.0, 2.3, 0.4], 0.95, { order: 6 }));
  }

  // BIG ocean splash when the tethered mailboat hits the sea!
  if (S.id === 'throw_sea' && f >= 879) {
    const t = q(clamp((f - 879) / 18), 2);
    out.push(FX('boatspl_' + t, (p) => { p.g.translate(0, 320); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [11.6, 0.0, 0.6], 2.8, { order: 6 }));
  }

  // 4 Floating golden "?" badges at ends of mystery drift routes on Nautical Chart!
  if (S.id === 'nobody_knew') {
    const ph = q((f * 0.12) % 6.28, 1);
    const qPts = [[115.4, 2.6, -3.9], [119.4, 2.6, -3.7], [120.34, 2.6, 1.95], [125.21, 2.6, -2.15]];
    qPts.forEach((pt, idx) => {
      const pop = M.back(ramp(f, 944 + idx * 8, 956 + idx * 8), 1.6);
      if (pop > 0.05) out.push(FX('qm_' + idx + '_' + ph, (p) => T.fxQuestion(p, ph + idx), pt, 0.95 * pop, { order: 6 }));
    });
  }

  // Golden sparkles on Scottish discovery, Norwegian discovery, and triumphant ocean finale!
  if (S.id === 'scotland_shore') {
    const ph = q((f * 0.06) % 6.28, 1);
    out.push(FX('spks_' + ph, (p) => T.fxSparkle(p, ph), [241.0, 0.85, 0.9], 1.1));
  }
  if (S.id === 'norway_shore') {
    const ph = q((f * 0.06) % 6.28, 1);
    out.push(FX('spkn_' + ph, (p) => T.fxSparkle(p, ph), [361.0, 0.85, 1.1], 1.1));
  }
  if (S.id === 'ocean_post_office') {
    const ph = q((f * 0.06) % 6.28, 1);
    out.push(FX('spkf_' + ph, (p) => T.fxSparkle(p, ph), [10.4, 0.95, 0.0], 1.45));
  }

  return out;
};
