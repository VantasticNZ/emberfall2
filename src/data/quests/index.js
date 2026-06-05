// =============================================================================
// QUEST DATA  —  quests are DATA, not code (Bible Part 0 #2). The QuestEngine
// (src/systems/QuestEngine.js) runs whatever quest definitions it is given;
// real content lives here, separate from the engine.
//
// QUEST SCHEMA (one object per quest):
//   id        : unique string ('M1', 'SG4', ...)
//   title     : display name
//   region    : 'Greenhollow' | 'Ashen Marsh' | ...
//   act       : 1 | 2 | 3
//   type      : 'main' | 'side' | 'dungeon' | 'job' | 'twist' | 'boss' | 'finale' | ...
//   tone      : freeform tonal tag
//   perm      : true if it contains a PERMANENT decision (Bible: choices stick)
//   requires  : availability gate (ALL must hold), all optional:
//                 { quests:[ids must be complete], deeds:[must exist],
//                   notDeeds:[must NOT exist], karma:{morality:{min,max},purity:{min,max}} }
//   steps     : [{ id, desc }]  ordered objectives (optional)
//   unlocks   : [ids] made available when THIS quest completes
//   locks     : [ids] pruned (locked-out) when THIS quest completes
//   reward    : { gold, xp, items:[], skill, ... } granted on complete (Gate F; data)
//   choices   : decision points —
//      { id, label, impact:'good'|'neutral'|'dark',
//        karma:{morality,purity}, deed:'id_to_record', meta:{},
//        unlocks:[ids], locks:[ids], ending:'W|S|T|L|A (or -lean/-hint)',
//        note:'story-impact text' }
//   dialogue  : optional minimal node graph (see src/systems/Dialogue.js)
//
// The schema can represent everything in docs/QUEST-DATA.json — see fromDesign().
// =============================================================================

// The live quest registry. Greenhollow's Act 1 childhood is the first content;
// more regions append here as they are authored (all as DATA).
import { GREENHOLLOW_CHILDHOOD } from './greenhollow.js';
export { GREENHOLLOW_CHILDHOOD };
export const QUESTS = [...GREENHOLLOW_CHILDHOOD];

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// How many karma points one design symbol (+M / -P) is worth.
export const KARMA_UNIT = 10;

// Parse a docs/QUEST-DATA.json compact karma string ("+M-P deed:chicken_kicked")
// into structured { karma:{morality,purity}, deed }.
export function parseDesignKarma(s = '') {
  let morality = 0, purity = 0;
  const re = /([+-])\s*([MP])/g; let x;
  while ((x = re.exec(s))) {
    const v = (x[1] === '+' ? 1 : -1) * KARMA_UNIT;
    if (x[2] === 'M') morality += v; else purity += v;
  }
  const deed = (s.match(/deed:([a-z0-9_]+)/i) || [])[1] || null;
  return { karma: { morality, purity }, deed };
}

// Convert a docs/QUEST-DATA.json-style quest (compact strings) -> engine schema.
export function fromDesign(q) {
  return {
    id: q.id, title: q.title, region: q.region, act: q.act, type: q.type,
    tone: q.tone || '', perm: !!q.perm,
    requires: q.requires || {},
    unlocks: q.unlocks || [], locks: q.locks || [], reward: q.reward || {},
    choices: (q.choices || []).map((c) => {
      const k = parseDesignKarma(c.karma);
      return {
        id: c.id || slug(c.label),
        label: c.label, impact: c.impact || 'neutral',
        karma: k.karma, deed: k.deed, meta: {},
        unlocks: c.unlocks || [], locks: c.locks || [],
        ending: c.ending || '', note: c.story || '',
      };
    }),
  };
}
