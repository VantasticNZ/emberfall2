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
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      if (/\bradius:\s*-?\d/.test(line)) magic.push(`${rel}:${i + 1}  bare interaction radius — use INTERACTION_RADIUS`);
      if (/(?:\*\s*32|\b32\s*\*)\b/.test(line)) magic.push(`${rel}:${i + 1}  bare tile size 32 — use TILE`);
    });
  }
})(srcDir);
if (magic.length) fail('magic numbers bypassing the standards SSOT:\n' + magic.map((m) => '      ' + m).join('\n'));
else ok('consistency: no bare interaction-radius / tile-size literals bypass the SSOT');

// --- summary ------------------------------------------------------------------
if (fails.length) {
  console.error('\nVERIFY FAILED ✗\n' + fails.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('\nVERIFY PASSED ✅');
