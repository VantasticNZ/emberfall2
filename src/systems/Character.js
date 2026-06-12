// =============================================================================
// SYSTEM: Character  (Bible Part 1 — the LAYERED paper-doll, written ONCE)
// A character is a STACK of layer sprites (body+legs+feet+clothes+hair+hat
// +weapon+shield) that all share ONE animation set and move/animate in
// lock-step. Equipping is DATA: PARTS[key] names a slot + its layers; equip()
// swaps the slot. No per-character behaviour lives here — NPCs and the hero are
// the same code, differing only by the DATA parts they wear.
//
// Built on a Phaser Container with an Arcade body (so Movement/Collision/
// DepthSort treat it like any actor): the container is the actor anchor, its
// children are the visual layers (origin 0.5 => every layer, 64px or the 192px
// oversize swing, stays centred on the same point => always aligned).
// =============================================================================

import Phaser from 'phaser';
import { PARTS, ONESHOT, ANIMS, WALK_STRIDE, CHAR_FOOTPRINT, animFor } from '../data/assets.js';

export class Character extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x @param {number} y  world anchor (frame centre)
   * @param {{parts:string[], facing?:string, speed?:number, runSpeed?:number}} opts
   */
  constructor(scene, x, y, opts = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.facing = opts.facing || 'down';
    this.moveSpeed = opts.speed || 90;
    this.runSpeed = opts.runSpeed || Math.round((opts.speed || 90) * 1.7);
    this.actState = 'idle';
    this.expression = opts.expression || 'neutral'; // shown on the head when idle
    this._busy = false;                 // a one-shot action is playing
    this._equipped = {};                // slot -> partKey
    this._slotLayers = {};              // slot -> [sprite,...]

    // Collider/anchor = the footprint feet-box, centred under the character.
    // (Container body: top-left = container pos + offset.)
    const fp = CHAR_FOOTPRINT;
    this.body.setSize(fp.w, fp.h);
    this.body.setOffset(fp.offX - fp.w / 2, fp.offY - fp.h / 2);

    for (const key of (opts.parts || [])) this.equip(key, true);
    this._applyState();
  }

  // ---- EQUIPMENT (data-driven slot toggle) ----------------------------------
  /** Equip a part by key; replaces whatever occupied its slot. */
  equip(partKey, silent = false) {
    const part = PARTS[partKey];
    if (!part) { console.warn('[Character] unknown part:', partKey); return this; }
    this.unequip(part.slot, true);
    const sprites = part.layers.map((layer) => {
      const initState = (layer.states || ['idle'])[0];
      const spr = this.scene.add.sprite(0, 0, `${layer.tex}__${initState}`).setOrigin(0.5, 0.5);
      spr._layerDef = layer;
      spr._baseY = layer.oy || 0;   // per-part vertical SEAT offset (some hair styles sit high at base) — survives big-head
      spr.y = spr._baseY;
      this.add(spr);
      return spr;
    });
    this._slotLayers[part.slot] = sprites;
    this._equipped[part.slot] = partKey;
    this._restack();
    if (!silent) this._applyState();
    return this;
  }

  /** Remove whatever is in a slot. */
  unequip(slot, silent = false) {
    const sprites = this._slotLayers[slot];
    if (sprites) sprites.forEach((s) => s.destroy());
    delete this._slotLayers[slot];
    delete this._equipped[slot];
    if (!silent) this._applyState();
    return this;
  }

  /** Toggle: equip if empty/different, unequip if already wearing this part. */
  toggle(partKey) {
    const part = PARTS[partKey];
    if (!part) return this;
    if (this._equipped[part.slot] === partKey) this.unequip(part.slot);
    else this.equip(partKey);
    return this;
  }

  equippedIn(slot) { return this._equipped[slot] || null; }

  // Re-order children by layer z so the paper-doll draws in the right order.
  _restack() {
    const all = [];
    for (const sprites of Object.values(this._slotLayers)) all.push(...sprites);
    all.sort((a, b) => a._layerDef.z - b._layerDef.z);
    all.forEach((s) => this.bringToTop(s)); // ascending => highest z ends on top
  }

  // ---- ANIMATION (one set, fanned out to every layer) -----------------------
  /** Set the movement/idle state. `speed` (px/s) sets the walk leg cadence so
   *  the feet don't slide. Ignored while a one-shot action plays. */
  setState(state, speed) {
    if (this._busy) return;
    this._curSpeed = speed || this.moveSpeed;
    if (state === this.actState) { this._ensurePlaying(); return; }
    this.actState = state;
    this._applyState();
  }

  // Playback timeScale for the current state. Walk legs cycle at a rate matched
  // to the move speed (no feet-slide): fps = 4*speed/stride.
  _timeScale() {
    if (this.actState !== 'walk') return 1;
    const wantFps = (4 * (this._curSpeed || this.moveSpeed)) / WALK_STRIDE;
    return wantFps / ANIMS.walk.rate;
  }

  /** Fire a one-shot action (attack/cast/use/pickup); reverts to idle after. */
  action(state) {
    if (this._busy || !ONESHOT.has(state)) return this;
    this._busy = true;
    this.actState = state;
    this._applyState();
    const lead = this._slotLayers.body?.[0];
    if (lead) {
      lead.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this._busy = false;
        this.actState = 'idle';
        this._applyState();
      });
    } else {
      this._busy = false;
    }
    return this;
  }

  isBusy() { return this._busy; }

  /** Change the facial expression (data-driven); re-applies the head. */
  setExpression(expr) { this.expression = expr || 'neutral'; this._applyState(); return this; }

  // Resolve the animation key for one layer sprite. An expressive head shows the
  // expression face while idle (except facing up = back of head); a layer may
  // also override its texture for a state (e.g. a weapon's oversize swing).
  _animKeyFor(spr) {
    const L = spr._layerDef;
    if (L.expressive && this.actState === 'idle' && this.expression !== 'neutral' && this.facing !== 'up') {
      return `${L.tex}-expr-${this.expression}-${this.facing}`;
    }
    const useTex = L.overrides?.[this.actState] || L.tex;
    return animFor(useTex, this.actState, this.facing);
  }

  // A layer that only exists in certain states (equipment) hides otherwise.
  _shownIn(spr) {
    const st = spr._layerDef.states;
    return !st || st.includes(this.actState);
  }

  // Play the current state+facing on every layer (hiding state-limited gear).
  _applyState() {
    const ts = this._timeScale();
    for (const sprites of Object.values(this._slotLayers)) {
      for (const spr of sprites) {
        if (!this._shownIn(spr)) { spr.setVisible(false); continue; }
        spr.setVisible(true);
        spr.play(this._animKeyFor(spr), true);
        spr.anims.timeScale = ts;
      }
    }
  }

  // Re-assert the current animation (e.g. after facing change) without restart.
  _ensurePlaying() {
    const ts = this._timeScale();
    for (const sprites of Object.values(this._slotLayers)) {
      for (const spr of sprites) {
        if (!this._shownIn(spr)) { spr.setVisible(false); continue; }
        spr.setVisible(true);
        const key = this._animKeyFor(spr);
        if (spr.anims.currentAnim?.key !== key || !spr.anims.isPlaying) spr.play(key, true);
        spr.anims.timeScale = ts; // keep legs matched to current speed every frame
      }
    }
  }
}
