// =============================================================================
// WORLD GRAPH generator — draws the CONTENT-SIZED world as a 2D node+edge map (SVG).
// Nodes are sized by their CONTENT LOAD (a city holding many quests = big; a single-quest
// spot = small); edges are the paths (gated edges dashed + tool-labelled, per gating.js);
// colour = region; geography (rivers/biomes) indicated. The NODES/EDGES data below IS the
// spec (mirrored in docs/WORLD-GRAPH.md). Output: docs/world-graph.svg. Run: node this file.
// Sized FROM the content (WORLD-SCALE-DOD.md audit) so the world can't be too small.
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const Wd = 1720, Ht = 1180;

// region palette
const REG = {
  Greenhollow: { c: '#74b24e', bg: '#1c3216' }, Marsh: { c: '#56988c', bg: '#13302c' },
  Peaks: { c: '#93a0b8', bg: '#1f2733' }, Coast: { c: '#4a90cf', bg: '#102536' },
  Emberwood: { c: '#d96f3c', bg: '#2e1810' }, Spire: { c: '#bcaadf', bg: '#221d33' },
  Forest: { c: '#4a8a40', bg: '#16290f', exp: 1 }, Desert: { c: '#d4ad6a', bg: '#33270f', exp: 1 },
};
// tier → shape + size + base font
const TIER = {
  hugecity: { sh: 'star', r: 30, fs: 15, b: 1 }, city: { sh: 'circle', r: 25, fs: 14, b: 1 },
  town: { sh: 'circle', r: 18, fs: 12 }, village: { sh: 'circle', r: 12, fs: 10 },
  huttown: { sh: 'hex', r: 13, fs: 10 }, dungeon: { sh: 'diamond', r: 17, fs: 10 },
  cave: { sh: 'diamond', r: 11, fs: 9 }, secret: { sh: 'tri', r: 11, fs: 8 }, landmark: { sh: 'dot', r: 8, fs: 8 },
};

// ---- NODES: [id, label, region, tier, x, y, holds] (holds = the content it homes) ----
const N = [
  // SPIRE (far N)
  ['spire_capital', 'Oracle Capital', 'Spire', 'hugecity', 800, 80, 'Sela\'s civic-religious seat · libraries/temples/ancient-texts · M17 approach'],
  ['spire_ascent', 'The Long Ascent', 'Spire', 'dungeon', 800, 165, 'M18 gauntlet (multi-floor; all 4 tool-gates) · THE CHICKEN landing'],
  ['spire_binding', 'Binding Chamber', 'Spire', 'dungeon', 895, 150, 'M19 boss · M20 the 5-ending finale · shard 5'],
  // PEAKS (upper)
  ['peaks_town', 'Stonereach', 'Peaks', 'hugecity', 800, 300, 'M11 · SP1-3 · miners/Mike Hunt/Stonewright · the Order seat · mine office · terraced streets'],
  ['peaks_lowtown', 'Quarryside', 'Peaks', 'town', 860, 360, '[exp] lower mining town · workers\' quarter'],
  ['peaks_keep', 'Cinder Keep', 'Peaks', 'dungeon', 905, 268, 'M12 (Keep Sentinel · grapple · shard 2)'],
  ['peaks_records', 'Order\'s Records', 'Peaks', 'cave', 965, 300, 'SP1 the lie\'s depth · a records-library floor'],
  ['peaks_mine', 'The Deep Mine', 'Peaks', 'dungeon', 700, 268, 'SP3 dispute · PH1 the runaway cart'],
  ['peaks_marble', 'Pellamy\'s Marble Hall', 'Peaks', 'landmark', 678, 340, 'CAM1 the Cynic (Diogenes) · a noble mansion interior'],
  ['peaks_highpass', 'High Pass', 'Peaks', 'secret', 905, 205, 'SP4 grapple cache · sky-iron charm'],
  ['peaks_crags', 'High Crags', 'Peaks', 'secret', 965, 240, 'SP2 the Crag Beast bounty'],
  ['peaks_hamlet', 'Cragfoot Hamlet', 'Peaks', 'village', 640, 230, '[exp] mountain hamlet · foothill cast + rest'],
  // GREENHOLLOW (hub centre)
  ['gh_town', 'Greenhollow', 'Greenhollow', 'town', 800, 580, 'M1-M7 · SG1-7 · GHUB · the Act-1 cast · plaza/districts'],
  ['gh_interiors', 'GH interiors', 'Greenhollow', 'landmark', 870, 560, 'Tankard(+upstairs SG5) · Pem\'s Store(SG2) · Forge(SG3) · Chapel · Manor · homes'],
  ['gh_cave', 'Boarded Cave', 'Greenhollow', 'cave', 730, 632, 'M4 the weeping-flame carving (ending-A seed)'],
  ['gh_orchard', 'The Orchard', 'Greenhollow', 'landmark', 880, 632, 'SG7 the orchard thief'],
  ['gh_crossroads', 'Crossroads', 'Greenhollow', 'landmark', 800, 505, 'GAG1 the wits · the waystone fork (N/W/E/S)'],
  ['gh_caches', 'Vale caches', 'Greenhollow', 'secret', 715, 560, '3 hidden caches (40/25/15g)'],
  ['gh_sisyphus', 'Sisyphus Hill', 'Greenhollow', 'landmark', 905, 510, 'CAM2 the eternal boulder'],
  ['gh_baker', 'The Bakery', 'Greenhollow', 'landmark', 740, 600, 'CAM7 Constable Wiremu — "blow on the pie" (the jandal-cop seed)'],
  ['gh_farmtown', 'Brookfield', 'Greenhollow', 'town', 935, 600, '[exp] vale farming town · crops/livestock · light sides'],
  ['gh_pem', 'Pem\'s Marks', 'Greenhollow', 'secret', 800, 458, 'SG2 — "PEM WOZ ERE" 1-of-4 marks/region → the hidden Pem'],
  ['gh_wanderer', 'The Wanderer', 'Greenhollow', 'landmark', 985, 465, 'CAM5 rare-spawn time-traveller (roams all regions)'],
  ['river_town', 'Fordwater', 'Forest', 'town', 1010, 558, '[exp] river-crossing town · bridges/ferry · trade'],
  // MARSH (W)
  ['marsh_mirefen', 'Mirefen', 'Marsh', 'huttown', 330, 580, 'M8 · SA1 · Yssa + bog-folk · stilt hut-town'],
  ['marsh_hagga', 'Hagga\'s Hut', 'Marsh', 'landmark', 215, 552, 'M8/M10 the truth · across the black water'],
  ['marsh_shrine', 'Sunken Shrine', 'Marsh', 'dungeon', 268, 660, 'M9 (Drowned Guardian · lantern · shard 1)'],
  ['marsh_crypts', 'Drowned Crypts', 'Marsh', 'cave', 210, 690, 'SA3 lantern-loot'],
  ['marsh_fen', 'The Fen', 'Marsh', 'secret', 405, 668, 'SA4 the Frog (puzzle-not-fight) · SA5 reeds'],
  ['marsh_karl', 'Karl\'s Hummock', 'Marsh', 'landmark', 405, 530, 'CAM4 star-gazer (night) · NIGHT1 bog-wraith'],
  ['marsh_vell', 'Vell\'s Bog', 'Marsh', 'landmark', 300, 712, 'PH5 the Experience Stone'],
  ['marsh_village', 'Fenwick', 'Marsh', 'village', 440, 600, '[exp] marsh-edge village · fisherfolk'],
  // COAST (E) — a HUGE city
  ['coast_saltbreak', 'Saltbreak', 'Coast', 'hugecity', 1290, 560, 'M13 · ST1-5/ST8 · Hugh Jass + Harbourmaster · docks/underworld/market · tavern(PH2/EDG1) · CAM3'],
  ['coast_vault', 'Drowned Vault', 'Coast', 'dungeon', 1395, 622, 'M14 (Tideward · hookshot · shard 3) · tide-timed'],
  ['coast_tidecaves', 'Tide-Caves', 'Coast', 'cave', 1450, 590, 'ST2 hookshot-loot (between tides)'],
  ['coast_lighthouse', 'The Lighthouse', 'Coast', 'landmark', 1375, 470, 'ST3 Holden (grief mirror) · a multi-floor interior'],
  ['coast_wrecks', 'The Wrecks', 'Coast', 'secret', 1440, 528, 'ST4 the Wreck Wraith · ST8 the strand bottle'],
  ['coast_headland', 'The Headland', 'Coast', 'landmark', 1185, 478, 'EDG2 flowers · EDG1 the midnight raid'],
  ['coast_fishing', 'Cribbins Cove', 'Coast', 'village', 1180, 648, '[exp] fishing village · coast cast'],
  ['coast_lowtown', 'Saltmere', 'Coast', 'town', 1150, 605, '[exp] coast market town below Saltbreak'],
  // EMBERWOOD (S)
  ['ember_settlement', 'The Caught Settlement', 'Emberwood', 'town', 800, 850, 'M15 · SE2 the burning/freezing halves (the heavy choice)'],
  ['ember_hollow', 'Ember Hollow', 'Emberwood', 'dungeon', 800, 950, 'M16 (Feverheart · fire/frost · shard 4 · the split altar)'],
  ['ember_weeping', 'Weeping Tree Grove', 'Emberwood', 'secret', 705, 918, 'SE4 the god-fragment (Liberator nudge)'],
  ['ember_ridges', 'Burning Ridges', 'Emberwood', 'secret', 895, 918, 'SE5 the Cinder Stag · SE1 the burn/freeze seam'],
  ['ember_relics', 'Ashen Relics', 'Emberwood', 'cave', 880, 980, 'SE3 fire/frost-gated treasure'],
  ['ember_vinizar', 'Vinizar\'s Feast', 'Emberwood', 'landmark', 712, 982, 'CAM6 the Chill Prophet'],
  // NEW BIOMES (expansion — fill Van\'s ceiling; NOT yet in gating.js — flagged)
  ['forest_town', 'Thornwell', 'Forest', 'town', 1055, 730, '[exp] deep-forest town · woodfolk culture'],
  ['forest_dungeon', 'The Overgrown Ruin', 'Forest', 'dungeon', 1130, 790, '[exp] forest ruin · a lost-civilization texts cache'],
  ['forest_secret', 'Hunter\'s Cache', 'Forest', 'secret', 1010, 780, '[exp] grove cache · the ninja-gran / gunhand standout spots'],
  ['forest_village', 'Woodmere', 'Forest', 'village', 1100, 690, '[exp] forest woodcutter village'],
  ['desert_outpost', 'Dustreach', 'Desert', 'town', 1370, 860, '[exp] desert trade-outpost town'],
  ['desert_oasis', 'Mirage Oasis', 'Desert', 'village', 1455, 808, '[exp] oasis village'],
  ['desert_temple', 'Sunken Temple', 'Desert', 'dungeon', 1440, 930, '[exp] buried temple-library — ancient civilization/texts'],
  ['desert_camp', 'Nomad Camp', 'Desert', 'huttown', 1290, 930, '[exp] nomad hut-town'],
];

// ---- EDGES: [from, to, gate|null] (gate = tool/shard the path needs, per gating.js) ----
const E = [
  // region spine (gating DAG)
  ['gh_town', 'marsh_mirefen', null],            // GH ↔ Marsh (West Belt, open)
  ['gh_town', 'peaks_town', 'shard_1'],          // GH → Peaks (Foothill, shard_1 rockfall)
  ['gh_town', 'coast_saltbreak', 'tool_grapple'],// GH → Coast (river-gorge)
  ['gh_town', 'ember_settlement', 'tool_hookshot'],// GH → Emberwood (ashen chasm)
  ['peaks_town', 'spire_capital', 'tool_firefrost'],// Peaks → Spire (the ascent, + 4 shards)
  // Spire internal
  ['spire_capital', 'spire_ascent', null], ['spire_ascent', 'spire_binding', null],
  // Peaks internal
  ['peaks_town', 'peaks_keep', null], ['peaks_keep', 'peaks_records', null], ['peaks_town', 'peaks_mine', null],
  ['peaks_town', 'peaks_marble', null], ['peaks_town', 'peaks_highpass', 'tool_grapple'], ['peaks_highpass', 'peaks_crags', null],
  ['peaks_town', 'peaks_hamlet', null],
  // GH internal
  ['gh_town', 'gh_interiors', null], ['gh_town', 'gh_cave', 'tool_lantern'], ['gh_town', 'gh_orchard', null],
  ['gh_town', 'gh_crossroads', null], ['gh_town', 'gh_caches', null], ['gh_crossroads', 'gh_sisyphus', null],
  ['gh_town', 'gh_baker', null], ['gh_town', 'gh_farmtown', null],
  // Marsh internal
  ['marsh_mirefen', 'marsh_hagga', null], ['marsh_mirefen', 'marsh_shrine', null], ['marsh_shrine', 'marsh_crypts', 'tool_lantern'],
  ['marsh_mirefen', 'marsh_fen', null], ['marsh_mirefen', 'marsh_karl', null], ['marsh_mirefen', 'marsh_vell', null], ['marsh_mirefen', 'marsh_village', null],
  // Coast internal
  ['coast_saltbreak', 'coast_vault', null], ['coast_vault', 'coast_tidecaves', 'tool_hookshot'], ['coast_saltbreak', 'coast_lighthouse', null],
  ['coast_saltbreak', 'coast_wrecks', null], ['coast_saltbreak', 'coast_headland', null], ['coast_saltbreak', 'coast_fishing', null],
  // Emberwood internal
  ['ember_settlement', 'ember_hollow', null], ['ember_settlement', 'ember_weeping', null], ['ember_settlement', 'ember_ridges', null],
  ['ember_hollow', 'ember_relics', 'tool_firefrost'], ['ember_settlement', 'ember_vinizar', null],
  ['peaks_town', 'peaks_lowtown', null], ['gh_crossroads', 'gh_pem', null], ['gh_farmtown', 'gh_wanderer', null],
  ['coast_saltbreak', 'coast_lowtown', null],
  // expansion biome links (dashed grey, new — not gated yet)
  ['gh_farmtown', 'river_town', 'new'], ['river_town', 'forest_town', null], ['river_town', 'coast_saltbreak', 'new'],
  ['forest_town', 'forest_dungeon', null], ['forest_town', 'forest_secret', null], ['forest_town', 'forest_village', null], ['forest_town', 'ember_settlement', 'new'],
  ['coast_saltbreak', 'desert_outpost', 'new'], ['desert_outpost', 'desert_oasis', null], ['desert_outpost', 'desert_temple', 'new'], ['desert_outpost', 'desert_camp', null],
];

// river/bridge polyline (the watershed spine N→E, MASTER-MAP) — visual geography
const RIVER = [[800, 120], [790, 300], [810, 500], [840, 560], [1000, 600], [1200, 600], [1290, 560]];

// ---------------- SVG emit ----------------
const byId = Object.fromEntries(N.map((n) => [n[0], n]));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function shape(sh, x, y, r, fill, stroke) {
  const st = `fill="${fill}" stroke="${stroke}" stroke-width="2"`;
  if (sh === 'circle' || sh === 'dot') return `<circle cx="${x}" cy="${y}" r="${r}" ${st}/>`;
  if (sh === 'diamond') return `<polygon points="${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}" ${st}/>`;
  if (sh === 'tri') return `<polygon points="${x},${y - r} ${x + r},${y + r} ${x - r},${y + r}" ${st}/>`;
  if (sh === 'hex') { const p = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' '); return `<polygon points="${p}" ${st}/>`; }
  if (sh === 'star') { let p = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.46 : r; const a = -Math.PI / 2 + i * Math.PI / 5; p += `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)} `; } return `<polygon points="${p}" ${st}/>`; }
  return '';
}
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}" font-family="monospace">\n`;
s += `<rect width="${Wd}" height="${Ht}" fill="#0a0e08"/>\n`;
// region background blobs + titles
const regPts = {}; for (const n of N) (regPts[n[2]] = regPts[n[2]] || []).push(n);
for (const [reg, ns] of Object.entries(regPts)) {
  const xs = ns.map((n) => n[4]), ys = ns.map((n) => n[5]);
  const x0 = Math.min(...xs) - 48, x1 = Math.max(...xs) + 48, y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 46;
  s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="22" fill="${REG[reg].bg}" stroke="${REG[reg].c}" stroke-width="1.5" stroke-opacity="0.5" fill-opacity="0.85" ${REG[reg].exp ? 'stroke-dasharray="6 5"' : ''}/>\n`;
  s += `<text x="${x0 + 10}" y="${y0 + 20}" fill="${REG[reg].c}" font-size="15" font-weight="bold" opacity="0.85">${reg.toUpperCase()}${REG[reg].exp ? ' · new' : ''}</text>\n`;
}
// river
s += `<polyline points="${RIVER.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#3f86c4" stroke-width="6" stroke-opacity="0.45" stroke-linecap="round"/>\n`;
s += `<text x="845" y="455" fill="#5a9fd6" font-size="11" opacity="0.7">↳ the river spine (N→E delta) · bridges where paths cross</text>\n`;
// edges
for (const [a, b, gate] of E) {
  const na = byId[a], nb = byId[b]; if (!na || !nb) continue;
  const isNew = gate === 'new', col = isNew ? '#7d6a3a' : gate ? '#d98b3a' : '#5a6b4a';
  s += `<line x1="${na[4]}" y1="${na[5]}" x2="${nb[4]}" y2="${nb[5]}" stroke="${col}" stroke-width="${gate ? 2.5 : 2}" ${gate ? 'stroke-dasharray="7 5"' : ''} opacity="0.8"/>\n`;
  if (gate && !isNew) { const mx = (na[4] + nb[4]) / 2, my = (na[5] + nb[5]) / 2; s += `<text x="${mx}" y="${my - 3}" fill="#ffcf8a" font-size="9" text-anchor="middle">🔒${gate.replace('tool_', '').replace('shard_', 'shard ')}</text>\n`; }
}
// nodes + labels
for (const [id, label, reg, tier, x, y, holds] of N) {
  const t = TIER[tier], col = REG[reg].c;
  s += shape(t.sh, x, y, t.r, col, '#0a0e08') + '\n';
  const fs = t.fs, ly = y + t.r + fs + 1;
  s += `<text x="${x}" y="${ly}" fill="#eef3e6" font-size="${fs}" font-weight="${t.b ? 'bold' : 'normal'}" text-anchor="middle" stroke="#0a0e08" stroke-width="3" paint-order="stroke">${esc(label)}</text>\n`;
  s += `<title>${esc(label)} [${tier}] — ${esc(holds)}</title>\n`;
}
// legend
const lx = 30, ly = Ht - 150;
s += `<rect x="${lx - 10}" y="${ly - 24}" width="430" height="146" rx="8" fill="#101510" stroke="#5a6b4a"/>\n`;
s += `<text x="${lx}" y="${ly}" fill="#ffe9c2" font-size="14" font-weight="bold">LEGEND — node size = content load (the world is sized to its content)</text>\n`;
const leg = [['star', 'HUGE CITY (6-10 streets, enterable)'], ['circle', 'city / town / village (●)'], ['hex', 'hut-town (⬡)'], ['diamond', 'dungeon / cave (◆)'], ['tri', 'secret / treasure (▲)'], ['dot', 'landmark / interior (·)']];
leg.forEach((l, i) => { const yy = ly + 22 + i * 18; s += shape(l[0], lx + 8, yy - 4, 8, '#9fb89a', '#0a0e08') + `<text x="${lx + 26}" y="${yy}" fill="#cdd8c4" font-size="11">${l[1]}</text>\n`; });
s += `<text x="${lx + 230}" y="${ly + 40}" fill="#d98b3a" font-size="11">— dashed + 🔒 = tool-gated path</text>\n`;
s += `<text x="${lx + 230}" y="${ly + 58}" fill="#7d6a3a" font-size="11">— dashed grey = NEW biome (not yet gated)</text>\n`;
s += `<text x="${lx + 230}" y="${ly + 76}" fill="#5a9fd6" font-size="11">blue = river/ocean · region tint = biome</text>\n`;
// title
s += `<text x="${Wd / 2}" y="34" fill="#fff6df" font-size="22" font-weight="bold" text-anchor="middle">EMBERFALL 2 — WORLD GRAPH (the whole plan, sized from the content)</text>\n`;
s += `<text x="${Wd - 20}" y="${Ht - 14}" fill="#5b6b4f" font-size="11" text-anchor="end">${N.length} nodes · ${E.length} edges · sized from 66 quests / 30+ NPCs / 40+ places (WORLD-SCALE-DOD) · DESIGN — review + adjust</text>\n`;
s += `</svg>\n`;

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'world-graph.svg'), s);
// counts by tier (for the report)
const byTier = {}; for (const n of N) byTier[n[3]] = (byTier[n[3]] || 0) + 1;
console.log('world-graph.svg written:', N.length, 'nodes,', E.length, 'edges');
console.log('by tier:', JSON.stringify(byTier));
