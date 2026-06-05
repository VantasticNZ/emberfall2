// =============================================================================
// AssetLoader — the ONE path through which all art enters the game. Scenes call
// it and never touch file paths. Concrete enforcement of the manifest being the
// single source of truth (Bible Part 0 #3).
//   queue() in preload  : load every LPC layer sheet + Kenney tile/prop image.
//   build() in create   : register the shared animation set for every layer
//                          texture (one anim per texture x state x facing).
// =============================================================================

import { LAYER_TEXTURES, TILES, PROPS, CLIPS, DIR_ROW } from '../data/assets.js';

// Pick the clip for a (state, texture): the oversize 192px swing sheets use the
// oversize attack clip; everything else uses the standard clip.
function clipFor(state, tex) {
  if (state === 'attack' && tex.fw === CLIPS.attack_oversize.fw) return CLIPS.attack_oversize;
  return CLIPS[state];
}

export const AssetLoader = {
  // Phase 1 (scene.preload): queue all real files.
  queue(scene) {
    for (const [key, t] of Object.entries(LAYER_TEXTURES)) {
      scene.load.spritesheet(key, t.src, { frameWidth: t.fw, frameHeight: t.fw });
    }
    for (const [key, t] of Object.entries(TILES)) scene.load.image(key, t.src);
    for (const [key, p] of Object.entries(PROPS)) scene.load.image(key, p.src);
  },

  // Phase 2 (scene.create): register every layer texture's animation set.
  build(scene) {
    for (const [key, t] of Object.entries(LAYER_TEXTURES)) this._registerAnims(scene, key, t);
  },

  _registerAnims(scene, key, tex) {
    for (const state of tex.states) {
      const clip = clipFor(state, tex);
      if (!clip) continue;
      for (const [facing, dirOff] of Object.entries(DIR_ROW)) {
        const animKey = `${key}-${state}-${facing}`;
        if (scene.anims.exists(animKey)) continue;
        const row = clip.block + dirOff;
        const frames = clip.frames.map((col) => ({ key, frame: row * tex.cols + col }));
        scene.anims.create({
          key: animKey,
          frames,
          frameRate: clip.rate,
          repeat: clip.repeat,
        });
      }
    }
  },
};
