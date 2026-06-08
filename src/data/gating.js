// =============================================================================
// GATING GRAPH — the world's progression DAG as machine-checkable DATA
// (WORLD-BLUEPRINT §3, WORLD-STRUCTURE §2.5 "clear eventual key / no soft-lock").
// verify.mjs lints this for the STRICT no-soft-lock rule: every gated area's key is
// obtainable, no key is locked behind itself, and the graph has no circular gate.
// Keys are canonical SSOT flag ids (tools/shards) — a typo is caught by verify.
//
// Each AREA: `requires` = the keys needed to FIRST-enter it ([] = open from boot);
//            `grants`   = the keys you EARN inside it.
// Each TEASE (see-but-can't-reach): the later `key` whose acquisition makes it
//            reachable — so no tease is an orphan (a tease that never pays off).
// =============================================================================

import { TOOLS, SHARDS } from '../constants/flags.js';

export const GATES = [
  // area              requires (to enter)                              grants (earned inside)
  { area: 'Greenhollow',     region: 'Greenhollow', requires: [],                                      grants: [] },                                   // hub — open from boot (start node)
  { area: 'Ashen Marsh',     region: 'Marsh',       requires: [],                                      grants: [TOOLS.tool_lantern, SHARDS.shard_1] }, // W open; no tool to ENTER (you earn the lantern here)
  { area: 'Sundered Peaks',                          requires: [SHARDS.shard_1],                        grants: [TOOLS.tool_grapple, SHARDS.shard_2] }, // N road opens on the Marsh truth
  { area: 'Tidewreck Coast',                         requires: [TOOLS.tool_grapple],                    grants: [TOOLS.tool_hookshot, SHARDS.shard_3] },// E river-gorge = grapple gate
  { area: 'Emberwood',                               requires: [TOOLS.tool_hookshot],                   grants: [TOOLS.tool_firefrost, SHARDS.shard_4] },// S chasm = hookshot gate
  { area: 'Hollow Spire',                            requires: [SHARDS.shard_1, SHARDS.shard_2, SHARDS.shard_3, SHARDS.shard_4, TOOLS.tool_firefrost], grants: [SHARDS.shard_5] }, // far-N ascent
];

// see-but-can't-reach teases → the later key that pays each one off (§2.5 tease→payoff).
export const TEASES = [
  { id: 'belt_pond_island', where: 'West Belt',   key: TOOLS.tool_hookshot },   // the Ph5 pond-island cache (water gap)
  { id: 'boarded_cave_m4',  where: 'Greenhollow', key: TOOLS.tool_lantern },    // the boarded meadow cave (M4) — dark interior
];
