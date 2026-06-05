// =============================================================================
// SYSTEM: Collision  (Bible Part 1 — COLLISION; Gate B)
// One system. Solidity is a DATA flag (set in world data / passed in), never a
// per-instance behaviour. The physics body is sized from the manifest FOOTPRINT
// so "the collider matches the visible footprint" (Gate B) is guaranteed by
// construction for player, NPCs and props alike.
//
// All sprites use dynamic arcade bodies (immovable + moves=false for solids) so
// the footprint math is a single identical code path for every body type.
// =============================================================================

/**
 * Size+offset an actor's physics body to its manifest footprint.
 * Sprite origin is assumed centre (0.5,0.5). The footprint is anchored to that
 * centre: footprint centre in frame space = (fw/2+offX, fh/2+offY).
 * @param {Phaser.Physics.Arcade.Sprite} sprite  (must already have a body)
 * @param {{w:number,h:number,offX:number,offY:number}} fp
 */
export function fitBodyToFootprint(sprite, fp) {
  if (!fp) return;
  const fw = sprite.width, fh = sprite.height;
  sprite.body.setSize(fp.w, fp.h);
  sprite.body.setOffset(fw / 2 + fp.offX - fp.w / 2, fh / 2 + fp.offY - fp.h / 2);
}

export const Collision = {
  /**
   * Mark a sprite solid: a fixed obstacle bodies collide with.
   * Solidity is the data decision of the caller; this system just applies it.
   */
  makeSolid(sprite, fp) {
    fitBodyToFootprint(sprite, fp);
    sprite.body.setImmovable(true);
    sprite.body.moves = false;          // never pushed; a true static obstacle
    return sprite;
  },

  /** Configure a moving actor's body from its footprint (player/NPC). */
  makeActorBody(sprite, fp) {
    fitBodyToFootprint(sprite, fp);
    sprite.body.setCollideWorldBounds(true);
    return sprite;
  },

  /**
   * Wire the world's collision relationships once.
   * @param scene
   * @param {Phaser.GameObjects.Group} actors
   * @param {Phaser.GameObjects.Group} solids
   */
  wire(scene, actors, solids) {
    scene.physics.add.collider(actors, solids);
    scene.physics.add.collider(actors, actors); // actors don't overlap each other
  },
};
