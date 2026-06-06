// =============================================================================
// ITEMS — the item database, as DATA. Every item:
//   id, name, type, tier, value, effects[], equipSlot, stack
//   type: weapon | armour | consumable | food | book | trinket | material | key | property
//   value: base gold value (regional price modifiers in src/data/economy.js)
//   effects: [{ atk,def,heal,food,fuel,teaches,skillPoint,rent,... }]
//   equipSlot: 'weapon' | 'body' | 'trinket' (equippable types only)
// Consumed by Inventory (holdings) + Economy (transactions). No logic here.
// =============================================================================

export const ITEMS = [
  // --- weapons -------------------------------------------------------------
  { id: 'wooden_sword', name: 'Wooden Sword', type: 'weapon', tier: 1, value: 15, equipSlot: 'weapon', effects: [{ atk: 3 }] },
  { id: 'steel_sword',  name: 'Steel Sword',  type: 'weapon', tier: 2, value: 80, equipSlot: 'weapon', effects: [{ atk: 8 }] },
  { id: 'crag_maul',    name: 'Crag Maul',    type: 'weapon', tier: 3, value: 250, equipSlot: 'weapon', effects: [{ atk: 14 }] }, // SP2 bounty
  { id: 'tideglass_blade', name: 'Tideglass Blade', type: 'weapon', tier: 3, value: 260, equipSlot: 'weapon', effects: [{ atk: 13 }] }, // ST4 bounty
  // dark gear — only stocked where the player is Corrupt (gating on the shop entry)
  { id: 'corrupt_blade', name: 'Bloodbound Blade', type: 'weapon', tier: 3, value: 200, equipSlot: 'weapon', effects: [{ atk: 15, lifesteal: true }] },

  // --- armour --------------------------------------------------------------
  { id: 'leather_jerkin', name: 'Leather Jerkin', type: 'armour', tier: 1, value: 25, equipSlot: 'body', effects: [{ def: 2 }] },
  { id: 'peak_mail',      name: 'Peak Mail',      type: 'armour', tier: 2, value: 120, equipSlot: 'body', effects: [{ def: 6 }] },
  { id: 'frost_cloak',    name: 'Frost Cloak',    type: 'armour', tier: 2, value: 140, equipSlot: 'body', effects: [{ def: 4, frostResist: true }] },
  { id: 'cinderhide_cloak', name: 'Cinderhide Cloak', type: 'armour', tier: 2, value: 160, equipSlot: 'body', effects: [{ def: 5, fireResist: true }] }, // SE5

  // --- trinkets ------------------------------------------------------------
  { id: 'pearl_circlet',  name: 'Pearl Circlet',  type: 'trinket', tier: 3, value: 220, equipSlot: 'trinket', effects: [{ cha: 2 }] }, // ST2
  { id: 'skyiron_charm',  name: 'Sky-Iron Charm', type: 'trinket', tier: 2, value: 150, equipSlot: 'trinket', effects: [{ luck: 1 }] }, // SP4
  { id: 'humming_trinket', name: 'Humming Trinket', type: 'trinket', tier: 1, value: 0, equipSlot: 'trinket', effects: [] }, // CAM5 (priceless junk)
  // blessed gear — only stocked where the player is Pure
  { id: 'blessed_charm',  name: 'Hearth-Blessed Charm', type: 'trinket', tier: 3, value: 180, equipSlot: 'trinket', effects: [{ def: 3, purityAura: true }] },

  // --- consumables ---------------------------------------------------------
  { id: 'minor_potion', name: 'Minor Healing Draught', type: 'consumable', tier: 1, value: 12, stack: true, effects: [{ heal: 30 }] },
  { id: 'major_potion', name: 'Major Healing Draught', type: 'consumable', tier: 2, value: 35, stack: true, effects: [{ heal: 80 }] },
  { id: 'lantern_oil',  name: 'Lantern Oil',          type: 'consumable', tier: 1, value: 5,  stack: true, effects: [{ fuel: 'lantern' }] }, // the early sink

  // --- food (life-sim: heals + feeds the body-state meter) -----------------
  { id: 'bread',    name: 'Loaf of Bread', type: 'food', tier: 1, value: 3, stack: true, effects: [{ heal: 10, food: 5 }] },
  { id: 'stew',     name: 'Bog Stew',      type: 'food', tier: 1, value: 6, stack: true, effects: [{ heal: 18, food: 10 }] },
  { id: 'meat_pie', name: 'Meat Pie',      type: 'food', tier: 1, value: 8, stack: true, effects: [{ heal: 25, food: 12 }] }, // CAM7 (blow on it)

  // --- books (life-sim: teach a skill / grant a skill point) ---------------
  { id: 'book_repair',    name: 'A Smith\'s Primer',     type: 'book', tier: 2, value: 60,  effects: [{ teaches: 'repair' }] },
  { id: 'book_haggling',  name: 'The Art of the Deal',   type: 'book', tier: 2, value: 90,  effects: [{ teaches: 'haggle' }] },
  { id: 'book_swordskill', name: 'Forms of the Blade',   type: 'book', tier: 3, value: 120, effects: [{ skillPoint: 1 }] },

  // --- materials (job/loot output; sell or craft) --------------------------
  { id: 'timber',   name: 'Timber',   type: 'material', tier: 1, value: 4,  stack: true, effects: [] },
  { id: 'fish',     name: 'Fish',     type: 'material', tier: 1, value: 5,  stack: true, effects: [] },
  { id: 'iron_ore', name: 'Iron Ore', type: 'material', tier: 1, value: 8,  stack: true, effects: [] },
  { id: 'bog_iron', name: 'Bog Iron', type: 'material', tier: 1, value: 10, stack: true, effects: [] },

  // --- keys ----------------------------------------------------------------
  { id: 'archive_key', name: 'Keep Archive Key', type: 'key', tier: 1, value: 0, effects: [] },

  // --- property (high-tier sinks; rent = passive income) -------------------
  { id: 'greenhollow_house', name: 'A House in Greenhollow', type: 'property', tier: 4, value: 1500, effects: [{ rent: 25 }] },
  { id: 'saltbreak_shop',    name: 'A Shop in Saltbreak',    type: 'property', tier: 5, value: 3500, effects: [{ rent: 60 }] },
];

const BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** Look up an item definition by id (throws on unknown — fail loud). */
export function item(id) {
  const it = BY_ID[id];
  if (!it) throw new Error(`unknown item: ${id}`);
  return it;
}
export function itemsByType(type) { return ITEMS.filter((i) => i.type === type); }
