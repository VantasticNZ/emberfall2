// =============================================================================
// SUNDERED PEAKS — ACT 2, REGION 2 (strength / the broken order). Authored as
// DATA on the QuestEngine. M11 arrival (the dispute that seeds SP3) and M12
// Cinder Keep (the CLIMB/GRAPPLE tool + Shard #2 + the truth that the order KNEW
// and CHOSE the lie), then M13 (Tidewreck Coast stub).
//
// Canonical flags: tool_grapple, shard_2 (2/5). The M12 truth reads the M10
// permanent decision (hagga_believed/hagga_reported) so the reveal lands
// differently — cross-region coherence (Gate H).
// =============================================================================

export const SUNDERED_PEAKS = [
  // ---------------------------------------------------------------------------
  // M11 — The Sundered Peaks (arrival; the miners-vs-owner dispute seeds SP3).
  // Lean workers (+M) opens the Peaks side web; lean owner (-P, T-lean) doesn't.
  // ---------------------------------------------------------------------------
  {
    id: 'M11', title: 'The Sundered Peaks', region: 'Sundered Peaks', act: 2,
    type: 'main', tone: 'hardy', perm: false,
    unlocks: ['M12'],
    reward: { hub: 'Sundered Peaks' },
    steps: [
      { id: 'climb', desc: 'Take the north road — grassland rises into grey foothills.' },
      { id: 'town', desc: 'Reach the terraced stone town below Cinder Keep.' },
      { id: 'route', desc: 'Find the route up — a local knows it, but the town is split.' },
    ],
    choices: [
      { id: 'lean_workers', label: 'Stand with the miners', impact: 'good',
        karma: { morality: 10 }, deed: 'lean_workers', unlocks: ['SP1', 'SP2', 'SP3'], ending: '',
        note: 'The miners guide you up + open the Peaks side web; seeds the SP3 dispute.' },
      { id: 'lean_owner', label: 'Side with the owner (Mike Hunt)', impact: 'dark',
        karma: { purity: -10 }, deed: 'lean_owner', ending: 'T-lean',
        note: 'Power has its uses; the miners close ranks against you.' },
    ],
    dialogue: { start: 'climb', nodes: {
      climb: { speaker: '', text:
        "North of Greenhollow the green rises into grey — foothills, then a terraced stone town clinging " +
        "to the mountainside. Above it all, ruined against the sky, the old oracle seat: Cinder Keep.",
        options: [ { label: '(Climb into the town.)', to: 'town' } ] },
      town: { speaker: 'Stonewright', text:
        "Lowlander. *hard eyes, not unkind* Aye, the Order ruled from the Keep, before it broke. You'll " +
        "not reach it though — the way up's sheer, needs more than fingers. And this town's too busy " +
        "tearing itself apart to help you: miners on one side, the owner on the other.",
        options: [ { label: '(Find someone who knows the route up.)', to: 'dispute' } ] },
      dispute: { speaker: 'Miner', text:
        "Want the route to the Keep? I know it — climbed these crags since I could walk. But Mike Hunt " +
        "that owns the mine is squeezing us to the bone, and I'll not do favours for them as side with " +
        "him. Stand with us, and I'll guide you up myself.",
        options: [
          { label: '(Stand with the miners.)', choice: { quest: 'M11', id: 'lean_workers' }, end: true },
          { label: '(Side with Mike Hunt — the owner holds the real power here.)', choice: { quest: 'M11', id: 'lean_owner' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M12 — Cinder Keep (DUNGEON). Earn the CLIMB/GRAPPLE (tool_grapple), grapple
  // puzzle beats, the learn-the-pattern boss, claim SHARD #2 (shard_2), and read
  // the records: the ORDER KNEW the flame was a bound god and CHOSE the lie
  // (deed: order_chose_lie). The reveal is reactive to the M10 decision.
  // ---------------------------------------------------------------------------
  {
    id: 'M12', title: 'Cinder Keep', region: 'Sundered Peaks', act: 2,
    type: 'dungeon', tone: 'tense', perm: false,
    unlocks: ['M13'],
    reward: { tool: 'grapple', shard: 2, items: ['grapple'], heart: 1, truth: 'order_chose_lie' },
    steps: [
      { id: 'enter', desc: 'Climb to the ruined Cinder Keep, old seat of the Order.' },
      { id: 'grapple', desc: 'Earn the CLIMB/GRAPPLE (reach high ledges; pull objects + enemies).' },
      { id: 'puzzle', desc: 'Grapple the broken keep — verticality + pulled gates.' },
      { id: 'boss', desc: 'The Keep Sentinel: grapple it off-balance, then strike (dodge/block).' },
      { id: 'truth', desc: 'Read the Order\'s records: they knew, and chose the lie.' },
      { id: 'shard', desc: 'Claim Shard #2.' },
    ],
    choices: [
      { id: 'clear', label: 'Grapple + defeat the Sentinel -> Shard #2 + the truth', impact: 'neutral',
        karma: {}, ending: '',
        note: 'The grapple tool, the second shard, and proof the Order chose the lie.' },
    ],
    dialogue: { start: 'enter', nodes: {
      enter: { speaker: '', text:
        "Cinder Keep: a fortress of black stone, half-fallen, wind keening through the broken vaults. " +
        "This is where the oracle Order ruled — and where, the miners say, it hid what it knew.",
        options: [ { label: '(Enter the Keep.)', to: 'grapple' } ] },
      grapple: { speaker: '', text:
        "In the old armoury, clamped to a fallen guardian, a CLIMB/GRAPPLE — a hooked line that bites " +
        "stone and hauls you up, or yanks a thing toward you. The broken Keep suddenly has a way up.",
        options: [ { label: '(Take up the grapple.)', deed: 'tool_grapple', meta: { tool: 'grapple' }, to: 'puzzle' } ] },
      puzzle: { speaker: '', text:
        "You grapple ledge to broken ledge, yank a counterweight to raise a portcullis, pull a cracked " +
        "pillar down to bridge a gap. The Keep opens itself to you, level by level.",
        options: [ { label: '(Climb to the inner sanctum.)', to: 'boss' } ] },
      boss: { speaker: '', text:
        "A KEEP SENTINEL of welded armour grinds awake — too armoured to face head-on. You grapple its " +
        "shield-arm and HAUL it off-balance; it lunges (you dodge), looses a bolt-volley (you block), " +
        "and you strike the gap in its guard. Grapple, dodge, block, strike — until it topples and lies " +
        "still.",
        options: [ { label: '(Into the records vault.)', to: 'truth' } ] },
      // the truth reads differently depending on the M10 permanent decision
      truth: { route: [
        { when: (c) => c.karma.hasDeed('hagga_believed'), to: 'truth_believed' },
        { when: (c) => c.karma.hasDeed('hagga_reported'), to: 'truth_reported' },
        { to: 'truth_plain' } ] },
      truth_believed: { speaker: '', text:
        "The Order's own records, in their own hand: the Hearthflame is a bound god; its binding kills " +
        "it slowly; the land sickens with it. They KNEW — and chose the lie, 'for order.' Exactly as " +
        "Hagga told you. The cold certainty of it settles in your chest.",
        options: [ { label: '(Take the proof.)', deed: 'order_chose_lie', to: 'shard' } ] },
      truth_reported: { speaker: '', text:
        "The Order's records say plainly: the Hearthflame is a bound god, knowingly bound, the lie " +
        "chosen 'for order.' ...The same heresy you handed Hagga to Sela for. You tell yourself the " +
        "records must be forged. You almost believe it.",
        options: [ { label: '(Take the records, uneasy.)', deed: 'order_chose_lie', to: 'shard' } ] },
      truth_plain: { speaker: '', text:
        "The Order's own records, in their own hand: the Hearthflame is a bound god; the binding is " +
        "killing it; the land dies with it. They KNEW — and chose the lie, 'for order.' Whatever you " +
        "believed walking in, you cannot un-know this.",
        options: [ { label: '(Take the proof.)', deed: 'order_chose_lie', to: 'shard' } ] },
      shard: { speaker: '', text:
        "Past the vault, the second shard of the Hearthflame, warm against the mountain cold — and that " +
        "same far-off grieving note, a little clearer now than it was in the marsh.",
        options: [ { label: '(Claim Shard #2.)', deed: 'shard_2', meta: { shard: 2 }, choice: { quest: 'M12', id: 'clear' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M13 — The Tidewreck Coast (STUB — Region 3 arrival; authored next region.)
  // ---------------------------------------------------------------------------
  {
    id: 'M13', title: 'The Tidewreck Coast', region: 'Tidewreck Coast', act: 2,
    type: 'main', tone: 'stormy', perm: false,
    unlocks: [], reward: {}, choices: [],
    steps: [ { id: 'stub', desc: 'Travel east to Saltbreak harbour; smuggler/fisher intrigue. (To be authored.)' } ],
  },
];
