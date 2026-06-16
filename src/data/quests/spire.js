// =============================================================================
// THE HOLLOW SPIRE — ACT 3, the endgame (M17-M20 + the five endings). Authored
// as DATA on the existing engines. This is where every choice across the game
// pays off: M17 reads the M10 decision + karma (Sela's betrayal); M18 gates on
// all four tools + echoes deed-memory (the kicked chicken returns); M19 is the
// over-built-up boss + Shard #5; M20 resolves the ending from Karma's
// reachableEndings() and layers the ET1-ET12 epilogue twists by deed.
//
// No engine change: route nodes (reactivity), requires (tool/deed gates), and
// the Karma ending-gates already carry the finale. M20 presents only the
// reachable endings via offeredEndings() (below), and the secret Ashbearer
// (QUEST-DATA M21) is realised as M20's hidden 'ashbearer' option.
// =============================================================================

export const SPIRE = [
  // ---------------------------------------------------------------------------
  // M17 — Sela's Design [PERMANENT DECISION 3]. Reads the whole game: if you
  // reported Hagga / leaned corrupt, Sela's betrayal bites hardest; if Hagga is
  // allied she warns you, and only then can you OPPOSE. TRUST (W, locks L) /
  // OPPOSE (sela_opposed, +P, opens the Liberator endgame) / GO ALONE.
  // ---------------------------------------------------------------------------
  {
    id: 'M17', title: "Sela's Design", region: 'Spire approach', act: 3,
    type: 'main', tone: 'betrayal', perm: true,
    unlocks: ['M18'],
    reward: { sets: 'endgame_allies' },
    steps: [
      { id: 'return', desc: 'Return toward Sela with four shards.' },
      { id: 'reveal', desc: "Hear Sela's true design for the shards." },
      { id: 'decide', desc: 'PERMANENT: trust Sela / oppose her / go alone.' },
    ],
    choices: [
      { id: 'trust', label: 'TRUST Sela', impact: 'neutral',
        karma: {}, deed: 'sela_trusted', locks: ['L-path'], ending: 'W',
        note: "You hand her the shards' fate; the bittersweet Warden road; the Liberator path closes." },
      { id: 'oppose', label: 'OPPOSE her (with Hagga)', impact: 'good',
        karma: { purity: 10 }, deed: 'sela_opposed', unlocks: ['L-endgame'], ending: 'L',
        note: 'You refuse the oracle; with Hagga at your back the Liberator endgame opens.' },
      { id: 'alone', label: 'GO ALONE', impact: 'neutral',
        karma: {}, deed: 'sela_alone', ending: '',
        note: 'Trust no one into the Spire; the hardest road, every ending still on the table.' },
    ],
    dialogue: { start: 'return', nodes: {
      return: { speaker: 'Sela', text:
        "Four shards. *Sela's hands open for them, calm as still water* You've done what no one in five " +
        "hundred years could. Give them to me now, child, and I'll see the Hearthflame made whole — the " +
        "way it was always meant to be.",
        options: [ { label: '(The way it was meant to be...?)', to: 'doubt_check' } ] },
      // CHILDHOOD ECHO (cohesion #3): if you PRESSED Sela for answers as a child (M7 sela_doubt), she marks it
      // here — the seed pays off as a one-line foreshadow before the reveal. Otherwise straight to the reveal.
      doubt_check: { route: [
        { when: (c) => c.karma.hasDeed('sela_doubt'), to: 'doubt_seen' },
        { to: 'reveal' } ] },
      doubt_seen: { speaker: 'Sela', text:
        "*she pauses, reading your face* ...You always did press. Even as a child, the night I sent you west — " +
        "you wanted the question under the question. I should have known a mind like that would come back asking. " +
        "*the calm settles again* It changes nothing now. But I remember it.",
        options: [ { label: '(Say nothing, and let her go on.)', to: 'reveal' } ] },
      // the reveal reads the whole game: betray hardest if you sold Hagga out / went corrupt
      reveal: { route: [
        { when: (c) => c.karma.hasDeed('hagga_reported') || c.karma.get('purity') <= -20, to: 'betray' },
        { to: 'aligned' } ] },
      betray: { speaker: 'Sela', text:
        "*the calm doesn't reach her eyes, and now the mask slips entirely* Made whole — and BOUND, " +
        "tighter than ever, by me. You handed me Hagga; did you think I'd not take the rest as easily? " +
        "The shards. Now. You've been such a useful little tool — don't spoil it at the end.",
        options: [ { label: '(So this was always the design.)', to: 'warn' } ] },
      aligned: { speaker: 'Sela', text:
        "*and for once the composure is just... tiredness* I mean to re-bind it, yes. Not for power — " +
        "because I am afraid of what unbinding a screaming god would do to a land already dying. I may " +
        "be wrong. I have been wrong before. But that is my design, laid bare. Now you know all of it.",
        options: [ { label: '(Now you know all of it.)', to: 'warn' } ] },
      // Hagga warns you only if she's still your ally
      warn: { route: [
        { when: (c) => c.karma.hasDeed('hagga_believed') || c.karma.hasDeed('hagga_ally_plus'), to: 'hagga_warns' },
        { to: 'decide' } ] },
      hagga_warns: { speaker: 'Hagga', text:
        "*stepping from the rocks, where she has been waiting this whole time* I told you the oracles " +
        "lie, child. I did not come all this way to watch you hand her the last of it. Whatever you " +
        "decide — decide it with your eyes open. I'm with you, if you'll have me.",
        options: [ { label: '(Decide.)', to: 'decide' } ] },
      // only offer OPPOSE if Hagga is allied (you can't oppose Sela without backing)
      decide: { route: [
        { when: (c) => c.karma.hasDeed('hagga_believed') || c.karma.hasDeed('hagga_ally_plus'), to: 'choose_full' },
        { to: 'choose_limited' } ] },
      choose_full: { speaker: '', text:
        "Sela with her open hands. Hagga at your shoulder. Four shards, and the Spire above. Three roads.",
        options: [
          { label: '(Trust Sela; give her the shards.)', choice: { quest: 'M17', id: 'trust' }, end: true },
          { label: '(Refuse her; stand with Hagga.)', choice: { quest: 'M17', id: 'oppose' }, end: true },
          { label: '(Trust no one; go alone.)', choice: { quest: 'M17', id: 'alone' }, end: true },
        ] },
      choose_limited: { speaker: '', text:
        "Sela with her open hands. No Hagga at your shoulder — you saw to that, or never won her. Four " +
        "shards, and the Spire above. Two roads.",
        options: [
          { label: '(Trust Sela; give her the shards.)', choice: { quest: 'M17', id: 'trust' }, end: true },
          { label: '(Trust no one; go alone.)', choice: { quest: 'M17', id: 'alone' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M18 — The Long Ascent (gauntlet). GATED on all four tools. Deed-memory
  // echoes: high Morality -> allies aid (M18a), low -> enemies swarm (M18b); the
  // KICKED CHICKEN returns (the signature 30-hours-later cameo). mercy/cruelty.
  // ---------------------------------------------------------------------------
  {
    id: 'M18', title: 'The Long Ascent', region: 'Spire', act: 3,
    type: 'gauntlet', tone: 'climactic', perm: false,
    requires: { deeds: ['tool_lantern', 'tool_grapple', 'tool_hookshot', 'tool_firefrost'] },
    unlocks: ['M19'],
    reward: {},
    steps: [
      { id: 'climb', desc: 'Ascend the Spire — lantern, grapple, hookshot, fire/frost gates in turn.' },
      { id: 'echoes', desc: 'The dead and the living you left behind echo on the climb.' },
      { id: 'summit', desc: 'Reach the summit chamber — show mercy or cruelty along the way.' },
    ],
    choices: [
      { id: 'ascent_mercy', label: 'Mercy beats on the climb', impact: 'good',
        karma: { morality: 10 }, deed: 'ascent_mercy', ending: '',
        note: 'You spare what you can on the way up.' },
      { id: 'ascent_cruel', label: 'Cruelty beats on the climb', impact: 'dark',
        karma: { morality: -10 }, deed: 'ascent_cruel', ending: 'T-lean',
        note: 'You cut through everything; the Spire remembers the manner of your coming.' },
    ],
    dialogue: { start: 'climb', nodes: {
      climb: { speaker: '', text:
        "The Hollow Spire turns the whole journey back on you at once: a pitch vault only the LANTERN " +
        "lights; a sheer face only the GRAPPLE climbs; a chasm only the HOOKSHOT crosses; a seal of " +
        "ember and ice only FIRE/FROST unmakes. Everything you earned, in one ascent.",
        options: [ { label: '(Climb — and the dead and living begin to echo.)', to: 'echoes' } ] },
      // who meets you on the climb depends on how you treated the world
      echoes: { route: [
        { when: (c) => c.karma.get('morality') >= 20, to: 'echoes_kind' },
        { when: (c) => c.karma.get('morality') <= -20, to: 'echoes_cruel' },
        { to: 'echoes_mixed' } ] },
      echoes_kind: { speaker: '', text:
        "They come to HELP. The ones you spared, the ones you stood by — Hagga's marsh-folk, the miners " +
        "you backed, the keeper's light somehow burning even here — holding the way open, fighting at " +
        "your side, lifting you when the climb takes everything.",
        options: [ { label: '(Climb on, lighter.)', to: 'chicken' } ] },
      echoes_cruel: { speaker: '', text:
        "They come to HINDER. The ones you crossed, betrayed, left to the fire and the freeze — they bar " +
        "the stairs, swarm the ledges, drag at your heels. The Spire arms itself with everyone you " +
        "wronged, and there are so many of them.",
        options: [ { label: '(Cut your way up, alone.)', to: 'chicken' } ] },
      echoes_mixed: { speaker: '', text:
        "Some help, some hinder — the ledger of an ordinary life, called in all at once on the worst " +
        "staircase in the world.",
        options: [ { label: '(Climb on.)', to: 'chicken' } ] },
      // THE CHICKEN. it must return if you kicked it as a child.
      chicken: { route: [
        { when: (c) => c.karma.hasDeed('chicken_kicked'), to: 'chicken_cameo' },
        { to: 'summit' } ] },
      chicken_cameo: { speaker: '', text:
        "On the final landing, lit by no torch, stands a CHICKEN. Brown. Ordinary. Staring. You know " +
        "this chicken. Thirty years and four regions and a dying god ago, you BOOTED this chicken's " +
        "mother across a meadow on a dare. It has not forgotten. It will never forget. It does not " +
        "attack. It simply watches you pass, with the patience of something that knows it has already won.",
        options: [ { label: '(...climb past the chicken. Say nothing.)', to: 'summit' } ] },
      summit: { speaker: '', text:
        "The summit chamber waits above, and below you the whole ascent — every soul you helped or hurt " +
        "to get here. How did you climb?",
        options: [
          { label: '(Mercy, where you could afford it.)', choice: { quest: 'M18', id: 'ascent_mercy' }, end: true },
          { label: '(Cruelty, where it was faster.)', choice: { quest: 'M18', id: 'ascent_cruel' }, end: true },
        ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M19 — The Binding Chamber. The full truth + the OVER-BUILT-UP brutal boss
  // (hyped all game) + SHARD #5 (shard_5, 5/5).
  // ---------------------------------------------------------------------------
  {
    id: 'M19', title: 'The Binding Chamber', region: 'Spire', act: 3,
    type: 'boss', tone: 'climactic', perm: false,
    unlocks: ['M20'],
    reward: { shard: 5 },
    steps: [
      { id: 'truth', desc: 'The binding chamber: the bound god revealed in full.' },
      { id: 'boss', desc: 'The Warden of the Binding — the over-built-up brutal boss (all tools + a twist).' },
      { id: 'shard', desc: 'Claim Shard #5 (5/5).' },
    ],
    choices: [
      { id: 'defeat', label: 'Defeat the Warden of the Binding -> Shard #5', impact: 'neutral',
        karma: {}, deed: 'shard_5', ending: '',
        note: 'The fifth and final shard; the full truth laid bare; the stage set for the Choice.' },
    ],
    dialogue: { start: 'truth', nodes: {
      truth: { speaker: '', text:
        "The Binding Chamber. And the god, at last, entire: vast beyond the room that cannot hold it, a " +
        "wound the size of the sky, five hundred years of a child's screaming pressed flat into a shape " +
        "the oracles could chain. You finally SEE the whole of what was done. And between you and the " +
        "fifth shard stands its keeper — the thing they built to make sure no one ever undid it.",
        options: [ { label: '(Face the Warden of the Binding.)', to: 'boss' } ] },
      boss: { speaker: '', text:
        "THE WARDEN OF THE BINDING — every guardian you have ever fought, fused and crowned: it shrouds " +
        "like the Drowned Guardian, armours like the Keep Sentinel, hooks and drowns like the Tideward, " +
        "fevers fire-and-frost like the Feverheart. It is everything the game ever taught you, asked all " +
        "at once, and then — the twist — at half-health it stops defending the god and starts BEGGING " +
        "you to end it. You learn the pattern. You pay for every mistake. And, at last, it falls.",
        options: [ { label: '(Take the fifth shard.)', deed: 'shard_5', meta: { shard: 5 }, choice: { quest: 'M19', id: 'defeat' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M20 — The Choice [FINALE]. Resolves the ending from Karma.reachableEndings().
  // Present ONLY the reachable endings (use offeredEndings() below). Each option
  // records the chosen ending; epilogueCards() layers the ET1-ET12 twists.
  // ---------------------------------------------------------------------------
  {
    id: 'M20', title: 'The Choice', region: 'Spire', act: 3,
    type: 'finale', tone: 'transcendent/mysterious', perm: true,
    requires: { quests: ['M19'] },
    unlocks: [], reward: {},
    steps: [
      { id: 'choose', desc: 'With all five shards, decide the bound god\'s fate.' },
    ],
    // All five are defined; only the REACHABLE ones are offered (offeredEndings()).
    choices: [
      { id: 'warden', endingKey: 'W', label: 'WARDEN — re-bind the god', impact: 'neutral',
        karma: {}, deed: 'ending_warden', ending: 'W',
        note: 'The land lives on, the god suffers on, you carry the weight. Bittersweet, the default.' },
      { id: 'saint', endingKey: 'S', label: 'SAINT — heal it, then re-bind with compassion', impact: 'good',
        karma: {}, deed: 'ending_saint', ending: 'S',
        note: 'The kind re-binding: you ease its agony before you bind it again.' },
      { id: 'tyrant', endingKey: 'T', label: "TYRANT — seize the god's power", impact: 'dark',
        karma: {}, deed: 'ending_tyrant', ending: 'T',
        note: 'You take the throne of its torment and become the new thing the land fears.' },
      { id: 'liberator', endingKey: 'L', label: 'LIBERATOR — free the god', impact: 'good',
        karma: {}, deed: 'ending_liberator', ending: 'L',
        note: 'The hardest, most earned road: you unbind it and let it go. Bittersweet-transcendent.' },
      { id: 'ashbearer', endingKey: 'A', label: 'ASHBEARER — take its burden into yourself', impact: 'good',
        karma: {}, deed: 'ending_ashbearer', ending: 'A',
        note: 'The secret: refuse all three; break the cycle by carrying the god\'s burden yourself.' },
    ],
    dialogue: { start: 'choose', nodes: {
      choose: { speaker: '', text:
        "Five shards in your hands; the god entire before you; the whole of the journey — every kindness " +
        "and every cruelty — at your back. There is no Sela now, no Hagga, no oracle. Only you, and what " +
        "you have become, and the oldest question in the world: what do you do with a suffering you have " +
        "the power to end? (Only the roads your life has actually opened lie before you.)",
        // The scene builds the menu from offeredEndings(karma); all five are here as data.
        options: [
          { label: 'WARDEN — re-bind it.', choice: { quest: 'M20', id: 'warden' }, end: true },
          { label: 'SAINT — heal it, then re-bind.', choice: { quest: 'M20', id: 'saint' }, end: true },
          { label: 'TYRANT — seize it.', choice: { quest: 'M20', id: 'tyrant' }, end: true },
          { label: 'LIBERATOR — free it.', choice: { quest: 'M20', id: 'liberator' }, end: true },
          { label: 'ASHBEARER — carry it yourself.', choice: { quest: 'M20', id: 'ashbearer' }, end: true },
        ] },
    } },
  },
];

// --- M20: present only the endings Karma says are reachable -------------------
// Returns the M20 choice-ids offerable for this karma state (== reachableEndingIds).
const M20 = SPIRE.find((q) => q.id === 'M20');
export function offeredEndings(karma) {
  const reach = new Set(karma.reachableEndingIds());
  return M20.choices.filter((c) => reach.has(c.endingKey)).map((c) => c.id);
}

// --- The ~dozen epilogue twists (ET1-ET12), layered by deed -------------------
export const EPILOGUE_TWISTS = [
  { id: 'ET1', when: (k) => k.hasDeed('chicken_kicked'),
    card: 'The kicked chicken outlives you all — a last, darkly comic cameo.' },
  { id: 'ET2', when: (k) => k.hasDeed('grief_vow') || k.hasDeed('grief_vengeance'),
    card: (k) => k.hasDeed('grief_vow')
      ? "Bram's name is spoken over the rebuilt hearth; the vow you made over the ash is honoured."
      : "Bram's memory goes unspoken; the cold vow you swore left no room for mourning." },
  { id: 'ET3', when: (k) => k.hasDeed('mara_exposed'),
    card: 'Mara is absent from the epilogue — you made sure of that years ago.' },
  { id: 'ET4', when: (k) => k.hasDeed('saved_burning') || k.hasDeed('saved_freezing'),
    card: (k) => k.hasDeed('saved_burning')
      ? 'The burning half of the settlement lives; the freezing half is a row of quiet graves.'
      : 'The freezing half of the settlement lives; the burning half is ash and silence.' },
  { id: 'ET5', when: (k) => k.hasDeed('faction_smuggler') || k.hasDeed('faction_authority'),
    card: (k) => k.hasDeed('faction_smuggler')
      ? 'Saltbreak runs free and lawless under the flag you helped raise.'
      : 'Saltbreak runs orderly and watched under the authority you backed.' },
  { id: 'ET6', when: (k) => k.hasDeed('faction_workers') || k.hasDeed('faction_owner') || k.hasDeed('faction_peace'),
    card: (k) => k.hasDeed('faction_owner')
      ? 'The Peaks mine roars on; the miners broke, and remember who let them.'
      : (k.hasDeed('faction_peace') ? 'The Peaks settled into a hard, lasting peace.' : 'The Peaks miners won their due, and your name with it.') },
  { id: 'ET7', when: (k) => k.hasDeed('betrayal_vengeance') || k.hasDeed('betrayal_mercy'),
    card: (k) => k.hasDeed('betrayal_mercy')
      ? 'The coast tells of the one who spared a betrayer — a rarer reputation than blood.'
      : 'The coast tells of the one who is not to be crossed.' },
  { id: 'ET8', when: (k) => k.hasDeed('hagga_believed') || k.hasDeed('hagga_reported'),
    card: (k) => k.hasDeed('hagga_reported')
      ? "Hagga's hut stands empty in the marsh; no one says what Sela did with her."
      : 'Hagga lives, and the marsh-folk speak the truth aloud at last.' },
  { id: 'ET9', when: (k) => k.hasDeed('pem_found'),
    card: 'PEM, found at the end of the longest joke in the world, sends their regards — a hopeful card.' },
  { id: 'ET10', when: (k) => k.hasDeed('cave_lore'),
    card: 'The weeping-flame carving you found as a child closes the circle — an extra lore card.' },
  { id: 'ET11', when: (k, ending) => ending === 'L' && (k.hasDeed('weeping_tree') || k.get('purity') >= 60),
    card: 'The transcendent card: the freed god, at the very end, is gently, bewilderingly grateful.' },
  { id: 'ET12', when: (k, ending) => ending === 'T' && k.get('morality') <= -60,
    card: 'The darkest card: nothing the land feared was as bad as what you chose to become.' },
];

// Active epilogue cards for a finished game (the chosen ending key + the deeds).
export function epilogueCards(karma, endingKey) {
  return EPILOGUE_TWISTS
    .filter((t) => t.when(karma, endingKey))
    .map((t) => ({ id: t.id, card: typeof t.card === 'function' ? t.card(karma, endingKey) : t.card }));
}
