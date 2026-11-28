// Master 26-Shot Plan for "បងធំខុសគ្រប់ករណី — ច្បាប់អមតៈក្នុងផ្ទះខ្មែរ!"
// Synced to Khmer voice.mp3 (45.384s, 30 fps, TOTAL = 1362 frames, f0000 - f1361).
// Enforces: 100% razor-sharp (dofAt cinf === 0), continuous 3D camera motion across 3 Khmer stages,
// ZERO foreground occlusion, verified 9:16 framing, and clear y = 76% Rollo Khmer subtitle safe zone.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1362;

export const SHOTS = [
  // --- Paragraph 1: Hook — Scolded by Mom Despite Doing Nothing Wrong, Just For Being Born First! (0.00s - 4.93s, f0000 - f0148) ---
  { id: 's01_hook_scolded_innocent',  a: 0,    b: 46,   light: 'veranda'     }, // 0.00-1.53 "តើអ្នកធ្លាប់ត្រូវម៉ែស្តីឲ្យ"
  { id: 's02_hook_did_nothing_wrong', a: 47,   b: 94,   light: 'villageDay'  }, // 1.57-3.13 "ទាំងដែលអ្នកមិនបានធ្វើអ្វីខុសសោះ"
  { id: 's03_hook_born_first',        a: 95,   b: 148,  light: 'villageDay'  }, // 3.17-4.93 "គ្រាន់តែព្រោះអ្នកកើតមុនប្អូនទេ?"

  // --- Paragraph 2: The Immortal Unwritten Khmer House Law: "Big Sibling Is Always Guilty!" (4.97s - 10.57s, f0149 - f0317) ---
  { id: 's04_khmer_house_establish',  a: 149,  b: 194,  light: 'villageDay'  }, // 4.97-6.47 "នៅក្នុងផ្ទះខ្មែរ"
  { id: 's05_unwritten_immortal_law', a: 195,  b: 261,  light: 'goldenLaw'   }, // 6.50-8.70 "មានច្បាប់អមតៈមួយដែលមិនបាច់សរសេរលើក្រដាស..."
  { id: 's06_big_sib_always_guilty',  a: 262,  b: 317,  light: 'goldenLaw'   }, // 8.73-10.57 "នោះគឺ «បងធំខុសគ្រប់ករណី»!"

  // --- Paragraph 3: Bored Little Sibling Turns Into a Khmer Krama Ninja (3 Prank Combo)! (10.60s - 18.30s, f0318 - f0549) ---
  { id: 's07_little_bro_bored',       a: 318,  b: 343,  light: 'veranda'     }, // 10.60-11.43 "ពេលប្អូនអ្នកអផ្សុក"
  { id: 's08_ninja_krama_creep',      a: 344,  b: 395,  light: 'ninjaShade'  }, // 11.47-13.17 "វាដើរមកញ៉ោះអ្នកដូចនីនចា!"
  { id: 's09_prank1_steal_snack',     a: 396,  b: 432,  light: 'veranda'     }, // 13.20-14.40 "ម្តងលួចញ៉ាំនំ"
  { id: 's10_prank2_pull_hair',       a: 433,  b: 461,  light: 'veranda'     }, // 14.43-15.37 "ម្តងទាញសក់"
  { id: 's11_prank3_slap_back',       a: 462,  b: 519,  light: 'veranda'     }, // 15.40-17.30 "ហើយម្តងទៀតលួចវាយខ្នងអ្នកមួយដៃ"
  { id: 's12_run_away_innocent',      a: 520,  b: 549,  light: 'villageDay'  }, // 17.33-18.30 "រួចរត់គេចធ្វើព្រងើយ!"

  // --- Paragraph 4: Boiling Ear-Steam -> Gentle 1-Finger Push -> Melodramatic Floor Flop & Wail! (18.33s - 26.53s, f0550 - f0796) ---
  { id: 's13_angry_ear_steam',        a: 550,  b: 604,  light: 'steamRage'   }, // 18.33-20.13 "អ្នកខឹងឡើងហុយផ្សែងតាមត្រចៀក"
  { id: 's14_gentle_tiny_push',       a: 605,  b: 686,  light: 'veranda'     }, // 20.17-22.87 "ហើយគ្រាន់តែលើកដៃរុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ..."
  { id: 's15_dramatic_tile_flop',     a: 687,  b: 735,  light: 'sirenAlert'  }, // 22.90-24.50 "ស្រាប់តែវាដួលតូងទៅលើឥដ្ឋ"
  { id: 's16_scream_cry_oscar',       a: 736,  b: 796,  light: 'sirenAlert'  }, // 24.53-26.53 "ហើយស្រែកយំដូចគេចាក់កអ៊ីចឹង!"

  // --- Paragraph 5: Under 3 Seconds -> Superhero Mom Arrives & Drops the Verdict! (26.57s - 35.50s, f0797 - f1065) ---
  { id: 's17_under_three_seconds',    a: 797,  b: 839,  light: 'villageDay'  }, // 26.57-27.97 "មិនដល់បីវិនាទីផង"
  { id: 's18_superhero_mom_arrives',  a: 840,  b: 905,  light: 'heroGold'    }, // 28.00-30.17 "ម៉ែអ្នកក៏បង្ហាញខ្លួនដូចកំពូលវីរបុរស!"
  { id: 's19_explain_useless',        a: 906,  b: 972,  light: 'veranda'     }, // 30.20-32.40 "ទោះអ្នកខំពន្យល់យ៉ាងណាក៏គ្មានប្រយោជន៍ដែរ"
  { id: 's20_mom_answer_setup',       a: 973,  b: 1005, light: 'heroGold'    }, // 32.43-33.50 "ចម្លើយរបស់ម៉ែគឺ..."
  { id: 's21_mom_verdict_yield',      a: 1006, b: 1065, light: 'sirenAlert'  }, // 33.53-35.50 "«ឯងជាបង ម៉េចមិនចេះយោគយល់ប្អូន?»"

  // --- Paragraph 6: Oscar-Actor Little Bro Fake-Cries Behind Mom Then Wiggles Eyebrows Smug! (35.53s - 40.57s, f1066 - f1217) ---
  { id: 's22_oscar_actor_bro',        a: 1066, b: 1124, light: 'goldenLaw'   }, // 35.53-37.47 "ឯប្អូនកំពូលសម្តែងវិញ"
  { id: 's23_fake_cry_behind_mom',    a: 1125, b: 1154, light: 'veranda'     }, // 37.50-38.47 "ឈរយំនៅពីក្រោយខ្នងម៉ែ"
  { id: 's24_evil_eyebrow_smirk',     a: 1155, b: 1217, light: 'goldenLaw'   }, // 38.50-40.57 "តែលួចញាក់ចិញ្ចើមឌឺដាក់អ្នកយ៉ាងសប្បាយចិត្ត!"

  // --- Paragraph 7: Khmer Golden Sunset Viewer Question & Like/Comment CTA! (40.60s - 45.40s, f1218 - f1361) ---
  { id: 's25_are_you_victim_bong',    a: 1218, b: 1292, light: 'sunset'      }, // 40.60-43.07 "តើអ្នកជាបងធំដែលធ្លាប់រងគ្រោះបែបនេះអត់?"
  { id: 's26_like_and_comment_cta',   a: 1293, b: 1361, light: 'sunset'      }, // 43.10-45.40 "បើធ្លាប់ កុំភ្លេចចុចឡៃ និងខមិនប្រាប់ផង!"
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
  goldenLaw: {
    az: 35, el: 30, sky: '#ffe4bd', ground: '#755f48', hemi: 1.24, sun: '#ffcb7d', sunI: 2.66,
    fog: '#f7d2a6', fogNear: 90, fogFar: 740, skyTop: '#3868b2', skyHor: '#ffce8c',
    sunDisc: '#fff4c7', sunSize: 0.004, sat: 1.17, gain: '#fff8ed', vig: 0.16, shadowExt: 26,
  },
  ninjaShade: {
    az: 54, el: 36, sky: '#d9ecff', ground: '#596e5c', hemi: 1.22, sun: '#e8f4ff', sunI: 2.24,
    fog: '#c9dff2', fogNear: 92, fogFar: 720, skyTop: '#2b63a8', skyHor: '#bdd8f0',
    sunDisc: '#000000', sunSize: 0, sat: 1.14, gain: '#f7fbff', vig: 0.18, shadowExt: 26,
  },
  steamRage: {
    az: 40, el: 36, sky: '#ffded8', ground: '#70544e', hemi: 1.22, sun: '#ffc9bd', sunI: 2.55,
    fog: '#f5c8be', fogNear: 85, fogFar: 700, skyTop: '#365da6', skyHor: '#ffc4b5',
    sunDisc: '#ffeed6', sunSize: 0.003, sat: 1.18, gain: '#fff6f4', vig: 0.19, shadowExt: 26,
  },
  sirenAlert: {
    az: 45, el: 38, sky: '#ffe0db', ground: '#6e5852', hemi: 1.22, sun: '#ffd4c2', sunI: 2.48,
    fog: '#f5cfc4', fogNear: 85, fogFar: 700, skyTop: '#335ea8', skyHor: '#ffc9b8',
    sunDisc: '#fff0d6', sunSize: 0.003, sat: 1.16, gain: '#fff7f5', vig: 0.18, shadowExt: 28,
  },
  heroGold: {
    az: 32, el: 28, sky: '#ffeab8', ground: '#786248', hemi: 1.28, sun: '#ffd178', sunI: 2.75,
    fog: '#f7d8a6', fogNear: 95, fogFar: 760, skyTop: '#356ec4', skyHor: '#ffd691',
    sunDisc: '#fff7d4', sunSize: 0.0045, sat: 1.18, gain: '#fffaf0', vig: 0.15, shadowExt: 28,
  },
  sunset: {
    az: 25, el: 18, sky: '#f5c2cf', ground: '#6e504c', hemi: 1.20, sun: '#ffb36b', sunI: 2.68,
    fog: '#f4a87c', fogNear: 90, fogFar: 740, skyTop: '#5D5B8E', skyHor: '#F49D52',
    sunDisc: '#ffe6ad', sunSize: 0.0048, sat: 1.16, gain: '#fff3e6', vig: 0.17, shadowExt: 32,
  },
};

export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- Impact Camera Shakes Synced to Exact Khmer Speech & Gag Beats ----------
const KICKS = [
  { f: 22,   a: 0.046 }, // "ត្រូវម៉ែស្តីឲ្យ!" Hook scold point
  { f: 273,  a: 0.062 }, // "បងធំខុសគ្រប់ករណី!" Immortal Law gavel slam!
  { f: 373,  a: 0.044 }, // "ដូចនីនចា!" Ninja headband reveal
  { f: 436,  a: 0.056 }, // "ម្តងទាញសក់!" Hair pull yank!
  { f: 482,  a: 0.060 }, // "លួចវាយខ្នងអ្នកមួយដៃ!" Back slap POW!
  { f: 572,  a: 0.058 }, // "ហុយផ្សែងតាមត្រចៀក!" Ear steam blast!
  { f: 692,  a: 0.072 }, // "ដួលតូងទៅលើឥដ្ឋ!" Melodramatic tile floor BOOM!
  { f: 856,  a: 0.064 }, // "ដូចកំពូលវីរបុរស!" Superhero Mom landing!
  { f: 1008, a: 0.055 }, // "ឯងជាបង ម៉េចមិនចេះយោគយល់ប្អូន?" Mom verdict!
  { f: 1158, a: 0.048 }, // "លួចញាក់ចិញ្ចើម!" Evil eyebrow-wiggle reveal!
];

// ---------- Continuous 3D Camera Choreography Across 3 Authentic Khmer Stages ----------
// Stage A (x =  0.0): Mustard-Gold Khmer Stilt House & Patterned Tiled Patio (ក្រោមផ្ទះ)
// Stage B (x = -13.5): Ancestral Khmer Courtyard, Conical Straw Haystack & Wooden Ox-Cart
// Stage C (x = +13.5): Khmer Outdoor Kitchen Hearth & Clay Charcoal Stove (ចង្ក្រានដី)
const CAMS = {
  // 1. Frame-0 Hook: Khmer Mom pointing wooden rice ladle scolding startled innocent Big Sibling!
  s01_hook_scolded_innocent: [
    { f: 0,  pos: [-0.25, 1.88, 6.4], look: [0.0, 1.06, 0.10], fov: 41 },
    { f: 46, pos: [0.15,  1.78, 5.6], look: [0.0, 1.06, 0.10], fov: 39, ease: 'easeOut' },
  ],
  // 2. Orbit push on innocent Big Sibling under glowing Halo + Green Check Shield!
  s02_hook_did_nothing_wrong: [
    { f: 47, pos: [-0.45, 1.84, 5.8], look: [-0.20, 1.10, 0.10], fov: 40 },
    { f: 94, pos: [-0.10, 1.76, 5.1], look: [-0.20, 1.12, 0.10], fov: 38, ease: 'easeOut' },
  ],
  // 3. Punchy two-shot comparison: Tall Big Sibling vs Crowned Younger Bro + Birth-Order "?" Card!
  s03_hook_born_first: [
    { f: 95,  pos: [0.35,  1.88, 6.5], look: [0.0, 1.08, 0.10], fov: 41 },
    { f: 148, pos: [-0.25, 1.80, 5.9], look: [0.0, 1.08, 0.10], fov: 39 },
  ],
  // 4. Sweeping scenic crane establishing the Mustard-Gold Khmer Stilt House, open rice paddies & sugar palms!
  s04_khmer_house_establish: [
    { f: 149, pos: [-2.4, 3.25, 12.8], look: [0.0, 2.25, -1.2], fov: 44 },
    { f: 194, pos: [1.6,  2.55, 9.8],  look: [0.0, 1.75, -0.8], fov: 42, ease: 'easeOut' },
  ],
  // 5. Stage B (x = -13.5, Ox-Cart & Haystack Yard): Dolly toward golden Law Pedestal + Crossed-Out Scroll!
  s05_unwritten_immortal_law: [
    { f: 195, pos: [-14.0, 1.92, 6.7], look: [-13.5, 1.10, -0.25], fov: 42 },
    { f: 261, pos: [-13.2, 1.80, 5.8], look: [-13.5, 1.10, -0.25], fov: 40 },
  ],
  // 6. Stage B Gavel Slam: Giant Judge Gavel & Red Guilty Card slams beside stunned Big Sibling!
  s06_big_sib_always_guilty: [
    { f: 262, pos: [-13.5, 1.86, 6.4], look: [-13.5, 1.10, -0.20], fov: 41 },
    { f: 317, pos: [-13.5, 1.74, 5.5], look: [-13.5, 1.12, -0.20], fov: 39, ease: 'easeOut' },
  ],
  // 7. Back under Stilt House near Kre bamboo bed: Bored Little Bro gets a devilish prank lightbulb!
  s07_little_bro_bored: [
    { f: 318, pos: [-1.85, 1.78, 5.4], look: [-1.85, 1.04, -0.55], fov: 40 },
    { f: 343, pos: [-1.65, 1.70, 4.8], look: [-1.75, 1.06, -0.55], fov: 38, ease: 'easeOut' },
  ],
  // 8. Low-angle ninja tracking shot: Little Bro ties Checkered Indigo Krama Ninja Headband & creeps toward Big Sib!
  s08_ninja_krama_creep: [
    { f: 344, pos: [-1.15, 1.68, 6.1], look: [-0.45, 0.98, 0.05], fov: 41 },
    { f: 395, pos: [0.15,  1.62, 5.5], look: [0.05,  0.98, 0.05], fov: 39 },
  ],
  // 9. Prank #1 (Steal Snack): Whip-push to teak table as Ninja Bro snatches golden Khmer cake!
  s09_prank1_steal_snack: [
    { f: 396, pos: [-0.20, 1.82, 5.9], look: [0.0, 1.02, -0.05], fov: 40 },
    { f: 432, pos: [0.25,  1.74, 5.3], look: [0.0, 1.02, -0.05], fov: 38, ease: 'easeOut' },
  ],
  // 10. Prank #2 (Pull Hair): Tight comedy two-shot as Ninja Bro yanks Big Sibling's hair backward!
  s10_prank2_pull_hair: [
    { f: 433, pos: [0.10,  1.80, 5.6], look: [0.05, 1.08, 0.10], fov: 39 },
    { f: 461, pos: [-0.15, 1.72, 5.0], look: [0.05, 1.10, 0.10], fov: 37, ease: 'easeOut' },
  ],
  // 11. Prank #3 (Slap Back): Side-orbit punch as Ninja Bro slaps Big Sibling's back with POW burst!
  s11_prank3_slap_back: [
    { f: 462, pos: [-0.35, 1.84, 6.0], look: [0.0, 1.06, 0.10], fov: 40 },
    { f: 519, pos: [0.30,  1.76, 5.4], look: [0.0, 1.06, 0.10], fov: 38, ease: 'easeOut' },
  ],
  // 12. Fast lateral pan: Steaming Big Sibling on left watching Little Bro sprint off whistling!
  s12_run_away_innocent: [
    { f: 520, pos: [0.10, 1.86, 6.5], look: [0.15, 1.04, 0.15], fov: 41 },
    { f: 549, pos: [0.65, 1.80, 6.2], look: [0.65, 1.04, 0.15], fov: 40 },
  ],
  // 13. Tight crimson-rage push onto Big Sibling's face as TWIN WHITE STEAM JETS blast out of both ears!
  s13_angry_ear_steam: [
    { f: 550, pos: [-0.15, 1.78, 5.1], look: [-0.15, 1.18, 0.15], fov: 39 },
    { f: 604, pos: [-0.15, 1.68, 4.3], look: [-0.15, 1.20, 0.15], fov: 36, ease: 'easeOut' },
  ],
  // 14. Crisp profile two-shot: Big Sibling lifts one gentle hand & taps Little Bro like a pink feather!
  s14_gentle_tiny_push: [
    { f: 605, pos: [-0.20, 1.84, 6.2], look: [0.0, 1.06, 0.10], fov: 40 },
    { f: 686, pos: [0.15,  1.76, 5.5], look: [0.05, 1.06, 0.10], fov: 38, ease: 'easeOut' },
  ],
  // 15. High-angle smash down onto the patterned Khmer floor tiles as Little Bro flops BOOM onto his back!
  s15_dramatic_tile_flop: [
    { f: 687, pos: [0.05, 2.22, 6.3], look: [0.05, 0.88, 0.15], fov: 41 },
    { f: 735, pos: [0.10, 1.92, 5.6], look: [0.10, 0.82, 0.15], fov: 39, ease: 'easeOut' },
  ],
  // 16. Comedy two-shot push on sprawled Little Bro shooting twin fountain tear geysers + Red Siren Card!
  s16_scream_cry_oscar: [
    { f: 736, pos: [0.12, 1.82, 5.6], look: [0.12, 0.88, 0.18], fov: 40 },
    { f: 796, pos: [0.20, 1.68, 5.0], look: [0.18, 0.84, 0.18], fov: 38, ease: 'easeOut' },
  ],
  // 17. Stage C (x = +13.5, Khmer Outdoor Kitchen): Mom at clay charcoal stove perks up under "<3s" Stopwatch!
  s17_under_three_seconds: [
    { f: 797, pos: [13.2, 1.88, 5.9], look: [13.5, 1.10, -0.35], fov: 41 },
    { f: 839, pos: [13.6, 1.78, 5.1], look: [13.5, 1.12, -0.35], fov: 38, ease: 'easeOut' },
  ],
  // 18. Heroic low-angle crane up on Stage A: Khmer Mom lands with billowing Checkered Krama Superhero Cape!
  s18_superhero_mom_arrives: [
    { f: 840, pos: [0.0,  1.52, 6.5], look: [0.0, 1.12, 0.10], fov: 42 },
    { f: 905, pos: [0.20, 1.76, 5.7], look: [0.0, 1.12, 0.10], fov: 39, ease: 'easeOut' },
  ],
  // 19. Sweaty Big Sibling pleads desperately while his speech bubble gets stamped with a giant Red "X"!
  s19_explain_useless: [
    { f: 906, pos: [-0.35, 1.86, 6.3], look: [-0.15, 1.08, 0.10], fov: 41 },
    { f: 972, pos: [-0.10, 1.78, 5.6], look: [-0.15, 1.10, 0.10], fov: 39 },
  ],
  // 20. Tight authoritative push on Mom raising her wooden rice ladle to pronounce the verdict!
  s20_mom_answer_setup: [
    { f: 973,  pos: [0.15, 1.78, 4.9], look: [0.15, 1.18, 0.10], fov: 38 },
    { f: 1005, pos: [0.15, 1.68, 4.2], look: [0.15, 1.20, 0.10], fov: 36, ease: 'easeOut' },
  ],
  // 21. Verdict two-shot: Mom scolds shrinking Big Sibling beneath the Tilted Unfair Sibling Scale Card!
  s21_mom_verdict_yield: [
    { f: 1006, pos: [-0.20, 1.88, 6.5], look: [-0.05, 1.08, 0.10], fov: 41 },
    { f: 1065, pos: [0.20,  1.80, 5.8], look: [-0.05, 1.08, 0.10], fov: 39, ease: 'easeOut' },
  ],
  // 22. Spotlight dolly onto Little Bro beneath the gleaming Golden Oscar Trophy Card!
  s22_oscar_actor_bro: [
    { f: 1066, pos: [0.55, 1.84, 5.9], look: [0.45, 1.06, 0.05], fov: 40 },
    { f: 1124, pos: [0.45, 1.74, 5.1], look: [0.45, 1.08, 0.05], fov: 38, ease: 'easeOut' },
  ],
  // 23. Three-shot framing: Mom scolds Big Sibling on left while Little Bro fake-cries peeking behind Mom's Sampot!
  s23_fake_cry_behind_mom: [
    { f: 1125, pos: [0.20, 1.86, 6.5], look: [0.05, 1.06, 0.10], fov: 41 },
    { f: 1154, pos: [0.45, 1.78, 5.8], look: [0.20, 1.04, 0.10], fov: 39 },
  ],
  // 24. Ultimate Payoff Close-Up: Clean framing of Mom & Little Bro's EVIL EYEBROW-WIGGLE SMIRK!
  s24_evil_eyebrow_smirk: [
    { f: 1155, pos: [0.24, 1.74, 5.4], look: [0.22, 1.04, 0.05], fov: 39 },
    { f: 1217, pos: [0.36, 1.62, 4.5], look: [0.34, 1.04, 0.05], fov: 36, ease: 'easeOut' },
  ],
  // 25. Warm Khmer Golden Sunset Lineup: Relatable Big Sibling shrugs at viewer ("Are you a victim eldest too?")!
  s25_are_you_victim_bong: [
    { f: 1218, pos: [-0.35, 1.90, 6.8], look: [0.0, 1.06, 0.15], fov: 42 },
    { f: 1292, pos: [0.35,  1.84, 6.2], look: [0.0, 1.06, 0.15], fov: 40 },
  ],
  // 26. Sunset Crane Pullback + Glowing Blue Thumbs-Up Like & Gold Comment CTA!
  s26_like_and_comment_cta: [
    { f: 1293, pos: [0.0, 1.86, 6.5], look: [0.0, 1.12, 0.15], fov: 41 },
    { f: 1361, pos: [0.0, 2.04, 7.5], look: [0.0, 1.16, 0.15], fov: 43, ease: 'easeOut' },
  ],
};

export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0010, kicks: KICKS });
  if (f === 273 || f === 692 || f === 856) c.flash = 0.08;
  return c;
};

// STRICT QUALITY LOCK: 100% razor-sharp on EVERY frame (cinf === 0 enforced across all 26 shots)
export const dofAt = (f) => {
  const C = camAt(f);
  const d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]);
  return { focus: d, cinf: 0, near: 0.5 };
};

// ---------- Dynamic 3D World State ----------
export const worldAt = (f) => {
  const S = shotAt(f);
  // Hide snack cakes on 3D table after Ninja Bro steals them in s09..s12
  const hideTableSnacks = f >= 408 && f <= 549;

  let aura = false, auraRed = false, auraPos = [0, 1.2, 0];
  if (S.id === 's06_big_sib_always_guilty') {
    aura = true; auraPos = [-13.5, 1.25, -0.35];
  } else if (S.id === 's13_angry_ear_steam') {
    aura = true; auraRed = true; auraPos = [-0.15, 1.25, -0.10];
  } else if (S.id === 's18_superhero_mom_arrives') {
    aura = true; auraPos = [0.0, 1.28, -0.15];
  } else if (S.id === 's22_oscar_actor_bro' || S.id === 's24_evil_eyebrow_smirk') {
    aura = true; auraPos = [0.55, 1.15, -0.20];
  }
  return { hideTableSnacks, aura, auraRed, auraPos };
};

// ---------- Character Staging & Expressive Acting ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const wv = q(f / 7, 1);

  const act = (role, seed, x, y, z, s, opts = {}) => {
    const idl = idle(f, seed);
    const bl = blinkAt(f, seed);
    const keyObj = { role, ...opts, bl, wv, qb: q(idl.bob, 3), qt: q(idl.tilt, 1) };
    out.push({
      x, y, z, s,
      roll: opts.cardRoll || 0,
      blob: opts.blob,
      blobW: opts.blobW,
      order: opts.order || 2,
      key: `sib:${JSON.stringify(keyObj)}`,
      draw: (p) => T.khmerSiblingChar(p, role, {
        seed,
        bob: opts.noIdle ? 0 : idl.bob,
        tilt: (opts.tilt || 0) + (opts.noIdle ? 0 : idl.tilt * 0.45),
        headTilt: (opts.headTilt || 0) + (opts.noIdle ? 0 : idl.headTilt * 0.45),
        blink: bl,
        wv,
        ...opts,
      }),
    });
  };

  switch (S.id) {
    // 1. Frame-0 Hook: Khmer Mom scolding startled innocent Big Sibling while Little Bro clings smugly!
    case 's01_hook_scolded_innocent': {
      act('bigSib', 2, -0.56, 0.0, 0.12, 1.0, {
        facing: 1, expr: 'innocentShock', L: 'plead', R: 'plead', sweat: true,
      });
      act('mom', 5, 0.24, 0.0, 0.10, 1.02, {
        facing: -1, expr: 'fierceMom', L: 'pointScold', R: 'hip', riceLadle: true,
      });
      act('littleBro', 8, 0.72, 0.0, -0.06, 0.90, {
        facing: -1, expr: 'fakePeekCry', L: 'wipeTear', R: 'hang', fakeSingleTear: true,
      });
      break;
    }

    // 2. Innocent Big Sibling pleading under glowing Halo + Green Check Shield!
    case 's02_hook_did_nothing_wrong': {
      act('bigSib', 2, -0.45, 0.0, 0.12, 1.0, {
        facing: 1, expr: 'pleading', L: 'plead', R: 'shrug', sweat: true,
      });
      act('mom', 5, 0.42, 0.0, 0.04, 1.0, {
        facing: -1, expr: 'heroMom', L: 'hip', R: 'hip', riceLadle: true,
      });
      break;
    }

    // 3. Birth-order gag: Tall Big Sibling (#1) vs Little Bro (#2) standing proud!
    case 's03_hook_born_first': {
      act('bigSib', 2, -0.58, 0.0, 0.12, 1.02, {
        facing: 1, expr: 'defeatedBong', L: 'shrug', R: 'shrug', sweat: true,
      });
      act('littleBro', 8, 0.58, 0.0, 0.12, 0.92, {
        facing: -1, expr: 'grin', L: 'hip', R: 'wave',
      });
      break;
    }

    // 4. Wide Khmer Stilt House Establishing Shot: Family in the sunlit tiled courtyard!
    case 's04_khmer_house_establish': {
      act('mom', 5, -0.78, 0.0, 0.15, 1.0, {
        facing: 1, expr: 'warmMom', L: 'hang', R: 'wave',
      });
      act('bigSib', 2, 0.05, 0.0, 0.20, 1.0, {
        facing: -1, expr: 'smile_closed', L: 'sampheah', R: 'sampheah',
      });
      act('littleBro', 8, 0.76, 0.0, 0.18, 0.92, {
        facing: -1, expr: 'grin', L: 'hip', R: 'wave',
      });
      break;
    }

    // 5. Stage B (x = -13.5, Ox-Cart & Straw Haystack Yard): Unwritten Immortal Khmer Law!
    case 's05_unwritten_immortal_law': {
      act('mom', 5, -14.12, 0.0, -0.15, 1.02, {
        facing: 1, expr: 'heroMom', L: 'hip', R: 'pointScold', riceLadle: true,
      });
      act('bigSib', 2, -12.88, 0.0, -0.15, 1.0, {
        facing: -1, expr: 'nervous', L: 'hang', R: 'hang', sweat: true,
      });
      break;
    }

    // 6. Stage B Gavel Slam: "Big Sibling is Guilty in Every Case!"
    case 's06_big_sib_always_guilty': {
      const hit = f >= 273;
      act('bigSib', 2, -14.15, 0.0, -0.12, hit ? 0.94 : 1.0, {
        facing: 1, expr: hit ? 'innocentShock' : 'nervous',
        L: hit ? 'headGrab' : 'hang', R: hit ? 'headGrab' : 'hang',
        sweatSpray: hit,
      });
      act('littleBro', 8, -12.85, 0.0, -0.12, 0.92, {
        facing: -1, expr: 'laugh', L: 'hip', R: 'pointScold',
      });
      break;
    }

    // 7. Under Stilt House by Kre Bamboo Bed: Bored Little Bro gets a mischievous prank idea!
    case 's07_little_bro_bored': {
      const idea = f >= 330;
      act('littleBro', 8, -2.05, 0.0, -0.45, 0.94, {
        facing: 1, expr: idea ? 'ninjaSneak' : 'bored',
        L: idea ? 'ninjaHands' : 'hang', R: idea ? 'ninjaHands' : 'hip',
      });
      break;
    }

    // 8. Checkered Khmer Krama Ninja Creep! Little Bro sneaks up behind calm reading Big Sibling!
    case 's08_ninja_krama_creep': {
      const u = M.smooth(ramp(f, 344, 395));
      const nx = lerp(-1.55, -0.42, u);
      const st = q(((f - 344) * 0.055) % 1, 2);
      act('bigSib', 2, 0.48, 0.0, 0.08, 1.0, {
        facing: 1, expr: 'smile_closed', L: 'holdFront', R: 'holdFront', schoolBook: true,
      });
      act('littleBro', 8, nx, 0.0, 0.12, 0.92, {
        facing: 1, expr: 'ninjaSneak', ninjaMask: true, ninjaCreep: true, step: st,
      });
      break;
    }

    // 9. Prank #1: Stealing Big Sibling's Khmer Cake right off the table!
    case 's09_prank1_steal_snack': {
      const snatched = f >= 408;
      act('bigSib', 2, 0.56, 0.0, 0.08, 1.0, {
        facing: -1, expr: snatched ? 'innocentShock' : 'smile_closed',
        L: snatched ? 'plead' : 'holdFront', R: snatched ? 'hang' : 'holdFront',
        schoolBook: !snatched, sweat: snatched,
      });
      act('littleBro', 8, -0.48, 0.0, 0.12, 0.92, {
        facing: snatched ? -1 : 1, expr: snatched ? 'laugh' : 'ninjaSneak',
        ninjaMask: true, L: 'ninjaHands', R: 'holdFront', stolenCake: snatched,
      });
      break;
    }

    // 10. Prank #2: Yanking Big Sibling's Hair backward!
    case 's10_prank2_pull_hair': {
      const yank = f >= 436;
      const hopY = yank ? Math.abs(Math.sin((f - 436) * 0.25)) * 0.16 : 0;
      act('bigSib', 2, 0.36, 0.0, 0.12, 1.0, {
        facing: 1, expr: yank ? 'hairYank' : 'neutral',
        headTilt: yank ? -22 : 0, tilt: yank ? -8 : 0,
        L: yank ? 'headGrab' : 'hang', R: yank ? 'plead' : 'hang', sweatSpray: yank,
      });
      act('littleBro', 8, -0.34, hopY, 0.15, 0.92, {
        facing: 1, expr: 'evilSmirk', ninjaMask: true,
        L: 'ninjaHands', R: 'grabHair',
      });
      break;
    }

    // 11. Prank #3: Sneaky Open-Palm Slap on Big Sibling's Back!
    case 's11_prank3_slap_back': {
      const slap = f >= 482;
      act('bigSib', 2, 0.38, 0.0, 0.12, 1.0, {
        facing: 1, expr: slap ? 'pained' : 'stern',
        tilt: slap ? 14 : 0, headTilt: slap ? 10 : 0,
        L: slap ? 'plead' : 'hip', R: slap ? 'plead' : 'hip', sweatSpray: slap,
      });
      act('littleBro', 8, -0.38, 0.0, 0.14, 0.92, {
        facing: 1, expr: slap ? 'laugh' : 'ninjaSneak', ninjaMask: true,
        L: 'ninjaHands', R: slap ? 'slapBack' : 'ninjaHands',
      });
      break;
    }

    // 12. Sprinting Away Whistling Innocently («រួចរត់គេចធ្វើព្រងើយ»)!
    case 's12_run_away_innocent': {
      const u = ramp(f, 520, 549);
      const rx = lerp(0.05, 1.45, u);
      const st = q(((f - 520) * 0.12) % 1, 2);
      act('bigSib', 2, -0.38, 0.0, 0.10, 1.0, {
        facing: 1, expr: 'furiousSteam', L: 'fists', R: 'fists',
      });
      act('littleBro', 8, rx, 0.0, 0.18, 0.92, {
        facing: 1, expr: 'whistle', sprint: true, step: st,
      });
      break;
    }

    // 13. Boiling Anger: Twin White Steam Jets Blasting Out of Both Ears («ខឹងឡើងហុយផ្សែងតាមត្រចៀក»)!
    case 's13_angry_ear_steam': {
      const shakeX = Math.sin(f * 1.4) * 0.018;
      act('bigSib', 2, -0.15 + shakeX, 0.0, 0.15, 1.04, {
        facing: 1, expr: 'furiousSteam', earSteam: true, L: 'fists', R: 'fists',
      });
      break;
    }

    // 14. Feather-Light 1-Finger Gentle Push («គ្រាន់តែលើកដៃរុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ...»)!
    case 's14_gentle_tiny_push': {
      const touch = ramp(f, 628, 668);
      const bx = lerp(-0.48, -0.34, M.smooth(touch));
      const tapped = f >= 656;
      act('bigSib', 2, bx, 0.0, 0.12, 1.0, {
        facing: 1, expr: 'stern', L: 'hip', R: 'gentleTap',
      });
      act('littleBro', 8, 0.34 + (tapped ? 0.05 : 0), 0.0, 0.12, 0.92, {
        facing: -1, expr: tapped ? 'innocentShock' : 'smirk',
        tilt: tapped ? -6 : 0, L: 'hang', R: 'hang',
      });
      break;
    }

    // 15. Melodramatic Oscar Launch & BOOM Flop Onto Khmer Floor Tiles («ស្រាប់តែវាដួលតូងទៅលើឥដ្ឋ»)!
    case 's15_dramatic_tile_flop': {
      const airU = clamp((f - 687) / 6);
      act('bigSib', 2, -0.44, 0.0, 0.08, 1.0, {
        facing: 1, expr: 'innocentShock', L: 'plead', R: 'plead', sweatSpray: true,
      });
      if (f < 693) {
        act('littleBro', 8, lerp(0.28, 0.42, airU), Math.sin(airU * Math.PI) * 0.38, 0.18, 0.94, {
          facing: -1, expr: 'innocentShock', tilt: -38 * airU, L: 'plead', R: 'plead', noIdle: true,
        });
      } else {
        act('littleBro', 8, 0.42, 0.0, 0.22, 0.98, {
          mode: 'floorFlopCry', crying: true, blobW: 1.45, noIdle: true, order: 3,
        });
      }
      break;
    }

    // 16. Wailing Like Murder with Twin Fountain Tear Geysers («ហើយស្រែកយំដូចគេចាក់កអ៊ីចឹង»)!
    case 's16_scream_cry_oscar': {
      act('bigSib', 2, -0.38, 0.0, 0.06, 0.98, {
        facing: 1, expr: 'pleading', L: 'headGrab', R: 'headGrab', sweatSpray: true,
      });
      act('littleBro', 8, 0.44, 0.0, 0.22, 1.02, {
        mode: 'floorFlopCry', crying: true, blobW: 1.48, noIdle: true, order: 3,
      });
      break;
    }

    // 17. Stage C (x = +13.5, Outdoor Kitchen): Mom at clay charcoal stove hears cry in <3 seconds!
    case 's17_under_three_seconds': {
      const dash = ramp(f, 822, 839);
      const mx = lerp(13.35, 12.25, M.easeIn(dash));
      act('mom', 5, mx, 0.0, -0.25, 1.02, {
        facing: -1, expr: 'fierceMom',
        L: dash > 0.1 ? 'ladleHero' : 'holdFront', R: 'hip',
        riceLadle: true, superKramaCape: f >= 812,
        sprint: dash > 0.15, step: q(((f - 822) * 0.14) % 1, 2),
      });
      break;
    }

    // 18. Superhero Mom Lands Between the Kids with Billowing Checkered Krama Cape («ដូចកំពូលវីរបុរស»)!
    case 's18_superhero_mom_arrives': {
      const dropU = clamp((f - 840) / 16);
      const momY = f < 856 ? lerp(1.35, 0.0, M.easeOut(dropU)) : 0.0;
      act('bigSib', 2, -0.66, 0.0, 0.08, 0.98, {
        facing: 1, expr: 'innocentShock', L: 'plead', R: 'plead', sweatSpray: true,
      });
      act('mom', 5, 0.04, momY, 0.16, 1.05, {
        facing: -1, expr: 'fierceMom', L: 'hip', R: 'ladleHero',
        riceLadle: true, superKramaCape: true, order: 3,
      });
      act('littleBro', 8, 0.68, 0.0, 0.06, 0.90, {
        facing: -1, expr: 'megaWail', crying: true, L: 'wipeTear', R: 'wipeTear',
      });
      break;
    }

    // 19. Big Sibling Explains Frantically — Completely Useless!
    case 's19_explain_useless': {
      act('bigSib', 2, -0.58, 0.0, 0.14, 1.0, {
        facing: 1, expr: 'pleading', L: 'plead', R: 'plead', sweatSpray: true,
      });
      act('mom', 5, 0.28, 0.0, 0.10, 1.02, {
        facing: -1, expr: 'heroMom', L: 'hip', R: 'hip', riceLadle: true, superKramaCape: true,
      });
      act('littleBro', 8, 0.74, 0.0, -0.04, 0.88, {
        facing: -1, expr: 'fakePeekCry', L: 'wipeTear', R: 'hang', fakeSingleTear: true,
      });
      break;
    }

    // 20. Tight Push on Mom About to Drop the Classic Khmer Mom Answer!
    case 's20_mom_answer_setup': {
      act('mom', 5, 0.15, 0.0, 0.12, 1.04, {
        facing: -1, expr: 'fierceMom', L: 'pointScold', R: 'hip', riceLadle: true, superKramaCape: true,
      });
      break;
    }

    // 21. Verdict: "You're the Older Sibling, Why Don't You Yield to Your Little Sibling?!"
    case 's21_mom_verdict_yield': {
      const shrink = lerp(1.0, 0.88, M.smooth(ramp(f, 1008, 1045)));
      act('bigSib', 2, -0.58, 0.0, 0.12, shrink, {
        facing: 1, expr: 'defeatedBong', L: 'hang', R: 'hang', sweat: true,
      });
      act('mom', 5, 0.34, 0.0, 0.12, 1.04, {
        facing: -1, expr: 'fierceMom', L: 'pointScold', R: 'hip', riceLadle: true,
      });
      break;
    }

    // 22. Spotlight on the Master Oscar-Actor Little Brother!
    case 's22_oscar_actor_bro': {
      act('mom', 5, -0.22, 0.0, 0.10, 1.0, {
        facing: -1, expr: 'heroMom', L: 'hip', R: 'pointScold', riceLadle: true,
      });
      act('littleBro', 8, 0.48, 0.0, 0.06, 0.94, {
        facing: -1, expr: 'fakePeekCry', L: 'wipeTear', R: 'hang', fakeSingleTear: true,
      });
      break;
    }

    // 23. Standing Behind Mom's Back Pretending to Cry!
    case 's23_fake_cry_behind_mom': {
      act('bigSib', 2, -0.62, 0.0, 0.12, 0.96, {
        facing: 1, expr: 'defeatedBong', L: 'hang', R: 'hang',
      });
      act('mom', 5, 0.06, 0.0, 0.14, 1.02, {
        facing: -1, expr: 'fierceMom', L: 'pointScold', R: 'hip', riceLadle: true, order: 3,
      });
      act('littleBro', 8, 0.56, 0.0, 0.02, 0.92, {
        facing: -1, expr: 'fakePeekCry', L: 'wipeTear', R: 'wipeTear', crying: true,
      });
      break;
    }

    // 24. Ultimate Payoff: Little Bro Drops the Cry & Rapidly Wiggles His Eyebrows Smirking at You!
    case 's24_evil_eyebrow_smirk': {
      act('mom', 5, -0.02, 0.0, 0.16, 1.02, {
        facing: -1, expr: 'heroMom', L: 'hip', R: 'hang', riceLadle: true,
      });
      act('littleBro', 8, 0.58, 0.0, 0.06, 0.96, {
        facing: -1, expr: 'evilSmirk', browWiggle: true, fakeSingleTear: true,
        L: 'hip', R: 'teaseThumb', order: 4,
      });
      break;
    }

    // 25. Khmer Golden Sunset Viewer Question ("Are you an eldest sibling who suffered like this?")
    case 's25_are_you_victim_bong': {
      act('mom', 5, -0.68, 0.0, 0.12, 1.0, {
        facing: 1, expr: 'warmMom', L: 'hang', R: 'hip',
      });
      act('bigSib', 2, 0.0, 0.0, 0.20, 1.02, {
        facing: 1, expr: 'sheepish', L: 'shrug', R: 'shrug', sweat: true,
      });
      act('littleBro', 8, 0.66, 0.0, 0.14, 0.92, {
        facing: -1, expr: 'grin', L: 'hip', R: 'wave',
      });
      break;
    }

    // 26. Warm Sunset Family Wave + Like & Comment CTA!
    case 's26_like_and_comment_cta': {
      act('mom', 5, -0.68, 0.0, 0.14, 1.0, {
        facing: 1, expr: 'warmMom', L: 'sampheah', R: 'sampheah',
      });
      act('bigSib', 2, 0.0, 0.0, 0.20, 1.02, {
        facing: 1, expr: 'grin', L: 'hip', R: 'wave',
      });
      act('littleBro', 8, 0.68, 0.0, 0.16, 0.92, {
        facing: -1, expr: 'laugh', L: 'wave', R: 'hip',
      });
      break;
    }
  }

  return out;
};

// ---------- Rollo-Style 2D Visual Cards, Shock Rays & Dust FX ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];

  const cardFx = (kind, x, y, z, s, a0, a1) => {
    const pop = M.back(clamp((f - a0) / 8), 1.65);
    const fade = a1 && f > a1 - 5 ? clamp((a1 - f) / 5) : 1;
    const sc = s * pop * fade;
    if (sc <= 0.02) return;
    const k = q((f - a0) / 14, 2);
    out.push({
      x, y, z, s: sc, shadow: false, blob: false, order: 5,
      key: `ecard:${kind}:${k}`,
      draw: (p) => T.drawEldestCard(p, kind, k),
    });
  };

  // 1. Innocent Halo + Green Check Shield ("មិនបានធ្វើអ្វីខុសសោះ")
  if (S.id === 's02_hook_did_nothing_wrong') {
    cardFx('innocentHaloCheck', -0.45, 1.32, 0.24, 0.62, 49, 94);
  }
  // 2. Born First Crown Comparison Card ("គ្រាន់តែព្រោះអ្នកកើតមុនប្អូនទេ?")
  if (S.id === 's03_hook_born_first') {
    cardFx('bornFirstCrown', 0.0, 1.38, 0.26, 0.70, 98, 148);
  }
  // 3. Unwritten Law Scroll Crossed Out ("មិនបាច់សរសេរលើក្រដាស")
  if (S.id === 's05_unwritten_immortal_law') {
    cardFx('noPaperScroll', -13.5, 1.35, -0.05, 0.72, 200, 261);
  }
  // 4. Immortal Khmer House Law Gavel & Guilty Block ("បងធំខុសគ្រប់ករណី!")
  if (S.id === 's06_big_sib_always_guilty' && f >= 268) {
    cardFx('guiltyBongGavel', -13.5, 1.38, 0.05, 0.78, 268, 317);
  }
  // 5. Bored Mischief Lightbulb ("ពេលប្អូនអ្នកអផ្សុក")
  if (S.id === 's07_little_bro_bored' && f >= 326) {
    cardFx('boredIdeaBulb', -1.55, 1.28, -0.35, 0.62, 326, 343);
  }
  // 6. POW Impact Starburst on Hair-Pull & Back-Slap!
  if (S.id === 's10_prank2_pull_hair' && f >= 436 && f <= 454) {
    cardFx('slapPowBurst', 0.16, 1.42, 0.28, 0.56, 436, 454);
  }
  if (S.id === 's11_prank3_slap_back' && f >= 482 && f <= 506) {
    cardFx('slapPowBurst', 0.12, 1.05, 0.28, 0.60, 482, 506);
  }
  // 7. Sprinting dust puffs behind Ninja Bro escaping!
  if (S.id === 's12_run_away_innocent') {
    for (const df of [522, 530, 538, 545]) {
      const k = (f - df) / 10;
      if (k >= 0 && k < 1) {
        const u = ramp(df, 520, 549);
        out.push({
          x: lerp(0.0, 1.30, u), y: 0.02, z: 0.12, s: 0.44,
          shadow: false, blob: false, key: `dust:${q(k, 2)}`,
          draw: (p) => T.fxDust(p, k),
        });
      }
    }
  }
  // 8. Boiling Anger Burst Rays around Ear-Steaming Big Sibling!
  if (S.id === 's13_angry_ear_steam' && f >= 556) {
    const k = q((f - 556) / 6, 1);
    out.push({
      x: -0.15, y: 0.92, z: 0.02, s: 1.08, shadow: false, blob: false, order: 1,
      key: `rageRays:${k}`,
      draw: (p) => T.drawBurstRays(p, k, '#ff5238', '#ffd23f'),
    });
  }
  // 9. Delicate Pink Feather Push Card ("រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ...")
  if (S.id === 's14_gentle_tiny_push' && f >= 632) {
    cardFx('featherPush', 0.0, 1.42, 0.25, 0.64, 632, 686);
  }
  // 10. Tile-Flop Impact Dust Ring + Flashing Red Emergency Siren Megaphone!
  if (S.id === 's15_dramatic_tile_flop' && f >= 693 && f <= 712) {
    const k = (f - 693) / 18;
    out.push({
      x: 0.42, y: 0.04, z: 0.18, s: 0.78, shadow: false, blob: false, order: 2,
      key: `flopDust:${q(k, 2)}`,
      draw: (p) => T.fxDust(p, k, '#fff0d4'),
    });
  }
  if (S.id === 's16_scream_cry_oscar') {
    cardFx('sirenMegaphone', 0.36, 0.88, 0.30, 0.58, 738, 796);
  }
  // 11. Turbo "<3s" Stopwatch in Outdoor Kitchen!
  if (S.id === 's17_under_three_seconds') {
    cardFx('threeSecTimer', 13.78, 1.36, -0.10, 0.66, 799, 839);
  }
  // 12. Superhero Landing Dust & Golden Rays on Mom!
  if (S.id === 's18_superhero_mom_arrives' && f >= 855) {
    const k = q((f - 855) / 7, 1);
    out.push({
      x: 0.04, y: 0.96, z: 0.02, s: 1.18, shadow: false, blob: false, order: 1,
      key: `heroRays:${k}`,
      draw: (p) => T.drawBurstRays(p, k, '#ffd23f', '#ffffff'),
    });
  }
  // 13. Blocked Explanation Speech Bubble ("ក៏គ្មានប្រយោជន៍ដែរ")
  if (S.id === 's19_explain_useless' && f >= 912) {
    cardFx('blockedSpeechX', -0.22, 1.42, 0.28, 0.68, 912, 972);
  }
  // 14. Unfair Sibling Scale Verdict ("ឯងជាបង ម៉េចមិនចេះយោគយល់ប្អូន?")
  if (S.id === 's21_mom_verdict_yield' && f >= 1010) {
    cardFx('unfairScaleVerdict', -0.05, 1.42, 0.28, 0.72, 1010, 1065);
  }
  // 15. Golden Oscar Trophy Card ("ឯប្អូនកំពូលសម្តែងវិញ")
  if (S.id === 's22_oscar_actor_bro') {
    cardFx('oscarTrophyMask', 0.48, 1.38, 0.22, 0.68, 1068, 1124);
  }
  // 16. Sunset Like & Comment CTA Card!
  if (S.id === 's26_like_and_comment_cta') {
    cardFx('likeAndCommentCTA', 0.0, 1.54, 0.32, 0.80, 1296, 1362);
  }

  return out;
};
