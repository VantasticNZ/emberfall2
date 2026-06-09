// =============================================================================
// WORLD MAP PLAN generator (Van's circles-and-lines method) — every place is a CIRCLE sized by its
// CONTENT LOAD, placed on a SQUARE CHUNK GRID, joined by path LINES (gated per gating.js), over the
// geography (mountains/ocean/rivers/forest/swamp/desert). The node sizes + grid positions in this
// script ARE the spec (mirrored in docs/WORLD-MAP-PLAN.md). Output: docs/world-map-plan.svg.
// Grid = the derived OVERWORLD: 24×24 chunks (CHUNK 32 tiles) = 768×768 tiles. Cities/dungeons/
// interiors are SEPARATE enterable scenes (Phase-0 system) — drawn on the overworld as their ENTRANCE
// + a "→ separate AxB map" tag, so the overworld stays streamable. Supersedes WORLD-GRAPH (adds tile
// sizes + the grid + the cross-check). Run: node this file.
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GRID = 24, CPX = 34, PAD = 70;                 // 24 chunks, 34px/chunk on the drawing
const Wd = GRID * CPX + PAD * 2 + 330, Ht = GRID * CPX + PAD * 2 + 40;
const cx = (gx) => PAD + gx * CPX, cy = (gy) => PAD + gy * CPX;   // chunk → px

const REG = {
  Greenhollow: '#74b24e', Marsh: '#56988c', Peaks: '#93a0b8', Coast: '#4a90cf',
  Emberwood: '#d96f3c', Spire: '#bcaadf', Forest: '#4a8a40', Desert: '#d4ad6a',
};
// biome footprints on the grid: [reg, gx, gy, gw, gh] (chunks) — tinted areas + the geography
const BIOMES = [
  ['Spire', 9, 0.5, 6, 3.5], ['Peaks', 8.5, 4, 7.5, 5], ['Greenhollow', 9, 9.5, 6.5, 5],
  ['Marsh', 1.5, 9, 6.5, 6], ['Coast', 16.5, 8.5, 6.5, 7], ['Emberwood', 8.5, 15, 6.5, 5.5],
  ['Forest', 15, 15, 5, 4.5], ['Desert', 18.5, 18.5, 5, 5],
];
// node: [id,label,region,tier,gx,gy, tiles(WxH or 'WxH x N floors'), separate?, content]
const N = [
  // ---- the spine settlements (overworld exteriors) ----
  ['gh', 'Greenhollow', 'Greenhollow', 'town', 11.7, 11.7, '64×52', 0, 'M1-7·SG1-7·~13 NPC·7 interiors (the hub)'],
  ['mirefen', 'Mirefen', 'Marsh', 'town', 4.2, 12.4, '44×36', 0, 'M8·SA1·Yssa·bog hut-town (~6 NPC)'],
  ['caught', 'Caught Settlement', 'Emberwood', 'town', 11.6, 17.4, '56×44', 0, 'M15·SE2 the split halves'],
  // ---- the 3 HUGE CITIES (separate, multi-district scenes) ----
  ['stonereach', 'STONEREACH', 'Peaks', 'city', 12.2, 6.4, '96×80', 1, 'M11·SP1-3·miners/Mike Hunt·Order seat·mine office·terraced streets·~7 NPC'],
  ['capital', 'ORACLE CAPITAL', 'Spire', 'city', 11.7, 2.1, '104×88', 1, 'M17·Sela seat·libraries/temples/ancient-texts·civic districts'],
  ['saltbreak', 'SALTBREAK', 'Coast', 'city', 19.2, 12.2, '120×96', 1, 'M13·ST1-5/ST8·Hugh Jass+Harbourmaster·docks/underworld/market/mansions·CAM3·the densest'],
  // ---- expansion settlements ----
  ['thornwell', 'Thornwell', 'Forest', 'town', 17, 17.3, '50×40', 0, '[exp] forest town·woodfolk'],
  ['dustreach', 'Dustreach', 'Desert', 'town', 21, 20.8, '48×38', 0, '[exp] desert trade-outpost'],
  ['fenwick', 'Fenwick', 'Marsh', 'village', 6.6, 14.2, '34×28', 0, '[exp] marsh-edge fisherfolk'],
  ['cribbins', 'Cribbins Cove', 'Coast', 'village', 17, 14.8, '32×26', 0, '[exp] fishing village'],
  ['cragfoot', 'Cragfoot', 'Peaks', 'village', 9.4, 4.8, '30×24', 0, '[exp] mountain hamlet'],
  ['oasis', 'Mirage Oasis', 'Desert', 'village', 22.6, 19, '30×24', 0, '[exp] oasis village'],
  ['nomad', 'Nomad Camp', 'Desert', 'huttown', 19.4, 22.4, '26×22', 0, '[exp] desert hut-town'],
  // ---- DUNGEONS (separate, multi-floor) ----
  ['shrine', 'Sunken Shrine', 'Marsh', 'dungeon', 2.6, 14.4, '36×28 ×3F', 1, 'M9·Drowned Guardian·lantern·shard 1·+crypts(SA3)'],
  ['keep', 'Cinder Keep', 'Peaks', 'dungeon', 14.4, 4.6, '40×32 ×3F', 1, 'M12·Keep Sentinel·grapple·shard 2·records-library(SP1)'],
  ['vault', 'Drowned Vault', 'Coast', 'dungeon', 21.4, 14.6, '36×30 ×2F', 1, 'M14·Tideward·hookshot·shard 3·+tide-caves(ST2)'],
  ['hollow', 'Ember Hollow', 'Emberwood', 'dungeon', 11.7, 19.6, '38×30 ×2F', 1, 'M16·Feverheart·fire/frost·shard 4·split altar'],
  ['spire', 'The Hollow Spire', 'Spire', 'dungeon', 13.4, 0.9, '44×36 ×4F', 1, 'M18-20·the Ascent·Binding Chamber·boss·shard 5·the finale'],
  ['forestruin', 'Overgrown Ruin', 'Forest', 'dungeon', 18.6, 18.8, '34×26 ×2F', 1, '[exp] lost-civilization texts'],
  ['temple', 'Sunken Temple', 'Desert', 'dungeon', 22.4, 22, '36×28 ×2F', 1, '[exp] buried temple-library'],
  // ---- secrets / landmarks (overworld) ----
  ['cave', 'Boarded Cave', 'Greenhollow', 'secret', 13.7, 11.2, '16×12', 1, 'M4·weeping-flame carving'],
  ['weeping', 'Weeping Tree', 'Emberwood', 'secret', 9.6, 19.4, '14×12', 0, 'SE4·god-fragment·Liberator nudge'],
  ['highpass', 'High Pass', 'Peaks', 'secret', 15.2, 6.6, '20×16', 0, 'SP4 grapple cache·SP2 Crag Beast'],
  ['lighthouse', 'The Lighthouse', 'Coast', 'landmark', 18.4, 9.6, '18×14 ×3F', 1, 'ST3 Holden·multi-floor'],
  ['marble', 'Marble Hall', 'Peaks', 'landmark', 10.4, 7.6, '20×16', 1, 'CAM1 the Cynic·a mansion'],
  ['fen', 'The Fen', 'Marsh', 'secret', 5.4, 10.6, '16×14', 0, 'SA4 the Frog·SA5 reeds'],
];

// paths: [from,to,gate|null]  (gate per gating.js; the critical spine + intra-region + expansion)
const E = [
  ['gh', 'mirefen', null], ['gh', 'stonereach', 'shard_1'], ['gh', 'saltbreak', 'tool_grapple'], ['gh', 'caught', 'tool_hookshot'],
  ['stonereach', 'capital', 'tool_firefrost'], ['capital', 'spire', null],
  ['gh', 'cave', 'tool_lantern'], ['mirefen', 'shrine', null], ['mirefen', 'fen', null], ['mirefen', 'fenwick', null],
  ['stonereach', 'keep', null], ['stonereach', 'highpass', 'tool_grapple'], ['stonereach', 'marble', null], ['stonereach', 'cragfoot', null],
  ['saltbreak', 'vault', null], ['saltbreak', 'lighthouse', null], ['saltbreak', 'cribbins', null],
  ['caught', 'hollow', null], ['caught', 'weeping', null],
  ['saltbreak', 'thornwell', 'new'], ['thornwell', 'forestruin', null], ['thornwell', 'caught', 'new'],
  ['saltbreak', 'dustreach', 'new'], ['dustreach', 'oasis', null], ['dustreach', 'temple', 'new'], ['dustreach', 'nomad', null],
];
const RIVER = [[12, 4], [12, 8], [13, 11], [14, 12], [16, 13], [19, 13], [22, 13.5]];   // N→E delta

const TIER = { city: 30, town: 19, village: 12, huttown: 12, dungeon: 17, secret: 10, landmark: 11 };
const byId = Object.fromEntries(N.map((n) => [n[0], n]));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}" font-family="monospace">\n`;
s += `<rect width="${Wd}" height="${Ht}" fill="#0a0e08"/>\n`;
s += `<rect x="${cx(16.5)}" y="${cy(0)}" width="${cx(24) - cx(16.5)}" height="${cy(24) - cy(0)}" fill="#0e2740" opacity="0.5"/>\n`;   // the OCEAN (E)
s += `<text x="${cx(21)}" y="${cy(6)}" fill="#3f86c4" font-size="13" opacity="0.7" text-anchor="middle">~ OCEAN ~</text>\n`;
// biome tints
for (const [reg, gx, gy, gw, gh] of BIOMES) {
  s += `<rect x="${cx(gx)}" y="${cy(gy)}" width="${gw * CPX}" height="${gh * CPX}" rx="14" fill="${REG[reg]}" opacity="0.13" stroke="${REG[reg]}" stroke-opacity="0.45" stroke-width="1.5"/>\n`;
  s += `<text x="${cx(gx) + 6}" y="${cy(gy) + 16}" fill="${REG[reg]}" font-size="11" font-weight="bold" opacity="0.85">${reg.toUpperCase()}</text>\n`;
}
s += `<text x="${cx(12)}" y="${cy(0.4)}" fill="#aab4c4" font-size="11" text-anchor="middle" opacity="0.7">▲▲ MOUNTAINS ▲▲</text>\n`;
// grid
for (let i = 0; i <= GRID; i++) {
  const major = i % 4 === 0;
  s += `<line x1="${cx(i)}" y1="${cy(0)}" x2="${cx(i)}" y2="${cy(GRID)}" stroke="#2a3528" stroke-width="${major ? 1.1 : 0.5}" opacity="${major ? 0.8 : 0.4}"/>`;
  s += `<line x1="${cx(0)}" y1="${cy(i)}" x2="${cx(GRID)}" y2="${cy(i)}" stroke="#2a3528" stroke-width="${major ? 1.1 : 0.5}" opacity="${major ? 0.8 : 0.4}"/>`;
  if (major) { s += `<text x="${cx(i)}" y="${cy(0) - 6}" fill="#5b6b4f" font-size="9" text-anchor="middle">${i}</text>`; s += `<text x="${cx(0) - 8}" y="${cy(i) + 3}" fill="#5b6b4f" font-size="9" text-anchor="end">${i}</text>`; }
}
s += `<text x="${cx(12)}" y="${cy(GRID) + 26}" fill="#7c8a6e" font-size="11" text-anchor="middle">↑ grid = CHUNKS (1 chunk = 32 tiles) · the overworld = 24×24 chunks = 768×768 tiles ↑</text>\n`;
// river
s += `<polyline points="${RIVER.map((p) => `${cx(p[0])},${cy(p[1])}`).join(' ')}" fill="none" stroke="#3f86c4" stroke-width="5" opacity="0.55" stroke-linecap="round"/>\n`;
s += `<text x="${cx(15)}" y="${cy(11.4)}" fill="#5a9fd6" font-size="9" opacity="0.7">river + bridges →</text>\n`;
// paths
for (const [a, b, gate] of E) {
  const na = byId[a], nb = byId[b]; if (!na || !nb) continue;
  const isNew = gate === 'new', col = isNew ? '#7d6a3a' : gate ? '#d98b3a' : '#5a6b4a';
  s += `<line x1="${cx(na[4])}" y1="${cy(na[5])}" x2="${cx(nb[4])}" y2="${cy(nb[5])}" stroke="${col}" stroke-width="${gate ? 2.4 : 1.8}" ${gate ? 'stroke-dasharray="7 5"' : ''} opacity="0.85"/>\n`;
  if (gate && !isNew) { const mx = (cx(na[4]) + cx(nb[4])) / 2, my = (cy(na[5]) + cy(nb[5])) / 2; s += `<text x="${mx}" y="${my - 3}" fill="#ffcf8a" font-size="8.5" text-anchor="middle">🔒${gate.replace('tool_', '').replace('shard_', 'shard ')}</text>\n`; }
}
// nodes (circle sized by sqrt(content footprint), label + tile-size)
for (const [id, label, reg, tier, gx, gy, tiles, sep, content] of N) {
  const r = TIER[tier], px = cx(gx), py = cy(gy), col = REG[reg];
  if (tier === 'dungeon' || tier === 'secret') s += `<polygon points="${px},${py - r} ${px + r},${py} ${px},${py + r} ${px - r},${py}" fill="${col}" stroke="#0a0e08" stroke-width="2"/>\n`;
  else s += `<circle cx="${px}" cy="${py}" r="${r}" fill="${col}" stroke="#0a0e08" stroke-width="2" ${tier === 'city' ? 'stroke-dasharray="0"' : ''}/>\n`;
  const fs = tier === 'city' ? 12 : tier === 'town' ? 11 : 9;
  s += `<text x="${px}" y="${py + r + fs}" fill="#eef3e6" font-size="${fs}" font-weight="${tier === 'city' || tier === 'town' ? 'bold' : 'normal'}" text-anchor="middle" stroke="#0a0e08" stroke-width="3.5" paint-order="stroke">${esc(label)}</text>\n`;
  s += `<text x="${px}" y="${py + r + fs + 11}" fill="${sep ? '#ffcf8a' : '#9fb89a'}" font-size="8" text-anchor="middle" stroke="#0a0e08" stroke-width="3" paint-order="stroke">${tiles}${sep ? ' ⇲sep' : ''}</text>\n`;
  s += `<title>${esc(label)} [${tier}] ${tiles} — ${esc(content)}</title>\n`;
}
// title + legend (right panel)
s += `<text x="${PAD}" y="34" fill="#fff6df" font-size="20" font-weight="bold">EMBERFALL 2 — WORLD MAP PLAN (gridded, content-sized)</text>\n`;
const lx = GRID * CPX + PAD + 24, ly = PAD + 6;
const leg = [
  ['● CITY (separate, multi-district)', '#fff'], ['● town / village', '#cdd8c4'], ['◆ dungeon (separate, ×N floors)', '#cdd8c4'],
  ['◆ secret/landmark', '#cdd8c4'], ['— path · 🔒 = tool-gate', '#d98b3a'], ['— dashed grey = new biome', '#7d6a3a'],
  ['⇲sep = a separate enterable scene', '#ffcf8a'], ['tint = biome · blue = ocean/river', '#5a9fd6'],
];
s += `<text x="${lx}" y="${ly}" fill="#ffe9c2" font-size="13" font-weight="bold">LEGEND — circle size = content load</text>\n`;
leg.forEach((l, i) => { s += `<text x="${lx}" y="${ly + 22 + i * 17}" fill="${l[1]}" font-size="11">${l[0]}</text>\n`; });
const dims = [
  '', 'DERIVED DIMENSIONS', 'Overworld: 24×24 chunks', '   = 768×768 tiles (24576 px)', '   (now 20×20; ≤ engine streaming)',
  '', 'SEPARATE enterable scenes:', '· 3 cities (multi-district)', '· ~10 dungeons (×2-4 floors)', '· ~30-50 interiors',
  '   → ~55-70 scenes total', '', 'GH centred (chunk 12,12).', 'Cities/dungeons = doors on', 'the overworld → own maps.',
];
dims.forEach((d, i) => { const yy = ly + 22 + leg.length * 17 + 18 + i * 16; s += `<text x="${lx}" y="${yy}" fill="${/DIMENSIONS|scenes/.test(d) ? '#ffe9c2' : '#cdd8c4'}" font-size="${/DIMENSIONS/.test(d) ? 12 : 11}" font-weight="${/DIMENSIONS/.test(d) ? 'bold' : 'normal'}">${d}</text>\n`; });
s += `<text x="${Wd - 16}" y="${Ht - 12}" fill="#5b6b4f" font-size="10" text-anchor="end">${N.length} places · sized from 66 quests / 30+ NPC / 40+ places · DESIGN — approve before building</text>\n`;
s += `</svg>\n`;

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'world-map-plan.svg'), s);
const byTier = {}; for (const n of N) byTier[n[3]] = (byTier[n[3]] || 0) + 1;
console.log('world-map-plan.svg:', N.length, 'places,', E.length, 'paths; by tier', JSON.stringify(byTier));
