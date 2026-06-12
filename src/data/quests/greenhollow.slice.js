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
];
