// =============================================================================
// AssetLoader — the ONE path through which all art enters the game.
// ElizaWy LPC Revised ships one sheet PER ANIMATION, so each character layer is
// a folder /art/eliza/<tex>/{idle,walk,attack}.png (+ expr.png for the head).
// We load each as a spritesheet `${tex}__${state}` and register, per facing, an
// animation `${tex}-${state}-${facing}` whose frames come from that sheet's row.
// The head also gets per-EXPRESSION idle animations from its expr.png.
// =============================================================================

import {
  PARTS, ANIMS, STATES, EXPRESSIONS, EXPR_COLS, EXPR_ROW,
  DIR_ROW, TILES, PROPS, DECALS, FRAME,
} from '../data/assets.js';

// Unique character layers used by any part -> a representative layer def.
function layerDefs() {
  const m = new Map();
  for (const part of Object.values(PARTS)) {
    for (const L of part.layers) if (!m.has(L.tex)) m.set(L.tex, L);
  }
  return m;
}

export const AssetLoader = {
  // Phase 1 (scene.preload): queue all files.
  queue(scene) {
    for (const [tex, L] of layerDefs()) {
      for (const st of STATES) {
        scene.load.spritesheet(`${tex}__${st}`, `art/eliza/${tex}/${st}.png`,
          { frameWidth: FRAME, frameHeight: FRAME });
      }
      if (L.expressive) {
        scene.load.spritesheet(`${tex}__expr`, `art/eliza/${tex}/expr.png`,
          { frameWidth: FRAME, frameHeight: FRAME });
      }
    }
    for (const [key, t] of Object.entries(TILES)) scene.load.image(key, t.src);
    for (const [key, p] of Object.entries(PROPS)) scene.load.image(key, p.src);
    for (const [key, d] of Object.entries(DECALS)) scene.load.image(key, d.src);
  },

  // Phase 2 (scene.create): register every layer's animation set.
  build(scene) {
    for (const [tex, L] of layerDefs()) {
      for (const st of STATES) this._registerState(scene, tex, st);
      if (L.expressive) this._registerExpressions(scene, tex);
    }
  },

  _registerState(scene, tex, state) {
    const a = ANIMS[state];
    const sheet = `${tex}__${state}`;
    for (const [facing, row] of Object.entries(DIR_ROW)) {
      const key = `${tex}-${state}-${facing}`;
      if (scene.anims.exists(key)) continue;
      const frames = [];
      for (let c = 0; c < a.frames; c++) frames.push({ key: sheet, frame: row * a.frames + c });
      scene.anims.create({ key, frames, frameRate: a.rate, repeat: a.repeat });
    }
  },

  // Per-expression static idle heads (one frame). North has no face -> skipped
  // (the Character plays the neutral idle head when facing up).
  _registerExpressions(scene, tex) {
    const sheet = `${tex}__expr`;
    for (const [name, col] of Object.entries(EXPRESSIONS)) {
      for (const [facing, row] of Object.entries(EXPR_ROW)) {
        const key = `${tex}-expr-${name}-${facing}`;
        if (scene.anims.exists(key)) continue;
        scene.anims.create({
          key, frames: [{ key: sheet, frame: row * EXPR_COLS + col }], frameRate: 1, repeat: 0,
        });
      }
    }
  },
};
