// =============================================================================
// GREENHOLLOW SLICE ARC — GH1–GH4 (THE-SLICE step 4; SPEC-QUESTS-M1-4.md +
// LORE-CANON.md, Van-approved). The four PLAYABLE vertical-slice quests, as DATA
// on the QuestEngine. SEPARATE ids from the childhood M1–M6 spine (Decision A:
// the M-spine is untouched). Deeds reuse the canonical SSOT (forced_entry,
// entered_uninvited, comforted_child, cave_lore) + the 9 new GH-arc deeds.
//
// Tone (LORE-CANON §6): warm village life over slow dread; humour in the PEOPLE,
// weight in the WORLD; light NZ accent (not costume). Dialogue runs through the
// data-driven Dialogue system; a terminal `choice:{quest,id}` fires the fork
// (karma+deed+unlocks, exactly once) via the engine.
// =============================================================================

export const GREENHOLLOW_SLICE = [
  // ---------------------------------------------------------------------------
  // GH1 — Cold Hearth (the fetch loop + the first moral fork). Mara's kept flame
  // went out in the night; fetch fuel — but one load, two cold hearths.
  // ---------------------------------------------------------------------------
  {
    id: 'GH1', title: 'Cold Hearth', region: 'Greenhollow', act: 2,
    type: 'main', tone: 'wholesome', perm: true,
    unlocks: ['GH2'],
    reward: { gold: 8 },
    steps: [
      { id: 'hear', desc: "Mara's hearth went out — fetch her some fuel." },
      { id: 'fetch', desc: 'Find fuel — the store\'s empty; try Hodge or the brook.' },
      { id: 'fork', desc: 'Two cold hearths, one load of fuel. Choose who to warm.' },
      { id: 'relight', desc: 'Re-light the hearth.' },
    ],
    choices: [
      { id: 'share', label: 'Give the fuel to the shivering family', impact: 'good',
        karma: { morality: 10, purity: 10 }, deed: 'hearth_shared',
        note: 'You re-light Mara\'s cold-handed later; the family never forgets (they\'re Maren\'s — GH2).' },
      { id: 'job', label: 'Keep it for the job you were asked', impact: 'neutral',
        karma: {}, deed: 'hearth_hoarded',
        note: 'You did what was asked. The family stays cold; they remember that too.' },
      { id: 'take', label: "Take the family's last kindling as well", impact: 'dark',
        karma: { morality: -15, purity: -10 }, deed: 'hearth_hoarded',
        note: 'A cold thing to do in a warm village. The green goes quiet when you pass.' },
    ],
    dialogue: { start: 'hear', nodes: {
      hear: { speaker: 'Mara', text:
        "Oh, love — my hearth's gone clean out in the night. First time in years. A cold hearth, in " +
        "THIS village! Be a dear and fetch me a bit of fuel before the whole place starts talking?",
        options: [ { label: "Course, Mara. Where from?", to: 'where' } ] },
      where: { speaker: 'Mara', text:
        "Store's cleaned out, McCracken says — try Hodge, he keeps good coal for the forge, or there's " +
        "deadfall down the brook if you've the legs. Go on, you're a good one.",
        options: [ { label: '(Go and fetch the fuel.)', to: 'hodge' } ] },
      hodge: { speaker: 'Hodge', text:
        "*the smith eyes the empty coal-scuttle you're holding* ...For Mara's hearth? Aye, take a load. " +
        "Costs me an hour at the anvil, but a cold hearth's a cold hearth. Go on with you.",
        options: [ { label: '(Take the coal and head back.)', to: 'fork' } ] },
      // THE FORK — on the way back, a family on the green has a dead grate too.
      fork: { speaker: '', text:
        "Crossing the green, you near stumble over them: a parent and a small one huddled by a dead " +
        "grate, breath smoking in the cold. No fuel, no fire — and your one load of coal in your arms. " +
        "Mara's hearth, or theirs?",
        options: [
          { label: "Here — take it. You need it more than a baker's oven.", choice: { quest: 'GH1', id: 'share' }, to: 'out_share' },
          { label: '(Hurry past — Mara asked first.)', choice: { quest: 'GH1', id: 'job' }, to: 'out_job' },
          { label: "(Take their kindling too — waste not.)", choice: { quest: 'GH1', id: 'take' }, to: 'out_take' },
        ] },
      out_share: { speaker: '', text:
        "The little one's hands close round the coal like it's gold. \"...Bless you,\" the parent " +
        "manages. You'll re-light Mara's with brook-deadfall and cold fingers — and you'll not regret it. " +
        "Good as gold, you.",
        options: [ { label: '(Head back to Mara.)', end: true } ] },
      out_job: { speaker: '', text:
        "You keep walking. A job's a job. Behind you the grate stays dark, and you feel the family's " +
        "eyes the whole way to Mara's door.",
        options: [ { label: '(Re-light Mara\'s hearth.)', end: true } ] },
      out_take: { speaker: '', text:
        "You scoop up their last sticks of kindling on top of your load. The parent says nothing. The " +
        "child watches you go. The green is very quiet behind you.",
        options: [ { label: '(Re-light Mara\'s hearth.)', end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // GH2 — Nobody Answered (multi-route objective + a soft illness). Old Maren
  // hasn't answered in two days; the kids are scared. Get in (KEY or BREAK —
  // reuses the door-system deeds), find her ill, fetch the marsh-fringe remedy.
  // ---------------------------------------------------------------------------
  {
    id: 'GH2', title: 'Nobody Answered', region: 'Greenhollow', act: 2,
    type: 'main', tone: 'warm-worried', perm: true,
    unlocks: ['GH3'],
    reward: { gold: 6, item: 'minor_potion' },
    steps: [
      { id: 'worry', desc: "The kids say Maren hasn't answered in two days. Check on her." },
      { id: 'enter', desc: "Get into Maren's — find a key, or force the door." },
      { id: 'find', desc: 'Maren is gravely ill. Ask Edda what she needs.' },
      { id: 'remedy', desc: 'Fetch fenwort from the marsh fringe; bring it to Edda.' },
      { id: 'cure', desc: 'Give Maren the draught.' },
    ],
    choices: [
      { id: 'gentle', label: 'Use the spare key the kids know about', impact: 'good',
        karma: { purity: 5 },
        note: 'A kind welfare entry — the door stays whole.' },
      { id: 'break', label: 'Break the door down', impact: 'dark',
        karma: { morality: -8, purity: -6 }, deed: 'forced_entry',
        note: "You smashed a sick woman's door — the village notes it; the joiner comes to mend it (remembered in GH4)." },
      { id: 'comfort', label: 'Kneel and comfort the frightened kids', impact: 'good',
        karma: { morality: 10 }, deed: 'comforted_child',
        note: 'A small kindness in a scary hour — the kids never forget who knelt down.' },
      { id: 'healed', label: 'Maren takes the draught and recovers', impact: 'good',
        karma: {}, deed: 'maren_healed',
        note: 'The cure works (soft per Decision F — she always pulls through in the slice).' },
    ],
    dialogue: { start: 'worry', nodes: {
      worry: { speaker: 'Tam', text:
        "She always answers. ALWAYS. Maren's not opened her door in two days and her chimney's been " +
        "stone cold since Tuesday. *Nettle's bottom lip is going* ...Will you look? Please?",
        options: [ { label: "Course I will. Stay close, you lot.", to: 'greet_react' } ] },
      // reactive: the kids (Maren's household = the GH1 family) remember the hearth choice
      greet_react: { route: [
        { when: (c) => c.karma.hasDeed('hearth_shared'), to: 'greet_warm' },
        { when: (c) => c.karma.hasDeed('hearth_hoarded'), to: 'greet_cool' },
        { to: 'door' } ] },
      greet_warm: { speaker: 'Nettle', text:
        "*sniffling* You're the one who gave us the coal on the green! Gran said you'd come. She SAID.",
        options: [ { label: '(Go to Maren\'s door.)', to: 'door' } ] },
      greet_cool: { speaker: 'Nettle', text:
        "*won't quite look at you* ...Mum said you walked past us in the cold once. But there's no one " +
        "else. Will you still help Gran?",
        options: [ { label: '(Go to Maren\'s door.)', to: 'door' } ] },
      door: { speaker: '', text:
        "Maren's door is shut fast, the curtains drawn. You knock — once, twice. Nothing but the wind. " +
        "The kids huddle behind you, breath held.",
        options: [
          { label: "(The kids know where she hides the spare key — fetch it.)", choice: { quest: 'GH2', id: 'gentle' }, to: 'inside' },
          { label: '(Put your shoulder to it — BREAK it down.)', choice: { quest: 'GH2', id: 'break' }, to: 'inside_break' },
        ] },
      inside_break: { speaker: '', text:
        "The frame splinters and the door bangs open. The kids flinch hard at the crack of it. (Someone " +
        "will have to mend that — and the village will hear how it got broke.)",
        options: [ { label: '(Step inside.)', to: 'inside' } ] },
      inside: { speaker: 'Maren', text:
        "*a thin, fevered voice from the cot* ...Who's there? ...Is that the little ones? I couldn't get " +
        "to the door, lamb, I'm so sorry, I couldn't get up... *she's burning up*",
        options: [
          { label: '(Kneel and steady the frightened kids first.)', choice: { quest: 'GH2', id: 'comfort' }, to: 'edda' },
          { label: '(Straight to it — what does she need?)', to: 'edda' },
        ] },
      edda: { speaker: 'Old Edda', text:
        "*the herb-wife's already shouldering in* Fever's got deep in her. Fenwort — only thing for it. " +
        "Grows at the marsh's EDGE, mind, just the fringe; you don't go IN that bog. Quick now, while " +
        "she's still got fight in her.",
        options: [ { label: '(Go to the marsh fringe for fenwort.)', to: 'fetch' } ] },
      fetch: { speaker: '', text:
        "The west path runs down to where the green grass goes grey and the ground turns to suck and " +
        "reed — the Ashen Marsh, looming and quiet beyond. You don't go in. At the very fringe, a clump " +
        "of pale fenwort. You pick a good handful and run it back.",
        options: [ { label: '(Bring it to Edda.)', to: 'brew' } ] },
      brew: { speaker: 'Old Edda', text:
        "Good. Good — and you kept your boots out of the bog, sensible. *she crushes the fenwort into a " +
        "steaming cup* Here. Get this into her, sip by sip. ...There's a girl, Maren. There's a girl.",
        options: [ { label: '(Give Maren the draught.)', to: 'cure' } ] },
      cure: { speaker: 'Maren', text:
        "*colour creeping back, breath easing* ...Oh. Oh, that's better. That's much better. *her eyes " +
        "find you* ...Was that you at my door, love? The little ones said you'd come. ...Bless you. " +
        "However you got in — bless you.",
        options: [ { label: '(Leave her to rest. The kids can breathe again.)', choice: { quest: 'GH2', id: 'healed' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // GH3 — Teeth in the Orchard (the cut ability + FIRST COMBAT + a lore hook).
  // The billhook GRANTS the cut flag (tool_billhook); the den is the slice's
  // first fight (the live spawned encounter lands with THE-SLICE step 5, which
  // this quest scaffolds); the sealed letter seeds the Marsh thread.
  // ---------------------------------------------------------------------------
  {
    id: 'GH3', title: 'Teeth in the Orchard', region: 'Greenhollow', act: 2,
    type: 'main', tone: 'warm-then-danger', perm: true,
    unlocks: ['GH4'],
    reward: { gold: 12 },
    steps: [
      { id: 'report', desc: "Something's denned in the orchard's bramble-choked back rows." },
      { id: 'cut', desc: 'Get a billhook and cut through the bramble-choke.' },
      { id: 'den', desc: 'Clear the den.' },
      { id: 'letter', desc: 'Search the den.' },
      { id: 'reportback', desc: "Tell Bracken the orchard's safe." },
    ],
    choices: [
      { id: 'mercy', label: 'Spare the litter cowering at the back', impact: 'good',
        karma: { morality: 10 }, deed: 'mercy_shown',
        note: 'You drive the den off but spare the young — a kindness even to teeth.' },
      { id: 'cull', label: 'Put every last one of them down', impact: 'neutral',
        karma: {}, deed: 'orchard_cleared',
        note: 'The orchard is safe. Thorough work.' },
      { id: 'letter_keep', label: 'Pocket the sealed letter', impact: 'neutral',
        karma: {}, deed: 'orchard_letter',
        note: "A water-stained letter, sealed with a mark you don't know — addressed west. (Marsh thread.)" },
    ],
    dialogue: { start: 'report', nodes: {
      report: { speaker: 'Bracken', text:
        "Forty years I've kept this orchard and I've never— *teeth*, in the BARK. Ewes won't go near " +
        "the back rows, and they're thorn-choked solid; I can't get a billhook's swing in there without " +
        "losing a hand. ...But a young pair of hands, now.",
        options: [ { label: "Give me the billhook. I'll go in.", to: 'billhook' } ] },
      billhook: { speaker: 'Bracken', text:
        "*hefts a worn billhook off the wall and presses it on you* Mind the edge — she clears bramble " +
        "AND worse. Cut your way to the den. And... come back, eh? I've buried better than you for less.",
        options: [ { label: '(Take the billhook and cut into the brambles.)', deed: 'tool_billhook', to: 'cut' } ] },
      cut: { speaker: '', text:
        "The billhook bites through the bramble-choke in long, satisfying sweeps — the first thing you've " +
        "had that says CUT and means it. The thorns part. Beyond them, a hollow of torn earth and bone, " +
        "and low in the dark, the gleam of small eyes. Several of them. They come at you.",
        options: [ { label: '(Fight.)', to: 'den' } ] },
      // FIRST COMBAT — the den. (The LIVE spawned fight lands with step-5 combat-feel; the quest scaffolds
      // the encounter + the mercy fork. For now the beat resolves the fight + offers the moral choice.)
      den: { speaker: '', text:
        "Quick, snapping things — orchard-teeth, all hunger and no sense. You learn their rhythm: the " +
        "tell before they lunge, the beat to strike, the roll when they swarm. One by one they break and " +
        "scatter — until only a litter of pups is left, cornered and shaking at the back of the den.",
        options: [
          { label: '(Let the pups go — they\'re no threat now.)', choice: { quest: 'GH3', id: 'mercy' }, to: 'letter' },
          { label: '(Finish it. All of them.)', choice: { quest: 'GH3', id: 'cull' }, to: 'letter' },
        ] },
      letter: { speaker: '', text:
        "Half-buried in the den's leaf-litter: a traveller's satchel, long abandoned. Inside, wrapped in " +
        "oilcloth, a LETTER — water-stained, still sealed, the wax pressed with a mark you've never seen. " +
        "On the front, in a careful hand: a name, and one word — WEST.",
        options: [
          { label: '(Pocket the sealed letter.)', choice: { quest: 'GH3', id: 'letter_keep' }, to: 'reportback' },
          { label: "(Leave it — give it to Bracken to pass on.)", to: 'reportback' },
        ] },
      reportback: { speaker: 'Bracken', text:
        "*looks you over for missing pieces, finds none* ...You went IN there. And walked back out. " +
        "*lets out a breath he's held forty years* Good as gold, you. The orchard's yours to walk, any " +
        "hour. ...And whatever you found in that pit — that's a worry for another day.",
        options: [ { label: "(Head back to the village.)", end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // GH4 — The Boarded Cave (the lore payoff + moral fork #2 + the property
  // unlock). With the village steadied (GH1–GH3), the acolyte relents; below
  // lies the DEAD EMBER-SHRINE (LORE-CANON §4). Fire-responds-to-purity: the
  // carving reads your heart (route on purity). Completing it makes you
  // Greenhollow's own — the house becomes buyable (greenhollow_house gates on
  // the cave_lore deed). Boards gated on GH1–GH3 (Decision E).
  // ---------------------------------------------------------------------------
  {
    id: 'GH4', title: 'The Boarded Cave', region: 'Greenhollow', act: 2,
    type: 'main', tone: 'mystery/weight', perm: true,
    requires: { quests: ['GH1', 'GH2', 'GH3'] },
    reward: { item: 'wooden_toy' },   // a rubbing of the weeping-flame carving (a keepsake; reuses the toy slot)
    steps: [
      { id: 'earn', desc: "You've earned the right to open the boarded cave." },
      { id: 'descend', desc: 'Open the cave and go down.' },
      { id: 'shrine', desc: 'Something is down here. Look.' },
      { id: 'fork', desc: 'Decide what to do with what you found.' },
      { id: 'home', desc: 'Return to Greenhollow.' },
    ],
    choices: [
      { id: 'tell', label: 'Tell the acolyte the shrine grieves', impact: 'good',
        karma: { purity: 10 }, deed: 'shrine_told',
        note: 'The honest path. It unsettles the warmth — the acolyte is shaken — but the truth is shared.' },
      { id: 'keep', label: 'Keep it to yourself — protect the warmth', impact: 'neutral',
        karma: {}, deed: 'shrine_kept',
        note: "You carry the village's oldest secret alone. A quietly heavier road." },
      { id: 'desecrate', label: 'Pry the carving loose and take it', impact: 'dark',
        karma: { morality: -10, purity: -15 }, deed: 'shrine_looted',
        note: 'You loot a grieving shrine. The cold reads you, and weeps darker. A corrupt seed.' },
    ],
    dialogue: { start: 'earn', nodes: {
      earn: { speaker: 'Acolyte', text:
        "The boards stay up. Tradition. ...But you've mended this village's hearth, its sick, its orchard. " +
        "If anyone's earned a look beneath it, it's you. *unhooks a lantern, hands it over, won't follow* " +
        "The Flame keep you. ...You may wish it had.",
        options: [ { label: '(Pry the boards and go down.)', to: 'descend' } ] },
      descend: { speaker: '', text:
        "The plank that's hung loose since you were small gives easy. Cold air climbs to meet you, far " +
        "too still. You go down, and down, beneath the chapel's quiet hum — into a chamber no festival " +
        "ever reached.",
        options: [ { label: '(Raise the lantern.)', to: 'shrine_read' } ] },
      // FIRE-RESPONDS-TO-PURITY — the dead shrine reads your heart (LORE-CANON §5).
      shrine_read: { route: [
        { when: (c) => c.karma.get('purity') >= 20, to: 'shrine_pure' },
        { when: (c) => c.karma.get('purity') <= -20, to: 'shrine_corrupt' },
        { to: 'shrine_cold' } ] },
      shrine_pure: { speaker: '', text:
        "An old ember-shrine — a seat of binding, long dead. Scratched deep into cold stone: a flame, " +
        "WEEPING, tears running down the rock. As you near, the dead carving catches the lantern and " +
        "glows faint and gold, the way a warm hand is met — as if it knows your heart, and is glad of it.",
        options: [ { label: '(Take it in.)', to: 'fork' } ] },
      shrine_corrupt: { speaker: '', text:
        "An old ember-shrine — a seat of binding, long dead. A flame is scratched deep into the cold " +
        "stone: WEEPING. As you near, the carving's tears seem to run darker, the cold pressing close " +
        "and unwelcoming — as if it reads what's in you, and recoils.",
        options: [ { label: '(Take it in.)', to: 'fork' } ] },
      shrine_cold: { speaker: '', text:
        "An old ember-shrine — a seat of binding, long dead. Scratched deep into the cold stone: a flame, " +
        "WEEPING, tears running down the rock. Far above, the chapel's ward hums on, keeping this asleep. " +
        "You don't have all of it. You have enough to know the warm story isn't the whole story.",
        options: [ { label: '(Decide what to do.)', to: 'fork' } ] },
      // cave_lore fires on the way INTO the fork (you SAW it — every path); then the moral fork.
      fork: { speaker: '', text:
        "A flame that grieves, sealed beneath a village that sings to fire every festival. What do you " +
        "do with a thing like that?",
        options: [
          { label: 'Tell the acolyte — the village deserves the truth.', deed: 'cave_lore', choice: { quest: 'GH4', id: 'tell' }, to: 'out_tell' },
          { label: '(Say nothing. Some warmth is worth protecting.)', deed: 'cave_lore', choice: { quest: 'GH4', id: 'keep' }, to: 'out_keep' },
          { label: '(Pry the weeping carving loose and pocket it.)', deed: 'cave_lore', choice: { quest: 'GH4', id: 'desecrate' }, to: 'out_loot' },
        ] },
      out_tell: { speaker: 'Acolyte', text:
        "*goes very still as you tell it* ...Weeping. The Flame, weeping. *a long silence* ...I tend a " +
        "ward I was never told the meaning of. I'll keep tending it. But I'll never hear the festival " +
        "songs the same way again. ...Thank you. I think.",
        options: [ { label: '(Step back into the sun.)', to: 'home' } ] },
      out_keep: { speaker: '', text:
        "You climb back into the warm noise of the village and you say nothing. The kids wave; Mara calls " +
        "you for bread; the festival bunting's already going up. You smile, and you let them have it — " +
        "the whole warm lie of it — and you carry the cold part alone.",
        options: [ { label: '(Carry it.)', to: 'home' } ] },
      out_loot: { speaker: '', text:
        "The carving comes away from the stone with a sound like a held breath let go. The cold deepens, " +
        "and for just a moment the weeping seems to run faster down the bare rock you've left behind. You " +
        "pocket your prize and climb toward the warmth you've taken something from.",
        options: [ { label: '(Leave the shrine bared.)', to: 'home' } ] },
      home: { speaker: '', text:
        "Greenhollow is whole again — hearth lit, the sick well, the orchard quiet — and the village knows " +
        "your face now as one of its own. You've a place here, if you want it: there are houses for sale, " +
        "and Greenhollow would be glad to call you neighbour.",
        options: [ { label: '(You belong here now.)', end: true } ] },
    } },
  },
];
