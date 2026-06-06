// =============================================================================
// EMBERWOOD — ACT 2, REGION 4 (the god's fever; the emotional core before the
// endgame). Authored as DATA on the QuestEngine. M15 arrival (the burning/
// freezing settlement, the wood at war with itself) and M16 Ember Hollow — the
// FIRE/FROST tool + Shard #4 + PERMANENT DECISION 2 (mercy / seize / take), the
// choice that most weights the Liberator vs Tyrant endings. Then M17 (Spire stub).
//
// Canonical flags: tool_firefrost, shard_4 (4/5). NOTE the mercy path records
// BOTH `god_mercy` (this quest's id) AND `mercy_shown` (the id the Karma
// ending-gates already read) — a content-layer bridge, no engine change.
// =============================================================================

export const EMBERWOOD = [
  // ---------------------------------------------------------------------------
  // M15 — The Emberwood (arrival; the caught settlement; the wood's fever).
  // Begins the E2 dilemma; opens M16 + the heavy side quests SE2/SE4.
  // ---------------------------------------------------------------------------
  {
    id: 'M15', title: 'The Emberwood', region: 'Emberwood', act: 2,
    type: 'main', tone: 'magical/dangerous', perm: false,
    unlocks: ['M16', 'SE2', 'SE4'],
    reward: { hub: 'Emberwood' },
    steps: [
      { id: 'road', desc: 'Take the south road — leaves turn to ash on one hand, frost on the other.' },
      { id: 'settlement', desc: 'Reach the settlement caught between a burning half and a freezing half.' },
      { id: 'heart', desc: 'The way to the wood\'s heart needs fire and frost.' },
    ],
    choices: [
      { id: 'enter', label: 'Enter the warring wood', impact: 'neutral',
        karma: {}, deed: 'emberwood_reached', ending: '',
        note: 'The god\'s fever made manifest — fire and frost tearing the wood apart.' },
    ],
    dialogue: { start: 'road', nodes: {
      road: { speaker: '', text:
        "South of the coast the road forks into a single wood gone mad: on the left hand every leaf is " +
        "ash and the air shimmers with heat; on the right, the same trees stand white with killing frost. " +
        "Down the middle, a thread of normal green, narrowing.",
        options: [ { label: '(Follow the green thread in.)', to: 'settlement' } ] },
      settlement: { speaker: 'Settler', text:
        "*soot down one cheek, frost-burn up the other arm* You picked a poor week to visit, traveller. " +
        "Half our homes are burning and the other half are freezing solid, and the wood does it on " +
        "PURPOSE, I'd swear — like it's running a fever and we're the sweat. If you're going to the " +
        "heart, you'll need to master both, fire and frost, or it'll cook and freeze you by turns.",
        options: [ { label: '(Press toward the heart — Ember Hollow.)', choice: { quest: 'M15', id: 'enter' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M16 — Ember Hollow (DUNGEON) [PERMANENT DECISION 2]. Earn FIRE/FROST
  // (tool_firefrost + spells), elemental puzzles + boss, claim SHARD #4
  // (shard_4), and at the shard feel the god's AGONY directly — then the
  // permanent choice: MERCY (+P; god_mercy + mercy_shown; gates Liberator/
  // secret) / SEIZE (-P; god_seized; LOCKS Liberator, gates Tyrant) / TAKE
  // (neutral; god_taken). perm: true.
  // ---------------------------------------------------------------------------
  {
    id: 'M16', title: 'Ember Hollow', region: 'Emberwood', act: 2,
    type: 'dungeon', tone: 'heartfelt/horror', perm: true,
    unlocks: ['M17'],
    reward: { tool: 'firefrost', spells: ['emberbolt', 'frost_shard'], shard: 4, items: ['firefrost'], heart: 1 },
    steps: [
      { id: 'enter', desc: 'Enter Ember Hollow, where the wood\'s fever burns hottest and coldest.' },
      { id: 'firefrost', desc: 'Earn FIRE/FROST (burn + freeze gates; Emberbolt + Frost Shard).' },
      { id: 'puzzle', desc: 'Elemental puzzles — burn the frozen, freeze the burning.' },
      { id: 'boss', desc: 'The Feverheart: it alternates fire and frost — and twists mid-fight.' },
      { id: 'agony', desc: 'At the shard, feel the bound god\'s agony directly.' },
      { id: 'decide', desc: 'PERMANENT: mercy / seize its power / take the shard plainly.' },
    ],
    choices: [
      { id: 'mercy', label: 'Show MERCY to the god-fragment', impact: 'good',
        karma: { purity: 10 }, deed: 'god_mercy', unlocks: ['L-path'], ending: 'L',
        note: 'You ease its agony though it costs you strength; opens the Liberator + secret paths.' },
      { id: 'seize', label: 'SEIZE its power', impact: 'dark',
        karma: { purity: -10 }, deed: 'god_seized', locks: ['L-path'], unlocks: ['T-path'], ending: 'T',
        note: 'Dark power, now — but you become part of its torment; LOCKS the Liberator path.' },
      { id: 'take', label: 'TAKE the shard plainly', impact: 'neutral',
        karma: {}, deed: 'god_taken', ending: '',
        note: 'You harden yourself and just take it; neither mercy nor cruelty.' },
    ],
    dialogue: { start: 'enter', nodes: {
      enter: { speaker: '', text:
        "Ember Hollow is the wood's wound — a clearing where fire and frost meet and tear at each other " +
        "without end, and the air itself shudders, like something vast holding back a scream.",
        options: [ { label: '(Step into the wound.)', to: 'firefrost' } ] },
      firefrost: { speaker: '', text:
        "At the clearing's heart, fused into a split altar of ember and ice, the FIRE/FROST — the gift of " +
        "Emberbolt to burn and Frost Shard to freeze. Gates that scorched you a moment ago you can now " +
        "ice solid; walls of ice you can melt to mist.",
        options: [ { label: '(Take up fire and frost.)', deed: 'tool_firefrost', meta: { tool: 'firefrost' }, to: 'puzzle' } ] },
      puzzle: { speaker: '', text:
        "You burn the frozen bridges back to passable wood and freeze the burning torrents to a path of " +
        "black glass, turning the wood's own fever against itself, deeper and deeper toward the heart.",
        options: [ { label: '(Reach the Feverheart.)', to: 'boss' } ] },
      boss: { speaker: '', text:
        "THE FEVERHEART rises — one half roaring flame, one half locked ice — and it ALTERNATES, so the " +
        "side you can hurt keeps changing. Then, mid-fight, it does the cruel thing: it stops fighting " +
        "like a monster and starts fighting like something in pain, flinching from your blows. You win " +
        "anyway. You wish, a little, that you hadn't had to.",
        options: [ { label: '(Approach the fourth shard.)', to: 'agony' } ] },
      agony: { speaker: '', text:
        "You touch the shard — and the god's AGONY pours into you, unfiltered. Not a roar. A child's " +
        "kind of pain, vast and bewildered: it does not understand why it has hurt so long, or what it " +
        "did, or when the warm dark will come back. It has been screaming politeness into the wind for " +
        "five hundred years because no one taught it another way to ask for help. And it is so, so tired.",
        options: [ { label: '(The shard is yours. Now — what do you do with it?)', deed: 'shard_4', meta: { shard: 4 }, to: 'decide' } ] },
      decide: { speaker: '', text:
        "The power of a god lies open to your hand, and the god itself lies open to your mercy. Whatever " +
        "you choose here, you will carry to the Spire and beyond. There is no taking it back.",
        options: [
          { label: '(Show MERCY — pour your own strength in to ease its agony.)', deed: 'mercy_shown', choice: { quest: 'M16', id: 'mercy' }, end: true },
          { label: '(SEIZE the power for yourself — it cannot stop you.)', choice: { quest: 'M16', id: 'seize' }, end: true },
          { label: '(Take the shard plainly; harden your heart and go.)', choice: { quest: 'M16', id: 'take' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M17 — Sela's Design (STUB — the Spire approach; PERMANENT DECISION 3,
  // authored with the endgame.)
  // ---------------------------------------------------------------------------
  {
    id: 'M17', title: "Sela's Design", region: 'Spire approach', act: 2,
    type: 'main', tone: 'betrayal', perm: true,
    unlocks: [], reward: {}, choices: [],
    steps: [ { id: 'stub', desc: "Sela's true plan; the possible betrayal; trust / oppose / go alone. (To be authored with the endgame.)" } ],
  },
];
