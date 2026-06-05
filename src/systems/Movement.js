// =============================================================================
// SYSTEM: Movement  (Bible Part 1 — MOVEMENT/PHYSICS, written ONCE)
// Top-down movement for ANY character. The player feeds an input vector; an NPC
// would feed an AI vector — identical path. It normalises direction, sets
// velocity at the character's speed, updates facing, and asks the Character to
// play walk/run/idle. A character mid-action (one-shot attack/cast/use/pickup)
// is held still until the action finishes.
// =============================================================================

function faceFromVec(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

export const Movement = {
  /**
   * Drive a character for this frame.
   * @param {import('./Character.js').Character} actor
   * @param {number} dx @param {number} dy  desired direction (normalised here)
   * @param {boolean} running
   */
  drive(actor, dx, dy, running = false) {
    if (actor.isBusy()) { actor.body.setVelocity(0, 0); return; }
    const len = Math.hypot(dx, dy);
    if (len > 0) { dx /= len; dy /= len; }
    const speed = running ? actor.runSpeed : actor.moveSpeed;
    actor.body.setVelocity(dx * speed, dy * speed);

    const moving = len > 0;
    if (moving) actor.facing = faceFromVec(dx, dy);
    // pass the current speed so the walk leg cadence matches it (no slide);
    // running just walks at runSpeed => a faster, still-matched cycle.
    actor.setState(moving ? 'walk' : 'idle', speed);
  },

  /** Halt a character and settle to idle (unless mid-action). */
  stop(actor) {
    actor.body.setVelocity(0, 0);
    if (!actor.isBusy()) actor.setState('idle');
  },
};
