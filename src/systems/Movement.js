// =============================================================================
// SYSTEM: Movement  (Bible Part 1 — MOVEMENT/PHYSICS, written ONCE)
// Top-down movement for ANY actor. The player feeds it an input vector; an NPC
// feeds it an AI vector — identical code path, never re-implemented per actor.
// Responsibilities: normalise direction, set velocity at the actor's speed,
// update facing, and play the correct walk/idle animation via the manifest.
//
// Contract — an actor is a Phaser.Physics.Arcade.Sprite carrying:
//   .assetKey  (manifest key, for animation lookup)
//   .moveSpeed (px/sec)
//   .facing    ('down'|'left'|'right'|'up')  — Movement maintains this
// =============================================================================

import { animFor } from '../art/AssetLoader.js';

// Dominant-axis facing from a movement vector (4-direction).
function faceFromVec(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

export const Movement = {
  /**
   * Drive an actor for this frame.
   * @param {Phaser.Physics.Arcade.Sprite} actor
   * @param {number} dx desired x direction (any magnitude; normalised here)
   * @param {number} dy desired y direction
   */
  drive(actor, dx, dy) {
    const len = Math.hypot(dx, dy);
    if (len > 0) { dx /= len; dy /= len; }
    actor.body.setVelocity(dx * actor.moveSpeed, dy * actor.moveSpeed);

    const moving = len > 0;
    if (moving) actor.facing = faceFromVec(dx, dy);
    this.animate(actor, moving ? 'walk' : 'idle');
  },

  /** Stop an actor and settle to idle facing. */
  stop(actor) {
    actor.body.setVelocity(0, 0);
    this.animate(actor, 'idle');
  },

  /** Play the state+facing animation for this actor (write-once naming). */
  animate(actor, state) {
    const key = animFor(actor.assetKey, state, actor.facing);
    if (actor.anims.currentAnim?.key !== key || !actor.anims.isPlaying) {
      actor.play(key, true);
    }
  },
};
