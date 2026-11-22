// ---------------- Tin Can Island Cast & Custom 2D Props/FX (built on toonbase.js Pen/blob/face) ----------------
FACE.determined = { eye: ["lid", "lid"], brow: [4, -2], mouth: "teeth" };
FACE.effort = { eye: ["squeeze", "squeeze"], brow: [4, -1], mouth: "teeth" };
FACE.excited = { eye: ["shock", "shock"], brow: [-5, -5], mouth: "laugh" };
FACE.bored = { eye: ["slit", "slit"], brow: [1, 1], mouth: "dash" };

const NAVY = "#1f4273", GOLD = "#f0c243", CORAL = "#d43c32", TEAL = "#2d8a8a", KHAKI = "#d8c394";

export const ROLES = {
  mailman:    { skin: "#c9895b", shirt: "#ffffff", stripe: CORAL, shorts: NAVY, hat: "postcap", badge: true },
  swimmerB:   { skin: "#b8784c", shirt: "#e6b842", stripe: TEAL, shorts: "#234a52", hat: "headband" },
  captain:    { skin: "#f3cdb0", shirt: "#f6f2e8", pants: "#223047", hat: "captain", epaulettes: true, moustache: "#5a4636", stout: true },
  sailorA:    { skin: "#f5c9a0", shirt: "#ffffff", stripe: "#274c7d", pants: "#274c7d", hat: "sailor", scarf: CORAL },
  sailorB:    { skin: "#d9a279", shirt: "#ffffff", stripe: "#274c7d", pants: "#274c7d", hat: "sailor", scarf: "#e2a732" },
  postmaster: { skin: "#c9895b", shirt: KHAKI, pants: "#594838", hat: "pith", glasses: true, tie: CORAL, moustache: "#2d2420" },
  collectorA: { skin: "#f7d4b8", shirt: "#7a5b3e", pants: "#4a3c2e", hat: "bowler", monocle: true, moustache: "#4a3220", stout: true },
  collectorB: { skin: "#f2c6a0", shirt: "#35787c", pants: "#2c3442", hat: "beret", glasses: true, scarf: "#e86e6b" },
  collectorC: { skin: "#e5b892", shirt: "#b89668", pants: "#4f4438", hat: "fedora", tie: NAVY },
};

/** Draw custom period hats */
const drawRoleHat = (p, role, hp, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, W = 2 * H.a, HH = 2 * H.b;
  if (role.hat === "postcap" || role.hat === "captain") {
    const isCap = role.hat === "captain";
    const baseCol = isCap ? "#f7f3e8" : NAVY;
    const bandCol = isCap ? "#1c2433" : "#152a4c";
    const yb = crown + 0.24 * HH;
    // Crown top
    const topPts = [
      [cx - 0.56 * W, yb - 0.22 * HH], [cx - 0.34 * W, yb - 0.44 * HH],
      [cx + 0.34 * W, yb - 0.44 * HH], [cx + 0.56 * W, yb - 0.22 * HH],
      [cx + 0.46 * W, yb], [cx - 0.46 * W, yb],
    ];
    p.shadedFill(topPts, baseCol, mul(baseCol, [0.72, 0.74, 0.82]), light, 0.56 * W, 0.35);
    p.inkRing(topPts, ow * 0.85, thick);
    // Cap band
    p.poly(rrect(cx - 0.47 * W, yb - 0.1 * HH, cx + 0.47 * W, yb + 0.04 * HH, 3 * u), bandCol, ow * 0.65);
    // Gold emblem
    p.ell(cx + 3 * u * facing, yb - 0.22 * HH, 9 * u, 7.5 * u, GOLD, 2.2 * u);
    // Glossy visor peak
    p.ell(cx + 5 * u * facing, yb + 0.04 * HH, 0.43 * W, 0.075 * HH, "#181820", 2.6 * u, 0, 180);
  } else if (role.hat === "sailor") {
    const yb = crown + 0.22 * HH;
    const cup = ellPts(cx, yb, 0.44 * W, 0.26 * HH, 180, 360, 0, 36);
    p.shadedFill(cup, "#f7f6f0", "#d4d8e0", light, 0.44 * W, 0.35);
    p.poly(cup, null, ow * 0.8);
    p.poly(rrect(cx - 0.46 * W, yb - 0.06 * HH, cx + 0.46 * W, yb + 0.06 * HH, 5 * u), "#eef0f4", ow * 0.75);
  } else if (role.hat === "headband") {
    const yb = hc - H.b * 0.52;
    p.band([[cx - H.a * 1.02, yb], [cx + H.a * 1.02, yb]], "#f7f3e6", 8 * u, 2 * u, "round");
    // Short dark hair cap above headband
    const hair = ellPts(cx, yb - 2 * u, H.a * 0.98, H.b * 0.56, 180, 360, 0, 36);
    p.shadedFill(hair, "#261d1a", "#140f0d", light, H.a, 0.35);
    p.poly(hair, null, ow * 0.75);
    p.band([[cx - H.a * 1.02, yb], [cx + H.a * 1.02, yb]], "#f7f3e6", 7.5 * u, 1.8 * u, "round");
  } else if (role.hat === "pith") {
    const yb = crown + 0.24 * HH;
    const dome = ellPts(cx, yb, 0.48 * W, 0.32 * HH, 180, 360, 0, 36);
    p.shadedFill(dome, "#e7d8b1", "#bfae84", light, 0.48 * W, 0.35);
    p.inkRing(dome, ow * 0.8, thick);
    p.ell(cx, yb + 2 * u, 0.62 * W, 0.075 * HH, "#d9c696", ow * 0.75);
    p.band([[cx - 0.48 * W, yb - 2 * u], [cx + 0.48 * W, yb - 2 * u]], "#8a5a34", 5 * u, 1.5 * u, "round");
  } else if (role.hat === "bowler") {
    const yb = crown + 0.24 * HH;
    const dome = ellPts(cx, yb, 0.42 * W, 0.38 * HH, 180, 360, 0, 36);
    p.shadedFill(dome, "#33313a", "#1c1a22", light, 0.42 * W, 0.35);
    p.poly(dome, null, ow * 0.85);
    p.ell(cx, yb + 2 * u, 0.56 * W, 0.065 * HH, "#24222b", ow * 0.8);
  } else if (role.hat === "beret") {
    const yb = crown + 0.22 * HH;
    const br = ellPts(cx - 4 * u, yb - 0.1 * HH, 0.56 * W, 0.22 * HH, 0, 360, -10, 40);
    p.shadedFill(br, "#c4353c", "#852028", light, 0.56 * W, 0.35);
    p.inkRing(br, ow * 0.85, thick);
    p.stroke([[cx - 2 * u, yb - 0.3 * HH], [cx + 4 * u, yb - 0.38 * HH]], 4 * u, INK);
  } else if (role.hat === "fedora") {
    const yb = crown + 0.24 * HH;
    const top = [[cx - 0.42 * W, yb], [cx - 0.36 * W, yb - 0.36 * HH], [cx, yb - 0.28 * HH], [cx + 0.36 * W, yb - 0.36 * HH], [cx + 0.42 * W, yb]];
    p.shadedFill(top, "#8a6d4b", "#5c4730", light, 0.42 * W, 0.35);
    p.inkRing(top, ow * 0.85, thick);
    p.band([[cx - 0.42 * W, yb - 4 * u], [cx + 0.42 * W, yb - 4 * u]], "#2d2520", 7 * u, 1.5 * u);
    p.ell(cx, yb + 2 * u, 0.6 * W, 0.065 * HH, "#785e40", ow * 0.75);
  }
};

/** Front/3-4 Pacific cartoon character.
 *  opts: expr, blink, look, facing, seed, L, R, tilt, headTilt, bob, light, inWater, swimPhase, letter, pole, tin, stamp, magnify, album, wave
 */
export const islandChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? ROLES[key] : key;
  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), inWater = false, swimPhase = 0,
    pole = false, letter = false, magnify = false, album = false, stamp = false, binoculars = false, wv = 0,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.06, legsL = 1.34, sole = 975;
  const waterShift = inWater ? 1.25 * HH : 0;
  const torsoBot = sole - legsL * HH + waterShift - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = O.shorts ? mix(skin, INK, 0.32) : mix(O.pants || "#2d3848", INK, 0.52);
  const armCol = O.shorts ? mix(skin, INK, 0.25) : mix(O.shirt, INK, 0.48);

  p.rot = null;

  // ---- legs (hidden if inWater) ----
  if (!inWater) {
    for (const side of [-1, 1]) {
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
      const shoe = O.shorts ? skin : "#2a201b";
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, shoe);
    }
  }

  // ---- upper body ----
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
      case "swim": {
        const ph = swimPhase + (side > 0 ? Math.PI : 0);
        const reach = Math.sin(ph) * 26 * u, lift = Math.cos(ph) * 0.25 * HH;
        return { pts: [s, [X(28 + reach * 0.5 / u), s[1] + 0.08 * HH - lift], [X(58 + reach / u), s[1] + 0.22 * HH - lift * 0.6]], front: true };
      }
      case "pole": return { pts: [s, [X(24), s[1] - 0.28 * HH], [X(30), s[1] - 0.72 * HH]], front: true };
      case "push": return { pts: [s, [X(32), s[1] + 0.06 * HH], [X(68), s[1] - 0.04 * HH]], front: true };
      case "up": return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.82 * HH]], front: false };
      case "wave": return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "haul": {
        const pull = Math.sin(swimPhase) * 0.16 * HH;
        return { pts: [s, [X(22), s[1] + 0.12 * HH + pull], [tcx + side * 0.3 * T.a, s[1] - 0.08 * HH + pull]], front: true };
      }
      case "hold": return { pts: [s, [X(18), s[1] + 0.32 * HH], [tcx + side * 0.55 * T.a, torsoBot - 0.25 * HH]], front: true };
      case "throw": return { pts: [s, [X(26), s[1] - 0.38 * HH], [X(52), s[1] - 0.72 * HH]], front: true };
      case "point": return { pts: [s, [X(28), s[1] - 0.05 * HH], [X(64), s[1] - 0.14 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.25 * HH]], front: false };
      case "bino": return { pts: [s, [X(22), s[1] - 0.08 * HH], [cx + side * 16 * u, hc + 2 * u]], front: true };
      default: return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.6 * u);
  };

  for (const a of arms) if (!a.front) drawArm(a);

  // ---- Torso + vintage outfits ----
  p.gradFill(tp, O.shirt, mul(O.shirt, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.stripe) {
      for (let y = chin - 0.2 * HH; y < torsoBot + 0.1 * HH; y += 0.19 * HH) {
        p.poly([[tcx - 1.4 * T.a, y], [tcx + 1.4 * T.a, y], [tcx + 1.4 * T.a, y + 0.095 * HH], [tcx - 1.4 * T.a, y + 0.095 * HH]], O.stripe, 1.4 * u);
      }
    }
    if (O.shorts) {
      p.poly([[tcx - 1.4 * T.a, torsoBot - 0.36 * HH], [tcx + 1.4 * T.a, torsoBot - 0.36 * HH], [tcx + 1.4 * T.a, torsoBot + 0.2 * HH], [tcx - 1.4 * T.a, torsoBot + 0.2 * HH]], O.shorts, 2 * u);
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.36 * HH], [tcx + 1.4 * T.a, torsoBot - 0.36 * HH]], "#f2ead4", 5 * u, 1.4 * u);
    }
    if (O.badge) {
      p.ell(tcx + 16 * u, chin + 0.34 * HH, 9 * u, 9 * u, GOLD, 2.2 * u);
    }
    if (O.tie) {
      p.poly([[tcx, chin + 0.05 * HH], [tcx + 6 * u, chin + 0.5 * HH], [tcx, chin + 0.62 * HH], [tcx - 6 * u, chin + 0.5 * HH]], O.tie, 1.8 * u);
    }
    if (O.scarf) {
      p.poly([[tcx - 24 * u, chin + 0.02 * HH], [tcx + 24 * u, chin + 0.02 * HH], [tcx + 6 * u, chin + 0.36 * HH], [tcx - 6 * u, chin + 0.36 * HH]], O.scarf, 2 * u);
    }
    if (O.epaulettes) {
      for (let i = 0; i < 3; i++) {
        for (const s of [-1, 1]) p.dot(tcx + s * 10 * u, chin + (0.24 + i * 0.22) * HH, 3.2 * u, GOLD);
      }
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.epaulettes) {
    for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.68 * T.a - 14 * u, chin - 4 * u, tcx + s * 0.68 * T.a + 14 * u, chin + 10 * u, 4 * u), GOLD, 2.2 * u);
  }

  for (const a of arms) if (a.front) drawArm(a);

  // ---- Held props (pole with dry letters, envelope, magnifying glass, stamp album, rubber stamp) ----
  const [rhx, rhy] = arms[1].pts[2];
  const [lhx, lhy] = arms[0].pts[2];

  if (pole) {
    // Tall bamboo pole extending high above the head with waterproof bundle of crisp white letters tied at the top!
    const pTopY = 55;
    p.band([[rhx, torsoBot - 0.1 * HH], [rhx + 8 * u, pTopY]], "#c29248", 5.5 * u, 2 * u, "round");
    // Bamboo joints
    for (let y = pTopY + 60; y < torsoBot - 40; y += 75) p.stroke([[rhx - 2 * u, y], [rhx + 12 * u, y]], 2.6 * u, "#6b4a20");
    // Tied bundle of dry letters perched high on top of pole!
    const bx = rhx + 10 * u, by = pTopY + 26;
    p.poly(rrect(bx - 48, by - 36, bx + 48, by + 30, 8), "#fffdf4", 4.5 * u);
    p.stroke([[bx - 44, by - 32], [bx, by + 2], [bx + 44, by - 32]], 3.5 * u, "#2957a4");
    p.ell(bx, by + 4, 10, 10, CORAL, 2.5 * u);
    // String wrapping letters to pole
    p.stroke([[bx - 50, by + 18], [bx + 50, by + 18]], 4.5 * u, "#8a5a34");
  }

  if (letter) {
    const ex = rhx + 4 * u, ey = rhy - 12 * u;
    p.poly(rrect(ex - 26 * u, ey - 18 * u, ex + 26 * u, ey + 18 * u, 4 * u), "#fffdf4", 3 * u);
    p.stroke([[ex - 24 * u, ey - 15 * u], [ex, ey + 3 * u], [ex + 24 * u, ey - 15 * u]], 2.4 * u, "#2957a4");
    p.ell(ex, ey + 4 * u, 5 * u, 5 * u, CORAL, 1.5 * u);
  }

  if (magnify) {
    const mx = rhx + 16 * u, my = rhy - 24 * u;
    p.band([[rhx, rhy], [mx - 10 * u, my + 14 * u]], "#6b4426", 5 * u, 1.8 * u, "round");
    p.ell(mx, my, 24 * u, 24 * u, "#b8e6ff", 4.5 * u);
    p.stroke(ellPts(mx - 6 * u, my - 6 * u, 12 * u, 12 * u, 190, 265, 0, 10), 3.5 * u, "#ffffff");
  }

  if (album) {
    const ax = lhx - 4 * u, ay = lhy - 8 * u;
    p.poly(rrect(ax - 24 * u, ay - 26 * u, ax + 24 * u, ay + 26 * u, 4 * u), "#8f2630", 3.5 * u);
    p.poly(rrect(ax - 16 * u, ay - 16 * u, ax + 16 * u, ay + 4 * u, 2 * u), GOLD, 1.8 * u);
  }

  if (stamp) {
    const sx = rhx, sy = rhy - 14 * u;
    p.poly(rrect(sx - 24 * u, sy + 4 * u, sx + 24 * u, sy + 16 * u, 3 * u), "#8a522b", 2.8 * u);
    p.ell(sx, sy - 10 * u, 11 * u, 16 * u, "#a86738", 2.8 * u);
    p.poly(rrect(sx - 22 * u, sy + 16 * u, sx + 22 * u, sy + 22 * u, 2 * u), "#be1e2d", 2 * u);
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawRoleHat(p, O, hp, H, cx, hc, light, thick, ow, u, facing);
  faceFront(p, cx, hc, W, expr, facing, look, lid, true, skin, O.moustache || null, !!O.stout);

  if (O.glasses) {
    const fx = cx + 7 * u * facing;
    for (const s of [-1, 1]) p.ell(fx + s * 13 * u, hc, 11 * u, 10 * u, null, 2.8 * u);
    p.stroke([[fx - 2 * u, hc], [fx + 2 * u, hc]], 2.6 * u);
  }
  if (O.monocle) {
    const fx = cx + 7 * u * facing + 13 * u;
    p.ell(fx, hc, 12 * u, 12 * u, "rgba(180,235,255,0.28)", 3 * u);
    p.stroke([[fx + 11 * u, hc + 4 * u], [fx + 18 * u, hc + 32 * u]], 1.8 * u, GOLD);
  }
  if (binoculars) {
    const fx = cx + 7 * u * facing;
    for (const s of [-1, 1]) {
      p.ell(fx + s * 14 * u, hc + 2 * u, 13 * u, 13 * u, "#2a2d36", 3.2 * u);
      p.ell(fx + s * 14 * u, hc + 2 * u, 8 * u, 8 * u, "#5cb8e6", 1.8 * u);
    }
    p.stroke([[fx - 4 * u, hc + 2 * u], [fx + 4 * u, hc + 2 * u]], 5 * u, "#2a2d36");
  }

  p.rot = null;

  // ---- Water foam collar around swimmer's chest when inWater ----
  if (inWater) {
    const wy = torsoBot - 0.14 * HH;
    const waveOff = Math.sin(swimPhase * 2) * 8 * u;
    for (let i = -3; i <= 3; i++) {
      p.ell(cx + i * 28 * u + waveOff * 0.4, wy + Math.abs(i) * 4 * u, 28 * u, 14 * u, "#e8f8ff", 3.2 * u);
    }
    p.ell(cx, wy + 12 * u, 96 * u, 18 * u, "#b8e6ff", 0);
  }
};

// ---------------- Custom 2D Graphic Signboards & Effects ----------------

/** "No Dock" bold graphic signboard (wooden pier + giant red X) */
export const fxNoDock = (p) => {
  p.poly(rrect(30, 190, 570, 630, 36), "#faf2dc", 14);
  // Water band at bottom
  p.poly(rrect(44, 480, 556, 616, 20), "#3b9ec4", 0);
  // Wooden pier deck + posts
  p.poly(rrect(70, 385, 510, 422, 8), "#8f5c36", 9);
  for (const x of [115, 240, 365, 470]) p.poly(rrect(x - 14, 422, x + 14, 560, 4), "#6e4426", 8);
  // Bollards
  for (const x of [150, 310, 455]) p.poly(rrect(x - 12, 345, x + 12, 386, 5), "#54331d", 7);
  // Bold white-rimmed Red X
  for (const [a, b] of [[[85, 245], [515, 575]], [[515, 245], [85, 575]]]) {
    p.stroke([a, b], 56, "#ffffff");
    p.stroke([a, b], 38, "#d92b2b");
  }
};

/** "No Boat" bold graphic signboard (rowboat + giant red X) */
export const fxNoBoat = (p) => {
  p.poly(rrect(30, 190, 570, 630, 36), "#faf2dc", 14);
  p.poly(rrect(44, 485, 556, 616, 20), "#3b9ec4", 0);
  // Cartoon wooden rowboat
  const hull = [[105, 425], [495, 425], [445, 520], [155, 520]];
  p.poly(hull, "#b86b35", 10);
  p.poly(rrect(160, 405, 440, 428, 6), "#8f4e22", 7);
  // Oars
  p.stroke([[250, 412], [175, 315]], 12, "#784824");
  p.stroke([[350, 412], [425, 315]], 12, "#784824");
  // Bold white-rimmed Red X
  for (const [a, b] of [[[85, 245], [515, 575]], [[515, 245], [85, 575]]]) {
    p.stroke([a, b], 56, "#ffffff");
    p.stroke([a, b], 38, "#d92b2b");
  }
};

/** Floating / flying crisp airmail letter card */
export const fxLetter = (p, stamped = false) => {
  p.poly(rrect(120, 360, 480, 600, 14), "#fffdf4", 12);
  p.stroke([[132, 372], [300, 505], [468, 372]], 10, "#2957a4");
  p.ell(300, 505, 24, 24, CORAL, 7);
  if (stamped) {
    p.ell(385, 445, 56, 56, null, 8);
    p.ell(385, 445, 44, 44, "rgba(190,30,45,0.22)", 0);
  }
};

/** White steam/volcano puff */
export const fxSteam = (p, k, col = "#f5f8fc") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, (1 - k) * 0.92);
  const r = 75 + 95 * k;
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + k;
    p.ell(300 + Math.cos(a) * (45 + 65 * k), 500 + Math.sin(a) * (35 + 45 * k), r * 0.72, r * 0.62, col, 8);
  }
  p.ell(300, 500, r * 0.9, r * 0.78, col, 0);
  g.restore();
};

/** Golden sparkle star burst */
export const fxSparkle = (p, phase = 0) => {
  for (let i = 0; i < 4; i++) {
    const a = phase * 2 + i * 1.57, x = 300 + Math.cos(a) * 165, y = 460 + Math.sin(a) * 145;
    const s = 0.6 + 0.4 * Math.sin(phase * 5 + i * 2.1), pts = [];
    for (let k = 0; k < 8; k++) {
      const r = (k % 2 ? 18 : 54) * s, b = rad(k * 45);
      pts.push([x + Math.cos(b) * r, y + Math.sin(b) * r]);
    }
    p.poly(pts, "#ffe04a", 7);
  }
};
