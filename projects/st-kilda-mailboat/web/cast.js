// ---------------- St Kilda Cast & Custom 2D Props/FX (built on toonbase.js) ----------------
FACE.determined = { eye: ["lid", "lid"], brow: [4, -2], mouth: "teeth" };
FACE.worried    = { eye: ["small", "small"], brow: [-4, 3], mouth: "frown" };
FACE.hopeful    = { eye: ["dot", "dot"], brow: [-3, -1], mouth: "smile" };
FACE.amazed     = { eye: ["shock", "shock"], brow: [-6, -6], mouth: "O" };
FACE.effort     = { eye: ["squeeze", "squeeze"], brow: [4, -1], mouth: "teeth" };
FACE.idea       = { eye: ["shock", "shock"], brow: [-5, -5], mouth: "grin" };

const TARTAN_RED = "#b82e2b", TARTAN_GRN = "#285942", GOLD = "#ffd644", NAVY = "#1f3a5c", CREAM = "#efe6d2";

export const ROLES = {
  islanderA:    { skin: "#f2c6a6", shirt: CREAM, vest: "#46505c", pants: "#383d45", hat: "tam", sweaterKnit: true },
  islanderB:    { skin: "#f6d1b6", shirt: TARTAN_GRN, shawl: TARTAN_RED, skirt: "#3a3846", hat: "kerchief" },
  elder:        { skin: "#edc1a2", shirt: "#6b5644", vest: "#4c3e33", pants: "#332e2a", hat: "flatcap", beard: "#e8e4dc", moustache: "#e8e4dc", stout: true },
  scotFinder:   { skin: "#f4ccb0", shirt: "#e2b132", buttons: "#2a241d", pants: "#2b3b4e", hat: "souwester", moustache: "#6e4b30" },
  norwayFinder: { skin: "#f7d5be", shirt: "#223b63", nordicBand: true, pants: "#313842", hat: "beanie", beard: "#d9b066", moustache: "#d9b066", stout: true },
};

/** Draw custom Scottish Hebridean & Norwegian period hats */
const drawKildaHat = (p, role, hp, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, W = 2 * H.a, HH = 2 * H.b;
  const yb = crown + 0.25 * HH;
  if (role.hat === "tam") {
    // Classic Scottish Tam o' Shanter wool bonnet with crimson pom-pom
    const puff = ellPts(cx - 4 * u * facing, yb - 0.14 * HH, 0.58 * W, 0.22 * HH, 0, 360, -6 * facing, 40);
    p.shadedFill(puff, "#354d6b", "#203045", light, 0.58 * W, 0.35);
    p.inkRing(puff, ow * 0.85, thick);
    p.poly(rrect(cx - 0.44 * W, yb - 0.04 * HH, cx + 0.44 * W, yb + 0.06 * HH, 4 * u), "#25374d", ow * 0.7);
    p.ell(cx - 2 * u * facing, yb - 0.35 * HH, 10 * u, 9 * u, TARTAN_RED, 2.5 * u);
  } else if (role.hat === "flatcap") {
    // Scottish herringbone tweed flat cap
    const dome = ellPts(cx + 2 * u * facing, yb - 0.06 * HH, 0.52 * W, 0.22 * HH, 175, 365, 0, 36);
    p.shadedFill(dome, "#594a3c", "#382e25", light, 0.52 * W, 0.35);
    p.inkRing(dome, ow * 0.82, thick);
    p.ell(cx + 12 * u * facing, yb + 0.02 * HH, 0.48 * W, 0.065 * HH, "#3d332a", 2.6 * u, 0, 180);
  } else if (role.hat === "kerchief") {
    // Warm knitted Hebridean headscarf framing the head
    const hood = ellPts(cx, hc - 0.06 * HH, H.a * 1.07, H.b * 1.05, 165, 375, 0, 40);
    p.shadedFill(hood, "#b84435", "#7a281f", light, H.a * 1.07, 0.35);
    p.inkRing(hood, ow * 0.82, thick);
    // Warm chestnut hair bangs peeking under headscarf
    const hair = ellPts(cx, yb + 4 * u, 0.38 * W, 0.12 * HH, 180, 360, 0, 24);
    p.poly(hair, "#5c3b28", 2.2 * u);
  } else if (role.hat === "souwester") {
    // Classic bright-yellow maritime sou'wester waterproof rain hat
    const dome = ellPts(cx, yb + 2 * u, 0.46 * W, 0.32 * HH, 180, 360, 0, 36);
    p.shadedFill(dome, "#ebb934", "#b8871c", light, 0.46 * W, 0.35);
    p.inkRing(dome, ow * 0.85, thick);
    const brim = [
      [cx - 0.64 * W, yb + 0.12 * HH], [cx - 0.46 * W, yb - 0.04 * HH],
      [cx + 0.46 * W, yb - 0.04 * HH], [cx + 0.64 * W, yb + 0.12 * HH],
      [cx + 0.42 * W, yb + 0.14 * HH], [cx - 0.42 * W, yb + 0.14 * HH],
    ];
    p.shadedFill(brim, "#f2c649", "#c29220", light, 0.64 * W, 0.35);
    p.inkRing(brim, ow * 0.8, thick);
  } else if (role.hat === "beanie") {
    // Classic red Norwegian knitted wool beanie with white ribbed cuff & pom-pom
    const dome = ellPts(cx, yb, 0.48 * W, 0.36 * HH, 180, 360, 0, 36);
    p.shadedFill(dome, "#c9322c", "#851e1a", light, 0.48 * W, 0.35);
    p.inkRing(dome, ow * 0.85, thick);
    p.poly(rrect(cx - 0.50 * W, yb - 0.06 * HH, cx + 0.50 * W, yb + 0.07 * HH, 6 * u), "#f5f2ea", ow * 0.75);
    p.ell(cx, yb - 0.38 * HH, 11 * u, 11 * u, "#f5f2ea", 2.6 * u);
  }
};

/** Front/3-4 St Kilda & North Atlantic cartoon character */
export const kildaChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? ROLES[key] : key;
  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), wv = 0,
    chisel = false, basket = false, medicine = false, spyglass = false,
    scroll = false, miniBoat = false, lantern = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.32, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.pants || O.skirt || "#333842", INK, 0.5);
  const armCol = mix(O.shirt, INK, 0.46);

  p.rot = null;

  // ---- Legs & sturdy boots ----
  for (const side of [-1, 1]) {
    const hx = cx + side * 16 * u, fx = cx + side * 21 * u, fy = sole - 4 * u;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.8 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.8 * u, "#2a201b");
  }

  // ---- Upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = {
    a: (0.41 * W) / 1.06 * (O.stout ? 1.14 : 1),
    b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.18 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "up":     return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.82 * HH]], front: false };
      case "wave":   return { pts: [s, [X(18), s[1] - 0.24 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "carve": {
        const ch = Math.sin(wv) * 14 * u;
        return { pts: [s, [X(24), s[1] + 0.18 * HH], [tcx + side * 0.28 * T.a + ch, torsoBot - 0.34 * HH + Math.abs(ch) * 0.4]], front: true };
      }
      case "hold":   return { pts: [s, [X(22), s[1] + 0.24 * HH], [X(36), s[1] - 0.04 * HH]], front: true };
      case "clasp":  return { pts: [s, [X(16), s[1] + 0.28 * HH], [tcx + side * 0.22 * T.a, torsoBot - 0.38 * HH]], front: true };
      case "throw":  return { pts: [s, [X(26), s[1] - 0.36 * HH], [X(56), s[1] - 0.72 * HH]], front: true };
      case "point":  return { pts: [s, [X(28), s[1] - 0.04 * HH], [X(64), s[1] - 0.14 * HH]], front: false };
      case "hip":    return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.24 * HH]], front: false };
      case "spy":    return { pts: [s, [X(24), s[1] - 0.1 * HH], [cx + side * 22 * u, hc + 2 * u]], front: true };
      case "shade":  return { pts: [s, [X(22), s[1] - 0.28 * HH], [cx + side * 24 * u, hc - 14 * u]], front: true };
      default:       return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.6 * u);
  };

  for (const a of arms) if (!a.front) drawArm(a);

  // ---- Torso / Skirt / Wool Sweater / Tartan Shawl / Nordic Pattern ----
  if (O.skirt) {
    const D = { a: 0.48 * W, b: 0.5 * ((sole - 0.38 * HH) - (chin - 0.15 * HH)), nTop: 2.0, nBot: 2.9, egg: 0.34, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(tcx, sole - 0.38 * HH - D.b, D);
    p.gradFill(dp, O.skirt, mul(O.skirt, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
  }

  p.gradFill(tp, O.shirt, mul(O.shirt, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.sweaterKnit) {
      // Subtle Aran knit vertical cable stripes
      for (const sx of [-20, 0, 20]) {
        p.stroke([[tcx + sx * u, chin], [tcx + sx * u, torsoBot]], 2.2 * u, "rgba(110,98,80,0.35)");
      }
    }
    if (O.vest) {
      // Open wool waistcoat over sweater
      p.poly([[tcx - 1.2 * T.a, chin - 4 * u], [tcx - 6 * u, chin + 0.14 * HH], [tcx - 6 * u, torsoBot + 10], [tcx - 1.2 * T.a, torsoBot + 10]], O.vest, 2.2 * u);
      p.poly([[tcx + 1.2 * T.a, chin - 4 * u], [tcx + 6 * u, chin + 0.14 * HH], [tcx + 6 * u, torsoBot + 10], [tcx + 1.2 * T.a, torsoBot + 10]], O.vest, 2.2 * u);
    }
    if (O.shawl) {
      // Scottish crimson/green/gold tartan plaid shawl draped across shoulders
      p.poly([[tcx - 1.3 * T.a, chin - 6 * u], [tcx + 1.3 * T.a, chin - 6 * u], [tcx + 1.1 * T.a, chin + 0.54 * HH], [tcx, chin + 0.68 * HH], [tcx - 1.1 * T.a, chin + 0.54 * HH]], O.shawl, 2.4 * u);
      for (const sy of [0.16, 0.36]) p.stroke([[tcx - 1.2 * T.a, chin + sy * HH], [tcx + 1.2 * T.a, chin + sy * HH]], 4.5 * u, TARTAN_GRN);
      for (const sx of [-22, 0, 22]) p.stroke([[tcx + sx * u, chin - 6 * u], [tcx + sx * u, chin + 0.65 * HH]], 3.6 * u, TARTAN_GRN);
      for (const sy of [0.26, 0.45]) p.stroke([[tcx - 1.2 * T.a, chin + sy * HH], [tcx + 1.2 * T.a, chin + sy * HH]], 2 * u, GOLD);
    }
    if (O.nordicBand) {
      // Iconic Norwegian chest knit band (white stripe + red diamond motifs)
      p.poly([[tcx - 1.3 * T.a, chin + 0.12 * HH], [tcx + 1.3 * T.a, chin + 0.12 * HH], [tcx + 1.3 * T.a, chin + 0.36 * HH], [tcx - 1.3 * T.a, chin + 0.36 * HH]], "#f5f2ea", 2 * u);
      for (const sx of [-26, -9, 9, 26]) {
        const dx = tcx + sx * u, dy = chin + 0.24 * HH;
        p.poly([[dx, dy - 8 * u], [dx + 6 * u, dy], [dx, dy + 8 * u], [dx - 6 * u, dy]], "#c9322c", 1.2 * u);
      }
    }
    if (O.buttons) {
      for (let i = 0; i < 4; i++) p.dot(tcx + 4 * u * facing, chin + (0.18 + i * 0.2) * HH, 3 * u, O.buttons);
    }
  });
  p.inkRing(tp, ow, thick);

  for (const a of arms) if (a.front) drawArm(a);

  // ---- Held Props ----
  const [lhx, lhy] = arms[0].pts[2];
  const [rhx, rhy] = arms[1].pts[2];

  if (chisel) {
    // Woodcarver's wooden handle + gleaming steel chisel blade
    p.band([[rhx + 14 * u, rhy - 12 * u], [rhx - 14 * u, rhy + 10 * u]], "#8f5a30", 6 * u, 2 * u, "round");
    p.band([[rhx - 14 * u, rhy + 10 * u], [rhx - 32 * u, rhy + 24 * u]], "#cfd8e3", 4.5 * u, 1.8 * u, "round");
  }
  if (basket) {
    // Empty overturned woven wicker bread/food basket
    const bx = rhx + 12 * u, by = rhy + 2 * u;
    p.poly([[bx - 24 * u, by - 14 * u], [bx + 24 * u, by - 14 * u], [bx + 18 * u, by + 16 * u], [bx - 18 * u, by + 16 * u]], "#c79652", 3.2 * u);
    p.stroke([[bx - 22 * u, by], [bx + 22 * u, by]], 2.2 * u, "#785326");
    p.arc(bx, by - 14 * u, 20 * u, 18 * u, 180, 360, 3.6 * u, "#8c612d");
  }
  if (medicine) {
    // Empty glass apothecary medicine bottle with bold Red Cross label!
    const mx = rhx + 8 * u, my = rhy - 12 * u;
    p.poly(rrect(mx - 14 * u, my - 18 * u, mx + 14 * u, my + 20 * u, 5 * u), "#d8f0f5", 3.2 * u);
    p.poly(rrect(mx - 6 * u, my - 28 * u, mx + 6 * u, my - 17 * u, 2 * u), "#d8f0f5", 2.6 * u);
    p.poly(rrect(mx - 7 * u, my - 34 * u, mx + 7 * u, my - 27 * u, 2 * u), "#a8703b", 2 * u);
    p.poly(rrect(mx - 11 * u, my - 8 * u, mx + 11 * u, my + 10 * u, 2 * u), "#ffffff", 1.8 * u);
    p.stroke([[mx, my - 5 * u], [mx, my + 7 * u]], 4 * u, "#d42b2b");
    p.stroke([[mx - 6 * u, my + 1 * u], [mx + 6 * u, my + 1 * u]], 4 * u, "#d42b2b");
  }
  if (scroll) {
    // Unrolled SOS parchment message with red wax seal
    const sx = rhx + 6 * u, sy = rhy - 18 * u;
    p.poly(rrect(sx - 24 * u, sy - 20 * u, sx + 24 * u, sy + 18 * u, 4 * u), "#faf0d5", 3.2 * u);
    for (const dy of [-10, -2, 6]) p.stroke([[sx - 16 * u, sy + dy * u], [sx + 16 * u, sy + dy * u]], 2.2 * u, "#4f3e2e");
    p.ell(sx + 12 * u, sy + 10 * u, 6 * u, 6 * u, "#c42b2b", 1.8 * u);
  }
  if (miniBoat) {
    // Held St Kilda carved wooden mailboat + floating tied sheep's bladder!
    const bx = rhx + 12 * u, by = rhy - 12 * u;
    // Twine line to bobbing cream float above
    p.stroke([[bx + 10 * u, by - 4 * u], [bx + 26 * u, by - 38 * u]], 2.8 * u, "#bfa16c");
    p.ell(bx + 28 * u, by - 48 * u, 16 * u, 19 * u, "#f5e3c4", 3 * u);
    // Tiny carved wooden boat hull
    p.poly([[bx - 24 * u, by - 6 * u], [bx + 26 * u, by - 6 * u], [bx + 16 * u, by + 10 * u], [bx - 16 * u, by + 10 * u]], "#b87c42", 3.2 * u);
    p.ell(bx, by - 4 * u, 5 * u, 5 * u, "#c42b2b", 1.5 * u);
  }
  if (lantern) {
    // Glowing warm brass cliffside storm lantern!
    const lx = rhx + 4 * u, ly = rhy + 22 * u;
    p.ell(lx, ly, 24 * u, 24 * u, "rgba(255,214,84,0.34)", 0);
    p.arc(lx, ly - 18 * u, 10 * u, 10 * u, 180, 360, 2.8 * u, "#4a3c28");
    p.poly(rrect(lx - 11 * u, ly - 12 * u, lx + 11 * u, ly + 12 * u, 3 * u), "#ffe47a", 3 * u);
    p.poly(rrect(lx - 13 * u, ly - 17 * u, lx + 13 * u, ly - 11 * u, 2 * u), "#5c4a2e", 2.4 * u);
    p.poly(rrect(lx - 14 * u, ly + 11 * u, lx + 14 * u, ly + 18 * u, 2 * u), "#5c4a2e", 2.4 * u);
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (O.beard) {
    // Full rounded Nordic / Hebridean fisherman beard clipped cleanly along chin
    const bd = ellPts(cx + 4 * u * facing, hc + 24 * u, 0.44 * W, 0.28 * HH, 0, 180, 0, 32);
    p.shadedFill(bd, O.beard, mul(O.beard, [0.82, 0.82, 0.86]), light, 0.44 * W, 0.35);
    p.poly(bd, null, ow * 0.72);
  }
  p.inkRing(hp, ow, thick);
  drawKildaHat(p, O, hp, H, cx, hc, light, thick, ow, u, facing);
  faceFront(p, cx, hc, W, expr, facing, look, lid, true, skin, O.moustache || null, !!O.stout);

  if (spyglass) {
    // Brass maritime spyglass held right up to the eye!
    const dir = facing || 1;
    const sx = cx + dir * 16 * u, sy = hc + 2 * u;
    p.band([[sx, sy], [sx + dir * 56 * u, sy - 6 * u]], "#d4a644", 11 * u, 2.6 * u, "butt");
    p.band([[sx + dir * 24 * u, sy - 3 * u], [sx + dir * 56 * u, sy - 6 * u]], "#8f6922", 14 * u, 2.4 * u, "butt");
  }

  p.rot = null;
};

// ---------------- Custom 2D Graphic Signboards & Atmospheric FX ----------------

const drawRedX = (p) => {
  for (const [a, b] of [[[85, 240], [515, 580]], [[515, 240], [85, 580]]]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 40, "#d92b2b");
  }
};

/** "No Radio" bold graphic signboard (vintage radio + giant Red X) */
export const fxNoRadio = (p) => {
  p.poly(rrect(30, 185, 570, 635, 36), "#faf2dc", 14);
  // Vintage radio antenna
  p.stroke([[380, 290], [455, 210]], 11, "#3b424d");
  p.ell(455, 210, 14, 14, "#d9342b", 6);
  // Wooden rounded radio cabinet
  p.poly(rrect(115, 290, 485, 565, 28), "#8f5a32", 12);
  p.poly(rrect(142, 318, 340, 535, 16), "#d9c498", 8);
  // Speaker grille lines
  for (let y = 345; y <= 510; y += 30) p.stroke([[162, y], [320, y]], 8, "#5c3b20");
  // Frequency dial & knobs
  p.ell(412, 375, 42, 42, "#fff9e2", 8);
  p.stroke([[412, 375], [435, 355]], 7, "#c92e2e");
  p.ell(412, 465, 24, 24, "#36271d", 6);
  p.ell(412, 520, 24, 24, "#36271d", 6);
  drawRedX(p);
};

/** "No Telephone" bold graphic signboard (vintage black candlestick/rotary phone + giant Red X) */
export const fxNoPhone = (p) => {
  p.poly(rrect(30, 185, 570, 635, 36), "#faf2dc", 14);
  // Classic curved handset across top
  p.stroke(curve([135, 325], [300, 235], [465, 325]), 44, "#282c36");
  p.ell(138, 345, 42, 30, "#1c1f26", 10);
  p.ell(462, 345, 42, 30, "#1c1f26", 10);
  // Phone cradle + body
  p.poly([[195, 365], [405, 365], [448, 565], [152, 565]], "#2c303a", 12);
  // Rotary dial
  p.ell(300, 472, 62, 62, "#f2ead6", 9);
  p.ell(300, 472, 22, 22, "#2c303a", 6);
  for (let i = 0; i < 8; i++) {
    const a = rad(-40 + i * 32);
    p.dot(300 + Math.cos(a) * 42, 472 + Math.sin(a) * 42, 7.5, "#2c303a");
  }
  drawRedX(p);
};

/** "No Ship in Sight" bold graphic signboard (sailing ship on waves + giant Red X) */
export const fxNoShip = (p) => {
  p.poly(rrect(30, 185, 570, 635, 36), "#faf2dc", 14);
  p.poly(rrect(44, 485, 556, 621, 20), "#2c7399", 0);
  // Classic wooden ship hull + tall mast + billowing sails
  p.poly([[118, 438], [482, 438], [440, 520], [160, 520]], "#5c3b24", 11);
  p.stroke([[300, 438], [300, 232]], 12, "#452c1b");
  p.poly([[306, 250], [455, 395], [306, 405]], "#fff8e6", 9);
  p.poly([[294, 275], [175, 395], [294, 402]], "#f2e8cf", 9);
  drawRedX(p);
};

/** Floating bold golden question mark badge for "Nobody knew where it would land" */
export const fxQuestion = (p, phase = 0) => {
  const s = 1 + 0.08 * Math.sin(phase * 4);
  const g = p.g;
  g.save();
  g.translate(300, 480);
  g.scale(s, s);
  g.translate(-300, -480);
  p.ell(300, 480, 130, 130, "#ffe054", 16);
  p.ell(300, 480, 102, 102, "#fff5c2", 0);
  g.fillStyle = "#241726";
  g.font = "900 175px DejaVu Sans, Arial Black, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("?", 300, 492);
  g.restore();
};

/** Slashing North Atlantic storm rain streaks */
export const fxRain = (p, phase = 0) => {
  const g = p.g;
  g.save();
  g.strokeStyle = "rgba(218,238,255,0.68)";
  g.lineWidth = 5;
  g.lineCap = "round";
  for (let i = 0; i < 24; i++) {
    const rx = ((i * 73 + phase * 180) % 580) + 10;
    const ry = ((i * 119 + phase * 420) % 880) + 40;
    g.beginPath();
    g.moveTo(rx, ry);
    g.lineTo(rx - 28, ry + 78);
    g.stroke();
  }
  g.restore();
};

/** Flying curly wooden chisel shavings during boat carving */
export const fxShavings = (p, k = 0) => {
  const g = p.g;
  g.save();
  g.globalAlpha = Math.max(0, 1 - k * 0.85);
  for (let i = 0; i < 6; i++) {
    const a = rad(-150 + i * 26);
    const d = 40 + 185 * k;
    const x = 300 + Math.cos(a) * d;
    const y = 540 + Math.sin(a) * d + 145 * k * k;
    p.ell(x, y, 18, 9, i % 2 ? "#e8c084" : "#d4a260", 4.5, 0, 360, i * 40 + k * 240);
  }
  g.restore();
};

/** Golden idea lightbulb spark */
export const fxIdea = (p, phase = 0) => {
  const pulse = 1 + 0.08 * Math.sin(phase * 6);
  const g = p.g;
  g.save();
  g.translate(300, 440);
  g.scale(pulse, pulse);
  g.translate(-300, -440);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + phase * 0.4;
    p.stroke([[300 + Math.cos(a) * 95, 430 + Math.sin(a) * 95], [300 + Math.cos(a) * 140, 430 + Math.sin(a) * 140]], 11, "#ffe04a");
  }
  p.ell(300, 425, 66, 68, "#ffe466", 12);
  p.poly(rrect(270, 488, 330, 526, 8), "#8f98a3", 10);
  g.restore();
};

/** Soft cottage peat chimney smoke / mist puff */
export const fxSmoke = (p, k, col = "#eaf0f7") => {
  const g = p.g;
  g.save();
  g.globalAlpha = Math.max(0, (1 - k) * 0.86);
  const r = 68 + 90 * k;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + k;
    p.ell(300 + Math.cos(a) * (42 + 58 * k), 500 + Math.sin(a) * (30 + 42 * k), r * 0.72, r * 0.62, col, 7);
  }
  p.ell(300, 500, r * 0.88, r * 0.74, col, 0);
  g.restore();
};

/** Soaring North Atlantic seabird / gull */
export const fxSeagull = (p, phase = 0) => {
  const flap = Math.sin(phase * 6) * 48;
  p.stroke(curve([125, 480 - flap], [220, 420 - flap * 0.4], [300, 475]), 16, INK);
  p.stroke(curve([125, 480 - flap], [220, 420 - flap * 0.4], [300, 475]), 10, "#ffffff");
  p.stroke(curve([300, 475], [380, 420 - flap * 0.4], [475, 480 - flap]), 16, INK);
  p.stroke(curve([300, 475], [380, 420 - flap * 0.4], [475, 480 - flap]), 10, "#ffffff");
  p.ell(300, 478, 22, 14, "#ffffff", 6);
};

/** Golden sparkle star burst */
export const fxSparkle = (p, phase = 0) => {
  for (let i = 0; i < 4; i++) {
    const a = phase * 2 + i * 1.57;
    const x = 300 + Math.cos(a) * 165, y = 460 + Math.sin(a) * 145;
    const s = 0.6 + 0.4 * Math.sin(phase * 5 + i * 2.1), pts = [];
    for (let k = 0; k < 8; k++) {
      const r = (k % 2 ? 18 : 54) * s, b = rad(k * 45);
      pts.push([x + Math.cos(b) * r, y + Math.sin(b) * r]);
    }
    p.poly(pts, "#ffe04a", 7);
  }
};
