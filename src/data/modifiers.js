// =============================================================================
// MODIFIERS — game-modifier registry as DATA (like quests). Each entry:
//   id, name, desc, category, default, devDefault, effect?, ageGated?, requiresConfirm?
// The ModifierRegistry engine reads these; the options menu toggles them.
//   category: 'cosmetic' | 'gameplay' | 'graphics' | 'adult'
//   devDefault: ON in dev/testing (so Van can see them) — NEVER for ageGated.
// Full planned list (for later build) lives in docs/MODIFIERS-DESIGN.md.
// =============================================================================

export const MODIFIERS = [
  // --- graphics ---
  { id: 'blood_gore', name: 'Blood & Gore', category: 'graphics', default: false, devDefault: true,
    desc: 'Combat shows blood + gore effects. Off by default.', effect: { gore: true } },
  // --- cosmetic ---
  { id: 'big_head', name: 'Big-Head Mode', category: 'cosmetic', default: false, devDefault: true,
    desc: 'Everyone gets a comically oversized head.', effect: { headScale: 1.8 } },
  // --- gameplay ---
  { id: 'loot_rich', name: 'Loot-Rich', category: 'gameplay', default: false, devDefault: true,
    desc: 'Enemies and chests drop more gold + loot.', effect: { lootMult: 2 } },
  { id: 'more_gems', name: 'Gem Rain', category: 'gameplay', default: false, devDefault: true,
    desc: 'Gems and trinkets appear far more often.', effect: { gemMult: 3 } },
  // --- ADULT MODE (architecture only; NO art) — walled off, gated, off by default ---
  { id: 'adult_mode', name: 'Adult Mode (18+)', category: 'adult', default: false, devDefault: false,
    ageGated: true, requiresConfirm: true,
    desc: 'Mature content for ADULT characters ONLY (gated behind 18+ confirmation; master-switchable; '
      + 'NEVER applies to the child protagonist or any minor). No art exists yet — flag/architecture only.' },
];
