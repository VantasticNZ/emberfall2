// =============================================================================
// SUNDERED PEAKS — DATA ONLY (foothills rising into a terraced stone town below
// Cinder Keep, the order's ruined seat). Mountain/stone MOOD via tints on the
// confirmed LPC tiles (no rock/cliff tiles are sliced+loaded yet — FLAG: real
// cliff/cave tiles live in asset-library/2d/tiles/eliza-terrain and want an atlas
// pass). Wired to the EXISTING M11/M12 + SP1/SP3/SP5 quests. First adult mountain
// combat region — combat is correct here.
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
// Townsfolk (distinct via hair/shirt within the limited LPC palette — FLAG: more variants wanted).
const MINER = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'];
const HUNT = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_forest', 'pants_black', 'shoes_brown'];
const STONEWRIGHT = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const STRANGER = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_brown', 'shoes_brown_fem'];
const BOUNTY = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_leather', 'pants_black', 'shoes_brown'];

export const PEAKS = {
  widthTiles: 40,
  heightTiles: 34,

  // stone mood — tints multiplied onto the LPC tiles/props.
  tint: { ground: 0x9ea4b4, water: 0x9fb6c8, tree: 0x8a96a0, decal: 0xb0b4c0 },

  // uniform stone ground (the tinted dirt). FLAG: real terrace/cliff tiles (in
  // asset-library/2d/tiles/eliza-terrain) want an atlas pass for proper platforms.
  ground: { base: 'tile_dirt' },

  // sparse alpine scatter (rubble + hardy tufts), gray-tinted.
  decals: { count: 70, seed: 70123, pool: ['decal_tuft', 'decal_tuft', 'decal_grass_tall', 'decal_clover'] },
  rubble: { count: 40, seed: 5151, pool: ['decal_dirt_patch'] },

  // gray pines (sparse alpine) + stone buildings (forge prop, gray-tinted) + signs.
  props: [
    { key: 'prop_tree_pine', tx: 8, ty: 24, solid: true },
    { key: 'prop_tree_pine', tx: 33, ty: 26, solid: true },
    { key: 'prop_tree_pine', tx: 12, ty: 11, solid: true },
    { key: 'prop_tree_pine', tx: 30, ty: 13, solid: true },
    { key: 'prop_forge', tx: 11, ty: 16, solid: true },     // a stone workshop
    { key: 'prop_forge', tx: 28, ty: 16, solid: true },     // the town hall
    { key: 'prop_forge', tx: 20, ty: 5, solid: true },      // CINDER KEEP (looming, north)
    { key: 'prop_sign', tx: 19, ty: 28, solid: true, text: 'SUNDERED PEAKS — Cinder Keep ahead; the quarry road west. The Order once held this pass. Watch the slopes — the cold here has teeth.' },
  ],

  // Townsfolk. The Miner gives M11 (arrival + dispute). Mike Hunt gives SP3
  // (faction fork), the Stranger gives SP5 (the morality TRICK). Bounty-Master = SP2.
  npcs: [
    { tx: 18, ty: 18, facing: 'down', name: 'Miner', speed: 60, expression: 'neutral', parts: MINER, quest: 'M11',
      greeting: ['The way up’s sheer — you’ll want the route, and the town’s say-so.'],
      // SOCIAL DEMO: TRUST — the secret-pass option appears ONLY once your deeds have
      // earned the miners' trust (e.g. standing with them). Betrayers never see it.
      social: { start: 'talk', nodes: {
        talk: { speaker: 'Miner', text: "Aye, you again. What is it, lowlander?",
          options: [
            { label: '(Just passing.)', end: true },
            { label: 'Ask after the hidden pass', check: { type: 'trust', dc: 2, deeds: ['lean_workers'] }, to: 'secret' },  // trust-gated
          ] },
        secret: { speaker: 'Miner', text: "...You've done right by us, so here's a thing the owner doesn't know: a hidden crag-pass that saves a day's climb. Trust earns what coin can't.",
          options: [{ label: '(Remember the pass.)', deed: 'miner_secret_pass', end: true }] },
      } },
      done: ['Stand with us and the crags are yours. Cinder Keep’s up the north path.'] },
    { tx: 24, ty: 17, facing: 'down', name: 'Mike Hunt', speed: 60, expression: 'neutral', parts: HUNT, quest: 'SP3',
      greeting: ['*counts coin* The mine runs on MY terms, lowlander. Settle the town first.'] },
    { tx: 12, ty: 22, facing: 'right', name: 'Desperate Stranger', speed: 60, expression: 'sad', parts: STRANGER, quest: 'SP5',
      greeting: ['*won’t meet your eye* ...later. Not here.'] },
    { tx: 28, ty: 20, facing: 'down', name: 'Bounty-Master', speed: 60, expression: 'neutral', parts: BOUNTY, quest: 'SP2',
      greeting: ['Coin on the board for the Crag Beast — if you’ve the steel.'] },
    { tx: 15, ty: 15, facing: 'down', name: 'Stonewright', speed: 60, expression: 'neutral', parts: STONEWRIGHT,
      greeting: ['The Order ruled from the Keep, before it broke. Mind the crags.'] },
  ],

  // The Cinder Keep entrance (M12): grapple + the Keep Sentinel boss + Shard #2.
  keep: { tx: 20, ty: 7, name: 'Cinder Keep' },
  // SP1 "The Order's Records" — a records table you can read in the town.
  records: { tx: 22, ty: 14, name: "the Order's records" },
  bossSpawn: { tx: 20, ty: 9 },
  combatSpawn: { tx: 19, ty: 30 },

  // mountain combat encounters (archetypes themed: Crag Ram / Order Revenant /
  // Crag Archer / Stone Ogre / Storm Crawler) — rendered via the global monster skins.
  enemies: [
    { id: 'charger', tx: 16, ty: 26 },           // Crag Ram -> dodge the rush
    { id: 'shielded', tx: 27, ty: 24 },          // Order Revenant -> flank
    { id: 'ranged', tx: 10, ty: 12 },            // Crag Archer -> close/block
    { id: 'brute', tx: 31, ty: 10 },             // Stone Ogre -> dodge the slam
    { id: 'charger_electric', tx: 14, ty: 9 },   // Storm Crawler -> wait for the window
    { id: 'swarm', tx: 24, ty: 27 },             // crag bats -> AoE
  ],

  player: { tx: 19, ty: 30, facing: 'up', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  minerParts: MINER, huntParts: HUNT, stonewrightParts: STONEWRIGHT, strangerParts: STRANGER, bountyParts: BOUNTY,
};
