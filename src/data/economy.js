// =============================================================================
// ECONOMY DATA — regional pricing, shops (with gating), jobs, and the BALANCE
// constants. All DATA; the rules live in src/systems/Economy.js. Balance model
// is documented there + in docs/ECONOMY-BALANCE.md.
// =============================================================================

// REGIONAL PRICING: the same item costs/sells differently per region.
//   buy  = multiplier on item.value when BUYING (lower = cheaper to buy)
//   sell = fraction of item.value you GET when SELLING (higher = better payout)
// A port (Tidewreck) buys goods cheaply but pays little for loot; remote regions
// (Emberwood/Spire) charge more but pay more for rare loot -> deliberate arbitrage.
export const REGION_PRICES = {
  'Greenhollow':     { buy: 1.00, sell: 0.50 },
  'Ashen Marsh':     { buy: 1.10, sell: 0.55 },
  'Sundered Peaks':  { buy: 1.15, sell: 0.60 },
  'Tidewreck Coast': { buy: 0.90, sell: 0.45 }, // cheap to buy, poor payout
  'Emberwood':       { buy: 1.30, sell: 0.65 }, // dear, but values rare loot
  'Spire':           { buy: 1.60, sell: 0.70 },
};

// SHOPS: a stock list per region. Each entry may carry `requires` (level / deeds
// / karma) — gated stock (e.g. dark gear only if Corrupt, blessed only if Pure,
// property only at level). Mirrors the QuestEngine requires-pattern.
export const SHOPS = [
  // hours: a day-only shopkeeper (Hodge works the forge by day) — DAY/NIGHT
  // example. Checked with TimeOfDay.meetsTime(shop.hours); see Economy.isOpen().
  { id: 'hodge_forge', name: "Hodge's Forge", region: 'Greenhollow', hours: { phase: 'day' }, stock: [
    { item: 'wooden_sword' }, { item: 'steel_sword' }, { item: 'leather_jerkin' },
    { item: 'lantern_oil' }, { item: 'minor_potion' }, { item: 'iron_ore' },
    { item: 'book_repair' },
    { item: 'greenhollow_house', requires: { level: 5 } },
  ] },
  { id: 'mirefen_trader', name: 'Mirefen Trader', region: 'Ashen Marsh', stock: [
    { item: 'lantern_oil' }, { item: 'minor_potion' }, { item: 'stew' },
    { item: 'bog_iron' }, { item: 'fish' },
    { item: 'blessed_charm', requires: { karma: { purity: { min: 20 } } } }, // Pure only
  ] },
  { id: 'peaks_merchant', name: 'Peaks Merchant', region: 'Sundered Peaks', stock: [
    { item: 'peak_mail' }, { item: 'major_potion' }, { item: 'crag_maul' },
    { item: 'book_swordskill' }, { item: 'skyiron_charm' },
  ] },
  { id: 'saltbreak_market', name: 'Saltbreak Market', region: 'Tidewreck Coast', stock: [
    { item: 'tideglass_blade' }, { item: 'frost_cloak' }, { item: 'major_potion' },
    { item: 'bread' }, { item: 'meat_pie' }, { item: 'pearl_circlet' }, { item: 'book_haggling' },
    { item: 'saltbreak_shop', requires: { level: 10 } },
    { item: 'corrupt_blade', requires: { karma: { morality: { max: -20 }, purity: { max: -20 } } } }, // Corrupt only
  ] },
  { id: 'emberwood_pedlar', name: 'Emberwood Pedlar', region: 'Emberwood', stock: [
    { item: 'cinderhide_cloak' }, { item: 'major_potion' }, { item: 'lantern_oil' },
    { item: 'book_swordskill' },
  ] },
];

// JOBS: simple repeatable grind -> gold (small-medium) + occasionally materials/skill.
export const JOBS = [
  { id: 'woodcutting',   name: 'Woodcutting',    gold: 8,  items: { timber: 2 } },
  { id: 'fishing',       name: 'Fishing',        gold: 6,  items: { fish: 3 } },
  { id: 'smithing_help', name: "Hodge's Helper", gold: 15, skill: 'smith', items: { iron_ore: 1 } },
  { id: 'delivery',      name: "Pem's Deliveries", gold: 12 },
  { id: 'bounty',        name: 'Bounty Board',   gold: 40, requires: { level: 3 } }, // medium, gated
];

// BALANCE constants (tunable). See docs/ECONOMY-BALANCE.md.
export const BALANCE = {
  startGold: 20,
  carryLimit: 40,          // total item count
  baseMaxHp: 100,
  // death: lose a decent % of gold, capped so it never wipes you out
  deathPct: 0.15,
  deathCap: 200,
  // body-state (food) meter
  foodMax: 120,
  foodFat: 100,            // >= -> fat
  foodSkinny: 20,          // <= -> skinny
  foodDecayPerDay: 10,
};

// Body-state stat trade-offs (light + non-judgmental, Fable-ish).
export const BODY_STATES = {
  normal: { maxHpMult: 1.0, speed: 0 },
  fat:    { maxHpMult: 1.2, speed: -1 }, // +HP, -speed
  skinny: { maxHpMult: 0.8, speed: 1 },  // +speed, -HP
};
