// =============================================================================
// SINGLE SOURCE OF TRUTH — ENDINGS.
// The five ending keys + names, the deeds their gates read (single-sourced from
// DEEDS), and the epilogue twist cards. Karma.js imports ENDING_DEEDS from here;
// the GATE LOGIC stays in Karma.js (one engine owns gating).
// =============================================================================

import { DEEDS } from './deeds.js';

export const ENDING_IDS = Object.freeze({ W: 'W', S: 'S', T: 'T', L: 'L', A: 'A' });
export const ENDING_NAMES = Object.freeze({
  W: 'Warden', S: 'Saint', T: 'Tyrant', L: 'Liberator', A: 'Ashbearer',
});

// The deeds the ending gates depend on — names quests must record verbatim.
export const ENDING_DEEDS = Object.freeze({
  cave_lore: DEEDS.cave_lore,         // M4: read the weeping-flame carving
  pem_found: DEEDS.pem_found,         // G2: the Pem clue-hunt paid off
  mercy_shown: DEEDS.mercy_shown,     // M16: mercy to the god-fragment
  hagga_believed: DEEDS.hagga_believed, // M10: believed Hagga's truth
  sela_opposed: DEEDS.sela_opposed,   // M17: opposed Sela
});

// Epilogue twist cards (ET1..ET12), layered by deed at M20 (spire epilogueCards()).
export const EPILOGUE_CARDS = Object.freeze(
  Array.from({ length: 12 }, (_, i) => `ET${i + 1}`).reduce((o, k) => ((o[k] = k), o), {}),
);
