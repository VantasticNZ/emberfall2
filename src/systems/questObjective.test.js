// questObjective — locks the PURE objective-resolution engine (SPEC-CHILDHOOD §4): reach/interact/talk
// satisfaction, the within-radius test, current-step lookup, and the arrow-target resolution (location vs NPC).

import assert from 'node:assert';
import { stepObjective, withinObjective, objectiveSatisfied, objectiveArrowTarget } from './questObjective.js';

// a quest def with a physical objective on step 1
const def = { steps: [
  { id: 'a', desc: 'talk' },
  { id: 'b', desc: 'go to the coop', objective: { type: 'reach', tx: 10, ty: 20 } },
  { id: 'c', desc: 'open the pen', objective: { type: 'interact', tx: 14, ty: 20, range: 0 } },
] };

// stepObjective — only the step that has one
assert.equal(stepObjective(def, 0), null, 'step 0 has no objective');
assert.deepEqual(stepObjective(def, 1).target ?? stepObjective(def, 1).type, 'reach', 'step 1 reach objective');
assert.equal(stepObjective(def, 2).type, 'interact', 'step 2 interact objective');
assert.equal(stepObjective({ steps: [] }, 0), null, 'no steps -> null');

// withinObjective — radius default 1
const reach = stepObjective(def, 1);
assert.equal(withinObjective(reach, 10, 20), true, 'on the tile -> within');
assert.equal(withinObjective(reach, 11, 21), true, 'within default range 1 (diagonal)');
assert.equal(withinObjective(reach, 12, 20), false, 'beyond range 1 -> not within');

// objectiveSatisfied — reach needs only position; interact needs the pulse + (range 0) exact tile
assert.equal(objectiveSatisfied(reach, 10, 20), true, 'reach: standing there satisfies');
assert.equal(objectiveSatisfied(reach, 12, 20), false, 'reach: too far -> not satisfied');
const inter = stepObjective(def, 2);
assert.equal(objectiveSatisfied(inter, 14, 20, false), false, 'interact: in range but no pulse -> no');
assert.equal(objectiveSatisfied(inter, 14, 20, true), true, 'interact: in range + pulse -> yes');
assert.equal(objectiveSatisfied(inter, 15, 20, true), false, 'interact: pulse but off the tile (range 0) -> no');
assert.equal(objectiveSatisfied(null, 0, 0, true), false, 'no objective -> never satisfied');

// objectiveArrowTarget — a location objective wins; else the NPC; else nothing
assert.deepEqual(objectiveArrowTarget(reach, true), { kind: 'loc', tx: 10, ty: 20 }, 'location objective -> point at the tile');
assert.deepEqual(objectiveArrowTarget(null, true), { kind: 'npc' }, 'no objective but a giver -> point at the NPC');
assert.equal(objectiveArrowTarget(null, false), null, 'nothing to point at -> null');

console.log('questObjective — ALL CHECKS PASSED ✅');
