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
   * Register a y-sorted object by an EXPLICIT feet offset (px from origin down to
   * the footprint base). Used for ACTORS, whose feet line is their physics-body
   * base (`body.offset.y + body.height`) — a uniform feet derivation, not a
   * per-case constant. For STATIC PROPS use trackProp (the geometric feet rule).
   */
  track(sprite, baseOffset = 0) {
    sprite._sortBase = baseOffset;
    sprite._sortBox = undefined;
    this._ysorted.push(sprite);
    return sprite;
  },

  /**
   * THE GAME-WIDE DEPTH RULE for static props. depth = the world Y of the
   * sprite's FEET (the bottom of its opaque mass), derived from the sprite's
   * live origin + scale and its opaque `box` (solidBox: {offY,h} native px,
   * measured from the FRAME CENTRE). This is origin- AND scale-agnostic — one
   * formula for every prop regardless of how its art is anchored:
   *
   *   feetY = y + (0.5 - originY)*displayHeight + scaleY*(box.offY + box.h/2)
   *
   * A box-less object (a plain Rectangle / texture with no opaque bounds) falls
   * back to its display bottom (displayHeight/2 below a centred origin). Pass the
   * sprite's solidBox so it sorts by where it touches the ground, never its centre.
   */
  trackProp(sprite, box = null) {
    sprite._sortBox = box;     // {offY,h} native px from frame centre, or null
    sprite._sortBase = undefined;
    this._ysorted.push(sprite);
    return sprite;
  },

  /**
   * Stop y-sorting an object — REQUIRED by the streamed overworld (track on chunk
   * load, untrack on unload) so the sorted list stays bounded to the LOADED set and
   * never iterates recycled/destroyed sprites. (Minimal additive method; existing
   * full-teardown scenes use reset() and are unaffected.)
   */
  untrack(sprite) { const i = this._ysorted.indexOf(sprite); if (i >= 0) this._ysorted.splice(i, 1); return sprite; },

  /** Re-depth all tracked objects. Call once per frame after movement. */
  update() {
    const list = this._ysorted;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (!s.active) continue;
      if (s._sortBox !== undefined) {
        // THE PROP FEET RULE — one origin/scale-agnostic formula (see trackProp).
        const box = s._sortBox;
        s.setDepth(s.y + (0.5 - s.originY) * s.displayHeight + (box ? s.scaleY * (box.offY + box.h / 2) : s.displayHeight / 2));
      } else {
        s.setDepth(s.y + s._sortBase);   // explicit feet offset (actors)
      }
    }
  },
};
