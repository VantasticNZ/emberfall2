// =============================================================================
// SINGLE SOURCE OF TRUTH — ITEM IDS
// Generated from the live game data (the current canonical set), then frozen.
// A typo'd access is `undefined`; an id referenced in data but absent here is a
// `npm run verify` FAILURE (orphan check). The id of every item defined in src/data/items/. item(id) still validates at runtime.
// =============================================================================

const ids = (...names) => Object.freeze(Object.fromEntries(names.map((n) => [n, n])));

export const ITEM_IDS = ids(
  'archive_key', 'blessed_charm', 'bog_iron', 'book_haggling', 'book_repair', 'book_swordskill',
  'bread', 'cinderhide_cloak', 'corrupt_blade', 'crag_maul', 'fish', 'frost_cloak',
  'greenhollow_house', 'humming_trinket', 'iron_ore', 'lantern_oil', 'leather_jerkin', 'major_potion',
  'meat_pie', 'minor_potion', 'peak_mail', 'pearl_circlet', 'saltbreak_shop', 'skyiron_charm',
  'steel_sword', 'stew', 'tideglass_blade', 'timber', 'wooden_sword',
  'wooden_shield', 'iron_shield', 'tower_shield',
);
