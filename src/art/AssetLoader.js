// =============================================================================
// AssetLoader — the ONE path through which all art enters the game.
// Both real-art and placeholder modes flow through here; scenes call it and
// never touch file paths. This is the concrete enforcement of the manifest
// being the single source of truth (Bible Part 0 #3).
// =============================================================================

import { ASSETS, ART_SOURCE, animKey } from '../data/assets.js';
import { ArtForge } from './ArtForge.js';

// Full, unique animation key for a character texture + state + facing.
export function animFor(textureKey, state, facing) {
  return `${textureKey}-${animKey(state, facing)}`;
}

export const AssetLoader = {
  // Phase 1 (in scene.preload): queue real files. No-op in placeholder mode.
  queue(scene) {
    if (ART_SOURCE !== 'real') return;
    for (const [key, d] of Object.entries(ASSETS)) {
      if (d.kind === 'sheet') {
        scene.load.spritesheet(key, d.src, { frameWidth: d.frameWidth, frameHeight: d.frameHeight });
      } else {
        scene.load.image(key, d.src);
      }
    }
  },

  // Phase 2 (in scene.create): synthesise placeholders if needed, then register
  // every character's animation set from the manifest. Idempotent.
  build(scene) {
    for (const [key, d] of Object.entries(ASSETS)) {
      if (ART_SOURCE === 'placeholder') ArtForge.generate(scene, key, d);
      if (d.kind === 'sheet' && d.anims) this._registerAnims(scene, key, d);
    }
  },

  _registerAnims(scene, key, d) {
    for (const [name, range] of Object.entries(d.anims)) {
      const animKeyFull = `${key}-${name}`;
      if (scene.anims.exists(animKeyFull)) continue;
      const base = range.row * d.cols;
      const frames = [];
      for (let f = range.from; f <= range.to; f++) frames.push({ key, frame: base + f });
      const isIdle = range.from === range.to;
      scene.anims.create({
        key: animKeyFull,
        frames,
        frameRate: isIdle ? 1 : 8,   // ~125ms/frame walk (Mana Seed guide ~135ms)
        repeat: isIdle ? 0 : -1,
      });
    }
  },
};
