// =============================================================================
// SINGLE SOURCE OF TRUTH — DEEDS (story / moral deed ids)
// Generated from the live game data (the current canonical set), then frozen.
// A typo'd access is `undefined`; an id referenced in data but absent here is a
// `npm run verify` FAILURE (orphan check). Tools/shards/skills/factions are in ./flags.js.
// =============================================================================

const ids = (...names) => Object.freeze(Object.fromEntries(names.map((n) => [n, n])));

export const DEEDS = ids(
  'ascent_cruel', 'ascent_mercy', 'ashen_relics_looted', 'axe_continuity', 'axe_material', 'axe_meaning',
  'barber_dodged', 'barber_guessed', 'barber_paradox_seen', 'betrayal_mercy', 'betrayal_vengeance', 'bog_troubles',
  'bogfolk_cruel', 'bogfolk_kind', 'cart_diverted', 'cart_held', 'cart_tried_all', 'cave_lore',
  'chicken_freed', 'chicken_helped', 'chicken_kicked', 'cinder_stag_slain', 'coin_gifted', 'coin_kept',
  'coin_returned', 'comforted_child', 'crag_beast_slain', 'cynic_dismissed', 'cynic_met', 'dared_friend',
  'drowned_letter', 'drowned_letter_left', 'emberwood_reached', 'ending_ashbearer', 'ending_liberator', 'ending_saint',
  'ending_tyrant', 'ending_warden', 'fire_frost_lore', 'flowers_declined', 'flowers_gathered', 'frog_trophy',
  'general_met', 'general_saluted', 'god_seized', 'god_taken', 'greeted_warmly', 'grief_vengeance',
  'grief_vow', 'hagga_ally_plus', 'hagga_believed', 'hagga_refused', 'hagga_reported', 'hagga_silent',
  'high_pass_climbed', 'hub_reconnected', 'ignored_unease', 'keeper_brushed', 'keeper_stayed', 'kept_to_self',
  'mara_exposed', 'mara_letters_returned', 'mara_secret_kept', 'mercy_shown', 'message_bottle', 'mule_freed',
  'night_thing_met', 'orchard_covered', 'orchard_punished', 'orchard_recruited', 'order_chose_lie', 'order_records',
  'pem_clue_coast', 'pem_clue_emberwood', 'pem_clue_marsh', 'pem_clue_peaks', 'pem_found', 'pie_lesson',
  'prophet_blessed', 'prophet_declined', 'raid_chaos', 'raid_declined', 'raid_joined', 'roadside_wit',
  'saved_burning', 'saved_freezing', 'sela_alone', 'sela_doubt', 'sela_opposed', 'sela_trusted',
  'spawn_wanderer', 'stardust', 'stardust_refused', 'stone_pondered', 'stone_pushed', 'stone_refused',
  'stone_taken', 'stranger_rescued', 'stranger_used', 'sunken_dead_looted', 'tavern_songs', 'tide_cave_loot',
  'time_skip', 'told_adult', 'vault_betrayal', 'veil_equal', 'veil_need', 'veil_triage',
  'wanderer_met', 'weapon_wooden_sword', 'weeping_tree', 'wreck_wraith_slain',
  // social-system demo deeds (CHA haggle / Insight reveal / Trust-gated option)
  'haggled_bram', 'hagga_hidden_truth', 'miner_secret_pass',
  // DOOR-SYSTEM — morality-entrance (walking uninvited through a closed / locked door)
  'entered_uninvited', 'forced_entry',
);
