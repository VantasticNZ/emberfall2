// =============================================================================
// MASTER WORLD SPEC — the visual map (the SSOT's picture). Every place is a shape sized to TRUE
// relative scale (r ∝ √tile-area), positioned on the 24×24 chunk grid, joined by connection lines
// COLOURED BY PROGRESSION STAGE (early/mid/late toolkit) and LABELLED by traversal-means + gate. The
// data here IS the spec (mirrored in docs/MASTER-WORLD-SPEC.md). Output: docs/master-world-map.svg.
// =============================================================================
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GRID = 24, CPX = 36, PAD = 64;
const Wd = GRID * CPX + PAD * 2 + 360, Ht = GRID * CPX + PAD * 2 + 30;
const cx = (g) => PAD + g * CPX, cy = (g) => PAD + g * CPX;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const REG = { Greenhollow: '#74b24e', Marsh: '#56988c', Peaks: '#93a0b8', Coast: '#4a90cf', Emberwood: '#d96f3c', Spire: '#bcaadf', Forest: '#4a8a40', Desert: '#d4ad6a' };
const BIOMES = [['Spire', 9, 0.5, 6, 3.5], ['Peaks', 8.5, 4, 7.5, 5], ['Greenhollow', 9, 9.5, 6.5, 5], ['Marsh', 1.5, 9, 6.5, 6], ['Coast', 16.5, 8.5, 6.5, 7], ['Emberwood', 8.5, 15, 6.5, 5.5], ['Forest', 15, 15, 5, 4.5], ['Desert', 18.5, 18.5, 5, 5]];
// [id,label,region,tier,gx,gy, tilesW,tilesH, sep]
const N = [
  ['gh', 'Greenhollow', 'Greenhollow', 'town', 11.7, 11.7, 64, 52, 0],
  ['mirefen', 'Mirefen', 'Marsh', 'town', 4.2, 12.4, 44, 36, 0],
  ['caught', 'Caught Settlement', 'Emberwood', 'town', 11.6, 17.4, 56, 44, 0],
  ['stonereach', 'STONEREACH', 'Peaks', 'city', 12.2, 6.4, 96, 80, 1],
  ['capital', 'ORACLE CAPITAL', 'Spire', 'city', 11.7, 2.2, 104, 88, 1],
  ['saltbreak', 'SALTBREAK', 'Coast', 'city', 19.2, 12.2, 120, 96, 1],
  ['thornwell', 'Thornwell', 'Forest', 'village', 17, 17.3, 34, 28, 0],
  ['dustreach', 'Dustreach', 'Desert', 'village', 21, 20.8, 32, 26, 0],
  ['fenwick', 'Fenwick', 'Marsh', 'village', 6.6, 14.4, 28, 24, 0],
  ['cribbins', 'Cribbins Cove', 'Coast', 'village', 17, 14.9, 28, 24, 0],
  ['cragfoot', 'Cragfoot', 'Peaks', 'village', 9.3, 4.9, 26, 22, 0],
  ['shrine', 'Sunken Shrine', 'Marsh', 'dungeon', 2.6, 14.6, 36, 28, 1],
  ['keep', 'Cinder Keep', 'Peaks', 'dungeon', 14.6, 4.6, 40, 32, 1],
  ['vault', 'Drowned Vault', 'Coast', 'dungeon', 21.6, 14.8, 36, 30, 1],
  ['hollow', 'Ember Hollow', 'Emberwood', 'dungeon', 11.7, 19.8, 38, 30, 1],
  ['spire', 'The Hollow Spire', 'Spire', 'dungeon', 13.6, 0.9, 44, 36, 1],
  ['cave', 'Boarded Cave', 'Greenhollow', 'secret', 13.8, 11.1, 16, 12, 1],
  ['highpass', 'High Pass', 'Peaks', 'secret', 15.4, 6.7, 20, 16, 0],
  ['weeping', 'Weeping Tree', 'Emberwood', 'secret', 9.5, 19.5, 14, 12, 0],
  ['lighthouse', 'Lighthouse', 'Coast', 'landmark', 18.3, 9.5, 18, 14, 1],
];
const byId = Object.fromEntries(N.map((n) => [n[0], n]));
// progressive connections: [from,to, stage(0 early/1 mid/2 late), via, gate]
const STAGE = ['#7fcf6a', '#e0a23a', '#c873d8'];   // early green · mid amber · late violet
const E = [
  // EARLY (start + lantern + dash + cut)
  ['gh', 'mirefen', 0, 'walk (West Belt)', null], ['gh', 'cave', 0, 'lantern', '🔒lantern'], ['mirefen', 'shrine', 0, 'walk→lantern', null],
  ['mirefen', 'fenwick', 0, 'walk', null], ['mirefen', 'shrine', 0, 'walk', null],
  ['gh', 'stonereach', 0, 'walk (Foothill)', '🔒shard_1'],
  // MID (grapple + hookshot)
  ['gh', 'saltbreak', 1, 'grapple (gorge)', '🔒grapple'], ['stonereach', 'highpass', 1, 'grapple', '🔒grapple'],
  ['stonereach', 'keep', 1, 'walk→grapple', null], ['gh', 'caught', 1, 'hookshot (chasm)', '🔒hookshot'],
  ['saltbreak', 'vault', 1, 'hookshot (tide)', '🔒hookshot'], ['saltbreak', 'cribbins', 1, 'walk', null], ['saltbreak', 'lighthouse', 1, 'walk', null],
  ['stonereach', 'cragfoot', 1, 'walk', null], ['caught', 'hollow', 1, 'walk', null], ['caught', 'weeping', 1, 'walk', null],
  ['stonereach', 'saltbreak', 1, '⛓ grapple ridge (2nd route)', '🔒grapple'],   // a NEW mid route between regions
  // LATE (firefrost + spells + story bridges) — the progressive shortcuts (a place gains 2nd/3rd routes)
  ['stonereach', 'capital', 2, 'firefrost + 4 shards', '🔒firefrost'], ['capital', 'spire', 2, 'walk (ascent)', null],
  ['caught', 'hollow', 2, '🔥 fire-melt the ice-block', null],
  ['gh', 'stonereach', 2, '⚡ electric-switch → N gate (shortcut)', null],     // a 2nd GH↔Peaks route
  ['gh', 'saltbreak', 2, '❄ ice-freeze the river → foot-crossing', null],      // a 2nd GH↔Coast route
  ['saltbreak', 'thornwell', 2, '🌀 wind-gap / cut overgrowth', null], ['thornwell', 'dustreach', 2, 'walk', null],
  ['saltbreak', 'caught', 2, '🪵 repaired bridge (story)', null],               // a story-beat link
];

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}" font-family="monospace">\n<rect width="${Wd}" height="${Ht}" fill="#0a0e08"/>\n`;
s += `<rect x="${cx(16.5)}" y="${cy(0)}" width="${cx(24) - cx(16.5)}" height="${cy(24) - cy(0)}" fill="#0e2740" opacity="0.5"/><text x="${cx(21)}" y="${cy(5.5)}" fill="#3f86c4" font-size="12" opacity="0.7" text-anchor="middle">~ OCEAN ~</text>\n`;
for (const [reg, gx, gy, gw, gh] of BIOMES) { s += `<rect x="${cx(gx)}" y="${cy(gy)}" width="${gw * CPX}" height="${gh * CPX}" rx="14" fill="${REG[reg]}" opacity="0.12" stroke="${REG[reg]}" stroke-opacity="0.4"/><text x="${cx(gx) + 6}" y="${cy(gy) + 15}" fill="${REG[reg]}" font-size="10" font-weight="bold" opacity="0.8">${reg.toUpperCase()}</text>\n`; }
for (let i = 0; i <= GRID; i++) { const m = i % 4 === 0; s += `<line x1="${cx(i)}" y1="${cy(0)}" x2="${cx(i)}" y2="${cy(GRID)}" stroke="#2a3528" stroke-width="${m ? 1 : 0.5}" opacity="${m ? 0.7 : 0.35}"/><line x1="${cx(0)}" y1="${cy(i)}" x2="${cx(GRID)}" y2="${cy(i)}" stroke="#2a3528" stroke-width="${m ? 1 : 0.5}" opacity="${m ? 0.7 : 0.35}"/>`; if (m) s += `<text x="${cx(i)}" y="${cy(0) - 5}" fill="#5b6b4f" font-size="8" text-anchor="middle">${i}</text>`; }
// edges (stage-coloured, labelled traversal + gate) — offset duplicate endpoints slightly
const seen = {};
for (const [a, b, st, via, gate] of E) {
  const na = byId[a], nb = byId[b]; if (!na || !nb) continue;
  const k = [a, b].sort().join('|'); const off = (seen[k] = (seen[k] || 0) + 1) - 1;
  const dx = (cy(nb[5]) - cy(na[5])), dy = -(cx(nb[4]) - cx(na[4])); const len = Math.hypot(dx, dy) || 1; const ox = (dx / len) * off * 9, oy = (dy / len) * off * 9;
  const x1 = cx(na[4]) + ox, y1 = cy(na[5]) + oy, x2 = cx(nb[4]) + ox, y2 = cy(nb[5]) + oy;
  s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STAGE[st]}" stroke-width="2" ${gate ? 'stroke-dasharray="6 4"' : ''} opacity="0.9"/>\n`;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  s += `<text x="${mx}" y="${my - 2}" fill="${STAGE[st]}" font-size="7.5" text-anchor="middle" stroke="#0a0e08" stroke-width="2.5" paint-order="stroke">${esc(via)}${gate ? ' ' + gate : ''}</text>\n`;
}
// nodes — TRUE relative scale (r ∝ √area)
for (const [id, label, reg, tier, gx, gy, tw, th, sep] of N) {
  const r = Math.max(6, Math.sqrt(tw * th) * 0.28), px = cx(gx), py = cy(gy), col = REG[reg];
  if (tier === 'dungeon' || tier === 'secret') s += `<polygon points="${px},${py - r} ${px + r},${py} ${px},${py + r} ${px - r},${py}" fill="${col}" stroke="#0a0e08" stroke-width="2"/>\n`;
  else s += `<circle cx="${px}" cy="${py}" r="${r}" fill="${col}" stroke="#0a0e08" stroke-width="2"/>\n`;
  const fs = tier === 'city' ? 12 : tier === 'town' ? 10 : 8.5;
  s += `<text x="${px}" y="${py + r + fs}" fill="#eef3e6" font-size="${fs}" font-weight="${tier === 'city' || tier === 'town' ? 'bold' : 'normal'}" text-anchor="middle" stroke="#0a0e08" stroke-width="3" paint-order="stroke">${esc(label)}</text>\n`;
  s += `<text x="${px}" y="${py + r + fs + 10}" fill="${sep ? '#ffcf8a' : '#9fb89a'}" font-size="7.5" text-anchor="middle" stroke="#0a0e08" stroke-width="2.5" paint-order="stroke">${tw}×${th}${sep ? ' ⇲' : ''}</text>\n`;
}
// title + legend
s += `<text x="${PAD}" y="32" fill="#fff6df" font-size="19" font-weight="bold">EMBERFALL 2 — MASTER WORLD SPEC (true-scale · progressive connections)</text>\n`;
const lx = GRID * CPX + PAD + 22, ly = PAD + 4;
const leg = ['LEGEND', 'circle/◆ size = TRUE tile-scale', '⇲ = separate enterable scene', '', 'CONNECTION STAGE (toolkit):', '— EARLY  (walk·lantern·cut·dash)', '— MID    (grapple·hookshot)', '— LATE   (firefrost·spells·story)', 'dashed = ability/story GATE', '', 'SPELLS open NEW routes:', '⚡ electric-switch · ❄ ice-bridge', '🔥 fire-melt · 🌀 wind-gap · 🪵 bridge', '', 'Each place has 2-3 routes — the', 'world OPENS UP as the toolkit grows.', '', 'OVERWORLD: 24×24 chunks = 768×768', 'tiles + ~55-70 separate scenes.', 'GH centred (chunk 12,12).'];
leg.forEach((t, i) => { const c = /LEGEND|STAGE|SPELLS|OVERWORLD/.test(t) ? '#ffe9c2' : /EARLY/.test(t) ? STAGE[0] : /MID/.test(t) ? STAGE[1] : /LATE/.test(t) ? STAGE[2] : '#cdd8c4'; s += `<text x="${lx}" y="${ly + 16 + i * 16}" fill="${c}" font-size="${/LEGEND/.test(t) ? 13 : 11}" font-weight="${/LEGEND|STAGE|SPELLS|OVERWORLD/.test(t) ? 'bold' : 'normal'}">${t}</text>\n`; });
s += `<text x="${cx(12)}" y="${cy(GRID) + 22}" fill="#7c8a6e" font-size="10" text-anchor="middle">grid = chunks (32 tiles) · cities/dungeons ⇲ are separate scenes · DESIGN — approve before building</text>\n`;
s += `</svg>\n`;
mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'master-world-map.svg'), s);
console.log('master-world-map.svg:', N.length, 'places,', E.length, 'connections');
