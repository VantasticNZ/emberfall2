// =============================================================================
// SINGLE SOURCE OF TRUTH — FLAGS (tools / shards / skills / factions)
// Generated from the live game data (the current canonical set), then frozen.
// A typo'd access is `undefined`; an id referenced in data but absent here is a
// `npm run verify` FAILURE (orphan check). These are recorded in the deed namespace too, but kept separate as state flags.
// =============================================================================

const ids = (...names) => Object.freeze(Object.fromEntries(names.map((n) => [n, n])));

export const TOOLS = ids(
  'tool_firefrost', 'tool_grapple', 'tool_hookshot', 'tool_lantern',
  'tool_billhook',   // GH3 — the cut/clear ability: cuts the orchard bramble-choke (+ cuttable props)
);

export const SHARDS = ids(
  'shard_1', 'shard_2', 'shard_3', 'shard_4', 'shard_5',
);

export const SKILLS = ids(
  'skill_repair_discount', 'skill_see_markers',
);

// STORY-STATE markers — karma-NEUTRAL "have I done X once" flags (live in the deed namespace, recorded via a
// dialogue `deed:` option, read by reactive `route` nodes). Not moral; kept here so the orphan-check passes.
export const STATE = ids(
  'bram_greeted',   // talked to Bram at the forge once → his shop opens with the wares, not the first-meeting greeting
);

// faction "lean" markers (set during a region) + the resolved faction flags.
export const FACTIONS = ids(
  'lean_authority', 'lean_owner', 'lean_smugglers', 'lean_workers', 'faction_authority', 'faction_owner',
  'faction_peace', 'faction_smuggler', 'faction_workers',
);

// every flag id, unioned (for the verify orphan-check).
export const ALL_FLAGS = Object.freeze({ ...TOOLS, ...SHARDS, ...SKILLS, ...FACTIONS, ...STATE });
