// =============================================================================
// BUILDING DEEDS (Fable property model — SCHEMA ONLY this slice; the purchase/rent/
// furnish BUILD is post-slice, SPEC-NPCS-LIVING-WORLD §6). Every enterable building
// carries a deed: { owner, price, rentRate, buyable }. `buyable` flips true per-town
// when that town's quest arc completes; until then the deed just records ownership.
//   price    = gold to buy (null = not for sale, e.g. the chapel)
//   rentRate = passive gold per day once owned (~price/60)
//   buyable  = is it purchasable yet (post-slice purchase UI reads this)
// `buildingDeed(interiorKey)` returns the explicit deed or a sensible default, so the
// schema is GUARANTEED present for EVERY building (no retrofit when the build lands).
// =============================================================================
export const BUILDING_DEEDS = {
  gh_chapel:     { owner: 'the Light',       price: null, rentRate: 0,  buyable: false },
  tankard_f1:    { owner: 'the tavernkeeper', price: 800, rentRate: 13, buyable: false },
  tankard_f2:    { owner: 'the tavernkeeper', price: 800, rentRate: 13, buyable: false },
  gh_store:      { owner: 'Pem',             price: 600,  rentRate: 10, buyable: false },
  gh_forge:      { owner: 'Hodge',           price: 700,  rentRate: 12, buyable: false },
  forge_generic: { owner: 'the smith',       price: 700,  rentRate: 12, buyable: false },
  house_generic: { owner: 'the household',   price: 1500, rentRate: 25, buyable: false },   // the manor
  gh_home1:      { owner: 'the cottager',    price: 400,  rentRate: 7,  buyable: false },
  gh_home2:      { owner: 'the cottager',    price: 450,  rentRate: 8,  buyable: false },
  house_v2:      { owner: 'a villager',      price: 350,  rentRate: 6,  buyable: false },
  house_v3:      { owner: 'a villager',      price: 350,  rentRate: 6,  buyable: false },
  house_v4:      { owner: 'a family',        price: 380,  rentRate: 6,  buyable: false },
  house_v5:      { owner: 'a villager',      price: 350,  rentRate: 6,  buyable: false },
};

const DEFAULT_DEED = { owner: 'a resident', price: 400, rentRate: 7, buyable: false };

export function buildingDeed(interiorKey) {
  return BUILDING_DEEDS[interiorKey] || DEFAULT_DEED;
}
