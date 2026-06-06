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
import { spawn as spawnMonster } from '../systems/Monsters.js';
import { Inventory } from '../systems/Inventory.js';
import { PlayerCombat } from '../systems/Combat.js';
import { InputMap } from '../systems/Input.js';
import { ModifierRegistry } from '../systems/Modifiers.js';
import { item } from '../data/items/index.js';
import { bindings } from '../constants/controls.js';
import { COMBAT } from '../constants/standards.js';

const tileToPx = (t) => t * TILE + TILE / 2;
const FACE_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

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
    // PLAY bounds are INSET from the world: the player can't walk to the very edge,
    // so the camera (clamped to the full world) always keeps a grass margin and no
    // sprite (player/foliage) ever clips at the world/screen top. (Item 4 fix.)
    this.edgeMargin = 3 * TILE;
    this.physics.world.setBounds(this.edgeMargin, this.edgeMargin, worldW - this.edgeMargin * 2, worldH - this.edgeMargin * 2);

    this._buildGround(worldW, worldH);
    this._buildPond();
    this._scatterDecals();
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();

    Collision.wire(this, this.actors, this.solids);

    this.worldW = worldW; this.worldH = worldH;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(false);                 // smooth follow — no pixel-snap jitter
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1); // gentle lerp
    this.baseZoom = 1.25;                                     // player-facing zoom; cover-zoom is the floor
    this._applyCamera();

    this._dlg = null;
    this._buildInput();
    this._buildUI();
    this._initCombat();        // player HP (Inventory) + the charger + combat HUD/bars (world objects before the UI camera)
    this._buildDebug();
    this._setupUICamera();
    // keep the camera filling + the UI placed when the window resizes
    this.scale.on('resize', (sz) => { this._applyCamera(); this._layoutUI(); this.uiCamera.setSize(sz.width, sz.height); });
  }

  // A dedicated UI camera at zoom 1 so the HUD/dialogue never scale or drift with
  // the world camera's zoom (scrollFactor-0 alone is still affected by zoom). The
  // main camera draws the world; the UI camera draws only the UI.
  _setupUICamera() {
    const ui = [this.hud, this.dialogue, this.prompt, this.playerHpUI];
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(ui);
    this.uiCamera.ignore(this.children.list.filter((o) => !ui.includes(o)));
  }

  // Zoom so the world always COVERS the viewport (no black bars beyond bounds),
  // never below the player's chosen baseZoom. Re-run on resize.
  _applyCamera() {
    const W = this.scale.width, H = this.scale.height;
    const cover = Math.max(W / this.worldW, H / this.worldH);
    this.cameras.main.setZoom(Math.max(cover, this.baseZoom));
  }

  // ---- GROUND ---------------------------------------------------------------
  _buildGround(worldW, worldH) {
    const paint = (key, x, y, w, h) => { const ts = this.add.tileSprite(x, y, w, h, key).setOrigin(0, 0); DepthSort.pinFloor(ts); return ts; };
    paint(WORLD.ground.base, 0, 0, worldW, worldH);
    for (const [key, tx, ty, w, h] of WORLD.ground.rects) paint(key, tx * TILE, ty * TILE, w * TILE, h * TILE);
  }

  _scatterDecals() {
    const W = WORLD.widthTiles * TILE, H = WORLD.heightTiles * TILE;
    const p = WORLD.pond;
    const m = 2 * TILE;                            // keep decals out of the edge margin (no clipped foliage)
    const onGrass = (px, py) => {                  // off the water, and inside the edge margin
      if (px < m || px > W - m || py < m || py > H - m) return false;
      const tx = px / TILE, ty = py / TILE;
      return !(p && tx >= p.tx - 0.5 && tx < p.tx + p.w + 0.5 && ty >= p.ty - 0.5 && ty < p.ty + p.h + 0.5);
    };
    const scatter = (cfg, originY, depth) => {
      if (!cfg) return;
      let seed = cfg.seed >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      let placed = 0, tries = 0;
      while (placed < cfg.count && tries < cfg.count * 12) {
        tries++;
        const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H);
        if (!onGrass(px, py)) continue;
        this.add.image(px, py, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, originY).setDepth(depth);
        placed++;
      }
    };
    scatter(WORLD.dirt, 0.5, DEPTH.FLOOR + 1);     // worn patches: flat on the ground, under plants
    scatter(WORLD.decals, 1, DEPTH.FLOOR + 2);     // grass/flowers: bottom-anchored, over the dirt
    scatter(WORLD.ferns, 1, DEPTH.FLOOR + 2);      // a few larger ferns, sparse
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
        x: npc.x, y: npc.y + CHAR_FOOTPRINT.offY, prompt: `Talk to ${n.name}`,  // canonical INTERACTION_RADIUS
        onInteract: () => {
          npc.facing = this._faceToward(npc, this.player); npc.setState('idle');
          if (n.quest && this.quests.status(n.quest) !== 'complete') this._startQuestDialogue(n.quest);
          else if (n.done) this._startGreeting(n.name, n.done);       // a finished quest -> a short post line (never re-run + re-award)
          else if (n.greeting) this._startGreeting(n.name, n.greeting);
        },
      });
    }
  }

  _buildPlayer() {
    const pd = WORLD.player;
    this.player = new Character(this, tileToPx(pd.tx), tileToPx(pd.ty),
      { parts: pd.parts, facing: pd.facing, speed: pd.speed, expression: pd.expression });
    this.player.equip('sword');                 // so the swing shows a blade (LPC attack layer)
    Collision.markPlayer(this.player);
    this.actors.add(this.player);
    DepthSort.track(this.player, CHAR_FOOTPRINT.offY);
  }

  // ---- INPUT (reads the canonical CONTROL MAP via InputMap) ------------------
  _buildInput() {
    this.im = new InputMap(this);                       // canonical bindings (src/constants/controls.js)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ one: 'ONE', two: 'TWO', three: 'THREE', debug: 'B', marsh: 'M' });
    // canonical actions:
    this.im.onPress('interact', () => { if (this._dlg) this._dialogueConfirm(); else if (Interaction.active) Interaction.tryInteract(); });
    this.im.onPress('attack', () => { if (this._canAct()) this._playerAttack(); });
    this.im.onPress('dodge', () => { if (this._canAct()) this._tryDodge(); });          // DODGE-ROLL
    this.im.onPress('settings', () => this._openSettings());
    this.im.onPress('move_up', () => { if (this._dlg) this._dialogueNav(-1); });
    this.im.onPress('move_down', () => { if (this._dlg) this._dialogueNav(+1); });
    // left-click also attacks (mouse)
    this.input.on('pointerdown', (ptr) => { if (ptr.leftButtonDown() && this._canAct()) this._playerAttack(); });
    // dialogue choices via arrows + number keys; dev keys
    this.cursors.up.on('down', () => { if (this._dlg) this._dialogueNav(-1); });
    this.cursors.down.on('down', () => { if (this._dlg) this._dialogueNav(+1); });
    this.keys.marsh.on('down', () => { if (!this._dlg) this.scene.start('Marsh'); });    // dev nav: Ashen Marsh
    this.keys.debug.on('down', () => this._toggleDebug());
    this.input.on('wheel', (_p, _o, _dx, dy) => this._stepZoom(dy > 0 ? -1 : +1));
    // number keys = direct-select an option
    const pick = (i) => { if (this._dlg && i < this._dlg.options().length) { this._selOpt = i; this._dialogueConfirm(); } };
    this.keys.one.on('down', () => pick(0));
    this.keys.two.on('down', () => pick(1));
    this.keys.three.on('down', () => pick(2));
  }

  _stepZoom(dir) {
    this.baseZoom = Phaser.Math.Clamp(this.baseZoom + dir * 0.15, 1.0, 2.0);
    this._applyCamera();
  }

  // ---- UI -------------------------------------------------------------------
  _buildUI() {
    const W = this.scale.width, H = this.scale.height;
    this._builtW = W; this._builtH = H;   // the size the box coords were laid out for (see _layoutUI)
    // UI now renders at native window resolution (RESIZE, no framebuffer upscale),
    // so sizes are in real screen px and res 2 keeps text crisp on HiDPI.
    const RES = 2;
    this._RES = RES;
    const txt = (x, y, s, size, color, extra = {}) =>
      this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra })
        .setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY);

    // --- HUD on a solid dark panel (readable over grass) ---
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const hudPanel = this.add.rectangle(8, 8, 558, 84, 0x14121c, 0.84).setOrigin(0, 0)
      .setStrokeStyle(2, 0xffe9c2, 0.9).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = txt(20, 16, 'EMBERFALL 2 — Greenhollow', 20, '#ffe9c2');
    const help = txt(20, 46, 'WASD move  Shift run  J attack  Space dodge-roll  C block  E talk  Esc settings', 12, '#cfc6e6');
    this.questHud = txt(20, 66, '', 15, '#9fe6a0');
    this.hud.add([hudPanel, title, help, this.questHud]);
    this._updateQuestHud();

    // --- interaction prompt ---
    this.prompt = this.add.text(W / 2, H - 140, '', {
      fontFamily: 'monospace', fontSize: '17px', color: '#1c1422', backgroundColor: '#ffe9c2', padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 1).setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    // --- dialogue box (portrait + name + body + crisp readable choices) ---
    const boxW = 824, boxH = 286, bx = (W - boxW) / 2, by = H - boxH - 12;
    this._boxBx = bx; this._boxW = boxW;
    const PS = 168, px = bx + 14, py = by + 14;
    this.portraitBox = { x: px, y: py, size: PS };
    this._portrait = null;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const panel = this.add.rectangle(bx, by, boxW, boxH, 0x14121c, 0.95).setOrigin(0, 0).setStrokeStyle(3, 0xffe9c2).setScrollFactor(0);
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x2a2440, 1).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2).setScrollFactor(0);
    this._txtX = px + PS + 20;
    this.dlgName = txt(this._txtX, by + 16, '', 22, '#ffe9c2', { fontStyle: 'bold' });
    this.dlgBody = txt(this._txtX, by + 48, '', 17, '#f3ecff', { wordWrap: { width: boxW - (PS + 20 + 14) - 18 }, lineSpacing: 5 });
    this.dlgHint = this.add.text(bx + boxW - 14, by + boxH - 10, 'E ▸', { fontFamily: 'monospace', fontSize: '13px', color: '#9b93b0' })
      .setOrigin(1, 1).setResolution(RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add([panel, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]);
    this._optTexts = [];
  }

  // On resize, keep the bottom-anchored UI placed. The dialogue children were laid
  // out for (_builtW,_builtH); offsetting the container re-centres + re-anchors them.
  _layoutUI() {
    const W = this.scale.width, H = this.scale.height;
    this.dialogue.setPosition((W - this._builtW) / 2, H - this._builtH);
    if (this.prompt) this.prompt.setPosition(W / 2, H - 110);
  }

  _updateQuestHud() {
    const st = this.quests.status('M1') || 'available';
    const m = this.karma.get('morality');
    this.questHud.setText(`Quest — A Greenhollow Morning: ${st.toUpperCase()}     Morality: ${m >= 0 ? '+' : ''}${m}`);
  }

  // ---- DATA-DRIVEN QUEST DIALOGUE -------------------------------------------
  // A simple, non-quest greeting (e.g. Bram at the forge) reusing the dialogue UI.
  _startGreeting(name, lines) {
    const nodes = {};
    lines.forEach((t, i) => {
      const last = i === lines.length - 1;
      nodes[`g${i}`] = { speaker: name, text: t,
        options: [last ? { label: '(Wave, and head off.)', end: true } : { label: '(Listen.)', to: `g${i + 1}` }] };
    });
    this._activeQuest = null;
    this._dlg = new Dialogue({ start: 'g0', nodes }, { karma: this.karma, engine: this.quests });
    this._selOpt = 0;
    Movement.stop(this.player);
    this.prompt.setVisible(false);
    this.dialogue.setVisible(true);
    this._renderNode();
  }

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
    const x = this._txtX, rowH = 28;
    const barW = this._boxBx + this._boxW - x - 8;
    const oy = this.dlgBody.y + this.dlgBody.height + (isChoice ? 24 : 12);
    const add = (o) => { this.dialogue.add(o); this._optTexts.push(o); return o; };
    // a label that separates the pickable CHOICES from the narration above
    if (isChoice) add(this.add.text(x, oy - 20, '─ CHOOSE ─', {
      fontFamily: 'monospace', fontSize: '11px', color: '#9b93b0', fontStyle: 'bold',
    }).setResolution(this._RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    opts.forEach((o, i) => {
      const sel = i === this._selOpt;
      const y = oy + i * rowH;
      if (sel) {                                   // a filled highlight BAR behind the active choice
        add(this.add.rectangle(x - 8, y - 3, barW, rowH - 4, 0xffe9c2, 1).setOrigin(0, 0)
          .setScrollFactor(0).setDepth(DEPTH.OVERLAY));
      }
      const num = isChoice ? `${i + 1}. ` : '';
      add(this.add.text(x, y, `${sel ? '▶ ' : '   '}${num}${o.label}`, {
        fontFamily: 'monospace', fontSize: '16px', color: sel ? '#1c1422' : '#cfc6e6', fontStyle: sel ? 'bold' : 'normal',
      }).setResolution(this._RES).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    });
    this.dlgHint.setText(isChoice ? '↑↓ move · 1/2 or E to pick' : 'E to continue ▸');
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

  // Compose the speaker's FULL paper-doll into the portrait box — the SAME parts
  // the world sprite wears (head to feet), so the portrait can't diverge from the
  // character (e.g. missing pants/shoes). Only attack-only gear layers are skipped.
  _buildPortrait(parts, expression = 'neutral') {
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    this.portraitFrame.setVisible(!!parts);
    if (!parts) return;
    const layers = [];
    for (const pk of parts) {
      const part = PARTS[pk];
      if (!part) continue;
      for (const L of part.layers) {
        if (L.states && !L.states.includes('idle')) continue;  // skip attack-only equipment
        layers.push({ ...L });
      }
    }
    layers.sort((a, b) => a.z - b.z);
    const idleFrame = DIR_ROW.down * ANIMS.idle.frames;
    const exprFrame = EXPR_ROW.down * EXPR_COLS + (EXPRESSIONS[expression] ?? 0);
    const cx = 16, cy = 11, cw = 32, ch = 50;     // head-to-feet crop of the 64px frame
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
  update(time, delta) {
    const dt = Math.min(delta || 16, 50) / 1000;        // clamp dt (tab-out etc.)
    // HIT-PAUSE: freeze a few frames on a landed hit so the impact reads as MEATY
    if (this._hitFreeze > 0) {
      this._hitFreeze -= 1;
      Movement.stop(this.player);
      if (this.enemy && this.enemy.spr.body) this.enemy.spr.body.setVelocity(0, 0);
      DepthSort.update(); this._drawCombatUI(); return;
    }
    if (this._dlg) { Movement.stop(this.player); this._blockArcG.clear(); DepthSort.update(); this._drawCombatUI(); return; }

    const now = this.time.now;
    const { dx, dy } = this.im.vector(); this._inputDir = { dx, dy };
    this.pc.setBlocking(now, this.combatUnlocked && this.im.down('block') && !this.player.isBusy());
    if (this.pc.isDodgeMoving(now)) {                  // DODGE-ROLL burst + spin (approx of a roll)
      const v = this.pc.dodgeVelocity(); this.player.body.setVelocity(v.x, v.y);
      this.player.setRotation(this.player.rotation + 0.55 * (dx < 0 || dy < 0 ? -1 : 1));
    } else {
      if (this.player.rotation !== 0) this.player.setRotation(0);
      if (this.pc.isBlocking()) Movement.stop(this.player);          // BLOCK: brace
      else Movement.drive(this.player, dx, dy, this.im.runHeld());   // run from the canonical bindings
    }
    this._updateCombat(dt);
    this._updatePlayerTint(now);
    this._updateBlockArc();
    DepthSort.update();
    this._drawCombatUI();

    const active = Interaction.update(this.player);
    if (active) this.prompt.setText(`${active.prompt}  (E)`).setVisible(true);
    else this.prompt.setVisible(false);
  }

  // ===========================================================================
  // COMBAT (Stage 2a) — the slice's first fight. Reuses the Monsters behaviour
  // engine (the CHARGER FSM drives the visible enemy) + Inventory for player HP.
  // All tuning is read from COMBAT (the standards SSOT).
  // ===========================================================================
  _initCombat() {
    this.inv = new Inventory({ storage: memoryStorage() });   // player HP from the economy/stats system
    this.pc = new PlayerCombat();                             // dodge-roll / block / parry (tested logic)
    this.mods = new ModifierRegistry(undefined, { dev: true }); // dev: easy modifiers ON (adult stays off)
    // ADULT/ACT GATE: childhood (M1-M6) has NO combat. This is a DEV TEST arena
    // (flagged on-screen), so the player is marked ADULT to let Van feel-test the
    // charger; childhood scenes set isAdult=false -> the gate below disables combat.
    this.player.isAdult = true; this.player.isMinor = false;
    this.combatUnlocked = this.player.isAdult;
    // SHIELD-SCALED block: equip a shield -> blockNegate comes from the shield item.
    if (this.inv.add('iron_shield')) this.inv.equip('iron_shield');
    this._refreshShieldBlock();
    this._hitFreeze = 0;
    this._atkReady = 0;
    this._playerFlash = 0;
    this._inputDir = { dx: 0, dy: 0 };
    this._blockArcG = this.add.graphics().setDepth(DEPTH.OVERLAY);   // the BLOCK pose visual (guard arc)
    // world-space combat FX: a bold "!" tell, a ground CHARGE-LINE (so the dodge is
    // readable), and the enemy HP bar — all drawn/positioned each frame.
    this._enemyMark = this.add.text(0, 0, '!', { fontFamily: 'monospace', fontSize: '34px', color: '#ffe14d', fontStyle: 'bold' })
      .setStroke('#1c1422', 6).setOrigin(0.5, 1).setDepth(DEPTH.OVERLAY).setVisible(false);
    this._telegraphG = this.add.graphics().setDepth(DEPTH.FLOOR + 5);   // on the ground, under the actors
    this._enemyHpG = this.add.graphics().setDepth(DEPTH.OVERLAY);
    // player HP bar (fixed UI — added to the UI camera in _setupUICamera)
    this.playerHpUI = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const panel = this.add.rectangle(8, 100, 220, 30, 0x14121c, 0.84).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2, 0.9).setScrollFactor(0);
    this._hpBarBg = this.add.rectangle(16, 116, 160, 12, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpBarFill = this.add.rectangle(16, 116, 160, 12, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpLabel = this.add.text(182, 109, '', { fontFamily: 'monospace', fontSize: '13px', color: '#ffe9c2' }).setResolution(2).setScrollFactor(0);
    const devNote = this.add.text(10, 132, '[DEV TEST] charger — real combat starts in Ashen Marsh', { fontFamily: 'monospace', fontSize: '10px', color: '#e0a35a' }).setResolution(2).setScrollFactor(0);
    this.playerHpUI.add([panel, this._hpBarBg, this._hpBarFill, this._hpLabel, devNote]);
    this._spawnCharger();
    this._applyBigHead();   // dev: big-head modifier is ON by default (toggle in the options menu)
  }

  // DEV TEST ONLY — see QUALITY-BIBLE "COMBAT PLACEMENT RULE": NO combat in the
  // childhood act (Greenhollow, M1-M6). This charger exists so Van can feel-test
  // the fight; it is NOT childhood canon. Real first-combat belongs in Ashen Marsh.
  _spawnCharger() {
    const ENEMY = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'shirt_leather', 'pants_black', 'shoes_brown'];
    const spr = new Character(this, 22 * TILE, 28 * TILE, { parts: ENEMY, facing: 'up', speed: 0, expression: 'angry' });
    spr.equip('sword');
    DepthSort.track(spr, CHAR_FOOTPRINT.offY);
    if (this.uiCamera) this.uiCamera.ignore(spr);   // respawns: keep the enemy off the UI camera (avoid double-render)
    this.physics.add.collider(spr, this.solids);    // bumps trees/forge, but NOT the player (so the charge connects)
    this.enemy = {
      mon: spawnMonster('charger', { hp: COMBAT.CHARGER_HP }),
      spr, lastState: null, chargeDir: { x: 0, y: 1 }, hitThisCharge: false,
      knockFrames: 0, knockVx: 0, knockVy: 0, flashFrames: 0, staggerFrames: 0, alive: true,
    };
  }

  _playerAttack() {
    const now = this.time.now;
    if (now < this._atkReady || this.player.isBusy()) return;
    this._atkReady = now + COMBAT.ATTACK_COOLDOWN_MS;
    this.player.action('attack');                   // LPC sword-swing animation
    this._sfx('sfx_swing', 0.45);
    const e = this.enemy; if (!e || !e.alive) return;
    const dx = e.spr.x - this.player.x, dy = e.spr.y - this.player.y, dist = Math.hypot(dx, dy) || 1;
    if (dist > COMBAT.ATTACK_RANGE) return;         // out of reach
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    if ((dx / dist) * f.x + (dy / dist) * f.y < COMBAT.ATTACK_ARC_DOT) return; // not in the swing arc
    this._hitEnemy(dx / dist, dy / dist);
  }

  _hitEnemy(nx, ny) {
    const e = this.enemy;
    e.mon.hit(COMBAT.ATTACK_DAMAGE);
    this._sfx('sfx_hit', 0.7);
    e.flashFrames = Math.round(COMBAT.FLASH_MS / 16);
    this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES;          // hit-pause
    this.cameras.main.shake(110, COMBAT.SHAKE_HIT);      // screen-shake
    e.knockVx = nx * COMBAT.KNOCKBACK_SPEED; e.knockVy = ny * COMBAT.KNOCKBACK_SPEED; // knockback
    e.knockFrames = COMBAT.KNOCKBACK_FRAMES;
    if (e.mon.dead) this._enemyDie();
  }

  // a charge connecting -> resolve through the abilities system (dodge/block/parry)
  _enemyHitsPlayer() {
    const now = this.time.now, e = this.enemy;
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    const tx = e.spr.x - this.player.x, ty = e.spr.y - this.player.y, tl = Math.hypot(tx, ty) || 1;
    const fromFront = (tx / tl) * f.x + (ty / tl) * f.y > 0.3;       // facing the charger = a frontal hit
    const r = this.pc.takeDamage(now, COMBAT.CHARGE_DAMAGE, { fromFront });
    if (r.outcome === 'dodged') return;                              // i-frames -> the DODGE beat the charge
    if (r.outcome === 'parried') { this._onParry(); return; }        // parry -> stagger + no damage
    const blocked = r.outcome === 'blocked';
    this.inv.hp = Math.max(0, this.inv.hp - r.taken);
    this._sfx(blocked ? 'sfx_hit' : 'sfx_charge_impact', blocked ? 0.5 : 0.7);
    this._playerFlash = Math.round(COMBAT.FLASH_MS / 16);
    this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES + (blocked ? 0 : 2);
    this.cameras.main.shake(blocked ? 110 : 220, blocked ? COMBAT.SHAKE_HIT : COMBAT.SHAKE_CHARGE);
    const k = blocked ? 0.4 : 1, d = e.chargeDir;
    this.player.body.setVelocity(d.x * COMBAT.KNOCKBACK_SPEED * k, d.y * COMBAT.KNOCKBACK_SPEED * k);
    if (this.inv.hp <= 0) { this.inv.hp = this.inv.stats().maxHp; this.player.x = 17 * TILE; this.player.y = 19 * TILE; this.player.body.reset(17 * TILE, 19 * TILE); }
  }

  // a DODGE: dash with i-frames in the move dir (or facing if idle) — beats the charger
  _tryDodge() {
    const now = this.time.now;
    let { dx, dy } = this._inputDir || { dx: 0, dy: 0 };
    if (!dx && !dy) { const f = FACE_VEC[this.player.facing] || FACE_VEC.down; dx = f.x; dy = f.y; }
    this.pc.dodge(now, dx, dy);                          // (no-op if on cooldown)
  }

  // a successful PARRY: stagger the charger into a long punish window + no damage
  _onParry() {
    const e = this.enemy;
    this.pc.consumeParry();
    e.staggerFrames = Math.round(COMBAT.PARRY_STUN_MS / 16);
    e.flashFrames = 8;
    this._sfx('sfx_hit', 0.85);
    this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES + 3;
    this.cameras.main.shake(160, COMBAT.SHAKE_HIT);
  }

  _updateCombat(dt) {
    this._telegraphG.clear();
    const e = this.enemy; if (!e || !e.alive) { this._enemyMark.setVisible(false); return; }
    if (e.staggerFrames > 0) {                           // PARRIED -> staggered: frozen + vulnerable (the punish window)
      e.staggerFrames--;
      e.spr.body.setVelocity(0, 0); e.spr.setState('idle'); e.lastState = 'stagger'; e.spr.setScale(1);
      let t = 0x66ccff; if (e.flashFrames > 0) { t = 0xffffff; e.flashFrames--; }
      this._tint(e.spr, t); this._enemyMark.setVisible(false);
      return;
    }
    e.mon.update(dt);
    const st = e.mon.state, spr = e.spr;
    // CHARGE-LINE telegraph: while winding up, paint the rush path toward the player
    // on the ground so the dodge is obvious (step off the line).
    if (st === 'telegraph') {
      const a = Math.atan2(this.player.y - spr.y, this.player.x - spr.x);
      const len = 300, bx = spr.x, by = spr.y + 14, tx2 = bx + Math.cos(a) * len, ty2 = by + Math.sin(a) * len;
      this._telegraphG.lineStyle(10, 0xff5a3c, 0.45).beginPath().moveTo(bx, by).lineTo(tx2, ty2).strokePath();
      const ah = 16, pa = a + Math.PI * 0.85, pb = a - Math.PI * 0.85;
      this._telegraphG.fillStyle(0xff5a3c, 0.6).fillTriangle(tx2, ty2, tx2 + Math.cos(pa) * ah, ty2 + Math.sin(pa) * ah, tx2 + Math.cos(pb) * ah, ty2 + Math.sin(pb) * ah);
    }

    if (e.knockFrames > 0) {                             // knockback overrides movement
      e.knockFrames--; spr.body.setVelocity(e.knockVx, e.knockVy); e.knockVx *= 0.8; e.knockVy *= 0.8;
    } else {
      if (st !== 'charge') spr.facing = this._faceToward(spr, this.player);
      if (st !== e.lastState) {                          // transition: lock the charge line toward the player
        if (st === 'charge') { const a = Math.atan2(this.player.y - spr.y, this.player.x - spr.x); e.chargeDir = { x: Math.cos(a), y: Math.sin(a) }; e.hitThisCharge = false; }
        e.lastState = st;
      }
      if (st === 'idle') {                               // close in slowly
        const a = Math.atan2(this.player.y - spr.y, this.player.x - spr.x);
        spr.body.setVelocity(Math.cos(a) * COMBAT.APPROACH_SPEED, Math.sin(a) * COMBAT.APPROACH_SPEED); spr.setState('walk');
      } else if (st === 'telegraph') {                   // WIND-UP: stop + the tell
        spr.body.setVelocity(0, 0); spr.setState('idle');
      } else if (st === 'charge') {                      // RUSH in the locked line
        spr.body.setVelocity(e.chargeDir.x * COMBAT.CHARGE_SPEED, e.chargeDir.y * COMBAT.CHARGE_SPEED); spr.setState('walk');
        if (!e.hitThisCharge && Math.hypot(spr.x - this.player.x, spr.y - this.player.y) < 40) { e.hitThisCharge = true; this._enemyHitsPlayer(); }
      } else if (st === 'recover') {                     // PUNISH WINDOW: stop, vulnerable
        spr.body.setVelocity(0, 0); spr.setState('idle');
      }
    }
    // tint by state (the readable language): flash > telegraph(yellow) > charge(white) > recover(cyan) > idle(red)
    let tint = 0xff8a7a;                                 // idle: hostile red cast
    if (st === 'telegraph') tint = 0xffd23f;             // wind-up: bright yellow warning
    else if (st === 'charge') tint = 0xffffff;           // rushing
    else if (st === 'recover') tint = 0x66ccff;          // vulnerable: cyan "hit me"
    if (e.flashFrames > 0) { tint = 0xffffff; e.flashFrames--; }
    this._tint(spr, tint);
    spr.setScale(st === 'telegraph' ? 1.14 : 1);        // a visible wind-up pulse
    this._enemyMark.setVisible(st === 'telegraph');
  }

  _enemyDie() {
    const e = this.enemy; e.alive = false;
    this._enemyMark.setVisible(false);
    this.tweens.add({ targets: e.spr.list, alpha: 0, duration: 350, onComplete: () => e.spr.destroy() });
    // respawn after a beat so the fight is replayable (Van judges the feel repeatedly)
    this.time.delayedCall(2200, () => this._spawnCharger());
  }

  // tint every layer sprite of a Character (it's a Container of layers)
  _tint(charSpr, color) { charSpr.list.forEach((s) => s.setTint && s.setTint(color)); }
  // player tint each frame: hurt-flash > dodge-ghost > block-guard > none
  _updatePlayerTint(now) {
    let t = null;
    if (this.pc.isBlocking()) t = 0x66ccff;             // guard
    if (this.pc.isInvulnerable(now)) t = 0xeaf6ff;      // dodging (i-frames) — pale ghost
    if (this._playerFlash > 0) { t = 0xff5555; this._playerFlash--; }
    if (t == null) this.player.list.forEach((s) => s.clearTint && s.clearTint());
    else this.player.list.forEach((s) => s.setTint && s.setTint(t));
  }
  _sfx(key, vol = 0.6) {
    if (!this.cache.audio.exists(key)) return;
    const a = bindings.options.audio;                    // master x sfx from the options menu
    this.sound.play(key, { volume: vol * a.master * a.sfx });
  }

  // SHIELD-SCALED block: read the equipped shield's `block` (else bare-hand value).
  _refreshShieldBlock() {
    const sh = this.inv.equipped('shield');
    const b = sh ? (item(sh).effects.find((e) => e.block != null)?.block ?? COMBAT.NO_SHIELD_BLOCK) : COMBAT.NO_SHIELD_BLOCK;
    this.pc.setShieldBlock(b);
  }
  _canAct() { return !this._dlg && this._hitFreeze <= 0 && this.combatUnlocked; }
  _openSettings() { if (this._dlg) return; this.scene.launch('Options', { caller: 'Greenhollow', mods: this.mods, im: this.im }); this.scene.pause(); }

  // BLOCK POSE (real visual, not a tint): a raised guard ARC in the facing dir.
  // FLAG: a proper LPC shield-raised / arm-up BLOCK animation needs block frames.
  _updateBlockArc() {
    this._blockArcG.clear();
    if (!this.pc.isBlocking()) return;
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    const ang = Math.atan2(f.y, f.x), cx = this.player.x + f.x * 20, cy = this.player.y + f.y * 20 - 6;
    this._blockArcG.lineStyle(7, 0x9fd8ff, 0.95).beginPath().arc(cx, cy, 22, ang - 1.0, ang + 1.0).strokePath();
    this._blockArcG.lineStyle(3, 0xffffff, 0.7).beginPath().arc(cx, cy, 22, ang - 1.0, ang + 1.0).strokePath();
  }

  // BIG-HEAD modifier — scale the head-region layers of every Character.
  _applyBigHead() {
    const s = this.mods.headScale();
    const heads = (c) => { if (!c?._slotLayers) return; for (const slot of ['head', 'hair', 'brows', 'beard']) (c._slotLayers[slot] || []).forEach((sp) => sp.setScale(s, s).setY(s > 1 ? -10 * (s - 1) : 0)); };
    heads(this.player); if (this.enemy) heads(this.enemy.spr);
    this.children.list.forEach((o) => { if (o.constructor?.name === 'Character') heads(o); });
  }

  _drawCombatUI() {
    // player HP bar
    if (this.inv) {
      const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
      this._hpBarFill.width = 160 * (hp / max);
      this._hpBarFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
      this._hpLabel.setText(`HP ${hp}/${max}`);
    }
    // enemy HP bar + "!" mark follow the charger in world space
    this._enemyHpG.clear();
    const e = this.enemy;
    if (e && e.alive) {
      const x = e.spr.x - 22, y = e.spr.y - 52, w = 44, frac = Math.max(0, e.mon.hp / e.mon.maxHp);
      this._enemyHpG.fillStyle(0x000000, 0.55).fillRect(x - 1, y - 1, w + 2, 7);
      this._enemyHpG.fillStyle(0x3a1418, 1).fillRect(x, y, w, 5);
      this._enemyHpG.fillStyle(0xe05a5a, 1).fillRect(x, y, w * frac, 5);
      this._enemyMark.setPosition(e.spr.x, y - 6);
    }
  }
}
