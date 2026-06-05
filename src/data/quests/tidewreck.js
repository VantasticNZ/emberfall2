// =============================================================================
// TIDEWRECK COAST — ACT 2, REGION 3 (the storm coast; the betrayal in the past).
// Authored as DATA on the QuestEngine. M13 arrival at Saltbreak (smuggler/fisher
// intrigue) and M14 The Drowned Vault (the HOOKSHOT tool + Shard #3 + the truth
// that a past oracle BETRAYED their own to hide the shard — foreshadowing Sela's
// possible M17 betrayal). Then M15 (Emberwood stub).
//
// Canonical flags: tool_hookshot, shard_3 (3/5). The M14 betrayal truth reads
// the M10 decision so it lands differently (Gate H, cross-region).
// =============================================================================

export const TIDEWRECK_COAST = [
  // ---------------------------------------------------------------------------
  // M13 — The Tidewreck Coast (arrival; the smuggler-vs-authority lean = T1 seed)
  // ---------------------------------------------------------------------------
  {
    id: 'M13', title: 'The Tidewreck Coast', region: 'Tidewreck Coast', act: 2,
    type: 'main', tone: 'stormy', perm: false,
    unlocks: ['M14'],
    reward: { hub: 'Saltbreak' },
    steps: [
      { id: 'road', desc: 'Take the east road — grass breaks to dunes and salt-rock.' },
      { id: 'harbour', desc: 'Reach Saltbreak harbour; smugglers and fishers at odds.' },
      { id: 'lean', desc: 'Lean toward the smugglers or the harbour authority.' },
    ],
    choices: [
      { id: 'lean_smugglers', label: 'Lean toward the smugglers', impact: 'dark',
        karma: { purity: -10 }, deed: 'lean_smugglers', ending: '',
        note: 'The free-traders take you in; the harbourmaster watches you.' },
      { id: 'lean_authority', label: 'Lean toward the harbour authority', impact: 'good',
        karma: { purity: 10 }, deed: 'lean_authority', ending: '',
        note: 'The harbourmaster trusts you; the smugglers go quiet around you.' },
    ],
    dialogue: { start: 'road', nodes: {
      road: { speaker: '', text:
        "East of the Peaks the land breaks down into dunes and black salt-rock, and then the sea — grey, " +
        "vast, storm-bruised. Below, clinging to a cove of wrecked hulls, the harbour town of Saltbreak.",
        options: [ { label: '(Go down to the harbour.)', to: 'harbour' } ] },
      harbour: { speaker: 'Harbourmaster', text:
        "Another inland face. *eyes you, then the dark end of the dock* Mind yourself here — half this town " +
        "runs honest nets and the other half runs Hugh Jass's contraband, and the two are about a bad word " +
        "from blood. There's talk of an old shrine drowned out past the reef — a 'shard,' they say. You'll " +
        "not reach it without the right gear. Which half of my town are you, then?",
        options: [
          { label: '(Throw in with the smugglers.)', choice: { quest: 'M13', id: 'lean_smugglers' }, end: true },
          { label: '(Stand with the harbour authority.)', choice: { quest: 'M13', id: 'lean_authority' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M14 — The Drowned Vault (DUNGEON). Tide-timed entry; earn the HOOKSHOT
  // (tool_hookshot); hookshot puzzles; learn-the-pattern boss; claim SHARD #3
  // (shard_3); the truth: a past oracle betrayed their own to hide it here
  // (deed: vault_betrayal). The reveal is reactive to the M10 decision.
  // ---------------------------------------------------------------------------
  {
    id: 'M14', title: 'The Drowned Vault', region: 'Tidewreck Coast', act: 2,
    type: 'dungeon', tone: 'tense', perm: false,
    unlocks: ['M15'],
    reward: { tool: 'hookshot', shard: 3, items: ['hookshot'], heart: 1, truth: 'vault_betrayal' },
    steps: [
      { id: 'tide', desc: 'Enter the Drowned Vault at low tide (tide-timed).' },
      { id: 'hookshot', desc: 'Earn the HOOKSHOT (cross gaps; yank objects + enemies).' },
      { id: 'puzzle', desc: 'Hookshot the flooded vault — gaps, anchors, pulled enemies.' },
      { id: 'boss', desc: 'The Tideward: hookshot it into the spikes, then strike (dodge/block).' },
      { id: 'truth', desc: 'Read the vault: a past oracle betrayed their own to hide the shard.' },
      { id: 'shard', desc: 'Claim Shard #3.' },
    ],
    choices: [
      { id: 'clear', label: 'Hookshot + defeat the Tideward -> Shard #3 + the betrayal truth', impact: 'neutral',
        karma: {}, ending: '',
        note: 'The hookshot tool, the third shard, and the betrayal that foreshadows Sela (M17).' },
    ],
    dialogue: { start: 'tide', nodes: {
      tide: { speaker: '', text:
        "The Drowned Vault opens only at the ebb — a black throat in the reef that the sea swallows again " +
        "in an hour. You time the tide and drop in as the water pulls back, dripping and counting minutes.",
        options: [ { label: '(Descend before the tide turns.)', to: 'hookshot' } ] },
      hookshot: { speaker: '', text:
        "Sunk in a drowned reliquary, a HOOKSHOT — a barbed chain on a spring-drum that bites a far anchor " +
        "and hauls you across, or yanks a thing to you. The flooded gaps ahead suddenly have a way over.",
        options: [ { label: '(Take up the hookshot.)', deed: 'tool_hookshot', meta: { tool: 'hookshot' }, to: 'puzzle' } ] },
      puzzle: { speaker: '', text:
        "You fire the hookshot across the flooded nave, yank a rusted grate aside, drag a counterweight to " +
        "hold a sluice-gate open, and swing the drowned gaps the falling tide keeps opening beneath you.",
        options: [ { label: '(Reach the vault heart.)', to: 'boss' } ] },
      boss: { speaker: '', text:
        "THE TIDEWARD uncoils from the flooded dark — a drowned guardian wreathed in chain and weed. You " +
        "hookshot it onto the broken spikes when it rears, dodge its sweep, block its surge, and strike. " +
        "Hook, dodge, block, strike — until it sinks for the last time.",
        options: [ { label: '(Into the reliquary.)', to: 'truth' } ] },
      // the betrayal truth lands differently depending on the M10 decision
      truth: { route: [
        { when: (c) => c.karma.hasDeed('hagga_reported'), to: 'truth_reported' },
        { to: 'truth_plain' } ] },
      truth_plain: { speaker: '', text:
        "The vault's records tell an old crime: to hide this shard, an oracle BETRAYED their own — sold " +
        "their sworn kin to the binding to keep the secret. A cold, familiar shape of cruelty. You think, " +
        "unbidden, of Sela's too-composed face.",
        options: [ { label: '(Take the proof.)', deed: 'vault_betrayal', to: 'shard' } ] },
      truth_reported: { speaker: '', text:
        "The vault's records tell an old crime: an oracle BETRAYED their own to hide this shard, sold their " +
        "kin to the binding for the secret's sake. You recognise the logic too well — it is the same one " +
        "that let you hand Hagga to Sela. The kinship of it turns your stomach.",
        options: [ { label: '(Take the proof.)', deed: 'vault_betrayal', to: 'shard' } ] },
      shard: { speaker: '', text:
        "Past the betrayer's bones, the third shard of the Hearthflame, warm in the drowned cold — and " +
        "that far-off grieving note, nearer now, almost a word.",
        options: [ { label: '(Claim Shard #3.)', deed: 'shard_3', meta: { shard: 3 }, choice: { quest: 'M14', id: 'clear' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M15 — The Emberwood (STUB — Region 4 arrival; authored next region.)
  // ---------------------------------------------------------------------------
  {
    id: 'M15', title: 'The Emberwood', region: 'Emberwood', act: 2,
    type: 'main', tone: 'magical/dangerous', perm: false,
    unlocks: [], reward: {}, choices: [],
    steps: [ { id: 'stub', desc: 'Travel south to the fire/frost wood; the settlement caught between burning and freezing. (To be authored.)' } ],
  },
];
