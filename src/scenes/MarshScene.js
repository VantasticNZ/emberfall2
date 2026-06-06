// =============================================================================
// MarshScene — ASHEN MARSH arrival, rendered with the SAME proven pattern as the
// Greenhollow slice (tilemap + collision + depth-sort + NPC interaction + the
// data-driven Dialogue UI), wired to the EXISTING M8 quest. No combat (childhood-
// canon rule: combat starts here in the adult act, but the ARRIVAL is talk/explore).
// Bog mood via tints on the confirmed LPC tiles (no placeholder art).
//
// FLAGGED: this duplicates Greenhollow's generic rendering/dialogue — a morning
// follow-up should extract a shared RegionScene base so both regions share it.
// =============================================================================

import Phaser from 'phaser';
import { MARSH } from '../data/marsh.js';
import { PROPS, PARTS, TILE, DIR_ROW, ANIMS, EXPRESSIONS, EXPR_COLS, EXPR_ROW, CHAR_FOOTPRINT } from '../data/assets.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { Character } from '../systems/Character.js';
import { Movement } from '../systems/Movement.js';
import { Collision } from '../systems/Collision.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { Interaction } from '../systems/Interaction.js';
import { Dialogue } from '../systems/Dialogue.js';
import { QuestEngine } from '../systems/QuestEngine.js';
import { KarmaEngine } from '../systems/Karma.js';
import { Inventory } from '../systems/Inventory.js';
import { PlayerCombat } from '../systems/Combat.js';
import { InputMap } from '../systems/Input.js';
import { EnemyController } from '../systems/EnemyController.js';
import { memoryStorage } from '../systems/storage.js';
import { COMBAT } from '../constants/standards.js';
import { bindings } from '../constants/controls.js';
import { ASHEN_MARSH } from '../data/quests/index.js';

const FACE_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

const tileToPx = (t) => t * TILE + TILE / 2;
const SPEAKER_FACE = {
  'Elder Yssa': { parts: MARSH.yssaParts, expression: 'sad' },
  Hagga: { parts: MARSH.haggaParts, expression: 'neutral' },
};

export class MarshScene extends Phaser.Scene {
  constructor() { super('Marsh'); }

  create() {
    AssetLoader.build(this);
    DepthSort.reset();
    Interaction.reset();
    this.karma = new KarmaEngine({ storage: memoryStorage() });
    this.quests = new QuestEngine({ karma: this.karma, storage: memoryStorage(), quests: ASHEN_MARSH }); // M8 is a root here

    const worldW = MARSH.widthTiles * TILE, worldH = MARSH.heightTiles * TILE;
    this.worldW = worldW; this.worldH = worldH;
    this.edgeMargin = 3 * TILE;
    this.physics.world.setBounds(this.edgeMargin, this.edgeMargin, worldW - this.edgeMargin * 2, worldH - this.edgeMargin * 2);

    this._buildGround(worldW, worldH);
    this._buildPools();
    this._scatterDecals();
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();
    Collision.wire(this, this.actors, this.solids);

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(false);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.cameras.main.setBackgroundColor('#14201c');     // dark bog backdrop beyond the world
    this.baseZoom = 1.25; this._applyCamera();

    this._dlg = null;
    this._buildInput();
    this._buildUI();
    this._initCombat();
    this._setupUICamera();
    this.scale.on('resize', (sz) => { this._applyCamera(); this._layoutUI(); this.uiCamera.setSize(sz.width, sz.height); });
  }

  _setupUICamera() {
    const ui = [this.hud, this.dialogue, this.prompt, this.playerHpUI, this.banner];
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(ui);
    this.uiCamera.ignore(this.children.list.filter((o) => !ui.includes(o)));
  }
  _applyCamera() {
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setZoom(Math.max(Math.max(W / this.worldW, H / this.worldH), this.baseZoom));
  }

  // ---- WORLD ----------------------------------------------------------------
  _buildGround(worldW, worldH) {
    const ts = this.add.tileSprite(0, 0, worldW, worldH, MARSH.ground.base).setOrigin(0, 0).setTint(MARSH.tint.ground);
    DepthSort.pinFloor(ts);
  }
  _buildPools() {
    for (const p of MARSH.pools) {
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
          const img = this.add.image((p.tx + x) * TILE, (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0).setTint(MARSH.tint.water);
          DepthSort.pinFloor(img);
        }
      }
    }
  }
  _inPool(tx, ty) {
    return MARSH.pools.some((p) => tx >= p.tx - 0.5 && tx < p.tx + p.w + 0.5 && ty >= p.ty - 0.5 && ty < p.ty + p.h + 0.5);
  }
  _scatterDecals() {
    const W = MARSH.widthTiles * TILE, H = MARSH.heightTiles * TILE, m = 2 * TILE;
    const ok = (px, py) => !(px < m || px > W - m || py < m || py > H - m) && !this._inPool(px / TILE, py / TILE);
    const scatter = (cfg, originY, depth) => {
      if (!cfg) return; let seed = cfg.seed >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      let placed = 0, tries = 0;
      while (placed < cfg.count && tries < cfg.count * 12) {
        tries++; const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H);
        if (!ok(px, py)) continue;
        this.add.image(px, py, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, originY).setDepth(depth).setTint(MARSH.tint.decal);
        placed++;
      }
    };
    scatter(MARSH.mud, 0.5, DEPTH.FLOOR + 1);
    scatter(MARSH.decals, 1, DEPTH.FLOOR + 2);
  }
  _buildProps() {
    for (const p of MARSH.props) {
      const d = PROPS[p.key];
      const spr = this.physics.add.sprite(tileToPx(p.tx), tileToPx(p.ty), p.key).setOrigin(0.5, 0.5);
      if (p.key.startsWith('prop_tree')) spr.setTint(MARSH.tint.tree);    // dead-looking trees
      if (p.solid && d.footprint) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); }
      else if (spr.body) { spr.body.enable = false; }
      DepthSort.track(spr, d.footprint ? d.footprint.offY : d.height / 2);
    }
  }
  _buildNPCs() {
    for (const n of MARSH.npcs) {
      const npc = new Character(this, tileToPx(n.tx), tileToPx(n.ty), { parts: n.parts, facing: n.facing, speed: n.speed, expression: n.expression });
      Collision.markSolidActor(npc); this.solids.add(npc); DepthSort.track(npc, CHAR_FOOTPRINT.offY);
      Interaction.register({
        x: npc.x, y: npc.y + CHAR_FOOTPRINT.offY, prompt: `Talk to ${n.name}`,
        onInteract: () => {
          npc.facing = this._faceToward(npc, this.player); npc.setState('idle');
          if (n.quest && this.quests.status(n.quest) !== 'complete') this._startQuest(n.quest);
          else if (n.done) this._startGreeting(n.name, n.done);
          else if (n.greeting) this._startGreeting(n.name, n.greeting);
        },
      });
    }
  }
  _buildPlayer() {
    const pd = MARSH.player;
    this.player = new Character(this, tileToPx(pd.tx), tileToPx(pd.ty), { parts: pd.parts, facing: pd.facing, speed: pd.speed, expression: pd.expression });
    Collision.markPlayer(this.player); this.actors.add(this.player); DepthSort.track(this.player, CHAR_FOOTPRINT.offY);
  }

  // ---- INPUT (canonical control map; combat actions wired) ------------------
  _buildInput() {
    this.im = new InputMap(this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ back: 'G' });
    this.im.onPress('interact', () => { if (this._dlg) this._dialogueConfirm(); else if (Interaction.active) Interaction.tryInteract(); });
    this.im.onPress('attack', () => { if (this._canAct()) this._playerAttack(); });
    this.im.onPress('dodge', () => { if (this._canAct()) this._tryDodge(); });
    this.im.onPress('move_up', () => { if (this._dlg) this._dialogueNav(-1); });
    this.im.onPress('move_down', () => { if (this._dlg) this._dialogueNav(+1); });
    this.cursors.up.on('down', () => { if (this._dlg) this._dialogueNav(-1); });
    this.cursors.down.on('down', () => { if (this._dlg) this._dialogueNav(+1); });
    this.input.on('pointerdown', (ptr) => { if (ptr.leftButtonDown() && this._canAct()) this._playerAttack(); });
    this.keys.back.on('down', () => this.scene.start('Greenhollow'));   // dev nav back to the slice
  }
  _canAct() { return !this._dlg && this._hitFreeze <= 0; }

  // ---- UI + DIALOGUE (same language as Greenhollow) -------------------------
  _buildUI() {
    const W = this.scale.width, H = this.scale.height; this._builtW = W; this._builtH = H; this._RES = 2;
    const txt = (x, y, s, size, color, extra = {}) => this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const panel = this.add.rectangle(8, 8, 470, 62, 0x10171a, 0.86).setOrigin(0, 0).setStrokeStyle(2, 0x9fd0c2, 0.9).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = txt(18, 14, 'EMBERFALL 2 — Ashen Marsh', 18, '#cfeee2');
    const help = txt(18, 42, 'WASD move · J attack · Space dodge · C block · E talk · G back', 11, '#9fc0b6');
    this.questHud = txt(18, 0, '', 12, '#bfe6c2'); this.questHud.setVisible(false);
    this.hud.add([panel, title, help]);
    this.prompt = this.add.text(W / 2, H - 140, '', { fontFamily: 'monospace', fontSize: '17px', color: '#102018', backgroundColor: '#bfe6c2', padding: { x: 10, y: 5 } }).setOrigin(0.5, 1).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const boxW = 824, boxH = 286, bx = (W - boxW) / 2, by = H - boxH - 12; this._boxBx = bx; this._boxW = boxW;
    const PS = 168, px = bx + 14, py = by + 14; this.portraitBox = { x: px, y: py, size: PS }; this._portrait = null;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const dpanel = this.add.rectangle(bx, by, boxW, boxH, 0x10171a, 0.96).setOrigin(0, 0).setStrokeStyle(3, 0x9fd0c2).setScrollFactor(0);
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x223028, 1).setOrigin(0, 0).setStrokeStyle(2, 0x9fd0c2).setScrollFactor(0);
    this._txtX = px + PS + 20;
    this.dlgName = txt(this._txtX, by + 16, '', 22, '#cfeee2', { fontStyle: 'bold' });
    this.dlgBody = txt(this._txtX, by + 48, '', 17, '#eaf6ef', { wordWrap: { width: boxW - (PS + 34) - 18 }, lineSpacing: 5 });
    this.dlgHint = this.add.text(bx + boxW - 14, by + boxH - 10, 'E ▸', { fontFamily: 'monospace', fontSize: '13px', color: '#7fae9f' }).setOrigin(1, 1).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add([dpanel, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]);
    this._optTexts = [];
  }
  _layoutUI() { const W = this.scale.width, H = this.scale.height; this.dialogue.setPosition((W - this._builtW) / 2, H - this._builtH); if (this.prompt) this.prompt.setPosition(W / 2, H - 140); }

  _startQuest(qid) {
    const def = this.quests.defs[qid]; if (!def || !def.dialogue) return;
    if (this.quests.status(qid) === 'available') this.quests.start(qid);
    this._activeQuest = qid;
    this._dlg = new Dialogue(def.dialogue, { karma: this.karma, engine: this.quests });
    this._selOpt = 0; Movement.stop(this.player); this.prompt.setVisible(false); this.dialogue.setVisible(true); this._renderNode();
  }
  _startGreeting(name, lines) {
    const nodes = {}; lines.forEach((t, i) => { const last = i === lines.length - 1; nodes[`g${i}`] = { speaker: name, text: t, options: [last ? { label: '(Step away.)', end: true } : { label: '(Listen.)', to: `g${i + 1}` }] }; });
    this._activeQuest = null; this._dlg = new Dialogue({ start: 'g0', nodes }, { karma: this.karma, engine: this.quests });
    this._selOpt = 0; Movement.stop(this.player); this.prompt.setVisible(false); this.dialogue.setVisible(true); this._renderNode();
  }
  _renderNode() {
    const node = this._dlg.node(); if (!node) { this._closeDialogue(); return; }
    this.dlgName.setText(node.speaker || ''); this.dlgBody.setText(node.text || '');
    const face = SPEAKER_FACE[node.speaker]; this._buildPortrait(face ? face.parts : null, face ? face.expression : 'neutral');
    this._renderOptions(this._dlg.options());
  }
  _renderOptions(opts) {
    this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    this._selOpt = Phaser.Math.Clamp(this._selOpt, 0, Math.max(0, opts.length - 1));
    const isChoice = opts.length > 1, x = this._txtX, rowH = 28, barW = this._boxBx + this._boxW - x - 8;
    const oy = this.dlgBody.y + this.dlgBody.height + (isChoice ? 24 : 12);
    const add = (o) => { this.dialogue.add(o); this._optTexts.push(o); return o; };
    if (isChoice) add(this.add.text(x, oy - 20, '─ CHOOSE ─', { fontFamily: 'monospace', fontSize: '11px', color: '#7fae9f', fontStyle: 'bold' }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    opts.forEach((o, i) => {
      const sel = i === this._selOpt, y = oy + i * rowH;
      if (sel) add(this.add.rectangle(x - 8, y - 3, barW, rowH - 4, 0xbfe6c2, 1).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
      add(this.add.text(x, y, `${sel ? '▶ ' : '   '}${isChoice ? `${i + 1}. ` : ''}${o.label}`, { fontFamily: 'monospace', fontSize: '16px', color: sel ? '#102018' : '#9fc0b6', fontStyle: sel ? 'bold' : 'normal' }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    });
    this.dlgHint.setText(isChoice ? '↑↓ move · 1/2 or E to pick' : 'E to continue ▸');
  }
  _dialogueNav(d) { const o = this._dlg.options(); if (o.length < 2) return; this._selOpt = Phaser.Math.Clamp(this._selOpt + d, 0, o.length - 1); this._renderOptions(o); }
  _dialogueConfirm() {
    const wasNode = this._dlg.nodeId;
    this._dlg.select(this._selOpt); this._selOpt = 0;
    // M9: choosing "Raise the Lantern" at the guardian beat starts the REAL boss fight
    if (this._activeQuest === 'M9' && wasNode === 'guardian') { this._startBossFight(); return; }
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue(); else this._renderNode();
  }
  _closeDialogue() {
    if (this._activeQuest && this.quests.status(this._activeQuest) === 'active') this.quests.complete(this._activeQuest);
    this.dialogue.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
  }
  _buildPortrait(parts, expression = 'neutral') {
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    this.portraitFrame.setVisible(!!parts); if (!parts) return;
    const layers = [];
    for (const pk of parts) { const part = PARTS[pk]; if (!part) continue; for (const L of part.layers) { if (L.states && !L.states.includes('idle')) continue; layers.push({ ...L }); } }
    layers.sort((a, b) => a.z - b.z);
    const idleFrame = DIR_ROW.down * ANIMS.idle.frames, exprFrame = EXPR_ROW.down * EXPR_COLS + (EXPRESSIONS[expression] ?? 0);
    const cx = 16, cy = 11, cw = 32, ch = 50, rt = this.make.renderTexture({ x: 0, y: 0, width: cw, height: ch }, false);
    for (const L of layers) { if (L.expressive) rt.drawFrame(`${L.tex}__expr`, exprFrame, -cx, -cy); else rt.drawFrame(`${L.tex}__idle`, idleFrame, -cx, -cy); }
    const { x, y, size } = this.portraitBox, scale = Math.min((size - 6) / cw, (size - 6) / ch);
    rt.setOrigin(0.5, 0.5).setPosition(x + size / 2, y + size / 2).setScale(scale).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add(rt); this._portrait = rt;
  }
  _faceToward(from, to) { const dx = to.x - from.x, dy = to.y - from.y; if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right'; return dy < 0 ? 'up' : 'down'; }

  // ---- COMBAT (the first ADULT combat region — placement rule says combat is correct here) ----
  _initCombat() {
    this.player.isAdult = true; this.player.isMinor = false;
    this.player.equip('sword');
    this.inv = new Inventory({ storage: memoryStorage() });
    this.pc = new PlayerCombat();
    this._hitFreeze = 0; this._atkReady = 0; this._playerFlash = 0; this._inputDir = { dx: 0, dy: 0 }; this._bossActive = false;
    this._blockArcG = this.add.graphics().setDepth(DEPTH.OVERLAY);
    this.playerHpUI = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const panel = this.add.rectangle(8, 78, 220, 30, 0x10171a, 0.86).setOrigin(0, 0).setStrokeStyle(2, 0x9fd0c2, 0.9).setScrollFactor(0);
    this._hpBarBg = this.add.rectangle(16, 94, 160, 12, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpBarFill = this.add.rectangle(16, 94, 160, 12, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpLabel = this.add.text(182, 87, '', { fontFamily: 'monospace', fontSize: '13px', color: '#eaf6ef' }).setResolution(2).setScrollFactor(0);
    this.playerHpUI.add([panel, this._hpBarBg, this._hpBarFill, this._hpLabel]);
    this.banner = this.add.text(this.scale.width / 2, 92, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffe9c2', backgroundColor: '#10171acc', padding: { x: 10, y: 5 }, align: 'center' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    this.combat = new EnemyController(this, {
      solids: this.solids,
      onPlayerHit: (dmg, info) => this._onPlayerHit(dmg, info),
      onPlayerRecoil: (dmg) => this._onPlayerRecoil(dmg),
    });
    for (const en of (MARSH.enemies || [])) this.combat.spawn(en.id, { tx: en.tx, ty: en.ty });
    this._buildShrine();
  }
  _buildShrine() {
    const sh = MARSH.shrine; if (!sh) return;
    const x = tileToPx(sh.tx), y = tileToPx(sh.ty);
    const marker = this.physics.add.sprite(x, y, 'prop_sign').setTint(0x6a8a9a);  // FLAG: a real shrine-arch tile is wanted
    marker.body.enable = false; DepthSort.track(marker, 8);
    Interaction.register({ x, y: y + 8, prompt: `Enter ${sh.name}`, onInteract: () => {
      if (this.quests.status('M9') === 'complete') return this._startGreeting('', ['The shrine is silent now — the Guardian gone, the shard claimed.']);
      if (this.quests.status('M8') !== 'complete') return this._banner('Speak with Elder Yssa, then cross to Hagga (M8) first.');
      this._startQuest('M9');
    } });
  }
  _banner(t, ms = 2600) { this.banner.setText(t).setVisible(true); this.time.delayedCall(ms, () => this.banner && this.banner.setVisible(false)); }

  _playerAttack() {
    const now = this.time.now;
    if (now < this._atkReady || this.player.isBusy()) return;
    this._atkReady = now + COMBAT.ATTACK_COOLDOWN_MS;
    this.player.action('attack'); this._sfx('sfx_swing', 0.45);
    const tool = this._bossActive ? 'tool_lantern' : null;          // lantern strips the Guardian's shroud
    const out = this.combat.playerAttack(this.player, COMBAT.ATTACK_DAMAGE, { tool });
    for (const r of out) {
      if (r.outcome === 'hit' || r.outcome === 'swarm') { this._sfx('sfx_hit', 0.7); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES; this.cameras.main.shake(110, COMBAT.SHAKE_HIT); }
      else if (r.outcome === 'interrupted') { this._sfx('sfx_hit', 0.55); this._banner('Channel interrupted!', 1200); }
      else if (r.outcome === 'guarding') { this._sfx('sfx_swing', 0.3); this._banner('Blocked up front — FLANK it!', 1400); }
      else if (r.outcome === 'recoil') this._banner('It is charged — wait for the window!', 1400);
      if (r.killed && r.e.boss) this._onBossDefeated();
    }
  }
  _tryDodge() {
    const now = this.time.now;
    let { dx, dy } = this._inputDir; if (!dx && !dy) { const f = FACE_VEC[this.player.facing] || FACE_VEC.down; dx = f.x; dy = f.y; }
    this.pc.dodge(now, dx, dy);
  }
  _onPlayerHit(dmg, { fromFront, dir }) {
    const now = this.time.now, r = this.pc.takeDamage(now, dmg, { fromFront });
    if (r.outcome === 'dodged') return;
    if (r.outcome === 'parried') { this.pc.consumeParry(); const a = this.combat.nearest(this.player); if (a) this.combat.stagger(a); this._sfx('sfx_hit', 0.85); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES + 3; this.cameras.main.shake(160, COMBAT.SHAKE_HIT); return; }
    const blocked = r.outcome === 'blocked';
    this.inv.hp = Math.max(0, this.inv.hp - r.taken);
    this._sfx(blocked ? 'sfx_hit' : 'sfx_charge_impact', blocked ? 0.5 : 0.7);
    this._playerFlash = Math.round(COMBAT.FLASH_MS / 16); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES + (blocked ? 0 : 2);
    this.cameras.main.shake(blocked ? 110 : 200, blocked ? COMBAT.SHAKE_HIT : COMBAT.SHAKE_CHARGE);
    const k = blocked ? 0.4 : 1, d = dir || FACE_VEC.down;
    this.player.body.setVelocity(d.x * COMBAT.KNOCKBACK_SPEED * k, d.y * COMBAT.KNOCKBACK_SPEED * k);
    if (this.inv.hp <= 0) this._playerDown();
  }
  _onPlayerRecoil(dmg) {
    this.inv.hp = Math.max(0, this.inv.hp - dmg);
    this._playerFlash = Math.round(COMBAT.FLASH_MS / 16); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES;
    this.cameras.main.shake(140, COMBAT.SHAKE_CHARGE);
    if (this.inv.hp <= 0) this._playerDown();
  }
  _playerDown() {
    this.inv.hp = this.inv.stats().maxHp;
    const sp = MARSH.combatSpawn; this.player.x = tileToPx(sp.tx); this.player.y = tileToPx(sp.ty); this.player.body.reset(this.player.x, this.player.y);
    this.combat.enemies.forEach((e) => { e.awake = false; });
    if (this._bossActive && this.boss) { this.boss.alive = false; this.boss.spr.destroy(); this.boss = null; this._bossActive = false; if (this._dlg) this._closeDialogue(); }
    this._banner('You fall — and wake at the marsh edge.');
  }
  _startBossFight() {
    this.dialogue.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    Movement.stop(this.player);
    this._bossActive = true;
    const bs = MARSH.bossSpawn;
    this.boss = this.combat.spawn('drowned_guardian', { boss: true, tx: bs.tx, ty: bs.ty });
    this.player.x = tileToPx(bs.tx); this.player.y = tileToPx(bs.ty + 4); this.player.body.reset(this.player.x, this.player.y);
    this._banner('THE DROWNED GUARDIAN — your lantern strips its shroud, then strike. At half HP it rampages.', 4500);
  }
  _onBossDefeated() {
    this._bossActive = false; this.boss = null;
    if (this._dlg) { this._dlg.nodeId = 'claim'; this._dlg.done = false; this.dialogue.setVisible(true); this._renderNode(); }
    this._banner('The Guardian sinks. Something warm waits in the still water…', 3200);
  }
  _updatePlayerVisual(now) {
    this._blockArcG.clear();
    let t = null;
    if (this.pc.isBlocking()) { t = 0x66ccff; const f = FACE_VEC[this.player.facing] || FACE_VEC.down, ang = Math.atan2(f.y, f.x); this._blockArcG.lineStyle(7, 0x9fd8ff, 0.95).beginPath().arc(this.player.x + f.x * 20, this.player.y + f.y * 20 - 6, 22, ang - 1.0, ang + 1.0).strokePath(); }
    if (this.pc.isDodgeMoving(now)) { t = 0xeaf6ff; const prog = Math.min(1, Math.max(0, 1 - (this.pc.dodgeMoveUntil - now) / COMBAT.DODGE_DURATION_MS)), dip = Math.sin(prog * Math.PI); this.player.setScale(1 + 0.22 * dip, 1 - 0.5 * dip); }
    else if (this.player.scaleX !== 1 || this.player.scaleY !== 1) this.player.setScale(1, 1);
    if (this._playerFlash > 0) { t = 0xff5555; this._playerFlash--; }
    if (t == null) this.player.list.forEach((s) => s.clearTint && s.clearTint()); else this.player.list.forEach((s) => s.setTint && s.setTint(t));
  }
  _drawCombatUI() {
    const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
    this._hpBarFill.width = 160 * (hp / max); this._hpBarFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
    this._hpLabel.setText(`HP ${hp}/${max}`);
  }
  _sfx(key, vol = 0.6) { if (this.cache.audio.exists(key)) { const a = bindings.options.audio; this.sound.play(key, { volume: vol * a.master * a.sfx }); } }

  update(time, delta) {
    const dt = Math.min(delta || 16, 50) / 1000;
    if (this._hitFreeze > 0) { this._hitFreeze--; Movement.stop(this.player); this.combat.update(dt, this.player); DepthSort.update(); this._drawCombatUI(); return; }
    if (this._dlg) { Movement.stop(this.player); this._blockArcG.clear(); this.combat.update(dt, this.player); DepthSort.update(); this._drawCombatUI(); return; }
    const now = this.time.now;
    const { dx, dy } = this.im.vector(); this._inputDir = { dx, dy };
    this.pc.setBlocking(now, this.im.down('block') && !this.player.isBusy());
    if (this.pc.isDodgeMoving(now)) { const v = this.pc.dodgeVelocity(); this.player.body.setVelocity(v.x, v.y); }
    else if (this.pc.isBlocking()) Movement.stop(this.player);
    else Movement.drive(this.player, dx, dy, this.im.runHeld());
    this.combat.update(dt, this.player);
    this._updatePlayerVisual(now);
    DepthSort.update();
    this._drawCombatUI();
    const active = Interaction.update(this.player);
    if (active) this.prompt.setText(`${active.prompt}  (E)`).setVisible(true); else this.prompt.setVisible(false);
  }
}
