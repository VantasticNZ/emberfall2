// =============================================================================
// ENEMY SKINS — how each tested Monsters ARCHETYPE is RENDERED (data only).
// The behaviour is the FSM (src/data/monsters/) — UNCHANGED; this only maps an
// archetype id to a REAL LPC monster spritesheet (public/art/monsters/, OpenGameArt
// CC-BY-SA/GPL — see ASSET-LEDGER) + scale + base tint. Bog-appropriate creatures.
//
// `sheet` = a `mon_<key>` spritesheet (front-facing idle loop from BootScene).
// `base`  = idle tint (0xffffff shows the creature's real colours; the telegraph
//           language tints yellow/white/cyan over it). A couple recolour for read.
// FLAG: where no perfect creature exists for an archetype, the closest is used +
// noted; the humanoid `parts` path is kept for any future humanoid enemy.
// =============================================================================

export const ENEMY_SKINS = {
  charger: { name: 'Bog Serpent', sheet: 'snake', scale: 1.0, base: 0xffffff },               // lunges in a line
  shielded: { name: 'Gourd Revenant', sheet: 'pumpking', scale: 1.05, base: 0xffffff },        // FLAG: closest — a hulking gourd that guards its front
  charger_electric: { name: 'Galvanic Ooze', sheet: 'slime', scale: 1.0, base: 0x9fd0ff },     // recoloured bluish = charged
  swarm: { name: 'Fen Bats', sheet: 'bat', scale: 0.8, base: 0xffffff },                       // flying many -> AoE
  brute: { name: 'Mire Worm', sheet: 'big_worm', scale: 1.5, base: 0xffffff },                 // huge, slow, heavy
  ranged: { name: 'Bog Watcher', sheet: 'eyeball', scale: 0.95, base: 0xffffff },              // floating eye -> ranged volley
  caster: { name: 'Drowned Wisp', sheet: 'ghost', scale: 1.0, base: 0xffffff },                // spectral -> channels
  jumper: { name: 'Leap Horror', sheet: 'bat', scale: 0.9, base: 0xffffff },                   // (not placed yet)
};

// the BOSS — a vast tentacled bog-maw (closest to the "Drowned Guardian"; FLAG)
export const BOSS_SKINS = {
  drowned_guardian: { name: 'The Drowned Guardian', sheet: 'man_eater_flower', scale: 1.4, base: 0x9fd6d0 },
};
