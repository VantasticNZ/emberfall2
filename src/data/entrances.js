// =============================================================================
// ENTRANCE CONTRACTS — the world's CONNECTION MODEL as machine-checkable DATA.
// Regions are modular: their INTERIORS are free to change, but they connect to
// each other only through a few DECLARED ENTRANCES. An entrance is a two-sided
// contract — region A's entrance to B must match B's entrance to A (same coords,
// same gate). verify.mjs (ENTRANCE-COHERENCE gate) enforces:
//   (a) two-sided HANDSHAKE  — every entrance has a reciprocal at the same coords + gate,
//   (b) GATE matches gating.js — an entrance INTO a gated area carries that area's key,
//   (c) REACHABILITY          — every built region is reachable from Greenhollow.
// This lets us rebuild a region's interior freely (e.g. the Peaks re-fix) as long as
// the entrance coords/gate stay coherent — the modular connection contract.
//
// Each entrance: { region, to, at:{tx,ty} WORLD tiles, gate: SSOT flag id | null }.
//   reserved:true = a planned link whose OTHER side isn't built yet (per WORLD-BLUEPRINT);
//   it is gate-checked but skipped by the two-sided handshake until its region exists.
// Region keys match REGIONS[].key. Gate ids are canonical SSOT (flags.js) — a typo fails verify.
// =============================================================================

import { TOOLS, SHARDS } from '../constants/flags.js';

export const ENTRANCES = [
  // --- BUILT links (two-sided, fully verified) ---------------------------------
  // Greenhollow ↔ West Belt (the GH west trailhead; shared edge tile x288)
  { region: 'Greenhollow', to: 'Belt',        at: { tx: 288, ty: 310 }, gate: null },
  { region: 'Belt',        to: 'Greenhollow', at: { tx: 288, ty: 310 }, gate: null },
  // West Belt ↔ Ashen Marsh (Belt west / Marsh east; shared edge tile x278)
  { region: 'Belt',        to: 'Marsh',       at: { tx: 278, ty: 310 }, gate: null },
  { region: 'Marsh',       to: 'Belt',        at: { tx: 278, ty: 310 }, gate: null },
  // Greenhollow ↔ Foothill route (the GH north trailhead ~x313; shared edge tile y288)
  { region: 'Greenhollow', to: 'Foothill',    at: { tx: 313, ty: 288 }, gate: null },
  { region: 'Foothill',    to: 'Greenhollow', at: { tx: 313, ty: 288 }, gate: null },
  // Foothill ↔ Sundered Peaks (the rockfall mouth; shared edge tile y278) — GATED shard_1
  { region: 'Foothill',    to: 'Peaks',       at: { tx: 313, ty: 278 }, gate: SHARDS.shard_1 },
  { region: 'Peaks',       to: 'Foothill',    at: { tx: 313, ty: 278 }, gate: SHARDS.shard_1 },

  // --- WORLD-SKELETON greybox links (now BUILT two-sided; interiors are nav-greybox) ----------
  // Greenhollow ↔ Tidewreck Coast via the river-road gorge (E; shared edge tile x340) — grapple gate
  { region: 'Greenhollow', to: 'Coast',       at: { tx: 340, ty: 305 }, gate: TOOLS.tool_grapple },
  { region: 'Coast',       to: 'Greenhollow', at: { tx: 340, ty: 305 }, gate: TOOLS.tool_grapple },
  // Greenhollow ↔ Emberwood via the ashen-road chasm (S; shared edge tile y328) — hookshot gate
  { region: 'Greenhollow', to: 'Emberwood',   at: { tx: 320, ty: 328 }, gate: TOOLS.tool_hookshot },
  { region: 'Emberwood',   to: 'Greenhollow', at: { tx: 320, ty: 328 }, gate: TOOLS.tool_hookshot },
  // Sundered Peaks ↔ Hollow Spire via the gated ascent (N; shared edge tile y218) — firefrost gate
  { region: 'Peaks',       to: 'Spire',       at: { tx: 320, ty: 218 }, gate: TOOLS.tool_firefrost },
  { region: 'Spire',       to: 'Peaks',       at: { tx: 320, ty: 218 }, gate: TOOLS.tool_firefrost },
];
