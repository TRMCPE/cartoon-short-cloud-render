// Canvas2D painted textures for "Tin Can Island" (Niuafo'ou, Pacific). All deterministic & CPU-safe.
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1, clamp = false) => {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Dark jagged volcanic basalt cliff texture */
export function basalt(seed = 1) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#3b3a42'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 65; i++) {
    const x = r() * 512, y = r() * 512, w = 30 + r() * 90, h = 18 + r() * 45;
    g.fillStyle = hsl(235 + r() * 20, 12, 18 + r() * 16, 0.85);
    g.beginPath(); g.roundRect(x, y, w, h, 4); g.fill();
  }
  for (let i = 0; i < 45; i++) {
    g.strokeStyle = `rgba(18,16,24,${0.4 + r() * 0.4})`; g.lineWidth = 2 + r() * 2.5;
    g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y);
    for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 45; y += 14 + r() * 24; g.lineTo(x, y); }
    g.stroke();
  }
  for (let i = 0; i < 200; i++) {
    g.fillStyle = hsl(220, 10, 42 + r() * 14, 0.35);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 6, 1.5 + r() * 4, r() * 3, 0, 7); g.fill();
  }
  return c;
}

/** Lush tropical jungle grass/foliage texture */
export function jungleGrass(seed = 2) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#488d3a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = hsl(98 + r() * 26, 48, 28 + r() * 16, 0.55);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 18 + r() * 46, 12 + r() * 28, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 1100; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(92 + r() * 32, 55, 26 + r() * 26, 0.85); g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 6 - r() * 9); g.stroke();
  }
  for (let i = 0; i < 36; i++) {
    g.fillStyle = ['#ffd859', '#ff6e7a', '#ffffff'][i % 3];
    g.beginPath(); g.arc(r() * 512, r() * 512, 3, 0, 7); g.fill();
  }
  return c;
}

/** Sun-bleached teak wooden ship deck planks */
export function deckPlanks(seed = 3) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 58 + r() * 9, H = 33 + r() * 5;
    g.fillStyle = hsl(H, 44, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 12; k++) {
      g.strokeStyle = hsl(H - 4, 42, L - 10 - r() * 8, 0.45); g.lineWidth = 1.5;
      const x = i * w + 5 + r() * (w - 10);
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 3, 170, x - 3, 340, x, 512); g.stroke();
    }
    const cut = r() * 512;
    g.fillStyle = 'rgba(42,26,16,.85)'; g.fillRect(i * w, cut, w, 3.5);
    g.fillStyle = 'rgba(32,20,12,.92)'; g.fillRect(i * w, 0, 3, 512);
  }
  return c;
}

/** 1930s Pacific steamship steel hull with red waterline, rivets & brass portholes */
export function shipHull(seed = 4) {
  const [c, g] = cv(1024, 512), r = rng(seed);
  // Dark navy/black upper hull
  g.fillStyle = '#252b36'; g.fillRect(0, 0, 1024, 340);
  // Cream trim stripe
  g.fillStyle = '#f2e8cf'; g.fillRect(0, 290, 1024, 16);
  // Classic maritime rust-red lower hull
  g.fillStyle = '#a8312a'; g.fillRect(0, 340, 1024, 172);
  // Plate seams & rivets
  g.strokeStyle = 'rgba(12,15,20,0.45)'; g.lineWidth = 3;
  for (let x = 0; x < 1024; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  for (let y = 85; y < 512; y += 85) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  // Brass portholes along upper hull
  for (let i = 0; i < 8; i++) {
    const px = 74 + i * 124, py = 128;
    g.fillStyle = '#d4a648'; g.beginPath(); g.arc(px, py, 24, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#18141c'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#233b52'; g.beginPath(); g.arc(px, py, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(px - 5, py - 5, 5, 0, Math.PI * 2); g.fill();
  }
  // Historic Union Steamship mail steamer nameplate
  g.fillStyle = '#f5d97e'; g.font = 'bold 46px DejaVu Serif, Georgia, serif'; g.textAlign = 'center';
  g.fillText('S.S. TOFUA  •  PACIFIC MAIL', 512, 236);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.05})`;
    g.fillRect(r() * 1024, 340 + r() * 160, 16 + r() * 40, 4);
  }
  return c;
}

/** Red-and-black banded 1930s steamship funnel */
export function funnelTex() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#c8342d'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#1d1e24'; g.fillRect(0, 0, 256, 130);
  g.fillStyle = '#1d1e24'; g.fillRect(0, 170, 256, 36);
  g.fillStyle = '#f2e8cf'; g.fillRect(0, 130, 256, 14);
  return c;
}

/** Painted island post office clapboard walls */
export function postWall(seed = 5) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#f6ecd4'; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) {
    g.fillStyle = hsl(42, 42, 86 + (r() - 0.5) * 6); g.fillRect(0, y, 512, 30);
    g.fillStyle = 'rgba(95,75,52,0.35)'; g.fillRect(0, y + 29, 512, 3);
  }
  return c;
}

/** Corrugated red tropical roof */
export function roofTin() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#b93b2e'; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 16) {
    g.fillStyle = '#d45142'; g.fillRect(x, 0, 7, 256);
    g.fillStyle = '#85251c'; g.fillRect(x + 12, 0, 4, 256);
  }
  return c;
}

/** Crisp painted wooden signboard */
export function signTex(line1, line2 = '', bg = '#1e3a5f', fg = '#ffd859', border = '#f6ecd4') {
  const [c, g] = cv(512, 192);
  g.fillStyle = bg; g.fillRect(0, 0, 512, 192);
  g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(10, 10, 492, 172);
  g.strokeStyle = '#241726'; g.lineWidth = 4; g.strokeRect(20, 20, 472, 152);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (line2) {
    g.font = '900 54px DejaVu Sans, Arial Black, sans-serif'; g.fillText(line1, 256, 70);
    g.fillStyle = '#ffffff'; g.font = 'bold 34px DejaVu Sans, Arial, sans-serif'; g.fillText(line2, 256, 134);
  } else {
    g.font = '900 58px DejaVu Sans, Arial Black, sans-serif'; g.fillText(line1, 256, 98);
  }
  return c;
}

/** Vintage sealed galvanized biscuit tin label ("BISCUITS • ISLAND MAIL") */
export function biscuitTinTex() {
  const [c, g] = cv(512, 512);
  const gr = g.createLinearGradient(0, 0, 512, 0);
  gr.addColorStop(0, '#a6b1bc'); gr.addColorStop(0.28, '#e8eef2'); gr.addColorStop(0.55, '#c2ccd6'); gr.addColorStop(0.82, '#eef4f8'); gr.addColorStop(1, '#98a4b0');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  // Embossed horizontal ribs
  for (const y of [46, 70, 440, 464]) {
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(0, y, 512, 7);
    g.fillStyle = 'rgba(40,46,58,0.45)'; g.fillRect(0, y + 7, 512, 5);
  }
  // Vintage red & gold tin label band
  g.fillStyle = '#c4312b'; g.fillRect(28, 128, 456, 256);
  g.strokeStyle = '#f2c752'; g.lineWidth = 10; g.strokeRect(38, 138, 436, 236);
  g.fillStyle = '#fff8e2'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '900 66px DejaVu Serif, Georgia, serif'; g.fillText('BISCUIT', 256, 210);
  g.fillStyle = '#ffd859'; g.font = '900 52px DejaVu Sans, Arial Black, sans-serif'; g.fillText('TIN MAIL', 256, 282);
  g.fillStyle = '#f6ecd4'; g.font = 'bold 28px DejaVu Sans, sans-serif'; g.fillText('SEALED • PACIFIC POST', 256, 338);
  return c;
}

/** Vintage colorful Pacific World Map tabletop texture */
export function worldMapTex() {
  const [c, g] = cv(1024, 1024);
  // Warm parchment ocean
  g.fillStyle = '#79bdd4'; g.fillRect(0, 0, 1024, 1024);
  // Lat/lon map grid
  g.strokeStyle = 'rgba(245,240,220,0.32)'; g.lineWidth = 2;
  for (let i = 64; i < 1024; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
  }
  const land = (pts, col = '#c7b57c') => {
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
    g.fillStyle = col; g.fill(); g.strokeStyle = '#3b2e26'; g.lineWidth = 5; g.stroke();
  };
  // Asia / Japan (top-left)
  land([[0, 0], [330, 0], [360, 150], [280, 290], [180, 310], [80, 240], [0, 260]], '#d6c185');
  land([[355, 190], [395, 220], [385, 290], [345, 270]], '#e2cc92');
  // Australia (bottom-left)
  land([[90, 620], [270, 580], [360, 690], [330, 840], [180, 870], [80, 770]], '#d9b174');
  // New Zealand
  land([[415, 840], [455, 815], [468, 910], [418, 945]], '#8db368');
  // North America (top-right)
  land([[700, 0], [1024, 0], [1024, 390], [890, 410], [780, 310], [710, 160]], '#c9b980');
  // South America (bottom-right)
  land([[860, 520], [1024, 510], [1024, 960], [920, 950], [835, 760]], '#b8c47a');

  // Dotted mail routes radiating out from Niuafo'ou (512, 540)
  const hub = [512, 540];
  const targets = [[210, 170], [375, 240], [230, 730], [860, 210], [940, 690], [440, 870]];
  g.save();
  g.setLineDash([12, 10]); g.strokeStyle = '#d9382e'; g.lineWidth = 6;
  for (const [tx, ty] of targets) {
    g.beginPath(); g.moveTo(hub[0], hub[1]);
    g.quadraticCurveTo((hub[0] + tx) / 2, (hub[1] + ty) / 2 - 55, tx, ty);
    g.stroke();
  }
  g.restore();

  // Niuafo'ou pin in center
  g.fillStyle = '#e53935'; g.beginPath(); g.arc(hub[0], hub[1], 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff9d6'; g.beginPath(); g.arc(hub[0], hub[1], 8, 0, Math.PI * 2); g.fill();

  // Map labels
  g.fillStyle = '#243a4d'; g.font = 'italic bold 36px DejaVu Serif, Georgia, serif'; g.textAlign = 'center';
  g.fillText('PACIFIC OCEAN', 512, 410);
  g.fillStyle = '#241726'; g.font = '900 32px DejaVu Sans, sans-serif';
  g.fillText("NIUAFO'OU", 512, 602);
  return c;
}

/** Oversized vintage airmail envelope (clean or stamped "TIN CAN ISLAND") */
export function envelopeTex(stamped = false) {
  const [c, g] = cv(1024, 680);
  g.fillStyle = '#f8f0dc'; g.fillRect(0, 0, 1024, 680);
  // Classic red/blue diagonal airmail border stripes
  const stripes = 22, sw = 1024 / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? '#2957a4' : '#cf342e';
    g.fillRect(i * sw + 4, 12, sw - 12, 18);
    g.fillRect(i * sw + 4, 650, sw - 12, 18);
  }
  for (let i = 0; i < 14; i++) {
    const sh = 680 / 14;
    g.fillStyle = i % 2 ? '#cf342e' : '#2957a4';
    g.fillRect(12, i * sh + 4, 18, sh - 12);
    g.fillRect(994, i * sh + 4, 18, sh - 12);
  }
  // Postage stamp top-right
  g.fillStyle = '#ffffff'; g.fillRect(805, 58, 152, 176);
  g.strokeStyle = '#241726'; g.lineWidth = 4; g.strokeRect(805, 58, 152, 176);
  g.fillStyle = '#2e7d9b'; g.fillRect(820, 72, 122, 148);
  g.fillStyle = '#ffd859'; g.beginPath(); g.arc(881, 134, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.font = 'bold 24px DejaVu Sans, sans-serif'; g.textAlign = 'center';
  g.fillText('TONGA', 881, 206);
  // Handwritten-style address lines
  g.strokeStyle = '#6e6456'; g.lineWidth = 4;
  for (const y of [330, 410, 490]) { g.beginPath(); g.moveTo(110, y); g.lineTo(540, y); g.stroke(); }
  g.fillStyle = '#332c28'; g.font = 'italic bold 42px DejaVu Serif, Georgia, serif'; g.textAlign = 'left';
  g.fillText('Via Pacific Mail', 115, 315);
  g.fillText("Niuafo'ou Post", 115, 395);
  g.fillText('South Pacific', 115, 475);

  if (stamped) {
    // Bold crimson vintage circular postmark: TIN CAN ISLAND
    g.save();
    g.translate(610, 320); g.rotate(-0.14);
    g.strokeStyle = '#be1e2d'; g.lineWidth = 14;
    g.beginPath(); g.arc(0, 0, 195, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6;
    g.beginPath(); g.arc(0, 0, 165, 0, Math.PI * 2); g.stroke();
    // Wavy cancellation lines
    for (let k = -2; k <= 2; k++) {
      g.beginPath();
      for (let x = 185; x <= 345; x += 12) {
        const y = k * 24 + Math.sin(x * 0.08) * 7;
        x === 185 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = '#be1e2d'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 56px DejaVu Sans, Arial Black, sans-serif';
    g.fillText('TIN CAN', 0, -42);
    g.fillText('ISLAND', 0, 22);
    g.font = 'bold 28px DejaVu Sans, sans-serif';
    g.fillText("• NIUAFO'OU •", 0, 84);
    g.restore();
  }
  return c;
}

/** Wall calendar page texture for time-passage shot */
export function calendarTex(month = 'JAN') {
  const [c, g] = cv(256, 320);
  g.fillStyle = '#faf5e8'; g.fillRect(0, 0, 256, 320);
  g.fillStyle = '#cc332b'; g.fillRect(0, 0, 256, 86);
  g.fillStyle = '#241726';
  g.beginPath(); g.arc(64, 30, 10, 0, Math.PI * 2); g.arc(192, 30, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.font = '900 50px DejaVu Sans, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(month, 128, 52);
  g.strokeStyle = '#d4cbb8'; g.lineWidth = 3;
  for (let r = 0; r < 5; r++) for (let col = 0; col < 5; col++) g.strokeRect(26 + col * 41, 106 + r * 38, 36, 32);
  g.strokeStyle = '#cc332b'; g.lineWidth = 6;
  for (let r = 0; r < 4; r++) for (let col = 0; col < 5; col++) {
    const x = 26 + col * 41, y = 106 + r * 38;
    g.beginPath(); g.moveTo(x + 5, y + 5); g.lineTo(x + 31, y + 27); g.moveTo(x + 31, y + 5); g.lineTo(x + 5, y + 27); g.stroke();
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
