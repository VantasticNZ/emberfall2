// buildingDoorTrigger — locks the building-entry decision (regression: the facing gate CONSUMED the trigger,
// so once a player arrived at a threshold not perfectly facing the door, NO building could be entered).
// The combined table Van asked for: open walk-in ENTERS, closed/locked walk-in PROMPTS, walk-past does
// NEITHER, and an off-axis arrival that then faces the door still works (no consume).

import assert from 'node:assert';
import { buildingDoorTrigger } from './doorTrigger.js';

const T = 32;
// a door on tile (10,10); the painted doorway sits `dy` px from the threshold-tile centre (negative = above).
const door = (state, dy = -40, dx = 0) => ({ tx: 10, ty: 10, state, to: 'INT', dcx: 10 * T + T / 2, dcy: 10 * T + T / 2, doorWX: 10 * T + T / 2 + dx, doorWY: 10 * T + T / 2 + dy });

// ON the threshold, FACING the doorway (up) → enter (open) / prompt (closed, locked).
assert.equal(buildingDoorTrigger([door('open')], 10, 10, 'up', T).action, 'enter', 'open + facing door → enter');
assert.equal(buildingDoorTrigger([door('none')], 10, 10, 'up', T).action, 'enter', 'none(open) + facing door → enter');
assert.equal(buildingDoorTrigger([door('closed')], 10, 10, 'up', T).action, 'prompt', 'closed + facing door → prompt');
assert.equal(buildingDoorTrigger([door('locked')], 10, 10, 'up', T).action, 'prompt', 'locked + facing door → prompt');

// WALKING PAST: on the tile but facing along the wall → wait (never enter/prompt).
assert.equal(buildingDoorTrigger([door('open')], 10, 10, 'right', T).action, 'wait', 'facing along wall → wait, not enter');
assert.equal(buildingDoorTrigger([door('closed')], 10, 10, 'left', T).action, 'wait', 'closed + facing along wall → wait, not prompt');
assert.equal(buildingDoorTrigger([door('open')], 10, 10, 'down', T).action, 'wait', 'facing away → wait');

// NOT on a door tile → none.
assert.equal(buildingDoorTrigger([door('open')], 11, 10, 'up', T).action, 'none', 'off the threshold → none');

// THE REGRESSION: a mismatch returns 'wait' (caller must NOT consume) — then facing the door on the SAME tile
// enters. (Before the fix this path consumed the trigger and the player was stranded.)
const d = [door('open')];
assert.equal(buildingDoorTrigger(d, 10, 10, 'left', T).action, 'wait', 'arrive off-axis → wait');
assert.equal(buildingDoorTrigger(d, 10, 10, 'up', T).action, 'enter', 'then face the door (same tile) → enter');

// doorDir is derived from geometry: a doorway painted to the LEFT is entered by facing left, not up.
assert.equal(buildingDoorTrigger([door('open', 0, -40)], 10, 10, 'left', T).action, 'enter', 'left-painted doorway → enter by facing left');

console.log('buildingDoorTrigger: open enters, closed/locked prompt, walk-past waits, off-axis recovers (no consume) ✓');
