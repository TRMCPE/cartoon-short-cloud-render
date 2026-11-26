// Master 37-Shot Plan for "Angkor Mother's Secret Weapon: Prahok" (ប្រហុក — អាវុធសម្ងាត់របស់ម្តាយខ្មែរ)
// Post-Audit Refined 9:16 Framing: ZERO edge crops, ZERO camera occlusion, 100% razor-sharp (dofAt cinf === 0),
// continuous 3D camera motion, and upper-72% hero framing clear of Rollo-style Khmer subtitles at y = 76%.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 2601;

export const SHOTS = [
  // --- Paragraph 1: Hook (0.00s - 8.95s) ---
  { id: 's01_hook_angkor',     a: 0,    b: 58,   light: 'morning' },  // 0.00-1.93 "តើអ្នកដឹងទេថា នៅសម័យអង្គរ"
  { id: 's02_secret_weapon',   a: 59,   b: 130,  light: 'golden'  },  // 1.97-4.33 "ម្តាយខ្មែរមាន «អាវុធសម្ងាត់» មួយប្រភេទ"
  { id: 's03_protect_son',     a: 131,  b: 204,  light: 'jungle'  },  // 4.37-6.80 "ដែលអាចការពារកូនប្រុសពីចោរព្រៃ និងសត្វសាហាវបាន"
  { id: 's04_no_sword_spear',  a: 205,  b: 268,  light: 'morning' },  // 6.83-8.93 "ដោយមិនបាច់ប្រើដាវ ឬលំពែងសូម្បីតែមួយដើម?"

  // --- Paragraph 2: The Long Ox-Cart Journey & Spoiled Food Problem (8.97s - 24.07s) ---
  { id: 's05_imagine_youth',   a: 269,  b: 370,  light: 'sunny'   },  // 8.97-12.33 "សូមស្រមៃថា អ្នកគឺជាយុវជនខ្មែរកាលពីរាប់រយឆ្នាំមុន"
  { id: 's06_oxcart_forest',   a: 371,  b: 456,  light: 'jungle'  },  // 12.37-15.20 "ដែលត្រូវធ្វើដំណើរតាមរទេះគោឆ្លងព្រៃក្រាស់រាប់ខែ"
  { id: 's07_distant_goal',    a: 457,  b: 544,  light: 'sunny'   },  // 15.23-18.13 "ដើម្បីទៅជួញដូរ ឬទៅបន្តការសិក្សានៅតំបន់ឆ្ងាយ។"
  { id: 's08_no_fridge',       a: 545,  b: 597,  light: 'jungle'  },  // 18.17-19.90 "នៅសម័យនោះ គ្មានទូទឹកកក"
  { id: 's09_no_shops',        a: 598,  b: 662,  light: 'jungle'  },  // 19.93-22.07 "គ្មានហាងលក់អាហារតាមផ្លូវ ហើយសាច់ស្រស់វិញ"
  { id: 's10_spoiled_meat',    a: 663,  b: 722,  light: 'dusk'    },  // 22.10-24.07 "ទុកតែពីរថ្ងៃក៏ខូចបាត់ទៅហើយ។"

  // --- Paragraph 3: Mother's Ancient Wisdom -> Birth of Prahok (24.10s - 36.13s) ---
  { id: 's11_mother_refuses',  a: 723,  b: 776,  light: 'sunny'   },  // 24.10-25.87 "ប៉ុន្តែម្តាយខ្មែរមិនព្រមឱ្យកូនដាច់ពោះ"
  { id: 's12_never_starve',    a: 777,  b: 812,  light: 'sunny'   },  // 25.90-27.07 "តាមផ្លូវជាដាច់ខាត!"
  { id: 's13_fresh_fish',      a: 813,  b: 901,  light: 'morning' },  // 27.10-30.03 "ពួកគាត់បានប្រើប្រាជ្ញាបុរាណ យកត្រីស្រស់ៗនៅរដូវទឹកសម្រក"
  { id: 's14_pound_salt_sun',  a: 902,  b: 955,  light: 'sunny'   },  // 30.07-31.83 "មកបុកលាយជាមួយអំបិល ហាលថ្ងៃ"
  { id: 's15_ferment_jars',    a: 956,  b: 1011, light: 'golden'  },  // 31.87-33.70 "ហើយផ្អាប់ទុកក្នុងក្រឡដីរាប់ខែ"
  { id: 's16_prahok_born',     a: 1012, b: 1084, light: 'golden'  },  // 33.73-36.13 "រហូតបង្កើតបានជាកំពូលម្ហូបប្រចាំជាតិ គឺ «ប្រហុក»។"

  // --- Paragraph 4: Departure & Mother's Advice (36.17s - 44.53s) ---
  { id: 's17_morning_depart',  a: 1085, b: 1153, light: 'morning' },  // 36.17-38.43 "មុនថ្ងៃចេញដំណើរ ម្តាយតែងដាក់"
  { id: 's18_pack_thong_yam',  a: 1154, b: 1236, light: 'morning' },  // 38.47-41.20 "ក្រឡប្រហុកតូចមួយចូលក្នុងថង់យាមរបស់កូន ដោយផ្តាំថា៖"
  { id: 's19_mother_advice',   a: 1237, b: 1336, light: 'golden'  },  // 41.23-44.53 "«កូនអើយ ពេលឃ្លាន កុំភ្លេចបើកក្រឡនេះហូបជាមួយបាយក្តៅៗ!»"

  // --- Paragraph 5: Hilarious Forest Campfire & Scaring Tigers + Bandits (44.57s - 64.83s) ---
  { id: 's20_funny_forest',    a: 1337, b: 1430, light: 'jungle'  },  // 44.57-47.67 "ហើយរឿងដ៏គួរឱ្យចង់សើចក៏កើតឡើងនៅកណ្តាលព្រៃ!"
  { id: 's21_open_jar_lid',    a: 1431, b: 1517, light: 'campfire'},  // 47.70-50.57 "រាល់ពេលកូនប្រុសបើកគម្របក្រឡប្រហុកឡើង"
  { id: 's22_aroma_blast',     a: 1518, b: 1568, light: 'campfire'},  // 50.60-52.27 "ក្លិនដ៏ឈ្ងុយឈ្ងប់ និងមានឥទ្ធិពលខ្លាំងក្លារបស់វា"
  { id: 's23_spread_jungle',   a: 1569, b: 1621, light: 'jungle'  },  // 52.30-54.03 "បានសាយភាយពេញព្រៃ!"
  { id: 's24_tiger_stalks',    a: 1622, b: 1685, light: 'jungle'  },  // 54.07-56.17 "ខ្លា និងសត្វព្រៃដែលបម្រុងនឹងចូលមកជិត"
  { id: 's25_tiger_sniffs',    a: 1686, b: 1735, light: 'jungle'  },  // 56.20-57.83 "ស្រាប់តែឈរភាំង ហិតក្លិន"
  { id: 's26_tiger_flees',     a: 1736, b: 1801, light: 'jungle'  },  // 57.87-60.03 "ហើយរត់ប្រាសអាយុចូលព្រៃជ្រៅបាត់អស់!"
  { id: 's27_bandits_ambush',  a: 1802, b: 1871, light: 'dusk'    },  // 60.07-62.37 "សូម្បីតែចោរព្រៃដែលលបស្ទាក់ប្លន់ ក៏ត្រូវដកថយដែរ"
  { id: 's28_poison_smoke',    a: 1872, b: 1945, light: 'dusk'    },  // 62.40-64.83 "ព្រោះស្មានថាជាផ្សែងពិសបុរាណ!"

  // --- Paragraph 6: Protein, Energy & Safe Arrival (64.87s - 74.27s) ---
  { id: 's29_chase_enemies',   a: 1946, b: 2011, light: 'campfire'},  // 64.87-67.03 "មិនត្រឹមតែជួយដេញសត្រូវប៉ុណ្ណោះទេ"
  { id: 's30_protein_energy',  a: 2012, b: 2120, light: 'golden'  },  // 67.07-70.67 "ប្រហុកមួយក្រឡរបស់ម្តាយ ថែមទាំងផ្តល់ប្រូតេអ៊ីន និងថាមពលយ៉ាងពេញលេញ"
  { id: 's31_strong_son',      a: 2121, b: 2168, light: 'sunny'   },  // 70.70-72.27 "ធ្វើឱ្យកូនប្រុសមានកម្លាំងមាំមួន"
  { id: 's32_safe_arrival',    a: 2169, b: 2228, light: 'sunny'   },  // 72.30-74.27 "ធ្វើដំណើរដល់គោលដៅដោយសុវត្ថិភាព។"

  // --- Paragraph 7 & 8: Mother's Love & Closing Viewer Question (74.30s - 86.70s) ---
  { id: 's33_mothers_love',    a: 2229, b: 2295, light: 'sunset'  },  // 74.30-76.50 "នេះហើយជាក្តីស្រឡាញ់របស់ម្តាយខ្មែរ៖"
  { id: 's34_pungent_outside', a: 2296, b: 2366, light: 'golden'  },  // 76.53-78.87 "មើលពីក្រៅក្លិនរាងឈួលបន្តិចមែន"
  { id: 's35_greatest_weapon', a: 2367, b: 2455, light: 'golden'  },  // 78.90-81.83 "ប៉ុន្តែវាគឺជាអាវុធការពារជីវិតកូនដ៏ពូកែបំផុតក្នុងប្រវត្តិសាស្ត្រ!"
  { id: 's36_outro_question',  a: 2456, b: 2530, light: 'sunset'  },  // 81.87-84.33 "តើអ្នកធ្លាប់យកប្រហុក ឬម្ហូបម្តាយធ្វើ ដាក់តាមខ្លួន"
  { id: 's37_outro_finale',    a: 2531, b: 2600, light: 'sunset'  },  // 84.37-86.70 "ពេលធ្វើដំណើរឆ្ងាយដែរឬទេ?"
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- Painted Lighting Palettes ----------
export const LIGHTS = {
  morning: {
    az: 46, el: 34, sky: '#ffe8cc', ground: '#6d8258', hemi: 1.22, sun: '#ffdfad', sunI: 2.45,
    fog: '#f7dec0', fogNear: 95, fogFar: 760, skyTop: '#3578c4', skyHor: '#ffd9ad',
    sunDisc: '#fff4cf', sunSize: 0.003, sat: 1.14, gain: '#fff9f0',
    waterDeep: '#1d6282', waterShal: '#5ab2c7', glint: '#fff8e6', vig: 0.17, shadowExt: 32,
  },
  sunny: {
    az: 55, el: 48, sky: '#d4ecff', ground: '#648554', hemi: 1.25, sun: '#fff7e2', sunI: 2.40,
    fog: '#c9e8fa', fogNear: 110, fogFar: 820, skyTop: '#1f74cc', skyHor: '#c4e8ff',
    sunDisc: '#fffbe6', sunSize: 0.002, sat: 1.14, gain: '#ffffff',
    waterDeep: '#185e85', waterShal: '#3db2c7', glint: '#ffffff', vig: 0.16, shadowExt: 28,
  },
  jungle: {
    az: 62, el: 42, sky: '#c8ebd4', ground: '#4a6b44', hemi: 1.18, sun: '#f7f4d4', sunI: 2.15,
    fog: '#b2dec2', fogNear: 68, fogFar: 560, skyTop: '#246b68', skyHor: '#b8e3c8',
    sunDisc: '#f4fadb', sunSize: 0.0015, sat: 1.12, gain: '#f7fff8',
    waterDeep: '#165266', waterShal: '#3c969c', glint: '#e8fff7', vig: 0.20, shadowExt: 26,
  },
  campfire: {
    az: 48, el: 28, sky: '#ffd9b8', ground: '#5e5242', hemi: 1.18, sun: '#ffc47c', sunI: 2.35,
    fog: '#d9bca8', fogNear: 65, fogFar: 520, skyTop: '#2d4f7c', skyHor: '#f2b885',
    sunDisc: '#ffe8b8', sunSize: 0.002, sat: 1.15, gain: '#fff4e6',
    waterDeep: '#1b4968', waterShal: '#6b8f9c', glint: '#ffe6bd', vig: 0.21, shadowExt: 22,
  },
  dusk: {
    az: 35, el: 24, sky: '#c6cbe6', ground: '#4c5248', hemi: 1.12, sun: '#e3d9c8', sunI: 1.95,
    fog: '#a8b8ba', fogNear: 60, fogFar: 480, skyTop: '#2f4569', skyHor: '#a6bdbd',
    sunDisc: '#000000', sunSize: 0, sat: 1.08, gain: '#f2f7f5',
    waterDeep: '#163d57', waterShal: '#3d7280', glint: '#d9eef2', vig: 0.23, shadowExt: 24,
  },
  golden: {
    az: 32, el: 24, sky: '#ffdbb3', ground: '#785e48', hemi: 1.22, sun: '#ffc575', sunI: 2.70,
    fog: '#f7cca0', fogNear: 95, fogFar: 780, skyTop: '#3b67b0', skyHor: '#ffc985',
    sunDisc: '#fff4c7', sunSize: 0.004, sat: 1.16, gain: '#fff6e8',
    waterDeep: '#1c4f7a', waterShal: '#d49d6a', glint: '#ffeab8', vig: 0.18, shadowExt: 28,
  },
  sunset: {
    az: 22, el: 16, sky: '#f2b8c6', ground: '#6b4d4a', hemi: 1.16, sun: '#ff9e63', sunI: 2.65,
    fog: '#f0af92', fogNear: 88, fogFar: 720, skyTop: '#48438a', skyHor: '#ff9e6d',
    sunDisc: '#ffe4a8', sunSize: 0.0048, sat: 1.16, gain: '#fff0e0',
    waterDeep: '#243e6e', waterShal: '#cc8068', glint: '#ffd89e', vig: 0.20, shadowExt: 34,
  },
};

export const lightFor = (S) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 's01_hook_angkor' || S.id === 's37_outro_finale') L.shadowExt = 48;
  return L;
};

// ---------- Impact Camera Shakes Synced to Speech & Action Beats ----------
const KICKS = [
  { f: 92,   a: 0.040 }, // «អាវុធសម្ងាត់» reveal
  { f: 226,  a: 0.055 }, // Red X slam on sword & spear
  { f: 564,  a: 0.050 }, // Red X slam on refrigerator
  { f: 608,  a: 0.050 }, // Red X slam on food stall
  { f: 790,  a: 0.045 }, // "ជាដាច់ខាត!" Mother's vow
  { f: 1052, a: 0.055 }, // «ប្រហុក» golden reveal
  { f: 1482, a: 0.055 }, // Jar lid POP in forest!
  { f: 1695, a: 0.065 }, // Tiger freezes & sniffs in shock!
  { f: 1882, a: 0.050 }, // Bandits recoil at "ផ្សែងពិសបុរាណ!"
  { f: 2134, a: 0.055 }, // Son power flex!
  { f: 2395, a: 0.045 }, // Greatest life-saving weapon in history!
];

// ---------- Continuous 3D Camera Choreography (Post-Audit 9:16 Perfected!) ----------
const CAMS = {
  // 1. Sweeping aerial glide over village toward iconic 5-tower Angkor Wat sanctuary
  s01_hook_angkor: [
    { f: 0,  pos: [-11.5, 8.8, 12.0], look: [-14.0, 5.2, -38.0], fov: 44 },
    { f: 58, pos: [-12.5, 6.4, 3.5],  look: [-14.0, 5.4, -38.0], fov: 40, ease: 'easeOut' },
  ],
  // 2. FIXED: Clean medium framing of FULL Khmer Mother + glowing Hero Prahok Jar on compact table!
  s02_secret_weapon: [
    { f: 59,  pos: [-11.35, 2.15, 7.6], look: [-11.35, 1.28, 1.3], fov: 41 },
    { f: 130, pos: [-11.35, 2.00, 6.4], look: [-11.35, 1.28, 1.3], fov: 39, ease: 'easeOut' },
  ],
  // 3. FIXED: All three (Tiger left, Son center, Bandit right) 100% inside 9:16 frame!
  s03_protect_son: [
    { f: 131, pos: [16.0, 2.45, 9.4], look: [16.0, 1.25, 0.3], fov: 43 },
    { f: 204, pos: [16.0, 2.20, 8.2], look: [16.0, 1.25, 0.3], fov: 41 },
  ],
  // 4. Whip-push onto crossed Sword & Spear graphic card slammed with bold Red X!
  s04_no_sword_spear: [
    { f: 205, pos: [16.0, 2.05, 5.8], look: [16.0, 1.35, 0.5], fov: 39 },
    { f: 268, pos: [16.0, 1.90, 4.7], look: [16.0, 1.35, 0.5], fov: 36, ease: 'easeOut' },
  ],
  // 5. FIXED: Young Khmer traveler (Son) clearly in foreground with ox-cart parked behind-left!
  s05_imagine_youth: [
    { f: 269, pos: [-4.6, 2.15, 6.6], look: [-6.0, 1.28, 0.6], fov: 40 },
    { f: 320, pos: [-5.8, 2.05, 6.2], look: [-6.0, 1.28, 0.6], fov: 39, path: [[-5.2, 2.10, 6.5]] },
    { f: 370, pos: [-6.8, 2.00, 5.9], look: [-6.0, 1.28, 0.6], fov: 38 },
  ],
  // 6. FIXED: 3/4 diagonal front tracking showing FULL spoked ox-cart + twin white oxen + Son!
  s06_oxcart_forest: [
    { f: 371, pos: [10.8, 2.65, 6.8], look: [6.4,  1.25, 0.0], fov: 43 },
    { f: 456, pos: [18.8, 2.50, 6.4], look: [14.5, 1.25, 0.0], fov: 41 },
  ],
  // 7. FIXED: Centered straight through the grand Sandstone Gopura Archway toward Scholar & Merchant!
  s07_distant_goal: [
    { f: 457, pos: [49.0, 2.55, 1.8], look: [61.0, 2.15, 0.0], fov: 43 },
    { f: 544, pos: [53.2, 2.75, 1.2], look: [61.5, 2.05, 0.0], fov: 40, ease: 'easeOut' },
  ],
  // 8. FIXED: Full No-Refrigerator signboard + full shrugging Son side-by-side!
  s08_no_fridge: [
    { f: 545, pos: [18.0, 2.15, 7.4], look: [18.0, 1.25, 0.4], fov: 41 },
    { f: 597, pos: [18.0, 2.02, 6.5], look: [18.0, 1.25, 0.4], fov: 39, ease: 'easeOut' },
  ],
  // 9. FIXED: Full No-Shop signboard + Son + fresh meat cleanly inside 9:16!
  s09_no_shops: [
    { f: 598, pos: [22.4, 2.20, 7.8], look: [22.4, 1.25, 0.4], fov: 42 },
    { f: 662, pos: [22.5, 2.08, 6.9], look: [22.5, 1.25, 0.4], fov: 40 },
  ],
  // 10. FIXED: Spoiled meat + stink lines + full Son pinching his nose cleanly centered!
  s10_spoiled_meat: [
    { f: 663, pos: [23.0, 2.05, 7.0], look: [23.0, 1.22, 0.5], fov: 40 },
    { f: 722, pos: [23.0, 1.95, 6.1], look: [23.0, 1.20, 0.5], fov: 38, ease: 'easeOut' },
  ],
  // 11. Back to sunlit village courtyard: Khmer Mother determined not to let her son go hungry!
  s11_mother_refuses: [
    { f: 723, pos: [-13.6, 2.15, 6.0], look: [-14.2, 1.32, 0.2], fov: 39 },
    { f: 776, pos: [-14.0, 2.05, 5.2], look: [-14.2, 1.32, 0.2], fov: 37 },
  ],
  // 12. Energetic hero punch-in on Mother's proud vow ("តាមផ្លូវជាដាច់ខាត!")
  s12_never_starve: [
    { f: 777, pos: [-14.0, 1.98, 4.9], look: [-14.2, 1.36, 0.2], fov: 36 },
    { f: 812, pos: [-14.1, 1.92, 4.3], look: [-14.2, 1.38, 0.2], fov: 34, ease: 'easeOut' },
  ],
  // 13. FIXED: Tonle Sap river + overflowing silver fish baskets + FULL smiling Mother!
  s13_fresh_fish: [
    { f: 813, pos: [-24.5, 2.40, 7.8], look: [-25.9, 1.15, 1.4], fov: 42 },
    { f: 901, pos: [-24.8, 2.15, 6.6], look: [-25.8, 1.15, 1.4], fov: 40 },
  ],
  // 14. FIXED: Mother pounding wooden mortar + white salt bowl + sun-drying fish rack all in view!
  s14_pound_salt_sun: [
    { f: 902, pos: [-11.2, 2.35, 7.4], look: [-11.1, 1.18, 0.9], fov: 42 },
    { f: 955, pos: [-10.8, 2.20, 6.5], look: [-10.9, 1.15, 0.9], fov: 40 },
  ],
  // 15. FIXED: Orbiting dolly showing Mother tending the row of 4 glazed fermenting Prahok jars!
  s15_ferment_jars: [
    { f: 956,  pos: [-12.2, 2.15, 3.8], look: [-11.0, 1.10, -2.0], fov: 40 },
    { f: 1011, pos: [-9.8,  2.10, 3.6], look: [-11.0, 1.10, -2.0], fov: 39 },
  ],
  // 16. FIXED: Full proud Mother + gleaming golden Hero Prahok Jar on compact courtyard table!
  s16_prahok_born: [
    { f: 1012, pos: [-11.35, 2.15, 7.2], look: [-11.35, 1.25, 1.3], fov: 40 },
    { f: 1084, pos: [-11.30, 1.98, 6.0], look: [-11.30, 1.24, 1.3], fov: 38, ease: 'easeOut' },
  ],
  // 17. Departure morning: hitched ox-cart ready on road while Mother brings the small Prahok jar
  s17_morning_depart: [
    { f: 1085, pos: [-6.8, 2.45, 8.2], look: [-7.5, 1.30, 0.4], fov: 42 },
    { f: 1153, pos: [-7.2, 2.20, 6.9], look: [-7.8, 1.28, 0.6], fov: 40 },
  ],
  // 18. FIXED: Generous two-shot of Mother handing Prahok jar to Son bowing in Sampheah!
  s18_pack_thong_yam: [
    { f: 1154, pos: [-8.0, 2.10, 6.6], look: [-8.0, 1.30, 0.8], fov: 40 },
    { f: 1236, pos: [-8.0, 2.02, 5.8], look: [-8.0, 1.30, 0.8], fov: 38 },
  ],
  // 19. FIXED: Warm close orbit with BOTH Mother and Son 100% unclipped inside frame!
  s19_mother_advice: [
    { f: 1237, pos: [-8.5, 2.02, 5.9], look: [-8.0, 1.32, 0.8], fov: 38 },
    { f: 1336, pos: [-7.5, 2.02, 5.9], look: [-8.0, 1.32, 0.8], fov: 38 },
  ],
  // 20. Atmospheric push into deep emerald jungle clearing: parked ox-cart & glowing campfire!
  s20_funny_forest: [
    { f: 1337, pos: [23.2, 3.10, 9.6], look: [23.2, 1.25, 0.4], fov: 44 },
    { f: 1430, pos: [23.8, 2.30, 7.2], look: [23.9, 1.18, 0.8], fov: 40, ease: 'easeOut' },
  ],
  // 21. FIXED: Full Son + steaming rice pot + Prahok jar lid popping open cleanly centered!
  s21_open_jar_lid: [
    { f: 1431, pos: [24.25, 2.05, 6.4], look: [24.25, 1.15, 1.0], fov: 40 },
    { f: 1517, pos: [24.25, 1.92, 5.5], look: [24.25, 1.12, 1.0], fov: 38, ease: 'easeOut' },
  ],
  // 22. FIXED: Swirling golden-emerald savory aroma plumes + full happy Son!
  s22_aroma_blast: [
    { f: 1518, pos: [23.9, 2.00, 5.9], look: [24.25, 1.24, 1.0], fov: 39 },
    { f: 1568, pos: [24.7, 2.18, 6.4], look: [24.25, 1.30, 1.0], fov: 41 },
  ],
  // 23. High crane pullback as giant concentric golden-green aroma shockwaves ripple across the forest!
  s23_spread_jungle: [
    { f: 1569, pos: [24.0, 3.4, 7.2],  look: [24.0, 1.2, 0.6], fov: 44 },
    { f: 1621, pos: [24.0, 7.8, 12.2], look: [24.0, 1.0, 0.2], fov: 46, ease: 'easeOut' },
  ],
  // 24. Low dramatic tracking as fierce Tiger & Wild Boar prowl out from bushes toward camp!
  s24_tiger_stalks: [
    { f: 1622, pos: [19.2, 2.05, 7.2], look: [18.4, 1.08, 0.2], fov: 42 },
    { f: 1685, pos: [20.6, 1.95, 6.4], look: [19.8, 1.08, 0.2], fov: 40 },
  ],
  // 25. Whip-push onto Tiger & Boar freezing wide-eyed in shock as Prahok cloud hits their noses!
  s25_tiger_sniffs: [
    { f: 1686, pos: [20.6, 1.95, 6.4], look: [19.9, 1.12, 0.2], fov: 40 },
    { f: 1735, pos: [20.4, 1.82, 5.3], look: [20.0, 1.12, 0.2], fov: 37, ease: 'easeOut' },
  ],
  // 26. Comedic tracking pan as Tiger & Boar spin 180 deg in dust clouds and sprint into deep forest!
  s26_tiger_flees: [
    { f: 1736, pos: [20.5, 2.25, 6.8], look: [19.2, 1.15, 0.2], fov: 43 },
    { f: 1801, pos: [16.8, 2.45, 7.4], look: [14.0, 1.15, -0.8], fov: 43 },
  ],
  // 27. Sneaky forest Bandits leap from behind ambush trees at x=32 -> hit by Prahok wave & recoil!
  s27_bandits_ambush: [
    { f: 1802, pos: [32.2, 2.25, 7.2], look: [32.6, 1.28, -0.3], fov: 42 },
    { f: 1871, pos: [32.8, 2.12, 6.5], look: [33.0, 1.28, -0.3], fov: 40 },
  ],
  // 28. Bandits coughing with green-gold fumes & ancient poison skull thought bubble -> scrambling away!
  s28_poison_smoke: [
    { f: 1872, pos: [32.8, 2.15, 6.6], look: [33.2, 1.38, -0.3], fov: 41 },
    { f: 1945, pos: [34.8, 2.35, 7.2], look: [35.8, 1.32, -0.5], fov: 42 },
  ],
  // 29. Back at cozy campfire: Son happily eating hot rice & Prahok completely safe & relaxed!
  s29_chase_enemies: [
    { f: 1946, pos: [24.4, 2.05, 6.2], look: [24.25, 1.22, 0.95], fov: 39 },
    { f: 2011, pos: [23.9, 1.98, 5.6], look: [24.25, 1.22, 0.95], fov: 38 },
  ],
  // 30. FIXED: Hero orbit around glowing Prahok jar, steaming rice pot & proud Son!
  s30_protein_energy: [
    { f: 2012, pos: [23.6, 1.95, 5.8], look: [24.1, 1.12, 1.0], fov: 39 },
    { f: 2120, pos: [24.8, 2.00, 5.6], look: [24.1, 1.12, 1.0], fov: 38 },
  ],
  // 31. Low-angle heroic push on Son flexing strong arms in golden starburst power aura!
  s31_strong_son: [
    { f: 2121, pos: [24.8, 1.85, 5.8], look: [24.8, 1.35, 0.8], fov: 39 },
    { f: 2168, pos: [24.8, 1.72, 4.9], look: [24.8, 1.38, 0.8], fov: 36, ease: 'easeOut' },
  ],
  // 32. Sunny triumphant arrival: Son & ox-cart pass Angkor Sandstone Gate greeted by Scholar & Merchant!
  s32_safe_arrival: [
    { f: 2169, pos: [60.8, 2.70, 8.8], look: [61.8, 1.40, 0.4], fov: 44 },
    { f: 2228, pos: [62.8, 2.50, 8.0], look: [62.8, 1.38, 0.4], fov: 42 },
  ],
  // 33. Golden-hour tribute in Angkor village: Mother smiling warmly beside glowing crimson Heart emblem!
  s33_mothers_love: [
    { f: 2229, pos: [-12.1, 2.15, 6.4], look: [-12.15, 1.35, 0.6], fov: 39 },
    { f: 2295, pos: [-11.8, 2.05, 5.6], look: [-12.15, 1.35, 0.6], fov: 37 },
  ],
  // 34. FIXED: Open Prahok jar puffing cheeky green-gold swirl + FULL grinning Son!
  s34_pungent_outside: [
    { f: 2296, pos: [-10.55, 2.05, 6.4], look: [-10.60, 1.24, 1.25], fov: 39 },
    { f: 2366, pos: [-10.45, 1.98, 5.7], look: [-10.60, 1.24, 1.25], fov: 38 },
  ],
  // 35. FIXED: Epic heroic pedestal shot — FULL Mother, gleaming Hero Prahok Jar & FULL Son all centered!
  s35_greatest_weapon: [
    { f: 2367, pos: [-11.0, 2.20, 7.6], look: [-11.0, 1.30, 1.15], fov: 41 },
    { f: 2455, pos: [-11.0, 2.05, 6.5], look: [-11.0, 1.30, 1.15], fov: 39, ease: 'easeOut' },
  ],
  // 36. FIXED: Warm viewer question two-shot — FULL Mother & FULL Son flanking the Prahok Jar!
  s36_outro_question: [
    { f: 2456, pos: [-11.5, 2.10, 6.8], look: [-11.0, 1.32, 1.15], fov: 40 },
    { f: 2530, pos: [-10.5, 2.10, 6.8], look: [-11.0, 1.32, 1.15], fov: 40 },
  ],
  // 37. Grand sunset crane pullback revealing Mother, Son, Ox-Cart, Sugar Palms & Angkor Wat!
  s37_outro_finale: [
    { f: 2531, pos: [-10.5, 2.6, 7.2],  look: [-12.0, 1.8, -8.0],  fov: 42 },
    { f: 2600, pos: [-9.5,  6.8, 14.5], look: [-13.5, 3.8, -26.0], fov: 45, ease: 'smooth' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  c.flash = (f >= 1052 && f < 1056) ? (1 - (f - 1052) / 4) * 0.35 : 0;
  c.shadowAt = [...c.look];
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS LOCK: cinf === 0 ON EVERY FRAME ----------
export const dofAt = () => ({ focus: 8, cinf: 0 });

// ---------- Animated 3D World State ----------
export const worldAt = (f) => {
  const S = shotAt(f), t = f / 30;
  const W = {
    showWorkshop: false,
    showTable: false,
    showCamp: false,
    cart: { show: false, x: 0, z: 0, ry: 0, wheelRot: 0, walkPhase: 0, moving: false },
    jar: null,
  };

  switch (S.id) {
    case 's01_hook_angkor':
      W.showWorkshop = true;
      W.cart = { show: true, x: -7.5, z: 0, ry: 0, wheelRot: 0, walkPhase: t * 2, moving: false };
      break;
    case 's02_secret_weapon':
      W.showTable = true;
      W.jar = { x: -10.95, y: 0.84, z: 1.4, s: 1.08, ry: t * 0.8, lidOpen: 0, glow: 1.0, rings: 0 };
      break;
    case 's05_imagine_youth':
      // Parked slightly behind-left so white oxen NEVER block Son!
      W.cart = { show: true, x: -10.2, z: -1.6, ry: 0.12, wheelRot: 0, walkPhase: t * 2, moving: false };
      break;
    case 's06_oxcart_forest': {
      const k = ramp(f, 371, 456);
      const cx = lerp(5.5, 13.8, k);
      W.cart = { show: true, x: cx, z: 0, ry: 0, wheelRot: cx / 0.88, walkPhase: f * 0.28, moving: true };
      break;
    }
    case 's07_distant_goal': {
      const k = ramp(f, 457, 544);
      const cx = lerp(52.5, 55.8, k);
      W.cart = { show: true, x: cx, z: -0.6, ry: 0, wheelRot: cx / 0.88, walkPhase: f * 0.26, moving: true };
      break;
    }
    case 's11_mother_refuses':
    case 's12_never_starve':
    case 's13_fresh_fish':
    case 's14_pound_salt_sun':
    case 's15_ferment_jars':
      W.showWorkshop = true;
      break;
    case 's16_prahok_born':
      W.showTable = true;
      W.jar = { x: -10.95, y: 0.84, z: 1.4, s: 1.12, ry: t * 0.9, lidOpen: 0, glow: 1.0, rings: 0 };
      break;
    case 's17_morning_depart':
    case 's18_pack_thong_yam':
    case 's19_mother_advice':
      W.cart = { show: true, x: -4.2, z: -0.8, ry: 0, wheelRot: 0, walkPhase: t * 1.8, moving: false };
      break;
    case 's20_funny_forest':
      W.showCamp = true;
      W.cart = { show: true, x: 20.4, z: -1.4, ry: 0.12, wheelRot: 0, walkPhase: 0, moving: false };
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.92, ry: 0.3, lidOpen: 0, glow: 0.3, rings: 0 };
      break;
    case 's21_open_jar_lid': {
      W.showCamp = true;
      const openK = clamp(ramp(f, 1478, 1502));
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.96, ry: 0.3, lidOpen: openK, glow: openK * 0.85, rings: 0 };
      break;
    }
    case 's22_aroma_blast':
      W.showCamp = true;
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.98, ry: 0.3, lidOpen: 1, glow: 1.0, rings: 0.55 };
      break;
    case 's23_spread_jungle':
      W.showCamp = true;
      W.cart = { show: true, x: 20.4, z: -1.4, ry: 0.12, wheelRot: 0, walkPhase: 0, moving: false };
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 1.0, ry: 0.3, lidOpen: 1, glow: 1.0, rings: 1.25 };
      break;
    case 's24_tiger_stalks':
    case 's25_tiger_sniffs':
      W.showCamp = true;
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.95, ry: 0.3, lidOpen: 1, glow: 0.9, rings: 0.85 };
      break;
    case 's29_chase_enemies':
      W.showCamp = true;
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.95, ry: 0.3, lidOpen: 1, glow: 0.8, rings: 0.45 };
      break;
    case 's30_protein_energy':
      W.showCamp = true;
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 1.02, ry: t * 0.8, lidOpen: 1, glow: 1.0, rings: 0.35 };
      break;
    case 's31_strong_son':
      W.showCamp = true;
      W.jar = { x: 24.0, y: 0.48, z: 1.15, s: 0.95, ry: 0.3, lidOpen: 1, glow: 0.85, rings: 0 };
      break;
    case 's32_safe_arrival': {
      const k = ramp(f, 2169, 2228);
      const cx = lerp(58.2, 60.8, k);
      W.cart = { show: true, x: cx, z: -0.4, ry: 0, wheelRot: cx / 0.88, walkPhase: f * 0.28, moving: true };
      break;
    }
    case 's34_pungent_outside':
      W.showTable = true;
      W.jar = { x: -11.0, y: 0.84, z: 1.4, s: 1.02, ry: t * 0.5, lidOpen: 1, glow: 0.75, rings: 0.35 };
      break;
    case 's35_greatest_weapon':
    case 's36_outro_question':
      W.showTable = true;
      W.jar = { x: -11.0, y: 0.84, z: 1.4, s: 1.05, ry: t * 0.6, lidOpen: 0, glow: 1.0, rings: 0 };
      break;
    case 's37_outro_finale':
      W.showTable = true;
      W.cart = { show: true, x: -6.5, z: -0.5, ry: 0.1, wheelRot: 0, walkPhase: t * 1.5, moving: false };
      W.jar = { x: -11.0, y: 0.84, z: 1.4, s: 1.05, ry: t * 0.5, lidOpen: 0, glow: 1.0, rings: 0 };
      break;
  }
  return W;
};

// ---------- 2D Bean-Head Khmer Actors & Jungle Beasts ----------
const K = (T, role, o, pos, extra = {}) => ({
  key: 'kh_' + role + JSON.stringify(o),
  draw: (p) => T.khmerChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

const CARD = (keyStr, drawFn, pos, extra = {}) => ({
  key: keyStr,
  draw: drawFn,
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#fff0db' : (S.light === 'sunset' || S.light === 'campfire') ? '#ffe4cc' : '#ffffff';
  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 's01_hook_angkor':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'wave', R: 'hip', wv: q(f * 0.28, 1), expr: 'proud', facing: 1 }, [-12.8, 0, -1.5], { tint }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hang', R: 'wave', wv: q(f * 0.25, 1), expr: 'grin', facing: -1 }, [-10.6, 0, -1.2], { tint }));
      break;

    case 's02_secret_weapon':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', expr: 'proud', facing: 1 }, [-11.82, 0, 1.2], { tint, s: 1.02 }));
      break;

    case 's03_protect_son':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'hold', jar: true, expr: 'proud', facing: 1 }, [16.0, 0, 0.5], { tint, s: 1.02 }));
      out.push(CARD('tig_prowl_' + q((f * 0.2) % 6.28, 1), (p) => T.drawTiger(p, { mode: 'prowl', phase: q(f * 0.2, 1) }), [14.85, 0, 0.2], { tint, s: 0.96 }));
      out.push(K(T, 'banditA', { ...id(5), seed: 5, L: 'hip', R: 'up', blade: true, expr: 'sneaky', facing: -1 }, [17.15, 0, 0.2], { tint, s: 0.98 }));
      break;

    case 's04_no_sword_spear': {
      const slam = M.back(ramp(f, 222, 236));
      out.push(CARD('noweap_' + q(slam, 2), (p) => T.drawIconCard(p, 'noWeapons', q(slam, 2)), [16.0, 0.25, 0.5], { s: 1.15, blob: false, shadow: false }));
      break;
    }

    case 's05_imagine_youth': {
      const step = q((f * 0.04) % 1, 2);
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hang', R: 'wave', wv: q(f * 0.25, 1), step: f < 310 ? step : 0, expr: 'grin', facing: 1, bag: true }, [-5.9, 0, 0.8], { tint, s: 1.04 }));
      break;
    }

    case 's06_oxcart_forest': {
      const k = ramp(f, 371, 456);
      const cx = lerp(5.5, 13.8, k);
      const step = q((f * 0.06) % 1, 2);
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hang', R: 'point', step, expr: 'determined', facing: 1, bag: true }, [cx + 1.6, 0, 1.35], { tint }));
      break;
    }

    case 's07_distant_goal':
      out.push(K(T, 'scholar', { ...id(7), seed: 7, L: 'hold', R: 'wave', wv: q(f * 0.24, 1), scroll: true, expr: 'warm', facing: -1 }, [61.2, 0, -0.85], { tint }));
      out.push(K(T, 'merchant', { ...id(8), seed: 8, L: 'hip', R: 'wave', wv: q(f * 0.28 + 1, 1), expr: 'grin', facing: -1 }, [61.8, 0, 0.85], { tint }));
      break;

    case 's08_no_fridge': {
      const slam = M.back(ramp(f, 560, 574));
      out.push(CARD('nofridge_' + q(slam, 2), (p) => T.drawIconCard(p, 'noFridge', q(slam, 2)), [17.42, 0.15, 0.4], { s: 0.98, blob: false, shadow: false }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'shrug', R: 'shrug', expr: 'nervous', facing: -1 }, [18.58, 0, 0.4], { tint }));
      break;
    }

    case 's09_no_shops': {
      const slam = M.back(ramp(f, 604, 618));
      out.push(CARD('noshop_' + q(slam, 2), (p) => T.drawIconCard(p, 'noShop', q(slam, 2)), [21.65, 0.15, 0.4], { s: 0.94, blob: false, shadow: false }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'shrug', R: 'hip', expr: 'nervous', facing: 1 }, [22.55, 0, 0.3], { tint, s: 0.98 }));
      out.push(CARD('meat_fresh', (p) => T.drawIconCard(p, 'spoiledMeat', 0.0), [23.35, 0.08, 0.55], { s: 0.78 }));
      break;
    }

    case 's10_spoiled_meat': {
      const rotK = clamp(ramp(f, 668, 700));
      out.push(CARD('meat_rot_' + q(rotK, 2), (p) => T.drawIconCard(p, 'spoiledMeat', q(rotK, 2)), [22.45, 0.12, 0.5], { s: 0.96 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'pinch', R: 'shrug', expr: 'disgust', facing: -1 }, [23.52, 0, 0.5], { tint }));
      break;
    }

    case 's11_mother_refuses':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'hip', expr: 'determined', facing: 1 }, [-14.2, 0, 0.2], { tint, s: 1.05 }));
      break;

    case 's12_never_starve':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'up', expr: 'proud', facing: 1 }, [-14.2, 0, 0.2], { tint, s: 1.06 }));
      break;

    case 's13_fresh_fish':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', expr: 'grin', facing: -1 }, [-25.15, 0, 1.2], { tint, s: 1.02 }));
      break;

    case 's14_pound_salt_sun': {
      const poundPh = q((f * 0.52) % 6.28, 1);
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hold', R: 'pound', wv: poundPh, pestle: true, expr: 'effort', facing: -1 }, [-11.45, 0, 0.72], { tint, s: 1.0 }));
      break;
    }

    case 's15_ferment_jars':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'sampheah', R: 'sampheah', expr: 'warm', facing: 1 }, [-11.0, 0, -2.55], { tint }));
      break;

    case 's16_prahok_born':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', expr: 'proud', facing: 1 }, [-11.82, 0, 1.2], { tint, s: 1.02 }));
      break;

    case 's17_morning_depart':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hold', R: 'offer', jar: true, expr: 'warm', facing: 1 }, [-8.35, 0, 0.7], { tint }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hang', R: 'wave', wv: q(f * 0.25, 1), expr: 'smile', facing: -1, bag: true }, [-7.25, 0, 0.7], { tint }));
      break;

    case 's18_pack_thong_yam': {
      const handed = f >= 1196;
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', jar: !handed, expr: 'warm', facing: 1 }, [-8.48, 0, 0.8], { tint, s: 1.0 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: handed ? 'sampheah' : 'hold', R: handed ? 'sampheah' : 'hold', jar: handed, expr: 'proud', facing: -1, bag: true }, [-7.52, 0, 0.8], { tint, s: 1.0 }));
      break;
    }

    case 's19_mother_advice':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', expr: 'proud', facing: 1 }, [-8.48, 0, 0.8], { tint, s: 1.0 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'grin', facing: -1, bag: true }, [-7.52, 0, 0.8], { tint, s: 1.0 }));
      break;

    case 's20_funny_forest':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'wave', wv: q(f * 0.25, 1), riceBowl: true, expr: 'grin', facing: -1, bag: true }, [24.65, 0, 0.85], { tint }));
      break;

    case 's21_open_jar_lid': {
      const opened = f >= 1482;
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: opened ? 'up' : 'offer', riceBowl: true, expr: opened ? 'laugh' : 'grin', facing: -1, bag: true }, [24.62, 0, 0.95], { tint, s: 1.0 }));
      break;
    }

    case 's22_aroma_blast':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'eat', riceBowl: true, expr: 'proud', facing: -1, bag: true }, [24.62, 0, 0.95], { tint, s: 1.0 }));
      break;

    case 's23_spread_jungle':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'up', riceBowl: true, expr: 'laugh', facing: 1 }, [24.65, 0, 0.95], { tint }));
      break;

    case 's24_tiger_stalks': {
      const k = ramp(f, 1622, 1685);
      const tx = lerp(17.8, 20.0, k), ph = q((f * 0.35) % 6.28, 1);
      out.push(CARD('tig_stalk_' + ph, (p) => T.drawTiger(p, { mode: 'prowl', phase: ph }), [tx, 0, 0.5], { tint, s: 1.02 }));
      out.push(CARD('boar_stalk_' + ph, (p) => T.drawBoar(p, { mode: 'prowl', phase: ph }), [tx - 1.15, 0, -0.35], { tint, s: 0.90 }));
      break;
    }

    case 's25_tiger_sniffs': {
      const jolt = f >= 1695 ? Math.sin((f - 1695) * 0.6) * 0.05 : 0;
      out.push(CARD('tig_sniff', (p) => T.drawTiger(p, { mode: 'sniff', phase: 0 }), [20.25 + jolt, 0, 0.5], { tint, s: 1.04 }));
      out.push(CARD('boar_sniff', (p) => T.drawBoar(p, { mode: 'sniff', phase: 0 }), [19.25 + jolt, 0, -0.3], { tint, s: 0.90 }));
      break;
    }

    case 's26_tiger_flees': {
      const k = ramp(f, 1736, 1801);
      const tx = lerp(20.2, 12.6, k), ph = q((f * 0.65) % 6.28, 1);
      out.push(CARD('tig_flee_' + ph, (p) => T.drawTiger(p, { mode: 'flee', phase: ph }), [tx, 0.12, 0.4], { tint, s: 1.04, flip: true }));
      out.push(CARD('boar_flee_' + ph, (p) => T.drawBoar(p, { mode: 'flee', phase: ph }), [tx + 1.35, 0.08, -0.5], { tint, s: 0.92, flip: true }));
      break;
    }

    case 's27_bandits_ambush': {
      const hit = f >= 1836;
      const k = ramp(f, 1802, 1836);
      const bx1 = hit ? lerp(32.2, 32.5, ramp(f, 1836, 1871)) : lerp(31.5, 32.2, k);
      const bx2 = hit ? lerp(33.3, 33.7, ramp(f, 1836, 1871)) : lerp(33.9, 33.3, k);
      out.push(K(T, 'banditA', { ...id(5), seed: 5, L: hit ? 'pinch' : 'hip', R: hit ? 'shrug' : 'up', blade: !hit, expr: hit ? 'shock' : 'sneaky', facing: -1, greenTint: hit }, [bx1, 0, -0.2], { tint, s: 1.0 }));
      out.push(K(T, 'banditB', { ...id(6), seed: 6, L: hit ? 'pinch' : 'hang', R: hit ? 'shrug' : 'up', blade: !hit, expr: hit ? 'shock' : 'sneaky', facing: -1, greenTint: hit }, [bx2, 0, -0.45], { tint, s: 0.98 }));
      break;
    }

    case 's28_poison_smoke': {
      const runK = ramp(f, 1902, 1945);
      const step = runK > 0 ? q((f * 0.09) % 1, 2) : 0;
      const bx1 = lerp(32.5, 35.8, runK), bx2 = lerp(33.6, 36.9, runK);
      out.push(K(T, 'banditA', { ...id(5), seed: 5, L: 'pinch', R: 'wave', wv: q(f * 0.4, 1), step, expr: 'dazed', facing: runK > 0 ? 1 : -1, greenTint: true }, [bx1, 0, -0.15], { tint, s: 1.0 }));
      out.push(K(T, 'banditB', { ...id(6), seed: 6, L: 'shrug', R: 'up', step, expr: 'cough', facing: runK > 0 ? 1 : -1, greenTint: true }, [bx2, 0, -0.45], { tint, s: 0.98 }));
      out.push(CARD('poison_bub', (p) => T.drawIconCard(p, 'poisonBubble', 1), [bx1 + 0.45, 1.35, 0.1], { s: 0.76, blob: false, shadow: false }));
      break;
    }

    case 's29_chase_enemies':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'eat', riceBowl: true, expr: 'laugh', facing: -1, bag: true }, [24.62, 0, 0.95], { tint, s: 1.02 }));
      break;

    case 's30_protein_energy':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'offer', riceBowl: true, expr: 'proud', facing: -1, bag: true }, [24.68, 0, 0.95], { tint, s: 1.0 }));
      break;

    case 's31_strong_son':
      out.push(CARD('pwr_' + q(f * 0.1, 1), (p) => T.drawIconCard(p, 'powerAura', q(f * 0.1, 1)), [24.8, 0.25, 0.55], { s: 1.22, blob: false, shadow: false }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'flex', R: 'flex', expr: 'laugh', facing: 1, bag: true }, [24.8, 0, 0.85], { tint, s: 1.06 }));
      break;

    case 's32_safe_arrival': {
      const k = ramp(f, 2169, 2228);
      const sx = lerp(59.6, 62.0, k), step = q((f * 0.06) % 1, 2);
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', step, expr: 'proud', facing: 1, bag: true }, [sx, 0, 1.25], { tint, s: 1.02 }));
      out.push(K(T, 'scholar', { ...id(7), seed: 7, L: 'sampheah', R: 'sampheah', expr: 'warm', facing: -1 }, [63.3, 0, 0.85], { tint }));
      out.push(K(T, 'merchant', { ...id(8), seed: 8, L: 'hip', R: 'wave', wv: q(f * 0.3, 1), expr: 'grin', facing: -1 }, [63.8, 0, 1.95], { tint }));
      break;
    }

    case 's33_mothers_love':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'sampheah', R: 'sampheah', expr: 'warm', facing: 1 }, [-12.65, 0, 0.6], { tint, s: 1.03 }));
      out.push(CARD('heart_' + q(f * 0.05, 1), (p) => T.drawIconCard(p, 'heartGlow', q(f * 0.05, 1)), [-11.55, 0.45, 0.6], { s: 0.78, blob: false, shadow: false }));
      break;

    case 's34_pungent_outside':
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hip', R: 'point', expr: 'grin', facing: -1, bag: true }, [-10.18, 0, 1.2], { tint, s: 1.0 }));
      break;

    case 's35_greatest_weapon':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', expr: 'proud', facing: 1 }, [-11.72, 0, 1.15], { tint, s: 1.0 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'proud', facing: -1, bag: true }, [-10.28, 0, 1.15], { tint, s: 1.0 }));
      break;

    case 's36_outro_question':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'wave', R: 'offer', wv: q(f * 0.28, 1), expr: 'warm', facing: 1 }, [-11.72, 0, 1.15], { tint, s: 1.0 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'wave', wv: q(f * 0.28 + 1, 1), expr: 'grin', facing: -1, bag: true }, [-10.28, 0, 1.15], { tint, s: 1.0 }));
      break;

    case 's37_outro_finale':
      out.push(K(T, 'mother', { ...id(1), seed: 1, L: 'wave', R: 'hip', wv: q(f * 0.26, 1), expr: 'proud', facing: 1 }, [-11.8, 0, 1.15], { tint, s: 1.04 }));
      out.push(K(T, 'son', { ...id(2), seed: 2, L: 'hold', R: 'wave', wv: q(f * 0.26 + 1.2, 1), expr: 'laugh', facing: -1, bag: true }, [-10.2, 0, 1.15], { tint, s: 1.04 }));
      break;
  }
  return out;
};

// ---------- 2D Atmospheric & Comedic FX Cards ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  if (['s21_open_jar_lid', 's22_aroma_blast', 's23_spread_jungle', 's25_tiger_sniffs', 's27_bandits_ambush', 's28_poison_smoke', 's34_pungent_outside'].includes(S.id)) {
    if (S.id === 's21_open_jar_lid' && f < 1482) return out;
    const basePos =
      S.id === 's25_tiger_sniffs' ? [21.0, 0.55, 0.5] :
      (S.id === 's27_bandits_ambush' || S.id === 's28_poison_smoke') ? [32.1, 0.45, 0.0] :
      S.id === 's34_pungent_outside' ? [-11.0, 1.05, 1.4] :
      [24.0, 0.72, 1.15];
    const green = (S.id === 's27_bandits_ambush' || S.id === 's28_poison_smoke' || S.id === 's25_tiger_sniffs');
    for (let i = 0; i < 3; i++) {
      const ph = q(((f * 0.035) + i / 3) % 1, 2);
      out.push({
        key: `aroma_${green ? 1 : 0}_${ph}`,
        draw: (p) => T.drawAromaCloud(p, ph, green),
        x: basePos[0] + Math.sin(ph * 5 + i * 2) * (S.id === 's23_spread_jungle' ? 2.6 : 0.65),
        y: basePos[1] + ph * (S.id === 's23_spread_jungle' ? 2.2 : 1.05),
        z: basePos[2] + Math.cos(ph * 4 + i) * 0.22,
        s: (S.id === 's23_spread_jungle' ? 1.30 : 0.62) * (0.65 + ph * 0.55),
        blob: false, shadow: false, order: 4,
      });
    }
  }

  if (S.id === 's26_tiger_flees') {
    const k = ramp(f, 1736, 1801), tx = lerp(20.2, 12.6, k);
    for (let i = 0; i < 2; i++) {
      const ph = q(((f * 0.08) + i * 0.5) % 1, 2);
      out.push({
        key: `dust_${ph}`, draw: (p) => T.fxDust(p, ph),
        x: tx + 1.4 + i * 0.9, y: 0.05, z: 0.3 - i * 0.5,
        s: 0.65 + ph * 0.45, blob: false, shadow: false, order: 3,
      });
    }
  }

  return out;
};
