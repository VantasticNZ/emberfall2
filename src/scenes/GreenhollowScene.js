// =============================================================================
// GreenhollowScene — the childhood-village slice, now a THIN region on the shared
// RegionScene base. Supplies DATA (world/quests/faces/theme) + the DEV-TEST combat
// arena. Its charger is now an EnemyController encounter (a real LPC monster, same
// as the marsh) — NOT the old bespoke humanoid path. All rendering/dialogue/combat
// is the base's. M1 "A Greenhollow Morning" plays through the shared dialogue.
// =============================================================================

import { RegionScene } from './RegionScene.js';
import { WORLD } from '../data/world.js';
import { GREENHOLLOW_CHILDHOOD, GREENHOLLOW_SIDE } from '../data/quests/index.js';
import { Interaction } from '../systems/Interaction.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { TILE } from '../data/assets.js';

const tileToPx = (t) => t * TILE + TILE / 2;
const FACE = (name, parts, expression = 'neutral') => ({ [name]: { parts, expression } });

const GREEN_THEME = {
  accent: 0xffe9c2,
  hudW: 558, hudH: 84, hudFill: 0x14121c, hudAlpha: 0.84, hudX: 20,
  titleY: 16, titleSize: 20, titleColor: '#ffe9c2',
  helpY: 46, helpSize: 12, muted: '#cfc6e6', questY: 66,
  promptFg: '#1c1422', promptBg: '#ffe9c2',
  dlgFill: 0x14121c, dlgAlpha: 0.95, portraitFill: 0x2a2440,
  nameColor: '#ffe9c2', bodyColor: '#f3ecff', hintColor: '#9b93b0',
  choiceBar: 0xffe9c2, choiceSelFg: '#1c1422',
  hpY: 100,
};

export class GreenhollowScene extends RegionScene {
  constructor() { super('Greenhollow'); }

  regionConfig() {
    return {
      key: 'Greenhollow',
      title: 'EMBERFALL 2 — Greenhollow',
      help: 'WASD move  Shift run  J attack  Space dodge-roll  C block  E talk  Esc settings',
      quests: [...GREENHOLLOW_CHILDHOOD, ...GREENHOLLOW_SIDE],
      faces: {
        ...FACE('Mara', WORLD.maraParts, 'happy'), ...FACE('Bram', WORLD.bramParts),
        ...FACE('Hodge', WORLD.hodgeParts), ...FACE('Tam', WORLD.tamParts, 'happy'),
        ...FACE('Phil McCracken', WORLD.philParts), ...FACE('Fatley', WORLD.fatleyParts),
        ...FACE('Pem', WORLD.pemParts, 'happy'),
      },
      questHud: { show: true, id: 'M1', label: 'A Greenhollow Morning' },
      theme: GREEN_THEME,
      promptYOff: 110,
      devModifiers: false,       // novelty modifiers (big-head etc.) OFF by default — earned/toggled in the options menu (earned-modifiers design)
      world: {
        widthTiles: WORLD.widthTiles, heightTiles: WORLD.heightTiles,
        terrain: WORLD.terrain,                        // real autotile feathered ground (v3)
        ground: { base: 'tile_grass', rects: [] },     // fallback (unused while terrain is set)
        ambient: { birds: true, critters: [] },        // ambient-life hook (birds FX; FLAG: no animal sprites loaded → critters slot inert)
        water: { pond: WORLD.pond },
        decalLayers: [
          { cfg: WORLD.dirt, originY: 0.5, depth: DEPTH.FLOOR + 1 },
          { cfg: WORLD.decals, originY: 1, depth: DEPTH.FLOOR + 2 },
          { cfg: WORLD.ferns, originY: 1, depth: DEPTH.FLOOR + 2 },
        ],
        props: WORLD.props,
        npcs: WORLD.npcs, player: WORLD.player,
      },
      // SAFE VILLAGE (no monsters in settlements — see QUALITY-BIBLE). The childhood
      // act has no combat anyway; combat begins in the wilds (Marsh/Peaks). A dev can
      // press 0 to spawn a test charger for feel-testing — see onCreateExtra.
      combat: { enabled: true, adult: true, spawn: { tx: 26, ty: 25 }, safeZone: true,
        devNote: '[SAFE VILLAGE] press 0 = spawn a dev-test charger (dev only)' },
    };
  }

  onCreateExtra() {
    // DEMO seed: make the hub return-side quests (Fatley's mug etc.) available now
    // so they're playable in the village (they gate behind M7 in the full chain).
    for (const id of ['SG1', 'SG2', 'SG3', 'SG4']) { this.quests.unlocked.add(id); if (this.quests.state[id]) this.quests.state[id] = 'available'; }
    this._buildChests();
    this._buildAmbientLife();
    // dev navigation + debug overlay + wheel zoom
    this.input.keyboard.addKey('M').on('down', () => { if (!this._dlg) this.scene.start('Marsh'); });   // -> Ashen Marsh (W)
    this.input.keyboard.addKey('N').on('down', () => { if (!this._dlg) this.scene.start('Peaks'); });   // -> Sundered Peaks (N road)
    this.input.keyboard.addKey('B').on('down', () => this._toggleDebug());
    // DEV ONLY: spawn a test charger in the south meadow to feel-test combat
    this.input.keyboard.addKey('ZERO').on('down', () => { if (!this._dlg && this.combat.live.length === 0) this.combat.spawn('charger', { tx: 9, ty: 36 }); });
    this.input.on('wheel', (_p, _o, _dx, dy) => this._stepZoom(dy > 0 ? -1 : +1));
    this._buildDebug();
  }

  // A TASTE OF LIFE (hand-placed preview of Pillar 2 — NOT the routines system).
  // Chimney SMOKE drifting from a few homes (an FX, not a fake sprite). FLAG: animal
  // sprites (chicken/dog/cat) are NOT licence-loaded — omitted, wanted for the real
  // NPC-life pass; doing smoke only here per the no-fake rule.
  _buildAmbientLife() {
    const T = 32, chimneys = [[20, 6], [35, 21], [13, 26]];   // ~chimney tops of the chapel / a cottage / the homestead
    for (const [tx, ty] of chimneys) {
      const x = tx * T, y = ty * T;
      this.time.addEvent({ delay: 900, loop: true, callback: () => {
        if (this._dlg) return;
        const puff = this.add.circle(x, y, 5, 0xcacfd2, 0.3).setDepth(90000);
        if (this.uiCamera) this.uiCamera.ignore(puff);   // world FX only — never on the HUD camera
        this.tweens.add({ targets: puff, y: y - 48, x: x + 12, alpha: 0, scale: 2.4, duration: 2700, ease: 'Sine.easeOut', onComplete: () => puff.destroy() });
      } });
    }
  }

  // SECRETS — findable chests reward exploration (a hollow off the wood path, behind
  // the manor, behind the tavern). Open once -> gold + a line.
  _buildChests() {
    this._opened = new Set();
    for (const c of (WORLD.chests || [])) {
      const x = tileToPx(c.tx), y = tileToPx(c.ty);
      const spr = this.add.sprite(x, y, 'prop_chest').setOrigin(0.5, 0.72);
      DepthSort.track(spr, 8);
      Interaction.register({ x, y: y + 6, prompt: 'Open the chest', onInteract: () => {
        if (this._opened.has(c.id)) return this._startGreeting('', ['The chest is empty now — you cleared it earlier.']);
        this._opened.add(c.id); this.inv.addGold(c.gold);
        this._startGreeting('', [`${c.line}  (You now have ${this.inv.gold}g.)`]);
      } });
    }
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
}
