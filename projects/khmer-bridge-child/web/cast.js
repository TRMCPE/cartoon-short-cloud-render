// ---------------- Khmer Family Cast, Krama Bundle, Under-Bridge Baby & Rollo Visual Cards (built on toonbase.js Pen) ----------------
FACE.ultraSerious = { eye: ["slit", "slit"], brow: [5, -1], mouth: "frown" };
FACE.scheming = { eye: ["lid", "lid"], brow: [5, -4], mouth: "smirk" };
FACE.angryHungry = { eye: ["lid", "lid"], brow: [6, -3], mouth: "teeth" };
FACE.gullible = { eye: ["shock", "shock"], brow: [-6, -5], mouth: "o" };
FACE.wailCry = { eye: ["squeeze", "squeeze"], brow: [-5, 4], mouth: "O" };
FACE.panic = { eye: ["shock", "shock"], brow: [-7, -5], mouth: "wave" };
FACE.fierceMom = { eye: ["slit", "slit"], brow: [7, -4], mouth: "teeth" };
FACE.lovingMom = { eye: ["happy", "happy"], brow: [-2, -1], mouth: "smileWide" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smileWide" };
FACE.happySnack = { eye: ["happy", "happy"], brow: [-3, -2], mouth: "laugh" };
FACE.sheepish = { eye: ["happy", "lid"], brow: [-3, 2], mouth: "wave" };

const KH_GOLD = "#ffd23f", KH_RUBY = "#c92438", KH_KRAMA_RED = "#b52632", KH_KRAMA_BLUE = "#26529c";
const KH_KRAMA_GREEN = "#236e42", KH_NAVY = "#2b3a52", KH_SKY = "#2e8ae6";

export const BRIDGE_ROLES = {
  olderBro: {
    skin: "#d89666", top: "#bf2c3b", trim: "#ffd23f", shorts: KH_NAVY, krama: KH_KRAMA_RED,
    hair: "spiky", hairCol: "#1c1413", isKid: false, isTiny: false, isMom: false,
  },
  youngerBro: {
    skin: "#de9d6e", top: KH_SKY, trim: "#ffe066", shorts: "#274c6b", krama: KH_KRAMA_BLUE,
    hair: "tousled", hairCol: "#211716", isKid: true, isTiny: false, isMom: false,
  },
  grownYou: {
    // Kid You grown up to Teen Older-Bro height! Keeps signature Sky-Blue shirt & Indigo Krama so viewer recognizes him instantly!
    skin: "#db9969", top: "#2276d4", trim: "#ffe066", shorts: "#23364f", krama: KH_KRAMA_BLUE,
    hair: "tousledTall", hairCol: "#1e1514", isKid: false, isTiny: false, isMom: false,
  },
  youngestBro: {
    // Adorable chubby youngest sibling (ប្អូនពៅ)!
    skin: "#e3a476", top: "#34b356", trim: "#fff078", shorts: "#d98b2b", krama: KH_KRAMA_GREEN,
    hair: "babyCurl", hairCol: "#221817", isKid: true, isTiny: true, isMom: false,
  },
  mom: {
    // Authentic Khmer Village Mother: Dusty-rose floral cotton blouse, deep plum patterned Sampot Samloy, neat low bun!
    skin: "#dca072", top: "#d96285", trim: "#ffe6ee", sampot: "#6b2348", sampotTrim: "#e8b838", krama: KH_KRAMA_RED,
    hair: "momBun", hairCol: "#1c1414", isKid: false, isTiny: false, isMom: true,
  },
};

/** Helper: Draw crisp checkered Khmer Krama cloth pouch (បង្វេចក្រមា!) */
const drawKramaBundle = (p, bx, by, r, u, col = KH_KRAMA_RED, light = rad(-120), thick = 1.1) => {
  const bag = ellPts(bx, by, r * 1.08, r * 0.96, 0, 360, -6, 36);
  p.shadedFill(bag, "#fff8ef", "#dfd5c7", light, r * 1.08, 0.4);
  p.clip(bag, () => {
    const step = r * 0.42;
    for (let i = -3; i <= 3; i++) {
      p.stroke([[bx + i * step, by - r * 1.2], [bx + i * step, by + r * 1.2]], step * 0.52, col);
      p.stroke([[bx - r * 1.2, by + i * step], [bx + r * 1.2, by + i * step]], step * 0.52, col);
    }
  });
  p.inkRing(bag, 3.8 * u, thick);
  // Top bunny-ear Krama knot!
  const ky = by - r * 0.88;
  p.poly([[bx - 4 * u, ky + 4 * u], [bx - 22 * u, ky - 22 * u], [bx - 8 * u, ky - 26 * u], [bx + 2 * u, ky]], col, 3.0 * u);
  p.poly([[bx + 4 * u, ky + 4 * u], [bx + 22 * u, ky - 20 * u], [bx + 8 * u, ky - 25 * u], [bx - 2 * u, ky]], "#fff8ef", 3.0 * u);
  p.ell(bx, ky, 9 * u, 7 * u, col, 3.0 * u);
};

/** Helper: Draw delicious golden Khmer cakes & banana-leaf treats (នំខ្មែរ / នំអន្សម / នំគម) */
const drawKhmerSnacks = (p, sx, sy, u, big = false) => {
  const sc = big ? 1.32 : 1.0;
  // Woven bamboo / green banana-leaf platter
  p.ell(sx, sy + 6 * u * sc, 32 * u * sc, 11 * u * sc, "#c99b52", 3.2 * u);
  p.ell(sx, sy + 4 * u * sc, 27 * u * sc, 8.5 * u * sc, "#46a832", 2.2 * u);
  // Pyramid green banana-leaf Num Kom + golden sweet cakes!
  p.poly([
    [sx - 18 * u * sc, sy + 3 * u * sc],
    [sx - 7 * u * sc, sy - 19 * u * sc],
    [sx + 4 * u * sc, sy + 3 * u * sc],
  ], "#328a28", 2.8 * u);
  p.ell(sx + 10 * u * sc, sy - 4 * u * sc, 11 * u * sc, 9 * u * sc, "#ffd23f", 2.8 * u);
  p.dot(sx + 10 * u * sc, sy - 9 * u * sc, 3.0 * u * sc, "#e63b4a");
  if (big) {
    p.ell(sx - 2 * u * sc, sy - 12 * u * sc, 10 * u * sc, 8 * u * sc, "#ff9f2e", 2.6 * u);
    for (const [dx, dy] of [[-26, -24], [26, -22], [2, -32]]) {
      p.dot(sx + dx * u, sy + dy * u, 3.6 * u, "#fff394");
    }
  }
};

/** Helper: Draw Hair + Optional Traditional Khmer Conical Palm Hat (ដួន) */
const drawCastHair = (p, O, H, cx, hc, light, thick, ow, u, facing, duonHat = false) => {
  const crown = hc - H.b, hCol = O.hairCol || "#1e1615", dir = facing || 1;
  if (O.hair === "momBun") {
    // Neat Khmer village mother hair cap + low side bun (បួងសក់) with flower pin!
    const bunX = cx - dir * H.a * 0.92, bunY = hc + 0.08 * H.b;
    p.ell(bunX, bunY, 24 * u, 22 * u, hCol, ow * 0.80);
    p.dot(bunX + dir * 6 * u, bunY - 8 * u, 6.5 * u, "#ffd23f");
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.05, H.b * 0.72, 176, 364, 0, 40);
    p.shadedFill(cap, hCol, "#0d0909", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
  } else if (O.hair === "babyCurl") {
    const cap = ellPts(cx, hc - 0.42 * H.b, H.a * 0.98, H.b * 0.62, 184, 356, 0, 36);
    p.shadedFill(cap, hCol, "#0e0a09", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.78, thick);
    p.poly([
      [cx - 6 * u, crown + 4 * u],
      [cx + dir * 14 * u, crown - 22 * u],
      [cx + dir * 24 * u, crown - 4 * u],
      [cx + dir * 8 * u, crown + 8 * u],
    ], hCol, ow * 0.72);
  } else {
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.04, H.b * 0.70, 178, 362, 0, 40);
    p.shadedFill(cap, hCol, "#0e0a09", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
    if (O.hair === "spiky") {
      p.poly([
        [cx - dir * 16 * u, crown + 6 * u],
        [cx + dir * 10 * u, crown - 22 * u],
        [cx + dir * 14 * u, crown + 4 * u],
        [cx + dir * 36 * u, crown - 16 * u],
        [cx + dir * 30 * u, crown + 8 * u],
        [cx + dir * 48 * u, crown - 4 * u],
        [cx + dir * 34 * u, crown + 16 * u],
      ], hCol, ow * 0.72);
    } else {
      const sp = O.hair === "tousledTall" ? 1.18 : 1.0;
      p.poly([
        [cx + dir * 6 * u, crown + 4 * u],
        [cx + dir * 24 * u * sp, crown - 16 * u * sp],
        [cx + dir * 20 * u, crown + 6 * u],
        [cx + dir * 38 * u * sp, crown - 8 * u * sp],
        [cx + dir * 28 * u, crown + 14 * u],
      ], hCol, ow * 0.72);
    }
  }

  if (duonHat) {
    // Authentic Cambodian woven palm conical hat (ដួន) worn on bridge walk!
    const hy = crown + 8 * u;
    const cone = [
      [cx - 86 * u, hy + 10 * u],
      [cx, hy - 54 * u],
      [cx + 86 * u, hy + 10 * u],
    ];
    p.shadedFill(cone, "#e2c383", "#b38f4d", light, 86 * u, 0.4);
    p.inkRing(cone, 3.8 * u, thick);
    p.stroke([[cx - 52 * u, hy - 14 * u], [cx + 52 * u, hy - 14 * u]], 2.2 * u, "#8f6d34");
    p.stroke([[cx - 28 * u, hy - 32 * u], [cx + 28 * u, hy - 32 * u]], 2.2 * u, "#8f6d34");
  }
};

/** Helper: Draw Sparkling Cartoon Waterfall Tears (យំសស្រាក់!) */
const drawWaterfallTears = (p, cx, hc, W, facing, wv = 0) => {
  const u = W / 100, fx = cx + 7 * u * facing;
  for (const side of [-1, 1]) {
    const ex = fx + side * 13 * u, ey = hc + 4 * u;
    const wig = Math.sin(wv * 3 + side) * 3 * u;
    const stream = [
      [ex - 4 * u, ey],
      [ex + 4 * u, ey],
      [ex + side * 14 * u + wig, ey + 46 * u],
      [ex + side * 3 * u + wig, ey + 50 * u],
    ];
    p.poly(stream, "#6bd4ff", 2.2 * u);
    // Flying tear droplets!
    const dy = ((wv * 12 + (side > 0 ? 5 : 0)) % 18) * u;
    p.ell(ex + side * (22 * u) + wig, ey + 18 * u + dy, 5.5 * u, 3.8 * u, "#8ce0ff", 2.0 * u, 0, 360, side * 28);
  }
};

/** Special Comedic Pose: Older Brother Kneeling on the Ground Desperately Hugging Younger Bro's Leg (រត់ទៅឱបជើងប្អូន!) */
const drawKneelingHugBro = (p, O, opts) => {
  const { wv = 0, expr = "panic", blink = 0, facing = 1 } = opts;
  const dir = facing || 1;
  const light = rad(-115), thick = thickAngle(light), skin = O.skin;
  const lid = lidOf(blink);
  const bob = Math.sin(wv * 3.0) * 5;
  p.rot = null;

  const legCol = mix(skin, INK, 0.20), armCol = mix(skin, INK, 0.16);
  // Kneeling shins folded back on ground (soles near y = 965)
  p.stroke(curve([300 - dir * 24, 888], [300 - dir * 88, 956], [300 - dir * 148, 952]), 20, legCol);
  p.ell(300 - dir * 156, 946, 12, 22, "#b52632", 6, 0, 360, dir * 15);

  // Shorts
  const sh = [
    [300 - dir * 64, 845], [300 + dir * 26, 855],
    [300 + dir * 18, 922], [300 - dir * 78, 916],
  ];
  p.shadedFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light, 52, 0.4);
  p.inkRing(sh, 8.5, thick);

  // Forward-leaning begging maroon torso + Krama belt
  const body = ellPts(300 - dir * 8, 795 + bob * 0.4, 58, 76, 0, 360, dir * 22, 40);
  p.shadedFill(body, O.top, mul(O.top, SH_CLOTH), light, 72, 0.4);
  p.clip(body, () => {
    p.band([[230, 835], [370, 845]], O.krama, 22, 2.5);
  });
  p.inkRing(body, 9.2, thick);

  // Bean Head low at y = 668 looking pleadingly UP toward Younger Bro!
  const H = headBlob(5, 102, dir), W = 2 * H.a, u = W / 100;
  const hx = 300 + dir * 26, hy = 662 + bob;
  const hp = blobPts(hx, hy, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawCastHair(p, O, H, hx, hy, light, thick, 9.5, u, dir, false);
  faceFront(p, hx, hy, W, expr, dir, 0, lid, false, skin, undefined, false);
  drawWaterfallTears(p, hx, hy, W, dir, wv);

  // Both arms stretched far forward clinging tightly around Younger Bro's shin!
  const reachX = 300 + dir * 128;
  p.stroke(curve([300 + dir * 18, 756 + bob * 0.5], [300 + dir * 78, 786], [reachX, 798 + bob * 0.4]), 14, armCol);
  p.stroke(curve([300 + dir * 12, 792 + bob * 0.5], [300 + dir * 74, 832], [reachX, 836 + bob * 0.4]), 14, armCol);
  p.dot(reachX, 798 + bob * 0.4, 13, skin);
  p.dot(reachX, 836 + bob * 0.4, 13, skin);
};

/** Main Character Renderer: Standing, Walking, Sprinting, Crying, Bundle-Carrying, Baby-Cradling */
export const khmerBridgeChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? BRIDGE_ROLES[key] : key;
  if (opts.mode === "hugLeg") return drawKneelingHugBro(p, O, opts);

  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 2,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, sprint = false, wv = 0,
    crying = false, sweat = false, sweatSpray = false,
    snackPlate = false, bigSnackBribe = false,
    bundleStick = false, tyingBundle = false, rummageClothes = false,
    babyBundle = false, rattanCane = false, duonHat = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN, dir = facing || 1;
  const headR = O.isTiny ? 100 : (O.isKid ? 108 : (O.isMom ? 112 : 116));
  const H = headBlob(seed, headR, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.isTiny ? 0.80 : (O.isKid ? 0.95 : (O.isMom ? 1.10 : 1.08));
  const legsL = O.isTiny ? 0.94 : (O.isKid ? 1.16 : (O.isMom ? 1.32 : 1.34));
  const sole = 975;
  const runBounce = sprint ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.14 * HH
    : (step ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.045 * HH : 0);
  const torsoBot = sole - legsL * HH - bob * HH - runBounce;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(skin, INK, 0.22), armCol = mix(skin, INK, 0.17);

  p.rot = null;

  // ---- 1. Legs & Flip-Flops (or Long Khmer Sampot Samloy for Mom!) ----
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
    } else {
      const swing = step ? Math.sin(Math.PI * 2 * ph) * 20 * u * dir : 0;
      const up = Math.max(0, Math.sin(Math.PI * 2 * ph)) * 22 * (step ? 1 : 0);
      const hx = cx + side * 16 * u, fx = cx + side * 20 * u + swing, fy = sole - 4 * u - up;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.6 * u, legCol);
      const shoeCol = O.isMom ? "#8c3852" : (O.isTiny ? "#e69d24" : (O.isKid ? "#2c82c9" : "#b52632"));
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.2 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.2 * u, shoeCol);
    }
  }

  // ---- 2. Torso + Shorts / Sampot Samloy + Checkered Krama ----
  const runLean = sprint ? dir * 12 : 0;
  p.rot = (tilt + runLean) ? [rad(tilt + runLean), cx, hipY] : null;
  const T = {
    a: (0.40 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  // If carrying a Krama Bundle Stick over shoulder (បង្វេចក្រមា!), draw bamboo stick & bundle behind/over shoulder first!
  if (bundleStick) {
    const stickBack = [tcx - dir * 82 * u, chin - 0.36 * HH + Math.sin(wv * 2) * 4 * u];
    const stickFront = [tcx + dir * 48 * u, chin + 0.32 * HH];
    // Krama bundle hanging off the back tip of the bamboo stick!
    const bR = O.isTiny ? 36 * u : 46 * u;
    const bCol = O.isTiny ? KH_KRAMA_GREEN : KH_KRAMA_RED;
    drawKramaBundle(p, stickBack[0] - dir * 6 * u, stickBack[1] + bR * 0.85, bR, u, bCol, light, thick);
    p.band([stickBack, stickFront], "#cfa15a", 5.8 * u, 2.0 * u, "round");
  }

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "run": {
        const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
        return { pts: [s, [X(16), s[1] + 0.26 * HH], [tcx + sw * 44 * u * dir, s[1] + (0.10 - sw * 0.22) * HH]], front: side * dir > 0 };
      }
      case "stickHold": // Hand gripping front end of Krama bundle stick!
        return { pts: [s, [X(14), s[1] + 0.32 * HH], [tcx + dir * 40 * u, chin + 0.28 * HH]], front: true };
      case "wipeTear": // Rubbing weeping eyes!
        return { pts: [s, [X(22), s[1] - 0.08 * HH], [tcx + side * 14 * u + dir * 8 * u, hc + 4 * u]], front: true };
      case "cradle": // Cradling swaddled baby or snack plate in front of chest!
        return { pts: [s, [X(18), s[1] + 0.32 * HH], [tcx + side * 14 * u + dir * 14 * u, torsoBot - 0.36 * HH]], front: true };
      case "offer": // Extending snacks / bribe eagerly forward!
        return { pts: [s, [X(24), s[1] + 0.16 * HH], [tcx + dir * 50 * u, torsoBot - 0.42 * HH]], front: true };
      case "snatch": // Reaching out greedily toward younger bro's snack!
        return { pts: [s, [X(28), s[1] + 0.06 * HH], [tcx + dir * 58 * u, torsoBot - 0.48 * HH + Math.sin(wv * 3) * 5 * u]], front: true };
      case "rummage": { // Tossing clothes fast!
        const ry = Math.sin(wv * 4 + side * 2) * 18 * u;
        return { pts: [s, [X(24), s[1] + 0.18 * HH], [tcx + side * 28 * u + dir * 18 * u, torsoBot - 0.38 * HH + ry]], front: true };
      }
      case "caneUp": // Fierce Mom raising bamboo rattan switch high!
        return { pts: [s, [X(24), s[1] - 0.28 * HH], [X(38), s[1] - 0.78 * HH + Math.sin(wv * 4) * 8 * u]], front: true };
      case "panic":
        return { pts: [s, [X(28), s[1] - 0.18 * HH], [X(44), s[1] - 0.62 * HH]], front: true };
      case "chest": // Solemn hand on heart ("I swear, Mom found you under the bridge!")
        return { pts: [s, [X(18), s[1] + 0.28 * HH], [tcx + dir * 6 * u, chin + 0.40 * HH]], front: true };
      case "sampheah":
        return { pts: [s, [X(16), s[1] + 0.40 * HH], [tcx + side * 4 * u, chin + 0.42 * HH]], front: true };
      case "point":
        return { pts: [s, [X(28), s[1] - 0.05 * HH], [tcx + (facing || side) * 62 * u, s[1] - 0.18 * HH]], front: true };
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

  const arms = [arm(-1, sprint ? "run" : L), arm(1, sprint ? "run" : R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
  };
  for (const a of arms) if (!a.front) drawArm(a);

  if (O.isMom) {
    // Ankle-length Khmer Sampot Samloy wrap skirt with gold ikat hem border!
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
    // Shorts
    const sh = [
      [tcx - 0.94 * T.a, torsoBot - 0.22 * HH], [tcx + 0.94 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.02 * T.a, torsoBot + 0.34 * HH], [tcx, torsoBot + 0.20 * HH], [tcx - 1.02 * T.a, torsoBot + 0.34 * HH],
    ];
    p.gradFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light);
    p.inkRing(sh, ow * 0.85, thick);
  }

  // Shirt / Blouse + Checkered Khmer Krama accent
  p.gradFill(tp, O.top, mul(O.top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.trim) {
      p.ell(tcx + 4 * u * facing, chin + 0.04 * HH, 24 * u, 11 * u, O.trim, 2.2 * u);
    }
    if (O.isMom) {
      // Diagonal checkered Krama shoulder sash on Mom
      p.band([[tcx - 0.7 * T.a, chin + 0.02 * HH], [tcx + 0.6 * T.a, torsoBot]], O.krama, 13 * u, 1.8 * u);
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

  if (snackPlate || bigSnackBribe) {
    const px = (L === "offer" || R === "offer") ? (dir > 0 ? rhx + 16 * u : lhx - 16 * u) : tcx + dir * 20 * u;
    const py = (L === "offer" || R === "offer") ? Math.min(lhy, rhy) - 4 * u : torsoBot - 0.38 * HH;
    drawKhmerSnacks(p, px, py, u, bigSnackBribe);
  }

  if (tyingBundle) {
    drawKramaBundle(p, tcx + dir * 22 * u, torsoBot - 0.28 * HH, 44 * u, u, KH_KRAMA_RED, light, thick);
  }

  if (rummageClothes) {
    // Flying colorful shirts tossed up while packing!
    const fy = Math.abs(Math.sin(wv * 3.2)) * 34 * u;
    p.poly(rrect(tcx - 42 * u, torsoBot - 0.72 * HH - fy, tcx - 8 * u, torsoBot - 0.48 * HH - fy, 5 * u), "#ff6b4a", 2.6 * u);
    p.poly(rrect(tcx + 14 * u, torsoBot - 0.85 * HH - fy * 0.7, tcx + 48 * u, torsoBot - 0.60 * HH - fy * 0.7, 5 * u), "#ffd23f", 2.6 * u);
  }

  if (babyBundle) {
    // Adorable swaddled Baby Younger Bro wrapped in Sky-Blue Checkered Krama cradled in Mom's arms!
    const bx = tcx + dir * 22 * u, by = torsoBot - 0.40 * HH;
    const wrap = ellPts(bx, by, 40 * u, 28 * u, 0, 360, -dir * 12, 32);
    p.shadedFill(wrap, "#66b3ff", "#2e73b8", light, 40 * u, 0.4);
    p.inkRing(wrap, 3.4 * u, thick);
    // Tiny cute baby face peeking out!
    const bhx = bx + dir * 16 * u, bhy = by - 6 * u;
    p.ell(bhx, bhy, 18 * u, 17 * u, "#e3a476", 3.0 * u);
    p.arc(bhx - 5 * u, bhy - 1 * u, 4 * u, 3 * u, 200, 340, 2.2 * u);
    p.arc(bhx + 5 * u, bhy - 1 * u, 4 * u, 3 * u, 200, 340, 2.2 * u);
    p.arc(bhx, bhy + 5 * u, 4.5 * u, 3 * u, 15, 165, 2.2 * u);
  }

  if (rattanCane) {
    // Khmer Mom's feared flexible bamboo/rattan switch (រំពាត់វាយបែកគូទ!)
    const [hx, hy] = dir > 0 ? [rhx, rhy] : [lhx, lhy];
    const whip = curve([hx, hy], [hx + dir * 24 * u, hy - 58 * u], [hx - dir * 10 * u, hy - 112 * u + Math.sin(wv * 5) * 10 * u]);
    p.band(whip, "#c98f38", 4.6 * u, 1.8 * u, "round");
  }

  // ---- 4. Bean Head & Expressions ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt + runLean), [cx, hipY]);
  const Ah = tilt + runLean + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawCastHair(p, O, H, cx, hc, light, thick, ow, u, facing, duonHat);

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, undefined, false);

  // Extra deadpan ultra-serious furrow lines between brows & cheekbones («ទឹកមុខម៉ឺងម៉ាត់បំផុត»)!
  if (expr === "ultraSerious") {
    const fx = cx + 7 * u * facing;
    p.stroke([[fx - 3 * u, hc - 22 * u], [fx - 2 * u, hc - 13 * u]], 2.6 * u, INK);
    p.stroke([[fx + 3 * u, hc - 22 * u], [fx + 2 * u, hc - 13 * u]], 2.6 * u, INK);
    p.stroke([[fx - 18 * u, hc + 16 * u], [fx - 13 * u, hc + 24 * u]], 2.2 * u, INK);
    p.stroke([[fx + 18 * u, hc + 16 * u], [fx + 13 * u, hc + 24 * u]], 2.2 * u, INK);
  }

  if (crying) {
    drawWaterfallTears(p, cx, hc, W, facing, wv);
  }

  if (sweat || sweatSpray) {
    const sx = cx - dir * 38 * u, sy = hc - 14 * u;
    p.poly([[sx, sy - 15 * u], [sx + 8.5 * u, sy + 4 * u], [sx, sy + 11 * u], [sx - 8.5 * u, sy + 4 * u]], "#74d4ff", 2.5 * u);
    if (sweatSpray) {
      for (const [dx, dy] of [[-54, -34], [-62, -4], [46, -32]]) {
        const px = cx - dir * dx * u, py = hc + dy * u;
        p.ell(px, py, 5.5 * u, 3.5 * u, "#74d4ff", 2.0 * u, 0, 360, dx > 0 ? 25 : -25);
      }
    }
  }
  p.rot = null;
};

/** 2D Prop Card: Abandoned Swaddled Baby in a Woven Khmer Bamboo Basket (កញ្ជើកូនង៉ែតក្រោមស្ពាន!) */
export const drawBabyBasketCard = (p, wv = 0, crying = true) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;
  const rock = Math.sin(wv * 3) * 3.5;
  p.rot = [rad(rock), 300, 910];

  // Swaddled baby wrapped in Sky-Blue Checkered Krama peeking out of woven basket!
  const swad = ellPts(300, 815, 92, 68, 0, 360, -6, 36);
  p.shadedFill(swad, "#66b8ff", "#2b6eb5", light, 92, 0.4);
  p.inkRing(swad, 8.5, thick);

  const hx = 328, hy = 786;
  p.ell(hx, hy, 46, 44, "#e3a476", 8.0);
  // Baby hair curl
  p.poly([[hx - 6, hy - 42], [hx + 14, hy - 62], [hx + 18, hy - 40]], "#221817", 5.5);
  if (crying) {
    p.stroke([[hx - 18, hy - 6], [hx - 8, hy], [hx - 18, hy + 6]], 4.5, INK);
    p.stroke([[hx + 18, hy - 6], [hx + 8, hy], [hx + 18, hy + 6]], 4.5, INK);
    p.ell(hx, hy + 15, 11, 13, MOUTH, 4.0);
    p.ell(hx - 24, hy + 10, 6, 10, "#74d8ff", 2.5);
    p.ell(hx + 24, hy + 10, 6, 10, "#74d8ff", 2.5);
  } else {
    p.arc(hx - 12, hy, 8, 6, 200, 340, 4.2);
    p.arc(hx + 12, hy, 8, 6, 200, 340, 4.2);
    p.arc(hx, hy + 12, 10, 7, 15, 165, 4.2);
  }

  // Woven Khmer bamboo basket (កញ្ជើ) base!
  const bsk = [
    [172, 835], [428, 835], [392, 955], [208, 955],
  ];
  p.shadedFill(bsk, "#d9a95b", "#9c6f2c", light, 128, 0.4);
  p.clip(bsk, () => {
    for (let x = 190; x <= 410; x += 28) p.stroke([[x, 830], [x, 960]], 4, "#8c5f23");
    for (let y = 860; y <= 940; y += 26) p.stroke([[170, y], [430, y]], 4, "#8c5f23");
  });
  p.inkRing(bsk, 9.0, thick);
  p.band([[166, 835], [434, 835]], "#8c5820", 16, 4, "round");
  p.rot = null;
};

/** Bold Rollo-Style Visual Comic Cards (100% crisp visual storytelling, zero unreadable micro-text!) */
export const drawBridgeCard = (p, kind = "secretWeaponBox", k = 1) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;

  if (kind === "underBridgeQuestion") {
    // Question badge pointing down under the bridge!
    const bg = ellPts(300, 465, 158, 158, 0, 360, 0, 44);
    p.shadedFill(bg, "#ffd23f", "#cf9317", light, 158, 0.4);
    p.inkRing(bg, 11, thick);
    const g = p.g; g.save();
    g.font = "900 165px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 16; g.strokeStyle = INK; g.fillStyle = "#ffffff";
    g.strokeText("?", 300, 472);
    g.fillText("?", 300, 472);
    g.restore();
    // Red downward pointer arrow toward the baby basket!
    p.poly([[300, 695], [248, 625], [278, 625], [278, 575], [322, 575], [322, 625], [352, 625]], "#ff3b3b", 9);
  } else if (kind === "secretWeaponBox") {
    // Radiant Secret Weapon Badge (អាវុធសម្ងាត់របស់បងធំ!) — goldenburst + megaphone/teardrop prank badge!
    const s = 0.94 + 0.06 * Math.sin(k * 5);
    const rays = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = (i % 2 === 0 ? 220 : 172) * s;
      rays.push([300 + Math.cos(a) * r, 480 + Math.sin(a) * r]);
    }
    p.poly(rays, "#fff3a8", 10);
    const box = rrect(155, 365, 445, 595, 32);
    p.shadedFill(box, "#c92438", "#7d1220", light, 145, 0.4);
    p.inkRing(box, 11, thick);
    // Golden megaphone + sparkling blue tear icon inside!
    p.poly([[205, 495], [315, 425], [315, 545]], "#ffd23f", 8);
    p.poly(rrect(182, 468, 214, 515, 6), "#ffffff", 7);
    p.poly([[375, 418], [406, 486], [375, 514], [344, 486]], "#6bd4ff", 8);
  } else if (kind === "noForceFist") {
    // Red Prohibited Circle-Slash over Cartoon Muscle/Fist («គាត់មិនប្រើកម្លាំងទេ!»)
    const ring = ellPts(300, 485, 172, 172, 0, 360, 0, 44);
    p.shadedFill(ring, "#ff4747", "#ad1d1d", light, 172, 0.4);
    p.inkRing(ring, 12, thick);
    p.ell(300, 485, 130, 130, "#fffdf7", 9);
    // Punching fist silhouette inside
    p.poly(rrect(245, 440, 355, 525, 24), "#d89666", 8.5);
    p.poly(rrect(268, 518, 332, 572, 12), "#d89666", 8.5);
    for (const kx of [268, 294, 320]) p.stroke([[kx, 442], [kx, 478]], 5, INK);
    // Diagonal red slash
    p.band([[204, 388], [396, 582]], "#ff3b3b", 28, 6, "round");
  } else if (kind === "notBirthChild") {
    // Speech bubble showing Family Link / Baby Icon crossed out in bold red («មិនមែនកូនបង្កើតទេ!»)
    const cl = ellPts(300, 480, 175, 145, 0, 360, 0, 42);
    p.shadedFill(cl, "#fffdf5", "#dce6f2", light, 175, 0.4);
    p.inkRing(cl, 10.5, thick);
    // Parent + Kid icons with red X over the link!
    p.ell(232, 452, 26, 26, "#d96285", 6.5);
    p.poly(rrect(208, 482, 256, 545, 12), "#d96285", 6.5);
    p.ell(368, 468, 22, 22, "#2e8ae6", 6.5);
    p.poly(rrect(348, 494, 388, 545, 10), "#2e8ae6", 6.5);
    p.band([[255, 425], [345, 545]], "#ff3030", 20, 4.5, "round");
    p.band([[345, 425], [255, 545]], "#ff3030", 20, 4.5, "round");
  } else if (kind === "lovingHeart") {
    // Warm glowing pink-and-gold heart card when Mom rescues the baby under the bridge!
    const s = 0.92 + 0.08 * Math.sin(k * 5);
    const cx = 300, cy = 475;
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      const hx = 16 * Math.sin(t) ** 3;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([cx + hx * 8.5 * s, cy + hy * 8.5 * s]);
    }
    p.shadedFill(pts, "#ff5c8a", "#b81d4e", light, 140, 0.4);
    p.inkRing(pts, 10.5, thick);
  } else if (kind === "spankDangerVision") {
    // Jagged Red/Gold Danger Starburst showing Mom's Rattan Switch + Spank Spark («ខ្លាចម៉ែដឹងវាយបែកគូទ!»)
    const spikes = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = i % 2 === 0 ? 215 : 145;
      spikes.push([300 + Math.cos(a) * r, 475 + Math.sin(a) * r]);
    }
    p.shadedFill(spikes, "#ffe14d", "#ff5238", light, 215, 0.4);
    p.inkRing(spikes, 10.5, thick);
    // Crossed bamboo rattan canes + red lightning/impact!
    p.band([[210, 555], [395, 395]], "#b87a28", 16, 4.5, "round");
    p.band([[390, 555], [205, 395]], "#d4983d", 16, 4.5, "round");
    p.dot(300, 475, 28, "#ff2e2e");
  } else if (kind === "snackBribeBurst") {
    // Sparkling Golden Khmer Snack Peace-Offering Halo («ប្រញាប់ទិញនំមកលួងវិញភ្លាមៗ!»)
    const bg = ellPts(300, 475, 168, 142, 0, 360, 0, 42);
    p.shadedFill(bg, "#fff8d6", "#f2cf66", light, 168, 0.4);
    p.inkRing(bg, 10.5, thick);
    drawKhmerSnacks(p, 300, 505, 3.2, true);
  } else if (kind === "timeSkipClock") {
    // Spinning Fast-Forward Clock Badge («ពេលអ្នកធំឡើង!»)
    const clk = ellPts(300, 480, 155, 155, 0, 360, 0, 44);
    p.shadedFill(clk, "#fffdf5", "#cfdbe8", light, 155, 0.4);
    p.inkRing(clk, 11, thick);
    p.band([[145, 480], [455, 480]], "#ffd23f", 0, 0);
    const ang = k * 9.0;
    p.band([[300, 480], [300 + Math.cos(ang) * 98, 480 + Math.sin(ang) * 98]], "#e62e3d", 12, 3.5, "round");
    p.band([[300, 480], [300 + Math.cos(ang * 0.25) * 68, 480 + Math.sin(ang * 0.25) * 68]], "#2b3a52", 14, 3.5, "round");
    p.dot(300, 480, 14, KH_GOLD);
  } else if (kind === "bridgeLieBubble") {
    // Recycled Lie Comic Speech Bubble: Mini Wooden Bridge + Arrow to Basket («យកពាក្យភូតដដែលនេះ ទៅបោកប្អូនពៅ!»)
    const cl = ellPts(300, 475, 178, 138, 0, 360, 0, 42);
    p.shadedFill(cl, "#fffdf5", "#dde7f2", light, 178, 0.4);
    p.inkRing(cl, 10.5, thick);
    // Mini wooden bridge silhouette inside bubble!
    p.band([[185, 445], [415, 445]], "#8c5828", 18, 4, "round");
    p.band([[215, 445], [215, 525]], "#6e421c", 12, 3.5, "round");
    p.band([[385, 445], [385, 525]], "#6e421c", 12, 3.5, "round");
    // Blue water + tiny basket under mini bridge!
    p.band([[195, 535], [405, 535]], "#3ca6a6", 12, 2.5, "round");
    p.ell(300, 512, 32, 20, "#d9a95b", 5.5);
    p.ell(305, 496, 15, 14, "#66b8ff", 4.5);
  } else if (kind === "commentWhereFound") {
    // Crisp Glowing Blue Thumbs-Up Like + Gold Comment Question Badge («ខមិនប្រាប់ផង ថាម៉ែរើសអ្នកបានពីណា!»)
    const lk = rrect(105, 390, 325, 568, 34);
    p.shadedFill(lk, "#2986f5", "#1752a6", light, 110, 0.4);
    p.inkRing(lk, 10.5, thick);
    p.poly(rrect(145, 472, 182, 538, 8), "#ffffff", 6.5);
    p.poly([[186, 472], [212, 416], [236, 420], [230, 462], [285, 462], [276, 538], [186, 538]], "#ffffff", 6.5);

    const cm = rrect(285, 245, 505, 418, 32);
    p.shadedFill(cm, "#ffd23f", "#cf9619", light, 110, 0.4);
    p.inkRing(cm, 10.5, thick);
    const g = p.g; g.save();
    g.font = "900 105px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = "#ffffff";
    g.strokeText("?", 395, 336);
    g.fillText("?", 395, 336);
    g.restore();
  }
};

/** Radial Comic Shock / Panic Lines around startled character */
export const drawShockRays = (p, k = 0, col = "#ffd23f") => {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + k * 0.4;
    p.stroke([
      [300 + Math.cos(a) * 145, 440 + Math.sin(a) * 145],
      [300 + Math.cos(a) * 215, 440 + Math.sin(a) * 215],
    ], 10, i % 2 ? col : "#ff5238");
  }
};

/** Walking / Sprinting cartoon dust puffs */
export const fxDust = (p, k, col = "#f0c9a8") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 75 + 135 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.6, 95 + 45 * k, 78 + 38 * k, col, 10);
  }
  p.ell(300, 540, 135 + 85 * k, 105 + 60 * k, col, 0);
  g.restore();
};
