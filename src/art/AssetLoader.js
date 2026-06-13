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
  DIR_ROW, TILES, PROPS, DECALS, FRAME, PUNCH_FRAMES,
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
  // Phase 1 (scene.preload): queue all files. A layer may restrict which states
  // it has (equipment = attack only) and use a larger frame (oversize swing).
  queue(scene) {
    for (const [tex, L] of layerDefs()) {
      const fw = L.fw || FRAME;
      for (const st of (L.states || STATES)) {
        scene.load.spritesheet(`${tex}__${st}`, `art/eliza/${tex}/${st}.png`,
          { frameWidth: fw, frameHeight: fw });
      }
      if (L.expressive) {
        scene.load.spritesheet(`${tex}__expr`, `art/eliza/${tex}/expr.png`,
          { frameWidth: FRAME, frameHeight: FRAME });
      }
    }
    for (const [key, t] of Object.entries(TILES)) scene.load.image(key, t.src);
    for (const [key, p] of Object.entries(PROPS)) scene.load.image(key, p.src);
    for (const [key, d] of Object.entries(DECALS)) scene.load.image(key, d.src);
    // the [LPC] Terrains autotile atlas (bluecarrot16 et al., CC-BY/CC-BY-SA/GPL) —
    // 32px corner-transition tiles for feathered biome edges (src/data/terrainTiles.js).
    scene.load.spritesheet('lpc_terrain', 'art/terrain/lpc_terrain.png', { frameWidth: 32, frameHeight: 32 });
  },

  // Phase 2 (scene.create): register every layer's animation set.
  build(scene) {
    for (const [tex, L] of layerDefs()) {
      for (const st of (L.states || STATES)) this._registerState(scene, tex, st);
      this._registerPunch(scene, tex);   // UNARMED jab (reuses the __attack sheet's strike frames; no wind-up)
      if (L.expressive) this._registerExpressions(scene, tex);
    }
  },

  // PUNCH — a forward arm jab for the no-weapon hit. Built from the SLASH sheet's strike→follow→recover frames
  // (PUNCH_FRAMES) per direction, skipping the overhead wind-up so it never reads as a weapon swing. Every layer
  // (body/head/hair) plays it; the child-hair bake keeps the hair seated on every __attack frame, so it stays
  // locked to the head through the jab. Reverts to idle (one-shot).
  _registerPunch(scene, tex) {
    const sheet = `${tex}__attack`, cols = ANIMS.attack.frames;
    for (const [facing, row] of Object.entries(DIR_ROW)) {
      const key = `${tex}-punch-${facing}`;
      if (scene.anims.exists(key)) continue;
      const frames = PUNCH_FRAMES.map((c) => ({ key: sheet, frame: row * cols + c }));
      scene.anims.create({ key, frames, frameRate: 16, repeat: 0 });
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
