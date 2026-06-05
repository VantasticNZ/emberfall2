// =============================================================================
// GREENHOLLOW — ACT 1 CHILDHOOD (M1-M4 + M5 stub), authored as DATA on the
// QuestEngine (src/systems/QuestEngine.js). Beats/choices/dialogue/deed-hooks
// pulled from docs/QUESTS-MAIN-FLESH.md. Deed ids match the Karma engine +
// docs/QUEST-DATA.json (chicken_kicked, coin_returned, cave_lore, ...) so the
// downstream adult callbacks + ending-gating fire off the SAME memory.
//
// The seeded choices (chicken/coin/secret) are PERMANENT — they stick and call
// back in the adult game + endings (Bible: choices have lasting consequences).
// Dialogue is real content, run through the data-driven Dialogue system; each
// terminal option applies a quest choice via { choice: { quest, id } }.
// =============================================================================

export const GREENHOLLOW_CHILDHOOD = [
  // ---------------------------------------------------------------------------
  // M1 — A Greenhollow Morning (tutorial; the warm world, before the loss)
  // ---------------------------------------------------------------------------
  {
    id: 'M1', title: 'A Greenhollow Morning', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome', perm: false,
    unlocks: ['M2'],
    reward: { item: 'wooden_toy' }, // Bram's keepsake (callback item; M6)
    steps: [
      { id: 'wake', desc: 'Get up — Mara is calling from downstairs.' },
      { id: 'forge', desc: 'Find Bram at the forge.' },
      { id: 'greet', desc: 'Say hello around the square.' },
    ],
    choices: [
      { id: 'greet', label: 'Greet the village warmly', impact: 'good',
        karma: { morality: 10 }, deed: 'greeted_warmly',
        note: 'The village remembers you fondly — a warmer adult return.' },
      { id: 'ignore', label: 'Keep your head down and pass by', impact: 'neutral',
        karma: { morality: -5 }, deed: 'kept_to_self',
        note: 'A cooler, lonelier childhood tone.' },
    ],
    dialogue: { start: 'wake', nodes: {
      wake: { speaker: 'Mara', text:
        "Up you get, sleepyhead — the morning's wasting and the hens won't feed themselves. " +
        "Bram's down at the forge already, asking after you.",
        options: [ { label: 'Coming, Mara!', to: 'forge' } ] },
      forge: { speaker: 'Bram', text:
        "There's my little terror. Here — I carved you something. Not a sword, mind; you'll get " +
        "splinters and that's adventure enough at your age. Now: mind the hens, and mind Old Edda — " +
        "she bites worse'n the hens.",
        options: [
          { label: '(Run and say hello to everyone in the square.)', choice: { quest: 'M1', id: 'greet' }, end: true },
          { label: '(Keep your head down and slip past.)', choice: { quest: 'M1', id: 'ignore' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M2 — Chores + Mischief (SEEDED CHOICE 1: the Chicken). Chores are spread
  // across the MEADOW (Gate D: no item-in-front-of-the-giver).
  // ---------------------------------------------------------------------------
  {
    id: 'M2', title: 'Chores + Mischief', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome/funny', perm: true,
    unlocks: ['M3'],
    reward: { gold: 5 },
    steps: [
      { id: 'eggs', desc: 'Fetch eggs from the far coop by the brook.' },
      { id: 'water', desc: 'Water the orchard saplings at the brook.' },
      { id: 'hen', desc: 'Get Henrietta the runaway hen back to her pen.' },
    ],
    choices: [
      { id: 'catch', label: 'Catch the hen gently', impact: 'good',
        karma: { morality: 10 }, deed: 'chicken_helped',
        note: "Henrietta's owner becomes a friendly face for life." },
      { id: 'kick', label: 'Kick the hen', impact: 'dark',
        karma: { morality: -15 }, deed: 'chicken_kicked',
        locks: ['SG7ally'], ending: 'T-lean',
        note: 'The owner never forgets; the chicken cameos at the Spire — a dark epilogue gag.' },
      { id: 'free', label: 'Fling the coop open — freedom for all!', impact: 'neutral',
        karma: { purity: -5 }, deed: 'chicken_freed',
        note: 'A small chaos; a kid thinks you a legend.' },
    ],
    dialogue: { start: 'chores', nodes: {
      chores: { speaker: 'Mara', text:
        "Three little jobs, if you've the legs for it: eggs from the far coop by the brook, water on " +
        "the orchard saplings, and Henrietta — the brown hen — back in her pen. She's an escape " +
        "artist, that one.",
        options: [ { label: "I'm on it!", to: 'chase' } ] },
      chase: { speaker: 'Tam', text:
        "*Henrietta bolts across the whole meadow, wings flapping* Haha — look at her GO! " +
        "Bet you won't boot it. Bet you a sweet you won't.",
        options: [
          { label: 'Easy now, Henrietta... gotcha. Back you go.', choice: { quest: 'M2', id: 'catch' }, end: true },
          { label: '(Wind up and boot the hen.)', choice: { quest: 'M2', id: 'kick' }, end: true },
          { label: '(Fling the coop open — freedom for all the hens!)', choice: { quest: 'M2', id: 'free' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M3 — The Coin (SEEDED CHOICE 2: honesty)
  // ---------------------------------------------------------------------------
  {
    id: 'M3', title: 'The Coin', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome', perm: true,
    unlocks: ['M4'],
    reward: {},
    steps: [
      { id: 'find', desc: 'Pick up the dropped coin-purse by the market.' },
      { id: 'decide', desc: 'Decide what to do — the merchant is searching nearby.' },
    ],
    choices: [
      { id: 'return', label: 'Return the purse', impact: 'good',
        karma: { morality: 10, purity: 10 }, deed: 'coin_returned',
        note: 'McCracken trusts you; better prices + a friendly face as an adult.' },
      { id: 'keep', label: 'Keep it quietly', impact: 'dark',
        karma: { morality: -5, purity: -10 }, deed: 'coin_kept', ending: 'T-lean',
        note: 'The merchant stays cold and watchful for the rest of the game.' },
      { id: 'gift', label: 'Use a coin to buy a friend a treat', impact: 'good',
        karma: { morality: 10 }, deed: 'coin_gifted',
        note: 'A childhood friend stays loyal into adulthood.' },
    ],
    dialogue: { start: 'find', nodes: {
      find: { speaker: '', text:
        "By the market stalls, a fat coin-purse lies in the mud. A few steps off, a sweating merchant " +
        "is patting his pockets in a rising panic.",
        options: [ { label: '(Pick it up.)', to: 'merchant' } ] },
      merchant: { speaker: 'Phil McCracken', text:
        "My purse — oh, my purse — I'm ruined, RUINED! A season's takings! ...unless some kind little " +
        "soul happens to have seen it?",
        options: [
          { label: 'Here, sir. You dropped this.', choice: { quest: 'M3', id: 'return' }, end: true },
          { label: '(Say nothing. Slip it into your pocket.)', choice: { quest: 'M3', id: 'keep' }, end: true },
          { label: '(Take one coin — buy Tam that sweet.)', choice: { quest: 'M3', id: 'gift' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M4 — The Boarded Cave (SEEDED CHOICE 3: the Secret). Explore-alone seeds
  // the SECRET ending: the weeping-flame carving -> deed `cave_lore`.
  // ---------------------------------------------------------------------------
  {
    id: 'M4', title: 'The Boarded Cave', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'mystery', perm: true,
    unlocks: ['M5'],
    reward: {},
    steps: [
      { id: 'find', desc: 'Investigate the boarded cave at the meadow edge.' },
      { id: 'decide', desc: 'The plank is loose. Decide.' },
    ],
    choices: [
      { id: 'tell', label: 'Tell an adult', impact: 'good',
        karma: { purity: 10 }, deed: 'told_adult',
        note: 'Bram warns you off — a tender, cautious memory.' },
      { id: 'explore', label: 'Explore alone', impact: 'neutral',
        karma: {}, deed: 'cave_lore', ending: 'A-hint',
        note: 'You see the weeping-flame carving — the FIRST seed of the god\'s truth; the secret-ending key.' },
      { id: 'dare', label: 'Dare a friend to go in', impact: 'dark',
        karma: { purity: -10 }, deed: 'dared_friend',
        note: 'If they get hurt, guilt haunts later dialogue.' },
    ],
    dialogue: { start: 'cave', nodes: {
      cave: { speaker: 'Tam', text:
        "That's the boarded cave. Grown-ups say don't — never say why. *a plank hangs loose, just wide " +
        "enough for someone small* ...but they're not here, are they?",
        options: [
          { label: 'We should tell Bram about the loose plank.', choice: { quest: 'M4', id: 'tell' }, end: true },
          { label: '(Squeeze through the gap and look.)', choice: { quest: 'M4', id: 'explore' }, to: 'carving' },
          { label: 'Go on, Tam — I dare YOU to go in.', choice: { quest: 'M4', id: 'dare' }, end: true },
        ] },
      carving: { speaker: '', text:
        "Inside it's cold and far too quiet. Scratched deep into the stone: a flame — but weeping, " +
        "tears running down the rock. The cold crawls up your arms. You don't understand it yet. " +
        "You won't forget it, either.",
        options: [ { label: '(Back out into the sun.)', end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M5 — The Festival (STUB — fleshed next session, M5-M6)
  // ---------------------------------------------------------------------------
  {
    id: 'M5', title: 'The Festival', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome/dread', perm: false,
    unlocks: [], reward: {}, choices: [],
    steps: [ { id: 'stub', desc: 'The Hearthflame Festival — warmth, then wrongness. (To be authored.)' } ],
  },
];
