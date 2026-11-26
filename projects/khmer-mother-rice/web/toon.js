// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
                                   
const SH_SKIN     = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH     = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT     = [0.62, 0.62, 0.7];

                                              
                      
                                                                                                                             
                                                                                                                                
                
  
                           

const rad = (d        ) => (d * Math.PI) / 180;
const clamp = (x        , a        , b        ) => Math.max(a, Math.min(b, x));
export const mul = (c        , m    ) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v        , k        ) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c        , k        ) => mul(c, [k, k, k]);
export const mix = (a        , b        , t        ) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s        ) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed        , k        ) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts      , a        , cx        , cy        )       =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q    , a        , c    )     => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a    , b    , t        )     => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a    , k    , b    , n = 10)       => {
  const c     = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out       = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN         = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER         = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID         = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT         = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra                  = {})         => {
  const o         = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0)         => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o         = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g                          ;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot                  = null;
  constructor(g                          ) { this.g = g; }
  P(x        , y        )     {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts      , close         ) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts      , fill               , ol         ) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx        , cy        , rx        , ry        , fill               , ol         , a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts      , fill        , w        , ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts      , w        , fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx        , cy        , rx        , ry        , a0        , a1        , w        , fill = INK) {
    const pts       = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx        , cy        , r        , fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts      , fn            ) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts      , base        , shadow        , light        , R        , shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts      , base        , shadow        , light        , flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts      , w0        , thick        , k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out       = [], inn       = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r      ) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts      , fill        , w        , rim        , cap                = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx        , cy        , rx        , ry        , a0 = 0, a1 = 360, rot = 0, n = 48)       => {
  const r = rad(rot), pts       = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0        , y0        , x1        , y1        , r        , n = 8)       => {
  const pts       = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p     , a    , b    , wa        , wb        , col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
                                                                                                                                             

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx        , cy        , B      , n = 72)       => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts       = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed        , a = 118, facing = 0)       => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light        ) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
                                                                                                                                
                                                 
                                                                                                               
                                                                                                                            
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE                                                                             = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
};
const halfLid = (k      )       => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k      , lid        )       =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b                              ) => (b === true ? 1 : Number(b) || 0);

const eye = (p     , kind      , x        , ey        , u        , side        , look        , skin        ) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s       = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p     , mx        , y        , rx        , ry        , u        , tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p     , kind        , mx        , my        , u        , k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s       = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p     , cx        , cy        , W        , expr      , facing        , look        , lid        , brim         ,
  skin        , moustache         , stout = false) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  mouth(p, F.mouth, mx, my, u);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p     , hx        , hy        , W        , expr      , lid        , brim         , skin        , moustache         , stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p     , o        , H      , cx        , hc        , light        , thick        , ow        , side         ) => {
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p     , o        , hp      , H      , cx        , hc        , light        , seed        , facing        , side         ) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts      ) => rotPts(pts, a, cx, hc);
  const sag = (yb        , wb        )       => {
    const base       = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x        , y        ) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03]      );
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap  : o.hair ;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
                                
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
                                                                    

const BUILD                                                                        = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

                         
                                                                                                                                            
                                                               
                                                                                      
                                                     
  

const footStroke = (p     , a    , b    , w        , col        ) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

export const bodyFront = (p     , o        , opts           ) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h     = [300 + side * 15 * u, hipY], k     = [300 + side * 36 * u, hipY + 0.2 * HH], f     = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs                 = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]]         ) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k     = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const T       = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side        )     => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side        , fwd        )               => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0     = [300 + 47 * u, torsoBot + 0.12 * HH], R1     = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
                                                   
  const arms        = [];
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a     ) => { p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0     = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D       = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress , mul(o.dress , SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw       = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt , 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    p.inkRing(tp, ow, thick);
  }
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts      ) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

                        
                                                                                                                                    
                                                                                                                         
                                                 
                                                                                                     
                          
  

/** two-bone leg, knee bending forward (+x) */
const ik = (hip    , ank    , l1        , l2        )     => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p     , o        , opts          ) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H       = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
                                                        
  const legs         = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph        ) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]]         )
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]]         ) {
      const knee     = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip     = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u]      ) : ik(hip, L.ank, l1, l2);
    const hp0     = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T       = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S     = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang        )               => {
    const e     = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0     = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1     = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near              , far                     ;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN     = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg     = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt , 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p     , o        , kick        , expr      , light = DEF_LIGHT, blink         = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p     , kind        , col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p     , t        , col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p     , t        ) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts       = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p     , t        ) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p     , t        ) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts       = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p     , t        ) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p     , t        ) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p     ) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]]                                          ) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p     , seed        ) => {
  const blobs                             = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]]         ) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p     ) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p     ) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]]         ) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

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
