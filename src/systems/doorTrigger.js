// =============================================================================
// buildingDoorTrigger — the PURE decision for a building doorway walk-in.
// Given the loaded doors, the player's tile, and the player's facing, decide what
// happens: ENTER (open), PROMPT (closed/locked knock/try), WAIT (on the threshold
// but not yet facing the doorway), or NONE (not on a door tile).
//
// Extracted from OverworldScene._checkDoorWalk so it is UNIT-TESTABLE (the
// regression that broke ALL building entry — the facing gate CONSUMING the
// trigger on a mismatch — lived in this logic and had no test). The caller fires
// the action and must NOT consume the trigger on 'wait' (re-evaluate next frame,
// so an off-axis arrival that then faces the door still enters).
//
//   action: 'enter' | 'prompt' | 'wait' | 'none'
//   door:   the matched door (or null)
// =============================================================================

const DOOR_VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export function buildingDoorTrigger(doors, ptx, pty, facing, TILE) {
  for (const d of (doors || [])) {
    // the painted doorway relative to the THRESHOLD-tile centre → the direction you must face to walk IN.
    const ddx = d.doorWX - (d.tx * TILE + TILE / 2), ddy = d.doorWY - (d.ty * TILE + TILE / 2);
    const doorDir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : (ddy > 0 ? 'down' : 'up');
    const dv = DOOR_VEC[doorDir];
    // RESPONSIVE ENTRY: fire on the threshold tile OR the APPROACH tile (one tile back from the door). The old
    // single-tile match needed pixel-perfect landing on the threshold — but the player's container-tile can sit
    // one tile off its feet, so a player visually AT the door never matched (the "slow / double-press" entry).
    const onThreshold = ptx === d.tx && pty === d.ty;
    const onApproach = ptx === d.tx - dv[0] && pty === d.ty - dv[1];
    if (!onThreshold && !onApproach) continue;
    if (facing !== doorDir) return { door: d, action: 'wait' };  // facing along/away (walking past) — WAIT, never consume
    const open = !(d.state === 'closed' || d.state === 'locked');
    return { door: d, action: open ? 'enter' : 'prompt' };
  }
  return { door: null, action: 'none' };
}
