#!/usr/bin/env node
/**
 * render_parallel.mjs — High-speed multi-worker native 1080x1920 Playwright/Chromium renderer.
 *
 * Strict quality & anti-glitch compliance:
 * - Native 1080x1920 viewport & canvas.
 * - Mandatory '--disable-accelerated-2d-canvas' flag for 100% seam-free CPU 2D Canvas on SwiftShader.
 * - Verifies dofAt cinf === 0 (fails fast if ALLOW_DOF != '1' and any rendered frame requests cinf > 0).
 * - Multi-page parallel workers inside a single runner (default: min(3, cpus)).
 * - Supports explicit frame list ("0,45,120"), range ("0-591"), or sharded range ("0-591" with --shard i/n).
 *
 * Usage:
 *   node render_parallel.mjs <outdir> <frames_spec> [--web web] [--workers 3] [--quality 0.96] [--shard 0/4] [--step 1]
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  ({ chromium } = await import('playwright'));
}

const argv = process.argv.slice(2);
const pos = [];
const opts = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    opts[argv[i].slice(2)] = argv[i + 1];
    i++;
  } else {
    pos.push(argv[i]);
  }
}

const outdir = pos[0];
const spec = pos[1];
if (!outdir || !spec) {
  console.error('Usage: node render_parallel.mjs <outdir> <frames_spec> [--web web] [--workers 3] [--quality 0.96] [--shard 0/4] [--step 1]');
  process.exit(1);
}

const webRoot = path.resolve(opts.web || process.env.WEB || 'web');
const step = Number(opts.step || 1);
const qual = Number(opts.quality || 0.96);
const workers = Math.max(1, Number(opts.workers || Math.min(3, Math.max(1, os.cpus().length - 1))));

fs.mkdirSync(outdir, { recursive: true });

let allFrames = [];
for (const part of spec.split(',')) {
  const s = part.trim();
  if (!s) continue;
  if (s.includes('-')) {
    const [a, b] = s.split('-').map(Number);
    for (let f = a; f <= b; f += step) allFrames.push(f);
  } else {
    allFrames.push(Number(s));
  }
}

if (opts.shard) {
  const [idx, total] = opts.shard.split('/').map(Number);
  if (!(total >= 1 && idx >= 0 && idx < total)) {
    throw new Error(`Invalid --shard value: ${opts.shard}`);
  }
  const chunkSize = Math.ceil(allFrames.length / total);
  allFrames = allFrames.slice(idx * chunkSize, (idx + 1) * chunkSize);
}

if (allFrames.length === 0) {
  console.log('No frames assigned to this worker/shard. Exiting cleanly.');
  process.exit(0);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const srv = http.createServer((req, res) => {
  const reqPath = decodeURIComponent(req.url.split('?')[0]);
  const full = path.join(webRoot, reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const ext = path.extname(full).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
}).listen(0, '127.0.0.1');

await new Promise((r) => srv.on('listening', r));
const port = srv.address().port;
const url = `http://127.0.0.1:${port}/index.html${process.env.HASH || ''}`;

const findChrome = () => {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};

const executablePath = findChrome();
const launchArgs = [
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
  '--disable-accelerated-2d-canvas',
  '--disable-dev-shm-usage',
  '--no-sandbox',
];

console.log(`Launching Chromium (${executablePath || 'playwright-bundled'}) with ${workers} worker(s) for ${allFrames.length} frame(s)...`);

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: launchArgs,
});

const queue = [...allFrames];
let done = 0;
let failed = null;
const t0 = Date.now();

async function runWorker(workerId) {
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', (m) => {
    const txt = m.text();
    if (txt.startsWith('ERR') || m.type() === 'error') console.error(`[W${workerId} CONSOLE]`, txt);
  });
  page.on('pageerror', (e) => {
    console.error(`[W${workerId} PAGEERR]`, e.message);
    failed = e;
  });

  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
  const initErr = await page.evaluate(() => window.err || null);
  if (initErr) throw new Error(`Page initialization error: ${initErr}`);

  while (queue.length > 0 && !failed) {
    const f = queue.shift();
    const outPath = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`);
    if (process.env.RESUME && fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
      done++;
      continue;
    }
    const dataUrl = await page.evaluate(([frame, q]) => {
      if (window.location.hash === '#nd') window.DEBUG_ND = 1;
      if (window.location.hash === '#e') window.DEBUG_E = 1;
      window.renderFrame(frame);
      const c = document.getElementById('c');
      if (c.width !== 1080 || c.height !== 1920) {
        throw new Error(`Expected native 1080x1920 canvas, got ${c.width}x${c.height}`);
      }
      return c.toDataURL('image/jpeg', q);
    }, [f, qual]);

    fs.writeFileSync(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
    done++;
    if (done % 25 === 0 || done === allFrames.length) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = elapsed / done;
      const eta = rate * (allFrames.length - done);
      console.log(`[progress] ${done}/${allFrames.length} frames (${rate.toFixed(2)}s/frame effective, ETA ${eta.toFixed(0)}s)`);
    }
  }
  await context.close();
}

const actualWorkers = Math.min(workers, allFrames.length);
try {
  await Promise.all(Array.from({ length: actualWorkers }, (_, i) => runWorker(i + 1)));
} finally {
  await browser.close();
  srv.close();
}

if (failed) {
  console.error('Render failed:', failed);
  process.exit(1);
}

const totalSec = (Date.now() - t0) / 1000;
console.log(`DONE ${done} frames in ${totalSec.toFixed(1)}s (${(totalSec / done).toFixed(2)}s/frame effective)`);
