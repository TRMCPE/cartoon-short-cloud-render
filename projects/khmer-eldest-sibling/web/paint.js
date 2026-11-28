// Deterministic Canvas2D painted textures for Authentic Khmer Stilt House, Patterned Khmer Tiles (ឥដ្ឋការ៉ូខ្មែរ),
// Ancestral Yard Ox-Cart Corner & Outdoor Kitchen Hearth (ផ្ទះបាយខ្មែរ).
// Strictly uses { willReadFrequently: true } on every 2D canvas context (anti-glitch locked).
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Sunlit Cambodian village grass & wild bund tufts */
export function grass(seed = 8) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5ca13c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 95; i++) {
    g.fillStyle = hsl(86 + r() * 24, 48, 35 + r() * 16, 0.5);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 22 + r() * 48, 14 + r() * 30, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 1050; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(84 + r() * 26, 50, 28 + r() * 22, 0.85); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke();
  }
  for (let i = 0; i < 22; i++) {
    g.fillStyle = ['#ffd859', '#fff8e2', '#f794b0'][i % 3];
    g.beginPath(); g.arc(r() * 512, r() * 512, 2.8, 0, 7); g.fill();
  }
  return c;
}

/** Iconic Cambodian red-pink laterite village dirt road (ផ្លូវដីក្រហម) */
export function lateriteRoad(seed = 17) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#c45f33'; g.fillRect(0, 0, 512, 512);
  for (const ry of [150, 362]) {
    const gr = g.createLinearGradient(0, ry - 56, 0, ry + 56);
    gr.addColorStop(0, 'rgba(155,64,34,0)');
    gr.addColorStop(0.5, 'rgba(148,58,28,0.55)');
    gr.addColorStop(1, 'rgba(155,64,34,0)');
    g.fillStyle = gr; g.fillRect(0, ry - 56, 512, 112);
  }
  for (let i = 0; i < 60; i++) {
    g.fillStyle = hsl(18 + r() * 10, 56, 44 + r() * 18, 0.35);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 16 + r() * 36, 8 + r() * 16, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 380; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(244,172,120,0.55)' : 'rgba(118,44,20,0.55)';
    g.beginPath(); g.arc(r() * 512, r() * 512, 1.4 + r() * 2.5, 0, 7); g.fill();
  }
  return c;
}

/** Hard-packed swept ochre Khmer yard earth */
export function sweptEarth(seed = 23) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#cda97b'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = hsl(33 + r() * 8, 38, 56 + r() * 14, 0.38);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 24 + r() * 44, 12 + r() * 24, r() * 2, 0, 7); g.fill();
  }
  for (let i = 0; i < 160; i++) {
    g.strokeStyle = 'rgba(158,122,82,0.28)'; g.lineWidth = 1.4;
    const x = r() * 512, y = r() * 512;
    g.beginPath(); g.arc(x, y, 18 + r() * 22, 0.2, 1.4); g.stroke();
  }
  return c;
}

/** Classic Cambodian Terracotta & Cream Geometric Cement Floor Tiles (ឥដ្ឋការ៉ូខ្មែរ — where little bro flops!) */
export function khmerPatioTile(seed = 31) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 128;
  g.fillStyle = '#5e3220'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = col * s, y = row * s;
    const warm = (row + col) % 2 === 0;
    const L = (warm ? 51 : 64) + r() * 5;
    g.fillStyle = warm ? hsl(15 + r() * 6, 58, L) : hsl(34 + r() * 6, 48, L);
    g.beginPath(); g.roundRect(x + 4, y + 4, s - 8, s - 8, 7); g.fill();
    // Subtle traditional Khmer diamond medallion motif inside tile
    g.strokeStyle = warm ? 'rgba(255,232,192,0.34)' : 'rgba(182,76,42,0.34)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x + s / 2, y + 18); g.lineTo(x + s - 18, y + s / 2);
    g.lineTo(x + s / 2, y + s - 18); g.lineTo(x + 18, y + s / 2);
    g.closePath(); g.stroke();
  }
  return c;
}

/** Painted or natural Khmer wooden planks (mustard-gold #D9A436, teak #6F472B, or oxblood #8C2D2D) */
export function planks(seed = 1, hueBase = 26, satBase = 48, ligBase = 46) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = ligBase + r() * 9, H = hueBase + r() * 6;
    g.fillStyle = hsl(H, satBase, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = hsl(H - 4, satBase - 6, L - 10 - r() * 8, 0.48); g.lineWidth = 1 + r() * 2;
      g.beginPath(); const x = i * w + 4 + r() * (w - 8);
      g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke();
    }
    g.fillStyle = 'rgba(32,20,12,0.85)'; g.fillRect(i * w, 0, 3, 512);
  }
  return c;
}

export function beam(seed = 2, base = [25, 45, 33]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) {
    g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, 0.45); g.lineWidth = 1 + r() * 3;
    g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke();
  }
  return c;
}

/** Woven split-bamboo wall & fence texture (ជញ្ជាំង/របងឫស្សីត្បាញ) */
export function wovenBamboo(seed = 15) {
  const [c, g] = cv(256, 256), r = rng(seed), s = 32;
  g.fillStyle = '#cfa15a'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const horiz = (x + y) % 2 === 0;
    g.fillStyle = hsl(36 + r() * 6, 54, (horiz ? 60 : 49) + r() * 6);
    g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    g.strokeStyle = 'rgba(72,42,16,0.45)'; g.lineWidth = 2;
    g.strokeRect(x * s + 1, y * s + 1, s - 2, s - 2);
  }
  return c;
}

/** Traditional Khmer diamond terracotta clay roof tiles (ក្បឿងស្រកាត្រី) */
export function clayTileRoof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#7d2d1b'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32;
    g.fillStyle = hsl(14 + r() * 8, 60, 44 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,222,184,0.24)'; g.fillRect(x + 6, y + 2, 5, 20);
  }
  return c;
}

/** Conical golden rice-straw haystack texture (ភ្នំចំបើង) */
export function strawStackTex(seed = 44) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#d4af5f'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 240; i++) {
    const x = r() * 256, y = r() * 256;
    g.strokeStyle = hsl(38 + r() * 10, 56, 42 + r() * 24, 0.72);
    g.lineWidth = 2 + r() * 2.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 8 - 4, y + 22 + r() * 24); g.stroke();
  }
  return c;
}

/** Traditional woven Khmer red/gold reed mat (កន្ទេលក្រហមខ្មែរ) */
export function sleepingMat() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#c4363c'; g.fillRect(0, 0, 256, 256);
  for (let y = 16; y < 256; y += 48) {
    g.fillStyle = '#f2c957'; g.fillRect(0, y, 256, 8);
    g.fillStyle = '#1f6e49'; g.fillRect(0, y + 12, 256, 6);
  }
  g.strokeStyle = 'rgba(60,18,18,0.28)'; g.lineWidth = 2;
  for (let x = 0; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  return c;
}

/** Checkered Khmer Krama texture (ក្រមាខ្មែរ) */
export function kramaTex(rgb = '176,34,44') {
  const [c, g] = cv(256, 256), s = 32;
  g.fillStyle = '#f7f3eb'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = `rgba(${rgb},0.58)`;
  for (let i = 0; i < 8; i += 2) {
    g.fillRect(i * s, 0, s, 256);
    g.fillRect(0, i * s, 256, s);
  }
  return c;
}

/** Ribbed glazed Khmer Peang water jar texture (ពាងទឹក) */
export function peangJarTex() {
  const [c, g] = cv(256, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#8a4c2e'); gr.addColorStop(0.5, '#a8643e'); gr.addColorStop(1, '#6e3a22');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let y = 36; y <= 216; y += 36) {
    g.strokeStyle = 'rgba(255,225,185,0.34)'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
    g.strokeStyle = 'rgba(55,24,10,0.45)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(0, y + 6); g.lineTo(256, y + 6); g.stroke();
  }
  return c;
}

/** Pale ash-grey Cambodian Sugar Palm trunk with horizontal leaf-scar rings (ដើមត្នោត) */
export function sugarPalmBark(seed = 41) {
  const [c, g] = cv(128, 256), r = rng(seed);
  g.fillStyle = '#867e72'; g.fillRect(0, 0, 128, 256);
  for (let y = 0; y < 256; y += 14) {
    g.fillStyle = r() > 0.5 ? 'rgba(65,58,48,0.42)' : 'rgba(182,174,160,0.28)';
    g.fillRect(0, y, 128, 4);
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
