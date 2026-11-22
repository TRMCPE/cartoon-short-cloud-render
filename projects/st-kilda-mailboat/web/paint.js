// Canvas2D painted textures for "St Kilda: The Ocean Post Office" (North Atlantic, Scotland).
// All deterministic & CPU-safe ({ willReadFrequently: true } on every 2D canvas).
import * as THREE from './lib/three.module.js';

export const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

const cv = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })];
};

export const tex = (c, rx = 1, ry = 1, clamp = false) => {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Dramatic dark Scottish sea-cliff granite & basalt rock */
export function slateCliff(seed = 1) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#474f5c';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 75; i++) {
    const x = r() * 512, y = r() * 512, w = 28 + r() * 96, h = 16 + r() * 48;
    g.fillStyle = hsl(212 + r() * 18, 13, 22 + r() * 18, 0.86);
    g.beginPath();
    g.roundRect(x, y, w, h, 4);
    g.fill();
  }
  // Vertical cliff strata cracks
  for (let i = 0; i < 55; i++) {
    g.strokeStyle = `rgba(18,22,30,${0.42 + r() * 0.42})`;
    g.lineWidth = 2 + r() * 2.5;
    g.beginPath();
    let x = r() * 512, y = r() * 512;
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (r() - 0.5) * 32;
      y += 18 + r() * 28;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // Lichen & moss flecks
  for (let i = 0; i < 160; i++) {
    g.fillStyle = hsl(95 + r() * 35, 24, 38 + r() * 16, 0.34);
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 3 + r() * 9, 2 + r() * 5, r() * 3, 0, 7);
    g.fill();
  }
  return c;
}

/** Windswept emerald-moss & purple-heather Hebridean turf */
export function hebrideanGrass(seed = 2) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4e7d42';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = hsl(88 + r() * 32, 34, 28 + r() * 18, 0.55);
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 22 + r() * 54, 14 + r() * 32, r() * 3, 0, 7);
    g.fill();
  }
  // Heather & peat patches
  for (let i = 0; i < 34; i++) {
    g.fillStyle = hsl(286 + r() * 22, 28, 42 + r() * 10, 0.42);
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 10 + r() * 26, 8 + r() * 18, r() * 3, 0, 7);
    g.fill();
  }
  for (let i = 0; i < 950; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(84 + r() * 30, 40, 26 + r() * 24, 0.8);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 4 + (r() - 0.3) * 5, y - 6 - r() * 9);
    g.stroke();
  }
  return c;
}

/** Authentic St Kilda dry-stone croft cottage wall */
export function stoneWall(seed = 3) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#363940';
  g.fillRect(0, 0, 512, 512);
  const rows = 10, rh = 512 / rows;
  for (let row = 0; row < rows; row++) {
    let x = (row % 2) * -32;
    while (x < 512) {
      const w = 52 + r() * 56;
      const L = 44 + r() * 18, H = 32 + r() * 18;
      g.fillStyle = hsl(H, 8 + r() * 8, L);
      g.beginPath();
      g.roundRect(x + 3, row * rh + 3, w - 6, rh - 6, 8);
      g.fill();
      g.strokeStyle = 'rgba(20,22,28,0.65)';
      g.lineWidth = 3;
      g.stroke();
      x += w;
    }
  }
  return c;
}

/** Dark Hebridean slate roof tiles */
export function slateRoof(seed = 4) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#2e3540';
  g.fillRect(0, 0, 512, 512);
  const rows = 12, cols = 8, rh = 512 / rows, cw = 512 / cols;
  for (let row = 0; row < rows; row++) {
    const off = (row % 2) * (cw * 0.5);
    for (let col = -1; col <= cols; col++) {
      g.fillStyle = hsl(212 + r() * 12, 16, 22 + r() * 10);
      g.fillRect(col * cw + off + 2, row * rh + 2, cw - 4, rh - 3);
      g.fillStyle = 'rgba(12,15,22,0.55)';
      g.fillRect(col * cw + off, row * rh + rh - 3, cw, 3);
    }
  }
  return c;
}

/** Warm rustic Scottish oak workbench planks */
export function woodBench(seed = 5) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 7, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 40 + r() * 11, H = 26 + r() * 6;
    g.fillStyle = hsl(H, 42, L);
    g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = hsl(H - 3, 44, L - 10 - r() * 8, 0.45);
      g.lineWidth = 1.6;
      const x = i * w + 5 + r() * (w - 10);
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + 4, 170, x - 4, 340, x, 512);
      g.stroke();
    }
    g.fillStyle = 'rgba(28,16,10,0.85)';
    g.fillRect(i * w, 0, 3.5, 512);
  }
  return c;
}

/** Carved wooden St Kilda mailboat texture with hand-carved grain & burned lettering */
export function boatWood(labeled = false) {
  const [c, g] = cv(512, 512), r = rng(19);
  g.fillStyle = '#b98249';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 65; i++) {
    g.strokeStyle = hsl(28 + r() * 7, 46, 32 + r() * 18, 0.45);
    g.lineWidth = 2 + r() * 4;
    const y = r() * 512;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(170, y + (r() - 0.5) * 24, 340, y + (r() - 0.5) * 24, 512, y);
    g.stroke();
  }
  // Subtle whittled chisel facets
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(255,232,190,${0.08 + r() * 0.12})`;
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 18 + r() * 34, 6 + r() * 12, (r() - 0.5) * 0.4, 0, 7);
    g.fill();
  }
  if (labeled) {
    g.strokeStyle = '#3b2412';
    g.lineWidth = 10;
    g.strokeRect(26, 26, 460, 460);
    g.fillStyle = '#2d1a0d';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '900 72px DejaVu Serif, Georgia, serif';
    g.fillText('ST KILDA', 256, 175);
    g.font = '900 56px DejaVu Sans, Arial Black, sans-serif';
    g.fillText('MAILBOAT', 256, 265);
    g.fillStyle = '#9e2622';
    g.font = 'bold 38px DejaVu Sans, sans-serif';
    g.fillText('• PLEASE OPEN •', 256, 355);
  }
  return c;
}

/** Buoyant cream/parchment inflated sheep's bladder float texture */
export function bladderTex() {
  const [c, g] = cv(512, 512), r = rng(27);
  const gr = g.createRadialGradient(200, 180, 30, 256, 256, 310);
  gr.addColorStop(0, '#fffaf0');
  gr.addColorStop(0.55, '#f2dfc0');
  gr.addColorStop(1, '#d4b487');
  g.fillStyle = gr;
  g.fillRect(0, 0, 512, 512);
  // Subtle organic taut-skin grain & glossy highlight streaks
  for (let i = 0; i < 36; i++) {
    g.strokeStyle = `rgba(176,136,88,${0.12 + r() * 0.14})`;
    g.lineWidth = 2 + r() * 3;
    g.beginPath();
    const x = r() * 512, y = r() * 512;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (r() - 0.5) * 90, y + (r() - 0.5) * 90, x + (r() - 0.5) * 140, y + (r() - 0.5) * 140);
    g.stroke();
  }
  // Crisp highlight patch
  g.fillStyle = 'rgba(255,255,255,0.48)';
  g.beginPath();
  g.ellipse(175, 165, 58, 28, -0.45, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** SOS Parchment message texture */
export function scrollTex() {
  const [c, g] = cv(512, 320);
  g.fillStyle = '#faf0d7';
  g.fillRect(0, 0, 512, 320);
  g.strokeStyle = '#6e5236';
  g.lineWidth = 8;
  g.strokeRect(14, 14, 484, 292);
  g.fillStyle = '#2b2018';
  g.textAlign = 'center';
  g.font = '900 52px DejaVu Serif, Georgia, serif';
  g.fillText('HELP NEEDED!', 256, 95);
  g.font = 'bold 34px DejaVu Serif, Georgia, serif';
  g.fillText('ST KILDA ISLAND', 256, 162);
  g.fillText('FOOD & MEDICINE', 256, 218);
  // Red wax seal
  g.fillStyle = '#c42b2b';
  g.beginPath();
  g.arc(420, 245, 34, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#6e1616';
  g.lineWidth = 5;
  g.stroke();
  return c;
}

/** Vintage North Atlantic Nautical Chart: ST KILDA -> MAINLAND SCOTLAND -> NORWAY */
export function atlanticMapTex() {
  const [c, g] = cv(1024, 1024);
  // Deep vintage nautical blue-teal ocean
  const gr = g.createRadialGradient(440, 560, 40, 512, 512, 720);
  gr.addColorStop(0, '#5ea1bd');
  gr.addColorStop(1, '#366f8f');
  g.fillStyle = gr;
  g.fillRect(0, 0, 1024, 1024);

  // Subtle nautical rhumb lines & grid
  g.strokeStyle = 'rgba(245,238,215,0.22)';
  g.lineWidth = 2;
  for (let i = 64; i < 1024; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
  }
  // Compass rose in bottom-left
  const cx = 185, cy = 830;
  g.strokeStyle = 'rgba(246,236,204,0.65)';
  g.lineWidth = 4;
  g.beginPath(); g.arc(cx, cy, 78, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, 62, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, r = k % 2 ? 48 : 88;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke();
  }
  g.fillStyle = '#faf0d0'; g.font = '900 32px DejaVu Serif, serif'; g.textAlign = 'center';
  g.fillText('N', cx, cy - 92);

  const land = (pts, col = '#c8bd86') => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = col;
    g.fill();
    g.strokeStyle = '#2d241e';
    g.lineWidth = 6;
    g.stroke();
  };

  // Outer Hebrides small chain (between St Kilda at x=255,y=625 and Scotland at x=470..640)
  land([[355, 575], [385, 555], [398, 610], [372, 650], [348, 625]], '#9ab572');
  land([[362, 668], [388, 665], [382, 712], [358, 706]], '#9ab572');

  // Mainland Scotland (center-bottom-right)
  land([
    [458, 535], [535, 500], [608, 520], [638, 595], [612, 675],
    [645, 760], [602, 855], [510, 885], [462, 825], [442, 735], [426, 630],
  ], '#a5bf76');

  // Norway (dramatic fjorded coast upper-right!)
  land([
    [775, 425], [800, 315], [842, 235], [905, 130], [1024, 80],
    [1024, 520], [925, 540], [835, 520], [788, 480],
  ], '#d8cfa6');
  // Snow peaks accent on Norway
  g.fillStyle = '#f5f8fc';
  for (const [px, py] of [[865, 290], [925, 215], [965, 310], [895, 395]]) {
    g.beginPath(); g.moveTo(px, py - 24); g.lineTo(px + 22, py + 12); g.lineTo(px - 22, py + 12); g.closePath(); g.fill();
  }

  // Faroe Islands & Iceland hints (top-left edge for geographic richness)
  land([[445, 235], [482, 222], [492, 255], [456, 266]], '#b9c28c');
  land([[80, 120], [230, 95], [270, 165], [190, 210], [88, 185]], '#d6d4c2');

  // St Kilda tiny island dot & pulsing rings (x = 248, y = 620)
  const sk = [248, 620];
  g.strokeStyle = 'rgba(255,214,68,0.85)';
  g.lineWidth = 5;
  g.beginPath(); g.arc(sk[0], sk[1], 44, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#d9342b';
  g.beginPath(); g.arc(sk[0], sk[1], 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff';
  g.lineWidth = 5;
  g.stroke();

  // Dotted red distance line: St Kilda <-> Mainland Scotland ("100+ MILES")
  g.save();
  g.setLineDash([14, 12]);
  g.strokeStyle = '#ffe052';
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(sk[0] + 24, sk[1]);
  g.quadraticCurveTo(368, 560, 466, 610);
  g.stroke();
  g.restore();

  // Crisp map typography
  g.fillStyle = '#fff5cc';
  g.font = '900 34px DejaVu Sans, Arial Black, sans-serif';
  g.textAlign = 'center';
  g.fillText('100+ MILES', 362, 540);

  g.fillStyle = '#241726';
  g.font = '900 42px DejaVu Sans, Arial Black, sans-serif';
  g.fillText('ST KILDA', sk[0], sk[1] + 74);

  g.fillStyle = '#1f2b1b';
  g.font = '900 40px DejaVu Serif, Georgia, serif';
  g.fillText('SCOTLAND', 536, 700);

  g.fillStyle = '#241f1c';
  g.font = '900 44px DejaVu Serif, Georgia, serif';
  g.fillText('NORWAY', 905, 465);

  g.fillStyle = 'rgba(240,248,255,0.78)';
  g.font = 'italic bold 40px DejaVu Serif, Georgia, serif';
  g.fillText('NORTH ATLANTIC', 440, 390);
  return c;
}

/** Wooden cliffside calendar sheet for the 9 winter months */
export function calendarMonthTex(month = 'OCT', idx = 0) {
  const [c, g] = cv(256, 320);
  g.fillStyle = '#faf5e6';
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = '#22476b';
  g.fillRect(0, 0, 256, 92);
  g.fillStyle = '#18141c';
  g.beginPath(); g.arc(62, 28, 10, 0, Math.PI * 2); g.arc(194, 28, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff';
  g.font = '900 52px DejaVu Sans, Arial Black, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(month, 128, 56);
  // Month counter badge "1/9" .. "9/9"
  g.fillStyle = '#ffd644';
  g.font = '900 28px DejaVu Sans, sans-serif';
  g.fillText(`MONTH ${idx + 1} OF 9`, 128, 118);
  g.strokeStyle = '#c8bfa8';
  g.lineWidth = 3;
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 5; col++) {
      g.strokeRect(24 + col * 42, 142 + r * 38, 36, 32);
    }
  }
  g.strokeStyle = '#c92e2e';
  g.lineWidth = 6;
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 5; col++) {
      const x = 24 + col * 42, y = 142 + r * 38;
      g.beginPath();
      g.moveTo(x + 6, y + 6); g.lineTo(x + 30, y + 26);
      g.moveTo(x + 30, y + 6); g.lineTo(x + 6, y + 26);
      g.stroke();
    }
  }
  return c;
}

/** Weathered St Kilda village wooden sign */
export function villageSignTex(line1 = 'ST KILDA', line2 = 'NORTH ATLANTIC') {
  const [c, g] = cv(512, 192);
  g.fillStyle = '#5c4028';
  g.fillRect(0, 0, 512, 192);
  g.strokeStyle = '#d9c59e';
  g.lineWidth = 10;
  g.strokeRect(12, 12, 488, 168);
  g.fillStyle = '#fff5d6';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '900 66px DejaVu Serif, Georgia, serif';
  g.fillText(line1, 256, 72);
  g.fillStyle = '#ffd644';
  g.font = 'bold 34px DejaVu Sans, sans-serif';
  g.fillText(line2, 256, 138);
  return c;
}

/** Classic Scottish white coastal lighthouse tower texture */
export function lighthouseTex() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#f5f2e8';
  g.fillRect(0, 0, 256, 512);
  // Subtle masonry bands
  g.fillStyle = 'rgba(130,138,148,0.22)';
  for (let y = 0; y < 512; y += 32) g.fillRect(0, y, 256, 3);
  // Bold red maritime navigation stripe
  g.fillStyle = '#c4322b';
  g.fillRect(0, 170, 256, 86);
  // Dark narrow lighthouse windows
  g.fillStyle = '#222b38';
  for (const y of [100, 310, 420]) {
    g.fillRect(114, y, 28, 44);
    g.strokeStyle = '#18141c';
    g.lineWidth = 4;
    g.strokeRect(114, y, 28, 44);
  }
  return c;
}

/** Classic red Norwegian wooden boathouse (rorbuer) vertical cladding */
export function norwayWoodTex(seed = 8) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#a62924';
  g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 32) {
    g.fillStyle = hsl(3 + r() * 5, 65, 35 + r() * 7);
    g.fillRect(x, 0, 29, 512);
    g.fillStyle = 'rgba(30,10,10,0.55)';
    g.fillRect(x + 29, 0, 3, 512);
  }
  return c;
}

/** Snow-dusted Nordic granite fjord cliff */
export function snowRockTex(seed = 9) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4e5c6e';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 65; i++) {
    g.fillStyle = hsl(212, 18, 28 + r() * 18, 0.8);
    g.beginPath();
    g.roundRect(r() * 512, r() * 512, 40 + r() * 90, 20 + r() * 50, 6);
    g.fill();
  }
  // White snow drifts across ledges
  for (let i = 0; i < 55; i++) {
    g.fillStyle = `rgba(242,248,255,${0.55 + r() * 0.4})`;
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 24 + r() * 72, 8 + r() * 20, (r() - 0.5) * 0.3, 0, 7);
    g.fill();
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`);
  gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`);
  gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return c;
}
