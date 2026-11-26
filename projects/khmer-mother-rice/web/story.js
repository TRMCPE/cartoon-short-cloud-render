// Master 38-Shot Plan for "«បាយឆ្អិនហើយកូន!» — យុទ្ធសាស្ត្រផ្លូវចិត្តម្តាយខ្មែរ"
// Synced to merged 2-part Khmer voice.mp3 (87.10s, 30 fps, TOTAL = 2613 frames).
// Enforces: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion, ZERO occlusion,
// verified 9:16 horizontal framing (W_vis = 2 * D * tan(fov/2) * 0.5625), and clear y = 76% Khmer subtitle zone.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 2613;

export const SHOTS = [
  // --- Paragraph 1: Hook (0.00s - 7.77s, f0000 - f0233) ---
  { id: 's01_hook_sleep_trick',  a: 0,    b: 51,   light: 'noon'    }, // 0.00-1.70 "តើអ្នកធ្លាប់ត្រូវម្តាយបោកឱ្យងើបពីគេង"
  { id: 's02_hook_stop_game',    a: 52,   b: 100,  light: 'noon'    }, // 1.73-3.33 "ឬឈប់លេងហ្គេម ដោយពាក្យមួយឃ្លាថា"
  { id: 's03_hook_rice_ready',   a: 101,  b: 170,  light: 'golden'  }, // 3.37-5.67 "«មកហូបបាយ បាយឆ្អិនហើយកូន!»"
  { id: 's04_hook_ever_or_not',  a: 171,  b: 233,  light: 'sunny'   }, // 5.70-7.77 "(ចម្លើយសើច) ... ដែរឬទេ?"

  // --- Paragraph 2: Top-Tier Khmer Mother Psychology Across Generations (7.80s - 13.63s, f0234 - f0409) ---
  { id: 's05_psych_mastermind',  a: 234,  b: 322,  light: 'golden'  }, // 7.80-10.73 "សូមស្វាគមន៍មកកាន់យុទ្ធសាស្ត្រផ្លូវចិត្តលំដាប់កំពូល"
  { id: 's06_khmer_mom_pride',   a: 323,  b: 355,  light: 'sunny'   }, // 10.77-11.83 "របស់ម្តាយខ្មែរ"
  { id: 's07_generations_pass',  a: 356,  b: 409,  light: 'golden'  }, // 11.87-13.63 "ដែលបានបន្សល់ទុកពីជំនាន់មួយទៅជំនាន់មួយ!"

  // --- Paragraph 3: Gaming, Noon Nap & The "5 More Minutes -> 1 Hour" Loop (13.67s - 29.00s, f0410 - f0870) ---
  { id: 's08_addicted_gaming',   a: 410,  b: 470,  light: 'noon'    }, // 13.67-15.67 "ស្រមៃមើលថា អ្នកកំពុងជក់លេងយ៉ាងសប្បាយ"
  { id: 's09_noon_deep_nap',     a: 471,  b: 540,  light: 'noon'    }, // 15.70-18.00 "ឬកំពុងដេកលក់យ៉ាងស្រួលនៅពេលថ្ងៃត្រង់។"
  { id: 's10_mom_calls_chores',  a: 541,  b: 618,  light: 'sunny'   }, // 18.03-20.60 "នៅពេលម្តាយហៅឱ្យមកជួយធ្វើការផ្ទះ ឬឱ្យងើបពីគេង"
  { id: 's11_usual_answer',      a: 619,  b: 704,  light: 'noon'    }, // 20.63-23.47 "តាមធម្មតា ចម្លើយដែលគាត់ទទួលបានគឺ៖"
  { id: 's12_wait_five_min',     a: 705,  b: 767,  light: 'noon'    }, // 23.50-25.57 "«ចាំបន្តិចម៉ែ ៥ នាទីទៀត!»"
  { id: 's13_five_min_badge',    a: 768,  b: 800,  light: 'noon'    }, // 25.60-26.67 "ប៉ុន្តែ ៥ នាទីរបស់កូន"
  { id: 's14_clock_one_hour',    a: 801,  b: 870,  light: 'dusk'    }, // 26.70-29.00 "ជួនកាលអូសបន្លាយដល់មួយម៉ោងក៏មាន។"

  // --- Paragraph 4: Mom Unleashes The Secret Move! (29.03s - 41.37s, f0871 - f1241) ---
  { id: 's15_mom_knows_heart',   a: 871,  b: 916,  light: 'sunny'   }, // 29.03-30.53 "ដោយដឹងច្បាស់ពីចិត្តកូន"
  { id: 's16_secret_technique',  a: 917,  b: 1014, light: 'golden'  }, // 30.57-33.80 "ម្តាយខ្មែរក៏បញ្ចេញក្បាច់សម្ងាត់ដ៏មានប្រសិទ្ធភាពបំផុត!"
  { id: 's17_shouts_kitchen',    a: 1015, b: 1095, light: 'kitchen' }, // 33.83-36.50 "គាត់ស្រែកពីផ្ទះបាយមកយ៉ាងឮថា៖"
  { id: 's18_come_eat_fast',     a: 1096, b: 1160, light: 'kitchen' }, // 36.53-38.67 "«កូនអើយ មកហូបបាយលឿនឡើង"
  { id: 's19_hot_delicious',     a: 1161, b: 1241, light: 'golden'  }, // 38.70-41.37 "បាយឆ្អិនហើយ ម្ហូបក្តៅៗឆ្ងាញ់ណាស់!»"

  // --- Paragraph 5: Belly Rumbles, Sprinting & The Dream Feast! (41.40s - 50.70s, f1242 - f1521) ---
  { id: 's20_ears_perk_up',      a: 1242, b: 1295, light: 'noon'    }, // 41.40-43.17 "គ្រាន់តែឮពាក្យថា «បាយឆ្អិនហើយ» ភ្លាម"
  { id: 's21_stomach_rumbles',   a: 1296, b: 1343, light: 'noon'    }, // 43.20-44.77 "ក្រពះរបស់អ្នកក៏ចាប់ផ្តើមកូរ"
  { id: 's22_sprint_courtyard',  a: 1344, b: 1433, light: 'sunny'   }, // 44.80-47.77 "ហើយអ្នកក៏រត់យ៉ាងលឿនទៅផ្ទះបាយ ដោយរំពឹងថា"
  { id: 's23_dream_feast_table', a: 1434, b: 1521, light: 'dream'   }, // 47.80-50.70 "នឹងបានឃើញបាយក្តៅៗហុយផ្សែង និងម្ហូបពេញតុរួចជាស្រេច។"

  // --- Paragraph 6: Reality Hits in the Kitchen & Picking Trakuon! (50.73s - 70.00s, f1522 - f2100) ---
  { id: 's24_arrive_kitchen',    a: 1522, b: 1565, light: 'kitchen' }, // 50.73-52.17 "ប៉ុន្តែពេលមកដល់ផ្ទះបាយភ្លាម"
  { id: 's25_freeze_in_shock',   a: 1566, b: 1621, light: 'shock'   }, // 52.20-54.03 "អ្នកស្រាប់តែឈរភាំង!"
  { id: 's26_washing_raw_rice',  a: 1622, b: 1691, light: 'kitchen' }, // 54.07-56.37 "ព្រោះម្តាយទើបតែកំពុងលាងអង្ករដាក់ឆ្នាំង"
  { id: 's27_unscaled_fish',     a: 1692, b: 1744, light: 'kitchen' }, // 56.40-58.13 "ត្រីនៅក្នុងចានដែកមិនទាន់ស្រកាផង"
  { id: 's28_whole_veg_basket',  a: 1745, b: 1825, light: 'kitchen' }, // 58.17-60.83 "ហើយបន្លែវិញនៅក្នុងកន្ត្រកទាំងមូល!"
  { id: 's29_mom_turns_smiles',  a: 1826, b: 1938, light: 'kitchen' }, // 60.87-64.60 "មិនត្រឹមតែប៉ុណ្ណោះ ម្តាយក៏ងាកមកញញឹមដាក់អ្នក ហើយនិយាយយ៉ាងស្រទន់ថា៖"
  { id: 's30_help_pick_trakuon', a: 1939, b: 2007, light: 'golden'  }, // 64.63-66.90 "«មកដល់ល្មម ជួយបេះត្រកួនឱ្យម៉ែបន្តិចកូន"
  { id: 's31_twenty_min_more',   a: 2008, b: 2100, light: 'kitchen' }, // 66.93-70.00 "ប្រហែល ២០ នាទីទៀតឆ្អិនហើយ!» (អ្ហេះ!)"

  // --- Paragraph 7: Not a Lie — Mom's Smart Loving Way! (70.03s - 78.00s, f2101 - f2340) ---
  { id: 's32_not_a_lie',         a: 2101, b: 2150, light: 'sunny'   }, // 70.03-71.67 "តាមពិតទៅ នេះមិនមែនជាការកុហកទេ"
  { id: 's33_clever_method',     a: 2151, b: 2206, light: 'golden'  }, // 71.70-73.53 "ប៉ុន្តែវាជាវិធីដ៏ឆ្លាតវៃរបស់ម្តាយ"
  { id: 's34_get_kid_moving',    a: 2207, b: 2262, light: 'sunny'   }, // 73.57-75.40 "ដើម្បីឱ្យកូនងើបមកធ្វើចលនា"
  { id: 's35_chat_in_kitchen',   a: 2263, b: 2340, light: 'sunset'  }, // 75.43-78.00 "និងបានជជែកលេងជាមួយគាត់នៅក្នុងផ្ទះបាយប៉ុណ្ណោះ!"

  // --- Paragraph 8: Closing Viewer Question & Subscribe Finale (78.03s - 87.10s, f2341 - f2612) ---
  { id: 's36_how_many_times',    a: 2341, b: 2448, light: 'sunset'  }, // 78.03-81.60 "តើម្តាយរបស់អ្នកធ្លាប់ប្រើក្បាច់ «បាយឆ្អិនហើយ» នេះដាក់អ្នកប៉ុន្មានដងហើយ?"
  { id: 's37_comment_subscribe', a: 2449, b: 2536, light: 'golden'  }, // 81.63-84.53 "កុំភ្លេចខមិនប្រាប់ខាងក្រោម ហើយចុច Subscribe"
  { id: 's38_khmer_finale',      a: 2537, b: 2612, light: 'sunset'  }, // 84.57-87.10 "ដើម្បីតាមដានរឿងពិតគួរឱ្យចង់សើចរបស់ខ្មែរយើងបន្តទៀត!"
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- Painted Lighting Palettes ----------
export const LIGHTS = {
  noon: {
    az: 52, el: 50, sky: '#dff2ff', ground: '#6d8a5a', hemi: 1.25, sun: '#fff8e6', sunI: 2.35,
    fog: '#d0ecfc', fogNear: 110, fogFar: 820, skyTop: '#2478cf', skyHor: '#c9ebff',
    sunDisc: '#fffbe6', sunSize: 0.002, sat: 1.14, gain: '#ffffff', vig: 0.15, shadowExt: 26,
  },
  sunny: {
    az: 46, el: 42, sky: '#ffeede', ground: '#6c8756', hemi: 1.24, sun: '#ffebcc', sunI: 2.40,
    fog: '#f5e4cf', fogNear: 100, fogFar: 780, skyTop: '#2b77c9', skyHor: '#ffe2c2',
    sunDisc: '#fff6d6', sunSize: 0.003, sat: 1.14, gain: '#fffcf7', vig: 0.16, shadowExt: 28,
  },
  kitchen: {
    az: 42, el: 38, sky: '#ffebd4', ground: '#756450', hemi: 1.24, sun: '#ffe3bd', sunI: 2.42,
    fog: '#f2dec6', fogNear: 95, fogFar: 740, skyTop: '#3272bd', skyHor: '#ffdcb5',
    sunDisc: '#fff3cf', sunSize: 0.0025, sat: 1.15, gain: '#fffaf2', vig: 0.16, shadowExt: 26,
  },
  golden: {
    az: 34, el: 26, sky: '#ffddb8', ground: '#78604a', hemi: 1.22, sun: '#ffc87a', sunI: 2.65,
    fog: '#f7cfa5', fogNear: 95, fogFar: 760, skyTop: '#3b67b0', skyHor: '#ffca88',
    sunDisc: '#fff4c7', sunSize: 0.004, sat: 1.16, gain: '#fff7eb', vig: 0.17, shadowExt: 28,
  },
  dream: {
    az: 38, el: 32, sky: '#fff0c9', ground: '#7d6b4c', hemi: 1.28, sun: '#ffd88a', sunI: 2.75,
    fog: '#ffebb8', fogNear: 80, fogFar: 680, skyTop: '#4582cf', skyHor: '#ffe29e',
    sunDisc: '#fff9db', sunSize: 0.005, sat: 1.18, gain: '#fffaf0', vig: 0.14, shadowExt: 24,
  },
  shock: {
    az: 48, el: 36, sky: '#d0e2f7', ground: '#59636b', hemi: 1.18, sun: '#e3eef7', sunI: 2.10,
    fog: '#bdd2e6', fogNear: 75, fogFar: 620, skyTop: '#2c4f7c', skyHor: '#b8d0e8',
    sunDisc: '#000000', sunSize: 0, sat: 1.06, gain: '#f2f7fc', vig: 0.22, shadowExt: 24,
  },
  dusk: {
    az: 35, el: 28, sky: '#d4daf2', ground: '#5c5e54', hemi: 1.16, sun: '#ebd8c4', sunI: 2.05,
    fog: '#c2cbd9', fogNear: 80, fogFar: 640, skyTop: '#355082', skyHor: '#c4cddb',
    sunDisc: '#000000', sunSize: 0, sat: 1.10, gain: '#f7f8fc', vig: 0.20, shadowExt: 26,
  },
  sunset: {
    az: 24, el: 18, sky: '#f5bfd0', ground: '#6e504c', hemi: 1.18, sun: '#ffa46b', sunI: 2.65,
    fog: '#f2b599', fogNear: 90, fogFar: 740, skyTop: '#4a458c', skyHor: '#ffa475',
    sunDisc: '#ffe6ad', sunSize: 0.0048, sat: 1.16, gain: '#fff2e4', vig: 0.18, shadowExt: 32,
  },
};

export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- Impact Camera Shakes Synced to Speech & Comedic Beats ----------
const KICKS = [
  { f: 103,  a: 0.048 }, // «មកហូបបាយ បាយឆ្អិនហើយកូន!» hook burst
  { f: 280,  a: 0.042 }, // «យុទ្ធសាស្ត្រផ្លូវចិត្តលំដាប់កំពូល» crown pop
  { f: 708,  a: 0.040 }, // «ចាំបន្តិចម៉ែ ៥ នាទីទៀត!»
  { f: 818,  a: 0.052 }, // 1h! alarm clock slam
  { f: 935,  a: 0.048 }, // «ក្បាច់សម្ងាត់» reveal
  { f: 1098, a: 0.058 }, // Mother's kitchen shout «កូនអើយ មកហូបបាយលឿនឡើង!»
  { f: 1300, a: 0.045 }, // Belly rumble jolt!
  { f: 1568, a: 0.068 }, // «ឈរភាំង!» reality freeze shock!
  { f: 1945, a: 0.042 }, // «ជួយបេះត្រកួនឱ្យម៉ែបន្តិចកូន!»
  { f: 2452, a: 0.040 }, // Subscribe CTA pop
];

// ---------- Continuous 3D Camera Choreography (38 Shots, Verified 9:16 Safe Widths) ----------
const CAMS = {
  // 1. Frame-0 visual hook: Kid snoozing on carved Khmer daybed while Mom leans in playfully! (actors 1.25m apart, D=6.8m)
  s01_hook_sleep_trick: [
    { f: 0,  pos: [-14.8, 1.95, 6.2], look: [-14.9, 0.98, -0.5], fov: 42 },
    { f: 51, pos: [-14.5, 1.80, 5.4], look: [-14.9, 0.98, -0.5], fov: 40, ease: 'easeOut' },
  ],
  // 2. Whip-pan right to Kid glued to glowing mobile game in front of gaming desk! (single shot, D=5.3m)
  s02_hook_stop_game: [
    { f: 52,  pos: [-12.2, 1.80, 4.9], look: [-12.2, 1.05, -0.3], fov: 40 },
    { f: 100, pos: [-12.0, 1.68, 4.3], look: [-12.2, 1.05, -0.3], fov: 38, ease: 'easeOut' },
  ],
  // 3. Punchy hero two-unit reveal in kitchen: Mom holding rice ladle + steaming «បាយឆ្អិនហើយ!» comic emblem! (D=6.6m)
  s03_hook_rice_ready: [
    { f: 101, pos: [14.0, 1.95, 7.2], look: [14.0, 1.15, 0.6], fov: 42 },
    { f: 170, pos: [14.0, 1.80, 6.1], look: [14.0, 1.15, 0.6], fov: 39, ease: 'easeOut' },
  ],
  // 4. Relatable reaction push on Kid sheepishly grinning at viewer ("ដែរឬទេ?") in sunlit courtyard! (D=5.2m)
  s04_hook_ever_or_not: [
    { f: 171, pos: [-2.4, 1.82, 5.8], look: [-2.0, 1.08, 0.4], fov: 40 },
    { f: 233, pos: [-1.7, 1.72, 5.0], look: [-2.0, 1.08, 0.4], fov: 38 },
  ],
  // 5. Mastermind reveal: Khmer Mother beside glowing Crowned Brain emblem! (1.25m apart, D=6.6m)
  s05_psych_mastermind: [
    { f: 234, pos: [0.0, 1.95, 7.0], look: [0.0, 1.15, 0.4], fov: 42 },
    { f: 322, pos: [0.2, 1.80, 6.0], look: [0.0, 1.15, 0.4], fov: 39, ease: 'easeOut' },
  ],
  // 6. Heroic low-angle orbit around proud Khmer Mother with traditional Krama! (single, D=5.1m)
  s06_khmer_mom_pride: [
    { f: 323, pos: [-0.6, 1.68, 5.5], look: [0.0, 1.10, 0.4], fov: 39 },
    { f: 355, pos: [0.6,  1.68, 5.3], look: [0.0, 1.10, 0.4], fov: 38 },
  ],
  // 7. Generational relay: Silver-haired Khmer Grandma passing the wooden rice ladle to Mother! (1.25m apart, D=6.7m)
  s07_generations_pass: [
    { f: 356, pos: [-0.5, 1.92, 7.1], look: [0.0, 1.12, 0.4], fov: 42 },
    { f: 409, pos: [0.4,  1.82, 6.3], look: [0.0, 1.12, 0.4], fov: 40 },
  ],
  // 8. Back in bedroom: orbiting push on Kid intensely mashing buttons on mobile game! (D=5.2m)
  s08_addicted_gaming: [
    { f: 410, pos: [-11.6, 1.78, 5.0], look: [-12.2, 1.05, -0.2], fov: 40 },
    { f: 470, pos: [-12.6, 1.70, 4.5], look: [-12.2, 1.05, -0.2], fov: 38 },
  ],
  // 9. Smooth glide across room to Kid sleeping peacefully on red woven mat with floating Zzz! (D=5.8m)
  s09_noon_deep_nap: [
    { f: 471, pos: [-15.2, 1.85, 5.3], look: [-15.6, 0.92, -0.6], fov: 41 },
    { f: 540, pos: [-15.8, 1.72, 4.7], look: [-15.6, 0.92, -0.6], fov: 39, ease: 'easeOut' },
  ],
  // 10. Courtyard doorway: Mom waving and calling Kid normally to come help with chores! (D=5.5m)
  s10_mom_calls_chores: [
    { f: 541, pos: [-8.2, 1.85, 6.0], look: [-8.8, 1.08, 0.3], fov: 40 },
    { f: 618, pos: [-9.2, 1.78, 5.3], look: [-8.8, 1.08, 0.3], fov: 39 },
  ],
  // 11. Two-shot across room edge: Mom waiting with hands on hips while Kid barely looks up from phone! (1.35m apart, D=7.0m)
  s11_usual_answer: [
    { f: 619, pos: [-12.9, 1.95, 6.9], look: [-12.9, 1.08, 0.1], fov: 43 },
    { f: 704, pos: [-12.9, 1.85, 6.2], look: [-12.9, 1.08, 0.1], fov: 41 },
  ],
  // 12. Punch-in on Kid holding up 5-finger cartoon hand («ចាំបន្តិចម៉ែ ៥ នាទីទៀត!») while gaming! (D=5.0m)
  s12_wait_five_min: [
    { f: 705, pos: [-12.2, 1.78, 5.0], look: [-12.2, 1.08, 0.1], fov: 39 },
    { f: 767, pos: [-12.2, 1.68, 4.4], look: [-12.2, 1.10, 0.1], fov: 37, ease: 'easeOut' },
  ],
  // 13. Cheerful blue "5m" badge beside the 3D bedroom wall clock at 12:00! (D=5.6m)
  s13_five_min_badge: [
    { f: 768, pos: [-13.3, 2.10, 3.4], look: [-13.3, 1.85, -2.2], fov: 42 },
    { f: 800, pos: [-13.3, 2.05, 3.0], look: [-13.3, 1.85, -2.2], fov: 40 },
  ],
  // 14. Turbo-spinning 3D wall clock hands + slamming red "1h!" alarm while Kid is STILL gaming below! (D=6.2m)
  s14_clock_one_hour: [
    { f: 801, pos: [-13.2, 1.95, 4.2], look: [-13.2, 1.55, -1.8], fov: 44 },
    { f: 870, pos: [-13.2, 1.85, 3.6], look: [-13.2, 1.55, -1.8], fov: 42, ease: 'easeOut' },
  ],
  // 15. Cut to sunny kitchen: Mother smiling knowingly with clever eyes! (D=5.2m)
  s15_mom_knows_heart: [
    { f: 871, pos: [13.5, 1.80, 6.2], look: [13.8, 1.08, 1.1], fov: 39 },
    { f: 916, pos: [13.8, 1.74, 5.6], look: [13.8, 1.08, 1.1], fov: 38 },
  ],
  // 16. Dramatic hero crane-push as Mother raises rice ladle in golden aura («ក្បាច់សម្ងាត់ដ៏មានប្រសិទ្ធភាពបំផុត!»)! (D=5.5m)
  s16_secret_technique: [
    { f: 917,  pos: [13.8, 1.85, 6.6], look: [13.8, 1.15, 1.1], fov: 41 },
    { f: 1014, pos: [13.8, 1.65, 5.3], look: [13.8, 1.15, 1.1], fov: 38, ease: 'easeOut' },
  ],
  // 17. Dynamic side-angle tracking as Mother cups hands and sonic waves blast out of the kitchen! (D=6.6m)
  s17_shouts_kitchen: [
    { f: 1015, pos: [12.8, 1.95, 7.4], look: [12.8, 1.18, 0.8], fov: 43 },
    { f: 1095, pos: [11.6, 2.05, 7.6], look: [12.0, 1.22, 0.8], fov: 43 },
  ],
  // 18. Energetic close push on Mother shouting «កូនអើយ មកហូបបាយលឿនឡើង!» with comic sound arcs! (D=5.2m)
  s18_come_eat_fast: [
    { f: 1096, pos: [13.6, 1.78, 6.2], look: [13.6, 1.14, 1.1], fov: 40 },
    { f: 1160, pos: [13.6, 1.70, 5.4], look: [13.6, 1.14, 1.1], fov: 38, ease: 'easeOut' },
  ],
  // 19. Golden shout climax: Mother + giant steaming «បាយឆ្អិនហើយ!» comic rice emblem! (D=6.5m)
  s19_hot_delicious: [
    { f: 1161, pos: [13.8, 1.90, 7.3], look: [13.8, 1.18, 0.9], fov: 42 },
    { f: 1241, pos: [13.8, 1.80, 6.4], look: [13.8, 1.18, 0.9], fov: 40 },
  ],
  // 20. Whip-cut back to bedroom: Kid snaps upright wide-eyed as the sonic rice call arrives! (D=5.2m)
  s20_ears_perk_up: [
    { f: 1242, pos: [-12.4, 1.82, 5.3], look: [-12.4, 1.08, 0.1], fov: 40 },
    { f: 1295, pos: [-12.4, 1.72, 4.6], look: [-12.4, 1.08, 0.1], fov: 38, ease: 'easeOut' },
  ],
  // 21. Kid clutches rumbling belly with orange zig-zag hunger waves & drumstick thought cloud! (D=5.6m)
  s21_stomach_rumbles: [
    { f: 1296, pos: [-12.4, 1.88, 5.7], look: [-12.4, 1.18, 0.1], fov: 41 },
    { f: 1343, pos: [-12.4, 1.78, 5.0], look: [-12.4, 1.18, 0.1], fov: 39 },
  ],
  // 22. High-energy lateral tracking shot following Kid sprinting at top speed across the sunlit courtyard! (D=6.8m)
  s22_sprint_courtyard: [
    { f: 1344, pos: [-6.5, 2.05, 7.0], look: [-6.0, 1.08, 0.3], fov: 43 },
    { f: 1433, pos: [5.5,  1.95, 6.6], look: [6.2,  1.08, 0.3], fov: 42 },
  ],
  // 23. Glorious orbiting showcase of the 3D Dream Feast Table (steaming rice pot, golden fried fish, soup) + Kid cheering! (D=7.3m)
  s23_dream_feast_table: [
    { f: 1434, pos: [2.1, 2.05, 7.6], look: [2.50, 1.05, 0.25], fov: 44 },
    { f: 1521, pos: [3.0, 1.92, 6.8], look: [2.50, 1.05, 0.25], fov: 42, ease: 'easeOut' },
  ],
  // 24. Kid skids to a halt entering the Khmer kitchen doorway! (D=6.0m)
  s24_arrive_kitchen: [
    { f: 1522, pos: [11.2, 1.95, 6.6], look: [11.6, 1.08, 0.6], fov: 42 },
    { f: 1565, pos: [11.8, 1.85, 5.8], look: [11.8, 1.08, 0.6], fov: 40 },
  ],
  // 25. COMEDIC CLIMAX: Whip-zoom onto Kid frozen stiff in shock («ឈរភាំង!») with jaw drop & giant sweat drop! (D=4.8m)
  s25_freeze_in_shock: [
    { f: 1566, pos: [11.8, 1.78, 5.6], look: [11.8, 1.10, 0.8], fov: 40 },
    { f: 1621, pos: [11.8, 1.66, 4.6], look: [11.8, 1.12, 0.8], fov: 36, ease: 'easeOut' },
  ],
  // 26. Reveal #1: Camera glides onto Mother casually washing raw white rice in pot beside UNLIT cold clay stove! (D=5.8m)
  s26_washing_raw_rice: [
    { f: 1622, pos: [12.3, 1.88, 5.6], look: [12.5, 1.02, -0.1], fov: 41 },
    { f: 1691, pos: [12.6, 1.75, 4.9], look: [12.5, 1.02, -0.1], fov: 39 },
  ],
  // 27. Reveal #2: Crisp push-in onto the stainless-steel basin with the raw unscaled silver fish flopping! (D=4.3m)
  s27_unscaled_fish: [
    { f: 1692, pos: [13.9, 1.72, 4.0], look: [14.0, 0.88, -0.4], fov: 38 },
    { f: 1744, pos: [14.0, 1.55, 3.2], look: [14.0, 0.88, -0.4], fov: 35, ease: 'easeOut' },
  ],
  // 28. Reveal #3: Pan right to the woven bamboo basket overflowing with whole unpicked green Trakuon + shocked Kid! (D=6.4m)
  s28_whole_veg_basket: [
    { f: 1745, pos: [14.7, 1.90, 6.2], look: [14.85, 1.04, 0.1], fov: 42 },
    { f: 1825, pos: [15.1, 1.80, 5.6], look: [14.85, 1.04, 0.1], fov: 40 },
  ],
  // 29. Warm two-shot: Mother turns with the sweetest, gentlest smile toward frozen Kid! (actors 1.25m apart, D=6.8m)
  s29_mom_turns_smiles: [
    { f: 1826, pos: [13.4, 1.92, 7.2], look: [13.4, 1.10, 0.6], fov: 42 },
    { f: 1938, pos: [13.4, 1.82, 6.4], look: [13.4, 1.10, 0.6], fov: 40 },
  ],
  // 30. Mother hands a fresh green bunch of Trakuon to Kid («ជួយបេះត្រកួនឱ្យម៉ែបន្តិចកូន!»)! (1.20m apart, D=6.6m)
  s30_help_pick_trakuon: [
    { f: 1939, pos: [13.8, 1.88, 7.0], look: [13.6, 1.10, 0.6], fov: 41 },
    { f: 2007, pos: [13.4, 1.82, 6.3], look: [13.6, 1.10, 0.6], fov: 40 },
  ],
  // 31. Punchy comedic reveal: "20m" timer badge pops up while Kid holds Trakuon with sheepish grin! (D=6.6m)
  s31_twenty_min_more: [
    { f: 2008, pos: [13.6, 1.92, 7.0], look: [13.6, 1.16, 0.6], fov: 42 },
    { f: 2100, pos: [13.6, 1.84, 6.3], look: [13.6, 1.16, 0.6], fov: 40, ease: 'easeOut' },
  ],
  // 32. Heartwarming shift: Sunny courtyard/kitchen angle on smiling Mother («នេះមិនមែនជាការកុហកទេ»)! (D=5.4m)
  s32_not_a_lie: [
    { f: 2101, pos: [13.0, 1.82, 6.0], look: [13.2, 1.10, 0.6], fov: 39 },
    { f: 2150, pos: [13.4, 1.76, 5.4], look: [13.2, 1.10, 0.6], fov: 38 },
  ],
  // 33. Mother beside glowing Smart Heart + Lightbulb emblem («វិធីដ៏ឆ្លាតវៃរបស់ម្តាយ»)! (D=6.4m)
  s33_clever_method: [
    { f: 2151, pos: [13.8, 1.90, 6.8], look: [13.8, 1.15, 0.6], fov: 41 },
    { f: 2206, pos: [13.8, 1.80, 6.1], look: [13.8, 1.15, 0.6], fov: 39 },
  ],
  // 34. Energetic shot of Kid happily stretching & moving in sunlight instead of slouching! (D=5.4m)
  s34_get_kid_moving: [
    { f: 2207, pos: [4.0, 1.85, 5.8], look: [4.0, 1.10, 0.4], fov: 40 },
    { f: 2262, pos: [4.0, 1.75, 5.1], look: [4.0, 1.10, 0.4], fov: 38 },
  ],
  // 35. Cozy golden-sunset kitchen two-shot: Clay stove now LIT & steaming while Mom & Kid laugh picking Trakuon together! (1.20m apart, D=6.8m)
  s35_chat_in_kitchen: [
    { f: 2263, pos: [13.4, 1.92, 7.2], look: [13.8, 1.08, 0.6], fov: 42 },
    { f: 2340, pos: [14.2, 1.86, 6.6], look: [13.8, 1.08, 0.6], fov: 41 },
  ],
  // 36. Viewer question two-shot in golden sunset courtyard: Mom & Kid smiling & waving at viewer! (1.25m apart, D=6.8m)
  s36_how_many_times: [
    { f: 2341, pos: [-0.6, 1.90, 7.2], look: [0.0, 1.12, 0.5], fov: 42 },
    { f: 2448, pos: [0.6,  1.86, 6.6], look: [0.0, 1.12, 0.5], fov: 40 },
  ],
  // 37. Comment & Subscribe CTA: Kid & Mom flanking the bold Comment + Red Play Subscribe card! (D=7.8m, fov=44)
  s37_comment_subscribe: [
    { f: 2449, pos: [0.0, 1.98, 8.2], look: [0.0, 1.18, 0.5], fov: 44 },
    { f: 2536, pos: [0.0, 1.88, 7.3], look: [0.0, 1.18, 0.5], fov: 42, ease: 'easeOut' },
  ],
  // 38. Grand sunset crane pullback over the warm Cambodian family courtyard, sugar palms & home!
  s38_khmer_finale: [
    { f: 2537, pos: [0.0, 2.25, 7.6],  look: [0.0, 1.25, -1.0], fov: 43 },
    { f: 2612, pos: [0.0, 5.20, 13.5], look: [0.0, 2.10, -8.0], fov: 46, ease: 'smooth' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  c.flash = (f >= 1566 && f < 1570) ? (1 - (f - 1566) / 4) * 0.28 : 0;
  c.shadowAt = [...c.look];
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS LOCK: cinf === 0 ON EVERY FRAME ----------
export const dofAt = () => ({ focus: 8, cinf: 0 });

// ---------- Per-Frame 3D World Props State ----------
export const worldAt = (f) => {
  const S = shotAt(f);
  const W = {
    clockHours: 12.0,
    showDreamFeast: false,
    stoveLit: false,
    riceWashing: false,
    fishFlop: false,
    pickingVeg: false,
    shoutWave: 0,
  };

  if (S.id === 's13_five_min_badge') {
    W.clockHours = lerp(12.0, 12.083, ramp(f, 768, 800));
  } else if (S.id === 's14_clock_one_hour') {
    W.clockHours = lerp(12.083, 13.0, M.easeIn(ramp(f, 801, 845)));
  }

  if (S.id === 's23_dream_feast_table') {
    W.showDreamFeast = true;
  }

  if (['s17_shouts_kitchen', 's18_come_eat_fast', 's19_hot_delicious'].includes(S.id)) {
    W.shoutWave = 1.0;
  }

  if (['s26_washing_raw_rice', 's29_mom_turns_smiles'].includes(S.id)) {
    W.riceWashing = true;
  }
  if (S.id === 's27_unscaled_fish') {
    W.fishFlop = true;
  }
  if (['s30_help_pick_trakuon', 's31_twenty_min_more', 's35_chat_in_kitchen'].includes(S.id)) {
    W.pickingVeg = true;
  }
  if (S.id === 's35_chat_in_kitchen') {
    W.stoveLit = true;
  }

  return W;
};

// ---------- 2D Bean-Head Khmer Family Actors & Comic Cards ----------
const H = (T, role, o, pos, extra = {}) => ({
  key: 'hm_' + role + JSON.stringify(o),
  draw: (p) => T.khmerHomeChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

const CARD = (keyStr, drawFn, pos, extra = {}) => ({
  key: keyStr,
  draw: drawFn,
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = (S.light === 'golden' || S.light === 'dream') ? '#fff3e0' : S.light === 'sunset' ? '#ffe6cf' : S.light === 'shock' ? '#e8f2fc' : '#ffffff';
  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 's01_hook_sleep_trick':
      out.push(H(T, 'kid', { mode: 'sleep', wv: q(f * 0.14, 1), expr: 'sleepy' }, [-15.55, 0.04, -0.45], { tint, s: 1.05, blob: false }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', ladle: true, expr: 'sneaky', facing: -1 }, [-14.15, 0, -0.25], { tint }));
      break;

    case 's02_hook_stop_game':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'game', R: 'game', game: true, expr: 'grin', facing: 1 }, [-12.2, 0, 0.15], { tint, s: 1.04 }));
      break;

    case 's03_hook_rice_ready': {
      const pop = M.back(ramp(f, 101, 118));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'shout', R: 'up', ladle: true, expr: 'shout', facing: 1 }, [13.35, 0, 0.85], { tint, s: 1.04 }));
      out.push(CARD('rice_call_' + q(pop, 2), (p) => T.drawComicCard(p, 'riceCallBubble', q(pop, 2)), [14.65, 0.25, 0.85], { s: 0.95, blob: false, shadow: false }));
      break;
    }

    case 's04_hook_ever_or_not':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'shrug', R: 'wave', wv: q(f * 0.26, 1), expr: 'sheepish', facing: 1 }, [-2.0, 0, 0.4], { tint, s: 1.04 }));
      break;

    case 's05_psych_mastermind':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', ladle: true, expr: 'sneaky', facing: 1 }, [-0.62, 0, 0.4], { tint, s: 1.04 }));
      out.push(CARD('brain_crown', (p) => T.drawComicCard(p, 'brainCrown', 1), [0.65, 0.22, 0.4], { s: 0.92, blob: false, shadow: false }));
      break;

    case 's06_khmer_mom_pride':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'hip', ladle: true, expr: 'proud', facing: 1 }, [0.0, 0, 0.4], { tint, s: 1.06 }));
      break;

    case 's07_generations_pass':
      out.push(H(T, 'grandma', { ...id(4), seed: 4, L: 'hip', R: 'offer', ladle: f < 382, expr: 'warm', facing: 1 }, [-0.62, 0, 0.4], { tint, s: 1.02 }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: f >= 382 ? 'sampheah' : 'hold', R: f >= 382 ? 'up' : 'hold', ladle: f >= 382, expr: 'proud', facing: -1 }, [0.62, 0, 0.4], { tint, s: 1.03 }));
      break;

    case 's08_addicted_gaming':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'game', R: 'game', game: true, expr: 'laugh', facing: 1 }, [-12.2, 0, 0.15], { tint, s: 1.05 }));
      break;

    case 's09_noon_deep_nap':
      out.push(H(T, 'kid', { mode: 'sleep', wv: q(f * 0.14, 1), expr: 'sleepy' }, [-15.6, 0.04, -0.5], { tint, s: 1.06, blob: false }));
      break;

    case 's10_mom_calls_chores':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'wave', wv: q(f * 0.28, 1), expr: 'warm', facing: -1 }, [-8.8, 0, 0.3], { tint, s: 1.04 }));
      break;

    case 's11_usual_answer':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'hip', expr: 'stern', facing: 1 }, [-13.55, 0, 0.2], { tint }));
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'game', R: 'game', game: true, expr: 'grin', facing: -1 }, [-12.25, 0, 0.2], { tint }));
      break;

    case 's12_wait_five_min':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'game', R: 'five', fiveHand: true, game: true, expr: 'grin', facing: -1 }, [-12.2, 0, 0.2], { tint, s: 1.05 }));
      break;

    case 's13_five_min_badge':
      out.push(CARD('badge_5m', (p) => T.drawComicCard(p, 'fiveToHour', 0.1), [-12.85, 0.95, -2.1], { s: 0.78, blob: false, shadow: false }));
      break;

    case 's14_clock_one_hour': {
      const k = clamp(ramp(f, 815, 865));
      out.push(CARD('badge_1h_' + q(k, 1), (p) => T.drawComicCard(p, 'fiveToHour', 0.55 + q(k, 1) * 0.45), [-12.75, 0.95, -2.0], { s: 0.82, blob: false, shadow: false }));
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'game', R: 'game', game: true, expr: 'whistle', facing: 1 }, [-13.65, 0, -1.5], { tint, s: 0.92 }));
      break;
    }

    case 's15_mom_knows_heart':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', expr: 'sneaky', facing: -1 }, [13.8, 0, 0.85], { tint, s: 1.04 }));
      break;

    case 's16_secret_technique':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'up', ladle: true, expr: 'proud', facing: -1 }, [13.8, 0, 0.85], { tint, s: 1.06 }));
      break;

    case 's17_shouts_kitchen':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'shout', R: 'shout', expr: 'shout', facing: -1 }, [13.4, 0, 0.85], { tint, s: 1.05 }));
      break;

    case 's18_come_eat_fast':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'shout', R: 'wave', wv: q(f * 0.35, 1), ladle: true, expr: 'shout', facing: -1 }, [13.6, 0, 0.85], { tint, s: 1.05 }));
      break;

    case 's19_hot_delicious': {
      const k = q((f * 0.06) % 1, 2);
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'shout', R: 'offer', ladle: true, expr: 'laugh', facing: 1 }, [13.15, 0, 0.85], { tint, s: 1.04 }));
      out.push(CARD('rice_hot_' + k, (p) => T.drawComicCard(p, 'riceCallBubble', 1 + k * 0.05), [14.45, 0.25, 0.85], { s: 0.94, blob: false, shadow: false }));
      break;
    }

    case 's20_ears_perk_up':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'up', R: 'up', expr: 'shock', facing: 1 }, [-12.4, 0, 0.2], { tint, s: 1.05 }));
      break;

    case 's21_stomach_rumbles':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'belly', R: 'belly', expr: 'lick', facing: 1 }, [-12.4, 0, 0.2], { tint, s: 1.04 }));
      out.push(CARD('rumble_card', (p) => T.drawComicCard(p, 'bellyRumble', 1), [-12.4, 0.22, 0.45], { s: 1.05, blob: false, shadow: false, order: 4 }));
      break;

    case 's22_sprint_courtyard': {
      const k = ramp(f, 1344, 1433);
      const kx = lerp(-7.2, 6.8, k);
      const st = q((f * 0.13) % 1, 2);
      out.push(H(T, 'kid', { ...id(2), seed: 2, sprint: true, step: st, expr: 'laugh', facing: 1 }, [kx, 0, 0.45], { tint, s: 1.05 }));
      break;
    }

    case 's23_dream_feast_table':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'up', R: 'up', expr: 'laugh', facing: -1 }, [3.32, 0, 0.35], { tint, s: 1.0 }));
      break;

    case 's24_arrive_kitchen': {
      const k = M.easeOut(ramp(f, 1522, 1555));
      const kx = lerp(9.8, 11.8, k);
      const st = k < 0.85 ? q((f * 0.11) % 1, 2) : 0;
      out.push(H(T, 'kid', { ...id(2), seed: 2, step: st, L: 'hang', R: 'offer', expr: 'grin', facing: 1 }, [kx, 0, 0.85], { tint, s: 1.04 }));
      break;
    }

    case 's25_freeze_in_shock':
      out.push(H(T, 'kid', { bob: 0, tilt: 0, headTilt: 0, blink: 0, seed: 2, L: 'shock', R: 'shock', sweat: true, expr: 'shock', facing: 1 }, [11.8, 0, 0.85], { tint, s: 1.06 }));
      break;

    case 's26_washing_raw_rice':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'wash', R: 'wash', wv: q(f * 0.35, 1), washBowl: true, expr: 'whistle', facing: -1 }, [13.15, 0, 0.85], { tint, s: 1.02 }));
      break;

    case 's27_unscaled_fish':
      break;

    case 's28_whole_veg_basket':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'shock', R: 'shrug', sweat: true, expr: 'dazed', facing: 1 }, [14.32, 0, 0.85], { tint, s: 1.0 }));
      break;

    case 's29_mom_turns_smiles':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'hang', R: 'shrug', sweat: true, expr: 'nervous', facing: 1 }, [12.75, 0, 0.85], { tint, s: 1.02 }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', expr: 'sweet', facing: -1 }, [14.05, 0, 0.85], { tint, s: 1.03 }));
      break;

    case 's30_help_pick_trakuon': {
      const handed = f >= 1972;
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'hold', R: handed ? 'pick' : 'hold', wv: q(f * 0.25, 1), trakuon: handed, expr: 'sheepish', facing: 1 }, [12.95, 0, 0.85], { tint, s: 1.02 }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', trakuon: !handed, expr: 'sweet', facing: -1 }, [14.20, 0, 0.85], { tint, s: 1.03 }));
      break;
    }

    case 's31_twenty_min_more':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'pick', R: 'pick', wv: q(f * 0.28, 1), trakuon: true, expr: 'sheepish', facing: 1 }, [12.95, 0, 0.85], { tint, s: 1.02 }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'point', expr: 'laugh', facing: -1 }, [14.25, 0, 0.85], { tint, s: 1.02 }));
      out.push(CARD('timer_20m', (p) => T.drawComicCard(p, 'twentyMinBadge', 1), [13.60, 0.95, 0.70], { s: 0.72, blob: false, shadow: false }));
      break;

    case 's32_not_a_lie':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'sampheah', R: 'sampheah', expr: 'warm', facing: 1 }, [13.2, 0, 0.85], { tint, s: 1.05 }));
      break;

    case 's33_clever_method': {
      const k = q(f * 0.05, 1);
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'offer', expr: 'proud', facing: 1 }, [13.15, 0, 0.85], { tint, s: 1.04 }));
      out.push(CARD('smart_heart_' + k, (p) => T.drawComicCard(p, 'smartHeart', k), [14.45, 0.25, 0.85], { s: 0.88, blob: false, shadow: false }));
      break;
    }

    case 's34_get_kid_moving': {
      const st = q((f * 0.05) % 1, 2);
      out.push(H(T, 'kid', { ...id(2), seed: 2, step: st, L: 'up', R: 'wave', wv: q(f * 0.3, 1), expr: 'laugh', facing: 1 }, [4.0, 0, 0.45], { tint, s: 1.05 }));
      break;
    }

    case 's35_chat_in_kitchen':
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'pick', R: 'pick', wv: q(f * 0.3, 1), trakuon: true, expr: 'laugh', facing: 1 }, [13.15, 0, 0.85], { tint, s: 1.03 }));
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'pick', R: 'pick', wv: q(f * 0.3 + 1, 1), trakuon: true, expr: 'proud', facing: -1 }, [14.40, 0, 0.85], { tint, s: 1.03 }));
      break;

    case 's36_how_many_times':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'hip', R: 'wave', wv: q(f * 0.28, 1), ladle: true, expr: 'proud', facing: 1 }, [-0.62, 0, 0.5], { tint, s: 1.04 }));
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'hold', R: 'wave', wv: q(f * 0.28 + 1.2, 1), trakuon: true, expr: 'grin', facing: -1 }, [0.62, 0, 0.5], { tint, s: 1.04 }));
      break;

    case 's37_comment_subscribe':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'sampheah', R: 'sampheah', expr: 'warm', facing: 1 }, [-0.78, 0, 0.5], { tint, s: 1.02 }));
      out.push(CARD('sub_cta', (p) => T.drawComicCard(p, 'subscribeCta', 1), [0.0, 0.62, 0.55], { s: 0.74, blob: false, shadow: false }));
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'point', R: 'wave', wv: q(f * 0.3, 1), expr: 'laugh', facing: -1 }, [0.78, 0, 0.5], { tint, s: 1.02 }));
      break;

    case 's38_khmer_finale':
      out.push(H(T, 'mother', { ...id(1), seed: 1, L: 'wave', R: 'hip', wv: q(f * 0.26, 1), expr: 'proud', facing: 1 }, [-0.65, 0, 0.5], { tint, s: 1.05 }));
      out.push(H(T, 'kid', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'laugh', facing: -1 }, [0.65, 0, 0.5], { tint, s: 1.05 }));
      break;
  }
  return out;
};

// ---------- 2D Atmospheric & Comedic FX Cards (Zzz, Shout Arcs, Dream Steam, Sprint Dust) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  if (S.id === 's01_hook_sleep_trick' || S.id === 's09_noon_deep_nap') {
    const ph = q((f * 0.025) % 1, 2);
    out.push({
      key: 'zzz_' + ph,
      draw: (p) => T.drawZzz(p, ph),
      x: -15.9, y: 0.22, z: -0.35, s: 0.85, blob: false, shadow: false, order: 4,
    });
  }

  if (['s17_shouts_kitchen', 's18_come_eat_fast'].includes(S.id)) {
    const ph = q((f * 0.05) % 1, 2);
    out.push({
      key: 'shout_arc_' + ph,
      draw: (p) => T.drawShoutArcs(p, ph),
      x: 12.6, y: 0.42, z: 0.95, s: 0.95, blob: false, shadow: false, order: 4,
    });
  }

  if (S.id === 's22_sprint_courtyard') {
    const k = ramp(f, 1344, 1433), kx = lerp(-7.2, 6.8, k);
    for (let i = 0; i < 2; i++) {
      const ph = q(((f * 0.09) + i * 0.5) % 1, 2);
      out.push({
        key: 'dust_' + ph,
        draw: (p) => T.fxDust(p, ph),
        x: kx - 0.85 - ph * 0.9, y: 0.05, z: 0.42, s: 0.55, blob: false, shadow: false, order: 3,
      });
    }
  }

  if (S.id === 's23_dream_feast_table' || S.id === 's35_chat_in_kitchen') {
    const bx = S.id === 's23_dream_feast_table' ? 2.15 : 11.45;
    const bz = S.id === 's23_dream_feast_table' ? 0.22 : -0.42;
    for (let i = 0; i < 2; i++) {
      const ph = q(((f * 0.035) + i * 0.5) % 1, 2);
      out.push({
        key: 'steam_' + ph,
        draw: (p) => T.drawSteamPuff(p, ph),
        x: bx + Math.sin(ph * 5) * 0.25, y: 0.80 + ph * 0.85, z: bz, s: 0.55 + ph * 0.35,
        blob: false, shadow: false, order: 4,
      });
    }
  }

  return out;
};
