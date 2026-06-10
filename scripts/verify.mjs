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

import { DEEDS } from '../src/constants/deeds.js';
import { TOOLS, SHARDS, SKILLS, FACTIONS } from '../src/constants/flags.js';
import { ITEM_IDS } from '../src/constants/items.js';
import { QUESTS } from '../src/data/quests/index.js';
import { ITEMS } from '../src/data/items/index.js';
import { SHOPS, JOBS } from '../src/data/economy.js';
import { REGIONS, TILE } from '../src/data/worldmap.js';
import { PROPS, solidBox } from '../src/data/assets.js';
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
  if (offenders.length) fail('COLLISION-MATCHES-VISUAL-MASS violation(s):\n' + offenders.map((s) => '      ' + s).join('\n'));
  else ok('collision matches visual mass: no walk-through solid-mass props (visual mass is solid OR collider-backed)');
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
}

// --- summary ------------------------------------------------------------------
if (fails.length) {
  console.error('\nVERIFY FAILED ✗\n' + fails.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('\nVERIFY PASSED ✅');
