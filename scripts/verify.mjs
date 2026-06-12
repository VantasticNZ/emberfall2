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
import { availableStock, buyPrice } from '../src/systems/Economy.js';
import { item as itemDef } from '../src/data/items/index.js';
import { buildingDeed } from '../src/data/buildingDeeds.js';
import { REGIONS, TILE } from '../src/data/worldmap.js';
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
