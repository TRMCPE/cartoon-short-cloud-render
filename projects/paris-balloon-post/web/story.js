// Master 24-shot plan for "Paris Found the Sky" (Siege of Paris, 1870) — timed to voice.mp3 (56.35s, 30 fps, TOTAL = 1691).
// Strict Quality Locks: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion,
// upper-70% hero framing clear of y = 76% Rollo bottom-third viral subtitles.
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
    fog: '#aab8c4', fogNear: 75, fogFar: 480, skyTop: '#3d536b', skyHor: '#b3c0cc',
    sunDisc: '#e8eef5', sunSize: 0.001, sat: 1.05, vig: 0.20, shadowExt: 44,
  },
  warmPlaza: {
    az: 56, el: 44, sky: '#d4e8ff', ground: '#78685a', hemi: 1.28, sun: '#fff2d6', sunI: 2.40,
    fog: '#cfe0ed', fogNear: 95, fogFar: 680, skyTop: '#2a6ec4', skyHor: '#cbe6fa',
    sunDisc: '#fffbe6', sunSize: 0.0022, sat: 1.14, vig: 0.15, shadowExt: 34,
  },
  moonNight: {
    az: -38, el: 34, sky: '#6f8ec9', ground: '#2a2e45', hemi: 1.12, sun: '#c9ddff', sunI: 1.65,
    fog: '#1e2c4a', fogNear: 65, fogFar: 460, skyTop: '#0e1730', skyHor: '#253c6b',
    sunDisc: '#000000', sunSize: 0, sat: 1.16, lift: '#060812', gain: '#dce8ff', vig: 0.24, shadowExt: 40,
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
    az: 18, el: 24, sky: '#d9a48c', ground: '#594840', hemi: 1.18, sun: '#ffae66', sunI: 2.50,
    fog: '#b88c78', fogNear: 75, fogFar: 500, skyTop: '#3a3c63', skyHor: '#e3996b',
    sunDisc: '#ffe29c', sunSize: 0.0035, sat: 1.14, gain: '#ffeede', vig: 0.21, shadowExt: 36,
  },
  studio: {
    az: 54, el: 56, sky: '#fff4de', ground: '#735a44', hemi: 1.36, sun: '#fff2d4', sunI: 2.25,
    fog: '#28364a', fogNear: 100, fogFar: 420, skyTop: '#28364a', skyHor: '#354863',
    sunDisc: '#000000', sunSize: 0, sat: 1.13, vig: 0.14, shadowExt: 16,
  },
  goldenDawn: {
    az: 22, el: 18, sky: '#ffe0b8', ground: '#7a5f4d', hemi: 1.26, sun: '#ffc470', sunI: 2.80,
    fog: '#f7cc9e', fogNear: 105, fogFar: 820, skyTop: '#2c5ba8', skyHor: '#ffc982',
    sunDisc: '#fff6cc', sunSize: 0.0050, sat: 1.18, gain: '#fff8ec', vig: 0.15, shadowExt: 52,
  },
};

export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'surrounded' || S.id === 'found_sky') L.shadowExt = 56;
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
  { f: 1462, a: 0.060 }, // Prussian rifle volley 1
  { f: 1486, a: 0.060 }, // Prussian rifle volley 2
  { f: 1504, a: 0.055 }, // Prussian Krupp anti-balloon shot 3
];

// ---------- continuous 3D camera choreography (upper-70% framing clear of y=76% subtitles) ----------
const CAMS = {
  // 1. FRAME-0 HOOK: Aerial swoop over iconic 1870 Paris (Notre-Dame, Panthéon, Haussmann roofs) + bold red-striped gas balloon rising!
  hook_paris: [
    { f: 0,  pos: [16.5, 19.5, 22.0], look: [-3.5, 10.5, -6.0], fov: 44 },
    { f: 42, pos: [11.0, 15.5, 16.5], look: [-4.5, 10.0, -7.5], fov: 40, ease: 'easeOut' },
  ],
  // 2. High orbital sweep revealing Paris completely encircled by Prussian siege cannons, sandbags & tents
  surrounded: [
    { f: 43, pos: [52.0, 26.0, 32.0], look: [-2.0, 3.5, 0.0],   fov: 46 },
    { f: 64, pos: [56.0, 24.0, 2.0],  look: [-2.0, 3.5, 0.0],   fov: 45, path: [[56.0, 25.0, 18.0]] },
    { f: 85, pos: [48.0, 22.0, -28.0],look: [-2.0, 3.5, 0.0],   fov: 44 },
  ],
  // 3. Dramatic low-angle upward tilt from worried Parisians in the plaza -> soaring balloon rising into open sky!
  way_out_up: [
    { f: 86,  pos: [5.2, 2.3, 9.2],   look: [0.0, 2.4, 0.0],    fov: 42 },
    { f: 120, pos: [5.8, 2.5, 8.8],   look: [0.0, 7.2, 0.0],    fov: 43 },
    { f: 150, pos: [6.4, 2.8, 8.4],   look: [0.0, 13.5, 0.0],   fov: 44, ease: 'easeOut' },
  ],
  // 4. Low push-in toward the red-and-white blocked cobblestone road + stern Pickelhaube Prussian guards
  closed_road: [
    { f: 151, pos: [21.5, 3.0, 3.8],  look: [29.2, 1.8, 0.0],   fov: 43 },
    { f: 225, pos: [23.6, 2.6, 2.2],  look: [29.2, 1.7, 0.0],   fov: 38, ease: 'easeOut' },
  ],
  // 5. Dynamic lateral dolly-pan from smashed iron railway tracks -> snapped sparking telegraph pole!
  rail_telegraph: [
    { f: 226, pos: [21.8, 2.8, -6.4],  look: [29.0, 1.4, -10.5], fov: 42 },
    { f: 256, pos: [22.4, 3.8, -10.8], look: [29.0, 3.6, -13.5], fov: 41 },
    { f: 294, pos: [22.2, 5.2, -13.2], look: [29.0, 4.9, -15.5], fov: 39, ease: 'easeOut' },
  ],
  // 6. Hero arc around Place Saint-Pierre gasworks as GAZ•PARIS tank inflates the giant striped balloon!
  fill_balloons: [
    { f: 295, pos: [6.8, 4.6, 13.2],  look: [-2.8, 4.2, -1.2],  fov: 45 },
    { f: 332, pos: [10.4, 5.4, 10.6], look: [-2.2, 5.0, -1.0],  fov: 44, path: [[9.2, 5.0, 12.2]] },
    { f: 370, pos: [12.4, 6.2, 7.2],  look: [-1.8, 5.5, -0.8],  fov: 43 },
  ],
  // 7. Exhilarating upward crane following the newly inflated mail balloon lifting off past waving Parisians!
  mail_sky: [
    { f: 371, pos: [10.8, 3.6, 10.5], look: [0.0, 4.8, 0.0],    fov: 45 },
    { f: 410, pos: [11.5, 6.8, 10.2], look: [0.0, 8.8, 0.0],    fov: 44 },
    { f: 446, pos: [12.2, 11.2, 9.8], look: [0.0, 13.8, 0.0],   fov: 43, ease: 'easeOut' },
  ],
  // 8. Gorgeous indigo moonlit Paris: crane climbing through a glowing fleet of night balloons + warm attic windows!
  night_fleet: [
    { f: 447, pos: [17.0, 12.5, 22.0], look: [-4.0, 14.0, -6.0], fov: 46 },
    { f: 492, pos: [14.5, 17.5, 17.5], look: [-4.5, 18.5, -6.5], fov: 44, path: [[16.0, 15.0, 20.0]] },
    { f: 536, pos: [11.5, 22.5, 13.5], look: [-5.0, 22.5, -7.0], fov: 43 },
  ],
  // 9. Low-angle dolly inside campfire-lit Prussian siege trench looking UP past shocked guards as night balloons glide overhead!
  over_lines: [
    { f: 537, pos: [37.4, 2.3, 14.8], look: [30.0, 4.6, 6.0],   fov: 46 },
    { f: 598, pos: [36.2, 2.5, 13.0], look: [29.0, 7.8, 4.0],   fov: 44 },
  ],
  // 10. Aerial close-up side-track beside drifting balloon gondola with Parisian passenger waving + aeronaut!
  passengers: [
    { f: 599, pos: [8.8, 22.4, 7.8],  look: [3.2, 21.8, 0.0],   fov: 38 },
    { f: 648, pos: [12.4, 23.0, 7.2], look: [6.8, 22.4, 0.0],   fov: 36 },
  ],
  // 11. Orbiting close-up around balloon gondola overflowing with POSTE PARIS mailbags & swirling white letters!
  millions_letters: [
    { f: 649, pos: [10.4, 23.8, 6.8], look: [5.0, 22.6, 0.0],   fov: 40 },
    { f: 685, pos: [11.8, 24.4, 2.2], look: [5.5, 22.9, 0.0],   fov: 39, path: [[11.6, 24.1, 4.6]] },
    { f: 720, pos: [10.6, 24.8, -2.4],look: [6.0, 23.2, 0.0],   fov: 38 },
  ],
  // 12. Heroic sunset orbit of Minister Léon Gambetta (Tricolor sash, waving top hat!) ascending over besieged Paris
  minister_escape: [
    { f: 721, pos: [6.4, 17.5, 7.4],  look: [0.6, 17.2, 0.0],   fov: 38 },
    { f: 755, pos: [7.6, 19.6, 4.8],  look: [1.0, 19.2, 0.0],   fov: 37, path: [[7.4, 18.6, 6.2]] },
    { f: 789, pos: [8.4, 21.8, 2.0],  look: [1.5, 21.4, 0.0],   fov: 36 },
  ],
  // 13. World 2 Countryside Meadow: dynamic dolly-in as Minister Gambetta waves Tricolor rallying cheering French soldiers!
  raise_army: [
    { f: 790, pos: [120.0, 3.6, 12.6], look: [120.0, 2.6, 0.2], fov: 44 },
    { f: 839, pos: [120.4, 3.1, 9.6],  look: [120.0, 2.4, 0.2], fov: 40, ease: 'easeOut' },
  ],
  // 14. High-altitude windy track: Aeronaut tugging ropes futilely as gusts push his balloon away from Paris!
  cant_fly_back: [
    { f: 840, pos: [114.5, 22.2, 9.5], look: [117.0, 21.8, 0.0], fov: 42, roll: -1.8 },
    { f: 904, pos: [121.0, 22.5, 9.2], look: [124.2, 22.0, 0.0], fov: 41, roll: 1.8 },
  ],
  // 15. Wide aerial sweep watching 3 balloons scattering in wild directions across rolling French countryside!
  wind_took_them: [
    { f: 905, pos: [120.0, 16.5, 28.0], look: [120.0, 12.5, 0.0], fov: 46 },
    { f: 967, pos: [126.0, 19.0, 23.0], look: [122.0, 13.0, -2.0],fov: 43 },
  ],
  // 16. Back in Paris plaza: quick comic push-in on puzzled Postmaster & Parisian beside empty mailbox + floating "?"!
  how_replies: [
    { f: 968,  pos: [6.8, 2.5, 9.6],   look: [2.8, 1.9, 1.8],   fov: 42 },
    { f: 1040, pos: [5.6, 2.4, 7.6],   look: [2.8, 1.9, 1.8],   fov: 38, ease: 'easeOut' },
  ],
  // 17. PUNCHY 1.1s REVEAL: Snappy hero close-up push-in on adorable proud Carrier Pigeon with red message tube!
  pigeons_reveal: [
    { f: 1041, pos: [121.2, 2.35, 5.6], look: [121.2, 2.05, 1.8], fov: 36 },
    { f: 1074, pos: [121.2, 2.30, 4.4], look: [121.2, 2.05, 1.8], fov: 32, ease: 'easeOut' },
  ],
  // 18. Tracking close along ascending balloon gondola showing wicker pigeon cages strapped to the basket rim!
  birds_out: [
    { f: 1075, pos: [7.6, 13.8, 6.2],  look: [0.4, 13.0, 0.0],  fov: 40 },
    { f: 1114, pos: [7.8, 16.2, 4.6],  look: [0.4, 15.6, 0.0],  fov: 38, path: [[8.0, 15.0, 5.4]] },
    { f: 1152, pos: [7.2, 18.8, 2.6],  look: [0.4, 18.2, 0.0],  fov: 37 },
  ],
  // 19. Two-beat countryside -> sky dolly: pigeon cage door pops open (f1168) and flapping flock swoops home with messages!
  pigeons_home: [
    { f: 1153, pos: [123.5, 2.6, 6.8],  look: [121.2, 1.8, 1.8],  fov: 42 },
    { f: 1190, pos: [121.5, 4.5, 8.2],  look: [119.5, 4.8, 0.0],  fov: 43 },
    { f: 1262, pos: [115.0, 10.5, 11.0],look: [112.0, 11.2, -4.0],fov: 44, ease: 'easeOut' },
  ],
  // 20. World 3 Photo Studio: smooth tabletop push-in showing Photographer, brass bellows camera, dispatch board & optical light cone!
  microfilm_shrink: [
    { f: 1263, pos: [-120.5, 6.2, 9.6], look: [-121.2, 3.8, -1.5], fov: 44 },
    { f: 1312, pos: [-120.8, 5.6, 7.8], look: [-121.3, 3.9, -1.5], fov: 41 },
    { f: 1360, pos: [-121.0, 5.2, 6.6], look: [-121.4, 4.0, -1.5], fov: 39 },
  ],
  // 21. Studio foreground hero orbit: glowing amber Microfilm Strip + red quill tube + proud perched Pigeon + fan of tiny letters!
  carry_thousands: [
    { f: 1361, pos: [-120.8, 4.4, 7.8], look: [-119.8, 3.25, 2.2], fov: 38 },
    { f: 1398, pos: [-119.6, 4.3, 7.2], look: [-119.8, 3.25, 2.2], fov: 36, path: [[-120.2, 4.35, 7.5]] },
    { f: 1435, pos: [-118.4, 4.2, 6.8], look: [-119.8, 3.25, 2.2], fov: 35 },
  ],
  // 22. Action low-angle from Prussian siege trench: Pickelhaube soldiers & swivel cannon firing skyward at ascending balloon!
  enemy_shoot: [
    { f: 1436, pos: [38.2, 2.5, 14.8],  look: [30.2, 4.8, 7.2],   fov: 45 },
    { f: 1476, pos: [37.5, 2.8, 13.8],  look: [29.6, 6.4, 6.2],   fov: 43 },
    { f: 1515, pos: [36.8, 3.2, 12.8],  look: [29.0, 8.2, 5.2],   fov: 42 },
  ],
  // 23. Triumphant high-altitude aerial glide past gunsmoke as heroic striped balloons sail cleanly above the clouds!
  got_through: [
    { f: 1516, pos: [14.0, 26.0, 16.0], look: [1.5, 26.5, -2.0],  fov: 44 },
    { f: 1574, pos: [10.0, 28.5, 11.5], look: [0.5, 28.0, -2.0],  fov: 41, ease: 'easeOut' },
  ],
  // 24. GRAND GOLDEN-SUNRISE FINALE: Sweeping crane pullback from blocked Paris gate soaring UP to reveal ALL of Paris + armada of balloons & pigeons!
  found_sky: [
    { f: 1575, pos: [24.0, 5.5, 6.5],   look: [14.0, 5.5, 0.0],   fov: 44 },
    { f: 1628, pos: [26.0, 14.5, 19.0], look: [-3.0, 13.0, -4.0], fov: 45, path: [[27.0, 10.0, 13.0]] },
    { f: 1690, pos: [26.0, 23.0, 30.0], look: [-5.0, 16.5, -6.0], fov: 46, ease: 'easeOut' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  // Subtle crisp muzzle flash white pop on gunshot frames
  c.flash = (f === 1462 || f === 1486 || f === 1504) ? 0.22 : 0;
  if (S.id === 'microfilm_shrink' || S.id === 'carry_thousands') {
    c.shadowAt = [-120, 2.5, 0.0];
  } else if (S.id === 'raise_army' || S.id === 'cant_fly_back' || S.id === 'wind_took_them' || S.id === 'pigeons_reveal' || S.id === 'pigeons_home') {
    c.shadowAt = [120, 4.0, 0.0];
  } else if (S.id === 'closed_road' || S.id === 'rail_telegraph' || S.id === 'over_lines' || S.id === 'enemy_shoot') {
    c.shadowAt = [29, 3.0, -2.0];
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
      W.heroBalloon = { x: 0, y: lerp(1.6, 13.5, k), z: -1.5, s: 1.08, mailbags: true };
      break;
    }
    case 'closed_road':
    case 'rail_telegraph':
      break;
    case 'fill_balloons': {
      // Smooth dramatic coal-gas inflation on Place Saint-Pierre cobblestones!
      const infl = M.easeOut(ramp(f, 295, 366));
      W.gasHose = true;
      W.heroBalloon = { x: 0, y: 0.15, z: 0, s: 1.10, inflate: lerp(0.12, 1.0, infl), mailbags: true, sway: 0.02 };
      break;
    }
    case 'mail_sky': {
      const k = M.easeIn(ramp(f, 371, 446));
      W.gasHose = false;
      W.heroBalloon = { x: 0, y: lerp(0.4, 13.8, k), z: 0, s: 1.08, mailbags: true, cages: true };
      break;
    }
    case 'night_fleet': {
      const k = ramp(f, 447, 536);
      W.heroBalloon = { x: -1.5, y: lerp(9.5, 22.5, k), z: -2.0, s: 1.05, mailbags: true };
      W.fleet = [
        { x: -10.5, y: lerp(12.0, 24.0, k), z: -9.5,  s: 0.92 },
        { x: 7.5,   y: lerp(8.5, 20.5, k),  z: -8.5,  s: 0.88 },
        { x: -15.0, y: lerp(16.0, 27.5, k), z: -17.0, s: 0.80 },
        { x: 2.5,   y: lerp(15.5, 26.5, k), z: -18.0, s: 0.84 },
        { x: -6.0,  y: lerp(6.0, 17.5, k),  z: 4.5,   s: 0.90 },
        { x: 11.5,  y: lerp(13.5, 24.5, k), z: -15.5, s: 0.75 },
      ];
      break;
    }
    case 'over_lines': {
      const k = ramp(f, 537, 598);
      W.campfire = true;
      W.heroBalloon = { x: lerp(21.0, 31.5, k), y: 9.8 + k * 2.2, z: 2.2, s: 1.02, mailbags: true };
      W.fleet = [
        { x: lerp(14.0, 25.0, k), y: 12.8 + k * 2.0, z: -6.5, s: 0.85 },
        { x: lerp(24.0, 35.0, k), y: 14.5 + k * 1.8, z: -3.0, s: 0.78 },
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
      W.heroBalloon = { x: 115.0, y: 0.2, z: -4.2, s: 0.98, mailbags: false, rz: -0.09, sway: 0.015 };
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
      W.heroBalloon = { x: lerp(114.0, 123.5, k), y: lerp(10.5, 14.5, k), z: -1.0, s: 0.96, rz: -0.16 };
      W.fleet = [
        { x: lerp(124.0, 131.5, k), y: lerp(15.0, 11.2, k), z: -7.0, s: 0.85, rz: 0.14 },
        { x: lerp(108.0, 113.5, k), y: lerp(16.0, 19.5, k), z: -10.5, s: 0.80, rz: -0.12 },
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
      W.heroBalloon = { x: 0.4, y: lerp(11.8, 17.0, k), z: 0, s: 1.06, mailbags: true, cages: true };
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
      W.heroBalloon = { x: 113.5, y: 0.2, z: -5.2, s: 0.92, cages: true, rz: -0.06 };
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
      W.showCameraStage = true;
      break;
    }
    case 'enemy_shoot': {
      const k = ramp(f, 1436, 1515);
      W.campfire = true;
      W.heroBalloon = { x: lerp(24.0, 27.0, k), y: lerp(9.5, 15.2, k), z: 2.5, s: 0.96, mailbags: true };
      W.fleet = [{ x: lerp(18.0, 21.5, k), y: lerp(13.0, 18.2, k), z: -5.0, s: 0.84 }];
      break;
    }
    case 'got_through': {
      const k = ramp(f, 1516, 1574);
      W.heroBalloon = { x: lerp(2.0, 0.5, k), y: lerp(24.6, 26.8, k), z: -1.5, s: 1.05, mailbags: false, cages: true };
      W.fleet = [
        { x: -8.5, y: 27.5 + k * 2.2, z: -8.0,  s: 0.88 },
        { x: 10.0, y: 25.5 + k * 2.4, z: -9.5,  s: 0.82 },
        { x: -3.0, y: 31.0 + k * 1.8, z: -14.5, s: 0.74 },
      ];
      break;
    }
    case 'found_sky': {
      const k = ramp(f, 1575, 1690);
      W.heroBalloon = { x: 1.0, y: lerp(9.0, 16.5, k), z: -2.0, s: 1.08, mailbags: true, cages: true };
      W.fleet = [
        { x: -10.5, y: lerp(11.5, 19.0, k), z: -10.5, s: 0.92 },
        { x: 9.5,   y: lerp(13.0, 21.0, k), z: -8.5,  s: 0.88 },
        { x: -17.0, y: lerp(15.0, 22.5, k), z: -1.5,  s: 0.82 },
        { x: -4.0,  y: lerp(18.5, 26.0, k), z: -16.5, s: 0.78 },
        { x: 14.5,  y: lerp(10.5, 18.0, k), z: 5.5,   s: 0.86 },
        { x: -13.5, y: lerp(13.5, 20.5, k), z: 9.5,   s: 0.80 },
        { x: 4.0,   y: lerp(22.0, 29.0, k), z: -21.0, s: 0.70 },
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
  const tint = S.light === 'moonNight' ? '#c2d4f2' : (S.light === 'duskGold' || S.light === 'goldenSky' || S.light === 'goldenDawn') ? '#ffebd6' : S.light === 'siegeDusk' ? '#ffd9c2' : '#ffffff';
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
      // Stern Pickelhaube Prussian guards blocking the barricaded road outside Paris gate!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'hip', R: 'point', expr: 'stern', facing: -1 }, [29.4, 0, -1.2], { tint, ground: 0, s: 1.04 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'hold', R: 'hold', rifleAim: false, expr: 'determined', facing: -1 }, [29.6, 0, 1.3], { tint, ground: 0, s: 1.04 }));
      break;
    }
    case 'fill_balloons': {
      // Aeronaut & Parisian postal workers preparing and inflating the giant balloon on Place Saint-Pierre!
      out.push(C(T, 'aeronaut',     { ...id(3), seed: 3, L: 'pointUp', R: 'hip', expr: 'determined', facing: 1 }, [-3.4, 0, 2.2], { tint, ground: 0, s: 1.02 }));
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'hold', R: 'wave', mailbag: true, wv: q(f * 0.3, 1), expr: 'grin', facing: -1 }, [3.0, 0, 2.5], { tint, ground: 0, s: 1.02 }));
      break;
    }
    case 'mail_sky': {
      const k = M.easeIn(ramp(f, 371, 446));
      const by = lerp(0.4, 13.8, k);
      // Aeronaut riding proudly in rising basket + cheering Parisians waving below!
      out.push(C(T, 'aeronaut',     { ...id(3), seed: 3, inBasket: true, L: 'wave', R: 'up', wv: q(f * 0.36, 1), expr: 'laugh', facing: 1 }, [0.55, by + 0.88, 0.55], { tint, blob: false, s: 0.94, order: 4 }));
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'wave', R: 'up', letter: true, wv: q(f * 0.35, 1), expr: 'excited', facing: 1 }, [-3.2, 0, 3.0], { tint, ground: 0 }));
      out.push(C(T, 'parisianB',    { ...id(2), seed: 2, L: 'up', R: 'wave', wv: q(f * 0.38 + 1, 1), expr: 'grin', facing: -1 }, [3.2, 0, 2.8], { tint, ground: 0 }));
      break;
    }
    case 'over_lines': {
      // Shocked Prussian guards around campfire looking straight up as balloons drift overhead!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'pointUp', R: 'hang', expr: 'shock', facing: -1 }, [32.0, 0, 8.2], { tint: '#ffdfb0', ground: 0, s: 1.04 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'hang', R: 'pointUp', expr: 'shock', facing: 1 },  [34.2, 0, 9.6], { tint: '#ffdfb0', ground: 0, s: 1.04 }));
      break;
    }
    case 'passengers': {
      const k = ramp(f, 599, 648);
      const bx = lerp(3.2, 6.8, k), by = lerp(20.0, 20.8, k);
      out.push(C(T, 'aeronaut',  { ...id(3), seed: 3, inBasket: true, L: 'tug', R: 'hip', expr: 'grin', facing: 1 }, [bx - 0.35, by + 0.88, 0.52], { tint, blob: false, s: 0.94, order: 4 }));
      out.push(C(T, 'parisianB', { ...id(2), seed: 2, inBasket: true, L: 'hold', R: 'wave', letter: true, wv: q(f * 0.36, 1), expr: 'excited', facing: 1 }, [bx + 0.45, by + 0.88, 0.52], { tint, blob: false, s: 0.94, order: 4 }));
      break;
    }
    case 'minister_escape': {
      const k = ramp(f, 721, 789);
      const bx = lerp(0.6, 1.5, k), by = lerp(15.6, 19.8, k);
      // Heroic Minister Léon Gambetta (Tricolor sash, waving top hat in right hand!) ascending out of Paris!
      out.push(C(T, 'minister', { ...id(8), seed: 8, inBasket: true, L: 'hip', R: 'wave', hatWave: true, wv: q(f * 0.30, 1), expr: 'laugh', facing: 1 }, [bx + 0.25, by + 0.88, 0.55], { tint, blob: false, s: 0.98, order: 4 }));
      break;
    }
    case 'raise_army': {
      // Minister Gambetta waving giant French Tricolor rallying cheering red-trousered French soldiers!
      const bounce = (s) => q(Math.abs(Math.sin((f + s) * 0.24)) * 0.03, 3);
      out.push(C(T, 'minister',      { ...id(8),  seed: 8,  L: 'hip', R: 'up', tricolorFlag: true, wv: q(f * 0.34, 1), expr: 'laugh', facing: 1 }, [119.2, 0, 1.4], { tint, ground: 0, s: 1.06 }));
      out.push(C(T, 'frenchSoldier', { ...id(21), seed: 21, bob: bounce(0), L: 'hip', R: 'up', rifleUp: true, expr: 'excited', facing: -1 }, [121.3, 0, 1.2], { tint, ground: 0, s: 1.02 }));
      out.push(C(T, 'frenchSoldier', { ...id(22), seed: 22, bob: bounce(4), L: 'wave', R: 'up', rifleUp: true, wv: q(f * 0.36, 1), expr: 'grin', facing: -1 }, [122.9, 0, 2.0], { tint, ground: 0, s: 1.02 }));
      out.push(C(T, 'frenchSoldier', { ...id(23), seed: 23, bob: bounce(8), L: 'up', R: 'up', rifleUp: true, expr: 'excited', facing: 1 },  [117.2, 0, 2.2], { tint, ground: 0, s: 1.02 }));
      break;
    }
    case 'cant_fly_back': {
      const k = ramp(f, 840, 904);
      const bx = lerp(117.0, 124.2, k), by = 20.4 + Math.sin((f / 30) * 3.2) * 0.35;
      out.push(C(T, 'aeronaut', { ...id(3), seed: 3, inBasket: true, L: 'tug', R: 'tug', expr: 'nervous', facing: -1 }, [bx + 0.1, by + 0.88, 0.56], { tint, blob: false, s: 0.96, order: 4 }));
      break;
    }
    case 'how_replies': {
      // Puzzled Parisian Postmaster & citizen shrugging beside the empty postal box!
      out.push(C(T, 'postalWorker', { ...id(4), seed: 4, L: 'shrug', R: 'shrug', expr: 'puzzled', facing: 1 }, [2.1, 0, 2.0], { tint, ground: 0, s: 1.04 }));
      out.push(C(T, 'parisianA',    { ...id(1), seed: 1, L: 'hip', R: 'shrug', expr: 'worried', facing: -1 }, [0.5, 0, 2.4], { tint, ground: 0, s: 1.02 }));
      break;
    }
    case 'microfilm_shrink': {
      // Photographer René Dagron behind his brass bellows camera holding magnifying loupe + glowing microfilm!
      out.push(C(T, 'photographer', { ...id(30), seed: 30, L: 'hold', R: 'up', loupe: true, microfilm: true, expr: 'grin', facing: -1 }, [-118.2, 1.55, -2.1], { ground: 2.04, blob: false, s: 1.06 }));
      break;
    }
    case 'enemy_shoot': {
      // 3 stern Pickelhaube Prussian soldiers aiming rifles & swivel gun steeply upward at the climbing balloon!
      out.push(C(T, 'prussian', { ...id(11), seed: 11, L: 'aim', R: 'aim', rifleAim: true, expr: 'determined', facing: -1 }, [32.2, 0, 7.6], { tint, ground: 0, s: 1.04 }));
      out.push(C(T, 'prussian', { ...id(12), seed: 12, L: 'aim', R: 'aim', rifleAim: true, expr: 'stern', facing: -1 },      [33.8, 0, 9.2], { tint, ground: 0, s: 1.04 }));
      out.push(C(T, 'prussian', { ...id(13), seed: 13, L: 'aim', R: 'aim', rifleAim: true, expr: 'effort', facing: -1 },     [31.5, 0, 10.6], { tint, ground: 0, s: 1.02 }));
      break;
    }
    case 'got_through': {
      const k = ramp(f, 1516, 1574);
      const bx = lerp(2.0, 0.5, k), by = lerp(24.6, 26.8, k);
      out.push(C(T, 'aeronaut', { ...id(3), seed: 3, inBasket: true, L: 'wave', R: 'up', wv: q(f * 0.36, 1), expr: 'laugh', facing: 1 }, [bx + 0.35, by + 0.88, -0.95], { tint, blob: false, s: 0.96, order: 4 }));
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
    out.push(FX('spark_' + spT, (p) => T.fxSpark(p, spT), [30.15, 2.35, -14.1], 0.85, { order: 6 }));
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
      out.push(FX('let_' + rd, (p) => T.fxLetter(p, rd), [lx, ly, lz], 0.65, { order: 6 }));
    }
  }

  // Cartoon wind gust swirls shoving balloons unpredictably (Shots 14-15)
  if (S.id === 'cant_fly_back') {
    const ph = q((t * 1.4) % 6.28, 1);
    const bx = lerp(117.0, 124.2, ramp(f, 840, 904));
    out.push(FX('wind_' + ph, (p) => T.fxWindSwirl(p, ph), [bx - 2.6, 21.8, 1.4], 1.9, { order: 6 }));
    out.push(FX('wind2_' + ph, (p) => T.fxWindSwirl(p, ph + 1.8), [bx + 2.2, 24.0, -1.2], 1.6, { order: 6 }));
  }
  if (S.id === 'wind_took_them') {
    const ph = q((t * 1.3) % 6.28, 1);
    out.push(FX('w1_' + ph, (p) => T.fxWindSwirl(p, ph), [118.0, 13.5, 4.0], 2.8, { order: 6 }));
    out.push(FX('w2_' + ph, (p) => T.fxWindSwirl(p, ph + 2.2), [126.0, 16.5, -2.5], 2.5, { order: 6 }));
  }

  // Floating bold golden Question Marks over puzzled Paris plaza (Shot 16: "So how did Paris get replies?")
  if (S.id === 'how_replies') {
    const ph = q((t * 1.6) % 6.28, 1);
    const pop = M.back(ramp(f, 974, 988), 1.6);
    out.push(FX('q1_' + ph, (p) => T.fxQuestion(p, ph), [3.8, 2.35, 2.2], 0.95 * pop, { order: 6 }));
  }

  // HERO CARRIER PIGEON REVEAL (Shot 17: "Pigeons.") perched proudly atop the wicker release cage with sparkles!
  if (S.id === 'pigeons_reveal') {
    const pop = M.back(ramp(f, 1041, 1052), 1.5);
    const ph = q((t * 2.0) % 6.28, 1);
    // Cage top is at y = 1.64 at (121.2, 1.64, 1.8)
    out.push(FX('heroPigeon', (p) => T.fxPigeon(p, 0, true, true), [121.2, 1.64 - 0.69 * 1.08 * pop, 1.8], 1.08 * pop, { order: 6 }));
    out.push(FX('pspk_' + ph, (p) => T.fxSparkle(p, ph), [121.2, 1.85, 1.85], 1.05, { order: 7 }));
  }

  // Cute carrier pigeons fluttering beside balloon's strapped wicker cages (Shot 18: "Each balloon carried birds out")
  if (S.id === 'birds_out') {
    const by = lerp(11.8, 17.0, ramp(f, 1075, 1152));
    const wp = q((f * 0.55) % 6.28, 1);
    out.push(FX('pg_b1_' + wp, (p) => T.fxPigeon(p, wp, true, false), [2.1, by + 1.2 + Math.sin(t * 4) * 0.25, 1.3], 0.72, { order: 6 }));
    out.push(FX('pg_b2_' + wp, (p) => T.fxPigeon(p, wp + 1.5, true, false), [-1.6, by + 1.5 + Math.cos(t * 4.2) * 0.22, 1.4], 0.66, { flip: true, order: 6 }));
  }

  // FLOCK OF HOMING PIGEONS BURSTING OUT OF OPEN CAGE AND FLYING HOME WITH MESSAGES! (Shot 19)
  if (S.id === 'pigeons_home') {
    const wp = q((f * 0.62) % 6.28, 1);
    const specs = [
      { delay: 0,  dx: 0.0,  dy: 0.0,  dz: 0.0,  s: 0.86 },
      { delay: 4,  dx: -1.6, dy: 0.8,  dz: -0.9, s: 0.76 },
      { delay: 8,  dx: 1.5,  dy: 0.6,  dz: -1.4, s: 0.78 },
      { delay: 12, dx: -2.8, dy: 1.4,  dz: -2.0, s: 0.70 },
      { delay: 16, dx: 2.6,  dy: 1.2,  dz: -2.4, s: 0.72 },
    ];
    for (let i = 0; i < specs.length; i++) {
      const sp = specs[i];
      const u = clamp((f - (1168 + sp.delay)) / 82);
      if (u <= 0) {
        if (i === 0) out.push(FX('pg_wait', (p) => T.fxPigeon(p, 0, true, true), [121.2, 1.64 - 0.69 * 0.85, 1.8], 0.85, { order: 6 }));
        continue;
      }
      const ease = M.easeOut(u);
      const px = lerp(121.2, 108.5 + sp.dx, ease);
      const py = lerp(1.6, 13.8 + sp.dy, ease) + Math.sin(u * Math.PI) * 1.8;
      const pz = lerp(1.8, -5.5 + sp.dz, ease);
      out.push(FX('pg_fly_' + i + '_' + wp, (p) => T.fxPigeon(p, wp + i * 1.1, true, false), [px, py, pz], sp.s, { flip: true, order: 6 }));
    }
  }

  // Studio foreground Hero Perched Carrier Pigeon + Magical Burst of Miniature Letters (Shot 21: "so one pigeon could carry thousands")
  if (S.id === 'carry_thousands') {
    // Perch top is at (-118.35, 2.52, 2.2) -> plant toes flush on perch!
    out.push(FX('studioPigeon', (p) => T.fxPigeon(p, 0, true, true), [-118.35, 2.52 - 0.69 * 0.96, 2.2], 0.96, { flip: true, order: 6 }));
    const fanK = M.back(ramp(f, 1368, 1388), 1.4);
    const ph = q((t * 1.6) % 6.28, 1);
    out.push(FX('minifan_' + q(fanK, 2), (p) => T.fxMiniLetterFan(p, fanK), [-120.8, 3.0, 1.4], 1.55, { order: 4 }));
    out.push(FX('mspk_' + ph, (p) => T.fxSparkle(p, ph), [-121.0, 2.7, 2.3], 0.95, { order: 7 }));
  }

  // Prussian Rifle & Swivel-Cannon Muzzle Flashes + Rising White Gunsmoke Puffs (Shot 22: "tried to shoot the balloons down")
  if (S.id === 'enemy_shoot') {
    const shots = [
      { f0: 1460, pos: [31.3, 2.75, 7.6] },
      { f0: 1484, pos: [32.9, 2.75, 9.2] },
      { f0: 1502, pos: [30.7, 3.50, 9.0] }, // Swivel anti-balloon cannon!
    ];
    for (let i = 0; i < shots.length; i++) {
      const sh = shots[i];
      if (f >= sh.f0 && f < sh.f0 + 8) {
        const mf = q((f - sh.f0) / 8, 2);
        out.push(FX('mf_' + mf, (p) => T.fxMuzzleFlash(p, mf), sh.pos, 1.05, { order: 7 }));
      }
      if (f >= sh.f0 + 2 && f < sh.f0 + 30) {
        const sm = q((f - sh.f0 - 2) / 28, 2);
        out.push(FX('gsm_' + sm, (p) => T.fxSmoke(p, sm, '#e8ecf2'), [sh.pos[0] - sm * 1.5, sh.pos[1] + sm * 3.8, sh.pos[2]], 1.2 + sm * 1.4, { order: 6 }));
      }
    }
  }

  // Trailing smoke wisps & soaring pigeons in Shot 23 ("but many still got through")
  if (S.id === 'got_through') {
    for (let i = 0; i < 3; i++) {
      const k = q(((f * 0.016 + i * 0.33) % 1), 2);
      out.push(FX('tsm_' + k, (p) => T.fxSmoke(p, k, '#f2eee8'), [6.5 - i * 4.5, 21.5 + k * 4.0, -5.0], 2.0 + k * 1.4, { order: 3 }));
    }
  }

  // Triumphant flock of carrier pigeons gliding across golden Parisian sunrise sky (Shot 24: "still found the sky")
  if (S.id === 'found_sky') {
    const k = ramp(f, 1575, 1690);
    const wp = q((f * 0.52) % 6.28, 1);
    for (let i = 0; i < 4; i++) {
      const px = lerp(18.0 - i * 3.2, -2.0 - i * 4.0, k);
      const py = lerp(12.5 + i * 2.2, 19.5 + i * 2.0, k) + Math.sin(t * 3 + i) * 0.4;
      const pz = 2.0 - i * 3.8;
      out.push(FX('finpg_' + i + '_' + wp, (p) => T.fxPigeon(p, wp + i * 1.3, true, false), [px, py, pz], 0.92, { flip: true, order: 6 }));
    }
    const ph = q((t * 1.4) % 6.28, 1);
    out.push(FX('fspk_' + ph, (p) => T.fxSparkle(p, ph), [1.0, lerp(13.0, 21.0, k), -2.0], 2.2, { order: 7 }));
  }

  return out;
};
