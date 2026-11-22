#!/usr/bin/env node
/**
 * extract_stills.mjs — Inspects story.js to export metadata (TOTAL, SHOTS, representative still frames)
 * AND enforces strict preflight quality checks (dofAt cinf === 0 across all shots).
 *
 * Usage:
 *   node extract_stills.mjs <path/to/web/story.js> [--out stills_meta.json] [--allow-dof]
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const argv = process.argv.slice(2);
const storyPath = path.resolve(argv[0] || 'web/story.js');
const outIdx = argv.indexOf('--out');
const outPath = outIdx >= 0 ? argv[outIdx + 1] : null;
const allowDof = argv.includes('--allow-dof');

const mod = await import(pathToFileURL(storyPath).href);
const { SHOTS, TOTAL, dofAt } = mod;

if (!Array.isArray(SHOTS) || SHOTS.length === 0) {
  throw new Error(`story.js must export a non-empty SHOTS array`);
}
if (!Number.isInteger(TOTAL) || TOTAL <= 0) {
  throw new Error(`story.js must export a positive integer TOTAL`);
}

// Strict DoF audit: verify cinf === 0 across every shot (start, mid, end)
const dofViolations = [];
if (typeof dofAt === 'function') {
  for (const s of SHOTS) {
    const mid = Math.floor((s.a + s.b) / 2);
    for (const f of new Set([s.a, mid, s.b])) {
      const d = dofAt(f);
      if (d && Number(d.cinf) > 0) {
        dofViolations.push({ shot: s.id, frame: f, cinf: d.cinf });
      }
    }
  }
}

if (dofViolations.length > 0 && !allowDof) {
  console.error('STRICT QUALITY GATE FAILED: dofAt() returned cinf > 0 (must be 0 for razor-sharp frames):');
  console.error(JSON.stringify(dofViolations.slice(0, 10), null, 2));
  process.exit(2);
}

// Pick 1 representative still per shot (frame 0 for hook shot so frame-0 visual hook is audited,
// midpoint for all subsequent shots).
const stills = SHOTS.map((s, idx) => {
  const frame = idx === 0 && s.a === 0 ? 0 : Math.floor((s.a + s.b) / 2);
  return {
    index: idx + 1,
    id: s.id,
    a: s.a,
    b: s.b,
    durationSec: Number(((s.b - s.a + 1) / 30).toFixed(2)),
    frame,
    label: `S${String(idx + 1).padStart(2, '0')} ${s.id} f${String(frame).padStart(4, '0')}`,
  };
});

const meta = {
  totalFrames: TOTAL,
  durationSec: Number((TOTAL / 30).toFixed(2)),
  shotCount: SHOTS.length,
  frameList: stills.map((s) => s.frame).join(','),
  stills,
  dofClean: dofViolations.length === 0,
};

if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(meta, null, 2));
}

console.log(JSON.stringify(meta, null, 2));
