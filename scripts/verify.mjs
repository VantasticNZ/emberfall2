#!/usr/bin/env node
// =============================================================================
// verify.mjs — the AUTOMATED VERIFY GATE. Exits non-zero (blocking a commit via
// the pre-commit hook) if ANY of:
//   1. a test suite fails (`npm test`);
//   2. a deed/flag id referenced in quest/economy DATA isn't in the constants
//      SSOT (orphan check — catches typos + invented synonyms);
//   3. an item id is defined-but-unlisted or listed-but-undefined, or economy
//      references an unknown item;
//   4. an art file under public/art/ has no covering entry in the ASSET LEDGER
//      (or its entry is ai_safe=no);
//   5. localStorage/sessionStorage is used outside the storage adapter.
// Run: `npm run verify`. Wired as a git pre-commit hook (see .githooks/).
// =============================================================================

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

// minimal 8-bit RGBA PNG decoder (colorType 6, non-interlaced) → { w, h, data:Buffer(RGBA) }, else null.
// Used by the L1 leg-coverage pixel gate. Same unfilter approach as fitcheck/furniture-whole.test.mjs.
function decodeRGBA(file) {
  const buf = readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  let off = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8); const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; il = data[12]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bd !== 8 || ct !== 6 || il !== 0) return null;
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * 4; const out = Buffer.alloc(w * h * 4);
  const cur = Buffer.alloc(stride), prev = Buffer.alloc(stride); let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++]; cur.fill(0);
    for (let x = 0; x < stride; x++) {
      const rb = raw[p++], a = x >= 4 ? cur[x - 4] : 0, b = prev[x], c = x >= 4 ? prev[x - 4] : 0;
      let v = rb;
      if (f === 1) v = rb + a; else if (f === 2) v = rb + b; else if (f === 3) v = rb + ((a + b) >> 1);
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = rb + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      cur[x] = v & 0xff;
    }
    cur.copy(out, y * stride); cur.copy(prev);
  }
  return { w, h, data: out };
}

import { DEEDS } from '../src/constants/deeds.js';
import { TOOLS, SHARDS, SKILLS, FACTIONS } from '../src/constants/flags.js';
import { ITEM_IDS } from '../src/constants/items.js';
import { QUESTS } from '../src/data/quests/index.js';
import { ITEMS } from '../src/data/items/index.js';
import { SHOPS, JOBS } from '../src/data/economy.js';
import { availableStock, buyPrice } from '../src/systems/Economy.js';
import { item as itemDef } from '../src/data/items/index.js';
import { buildingDeed } from '../src/data/buildingDeeds.js';
import { REGIONS, TILE } from '../src/data/worldmap.js';
import { PARTS, DIR_ROW, ANIMS, ONESHOT, PUNCH_FRAMES } from '../src/data/assets.js';
import { LOCATION_CLAIMS, DEED_TIMING } from '../src/data/quests/greenhollow.js';
import { PROPS, solidBox } from '../src/data/assets.js';
import { TERRAIN } from '../src/data/terrainTiles.js';
import { OPAQUE_BOUNDS } from '../src/data/opaqueBounds.js';
import { IX_CLASS } from '../src/data/interactionClasses.js';
import { GATES, TEASES, ABILITY_GATES } from '../src/data/gating.js';
import { ENTRANCES } from '../src/data/entrances.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const fail = (m) => fails.push(m);
const ok = (m) => console.log('  ✓ ' + m);
const warn = (m) => console.log('  ⚠ ' + m);
console.log('verify.mjs — quality + consistency gate\n');

// --- helper: recursively collect deed-namespace references from data ---------
function collectDeeds(root) {
  const found = new Set();
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    for (const [k, v] of Object.entries(o)) {
      if (k === 'deed' && typeof v === 'string') found.add(v);
      else if ((k === 'deeds' || k === 'notDeeds') && Array.isArray(v)) v.forEach((x) => typeof x === 'string' && found.add(x));
      else walk(v);
    }
  };
  walk(root);
  return found;
}

// 1) TESTS ---------------------------------------------------------------------
try {
  execSync('npm test', { cwd: ROOT, stdio: 'pipe' });
  ok('all test suites pass (npm test)');
} catch (e) {
  const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || e.message);
  fail('a test suite FAILED — tail:\n' + out.trim().split('\n').slice(-10).map((l) => '      ' + l).join('\n'));
}

// 2) ORPHAN — deed/flag ids referenced in data must exist in the SSOT ----------
const validDeed = new Set([
  ...Object.values(DEEDS), ...Object.values(TOOLS), ...Object.values(SHARDS),
  ...Object.values(SKILLS), ...Object.values(FACTIONS),
]);
const referenced = new Set([...collectDeeds(QUESTS), ...collectDeeds(SHOPS), ...collectDeeds(JOBS)]);
const orphans = [...referenced].filter((d) => !validDeed.has(d)).sort();
if (orphans.length) fail(`orphan deed/flag id(s) referenced in data but NOT in the constants SSOT: ${orphans.join(', ')}`);
else ok(`orphan check: all ${referenced.size} referenced deed/flag ids are in the SSOT (${validDeed.size} known)`);
const unused = [...validDeed].filter((d) => !referenced.has(d));
if (unused.length) warn(`${unused.length} SSOT id(s) not seen in scanned data (ok if recorded at runtime / reserved)`);

// 3) ITEMS — defined <-> SSOT <-> economy references ---------------------------
const defined = new Set(ITEMS.map((i) => i.id));
const ssotItems = new Set(Object.values(ITEM_IDS));
for (const id of defined) if (!ssotItems.has(id)) fail(`item '${id}' is defined in data but missing from ITEM_IDS SSOT`);
for (const id of ssotItems) if (!defined.has(id)) fail(`ITEM_IDS lists '${id}' but no such item is defined`);
const itemRefs = new Set();
SHOPS.forEach((s) => (s.stock || []).forEach((e) => e.item && itemRefs.add(e.item)));
JOBS.forEach((j) => Object.keys(j.items || {}).forEach((k) => itemRefs.add(k)));
for (const id of itemRefs) if (!ssotItems.has(id)) fail(`economy references item '${id}' not in ITEM_IDS`);
if (!fails.some((f) => f.includes('item'))) ok(`items: ${defined.size} defined == SSOT; ${itemRefs.size} economy refs all valid`);

// 4) LICENCE — every public/art file covered by the ASSET LEDGER ---------------
const ledgerMd = readFileSync(join(ROOT, 'docs/ASSET-LEDGER.md'), 'utf8');
const ledger = [];
const inBlock = ledgerMd.split('```ledger')[1]?.split('```')[0] || '';
for (const line of inBlock.split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length >= 5 && cells[0].startsWith('public/')) ledger.push({ prefix: cells[0], aiSafe: cells[3].toLowerCase() });
}
const allArt = [];
const walkFs = (d) => {
  if (!existsSync(d)) return;
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walkFs(p);
    else allArt.push(p.slice(ROOT.length + 1).split('\\').join('/'));
  }
};
walkFs(join(ROOT, 'public/art'));
walkFs(join(ROOT, 'public/audio'));     // shipped audio is a licensed asset too
let artOk = true;
for (const f of allArt) {
  const entry = ledger.find((l) => f.startsWith(l.prefix));
  if (!entry) { fail(`asset file has NO asset-ledger entry: ${f}`); artOk = false; }
  else if (entry.aiSafe !== 'yes') { fail(`asset file under a NON-ai-safe ledger entry: ${f}`); artOk = false; }
}
if (artOk) ok(`licence: all ${allArt.length} public asset files covered by ${ledger.length} ai-safe ledger entries`);

// SHIP-GATE — no-unverified-assets-at-ship. Parses the ```unverified block (assets used at LOCAL/friends
// scope but with licence DEBT). INFORMATIONAL by default (reports count + files); HARD-FAILS when a release
// flag is set (`SHIP=true npm run verify`) — every UNVERIFIED asset must then be source-verified (moved into
// the `ledger` block) or swapped to a CC0 candidate (DEFERRED's music list).
{
  const unvBlock = ledgerMd.split('```unverified')[1]?.split('```')[0] || '';
  const unv = unvBlock.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('public/')).map((l) => l.split('|')[0].trim());
  const ship = process.env.SHIP === 'true' || process.env.SHIP === '1';
  const missing = unv.filter((f) => !existsSync(join(ROOT, f)));   // listed-but-absent = stale debt entry
  if (unv.length === 0) ok('no-unverified-assets-at-ship: 0 licence-unverified assets — clean to ship');
  else if (ship) fail(`SHIP=true but ${unv.length} LICENCE-UNVERIFIED asset(s) remain — verify the source or swap to a CC0 candidate before any release beyond local/friends:${unv.map((f) => '\n      ' + f).join('')}`);
  else { warn(`no-unverified-assets-at-ship: ${unv.length} licence-unverified asset(s) shipping at LOCAL/friends scope (HARD-FAILS at SHIP=true): ${unv.map((f) => f.split('/').pop()).join(', ')}`); if (missing.length) warn(`  (${missing.length} unverified entr(y/ies) point at a missing file: ${missing.join(', ')})`); }
}

// 5) STORAGE — no localStorage/sessionStorage outside the storage adapter ------
const srcDir = join(ROOT, 'src');
const offenders = [];
(function walkSrc(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walkSrc(p);
    else if (/\.(m?js)$/.test(name)) {
      const rel = p.slice(ROOT.length + 1).split('\\').join('/');
      if (rel === 'src/systems/storage.js') continue;
      const txt = readFileSync(p, 'utf8');
      if (/\b(localStorage|sessionStorage)\b/.test(txt)) offenders.push(rel);
    }
  }
})(srcDir);
if (offenders.length) fail(`localStorage/sessionStorage used outside the storage adapter: ${offenders.join(', ')}`);
else ok('storage: localStorage/sessionStorage only in src/systems/storage.js');

// 6) CONSISTENCY — magic numbers that bypass the standards SSOT (best-effort) ---
// Flags a bare interaction radius literal (use INTERACTION_RADIUS, or a derived
// expression with a reason) and bare tile-size math (use TILE). Constant-derived
// expressions like `INTERACTION_RADIUS * 1.5` and `t * TILE` are fine.
const magic = [];
(function walkLint(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { walkLint(p); continue; }
    if (!/\.(m?js)$/.test(name)) continue;
    const rel = p.slice(ROOT.length + 1).split('\\').join('/');
    if (rel === 'src/constants/standards.js' || rel === 'src/data/assets.js') continue; // the SSOT homes
    if (rel.includes('/fitcheck/')) continue;   // Tiled-map fixtures are literal-px map DATA (a .tmj), not game code
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      if (/\bradius:\s*-?\d/.test(line)) magic.push(`${rel}:${i + 1}  bare interaction radius — use INTERACTION_RADIUS`);
      if (/(?:\*\s*32|\b32\s*\*)\b/.test(line)) magic.push(`${rel}:${i + 1}  bare tile size 32 — use TILE`);
    });
  }
})(srcDir);
if (magic.length) fail('magic numbers bypassing the standards SSOT:\n' + magic.map((m) => '      ' + m).join('\n'));
else ok('consistency: no bare interaction-radius / tile-size literals bypass the SSOT');

// =============================================================================
// WORLD-DESIGN [OBJECTIVE] GATES — the captured QUALITY-BIBLE 2.6 / WORLD-STRUCTURE
// §2.4/2.5 rules, now SELF-ENFORCED against region/world DATA. A drifting build FAILS
// here and can't commit. Each names the offending area so it's actionable.
// =============================================================================
const tile = (px) => Math.round(px / TILE);

// 7) NO SOFT-LOCKS (strict) — the gating DAG: every key obtainable, no cycle, no
//    key-behind-itself, every tease pays off (WORLD-STRUCTURE §2.5 "clear eventual key").
{
  const issues = [];
  const allKeys = new Set();
  GATES.forEach((g) => { g.requires.forEach((k) => allKeys.add(k)); g.grants.forEach((k) => allKeys.add(k)); });
  TEASES.forEach((t) => allKeys.add(t.key));
  const badKeys = [...allKeys].filter((k) => !validDeed.has(k));
  if (badKeys.length) issues.push(`non-SSOT gating key id(s): ${badKeys.join(', ')}`);
  const grantedBy = {};                                  // key -> [areas granting it]
  GATES.forEach((g) => g.grants.forEach((k) => (grantedBy[k] ||= []).push(g.area)));
  GATES.forEach((g) => g.requires.forEach((k) => {
    if (!grantedBy[k]) issues.push(`area '${g.area}' requires '${k}' that NO area grants — unobtainable (SOFT-LOCK)`);
    if (g.grants.includes(k)) issues.push(`area '${g.area}' requires '${k}' it also grants — locked behind itself`);
  }));
  if (!GATES.some((g) => g.requires.length === 0)) issues.push('NO start area (every area gated → world unreachable)');
  TEASES.forEach((t) => { if (!grantedBy[t.key]) issues.push(`tease '${t.id}' (${t.where}) keyed on '${t.key}' that NO area grants — orphan tease (never pays off)`); });
  // circular-gate check: topo-sort areas over deps (prereq area → dependent area)
  const deps = {}; GATES.forEach((g) => { deps[g.area] = new Set(); g.requires.forEach((k) => (grantedBy[k] || []).forEach((a) => { if (a !== g.area) deps[g.area].add(a); })); });
  const indeg = {}; GATES.forEach((g) => (indeg[g.area] = deps[g.area].size));
  const dependents = {}; GATES.forEach((g) => (dependents[g.area] = []));
  Object.entries(deps).forEach(([a, set]) => set.forEach((p) => dependents[p] && dependents[p].push(a)));
  const q = Object.keys(indeg).filter((a) => indeg[a] === 0); const order = [];
  while (q.length) { const a = q.shift(); order.push(a); (dependents[a] || []).forEach((d) => { if (--indeg[d] === 0) q.push(d); }); }
  if (order.length !== GATES.length) issues.push(`CIRCULAR GATE — topo-sort covered ${order.length}/${GATES.length} areas; a requires/grants cycle exists`);
  if (issues.length) fail('NO-SOFT-LOCK / gating violation(s):\n' + issues.map((s) => '      ' + s).join('\n'));
  else ok(`no soft-locks: ${GATES.length} gated areas + ${TEASES.length} teases — every key obtainable, acyclic, no key-behind-itself`);
}

// 7b) ABILITY-COVERAGE — VAN'S RULE: every traversal ability gates ≥1 path/area (no decorative
//     abilities). Each ability is REQUIRED somewhere = a GATES tool-requirement, a TEASE key, or an
//     ABILITY_GATES placement (the 4 tools gate the spine; cut/dash/spells/bomb gate optional secrets).
{
  const ABILITIES = ['cut', 'dash', 'lantern', 'grapple', 'hookshot', 'firefrost', 'fire', 'ice', 'wind', 'electric', 'bomb']; // walk = the trivial default (every region) — excluded
  const gated = new Set();
  const tool2ab = (k) => String(k).replace(/^tool_/, '');               // tool_lantern → lantern
  GATES.forEach((g) => g.requires.forEach((k) => gated.add(tool2ab(k))));
  TEASES.forEach((t) => gated.add(tool2ab(t.key)));
  ABILITY_GATES.forEach((a) => gated.add(a.ability));
  const missing = ABILITIES.filter((a) => !gated.has(a));
  if (missing.length) fail(`ABILITY-COVERAGE: these traversal abilities gate NOTHING (decorative — add a required gate in gating.js ABILITY_GATES): ${missing.join(', ')}`);
  else ok(`ability coverage: every traversal ability (${ABILITIES.length}) gates ≥1 path/area (GATES tools + TEASES + ${ABILITY_GATES.length} ability-gates) — no decorative abilities`);
}

// 8) CHANNELLED-NOT-OPEN — a `route:true` region must not contain a large open
//    walkable block (it'd read as open field, not a channelled route; §2.4 / Ph5b).
{
  const OPEN_SQUARE_MAX = 8;                              // no k×k all-walkable block larger than this
  const routes = REGIONS.filter((r) => r.route);
  const offenders = [];
  for (const R of routes) {
    const ox = tile(R.bounds.x), oy = tile(R.bounds.y), W = R.widthTiles, H = R.heightTiles;
    const blocked = Array.from({ length: H }, () => new Array(W).fill(false));
    const mark = (cx, cy) => { if (cy >= 0 && cy < H && cx >= 0 && cx < W) blocked[cy][cx] = true; };
    (R.colliders || []).forEach((c) => mark(tile(c.x - c.w / 2) - ox, tile(c.y - c.h / 2) - oy));
    (R.pools || []).forEach((p) => { for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) mark(p.tx + x, p.ty + y); });
    (R.props || []).filter((p) => p.solid).forEach((p) => mark(tile(p.x) - ox, tile(p.y) - oy));
    let best = 0; const dp = Array.from({ length: H }, () => new Array(W).fill(0));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (blocked[y][x]) { dp[y][x] = 0; continue; }
      dp[y][x] = (x && y) ? Math.min(dp[y - 1][x], dp[y][x - 1], dp[y - 1][x - 1]) + 1 : 1;
      if (dp[y][x] > best) best = dp[y][x];
    }
    if (best > OPEN_SQUARE_MAX) offenders.push(`route '${R.key}' has an open ${best}×${best}-tile walkable block (> ${OPEN_SQUARE_MAX}) — reads as open field, not channelled`);
  }
  if (offenders.length) fail('CHANNELLED-NOT-OPEN violation(s):\n' + offenders.map((s) => '      ' + s).join('\n'));
  else ok(`channelled-not-open: ${routes.length} route region(s) stay channelled (no open block > ${OPEN_SQUARE_MAX} tiles)`);
}

// 9) DENSITY FLOOR — every screen-sized sector of every region has SOME content
//    (no empty/useless terrain; §2.4 density floor per sector).
{
  const SEC = 24;                                         // ~a screen-width of tiles
  const empties = [];
  for (const R of REGIONS) {
    const rox = tile(R.bounds.x), roy = tile(R.bounds.y), rw = R.widthTiles || tile(R.bounds.w), rh = R.heightTiles || tile(R.bounds.h);
    const ncx = Math.ceil(rw / SEC), ncy = Math.ceil(rh / SEC);
    const sec = Array.from({ length: ncy }, () => new Array(ncx).fill(0));
    const add = (px, py) => { const sx = Math.floor((tile(px) - rox) / SEC), sy = Math.floor((tile(py) - roy) / SEC); if (sx >= 0 && sx < ncx && sy >= 0 && sy < ncy) sec[sy][sx]++; };
    (R.props || []).forEach((p) => add(p.x, p.y));
    (R.npcs || []).forEach((n) => add(n.x, n.y));
    (R.chests || []).forEach((c) => add(c.x, c.y));
    (R.colliders || []).forEach((c) => add(c.x, c.y));
    (R.pools || []).forEach((p) => add(R.bounds.x + (p.tx + p.w / 2) * TILE, R.bounds.y + (p.ty + p.h / 2) * TILE));
    if (R.shrine) add(R.shrine.x, R.shrine.y);
    if (R.combat) (R.combat.enemies || []).forEach((e) => add(e.tx * TILE, e.ty * TILE));   // Marsh enemy tx are absolute world tiles
    for (let y = 0; y < ncy; y++) for (let x = 0; x < ncx; x++) if (sec[y][x] === 0) empties.push(`region '${R.key}' sector (${x},${y}) [~${SEC}-tile screen] is EMPTY (no prop/npc/chest/feature)`);
  }
  if (empties.length) fail('DENSITY-FLOOR violation(s):\n' + empties.map((s) => '      ' + s).join('\n'));
  else ok(`density floor: every ~${SEC}-tile sector across ${REGIONS.length} regions has content`);
}

// 10) COLLISION-MATCHES-VISUAL-MASS — a region with non-solid solid-mass props
//     (trees/buildings you'd expect to block) MUST have colliders, else the player
//     walks straight through them (the Phase-5 bug). Solidity may be a prop flag OR
//     decoupled tile-colliders — but visual mass without EITHER is the bug.
{
  const SOLID_MASS = /tree|forge|house|fountain|fence|sign|barrel/;
  const offenders = [];
  for (const R of REGIONS) {
    const visualMass = (R.props || []).filter((p) => !p.solid && SOLID_MASS.test(p.key));
    if (visualMass.length && (R.colliders || []).length === 0) {
      const kinds = [...new Set(visualMass.map((p) => p.key))].slice(0, 3).join(', ');
      offenders.push(`region '${R.key}': ${visualMass.length} non-solid solid-mass prop(s) (${kinds}…) but NO colliders — player walks THROUGH them`);
    }
  }
  // EXTENDED (the Peaks walk-through-pines hole): in a SETTLEMENT (non-route) region, every
  // solid-MASS prop MUST be solid:true (→ a footprint collider). A non-solid tree/house/etc. in
  // an open town = walk-through (having *some* cliff colliders elsewhere doesn't cover it). Route
  // regions (route:true) are exempt — they use non-solid visuals over the contiguous channel
  // tile-colliders by design (West-Belt pattern). Signs are decorative (exempt from solidity).
  const MUST_BE_SOLID = /tree|forge|house|fountain|fence|barrel/;
  for (const R of REGIONS) {
    if (R.route) continue;
    const through = (R.props || []).filter((p) => !p.solid && MUST_BE_SOLID.test(p.key));
    if (through.length) {
      const kinds = [...new Set(through.map((p) => p.key))].slice(0, 3).join(', ');
      offenders.push(`settlement region '${R.key}': ${through.length} NON-SOLID solid-mass prop(s) (${kinds}…) — walk-through; make them solid:true`);
    }
  }
  // EXTENDED — assert PIXEL-TRUTH + PERSPECTIVE-AWARE: every solid prop's collider is derived from
  // its OPAQUE PIXELS (OPAQUE_BOUNDS), not the PNG frame. HORIZONTAL = the opaque silhouette WIDTH
  // (matches the visible left/right edges) for EVERY solid; the collider sits INSIDE the silhouette
  // (no padding overhang = no invisible wall) with its BOTTOM at the visible base. VERTICAL by class:
  // compact (rocks) cover the FULL height; buildings use a BASE GROUND BAND (walk behind the roof);
  // trees a narrow trunk band. A frame-padding collider, or a full-height-front building, FAILS here.
  const T = 3; // px tolerance
  const BUILDING = /forge|house|paneled|structure|hall|keep|cottage|tower|manor/;
  // INTERACTION-CLASS coverage: every PLACED prop/interactable asset MUST have an explicit class in
  // the SSOT (no undefined interaction behaviour — Van's consistent-rules principle).
  for (const R of REGIONS) for (const p of [...(R.props || []), ...(R.interactables || [])]) {
    if (!IX_CLASS[p.key]) offenders.push(`asset '${p.key}' (placed in '${R.key}') has NO interaction class — add it to src/data/interactionClasses.js (no undefined behaviour)`);
  }
  const seenKeys = new Set();
  for (const R of REGIONS) for (const p of (R.props || [])) {
    if (!p.solid || seenKeys.has(p.key)) continue; seenKeys.add(p.key);
    const d = PROPS[p.key]; if (!d) continue;
    const b = solidBox(p.key, d);
    if (!(b.w > 0 && b.h > 0)) { offenders.push(`solidBox('${p.key}') → degenerate collider ${b.w}×${b.h}`); continue; }
    const ob = OPAQUE_BOUNDS[p.key];
    if (!ob) continue; // no precomputed bounds (e.g. palette PNG) → frame fallback, not gate-checked
    const cL = d.width / 2 + b.offX - b.w / 2, cR = d.width / 2 + b.offX + b.w / 2;
    const cT = d.height / 2 + b.offY - b.h / 2, cB = d.height / 2 + b.offY + b.h / 2;
    const oL = ob.x0, oR = ob.x1 + 1, oT = ob.y0, oB = ob.y1 + 1;
    // (1) no padding overhang — collider may not extend beyond the opaque silhouette
    if (cL < oL - T || cR > oR + T || cT < oT - T || cB > oB + T)
      offenders.push(`'${p.key}' collider [${cL|0},${cT|0}..${cR|0},${cB|0}] OVERHANGS the opaque box [${oL},${oT}..${oR},${oB}] — frame-padding collider (invisible wall)`);
    // (2) bottom meets the visible base
    if (Math.abs(cB - oB) > T) offenders.push(`'${p.key}' collider bottom ${cB|0} ≠ opaque base ${oB} (Δ${Math.abs(cB-oB)|0}px)`);
    // (3) HORIZONTAL = the full opaque WIDTH for EVERY non-tree solid (the left/right-correct fix)
    if (!/tree/.test(p.key) && (Math.abs(cL - oL) > T || Math.abs(cR - oR) > T))
      offenders.push(`'${p.key}' collider width ≠ opaque silhouette (L/R Δ>${T}px) — would clip the sides`);
    // (4) VERTICAL: compact = full height; building = base band (NOT full-height front, so you walk behind)
    if (!/tree/.test(p.key) && !BUILDING.test(p.key)) {
      if (Math.abs(cT - oT) > T) offenders.push(`compact '${p.key}' collider top ${cT|0} ≠ opaque top ${oT} — should be solid full-height`);
    } else if (BUILDING.test(p.key)) {
      if (cT < oT + 4) offenders.push(`building '${p.key}' collider is full-height (top ${cT|0} ≈ opaque top ${oT}) — should be a BASE BAND so you walk behind the roof`);
      if (b.h < 24) offenders.push(`building '${p.key}' base band ${b.h}px too thin (tunnel risk)`);
    }
  }
  // WATER IS NOT WALKABLE (collision-rule) — the scene must add a solid collider per pond/pool, in this.solids
  // (so the player↔solids collider blocks it). The pools/ponds are region data.
  const owSrc = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/setData\('waterSolid', true\)/.test(owSrc) || !/this\.solids\.add\(wr\)/.test(owSrc)) offenders.push('WATER has no collider in _buildRegionWater — ponds/pools are walkable');
  const waterRegions = REGIONS.filter((R) => (R.pools && R.pools.length) || R.pond);
  if (!waterRegions.length) offenders.push('no region declares pond/pools — water-collision rule untested');
  if (offenders.length) fail('COLLISION-MATCHES-VISUAL-MASS violation(s):\n' + offenders.map((s) => '      ' + s).join('\n'));
  else ok(`collision matches visual mass: no walk-through solid-mass props; water solid in ${waterRegions.length} region(s) with pond/pools (not walkable)`);
}

// PROP-WHOLE — every prop must render its FULL sprite (no crop/halving — the crates/barrels/fireplace report).
// Props load as WHOLE images (AssetLoader load.image), so the declared {width,height} MUST equal the source PNG
// dims: a smaller declared frame (or a prop loaded as a cropping sub-frame) would render cut. Decode the PNG
// header per prop + assert frame == source. (Live: cottage + store + overworld decode → 0 clipped; render whole.)
{
  const offenders = [];
  const pngDims = (file) => { try { const b = readFileSync(file); return b.readUInt32BE(0) === 0x89504e47 ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null; } catch { return null; } };
  let checked = 0;
  for (const [key, d] of Object.entries(PROPS)) {
    if (!d.src) continue;
    const dim = pngDims(join(ROOT, 'public', d.src)); if (!dim) continue;
    checked++;
    if (d.width != null && d.width !== dim.w) offenders.push(`'${key}' declared width ${d.width} ≠ source ${dim.w}px (${d.src}) — frame crops the sprite`);
    if (d.height != null && d.height !== dim.h) offenders.push(`'${key}' declared height ${d.height} ≠ source ${dim.h}px (${d.src}) — frame crops the sprite (cut/halved)`);
  }
  if (offenders.length) fail('PROP-WHOLE (cropped sprites):\n' + offenders.map((s) => '      ' + s).join('\n'));
  else ok(`prop-whole: all ${checked} prop sprites render their FULL source frame (declared == source PNG; no crop/halving)`);
}

// 11) SEAM COHERENCE — adjacent regions share EXACT edge coords (no gap/overlap at a
//     seam; WORLD-STRUCTURE Level-B seam lint). Catches a mis-placed/mis-sized region.
{
  const offenders = [];
  // INTERIORS / settlements are SEPARATE enterable scenes (connected by the runtime door system, not
  // overworld seams) — they neighbour each other in the reserved far band but never abut, so they're
  // excluded from seam-coherence (validated by navGates instead, like the entrance-coherence gate).
  const rs = REGIONS.filter((R) => !R.interior).map((R) => ({ key: R.key, x0: tile(R.bounds.x), x1: tile(R.bounds.x + R.bounds.w), y0: tile(R.bounds.y), y1: tile(R.bounds.y + R.bounds.h) }));
  for (let i = 0; i < rs.length; i++) for (let j = 0; j < rs.length; j++) {
    if (i === j) continue; const a = rs[i], b = rs[j];
    const yOv = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);   // a left-of-b vertical seam
    if (yOv > 0) { const gap = b.x0 - a.x1; if (gap !== 0 && Math.abs(gap) <= 2) offenders.push(`vertical seam '${a.key}'.E(${a.x1}) ↔ '${b.key}'.W(${b.x0}) off by ${gap} tile(s) — edges don't share coords`); }
    const xOv = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);   // a above-b horizontal seam
    if (xOv > 0) { const gap = b.y0 - a.y1; if (gap !== 0 && Math.abs(gap) <= 2) offenders.push(`horizontal seam '${a.key}'.S(${a.y1}) ↔ '${b.key}'.N(${b.y0}) off by ${gap} tile(s) — edges don't share coords`); }
  }
  if (offenders.length) fail('SEAM-COHERENCE violation(s):\n' + [...new Set(offenders)].map((s) => '      ' + s).join('\n'));
  else ok(`seam coherence: all adjacent regions share exact edge coords (${rs.length} regions checked)`);
}

// 12) PROP-KEY INTEGRITY — every prop key a region references exists in the PROPS
//     manifest (complements the licence ledger, which covers the art FILES).
{
  const offenders = [];
  for (const R of REGIONS) for (const p of (R.props || [])) if (!PROPS[p.key]) offenders.push(`region '${R.key}' references prop '${p.key}' not in assets.js PROPS`);
  if (offenders.length) fail('PROP-KEY integrity:\n' + [...new Set(offenders)].map((s) => '      ' + s).join('\n'));
  else ok('prop-key integrity: all region prop keys exist in the PROPS manifest');
}

// 13) ENTRANCE COHERENCE — the modular CONNECTION MODEL (src/data/entrances.js): every
//     declared entrance must (a) HANDSHAKE with a reciprocal at the same coords + gate,
//     (b) its GATE match gating.js for the area it enters, (c) leave no region unreachable
//     from Greenhollow. Lets a region's INTERIOR be rebuilt freely while its ENTRANCES stay
//     coherent — the modular contract, machine-enforced.
{
  const issues = [];
  // INTERIORS connect via the runtime DOOR system (not the overworld entrance graph), so they are
  // excluded from the overworld entrance-coherence + reachability checks (validated by navGates instead).
  const regionKeys = new Set(REGIONS.filter((r) => !r.interior).map((r) => r.key));
  const builtEnt = ENTRANCES.filter((e) => !e.reserved);
  // id/region validity
  for (const e of ENTRANCES) {
    if (!regionKeys.has(e.region)) issues.push(`entrance from unknown region '${e.region}'`);
    if (!e.reserved && !regionKeys.has(e.to)) issues.push(`entrance '${e.region}'→'${e.to}' targets a non-built region (mark reserved:true?)`);
    if (e.gate && !validDeed.has(e.gate)) issues.push(`entrance '${e.region}'→'${e.to}' gate '${e.gate}' not in the SSOT`);
  }
  // (a) two-sided HANDSHAKE (built entrances)
  for (const e of builtEnt) {
    const recip = builtEnt.find((f) => f.region === e.to && f.to === e.region);
    if (!recip) { issues.push(`entrance '${e.region}'→'${e.to}' has NO reciprocal '${e.to}'→'${e.region}' (one-sided link)`); continue; }
    if (Math.abs(recip.at.tx - e.at.tx) > 1 || Math.abs(recip.at.ty - e.at.ty) > 1) issues.push(`entrance '${e.region}'↔'${e.to}' coords disagree ((${e.at.tx},${e.at.ty}) vs (${recip.at.tx},${recip.at.ty}))`);
    if ((e.gate || null) !== (recip.gate || null)) issues.push(`entrance '${e.region}'↔'${e.to}' gates disagree ('${e.gate}' vs '${recip.gate}')`);
  }
  // (b) GATE matches gating.js. An entrance's gate is the LINK BARRIER; it is valid if EITHER the
  //     destination area requires it, OR the link's FAR side requires it (a SYMMETRIC barrier — a
  //     gorge/chasm on a link to the open hub: you only stand on the far side if you hold the key, so
  //     the reciprocal can never soft-lock). Also: an UNGATED entrance INTO a gated area IS a hole.
  const AREA_OF = { Greenhollow: 'Greenhollow', Marsh: 'Ashen Marsh', Peaks: 'Sundered Peaks', Coast: 'Tidewreck Coast', Emberwood: 'Emberwood', Spire: 'Hollow Spire' };
  const requiresOf = (regKey) => { const a = AREA_OF[regKey]; const g = a && GATES.find((G) => G.area === a); return g ? g.requires : null; };   // null = a route (ungated)
  for (const e of ENTRANCES) {
    const reqTo = requiresOf(e.to);
    if (!e.gate) { if (reqTo && reqTo.length) issues.push(`entrance into '${e.to}' is UNGATED but gating.js requires [${reqTo.join(', ')}] — a soft-lock hole`); continue; }
    const reqBack = requiresOf(e.region);                               // the area on the OTHER (gated) side of this link
    const okHere = reqTo && reqTo.includes(e.gate);
    const okSymmetric = reqBack && reqBack.includes(e.gate);            // symmetric link-barrier to the hub
    if (!okHere && !okSymmetric) {
      if (!reqTo || reqTo.length === 0) issues.push(`entrance into '${e.to}' is gated '${e.gate}' but neither it nor the link's far side requires it (spurious gate)`);
      else issues.push(`entrance into '${e.to}' gate '${e.gate}' is not among gating.js requires [${reqTo.join(', ')}]`);
    }
  }
  // (c) REACHABILITY — undirected built-entrance graph from Greenhollow covers every built region
  const adj = {}; regionKeys.forEach((k) => (adj[k] = new Set()));
  builtEnt.forEach((e) => { if (adj[e.region]) adj[e.region].add(e.to); if (adj[e.to]) adj[e.to].add(e.region); });
  const seen = new Set(['Greenhollow']); const q = ['Greenhollow'];
  while (q.length) { const k = q.shift(); (adj[k] || new Set()).forEach((n) => { if (!seen.has(n)) { seen.add(n); q.push(n); } }); }
  for (const k of regionKeys) if (!seen.has(k)) issues.push(`region '${k}' is UNREACHABLE from Greenhollow via entrances`);
  if (issues.length) fail('ENTRANCE-COHERENCE violation(s):\n' + issues.map((s) => '      ' + s).join('\n'));
  else ok(`entrance coherence: ${builtEnt.length} built entrances handshake + gates match gating.js + all ${regionKeys.size} regions reachable from Greenhollow`);
}

// 16) DESIGNED-VS-BUILT — the running world should match the locked design (PROCESS-RETRO: "designed
//     locked but never built" went unchecked for sessions). HARD FAIL on a mislink (a door → a
//     non-existent region — the "design references something unbuilt" class). Otherwise INFORMATIONAL:
//     prints how many settlements are on the WALKABLE OVERWORLD vs still board/scene-only, so the
//     designed-vs-built gap is visible every run (and tracked in DEFERRED.md) — it can't hide.
{
  const settlements = REGIONS.filter((r) => r.settlement || (r.interior && /^(town_|vil_|dgn_|city_|lost_)/.test(r.key)));
  const allKeys = new Set(REGIONS.map((r) => r.key));
  const mislinks = [];
  for (const R of REGIONS) for (const o of (R.interactables || [])) {
    if (o.via === 'door' && o.to && o.to !== 'back' && !o.to.startsWith('__') && !allKeys.has(o.to)) mislinks.push(`${R.key} → '${o.to}' (no such region)`);
  }
  // a settlement is "on the walkable overworld" if reached by a door in an overworld region OTHER than
  // Greenhollow (the GH notice-board is fast-travel, NOT a spatial placement — exclude it).
  const owTargets = new Set();
  for (const R of REGIONS.filter((r) => !r.settlement && !r.interior && r.key !== 'Greenhollow')) for (const o of (R.interactables || [])) if (o.via === 'door') owTargets.add(o.to);
  const onWorld = settlements.filter((s) => owTargets.has(s.key)).map((s) => s.key);
  const boardOnly = settlements.filter((s) => !owTargets.has(s.key));
  if (mislinks.length) fail('DESIGNED-VS-BUILT: door(s) link a region that does not exist (mislink):\n' + mislinks.map((m) => '      ' + m).join('\n'));
  else ok(`designed-vs-built: ${settlements.length} settlements built — ${onWorld.length} on the walkable overworld (${onWorld.join(', ') || 'none'}); ${boardOnly.length} still board/scene-only (must be relocated per DEFERRED.md)`);

  // 17) NO-OVERLAPPING-SCENES — each enterable scene (settlement/interior) is a SEPARATE area; if two
  //     overlap, regionAt picks ONE → walking into one entrance lands you in the other (the thornwell→
  //     stonereach bug). Assert no two enterable scenes' bounds overlap. (Runtime-defended: door entry.)
  const scenes = REGIONS.filter((r) => r.settlement || r.interior);
  const ov = (a, b) => a.bounds.x < b.bounds.x + b.bounds.w && a.bounds.x + a.bounds.w > b.bounds.x && a.bounds.y < b.bounds.y + b.bounds.h && a.bounds.y + a.bounds.h > b.bounds.y;
  const clashes = [];
  for (let i = 0; i < scenes.length; i++) for (let j = i + 1; j < scenes.length; j++) if (ov(scenes[i], scenes[j])) clashes.push(`${scenes[i].key} ∩ ${scenes[j].key}`);
  if (clashes.length) fail('NO-OVERLAPPING-SCENES: enterable scenes overlap → an entrance lands you in the WRONG area:\n' + clashes.map((c) => '      ' + c).join('\n'));
  else ok(`no-overlapping-scenes: all ${scenes.length} enterable scenes (settlements + interiors) occupy distinct bounds — no wrong-area entry`);

  // 18) RENDERED-VS-BUILT / NO-DUPLICATE-ENTRANCES — when settlements were relocated to the overworld but
  //     the old GH notice-board doors were NOT removed, the player SEES a door-board AND the new
  //     entrances (data-correct, presentation-stale — PROCESS-RETRO). Assert no settlement is reachable
  //     via BOTH the GH board AND a relocated overworld entrance. (The M-map pins settlements from the
  //     SAME live entrance data, so map == walkable world by construction.)
  const settKeys = new Set(scenes.filter((r) => r.settlement || /^(town_|vil_|dgn_|city_|lost_)/.test(r.key)).map((r) => r.key));
  const gh = REGIONS.find((r) => r.key === 'Greenhollow');
  const ghDoors = new Set(), owDoors = new Set();
  for (const o of (gh?.interactables || [])) if (o.via === 'door' && settKeys.has(o.to)) ghDoors.add(o.to);
  for (const R of REGIONS.filter((r) => !r.settlement && !r.interior && r.key !== 'Greenhollow')) for (const o of (R.interactables || [])) if (o.via === 'door' && settKeys.has(o.to)) owDoors.add(o.to);
  const dupes = [...ghDoors].filter((k) => owDoors.has(k));
  if (dupes.length) fail('RENDERED-VS-BUILT (duplicate entrances): settlement(s) reachable via BOTH the GH board AND a relocated overworld entrance — remove the stale board door so the player sees ONE world, not a door-board + new entrances:\n' + dupes.map((d) => '      ' + d).join('\n'));
  else ok(`rendered-vs-built: no duplicate entrances (GH-board fast-travel: ${ghDoors.size}; relocated overworld: ${owDoors.size}) — the visible presentation matches the built world; the M-map pins from the same live entrance data`);

  // 19) SEAMLESS-OVERWORLD (LOCKED, Van option B) — settlements (town/village/city) must be WALK-THROUGH
  //     overworld TERRAIN, not separate enter-scenes. A town with an overworld ENTER-door is still a scene.
  //     Tracks the conversion + GUARDS regression (a town marked converted must keep NO enter-door). Target:
  //     every town/village/city inline (0 enter-doors). Dungeons (dgn_*) + secrets + interiors stay scenes.
  const SEAMLESS_DONE = ['town_mirefen'];   // converted to inline overworld terrain — GROW as towns convert
  const townKeys = REGIONS.filter((r) => /^(town_|vil_|city_|lost_)/.test(r.key)).map((r) => r.key);
  const enterDoorTo = new Set();
  for (const R of REGIONS.filter((r) => !r.settlement && !r.interior)) for (const o of (R.interactables || [])) if (o.via === 'door' && /^(town_|vil_|city_|lost_)/.test(o.to || '')) enterDoorTo.add(o.to);
  const regressed = SEAMLESS_DONE.filter((k) => enterDoorTo.has(k));
  const stillScene = townKeys.filter((k) => enterDoorTo.has(k));
  if (regressed.length) fail('SEAMLESS-OVERWORLD regression: town(s) marked CONVERTED still have an overworld enter-door (must be inline walk-through terrain, no door):\n' + regressed.map((r) => '      ' + r).join('\n'));
  else ok(`seamless-overworld: ${townKeys.length - stillScene.length}/${townKeys.length} town/village/city are inline walk-through (no enter-door); ${stillScene.length} still enter-scenes (DEFERRED → target 0): ${stillScene.join(', ') || 'none'}`);

  // 20) NO-FLOATING-DOORS — a door must NEVER be a free-standing prop_door on open ground (Van's bug:
  //     orphaned settlement doors + building doors rendered on terrain). In an OVERWORLD region, an
  //     entrance door must EITHER carry a `marker` (a cave-mouth / waypost — its own visual) OR be a
  //     BUILDING entrance (a building prop within ~5 tiles → the building's own door is the cue, render
  //     no sprite). A marker-less door with no building near it = an orphaned/floating door → FAIL.
  const T2 = TILE, R5 = 5 * T2, R7 = 7 * T2;
  const floaters = [];
  for (const R of REGIONS.filter((r) => !r.interior && !r.settlement)) {
    const buildings = (R.props || []).filter((p) => /house|forge|tavern|chapel|paneled|structure/.test(p.key)).map((p) => [p.x, p.y]);
    for (const o of (R.interactables || [])) {
      if (o.via !== 'door' || o.marker) continue;
      const near = buildings.some(([bx, by]) => Math.abs(bx - o.x) <= R5 && o.y - by <= R7 && by - o.y <= R5);
      if (!near) floaters.push(`${R.key} → ${o.to} @(${Math.round(o.x / T2)},${Math.round(o.y / T2)}) — no building, no marker`);
    }
  }
  if (floaters.length) fail('NO-FLOATING-DOORS: free-standing door(s) on open terrain (give it a marker or a building, or remove it):\n' + floaters.map((f) => '      ' + f).join('\n'));
  else ok('no-floating-doors: every overworld door is a building entrance (no sprite) or carries a cave/waypost marker — ZERO free-standing doors on open ground');

  // 21) DOORWAY-GEOMETRY (DOOR-SYSTEM) — every enterable building-interior has a WAY IN (a building `door`
  //     spec or a door interactable) + every door leads to a REAL interior. Catches "a building interior
  //     with no door" (an un-enterable hole) + "a door to nowhere". (The runtime CARVE correctness — the
  //     trigger sits in the inset doorway gap, footprint otherwise solid — is eyes-on + the visual check.)
  const allKeys2 = new Set(REGIONS.map((r) => r.key));
  const doorTargets = new Set();
  const badStates = [];
  const VALID_STATE = new Set(['open', 'none', 'closed', 'locked', 'broken']);
  for (const R of REGIONS) {
    for (const p of (R.props || [])) if (p.door) {
      const dd = (typeof p.door === 'string') ? { to: p.door, state: 'open' } : p.door;     // string = OPEN; object = {to,state}
      if (dd.to) doorTargets.add(dd.to);
      if (dd.state && !VALID_STATE.has(dd.state)) badStates.push(`${R.key}:${dd.to} invalid state '${dd.state}'`);
    }
    for (const o of (R.interactables || [])) if (o.via === 'door' && o.to && !o.to.startsWith('__') && o.to !== 'back') doorTargets.add(o.to);
  }
  const deadDoors = [...doorTargets].filter((t) => !allKeys2.has(t));
  // UNIFORM ENTERABILITY (must mirror OverworldScene._resolveBuildingDoor): EVERY building prop in EVERY
  // built region must resolve to an existing interior — an explicit `door`, or the default generic by key.
  const BUILDING = /^(prop_house|prop_forge|prop_tavern|prop_chapel|prop_smithy|prop_hut|prop_hall|prop_manor|prop_cottage)/;
  const resolveDoor = (p) => p.door ? (typeof p.door === 'string' ? p.door : p.door.to) : (/forge|smithy/.test(p.key) ? 'forge_generic' : 'house_generic');
  let buildingCount = 0; const unEnterable = [], noAssetDoor = [];
  const seenBuildingKeys = new Set();
  for (const R of REGIONS.filter((r) => !r.interior)) for (const p of (R.props || [])) if (BUILDING.test(p.key)) {
    buildingCount++;
    const to = resolveDoor(p);
    if (!allKeys2.has(to)) unEnterable.push(`${R.key}:${p.key} → ${to} (no interior)`);
    // ASSET-OWNED DOORWAY (Van's governing principle): the doorway is a PROPERTY OF THE ASSET — every
    // enterable building asset MUST declare `doorway` (the painted door's offset) in PROPS, so the door
    // system derives it automatically (no per-building code). A building asset without one = a regression.
    if (!seenBuildingKeys.has(p.key)) { seenBuildingKeys.add(p.key); if (!(PROPS[p.key] && PROPS[p.key].doorway)) noAssetDoor.push(p.key); }
  }
  // VALID EXITS: every interior must have a 'back' exit door (you can always leave → no trapped/void room).
  const noExit = REGIONS.filter((r) => r.interior).filter((r) => !(r.interactables || []).some((o) => o.via === 'door' && o.to === 'back')).map((r) => r.key);
  // NON-EMPTY INTERIOR (no black-floor room): every interior's terrain `set` must be a REAL TERRAIN set
  // (the 'wood'→black bug) and it must declare a floor patch.
  const badFloor = [];
  for (const r of REGIONS.filter((x) => x.interior)) {
    const patches = (r.terrain && r.terrain.patches) || [];
    if (!patches.length) { badFloor.push(`${r.key} (no floor patch — black room)`); continue; }
    for (const pt of patches) if (pt.set && !TERRAIN.sets[pt.set]) badFloor.push(`${r.key} floor set '${pt.set}' is not a real terrain set (→ black floor)`);
  }
  if (deadDoors.length || badStates.length || unEnterable.length || noAssetDoor.length || noExit.length || badFloor.length) {
    fail('DOORWAY-GEOMETRY: ' + [
      ...deadDoors.map((d) => 'door → ' + d + ' (no such interior)'), ...badStates,
      ...unEnterable.map((u) => u + ' — UN-ENTERABLE building'),
      ...noAssetDoor.map((k) => `asset '${k}' has NO doorway declared (asset-owned-doorway principle)`),
      ...noExit.map((k) => `interior '${k}' has NO 'back' exit (would trap the player)`),
      ...badFloor,
    ].map((s) => '\n      ' + s).join(''));
  } else ok(`doorway-geometry: ${doorTargets.size} door targets resolve; ALL ${buildingCount} building props enterable; every building ASSET declares its doorway (${seenBuildingKeys.size} assets); every interior has a 'back' exit + a real floor (no black room); door states valid`);
}

// 22) FURNITURE NON-COLLISION (SPEC-INTERIORS R2, mechanical) — base-anchored (oy:1) furniture footprints
//     must NOT clip a wall, overlap each other, or sit in a door/stairs zone. Asserted PER-ITEM (Van's
//     interiors-test finding: split beds, items-on-items). Footprint: centred on tx, base bottom at ty+1,
//     grows UP by (h*scale) — matching the runtime base-anchor render.
{
  const FURN = /^prop_(bed|table|dresser|fireplace|cabinet|crate|barrel|anvil|altar|counter|shelf|fence|stool|bench)/;
  const viol = [];
  for (const R of REGIONS.filter((r) => r.interior && r.widthTiles)) {
    const W = R.widthTiles, H = R.heightTiles;
    // WALL-BACKED types (R6) must touch a perimeter wall; CENTRAL-OK types may float mid-room.
    const WALLBACK = /^(bed|dresser|fireplace|cabinet|shelf)$/;   // tall storage + bed + hearth back a wall; anvil/table/bench/stool/crate/barrel/altar may be central
    const items = (R.props || []).filter((p) => FURN.test(p.key) && PROPS[p.key]).map((p) => {
      const d = PROPS[p.key], sc = p.scale || 1, wT = d.width * sc / TILE, hT = d.height * sc / TILE;
      const tx = Math.round((p.x - R.bounds.x - TILE / 2) / TILE), ty = Math.round((p.y - R.bounds.y - TILE) / TILE);
      return { k: p.key.replace('prop_', ''), L: tx + 0.5 - wT / 2, Rr: tx + 0.5 + wT / 2, T: (ty + 1) - hT, B: ty + 1 };
    });
    // door zone = the door tile PLUS the approach tile one step toward the room interior (keep the
    // threshold/approach clear so you never catch furniture stepping in or out).
    const dz = (R.doorTiles || []).flatMap((d) => [d, { tx: d.tx, ty: d.ty + (d.ty > H / 2 ? -1 : 1) }]);
    for (const it of items) {
      // wall-clip: base-anchored furniture grows UP, so EMBEDDING into the back (top) wall is INTENDED
      // (a fireplace/headboard tucks into the wall) — only flag a top poke fully THROUGH (T<0.2); the
      // sides + bottom must stay inside the room.
      if (it.L < 1 || it.Rr > W - 1 || it.T < 0.2 || it.B > H - 1) viol.push(`${R.key}: ${it.k} clips a wall`);
      for (const z of dz) if (it.L < z.tx + 1 && it.Rr > z.tx && it.T < z.ty + 1 && it.B > z.ty) viol.push(`${R.key}: ${it.k} blocks the door/approach zone`);
      // R6 ROOM-COMPOSITION: tall storage / bed / fireplace must BACK a wall (top edge near the back wall,
      // or flush to a side/bottom wall) — never floating mid-room.
      if (WALLBACK.test(it.k)) {
        const backed = it.T <= 1.6 || it.L <= 1.15 || it.Rr >= W - 1.15 || it.B >= H - 1.15;
        if (!backed) viol.push(`${R.key}: ${it.k} FLOATS mid-room (R6: tall storage/bed/fireplace must back a wall)`);
      }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.L < b.Rr - 0.05 && a.Rr > b.L + 0.05 && a.T < b.B - 0.05 && a.B > b.T + 0.05) viol.push(`${R.key}: ${a.k} overlaps ${b.k}`);
    }
  }
  if (viol.length) fail('FURNITURE-NON-COLLISION (R2+R6):' + viol.map((v) => '\n      ' + v).join(''));
  else ok(`furniture-non-collision (R2+R6): every interior's furniture is footprint-checked + composition-checked — no overlap/clip/blocked-approach, and tall storage/beds/fireplaces back a wall (nothing floats)`);
}

// 23) FENCE-CLEARANCE — a `prop_fence` must never sit ON or beside a building ENTRANCE (door tile + the 2
//     approach tiles in front). Fences straddling a doorway get disabled by the threshold-clear → a
//     part-walkthrough fence (Van's finding). Door tile derived the SAME way the scene carves it.
{
  const fviol = [];
  for (const R of REGIONS.filter((r) => !r.interior && (r.props || []).some((p) => p.key === 'prop_fence'))) {
    const doorTiles = [];
    for (const p of R.props) {
      const d = PROPS[p.key]; if (!d || !d.doorway || d.doorway.cx == null) continue;   // enterable building (asset-owned doorway)
      const sc = p.scale != null ? p.scale : 1, b = solidBox(p.key, d);
      const doorWX = p.x + d.doorway.cx * sc, feetY = p.y + (b.offY + b.h / 2) * sc;
      const dCol = Math.round((doorWX - TILE / 2) / TILE), dRow = Math.round((feetY - TILE / 2) / TILE);
      doorTiles.push([dCol, dRow]);
    }
    for (const p of R.props) {
      if (p.key !== 'prop_fence') continue;
      const ftx = Math.round((p.x - TILE / 2) / TILE), fty = Math.round((p.y - TILE / 2) / TILE);
      for (const [dx, dy] of doorTiles) for (const [ax, ay] of [[dx, dy], [dx, dy + 1], [dx, dy + 2]]) {
        if (Math.max(Math.abs(ftx - ax), Math.abs(fty - ay)) < 2) { fviol.push(`${R.key}: fence @(${ftx},${fty}) is <2 tiles from a building entrance @(${dx},${dy}) — would be part-disabled (walk-through)`); break; }
      }
    }
  }
  if (fviol.length) fail('FENCE-CLEARANCE:' + [...new Set(fviol)].map((v) => '\n      ' + v).join(''));
  else ok(`fence-clearance: every prop_fence is ≥2 tiles clear of every building entrance + approach (no part-walkthrough fence straddling a doorway)`);
}

// 24) DEED-SCHEMA (SPEC-NPCS-LIVING-WORLD §6, schema-only) — every enterable building resolves a deed
//     { owner, price, rentRate, buyable } so the post-slice property BUILD needs no retrofit.
{
  const targets = new Set();
  for (const R of REGIONS) {
    for (const p of (R.props || [])) if (p.door) targets.add(typeof p.door === 'string' ? p.door : p.door.to);
    for (const o of (R.interactables || [])) if (o.via === 'door' && o.to && !o.to.startsWith('__') && o.to !== 'back') targets.add(o.to);
  }
  const dviol = [];
  for (const t of targets) {
    if (/^(cave_|dgn_|tankard_f2|gen)/.test(t)) continue;   // dungeons/floors-2 aren't ownable homes
    const d = buildingDeed(t);
    if (!d || typeof d.owner !== 'string' || !('price' in d) || typeof d.rentRate !== 'number' || typeof d.buyable !== 'boolean') dviol.push(`${t}: invalid/absent deed schema`);
  }
  if (dviol.length) fail('DEED-SCHEMA:' + dviol.map((v) => '\n      ' + v).join(''));
  else ok(`deed-schema: every enterable building resolves a {owner,price,rentRate,buyable} deed (Fable property schema present — purchase/rent BUILD is post-slice)`);
}

// 25) KIDS-PROTECTED (hard rule) — every NPC flagged `kid` MUST be `protected: true` (unharmable +
//     untargetable). The scene also tags protected NPCs (setData('protected')) so no attack path can hit
//     them; this gate guarantees the DATA can never ship a harmable child.
{
  const kviol = []; let kids = 0;
  for (const R of REGIONS) for (const n of (R.npcs || [])) if (n.kid) { kids++; if (n.protected !== true) kviol.push(`${R.key}:${n.name || '?'} is a kid but NOT protected:true`); }
  if (kviol.length) fail('KIDS-PROTECTED:' + kviol.map((v) => '\n      ' + v).join(''));
  else ok(`kids-protected: all ${kids} kid NPC(s) are protected:true (unharmable/untargetable — hard rule)`);
}

// L1 COMPOSITION-COMPLETE (GAME-LAWS L1) — every placed character renders a COMPLETE, matched set: a body +
//   a head, no MISSING clothing, and NO cross-body-type parts. A child body must be a CLOTHED child_body_*
//   (never the bare child_body) and must NOT layer adult clothing (shirt_/pants_/shoes_, which are
//   adult-proportioned). Also covers the player presets (HERO_CHILD/HERO in OverworldScene source).
{
  const isChild = (p) => /^child_/.test(p);
  const isAdultBody = (p) => /^(body_(ivory|fem|tan|deep)|head_(ivory|fem|tan|deep))$/.test(p);
  const isAdultClothing = (p) => /^(shirt_|pants_|shoes_)/.test(p);
  const isBareChild = (p) => p === 'child_body' || p === 'child_body_tan' || p === 'child_body_brown';
  const validate = (label, parts) => {
    const out = [];
    if (!parts || !parts.length) return out;
    const hasChild = parts.some(isChild);
    const adultParts = parts.filter((p) => isAdultBody(p) || isAdultClothing(p));
    if (hasChild && adultParts.length) out.push(`${label}: child + ADULT parts on one body (${adultParts.join(', ')}) — cross-body-type`);
    else if (hasChild && parts.some(isBareChild)) out.push(`${label}: BARE child body (no clothing) — use a clothed child_body_*`);
    const hasBody = parts.some((p) => PARTS[p] && PARTS[p].slot === 'body');
    const hasHead = parts.some((p) => PARTS[p] && PARTS[p].slot === 'head');
    if (!hasBody) out.push(`${label}: no BODY part`);
    if (!hasHead) out.push(`${label}: no HEAD part`);
    return out;
  };
  const bad = [];
  for (const R of REGIONS) for (const n of (R.npcs || [])) bad.push(...validate(`${R.key}:${n.name || '?'}`, n.parts));
  // the player presets in OverworldScene source (HERO_CHILD / HERO)
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  for (const m of ow.matchAll(/const (HERO_CHILD|HERO)\s*=\s*\[([^\]]*)\]/g)) {
    const parts = m[2].split(',').map((p) => p.trim().replace(/['"]/g, '')).filter(Boolean);
    bad.push(...validate(`player:${m[1]}`, parts));
  }
  // CHARACTER-SELECT v2 presets (TitleScene BASES): every kind references a clothed-child BODY + a child HEAD,
  // and every hair is a child-fitted hair part — so no select combination can ship an L1-incomplete child.
  const ts = readFileSync(join(ROOT, 'src/scenes/TitleScene.js'), 'utf8');
  for (const m of ts.matchAll(/body:\s*'([^']+)'/g)) {
    const p = m[1]; if (!(PARTS[p] && PARTS[p].slot === 'body' && PARTS[p].childClothed)) bad.push(`select:${p} is not a clothed child body`);
  }
  for (const m of ts.matchAll(/head:\s*'([^']+)'/g)) {
    const p = m[1]; if (!(PARTS[p] && PARTS[p].slot === 'head' && /^child_/.test(p))) bad.push(`select:${p} is not a child head`);
  }
  for (const m of ts.matchAll(/hair:\s*'([^']+)'/g)) {
    const p = m[1]; if (!(PARTS[p] && PARTS[p].slot === 'hair' && PARTS[p].childSeat)) bad.push(`select:${p} is not a seated child hair`);
  }

  // GAP THE OLD GATE MISSED (it trusted the childClothed FLAG, never the pixels → a torso-only romper with
  // BARE LEGS passed). PIXEL leg-coverage on the idle AND walk sheets (WIDENED — a body clothed standing but
  // bare-legged WALKING now also fails). idle (legs together) → the central leg band must not be mostly skin;
  // walk (legs may spread) → the full-width leg band must carry real CLOTHED pixels.
  const isSkin = (r, g, b, a) => a > 32 && r > 175 && r >= g && g >= b && (r - b) > 32;   // peachy bare skin
  const legCheck = (file, mode) => {
    const img = decodeRGBA(file); if (!img) return null;   // unsupported encoding → skip, don't false-fail
    const FR = 64, col = 0, row = 2;                       // sheets: row 2 = DOWN facing, col 0 = first frame
    const at = (x, y) => { const i = ((row*FR + y) * img.w + (col*FR + x)) * 4; return [img.data[i], img.data[i+1], img.data[i+2], img.data[i+3]]; };
    let y0 = 64, y1 = 0, x0 = 64, x1 = 0;
    for (let y = 0; y < FR; y++) for (let x = 0; x < FR; x++) { const a = at(x, y)[3]; if (a > 32) { if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
    if (y1 <= y0) return `empty ${mode} DOWN frame`;
    const bh = y1 - y0, bw = x1 - x0, cx = (x0 + x1) / 2;
    const la = y0 + Math.floor(bh*0.60), lb = y0 + Math.floor(bh*0.86);   // the LEG band
    const lx = mode === 'idle' ? Math.ceil(cx - 0.30*bw) : x0;            // idle: central; walk: full width (spread legs)
    const rx = mode === 'idle' ? Math.floor(cx + 0.30*bw) : x1;
    let skin = 0, opaque = 0;
    for (let y = la; y <= lb; y++) for (let x = lx; x <= rx; x++) { const [r, g, b, a] = at(x, y); if (a <= 32) continue; opaque++; if (isSkin(r, g, b, a)) skin++; }
    // both modes: the LEG band must not be mostly bare skin (idle = central columns; walk = full width so spread
    // legs are included). bare child legs read ~60% skin; clothed legs ~0%. (clothed-pixel counts are fooled by
    // outline/shadow pixels, so the SKIN FRACTION is the discriminator for both.)
    if (opaque > 8 && skin / opaque > 0.45) return `BARE LEGS (${mode}) — ${Math.round(100*skin/opaque)}% of the leg band is skin (pantless)`;
    return null;
  };
  for (const [key, def] of Object.entries(PARTS)) {
    if (!(def.childClothed && def.layers && def.layers[0])) continue;
    const tex = def.layers[0].tex, dir = join(ROOT, 'public/art/eliza', tex);
    const idleF = join(dir, 'idle.png'), walkF = join(dir, 'walk.png');
    if (!existsSync(idleF)) { bad.push(`${key}: clothed child body texture missing (${tex}/idle.png)`); continue; }
    const e1 = legCheck(idleF, 'idle'); if (e1) bad.push(`${key}: ${e1}`);
    if (existsSync(walkF)) { const e2 = legCheck(walkF, 'walk'); if (e2) bad.push(`${key}: ${e2}`); }
  }
  // PER-FRAME SEAT (L1 seating, the kids'-hair-BOUNCE gate) — a child-fitted hair part (childSeat) must cap the
  // child head CONSISTENTLY across EVERY frame of EVERY direction. The bounce root cause was a per-DIRECTION
  // gap mismatch (up vs others) under a single offset; this decodes each baked child_hair texture + the child
  // head and asserts the crown-gap (head_top - hair_top) is (a) a CAP (hair near/above the crown) and (b) STABLE
  // — its spread across all idle+walk frames/directions ≤ 3px (a bigger spread = the hair jumps on turning).
  const topOf = (img, col, row, FR = 64) => {
    for (let y = 0; y < FR; y++) for (let x = 0; x < FR; x++) { const i = ((row*FR + y) * img.w + (col*FR + x)) * 4; if (img.data[i+3] > 32) return y; }
    return null;
  };
  const headIdle = decodeRGBA(join(ROOT, 'public/art/eliza/child_head/idle.png'));
  const headWalk = decodeRGBA(join(ROOT, 'public/art/eliza/child_head/walk.png'));
  for (const [key, def] of Object.entries(PARTS)) {
    if (!def.childSeat || !def.layers || !def.layers[0]) continue;
    const tex = def.layers[0].tex, hdir = join(ROOT, 'public/art/eliza', tex);
    const sheets = [['idle', 3, headIdle], ['walk', 8, headWalk]];
    const gaps = [];
    for (const [st, cols, head] of sheets) {
      const f = join(hdir, st + '.png'); if (!existsSync(f) || !head) continue;
      const hair = decodeRGBA(f); if (!hair) continue;
      for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
        const ht = topOf(head, c, r), pt = topOf(hair, c, r);
        if (ht == null || pt == null) continue;
        gaps.push(ht - pt);   // + = hair caps above the crown
      }
    }
    if (!gaps.length) continue;
    const mn = Math.min(...gaps), mx = Math.max(...gaps);
    if (mx - mn > 3) bad.push(`${key}: hair BOUNCES — crown-gap ranges ${mn}..${mx}px across frames/directions (spread ${mx-mn} > 3); the seat must hold every frame`);
    if (mn < -2 || mx > 8) bad.push(`${key}: hair not seated — crown-gap ${mn}..${mx}px (should cap the head ~0-4px above, every frame)`);
  }

  if (bad.length) fail('L1 COMPOSITION-COMPLETE:' + bad.map((v) => '\n      ' + v).join(''));
  else ok('composition-complete (L1): every placed character + presets are complete matched sets; clothed child bodies cover the LEGS (pixel-checked, no pantless); child hair declares a seat offset');
}

// 25a) MODIFIER-APPLIED-IN-ACTIVE-SCENE (big-head regression guard) — the game runs on OverworldScene now;
//      big-head silently stopped working because the headScale APPLICATION never moved here from RegionScene
//      (Modifiers.test only covers the modifier LOGIC, never scene application). Guard: every scene that
//      builds Characters must consume mods.headScale() AND expose _applyBigHead (so the OptionsScene live
//      re-apply hook resolves). A future scene-port that drops the application turns this RED.
{
  const offenders = [];
  for (const f of ['src/scenes/OverworldScene.js', 'src/scenes/RegionScene.js']) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    if (!/headScale\(\)/.test(src)) offenders.push(`${f}: does not apply mods.headScale() (big-head won't work)`);
    if (!/_applyBigHead/.test(src)) offenders.push(`${f}: missing _applyBigHead (OptionsScene live-toggle no-ops)`);
  }
  // GORE must be CONSUMED in the active scene (it had ZERO call sites — a silent no-op). The active overworld
  // must read mods.gore() somewhere (the blood effect), so the modifier actually does something.
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/\.gore\(\)/.test(ow)) offenders.push('src/scenes/OverworldScene.js: never reads mods.gore() (blood/gore modifier is a no-op)');
  // HEAD-GROUP completeness — big-head must scale every head-attached slot incl. the HAT, or a big head wears a
  // tiny helm (the guard kettle-helm bug). Assert the scaled-slot SSOT (HEAD_SLOTS) contains head + hair + hat.
  const slotsM = ow.match(/static HEAD_SLOTS\s*=\s*\[([^\]]*)\]/);
  for (const need of ['head', 'hair', 'hat']) {
    if (!slotsM || !slotsM[1].includes(`'${need}'`)) offenders.push(`OverworldScene.HEAD_SLOTS missing '${need}' (big-head won't scale that head layer)`);
  }
  if (offenders.length) fail('MODIFIER APPLICATION MISSING:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('modifier-applied-in-active-scene: big-head (_applyBigHead + headScale) + gore (mods.gore()) are applied in the active scene — toggles actually do something');
}

// 25b) M2-PHYSICAL (Henrietta is DONE, not narrated; PROCESS-RETRO #11 "working = exercised with real input") —
//      M2 must advance by a REAL interact + a real CHASE, never a dialogue `advance:M2`. Each step carries a
//      physical `objective` site marker; the dialogue has NO advance:M2; the catch choices complete:M2; the
//      coop sites are placed; the scene wires _buildM2/_henCatch/_henTick; the hen spritesheet loads. (A future
//      edit that reverts M2 to narrated advance, or drops the hen wiring, turns this RED.)
{
  const offenders = [];
  const m2 = (Array.isArray(QUESTS) ? QUESTS.find((q) => q.id === 'M2') : QUESTS.M2);
  if (!m2) offenders.push('M2 quest def not found');
  else {
    for (const s of (m2.steps || [])) if (!s.objective || !s.objective.type || !s.objective.site) offenders.push(`M2 step '${s.id}' has no physical objective{type,site} — it would be narrated`);
    if (/advance:M2/.test(JSON.stringify(m2.dialogue || {}))) offenders.push('M2 dialogue still uses advance:M2 (narrated, not physical)');
    const opts = (m2.dialogue?.nodes?.chase?.options || []).filter((o) => o.choice && o.choice.quest === 'M2');
    if (opts.length < 3) offenders.push('M2 `chase` node is missing the 3 seeded choices (catch/kick/free)');
    if (opts.some((o) => o.set !== 'complete:M2')) offenders.push('an M2 catch choice does not complete:M2 (the catch would not finish the quest)');
    if (!m2.worldDriven) offenders.push('M2 is not worldDriven — closing Mara\'s briefing would AUTO-COMPLETE it (the "completes on chat" bug)');
  }
  // PRINCIPLE (talk-completes guard): any quest with physical `objective` STEPS must be worldDriven, else
  // _closeDialogue auto-completes it when its giver/briefing dialogue closes — letting chat finish a go-and-do.
  for (const q of (Array.isArray(QUESTS) ? QUESTS : [])) {
    if ((q.steps || []).some((s) => s.objective) && !q.worldDriven) offenders.push(`${q.id} has physical objective steps but is not worldDriven — it would complete on dialogue-close, not its physical action`);
  }
  const gh = REGIONS.find((R) => R.key === 'Greenhollow');
  if (!gh?.m2?.eggs || !gh?.m2?.water || !gh?.m2?.pen || !gh?.m2?.henHome) offenders.push('Greenhollow.m2 sites (eggs/water/pen/henHome) missing');
  if ((gh?.props || []).filter((p) => p.key === 'prop_fence').length < 5) offenders.push('Greenhollow has no fenced coop (prop_fence) for the pen');
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/_buildM2\(/.test(ow)) offenders.push('OverworldScene missing _buildM2 (the coop/hen is never spawned)');
  if (!/_henCatch\(/.test(ow) || !/_henTick\(/.test(ow)) offenders.push('OverworldScene missing the hen chase/catch wiring (_henCatch/_henTick)');
  const boot = readFileSync(join(ROOT, 'src/scenes/BootScene.js'), 'utf8');
  if (!/chicken_walk\.png/.test(boot)) offenders.push('BootScene does not load the hen spritesheet (chicken_walk.png)');
  if (offenders.length) fail('M2-PHYSICAL broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('m2-physical: Henrietta is a real chase — M2 advances by interact/catch (objective sites, no advance:M2; coop + hen placed; complete:M2 on the choice)');
}

// 25b2) INTERACTION-VERB SYSTEM — the action button resolves to a real VERB on the target, not a text step.
//   COLLECT: M2 eggs are PHYSICAL 'egg' world objects (spawned when the chore is current, destroyed on pickup),
//   not a dialogue line. CARRY: catching Henrietta PICKS HER UP overhead (_henState='carried' + a carry branch in
//   _henTick that draws her above the player's head). HIT: the unarmed punch makes nearby animals/NPCs REACT
//   (hen flees, NPC flinches + protests) and is wired into _playerAttack. Prompts read as verbs. (FOUNDATION PASS)
{
  const offenders = [];
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  const boot = readFileSync(join(ROOT, 'src/scenes/BootScene.js'), 'utf8');
  // COLLECT — eggs as physical objects
  if (!/this\.load\.image\('egg'/.test(boot)) offenders.push("BootScene does not load the 'egg' collectable object");
  if (!existsSync(join(ROOT, 'public/art/icons/egg.png'))) offenders.push('public/art/icons/egg.png missing (the collectable egg sprite)');
  if (!/_m2MaybeSpawnEggs\(/.test(ow)) offenders.push('OverworldScene missing _m2MaybeSpawnEggs (eggs never become physical objects)');
  if (!/this\.add\.image\([^;]*?'egg'/.test(ow)) offenders.push('OverworldScene never instantiates an egg sprite (eggs are not placed in the world)');
  if (!/Collect the eggs/.test(ow)) offenders.push("the eggs prompt is not the COLLECT verb ('Collect the eggs')");
  if (!/for \(const e of \(this\._eggs[^]*?e\.destroy\(\)/.test(ow)) offenders.push('_m2Chore eggs does not destroy the physical egg sprites on collect');
  // CARRY — pick up Henrietta overhead
  if (!/_henState = 'carried'/.test(ow)) offenders.push("_henCatch does not PICK UP Henrietta (no _henState='carried')");
  if (!/this\._henState === 'carried'[^]*?hen\.y = this\.player\.y -/.test(ow)) offenders.push('_henTick has no carried branch drawing the hen overhead (above the player)');
  if (!/Pick up Henrietta/.test(ow)) offenders.push("the hen prompt is not the PICK UP verb ('Pick up Henrietta')");
  // HIT — punch reactions
  if (!/_applyHitReactions\(/.test(ow)) offenders.push('OverworldScene missing _applyHitReactions (the HIT verb has no reactions)');
  if (!/_applyHitReactions\(\);/.test(ow)) offenders.push('_applyHitReactions is never CALLED from the attack path (hits cause no reaction)');
  if (!/_henState = 'flee'[^]*?BWAAK/.test(ow)) offenders.push('a struck hen does not flee/squawk');
  if (!/What was THAT for|Quit it/.test(ow)) offenders.push('a struck NPC does not protest');
  if (offenders.length) fail('INTERACTION-VERB system broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('verb-system: action resolves to real VERBS — COLLECT (eggs are physical objects, destroyed on pickup), CARRY (Henrietta picked up overhead), HIT (hen flees, NPC flinches+protests; wired into _playerAttack)');
}

// 25b3) SHOP-ACCESS + PRACTICE SWORD — the keeper Van actually reaches must open the real LIST+SELL shop, not a
//   one-line dialogue buy (the recurring "no item list, no sell" bug was Bram's dialogue-stub + Hodge having no
//   shop wired). A keeper who ALSO gives quests/topics opens the list via an openshop command. The wooden sword
//   is a childSafe + blunt PRACTICE sword a child can buy and train with (the age-gate reads the flag).
{
  const offenders = [];
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  const world = readFileSync(join(ROOT, 'src/data/world.js'), 'utf8');
  const econ = readFileSync(join(ROOT, 'src/data/economy.js'), 'utf8');
  const items = readFileSync(join(ROOT, 'src/data/items/index.js'), 'utf8');
  if (!/cmd\.startsWith\('openshop:'\)/.test(ow)) offenders.push('no openshop: dialogue command — a keeper-with-quests cannot open the list+sell shop');
  if (!/topic\.openshop/.test(ow)) offenders.push('_topicPick does not handle topic.openshop — a topic-keeper (Hodge) cannot open his shop');
  if (!/id: 'bram_forge'/.test(econ)) offenders.push('bram_forge shop missing from economy (the child smith shop)');
  if (!/id: 'wooden_sword'[^}]*childSafe: true/.test(items)) offenders.push('wooden_sword is not childSafe — a child cannot buy the practice sword');
  if (!/id: 'wooden_sword'[^}]*blunt: true/.test(items)) offenders.push('wooden_sword is not blunt — the practice swing would cut foliage');
  const gateHits = (ow.match(/\['weapon', 'armour', 'shield'\]\.includes\(it\.type\) && !it\.childSafe/g) || []).length;
  if (gateHits < 2) offenders.push(`the child age-gate reads it.childSafe in only ${gateHits}/2 buy paths (_shopBuy + _dlgBuy)`);
  if (!/openshop:bram_forge/.test(world)) offenders.push("Bram's dialogue does not open the bram_forge list shop");
  if (/set: 'buy:steel_sword'/.test(world)) offenders.push('a childOnly smith still sells STEEL via a one-line dialogue buy (no list/sell)');
  if (!/openshop: 'hodge_forge'/.test(world)) offenders.push("Hodge has no 'Show me your wares' topic opening hodge_forge");
  if (offenders.length) fail('SHOP-ACCESS / practice-sword broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('shop-access: the smith Van reaches opens the real LIST+SELL shop (Bram→bram_forge via dialogue, Hodge→hodge_forge via topic); the wooden practice sword is childSafe+blunt — a child can buy + train, real weapons stay age-gated');
}

// 25b4) INVENTORY-ACTION DISPATCHER — selecting an Items-tab entry resolves real verbs (Equip/Unequip · Use ·
//   Drop · Compare) by item type+slot, NOT a static list. EQUIP changes the loadout AND the in-world weapon/shield
//   visual (the Character layer rig) together; USE applies effects + consumes; COMPARE shows the stat delta.
{
  const offenders = [];
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/_itemActionsFor\(/.test(ow)) offenders.push('no inventory-action dispatcher (_itemActionsFor) — items have no verbs');
  if (!/_doItemAction\(/.test(ow)) offenders.push('no _doItemAction handler');
  if (!/_syncEquipVisual\(/.test(ow)) offenders.push('no _syncEquipVisual — equipping would not change the in-world weapon');
  if (!/this\.inv\.equip\(id\); this\._syncEquipVisual\(\)/.test(ow)) offenders.push('Equip does not change the loadout AND the in-world visual together');
  if (!/this\.player\.equip\('sword'\)/.test(ow) || !/this\.player\.equip\('shield'\)/.test(ow)) offenders.push('the weapon/shield visual layer is not driven from the inventory loadout');
  if (!/_useItem\(/.test(ow) || !/this\.inv\.remove\(id, 1\)/.test(ow)) offenders.push('Use does not apply effects + consume the item');
  if (!/_compareText\(/.test(ow)) offenders.push('no Compare (stat delta vs the equipped item)');
  if (!/_itemActionOpen/.test(ow)) offenders.push('no action sub-panel state (_itemActionOpen)');
  if (offenders.length) fail('INVENTORY-ACTION dispatcher broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('inventory-actions: Items tab resolves Equip/Unequip · Use · Drop · Compare per item; Equip syncs the loadout + the in-world weapon/shield visual; Use applies effects + consumes; Compare shows the stat delta');
}

// 25b5) GEAR & STATS PAPER-DOLL — a picture of the ACTUAL player character (the same forge layer rig the world
//   uses) composited into the Gear & Stats tab, beside the full WORN/HELD loadout + stats.
{
  const offenders = [];
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/_buildPaperDoll\(/.test(ow)) offenders.push('no _buildPaperDoll — the Gear & Stats tab shows no character picture');
  if (!/this\._playerParts/.test(ow)) offenders.push('the paper-doll does not reuse the player forge rig (_playerParts)');
  if (!/rt\.drawFrame\(/.test(ow)) offenders.push('the paper-doll does not composite the layer rig (no drawFrame)');
  if (!/const doll = this\._buildPaperDoll\(\)/.test(ow)) offenders.push('the Gear & Stats tab does not build + show the paper-doll');
  if (!/Armour:.*equipped\('body'\)/.test(ow) || !/Trinket:.*equipped\('trinket'\)/.test(ow)) offenders.push('WORN/HELD does not list every equipment slot (weapon/shield/armour/trinket)');
  if (offenders.length) fail('GEAR PAPER-DOLL broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('gear-paper-doll: the Gear & Stats tab renders the actual player character (forge rig composite) beside the full WORN/HELD loadout + stats');
}

// 25c) ITEM-ICONS (buy/sell + inventory PICTURES, not just names) — every id in BootScene.ITEM_ICONS must have a
//      real public/art/icons/<id>.png, be a REAL game item, and the scene must wire the pictures into the shop
//      rows + the menu Items list (itemIconKey). Items WITHOUT an icon fall back to their name (honest).
{
  const offenders = [];
  const boot = readFileSync(join(ROOT, 'src/scenes/BootScene.js'), 'utf8');
  const m = boot.match(/export const ITEM_ICONS\s*=\s*\[([^\]]*)\]/);
  const ids = m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  if (!ids.length) offenders.push('BootScene.ITEM_ICONS is empty/missing');
  for (const id of ids) {
    if (!existsSync(join(ROOT, `public/art/icons/${id}.png`))) offenders.push(`icon file missing: public/art/icons/${id}.png`);
    if (!(Array.isArray(ITEMS) ? ITEMS.some((it) => it.id === id) : false)) offenders.push(`icon '${id}' is not a real game item`);
  }
  if (!/this\.load\.image\(`icon_\$\{id\}`/.test(boot)) offenders.push('BootScene does not load the item icons');
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/itemIconKey\(/.test(ow)) offenders.push('OverworldScene never resolves itemIconKey (icons not wired)');
  if (!/_shopIcons/.test(ow)) offenders.push('shop buy/sell rows have no icon column (_shopIcons)');
  if (!/_menuIcons/.test(ow)) offenders.push('menu Items list has no icon column (_menuIcons)');
  if (offenders.length) fail('ITEM-ICONS broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok(`item-icons: ${ids.length} eliza-objects item pictures wired into the buy/sell + inventory rows (rest fall back to name)`);
}

// 25d) CHARSELECT-FRONT (PIXEL-TRUTH, verification-integrity) — the prior "facing:'down'" gate read a DATA field
//      while the screen rendered the BACK: the char-select preview built before AssetLoader.build, so play() was a
//      silent no-op and every layer showed FRAME 0 = row 0 = the 'up'/BACK row. This gate decodes the ACTUAL head
//      idle SHEET and asserts the ROW the preview renders has a FACE (eye pixels), while the 'up'/back row (the
//      frame-0 default) does NOT — so a back-facing render, a row-swap, or a facing→back change FAILS. It also
//      locks the render-path invariants that stop the silent-frame-0 recurrence (Title builds the anims; Character
//      seats the directional static frame when an anim is missing). [Limit: decodes the sheet at the rendered
//      frame, not the live GPU canvas — no headless browser; the live Playwright shot is the runtime proof.]
{
  const offenders = [];
  // eye-band signal: peak count of dark (non-skin) pixels across the central scanlines of a row's col-0 cell.
  // a FRONT face adds an eye cluster there; the BACK (bald skull) is just the 2px head outline.
  const eyePeak = (img, row, FW, FH) => {
    let peak = 0;
    for (let y = Math.floor(FH * 0.42); y <= Math.floor(FH * 0.55); y++) {
      let d = 0;
      for (let x = Math.floor(FW * 0.31); x < Math.floor(FW * 0.69); x++) {
        const i = ((row * FH + y) * img.w + x) * 4;
        if (img.data[i + 3] > 128 && Math.max(img.data[i], img.data[i + 1], img.data[i + 2]) < 100) d++;
      }
      if (d > peak) peak = d;
    }
    return peak;
  };
  const head = decodeRGBA(join(ROOT, 'public/art/eliza/head/idle.png'));
  if (!head) offenders.push('cannot decode public/art/eliza/head/idle.png');
  else {
    const FW = Math.round(head.w / (ANIMS.idle.frames || 3)), FH = Math.round(head.h / 4);
    // the facing the char-select preview is BUILT with (read from source — the render path), → its sheet ROW
    const title = readFileSync(join(ROOT, 'src/scenes/TitleScene.js'), 'utf8');
    const fm = title.match(/new Character\([\s\S]*?facing:\s*'([a-z]+)'/);
    const facing = fm ? fm[1] : null;
    if (!facing) offenders.push('char-select preview Character has no explicit facing in TitleScene');
    const renderRow = facing != null && DIR_ROW[facing] != null ? DIR_ROW[facing] : null;
    if (renderRow == null) offenders.push(`char-select facing '${facing}' has no DIR_ROW`);
    else {
      const frontPeak = eyePeak(head, renderRow, FW, FH), backPeak = eyePeak(head, DIR_ROW.up, FW, FH);
      // the RENDERED row must show a face; the back/frame-0 row must NOT (negative-prove the gate fails a back render)
      if (frontPeak < 5) offenders.push(`char-select renders row ${renderRow} (facing '${facing}') but its eye-band has NO face pixels (peak ${frontPeak}) — that frame is back-facing`);
      if (backPeak > 3) offenders.push(`the 'up'/back row reads as having a face (peak ${backPeak}) — face signal not discriminating; gate unreliable`);
    }
  }
  // render-path invariants: the silent-frame-0 bug recurs if EITHER guard is removed
  const title = readFileSync(join(ROOT, 'src/scenes/TitleScene.js'), 'utf8');
  if (!/AssetLoader\.build\(this\)/.test(title)) offenders.push('TitleScene does not register character anims (AssetLoader.build) — preview play() would no-op to frame 0/back');
  const chr = readFileSync(join(ROOT, 'src/systems/Character.js'), 'utf8');
  if (!/_staticDirFrame/.test(chr) || !/anims\.exists\(key\)/.test(chr)) offenders.push('Character lacks the anim-missing → directional-static-frame fallback (a no-op play would show frame 0/back)');
  if (offenders.length) fail('CHARSELECT-FRONT (pixel-truth) broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('charselect-front (pixel-truth): the head row the preview renders has eye pixels (front); the back row does not; anims built at Title + Character static-frame fallback prevent the silent frame-0/back render');
}

// 25e) CHILD-HAIR-TRACKS-HEAD (LIVE-ANIMATION pixel-truth) — the prior sheet-only/paused check missed that the
//      hair displaced 2-4px PER FRAME on the ATTACK (the "hair swings like a weapon") and could drift on the
//      moving child (the "bounce"). This gate decodes EVERY frame of EVERY state (idle/walk/attack) × EVERY
//      direction for each baked child-hair sheet and asserts the hair-crown tracks the child-head crown within
//      1px across the WHOLE cycle (gap spread ≤ 1). The old per-direction-constant bake (attack spread 4) FAILS
//      this; the per-(dir,frame) bake passes. (Decodes the exact sheet frames the sprite plays.)
{
  const offenders = [];
  const FR = 64;
  const topOpaque = (img, c, r) => { for (let y = 0; y < FR; y++) for (let x = 0; x < FR; x++) { const i = ((r * FR + y) * img.w + (c * FR + x)) * 4; if (img.data[i + 3] > 40) return y; } return -1; };
  const states = [['idle', 3], ['walk', 8], ['attack', 7]];
  const hairs = ['child_hair_natural', 'child_hair_black', 'child_hair_ginger', 'child_hair_blond', 'child_hair_auburn', 'child_hair_bob'];
  const TOL = 1;   // px: max allowed gap-spread across a (state,dir) cycle
  for (const [st, nf] of states) {
    const head = decodeRGBA(join(ROOT, `public/art/eliza/child_head/${st}.png`));
    if (!head) { offenders.push(`cannot decode child_head/${st}.png`); continue; }
    for (const hairTex of hairs) {
      const hp = join(ROOT, `public/art/eliza/${hairTex}/${st}.png`);
      if (!existsSync(hp)) continue;
      const hair = decodeRGBA(hp);
      if (!hair) { offenders.push(`cannot decode ${hairTex}/${st}.png`); continue; }
      for (let r = 0; r < 4; r++) {
        const gaps = [];
        for (let c = 0; c < nf; c++) { const ht = topOpaque(head, c, r), hr = topOpaque(hair, c, r); if (ht >= 0 && hr >= 0) gaps.push(ht - hr); }
        if (gaps.length < 2) continue;
        const spread = Math.max(...gaps) - Math.min(...gaps);
        if (spread > TOL) offenders.push(`${hairTex} ${st} dir${r}: hair-crown drifts ${spread}px across the cycle (>${TOL}) — bounce/swing [gaps ${gaps.join(',')}]`);
      }
    }
  }
  if (offenders.length) fail('CHILD-HAIR-TRACKS-HEAD (live-animation) broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('child-hair-tracks-head (live-animation): every frame of idle/walk/attack × all directions keeps the hair crown within 1px of the head crown — no walk bounce, no attack hair-swing');
}

// 25i) CHILD-UNARMED-ATTACK (the 3rd-recurrence fix) — the crown-only gate above MISSED the real bug: the
//      attack-frame hair SILHOUETTE swooshed out like a swung weapon (crown-y tracked, but the shape flew).
//      Add the silhouette metric: every attack-frame hair must be no WIDER than the seated idle hair (+ a few
//      px) — a swoosh balloons the width. Plus the unarmed action must be a PUNCH (not the slash) and must NOT
//      cut foliage: ONESHOT has 'punch', AssetLoader registers it, _playerAttack branches on armed + only the
//      armed swing calls _cutSwing.
{
  const offenders = [];
  const FR = 64;
  const hairWidth = (img, c, r) => { let lo = 999, hi = -1; for (let y = 0; y < FR; y++) for (let x = 0; x < FR; x++) { const i = ((r * FR + y) * img.w + (c * FR + x)) * 4; if (img.data[i + 3] > 40) { if (x < lo) lo = x; if (x > hi) hi = x; } } return hi < 0 ? 0 : hi - lo + 1; };
  const idleH = decodeRGBA(join(ROOT, 'public/art/eliza/child_hair_natural/idle.png'));
  const atkH = decodeRGBA(join(ROOT, 'public/art/eliza/child_hair_natural/attack.png'));
  if (!idleH || !atkH) offenders.push('cannot decode child_hair_natural idle/attack');
  else for (let r = 0; r < 4; r++) {
    const idleW = hairWidth(idleH, 0, r);
    for (let c = 0; c < 7; c++) { const w = hairWidth(atkH, c, r); if (w > idleW + 5) offenders.push(`child hair attack dir${r} f${c}: silhouette ${w}px ≫ seated ${idleW}px — the hair SWOOSHES (weapon-swing look)`); }
  }
  if (!ONESHOT.has('punch')) offenders.push("ONESHOT missing 'punch' (the unarmed action)");
  // VISIBLE-not-no-op (the 'J does nothing' regression): the punch must ADVANCE through ≥2 distinct frames at a
  // SEEN frameRate (not a 1-frame blink) AND fire visible impact feedback — else it plays but flashes past unseen.
  if (!Array.isArray(PUNCH_FRAMES) || new Set(PUNCH_FRAMES).size < 2) offenders.push('PUNCH_FRAMES has <2 distinct frames — the jab would not visibly advance');
  const al = readFileSync(join(ROOT, 'src/art/AssetLoader.js'), 'utf8');
  if (!/_registerPunch/.test(al)) offenders.push('AssetLoader does not register the punch anim');
  const frM = al.match(/_registerPunch[\s\S]*?frameRate:\s*(\d+)/);
  if (!frM || Number(frM[1]) > 12) offenders.push(`punch frameRate ${frM ? frM[1] : '?'} too fast (>12) — the jab blinks past invisibly`);
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/armed \? 'attack' : 'punch'/.test(ow)) offenders.push('_playerAttack does not pick punch when unarmed');
  if (!/if \(armed && !blunt\) this\._cutSwing\(\)/.test(ow)) offenders.push('cut not gated on (armed && !blunt) — a fist OR a blunt practice sword must not cut foliage');
  if (!/else if \(!armed\) this\._punchFx\(\)/.test(ow) || !/_punchFx\(\)\s*\{/.test(ow)) offenders.push('no _punchFx on the unarmed punch — the blunt hit has no visible feedback (the "nothing happens" look)');
  if (offenders.length) fail('CHILD-UNARMED-ATTACK broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('child-unarmed-attack: punch advances ≥2 frames at ≤12fps + impact puff (VISIBLE, not a no-op blink); hair seated every frame; unarmed = a PUNCH (not slash) that does NOT cut');
}

// 25f) SHOP-PRICES + DIALOGUE TOKENS — Van saw Bram's sword as a literal "(Price)": the `{price:steel_sword}`
//      template was only filled in RegionScene, not the live OverworldScene. This gate asserts: every shop
//      stock item resolves a real numeric price; every {price:id} token in NPC/quest dialogue is a real item;
//      and OverworldScene actually applies _template (text + labels) + handles `buy:` — so no literal token,
//      and a dialogue-shop purchase isn't a no-op.
{
  const offenders = [];
  for (const sh of SHOPS) for (const st of (sh.stock || [])) {
    let p; try { p = buyPrice(st.item, sh.region, 5); } catch (e) { p = NaN; }
    if (!(p > 0)) offenders.push(`${sh.id}: '${st.item}' has no numeric buy price`);
  }
  const srcs = [];
  for (const R of REGIONS) for (const n of (R.npcs || [])) if (n.social) srcs.push(JSON.stringify(n.social));
  for (const q of (Array.isArray(QUESTS) ? QUESTS : [])) if (q.dialogue) srcs.push(JSON.stringify(q.dialogue));
  for (const s of srcs) for (const m of s.matchAll(/\{price:(\w+)\}/g)) { try { itemDef(m[1]); } catch (e) { offenders.push(`{price:${m[1]}} references a non-item`); } }
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/_template\(node\.text\)/.test(ow) || !/_template\(v\.opt\.label\)/.test(ow)) offenders.push('OverworldScene does not apply _template to dialogue text/labels — {price:} tokens render literally as "(Price)"');
  if (!/startsWith\('buy:'\)/.test(ow)) offenders.push('OverworldScene has no buy: handler — dialogue-shop purchases no-op');
  if (offenders.length) fail('SHOP-PRICES / DIALOGUE-TOKENS broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('shop-prices: every shop item resolves a numeric price; every {price:} dialogue token is a real item + OverworldScene fills it (no literal "(Price)") + dialogue-shop buy wired');
}

// 25g) HUD-LAYOUT LAW (no-overlap, systemic) — the help bar floated MID-SCREEN (fixed y=412 on a taller RESIZE
//      canvas) and the HUD overlapped the interior room (room cover-zoomed to the full viewport). Codify: the
//      help bar is bottom-anchored to the live viewport (+ reflowed on resize), and interiors INSET the world
//      viewport by HUD_SAFE so the stats panel / minimap / quests / help sit on the dark border, never over the
//      room. (Panel overlap is separately covered by panel-bounds-inside-viewport.)
{
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  const offenders = [];
  if (!/_helpText\s*=\s*this\.add\.text\(\s*8,\s*this\.scale\.height\s*-/.test(ow)) offenders.push('help bar not bottom-anchored to this.scale.height — risks floating mid-screen');
  if (!/const HUD_SAFE\s*=\s*\{/.test(ow)) offenders.push('HUD_SAFE safe-area constants missing');
  if (!/setViewport\(0,\s*HUD_SAFE\.top,/.test(ow)) offenders.push('interior camera does not inset by HUD_SAFE — HUD overlaps the room');
  if (!/_layoutHud\s*\(\)/.test(ow) || !/resize'.*_layoutHud\(\)/s.test(ow)) offenders.push('HUD not re-anchored on resize (_layoutHud in the resize handler)');
  if (offenders.length) fail('HUD-LAYOUT broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('hud-layout: help bar bottom-anchored + reflowed on resize; interiors inset the world viewport by HUD_SAFE so stats/minimap/quests/help never overlap the room');
}

// 25h) CHILDHOOD-SPINE — M4-M7 must be REACHABLE end-to-end (they were authored but had no overworld start, so
//      the arc stalled after M3 and never reached the adult bridge). Lock the connective tissue: the quest chain
//      M3→M4→M5→M6→M7, M6 records time_skip, Sela is placed (M7 giver), and the scene wires every start (M4
//      cave-walk intercept · M5 festival trigger · M5→M6 auto-chain · M7 auto-start at the time-skip).
{
  const offenders = [];
  const Q = (id) => (Array.isArray(QUESTS) ? QUESTS.find((q) => q.id === id) : null);
  for (const [a, b] of [['M3', 'M4'], ['M4', 'M5'], ['M5', 'M6'], ['M6', 'M7']]) {
    const def = Q(a); if (!def) { offenders.push(`${a} def missing`); continue; }
    if (!(def.unlocks || []).includes(b)) offenders.push(`${a} does not unlock ${b} (chain broken)`);
  }
  if (!/time_skip/.test(JSON.stringify(Q('M6')?.dialogue || {}))) offenders.push('M6 dialogue never records time_skip (no child→adult bridge)');
  const gh = REGIONS.find((R) => R.key === 'Greenhollow');
  if (!(gh?.npcs || []).some((n) => n.name === 'Sela')) offenders.push('Sela (M7 giver) not placed in Greenhollow');
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (!/_buildChildhoodSpine/.test(ow)) offenders.push('OverworldScene missing _buildChildhoodSpine (M4/M5 start triggers)');
  if (!/o\.to === 'cave_f1' && this\.isChild/.test(ow)) offenders.push('no M4 cave-walk intercept (child gets the empty cave, not the M4 beat)');
  if (!/_onChildQuestComplete/.test(ow) || !/qid === 'M5' && this\.quests\.status\('M6'\)/.test(ow)) offenders.push('no M5→M6 auto-chain (the burning never follows the festival)');
  if (!/status\('M7'\) === 'available'\) this\._startQuestDialogue\('M7'\)/.test(ow)) offenders.push('no M7 auto-start at the time-skip (adult return never begins)');
  if (offenders.length) fail('CHILDHOOD-SPINE broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('childhood-spine: M3→M4→M5→M6→M7 chain + M6 time_skip bridge + Sela placed + every start wired (M4 cave-walk · M5 festival · M5→M6 auto · M7 auto-start) — the arc plays to adulthood');
}

// L2 DIALOG-SPEAKER-PRESENT (GAME-LAWS L2) — no disembodied speakers. A dialog node's named speaker, IF it is
//   a PLACED NPC (a real wandering NPC somewhere), must be placed in a region the quest's GIVER is also in —
//   so the line fires only where that NPC is present. (The bug: Bram, placed at the GH forge, spoke in M1
//   which plays in Mara's cottage.) Quest-ONLY narrative voices (names placed nowhere) are exempt — they live
//   in their quest's context. Narration (empty speaker) is exempt.
{
  const npcRegions = {};   // name -> Set(region keys it is placed in)
  const givers = {};       // quest id -> Set(region keys its giver NPCs are in)
  for (const R of REGIONS) for (const n of (R.npcs || [])) {
    if (n.name) (npcRegions[n.name] = npcRegions[n.name] || new Set()).add(R.key);
    for (const q of [n.quest, ...(n.quests || [])].filter(Boolean)) (givers[q] = givers[q] || new Set()).add(R.key);
  }
  const bad = [];
  for (const q of QUESTS) {
    if (!q.dialogue || !q.dialogue.nodes) continue;
    const gset = givers[q.id]; if (!gset || !gset.size) continue;   // no placed giver → not a walk-up dialog
    for (const k of Object.keys(q.dialogue.nodes)) {
      const sp = q.dialogue.nodes[k].speaker; if (!sp) continue;     // narration
      const placed = npcRegions[sp]; if (!placed) continue;          // quest-only voice (placed nowhere) → exempt
      const shares = [...placed].some((r) => gset.has(r));
      if (!shares) bad.push(`${q.id}.${k}: '${sp}' speaks but is placed in [${[...placed].join(',')}], not where the quest plays [${[...gset].join(',')}]`);
    }
  }
  if (bad.length) fail('L2 DISEMBODIED SPEAKER (not present where the dialog plays):' + bad.map((v) => '\n      ' + v).join(''));
  else ok('dialog-speaker-present (L2): every placed-NPC dialog speaker shares a region with the quest giver — no disembodied speakers');
}

// L2 LOCATION-CLAIMS (GAME-LAWS L2 extension) — a dialog line that claims WHERE a named NPC is must match the
// NPC's actual placement. The audited manifest (LOCATION_CLAIMS) maps each claim → {npc, region}; assert the
// NPC is placed in that region. (The bug: Mara's M1 line said Bram was at the forge while he stood in the
// cottage; fixed by placing Bram at the forge. This gate stops that class of contradiction recurring.)
{
  const placed = {};   // name -> Set(region keys)
  for (const R of REGIONS) for (const n of (R.npcs || [])) if (n.name) (placed[n.name] = placed[n.name] || new Set()).add(R.key);
  const bad = [];
  for (const c of LOCATION_CLAIMS) {
    const where = placed[c.npc];
    if (!where) bad.push(`${c.quest}: claims '${c.npc}' at ${c.region} but ${c.npc} is placed NOWHERE`);
    else if (!where.has(c.region)) bad.push(`${c.quest}: claims '${c.npc}' at ${c.region} but ${c.npc} is placed in [${[...where].join(',')}] — line: ${c.line}`);
  }
  if (bad.length) fail('L2 LOCATION-CLAIM (line claims a place the NPC is not):' + bad.map((v) => '\n      ' + v).join(''));
  else ok(`location-claims (L2): all ${LOCATION_CLAIMS.length} audited NPC-location claim(s) match the NPC's actual placement — no "X is at the forge" while X is elsewhere`);
}

// L6 DEED-TIMING (GAME-LAWS L6) — karma/deeds move ONLY when the action occurs, never on announcing intent.
// Every karma-moving quest CHOICE in the childhood (M1-M7) + slice (GH1-4) must be CLASSIFIED in DEED_TIMING,
// and a 'deferred' choice's dialogue option must actually carry defer:true (so it can't silently move karma on
// the line). 'action-at-site'/'speech-act' choices legitimately fire on the line; the manifest makes that an
// explicit audited decision, not an exemption by silence.
{
  const SCOPED = /^(M[1-7]|GH[1-4])$/;
  const bad = []; let checked = 0;
  for (const q of QUESTS) {
    if (!SCOPED.test(q.id)) continue;
    const fires = [];   // dialogue options that fire a choice for THIS quest
    if (q.dialogue && q.dialogue.nodes) for (const k of Object.keys(q.dialogue.nodes)) for (const o of (q.dialogue.nodes[k].options || [])) if (o.choice && o.choice.quest === q.id) fires.push(o);
    for (const c of (q.choices || [])) {
      const movesKarma = c.deed || (c.karma && ((c.karma.morality || 0) !== 0 || (c.karma.purity || 0) !== 0));
      if (!movesKarma) continue;
      checked++;
      const key = `${q.id}:${c.id}`; const cls = DEED_TIMING[key];
      const opt = fires.find((o) => o.choice.id === c.id);
      if (!cls) { bad.push(`${key}: deed-moving choice NOT classified in DEED_TIMING (audit it: action-at-site / speech-act / deferred)`); continue; }
      if (cls === 'deferred') {
        if (!opt) bad.push(`${key}: classified 'deferred' but no dialogue option fires it`);
        else if (!opt.defer) bad.push(`${key}: classified 'deferred' but its option lacks defer:true — it would move karma on the LINE (intent), not the action`);
      } else if (opt && opt.defer) {
        bad.push(`${key}: classified '${cls}' (fires on the line) but its option carries defer:true`);
      }
    }
  }
  if (bad.length) fail('L6 DEED-TIMING (karma must move on the action, not the intent):' + bad.map((v) => '\n      ' + v).join(''));
  else ok(`deed-timing (L6): all ${checked} karma-moving childhood+slice choices are classified; 'deferred' forks (M1 greet/ignore) defer to the action, the rest are audited action-at-site/speech-acts`);
}

// 25a2) QUEST-OPENER-IS-GIVER (dialog-routing item 3) — the NPC you TALK TO must speak first / own the box.
//       A quest dialogue is started by talking to its GIVER (an NPC that lists it); its OPENING node must be
//       spoken by that giver (or be narration), never by a different NPC. The bug: M2 was given by Tam but
//       opened with MARA's line+portrait. Catches every such authoring mismatch.
{
  const givers = {};
  for (const R of REGIONS) for (const n of (R.npcs || [])) {
    for (const q of [n.quest, ...(n.quests || [])].filter(Boolean)) (givers[q] = givers[q] || []).push(n.name);
  }
  const bad = [];
  for (const q of QUESTS) {
    if (!q.dialogue || !q.dialogue.nodes) continue;
    let node = q.dialogue.nodes[q.dialogue.start], guard = 0;
    while (node && node.route && guard++ < 6) node = q.dialogue.nodes[node.route[node.route.length - 1].to];
    const opener = node && node.speaker ? node.speaker : null;   // null = narration (allowed)
    const gv = givers[q.id];
    if (gv && gv.length && opener && !gv.includes(opener)) bad.push(`${q.id}: given by [${gv.join(', ')}] but opens with '${opener}' — the talked-to NPC must speak first`);
  }
  if (bad.length) fail('QUEST OPENER ≠ GIVER (the talked-to NPC must own the box):' + bad.map((v) => '\n      ' + v).join(''));
  else ok(`quest-opener-is-giver: every quest's opening line is spoken by its giver (or narration) — the NPC you talk to speaks first`);
}

// 25b) NO-DUPLICATE-NAMED-NPC (town-feel item 2) — a named NPC must not appear TWICE in the same region
//      (the "mini-Mara" class: a double-spawn renders two of the same person). Names are unique per region;
//      different regions may reuse a name (a different person). Unnamed/generic NPCs are exempt.
{
  const dups = []; let named = 0;
  for (const R of REGIONS) {
    const seen = new Map();
    for (const n of (R.npcs || [])) {
      if (!n.name) continue; named++;
      seen.set(n.name, (seen.get(n.name) || 0) + 1);
    }
    for (const [name, c] of seen) if (c > 1) dups.push(`${R.key}: '${name}' spawns ${c}x`);
  }
  if (dups.length) fail('DUPLICATE NAMED-NPC SPAWN(S):' + dups.map((v) => '\n      ' + v).join(''));
  else ok(`no-duplicate-named-npc: ${named} named NPC placement(s) — no name spawns twice in one region (no double-spawn)`);
}

// 26) PANEL-BOUNDS-INSIDE-VIEWPORT — every UI PANEL (a scrollFactor-0 OVERLAY container) MUST be registered
//     with the uiCamera via _registerUIPanel (or be in the _setupUICamera _uiList). A panel that isn't
//     renders on the ZOOMED main camera and gets pushed off-screen (Van's clipped-panel bug). Static scan
//     of the scene so a new panel can never skip the shared on-screen helper.
{
  const scene = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  const pviol = [];
  // panel containers: `this._<name>Box = this.add.container(...)`
  const boxes = [...scene.matchAll(/this\.(_\w*Box)\s*=\s*this\.add\.container/g)].map((m) => m[1]);
  const registered = new Set([...scene.matchAll(/_registerUIPanel\(this\.(_\w*Box)/g)].map((m) => m[1]));
  const inUiList = new Set([...(scene.match(/_uiList\s*=\s*\[([^\]]*)\]/) || [, ''])[1].matchAll(/this\.(\w+)/g)].map((m) => '_' + m[1].replace(/^_/, '')));
  for (const b of new Set(boxes)) {
    if (!registered.has(b)) pviol.push(`${b} is a UI panel but never calls _registerUIPanel → would render on the zoomed main camera (off-screen)`);
  }
  // the shared helpers must exist
  if (!/_registerUIPanel\(/.test(scene) || !/_clampPanel\(/.test(scene)) pviol.push('the shared _registerUIPanel/_clampPanel helpers are missing');
  if (pviol.length) fail('PANEL-BOUNDS-INSIDE-VIEWPORT:' + pviol.map((v) => '\n      ' + v).join(''));
  else ok(`panel-bounds-inside-viewport: all ${new Set(boxes).size} UI panel(s) register with the uiCamera (zoom-1, screen-space, clamped) — none can render off-screen`);
}

// 26d) MENU MAP-TAB NAV — navigating sideways to the Map tab must NOT look/feel like the menu closed.
//   ROOT CAUSE (fixed): the full map was a hud2 CHILD, and _openMenu hides hud2 → the Map tab rendered nothing
//   (parent invisible). FIX: the map is scene-root, listed on the uiCamera (independent of hud2), and the menu
//   tab bar STAYS visible on Map (only the opaque panel bg hides). This gate guards all three.
{
  const offenders = [];
  const ow = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  if (/this\._fullMap = add\(/.test(ow)) offenders.push('_fullMap is still a hud2 CHILD (add(...)) — the menu hiding hud2 will blank the Map tab');
  if (!/_uiList = \[[^\]]*this\._fullMap[^\]]*\]/.test(ow)) offenders.push('_fullMap is not registered on the uiCamera _uiList — it will render on the wrong (zoomed) camera or not at all');
  if (/this\._menuBox\.setVisible\(!onMap\)/.test(ow)) offenders.push('the menu box is hidden on the Map tab — the tab bar vanishes and the menu looks closed');
  if (!/this\._menuBox\.setVisible\(true\)/.test(ow)) offenders.push('the menu box is not force-kept visible on every tab (tab bar must persist on Map)');
  if (!/this\._menuBg\.setVisible\(!onMap\)/.test(ow)) offenders.push('the opaque panel bg is not hidden on Map — the map cannot show through under the tab bar');
  if (offenders.length) fail('MENU MAP-TAB nav broken:' + offenders.map((v) => '\n      ' + v).join(''));
  else ok('menu-map-tab: the Map tab keeps the tab bar visible + renders the map (scene-root on the uiCamera, independent of hud2) — navigating to Map never looks/acts closed');
}

// 27) GAME-WIDE DEPTH RULE — every WORLD sprite y-sorts by its FEET (baseY), one formula. Static props go
//     through DepthSort.trackProp (origin/scale-agnostic opaque-base feet); only ACTORS use DepthSort.track,
//     and their offset MUST be a body-derived feet line (never a per-case constant). A bare number / footprint
//     arithmetic as a track() offset is the regression class (props sorting off their feet → wrong occlusion,
//     Van's "prop renders over the player" bug). Whitelisted: UI/FX/floor via setDepth(DEPTH.*) — not y-sorted.
{
  const scene = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  const ds = readFileSync(join(ROOT, 'src/systems/DepthSort.js'), 'utf8');
  const dviol = [];
  // the one formula must live in DepthSort (origin + scale terms present)
  if (!/trackProp/.test(ds) || !/0\.5 - s\.originY/.test(ds) || !/s\.scaleY/.test(ds))
    dviol.push('DepthSort is missing the trackProp feet formula ((0.5-originY)*displayHeight + scaleY*box) — the game-wide rule');
  // every bare DepthSort.track( in the live scene must derive feet from an actor body (not a constant)
  const calls = [...scene.matchAll(/DepthSort\.track\([^,]+,\s*([^;]+?)\);/g)];
  for (const c of calls) {
    const arg = c[1];
    if (!/\bbody\b/i.test(arg) && !/foot/i.test(arg))
      dviol.push(`DepthSort.track offset "${arg.trim()}" is a per-case constant — world props must use DepthSort.trackProp(spr, solidBox(...)) so they sort by their FEET`);
  }
  if (dviol.length) fail('GAME-WIDE-DEPTH-RULE:' + dviol.map((v) => '\n      ' + v).join(''));
  else ok(`game-wide-depth-rule: depth = feet (baseY) for every world sprite — ${calls.length} actor track() are body-derived; all props use trackProp (one origin/scale-agnostic formula)`);
}

// 28) SHOP-STOCK-NON-EMPTY — a keeper's buy menu must have ITEMS the moment the player meets them on a FRESH
//     save (act 1, no deeds/karma). The regression class: stock data, a keeper's `shop:` link, or the
//     availableStock gating quietly empties a shop and only eyes-on catches it (there was NO test). This gate
//     simulates the fresh-save buy menu for every shop AND every keeper NPC, asserting non-empty + buyable.
{
  const sviol = [];
  const FRESH = { inv: { gold: 9999, items: {} }, karma: null };   // fresh save: no deeds → act 1
  // (a) every SHOP offers at least one buyable item on a fresh save
  const freshStock = {};
  for (const sh of SHOPS) {
    const ids = availableStock(sh.id, FRESH);
    freshStock[sh.id] = ids;
    if (!ids.length) { sviol.push(`shop '${sh.id}' (${sh.name}) is EMPTY on a fresh save — every stock entry is gated (act/deeds/karma). A new player sees no items.`); continue; }
    for (const id of ids) {
      const it = itemDef(id);
      if (!it) { sviol.push(`shop '${sh.id}' stocks '${id}' but no such item is defined`); continue; }
      const price = buyPrice(id, sh.region, 5);
      if (!(price >= 0)) sviol.push(`shop '${sh.id}' item '${id}' has no valid buy price (${price})`);
    }
  }
  // (b) every KEEPER NPC (data `shop:` is a shop-id string) links to a real shop with fresh stock
  let keepers = 0;
  for (const R of REGIONS) for (const n of (R.npcs || [])) {
    if (typeof n.shop !== 'string') continue;   // dialogue-embedded shop objects are a separate system
    keepers++;
    const sh = SHOPS.find((s) => s.id === n.shop);
    if (!sh) { sviol.push(`keeper '${n.name}' in '${R.key}' points to shop '${n.shop}' which does not exist`); continue; }
    if (!(freshStock[n.shop] || []).length) sviol.push(`keeper '${n.name}' in '${R.key}' opens shop '${n.shop}' which is EMPTY on a fresh save`);
  }
  if (sviol.length) fail('SHOP-STOCK-NON-EMPTY:' + sviol.map((v) => '\n      ' + v).join(''));
  else ok(`shop-stock-non-empty: all ${SHOPS.length} shops + ${keepers} keeper(s) offer buyable items on a fresh save (no empty buy menu)`);
}

// 29) NO-INLINE-INTERACTION-LITERALS — every interaction distance/window/offset must be a NAMED constant in
//     standards.js (the INTERACTION-STANDARDS index), never a bare literal in interaction code. The pure
//     decision files (Interaction.js, doorTrigger.js) must contain NO magic numeric literals; the specific
//     migrated literals must not reappear in the scene's interaction paths; standards must define the blocks.
{
  const iviol = [];
  const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  // (a) the PURE interaction-decision files carry no bare magic literals (only 0/1/2 structural + named consts)
  for (const f of ['src/systems/Interaction.js', 'src/systems/doorTrigger.js']) {
    const code = stripComments(readFileSync(join(ROOT, f), 'utf8'));
    const lits = [...code.matchAll(/(?<![\w.])(\d+\.\d+|\d{2,})(?![\w.])/g)].map((m) => m[1]);
    const bad = lits.filter((n) => !['0', '1', '2'].includes(n));   // 0/1/2 are structural (div-guard, TILE/2, axis vecs)
    if (bad.length) iviol.push(`${f} has bare numeric literal(s) ${[...new Set(bad)].join(', ')} — move to a NAMED standards.js constant`);
  }
  // (b) the migrated interaction literals must NOT reappear in the scene's interaction paths
  const scene = readFileSync(join(ROOT, 'src/scenes/OverworldScene.js'), 'utf8');
  for (const [pat, name] of [[/delayedCall\(\s*180\b/, 'DOOR.AREA_DEBOUNCE_MS'], [/delayedCall\(\s*440\b/, 'DOOR.CHOICE_ENTER_REVEAL_MS'], [/_phaseMs\s*\|\|\s*6000/, 'REPAIR.PHASE_MS_FALLBACK']])
    if (pat.test(scene)) iviol.push(`OverworldScene.js uses a bare interaction literal where ${name} should be used`);
  // (c) standards defines the INTERACTION + DOOR blocks with the documented keys + the source index exists
  const std = readFileSync(join(ROOT, 'src/constants/standards.js'), 'utf8');
  for (const key of ['NO_FACING_FRAC', 'FACING_AWAY_DOT', 'ENTRY_FRAME_BUDGET', 'AREA_DEBOUNCE_MS', 'CHOICE_ENTER_REVEAL_MS'])
    if (!std.includes(key)) iviol.push(`standards.js is missing the interaction constant ${key}`);
  if (!/INTERACTION-STANDARDS/.test(std)) iviol.push('standards.js is missing the ★ INTERACTION-STANDARDS index (name/value/source)');
  if (iviol.length) fail('NO-INLINE-INTERACTION-LITERALS:' + iviol.map((v) => '\n      ' + v).join(''));
  else ok('no-inline-interaction-literals: interaction code uses only NAMED standards.js constants (INTERACTION/DOOR/GUARD/REPAIR) — every distance/window/offset has a source-tagged constant');
}

// --- summary ------------------------------------------------------------------
if (fails.length) {
  console.error('\nVERIFY FAILED ✗\n' + fails.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('\nVERIFY PASSED ✅');
