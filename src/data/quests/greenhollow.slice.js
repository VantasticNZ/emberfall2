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
];
