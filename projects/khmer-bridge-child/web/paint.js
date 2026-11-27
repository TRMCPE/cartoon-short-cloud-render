// Deterministic Canvas2D painted textures for Rural Cambodian Stilt House, Yard Gate & Wooden Creek Bridge.
// Strictly uses { willReadFrequently: true } on every 2D canvas context (anti-glitch locked).
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Lush sunlit Cambodian village grass & wild straw tufts */
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5ea33e'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 95; i++) {
    g.fillStyle = hsl(86 + r() * 24, 48, 35 + r() * 16, 0.5);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 22 + r() * 48, 14 + r() * 30, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 1100; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(84 + r() * 26, 50, 28 + r() * 22, 0.85); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke();
  }
  for (let i = 0; i < 24; i++) {
    g.fillStyle = ['#ffd859', '#fff8e2', '#f794b0'][i % 3];
    g.beginPath(); g.arc(r() * 512, r() * 512, 2.8, 0, 7); g.fill();
  }
  return c;
}

/** Iconic Cambodian red-pink laterite village dirt path (ផ្លូវដីក្រហម) */
export function lateriteRoad(seed = 14) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#c46236'; g.fillRect(0, 0, 512, 512);
  for (const ry of [145, 365]) {
    const gr = g.createLinearGradient(0, ry - 58, 0, ry + 58);
    gr.addColorStop(0, 'rgba(158,68,36,0)');
    gr.addColorStop(0.5, 'rgba(152,62,32,0.55)');
    gr.addColorStop(1, 'rgba(158,68,36,0)');
    g.fillStyle = gr; g.fillRect(0, ry - 58, 512, 116);
  }
  for (let i = 0; i < 65; i++) {
    g.fillStyle = hsl(18 + r() * 10, 56, 44 + r() * 18, 0.35);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 16 + r() * 36, 8 + r() * 16, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 420; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(242,168,118,0.55)' : 'rgba(120,46,22,0.55)';
    g.beginPath(); g.arc(r() * 512, r() * 512, 1.4 + r() * 2.6, 0, 7); g.fill();
  }
  return c;
}

/** Hard-packed swept ochre earth under Khmer stilt house & creek bank */
export function sweptEarth(seed = 21) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#cba97e'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = hsl(33 + r() * 8, 38, 56 + r() * 14, 0.38);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 24 + r() * 44, 12 + r() * 24, r() * 2, 0, 7); g.fill();
  }
  for (let i = 0; i < 180; i++) {
    g.strokeStyle = 'rgba(158,122,82,0.28)'; g.lineWidth = 1.4;
    const x = r() * 512, y = r() * 512;
    g.beginPath(); g.arc(x, y, 18 + r() * 22, 0.2, 1.4); g.stroke();
  }
  return c;
}

/** Warm Cambodian terracotta veranda floor tiles */
export function courtyardTile(seed = 12) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 128;
  g.fillStyle = '#6e3d28'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = col * s, y = row * s, L = 52 + r() * 8;
    g.fillStyle = hsl(18 + r() * 8, 56, L);
    g.beginPath(); g.roundRect(x + 4, y + 4, s - 8, s - 8, 8); g.fill();
    g.fillStyle = 'rgba(255,228,196,0.22)'; g.fillRect(x + 10, y + 8, s - 24, 6);
    for (let k = 0; k < 7; k++) {
      g.fillStyle = hsl(15 + r() * 8, 46, L - 8 - r() * 6, 0.42);
      g.beginPath(); g.ellipse(x + 14 + r() * (s - 28), y + 14 + r() * (s - 28), 3 + r() * 7, 2 + r() * 4, r() * 3, 0, 7); g.fill();
    }
  }
  return c;
}

/** Painted or natural Khmer wooden planks (teak, rural aqua-turquoise #38A3A5, or weathered bridge timber) */
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

/** Woven golden bamboo fence/wall weave (របងឫស្សី) */
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

/** Traditional Khmer diamond/fish-scale terracotta clay roof tiles (ក្បឿង) */
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

/** Traditional woven Khmer red reed mat (កន្ទេលក្រហមខ្មែរ) */
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

/** Classic Maroon-and-White Gingham Khmer Krama (ក្រមាខ្មែរ) */
export function kramaTex(rgb = '176,34,44') {
  const [c, g] = cv(256, 256), s = 32;
  g.fillStyle = '#f7f3eb'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = `rgba(${rgb},0.55)`;
  for (let i = 0; i < 8; i += 2) {
    g.fillRect(i * s, 0, s, 256);
    g.fillRect(0, i * s, 256, s);
  }
  return c;
}

/** Calm tropical turquoise-teal Cambodian rural creek/canal water (ទឹកព្រែកក្រោមស្ពាន) */
export function creekWater(seed = 52) {
  const [c, g] = cv(512, 512), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 512, 0);
  gr.addColorStop(0, '#298ea8'); gr.addColorStop(0.5, '#3fb6cf'); gr.addColorStop(1, '#26849c');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 95; i++) {
    g.strokeStyle = r() > 0.35 ? 'rgba(215,248,255,0.45)' : 'rgba(20,92,112,0.36)';
    g.lineWidth = 2.5 + r() * 3.5;
    const x = r() * 512, y = r() * 512, w = 32 + r() * 74;
    g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - 5 + r() * 10, x + w / 2, y); g.stroke();
  }
  return c;
}

/** Colorful market umbrella canopy stripes for village snack stall (តូបលក់នំ) */
export function umbrellaTex() {
  const [c, g] = cv(256, 256);
  const cols = ['#e03434', '#ffd23f', '#2986f5', '#2eb85c'];
  for (let i = 0; i < 8; i++) {
    g.fillStyle = cols[i % 4];
    g.fillRect(i * 32, 0, 33, 256);
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
