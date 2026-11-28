// Master 29-Shot Comedic Direction Plan for "ហោះផ្កាប់មុខចូលថ្លុកភក់នៅចំមុខក្រាស់!"
// Synced to Khmer voice.mp3 (56.000s, 30 fps, TOTAL = 1680 frames, f0000 - f1679).
// Enforces: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion,
// zero foreground occlusion, clear y = 76% subtitle zone, and frame-exact f1679 -> f0000 infinite loop!
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1680;

export const SHOTS = [
  // --- Scene 1: Super Hook Freeze-Frame Above Mud Puddle (0.00s - 5.77s, f0000 - f0173) ---
  { id: 's01_hook_puddle_freeze',     a: 0,    b: 65,   light: 'schoolDay'    }, // 0.00-2.17 "ហោះផ្កាប់មុខចូលថ្លុកភក់នៅចំមុខក្រាស់"
  { id: 's02_hook_school_orbit',      a: 66,   b: 129,  light: 'schoolDay'    }, // 2.20-4.30 "កណ្តាលសាលារៀនបែបនេះ ដោយសារតែអ្នក"
  { id: 's03_hook_too_cool_zoom',     a: 130,  b: 173,  light: 'schoolDay'    }, // 4.33-5.77 "ខំធ្វើឬកឡូយជ្រុលពេក!"

  // --- Scene 2: VHS Rewind & Sparkling Crush Reveal Outside Classroom (5.80s - 12.80s, f0174 - f0384) ---
  { id: 's04_vhs_rewind_whip',        a: 174,  b: 213,  light: 'vhsRewind'    }, // 5.80-7.10 "ត្រឡប់មកមួយនាទីមុន..."
  { id: 's05_recess_corridor_wide',   a: 214,  b: 262,  light: 'schoolDay'    }, // 7.13-8.73 "ដល់ម៉ោងចេញលេងនៅវិទ្យាល័យ"
  { id: 's06_hero_spots_crush',       a: 263,  b: 316,  light: 'schoolDay'    }, // 8.77-10.53 "អ្នកស្រាប់តែឃើញមនុស្សដែលអ្នកលួចស្រឡាញ់"
  { id: 's07_crush_anime_sparkle',    a: 317,  b: 384,  light: 'shoujoPink'   }, // 10.57-12.80 "កំពុងឈរនិយាយលេងជាមួយមិត្តភក្តិនៅមុខថ្នាក់!"

  // --- Scene 3: Movie-Star Transformation 3-Cut Montage (12.83s - 18.10s, f0385 - f0543) ---
  { id: 's08_cut1_slick_hair',        a: 385,  b: 451,  light: 'movieGold'    }, // 12.83-15.03 "ដើម្បីឲ្យនាងចាប់អារម្មណ៍ អ្នកប្រញាប់សិតសក់"
  { id: 's09_cut2_pop_collar',        a: 452,  b: 481,  light: 'movieGold'    }, // 15.07-16.03 "សារ៉េកអាវស"
  { id: 's10_cut3_movie_star_strut',  a: 482,  b: 543,  light: 'movieGold'    }, // 16.07-18.10 "ហើយដើរកាត់មុខនាងធ្វើឬកឡូយដូចតួកុន!"

  // --- Scene 4: Tunnel Vision Heart-Blocked Ground Mistake (18.13s - 22.97s, f0544 - f0689) ---
  { id: 's11_heart_eyes_locked',      a: 544,  b: 620,  light: 'shoujoPink'   }, // 18.13-20.67 "ប៉ុន្តែដោយសារអ្នករវល់តែសម្លឹងមុខនាង ហើយញញឹមធ្វើឡូយជ្រុល..."
  { id: 's12_tunnel_vision_ground',   a: 621,  b: 689,  light: 'shoujoPink'   }, // 20.70-22.97 "ភ្នែកអ្នកភ្លេចមើលផ្លូវខាងមុខឈឹង!"

  // --- Scene 5: Banana Peel Slip, Legs-Up & "ផ្លូក!" Mud Splash (23.00s - 29.53s, f0690 - f0886) ---
  { id: 's13_sneaker_hits_banana',    a: 690,  b: 770,  light: 'schoolDay'    }, // 23.00-25.67 "ជើងអ្នកក៏ជាន់ចំសំបកចេកមួយនៅកណ្តាលផ្លូវដើរ"
  { id: 's14_legs_shoot_skyward',     a: 771,  b: 828,  light: 'panicTint'    }, // 25.70-27.60 "រអិលបះជើងឡើងលើ"
  { id: 's15_mud_puddle_splat',       a: 829,  b: 886,  light: 'panicTint'    }, // 27.63-29.53 "ហើយធ្លាក់ផ្កាប់មុខចូលថ្លុកភក់លាន់ឮសូរ ផ្លូក!"

  // --- Scene 6: Muddy White Shirt, Shocked Crush & Whole-School Laughter Explosion (29.57s - 36.13s, f0887 - f1084) ---
  { id: 's16_mud_splattered_shirt',   a: 887,  b: 955,  light: 'schoolDay'    }, // 29.57-31.83 "ទឹកភក់ខ្ទាតប្រឡាក់ពេញអាវស និងពេញមុខ!"
  { id: 's17_crush_big_eyes_gasp',    a: 956,  b: 1011, light: 'schoolDay'    }, // 31.87-33.70 "ក្រាស់របស់អ្នកបើកភ្នែកធំៗ"
  { id: 's18_whole_school_laughs',    a: 1012, b: 1084, light: 'laughBurst'   }, // 33.73-36.13 "ឯមិត្តភក្តិមួយសាលាផ្ទុះសំណើចលាន់ឮពេញអគារ!"

  // --- Scene 7: Fake-Cool "Soil Inspector" Excuse & Muddy Sparkle Grin (36.17s - 44.70s, f1085 - f1341) ---
  { id: 's19_stand_stiff_shame',      a: 1085, b: 1135, light: 'schoolDay'    }, // 36.17-37.83 "ដើម្បីកុំឲ្យខ្មាសគេពេក"
  { id: 's20_deadpan_poker_face',     a: 1136, b: 1178, light: 'schoolDay'    }, // 37.87-39.27 "អ្នកប្រឹងងើបឈរធ្វើមុខស្មើ"
  { id: 's21_muddy_teeth_sparkle',    a: 1179, b: 1234, light: 'movieGold'    }, // 39.30-41.13 "ហើយញញឹមទាំងភក់ពេញធ្មេញថា..."
  { id: 's22_thumbs_up_fine',         a: 1235, b: 1282, light: 'schoolDay'    }, // 41.17-42.73 "«អត់អីទេ ខ្ញុំគ្រាន់តែចង់"
  { id: 's23_inspect_dirt_badge',     a: 1283, b: 1341, light: 'schoolDay'    }, // 42.77-44.70 "ពិនិត្យមើលដីបន្តិច!»"

  // --- Scene 8: Dust-Cloud Sprint of Shame Into Restroom (44.73s - 48.73s, f1342 - f1462) ---
  { id: 's24_roadrunner_sprint_start',a: 1342, b: 1400, light: 'panicTint'    }, // 44.73-46.67 "និយាយចប់ភ្លាម អ្នករត់បាតជើងសព្រាត"
  { id: 's25_sprint_into_restroom',   a: 1401, b: 1462, light: 'schoolDay'    }, // 46.70-48.73 "ចូលបន្ទប់ទឹក លែងហ៊ានងាកមើលមុខនាងពេញមួយឆមាស!"

  // --- Scene 9: Like CTA & Seamless Loop Match-Cut Back to Banana Peel & Puddle (48.77s - 56.00s, f1463 - f1679) ---
  { id: 's26_ever_acted_too_cool',    a: 1463, b: 1548, light: 'sunsetWarm'   }, // 48.77-51.60 "បើអ្នកធ្លាប់ធ្វើឬកឡូយជ្រុល រហូតខ្មាសគេមុខក្រាស់បែបនេះ"
  { id: 's27_hit_like_cta',           a: 1549, b: 1596, light: 'sunsetWarm'   }, // 51.63-53.20 "ចុចឡៃមួយមក..."
  { id: 's28_loop_banana_replay',     a: 1597, b: 1652, light: 'schoolDay'    }, // 53.23-55.07 "ព្រោះគ្រាន់តែជើងអ្នករអិលសំបកចេកភ្លាម"
  { id: 's29_loop_match_cut_freeze',  a: 1653, b: 1679, light: 'schoolDay'    }, // 55.10-56.00 "អ្នកក៏..." -> EXACT f0000 puddle-level match-cut!
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- Master Cambodian High School Color & Lighting Presets ----------
export const LIGHTS = {
  schoolDay: {
    az: 46, el: 45, sky: '#dceeff', ground: '#786e58', hemi: 1.26, sun: '#fff6e0', sunI: 2.40,
    fog: '#cfe5f8', fogNear: 105, fogFar: 800, skyTop: '#3B82D6', skyHor: '#C6E0F5',
    sunDisc: '#fffbe6', sunSize: 0.0028, sat: 1.16, gain: '#ffffff', vig: 0.15, shadowExt: 28,
  },
  vhsRewind: {
    az: 52, el: 42, sky: '#d8f0ff', ground: '#64707a', hemi: 1.24, sun: '#e6f5ff', sunI: 2.25,
    fog: '#c6e2f7', fogNear: 95, fogFar: 750, skyTop: '#2a6dc2', skyHor: '#bde0fa',
    sunDisc: '#ffffff', sunSize: 0.002, sat: 1.08, gain: '#f5fbff', vig: 0.19, shadowExt: 28,
  },
  shoujoPink: {
    az: 40, el: 38, sky: '#ffe6f0', ground: '#7d666c', hemi: 1.28, sun: '#ffe8d6', sunI: 2.52,
    fog: '#fad9e6', fogNear: 95, fogFar: 760, skyTop: '#4c7ad9', skyHor: '#ffd6e6',
    sunDisc: '#fff5fa', sunSize: 0.0038, sat: 1.18, gain: '#fffafc', vig: 0.14, shadowExt: 26,
  },
  movieGold: {
    az: 35, el: 32, sky: '#ffebbf', ground: '#78634a', hemi: 1.28, sun: '#ffd27d', sunI: 2.70,
    fog: '#f8daa8', fogNear: 95, fogFar: 760, skyTop: '#356ec4', skyHor: '#ffd691',
    sunDisc: '#fff7d4', sunSize: 0.0042, sat: 1.18, gain: '#fffaf0', vig: 0.15, shadowExt: 28,
  },
  panicTint: {
    az: 45, el: 40, sky: '#ffe0db', ground: '#705852', hemi: 1.24, sun: '#ffd4c2', sunI: 2.50,
    fog: '#f5cfc4', fogNear: 90, fogFar: 730, skyTop: '#3362ad', skyHor: '#ffc9b8',
    sunDisc: '#fff0d6', sunSize: 0.003, sat: 1.17, gain: '#fff8f6', vig: 0.18, shadowExt: 28,
  },
  laughBurst: {
    az: 44, el: 42, sky: '#ffeab8', ground: '#756652', hemi: 1.28, sun: '#ffe29e', sunI: 2.58,
    fog: '#f7e0b2', fogNear: 100, fogFar: 780, skyTop: '#3675cf', skyHor: '#ffdf9e',
    sunDisc: '#fff6d1', sunSize: 0.0035, sat: 1.18, gain: '#fffdf7', vig: 0.16, shadowExt: 30,
  },
  sunsetWarm: {
    az: 28, el: 20, sky: '#f7c8d2', ground: '#70544e', hemi: 1.22, sun: '#ffb870', sunI: 2.66,
    fog: '#f5b084', fogNear: 92, fogFar: 750, skyTop: '#5D5B8E', skyHor: '#F49D52',
    sunDisc: '#ffe6ad', sunSize: 0.0046, sat: 1.16, gain: '#fff5eb', vig: 0.16, shadowExt: 30,
  },
};

export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- Impact Camera Shakes Synced to Exact Khmer Speech & Slapstick Beats ----------
const KICKS = [
  { f: 24,   a: 0.045 }, // "ចូលថ្លុកភក់!" Hook impact emphasis
  { f: 155,  a: 0.048 }, // "ជ្រុលពេក!" Hook punch
  { f: 454,  a: 0.052 }, // "សារ៉េកអាវស!" Collar pop snap!
  { f: 678,  a: 0.046 }, // "ឈឹង!" Oblivious emphasis
  { f: 722,  a: 0.054 }, // "សំបកចេកមួយ!" Foot hits banana peel!
  { f: 774,  a: 0.062 }, // "រអិលបះជើងឡើងលើ!" Legs shoot up!
  { f: 862,  a: 0.092 }, // "ផ្លូក!" MASSIVE MUD PUDDLE FACEPLANT SLAM!
  { f: 1018, a: 0.064 }, // "ផ្ទុះសំណើចលាន់ឮពេញអគារ!" Whole-school laugh shockwave!
  { f: 1185, a: 0.044 }, // "ពេញធ្មេញ!" Sparkle tooth TING!
  { f: 1346, a: 0.060 }, // "រត់បាតជើងសព្រាត!" Turbo sprint takeoff!
  { f: 1620, a: 0.056 }, // Loop replay banana slip!
];

// ---------- Continuous 3D Camera Choreography Across All 29 Shots ----------
const CAMS = {
  // 1. Frame-0 Super Hook: Low puddle-level shot — Hero frozen horizontal mid-air over glossy mud puddle, Crush gasping behind!
  s01_hook_puddle_freeze: [
    { f: 0,   pos: [1.55, 0.82, 3.85], look: [-0.15, 0.62, 0.10], fov: 40 },
    { f: 65,  pos: [1.10, 0.72, 3.20], look: [-0.10, 0.58, 0.15], fov: 39 },
  ],
  // 2. Bullet-time orbit around frozen Hero revealing the 2-story Cambodian high school & stunned classmates
  s02_hook_school_orbit: [
    { f: 66,  pos: [-2.10, 1.48, 4.55], look: [-0.10, 0.82, -0.35], fov: 42 },
    { f: 129, pos: [1.75, 1.38, 4.35],  look: [-0.15, 0.78, -0.30], fov: 41 },
  ],
  // 3. Punchy close push-in onto sweating panicked face inches above mud puddle
  s03_hook_too_cool_zoom: [
    { f: 130, pos: [1.05, 0.88, 2.55], look: [0.18, 0.56, 0.35], fov: 38 },
    { f: 173, pos: [0.78, 0.76, 1.98], look: [0.22, 0.54, 0.40], fov: 36 },
  ],

  // 4. VHS Tape-Rewind whip-pan back leftward along the high school corridor!
  s04_vhs_rewind_whip: [
    { f: 174, pos: [0.85, 1.45, 3.95],  look: [-0.20, 0.95, -0.40], fov: 43, roll: -7 },
    { f: 213, pos: [-4.85, 1.68, 4.85], look: [-3.80, 1.02, -0.80], fov: 41, roll: 0, ease: 'easeOut' },
  ],
  // 5. Lively Cambodian High School Recess wide crane-down
  s05_recess_corridor_wide: [
    { f: 214, pos: [-5.80, 2.55, 6.60], look: [-2.40, 1.15, -1.60], fov: 43 },
    { f: 262, pos: [-4.95, 1.85, 5.45], look: [-2.60, 1.02, -1.50], fov: 41 },
  ],
  // 6. Hero stops in his tracks lovestruck as he spots his Crush!
  s06_hero_spots_crush: [
    { f: 263, pos: [-3.20, 1.56, 3.45], look: [-4.35, 0.98, 0.15], fov: 39 },
    { f: 316, pos: [-3.55, 1.48, 2.75], look: [-4.35, 1.02, 0.20], fov: 37 },
  ],
  // 7. Sparkling Shoujo Anime Reveal of Crush chatting with her best friends outside the classroom!
  s07_crush_anime_sparkle: [
    { f: 317, pos: [-1.45, 1.62, 2.85], look: [-1.65, 1.08, -1.55], fov: 39 },
    { f: 384, pos: [-1.55, 1.54, 2.15], look: [-1.65, 1.12, -1.55], fov: 37 },
  ],

  // 8. Movie-Star Transformation Cut 1: Slicking hair back + red comb + finger gun!
  s08_cut1_slick_hair: [
    { f: 385, pos: [-3.45, 1.54, 2.65], look: [-4.25, 1.04, 0.25], fov: 38, roll: -2 },
    { f: 451, pos: [-3.65, 1.48, 2.22], look: [-4.20, 1.06, 0.25], fov: 36, roll: 0 },
  ],
  // 9. Movie-Star Transformation Cut 2: Fast heroic low-angle snap-zoom popping white shirt collar!
  s09_cut2_pop_collar: [
    { f: 452, pos: [-4.05, 1.24, 2.18], look: [-4.10, 1.08, 0.25], fov: 36, roll: 4 },
    { f: 481, pos: [-4.08, 1.20, 1.88], look: [-4.10, 1.10, 0.25], fov: 34, roll: 2 },
  ],
  // 10. Movie-Star Transformation Cut 3: Slow-motion cinema-idol strut past Crush!
  s10_cut3_movie_star_strut: [
    { f: 482, pos: [-3.95, 1.42, 3.65], look: [-3.55, 0.96, -0.35], fov: 40 },
    { f: 543, pos: [-2.45, 1.38, 3.45], look: [-2.55, 0.96, -0.45], fov: 39 },
  ],

  // 11. Heart-Eyes Locked 90-deg on Crush while strutting obliviously toward danger!
  s11_heart_eyes_locked: [
    { f: 544, pos: [-1.55, 1.52, 3.35], look: [-2.25, 1.00, -0.40], fov: 40 },
    { f: 620, pos: [-1.05, 1.48, 2.95], look: [-1.95, 1.02, -0.35], fov: 38 },
  ],
  // 12. Tunnel-Vision POV: Giant glowing pink hearts block the walkway ahead (hiding banana peel & puddle)!
  s12_tunnel_vision_ground: [
    { f: 621, pos: [-2.85, 1.62, 2.15], look: [-1.15, 0.72, 0.20], fov: 42 },
    { f: 689, pos: [-2.25, 1.46, 1.85], look: [-0.85, 0.62, 0.30], fov: 40 },
  ],

  // 13. Whip-tilt down to white sneaker landing squarely on the yellow 4-petal banana peel!
  s13_sneaker_hits_banana: [
    { f: 690, pos: [-1.95, 0.92, 2.85], look: [-1.55, 0.48, 0.38], fov: 39 },
    { f: 770, pos: [-1.45, 0.62, 2.25], look: [-1.50, 0.36, 0.40], fov: 37 },
  ],
  // 14. Dynamic upward tilt as BOTH legs shoot straight into the sky («រអិលបះជើងឡើងលើ»)!
  s14_legs_shoot_skyward: [
    { f: 771, pos: [-1.25, 1.05, 3.75], look: [-1.05, 1.02, 0.42], fov: 41, roll: -5 },
    { f: 828, pos: [-0.55, 1.32, 3.95], look: [-0.55, 1.18, 0.44], fov: 40, roll: 5 },
  ],
  // 15. High-impact dive & shake as Hero slams face-first into the mud puddle («ផ្លូក!»)!
  s15_mud_puddle_splat: [
    { f: 829, pos: [0.35, 1.35, 3.85], look: [-0.15, 0.78, 0.42], fov: 41 },
    { f: 848, pos: [0.45, 0.88, 3.15], look: [0.00, 0.48, 0.45], fov: 39, ease: 'easeIn' },
    { f: 886, pos: [0.55, 0.96, 3.35], look: [0.00, 0.52, 0.45], fov: 40 },
  ],

  // 16. Mud drips off nose onto once-pristine white uniform shirt!
  s16_mud_splattered_shirt: [
    { f: 887, pos: [0.35, 1.38, 2.85], look: [0.00, 0.92, 0.45], fov: 38 },
    { f: 955, pos: [0.18, 1.34, 2.42], look: [0.00, 0.96, 0.45], fov: 36 },
  ],
  // 17. Crush covers her mouth with HUGE wide shocked eyes!
  s17_crush_big_eyes_gasp: [
    { f: 956,  pos: [-1.45, 1.56, 2.35], look: [-1.65, 1.12, -1.55], fov: 38 },
    { f: 1011, pos: [-1.58, 1.50, 1.88], look: [-1.65, 1.15, -1.55], fov: 36 },
  ],
  // 18. Epic Wide Crane Pull-Back: 20 classmates across ground corridor AND 2nd-floor balcony explode in laughter!
  s18_whole_school_laughs: [
    { f: 1012, pos: [0.25, 2.15, 5.85], look: [-0.35, 1.85, -1.80], fov: 44 },
    { f: 1084, pos: [0.45, 3.10, 8.75], look: [-0.45, 2.15, -2.10], fov: 46 },
  ],

  // 19. Stiffly standing up trying to salvage dignity
  s19_stand_stiff_shame: [
    { f: 1085, pos: [0.55, 1.48, 3.25], look: [0.00, 0.98, 0.45], fov: 39 },
    { f: 1135, pos: [0.32, 1.44, 2.75], look: [0.00, 1.02, 0.45], fov: 38 },
  ],
  // 20. Deadpan stone-flat Poker Face with mud clump & tiny sprout on head!
  s20_deadpan_poker_face: [
    { f: 1136, pos: [0.22, 1.46, 2.32], look: [0.00, 1.08, 0.45], fov: 36 },
    { f: 1178, pos: [0.10, 1.44, 2.02], look: [0.00, 1.10, 0.45], fov: 35 },
  ],
  // 21. Tight Push-In: Ear-to-ear muddy teeth grin + blinding golden star sparkle!
  s21_muddy_teeth_sparkle: [
    { f: 1179, pos: [0.08, 1.46, 1.92], look: [0.00, 1.12, 0.45], fov: 34 },
    { f: 1234, pos: [-0.05, 1.45, 1.72], look: [0.00, 1.14, 0.45], fov: 33 },
  ],
  // 22. Stiff Thumbs-Up («អត់អីទេ ខ្ញុំគ្រាន់តែចង់...»)
  s22_thumbs_up_fine: [
    { f: 1235, pos: [-0.35, 1.48, 2.65], look: [0.05, 1.04, 0.40], fov: 38 },
    { f: 1282, pos: [-0.18, 1.44, 2.38], look: [0.05, 1.06, 0.42], fov: 37 },
  ],
  // 23. Soil-Inspector Magnifying Glass Excuse («ពិនិត្យមើលដីបន្តិច!»)
  s23_inspect_dirt_badge: [
    { f: 1283, pos: [0.35, 1.46, 3.05], look: [0.25, 1.02, 0.42], fov: 39 },
    { f: 1341, pos: [0.52, 1.42, 2.75], look: [0.30, 1.04, 0.42], fov: 38 },
  ],

  // 24. Roadrunner Dust-Cloud Sprint Takeoff hiding burning-red face in hands!
  s24_roadrunner_sprint_start: [
    { f: 1342, pos: [0.65, 1.52, 4.25], look: [1.15, 0.98, 0.25], fov: 42 },
    { f: 1400, pos: [5.25, 1.58, 4.55], look: [6.45, 0.98, 0.10], fov: 42 },
  ],
  // 25. Sprinting straight into the School Restroom Pavilion under the Blue/Pink Restroom Sign!
  s25_sprint_into_restroom: [
    { f: 1401, pos: [10.45, 1.72, 4.35], look: [12.35, 1.25, -1.05], fov: 42 },
    { f: 1462, pos: [11.65, 1.65, 3.45], look: [12.45, 1.28, -1.15], fov: 40 },
  ],

  // 26. Warm Sunset Relatable Question: Sheepish Hero peeking behind pillar while Crush giggles
  s26_ever_acted_too_cool: [
    { f: 1463, pos: [-2.65, 1.62, 4.55], look: [-2.85, 1.02, -0.85], fov: 40 },
    { f: 1548, pos: [-2.35, 1.54, 3.85], look: [-2.75, 1.04, -0.85], fov: 39 },
  ],
  // 27. Hit Like CTA with crisp Blue Thumbs-Up Card & Golden Burst Rays!
  s27_hit_like_cta: [
    { f: 1549, pos: [-2.45, 1.52, 3.35], look: [-2.75, 1.08, -0.25], fov: 38 },
    { f: 1596, pos: [-2.35, 1.48, 2.95], look: [-2.70, 1.10, -0.25], fov: 37 },
  ],
  // 28. Instant Action Replay: Sneaker hitting the yellow banana peel & launching skyward!
  s28_loop_banana_replay: [
    { f: 1597, pos: [-1.85, 0.82, 2.75], look: [-1.45, 0.56, 0.40], fov: 39 },
    { f: 1652, pos: [-0.95, 1.12, 3.55], look: [-0.65, 0.92, 0.42], fov: 40, roll: -4 },
  ],
  // 29. SEAMLESS LOOP MATCH-CUT («អ្នកក៏...»): Drops into EXACT f0000 puddle-level camera & mid-air freeze!
  s29_loop_match_cut_freeze: [
    { f: 1653, pos: [1.85, 0.94, 4.25], look: [-0.15, 0.66, 0.12], fov: 41 },
    { f: 1679, pos: [1.55, 0.82, 3.85], look: [-0.15, 0.62, 0.10], fov: 40, ease: 'easeOut' },
  ],
};

export function camAt(f) {
  const S = shotAt(f);
  return camFromKeys(CAMS[S.id], f, { creep: S.id === 's29_loop_match_cut_freeze' ? 0 : 0.0008, kicks: KICKS });
}

// ---------- STRICT QUALITY LOCK: 100% Razor-Sharp (cinf === 0 on EVERY frame!) ----------
export function dofAt(f) {
  const C = camAt(f);
  const d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]);
  return { focus: d, cinf: 0, near: 0.4 };
}

// ---------- Per-Frame World State (Bell, Banana Peel Physics & Anime Aura) ----------
export function worldAt(f) {
  const S = shotAt(f);
  const ringBell = S.id === 's05_recess_corridor_wide';

  // Banana peel physics: rests at (-1.55, 0.025, 0.40) until stepped on in s13/s14 or s28!
  let bananaVis = true;
  let bananaPos = [-1.55, 0.025, 0.40];
  let bananaRot = [0, 0.35, 0];

  if (f <= 173 || S.id === 's29_loop_match_cut_freeze') {
    // During mid-air puddle freeze, banana peel is tumbling behind his heels!
    bananaPos = [-1.85, 0.48 + Math.sin(f * 0.2) * 0.03, 0.38];
    bananaRot = [0.6, 1.1, -0.8];
  } else if (S.id === 's13_sneaker_hits_banana') {
    const u = ramp(f, 725, 770);
    bananaPos = [lerp(-1.55, -1.25, u), 0.025, 0.40];
    bananaRot = [0, 0.35 + u * 1.4, -u * 0.3];
  } else if (S.id === 's14_legs_shoot_skyward') {
    const u = ramp(f, 771, 828);
    bananaPos = [lerp(-1.25, -2.35, u), 0.15 + Math.sin(u * Math.PI) * 1.25, 0.35];
    bananaRot = [u * 7.0, u * 5.0, u * 4.0];
  } else if (f >= 829 && f <= 1596) {
    bananaPos = [-2.55, 0.025, 0.25];
    bananaRot = [0.1, 2.1, 0];
  } else if (S.id === 's28_loop_banana_replay') {
    const u = ramp(f, 1618, 1652);
    bananaPos = [lerp(-1.55, -1.85, u), lerp(0.025, 0.48, u), 0.39];
    bananaRot = [u * 0.6, 0.35 + u * 0.75, -u * 0.8];
  }

  let aura = false, auraGold = false, auraPos = [0, 0, 0], auraScale = 1.0;
  if (S.id === 's07_crush_anime_sparkle' || S.id === 's11_heart_eyes_locked') {
    aura = true; auraGold = false; auraPos = [-1.65, 1.35, -1.72]; auraScale = 1.15;
  } else if (S.id === 's08_cut1_slick_hair' || S.id === 's09_cut2_pop_collar' || S.id === 's10_cut3_movie_star_strut') {
    const hx = S.id === 's10_cut3_movie_star_strut' ? lerp(-3.85, -2.55, ramp(f, 482, 543)) : -4.15;
    aura = true; auraGold = true; auraPos = [hx, 1.25, 0.10]; auraScale = 1.05;
  }

  return { ringBell, bananaVis, bananaPos, bananaRot, aura, auraGold, auraPos, auraScale };
}

// ---------- Pre-Built 18-Student Balcony & Corridor Crowd for Scene 6 Whole-School Laughter! ----------
const BALCONY_CLASSMATES = [
  { role: 'studentBoyA',  x: -7.8, y: 3.55, z: -2.85, seed: 11, flip: false },
  { role: 'studentGirlA', x: -6.2, y: 3.55, z: -2.85, seed: 12, flip: false },
  { role: 'studentBoyB',  x: -4.6, y: 3.55, z: -2.85, seed: 13, flip: false },
  { role: 'studentGirlB', x: -3.1, y: 3.55, z: -2.85, seed: 14, flip: false },
  { role: 'studentBoyA',  x: -1.6, y: 3.55, z: -2.85, seed: 15, flip: false },
  { role: 'studentGirlA', x: -0.1, y: 3.55, z: -2.85, seed: 16, flip: true  },
  { role: 'studentBoyB',  x:  1.4, y: 3.55, z: -2.85, seed: 17, flip: true  },
  { role: 'studentGirlB', x:  2.9, y: 3.55, z: -2.85, seed: 18, flip: true  },
  { role: 'studentBoyA',  x:  4.5, y: 3.55, z: -2.85, seed: 19, flip: true  },
  { role: 'studentGirlA', x:  6.1, y: 3.55, z: -2.85, seed: 20, flip: true  },
];

const GROUND_CLASSMATES = [
  { role: 'studentBoyA',  x: -6.6, y: 0.18, z: -2.05, seed: 21, flip: false },
  { role: 'studentGirlB', x: -5.2, y: 0.18, z: -2.00, seed: 22, flip: false },
  { role: 'studentBoyB',  x:  1.4, y: 0.18, z: -1.95, seed: 23, flip: true  },
  { role: 'studentGirlA', x:  2.8, y: 0.18, z: -2.00, seed: 24, flip: true  },
  { role: 'studentBoyA',  x:  4.2, y: 0.18, z: -2.05, seed: 25, flip: true  },
  { role: 'studentGirlB', x:  5.8, y: 0.18, z: -2.00, seed: 26, flip: true  },
];

// ---------- Per-Frame 2D Bean-Head Actors ----------
export function actorsAt(f, T) {
  const S = shotAt(f), out = [];
  const wv = q(f / 10, 1);

  const pushStudent = (role, x, y, z, opts = {}) => {
    const seed = opts.seed ?? 3;
    const idl = idle(f, seed);
    const bl = opts.blink ?? blinkAt(f, seed);
    const key = [
      role, opts.mode || 'std', opts.expr || 'neutral', bl,
      q(opts.step || 0, 2), opts.L || 'hang', opts.R || 'hang',
      opts.facing ?? 1, opts.hairMode || 'normal',
      opts.poppedCollar ? 1 : 0, opts.coolShades ? 1 : 0,
      opts.heartEyes ? 1 : 0, opts.muddy ? 1 : 0,
      opts.muddyTeethSparkle ? 1 : 0, opts.holdBooks ? 1 : 0,
      opts.holdComb ? 1 : 0, opts.blushRed ? 1 : 0,
      opts.sweat ? 1 : 0, opts.laughShake ? 1 : 0,
      opts.sprint ? 1 : 0, opts.strut ? 1 : 0,
      q(idl.bob, 3), q(idl.headTilt, 1), wv,
    ].join('|');

    out.push({
      key, x, y, z,
      s: opts.s ?? 0.90,
      flip: !!opts.flip,
      ground: opts.ground ?? 0.0,
      blob: opts.blob ?? true,
      roll: opts.roll || 0,
      draw: (p) => T.khmerSchoolChar(p, role, {
        ...idl, ...opts, blink: bl, wv,
      }),
    });
  };

  // Helper: Crush & her 2 best friends outside the classroom door (at y = 0.18, z = -1.55)
  const addCrushTrio = (crushExpr = 'sweetChat', crushArms = ['books', 'books'], friendLaugh = false) => {
    pushStudent('crushGirl', -1.65, 0.18, -1.55, {
      seed: 5, ground: 0.18, s: 0.88, facing: 1,
      expr: crushExpr, L: crushArms[0], R: crushArms[1],
      holdBooks: crushArms[0] === 'books',
    });
    pushStudent('friendGirl1', -2.55, 0.18, -1.62, {
      seed: 6, ground: 0.18, s: 0.86, facing: 1,
      expr: friendLaugh ? 'bellyLaugh' : (crushExpr === 'crushGasp' ? 'crushGasp' : 'sweetChat'),
      L: friendLaugh ? 'bellyHold' : 'books', R: friendLaugh ? 'pointLaugh' : 'hang',
      holdBooks: !friendLaugh, laughShake: friendLaugh,
    });
    pushStudent('friendGirl2', -0.78, 0.18, -1.62, {
      seed: 7, ground: 0.18, s: 0.86, facing: -1, flip: false,
      expr: friendLaugh ? 'bellyLaugh' : (crushExpr === 'crushGasp' ? 'crushGasp' : 'sweetChat'),
      L: friendLaugh ? 'pointLaugh' : 'hang', R: friendLaugh ? 'bellyHold' : 'books',
      holdBooks: !friendLaugh, laughShake: friendLaugh,
    });
  };

  // ==================== SCENE 1: SUPER HOOK FREEZE-FRAME ====================
  if (f <= 173) {
    // Hero frozen horizontal in mid-air right above the glossy mud puddle (x=0, y=0.02, z=0.45)!
    pushStudent('heroBoy', 0.0, 0.05, 0.48, {
      seed: 3, mode: 'horizontalFreeze', s: 0.94, blob: true, ground: 0.0,
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], false);
    if (S.id === 's02_hook_school_orbit') {
      for (const c of GROUND_CLASSMATES.slice(0, 4)) {
        pushStudent(c.role, c.x, c.y, c.z, { seed: c.seed, ground: c.y, s: 0.85, flip: c.flip, expr: 'crushGasp' });
      }
    }
    return out;
  }

  // ==================== SCENE 2: VHS REWIND & RECESS REVEAL ====================
  if (S.id === 's04_vhs_rewind_whip') {
    const u = ramp(f, 174, 213);
    const hx = lerp(0.0, -4.45, M.easeOut(u));
    pushStudent('heroBoy', hx, 0.0, 0.25, {
      seed: 3, facing: 1, flip: true, step: (213 - f) * 0.09, expr: 'shock', sweat: true,
    });
    addCrushTrio('sweetChat', ['books', 'books']);
    return out;
  }

  if (S.id === 's05_recess_corridor_wide') {
    const u = ramp(f, 214, 262);
    pushStudent('heroBoy', lerp(-4.85, -4.35, u), 0.0, 0.25, {
      seed: 3, facing: 1, step: (f - 214) * 0.045, expr: 'smile',
    });
    addCrushTrio('sweetChat', ['books', 'wave']);
    for (const c of GROUND_CLASSMATES.slice(0, 4)) {
      pushStudent(c.role, c.x, c.y, c.z, { seed: c.seed, ground: c.y, s: 0.85, flip: c.flip, expr: 'sweetChat', holdBooks: true });
    }
    return out;
  }

  if (S.id === 's06_hero_spots_crush') {
    const shockPhase = f < 284;
    pushStudent('heroBoy', -4.35, 0.0, 0.25, {
      seed: 3, facing: 1,
      expr: shockPhase ? 'freezePanic' : 'dreamySmirk',
      heartEyes: !shockPhase,
      L: shockPhase ? 'hang' : 'coolPocket',
      R: shockPhase ? 'hang' : 'popCollar',
    });
    addCrushTrio('sweetChat', ['books', 'books']);
    return out;
  }

  if (S.id === 's07_crush_anime_sparkle') {
    addCrushTrio('dreamySmirk', ['books', 'wave']);
    return out;
  }

  // ==================== SCENE 3: MOVIE-STAR 3-CUT MONTAGE ====================
  if (S.id === 's08_cut1_slick_hair') {
    const slickDone = f >= 420;
    pushStudent('heroBoy', -4.15, 0.0, 0.25, {
      seed: 3, facing: 1,
      hairMode: slickDone ? 'slickCool' : 'normal',
      expr: 'movieCool',
      L: slickDone ? 'fingerGun' : 'coolPocket',
      R: 'slickHair',
      holdComb: true,
    });
    addCrushTrio('sweetChat', ['books', 'books']);
    return out;
  }

  if (S.id === 's09_cut2_pop_collar') {
    pushStudent('heroBoy', -4.10, 0.0, 0.25, {
      seed: 3, facing: 1,
      hairMode: 'slickCool', poppedCollar: true, coolShades: true,
      expr: 'movieCool', L: 'popCollar', R: 'popCollar',
    });
    return out;
  }

  if (S.id === 's10_cut3_movie_star_strut') {
    const u = ramp(f, 482, 543);
    pushStudent('heroBoy', lerp(-3.90, -2.55, u), 0.0, 0.30, {
      seed: 3, facing: 1, strut: true, step: (f - 482) * 0.038,
      hairMode: 'slickCool', poppedCollar: true, coolShades: true,
      expr: 'movieCool', L: 'coolPocket', R: 'fingerGun',
    });
    addCrushTrio('sweetChat', ['books', 'books']);
    return out;
  }

  // ==================== SCENE 4: TUNNEL VISION HEART-EYES MISTAKE ====================
  if (S.id === 's11_heart_eyes_locked' || S.id === 's12_tunnel_vision_ground') {
    const u = ramp(f, 544, 689);
    pushStudent('heroBoy', lerp(-2.55, -1.68, u), 0.0, 0.36, {
      seed: 3, facing: 1, strut: true, step: (f - 544) * 0.042,
      hairMode: 'slickCool', poppedCollar: true,
      heartEyes: true, expr: 'dreamySmirk',
      L: 'coolPocket', R: 'fingerGun',
    });
    addCrushTrio('sweetChat', ['books', 'books']);
    return out;
  }

  // ==================== SCENE 5: BANANA PEEL SLIP & MUD PUDDLE SPLAT! ====================
  if (S.id === 's13_sneaker_hits_banana') {
    const hit = f >= 722;
    pushStudent('heroBoy', lerp(-1.68, -1.48, ramp(f, 690, 770)), 0.0, 0.40, {
      seed: 3, facing: 1, step: (f - 690) * 0.05,
      hairMode: 'slickCool', poppedCollar: true,
      expr: hit ? 'freezePanic' : 'dreamySmirk',
      heartEyes: !hit, sweat: hit,
      L: hit ? 'wave' : 'coolPocket', R: hit ? 'wave' : 'fingerGun',
      tilt: hit ? -14 * ramp(f, 722, 770) : 0,
    });
    addCrushTrio(hit ? 'crushGasp' : 'sweetChat', hit ? ['coverMouth', 'coverMouth'] : ['books', 'books']);
    return out;
  }

  if (S.id === 's14_legs_shoot_skyward') {
    const u = ramp(f, 771, 828);
    const arcY = 0.25 + Math.sin(u * Math.PI) * 0.72;
    pushStudent('heroBoy', lerp(-1.35, -0.35, u), arcY, 0.44, {
      seed: 3, mode: 'bananaFeetUp', s: 0.94, ground: 0.0,
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth']);
    return out;
  }

  if (S.id === 's15_mud_puddle_splat') {
    if (f < 848) {
      const u = ramp(f, 829, 847);
      pushStudent('heroBoy', lerp(-0.35, 0.0, u), lerp(0.55, 0.04, M.easeIn(u)), 0.45, {
        seed: 3, mode: 'horizontalFreeze', s: 0.94, ground: 0.0,
      });
    } else {
      pushStudent('heroBoy', 0.0, 0.0, 0.45, {
        seed: 3, mode: 'puddleFaceplant', s: 0.94, ground: 0.0,
      });
    }
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth']);
    return out;
  }

  // ==================== SCENE 6: MUDDY SHIRT & WHOLE-SCHOOL LAUGHTER! ====================
  if (S.id === 's16_mud_splattered_shirt') {
    pushStudent('heroBoy', 0.0, 0.0, 0.45, {
      seed: 3, facing: 1, muddy: true, hairMode: 'mudClump',
      expr: 'dazed', sweat: true, L: 'hang', R: 'hang',
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth']);
    return out;
  }

  if (S.id === 's17_crush_big_eyes_gasp') {
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], true);
    return out;
  }

  if (S.id === 's18_whole_school_laughs') {
    // Mortified mud-covered Hero standing tiny by the puddle while 19 classmates across BOTH floors roar with laughter!
    pushStudent('heroBoy', 0.0, 0.0, 0.45, {
      seed: 3, facing: -1, muddy: true, hairMode: 'mudClump', blushRed: true,
      expr: 'shameCry', sweat: true,
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], true);
    for (const c of GROUND_CLASSMATES) {
      pushStudent(c.role, c.x, c.y, c.z, {
        seed: c.seed, ground: c.y, s: 0.85, flip: c.flip, facing: c.flip ? -1 : 1,
        expr: 'bellyLaugh', L: 'bellyHold', R: 'pointLaugh', laughShake: true,
      });
    }
    for (const b of BALCONY_CLASSMATES) {
      pushStudent(b.role, b.x, b.y, b.z, {
        seed: b.seed, ground: b.y, s: 0.84, flip: b.flip, facing: b.flip ? -1 : 1, blob: false,
        expr: 'bellyLaugh', L: 'pointLaugh', R: 'wave', laughShake: true,
      });
    }
    return out;
  }

  // ==================== SCENE 7: FAKE-COOL "SOIL INSPECTOR" EXCUSE ====================
  if (S.id === 's19_stand_stiff_shame' || S.id === 's20_deadpan_poker_face') {
    pushStudent('heroBoy', 0.0, 0.0, 0.45, {
      seed: 3, facing: -1, muddy: true, hairMode: 'mudClump',
      expr: 'mudDeadpan', sweat: S.id === 's19_stand_stiff_shame',
      L: S.id === 's19_stand_stiff_shame' ? 'popCollar' : 'hang',
      R: S.id === 's19_stand_stiff_shame' ? 'popCollar' : 'hang',
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], true);
    return out;
  }

  if (S.id === 's21_muddy_teeth_sparkle') {
    pushStudent('heroBoy', 0.0, 0.0, 0.45, {
      seed: 3, facing: -1, muddy: true, hairMode: 'mudClump',
      expr: 'grin', muddyTeethSparkle: true,
      L: 'hip', R: 'hang',
    });
    return out;
  }

  if (S.id === 's22_thumbs_up_fine' || S.id === 's23_inspect_dirt_badge') {
    pushStudent('heroBoy', 0.0, 0.0, 0.45, {
      seed: 3, facing: -1, muddy: true, hairMode: 'mudClump',
      expr: 'grin', muddyTeethSparkle: true, sweat: true,
      L: S.id === 's23_inspect_dirt_badge' ? 'inspectGround' : 'hip',
      R: 'thumbsUp',
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], true);
    return out;
  }

  // ==================== SCENE 8: SPRINT OF SHAME INTO RESTROOM ====================
  if (S.id === 's24_roadrunner_sprint_start') {
    const u = ramp(f, 1342, 1400);
    pushStudent('heroBoy', lerp(0.0, 7.6, u), 0.0, 0.25, {
      seed: 3, facing: 1, sprint: true, step: (f - 1342) * 0.14,
      muddy: true, hairMode: 'mudClump', blushRed: true,
      expr: 'shameCry', L: 'hideFace', R: 'hideFace',
    });
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], true);
    return out;
  }

  if (S.id === 's25_sprint_into_restroom') {
    const u = ramp(f, 1401, 1450);
    if (f <= 1454) {
      pushStudent('heroBoy', lerp(9.2, 12.45, u), 0.0, lerp(0.15, -1.10, u), {
        seed: 3, facing: 1, sprint: true, step: (f - 1401) * 0.14,
        muddy: true, hairMode: 'mudClump', blushRed: true,
        expr: 'shameCry', L: 'hideFace', R: 'hideFace',
      });
    }
    return out;
  }

  // ==================== SCENE 9: LIKE CTA & LOOP MATCH-CUT ====================
  if (S.id === 's26_ever_acted_too_cool' || S.id === 's27_hit_like_cta') {
    pushStudent('heroBoy', -3.35, 0.0, 0.15, {
      seed: 3, facing: 1, blushRed: true,
      expr: S.id === 's27_hit_like_cta' ? 'cheekyWink' : 'smile',
      L: 'coolPocket', R: S.id === 's27_hit_like_cta' ? 'thumbsUp' : 'wave',
    });
    addCrushTrio('sweetChat', ['books', 'wave'], false);
    return out;
  }

  if (S.id === 's28_loop_banana_replay') {
    const slip = f >= 1622;
    const u = ramp(f, 1622, 1652);
    if (!slip) {
      pushStudent('heroBoy', lerp(-1.85, -1.52, ramp(f, 1597, 1622)), 0.0, 0.40, {
        seed: 3, facing: 1, strut: true, step: (f - 1597) * 0.05,
        hairMode: 'slickCool', poppedCollar: true, heartEyes: true, expr: 'dreamySmirk',
      });
    } else {
      pushStudent('heroBoy', lerp(-1.45, -0.45, u), 0.20 + u * 0.55, 0.44, {
        seed: 3, mode: 'bananaFeetUp', s: 0.94, ground: 0.0,
      });
    }
    addCrushTrio('crushGasp', ['coverMouth', 'coverMouth']);
    return out;
  }

  // s29_loop_match_cut_freeze (f1653 - f1679): EXACT match-cut to f0000!
  pushStudent('heroBoy', 0.0, 0.05, 0.48, {
    seed: 3, mode: 'horizontalFreeze', s: 0.94, blob: true, ground: 0.0,
  });
  addCrushTrio('crushGasp', ['coverMouth', 'coverMouth'], false);
  return out;
}

// ---------- Per-Frame 2D Visual Comedy FX & Gag Cards ----------
export function fxAt(f, T) {
  const S = shotAt(f), out = [];
  const k = q(f / 15, 2);

  const pushFx = (kind, x, y, z, s = 0.72, kk = k) => {
    out.push({
      key: `fx|${kind}|${q(kk, 2)}`,
      x, y, z, s, blob: false, shadow: false, order: 4,
      draw: (p) => T.drawSchoolFx(p, kind, kk),
    });
  };

  if (S.id === 's04_vhs_rewind_whip') {
    const u = ramp(f, 174, 213);
    pushFx('vhsRewindCard', lerp(-0.4, -3.9, u), 1.65, 0.65, 0.68, k);
  } else if (S.id === 's07_crush_anime_sparkle') {
    pushFx('shoujoHearts', -1.65, 0.85, -1.25, 0.92, k);
  } else if (S.id === 's09_cut2_pop_collar') {
    pushFx('movieStarBurst', -4.10, 0.72, -0.05, 0.95, k);
  } else if (S.id === 's11_heart_eyes_locked') {
    pushFx('shoujoHearts', -1.65, 0.85, -1.25, 0.86, k);
  } else if (S.id === 's12_tunnel_vision_ground') {
    // Giant glowing pink hearts floating right across the ground lane blocking the banana peel!
    pushFx('giantGroundHearts', -1.45, 0.35, 0.85, 0.88, k);
  } else if (S.id === 's15_mud_puddle_splat' && f >= 848) {
    const sp = f < 872 ? ramp(f, 848, 868) : ramp(f, 872, 886);
    pushFx('mudSplashWave', 0.0, 0.02, 0.62, 1.05, Math.max(0.35, sp));
  } else if (S.id === 's18_whole_school_laughs') {
    pushFx('laughShockwave', -3.6, 2.35, -1.55, 0.78, k);
    pushFx('laughShockwave',  2.9, 2.45, -1.55, 0.78, k + 0.5);
  } else if (S.id === 's23_inspect_dirt_badge') {
    pushFx('soilInspectorBadge', 0.82, 0.78, 0.55, 0.66, k);
  } else if (S.id === 's24_roadrunner_sprint_start' || S.id === 's25_sprint_into_restroom') {
    for (let i = 0; i < 4; i++) {
      const df = (f - 1342 - i * 8);
      if (df >= 0) {
        const cyc = (df % 24) / 24;
        const dx = S.id === 's24_roadrunner_sprint_start' ? i * 1.45 : 9.2 + i * 0.75;
        out.push({
          key: `dust|${q(cyc, 2)}`,
          x: dx, y: 0.05, z: 0.35, s: 0.55, blob: false, shadow: false, order: 3,
          draw: (p) => T.fxDust(p, cyc),
        });
      }
    }
  } else if (S.id === 's27_hit_like_cta') {
    pushFx('likeButtonCTA', -2.05, 0.78, 0.15, 0.72, k);
  }

  return out;
}
