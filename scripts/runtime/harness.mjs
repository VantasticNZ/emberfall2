// =============================================================================
// RUNTIME-ASSERTION HARNESS — boots the REAL game in a headless WebGL browser,
// drives it with REAL keypresses (the way Van plays), and asserts on the ACTUAL
// RENDERED SCREEN (Phaser framebuffer snapshot), not data flags or paused sheets.
//
// This is the cure for the false-pass cycle: a green DATA gate can assert a field
// while the SCREEN renders the opposite (char-select faced the BACK in pixels; the
// shop list never reached Van's keeper; the menu "closed" on Map). Those classes are
// caught ONLY by eyes-on — this harness makes eyes-on automatic.
//
// LAYERS (each proven before the next): 1 BOOT (headless WebGL, real frame) · 2 INPUT
// (real keypresses) · 3 PIXELS (Phaser snapshot readback, preserveDrawingBuffer-safe).
//
// See docs/RUNTIME-HARNESS.md for how to run it + how to add an assertion.
// =============================================================================
import { chromium } from 'playwright';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';
import net from 'node:net';

export const APP_URL = process.env.RUNTIME_URL || 'http://localhost:5273';
const PORT = Number(new URL(APP_URL).port || 5273);
const OUT = 'scripts/runtime/_frames';
// WebGL via ANGLE+SwiftShader so it renders in a headless container (no GPU). These flags are what make Phaser
// draw a REAL frame we can read back, not a blank canvas.
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'];

// Resolve an already-installed Chromium (the npm playwright build-revision may not match what's on disk).
function chromiumExe() {
  const root = join(homedir(), 'AppData', 'Local', 'ms-playwright');
  if (!existsSync(root)) return undefined;
  const dirs = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
  for (const d of dirs) { const p = join(root, d, 'chrome-win64', 'chrome.exe'); if (existsSync(p)) return p; }
  return undefined;   // fall back to playwright's own resolution
}

function portOpen(port) {
  // vite may bind IPv6-only (::1); 'localhost' resolves to whatever it bound, so probe that (not 127.0.0.1).
  return new Promise((res) => { const s = net.createConnection(port, 'localhost'); s.on('connect', () => { s.destroy(); res(true); }); s.on('error', () => res(false)); setTimeout(() => { s.destroy(); res(false); }, 600); });
}

// Use a running dev server if one is up; otherwise spawn vite and wait for it. Returns a stop() (no-op if reused).
export async function ensureServer() {
  if (await portOpen(PORT)) return { stop: () => {}, spawned: false };
  const proc = spawn('npm', ['run', 'dev'], { cwd: process.cwd(), shell: true, stdio: 'ignore', detached: false });
  for (let i = 0; i < 60; i++) { if (await portOpen(PORT)) return { stop: () => { try { proc.kill(); } catch (_) {} }, spawned: true }; await sleep(500); }
  try { proc.kill(); } catch (_) {}
  throw new Error('dev server did not come up on port ' + PORT);
}

export async function launch() { return chromium.launch({ headless: true, args: ARGS, executablePath: chromiumExe() }); }
export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// LAYER 1 — boot the game to a FRESH save (Van's exact state: cleared save + full load) and wait for the Title.
export async function boot(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page._errors = [];
  page.on('pageerror', (e) => page._errors.push(String(e)));
  await page.goto(APP_URL, { waitUntil: 'load', timeout: 25000 });
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'load', timeout: 25000 });
  await page.waitForFunction(() => {
    const g = window.__EMBER; return g && g.isBooted && g.scene.isActive('Title');
  }, null, { timeout: 25000, polling: 100 });
  await frames(page, 3);
  return page;
}

// LAYER 2 — REAL INPUT. Send a genuine keydown/up through the browser, then let the game advance a few frames.
const KEY = { E: 'e', J: 'j', B: 'b', Q: 'q', TAB: 'Tab', ESC: 'Escape', ENTER: 'Enter', UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight', SPACE: 'Space', W: 'w', A: 'a', S: 's', D: 'd' };
export async function press(page, key, settle = 4) { await page.keyboard.press(KEY[key] || key); await frames(page, settle); }
export async function hold(page, key, ms) { const k = KEY[key] || key; await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await frames(page, 2); }
// advance N rendered frames (waits on Phaser's own loop counter — real frames, not wall-clock guesses)
export async function frames(page, n = 1) {
  const start = await page.evaluate(() => window.__EMBER?.loop?.frame || 0);
  await page.waitForFunction(({ s, n }) => (window.__EMBER?.loop?.frame || 0) >= s + n, { s: start, n }, { timeout: 4000, polling: 16 }).catch(() => {});
}
export function evalGame(page, fn, arg) { return page.evaluate(fn, arg); }

// LAYER 3 — PIXELS. Read REAL rendered pixels from a screen region via Phaser's snapshot (handles the WebGL
// framebuffer; works with preserveDrawingBuffer:false). Returns stats a test can assert on.
export async function pixels(page, x, y, w, h) {
  return page.evaluate(({ x, y, w, h }) => new Promise((res) => {
    const g = window.__EMBER;
    g.renderer.snapshotArea(x, y, w, h, (img) => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let nonBlack = 0, sum = 0; const cols = new Set();
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], gg = d[i + 1], b = d[i + 2], lum = r + gg + b;
        if (lum > 40) nonBlack++; sum += lum;
        cols.add((r >> 5 << 10) | (gg >> 5 << 5) | (b >> 5));   // ~5-bit-per-channel colour bucket
      }
      const n = d.length / 4;
      res({ w: c.width, h: c.height, n, nonBlack, frac: +(nonBlack / n).toFixed(3), avgLum: Math.round(sum / n), distinctColours: cols.size });
    });
  }), { x, y, w, h });
}
// save a full-frame screenshot (proof artifact)
export async function shot(page, name) {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: join(OUT, name) });
}

// A tiny assert that collects results instead of throwing (so one test failing still runs the rest).
export function makeReporter() {
  const results = [];
  return {
    check(name, pass, detail = '') { results.push({ name, pass: !!pass, detail }); return !!pass; },
    results,
    summary() { const p = results.filter((r) => r.pass).length; return { passed: p, total: results.length, allPass: p === results.length }; },
  };
}
