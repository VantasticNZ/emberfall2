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

export function buildingDoorTrigger(doors, ptx, pty, facing, TILE) {
  for (const d of (doors || [])) {
    if (d.tx !== ptx || d.ty !== pty) continue;                 // not standing on this doorway's threshold
    // the painted doorway relative to the threshold-tile centre → the direction you must face to walk IN.
    const ddx = d.doorWX - (ptx * TILE + TILE / 2), ddy = d.doorWY - (pty * TILE + TILE / 2);
    const doorDir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : (ddy > 0 ? 'down' : 'up');
    if (facing !== doorDir) return { door: d, action: 'wait' };  // facing along/away (walking past) — WAIT, never consume
    const open = !(d.state === 'closed' || d.state === 'locked');
    return { door: d, action: open ? 'enter' : 'prompt' };
  }
  return { door: null, action: 'none' };
}
