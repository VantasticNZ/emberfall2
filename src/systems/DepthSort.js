// =============================================================================
// SYSTEM: DepthSort  (Bible Part 1 — DEPTH-SORTING; Gate C)
// One system. Floors are pinned BELOW all actors; tall props and actors y-sort
// by their FOOTPRINT BASE (feet line), so an actor is occluded by a prop whose
// base is lower on screen, and never hidden behind a floor tile.
//
// Depth = baseY (the feet line in world Y). Floors get a fixed low depth.
// Registered objects are re-sorted every frame in update().
// =============================================================================

export const DEPTH = {
  FLOOR: -10000,   // ground/floor tiles: always beneath actors
  OVERLAY: 100000, // UI/FX that must sit on top regardless of position
};

export const DepthSort = {
  _ysorted: [],

  reset() { this._ysorted = []; },

  /** Pin a floor/ground object beneath everything that y-sorts. */
  pinFloor(obj) { obj.setDepth(DEPTH.FLOOR); },

  /**
   * Register a y-sorted object (actor or tall prop). `baseOffset` is the px
   * distance from the sprite's origin down to its footprint base (its feet),
   * so things sort by where they touch the ground — not by their centre.
   */
  track(sprite, baseOffset = 0) {
    sprite._sortBase = baseOffset;
    this._ysorted.push(sprite);
    return sprite;
  },

  /** Re-depth all tracked objects. Call once per frame after movement. */
  update() {
    const list = this._ysorted;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (!s.active) continue;
      s.setDepth(s.y + s._sortBase);
    }
  },
};
