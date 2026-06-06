// =============================================================================
// EMBERWOOD — SIDE QUESTS (SE1-SE5), authored as DATA on the QuestEngine. The
// elemental war (+ the 4th Pem clue), the HEAVY no-win settlement, lantern-of-
// the-elements loot, the quietly devastating Weeping Tree, and a bounty.
//
// GATE D for all: objectives are SPREAD through the warring wood (the burn-line,
// the freeze-line, the deep grove, the ridges). The heavy beats (SE2, SE4) are
// written to LAND, not just function. Canonical deed-ids so the epilogue (ET4),
// the secret/Liberator nudge (ET11), and the Pem hunt all read the same memory.
// =============================================================================

export const EMBERWOOD_SIDE = [
  // SE1 — Fire and Frost (story). The elemental war = the god's fever; supports
  // the M16 truth; drops pem_clue_emberwood — the 4TH clue, completing the set.
  {
    id: 'SE1', title: 'Fire and Frost', region: 'Emberwood', act: 2,
    type: 'side', tone: 'mystery', perm: false,
    requires: { quests: ['M15'] },
    reward: { lore: 'gods_fever', key: 'elemental' },
    steps: [
      { id: 'burn', desc: 'Walk the burn-line and the freeze-line; read what the war is.' },
      { id: 'understand', desc: 'Understand: the elemental war is the god\'s fever.' },
    ],
    choices: [
      { id: 'study', label: 'Read the war of fire and frost', impact: 'neutral',
        karma: {}, deed: 'fire_frost_lore', ending: '',
        note: 'Confirms the wood\'s madness is the bound god\'s fever (supports M16).' },
    ],
    dialogue: { start: 'burn', nodes: {
      burn: { speaker: '', text:
        "You walk the seam where fire meets frost — and see it isn't two forces fighting, but one thing " +
        "shaking: heat and cold pouring off the same wound by turns, the way a fever burns then chills " +
        "the same body. The wood isn't at war. The wood is SICK.",
        options: [ { label: '(Follow the seam to its source.)', to: 'pem' } ] },
      pem: { speaker: '', text:
        "Carved into a tree that is burning and freezing at once, in that same maddening crude hand: " +
        "'PEM WOZ ERE — too hot, too cold, no soup.' Even here. You note it, the last of four such marks " +
        "you've found across the whole land.",
        options: [ { label: '(Note the final Pem clue; read the fever.)', deed: 'pem_clue_emberwood', meta: { hunt: 'pem' }, to: 'understand' } ] },
      understand: { speaker: '', text:
        "There is no doubting it now: the elemental fever IS the bound god, and the land sickens exactly " +
        "as it sickens. Everything Hagga said, written in ash and frost.",
        options: [ { label: '(Take the lore.)', choice: { quest: 'SE1', id: 'study' }, end: true } ] },
    } },
  },

  // SE2 — The Caught Settlement [HEAVY]. You can save ONE half; the other is
  // lost and remembered in the epilogue (ET4). A real, hard loss — no "both".
  {
    id: 'SE2', title: 'The Caught Settlement', region: 'Emberwood', act: 2,
    type: 'side', tone: 'heavy', perm: true,
    reward: { coda: 'which_half_survives' },
    steps: [
      { id: 'both', desc: 'Both halves of the settlement are dying at once — you cannot reach both in time.' },
      { id: 'choose', desc: 'Save the burning half OR the freezing half. Only one.' },
    ],
    choices: [
      { id: 'save_burning', label: 'Save the burning half', impact: 'good',
        karma: { morality: 10 }, deed: 'saved_burning', meta: { lost: 'freezing' }, unlocks: ['ET4'], ending: '',
        note: 'You pull them from the fire; the freezing half is still and white by the time you turn around.' },
      { id: 'save_freezing', label: 'Save the freezing half', impact: 'good',
        karma: { morality: 10 }, deed: 'saved_freezing', meta: { lost: 'burning' }, unlocks: ['ET4'], ending: '',
        note: 'You thaw them back to breathing; the burning half is ash and silence behind you.' },
    ],
    dialogue: { start: 'both', nodes: {
      both: { speaker: 'Settler', text:
        "*grabbing your arm, frantic* You can fight, you can carry — thank the Flame. But you have to " +
        "CHOOSE, right now: the east row's burning with my sister's children in it, and the west row's " +
        "freezing solid with the old folk and the winter stores. They're both dying and they're at " +
        "opposite ends and there's only ONE of you. I'm sorry. I'm so sorry. Which?",
        options: [ { label: '(There is no saving both. Choose.)', to: 'choose' } ] },
      choose: { speaker: '', text:
        "Two directions. Two sets of voices calling. The wood does not pause to let you think; the heat " +
        "and the cold press in, and every second you stand here, both rows get worse. You can only run " +
        "one way.",
        options: [
          { label: '(Run east — the burning half, the children.)', choice: { quest: 'SE2', id: 'save_burning' }, end: true },
          { label: '(Run west — the freezing half, the old and the stores.)', choice: { quest: 'SE2', id: 'save_freezing' }, end: true },
        ] },
    } },
  },

  // SE3 — Ashen Relics (fun/loot). FIRE/FROST-gated elemental puzzle treasure.
  {
    id: 'SE3', title: 'Ashen Relics', region: 'Emberwood', act: 2,
    type: 'side', tone: 'fun', perm: false,
    requires: { deeds: ['tool_firefrost'] },   // needs fire/frost from M16
    reward: { items: ['emberfrost_band'], gold: 240 },
    steps: [
      { id: 'puzzle', desc: 'Burn + freeze the elemental locks to the relic vault.' },
    ],
    choices: [
      { id: 'loot', label: 'Solve the elemental vault', impact: 'neutral',
        karma: {}, deed: 'ashen_relics_looted', ending: '',
        note: 'Fire/frost puzzle treasure; the Emberfrost Band.' },
    ],
    dialogue: { start: 'puzzle', nodes: {
      puzzle: { speaker: '', text:
        "An old relic-vault sealed by the elements themselves: ice locks that only fire opens, fire locks " +
        "that only ice quenches, in a sequence that would have stumped you an hour ago. Now you read it " +
        "like a sentence, and the vault gives up the Emberfrost Band.",
        options: [ { label: '(Take the relics.)', choice: { quest: 'SE3', id: 'loot' }, end: true } ] },
    } },
  },

  // SE4 — The Weeping Tree [HEARTFELT]. Written with restraint: a quiet gut-
  // punch that deepens M16. Compassion -> +P; nudges Liberator/secret. ET11.
  {
    id: 'SE4', title: 'The Weeping Tree', region: 'Emberwood', act: 2,
    type: 'side', tone: 'heartfelt', perm: false,
    reward: { lore: 'gods_pain' },
    steps: [
      { id: 'find', desc: 'Find the tree weeping embers in the deep grove.' },
      { id: 'witness', desc: 'Stay with it a while.' },
    ],
    choices: [
      { id: 'witness', label: 'Witness the god\'s pain', impact: 'good',
        karma: { purity: 10 }, deed: 'weeping_tree', unlocks: ['ET11'], ending: 'L-hint',
        note: 'A fragment of the god\'s grief; quiet compassion that nudges the Liberator/secret path.' },
    ],
    dialogue: { start: 'find', nodes: {
      find: { speaker: '', text:
        "Deep in the grove, past the war, a single tree stands untouched by fire or frost. It is weeping " +
        "— slow embers welling from a split in the bark and falling, one by one, to hiss out in the moss. " +
        "It makes no sound. It has clearly been doing this for a very long time.",
        options: [ { label: '(Go closer.)', to: 'witness' } ] },
      witness: { speaker: '', text:
        "You put your hand on the bark. It is warm, like a forehead. There are no words in it — just a " +
        "small, worn-out feeling, the kind a child has when it has cried so long it has forgotten what it " +
        "was crying about and only knows it still hurts. A fragment of the god, snagged here, weeping by " +
        "itself where no one ever comes. You stay until the last ember falls. It is not much. But no one " +
        "else ever did.",
        options: [ { label: '(Stay. Just stay.)', choice: { quest: 'SE4', id: 'witness' }, end: true } ] },
    } },
  },

  // SE5 — Bounty: Cinder Stag (job/loot). A hunt across the burning ridges.
  {
    id: 'SE5', title: 'Bounty: Cinder Stag', region: 'Emberwood', act: 2,
    type: 'job', tone: 'tense', perm: false,
    requires: { quests: ['M15'] },
    reward: { items: ['cinderhide_cloak'], gold: 280 },
    steps: [
      { id: 'hunt', desc: 'Track the Cinder Stag across the burning ridges.' },
    ],
    choices: [
      { id: 'slay', label: 'Bring down the Cinder Stag', impact: 'neutral',
        karma: {}, deed: 'cinder_stag_slain', ending: '',
        note: 'A fast, fiery hunt; the Cinderhide Cloak (fire resist) as reward.' },
    ],
    dialogue: { start: 'board', nodes: {
      board: { speaker: 'Bounty-Master', text:
        "The Cinder Stag runs the burning ridges — antlers like a wildfire, fast as rumour, sets the dry " +
        "wood alight where it passes. Bring it down before it torches what's left of the green, and the " +
        "Cinderhide Cloak is yours.",
        options: [ { label: '(Run it down across the ridges.)', to: 'hunt' } ] },
      hunt: { speaker: '', text:
        "It leads you a burning chase across three ridges before you bring it down at the cliff edge, the " +
        "fire going out of its antlers as it falls. You take the hide that no flame can touch.",
        options: [ { label: '(Claim the Cinderhide Cloak.)', choice: { quest: 'SE5', id: 'slay' }, end: true } ] },
    } },
  },
];
