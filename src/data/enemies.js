// =============================================================================
// ENEMY SKINS — how each tested Monsters ARCHETYPE is RENDERED (data only).
// The behaviour is the FSM (src/data/monsters/); this maps an archetype id to a
// distinct visual: a humanoid LPC skin + scale + base tint + optional weapon.
//
// FLAG (no fake): the asset hunt added only HUMANOID LPC parts — there are NO
// dedicated monster/beast sprites. So archetypes are distinguished by SKIN combo
// + SCALE + TINT + their telegraph/behaviour language (real art, not colour-boxes).
// A purchased monster pack (see IDEAS-BACKLOG "PAID ASSET REQUIREMENTS") would
// replace these with true creatures.
// =============================================================================

const IVORY = (shirt, hair) => ['body_ivory', 'head_ivory', 'brows_chestnut', hair, shirt, 'pants_black', 'shoes_brown'];
const FEM = (shirt, hair) => ['body_fem', 'head_fem', 'brows_chestnut', hair, shirt, 'pants_brown', 'shoes_brown_fem'];

export const ENEMY_SKINS = {
  // telegraphed rush -> dodge the line, punish recovery
  charger: { name: 'Bog Lunger', parts: IVORY('shirt_leather', 'hair_parted_gray'), scale: 1.0, base: 0xff8a7a, weapon: 'sword' },
  // blocks the front -> flank it
  shielded: { name: 'Order Revenant', parts: IVORY('shirt_leather', 'hair_chestnut'), scale: 1.08, base: 0x9fb4c8, weapon: 'shield' },
  // invulnerable while charged -> wait for the window
  charger_electric: { name: 'Storm Crawler', parts: FEM('shirt_blue', 'hair_bob_blonde'), scale: 1.0, base: 0x7fa8ff },
  // weak many -> AoE / spin
  swarm: { name: 'Fen Gnats', parts: FEM('shirt_forest', 'hair_bob_blonde'), scale: 0.62, base: 0x8fe06a },
  // slow heavy -> dodge the wind-up, punish
  brute: { name: 'Mire Brute', parts: IVORY('shirt_leather', 'hair_parted_gray'), scale: 1.65, base: 0xc7a06a, weapon: 'sword' },
  // projectiles -> close / block
  ranged: { name: 'Marsh Slinger', parts: IVORY('shirt_blue', 'hair_chestnut'), scale: 0.95, base: 0xd6b86a },
  // channels -> interrupt
  caster: { name: 'Bog Caster', parts: FEM('shirt_forest', 'hair_parted_gray'), scale: 1.0, base: 0xc78aff },
  // leaps -> bait, side-step, punish the landing
  jumper: { name: 'Leap Horror', parts: FEM('shirt_leather', 'hair_bob_blonde'), scale: 0.9, base: 0x9adf8f },
};

// the BOSS skin (the Drowned Guardian) — big, shrouded; the lantern strips it
export const BOSS_SKINS = {
  drowned_guardian: { name: 'The Drowned Guardian', parts: IVORY('shirt_leather', 'hair_parted_gray'), scale: 2.0, base: 0x2f5f6a, shroud: 0x14323a },
};
