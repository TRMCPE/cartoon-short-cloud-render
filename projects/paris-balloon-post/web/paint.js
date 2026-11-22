// Canvas2D painted textures for "Paris Found the Sky" (Siege of Paris, 1870). All deterministic & CPU-safe.
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

/** Parisian Haussmann limestone cobbles (warm stone pavers) */
export function cobbles(seed = 1) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5c5550'; g.fillRect(0, 0, 512, 512);
  const rows = 16, cols = 8, rh = 512 / rows, cw = 512 / cols;
  for (let row = 0; row < rows; row++) {
    const off = (row % 2) * (cw * 0.5);
    for (let col = -1; col <= cols; col++) {
      const x = col * cw + off + 2, y = row * rh + 2;
      const L = 52 + (r() - 0.5) * 16, H = 28 + (r() - 0.5) * 12;
      g.fillStyle = hsl(H, 14, L);
      g.beginPath(); g.roundRect(x, y, cw - 4, rh - 4, 4); g.fill();
      g.strokeStyle = 'rgba(32,26,28,0.55)'; g.lineWidth = 2; g.stroke();
    }
  }
  return c;
}

/** 1870 Haussmann cream limestone facade with tall shuttered windows & wrought-iron balconies */
export function haussmann(seed = 2, lit = false) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = lit ? '#bfb299' : '#e4d8c0'; g.fillRect(0, 0, 512, 512);
  // Ashlar stone horizontal bands
  for (let y = 0; y < 512; y += 32) {
    g.fillStyle = hsl(38, 28, (lit ? 68 : 82) + (r() - 0.5) * 5, 0.55);
    g.fillRect(0, y, 512, 30);
    g.fillStyle = 'rgba(85,72,58,0.22)'; g.fillRect(0, y + 30, 512, 2);
  }
  // Cornice ledges between floors
  for (const y of [16, 178, 342]) {
    g.fillStyle = lit ? '#9a8f7a' : '#cfc1a6'; g.fillRect(0, y, 512, 12);
    g.fillStyle = 'rgba(36,24,38,0.45)'; g.fillRect(0, y + 12, 512, 4);
  }
  // Tall French windows (3 columns x 3 floors)
  for (let row = 0; row < 3; row++) {
    const wy = 44 + row * 164;
    for (let col = 0; col < 3; col++) {
      const wx = 44 + col * 160;
      const isWarm = lit ? r() > 0.32 : r() > 0.78;
      // Window recess
      g.fillStyle = '#332d36'; g.fillRect(wx - 4, wy - 4, 88, 114);
      g.fillStyle = isWarm ? '#ffd778' : (lit ? '#2d3a54' : '#4a6482');
      g.fillRect(wx, wy, 80, 106);
      if (isWarm) {
        const gr = g.createRadialGradient(wx + 40, wy + 50, 8, wx + 40, wy + 50, 62);
        gr.addColorStop(0, '#fff4bd'); gr.addColorStop(1, '#f29e38');
        g.fillStyle = gr; g.fillRect(wx, wy, 80, 106);
      }
      // Mullions
      g.strokeStyle = '#241726'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(wx + 40, wy); g.lineTo(wx + 40, wy + 106);
      g.moveTo(wx, wy + 46); g.lineTo(wx + 80, wy + 46); g.stroke();
      // Iron balcony rail across bottom of window
      g.fillStyle = '#201e29'; g.fillRect(wx - 10, wy + 78, 100, 5);
      g.fillRect(wx - 10, wy + 104, 100, 6);
      for (let bx = wx - 6; bx <= wx + 86; bx += 13) g.fillRect(bx, wy + 78, 3, 28);
    }
  }
  return c;
}

/** Blue-grey zinc Parisian mansard slate roof */
export function mansardRoof(seed = 3) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#495a70'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 24) {
    for (let x = 0; x < 256; x += 32) {
      g.fillStyle = hsl(212, 22, 34 + (r() - 0.5) * 8);
      g.fillRect(x + 1, y + 1, 30, 22);
    }
    g.fillStyle = 'rgba(20,24,36,0.45)'; g.fillRect(0, y + 22, 256, 2);
  }
  // Vertical zinc seam ribs
  g.fillStyle = 'rgba(180,200,224,0.28)';
  for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 3, 256);
  return c;
}

/** Gothic cathedral stone facade (Notre-Dame arches + rose window) */
export function cathedralStone() {
  const [c, g] = cv(512, 512), r = rng(7);
  g.fillStyle = '#d6cab2'; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 24) {
    for (let x = 0; x < 512; x += 48) {
      g.fillStyle = hsl(39, 24, 76 + (r() - 0.5) * 6);
      g.fillRect(x + 1, y + 1, 46, 22);
    }
  }
  // Central Gothic Rose Window
  g.fillStyle = '#252130'; g.beginPath(); g.arc(256, 200, 68, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#9c8f78'; g.lineWidth = 8; g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    g.fillStyle = i % 2 ? '#c43b42' : '#3565a8';
    g.beginPath(); g.arc(256 + Math.cos(a) * 42, 200 + Math.sin(a) * 42, 11, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#f2c752'; g.beginPath(); g.arc(256, 200, 18, 0, Math.PI * 2); g.fill();
  // Three pointed Gothic arches below
  for (const ax of [108, 256, 404]) {
    g.fillStyle = '#2a242c';
    g.beginPath(); g.moveTo(ax - 44, 512); g.lineTo(ax - 44, 380);
    g.quadraticCurveTo(ax, 305, ax + 44, 380); g.lineTo(ax + 44, 512); g.closePath(); g.fill();
    g.strokeStyle = '#6e6456'; g.lineWidth = 6; g.stroke();
  }
  return c;
}

/** Vibrant 1870 striped gas-balloon silk canvas with decorative band & rigging net */
export function balloonTex(colA = '#d43a32', colB = '#faf0d6', bandCol = '#1f4582', label = 'POSTE • PARIS') {
  const [c, g] = cv(1024, 512);
  const gores = 16, gw = 1024 / gores;
  for (let i = 0; i < gores; i++) {
    g.fillStyle = i % 2 === 0 ? colA : colB;
    g.fillRect(i * gw, 0, gw + 1, 512);
    // Subtle gore seam line
    g.fillStyle = 'rgba(36,23,38,0.35)';
    g.fillRect(i * gw, 0, 3, 512);
  }
  // Ornate equatorial band with French gold trim
  g.fillStyle = bandCol; g.fillRect(0, 208, 1024, 86);
  g.fillStyle = '#f2c94c'; g.fillRect(0, 200, 1024, 12); g.fillRect(0, 290, 1024, 12);
  // Crisp lettering repeated twice around equator so visible from any angle!
  if (label) {
    g.fillStyle = '#fff9e6'; g.font = '900 44px DejaVu Sans, Arial Black, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(label, 256, 252);
    g.fillText(label, 768, 252);
  }
  // Diamond rigging net over upper 75% of balloon
  g.strokeStyle = 'rgba(42,30,24,0.36)'; g.lineWidth = 3;
  for (let x = -512; x < 1536; x += 64) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 380, 390); g.stroke();
    g.beginPath(); g.moveTo(x + 380, 0); g.lineTo(x, 390); g.stroke();
  }
  return c;
}

/** Woven rattan wicker texture for balloon gondolas & pigeon cages */
export function wickerTex(seed = 8) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#b88346'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    for (let x = 0; x < 256; x += 32) {
      const alt = ((y / 16) % 2) * 16;
      g.fillStyle = hsl(33, 48, 46 + (r() - 0.5) * 10);
      g.beginPath(); g.roundRect(x + alt - 16, y + 1, 28, 13, 4); g.fill();
      g.strokeStyle = '#5e3c1b'; g.lineWidth = 2; g.stroke();
    }
  }
  // Top & bottom darker woven rim
  g.fillStyle = '#6e451f'; g.fillRect(0, 0, 256, 18); g.fillRect(0, 238, 256, 18);
  return c;
}

/** Wicker pigeon cage slatted side texture */
export function cageTex() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#382a20'; g.fillRect(0, 0, 256, 256);
  // Cute silhouettes of pigeons peeking between slats!
  for (const px of [68, 186]) {
    g.fillStyle = '#a4b4c6'; g.beginPath(); g.arc(px, 128, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px - 10, 118, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d1820'; g.beginPath(); g.arc(px - 11, 118, 4.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f2b838'; g.beginPath(); g.moveTo(px - 28, 124); g.lineTo(px - 44, 130); g.lineTo(px - 28, 136); g.closePath(); g.fill();
  }
  // Vertical wicker bars + wooden top/bottom frame
  g.fillStyle = '#c49052';
  for (let x = 0; x < 256; x += 28) {
    g.fillRect(x, 16, 10, 224);
    g.strokeStyle = '#523418'; g.lineWidth = 2; g.strokeRect(x, 16, 10, 224);
  }
  g.fillStyle = '#8c5a2b'; g.fillRect(0, 0, 256, 28); g.fillRect(0, 228, 256, 28);
  g.strokeStyle = '#241726'; g.lineWidth = 5; g.strokeRect(2, 2, 252, 252);
  return c;
}

/** Canvas Paris Postal Mailbag stencil */
export function mailbagTex() {
  const [c, g] = cv(256, 256);
  g.fillStyle = '#dfd0af'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#1f4582'; g.fillRect(0, 110, 256, 10);
  g.fillStyle = '#c9332b'; g.fillRect(0, 124, 256, 10);
  g.fillStyle = '#241726'; g.font = '900 34px DejaVu Sans, sans-serif'; g.textAlign = 'center';
  g.fillText('POSTE', 128, 92);
  g.font = 'bold 26px DejaVu Sans, sans-serif';
  g.fillText('PARIS', 128, 174);
  return c;
}

/** Industrial 1870 Paris Gasworks tank (Gazomètre) riveted iron plating */
export function gasTankTex() {
  const [c, g] = cv(512, 512);
  g.fillStyle = '#47615e'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#263634'; g.lineWidth = 4;
  for (let y = 0; y < 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let x = 0; x < 512; x += 85) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  // Bold vintage yellow stencil: GAZ DE PARIS
  g.fillStyle = '#243030'; g.fillRect(46, 190, 420, 126);
  g.strokeStyle = '#e8c454'; g.lineWidth = 6; g.strokeRect(54, 198, 404, 110);
  g.fillStyle = '#ffd859'; g.font = '900 54px DejaVu Sans, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('GAZ • PARIS', 256, 254);
  return c;
}

/** Red-and-white striped military road barricade plank */
export function barricadeTex() {
  const [c, g] = cv(512, 128);
  g.fillStyle = '#f2ead4'; g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#c42d2b';
  for (let x = -128; x < 640; x += 96) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 48, 0); g.lineTo(x + 96, 128); g.lineTo(x + 48, 128); g.closePath(); g.fill();
  }
  g.strokeStyle = '#241726'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 120);
  return c;
}

/** Muddy siege earthworks & sandbags */
export function earthTex(seed = 12) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#6e5a44'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = hsl(30 + r() * 14, 28, 28 + r() * 18, 0.55);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 16 + r() * 44, 10 + r() * 24, r() * 3, 0, 7); g.fill();
  }
  return c;
}

/** Lush French provincial countryside meadow grass */
export function meadowGrass(seed = 15) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#659448'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 130; i++) {
    g.fillStyle = hsl(86 + r() * 26, 42, 34 + r() * 18, 0.52);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 22 + r() * 52, 14 + r() * 30, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 900; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(82 + r() * 30, 48, 30 + r() * 22, 0.78); g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 6 - r() * 8); g.stroke();
  }
  return c;
}

/** Warm mahogany studio workbench wood grain */
export function woodBench(seed = 19) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#73482c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6; i++) {
    const w = 512 / 6;
    g.fillStyle = hsl(24, 44, 27 + r() * 8); g.fillRect(i * w, 0, w - 2, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = 'rgba(38,20,10,0.35)'; g.lineWidth = 2;
      const x = i * w + 6 + r() * (w - 12);
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 4, 170, x - 4, 340, x, 512); g.stroke();
    }
  }
  return c;
}

/** Giant 1870 printed newspaper dispatch board photographed onto microfilm */
export function dispatchBoardTex() {
  const [c, g] = cv(1024, 768);
  g.fillStyle = '#f6ecd4'; g.fillRect(0, 0, 1024, 768);
  g.strokeStyle = '#241726'; g.lineWidth = 14; g.strokeRect(14, 14, 996, 740);
  g.fillStyle = '#1f293b'; g.fillRect(36, 36, 952, 92);
  g.fillStyle = '#ffd859'; g.font = '900 50px DejaVu Serif, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('DÉPÊCHES DE PARIS • 1870', 512, 82);
  // 4 dense columns of printed messages (visualizing thousands of dispatches!)
  for (let col = 0; col < 4; col++) {
    const x0 = 52 + col * 236;
    g.fillStyle = '#8a2d2b'; g.fillRect(x0, 152, 206, 26);
    g.fillStyle = '#fff9e6'; g.font = 'bold 18px DejaVu Sans, sans-serif';
    g.fillText(`LETTRE #${1040 + col * 250}`, x0 + 103, 166);
    g.fillStyle = '#2c2624';
    for (let row = 0; row < 20; row++) {
      const y = 194 + row * 26;
      const w = (row % 5 === 4) ? 128 : 204;
      g.fillRect(x0, y, w, 10);
    }
  }
  return c;
}

/** Translucent golden-amber 1870 microfilm strip ("pellicule") packed with tiny miniaturized pages */
export function microfilmTex() {
  const [c, g] = cv(512, 320);
  // Warm sepia/amber collodion film sheen
  const gr = g.createLinearGradient(0, 0, 512, 320);
  gr.addColorStop(0, '#ffe89e'); gr.addColorStop(0.5, '#f2c15a'); gr.addColorStop(1, '#d99938');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 320);
  g.strokeStyle = '#3b2412'; g.lineWidth = 12; g.strokeRect(6, 6, 500, 308);
  // Film sprocket notches along top & bottom edges
  g.fillStyle = '#3b2412';
  for (let x = 22; x < 490; x += 38) {
    g.fillRect(x, 16, 20, 14); g.fillRect(x, 290, 20, 14);
  }
  // 16 tiny high-contrast miniaturized newspaper/letter pages inside the tiny film!
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 6; col++) {
      const px = 28 + col * 78, py = 46 + r * 78;
      g.fillStyle = '#fff8e2'; g.fillRect(px, py, 66, 64);
      g.strokeStyle = '#3b2412'; g.lineWidth = 3; g.strokeRect(px, py, 66, 64);
      g.fillStyle = '#2a1d18';
      for (let ln = 0; ln < 6; ln++) g.fillRect(px + 6, py + 8 + ln * 9, ln === 5 ? 34 : 54, 4);
    }
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
