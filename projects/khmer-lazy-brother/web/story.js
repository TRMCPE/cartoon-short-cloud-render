// Master 26-Shot Plan for "អំណាចស្តេច «បង» — បងប្រុសកំពូលខ្ជិល និងតេឡេ ១០ សង់ទីម៉ែត្រ!"
// Synced to Khmer voice.mp3 (44.904s, 30 fps, TOTAL = 1347 frames, f0000 - f1346).
// Enforces: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion, ZERO foreground occlusion,
// verified 9:16 horizontal framing, and clear y = 76% Rollo Khmer subtitle zone.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1347;

export const SHOTS = [
  // --- Paragraph 1: Hook — Dripping-Sweat Sprint for a 10cm Object! (0.00s - 5.43s, f0000 - f0163) ---
  { id: 's01_hook_sweat_sprint',  a: 0,    b: 58,   light: 'villageDay' }, // 0.00-1.93 "តើអ្នកធ្លាប់រត់បែកញើសជោកខ្លួន គ្រាន់តែដើម្បី"
  { id: 's02_hook_hand_object',   a: 59,   b: 106,  light: 'veranda'    }, // 1.97-3.53 "ហុចរបស់មួយ ដែលនៅចម្ងាយត្រឹមដប់"
  { id: 's03_hook_ten_cm_ruler',  a: 107,  b: 163,  light: 'golden'     }, // 3.57-5.43 "សង់ទីម៉ែត្រពីដៃបងប្រុសអ្នកទេ?"

  // --- Paragraph 2: The Royal King Power of «បង»! (5.47s - 11.07s, f0164 - f0332) ---
  { id: 's04_khmer_family_bong',  a: 164,  b: 214,  light: 'villageDay' }, // 5.47-7.13 "នៅក្នុងគ្រួសារខ្មែរ ពាក្យថា «បង»"
  { id: 's05_not_ordinary_word',  a: 215,  b: 281,  light: 'veranda'    }, // 7.17-9.37 "មិនមែនគ្រាន់តែជាសព្វនាមធម្មតាទេ..."
  { id: 's06_royal_king_power',   a: 282,  b: 332,  light: 'royalGold'  }, // 9.40-11.07 "តែវាជាអំណាចស្តេច!"

  // --- Paragraph 3: Lying on the Salon & Refusing to Get Up! (11.10s - 15.57s, f0333 - f0467) ---
  { id: 's07_lying_on_salon',     a: 333,  b: 377,  light: 'veranda'    }, // 11.10-12.57 "ពេលបងប្រុសអ្នកដេកលើសាឡុង"
  { id: 's08_change_tv_channel',  a: 378,  b: 417,  light: 'veranda'    }, // 12.60-13.90 "ហើយចង់ប្តូរប៉ុស្តិ៍ទូរទស្សន៍..."
  { id: 's09_never_gets_up',      a: 418,  b: 467,  light: 'veranda'    }, // 13.93-15.57 "គាត់ដាច់ខាតមិនងើបខ្លួនឯងឡើយ!"

  // --- Paragraph 4: Village-Wide Emergency Scream & Backyard Panic Sprint! (15.60s - 24.30s, f0468 - f0729) ---
  { id: 's10_scream_launch',      a: 468,  b: 512,  light: 'veranda'    }, // 15.60-17.07 "ដំណោះស្រាយរបស់គាត់ គឺស្រែកហៅ"
  { id: 's11_echo_whole_village', a: 513,  b: 559,  light: 'villageDay' }, // 17.10-18.63 "ឈ្មោះអ្នកលាន់ឮពេញភូមិ!"
  { id: 's12_huge_emergency',     a: 560,  b: 615,  light: 'sirenAlert' }, // 18.67-20.50 "ហាក់ដូចមានអាសន្នធំណាស់អ៊ីចឹង!"
  { id: 's13_playing_backyard',   a: 616,  b: 657,  light: 'villageDay' }, // 20.53-21.90 "អ្នកដែលកំពុងលេងនៅក្រោយផ្ទះ"
  { id: 's14_panic_shock',        a: 658,  b: 686,  light: 'sirenAlert' }, // 21.93-22.87 "ភ័យស្លន់ស្លោ"
  { id: 's15_breathless_sprint',  a: 687,  b: 729,  light: 'villageDay' }, // 22.90-24.30 "រត់ត្រហេបត្រហបមកដល់ភ្លាម!"

  // --- Paragraph 5: Pointing at the TV Remote 1 Hand-Span Away! (24.33s - 32.20s, f0730 - f0966) ---
  { id: 's16_arrive_panting',     a: 730,  b: 764,  light: 'veranda'    }, // 24.33-25.47 "ប៉ុន្តែពេលអ្នកមកដល់..."
  { id: 's17_points_at_remote',   a: 765,  b: 817,  light: 'veranda'    }, // 25.50-27.23 "គាត់បែរជាចង្អុលទៅតេឡេទូរទស្សន៍"
  { id: 's18_one_handspan_elbow', a: 818,  b: 876,  light: 'golden'     }, // 27.27-29.20 "ដែលនៅក្បែរកែងដៃគាត់តែមួយចំអាមប៉ុណ្ណោះ!"
  { id: 's19_speaks_firmly',      a: 877,  b: 921,  light: 'veranda'    }, // 29.23-30.70 "ហើយនិយាយយ៉ាងមាំថា..."
  { id: 's20_hand_me_remote',     a: 922,  b: 966,  light: 'golden'     }, // 30.73-32.20 "«ហុចតេឡេឲ្យបងបន្តិចមើល៍!»"

  // --- Paragraph 6: Arguing Back -> "I Am Bong!" -> Defeated Sour-Face Handover! (32.23s - 39.67s, f0967 - f1190) ---
  { id: 's21_dare_argue_setup',   a: 967,  b: 1010, light: 'veranda'    }, // 32.23-33.67 "បើអ្នកហ៊ានប្រកែកថា «នៅជិត"
  { id: 's22_why_not_yourself',   a: 1011, b: 1056, light: 'veranda'    }, // 33.70-35.20 "បងឯងសោះ ម៉េចមិនយកខ្លួនឯង?»..."
  { id: 's23_i_am_bong_decree',   a: 1057, b: 1121, light: 'royalGold'  }, // 35.23-37.37 "ចម្លើយគឺ «អញជាបង អញប្រើហ្អែងបាន!»"
  { id: 's24_sour_face_handover', a: 1122, b: 1190, light: 'sourMood'   }, // 37.40-39.67 "ចុងក្រោយ អ្នកក៏ត្រូវហុចឲ្យគាត់ទាំងទឹកមុខជូរហួញដដែល!"

  // --- Paragraph 7: Viewer Question & Like + Comment Sunset Finale! (39.70s - 44.90s, f1191 - f1346) ---
  { id: 's25_ever_met_lazy_bro',  a: 1191, b: 1274, light: 'sunset'     }, // 39.70-42.47 "តើអ្នកធ្លាប់ជួបបងកំពូលខ្ជិលបែបនេះអត់?"
  { id: 's26_like_comment_cta',   a: 1275, b: 1346, light: 'sunset'     }, // 42.50-44.90 "បើធ្លាប់ កុំភ្លេចចុចឡៃ និងខមិនប្រាប់ផង!"
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
  royalGold: {
    az: 38, el: 32, sky: '#fff0c4', ground: '#7d6848', hemi: 1.28, sun: '#ffd67a', sunI: 2.78,
    fog: '#ffebb5', fogNear: 82, fogFar: 690, skyTop: '#3f78c7', skyHor: '#ffe099',
    sunDisc: '#fff9db', sunSize: 0.005, sat: 1.18, gain: '#fffaf0', vig: 0.14, shadowExt: 26,
  },
  sirenAlert: {
    az: 45, el: 38, sky: '#ffe0db', ground: '#6e5852', hemi: 1.22, sun: '#ffd4c2', sunI: 2.45,
    fog: '#f5cfc4', fogNear: 85, fogFar: 700, skyTop: '#335ea8', skyHor: '#ffc9b8',
    sunDisc: '#fff0d6', sunSize: 0.003, sat: 1.16, gain: '#fff7f5', vig: 0.18, shadowExt: 28,
  },
  sourMood: {
    az: 46, el: 36, sky: '#d8e4f7', ground: '#5e656e', hemi: 1.20, sun: '#e6eff7', sunI: 2.15,
    fog: '#c4d4e8', fogNear: 80, fogFar: 650, skyTop: '#355685', skyHor: '#c2d4eb',
    sunDisc: '#000000', sunSize: 0, sat: 1.08, gain: '#f5f8fc', vig: 0.20, shadowExt: 26,
  },
  sunset: {
    az: 25, el: 18, sky: '#f5c2cf', ground: '#6e504c', hemi: 1.20, sun: '#ffb36b', sunI: 2.68,
    fog: '#f4a87c', fogNear: 90, fogFar: 740, skyTop: '#5D5B8E', skyHor: '#F49D52',
    sunDisc: '#ffe6ad', sunSize: 0.0048, sat: 1.16, gain: '#fff3e6', vig: 0.17, shadowExt: 32,
  },
};

export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- Impact Camera Shakes Synced to Exact Khmer Speech Timestamps ----------
const KICKS = [
  { f: 110,  a: 0.052 }, // "ត្រឹមដប់សង់ទីម៉ែត្រ!" 10cm ruler slam
  { f: 294,  a: 0.056 }, // "តែវាជាអំណាចស្តេច!" Royal King Bong reveal
  { f: 428,  a: 0.045 }, // "គាត់ដាច់ខាតមិនងើបខ្លួនឯងឡើយ!"
  { f: 502,  a: 0.062 }, // "គឺស្រែកហៅឈ្មោះអ្នកលាន់ឮពេញភូមិ!" megaphone roar
  { f: 578,  a: 0.048 }, // "អាសន្នធំណាស់អ៊ីចឹង!" emergency siren
  { f: 660,  a: 0.058 }, // "ភ័យស្លន់ស្លោ!" backyard panic jump
  { f: 849,  a: 0.052 }, // "តែមួយចំអាមប៉ុណ្ណោះ!" 1-handspan caliper zoom
  { f: 924,  a: 0.048 }, // "«ហុចតេឡេឲ្យបងបន្តិចមើល៍!»"
  { f: 1069, a: 0.064 }, // "«អញជាបង អញប្រើហ្អែងបាន!»" royal decree slam
  { f: 1169, a: 0.046 }, // "ទឹកមុខជូរហួញដដែល!" sour-face comedic punch
  { f: 1296, a: 0.042 }, // "កុំភ្លេចចុចឡៃ និងខមិនប្រាប់ផង!"
];

// ---------- Continuous 3D Camera Choreography (26 Shots, Zero Foreground Occlusion) ----------
// Spatial anchors:
// - Khmer Stilt House Veranda Stage: Salon at x = -1.08 (Lounging Bro head/hand at x = -0.82..-0.48),
//   Low Stool + 3D TV Remote at x = +0.16, z = -0.22, Younger Bro at x = +0.86, TV Cabinet at x = +2.28.
// - Red Laterite Sprint Path: x = +2.8 .. +11.5, z = +0.35.
// - Backyard Play Stage: x = +13.5, z = +0.20 (Haystack & Banana trees behind at z = -3.4).
const CAMS = {
  // 1. Frame-0 Hook: Lateral tracking push centered directly on Younger Bro sprinting in open laterite yard (x = 11.8 -> 7.8, 100% clear of house posts!)
  s01_hook_sweat_sprint: [
    { f: 0,  pos: [11.9, 1.88, 5.8], look: [11.8, 1.05, 0.35], fov: 40 },
    { f: 58, pos: [7.9,  1.76, 5.2], look: [7.8,  1.05, 0.35], fov: 39, ease: 'easeOut' },
  ],
  // 2. Glide into Khmer veranda: Younger Bro skids in toward Lounging Older Bro & the low remote stool! (D=6.6m)
  s02_hook_hand_object: [
    { f: 59,  pos: [0.15, 1.92, 6.6], look: [-0.05, 0.98, -0.18], fov: 42 },
    { f: 106, pos: [-0.05, 1.78, 5.9], look: [-0.05, 0.96, -0.18], fov: 40 },
  ],
  // 3. Punchy close-up on Older Bro's dangling hand right beside the 3D TV Remote + popping "10 cm!" yellow ruler! (D=4.3m)
  s03_hook_ten_cm_ruler: [
    { f: 107, pos: [-0.14, 1.54, 4.4], look: [-0.14, 0.88, -0.16], fov: 39 },
    { f: 163, pos: [-0.12, 1.42, 3.6], look: [-0.14, 0.88, -0.16], fov: 36, ease: 'easeOut' },
  ],
  // 4. Sunny village two-shot: Younger Bro in polite Sampeah beside smug Older Bro in front of stilt house! (D=6.6m)
  s04_khmer_family_bong: [
    { f: 164, pos: [-0.5, 1.88, 6.6], look: [0.0, 1.08, 0.25], fov: 41 },
    { f: 214, pos: [0.5,  1.82, 6.0], look: [0.0, 1.08, 0.25], fov: 40 },
  ],
  // 5. Medium push on Older Bro wagging finger beside crossed-out "ordinary pronoun" tag! (D=6.1m)
  s05_not_ordinary_word: [
    { f: 215, pos: [0.0, 1.88, 6.3], look: [0.0, 1.12, 0.25], fov: 41 },
    { f: 281, pos: [0.1, 1.78, 5.5], look: [0.0, 1.12, 0.25], fov: 39, ease: 'easeOut' },
  ],
  // 6. Heroic low-angle crane push on "King Bong" wearing Golden Khmer Crown + scepter + Royal Medallion! (D=6.2m)
  s06_royal_king_power: [
    { f: 282, pos: [-0.2, 1.72, 6.4], look: [0.0, 1.18, 0.25], fov: 41 },
    { f: 332, pos: [0.1,  1.56, 5.3], look: [0.0, 1.22, 0.25], fov: 38, ease: 'easeOut' },
  ],
  // 7. Smooth lateral glide across the carved Khmer wooden salon as Older Bro lounges in supreme comfort! (D=5.6m)
  s07_lying_on_salon: [
    { f: 333, pos: [-1.35, 1.78, 5.4], look: [-0.92, 0.90, -0.25], fov: 40 },
    { f: 377, pos: [-0.65, 1.68, 4.9], look: [-0.88, 0.90, -0.25], fov: 39 },
  ],
  // 8. Balanced veranda angle cleanly framing BOTH Lounging Bro on salon (left) AND the entire 3D Family TV Cabinet (right)! (D=8.0m)
  s08_change_tv_channel: [
    { f: 378, pos: [0.32, 2.02, 8.1], look: [0.32, 0.98, -0.35], fov: 45 },
    { f: 417, pos: [0.48, 1.92, 7.4], look: [0.38, 0.98, -0.35], fov: 43 },
  ],
  // 9. Tight push on Older Bro refusing to lift a finger while bold red Prohibited "NO GET UP" badge slams in! (D=5.2m)
  s09_never_gets_up: [
    { f: 418, pos: [-0.82, 1.78, 5.2], look: [-0.82, 1.02, -0.22], fov: 40 },
    { f: 467, pos: [-0.82, 1.68, 4.5], look: [-0.82, 1.04, -0.22], fov: 38, ease: 'easeOut' },
  ],
  // 10. Energetic push as Older Bro cups hands on the salon and launches his megaphone scream! (D=5.0m)
  s10_scream_launch: [
    { f: 468, pos: [-0.68, 1.76, 5.1], look: [-0.68, 0.96, -0.20], fov: 40 },
    { f: 512, pos: [-0.52, 1.66, 4.4], look: [-0.60, 0.96, -0.20], fov: 38, ease: 'easeOut' },
  ],
  // 11. Epic wide crane pullback showing 3D orange-gold sonic shout rings blasting from the Khmer house across the village & sugar palms!
  s11_echo_whole_village: [
    { f: 513, pos: [0.4, 2.20, 8.8],  look: [0.6, 1.25, -0.3], fov: 45 },
    { f: 559, pos: [2.4, 2.95, 11.2], look: [2.2, 1.45, -0.6], fov: 46 },
  ],
  // 12. Flashing Red/Gold Emergency Siren spinning wildly beside screaming Older Bro! (D=5.6m)
  s12_huge_emergency: [
    { f: 560, pos: [-0.55, 1.84, 5.6], look: [-0.55, 1.06, -0.20], fov: 41 },
    { f: 615, pos: [-0.45, 1.74, 4.9], look: [-0.55, 1.06, -0.20], fov: 39, ease: 'easeOut' },
  ],
  // 13. Sunlit Khmer backyard (ក្រោយផ្ទះ) with golden straw haystack & banana palms: Younger Bro happily playing! (D=5.6m)
  s13_playing_backyard: [
    { f: 616, pos: [13.2, 1.85, 5.8], look: [13.5, 1.02, 0.2], fov: 40 },
    { f: 657, pos: [13.8, 1.76, 5.2], look: [13.5, 1.02, 0.2], fov: 39 },
  ],
  // 14. Whip-zoom onto Younger Bro jumping in wide-eyed cartoon panic as the sonic wave hits! (D=4.8m)
  s14_panic_shock: [
    { f: 658, pos: [13.5, 1.78, 5.2], look: [13.5, 1.12, 0.2], fov: 40 },
    { f: 686, pos: [13.5, 1.66, 4.4], look: [13.5, 1.14, 0.2], fov: 37, ease: 'easeOut' },
  ],
  // 15. Fast lateral tracking camera racing left alongside breathless Younger Bro in open yard (x = 12.2 -> 7.8, 100% clear of house posts!)
  s15_breathless_sprint: [
    { f: 687, pos: [12.3, 1.90, 5.9], look: [12.2, 1.05, 0.35], fov: 41 },
    { f: 729, pos: [7.9,  1.80, 5.4], look: [7.8,  1.05, 0.35], fov: 40 },
  ],
  // 16. Younger Bro skids to a stop beside the salon, hands on knees panting & dripping sweat! (D=5.1m)
  s16_arrive_panting: [
    { f: 730, pos: [1.05, 1.78, 5.1], look: [0.82, 1.00, -0.10], fov: 40 },
    { f: 764, pos: [0.85, 1.70, 4.6], look: [0.82, 1.00, -0.10], fov: 38, ease: 'easeOut' },
  ],
  // 17. Two-shot reveal: Lounging Bro lazily points straight at the TV Remote on the low stool right between them! (D=6.8m)
  s17_points_at_remote: [
    { f: 765, pos: [-0.05, 1.90, 6.8], look: [-0.08, 0.96, -0.18], fov: 43 },
    { f: 817, pos: [-0.05, 1.80, 6.1], look: [-0.08, 0.96, -0.18], fov: 41 },
  ],
  // 18. Extreme comedic zoom onto Older Bro's unobstructed pointing finger & the glowing 3D TV Remote + "10 cm" Caliper! (D=4.0m)
  s18_one_handspan_elbow: [
    { f: 818, pos: [-0.14, 1.52, 4.2], look: [-0.14, 0.88, -0.14], fov: 38 },
    { f: 876, pos: [-0.12, 1.40, 3.4], look: [-0.14, 0.88, -0.14], fov: 35, ease: 'easeOut' },
  ],
  // 19. Orbit push on Older Bro's deadpan ultra-serious face propped on the salon pillow! (D=4.8m)
  s19_speaks_firmly: [
    { f: 877, pos: [-0.82, 1.66, 4.8], look: [-0.72, 0.92, -0.20], fov: 39 },
    { f: 921, pos: [-0.55, 1.60, 4.3], look: [-0.72, 0.92, -0.20], fov: 37 },
  ],
  // 20. Older Bro holds open palm 10cm from remote with floating Remote-Demand comic bubble while Younger Bro gapes! (D=6.6m)
  s20_hand_me_remote: [
    { f: 922, pos: [-0.04, 1.90, 6.7], look: [-0.06, 1.02, -0.18], fov: 42 },
    { f: 966, pos: [-0.04, 1.80, 6.0], look: [-0.06, 1.02, -0.18], fov: 40, ease: 'easeOut' },
  ],
  // 21. Tight push on Younger Bro gesturing wildly in disbelief («នៅជិតបងឯងសោះ...»)! (D=4.9m)
  s21_dare_argue_setup: [
    { f: 967,  pos: [0.82, 1.78, 4.9], look: [0.78, 1.06, -0.10], fov: 39 },
    { f: 1010, pos: [0.72, 1.70, 4.3], look: [0.78, 1.08, -0.10], fov: 37, ease: 'easeOut' },
  ],
  // 22. Two-shot argument: Younger Bro protesting vs unbothered smug Older Bro on salon («...ម៉េចមិនយកខ្លួនឯង?»)! (D=6.8m)
  s22_why_not_yourself: [
    { f: 1011, pos: [0.12,  1.90, 6.8], look: [-0.06, 0.98, -0.18], fov: 43 },
    { f: 1056, pos: [-0.16, 1.84, 6.2], look: [-0.06, 0.98, -0.18], fov: 41 },
  ],
  // 23. Royal Decree Slam: Lounging "King Bong" in Golden Khmer Crown + Scepter + Royal Medallion («អញជាបង អញប្រើហ្អែងបាន!»)! (D=5.8m)
  s23_i_am_bong_decree: [
    { f: 1057, pos: [-0.68, 1.84, 5.8], look: [-0.68, 1.12, -0.18], fov: 42 },
    { f: 1121, pos: [-0.68, 1.70, 4.9], look: [-0.68, 1.14, -0.18], fov: 39, ease: 'easeOut' },
  ],
  // 24. Comedic Payoff: Defeated Younger Bro with sour puckered face (ទឹកមុខជូរហួញ) hands the remote 10cm to Older Bro! (D=6.4m)
  s24_sour_face_handover: [
    { f: 1122, pos: [-0.02, 1.88, 6.5], look: [-0.04, 0.98, -0.18], fov: 42 },
    { f: 1190, pos: [0.16,  1.76, 5.6], look: [0.04,  0.98, -0.18], fov: 39, ease: 'easeOut' },
  ],
  // 25. Warm Khmer Golden Sunset two-shot: King Older Bro clicking remote on salon while Younger Bro shrugs wryly at viewer! (D=6.8m)
  s25_ever_met_lazy_bro: [
    { f: 1191, pos: [-0.32, 1.90, 6.8], look: [-0.04, 1.00, -0.18], fov: 43 },
    { f: 1274, pos: [0.32,  1.84, 6.2], look: [-0.04, 1.00, -0.18], fov: 41 },
  ],
  // 26. Cheerful Like & Comment CTA + Gentle Sunset Crane Pullback framing the Khmer Stilt House & Sugar Palms!
  s26_like_comment_cta: [
    { f: 1275, pos: [0.0, 1.98, 7.8],  look: [0.0, 1.18, 0.25],  fov: 44 },
    { f: 1346, pos: [0.0, 3.15, 10.4], look: [0.0, 1.65, -1.50], fov: 45, ease: 'smooth' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS });
  c.flash = ((f >= 294 && f < 298) || (f >= 1069 && f < 1073)) ? 0.24 : 0;
  c.shadowAt = [...c.look];
  return c;
};

// ---------- STRICT RAZOR-SHARP LENS LOCK: cinf === 0 ON EVERY FRAME ----------
export const dofAt = () => ({ focus: 8, cinf: 0 });

// ---------- Per-Frame 3D World Props State ----------
export const worldAt = (f) => {
  const S = shotAt(f);
  const W = {
    hide3DRemote: false,
    highlightRemote: false,
    tvExciting: false,
    kingAura: false,
    kingAuraPos: [0, 1.15, 0],
    shoutWave: 0,
  };

  if (['s02_hook_hand_object', 's03_hook_ten_cm_ruler', 's17_points_at_remote', 's18_one_handspan_elbow', 's20_hand_me_remote'].includes(S.id)) {
    W.highlightRemote = true;
  }

  // Once Younger Bro picks up the remote in Shot 24 (f >= 1130), hide the 3D stool remote so it's held in hand!
  if ((S.id === 's24_sour_face_handover' && f >= 1130) || S.id === 's25_ever_met_lazy_bro' || S.id === 's26_like_comment_cta') {
    W.hide3DRemote = true;
  }

  // Once Older Bro receives and clicks the remote (f >= 1162), the 3D TV switches to the exciting action channel!
  if ((S.id === 's24_sour_face_handover' && f >= 1162) || S.id === 's25_ever_met_lazy_bro' || S.id === 's26_like_comment_cta') {
    W.tvExciting = true;
  }

  if (S.id === 's06_royal_king_power') {
    W.kingAura = true;
    W.kingAuraPos = [-0.56, 1.25, 0.05];
  } else if (S.id === 's23_i_am_bong_decree') {
    W.kingAura = true;
    W.kingAuraPos = [-0.62, 0.92, -0.36];
  }

  if (['s10_scream_launch', 's11_echo_whole_village', 's12_huge_emergency'].includes(S.id)) {
    W.shoutWave = 1.0;
  }

  return W;
};

// ---------- 2D Bean-Head Khmer Sibling Actors & Rollo Visual Cards ----------
const CH = (T, role, o, pos, extra = {}) => ({
  key: 'sb_' + role + JSON.stringify(o),
  draw: (p) => T.khmerSiblingChar(p, role, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

const CARD = (keyStr, drawFn, pos, extra = {}) => ({
  key: keyStr,
  draw: drawFn,
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = (S.light === 'golden' || S.light === 'royalGold') ? '#fff5e4'
    : S.light === 'sunset' ? '#ffe8d2'
    : S.light === 'sourMood' ? '#eaf2fc'
    : '#ffffff';

  const id = (seed) => {
    const v = idle(f, seed);
    return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1), blink: blinkAt(f, seed) };
  };

  // Standard lounging coordinates for Older Bro on the Khmer wooden salon (head & arm right at open salon edge -> 10cm from remote!)
  const LOUNGE_POS = [-0.78, 0.03, -0.18];

  switch (S.id) {
    case 's01_hook_sweat_sprint': {
      const k = ramp(f, 0, 58);
      const kx = lerp(11.8, 7.8, k);
      const st = q((f * 0.14) % 1, 2);
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, sprint: true, step: st, sweat: true, sweatSpray: true, expr: 'pained', facing: -1 }, [kx, 0, 0.35], { tint, s: 1.05 }));
      break;
    }

    case 's02_hook_hand_object': {
      const k = M.easeOut(ramp(f, 59, 98));
      const kx = lerp(1.48, 0.78, k);
      const st = k < 0.82 ? q((f * 0.11) % 1, 2) : 0;
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'dangle', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, step: st, L: 'offer', R: 'hang', sweat: true, expr: 'shock', facing: -1 }, [kx, 0, -0.08], { tint, s: 1.02 }));
      break;
    }

    case 's03_hook_ten_cm_ruler': {
      const pop = M.back(ramp(f, 108, 124));
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'dangle', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CARD('ruler_10cm', (p) => T.drawComicCard(p, 'tenCmRuler', 1), [-0.06, 0.44, 0.16], { s: 0.70 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's04_khmer_family_bong':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'hip', expr: 'proud', facing: 1 }, [-0.58, 0, 0.25], { tint, s: 1.06 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'smile_closed', facing: -1 }, [0.58, 0, 0.25], { tint, s: 1.02 }));
      break;

    case 's05_not_ordinary_word':
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'point', expr: 'kingSmug', facing: 1 }, [-0.58, 0, 0.25], { tint, s: 1.05 }));
      out.push(CARD('no_ordinary', (p) => T.drawComicCard(p, 'noOrdinaryBadge', 1), [0.62, 0.22, 0.25], { s: 0.88, blob: false, shadow: false }));
      break;

    case 's06_royal_king_power': {
      const k = q(f * 0.06, 2);
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'hip', R: 'up', crown: true, scepter: true, expr: 'proud', facing: 1 }, [-0.56, 0, 0.25], { tint, s: 1.08 }));
      out.push(CARD('king_med_' + k, (p) => T.drawComicCard(p, 'kingBongCrown', k), [0.66, 0.24, 0.25], { s: 0.90, blob: false, shadow: false }));
      break;
    }

    case 's07_lying_on_salon':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'dangle', expr: 'smile_closed', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.05, blob: false }));
      break;

    case 's08_change_tv_channel':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'dangle', expr: 'stern', look: 1, blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      break;

    case 's09_never_gets_up': {
      const pop = M.back(ramp(f, 424, 440));
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.10, 1), loungePose: 'dangle', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.05, blob: false }));
      out.push(CARD('no_get_up', (p) => T.drawComicCard(p, 'noGetUpCross', 1), [-0.62, 0.64, 0.12], { s: 0.72 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's10_scream_launch':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.25, 1), loungePose: 'scream', expr: 'megaShout', blink: 0 }, LOUNGE_POS, { tint, s: 1.06, blob: false }));
      break;

    case 's11_echo_whole_village':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.25, 1), loungePose: 'scream', expr: 'megaShout', blink: 0 }, LOUNGE_POS, { tint, s: 1.06, blob: false }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'play', R: 'play', wv: q(f * 0.16, 1), toyBall: true, expr: 'grin', facing: -1 }, [13.5, 0, 0.20], { tint, s: 1.02 }));
      break;

    case 's12_huge_emergency': {
      const k = q(f * 0.08, 2);
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.28, 1), loungePose: 'scream', expr: 'megaShout', blink: 0 }, LOUNGE_POS, { tint, s: 1.05, blob: false }));
      out.push(CARD('siren_' + k, (p) => T.drawComicCard(p, 'villageSiren', k), [0.22, 0.52, 0.14], { s: 0.80, blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's13_playing_backyard':
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'play', R: 'play', wv: q(f * 0.18, 1), toyBall: true, expr: 'laugh', facing: -1 }, [13.5, 0, 0.20], { tint, s: 1.05 }));
      break;

    case 's14_panic_shock': {
      const jumpY = Math.sin(clamp(ramp(f, 658, 674)) * Math.PI) * 0.34;
      out.push(CH(T, 'youngerBro', { bob: 0, tilt: -4, headTilt: 3, blink: 0, seed: 2, L: 'panic', R: 'panic', sweat: true, sweatSpray: true, expr: 'panic', facing: -1 }, [13.5, q(jumpY, 2), 0.20], { tint, s: 1.06 }));
      break;
    }

    case 's15_breathless_sprint': {
      const k = ramp(f, 687, 729);
      const kx = lerp(12.2, 7.8, k);
      const st = q((f * 0.15) % 1, 2);
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, sprint: true, step: st, sweat: true, sweatSpray: true, expr: 'panting', facing: -1 }, [kx, 0, 0.35], { tint, s: 1.05 }));
      break;
    }

    case 's16_arrive_panting':
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, pant: true, wv: q(f * 0.22, 1), sweat: true, sweatSpray: true, expr: 'panting', facing: -1 }, [0.88, 0, -0.10], { tint, s: 1.04 }));
      break;

    case 's17_points_at_remote':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.14, 1), loungePose: 'point', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'shrug', R: 'hang', sweat: true, expr: 'shock', facing: -1 }, [0.80, 0, -0.08], { tint, s: 1.03 }));
      break;

    case 's18_one_handspan_elbow': {
      const pop = M.back(ramp(f, 820, 836));
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.14, 1), loungePose: 'point', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CARD('span_caliper', (p) => T.drawComicCard(p, 'handSpanMeasure', 1), [-0.05, 0.46, 0.18], { s: 0.68 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's19_speaks_firmly':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'point', expr: 'stern', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.05, blob: false }));
      break;

    case 's20_hand_me_remote': {
      const pop = M.back(ramp(f, 923, 938));
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.16, 1), loungePose: 'demand', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CARD('remote_demand', (p) => T.drawComicCard(p, 'remoteDemandBubble', 1), [-0.08, 0.64, 0.14], { s: 0.68 * Math.max(0.2, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'panic', R: 'panic', sweat: true, expr: 'shock', facing: -1 }, [0.80, 0, -0.08], { tint, s: 1.03 }));
      break;
    }

    case 's21_dare_argue_setup':
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'argue', R: 'point', wv: q(f * 0.26, 1), sweat: true, expr: 'argue', facing: -1 }, [0.78, 0, -0.08], { tint, s: 1.05 }));
      break;

    case 's22_why_not_yourself':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.12, 1), loungePose: 'demand', expr: 'kingSmug', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'argue', R: 'argue', wv: q(f * 0.28, 1), sweat: true, expr: 'argue', facing: -1 }, [0.78, 0, -0.08], { tint, s: 1.03 }));
      break;

    case 's23_i_am_bong_decree': {
      const k = q(f * 0.06, 2);
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.18, 1), loungePose: 'king', crown: true, expr: 'proud', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.06, blob: false }));
      out.push(CARD('decree_crown_' + k, (p) => T.drawComicCard(p, 'kingBongCrown', k), [-0.58, 0.84, 0.10], { s: 0.68, blob: false, shadow: false, order: 4 }));
      break;
    }

    case 's24_sour_face_handover': {
      const picked = f >= 1130;
      const handed = f >= 1158;
      const kx = handed ? 0.64 : lerp(0.76, 0.42, M.smooth(ramp(f, 1126, 1154)));
      out.push(CH(T, 'olderBro', {
        mode: 'lounge', wv: q(f * 0.14, 1),
        loungePose: handed ? 'remote' : 'demand',
        remote: handed, clickSpark: f >= 1162 && f <= 1178,
        crown: true, expr: handed ? 'laugh' : 'kingSmug', blink: blinkAt(f, 5),
      }, LOUNGE_POS, { tint, s: 1.04, blob: false }));

      out.push(CH(T, 'youngerBro', {
        ...id(2), seed: 2,
        L: handed ? 'slump' : 'offer', R: 'slump',
        remote: picked && !handed,
        sweat: true, expr: 'sour', facing: -1,
      }, [q(kx, 2), 0, -0.08], { tint, s: 1.04 }));
      break;
    }

    case 's25_ever_met_lazy_bro':
      out.push(CH(T, 'olderBro', { mode: 'lounge', wv: q(f * 0.14, 1), loungePose: 'remote', remote: true, crown: true, expr: 'proud', blink: blinkAt(f, 5) }, LOUNGE_POS, { tint, s: 1.04, blob: false }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'point', R: 'shrug', expr: 'sheepish', facing: 1 }, [0.76, 0, -0.05], { tint, s: 1.04 }));
      break;

    case 's26_like_comment_cta': {
      const pop = M.back(ramp(f, 1280, 1298));
      out.push(CH(T, 'olderBro', { ...id(5), seed: 5, L: 'wave', R: 'hip', wv: q(f * 0.28, 1), crown: true, remote: true, expr: 'proud', facing: 1 }, [-0.96, 0, 0.25], { tint, s: 1.03 }));
      out.push(CARD('like_comment_cta', (p) => T.drawComicCard(p, 'likeCommentCta', 1), [0.0, 0.62, 0.34], { s: 0.76 * Math.max(0.25, q(pop, 2)), blob: false, shadow: false, order: 4 }));
      out.push(CH(T, 'youngerBro', { ...id(2), seed: 2, L: 'sampheah', R: 'sampheah', expr: 'laugh', facing: -1 }, [0.96, 0, 0.25], { tint, s: 1.02 }));
      break;
    }
  }
  return out;
};

// ---------- 2D Atmospheric & Comedic FX Cards (Shout Arcs, Sprint Dust, Sour Cloud) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  if (['s10_scream_launch', 's12_huge_emergency'].includes(S.id)) {
    const ph = q((f * 0.06) % 1, 2);
    out.push({
      key: 'shout_arc_' + ph,
      draw: (p) => T.drawShoutArcs(p, ph),
      x: -0.32, y: 0.16, z: -0.08, s: 0.92, blob: false, shadow: false, order: 4,
    });
  }

  if (S.id === 's01_hook_sweat_sprint' || S.id === 's15_breathless_sprint') {
    const isHook = S.id === 's01_hook_sweat_sprint';
    const kx = isHook ? lerp(11.8, 7.8, ramp(f, 0, 58)) : lerp(12.2, 7.8, ramp(f, 687, 729));
    for (let i = 0; i < 2; i++) {
      const ph = q(((f * 0.10) + i * 0.5) % 1, 2);
      out.push({
        key: 'dust_' + ph,
        draw: (p) => T.fxDust(p, ph),
        x: kx + 0.80 + ph * 0.95, y: 0.05, z: 0.32, s: 0.54, blob: false, shadow: false, order: 3,
      });
    }
  }

  if (S.id === 's24_sour_face_handover' && f >= 1152) {
    const ph = q((f * 0.04) % 1, 2);
    out.push({
      key: 'sour_cloud_' + ph,
      draw: (p) => T.drawSourCloud(p, ph),
      x: 0.68, y: 0.82, z: -0.05, s: 0.65, blob: false, shadow: false, order: 4,
    });
  }

  return out;
};
