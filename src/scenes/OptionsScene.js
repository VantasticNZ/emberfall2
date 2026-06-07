// =============================================================================
// OptionsScene — the settings/options menu (overlay; the game scene is paused).
// Sections: CONTROLS (rebind every action), AUDIO (master/sfx/music), OPTIONS
// (aim-invert), MODIFIERS (toggle data-driven modifiers), ADULT (18+-gated, master-
// switched). Keyboard: ↑/↓ select · Enter act/rebind · ←/→ adjust · Esc close.
// FLAG: controller navigation + on-screen glyphs are Gate-N polish (later).
// =============================================================================

import Phaser from 'phaser';
import { ACTION_LABELS, bindings, resetBindings } from '../constants/controls.js';

const ROW_H = 26, VISIBLE = 17;

function keyName(e) {
  const c = e.code;
  if (c.startsWith('Key')) return c.slice(3);
  if (c.startsWith('Digit')) return ['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE'][+c.slice(5)];
  if (c === 'Space') return 'SPACE';
  if (c.startsWith('Shift')) return 'SHIFT';
  if (c.startsWith('Control')) return 'CTRL';
  if (c.startsWith('Alt')) return 'ALT';
  if (c === 'Tab') return 'TAB';
  if (c === 'Escape') return 'ESC';
  if (c === 'BracketLeft') return 'OPEN_BRACKET';
  if (c === 'BracketRight') return 'CLOSED_BRACKET';
  return c.toUpperCase();
}

export class OptionsScene extends Phaser.Scene {
  constructor() { super('Options'); }

  init(data) { this.caller = data.caller || null; this.mods = data.mods; this.im = data.im || null; }

  create() {
    // Render ON TOP of the (paused-but-still-rendering) caller. Pausing halts a
    // scene's update loop, NOT its render — and the Overworld is registered AFTER
    // Options in main.js, so without this the menu draws UNDERNEATH the world and
    // is invisible ("Esc pauses but no menu appears"). bringToTop is a no-op for
    // callers already below Options (the discrete RegionScenes).
    this.scene.bringToTop();
    this.sel = 0; this.top = 0; this.rebinding = null; this.confirming = false;
    this._buildRows();
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0, 0);           // dim the game
    const pw = 720, ph = ROW_H * VISIBLE + 96, px = (W - pw) / 2, py = (H - ph) / 2;
    this.add.rectangle(px, py, pw, ph, 0x10131c, 0.98).setOrigin(0, 0).setStrokeStyle(3, 0xffe9c2);
    this.add.text(px + 24, py + 16, 'SETTINGS', { fontFamily: 'monospace', fontSize: '24px', color: '#ffe9c2', fontStyle: 'bold' }).setResolution(2);
    this.add.text(px + pw - 24, py + 20, '↑↓ select · Enter act · ←→ adjust · Esc close', { fontFamily: 'monospace', fontSize: '11px', color: '#9b93b0' }).setOrigin(1, 0).setResolution(2);
    this._px = px; this._py = py + 56; this._pw = pw;
    this._rowTexts = [];
    for (let i = 0; i < VISIBLE; i++) {
      const bar = this.add.rectangle(px + 12, this._py + i * ROW_H, pw - 24, ROW_H - 3, 0xffe9c2, 1).setOrigin(0, 0).setVisible(false);
      const lab = this.add.text(px + 22, this._py + i * ROW_H + 3, '', { fontFamily: 'monospace', fontSize: '15px', color: '#e8e2f0' }).setResolution(2);
      const val = this.add.text(px + pw - 30, this._py + i * ROW_H + 3, '', { fontFamily: 'monospace', fontSize: '15px', color: '#cfc6e6' }).setOrigin(1, 0).setResolution(2);
      this._rowTexts.push({ bar, lab, val });
    }
    this._confirmTxt = this.add.text(W / 2, H / 2, '', { fontFamily: 'monospace', fontSize: '17px', color: '#ffd23f', align: 'center', backgroundColor: '#1c1422', padding: { x: 16, y: 12 } }).setOrigin(0.5).setResolution(2).setVisible(false);
    this._wireInput();
    this._render();
  }

  _buildRows() {
    const r = [{ k: 'head', label: '— CONTROLS — (Enter to rebind)' }];
    for (const [a, label] of Object.entries(ACTION_LABELS)) r.push({ k: 'bind', action: a, label });
    r.push({ k: 'head', label: '— AUDIO —' });
    r.push({ k: 'slider', key: 'master', label: 'Master Volume' }, { k: 'slider', key: 'sfx', label: 'SFX Volume' }, { k: 'slider', key: 'music', label: 'Music Volume' });
    r.push({ k: 'head', label: '— OPTIONS —' }, { k: 'aimInvert', label: 'Invert Aim (Y axis)' }, { k: 'threatInd', label: 'Threat Indicators' });
    r.push({ k: 'head', label: '— MODIFIERS —' });
    for (const m of this.mods.list().filter((d) => d.category !== 'adult')) r.push({ k: 'mod', id: m.id, label: m.name });
    r.push({ k: 'head', label: '— ADULT MODE (18+) —' });
    r.push({ k: 'adultMaster', label: 'Adult-Mode Feature (master)' }, { k: 'mod', id: 'adult_mode', label: 'Adult Mode' });
    r.push({ k: 'head', label: '' }, { k: 'reset', label: 'Reset controls to defaults' }, { k: 'close', label: 'Close' });
    this.rows = r;
  }

  _wireInput() {
    const kb = this.input.keyboard;
    kb.on('keydown', (e) => {
      if (this.rebinding) { if (e.code !== 'Escape') { this.im?.rebind(this.rebinding, keyName(e)); } this.rebinding = null; this._render(); return; }
      if (this.confirming) { if (e.code === 'KeyY') { this.mods.confirmAdult(true); this.mods.set('adult_mode', true); } this.confirming = false; this._confirmTxt.setVisible(false); this._render(); return; }
      const code = e.code;
      if (code === 'Escape') return this._close();
      if (code === 'ArrowUp' || code === 'KeyW') this._move(-1);
      else if (code === 'ArrowDown' || code === 'KeyS') this._move(1);
      else if (code === 'ArrowLeft' || code === 'KeyA') this._adjust(-1);
      else if (code === 'ArrowRight' || code === 'KeyD') this._adjust(1);
      else if (code === 'Enter' || code === 'Space') this._activate();
    });
  }

  _selectable(i) { return this.rows[i] && this.rows[i].k !== 'head'; }
  _move(d) {
    let i = this.sel;
    do { i = Phaser.Math.Clamp(i + d, 0, this.rows.length - 1); } while (!this._selectable(i) && i > 0 && i < this.rows.length - 1);
    if (this._selectable(i)) this.sel = i;
    if (this.sel < this.top) this.top = this.sel;
    if (this.sel >= this.top + VISIBLE) this.top = this.sel - VISIBLE + 1;
    this._render();
  }
  _adjust(d) {
    const row = this.rows[this.sel];
    if (row.k === 'slider') { const a = bindings.options.audio; a[row.key] = Phaser.Math.Clamp(+(a[row.key] + d * 0.1).toFixed(2), 0, 1); this.game.sound.volume = a.master; }
    else if (row.k === 'aimInvert') bindings.options.aimInvert = !bindings.options.aimInvert;
    else if (row.k === 'threatInd') bindings.options.threatIndicators = !bindings.options.threatIndicators;
    else if (row.k === 'mod') this._toggleMod(row.id);
    this._render();
  }
  _activate() {
    const row = this.rows[this.sel];
    if (row.k === 'bind') { this.rebinding = row.action; this._render(); }
    else if (row.k === 'mod') this._toggleMod(row.id);
    else if (row.k === 'aimInvert') { bindings.options.aimInvert = !bindings.options.aimInvert; this._render(); }
    else if (row.k === 'threatInd') { bindings.options.threatIndicators = !bindings.options.threatIndicators; this._render(); }
    else if (row.k === 'adultMaster') { this.mods.setAdultMaster(!this.mods.adultMasterEnabled); this._render(); }
    else if (row.k === 'reset') { resetBindings(); this._render(); }
    else if (row.k === 'close') this._close();
  }
  _toggleMod(id) {
    if (id === 'adult_mode' && !this.mods.adultConfirmed && this.mods.adultMasterEnabled && !this.mods.isOn('adult_mode')) {
      this.confirming = true;
      this._confirmTxt.setText('ADULT MODE (18+)\n\nThis enables mature content for ADULT\ncharacters only. Never minors. (No art yet.)\n\nAre you 18 or older?    Y = yes    N = no').setVisible(true);
      return;
    }
    this.mods.toggle(id);
    this.caller && this.scene.get(this.caller)?._applyBigHead?.();   // re-apply visible modifiers live
    this._render();
  }
  _close() { if (this.caller) this.scene.resume(this.caller); this.scene.stop(); }

  _render() {
    for (let i = 0; i < VISIBLE; i++) {
      const idx = this.top + i, row = this.rows[idx], t = this._rowTexts[i];
      if (!row) { t.lab.setText(''); t.val.setText(''); t.bar.setVisible(false); continue; }
      const sel = idx === this.sel;
      t.bar.setVisible(sel);
      t.lab.setText((row.k === 'head' ? '' : sel ? '▶ ' : '  ') + row.label).setColor(row.k === 'head' ? '#9b93b0' : sel ? '#1c1422' : '#e8e2f0').setFontStyle(row.k === 'head' ? 'bold' : 'normal');
      t.val.setText(this._valueOf(row)).setColor(sel ? '#1c1422' : '#cfc6e6');
    }
  }
  _valueOf(row) {
    if (row.k === 'bind') return this.rebinding === row.action ? '[press a key…]' : (bindings.keyboard[row.action] || '—');
    if (row.k === 'slider') return `${Math.round(bindings.options.audio[row.key] * 100)}%`;
    if (row.k === 'aimInvert') return bindings.options.aimInvert ? 'ON' : 'OFF';
    if (row.k === 'threatInd') return bindings.options.threatIndicators ? 'ON' : 'OFF';
    if (row.k === 'adultMaster') return this.mods.adultMasterEnabled ? 'ENABLED' : 'DISABLED';
    if (row.k === 'mod') { const on = this.mods.isOn(row.id); return on ? 'ON' : (row.id === 'adult_mode' && !this.mods.adultConfirmed ? 'OFF (needs 18+)' : 'OFF'); }
    return '';
  }
}
