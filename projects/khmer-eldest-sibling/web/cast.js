// ---------------- Khmer Household Comedy Cast, Ninja Krama, Ear-Steam, Floor-Flop & Superhero Mom ----------------
// Built on toonbase.js Pen (design space 600 x 1000, soles at y = 975).
FACE.innocentShock = { eye: ["shock", "shock"], brow: [-7, -5], mouth: "o" };
FACE.pleading = { eye: ["small", "small"], brow: [-6, 3], mouth: "wave" };
FACE.furiousSteam = { eye: ["slit", "slit"], brow: [8, -5], mouth: "teeth" };
FACE.hairYank = { eye: ["squeeze", "shock"], brow: [-5, 4], mouth: "O" };
FACE.ninjaSneak = { eye: ["slit", "slit"], brow: [6, -4], mouth: "smirk" };
FACE.bored = { eye: ["lid", "lid"], brow: [1, 2], mouth: "frown" };
FACE.megaWail = { eye: ["squeeze", "squeeze"], brow: [-6, 5], mouth: "O" };
FACE.fakePeekCry = { eye: ["squeeze", "slit"], brow: [-4, 3], mouth: "wave" };
FACE.evilSmirk = { eye: ["lid", "lid"], brow: [5, -5], mouth: "grin" };
FACE.fierceMom = { eye: ["slit", "slit"], brow: [7, -4], mouth: "teeth" };
FACE.heroMom = { eye: ["lid", "lid"], brow: [5, -3], mouth: "frown" };
FACE.warmMom = { eye: ["happy", "happy"], brow: [-2, -1], mouth: "smileWide" };
FACE.defeatedBong = { eye: ["lid", "lid"], brow: [-5, 4], mouth: "frown" };
FACE.smirk = { eye: ["lid", "lid"], brow: [3, -3], mouth: "smirk" };
FACE.sheepish = { eye: ["happy", "lid"], brow: [-3, 2], mouth: "wave" };

const KH_GOLD = "#ffd23f", KH_RUBY = "#d62839", KH_KRAMA_RED = "#b52632", KH_KRAMA_BLUE = "#24529e";
const KH_TEAL = "#1f8a70", KH_TANGERINE = "#f58f22", KH_PLUM = "#54235c";

export const ELDEST_ROLES = {
  bigSib: {
    // You ("បងធំ"): Emerald-teal collared shirt, dark navy shorts, maroon checkered Krama belt
    skin: "#d89666", top: KH_TEAL, trim: "#fff1bd", shorts: "#263547", krama: KH_KRAMA_RED,
    hair: "olderMessy", hairCol: "#1c1413", isKid: false, isMom: false,
  },
  littleBro: {
    // Mischievous younger brother ("ប្អូនកំពូលសម្តែង"): Sunny tangerine shirt, cobalt shorts, indigo Krama
    skin: "#e09f70", top: KH_TANGERINE, trim: "#ffe875", shorts: "#234e80", krama: KH_KRAMA_BLUE,
    hair: "rascalSpike", hairCol: "#211615", isKid: true, isMom: false,
  },
  mom: {
    // Khmer Village / Superhero Mother ("ម៉ែកំពូលវីរបុរស"): Magenta floral blouse, royal plum Sampot Samloy, neat bun
    skin: "#dca072", top: "#cc3f73", trim: "#ffe8f0", sampot: KH_PLUM, sampotTrim: "#f0be37", krama: KH_KRAMA_RED,
    hair: "momBun", hairCol: "#1b1313", isKid: false, isMom: true,
  },
};

/** Helper: Delicious Khmer Banana-Leaf Cakes & Golden Sweets (នំគម / នំកង / នំផ្លែអាយ) */
const drawKhmerSnackTray = (p, sx, sy, u, sc = 1.0) => {
  p.ell(sx, sy + 6 * u * sc, 31 * u * sc, 10.5 * u * sc, "#cfa058", 3.0 * u);
  p.ell(sx, sy + 4 * u * sc, 26 * u * sc, 8 * u * sc, "#44a632", 2.0 * u);
  p.poly([
    [sx - 16 * u * sc, sy + 3 * u * sc],
    [sx - 5 * u * sc, sy - 18 * u * sc],
    [sx + 6 * u * sc, sy + 3 * u * sc],
  ], "#2e8a28", 2.6 * u);
  p.ell(sx + 10 * u * sc, sy - 4 * u * sc, 10.5 * u * sc, 8.5 * u * sc, "#ffd23f", 2.6 * u);
  p.dot(sx + 10 * u * sc, sy - 8 * u * sc, 2.8 * u * sc, "#e63946");
};

/** Helper: Single Golden Khmer Cake in Ninja Bro's Hand! */
const drawSingleCake = (p, sx, sy, u) => {
  p.poly([[sx - 13 * u, sy + 6 * u], [sx, sy - 16 * u], [sx + 13 * u, sy + 6 * u]], "#34962b", 2.8 * u);
  p.ell(sx + 8 * u, sy + 2 * u, 9 * u, 7.5 * u, "#ffd23f", 2.6 * u);
};

/** Helper: Cast Hair + Optional Checkered Khmer Krama Ninja Headband (នីនចាក្រមាខ្មែរ!) */
const drawSiblingHair = (p, O, H, cx, hc, light, thick, ow, u, facing, ninjaMask = false, wv = 0) => {
  const crown = hc - H.b, hCol = O.hairCol || "#1c1413", dir = facing || 1;
  if (O.hair === "momBun") {
    const bunX = cx - dir * H.a * 0.92, bunY = hc + 0.06 * H.b;
    p.ell(bunX, bunY, 25 * u, 22 * u, hCol, ow * 0.80);
    p.dot(bunX + dir * 6 * u, bunY - 8 * u, 6.8 * u, "#ffd23f");
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.05, H.b * 0.72, 176, 364, 0, 40);
    p.shadedFill(cap, hCol, "#0d0909", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
  } else if (O.hair === "rascalSpike") {
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.03, H.b * 0.68, 178, 362, 0, 38);
    p.shadedFill(cap, hCol, "#0d0909", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.80, thick);
    p.poly([
      [cx - dir * 12 * u, crown + 6 * u],
      [cx + dir * 6 * u, crown - 22 * u],
      [cx + dir * 14 * u, crown + 4 * u],
      [cx + dir * 34 * u, crown - 18 * u],
      [cx + dir * 28 * u, crown + 10 * u],
    ], hCol, ow * 0.72);
  } else {
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.04, H.b * 0.70, 178, 362, 0, 40);
    p.shadedFill(cap, hCol, "#0e0a09", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
    p.poly([
      [cx + dir * 4 * u, crown + 4 * u],
      [cx + dir * 22 * u, crown - 17 * u],
      [cx + dir * 18 * u, crown + 6 * u],
      [cx + dir * 36 * u, crown - 9 * u],
      [cx + dir * 28 * u, crown + 14 * u],
    ], hCol, ow * 0.72);
  }

  if (ninjaMask) {
    // Checkered Indigo Khmer Krama Ninja Headband + Fluttering Fringed Tails!
    const by = hc - 0.34 * H.b;
    const kx = cx - dir * (H.a * 0.96);
    const fl = Math.sin(wv * 4.5) * 9 * u;
    p.poly([
      [kx, by],
      [kx - dir * 44 * u, by - 16 * u + fl],
      [kx - dir * 38 * u, by - 2 * u + fl],
    ], KH_KRAMA_BLUE, 3.0 * u);
    p.poly([
      [kx, by + 4 * u],
      [kx - dir * 48 * u, by + 12 * u - fl * 0.7],
      [kx - dir * 34 * u, by + 22 * u - fl * 0.7],
    ], "#fff8f0", 3.0 * u);
    p.band([[cx - H.a * 1.02, by], [cx + H.a * 1.02, by]], KH_KRAMA_BLUE, 16 * u, 2.6 * u, "round");
    for (let i = -3; i <= 3; i++) {
      const sx = cx + i * 14 * u;
      p.poly(rrect(sx - 4 * u, by - 5 * u, sx + 4 * u, by + 5 * u, 1.5 * u), "#ffffff", 0);
    }
    p.dot(cx + dir * 8 * u, by, 5.2 * u, "#ffd23f");
  }
};

/** Helper: Twin Boiling Steam Jets Blasting Out of Both Ears («ខឹងឡើងហុយផ្សែងតាមត្រចៀក»)! */
const drawEarSteamJets = (p, cx, hc, H, u, wv = 0) => {
  const pulse = 0.88 + 0.16 * Math.sin(wv * 5.0);
  // Hot red flushed cheeks + comic anger cross-vein on temple!
  p.ell(cx - 24 * u, hc + 10 * u, 11 * u, 7.5 * u, "#ff4d4d", 0);
  p.ell(cx + 24 * u, hc + 10 * u, 11 * u, 7.5 * u, "#ff4d4d", 0);
  const vx = cx + 26 * u, vy = hc - 28 * u;
  p.stroke([[vx - 8 * u, vy - 3 * u], [vx - 2 * u, vy - 3 * u], [vx - 2 * u, vy - 9 * u]], 2.8 * u, "#ff2a2a");
  p.stroke([[vx + 8 * u, vy + 3 * u], [vx + 2 * u, vy + 3 * u], [vx + 2 * u, vy + 9 * u]], 2.8 * u, "#ff2a2a");

  for (const side of [-1, 1]) {
    const ex = cx + side * (H.a * 0.98), ey = hc - 2 * u;
    // Jet cone + 3 expanding billowy white steam puffs kept strictly inside 600-wide card bounds!
    p.poly([
      [ex, ey - 4.5 * u],
      [ex + side * 28 * u * pulse, ey - 14 * u],
      [ex + side * 28 * u * pulse, ey + 7 * u],
      [ex, ey + 4.5 * u],
    ], "#f2f6fa", 2.6 * u);
    for (let k = 0; k < 3; k++) {
      const dist = (24 + k * 19) * u * pulse;
      const lift = -k * 7 * u + Math.sin(wv * 6 + k + side) * 3.5 * u;
      const radP = (10.5 + k * 5.0) * u;
      p.ell(ex + side * dist, ey - 4 * u + lift, radP * 1.12, radP, "#ffffff", 2.8 * u);
    }
  }
};

/** Helper: Sparkling Waterfall Tears */
const drawCryStreams = (p, cx, hc, W, facing, wv = 0) => {
  const u = W / 100, fx = cx + 7 * u * facing;
  for (const side of [-1, 1]) {
    const ex = fx + side * 13 * u, ey = hc + 4 * u;
    const wig = Math.sin(wv * 3.5 + side) * 3.5 * u;
    p.poly([
      [ex - 4.5 * u, ey],
      [ex + 4.5 * u, ey],
      [ex + side * 16 * u + wig, ey + 48 * u],
      [ex + side * 4 * u + wig, ey + 52 * u],
    ], "#66d2ff", 2.2 * u);
    const dy = ((wv * 14 + (side > 0 ? 6 : 0)) % 20) * u;
    p.ell(ex + side * 24 * u + wig, ey + 16 * u + dy, 6 * u, 4 * u, "#8ce0ff", 2.0 * u, 0, 360, side * 28);
  }
};

/** Dedicated Custom Pose: Little Bro Sprawled Flat on Khmer Floor Tiles Wailing Like Murder («ដួលតូងទៅលើឥដ្ឋ ហើយស្រែកយំដូចគេចាក់ក»)! */
const drawFloorFlopBro = (p, O, opts = {}) => {
  const { wv = 0, crying = true } = opts;
  const light = rad(-115), thick = thickAngle(light), skin = O.skin;
  const thrash = Math.sin(wv * 5.5) * 10;
  p.rot = null;

  // Impact dust halo underneath sprawled body on the tiles (centered inside 0..600 card!)
  p.ell(290, 942, 188, 30, "rgba(255,244,214,0.55)", 0);

  const legCol = mix(skin, INK, 0.20), armCol = mix(skin, INK, 0.16);
  // Kicking legs splayed up in melodramatic agony!
  p.stroke(curve([222, 895], [164, 855 - thrash], [122, 875 - thrash]), 18, legCol);
  p.ell(114, 872 - thrash, 18, 10, "#2c82c9", 5.5, 0, 360, -25);
  p.stroke(curve([244, 902], [186, 918 + thrash], [138, 938 + thrash * 0.6]), 18, legCol);
  p.ell(130, 940 + thrash * 0.6, 18, 10, "#2c82c9", 5.5, 0, 360, 15);

  // Cobalt shorts sideways on floor
  const sh = [[202, 862], [272, 862], [272, 928], [202, 928]];
  p.shadedFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light, 46, 0.4);
  p.inkRing(sh, 8.5, thick);

  // Sprawled tangerine torso + checkered indigo Krama belt
  const body = ellPts(304, 894, 68, 46, 0, 360, -6, 40);
  p.shadedFill(body, O.top, mul(O.top, SH_CLOTH), light, 68, 0.4);
  p.clip(body, () => {
    p.band([[262, 845], [262, 945]], O.krama, 18, 2.2);
  });
  p.inkRing(body, 9.0, thick);

  // Flailing dramatic arms thrown upward!
  p.stroke(curve([320, 868], [300, 808 + thrash], [274, 775 + thrash]), 15, armCol);
  p.dot(274, 775 + thrash, 14, skin);
  p.stroke(curve([344, 908], [402, 875 - thrash], [442, 842 - thrash]), 15, armCol);
  p.dot(442, 842 - thrash, 14, skin);

  // Big Bean Head resting tilted back at x = 394 (plenty of right margin for tear fountains!)
  const H = headBlob(9, 102, -1), W = 2 * H.a, u = W / 100;
  const hx = 394, hy = 846;
  const hp = blobPts(hx, hy, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawSiblingHair(p, O, H, hx, hy, light, thick, 9.5, u, -1, false, wv);
  faceFront(p, hx, hy, W, "megaWail", -1, 0, 0, false, skin, undefined, false);
  dmouth(p, hx - 8 * u, hy + 16 * u, 22 * u, 18 * u, u, true);

  if (crying) {
    // Twin high-arcing fountain geysers of tears kept 100% inside 0..600 card!
    for (const side of [-1, 1]) {
      const ex = hx - 6 * u + side * 13 * u, ey = hy - 2 * u;
      const arcPts = curve([ex, ey], [ex + side * 34 * u, ey - 90 * u], [ex + side * 68 * u, ey - 22 * u + Math.sin(wv * 5 + side) * 8 * u]);
      p.band(arcPts, "#63d2ff", 10.5 * u, 2.2 * u, "round");
      for (let k = 1; k <= 3; k++) {
        p.ell(ex + side * (24 + k * 18) * u, ey - (80 - k * 17) * u, 6.0 * u, 4.2 * u, "#9be8ff", 2.0 * u);
      }
    }
  }
};

/** Main Khmer Household Cast Renderer */
export const khmerSiblingChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? ELDEST_ROLES[key] : key;
  if (opts.mode === "floorFlopCry") return drawFloorFlopBro(p, O, opts);

  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, sprint = false, ninjaCreep = false, wv = 0,
    crying = false, earSteam = false, sweat = false, sweatSpray = false,
    ninjaMask = false, snackTray = false, stolenCake = false, schoolBook = false,
    riceLadle = false, superKramaCape = false, browWiggle = false, fakeSingleTear = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN, dir = facing || 1;
  const headR = O.isKid ? 108 : (O.isMom ? 113 : 115);
  const H = headBlob(seed, headR, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.isKid ? 0.94 : (O.isMom ? 1.10 : 1.07);
  const legsL = O.isKid ? 1.14 : (O.isMom ? 1.32 : 1.33);
  const sole = 975;
  const crouchDrop = ninjaCreep ? 0.14 * HH : 0;
  const runBounce = sprint ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.14 * HH
    : (step ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.05 * HH : 0);
  const torsoBot = sole - legsL * HH - bob * HH - runBounce + crouchDrop;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(skin, INK, 0.22), armCol = mix(skin, INK, 0.17);

  p.rot = null;

  // ---- 0. Optional Billowing Superhero Checkered Krama Cape Behind Mom («ដូចកំពូលវីរបុរស»)! ----
  if (superKramaCape) {
    const fl1 = Math.sin(wv * 4.5) * 18 * u, fl2 = Math.cos(wv * 4.0) * 14 * u;
    const cape = [
      [cx - 34 * u, chin + 8 * u],
      [cx + 34 * u, chin + 8 * u],
      [cx + 118 * u - dir * 28 * u + fl1, sole - 55 * u],
      [cx + fl2, sole - 32 * u],
      [cx - 122 * u - dir * 32 * u + fl1, sole - 62 * u],
    ];
    p.shadedFill(cape, KH_KRAMA_RED, "#6e1119", light, 130 * u, 0.4);
    p.clip(cape, () => {
      for (let i = -4; i <= 4; i++) {
        p.stroke([[cx + i * 28 * u, chin], [cx + i * 34 * u + fl1 * 0.5, sole]], 11 * u, "rgba(255,248,238,0.48)");
      }
      for (let y = chin + 35 * u; y < sole - 35 * u; y += 38 * u) {
        p.stroke([[cx - 150 * u, y], [cx + 150 * u, y]], 10 * u, "rgba(255,248,238,0.48)");
      }
    });
    p.inkRing(cape, ow * 0.92, thick);
  }

  // ---- 1. Legs & Flip-Flops ----
  for (const side of [-1, 1]) {
    const ph = step + (side > 0 ? 0.5 : 0);
    if (sprint) {
      const swing = Math.sin(Math.PI * 2 * ph);
      const hx = cx + side * 14 * u;
      const fx = cx + swing * 62 * u * dir;
      const fy = sole - 12 * u - Math.max(0, Math.cos(Math.PI * 2 * ph)) * 46 * u;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + dir * 14 * u, (hipY + fy) / 2 - 10 * u], [fx, fy]), 5.8 * u, legCol);
      p.stroke([[fx - 6 * u, fy], [fx + dir * 16 * u, fy - 3 * u]], 7.2 * u + 3, INK);
      p.stroke([[fx - 6 * u, fy], [fx + dir * 16 * u, fy - 3 * u]], 7.2 * u, "#2c82c9");
    } else if (ninjaCreep) {
      const swing = Math.sin(Math.PI * 2 * ph) * 30 * u * dir;
      const lift = Math.max(0, Math.sin(Math.PI * 2 * ph)) * 32 * u;
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u + swing, fy = sole - 5 * u - lift;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + dir * 22 * u, (hipY + fy) / 2 + 6 * u], [fx, fy]), 5.8 * u, legCol);
      p.stroke([[fx - 4 * u, fy], [fx + dir * 15 * u, fy]], 7.2 * u + 3, INK);
      p.stroke([[fx - 4 * u, fy], [fx + dir * 15 * u, fy]], 7.2 * u, "#2c82c9");
    } else {
      const swing = step ? Math.sin(Math.PI * 2 * ph) * 20 * u * dir : 0;
      const up = Math.max(0, Math.sin(Math.PI * 2 * ph)) * 22 * (step ? 1 : 0);
      const hx = cx + side * 16 * u, fx = cx + side * 20 * u + swing, fy = sole - 4 * u - up;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.6 * u, legCol);
      const shoeCol = O.isMom ? "#8c2f52" : (O.isKid ? "#2c82c9" : KH_TEAL);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.2 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.2 * u, shoeCol);
    }
  }

  // ---- 2. Torso + Shorts / Sampot Samloy + Checkered Krama ----
  const lean = (sprint ? dir * 12 : 0) + (ninjaCreep ? dir * 16 : 0);
  p.rot = (tilt + lean) ? [rad(tilt + lean), cx, hipY] : null;
  const T = {
    a: (0.40 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "run": {
        const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
        return { pts: [s, [X(16), s[1] + 0.26 * HH], [tcx + sw * 44 * u * dir, s[1] + (0.10 - sw * 0.22) * HH]], front: side * dir > 0 };
      }
      case "ninjaHands": {
        const wig = Math.sin(wv * 4 + side) * 6 * u;
        return { pts: [s, [tcx + dir * 24 * u, s[1] + 0.20 * HH], [tcx + dir * (44 + side * 10) * u, s[1] - 0.02 * HH + wig]], front: true };
      }
      case "grabHair": // Reaching high forward to yank bigSib's hair!
        return { pts: [s, [tcx + dir * 36 * u, s[1] - 0.24 * HH], [tcx + dir * 68 * u, s[1] - 0.58 * HH + Math.sin(wv * 5) * 5 * u]], front: true };
      case "slapBack": // Big open-palm swing onto bigSib's back!
        return { pts: [s, [tcx + dir * 34 * u, s[1] + 0.02 * HH], [tcx + dir * 72 * u, s[1] + 0.10 * HH]], front: true };
      case "gentleTap": // Feather-light 1-finger gentle push («រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ»)!
        return { pts: [s, [tcx + dir * 26 * u, s[1] + 0.18 * HH], [tcx + dir * 56 * u, s[1] + 0.12 * HH]], front: true };
      case "plead": { // Frantic explaining with both palms open!
        const py = Math.sin(wv * 5 + side) * 10 * u;
        return { pts: [s, [X(22), s[1] + 0.22 * HH], [X(42), s[1] - 0.12 * HH + py]], front: true };
      }
      case "ladleHero": // Superhero Mom thrusting wooden rice ladle skyward / pointing!
        return { pts: [s, [X(24), s[1] - 0.28 * HH], [X(38), s[1] - 0.78 * HH]], front: true };
      case "pointScold": // Mom pointing sternly at bigSib!
        return { pts: [s, [tcx + dir * 28 * u, s[1] - 0.04 * HH], [tcx + dir * 68 * u, s[1] - 0.14 * HH + Math.sin(wv * 4) * 4 * u]], front: true };
      case "wipeTear": // Fake rubbing eye behind Mom's back!
        return { pts: [s, [X(22), s[1] - 0.08 * HH], [tcx + side * 14 * u + dir * 8 * u, hc + 4 * u]], front: true };
      case "teaseThumb": // Cheeky taunt wave while wiggling eyebrows!
        return { pts: [s, [X(26), s[1] - 0.04 * HH], [X(46), s[1] - 0.34 * HH + Math.sin(wv * 6) * 8 * u]], front: true };
      case "holdFront":
        return { pts: [s, [X(18), s[1] + 0.30 * HH], [tcx + side * 14 * u + dir * 16 * u, torsoBot - 0.38 * HH]], front: true };
      case "headGrab": // Grabbing own yanked head / shocked temples!
        return { pts: [s, [X(28), s[1] - 0.22 * HH], [tcx + side * 34 * u, hc - 8 * u]], front: true };
      case "fists": // Steaming mad clenched fists at sides!
        return { pts: [s, [X(24), s[1] + 0.24 * HH], [X(28), torsoBot - 0.22 * HH + Math.sin(wv * 6) * 4 * u]], front: true };
      case "sampheah":
        return { pts: [s, [X(16), s[1] + 0.40 * HH], [tcx + side * 4 * u, chin + 0.42 * HH]], front: true };
      case "wave":
        return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "shrug":
        return { pts: [s, [X(24), s[1] + 0.26 * HH], [X(48), s[1] - 0.06 * HH]], front: false };
      case "hip":
        return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.25 * HH]], front: false };
      default:
        return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const defaultPoseL = sprint ? "run" : (ninjaCreep && L === "hang" ? "ninjaHands" : L);
  const defaultPoseR = sprint ? "run" : (ninjaCreep && R === "hang" ? "ninjaHands" : R);
  const arms = [arm(-1, defaultPoseL), arm(1, defaultPoseR)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
  };
  for (const a of arms) if (!a.front) drawArm(a);

  if (O.isMom) {
    // Ankle-length Khmer Sampot Samloy wrap skirt with golden ikat hem!
    const skBot = sole - 22 * u;
    const sk = [
      [tcx - 0.92 * T.a, torsoBot - 0.20 * HH],
      [tcx + 0.92 * T.a, torsoBot - 0.20 * HH],
      [tcx + 1.06 * T.a, skBot],
      [tcx - 1.06 * T.a, skBot],
    ];
    p.gradFill(sk, O.sampot, mul(O.sampot, SH_CLOTH), light);
    p.clip(sk, () => {
      p.band([[tcx - 1.2 * T.a, skBot - 14 * u], [tcx + 1.2 * T.a, skBot - 14 * u]], O.sampotTrim, 9 * u, 1.5 * u);
    });
    p.inkRing(sk, ow * 0.88, thick);
  } else {
    const sh = [
      [tcx - 0.94 * T.a, torsoBot - 0.22 * HH], [tcx + 0.94 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.02 * T.a, torsoBot + 0.34 * HH], [tcx, torsoBot + 0.20 * HH], [tcx - 1.02 * T.a, torsoBot + 0.34 * HH],
    ];
    p.gradFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light);
    p.inkRing(sh, ow * 0.85, thick);
  }

  // Shirt / Blouse + Checkered Khmer Krama sash or belt
  p.gradFill(tp, O.top, mul(O.top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.trim) p.ell(tcx + 4 * u * facing, chin + 0.04 * HH, 24 * u, 11 * u, O.trim, 2.2 * u);
    if (O.isMom) {
      p.band([[tcx - 0.7 * T.a, chin + 0.02 * HH], [tcx + 0.6 * T.a, torsoBot]], O.krama, 13 * u, 1.8 * u);
      if (superKramaCape) {
        // Golden Superhero Star Emblem on Mom's Krama sash!
        p.ell(tcx + 4 * u * dir, chin + 0.36 * HH, 16 * u, 16 * u, KH_GOLD, 2.6 * u);
      }
    } else if (O.krama) {
      p.band([[tcx - 1.2 * T.a, torsoBot - 0.16 * HH], [tcx + 1.2 * T.a, torsoBot - 0.16 * HH]], O.krama, 11 * u, 1.8 * u);
      for (let k = -3; k <= 3; k++) {
        p.poly(rrect(tcx + k * 14 * u - 4 * u, torsoBot - 0.16 * HH - 4 * u, tcx + k * 14 * u + 4 * u, torsoBot - 0.16 * HH + 4 * u, 1.5 * u), "#fff8f0", 0);
      }
    }
  });
  p.inkRing(tp, ow, thick);

  for (const a of arms) if (a.front) drawArm(a);

  if (L === "sampheah" && R === "sampheah") {
    const sx = tcx, sy = chin + 0.38 * HH;
    p.poly([[sx - 8 * u, sy + 12 * u], [sx, sy - 16 * u], [sx + 8 * u, sy + 12 * u]], skin, 3.2 * u);
  }

  // ---- 3. Held Story Props ----
  const [lhx, lhy] = arms[0].pts[2];
  const [rhx, rhy] = arms[1].pts[2];

  if (snackTray) {
    drawKhmerSnackTray(p, tcx + dir * 20 * u, torsoBot - 0.38 * HH, u, 1.05);
  }
  if (stolenCake) {
    const [hx, hy] = dir > 0 ? [rhx, rhy] : [lhx, lhy];
    drawSingleCake(p, hx + dir * 10 * u, hy - 6 * u, u);
  }
  if (schoolBook) {
    const bx = tcx + dir * 18 * u, by = torsoBot - 0.38 * HH;
    p.poly(rrect(bx - 24 * u, by - 18 * u, bx + 24 * u, by + 16 * u, 4 * u), "#2e86de", 3.0 * u);
    p.poly(rrect(bx - 20 * u, by - 14 * u, bx + 20 * u, by + 12 * u, 2 * u), "#fffdf5", 2.0 * u);
  }
  if (riceLadle) {
    // Khmer Mom's iconic carved wooden rice ladle (វែកបាយឈើខ្មែរ!)
    const [hx, hy] = (R === "ladleHero" || R === "pointScold") ? [rhx, rhy] : (L === "ladleHero" || L === "pointScold" ? [lhx, lhy] : [rhx, rhy]);
    const tx = hx + dir * 26 * u, ty = hy - 54 * u;
    p.band([[hx, hy], [tx, ty]], "#b87a35", 5.5 * u, 2.0 * u, "round");
    p.ell(tx + dir * 6 * u, ty - 10 * u, 16 * u, 22 * u, "#d99b4e", 3.2 * u, 0, 360, dir * 22);
  }

  // ---- 4. Bean Head, Expressions, Steam Jets & Eyebrow Wiggle! ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt + lean), [cx, hipY]);
  const Ah = tilt + lean + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawSiblingHair(p, O, H, cx, hc, light, thick, ow, u, facing, ninjaMask, wv);

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, undefined, false);

  if (earSteam) {
    drawEarSteamJets(p, cx, hc, H, u, wv);
  }

  if (browWiggle) {
    // Over-the-top animated eyebrow-wiggle taunt clearly visible on forehead skin below hair fringe!
    const fx = cx + 7 * u * facing;
    // Cover default static brows cleanly with skin patch so ONLY the big dancing eyebrows read!
    p.poly(rrect(fx - 26 * u, hc - 23 * u, fx + 26 * u, hc - 8 * u, 4 * u), skin, 0);
    const wL = Math.sin(wv * 7.5) * 5.5 * u;
    const wR = -Math.sin(wv * 7.5) * 5.5 * u;
    p.band([[fx - 23 * u, hc - 13 * u + wL], [fx - 5 * u, hc - 19 * u + wL]], INK, 6.8 * u, 1.4 * u, "round");
    p.band([[fx + 5 * u, hc - 19 * u + wR], [fx + 23 * u, hc - 13 * u + wR]], INK, 6.8 * u, 1.4 * u, "round");
    // Sparkle wink star beside cheek!
    const sx = fx + dir * 30 * u, sy = hc + 2 * u;
    p.poly([[sx, sy - 9 * u], [sx + 3 * u, sy - 3 * u], [sx + 9 * u, sy], [sx + 3 * u, sy + 3 * u], [sx, sy + 9 * u], [sx - 3 * u, sy + 3 * u], [sx - 9 * u, sy], [sx - 3 * u, sy - 3 * u]], "#ffd23f", 2.0 * u);
  }

  if (fakeSingleTear) {
    const fx = cx + 7 * u * facing;
    p.ell(fx - dir * 16 * u, hc + 12 * u, 4.5 * u, 7.5 * u, "#6bd4ff", 2.0 * u);
  }

  if (crying) {
    drawCryStreams(p, cx, hc, W, facing, wv);
  }

  if (sweat || sweatSpray) {
    const sx = cx - dir * 38 * u, sy = hc - 14 * u;
    p.poly([[sx, sy - 15 * u], [sx + 8.5 * u, sy + 4 * u], [sx, sy + 11 * u], [sx - 8.5 * u, sy + 4 * u]], "#74d4ff", 2.5 * u);
    if (sweatSpray) {
      for (const [dx, dy] of [[-52, -32], [-60, -2], [46, -30]]) {
        p.ell(cx - dir * dx * u, hc + dy * u, 5.5 * u, 3.5 * u, "#74d4ff", 2.0 * u, 0, 360, dx > 0 ? 25 : -25);
      }
    }
  }
  p.rot = null;
};

/** Bold Rollo-Style Visual Comic Cards (100% crisp iconography, zero unreadable micro-text!) */
export const drawEldestCard = (p, kind = "guiltyBongGavel", k = 1) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;

  if (kind === "innocentHaloCheck") {
    // Glowing Angel Halo + Crisp Green Shield Checkmark («មិនបានធ្វើអ្វីខុសសោះ!»)
    p.ell(300, 355, 115, 28, "#ffe45e", 9.5);
    p.ell(300, 355, 76, 14, "#ffffff", 6.0);
    const sh = [[185, 420], [415, 420], [402, 545], [300, 615], [198, 545]];
    p.shadedFill(sh, "#2ecc71", "#188a48", light, 125, 0.4);
    p.inkRing(sh, 10.5, thick);
    p.band([[242, 505], [284, 548], [362, 462]], "#ffffff", 22, 4.5, "round");
  } else if (kind === "bornFirstCrown") {
    // Split Birth-Order Card: Tall #1 (Scolded) vs Tiny #2 (Crowned Royal Baby) + "?"
    const box = rrect(125, 345, 475, 605, 30);
    p.shadedFill(box, "#fffdf5", "#dce6f2", light, 175, 0.4);
    p.inkRing(box, 10.5, thick);
    // Tall #1 figure (left, dark storm cloud)
    p.ell(218, 442, 26, 26, KH_TEAL, 6.5);
    p.poly(rrect(190, 474, 246, 568, 12), KH_TEAL, 6.5);
    p.ell(218, 392, 34, 18, "#636e72", 5.5);
    // Tiny #2 figure (right, wearing big golden royal crown!)
    p.ell(378, 482, 22, 22, KH_TANGERINE, 6.5);
    p.poly(rrect(354, 508, 402, 568, 10), KH_TANGERINE, 6.5);
    p.poly([[346, 456], [354, 418], [378, 438], [402, 418], [410, 456]], KH_GOLD, 6.5);
    // Bold "?" in middle
    const g = p.g; g.save();
    g.font = "900 105px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = "#ff3b3b";
    g.strokeText("?", 298, 478); g.fillText("?", 298, 478);
    g.restore();
  } else if (kind === "noPaperScroll") {
    // Unwritten Law: Parchment Scroll + Quill Crossed Out («មិនបាច់សរសេរលើក្រដាស»)
    const ring = ellPts(300, 480, 168, 168, 0, 360, 0, 44);
    p.shadedFill(ring, "#fff8e6", "#e8d5b0", light, 168, 0.4);
    p.inkRing(ring, 11, thick);
    p.poly(rrect(220, 390, 380, 570, 18), "#fffdf7", 8.5);
    p.ell(300, 390, 86, 18, "#e6c994", 7.5);
    p.ell(300, 570, 86, 18, "#e6c994", 7.5);
    for (const ly of [440, 480, 520]) p.stroke([[248, ly], [352, ly]], 7, "#95a5a6");
    p.band([[192, 372], [408, 588]], "#ff2e2e", 26, 5.5, "round");
  } else if (kind === "guiltyBongGavel") {
    // Immortal Khmer House Law: Golden Starburst + Judge Gavel Slamming Red "X" Guilty Block!
    const s = 0.94 + 0.06 * Math.sin(k * 6);
    const rays = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, r = (i % 2 === 0 ? 222 : 168) * s;
      rays.push([300 + Math.cos(a) * r, 480 + Math.sin(a) * r]);
    }
    p.poly(rays, "#ffe566", 10);
    const pad = rrect(155, 455, 445, 595, 24);
    p.shadedFill(pad, "#d62839", "#85121d", light, 145, 0.4);
    p.inkRing(pad, 10.5, thick);
    p.band([[252, 485], [348, 565]], "#ffffff", 20, 4, "round");
    p.band([[348, 485], [252, 565]], "#ffffff", 20, 4, "round");
    // Heavy Wooden Judge Gavel striking down!
    p.band([[305, 415], [435, 335]], "#8c5423", 18, 4.5, "round");
    p.poly(rrect(225, 365, 345, 445, 14), "#a8682c", 9.5);
    p.band([[225, 405], [345, 405]], KH_GOLD, 10, 2.5, "round");
  } else if (kind === "boredIdeaBulb") {
    // Mischievous Glowing Lightbulb with Red Devil/Ninja Horns («ពេលប្អូនអ្នកអផ្សុក!»)
    const bulb = ellPts(300, 455, 98, 102, 0, 360, 0, 40);
    p.shadedFill(bulb, "#ffe94d", "#f5a623", light, 102, 0.4);
    p.inkRing(bulb, 10, thick);
    p.poly(rrect(258, 545, 342, 595, 10), "#95a5a6", 8.5);
    // Cheeky horns on top of bulb!
    p.poly([[225, 385], [195, 315], [262, 358]], "#ff3838", 8);
    p.poly([[375, 385], [405, 315], [338, 358]], "#ff3838", 8);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + (i / 5) * Math.PI;
      p.band([[300 + Math.cos(a) * 128, 445 + Math.sin(a) * 128], [300 + Math.cos(a) * 168, 445 + Math.sin(a) * 168]], "#fff380", 12, 3, "round");
    }
  } else if (kind === "slapPowBurst") {
    // Comic POW Impact Starburst for hair-pull & back-slap!
    const spikes = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + k * 0.2;
      const r = i % 2 === 0 ? 185 : 95;
      spikes.push([300 + Math.cos(a) * r, 480 + Math.sin(a) * r]);
    }
    p.shadedFill(spikes, "#ffeb3b", "#ff3d00", light, 185, 0.4);
    p.inkRing(spikes, 10, thick);
    p.dot(300, 480, 34, "#ffffff");
  } else if (kind === "featherPush") {
    // Delicate Pastel-Pink & White Floating Feather («រុញវាថ្នមៗមួយដៃប៉ុណ្ណោះ...»)
    const bg = ellPts(300, 475, 148, 148, 0, 360, 0, 42);
    p.shadedFill(bg, "#eefaff", "#c5e8fa", light, 148, 0.4);
    p.inkRing(bg, 9.5, thick);
    const sway = Math.sin(k * 4) * 10;
    const fth = ellPts(300, 475 + sway, 105, 42, 0, 360, -28, 36);
    p.shadedFill(fth, "#ffffff", "#ffb8d1", light, 105, 0.4);
    p.inkRing(fth, 8.0, thick);
    p.band([[212, 522 + sway], [388, 428 + sway]], "#ff7aa8", 7, 2, "round");
  } else if (kind === "sirenMegaphone") {
    // Flashing Red Emergency Siren + Soundwave Megaphone («ស្រែកយំដូចគេចាក់ក!»)
    const glow = 0.92 + 0.10 * Math.sin(k * 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + k * 0.3;
      p.band([[300 + Math.cos(a) * 115, 465 + Math.sin(a) * 115], [300 + Math.cos(a) * 185 * glow, 465 + Math.sin(a) * 185 * glow]], "#ff4757", 14, 3, "round");
    }
    const dome = ellPts(300, 495, 86, 105, 180, 360, 0, 32);
    dome.push([386, 525], [214, 525]);
    p.shadedFill(dome, "#ff2e43", "#9e1120", light, 105, 0.4);
    p.inkRing(dome, 10, thick);
    p.ell(275, 445, 18, 34, "#ffdde1", 0, 0, 360, 18);
    p.poly(rrect(192, 522, 408, 568, 12), "#2f3640", 9.5);
  } else if (kind === "threeSecTimer") {
    // Turbo "< 3s" Stopwatch + Lightning Bolt («មិនដល់បីវិនាទីផង!»)
    p.poly(rrect(272, 285, 328, 332, 8), "#f5b935", 8.5);
    const clk = ellPts(300, 480, 158, 158, 0, 360, 0, 44);
    p.shadedFill(clk, "#fffdf7", "#ffd6d6", light, 158, 0.4);
    p.inkRing(clk, 12, thick, 0.45, "#d62839");
    p.inkRing(clk, 10, thick);
    const ang = -Math.PI / 2 + k * 10.0;
    p.band([[300, 480], [300 + Math.cos(ang) * 105, 480 + Math.sin(ang) * 105]], "#ff2e2e", 14, 3.5, "round");
    const g = p.g; g.save();
    g.font = "900 84px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 11; g.strokeStyle = INK; g.fillStyle = "#ff2e2e";
    g.strokeText("<3s", 300, 502); g.fillText("<3s", 300, 502);
    g.restore();
  } else if (kind === "blockedSpeechX") {
    // Pleading Speech Bubble Stamped with Giant Red "X" («ខំពន្យល់យ៉ាងណាក៏គ្មានប្រយោជន៍!»)
    const cl = ellPts(300, 475, 172, 138, 0, 360, 0, 42);
    p.shadedFill(cl, "#fffdf7", "#dce6f2", light, 172, 0.4);
    p.inkRing(cl, 10.5, thick);
    for (const ly of [438, 478, 518]) p.band([[225, ly], [375, ly]], "#576574", 12, 2, "round");
    p.band([[205, 385], [395, 565]], "#ff2929", 28, 5.5, "round");
    p.band([[395, 385], [205, 565]], "#ff2929", 28, 5.5, "round");
  } else if (kind === "unfairScaleVerdict") {
    // Unfair Sibling Scale: Tiny Baby Crown Outweighs Eldest Sibling («ឯងជាបង ម៉េចមិនចេះយោគយល់ប្អូន?»)
    const bg = ellPts(300, 480, 176, 152, 0, 360, 0, 44);
    p.shadedFill(bg, "#fff6db", "#f2cf72", light, 176, 0.4);
    p.inkRing(bg, 10.5, thick);
    p.band([[300, 365], [300, 575]], "#8c5624", 16, 4, "round");
    p.poly(rrect(235, 565, 365, 595, 10), "#8c5624", 8);
    // Tilted beam: right (little bro crown) heavy down, left (big sib) tossed up!
    p.band([[185, 415], [415, 495]], KH_GOLD, 14, 4, "round");
    p.ell(195, 452, 42, 18, KH_TEAL, 6.5);
    p.ell(405, 535, 48, 20, KH_TANGERINE, 6.5);
    p.poly([[375, 522], [385, 486], [405, 504], [425, 486], [435, 522]], "#ffd23f", 6.5);
  } else if (kind === "oscarTrophyMask") {
    // Gleaming Golden Oscar / Twin Drama Masks Trophy («ប្អូនកំពូលសម្តែង!»)
    const rays = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, r = i % 2 === 0 ? 195 : 142;
      rays.push([300 + Math.cos(a) * r, 475 + Math.sin(a) * r]);
    }
    p.poly(rays, "#fff3a1", 9.5);
    // Golden Trophy Cup + Pedestal!
    p.poly([[225, 365], [375, 365], [348, 492], [252, 492]], "#ffd23f", 10);
    p.band([[300, 492], [300, 548]], "#e0a81e", 22, 4.5, "round");
    p.poly(rrect(232, 542, 368, 588, 12), "#6e3b1e", 9.5);
    // Cheeky wink star on cup
    p.arc(278, 415, 14, 10, 200, 340, 6, INK);
    p.arc(322, 415, 14, 10, 200, 340, 6, INK);
    p.arc(300, 448, 26, 16, 15, 165, 6.5, INK);
  } else if (kind === "likeAndCommentCTA") {
    // Crisp Blue Thumbs-Up Like + Gold Comment Speech Bubble («ចុចឡៃ និងខមិនប្រាប់ផង!»)
    const lk = rrect(105, 390, 325, 568, 34);
    p.shadedFill(lk, "#2986f5", "#1752a6", light, 110, 0.4);
    p.inkRing(lk, 10.5, thick);
    p.poly(rrect(145, 472, 182, 538, 8), "#ffffff", 6.5);
    p.poly([[186, 472], [212, 416], [236, 420], [230, 462], [285, 462], [276, 538], [186, 538]], "#ffffff", 6.5);

    const cm = rrect(285, 250, 505, 420, 32);
    p.shadedFill(cm, "#ffd23f", "#cf9619", light, 110, 0.4);
    p.inkRing(cm, 10.5, thick);
    for (const cxDot of [345, 395, 445]) p.dot(cxDot, 335, 14, "#ffffff");
  }
};

/** Radial Comic Shock / Superhero Burst Rays */
export const drawBurstRays = (p, k = 0, colA = "#ffd23f", colB = "#ff4757") => {
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + k * 0.35;
    p.stroke([
      [300 + Math.cos(a) * 145, 450 + Math.sin(a) * 145],
      [300 + Math.cos(a) * 225, 450 + Math.sin(a) * 225],
    ], 11, i % 2 ? colA : colB);
  }
};

/** Walking / Sprinting / Floor-Flop Dust Puffs */
export const fxDust = (p, k, col = "#f2cfa8") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 75 + 140 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.6, 95 + 45 * k, 78 + 38 * k, col, 10);
  }
  p.ell(300, 540, 135 + 85 * k, 105 + 60 * k, col, 0);
  g.restore();
};
