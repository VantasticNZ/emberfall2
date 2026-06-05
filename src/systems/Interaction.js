// =============================================================================
// SYSTEM: Interaction  (Bible Part 1 — INTERACTION; Gate B accessibility)
// One "interactable" system: face + press E -> action, with a FORGIVING radius.
// NPCs, signs, chests, doors all REGISTER as data-driven interactables; none
// implement their own proximity/press logic.
//
// Each frame, update(player) finds the best candidate (in range, roughly in
// front of the player) and exposes it as the active interactable; the scene
// shows its prompt and calls tryInteract() on the key press.
// =============================================================================

export const Interaction = {
  _items: [],
  active: null,

  reset() { this._items = []; this.active = null; },

  /**
   * Register an interactable.
   * @param {object} cfg
   *   .x,.y        world anchor (the point the player approaches)
   *   .radius      forgiving reach in px (default 30)
   *   .prompt      short label shown when active (e.g. "Talk", "Read")
   *   .onInteract  fn() called on press
   *   .requireFacing  if true, player must roughly face it (default true)
   */
  register(cfg) {
    this._items.push({ radius: 30, requireFacing: true, ...cfg });
  },

  /** Find the best candidate for this frame relative to the player. */
  update(player) {
    let best = null, bestScore = Infinity;
    const facing = FACE_VEC[player.facing] || FACE_VEC.down;

    for (const it of this._items) {
      const dx = it.x - player.x, dy = it.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > it.radius) continue;

      if (it.requireFacing && dist > 4) {
        // forgiving facing test: candidate must be within ~120° of facing
        const len = dist || 1;
        const dot = (dx / len) * facing.x + (dy / len) * facing.y;
        if (dot < -0.25) continue;
      }
      // prefer the nearest in-range candidate
      if (dist < bestScore) { bestScore = dist; best = it; }
    }
    this.active = best;
    return best;
  },

  /** Fire the active interactable's action, if any. Returns true if fired. */
  tryInteract() {
    if (!this.active) return false;
    this.active.onInteract?.();
    return true;
  },
};

const FACE_VEC = {
  down:  { x: 0, y: 1 },
  up:    { x: 0, y: -1 },
  left:  { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
