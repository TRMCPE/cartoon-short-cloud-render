// ---------------- 1870 Siege of Paris Cast & Custom 2D Props/FX (built on toonbase.js Pen/blob/face) ----------------
FACE.determined = { eye: ["lid", "lid"], brow: [4, -2], mouth: "teeth" };
FACE.effort     = { eye: ["squeeze", "squeeze"], brow: [4, -1], mouth: "teeth" };
FACE.excited    = { eye: ["shock", "shock"], brow: [-5, -5], mouth: "laugh" };
FACE.puzzled    = { eye: ["dot", "dot"], brow: [-4, 3], mouth: "o" };
FACE.worried    = { eye: ["small", "small"], brow: [-4, 3], mouth: "frown" };

const TRICOLOR_B = "#1f4582", TRICOLOR_W = "#f7f4ec", TRICOLOR_R = "#cc2e2e", GOLD = "#f0c243";
const PRUSSIA_B = "#1e2e47", FRENCH_RED = "#b82b2b";

export const ROLES = {
  aeronaut:      { skin: "#f3cdb0", coat: "#2c3d59", pants: "#383430", hat: "aviator", scarf: TRICOLOR_R, buttons: GOLD, moustache: "#4a3220" },
  postalWorker:  { skin: "#f5cfa8", coat: "#254d82", pants: "#22344d", hat: "kepi", buttons: GOLD, badge: true, moustache: "#3b2c22" },
  parisianA:     { skin: "#f7d6bc", coat: "#5a4940", pants: "#2e2a2c", hat: "tophat", scarf: "#c9963a", moustache: "#3a281e" },
  parisianB:     { skin: "#f6d4b8", coat: "#8c3b4c", pants: "#382c36", hat: "bonnet", scarf: "#e8d29c", dress: "#8c3b4c" },
  minister:      { skin: "#f3cab0", coat: "#1e2028", pants: "#1c1d24", hat: "tophat", sash: "tricolor", cravat: true, moustache: "#221a16", beard: "#221a16", stout: true },
  frenchSoldier: { skin: "#f2c8a2", coat: "#203864", pants: FRENCH_RED, hat: "frenchKepi", belt: "#2b2420", buttons: GOLD, moustache: "#463022" },
  prussian:      { skin: "#f0c7a4", coat: PRUSSIA_B, pants: "#3b4048", hat: "pickelhaube", crossBelt: true, collarRed: true, buttons: GOLD, moustache: "#3e2c1e" },
  photographer:  { skin: "#f5d4b6", coat: "#5e4a38", pants: "#38322c", hat: "beret", waistcoat: "#c9b086", glasses: true, moustache: "#4a3628" },
};

/** Draw authentic 1870 French & Prussian period headgear */
const drawParisHat = (p, role, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, W = 2 * H.a, HH = 2 * H.b;
  if (role.hat === "pickelhaube") {
    // Iconic 1870 Prussian spiked helmet (black boiled leather dome + brass spike + eagle plate!)
    const yb = crown + 0.28 * HH;
    const dome = ellPts(cx, yb, 0.50 * W, 0.34 * HH, 180, 360, 0, 36);
    p.shadedFill(dome, "#262830", "#111218", light, 0.50 * W, 0.35);
    p.inkRing(dome, ow * 0.85, thick);
    // Brass spike base + tall sharp brass spike!
    p.ell(cx, yb - 0.33 * HH, 13 * u, 6 * u, GOLD, 2.2 * u);
    p.poly([[cx - 6.5 * u, yb - 0.34 * HH], [cx, yb - 0.66 * HH], [cx + 6.5 * u, yb - 0.34 * HH]], GOLD, 2.5 * u);
    // Front brass eagle emblem + chinstrap visor
    p.ell(cx + 6 * u * facing, yb - 0.14 * HH, 11 * u, 9 * u, GOLD, 2 * u);
    p.poly([[cx - 0.52 * W, yb - 2 * u], [cx + 0.52 * W, yb - 2 * u], [cx + 0.44 * W, yb + 0.08 * HH], [cx - 0.44 * W, yb + 0.08 * HH]], "#181920", ow * 0.65);
    p.band([[cx - 0.46 * W, yb + 0.01 * HH], [cx + 0.46 * W, yb + 0.01 * HH]], GOLD, 3.2 * u, 1.2 * u);
  } else if (role.hat === "kepi" || role.hat === "frenchKepi") {
    // Classic 1870 French Képi (navy blue band + red crown for soldiers, blue+gold for postal)
    const yb = crown + 0.25 * HH;
    const isSold = role.hat === "frenchKepi";
    const topCol = isSold ? FRENCH_RED : "#254d82";
    const bandCol = isSold ? "#1e345e" : "#182f52";
    const body = [
      [cx - 0.45 * W, yb], [cx - 0.36 * W, yb - 0.36 * HH],
      [cx + 0.36 * W, yb - 0.36 * HH], [cx + 0.45 * W, yb],
    ];
    p.shadedFill(body, topCol, mul(topCol, [0.70, 0.72, 0.78]), light, 0.45 * W, 0.35);
    p.inkRing(body, ow * 0.8, thick);
    p.poly(rrect(cx - 0.46 * W, yb - 0.11 * HH, cx + 0.46 * W, yb + 0.03 * HH, 3 * u), bandCol, ow * 0.65);
    p.band([[cx - 0.44 * W, yb - 0.11 * HH], [cx + 0.44 * W, yb - 0.11 * HH]], GOLD, 3.5 * u, 1.2 * u);
    // Glossy leather visor
    p.ell(cx + 6 * u * facing, yb + 0.04 * HH, 0.42 * W, 0.07 * HH, "#191820", 2.4 * u, 0, 180);
  } else if (role.hat === "tophat") {
    // Tall 1870 Parisian silk stovepipe top hat
    const yb = crown + 0.24 * HH;
    const cyl = [
      [cx - 0.36 * W, yb], [cx - 0.40 * W, yb - 0.56 * HH],
      [cx + 0.40 * W, yb - 0.56 * HH], [cx + 0.36 * W, yb],
    ];
    p.shadedFill(cyl, "#282834", "#12121a", light, 0.40 * W, 0.35);
    p.inkRing(cyl, ow * 0.85, thick);
    p.band([[cx - 0.36 * W, yb - 0.08 * HH], [cx + 0.36 * W, yb - 0.08 * HH]], role.sash ? TRICOLOR_R : "#4a3b58", 7 * u, 1.6 * u);
    p.ell(cx, yb + 2 * u, 0.60 * W, 0.065 * HH, "#1c1c26", ow * 0.8);
  } else if (role.hat === "aviator") {
    // Balloon aeronaut cap with raised brass & brown-leather goggles!
    const yb = crown + 0.26 * HH;
    const cap = ellPts(cx, yb, 0.50 * W, 0.33 * HH, 180, 360, 0, 36);
    p.shadedFill(cap, "#6e482b", "#452c19", light, 0.50 * W, 0.35);
    p.inkRing(cap, ow * 0.8, thick);
    p.band([[cx - 0.48 * W, yb - 0.05 * HH], [cx + 0.48 * W, yb - 0.05 * HH]], "#3b2515", 6.5 * u, 1.6 * u);
    // Brass aviator goggles perched on forehead
    const gx = cx + 5 * u * facing;
    for (const s of [-1, 1]) {
      p.ell(gx + s * 14 * u, yb - 0.06 * HH, 12 * u, 10 * u, GOLD, 2.8 * u);
      p.ell(gx + s * 14 * u, yb - 0.06 * HH, 7.5 * u, 6.5 * u, "#9ed8f5", 1.8 * u);
    }
  } else if (role.hat === "bonnet") {
    // 1870 Parisian lady's ruffled bonnet + ribbon
    const yb = crown + 0.25 * HH;
    const dome = ellPts(cx, yb + 2 * u, 0.56 * W, 0.36 * HH, 175, 365, 0, 36);
    p.shadedFill(dome, "#d9b672", "#a88548", light, 0.56 * W, 0.35);
    p.inkRing(dome, ow * 0.8, thick);
    p.ell(cx + 0.22 * W, yb - 0.22 * HH, 12 * u, 10 * u, TRICOLOR_R, 2.4 * u);
  } else if (role.hat === "beret") {
    // Parisian photographer / artist dark wool beret
    const yb = crown + 0.22 * HH;
    const br = ellPts(cx - 5 * u, yb - 0.11 * HH, 0.58 * W, 0.22 * HH, 0, 360, -10, 40);
    p.shadedFill(br, "#343a4d", "#1c202e", light, 0.58 * W, 0.35);
    p.inkRing(br, ow * 0.85, thick);
    p.stroke([[cx - 2 * u, yb - 0.31 * HH], [cx + 5 * u, yb - 0.38 * HH]], 4 * u, INK);
  }
};

/** Front / 3-4 1870 Paris cartoon character.
 *  opts: expr, blink, look, facing, seed, L, R, tilt, headTilt, bob, light,
 *        inBasket, rifleAim, rifleUp, letter, mailbag, tricolorFlag, loupe, microfilm, wv
 */
export const parisChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? ROLES[key] : key;
  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), inBasket = false,
    rifleAim = false, rifleUp = false, letter = false, mailbag = false,
    tricolorFlag = false, loupe = false, microfilm = false, hatWave = false, wv = 0,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.14 : 1.08, legsL = 1.32, sole = 975;
  const basketShift = inBasket ? 0.92 * HH : 0;
  const torsoBot = sole - legsL * HH + basketShift - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = O.pants || "#2e323c";
  const armCol = mix(O.coat, INK, 0.25);

  p.rot = null;

  // ---- Legs (hidden if standing inside a 3D balloon gondola basket) ----
  if (!inBasket) {
    for (const side of [-1, 1]) {
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u;
      // Pants leg with crisp dark outline
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 8.5 * u, INK);
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
      // 1870 dark leather boot
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.0 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.6 * u, "#231b18");
    }
  }

  // ---- Upper Body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = {
    a: (0.41 * W) / 1.06 * (O.stout ? 1.16 : 1), b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.20 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "up":     return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.84 * HH]], front: false };
      case "wave":   return { pts: [s, [X(18), s[1] - 0.26 * HH], [X(34 + 13 * Math.sin(wv)), s[1] - 0.72 * HH]], front: false };
      case "point":  return { pts: [s, [X(26), s[1] - 0.14 * HH], [X(58), s[1] - 0.42 * HH]], front: true };
      case "pointUp":return { pts: [s, [X(16), s[1] - 0.36 * HH], [X(22), s[1] - 0.88 * HH]], front: true };
      case "aim":    return { pts: [s, [X(18), s[1] - 0.14 * HH], [tcx + side * 14 * u + facing * 34 * u, s[1] - 0.46 * HH]], front: true };
      case "hold":   return { pts: [s, [X(18), s[1] + 0.28 * HH], [tcx + side * 0.50 * T.a, torsoBot - 0.30 * HH]], front: true };
      case "tug":    return { pts: [s, [X(24), s[1] - 0.22 * HH], [tcx + side * 0.55 * T.a, s[1] - 0.54 * HH]], front: true };
      case "hip":    return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.24 * HH]], front: false };
      case "shrug":  return { pts: [s, [X(24), s[1] + 0.16 * HH], [X(44), s[1] - 0.04 * HH]], front: true };
      default:       return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.00 * HH]], front: false };
    }
  };

  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.4 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.6 * u);
  };
  for (const a of arms) if (!a.front) drawArm(a);

  // ---- Torso + 1870 Tailoring ----
  p.gradFill(tp, O.coat, mul(O.coat, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.waistcoat) {
      p.poly([[tcx - 0.55 * T.a, chin], [tcx + 0.55 * T.a, chin], [tcx + 0.45 * T.a, torsoBot], [tcx - 0.45 * T.a, torsoBot]], O.waistcoat, 2 * u);
    }
    if (O.cravat) {
      p.poly([[tcx - 14 * u, chin], [tcx + 14 * u, chin], [tcx + 8 * u, chin + 0.44 * HH], [tcx - 8 * u, chin + 0.44 * HH]], "#faf7f0", 1.8 * u);
    }
    if (O.sash === "tricolor") {
      // Bold French Ministerial Tricolor Sash diagonally across chest!
      p.band([[tcx - 1.15 * T.a, chin + 0.06 * HH], [tcx + 1.15 * T.a, torsoBot - 0.12 * HH]], TRICOLOR_B, 14 * u, 1.5 * u);
      p.band([[tcx - 1.15 * T.a, chin + 0.16 * HH], [tcx + 1.15 * T.a, torsoBot - 0.02 * HH]], TRICOLOR_W, 12 * u, 1.0 * u);
      p.band([[tcx - 1.15 * T.a, chin + 0.26 * HH], [tcx + 1.15 * T.a, torsoBot + 0.08 * HH]], TRICOLOR_R, 12 * u, 1.5 * u);
    }
    if (O.crossBelt) {
      p.band([[tcx - 1.1 * T.a, chin + 0.04 * HH], [tcx + 1.1 * T.a, torsoBot - 0.16 * HH]], "#f3efe4", 9 * u, 1.8 * u);
      p.band([[tcx + 1.1 * T.a, chin + 0.04 * HH], [tcx - 1.1 * T.a, torsoBot - 0.16 * HH]], "#f3efe4", 9 * u, 1.8 * u);
      p.band([[tcx - 1.2 * T.a, torsoBot - 0.22 * HH], [tcx + 1.2 * T.a, torsoBot - 0.22 * HH]], "#1d1a1f", 9 * u, 1.6 * u);
      p.poly(rrect(tcx - 9 * u, torsoBot - 0.27 * HH, tcx + 9 * u, torsoBot - 0.17 * HH, 2 * u), GOLD, 1.8 * u);
    }
    if (O.collarRed) {
      p.poly([[tcx - 0.7 * T.a, chin - 4 * u], [tcx + 0.7 * T.a, chin - 4 * u], [tcx + 0.6 * T.a, chin + 0.18 * HH], [tcx - 0.6 * T.a, chin + 0.18 * HH]], TRICOLOR_R, 2 * u);
    }
    if (O.scarf) {
      p.poly([[tcx - 28 * u, chin + 0.02 * HH], [tcx + 28 * u, chin + 0.02 * HH], [tcx + 10 * u, chin + 0.32 * HH], [tcx - 10 * u, chin + 0.32 * HH]], O.scarf, 2 * u);
    }
    if (O.buttons) {
      for (let i = 0; i < 3; i++) {
        p.dot(tcx + 4 * u * facing, chin + (0.28 + i * 0.22) * HH, 3.6 * u, INK);
        p.dot(tcx + 4 * u * facing, chin + (0.28 + i * 0.22) * HH, 2.6 * u, O.buttons);
      }
    }
    if (O.badge) p.ell(tcx + 18 * u, chin + 0.32 * HH, 9 * u, 9 * u, GOLD, 2.2 * u);
  });
  p.inkRing(tp, ow, thick);
  for (const a of arms) if (a.front) drawArm(a);

  // ---- Held Props ----
  const [rhx, rhy] = arms[1].pts[2];
  const [lhx, lhy] = arms[0].pts[2];

  if (rifleAim) {
    // Aiming 1870 Dreyse / Prussian rifle steeply skyward at balloons!
    const dir = facing >= 0 ? 1 : -1;
    const x0 = tcx - dir * 10 * u, y0 = chin + 0.34 * HH;
    const x1 = tcx + dir * 74 * u, y1 = chin - 0.92 * HH;
    p.band([[x0, y0], [lerp2([x0, y0], [x1, y1], 0.62)[0], lerp2([x0, y0], [x1, y1], 0.62)[1]]], "#754728", 6.5 * u, 1.8 * u, "round");
    p.band([[lerp2([x0, y0], [x1, y1], 0.45)[0], lerp2([x0, y0], [x1, y1], 0.45)[1]], [x1, y1]], "#7f8894", 3.6 * u, 1.4 * u, "round");
  }
  if (rifleUp) {
    // Cheering French soldier thrusting Chassepot rifle + bayonet straight overhead!
    p.band([[rhx, rhy + 18 * u], [rhx + 8 * u, rhy - 64 * u]], "#754728", 5.5 * u, 1.6 * u, "round");
    p.band([[rhx + 4 * u, rhy - 26 * u], [rhx + 11 * u, rhy - 98 * u]], "#9ca6b3", 3.2 * u, 1.4 * u, "round");
  }
  if (tricolorFlag) {
    // Tall wooden flagpole with waving French Tricolor banner!
    const fx = rhx + 6 * u, fy = rhy - 125 * u;
    p.band([[rhx, rhy + 34 * u], [fx, fy]], "#8c5c34", 4.5 * u, 1.6 * u, "round");
    p.dot(fx, fy, 6 * u, GOLD);
    const wave = Math.sin(wv) * 7 * u;
    const bw = 24 * u, bh = 44 * u;
    p.poly([[fx, fy + 4 * u], [fx + bw, fy + 4 * u + wave * 0.4], [fx + bw, fy + 4 * u + bh + wave * 0.4], [fx, fy + 4 * u + bh]], TRICOLOR_B, 2.4 * u);
    p.poly([[fx + bw, fy + 4 * u + wave * 0.4], [fx + 2 * bw, fy + 4 * u + wave], [fx + 2 * bw, fy + 4 * u + bh + wave], [fx + bw, fy + 4 * u + bh + wave * 0.4]], TRICOLOR_W, 2.4 * u);
    p.poly([[fx + 2 * bw, fy + 4 * u + wave], [fx + 3 * bw, fy + 4 * u + wave * 0.4], [fx + 3 * bw, fy + 4 * u + bh + wave * 0.4], [fx + 2 * bw, fy + 4 * u + bh + wave]], TRICOLOR_R, 2.4 * u);
  }
  if (letter) {
    const ex = rhx + 4 * u, ey = rhy - 10 * u;
    p.poly(rrect(ex - 25 * u, ey - 17 * u, ex + 25 * u, ey + 17 * u, 4 * u), "#fffdf4", 3 * u);
    p.stroke([[ex - 23 * u, ey - 14 * u], [ex, ey + 3 * u], [ex + 23 * u, ey - 14 * u]], 2.4 * u, TRICOLOR_B);
    p.ell(ex, ey + 4 * u, 5 * u, 5 * u, TRICOLOR_R, 1.5 * u);
  }
  if (mailbag) {
    const bx = lhx - 8 * u, by = lhy + 6 * u;
    p.ell(bx, by, 28 * u, 34 * u, "#dfd0af", 3.5 * u);
    p.band([[bx - 22 * u, by - 4 * u], [bx + 22 * u, by - 4 * u]], TRICOLOR_R, 5 * u, 1.2 * u);
  }
  if (loupe) {
    const mx = rhx + 12 * u, my = rhy - 20 * u;
    p.band([[rhx, rhy], [mx - 8 * u, my + 12 * u]], "#6b4426", 4.5 * u, 1.6 * u, "round");
    p.ell(mx, my, 20 * u, 20 * u, "#b8e6ff", 4.2 * u);
    p.stroke(ellPts(mx - 5 * u, my - 5 * u, 10 * u, 10 * u, 190, 265, 0, 10), 3 * u, "#ffffff");
  }
  if (microfilm) {
    const mx = lhx - 14 * u, my = lhy - 18 * u;
    p.poly(rrect(mx - 24 * u, my - 14 * u, mx + 24 * u, my + 14 * u, 3 * u), "#ffd859", 3 * u);
    for (let k = -1; k <= 1; k++) p.poly(rrect(mx + k * 14 * u - 5 * u, my - 8 * u, mx + k * 14 * u + 5 * u, my + 8 * u, 1 * u), "#fff8e2", 1.2 * u);
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (O.beard) {
    // Full 1870 statesman beard (Léon Gambetta!)
    p.clip(hp, () => {
      p.ell(cx + 6 * u * facing, hc + 0.42 * HH, 0.44 * W, 0.28 * HH, O.beard, 0);
    });
  }
  p.inkRing(hp, ow, thick);
  if (!hatWave) {
    drawParisHat(p, O, H, cx, hc, light, thick, ow, u, facing);
  } else {
    // Hair tuft visible when Minister Gambetta triumphantly waves his top hat in hand!
    const hair = ellPts(cx, hc - H.b * 0.52, H.a * 0.94, H.b * 0.46, 180, 360, 0, 32);
    p.shadedFill(hair, "#261e1c", "#140f0e", light, H.a, 0.35);
    p.poly(hair, null, ow * 0.75);
    // Draw waved top hat perched cleanly above right hand!
    p.rot = null;
    const tx = rhx + 14 * u, ty = rhy - 26 * u;
    p.poly([[tx - 32 * u, ty + 10 * u], [tx - 38 * u, ty - 40 * u], [tx + 38 * u, ty - 40 * u], [tx + 32 * u, ty + 10 * u]], "#242430", 3.6 * u);
    p.ell(tx, ty + 12 * u, 50 * u, 8 * u, "#181822", 3.2 * u);
    p.band([[tx - 32 * u, ty + 2 * u], [tx + 32 * u, ty + 2 * u]], TRICOLOR_R, 6 * u, 1.4 * u);
    p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  }

  faceFront(p, cx, hc, W, expr, facing, look, lid, true, skin, O.moustache || null, !!O.stout);

  if (O.glasses) {
    const fx = cx + 7 * u * facing;
    for (const s of [-1, 1]) p.ell(fx + s * 13 * u, hc, 11 * u, 10 * u, null, 2.8 * u);
    p.stroke([[fx - 2 * u, hc], [fx + 2 * u, hc]], 2.6 * u);
  }
  p.rot = null;
};

// ---------------- Custom 2D Animated Carrier Pigeon & Cinematic FX ----------------

/** Charming, unmistakable 1870 Carrier Pigeon (flying or perched) with red/gold message quill-tube! */
export const fxPigeon = (p, wingPhase = 0, hasTube = true, perched = false) => {
  const cx = 300, cy = perched ? 540 : 490;
  const flap = Math.sin(wingPhase);

  if (!perched) {
    // Back wing (behind plump body)
    const wyB = cy - 34 - flap * 95;
    p.poly([
      [cx + 15, cy - 18], [cx - 58, wyB - 32], [cx - 125, wyB + 12], [cx - 48, cy + 8],
    ], "#768ba3", 10);
  }

  // Tail feathers fanning neatly back-left
  p.poly([
    [cx - 88, cy + 16], [cx - 182, cy + 48], [cx - 165, cy + 84], [cx - 75, cy + 46],
  ], "#4c5c70", 10);

  // Plump blue-grey pigeon body
  const body = ellPts(cx, cy + 12, 114, 72, 0, 360, perched ? -18 : -8, 44);
  p.shadedFill(body, "#a6bacf", "#73889e", rad(-125), 114, 0.45);
  p.inkRing(body, 11, thickAngle(rad(-125)));

  // Iridescent emerald-teal collar sheen on neck
  p.ell(cx + 76, cy - 28, 34, 24, "#4aa39a", 0, 0, 360, -25);
  p.ell(cx + 80, cy - 12, 32, 16, "#7b5fa3", 0, 0, 360, -20);

  // Cute round head facing right (+X)
  const hx = cx + 98, hy = cy - 64;
  const hd = ellPts(hx, hy, 56, 52, 0, 360, 0, 36);
  p.shadedFill(hd, "#b4c7db", "#8298b0", rad(-125), 56, 0.45);
  p.inkRing(hd, 10, thickAngle(rad(-125)));

  // Bright expressive eye + beak + white cere
  p.ell(hx + 20, hy - 8, 13, 13, "#fffdf5", 5);
  p.dot(hx + 23, hy - 8, 6.5, INK);
  p.poly([[hx + 50, hy - 8], [hx + 94, hy + 4], [hx + 48, hy + 18]], "#f2b838", 8);
  p.ell(hx + 48, hy - 6, 11, 8, "#f7f3ea", 4);

  // Legs + Hero Red-and-Gold Message Quill Tube!
  if (perched) {
    for (const dx of [-18, 22]) {
      p.stroke([[cx + dx, cy + 72], [cx + dx - 6, cy + 128]], 11, "#d96452");
      p.stroke([[cx + dx - 28, cy + 128], [cx + dx + 26, cy + 128]], 10, "#d96452");
    }
    if (hasTube) {
      // Gleaming red & gold microfilm message capsule strapped to front leg!
      p.poly(rrect(cx + 6, cy + 84, cx + 48, cy + 114, 8), TRICOLOR_R, 7);
      p.poly(rrect(cx + 20, cy + 84, cx + 34, cy + 114, 2), GOLD, 4);
    }
  } else {
    // Tucked red feet + gleaming message capsule under belly
    p.stroke([[cx - 22, cy + 74], [cx - 48, cy + 96]], 10, "#d96452");
    if (hasTube) {
      p.poly(rrect(cx - 48, cy + 68, cx + 22, cy + 104, 10), TRICOLOR_R, 8);
      p.poly(rrect(cx - 22, cy + 68, cx - 2, cy + 104, 2), GOLD, 5);
      // Tiny rolled white microfilm peeking from tube tip
      p.ell(cx + 22, cy + 86, 8, 13, "#fff9e2", 5);
    }
  }

  // Front animated wing with crisp double dark wing-bars!
  if (perched) {
    const fw = ellPts(cx - 18, cy + 14, 88, 44, 0, 360, -14, 36);
    p.shadedFill(fw, "#8da3ba", "#61768c", rad(-125), 88, 0.4);
    p.inkRing(fw, 9, thickAngle(rad(-125)));
    p.stroke([[cx - 65, cy + 4], [cx + 25, cy - 16]], 9, "#364454");
    p.stroke([[cx - 56, cy + 26], [cx + 30, cy + 8]], 9, "#364454");
  } else {
    const wy = cy - 28 - flap * 125;
    const wing = [[cx + 32, cy - 6], [cx - 16, wy - 44], [cx - 132, wy + 10], [cx - 82, cy + 36], [cx + 12, cy + 26]];
    p.shadedFill(wing, "#c6d6e6", "#8ea4bc", rad(-125), 110, 0.45);
    p.inkRing(wing, 10, thickAngle(rad(-125)));
    p.stroke([[cx - 95, (wy + cy) * 0.52], [cx - 5, (wy + cy) * 0.46]], 10, "#3b4a5e");
  }
};

/** Cartoon sweeping wind gust ribbons (for "wherever the wind took them") */
export const fxWindSwirl = (p, phase = 0) => {
  const g = p.g; g.save(); g.globalAlpha = 0.88;
  const shift = ((phase * 140) % 160) - 80;
  for (const [y0, amp, lw] of [[340, 32, 16], [470, -28, 20], [595, 24, 14]]) {
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const u = i / 18;
      pts.push([55 + u * 470 + shift * 0.45, y0 + Math.sin(u * Math.PI * 2 + phase * 2) * amp]);
    }
    p.stroke(pts, lw + 8, "#241726");
    p.stroke(pts, lw, "#eef9ff");
    // Spiral curl tip
    const [ex, ey] = pts[pts.length - 1];
    p.arc(ex - 22, ey - 24, 24, 24, -40, 220, lw * 0.72, "#eef9ff");
  }
  g.restore();
};

/** Punchy bold golden Question Mark ("So how did Paris get replies?") */
export const fxQuestion = (p, phase = 0) => {
  const yBob = Math.sin(phase * 4) * 18;
  const g = p.g;
  g.save();
  g.translate(300, 440 + yBob);
  g.rotate(Math.sin(phase * 3) * 0.08);
  g.font = "900 380px DejaVu Sans, Arial Black, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 34; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText("?", 0, 0);
  g.fillStyle = "#ffd644"; g.fillText("?", 0, 0);
  g.restore();
};

/** Electric wire snap spark burst for the cut telegraph wire */
export const fxSpark = (p, t = 0) => {
  const cx = 300, cy = 480;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 1.4;
    const r0 = 35, r1 = 120 + 95 * Math.sin(t * Math.PI);
    p.stroke([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], 16, INK);
    p.stroke([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], 10, i % 2 ? "#fff4a8" : "#42d4ff");
  }
  p.ell(cx, cy, 42, 42, "#ffffff", 8);
};

/** Cartoon Prussian rifle/cannon muzzle flash */
export const fxMuzzleFlash = (p, t = 0) => {
  const s = Math.sin(clamp(t, 0, 1) * Math.PI);
  if (s <= 0.02) return;
  const cx = 300, cy = 500, pts = [];
  for (let i = 0; i < 14; i++) {
    const r = (i % 2 ? 75 : 210) * s, a = rad(i * (360 / 14));
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  p.poly(pts, "#ff9e24", 12);
  p.ell(cx, cy, 65 * s, 65 * s, "#fff7b8", 6);
};

/** Layered billowing smoke / coal-gas hiss cloud */
export const fxSmoke = (p, k, col = "#ebeef2") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, (1 - k) * 0.90);
  const r = 68 + 100 * k;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + k * 1.4;
    p.ell(300 + Math.cos(a) * (42 + 65 * k), 500 + Math.sin(a) * (34 + 48 * k), r * 0.72, r * 0.62, col, 8);
  }
  p.ell(300, 500, r * 0.90, r * 0.78, col, 0);
  g.restore();
};

/** Crisp vintage Parisian airmail letter envelope with red wax seal */
export const fxLetter = (p, rotDeg = 0) => {
  p.rot = rotDeg ? [rad(rotDeg), 300, 480] : null;
  p.poly(rrect(120, 360, 480, 600, 14), "#fffdf4", 12);
  p.stroke([[132, 372], [300, 505], [468, 372]], 10, TRICOLOR_B);
  p.ell(300, 505, 24, 24, TRICOLOR_R, 7);
  p.rot = null;
};

/** Radial celebratory fan of miniature envelopes bursting out ("carry thousands") */
export const fxMiniLetterFan = (p, k = 1) => {
  const cx = 300, cy = 540;
  for (let i = 0; i < 9; i++) {
    const frac = i / 8;
    const ang = rad(-155 + frac * 130);
    const dist = (145 + (i % 2) * 58) * k;
    const lx = cx + Math.cos(ang) * dist, ly = cy + Math.sin(ang) * dist;
    p.rot = [ang + Math.PI / 2, lx, ly];
    p.poly(rrect(lx - 42, ly - 28, lx + 42, ly + 28, 6), "#fffdf2", 6);
    p.stroke([[lx - 38, ly - 24], [lx, ly + 6], [lx + 38, ly - 24]], 4.5, TRICOLOR_B);
    p.ell(lx, ly + 6, 7, 7, TRICOLOR_R, 2.5);
    p.rot = null;
  }
};

/** Twinkling golden hero sparkle burst */
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
