// =============================================================================
// RegionScene — the reusable base every region scene extends. Owns the shared
// RENDERING (ground/water/decals/props/NPCs/player) + CAMERA + dialogue/quest UI
// + INTERACTION + INPUT + the EnemyController-based COMBAT + the update loop.
// A region becomes a THIN subclass that supplies `regionConfig()` (DATA: world,
// quests, faces, theme, combat encounters) + a few optional hooks. This is the
// template all remaining regions use. See docs/REGIONSCENE-SPEC.md.
//
//   subclass MUST implement: regionConfig() -> { key, title, help, quests, faces,
//     theme, questHud, bg, world, combat, devModifiers }
//   subclass MAY override hooks: onCreateExtra(), onDialogueConfirm(wasNodeId)->bool,
//     onPlayerDownExtra(), playerAttackTool()
// =============================================================================

import Phaser from 'phaser';
import { PROPS, PARTS, TILE, DIR_ROW, ANIMS, EXPRESSIONS, EXPR_COLS, EXPR_ROW, CHAR_FOOTPRINT } from '../data/assets.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { Character } from '../systems/Character.js';
import { Movement } from '../systems/Movement.js';
import { Collision } from '../systems/Collision.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { Interaction } from '../systems/Interaction.js';
import { Dialogue } from '../systems/Dialogue.js';
import { Social } from '../systems/Social.js';
import { QuestEngine } from '../systems/QuestEngine.js';
import { KarmaEngine } from '../systems/Karma.js';
import { Inventory } from '../systems/Inventory.js';
import { PlayerCombat } from '../systems/Combat.js';
import { InputMap } from '../systems/Input.js';
import { EnemyController } from '../systems/EnemyController.js';
import { TimeOfDay } from '../systems/TimeOfDay.js';
import { ModifierRegistry } from '../systems/Modifiers.js';
import { buyPrice } from '../systems/Economy.js';
import { item } from '../data/items/index.js';
import { memoryStorage } from '../systems/storage.js';
import { COMBAT } from '../constants/standards.js';
import { bindings } from '../constants/controls.js';

const tileToPx = (t) => t * TILE + TILE / 2;
export const FACE_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

export class RegionScene extends Phaser.Scene {
  // ---- subclass contract (override these) ----
  regionConfig() { throw new Error('regionConfig() must be implemented'); }
  onCreateExtra() {}                 // region-specific setup (extra keys, shrine, etc.)
  onDialogueConfirm() { return false; } // intercept a dialogue advance (e.g. boss). return true if handled
  onPlayerDownExtra() {}             // on player death (e.g. clear a boss)
  playerAttackTool() { return null; } // a tool passed to enemy hits (e.g. the lantern)

  create() {
    this.cfg = this.regionConfig();
    this.theme = this.cfg.theme;
    AssetLoader.build(this);
    DepthSort.reset();
    Interaction.reset();
    this.karma = new KarmaEngine({ storage: memoryStorage() });
    this.quests = new QuestEngine({ karma: this.karma, storage: memoryStorage(), quests: this.cfg.quests });
    this.tod = new TimeOfDay({ storage: memoryStorage() });   // day/night clock (HUD time + phase gates)

    const w = this.cfg.world;
    this.worldW = w.widthTiles * TILE; this.worldH = w.heightTiles * TILE;
    this.edgeMargin = 3 * TILE;
    this.physics.world.setBounds(this.edgeMargin, this.edgeMargin, this.worldW - this.edgeMargin * 2, this.worldH - this.edgeMargin * 2);

    this._buildGround();
    this._buildWater();
    this._scatterDecals();
    this._edgeScatter();
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();
    Collision.wire(this, this.actors, this.solids);

    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setRoundPixels(false);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    if (this.cfg.bg) this.cameras.main.setBackgroundColor(this.cfg.bg);
    this.baseZoom = 1.25; this._applyCamera();

    this._dlg = null;
    this._buildInput();
    this._buildUI();
    this._initCombat();
    this._buildHud();
    this.onCreateExtra();
    this._setupUICamera();
    this.scale.on('resize', (sz) => { this._applyCamera(); this._layoutUI(); this.uiCamera.setSize(sz.width, sz.height); });
  }

  _setupUICamera() {
    const ui = [this.hud, this.hud2, this.dialogue, this.prompt, this.playerHpUI, this.banner].filter(Boolean);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(ui);
    this.uiCamera.ignore(this.children.list.filter((o) => !ui.includes(o)));
  }
  _applyCamera() {
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setZoom(Math.max(Math.max(W / this.worldW, H / this.worldH), this.baseZoom));
  }
  _stepZoom(dir) { this.baseZoom = Phaser.Math.Clamp(this.baseZoom + dir * 0.15, 1.0, 2.0); this._applyCamera(); }

  // ---- WORLD (from cfg.world) ------------------------------------------------
  _buildGround() {
    const g = this.cfg.world.ground;
    const paint = (key, x, y, w, h) => { const ts = this.add.tileSprite(x, y, w, h, key).setOrigin(0, 0); if (g.tint != null) ts.setTint(g.tint); DepthSort.pinFloor(ts); return ts; };
    paint(g.base, 0, 0, this.worldW, this.worldH);
    for (const [key, tx, ty, w, h] of (g.rects || [])) paint(key, tx * TILE, ty * TILE, w * TILE, h * TILE);
  }
  _buildWater() {
    const wt = this.cfg.world.water; this._ponds = [];
    if (!wt) return;
    this._ponds = wt.pools || (wt.pond ? [wt.pond] : []);
    for (const p of this._ponds) {
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
        const img = this.add.image((p.tx + x) * TILE, (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0);
        if (wt.tint != null) img.setTint(wt.tint);
        DepthSort.pinFloor(img);
      }
    }
  }
  _inWater(tx, ty) { return this._ponds.some((p) => tx >= p.tx - 0.5 && tx < p.tx + p.w + 0.5 && ty >= p.ty - 0.5 && ty < p.ty + p.h + 0.5); }
  _scatterDecals() {
    const W = this.worldW, H = this.worldH, m = 2 * TILE;
    const ok = (px, py) => !(px < m || px > W - m || py < m || py > H - m) && !this._inWater(px / TILE, py / TILE);
    for (const layer of (this.cfg.world.decalLayers || [])) {
      const cfg = layer.cfg; if (!cfg) continue; let seed = cfg.seed >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      let placed = 0, tries = 0;
      while (placed < cfg.count && tries < cfg.count * 12) {
        tries++; const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H);
        if (!ok(px, py)) continue;
        const img = this.add.image(px, py, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, layer.originY).setDepth(layer.depth);
        if (layer.tint != null) img.setTint(layer.tint);
        placed++;
      }
    }
  }
  // EDGE-SCATTER: tufts/ferns straddling every grass↔path/dirt seam so no biome
  // border is a hard straight line (we have no licence-loaded LPC transition tiles).
  _edgeScatter() {
    const es = this.cfg.world.edgeScatter; if (!es) return;
    let seed = es.seed >>> 0; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const place = (px, py) => this.add.image(px, py, es.pool[Math.floor(rnd() * es.pool.length)]).setOrigin(0.5, 1).setDepth(DEPTH.FLOOR + 2);
    for (const [key, tx, ty, w, h] of (this.cfg.world.ground.rects || [])) {
      if (!/path|dirt/.test(key)) continue;
      const seam = [];
      for (let i = 0; i < w; i++) { seam.push([tx + i, ty], [tx + i, ty + h]); }     // top + bottom edges
      for (let j = 0; j < h; j++) { seam.push([tx, ty + j], [tx + w, ty + j]); }      // left + right edges
      for (const [ex, ey] of seam) { if (rnd() > es.prob) continue; place(ex * TILE + (rnd() * 18 - 4), ey * TILE + (rnd() * 12 - 2)); }
    }
  }
  _buildProps() {
    const treeTint = this.cfg.world.propTreeTint;
    for (const p of this.cfg.world.props) {
      const d = PROPS[p.key];
      const spr = this.physics.add.sprite(tileToPx(p.tx), tileToPx(p.ty), p.key).setOrigin(0.5, 0.5);
      if (p.tint != null) spr.setTint(p.tint);                                      // per-prop tint (cottage variety)
      else if (treeTint != null && p.key.startsWith('prop_tree')) spr.setTint(treeTint);
      this._props = this._props || {}; if (p.id) this._props[p.id] = spr;           // named props (e.g. a chest)
      if (p.solid && d.footprint) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); }
      else if (spr.body) { spr.body.enable = false; }
      DepthSort.track(spr, d.footprint ? d.footprint.offY : d.height / 2);
    }
  }
  _buildNPCs() {
    for (const n of this.cfg.world.npcs) {
      const npc = new Character(this, tileToPx(n.tx), tileToPx(n.ty), { parts: n.parts, facing: n.facing, speed: n.speed, expression: n.expression });
      Collision.markSolidActor(npc); this.solids.add(npc); DepthSort.track(npc, CHAR_FOOTPRINT.offY);
      this._npcByQuest = this._npcByQuest || {}; if (n.quest) this._npcByQuest[n.quest] = npc;   // objective-indicator target
      this._poi = this._poi || []; this._poi.push({ x: npc.x, y: npc.y, kind: 'npc' });           // minimap point of interest
      Interaction.register({
        x: npc.x, y: npc.y + CHAR_FOOTPRINT.offY, prompt: `Talk to ${n.name}`,
        onInteract: () => {
          npc.facing = this._faceToward(npc, this.player); npc.setState('idle');
          const st = n.quest ? this.quests.status(n.quest) : null;
          if (n.quest && (st === 'available' || st === 'active')) this._startQuestDialogue(n.quest);  // only enter an OPEN quest
          else if (n.social) this._startDialogue(n.social, n.name);                                    // social demo (shop / charisma / insight / trust)
          else if (st === 'complete' && n.done) this._startGreeting(n.name, n.done);
          else if (n.greeting) this._startGreeting(n.name, n.greeting);                                // locked/no-quest -> a line
          else if (n.done) this._startGreeting(n.name, n.done);
        },
      });
    }
  }
  _buildPlayer() {
    const pd = this.cfg.world.player;
    this.player = new Character(this, tileToPx(pd.tx), tileToPx(pd.ty), { parts: pd.parts, facing: pd.facing, speed: pd.speed, expression: pd.expression });
    this.player.equip('sword');
    Collision.markPlayer(this.player); this.actors.add(this.player); DepthSort.track(this.player, CHAR_FOOTPRINT.offY);
  }

  // ---- INPUT (canonical control map) ----------------------------------------
  _buildInput() {
    this.im = new InputMap(this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ one: 'ONE', two: 'TWO', three: 'THREE' });
    this.im.onPress('interact', () => { if (this._dlg) this._dialogueConfirm(); else if (Interaction.active) Interaction.tryInteract(); });
    this.im.onPress('attack', () => { if (this._canAct()) this._playerAttack(); });
    this.im.onPress('dodge', () => { if (this._canAct()) this._tryDodge(); });
    this.im.onPress('settings', () => this._openSettings());
    this.im.onPress('move_up', () => { if (this._dlg) this._dialogueNav(-1); });
    this.im.onPress('move_down', () => { if (this._dlg) this._dialogueNav(+1); });
    this.cursors.up.on('down', () => { if (this._dlg) this._dialogueNav(-1); });
    this.cursors.down.on('down', () => { if (this._dlg) this._dialogueNav(+1); });
    this.input.on('pointerdown', (ptr) => { if (ptr.leftButtonDown() && this._canAct()) this._playerAttack(); });
    const pick = (i) => { if (this._dlg && this._optView && i < this._optView.length && this._optView[i].st !== 'locked') { this._selOpt = i; this._dialogueConfirm(); } };
    this.keys.one.on('down', () => pick(0));
    this.keys.two.on('down', () => pick(1));
    this.keys.three.on('down', () => pick(2));
  }

  // ---- UI + DIALOGUE (themed by cfg.theme) ----------------------------------
  _buildUI() {
    const W = this.scale.width, H = this.scale.height; this._builtW = W; this._builtH = H; this._RES = 2;
    const T = this.theme;
    const txt = (x, y, s, size, color, extra = {}) => this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY);

    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const hp = this.add.rectangle(8, 8, T.hudW, T.hudH, T.hudFill, T.hudAlpha).setOrigin(0, 0).setStrokeStyle(2, T.accent, 0.9).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = txt(T.hudX, T.titleY, this.cfg.title, T.titleSize, T.titleColor);
    const help = txt(T.hudX, T.helpY, this.cfg.help, T.helpSize, T.muted);
    this.questHud = txt(T.hudX, T.questY, '', 15, '#9fe6a0'); this.questHud.setVisible(!!this.cfg.questHud?.show);
    this.hud.add([hp, title, help, this.questHud]);
    this._updateQuestHud();

    this.prompt = this.add.text(W / 2, H - 140, '', { fontFamily: 'monospace', fontSize: '17px', color: T.promptFg, backgroundColor: T.promptBg, padding: { x: 10, y: 5 } })
      .setOrigin(0.5, 1).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    const boxW = 824, boxH = 286, bx = (W - boxW) / 2, by = H - boxH - 12; this._boxBx = bx; this._boxW = boxW;
    const PS = 168, px = bx + 14, py = by + 14; this.portraitBox = { x: px, y: py, size: PS }; this._portrait = null;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const panel = this.add.rectangle(bx, by, boxW, boxH, T.dlgFill, T.dlgAlpha).setOrigin(0, 0).setStrokeStyle(3, T.accent).setScrollFactor(0);
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, T.portraitFill, 1).setOrigin(0, 0).setStrokeStyle(2, T.accent).setScrollFactor(0);
    this._txtX = px + PS + 20;
    this.dlgName = txt(this._txtX, by + 16, '', 22, T.nameColor, { fontStyle: 'bold' });
    this.dlgBody = txt(this._txtX, by + 48, '', 17, T.bodyColor, { wordWrap: { width: boxW - (PS + 34) - 18 }, lineSpacing: 5 });
    this.dlgHint = this.add.text(bx + boxW - 14, by + boxH - 10, 'E ▸', { fontFamily: 'monospace', fontSize: '13px', color: T.hintColor })
      .setOrigin(1, 1).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    this.dialogue.add([panel, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]);
    this._optTexts = [];
  }
  _layoutUI() {
    const W = this.scale.width, H = this.scale.height;
    this.dialogue.setPosition((W - this._builtW) / 2, H - this._builtH);
    if (this.prompt) this.prompt.setPosition(W / 2, H - (this.cfg.promptYOff ?? 140));
  }
  _updateQuestHud() {
    if (!this.cfg.questHud?.show) return;
    const q = this.cfg.questHud;
    const st = this.quests.status(q.id) || 'available';
    const m = this.karma.get('morality');
    this.questHud.setText(`Quest — ${q.label}: ${st.toUpperCase()}     Morality: ${m >= 0 ? '+' : ''}${m}`);
  }

  // ============================ HUD =========================================
  // A shared, diegetic HUD wired to the REAL systems: stats (HP/MP/gold/karma/
  // time), a minimap + full map, a quest tracker, and an objective marker. All
  // toggles come from the canonical control map (remappable). MP is RESERVED
  // (no mana system yet) — shown greyed, never a fabricated value.
  _buildHud() {
    const T = this.theme, W = this.scale.width, OD = DEPTH.OVERLAY;
    const txt = (x, y, s, size, color, extra = {}) => this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra }).setResolution(2).setScrollFactor(0).setDepth(OD);
    this.hud2 = this.add.container(0, 0).setScrollFactor(0).setDepth(OD);
    this._hudState = { tracker: 2, map: false, objective: true, hidden: false };   // tracker: 2 full · 1 title · 0 off
    const add = (o) => { this.hud2.add(o); return o; };
    this.questHud.setVisible(false);                          // superseded by the tracker
    if (this.playerHpUI) this.playerHpUI.setVisible(false);   // HP now lives in the stats panel

    // ---- STATS panel (top-left, under the title bar) ----
    const sx = 8, sy = 96, sw = 244, sh = 130;
    add(this.add.rectangle(sx, sy, sw, sh, T.hudFill, T.hudAlpha).setOrigin(0, 0).setStrokeStyle(2, T.accent, 0.9).setScrollFactor(0).setDepth(OD));
    add(txt(sx + 10, sy + 7, 'HP', 12, T.muted));
    this._sHpFillBg = add(this.add.rectangle(sx + 42, sy + 14, 152, 11, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    this._sHpFill = add(this.add.rectangle(sx + 42, sy + 14, 152, 11, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    this._sHpTxt = add(txt(sx + 200, sy + 8, '', 11, '#f3ecff'));
    add(txt(sx + 10, sy + 28, 'MP', 12, '#6b6275'));
    add(this.add.rectangle(sx + 42, sy + 35, 152, 11, 0x1c2230, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    add(txt(sx + 48, sy + 30, 'reserved (no mana system yet)', 9, '#6b6275'));
    this._sGold = add(txt(sx + 10, sy + 50, '', 13, '#ffe08a'));
    this._sTime = add(txt(sx + 120, sy + 50, '', 13, '#bcd6ff'));
    this._sMor = add(txt(sx + 10, sy + 74, '', 12, '#9fe6a0'));
    this._sPur = add(txt(sx + 10, sy + 94, '', 12, '#c7b6ff'));
    add(txt(sx + 10, sy + 113, 'O map  T quests  Y marker  H hide HUD', 9, T.muted));

    // ---- MINIMAP (top-right) ----
    const mmW = 168, mmH = Math.round(mmW * this.worldH / this.worldW), mmx = W - mmW - 10, mmy = 10;
    this._mm = { x: mmx, y: mmy, w: mmW, h: mmH, scale: mmW / this.worldW };
    add(this.add.rectangle(mmx - 2, mmy - 2, mmW + 4, mmH + 4, 0x10141c, 0.85).setOrigin(0, 0).setStrokeStyle(2, T.accent, 0.9).setScrollFactor(0).setDepth(OD));
    this._mmG = add(this.add.graphics().setScrollFactor(0).setDepth(OD));
    this._renderMapInto(this._mmG, this._mm);
    this._mmDots = add(this.add.graphics().setScrollFactor(0).setDepth(OD));
    add(txt(mmx + 4, mmy + 1, 'MAP', 9, '#cfc6e6'));

    // ---- QUEST TRACKER (under the minimap) ----
    const ty0 = mmy + mmH + 8;
    this._trkPanel = add(this.add.rectangle(mmx - 2, ty0, mmW + 4, 92, T.hudFill, T.hudAlpha).setOrigin(0, 0).setStrokeStyle(2, T.accent, 0.7).setScrollFactor(0).setDepth(OD));
    this._trkHdr = add(txt(mmx + 4, ty0 + 4, 'QUESTS  (T)', 11, '#9fe6a0', { fontStyle: 'bold' }));
    this._trkBody = add(txt(mmx + 4, ty0 + 22, '', 12, '#f3ecff', { wordWrap: { width: mmW - 6 }, lineSpacing: 3 }));
    this._trkXY = { x: mmx, y: ty0 };

    // ---- OBJECTIVE marker (directional arrow near the player) ----
    this._objArrow = add(this.add.graphics().setScrollFactor(0).setDepth(OD));

    // ---- FULL MAP overlay (toggle) ----
    this._buildFullMap();

    // ---- toggles from the canonical control map (remappable) ----
    const onKey = (action, fn) => { const k = bindings.keyboard[action]; if (k) this.input.keyboard.addKey(k).on('down', () => { if (!this._dlg) fn(); }); };
    onKey('toggle_hud', () => { this._hudState.hidden = !this._hudState.hidden; this.hud2.setVisible(!this._hudState.hidden); this.hud.setVisible(!this._hudState.hidden); });
    onKey('toggle_tracker', () => { this._hudState.tracker = (this._hudState.tracker + 2) % 3; });
    onKey('toggle_objective', () => { this._hudState.objective = !this._hudState.objective; });
    onKey('toggle_map', () => { this._hudState.map = !this._hudState.map; this._fullMap.setVisible(this._hudState.map); });
  }

  // draw the world (ground + water + buildings/trees) into a graphics, scaled to a box
  _renderMapInto(g, box) {
    const s = box.scale, ox = box.x, oy = box.y;
    const fill = (wx, wy, ww, wh, c, a = 1) => { g.fillStyle(c, a); g.fillRect(ox + wx * s, oy + wy * s, Math.max(1, ww * s), Math.max(1, wh * s)); };
    const C = { grass: 0x4a7a3a, path: 0xc2a062, dirt: 0x8a6a44, garden: 0x3f8a4a, water: 0x3a6ea0, bldg: 0xb0a08c, tree: 0x2f5a2a };
    fill(0, 0, this.worldW, this.worldH, C.grass);
    for (const [key, tx, ty, w, h] of (this.cfg.world.ground.rects || [])) {
      const c = /path/.test(key) ? C.path : /dirt/.test(key) ? C.dirt : /garden/.test(key) ? C.garden : C.grass;
      fill(tx * TILE, ty * TILE, w * TILE, h * TILE, c);
    }
    for (const p of (this._ponds || [])) fill(p.tx * TILE, p.ty * TILE, p.w * TILE, p.h * TILE, C.water);
    for (const pr of (this.cfg.world.props || [])) {
      const cx = pr.tx * TILE + TILE / 2, cy = pr.ty * TILE + TILE / 2;
      if (/house|forge|fountain/.test(pr.key)) { const d = PROPS[pr.key], bw = d.width * 0.7, bh = d.height * 0.42; fill(cx - bw / 2, cy - bh / 2, bw, bh, C.bldg); }
      else if (/tree/.test(pr.key)) { g.fillStyle(C.tree, 1); g.fillCircle(ox + cx * s, oy + cy * s, Math.max(1.2, 9 * s)); }
    }
  }
  _buildFullMap() {
    const W = this.scale.width, H = this.scale.height, OD = DEPTH.OVERLAY + 2, T = this.theme;
    this._fullMap = this.add.container(0, 0).setScrollFactor(0).setDepth(OD).setVisible(false);
    this.hud2.add(this._fullMap);
    const bw = Math.min(720, W - 90), bh = Math.round(bw * this.worldH / this.worldW), bx = (W - bw) / 2, by = (H - bh) / 2 - 6;
    const a = (o) => { this._fullMap.add(o); return o; };
    a(this.add.rectangle(0, 0, W, H, 0x05070b, 0.74).setOrigin(0, 0).setScrollFactor(0));
    a(this.add.rectangle(bx - 3, by - 3, bw + 6, bh + 6, 0x10141c, 0.97).setOrigin(0, 0).setStrokeStyle(3, T.accent).setScrollFactor(0));
    const fg = a(this.add.graphics().setScrollFactor(0));
    this._fbox = { x: bx, y: by, w: bw, scale: bw / this.worldW };
    this._renderMapInto(fg, this._fbox);
    this._fullMapDot = a(this.add.graphics().setScrollFactor(0));
    a(this.add.text(bx, by - 28, `${(this.cfg.title || '').replace('EMBERFALL 2 — ', '')} — Map`, { fontFamily: 'monospace', fontSize: '18px', color: '#ffe9c2', fontStyle: 'bold' }).setResolution(2).setScrollFactor(0));
    a(this.add.text(bx, by + bh + 8, 'you (white)   quest-givers (gold)   buildings   woods   water        O to close', { fontFamily: 'monospace', fontSize: '12px', color: '#cfc6e6' }).setResolution(2).setScrollFactor(0));
  }

  _updateHud() {
    if (!this.hud2 || this._hudState.hidden) return;
    const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
    this._sHpFill.width = 152 * Math.max(0, hp / max); this._sHpFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
    this._sHpTxt.setText(`${hp}/${max}`);
    this._sGold.setText(`Gold ${this.inv.gold}`);
    const ph = this.tod.phase(), word = ph[0].toUpperCase() + ph.slice(1);
    this._sTime.setText(`Time ${word} D${this.tod.dayCount() + 1}`);
    const ks = this.karma.getStatus();
    this._sMor.setText(`Morality ${ks.morality >= 0 ? '+' : ''}${ks.morality}  ${ks.moralityTier}`);
    this._sPur.setText(`Purity ${ks.purity >= 0 ? '+' : ''}${ks.purity}  ${ks.purityTier}`);
    this._updateTracker();
    this._updateMinimap();
    this._updateObjective();
  }
  _updateTracker() {
    const st = this._hudState.tracker, show = st > 0;
    this._trkPanel.setVisible(show); this._trkHdr.setVisible(show); this._trkBody.setVisible(show);
    if (!show) return;
    const active = this.quests.byState('active');
    if (!active.length) { this._trkBody.setText('(no active quest — talk to someone with a task)'); this._trkPanel.height = 56; return; }
    const lines = [];
    for (const id of active.slice(0, 3)) {
      const def = this.quests.defs[id], title = def?.title || id;
      lines.push(`> ${title}`);
      if (st === 2) { const step = (def?.steps || [])[this.quests.step[id]]; if (step) lines.push(`   ${step.desc}`); }
    }
    this._trkBody.setText(lines.join('\n'));
    this._trkPanel.height = 26 + lines.length * 16;
  }
  _updateMinimap() {
    const m = this._mm, g = this._mmDots; g.clear();
    for (const p of (this._poi || [])) { g.fillStyle(0xffd23f, 1); g.fillCircle(m.x + p.x * m.scale, m.y + p.y * m.scale, 2); }
    const pxx = m.x + this.player.x * m.scale, pyy = m.y + this.player.y * m.scale;
    g.fillStyle(0xffffff, 1); g.fillCircle(pxx, pyy, 3); g.lineStyle(1, 0x10141c, 1); g.strokeCircle(pxx, pyy, 3);
    if (this._hudState.map && this._fbox) {
      const f = this._fbox, fg = this._fullMapDot; fg.clear();
      for (const p of (this._poi || [])) { fg.fillStyle(0xffd23f, 1); fg.fillCircle(f.x + p.x * f.scale, f.y + p.y * f.scale, 3); }
      fg.fillStyle(0xffffff, 1); fg.fillCircle(f.x + this.player.x * f.scale, f.y + this.player.y * f.scale, 5);
    }
  }
  _updateObjective() {
    const g = this._objArrow; g.clear();
    if (!this._hudState.objective) return;
    let target = null;
    for (const id of this.quests.byState('active')) { const npc = this._npcByQuest && this._npcByQuest[id]; if (npc) { target = npc; break; } }
    if (!target) return;
    const cam = this.cameras.main, z = cam.zoom;
    const psx = (this.player.x - cam.worldView.x) * z, psy = (this.player.y - cam.worldView.y) * z;
    const ang = Math.atan2(target.y - this.player.y, target.x - this.player.x), r = 58, t = 12;
    if (Math.hypot(target.x - this.player.x, target.y - this.player.y) < 40) return;   // already there
    const ax = psx + Math.cos(ang) * r, ay = psy + Math.sin(ang) * r;
    const tip = [ax + Math.cos(ang) * t, ay + Math.sin(ang) * t];
    const pa = ang + Math.PI * 0.8, pb = ang - Math.PI * 0.8;
    g.fillStyle(0xffd23f, 0.95).fillTriangle(tip[0], tip[1], ax + Math.cos(pa) * t, ay + Math.sin(pa) * t, ax + Math.cos(pb) * t, ay + Math.sin(pb) * t);
    g.lineStyle(1.5, 0x4a3a10, 0.9).strokeTriangle(tip[0], tip[1], ax + Math.cos(pa) * t, ay + Math.sin(pa) * t, ax + Math.cos(pb) * t, ay + Math.sin(pb) * t);
  }

  // dialogue ctx threads the social layer (CHA/skills/trust) + karma + quests.
  // `set` strings: "buy:itemId" does a CHA-priced purchase; anything else = a deed.
  _dlgCtx() {
    return { karma: this.karma, engine: this.quests, inv: this.inv, social: Social, onSet: (s) => {
      if (typeof s === 'string' && s.startsWith('buy:')) { const id = s.slice(4); const p = buyPrice(id, this.cfg.key, this.inv.attr('cha')); if (this.inv.gold >= p && this.inv.add(id)) this.inv.addGold(-p); }
      else this.karma.recordDeed(s);
    } };
  }
  // text/label templating: {price:itemId} -> the CHA-adjusted buy price (Economy)
  _template(str) { return !str ? str : String(str).replace(/\{price:(\w+)\}/g, (_, id) => String(buyPrice(id, this.cfg.key, this.inv.attr('cha')))); }

  _startGreeting(name, lines) {
    const nodes = {};
    lines.forEach((t, i) => { const last = i === lines.length - 1; nodes[`g${i}`] = { speaker: name, text: t, options: [last ? { label: '(Step away.)', end: true } : { label: '(Listen.)', to: `g${i + 1}` }] }; });
    this._activeQuest = null;
    this._dlg = new Dialogue({ start: 'g0', nodes }, this._dlgCtx());
    this._selOpt = 0; Movement.stop(this.player); this.prompt.setVisible(false); this.dialogue.setVisible(true); this._renderNode();
  }
  /** Start an arbitrary dialogue graph on an NPC (social demos, shops, etc.). */
  _startDialogue(graph, speakerName) {
    this._activeQuest = null;
    this._dlg = new Dialogue(graph, this._dlgCtx());
    this._selOpt = 0; Movement.stop(this.player); this.prompt.setVisible(false); this.dialogue.setVisible(true); this._renderNode();
  }
  _startQuestDialogue(qid) {
    const def = this.quests.defs[qid]; if (!def || !def.dialogue) return;
    if (this.quests.status(qid) === 'available') this.quests.start(qid);
    this._activeQuest = qid;
    this._dlg = new Dialogue(def.dialogue, this._dlgCtx());
    this._selOpt = 0; Movement.stop(this.player); this.prompt.setVisible(false); this.dialogue.setVisible(true); this._renderNode();
    this._updateQuestHud();
  }
  _renderNode() {
    const node = this._dlg.node(); if (!node) { this._closeDialogue(); return; }
    this.dlgName.setText(node.speaker || ''); this.dlgBody.setText(this._template(node.text) || '');
    const face = this.cfg.faces[node.speaker]; this._buildPortrait(face ? face.parts : null, face ? face.expression : 'neutral');
    this._buildOptView();
    this._renderOptions();
  }
  // social option view: drop HIDDEN (insight/trust you don't qualify for), tag the
  // rest ([Charisma 7], [Insight]…), mark LOCKED (a check you can see but not pick).
  _buildOptView() {
    const ctx = { inv: this.inv, karma: this.karma };
    this._optView = this._dlg.options().map((opt, idx) => ({ opt, idx, st: Social.state(opt, ctx), tag: Social.tag(opt) })).filter((v) => v.st !== 'hidden');
    if (!this._optView.length) { this._selOpt = 0; return; }
    this._selOpt = Phaser.Math.Clamp(this._selOpt, 0, this._optView.length - 1);
    if (this._optView[this._selOpt].st === 'locked') { const f = this._optView.findIndex((v) => v.st !== 'locked'); if (f >= 0) this._selOpt = f; }
  }
  _renderOptions() {
    const T = this.theme, view = this._optView || [];
    this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    const isChoice = view.length > 1, x = this._txtX, rowH = 28, barW = this._boxBx + this._boxW - x - 8;
    const oy = this.dlgBody.y + this.dlgBody.height + (isChoice ? 24 : 12);
    const add = (o) => { this.dialogue.add(o); this._optTexts.push(o); return o; };
    if (isChoice) add(this.add.text(x, oy - 20, '─ CHOOSE ─', { fontFamily: 'monospace', fontSize: '11px', color: T.hintColor, fontStyle: 'bold' }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    view.forEach((v, i) => {
      const locked = v.st === 'locked', sel = i === this._selOpt && !locked, y = oy + i * rowH;
      if (sel) add(this.add.rectangle(x - 8, y - 3, barW, rowH - 4, T.choiceBar, 1).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
      const color = sel ? T.choiceSelFg : locked ? '#6b6275' : (v.tag ? '#8fd6ff' : T.muted);   // checks pop cyan; locked greyed
      add(this.add.text(x, y, `${sel ? '▶ ' : '   '}${isChoice ? `${i + 1}. ` : ''}${v.tag}${this._template(v.opt.label)}`, { fontFamily: 'monospace', fontSize: '16px', color, fontStyle: sel ? 'bold' : 'normal' }).setResolution(2).setScrollFactor(0).setDepth(DEPTH.OVERLAY));
    });
    this.dlgHint.setText(isChoice ? '↑↓ move · 1/2 or E to pick' : 'E to continue ▸');
  }
  _dialogueNav(d) {
    const view = this._optView || []; if (view.length < 2) return;
    let i = this._selOpt;
    do { i = Phaser.Math.Clamp(i + d, 0, view.length - 1); } while (view[i] && view[i].st === 'locked' && i > 0 && i < view.length - 1);
    if (view[i] && view[i].st !== 'locked') this._selOpt = i;
    this._renderOptions();
  }
  _dialogueConfirm() {
    const view = this._optView || [], v = view[this._selOpt];
    if (v && v.st === 'locked') return;                         // can't pick a failed check
    const realIdx = v ? v.idx : this._selOpt;
    const wasNode = this._dlg.nodeId;
    this._dlg.select(realIdx); this._selOpt = 0;
    if (this.onDialogueConfirm(wasNode)) return;                // region hook (e.g. Marsh boss)
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue(); else this._renderNode();
    this._updateQuestHud();
  }
  _closeDialogue() {
    if (this._activeQuest && this.quests.status(this._activeQuest) === 'active') this.quests.complete(this._activeQuest);
    this.dialogue.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
    this._updateQuestHud();
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

  // ---- COMBAT (EnemyController-based; shared) --------------------------------
  _initCombat() {
    const c = this.cfg.combat || { enabled: false };
    this.combatUnlocked = !!c.enabled;
    this.player.isAdult = !!c.adult; this.player.isMinor = !c.adult;
    this.inv = new Inventory({ storage: memoryStorage() });
    this.pc = new PlayerCombat();
    this.mods = new ModifierRegistry(undefined, { dev: !!this.cfg.devModifiers });
    if (this.inv.add('iron_shield')) this.inv.equip('iron_shield');
    this._refreshShieldBlock();
    this._hitFreeze = 0; this._atkReady = 0; this._playerFlash = 0; this._inputDir = { dx: 0, dy: 0 }; this._bossActive = false;
    this._blockArcG = this.add.graphics().setDepth(DEPTH.OVERLAY);
    const T = this.theme, hpY = T.hpY;
    this.playerHpUI = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const panel = this.add.rectangle(8, hpY, 220, 30, T.hudFill, T.hudAlpha).setOrigin(0, 0).setStrokeStyle(2, T.accent, 0.9).setScrollFactor(0);
    this._hpBarBg = this.add.rectangle(16, hpY + 16, 160, 12, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpBarFill = this.add.rectangle(16, hpY + 16, 160, 12, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpLabel = this.add.text(182, hpY + 9, '', { fontFamily: 'monospace', fontSize: '13px', color: T.nameColor }).setResolution(2).setScrollFactor(0);
    const hpKids = [panel, this._hpBarBg, this._hpBarFill, this._hpLabel];
    if (c.devNote) hpKids.push(this.add.text(10, hpY + 32, c.devNote, { fontFamily: 'monospace', fontSize: '10px', color: '#e0a35a' }).setResolution(2).setScrollFactor(0));
    this.playerHpUI.add(hpKids);
    this.banner = this.add.text(this.scale.width / 2, 92, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffe9c2', backgroundColor: '#10171acc', padding: { x: 10, y: 5 }, align: 'center' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    this.combat = new EnemyController(this, { solids: this.solids, onPlayerHit: (dmg, info) => this._onPlayerHit(dmg, info), onPlayerRecoil: (dmg) => this._onPlayerRecoil(dmg) });
    // SAFE ZONES: a whole-region safeZone spawns NO combat enemies (villages/hubs);
    // a `safe` hub keeps a settlement peaceful inside a combat region (no aggro there).
    if (!c.safeZone) for (const en of (c.enemies || [])) this.combat.spawn(en.id, { tx: en.tx, ty: en.ty });
    if (c.safe) this.combat.setSafeZone(c.safe.tx * TILE + TILE / 2, c.safe.ty * TILE + TILE / 2, c.safe.r * TILE);
    this._applyBigHead();
  }
  _refreshShieldBlock() {
    const sh = this.inv.equipped('shield');
    const b = sh ? (item(sh).effects.find((e) => e.block != null)?.block ?? COMBAT.NO_SHIELD_BLOCK) : COMBAT.NO_SHIELD_BLOCK;
    this.pc.setShieldBlock(b);
  }
  _canAct() { return !this._dlg && this._hitFreeze <= 0 && this.combatUnlocked; }
  _openSettings() { if (this._dlg) return; this.scene.launch('Options', { caller: this.cfg.key, mods: this.mods, im: this.im }); this.scene.pause(); }
  _banner(t, ms = 2600) { this.banner.setText(t).setVisible(true); this.time.delayedCall(ms, () => this.banner && this.banner.setVisible(false)); }

  _playerAttack() {
    if (!this.combat) return;
    const now = this.time.now;
    if (now < this._atkReady || this.player.isBusy()) return;
    this._atkReady = now + COMBAT.ATTACK_COOLDOWN_MS;
    this.player.action('attack'); this._sfx('sfx_swing', 0.45);
    const out = this.combat.playerAttack(this.player, COMBAT.ATTACK_DAMAGE, { tool: this.playerAttackTool() });
    for (const r of out) {
      if (r.outcome === 'hit' || r.outcome === 'swarm') { this._sfx('sfx_hit', 0.7); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES; this.cameras.main.shake(110, COMBAT.SHAKE_HIT); }
      else if (r.outcome === 'interrupted') { this._sfx('sfx_hit', 0.55); this._banner('Channel interrupted!', 1200); }
      else if (r.outcome === 'guarding') { this._sfx('sfx_swing', 0.3); this._banner('Blocked up front — FLANK it!', 1400); }
      else if (r.outcome === 'recoil') this._banner('It is charged — wait for the window!', 1400);
      if (r.killed && r.e.boss) this._onBossDefeated?.();
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
    const sp = this.cfg.combat.spawn; this.player.x = tileToPx(sp.tx); this.player.y = tileToPx(sp.ty); this.player.body.reset(this.player.x, this.player.y);
    this.combat.enemies.forEach((e) => { e.awake = false; });
    this.onPlayerDownExtra();
    this._banner('You fall — and wake at the edge.');
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

  // BIG-HEAD modifier — scale the head-region layers of every Character.
  _applyBigHead() {
    const s = this.mods.headScale();
    const heads = (c) => { if (!c?._slotLayers) return; for (const slot of ['head', 'hair', 'brows', 'beard']) (c._slotLayers[slot] || []).forEach((sp) => sp.setScale(s, s).setY(s > 1 ? -10 * (s - 1) : 0)); };
    heads(this.player);
    this.children.list.forEach((o) => { if (o.constructor?.name === 'Character') heads(o); });
  }

  // ---- LOOP -----------------------------------------------------------------
  update(time, delta) {
    const dt = Math.min(delta || 16, 50) / 1000;
    this.tod.advanceRealSeconds(dt);   // advance the day/night clock
    this._updateHud();                 // refresh stats / tracker / objective / minimap
    // THREAT INDICATORS: off by default (clean screen); on via the options toggle,
    // or always-on + enhanced with the ENEMY INTUITION skill (perception/instinct).
    const intuition = !!(this.inv && this.inv.hasSkill('enemy_intuition'));
    this.combat.intuition = intuition;
    this.combat.indicators = bindings.options.threatIndicators || intuition;
    if (this._hitFreeze > 0) { this._hitFreeze--; Movement.stop(this.player); this.combat.update(dt, this.player); DepthSort.update(); this._drawCombatUI(); return; }
    if (this._dlg) { Movement.stop(this.player); this._blockArcG.clear(); this.combat.update(dt, this.player); DepthSort.update(); this._drawCombatUI(); return; }
    const now = this.time.now;
    const { dx, dy } = this.im.vector(); this._inputDir = { dx, dy };
    this.pc.setBlocking(now, this.combatUnlocked && this.im.down('block') && !this.player.isBusy());
    if (this.pc.isDodgeMoving(now)) { const v = this.pc.dodgeVelocity(); this.player.body.setVelocity(v.x, v.y); }
    else if (this.pc.isBlocking()) Movement.stop(this.player);
    else Movement.drive(this.player, dx, dy, this.im.runHeld());
    this.combat.update(dt, this.player);
    if (this.cfg.combat?.respawn) this._respawnTick();
    this._updatePlayerVisual(now);
    DepthSort.update();
    this._drawCombatUI();
    const active = Interaction.update(this.player);
    if (active) this.prompt.setText(`${active.prompt}  (E)`).setVisible(true); else this.prompt.setVisible(false);
  }

  // dev arenas (Greenhollow): respawn a downed encounter so the fight is replayable
  _respawnTick() {
    for (const e of this.combat.enemies) {
      if (!e.alive && !e._respawning) {
        e._respawning = true;
        this.time.delayedCall(2200, () => {
          this.combat.enemies = this.combat.enemies.filter((x) => x !== e);
          const en = this.cfg.combat.enemies[0];
          if (en) this.combat.spawn(en.id, { tx: en.tx, ty: en.ty });
        });
      }
    }
  }
}
