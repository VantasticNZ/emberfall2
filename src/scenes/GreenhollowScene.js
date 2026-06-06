// =============================================================================
// GreenhollowScene — VERTICAL SLICE, STAGE 1. A small walkable Greenhollow green
// on the write-once systems (Character/Movement/Collision/DepthSort/Interaction)
// + LPC art, with ONE talkable NPC (Mara) whose dialogue is the REAL data-driven
// M1 "A Greenhollow Morning" run through the Dialogue + QuestEngine systems:
// talking actually starts M1, advancing walks its nodes, and the greet/ignore
// CHOICE applies karma + completes the quest. No combat/shop/day-night yet.
// =============================================================================

import Phaser from 'phaser';
import { WORLD } from '../data/world.js';
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
import { memoryStorage } from '../systems/storage.js';
import { GREENHOLLOW_CHILDHOOD } from '../data/quests/index.js';

const tileToPx = (t) => t * TILE + TILE / 2;

// Which face/expression the dialogue portrait shows per speaker (real LPC outfits).
const SPEAKER_FACE = {
  Mara: { parts: WORLD.maraParts, expression: 'happy' },    // feminine, forest shirt
  Bram: { parts: WORLD.bramParts, expression: 'neutral' },  // bearded smith
};

export class GreenhollowScene extends Phaser.Scene {
  constructor() { super('Greenhollow'); }

  create() {
    AssetLoader.build(this);
    DepthSort.reset();
    Interaction.reset();

    // The real systems, fresh for the slice (memory storage = clean each load).
    this.karma = new KarmaEngine({ storage: memoryStorage() });
    this.quests = new QuestEngine({ karma: this.karma, storage: memoryStorage(), quests: GREENHOLLOW_CHILDHOOD });

    const worldW = WORLD.widthTiles * TILE;
    const worldH = WORLD.heightTiles * TILE;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    this._buildGround(worldW, worldH);
    this._buildPond();
    this._scatterDecals();
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();

    Collision.wire(this, this.actors, this.solids);

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.setRoundPixels(true);
    this.zoomLevels = [0.7, 0.85, 1.1];
    this.zoomIndex = 1;
    this.cameras.main.setZoom(this.zoomLevels[this.zoomIndex]);

    this._dlg = null;
    this._buildInput();
    this._buildUI();
    this._buildDebug();
  }

  // ---- GROUND ---------------------------------------------------------------
  _buildGround(worldW, worldH) {
    const paint = (key, x, y, w, h) => { const ts = this.add.tileSprite(x, y, w, h, key).setOrigin(0, 0); DepthSort.pinFloor(ts); return ts; };
    paint(WORLD.ground.base, 0, 0, worldW, worldH);
    for (const [key, tx, ty, w, h] of WORLD.ground.rects) paint(key, tx * TILE, ty * TILE, w * TILE, h * TILE);
  }

  _scatterDecals() {
    const cfg = WORLD.decals; if (!cfg) return;
    let seed = cfg.seed >>> 0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const onGrass = (px, py) => {
      const tx = px / TILE, ty = py / TILE;
      const p = WORLD.pond;                       // keep decals off the water
      if (p && tx >= p.tx - 0.5 && tx < p.tx + p.w + 0.5 && ty >= p.ty - 0.5 && ty < p.ty + p.h + 0.5) return false;
      for (const [key, rx, ry, rw, rh] of WORLD.ground.rects) {
        if (key === 'tile_grass') continue;
        if (tx >= rx && tx < rx + rw && ty >= ry && ty < ry + rh) return false;
      }
      return true;
    };
    const W = WORLD.widthTiles * TILE, H = WORLD.heightTiles * TILE;
    let placed = 0, tries = 0;
    while (placed < cfg.count && tries < cfg.count * 10) {
      tries++;
      const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H);
      if (!onGrass(px, py)) continue;
      this.add.image(px, py, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, 1).setDepth(DEPTH.FLOOR + 1);
      placed++;
    }
  }

  // ---- POND (9-sliced LPC water: grass banks + shore, not a flat blue box) ---
  _buildPond() {
    const p = WORLD.pond; if (!p) return;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
        const img = this.add.image((p.tx + x) * TILE, (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0);
        DepthSort.pinFloor(img);
      }
    }
  }

  _buildProps() {
    for (const p of WORLD.props) {
      const d = PROPS[p.key];
      const spr = this.physics.add.sprite(tileToPx(p.tx), tileToPx(p.ty), p.key).setOrigin(0.5, 0.5);
      if (p.solid && d.footprint) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); }
      else if (spr.body) { spr.body.enable = false; }
      DepthSort.track(spr, d.footprint ? d.footprint.offY : d.height / 2);
    }
  }

  // ---- THE ONE NPC (Mara) — wired to the real M1 quest dialogue --------------
  _buildNPCs() {
    for (const n of WORLD.npcs) {
      const npc = new Character(this, tileToPx(n.tx), tileToPx(n.ty),
        { parts: n.parts, facing: n.facing, speed: n.speed, expression: n.expression });
      Collision.markSolidActor(npc); this.solids.add(npc); DepthSort.track(npc, CHAR_FOOTPRINT.offY);
      Interaction.register({
        x: npc.x, y: npc.y + CHAR_FOOTPRINT.offY, radius: 50, prompt: `Talk to ${n.name}`,
        onInteract: () => { npc.facing = this._faceToward(npc, this.player); npc.setState('idle'); this._startQuestDialogue(n.quest); },
      });
    }
  }

  _buildPlayer() {
    const pd = WORLD.player;
    this.player = new Character(this, tileToPx(pd.tx), tileToPx(pd.ty),
      { parts: pd.parts, facing: pd.facing, speed: pd.speed, expression: pd.expression });
    Collision.markPlayer(this.player);
    this.actors.add(this.player);
    DepthSort.track(this.player, CHAR_FOOTPRINT.offY);
  }

  // ---- INPUT ----------------------------------------------------------------
  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D', run: 'SHIFT', interact: 'E',
      one: 'ONE', two: 'TWO', three: 'THREE',
      zoomOut: 'OPEN_BRACKET', zoomIn: 'CLOSED_BRACKET', debug: 'B',
    });
    this.keys.zoomOut.on('down', () => this._stepZoom(-1));
    this.keys.zoomIn.on('down', () => this._stepZoom(+1));
    this.input.on('wheel', (_p, _o, _dx, dy) => this._stepZoom(dy > 0 ? -1 : +1));
    this.keys.debug.on('down', () => this._toggleDebug());

    // E = advance/confirm in dialogue, else interact
    this.keys.interact.on('down', () => {
      if (this._dlg) this._dialogueConfirm();
      else if (Interaction.active) Interaction.tryInteract();
    });
    // up/down navigate dialogue choices (W/S + arrows)
    [this.cursors.up, this.keys.up].forEach((k) => k.on('down', () => { if (this._dlg) this._dialogueNav(-1); }));
    [this.cursors.down, this.keys.down].forEach((k) => k.on('down', () => { if (this._dlg) this._dialogueNav(+1); }));
    // number keys = direct-select an option
    const pick = (i) => { if (this._dlg && i < this._dlg.options().length) { this._selOpt = i; this._dialogueConfirm(); } };
    this.keys.one.on('down', () => pick(0));
    this.keys.two.on('down', () => pick(1));
    this.keys.three.on('down', () => pick(2));
  }

  _stepZoom(dir) {
    const next = Phaser.Math.Clamp(this.zoomIndex + dir, 0, this.zoomLevels.length - 1);
    if (next === this.zoomIndex) return;
    this.zoomIndex = next;
    this.cameras.main.zoomTo(this.zoomLevels[next], 220, 'Sine.easeInOut');
  }

  // ---- UI -------------------------------------------------------------------
  _buildUI() {
    const W = this.scale.width, H = this.scale.height;
    const RES = 3;          // render UI text at 3x then downscale -> crisp, not aliased
    this._RES = RES;
    const txt = (x, y, s, size, color, extra = {}) =>
      this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra })
        .setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY);

    // --- HUD on a solid dark panel (readable over grass) ---
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const hudPanel = this.add.rectangle(6, 6, 404, 58, 0x14121c, 0.84).setOrigin(0, 0)
      .setStrokeStyle(2, 0xffe9c2, 0.9).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = txt(16, 12, 'EMBERFALL 2 — Greenhollow', 15, '#ffe9c2');
    const help = txt(16, 32, 'WASD / arrows: move    Shift: run    E: talk / advance    ↑↓: choose', 10, '#cfc6e6');
    this.questHud = txt(16, 46, '', 11, '#9fe6a0');
    this.hud.add([hudPanel, title, help, this.questHud]);
    this._updateQuestHud();

    // --- interaction prompt ---
    this.prompt = this.add.text(W / 2, H - 110, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#1c1422', backgroundColor: '#ffe9c2', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    // --- dialogue box (portrait + name + body + crisp readable choices) ---
    const boxW = 544, boxH = 200, bx = (W - boxW) / 2, by = H - boxH - 8;
    const PS = 112, px = bx + 10, py = by + 10;
    this.portraitBox = { x: px, y: py, size: PS };
    this._portrait = null;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const panel = this.add.rectangle(bx, by, boxW, boxH, 0x14121c, 0.95).setOrigin(0, 0).setStrokeStyle(3, 0xffe9c2).setScrollFactor(0);
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x2a2440, 1).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2).setScrollFactor(0);
    this._txtX = px + PS + 16;
    this.dlgName = txt(this._txtX, by + 12, '', 16, '#ffe9c2', { fontStyle: 'bold' });
    this.dlgBody = txt(this._txtX, by + 36, '', 13, '#f3ecff', { wordWrap: { width: boxW - (PS + 16 + 10) - 14 }, lineSpacing: 4 });
    this.dlgHint = this.add.text(bx + boxW - 12, by + boxH - 8, 'E ▸', { fontFamily: 'monospace', fontSize: '10px', color: '#9b93b0' })
      .setOrigin(1, 1).setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add([panel, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]);
    this._optTexts = [];
  }

  _updateQuestHud() {
    const st = this.quests.status('M1') || 'available';
    const m = this.karma.get('morality');
    this.questHud.setText(`Quest — A Greenhollow Morning: ${st.toUpperCase()}     Morality: ${m >= 0 ? '+' : ''}${m}`);
  }

  // ---- DATA-DRIVEN QUEST DIALOGUE -------------------------------------------
  _startQuestDialogue(qid) {
    const def = this.quests.defs[qid];
    if (!def || !def.dialogue) return;
    if (this.quests.status(qid) === 'available') this.quests.start(qid);
    this._activeQuest = qid;
    this._dlg = new Dialogue(def.dialogue, { karma: this.karma, engine: this.quests });
    this._selOpt = 0;
    Movement.stop(this.player);
    this.prompt.setVisible(false);
    this.dialogue.setVisible(true);
    this._renderNode();
    this._updateQuestHud();
  }

  _renderNode() {
    const node = this._dlg.node();
    if (!node) { this._closeDialogue(); return; }
    this.dlgName.setText(node.speaker || '');
    this.dlgBody.setText(node.text || '');
    const face = SPEAKER_FACE[node.speaker];
    this._buildPortrait(face ? face.parts : null, face ? face.expression : 'neutral');
    this._renderOptions(this._dlg.options());
  }

  _renderOptions(opts) {
    this._optTexts.forEach((t) => t.destroy());
    this._optTexts = [];
    this._selOpt = Phaser.Math.Clamp(this._selOpt, 0, Math.max(0, opts.length - 1));
    const isChoice = opts.length > 1;
    const oy = this.dlgBody.y + this.dlgBody.height + 8;
    opts.forEach((o, i) => {
      const sel = i === this._selOpt;
      const t = this.add.text(this._txtX, oy + i * 17, `${sel ? '▸' : '  '} ${o.label}`, {
        fontFamily: 'monospace', fontSize: '12px', color: sel ? '#ffe9c2' : '#cfc6e6',
      }).setResolution(this._RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
      this.dialogue.add(t);
      this._optTexts.push(t);
    });
    this.dlgHint.setText(isChoice ? '↑↓ choose · E select' : 'E ▸');
  }

  _dialogueNav(d) {
    const opts = this._dlg.options();
    if (opts.length < 2) return;
    this._selOpt = Phaser.Math.Clamp(this._selOpt + d, 0, opts.length - 1);
    this._renderOptions(opts);
  }

  _dialogueConfirm() {
    this._dlg.select(this._selOpt);
    this._selOpt = 0;
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue();
    else this._renderNode();
    this._updateQuestHud();
  }

  _closeDialogue() {
    // finishing the quest's dialogue completes the quest (M1 active -> complete)
    if (this._activeQuest && this.quests.status(this._activeQuest) === 'active') this.quests.complete(this._activeQuest);
    this.dialogue.setVisible(false);
    this._optTexts.forEach((t) => t.destroy());
    this._optTexts = [];
    this._dlg = null;
    this._activeQuest = null;
    this._updateQuestHud();
  }

  // Compose a large LPC face portrait of the speaker into the box.
  _buildPortrait(parts, expression = 'neutral') {
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    this.portraitFrame.setVisible(!!parts);
    if (!parts) return;
    const FACE_SLOTS = new Set(['body', 'torso', 'head', 'brows', 'beard', 'hair']);
    const layers = [];
    for (const pk of parts) {
      const part = PARTS[pk];
      if (!part || !FACE_SLOTS.has(part.slot)) continue;
      for (const L of part.layers) layers.push({ ...L, slot: part.slot });
    }
    layers.sort((a, b) => a.z - b.z);
    const idleFrame = DIR_ROW.down * ANIMS.idle.frames;
    const exprFrame = EXPR_ROW.down * EXPR_COLS + (EXPRESSIONS[expression] ?? 0);
    const cx = 16, cy = 10, cw = 32, ch = 42;
    const rt = this.make.renderTexture({ x: 0, y: 0, width: cw, height: ch }, false);
    for (const L of layers) {
      if (L.expressive) rt.drawFrame(`${L.tex}__expr`, exprFrame, -cx, -cy);
      else rt.drawFrame(`${L.tex}__idle`, idleFrame, -cx, -cy);
    }
    const { x, y, size } = this.portraitBox;
    const scale = Math.min((size - 6) / cw, (size - 6) / ch);
    rt.setOrigin(0.5, 0.5).setPosition(x + size / 2, y + size / 2).setScale(scale).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add(rt);
    this._portrait = rt;
  }

  _buildDebug() {
    this.debugOn = false;
    this.physics.world.createDebugGraphic();
    this.physics.world.debugGraphic.setDepth(DEPTH.OVERLAY + 1).setVisible(false);
    this.physics.world.drawDebug = false;
  }
  _toggleDebug() {
    this.debugOn = !this.debugOn;
    this.physics.world.drawDebug = this.debugOn;
    this.physics.world.debugGraphic.setVisible(this.debugOn);
    if (!this.debugOn) this.physics.world.debugGraphic.clear();
  }

  _faceToward(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'up' : 'down';
  }

  // ---- LOOP -----------------------------------------------------------------
  update() {
    if (this._dlg) { Movement.stop(this.player); DepthSort.update(); return; }

    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) dy += 1;
    Movement.drive(this.player, dx, dy, this.keys.run.isDown);

    DepthSort.update();

    const active = Interaction.update(this.player);
    if (active) this.prompt.setText(`${active.prompt}  (E)`).setVisible(true);
    else this.prompt.setVisible(false);
  }
}
