// =============================================================================
// CardSequence (S4) — the reusable CUTSCENE CARD PLAYER. A scene-agnostic queue of text "beats" rendered as
// centred, word-wrapped, fade-in cards over a full-screen cover. Used by the intro myth (TitleScene, manual
// advance) AND the childhood time-skip (OverworldScene, timed auto-advance) — one system, two callers.
//
//   new CardSequence(scene, beats, { onDone, depth, manual })
//     beats : array of string  OR  { text, hold } — `hold` (ms) auto-advances that beat; otherwise the beat
//             waits for .advance() (manual). A manual sequence is driven by the caller's own key handling.
//     onDone: called once when the last beat is dismissed (or .skip()).
//     manual: true → show the "Enter ▸ · Esc skip" hint (caller wires the keys); false → no hint (timed).
//   Controller: .advance()  .skip()  .destroy()
//
// Panel rule (L5): the cover fills the viewport; text is origin-centred with wordWrap clamped to the viewport,
// so it stays balanced + on-screen at any size.
// =============================================================================
export class CardSequence {
  constructor(scene, beats, opts = {}) {
    this.scene = scene;
    this.beats = (beats || []).map((b) => (typeof b === 'string' ? { text: b } : b));
    this.onDone = opts.onDone || null;
    this.manual = opts.manual !== false;   // default manual
    const depth = opts.depth != null ? opts.depth : 100000;
    const W = scene.scale.width, H = scene.scale.height;
    this._W = W; this._H = H; this._i = -1; this._done = false; this._timer = null;
    this.cover = scene.add.rectangle(0, 0, W, H, 0x05040a, 1).setOrigin(0, 0).setScrollFactor(0).setDepth(depth);
    this.txt = scene.add.text(W / 2, H / 2, '', {
      fontFamily: 'Georgia, serif', fontSize: opts.fontSize || '24px', color: '#d8c8a0', align: 'center',
      wordWrap: { width: Math.min(720, W - 120) }, lineSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    const hintText = opts.hint != null ? opts.hint : (this.manual ? 'Enter / E ▸   ·   Esc skip' : '');
    this.hint = scene.add.text(W / 2, H - 40, hintText, {
      fontFamily: 'monospace', fontSize: '12px', color: '#6a6050',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.advance();
  }

  advance() {
    if (this._done) return;
    if (this._timer) { this._timer.remove(); this._timer = null; }
    this._i++;
    if (this._i >= this.beats.length) return this.skip();
    const beat = this.beats[this._i];
    this.txt.setAlpha(0).setText(beat.text || '');
    this.scene.tweens.add({ targets: this.txt, alpha: 1, duration: 650 });
    if (beat.hold) this._timer = this.scene.time.delayedCall(beat.hold, () => this.advance());
  }

  skip() {
    if (this._done) return; this._done = true;
    if (this._timer) { this._timer.remove(); this._timer = null; }
    const cb = this.onDone; this.onDone = null;
    if (cb) cb();
  }

  destroy() {
    if (this._timer) { try { this._timer.remove(); } catch (_) {} this._timer = null; }
    for (const o of [this.cover, this.txt, this.hint]) { try { o && o.destroy(); } catch (_) {} }
    this.cover = this.txt = this.hint = null;
  }
}
