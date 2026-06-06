// =============================================================================
// SYSTEM: InputMap  (the input layer — reads the canonical CONTROL MAP).
// Device-agnostic ACTIONS resolve to keyboard keys + Xbox gamepad buttons from
// src/constants/controls.js `bindings` (which the options menu rebinds live).
// Movement supports analog (stick magnitude -> walk/run). Aim/ranged RESERVED.
// Full Gate-N polish (on-screen glyphs + device auto-detect prompts) is FLAGGED.
// =============================================================================

import { bindings } from '../constants/controls.js';

export class InputMap {
  constructor(scene) {
    this.scene = scene;
    this._keys = {};
    this._pressCbs = {};
    this._padPrev = {};
    this._stickMag = 0;
    this._buildKeys();
    this.cursors = scene.input.keyboard.createCursorKeys(); // arrows mirror move
    if (scene.input.gamepad) scene.input.gamepad.start?.();
    scene.events.on('update', () => this._pollGamepad());
  }

  _buildKeys() {
    const kb = this.scene.input.keyboard;
    for (const [action, keyName] of Object.entries(bindings.keyboard)) {
      try {
        const k = kb.addKey(keyName);
        k.on('down', () => this._fire(action));
        this._keys[action] = k;
      } catch (_) { /* unknown key name — skip */ }
    }
  }
  _fire(action) { (this._pressCbs[action] || []).forEach((cb) => cb()); }

  /** Subscribe to a one-shot press of an action (tap). Returns this. */
  onPress(action, cb) { (this._pressCbs[action] ||= []).push(cb); return this; }

  _pad() { const m = this.scene.input.gamepad; return m && m.total ? m.getPad(0) : null; }
  _pollGamepad() {
    const gp = this._pad(); if (!gp) return;
    for (const [action, idx] of Object.entries(bindings.gamepad)) {
      const now = !!gp.buttons[idx]?.pressed, was = !!this._padPrev[idx];
      if (now && !was) this._fire(action);
      this._padPrev[idx] = now;
    }
  }

  /** Is an action currently held (keyboard, arrows-for-move, or gamepad)? */
  down(action) {
    let v = this._keys[action]?.isDown || false;
    if (action === 'move_up') v = v || this.cursors.up.isDown;
    if (action === 'move_down') v = v || this.cursors.down.isDown;
    if (action === 'move_left') v = v || this.cursors.left.isDown;
    if (action === 'move_right') v = v || this.cursors.right.isDown;
    const gp = this._pad();
    if (gp) { const b = bindings.gamepad[action]; if (b != null && gp.buttons[b]?.pressed) v = true; }
    return v;
  }

  /** Move vector (-1..1), with analog stick override + run-magnitude tracking. */
  vector() {
    let dx = 0, dy = 0;
    if (this.down('move_left')) dx -= 1;
    if (this.down('move_right')) dx += 1;
    if (this.down('move_up')) dy -= 1;
    if (this.down('move_down')) dy += 1;
    this._stickMag = 0;
    const gp = this._pad();
    if (gp) {
      const ax = gp.leftStick.x, ay = gp.leftStick.y, mag = Math.hypot(ax, ay);
      if (mag > 0.2) { dx = ax; dy = ay; this._stickMag = mag; }
    }
    return { dx, dy };
  }
  runHeld() { return this.down('run') || this._stickMag > 0.85; }   // analog far = run

  /** Rebind an action to a new keyboard key (options menu). */
  rebind(action, keyName) {
    bindings.keyboard[action] = keyName;
    const kb = this.scene.input.keyboard;
    try { if (this._keys[action]) kb.removeKey(this._keys[action]); } catch (_) {}
    try { const k = kb.addKey(keyName); k.on('down', () => this._fire(action)); this._keys[action] = k; } catch (_) {}
  }
}
