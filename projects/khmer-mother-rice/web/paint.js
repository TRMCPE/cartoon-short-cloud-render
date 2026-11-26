// Deterministic Canvas2D painted textures for Cambodian Family Home & Open-Air Kitchen.
// Strictly uses { willReadFrequently: true } on every 2D canvas context (anti-glitch locked).
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Lush sunlit Cambodian garden lawn */
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#62a442'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = hsl(86 + r() * 24, 48, 36 + r() * 16, 0.5);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 22 + r() * 48, 14 + r() * 30, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 1100; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(84 + r() * 26, 50, 28 + r() * 22, 0.85); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke();
  }
  for (let i = 0; i < 26; i++) {
    g.fillStyle = ['#ffd859', '#fff8e2', '#f794b0'][i % 3];
    g.beginPath(); g.arc(r() * 512, r() * 512, 2.8, 0, 7); g.fill();
  }
  return c;
}

/** Warm Cambodian terracotta courtyard tiles (ការ៉ូឥដ្ឋក្រហមផ្ទះខ្មែរ) */
export function courtyardTile(seed = 12) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 128;
  g.fillStyle = '#6e3d28'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = col * s, y = row * s, L = 52 + r() * 8;
    g.fillStyle = hsl(18 + r() * 8, 56, L);
    g.beginPath(); g.roundRect(x + 4, y + 4, s - 8, s - 8, 8); g.fill();
    g.fillStyle = 'rgba(255,228,196,0.22)'; g.fillRect(x + 10, y + 8, s - 24, 6);
    for (let k = 0; k < 8; k++) {
      g.fillStyle = hsl(15 + r() * 8, 46, L - 8 - r() * 6, 0.45);
      g.beginPath(); g.ellipse(x + 14 + r() * (s - 28), y + 14 + r() * (s - 28), 3 + r() * 7, 2 + r() * 4, r() * 3, 0, 7); g.fill();
    }
  }
  return c;
}

/** Polished warm Khmer teak wood planks (ក្តារឈើផ្ទះខ្មែរ) */
export function planks(seed = 1, hueBase = 26, ligBase = 46) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = ligBase + r() * 10, H = hueBase + r() * 6;
    g.fillStyle = hsl(H, 48, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = hsl(H - 4, 42, L - 10 - r() * 8, 0.5); g.lineWidth = 1 + r() * 2;
      g.beginPath(); const x = i * w + 4 + r() * (w - 8);
      g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke();
    }
    g.fillStyle = 'rgba(40,22,10,0.88)'; g.fillRect(i * w, 0, 3, 512);
  }
  return c;
}

export function beam(seed = 2, base = [25, 45, 34]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) {
    g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, 0.45); g.lineWidth = 1 + r() * 3;
    g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke();
  }
  return c;
}

/** Woven golden bamboo wall & basket weave (ជញ្ជាំងឫស្សីត្បាញ និងកន្ត្រកបន្លែ) */
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

/** Traditional Khmer fish-scale clay roof tiles (ក្បឿងស្រកាត្រី) */
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

/** Traditional woven Khmer red sleeping mat (កន្ទេលក្រហមខ្មែរ) */
export function sleepingMat(seed = 23) {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#c4363c'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#f2c957';
  for (let y = 16; y < 256; y += 48) {
    g.fillRect(0, y, 256, 8);
    g.fillStyle = '#2e6b4e'; g.fillRect(0, y + 12, 256, 6); g.fillStyle = '#f2c957';
  }
  g.strokeStyle = 'rgba(60,18,18,0.28)'; g.lineWidth = 2;
  for (let x = 0; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  return c;
}

/** Cheerful sky-blue Khmer bedroom curtain fabric */
export function curtainTex() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#5bb3e8'; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) {
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x, 0, 12, 256);
  }
  g.fillStyle = '#fff3c4';
  for (let y = 24; y < 256; y += 64) for (let x = 24; x < 256; x += 64) {
    g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
  }
  return c;
}

/** Brushed aluminum / stainless-steel texture for rice pot & fish basin (ឆ្នាំងបាយ និងចានដែក) */
export function brushedMetal(seed = 31) {
  const [c, g] = cv(256, 256), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 256, 256);
  gr.addColorStop(0, '#eef4f8'); gr.addColorStop(0.45, '#c4d2dc'); gr.addColorStop(0.75, '#e2ebf2'); gr.addColorStop(1, '#9fb0bd');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) {
    g.strokeStyle = `rgba(255,255,255,${0.08 + r() * 0.16})`; g.lineWidth = 1.2;
    const y = r() * 256; g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
  }
  return c;
}

/** Clean bold cartoon wall clock face (without hands — hands are animated 3D meshes!) */
export function clockDialTex() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#fffdf5'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#241726'; g.lineWidth = 8;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r0 = i % 3 === 0 ? 86 : 98, r1 = 112;
    g.lineWidth = i % 3 === 0 ? 8 : 4;
    g.beginPath();
    g.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0);
    g.lineTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    g.stroke();
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
