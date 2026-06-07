// =============================================================================
// SCENE: OverworldScene — the seamless world (world-migration PHASE 1 foundation +
// PHASE 2 first region). ONE world-coordinate space; terrain/green-belt streams
// per-chunk (Phase 1); SETTLEMENTS load as cohesive REGION units when the player
// enters their world-coord bounds (Phase 2 — Greenhollow first). Real systems
// (Karma/Quest/Time/Inventory/Social/Dialogue/NpcLife/Interaction) live at scene
// level and compose into the SaveManager via link(); container deltas + position
// round-trip and survive region unload/reload.
//
// PHASE 2 = FUNCTION FIRST: Greenhollow PLAYS on the overworld (cast/quests/social/
// chests/safe-zone/schedules/save) — the gold-standard Part 2.6 art re-polish is a
// SEPARATE following session (terrain autotiler/depth-band/HUD polish are deferred;
// expect it rougher than discrete-v3). Additive: discrete RegionScenes still run via
// M/N/G as the never-regress fallback. Start via scene.start('Overworld').
// =============================================================================

import Phaser from 'phaser';
import { Character } from '../systems/Character.js';
import { Movement } from '../systems/Movement.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { Collision } from '../systems/Collision.js';
import { SaveManager } from '../systems/SaveManager.js';
import { defaultStorage, memoryStorage } from '../systems/storage.js';
import { KarmaEngine } from '../systems/Karma.js';
import { QuestEngine } from '../systems/QuestEngine.js';
import { TimeOfDay } from '../systems/TimeOfDay.js';
import { Inventory } from '../systems/Inventory.js';
import { NpcLife } from '../systems/NpcLife.js';
import { Interaction } from '../systems/Interaction.js';
import { Dialogue } from '../systems/Dialogue.js';
import { Social } from '../systems/Social.js';
import { PROPS } from '../data/assets.js';
import { TERRAIN } from '../data/terrainTiles.js';
import { GREENHOLLOW_CHILDHOOD, GREENHOLLOW_SIDE } from '../data/quests/index.js';
import { TILE, CHUNK_PX, WORLD_CHUNKS, WORLD_PX, chunkContent, GREENHOLLOW, inGreenhollow } from '../data/worldmap.js';

const LOAD_RING = 2, UNLOAD_RING = 3;
const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const cidOf = (x, y) => [Math.floor(x / CHUNK_PX), Math.floor(y / CHUNK_PX)];

export class OverworldScene extends Phaser.Scene {
  constructor() { super('Overworld'); }

  create() {
    DepthSort.reset(); Interaction.reset();
    this.cameras.main.setBackgroundColor('#243a2a');
    this.physics.world.setBounds(0, 0, WORLD_PX, WORLD_PX);

    this.chunks = new Map(); this.pool = []; this.loadQueue = []; this._lastChunk = null;
    this.solids = this.physics.add.staticGroup();
    this._orbTex();
    this._buildSystems();

    // SAVE: restore world-position if present, else spawn in Greenhollow.
    this.save = new SaveManager({ slot: 'overworld', storage: defaultStorage() })
      .link('karma', this.karma).link('inv', this.inv).link('quests', this.quests).link('time', this.tod);
    const hadSave = this.save.load();
    const start = hadSave ? this.save.getPosition() : { ...GREENHOLLOW.player };

    this.player = new Character(this, start.x, start.y, { parts: HERO, facing: 'down', speed: 150 });
    this.add.existing(this.player); DepthSort.track(this.player, 18);
    this.physics.add.collider(this.player, this.solids);

    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);
    this.cameras.main.setZoom(1.25);
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);
    this.cameras.main.setDeadzone(180, 120);

    this.region = null;           // the loaded settlement (Greenhollow), or null
    this._dlg = null; this._selOpt = 0; this._activeQuest = null;
    this._buildDialogueUI();
    this._buildInput();

    this.auto = false; this._autoT = 0; this._lastSaveMs = 0; this._lastLoadMs = 0; this._resetPerf();
    this.hud = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '13px', color: '#d6f5cf', backgroundColor: '#000a', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);
    this.add.text(8, 408, 'OVERWORLD (Phase 2). WASD/arrows · SHIFT run · E talk/interact · F5 save · F9 load · O auto-run', { fontFamily: 'monospace', fontSize: '11px', color: '#9fb89a', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);

    this._restream(true);
    this._maybeToggleRegion(true);
    this.perf = () => ({ fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), loaded: this.chunks.size, region: this.region ? this.region.key : null, npcs: this.npcLife.movers.length, saveMs: +this._lastSaveMs.toFixed(2), loadMs: +this._lastLoadMs.toFixed(2), pos: { x: this.player.x | 0, y: this.player.y | 0 }, gold: this.inv.gold });
  }

  // ---- systems (the real, region-agnostic engines; composed once) ------------
  _buildSystems() {
    const storage = memoryStorage();   // per-session; the SaveManager owns durable composition via link()
    this.karma = new KarmaEngine({ storage });
    this.quests = new QuestEngine({ karma: this.karma, storage, quests: [...GREENHOLLOW_CHILDHOOD, ...GREENHOLLOW_SIDE] });
    this.tod = new TimeOfDay({ storage });
    this.inv = new Inventory({ storage });
    this.npcLife = new NpcLife(this);
    // DEMO seed (mirror discrete Greenhollow): hub side quests available now.
    for (const id of ['SG1', 'SG2', 'SG3', 'SG4']) { this.quests.unlocked.add(id); if (this.quests.state[id]) this.quests.state[id] = 'available'; }
    this._faces = {};
    for (const n of GREENHOLLOW.npcs) this._faces[n.name] = { parts: n.parts, expression: n.expression || 'neutral' };
  }

  _orbTex() { if (this.textures.exists('ow_orb')) return; const g = this.make.graphics({ add: false }); g.fillStyle(0xffe66d, 1).fillCircle(8, 8, 7).lineStyle(2, 0x7a5c00, 1).strokeCircle(8, 8, 7); g.generateTexture('ow_orb', 16, 16); g.destroy(); }
  _resetPerf() { this._ring = new Array(120).fill(16.7); this._ri = 0; this._maxMs = 0; }
  _avg() { let s = 0; for (const v of this._ring) s += v; return s / this._ring.length; }

  // ===========================================================================
  // REGION (settlement) load/unload — a cohesive unit by world-coord proximity
  // ===========================================================================
  _maybeToggleRegion(immediate = false) {
    const near = inGreenhollow(this.player.x, this.player.y) ||
      (Math.abs(this.player.x - (GREENHOLLOW.bounds.x + GREENHOLLOW.bounds.w / 2)) < GREENHOLLOW.bounds.w / 2 + CHUNK_PX &&
       Math.abs(this.player.y - (GREENHOLLOW.bounds.y + GREENHOLLOW.bounds.h / 2)) < GREENHOLLOW.bounds.h / 2 + CHUNK_PX);
    if (near && !this.region) this._loadGreenhollow();
    else if (!near && this.region) this._unloadGreenhollow();
  }

  _loadGreenhollow() {
    const R = GREENHOLLOW; this.region = R;
    this._regionObjs = []; this._chestSprites = [];
    Interaction.reset();
    // PHASE-3 ART (gold-standard v3 restored, RESIDENT atlas): autotiled feathered
    // terrain + the brook + lived-in decals — UNDER the props (ground layer).
    this._buildRegionTerrain(R);
    this._buildRegionWater(R);
    this._buildRegionDecals(R);
    // buildings/props/depth-band (RESIDENT real art; world-coords)
    for (const p of R.props) {
      const d = PROPS[p.key]; if (!d) continue;
      const spr = this.physics.add.sprite(p.x, p.y, p.key).setOrigin(0.5, 0.5);
      if (p.scale != null) spr.setScale(p.scale);
      if (p.tint != null) spr.setTint(p.tint);
      if (p.solid && d.footprint) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); } else if (spr.body) spr.body.enable = false;
      DepthSort.track(spr, d.footprint ? d.footprint.offY + d.footprint.h / 2 : (d.height || 32) / 2);
      this._regionObjs.push(spr);
    }
    // CAST — Character + NpcLife schedule + Interaction (talk while they roam)
    this.npcLife = new NpcLife(this);
    for (const n of R.npcs) this._buildRegionNpc(n);
    this.npcLife.setPhase(this.tod.phase());
    // CHESTS — open → loot → SaveManager chunk-delta (skip already-opened)
    for (const c of R.chests) this._buildRegionChest(c);
  }

  _buildRegionNpc(n) {
    const npc = new Character(this, n.x, n.y, { parts: n.parts, facing: n.facing || 'down', speed: n.speed || 70 });
    this.add.existing(npc); npc.body.setImmovable(false);
    DepthSort.track(npc, 18);
    this.npcLife.add(npc, n.schedule, n.tempo);
    this._regionObjs.push(npc);
    Interaction.register({
      target: npc, targetOffY: 0, prompt: n.quest ? 'Talk (quest)' : 'Talk',
      onInteract: () => this._npcInteract(n),
    });
  }

  _buildRegionChest(c) {
    const [cx, cy] = cidOf(c.x, c.y);
    if (this.save.isOpened(cx, cy, c.id)) return;          // already looted (delta) → don't spawn
    const spr = this.physics.add.sprite(c.x, c.y, 'prop_chest').setOrigin(0.5, 0.72);
    DepthSort.track(spr, 10); this._regionObjs.push(spr); this._chestSprites.push(spr);
    Interaction.register({
      x: c.x, y: c.y + 6, prompt: 'Open the chest',
      onInteract: () => {
        this.inv.addGold(c.gold);
        this.save.recordOpened(cx, cy, c.id);
        spr.setVisible(false).setActive(false); DepthSort.untrack(spr);
        this._startGreeting('', [c.line]);
      },
    });
  }

  _unloadGreenhollow() {
    for (const o of (this._regionObjs || [])) { DepthSort.untrack(o); if (o.body) this.solids.remove(o); o.destroy(); }
    this._regionObjs = []; this._chestSprites = [];
    this.npcLife = new NpcLife(this);   // schedule STATE re-derives from TimeOfDay+deeds on reload; quest/karma/inv persist in the systems
    Interaction.reset();
    this.region = null;
  }

  // ---- PHASE-3 v3 ART (ported from RegionScene; RESIDENT lpc_terrain atlas) ----
  // Autotiled FEATHERED terrain: a RenderTexture over the village holding only the
  // per-cell corner-transition tiles, so each overlay (gravel plaza / dirt road /
  // soil field) interpenetrates the per-chunk grass base — kills the flat tint-step.
  _buildRegionTerrain(R) {
    if (!R.terrain) return;
    const W = R.widthTiles, H = R.heightTiles;
    const rt = this.add.renderTexture(R.origin.x, R.origin.y, W * TILE, H * TILE).setOrigin(0, 0).setDepth(DEPTH.FLOOR + 1);
    for (const patch of (R.terrain.patches || [])) {
      const set = TERRAIN.sets[patch.set]; if (!set) continue;
      const corner = Array.from({ length: H + 1 }, () => new Uint8Array(W + 1));
      for (const [tx, ty, w, h] of (patch.rects || [])) {
        for (let cy = ty; cy <= ty + h; cy++) for (let cx = tx; cx <= tx + w; cx++) {
          if (cy >= 0 && cy <= H && cx >= 0 && cx <= W) corner[cy][cx] = 1;
        }
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const key = `${corner[y][x]}${corner[y][x + 1]}${corner[y + 1][x]}${corner[y + 1][x + 1]}`;
        if (key === '0000') continue;
        const frame = key === '1111' ? set.full : set.edges[key];
        if (frame != null) rt.drawFrame('lpc_terrain', frame, x * TILE, y * TILE);
      }
    }
    this._regionObjs.push(rt);
  }
  // the brook (banked pool) — pond corner/edge tiles, world-coords
  _buildRegionWater(R) {
    if (!R.pond) return;
    const p = R.pond;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
      const img = this.add.image(R.origin.x + (p.tx + x) * TILE, R.origin.y + (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0).setDepth(DEPTH.FLOOR + 1);
      this._regionObjs.push(img);
    }
  }
  // lived-in DECALS — tufts/grass/clover/flowers/ferns/dirt scattered over the village
  // (seeded, edge-avoided, pond-avoided), FLOOR-pinned so they never occlude actors.
  _buildRegionDecals(R) {
    const W = R.widthTiles * TILE, H = R.heightTiles * TILE, m = 2 * TILE, p = R.pond;
    const inPond = (lx, ly) => p && lx >= (p.tx - 0.5) * TILE && lx < (p.tx + p.w + 0.5) * TILE && ly >= (p.ty - 0.5) * TILE && ly < (p.ty + p.h + 0.5) * TILE;
    const layers = [
      { cfg: R.decalLayers[0], originY: 0.5, depth: DEPTH.FLOOR + 2 },   // dirt patches
      { cfg: R.decalLayers[1], originY: 1, depth: DEPTH.FLOOR + 3 },     // tufts / grass / flowers / clover
      { cfg: R.decalLayers[2], originY: 1, depth: DEPTH.FLOOR + 3 },     // ferns
    ];
    for (const layer of layers) {
      const cfg = layer.cfg; if (!cfg) continue; let seed = cfg.seed >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      let placed = 0, tries = 0;
      while (placed < cfg.count && tries < cfg.count * 12) {
        tries++; const lx = Math.floor(rnd() * W), ly = Math.floor(rnd() * H);
        if (lx < m || lx > W - m || ly < m || ly > H - m || inPond(lx, ly)) continue;
        const img = this.add.image(R.origin.x + lx, R.origin.y + ly, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, layer.originY).setDepth(layer.depth);
        placed++; this._regionObjs.push(img);
      }
    }
  }

  // ---- interaction → dialogue branch (mirror the discrete-scene logic) --------
  _npcInteract(n) {
    if (this._dlg) return;
    const st = n.quest ? this.quests.status(n.quest) : null;
    if (n.quest && (st === 'available' || st === 'active')) this._startQuestDialogue(n.quest);
    else if (n.social) this._startDialogue(n.social, n.name);
    else if (st === 'complete' && n.done) this._startGreeting(n.name, n.done);
    else if (n.greeting) this._startGreeting(n.name, n.greeting);
    else if (n.done) this._startGreeting(n.name, n.done);
  }

  // ===========================================================================
  // DIALOGUE (minimal but real — reuses the Dialogue engine + Social gating;
  // the polished box/portrait is RegionScene's, deferred to the polish pass)
  // ===========================================================================
  _dlgCtx() { return { inv: this.inv, karma: this.karma, quests: this.quests }; }
  _startGreeting(name, lines) {
    const nodes = {};
    lines.forEach((t, i) => { const last = i === lines.length - 1; nodes[`g${i}`] = { speaker: name, text: t, options: [last ? { label: '(Step away.)', end: true } : { label: '(Listen.)', to: `g${i + 1}` }] }; });
    this._activeQuest = null; this._dlg = new Dialogue({ start: 'g0', nodes }, this._dlgCtx()); this._openDlg();
  }
  _startDialogue(graph, speakerName) { this._activeQuest = null; this._dlg = new Dialogue(graph, this._dlgCtx()); this._openDlg(); }
  _startQuestDialogue(qid) {
    const def = this.quests.defs[qid]; if (!def || !def.dialogue) return;
    if (this.quests.status(qid) === 'available') this.quests.start(qid);
    this._activeQuest = qid; this._dlg = new Dialogue(def.dialogue, this._dlgCtx()); this._openDlg();
  }
  _openDlg() { this._selOpt = 0; Movement.stop(this.player); this.dlgBox.setVisible(true); this._renderNode(); }
  _renderNode() {
    const node = this._dlg && this._dlg.node(); if (!node) return this._closeDialogue();
    this.dlgName.setText(node.speaker || '—'); this.dlgBody.setText(node.text || '');
    const ctx = { inv: this.inv, karma: this.karma };
    this._optView = this._dlg.options().map((opt, idx) => ({ opt, idx, st: Social.state(opt, ctx), tag: Social.tag(opt) })).filter((v) => v.st !== 'hidden');
    if (this._optView.length && this._optView[this._selOpt] && this._optView[this._selOpt].st === 'locked') { const f = this._optView.findIndex((v) => v.st !== 'locked'); this._selOpt = f >= 0 ? f : 0; }
    this._renderOptions();
  }
  _renderOptions() {
    const view = this._optView || []; this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    view.forEach((v, i) => {
      const locked = v.st === 'locked', sel = i === this._selOpt && !locked;
      const t = this.add.text(28, 372 + i * 18, `${sel ? '▶ ' : '  '}${view.length > 1 ? `${i + 1}. ` : ''}${v.tag}${v.opt.label}`, { fontFamily: 'monospace', fontSize: '13px', color: locked ? '#6b6275' : sel ? '#ffe66d' : v.tag ? '#8fd6ff' : '#cfe8d6' }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 12);
      this.dlgBox.add(t); this._optTexts.push(t);
    });
    this.dlgHint.setText(view.length > 1 ? '↑↓ pick · E confirm' : 'E continue ▸');
  }
  _dlgNav(d) { const view = this._optView || []; if (view.length < 2) return; let i = Phaser.Math.Clamp(this._selOpt + d, 0, view.length - 1); if (view[i] && view[i].st !== 'locked') this._selOpt = i; this._renderOptions(); }
  _dlgConfirm() {
    const view = this._optView || [], v = view[this._selOpt]; if (v && v.st === 'locked') return;
    this._dlg.select(v ? v.idx : this._selOpt); this._selOpt = 0;
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue(); else this._renderNode();
  }
  _closeDialogue() {
    if (this._activeQuest && this.quests.status(this._activeQuest) === 'active') this.quests.complete(this._activeQuest);
    this.dlgBox.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
  }
  _buildDialogueUI() {
    this.dlgBox = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 11).setVisible(false);
    const bg = this.add.rectangle(20, 300, 728, 120, 0x0c1410, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0);
    this.dlgName = this.add.text(28, 308, '', { fontFamily: 'monospace', fontSize: '14px', color: '#9fd8a0', fontStyle: 'bold' }).setScrollFactor(0);
    this.dlgBody = this.add.text(28, 330, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0', wordWrap: { width: 700 } }).setScrollFactor(0);
    this.dlgHint = this.add.text(620, 308, '', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this.dlgBox.add([bg, this.dlgName, this.dlgBody, this.dlgHint]); this._optTexts = [];
  }
  _buildInput() {
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,O');
    this.input.keyboard.on('keydown-E', () => { if (this._dlg) this._dlgConfirm(); else Interaction.tryInteract(); });
    this.input.keyboard.on('keydown-UP', () => { if (this._dlg) this._dlgNav(-1); });
    this.input.keyboard.on('keydown-DOWN', () => { if (this._dlg) this._dlgNav(1); });
    this.input.keyboard.on('keydown-F5', () => this.saveGame());
    this.input.keyboard.on('keydown-F9', () => this.loadGame());
    this.input.keyboard.on('keydown-O', () => { this.auto = !this.auto; this._autoT = 0; });
  }

  // ---- per-chunk terrain/green-belt streaming (Phase 1; unchanged) -----------
  _restream(immediate = false) {
    const [pcx, pcy] = cidOf(this.player.x, this.player.y);
    for (const [k, c] of this.chunks) if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cy - pcy)) > UNLOAD_RING) this._release(k, c);
    for (let dy = -LOAD_RING; dy <= LOAD_RING; dy++) for (let dx = -LOAD_RING; dx <= LOAD_RING; dx++) {
      const cx = pcx + dx, cy = pcy + dy;
      if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS || cy >= WORLD_CHUNKS) continue;
      const k = `${cx},${cy}`;
      if (this.chunks.has(k) || this.loadQueue.some((q) => q.k === k)) continue;
      this.loadQueue.push({ k, cx, cy, d: Math.max(Math.abs(dx), Math.abs(dy)) });
    }
    this.loadQueue.sort((a, b) => a.d - b.d);
    if (immediate) while (this.loadQueue.length) this._spawn(this.loadQueue.shift());
  }
  _spawn({ k, cx, cy }) {
    const data = chunkContent(cx, cy), ox = cx * CHUNK_PX, oy = cy * CHUNK_PX;
    let c = this.pool.pop();
    if (!c) c = { ground: this.add.tileSprite(0, 0, CHUNK_PX, CHUNK_PX, 'tile_grass').setOrigin(0, 0), props: [], decals: [], cx, cy };
    c.cx = cx; c.cy = cy;
    c.ground.setPosition(ox, oy).setVisible(true).setActive(true).clearTint().setDepth(DEPTH.FLOOR);   // uniform grass (no per-chunk tint-step)
    // suppress green-belt scatter UNDER the settlement (the region draws its own)
    const overRegion = inGreenhollow(ox + CHUNK_PX / 2, oy + CHUNK_PX / 2);
    let pi = 0;
    if (!overRegion) for (const p of data.props) {
      let spr = c.props[pi++]; if (!spr) { spr = this.add.sprite(0, 0, p.key).setOrigin(0.5, 0.85); c.props.push(spr); }
      const d = PROPS[p.key] || {};
      spr.setTexture(p.key).setPosition(p.x, p.y).setVisible(true).setActive(true);
      DepthSort.track(spr, d.footprint ? d.footprint.offY + d.footprint.h / 2 : (d.height || 32) * 0.15);
    }
    for (; pi < c.props.length; pi++) { c.props[pi].setVisible(false).setActive(false); DepthSort.untrack(c.props[pi]); }
    // belt DECALS — FLOOR-pinned ground dressing (flowers/tufts), never occlude actors
    let di = 0;
    if (!overRegion) for (const dc of (data.decals || [])) {
      let img = c.decals[di++]; if (!img) { img = this.add.image(0, 0, dc.key).setOrigin(0.5, 1).setDepth(DEPTH.FLOOR + 2); c.decals.push(img); }
      img.setTexture(dc.key).setPosition(dc.x, dc.y).setVisible(true).setActive(true);
    }
    for (; di < c.decals.length; di++) c.decals[di].setVisible(false).setActive(false);
    this.chunks.set(k, c);
  }
  _release(k, c) {
    for (const spr of c.props) { spr.setVisible(false).setActive(false); DepthSort.untrack(spr); }
    for (const img of (c.decals || [])) img.setVisible(false).setActive(false);
    c.ground.setVisible(false).setActive(false);
    this.chunks.delete(k); this.pool.push(c);
  }
  _wipe() { for (const k of [...this.chunks.keys()]) this._release(k, this.chunks.get(k)); }

  // ---- save / load -----------------------------------------------------------
  saveGame() { const t = performance.now(); this.save.setPosition(this.player.x, this.player.y).setArea('overworld').setTimeFrac(this.tod.frac ? this.tod.frac() : 0).save(); this._lastSaveMs = performance.now() - t; return this._lastSaveMs; }
  loadGame() {
    const t = performance.now();
    if (!this.save.load()) { this._lastLoadMs = performance.now() - t; return false; }
    const p = this.save.getPosition();
    this.player.x = p.x; this.player.y = p.y; this.player.body.reset(p.x, p.y);
    if (this.region) this._unloadGreenhollow();
    this._wipe(); this._lastChunk = null; this._restream(true); this._maybeToggleRegion(true);
    this.cameras.main.centerOn(p.x, p.y);
    this._lastLoadMs = performance.now() - t; return true;
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    const dlgOpen = !!this._dlg;
    const k = this.keys, run = k.SHIFT.isDown;
    let dx = 0, dy = 0;
    if (dlgOpen) { Movement.stop(this.player); }
    else if (this.auto) { this._autoT += dt; dx = Math.cos(this._autoT * 0.5); dy = Math.sin(this._autoT * 1.3); Movement.drive(this.player, dx, dy, true); }
    else {
      if (k.A.isDown || k.LEFT.isDown) dx -= 1; if (k.D.isDown || k.RIGHT.isDown) dx += 1;
      if (k.W.isDown || k.UP.isDown) dy -= 1; if (k.S.isDown || k.DOWN.isDown) dy += 1;
      if (dx || dy) Movement.drive(this.player, dx, dy, run); else Movement.stop(this.player);
    }

    const [pcx, pcy] = cidOf(this.player.x, this.player.y), pc = `${pcx},${pcy}`;
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); this._maybeToggleRegion(); }
    while (this.loadQueue.length) this._spawn(this.loadQueue.shift());

    if (this.npcLife.has()) this.npcLife.update(dt, dlgOpen);
    Interaction.update(this.player);
    DepthSort.update();

    this._ring[this._ri] = delta; this._ri = (this._ri + 1) % this._ring.length;
    if (delta > this._maxMs) this._maxMs = delta;
    if ((time | 0) % 6 === 0) this._drawHud();
  }

  _drawHud() {
    const p = this.perf(), act = Interaction.active;
    this.hud.setText([
      `OVERWORLD   FPS ${p.fps}   avg ${p.avgMs}ms  max ${p.maxMs}ms   region ${p.region || '(green belt)'}`,
      `chunks ${p.loaded}/${WORLD_CHUNKS * WORLD_CHUNKS}   NPCs ${p.npcs}   gold ${p.gold}   ${act ? '[E] ' + act.prompt : ''}`,
      `pos ${p.pos.x},${p.pos.y}   save ${p.saveMs}ms load ${p.loadMs}ms   (F5/F9)   ${this.auto ? 'AUTO' : ''}`,
    ].join('\n'));
  }
}
