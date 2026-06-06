// =============================================================================
// GREENHOLLOW HUB — SIDE QUESTS (SG1-SG7) + the childhood-callback vignette,
// authored as DATA on the QuestEngine. The adult hub: it pays off the Act-1
// seeds (the village REACTS to chicken_kicked / coin_returned / cave_lore /
// grief_vow) and closes cross-region links (the Pem hunt; the Mara letter).
//
// GATE D for all but the deliberate exception (SG1 Fatley): objectives are
// spread (the gate graffiti, scattered love-letters, the orchard, the tavern).
// SG1 is the ONE sanctioned item-in-front quest — a joke that TEACHES the marker
// system (the bible's named Gate-D exception). Canonical deed-ids so callbacks +
// the see-markers skill + the Pem hunt + the Mara epilogue all read the same
// memory. SG1/SG2/SG3 open when you accept Sela (M7); SG4/5/7 + the vignette
// open on the adult return (requires M7).
// =============================================================================

export const GREENHOLLOW_SIDE = [
  // SG1 — Fatley's Mug (THE Gate-D EXCEPTION: marker-onboarding). Unlocked by M7
  // 'accept'. Completing it unlocks SEEING the "?" markers (skill_see_markers).
  {
    id: 'SG1', title: "Fatley's Mug", region: 'Greenhollow', act: 2,
    type: 'side', tone: 'funny', perm: false,
    reward: { skill: 'see_markers' },
    steps: [
      { id: 'mug', desc: "Fetch Fatley's mug (it is, deliberately, right by his foot)." },
    ],
    choices: [
      // GATE-D EXCEPTION (sanctioned): the item IS right in front — the gag + the
      // marker tutorial. No karma. Records the see-markers unlock.
      { id: 'fetch', label: 'Fetch the mug (it is right there)', impact: 'neutral',
        karma: {}, deed: 'skill_see_markers', ending: '',
        note: 'The ONE sanctioned item-in-front quest (Gate-D exception): it teaches + unlocks the "?" marker sight.' },
    ],
    dialogue: { start: 'fatley', nodes: {
      fatley: { speaker: 'Fatley', text:
        "Oi. You. See that mug? There. By me foot. ...Nah, I can't be arsed, me back's gone. Hand it " +
        "here and I'll learn you summat worth more than the three steps it'd take me.",
        options: [ { label: '(Pick up the mug. It is, indeed, right there.)', to: 'reward' } ] },
      reward: { speaker: 'Fatley', text:
        "Champion. Right — see, folk with work to give get a little mark over 'em, a '?'. You couldn't " +
        "see 'em before, could you? Now you can. Don't say Fatley never gave you nowt. *burps*",
        options: [ { label: '(You can see the quest markers now.)', choice: { quest: 'SG1', id: 'fetch' }, end: true } ] },
    } },
  },

  // SG2 — PEM WOZ ERE (the cross-region clue-hunt). Available only once a clue
  // has been found in EVERY region; completing it finds Pem -> pem_found + epic
  // reward. Closes the pem_clue_marsh (Ashen Marsh SA1) loop. Region clues that
  // don't exist yet are stubbed as required deeds.
  {
    id: 'SG2', title: 'PEM WOZ ERE', region: 'Greenhollow', act: 2,
    type: 'side', tone: 'mystery/fun', perm: false,
    requires: { deeds: ['pem_clue_marsh', 'pem_clue_peaks', 'pem_clue_coast', 'pem_clue_emberwood'] },
    reward: { epic: 'pem_trinket' },
    steps: [
      { id: 'graffiti', desc: 'The gate graffiti: "PEM WOZ ERE." Who is Pem?' },
      { id: 'assemble', desc: 'Gather a Pem clue from every region.' },
      { id: 'find', desc: 'Follow the trail to Pem and claim the reward.' },
    ],
    choices: [
      { id: 'find_pem', label: 'Assemble all clues -> find Pem', impact: 'neutral',
        karma: {}, deed: 'pem_found', unlocks: ['ET9'], ending: '',
        note: 'Closes the cross-region Pem hunt; epic reward; a hidden-lore beat (feeds the secret ending).' },
    ],
    dialogue: { start: 'pem', nodes: {
      pem: { speaker: 'Pem', text:
        "Took you long ENOUGH! Followed me scratchings all the way round the world, did you? 'PEM WOZ " +
        "ERE' — aye, and Pem woz EVERYWHERE. Marsh, mountains, coast, the burning wood — left me name " +
        "on the lot. Few ever bother to follow. Here — for the effort, and the cheek of you.",
        options: [ { label: '(Take Pem\'s gift.)', choice: { quest: 'SG2', id: 'find_pem' }, end: true } ] },
    } },
  },

  // SG3 — Hodge's Apprentice (JOB). Unlocked by M7 'accept'. Gear discount +
  // repair skill (skill_repair_discount).
  {
    id: 'SG3', title: "Hodge's Apprentice", region: 'Greenhollow', act: 2,
    type: 'job', tone: 'wholesome', perm: false,
    reward: { discount: true, skill: 'repair' },
    steps: [
      { id: 'bellows', desc: 'Work the bellows + quench the steel at Hodge\'s forge.' },
      { id: 'mend', desc: 'Learn to mend your own blade.' },
    ],
    choices: [
      { id: 'help', label: 'Apprentice at the forge', impact: 'neutral',
        karma: {}, deed: 'skill_repair_discount', ending: '',
        note: "Friend's price on Hodge's gear + the repair skill." },
    ],
    dialogue: { start: 'hodge', nodes: {
      hodge: { speaker: 'Hodge', text:
        "Want to be of use instead of underfoot? Pump the bellows, quench the steel, and don't burn my " +
        "forge down. Do that proper and I'll knock the friend's-price off your gear and teach you to " +
        "mend your own blade on the road. Bram'd have wanted you handy.",
        options: [ { label: '(Roll up your sleeves.)', choice: { quest: 'SG3', id: 'help' }, end: true } ] },
    } },
  },

  // SG4 — Mara's Letters (vignette/morality). REACTS to drowned_letter (Ashen
  // Marsh SA5): if you carried her letter home, Mara greets you warmly here.
  // Choice: return (+M) / keep silent / expose (-M, mara_exposed, absent from
  // the epilogue). Requires the adult return (M7).
  {
    id: 'SG4', title: "Mara's Letters", region: 'Greenhollow', act: 2,
    type: 'side', tone: 'heartfelt/morality', perm: true,
    requires: { quests: ['M7'] },
    reward: {},
    steps: [
      { id: 'find', desc: "Find Mara's hidden love-letters." },
      { id: 'decide', desc: 'Return them / keep the secret / expose them.' },
    ],
    choices: [
      { id: 'return', label: 'Return them discreetly', impact: 'good',
        karma: { morality: 10 }, deed: 'mara_letters_returned', ending: '',
        note: 'Mara trusts you; warm for the rest of the game.' },
      { id: 'silent', label: 'Read them, keep the secret', impact: 'neutral',
        karma: {}, deed: 'mara_secret_kept', ending: '',
        note: 'You know something she doesn\'t know you know.' },
      { id: 'expose', label: 'Expose the letters', impact: 'dark',
        karma: { morality: -10 }, deed: 'mara_exposed', locks: ['mara_epilogue'], unlocks: ['ET3'], ending: '',
        note: 'Mara is cold forever + the town gossips; she is absent from the epilogue.' },
    ],
    dialogue: { start: 'intro', nodes: {
      // reactive greeting: warmer if you delivered the drowned letter (SA5)
      intro: { route: [
        { when: (c) => c.karma.hasDeed('drowned_letter'), to: 'warm' },
        { to: 'normal' } ] },
      warm: { speaker: 'Mara', text:
        "You... you brought my brother's letter back. All the way from the marsh. I'd long given up on " +
        "ever knowing what became of him. Whatever else you are now — I'll not forget that you did that.",
        options: [ { label: '(Notice the bundle of OTHER letters she\'s hidden.)', to: 'decide' } ] },
      normal: { speaker: 'Mara', text:
        "Back under my roof, grown and quiet. *she tucks a bundle of letters quickly out of sight, but " +
        "not quite quick enough* ...It's nothing. Old letters. Don't you go prying, now.",
        options: [ { label: '(Later, you find the hidden love-letters.)', to: 'decide' } ] },
      decide: { speaker: '', text:
        "Mara's love-letters, hidden for years — tender, secret, and not a little embarrassing. What do " +
        "you do with them?",
        options: [
          { label: '(Slip them back where they were.)', choice: { quest: 'SG4', id: 'return' }, end: true },
          { label: '(Read them; say nothing.)', choice: { quest: 'SG4', id: 'silent' }, end: true },
          { label: '(Read them aloud at the tavern.)', choice: { quest: 'SG4', id: 'expose' }, end: true },
        ] },
    } },
  },

  // SG5 — The Tankard Songs (fun/social). Learn rude tavern songs -> gestures +
  // charisma. Funny names, sparingly. Requires the adult return (M7).
  {
    id: 'SG5', title: 'The Tankard Songs', region: 'Greenhollow', act: 2,
    type: 'side', tone: 'funny', perm: false,
    requires: { quests: ['M7'] },
    reward: { gestures: true, rep: 'charisma' },
    steps: [
      { id: 'tavern', desc: 'Drink in the tavern; learn the rude songs from the regulars.' },
    ],
    choices: [
      { id: 'learn', label: 'Learn the rude tavern songs', impact: 'neutral',
        karma: {}, deed: 'tavern_songs', ending: '',
        note: 'Unlocks social gestures + a charisma rep bump.' },
    ],
    dialogue: { start: 'tavern', nodes: {
      tavern: { speaker: 'Wayne Kerr', text:
        "New blood! Right — you drink in MY corner, you learn the songs. This first one's a classic. " +
        "Don't ask what it's about; you'll work that out by the second verse.",
        options: [ { label: '(Pull up a stool.)', to: 'amanda' } ] },
      amanda: { speaker: 'Amanda Hugginkiss', text:
        "Oh, leave the poor thing be, Wayne. *to you* Don't mind him, love — come here and sing the rude " +
        "bits LOUD, that's the whole trick. Loud and shameless and you'll have the whole room.",
        options: [ { label: '(Sing, shamelessly.)', choice: { quest: 'SG5', id: 'learn' }, end: true } ] },
    } },
  },

  // SG7 — The Orchard Thief (morality fork). LOCKED OUT if you kicked the chicken
  // as a child (the kid distrusts you — honoring the SG7ally lock from M2).
  // Choice: cover (+M) / punish (-M) / recruit (+P). Requires the adult return.
  {
    id: 'SG7', title: 'The Orchard Thief', region: 'Greenhollow', act: 2,
    type: 'side', tone: 'morality', perm: false,
    requires: { quests: ['M7'], notDeeds: ['chicken_kicked'] }, // chicken-kicker => the kid won't trust you
    reward: {},
    steps: [
      { id: 'catch', desc: 'Catch the kid stealing apples from the orchard.' },
      { id: 'decide', desc: 'Punish / cover for them / recruit them.' },
    ],
    choices: [
      { id: 'cover', label: 'Cover for the kid', impact: 'good',
        karma: { morality: 10 }, deed: 'orchard_covered', unlocks: ['ally:kid'], ending: '',
        note: 'The kid becomes a loyal recurring ally.' },
      { id: 'punish', label: 'Punish the kid', impact: 'dark',
        karma: { morality: -10 }, deed: 'orchard_punished', locks: ['ally:kid'], ending: '',
        note: 'The kid becomes a recurring thief-enemy.' },
      { id: 'recruit', label: 'Recruit the kid', impact: 'neutral',
        karma: { purity: -5 }, deed: 'orchard_recruited', unlocks: ['ally:kid'], ending: '',
        note: 'Chaotic — a light-fingered but loyal little helper.' },
    ],
    dialogue: { start: 'catch', nodes: {
      catch: { speaker: '', text:
        "A skinny kid is up the biggest apple tree in the orchard, pockets bulging, and has just " +
        "realised you've spotted them. They freeze, half-hopeful, half-terrified.",
        options: [ { label: '(Decide what to do with the little thief.)', to: 'decide' } ] },
      decide: { speaker: 'Orchard Kid', text:
        "I— I weren't— okay I WERE, but me family's hungry, honest! You gonna grass me up?",
        options: [
          { label: "(Wave them off — never saw a thing.)", choice: { quest: 'SG7', id: 'cover' }, end: true },
          { label: '(Haul them to the orchard-keeper.)', choice: { quest: 'SG7', id: 'punish' }, end: true },
          { label: "(Grin — 'How'd you like a real job?')", choice: { quest: 'SG7', id: 'recruit' }, end: true },
        ] },
    } },
  },

  // GHUB — The Village Remembers (childhood-callback vignette). Reactive lines
  // keyed off the Act-1 seeds — proof the seeds pay off as adult beats.
  {
    id: 'GHUB', title: 'The Village Remembers', region: 'Greenhollow', act: 2,
    type: 'vignette', tone: 'reflective', perm: false,
    requires: { quests: ['M7'] },
    reward: {},
    steps: [ { id: 'walk', desc: 'Walk the rebuilt village; see how it remembers your childhood.' } ],
    choices: [
      { id: 'reconnect', label: 'Take in how the village remembers you', impact: 'neutral',
        karma: {}, deed: 'hub_reconnected', ending: '', note: 'The childhood seeds, paid off as adult beats.' },
    ],
    dialogue: { start: 'r_chicken', nodes: {
      r_chicken: { route: [
        { when: (c) => c.karma.hasDeed('chicken_kicked'), to: 'l_chicken' },
        { to: 'r_coin' } ] },
      l_chicken: { speaker: 'Henwife', text:
        "*she pointedly turns her basket of eggs away from you* Eggs are for them as never booted my " +
        "Henrietta's poor mam. We remember, round here. Move along.",
        options: [ { label: '(Walk on.)', to: 'r_coin' } ] },
      r_coin: { route: [
        { when: (c) => c.karma.hasDeed('coin_returned'), to: 'l_coin' },
        { to: 'r_cave' } ] },
      l_coin: { speaker: 'Phil McCracken', text:
        "The honest one, grown! You handed me back my whole purse when you were knee-high — friend's " +
        "price for you at my stall, today and always.",
        options: [ { label: '(Walk on.)', to: 'r_cave' } ] },
      r_cave: { route: [
        { when: (c) => c.karma.hasDeed('cave_lore'), to: 'l_cave' },
        { to: 'r_grief' } ] },
      l_cave: { speaker: '', text:
        "You catch yourself staring west, to where the boarded cave still gapes in the meadow's edge. " +
        "The flame that wept, scratched in the stone. You never did manage to forget it.",
        options: [ { label: '(Look away.)', to: 'r_grief' } ] },
      r_grief: { route: [
        { when: (c) => c.karma.hasDeed('grief_vengeance'), to: 'l_grief_v' },
        { when: (c) => c.karma.hasDeed('grief_vow'), to: 'l_grief_p' },
        { to: 'done' } ] },
      l_grief_v: { speaker: 'Villager', text:
        "*conversations hush as you pass; folk keep a careful, kindly distance — they have all seen the " +
        "cold edge the fire left on you*",
        options: [ { label: '(...)', to: 'done' } ] },
      l_grief_p: { speaker: 'Villager', text:
        "We say Bram's name soft when you're near. We know the vow you made over the ash that morning. " +
        "He'd be proud of the one who came back, love. We are.",
        options: [ { label: '(...)', to: 'done' } ] },
      done: { speaker: '', text:
        "Greenhollow remembers everything you ever did here — the small kindnesses and the small cruelties " +
        "alike. It always did.",
        options: [ { label: '(Take it all in.)', choice: { quest: 'GHUB', id: 'reconnect' }, end: true } ] },
    } },
  },

  // PH3 — Grandfather's Axe (continuity vs material identity). An heirloom dispute
  // you arbitrate; no right answer; a relationship/reputation deed with Hodge.
  {
    id: 'PH3', title: "Grandfather's Axe", region: 'Greenhollow', act: 2,
    type: 'side', tone: 'reflective', perm: false,
    requires: { quests: ['M7'] },
    reward: {},
    steps: [ { id: 'arbitrate', desc: "Settle whether Hodge's much-mended axe is still his grandfather's." } ],
    choices: [
      { id: 'same', label: "It's the same axe — the line, not the wood", impact: 'neutral',
        karma: {}, deed: 'axe_continuity', ending: '',
        note: 'You rule for continuity; Hodge keeps the heirloom and the meaning both.' },
      { id: 'new', label: "It's a different axe — nothing of the first remains", impact: 'neutral',
        karma: {}, deed: 'axe_material', ending: '',
        note: 'You rule for the plain material truth; the cousin is satisfied, Hodge a little wounded.' },
      { id: 'his', label: "It's his grandfather's because it matters to Hodge", impact: 'good',
        karma: { morality: 5 }, deed: 'axe_meaning', ending: '',
        note: 'You rule for what it means to the man holding it; Hodge will not forget the kindness.' },
    ],
    dialogue: { start: 'arbitrate', nodes: {
      arbitrate: { speaker: 'Hodge', text:
        "Settle this for us before I brain my cousin with the thing in question. THIS — *hefts a worn axe* " +
        "— is my grandfather's axe. The head's been replaced twice, mind, and the handle three times over " +
        "the years, but it's HIS, same as it ever was, and he taught me my trade at it.",
        options: [ { label: '(And the cousin?)', to: 'cousin' } ] },
      cousin: { speaker: 'Cousin Ruck', text:
        "Replaced twice and three times! There's not a SPLINTER of the old man's axe left in it — it's a " +
        "brand new axe with an old story glued on! You can't hand down a thing you've thrown away piece by " +
        "piece, Hodge! Go on, traveller, you've an honest face on you — whose axe is it, truly?",
        options: [
          { label: "(It's the same axe — a thing is its line, not its splinters.)", choice: { quest: 'PH3', id: 'same' }, end: true },
          { label: "(It's a new axe — none of the first is left in it.)", choice: { quest: 'PH3', id: 'new' }, end: true },
          { label: "(It's his grandfather's because his grandfather is in what it means to him.)", choice: { quest: 'PH3', id: 'his' }, end: true },
        ] },
    } },
  },

  // PH6 — Buridan's Mule (a beast paralysed between two identical choices). Comic;
  // small reward; the sly lesson that a clumsy choice beats perfect paralysis.
  {
    id: 'PH6', title: "Buridan's Mule", region: 'Greenhollow', act: 2,
    type: 'twist', tone: 'funny', perm: false,
    requires: { quests: ['M7'] },
    reward: { gold: 10 },
    steps: [ { id: 'mule', desc: "A carter's mule is starving between two identical hay piles." } ],
    choices: [
      { id: 'break', label: 'Break the tie — shove a pile / nudge the mule', impact: 'neutral',
        karma: {}, deed: 'mule_freed', ending: '',
        note: 'You make the two piles unequal; the daft beast eats. Any choice beat no choice.' },
    ],
    dialogue: { start: 'mule', nodes: {
      mule: { speaker: 'Seymour Butz', text:
        "*a flustered carter* Oi — you look like a soul who can make up their mind! MINE can't. The mule, " +
        "I mean. Two piles of hay, exact same size, exact same distance, and the daft creature just stands " +
        "DEAD BETWIXT 'em, head swinging from one to t'other, STARVING on a full larder. Do something afore " +
        "it drops, I'm begging you.",
        options: [ { label: '(Regard the agonised, perfectly-balanced mule.)', to: 'decide' } ] },
      decide: { speaker: '', text:
        "The mule's head swings left. Then right. Then left. It is, impossibly, getting thinner as you watch.",
        options: [
          { label: '(Shove one pile a foot closer.)', choice: { quest: 'PH6', id: 'break' }, to: 'done' },
          { label: '(Take a bite of one pile yourself — now they differ.)', choice: { quest: 'PH6', id: 'break' }, to: 'done' },
          { label: "(Wait — surely it'll decide on its own.)", to: 'wait' },
        ] },
      wait: { speaker: '', text:
        "It looks left. It looks right. It looks at YOU, with enormous reproach. It does nothing whatsoever. " +
        "It is now noticeably thinner. This could, genuinely, go on forever.",
        options: [ { label: '(All right, all right — DO something.)', to: 'decide' } ] },
      done: { speaker: 'Seymour Butz', text:
        "HAH — look at it GO! All it ever needed was someone to tip the scales a hair. *presses a few coins " +
        "on you* Funny, that. Daft little lesson, but maybe the only one worth a damn: a clumsy choice beats " +
        "a perfect dither, every single time. You'd do well to carry that, wherever it is you're bound.",
        options: [ { label: '(Pocket the coins, and the lesson.)', end: true } ] },
    } },
  },
];
