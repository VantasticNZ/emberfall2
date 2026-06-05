// =============================================================================
// TIDEWRECK COAST — SIDE QUESTS (ST1-ST5 + ST8), authored as DATA on the
// QuestEngine. The smuggler/authority fork (Hugh Jass), tide-cave loot, the sad
// lighthouse keeper (Holden McGroin, played STRAIGHT — mirrors Bram's loss), a
// bounty, the SEEDED BETRAYAL (reactive to an earlier faction-deed), and a
// Message in a Bottle that drops the coast Pem clue.
//
// GATE D for all: objectives are SPREAD (the coves, the tide-caves, the
// lighthouse on the point, the wrecks, the strand). Canonical deed-ids so
// faction echoes (ET5), the Bram grief echo (ET2), the betrayal coda (ET7), and
// the Pem hunt all read the same memory.
// =============================================================================

export const TIDEWRECK_COAST_SIDE = [
  // ST1 — Smuggler's Bargain (morality/Purity; Hugh Jass). Faction fork -> ET5.
  {
    id: 'ST1', title: "Smuggler's Bargain", region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'morality', perm: false,
    requires: { quests: ['M13'] },
    reward: { rep: 'coast_faction' },
    steps: [
      { id: 'meet', desc: 'Meet Hugh Jass and hear the run.' },
      { id: 'decide', desc: 'Run the contraband, or turn the smugglers in.' },
    ],
    choices: [
      { id: 'run', label: 'Run the contraband for Hugh Jass', impact: 'dark',
        karma: { purity: -10 }, deed: 'faction_smuggler', unlocks: ['ET5'], ending: '',
        note: 'The free-traders owe you; the harbour authority marks you (faction echo).' },
      { id: 'turn_in', label: 'Turn the smugglers in', impact: 'good',
        karma: { purity: 10 }, deed: 'faction_authority', unlocks: ['ET5'], ending: '',
        note: 'The harbourmaster trusts you; the smugglers want a word (faction echo).' },
    ],
    dialogue: { start: 'meet', nodes: {
      meet: { speaker: 'Hugh Jass', text:
        "*a grin with too many teeth* Name's Hugh Jass — aye, laugh, everyone does, then everyone pays me " +
        "anyway. Got a run needs a fresh face the harbourmaster don't know yet. Crates from the cove to " +
        "the back room, no questions, good coin. Or — *he watches you* — you could go run your mouth to " +
        "the authority and see how that sits with the rest of us.",
        options: [ { label: '(Decide where your loyalty lies.)', to: 'decide' } ] },
      decide: { speaker: '', text:
        "Hugh's crates on one side; the harbourmaster's slow, watchful trust on the other. Saltbreak will " +
        "remember which you choose.",
        options: [
          { label: '(Run the crates for Hugh.)', choice: { quest: 'ST1', id: 'run' }, end: true },
          { label: '(Tip off the harbour authority.)', choice: { quest: 'ST1', id: 'turn_in' }, end: true },
        ] },
    } },
  },

  // ST2 — Tide-Cave Treasures (fun/loot). HOOKSHOT-gated tide-timed puzzles.
  {
    id: 'ST2', title: 'Tide-Cave Treasures', region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'fun', perm: false,
    requires: { deeds: ['tool_hookshot'] },   // needs the hookshot from M14
    reward: { items: ['pearl_circlet'], gold: 220 },
    steps: [
      { id: 'caves', desc: 'Hookshot the tide-caves between the tides to the hidden hoard.' },
    ],
    choices: [
      { id: 'loot', label: 'Hookshot the tide-caves to the treasure', impact: 'neutral',
        karma: {}, deed: 'tide_cave_loot', ending: '',
        note: 'Tide-timed hookshot puzzles; an epic pearl circlet.' },
    ],
    dialogue: { start: 'caves', nodes: {
      caves: { speaker: '', text:
        "The tide-caves open and flood with the sea's breathing. You read the rhythm, hookshot across the " +
        "drowning gaps between swells, and reach the dry shelf where a wrecker's hoard has sat untaken " +
        "since no one could time the water — until now.",
        options: [ { label: '(Take the hoard.)', choice: { quest: 'ST2', id: 'loot' }, end: true } ] },
    } },
  },

  // ST3 — The Lighthouse Keeper (heartfelt; Holden McGroin, played STRAIGHT).
  // A quiet vignette about loss that mirrors Bram. stay (+M) / brush off. -> ET2.
  {
    id: 'ST3', title: 'The Lighthouse Keeper', region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'heartfelt', perm: false,
    requires: { quests: ['M13'] },
    reward: {},
    steps: [
      { id: 'climb', desc: 'Climb to the lighthouse on the point; sit with the keeper.' },
    ],
    choices: [
      { id: 'stay', label: 'Stay and listen', impact: 'good',
        karma: { morality: 10 }, deed: 'keeper_stayed', unlocks: ['ET2'], ending: '',
        note: 'You hear the old keeper out — a quiet payoff that echoes Bram\'s loss.' },
      { id: 'brush', label: 'Brush him off; you have work', impact: 'neutral',
        karma: {}, deed: 'keeper_brushed', ending: '',
        note: 'You move on; the light burns alone behind you.' },
    ],
    dialogue: { start: 'climb', nodes: {
      climb: { speaker: 'Holden McGroin', text:
        "*an old man, weather-scoured, no joke left in him* You climbed all the way up for an old fool's " +
        "lamp? Sit, then, if you're sitting. I keep the light for the boats. ...Kept it for my boy, once " +
        "— he went out in a blow and the light wasn't enough. Forty years I've kept it bright since. " +
        "Folk don't climb up much. The wind's company of a sort.",
        options: [
          { label: '(Sit, and let the old man talk.)', choice: { quest: 'ST3', id: 'stay' }, end: true },
          { label: "(Make your excuses — there's work below.)", choice: { quest: 'ST3', id: 'brush' }, end: true },
        ] },
    } },
  },

  // ST4 — Bounty: The Wreck Wraith (job/loot). Hunt among the wrecks -> epic gear.
  {
    id: 'ST4', title: 'Bounty: The Wreck Wraith', region: 'Tidewreck Coast', act: 2,
    type: 'job', tone: 'tense', perm: false,
    requires: { quests: ['M13'] },
    reward: { items: ['tideglass_blade'], gold: 260 },
    steps: [
      { id: 'hunt', desc: 'Hunt the Wreck Wraith out among the drowned hulls.' },
    ],
    choices: [
      { id: 'slay', label: 'Lay the Wreck Wraith to rest', impact: 'neutral',
        karma: {}, deed: 'wreck_wraith_slain', ending: '',
        note: 'Drowns sailors who climb the wrecks; epic reward (the Tideglass Blade).' },
    ],
    dialogue: { start: 'board', nodes: {
      board: { speaker: 'Bounty-Master', text:
        "Coin on the board for the Wreck Wraith — drags down any fool who climbs the old hulls at night. " +
        "Three sailors this season. Put it to rest and the Tideglass Blade we pulled from the deep is yours.",
        options: [ { label: '(Hunt it among the wrecks.)', to: 'fight' } ] },
      fight: { speaker: '', text:
        "Out among the drowned hulls at the turn of the tide it finds you first — a cold, clinging, grieving " +
        "thing. It is a hard, slippery fight on weed-slick decks, but you lay it down, and it goes almost " +
        "gratefully into the dark.",
        options: [ { label: '(Claim the Tideglass Blade.)', choice: { quest: 'ST4', id: 'slay' }, end: true } ] },
    } },
  },

  // ST5 — Saltbreak Betrayal [SEEDED BETRAYAL]. A coast contact you dealt with
  // turns on you for coin — reactive intro keyed off your faction-deed so it
  // LANDS. vengeance (-M) / mercy (+M+P). -> ET7 reputation coda.
  {
    id: 'ST5', title: 'Saltbreak Betrayal', region: 'Tidewreck Coast', act: 2,
    type: 'twist', tone: 'betrayal', perm: false,
    requires: { quests: ['M13'] },
    reward: { coda: 'reputation' },
    steps: [
      { id: 'set', desc: 'A Saltbreak contact you trusted sets you up for coin.' },
      { id: 'face', desc: 'Face the betrayer.' },
    ],
    choices: [
      { id: 'vengeance', label: 'Take vengeance', impact: 'dark',
        karma: { morality: -10 }, deed: 'betrayal_vengeance', unlocks: ['ET7'], ending: '',
        note: 'Blood for the betrayal; the coast hears you are not to be crossed.' },
      { id: 'mercy', label: 'Show mercy', impact: 'good',
        karma: { morality: 10, purity: 10 }, deed: 'betrayal_mercy', unlocks: ['ET7'], ending: '',
        note: 'You let them live; a rarer, harder reputation — and it is remembered.' },
    ],
    dialogue: { start: 'set', nodes: {
      // reactive: name the betrayer by whichever faction you actually took up
      set: { route: [
        { when: (c) => c.karma.hasDeed('faction_smuggler'), to: 'set_smuggler' },
        { when: (c) => c.karma.hasDeed('faction_authority'), to: 'set_authority' },
        { to: 'set_generic' } ] },
      set_smuggler: { speaker: '', text:
        "Hugh Jass's man — the one you ran the crates with, the one who watched your back in the back rooms " +
        "— sold the meeting-spot to his rivals for a fat purse. You walk into the cove and the trap closes. " +
        "After everything you did for that crew.",
        options: [ { label: '(Cut your way out and corner the betrayer.)', to: 'face' } ] },
      set_authority: { speaker: '', text:
        "The harbourmaster's own deputy — the one who vouched for you, who shook your hand on the dock — " +
        "took smuggler coin to walk you into an ambush. You'd trusted the badge. You walk into the cove and " +
        "the trap closes.",
        options: [ { label: '(Cut your way out and corner the betrayer.)', to: 'face' } ] },
      set_generic: { speaker: '', text:
        "The harbour-hand who's watched your back since you made landfall in Saltbreak — shared your bread, " +
        "learned your habits — sold the meeting-spot for coin. You walk into the cove and the trap closes " +
        "around someone you'd come to trust.",
        options: [ { label: '(Cut your way out and corner the betrayer.)', to: 'face' } ] },
      face: { speaker: 'The Betrayer', text:
        "*on their knees in the surf, your blade at their throat* It was just COIN, all right? It's always " +
        "just coin out here. I never thought they'd— please. Please. I've a family up the strand.",
        options: [
          { label: '(They sold you. Make it final.)', choice: { quest: 'ST5', id: 'vengeance' }, end: true },
          { label: '(Lower the blade. Let them live with it.)', choice: { quest: 'ST5', id: 'mercy' }, end: true },
        ] },
    } },
  },

  // ST8 — Message in a Bottle (fun/link). Drops the coast Pem clue -> SG2.
  {
    id: 'ST8', title: 'Message in a Bottle', region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'fun', perm: false,
    requires: { quests: ['M13'] },
    reward: {},
    steps: [
      { id: 'find', desc: 'Find the bottle washed up along the strand.' },
    ],
    choices: [
      { id: 'read', label: 'Read the message in the bottle', impact: 'neutral',
        karma: {}, deed: 'message_bottle', ending: '',
        note: 'Another Pem clue, bobbed all the way round the coast.' },
    ],
    dialogue: { start: 'find', nodes: {
      find: { speaker: '', text:
        "Half-buried in the tideline, a green bottle with a curl of paper inside. You work the cork and " +
        "unroll it: not a cry for help — a boast. 'PEM WOZ ERE (and on the boat, and in the sea, and " +
        "probably yer soup).' The wanderer's trail, washed all the way round the coast.",
        options: [ { label: '(Pocket the Pem clue.)', deed: 'pem_clue_coast', meta: { hunt: 'pem' }, to: 'done' } ] },
      done: { speaker: '', text:
        "Three regions now have given up a Pem scratch. Whoever Pem is, they have been absolutely everywhere.",
        options: [ { label: '(Note it.)', choice: { quest: 'ST8', id: 'read' }, end: true } ] },
    } },
  },
];
