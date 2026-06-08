// =============================================================================
// LOOT TABLES (DATA) — weighted drop tables for interactables (cut bushes, broken
// crates, searched containers). Reuses EXISTING item ids only (validated by
// Inventory.add → items SSOT); `gold:[min,max]` grants coins via addGold.
// Faucet note (ECONOMY-BALANCE): keep container/breakable yields low-end so they
// don't inflate gold — bushes mostly give nothing/coppers; containers give food/junk.
// =============================================================================

export const LOOT = {
  // CUT — bushes/tall grass: cheap, high-frequency, mostly nothing (a coin/herb sometimes).
  loot_bush: { rolls: 1, drops: [
    { weight: 55, nothing: true },
    { weight: 25, gold: [1, 3] },
    { weight: 12, item: 'bread' },
    { weight: 8, item: 'minor_potion' },
  ] },
  // BREAK — barrels/crates: a bit more, low-value materials + the odd coin.
  loot_barrel: { rolls: 1, drops: [
    { weight: 30, gold: [2, 6] },
    { weight: 26, item: 'timber' },
    { weight: 20, item: 'fish' },
    { weight: 14, item: 'bread' },
    { weight: 10, item: 'minor_potion' },
  ] },
  loot_crate: { rolls: 1, drops: [
    { weight: 34, gold: [3, 8] },
    { weight: 26, item: 'iron_ore' },
    { weight: 20, item: 'timber' },
    { weight: 12, item: 'lantern_oil' },
    { weight: 8, item: 'minor_potion' },
  ] },
  // SEARCH — furniture: food-heavy (a pantry/cupboard), the odd coin or draught.
  loot_cupboard: { rolls: 1, drops: [
    { weight: 30, item: 'bread' },
    { weight: 22, item: 'stew' },
    { weight: 18, item: 'meat_pie' },
    { weight: 15, gold: [2, 5] },
    { weight: 15, item: 'minor_potion' },
  ] },
  loot_drawer: { rolls: 1, drops: [
    { weight: 40, gold: [1, 5] },
    { weight: 24, item: 'lantern_oil' },
    { weight: 20, item: 'minor_potion' },
    { weight: 16, nothing: true },
  ] },
};
