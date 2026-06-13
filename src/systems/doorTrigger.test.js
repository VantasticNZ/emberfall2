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
assert.equal(buildingDoorTrigger([door('open')], 11, 10, 'up', T).action, 'none', 'off the threshold (to the side) → none');

// RESPONSIVE ENTRY: the APPROACH tile (one tile back from an up-door = below it) + facing the door → enter,
// so you don't need a pixel-perfect threshold landing. Wrong facing on the approach still WAITS (no false entry).
assert.equal(buildingDoorTrigger([door('open')], 10, 11, 'up', T).action, 'enter', 'approach tile + facing door → enter (forgiving)');
assert.equal(buildingDoorTrigger([door('open')], 10, 11, 'right', T).action, 'wait', 'approach tile + facing along → wait (no false entry walking past)');
assert.equal(buildingDoorTrigger([door('open')], 10, 12, 'up', T).action, 'none', 'two tiles back → none (only threshold + one approach)');
for (const o of [{ dy: -40, dx: 0, face: 'up', ax: 10, ay: 11 }, { dy: 40, dx: 0, face: 'down', ax: 10, ay: 9 }, { dy: 0, dx: -40, face: 'left', ax: 11, ay: 10 }, { dy: 0, dx: 40, face: 'right', ax: 9, ay: 10 }]) {
  assert.equal(buildingDoorTrigger([door('open', o.dy, o.dx)], o.ax, o.ay, o.face, T).action, 'enter', `approach (${o.ax},${o.ay}) + facing ${o.face} → enter`);
}

// THE REGRESSION: a mismatch returns 'wait' (caller must NOT consume) — then facing the door on the SAME tile
// enters. (Before the fix this path consumed the trigger and the player was stranded.)
const d = [door('open')];
assert.equal(buildingDoorTrigger(d, 10, 10, 'left', T).action, 'wait', 'arrive off-axis → wait');
assert.equal(buildingDoorTrigger(d, 10, 10, 'up', T).action, 'enter', 'then face the door (same tile) → enter');

// doorDir is derived from geometry: a doorway painted to the LEFT is entered by facing left, not up.
assert.equal(buildingDoorTrigger([door('open', 0, -40)], 10, 10, 'left', T).action, 'enter', 'left-painted doorway → enter by facing left');

// FULL ORIENTATION MATRIX (regression guard): the facing-derivation must hold for ALL 4 door orientations,
// not just up — a side- or bottom-fronting building's door is its own escape class. For each orientation,
// the CORRECT facing enters and a WRONG facing WAITS (never consumes). dy/dx pick where the doorway is painted.
const orient = [
  { name: 'up',    dy: -40, dx: 0,   face: 'up',    wrong: 'down' },
  { name: 'down',  dy: 40,  dx: 0,   face: 'down',  wrong: 'up' },
  { name: 'left',  dy: 0,   dx: -40, face: 'left',  wrong: 'right' },
  { name: 'right', dy: 0,   dx: 40,  face: 'right', wrong: 'left' },
];
for (const o of orient) {
  assert.equal(buildingDoorTrigger([door('open', o.dy, o.dx)], 10, 10, o.face, T).action, 'enter', `${o.name}-doorway + facing ${o.face} → enter`);
  assert.equal(buildingDoorTrigger([door('closed', o.dy, o.dx)], 10, 10, o.face, T).action, 'prompt', `${o.name}-doorway (closed) + facing ${o.face} → prompt`);
  assert.equal(buildingDoorTrigger([door('open', o.dy, o.dx)], 10, 10, o.wrong, T).action, 'wait', `${o.name}-doorway + facing ${o.wrong} → wait (no consume)`);
}

console.log('buildingDoorTrigger: open enters, closed/locked prompt, walk-past waits, off-axis recovers, all 4 orientations ✓');
