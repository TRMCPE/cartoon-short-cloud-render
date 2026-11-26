// ---------------- Cambodian Family Cast, Props & Rollo Comic Cards (built on toonbase.js Pen) ----------------
FACE.determined = { eye: ["lid", "lid"], brow: [4, -2], mouth: "teeth" };
FACE.sneaky = { eye: ["slit", "slit"], brow: [4, -3], mouth: "smirk" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smileWide" };
FACE.warm = { eye: ["dot", "dot"], brow: [-2, -1], mouth: "smile" };
FACE.sweet = { eye: ["happy", "happy"], brow: [-3, -2], mouth: "smile" };
FACE.shout = { eye: ["squeeze", "squeeze"], brow: [-5, -4], mouth: "laugh" };
FACE.sleepy = { eye: ["dash", "dash"], brow: [-1, 1], mouth: "o" };
FACE.sheepish = { eye: ["happy", "lid"], brow: [-3, 2], mouth: "wave" };
FACE.starry = { eye: ["dot", "dot"], brow: [-5, -5], mouth: "grin" };

const KH_GOLD = "#f2c144", KH_CORAL = "#e56378", KH_BURGUNDY = "#8f2440", KH_KRAMA = "#c92e34";
const KH_SKY = "#2c7ec9", KH_NAVY = "#33435c", KH_LEAF = "#3fa34d", KH_STEM = "#6bc458";

export const HOME_ROLES = {
  mother: {
    skin: "#de9f70", top: KH_CORAL, lace: "#fff4ec", sampot: KH_BURGUNDY, krama: KH_KRAMA,
    hair: "bun", hairCol: "#221817", flower: true, skirt: true,
  },
  kid: {
    skin: "#d89868", top: KH_SKY, trim: "#ffd54f", shorts: KH_NAVY,
    hair: "tousled", hairCol: "#1e1615", isKid: true,
  },
  grandma: {
    skin: "#d6986c", top: "#f5ebd6", krama: "#d99b38", sampot: "#6e3c28",
    hair: "bun", hairCol: "#9ea4ad", flower: true, skirt: true,
  },
};

const drawHomeHair = (p, O, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, W = 2 * H.a, HH = 2 * H.b, hCol = O.hairCol || "#221817";
  if (O.hair === "bun") {
    const cap = ellPts(cx, hc - 0.34 * H.b, H.a * 1.03, H.b * 0.72, 180, 360, 0, 40);
    p.shadedFill(cap, hCol, shade(hCol, 0.55), light, H.a, 0.35);
    p.poly(cap, null, ow * 0.82);
    const by = crown - 0.10 * HH, bx = cx - 4 * u * facing;
    const bun = ellPts(bx, by, 0.28 * W, 0.20 * HH, 0, 360, 0, 32);
    p.shadedFill(bun, hCol, shade(hCol, 0.55), light, 0.28 * W, 0.35);
    p.inkRing(bun, ow * 0.8, thick);
    p.band([[bx - 0.24 * W, by + 6 * u], [bx + 0.24 * W, by + 6 * u]], KH_GOLD, 5.5 * u, 1.6 * u, "round");
    if (O.flower) {
      p.ell(bx + 0.22 * W, by + 4 * u, 9 * u, 9 * u, "#fffdf4", 2.2 * u);
      p.dot(bx + 0.22 * W, by + 4 * u, 3.5 * u, KH_GOLD);
    }
  } else {
    // Youth tousled hair with lively front tuft
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.04, H.b * 0.70, 178, 362, 0, 40);
    p.shadedFill(cap, hCol, "#100b0a", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
    const dir = facing || 1;
    p.poly([
      [cx + dir * 8 * u, crown + 4 * u],
      [cx + dir * 28 * u, crown - 16 * u],
      [cx + dir * 22 * u, crown + 6 * u],
      [cx + dir * 40 * u, crown - 8 * u],
      [cx + dir * 30 * u, crown + 14 * u],
    ], hCol, ow * 0.72);
  }
};

/** Draw fresh green Trakuon (water spinach) bunch in hand */
const drawTrakuonBunch = (p, x, y, u, tilt = 0) => {
  const s = Math.sin(tilt), c = Math.cos(tilt);
  const R = (dx, dy) => [x + dx * c - dy * s, y + dx * s + dy * c];
  for (const off of [-8, 0, 8]) {
    p.band([R(off * u, 24 * u), R(off * 1.3 * u, -26 * u)], KH_STEM, 4.5 * u, 1.4 * u, "round");
    const [lx, ly] = R(off * 1.4 * u, -32 * u);
    p.ell(lx, ly, 8 * u, 14 * u, KH_LEAF, 2.2 * u, 0, 360, off * 2);
  }
  // Red string tie if whole bundle
  p.band([R(-11 * u, 8 * u), R(11 * u, 8 * u)], KH_KRAMA, 3.5 * u, 1.0 * u, "round");
};

/** Cozy sleeping pose on horizontal daybed (កូនកំពុងដេកលក់ថ្ងៃត្រង់) */
const drawSleepingKid = (p, O, opts) => {
  const { wv = 0, expr = "sleepy" } = opts;
  const light = rad(-110), thick = thickAngle(light), skin = O.skin;
  const breath = Math.sin(wv) * 4;
  p.rot = null;
  // Plump white pillow under head
  const pil = rrect(95, 650, 265, 760, 28);
  p.shadedFill(pil, "#fffdf8", "#dce4ee", light, 90, 0.4);
  p.inkRing(pil, 9, thick);
  // Reclining body under colorful Khmer Krama blanket
  const body = ellPts(355, 725 - breath * 0.5, 135, 58 + breath * 0.4, 0, 360, 4, 40);
  p.shadedFill(body, "#d93b44", "#8f2028", light, 135, 0.4);
  p.clip(body, () => {
    for (let x = 235; x <= 475; x += 36) {
      p.stroke([[x, 660], [x, 790]], 8, "#fff7eb");
    }
  });
  p.inkRing(body, 10, thick);
  // Bare feet peeking out on right!
  p.ell(495, 728, 16, 26, skin, 6.5, 0, 360, 18);
  p.ell(512, 740, 15, 24, skin, 6.5, 0, 360, 24);
  // Bean head resting on pillow
  const H = headBlob(2, 102, 1);
  const hp = blobPts(185, 668, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawHomeHair(p, O, H, 185, 668, light, thick, 9.5, 2.0, 1);
  faceFront(p, 185, 668, 204, expr, 1, 0, 1, false, skin, undefined, false);
};

/** Front / 3-4 Cambodian Family Character (Mother, Kid, Grandma) */
export const khmerHomeChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? HOME_ROLES[key] : key;
  if (opts.mode === "sleep") return drawSleepingKid(p, O, opts);

  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 2,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, sprint = false, wv = 0,
    game = false, fiveHand = false, ladle = false, washBowl = false,
    trakuon = false, sweat = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const headR = O.isKid ? 110 : 116;
  const H = headBlob(seed, headR, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.isKid ? 0.96 : 1.06, legsL = O.isKid ? 1.18 : 1.34, sole = 975;
  const runBounce = sprint ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.14 * HH : 0;
  const torsoBot = sole - legsL * HH - bob * HH - runBounce;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(skin, INK, 0.24), armCol = mix(skin, INK, 0.18);

  p.rot = null;

  // ---- Legs & Feet ----
  for (const side of [-1, 1]) {
    const ph = step + (side > 0 ? 0.5 : 0);
    if (sprint) {
      const swing = Math.sin(Math.PI * 2 * ph);
      const hx = cx + side * 14 * u;
      const fx = cx + swing * 62 * u * (facing || 1);
      const fy = sole - 12 * u - Math.max(0, Math.cos(Math.PI * 2 * ph)) * 46 * u;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + (facing || 1) * 14 * u, (hipY + fy) / 2 - 10 * u], [fx, fy]), 6.0 * u, legCol);
      p.stroke([[fx - 6 * u, fy], [fx + (facing || 1) * 16 * u, fy - 3 * u]], 7.5 * u + 3, INK);
      p.stroke([[fx - 6 * u, fy], [fx + (facing || 1) * 16 * u, fy - 3 * u]], 7.5 * u, "#4b6982");
    } else {
      const up = Math.max(0, Math.sin(Math.PI * 2 * ph)) * 28 * (step ? 1 : 0);
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, O.skirt ? "#6e3f28" : "#3a7ca5");
    }
  }

  // ---- Upper Body + Sampot / Shorts ----
  const runLean = sprint ? (facing || 1) * 10 : 0;
  p.rot = (tilt + runLean) ? [rad(tilt + runLean), cx, hipY] : null;
  const T = {
    a: (0.40 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "game": // Gripping mobile gaming phone in front of chest!
        return { pts: [s, [X(18), s[1] + 0.34 * HH], [tcx + side * 16 * u + facing * 8 * u, chin + 0.58 * HH]], front: true };
      case "shout": // Hands cupped around mouth shouting «បាយឆ្អិនហើយកូន!»
        return { pts: [s, [X(26), s[1] - 0.08 * HH], [cx + (side * 16 + facing * 14) * u, hc + 18 * u]], front: true };
      case "belly": // Clutching rumbling hungry stomach!
        return { pts: [s, [X(20), s[1] + 0.34 * HH], [tcx + side * 12 * u, torsoBot - 0.24 * HH]], front: true };
      case "shock": // Stiff splayed arms for ឈរភាំង!
        return { pts: [s, [X(28), s[1] + 0.18 * HH], [X(46), s[1] + 0.44 * HH]], front: true };
      case "five": // Holding up bold "5 minutes!" hand!
        return { pts: [s, [X(22), s[1] - 0.18 * HH], [X(38), s[1] - 0.62 * HH]], front: true, five: true };
      case "wash": { // Washing rice in pot / basin!
        const sw = Math.sin(wv) * 10 * u;
        return { pts: [s, [X(18), s[1] + 0.32 * HH], [tcx + side * 14 * u + sw, torsoBot - 0.22 * HH]], front: true };
      }
      case "pick": { // Snapping Trakuon water spinach stems!
        const py = Math.sin(wv) * 6 * u;
        return { pts: [s, [X(18), s[1] + 0.30 * HH], [tcx + side * 14 * u, torsoBot - 0.32 * HH + py]], front: true };
      }
      case "hold":
        return { pts: [s, [X(16), s[1] + 0.34 * HH], [tcx + side * 18 * u, torsoBot - 0.30 * HH]], front: true };
      case "offer":
        return { pts: [s, [X(24), s[1] + 0.18 * HH], [tcx + side * 34 * u + facing * 16 * u, torsoBot - 0.40 * HH]], front: true };
      case "sampheah":
        return { pts: [s, [X(16), s[1] + 0.40 * HH], [tcx + side * 4 * u, chin + 0.42 * HH]], front: true };
      case "run": {
        const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
        return { pts: [s, [X(16), s[1] + 0.26 * HH], [tcx + sw * 42 * u * (facing || 1), s[1] + (0.12 - sw * 0.22) * HH]], front: side * (facing || 1) > 0 };
      }
      case "wave":
        return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "point":
        return { pts: [s, [X(28), s[1] - 0.05 * HH], [X(60), s[1] - 0.22 * HH]], front: false };
      case "up":
        return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.80 * HH]], front: false };
      case "shrug":
        return { pts: [s, [X(24), s[1] + 0.26 * HH], [X(48), s[1] - 0.06 * HH]], front: false };
      case "hip":
        return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.25 * HH]], front: false };
      default:
        return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const arms = [arm(-1, sprint ? "run" : L), arm(1, sprint ? "run" : (fiveHand ? "five" : R))];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
    if (a.five) {
      // Splayed 5 cartoon fingers for «៥ នាទីទៀតម៉ែ!»
      const [hx, hy] = a.pts[2];
      p.ell(hx, hy - 4 * u, 9 * u, 10 * u, skin, 2.4 * u);
      for (let f = -2; f <= 2; f++) {
        const ang = rad(-90 + f * 24);
        p.band([[hx + Math.cos(ang) * 5 * u, hy - 4 * u + Math.sin(ang) * 5 * u],
                [hx + Math.cos(ang) * 19 * u, hy - 4 * u + Math.sin(ang) * 19 * u]], skin, 3.6 * u, 1.3 * u, "round");
      }
    }
  };

  for (const a of arms) if (!a.front) drawArm(a);

  // ---- Lower Garment: Mother's Woven Sampot Sarong vs Kid's Casual Home Shorts ----
  if (O.skirt) {
    const sk = [
      [tcx - 0.92 * T.a, torsoBot - 0.22 * HH], [tcx + 0.92 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.02 * T.a, sole - 0.24 * HH], [tcx - 1.02 * T.a, sole - 0.24 * HH],
    ];
    p.gradFill(sk, O.sampot, mul(O.sampot, SH_CLOTH), light);
    p.clip(sk, () => {
      const hy = sole - 0.36 * HH;
      p.band([[tcx - 1.1 * T.a, hy], [tcx + 1.1 * T.a, hy]], KH_GOLD, 9 * u, 1.5 * u);
      p.band([[tcx - 1.1 * T.a, hy - 14 * u], [tcx + 1.1 * T.a, hy - 14 * u]], "#ffd8e4", 4.5 * u, 1.0 * u);
    });
    p.inkRing(sk, ow * 0.9, thick);
  } else {
    const sh = [
      [tcx - 0.94 * T.a, torsoBot - 0.22 * HH], [tcx + 0.94 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.02 * T.a, torsoBot + 0.34 * HH], [tcx, torsoBot + 0.20 * HH], [tcx - 1.02 * T.a, torsoBot + 0.34 * HH],
    ];
    p.gradFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light);
    p.inkRing(sh, ow * 0.85, thick);
  }

  // ---- Torso + Khmer Krama Sash / T-Shirt Collar ----
  p.gradFill(tp, O.top, mul(O.top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.krama) {
      // Iconic red-white checked Khmer Krama draped over Mother's left shoulder!
      p.band([[tcx - 0.62 * T.a, chin - 0.06 * HH], [tcx - 0.52 * T.a, torsoBot - 0.08 * HH]], O.krama, 16 * u, 2.0 * u);
      for (let k = 0; k < 5; k++) {
        const ky = chin + (0.08 + k * 0.17) * HH;
        p.poly(rrect(tcx - 0.68 * T.a, ky - 4 * u, tcx - 0.46 * T.a, ky + 4 * u, 1.5 * u), "#fff7ee", 0);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.20 * HH], [tcx + 1.4 * T.a, torsoBot - 0.20 * HH]], KH_GOLD, 6 * u, 1.4 * u);
    }
    if (O.trim) {
      p.ell(tcx + 4 * u * facing, chin + 0.04 * HH, 24 * u, 11 * u, O.trim, 2.2 * u);
      p.band([[tcx - 1.2 * T.a, torsoBot - 0.38 * HH], [tcx + 1.2 * T.a, torsoBot - 0.38 * HH]], O.trim, 5 * u, 0);
    }
  });
  p.inkRing(tp, ow, thick);

  for (const a of arms) if (a.front) drawArm(a);

  if (L === "sampheah" && R === "sampheah") {
    const sx = tcx, sy = chin + 0.38 * HH;
    p.poly([[sx - 8 * u, sy + 12 * u], [sx, sy - 16 * u], [sx + 8 * u, sy + 12 * u]], skin, 3.2 * u);
  }

  // ---- Held Story Props ----
  const [lhx, lhy] = arms[0].pts[2];
  const [rhx, rhy] = arms[1].pts[2];

  if (game) {
    // Glowing landscape mobile gaming phone + excitement sparks!
    const gx = (lhx + rhx) / 2, gy = (lhy + rhy) / 2 - 4 * u;
    const ph = rrect(gx - 28 * u, gy - 15 * u, gx + 28 * u, gy + 15 * u, 5 * u);
    p.poly(ph, "#1d2430", 3.2 * u);
    p.poly(rrect(gx - 22 * u, gy - 11 * u, gx + 22 * u, gy + 11 * u, 3 * u), "#5ce1ff", 1.8 * u);
    // Tiny action burst above screen
    p.stroke([[gx - 14 * u, gy - 22 * u], [gx - 20 * u, gy - 34 * u]], 2.8 * u, "#ffd644");
    p.stroke([[gx + 14 * u, gy - 22 * u], [gx + 20 * u, gy - 34 * u]], 2.8 * u, "#ffd644");
  }
  if (ladle) {
    // Classic Khmer wooden rice ladle (វែកបាយ)!
    p.band([[rhx, rhy + 18 * u], [rhx + (facing || 1) * 18 * u, rhy - 38 * u]], "#a86b38", 6.5 * u, 2.0 * u, "round");
    p.ell(rhx + (facing || 1) * 21 * u, rhy - 46 * u, 14 * u, 18 * u, "#cfa068", 2.8 * u, 0, 360, (facing || 1) * 20);
    // Little mound of white rice on spoon when teasing!
    p.ell(rhx + (facing || 1) * 21 * u, rhy - 50 * u, 11 * u, 9 * u, "#fffdf8", 2.0 * u);
  }
  if (washBowl) {
    // Shiny steel rice-washing pot with raw white rice & water splash!
    const bx = tcx + (facing || 1) * 6 * u, by = torsoBot - 0.18 * HH;
    const pot = rrect(bx - 30 * u, by - 14 * u, bx + 30 * u, by + 22 * u, 8 * u);
    p.shadedFill(pot, "#dce6ee", "#91a4b5", light, 30 * u, 0.38);
    p.inkRing(pot, 3.2 * u, thick);
    p.ell(bx, by - 13 * u, 28 * u, 8 * u, "#9ad9ff", 2.4 * u);
    p.ell(bx - 5 * u, by - 14 * u, 16 * u, 5 * u, "#ffffff", 0);
  }
  if (trakuon) {
    const tx = (L === "pick" || R === "pick") ? (lhx + rhx) / 2 : rhx + (facing || 1) * 6 * u;
    const ty = (L === "pick" || R === "pick") ? (lhy + rhy) / 2 - 4 * u : rhy - 6 * u;
    drawTrakuonBunch(p, tx, ty, u, Math.sin(wv) * 0.15);
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt + runLean), [cx, hipY]);
  const Ah = tilt + runLean + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawHomeHair(p, O, H, cx, hc, light, thick, ow, u, facing);

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, undefined, false);
  if (sweat) {
    // Giant comedic cartoon sweat drop on temple for ឈរភាំង!
    const sx = cx - (facing || 1) * 38 * u, sy = hc - 16 * u;
    p.poly([[sx, sy - 16 * u], [sx + 9 * u, sy + 4 * u], [sx, sy + 11 * u], [sx - 9 * u, sy + 4 * u]], "#7ed3ff", 2.6 * u);
  }
  p.rot = null;
};

/** Bold Rollo-Style Comic Visual Cards (clean bold icons & numbers, zero tiny text!) */
export const drawComicCard = (p, kind = "riceCallBubble", k = 1) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;

  if (kind === "riceCallBubble") {
    // Jagged golden-cream comic shout burst with steaming white rice bowl («បាយឆ្អិនហើយកូន!»)
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = (i % 2 === 0 ? 225 : 172) * Math.min(1.05, 0.5 + k * 0.55);
      pts.push([300 + Math.cos(a) * r, 480 + Math.sin(a) * r * 0.85]);
    }
    p.poly(pts, "#fff4c2", 11);
    // Fluffy white rice mound
    p.ell(300, 485, 92, 68, "#ffffff", 9);
    p.ell(275, 455, 48, 36, "#ffffff", 0);
    p.ell(325, 458, 46, 34, "#ffffff", 0);
    // Crimson Khmer bowl
    const bowl = ellPts(300, 495, 102, 76, 0, 180, 0, 28);
    p.shadedFill(bowl, "#c93042", "#7d1926", light, 102, 0.4);
    p.poly(bowl, null, 10);
    p.band([[208, 512], [392, 512]], KH_GOLD, 10, 2);
    // Rising hot steam curls!
    for (const sx of [255, 300, 345]) {
      const sPts = [];
      for (let j = 0; j <= 8; j++) sPts.push([sx + Math.sin(j * 0.9 + k * 6) * 12, 410 - j * 14]);
      p.stroke(sPts, 8, "#ff9933");
    }
  } else if (kind === "brainCrown") {
    // Glowing golden medallion: Genius Brain wearing a Royal Khmer Crown!
    const bg = ellPts(300, 490, 200, 200, 0, 360, 0, 44);
    p.shadedFill(bg, "#fff6d6", "#ebd08a", light, 200, 0.4);
    p.inkRing(bg, 11, thick);
    // Cute cartoon pink brain lobes
    for (const [bx, by, rx, ry] of [[255, 525, 62, 52], [345, 525, 62, 52], [265, 485, 54, 44], [335, 485, 54, 44]]) {
      p.ell(bx, by, rx, ry, "#f594ac", 8.5);
    }
    p.stroke([[300, 450], [300, 565]], 7, INK);
    // Ornate golden Khmer spire crown on top!
    p.poly([[225, 450], [245, 385], [275, 420], [300, 330], [325, 420], [355, 385], [375, 450]], KH_GOLD, 9);
    p.dot(300, 425, 10, "#d92b3a");
  } else if (kind === "fiveToHour") {
    // k = 0 -> cheerful blue "5m" badge; k = 1 -> ringing red "1h!" alarm clock badge!
    const isHour = k >= 0.5;
    const col = isHour ? "#ff5252" : "#5cc8ff";
    const shCol = isHour ? "#b82525" : "#2b8cc4";
    const shake = isHour ? Math.sin(k * 35) * 10 : 0;
    const cx = 300 + shake, cy = 490;
    // Alarm bells on top when 1 hour!
    if (isHour) {
      p.ell(cx - 115, cy - 135, 42, 32, KH_GOLD, 9, 0, 360, -32);
      p.ell(cx + 115, cy - 135, 42, 32, KH_GOLD, 9, 0, 360, 32);
    }
    const ring = ellPts(cx, cy, 175, 175, 0, 360, 0, 44);
    p.shadedFill(ring, col, shCol, light, 175, 0.4);
    p.inkRing(ring, 12, thick);
    p.ell(cx, cy, 138, 138, "#fffdf7", 9);
    const g = p.g;
    g.save();
    g.font = "900 118px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 14; g.strokeStyle = INK;
    const txt = isHour ? "1h!" : "5m";
    g.strokeText(txt, cx, cy + 8);
    g.fillStyle = isHour ? "#d92020" : "#1a6fb5";
    g.fillText(txt, cx, cy + 8);
    g.restore();
  } else if (kind === "bellyRumble") {
    // Energetic orange-gold zig-zag hunger waves + thought cloud of drumstick & rice!
    for (const s of [-1, 1]) {
      const zig = [
        [300 + s * 75, 620], [300 + s * 135, 595], [300 + s * 95, 565], [300 + s * 165, 535],
      ];
      p.stroke(zig, 11, "#ff7b24");
    }
    // Thought bubble above with golden drumstick!
    p.ell(265, 480, 18, 18, "#ffffff", 7);
    const cl = ellPts(310, 355, 145, 102, 0, 360, 0, 40);
    p.shadedFill(cl, "#ffffff", "#e6eef5", light, 145, 0.4);
    p.inkRing(cl, 10, thick);
    // Crispy golden chicken leg icon inside bubble
    p.band([[335, 385], [380, 415]], "#fff6e0", 18, 6, "round");
    p.ell(285, 350, 62, 42, "#e88828", 8.5, 0, 360, 25);
  } else if (kind === "twentyMinBadge") {
    // Sweet pastel-gold kitchen timer badge: "20m" («ប្រហែល ២០ នាទីទៀតឆ្អិនហើយ!»)
    const bg = ellPts(300, 490, 175, 175, 0, 360, 0, 44);
    p.shadedFill(bg, "#ffd95e", "#d99b26", light, 175, 0.4);
    p.inkRing(bg, 11, thick);
    p.ell(300, 490, 140, 140, "#fffdf7", 8.5);
    // Pie wedge showing 20 minutes (1/3 of clock)
    p.poly([[300, 490], ...ellPts(300, 490, 126, 126, -90, 30, 0, 20)], "#7be088", 6);
    const g = p.g;
    g.save();
    g.font = "900 96px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 13; g.strokeStyle = INK;
    g.strokeText("20m", 300, 505);
    g.fillStyle = "#d93b4e";
    g.fillText("20m", 300, 505);
    g.restore();
  } else if (kind === "smartHeart") {
    // Glowing crimson-gold Heart + Lightbulb («វិធីដ៏ឆ្លាតវៃរបស់ម្តាយ!»)
    const s = 1 + 0.06 * Math.sin(k * 6);
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([300 + x * 9.8 * s, 490 + y * 9.8 * s]);
    }
    p.shadedFill(pts, "#ed3b58", "#9e1c32", light, 155, 0.4);
    p.inkRing(pts, 11, thick);
    // Bright yellow idea bulb glowing above heart!
    p.ell(300, 320, 44, 48, "#ffe854", 8);
    p.poly(rrect(284, 360, 316, 384, 6), "#cfd8e2", 7);
    for (const a of [-140, -110, -70, -40]) {
      p.stroke([[300 + Math.cos(rad(a)) * 62, 320 + Math.sin(rad(a)) * 62],
                [300 + Math.cos(rad(a)) * 88, 320 + Math.sin(rad(a)) * 88]], 7, "#ffd644");
    }
  } else if (kind === "subscribeCta") {
    // Crisp Comment Bubble + Red Play Button («ខមិន & Subscribe!»)
    const sub = rrect(135, 360, 465, 535, 34);
    p.shadedFill(sub, "#e62e2e", "#9e1919", light, 165, 0.4);
    p.inkRing(sub, 11, thick);
    p.poly([[265, 405], [265, 490], [352, 448]], "#ffffff", 8);
    // Floating cheerful comment bubble above!
    const cb = rrect(185, 210, 415, 330, 26);
    p.shadedFill(cb, "#fffdf5", "#dce6f0", light, 120, 0.4);
    p.inkRing(cb, 9.5, thick);
    for (const dx of [245, 300, 355]) p.dot(dx, 270, 12, "#2c7ec9");
  }
};

/** Floating cartoon sleep 'Zzz' bubbles */
export const drawZzz = (p, k = 0) => {
  const g = p.g; g.save();
  for (let i = 0; i < 3; i++) {
    const u = (k + i / 3) % 1;
    const x = 250 + u * 140 + Math.sin(u * 6) * 18;
    const y = 620 - u * 320;
    const sz = 44 + u * 42;
    g.globalAlpha = Math.sin(u * Math.PI);
    g.font = `900 ${Math.round(sz)}px Arial, sans-serif`;
    g.lineWidth = 9; g.strokeStyle = INK; g.fillStyle = "#9fe3ff";
    g.strokeText("Z", x, y); g.fillText("Z", x, y);
  }
  g.restore();
};

/** Expanding comic megaphone sound arcs when Mom shouts from kitchen */
export const drawShoutArcs = (p, k = 0) => {
  for (let i = 0; i < 3; i++) {
    const u = (k + i / 3) % 1;
    const r = 65 + u * 195;
    p.arc(240, 480, r, r * 1.15, 135, 225, Math.max(4, 14 * (1 - u)), i % 2 ? "#ffd644" : "#ff6b4a");
  }
};

/** Soft white rising steam puffs for Dream Feast & cozy finale pot */
export const drawSteamPuff = (p, k = 0.5) => {
  const g = p.g; g.save();
  g.globalAlpha = Math.max(0.12, Math.sin(k * Math.PI) * 0.82);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + k * 2, r = 45 + 65 * k;
    p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.65, 72 + 30 * k, 58 + 25 * k, "#ffffff", 7);
  }
  p.ell(300, 520, 92 + 40 * k, 72 + 30 * k, "#ffffff", 0);
  g.restore();
};

/** Sprinting cartoon dust puffs behind Kid's heels! */
export const fxDust = (p, k, col = "#f2dec0") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 75 + 135 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.6, 95 + 45 * k, 78 + 38 * k, col, 10);
  }
  p.ell(300, 540, 135 + 85 * k, 105 + 60 * k, col, 0);
  g.restore();
};
