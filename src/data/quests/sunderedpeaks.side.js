// =============================================================================
// SUNDERED PEAKS — SIDE QUESTS (SP1-SP5), authored as DATA on the QuestEngine.
// The order's records (+ a Pem clue), a bounty, the miners-vs-owner fork (Mike
// Hunt), a grapple-gated climb, and the SIGNATURE morality-reactive TRICK quest
// (SP5) whose outcome flips on your CURRENT karma — not a menu choice.
//
// GATE D for all: objectives are SPREAD (the Keep archive, the high crags, the
// mine + town hall, the high pass). Canonical deed-ids so faction echoes, the
// Pem hunt, and the karma trick all read the same memory.
// =============================================================================

export const SUNDERED_PEAKS_SIDE = [
  // SP1 — The Order's Records (story). Unlocked by leaning workers (M11).
  // Supports the M12 truth; drops pem_clue_peaks toward the cross-region hunt.
  {
    id: 'SP1', title: "The Order's Records", region: 'Sundered Peaks', act: 2,
    type: 'side', tone: 'mystery', perm: false,
    reward: { lore: 'order_lie_depth', key: 'archive' },
    steps: [
      { id: 'archive', desc: 'Search the scattered record-rooms of Cinder Keep.' },
      { id: 'piece', desc: 'Piece together how deep the oracle lie runs.' },
    ],
    choices: [
      { id: 'read', label: 'Uncover the Order\'s records', impact: 'neutral',
        karma: {}, deed: 'order_records', ending: '',
        note: 'Confirms the depth of the lie (supports M12); a Pem scratch among the ledgers.' },
    ],
    dialogue: { start: 'archive', nodes: {
      archive: { speaker: '', text:
        "The Keep's records are scattered across a dozen wind-bitten rooms — ledgers, sealed orders, a " +
        "burned confession. You gather them the long way, room by room.",
        options: [ { label: '(Read the oldest sealed orders.)', to: 'pem' } ] },
      pem: { speaker: '', text:
        "Among the ledgers, in a margin, a familiar crude hand has scratched: 'PEM WOZ ERE — even up " +
        "'ere, the gits.' The wanderer's trail again. You note it, and read on.",
        options: [ { label: '(Note the Pem clue; piece the lie together.)', deed: 'pem_clue_peaks', meta: { hunt: 'pem' }, to: 'piece' } ] },
      piece: { speaker: '', text:
        "Set side by side, the records damn the Order plainly: they catalogued the god's screaming, the " +
        "spreading sickness, and the order to 'maintain the comfortable account' regardless. They knew. " +
        "For generations, they knew.",
        options: [ { label: '(Take the proof.)', choice: { quest: 'SP1', id: 'read' }, end: true } ] },
    } },
  },

  // SP2 — Bounty: The Crag Beast (job/loot). Unlocked by leaning workers (M11).
  // A tough hunt across the high crags -> an epic weapon.
  {
    id: 'SP2', title: 'Bounty: The Crag Beast', region: 'Sundered Peaks', act: 2,
    type: 'job', tone: 'tense', perm: false,
    reward: { items: ['crag_maul'], gold: 250 },
    steps: [
      { id: 'track', desc: 'Track the Crag Beast across the high ridges.' },
      { id: 'slay', desc: 'Bring down the beast (a tough optional fight).' },
    ],
    choices: [
      { id: 'slay', label: 'Hunt down the Crag Beast', impact: 'neutral',
        karma: {}, deed: 'crag_beast_slain', ending: '',
        note: 'Epic reward: the Crag Maul. A genuinely tough optional fight.' },
    ],
    dialogue: { start: 'board', nodes: {
      board: { speaker: 'Bounty-Master', text:
        "There's coin on the board for the Crag Beast — takes a goat a week and a careless miner now and " +
        "then. Ranges the high ridges; you'll earn it. Bring me a tusk and the Crag Maul's yours.",
        options: [ { label: '(Track it across the ridges.)', to: 'fight' } ] },
      fight: { speaker: '', text:
        "High on the wind-scoured crags you corner it — all muscle and yellowed tusk. It is a long, hard " +
        "fight on bad footing, but it falls. You take the tusk, and the great maul it had been guarding " +
        "in its den.",
        options: [ { label: '(Claim the Crag Maul.)', choice: { quest: 'SP2', id: 'slay' }, end: true } ] },
    } },
  },

  // SP3 — The Stubborn Miner (morality fork; Mike Hunt). Unlocked by leaning
  // workers (M11). Faction echo deed -> ET6. workers (+M) / owner (-P) / peace (+P).
  {
    id: 'SP3', title: 'The Stubborn Miner', region: 'Sundered Peaks', act: 2,
    type: 'side', tone: 'morality', perm: false,
    reward: { rep: 'peaks_faction' },
    steps: [
      { id: 'mine', desc: 'Hear both sides — at the mine and the town hall.' },
      { id: 'decide', desc: 'Resolve the dispute.' },
    ],
    choices: [
      { id: 'workers', label: 'Side with the workers', impact: 'good',
        karma: { morality: 10 }, deed: 'faction_workers', unlocks: ['ET6'], ending: '',
        note: 'The miners win their due; the town remembers (faction echo).' },
      { id: 'owner', label: 'Side with the owner (gold)', impact: 'dark',
        karma: { purity: -10 }, deed: 'faction_owner', unlocks: ['ET6'], ending: '',
        note: "Mike Hunt pays well; the miners are crushed (faction echo)." },
      { id: 'peace', label: 'Broker a lasting peace', impact: 'good',
        karma: { purity: 10 }, deed: 'faction_peace', unlocks: ['ET6'], ending: '',
        note: 'Hardest path: both sides grudgingly content; the town heals (faction echo).' },
    ],
    dialogue: { start: 'mine', nodes: {
      mine: { speaker: 'Mike Hunt', text:
        "*the mine-owner spreads his hands* It's MY mine, friend. They knew the wage when they took the " +
        "pick. Soft hearts don't shore up a tunnel. ...Course, a sensible sort could earn a great deal " +
        "seeing it my way.",
        options: [ { label: '(Hear the miners at the town hall too.)', to: 'decide' } ] },
      decide: { speaker: 'Miner', text:
        "He's bleeding us white and the props are rotting — someone'll die down there before he spares a " +
        "copper. You've heard us both now. Where do you stand?",
        options: [
          { label: '(Force Hunt to pay the miners their due.)', choice: { quest: 'SP3', id: 'workers' }, end: true },
          { label: "(Take Hunt's gold; the miners can lump it.)", choice: { quest: 'SP3', id: 'owner' }, end: true },
          { label: '(Broker a settlement both sides can live with.)', choice: { quest: 'SP3', id: 'peace' }, end: true },
        ] },
    } },
  },

  // SP4 — High-Pass Climb (fun). GRAPPLE-gated traversal challenge -> treasure.
  {
    id: 'SP4', title: 'High-Pass Climb', region: 'Sundered Peaks', act: 2,
    type: 'side', tone: 'fun', perm: false,
    requires: { deeds: ['tool_grapple'] },   // needs the grapple from M12
    reward: { items: ['skyiron_charm'], gold: 150 },
    steps: [
      { id: 'climb', desc: 'Grapple the High Pass spires to the hidden cache.' },
    ],
    choices: [
      { id: 'climb', label: 'Grapple the High Pass to the treasure', impact: 'neutral',
        karma: {}, deed: 'high_pass_climbed', ending: '',
        note: 'A pure traversal challenge; a sky-iron charm at the top.' },
    ],
    dialogue: { start: 'pass', nodes: {
      pass: { speaker: '', text:
        "The High Pass spires rake the cloud — and a glint of old treasure sits where only a grapple can " +
        "reach. You hook spire to spire, swinging the gaps, until the cache is in your hand and the whole " +
        "range is laid out below you.",
        options: [ { label: '(Take the cache.)', choice: { quest: 'SP4', id: 'climb' }, end: true } ] },
    } },
  },

  // SP5 — A Stranger's Plea [THE MORALITY-REACTIVE TRICK QUEST]. You agree to
  // help; your CURRENT karma flips the OUTCOME (no menu choice): Kind -> a real
  // rescue; Cruel/Corrupt -> the "brother" is a setup and you're used as a thug,
  // realized too late. Deeds: stranger_rescued / stranger_used.
  {
    id: 'SP5', title: "A Stranger's Plea", region: 'Sundered Peaks', act: 2,
    type: 'twist', tone: 'trick', perm: false,
    requires: { quests: ['M11'] },
    reward: {},
    steps: [
      { id: 'plea', desc: 'A stranger begs you to save their brother in the high pass.' },
      { id: 'truth', desc: 'Discover what your help was really for.' },
    ],
    choices: [
      { id: 'rescue', label: '(outcome) A genuine rescue', impact: 'good',
        karma: { morality: 5 }, deed: 'stranger_rescued', ending: '',
        note: 'KIND state: the plea was true; you save a real boy; the town honours you.' },
      { id: 'duped', label: '(outcome) Used as a thug', impact: 'dark',
        karma: { purity: -5 }, deed: 'stranger_used', ending: '',
        note: 'CRUEL/CORRUPT state: there was no brother; you did the stranger\'s killing — realized too late.' },
    ],
    dialogue: { start: 'plea', nodes: {
      plea: { speaker: 'Desperate Stranger', text:
        "Please — PLEASE — they've taken my brother up into the high pass, bandits, they'll kill him by " +
        "nightfall! You've the look of someone who can fight. I've no one else. Will you help me save " +
        "him?",
        options: [ { label: '(Agree to help.)', to: 'outcome' } ] },
      // THE TRICK: the outcome reads your CURRENT standing, not a menu choice.
      outcome: { route: [
        { when: (c) => c.karma.get('morality') <= -20 || c.karma.get('purity') <= -20, to: 'trap' },
        { to: 'rescue' } ] },
      rescue: { speaker: '', text:
        "It's true — every word. A terrified boy, real bandits, a real blade at his throat. You cut him " +
        "free and his brother weeps into his hair. By the time you're back down the mountain the whole " +
        "town has the story. A clean, good thing, and rare.",
        options: [ { label: '(A genuine rescue.)', choice: { quest: 'SP5', id: 'rescue' }, end: true } ] },
      trap: { speaker: '', text:
        "...There is no brother. The 'bandits' were the stranger's rivals, and 'the high pass' was a " +
        "quiet place to do murder. You understand it a heartbeat too late — knife already wet, the " +
        "stranger already melting into the rocks. You were the weapon. They picked you because you " +
        "looked like someone who wouldn't ask.",
        options: [ { label: '(Used. Too late.)', choice: { quest: 'SP5', id: 'duped' }, end: true } ] },
    } },
  },

  // PH1 — The Runaway Cart (a genuinely no-win choice: ACT and kill more, do
  // NOTHING and let one die, or try for all and likely fail). Weighs Morality.
  // The Peaks react to WHAT you chose, never to whether it was "correct".
  {
    id: 'PH1', title: 'The Runaway Cart', region: 'Sundered Peaks', act: 2,
    type: 'twist', tone: 'morality', perm: false,
    requires: { quests: ['M11'] },
    reward: {},
    steps: [
      { id: 'scene', desc: 'A runaway ore cart bears down on a pinned miner; a lever would divert it.' },
      { id: 'decide', desc: 'Act, or not — there is no clean road out of this.' },
    ],
    choices: [
      { id: 'divert', label: 'Pull the lever — divert the cart', impact: 'dark',
        karma: { morality: -10 }, deed: 'cart_diverted', meta: { died: 3 }, ending: '',
        note: 'You act; the cart takes the side tunnel. One would have died — now three do, by your hand.' },
      { id: 'hold', label: "Don't touch the lever", impact: 'neutral',
        karma: { morality: -5 }, deed: 'cart_held', meta: { died: 1 }, ending: '',
        note: 'You let it run its course; the pinned miner dies, and you did nothing to stop it.' },
      { id: 'try', label: 'Throw yourself at saving everyone', impact: 'good',
        karma: { morality: 5 }, deed: 'cart_tried_all', meta: { died: 1 }, ending: '',
        note: 'You go for all of them; the cart is faster than hope. The one still dies — but the Peaks saw you try.' },
    ],
    dialogue: { start: 'scene', nodes: {
      scene: { speaker: 'Miner', text:
        "*a scream of iron on iron* The CART — the brake's gone! Tomas is pinned on the main line, it'll cut " +
        "him clean in half! *jabs at a switch-lever* That throws it down the east tunnel — but Garrick and " +
        "his lads are in the east tunnel, three of 'em, backs turned, can't hear a thing! There's no TIME — " +
        "what do we DO?!",
        options: [ { label: '(One on the main line. Three down the tunnel. A lever between.)', to: 'decide' } ] },
      decide: { speaker: '', text:
        "The cart screams closer. Every road from this moment ends with someone under it. You have a breath. " +
        "Maybe two.",
        options: [
          { label: '(Pull the lever — send it down the tunnel.)', choice: { quest: 'PH1', id: 'divert' }, to: 'out_divert' },
          { label: "(Leave the lever — refuse to pick who dies.)", choice: { quest: 'PH1', id: 'hold' }, to: 'out_hold' },
          { label: '(Drop the lever — run to drag Tomas free yourself.)', choice: { quest: 'PH1', id: 'try' }, to: 'out_try' },
        ] },
      out_divert: { speaker: '', text:
        "The cart screams into the east tunnel. Three voices stop at once, mid-whistle. Tomas lives, and will " +
        "not meet your eye again — because he knows exactly what you spent to keep him. No one in the Peaks " +
        "calls it murder. No one calls it anything at all. That's almost the worst of it.",
        options: [ { label: '(...)', end: true } ] },
      out_hold: { speaker: '', text:
        "You keep your hand off the iron. The cart takes Tomas. An hour on, Garrick's lads climb out of the " +
        "east tunnel whistling, never knowing how close it came, never knowing the trade you didn't make. " +
        "You did nothing, and a man died, and you will turn that word — nothing — over for a long while.",
        options: [ { label: '(...)', end: true } ] },
      out_try: { speaker: '', text:
        "You fling the lever aside and HURL yourself at Tomas's pinned leg — and the cart is just that bit " +
        "faster than you are brave. It takes him anyway. You're left with torn hands and the plain truth " +
        "that wanting to save everyone is not the same as doing it. The miners haul you back from the rails, " +
        "and they remember, after, that you tried.",
        options: [ { label: '(...)', end: true } ] },
    } },
  },
];
