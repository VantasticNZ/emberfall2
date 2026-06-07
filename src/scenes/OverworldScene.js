// =============================================================================
// SCENE: OverworldScene — the PRODUCTION seamless world foundation (world-migration
// PHASE 1, per WORLD-STRUCTURE-DESIGN Pillar 1). The real, hardened substrate every
// region migrates onto (Phase 2+): ONE world-coordinate space, OBJECT streaming
// around the player (RESIDENT art per the asset spike — no texture-streaming),
// continuous follow camera, depth-sort over the streamed set, and the SaveManager
// persisting world-position + per-chunk DELTAS with a round-trip you can prove.
//
// Phase 1 = EMPTY-but-WORKING: a walkable seamless test surface (real resident grass
// + props from worldmap.js) with test PICKUP orbs that record save-deltas. NO real
// region content yet (that's Phase 2). Additive: the discrete RegionScenes still run
// via their hotkeys; this stands BESIDE them. Start via scene.start('Overworld').
// ⚑ The hero here is the real Character rig; the pickup ORB is a flagged test marker
//   (real interactables/containers arrive with region migration).
// =============================================================================

import Phaser from 'phaser';
import { Character } from '../systems/Character.js';
import { Movement } from '../systems/Movement.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { SaveManager } from '../systems/SaveManager.js';
import { defaultStorage } from '../systems/storage.js';
import { PROPS } from '../data/assets.js';
import { TILE, CHUNK_PX, WORLD_CHUNKS, WORLD_PX, chunkContent } from '../data/worldmap.js';

const LOAD_RING = 2, UNLOAD_RING = 3;          // 5×5 loaded, 7×7 kept (hysteresis) — de-risked in Phase 0
const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const cidOf = (x, y) => [Math.floor(x / CHUNK_PX), Math.floor(y / CHUNK_PX)];

export class OverworldScene extends Phaser.Scene {
  constructor() { super('Overworld'); }

  create() {
    DepthSort.reset();
    this.cameras.main.setBackgroundColor('#243a2a');
    this.physics.world.setBounds(0, 0, WORLD_PX, WORLD_PX);

    this.chunks = new Map();           // "cx,cy" -> { ground, props[], orbs[], cx, cy }
    this.pool = [];
    this.loadQueue = [];
    this._lastChunk = null;
    this._orbTex();                    // a flagged test-pickup marker (generated)

    // SAVE: restore world-position if a save exists, else start at world centre.
    this.save = new SaveManager({ slot: 'overworld', storage: defaultStorage() });
    const hadSave = this.save.load();
    const start = hadSave ? this.save.getPosition() : { x: WORLD_PX / 2, y: WORLD_PX / 2 };

    // PLAYER — the real Character rig, on world-coords.
    this.player = new Character(this, start.x, start.y, { parts: HERO, facing: 'down', speed: 150 });
    this.add.existing(this.player);
    DepthSort.track(this.player, 18);

    // CAMERA — fixed play-zoom + continuous follow (NO cover-zoom: the world is always
    // bigger than the screen). Bounds = the whole world; the streamer keeps content ahead.
    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);
    this.cameras.main.setZoom(1.25);
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);
    this.cameras.main.setDeadzone(180, 120);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,O');
    this.input.keyboard.on('keydown-F5', () => this.saveGame());
    this.input.keyboard.on('keydown-F9', () => this.loadGame());
    this.input.keyboard.on('keydown-E', () => this._tryPickup());
    this.input.keyboard.on('keydown-O', () => { this.auto = !this.auto; this._autoT = 0; });
    this.auto = false; this._autoT = 0; this._lastSaveMs = 0; this._lastLoadMs = 0;
    this._resetPerf();

    this.hud = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '13px', color: '#d6f5cf', backgroundColor: '#000a', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);
    this.add.text(8, 408, 'OVERWORLD SHELL (Phase 1). WASD/arrows · SHIFT run · E pick orb · F5 save · F9 load · O auto-run', { fontFamily: 'monospace', fontSize: '11px', color: '#9fb89a', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);

    this._restream(true);
    // expose for live/headless verification
    this.perf = () => ({ fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), loaded: this.chunks.size, pooled: this.pool.length, saveMs: +this._lastSaveMs.toFixed(2), loadMs: +this._lastLoadMs.toFixed(2), picked: this._pickedCount(), pos: { x: this.player.x | 0, y: this.player.y | 0 } });
  }

  _orbTex() { if (this.textures.exists('ow_orb')) return; const g = this.make.graphics({ add: false }); g.fillStyle(0xffe66d, 1).fillCircle(8, 8, 7).lineStyle(2, 0x7a5c00, 1).strokeCircle(8, 8, 7); g.generateTexture('ow_orb', 16, 16); g.destroy(); }
  _resetPerf() { this._ring = new Array(120).fill(16.7); this._ri = 0; this._maxMs = 0; }
  _avg() { let s = 0; for (const v of this._ring) s += v; return s / this._ring.length; }
  _pickedCount() { let n = 0; for (const k in this.save.state.chunks) n += Object.keys(this.save.state.chunks[k].picked).length; return n; }

  // ---- streaming (object-streaming; RESIDENT art) ---------------------------
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
    if (!c) c = { ground: this.add.tileSprite(0, 0, CHUNK_PX, CHUNK_PX, 'tile_grass').setOrigin(0, 0), props: [], orbs: [], cx, cy };
    c.cx = cx; c.cy = cy;
    c.ground.setPosition(ox, oy).setVisible(true).setActive(true).setTint(data.tint).setDepth(DEPTH.FLOOR);

    // PROPS — real resident art; depth-sorted by footprint base; pooled
    let pi = 0;
    for (const p of data.props) {
      let spr = c.props[pi++];
      if (!spr) { spr = this.add.sprite(0, 0, p.key).setOrigin(0.5, 0.85); c.props.push(spr); }
      const d = PROPS[p.key] || {};
      spr.setTexture(p.key).setPosition(p.x, p.y).setVisible(true).setActive(true);
      DepthSort.track(spr, d.footprint ? d.footprint.offY + d.footprint.h / 2 : (d.height || 32) * 0.15);
    }
    for (; pi < c.props.length; pi++) { c.props[pi].setVisible(false).setActive(false); DepthSort.untrack(c.props[pi]); }

    // ORBS — test pickups; skip any already PICKED in the save delta (round-trip)
    let oi = 0;
    for (const o of data.pickups) {
      if (this.save.isPicked(cx, cy, o.id)) continue;
      let orb = c.orbs[oi];
      if (!orb) { orb = this.add.image(0, 0, 'ow_orb'); orb._isOrb = true; c.orbs.push(orb); }
      orb.setPosition(o.x, o.y).setVisible(true).setActive(true).setData('oid', o.id).setData('cx', cx).setData('cy', cy).setDepth(DEPTH.FLOOR + 1);
      oi++;
    }
    for (; oi < c.orbs.length; oi++) c.orbs[oi].setVisible(false).setActive(false).setData('oid', null);
    this.chunks.set(k, c);
  }

  _release(k, c) {
    for (const spr of c.props) { spr.setVisible(false).setActive(false); DepthSort.untrack(spr); }
    for (const orb of c.orbs) orb.setVisible(false).setActive(false).setData('oid', null);
    c.ground.setVisible(false).setActive(false);
    this.chunks.delete(k); this.pool.push(c);
  }

  // ---- interaction: pick the nearest visible orb -> record a chunk DELTA -----
  _tryPickup() {
    let best = null, bd = 48 * 48;
    for (const c of this.chunks.values()) for (const orb of c.orbs) {
      if (!orb.active || !orb.getData('oid')) continue;
      const dx = orb.x - this.player.x, dy = orb.y - this.player.y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = orb; }
    }
    if (best) { this.save.recordPicked(best.getData('cx'), best.getData('cy'), best.getData('oid')); best.setVisible(false).setActive(false).setData('oid', null); return true; }
    return false;
  }

  // ---- save / load (timed) ---------------------------------------------------
  saveGame() {
    const t = performance.now();
    this.save.setPosition(this.player.x, this.player.y).setArea('overworld').save();
    this._lastSaveMs = performance.now() - t;
    return this._lastSaveMs;
  }
  loadGame() {
    const t = performance.now();
    if (!this.save.load()) { this._lastLoadMs = performance.now() - t; return false; }
    const p = this.save.getPosition();
    this.player.x = p.x; this.player.y = p.y; this.player.body.reset(p.x, p.y);
    this._wipe(); this._lastChunk = null; this._restream(true);   // re-stream around the restored position (deltas re-applied)
    this.cameras.main.centerOn(p.x, p.y);
    this._lastLoadMs = performance.now() - t;
    return true;
  }
  _wipe() { for (const k of [...this.chunks.keys()]) this._release(k, this.chunks.get(k)); }

  update(time, delta) {
    const k = this.keys, run = k.SHIFT.isDown;
    let dx = 0, dy = 0;
    if (this.auto) { this._autoT += delta / 1000; dx = Math.cos(this._autoT * 0.5); dy = Math.sin(this._autoT * 1.3); }
    else { if (k.A.isDown || k.LEFT.isDown) dx -= 1; if (k.D.isDown || k.RIGHT.isDown) dx += 1; if (k.W.isDown || k.UP.isDown) dy -= 1; if (k.S.isDown || k.DOWN.isDown) dy += 1; }
    if (dx || dy) Movement.drive(this.player, dx, dy, run || this.auto); else Movement.stop(this.player);

    const [pcx, pcy] = cidOf(this.player.x, this.player.y), pc = `${pcx},${pcy}`;
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); }
    while (this.loadQueue.length) this._spawn(this.loadQueue.shift());
    DepthSort.update();

    this._ring[this._ri] = delta; this._ri = (this._ri + 1) % this._ring.length;
    if (delta > this._maxMs) this._maxMs = delta;
    if ((time | 0) % 6 === 0) this._drawHud();
  }

  _drawHud() {
    const p = this.perf();
    this.hud.setText([
      `OVERWORLD SHELL   FPS ${p.fps}   frame avg ${p.avgMs}ms  max ${p.maxMs}ms`,
      `chunks loaded ${p.loaded}/${WORLD_CHUNKS * WORLD_CHUNKS}  pooled ${p.pooled}   orbs picked ${p.picked}`,
      `pos ${p.pos.x},${p.pos.y}  chunk ${(p.pos.x / CHUNK_PX) | 0},${(p.pos.y / CHUNK_PX) | 0}   ${this.auto ? 'AUTO-RUN' : ''}`,
      `last save ${p.saveMs}ms   last load ${p.loadMs}ms   (F5 save · F9 load)`,
    ].join('\n'));
  }
}
