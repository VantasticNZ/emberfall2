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
import { CardSequence } from '../systems/CardSequence.js';
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
import { ITEM_ICONS } from './BootScene.js';   // item ids with an eliza-objects icon (buy/sell + inventory pictures)
const ITEM_ICON_SET = new Set(ITEM_ICONS);
const itemIconKey = (id) => (ITEM_ICON_SET.has(id) ? `icon_${id}` : null);   // texture key or null (name fallback)
import { buildingDoorTrigger } from '../systems/doorTrigger.js';
import { stageAt, travelProgress } from '../systems/repairPacing.js';
import { stepObjective, objectiveSatisfied, objectiveArrowTarget } from '../systems/questObjective.js';
import { searchContainer, cutObject, pushBlock, grantLoot, enterGate } from '../systems/Interactables.js';
import { ixClass, isSolid } from '../data/interactionClasses.js';
import { Dialogue } from '../systems/Dialogue.js';
import { Social } from '../systems/Social.js';
import { EnemyController } from '../systems/EnemyController.js';
import { PlayerCombat } from '../systems/Combat.js';
import { ModifierRegistry } from '../systems/Modifiers.js';
import { COMBAT, INTERACTION_RADIUS, GUARD_HEARING, GUARD, REPAIR, DOOR } from '../constants/standards.js';
import { DAY_LENGTH, RATE } from '../data/time.js';
import { bindings } from '../constants/controls.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { PROPS, PARTS, DIR_ROW, ANIMS, EXPRESSIONS, EXPR_COLS, EXPR_ROW, solidBox } from '../data/assets.js';
import { TERRAIN } from '../data/terrainTiles.js';
import { GREENHOLLOW_CHILDHOOD, GREENHOLLOW_SLICE, GREENHOLLOW_SIDE, ASHEN_MARSH, SUNDERED_PEAKS as PEAKS_QUESTS, SUNDERED_PEAKS_SIDE } from '../data/quests/index.js';
import { TILE, CHUNK_PX, WORLD_CHUNKS, WORLD_PX, chunkContent, groundTintAt, GREENHOLLOW, ASHEN_MARSH as MARSH_REGION, REGIONS, regionAt, inGreenhollow, inMarsh } from '../data/worldmap.js';
import { item as itemDef } from '../data/items/index.js';
import { shop as shopDef, buyPrice, sellPrice, availableStock } from '../systems/Economy.js';
import { ShopStock } from '../systems/ShopStock.js';
import { ENTRANCES } from '../data/entrances.js';
import { generateDungeon, generateCave } from '../data/gen/index.js';

const FACE_VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const ITEM_ROWS = 9;   // visible item rows in the Items tab (the last rows of the 11-row pool host the action list)

const LOAD_RING = 2, UNLOAD_RING = 3;
const WORLD_ZOOM = 1.25;          // the open-world camera zoom
const INTERIOR_ZOOM_MAX = 2.0;    // interior closeness is a CONSISTENT 2x (Van's call): zoom toward the room but
                                  // cap at 2x. Small rooms are then centred+clamped (whole room in view, nothing
                                  // cut off); a dark surround is accepted in trade for the steady, readable zoom.
const CUT_REGROW_MS = 180000;   // a cut bush regrows only after you LEAVE the area + ~3 min (anti-farm)
// HUD SAFE-AREA LAYOUT LAW (systemic, not one-off) — the screen-space HUD lives in fixed bands: the stats panel
// top-left + minimap/quests top-right (TOP band, RIGHT margin) and the controls help bar at the very BOTTOM.
// Interiors INSET the world viewport into the area these bands leave free, so the HUD never overlaps the room
// (the room frames inside; the dark border carries the HUD). The layout gate asserts these bands stay clear.
const HUD_SAFE = { top: 138, right: 198, bottom: 30 };
const HERO = ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_blue', 'pants_black', 'shoes_brown'];
// The protagonist as a CHILD — fully-clothed child body (shirt+pants+shoes), child head (face baked, no adult
// brows), and SEATED child hair (oy-offset so it sits on the smaller child skull). L1: complete, matched.
const HERO_CHILD = ['child_body_blue', 'child_head', 'child_hair_natural'];
// S2: the child appearance the player picked at the title's character-select. Stored as the FULL parts list
// pipe-joined (e.g. "child_body_blue|child_head|child_hair_natural"), so monster/accessory presets carry their
// own head + hair. Falls back to the default child set. Always a COMPLETE matched child set (L1).
function heroChild(store) {
  try {
    const raw = (store && store.read('ember:childPreset')) || '';
    const parts = raw.split('|').filter(Boolean);
    if (parts.length) return parts;
  } catch (_) {}
  return HERO_CHILD;
}
const CHILD_WAKE = { ...GREENHOLLOW.player };   // where a fresh child wakes — set to Mara's cottage interior in sys 2
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
    this.shopStock = new ShopStock();   // shops-v2: limited/replenishing per-item quantities (persisted)
    this.save = new SaveManager({ slot: 'overworld', storage: defaultStorage() })
      .link('karma', this.karma).link('inv', this.inv).link('quests', this.quests).link('time', this.tod)
      .link('shopstock', this.shopStock);
    const hadSave = this.save.load();
    // WORLD-VERSION guard: a save from an OLD world layout has a stale position → spawn at Greenhollow
    // (its progress is kept; only the coords are reset). Prevents loading into a void / old-world spot.
    // AGE-STATE (sys 1) — child vs adult is DERIVED from the `time_skip` deed (recorded at the end of M6),
    // so it persists with the save automatically. A FRESH game (no time_skip) boots a CHILD; after the
    // childhood arc burns + the time-skip, the same save reads ADULT. Gates quests/items/doors/combat below.
    this.isChild = !this.karma.hasDeed('time_skip');
    // TRANSITION (sys 4) — when M6 records `time_skip` (the village burns, the child flees), the childhood ENDS:
    // a held "Ten winters gone" beat, then the child becomes the adult and returns to a changed Greenhollow.
    this.karma.onDeed((id) => { if (id === 'time_skip' && this.isChild && !this._timeSkipping) this._doTimeSkip(); });
    // SPAWN: a fresh CHILD wakes in Mara's cottage (sys 2); an adult / a save with a position uses it.
    const childSpawn = CHILD_WAKE;   // Mara's cottage interior spawn (sys 2)
    const start = (hadSave && !this.save.worldReset) ? this.save.getPosition()
      : (this.isChild ? { x: childSpawn.x, y: childSpawn.y } : { ...GREENHOLLOW.player });
    if (this.save.worldReset) this._worldResetNotice = true;
    if (!hadSave && this.isChild) { this._bootChild = true; }   // a fresh child game → load the cottage interior on create

    const childParts = this.isChild ? heroChild(defaultStorage()) : HERO;
    this.player = new Character(this, start.x, start.y, { parts: childParts, facing: 'down', speed: this.isChild ? 130 : 150 });
    this.player.isAdult = !this.isChild; this.player.isMinor = this.isChild;
    if (!this.isChild) this.player.equip('sword');   // a CHILD carries no weapon (age-gate); the adult swings a visible sword
    // y-sort the hero by its FEET LINE (the collision base = body bottom), so it sorts against
    // buildings/rocks/trees by where it meets the ground — the SAME anchor the pixel-truth collider
    // uses. (Was 18 = ~12px above the feet → the hero drew UNDER a building it stood in FRONT of.)
    this.add.existing(this.player); DepthSort.track(this.player, this.player.body.offset.y + this.player.body.height);
    this._scaleHead(this.player);   // BIG-HEAD modifier (item 1) applies to the hero too
    this.physics.add.collider(this.player, this.solids);
    // NPC SOLIDITY (town-feel item 1) — the player collides with townsfolk (no walk-through) and NPCs
    // separate from each other (no stacking). Dynamic bodies kept NON-pushable so a bump never shoves them
    // across the plaza; ghost:true NPCs stay exempt (out of the group). No pathfinding — Arcade overlap
    // resolution is the whole mechanism (conservative). The group's membership updates as regions stream.
    this.npcSolids = this.physics.add.group();
    this.physics.add.collider(this.player, this.npcSolids);
    this.physics.add.collider(this.npcSolids, this.npcSolids);
    this.combat = new EnemyController(this, { solids: this.solids, onPlayerHit: (dmg, info) => this._onPlayerHit(dmg, info), onPlayerRecoil: (dmg) => this._onPlayerRecoil(dmg) });
    this._buildCombatUI();
    this._blockArcG = this.add.graphics().setDepth(DEPTH.OVERLAY);

    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);
    // CLOSER 1.25 WORLD ZOOM (matches the discrete RegionScene). The HUD can't ride the
    // main camera at >1.0 (scrollFactor-0 objects get zoom-scaled about the camera midpoint
    // = the old "moving funny" drift), so a dedicated uiCamera at zoom 1 renders the HUD and
    // the main camera ignores it (see _setupUICamera). _reconcileCameras keeps every STREAMED
    // world object off the uiCamera so nothing leaks over the HUD.
    this.cameras.main.setZoom(WORLD_ZOOM);   // closer world zoom; the HUD rides a separate zoom-1 uiCamera (see _setupUICamera)
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);
    this.cameras.main.setDeadzone(160, 110);

    this.region = null;           // PRIMARY region (player's current), or null = belt
    this._activeRegions = [];     // ALL loaded regions near the player (both-regions border loader)
    this._dlg = null; this._selOpt = 0; this._activeQuest = null;
    this._buildDialogueUI();
    this._buildInput();

    this.auto = false; this._autoT = 0; this._lastSaveMs = 0; this._lastLoadMs = 0; this._resetPerf();
    this._buildWorldHud();
    this._helpText = this.add.text(8, this.scale.height - 18, 'WASD move · SHIFT run · E talk · J attack · Space dodge · C block · M map · T quests · H hide HUD · B/Q close · Esc menu · F5/F9 save/load · F8 fresh game', { fontFamily: 'monospace', fontSize: '10px', color: '#9fb89a', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);   // ALWAYS at the very bottom (anchored to viewport height; reflowed on resize) — never mid-screen

    this._restream(true);
    this._maybeToggleRegion(true);
    this._setupUICamera();   // isolate the HUD onto its own zoom-1 camera so the world can zoom past 1.0
    this._reconcileCameras();
    // SAVE-LOAD INTO AN INTERIOR — a save made inside a building loads the player at an interior position;
    // flag _inInterior so the room isolates + apply the enclosed view + camera clamp (else other rooms leak
    // into the black AND the camera shows void past the walls). The _bootChild path enters via _enterArea below.
    if (!this._bootChild && this.region && this.region.interior) {
      this._inInterior = true;
      this._maybeToggleRegion(true);   // re-run so interior isolation restricts to this one room
      this._setInteriorView(true);
    }
    // CHILDHOOD OPENING (sys 2) — a fresh CHILD game WAKES inside Mara's cottage; the door steps out to GH.
    if (this._bootChild) this.time.delayedCall(120, () => {
      // L3 — enter the cottage FROM its building door tile, so stepping back OUT lands at the cottage exterior
      // (not the boot spawn). The door system carved the threshold; stand the return there.
      const d = (this._buildingDoors || []).find((x) => x.to === 'mara_cottage');
      const ret = d ? { x: d.tx * TILE + TILE / 2, y: (d.ty + 1) * TILE + TILE / 2 } : null;   // the walkable yard tile below the door
      if (ret) { this.player.x = ret.x; this.player.y = ret.y; this.player.body.reset(ret.x, ret.y); }
      this._enterArea('mara_cottage', ret); this._objOn = true;
      // L4 — the cottage door stays shut until you've spoken with Mara (M1 engaged: no longer just 'available').
      this._exitBlock = { region: 'mara_cottage', msg: 'Mara is calling you — see what she wants first.', done: () => this.quests.status('M1') !== 'available' };
    });
    this.perf = () => ({ fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), loaded: this.chunks.size, region: this.region ? this.region.key : null, npcs: this.npcLife.movers.length, saveMs: +this._lastSaveMs.toFixed(2), loadMs: +this._lastLoadMs.toFixed(2), pos: { x: this.player.x | 0, y: this.player.y | 0 }, gold: this.inv.gold });
  }

  // ---- systems (the real, region-agnostic engines; composed once) ------------
  _buildSystems() {
    const storage = memoryStorage();   // per-session; the SaveManager owns durable composition via link()
    this.karma = new KarmaEngine({ storage });
    this.quests = new QuestEngine({ karma: this.karma, storage, quests: [...GREENHOLLOW_CHILDHOOD, ...GREENHOLLOW_SLICE, ...GREENHOLLOW_SIDE, ...ASHEN_MARSH, ...PEAKS_QUESTS, ...SUNDERED_PEAKS_SIDE] });
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
    let inRange = REGIONS.filter((R) => {
      const b = R.bounds;
      const cx = Math.max(b.x, Math.min(this.player.x, b.x + b.w)), cy = Math.max(b.y, Math.min(this.player.y, b.y + b.h));
      return Math.hypot(this.player.x - cx, this.player.y - cy) < CHUNK_PX;
    });
    // INTERIOR ISOLATION — inside a building, render ONLY the active interior (its bounds). The interiors
    // share a far-band, so proximity would stream several at once → you'd SEE other rooms in the black.
    if (this._inInterior) {
      const here = REGIONS.find((R) => R.interior && this.player.x >= R.bounds.x && this.player.x < R.bounds.x + R.bounds.w && this.player.y >= R.bounds.y && this.player.y < R.bounds.y + R.bounds.h);
      inRange = here ? [here] : inRange.filter((R) => R.interior);
    }
    const cur = this._activeRegions || [];
    const same = inRange.length === cur.length && inRange.every((R) => cur.includes(R));
    if (!same) { this._unloadAllRegions(); this._loadRegions(inRange); this._wipe(); this._restream(true); }
    this.region = regionAt(this.player.x, this.player.y);   // primary (or null = belt) — refresh each call
    this._setAmbient((this.region?.mountain || this.region?.bog) ? 'amb_wind' : 'amb_birds');   // Peaks/Marsh = a desolate wind (no birds in the bog); green = birds
    this._setMusic(this._musicForRegion(this.region));                    // region music bed (crossfade), layered over ambient
    if (this._worldResetNotice) this.time.delayedCall(600, () => this._banner('The world changed since your last save — returned to Greenhollow (your progress is kept).', 3400));
  }

  _loadRegions(list) {
    this._activeRegions = list.slice();
    this._regionObjs = []; this._chestSprites = []; this._npcByQuest = {}; this._cuttables = [];
    this._cutBushes ||= new Map();   // PERSISTS across region (re)loads: bush world-tile id → cut timestamp (anti-farm)
    this._buildingDoors = [];        // DOOR-SYSTEM: walk-into-the-doorway triggers generated from buildings with `door`
    Interaction.reset();
    this.npcLife = new NpcLife(this);
    for (const R of list) this._buildRegion(R);
    this.npcLife.setPhase(this.tod.phase());
    // one day-phase in real ms (4 phases per day) — the joiner works the door for this long (or until a phase
    // change, if the day cycle is running). A forced door is mended across a day-phase, not a fixed 5s timer.
    this._phaseMs = (DAY_LENGTH / RATE / 4) * 1000;
    if (!this._todWired) { this._todWired = true; this.tod.onPhaseChange((p) => { this.npcLife.setPhase(p); this._repairOnPhaseChange(); }); }
    this.region = regionAt(this.player.x, this.player.y);
  }

  // build ONE region's content into the SHARED state (objs / npcLife / combat).
  _buildRegion(R) {
    if (R.key === 'Greenhollow') this._buildChapelFlame(R);   // fire-responds-to-purity (LORE-CANON §5) — the chapel ward's flame reads the heart
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
      const spr = this.add.sprite(p.x, p.y, p.key).setOrigin(0.5, p.oy != null ? p.oy : 0.5);   // pure VISUAL (no physics body); oy=1 base-anchors interior furniture (sits ON its tile, grows UP — no wall-clip)
      if (p.scale != null) spr.setScale(p.scale);
      if (p.flip) spr.setFlipX(true);
      if (p.tint != null) spr.setTint(p.tint);
      // SOLID props get a STATIC collider RECT derived by THE ONE RULE (solidBox) — consistent
      // for every house/rock/tree, no per-object tuning. Static body (the cliff-wall pattern that
      // provably blocks; a dynamic body in the STATIC solids group never enters the collision tree).
      const sc = (p.scale != null ? p.scale : 1);
      const b = solidBox(p.key, d);
      const offX = (p.flip ? -b.offX : b.offX);   // mirror the collider with the sprite's flipX (off-centre silhouettes, e.g. tree trunks)
      // SOLIDITY from the INTERACTION-CLASS (SSOT) — consistent per asset type in every region
      // (bushes honour their placement's small-vs-big flag; everything else = its class).
      let rect = null;
      if (isSolid(p.key, p.solid)) {
        const cw = Math.max(8, b.w * sc), ch = Math.max(8, b.h * sc), ccx = p.x + offX * sc, ccy = p.y + b.offY * sc;
        const bdoor = this._resolveBuildingDoor(p);
        if (bdoor) {
          // DOOR-SYSTEM — ASSET-OWNED DOORWAY, MEASURED FROM THE ART: `doorway:{cx,cy,w,h}` is the painted
          // opening's centre + size (local px). The door sprite is PLACED at that rect and SIZED to it, so it
          // sits IN the painted doorway and fits it. The TRIGGER tile sits at the door column on the building's
          // FEET line — so the avatar standing there sorts IN FRONT of the door (depth = feet + playerBase >
          // feet + 1 = the door). The base-band is split tile-aligned around the door column (walkable gap).
          const dw = (d.doorway && d.doorway.cx != null) ? d.doorway : { cx: 0, cy: 0, w: 28, h: 44 };
          const doorWX = p.x + dw.cx * sc, doorWY = p.y + dw.cy * sc;       // painted-door centre (world)
          const feetY = spr.y + (b.offY + b.h / 2) * sc;                    // = the building's DepthSort depth (feet line)
          const dCol = Math.round((doorWX - TILE / 2) / TILE), dRow = Math.round((feetY - TILE / 2) / TILE);
          const bandL = ccx - cw / 2, bandR = ccx + cw / 2;
          const mkSolid = (x0, x1) => { if (x1 - x0 < 4) return; const r = this.add.rectangle((x0 + x1) / 2, ccy, x1 - x0, ch, 0x000000, 0).setVisible(false); this.physics.add.existing(r, true); this.solids.add(r); this._regionObjs.push(r); };
          mkSolid(bandL, dCol * TILE); mkSolid((dCol + 1) * TILE, bandR);   // tile-aligned solids flanking the door column
          // SEAL the door column ABOVE the doorway tile — the column was open the FULL building height, so you
          // walked straight UP THROUGH the building and out the back (the entry-latency bug). Now only the
          // doorway tile (dRow) is walkable: you step ONTO it (trigger fires) but can't cross the footprint.
          { const sealTop = ccy - ch / 2, sealBot = dRow * TILE; if (sealBot - sealTop > 4) { const sr = this.add.rectangle(dCol * TILE + TILE / 2, (sealTop + sealBot) / 2, TILE, sealBot - sealTop, 0x000000, 0).setVisible(false); this.physics.add.existing(sr, true); this.solids.add(sr); this._regionObjs.push(sr); } }
          const dcx = dCol * TILE + TILE / 2, dcy = dRow * TILE + TILE / 2;
          // THE MIX + BROKEN persistence: open/none → dark threshold only (always-open); closed/locked → a
          // door sprite (the building's `doorArt`); a door BROKEN earlier (saved) stays broken on re-entry.
          const [bcx, bcy] = cidOf(doorWX, doorWY);
          const effState = this.save.getChunkFlag(bcx, bcy, 'door_broken_' + bdoor.to) ? 'broken' : bdoor.state;
          const vis = this._buildDoorVisual(doorWX, doorWY, dw.w * sc, dw.h * sc, effState, feetY + 1, d.doorArt);
          const builtDoor = { tx: dCol, ty: dRow, dcx, dcy, doorWX, doorWY, ...bdoor, state: effState, opening: vis.opening, doorSpr: vis.doorSpr, lockSpr: vis.lockSpr };
          this._buildingDoors.push(builtDoor);
          // DOOR ENTRY — two consistent affordances, both at the SAME standard reach (INTERACTION_RADIUS, the one
          // talk/interact distance): (1) walk onto the doorway tile facing it (genre walk-in, in _checkDoorWalk);
          // (2) press E at the door (immediate, ignored from afar). An OPEN door enters straight away; a CLOSED/
          // LOCKED one opens the knock/try/break choice. Standing far = neither fires (the radius is one tile).
          if (effState === 'closed' || effState === 'locked') {
            Interaction.register({ x: dcx, y: dcy, prompt: 'Knock', onInteract: () => { if (!this._dlg && !this._areaT) this._openDoorChoice(builtDoor); } });
          } else {
            Interaction.register({ x: dcx, y: dcy, prompt: bdoor.to ? `Enter${bdoor.owner ? " " + bdoor.owner + "'s" : ''}` : 'Enter', onInteract: () => { if (!this._dlg && !this._areaT) { this._openDoorVisual(builtDoor); this._enterArea(builtDoor.to, { x: dcx, y: dcy + TILE }); } } });
          }
        } else if (isSolid(p.key, p.solid)) {
          rect = this.add.rectangle(ccx, ccy, cw, ch, 0x000000, 0).setVisible(false);
          this.physics.add.existing(rect, true); this.solids.add(rect); this._regionObjs.push(rect);
        }
        spr.setData('solidKey', p.key);   // pixel-truth test hook: marks this sprite as a tested solid
      }
      // HANGING PURPOSE SIGN — the building ASSET names WHERE it hangs (`signAnchor`, local px from the
      // sprite centre); the placement names WHICH sign (`sign`). Mounted on the front wall, depth just in
      // front of the building so the player (lower on screen) sorts IN FRONT when walking past.
      if (p.sign && d.signAnchor && PROPS[p.sign]) {
        const sa = d.signAnchor, sgn = this.add.sprite(p.x + sa.cx * sc, p.y + sa.cy * sc, p.sign);
        sgn.setDepth(spr.y + (b.offY + b.h / 2) * sc + 1); this._regionObjs.push(sgn);
      }
      // CUTTABLE from the class — every cuttable asset is cut by the sword swing in EVERY region
      // (the "cut works in GH not Peaks" fix). Tracked here; the swing tests this list (_cutSwing).
      const ic = ixClass(p.key);
      if (ic.cuttable) {
        // ANTI-FARM: a bush cut THIS area-visit stays cut; it only regrows after you LEAVE + a cooldown
        // passes (checked here on area re-entry). Keyed by world-tile so it's stable across reloads.
        const bushId = `${Math.round(p.x / TILE)},${Math.round(p.y / TILE)}`, cutAt = this._cutBushes.get(bushId);
        if (cutAt != null && (this.time.now - cutAt) < CUT_REGROW_MS) {   // still on cooldown → spawn ALREADY-CUT (hidden, no collider, not cuttable)
          spr.setVisible(false); if (rect) { rect.body.enable = false; this.solids.remove(rect); }
        } else {
          if (cutAt != null) this._cutBushes.delete(bushId);   // cooldown elapsed → it has regrown
          this._cuttables.push({ spr, rect, key: p.key, loot: ic.loot, bushId });
        }
      }
      // READABLE (signs/notice boards/waystones) — press-E to read the placement's `text`. Consistent
      // in every region; no more walk-through-can't-read white squares.
      if (ic.readable && p.text) Interaction.register({ x: p.x, y: p.y + 8, prompt: 'Read the sign', onInteract: () => this._startGreeting('', Array.isArray(p.text) ? p.text : [p.text]) });
      DepthSort.trackProp(spr, b);   // y-sort by the FEET (opaque base) — the one game-wide rule
      this._regionObjs.push(spr);
    }
    this._clearDoorwayThresholds();   // UNIFORM: guarantee every building's doorway tile is walkable (clear any scattered rock/prop that landed on a threshold) — no building un-enterable due to placement
    for (const n of R.npcs) this._buildRegionNpc(n);
    for (const c of (R.chests || [])) this._buildRegionChest(c);
    for (const o of (R.interactables || [])) this._buildInteractable(o);   // cut / push / search (INTERACTABLES-DESIGN)
    // COMBAT — a non-safe region (Marsh/Peaks) spawns its enemies + hub; a safe region
    // (Greenhollow/Belt/Foothill) spawns none. With several loaded, only the combat
    // region's enemies exist (in their own bounds).
    if (R.combat && R.combat.enabled && !R.safeZone) this._buildRegionCombat(R);
    // ENTRY GATE (Foothill→Peaks: a rockfall keyed to shard_1, per gating.js).
    if (R.gate) this._buildRegionGate(R);
    // GREYBOX GRANT — a placeholder dungeon/boss reward that records its tools/shards so the
    // gate-chain stays walkable end-to-end on the WORLD-SKELETON (replaced by the real dungeon later).
    if (R.grant) this._buildRegionGrant(R);
    // PEAKS set-pieces: Cinder Keep (the grapple + shard_2 grant point) + the records.
    if (R.keep) this._buildPeaksKeep(R);
    if (R.records) this._buildPeaksRecords(R);
    if (R.m2) this._buildM2(R);   // M2 "Chores + Mischief": the physical coop / egg-nest / saplings / Henrietta
    if (R.key === 'Greenhollow' && this.isChild) this._buildChildhoodSpine(R);   // M4/M5 start triggers (the playable childhood spine)
  }

  // CHILDHOOD SPINE (M4-M7) — the connective tissue so the arc plays end-to-end. M4-M7 are authored dialogue
  // beats with no overworld start; here we give the early ones a DISCOVERABLE physical trigger (per L-laws), and
  // the later ones chain automatically (the festival → that night's burning → the ten-winter skip → adult). The
  // dialogue → _closeDialogue path auto-completes each beat + unlocks the next, so a START is all each needs.
  _buildChildhoodSpine(R) {
    const O = R.origin, T = TILE;
    this._childSites = {
      M4: { x: O.x + 37 * T + T / 2, y: O.y + 4 * T + T / 2 + 10 },    // the boarded cave-mouth at the north meadow edge (rendered marker)
      M5: { x: O.x + 20 * T + T / 2, y: O.y + 14 * T + T / 2 + 12 },   // the plaza well — the Hearthflame Festival gathering
    };
    // M4 starts by WALKING to the boarded cave-mouth (the rendered cave entrance) — intercepted in _checkDoorWalk
    // so a child gets the M4 beat (the loose-plank peek) instead of entering the empty adult cave. M5 is a
    // press-E at the plaza well (the festival gathering). The arrow (forced for the child) points at _childSites.
    Interaction.register({ x: this._childSites.M5.x, y: this._childSites.M5.y, prompt: 'Help with the Hearthflame Festival', onInteract: () => this._childStart('M5') });
  }
  // Start a childhood beat from its physical trigger (or a flavour line if it's not its turn yet / already done).
  _childStart(qid) {
    if (this._dlg) return;
    const st = this.quests.status(qid);
    if (st === 'available' || st === 'active') this._startQuestDialogue(qid);
    else if (st === 'complete') this._startGreeting('', [qid === 'M4' ? 'The cold weeping-flame carving is just as you left it.' : 'The festival fire is banked low now; the night feels wrong.']);
    else this._startGreeting('', ['(There are chores to finish before this.)']);   // locked behind the prior beat
  }
  // After a childhood beat completes, fire the next NON-physical link: the festival's wrong night → the burning
  // (M6, the catastrophe — no "go-to" trigger; it comes to you). M6 then records time_skip → _doTimeSkip → adult.
  _onChildQuestComplete(qid) {
    if (!this.isChild) return;
    if (qid === 'M5' && this.quests.status('M6') === 'available') {
      this.time.delayedCall(1100, () => { if (this.isChild && this.quests.status('M6') === 'available' && !this._dlg) this._startQuestDialogue('M6'); });
    }
  }

  // ---- M2 "Chores + Mischief" — the PHYSICAL go-and-do (no narrated advance) ------------------------------
  // Places the egg-nest + saplings interactables and SPAWNS Henrietta (child-only ambient hen). Each chore
  // ADVANCES M2 only on a real interact at the real site; the hen step is a genuine CHASE + CATCH. Sites come
  // from WORLD.m2 (local tiles), offset by the region origin → the quest data stays region-agnostic.
  _buildM2(R) {
    const m2 = R.m2; if (!m2) return;
    const ox = R.origin.x, oy = R.origin.y, c = (s) => ({ x: ox + s.tx * TILE + TILE / 2, y: oy + s.ty * TILE + TILE / 2 });
    this._m2Sites = { eggs: c(m2.eggs), water: c(m2.water), pen: c(m2.pen), henHome: c(m2.henHome),
      roam: { x0: ox + m2.roam.x0 * TILE, y0: oy + m2.roam.y0 * TILE, x1: ox + m2.roam.x1 * TILE, y1: oy + m2.roam.y1 * TILE } };
    // INTERACTION-VERB SYSTEM (item 3): the chores resolve to real VERBS, not text steps. The action button's
    // prompt names the verb. COLLECT eggs (physical ground objects you pick up). WATER. PICK UP Henrietta.
    // EGGS — physical collectable objects at the coop nest (COLLECT verb), present while the eggs chore is current.
    this._eggs = [];
    const eggsStep = this.isChild && this.quests.status('M2') === 'active' && this.quests.defs.M2.steps[this.quests.step.M2]?.id === 'eggs';
    if (eggsStep) {
      const nest = this._m2Sites.eggs;
      for (let i = 0; i < 3; i++) { const e = this.add.image(nest.x + (i - 1) * 9, nest.y + (i % 2) * 5 - 2, 'egg').setScale(0.62).setDepth(DEPTH.FLOOR + 4); DepthSort.trackProp(e, { offX: 0, offY: 4, w: 9, h: 7 }); this._regionObjs.push(e); this._eggs.push(e); }
    }
    Interaction.register({ x: this._m2Sites.eggs.x, y: this._m2Sites.eggs.y + 4, prompt: 'Collect the eggs', onInteract: () => this._m2Chore('eggs') });
    Interaction.register({ x: this._m2Sites.water.x, y: this._m2Sites.water.y + 4, prompt: 'Water the saplings', onInteract: () => this._m2Chore('water') });
    // Henrietta — child-only. Spawns at her roost; flees once the chase begins; PICKED UP + carried on the catch.
    if (this.isChild) {
      const chosen = this.quests.chosenOn('M2'), done = this.quests.status('M2') === 'complete';
      const home = this._m2Sites.henHome, hen = this.add.sprite(home.x, home.y, 'hen').setScale(0.85).setTint(0xb9824a);   // brown hen (sheet is white)
      DepthSort.trackProp(hen, { offX: 0, offY: 6, w: 14, h: 12 });   // sort by the hen's feet (the game-wide rule)
      this._regionObjs.push(hen); this._hen = hen;
      if (done && (chosen === 'kick' || chosen === 'free')) { hen.setVisible(false); this._henState = 'settled'; }
      else {
        const stepId = this.quests.status('M2') === 'active' ? this.quests.defs.M2.steps[this.quests.step.M2]?.id : null;
        this._henState = stepId === 'hen' ? 'flee' : 'idle';
        hen.play(this._henState === 'flee' ? 'hen_down' : 'hen_peck');
      }
      Interaction.register({ target: hen, targetOffY: -4, prompt: 'Pick up Henrietta', onInteract: () => this._henCatch() });
    }
  }

  // a chore interact — advances M2 ONLY when it's that chore's step (the doing, in the world).
  _m2Chore(which) {
    if (this._dlg) return;
    const active = this.quests.status('M2') === 'active';
    const stepId = active ? this.quests.defs.M2.steps[this.quests.step.M2]?.id : null;
    if (which === 'eggs' && stepId === 'eggs') {
      // COLLECT verb — pick up each physical egg object (remove its sprite with a pop), then advance.
      for (const e of (this._eggs || [])) { if (e && e.active) { this._itemGetFx(e.x, e.y - 4, 'egg', 0xffffff); DepthSort.untrack(e); e.destroy(); } }
      this._eggs = [];
      this.quests.advance('M2'); this._sfx('sfx_pickup', 0.8);
      this._banner('Eggs collected. Now water the orchard saplings.', 2200); this._refreshTracker && this._refreshTracker();
    } else if (which === 'water' && stepId === 'water') {
      this.quests.advance('M2'); this._sfx('sfx_confirm', 0.7);
      this._banner("Saplings watered. Now catch Henrietta — she's loose in the meadow!", 2400); this._refreshTracker && this._refreshTracker();
      if (this._hen) { this._henState = 'flee'; }   // the hen bolts
    } else if (stepId === 'hen' && this._hen && this._hen.active && Math.hypot(this._hen.x - this.player.x, this._hen.y - this.player.y) < INTERACTION_RADIUS) {
      this._henCatch();   // the nest/coop shares the pen tile with Henrietta's roost — on the hen step, a press here IS the catch
    } else {
      this._startGreeting('', [which === 'eggs' ? 'A nest of warm eggs in the coop. (Ask Mara what needs doing first.)'
        : 'The orchard saplings, thirsty in the sun. (Ask Mara what needs doing first.)']);
    }
  }

  // the CATCH — fires only when the player has actually cornered Henrietta on the hen step; opens the
  // seeded catch/kick/free choice (dialogue.start='chase'), which completes + rewards M2 via `complete:M2`.
  _henCatch() {
    if (this._dlg) return;
    const onHenStep = this.quests.status('M2') === 'active' && this.quests.defs.M2.steps[this.quests.step.M2]?.id === 'hen';
    if (onHenStep) {
      // PICK UP + CARRY verb — lift Henrietta OVERHEAD (held above the head, follows the player), then the moral
      // choice (catch=place in pen / kick / free). FLAG: a held-overhead carry-pose + a throw arc are deferred
      // (no LPC lift/carry frames; using the seated hen rendered above the head as the minimum coherent carry).
      this._henState = 'carried'; this._sfx('sfx_select', 0.7);
      if (this._hen) this._hen.play('hen_peck');
      this._startQuestDialogue('M2');   // the seeded catch/kick/free choice — completes M2 on the pick (complete:M2)
    } else this._startGreeting('', ['Henrietta the brown hen pecks at the dirt, unbothered.']);
  }
  // HIT verb reactions — the blunt unarmed punch makes nearby ANIMALS + NPCs REACT (never killed with safety on):
  // the hen flees + squawks; an NPC staggers (a small recoil) + protests. Pure reaction; no damage, no harvest.
  _applyHitReactions() {
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    const hx = this.player.x + f.x * 16, hy = this.player.y + f.y * 16, reach = 26;
    if (this._hen && this._hen.active && this._henState !== 'carried' && this._henState !== 'settled' && Math.hypot(this._hen.x - hx, this._hen.y - hy) < reach) {
      this._henState = 'flee'; this._sfx('sfx_deny', 0.5);                    // squawk-ish + bolt
      const r = this._m2Sites && this._m2Sites.roam; const nx = this._hen.x + f.x * 10, ny = this._hen.y + f.y * 10;
      this._hen.x = r ? Phaser.Math.Clamp(nx, r.x0, r.x1) : nx; this._hen.y = r ? Phaser.Math.Clamp(ny, r.y0, r.y1) : ny;
      this._banner('*BWAAK!* Henrietta flaps off in a fury.', 1400);
    }
    for (const n of (this.npcSolids ? this.npcSolids.getChildren() : [])) {
      if (!n.active || Math.hypot(n.x - hx, n.y - hy) >= reach + 6) continue;
      this._sfx('sfx_hit', 0.4);
      this.tweens.add({ targets: n, x: n.x + f.x * 6, y: n.y + f.y * 6, duration: 80, yoyo: true, ease: 'Quad.out', onComplete: () => { if (n.body) n.body.reset(n.x, n.y); } });   // flinch/recoil
      this._banner(n.getData && n.getData('protected') ? '"Ow! Quit it!"' : '"Hey! What was THAT for?!"', 1500);
      break;
    }
  }

  // per-frame hen behaviour: peck at home, FLEE the player on the hen step (slower than the child, so it's
  // catchable by cornering), settle into the pen on a gentle catch / vanish on kick or freed.
  // The eggs chore becomes current AFTER the region built (M2 starts at Mara, later), so (re)spawn the physical
  // egg objects at the coop whenever the eggs step is active and none are placed. Collecting advances the step,
  // so they never re-spawn after pickup.
  _m2MaybeSpawnEggs() {
    if (!this.isChild || !this._m2Sites) return;
    const onEggs = this.quests.status('M2') === 'active' && this.quests.defs.M2.steps[this.quests.step.M2]?.id === 'eggs';
    if (!onEggs || (this._eggs && this._eggs.length)) return;
    const nest = this._m2Sites.eggs; this._eggs = [];
    for (let i = 0; i < 3; i++) { const e = this.add.image(nest.x + (i - 1) * 9, nest.y + (i % 2) * 5 - 2, 'egg').setScale(0.62).setDepth(DEPTH.FLOOR + 4); DepthSort.trackProp(e, { offX: 0, offY: 4, w: 9, h: 7 }); this._regionObjs.push(e); this._eggs.push(e); }
  }
  _henTick(dt) {
    this._m2MaybeSpawnEggs();
    const hen = this._hen; if (!hen || !hen.active) return;
    // CARRIED — held overhead, following the player (the PICK UP/CARRY verb). Drawn above the head.
    if (this._henState === 'carried' && this.quests.status('M2') !== 'complete') {
      hen.x = this.player.x; hen.y = this.player.y - 30; hen.setDepth(DEPTH.OVERLAY + 2);
      if (hen.anims.currentAnim?.key !== 'hen_peck') hen.play('hen_peck');
      return;
    }
    if (this.quests.status('M2') === 'complete' && this._henState !== 'settled') {
      const ch = this.quests.chosenOn('M2'); this._henState = 'settled';
      if (ch === 'catch') this.tweens.add({ targets: hen, x: this._m2Sites.henHome.x, y: this._m2Sites.henHome.y, duration: 700, ease: 'Quad.out', onComplete: () => hen.active && hen.play('hen_peck') });
      else hen.setVisible(false);   // kicked or freed → off she goes
      return;
    }
    if (this._henState !== 'flee') return;
    const dx = hen.x - this.player.x, dy = hen.y - this.player.y, d = Math.hypot(dx, dy);
    if (d < 92) {
      const r = this._m2Sites.roam, sp = 78 * dt, ux = dx / (d || 1), uy = dy / (d || 1);
      const nx = Phaser.Math.Clamp(hen.x + ux * sp, r.x0, r.x1), ny = Phaser.Math.Clamp(hen.y + uy * sp, r.y0, r.y1);
      const mdx = nx - hen.x, mdy = ny - hen.y; hen.x = nx; hen.y = ny;
      const dir = Math.abs(mdx) > Math.abs(mdy) ? (mdx < 0 ? 'left' : 'right') : (mdy < 0 ? 'up' : 'down');
      if (hen.anims.currentAnim?.key !== `hen_${dir}`) hen.play(`hen_${dir}`);
    } else if (hen.anims.currentAnim?.key !== 'hen_peck') { hen.play('hen_peck'); }
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
  // RPG-FEEL-STANDARD pillar 1 — a gate must READ as its ability (not a generic grey rockfall). Color +
  // prompt are keyed to the gate's deed so a grapple-gorge ≠ a hookshot-chasm ≠ a rockfall at a glance.
  // (Bespoke per-ability gate SPRITES — cracked-wall/ice-block/grapple-anchor — are DEFERRED art; tint +
  // an ability-named inspect deliver the legibility now.)
  static GATE_LOOK = {
    tool_grapple:   { tint: 0x9a6a3a, prompt: 'A sheer gorge — a grapple-anchor juts from the far rim',      hint: 'You could line a GRAPPLE onto that anchor and swing across. (Earned in the Peaks.)' },
    tool_hookshot:  { tint: 0x4a8a9a, prompt: 'A scorched chasm — a hookshot-ring is bolted across it',       hint: 'A HOOKSHOT would catch that ring and pull you over. (Earned at the Coast.)' },
    tool_lantern:   { tint: 0x2a2a38, prompt: 'A boarded, lightless mouth — pitch dark within',               hint: 'You need a LANTERN to brave that dark. (Earned in the Marsh.)' },
    tool_firefrost: { tint: 0xaad4ff, prompt: 'A wall of black ice seals the way',                            hint: 'FIREFROST would thaw this ice. (Earned at Ember Hollow.)' },
    _default:       { tint: 0x8a8f9c, prompt: 'A rockfall bars the road',                                     hint: null },
  };
  _buildRegionGate(R) {
    const g = R.gate;
    if (this.karma.hasDeed(g.deed)) return;                 // unlocked — pass open
    for (const c of g.colliders) {
      const rect = this.add.rectangle(c.x, c.y, c.w, c.h, 0x000000, 0).setVisible(false);
      this.physics.add.existing(rect, true); this.solids.add(rect); this._regionObjs.push(rect);
    }
    const look = OverworldScene.GATE_LOOK[g.deed] || OverworldScene.GATE_LOOK._default;
    const m = this.physics.add.sprite(g.sign.x, g.sign.y, 'prop_rock_crag').setTint(look.tint);
    if (g.deed === 'tool_grapple' || g.deed === 'tool_hookshot') m.setScale(1, 1.4);   // a tall anchor/ring reads as "reach across"
    m.body.enable = false; DepthSort.trackProp(m, solidBox('prop_rock_crag', PROPS['prop_rock_crag'])); this._regionObjs.push(m);
    Interaction.register({ x: g.sign.x, y: g.sign.y + 8, prompt: look.prompt, onInteract: () => this._startGreeting('', [look.hint || g.lockedMsg, ...(look.hint ? [g.lockedMsg] : [])]) });
  }

  // GREYBOX GRANT — a placeholder reward node (a glowing marker) that records the region's tools/
  // shards on interact, so the whole gate-chain is walkable on the skeleton (no real dungeon yet).
  _buildRegionGrant(R) {
    const g = R.grant;
    if (g.deeds.every((d) => this.karma.hasDeed(d))) return;                  // already granted
    const m = this.add.rectangle(g.x, g.y, 28, 28, 0xffcf66, 0.45).setStrokeStyle(2, 0xffe9a8);
    DepthSort.trackProp(m, null); this._regionObjs.push(m);   // box-less greybox → display-bottom feet
    Interaction.register({ x: g.x, y: g.y + 6, prompt: 'Investigate (greybox reward)', onInteract: () => {
      g.deeds.forEach((d) => this.karma.recordDeed(d));
      this._startGreeting('', [g.label + '  [greybox grant — placeholder for the dungeon/boss]']);
    } });
  }

  // ---- AREA TRANSITION (Phase 0): overworld ↔ interior ↔ floor, with a return-stack ----------------
  // THE TIME-SKIP (sys 4) — the canon-toned childhood→adult transition. A held black card ("Ten winters gone"),
  // then the child BECOMES the adult (real adult body + a sword) and wakes in a CHANGED Greenhollow (sys 5's
  // growth flips because time_skip is now set). Fires once, from the M6 burning.
  _doTimeSkip() {
    if (this._timeSkipping) return; this._timeSkipping = true;
    if (this._dlg) this._closeDialogue();
    Movement.stop(this.player);
    // S4: the SAME CardSequence player the intro uses — here a single TIMED beat (auto-advances after 2.4s),
    // and onDone performs the child→adult transition UNDER the cover, then fades the cover out.
    const seq = new CardSequence(this, [{ text: 'Ten winters gone.', hold: 2400 }], {
      manual: false, fontSize: '34px', depth: DEPTH.OVERLAY + 50,
      onDone: () => {
        // BECOME THE ADULT (under the cover)
        this.isChild = false; this.player.isAdult = true; this.player.isMinor = false;
        for (const p of ['body_ivory', 'head_ivory', 'pants_black', 'shoes_brown']) this.player.equip(p);   // child body → grown body
        this.player.equip('sword'); this._scaleHead(this.player);
        this._areaStack = []; this._inInterior = false;
        this.player.x = GREENHOLLOW.player.x; this.player.y = GREENHOLLOW.player.y; this.player.body.reset(this.player.x, this.player.y);
        this._unloadAllRegions(); this._maybeToggleRegion(true); this._restream(true);
        this._applyInteriorCamera(false);   // the child may have been in a clamped interior — restore the open-world camera
        this.cameras.main.centerOn(this.player.x, this.player.y);
        if (this.saveGame) this.saveGame();   // persist the adult state immediately
        this.tweens.add({ targets: [seq.cover, seq.txt], alpha: 0, duration: 1000, delay: 200, onComplete: () => {
          seq.destroy(); this._timeSkipping = false; this._banner('You return to Greenhollow, grown. The town is not as you left it.', 3200);
          // M7 "Ten Winters Gone" — the adult-return beat auto-starts here (no giver to find at the gate; Sela is
          // placed in town for the charge). Plays arrive → reactive welcome → forge → Sela's charge → unlocks GH1+.
          this.time.delayedCall(1400, () => { if (!this.isChild && !this._dlg && this.quests.status('M7') === 'available') this._startQuestDialogue('M7'); });
        } });
      },
    });
    this._registerUIPanel && this._registerUIPanel(seq.cover); this._registerUIPanel && this._registerUIPanel(seq.txt);   // L5: on the zoom-1 uiCamera, balanced + clamped
  }

  // `to` = an interior region key (enter, pushing the current spot) OR 'back' (pop → exit/descend).
  // Reuses the proven streaming (interiors are REGIONS in a far corner) + SaveManager deltas, so a
  // looted interior chest stays looted, tools/quests/karma persist, and navGates validate interiors.
  _enterArea(to, returnPos = null) {
    // L4 CRITICAL BEAT — a blocking step refuses the exit until it's done. The opening: the cottage door stays
    // shut until you've spoken with Mara (M1 engaged). Diegetic banner; no transition.
    if (to === 'back' && this._exitBlock && this.region && this.region.key === this._exitBlock.region && !this._exitBlock.done()) {
      this._sfx('sfx_deny', 0.5); this._banner(this._exitBlock.msg, 2000); return;
    }
    if (this._areaT) return; this._areaT = true;                     // debounce mid-transition
    if (to === '__gendungeon' || to === '__gencave') { to = this._generateAndInject(to === '__gencave' ? 'cave' : 'dungeon'); if (!to) { this._areaT = false; return; } }
    if (to === 'back') {
      const ret = (this._areaStack || []).pop();
      if (ret) { this.player.x = ret.x; this.player.y = ret.y; this._inInterior = !!ret.interior; }
      else this._inInterior = false;
      this._sfx('sfx_door_close', 0.5);                              // the door shuts behind you (WS3)
    } else {
      const R = REGIONS.find((r) => r.key === to && r.interior);
      if (!R || !R.spawn) { this._areaT = false; return; }
      this._sfx('sfx_door_open', 0.5);                              // the door opens as you step in (WS3)
      // NO-STUCK-ON-LINE: store the RETURN squarely on a clean walkable tile (the yard below the doorway,
      // not the threshold line) so walking back out lands the avatar centred in walkable space.
      (this._areaStack = this._areaStack || []).push({ x: returnPos ? returnPos.x : this.player.x, y: returnPos ? returnPos.y : this.player.y, interior: !!this._inInterior });
      this.player.x = R.spawn.x; this.player.y = R.spawn.y; this._inInterior = true;
      // NO-THRESHOLD-JAM: the spawn coincides with the exit door (against a wall). Nudge the avatar ONE tile
      // INTO the room so you land in open space — not jammed at the inside/outside line — and walk back DOWN
      // to the door to leave. (The exit trigger still fires on the door tile.)
      if (R.widthTiles && R.heightTiles) {
        const sty = Math.floor((R.spawn.y - R.bounds.y) / TILE), stx = Math.floor((R.spawn.x - R.bounds.x) / TILE);
        const dy = sty > R.heightTiles / 2 ? -1 : (sty < R.heightTiles / 2 ? 1 : 0);
        const dx = dy === 0 ? (stx > R.widthTiles / 2 ? -1 : 1) : 0;   // side-door interiors nudge horizontally instead
        this.player.x += dx * TILE; this.player.y += dy * TILE;
      }
    }
    this.player.body.reset(this.player.x, this.player.y);
    this._lastTile = { tx: Math.floor(this.player.x / TILE), ty: Math.floor(this.player.y / TILE) };  // WALK-THROUGH: spawn ON the door tile → don't re-fire until the player steps OFF then back ON
    this._unloadAllRegions(); this._maybeToggleRegion(true); this._restream(true);
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this._setInteriorView(this._inInterior);
    this._banner(this._inInterior ? (this.region ? 'Entered ' + this.region.key : 'Inside') : 'Back outside', 1100);
    this.time.delayedCall(DOOR.AREA_DEBOUNCE_MS, () => { this._areaT = false; });
  }

  // WALK-IN / WALK-OUT — doors/stairs are walk-trigger zones (genre standard, not press-E). Fires on the
  // RISING EDGE (player just stepped onto a door tile), so spawning on a door tile doesn't re-trigger.
  // Reads the current region's `via:'door'` interactables; reuses _enterArea (return-stack + persistence).
  _checkDoorWalk() {
    if (this._dlg || this._areaT) return;
    const reg = this.region; const T = TILE;
    const ptx = Math.floor(this.player.x / T), pty = Math.floor(this.player.y / T), last = this._lastTile;
    const moved = !(last && last.tx === ptx && last.ty === pty);
    if (moved) {
      this._doorFired = false;   // stepped onto a new tile → a fresh building-door entry is allowed here
      // INTERIOR EXIT / region 'via:door' links — rising-edge walk-onto (no facing gate; you step OUT a door).
      if (reg && reg.interactables) {
        for (const o of reg.interactables) {
          if (o.via !== 'door') continue;
          if (Math.round((o.x - T / 2) / T) === ptx && Math.round((o.y - T / 2) / T) === pty) {
            this._lastTile = { tx: ptx, ty: pty };
            // CHILDHOOD SPINE — a child at the boarded cave-mouth gets the M4 'loose plank' beat (the weeping-flame
            // carving), NOT the empty adult cave interior. Once M4 is done (or as an adult) it's a normal entrance.
            if (o.to === 'cave_f1' && this.isChild && this.quests.status('M4') !== 'complete') {
              const st = this.quests.status('M4');
              if (st === 'available' || st === 'active') { this._childStart('M4'); return; }
              this._startGreeting('', ['Boards and a loose plank — just wide enough for someone small. (Mara had chores first.)']); return;
            }
            this._enterArea(o.to); return;
          }
        }
      }
    }
    // BUILDING DOORWAYS — OPEN → enter; CLOSED/LOCKED → the knock/try/break choice. The pure
    // buildingDoorTrigger decides; we fire it ONCE per tile-occupancy (_doorFired). A 'wait' (on the threshold
    // but not yet facing the doorway) does NOT consume the trigger — re-evaluated each frame, so an off-axis
    // arrival that then faces the door still enters (the item-3 facing gate used to consume here, which
    // stranded the player on a threshold they could no longer enter = the all-buildings regression). Walking
    // PAST (facing along the wall while crossing) stays 'wait' the whole time → never fires.
    if (!this._doorFired) {
      const t = buildingDoorTrigger(this._buildingDoors, ptx, pty, this.player.facing, T);
      if (t.action === 'enter' || t.action === 'prompt') {
        this._doorFired = true; this._lastTile = { tx: ptx, ty: pty };
        if (t.action === 'prompt') this._openDoorChoice(t.door);
        else { this._openDoorVisual(t.door); this._enterArea(t.door.to, { x: t.door.dcx, y: t.door.dcy + TILE }); }
        return;
      }
    }
    this._lastTile = { tx: ptx, ty: pty };
  }

  // GENERATE a fresh dungeon/cave (Phase 1), validate via navGates inside generate(), and inject it
  // into REGIONS at runtime (a reserved gen slot; re-rolls a new seed each entry). Returns its key.
  _generateAndInject(kind) {
    const slot = kind === 'cave'
      ? { key: 'gen_cave', otx: 440, oty: 540, w: 26, h: 18, floor: 'rock' }
      : { key: 'gen_dungeon', otx: 440, oty: 480, gw: 4, gh: 3, floor: 'rock' };
    slot.seed = (this._genSeed = ((this._genSeed || 1234) + 2654435761) >>> 0);   // vary each entry (re-roll)
    const res = kind === 'cave' ? generateCave(slot) : generateDungeon(slot);
    const region = res.region;
    const i = REGIONS.findIndex((r) => r.key === region.key);   // runtime inject/replace (not in the static source → no gate impact)
    if (i >= 0) REGIONS[i] = region; else REGIONS.push(region);
    this._lastGen = { kind, tries: res.tries, fallback: res.fallback, rooms: region.chests.length };
    return region.key;
  }

  // FIRE-RESPONDS-TO-PURITY (LORE-CANON §5) — a flame at the chapel ward that READS the player's heart:
  // PURE → steady warm gold; CORRUPT → cold, wrong-coloured, flinching; neutral → an honest orange. Diegetic
  // karma feedback (show, never tell). _tickFlame re-tints it each frame by the live purity band.
  _buildChapelFlame(R) {
    const T = TILE, fx = R.origin.x + 19 * T + T / 2, fy = R.origin.y + 11 * T;   // the chapel front (building at tx19)
    const f = this.add.image(fx, fy, 'ow_orb').setBlendMode(Phaser.BlendModes.ADD).setDepth(fy + 200);
    this._chapelFlame = f; this._regionObjs.push(f); this._tickFlame(this.time.now);
  }
  _tickFlame(now) {
    const f = this._chapelFlame; if (!f || !f.active) return;
    const pur = this.karma.get('purity');
    const corrupt = pur <= -20, pure = pur >= 20;
    const flick = Math.sin(now / (corrupt ? 70 : 220)) * (corrupt ? 0.22 : 0.06);   // corrupt = a fast, uneasy flinch
    const tint = pure ? 0xffd86a : corrupt ? 0x4a86e0 : 0xffa040;                    // gold / cold-wrong blue / honest orange
    const baseScale = pure ? 0.78 : corrupt ? 0.5 : 0.64, baseAlpha = pure ? 0.95 : corrupt ? 0.6 : 0.85;
    f.setTint(tint).setScale(baseScale + flick).setAlpha(Math.max(0.25, baseAlpha + flick * 0.6));
  }

  // enclosed look: a dark backdrop over the overworld ground (under the interior floor) + dim bg.
  _setInteriorView(on) {
    if (!this._interiorBg) this._interiorBg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x07060c, 1).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.FLOOR + 0.5).setVisible(false);
    this._interiorBg.setVisible(!!on);
    this.cameras.main.setBackgroundColor(on ? '#07060c' : '#243a2a');
    // hide the overworld chunk ground/props/decals so the interior reads enclosed (not grass + trees)
    for (const [, c] of this.chunks) { if (c.ground) c.ground.setVisible(!on); for (const s of c.props) if (s.active) s.setVisible(!on); for (const d of (c.decals || [])) if (d.active) d.setVisible(!on); }
    // CAMERA CLAMP TO FOOTPRINT (systemic, every interior) — bound the camera to the interior's exact
    // footprint and zoom IN so the room FILLS the viewport, so NO dark void shows past the walls at any
    // position. A room smaller than the (zoomed) view is centred + locked automatically: Phaser centres the
    // camera on bounds smaller than its viewport. The follow still pans within a larger room, clamping at the
    // walls. Restore the open-world zoom + bounds on exit.
    this._applyInteriorCamera(on);
  }

  // Clamp + zoom-to-fill the main camera for the ACTIVE interior (or restore the overworld). Reads the
  // region's own bounds (interiorRegion declares `bounds` + `interior:true`), so it applies to ALL interiors.
  _applyInteriorCamera(on) {
    const cam = this.cameras.main, b = this.region && this.region.bounds;
    const vw = this.scale.width, vh = this.scale.height;
    if (on && this.region && this.region.interior && b) {
      // INSET the world viewport into the HUD-free safe area (HUD_SAFE) so the room frames inside it and the
      // stats panel / minimap / quests / help bar sit on the dark border — never over the room. Systemic: every
      // interior, any window size. The cover-zoom uses the inset dims so the room still fills the framed area.
      const iw = Math.max(64, vw - HUD_SAFE.right), ih = Math.max(64, vh - HUD_SAFE.top - HUD_SAFE.bottom);
      cam.setViewport(0, HUD_SAFE.top, iw, ih);
      const zoom = Math.min(INTERIOR_ZOOM_MAX, Math.max(WORLD_ZOOM, iw / b.w, ih / b.h));
      cam.setZoom(zoom);
      cam.setBounds(b.x, b.y, b.w, b.h);
    } else {
      cam.setViewport(0, 0, vw, vh);   // full screen outdoors
      cam.setZoom(WORLD_ZOOM);
      cam.setBounds(0, 0, WORLD_PX, WORLD_PX);
    }
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
    m.body.enable = false; DepthSort.trackProp(m, solidBox('prop_sign', PROPS['prop_sign'])); this._regionObjs.push(m);
    Interaction.register({ x: r.x, y: r.y + 8, prompt: `Read ${r.name}`, onInteract: () => {
      const st = this.quests.status('SP1');
      if (st === 'available' || st === 'active') return this._startQuestDialogue('SP1');
      if (st === 'complete') return this._startGreeting('', ['The Order\'s records, read and damning.']);
      return this._startGreeting('', ['Weathered ledgers of the Order — sealed until the town trusts you (stand with the miners).']);
    } });
  }

  _buildRegionNpc(n) {
    // AGE-VARIANT (sys 3/5) — the town the CHILD sees vs the ADULT's. childOnly NPCs (Bram, the playmate kids)
    // are gone after the fire/time-skip; adultOnly NPCs (the slice cast who arrive/grow up) aren't there yet.
    if (this.isChild && n.adultOnly) return; if (!this.isChild && n.childOnly) return;
    const npc = new Character(this, n.x, n.y, { parts: n.parts, facing: n.facing || 'down', speed: n.speed || 70 });
    npc.name = n.name || '';   // tag the built sprite with its NPC name (age-variant proof + debugging)
    this.add.existing(npc); npc.body.setImmovable(false);
    // SOLID to the player + each other (item 1). pushable=false → a bump blocks, never shoves them away.
    // ghost:true exempts (schema for special cases — e.g. a vision/cutscene actor that must pass through).
    if (!n.ghost) { npc.body.pushable = false; this.npcSolids.add(npc); }
    if (n.scale) npc.setScale(n.scale);                 // kids = a smaller villager (proper child skin = a deferred ULPC fetch)
    npc.setData('protected', !!n.protected);            // PROTECTED NPCs (kids) are never harmable/targetable — hard rule (gate-asserted)
    npc.setData('role', n.role || '');                  // 'guard' = confronts a player owing a fine
    // POSTED — an interaction-ANCHOR NPC (shopkeeper / quest-giver / topic-or-social NPC) must STAY at its
    // spot so the player can always find it (they still follow a schedule; they just never free-WANDER).
    // Without this, a scheduleless keeper drifts off its counter and "the shop has no items" (item-5 regression).
    npc.setData('posted', !!(n.shop || n.quest || n.topics || n.social));
    DepthSort.track(npc, npc.body.offset.y + npc.body.height);   // sort NPCs by their feet line too (same as the hero)
    this._scaleHead(npc);                                         // BIG-HEAD modifier (item 1) — streamed NPCs scale too
    this.npcLife.add(npc, n.schedule, n.tempo);
    this._regionObjs.push(npc);
    for (const q of [n.quest, ...(n.quests || [])].filter(Boolean)) (this._npcByQuest || (this._npcByQuest = {}))[q] = npc;   // objective-arrow target (live)
    Interaction.register({
      target: npc, targetOffY: 0, prompt: (n.quest || n.quests) ? 'Talk (quest)' : 'Talk',
      onInteract: () => this._npcInteract(n),
    });
  }

  // BIG-HEAD modifier (item 1) — scale the head-region layers of one Character. Reads the LIVE modifier value
  // (1.0 when off, so this is a safe no-op then). Ported from RegionScene — the rendering moved to this scene
  // but the application didn't, so big-head silently stopped working (no gate covered scene-application).
  // The HEAD GROUP — every layer that sits ON the head must scale as ONE unit, or a big head wears a tiny hat
  // (Van: guard kettle-helms stayed small). 'hat' (helm/cap) + any head-attached slot is included, same scale
  // + same lift, so the helm stays proportional and seated. [SSOT for the gate: OverworldScene.HEAD_SLOTS]
  static HEAD_SLOTS = ['head', 'hair', 'brows', 'beard', 'hat'];
  _scaleHead(c) {
    if (!c || !c._slotLayers || !this.mods) return;
    const s = this.mods.headScale();
    // y = the per-part SEAT offset (scaled) + the big-head lift. When s=1 (off) this restores the base seat,
    // so the hair stays correctly seated in BOTH modes (the per-part oy in assets.js fixes high-sitting styles).
    for (const slot of OverworldScene.HEAD_SLOTS) (c._slotLayers[slot] || []).forEach((sp) => sp.setScale(s, s).setY((sp._baseY || 0) * s + (s > 1 ? -10 * (s - 1) : 0)));
  }
  // Re-apply to the player + every loaded NPC. Called on create + by OptionsScene's live modifier-toggle hook.
  _applyBigHead() {
    this._scaleHead(this.player);
    this.children.list.forEach((o) => { if (o instanceof Character) this._scaleHead(o); });
  }

  _buildRegionChest(c) {
    const [cx, cy] = cidOf(c.x, c.y);
    if (this.save.isOpened(cx, cy, c.id)) return;          // already looted (delta) → don't spawn
    const spr = this.physics.add.sprite(c.x, c.y, 'prop_chest').setOrigin(0.5, 0.72);
    DepthSort.trackProp(spr, solidBox('prop_chest', PROPS['prop_chest'])); this._regionObjs.push(spr); this._chestSprites.push(spr);
    let looted = false;
    Interaction.register({
      x: c.x, y: c.y + 6, prompt: 'Open the chest',
      onInteract: () => {
        if (looted || this.save.isOpened(cx, cy, c.id)) return;   // OBJECT PERMANENCE: looted once, never re-claimed
        looted = true;
        this.inv.addGold(c.gold);
        if (c.private) { this.karma.commit({ deed: 'home_looted', morality: -4, purity: -3 }); this._banner('You took what was not yours.', 1400); }   // SPEC-INTERIORS (c): private-home looting allowed, at a Karma cost
        this.save.recordOpened(cx, cy, c.id);
        spr.setVisible(false).setActive(false); DepthSort.untrack(spr);
        this._sfx('sfx_pickup', 0.85); this._itemGetFx(c.x, c.y - 4);   // feedback + the 2D item-get flourish
        this._startGreeting('', [c.line]);
      },
    });
  }

  // --- INTERACTABLES (cut / push / search) — DATA-driven, reuses Interactables.js + the
  //     chest permanence (save.recordOpened/isOpened chunk-delta). All press-E for now.
  _grantLootFeedback(granted, x, y) {
    if (!granted || !granted.length) { this._banner('Nothing of use.', 1000); return; }
    const parts = granted.filter((g) => !g.full).map((g) => g.gold != null ? `${g.gold}g` : `${g.n}× ${g.item}`);
    this._sfx('sfx_pickup', 0.8); this._itemGetFx(x, y - 4);
    if (parts.length) this._banner('Found: ' + parts.join(', '), 1400);
    if (granted.some((g) => g.full)) this._banner('Your pack is full!', 1400);
  }

  _solidAt(wx, wy, exclude) {
    for (const o of this.solids.getChildren()) {
      const b = o.body; if (!b || b.physicsType !== 1 || b.enable === false || o === exclude) continue;   // a disabled collider (e.g. a cleared doorway threshold) is NOT solid
      if (wx >= b.center.x - b.halfWidth && wx <= b.center.x + b.halfWidth && wy >= b.center.y - b.halfHeight && wy <= b.center.y + b.halfHeight) return true;
    }
    return false;
  }

  _buildInteractable(o) {
    // DOORS — NEVER a free-standing prop_door on open ground (the "floating doors" bug). The walk-trigger
    // is data-driven (_checkDoorWalk); the VISUAL is: (a) the building's OWN painted door for an overworld
    // building entrance → render NO sprite; (b) a MARKER (cave-mouth / waypost) for a cave/dungeon/town
    // entrance on open terrain (o.marker); (c) the EMBEDDED interior-wall door for an interior EXIT
    // (it carries spriteDx/Dy from doorWallOffset → render the prop_door inside the wall).
    if (o.via === 'door') {
      const embedded = (o.spriteDx != null || o.spriteDy != null);
      if (!o.marker && !embedded) return;                       // building entrance → invisible trigger (the building's door is the cue)
      const dk = o.marker || o.key, dd = PROPS[dk]; if (!dd) return;
      const dspr = this.add.sprite(o.x + (o.spriteDx || 0), o.y + (o.spriteDy || 0), dk).setOrigin(0.5, 0.5);
      if (o.scale) dspr.setScale(o.scale); if (o.tint != null) dspr.setTint(o.tint);
      const db = solidBox(dk, dd); DepthSort.trackProp(dspr, db); this._regionObjs.push(dspr);
      // STAIRS (a floor-change link, not a building exit): read as a stairwell — stone-tint + a step-band
      // overlay so it's visually distinct from the wooden exit door. (FLAG: a dedicated stairs sprite is better.)
      if (o.stairs) { dspr.setTint(0x8a8f9c); const step = this.add.rectangle(o.x, o.y + 4, TILE * 0.8, 5, 0xbfc4cc).setStrokeStyle(1, 0x5a5e66).setDepth((dspr.depth || 0) + 0.1); this._regionObjs.push(step); }
      return;
    }
    const d = PROPS[o.key]; if (!d) return;
    const sc = o.scale || 1, b = solidBox(o.key, d);
    const spr = this.add.sprite(o.x + (o.spriteDx || 0), o.y + (o.spriteDy || 0), o.key).setOrigin(0.5, 0.5);
    if (o.scale) spr.setScale(o.scale);
    if (o.tint != null) spr.setTint(o.tint);
    let rect = null;
    if (o.solid) {
      rect = this.add.rectangle(o.x + b.offX * sc, o.y + b.offY * sc, Math.max(8, b.w * sc), Math.max(8, b.h * sc), 0x000000, 0).setVisible(false);
      this.physics.add.existing(rect, true); this.solids.add(rect); this._regionObjs.push(rect);
      spr.setData('solidKey', o.key);
    }
    DepthSort.trackProp(spr, b);
    this._regionObjs.push(spr);

    const [cx, cy] = cidOf(o.x, o.y), memKey = `ix_${o.id}`;
    const mem = { has: (k) => this.save.isOpened(cx, cy, k), record: (k) => this.save.recordOpened(cx, cy, k) };
    const ctx = () => ({ inv: this.inv, rng: Math.random, mem, key: memKey,
      hasDeed: (id) => this.karma.hasDeed(id), recordDeed: (id) => this.karma.recordDeed(id) });

    if (o.via === 'search') {
      if (this.save.isOpened(cx, cy, memKey)) spr.setTint(0x8f8f8f);   // already-searched state read
      Interaction.register({ x: o.x, y: o.y + 6, prompt: o.prompt || 'Search', onInteract: () => {
        const res = searchContainer(o, ctx());
        if (res.already) { this._banner("You've already searched this.", 1200); return; }
        if (res.locked) { this._banner("It's locked.", 1200); this._sfx('sfx_deny', 0.5); return; }
        this._grantLootFeedback(res.granted, o.x, o.y); spr.setTint(0x8f8f8f);
      } });
    } else if (o.via === 'cut' || o.via === 'break') {
      if (o.permanent && this.save.isOpened(cx, cy, memKey)) { spr.setVisible(false).setActive(false); DepthSort.untrack(spr); if (rect) { rect.body.enable = false; this.solids.remove(rect); } return; }
      Interaction.register({ x: o.x, y: o.y + 6, prompt: o.prompt || (o.via === 'cut' ? 'Cut' : 'Break'), onInteract: () => {
        const res = cutObject(o, ctx());
        if (res.already) return;
        this._sfx('sfx_hit', 0.5); this._grantLootFeedback(res.granted, o.x, o.y);
        if (o.permanent) { spr.setVisible(false).setActive(false); DepthSort.untrack(spr); if (rect) { rect.body.enable = false; this.solids.remove(rect); } }
        else { spr.setVisible(false); this.time.delayedCall(o.respawnMs || 12000, () => spr.active && spr.setVisible(true)); }
      } });
    } else if (o.via === 'gate') {
      // a TOOL/DEED-gated access point — the boarded M4 cave (tool_lantern). Sealed = the tease.
      Interaction.register({ x: o.x, y: o.y + 6, prompt: o.prompt || 'Examine', onInteract: () => {
        const r = enterGate(o, ctx());
        if (r.locked) { this._sfx('sfx_deny', 0.5); this._startGreeting('', [o.lockedLine || 'It is sealed — you need a way in.']); return; }
        if (r.first) { this._sfx('sfx_pickup', 0.6); this._itemGetFx(o.x, o.y - 4, 'ow_orb', 0xa6e3ff); }
        if (o.lines) this._startGreeting(o.speaker || '', o.lines);
      } });
    } else if (o.via === 'push') {
      const T = TILE; o._tx = Math.round(o.x / T); o._ty = Math.round(o.y / T);
      Interaction.register({ x: o.x, y: o.y, prompt: o.prompt || 'Push', onInteract: () => {
        const f = FACE_VEC[this.player.facing] || FACE_VEC.down, dir = { dx: Math.sign(f.x), dy: Math.sign(f.y) };
        const isSolid = (tx, ty) => this._solidAt(tx * T + T / 2, ty * T + T / 2, rect);
        const moved = pushBlock({ tx: o._tx, ty: o._ty }, dir, isSolid);
        if (!moved) { this._sfx('sfx_deny', 0.4); return; }
        o._tx = moved.tx; o._ty = moved.ty;
        const nx = moved.tx * T + T / 2, ny = moved.ty * T + T / 2;
        this.tweens.add({ targets: spr, x: nx, y: ny, duration: 150 });
        if (rect) { rect.x = nx + b.offX * sc; rect.y = ny + b.offY * sc; if (rect.body.updateFromGameObject) rect.body.updateFromGameObject(); else rect.body.position.set(rect.x - rect.width / 2, rect.y - rect.height / 2); }
        this._sfx('sfx_hit', 0.4);
      } });
    } else if (o.via === 'door') {
      // WALK-THROUGH transition: doors/stairs are walk-trigger ZONES (handled in update → _checkDoorWalk),
      // NOT press-E interactables — walk onto the doorway tile to enter/exit (genre standard).
    }
  }

  _unloadAllRegions() {
    for (const o of (this._regionObjs || [])) { DepthSort.untrack(o); if (o.body) this.solids.remove(o); o.destroy(); }
    this._regionObjs = []; this._chestSprites = []; this._hen = null; this._m2Sites = null; this._childSites = null; this._eggs = null;   // M2 hen/eggs/sites + childhood-spine triggers belong to the loaded region
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
    if (R.groundTint != null) rt.setTint(R.groundTint);   // eerie/themed interior floors (e.g. the Lost Cemetery)
    this._regionObjs.push(rt);
  }
  // the brook (banked pool) — pond corner/edge tiles, world-coords
  // WATER — Greenhollow's single brook (R.pond) OR Marsh's several bog pools (R.pools),
  // tinted to the biome (murky for the bog).
  _buildRegionWater(R) {
    const pools = R.pools && R.pools.length ? R.pools : (R.pond ? [R.pond] : []);
    for (const p of pools) {
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        const v = (y === 0 ? 'n' : y === p.h - 1 ? 's' : '') + (x === 0 ? 'w' : x === p.w - 1 ? 'e' : '');
        const img = this.add.image(R.origin.x + (p.tx + x) * TILE, R.origin.y + (p.ty + y) * TILE, `pond_${v || 'c'}`).setOrigin(0, 0).setDepth(DEPTH.FLOOR + 1);
        if (R.waterTint != null) img.setTint(R.waterTint);
        this._regionObjs.push(img);
      }
      // WATER IS SOLID (collision-rule: water is NOT walkable — no swim ability yet; swimming/wading is FLAGGED
      // for a later pass). ONE static collider over the WHOLE pool rect so the player's FEET-body (which sits a
      // tile below the sprite centre) reliably hits it — you walk up to the bank and stop. Matches the pond mass.
      const wx = R.origin.x + p.tx * TILE, wy = R.origin.y + p.ty * TILE, ww = p.w * TILE, wh = p.h * TILE;
      const wr = this.add.rectangle(wx + ww / 2, wy + wh / 2, ww, wh, 0x000000, 0).setVisible(false);
      this.physics.add.existing(wr, true); this.solids.add(wr); wr.setData('waterSolid', true); this._regionObjs.push(wr);
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
    marker.body.enable = false; DepthSort.trackProp(marker, solidBox('prop_sign', PROPS['prop_sign'])); this._regionObjs.push(marker);
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
  _canAct() { return !this._dlg && !this._shopOpen && !this._topicsOpen && !this._menuOpen && this._hitFreeze <= 0 && !!this.combat; }
  // SAFE HUB: within a combat region's no-aggro `safe` ring (the Peaks town) → the sword swings +
  // cuts foliage but deals NO combat damage (matching a GH-style safe zone). See the safe-zone rule.
  _inSafeHub() {
    const cr = this._combatRegion(), sf = cr && cr.combat && cr.combat.safe;
    return !!sf && Math.hypot(this.player.x - sf.x, this.player.y - sf.y) <= sf.r;
  }
  // The sword SWING cuts any cuttable asset (class table) in front of the player — in EVERY region,
  // incl. safe zones (cutting foliage isn't combat). One cut per swing; bushes respawn.
  _cutSwing() {
    if (!this._cuttables || !this._cuttables.length) return false;
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    const ax = this.player.x + f.x * 18, ay = this.player.y + 6 + f.y * 18;
    // NEAREST-TARGET: pick the CLOSEST cuttable in the swing arc — a line of bushes must hit the nearest
    // first, not whichever is first in the list (the "hits the 2nd bush" bug).
    let c = null, bestD = Infinity;
    for (const t of this._cuttables) {
      if (!t.spr.active || !t.spr.visible) continue;
      const dpx = Math.hypot(t.spr.x - ax, t.spr.y - ay);
      if (dpx > INTERACTION_RADIUS) continue;
      if (dpx < bestD) { bestD = dpx; c = t; }
    }
    if (c) {
      const res = cutObject({ loot: c.loot }, { inv: this.inv, rng: Math.random, mem: { has: () => false, record: () => {} }, key: c.key });
      this._sfx('sfx_chop', 0.5); this._grantLootFeedback(res.granted, c.spr.x, c.spr.y);   // foliage chop (WS3)
      // ANTI-FARM: record the cut (persists across area visits) + DISABLE this bush — NO in-area respawn.
      // It regrows only when you LEAVE + re-enter after CUT_REGROW_MS (handled in the props loop on re-entry).
      this._cutBushes.set(c.bushId, this.time.now);
      c.spr.setVisible(false).setActive(false); if (c.rect) { c.rect.body.enable = false; this.solids.remove(c.rect); }  // hidden+inactive → the top-of-loop guard skips it (no re-cut this swing)
      return true;
    }
    return false;
  }
  // Does the player's feet-box (centred at cx,cy) overlap any SOLID static rect? (the dodge sweep test)
  _feetBoxBlocked(cx, cy, bw, bh) {
    const L = cx - bw / 2, R = cx + bw / 2, T = cy - bh / 2, B = cy + bh / 2;
    for (const o of this.solids.getChildren()) {
      const b = o.body; if (!b || b.physicsType !== 1 || !b.enable) continue;
      if (Math.abs(b.center.x - cx) > 80 && Math.abs(b.center.y - cy) > 80) continue;   // cheap near-filter
      if (L < b.center.x + b.halfWidth && R > b.center.x - b.halfWidth && T < b.center.y + b.halfHeight && B > b.center.y - b.halfHeight) return true;
    }
    return false;
  }
  // SWEPT dodge velocity — cast the feet-box along this frame's intended displacement in ≤4px steps
  // (smaller than the thinnest base-band) and clamp to the first solid contact so a fast burst can't
  // tunnel a thin collider. On contact, ends the dodge so it doesn't keep pushing.
  _sweptDodgeVel(vx, vy, dt) {
    const sp = Math.hypot(vx, vy); if (sp < 0.01) return { x: vx, y: vy };
    const b = this.player.body, cx = b.center.x, cy = b.center.y, bw = b.width, bh = b.height;
    const dist = sp * dt, ux = vx / sp, uy = vy / sp, STEP = 4;
    let safe = 0;
    for (let d = STEP; d <= dist + STEP; d += STEP) {
      const m = Math.min(d, dist);
      if (this._feetBoxBlocked(cx + ux * m, cy + uy * m, bw, bh)) break;
      safe = m;
    }
    if (safe >= dist - 0.01) return { x: vx, y: vy };   // path clear → full dodge
    this.pc.dodgeMoveUntil = 0;                          // blocked → stop the dodge pushing further
    const f = dt > 0 ? safe / dt : 0;                    // move only the safe distance this frame
    return { x: ux * f, y: uy * f };
  }
  _playerAttack() {
    const now = this.time.now;
    if (now < this._atkReady || this.player.isBusy()) { this._atkBuffered = now + COMBAT.INPUT_BUFFER_MS; return; }
    this._atkBuffered = 0; this._atkReady = now + COMBAT.ATTACK_COOLDOWN_MS;
    // ARMED vs UNARMED: a weapon equipped (the Character weapon layer) = the slash SWING that cuts foliage; no
    // weapon (the child, or an adult who unequipped) = a blunt PUNCH that does NOT cut/harvest. The punch is a
    // forward jab (no overhead wind-up) so it never reads as a weapon swing, and it never moves the hair.
    const armed = !!this.player.equippedIn('weapon');
    const wid = this.inv && this.inv.equipped('weapon');
    const blunt = !!(wid && itemDef(wid) && itemDef(wid).blunt);   // a childSafe practice sword swings but does NOT cut
    this.player.action(armed ? 'attack' : 'punch');
    this._sfx(armed ? 'sfx_swing' : 'sfx_hit', armed ? 0.45 : 0.4);
    if (armed && !blunt) this._cutSwing();   // only a SHARP bladed swing harvests foliage — a fist or a blunt trainer can't cut a bush
    else if (!armed) this._punchFx();        // UNARMED: a visible impact puff + lunge-pop so the blunt jab READS (no weapon to see)
    this._applyHitReactions();     // HIT verb: nearby hen/NPCs REACT (flee/squawk · flinch/protest) — armed or not
    // COMBAT damage only OUTSIDE a safe zone AND outside the town safe-hub (Peaks town = sword inert for combat).
    if (!this.combat || this.region?.safeZone || this._inSafeHub() || this.isChild) return;   // a CHILD deals no combat damage (age-gate, sys 1) — they can still cut foliage above
    const out = this.combat.playerAttack(this.player, COMBAT.ATTACK_DAMAGE, { tool: this.playerAttackTool() });
    for (const r of out) {
      if (r.outcome === 'hit' || r.outcome === 'swarm') {
        this._sfx('sfx_hit', r.killed ? 0.85 : 0.7);
        if (r.e && r.e.spr) this._bloodFx(r.e.spr.x, r.e.spr.y, r.killed);   // gore modifier (item 2)
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
  // UNARMED PUNCH feedback — a blunt impact PUFF a step in front of the fist + a quick forward lunge-pop on the
  // player, so the hit READS even though there is no weapon and the arm frames are small (the 'J does nothing'
  // regression was the punch firing but flashing past invisibly). Pure VFX — no cut, no damage.
  _punchFx() {
    const f = FACE_VEC[this.player.facing] || FACE_VEC.down;
    const px = this.player.x + f.x * 16, py = this.player.y - 6 + f.y * 16;
    const ring = this.add.circle(px, py, 3, 0xffe6b0, 0).setStrokeStyle(2, 0xffe6b0, 0.95).setDepth(DEPTH.OVERLAY + 5);
    this.tweens.add({ targets: ring, scale: 3.4, alpha: 0, duration: 240, ease: 'Quad.out', onComplete: () => { try { ring.destroy(); } catch (_) {} } });
    for (let i = 0; i < 3; i++) {
      const a = Math.atan2(f.y, f.x) + (i - 1) * 0.5, d = this.add.circle(px, py, 1.6, 0xe8d8b0, 0.9).setDepth(DEPTH.OVERLAY + 5);
      this.tweens.add({ targets: d, x: px + Math.cos(a) * 13, y: py + Math.sin(a) * 13, alpha: 0, duration: 240, ease: 'Quad.out', onComplete: () => { try { d.destroy(); } catch (_) {} } });
    }
    // forward lunge-pop: a small visible thrust toward the target + back (the body, then it settles)
    const lx = this.player.x + f.x * 5, ly = this.player.y + f.y * 5;
    this.tweens.add({ targets: this.player, x: lx, y: ly, duration: 80, yoyo: true, ease: 'Quad.out', onComplete: () => { if (this.player.body) this.player.body.reset(this.player.x, this.player.y); } });
  }
  _tryDodge() {
    const now = this.time.now; let { dx, dy } = this._inputDir;
    if (!dx && !dy) { const f = FACE_VEC[this.player.facing] || FACE_VEC.down; dx = f.x; dy = f.y; }
    if (this.pc.dodge(now, dx, dy)) this._duckRollFx(dx);   // item 5: a PROCEDURAL duck (no roll FRAME exists in the library — GAP)
  }
  // PROCEDURAL DUCK-ROLL (item 5) — the ElizaWy set has NO crouch/duck/roll frame (only idle/walk/attack are
  // fetched/loaded), so the dodge reads as a quick DUCK via a squash + directional lean tween over the dodge
  // window. A STOPGAP until a real roll sheet is sourced/commissioned (see docs/DEFERRED.md). No new art.
  _duckRollFx(dx) {
    const p = this.player; if (!p) return;
    if (this._duckTween) { try { this._duckTween.stop(); } catch (_) {} }
    p.setScale(1, 1).setAngle(0);
    const lean = dx > 0 ? 16 : dx < 0 ? -16 : 0;
    this._duckTween = this.tweens.add({ targets: p, duration: COMBAT.DODGE_DURATION_MS / 2, ease: 'Quad.out',
      scaleX: 1.16, scaleY: 0.72, angle: lean, yoyo: true,
      onComplete: () => { try { p.setScale(1, 1).setAngle(0); } catch (_) {} this._duckTween = null; } });
  }
  _onPlayerHit(dmg, { fromFront, dir }) {
    const now = this.time.now, r = this.pc.takeDamage(now, dmg, { fromFront });
    if (r.outcome === 'dodged') return;
    if (r.outcome === 'parried') { this.pc.consumeParry(); const a = this.combat.nearest(this.player); if (a) this.combat.stagger(a); this._sfx('sfx_hit', 0.85); this._hitFreeze = COMBAT.HIT_FREEZE_FRAMES + 3; this.cameras.main.shake(160, COMBAT.SHAKE_HIT); return; }
    const blocked = r.outcome === 'blocked';
    this.inv.hp = Math.max(0, this.inv.hp - r.taken);
    if (!blocked) this._bloodFx(this.player.x, this.player.y, this.inv.hp <= 0);   // the player bleeds too (gore modifier, item 2)
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
  // REGION MUSIC bed — a looped track per region, CROSSFADED on region change, LAYERED OVER the
  // ambient (separate sound object), gated by the MUSIC volume slider (separate from SFX, which is
  // always-present). Region→mood mapping per EXCELLENCE-FRAMEWORK: green=warm/pastoral, Peaks=stark/
  // cold, Marsh=eerie. No-ops gracefully if the track file isn't loaded (then no music, ambient+SFX
  // carry the soundscape) — so the system is safe before the CC0 beds land.
  _musicForRegion(R) {
    if (!R) return 'mus_green';                                   // the belt/foothill = the green pastoral
    if (R.interior) {                                             // INTERIOR beds (SPEC-INTERIORS d) — set on entry
      const k = R.key;
      if (k === 'lost_cemetery') return 'mus_cemetery';
      if (k === 'gh_chapel' || k === 'dgn_shrine') return 'mus_sacral';   // chapel + the shrine share the sacral bed
      if (k === 'tankard_f1' || k === 'tankard_f2') return 'mus_tavern';
      if (/^cave_|dgn_keep/.test(k)) return 'mus_dungeon';
      if (R.settlement) return 'mus_town';                        // village/town/city scenes
      return 'mus_home';                                          // homes / huts / shops — the shared indoor bed
    }
    if (R.mountain) return 'mus_peaks';
    if (R.key === 'AshenMarsh' || R.marsh || R.bog || R.key === 'Marsh') return 'mus_marsh';
    if (R.key === 'Coast' || R.coast) return 'mus_coast';
    if (R.key === 'Emberwood' || R.ember) return 'mus_ember';
    if (R.key === 'Spire') return 'mus_sacral';
    return 'mus_green';
  }
  _setMusic(key) {
    if (this._musKey === key) return; this._musKey = key;
    const a = bindings.options.audio;
    if (this._mus) {                                             // crossfade the OLD out, then free it
      const old = this._mus; this._mus = null;
      this.tweens.killTweensOf(old);   // BUGFIX: stop any in-flight fade-IN first — else it sets volume on a sound the fade-out then destroys ("Cannot set volume on null", which halts the update loop on rapid region-switching)
      this.tweens.add({ targets: old, volume: 0, duration: 800, onComplete: () => { try { this.tweens.killTweensOf(old); old.stop(); old.destroy(); } catch (_) {} } });
    }
    if (!key || !this.cache.audio.exists(key)) return;          // dormant until the bed is loaded — no error
    const target = 0.55 * a.master * a.music;
    this._mus = this.sound.add(key, { loop: true, volume: 0 });
    this._mus.play();
    this.tweens.add({ targets: this._mus, volume: target, duration: 1000 });   // fade the NEW in
  }
  // 2D ITEM-GET flourish (the tool/overhead-pickup FALLBACK — no rigged held layer): a glow + the
  // named item floats up above a point, scales up, fades. Pairs with a banner + a confirm sting.
  // BLOOD & GORE modifier (item 2) — a real, NOTICEABLE blood effect, gated on mods.gore() (off → nothing,
  // so the toggle reads as a clear difference). A persistent ground pool + a burst of droplets; a KILL bleeds
  // far more (bigger pool + more, faster droplets). Was a no-op before: gore() existed but had ZERO call sites.
  _bloodFx(x, y, killed) {
    if (!this.mods || !this.mods.gore()) return;
    const baseDepth = (this.player && this.player.depth) || 0;
    // ground pool — lingers, then fades (the gory residue)
    const pool = this.add.ellipse(x, y + 7, killed ? 32 : 17, killed ? 15 : 8, 0x6e0a0a, 0.85).setDepth(baseDepth - 60);
    this.tweens.add({ targets: pool, alpha: 0, duration: killed ? 4200 : 2200, delay: killed ? 1800 : 700, onComplete: () => { try { pool.destroy(); } catch (_) {} } });
    (this._regionObjs || (this._regionObjs = [])).push(pool);
    // droplet spray
    const cols = [0x8a0d0d, 0xb01818, 0x5a0606], n = killed ? 16 : 8;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 12 + Math.random() * (killed ? 44 : 24);
      const d = this.add.circle(x, y, 1 + Math.random() * 2.4, cols[i % 3], 1).setDepth(baseDepth + 30);
      this.tweens.add({ targets: d, x: x + Math.cos(a) * sp, y: y + Math.sin(a) * sp + 10, alpha: 0,
        duration: 360 + Math.random() * 280, ease: 'Quad.out', onComplete: () => { try { d.destroy(); } catch (_) {} } });
    }
  }

  _itemGetFx(x, y, iconKey = 'ow_orb', tint = 0xffe66d) {
    const glow = this.add.image(x, y - 18, 'ow_orb').setTint(tint).setScale(0.6).setDepth(DEPTH.OVERLAY).setAlpha(0.9);
    const icon = this.cache.obj && this.textures.exists(iconKey) ? this.add.image(x, y - 18, iconKey).setScale(0.5).setDepth(DEPTH.OVERLAY + 1) : null;
    this._sfx('sfx_confirm', 0.8);
    this.tweens.add({ targets: [glow, icon].filter(Boolean), y: y - 46, scale: 1.4, duration: 520, ease: 'Back.out',
      onComplete: () => this.tweens.add({ targets: [glow, icon].filter(Boolean), alpha: 0, duration: 420, delay: 360, onComplete: () => { glow.destroy(); icon && icon.destroy(); } }) });
  }

  // ---- interaction → dialogue branch (mirror the discrete-scene logic) --------
  _npcInteract(n) {
    if (this._dlg || this._shopOpen || this._topicsOpen) return;
    // GUARD + fine owed: talking to the guard IS complying — open the fine dialog now (interactable through the
    // whole confront ladder; a deliberate "I'll settle up" instead of waiting out the comply window).
    if (n.role === 'guard' && this._fineOwed > 0) { this._confront = null; this._guardConfront(null); return; }
    if (n.shop) { this._openShop(n.shop, n.name); return; }   // a keeper at the counter → the buy menu (shop buying v1)
    // an NPC may offer ONE quest (n.quest) OR several (n.quests) — pick the first that's offerable now
    // (so a slice giver can carry GH-arc + childhood quests without clobbering either; Decision A).
    let qid = (n.quest && ['available', 'active'].includes(this.quests.status(n.quest))) ? n.quest
      : (n.quests || []).find((id) => ['available', 'active'].includes(this.quests.status(id)));
    let st = qid ? this.quests.status(qid) : null;
    // A questNode NPC (e.g. Bram at the forge) hosts a LATER beat of a multi-location quest: engage only once
    // the quest is ACTIVE (started by the first giver). While it's merely 'available' here, greet instead —
    // never skip the first beat (the L4 block keeps the player from reaching this beat early anyway).
    // EXCEPTION (`questStart`): when this NPC is the quest's PRIMARY giver AND its questNode IS the opening beat
    // (e.g. Mara starts M2 at her 'chores' briefing), it MUST be allowed to START the available quest — without
    // this, a sole-giver questNode quest could never begin (the M2 "can't find where it starts" root cause).
    if (qid && n.questNode && st === 'available' && !n.questStart) { qid = null; st = null; }
    if (qid && (st === 'available' || st === 'active')) this._startQuestDialogue(qid, n.questNode);
    else if (n.social) this._startDialogue(n.social, n.name);
    else if (n.topics) { this._tallyGreet(n); this._openTopics(n); }   // a named villager with topics → the selectable topic menu
    else if (st === 'complete' && n.done) this._startGreeting(n.name, n.done);
    else if (n.greeting || n.greetByKarma) { this._tallyGreet(n); this._startGreeting(n.name, this._cycleLines(n)); }
    else if (n.done) this._startGreeting(n.name, n.done);
  }
  // L6 — a real GREETING just happened. If the player pledged to "say hello around the square" (M1), tally the
  // distinct villager; once ≥2 have actually been greeted, the greeted_warmly deed + M1 fire (the DOING, not the
  // earlier intent). Greeting nobody (and passing on by) resolves to kept_to_self via _pledgeTick.
  _tallyGreet(n) {
    const p = this._pledge; if (!p || p.kind !== 'greet' || !n || !n.name) return;
    p.greeted.add(n.name);
    if (p.greeted.size >= 2) this._resolvePledge('greeted');
  }
  // REACTIVITY — the greeting reacts to the player's KARMA (warm if good, wary if cruel) + REPEAT-AVOIDANCE
  // rotates which line surfaces on re-talk (+ an occasional bark). Per-NPC index, session-persisted.
  _greetSet(n) {
    // CHILD-DEED ECHO (sys 5 — the Fable trick): an adult NPC remembers what the CHILD did. The first matching
    // deed's lines win; falls through to greetByKarma/greeting. Data: greetByDeed: [{ deed, lines }, ...].
    if (n.greetByDeed && this.karma) {
      for (const e of n.greetByDeed) if (this.karma.hasDeed(e.deed)) return Array.isArray(e.lines) ? e.lines : [e.lines];
    }
    if (n.greetByKarma) {
      const m = (this.karma ? this.karma.morality : 0) || 0;
      const tier = m >= 15 ? 'good' : m <= -15 ? 'bad' : 'neutral';
      const set = n.greetByKarma[tier] || n.greetByKarma.neutral || [];
      return Array.isArray(set) ? set : [set];
    }
    return Array.isArray(n.greeting) ? n.greeting : [n.greeting];
  }
  _cycleLines(n) {
    this._npcSaid = this._npcSaid || {};
    const lines = this._greetSet(n);
    const i = (this._npcSaid[n.name] = ((this._npcSaid[n.name] | 0) + 1));
    const pick = [lines[(i - 1) % lines.length]];
    if (n.bark && i % 3 === 0) pick.push(n.bark);   // every 3rd talk, an overheard bark
    return pick;
  }
  // ---- DIALOG TOPIC MENU (selectable topics, like the buy UI) ----------------------------------------
  _openTopics(n) {
    if (this._dlg || this._shopOpen || this._topicsOpen) return;
    Movement.stop(this.player); this._topicsOpen = true; this._topicNpc = n; this._topicSel = 0; this._npcSaid = this._npcSaid || {};
    if (this.hud2) this.hud2.setVisible(false); if (this._helpText) this._helpText.setVisible(false);
    if (this._topicBox) this._topicBox.destroy(true);
    this._topicBox = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 13);
    const bg = this.add.rectangle(20, 60, 728, 300, 0x0c1410, 0.96).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0);
    this._topicTitle = this.add.text(34, 70, n.name || '', { fontFamily: 'monospace', fontSize: '15px', color: '#9fd8a0', fontStyle: 'bold' }).setScrollFactor(0);
    this._topicSaid = this.add.text(34, 96, this._cycleLines(n).join('  '), { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0', wordWrap: { width: 700 } }).setScrollFactor(0);
    this._topicHint = this.add.text(34, 336, '↑↓ choose · E ask · B/Q close', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this._topicBox.add([bg, this._topicTitle, this._topicSaid, this._topicHint]);
    this._topicOpts = [...(n.topics || []).map((t) => t.q), 'Leave.'];
    this._topicRows = [];
    for (let i = 0; i < this._topicOpts.length; i++) { const t = this.add.text(40, 200 + i * 24, '', { fontFamily: 'monospace', fontSize: '14px', color: '#cfe8d6' }).setScrollFactor(0); this._topicRows.push(t); this._topicBox.add(t); }
    this._registerUIPanel(this._topicBox, 20, 60, 728, 300);   // on the zoom-1 uiCamera, clamped on-screen
    this._renderTopics();
  }
  _renderTopics() {
    if (!this._topicsOpen) return;
    this._topicRows.forEach((t, i) => { const sel = i === this._topicSel; t.setText(`${sel ? '▶ ' : '  '}${this._topicOpts[i]}`); t.setColor(sel ? '#ffe66d' : '#cfe8d6'); });
  }
  _topicNav(d) { if (!this._topicsOpen) return; this._topicSel = Phaser.Math.Clamp(this._topicSel + d, 0, this._topicOpts.length - 1); this._renderTopics(); }
  _topicPick() {
    if (!this._topicsOpen) return; const n = this._topicNpc, topics = n.topics || [];
    if (this._topicSel >= topics.length) { this._closeTopics(); return; }   // "Leave."
    const topic = topics[this._topicSel];
    // a topic can OPEN the real list+sell shop (a keeper who also gives quests/topics, e.g. Hodge) — close the
    // topic menu and open the shop UI (the systemic "shops show a list + sell" path).
    if (topic.openshop) { this._closeTopics(); this._openShop(topic.openshop, n.name); return; }
    const ans = Array.isArray(topic.a) ? topic.a : [topic.a];   // REPEAT-AVOIDANCE: cycle the answer line per (npc,topic)
    const key = `${n.name}:${this._topicSel}`; const i = (this._npcSaid[key] = ((this._npcSaid[key] | 0) + 1));
    this._topicSaid.setText(ans[(i - 1) % ans.length]); this._sfx('sfx_select', 0.4);
  }
  _closeTopics() { if (!this._topicsOpen) return; this._topicsOpen = false; if (this._topicBox) { this._unregisterUIPanel(this._topicBox); this._topicBox.destroy(true); this._topicBox = null; } if (this.hud2) this.hud2.setVisible(true); if (this._helpText) this._helpText.setVisible(true); this._sfx('sfx_select', 0.5); }
  // ---- SHOP BUYING v1 — a keeper's buy menu (E at the counter) -----------------------------------
  _openShop(shopId, keeperName) {
    const sh = shopDef(shopId); if (!sh) return;
    Movement.stop(this.player); this._shopOpen = true; this._shopId = shopId; this._shopSel = 0; this._shopName = sh.name; this._shopRegion = sh.region; this._shopMode = 'buy';
    if (this.hud2) this.hud2.setVisible(false); if (this._helpText) this._helpText.setVisible(false);   // clear the HUD so it doesn't overlap the buy panel
    if (this.shopStock) this.shopStock.maybeRestock(shopId, this.tod ? this.tod.dayCount() : 0, this.time.now);   // shelves refill on the day cadence (real-time fallback while the clock is frozen)
    this._buildShopList();
    // panel — REBUILT each open (its own container so it never collides with dialogue, no stale-cache)
    if (this._shopBox) { this._shopBox.destroy(true); }
    this._shopBox = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 13);
    const bg = this.add.rectangle(20, 60, 728, 300, 0x0c1410, 0.96).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0);
    this._shopTitle = this.add.text(34, 70, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffe66d', fontStyle: 'bold' }).setScrollFactor(0);
    this._shopGold = this.add.text(540, 72, '', { fontFamily: 'monospace', fontSize: '13px', color: '#9fd8a0' }).setScrollFactor(0);
    this._shopHint = this.add.text(34, 336, '', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this._shopBox.add([bg, this._shopTitle, this._shopGold, this._shopHint]);
    this._shopRows = []; this._shopIcons = [];
    for (let i = 0; i < 11; i++) {   // fixed rows (the buy/sell list lengths differ; render into these)
      const ic = this.add.image(48, 100 + i * 22 + 9, 'icon_bread').setScale(0.6).setScrollFactor(0).setVisible(false);   // per-row item picture (eliza-objects), set in _renderShop
      const t = this.add.text(40, 100 + i * 22, '', { fontFamily: 'monospace', fontSize: '14px', color: '#cfe8d6' }).setScrollFactor(0);
      this._shopIcons.push(ic); this._shopRows.push(t); this._shopBox.add(ic); this._shopBox.add(t);
    }
    this._registerUIPanel(this._shopBox, 20, 60, 728, 300);   // on the zoom-1 uiCamera, clamped on-screen
    this._renderShop();
  }
  // WS3.9 — build the active list for the shop's MODE. buy = the keeper's stock; sell = the player's items the
  // shop will buy (anything with real value > 0 — keepsakes like the wooden_toy, value 0, are never bought).
  _buildShopList() {
    if (this._shopMode === 'sell') {
      this._shopStock = Object.keys(this.inv.items || {}).map((id) => {
        const it = itemDef(id); return it && it.value > 0 ? { id, name: it.name, price: sellPrice(id, this._shopRegion, 5), have: this.inv.items[id] } : null;
      }).filter(Boolean);
    } else {
      this._shopStock = availableStock(this._shopId, { inv: this.inv, karma: this.karma }).map((id) => {
        const it = itemDef(id); return { id, name: it ? it.name : id, price: buyPrice(id, this._shopRegion, 5), qty: this.shopStock ? this.shopStock.qtyOf(this._shopId, id) : 99 };
      });
    }
    this._shopSel = Phaser.Math.Clamp(this._shopSel, 0, Math.max(0, this._shopStock.length - 1));
  }
  _shopToggleMode() { if (!this._shopOpen) return; this._shopMode = this._shopMode === 'buy' ? 'sell' : 'buy'; this._shopSel = 0; this._buildShopList(); this._sfx('sfx_select', 0.5); this._renderShop(); }
  _renderShop() {
    if (!this._shopOpen) return;
    const sell = this._shopMode === 'sell';
    this._shopTitle.setText(`${this._shopName}    ${sell ? '[ SELL ]  ·  buy (TAB)' : '[ BUY ]  ·  sell (TAB)'}`);   // the BUY/SELL toggle is always visible + labelled
    this._shopGold.setText(`Your gold: ${this.inv.gold}g`);
    this._shopHint.setText(`↑↓ choose · E ${sell ? 'sell' : 'buy'} · TAB ${sell ? 'buy' : 'sell'} · B/Q close`);
    this._shopRows.forEach((t, i) => {
      const s = this._shopStock[i];
      const ic = this._shopIcons[i];
      if (!s) { t.setText(''); if (ic) ic.setVisible(false); return; }
      // per-row picture (eliza-objects) when we have one; else the row just indents back + shows the name
      const key = itemIconKey(s.id);
      if (ic) { if (key) { ic.setTexture(key).setVisible(true); } else ic.setVisible(false); }
      t.setX(key ? 64 : 40);
      const sel = i === this._shopSel;
      if (sell) {
        t.setText(`${sel ? '▶ ' : '  '}${s.name.padEnd(20)} ${String(s.price).padStart(3)}g   (have ${s.have})`);
        t.setColor(sel ? '#ffe66d' : '#cfe8d6');
      } else {
        const qty = this.shopStock ? this.shopStock.qtyOf(this._shopId, s.id) : (s.qty ?? 99);
        const out = qty <= 0, afford = this.inv.gold >= s.price && !out;
        const owned = this.inv.items[s.id] ? `  (have ${this.inv.items[s.id]})` : '';
        t.setText(`${sel ? '▶ ' : '  '}${s.name.padEnd(20)} ${String(s.price).padStart(3)}g${out ? '  (out)' : `  x${qty}`}${owned}`);
        t.setColor(out ? '#6b6b6b' : sel ? '#ffe66d' : afford ? '#cfe8d6' : '#8a6b6b');
      }
    });
    if (!this._shopStock.length) this._shopRows[0].setText(sell ? '  (nothing to sell)' : '  (nothing in stock)').setColor('#6b6b6b');
  }
  _shopNav(d) { if (!this._shopOpen || !this._shopStock.length) return; this._shopSel = Phaser.Math.Clamp(this._shopSel + d, 0, this._shopStock.length - 1); this._renderShop(); }
  // WS3.9 — SELL the selected held item at the shop's margin; persists gold + inventory (+ unequips if the last
  // copy of an equipped item is sold). Mirrors _shopBuy.
  _shopSell() {
    if (!this._shopOpen) return; const s = this._shopStock[this._shopSel]; if (!s) return;
    if (!this.inv.has(s.id)) { this._sfx('sfx_deny', 0.8); this._banner('You no longer have that.', 1200); return; }
    this.inv.remove(s.id, 1); this.inv.addGold(s.price);
    for (const slot of ['weapon', 'shield', 'body', 'trinket']) if (this.inv.equipped(slot) === s.id && !this.inv.has(s.id)) this.inv.unequip(slot);   // sold the last one → take it off
    if (this.inv.save) this.inv.save();
    this._sfx('sfx_coin', 0.8); this._banner(`Sold ${s.name} for ${s.price}g.`, 1300);
    this._buildShopList(); this._renderShop();
  }
  _shopBuy() {
    if (!this._shopOpen) return; const s = this._shopStock[this._shopSel]; if (!s) return;
    // AGE-GATE (sys 1) — a CHILD can't buy real weapons/armour/shields, EXCEPT childSafe trainers (the wooden
    // practice sword). The rule reads the item flag, not a hardcoded type list (fix the class, not the instance).
    if (this.isChild) { const it = itemDef(s.id); if (it && ['weapon', 'armour', 'shield'].includes(it.type) && !it.childSafe) { this._sfx('sfx_deny', 0.8); this._banner('"That\'s no toy for a child," the keeper says, and won\'t sell it.', 1800); return; } }
    if (this.shopStock && !this.shopStock.inStock(this._shopId, s.id)) { this._sfx('sfx_deny', 0.8); this._banner(`${s.name} is sold out — come back tomorrow.`, 1400); return; }
    if (this.inv.gold < s.price) { this._sfx('sfx_deny', 0.8); this._banner('Not enough gold.', 1200); return; }
    if (this.shopStock && !this.shopStock.take(this._shopId, s.id)) { this._sfx('sfx_deny', 0.8); this._banner(`${s.name} is sold out — come back tomorrow.`, 1400); return; }   // depletes the shelf
    this.inv.addGold(-s.price); this.inv.add(s.id, 1);
    if (this.inv.save) this.inv.save(); else this._save && this._save();   // persist the purchase
    if (this.save && this.save.save) this.save.save();                     // persist the depleted shelf (shopstock rides the world save)
    this._sfx('sfx_coin', 0.8); this._banner(`Bought ${s.name} for ${s.price}g.`, 1300); this._renderShop();   // coin clink (WS3)
  }
  _closeShop() { if (!this._shopOpen) return; this._shopOpen = false; if (this._shopBox) { this._unregisterUIPanel(this._shopBox); this._shopBox.destroy(true); this._shopBox = null; } if (this.hud2) this.hud2.setVisible(true); if (this._helpText) this._helpText.setVisible(true); this._sfx('sfx_select', 0.5); }

  // ===========================================================================
  // GAME MENU (Esc) — Zelda-style screens: Items · Gear & Stats · Map · Settings.
  // A uiCamera overlay (panel laws: registered + clamped); the world is frozen while open (movement gated via
  // _menuOpen in dlgOpen). Keyboard: ←→ tab · ↑↓ scroll the item list · Enter (Settings) · B/Q/Esc close.
  // ===========================================================================
  _openMenu() {
    if (this._menuOpen || this._dlg || this._shopOpen || this._topicsOpen) return;
    this._menuOpen = true; this._menuTab = 0; this._menuScroll = 0; Movement.stop(this.player);
    if (this.hud2) this.hud2.setVisible(false); if (this._helpText) this._helpText.setVisible(false);
    const W = 728, H = 372, X = 20, Y = 30, OD = DEPTH.OVERLAY;
    this._menuBox = this.add.container(0, 0).setScrollFactor(0).setDepth(OD + 13);
    const bg = this.add.rectangle(X, Y, W, H, 0x0b0f17, 0.97).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a).setScrollFactor(0);
    this._menuBg = bg;
    // OPAQUE header strip behind the tab bar — stays visible on the Map tab (where the big panel bg hides) so the
    // tabs read clearly over the map AND it covers the map's own top labels. The persistent tab bar is what keeps
    // the menu from ever LOOKING closed on Map.
    this._menuTabBg = this.add.rectangle(X, Y, W, 34, 0x0b0f17, 1).setOrigin(0, 0).setScrollFactor(0);
    this._menuTabsTxt = this.add.text(X + 18, Y + 9, '', { fontFamily: 'monospace', fontSize: '16px', color: '#cfc3a8', fontStyle: 'bold' }).setScrollFactor(0);
    this._menuBody = this.add.text(X + 18, Y + 52, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0', wordWrap: { width: W - 40 }, lineSpacing: 5 }).setScrollFactor(0);
    this._menuHint = this.add.text(X + 18, Y + H - 26, '←→ tab · ↑↓ scroll · Enter (Settings) · B/Esc close', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this._menuBox.add([bg, this._menuTabBg, this._menuTabsTxt, this._menuBody, this._menuHint]);   // all CHILDREN of the box (one registered panel)
    // Items tab — per-row PICTURE (eliza-objects) + label, populated in _renderMenu. Hidden on other tabs.
    this._menuRows = []; this._menuIcons = []; this._menuRowY0 = Y + 96; this._menuRowH = 23;
    for (let i = 0; i < 11; i++) {
      const ic = this.add.image(X + 30, this._menuRowY0 + i * this._menuRowH + 9, 'icon_bread').setScale(0.62).setScrollFactor(0).setVisible(false);
      const t = this.add.text(X + 50, this._menuRowY0 + i * this._menuRowH, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0' }).setScrollFactor(0).setVisible(false);
      this._menuIcons.push(ic); this._menuRows.push(t); this._menuBox.add(ic); this._menuBox.add(t);
    }
    // DESCRIPTION / COMPARE line at the bottom of the panel — the selected item's note (Items list) or its
    // description + stat-compare (Equip/Use/Drop action sub-panel). One shared text, repopulated per render.
    this._menuDesc = this.add.text(X + 18, Y + H - 78, '', { fontFamily: 'monospace', fontSize: '13px', color: '#bfe6ff', wordWrap: { width: W - 40 }, lineSpacing: 3 }).setScrollFactor(0).setVisible(false);
    this._menuBox.add(this._menuDesc);
    this._itemSel = 0; this._itemActionOpen = false; this._itemActionSel = 0; this._itemActions = null;   // Items-tab action dispatcher state
    this._registerUIPanel(this._menuBox, X, Y, W, H);
    this._sfx('sfx_select', 0.5); this._renderMenu();
  }
  _closeMenu() {
    if (!this._menuOpen) return; this._menuOpen = false;
    if (this._menuBox) { this._unregisterUIPanel(this._menuBox); this._menuBox.destroy(true); }
    this._menuBox = this._menuTabsTxt = this._menuHint = this._menuBody = this._menuDesc = null;
    this._menuRows = null; this._menuIcons = null; this._itemActionOpen = false; this._itemActions = null;
    if (this._fullMap) { this._fullMap.setVisible(false).setDepth(DEPTH.OVERLAY + 2); }
    if (this._fullMapTitle) this._fullMapTitle.setVisible(true);   // restore the header for the standalone M/O world map
    if (this.hud2) this.hud2.setVisible(!this._hudHidden); if (this._helpText) this._helpText.setVisible(true);
    this._sfx('sfx_select', 0.5);
  }
  _menuNav(d) { if (!this._menuOpen || this._itemActionOpen) return; this._menuTab = (this._menuTab + d + 4) % 4; this._menuScroll = 0; this._itemSel = 0; this._sfx('sfx_select', 0.4); this._renderMenu(); }   // ←→ is locked while an item action panel is open (E/B drive it)
  // UP/DOWN: in the item ACTION sub-panel → move the action cursor; on the Items LIST → move the item cursor
  // (auto-scrolling the 9-row window); elsewhere → nothing.
  _menuScrollBy(d) {
    if (!this._menuOpen) return;
    if (this._itemActionOpen) { const n = (this._itemActions || []).length; if (n) this._itemActionSel = (this._itemActionSel + d + n) % n; this._sfx('sfx_select', 0.3); this._renderMenu(); return; }
    if (this._menuTab !== 0) return;
    const ids = Object.keys(this.inv.items || {}); if (!ids.length) return;
    this._itemSel = Phaser.Math.Clamp((this._itemSel || 0) + d, 0, ids.length - 1);
    if (this._itemSel < this._menuScroll) this._menuScroll = this._itemSel;
    else if (this._itemSel >= this._menuScroll + ITEM_ROWS) this._menuScroll = this._itemSel - (ITEM_ROWS - 1);
    this._sfx('sfx_select', 0.3); this._renderMenu();
  }
  // E/Enter: Settings tab → open settings; Items tab → open the action sub-panel for the selected item, or (if
  // already open) DO the highlighted action (Equip/Unequip/Use/Drop/Compare).
  _menuActivate() {
    if (!this._menuOpen) return;
    if (this._menuTab === 3) { this._openSettings(); return; }
    if (this._menuTab !== 0) return;
    if (this._itemActionOpen) { this._doItemAction(); return; }
    const ids = Object.keys(this.inv.items || {}); const id = ids[this._itemSel || 0]; if (!id) return;
    this._itemActions = this._itemActionsFor(id); this._itemActionSel = 0; this._itemActionOpen = true;
    this._sfx('sfx_select', 0.5); this._renderMenu();
  }
  // INVENTORY-ACTION DISPATCHER — the verbs available on an item, resolved by its type + slot (one dispatcher,
  // not per-item handlers; mirrors the world interaction-verb system). Equippables EQUIP/COMPARE; food/heal
  // consumables USE; everything but a key item can be DROPped.
  _itemActionsFor(id) {
    const it = itemDef(id); const acts = [];
    if (it.equipSlot) { acts.push(this.inv.equipped(it.equipSlot) === id ? 'Unequip' : 'Equip'); acts.push('Compare'); }
    if (it.type === 'food' || (it.type === 'consumable' && (it.effects || []).some((e) => e.heal))) acts.push('Use');
    if (it.type !== 'key') acts.push('Drop');
    return acts.length ? acts : ['Drop'];
  }
  _doItemAction() {
    const ids = Object.keys(this.inv.items || {}); const id = ids[this._itemSel || 0];
    if (!id) { this._itemActionOpen = false; this._renderMenu(); return; }
    const it = itemDef(id), act = (this._itemActions || [])[this._itemActionSel];
    if (act === 'Compare') { this._sfx('sfx_select', 0.3); this._renderMenu(); return; }   // compare just shows the delta; stay in the panel
    if (act === 'Equip') { this.inv.equip(id); this._syncEquipVisual(); this._sfx('sfx_confirm', 0.6); this._banner(`Equipped ${it.name}.`, 1200); }
    else if (act === 'Unequip') { this.inv.unequip(it.equipSlot); this._syncEquipVisual(); this._sfx('sfx_select', 0.5); this._banner(`Unequipped ${it.name}.`, 1200); }
    else if (act === 'Use') { this._useItem(id); }
    else if (act === 'Drop') { this.inv.remove(id, 1); if (this.inv.equipped(it.equipSlot) === id && !this.inv.has(id)) this.inv.unequip(it.equipSlot), this._syncEquipVisual(); this._sfx('sfx_select', 0.4); this._banner(`Dropped ${it.name}.`, 1100); }
    if (this.inv.save) this.inv.save();
    this._itemActionOpen = false; this._itemActions = null;
    const left = Object.keys(this.inv.items || {}); this._itemSel = Phaser.Math.Clamp(this._itemSel || 0, 0, Math.max(0, left.length - 1));
    this._renderMenu();
  }
  // USE a consumable/food — apply heal + food effects, then consume one.
  _useItem(id) {
    const it = itemDef(id); let healed = 0;
    (it.effects || []).forEach((e) => { if (e.heal) { const b = this.inv.hp; this.inv.heal(e.heal); healed += this.inv.hp - b; } if (e.food) this.inv.foodMeter = Math.min(120, (this.inv.foodMeter || 0) + e.food); });
    this.inv.remove(id, 1); this._sfx('sfx_confirm', 0.6);
    this._banner(`Used ${it.name}${healed ? ` (+${healed} HP)` : ''}.`, 1200);
  }
  // Sync the IN-WORLD weapon/shield visual to the inventory loadout (the Character layer rig). One sword/shield
  // visual stands in for every weapon/shield (a distinct wooden-sword sprite is a flagged asset gap). Armour +
  // trinkets change stats but have no body layer yet (flagged).
  _syncEquipVisual() {
    if (!this.player || !this.player.equip) return;
    if (this.inv.equipped('weapon')) this.player.equip('sword'); else this.player.unequip && this.player.unequip('weapon');
    if (this.inv.equipped('shield')) this.player.equip('shield'); else this.player.unequip && this.player.unequip('shield');
  }
  // Stat-DELTA vs the item currently in that slot (the COMPARE verb).
  _compareText(id) {
    const it = itemDef(id); if (!it.equipSlot) return '';
    const sum = (x) => { let a = 0, d = 0; if (x) (itemDef(x).effects || []).forEach((e) => { if (e.atk) a += e.atk; if (e.def) d += e.def; }); return { a, d }; };
    const cur = this.inv.equipped(it.equipSlot), n = sum(id), c = sum(cur), f = (v) => (v >= 0 ? '+' : '') + v;
    return `vs ${cur ? itemDef(cur).name : '(nothing equipped)'}:  ATK ${f(n.a - c.a)}   DEF ${f(n.d - c.d)}`;
  }
  _itemSummary(it) {
    const fx = []; (it.effects || []).forEach((e) => { if (e.atk) fx.push(`ATK +${e.atk}`); if (e.def) fx.push(`DEF +${e.def}`); if (e.heal) fx.push(`heal ${e.heal}`); if (e.food) fx.push(`food +${e.food}`); if (e.block) fx.push(`block ${Math.round(e.block * 100)}%`); });
    return `${it.type}${fx.length ? ' · ' + fx.join(' · ') : ''}`;
  }
  _renderMenu() {
    if (!this._menuOpen) return;
    const TABS = ['Items', 'Gear & Stats', 'Map', 'Settings'];
    this._menuTabsTxt.setText(TABS.map((t, i) => (i === this._menuTab ? '▶ ' : '  ') + t).join('    '));
    const onMap = this._menuTab === 2;
    // Map tab: the full map shows BELOW the menu's tab bar (the box stays VISIBLE, only its opaque bg + body
    // hide), so the tab chrome + hint persist on top and the menu never LOOKS closed (the nav-bug fix).
    if (this._fullMap) this._fullMap.setVisible(onMap).setDepth(DEPTH.OVERLAY + 12);
    this._menuBox.setVisible(true);                          // tab bar + hint must persist on EVERY tab
    if (this._menuBg) this._menuBg.setVisible(!onMap);       // hide only the opaque panel backdrop on Map → the map shows through
    this._menuBody.setVisible(!onMap);
    if (this._fullMapTitle) this._fullMapTitle.setVisible(false);   // the menu tab bar is the header in-menu
    if (onMap && this._menuHint) this._menuHint.setText('←→ tab · B/Esc close');
    const nm = (id) => { if (!id) return '(none)'; try { return itemDef(id).name; } catch (_) { return id; } };
    // hide the per-row item pictures/labels by default; only the Items tab repopulates them
    (this._menuRows || []).forEach((t) => t.setVisible(false));
    (this._menuIcons || []).forEach((ic) => ic.setVisible(false));
    if (this._menuDesc) this._menuDesc.setVisible(false);
    let body = '';
    if (this._menuTab === 0) {
      const ids = Object.keys(this.inv.items || {});
      this._itemSel = Phaser.Math.Clamp(this._itemSel || 0, 0, Math.max(0, ids.length - 1));
      if (this._itemActionOpen && ids[this._itemSel]) {
        // ACTION SUB-PANEL — the inventory-action dispatcher (Equip/Unequip/Use/Drop/Compare) for the selected item.
        const id = ids[this._itemSel], it = itemDef(id);
        body = `${it.name}  ×${this.inv.items[id]}`;
        (this._itemActions || []).forEach((a, i) => {
          const t = this._menuRows[i], ic = this._menuIcons[i]; if (!t) return; const sel = i === this._itemActionSel;
          if (ic) ic.setVisible(false);
          t.setText(`${sel ? '▶ ' : '  '}${a}`).setColor(sel ? '#ffe66d' : '#cfe8d6').setVisible(true);
        });
        if (this._menuDesc) this._menuDesc.setText(`${it.note || this._itemSummary(it)}${it.equipSlot ? '\nCompare ' + this._compareText(id) : ''}`).setVisible(true);
        if (this._menuHint) this._menuHint.setText('↑↓ action · E do · B back');
      } else {
        body = `Gold:  ${this.inv.gold}g       Carried: ${this.inv.count()} item(s)`;
        if (!ids.length) body += '\n\n  (empty — no items yet)';
        ids.slice(this._menuScroll, this._menuScroll + ITEM_ROWS).forEach((id, i) => {
          const key = itemIconKey(id), t = this._menuRows[i], ic = this._menuIcons[i];
          const sel = (this._menuScroll + i) === this._itemSel;
          const eq = ['weapon', 'shield', 'body', 'trinket'].some((s) => this.inv.equipped(s) === id) ? '  (worn)' : '';
          if (key) ic.setTexture(key).setVisible(true); else ic.setVisible(false);   // picture when we have one; else a bullet
          t.setText(`${sel ? '▶ ' : '  '}${key ? '' : '• '}${nm(id)}  ×${this.inv.items[id]}${eq}`).setColor(sel ? '#ffe66d' : '#e8f5e0').setVisible(true);
        });
        const selId = ids[this._itemSel];
        if (selId && this._menuDesc) this._menuDesc.setText(`${itemDef(selId).note || this._itemSummary(itemDef(selId))}`).setVisible(true);
        if (this._menuHint) this._menuHint.setText(`↑↓ select · E actions · ←→ tab · B close${ids.length > this._menuScroll + ITEM_ROWS ? `   (↓ ${ids.length - this._menuScroll - ITEM_ROWS} more)` : ''}`);
      }
    } else if (this._menuTab === 1) {
      const st = this.inv.stats(), ks = this.karma.getStatus();
      body = `WORN / HELD\n  Weapon:  ${nm(this.inv.equipped('weapon'))}\n  Shield:  ${nm(this.inv.equipped('shield'))}\n\n`
        + `STATS\n  HP:   ${this.inv.hp} / ${st.maxHp}\n  ATK:  ${st.atk}      DEF:  ${st.def}\n\n`
        + `STANDING\n  Morality:  ${ks.morality >= 0 ? '+' : ''}${ks.morality}  (${ks.moralityTier})\n  Purity:    ${ks.purity >= 0 ? '+' : ''}${ks.purity}  (${ks.purityTier})\n  Gold:      ${this.inv.gold}g`;
    } else if (this._menuTab === 3) {
      body = 'SETTINGS\n\n  Press Enter to open the full settings menu:\n  controls · audio · invert aim · threat indicators ·\n  objective arrow · modifiers.';
    }
    this._menuBody.setText(body);
  }

  // ===========================================================================
  // DIALOGUE (minimal but real — reuses the Dialogue engine + Social gating;
  // the polished box/portrait is RegionScene's, deferred to the polish pass)
  // ===========================================================================
  _dlgCtx() { return { inv: this.inv, karma: this.karma, quests: this.quests, engine: this.quests, onSet: (cmd) => this._onDlgSet(cmd), onPledge: (opt) => this._onPledge(opt) }; }   // engine: a `choice:{quest,id}` fires the quest fork; onPledge: a `defer:true` option pledges the choice to the ACTION (L6)

  // DIALOGUE TEMPLATING — {price:itemId} → the live buy price (region-adjusted). Ported from RegionScene: the game
  // runs on OverworldScene, where it was MISSING, so dialogue-shop tokens (Bram's steel sword) rendered LITERALLY
  // as "(Price)". Applied to every node's text + every option label.
  _template(str) {
    if (!str) return str;
    const region = (this.region && this.region.key) || 'Greenhollow';
    return String(str).replace(/\{price:(\w+)\}/g, (_, id) => String(buyPrice(id, region, 5)));
  }
  // A dialogue-shop BUY (e.g. Bram's `set:'buy:steel_sword'`) — OverworldScene had no handler, so the purchase
  // was a silent no-op. Buys at the live price, honours the child weapon age-gate, persists.
  _dlgBuy(itemId) {
    const it = itemDef(itemId); if (!it) return;
    if (this.isChild && ['weapon', 'armour', 'shield'].includes(it.type) && !it.childSafe) { this._sfx('sfx_deny', 0.8); this._banner('"That\'s no blade for a child," he says, and won\'t sell it.', 1800); return; }
    const price = buyPrice(itemId, (this.region && this.region.key) || 'Greenhollow', 5);
    if (this.inv.gold < price) { this._sfx('sfx_deny', 0.8); this._banner('Not enough gold.', 1200); return; }
    this.inv.addGold(-price); this.inv.add(itemId, 1); if (this.inv.save) this.inv.save();
    this._sfx('sfx_coin', 0.8); this._banner(`Bought ${it.name} for ${price}g.`, 1400);
  }

  // L6 ACTION-BASED KARMA — a deferred dialogue option records the PLEDGE (which fork the player intends) but
  // does NOT move karma/deeds yet. The deed fires from the ACTION handler when the doing actually happens.
  _onPledge(opt) {
    const c = opt.choice || {};
    this._pledge = { quest: c.quest, id: c.id, kind: opt.pledge, greeted: new Set(), spotX: this.player.x, spotY: this.player.y };
    if (c.quest === 'M1' && this.quests.step['M1'] === 1) { this.quests.advance('M1'); this._refreshTracker && this._refreshTracker(); }   // step 1 forge → 2 'Say hello around the square'
    if (opt.pledge === 'greet') this._banner('Say hello around the square.', 2200);
    else this._banner('You keep your head down, and pass on by.', 2000);
  }
  // Fire a pending pledge's choice + complete its quest — called from the action handlers (a real greeting
  // happened / you passed on by). Exactly-once via clearing the pledge.
  _resolvePledge(reason) {
    const p = this._pledge; if (!p) return; this._pledge = null;
    if (this.quests.status(p.quest) === 'active') {
      this.quests.choose(p.quest, p.id);            // NOW the karma/deed moves (the action occurred)
      this.quests.complete(p.quest); this._grantQuestReward(p.quest);
    }
    this._refreshTracker && this._refreshTracker();
  }
  // L6 — the "keep your head down and pass by" pledge resolves to kept_to_self once the player has actually
  // PASSED BY (walked ~6 tiles from where they pledged). The doing = moving on without greeting.
  _pledgeTick() {
    const p = this._pledge; if (!p || p.kind !== 'ignore') return;
    if (Math.hypot(this.player.x - p.spotX, this.player.y - p.spotY) > 6 * TILE) this._resolvePledge('passed-by');
  }
  _onDlgSet(cmd) {
    if (typeof cmd !== 'string') return;
    if (cmd.startsWith('door:')) this._doorAction(cmd.slice(5));
    else if (cmd.startsWith('fine:')) this._fineAction(cmd.slice(5));
    else if (cmd.startsWith('sfx:')) this._sfx('sfx_' + cmd.slice(4), 0.55);   // WS3: a dialogue option fires a sound (e.g. a knock)
    // QUEST go-and-do (item 7a): a worldDriven quest advances its tracked step / completes from a dialogue
    // option — so a multi-stop errand (accept here, do the thing there) works on the existing engine.
    else if (cmd.startsWith('advance:')) { const q = cmd.slice(8); if (this.quests.status(q) === 'active') { this.quests.advance(q); this._refreshTracker && this._refreshTracker(); } }
    else if (cmd.startsWith('complete:')) { const q = cmd.slice(9); if (this.quests.status(q) === 'active') { this.quests.complete(q); this._grantQuestReward(q); } }
    else if (cmd.startsWith('buy:')) this._dlgBuy(cmd.slice(4));   // a single-item dialogue purchase
    // OPEN the real list+sell shop UI from a dialogue/topic option — the systemic fix for "shops show no list/no
    // sell": a keeper who ALSO gives quests/topics (Bram, Hodge) opens the full _openShop list via this command,
    // instead of a one-line dialogue buy. Deferred a tick so the closing dialogue doesn't swallow the new panel.
    else if (cmd.startsWith('openshop:')) { const id = cmd.slice(9), nm = this._dlg && this._dlg.speaker; this._cancelDialogue && this._cancelDialogue(); this.time.delayedCall(10, () => { if (!this._shopOpen && !this._dlg) this._openShop(id, nm); }); }
  }

  // DOOR-SYSTEM — the CLOSED / LOCKED entry choice (the morality entrance). Walking into a shut door ALWAYS
  // offers KNOCK / TRY-THE-HANDLE; a LOCKED one then offers BREAK-IT-DOWN. Try-uninvited = a small morality
  // hit; force = a bigger hit + an alarm. Built on the Dialogue option system (deeds + the onSet action).
  _openDoorChoice(d) {
    this._pendingDoor = d;
    this._lastTile = { tx: d.tx, ty: d.ty };   // STEP-AWAY fix: mark the doorway tile as "current" so closing the menu (step-away) on it does NOT re-open — you must step off + back on
    const who = d.owner ? `${d.owner}'s ` : 'The ';
    const occupied = this._isOccupied(d.to); d._occupied = occupied;   // someone home? → knock gets a reply; entering uninvited is a worse deed
    const knockText = occupied ? 'You knock. A voice from inside — "A moment!" — footsteps approach.' : 'You knock. Nobody answered.';
    const enter = (mode) => `door:${mode}`;     // onSet command → _doorAction (uses this._pendingDoor)
    const hasKey = !!(d.key && this.inv && this.inv.has(d.key));
    let nodes;
    if (d.state === 'locked') {
      const lockedOpts = [];
      if (hasKey) lockedOpts.push({ label: 'Use your key', set: enter('key'), end: true });
      if (!this.isChild) lockedOpts.push({ label: `Break it down${(d.breakStrength || 1) > 1 ? ' (it looks sturdy)' : ''}`, set: enter('force'), end: true });   // age-gate (sys 1): a CHILD can't break a door
      lockedOpts.push({ label: '(Leave it.)', end: true });
      nodes = {
        d0: { speaker: '', text: `${who}door is locked${hasKey ? ' — but you have a key that might fit' : ' tight'}.`, options: [
          { label: 'Knock', to: 'knock', set: 'sfx:knock' },
          { label: 'Try the handle', to: 'locked' },
          { label: '(Step away.)', end: true },
        ] },
        knock: { speaker: '', text: knockText, options: [{ label: '(Back.)', to: 'd0' }] },
        locked: { speaker: '', text: "It won't budge — locked fast.", options: lockedOpts },
      };
    } else {
      nodes = {
        d0: { speaker: '', text: `${who}door is shut.`, options: [
          { label: 'Knock', to: 'knock', set: 'sfx:knock' },
          { label: 'Try the handle (let yourself in)', set: enter('uninvited'), end: true },
          { label: '(Step away.)', end: true },
        ] },
        knock: { speaker: '', text: knockText, options: [{ label: '(Back.)', to: 'd0' }] },
      };
    }
    this._activeQuest = null; this._dlg = new Dialogue({ start: 'd0', nodes }, this._dlgCtx()); this._openDlg();
  }
  // Is the interior behind this door OCCUPIED right now? (a resident NPC lives there.) Drives the knock
  // response + a HARSHER deed for entering/breaking-in while someone is home (SPEC-INTERIORS finding 5).
  _isOccupied(toKey) { const R = REGIONS.find((r) => r.key === toKey); return !!(R && R.npcs && R.npcs.length); }
  _doorAction(mode) {
    const d = this._pendingDoor; this._pendingDoor = null; if (!d) return;
    const occupied = !!d._occupied;
    if (mode === 'uninvited') {
      if (occupied) { this.karma.commit({ deed: 'entered_occupied_home', morality: -7, purity: -5 }); this._banner('You walk in while they are home. They saw you.', 1600); this._addFine(40, 'walking into an occupied home'); }   // WITNESSED → fineable
      else { this.karma.commit({ deed: 'entered_uninvited', morality: -3, purity: -2 }); this._banner('You let yourself in, uninvited.', 1400); }   // empty + quiet → no witness, no fine
    }
    else if (mode === 'force') { const s = d.breakStrength || 1; const o = occupied ? 1 : 0; this.karma.commit({ deed: 'forced_entry', morality: -(6 + 4 * s + 5 * o), purity: -(4 + 2 * s + 3 * o) }); this._sfx('sfx_charge_impact', 0.6); this._banner(occupied ? 'You break in while they are home — a scream inside.' : 'You force the door — wood splinters. Someone will have heard.', 1800);
      const [bcx, bcy] = cidOf(d.doorWX, d.doorWY); this.save.setChunkFlag(bcx, bcy, 'door_broken_' + d.to, 1);   // BROKEN persists; the repair worker restores it
      this._registerBrokenDoor(d);                                   // REPAIR-WORKER event: a joiner comes to mend it
      this._addFine(60 + 30 * o, 'forcing a door');                  // ALARM → fineable (worse if occupied)
      this._emitNoise(d.dcx, d.dcy + TILE, GUARD_HEARING.FORCE_DOOR_PX * (d.breakStrength || 1), 'forcing a door'); }   // NOISE radiates from the walkable threshold → in-earshot guards come to investigate
    else if (mode === 'key') { if (d.key) this.inv.remove(d.key, 1); this._banner('The key turns; the door swings open.', 1400); }
    this._openDoorVisual(d);                              // the door VISIBLY opens (sprite swaps to the threshold)
    const ret = { x: d.dcx, y: d.dcy + TILE };           // clean yard return (no stuck-on-line)
    this.time.delayedCall(DOOR.CHOICE_ENTER_REVEAL_MS, () => this._enterArea(d.to, ret));   // let the OPEN read before walking through
  }
  // ---- REACTIVITY: GUARD CONFRONT + FINE -------------------------------------------------------------
  // A WITNESSED/ALARMED crime adds to the fine owed (escalating with each offence). The next time a guard
  // gets close, they confront the player → pay (gold) or a warning if broke; refuse keeps it owed (escalates).
  _addFine(base, reason) {
    this._offenseCount = this._offenseCount | 0;
    const fine = Math.round(base * (1 + 0.5 * this._offenseCount));
    this._fineOwed = (this._fineOwed | 0) + fine; this._fineReason = reason; this._offenseCount++;
    this._banner(`A guard marked that — ${fine}g fine owed.`, 1800);
  }
  _guardConfront(guard) {
    if (this._dlg || this._shopOpen || !(this._fineOwed > 0)) return;
    this._guardBusy = true; this._guardCooldown = this.time.now + 8000;
    const fine = this._fineOwed, canPay = this.inv.gold >= fine;
    const nodes = {
      d0: { speaker: 'Town Guard', text: `Hold it there. ${this._fineReason ? 'I saw you ' + this._fineReason + '. ' : ''}That's ${fine}g — settle up.`, options: [
        canPay ? { label: `Pay the fine (${fine}g)`, set: 'fine:pay', end: true } : { label: `(You can't afford ${fine}g.)`, set: 'fine:cant', end: true },
        { label: 'Refuse', set: 'fine:refuse', end: true },
      ] },
    };
    this._activeQuest = null; this._dlg = new Dialogue({ start: 'd0', nodes }, this._dlgCtx()); this._openDlg();
  }
  // ---- REACTIVITY: NOISE → GUARD HEARING → THE CONFRONT LADDER ---------------------------------------
  // A noisy crime RADIATES noise from (x,y). Every guard within the hearing radius HEARS; the nearest one
  // who heard begins the CONFRONT LADDER — he WALKS from his post to the player, shouts a warning, opens a
  // comply window (see _confrontTick). A guard OUT of earshot does nothing here, but the fine was already
  // registered by _addFine. (No teleport — the guard is visibly en route the whole way.)
  _emitNoise(x, y, radius, reason) {
    if (this._inInterior) return;                          // events fire on the overworld where the guards live
    let nearest = null, nd = Infinity, heard = 0;
    for (const m of this.npcLife.movers) {
      const g = m.npc; if (!g.active || g.getData('role') !== 'guard') continue;
      if (Phaser.Math.Distance.Between(g.x, g.y, x, y) > radius) continue;   // out of earshot → no response
      heard++;
      const dp = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y);
      if (dp < nd) { nd = dp; nearest = g; }
    }
    if (nearest && this._fineOwed > 0) this._startConfront(nearest);   // the closest who heard comes for you
    if (heard > 0) this._banner('A guard heard that — and is coming for you.', 1700);
  }
  // Begin a confront: the guard walks from where he IS to the player (APPROACH phase). Idempotent — won't
  // restart a confrontation already underway, and respects the post-flee cooldown.
  _startConfront(guard) {
    if (this._confront || this._guardBusy || !(this._fineOwed > 0)) return;
    if (this.time.now < (this._guardCooldown || 0)) return;
    this._confront = { guard, phase: 'approach', warnUntil: 0, anchor: null };
  }
  _fineAction(mode) {
    if (mode === 'pay') { const f = this._fineOwed; this.inv.addGold(-f); if (this.inv.save) this.inv.save(); this._banner(`Fine paid (${f}g). "Keep your nose clean."`, 1700); this._fineOwed = 0; }
    else if (mode === 'cant') { this._banner('"No coin? A warning, then — this once. Don\'t let me see it again."', 2200); this._fineOwed = 0; }   // warning if broke
    else { this._banner('The guard\'s eyes narrow. "Refuse, will you. We\'ll be watching — and it won\'t go cheaper."', 2200); }   // refuse → fine stays, escalates next offence
    this._guardBusy = false;
  }
  // Per-frame reactivity: drive the guard CONFRONT LADDER + advance the repair worker.
  _reactivityTick(dlgOpen, now) {
    if (!dlgOpen && !this._inInterior) {
      if (this._confront) this._confrontTick(now);
      // No live confrontation: a fined player who strays near a guard triggers one (the same walk-up ladder).
      else if (this._fineOwed > 0 && !this._guardBusy && now > (this._guardCooldown || 0)) {
        for (const m of this.npcLife.movers) {
          const ng = m.npc; if (!ng.active || ng.getData('role') !== 'guard') continue;
          if (Phaser.Math.Distance.Between(ng.x, ng.y, this.player.x, this.player.y) < GUARD.NOTICE_RANGE_PX) { this._startConfront(ng); break; }
        }
      }
    }
    this._repairTick(now);
  }
  // THE CONFRONT LADDER (Fable-style): APPROACH (walk to the player) → WARN ("Stop right there!" + comply
  // window) → comply (stand still) opens the fine dialog; flee (move off) lapses it (fine stays owed).
  _confrontTick(now) {
    const c = this._confront, g = c.guard;
    if (!g.active || this._fineOwed <= 0) { this._confront = null; return; }   // guard gone / fine cleared
    const dPlayer = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y);
    if (c.phase === 'approach') {
      this.npcLife.summon(g, this.player.x, this.player.y, null);   // re-aim each frame → he TRACKS you as you move
      if (dPlayer <= GUARD.WARN_RANGE_PX) {                         // reached you → WARN
        c.phase = 'warn'; c.warnUntil = now + GUARD.COMPLY_MS; c.anchor = { x: this.player.x, y: this.player.y };
        this.npcLife.summon(g, g.x, g.y, null);                    // halt the guard where he stands
        g.facing = this._faceToward(g, this.player); if (g.setState) g.setState('idle');
        this._sfx('sfx_select', 0.5); this._banner('Town Guard: "Stop right there!"', 1700);
      }
    } else if (c.phase === 'warn') {
      this.npcLife.summon(g, g.x, g.y, null);    // keep him planted (overrides his patrol) while he warns you
      g.facing = this._faceToward(g, this.player);
      const fledDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.anchor.x, c.anchor.y);
      if (fledDist > GUARD.FLEE_DIST_PX) {                         // you bolted → the confrontation lapses
        this._confront = null; this._guardCooldown = now + GUARD.RECONFRONT_COOLDOWN_MS;
        this._banner('You break away — the guard falls back, watching. (the fine stays owed)', 2200);
      } else if (now >= c.warnUntil) {                            // you stood your ground → he reads you the fine
        this._confront = null; this._guardConfront(g);
      }
    }
  }
  _faceToward(a, b) { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
  // ---- REACTIVITY: REPAIR-WORKER EVENT ---------------------------------------------------------------
  // A forced door registers a STAGED repair JOB the player can read beat by beat (the pure stage machine in
  // systems/repairPacing.js gates each stage by a named floor in standards.REPAIR; repairPacing.test.js locks it):
  //   WAIT (a discovery beat — no instant grumble) -> TRAVEL (the alarm goes up + a joiner WALKS to the door,
  //   a visible crossing) -> WORK (a long, visible hammering job) -> RESTORED. WORK_MS is the FLOOR; we take
  //   max(WORK_MS, the live day-phase) so a running clock still spans a real phase but it ALWAYS reads as long.
  _registerBrokenDoor(d) {
    this._repairs = this._repairs || [];
    if (this._repairs.some((r) => r.to === d.to)) return;
    const [cx, cy] = cidOf(d.doorWX, d.doorWY);
    const workMs = Math.max(REPAIR.WORK_MS, this._phaseMs || REPAIR.PHASE_MS_FALLBACK);  // day-phase-scale, floored long
    const workY = d.doorWY + TILE;                                        // the joiner hammers ON the threshold (walkable)
    this._repairs.push({ to: d.to, wx: d.doorWX, wy: d.doorWY, cx, cy, tBreak: this.time.now,
      workMs, workY, startY: workY + REPAIR.TRAVEL_TILES * TILE,          // starts TRAVEL_TILES in FRONT of the door
      stage: 'wait', worker: null, nextHammer: 0, nextLine: 0, lineI: 0, done: false });
    // NO grumble yet — discovery is a beat away (the WAIT stage); the shout fires when we enter TRAVEL.
  }
  // Ambient SFX tuning (WS3) — footstep cadence (ms) + subtle volume. [TUNE]
  static SFX = { STEP_MS_WALK: 340, STEP_MS_RUN: 250, STEP_VOL: 0.16 };
  // The joiner's working mutters (an occasional line while hammering).
  static REPAIR_LINES = ['The joiner mutters: "Vandals. No respect."', 'Hammering: "Hold still, you — there."', 'The joiner: "New boards, new hinges. Half a day gone."', 'Tap, tap, tap — "Almost square now."'];
  // TIME-OF-DAY HUD — friendly labels + a sun/moon icon style per TimeOfDay phase.
  static TIME_LABEL = { dawn: 'Morning', day: 'Midday', dusk: 'Evening', night: 'Night' };
  static TIME_STYLE = { dawn: { c: 0xffb066, moon: false }, day: { c: 0xffe08a, moon: false }, dusk: { c: 0xff8a5c, moon: false }, night: { c: 0x8ab6ff, moon: true } };
  _repairTick(now) {
    if (!this._repairs || !this._repairs.length) return;
    for (const r of this._repairs) {
      if (r.done) continue;
      const C = { DISCOVERY_MS: REPAIR.DISCOVERY_MS, TRAVEL_MS: REPAIR.TRAVEL_MS, WORK_MS: r.workMs };
      const stage = stageAt(r.tBreak, now, C);
      // STAGE TRANSITIONS — fire each beat's one-off side-effects as we cross its floor.
      if (stage !== r.stage) {
        if (stage === 'travel') this._banner('A neighbour shouts: "Who did that to the door?! Someone fetch the joiner!"', 2200);   // discovery
        else if (stage === 'work') { r.nextHammer = now; r.nextLine = now + REPAIR.LINE_MS; if (this._repairNear(r)) this._banner('The joiner arrives and sets to it — hammer and fresh boards.', 1900); }
        else if (stage === 'done') { this._finishRepair(r); continue; }
        r.stage = stage;
      }
      // PRESENCE — show the joiner only when the player can see the door (else the beat is implied by the banners).
      const near = this._repairNear(r);
      if ((stage === 'travel' || stage === 'work') && near && (!r.worker || !r.worker.active)) this._showRepairWorker(r);
      else if ((!near || stage === 'wait') && r.worker) { try { r.worker.destroy(); } catch (_) {} r.worker = null; }
      if (r.worker && r.worker.active) {
        if (stage === 'travel') {
          // VISIBLE CROSSING — walk the joiner from his start up to the door over the travel window (no feet-slide).
          const p = travelProgress(r.tBreak, now, C);
          r.worker.x = r.wx; r.worker.y = r.startY + (r.workY - r.startY) * p; r.worker.facing = 'up';
          if (r.worker.setState) r.worker.setState('walk', REPAIR.WORKER_SPEED_PX);
        } else if (stage === 'work') {
          // CONTINUOUS HAMMERING — at the door, replay the swing on a cadence (the slash-as-work anim) + sfx.
          r.worker.x = r.wx; r.worker.y = r.workY; r.worker.facing = 'up';
          if (now >= r.nextHammer) { r.nextHammer = now + REPAIR.HAMMER_MS; if (r.worker.action) r.worker.action('attack'); this._sfx('sfx_charge_impact', 0.25); }
        }
      }
      // an occasional working mutter (only during WORK, only when the player is there to hear it)
      if (stage === 'work' && now >= r.nextLine) { r.nextLine = now + REPAIR.LINE_MS; if (near) this._banner(OverworldScene.REPAIR_LINES[(r.lineI = (r.lineI | 0) + 1) % OverworldScene.REPAIR_LINES.length], 1800); }
    }
    this._repairs = this._repairs.filter((r) => !r.done);
  }
  // Is the GH overworld loaded with the player within a screen of the broken door?
  _repairNear(r) {
    return !this._inInterior && this.region && !this.region.interior
      && Phaser.Math.Distance.Between(r.wx, r.wy, this.player.x, this.player.y) <= REPAIR.WORKER_RANGE_PX;
  }
  // On a real day-phase change, restore any repair whose WORK floor is already paid (keeps it spanning a phase).
  _repairOnPhaseChange() {
    if (!this._repairs) return;
    const now = this.time.now;
    for (const r of this._repairs) {
      if (r.done) continue;
      if (stageAt(r.tBreak, now, { DISCOVERY_MS: REPAIR.DISCOVERY_MS, TRAVEL_MS: REPAIR.TRAVEL_MS, WORK_MS: r.workMs }) === 'done') this._finishRepair(r);
    }
    this._repairs = this._repairs.filter((r) => !r.done);
  }
  _showRepairWorker(r) {
    // the joiner near the door (only when the GH overworld is loaded near it; else presence is implied by lines).
    if (!this._repairNear(r)) return;
    try {
      const startY = r.stage === 'work' ? r.workY : r.startY;            // spawn at the door if we joined mid-work
      const w = new Character(this, r.wx, startY, { parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_parted_gray', 'beard_gray', 'shirt_leather', 'pants_brown', 'shoes_brown'], facing: 'up', speed: REPAIR.WORKER_SPEED_PX });
      this.add.existing(w); if (w.body) w.body.enable = false; DepthSort.track(w, w.body ? w.body.offset.y + w.body.height : 30);
      this._regionObjs.push(w); r.worker = w;
    } catch (_) { /* presence implied by the joiner's lines if the skin can't build */ }
  }
  _finishRepair(r) {
    this.save.setChunkFlag(r.cx, r.cy, 'door_broken_' + r.to, 0);   // CLEAR → the door rebuilds in its prior (closed/locked) state
    if (r.worker) { try { this.tweens.killTweensOf(r.worker); r.worker.destroy(); } catch (_) {} r.worker = null; }
    r.done = true;
    this._banner('The door is mended — good as it was.', 1800);
    // if the GH overworld is live near the door, restream so the restored door shows immediately
    if (this.region && !this.region.interior && Phaser.Math.Distance.Between(r.wx, r.wy, this.player.x, this.player.y) < 900) this._restream(true);
  }
  // UNIFORM ENTERABILITY — after a region's props are built, guarantee every building's DOORWAY TILE is
  // walkable: disable any solid (a procedurally-scattered rock, a neighbour's mass) whose collider covers
  // a doorway-tile centre. The building's own flanking side-rects don't cover the centre, so they survive.
  _clearDoorwayThresholds() {
    for (const d of (this._buildingDoors || [])) {
      // clear the doorway tile AND the APPROACH ZONE in front of it — the doorway + the 2 tiles straight
      // ahead (Van: fences/solids were blocking building approaches). So you can always WALK UP to a door.
      for (const [tx, ty] of [[d.dcx, d.dcy], [d.dcx, d.dcy + TILE], [d.dcx, d.dcy + 2 * TILE]]) {
        for (const o of this.solids.getChildren()) {
          const b = o.body; if (!b || b.physicsType !== 1) continue;
          if (tx >= b.center.x - b.halfWidth && tx <= b.center.x + b.halfWidth && ty >= b.center.y - b.halfHeight && ty <= b.center.y + b.halfHeight) {
            b.enable = false; if (o.setVisible) o.setVisible(false);
          }
        }
      }
    }
  }
  // EVERY building is enterable — resolve its door: an explicit `door` (string=open, or {to,state,...}) or,
  // for any BUILDING prop without one, a DEFAULT open door to a shared generic interior. Non-buildings → null.
  _resolveBuildingDoor(p) {
    if (p.door) return (typeof p.door === 'string') ? { to: p.door, state: 'open' } : { state: 'open', ...p.door };
    if (!/^(prop_house|prop_forge|prop_tavern|prop_chapel|prop_smithy|prop_hut|prop_hall|prop_manor|prop_cottage)/.test(p.key)) return null;
    if (/forge|smithy/.test(p.key)) return { to: 'forge_generic', state: 'open' };
    // ROTATE the 5 home variants by a position hash (deterministic → no two ADJACENT homes share a layout)
    const HOME_VARIANTS = ['house_generic', 'house_v2', 'house_v3', 'house_v4', 'house_v5'];
    const to = HOME_VARIANTS[(((p.tx || 0) * 3 + (p.ty || 0) * 7) % HOME_VARIANTS.length + HOME_VARIANTS.length) % HOME_VARIANTS.length];
    return { to, state: 'open' };   // generic interior, walk straight in
  }
  // EVERY building shows a REAL door sprite in its portal (open/closed/locked) — derived from the asset
  // doorway, identical for all. A dark threshold sits behind it; locked adds a lock glyph. (Bug: doors only
  // rendered on the blacksmith — now every building's door renders.)
  _buildDoorVisual(x, y, w, h, state, depth, doorArt) {
    // THE MIX: the dark threshold is always drawn (the opening). A DOOR SPRITE is added only for closed /
    // locked / broken — open/none buildings show just the threshold (always-open shop/tavern). The door art
    // is the building's own (`doorArt`, e.g. the arched door for brick houses). Sized to the measured rect,
    // depth just in front of the wall so the avatar (at the feet) sorts in front of it.
    const opening = this.add.rectangle(x, y, w, h, 0x0b0d12, 0.9).setDepth(depth - 0.5); this._regionObjs.push(opening);
    if (state === 'open' || state === 'none') return { opening, doorSpr: null, lockSpr: null };
    const key = (doorArt && PROPS[doorArt]) ? doorArt : 'prop_door';
    const doorSpr = this.add.sprite(x, y, key).setDepth(depth); doorSpr.setDisplaySize(w, h); this._regionObjs.push(doorSpr);
    let lockSpr = null;
    if (state === 'broken') { doorSpr.setTint(0x4a3420).setAngle(15).setDisplaySize(w * 0.92, h * 0.6); doorSpr.y = y + h * 0.18; }   // splintered/hanging in the frame
    else if (state === 'locked') { lockSpr = this.add.rectangle(x, y - h * 0.1, Math.max(6, w * 0.22), Math.max(7, h * 0.16), 0xf2c14e).setStrokeStyle(1, 0x6b4f12).setDepth(depth + 0.5); this._regionObjs.push(lockSpr); }
    return { opening, doorSpr, lockSpr };
  }
  // VISIBLY OPEN the door — hide the door sprite + lock, reveal the dark threshold → Van SEES it open before
  // walking through (open buildings animate too). Then the caller walks the player in.
  _openDoorVisual(d) {
    if (d && d.doorSpr) d.doorSpr.setVisible(false);
    if (d && d.lockSpr) d.lockSpr.setVisible(false);
    if (d && d.opening) d.opening.setFillStyle(0x0b0d12, 0.95);
    if (d) d.state = 'open';
    this._sfx('sfx_confirm', 0.5);
  }

  _startGreeting(name, lines) {
    const nodes = {};
    lines.forEach((t, i) => { const last = i === lines.length - 1; nodes[`g${i}`] = { speaker: name, text: t, options: [last ? { label: '(Step away.)', end: true } : { label: '(Listen.)', to: `g${i + 1}` }] }; });
    this._activeQuest = null; this._dlg = new Dialogue({ start: 'g0', nodes }, this._dlgCtx()); this._openDlg();
  }
  _startDialogue(graph, speakerName) { this._activeQuest = null; this._dlg = new Dialogue(graph, this._dlgCtx()); this._openDlg(); }
  _startQuestDialogue(qid, startNode) {
    const def = this.quests.defs[qid]; if (!def || !def.dialogue) return;
    if (this.quests.status(qid) === 'available') this.quests.start(qid);
    this._activeQuest = qid;
    // startNode lets a SECOND NPC host a later beat of a multi-location quest (e.g. Bram opens M1 at the
    // 'forge' node, where he is placed) — L2 story-claim consistency.
    const graph = startNode && def.dialogue.nodes[startNode] ? { ...def.dialogue, start: startNode } : def.dialogue;
    this._dlg = new Dialogue(graph, this._dlgCtx()); this._openDlg();
  }
  _openDlg() { this._selOpt = 0; Movement.stop(this.player); this.dlgBox.setVisible(true); this._clampPanel(this.dlgBox, 20, 266, 728, 158); this._renderNode(); }   // dialog box already on the uiCamera; clamp for narrow windows
  _renderNode() {
    const node = this._dlg && this._dlg.node(); if (!node) return this._closeDialogue();
    this._buildPortrait(node.speaker || null);
    this.dlgName.setText(node.speaker || '—'); this.dlgBody.setText(this._template(node.text) || '');
    const ctx = { inv: this.inv, karma: this.karma };
    this._optView = this._dlg.options().map((opt, idx) => ({ opt, idx, st: Social.state(opt, ctx), tag: Social.tag(opt) })).filter((v) => v.st !== 'hidden');
    if (this._optView.length && this._optView[this._selOpt] && this._optView[this._selOpt].st === 'locked') { const f = this._optView.findIndex((v) => v.st !== 'locked'); this._selOpt = f >= 0 ? f : 0; }
    this._renderOptions();
  }
  _renderOptions() {
    const view = this._optView || []; this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    view.forEach((v, i) => {
      const locked = v.st === 'locked', sel = i === this._selOpt && !locked;
      const t = this.add.text(this._dlgTextX, 344 + i * 20, `${sel ? '▶ ' : '  '}${view.length > 1 ? `${i + 1}. ` : ''}${v.tag}${this._template(v.opt.label)}`, { fontFamily: 'monospace', fontSize: '13px', color: locked ? '#6b6275' : sel ? '#ffe66d' : v.tag ? '#8fd6ff' : '#cfe8d6' }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 12);
      this.dlgBox.add(t); this._optTexts.push(t);
    });
    this.dlgHint.setText(view.length > 1 ? '↑↓ pick · E confirm · B close' : 'E continue ▸ · B close');
  }
  _dlgNav(d) { const view = this._optView || []; if (view.length < 2) return; let i = Phaser.Math.Clamp(this._selOpt + d, 0, view.length - 1); if (view[i] && view[i].st !== 'locked') this._selOpt = i; this._renderOptions(); }
  _dlgConfirm() {
    const view = this._optView || [], v = view[this._selOpt]; if (v && v.st === 'locked') return;
    const wasNode = this._dlg.nodeId, wasQuest = this._activeQuest;
    this._dlg.select(v ? v.idx : this._selOpt); this._selOpt = 0;
    // RE-ENTRANT CLOSE GUARD: an option's deed/onSet can synchronously close the dialogue (e.g. M6's `time_skip`
    // deed fires _doTimeSkip → _closeDialogue, nulling _dlg) — without this, the lines below deref a null _dlg and
    // throw in the keydown handler (the child→adult bridge crashed on the real keypress).
    if (!this._dlg) return;
    // M9 "Raise the Lantern" at the guardian beat → the real boss fight (mirror MarshScene)
    if (wasQuest === 'M9' && wasNode === 'guardian') { this._startBossFight(); return; }
    // L2 STORY-CLAIM split: M1's cottage beat (Mara) ENDS here. The engine tree links wake→forge for the unit
    // tests, but in the running game Bram's `forge` line must play AT the forge (where he is placed), not in the
    // cottage with him absent. So close after `wake`; M1 (worldDriven) stays active until Bram completes it.
    if (wasQuest === 'M1' && wasNode === 'wake') { if (this.quests.step['M1'] === 0) { this.quests.advance('M1'); this._refreshTracker && this._refreshTracker(); } return this._closeDialogue(); }   // step 0 wake → 1 'Find Bram at the forge'
    if (this._dlg.done || !this._dlg.node()) this._closeDialogue(); else this._renderNode();
  }
  // WS1.4 — B/Q cancels a dialog box cleanly: dismiss WITHOUT the quest-completion logic (so cancelling a quest
  // conversation never auto-completes it; re-talk to resume). Greetings just close.
  _cancelDialogue() {
    this.dlgBox.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
    this._buildPortrait(null); this._sfx('sfx_select', 0.4);
  }
  _closeDialogue() {
    const qid = this._activeQuest;
    let completed = null;
    if (qid && this.quests.status(qid) === 'active') {   // dialogue-driven quests complete on dialogue close (unless multi-step world-driven)
      const def = this.quests.defs[qid];
      if (!(def && def.worldDriven)) { this.quests.complete(qid); this._grantQuestReward(qid); completed = qid; }
    }
    this.dlgBox.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = []; this._dlg = null; this._activeQuest = null;
    this._buildPortrait(null);   // clear the speaker face
    if (completed) this._onChildQuestComplete(completed);   // childhood spine: chain the festival → the burning
  }
  // Grant a completed quest's DATA reward (Gate F) — gold / item(s) / weapon / skill — and banner it.
  // Property/flag unlocks ride on a recorded DEED (the shop reads it), so they're not handled here.
  _grantQuestReward(qid) {
    const def = this.quests.defs[qid]; const r = (def && def.reward) || null; if (!r) return;
    const got = [];
    const known = (id) => { try { return !!itemDef(id); } catch (_) { return false; } };   // itemDef THROWS on unknown
    const nameOf = (id) => { try { const it = itemDef(id); return it ? it.name : id; } catch (_) { return id; } };
    if (r.gold) { this.inv.addGold(r.gold); got.push(`${r.gold}g`); }
    // a reward item must be a REGISTERED item — skip (don't crash) a narrative-only keepsake (e.g. M1's
    // wooden_toy is a story beat, not an inventory item). Guards quest completion against an unknown-item throw.
    for (const it of [r.item, ...(r.items || []), r.weapon].filter(Boolean)) { if (known(it) && this.inv.add(it)) got.push(nameOf(it)); }
    if (r.weapon && this.inv.equip) this.inv.equip(r.weapon);
    if (r.skill && this.inv.learnSkill) this.inv.learnSkill(r.skill);
    if (this.inv.save) this.inv.save();
    this._banner(got.length ? `Quest complete: ${def.title} — ${got.join(', ')}.` : `Quest complete: ${def.title}.`, 2200);
  }
  _buildDialogueUI() {
    this.dlgBox = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 11).setVisible(false);
    // taller box, moved UP, so up to 4 options sit unsquashed inside it (screen is only 432 tall — the old
    // 300+120 box ended at 420 and the 3rd/4th option clipped its edge). 266..424, evenly-spaced options.
    const bg = this.add.rectangle(20, 266, 728, 158, 0x0c1410, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0);
    // PORTRAIT — the speaker's face (built per-speaker from this._faces; ported from RegionScene)
    const PS = 96, px = 28, py = 278;
    this.portraitBox = { x: px, y: py, size: PS }; this._portrait = null; this._portraitSpeaker = null;
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x141a20, 1).setOrigin(0, 0).setStrokeStyle(2, 0x3c5a3c).setScrollFactor(0).setVisible(false);
    const tx0 = px + PS + 16;   // text starts to the right of the portrait
    this._dlgTextX = tx0;
    this.dlgName = this.add.text(tx0, 274, '', { fontFamily: 'monospace', fontSize: '14px', color: '#9fd8a0', fontStyle: 'bold' }).setScrollFactor(0);
    this.dlgBody = this.add.text(tx0, 296, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e8f5e0', wordWrap: { width: 748 - tx0 - 12 } }).setScrollFactor(0);
    this.dlgHint = this.add.text(620, 274, '', { fontFamily: 'monospace', fontSize: '11px', color: '#7a9a7a' }).setScrollFactor(0);
    this.dlgBox.add([bg, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]); this._optTexts = [];
  }
  // Build a face RenderTexture for `name` from its registered parts (idle, down-facing,
  // expression), scaled into the portrait box. Rebuilt only when the speaker changes.
  // Role-generic villager faces for a named speaker we have no placed sprite for (item 3). A light feminine
  // name-cue picks fem vs masc so e.g. "Mother Vell"/"Henwife" don't get a man's face; everything else masc.
  static GENERIC_MASC = { parts: ['body_ivory', 'head_ivory', 'brows_chestnut', 'hair_chestnut', 'shirt_leather', 'pants_brown', 'shoes_brown'], expression: 'neutral' };
  static GENERIC_FEM = { parts: ['body_fem', 'head_fem', 'brows_chestnut', 'hair_bob_blonde', 'shirt_blue', 'pants_brown', 'shoes_brown_fem'], expression: 'neutral' };
  _genericFace(name) {
    return /mother|wife|widow|edda|sela|amanda|vell|oracle|henwife|maid|lass|girl|nan|gran|sal\b/i.test(name || '')
      ? OverworldScene.GENERIC_FEM : OverworldScene.GENERIC_MASC;
  }
  _buildPortrait(name) {
    if (name === this._portraitSpeaker) return;
    this._portraitSpeaker = name;
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    // a placed NPC shows ITS face; a named-but-unplaced speaker (a quest-only voice) shows a role-generic
    // villager face (item 3) — never a blank box. Pure narration (empty speaker) shows no portrait.
    const face = name ? (this._faces[name] || this._genericFace(name)) : null;
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
    this.input.keyboard.on('keydown-E', () => { if (this._shopOpen) (this._shopMode === 'sell' ? this._shopSell() : this._shopBuy()); else if (this._topicsOpen) this._topicPick(); else if (this._dlg) this._dlgConfirm(); else if (this._menuOpen) this._menuActivate(); else Interaction.tryInteract(); });
    this.input.keyboard.on('keydown-TAB', (e) => { if (e && e.preventDefault) e.preventDefault(); if (this._shopOpen) this._shopToggleMode(); });   // WS3.9: TAB switches a shop between BUY and SELL
    this.input.keyboard.on('keydown-UP', () => { if (this._shopOpen) this._shopNav(-1); else if (this._topicsOpen) this._topicNav(-1); else if (this._dlg) this._dlgNav(-1); else if (this._menuOpen) this._menuScrollBy(-1); });
    this.input.keyboard.on('keydown-DOWN', () => { if (this._shopOpen) this._shopNav(1); else if (this._topicsOpen) this._topicNav(1); else if (this._dlg) this._dlgNav(1); else if (this._menuOpen) this._menuScrollBy(1); });
    this.input.keyboard.on('keydown-LEFT', () => { if (this._menuOpen) this._menuNav(-1); });
    this.input.keyboard.on('keydown-RIGHT', () => { if (this._menuOpen) this._menuNav(1); });
    this.input.keyboard.on('keydown-ENTER', () => { if (this._menuOpen) this._menuActivate(); });
    // CLOSE KEY (WS1.4): B (or Q) closes ANY open panel/dialog/menu. Esc toggles the GAME MENU only (below)
    // — never a dual meaning. A dialog cancels cleanly (no quest auto-complete on cancel).
    const closePanel = () => { if (this._shopOpen) this._closeShop(); else if (this._topicsOpen) this._closeTopics(); else if (this._dlg) this._cancelDialogue(); else if (this._menuOpen) { if (this._itemActionOpen) { this._itemActionOpen = false; this._itemActions = null; this._sfx('sfx_select', 0.4); this._renderMenu(); } else this._closeMenu(); } };   // B/Q backs out of the item-action sub-panel before closing the whole menu
    this.input.keyboard.on('keydown-Q', closePanel);
    this.input.keyboard.on('keydown-B', closePanel);
    this.input.keyboard.on('keydown-J', () => { if (this._canAct()) this._playerAttack(); });    // attack (swing+cut everywhere; combat damage gated inside _playerAttack)
    this.input.keyboard.on('keydown-SPACE', () => { if (this._canAct()) this._tryDodge(); });                              // dodge-roll
    this.input.keyboard.on('keydown-F5', () => this.saveGame());
    this.input.keyboard.on('keydown-F9', () => this.loadGame());
    this.input.keyboard.on('keydown-F8', () => this.newGame());   // FRESH GAME — clear the save + reload (stale-save preventative)
    // HUD toggles (control SSOT: O/M map · T quests · H hide HUD · Esc game menu). Gated while the menu is open.
    const toggleMap = () => { if (!this._dlg && !this._menuOpen) { const v = !this._fullMap.visible; this._fullMap.setVisible(v).setDepth(DEPTH.OVERLAY + 12); if (this._fullMapTitle) this._fullMapTitle.setVisible(true); } };   // map is scene-root on the uiCamera now — set depth above the HUD on show
    this.input.keyboard.on('keydown-O', toggleMap);
    this.input.keyboard.on('keydown-M', toggleMap);   // M = the full WORLD MAP / plan view
    this.input.keyboard.on('keydown-T', () => { if (!this._dlg && !this._menuOpen) this._trkState = (this._trkState + 2) % 3; });   // cycle tracker: full→title→off
    this.input.keyboard.on('keydown-H', () => { if (!this._dlg && !this._menuOpen) { this._hudHidden = !this._hudHidden; this.hud2.setVisible(!this._hudHidden); } });
    // Esc = the GAME MENU (Items/Gear/Map/Settings). Toggles it; ignored while a panel/dialog is open (use B/Q).
    this.input.keyboard.on('keydown-ESC', () => { if (this._shopOpen || this._topicsOpen || this._dlg) return; if (this._menuOpen) { if (this._itemActionOpen) { this._itemActionOpen = false; this._itemActions = null; this._renderMenu(); } else this._closeMenu(); } else this._openMenu(); });
    this._setupDebug();   // dev-only world-skeleton walkthrough aids (gated by ?debug)
  }

  // DEBUG / TEST MODE — gated by the `?debug` URL param (or Vite DEV) so it can't fire in normal
  // play. Lets Van free-walk the whole WORLD-SKELETON: G = grant every tool/shard (opens every gate),
  // 1–7 = warp to each region. NOTE: a pure testing aid — no data/verify-gate impact; granting tools
  // does write the deeds to the (debug) session save, by design.
  _setupDebug() {
    const allowed = typeof window !== 'undefined' && /[?&]debug\b/.test(window.location.search || '');
    if (!allowed) return;   // deliberate activation only — never fires in normal play (no ?debug)
    const T = TILE;
    // region warp targets — just INSIDE each region (world tiles), so the gate never blocks the warp
    this._debugWarps = {
      ONE:   { name: 'Greenhollow', x: 314 * T + 16, y: 305 * T + 16 },
      TWO:   { name: 'West Belt',   x: 283 * T + 16, y: 310 * T + 16 },
      THREE: { name: 'Ashen Marsh', x: 258 * T + 16, y: 310 * T + 16 },
      FOUR:  { name: 'Sundered Peaks', x: 318 * T + 16, y: 250 * T + 16 },
      FIVE:  { name: 'Tidewreck Coast', x: 345 * T + 16, y: 305 * T + 16 },
      SIX:   { name: 'Emberwood',   x: 320 * T + 16, y: 333 * T + 16 },
      SEVEN: { name: 'Hollow Spire', x: 320 * T + 16, y: 214 * T + 16 },
    };
    const ALL = ['tool_lantern', 'tool_grapple', 'tool_hookshot', 'tool_firefrost', 'shard_1', 'shard_2', 'shard_3', 'shard_4'];
    this.input.keyboard.on('keydown-G', () => {
      ALL.forEach((d) => this.karma.recordDeed(d));
      this._unloadAllRegions(); this._maybeToggleRegion(true); this._restream(true);   // re-evaluate every gate
      this._banner('DEBUG: granted all tools + shards — every gate is open.', 2200);
    });
    const warp = (w) => { if (!w) return; this.player.x = w.x; this.player.y = w.y; this.player.body.reset(w.x, w.y);
      this._unloadAllRegions(); this._maybeToggleRegion(true); this._restream(true); this.cameras.main.centerOn(w.x, w.y);
      this._banner('DEBUG: warped to ' + w.name, 1600); };
    for (const k of Object.keys(this._debugWarps)) this.input.keyboard.on('keydown-' + k, () => warp(this._debugWarps[k]));
    // on-screen indicator + key legend (only while debug is active)
    this.add.text(this.scale.width / 2, 8,
      '● DEBUG MODE   G: grant all tools/shards    1-7 warp: 1 Greenhollow · 2 Belt · 3 Marsh · 4 Peaks · 5 Coast · 6 Emberwood · 7 Spire',
      { fontFamily: 'monospace', fontSize: '10px', color: '#ffd36a', backgroundColor: '#1a0f00cc', padding: { x: 6, y: 3 }, align: 'center' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 14);
    console.log('[DEBUG MODE active] G = grant all tools/shards · 1-7 = warp to GH/Belt/Marsh/Peaks/Coast/Emberwood/Spire');
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
      DepthSort.trackProp(spr, solidBox(p.key, d));   // FEET rule (origin 0.85 + scale honoured)
    }
    for (; pi < c.props.length; pi++) { c.props[pi].setVisible(false).setActive(false); DepthSort.untrack(c.props[pi]); }
    // belt DECALS — FLOOR-pinned ground dressing (flowers/tufts), never occlude actors
    let di = 0;
    if (!overRegion) for (const dc of (data.decals || [])) {
      let img = c.decals[di++]; if (!img) { img = this.add.image(0, 0, dc.key).setOrigin(0.5, 1).setDepth(DEPTH.FLOOR + 2); c.decals.push(img); }
      img.setTexture(dc.key).setPosition(dc.x, dc.y).setVisible(true).setActive(true);
    }
    for (; di < c.decals.length; di++) c.decals[di].setVisible(false).setActive(false);
    // inside an interior, a freshly-streamed overworld chunk stays hidden (the enclosed view)
    if (this._inInterior) { c.ground.setVisible(false); for (const s of c.props) s.setVisible(false); for (const d of (c.decals || [])) d.setVisible(false); }
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
  // FRESH GAME — wipe the save + reload (the stale-save preventative; F8). Confirms via a banner first
  // press, then acts on a second press within 2.5s, so it can't be triggered by accident.
  newGame() {
    if (!this._newGameArmed || this.time.now > this._newGameArmed) { this._newGameArmed = this.time.now + 2500; this._banner('Press F8 again to START A FRESH GAME (clears your save).', 2400); return; }
    this.save.clear();   // wipe the save via the storage adapter (the persistence backend stays isolated in storage.js)
    if (typeof location !== 'undefined' && location.reload) location.reload();
  }
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
    const dlgOpen = !!this._dlg || !!this._shopOpen || !!this._topicsOpen || !!this._menuOpen;   // shop/topic/game-menu freezes movement like a dialogue
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
      if (this.pc.isDodgeMoving(now)) {
        // DODGE move — SWEPT anti-tunnel: cast the feet-box along the intended path this frame in
        // small steps; if a solid is in the way, clamp the velocity so the body stops just before it
        // + END the dodge. A 611px/s burst can NO LONGER skip a thin base-band collider in one frame
        // (the dash-over-a-rock bug, which was real — NOT a 4fps artifact), from ANY direction.
        const v = this.pc.dodgeVelocity(), sv = this._sweptDodgeVel(v.x, v.y, dt);
        this.player.body.setVelocity(sv.x, sv.y);
      }
      else if (this.pc.isBlocking()) Movement.stop(this.player);
      else if (dx || dy) Movement.drive(this.player, dx, dy, run); else Movement.stop(this.player);
      // flush a BUFFERED attack the instant the swing is ready (crisp combat)
      if (this._atkBuffered && now <= this._atkBuffered && now >= this._atkReady && !this.player.isBusy()) { this._atkBuffered = 0; this._playerAttack(); }
    }
    // FOOTSTEPS (WS3) — a soft step on a cadence while actually walking (quicker when running). Subtle volume.
    const F = OverworldScene.SFX, moving = !dlgOpen && this._hitFreeze <= 0 && this.player.body
      && (Math.abs(this.player.body.velocity.x) + Math.abs(this.player.body.velocity.y)) > 10;
    if (moving) { if (now >= (this._nextStep || 0)) { this._nextStep = now + (run ? F.STEP_MS_RUN : F.STEP_MS_WALK); this._sfx('sfx_footstep', F.STEP_VOL); } }
    else this._nextStep = 0;

    const [pcx, pcy] = cidOf(this.player.x, this.player.y), pc = `${pcx},${pcy}`;
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); this._maybeToggleRegion(); }
    while (this.loadQueue.length) this._spawn(this.loadQueue.shift());

    if (this.npcLife.has()) this.npcLife.update(dt, dlgOpen);
    this._pledgeTick();                                     // L6: an "ignore/pass by" pledge resolves once you walk on
    this._henTick(dt);                                      // M2: Henrietta pecks / flees / settles (physical chase)
    this._reactivityTick(dlgOpen, now);                     // guard confront/fine + repair-worker event
    if (this.combat) this.combat.update(dt, this.player);   // enemies behave (no-op when none spawned)
    if (this.uiCamera) this._reconcileCameras();   // keep this frame's new streamed/combat objects off the HUD camera (before render)
    // HARD INTERIOR CONTAINMENT — even if a dash/swept-dodge tunnels a 1-tile wall, snap the player back
    // inside the interior's bounds (the void is BEYOND the bounds). A backstop behind the wall colliders.
    if (this.region && this.region.interior && !this._areaT) {
      const bd = this.region.bounds, ins = TILE * 0.5;
      const nx = Math.min(Math.max(this.player.x, bd.x + ins), bd.x + bd.w - ins);
      const ny = Math.min(Math.max(this.player.y, bd.y + ins), bd.y + bd.h - ins);
      if (nx !== this.player.x || ny !== this.player.y) { this.player.x = nx; this.player.y = ny; this.player.body.reset(nx, ny); this.pc.dodgeMoveUntil = 0; }
    }
    this._checkDoorWalk();   // WALK-IN / WALK-OUT building + interior + stairs transitions
    Interaction.update(this.player);
    this._updatePlayerVisual(now);
    DepthSort.update();
    this._drawCombatUI();
    this._tickFlame(now);   // chapel ward flame reads the live purity band (fire-responds-to-purity)

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
    // TIME-OF-DAY indicator: a small sun/moon icon + phase label + day number, tied to the live TimeOfDay clock.
    this._sTimeIcon = add(this.add.graphics().setScrollFactor(0).setDepth(OD));
    this._sTimeIcon.setPosition(sx + 126, sy + 57);
    this._sTime = add(txt(sx + 138, sy + 50, '', 13, '#bcd6ff'));
    this._timePanelBg = 0x10131c; this._timePhaseShown = null;
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

    // FULL-MAP overlay (toggle M / O) — the whole-world PLAN: regions + corridors + gates + labels.
    // PROJECTION: fit the BOUNDING BOX of the built regions (not the empty 20480px world) so the plan
    // FILLS the view + reads. box = { x,y,scale, wx,wy } → screenPx = x + (worldPx - wx)*scale.
    // SCENE-ROOT (NOT a hud2 child) so the menu hiding hud2 can't hide the Map tab — registered on the
    // uiCamera in _setupUICamera. ROOT CAUSE of the "menu closes navigating to Map" bug: the map was a hud2
    // child, and _openMenu does hud2.setVisible(false), so the Map tab rendered NOTHING (parent invisible).
    this._fullMap = this.add.container(0, 0).setScrollFactor(0).setDepth(OD + 2).setVisible(false);
    const fw = Math.min(W - 70, 760), fh = this.scale.height - 70, fx = (W - fw) / 2, fy = 40;
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const R of REGIONS) { if (R.interior) continue; minx = Math.min(minx, R.bounds.x); miny = Math.min(miny, R.bounds.y); maxx = Math.max(maxx, R.bounds.x + R.bounds.w); maxy = Math.max(maxy, R.bounds.y + R.bounds.h); }
    const pad = 2 * CHUNK_PX; minx -= pad; miny -= pad; maxx += pad; maxy += pad;
    const scale = Math.min(fw / (maxx - minx), fh / (maxy - miny));
    const box = { x: fx + (fw - (maxx - minx) * scale) / 2, y: fy + (fh - (maxy - miny) * scale) / 2, w: fw, h: fh, scale, wx: minx, wy: miny };
    const mX = (wpx) => box.x + (wpx - box.wx) * box.scale, mY = (wpy) => box.y + (wpy - box.wy) * box.scale;
    const fg = this.add.graphics().setScrollFactor(0);
    this._fullMap.add(this.add.rectangle(0, 0, W, this.scale.height, 0x05070b, 0.9).setOrigin(0, 0).setScrollFactor(0));
    this._fullMap.add(this.add.rectangle(fx - 5, fy - 5, fw + 10, fh + 10, 0x0c1018, 0.98).setOrigin(0, 0).setStrokeStyle(2, 0x7fa86a).setScrollFactor(0));
    this._renderWorldMapInto(fg, box);
    this._fullMap.add(fg);
    const lbl = (x, y, t, sz, col, oy2 = 0.5) => this._fullMap.add(this.add.text(x, y, t, { fontFamily: 'monospace', fontSize: sz + 'px', color: col, fontStyle: 'bold', stroke: '#05070b', strokeThickness: 4 }).setOrigin(0.5, oy2).setScrollFactor(0));
    for (const R of REGIONS) { if (R.interior) continue; lbl(mX(R.bounds.x + R.bounds.w / 2), mY(R.bounds.y + R.bounds.h / 2), R.key, R.greybox ? 11 : 13, R.greybox ? '#ffd9a0' : '#fff6df'); }
    // SETTLEMENT PINS — each settlement at its OVERWORLD-ENTRANCE position (where you actually walk to
    // it), derived from the LIVE region interactables — so the map MATCHES the built/walkable world, not
    // a stale text list. (rendered==built: the M-map reads from the same data the player walks.)
    const entranceOf = {};
    for (const R of REGIONS) { if (R.settlement || R.interior) continue;
      for (const o of (R.interactables || [])) if (o.via === 'door' && o.to && !o.to.startsWith('__') && o.to !== 'back') entranceOf[o.to] ||= { x: o.x, y: o.y }; }
    const offWorld = [];
    for (const R of REGIONS.filter((r) => r.settlement)) {
      const e = entranceOf[R.key];
      if (!e) { offWorld.push(R.label || R.key); continue; }
      const px = mX(e.x), py = mY(e.y);
      fg.fillStyle(0x6fd0ff, 1); fg.fillCircle(px, py, 3); fg.lineStyle(1, 0x05070b, 1); fg.strokeCircle(px, py, 3);
      lbl(px, py - 9, R.label || R.key, 9, '#bfe6ff', 1);
    }
    if (offWorld.length) this._fullMap.add(this.add.text(fx + 6, fy + 8, 'fast-travel only (not yet on the overworld): ' + offWorld.join(', '), { fontFamily: 'monospace', fontSize: '10px', color: '#ffcf9a' }).setScrollFactor(0));
    const seen = new Set();
    for (const e of ENTRANCES) {
      if (e.reserved || !e.gate) continue; const k = [e.region, e.to].sort().join('|'); if (seen.has(k)) continue; seen.add(k);
      lbl(mX(e.at.tx * TILE), mY(e.at.ty * TILE) - 12, '🔒' + String(e.gate).replace('tool_', '').replace('shard_', 'shard '), 9, '#ffb077', 1);
    }
    this._fullMapTitle = this.add.text(fx, fy - 26, 'WORLD MAP — the whole plan  (M / O to close)', { fontFamily: 'monospace', fontSize: '14px', color: '#ffe9c2', fontStyle: 'bold' }).setScrollFactor(0);
    this._fullMap.add(this._fullMapTitle);   // hidden when the map is shown via the Esc-menu Map tab (the menu's tab bar is the header there)
    this._fullMap.add(this.add.text(fx, fy + fh + 8, '● you  ·  ▭ region (greybox = nav skeleton)  ·  light tan = walkable corridor  ·  🔒 = tool-gate  ·  ○ entrance', { fontFamily: 'monospace', fontSize: '11px', color: '#9fb89a' }).setScrollFactor(0));
    this._fmDots = this.add.graphics().setScrollFactor(0); this._fullMap.add(this._fmDots);
    this._fmBox = box;
  }

  // draw the WORLD PLAN — base + each region footprint + the walkable CORRIDORS (from the nav grids,
  // so greybox paths are visible) + entrance markers — using the box's bbox projection.
  _renderWorldMapInto(g, box) {
    const s = box.scale, mX = (wpx) => box.x + (wpx - box.wx) * s, mY = (wpy) => box.y + (wpy - box.wy) * s;
    for (const R of REGIONS) {
      if (R.interior) continue;   // interiors/settlements are separate scenes — not on the overworld map
      const c = R.mapColor || (R.bogTint ? 0x6b724e : 0x4a7a3a), rx = mX(R.bounds.x), ry = mY(R.bounds.y), rw = Math.max(3, R.bounds.w * s), rh = Math.max(3, R.bounds.h * s);
      g.fillStyle(c, R.greybox ? 0.5 : 1).fillRect(rx, ry, rw, rh);
      g.lineStyle(1.5, 0x8aa0b8, 0.6).strokeRect(rx, ry, rw, rh);
      const nav = R.nav;   // the WALKABLE CORRIDORS (greybox nav grids) — light dirt so the path network reads
      if (nav && nav.walkable) {
        const tpx = Math.max(1, TILE * s); g.fillStyle(0xd8b878, 0.98);
        for (let ty = 0; ty < nav.H; ty++) for (let tx = 0; tx < nav.W; tx++)
          if (nav.walkable[ty][tx]) g.fillRect(mX(R.bounds.x + tx * TILE), mY(R.bounds.y + ty * TILE), tpx, tpx);
      }
    }
    for (const e of ENTRANCES) {
      if (e.reserved) continue;
      g.fillStyle(e.gate ? 0xff9e3b : 0x86e06a, 1).fillCircle(mX(e.at.tx * TILE), mY(e.at.ty * TILE), 3.5);
    }
  }

  // directional chevron near the player pointing toward the active quest's NPC
  _updateObjective() {
    const g = this._objArrow; if (!g) return; g.clear();
    // WS2.7: the objective arrow is an OPTION — OFF by default; soft text-guidance (the QUESTS tracker) leads.
    // Toggled live in Settings (bindings.options.objArrow). Reads the setting each frame so the toggle is instant.
    // M2 EXCEPTION (discoverability): while the childhood chore-quest M2 is active, FORCE the arrow on so the
    // coop / orchard / Henrietta are findable from the start point (Van couldn't find the coop). The adult
    // open-world keeps the soft-text default (arrow off) unless the player opts in.
    // CHILDHOOD SPINE: guide the child to the NEXT beat's physical trigger (M4 boarded cave / M5 festival) while
    // it's available OR active, so the arc is discoverable end-to-end (Van couldn't find where M4-M7 start).
    let spineTarget = null;
    if (this.isChild && this._childSites) {
      for (const qid of ['M4', 'M5']) { const s = this.quests.status(qid); if ((s === 'available' || s === 'active') && this._childSites[qid]) { spineTarget = this._childSites[qid]; break; } }
    }
    const forceArrow = this.isChild && (this.quests.status('M2') === 'active' || !!spineTarget);
    if ((!bindings.options.objArrow && !forceArrow) || this._dlg) return;
    let target = spineTarget;
    if (!target) for (const id of Object.keys(this.quests.state || {})) {
      if (this.quests.status(id) !== 'active') continue;
      // M2 — the physical chore sites (eggs/water) / the live hen (chase). Its step objectives are `site`
      // markers (no fixed tile), so the arrow is resolved here from the placed coop / saplings / Henrietta.
      if (id === 'M2' && this._m2Sites) {
        const sid = this.quests.defs.M2.steps[this.quests.step.M2]?.id;
        if (sid === 'eggs') { target = this._m2Sites.eggs; break; }
        if (sid === 'water') { target = this._m2Sites.water; break; }
        if (sid === 'hen') { if (this._hen && this._hen.active && this._henState !== 'settled') { target = this._hen; break; } continue; }
      }
      // OBJECTIVE ENGINE (deferred-sweep): a step with a physical objective points the arrow at the LOCATION;
      // else fall back to the giver NPC (today's behaviour). Quest-agnostic — consumed by the childhood build.
      const obj = stepObjective(this.quests.defs[id], this.quests.step[id]);
      const npc = this._npcByQuest && this._npcByQuest[id];
      const at = objectiveArrowTarget(obj, !!(npc && npc.active !== false));
      if (!at) continue;
      if (at.kind === 'loc') { target = { x: at.tx * TILE + TILE / 2, y: at.ty * TILE + TILE / 2 }; break; }
      if (npc && npc.active !== false) { target = npc; break; }
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

  // OBJECTIVE ENGINE — when the player REACHES an active quest step's physical objective, advance the quest
  // (the walk-to-and-do mechanic, SPEC-CHILDHOOD §4). 'interact' objectives advance from a placed prop's
  // onInteract (the consumer's wiring); 'reach' is this auto-advance. Dormant until a quest declares an
  // objective (M2's conversion lands with the childhood build).
  _objectiveReachTick() {
    if (this._dlg || this._inInterior) return;
    const ptx = Math.floor(this.player.x / TILE), pty = Math.floor(this.player.y / TILE);
    for (const id of Object.keys(this.quests.state || {})) {
      if (this.quests.status(id) !== 'active') continue;
      const obj = stepObjective(this.quests.defs[id], this.quests.step[id]);
      if (obj && obj.type === 'reach' && objectiveSatisfied(obj, ptx, pty)) this.quests.advance(id);
    }
  }

  _updateWorldHud() {
    if (!this.hud2 || this._hudHidden) return;
    const max = this.inv.stats().maxHp, hp = Math.max(0, this.inv.hp);
    this._sHpFill.width = 152 * Math.max(0, hp / max); this._sHpFill.fillColor = hp / max > 0.3 ? 0x5fcf6a : 0xcf5f5f;
    this._sHpTxt.setText(`${hp}/${max}`);
    this._sGold.setText(`Gold ${this.inv.gold}`);
    const ph = this.tod.phase();
    this._sTime.setText(`${OverworldScene.TIME_LABEL[ph] || ph} · D${this.tod.dayCount() + 1}`);
    if (ph !== this._timePhaseShown) { this._timePhaseShown = ph; this._drawTimeIcon(ph); }   // redraw the icon only on a phase change
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
    if (this._fullMap.visible) { const b = this._fmBox; this._fmDots.clear().fillStyle(0xffe66d, 1).fillCircle(b.x + (this.player.x - b.wx) * b.scale, b.y + (this.player.y - b.wy) * b.scale, 5).lineStyle(2, 0x4a3a00, 1).strokeCircle(b.x + (this.player.x - b.wx) * b.scale, b.y + (this.player.y - b.wy) * b.scale, 5); }
    this._updateObjective();
    this._objectiveReachTick();   // objective engine: auto-advance on reaching a step's physical objective
  }
  // Draw the time-of-day glyph (a sun for dawn/day/dusk, a crescent moon at night), tinted to the phase.
  // Redrawn only on a phase change (the icon graphic is positioned in the stats panel; shapes are local).
  _drawTimeIcon(ph) {
    const g = this._sTimeIcon; if (!g) return;
    const st = OverworldScene.TIME_STYLE[ph] || OverworldScene.TIME_STYLE.day;
    g.clear();
    g.fillStyle(st.c, 1).fillCircle(0, 0, 5);
    if (st.moon) { g.fillStyle(this._timePanelBg, 1).fillCircle(2.6, -1.4, 5); }   // carve a crescent for night
    else { g.lineStyle(1.5, st.c, 1); for (const [dx, dy] of [[0, -8], [0, 8], [-8, 0], [8, 0]]) g.lineBetween(dx * 0.8, dy * 0.8, dx, dy); }   // sun rays
  }

  // ---- UI CAMERA (HUD on its own zoom-1 camera; world on the 1.25 main camera) ----
  // Phaser cameras render everything NOT in their ignore list. So: the main camera
  // ignores the UI set; the uiCamera ignores every WORLD object. Because the world
  // STREAMS (chunks + region loads + combat VFX create objects continuously), we can't
  // enumerate the world once — _reconcileCameras re-ignores all non-UI children, and is
  // called after every streaming/region/combat creation + once per frame as insurance.
  _setupUICamera() {
    this._uiList = [this.hud2, this.dlgBox, this.playerHpUI, this.banner, this._helpText, this._fullMap].filter(Boolean);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.setScroll(0, 0);
    this.cameras.main.ignore(this._uiList);   // world camera never draws the HUD
    this.scale.on('resize', (sz) => { if (this.uiCamera) this.uiCamera.setSize(sz.width, sz.height); this._layoutHud(); });
  }
  // Re-anchor the screen-space HUD to the live viewport (the help bar to the very bottom) + re-inset the interior
  // camera. Called on resize so nothing drifts mid-screen when the window changes (the help-bar-mid-screen bug).
  _layoutHud() {
    if (this._helpText) this._helpText.setY(this.scale.height - 18);
    if (this._inInterior) this._applyInteriorCamera(true);
  }
  _mainOnly() { const ui = this._uiList || []; return this.children.list.filter((o) => !ui.includes(o)); }
  _reconcileCameras() { if (this.uiCamera) this.uiCamera.ignore(this._mainOnly()); }   // keep streamed world objects off the HUD camera
  // ---- SHARED UI-PANEL LAYOUT (the systemic fix: every panel on the zoom-1 uiCamera, clamped on-screen) --
  // ROOT CAUSE of the off-screen panels: a panel NOT registered here renders on the zoom-1.25 MAIN camera,
  // where a scrollFactor-0 object pivots about the camera centre → pushed off the viewport. Registering it
  // puts it on the screen-space uiCamera; _clampPanel shifts the whole container so its bg+contents stay
  // inside the viewport at ANY window size.
  _registerUIPanel(container, bgX, bgY, bgW, bgH) {
    this._uiList = this._uiList || [];
    if (!this._uiList.includes(container)) this._uiList.push(container);
    this.cameras.main.ignore(container);     // world camera never draws it
    this._reconcileCameras();                // uiCamera (zoom 1, screen space) draws it
    this._clampPanel(container, bgX, bgY, bgW, bgH);
  }
  _unregisterUIPanel(container) { if (this._uiList) this._uiList = this._uiList.filter((o) => o !== container); }
  _clampPanel(container, bgX, bgY, bgW, bgH) {
    const W = this.scale.width, H = this.scale.height, m = 8;
    // 1) SCALE DOWN if the panel is bigger than the viewport (narrow/short windows) so it can fit at all.
    const sc = Math.min(1, (W - 2 * m) / bgW, (H - 2 * m) / bgH);
    container.setScale(sc);
    // 2) CLAMP position so the (scaled) bg stays fully inside the viewport.
    let dx = 0, dy = 0;
    const L = bgX * sc, R = (bgX + bgW) * sc, T = bgY * sc, B = (bgY + bgH) * sc;
    if (R + dx > W - m) dx = (W - m) - R;   // overflow right → shift left
    if (L + dx < m) dx = m - L;             // never past the left edge
    if (B + dy > H - m) dy = (H - m) - B;   // overflow bottom → shift up
    if (T + dy < m) dy = m - T;             // never past the top edge
    container.setPosition(dx, dy);
  }

  _openSettings() {
    if (this._dlg) return;
    this.scene.launch('Options', { caller: 'Overworld', mods: this.mods, im: null });
    this.scene.pause();
  }
}
