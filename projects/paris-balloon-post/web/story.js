// Master 24-shot plan for "Paris Found the Sky" (Siege of Paris, 1870) — timed to voice.mp3 (56.35s, 30 fps, TOTAL = 1691).
// Post-audit perfected framing: ZERO camera occlusion, ZERO cropped heroes, 100% razor-sharp (dofAt cinf === 0),
// continuous 3D camera motion, upper-70% hero framing clear of y = 76% Rollo bottom-third viral subtitles.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1691;

export const SHOTS = [
  { id: 'hook_paris',       a: 0,    b: 42,   light: 'duskGold' },      //  0.00- 1.40  "In 1870,"
  { id: 'surrounded',       a: 43,   b: 85,   light: 'siegeOvercast' }, //  1.43- 2.83  "Paris was surrounded,"
  { id: 'way_out_up',       a: 86,   b: 150,  light: 'duskGold' },      //  2.87- 5.00  "and the only way out was up."
  { id: 'closed_road',      a: 151,  b: 225,  light: 'siegeOvercast' }, //  5.03- 7.50  "Enemy armies had closed every road,"
  { id: 'rail_telegraph',   a: 226,  b: 294,  light: 'siegeOvercast' }, //  7.53- 9.80  "rail line, and telegraph wire."
  { id: 'fill_balloons',    a: 295,  b: 370,  light: 'warmPlaza' },     //  9.83-12.33  "So Parisians filled giant balloons with gas"
  { id: 'mail_sky',         a: 371,  b: 446,  light: 'warmPlaza' },     // 12.37-14.87  "and sent their mail into the sky."
  { id: 'night_fleet',      a: 447,  b: 536,  light: 'moonNight' },     // 14.90-17.87  "Dozens of balloons lifted off, often at night,"
  { id: 'over_lines',       a: 537,  b: 598,  light: 'moonNight' },     // 17.90-19.93  "drifting over enemy lines."
  { id: 'passengers',       a: 599,  b: 648,  light: 'dayCrisp' },      // 19.97-21.60  "Some carried passengers."
  { id: 'millions_letters', a: 649,  b: 720,  light: 'dayCrisp' },      // 21.63-24.00  "Some carried millions of letters."
  { id: 'minister_escape',  a: 721,  b: 789,  light: 'duskGold' },      // 24.03-26.30  "Even a government minister escaped that way,"
  { id: 'raise_army',       a: 790,  b: 839,  light: 'dayCrisp' },      // 26.33-27.97  "to raise a new army."
  { id: 'cant_fly_back',    a: 840,  b: 904,  light: 'windySlate' },    // 28.00-30.13  "But the balloons couldn't fly back."
  { id: 'wind_took_them',   a: 905,  b: 967,  light: 'windySlate' },    // 30.17-32.23  "They went wherever the wind took them."
  { id: 'how_replies',      a: 968,  b: 1040, light: 'warmPlaza' },     // 32.27-34.67  "So how did Paris get replies?"
  { id: 'pigeons_reveal',   a: 1041, b: 1074, light: 'dayCrisp' },      // 34.70-35.80  "Pigeons."
  { id: 'birds_out',        a: 1075, b: 1152, light: 'dayCrisp' },      // 35.83-38.40  "Each balloon carried birds out of the city."
  { id: 'pigeons_home',     a: 1153, b: 1262, light: 'goldenSky' },     // 38.43-42.07  "Then, once free, the pigeons flew home with messages."
  { id: 'microfilm_shrink', a: 1263, b: 1360, light: 'studio' },        // 42.10-45.33  "Photographers shrank those messages onto tiny film,"
  { id: 'carry_thousands',  a: 1361, b: 1435, light: 'studio' },        // 45.37-47.83  "so one pigeon could carry thousands."
  { id: 'enemy_shoot',      a: 1436, b: 1515, light: 'siegeDusk' },     // 47.87-50.50  "Enemy soldiers tried to shoot the balloons down,"
  { id: 'got_through',      a: 1516, b: 1574, light: 'goldenSky' },     // 50.53-52.47  "but many still got through."
  { id: 'found_sky',        a: 1575, b: 1690, light: 'goldenDawn' },    // 52.50-56.33  "A city with every road closed still found the sky."
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- atmospheric 1870 Parisian lighting palettes ----------
export const LIGHTS = {
  duskGold: {
    az: 34, el: 26, sky: '#ffdcb8', ground: '#6d5852', hemi: 1.22, sun: '#ffca82', sunI: 2.55,
    fog: '#ebd0b2', fogNear: 95, fogFar: 620, skyTop: '#315d9e', skyHor: '#ffc98c',
    sunDisc: '#fff5cc', sunSize: 0.0038, sat: 1.15, gain: '#fff7eb', vig: 0.17, shadowExt: 42,
  },
  siegeOvercast: {
    az: 42, el: 38, sky: '#b5c6d6', ground: '#595854', hemi: 1.20, sun: '#e3ebf2', sunI: 2.15,
    fog: '#aab8c4', fogNear: 85, fogFar: 540, skyTop: '#3d536b', skyHor: '#b3c0cc',
    sunDisc: '#e8eef5', sunSize: 0.001, sat: 1.05, vig: 0.20, shadowExt: 50,
  },
  warmPlaza: {
    az: 56, el: 44, sky: '#d4e8ff', ground: '#78685a', hemi: 1.28, sun: '#fff2d6', sunI: 2.40,
    fog: '#cfe0ed', fogNear: 95, fogFar: 680, skyTop: '#2a6ec4', skyHor: '#cbe6fa',
    sunDisc: '#fffbe6', sunSize: 0.0022, sat: 1.14, vig: 0.15, shadowExt: 34,
  },
  moonNight: {
    az: -38, el: 34, sky: '#7696d4', ground: '#2e334d', hemi: 1.18, sun: '#d4e4ff', sunI: 1.75,
    fog: '#1e2c4a', fogNear: 75, fogFar: 500, skyTop: '#0e1730', skyHor: '#253c6b',
    sunDisc: '#000000', sunSize: 0, sat: 1.16, lift: '#070a14', gain: '#e0ecff', vig: 0.22, shadowExt: 42,
  },
  dayCrisp: {
    az: 48, el: 48, sky: '#cde6ff', ground: '#6e7a62', hemi: 1.28, sun: '#fff7e2', sunI: 2.45,
    fog: '#c4e2f7', fogNear: 110, fogFar: 740, skyTop: '#1f6fd4', skyHor: '#c4e6ff',
    sunDisc: '#fffce8', sunSize: 0.002, sat: 1.15, vig: 0.14, shadowExt: 34,
  },
  windySlate: {
    az: 24, el: 36, sky: '#b8d0e3', ground: '#5e6b66', hemi: 1.24, sun: '#edf4fa', sunI: 2.25,
    fog: '#b2cadb', fogNear: 85, fogFar: 580, skyTop: '#35608c', skyHor: '#bdd4e3',
    sunDisc: '#f0f7ff', sunSize: 0.0012, sat: 1.10, vig: 0.18, shadowExt: 38,
  },
  goldenSky: {
    az: 26, el: 22, sky: '#ffdeb5', ground: '#786250', hemi: 1.24, sun: '#ffc678', sunI: 2.65,
    fog: '#f5cfa8', fogNear: 110, fogFar: 780, skyTop: '#2e61ad', skyHor: '#ffcb88',
    sunDisc: '#fff3c4', sunSize: 0.0042, sat: 1.17, gain: '#fff7ea', vig: 0.15, shadowExt: 36,
  },
  siegeDusk: {
    az: 18, el: 24, sky: '#d9a48c', ground: '#594840', hemi: 1.20, sun: '#ffae66', sunI: 2.55,
    fog: '#b88c78', fogNear: 85, fogFar: 540, skyTop: '#3a3c63', skyHor: '#e3996b',
    sunDisc: '#ffe29c', sunSize: 0.0035, sat: 1.14, gain: '#ffeede', vig: 0.20, shadowExt: 36,
  },
  studio: {
    az: 54, el: 56, sky: '#fff4de', ground: '#735a44', hemi: 1.38, sun: '#fff2d4', sunI: 2.25,
    fog: '#28364a', fogNear: 100, fogFar: 420, skyTop: '#28364a', skyHor: '#354863',
    sunDisc: '#000000', sunSize: 0, sat: 1.13, vig: 0.14, shadowExt: 16,
  },
  goldenDawn: {
    az: 22, el: 18, sky: '#ffe0b8', ground: '#7a5f4d', hemi: 1.26, sun: '#ffc470', sunI: 2.80,
    fog: '#f7cc9e', fogNear: 105, fogFar: 820, skyTop: '#2c5ba8', skyHor: '#ffc982',
    sunDisc: '#fff6cc', sunSize: 0.0050, sat: 1.18, gain: '#fff8ec', vig: 0.15, shadowExt: 56,
  },
};

export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'surrounded' || S.id === 'found_sky') L.shadowExt = 64;
  return L;
};

// ---------- impact camera kicks synced to speech & visual beats ----------
const KICKS = [
  { f: 132,  a: 0.055 }, // "was UP."
  { f: 262,  a: 0.055 }, // "telegraph wire" snap spark
  { f: 378,  a: 0.045 }, // balloon liftoff surge
  { f: 1047, a: 0.065 }, // "Pigeons." punchy reveal!
  { f: 1168, a: 0.045 }, // "once free," cage door bursts open!
  { f: 1372, a: 0.045 }, // "carry thousands" microfilm pop!
  { f: 1455, a: 0.055 }, // Prussian rifle volley 1
  { f: 1474, a: 0.060 }, // Prussian rifle volley 2 (synced right near audit frame!)
  { f: 1498, a: 0.055 }, // Prussian Krupp anti-balloon shot 3
];

// ---------- post-audit perfected 3D camera choreography ----------
const CAMS = {
  // 1. FRAME-0 HOOK: Iconic 1870 Paris (Notre-Dame, Haussmann blocks) + bold striped gas balloon rising!
  hook_paris: [
    { f: 0,  pos: [16.5, 19.5, 22.0], look: [-3.5, 10.5, -6.0], fov: 44 },
    { f: 42, pos: [11.0, 15.5, 16.5], look: [-4.5, 10.0, -7.5], fov: 40, ease: 'easeOut' },
  ],
  // 2. FIXED: High sweeping orbital reveal clearly showing the ENTIRE encircling Prussian cannon/tent ring around Paris walls!
  surrounded: [
    { f: 43, pos: [64.0, 39.0, 38.0], look: [6.0, 3.0, 0.0],    fov: 50 },
    { f: 64, pos: [68.0, 41.0, 4.0],  look: [6.0, 3.0, 0.0],    fov: 50, path: [[69.0, 40.5, 22.0]] },
    { f: 85, pos: [60.0, 36.0, -32.0],look: [6.0, 3.0, 0.0],    fov: 48 },
  ],
  // 3. POLISHED: Wider low-angle upward tilt showing worried Parisians below + FULL unclipped rising balloon!
  way_out_up: [
    { f: 86,  pos: [7.6, 2.6, 12.2],  look: [0.0, 2.8, -0.5],   fov: 45 },
    { f: 118, pos: [8.6, 3.2, 12.4],  look: [0.0, 7.6, -1.0],   fov: 46 },
    { f: 150, pos: [9.8, 3.8, 12.6],  look: [0.0, 14.0, -1.5],  fov: 46, ease: 'easeOut' },
  ],
  // 4. FIXED: Clear unobstructed framing of BOTH stern Pickelhaube Prussian guards IN FRONT of the striped road barricade!
  closed_road: [
    { f: 151, pos: [20.4, 3.4, 4.4],  look: [28.2, 1.85, 0.0],  fov: 44 },
    { f: 225, pos: [22.4, 3.0, 2.8],  look: [28.2, 1.80, 0.0],  fov: 40, ease: 'easeOut' },
  ],
  // 5. FIXED: Crisp rail track -> centered FULL telegraph pole cross-arm & bright sparking cut wires!
  rail_telegraph: [
    { f: 226, pos: [21.0, 3.4, -5.6],  look: [29.0, 1.3, -10.5], fov: 44 },
    { f: 256, pos: [20.4, 4.6, -11.6], look: [29.0, 4.5, -14.8], fov: 45 },
    { f: 294, pos: [20.0, 5.2, -13.0], look: [29.0, 4.8, -15.2], fov: 43, ease: 'easeOut' },
  ],
  // 6. FIXED: Clean unobstructed view of GAZ•PARIS tank, hose, inflating balloon, Aeronaut & Postman (zero lamp occlusion!)
  fill_balloons: [
    { f: 295, pos: [7.8, 4.6, 15.6],  look: [-2.4, 4.3, -0.8],  fov: 46 },
    { f: 332, pos: [10.8, 5.2, 13.6], look: [-1.8, 4.8, -0.6],  fov: 45, path: [[9.6, 4.9, 14.8]] },
    { f: 370, pos: [13.2, 5.8, 10.6], look: [-1.4, 5.2, -0.5],  fov: 44 },
  ],
  // 7. POLISHED: Wider upward crane showing FULL rising balloon, overflowing mailbags & waving Parisians!
  mail_sky: [
    { f: 371, pos: [12.4, 4.2, 12.6], look: [0.0, 4.8, 0.0],    fov: 46 },
    { f: 408, pos: [13.4, 7.6, 12.4], look: [0.0, 9.2, 0.0],    fov: 45 },
    { f: 446, pos: [14.2, 11.8, 12.0],look: [0.0, 14.0, 0.0],   fov: 44, ease: 'easeOut' },
  ],
  // 8. POLISHED: Indigo moonlit Paris with FULL glowing moon + 7 staggered glowing striped balloons rising together!
  night_fleet: [
    { f: 447, pos: [18.0, 11.5, 25.0], look: [-4.0, 14.5, -7.0], fov: 48 },
    { f: 491, pos: [15.0, 16.5, 20.5], look: [-4.5, 19.0, -7.5], fov: 47, path: [[16.8, 14.0, 23.0]] },
    { f: 536, pos: [12.0, 21.5, 16.0], look: [-5.0, 23.0, -8.0], fov: 46 },
  ],
  // 9. FIXED: Open sightline from Prussian campfire trench — BOTH shocked Pickelhaube guards + campfire + overhead gliding night balloons & moon!
  over_lines: [
    { f: 537, pos: [39.8, 2.4, 15.2], look: [31.6, 3.6, 7.2],   fov: 50 },
    { f: 598, pos: [38.2, 2.5, 13.8], look: [30.8, 5.0, 5.8],   fov: 48 },
  ],
  // 10. POLISHED: Aerial side-track beside drifting balloon gondola with cute Aeronaut & waving Parisian passenger!
  passengers: [
    { f: 599, pos: [9.0, 22.4, 8.2],  look: [3.2, 21.8, 0.0],   fov: 39 },
    { f: 648, pos: [12.6, 23.0, 7.6], look: [6.8, 22.4, 0.0],   fov: 37 },
  ],
  // 11. POLISHED: Slightly wider orbit framing full overflowing POSTE sacks + dancing swarm of white letters!
  millions_letters: [
    { f: 649, pos: [11.6, 23.8, 7.6], look: [5.0, 22.6, 0.0],   fov: 42 },
    { f: 685, pos: [12.8, 24.4, 2.4], look: [5.5, 22.9, 0.0],   fov: 41, path: [[12.6, 24.1, 5.2]] },
    { f: 720, pos: [11.8, 24.8, -2.6],look: [6.0, 23.2, 0.0],   fov: 40 },
  ],
  // 12. POLISHED: Sunset orbit of Minister Léon Gambetta showing his Tricolor sash & waved top hat proudly above rim!
  minister_escape: [
    { f: 721, pos: [6.6, 17.5, 7.8],  look: [0.6, 17.2, 0.0],   fov: 39 },
    { f: 755, pos: [7.8, 19.6, 5.2],  look: [1.0, 19.2, 0.0],   fov: 38, path: [[7.6, 18.6, 6.6]] },
    { f: 789, pos: [8.6, 21.8, 2.4],  look: [1.5, 21.4, 0.0],   fov: 37 },
  ],
  // 13. FIXED: Clean meadow dolly framing FULL landed balloon behind + Minister Gambetta + ALL 3 cheering French soldiers cleanly in upper 70%!
  raise_army: [
    { f: 790, pos: [120.0, 3.0, 15.8], look: [120.0, 2.3, -0.5], fov: 45 },
    { f: 839, pos: [120.2, 2.8, 13.2], look: [120.0, 2.2, -0.5], fov: 42, ease: 'easeOut' },
  ],
  // 14. POLISHED: Slightly wider high-altitude gust track so cartoon wind swirls & anxious Aeronaut frame cleanly!
  cant_fly_back: [
    { f: 840, pos: [114.2, 22.4, 11.4], look: [117.0, 22.0, 0.0], fov: 43, roll: -1.8 },
    { f: 904, pos: [121.0, 22.7, 11.0], look: [124.2, 22.2, 0.0], fov: 42, roll: 1.8 },
  ],
  // 15. POLISHED: Tighter horizontal spread of 3 wind-scattered balloons so all 3 stay cleanly inside frame!
  wind_took_them: [
    { f: 905, pos: [120.0, 16.5, 30.0], look: [120.0, 13.0, -2.0], fov: 46 },
    { f: 967, pos: [124.5, 18.8, 26.0], look: [121.0, 13.5, -2.5], fov: 44 },
  ],
  // 16. FIXED: Centered comic composition — BOTH puzzled Parisian & Postmaster + blue mailbox + centered golden "?"!
  how_replies: [
    { f: 968,  pos: [5.4, 2.6, 11.0],  look: [2.8, 1.9, 2.1],   fov: 43 },
    { f: 1040, pos: [4.6, 2.5, 9.2],   look: [2.8, 1.9, 2.1],   fov: 39, ease: 'easeOut' },
  ],
  // 17. POLISHED: Hero close-up on adorable proud Carrier Pigeon + red message tube + unclipped golden sparkles!
  pigeons_reveal: [
    { f: 1041, pos: [121.2, 2.35, 6.4], look: [121.2, 1.95, 1.8], fov: 37 },
    { f: 1074, pos: [121.2, 2.30, 5.2], look: [121.2, 1.95, 1.8], fov: 33, ease: 'easeOut' },
  ],
  // 18. POLISHED: Slightly wider tracking around ascending balloon gondola showing all strapped wicker pigeon cages cleanly!
  birds_out: [
    { f: 1075, pos: [8.8, 14.0, 7.2],  look: [0.4, 13.2, 0.0],  fov: 42 },
    { f: 1114, pos: [9.0, 16.4, 5.4],  look: [0.4, 15.8, 0.0],  fov: 40, path: [[9.2, 15.2, 6.4]] },
    { f: 1152, pos: [8.4, 19.0, 3.4],  look: [0.4, 18.4, 0.0],  fov: 39 },
  ],
  // 19. FIXED: Dynamic close tracking beside the BIG hero flock of 5 flapping Carrier Pigeons bursting out of the cage & flying home!
  pigeons_home: [
    { f: 1153, pos: [122.6, 2.4, 6.8],  look: [121.2, 1.8, 1.8],  fov: 42 },
    { f: 1207, pos: [120.2, 5.2, 7.6],  look: [118.6, 5.4, 0.6],  fov: 43 },
    { f: 1262, pos: [117.4, 8.6, 6.8],  look: [115.6, 8.8, -0.2], fov: 42, ease: 'easeOut' },
  ],
  // 20. FIXED: Wider studio framing showing FULL "DÉPÊCHES DE PARIS • 1870" board + optical cone + brass camera + bespectacled Photographer!
  microfilm_shrink: [
    { f: 1263, pos: [-120.0, 5.4, 12.6], look: [-120.2, 3.85, -1.5], fov: 45 },
    { f: 1312, pos: [-120.1, 5.1, 11.2], look: [-120.2, 3.85, -1.5], fov: 43 },
    { f: 1360, pos: [-120.2, 4.9, 10.0], look: [-120.2, 3.85, -1.5], fov: 41 },
  ],
  // 21. FIXED: Clean dark studio showcase — glowing amber Microfilm + elevated red quill tube + proud perched Pigeon + fan of tiny letters!
  carry_thousands: [
    { f: 1361, pos: [-120.5, 4.3, 9.6], look: [-120.0, 3.35, 2.0], fov: 42 },
    { f: 1398, pos: [-119.9, 4.2, 8.9], look: [-120.0, 3.35, 2.0], fov: 40, path: [[-120.2, 4.25, 9.25]] },
    { f: 1435, pos: [-119.3, 4.1, 8.4], look: [-120.0, 3.35, 2.0], fov: 39 },
  ],
  // 22. FIXED: Open sightline from Prussian battery (ZERO wall blocking!) — 3 firing Pickelhaube soldiers + Krupp gun + bright muzzle flash + climbing balloon!
  enemy_shoot: [
    { f: 1436, pos: [40.2, 2.6, 15.6],  look: [31.8, 3.5, 7.8],   fov: 48 },
    { f: 1475, pos: [39.2, 2.7, 14.4],  look: [31.2, 4.0, 7.2],   fov: 47 },
    { f: 1515, pos: [38.2, 3.0, 13.2],  look: [30.6, 4.8, 6.6],   fov: 46 },
  ],
  // 23. POLISHED: Slightly wider soaring aerial glide so the full hero balloon & triumphant waving Aeronaut never clip top!
  got_through: [
    { f: 1516, pos: [16.5, 27.2, 18.5], look: [1.2, 27.4, -2.0],  fov: 45 },
    { f: 1574, pos: [13.0, 29.5, 14.5], look: [0.5, 28.8, -2.0],  fov: 43, ease: 'easeOut' },
  ],
  // 24. POLISHED: Sweeping golden-dawn finale crane revealing glowing Paris + armada of balloons + homing pigeons gliding prominently across sky!
  found_sky: [
    { f: 1575, pos: [24.0, 6.0, 7.5],   look: [12.0, 6.2, 0.0],   fov: 45 },
    { f: 1632, pos: [28.0, 16.0, 22.0], look: [-3.0, 13.5, -4.0], fov: 46, path: [[28.0, 11.0, 15.0]] },
    { f: 1690, pos: [29.0, 25.0, 33.0], look: [-5.0, 17.0, -6.0], fov: 47, ease: 'easeOut' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  c.flash = (f === 1455 || f === 1474 || f === 1498) ? 0.22 : 0;
  if (S.id === 'microfilm_shrink' || S.id === 'carry_thousands') {
    c.shadowAt = [-120, 2.5, 0.0];
  } else if (S.id === 'raise_army' || S.id === 'cant_fly_back' || S.id === 'wind_took_them' || S.id === 'pigeons_reveal' || S.id === 'pigeons_home') {
    c.shadowAt = [120, 4.0, 0.0];
  } else if (S.id === 'closed_road' || S.id === 'rail_telegraph' || S.id === 'over_lines' || S.id === 'enemy_shoot') {
    c.shadowAt = [30, 3.0, 2.0];
  } else {
    c.shadowAt = [-2, 6.0, -4.0];
  }
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS RULE: cinf ALWAYS 0 ----------
export const dofAt = (f) => ({ focus: 10, cinf: 0 });

// ---------- animated 3D world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), t = f / 30;
  const W = {
    night: S.light === 'moonNight',
    campfire: false,
    gasHose: false,
    postBox: false,
    countryStage: false,
    studioStage: false,
    releaseCage: false,
    cageDoorOpen: 0,
    opticalBeam: true,
    microStage: false,
    showCameraStage: true,
    heroBalloon: null,
    fleet: [],
  };

  switch (S.id) {
    case 'hook_paris': {
      const k = M.smooth(ramp(f, 0, 42));
      W.heroBalloon = { x: 0, y: lerp(5.2, 8.8, k), z: -2.0, s: 1.08, mailbags: true, cages: true };
      W.fleet = [
        { x: -11, y: 12.5 + k * 2.5, z: -13, s: 0.85 },
        { x: 9,   y: 14.0 + k * 2.0, z: -14, s: 0.78 },
        { x: -18, y: 16.5 + k * 1.8, z: -2,  s: 0.72 },
      ];
      break;
    }
    case 'surrounded':
      W.heroBalloon = { x: 0, y: 0.2, z: 0, s: 0.9, inflate: 0.25 };
      break;
    case 'way_out_up': {
      const k = M.easeIn(ramp(f, 92, 150));
      W.heroBalloon = { x: 0, y: lerp(1.6, 13.5, k), z: -1.5, s: 1.05, mailbags: true };
      break;
    }
    case 'closed_road':
    case 'rail_telegraph':
      break;
    case 'fill_balloons': {
      const infl = M.easeOut(ramp(f, 295, 366));
      W.gasHose = true;
      W.heroBalloon = { x: 0, y: 0.15, z: 0, s: 1.08, inflate: lerp(0.14, 1.0, infl), mailbags: true, sway: 0.02 };
      break;
    }
    case 'mail_sky': {
      const k = M.easeIn(ramp(f, 371, 446));
      W.gasHose = false;
      W.heroBalloon = { x: 0, y: lerp(0.4, 13.8, k), z: 0, s: 1.06, mailbags: true, cages: true };
      break;
    }
    case 'night_fleet': {
      const k = ramp(f, 447, 536);
      W.heroBalloon = { x: -1.5, y: lerp(11.5, 23.0, k), z: -2.0, s: 1.02, mailbags: true };
      W.fleet = [
        { x: -9.5,  y: lerp(15.5, 26.5, k), z: -10.5, s: 0.90 },
        { x: 5.5,   y: lerp(12.0, 23.5, k), z: -9.0,  s: 0.88 },
        { x: -4.5,  y: lerp(21.0, 31.0, k), z: -14.5, s: 0.82 },
        { x: 2.0,   y: lerp(18.0, 28.0, k), z: -18.5, s: 0.80 },
        { x: -7.0,  y: lerp(8.5,  19.0, k), z: 2.5,   s: 0.86 },
        { x: 9.5,   y: lerp(16.0, 26.0, k), z: -15.0, s: 0.76 },
        { x: -13.0, y: lerp(19.5, 29.5, k), z: -17.5, s: 0.74 },
      ];
      break;
    }
    case 'over_lines': {
      const k = ramp(f, 537, 598);
      W.campfire = true;
      // Gliding cleanly overhead right above the campfire-lit Prussian trench & guards!
      W.heroBalloon = { x: lerp(27.5, 31.5, k), y: lerp(5.4, 7.2, k), z: 2.5, s: 0.88, mailbags: true };
      W.fleet = [
        { x: lerp(22.0, 26.5, k), y: lerp(8.2, 9.8, k),  z: -3.5, s: 0.80 },
        { x: lerp(29.0, 33.5, k), y: lerp(10.5, 11.8, k), z: -6.5, s: 0.72 },
      ];
      break;
    }
    case 'passengers': {
      const k = ramp(f, 599, 648);
      W.heroBalloon = { x: lerp(3.2, 6.8, k), y: lerp(20.0, 20.8, k), z: 0, s: 1.02, mailbags: false, cages: false };
      W.fleet = [{ x: -6, y: 24.0, z: -14, s: 0.72 }];
      break;
    }
    case 'millions_letters': {
      const k = ramp(f, 649, 720);
      W.heroBalloon = { x: lerp(5.0, 6.0, k), y: lerp(21.0, 21.8, k), z: 0, s: 1.05, mailbags: true, cages: false };
      W.fleet = [{ x: -5, y: 25.0, z: -14, s: 0.72 }];
      break;
    }
    case 'minister_escape': {
      const k = ramp(f, 721, 789);
      W.heroBalloon = { x: lerp(0.6, 1.5, k), y: lerp(15.6, 19.8, k), z: 0, s: 1.04, mailbags: false, cages: false };
      W.fleet = [{ x: -11, y: 20.5 + k * 2, z: -13, s: 0.78 }];
      break;
    }
    case 'raise_army': {
      W.countryStage = true;
      // Landed striped balloon centered cleanly behind Gambetta & cheering soldiers!
      W.heroBalloon = { x: 119.6, y: 0.2, z: -5.5, s: 0.92, mailbags: false, rz: -0.08, sway: 0.015 };
      break;
    }
    case 'cant_fly_back': {
      const k = ramp(f, 840, 904);
      W.countryStage = true;
      W.heroBalloon = { x: lerp(117.0, 124.2, k), y: 20.4 + Math.sin(t * 3.2) * 0.35, z: 0, s: 1.02, mailbags: false, rz: -0.14 };
      break;
    }
    case 'wind_took_them': {
      const k = ramp(f, 905, 967);
      W.countryStage = true;
      // 3 balloons kept cleanly inside vertical frame scattering on wind currents!
      W.heroBalloon = { x: lerp(115.5, 121.5, k), y: lerp(11.0, 14.5, k), z: -1.5, s: 0.92, rz: -0.15 };
      W.fleet = [
        { x: lerp(122.0, 126.5, k), y: lerp(15.5, 12.2, k), z: -7.5, s: 0.80, rz: 0.14 },
        { x: lerp(114.0, 117.5, k), y: lerp(17.5, 20.5, k), z: -10.5, s: 0.74, rz: -0.12 },
      ];
      break;
    }
    case 'how_replies': {
      W.postBox = true;
      break;
    }
    case 'pigeons_reveal': {
      W.countryStage = true;
      W.releaseCage = true;
      W.cageDoorOpen = 0;
      break;
    }
    case 'birds_out': {
      const k = ramp(f, 1075, 1152);
      W.heroBalloon = { x: 0.4, y: lerp(11.8, 17.0, k), z: 0, s: 1.04, mailbags: true, cages: true };
      W.fleet = [
        { x: -9.0, y: lerp(15.0, 19.5, k), z: -10.0, s: 0.82, cages: true },
        { x: 10.5, y: lerp(13.5, 18.0, k), z: -11.0, s: 0.78, cages: true },
      ];
      break;
    }
    case 'pigeons_home': {
      W.countryStage = true;
      W.releaseCage = true;
      W.cageDoorOpen = M.back(ramp(f, 1164, 1178), 1.6);
      W.heroBalloon = { x: 113.5, y: 0.2, z: -7.5, s: 0.88, cages: true, rz: -0.06 };
      break;
    }
    case 'microfilm_shrink': {
      W.studioStage = true;
      W.opticalBeam = true;
      W.microStage = false;
      W.showCameraStage = true;
      break;
    }
    case 'carry_thousands': {
      W.studioStage = true;
      W.opticalBeam = false;
      W.microStage = true;
      W.showCameraStage = false; // Clean dark navy studio backdrop behind microfilm, quill tube & perched pigeon!
      break;
    }
    case 'enemy_shoot': {
      const k = ramp(f, 1436, 1515);
      W.campfire = true;
      // Climbing striped balloon visible right above the firing Prussian Pickelhaube soldiers!
      W.heroBalloon = { x: lerp(27.0, 28.5, k), y: lerp(6.8, 11.2, k), z: 3.0, s: 0.88, mailbags: true };
      W.fleet = [{ x: lerp(22.0, 24.5, k), y: lerp(10.0, 13.8, k), z: -4.0, s: 0.76 }];
      break;
    }
    case 'got_through': {
      const k = ramp(f, 1516, 1574);
      W.heroBalloon = { x: lerp(2.0, 0.5, k), y: lerp(24.6, 26.8, k), z: -1.5, s: 1.02, mailbags: false, cages: true };
      W.fleet = [
        { x: -8.5, y: 27.5 + k * 2.2, z: -8.0,  s: 0.86 },
        { x: 10.0, y: 25.5 + k * 2.4, z: -9.5,  s: 0.80 },
        { x: -3.0, y: 31.0 + k * 1.8, z: -14.5, s: 0.72 },
      ];
      break;
    }
    case 'found_sky': {
      const k = ramp(f, 1575, 1690);
      W.heroBalloon = { x: 1.0, y: lerp(9.0, 16.5, k), z: -2.0, s: 1.06, mailbags: true, cages: true };
      W.fleet = [
        { x: -10.5, y: lerp(11.5, 19.0, k), z: -10.5, s: 0.90 },
        { x: 9.5,   y: lerp(13.0, 21.0, k), z: -8.5,  s: 0.86 },
        { x: -17.0, y: lerp(15.0, 22.5, k), z: -1.5,  s: 0.80 },
        { x: -4.0,  y: lerp(18.5, 26.0, k), z: -16.5, s: 0.76 },
        { x: 14.5,  y: lerp(10.5, 18.0, k), z: 5.5,   s: 0.84 },
        { x: -13.5, y: lerp(13.5, 20.5, k), z: 9.5,   s: 0.78 },
        { x: 4.0,   y: lerp(22.0, 29.0, k), z: -21.0, s: 0.68 },
      ];
      break;
    }
  }
  return W;
};

// ---------- 2D bean-head billboard actors ----------
const C = (T, role, o, pos, extra = {}) => ({
  key: role + JSON.stringify(o),
  draw: (p) => T.parisChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'moonNight' ? '#c8daf5' : (S.light === 'duskGold' || S.light === 'goldenSky' || S.light === 'goldenDawn') ? '#ffebd6' : S.light === 'siegeDusk' ? '#ffd9c2' : '#ffffff';
  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 'way_out_up': {
      out.push(C(T, 'parisianA', { ...id(1), seed: 1, L: 'pointUp', R: 'hip', expr: 'excited', facing: 1 }, [-1.6, 0, 2.8], { tint, ground: 0 }));
      out.push(C(T, 'parisianB', { ...id(2), seed: 2, L: 'hang', R: 'pointUp', expr: 'shock', facing: -1 }, [1.7, 0, 2.6], { tint, ground: 0 }));
      break;
    }
    case 'closed_road': {
      // FIXED: Standing cleanly IN FRONT of the red-and-white road barricade so BOTH stern Pickelhaube guards are 100% visible!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'hip', R: 'point', expr: 'stern', facing: -1 }, [27.3, 0, -1.10], { tint, ground: 0, s: 1.04 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'hold', R: 'hip', expr: 'determined', facing: -1 }, [27.4, 0, 1.15], { tint, ground: 0, s: 1.04 }));
      break;
    }
    case 'fill_balloons': {
      // Positioned cleanly clear of the street lamp & edges!
      out.push(C(T, 'aeronaut',     { ...id(3), seed: 3, L: 'pointUp', R: 'hip', expr: 'determined', facing: 1 }, [-2.3, 0, 2.4], { tint, ground: 0, s: 1.02 }));
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'hold', R: 'wave', mailbag: true, wv: q(f * 0.3, 1), expr: 'grin', facing: -1 }, [2.0, 0, 2.8], { tint, ground: 0, s: 1.02 }));
      break;
    }
    case 'mail_sky': {
      const k = M.easeIn(ramp(f, 371, 446));
      const by = lerp(0.4, 13.8, k);
      out.push(C(T, 'aeronaut',     { ...id(3), seed: 3, inBasket: true, L: 'wave', R: 'up', wv: q(f * 0.36, 1), expr: 'laugh', facing: 1 }, [0.55, by + 1.00, 0.55], { tint, blob: false, s: 0.96, order: 4 }));
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'wave', R: 'up', letter: true, wv: q(f * 0.35, 1), expr: 'excited', facing: 1 }, [-3.0, 0, 3.0], { tint, ground: 0 }));
      out.push(C(T, 'parisianB',    { ...id(2), seed: 2, L: 'up', R: 'wave', wv: q(f * 0.38 + 1, 1), expr: 'grin', facing: -1 }, [3.0, 0, 2.8], { tint, ground: 0 }));
      break;
    }
    case 'over_lines': {
      // FIXED: Shocked Pickelhaube guards standing cleanly beside glowing campfire looking UP at night balloons overhead!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'pointUp', R: 'hang', expr: 'shock', facing: -1 }, [32.3, 0, 8.6], { tint: '#ffe4b8', ground: 0, s: 1.06 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'hang', R: 'pointUp', expr: 'shock', facing: 1 },  [34.3, 0, 10.0], { tint: '#ffe4b8', ground: 0, s: 1.06 }));
      break;
    }
    case 'passengers': {
      const k = ramp(f, 599, 648);
      const bx = lerp(3.2, 6.8, k), by = lerp(20.0, 20.8, k);
      out.push(C(T, 'aeronaut',  { ...id(3), seed: 3, inBasket: true, L: 'tug', R: 'hip', expr: 'grin', facing: 1 }, [bx - 0.38, by + 1.02, 0.54], { tint, blob: false, s: 0.98, order: 4 }));
      out.push(C(T, 'parisianB', { ...id(2), seed: 2, inBasket: true, L: 'hold', R: 'wave', letter: true, wv: q(f * 0.36, 1), expr: 'excited', facing: 1 }, [bx + 0.44, by + 1.02, 0.54], { tint, blob: false, s: 0.98, order: 4 }));
      break;
    }
    case 'minister_escape': {
      const k = ramp(f, 721, 789);
      const bx = lerp(0.6, 1.5, k), by = lerp(15.6, 19.8, k);
      // Raised slightly so Minister Gambetta's Tricolor sash shines boldly above the wicker rim!
      out.push(C(T, 'minister', { ...id(8), seed: 8, inBasket: true, L: 'hip', R: 'wave', hatWave: true, wv: q(f * 0.30, 1), expr: 'laugh', facing: 1 }, [bx + 0.25, by + 1.06, 0.56], { tint, blob: false, s: 1.04, order: 4 }));
      break;
    }
    case 'raise_army': {
      // FIXED: Tightly grouped hero rally — Minister Gambetta + ALL 3 cheering red-trousered soldiers cleanly inside frame!
      const bounce = (s) => q(Math.abs(Math.sin((f + s) * 0.24)) * 0.03, 3);
      out.push(C(T, 'minister',      { ...id(8),  seed: 8,  L: 'hip', R: 'up', tricolorFlag: true, wv: q(f * 0.34, 1), expr: 'laugh', facing: 1 }, [119.3, 0, 1.4], { tint, ground: 0, s: 1.05 }));
      out.push(C(T, 'frenchSoldier', { ...id(21), seed: 21, bob: bounce(0), L: 'hip', R: 'up', rifleUp: true, expr: 'excited', facing: -1 }, [121.0, 0, 1.5], { tint, ground: 0, s: 1.00 }));
      out.push(C(T, 'frenchSoldier', { ...id(22), seed: 22, bob: bounce(4), L: 'wave', R: 'up', rifleUp: true, wv: q(f * 0.36, 1), expr: 'grin', facing: -1 }, [122.1, 0, 2.3], { tint, ground: 0, s: 0.98 }));
      out.push(C(T, 'frenchSoldier', { ...id(23), seed: 23, bob: bounce(8), L: 'up', R: 'up', rifleUp: true, expr: 'excited', facing: 1 },  [117.8, 0, 2.1], { tint, ground: 0, s: 0.98 }));
      break;
    }
    case 'cant_fly_back': {
      const k = ramp(f, 840, 904);
      const bx = lerp(117.0, 124.2, k), by = 20.4 + Math.sin((f / 30) * 3.2) * 0.35;
      out.push(C(T, 'aeronaut', { ...id(3), seed: 3, inBasket: true, L: 'tug', R: 'tug', expr: 'nervous', facing: -1 }, [bx + 0.1, by + 1.02, 0.56], { tint, blob: false, s: 0.98, order: 4 }));
      break;
    }
    case 'how_replies': {
      // FIXED: Both puzzled Parisian & Postmaster cleanly framed beside the blue pillar mailbox!
      out.push(C(T, 'parisianA',    { ...id(1), seed: 1, L: 'hip', R: 'shrug', expr: 'worried', facing: 1 },  [1.6, 0, 2.2], { tint, ground: 0, s: 1.02 }));
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'shrug', R: 'shrug', expr: 'puzzled', facing: -1 }, [3.0, 0, 2.1], { tint, ground: 0, s: 1.04 }));
      break;
    }
    case 'microfilm_shrink': {
      // FIXED: Bespectacled Photographer René Dagron standing clearly visible behind/beside his brass bellows camera!
      out.push(C(T, 'photographer', { ...id(30), seed: 30, L: 'hold', R: 'up', loupe: true, microfilm: true, expr: 'grin', facing: -1 }, [-118.4, 2.04, -0.5], { ground: 2.04, blob: false, s: 1.05 }));
      break;
    }
    case 'enemy_shoot': {
      // FIXED: 3 stern Pickelhaube Prussian soldiers aiming rifles & swivel gun skyward in full view!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'aim', R: 'aim', rifleAim: true, expr: 'determined', facing: -1 }, [32.7, 0, 8.2],  { tint, ground: 0, s: 1.05 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'aim', R: 'aim', rifleAim: true, expr: 'stern', facing: -1 },      [34.3, 0, 9.6],  { tint, ground: 0, s: 1.05 }));
      out.push(C(T, 'prussian', { ...id(13), seed: 13, L: 'aim', R: 'aim', rifleAim: true, expr: 'effort', facing: -1 },     [31.7, 0, 10.6], { tint, ground: 0, s: 1.04 }));
      break;
    }
    case 'got_through': {
      const k = ramp(f, 1516, 1574);
      const bx = lerp(2.0, 0.5, k), by = lerp(24.6, 26.8, k);
      out.push(C(T, 'aeronaut', { ...id(3), seed: 3, inBasket: true, L: 'wave', R: 'up', wv: q(f * 0.36, 1), expr: 'laugh', facing: 1 }, [bx + 0.35, by + 1.02, -0.95], { tint, blob: false, s: 0.98, order: 4 }));
      break;
    }
  }
  return out;
};

// ---------- 2D Carrier Pigeons & Cinematic FX ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], t = f / 30;

  // Sparking severed telegraph wire (Shot 5)
  if (S.id === 'rail_telegraph' && f >= 254) {
    const spT = q(((f - 254) % 14) / 14, 2);
    out.push(FX('spark_' + spT, (p) => T.fxSpark(p, spT), [30.15, 2.35, -14.1], 0.90, { order: 6 }));
  }

  // Coal-gas inflation steam hiss around gas hose (Shot 6)
  if (S.id === 'fill_balloons') {
    for (let i = 0; i < 2; i++) {
      const k = q(((f * 0.025 + i * 0.5) % 1), 2);
      out.push(FX('gsmoke_' + k, (p) => T.fxSmoke(p, k, '#e8f0f5'), [-2.2 + k * 0.8, 0.5 + k * 2.4, -0.8], 1.1 + k * 0.8));
    }
  }

  // Celebratory swirl of crisp wax-sealed white letters around mail balloon (Shot 11: "millions of letters")
  if (S.id === 'millions_letters') {
    const bx = lerp(5.0, 6.0, ramp(f, 649, 720));
    const by = lerp(21.0, 21.8, ramp(f, 649, 720));
    for (let i = 0; i < 7; i++) {
      const ang = t * 1.9 + (i / 7) * Math.PI * 2;
      const lx = bx + Math.cos(ang) * 2.15;
      const ly = by + 1.4 + Math.sin(t * 2.4 + i) * 0.75 + (i % 3) * 0.35;
      const lz = Math.sin(ang) * 2.15;
      const rd = q(Math.sin(t * 4 + i * 1.7) * 22, 0);
      out.push(FX('let_' + rd, (p) => T.fxLetter(p, rd), [lx, ly, lz], 0.68, { order: 6 }));
    }
  }

  // Cartoon wind gust swirls shoving balloons unpredictably (Shots 14-15)
  if (S.id === 'cant_fly_back') {
    const ph = q((t * 1.4) % 6.28, 1);
    const bx = lerp(117.0, 124.2, ramp(f, 840, 904));
    out.push(FX('wind_' + ph, (p) => T.fxWindSwirl(p, ph), [bx - 2.3, 21.8, 1.2], 1.85, { order: 6 }));
    out.push(FX('wind2_' + ph, (p) => T.fxWindSwirl(p, ph + 1.8), [bx + 2.0, 24.0, -1.0], 1.55, { order: 6 }));
  }
  if (S.id === 'wind_took_them') {
    const ph = q((t * 1.3) % 6.28, 1);
    out.push(FX('w1_' + ph, (p) => T.fxWindSwirl(p, ph), [118.0, 13.5, 4.0], 2.6, { order: 6 }));
    out.push(FX('w2_' + ph, (p) => T.fxWindSwirl(p, ph + 2.2), [124.5, 16.5, -2.5], 2.3, { order: 6 }));
  }

  // Centered bold golden Question Mark over puzzled Paris plaza (Shot 16)
  if (S.id === 'how_replies') {
    const ph = q((t * 1.6) % 6.28, 1);
    const pop = M.back(ramp(f, 974, 988), 1.6);
    out.push(FX('q1_' + ph, (p) => T.fxQuestion(p, ph), [2.5, 2.40, 2.1], 0.90 * pop, { order: 6 }));
  }

  // HERO CARRIER PIGEON REVEAL (Shot 17: "Pigeons.") with unclipped golden sparkles!
  if (S.id === 'pigeons_reveal') {
    const pop = M.back(ramp(f, 1041, 1052), 1.5);
    const ph = q((t * 2.0) % 6.28, 1);
    out.push(FX('heroPigeon', (p) => T.fxPigeon(p, 0, true, true), [121.2, 1.64 - 0.69 * 1.05 * pop, 1.8], 1.05 * pop, { order: 6 }));
    out.push(FX('pspk_' + ph, (p) => T.fxSparkle(p, ph), [121.2, 1.48, 1.88], 0.85, { order: 7 }));
  }

  // Cute carrier pigeons fluttering beside balloon's strapped wicker cages (Shot 18)
  if (S.id === 'birds_out') {
    const by = lerp(11.8, 17.0, ramp(f, 1075, 1152));
    const wp = q((f * 0.55) % 6.28, 1);
    out.push(FX('pg_b1_' + wp, (p) => T.fxPigeon(p, wp, true, false), [2.1, by + 1.2 + Math.sin(t * 4) * 0.25, 1.3], 0.72, { order: 6 }));
    out.push(FX('pg_b2_' + wp, (p) => T.fxPigeon(p, wp + 1.5, true, false), [-1.6, by + 1.5 + Math.cos(t * 4.2) * 0.22, 1.4], 0.66, { flip: true, order: 6 }));
  }

  // FIXED S19: BIG, HEROIC V-formation flock of 5 flapping Carrier Pigeons with red message tubes flying CLOSE to camera!
  if (S.id === 'pigeons_home') {
    const wp = q((f * 0.62) % 6.28, 1);
    const specs = [
      { delay: 0,  dx:  0.0, dy:  0.4, dz:  0.6, s: 1.06 },
      { delay: 3,  dx: -1.3, dy:  1.1, dz: -0.2, s: 0.94 },
      { delay: 6,  dx:  1.2, dy:  0.9, dz: -0.5, s: 0.96 },
      { delay: 9,  dx: -2.1, dy: -0.5, dz: -0.8, s: 0.86 },
      { delay: 12, dx:  1.9, dy: -0.6, dz: -1.1, s: 0.88 },
    ];
    for (let i = 0; i < specs.length; i++) {
      const sp = specs[i];
      const u = clamp((f - (1166 + sp.delay)) / 88);
      if (u <= 0) {
        if (i === 0) out.push(FX('pg_wait', (p) => T.fxPigeon(p, 0, true, true), [121.2, 1.64 - 0.69 * 0.88, 1.8], 0.88, { order: 6 }));
        continue;
      }
      const ease = M.smooth(u);
      const px = lerp(121.2, 115.4 + sp.dx, ease);
      const py = lerp(1.6, 8.8 + sp.dy, ease) + Math.sin(u * Math.PI) * 1.1;
      const pz = lerp(1.8, -0.2 + sp.dz, ease);
      out.push(FX('pg_fly_' + i + '_' + wp, (p) => T.fxPigeon(p, wp + i * 1.1, true, false), [px, py, pz], sp.s, { flip: true, order: 6 }));
    }
  }

  // FIXED S21: Hero Perched Carrier Pigeon on right wooden perch + Magical Fan of Miniature Envelopes blossoming cleanly above!
  if (S.id === 'carry_thousands') {
    // Perch top is at (-118.85, 2.88, 2.0) -> plant pigeon toes flush on perch!
    out.push(FX('studioPigeon', (p) => T.fxPigeon(p, 0, true, true), [-118.85, 2.88 - 0.69 * 0.92, 2.0], 0.92, { flip: true, order: 6 }));
    const fanK = M.back(ramp(f, 1368, 1388), 1.4);
    const ph = q((t * 1.6) % 6.28, 1);
    out.push(FX('minifan_' + q(fanK, 2), (p) => T.fxMiniLetterFan(p, fanK), [-120.0, 3.65, 1.5], 1.72, { order: 4 }));
    out.push(FX('mspk_' + ph, (p) => T.fxSparkle(p, ph), [-121.1, 3.05, 2.1], 0.85, { order: 7 }));
  }

  // FIXED S22: Prussian Rifle & Swivel-Cannon Muzzle Flashes + Rising Gunsmoke right beside the visible Pickelhaube soldiers!
  if (S.id === 'enemy_shoot') {
    const shots = [
      { f0: 1453, pos: [31.9, 2.65, 8.2] },
      { f0: 1472, pos: [33.4, 2.65, 9.6] }, // Bright explosive flash right at audit midpoint f1475!
      { f0: 1496, pos: [30.7, 3.55, 9.0] }, // Krupp swivel anti-balloon cannon!
    ];
    for (let i = 0; i < shots.length; i++) {
      const sh = shots[i];
      if (f >= sh.f0 && f < sh.f0 + 8) {
        const mf = q((f - sh.f0) / 8, 2);
        out.push(FX('mf_' + mf, (p) => T.fxMuzzleFlash(p, mf), sh.pos, 1.15, { order: 7 }));
      }
      if (f >= sh.f0 + 2 && f < sh.f0 + 32) {
        const sm = q((f - sh.f0 - 2) / 30, 2);
        out.push(FX('gsm_' + sm, (p) => T.fxSmoke(p, sm, '#e8ecf2'), [sh.pos[0] - sm * 1.4, sh.pos[1] + sm * 3.8, sh.pos[2]], 1.25 + sm * 1.4, { order: 6 }));
      }
    }
  }

  // Trailing smoke wisps in Shot 23 ("but many still got through")
  if (S.id === 'got_through') {
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.016 + i * 0.33) % 1), 2);
      out.push(FX('tsm_' + k, (p) => T.fxSmoke(p, k, '#f2eee8'), [6.5 - i * 4.5, 21.5 + k * 4.0, -5.0], 2.0 + k * 1.4, { order: 3 }));
    }
  }

  // Triumphant flock of carrier pigeons gliding prominently across golden Parisian sunrise sky (Shot 24)
  if (S.id === 'found_sky') {
    const k = ramp(f, 1575, 1690);
    const wp = q((f * 0.52) % 6.28, 1);
    for (let i = 0; i < 4; i++) {
      const px = lerp(16.0 - i * 2.5, 4.0 - i * 3.0, k);
      const py = lerp(11.5 + i * 1.8, 18.0 + i * 1.6, k) + Math.sin(t * 3 + i) * 0.4;
      const pz = 8.5 - i * 2.8;
      out.push(FX('finpg_' + i + '_' + wp, (p) => T.fxPigeon(p, wp + i * 1.3, true, false), [px, py, pz], 1.15, { flip: true, order: 6 }));
    }
    const ph = q((t * 1.4) % 6.28, 1);
    out.push(FX('fspk_' + ph, (p) => T.fxSparkle(p, ph), [1.0, lerp(13.0, 21.0, k), -2.0], 2.2, { order: 7 }));
  }

  return out;
};
