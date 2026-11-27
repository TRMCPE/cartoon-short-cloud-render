// ---------------- Khmer Sibling Cast, Lounging Sofa King & Rollo Visual Cards (built on toonbase.js Pen) ----------------
FACE.kingSmug = { eye: ["lid", "lid"], brow: [4, -4], mouth: "smirk" };
FACE.lazyYawn = { eye: ["dash", "dash"], brow: [-2, 1], mouth: "O" };
FACE.megaShout = { eye: ["squeeze", "squeeze"], brow: [-6, -5], mouth: "laugh" };
FACE.panic = { eye: ["shock", "shock"], brow: [-7, -5], mouth: "wave" };
FACE.panting = { eye: ["squeeze", "lid"], brow: [-4, 3], mouth: "laugh" };
FACE.argue = { eye: ["shock", "lid"], brow: [5, -3], mouth: "O" };
FACE.sour = { eye: ["squeeze", "slit"], brow: [6, 4], mouth: "wave" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smileWide" };
FACE.sheepish = { eye: ["happy", "lid"], brow: [-3, 2], mouth: "wave" };

const KH_GOLD = "#ffd23f", KH_RUBY = "#c92438", KH_KRAMA_RED = "#b52632", KH_KRAMA_BLUE = "#26529c";
const KH_TEAL = "#1f7a8c", KH_NAVY = "#2b3a52", KH_SKY = "#2e8ae6";

export const SIBLING_ROLES = {
  olderBro: {
    skin: "#d89666", top: "#bf2c3b", trim: "#ffd23f", shorts: KH_NAVY, krama: KH_KRAMA_RED,
    hair: "spiky", hairCol: "#1c1413", isKid: false,
  },
  youngerBro: {
    skin: "#de9d6e", top: KH_SKY, trim: "#ffe066", shorts: "#274c6b", krama: KH_KRAMA_BLUE,
    hair: "tousled", hairCol: "#211716", isKid: true,
  },
};

const drawSiblingHair = (p, O, H, cx, hc, light, thick, ow, u, facing) => {
  const crown = hc - H.b, hCol = O.hairCol || "#1e1615", dir = facing || 1;
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
    p.poly([
      [cx + dir * 6 * u, crown + 4 * u],
      [cx + dir * 24 * u, crown - 15 * u],
      [cx + dir * 20 * u, crown + 6 * u],
      [cx + dir * 38 * u, crown - 7 * u],
      [cx + dir * 28 * u, crown + 14 * u],
    ], hCol, ow * 0.72);
  }
};

/** Ornate Golden Khmer Royal Crown (មកុដស្តេច «បង»!) */
const drawKhmerCrown = (p, cx, crownY, u, light, thick) => {
  const base = [
    [cx - 42 * u, crownY + 8 * u],
    [cx - 46 * u, crownY - 14 * u],
    [cx - 24 * u, crownY - 6 * u],
    [cx - 18 * u, crownY - 34 * u],
    [cx - 6 * u, crownY - 12 * u],
    [cx, crownY - 64 * u],
    [cx + 6 * u, crownY - 12 * u],
    [cx + 18 * u, crownY - 34 * u],
    [cx + 24 * u, crownY - 6 * u],
    [cx + 46 * u, crownY - 14 * u],
    [cx + 42 * u, crownY + 8 * u],
  ];
  p.shadedFill(base, KH_GOLD, "#c98a18", light, 46 * u, 0.38);
  p.inkRing(base, 4.2 * u, thick);
  p.band([[cx - 40 * u, crownY + 3 * u], [cx + 40 * u, crownY + 3 * u]], KH_RUBY, 6 * u, 1.8 * u, "round");
  p.dot(cx, crownY - 18 * u, 5.5 * u, KH_RUBY);
  p.dot(cx - 22 * u, crownY - 12 * u, 4.0 * u, "#2cc96b");
  p.dot(cx + 22 * u, crownY - 12 * u, 4.0 * u, "#2cc96b");
};

/** Crisp 2D Cartoon TV Remote Control (តេឡេទូរទស្សន៍) */
const drawRemoteProp = (p, x, y, u, ang = -0.35, clickSpark = false) => {
  const c = Math.cos(ang), s = Math.sin(ang);
  const R = (dx, dy) => [x + dx * c - dy * s, y + dx * s + dy * c];
  const body = [R(-11 * u, -24 * u), R(11 * u, -24 * u), R(11 * u, 24 * u), R(-11 * u, 24 * u)];
  p.poly(body, "#232834", 3.4 * u);
  const [px, py] = R(0, -15 * u);
  p.dot(px, py, 4.8 * u, "#ff3b3b");
  for (const ry of [-4, 6, 15]) {
    for (const rx of [-4.5, 4.5]) {
      const [bx, by] = R(rx * u, ry * u);
      p.dot(bx, by, 2.3 * u, ry === -4 ? "#ffd23f" : "#a8b8cc");
    }
  }
  if (clickSpark) {
    for (const da of [-0.5, 0, 0.5]) {
      const a0 = ang - Math.PI / 2 + da;
      p.stroke([
        [px + Math.cos(a0) * 8 * u, py + Math.sin(a0) * 8 * u],
        [px + Math.cos(a0) * 22 * u, py + Math.sin(a0) * 22 * u],
      ], 3.0 * u, "#ffd23f");
    }
  }
};

/** Older Brother Sprawled Lazily Across the Khmer Wooden Salon (ដេកលើសាឡុង!)
 *  Head & bolster pillow on RIGHT (x_cv ~ 415) so his dangling/pointing right arm (x_cv ~ 480..555)
 *  is right next to the 3D TV remote stool on the right edge of the salon! */
const drawLoungingBro = (p, O, opts) => {
  const {
    wv = 0, expr = "kingSmug", blink = 0, look = 0,
    loungePose = "dangle", crown = false, remote = false, clickSpark = false,
  } = opts;
  const light = rad(-115), thick = thickAngle(light), skin = O.skin;
  const lid = lidOf(blink);
  const breath = Math.sin(wv) * 3.5;
  p.rot = null;

  // 1. Plump bolster pillow under head/shoulder on right side of salon
  const pil = rrect(345, 658, 505, 760, 30);
  p.shadedFill(pil, "#fffdf7", "#d8e2ee", light, 82, 0.4);
  p.inkRing(pil, 9, thick);
  p.band([[365, 708], [485, 708]], KH_GOLD, 6, 1.5);

  // 2. Crossed bare feet & navy home shorts kicked out lazily to the left (x_cv = 85..245)
  const legCol = mix(skin, INK, 0.20);
  p.stroke(curve([225, 726], [155, 718], [98, 704]), 22, legCol);
  p.stroke(curve([225, 740], [162, 748], [112, 738]), 22, legCol);
  p.ell(92, 696, 16, 28, skin, 6.5, 0, 360, -18);
  p.ell(106, 734, 15, 26, skin, 6.5, 0, 360, -8);

  const shorts = [
    [188, 696], [268, 690], [272, 762], [184, 756],
  ];
  p.shadedFill(shorts, O.shorts, mul(O.shorts, SH_CLOTH), light, 55, 0.4);
  p.inkRing(shorts, 8.5, thick);

  // 3. Reclining maroon torso + checkered Khmer Krama sash
  const body = ellPts(320, 724 - breath * 0.4, 88, 48 + breath * 0.3, 0, 360, -6, 40);
  p.shadedFill(body, O.top, mul(O.top, SH_CLOTH), light, 88, 0.4);
  p.clip(body, () => {
    p.band([[275, 678], [345, 772]], O.krama, 26, 3);
    for (let k = 0; k < 5; k++) {
      const kx = 282 + k * 14, ky = 688 + k * 17;
      p.poly(rrect(kx - 6, ky - 5, kx + 6, ky + 5, 2), "#fff7ee", 0);
    }
  });
  p.inkRing(body, 9.5, thick);

  // 4. Back/Left arm tucked casually behind head (or cupped around mouth when screaming!)
  const armCol = mix(skin, INK, 0.16);
  if (loungePose === "scream") {
    p.stroke(curve([365, 698], [345, 642], [385, 638]), 13, armCol);
    p.dot(385, 638, 12, skin);
  } else {
    p.stroke(curve([365, 696], [350, 642], [392, 628]), 13, armCol);
  }

  // 5. Bean Head propped comfortably on pillow facing RIGHT (+1, toward remote & younger bro!)
  const H = headBlob(5, 98, 1), W = 2 * H.a, u = W / 100;
  const hx = 416, hy = 642;
  const hp = blobPts(hx, hy, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawSiblingHair(p, O, H, hx, hy, light, thick, 9.5, u, 1);
  if (crown) {
    drawKhmerCrown(p, hx, hy - H.b + 4 * u, u * 1.05, light, thick);
  }
  faceFront(p, hx, hy, W, expr, 1, look, lid, false, skin, undefined, false);

  // 6. Front/Right arm — right at the right edge of the salon (x_cv = 460..565)!
  const sh = [382, 728];
  if (loungePose === "point") {
    // Lazily pointing straight right at the TV remote 10cm away!
    const hand = [548, 726 + Math.sin(wv * 1.5) * 4];
    p.stroke(curve(sh, [468, 736], hand), 13.5, armCol);
    p.ell(hand[0], hand[1], 13, 11, skin, 4.5);
    p.band([[hand[0] + 6, hand[1] - 2], [hand[0] + 32, hand[1] - 2]], skin, 8.5, 3.0, "round");
  } else if (loungePose === "demand") {
    // Open palm held lazily up waiting for younger bro to place the remote in it!
    const hand = [542, 706 + Math.sin(wv * 2.2) * 5];
    p.stroke(curve(sh, [465, 726], hand), 13.5, armCol);
    p.ell(hand[0] + 8, hand[1], 18, 11, skin, 4.5, 0, 360, -12);
  } else if (loungePose === "scream") {
    // Right hand also cupped around mouth roaring across the village!
    p.stroke(curve(sh, [486, 695], [462, 654]), 13.5, armCol);
    p.dot(462, 654, 13, skin);
  } else if (loungePose === "king") {
    // Imperious royal gesture holding a golden scepter!
    const hand = [530, 672];
    p.stroke(curve(sh, [472, 708], hand), 13.5, armCol);
    p.band([[hand[0] - 8, hand[1] + 42], [hand[0] + 22, hand[1] - 68]], KH_GOLD, 9, 3, "round");
    p.dot(hand[0] + 24, hand[1] - 74, 16, KH_RUBY);
    p.dot(hand[0], hand[1], 13, skin);
  } else if (loungePose === "remote" || remote) {
    // Happily clicking the TV remote!
    const hand = [536, 700];
    p.stroke(curve(sh, [466, 724], hand), 13.5, armCol);
    p.dot(hand[0], hand[1], 13, skin);
    drawRemoteProp(p, hand[0] + 18, hand[1] - 12, 1.85, 0.45, clickSpark);
  } else {
    // Default "dangle": elbow resting on edge, hand dangling literally inches from the 3D remote!
    const hand = [532, 754 + Math.sin(wv) * 4];
    p.stroke(curve(sh, [472, 732], hand), 13.5, armCol);
    p.ell(hand[0], hand[1], 13, 15, skin, 4.5, 0, 360, 15);
  }
};

/** Standing / Running / Panting / Arguing / Sour-Faced Khmer Sibling Character */
export const khmerSiblingChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? SIBLING_ROLES[key] : key;
  if (opts.mode === "lounge") return drawLoungingBro(p, O, opts);

  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 2,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, sprint = false, pant = false, wv = 0,
    crown = false, scepter = false, remote = false, toyBall = false,
    sweat = false, sweatSpray = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const headR = O.isKid ? 108 : 116;
  const H = headBlob(seed, headR, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.isKid ? 0.96 : 1.08, legsL = O.isKid ? 1.18 : 1.34, sole = 975;
  const runBounce = sprint ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.14 * HH : (pant ? Math.sin(wv * 2.5) * 0.03 * HH : 0);
  const crouchDrop = pant ? 0.08 * HH : 0;
  const torsoBot = sole - legsL * HH - bob * HH - runBounce + crouchDrop;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(skin, INK, 0.22), armCol = mix(skin, INK, 0.17);

  p.rot = null;

  // ---- Legs & Flip-Flops ----
  for (const side of [-1, 1]) {
    const ph = step + (side > 0 ? 0.5 : 0);
    if (sprint) {
      const swing = Math.sin(Math.PI * 2 * ph);
      const hx = cx + side * 14 * u;
      const fx = cx + swing * 64 * u * (facing || 1);
      const fy = sole - 12 * u - Math.max(0, Math.cos(Math.PI * 2 * ph)) * 48 * u;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + (facing || 1) * 14 * u, (hipY + fy) / 2 - 10 * u], [fx, fy]), 6.0 * u, legCol);
      p.stroke([[fx - 6 * u, fy], [fx + (facing || 1) * 16 * u, fy - 3 * u]], 7.5 * u + 3, INK);
      p.stroke([[fx - 6 * u, fy], [fx + (facing || 1) * 16 * u, fy - 3 * u]], 7.5 * u, "#2c82c9");
    } else {
      const up = Math.max(0, Math.sin(Math.PI * 2 * ph)) * 28 * (step ? 1 : 0);
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
      const kneeBend = pant ? (facing || 1) * 10 * u : side * 2 * u;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + kneeBend, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, O.isKid ? "#2c82c9" : "#b52632");
    }
  }

  // ---- Torso + Shorts + Krama ----
  const runLean = sprint ? (facing || 1) * 12 : (pant ? (facing || 1) * 9 : 0);
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
      case "run": {
        const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
        return { pts: [s, [X(16), s[1] + 0.26 * HH], [tcx + sw * 44 * u * (facing || 1), s[1] + (0.10 - sw * 0.22) * HH]], front: side * (facing || 1) > 0 };
      }
      case "knees": // Resting hands on knees panting!
        return { pts: [s, [X(18), s[1] + 0.42 * HH], [tcx + side * 18 * u + (facing || 1) * 8 * u, torsoBot + 0.18 * HH]], front: true };
      case "panic": // Both hands thrown high in shock!
        return { pts: [s, [X(28), s[1] - 0.18 * HH], [X(44), s[1] - 0.62 * HH]], front: true };
      case "argue": // Animated protest gesture pointing toward remote/brother!
        return { pts: [s, [X(26), s[1] + 0.16 * HH], [tcx + side * 44 * u + (facing || 1) * 18 * u, s[1] - 0.04 * HH + Math.sin(wv * 2) * 8 * u]], front: true };
      case "offer": // Extending hand to pass the TV remote!
        return { pts: [s, [X(24), s[1] + 0.18 * HH], [tcx + (facing || side) * 52 * u, torsoBot - 0.42 * HH]], front: true };
      case "slump": // Defeated sour-faced droopy arm!
        return { pts: [s, [X(8), s[1] + 0.52 * HH], [X(6), chin + 1.12 * HH]], front: false };
      case "sampheah":
        return { pts: [s, [X(16), s[1] + 0.40 * HH], [tcx + side * 4 * u, chin + 0.42 * HH]], front: true };
      case "play": {
        const py = Math.sin(wv * 2) * 12 * u;
        return { pts: [s, [X(20), s[1] + 0.24 * HH], [tcx + side * 24 * u + (facing || 1) * 12 * u, torsoBot - 0.34 * HH + py]], front: true };
      }
      case "point":
        return { pts: [s, [X(28), s[1] - 0.05 * HH], [tcx + (facing || side) * 62 * u, s[1] - 0.18 * HH]], front: true };
      case "wave":
        return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(34 + 12 * Math.sin(wv)), s[1] - 0.68 * HH]], front: false };
      case "shrug":
        return { pts: [s, [X(24), s[1] + 0.26 * HH], [X(48), s[1] - 0.06 * HH]], front: false };
      case "hip":
        return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.92, torsoBot - 0.25 * HH]], front: false };
      case "up":
        return { pts: [s, [X(18), s[1] - 0.34 * HH], [X(28), s[1] - 0.80 * HH]], front: false };
      default:
        return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.02 * HH]], front: false };
    }
  };

  const arms = [arm(-1, sprint ? "run" : (pant ? "knees" : L)), arm(1, sprint ? "run" : (pant ? "knees" : R))];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
  };
  for (const a of arms) if (!a.front) drawArm(a);

  // Shorts
  const sh = [
    [tcx - 0.94 * T.a, torsoBot - 0.22 * HH], [tcx + 0.94 * T.a, torsoBot - 0.22 * HH],
    [tcx + 1.02 * T.a, torsoBot + 0.34 * HH], [tcx, torsoBot + 0.20 * HH], [tcx - 1.02 * T.a, torsoBot + 0.34 * HH],
  ];
  p.gradFill(sh, O.shorts, mul(O.shorts, SH_CLOTH), light);
  p.inkRing(sh, ow * 0.85, thick);

  // Shirt + Checkered Krama belt/scarf
  p.gradFill(tp, O.top, mul(O.top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.trim) {
      p.ell(tcx + 4 * u * facing, chin + 0.04 * HH, 24 * u, 11 * u, O.trim, 2.2 * u);
    }
    if (O.krama) {
      // Iconic checkered Khmer Krama waist/shoulder accent!
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

  // ---- Held Props ----
  const [lhx, lhy] = arms[0].pts[2];
  const [rhx, rhy] = arms[1].pts[2];
  if (remote) {
    const useLeft = L === "offer" || (facing < 0 && R !== "offer");
    const [mx, my] = useLeft ? [lhx, lhy] : [rhx, rhy];
    drawRemoteProp(p, mx + (facing || -1) * 10 * u, my - 6 * u, u * 0.95, (facing || -1) * 0.45, false);
  }
  if (scepter) {
    p.band([[rhx - 4 * u, rhy + 22 * u], [rhx + 14 * u, rhy - 54 * u]], KH_GOLD, 5.5 * u, 1.8 * u, "round");
    p.dot(rhx + 15 * u, rhy - 58 * u, 9.5 * u, KH_RUBY);
  }
  if (toyBall) {
    const bounceY = Math.abs(Math.sin(wv * 2.4)) * 28 * u;
    const bx = (lhx + rhx) / 2 + (facing || -1) * 14 * u, by = Math.min(lhy, rhy) - 10 * u - bounceY;
    p.ell(bx, by, 14 * u, 14 * u, "#ff6b35", 3.0 * u);
    p.arc(bx, by, 10 * u, 6 * u, 15, 165, 2.2 * u, "#ffd23f");
  }

  // ---- Head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt + runLean), [cx, hipY]);
  const Ah = tilt + runLean + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  drawSiblingHair(p, O, H, cx, hc, light, thick, ow, u, facing);
  if (crown) {
    drawKhmerCrown(p, cx, hc - H.b + 4 * u, u, light, thick);
  }

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, undefined, false);

  // Extra hilarious puckered cheek wrinkles when Younger Bro makes the sour face (ទឹកមុខជូរហួញ)!
  if (expr === "sour") {
    const mx = cx + 8 * u * facing, my = hc + 20 * u;
    p.stroke([[mx - 14 * u, my - 5 * u], [mx - 9 * u, my], [mx - 14 * u, my + 5 * u]], 2.6 * u, INK);
    p.stroke([[mx + 14 * u, my - 5 * u], [mx + 9 * u, my], [mx + 14 * u, my + 5 * u]], 2.6 * u, INK);
  }

  // Sweat drops (បែកញើសជោកខ្លួន / រត់ត្រហេបត្រហប)!
  if (sweat || sweatSpray) {
    const sx = cx - (facing || 1) * 38 * u, sy = hc - 14 * u;
    p.poly([[sx, sy - 15 * u], [sx + 8.5 * u, sy + 4 * u], [sx, sy + 11 * u], [sx - 8.5 * u, sy + 4 * u]], "#74d4ff", 2.5 * u);
    if (sweatSpray) {
      for (const [dx, dy] of [[-54, -34], [-62, -4], [46, -32]]) {
        const px = cx - (facing || 1) * dx * u, py = hc + dy * u;
        p.ell(px, py, 5.5 * u, 3.5 * u, "#74d4ff", 2.0 * u, 0, 360, dx > 0 ? 25 : -25);
      }
    }
  }
  p.rot = null;
};

/** Bold Rollo-Style Visual Comic Cards (clean icons & crisp short numbers, zero unreadable tiny text!) */
export const drawComicCard = (p, kind = "tenCmRuler", k = 1) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;

  if (kind === "tenCmRuler") {
    // Crisp bright yellow 10cm ruler + red double-arrow caliper!
    const boxPts = rrect(85, 430, 515, 555, 22);
    p.shadedFill(boxPts, "#ffe14d", "#d9a31e", light, 215, 0.4);
    p.inkRing(boxPts, 11, thick);
    for (let i = 0; i <= 10; i++) {
      const tx = 115 + i * 37;
      const th = i % 5 === 0 ? 38 : 22;
      p.stroke([[tx, 432], [tx, 432 + th]], i % 5 === 0 ? 7 : 4.5, INK);
    }
    // Red double-headed measurement arrow above ruler
    p.band([[115, 382], [485, 382]], "#ff3b3b", 12, 3.5, "round");
    p.poly([[100, 382], [142, 356], [142, 408]], "#ff3b3b", 7);
    p.poly([[500, 382], [458, 356], [458, 408]], "#ff3b3b", 7);
    const g = p.g; g.save();
    g.font = "900 84px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 13; g.strokeStyle = INK; g.fillStyle = "#ffffff";
    g.strokeText("10 cm!", 300, 512);
    g.fillText("10 cm!", 300, 512);
    g.restore();
  } else if (kind === "noOrdinaryBadge") {
    // Plain speech-bubble tag crossed out in bold red («មិនមែនគ្រាន់តែជាសព្វនាមធម្មតាទេ»)
    const bg = ellPts(300, 490, 175, 175, 0, 360, 0, 44);
    p.shadedFill(bg, "#eef4fa", "#c5d3e0", light, 175, 0.4);
    p.inkRing(bg, 11, thick);
    const tag = rrect(185, 430, 415, 545, 26);
    p.poly(tag, "#ffffff", 9);
    for (const dx of [245, 300, 355]) p.dot(dx, 488, 13, "#52657a");
    // Bold red X cross-out
    p.band([[180, 375], [420, 605]], "#e62e2e", 22, 5, "round");
    p.band([[420, 375], [180, 605]], "#e62e2e", 22, 5, "round");
  } else if (kind === "kingBongCrown") {
    // Radiant Royal Khmer Crown Medallion («អំណាចស្តេច!»)
    const s = 0.94 + 0.06 * Math.sin(k * 5);
    const rays = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = (i % 2 === 0 ? 225 : 178) * s;
      rays.push([300 + Math.cos(a) * r, 485 + Math.sin(a) * r]);
    }
    p.poly(rays, "#fff3b0", 10);
    const med = ellPts(300, 485, 155, 155, 0, 360, 0, 44);
    p.shadedFill(med, "#c92438", "#7d1220", light, 155, 0.4);
    p.inkRing(med, 11, thick);
    drawKhmerCrown(p, 300, 535, 2.35, light, thick);
  } else if (kind === "noGetUpCross") {
    // Red Prohibited Circle-Slash over Upward Arrow («ដាច់ខាតមិនងើបខ្លួនឯងឡើយ!»)
    const ring = ellPts(300, 485, 175, 175, 0, 360, 0, 44);
    p.shadedFill(ring, "#ff4747", "#ad1d1d", light, 175, 0.4);
    p.inkRing(ring, 12, thick);
    p.ell(300, 485, 132, 132, "#fffdf7", 9);
    // Upward arrow inside
    p.poly([[300, 385], [365, 460], [326, 460], [326, 575], [274, 575], [274, 460], [235, 460]], "#2b3a52", 8);
    // Diagonal red slash
    p.band([[202, 388], [398, 582]], "#ff3b3b", 28, 6, "round");
  } else if (kind === "villageSiren") {
    // Flashing Red & Gold Emergency Alarm Siren («ហាក់ដូចមានអាសន្នធំណាស់អ៊ីចឹង!»)
    const flash = Math.sin(k * 18) > 0;
    for (const a of [-145, -115, -65, -35]) {
      p.stroke([
        [300 + Math.cos(rad(a)) * 125, 495 + Math.sin(rad(a)) * 125],
        [300 + Math.cos(rad(a)) * 205, 495 + Math.sin(rad(a)) * 205],
      ], 14, flash ? "#ffd23f" : "#ff4747");
    }
    const dome = ellPts(300, 525, 105, 135, 180, 360, 0, 32);
    p.shadedFill(dome, flash ? "#ff3838" : "#ff6b4a", "#9e1919", light, 105, 0.4);
    p.inkRing(dome, 11, thick);
    p.ell(272, 465, 18, 42, "#ffd0d0", 0, 0, 360, 15);
    const base = rrect(172, 520, 428, 580, 18);
    p.shadedFill(base, "#374457", "#1e2633", light, 128, 0.4);
    p.inkRing(base, 10, thick);
  } else if (kind === "handSpanMeasure") {
    // Glowing Golden Hand-Span Arc («តែមួយចំអាមប៉ុណ្ណោះ!»)
    p.arc(300, 560, 175, 115, 195, 345, 14, "#ffd23f");
    p.poly([[122, 540], [156, 502], [166, 554]], "#ffd23f", 7);
    p.poly([[478, 540], [444, 502], [434, 554]], "#ffd23f", 7);
    const pill = rrect(175, 365, 425, 465, 26);
    p.shadedFill(pill, "#ff3b3b", "#a61919", light, 125, 0.4);
    p.inkRing(pill, 10, thick);
    const g = p.g; g.save();
    g.font = "900 68px Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 11; g.strokeStyle = INK; g.fillStyle = "#fffdf5";
    g.strokeText("10 cm", 300, 418);
    g.fillText("10 cm", 300, 418);
    g.restore();
  } else if (kind === "remoteDemandBubble") {
    // Comic demand speech burst showing TV Remote + Curved Arrow into Brother's hand!
    const cl = ellPts(300, 475, 175, 132, 0, 360, 0, 40);
    p.shadedFill(cl, "#fffdf5", "#dde7f2", light, 175, 0.4);
    p.inkRing(cl, 10.5, thick);
    drawRemoteProp(p, 355, 475, 2.3, 0.2, true);
    p.arc(285, 495, 70, 52, 195, 335, 12, "#ff3b3b");
    p.poly([[205, 485], [244, 452], [248, 505]], "#ff3b3b", 6.5);
  } else if (kind === "likeCommentCta") {
    // Crisp Glowing Blue Thumbs-Up Like Badge + Gold Comment Speech Bubble («ចុចឡៃ និងខមិន!»)
    const lk = rrect(115, 385, 335, 565, 34);
    p.shadedFill(lk, "#2986f5", "#1752a6", light, 110, 0.4);
    p.inkRing(lk, 10.5, thick);
    // Crisp cartoon white thumb-up icon
    p.poly(rrect(155, 468, 192, 535, 8), "#ffffff", 6.5);
    p.poly([[196, 468], [222, 412], [246, 416], [240, 458], [295, 458], [286, 535], [196, 535]], "#ffffff", 6.5);

    const cm = rrect(295, 250, 505, 415, 32);
    p.shadedFill(cm, "#ffd23f", "#cf9619", light, 105, 0.4);
    p.inkRing(cm, 10.5, thick);
    for (const dx of [355, 400, 445]) p.dot(dx, 332, 13, "#241726");
  }
};

/** Expanding comic megaphone sound arcs when Brother screams across the village! */
export const drawShoutArcs = (p, k = 0) => {
  for (let i = 0; i < 3; i++) {
    const u = (k + i / 3) % 1;
    const r = 65 + u * 205;
    p.arc(215, 480, r, r * 1.18, -45, 45, Math.max(4, 15 * (1 - u)), i % 2 ? "#ffd23f" : "#ff5238");
  }
};

/** Sour dark-violet comic gloom squiggle cloud above defeated Younger Bro (ទឹកមុខជូរហួញ!) */
export const drawSourCloud = (p, k = 0) => {
  const light = rad(-120), thick = thickAngle(light);
  const yOff = Math.sin(k * Math.PI * 2) * 10;
  const cl = ellPts(300, 420 + yOff, 145, 78, 0, 360, 0, 36);
  p.shadedFill(cl, "#7e789c", "#4b4566", light, 145, 0.4);
  p.inkRing(cl, 9.5, thick);
  for (const sx of [255, 300, 345]) {
    p.stroke([[sx, 505 + yOff], [sx - 10, 545 + yOff]], 6.5, "#6ec6ff");
  }
};

/** Sprinting cartoon dust puffs behind Younger Bro's flip-flops! */
export const fxDust = (p, k, col = "#f0c9a8") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 75 + 135 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.6, 95 + 45 * k, 78 + 38 * k, col, 10);
  }
  p.ell(300, 540, 135 + 85 * k, 105 + 60 * k, col, 0);
  g.restore();
};
