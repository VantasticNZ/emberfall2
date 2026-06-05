// =============================================================================
// ArtForge — procedural PLACEHOLDER texture generator.
// Used ONLY while ASSETS' ART_SOURCE === 'placeholder'. It synthesises simple,
// readable textures (in-engine, no third-party art => no license entanglement)
// at the EXACT grid declared in the manifest, so every system can be verified
// live now. When a license-compatible art pack is adopted, ArtForge is bypassed
// entirely — the manifest's `src` files load instead. Nothing else changes.
//
// Textures are drawn to a Phaser CanvasTexture; character sheets get numeric
// frames added in row-major order (frame = row*cols + col) to match the
// manifest's anim {row, from, to} ranges.
// =============================================================================

import { DIR_ROW } from '../data/assets.js';

// Tiny deterministic PRNG so placeholder speckle is stable across reloads
// (no Math.random reliance -> identical screenshots run to run).
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function seedFromKey(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

export const ArtForge = {
  /**
   * Build a placeholder texture for one manifest descriptor.
   * @param {Phaser.Scene} scene
   * @param {string} key
   * @param {object} d  manifest descriptor
   */
  generate(scene, key, d) {
    if (scene.textures.exists(key)) return;
    switch (d.kind) {
      case 'tile':  return this._tile(scene, key, d);
      case 'image': return this._prop(scene, key, d);
      case 'sheet': return this._charSheet(scene, key, d);
      default: console.warn(`[ArtForge] unknown kind '${d.kind}' for ${key}`);
    }
  },

  _canvas(scene, key, w, h) {
    const tex = scene.textures.createCanvas(key, w, h);
    return { tex, ctx: tex.getContext() };
  },

  _tile(scene, key, d) {
    const size = d.tileSize;
    const p = d.placeholder;
    const { tex, ctx } = this._canvas(scene, key, size, size);
    ctx.fillStyle = hex(p.base);
    ctx.fillRect(0, 0, size, size);
    // subtle, stable speckle for visible texture/parallax while walking
    const rnd = lcg(seedFromKey(key));
    ctx.fillStyle = hex(p.speck);
    const specks = Math.floor(size * size * 0.06);
    for (let i = 0; i < specks; i++) {
      ctx.fillRect(Math.floor(rnd() * size), Math.floor(rnd() * size), 1, 1);
    }
    // 1px inner edge so the tile grid is faintly legible (helps verify alignment)
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
    tex.refresh();
  },

  _prop(scene, key, d) {
    const w = d.width, h = d.height;
    const { tex, ctx } = this._canvas(scene, key, w, h);
    const fp = d.footprint;
    // footprint box is anchored to a centre-origin sprite (origin 0.5,0.5)
    const fpX = w / 2 + (fp ? fp.offX : 0) - (fp ? fp.w / 2 : 0);
    const fpY = h / 2 + (fp ? fp.offY : 0) - (fp ? fp.h / 2 : 0);

    const kind = d.placeholder.kind;
    if (kind === 'tree') {
      // trunk on the footprint, big canopy above (tall => occludes actors behind)
      ctx.fillStyle = '#6b4a2b';
      ctx.fillRect(w / 2 - 5, h - 22, 10, 22);
      ctx.fillStyle = '#2f6b34';
      ctx.beginPath(); ctx.arc(w / 2, 22, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3c8043';
      ctx.beginPath(); ctx.arc(w / 2 - 8, 18, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w / 2 + 9, 24, 13, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'house') {
      ctx.fillStyle = '#caa472';            // walls
      ctx.fillRect(4, h - 56, w - 8, 52);
      ctx.fillStyle = '#7a4a32';            // roof
      ctx.beginPath();
      ctx.moveTo(0, h - 50); ctx.lineTo(w / 2, h - 92); ctx.lineTo(w, h - 50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a2f20';            // door
      ctx.fillRect(w / 2 - 11, h - 32, 22, 28);
      ctx.fillStyle = '#9fd0e6';            // windows
      ctx.fillRect(w / 2 - 34, h - 46, 16, 14);
      ctx.fillRect(w / 2 + 18, h - 46, 16, 14);
    } else if (kind === 'sign') {
      ctx.fillStyle = '#6b4a2b';
      ctx.fillRect(w / 2 - 2, h - 12, 4, 12);
      ctx.fillStyle = '#b88a52';
      ctx.fillRect(2, 2, w - 4, 16);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(4, 6, w - 8, 2);
      ctx.fillRect(4, 11, w - 10, 2);
    } else if (kind === 'pot') {
      ctx.fillStyle = '#9a7b54';
      ctx.beginPath(); ctx.ellipse(w / 2, h - 8, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b89468';
      ctx.fillRect(w / 2 - 7, 2, 14, 5);
    }
    tex.refresh();
  },

  _charSheet(scene, key, d) {
    const fw = d.frameWidth, fh = d.frameHeight, cols = d.cols, rows = d.rows;
    const { tex, ctx } = this._canvas(scene, key, fw * cols, fh * rows);
    const p = d.placeholder;

    // draw one humanoid per (row=direction, col=walk frame)
    for (const [dir, row] of Object.entries(DIR_ROW)) {
      for (let col = 0; col < cols; col++) {
        const ox = col * fw, oy = row * fh;
        this._drawChar(ctx, ox, oy, fw, fh, dir, col, p);
      }
    }
    tex.refresh();

    // register row-major numeric frames so frame = row*cols + col
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tex.add(row * cols + col, 0, col * fw, row * fh, fw, fh);
      }
    }
  },

  _drawChar(ctx, ox, oy, fw, fh, dir, frame, p) {
    const cx = ox + fw / 2;
    const feetY = oy + fh / 2 + 26;        // matches manifest footprint offY 26
    // walk bob + leg split from the frame (idle = frame 0)
    const phase = frame === 0 ? 0 : Math.sin((frame / 6) * Math.PI * 2);
    const bob = Math.round(-Math.abs(phase) * 2);
    const legSplit = Math.round(phase * 3);

    // ground shadow (fixed, so feet stay put = clean y-sort anchor)
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(cx, feetY + 2, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

    const topY = feetY - 40 + bob;         // head top
    // legs
    ctx.fillStyle = '#39403f';
    ctx.fillRect(cx - 6 + legSplit, feetY - 12, 5, 12);
    ctx.fillRect(cx + 1 - legSplit, feetY - 12, 5, 12);
    // torso (clothes/trim colour)
    ctx.fillStyle = hex(p.trim);
    ctx.fillRect(cx - 9, topY + 16, 18, 18);
    // body accent
    ctx.fillStyle = hex(p.body);
    ctx.fillRect(cx - 9, topY + 16, 18, 6);
    // head (skin)
    ctx.fillStyle = '#f0c9a0';
    ctx.beginPath(); ctx.arc(cx, topY + 8, 9, 0, Math.PI * 2); ctx.fill();
    // hair cap
    ctx.fillStyle = '#5a3b27';
    ctx.beginPath(); ctx.arc(cx, topY + 6, 9, Math.PI, 0); ctx.fill();

    // FACING INDICATOR — a nose/eyes nub toward the facing dir (verify Movement)
    ctx.fillStyle = '#1c1c22';
    if (dir === 'down')  { ctx.fillRect(cx - 4, topY + 9, 2, 2); ctx.fillRect(cx + 2, topY + 9, 2, 2); }
    if (dir === 'up')    { ctx.fillRect(cx - 3, topY + 1, 6, 2); }
    if (dir === 'left')  { ctx.fillRect(cx - 9, topY + 8, 3, 2); ctx.fillRect(cx - 4, topY + 9, 2, 2); }
    if (dir === 'right') { ctx.fillRect(cx + 6, topY + 8, 3, 2); ctx.fillRect(cx + 2, topY + 9, 2, 2); }
  },
};
