// Deterministic Canvas2D painted textures for Angkor-era Cambodia world.
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Warm golden-buff Angkor sandstone blocks with subtle carved courses */
export function sandstone(seed = 4, hue = 38, sat = 24, lig = 64, bw = 128, bh = 64) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#473c30'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh; row++) for (let col = -1; col < 512 / bw + 1; col++) {
    const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = lig - 6 + r() * 12;
    g.fillStyle = hsl(hue + r() * 8 - 4, sat, L); g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 5); g.fill();
    g.fillStyle = hsl(hue, sat + 4, L + 8, 0.55); g.fillRect(x + 6, y + 5, bw - 14, 5);
    g.fillStyle = hsl(hue - 4, sat, L - 12, 0.5); g.fillRect(x + 6, y + bh - 10, bw - 12, 5);
    for (let k = 0; k < 7; k++) {
      g.fillStyle = hsl(hue - 6, sat, L - 8 - r() * 10, 0.55);
      g.beginPath(); g.ellipse(x + r() * bw, y + r() * bh, 2 + r() * 6, 1 + r() * 3, 0, 0, 7); g.fill();
    }
  }
  return c;
}

/** Pitted reddish-brown Angkor laterite foundation blocks (ថ្មបាយក្រៀម) */
export function laterite(seed = 11) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#3b2016'; g.fillRect(0, 0, 512, 512);
  const bw = 128, bh = 64;
  for (let row = 0; row < 8; row++) for (let col = -1; col < 5; col++) {
    const x = col * bw + (row % 2) * 64, y = row * bh, L = 38 + r() * 10;
    g.fillStyle = hsl(16 + r() * 8, 48, L); g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 6); g.fill();
    for (let p = 0; p < 22; p++) {
      g.fillStyle = hsl(12 + r() * 8, 45, 20 + r() * 12, 0.75);
      g.beginPath(); g.ellipse(x + 8 + r() * (bw - 16), y + 8 + r() * (bh - 16), 2 + r() * 4.5, 2 + r() * 3.5, r() * 3, 0, 7); g.fill();
    }
  }
  return c;
}

export function mossy(c0, seed = 5, amt = 1) {
  const [c, g] = cv(c0.width, c0.height), r = rng(seed); g.drawImage(c0, 0, 0);
  for (let i = 0; i < 420 * amt; i++) {
    const y = c.height * (0.35 + 0.65 * Math.pow(r(), 0.55));
    g.fillStyle = hsl(92 + r() * 28, 44, 28 + r() * 16, 0.82);
    g.beginPath(); g.ellipse(r() * c.width, y, 4 + r() * 10, 3 + r() * 6, 0, 0, 7); g.fill();
  }
  return c;
}

/** Lush tropical Cambodian countryside & jungle grass */
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5f9c3f'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 95; i++) {
    g.fillStyle = hsl(84 + r() * 26, 46, 34 + r() * 16, 0.5);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 52, 12 + r() * 32, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 1300; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(82 + r() * 28, 48, 26 + r() * 24, 0.88); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke();
  }
  for (let i = 0; i < 28; i++) {
    g.fillStyle = ['#ffd859', '#fff6d6', '#f28ca8'][i % 3];
    g.beginPath(); g.arc(r() * 512, r() * 512, 2.6, 0, 7); g.fill();
  }
  return c;
}

/** Reddish-ochre Cambodian dirt road with subtle ox-cart wheel ruts */
export function lateriteDirt(seed = 7) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#b9784d'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 280; i++) {
    g.fillStyle = hsl(22 + r() * 12, 42, 42 + r() * 22, 0.55);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 16, 3 + r() * 9, r() * 3, 0, 7); g.fill();
  }
  // Subtle wheel tracks along Y
  for (const rx of [145, 367]) {
    g.fillStyle = 'rgba(110,58,32,0.34)'; g.fillRect(rx - 18, 0, 36, 512);
    g.fillStyle = 'rgba(235,182,135,0.22)'; g.fillRect(rx - 26, 0, 8, 512);
  }
  return c;
}

export function planks(seed = 1) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 44 + r() * 10, H = 26 + r() * 7;
    g.fillStyle = hsl(H, 46, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = hsl(H - 4, 42, L - 10 - r() * 8, 0.5); g.lineWidth = 1 + r() * 2;
      g.beginPath(); const x = i * w + 4 + r() * (w - 8);
      g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke();
    }
    g.fillStyle = 'rgba(36,20,10,0.92)'; g.fillRect(i * w, 0, 3, 512);
  }
  return c;
}

export function beam(seed = 2, base = [26, 44, 34]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) {
    g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, 0.45); g.lineWidth = 1 + r() * 3;
    g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke();
  }
  return c;
}

/** Woven golden bamboo mat texture (កន្ទេល / ជញ្ជាំងឫស្សីត្បាញ / ដំបូលរទេះគោ) */
export function wovenBamboo(seed = 15) {
  const [c, g] = cv(256, 256), r = rng(seed), s = 32;
  g.fillStyle = '#c89b54'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const horiz = (x + y) % 2 === 0;
    g.fillStyle = hsl(36 + r() * 6, 52, (horiz ? 58 : 48) + r() * 6);
    g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    g.strokeStyle = 'rgba(70,42,16,0.45)'; g.lineWidth = 2;
    g.strokeRect(x * s + 1, y * s + 1, s - 2, s - 2);
  }
  return c;
}

/** Khmer clay roof tiles (ក្បឿងស្រកាត្រី) */
export function clayTileRoof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#7a2c1a'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32;
    g.fillStyle = hsl(14 + r() * 8, 58, 42 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,0.24)'; g.fillRect(x + 6, y + 2, 5, 20);
  }
  return c;
}

/** Glazed earthenware Prahok jar texture (ក្រឡដីដាក់ប្រហុក) with traditional wavy shoulder band */
export function glazedJarTex(seed = 21) {
  const [c, g] = cv(512, 512), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#5a321a');
  gr.addColorStop(0.28, '#8a4c26');
  gr.addColorStop(0.65, '#6e3a1c');
  gr.addColorStop(1, '#3d1f0e');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  // Decorative incised golden-ochre Angkor wavy shoulder band
  g.strokeStyle = '#d9a456'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(0, 148); g.lineTo(512, 148); g.moveTo(0, 198); g.lineTo(512, 198); g.stroke();
  g.lineWidth = 6; g.beginPath();
  for (let x = 0; x <= 512; x += 8) {
    const y = 173 + Math.sin(x / 512 * Math.PI * 16) * 14;
    if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(255,215,165,${0.06 + r() * 0.09})`;
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 6 + r() * 18, 3 + r() * 8, 0, 0, 7); g.fill();
  }
  return c;
}

/** Festive Khmer silk banner texture */
export function silkBanner(colA = '#c92c34', colB = '#f0be42') {
  const [c, g] = cv(256, 512);
  g.fillStyle = colA; g.fillRect(0, 0, 256, 512);
  g.strokeStyle = colB; g.lineWidth = 14; g.strokeRect(16, 16, 224, 460);
  // Diamond ikat pattern in center
  g.fillStyle = colB;
  for (let k = 0; k < 3; k++) {
    const cy = 135 + k * 115;
    g.beginPath(); g.moveTo(128, cy - 42); g.lineTo(176, cy); g.lineTo(128, cy + 42); g.lineTo(80, cy); g.closePath(); g.fill();
    g.fillStyle = colA;
    g.beginPath(); g.moveTo(128, cy - 18); g.lineTo(148, cy); g.lineTo(128, cy + 18); g.lineTo(108, cy); g.closePath(); g.fill();
    g.fillStyle = colB;
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
