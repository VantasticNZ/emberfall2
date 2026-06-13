// =============================================================================
// TitleScene — the GAME-START SHELL (PART B): title menu (S1) → character select (S2) → intro myth cards
// (S3), then hands off to the Overworld which boots the child. Houses the reusable CUTSCENE CARD PLAYER (S4).
// Canon-toned (the First Flame myth, LORE-CANON §1). Keyboard-driven; every panel centred + clamped (L5).
// =============================================================================
import { Character } from '../systems/Character.js';
import { defaultStorage } from '../systems/storage.js';
import { CardSequence } from '../systems/CardSequence.js';

const SAVE_KEY = 'emberfall:world:overworld';
const PRESET_KEY = 'ember:childPreset';
const store = defaultStorage();

// CHARACTER SELECT v2 — four base KINDS, each with colour variants + style/accessory options, every combination
// a COMPLETE matched child set (L1: clothed child body + child head + seated child hair). MONSTER = the honest
// goblin-child built from owned parts (green-tinted body + horned head); a true creature rig is a commission.
const BASES = [
  { key: 'boy',  label: 'Boy',  head: 'child_head',
    colours: [{ l: 'Blue', body: 'child_body_blue' }, { l: 'Green', body: 'child_body_green' }, { l: 'Rust', body: 'child_body_rust' }],
    styles:  [{ l: 'Chestnut crop', hair: 'child_hair_natural' }, { l: 'Black crop', hair: 'child_hair_black' }, { l: 'Ginger crop', hair: 'child_hair_ginger' }] },
  { key: 'girl', label: 'Girl', head: 'child_head',
    colours: [{ l: 'Blue', body: 'child_body_blue' }, { l: 'Green', body: 'child_body_green' }, { l: 'Rust', body: 'child_body_rust' }],
    styles:  [{ l: 'Blonde bob', hair: 'child_hair_bob' }, { l: 'Auburn crop', hair: 'child_hair_auburn' }] },
  { key: 'nb',   label: 'Child', head: 'child_head',
    colours: [{ l: 'Blue', body: 'child_body_blue' }, { l: 'Green', body: 'child_body_green' }, { l: 'Rust', body: 'child_body_rust' }],
    styles:  [{ l: 'Blond crop', hair: 'child_hair_blond' }, { l: 'Chestnut crop', hair: 'child_hair_natural' }] },
  { key: 'monster', label: 'Goblin', head: 'child_head_monster',
    colours: [{ l: 'Mossy', body: 'child_body_monster_mossy' }, { l: 'Ash', body: 'child_body_monster_ash' }, { l: 'Blood', body: 'child_body_monster_blood' }],
    styles:  [{ l: 'Horned', hair: null }] },
];

// The intro myth — 3 cards in the LORE-CANON voice (the believed story; the truth is seeded later).
const INTRO_CARDS = [
  'Long ago the land was cold and dark.',
  'Then the First Flame — the Ember — came up out of the deep, and gave the world its warmth.\n\nThe Oracles shared it: a kept hearth-fire for every village, so none would be cold again.',
  'They built the chapels to bless the flames, and the land took the Ember\'s name.\n\nEmberfall.',
];

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0808');
    this._W = this.scale.width; this._H = this.scale.height;
    this.hasSave = !!store.read(SAVE_KEY);
    this._mode = 'menu';
    this._buildMenu();
    this.input.keyboard.on('keydown-UP', () => this._nav(-1));
    this.input.keyboard.on('keydown-W', () => this._nav(-1));
    this.input.keyboard.on('keydown-DOWN', () => this._nav(1));
    this.input.keyboard.on('keydown-S', () => this._nav(1));
    this.input.keyboard.on('keydown-LEFT', () => this._navX(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this._navX(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-E', () => this._confirm());
    this.input.keyboard.on('keydown-TAB', (e) => { if (e && e.preventDefault) e.preventDefault(); this._navStyle(1); });
    this.input.keyboard.on('keydown-ESC', () => this._onEsc());
  }

  // ---- S1: TITLE MENU --------------------------------------------------------
  _buildMenu() {
    this._clear();
    const cx = this._W / 2;
    this._made.push(this.add.text(cx, this._H * 0.26, 'EMBERFALL', { fontFamily: 'Georgia, serif', fontSize: '64px', color: '#ffcf6a' }).setOrigin(0.5));
    this._made.push(this.add.text(cx, this._H * 0.26 + 56, 'a warm fire, and the cold truth beneath it', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#9a8f7a' }).setOrigin(0.5));
    this._items = [{ k: 'new', label: 'New Game' }];
    if (this.hasSave) this._items.push({ k: 'continue', label: 'Continue' });
    this._items.push({ k: 'settings', label: 'Settings' });
    this._sel = 0; this._rows = [];
    this._items.forEach((it, i) => {
      const t = this.add.text(cx, this._H * 0.52 + i * 42, it.label, { fontFamily: 'monospace', fontSize: '22px', color: '#cfc3a8' }).setOrigin(0.5);
      this._rows.push(t); this._made.push(t);
    });
    this._hint = this.add.text(cx, this._H - 36, '↑↓ choose · Enter select', { fontFamily: 'monospace', fontSize: '12px', color: '#6a6050' }).setOrigin(0.5);
    this._made.push(this._hint);
    this._render();
  }
  _render() {
    if (this._mode === 'menu') this._rows.forEach((t, i) => { const s = i === this._sel; t.setColor(s ? '#ffe08a' : '#cfc3a8').setText((s ? '▸ ' : '  ') + this._items[i].label); });
    if (this._mode === 'select') {
      this._baseTabs.forEach((t, i) => t.setColor(i === this._bsel ? '#ffe08a' : '#9a8f7a').setText((i === this._bsel ? '▸ ' : '  ') + BASES[i].label));
      const b = BASES[this._bsel];
      this._colourLabel.setText('Colour  ' + b.colours[this._csel].l + '   ‹↑↓›');
      this._styleLabel.setText((b.key === 'monster' ? 'Look    ' : 'Hair    ') + b.styles[this._ssel].l + (b.styles.length > 1 ? '   ‹Tab›' : ''));
    }
  }
  _nav(d) {                                   // UP/DOWN: menu rows, OR colour variant in select
    if (this._mode === 'menu') { this._sel = Phaser.Math.Clamp(this._sel + d, 0, this._items.length - 1); this._render(); }
    else if (this._mode === 'select') { const n = BASES[this._bsel].colours.length; this._csel = (this._csel + d + n) % n; this._buildPreview(); this._render(); }
  }
  _navX(d) {                                  // LEFT/RIGHT: base KIND in select
    if (this._mode !== 'select') return;
    this._bsel = (this._bsel + d + BASES.length) % BASES.length;
    this._csel = Math.min(this._csel, BASES[this._bsel].colours.length - 1);
    this._ssel = Math.min(this._ssel, BASES[this._bsel].styles.length - 1);
    this._buildPreview(); this._render();
  }
  _navStyle(d) {                              // TAB: style/accessory within the base
    if (this._mode !== 'select') return;
    const n = BASES[this._bsel].styles.length; this._ssel = (this._ssel + d + n) % n;
    this._buildPreview(); this._render();
  }
  _onEsc() { if (this._mode === 'select') { this._buildMenu(); this._mode = 'menu'; } else if (this._mode === 'cards') this._skipCards(); }

  _curParts() {
    const b = BASES[this._bsel];
    return [b.colours[this._csel].body, b.head, b.styles[this._ssel].hair].filter(Boolean);
  }

  _confirm() {
    if (this._mode === 'menu') {
      const k = this._items[this._sel].k;
      if (k === 'continue') return this._startGame(false);
      if (k === 'settings') { this.scene.launch('Options', { caller: 'Title', mods: null, im: null }); return; }
      if (k === 'new') return this._buildSelect();
    } else if (this._mode === 'select') {
      store.write(PRESET_KEY, this._curParts().join('|'));   // full L1-complete parts list
      this._playCards(INTRO_CARDS, () => this._startGame(true));
    } else if (this._mode === 'cards') this._advanceCard();
  }

  // ---- S2: CHARACTER SELECT v2 (kind × colour × style) -----------------------
  _buildSelect() {
    this._clear(); this._mode = 'select'; this._bsel = 0; this._csel = 0; this._ssel = 0;
    const cx = this._W / 2;
    this._made.push(this.add.text(cx, this._H * 0.13, 'Who will you be?', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ffcf6a' }).setOrigin(0.5));
    this._made.push(this.add.text(cx, this._H * 0.13 + 32, '(a child of Greenhollow — you grow into who you choose to become)', { fontFamily: 'monospace', fontSize: '13px', color: '#8a8068' }).setOrigin(0.5));
    // base KIND tabs, evenly spread + centred
    const span = 360, x0 = cx - span / 2;
    this._baseTabs = BASES.map((b, i) => { const t = this.add.text(x0 + (i + 0.5) * (span / BASES.length), this._H * 0.27, b.label, { fontFamily: 'monospace', fontSize: '16px', color: '#9a8f7a' }).setOrigin(0.5); this._made.push(t); return t; });
    // colour + style read-outs
    this._colourLabel = this.add.text(cx, this._H * 0.78, '', { fontFamily: 'monospace', fontSize: '15px', color: '#cfc3a8' }).setOrigin(0.5); this._made.push(this._colourLabel);
    this._styleLabel  = this.add.text(cx, this._H * 0.78 + 26, '', { fontFamily: 'monospace', fontSize: '15px', color: '#cfc3a8' }).setOrigin(0.5); this._made.push(this._styleLabel);
    this._hint = this.add.text(cx, this._H - 30, '←→ kind   ↑↓ colour   Tab style   Enter begin   Esc back', { fontFamily: 'monospace', fontSize: '12px', color: '#6a6050' }).setOrigin(0.5); this._made.push(this._hint);
    this._buildPreview(); this._render();
  }
  _buildPreview() {
    if (this._preview) { try { this._preview.destroy(); } catch (_) {} this._preview = null; }
    try {
      const ch = new Character(this, this._W / 2, this._H * 0.52, { parts: this._curParts(), facing: 'down', speed: 0 });   // FORWARD-FACING, full L1 set
      this.add.existing(ch); if (ch.body) ch.body.enable = false; ch.setScale(4); this._preview = ch;
    } catch (_) { this._preview = null; }
  }

  // ---- S3/S4: INTRO MYTH via the reusable CardSequence system ----------------
  // Esc full-skips only AFTER the first viewing (S3 spec) — a persisted 'introSeen' flag. First time, you
  // page through with Enter; thereafter Esc jumps straight to waking. Enter always advances one card.
  _playCards(cards, onDone) {
    this._mode = 'cards';
    this._introSkippable = !!store.read('ember:introSeen');
    const hint = this._introSkippable ? 'Enter / E ▸   ·   Esc skip' : 'Enter / E ▸';
    this._clear();   // tear down menu/select; CardSequence owns its own cover+text
    this._cardSeq = new CardSequence(this, cards, { manual: true, hint, onDone: () => {
      store.write('ember:introSeen', '1');
      this._mode = 'done'; if (this._cardSeq) { this._cardSeq.destroy(); this._cardSeq = null; } onDone();
    } });
  }
  _advanceCard() { if (this._cardSeq) this._cardSeq.advance(); }
  _skipCards() { if (this._cardSeq && this._introSkippable) this._cardSeq.skip(); }

  // ---- hand off --------------------------------------------------------------
  _startGame(fresh) {
    if (fresh) { try { store.remove(SAVE_KEY); } catch (_) {} }   // New Game starts clean → boots child
    this.scene.start('Overworld');
  }

  _clear() { (this._made || []).forEach((o) => { try { o.destroy(); } catch (_) {} }); this._made = []; if (this._preview) { try { this._preview.destroy(); } catch (_) {} this._preview = null; } }
}
