// =============================================================================
// CAMEOS / EASTER-EGGS / EDGE-TONE encounters, authored as DATA on the existing
// engines. Optional spice peppered across the regions — Emberfall's full mix:
// wholesome, cheeky/innuendo (witty, never explicit, never minors), and clever.
// Cameos are clearly-FICTIONAL pastiches (evoke the figure, never claim the real
// person). Each carries its region + a `requires` gate so it shows up in the
// right place. Canonical deed-ids; Gate D (no item-in-front) throughout.
// =============================================================================

export const CAMEOS = [
  // CAM1 — The Cynic in the Marble Hall (Diogenes pastiche). A reason to enter a
  // noble's mansion; a barefoot barrel-dweller spits in the finest hall, then
  // reappears at the market wanting you out of his sunlight. Witty philosophy.
  {
    id: 'CAM1', title: 'The Cynic in the Marble Hall', region: 'Sundered Peaks', act: 2,
    type: 'side', tone: 'funny/clever', perm: false,
    requires: { quests: ['M11'] },
    reward: {},
    steps: [
      { id: 'mansion', desc: "Visit Lord Pellamy's marble hall on an errand." },
      { id: 'market', desc: 'Cross paths with the barrel-cynic once more, at the market.' },
    ],
    choices: [
      { id: 'amused', label: 'Laugh with the cynic', impact: 'neutral',
        karma: {}, deed: 'cynic_met', ending: '',
        note: 'You take his point, and his side; a sharp little lesson, freely given.' },
      { id: 'offended', label: 'Take the host\'s side', impact: 'neutral',
        karma: {}, deed: 'cynic_dismissed', ending: '',
        note: 'You side with the marble and the manners; the dog in the barrel only grins.' },
    ],
    dialogue: { start: 'mansion', nodes: {
      mansion: { speaker: 'Lord Pellamy', text:
        "Welcome to my hall — Tidewreck marble, every slab, and that fresco cost a fishing fleet— " +
        "*a barefoot old man in a literal barrel hawks and SPITS, deliberately, onto the lord's pristine " +
        "floor* — DIOGO! You filthy hound! Why there?!",
        options: [ { label: '(...why there?)', to: 'spit' } ] },
      spit: { speaker: 'Diogo the Barrel', text:
        "I looked the whole hall over for the most worthless place to spit, friend, and everything else " +
        "was so VERY expensive — the floor, the fresco, his lordship's smile — that the only thing cheap " +
        "enough to deserve it... was his lordship's face. *he beams* A man owns nothing he can't carry. " +
        "Everything else owns HIM. Now — what do YOU make of that?",
        options: [
          { label: '(Laugh. He has a point.)', choice: { quest: 'CAM1', id: 'amused' }, to: 'market' },
          { label: '(Side with your host. Manners cost nothing.)', choice: { quest: 'CAM1', id: 'offended' }, to: 'market' },
        ] },
      market: { speaker: 'Diogo the Barrel', text:
        "*weeks on, you find him sunning himself against a market wall in his barrel* You again. Yes, yes, " +
        "you can stand there and gawp. But could you do one thing for an old dog? *he squints up* You're " +
        "standing in my sunlight. That's the only thing you've got that I actually want. Kindly move.",
        options: [ { label: '(Step out of his light, grinning.)', end: true } ] },
    } },
  },

  // CAM2 — The Stone That Won't Stay (Sisyphus pastiche). A man eternally rolling
  // a boulder uphill, oddly at peace. Help push (it rolls back anyway). A wry
  // note on meaning in the doing, not the done.
  {
    id: 'CAM2', title: "The Stone That Won't Stay", region: 'Greenhollow', act: 2,
    type: 'side', tone: 'reflective/funny', perm: false,
    requires: { quests: ['M7'] },
    reward: {},
    steps: [ { id: 'hill', desc: 'Meet the man forever rolling a boulder up the Greenhollow hill.' } ],
    choices: [
      { id: 'push', label: 'Help him push (it rolls back anyway)', impact: 'good',
        karma: { morality: 5 }, deed: 'stone_pushed', ending: '',
        note: 'You shove the boulder up; it rolls back; he thanks you warmly all the same.' },
      { id: 'ask', label: 'Ask how he stands it', impact: 'neutral',
        karma: {}, deed: 'stone_pondered', ending: '',
        note: 'He gives you the only answer that ever worked: the climb is the point.' },
    ],
    dialogue: { start: 'hill', nodes: {
      hill: { speaker: 'Old Sisyph', text:
        "*heaving a great round stone up the slope; it nears the top, wobbles, and thunders all the way " +
        "back down. He sighs, cracks his back, and trudges down after it, whistling* Morning! Don't mind " +
        "me. Forty years on this hill, this stone and I.",
        options: [ { label: "(...doesn't that drive you mad?)", to: 'why' } ] },
      why: { speaker: 'Old Sisyph', text:
        "Mad? *he laughs* Used to. Then I worked it out: the stone's never going to STAY up there. Never. " +
        "So the top was never the point. The point's the push — the burn in your legs, the sky getting " +
        "wider, this daft good whistle in your teeth. Find the joy in the rolling, friend, or the rolling " +
        "finds the misery in you. Lend a shove?",
        options: [
          { label: '(Put your shoulder to it.)', choice: { quest: 'CAM2', id: 'push' }, end: true },
          { label: '(Just sit, and learn the trick of it.)', choice: { quest: 'CAM2', id: 'ask' }, end: true },
        ] },
    } },
  },

  // CAM3 — The Short General (Napoleon-height myth-bust, comic). A tiny grandiose
  // general who, when mocked, indignantly proves he was AVERAGE height — a real
  // myth played for laughs.
  {
    id: 'CAM3', title: 'The Short General', region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'funny/clever', perm: false,
    requires: { quests: ['M13'] },
    reward: {},
    steps: [ { id: 'tavern', desc: 'Meet the diminutive General holding court in the Saltbreak tavern.' } ],
    choices: [
      { id: 'mock', label: 'Mock his height', impact: 'neutral',
        karma: {}, deed: 'general_met', ending: '',
        note: 'You poke the bear; the bear delivers a furious, fact-based rebuttal.' },
      { id: 'salute', label: 'Salute him gravely', impact: 'neutral',
        karma: {}, deed: 'general_saluted', ending: '',
        note: 'You play it straight; he is delighted, and stands you a drink (on a stool).' },
    ],
    dialogue: { start: 'tavern', nodes: {
      tavern: { speaker: 'General Petibon', text:
        "*a very small man on a very tall chair, one hand tucked in his coat* AH. A new recruit for my " +
        "campaigns! Sit, sit — below me, obviously, everyone is below me, STRATEGICALLY speaking.",
        options: [
          { label: '("Below you isn\'t hard, little General.")', choice: { quest: 'CAM3', id: 'mock' }, to: 'rant' },
          { label: '("An honour, General." (Salute.))', choice: { quest: 'CAM3', id: 'salute' }, to: 'drink' },
        ] },
      rant: { speaker: 'General Petibon', text:
        "SHORT?! *he stands on the chair* I am FIVE FOOT SEVEN, sir — perfectly, gloriously AVERAGE for " +
        "my day! It is ENEMY SLANDER! They measured me in their OWN crooked inches, longer than honest " +
        "inches, and called it history! A whole legend, built on a CONVERSION ERROR! I am not short. I am " +
        "HISTORICALLY MISREPRESENTED. *sits, vindicated* ...Now. To war.",
        options: [ { label: '(He is, annoyingly, correct.)', end: true } ] },
      drink: { speaker: 'General Petibon', text:
        "A soul of TASTE! *he snaps for wine and clambers a stool to clink your cup* You'll go far, recruit. " +
        "Not UP, particularly — that's overrated — but FAR. To the campaign!",
        options: [ { label: '(Drink with the little General.)', end: true } ] },
    } },
  },

  // CAM4 — Stardust (Carl-Sagan-style wonder). A dreamy star-gazer on the marsh
  // at night: you are made of the same stuff as the stars. A genuine wonder beat.
  {
    id: 'CAM4', title: 'Stardust', region: 'Ashen Marsh', act: 2,
    type: 'side', tone: 'heartfelt/wonder', perm: false,
    requires: { quests: ['M8'] },
    reward: {},
    steps: [ { id: 'stars', desc: 'Sit with the star-counter over the black water on a clear night.' } ],
    choices: [
      { id: 'listen', label: 'Listen, and look up', impact: 'good',
        karma: { purity: 5 }, deed: 'stardust', ending: '',
        note: 'A quiet, real wonder amid all the mud and screaming — you carry it a while.' },
      { id: 'scoff', label: 'Scoff and walk on', impact: 'neutral',
        karma: {}, deed: 'stardust_refused', ending: '',
        note: 'You leave him to his stars; the cold marsh has work in it.' },
    ],
    dialogue: { start: 'stars', nodes: {
      stars: { speaker: 'Old Karl', text:
        "*flat on his back on a dry hummock, counting* Sit. You're missing it. ...You know the iron in " +
        "your blood? The salt in your tears, the very lime in your bones? Every scrap of it was forged in " +
        "the belly of a dying star, an age before this sad wet world ever cooled.",
        options: [ { label: '(...go on.)', to: 'wonder' } ] },
      wonder: { speaker: 'Old Karl', text:
        "You are not a small thing standing UNDER the stars, friend. You are made OF them — old starlight, " +
        "cooled and stood up and given a name and a bad week. The universe grew you so it could have eyes, " +
        "and a look at itself. *he grins in the dark* Now. Isn't THAT worth one cold night on a marsh?",
        options: [
          { label: '(Lie back. Look up. Let it land.)', choice: { quest: 'CAM4', id: 'listen' }, end: true },
          { label: "(Pretty words. There's work to do.)", choice: { quest: 'CAM4', id: 'scoff' }, end: true },
        ] },
    } },
  },

  // CAM5 — The Wanderer Out of Time (rare-spawn time-traveller). Anachronistic
  // talk + a gadget; funny exchanges; a quirky reward + a cryptic line. Gated on
  // a rare spawn flag the game sets occasionally (`spawn_wanderer`).
  {
    id: 'CAM5', title: 'The Wanderer Out of Time', region: 'roaming', act: 2,
    type: 'twist', tone: 'mystery/fun', perm: false,
    requires: { deeds: ['spawn_wanderer'] },   // rare random spawn flag (set by the world)
    reward: { items: ['humming_trinket'] },
    steps: [ { id: 'meet', desc: 'A baffled stranger in strange motley flags you down on the road.' } ],
    choices: [
      { id: 'help', label: 'Help the lost wanderer', impact: 'neutral',
        karma: {}, deed: 'wanderer_met', ending: '',
        note: 'You point him roughly homeward; he leaves you a humming trinket and a chill down your spine.' },
    ],
    dialogue: { start: 'meet', nodes: {
      meet: { speaker: 'The Wanderer', text:
        "Oh thank GOD, a person — is there signal here? Any signal at all? *waves a small glowing slab* No? " +
        "Nothing? What YEAR— no, don't, you'll only say something with 'winters' in it. *mutters* Calibration's " +
        "shot, dropped me a few hundred too far... is the big screaming fire-god still a thing here, or have " +
        "we done that bit yet?",
        options: [ { label: '("...the what?")', to: 'cryptic' } ] },
      cryptic: { speaker: 'The Wanderer', text:
        "Right, early days, forget I said it. *presses the humming slab into your hand* Here, it's dead " +
        "anyway, but it'll outlast you, which is more than most things. One bit of advice, friend, free of " +
        "charge: when the fire finally asks you what it is — and it WILL ask — tell it the truth. It " +
        "remembers who lied. *he steps sideways and is, impossibly, gone*",
        options: [ { label: '(Pocket the humming trinket. Shiver.)', choice: { quest: 'CAM5', id: 'help' }, end: true } ] },
    } },
  },

  // CAM6 — The Chill Prophet (a clearly-FICTIONAL party-prophet pastiche; NOT any
  // real religion's founder). Robes, sandals, loaves & wine, twelve adoring
  // devotees, 'ahhh-men', water-to-a-decent-drop, an open invitation. Warm + funny.
  {
    id: 'CAM6', title: 'The Chill Prophet', region: 'Emberwood', act: 2,
    type: 'side', tone: 'wholesome/funny', perm: false,
    requires: { quests: ['M15'] },
    reward: { buff: 'gladness' },
    steps: [ { id: 'feast', desc: 'Come upon a defiant roadside feast in the dying wood.' } ],
    choices: [
      { id: 'join', label: 'Join the party', impact: 'good',
        karma: { morality: 5 }, deed: 'prophet_blessed', meta: { buff: 'gladness' }, ending: '',
        note: 'You sit, you drink, you are blessed with simple gladness — a warm buff in a cold wood.' },
      { id: 'decline', label: 'Decline politely and move on', impact: 'neutral',
        karma: {}, deed: 'prophet_declined', ending: '',
        note: 'You wave off the wine and the warmth; he blesses you anyway, no hard feelings.' },
    ],
    dialogue: { start: 'feast', nodes: {
      feast: { speaker: 'Vinizar the Glad', text:
        "*a beaming fellow in dusty robes and sandals, reclining at a long table laden with bread and wine, " +
        "while twelve devotees fuss and refill and adore* A TRAVELLER! Sit, sit, there is always room, " +
        "there is always bread! *he dips a cup in plain water, swirls it, and it comes up a passable red* " +
        "Tah-DAH — a decent little drop, if I say so. Ahhh-men!",
        options: [ { label: '("...ahhh-men?")', to: 'invite' } ] },
      invite: { speaker: 'Vinizar the Glad', text:
        "Ahhh-men! It's like 'amen' but you MEAN it, with the whole chest. *a devotee dabs his brow; he " +
        "waves her off, delighted* Listen — the whole wood's burning and freezing and the world's ending, " +
        "probably, and you know what I say to that? I say pour another and pass the loaf. Misery's a choice, " +
        "friend, and I have chosen the OPPOSITE, loudly. Will you sit with us?",
        options: [
          { label: '(Sit. Drink. Be glad.)', choice: { quest: 'CAM6', id: 'join' }, end: true },
          { label: '(Smile, decline, walk on.)', choice: { quest: 'CAM6', id: 'decline' }, end: true },
        ] },
    } },
  },

  // CAM7 — Blow on the Pie (NZ easter-egg). Scoff a fresh meat pie, scald your
  // mouth; a deadpan constable delivers the immortal warning. Reward: a pie (heal).
  {
    id: 'CAM7', title: 'Blow on the Pie', region: 'Greenhollow', act: 2,
    type: 'side', tone: 'funny', perm: false,
    requires: { quests: ['M7'] },
    reward: { item: 'meat_pie', heals: true },
    steps: [ { id: 'pie', desc: 'Accept a fresh meat pie from the village baker.' } ],
    choices: [
      { id: 'lesson', label: 'Take the constable\'s sage advice', impact: 'neutral',
        karma: {}, deed: 'pie_lesson', ending: '',
        note: "You learn the hard truth of the fresh pie. He gives you one for the road (let it cool)." },
    ],
    dialogue: { start: 'pie', nodes: {
      pie: { speaker: '', text:
        "The baker presses a golden, fresh-from-the-oven meat pie into your hands. It smells incredible. " +
        "You, being a hero of action, immediately take an enormous bite. *a sound like a kettle. molten " +
        "mince. the roof of your mouth, gone.*",
        options: [ { label: '(GHHHK—)', to: 'constable' } ] },
      constable: { speaker: 'Constable Wiremu', text:
        "*ambling over, deadpan, hands behind his back* Eh. Yeah, nah. See, you've ALWAYS got to blow on " +
        "the pie. ALWAYS. That thing's been in the oven all day, ay — it's near thermonuclear. *hands you " +
        "another, wrapped in a cloth* Take this one. Let her cool. Safe travels, e hoa.",
        options: [ { label: '(Accept the pie. Blow on it. Learn.)', choice: { quest: 'CAM7', id: 'lesson' }, end: true } ] },
    } },
  },

  // EDG1 — The Midnight Raid (a panty-raid-style farce among ADULTS; innuendo,
  // never explicit). go along / nope out / turn it to chaos. Cheeky.
  {
    id: 'EDG1', title: 'The Midnight Raid', region: 'Tidewreck Coast', act: 2,
    type: 'twist', tone: 'funny/cheeky', perm: false,
    requires: { quests: ['M13'] },
    reward: {},
    steps: [ { id: 'dare', desc: 'The rowdy harbour crowd dares you on a midnight clothesline raid.' } ],
    choices: [
      { id: 'along', label: 'Go along with the dare', impact: 'neutral',
        karma: { purity: -5 }, deed: 'raid_joined', unlocks: ['rep:rowdy'], ending: '',
        note: 'You whip the Widow Gusset\'s smalls off the line; the crowd roars; your name is mud and legend both.' },
      { id: 'nope', label: 'Nope out of it', impact: 'neutral',
        karma: {}, deed: 'raid_declined', ending: '',
        note: 'You decline the dignity-ending dare; the crowd jeers, then forgets by morning.' },
      { id: 'chaos', label: 'Turn it into glorious chaos', impact: 'neutral',
        karma: {}, deed: 'raid_chaos', ending: '',
        note: 'You "raid" the constable\'s OWN washing instead; a goose is involved; the whole street wakes. Farce achieved.' },
    ],
    dialogue: { start: 'dare', nodes: {
      dare: { speaker: 'Big Sal', text:
        "*a barrel-shaped woman, half a barrel of ale in her* RIGHT. Initiation. Midnight. You nip up the " +
        "lane and nick one — ONE — pair of the Widow Gusset's enormous bloomers off her washing line and " +
        "run it up the harbour flagpole. It's TRADITION. Are you a Saltbreak soul, or a soft inland lamb?",
        options: [
          { label: '(For the crowd. For the bloomers. For GLORY.)', choice: { quest: 'EDG1', id: 'along' }, end: true },
          { label: "(Absolutely not. I have, somewhere, dignity.)", choice: { quest: 'EDG1', id: 'nope' }, end: true },
          { label: "(Counter-dare: raid the CONSTABLE's smalls instead.)", choice: { quest: 'EDG1', id: 'chaos' }, end: true },
        ] },
    } },
  },

  // EDG2 — Flowers for Someone (the WHOLESOME counterpoint, same region as EDG1).
  // Gather specific wildflowers across the meadow for a shy adult suitor. +M.
  {
    id: 'EDG2', title: 'Flowers for Someone', region: 'Tidewreck Coast', act: 2,
    type: 'side', tone: 'wholesome/heartfelt', perm: false,
    requires: { quests: ['M13'] },
    reward: {},
    steps: [
      { id: 'ask', desc: 'A shy fisher asks help gathering the right flowers.' },
      { id: 'gather', desc: 'Find sea-pinks, vetch, and one stubborn cliff-rose across the headland.' },
    ],
    choices: [
      { id: 'gather', label: 'Gather the flowers for the shy suitor', impact: 'good',
        karma: { morality: 10 }, deed: 'flowers_gathered', ending: '',
        note: 'A small, sweet, brave thing helped along — the gentle opposite of the harbour\'s nonsense.' },
      { id: 'decline', label: 'Leave them to it', impact: 'neutral',
        karma: {}, deed: 'flowers_declined', ending: '',
        note: 'You wish them luck; some braveries a person has to manage alone.' },
    ],
    dialogue: { start: 'ask', nodes: {
      ask: { speaker: 'Shy Fisher', text:
        "*scarlet to the ears* You— you're kind, aren't you, you look kind. There's someone. On the next " +
        "jetty. I've fancied them a YEAR and I've not the nerve to say a word, but I thought — flowers? " +
        "Proper ones, the headland sort they like — sea-pinks, the purple vetch, and a cliff-rose, if " +
        "you're brave enough for the ledge. Would you... help me pick the courage, sort of?",
        options: [
          { label: '(Of course. Let\'s gather them across the headland.)', choice: { quest: 'EDG2', id: 'gather' }, end: true },
          { label: '(This one\'s yours to do alone, friend.)', choice: { quest: 'EDG2', id: 'decline' }, end: true },
        ] },
    } },
  },

  // GAG1 — Roadside Wit (a couple of bawdy signpost / NPC one-liners in the
  // established rude-pun vein; witty, never explicit). Sparingly.
  {
    id: 'GAG1', title: 'Roadside Wit', region: 'Greenhollow', act: 2,
    type: 'side', tone: 'funny/cheeky', perm: false,
    requires: { quests: ['M7'] },
    reward: {},
    steps: [ { id: 'sign', desc: 'Read the crossroads signpost; trade words with the locals loitering by it.' } ],
    choices: [
      { id: 'wit', label: 'Trade quips with the loiterers', impact: 'neutral',
        karma: {}, deed: 'roadside_wit', ending: '',
        note: 'A few groan-worthy puns banked for the road; the crossroads remembers a good sport.' },
    ],
    dialogue: { start: 'sign', nodes: {
      sign: { speaker: '', text:
        "The crossroads signpost, freshly 'corrected' by persons unknown:  SALTBREAK 12mi (mind the " +
        "smugglers) — MIREFEN 8mi (mind the FROG) — and, scrawled beneath, 'TO NOWHERE IN PARTICULAR, by " +
        "order of the same nobody who minds the hens.' Two locals lean against it, grinning.",
        options: [ { label: '(Trade words with the pair.)', to: 'pair' } ] },
      pair: { speaker: 'Ben Dover', text:
        "*tipping his hat* Ben Dover, at your service — and this is my associate, Dixie Normous, who runs " +
        "the biggest stall at market and won't let you forget it. *Dixie elbows him* We mind this post. " +
        "Best job in the vale: all the directions, none of the walking. Headed anywhere fun, or just " +
        "everywhere slowly, like the rest of us?",
        options: [ { label: '(Swap a few groaners and move on.)', choice: { quest: 'GAG1', id: 'wit' }, end: true } ] },
    } },
  },

  // NIGHT1 — Things in the Dark (DAY/NIGHT example hook: a night-only encounter).
  // Proves a quest can gate on a phase via the requires-pattern (requires.phase),
  // with a TimeOfDay wired into the QuestEngine. Locked by day, open at night.
  {
    id: 'NIGHT1', title: 'Things in the Dark', region: 'Ashen Marsh', act: 2,
    type: 'twist', tone: 'eerie', perm: false,
    requires: { quests: ['M8'], phase: 'night' },   // ONLY available at NIGHT
    reward: {},
    steps: [ { id: 'dark', desc: 'Something wades the black water — only after dark.' } ],
    choices: [
      { id: 'face', label: 'Face the thing in the dark', impact: 'neutral',
        karma: {}, deed: 'night_thing_met', ending: '',
        note: 'A bog-wraith that only walks by night; gone by dawn.' },
    ],
    dialogue: { start: 'dark', nodes: {
      dark: { speaker: '', text:
        "By day the black water is just black water. But after dark, when the mist comes up, something " +
        "wades out of it that the bog-folk will not name — and is never, ever there by morning.",
        options: [ { label: '(Face it while the night holds.)', choice: { quest: 'NIGHT1', id: 'face' }, end: true } ] },
    } },
  },
];
