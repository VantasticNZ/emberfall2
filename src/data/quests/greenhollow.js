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

// L2 LOCATION-CLAIM MANIFEST (GAME-LAWS L2 extension) — every dialog line that asserts WHERE a named NPC is,
// audited from the childhood (M1-M7) + GH1-4 dialogue. The line is AUTHORITATIVE: the NPC must be PLACED in the
// claimed region. The `location-claims` verify gate checks each entry against the live placements, so a line
// can never again claim an NPC is somewhere they are not (the Bram-at-the-forge bug). Place/item tasks ("the
// coin-purse by the market", "the cave at the meadow", "the orchard den", brook chores) claim no NPC → exempt.
export const LOCATION_CLAIMS = [
  { quest: 'M1', npc: 'Bram',  region: 'Greenhollow', line: "Bram's down at the forge already, asking after you. (Bram is at the forge building, tx10,24)" },
  { quest: 'M1', npc: 'Bram',  region: 'Greenhollow', line: "Find Bram at the forge. (step)" },
  { quest: 'M7', npc: 'Hodge', region: 'Greenhollow', line: "see Hodge. You'll not go unarmed. (the GH smith, at the forge)" },
];

// L6 ACTION-BASED KARMA MANIFEST (GAME-LAWS L6) — karma/deeds move ONLY when the action actually occurs, never
// on announcing intent. Every karma-moving quest CHOICE (childhood M1-M7 + slice GH1-4) is audited here:
//   'deferred'      — the choice ANNOUNCES intent; the deed fires LATER from an action handler (defer:true on
//                     the option; the scene fires it when the doing happens). e.g. M1 greet/ignore.
//   'action-at-site'— the choice EXECUTES the action at the present site (hand it over, break it, pocket it,
//                     kick the hen, free the pups) — legitimately fires on the line.
//   'speech-act'    — the choice is SAID to a present NPC (vow to Sela, tell the Acolyte) — fires on the line.
// The `deed-timing` verify gate asserts every quest choice is classified here AND that a 'deferred' choice's
// option actually carries defer:true (so an intent-fork can never silently move karma on the line).
export const DEED_TIMING = {
  // CHILDHOOD
  'M1:greet': 'deferred',     'M1:ignore': 'deferred',
  'M2:catch': 'action-at-site', 'M2:kick': 'action-at-site', 'M2:free': 'action-at-site',
  'M3:return': 'action-at-site', 'M3:keep': 'action-at-site', 'M3:gift': 'action-at-site',
  'M4:tell': 'speech-act', 'M4:explore': 'action-at-site', 'M4:dare': 'speech-act',
  'M5:comfort': 'action-at-site', 'M5:ignore': 'action-at-site',
  'M6:vengeance': 'speech-act', 'M6:protect': 'speech-act',
  'M7:accept': 'speech-act', 'M7:press': 'speech-act',
  // SLICE
  'GH1:share': 'action-at-site', 'GH1:job': 'action-at-site', 'GH1:take': 'action-at-site',
  'GH2:gentle': 'action-at-site', 'GH2:break': 'action-at-site', 'GH2:comfort': 'action-at-site', 'GH2:healed': 'action-at-site',
  'GH3:mercy': 'action-at-site', 'GH3:cull': 'action-at-site', 'GH3:letter_keep': 'action-at-site',
  'GH4:tell': 'speech-act', 'GH4:keep': 'speech-act', 'GH4:desecrate': 'action-at-site',
};

export const GREENHOLLOW_CHILDHOOD = [
  // ---------------------------------------------------------------------------
  // M1 — A Greenhollow Morning (tutorial; the warm world, before the loss)
  // ---------------------------------------------------------------------------
  {
    id: 'M1', title: 'A Greenhollow Morning', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome', perm: false,
    worldDriven: true,   // L2 story-claim: the opening SPANS cottage→forge — Mara sends you out, Bram (placed AT
                         // the forge, per his line) completes it. So it can't auto-complete on the cottage talk.
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
      // BEAT 1 — Mara, in the cottage. She sends you to the forge (the claim is now TRUE: Bram IS at the forge).
      // The engine tree links wake→forge (so the whole arc walks in one pass for the unit tests); the SCENE
      // intercepts after `wake` and CLOSES the cottage talk (it does not play Bram's line in the cottage) —
      // you then walk to the forge and Bram hosts the `forge` node where he stands. See _dlgConfirm M1 split.
      wake: { speaker: 'Mara', text:
        "Up you get, sleepyhead — the morning's wasting and the hens won't feed themselves. " +
        "Bram's down at the forge already, asking after you. Go on and see him.",
        options: [ { label: 'Coming, Mara! (off to the forge)', to: 'forge' } ] },
      // BEAT 2 — Bram, AT the forge (his own placement). Talking to him here completes M1.
      forge: { speaker: 'Bram', text:
        "There's my little terror. Here — I carved you something. Not a sword, mind; you'll get " +
        "splinters and that's adventure enough at your age. Now: mind the hens, and mind Old Edda — " +
        "she bites worse'n the hens.",
        options: [
          // L6: these ANNOUNCE intent — the deed fires when the greeting (or the passing-by) actually happens in
          // the square, tracked by the scene. defer:true → the scene pledges + fires the choice from the action.
          { label: '(Run and say hello to everyone in the square.)', choice: { quest: 'M1', id: 'greet' }, defer: true, pledge: 'greet', end: true },
          { label: '(Keep your head down and slip past.)', choice: { quest: 'M1', id: 'ignore' }, defer: true, pledge: 'ignore', end: true },
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
    // A real go-and-do (item 7a): Mara sets THREE tracked chores; the player works through them one at a
    // time and the OBJECTIVE TRACKER advances eggs → water → hen (set:'advance:M2' fires quests.advance in the
    // scene; harmless no-op in unit tests, so the childhood chain stays green) before the seeded hen-choice.
    dialogue: { start: 'chores', nodes: {
      chores: { speaker: 'Mara', text:
        "Three little jobs, if you've the legs for it: eggs from the far coop by the brook, water on " +
        "the orchard saplings, and Henrietta — the brown hen — back in her pen. She's an escape " +
        "artist, that one.",
        options: [ { label: "I'm on it — the coop first.", to: 'eggs' } ] },
      eggs: { speaker: '', text:
        "You trot down to the far coop by the brook and ferry the warm eggs back to the basket, careful " +
        "not to crack a one. First job done — the saplings next.",
        options: [ { label: '(On to the orchard saplings.)', set: 'advance:M2', to: 'water' } ] },
      water: { speaker: '', text:
        "You lug the watering can along the sapling row, tipping a good drink over each thirsty little " +
        "tree. Two jobs down — and one brown blur of a runaway hen left to go.",
        options: [ { label: '(Go and corner Henrietta.)', set: 'advance:M2', to: 'chase' } ] },
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
  // M5 — The Festival (build-up + DREAD). Wholesome warmth tips into wrongness:
  // the Hearthflame flickers wrong, Bram uneasy, the oracle too-quick to soothe.
  // ---------------------------------------------------------------------------
  {
    id: 'M5', title: 'The Festival', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'wholesome/dread', perm: false,
    unlocks: ['M6'],
    reward: { item: 'festival_keepsake' },
    steps: [
      { id: 'prep', desc: 'Help prepare — hang the lanterns, stack the wood.' },
      { id: 'festival', desc: 'Enjoy the Hearthflame Festival.' },
      { id: 'wrong', desc: 'Something is wrong with the Flame...' },
    ],
    choices: [
      { id: 'comfort', label: 'Comfort the scared child', impact: 'good',
        karma: { morality: 10 }, deed: 'comforted_child',
        note: 'A small kindness in the dark — quietly remembered.' },
      { id: 'ignore', label: 'Ignore the unease', impact: 'neutral',
        karma: {}, deed: 'ignored_unease',
        note: 'The dread settles in, unspoken.' },
    ],
    dialogue: { start: 'prep', nodes: {
      prep: { speaker: 'Mara', text:
        "Lanterns up, wood on the pile — the Hearthflame Festival won't ready itself! Best night of " +
        "the whole year, this one. Go on, lend a hand.",
        options: [ { label: '(Hang the lanterns with the others.)', to: 'festival' } ] },
      festival: { speaker: 'Bram', text:
        "Look at them all — Edda dancing like she's twenty, the Tankard lads murdering a good song. " +
        "THIS is what I stand at the forge for, you know. Nights like this one.",
        options: [ { label: '(Watch the Oracle bless the Flame.)', to: 'flicker' } ] },
      flicker: { speaker: 'Bram', text:
        "...Did you see that? The Flame — it FLINCHED. Forty winters I've tended that fire and it's " +
        "never once done that. *a cold wind cuts clean through the warmth, and the music falters*",
        options: [ { label: '(Look to the Oracle.)', to: 'oracle' } ] },
      oracle: { speaker: 'Oracle', text:
        "All is well, good people — the Flame merely burns bright tonight, nothing more. Smile, now. " +
        "It's a festival. *the smile arrives a half-beat too quick, and does not reach the eyes*",
        options: [ { label: '(Nearby, a small child begins to cry.)', to: 'child' } ] },
      child: { speaker: '', text:
        "A little one has started crying — frightened by the cold wind, the wrong-coloured flame, the " +
        "grown-ups' too-bright smiles.",
        options: [
          { label: '(Kneel down and comfort the scared child.)', choice: { quest: 'M5', id: 'comfort' }, end: true },
          { label: '(Look away — the unease is catching.)', choice: { quest: 'M5', id: 'ignore' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M6 — The Night It Burned (CATASTROPHE). The Flame erupts; Bram is lost
  // saving you (he gives back the toy + a last word); Sela sends you WEST;
  // "TEN WINTERS PASS" (time-skip). The grief vow shapes the adult tone.
  // ---------------------------------------------------------------------------
  {
    id: 'M6', title: 'The Night It Burned', region: 'Greenhollow', act: 1,
    type: 'main', tone: 'dark/heartfelt', perm: false,
    unlocks: ['M7'],
    reward: {},
    steps: [
      { id: 'erupt', desc: 'The Hearthflame erupts — the village burns.' },
      { id: 'flee', desc: 'Flee the fire with Bram.' },
      { id: 'ash', desc: 'Dawn over the ash. Say what you must.' },
    ],
    choices: [
      { id: 'vengeance', label: 'Vow vengeance over the ash', impact: 'dark',
        karma: {}, deed: 'grief_vengeance', ending: 'T-lean',
        note: 'Your adult self is harder, colder; NPCs note the edge.' },
      { id: 'protect', label: 'Vow protection', impact: 'good',
        karma: { morality: 10 }, deed: 'grief_vow', unlocks: ['ET2'], ending: '',
        note: 'Honored in the epilogue; a protective reputation.' },
    ],
    dialogue: { start: 'night', nodes: {
      night: { speaker: '', text:
        "Night. A sound like the world tearing — and the Hearthflame ERUPTS, white and screaming. " +
        "The thatch catches. Greenhollow begins to burn.",
        options: [ { label: '(Run!)', to: 'flee' } ] },
      flee: { speaker: 'Bram', text:
        "I've got you — I've GOT you, don't you look back! *he shoulders through the fire, throws you " +
        "clear of the falling beam — and then the flame takes the doorway between you* ...Take the toy. " +
        "Take it and RUN. Tell them old Bram— *the roof comes down*",
        options: [ { label: '(Stagger out into the ash.)', to: 'grief' } ] },
      grief: { speaker: '', text:
        "Dawn. Grey ash where the village stood. The little wooden toy is still clenched in your fist. " +
        "Whatever you say over this silence, you will carry the rest of your life.",
        options: [
          { label: '"I will make the Flame pay for this." (vow vengeance)', choice: { quest: 'M6', id: 'vengeance' }, to: 'sela' },
          { label: '"I will protect what\'s left. Always." (vow protection)', choice: { quest: 'M6', id: 'protect' }, to: 'sela' },
        ] },
      sela: { speaker: 'Sela', text:
        "Breathe, child. I am Sela, of the Oracles. The Flame is... more than a fire; it must be tended, " +
        "and it cannot be tended by the grieving. You will go west, where it is safe. You will grow. " +
        "*she is kind — and just a little too composed*",
        options: [ { label: '(Let her lead you from the ash.)', to: 'timeskip' } ] },
      timeskip: { speaker: '', text:
        "— TEN WINTERS PASS —\n\nThe child who fled is grown now, and the long road bends back, at last, " +
        "toward home.",
        options: [ { label: '(Return to Greenhollow, grown.)', deed: 'time_skip', end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M7 — Ten Winters Gone (the KARMA-REACTIVE adult return; first weapon).
  // The first big payoff of the deed-memory engine: the welcome BRANCHES on the
  // Act 1 deeds/karma already in the Karma engine (reactive `route` nodes read
  // ctx.karma). Earn the first blade from Hodge (data reward + a weapon flag the
  // later combat system reads). Choice: accept Sela's charge / press her (doubt).
  // ---------------------------------------------------------------------------
  {
    id: 'M7', title: 'Ten Winters Gone', region: 'Greenhollow', act: 2,
    type: 'main', tone: 'varies', perm: false,
    unlocks: ['M8'],
    reward: { weapon: 'wooden_sword', items: ['wooden_sword'], hub: 'Greenhollow' },
    steps: [
      { id: 'arrive', desc: 'Return to Greenhollow, ten winters on.' },
      { id: 'welcome', desc: 'See how the village remembers you.' },
      { id: 'forge', desc: 'Earn your first blade from Hodge the smith.' },
      { id: 'charge', desc: "Hear Sela's charge — decide how far to trust it." },
    ],
    choices: [
      { id: 'accept', label: "Accept Sela's mission", impact: 'neutral',
        karma: {}, deed: 'sela_trusted', unlocks: ['SG1', 'SG2', 'SG3'], ending: '',
        note: "You take the oracle's framing at face value; the village hub opens." },
      { id: 'press', label: 'Press Sela for answers', impact: 'neutral',
        karma: {}, deed: 'sela_doubt', ending: 'L-hint',
        note: 'A seed of doubt in the oracles — quietly toward the truth-path.' },
    ],
    dialogue: { start: 'arrive', nodes: {
      arrive: { speaker: '', text:
        "Ten winters, and the west road finally bends back toward home. Greenhollow rises ahead — " +
        "rebuilt, but scarred: new thatch on old stone, and a black scorch on the green where the " +
        "Hearthflame stood.",
        options: [ { label: '(Walk into the village.)', to: 'welcome' } ] },

      // --- reactive welcome by overall Morality -------------------------------
      welcome: { route: [
        { when: (c) => c.karma.get('morality') >= 20, to: 'welcome_warm' },
        { when: (c) => c.karma.get('morality') <= -20, to: 'welcome_wary' },
        { to: 'welcome_neutral' } ] },
      welcome_warm: { speaker: 'Villager', text:
        "Is that— it IS! Look who the west road sent back to us! Ten winters and you've Bram's own " +
        "shoulders on you now. Welcome home, love — we never stopped hoping.",
        options: [ { label: '(Walk on through the square.)', to: 'cb_chicken' } ] },
      welcome_wary: { speaker: 'Villager', text:
        "...You. Grown, then. We weren't sure you'd come back — weren't altogether sure we wanted you " +
        "to, if I'm honest. Mind how you go here.",
        options: [ { label: '(Walk on through the square.)', to: 'cb_chicken' } ] },
      welcome_neutral: { speaker: 'Villager', text:
        "Well. The west road gives one back — grown and quiet. Greenhollow's smaller than you'll " +
        "remember. Welcome back, I suppose.",
        options: [ { label: '(Walk on through the square.)', to: 'cb_chicken' } ] },

      // --- specific deed callback: the chicken -------------------------------
      cb_chicken: { route: [
        { when: (c) => c.karma.hasDeed('chicken_kicked'), to: 'chicken_cold' },
        { to: 'cb_coin' } ] },
      chicken_cold: { speaker: 'Henwife', text:
        "*a brown hen glares from the crook of her arm* Oh. It's YOU. We remember what you did to poor " +
        "Henrietta when you were small, clear as yesterday. Keep your boots to yourself this time.",
        options: [ { label: '(Move along.)', to: 'cb_coin' } ] },

      // --- specific deed callback: the coin / McCracken ----------------------
      cb_coin: { route: [
        { when: (c) => c.karma.hasDeed('coin_returned'), to: 'coin_friendly' },
        { when: (c) => c.karma.hasDeed('coin_kept'), to: 'coin_wary' },
        { to: 'sela' } ] },
      coin_friendly: { speaker: 'Phil McCracken', text:
        "Bless me — the honest one! You handed me back my whole purse when you were knee-high. Never " +
        "forgot it, never will. Come to McCracken's stall any time — friend's price, always.",
        options: [ { label: '(Smile back.)', to: 'sela' } ] },
      coin_wary: { speaker: 'Phil McCracken', text:
        "...I know that face. A fat purse went missing the same year you did, you know. Funny, that. " +
        "I'll keep one hand on my stall, thanks all the same.",
        options: [ { label: '(Move on.)', to: 'sela' } ] },

      // --- Sela's charge -> the forge ----------------------------------------
      sela: { speaker: 'Sela', text:
        "You've grown well. I'll not soften it: the Hearthflame is failing — not here alone, but in " +
        "every hearth across the land. Five shards were struck from it once; they must be found again. " +
        "The first lies west, in the Ashen Marsh. But first — see Hodge. You'll not go unarmed.",
        options: [ { label: '(Go to the forge.)', to: 'forge_tone' } ] },
      // grief tone callback: vengeance-vow reads colder at the forge
      forge_tone: { route: [
        { when: (c) => c.karma.hasDeed('grief_vengeance'), to: 'forge_hard' },
        { to: 'forge' } ] },
      forge_hard: { speaker: 'Hodge', text:
        "*Hodge studies your face a long moment* ...There's an edge on you the boy never had. Grief'll " +
        "do that. Well — better a blade in your hand than a grudge in your chest. Come here.",
        options: [ { label: '(Step up to the anvil.)', to: 'forge' } ] },
      forge: { speaker: 'Hodge', text:
        "Hodge, smith — I knew your Bram. Bring me a good branch off that split oak — aye, that one — " +
        "and I'll cap and bind it. Wooden for now; bring me steel and ore off the road and I'll make " +
        "it SING. There. Your first blade. Mind you don't lose it.",
        options: [ { label: '(Take the blade.)', deed: 'weapon_wooden_sword', meta: { weapon: 'wooden_sword' }, to: 'charge' } ] },

      // --- the choice: trust the oracle, or press her ------------------------
      charge: { speaker: 'Sela', text:
        "So. West, to the Ashen Marsh, and the first shard. Will you take up this charge?",
        options: [
          { label: "I'll go. Whatever it takes.", choice: { quest: 'M7', id: 'accept' }, end: true },
          { label: "First — tell me what you're not saying.", choice: { quest: 'M7', id: 'press' }, end: true },
        ] },
    } },
  },
];
