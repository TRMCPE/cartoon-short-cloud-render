// ---------------- Cambodian High School Rom-Com & Slapstick Cast + Visual Gag Cards ----------------
// Built on toonbase.js Pen (design space 600 x 1000, soles at y = 975).
// All custom poses & effects strictly stay within 0..600 x 0..1000 so ZERO card clipping ever occurs!

FACE.freezePanic = { eye: ["shock", "shock"], brow: [-8, -6], mouth: "O" };
FACE.movieCool = { eye: ["lid", "lid"], brow: [4, -5], mouth: "smirk" };
FACE.dreamySmirk = { eye: ["happy", "happy"], brow: [-3, -4], mouth: "smileWide" };
FACE.crushGasp = { eye: ["shock", "shock"], brow: [-7, -6], mouth: "o" };
FACE.sweetChat = { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smile" };
FACE.bellyLaugh = { eye: ["squeeze", "squeeze"], brow: [-5, -5], mouth: "laugh" };
FACE.mudDeadpan = { eye: ["lid", "lid"], brow: [0, 0], mouth: "dash" };
FACE.shameCry = { eye: ["squeeze", "squeeze"], brow: [-6, 4], mouth: "wave" };
FACE.cheekyWink = { eye: ["happy", "dot"], brow: [-3, 3], mouth: "grin" };

const NAVY_UNIFORM = "#1b2e4b";
const WHITE_SHIRT = "#f8fbff";
const MUD_DARK = "#4a2c15";
const MUD_MID = "#6b4121";
const HEART_PINK = "#ff3b7f";
const GOLD_STAR = "#ffd644";

export const SCHOOL_ROLES = {
  heroBoy: {
    skin: "#dda072", shirt: WHITE_SHIRT, pants: NAVY_UNIFORM, shoe: "#f2f5f8",
    hair: "heroBoy", hairCol: "#181214", isGirl: false, badge: "#1e6bd6",
  },
  crushGirl: {
    skin: "#ebc09d", shirt: WHITE_SHIRT, skirt: NAVY_UNIFORM, shoe: "#232832",
    hair: "crushLong", hairCol: "#1a1216", ribbon: "#5ec2ff", isGirl: true, badge: "#1e6bd6",
  },
  friendGirl1: {
    skin: "#df9f72", shirt: WHITE_SHIRT, skirt: NAVY_UNIFORM, shoe: "#232832",
    hair: "ponytail", hairCol: "#221718", ribbon: "#ff7aa8", isGirl: true, badge: "#1e6bd6",
  },
  friendGirl2: {
    skin: "#e5b189", shirt: WHITE_SHIRT, skirt: NAVY_UNIFORM, shoe: "#232832",
    hair: "bobCut", hairCol: "#1c1415", ribbon: "#ffd23f", isGirl: true, badge: "#1e6bd6",
  },
  studentBoyA: {
    skin: "#d69464", shirt: WHITE_SHIRT, pants: NAVY_UNIFORM, shoe: "#2b303a",
    hair: "spiky", hairCol: "#1a1413", isGirl: false, badge: "#1e6bd6",
  },
  studentBoyB: {
    skin: "#e2a97e", shirt: WHITE_SHIRT, pants: NAVY_UNIFORM, shoe: "#f0f3f7",
    hair: "parted", hairCol: "#231917", isGirl: false, badge: "#1e6bd6",
  },
  studentGirlA: {
    skin: "#dca074", shirt: WHITE_SHIRT, skirt: NAVY_UNIFORM, shoe: "#232832",
    hair: "ponytail", hairCol: "#191214", ribbon: "#ffd23f", isGirl: true, badge: "#1e6bd6",
  },
  studentGirlB: {
    skin: "#e8b892", shirt: WHITE_SHIRT, skirt: NAVY_UNIFORM, shoe: "#232832",
    hair: "bobCut", hairCol: "#211618", ribbon: "#6ce08e", isGirl: true, badge: "#1e6bd6",
  },
};

/** Helper: Draw Crisp Pink Heart Shape */
const drawHeartShape = (p, cx, cy, r, fill = HEART_PINK, ol = 3.5) => {
  const pts = [];
  for (let i = 0; i < 32; i++) {
    const t = (i / 32) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([cx + (x / 16) * r, cy + (y / 16) * r]);
  }
  p.poly(pts, fill, ol);
};

/** Helper: 4-Point Sparkle Star */
const drawSparkleStar = (p, cx, cy, r, fill = "#ffffff", ol = 2.5) => {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rad_ = i % 2 === 0 ? r : r * 0.28;
    pts.push([cx + Math.cos(a) * rad_, cy + Math.sin(a) * rad_]);
  }
  p.poly(pts, fill, ol);
};

/** Helper: Student Hairstyles + Movie-Star Slick Pompadour + Mud Clump & Sprout! */
const drawStudentHair = (p, O, H, cx, hc, light, thick, ow, u, facing, opts = {}) => {
  const { hairMode = "normal", wv = 0, behindOnly = false } = opts;
  const crown = hc - H.b, hCol = O.hairCol || "#1a1216", dir = facing || 1;

  if (behindOnly) {
    if (O.hair === "crushLong") {
      // Silky flowing dark back hair cascading behind shoulders!
      const flow = Math.sin(wv * 3.0) * 6 * u;
      const backHair = [
        [cx - H.a * 1.06, hc - 0.15 * H.b],
        [cx + H.a * 1.06, hc - 0.15 * H.b],
        [cx + H.a * 1.18 + flow, hc + 1.55 * H.b],
        [cx + flow * 0.6, hc + 1.68 * H.b],
        [cx - H.a * 1.18 + flow, hc + 1.55 * H.b],
      ];
      p.shadedFill(backHair, hCol, "#0b0709", light, H.a * 1.2, 0.35);
      p.inkRing(backHair, ow * 0.85, thick);
    } else if (O.hair === "ponytail") {
      const px = cx - dir * H.a * 0.96, py = hc - 0.12 * H.b;
      const sw = Math.sin(wv * 4.0) * 7 * u;
      p.poly([
        [px, py - 8 * u],
        [px - dir * 42 * u, py + 6 * u + sw],
        [px - dir * 48 * u, py + 44 * u + sw],
        [px - dir * 16 * u, py + 28 * u + sw * 0.5],
      ], hCol, ow * 0.78);
      p.ell(px, py, 9 * u, 11 * u, O.ribbon || "#ff7aa8", 2.5 * u);
    }
    return;
  }

  // Front / Crown Hair
  const cap = ellPts(cx, hc - 0.40 * H.b, H.a * 1.05, H.b * 0.70, 176, 364, 0, 40);
  p.shadedFill(cap, hCol, "#0c080a", light, H.a, 0.35);
  p.inkRing(cap, ow * 0.82, thick);

  if (O.hair === "crushLong") {
    // Soft side-swept bangs + cute sky-blue hair clip!
    p.poly([
      [cx - H.a * 0.92, crown + 24 * u],
      [cx - 12 * u, crown + 6 * u],
      [cx + 28 * u, crown + 28 * u],
      [cx + H.a * 0.92, crown + 22 * u],
      [cx + H.a * 0.82, crown + 8 * u],
      [cx - H.a * 0.82, crown + 8 * u],
    ], hCol, ow * 0.65);
    const rx_ = cx - dir * 32 * u, ry_ = hc - 0.46 * H.b;
    p.ell(rx_ - 7 * u, ry_, 9 * u, 6 * u, O.ribbon || "#5ec2ff", 2.2 * u, 0, 360, -18);
    p.ell(rx_ + 7 * u, ry_ + 2 * u, 9 * u, 6 * u, O.ribbon || "#5ec2ff", 2.2 * u, 0, 360, 18);
  } else if (O.hair === "bobCut") {
    for (const s of [-1, 1]) {
      p.poly([
        [cx + s * H.a * 0.92, hc - 0.35 * H.b],
        [cx + s * H.a * 1.08, hc + 0.45 * H.b],
        [cx + s * H.a * 0.86, hc + 0.55 * H.b],
        [cx + s * H.a * 0.80, hc - 0.10 * H.b],
      ], hCol, ow * 0.72);
    }
  } else if (hairMode === "slickCool") {
    // Gleaming greased-back Movie-Star Pompadour Wave + Wind-Blown Shine!
    const wind = Math.sin(wv * 4.5) * 6 * u;
    const pomp = [
      [cx - dir * 36 * u, crown + 12 * u],
      [cx - dir * 18 * u, crown - 22 * u + wind * 0.3],
      [cx + dir * 24 * u, crown - 32 * u + wind * 0.5],
      [cx + dir * 56 * u + wind, crown - 10 * u],
      [cx + dir * 36 * u, crown + 18 * u],
    ];
    p.shadedFill(pomp, "#241920", "#0b070a", light, 55 * u, 0.4);
    p.inkRing(pomp, ow * 0.80, thick);
    // Glossy white pomade shine arc!
    p.band([[cx - dir * 12 * u, crown - 12 * u], [cx + dir * 26 * u, crown - 18 * u]], "#ffffff", 5.2 * u, 0, "round");
  } else if (O.hair === "spiky") {
    p.poly([
      [cx - 26 * u, crown + 8 * u], [cx - 12 * u, crown - 22 * u], [cx + 2 * u, crown + 4 * u],
      [cx + 18 * u, crown - 24 * u], [cx + 28 * u, crown + 6 * u], [cx + 42 * u, crown - 14 * u], [cx + 36 * u, crown + 14 * u],
    ], hCol, ow * 0.72);
  } else {
    // Youthful tousled Cambodian high school boy hair tufts
    p.poly([
      [cx - dir * 8 * u, crown + 6 * u],
      [cx + dir * 14 * u, crown - 18 * u],
      [cx + dir * 12 * u, crown + 4 * u],
      [cx + dir * 34 * u, crown - 14 * u],
      [cx + dir * 28 * u, crown + 12 * u],
    ], hCol, ow * 0.72);
  }

  // Heavy Sopping Mud Clump + Tiny Green Sprout on Head («ពិនិត្យមើលដីបន្តិច!»)!
  if (hairMode === "mudClump") {
    const mudBlob = [
      [cx - 44 * u, crown + 16 * u],
      [cx - 32 * u, crown - 14 * u],
      [cx - 4 * u, crown - 22 * u],
      [cx + 28 * u, crown - 16 * u],
      [cx + 46 * u, crown + 14 * u],
      [cx + 22 * u, crown + 28 * u],
      [cx - 8 * u, crown + 22 * u],
      [cx - 28 * u, crown + 30 * u],
    ];
    p.shadedFill(mudBlob, MUD_MID, MUD_DARK, light, 48 * u, 0.4);
    p.inkRing(mudBlob, ow * 0.78, thick);
    // Cute comical 2-leaf green sprout poking out of the mud clump!
    const sx = cx + 6 * u, sy = crown - 20 * u;
    p.stroke([[sx, sy + 4 * u], [sx + 2 * u, sy - 20 * u]], 3.6 * u, "#2b8a3e");
    p.ell(sx - 9 * u, sy - 22 * u, 10 * u, 5.5 * u, "#51cf66", 2.4 * u, 0, 360, -25);
    p.ell(sx + 12 * u, sy - 21 * u, 10 * u, 5.5 * u, "#51cf66", 2.4 * u, 0, 360, 25);
  }
};

/** Pose 1: Horizontal Mid-Air Freeze-Frame Right Above the Mud Puddle (Scene 1 & Loop Match-Cut Scene 9)! */
const drawHorizontalFreezeHero = (p, O, opts = {}) => {
  const { wv = 0 } = opts;
  const light = rad(-115), thick = thickAngle(light), skin = O.skin;
  const jit = Math.sin(wv * 6) * 3;
  p.rot = null;

  // Motion speed lines behind flying body (inside 40..560 x 350..850)
  for (const [lx, ly, len] of [[55, 585, 78], [42, 645, 92], [68, 705, 72]]) {
    p.stroke([[lx, ly], [lx + len, ly]], 4.5, "rgba(255,255,255,0.78)");
  }

  // Trailing dark-navy school trouser legs splayed in mid-air (left side x = 85..255)
  p.band(curve([252, 638 + jit], [175, 590 + jit], [104, 558 + jit]), O.pants, 30, 4.5, "round");
  p.ell(92, 552 + jit, 24, 13, O.shoe, 6.5, 0, 360, -28);
  p.band(curve([252, 666 + jit], [178, 692 - jit], [108, 678 - jit]), O.pants, 30, 4.5, "round");
  p.ell(95, 676 - jit, 24, 13, O.shoe, 6.5, 0, 360, 12);

  // Back flailing arm
  p.stroke(curve([348, 622 + jit], [318, 548 + jit], [278, 512 + jit]), 16, mix(skin, INK, 0.16));
  p.dot(278, 512 + jit, 14, skin);

  // Horizontal crisp white school uniform shirt torso (x = 240..388, y = 648)
  const body = ellPts(316, 648 + jit, 78, 50, 0, 360, 4, 42);
  p.shadedFill(body, O.shirt, mul(O.shirt, SH_CLOTH), light, 78, 0.4);
  p.clip(body, () => {
    p.band([[246, 590], [246, 710]], "#1e272e", 14, 2.2); // belt
    p.poly(rrect(322, 632 + jit, 348, 656 + jit, 4), O.badge, 2.5); // blue school pocket badge
  });
  p.inkRing(body, 9.2, thick);

  // Front panicked hand reaching down toward the puddle!
  p.stroke(curve([358, 676 + jit], [392, 742 + jit], [428, 772 + jit]), 16, mix(skin, INK, 0.16));
  p.dot(428, 772 + jit, 15, skin);

  // Big Expressive Bean Head on right side (x = 446, y = 626) facing camera/downward in sheer panic!
  const H = headBlob(3, 102, 1), W = 2 * H.a, u = W / 100;
  const hx = 446, hy = 626 + jit;
  const hp = blobPts(hx, hy, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawStudentHair(p, O, H, hx, hy, light, thick, 9.5, u, 1, { hairMode: "slickCool", wv });
  faceFront(p, hx, hy, W, "freezePanic", 1, 0, 0, false, skin, undefined, false);

  // Flying panic sweat droplets around head (strictly inside x < 575)!
  for (const [dx, dy, ang] of [[-46, -68, -30], [52, -62, 32], [68, -12, 15]]) {
    p.ell(hx + dx * u * 0.5, hy + dy * u * 0.5, 9, 5.5, "#74d4ff", 3.2, 0, 360, ang);
  }
};

/** Pose 2: Banana-Peel Legs Shooting Straight Up Into the Air (Scene 5 «រអិលបះជើងឡើងលើ»)! */
const drawBananaFeetUpHero = (p, O, opts = {}) => {
  const { wv = 0 } = opts;
  const light = rad(-120), thick = thickAngle(light), skin = O.skin;
  const kick = Math.sin(wv * 8) * 12;
  p.rot = null;

  // Cartoon slip motion arc under heels!
  p.arc(310, 620, 175, 130, 15, 155, 7, "#fff3a1");

  // BOTH navy-trousered legs shooting skyward at steep V-angle!
  p.band(curve([282, 650], [335, 515 - kick], [385, 385 - kick]), O.pants, 30, 4.5, "round");
  p.ell(394, 372 - kick, 26, 14, O.shoe, 6.5, 0, 360, -55);

  p.band(curve([312, 665], [392, 558 + kick], [462, 448 + kick]), O.pants, 30, 4.5, "round");
  p.ell(472, 436 + kick, 26, 14, O.shoe, 6.5, 0, 360, -38);

  // Tilted white uniform torso tipping backward at -58 deg
  const body = ellPts(256, 692, 74, 52, 0, 360, -35, 42);
  p.shadedFill(body, O.shirt, mul(O.shirt, SH_CLOTH), light, 74, 0.4);
  p.inkRing(body, 9.2, thick);

  // Wildly pinwheeling arms!
  p.stroke(curve([236, 656], [182, 575 + kick], [142, 518 + kick]), 16, mix(skin, INK, 0.16));
  p.dot(142, 518 + kick, 14, skin);
  p.stroke(curve([278, 725], [326, 795 - kick], [372, 832 - kick]), 16, mix(skin, INK, 0.16));
  p.dot(372, 832 - kick, 14, skin);

  // Shocked upside-tilted head at x = 186, y = 742
  const H = headBlob(3, 100, 1), W = 2 * H.a, u = W / 100;
  const hx = 186, hy = 742;
  const hp = blobPts(hx, hy, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, 9.5, thick);
  drawStudentHair(p, O, H, hx, hy, light, thick, 9.5, u, 1, { hairMode: "slickCool", wv });
  faceFront(p, hx, hy, W, "freezePanic", 1, 0, 0, false, skin, undefined, false);
};

/** Pose 3: Face-Planted Headfirst in the Mud Puddle with Legs Twitching Up («ធ្លាក់ផ្កាប់មុខចូលថ្លុកភក់ ផ្លូក!»)! */
const drawPuddleFaceplantHero = (p, O, opts = {}) => {
  const { wv = 0 } = opts;
  const light = rad(-120), thick = thickAngle(light), skin = O.skin;
  const tw = Math.sin(wv * 9) * 8;
  p.rot = null;

  // Mud puddle splash ring at y = 935
  p.ell(300, 938, 185, 34, MUD_MID, 8.5);

  // White shirt torso planted face-down into the mud (splattered brown!)
  const body = ellPts(300, 882, 78, 52, 0, 360, -8, 42);
  p.shadedFill(body, O.shirt, mul(O.shirt, SH_CLOTH), light, 78, 0.4);
  p.clip(body, () => {
    p.ell(275, 895, 36, 22, MUD_MID, 0);
    p.ell(332, 878, 28, 18, MUD_DARK, 0);
  });
  p.inkRing(body, 9.2, thick);

  // Splayed arms flat on muddy ground
  p.stroke(curve([242, 895], [178, 915], [132, 932]), 16, mix(skin, INK, 0.16));
  p.dot(132, 932, 14, MUD_MID);
  p.stroke(curve([358, 895], [422, 915], [468, 932]), 16, mix(skin, INK, 0.16));
  p.dot(468, 932, 14, MUD_MID);

  // Comical navy-trousered legs sticking up in the air twitching!
  p.band(curve([280, 845], [242, 745 + tw], [212, 668 + tw]), O.pants, 30, 4.5, "round");
  p.ell(204, 656 + tw, 25, 13, O.shoe, 6.5, 0, 360, 25);
  p.band(curve([322, 845], [362, 748 - tw], [392, 672 - tw]), O.pants, 30, 4.5, "round");
  p.ell(400, 660 - tw, 25, 13, O.shoe, 6.5, 0, 360, -25);
};

/** Main Cambodian High School Character Renderer */
export const khmerSchoolChar = (p, key, opts = {}) => {
  const O = typeof key === "string" ? SCHOOL_ROLES[key] : key;
  if (opts.mode === "horizontalFreeze") return drawHorizontalFreezeHero(p, O, opts);
  if (opts.mode === "bananaFeetUp") return drawBananaFeetUpHero(p, O, opts);
  if (opts.mode === "puddleFaceplant") return drawPuddleFaceplantHero(p, O, opts);

  const {
    expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3,
    L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, sprint = false, strut = false, wv = 0,
    hairMode = "normal", poppedCollar = false, coolShades = false,
    heartEyes = false, muddy = false, muddyTeethSparkle = false,
    holdBooks = false, holdComb = false, blushRed = false, sweat = false,
    laughShake = false,
  } = opts;

  const lid = lidOf(blink), skin = O.skin ?? SKIN, dir = facing || 1;
  const headR = O.isGirl ? 111 : 114;
  const H = headBlob(seed, headR, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.isGirl ? 1.04 : 1.08;
  const legsL = O.isGirl ? 1.30 : 1.34;
  const sole = 975;
  const laughBob = laughShake ? Math.abs(Math.sin(wv * 8.5)) * 0.06 * HH : 0;
  const runBounce = sprint ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.14 * HH
    : (strut ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.07 * HH
    : (step ? Math.abs(Math.sin(Math.PI * 2 * step)) * 0.045 * HH : 0));
  const torsoBot = sole - legsL * HH - bob * HH - runBounce + laughBob;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legSkinCol = mix(skin, INK, 0.20), pantsCol = O.pants || NAVY_UNIFORM, armCol = mix(skin, INK, 0.16);

  p.rot = null;

  // ---- 1. Legs & Cambodian School Trousers / Pleated Skirt ----
  for (const side of [-1, 1]) {
    const ph = step + (side > 0 ? 0.5 : 0);
    if (sprint) {
      const swing = Math.sin(Math.PI * 2 * ph);
      const hx = cx + side * 15 * u;
      const fx = cx + swing * 66 * u * dir;
      const fy = sole - 14 * u - Math.max(0, Math.cos(Math.PI * 2 * ph)) * 48 * u;
      p.band(curve([hx, hipY], [(hx + fx) / 2 + dir * 16 * u, (hipY + fy) / 2 - 8 * u], [fx, fy]), O.isGirl ? legSkinCol : pantsCol, O.isGirl ? 5.8 * u : 11.5 * u, O.isGirl ? 0 : 2.2 * u, "round");
      p.ell(fx + dir * 5 * u, fy, 12 * u, 6.5 * u, O.shoe, 3.0 * u, 0, 360, -dir * 18);
    } else {
      const amp = strut ? 28 : (step ? 20 : 0);
      const swing = amp ? Math.sin(Math.PI * 2 * ph) * amp * u * dir : 0;
      const up = amp ? Math.max(0, Math.sin(Math.PI * 2 * ph)) * (strut ? 26 : 18) : 0;
      const hx = cx + side * 16 * u, fx = cx + side * 19 * u + swing, fy = sole - 5 * u - up;
      if (O.isGirl) {
        p.stroke(curve([hx, hipY], [(hx + fx) / 2, (hipY + fy) / 2], [fx, fy]), 5.6 * u, legSkinCol);
        // White ankle socks + dark school Mary-Jane shoes!
        p.stroke([[fx, fy - 16 * u], [fx, fy]], 6.4 * u, "#ffffff");
      } else {
        p.band(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), pantsCol, 11.8 * u, 2.3 * u, "round");
      }
      p.ell(fx + dir * 4 * u, fy, 12 * u, 6.2 * u, muddy && !O.isGirl ? MUD_MID : O.shoe, 3.0 * u);
    }
  }

  // ---- 2. Upper Body Lean, Back Hair, Crisp White Uniform Shirt & Navy Skirt/Belt ----
  const lean = (sprint ? dir * 15 : 0) + (strut ? -dir * 6 : 0) + (laughShake ? Math.sin(wv * 7) * 7 : 0);
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt + lean), [cx, hipY]);
  const Ah = tilt + lean + headTilt;

  // Draw long back hair behind torso & shoulders first
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  drawStudentHair(p, O, H, cx, hc, light, thick, ow, u, facing, { hairMode, wv, behindOnly: true });

  p.rot = (tilt + lean) ? [rad(tilt + lean), cx, hipY] : null;
  const T = {
    a: (0.40 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.24 * HH)),
    nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7,
  };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.86 * T.a, chin + 0.12 * HH];

  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "run": {
        const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
        return { pts: [s, [X(16), s[1] + 0.26 * HH], [tcx + sw * 44 * u * dir, s[1] + (0.10 - sw * 0.22) * HH]], front: side * dir > 0 };
      }
      case "hideFace": // Hiding burning-red face in both hands while sprinting to restroom!
        return { pts: [s, [X(20), s[1] - 0.10 * HH], [tcx + side * 14 * u + dir * 10 * u, hc + 6 * u]], front: true };
      case "slickHair": // Slicking hair back smoothly with comb/hand («ប្រញាប់សិតសក់»)!
        return { pts: [s, [X(28), s[1] - 0.28 * HH], [tcx + dir * 10 * u, hc - 0.72 * H.b + Math.sin(wv * 6) * 4 * u]], front: true };
      case "fingerGun": // Movie-star finger gun pointing coolly toward Crush!
        return { pts: [s, [tcx + dir * 28 * u, s[1] + 0.10 * HH], [tcx + dir * 64 * u, s[1] - 0.04 * HH]], front: true };
      case "popCollar": // Grabbing & popping white shirt collar («សារ៉េកអាវស»)!
        return { pts: [s, [X(22), s[1] + 0.06 * HH], [tcx + side * 20 * u, chin + 0.06 * HH]], front: true };
      case "coolPocket": // Hand tucked casually into navy trouser pocket while strutting!
        return { pts: [s, [X(18), s[1] + 0.28 * HH], [tcx + side * 0.76 * T.a, torsoBot - 0.12 * HH]], front: true };
      case "coverMouth": // Crush covering mouth in huge shock («បើកភ្នែកធំៗ»)!
        return { pts: [s, [X(14), s[1] + 0.12 * HH], [tcx + side * 8 * u + dir * 8 * u, hc + 20 * u]], front: true };
      case "pointLaugh": // Classmates pointing & laughing hysterically!
        return { pts: [s, [tcx + dir * 26 * u, s[1] + 0.04 * HH], [tcx + dir * 62 * u, s[1] + 0.08 * HH + Math.sin(wv * 8) * 5 * u]], front: true };
      case "bellyHold": // Holding stomach while laughing!
        return { pts: [s, [X(18), s[1] + 0.30 * HH], [tcx + side * 10 * u, torsoBot - 0.28 * HH]], front: true };
      case "thumbsUp": // Fake-cool stiff thumbs-up («អត់អីទេ ខ្ញុំគ្រាន់តែចង់ពិនិត្យមើលដីបន្តិច!»)!
        return { pts: [s, [X(24), s[1] + 0.08 * HH], [X(46), s[1] - 0.16 * HH]], front: true };
      case "inspectGround": // Pointing downward at the ground soil!
        return { pts: [s, [X(20), s[1] + 0.28 * HH], [X(32), torsoBot + 0.18 * HH]], front: true };
      case "books":
        return { pts: [s, [X(14), s[1] + 0.32 * HH], [tcx + side * 12 * u + dir * 10 * u, torsoBot - 0.36 * HH]], front: true };
      case "wave":
        return { pts: [s, [X(18), s[1] - 0.22 * HH], [X(34 + 10 * Math.sin(wv * 4)), s[1] - 0.64 * HH]], front: true };
      case "hip":
        return { pts: [s, [X(22), s[1] + 0.30 * HH], [tcx + side * T.a * 0.90, torsoBot - 0.24 * HH]], front: false };
      default: {
        const sw = (strut || step) ? Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5))) * (strut ? 18 : 10) * u : 0;
        return { pts: [s, [X(5), s[1] + 0.45 * HH], [X(4) + sw, chin + 1.00 * HH]], front: false };
      }
    }
  };

  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a, poseName) => {
    // Crisp white short uniform sleeve over upper arm!
    const sleeveEnd = lerp2(a.pts[0], a.pts[1], 0.58);
    p.band([a.pts[0], sleeveEnd], WHITE_SHIRT, 11.5 * u, 2.2 * u, "round");
    p.stroke(curve(sleeveEnd, a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx_, hy_] = a.pts[2];
    p.dot(hx_, hy_, 5.8 * u, muddy ? MUD_MID : skin);
    p.ell(hx_, hy_, 5.8 * u, 5.8 * u, null, 2.2 * u);
    if (poseName === "thumbsUp") {
      // Clear upright cartoon thumb!
      p.band([[hx_, hy_ - 2 * u], [hx_, hy_ - 15 * u]], skin, 5.2 * u, 2.0 * u, "round");
    } else if (poseName === "fingerGun") {
      p.band([[hx_, hy_], [hx_ + dir * 16 * u, hy_ - 2 * u]], skin, 4.8 * u, 1.8 * u, "round");
      p.band([[hx_, hy_], [hx_ + 2 * u, hy_ - 12 * u]], skin, 4.5 * u, 1.8 * u, "round");
    }
  };
  for (let i = 0; i < 2; i++) if (!arms[i].front) drawArm(arms[i], i === 0 ? L : R);

  // Pleated Cambodian Navy-Blue High School Skirt (Girls) or Navy Trouser Waist + Belt (Boys)
  if (O.isGirl) {
    const skBot = sole - 34 * u;
    const sk = [
      [tcx - 0.90 * T.a, torsoBot - 0.22 * HH],
      [tcx + 0.90 * T.a, torsoBot - 0.22 * HH],
      [tcx + 1.18 * T.a, skBot],
      [tcx - 1.18 * T.a, skBot],
    ];
    p.gradFill(sk, O.skirt, mul(O.skirt, SH_CLOTH), light);
    p.clip(sk, () => {
      for (const px_ of [-18, -6, 6, 18]) {
        p.stroke([[tcx + px_ * u, torsoBot - 0.16 * HH], [tcx + px_ * 1.25 * u, skBot]], 2.2 * u, "rgba(10,18,34,0.55)");
      }
    });
    p.inkRing(sk, ow * 0.88, thick);
  } else {
    const hipBox = [
      [tcx - 0.92 * T.a, torsoBot - 0.20 * HH], [tcx + 0.92 * T.a, torsoBot - 0.20 * HH],
      [tcx + 0.96 * T.a, torsoBot + 0.24 * HH], [tcx - 0.96 * T.a, torsoBot + 0.24 * HH],
    ];
    p.gradFill(hipBox, pantsCol, mul(pantsCol, SH_CLOTH), light);
    p.inkRing(hipBox, ow * 0.85, thick);
  }

  // Crisp White Cambodian Uniform Shirt + Collar + Blue School Badge + Optional Mud Splatters!
  p.gradFill(tp, O.shirt, "#dce6f2", light);
  p.clip(tp, () => {
    // Button placket down center
    p.stroke([[tcx + 3 * u * facing, chin + 0.14 * HH], [tcx + 3 * u * facing, torsoBot]], 2.4 * u, "#b8c7d9");
    // Blue Cambodian school pocket badge on left chest
    const bx = tcx + 14 * u, by = chin + 0.34 * HH;
    p.poly(rrect(bx - 7 * u, by - 8 * u, bx + 7 * u, by + 8 * u, 2 * u), O.badge || "#1e6bd6", 2.0 * u);
    p.dot(bx, by, 2.8 * u, "#ffd23f");
    if (!O.isGirl) {
      // Dark leather school belt + silver buckle
      p.band([[tcx - 1.2 * T.a, torsoBot - 0.12 * HH], [tcx + 1.2 * T.a, torsoBot - 0.12 * HH]], "#1e242b", 9.5 * u, 1.8 * u);
      p.poly(rrect(tcx - 6 * u, torsoBot - 0.12 * HH - 5 * u, tcx + 6 * u, torsoBot - 0.12 * HH + 5 * u, 1.5 * u), "#dfe6ed", 2.0 * u);
    }
    if (muddy) {
      // Heavy cartoon chocolate-brown mud splatters all over the white uniform shirt!
      p.ell(tcx - 12 * u, chin + 0.42 * HH, 22 * u, 16 * u, MUD_MID, 0, 0, 360, 18);
      p.ell(tcx + 15 * u, chin + 0.68 * HH, 19 * u, 14 * u, MUD_DARK, 0, 0, 360, -22);
      p.ell(tcx - 4 * u, chin + 0.85 * HH, 15 * u, 10 * u, MUD_MID, 0);
      p.dot(tcx + 22 * u, chin + 0.32 * HH, 6.5 * u, MUD_DARK);
    }
  });
  p.inkRing(tp, ow, thick);

  // Crisp White Uniform Collar (or Dramatic High Popped Collar in Movie-Star Mode!)
  if (poppedCollar) {
    p.poly([
      [tcx - 28 * u, chin + 12 * u], [tcx - 38 * u, chin - 18 * u], [tcx - 10 * u, chin + 8 * u],
    ], WHITE_SHIRT, 3.0 * u);
    p.poly([
      [tcx + 28 * u, chin + 12 * u], [tcx + 38 * u, chin - 18 * u], [tcx + 10 * u, chin + 8 * u],
    ], WHITE_SHIRT, 3.0 * u);
  } else {
    p.poly([[tcx - 18 * u, chin + 4 * u], [tcx - 8 * u, chin + 18 * u], [tcx, chin + 8 * u]], WHITE_SHIRT, 2.5 * u);
    p.poly([[tcx + 18 * u, chin + 4 * u], [tcx + 8 * u, chin + 18 * u], [tcx, chin + 8 * u]], WHITE_SHIRT, 2.5 * u);
  }

  for (let i = 0; i < 2; i++) if (arms[i].front) drawArm(arms[i], i === 0 ? L : R);

  // Held School Notebooks (Crush & Classmates) or Pocket Comb (Movie-Star Cut 1)
  if (holdBooks) {
    const bx = tcx + dir * 14 * u, by = torsoBot - 0.42 * HH;
    p.poly(rrect(bx - 22 * u, by - 24 * u, bx + 22 * u, by + 18 * u, 4 * u), "#ff6b8b", 3.0 * u);
    p.poly(rrect(bx - 17 * u, by - 19 * u, bx + 25 * u, by + 14 * u, 3 * u), "#4dabf7", 2.6 * u);
  }
  if (holdComb) {
    const [chx, chy] = arms[1].pts[2];
    p.poly(rrect(chx - 18 * u, chy - 8 * u, chx + 18 * u, chy + 2 * u, 2 * u), "#ff4757", 2.4 * u);
  }

  // ---- 3. Bean Head, Face, Heart-Eyes, Cool Shades & Muddy Sparkle Grin! ----
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (blushRed) {
    p.clip(hp, () => {
      p.ell(cx, hc + 8 * u, 42 * u, 26 * u, "rgba(255,58,78,0.48)", 0);
    });
  }
  if (muddy) {
    p.clip(hp, () => {
      p.ell(cx - 24 * u, hc + 14 * u, 16 * u, 11 * u, MUD_MID, 0, 0, 360, -15);
      p.ell(cx + 26 * u, hc - 6 * u, 13 * u, 9 * u, MUD_DARK, 0, 0, 360, 20);
      p.ell(cx + 6 * u, hc + 32 * u, 14 * u, 8 * u, MUD_MID, 0);
    });
  }
  p.inkRing(hp, ow, thick);
  drawStudentHair(p, O, H, cx, hc, light, thick, ow, u, facing, { hairMode, wv, behindOnly: false });

  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, undefined, false);

  // Dripping mud drop hanging off nose/chin in Scene 6 & 7!
  if (muddy) {
    const dropY = ((wv * 16) % 18) * u;
    p.ell(cx + 8 * u * facing, hc + 10 * u, 5.5 * u, 4.5 * u, MUD_DARK, 1.8 * u);
    p.ell(cx + 8 * u * facing, hc + 22 * u + dropY, 4.2 * u, 6.8 * u, MUD_MID, 1.8 * u);
  }

  // Movie-Star Glossy Sunglasses (Scene 3 Cut 2-3)!
  if (coolShades) {
    const fx = cx + 7 * u * facing, ey = hc - 2 * u;
    p.poly(rrect(fx - 26 * u, ey - 8 * u, fx - 3 * u, ey + 9 * u, 3 * u), "#11161d", 2.6 * u);
    p.poly(rrect(fx + 3 * u, ey - 8 * u, fx + 26 * u, ey + 9 * u, 3 * u), "#11161d", 2.6 * u);
    p.stroke([[fx - 3 * u, ey - 2 * u], [fx + 3 * u, ey - 2 * u]], 3.0 * u, INK);
    p.stroke([[fx - 21 * u, ey - 4 * u], [fx - 13 * u, ey + 4 * u]], 2.4 * u, "#ffffff");
    p.stroke([[fx + 8 * u, ey - 4 * u], [fx + 16 * u, ey + 4 * u]], 2.4 * u, "#ffffff");
  }

  // Giant Pulsing Pink Heart-Eyes (Scene 4 Tunnel Vision Mistake)!
  if (heartEyes) {
    const fx = cx + 7 * u * facing, ey = hc - 2 * u;
    const pulse = 1.0 + 0.16 * Math.sin(wv * 8.0);
    // Cover default eyes with skin patch so big glowing hearts pop cleanly!
    p.poly(rrect(fx - 26 * u, ey - 12 * u, fx + 26 * u, ey + 12 * u, 4 * u), skin, 0);
    drawHeartShape(p, fx - 13.5 * u, ey, 13.5 * u * pulse, HEART_PINK, 2.6 * u);
    drawHeartShape(p, fx + 13.5 * u, ey, 13.5 * u * pulse, HEART_PINK, 2.6 * u);
  }

  // Mud-Covered Teeth with Blinding Sparkle Star («ញញឹមទាំងភក់ពេញធ្មេញ» — Scene 7)!
  if (muddyTeethSparkle) {
    const mx = cx + 8 * u * facing, my = hc + 19 * u;
    p.poly(rrect(mx - 17 * u, my - 7 * u, mx + 17 * u, my + 8 * u, 5 * u), "#ffffff", 3.2 * u);
    // Funny brown mud patches on teeth + one gleaming golden-white tooth sparkle!
    p.poly(rrect(mx - 11 * u, my - 6 * u, mx - 4 * u, my + 2 * u, 1 * u), MUD_DARK, 0);
    p.poly(rrect(mx + 3 * u, my + 0 * u, mx + 10 * u, my + 7 * u, 1 * u), MUD_MID, 0);
    p.stroke([[mx - 16 * u, my], [mx + 16 * u, my]], 1.8 * u, INK);
    const spR = (9 + 3 * Math.sin(wv * 9)) * u;
    drawSparkleStar(p, mx + 15 * u, my - 5 * u, spR, GOLD_STAR, 2.0 * u);
  }

  if (sweat) {
    const sx = cx - dir * 38 * u, sy = hc - 14 * u;
    p.poly([[sx, sy - 14 * u], [sx + 8 * u, sy + 4 * u], [sx, sy + 11 * u], [sx - 8 * u, sy + 4 * u]], "#74d4ff", 2.4 * u);
  }
  p.rot = null;
};

/** Rollo-Style 2D Visual Comedy & FX Cards (0..600 x 0..1000 canvas, 100% crisp!) */
export const drawSchoolFx = (p, kind = "shoujoHearts", k = 0) => {
  const light = rad(-120), thick = thickAngle(light);
  p.rot = null;

  if (kind === "vhsRewindCard") {
    // Crisp VHS Rewind Double-Chevrons + Tape Reels («ត្រឡប់មកមួយនាទីមុន...»)
    const bg = rrect(115, 365, 485, 595, 30);
    p.shadedFill(bg, "#1e272e", "#0f1418", light, 185, 0.4);
    p.inkRing(bg, 10.5, thick);
    for (const cx_ of [235, 345]) {
      p.poly([[cx_ + 35, 420], [cx_ - 35, 480], [cx_ + 35, 540]], "#00e5ff", 7.5);
    }
    for (const ly of [395, 565]) p.stroke([[145, ly], [455, ly]], 5, "rgba(255,255,255,0.45)");
  } else if (kind === "shoujoHearts") {
    // Sparkling Anime Hearts & 4-Point Stars Surrounding Crush!
    const bob1 = Math.sin(k * 5) * 18, bob2 = Math.cos(k * 4.5) * 16;
    drawHeartShape(p, 155, 355 + bob1, 42, "#ff4d8d", 7);
    drawHeartShape(p, 452, 325 + bob2, 48, "#ff2e74", 7.5);
    drawHeartShape(p, 475, 520 - bob1, 32, "#ff85b3", 6);
    drawSparkleStar(p, 145, 505 - bob2, 34, GOLD_STAR, 5.5);
    drawSparkleStar(p, 305, 245 + bob1 * 0.6, 38, "#ffffff", 5.5);
  } else if (kind === "movieStarBurst") {
    // Radiant Golden Movie-Star Clapper / Crown Sparkle Aura («ធ្វើឬកឡូយដូចតួកុន!»)
    const rays = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + k * 0.25;
      const r = i % 2 === 0 ? 215 : 138;
      rays.push([300 + Math.cos(a) * r, 475 + Math.sin(a) * r]);
    }
    p.poly(rays, "#ffe55c", 9.5);
    drawSparkleStar(p, 195, 365, 38, "#ffffff", 5.5);
    drawSparkleStar(p, 415, 385, 42, "#ffffff", 5.5);
  } else if (kind === "giantGroundHearts") {
    // Scene 4 Tunnel-Vision Gag: Giant Glowing Pink Hearts Blocking the Ground Ahead!
    const pulse = 1.0 + 0.08 * Math.sin(k * 6);
    drawHeartShape(p, 195, 525, 108 * pulse, "#ff5c97", 9.5);
    drawHeartShape(p, 405, 535, 102 * pulse, "#ff3377", 9.5);
    drawHeartShape(p, 300, 445, 124 * pulse, "#ff1f6b", 10.5);
    drawSparkleStar(p, 300, 395, 28, "#fff0f6", 4.5);
  } else if (kind === "mudSplashWave") {
    // Massive Cartoon Chocolate-Brown Mud Wave Crown («លាន់ឮសូរ ផ្លូក!»)!
    const rise = Math.min(1, k * 1.4);
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const x = 75 + (450 * i) / 14;
      const spike = i % 2 === 0 ? 235 * rise : 115 * rise;
      pts.push([x, 780 - spike]);
    }
    pts.push([535, 835], [65, 835]);
    p.shadedFill(pts, MUD_MID, MUD_DARK, light, 230, 0.4);
    p.inkRing(pts, 10.5, thick);
    // Flying mud droplets!
    for (const [dx, dy, r_] of [[-175, -265, 24], [-95, -325, 28], [15, -345, 26], [115, -315, 30], [185, -255, 22]]) {
      p.ell(300 + dx * rise, 740 + dy * rise, r_, r_ * 1.25, MUD_DARK, 7);
    }
  } else if (kind === "laughShockwave") {
    // Explosive Comic Laughter Burst («ផ្ទុះសំណើចលាន់ឮពេញអគារ!»)!
    const s = 0.92 + 0.10 * Math.sin(k * 9);
    const spikes = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + k * 0.2;
      const r = (i % 2 === 0 ? 195 : 125) * s;
      spikes.push([300 + Math.cos(a) * r, 465 + Math.sin(a) * r]);
    }
    p.shadedFill(spikes, "#ffe14d", "#ff6b2b", light, 195, 0.4);
    p.inkRing(spikes, 10, thick);
    // Big laughing cartoon face icon in center (universal visual, zero micro-text!)
    p.arc(262, 435, 22, 16, 200, 340, 8.5, INK);
    p.arc(338, 435, 22, 16, 200, 340, 8.5, INK);
    dmouth(p, 300, 472, 56, 40, 4.2, true);
    p.ell(222, 448, 14, 9, "#6ce0ff", 4.5, 0, 360, -28);
    p.ell(378, 448, 14, 9, "#6ce0ff", 4.5, 0, 360, 28);
  } else if (kind === "soilInspectorBadge") {
    // Scene 7 Excuse Gag: Magnifying Glass Inspecting Mud Clod + Green Checkmark («ពិនិត្យមើលដីបន្តិច!»)!
    const ring = ellPts(285, 455, 138, 138, 0, 360, 0, 42);
    p.shadedFill(ring, "#e8f7ff", "#b8e1ff", light, 138, 0.4);
    p.inkRing(ring, 14, thick);
    // Magnifier handle
    p.band([[382, 552], [468, 638]], "#8c5226", 32, 6.5, "round");
    // Cute mud mound + sprout inside lens
    p.ell(285, 505, 72, 38, MUD_MID, 7.5);
    p.stroke([[285, 472], [285, 432]], 7, "#2b8a3e");
    p.ell(266, 428, 20, 11, "#51cf66", 5, 0, 360, -25);
    p.ell(304, 428, 20, 11, "#51cf66", 5, 0, 360, 25);
    // Green OK badge on corner
    p.ell(395, 365, 46, 46, "#2ecc71", 8);
    p.band([[374, 365], [390, 382], [418, 348]], "#ffffff", 11, 2.5, "round");
  } else if (kind === "likeButtonCTA") {
    // Vibrant Blue Thumbs-Up Like CTA («ចុចឡៃមួយមក...»)!
    const s = 0.95 + 0.06 * Math.sin(k * 7);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + k * 0.3;
      p.band([[300 + Math.cos(a) * 145, 475 + Math.sin(a) * 145], [300 + Math.cos(a) * 195 * s, 475 + Math.sin(a) * 195 * s]], GOLD_STAR, 13, 3, "round");
    }
    const card = rrect(155, 355, 445, 595, 42);
    p.shadedFill(card, "#2986f5", "#1550a3", light, 145, 0.4);
    p.inkRing(card, 11, thick);
    p.poly(rrect(205, 462, 252, 548, 10), "#ffffff", 7.5);
    p.poly([[256, 462], [292, 392], [322, 398], [314, 450], [388, 450], [376, 548], [256, 548]], "#ffffff", 7.5);
  }
};

export const fxDust = (p, k, col = "#f2cfa8") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 75 + 145 * k;
    p.ell(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.55, 95 + 45 * k, 78 + 38 * k, col, 9.5);
  }
  p.ell(300, 540, 135 + 85 * k, 105 + 60 * k, col, 0);
  g.restore();
};
