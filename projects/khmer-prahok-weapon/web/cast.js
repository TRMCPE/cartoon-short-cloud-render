// ---------------- Angkor-Era Khmer Cast, Jungle Beasts & Visual Props (built on toonbase.js Pen) ----------------
FACE.determined = { eye: ["lid", "lid"], brow: [4, -2], mouth: "teeth" };
FACE.effort = { eye: ["squeeze", "squeeze"], brow: [4, -1], mouth: "teeth" };
FACE.sneaky = { eye: ["slit", "slit"], brow: [4, -3], mouth: "smirk" };
FACE.cough = { eye: ["squeeze", "squeeze"], brow: [-4, 3], mouth: "wave" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smileWide" };
FACE.warm = { eye: ["dot", "dot"], brow: [-2, -1], mouth: "smile" };
FACE.disgust = { eye: ["squeeze", "lid"], brow: [3, -3], mouth: "wave" };

const KH_GOLD = "#f2c144", KH_SAFFRON = "#e59428", KH_CRIMSON = "#9e2436", KH_LOTUS = "#d86b86";
const KH_INDIGO = "#2e4b6b", KH_TEAK = "#6e4427", KH_CLAY = "#7c4222", KH_JADE = "#3b845c";

export const KH_ROLES = {
  mother: {
    skin: "#db9d6e", top: "#f5d796", sbai: KH_LOTUS, sampot: KH_CRIMSON,
    hair: "bun", hairCol: "#231918", flower: true, skirt: true,
  },
  son: {
    skin: "#d39262", top: "#e4b97c", krama: "#c92e34", sampot: KH_INDIGO,
    hair: "short", hairCol: "#1f1716", bag: true,
  },
  banditA: {
    skin: "#c68658", top: "#474d38", sampot: "#2e2a27",
    hair: "bandana", bandCol: "#7a2626", moustache: "#231a16", blade: true, stout: true,
  },
  banditB: {
    skin: "#cf9164", top: "#574335", sampot: "#332f38",
    hair: "bandana", bandCol: "#3c4b34", blade: true,
  },
  scholar: {
    skin: "#dfab80", top: "#f7f2e4", sbai: KH_SAFFRON, sampot: "#8c5226",
    hair: "bun_m", hairCol: "#4a4440", moustache: "#5a534e", scroll: true,
  },
  merchant: {
    skin: "#d89c6e", top: "#487c6c", krama: KH_GOLD, sampot: "#6d3b4e",
    hair: "short", hairCol: "#241b18", stout: true,
  },
};

const drawKhmerHair = (p, O, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, W = 2 * H.a, HH = 2 * H.b, hCol = O.hairCol || "#221817";
  if (O.hair === "bun" || O.hair === "bun_m") {
    // Neat top bun (បួងសក់ខ្មែរ) + smooth hairline
    const cap = ellPts(cx, hc - 0.34 * H.b, H.a * 1.03, H.b * 0.72, 180, 360, 0, 40);
    p.shadedFill(cap, hCol, "#110b0b", light, H.a, 0.35);
    p.poly(cap, null, ow * 0.82);
    const by = crown - 0.10 * HH, bx = cx - 4 * u * facing;
    const bun = ellPts(bx, by, 0.28 * W, 0.20 * HH, 0, 360, 0, 32);
    p.shadedFill(bun, hCol, "#100a0a", light, 0.28 * W, 0.35);
    p.inkRing(bun, ow * 0.8, thick);
    p.band([[bx - 0.24 * W, by + 6 * u], [bx + 0.24 * W, by + 6 * u]], KH_GOLD, 5.5 * u, 1.6 * u, "round");
    if (O.flower) {
      p.ell(bx + 0.22 * W, by + 4 * u, 9 * u, 9 * u, "#fff8e8", 2.2 * u);
      p.dot(bx + 0.22 * W, by + 4 * u, 3.5 * u, KH_GOLD);
    }
  } else if (O.hair === "short") {
    const cap = ellPts(cx, hc - 0.38 * H.b, H.a * 1.03, H.b * 0.68, 180, 360, 0, 40);
    p.shadedFill(cap, hCol, "#110b0b", light, H.a, 0.35);
    p.inkRing(cap, ow * 0.82, thick);
    if (O.krama) {
      // Iconic red-white checked Khmer Krama headband!
      const ky = hc - 0.44 * H.b;
      p.band([[cx - H.a * 1.04, ky], [cx + H.a * 1.04, ky]], O.krama, 10 * u, 2.2 * u, "round");
      for (let i = -3; i <= 3; i += 2) {
        p.poly(rrect(cx + i * 19 * u - 5 * u, ky - 4 * u, cx + i * 19 * u + 5 * u, ky + 4 * u, 1.5 * u), "#fff7ee", 0);
      }
      // Krama knot tails fluttering on back/side
      const kx = cx - (facing || 1) * H.a * 0.96;
      p.poly([[kx, ky], [kx - (facing || 1) * 26 * u, ky + 14 * u], [kx - (facing || 1) * 18 * u, ky + 26 * u]], O.krama, 2.4 * u);
    }
  } else if (O.hair === "bandana") {
    const ky = hc - 0.36 * H.b;
    const dom = ellPts(cx, ky, H.a * 1.05, H.b * 0.70, 180, 360, 0, 38);
    p.shadedFill(dom, O.bandCol || "#6b2424", mul(O.bandCol || "#6b2424", [0.65, 0.65, 0.72]), light, H.a, 0.35);
    p.inkRing(dom, ow * 0.85, thick);
    p.band([[cx - H.a * 1.06, ky], [cx + H.a * 1.06, ky]], shade(O.bandCol || "#6b2424", 0.82), 9 * u, 2 * u, "round");
  }
};

/** Small glazed Prahok jar drawn in character's hands */
const drawMiniJar = (p, x, y, u, open = false) => {
  const body = ellPts(x, y, 22 * u, 25 * u, 0, 360, 0, 32);
  p.shadedFill(body, KH_CLAY, "#46220e", rad(-120), 22 * u, 0.38);
  p.inkRing(body, 3.6 * u, thickAngle(rad(-120)));
  // Gold wavy band
  p.band([[x - 19 * u, y - 6 * u], [x + 19 * u, y - 6 * u]], KH_GOLD, 3.5 * u, 1.0 * u, "round");
  // Neck rim
  p.poly(rrect(x - 14 * u, y - 28 * u, x + 14 * u, y - 20 * u, 3 * u), "#94522c", 2.8 * u);
  if (!open) {
    // Tied banana-leaf / clay lid
    p.ell(x, y - 30 * u, 15 * u, 6 * u, "#5e7d3a", 2.6 * u);
  } else {
    // Savory golden-green glow at mouth
    p.ell(x, y - 26 * u, 13 * u, 4.5 * u, "#d8e86b", 2 * u);
  }
};

/** Front/3-4 Angkor-era Khmer character */
export const khmerChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? KH_ROLES[key] : key;
  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, wv = 0,
    jar = false, jarOpen = false, riceBowl = false, pestle = false,
    bag = O.bag, blade = false, scroll = false, greenTint = false,
  } = opts;

  const lid = lidOf(blink), skin = greenTint ? "#b8cf96" : (O.skin ?? SKIN);
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.06, legsL = 1.35, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(skin, INK, 0.28), armCol = mix(skin, INK, 0.22);

  p.rot = null;

  // ---- Legs & traditional sandals / bare ankles ----
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 28 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, "#5c3a24");
  }

  // ---- Upper body & Angkor sampot ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = {
    a: (0.4 * W) / 1.06 * (O.stout ? 1.14 : 1), b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.18 : 0.11, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "sampheah": // Traditional Khmer សំពះ palms together at chest!
        return { pts: [s, [X(16), s[1] + 0.42 * HH], [tcx + side * 4 * u, chin + 0.42 * HH]], front: true, palm: true };
      case "hold":
        return { pts: [s, [X(16), s[1] + 0.36 * HH], [tcx + side * 18 * u, torsoBot - 0.30 * HH]], front: true };
      case "offer":
        return { pts: [s, [X(24), s[1] + 0.20 * HH], [tcx + side * 34 * u + (facing * 18 * u), torsoBot - 0.42 * HH]], front: true };
      case "flex": // Muscular hero flex!
        return { pts: [s, [X(38), s[1] + 0.02 * HH], [X(28), s[1] - 0.48 * HH]], front: true, bicep: true };
      case "shrug":
        return { pts: [s, [X(24), s[1] + 0.26 * HH], [X(50), s[1] - 0.06 * HH]], front: false };
      case "pinch": // Pinching nose at spoiled meat or fumes
        return { pts: [s, [X(24), s[1] - 0.06 * HH], [cx + 8 * u * facing, hc + 8 * u]], front: true };
      case "pound": {
        const py = Math.sin(wv) * 0.18 * HH;
        return { pts: [s, [X(20), s[1] + 0.10 * HH + py], [tcx + side * 14 * u, s[1] + 0.32 * HH + py]], front: true };
      }
      case "eat":
        return { pts: [s, [X(22), s[1] + 0.06 * HH], [cx + 10 * u * facing, hc + 22 * u]], front: true };
      case "up":
        return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.82 * HH]], front: false };
      case "wave":
        return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "point":
        return { pts: [s, [X(28), s[1] - 0.05 * HH], [X(62), s[1] - 0.20 * HH]], front: false };
      case "hip":
        return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.25 * HH]], front: false };
      default:
        return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), a.bicep ? 7.2 * u : 5.2 * u, armCol);
    if (a.bicep) p.ell(a.pts[1][0], a.pts[1][1] - 4 * u, 9 * u, 7 * u, skin, 2.5 * u);
    p.dot(a.pts[2][0], a.pts[2][1], 5.6 * u);
  };

  for (const a of arms) if (!a.front) drawArm(a);

  // ---- Sampot Hol (Mother's long woven silk skirt) or Sampot Chang Kben (wrapped trousers) ----
  if (O.skirt) {
    const sk = [
      [tcx - 0.92 * T.a, torsoBot - 0.22 * HH], [tcx + 0.92 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.02 * T.a, sole - 0.24 * HH], [tcx - 1.02 * T.a, sole - 0.24 * HH],
    ];
    p.gradFill(sk, O.sampot, mul(O.sampot, SH_CLOTH), light);
    p.clip(sk, () => {
      // Gold silk hem band (សំពត់ហូល)
      const hy = sole - 0.36 * HH;
      p.band([[tcx - 1.1 * T.a, hy], [tcx + 1.1 * T.a, hy]], KH_GOLD, 9 * u, 1.5 * u);
      p.band([[tcx - 1.1 * T.a, hy - 14 * u], [tcx + 1.1 * T.a, hy - 14 * u]], KH_GOLD, 4 * u, 1.0 * u);
    });
    p.inkRing(sk, ow * 0.9, thick);
  } else {
    // Rolled Sampot Chang Kben (សំពត់ចងក្បិន) knee-length drape
    const ck = [
      [tcx - 0.95 * T.a, torsoBot - 0.22 * HH], [tcx + 0.95 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.04 * T.a, torsoBot + 0.38 * HH], [tcx, torsoBot + 0.26 * HH], [tcx - 1.04 * T.a, torsoBot + 0.38 * HH],
    ];
    p.gradFill(ck, O.sampot, mul(O.sampot, SH_CLOTH), light);
    p.inkRing(ck, ow * 0.85, thick);
  }

  // ---- Torso + Sbai / Sash / Thong Yam Shoulder Bag ----
  p.gradFill(tp, O.top, mul(O.top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.sbai) {
      // Diagonal pleated silk Sbai (ស្បៃ) across left shoulder to right hip
      p.band([[tcx - 0.95 * T.a, chin - 0.05 * HH], [tcx + 1.05 * T.a, torsoBot - 0.14 * HH]], O.sbai, 0.22 * HH, 2.0 * u);
      p.band([[tcx - 0.95 * T.a, chin - 0.05 * HH], [tcx + 1.05 * T.a, torsoBot - 0.14 * HH]], KH_GOLD, 3.5 * u, 0);
    }
    // Gold/cloth waist belt (ខ្សែក្រវាត់)
    p.band([[tcx - 1.4 * T.a, torsoBot - 0.20 * HH], [tcx + 1.4 * T.a, torsoBot - 0.20 * HH]], O.sbai ? KH_GOLD : "#8c542b", 7 * u, 1.6 * u);
    if (bag) {
      // Woven red-ochre Thong Yam strap across chest (ខ្សែថង់យាម)
      p.band([[tcx + 0.85 * T.a, chin - 0.04 * HH], [tcx - 0.95 * T.a, torsoBot - 0.08 * HH]], "#b8322c", 9 * u, 1.8 * u);
    }
  });
  p.inkRing(tp, ow, thick);

  // Woven Thong Yam pouch (ថង់យាម) resting at left hip!
  if (bag) {
    const bx = tcx - 0.82 * T.a, by = torsoBot + 0.04 * HH;
    const pouch = rrect(bx - 22 * u, by - 20 * u, bx + 22 * u, by + 22 * u, 7 * u);
    p.shadedFill(pouch, "#c43830", "#7d1f1c", light, 22 * u, 0.35);
    p.clip(pouch, () => {
      p.band([[bx - 24 * u, by - 4 * u], [bx + 24 * u, by - 4 * u]], KH_GOLD, 5 * u, 1.2 * u);
      p.band([[bx - 24 * u, by + 8 * u], [bx + 24 * u, by + 8 * u]], "#fff5e0", 3.5 * u, 0);
    });
    p.inkRing(pouch, ow * 0.78, thick);
  }

  for (const a of arms) if (a.front) drawArm(a);

  // Sampheah joined golden-lit hands highlight
  if (L === "sampheah" && R === "sampheah") {
    const sx = tcx, sy = chin + 0.38 * HH;
    p.poly([[sx - 8 * u, sy + 12 * u], [sx, sy - 16 * u], [sx + 8 * u, sy + 12 * u]], skin, 3.2 * u);
  }

  // ---- Held Props ----
  const [rhx, rhy] = arms[1].pts[2];
  const [lhx, lhy] = arms[0].pts[2];

  if (jar) {
    const jx = (L === "hold" && R === "hold") ? tcx : rhx + (facing || 1) * 8 * u;
    const jy = (L === "hold" && R === "hold") ? torsoBot - 0.36 * HH : rhy - 8 * u;
    drawMiniJar(p, jx, jy, u, jarOpen);
  }
  if (riceBowl) {
    // Steaming hot rice bowl (ចានបាយក្តៅៗ)
    const bx = lhx + 6 * u, by = lhy - 8 * u;
    p.ell(bx, by - 6 * u, 20 * u, 12 * u, "#fffdf7", 2.8 * u);
    const bowl = ellPts(bx, by - 4 * u, 22 * u, 16 * u, 0, 180, 0, 24);
    p.shadedFill(bowl, "#8a4b2a", "#542a14", light, 22 * u, 0.35);
    p.poly(bowl, null, 3.2 * u);
  }
  if (pestle) {
    // Heavy wooden pestle (អង្រែបុកប្រហុក)
    p.band([[rhx, rhy - 54 * u], [rhx, rhy + 56 * u]], "#8c5c34", 8 * u, 2.2 * u, "round");
  }
  if (blade && O.blade) {
    // Bandit curved forest blade (ដាវចោរព្រៃ)
    const tipX = rhx + (facing || -1) * 44 * u, tipY = rhy - 58 * u;
    p.band([[rhx, rhy], [rhx - (facing || -1) * 8 * u, rhy + 14 * u]], "#5c3820", 6 * u, 1.8 * u, "round");
    p.poly([[rhx, rhy - 4 * u], [rhx + (facing || -1) * 18 * u, rhy - 34 * u], [tipX, tipY], [rhx + (facing || -1) * 6 * u, rhy - 28 * u]], "#cfd6de", 2.8 * u);
  }
  if (scroll || O.scroll) {
    // Palm-leaf manuscript (សាស្ត្រាស្លឹករឹត)
    p.poly(rrect(lhx - 26 * u, lhy - 12 * u, lhx + 26 * u, lhy + 8 * u, 4 * u), "#e6c98a", 2.8 * u);
    p.stroke([[lhx - 20 * u, lhy - 2 * u], [lhx + 20 * u, lhy - 2 * u]], 2 * u, "#7a5428");
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawKhmerHair(p, O, H, cx, hc, light, thick, ow, u, facing);

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.moustache, !!O.stout);
  p.rot = null;
};

/** Indochinese Jungle Tiger (ខ្លាព្រៃ) — mode: 'prowl' | 'sniff' | 'flee' */
export const drawTiger = (p, opts = {}) => {
  const { mode = "prowl", phase = 0, blink = 0 } = opts;
  const light = rad(-120), thick = thickAngle(light), orange = "#e88428", dark = "#a65214", cream = "#fff2d9";
  p.rot = null;
  const cy = mode === "sniff" ? 690 : 760 - Math.abs(Math.sin(phase)) * (mode === "flee" ? 48 : 14);
  // Tail
  const tailWag = Math.sin(phase * 2) * 28;
  p.band([[175, cy - 10], [110, cy - 85 + tailWag], [88, cy - 140 + tailWag]], orange, 22, 6, "round");
  p.dot(88, cy - 140 + tailWag, 14, INK);
  // Legs
  const stride = mode === "sniff" ? 0 : Math.sin(phase) * (mode === "flee" ? 65 : 28);
  for (const [bx, s] of [[205, 1], [255, -1], [355, -1], [405, 1]]) {
    const fx = bx + stride * s, fy = mode === "flee" ? 945 - Math.max(0, Math.cos(phase + s)) * 45 : 965;
    p.band([[bx, cy + 40], [fx, fy]], orange, 26, 6.5, "round");
    p.ell(fx + 8, fy, 20, 12, cream, 5.5);
  }
  // Torso
  const body = ellPts(300, cy, 132, 74, 0, 360, mode === "sniff" ? -12 : 0, 44);
  p.shadedFill(body, orange, dark, light, 132, 0.4);
  p.clip(body, () => {
    p.ell(310, cy + 52, 105, 38, cream, 0);
    for (let i = -3; i <= 3; i++) {
      const sx = 290 + i * 32;
      p.poly([[sx - 7, cy - 75], [sx + 7, cy - 75], [sx + 2, cy - 12]], INK, 0);
    }
  });
  p.inkRing(body, 11, thick);
  // Tiger Head
  const hx = mode === "sniff" ? 395 : 418, hy = mode === "sniff" ? cy - 95 : cy - 52;
  for (const s of [-1, 1]) {
    p.ell(hx + s * 52, hy - 58, 22, 22, orange, 8);
    p.ell(hx + s * 52, hy - 58, 10, 10, cream, 0);
  }
  const hd = ellPts(hx, hy, 78, 68, 0, 360, 0, 40);
  p.shadedFill(hd, orange, dark, light, 78, 0.4);
  p.clip(hd, () => {
    p.ell(hx + 14, hy + 26, 52, 36, cream, 0);
    for (const sy of [-28, -8]) p.poly([[hx - 78, hy + sy], [hx - 36, hy + sy + 5], [hx - 78, hy + sy + 11]], INK, 0);
  });
  p.inkRing(hd, 11, thick);
  // Nose & Mouth & Eyes
  p.poly([[hx + 4, hy + 8], [hx + 30, hy + 8], [hx + 17, hy + 22]], "#d95b72", 5);
  if (mode === "sniff" || mode === "flee") {
    // Huge shocked cartoon eyes + panicked open jaw + sweat drops!
    for (const ex of [hx - 14, hx + 32]) {
      p.ell(ex, hy - 14, 19, 21, "#ffffff", 5.5);
      p.dot(ex + 3, hy - 14, 6.5, INK);
    }
    p.ell(hx + 18, hy + 40, 20, 22, "#5a1e28", 5.5);
    p.ell(hx - 48, hy - 42, 7, 13, "#8fd4ff", 4);
  } else {
    // Fierce prowling eyes + sharp white fangs
    for (const ex of [hx - 14, hx + 32]) {
      p.ell(ex, hy - 12, 14, 10, "#ffe45c", 5);
      p.dot(ex + 3, hy - 12, 5, INK);
      p.stroke([[ex - 16, hy - 26], [ex + 14, hy - 18]], 7, INK);
    }
    p.stroke([[hx - 6, hy + 32], [hx + 38, hy + 32]], 6, INK);
    p.poly([[hx + 2, hy + 32], [hx + 10, hy + 48], [hx + 16, hy + 32]], "#ffffff", 4);
    p.poly([[hx + 24, hy + 32], [hx + 31, hy + 48], [hx + 37, hy + 32]], "#ffffff", 4);
  }
};

/** Wild Jungle Boar (ជ្រូកព្រៃ) — mode: 'prowl' | 'sniff' | 'flee' */
export const drawBoar = (p, opts = {}) => {
  const { mode = "prowl", phase = 0 } = opts;
  const light = rad(-120), thick = thickAngle(light), fur = "#594338", dark = "#362620";
  p.rot = null;
  const cy = 805 - Math.abs(Math.sin(phase)) * (mode === "flee" ? 38 : 10);
  const stride = mode === "sniff" ? 0 : Math.sin(phase) * (mode === "flee" ? 48 : 22);
  for (const [bx, s] of [[225, 1], [265, -1], [345, -1], [385, 1]]) {
    p.band([[bx, cy + 35], [bx + stride * s, 965]], dark, 20, 5.5, "round");
  }
  const body = ellPts(300, cy, 112, 72, 0, 360, 0, 40);
  p.shadedFill(body, fur, dark, light, 112, 0.4);
  p.inkRing(body, 10, thick);
  // Snout & curved white tusks
  const sx = 415, sy = cy + 6;
  p.ell(sx, sy, 34, 28, "#8c6258", 7);
  p.dot(sx + 8, sy - 4, 5, INK); p.dot(sx + 20, sy - 4, 5, INK);
  p.poly([[sx - 6, sy + 10], [sx + 18, sy - 34], [sx + 6, sy + 14]], "#fffdf5", 5);
  if (mode === "sniff" || mode === "flee") {
    p.ell(370, cy - 22, 18, 20, "#ffffff", 5); p.dot(373, cy - 22, 6, INK);
    p.ell(335, cy - 55, 7, 13, "#8fd4ff", 3.5);
  } else {
    p.ell(370, cy - 20, 12, 9, "#ffd24c", 4.5); p.dot(373, cy - 20, 4.5, INK);
    p.stroke([[354, cy - 32], [384, cy - 24]], 6.5, INK);
  }
};

/** Visual Storytelling Graphic Cards (zero tiny text, bold Rollo-style comic visuals!) */
export const drawIconCard = (p, kind = "noWeapons", k = 1) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;
  if (kind === "noWeapons") {
    // Glowing parchment medallion with crossed Angkor Sword & Spear + bold red X slam!
    const bg = ellPts(300, 500, 215, 215, 0, 360, 0, 48);
    p.shadedFill(bg, "#fff6df", "#e0cca0", light, 215, 0.4);
    p.inkRing(bg, 13, thick);
    // Spear
    p.band([[165, 645], [420, 365]], "#8a562e", 16, 5, "round");
    p.poly([[405, 380], [452, 330], [430, 396]], "#cfd8e2", 7);
    // Curved Khmer Sword (ដាវ)
    p.band([[435, 645], [380, 585]], "#6e3b1e", 18, 5, "round");
    p.poly([[388, 592], [235, 420], [160, 345], [210, 445], [372, 606]], "#dce3ec", 7.5);
    if (k > 0.05) {
      const s = Math.min(1.12, k * 1.25), r = 145 * s;
      p.band([[300 - r, 500 - r], [300 + r, 500 + r]], "#d92626", 34, 8, "round");
      p.band([[300 + r, 500 - r], [300 - r, 500 + r]], "#d92626", 34, 8, "round");
    }
  } else if (kind === "noFridge") {
    // Anachronistic icy blue refrigerator signboard + bold red X!
    const box = rrect(175, 290, 425, 730, 26);
    p.shadedFill(box, "#d8f3ff", "#8fc8e8", light, 140, 0.4);
    p.inkRing(box, 12, thick);
    p.stroke([[180, 465], [420, 465]], 9, INK);
    p.band([[212, 355], [212, 435]], "#ffffff", 12, 4, "round");
    p.band([[212, 505], [212, 620]], "#ffffff", 12, 4, "round");
    if (k > 0.05) {
      const r = 155 * Math.min(1.05, k * 1.2);
      p.band([[300 - r, 510 - r], [300 + r, 510 + r]], "#d92626", 32, 8, "round");
      p.band([[300 + r, 510 - r], [300 - r, 510 + r]], "#d92626", 32, 8, "round");
    }
  } else if (kind === "noShop") {
    // Roadside food stall awning signboard + bold red X!
    const counter = rrect(155, 520, 445, 720, 14);
    p.shadedFill(counter, "#c4884c", "#875628", light, 145, 0.4);
    p.inkRing(counter, 11, thick);
    p.band([[175, 360], [175, 530]], "#6e4222", 14, 4, "round");
    p.band([[425, 360], [425, 530]], "#6e4222", 14, 4, "round");
    for (let i = 0; i < 5; i++) {
      const x0 = 145 + i * 62;
      p.poly([[x0, 320], [x0 + 62, 320], [x0 + 58, 415], [x0 + 4, 415]], i % 2 ? "#fff5e4" : "#d93b3b", 8);
    }
    if (k > 0.05) {
      const r = 160 * Math.min(1.05, k * 1.2);
      p.band([[300 - r, 515 - r], [300 + r, 515 + r]], "#d92626", 32, 8, "round");
      p.band([[300 + r, 515 - r], [300 - r, 515 + r]], "#d92626", 32, 8, "round");
    }
  } else if (kind === "spoiledMeat") {
    // k = 0 (fresh pink steak) -> k = 1 (greenish-grey spoiled meat + stink waves + flies!)
    const col = mix("#e86874", "#7b8f56", k);
    const shCol = mix("#a83846", "#4b5932", k);
    const slab = ellPts(300, 610, 145, 82, 0, 360, -8, 40);
    p.shadedFill(slab, col, shCol, light, 145, 0.4);
    p.inkRing(slab, 11, thick);
    p.ell(255, 600, 34, 24, mix("#fff5f0", "#cbd4b0", k), 7);
    if (k > 0.35) {
      // Green stink waves + buzzing flies!
      for (const sx of [235, 305, 370]) {
        const pts = [];
        for (let j = 0; j <= 10; j++) pts.push([sx + Math.sin(j * 0.8 + k * 8) * 16, 505 - j * 18]);
        p.stroke(pts, 9, "#82b83e");
      }
      for (let i = 0; i < 4; i++) {
        const a = k * 9 + i * 1.7, fx = 300 + Math.cos(a) * 115, fy = 435 + Math.sin(a * 1.6) * 45;
        p.ell(fx - 9, fy - 7, 9, 6, "#d9f0ff", 3); p.ell(fx + 9, fy - 7, 9, 6, "#d9f0ff", 3);
        p.dot(fx, fy, 8, INK);
      }
    }
  } else if (kind === "poisonBubble") {
    // Bandits' comedic thought bubble: skull inside purple-green ancient poison cloud!
    for (const [bx, by, r] of [[240, 740, 18], [265, 680, 28]]) p.ell(bx, by, r, r, "#f4fde8", 7);
    const cl = ellPts(300, 480, 185, 145, 0, 360, 0, 44);
    p.shadedFill(cl, "#e8f8d0", "#b5d88b", light, 185, 0.4);
    p.inkRing(cl, 11, thick);
    // Cartoon Skull
    p.ell(300, 455, 68, 62, "#ffffff", 9);
    p.poly(rrect(272, 495, 328, 538, 10), "#ffffff", 8);
    p.dot(276, 452, 15, INK); p.dot(324, 452, 15, INK);
    p.poly([[294, 480], [306, 480], [300, 494]], INK, 0);
    for (const tx of [288, 300, 312]) p.stroke([[tx, 505], [tx, 534]], 5, INK);
  } else if (kind === "heartGlow") {
    // Warm crimson-gold Mother's Love heart emblem!
    const s = 1 + 0.08 * Math.sin(k * 6);
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([300 + x * 9.5 * s, 470 + y * 9.5 * s]);
    }
    p.shadedFill(pts, "#e8384f", "#9e192c", light, 150, 0.4);
    p.inkRing(pts, 11, thick);
  } else if (kind === "powerAura") {
    // Golden starburst power aura!
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + k * 0.4;
      const r = i % 2 === 0 ? 225 : 135;
      pts.push([300 + Math.cos(a) * r, 500 + Math.sin(a) * r]);
    }
    p.poly(pts, "#ffe05c", 10);
  }
};

/** Swirling Golden-Emerald Prahok Aroma Cloud (ក្លិនប្រហុកសាយភាយពេញព្រៃ!) */
export const drawAromaCloud = (p, k = 0.5, green = false) => {
  const g = p.g; g.save();
  g.globalAlpha = Math.max(0.15, Math.min(0.92, 1 - k * 0.65));
  const cMain = green ? "#a9db58" : "#f5d458";
  const cSub = green ? "#7eb83d" : "#c7e063";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + k * 2.2, r = 65 + 95 * k;
    p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.65, 95 + 40 * k, 75 + 32 * k, i % 2 ? cMain : cSub, 9);
  }
  p.ell(300, 520, 125 + 55 * k, 95 + 42 * k, cMain, 0);
  // Aromatic swirl curl inside
  const sw = [];
  for (let t = 0; t < 22; t++) {
    const a = t * 0.42 + k * 4, rr = 12 + t * 4.5;
    sw.push([300 + Math.cos(a) * rr, 520 + Math.sin(a) * rr * 0.7]);
  }
  p.stroke(sw, 8, "#ffffffcc");
  g.restore();
};

export const fxDust = (p, k, col = "#e6cfa8") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, r = 85 + 145 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.6, 110 + 55 * k, 90 + 45 * k, col, 11);
  }
  p.ell(300, 540, 155 + 100 * k, 125 + 70 * k, col, 0);
  g.restore();
};
