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
import { EnemyController } from '../systems/EnemyController.js';
import { PlayerCombat } from '../systems/Combat.js';
import { ModifierRegistry } from '../systems/Modifiers.js';
import { COMBAT } from '../constants/standards.js';
import { bindings } from '../constants/controls.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { PROPS, PARTS, DIR_ROW, ANIMS, EXPRESSIONS, EXPR_COLS, EXPR_ROW, solidBox } from '../data/assets.js';
import { TERRAIN } from '../data/terrainTiles.js';
import { GREENHOLLOW_CHILDHOOD, GREENHOLLOW_SIDE, ASHEN_MARSH, SUNDERED_PEAKS as PEAKS_QUESTS, SUNDERED_PEAKS_SIDE } from '../data/quests/index.js';
import { TILE, CHUNK_PX, WORLD_CHUNKS, WORLD_PX, chunkContent, groundTintAt, GREENHOLLOW, ASHEN_MARSH as MARSH_REGION, REGIONS, regionAt, inGreenhollow, inMarsh } from '../data/worldmap.js';

const FACE_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

const LOAD_RING = 2, UNLOAD_RING = 3;
const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
const cidOf = (x, y) => [Math.floor(x / CHUNK_PX), Math.floor(y / CHUNK_PX)];

export class OverworldScene extends Phaser.Scene {
  constructor() { super('Overworld'); }

  create() {
    DepthSort.reset(); Interaction.reset();
    AssetLoader.build(this);   // register the per-facing walk/idle anims (same path RegionScene uses) —
                               // WITHOUT this, Characters can't turn (stuck on spritesheet frame 0 = facing up)
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
    this.player.isAdult = true; this.player.isMinor = false;
    this.player.equip('sword');   // FIX: the player swings a visible sword (discrete RegionScene does this; Overworld didn't → "no sword")
    // y-sort the hero by its FEET LINE (the collision base = body bottom), so it sorts against
    // buildings/rocks/trees by where it meets the ground — the SAME anchor the pixel-truth collider
    // uses. (Was 18 = ~12px above the feet → the hero drew UNDER a building it stood in FRONT of.)
    this.add.existing(this.player); DepthSort.track(this.player, this.player.body.offset.y + this.player.body.height);
    this.physics.add.collider(this.player, this.solids);
    this.combat = new EnemyController(this, { solids: this.solids, onPlayerHit: (dmg, info) => this._onPlayerHit(dmg, info), onPlayerRecoil: (dmg) => this._onPlayerRecoil(dmg) });
    this._buildCombatUI();
    this._blockArcG = this.add.graphics().setDepth(DEPTH.OVERLAY);

    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);
    // CLOSER 1.25 WORLD ZOOM (matches the discrete RegionScene). The HUD can't ride the
    // main camera at >1.0 (scrollFactor-0 objects get zoom-scaled about the camera midpoint
    // = the old "moving funny" drift), so a dedicated uiCamera at zoom 1 renders the HUD and
    // the main camera ignores it (see _setupUICamera). _reconcileCameras keeps every STREAMED
    // world object off the uiCamera so nothing leaks over the HUD.
    this.cameras.main.setZoom(1.25);   // closer world zoom; the HUD rides a separate zoom-1 uiCamera (see _setupUICamera)
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);
    this.cameras.main.setDeadzone(160, 110);

    this.region = null;           // PRIMARY region (player's current), or null = belt
    this._activeRegions = [];     // ALL loaded regions near the player (both-regions border loader)
    this._dlg = null; this._selOpt = 0; this._activeQuest = null;
    this._buildDialogueUI();
    this._buildInput();

    this.auto = false; this._autoT = 0; this._lastSaveMs = 0; this._lastLoadMs = 0; this._resetPerf();
    this._buildWorldHud();
    this._helpText = this.add.text(8, 412, 'WASD move · SHIFT run · E talk · J attack · Space dodge · C block · O map · T quests · H hide HUD · Esc settings · F5/F9 save/load', { fontFamily: 'monospace', fontSize: '10px', color: '#9fb89a', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);

    this._restream(true);
    this._maybeToggleRegion(true);
    this._setupUICamera();   // isolate the HUD onto its own zoom-1 camera so the world can zoom past 1.0
    this._reconcileCameras();
    this.perf = () => ({ fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), loaded: this.chunks.size, region: this.region ? this.region.key : null, npcs: this.npcLife.movers.length, saveMs: +this._lastSaveMs.toFixed(2), loadMs: +this._lastLoadMs.toFixed(2), pos: { x: this.player.x | 0, y: this.player.y | 0 }, gold: this.inv.gold });
  }

  // ---- systems (the real, region-agnostic engines; composed once) ------------
  _buildSystems() {
    const storage = memoryStorage();   // per-session; the SaveManager owns durable composition via link()
    this.karma = new KarmaEngine({ storage });
    this.quests = new QuestEngine({ karma: this.karma, storage, quests: [...GREENHOLLOW_CHILDHOOD, ...GREENHOLLOW_SIDE, ...ASHEN_MARSH, ...PEAKS_QUESTS, ...SUNDERED_PEAKS_SIDE] });
    this.tod = new TimeOfDay({ storage });
    this.inv = new Inventory({ storage });
    this.inv.hp = this.inv.stats().maxHp;
    if (this.inv.add('iron_shield')) this.inv.equip('iron_shield');
    this.player_isAdult = true;
    this.pc = new PlayerCombat();
    this.mods = new ModifierRegistry(undefined, { dev: false });   // for the Options menu (audio/modifier toggles)
    this.npcLife = new NpcLife(this);
    // combat runtime state (live only in a non-safe region; Greenhollow is safe)
    this.combat = null; this._bossActive = false; this.boss = null;
    this._hitFreeze = 0; this._atkReady = 0; this._atkBuffered = 0; this._playerFlash = 0; this._inputDir = { dx: 0, dy: 0 };
    // DEMO seed (mirror discrete Greenhollow): hub side quests available now.
    for (const id of ['SG1', 'SG2', 'SG3', 'SG4']) { this.quests.unlocked.add(id); if (this.quests.state[id]) this.quests.state[id] = 'available'; }
    this._faces = {};
    for (const R of REGIONS) for (const n of R.npcs) this._faces[n.name] = { parts: n.parts, expression: n.expression || 'neutral' };
  }

  _orbTex() { if (this.textures.exists('ow_orb')) return; const g = this.make.graphics({ add: false }); g.fillStyle(0xffe66d, 1).fillCircle(8, 8, 7).lineStyle(2, 0x7a5c00, 1).strokeCircle(8, 8, 7); g.generateTexture('ow_orb', 16, 16); g.destroy(); }
  _resetPerf() { this._ring = new Array(120).fill(16.7); this._ri = 0; this._maxMs = 0; }
  _avg() { let s = 0; for (const v of this._ring) s += v; return s / this._ring.length; }

  // ===========================================================================
  // REGION (settlement) load/unload — a cohesive unit by world-coord proximity
  // ===========================================================================
  // BOTH-REGIONS-NEAR-BORDER LOADER (border-pop fix): load EVERY region within the
  // load margin (not one-at-a-time), so near a border BOTH region interiors render —
  // you no longer see into the next region's empty footprint. `this.region` = the
  // PRIMARY region (the one the player is inside, or null in the belt) for safe-zone /
  // combat / interaction decisions; `_activeRegions` = the full loaded set (visuals +
  // NPCs + combat). On any change to that set, rebuild (cheap; only at border crossings).
  _maybeToggleRegion(immediate = false) {
    const inRange = REGIONS.filter((R) => {
      const b = R.bounds;
      const cx = Math.max(b.x, Math.min(this.player.x, b.x + b.w)), cy = Math.max(b.y, Math.min(this.player.y, b.y + b.h));
      return Math.hypot(this.player.x - cx, this.player.y - cy) < CHUNK_PX;
    });
    const cur = this._activeRegions || [];
    const same = inRange.length === cur.length && inRange.every((R) => cur.includes(R));
    if (!same) { this._unloadAllRegions(); this._loadRegions(inRange); this._wipe(); this._restream(true); }
    this.region = regionAt(this.player.x, this.player.y);   // primary (or null = belt) — refresh each call
    this._setAmbient(this.region?.mountain ? 'amb_wind' : 'amb_birds');   // region soundscape (wind in the Peaks, birds in the green)
  }

  _loadRegions(list) {
    this._activeRegions = list.slice();
    this._regionObjs = []; this._chestSprites = []; this._npcByQuest = {};
    Interaction.reset();
    this.npcLife = new NpcLife(this);
    for (const R of list) this._buildRegion(R);
    this.npcLife.setPhase(this.tod.phase());
    this.region = regionAt(this.player.x, this.player.y);
  }

  // build ONE region's content into the SHARED state (objs / npcLife / combat).
  _buildRegion(R) {
    if (R.terrain) this._buildRegionTerrain(R);
    if (R.cliffWalls) this._buildRegionCliffs(R);   // continuous cliff faces (QUALITY-SPEC C1)
    this._buildRegionWater(R);
    this._buildRegionDecals(R);
    // CHANNEL COLLIDERS — invisible static tile-rects (decoupled from prop footprints so
    // walls have no vertical seams the hero slips through). Used by the WEST_BELT route.
    for (const c of (R.colliders || [])) {
      const rect = this.add.rectangle(c.x, c.y, c.w, c.h, 0x000000, 0).setVisible(false);
      this.physics.add.existing(rect, true);               // static Arcade body sized to the rect
      this.solids.add(rect);
      this._regionObjs.push(rect);
    }
    for (const p of R.props) {
      const d = PROPS[p.key]; if (!d) continue;
      const spr = this.add.sprite(p.x, p.y, p.key).setOrigin(0.5, 0.5);   // pure VISUAL (no physics body)
      if (p.scale != null) spr.setScale(p.scale);
      if (p.flip) spr.setFlipX(true);
      if (p.tint != null) spr.setTint(p.tint);
      // SOLID props get a STATIC collider RECT derived by THE ONE RULE (solidBox) — consistent
      // for every house/rock/tree, no per-object tuning. Static body (the cliff-wall pattern that
      // provably blocks; a dynamic body in the STATIC solids group never enters the collision tree).
      const sc = (p.scale != null ? p.scale : 1);
      const b = solidBox(p.key, d);
      const offX = (p.flip ? -b.offX : b.offX);   // mirror the collider with the sprite's flipX (off-centre silhouettes, e.g. tree trunks)
      if (p.solid) {
        const rect = this.add.rectangle(p.x + offX * sc, p.y + b.offY * sc, Math.max(8, b.w * sc), Math.max(8, b.h * sc), 0x000000, 0).setVisible(false);
        this.physics.add.existing(rect, true); this.solids.add(rect); this._regionObjs.push(rect);
        spr.setData('solidKey', p.key);   // pixel-truth test hook: marks this sprite as a tested solid
      }
      DepthSort.track(spr, (b.offY + b.h / 2) * sc);   // y-sort by the solid base (same rule)
      this._regionObjs.push(spr);
    }
    for (const n of R.npcs) this._buildRegionNpc(n);
    for (const c of (R.chests || [])) this._buildRegionChest(c);
    // COMBAT — a non-safe region (Marsh/Peaks) spawns its enemies + hub; a safe region
    // (Greenhollow/Belt/Foothill) spawns none. With several loaded, only the combat
    // region's enemies exist (in their own bounds).
    if (R.combat && R.combat.enabled && !R.safeZone) this._buildRegionCombat(R);
    // ENTRY GATE (Foothill→Peaks: a rockfall keyed to shard_1, per gating.js).
    if (R.gate) this._buildRegionGate(R);
    // PEAKS set-pieces: Cinder Keep (the grapple + shard_2 grant point) + the records.
    if (R.keep) this._buildPeaksKeep(R);
    if (R.records) this._buildPeaksRecords(R);
  }

  // CLIFFS — render cliff MASSES (rectangles in R.cliffWalls, local tiles) as ONE continuous
  // RenderTexture: every wall tile = the seamless rock FACE; a wall tile with no wall above =
  // the rock-LIP top edge. So cliffs read as continuous faces with a feathered top, NOT
  // scattered single props (QUALITY-SPEC C1: 0 orphan tiles, 0 gaps, perimeter uses the edge).
  // Collision stays the invisible tile-colliders (R.colliders); this is pure visual.
  _buildRegionCliffs(R) {
    const W = R.widthTiles, H = R.heightTiles;
    const wall = Array.from({ length: H }, () => new Uint8Array(W));
    for (const [x, y, w, h] of R.cliffWalls) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const tx = x + i, ty = y + j; if (tx >= 0 && tx < W && ty >= 0 && ty < H) wall[ty][tx] = 1;
    }
    const rt = this.add.renderTexture(R.origin.x, R.origin.y, W * TILE, H * TILE).setOrigin(0, 0).setDepth(DEPTH.FLOOR + 3);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!wall[y][x]) continue;
      const isTop = (y === 0 || !wall[y - 1][x]);     // no wall above → the lip; else solid face
      rt.draw(isTop ? 'cliff_top' : 'cliff_wall', x * TILE, y * TILE);
    }
    this._regionObjs.push(rt);
  }

  // ENTRY GATE — while the player lacks the keyed deed (shard_1), seal the lane mouths
  // with the rockfall colliders + a diegetic "inspect" prompt explaining the key. Once
  // borne, the pass is simply open (no collider) — gating.js declares this; no soft-lock
  // (shard_1 is earned in the ungated Marsh, so the key always precedes the gate).
  _buildRegionGate(R) {
    const g = R.gate;
    if (this.karma.hasDeed(g.deed)) return;                 // unlocked — pass open
    for (const c of g.colliders) {
      const rect = this.add.rectangle(c.x, c.y, c.w, c.h, 0x000000, 0).setVisible(false);
      this.physics.add.existing(rect, true); this.solids.add(rect); this._regionObjs.push(rect);
    }
    const m = this.physics.add.sprite(g.sign.x, g.sign.y, 'prop_rock_crag').setTint(0x8a8f9c);
    m.body.enable = false; DepthSort.track(m, 30); this._regionObjs.push(m);
    Interaction.register({ x: g.sign.x, y: g.sign.y + 8, prompt: 'Inspect the rockfall', onInteract: () => this._startGreeting('', [g.lockedMsg]) });
  }

  // CINDER KEEP — the GRAPPLE + SHARD_2 grant point (gating.js: Peaks GRANTS tool_grapple
  // + shard_2). Mirrors the Marsh lantern beat. FLAG: the full M12 Keep-Sentinel boss
  // fight (as Marsh's Drowned-Guardian) is not yet wired into the overworld boss flow —
  // the grant is taken at the Keep entrance for now (deferred: generalise the boss flow).
  _buildPeaksKeep(R) {
    const k = R.keep;
    Interaction.register({ x: k.x, y: k.y + 14, prompt: `Enter ${k.name}`, onInteract: () => {
      if (this.karma.hasDeed('tool_grapple')) return this._startGreeting('', ['Cinder Keep stands silent — the Sentinel down, the grapple and Shard II already yours.']);
      this.karma.recordDeed('tool_grapple', { tool: 'grapple' });
      this.karma.recordDeed('shard_2');
      this.saveGame();
      this._itemGetFx(this.player.x, this.player.y - 8, 'ow_orb', 0xbfe0ec);   // the 2D overhead item-get beat (grapple fallback) + sting
      this._banner('CINDER KEEP — you wrest the Order\'s GRAPPLE from the broken Sentinel and claim SHARD II. New ledges await the hook.', 5200);
    } });
  }
  _buildPeaksRecords(R) {
    const r = R.records;
    const m = this.physics.add.sprite(r.x, r.y, 'prop_sign').setTint(0x9a8f6a);
    m.body.enable = false; DepthSort.track(m, 8); this._regionObjs.push(m);
    Interaction.register({ x: r.x, y: r.y + 8, prompt: `Read ${r.name}`, onInteract: () => {
      const st = this.quests.status('SP1');
      if (st === 'available' || st === 'active') return this._startQuestDialogue('SP1');
      if (st === 'complete') return this._startGreeting('', ['The Order\'s records, read and damning.']);
      return this._startGreeting('', ['Weathered ledgers of the Order — sealed until the town trusts you (stand with the miners).']);
    } });
  }

  _buildRegionNpc(n) {
    const npc = new Character(this, n.x, n.y, { parts: n.parts, facing: n.facing || 'down', speed: n.speed || 70 });
    this.add.existing(npc); npc.body.setImmovable(false);
    DepthSort.track(npc, npc.body.offset.y + npc.body.height);   // sort NPCs by their feet line too (same as the hero)
    this.npcLife.add(npc, n.schedule, n.tempo);
    this._regionObjs.push(npc);
    if (n.quest) (this._npcByQuest || (this._npcByQuest = {}))[n.quest] = npc;   // objective-arrow target (live)
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
    let looted = false;
    Interaction.register({
      x: c.x, y: c.y + 6, prompt: 'Open the chest',
      onInteract: () => {
        if (looted || this.save.isOpened(cx, cy, c.id)) return;   // OBJECT PERMANENCE: looted once, never re-claimed
        looted = true;
        this.inv.addGold(c.gold);
        this.save.recordOpened(cx, cy, c.id);
        spr.setVisible(false).setActive(false); DepthSort.untrack(spr);
        this._sfx('sfx_pickup', 0.85); this._itemGetFx(c.x, c.y - 4);   // feedback + the 2D item-get flourish
        this._startGreeting('', [c.line]);
      },
    });
  }

  _unloadAllRegions() {
    for (const o of (this._regionObjs || [])) { DepthSort.untrack(o); if (o.body) this.solids.remove(o); o.destroy(); }
    this._regionObjs = []; this._chestSprites = [];
    if (this.combat) this.combat.destroyAll();   // despawn enemies (killed state persists in save deltas)
    this._bossActive = false; this.boss = null;
    this.npcLife = new NpcLife(this);   // schedule STATE re-derives from TimeOfDay+deeds on reload; quest/karma/inv persist in the systems
    Interaction.reset();
    this.region = null; this._activeRegions = [];
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
  // WATER — Greenhollow's single brook (R.pond) OR Marsh's several bog pools (R.pools),
  // tinted to the biome (murky for the bog).
  _buildRegionWater(R) {
    const pools = R.pools && R.pools.length ? R.pools : (R.pond ? [R.pond] : []);
    for (const p of pools) for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
      const img = this.add.image(R.origin.x + (p.tx + x) * TILE, R.origin.y + (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0).setDepth(DEPTH.FLOOR + 1);
      if (R.waterTint != null) img.setTint(R.waterTint);
      this._regionObjs.push(img);
    }
  }
  // lived-in DECALS — scattered over the region (seeded, edge+water-avoided), FLOOR-
  // pinned so they never occlude actors. Greenhollow = flowers/ferns; Marsh = mud/reeds.
  _buildRegionDecals(R) {
    const W = R.widthTiles * TILE, H = R.heightTiles * TILE, m = 2 * TILE;
    const pools = R.pools && R.pools.length ? R.pools : (R.pond ? [R.pond] : []);
    const inWater = (lx, ly) => pools.some((p) => lx >= (p.tx - 0.5) * TILE && lx < (p.tx + p.w + 0.5) * TILE && ly >= (p.ty - 0.5) * TILE && ly < (p.ty + p.h + 0.5) * TILE);
    (R.decalLayers || []).forEach((cfg, i) => {
      if (!cfg) return; let seed = cfg.seed >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      const originY = i === 0 ? 0.5 : 1, depth = DEPTH.FLOOR + 2 + i;
      let placed = 0, tries = 0;
      while (placed < cfg.count && tries < cfg.count * 12) {
        tries++; const lx = Math.floor(rnd() * W), ly = Math.floor(rnd() * H);
        if (lx < m || lx > W - m || ly < m || ly > H - m || inWater(lx, ly)) continue;
        const img = this.add.image(R.origin.x + lx, R.origin.y + ly, cfg.pool[Math.floor(rnd() * cfg.pool.length)]).setOrigin(0.5, originY).setDepth(depth);
        if (R.decalTint != null) img.setTint(R.decalTint);
        placed++; this._regionObjs.push(img);
      }
    });
  }

  // ---- COMBAT region (Marsh): enemy spawns, no-aggro hub, shrine/boss trigger ----
  _buildRegionCombat(R) {
    const c = R.combat;
    for (const en of c.enemies) {
      const [cx, cy] = cidOf(en.tx * TILE, en.ty * TILE);
      if (this.save.isKilled(cx, cy, en.placeId)) continue;          // stays dead (delta)
      const e = this.combat.spawn(en.id, { tx: en.tx, ty: en.ty });
      if (e) e._placeId = en.placeId;
    }
    if (c.safe) this.combat.setSafeZone(c.safe.x, c.safe.y, c.safe.r);
    if (R.shrine) this._buildRegionShrine(R);
  }
  _buildRegionShrine(R) {
    const sh = R.shrine;
    const marker = this.physics.add.sprite(sh.x, sh.y, 'prop_sign').setTint(0x6a8a9a);
    marker.body.enable = false; DepthSort.track(marker, 8); this._regionObjs.push(marker);
    Interaction.register({
      x: sh.x, y: sh.y + 8, prompt: `Enter ${sh.name}`,
      onInteract: () => {
        if (this.quests.status('M9') === 'complete') return this._startGreeting('', ['The shrine is silent now — the Guardian gone, the shard claimed.']);
        if (this.quests.status('M8') !== 'complete') return this._banner('Speak with Elder Yssa, then cross to Hagga (M8) first.');
        this._startQuestDialogue('M9');
      },
    });
  }
  // M9 "Raise the Lantern" at the guardian beat → the real boss fight (lantern strips shroud)
  playerAttackTool() { return this._bossActive ? 'tool_lantern' : null; }
  _combatRegion() { return (this.region?.combat ? this.region : (this._activeRegions || []).find((r) => r.combat)) || null; }
  _startBossFight() {
    this._closeDialogue(); Movement.stop(this.player); this._bossActive = true;
    const bs = this._combatRegion().combat.bossSpawn;
    this.boss = this.combat.spawn('drowned_guardian', { boss: true, tx: bs.tx, ty: bs.ty });
    this.player.x = bs.tx * TILE + TILE / 2; this.player.y = (bs.ty + 4) * TILE + TILE / 2; this.player.body.reset(this.player.x, this.player.y);
    this._banner('THE DROWNED GUARDIAN — your lantern strips its shroud, then strike. At half HP it rampages.', 4500);
  }
  _onBossDefeated() {
    this._bossActive = false; this.boss = null;
    this._banner('The Guardian sinks. Something warm waits in the still water…', 3200);
  }
  _banner(text, ms = 2000) { if (!this.banner) return; this.banner.setText(text).setVisible(true); this.time.delayedCall(ms, () => this.banner && this.banner.setVisible(false)); }

  // ---- PLAYER COMBAT (ported from RegionScene; live only in a non-safe region) ----
  _buildCombatUI() {
    const hpY = 8;
    this.playerHpUI = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 11).setVisible(false);
    const panel = this.add.rectangle(8, hpY + 64, 220, 30, 0x10171a, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a, 0.9).setScrollFactor(0);
    this._hpBarBg = this.add.rectangle(16, hpY + 80, 160, 12, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpBarFill = this.add.rectangle(16, hpY + 80, 160, 12, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this._hpLabel = this.add.text(182, hpY + 73, '', { fontFamily: 'monospace', fontSize: '13px', color: '#cfe8d6' }).setScrollFactor(0);
    this.playerHpUI.add([panel, this._hpBarBg, this._hpBarFill, this._hpLabel]);
    this.banner = this.add.text(this.scale.width / 2, 92, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffe9c2', backgroundColor: '#10171acc', padding: { x: 10, y: 5 }, align: 'center' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 12).setVisible(false);
  }
  _canAct() { return !this._dlg && this._hitFreeze <= 0 && !!this.combat; }
  _playerAttack() {
    if (!this.combat || this.region?.safeZone) return;   // attack allowed in the belt + combat regions; blocked in a safe region
    const now = this.time.now;
    if (now < this._atkReady || this.player.isBusy()) { this._atkBuffered = now + COMBAT.INPUT_BUFFER_MS; return; }
    this._atkBuffered = 0; this._atkReady = now + COMBAT.ATTACK_COOLDOWN_MS;
    this.player.action('attack'); this._sfx('sfx_swing', 0.45);
    const out = this.combat.playerAttack(this.player, COMBAT.ATTACK_DAMAGE, { tool: this.playerAttackTool() });
    for (const r of out) {
      if (r.outcome === 'hit' || r.outcome === 'swarm') {
        this._sfx('sfx_hit', r.killed ? 0.85 : 0.7);
        this._hitFreeze = Math.max(this._hitFreeze, r.killed ? COMBAT.KILL_FREEZE_FRAMES : COMBAT.HIT_FREEZE_FRAMES);
        this.cameras.main.shake(r.killed ? 150 : 110, r.killed ? COMBAT.SHAKE_KILL : COMBAT.SHAKE_HIT);
        if (r.killed && r.e._placeId) { const [cx, cy] = cidOf(r.e.spr.x, r.e.spr.y); this.save.recordKilled(cx, cy, r.e._placeId); }   // stays dead across reload/chunk-cycle
      }
      else if (r.outcome === 'interrupted') { this._sfx('sfx_hit', 0.55); this._banner('Channel interrupted!', 1200); }
      else if (r.outcome === 'guarding') { this._sfx('sfx_swing', 0.3); this._banner('Blocked up front — FLANK it!', 1400); }
      else if (r.outcome === 'recoil') this._banner('It is charged — wait for the window!', 1400);
      if (r.killed && r.e.boss) this._onBossDefeated();
    }
  }
  _tryDodge() {
    const now = this.time.now; let { dx, dy } = this._inputDir;
    if (!dx && !dy) { const f = FACE_VEC[this.player.facing] || FACE_VEC.down; dx = f.x; dy = f.y; }
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
    const cr = this._combatRegion(); const sp = cr ? cr.combat.spawn : { x: this.player.x, y: this.player.y }; this.player.x = sp.x; this.player.y = sp.y; this.player.body.reset(sp.x, sp.y);
    this.combat.enemies.forEach((e) => { e.awake = false; });
    this._bossActive = false; this.boss = null;
    this._banner('You fall — and wake at the edge.');
  }
  _updatePlayerVisual(now) {
    if (!this._blockArcG) return; this._blockArcG.clear();
    let t = null;
    if (this.pc.isBlocking()) { t = 0x66ccff; const f = FACE_VEC[this.player.facing] || FACE_VEC.down, ang = Math.atan2(f.y, f.x); this._blockArcG.lineStyle(7, 0x9fd8ff, 0.95).beginPath().arc(this.player.x + f.x * 20, this.player.y + f.y * 20 - 6, 22, ang - 1.0, ang + 1.0).strokePath(); }
    if (this.pc.isDodgeMoving(now)) { t = 0xeaf6ff; const prog = Math.min(1, Math.max(0, 1 - (this.pc.dodgeMoveUntil - now) / COMBAT.DODGE_DURATION_MS)), dip = Math.sin(prog * Math.PI); this.player.setScale(1 + 0.22 * dip, 1 - 0.5 * dip); }
    else if (this.player.scaleX !== 1 || this.player.scaleY !== 1) this.player.setScale(1, 1);
    if (this._playerFlash > 0) { t = 0xff5555; this._playerFlash--; }
    if (t == null) this.player.list.forEach((s) => s.clearTint && s.clearTint()); else this.player.list.forEach((s) => s.setTint && s.setTint(t));
  }
  _drawCombatUI() {
    // HP now lives in the WORLD HUD stats panel (_updateWorldHud); the separate combat
    // HP bar stays hidden. Kept as a stub so combat code paths that call it don't break.
    if (this.playerHpUI && this.playerHpUI.visible) this.playerHpUI.setVisible(false);
    if (true) return;
    const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
    this._hpBarFill.width = 160 * (hp / max); this._hpBarFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
    this._hpLabel.setText(`HP ${hp}/${max}`);
  }
  _sfx(key, vol = 0.6) { if (this.cache.audio.exists(key)) { const a = bindings.options.audio; this.sound.play(key, { volume: vol * a.master * a.sfx }); } }
  // REGION AMBIENT bed (OGA CC0 loops): birds in the green, wind in the Peaks. Swapped on region
  // change; looped + low. (Music beds layer on top once Van downloads them — leave the hook.)
  _setAmbient(key) {
    if (this._ambKey === key) return; this._ambKey = key;
    if (this._amb) { this._amb.stop(); this._amb.destroy(); this._amb = null; }
    if (!key || !this.cache.audio.exists(key)) return;
    const a = bindings.options.audio;
    this._amb = this.sound.add(key, { loop: true, volume: 0.5 * a.master * a.music });
    this._amb.play();
  }
  // 2D ITEM-GET flourish (the tool/overhead-pickup FALLBACK — no rigged held layer): a glow + the
  // named item floats up above a point, scales up, fades. Pairs with a banner + a confirm sting.
  _itemGetFx(x, y, iconKey = 'ow_orb', tint = 0xffe66d) {
    const glow = this.add.image(x, y - 18, 'ow_orb').setTint(tint).setScale(0.6).setDepth(DEPTH.OVERLAY).setAlpha(0.9);
    const icon = this.cache.obj && this.textures.exists(iconKey) ? this.add.image(x, y - 18, iconKey).setScale(0.5).setDepth(DEPTH.OVERLAY + 1) : null;
    this._sfx('sfx_confirm', 0.8);
    this.tweens.add({ targets: [glow, icon].filter(Boolean), y: y - 46, scale: 1.4, duration: 520, ease: 'Back.out',
      onComplete: () => this.tweens.add({ targets: [glow, icon].filter(Boolean), alpha: 0, duration: 420, delay: 360, onComplete: () => { glow.destroy(); icon && icon.destroy(); } }) });
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
    this._buildPortrait(node.speaker || null);
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
      const t = this.add.text(this._dlgTextX, 372 + i * 18, `${sel ? '▶ ' : '  '}${view.length > 1 ? `${i + 1}. ` : ''}${v.tag}${v.opt.label}`, { fontFamily: 'monospace', fontSize: '13px', color: locked ? '#6b6275' : sel ? '#ffe66d' : v.tag ? '#8fd6ff' : '#cfe8d6' }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 12);
      this.dlgBox.add(t); this._optTexts.push(t);
    });
    this.dlgHint.setText(view.length > 1 ? '↑↓ pick · E confirm' : 'E continue ▸');
  }
  _dlgNav(d) { const view = this._optView || []; if (view.length < 2) return; let i = Phaser.Math.Clamp(this._selOpt + d, 0, view.length - 1); if (view[i] && view[i].st !== 'locked') this._selOpt = i; this._renderOptions(); }
  _dlgConfirm() {
    const view = this._optView || [], v = view[this._selOpt]; if (v && v.st === 'locked') return;
    const wasNode = this._dlg.nodeId, wasQuest = this._activeQuest;
    this._dlg.select(v ? v.idx : this._selOpt); this._selOpt = 0;
    // M9 "Raise the Lantern" at the guardian beat → the real boss fight (mirror MarshScene)
    if (wasQuest === 'M9' && wasNode === 'guardian') { this._startBossFight(); return; }
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue(); else this._renderNode();
  }
  _closeDialogue() {
    if (this._activeQuest && this.quests.status(this._activeQuest) === 'active') this.quests.complete(this._activeQuest);
    this.dlgBox.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
    this._buildPortrait(null);   // clear the speaker face
  }
  _buildDialogueUI() {
    this.dlgBox = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 11).setVisible(false);
    const bg = this.add.rectangle(20, 300, 728, 120, 0x0c1410, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0);
    // PORTRAIT — the speaker's face (built per-speaker from this._faces; ported from RegionScene)
    const PS = 96, px = 28, py = 312;
    this.portraitBox = { x: px, y: py, size: PS }; this._portrait = null; this._portraitSpeaker = null;
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x141a20, 1).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0).setVisible(false);
    const tx0 = px + PS + 16;   // text starts to the right of the portrait
    this._dlgTextX = tx0;
    this.dlgName = this.add.text(tx0, 308, '', { fontFamily: 'monospace', fontSize: '14px', color: '#9fd8a0', fontStyle: 'bold' }).setScrollFactor(0);
    this.dlgBody = this.add.text(tx0, 330, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0', wordWrap: { width: 748 - tx0 - 12 } }).setScrollFactor(0);
    this.dlgHint = this.add.text(620, 308, '', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this.dlgBox.add([bg, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]); this._optTexts = [];
  }
  // Build a face RenderTexture for `name` from its registered parts (idle, down-facing,
  // expression), scaled into the portrait box. Rebuilt only when the speaker changes.
  _buildPortrait(name) {
    if (name === this._portraitSpeaker) return;
    this._portraitSpeaker = name;
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    const face = name ? this._faces[name] : null;
    this.portraitFrame.setVisible(!!face);
    if (!face) return;
    const layers = [];
    for (const pk of face.parts) { const part = PARTS[pk]; if (!part) continue; for (const L of part.layers) { if (L.states && !L.states.includes('idle')) continue; layers.push({ ...L }); } }
    layers.sort((a, b) => a.z - b.z);
    const idleFrame = DIR_ROW.down * ANIMS.idle.frames, exprFrame = EXPR_ROW.down * EXPR_COLS + (EXPRESSIONS[face.expression] ?? 0);
    const cx = 16, cy = 11, cw = 32, ch = 50, rt = this.make.renderTexture({ x: 0, y: 0, width: cw, height: ch }, false);
    for (const L of layers) { if (L.expressive) rt.drawFrame(`${L.tex}__expr`, exprFrame, -cx, -cy); else rt.drawFrame(`${L.tex}__idle`, idleFrame, -cx, -cy); }
    const { x, y, size } = this.portraitBox, scale = Math.min((size - 6) / cw, (size - 6) / ch);
    rt.setOrigin(0.5, 0.5).setPosition(x + size / 2, y + size / 2).setScale(scale).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 11);
    this.dlgBox.add(rt); this._portrait = rt;   // inside dlgBox → inherits its camera visibility
  }
  _buildInput() {
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,O,C');
    this.input.keyboard.on('keydown-E', () => { if (this._dlg) this._dlgConfirm(); else Interaction.tryInteract(); });
    this.input.keyboard.on('keydown-UP', () => { if (this._dlg) this._dlgNav(-1); });
    this.input.keyboard.on('keydown-DOWN', () => { if (this._dlg) this._dlgNav(1); });
    this.input.keyboard.on('keydown-J', () => { if (this._canAct() && !this.region?.safeZone) this._playerAttack(); });    // attack
    this.input.keyboard.on('keydown-SPACE', () => { if (this._canAct()) this._tryDodge(); });                              // dodge-roll
    this.input.keyboard.on('keydown-F5', () => this.saveGame());
    this.input.keyboard.on('keydown-F9', () => this.loadGame());
    // HUD toggles (control SSOT: O map · T quests · H hide HUD · Esc settings)
    this.input.keyboard.on('keydown-O', () => { if (!this._dlg) this._fullMap.setVisible(!this._fullMap.visible); });
    this.input.keyboard.on('keydown-T', () => { if (!this._dlg) this._trkState = (this._trkState + 2) % 3; });   // cycle tracker: full→title→off
    this.input.keyboard.on('keydown-H', () => { if (!this._dlg) { this._hudHidden = !this._hudHidden; this.hud2.setVisible(!this._hudHidden); } });
    this.input.keyboard.on('keydown-ESC', () => this._openSettings());
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
    // GROUND: grass, tinted by the CONTINUOUS green→bog seam gradient (no per-chunk step)
    c.ground.setPosition(ox, oy).setVisible(true).setActive(true).setTint(groundTintAt(ox + CHUNK_PX / 2, oy + CHUNK_PX / 2)).setDepth(DEPTH.FLOOR);
    // suppress belt scatter ONLY under the CURRENTLY-LOADED region (it draws its own);
    // an un-loaded region's footprint keeps belt scatter so the border isn't bare grass.
    const r = regionAt(ox + CHUNK_PX / 2, oy + CHUNK_PX / 2);
    const overRegion = r && (this._activeRegions || []).includes(r);   // suppress under ANY loaded region (both near a border)
    let pi = 0;
    if (!overRegion) for (const p of data.props) {
      let spr = c.props[pi++]; if (!spr) { spr = this.add.sprite(0, 0, p.key).setOrigin(0.5, 0.85); c.props.push(spr); }
      const d = PROPS[p.key] || {};
      spr.setTexture(p.key).setPosition(p.x, p.y).setScale(p.scale || 1).setFlipX(!!p.flip).setVisible(true).setActive(true);
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
    this._unloadAllRegions();
    this._wipe(); this._lastChunk = null; this._restream(true); this._maybeToggleRegion(true);
    this.cameras.main.centerOn(p.x, p.y);
    this._lastLoadMs = performance.now() - t; return true;
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05), now = this.time.now;
    const dlgOpen = !!this._dlg;
    const k = this.keys, run = k.SHIFT.isDown;
    const combatLive = !!this._combatRegion();

    if (this._hitFreeze > 0) { this._hitFreeze--; Movement.stop(this.player); }   // hit-pause (juice)
    else if (dlgOpen) { Movement.stop(this.player); }
    else if (this.auto) { this._autoT += dt; Movement.drive(this.player, Math.cos(this._autoT * 0.5), Math.sin(this._autoT * 1.3), true); }
    else {
      let dx = 0, dy = 0;
      if (k.A.isDown || k.LEFT.isDown) dx -= 1; if (k.D.isDown || k.RIGHT.isDown) dx += 1;
      if (k.W.isDown || k.UP.isDown) dy -= 1; if (k.S.isDown || k.DOWN.isDown) dy += 1;
      this._inputDir = { dx, dy };
      this.pc.setBlocking(now, combatLive && k.C.isDown && !this.player.isBusy());
      if (this.pc.isDodgeMoving(now)) { const v = this.pc.dodgeVelocity(); this.player.body.setVelocity(v.x, v.y); }
      else if (this.pc.isBlocking()) Movement.stop(this.player);
      else if (dx || dy) Movement.drive(this.player, dx, dy, run); else Movement.stop(this.player);
      // flush a BUFFERED attack the instant the swing is ready (crisp combat)
      if (this._atkBuffered && now <= this._atkBuffered && now >= this._atkReady && !this.player.isBusy()) { this._atkBuffered = 0; this._playerAttack(); }
    }

    const [pcx, pcy] = cidOf(this.player.x, this.player.y), pc = `${pcx},${pcy}`;
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); this._maybeToggleRegion(); }
    while (this.loadQueue.length) this._spawn(this.loadQueue.shift());

    if (this.npcLife.has()) this.npcLife.update(dt, dlgOpen);
    if (this.combat) this.combat.update(dt, this.player);   // enemies behave (no-op when none spawned)
    if (this.uiCamera) this._reconcileCameras();   // keep this frame's new streamed/combat objects off the HUD camera (before render)
    Interaction.update(this.player);
    this._updatePlayerVisual(now);
    DepthSort.update();
    this._drawCombatUI();

    this._ring[this._ri] = delta; this._ri = (this._ri + 1) % this._ring.length;
    if (delta > this._maxMs) this._maxMs = delta;
    this._updateWorldHud();
  }

  // ---- WORLD HUD (ported from RegionScene; pinned by zoom-1.0 + scrollFactor 0) ----
  // Stats panel (HP/MP/gold/morality/purity/time) + a WORLD-COORD minimap (regions +
  // player world-pos) + a quest tracker. ⚠ Visual layout UNVERIFIED (browser down).
  _buildWorldHud() {
    const OD = DEPTH.OVERLAY + 10, W = this.scale.width;
    const txt = (x, y, s, size, color, extra = {}) => this.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra }).setResolution(2).setScrollFactor(0).setDepth(OD);
    this.hud2 = this.add.container(0, 0).setScrollFactor(0).setDepth(OD);
    this._hudHidden = false;
    const add = (o) => { this.hud2.add(o); return o; };
    if (this.playerHpUI) this.playerHpUI.setVisible(false);   // HP lives in the stats panel now

    // STATS panel (top-left)
    const sx = 8, sy = 8, sw = 244, sh = 130;
    add(this.add.rectangle(sx, sy, sw, sh, 0x10131c, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a, 0.9).setScrollFactor(0).setDepth(OD));
    add(txt(sx + 10, sy + 7, 'HP', 12, '#9aa3b5'));
    this._sHpBg = add(this.add.rectangle(sx + 42, sy + 14, 152, 11, 0x3a1418, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    this._sHpFill = add(this.add.rectangle(sx + 42, sy + 14, 152, 11, 0x5fcf6a, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    this._sHpTxt = add(txt(sx + 200, sy + 8, '', 11, '#f3ecff'));
    add(txt(sx + 10, sy + 28, 'MP', 12, '#6b6275'));
    add(this.add.rectangle(sx + 42, sy + 35, 152, 11, 0x1c2230, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(OD));
    add(txt(sx + 48, sy + 30, 'reserved (no mana system yet)', 9, '#6b6275'));
    this._sGold = add(txt(sx + 10, sy + 50, '', 13, '#ffe08a'));
    this._sTime = add(txt(sx + 120, sy + 50, '', 13, '#bcd6ff'));
    this._sMor = add(txt(sx + 10, sy + 74, '', 12, '#9fe6a0'));
    this._sPur = add(txt(sx + 10, sy + 94, '', 12, '#c7b6ff'));

    // MINIMAP (top-right) — the WHOLE WORLD, scaled; regions marked + player dot
    const mmW = 168, mmH = Math.round(mmW * WORLD_PX / WORLD_PX), mmx = W - mmW - 10, mmy = 10;
    this._mm = { x: mmx, y: mmy, w: mmW, h: mmH, scale: mmW / WORLD_PX };
    add(this.add.rectangle(mmx - 2, mmy - 2, mmW + 4, mmH + 4, 0x10141c, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a, 0.9).setScrollFactor(0).setDepth(OD));
    this._mmG = add(this.add.graphics().setScrollFactor(0).setDepth(OD));
    this._renderWorldMapInto(this._mmG, this._mm);
    this._mmDots = add(this.add.graphics().setScrollFactor(0).setDepth(OD));
    add(txt(mmx + 4, mmy + 1, 'MAP (O = overview)', 9, '#cfc6e6'));

    // OBJECTIVE ARROW — a directional chevron near the player pointing at the active
    // quest-giver (ported from RegionScene). In hud2 so H hides it with the rest.
    this._objOn = true;
    this._objArrow = add(this.add.graphics().setScrollFactor(0).setDepth(OD + 1));

    // QUEST TRACKER (under the minimap) — T cycles detail: 2 full · 1 title · 0 off
    const ty0 = mmy + mmH + 8;
    this._trkState = 2;
    this._trkPanel = add(this.add.rectangle(mmx - 2, ty0, mmW + 4, 88, 0x10131c, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a, 0.7).setScrollFactor(0).setDepth(OD));
    this._trkHdr = add(txt(mmx + 4, ty0 + 4, 'QUESTS (T)', 11, '#9fe6a0', { fontStyle: 'bold' }));
    this._trkBody = add(txt(mmx + 4, ty0 + 22, '', 11, '#f3ecff', { wordWrap: { width: mmW - 6 }, lineSpacing: 2 }));

    // FULL-MAP overlay (toggle O) — the whole world large
    this._fullMap = add(this.add.container(0, 0).setScrollFactor(0).setDepth(OD + 2).setVisible(false));
    const fw = Math.min(W - 80, 640), fh = Math.round(fw * 1), fx = (W - fw) / 2, fy = (this.scale.height - fh) / 2;
    const fg = this.add.graphics().setScrollFactor(0);
    this._fullMap.add(this.add.rectangle(0, 0, W, this.scale.height, 0x05070b, 0.74).setOrigin(0, 0).setScrollFactor(0));
    this._fullMap.add(this.add.rectangle(fx - 4, fy - 4, fw + 8, fh + 8, 0x10141c, 0.96).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a).setScrollFactor(0));
    this._renderWorldMapInto(fg, { x: fx, y: fy, w: fw, h: fh, scale: fw / WORLD_PX });
    this._fullMap.add(fg);
    this._fmDots = this.add.graphics().setScrollFactor(0); this._fullMap.add(this._fmDots);
    this._fmBox = { x: fx, y: fy, w: fw, h: fh, scale: fw / WORLD_PX };
    this._fullMap.add(this.add.text(fx, fy - 22, 'WORLD MAP (O to close)', { fontFamily: 'monospace', fontSize: '14px', color: '#ffe9c2', fontStyle: 'bold' }).setScrollFactor(0));
  }

  // draw the WORLD (belt + each region's footprint) into a graphics, scaled to a box
  _renderWorldMapInto(g, box) {
    const s = box.scale, ox = box.x, oy = box.y;
    g.fillStyle(0x3f5a34, 1).fillRect(ox, oy, WORLD_PX * s, WORLD_PX * s);   // belt/grass base
    for (const R of REGIONS) {
      const c = R.mapColor || (R.bogTint ? 0x6b724e : 0x4a7a3a);   // Peaks stone / Marsh bog / Greenhollow green
      g.fillStyle(c, 1).fillRect(ox + R.bounds.x * s, oy + R.bounds.y * s, Math.max(2, R.bounds.w * s), Math.max(2, R.bounds.h * s));
    }
  }

  // directional chevron near the player pointing toward the active quest's NPC
  _updateObjective() {
    const g = this._objArrow; if (!g) return; g.clear();
    if (!this._objOn || this._dlg) return;
    let target = null;
    for (const id of Object.keys(this.quests.state || {})) {
      if (this.quests.status(id) !== 'active') continue;
      const npc = this._npcByQuest && this._npcByQuest[id]; if (npc && npc.active !== false) { target = npc; break; }
    }
    if (!target) return;
    const cam = this.cameras.main, z = cam.zoom;
    const psx = (this.player.x - cam.worldView.x) * z, psy = (this.player.y - cam.worldView.y) * z;
    if (Math.hypot(target.x - this.player.x, target.y - this.player.y) < 40) return;   // already there
    const ang = Math.atan2(target.y - this.player.y, target.x - this.player.x), r = 58, t = 12;
    const ax = psx + Math.cos(ang) * r, ay = psy + Math.sin(ang) * r;
    const tip = [ax + Math.cos(ang) * t, ay + Math.sin(ang) * t];
    const pa = ang + Math.PI * 0.8, pb = ang - Math.PI * 0.8;
    g.fillStyle(0xffd23f, 0.95).fillTriangle(tip[0], tip[1], ax + Math.cos(pa) * t, ay + Math.sin(pa) * t, ax + Math.cos(pb) * t, ay + Math.sin(pb) * t);
    g.lineStyle(1.5, 0x4a3a10, 0.9).strokeTriangle(tip[0], tip[1], ax + Math.cos(pa) * t, ay + Math.sin(pa) * t, ax + Math.cos(pb) * t, ay + Math.sin(pb) * t);
  }

  _updateWorldHud() {
    if (!this.hud2 || this._hudHidden) return;
    const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
    this._sHpFill.width = 152 * Math.max(0, hp / max); this._sHpFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
    this._sHpTxt.setText(`${hp}/${max}`);
    this._sGold.setText(`Gold ${this.inv.gold}`);
    const ph = this.tod.phase(), word = ph[0].toUpperCase() + ph.slice(1);
    this._sTime.setText(`${word} D${this.tod.dayCount() + 1}`);
    const ks = this.karma.getStatus();
    this._sMor.setText(`Morality ${ks.morality >= 0 ? '+' : ''}${ks.morality} ${ks.moralityTier}`);
    this._sPur.setText(`Purity ${ks.purity >= 0 ? '+' : ''}${ks.purity} ${ks.purityTier}`);
    // quest tracker: T cycles 2 full (title + step) · 1 title-only · 0 off
    const show = this._trkState > 0;
    this._trkPanel.setVisible(show); this._trkHdr.setVisible(show); this._trkBody.setVisible(show);
    if (show) {
      const active = Object.keys(this.quests.state || {}).filter((id) => this.quests.status(id) === 'active').slice(0, 3);
      if (!active.length) { this._trkBody.setText('(no active quest — talk to someone with a task)'); this._trkPanel.height = 56; }
      else {
        const lines = [];
        for (const id of active) {
          const def = this.quests.defs[id];
          lines.push(`> ${def?.title || id}`);
          if (this._trkState === 2) { const step = (def?.steps || [])[this.quests.step?.[id]]; if (step) lines.push(`   ${step.desc}`); }
        }
        this._trkBody.setText(lines.join('\n')); this._trkPanel.height = 26 + lines.length * 16;
      }
    }
    // player dot on the minimap (+ full map if open)
    this._mmDots.clear().fillStyle(0xffe66d, 1).fillCircle(this._mm.x + this.player.x * this._mm.scale, this._mm.y + this.player.y * this._mm.scale, 3);
    if (this._fullMap.visible) this._fmDots.clear().fillStyle(0xffe66d, 1).fillCircle(this._fmBox.x + this.player.x * this._fmBox.scale, this._fmBox.y + this.player.y * this._fmBox.scale, 4);
    this._updateObjective();
  }

  // ---- UI CAMERA (HUD on its own zoom-1 camera; world on the 1.25 main camera) ----
  // Phaser cameras render everything NOT in their ignore list. So: the main camera
  // ignores the UI set; the uiCamera ignores every WORLD object. Because the world
  // STREAMS (chunks + region loads + combat VFX create objects continuously), we can't
  // enumerate the world once — _reconcileCameras re-ignores all non-UI children, and is
  // called after every streaming/region/combat creation + once per frame as insurance.
  _setupUICamera() {
    this._uiList = [this.hud2, this.dlgBox, this.playerHpUI, this.banner, this._helpText].filter(Boolean);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.setScroll(0, 0);
    this.cameras.main.ignore(this._uiList);   // world camera never draws the HUD
    this.scale.on('resize', (sz) => { if (this.uiCamera) this.uiCamera.setSize(sz.width, sz.height); });
  }
  _mainOnly() { const ui = this._uiList || []; return this.children.list.filter((o) => !ui.includes(o)); }
  _reconcileCameras() { if (this.uiCamera) this.uiCamera.ignore(this._mainOnly()); }   // keep streamed world objects off the HUD camera

  _openSettings() {
    if (this._dlg) return;
    this.scene.launch('Options', { caller: 'Overworld', mods: this.mods, im: null });
    this.scene.pause();
  }
}
