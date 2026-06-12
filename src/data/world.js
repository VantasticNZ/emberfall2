// =============================================================================
// GREENHOLLOW VALE — the hub region, DATA ONLY. v3: SPACE-FIRST. Designed as
// ENCLOSED SPACES (an off-centre gravel PLAZA, lanes, fenced yards, a farm margin)
// that buildings + fences wrap — not paths-on-a-field. Real LPC autotile terrain
// feathers every grass↔path/soil seam. A 3-deep BOUNDARY DEPTH BAND (undergrowth →
// front trees → dark receding trees) walls all edges with the next area hinted
// beyond, and the road exits as a narrowing TRAILHEAD, not a gap in a wall.
// Path hierarchy: gravel plaza → packed-dirt main road → light-dirt lanes → a worn
// desire-path. SAFE ZONE. The named cast live + work in their districts.
// =============================================================================

const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const MARA = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_forest', 'pants_brown', 'shoes_brown_fem'];
const BRAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'beard_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
// WARDROBE VARIETY (town-feel 6) — distinct shirt colours across the cast (was a sea of leather/forest/blue).
// CAST VARIETY (item 4) — vary skin tone + hair COLOUR across the cast, not just shirt hue.
const HODGE = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_black', 'beard_gray', 'shirt_amber', 'pants_brown', 'shoes_brown'];
const TAM = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_ginger', 'shirt_red', 'pants_brown', 'shoes_brown'];
const PHIL = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_teal', 'pants_black', 'shoes_brown'];
const FATLEY = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'beard_gray', 'shirt_maroon', 'pants_black', 'shoes_brown'];
const PEM = ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_plum', 'pants_brown', 'shoes_brown_fem'];
const GUARD = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_black', 'shoes_brown', 'helm_kettle'];   // town guard — kettle helm (ElizaWy, OGA-BY) over the head

const W = 52, H = 40;
const fenceRun = (tx, ty, n) => Array.from({ length: n }, (_, i) => ({ key: 'prop_fence', tx: tx + i, ty, solid: true }));
// a planted HEDGE (solid bushes) — a diegetic district divider; `vert` runs it down.
const hedge = (tx, ty, n, vert = false) => Array.from({ length: n }, (_, i) => ({ key: 'prop_bush', tx: tx + (vert ? 0 : i), ty: ty + (vert ? i : 0), solid: true }));
// a daily SCHEDULE: [phase, tx, ty, activity] rows -> NpcLife data. Quest-givers'
// DAY spot == their old static spot (so quests stay reachable), with dawn/dusk/night
// variation; night spots sit OUTSIDE buildings (in front), so seek-paths stay clear.
const sched = (rows) => rows.map(([phase, tx, ty, d]) => ({ phase, tx, ty, do: d || 'idle' }));

// BOUNDARY DEPTH BAND — 3 rows deep per edge with a scale/tint gradient (front big &
// bright → back small & dark = receding silhouette) + undergrowth bushes; gaps at the
// road TRAILHEADS (N to the peaks, W toward the marsh). Every prop stays in-bounds.
function depthBand() {
  const out = [];
  const oak = 'prop_tree_oak', pine = 'prop_tree_pine';
  const GLOOM = 0x6f7d6a, RIDGE = 0x9aa6b0, DEEP = 0x4f5e4a;
  const T = (key, tx, ty, scale, tint) => out.push({ key, tx, ty, solid: true, scale, tint });
  const U = (tx, ty, tint) => out.push({ key: 'prop_bush', tx, ty, solid: true, tint });   // solid undergrowth
  const nGap = (tx) => tx >= 23 && tx <= 28;   // N trailhead (road to the crossroads/peaks)
  const wGap = (ty) => ty >= 16 && ty <= 20;   // W trailhead (toward the marsh)
  for (let ty = 3; ty <= 36; ty += 2) {        // WEST (marsh-gloom) + EAST (open wood)
    if (!wGap(ty)) { T(ty % 4 ? oak : pine, 3, ty, 1.0, GLOOM); T(pine, 2, Math.min(36, ty + 1), 0.8, GLOOM); T(oak, 1, ty, 0.62, DEEP); if (ty % 3 === 0) U(4, ty, GLOOM); }
    T(ty % 4 ? pine : oak, 48, ty); T(pine, 49, Math.min(36, ty + 1), 0.8); T(oak, 50, ty, 0.62, DEEP); if (ty % 3 === 0) U(47, ty);
  }
  for (let tx = 3; tx <= 49; tx += 2) {        // NORTH (foothill ridge) + SOUTH (meadow hedge)
    if (!nGap(tx)) { T(tx % 4 ? pine : oak, tx, 4, 1.0, RIDGE); T(pine, Math.min(49, tx + 1), 3, 0.8, RIDGE); T(oak, tx, 2, 0.62, DEEP); if (tx % 3 === 0) U(tx, 5, RIDGE); }
    T(tx % 4 ? oak : pine, tx, 35, 1.0); if (tx % 3 === 0) U(tx, 36); T(oak, Math.min(49, tx + 1), 36, 0.7, DEEP);
  }
  // trailhead framing — a couple of trees lean in at the gap shoulders so the road
  // CURVES into the wood (not a clean rectangular gap)
  T(pine, 22, 4, 0.9, RIDGE); T(oak, 29, 5, 0.9, RIDGE);   // N trailhead shoulders
  T(pine, 3, 15, 0.9, GLOOM); T(oak, 4, 21, 0.9, GLOOM);   // W trailhead shoulders
  return out;
}

export const WORLD = {
  widthTiles: W,
  heightTiles: H,

  // REAL autotile terrain: a grass base + overlay patches that feather into grass via
  // the [LPC] Terrains corner atlas. Path HIERARCHY by material: gravel (plaza/node) →
  // road = packed brown dirt (main street) → dirt = light tan (lanes) → soil (fields).
  terrain: {
    patches: [
      // the social heart: an OFF-CENTRE gravel PLAZA (upper-left of map centre)
      { set: 'gravel', rects: [[18, 12, 10, 7]] },
      // the MAIN ROAD (packed brown dirt) — curves N→plaza and S→farm
      { set: 'road', rects: [[24, 5, 3, 7], [20, 18, 5, 4], [22, 22, 5, 4], [24, 26, 5, 5], [22, 30, 7, 3]] },
      // LANES (light tan dirt) — to the homes district (E), the smithy (W), the farm
      { set: 'dirt', rects: [[27, 20, 7, 2], [33, 22, 9, 2], [40, 24, 7, 2], [12, 17, 7, 2], [8, 20, 5, 4], [14, 31, 7, 2]] },
      // a worn DESIRE-PATH (a 1-wide shortcut plaza→homes lane)
      { set: 'dirt', rects: [[29, 15, 1, 6]] },
      // FARM fields — SOIL (autotiled into the grass), fenced below
      { set: 'soil', rects: [[7, 33, 11, 4]] },
    ],
  },

  // lighter lived-in scatter (the autotiler now does the seams; this just supplements)
  decals: {
    count: 180, seed: 20260607,
    pool: ['decal_tuft', 'decal_tuft', 'decal_grass_lush', 'decal_grass_lush', 'decal_grass_tall',
      'decal_clover', 'decal_flower_pink', 'decal_flower_white', 'decal_flower_blue'],
  },
  ferns: { count: 16, seed: 4242, pool: ['decal_fern'] },
  dirt: { count: 14, seed: 13371, pool: ['decal_dirt_patch'] },

  // the BROOK — a banked pool in the SW meadow (between smithy and farm)
  pond: { tx: 4, ty: 29, w: 4, h: 3 },

  props: [
    // ---- the PLAZA (the off-centre social node) ----
    { key: 'prop_fountain', tx: 20, ty: 14, solid: true },          // the WELL — off-centre within the plaza
    { key: 'prop_sign', tx: 25, ty: 13, solid: true, text: 'GREENHOLLOW NOTICE BOARD — Hearthflame Festival at week\'s end, all welcome. Lost: one brown hen (answers to nothing). Mind the boarded cave past the meadow; the elders say stay clear.' },   // the NOTICE BOARD
    { key: 'prop_barrel', tx: 23, ty: 16, solid: true }, { key: 'prop_barrel', tx: 24, ty: 16, solid: true }, // market stalls (FLAG: a bench sprite would suit better)

    // ---- buildings FRONTING the plaza (enclosure) ----
    // DOOR-SYSTEM (docs/DOOR-SYSTEM.md): an enterable building carries `door:'<interior>'` — its front
    // wall gets ONE inset doorway gap (carved out of the solid base-band) + a dark threshold you walk INTO.
    { key: 'prop_house_paneled', tx: 19, ty: 9, solid: true, tint: 0xc4c4d0, door: 'gh_chapel', sign: 'prop_sign_chapel' },   // CHAPEL — fronts S
    { key: 'prop_house_paneled', tx: 29, ty: 15, solid: true, door: 'tankard_f1', sign: 'prop_sign_tavern' },                 // TAVERN — fronts S
    { key: 'prop_house_b', tx: 13, ty: 14, solid: true, tint: 0xd8c8a0, door: 'gh_store', sign: 'prop_sign_store' },         // Pem's STORE — fronts S
    { key: 'prop_house_a', tx: 41, ty: 11, solid: true, door: { to: 'house_generic', state: 'closed', owner: 'the household' } },   // the MANOR — a CLOSED home (knock / try)

    // ---- the SMITHY district (set apart, W — heat + noise) ----
    { key: 'prop_forge', tx: 10, ty: 24, solid: true, door: 'gh_forge', sign: 'prop_sign_forge' },
    { key: 'prop_barrel', tx: 8, ty: 26, solid: true }, { key: 'prop_barrel', tx: 13, ty: 25, solid: true },

    // ---- DISTRICT DIVIDERS (Pillar 1: barriers create places) — short hedges in the
    //      OPEN GRASS between districts, breaking the long E/W sightlines so plaza /
    //      homes / smithy read as separate places. Placed clear of every lane + NPC +
    //      quest route (re-verified walkable live). FLAG: a dedicated hedge sprite would
    //      beat reusing bushes. ----
    ...hedge(31, 24, 5, true),   // plaza/center ↔ HOMES district (E), below the homes lane
    ...hedge(16, 23, 4, true),   // plaza/center ↔ SMITHY yard (W), clear of the smithy lane
    ...hedge(35, 31, 3),         // homes ↔ farm margin (a low planting break, SE)

    // ---- the HOMES district (SE), cottages fronting the curved lane, BACKING onto fenced yards ----
    { key: 'prop_house_b', tx: 34, ty: 24, solid: true, door: { to: 'gh_home1', state: 'closed', owner: 'the cottager' } },   // cottage — CLOSED (knock / try-handle, uninvited = morality hit)
    { key: 'prop_house_b', tx: 41, ty: 28, solid: true, tint: 0xb8c8e0, door: { to: 'gh_home2', state: 'locked', owner: 'the cottager' } },   // cottage — LOCKED (knock / break-down = bigger hit + alarm)
    { key: 'prop_house_b', tx: 46, ty: 23, solid: true, tint: 0xc8b890 },       // cottage (tan)
    ...fenceRun(28, 23, 3), ...fenceRun(49, 22, 3),                              // back-yard fences — relocated CLEAR of the cottage doors (were straddling gh_home1 + house_v5 entrances → part-walkthrough)

    // ---- the FARM margin (S): a homestead + FENCED fields with crop sprouts ----
    { key: 'prop_house_b', tx: 13, ty: 29, solid: true, tint: 0xc8b890 },        // the homestead
    ...fenceRun(7, 32, 4), ...fenceRun(16, 32, 2),                                // the field's top fence — SPLIT to leave a clear gateway at the homestead door (house_v3 @ 13,32)
    { key: 'prop_bush', tx: 8, ty: 34, solid: false }, { key: 'prop_bush', tx: 11, ty: 35, solid: false },  // (FLAG: real crop-growth-stage sprites + a TimeOfDay growth hook are asset/engine work)
    { key: 'prop_bush', tx: 14, ty: 34, solid: false }, { key: 'prop_bush', tx: 16, ty: 35, solid: false },
    // the orchard (a tended row of oaks by the farm)
    { key: 'prop_tree_oak', tx: 20, ty: 34, solid: true }, { key: 'prop_tree_oak', tx: 24, ty: 35, solid: true },

    // ---- a few interior shade trees + SOLID undergrowth to channel movement ----
    { key: 'prop_tree_oak', tx: 33, ty: 14, solid: true }, { key: 'prop_tree_oak', tx: 16, ty: 22, solid: true },
    { key: 'prop_bush', tx: 27, ty: 17, solid: true }, { key: 'prop_bush', tx: 18, ty: 19, solid: true },
    { key: 'prop_bush', tx: 36, ty: 21, solid: true }, { key: 'prop_bush', tx: 45, ty: 27, solid: true },
    { key: 'prop_bush', tx: 31, ty: 22, solid: true }, { key: 'prop_bush', tx: 12, ty: 20, solid: true },

    // ---- PHASE-2 flora enrichment (NON-SOLID decoration — zero nav impact; varied scale/tint for
    //      the variety rule: layered undergrowth + garden clumps that frame the lanes + soften edges) ----
    { key: 'prop_bush', tx: 6, ty: 37, solid: false, scale: 0.7, tint: 0x8fbf6a }, { key: 'prop_bush', tx: 9, ty: 38, solid: false, scale: 0.55, tint: 0xa8d27a },
    { key: 'prop_bush', tx: 18, ty: 37, solid: false, scale: 0.8, tint: 0x7fae5a }, { key: 'prop_bush', tx: 22, ty: 38, solid: false, scale: 0.6, tint: 0x9ac46e },
    { key: 'prop_bush', tx: 38, ty: 34, solid: false, scale: 0.7, tint: 0x8fbf6a }, { key: 'prop_bush', tx: 44, ty: 33, solid: false, scale: 0.5, tint: 0xa8d27a },
    { key: 'prop_bush', tx: 47, ty: 18, solid: false, scale: 0.65, tint: 0x86b864 }, { key: 'prop_bush', tx: 6, ty: 12, solid: false, scale: 0.6, tint: 0x9ac46e },
    { key: 'prop_bush', tx: 4, ty: 22, solid: false, scale: 0.75, tint: 0x7fae5a }, { key: 'prop_bush', tx: 48, ty: 30, solid: false, scale: 0.55, tint: 0xa8d27a },
    { key: 'prop_bush', tx: 23, ty: 19, solid: false, scale: 0.5, tint: 0xb6d886 }, { key: 'prop_bush', tx: 17, ty: 12, solid: false, scale: 0.5, tint: 0xb6d886 },
    { key: 'prop_bush', tx: 28, ty: 12, solid: false, scale: 0.55, tint: 0xa8d27a }, { key: 'prop_bush', tx: 39, ty: 17, solid: false, scale: 0.6, tint: 0x9ac46e },

    // ---- signs (shop + trailhead waystone) ----
    { key: 'prop_sign', tx: 12, ty: 17, solid: true, text: 'PEM\'S GENERAL STORE — provisions, tools, and a fair price for honest folk. Bring coin or barter.' },     // Pem's Store sign
    { key: 'prop_sign', tx: 31, ty: 17, solid: true, text: 'THE COPPER TANKARD — ale, hearth, and a song. Rooms upstairs. Mind the step.' },     // the Tankard sign
    { key: 'prop_sign', tx: 25, ty: 6, solid: true, text: 'WAYSTONE — North: the foothill road to the Sundered Peaks (the way is barred until the Marsh\'s truth is borne). West: the Ashen Marsh.' },      // the WAYSTONE at the N trailhead

    // ---- the boundary DEPTH BAND (generated; walls every edge, 3 rows deep) ----
    ...depthBand(),
  ],

  // SECRETS — 3 rewarding hidden spots, tucked into the new layout's nooks.
  chests: [
    { id: 'chest_wood', tx: 5, ty: 33, gold: 40, line: 'Tucked in a hollow at the wood\'s edge, behind the brook — a small cache of coin. Forty gold!' },
    { id: 'chest_manor', tx: 45, ty: 9, gold: 25, line: "Behind the manor wall, half-buried — someone's hidden stash. Twenty-five gold." },
    { id: 'chest_tavern', tx: 32, ty: 14, gold: 15, line: 'Behind the Cracked Tankard, under a tarp — a publican\'s forgotten till. Fifteen gold.' },
  ],

  // THE CAST — in their districts; M1–M4 + hub side quests + the social system.
  npcs: [
    { tx: 22, ty: 17, facing: 'down', name: 'Mara', speed: 70, expression: 'happy', parts: MARA, quests: ['GH1', 'M1', 'M2'],
      done: ['Off you go then — and mind Old Edda, she\'s in a mood this morning.'],
      schedule: sched([['dawn', 20, 16, 'chat'], ['day', 22, 17, 'tend'], ['dusk', 24, 19, 'idle'], ['night', 24, 21, 'sleep']]) },
    { tx: 11, ty: 26, facing: 'down', name: 'Bram', childOnly: true, tempo: 'ambler', speed: 70, expression: 'neutral', parts: BRAM, greeting: [
      "There's my little terror — up early for once! The forge is hot if you've come to watch me work.",
    ],
      social: { start: 'shop', nodes: {
        shop: { speaker: 'Bram', text: "Grown now, and after steel. A good steel sword runs {price:steel_sword}g — and I price by the cut of a person, mind.",
          options: [
            { label: 'Buy the steel sword ({price:steel_sword}g)', set: 'buy:steel_sword', to: 'bought' },
            { label: 'Haggle him down', check: { type: 'persuade', dc: 6, onPass: 'haggled', onFail: 'refused', onPassDeed: 'haggled_bram' } },
            { label: '(Maybe later.)', end: true },
          ] },
        bought: { speaker: 'Bram', text: 'Mind the edge — it bites truer than your tongue.', options: [{ label: '(Take it.)', end: true }] },
        haggled: { speaker: 'Bram', text: "...Hah. Silver tongue on you. Fine — a few coins off, just this once.", options: [{ label: '(Pocket the saving.)', end: true }] },
        refused: { speaker: 'Bram', text: 'Nice try. The price is the price — earn a name first.', options: [{ label: '(Let it stand.)', end: true }] },
      } },
      schedule: sched([['dawn', 12, 25, 'idle'], ['day', 11, 26, 'hammer'], ['dusk', 13, 23, 'chat'], ['night', 15, 24, 'sleep']]) },
    { tx: 9, ty: 23, facing: 'right', name: 'Hodge', tempo: 'ambler', speed: 70, expression: 'neutral', parts: HODGE, quest: 'SG3',
      greeting: ['The forge runs hot all day. Come back when you\'ve hands for real work.'],
      greetByKarma: {   // REACTIVITY: Hodge warms to the kind, cools to the cruel
        good: ["There's a face the town's glad to see. Sit by the heat a while.", 'Heard what you did for folk. Steel\'s honest, and so are you.'],
        neutral: ['The forge runs hot all day. Come back when you\'ve hands for real work.'],
        bad: ['*sets down the hammer, eyes hard* ...State your business and move along.', 'I\'ve heard the talk about you. The door\'s that way.'],
      },
      bark: '*the ring of hammer on anvil*',
      topics: [
        { q: 'About your steel', a: [`"Folded a hundred times. A blade off my anvil outlasts the arm that swings it."`, `"Bram taught me the trade, years back. I have passed him now — best not tell him I said so."`] },
        { q: 'News of the town', a: [`"Quiet, mostly. Pem's prices creep up, the guards drink at the Tankard. Same as ever."`, `"There's an old cave up the north hills. Tam won't shut up about it. I'd leave it be."`] },
        { q: 'Any work?', a: [`"Bring me iron ore and I'll see you right. Or buy a sword and stop pestering me."`] },
      ],
      schedule: sched([['dawn', 9, 23, 'idle'], ['day', 9, 23, 'hammer'], ['dusk', 11, 22, 'chat'], ['night', 8, 26, 'sleep']]) },
    { tx: 25, ty: 18, facing: 'down', name: 'Tam', tempo: 'brisk', speed: 70, expression: 'happy', parts: TAM, quests: ['GH2'],   // item 3: M2 moved to Mara (its giver) — M2 opens with Mara's line, so Mara must be who you talk to
      greeting: ['Race you to the old cave! ...if your ma ever lets you off chores.'],
      topics: [
        { q: 'The old cave', a: [`"Up the north hills! It's BOARDED but there's a gap. Bet there's treasure. ...Or a bear."`] },
        { q: 'Your friends', a: [`"Nettle's fast but I'm FASTER. Wisp just hums all day. Boring."`] },
      ],
      schedule: sched([['dawn', 22, 16, 'idle'], ['day', 25, 18, 'chat'], ['dusk', 28, 21, 'idle'], ['night', 28, 22, 'sleep']]) },
    { tx: 15, ty: 16, facing: 'down', name: 'Phil McCracken', speed: 70, expression: 'neutral', parts: PHIL, quest: 'M3',
      greeting: ['Coin\'s coin, friend. Mind you don\'t lose any.'],
      schedule: sched([['dawn', 15, 16, 'tend'], ['day', 15, 16, 'tend'], ['dusk', 17, 18, 'chat'], ['night', 16, 18, 'sleep']]) },
    // MAREN — an ailing elder (GH2 "Nobody Answered"); the kids' gran. Static near her door, frail. After
    // GH2 she's on the mend (a warmer line). Reuses the elder-woman skin; her grandkids are the GH2 givers.
    { tx: 36, ty: 14, facing: 'down', name: 'Maren', adultOnly: true, speed: 0, expression: 'sad', parts: ['body_fem', 'head_fem', 'brows_chestnut', 'hair_parted_gray', 'shirt_maroon', 'pants_brown', 'shoes_brown_fem'],   // item 6: distinct from Mara (was MARA's skin)
      schedule: sched([['dawn', 36, 14, 'sleep'], ['day', 36, 14, 'sleep'], ['dusk', 36, 14, 'sleep'], ['night', 36, 14, 'sleep']]),   // bedridden/frail — static (not a wandering villager)
      greetByKarma: {
        good: ["The kids tell everyone how you came when no one answered. ...Bless you, love. I'll not forget it."],
        neutral: ["*a thin, tired smile* I'm on the mend, thanks to that fenwort. The young ones were so frightened."],
        bad: ["...You're the one who put my door through, they say. A sick old woman's door. Mind how you go."] } },
    // BRACKEN — the orchard-keeper (GH3 "Teeth in the Orchard"). Weathered, proud of his trees.
    { tx: 40, ty: 28, facing: 'down', name: 'Bracken', adultOnly: true, tempo: 'ambler', speed: 64, expression: 'neutral', parts: PHIL, quest: 'GH3',
      greeting: ['Forty years I\'ve kept this orchard. Never seen the like of what\'s in the back rows now.'],
      greetByKarma: {
        good: ["The orchard's yours to walk any time — you earned it, going in there. Take an apple, go on."],
        neutral: ['Quiet in the back rows now, thanks to you. Take an apple if you\'re passing.'],
        bad: ['*keeps the billhook where he can reach it* ...The orchard\'s cleared. We\'re square. Move along.'] },
      schedule: sched([['dawn', 40, 28, 'tend'], ['day', 40, 28, 'tend'], ['dusk', 42, 30, 'idle'], ['night', 42, 31, 'sleep']]) },
    // ACOLYTE — tends the chapel ward (GH4 "The Boarded Cave"); uneasy, devout, relents once you've earned it.
    { tx: 18, ty: 12, facing: 'down', name: 'Acolyte', adultOnly: true, tempo: 'normal', speed: 60, expression: 'neutral', parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_plum', 'pants_black', 'shoes_brown'], quest: 'GH4',   // item 6: distinct robed acolyte (was MARA's skin)
      greeting: ['The Flame keep you. ...The boards on the old cave stay up. Tradition. Don\'t ask me why; I only tend the ward.'],
      greetByKarma: {
        good: ['You\'ve done right by Greenhollow. ...What you found down there — I think of it every time I tend the ward. Thank you for telling me.'],
        neutral: ['The Flame keep you. ...Whatever you saw beneath us, you carry it well.'],
        bad: ['*will not meet your eye* ...You went down there and you took from it. From a SHRINE. The Flame sees, even when I look away.'] },
      schedule: sched([['dawn', 18, 12, 'tend'], ['day', 18, 12, 'tend'], ['dusk', 19, 13, 'idle'], ['night', 19, 14, 'sleep']]) },
    { tx: 30, ty: 18, facing: 'up', name: 'Fatley', tempo: 'dawdler', speed: 70, expression: 'neutral', parts: FATLEY, quest: 'SG1',
      greeting: ['*hic* Oi. You. ...nah, later. Me back\'s gone.'],
      schedule: sched([['dawn', 30, 18, 'idle'], ['day', 30, 18, 'chat'], ['dusk', 30, 18, 'chat'], ['night', 29, 18, 'idle']]) },   // the drunk never leaves the tavern
    { tx: 26, ty: 11, facing: 'down', name: 'Pem', tempo: 'brisk', speed: 70, expression: 'happy', parts: PEM, quest: 'SG2',
      greeting: ['*grins* You didn\'t see me. PEM WOZ ERE, though. Always.'],
      schedule: sched([['dawn', 26, 11, 'idle'], ['day', 32, 12, 'idle'], ['dusk', 24, 13, 'chat'], ['night', 27, 10, 'idle']]) },   // item 4: day-post off the fountain (NE edge) to thin the plaza
    // KIDS — PROTECTED (unharmable/untargetable, hard rule). Smaller villager skins (proper child art = a
    // deferred ULPC fetch). Playful, with interconnection lines (they talk about the grown-ups).
    { tx: 23, ty: 14, facing: 'down', name: 'Nettle', childOnly: true, tempo: 'brisk', speed: 78, scale: 0.95, kid: true, protected: true, expression: 'happy', parts: ['child_body_tan_green', 'child_head', 'brows_chestnut', 'hair_blond'],   // L1: clothed child body
      greeting: ["Betcha can't catch me! ...Mum says don't bother Hodge when his hammer's going.", "I helped Pem stack the apples. She gave me one for it!"],
      bark: 'Last one to the chapel\'s a rotten egg!',
      schedule: sched([['dawn', 23, 17, 'idle'], ['day', 18, 20, 'chat'], ['dusk', 17, 19, 'chat'], ['night', 34, 25, 'sleep']]) },   // item 4: plays the SW plaza edge by day (off the fountain), the cottage at night
    { tx: 27, ty: 17, facing: 'down', name: 'Wisp', childOnly: true, tempo: 'ambler', speed: 74, scale: 0.95, kid: true, protected: true, expression: 'happy', parts: ['child_body_blue', 'child_head', 'brows_chestnut', 'hair_chestnut'],   // L1: clothed child   // item 2: real child body   // item 2: was MARA's exact skin at 0.7 = a "mini-Mara"; now a distinct chestnut/blue child
      greeting: ["Are you a knight? You walk like a knight.", "Old Fatley sleeps in the tavern. Mum says don't grow up like Fatley."],
      bark: '*humming a little tune*',
      schedule: sched([['dawn', 27, 17, 'idle'], ['day', 31, 21, 'chat'], ['dusk', 30, 19, 'idle'], ['night', 34, 25, 'sleep']]) },   // item 4: plays the SE plaza edge by day (off Tam + the fountain)
    // THE GUARD PAIR (role: patrol route + post). Garrick walks a patrol (phase positions); Bess holds the
    // gate post. They confront a player carrying an unpaid FINE (witnessed break-in / occupied-home entry).
    { tx: 20, ty: 22, facing: 'down', name: 'Garrick', role: 'guard', tempo: 'normal', speed: 72, expression: 'neutral', parts: GUARD,
      greeting: ['Keep the peace and we\'ll have no trouble, you and I.', 'Quiet shift. The way I like it.'],
      bark: '*the creak of a leather belt and a slow patrol step*',
      topics: [
        { q: 'The watch', a: [`"Two of us hold Greenhollow — me on the walk, Bess on the gate. It's enough, most days."`] },
        { q: 'Any trouble?', a: [`"Break a door or barge into a home and I'll have a fine off you. Pay it and we're square."`, `"Keep your hands to yourself and your coin's your own. Simple as that."`] },
        { q: 'The gate', a: [`"Bess won't let a soul past she doesn't like the look of. Stern, that one. Good at it."`] },
      ],
      schedule: sched([['dawn', 16, 20, 'idle'], ['day', 24, 16, 'idle'], ['dusk', 30, 20, 'chat'], ['night', 20, 24, 'idle']]) },   // patrol = moves post by phase
    { tx: 22, ty: 27, facing: 'up', name: 'Bess', role: 'guard', tempo: 'normal', speed: 70, expression: 'neutral', parts: GUARD,
      greeting: ['The gate\'s mine to watch. Move along, now.'],
      bark: '*stands the post, eyes on the road*',
      schedule: sched([['dawn', 22, 27, 'idle'], ['day', 22, 27, 'idle'], ['dusk', 22, 27, 'idle'], ['night', 22, 27, 'idle']]) },   // gate post (static)
    // REMAINING ROLES — farmer (edge field, till loop), wood-chopper (ambient), the joiner (named presence).
    { tx: 10, ty: 34, facing: 'down', name: 'Ada', role: 'farmer', tempo: 'ambler', speed: 66, expression: 'neutral', parts: ['body_deep', 'head_deep', 'brows_chestnut', 'hair_black', 'shirt_amber', 'pants_brown', 'shoes_brown_fem'],
      greeting: [`The soil here is good, if you mind it. Mind it I do.`],
      greetByDeed: [   // sys 5 — the Fable trick: Ada remembers the runaway hen from when you were small
        { deed: 'chicken_helped', lines: [`You caught my Henrietta gentle, years back — a child then. I've not forgotten a kindness. Anything you need, you ask.`] },
        { deed: 'chicken_kicked', lines: [`*her eyes go flat* I know you. You booted my hen when you were a brat. A grown face on the same mean streak. ...What do you want.`] },
      ],
      bark: '*the scrape of a hoe through soil*',
      schedule: sched([['dawn', 10, 34, 'till'], ['day', 12, 35, 'till'], ['dusk', 14, 33, 'idle'], ['night', 13, 31, 'sleep']]) },
    { tx: 8, ty: 28, facing: 'right', name: 'Cob', role: 'chopper', tempo: 'normal', speed: 68, expression: 'neutral', parts: ['body_tan', 'head_tan', 'brows_chestnut', 'hair_auburn', 'shirt_forest', 'pants_brown', 'shoes_brown'],
      greeting: [`*thunk* ...Firewood does not split itself, friend.`],
      greetByDeed: [   // sys 5 — Cob remembers the child who said hello round the square
        { deed: 'greeted_warmly', lines: [`*thunk* ...You're the one who used to wave at everyone, small and grinning. Grew up alright, looks like. Good.`] },
      ],
      bark: '*thunk — the steady fall of an axe*',
      schedule: sched([['dawn', 8, 28, 'chop'], ['day', 8, 28, 'chop'], ['dusk', 10, 27, 'chat'], ['night', 9, 25, 'idle']]) },
    { tx: 16, ty: 25, facing: 'down', name: 'Mason', role: 'joiner', tempo: 'ambler', speed: 70, expression: 'neutral', parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_auburn', 'shirt_teal', 'pants_black', 'shoes_brown'],
      greeting: [`A joiner is never short of work in a town with rough hands.`],
      topics: [
        { q: 'Your trade', a: [`"Doors, shutters, a coffin now and then. I mend what folk break — and they break plenty."`] },
        { q: 'Broken doors', a: [`"Someone forces a door, I am the one called to board it up and hang it true. Keeps me in bread."`] },
      ],
      bark: '*the rasp of a plane over wood*',
      schedule: sched([['dawn', 16, 25, 'idle'], ['day', 16, 25, 'hammer'], ['dusk', 18, 24, 'chat'], ['night', 17, 23, 'idle']]) },
  ],

  player: { tx: 22, ty: 19, facing: 'up', speed: 95, expression: 'neutral', parts: HERO },

  base: HERO,
  maraParts: MARA, bramParts: BRAM,
  hodgeParts: HODGE, tamParts: TAM, philParts: PHIL, fatleyParts: FATLEY, pemParts: PEM,
};
