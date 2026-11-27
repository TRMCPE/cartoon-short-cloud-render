// Master 27-Shot Plan for "ម៉ែរើសអ្នកបានពីក្រោមស្ពាន — អាវុធសម្ងាត់របស់បងធំ!"
// Synced to Khmer voice.mp3 (47.616s, 30 fps, TOTAL = 1428 frames, f0000 - f1427).
// Enforces: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion, ZERO foreground occlusion,
// verified 9:16 horizontal framing across 3 Khmer stages, and clear y = 76% Rollo Khmer subtitle zone.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1428;

export const SHOTS = [
  // --- Paragraph 1: Hook — Packing Krama Bundle & Crying Because Mom Picked You Up Under the Bridge! (0.00s - 4.87s, f0000 - f0146) ---
  { id: 's01_hook_cry_bundle',      a: 0,    b: 65,   light: 'villageDay'  }, // 0.00-2.17 "តើអ្នកធ្លាប់យំ រៀបចំបង្វេចចេញពីផ្ទះ"
  { id: 's02_hook_bro_words',       a: 66,   b: 104,  light: 'veranda'     }, // 2.20-3.47 "ព្រោះជឿសម្តីបងប្រុសដែលថា"
  { id: 's03_hook_under_bridge',    a: 105,  b: 146,  light: 'bridgeFlash' }, // 3.50-4.87 "ម៉ែរើសអ្នកបានពីក្រោមស្ពានទេ?"

  // --- Paragraph 2: Every Khmer Older Sibling Has One Secret Weapon! (4.90s - 10.90s, f0147 - f0327) ---
  { id: 's04_khmer_family_bongs',   a: 147,  b: 223,  light: 'villageDay'  }, // 4.90-7.43 "នៅក្នុងគ្រួសារខ្មែរ ស្ទើរតែគ្រប់បងធំទាំងអស់"
  { id: 's05_secret_weapon_box',    a: 224,  b: 261,  light: 'golden'      }, // 7.47-8.70 "សុទ្ធតែមានអាវុធសម្ងាត់មួយ"
  { id: 's06_tease_little_cry',     a: 262,  b: 327,  light: 'veranda'     }, // 8.73-10.90 "ដើម្បីធ្វើបាបប្អូនតូចឲ្យយំតាមចិត្ត!"

  // --- Paragraph 3: Snatching Snacks, Ultra-Serious Face & The Bridge Lie! (10.93s - 22.37s, f0328 - f0671) ---
  { id: 's07_want_steal_snack',     a: 328,  b: 402,  light: 'veranda'     }, // 10.93-13.40 "ពេលបងប្រុសអ្នកខឹង ឬចង់ដណ្តើមនំអ្នកញ៉ាំ..."
  { id: 's08_no_force_used',        a: 403,  b: 442,  light: 'veranda'     }, // 13.43-14.73 "គាត់មិនប្រើកម្លាំងទេ"
  { id: 's09_ultra_serious_face',   a: 443,  b: 493,  light: 'seriousGold' }, // 14.77-16.43 "តែគាត់ប្រើទឹកមុខម៉ឺងម៉ាត់បំផុត"
  { id: 's10_not_birth_child',      a: 494,  b: 559,  light: 'seriousGold' }, // 16.47-18.63 "ហើយនិយាយថា... «ប្អូនឯងមិនមែនកូនបង្កើតទេ"
  { id: 's11_mom_walks_bridge',     a: 560,  b: 601,  light: 'bridgeFlash' }, // 18.67-20.03 "ថ្ងៃនោះម៉ែដើរកាត់ស្ពាន"
  { id: 's12_found_adopted_baby',   a: 602,  b: 671,  light: 'bridgeFlash' }, // 20.07-22.37 "ឃើញគេបោះចោល ក៏រើសមកចិញ្ចឹម!»"

  // --- Paragraph 4: Gullible Kid Believes Everything, Ties Krama Bundle & Walks Crying to Gate! (22.40s - 29.80s, f0672 - f0894) ---
  { id: 's13_naive_believes_all',   a: 672,  b: 735,  light: 'veranda'     }, // 22.40-24.50 "អ្នកដែលនៅក្មេងខ្ចី ក៏ជឿស្លុង!"
  { id: 's14_rush_rummage_clothes', a: 736,  b: 802,  light: 'veranda'     }, // 24.53-26.73 "ភ្លាមនោះ អ្នករត់ទៅរើខោអាវ"
  { id: 's15_tie_krama_bundle',     a: 803,  b: 836,  light: 'veranda'     }, // 26.77-27.87 "ចងជាបង្វេចក្រមា"
  { id: 's16_cry_walk_to_gate',     a: 837,  b: 894,  light: 'sadBlue'     }, // 27.90-29.80 "យំសស្រាក់ដើរសំដៅទៅមាត់ទ្វាររបង ទាំងតូចចិត្ត!"

  // --- Paragraph 5: Brother Panics, Fears Mom's Cane, Hugs Leg & Buys Bribe Snacks! (29.83s - 38.40s, f0895 - f1152) ---
  { id: 's17_sees_leaving_real',    a: 895,  b: 962,  light: 'villageDay'  }, // 29.83-32.07 "ដល់ពេលឃើញប្អូនដើរចេញមែនទែន"
  { id: 's18_bro_sudden_panic',     a: 963,  b: 993,  light: 'sirenAlert'  }, // 32.10-33.10 "បងប្រុសអ្នកស្រាប់តែភ័យស្លន់ស្លោ"
  { id: 's19_fear_mom_spanking',    a: 994,  b: 1038, light: 'sirenAlert'  }, // 33.13-34.60 "ខ្លាចម៉ែដឹងវាយបែកគូទ!"
  { id: 's20_run_hug_leg_gate',     a: 1039, b: 1106, light: 'villageDay'  }, // 34.63-36.87 "ដំណោះស្រាយគឺរត់ទៅឱបជើងប្អូន"
  { id: 's21_buy_snacks_bribe',     a: 1107, b: 1152, light: 'golden'      }, // 36.90-38.40 "ហើយប្រញាប់ទិញនំមកលួងវិញភ្លាមៗ!"

  // --- Paragraph 6: Comedy Twist — Growing Up & Recycling the Same Lie on Youngest Sibling! (38.43s - 43.90s, f1153 - f1317) ---
  { id: 's22_funniest_twist_clock', a: 1153, b: 1216, light: 'golden'      }, // 38.43-40.53 "ប៉ុន្តែរឿងដែលកំប្លែងបំផុតនោះគឺ..."
  { id: 's23_when_you_grow_up',     a: 1217, b: 1244, light: 'villageDay'  }, // 40.57-41.47 "ពេលអ្នកធំឡើង"
  { id: 's24_reuse_same_lie',       a: 1245, b: 1272, light: 'seriousGold' }, // 41.50-42.40 "អ្នកក៏យកពាក្យភូតដដែលនេះ"
  { id: 's25_trick_youngest_pau',   a: 1273, b: 1317, light: 'veranda'     }, // 42.43-43.90 "ទៅបោកប្អូនពៅបន្តទៀត!"

  // --- Paragraph 7: Sunset Finale & Comment Where Mom Picked You Up! (43.93s - 47.60s, f1318 - f1427) ---
  { id: 's26_ever_believed_it',     a: 1318, b: 1359, light: 'sunset'      }, // 43.93-45.30 "តើអ្នកធ្លាប់ជឿពាក្យនេះអត់?"
  { id: 's27_comment_where_cta',    a: 1360, b: 1427, light: 'sunset'      }, // 45.33-47.60 "ខមិនប្រាប់ផង ថាម៉ែរើសអ្នកបានពីណា!"
];

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- Master Khmer Color & Lighting Presets (from khmer-visual-bible) ----------
export const LIGHTS = {
  villageDay: {
    az: 48, el: 46, sky: '#dceeff', ground: '#6b8756', hemi: 1.25, sun: '#fff6e0', sunI: 2.38,
    fog: '#cde4f7', fogNear: 105, fogFar: 800, skyTop: '#3B82D6', skyHor: '#C6E0F5',
    sunDisc: '#fffbe6', sunSize: 0.0025, sat: 1.15, gain: '#ffffff', vig: 0.15, shadowExt: 28,
  },
  veranda: {
    az: 42, el: 40, sky: '#ffeedb', ground: '#736450', hemi: 1.24, sun: '#ffe7c4', sunI: 2.42,
    fog: '#f2e0ca', fogNear: 95, fogFar: 750, skyTop: '#3277c9', skyHor: '#ffe2c2',
    sunDisc: '#fff5d4', sunSize: 0.003, sat: 1.15, gain: '#fffcf7', vig: 0.16, shadowExt: 26,
  },
  golden: {
    az: 36, el: 28, sky: '#ffdfb8', ground: '#78604a', hemi: 1.24, sun: '#ffc97d', sunI: 2.65,
    fog: '#f7cfa5', fogNear: 90, fogFar: 740, skyTop: '#3b67b0', skyHor: '#ffca88',
    sunDisc: '#fff4c7', sunSize: 0.004, sat: 1.17, gain: '#fff8ed', vig: 0.16, shadowExt: 26,
  },
  seriousGold: {
    az: 34, el: 30, sky: '#ffe6bd', ground: '#6d5843', hemi: 1.22, sun: '#ffcb78', sunI: 2.72,
    fog: '#f5d4a6', fogNear: 85, fogFar: 700, skyTop: '#2f5ca1', skyHor: '#ffd191',
    sunDisc: '#fff5cc', sunSize: 0.004, sat: 1.17, gain: '#fff7eb', vig: 0.19, shadowExt: 26,
  },
  bridgeFlash: {
    az: 52, el: 34, sky: '#fff2d6', ground: '#69805a', hemi: 1.28, sun: '#ffe4a8', sunI: 2.55,
    fog: '#f7e5c1', fogNear: 95, fogFar: 760, skyTop: '#4a88cf', skyHor: '#f7dfba',
    sunDisc: '#fff9de', sunSize: 0.0042, sat: 1.16, gain: '#fffdf5', vig: 0.15, shadowExt: 28,
  },
  sadBlue: {
    az: 48, el: 36, sky: '#d6e4f7', ground: '#5c6670', hemi: 1.20, sun: '#e3eef7', sunI: 2.15,
    fog: '#c2d3e8', fogNear: 82, fogFar: 660, skyTop: '#34588a', skyHor: '#c4d7ed',
    sunDisc: '#000000', sunSize: 0, sat: 1.08, gain: '#f4f8fc', vig: 0.20, shadowExt: 28,
  },
  sirenAlert: {
    az: 45, el: 38, sky: '#ffe0db', ground: '#6e5852', hemi: 1.22, sun: '#ffd4c2', sunI: 2.48,
    fog: '#f5cfc4', fogNear: 85, fogFar: 700, skyTop: '#335ea8', skyHor: '#ffc9b8',
    sunDisc: '#fff0d6', sunSize: 0.003, sat: 1.16, gain: '#fff7f5', vig: 0.18, shadowExt: 28,
  },
  sunset: {
    az: 25, el: 18, sky: '#f5c2cf', ground: '#6e504c', hemi: 1.20, sun: '#ffb36b', sunI: 2.68,
    fog: '#f4a87c', fogNear: 90, fogFar: 740, skyTop: '#5D5B8E', skyHor: '#F49D52',
    sunDisc: '#ffe6ad', sunSize: 0.0048, sat: 1.16, gain: '#fff3e6', vig: 0.17, shadowExt: 32,
  },
};

export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- Impact Camera Shakes Synced to Exact Khmer Speech Beats ----------
const KICKS = [
  { f: 108,  a: 0.052 }, // "ពីក្រោមស្ពានទេ?" Under-bridge baby reveal
  { f: 228,  a: 0.054 }, // "អាវុធសម្ងាត់មួយ!" Secret weapon reveal
  { f: 290,  a: 0.048 }, // "ឲ្យយំតាមចិត្ត!" Instant tears
  { f: 446,  a: 0.056 }, // "ទឹកមុខម៉ឺងម៉ាត់បំផុត!" Ultra-serious face slam
  { f: 520,  a: 0.050 }, // "មិនមែនកូនបង្កើតទេ!"
  { f: 708,  a: 0.052 }, // "ក៏ជឿស្លុង!" Gullible shock
  { f: 966,  a: 0.064 }, // "ភ័យស្លន់ស្លោ!" Brother sudden panic
  { f: 1002, a: 0.060 }, // "ខ្លាចម៉ែដឹងវាយបែកគូទ!" Mom's rattan switch danger
  { f: 1068, a: 0.055 }, // "រត់ទៅឱបជើងប្អូន!" Leg-hug impact
  { f: 1275, a: 0.052 }, // "ទៅបោកប្អូនពៅបន្តទៀត!" Generational callback punchline
  { f: 1365, a: 0.042 }, // "ខមិនប្រាប់ផង!"
];

// ---------- Continuous 3D Camera Choreography Across 3 Khmer Stages ----------
// Stage A: Khmer Stilt House Veranda & Kre Bed (x = 0.0, z = 0.0)
// Stage B: Khmer Wooden Yard Gate & Snack Stall (x = +12.5, z = 0.0; gate posts at x=11.05 & 13.95, z=-1.55)
// Stage C: Khmer Wooden Creek Bridge & Under-Bridge Alcove (x = -24.0; alcove at x = -22.15, z = -0.35; bridge deck y = 1.82)
const CAMS = {
  // 1. Frame-0 Hook: Tracking Younger Bro crying waterfall tears with Checkered Krama Bundle walking out of Khmer stilt house!
  s01_hook_cry_bundle: [
    { f: 0,  pos: [1.5, 1.86, 5.8], look: [1.5, 1.06, 0.15], fov: 40 },
    { f: 65, pos: [4.2, 1.78, 5.3], look: [4.2, 1.04, 0.15], fov: 39, ease: 'easeOut' },
  ],
  // 2. Push-in on Older Bro standing solemnly on the veranda pointing toward the creek bridge!
  s02_hook_bro_words: [
    { f: 66,  pos: [-0.2, 1.88, 6.0], look: [-0.1, 1.12, 0.15], fov: 40 },
    { f: 104, pos: [-0.1, 1.78, 5.2], look: [-0.1, 1.14, 0.15], fov: 38, ease: 'easeOut' },
  ],
  // 3. Stage C (Wooden Creek Bridge): Punchy crane-in under the rustic wooden bridge revealing the swaddled baby basket + "?" card!
  s03_hook_under_bridge: [
    { f: 105, pos: [-22.6, 1.98, 6.6], look: [-22.4, 1.06, -0.45], fov: 43 },
    { f: 146, pos: [-22.3, 1.66, 5.4], look: [-22.2, 0.92, -0.40], fov: 40, ease: 'easeOut' },
  ],
  // 4. Sunny Khmer family portrait in front of stilt house: Towering Older Bro vs polite Younger Bro in Sampeah!
  s04_khmer_family_bongs: [
    { f: 147, pos: [-0.55, 1.90, 6.6], look: [0.0, 1.08, 0.20], fov: 41 },
    { f: 223, pos: [0.55,  1.82, 6.0], look: [0.0, 1.08, 0.20], fov: 40 },
  ],
  // 5. Medium push as Older Bro unveils the glowing "Secret Weapon" prank badge!
  s05_secret_weapon_box: [
    { f: 224, pos: [0.0, 1.86, 6.1], look: [0.05, 1.14, 0.20], fov: 40 },
    { f: 261, pos: [0.1, 1.76, 5.3], look: [0.05, 1.14, 0.20], fov: 38, ease: 'easeOut' },
  ],
  // 6. Two-shot comedy beat: Smug Older Bro points & Younger Bro bursts into instant waterfall tears on cue!
  s06_tease_little_cry: [
    { f: 262, pos: [0.25, 1.88, 6.5], look: [0.0, 1.06, 0.20], fov: 41 },
    { f: 327, pos: [-0.25, 1.80, 5.8], look: [0.0, 1.06, 0.20], fov: 39 },
  ],
  // 7. Veranda snack scene: Younger Bro happily holding Khmer snack tray while Older Bro glares hungrily!
  s07_want_steal_snack: [
    { f: 328, pos: [-0.35, 1.88, 6.5], look: [0.0, 1.05, 0.05], fov: 41 },
    { f: 402, pos: [0.35,  1.80, 5.8], look: [0.0, 1.05, 0.05], fov: 39 },
  ],
  // 8. Push on Older Bro shaking finger beside crossed-out "No Force Fist" icon!
  s08_no_force_used: [
    { f: 403, pos: [-0.1, 1.86, 6.1], look: [-0.05, 1.12, 0.15], fov: 40 },
    { f: 442, pos: [0.05, 1.76, 5.4], look: [-0.05, 1.12, 0.15], fov: 38, ease: 'easeOut' },
  ],
  // 9. Dramatic tight push onto Older Bro's ULTRA-SERIOUS DEADPAN FACE (ទឹកមុខម៉ឺងម៉ាត់បំផុត)!
  s09_ultra_serious_face: [
    { f: 443, pos: [-0.58, 1.76, 4.7], look: [-0.58, 1.18, 0.15], fov: 38 },
    { f: 493, pos: [-0.58, 1.66, 3.9], look: [-0.58, 1.20, 0.15], fov: 35, ease: 'easeOut' },
  ],
  // 10. Two-shot reveal as Older Bro solemnly delivers the lie + Crossed-Out Birth-Child card!
  s10_not_birth_child: [
    { f: 494, pos: [0.0, 1.90, 6.7], look: [0.0, 1.10, 0.15], fov: 42 },
    { f: 559, pos: [0.0, 1.80, 5.9], look: [0.0, 1.10, 0.15], fov: 40 },
  ],
  // 11. Stage C Flashback: Scenic tracking shot as Khmer Mom in Sampot Samloy & Duon palm hat walks across the wooden creek bridge!
  s11_mom_walks_bridge: [
    { f: 560, pos: [-25.0, 3.25, 7.8], look: [-24.4, 2.55, -0.65], fov: 44 },
    { f: 601, pos: [-23.4, 3.05, 7.0], look: [-23.1, 2.45, -0.65], fov: 42 },
  ],
  // 12. Stage C Under-Bridge Payoff: Camera cranes down to the creek bank as Mom lovingly cradles the abandoned baby under the bridge!
  s12_found_adopted_baby: [
    { f: 602, pos: [-22.5, 2.02, 6.6], look: [-22.3, 1.16, -0.40], fov: 43 },
    { f: 671, pos: [-22.1, 1.82, 5.6], look: [-22.05, 1.18, -0.35], fov: 40, ease: 'easeOut' },
  ],
  // 13. Back on Veranda: Naive Younger Bro gasps in total gullible shock while Older Bro slyly snatches the snacks!
  s13_naive_believes_all: [
    { f: 672, pos: [0.20, 1.88, 6.4], look: [0.05, 1.06, 0.15], fov: 41 },
    { f: 735, pos: [0.45, 1.76, 5.4], look: [0.25, 1.08, 0.15], fov: 38, ease: 'easeOut' },
  ],
  // 14. Whip-pan to Khmer Kre bamboo bed under stilt house: Younger Bro frantically rummaging & tossing colorful shirts!
  s14_rush_rummage_clothes: [
    { f: 736, pos: [-1.45, 1.84, 5.4], look: [-1.55, 0.98, -0.55], fov: 40 },
    { f: 802, pos: [-1.75, 1.74, 4.8], look: [-1.65, 0.98, -0.55], fov: 38 },
  ],
  // 15. Tight punchy push as Younger Bro knots his big Checkered Krama Bundle (បង្វេចក្រមា)!
  s15_tie_krama_bundle: [
    { f: 803, pos: [-1.55, 1.72, 4.7], look: [-1.55, 0.96, -0.45], fov: 38 },
    { f: 836, pos: [-1.55, 1.62, 4.1], look: [-1.55, 0.96, -0.45], fov: 36, ease: 'easeOut' },
  ],
  // 16. Stage B (Khmer Yard Gate): Sad blue lateral tracking shot as Younger Bro sobs waterfall tears walking toward the open front gate!
  s16_cry_walk_to_gate: [
    { f: 837, pos: [9.6,  1.88, 5.9], look: [9.8,  1.06, -0.25], fov: 41 },
    { f: 894, pos: [12.1, 1.82, 5.6], look: [12.3, 1.06, -0.55], fov: 40 },
  ],
  // 17. Stage B Gate Framing: Younger Bro actually steps right up to the open wooden gate to leave home!
  s17_sees_leaving_real: [
    { f: 895, pos: [12.5, 1.95, 6.6], look: [12.5, 1.12, -0.95], fov: 42 },
    { f: 962, pos: [12.5, 1.85, 5.8], look: [12.5, 1.10, -1.05], fov: 40 },
  ],
  // 18. Whip-zoom onto Older Bro exploding in bug-eyed sweat-spraying PANIC (ភ័យស្លន់ស្លោ)!
  s18_bro_sudden_panic: [
    { f: 963, pos: [-0.55, 1.82, 5.2], look: [-0.55, 1.16, 0.15], fov: 40 },
    { f: 993, pos: [-0.55, 1.70, 4.3], look: [-0.55, 1.18, 0.15], fov: 37, ease: 'easeOut' },
  ],
  // 19. Hilarious Danger Vision: Fierce Khmer Mom brandishing her bamboo rattan cane + Spank Starburst Card!
  s19_fear_mom_spanking: [
    { f: 994,  pos: [-0.15, 1.90, 6.4], look: [0.0, 1.14, 0.15], fov: 42 },
    { f: 1038, pos: [0.15,  1.78, 5.6], look: [0.0, 1.16, 0.15], fov: 39, ease: 'easeOut' },
  ],
  // 20. Stage B Gate Payoff: Older Bro drops to his knees clinging desperately around Younger Bro's leg at the gate!
  s20_run_hug_leg_gate: [
    { f: 1039, pos: [12.2, 1.82, 6.1], look: [12.35, 0.96, -0.55], fov: 41 },
    { f: 1106, pos: [12.4, 1.66, 5.2], look: [12.40, 0.92, -0.55], fov: 38, ease: 'easeOut' },
  ],
  // 21. Stage B Snack Stall Bribe: Older Bro heaps golden Khmer snacks into Younger Bro's hands — instant joy!
  s21_buy_snacks_bribe: [
    { f: 1107, pos: [13.2, 1.90, 6.6], look: [13.4, 1.08, -0.65], fov: 42 },
    { f: 1152, pos: [13.5, 1.80, 5.8], look: [13.5, 1.08, -0.65], fov: 40, ease: 'easeOut' },
  ],
  // 22. Warm Golden Time-Skip Transition in front of Khmer Stilt House!
  s22_funniest_twist_clock: [
    { f: 1153, pos: [-0.3, 1.92, 6.6], look: [0.0, 1.14, 0.20], fov: 42 },
    { f: 1216, pos: [0.3,  1.82, 5.9], look: [0.0, 1.14, 0.20], fov: 40 },
  ],
  // 23. Heroic upward crane reveal: Kid You is now GROWN UP (`grownYou`) towering beside adorable tiny `youngestBro` (`ប្អូនពៅ`)!
  s23_when_you_grow_up: [
    { f: 1217, pos: [-0.2, 1.74, 6.2], look: [0.0, 1.08, 0.20], fov: 41 },
    { f: 1244, pos: [0.1,  1.84, 5.6], look: [0.0, 1.10, 0.20], fov: 39, ease: 'easeOut' },
  ],
  // 24. Grown-Up You puts on the EXACT SAME ultra-serious deadpan face + Recycled Bridge-Lie Bubble!
  s24_reuse_same_lie: [
    { f: 1245, pos: [-0.15, 1.88, 6.4], look: [0.0, 1.12, 0.20], fov: 41 },
    { f: 1272, pos: [0.05,  1.76, 5.5], look: [0.0, 1.14, 0.20], fov: 39, ease: 'easeOut' },
  ],
  // 25. Ultimate Generational Punchline: Tiny `ប្អូនពៅ` wails with a mini Krama bundle while Grown-Up You smirks with his snack!
  s25_trick_youngest_pau: [
    { f: 1273, pos: [0.20,  1.86, 6.4], look: [0.05, 1.02, 0.20], fov: 41 },
    { f: 1317, pos: [-0.15, 1.76, 5.6], look: [0.05, 1.02, 0.20], fov: 39, ease: 'easeOut' },
  ],
  // 26. Warm Khmer Golden Sunset Sibling Lineup smiling & shrugging at the viewer!
  s26_ever_believed_it: [
    { f: 1318, pos: [-0.35, 1.92, 6.9], look: [0.0, 1.06, 0.25], fov: 43 },
    { f: 1359, pos: [0.35,  1.86, 6.3], look: [0.0, 1.06, 0.25], fov: 41 },
  ],
  // 27. Sunset Crane Pullback + Comment Question CTA ("Where did Mom pick YOU up from?")!
  s27_comment_where_cta: [
    { f: 1360, pos: [0.0, 1.98, 7.6],  look: [0.0, 1.18, 0.25],  fov: 44 },
    { f: 1427, pos: [0.0, 3.10, 10.2], look: [0.0, 1.62, -1.40], fov: 45, ease: 'smooth' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  c.flash = ((f >= 560 && f < 564) || (f >= 672 && f < 676) || (f >= 1217 && f < 1221)) ? 0.24 : 0;
  c.shadowAt = [...c.look];
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS LOCK: cinf === 0 ON EVERY FRAME ----------
export const dofAt = () => ({ focus: 8, cinf: 0 });

// ---------- Per-Frame 3D World Props State ----------
export const worldAt = (f) => {
  const S = shotAt(f);
  const W = {
    hideClothesStack: false,
    hideTableSnacks: true,
    aura: false,
    auraPos: [0, 1.15, 0],
  };

  // Show 3D snacks on veranda table right before/around the snack-stealing setup
  if (['s04_khmer_family_bongs', 's05_secret_weapon_box', 's06_tease_little_cry', 's08_no_force_used', 's09_ultra_serious_face', 's10_not_birth_child'].includes(S.id)) {
    W.hideTableSnacks = false;
  }

  // Once Younger Bro packs his clothes into the Krama bundle (f >= 803), hide the 3D folded stack on the Kre bed!
  if (f >= 803 && f <= 1152) {
    W.hideClothesStack = true;
  }

  if (S.id === 's09_ultra_serious_face') {
    W.aura = true;
    W.auraPos = [-0.58, 1.18, 0.02];
  } else if (S.id === 's24_reuse_same_lie') {
    W.aura = true;
    W.auraPos = [-0.56, 1.18, 0.05];
  }

  return W;
};

// ---------- 2D Bean-Head Khmer Family Actors & Rollo Visual Cards ----------
const CH = (T, role, o, pos, extra = {}) => ({
  key: 'kb_' + role + JSON.stringify(o),
  draw: (p) => T.khmerBridgeChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

const CARD = (keyStr, drawFn, pos, extra = {}) => ({
  key: keyStr,
  draw: drawFn,
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = (S.light === 'golden' || S.light === 'seriousGold' || S.light === 'bridgeFlash') ? '#fff6e6'
    : S.light === 'sunset' ? '#ffe8d2'
    : S.light === 'sadBlue' ? '#eaf2fc'
    : '#ffffff';

  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  switch (S.id) {
    case 's01_hook_cry_bundle': {
      const k = ramp(f, 0, 65);
      const kx = lerp(1.5, 4.2, k);
      const st = q((f * 0.08) % 1, 2);
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, step: st, wv: q(f * 0.22, 1),
        L: 'wipeTear', R: 'stickHold', bundleStick: true, crying: true, expr: 'wailCry', facing: 1,
      }, [kx, 0, 0.15], { tint, s: 1.05 }));
      break;
    }

    case 's02_hook_bro_words':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'point', R: 'hip', expr: 'ultraSerious', facing: -1 }, [-0.52, 0, 0.15], { tint, s: 1.06 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'hang', R: 'hang', crying: true, wv: q(f * 0.20, 1), expr: 'gullible', facing: -1 }, [0.54, 0, 0.15], { tint, s: 1.02 }));
      break;

    case 's03_hook_under_bridge': {
      const pop = M.back(ramp(f, 107, 124));
      const wv = q(f * 0.16, 1);
      out.push(CARD('basket_' + wv, (p) => T.drawBabyBasketCard(p, wv, true), [-22.15, 0.02, -0.35], { tint, s: 1.02 }));
      out.push(CARD('bridge_q', (p) => T.drawBridgeCard(p, 'underBridgeQuestion', 1), [-22.15, 0.42, -0.20], { s: 0.72 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's04_khmer_family_bongs':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'hip', expr: 'proud', facing: 1 }, [-0.58, 0, 0.20], { tint, s: 1.06 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'smile_closed', facing: -1 }, [0.58, 0, 0.20], { tint, s: 1.02 }));
      break;

    case 's05_secret_weapon_box': {
      const k = q(f * 0.06, 2);
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'point', expr: 'scheming', facing: 1 }, [-0.58, 0, 0.20], { tint, s: 1.06 }));
      out.push(CARD('sec_weap_' + k, (p) => T.drawBridgeCard(p, 'secretWeaponBox', k), [0.62, 0.24, 0.22], { s: 0.86, blob: false, shadow: false }));
      break;
    }

    case 's06_tease_little_cry':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'point', expr: 'laugh', facing: 1 }, [-0.58, 0, 0.20], { tint, s: 1.05 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'wipeTear', R: 'wipeTear', crying: true, wv: q(f * 0.24, 1), expr: 'wailCry', facing: -1 }, [0.58, 0, 0.20], { tint, s: 1.02 }));
      break;

    case 's07_want_steal_snack':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'snatch', wv: q(f * 0.18, 1), expr: 'angryHungry', facing: 1 }, [-0.62, 0, 0.15], { tint, s: 1.05 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'cradle', R: 'cradle', snackPlate: true, expr: 'happySnack', facing: -1 }, [0.58, 0, 0.15], { tint, s: 1.02 }));
      break;

    case 's08_no_force_used': {
      const pop = M.back(ramp(f, 405, 420));
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'point', expr: 'scheming', facing: 1 }, [-0.60, 0, 0.15], { tint, s: 1.05 }));
      out.push(CARD('no_force', (p) => T.drawBridgeCard(p, 'noForceFist', 1), [0.58, 0.24, 0.20], { s: 0.84 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false }));
      break;
    }

    case 's09_ultra_serious_face':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'chest', R: 'hip', expr: 'ultraSerious', blink: 0, facing: 1 }, [-0.58, 0, 0.15], { tint, s: 1.08 }));
      break;

    case 's10_not_birth_child': {
      const pop = M.back(ramp(f, 515, 532));
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'chest', R: 'point', expr: 'ultraSerious', facing: 1 }, [-0.66, 0, 0.15], { tint, s: 1.05 }));
      out.push(CARD('not_birth', (p) => T.drawBridgeCard(p, 'notBirthChild', 1), [0.0, 0.56, 0.24], { s: 0.72 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'hang', R: 'hang', expr: 'gullible', facing: -1 }, [0.68, 0, 0.15], { tint, s: 1.02 }));
      break;
    }

    case 's11_mom_walks_bridge': {
      const k = ramp(f, 560, 601);
      const mx = lerp(-25.2, -22.9, k);
      const st = q((f * 0.08) % 1, 2);
      out.push(CH(T, 'mom', {
        ...id(9), seed: 9, step: st, L: 'hang', R: 'shrug', duonHat: true,
        expr: k > 0.65 ? 'shock' : 'smile_closed', facing: 1,
      }, [mx, 2.32, -0.62], { tint, s: 1.02, ground: 2.32 }));
      out.push(CARD('basket_b11', (p) => T.drawBabyBasketCard(p, q(f * 0.16, 1), true), [-22.15, 0.04, -0.35], { tint, s: 0.96 }));
      break;
    }

    case 's12_found_adopted_baby': {
      const picked = f >= 626;
      const k = q(f * 0.06, 2);
      if (!picked) {
        out.push(CH(T, 'mom', { ...id(9), seed: 9, L: 'offer', R: 'offer', duonHat: true, expr: 'shock', facing: 1 }, [-22.75, 0.02, -0.35], { tint, s: 1.03 }));
        out.push(CARD('basket_b12_' + k, (p) => T.drawBabyBasketCard(p, q(f * 0.18, 1), true), [-21.80, 0.02, -0.35], { tint, s: 0.98 }));
      } else {
        out.push(CH(T, 'mom', { ...id(9), seed: 9, L: 'cradle', R: 'cradle', babyBundle: true, duonHat: true, expr: 'lovingMom', facing: 1 }, [-22.15, 0.02, -0.35], { tint, s: 1.05 }));
        out.push(CARD('love_heart_' + k, (p) => T.drawBridgeCard(p, 'lovingHeart', k), [-21.35, 0.52, -0.25], { s: 0.72, blob: false, shadow: false, order: 4 }));
      }
      break;
    }

    case 's13_naive_believes_all': {
      const snatched = f >= 700;
      out.push(CH(T, 'olderBro', {
        ...id(5), seed: 5, L: 'hip', R: snatched ? 'cradle' : 'snatch',
        snackPlate: snatched, expr: snatched ? 'scheming' : 'ultraSerious', facing: 1,
      }, [-0.58, 0, 0.15], { tint, s: 1.05 }));
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, L: 'panic', R: 'panic', sweat: true,
        crying: f >= 706, wv: q(f * 0.22, 1), expr: 'gullible', facing: -1,
      }, [0.56, 0, 0.15], { tint, s: 1.04 }));
      break;
    }

    case 's14_rush_rummage_clothes':
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, L: 'rummage', R: 'rummage', rummageClothes: true,
        crying: true, wv: q(f * 0.26, 1), expr: 'wailCry', facing: -1,
      }, [-1.42, 0, -0.32], { tint, s: 1.05 }));
      break;

    case 's15_tie_krama_bundle':
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, L: 'cradle', R: 'cradle', tyingBundle: true,
        crying: true, wv: q(f * 0.24, 1), expr: 'wailCry', facing: 1,
      }, [-1.52, 0, -0.30], { tint, s: 1.06 }));
      break;

    case 's16_cry_walk_to_gate': {
      const k = ramp(f, 837, 894);
      const kx = lerp(9.6, 12.1, k);
      const st = q((f * 0.08) % 1, 2);
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, step: st, wv: q(f * 0.22, 1),
        L: 'wipeTear', R: 'stickHold', bundleStick: true, crying: true, expr: 'wailCry', facing: 1,
      }, [kx, 0, -0.35], { tint, s: 1.05 }));
      break;
    }

    case 's17_sees_leaving_real': {
      const k = ramp(f, 895, 962);
      const kz = lerp(-0.45, -1.25, k);
      const st = q((f * 0.07) % 1, 2);
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, step: st, wv: q(f * 0.20, 1),
        L: 'wipeTear', R: 'stickHold', bundleStick: true, crying: true, expr: 'wailCry', facing: 1,
      }, [12.5, 0, kz], { tint, s: 1.04 }));
      break;
    }

    case 's18_bro_sudden_panic': {
      const jumpY = Math.sin(clamp(ramp(f, 964, 980)) * Math.PI) * 0.30;
      out.push(CH(T, 'olderBro', {
        bob: 0, tilt: -3, headTilt: 2, blink: 0, seed: 5,
        L: 'panic', R: 'panic', sweat: true, sweatSpray: true, expr: 'panic', facing: 1,
      }, [-0.55, q(jumpY, 2), 0.15], { tint, s: 1.07 }));
      break;
    }

    case 's19_fear_mom_spanking': {
      const wv = q(f * 0.25, 1);
      out.push(CH(T, 'olderBro', {
        ...id(5), seed: 5, L: 'panic', R: 'panic', sweat: true, sweatSpray: true, expr: 'panic', facing: -1,
      }, [-0.62, 0, 0.15], { tint, s: 1.04 }));
      out.push(CH(T, 'mom', {
        ...id(9), seed: 9, L: 'hip', R: 'caneUp', rattanCane: true, wv, expr: 'fierceMom', facing: -1,
      }, [0.64, 0, 0.15], { tint, s: 1.05 }));
      out.push(CARD('spank_warn', (p) => T.drawBridgeCard(p, 'spankDangerVision', 1), [0.0, 0.68, 0.24], { s: 0.64, blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's20_run_hug_leg_gate': {
      const arrived = f >= 1062;
      if (!arrived) {
        const kx = lerp(10.6, 11.95, ramp(f, 1039, 1061));
        const st = q((f * 0.16) % 1, 2);
        out.push(CH(T, 'olderBro', {
          ...id(5), seed: 5, sprint: true, step: st, sweat: true, sweatSpray: true, expr: 'panic', facing: 1,
        }, [kx, 0, -0.55], { tint, s: 1.04 }));
        out.push(CH(T, 'youngerBro', {
          ...id(2), seed: 2, L: 'wipeTear', R: 'stickHold', bundleStick: true, crying: true, wv: q(f * 0.20, 1), expr: 'wailCry', facing: 1,
        }, [12.75, 0, -0.55], { tint, s: 1.03 }));
      } else {
        // Older Bro drops to his knees clinging tightly around Younger Bro's leg!
        out.push(CH(T, 'olderBro', {
          mode: 'hugLeg', wv: q(f * 0.24, 1), expr: 'panic', blink: 0, facing: 1,
        }, [12.30, 0, -0.48], { tint, s: 1.05, order: 3 }));
        out.push(CH(T, 'youngerBro', {
          ...id(2), seed: 2, L: 'shrug', R: 'stickHold', bundleStick: true, sweat: true, expr: 'shock', facing: -1,
        }, [12.66, 0, -0.55], { tint, s: 1.03 }));
      }
      break;
    }

    case 's21_buy_snacks_bribe': {
      const pop = M.back(ramp(f, 1110, 1126));
      out.push(CH(T, 'olderBro', {
        ...id(5), seed: 5, L: 'hip', R: 'offer', bigSnackBribe: true, sweat: true, expr: 'relief_open', facing: 1,
      }, [12.85, 0, -0.60], { tint, s: 1.05 }));
      out.push(CARD('bribe_burst', (p) => T.drawBridgeCard(p, 'snackBribeBurst', 1), [13.45, 0.58, -0.45], { s: 0.68 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2, L: 'cradle', R: 'cradle', snackPlate: true, expr: 'happySnack', facing: -1,
      }, [14.05, 0, -0.60], { tint, s: 1.03 }));
      break;
    }

    case 's22_funniest_twist_clock': {
      const k = q((f - 1153) * 0.05, 2);
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'cradle', R: 'wave', wv: q(f * 0.20, 1), snackPlate: true, expr: 'grin', facing: 1 }, [-0.58, 0, 0.20], { tint, s: 1.03 }));
      out.push(CARD('clock_' + k, (p) => T.drawBridgeCard(p, 'timeSkipClock', k), [0.58, 0.26, 0.22], { s: 0.84, blob: false, shadow: false }));
      break;
    }

    case 's23_when_you_grow_up':
      out.push(CH(T, 'grownYou', { ...id(3), seed: 3, L: 'hip', R: 'hip', expr: 'proud', facing: 1 }, [-0.56, 0, 0.20], { tint, s: 1.06 }));
      out.push(CH(T, 'youngestBro', { ...id(7), seed: 7, L: 'cradle', R: 'cradle', snackPlate: true, expr: 'happySnack', facing: -1 }, [0.56, 0, 0.20], { tint, s: 0.96 }));
      break;

    case 's24_reuse_same_lie': {
      const pop = M.back(ramp(f, 1247, 1262));
      out.push(CH(T, 'grownYou', { ...id(3), seed: 3, L: 'chest', R: 'point', expr: 'ultraSerious', blink: 0, facing: 1 }, [-0.62, 0, 0.20], { tint, s: 1.06 }));
      out.push(CARD('lie_bub', (p) => T.drawBridgeCard(p, 'bridgeLieBubble', 1), [0.02, 0.58, 0.26], { s: 0.72 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'youngestBro', { ...id(7), seed: 7, L: 'hang', R: 'hang', expr: 'gullible', facing: -1 }, [0.64, 0, 0.20], { tint, s: 0.96 }));
      break;
    }

    case 's25_trick_youngest_pau':
      out.push(CH(T, 'grownYou', { ...id(3), seed: 3, L: 'cradle', R: 'hip', snackPlate: true, expr: 'scheming', facing: 1 }, [-0.58, 0, 0.20], { tint, s: 1.05 }));
      out.push(CH(T, 'youngestBro', {
        ...id(7), seed: 7, step: q((f * 0.09) % 1, 2), wv: q(f * 0.25, 1),
        L: 'wipeTear', R: 'stickHold', bundleStick: true, crying: true, expr: 'wailCry', facing: 1,
      }, [0.58, 0, 0.20], { tint, s: 0.98 }));
      break;

    case 's26_ever_believed_it':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'shrug', expr: 'proud', facing: 1 }, [-0.88, 0, 0.25], { tint, s: 1.03 }));
      out.push(CH(T, 'grownYou', { ...id(3), seed: 3, L: 'point', R: 'shrug', expr: 'sheepish', facing: 1 }, [0.02, 0, 0.25], { tint, s: 1.03 }));
      out.push(CH(T, 'youngestBro', { ...id(7), seed: 7, L: 'cradle', R: 'cradle', snackPlate: true, expr: 'grin', facing: -1 }, [0.88, 0, 0.25], { tint, s: 0.95 }));
      break;

    case 's27_comment_where_cta': {
      const pop = M.back(ramp(f, 1364, 1384));
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'wave', R: 'hip', wv: q(f * 0.26, 1), expr: 'proud', facing: 1 }, [-1.02, 0, 0.25], { tint, s: 1.02 }));
      out.push(CARD('comment_cta', (p) => T.drawBridgeCard(p, 'commentWhereFound', 1), [0.0, 0.62, 0.34], { s: 0.78 * Math.max(0.25, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'grownYou', { ...id(3), seed: 3, L: 'sampheah', R: 'sampheah', expr: 'laugh', facing: -1 }, [1.02, 0, 0.25], { tint, s: 1.02 }));
      break;
    }
  }
  return out;
};

// ---------- 2D Atmospheric & Comedic FX Cards ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  if (S.id === 's18_bro_sudden_panic') {
    const ph = q((f * 0.08) % 1, 2);
    out.push({
      key: 'shock_rays_' + ph,
      draw: (p) => T.drawShockRays(p, ph),
      x: 0.0, y: 0.32, z: 0.24, s: 0.92, blob: false, shadow: false, order: 4,
    });
  }

  if (S.id === 's01_hook_cry_bundle' || S.id === 's16_cry_walk_to_gate') {
    const isHook = S.id === 's01_hook_cry_bundle';
    const kx = isHook ? lerp(1.5, 4.2, ramp(f, 0, 65)) : lerp(9.6, 12.1, ramp(f, 837, 894));
    const kz = isHook ? 0.12 : -0.38;
    const ph = q((f * 0.08) % 1, 2);
    out.push({
      key: 'walk_dust_' + ph,
      draw: (p) => T.fxDust(p, ph),
      x: kx - 0.65 - ph * 0.55, y: 0.04, z: kz, s: 0.44, blob: false, shadow: false, order: 3,
    });
  }

  if (S.id === 's20_run_hug_leg_gate' && f < 1062) {
    const kx = lerp(10.6, 11.95, ramp(f, 1039, 1061));
    const ph = q((f * 0.12) % 1, 2);
    out.push({
      key: 'sprint_dust_' + ph,
      draw: (p) => T.fxDust(p, ph),
      x: kx - 0.72 - ph * 0.65, y: 0.04, z: -0.58, s: 0.52, blob: false, shadow: false, order: 3,
    });
  }

  return out;
};
