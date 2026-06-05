// =============================================================================
// ASHEN MARSH — ACT 2, REGION 1 (the first lie). Authored as DATA on the
// QuestEngine. The first full region loop: arrival (M8, Mirefen + Hagga) and
// the Sunken Shrine dungeon (M9, the LANTERN tool + Drowned Guardian + Shard #1),
// then M10 'Hagga's Truth' (stub — the PERMANENT decision, authored next).
//
// Tool/shard flags use the canonical ids the design + QUEST-DATA.json use, so
// later regions' backtrack-gating + the shard count read them:
//   tool_lantern, shard_1   (recorded as persistent deed-flags via Karma)
// =============================================================================

export const ASHEN_MARSH = [
  // ---------------------------------------------------------------------------
  // M8 — Into the Ashen Marsh (arrival; Mirefen + Yssa + Hagga). Choice: how you
  // treat the wary bog-folk (kind opens Mirefen; cruel stonewalls it, T-lean).
  // ---------------------------------------------------------------------------
  {
    id: 'M8', title: 'Into the Ashen Marsh', region: 'Ashen Marsh', act: 2,
    type: 'main', tone: 'melancholy', perm: false,
    unlocks: ['M9'],
    reward: { hub: 'Mirefen' },
    steps: [
      { id: 'travel', desc: 'Travel west — Greenhollow Wood thickens and softens into bog.' },
      { id: 'mirefen', desc: 'Reach Mirefen (bog-folk on stilts); speak with Elder Yssa.' },
      { id: 'hagga', desc: "Cross the black water to Hagga's hut." },
    ],
    choices: [
      { id: 'kind', label: 'Treat the bog-folk with respect', impact: 'good',
        karma: { morality: 10 }, deed: 'bogfolk_kind', unlocks: ['SA1', 'SA2'], ending: '',
        note: 'Mirefen opens up — extra lore + a helper.' },
      { id: 'cruel', label: 'Brush past them, dismissive', impact: 'dark',
        karma: { morality: -10 }, deed: 'bogfolk_cruel', ending: 'T-lean',
        note: 'The bog-folk stonewall you; a harder marsh.' },
    ],
    dialogue: { start: 'approach', nodes: {
      approach: { speaker: '', text:
        "West of Greenhollow the wood thickens, the ground goes soft and black, and the trees stand " +
        "knee-deep in still water. Ahead, lamplit on crooked stilts above the mire: Mirefen.",
        options: [ { label: '(Climb the boardwalk into Mirefen.)', to: 'yssa' } ] },
      yssa: { speaker: 'Elder Yssa', text:
        "Far enough, stranger. *she leans on a staff hung with charms* Outsiders bring the oracles' " +
        "troubles on their boots. The bog-folk are watching you — they always watch. State your " +
        "business, and mind the black water.",
        options: [ { label: '(How do you carry yourself before the wary bog-folk?)', to: 'choice' } ] },
      choice: { speaker: '', text:
        "Damp faces in every doorway, weary and afraid. The whole village is holding its breath, waiting " +
        "to see what kind of outsider you are.",
        options: [
          { label: '(Greet them with respect; ask after their troubles.)', choice: { quest: 'M8', id: 'kind' }, to: 'warm' },
          { label: "(Brush past — you've no patience for bog superstition.)", choice: { quest: 'M8', id: 'cruel' }, to: 'cold' },
        ] },
      warm: { speaker: 'Elder Yssa', text:
        "...Hm. Manners, and no charm-fingers crossed behind your back. That's rarer than you'd think " +
        "out here. Then I'll tell you true: across the black water lives Hagga. The oracles EXILED her " +
        "— and if you've the spine, ask her why. Most never do.",
        options: [ { label: '(Cross to Hagga.)', to: 'hagga' } ] },
      cold: { speaker: 'Elder Yssa', text:
        "*the doorways empty; faces turn away* As you like. The bog remembers rudeness longer than the " +
        "oracles remember mercy. ...Hagga's across the black water. The order cast her out. Go trouble " +
        "her, and leave honest folk be.",
        options: [ { label: '(Cross to Hagga.)', to: 'hagga' } ] },
      hagga: { speaker: 'Hagga', text:
        "So. Sela sent you west, and west you came. *sharp eyes, an old grief under them* Sit, child. " +
        "There's a truth here the oracles would burn me twice over for — but not yet; you'd not believe " +
        "it yet. First, the Sunken Shrine, out in the black water. Bring back what sleeps down there, " +
        "and I'll tell you what your precious Hearthflame really is.",
        options: [ { label: '(Take up the task.)', end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M9 — The Sunken Shrine (DUNGEON). Earn the LANTERN (tool_lantern), dark/light
  // puzzle beats, the Drowned Guardian (light strips the shroud, then strike),
  // claim SHARD #1 (shard_1). Tool/shard granted as persistent flags via the
  // dialogue beats; reward also recorded as data on the quest.
  // ---------------------------------------------------------------------------
  {
    id: 'M9', title: 'The Sunken Shrine', region: 'Ashen Marsh', act: 2,
    type: 'dungeon', tone: 'tense', perm: false,
    unlocks: ['M10'],
    reward: { tool: 'lantern', shard: 1, items: ['lantern'], heart: 1 },
    steps: [
      { id: 'enter', desc: 'Enter the dark Sunken Shrine out in the black water.' },
      { id: 'lantern', desc: 'Find + light the LANTERN — it reveals hidden paths and gates.' },
      { id: 'puzzle', desc: 'Use lantern-light to cross the flooded nave + raise the water-stair.' },
      { id: 'boss', desc: 'Drowned Guardian: strip its shroud with light, then strike (dodge lunge, block volley).' },
      { id: 'shard', desc: 'Claim Shard #1.' },
    ],
    choices: [
      { id: 'clear', label: 'Lantern + defeat the Drowned Guardian -> Shard #1', impact: 'neutral',
        karma: {}, ending: '',
        note: 'The first shard, the lantern tool, and the first crack in the lie.' },
    ],
    dialogue: { start: 'enter', nodes: {
      enter: { speaker: '', text:
        "Hagga points across the black water to a drowned arch — the Sunken Shrine. You wade in to the " +
        "chest; the mouth of it is pitch dark, and the dark feels like it's listening.",
        options: [ { label: '(Step into the dark.)', to: 'lantern' } ] },
      lantern: { speaker: '', text:
        "Blind in the black, your hand closes on cold iron — an old shuttered LANTERN, still in the grip " +
        "of a drowned shrine-keeper's bones. You strike it. Light blooms, and the dark peels back off " +
        "carvings no living eye has seen in an age.",
        options: [ { label: '(Take up the Lantern.)', deed: 'tool_lantern', meta: { tool: 'lantern' }, to: 'puzzle' } ] },
      puzzle: { speaker: '', text:
        "The lantern-light shows what the dark hid: narrow footing across the flooded nave, and sconces " +
        "drowned beneath the surface. You light them one by one, and with a groan of old stone the " +
        "water-stair rises out of the deep.",
        options: [ { label: '(Climb to the inner shrine.)', to: 'guardian' } ] },
      guardian: { speaker: '', text:
        "The water detonates upward — the DROWNED GUARDIAN, vast, wound head to foot in a clinging " +
        "shroud of black water. Blades skid off the shroud. But it flinches from the light.",
        options: [ { label: '(Raise the Lantern — the light burns the shroud away.)', to: 'strike' } ] },
      strike: { speaker: '', text:
        "Stripped of its shroud, the Guardian's pale core lies bare. It LUNGES — you dodge; it looses a " +
        "volley of black water — you block; you strike the core. Light, dodge, block, strike — three " +
        "times the pattern, and the great shape comes apart and sinks.",
        options: [ { label: '(Wade to the heart of the shrine.)', to: 'claim' } ] },
      claim: { speaker: '', text:
        "Where the Guardian sank, the still water holds a single shard of the Hearthflame — warm, " +
        "impossibly warm, in all that cold. As your fingers close on it, for half a heartbeat you hear " +
        "something far off, and grieving, like a voice.",
        options: [ { label: '(Claim Shard #1.)', deed: 'shard_1', meta: { shard: 1 }, choice: { quest: 'M9', id: 'clear' }, end: true } ] },
    } },
  },

  // ---------------------------------------------------------------------------
  // M10 — Hagga's Truth (STUB — the first big reveal + PERMANENT decision:
  // believe Hagga / report to Sela / stay silent. Authored next session.)
  // ---------------------------------------------------------------------------
  {
    id: 'M10', title: "Hagga's Truth", region: 'Ashen Marsh', act: 2,
    type: 'main', tone: 'dark/revelation', perm: true,
    unlocks: [], reward: {}, choices: [],
    steps: [ { id: 'stub', desc: 'Return to Hagga: the Hearthflame is a living, bound god. PERMANENT choice — believe / report / stay silent. (To be authored.)' } ],
  },
];
