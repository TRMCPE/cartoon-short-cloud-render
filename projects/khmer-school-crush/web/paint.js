// Deterministic Canvas2D painted textures for Authentic Cambodian High School (វិទ្យាល័យខ្មែរ):
// Butter-yellow stucco walls, terracotta diamond roof tiles, concrete courtyard walkway,
// glossy muddy puddle, classroom louvered shutters, Cambodian flag, restroom sign & sugar palms.
// Strictly uses { willReadFrequently: true } on every 2D canvas context (anti-glitch locked).
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
export const texClamp = (c) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

/** Sunlit Cambodian schoolyard grass & clover patches */
export function grass(seed = 12) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5da43d'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = hsl(88 + r() * 22, 48, 36 + r() * 16, 0.5);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 22 + r() * 44, 14 + r() * 28, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 950; i++) {
    const x = r() * 512, y = r() * 512;
    g.strokeStyle = hsl(85 + r() * 25, 50, 28 + r() * 22, 0.82); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke();
  }
  return c;
}

/** Swept sandy-ochre Cambodian school courtyard earth (ទីធ្លាសាលា) */
export function courtyardSand(seed = 21) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#dfc396'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 75; i++) {
    g.fillStyle = hsl(34 + r() * 8, 42, 62 + r() * 14, 0.36);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 26 + r() * 48, 14 + r() * 26, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 320; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(255,244,220,0.45)' : 'rgba(162,122,76,0.38)';
    g.beginPath(); g.arc(r() * 512, r() * 512, 1.5 + r() * 2.4, 0, 7); g.fill();
  }
  return c;
}

/** Paved concrete block school walkway (ផ្លូវដើរកណ្តាលសាលា) */
export function schoolWalkway(seed = 33) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 128;
  g.fillStyle = '#9aa1a8'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = col * s, y = row * s;
    const L = 74 + (r() - 0.5) * 6;
    g.fillStyle = hsl(210, 8, L);
    g.fillRect(x + 3, y + 3, s - 6, s - 6);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
    g.strokeRect(x + 5, y + 5, s - 10, s - 10);
  }
  for (let i = 0; i < 160; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(80,85,92,0.22)' : 'rgba(255,255,255,0.25)';
    g.beginPath(); g.arc(r() * 512, r() * 512, 1.4 + r() * 2.2, 0, 7); g.fill();
  }
  return c;
}

/** Iconic Cambodian Butter-Yellow Stucco School Wall (#F0D678 - #E5BC5B) */
export function schoolYellowStucco(seed = 45) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#f0d472'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 85; i++) {
    g.fillStyle = hsl(44 + r() * 6, 76, 64 + r() * 12, 0.34);
    g.beginPath(); g.ellipse(r() * 512, r() * 512, 28 + r() * 54, 18 + r() * 34, r() * 3, 0, 7); g.fill();
  }
  return c;
}

/** Corridor Terrazzo / Khmer Cement Tile Floor */
export function corridorTile(seed = 52) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 128;
  g.fillStyle = '#7d4934'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const warm = (row + col) % 2 === 0;
    g.fillStyle = warm ? hsl(18, 52, 56 + r() * 4) : hsl(38, 45, 72 + r() * 4);
    g.fillRect(col * s + 3, row * s + 3, s - 6, s - 6);
  }
  return c;
}

/** Sky-Blue Louvered Cambodian School Window Shutters (បង្អួចស្លាបព្រិលពណ៌ខៀវ) */
export function blueShutterTex() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#2979bd'; g.fillRect(0, 0, 256, 512);
  g.strokeStyle = '#184e80'; g.lineWidth = 10; g.strokeRect(8, 8, 240, 496);
  for (let y = 32; y < 484; y += 22) {
    g.fillStyle = '#4ea0e6'; g.fillRect(20, y, 216, 9);
    g.fillStyle = '#1a568c'; g.fillRect(20, y + 9, 216, 6);
  }
  return c;
}

/** Terracotta-Red Cambodian School Roof Tiles (ក្បឿងក្រហមសាលារៀន) */
export function clayTileRoof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#872f1c'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32;
    g.fillStyle = hsl(13 + r() * 7, 64, 45 + r() * 9);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,224,190,0.25)'; g.fillRect(x + 6, y + 2, 5, 20);
  }
  return c;
}

/** Rich Glossy Mud Puddle Texture (ថ្លុកភក់កណ្តាលផ្លូវដើរ) */
export function mudPuddleTex(seed = 77) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.clearRect(0, 0, 512, 512);
  // Outer damp concrete soak halo
  const damp = g.createRadialGradient(256, 256, 90, 256, 256, 248);
  damp.addColorStop(0, 'rgba(74,45,24,0.98)');
  damp.addColorStop(0.72, 'rgba(92,58,32,0.92)');
  damp.addColorStop(0.90, 'rgba(98,68,44,0.45)');
  damp.addColorStop(1, 'rgba(98,68,44,0)');
  g.fillStyle = damp; g.fillRect(0, 0, 512, 512);

  // Organic scalloped cartoon mud body with dark ink-like wet rim
  g.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const rad = 188 + 18 * Math.sin(a * 3 + 0.6) + 12 * Math.cos(a * 5 - 0.4);
    const px = 256 + Math.cos(a) * rad * 1.12, py = 256 + Math.sin(a) * rad * 0.88;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  const mudG = g.createRadialGradient(236, 236, 20, 256, 256, 215);
  mudG.addColorStop(0, '#6e4526');
  mudG.addColorStop(0.65, '#4d2f18');
  mudG.addColorStop(1, '#361f0e');
  g.fillStyle = mudG; g.fill();
  g.lineWidth = 9; g.strokeStyle = '#241409'; g.stroke();

  // Glossy sky/cloud specular reflection crescents so puddle reads 100% wet & deep!
  g.fillStyle = 'rgba(215,236,255,0.42)';
  g.beginPath(); g.ellipse(205, 198, 68, 22, -0.22, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath(); g.ellipse(188, 190, 32, 9, -0.22, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(312, 292, 42, 13, -0.18, 0, Math.PI * 2); g.fill();
  void r;
  return c;
}

/** Authentic Cambodian National Flag (ទង់ជាតិកម្ពុជា — #032EA1 blue, #E00025 red, white 3-tower Angkor Wat) */
export function cambodiaFlagTex() {
  const [c, g] = cv(512, 320);
  g.fillStyle = '#032EA1'; g.fillRect(0, 0, 512, 320);
  g.fillStyle = '#E00025'; g.fillRect(0, 80, 512, 160);
  // Crisp white 3-tower Angkor Wat silhouette centered
  g.fillStyle = '#ffffff'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 3;
  // Base terraces
  g.fillRect(156, 204, 200, 16);
  g.fillRect(172, 188, 168, 18);
  g.fillRect(186, 170, 140, 20);
  // 3 lotus towers (center taller, flanked by two side towers)
  const tower = (tx, topY, w) => {
    g.beginPath();
    g.moveTo(tx - w / 2, 172);
    g.lineTo(tx - w * 0.38, topY + 26);
    g.lineTo(tx, topY);
    g.lineTo(tx + w * 0.38, topY + 26);
    g.lineTo(tx + w / 2, 172);
    g.closePath(); g.fill();
  };
  tower(210, 118, 34);
  tower(256, 98, 42);
  tower(302, 118, 34);
  return c;
}

/** Iconic Blue/White Restroom Sign above the School Washroom Door (បន្ទប់ទឹក) */
export function restroomSignTex() {
  const [c, g] = cv(512, 220);
  g.fillStyle = '#1b6ec2'; g.fillRect(0, 0, 512, 220);
  g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.strokeRect(12, 12, 488, 196);
  // Divider line
  g.fillStyle = '#ffffff'; g.fillRect(252, 34, 8, 152);
  // Male silhouette (left)
  g.beginPath(); g.arc(155, 62, 22, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.roundRect(126, 92, 58, 56, 10); g.fill();
  g.fillRect(134, 144, 17, 44); g.fillRect(159, 144, 17, 44);
  // Female silhouette (right)
  g.fillStyle = '#ffd6e7';
  g.beginPath(); g.arc(356, 62, 22, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(356, 88); g.lineTo(394, 154); g.lineTo(318, 154); g.closePath(); g.fill();
  g.fillRect(338, 150, 14, 38); g.fillRect(360, 150, 14, 38);
  return c;
}

/** Green Classroom Chalkboard with Geometry Diagrams Visible Inside Open Doors */
export function chalkboardTex() {
  const [c, g] = cv(512, 256);
  g.fillStyle = '#1e5638'; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#8c5832'; g.lineWidth = 18; g.strokeRect(9, 9, 494, 238);
  g.strokeStyle = 'rgba(255,255,255,0.68)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(60, 180); g.lineTo(150, 70); g.lineTo(210, 180); g.closePath(); g.stroke();
  for (let y = 72; y <= 172; y += 32) {
    g.beginPath(); g.moveTo(260, y); g.lineTo(440, y); g.stroke();
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

export function beam(seed = 2, base = [25, 45, 33]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 36; k++) {
    g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, 0.45); g.lineWidth = 1 + r() * 3;
    g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke();
  }
  return c;
}

export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
