// =============================================================================
// ASHEN MARSH — SIDE QUESTS (SA1-SA5), authored as DATA on the QuestEngine.
// The interlinked web: bog-folk troubles + a Pem clue, Hagga's errands (gated by
// not having reported her), lantern-gated loot, the undefeatable Frog (a PUZZLE,
// not a fight), and a drowned letter that connects back to a Greenhollow NPC.
//
// GATE D for every one: objectives are SPREAD through the bog (seeps, the sunk
// barrow, the drowned crypts, a corpse out in the reeds) — never an item sitting
// at the quest-giver's feet. Canonical deed-ids so callbacks + M17 ally-strength
// + the Pem hunt + the shard/Liberator gating all read the same memory.
// =============================================================================

export const ASHEN_MARSH_SIDE = [
  // SA1 — Bog-Folk Troubles (story). Unlocked by being KIND to the bog-folk (M8).
  // Spread objectives: trace 3 seeps across the bog to a drowned channel. Drops a
  // Pem clue toward the cross-region hunt. Deeds: pem_clue_marsh, bog_troubles.
  {
    id: 'SA1', title: 'Bog-Folk Troubles', region: 'Ashen Marsh', act: 2,
    type: 'side', tone: 'melancholy', perm: false,
    reward: { rep: 'mirefen', lore: 'spreading_sickness' },
    steps: [
      { id: 'ask', desc: 'Yssa: the black water is spreading — find the source.' },
      { id: 'trace', desc: 'Trace the three new seeps out across the bog.' },
      { id: 'dam', desc: 'Dam the drowned channel with the bog-folk.' },
    ],
    choices: [
      { id: 'help', label: 'Help dam the black water', impact: 'good',
        karma: { morality: 10 }, deed: 'bog_troubles', ending: '',
        note: 'Bog-folk trust; lore about the spreading sickness (the dying god).' },
    ],
    dialogue: { start: 'ask', nodes: {
      ask: { speaker: 'Elder Yssa', text:
        "The black water's spreading — three new seeps since the moon turned, and the eldest well's " +
        "gone foul. You've a kind face and a working lantern. Trace it to its source, would you, before " +
        "Mirefen drinks poison.",
        options: [ { label: '(Set out across the bog.)', to: 'trace' } ] },
      trace: { speaker: '', text:
        "You follow the seeps the long way round the mire. At the third, half-sunk in the muck, a flat " +
        "stone scratched with crude proud letters: 'PEM WOZ ERE.' Someone has been all the way out " +
        "here. You make a note of it.",
        options: [ { label: '(Note the Pem marker; follow the water upstream.)', deed: 'pem_clue_marsh', meta: { hunt: 'pem' }, to: 'dam' } ] },
      dam: { speaker: '', text:
        "The seeps lead to an old drowned channel, choked and weeping black. With the lantern and a " +
        "morning's hard work, you and the bog-folk dam it back — and Yssa quietly tells you what the " +
        "elders whisper: the sickness started the year the Hearthflame first 'flickered wrong.'",
        options: [ { label: '(Seal the channel.)', choice: { quest: 'SA1', id: 'help' }, end: true } ] },
    } },
  },

  // SA2 — Hagga's Errands (morality/Purity fork). Unlocked by KIND to bog-folk
  // (M8); only available if you did NOT report Hagga. Raises her ally strength
  // (feeds M17). Deeds: hagga_ally_plus (favours) / hagga_refused.
  {
    id: 'SA2', title: "Hagga's Errands", region: 'Ashen Marsh', act: 2,
    type: 'side', tone: 'morality', perm: false,
    requires: { notDeeds: ['hagga_reported'] },   // if you sold her out, she's gone
    reward: { ally: 'hagga_strength' },
    steps: [
      { id: 'ask', desc: 'Hagga asks favours the loyal-folk refuse an exile.' },
      { id: 'fetch', desc: 'Fetch bog-iron from the sunk barrow + grave-herb from the dead-ground.' },
    ],
    choices: [
      { id: 'favours', label: 'Run her errands; stand with the exile', impact: 'good',
        karma: { purity: 10 }, deed: 'hagga_ally_plus', unlocks: ['L-support'], ending: 'L',
        note: "Strengthens Hagga as an ally for M17 + the Liberator path." },
      { id: 'refuse', label: 'Side with the oracle-loyal folk; refuse her', impact: 'neutral',
        karma: {}, deed: 'hagga_refused', ending: '',
        note: 'You keep the loyalists sweet; Hagga stays a lone exile.' },
    ],
    dialogue: { start: 'ask', nodes: {
      ask: { speaker: 'Hagga', text:
        "If you mean to help me, prove it past words. There's bog-iron in the sunk barrow out east, and " +
        "a grave-herb that grows only where the dead lie thick. The loyal-folk won't fetch them for an " +
        "exile — they'd sooner spit. Will you?",
        options: [ { label: '(Decide where you stand.)', to: 'decide' } ] },
      decide: { speaker: '', text:
        "The bog-folk are watching which way you'll jump — toward the exile the oracles cast out, or " +
        "toward the loyal elders who'd rather you didn't.",
        options: [
          { label: '(Fetch the bog-iron + grave-herb; stand with Hagga.)', choice: { quest: 'SA2', id: 'favours' }, end: true },
          { label: '(Make your excuses; side with the loyalists.)', choice: { quest: 'SA2', id: 'refuse' }, end: true },
        ] },
    } },
  },

  // SA3 — The Sunken Dead (fun/loot). Lantern-gated shrine side-rooms; epic loot.
  // Root, gated by having the lantern. Deed: sunken_dead_looted.
  {
    id: 'SA3', title: 'The Sunken Dead', region: 'Ashen Marsh', act: 2,
    type: 'side', tone: 'tense', perm: false,
    requires: { deeds: ['tool_lantern'] },        // only reachable with the lantern
    reward: { items: ['marsh_blade'], gold: 200 },
    steps: [
      { id: 'reveal', desc: 'Lantern reveals drowned crypts off the Sunken Shrine.' },
      { id: 'loot', desc: 'Past a light-gated seal, plunder the drowned lord\'s hoard.' },
    ],
    choices: [
      { id: 'loot', label: 'Plunder the drowned crypts', impact: 'neutral',
        karma: {}, deed: 'sunken_dead_looted', ending: '',
        note: 'Epic lantern-gated loot: a marsh-forged blade + old coin.' },
    ],
    dialogue: { start: 'reveal', nodes: {
      reveal: { speaker: '', text:
        "With the lantern lit, side-passages the dark had swallowed open off the Sunken Shrine — drowned " +
        "crypts, thick with the grave-goods of folk who sank here long before the lie.",
        options: [ { label: '(Follow the lantern-light deeper.)', to: 'loot' } ] },
      loot: { speaker: '', text:
        "Past a seal that only the lantern's light unbars, a drowned lord lies in his hoard: a fine " +
        "marsh-forged blade, still keen, and a scatter of old coin no one living has missed.",
        options: [ { label: '(Take the hoard.)', choice: { quest: 'SA3', id: 'loot' }, end: true } ] },
    } },
  },

  // SA4 — Frog of the Fen [TWIST]. The UNDEFEATABLE frog: a PUZZLE, not a fight.
  // No kill path exists; you escape (apple / blow-a-kiss / lead it away). The
  // 'fight' branch LOOPS (teaches lateral thinking). No karma. Deed: frog_trophy.
  {
    id: 'SA4', title: 'Frog of the Fen', region: 'Ashen Marsh', act: 2,
    type: 'twist', tone: 'funny', perm: false,
    requires: { quests: ['M8'] },
    reward: { trophy: 'fen_frog', lesson: 'not_all_by_force' },
    steps: [
      { id: 'chase', desc: 'A giant frog gives chase — it cannot be killed.' },
      { id: 'escape', desc: 'Escape it: drop an apple / blow it a kiss / lead it into the mire.' },
    ],
    choices: [
      // ONE outcome only — escape. There is deliberately NO kill/defeat choice.
      { id: 'escape', label: 'Escape the frog (apple / blow-a-kiss / lead away)', impact: 'neutral',
        karma: {}, deed: 'frog_trophy', ending: '',
        note: 'A quirky trophy + a laugh + the lesson that not everything is beaten by force.' },
    ],
    dialogue: { start: 'chase', nodes: {
      chase: { speaker: '', text:
        "A FROG the size of an ox erupts from the reeds, fixes you with a wet, patient stare — and hops. " +
        "Fast. Straight at you. (Steel will do nothing here. Think.)",
        options: [
          { label: '(Drop an apple — let it stop to eat.)', choice: { quest: 'SA4', id: 'escape' }, end: true },
          { label: '(Blow it a kiss — the gesture charms the daft thing.)', choice: { quest: 'SA4', id: 'escape' }, end: true },
          { label: '(Lead it into the deep mire and slip free.)', choice: { quest: 'SA4', id: 'escape' }, end: true },
          { label: '(Draw your blade and fight it.)', to: 'fight' },
        ] },
      fight: { speaker: '', text:
        "Your blade bounces clean off its slick hide. It doesn't even blink. It is STILL coming. Some " +
        "things, it turns out, you do not beat with steel.",
        options: [ { label: '(Rethink — fast!)', to: 'chase' } ] },   // loop: no kill path
    } },
  },

  // SA5 — Drowned Letters (deed-link). A corpse's letter names a Greenhollow NPC;
  // carrying it seeds a long-range callback. Deed: drowned_letter (meta.npc).
  {
    id: 'SA5', title: 'Drowned Letters', region: 'Ashen Marsh', act: 2,
    type: 'side', tone: 'heartfelt', perm: false,
    requires: { quests: ['M8'] },
    reward: { link: 'greenhollow' },
    steps: [
      { id: 'find', desc: 'Find the drowned body out in the reeds.' },
      { id: 'read', desc: 'Read the sealed letter — it names a Greenhollow soul.' },
    ],
    choices: [
      { id: 'carry', label: 'Carry the letter to Greenhollow', impact: 'good',
        karma: { morality: 5 }, deed: 'drowned_letter', meta: { npc: 'Mara' }, ending: '',
        note: 'Delivering it back home makes that NPC react — a long-range world-connection.' },
      { id: 'leave', label: 'Leave it with the dead', impact: 'neutral',
        karma: {}, deed: 'drowned_letter_left', ending: '',
        note: 'The letter, and whatever it meant, stays out in the mire.' },
    ],
    dialogue: { start: 'find', nodes: {
      find: { speaker: '', text:
        "Out past the last stilt-house, a body has surfaced among the reeds — long drowned, oilcloth " +
        "still wrapped tight against its chest. Inside, a sealed letter, the ink only just legible.",
        options: [ { label: '(Open and read it.)', to: 'read' } ] },
      read: { speaker: '', text:
        "It's addressed to GREENHOLLOW: '...tell Mara I did not run from her. Tell her I always meant " +
        "to come home.' The drowned stranger, whoever they were, never did.",
        options: [
          { label: '(Take the letter — Mara should have it.)', choice: { quest: 'SA5', id: 'carry' }, end: true },
          { label: '(Lay it back with the dead.)', choice: { quest: 'SA5', id: 'leave' }, end: true },
        ] },
    } },
  },

  // PH5 — The Experience Stone (a perfect, permanent blissful illusion vs the
  // hard true world). Haunting + optional; it mirrors the whole game's lie-vs-
  // truth in your palm. take (-P, turn from the real) / refuse (+P, keep it).
  {
    id: 'PH5', title: 'The Experience Stone', region: 'Ashen Marsh', act: 2,
    type: 'twist', tone: 'melancholy', perm: false,
    requires: { quests: ['M8'] },
    reward: {},
    steps: [ { id: 'offer', desc: 'A bog-mystic offers a stone of perfect, permanent bliss.' } ],
    choices: [
      { id: 'take', label: 'Take the stone — choose the perfect dream', impact: 'dark',
        karma: { purity: -10 }, deed: 'stone_taken', ending: '',
        note: 'You sink into a bliss that will never know itself false. A quiet ending, of a kind — and something in you does not come all the way back.' },
      { id: 'refuse', label: 'Set the stone down — keep the real world', impact: 'good',
        karma: { purity: 10 }, deed: 'stone_refused', ending: '',
        note: 'You choose the hard true thing over the soft false one. It is, you realise, this whole land\'s question, sitting in your hand.' },
    ],
    dialogue: { start: 'offer', nodes: {
      offer: { speaker: 'Mother Vell', text:
        "*a still old woman sunk to the waist in the black water, eyes like wet slate* Hold this, child, and " +
        "you need never hurt again. A whole long sweet life of every good thing you ever wanted — and you " +
        "will not once, ever, know it isn't real. No grief. No marsh. No screaming flame. Just... warm. Or — " +
        "*she opens her other, empty hand* — you keep all of THIS. The cold. The truth. The work. The ache " +
        "of a real day. Choose honestly. No one watches but me, and I made my choice a long time ago.",
        options: [
          { label: '(Take the stone. Let it all be warm.)', choice: { quest: 'PH5', id: 'take' }, to: 'after' },
          { label: '(Set it down. Keep the real, hard world.)', choice: { quest: 'PH5', id: 'refuse' }, to: 'after' },
        ] },
      after: { speaker: 'Mother Vell', text:
        "*she watches what you did with the kind, terrible patience of someone who knows there was no wrong " +
        "answer — only your answer* ...Mm. So that's the shape of you, under it all. Go on, then, whichever " +
        "way you chose. The flame's still screaming out there either way.",
        options: [ { label: '(Leave the still water.)', end: true } ] },
    } },
  },
];
